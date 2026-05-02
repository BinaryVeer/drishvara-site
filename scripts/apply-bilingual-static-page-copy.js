import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data/i18n/static-page-copy-h06.json");
const runtimePath = path.join(root, "assets/js/drishvara-language-runtime.js");

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
let runtime = fs.readFileSync(runtimePath, "utf8");

const start = "  const dictionary = {\n";
const end = "\n  };\n\n  const reverseDictionary = {};";

if (!runtime.includes(start) || !runtime.includes(end)) {
  console.error("Could not find unified runtime dictionary block.");
  process.exit(1);
}

const [before, rest] = runtime.split(start);
const [dictionaryBodyOriginal, after] = rest.split(end);

let dictionaryBody = dictionaryBodyOriginal;
let added = 0;
let updated = 0;

const items = Object.values(registry.pages || {}).flatMap((page) => page.items || []);

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

for (const item of items) {
  if (!item.en || !item.hi) continue;

  const en = JSON.stringify(item.en);
  const hi = JSON.stringify(item.hi);
  const nextLine = `    ${en}: ${hi},`;

  const pattern = new RegExp(`^\\s*${escapeRegExp(en)}\\s*:\\s*.*?,\\s*$`, "m");

  if (pattern.test(dictionaryBody)) {
    const previous = dictionaryBody.match(pattern)?.[0] || "";
    if (previous.trim() !== nextLine.trim()) {
      dictionaryBody = dictionaryBody.replace(pattern, nextLine);
      updated += 1;
    }
  } else {
    dictionaryBody = dictionaryBody.replace(/\s*$/, `\n${nextLine}\n`);
    added += 1;
  }
}

runtime = before + start + dictionaryBody + end + after;
fs.writeFileSync(runtimePath, runtime, "utf8");

console.log(`H07 bilingual static copy applied. Dictionary entries added: ${added}; updated: ${updated}`);
