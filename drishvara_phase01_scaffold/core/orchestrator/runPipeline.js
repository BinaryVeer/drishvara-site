import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ensureDir, readJson, writeJson, writeText, slugify } from '../shared/fileUtils.js';
import { createLogger } from '../shared/logger.js';
import { DEFAULT_INPUT } from '../shared/constants.js';
import { extractLearningFromRun } from '../learning/extractor/learningExtractor.js';
import { promoteLessons } from '../learning/promoter/lessonPromoter.js';
import { buildRunSummary, writeRunSummary } from './runSummary.js';
import { buildTopicPlaybooks } from '../learning/playbooks/topicPlaybookBuilder.js';
import { buildContentProfile } from '../learning/playbooks/contentProfile.js';
import { decideRevisionAction } from './revisionGovernor.js';
import * as inputNormalizer from '../agents/input-normalizer/agent.js';
import * as storyDrafter from '../agents/story-drafter/agent.js';
import * as visualIntelligence from '../agents/visual-intelligence/agent.js';
import * as integrator from '../agents/integrator/agent.js';
import * as guard from '../agents/guard/agent.js';
import * as publisher from '../agents/publisher/agent.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');

function normalizeRevisionStage(stage) {
  const value = String(stage || '').toLowerCase().trim();

  const aliases = {
    'input-normalizer': 'input-normalizer',
    'input normalizer': 'input-normalizer',
    'story-drafter': 'story-drafter',
    'story drafter': 'story-drafter',
    'story-draft': 'story-drafter',
    'visual-intelligence': 'visual-intelligence',
    'visual intelligence': 'visual-intelligence',
    'integrator': 'integrator',
    'integration': 'integrator',
    'integrate': 'integrator',
    'guard': 'guard',
    'publisher': 'publisher'
  };

  return aliases[value] || stage;
}

export async function runPipeline(options = {}) {
  const inputPath = options.inputPath || path.join(projectRoot, 'core/tests/sample-inputs/sample-topic.json');
  const rawInput = options.useDefaultInput ? DEFAULT_INPUT : readJson(inputPath);
  const maxRevisions = Number(options.maxRevisions || 3);

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const slug = slugify(rawInput.topic);
  const runStamp = now.toISOString().replace(/[:.]/g, '-');
  const outputDir = path.join(projectRoot, 'content/outputs', today, slug, runStamp);
  const logDir = path.join(outputDir);

  ensureDir(outputDir);

  const logger = createLogger(logDir);
  const context = { logger, projectRoot, outputDir, contentProfile: null };

  logger.log(`Pipeline started for topic: ${rawInput.topic}`);
  writeJson(path.join(outputDir, '01_input.json'), rawInput);

  const initialPlaybookSummary = buildTopicPlaybooks({ projectRoot });
  writeJson(path.join(outputDir, '00_initial_playbook_summary.json'), initialPlaybookSummary);

  let normalizedBrief = await inputNormalizer.run(rawInput, context);
  context.contentProfile = buildContentProfile(normalizedBrief);
  writeJson(path.join(outputDir, '02_normalized_brief.json'), normalizedBrief);

  let storyDraft = null;
  let visualPlan = null;
  let integratedDraft = null;
  let guardReport = null;
  let publishBundle = null;

  let revisionCount = 0;
  let revisionHistory = [];
  let revisionContext = null;

  async function rebuildFromStage(stage) {
    stage = normalizeRevisionStage(stage);

    if (stage === 'input-normalizer') {
      normalizedBrief = await inputNormalizer.run(
        { ...rawInput, revisionContext },
        context
      );
      context.contentProfile = buildContentProfile(normalizedBrief);
      writeJson(path.join(outputDir, '02_normalized_brief.json'), normalizedBrief);
      stage = 'story-drafter';
    }

    if (stage === 'story-drafter') {
      storyDraft = await storyDrafter.run(
        { ...normalizedBrief, revisionContext },
        context
      );
      writeJson(path.join(outputDir, '03_story_draft.json'), storyDraft);

      visualPlan = await visualIntelligence.run(
        { ...storyDraft, revisionContext },
        context
      );
      writeJson(path.join(outputDir, '04_visual_plan.json'), visualPlan);

      integratedDraft = await integrator.run(
        { storyDraft, visualPlan, revisionContext },
        context
      );
      writeJson(path.join(outputDir, '05_integrated_draft.json'), integratedDraft);
      return;
    }

    if (stage === 'visual-intelligence') {
      visualPlan = await visualIntelligence.run(
        { ...storyDraft, revisionContext },
        context
      );
      writeJson(path.join(outputDir, '04_visual_plan.json'), visualPlan);

      integratedDraft = await integrator.run(
        { storyDraft, visualPlan, revisionContext },
        context
      );
      writeJson(path.join(outputDir, '05_integrated_draft.json'), integratedDraft);
      return;
    }

    if (stage === 'integrator') {
      integratedDraft = await integrator.run(
        { storyDraft, visualPlan, revisionContext },
        context
      );
      writeJson(path.join(outputDir, '05_integrated_draft.json'), integratedDraft);
      return;
    }

    throw new Error(`Unsupported revision stage: ${stage}`);
  }

  await rebuildFromStage('story-drafter');

  while (true) {
    guardReport = await guard.run(integratedDraft, context);
    writeJson(
      path.join(outputDir, `06_guard_report_iter_${revisionCount}.json`),
      guardReport
    );

    const decision = decideRevisionAction({
      guardReport,
      revisionCount,
      maxRevisions
    });

    if (decision.action === 'publish') {
      publishBundle = await publisher.run({ integratedDraft, guardReport }, context);
      writeJson(path.join(outputDir, '07_publish_bundle.json'), publishBundle);
      writeText(path.join(outputDir, '08_final_output.md'), publishBundle.markdown);
      writeText(path.join(outputDir, '09_final_output.html'), publishBundle.html);

      if (revisionHistory.length) {
        writeJson(path.join(outputDir, '07_revision_history.json'), revisionHistory);
      }

      const learningSnapshot = extractLearningFromRun({
        projectRoot,
        outputDir,
        rawInput,
        normalizedBrief,
        storyDraft,
        visualPlan,
        integratedDraft,
        guardReport,
        revisionHistory,
        finalStatus: 'pass'
      });

      writeRunSummary(outputDir, buildRunSummary({
        topic: rawInput?.topic || '',
        outputDir,
        finalStatus: 'pass',
        revisionCount: Array.isArray(revisionHistory) ? revisionHistory.length : 0,
        guardStatus: guardReport?.status || null,
        returnToStage: guardReport?.returnToStage || null
      }));

      const promotionSummary = promoteLessons({ projectRoot });
      const playbookSummary = buildTopicPlaybooks({ projectRoot });
      writeJson(path.join(outputDir, '11_promotion_summary.json'), promotionSummary);
      writeJson(path.join(outputDir, '12_playbook_summary.json'), playbookSummary);

      const logPath = logger.flush();

      return {
        outputDir,
        logPath,
        status: 'pass',
        revisionCount,
        revisionHistory,
        publishBundle,
        learningSnapshot,
        promotionSummary
      };
    }

    if (decision.action === 'reject' || decision.action === 'drop') {
      const revisionPacket = {
        status: decision.action === 'drop' ? 'dropped_after_max_revisions' : guardReport.status,
        severity: guardReport.severity,
        returnToStage: guardReport.returnToStage,
        issues: guardReport.issues,
        correctivePrompt: guardReport.correctivePrompt,
        revisionActions: guardReport.revisionActions,
        revisionCount,
        stopReason: decision.reason
      };

      logger.log(
        decision.action === 'drop'
          ? `Pipeline dropped after max revisions (${maxRevisions}).`
          : `Pipeline rejected by guard.`
      );

      writeJson(path.join(outputDir, '07_revision_packet.json'), revisionPacket);
      if (revisionHistory.length) {
        writeJson(path.join(outputDir, '07_revision_history.json'), revisionHistory);
      }

      const learningSnapshot = extractLearningFromRun({
        projectRoot,
        outputDir,
        rawInput,
        normalizedBrief,
        storyDraft,
        visualPlan,
        integratedDraft,
        guardReport,
        revisionPacket,
        revisionHistory,
        finalStatus: decision.action === 'drop' ? 'dropped_after_max_revisions' : 'reject'
      });

      writeRunSummary(outputDir, buildRunSummary({
        topic: rawInput?.topic || '',
        outputDir,
        finalStatus: decision.action === 'drop' ? 'dropped_after_max_revisions' : 'reject',
        revisionCount: Array.isArray(revisionHistory) ? revisionHistory.length : 0,
        guardStatus: guardReport?.status || revisionPacket?.status || null,
        returnToStage: guardReport?.returnToStage || revisionPacket?.returnToStage || null
      }));

      const promotionSummary = promoteLessons({ projectRoot });
      const playbookSummary = buildTopicPlaybooks({ projectRoot });
      writeJson(path.join(outputDir, '11_promotion_summary.json'), promotionSummary);
      writeJson(path.join(outputDir, '12_playbook_summary.json'), playbookSummary);

      const logPath = logger.flush();

      return {
        outputDir,
        logPath,
        status: revisionPacket.status,
        revisionCount,
        revisionHistory,
        guardReport,
        revisionPacket,
        learningSnapshot,
        promotionSummary
      };
    }

    revisionCount += 1;
    revisionContext = {
      revisionNumber: revisionCount,
      maxRevisions,
      issues: guardReport.issues,
      correctivePrompt: guardReport.correctivePrompt,
      revisionActions: guardReport.revisionActions,
      returnToStage: guardReport.returnToStage
    };

    revisionHistory.push(revisionContext);
    const normalizedReturnStage = normalizeRevisionStage(guardReport.returnToStage);

    logger.log(
      `Revision ${revisionCount}/${maxRevisions}: rerouting to ${guardReport.returnToStage} (normalized: ${normalizedReturnStage})`
    );

    await rebuildFromStage(normalizedReturnStage);
  }
}
