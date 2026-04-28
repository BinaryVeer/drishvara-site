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

export const stageName = 'story-drafter';

export async function run(input, context) {
  const prompt = loadPrompt(path.join(__dirname, 'prompt.md'));
  context.logger.log(`${stageName}: prompt loaded (${prompt.length} chars)`);

  assertRequired(input, ['topic', 'audience', 'contentType', 'objective'], stageName);

  const relevantLessons = retrieveRelevantLessons({
    projectRoot: context.projectRoot,
    stageName,
    input
  });

  const contentProfile = context.contentProfile || {
    topic: input.topic,
    contentType: input.contentType,
    audience: input.audience,
    objective: input.objective
  };

  const topicPlaybook = retrieveTopicPlaybook({
    projectRoot: context.projectRoot,
    contentType: contentProfile.contentType,
    audience: contentProfile.audience
  });

  context.logger.log(`${stageName}: retrieved ${relevantLessons.length} relevant lesson(s)`);
  context.logger.log(`${stageName}: topic playbook ${topicPlaybook ? 'found' : 'not found'}`);

  const fallbackData = {
    headline: input.topic,
    angle: `Explain ${input.topic} in a clear, implementation-oriented way for ${input.audience}.`,
    sections: [
      {
        title: 'Why this topic matters',
        bullets: [
          `This topic matters because ${input.objective}.`,
          'The explanation should connect policy intent to operational reality.'
        ]
      },
      {
        title: 'What the system needs to understand',
        bullets: [
          'The explanation should identify the core implementation chain.',
          'The article should show where clarity is lost when roles or flow are unclear.'
        ]
      },
      {
        title: 'How Drishvara should structure the explanation',
        bullets: [
          'The article should move from relevance to process to accountability.',
          'The narrative should support downstream visual planning.'
        ]
      },
      {
        title: 'What the reader should be able to do next',
        bullets: [
          'The final article should leave the reader with a practical implementation takeaway.'
        ]
      }
    ]
  };

  const userPrompt = JSON.stringify(
    {
      topic: input.topic,
      audience: input.audience,
      contentType: input.contentType,
      objective: input.objective,
      tone: input.tone,
      factualAnchors: input.factualAnchors,
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
    schemaName: 'story-drafter/schema.json',
    fallbackData
  });

  let output = providerResult?.data || fallbackData;

  if (isForcedHookEnabled('DRISHVARA_FORCE_STORY_META_OUTLINE') && !input.revisionContext) {
    context.logger.log(`${stageName}: forced test override active (strong meta-outline first pass)`);
    output = {
      ...output,
      angle: 'The article should explain the topic in a structured way.',
      sections: [
        {
          title: 'What the article should cover',
          bullets: [
            'The article should explain why the topic is important.',
            'The article should identify the implementation chain.'
          ]
        },
        {
          title: 'How the narrative should proceed',
          bullets: [
            'The article should move through the issue step by step.',
            'The narrative should remain simple and structured.'
          ]
        },
        {
          title: 'How visuals should help',
          bullets: [
            'Visual storytelling should support understanding.',
            'The draft should help downstream visual planning.'
          ]
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
