import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPrompt } from '../../shared/promptLoader.js';
import { assertRequired } from '../../shared/validators.js';
import { loadSchema, validateAgainstSchema } from '../../shared/validateStage.js';
import { generateStructuredOutput } from '../../providers/llmClient.js';
import { retrieveRelevantLessons } from '../../learning/retrieval/lessonRetriever.js';
import { retrieveTopicPlaybook } from '../../learning/playbooks/topicPlaybookRetriever.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const stageName = 'publisher';

function markdownToHtml(markdown) {
  return markdown
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^\*\*(.*)\*\*$/gm, '<p><strong>$1</strong></p>')
    .replace(/^> (.*)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^- (.*)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\n\n/g, '\n');
}

export async function run(input, context) {
  const prompt = loadPrompt(path.join(__dirname, 'prompt.md'));
  context.logger.log(`${stageName}: prompt loaded (${prompt.length} chars)`);

  assertRequired(input, ['integratedDraft', 'guardReport'], stageName);

  const contentProfile = context.contentProfile || {
    topic: input.integratedDraft?.headline || '',
    contentType: 'publish-bundle',
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

  const title = input.integratedDraft.headline;
  const fallbackMarkdown = `${input.integratedDraft.markdown}

## Guard Review
- Status: ${input.guardReport.status}
- Severity: ${input.guardReport.severity}
- Return To Stage: ${input.guardReport.returnToStage}
- Issues: ${input.guardReport.issues.join('; ')}
- Corrective Prompt: ${input.guardReport.correctivePrompt}`;

  const fallbackData = {
    title,
    markdown: fallbackMarkdown,
    html: `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
</head>
<body>
${markdownToHtml(fallbackMarkdown)}
</body>
</html>`,
    metadata: {
      publishedAt: new Date().toISOString(),
      status: input.guardReport.status
    }
  };

  const userPrompt = JSON.stringify(
    {
      integratedDraft: input.integratedDraft,
      guardReport: input.guardReport,
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
    schemaName: 'publisher/schema.json',
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
