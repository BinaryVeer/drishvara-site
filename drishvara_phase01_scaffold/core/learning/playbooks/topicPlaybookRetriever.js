import fs from 'node:fs';
import path from 'node:path';

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function normalize(value) {
  return String(value || '').toLowerCase().trim();
}

export function retrieveTopicPlaybook({ projectRoot, contentType, audience }) {
  const filePath = path.join(
    projectRoot,
    'core',
    'learning',
    'playbooks',
    'topic-playbooks.json'
  );

  const data = readJson(filePath);
  if (!data?.items?.length) return null;

  const ct = normalize(contentType);
  const aud = normalize(audience);

  return (
    data.items.find(item =>
      normalize(item.contentType) === ct &&
      normalize(item.audience) === aud
    ) || null
  );
}
