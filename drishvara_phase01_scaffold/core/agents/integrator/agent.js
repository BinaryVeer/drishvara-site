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

export const stageName = 'integrator';

export async function run(input, context) {
  const prompt = loadPrompt(path.join(__dirname, 'prompt.md'));
  context.logger.log(`${stageName}: prompt loaded (${prompt.length} chars)`);

  assertRequired(input, ['storyDraft', 'visualPlan'], stageName);

  const { storyDraft, visualPlan } = input;

  const contentProfile = context.contentProfile || {
    topic: storyDraft?.headline || '',
    contentType: 'integrated-draft',
    audience: 'internal-pipeline'
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

  const sectionMarkdown = storyDraft.sections
    .map((section) => {
      const bullets = section.bullets.map((item) => `- ${item}`).join('\n');
      return `## ${section.title}\n${bullets}`;
    })
    .join('\n\n');

  const assetMarkdown = visualPlan.assets
    .map((asset, index) => {
      return `> Visual ${index + 1}: **${asset.type}** (${asset.placement}) — ${asset.purpose}\n> Prompt: ${asset.prompt}`;
    })
    .join('\n\n');

  const fallbackData = {
    headline: storyDraft.headline,
    markdown: `# ${storyDraft.headline}\n\n**Angle:** ${storyDraft.angle}\n\n${sectionMarkdown}\n\n## Visual Support Plan\n${assetMarkdown}`
  };

  const userPrompt = JSON.stringify(
    {
      storyDraft,
      visualPlan,
      revisionContext: input.revisionContext || null,
      contentProfile,
      topicPlaybook,
      relevantLessons
    },
    null,
    2
  );

  const providerResult = await generateStructuredOutput({
    stageName,
    systemPrompt: prompt,
    userPrompt,
    schemaName: 'integrator/schema.json',
    fallbackData
  });

  let output = providerResult?.data || fallbackData;

  if (isForcedHookEnabled('DRISHVARA_FORCE_INTEGRATOR_MISS_VISUAL_PLAN') && !input.revisionContext) {
    context.logger.log(`${stageName}: forced test override active (dropping Visual Support Plan on first pass)`);
    output = {
      ...output,
      markdown: `# ${storyDraft.headline}\n\n**Angle:** ${storyDraft.angle}\n\n${sectionMarkdown}`
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
