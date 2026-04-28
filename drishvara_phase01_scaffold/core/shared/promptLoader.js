import fs from 'node:fs';

export function loadPrompt(promptPath) {
  return fs.readFileSync(promptPath, 'utf-8');
}
