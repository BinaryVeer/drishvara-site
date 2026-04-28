import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import OpenAI from 'openai';
import providerConfig from './providerConfig.js';
import { resolveStageExecutionMode } from './stageExecutionMode.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function normalizeSchema(node) {
  if (!node || typeof node !== 'object') return node;

  const copy = Array.isArray(node) ? [...node] : { ...node };

  if (copy.type === 'object') {
    copy.properties = copy.properties || {};

    for (const key of Object.keys(copy.properties)) {
      copy.properties[key] = normalizeSchema(copy.properties[key]);
    }

    copy.additionalProperties = false;
    copy.required = Object.keys(copy.properties);
  }

  if (copy.type === 'array' && copy.items) {
    copy.items = normalizeSchema(copy.items);
  }

  return copy;
}

function loadStageSchema(stageName) {
  const schemaPath = path.resolve(__dirname, `../agents/${stageName}/schema.json`);
  const raw = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  return normalizeSchema(raw);
}

export async function generateStructuredOutput({
  stageName,
  systemPrompt,
  userPrompt,
  schemaName,
  fallbackData = {}
}) {
  const stageMode = resolveStageExecutionMode(stageName);

  if (!stageMode.useProvider) {
    return {
      meta: {
        provider: providerConfig.provider,
        model: providerConfig.model,
        stageName,
        schemaName,
        stub: true,
        runMode: stageMode.runMode,
        stagePolicy: stageMode.reason
      },
      data: fallbackData,
      raw: {
        systemPromptPreview: String(systemPrompt || '').slice(0, 300),
        userPromptPreview: String(userPrompt || '').slice(0, 300)
      }
    };
  }
  if (!process.env.OPENAI_API_KEY) {
    console.warn(`[${stageName}] fallback: OPENAI_API_KEY missing`);
    return {
      meta: {
        provider: providerConfig.provider,
        model: providerConfig.model,
        stageName,
        schemaName,
        stub: true,
        reason: 'OPENAI_API_KEY missing'
      },
      data: fallbackData
    };
  }

  try {
    const schema = loadStageSchema(stageName);

    const response = await client.responses.create({
      model: providerConfig.model,
      store: false,
      input: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: userPrompt
            }
          ]
        }
      ],
      text: {
        format: {
          type: 'json_schema',
          name: stageName.replace(/-/g, '_'),
          strict: true,
          schema
        }
      }
    });

    const text = response.output_text?.trim();

    if (!text) {
      throw new Error('Empty model output');
    }

    const parsed = JSON.parse(text);

    return {
      meta: {
        provider: providerConfig.provider,
        model: providerConfig.model,
        stageName,
        schemaName,
        stub: false
      },
      data: parsed
    };
  } catch (error) {
    console.warn(`[${stageName}] fallback reason: ${error?.message || String(error)}`);
    return {
      meta: {
        provider: providerConfig.provider,
        model: providerConfig.model,
        stageName,
        schemaName,
        stub: true,
        reason: error?.message || String(error)
      },
      data: fallbackData
    };
  }
}
