import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPrompt } from '../../shared/promptLoader.js';
import { assertRequired } from '../../shared/validators.js';
import { loadSchema, validateAgainstSchema } from '../../shared/validateStage.js';
import { generateStructuredOutput } from '../../providers/llmClient.js';
import { retrieveRelevantLessons } from '../../learning/retrieval/lessonRetriever.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const stageName = 'input-normalizer';

export async function run(input, context) {
  const prompt = loadPrompt(path.join(__dirname, 'prompt.md'));
  context.logger.log(`${stageName}: prompt loaded (${prompt.length} chars)`);

  assertRequired(input, ['topic', 'audience', 'contentType', 'objective'], stageName);

  const relevantLessons = retrieveRelevantLessons({
    projectRoot: context.projectRoot,
    stageName,
    input
  });

  context.logger.log(`${stageName}: retrieved ${relevantLessons.length} relevant lesson(s)`);

  const fallbackData = {
    topic: input.topic,
    audience: input.audience,
    contentType: input.contentType,
    objective: input.objective,
    tone: input.tone || 'clear and strategic',
    factualAnchors: Array.isArray(input.facts) ? input.facts : []
  };

  const userPrompt = JSON.stringify(
    {
      topic: input.topic,
      audience: input.audience,
      contentType: input.contentType,
      objective: input.objective,
      tone: input.tone,
      facts: input.facts,
      revisionContext: input.revisionContext || null,
      relevantLessons
    },
    null,
    2
  );

  const providerResult = await generateStructuredOutput({
    stageName,
    systemPrompt: prompt,
    userPrompt,
    schemaName: 'input-normalizer/schema.json',
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
