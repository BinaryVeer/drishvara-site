import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPrompt } from '../../shared/promptLoader.js';
import { assertRequired } from '../../shared/validators.js';
import { loadSchema, validateAgainstSchema } from '../../shared/validateStage.js';
import { generateStructuredOutput } from '../../providers/llmClient.js';
import { retrieveRelevantLessons } from '../../learning/retrieval/lessonRetriever.js';
import { retrieveTopicPlaybook } from '../../learning/playbooks/topicPlaybookRetriever.js';
import { isForcedHookEnabled } from '../../providers/debugControls.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const stageName = 'visual-intelligence';

export async function run(input, context) {
  const prompt = loadPrompt(path.join(__dirname, 'prompt.md'));
  context.logger.log(`${stageName}: prompt loaded (${prompt.length} chars)`);

  assertRequired(input, ['headline', 'angle', 'sections'], stageName);

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

  const fallbackData = {
    assets: [
      {
        type: 'flow-diagram',
        placement: 'after-introduction',
        purpose: 'Show the core implementation flow clearly.',
        prompt: `Create a clean flow diagram for: ${input.headline}`
      },
      {
        type: 'accountability-map',
        placement: 'before-conclusion',
        purpose: 'Show roles, responsibilities, and escalation points.',
        prompt: `Create an accountability map for: ${input.headline}`
      }
    ]
  };

  const userPrompt = JSON.stringify(
    {
      storyDraft: input,
      revisionContext: input.revisionContext || null,
      relevantLessons,
      contentProfile,
      topicPlaybook
    },
    null,
    2
  );

  const providerResult = await generateStructuredOutput({
    stageName,
    systemPrompt: prompt,
    userPrompt,
    schemaName: 'visual-intelligence/schema.json',
    fallbackData
  });

  let output = providerResult?.data || fallbackData;

  if (isForcedHookEnabled('DRISHVARA_FORCE_VISUAL_WEAK_PLAN') && !input.revisionContext) {
    context.logger.log(`${stageName}: forced test override active (weak visual plan first pass)`);
    output = {
      assets: [
        {
          type: 'generic-visual',
          placement: 'somewhere in the article',
          purpose: 'Support understanding.',
          prompt: 'Create a helpful visual.'
        }
      ]
    };
  }

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
