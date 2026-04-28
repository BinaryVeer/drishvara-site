import fs from 'node:fs';
import path from 'node:path';
import { classifyCorrectivePattern, normalizePatternStage } from '../patterns/correctivePatternCatalog.js';

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function appendJsonl(filePath, record) {
  fs.appendFileSync(filePath, JSON.stringify(record) + '\n', 'utf8');
}

function uniqueStrings(values = []) {
  return [...new Set((values || []).filter(Boolean).map(String))];
}

function inferProfileKey(rawInput = {}) {
  return [
    `contentType:${String(rawInput.contentType || '').toLowerCase()}`,
    `audience:${String(rawInput.audience || '').toLowerCase()}`
  ].join('||');
}

function inferTopicTags(rawInput = {}) {
  const tags = [];
  if (rawInput.topic) tags.push('topic:' + rawInput.topic.toLowerCase());
  if (rawInput.contentType) tags.push('contentType:' + rawInput.contentType.toLowerCase());
  if (rawInput.audience) tags.push('audience:' + rawInput.audience.toLowerCase());
  tags.push('profile:' + inferProfileKey(rawInput));
  return uniqueStrings(tags);
}

function normalizeStage(stage = 'unknown') {
  return normalizePatternStage(stage);
}

function inferStageFromIssue(issue = '', fallbackStage = 'unknown') {
  const text = String(issue).toLowerCase();

  if (text.includes('visual support')) return 'integrator';
  if (text.includes('introduction section')) return 'story-drafter';
  if (text.includes('narrative')) return 'story-drafter';
  if (text.includes('visual')) return 'visual-intelligence';

  return normalizeStage(fallbackStage);
}

function inferStageFromAction(action = '', fallbackStage = 'unknown') {
  const text = String(action).toLowerCase();

  if (text.includes('integrator') || text.includes('integration')) return 'integrator';
  if (text.includes('story structure')) return 'story-drafter';
  if (text.includes('visual')) return 'visual-intelligence';

  return normalizeStage(fallbackStage);
}

function dedupeLessons(lessons = []) {
  const seen = new Set();
  const out = [];

  for (const lesson of lessons) {
    const key = [
      lesson.lessonType || '',
      normalizeStage(lesson.stage || ''),
      lesson.patternCode || '',
      lesson.pattern || '',
      lesson.recommendedAction || '',
      lesson.profileKey || '',
      lesson.sourceStatus || ''
    ].join('||');

    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      ...lesson,
      stage: normalizeStage(lesson.stage)
    });
  }

  return out;
}

function enrichLesson(lesson = {}) {
  const normalizedStage = normalizeStage(lesson.stage || 'unknown');
  const classification = classifyCorrectivePattern({
    lessonType: lesson.lessonType,
    stage: normalizedStage,
    text: lesson.pattern
  });

  return {
    ...lesson,
    stage: normalizedStage,
    patternCode: classification.patternCode,
    patternLabel: classification.patternLabel
  };
}

function summarizeRevisionHistory(revisionHistory = [], profileKey, sourceStatus, tags) {
  const lessons = [];
  const byStage = new Map();

  for (const revision of revisionHistory || []) {
    const stage = normalizeStage(revision.returnToStage || 'unknown');

    if (!byStage.has(stage)) {
      byStage.set(stage, {
        issues: new Set(),
        actions: new Set(),
        correctivePrompt: revision.correctivePrompt || ''
      });
    }

    const bucket = byStage.get(stage);

    for (const issue of revision.issues || []) {
      bucket.issues.add(String(issue));
    }

    for (const action of revision.revisionActions || []) {
      bucket.actions.add(String(action));
    }

    if (!bucket.correctivePrompt && revision.correctivePrompt) {
      bucket.correctivePrompt = revision.correctivePrompt;
    }
  }

  for (const [stage, bucket] of byStage.entries()) {
    const issueSummary = [...bucket.issues].slice(0, 3).join(' | ');
    const actionSummary = [...bucket.actions].slice(0, 3).join(' | ');

    if (issueSummary) {
      lessons.push({
        lessonType: 'failure_pattern',
        stage,
        status: 'candidate',
        sourceStatus,
        profileKey,
        pattern: `Revision-triggering issues for ${stage}: ${issueSummary}`,
        recommendedAction: bucket.correctivePrompt || 'Review and revise the responsible stage.',
        tags
      });
    }

    if (actionSummary) {
      lessons.push({
        lessonType: 'fix_pattern',
        stage,
        status: 'candidate',
        sourceStatus,
        profileKey,
        pattern: `Successful corrective actions for ${stage}: ${actionSummary}`,
        recommendedAction: bucket.correctivePrompt || actionSummary,
        tags
      });
    }
  }

  return lessons;
}

function buildCandidateLessons({ rawInput, finalStatus, guardReport, revisionPacket, revisionHistory = [] }) {
  const lessons = [];
  const baseTags = inferTopicTags(rawInput);
  const effectiveGuard = guardReport || revisionPacket || null;
  const defaultStage = normalizeStage(effectiveGuard?.returnToStage || 'unknown');
  const profileKey = inferProfileKey(rawInput);

  if (finalStatus === 'pass') {
    lessons.push({
      lessonType: 'success_pattern',
      stage: 'pipeline',
      status: 'candidate',
      sourceStatus: finalStatus,
      profileKey,
      pattern: 'This topic flow completed successfully through publish.',
      recommendedAction: 'Reuse this pipeline path and compare future successful runs for stable patterns.',
      tags: baseTags
    });
  }

  if (effectiveGuard?.issues?.length) {
    for (const issue of effectiveGuard.issues) {
      lessons.push({
        lessonType: 'failure_pattern',
        stage: inferStageFromIssue(issue, defaultStage),
        status: 'candidate',
        sourceStatus: finalStatus,
        profileKey,
        pattern: issue,
        recommendedAction: effectiveGuard.correctivePrompt || 'Review the responsible stage and revise the output.',
        tags: baseTags
      });
    }
  }

  if (effectiveGuard?.revisionActions?.length) {
    for (const action of effectiveGuard.revisionActions) {
      lessons.push({
        lessonType: 'fix_pattern',
        stage: inferStageFromAction(action, defaultStage),
        status: 'candidate',
        sourceStatus: finalStatus,
        profileKey,
        pattern: action,
        recommendedAction: effectiveGuard.correctivePrompt || action,
        tags: baseTags
      });
    }
  }

  lessons.push(
    ...summarizeRevisionHistory(revisionHistory, profileKey, finalStatus, baseTags)
  );

  return dedupeLessons(lessons.map(enrichLesson));
}

export function extractLearningFromRun({
  projectRoot,
  outputDir,
  rawInput,
  normalizedBrief,
  storyDraft,
  visualPlan,
  integratedDraft,
  guardReport = null,
  revisionPacket = null,
  revisionHistory = [],
  finalStatus = 'unknown'
}) {
  const learningRoot = path.join(projectRoot, 'core', 'learning');
  const runLedgerDir = path.join(learningRoot, 'run-ledger');
  const lessonsDir = path.join(learningRoot, 'lessons');

  ensureDir(runLedgerDir);
  ensureDir(lessonsDir);

  const runStamp = path.basename(outputDir);
  const topicSlug = path.basename(path.dirname(outputDir));
  const runId = `${topicSlug}__${runStamp}`;
  const timestamp = new Date().toISOString();
  const profileKey = inferProfileKey(rawInput);

  const summary = {
    runId,
    timestamp,
    finalStatus,
    topic: rawInput?.topic || '',
    audience: rawInput?.audience || '',
    contentType: rawInput?.contentType || '',
    objective: rawInput?.objective || '',
    profileKey,
    guardStatus: guardReport?.status || revisionPacket?.status || null,
    returnToStage: normalizeStage(guardReport?.returnToStage || revisionPacket?.returnToStage || null),
    issueCount: (guardReport?.issues || revisionPacket?.issues || []).length,
    revisionCount: Array.isArray(revisionHistory) ? revisionHistory.length : 0,
    tags: inferTopicTags(rawInput)
  };

  const candidateLessons = buildCandidateLessons({
    rawInput,
    finalStatus,
    guardReport,
    revisionPacket,
    revisionHistory
  });

  appendJsonl(path.join(runLedgerDir, 'runs.jsonl'), summary);

  for (const lesson of candidateLessons) {
    appendJsonl(
      path.join(lessonsDir, 'candidate-lessons.jsonl'),
      {
        ...lesson,
        runId,
        timestamp
      }
    );
  }

  const learningSnapshot = {
    summary,
    candidateLessons,
    artifactsPresent: {
      rawInput: Boolean(rawInput),
      normalizedBrief: Boolean(normalizedBrief),
      storyDraft: Boolean(storyDraft),
      visualPlan: Boolean(visualPlan),
      integratedDraft: Boolean(integratedDraft),
      guardReport: Boolean(guardReport),
      revisionPacket: Boolean(revisionPacket),
      revisionHistory: Boolean(revisionHistory?.length)
    }
  };

  fs.writeFileSync(
    path.join(outputDir, '10_learning_snapshot.json'),
    JSON.stringify(learningSnapshot, null, 2),
    'utf8'
  );

  return learningSnapshot;
}
