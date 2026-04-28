import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPrompt } from '../../shared/promptLoader.js';
import { assertRequired } from '../../shared/validators.js';
import { loadSchema, validateAgainstSchema } from '../../shared/validateStage.js';
import { generateStructuredOutput } from '../../providers/llmClient.js';
import { retrieveRelevantLessons } from '../../learning/retrieval/lessonRetriever.js';
import { retrieveTopicPlaybook } from '../../learning/playbooks/topicPlaybookRetriever.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const stageName = 'guard';

function isCheapMode() {
  return String(process.env.DRISHVARA_RUN_MODE || '').toLowerCase() === 'cheap';
}

function containsMetaOutlineLanguage(markdown = '') {
  const text = String(markdown || '').toLowerCase();
  return [
    'the article should',
    'the narrative should',
    'visual storytelling should',
    'the draft should',
    'what the article should cover',
    'how the narrative should proceed',
    'how visuals should help'
  ].some(fragment => text.includes(fragment));
}

function weakVisualExecution(markdown = '') {
  const text = String(markdown || '').toLowerCase();
  return (
    text.includes('generic-visual') ||
    text.includes('somewhere in the article') ||
    text.includes('support understanding.') ||
    text.includes('create a helpful visual.')
  );
}

export async function run(input, context) {
  const prompt = loadPrompt(path.join(__dirname, 'prompt.md'));
  context.logger.log(`${stageName}: prompt loaded (${prompt.length} chars)`);

  assertRequired(input, ['headline', 'markdown'], stageName);

  const contentProfile = context.contentProfile || {
    topic: input.headline,
    contentType: 'article',
    audience: 'government and implementation stakeholders'
  };

  const relevantLessons = retrieveRelevantLessons({
    projectRoot: context.projectRoot,
    stageName,
    input: contentProfile
  });

  const topicPlaybook = retrieveTopicPlaybook({
    projectRoot: context.projectRoot,
    contentType: contentProfile.contentType,
    audience: contentProfile.audience
  });

  context.logger.log(`${stageName}: retrieved ${relevantLessons.length} relevant lesson(s)`);
  context.logger.log(`${stageName}: topic playbook ${topicPlaybook ? 'found' : 'not found'}`);

  const issues = [];
  const revisionActions = [];
  let status = 'pass';
  let severity = 'none';
  let returnToStage = 'publisher';
  let correctivePrompt = 'No correction required. Proceed to publishing.';

  const markdown = String(input.markdown || '');

  if (isCheapMode()) {
    const cheapModeOutput = {
      status: 'pass',
      severity: 'none',
      returnToStage: 'publisher',
      issues: ['Cheap mode dry run; provider disabled for cost-safe orchestration test.'],
      correctivePrompt: 'No correction required in cheap mode.',
      revisionActions: ['Proceed to publishing.']
    };

    const schema = loadSchema(path.join(__dirname, 'schema.json'));
    const validation = validateAgainstSchema(cheapModeOutput, schema, stageName);

    if (!validation.ok) {
      throw new Error(validation.errors.join('; '));
    }

    context.logger.log(`${stageName}: cheap mode synthetic pass applied`);
    context.logger.log(`${stageName}: schema validation passed`);

    return cheapModeOutput;
  }

  if (!markdown.includes('## Visual Support Plan')) {
    issues.push('Visual support section missing.');
    revisionActions.push('Ensure integrator includes visual support plan.');
    status = 'revise';
    severity = 'major';
    returnToStage = 'integrator';
    correctivePrompt = 'Rebuild the integrated draft so that it includes a clearly labeled "Visual Support Plan" section and preserves the visual assets in the final assembled markdown.';
  }

  const missingWhyThisMatters = !markdown.includes('## Why this topic matters');
  const missingPracticalTakeaway =
    !markdown.toLowerCase().includes('practical implementation takeaway') &&
    !markdown.toLowerCase().includes('what the reader should be able to do next');

  if (missingWhyThisMatters || missingPracticalTakeaway || containsMetaOutlineLanguage(markdown)) {
    issues.push('Narrative framing is too weak or still meta-outline in origin.');
    revisionActions.push('Restore direct audience-facing framing, including relevance and practical takeaway sections.');
    status = 'revise';
    severity = 'major';
    returnToStage = 'story-drafter';
    correctivePrompt = 'Rewrite the story draft so that it begins with a clear audience-facing relevance frame, avoids all meta-outline phrasing such as "the article should" or "the narrative should", and restores a direct practical takeaway for the reader.';
  }

  if (weakVisualExecution(markdown)) {
    issues.push('Visual plan is too generic and not operationalized for downstream execution.');
    revisionActions.push('Replace generic visual placeholders with clearly labeled execution-ready figure blocks.');
    status = 'revise';
    severity = 'major';
    returnToStage = 'visual-intelligence';
    correctivePrompt = 'Rewrite the visual plan so that it contains at least two clearly labeled, execution-ready visual elements with specific placement, purpose, and content description. Avoid generic placeholders such as "helpful visual" or "somewhere in the article."';
  }

  const userPrompt = JSON.stringify(
    {
      headline: input.headline,
      markdown: input.markdown,
      revisionContext: input.revisionContext || null,
      relevantLessons,
      contentProfile,
      topicPlaybook
    },
    null,
    2
  );

  const fallbackData = {
    status,
    severity,
    returnToStage,
    issues: issues.length ? issues : ['Integrated draft passed review.'],
    correctivePrompt,
    revisionActions: revisionActions.length ? revisionActions : ['Proceed to publishing.']
  };

  const providerResult = await generateStructuredOutput({
    stageName,
    systemPrompt: prompt,
    userPrompt,
    schemaName: 'guard/schema.json',
    fallbackData
  });

  const output = providerResult?.data || fallbackData;

  const schema = loadSchema(path.join(__dirname, 'schema.json'));
  const validation = validateAgainstSchema(output, schema, stageName);

  if (!validation.ok) {
    throw new Error(validation.errors.join('; '));
  }

  if (providerResult?.meta?.stub) {
    context.logger.log(`${stageName}: provider stub used, fallback data returned`);
  } else {
    context.logger.log(`${stageName}: provider output accepted`);
  }

  context.logger.log(`${stageName}: schema validation passed`);

  return output;
}
