import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
}

function check(condition, label, failures) {
  if (condition) {
    console.log(`✅ ${label}`);
  } else {
    console.log(`❌ ${label}`);
    failures.push(label);
  }
}

const failures = [];

console.log("Drishvara daily context preflight");
console.log("");

check(fs.existsSync(path.join(root, "scripts/build-daily-context.js")), "Daily context builder exists", failures);

const run = spawnSync("node", ["scripts/build-daily-context.js", "--date=2026-05-10"], {
  cwd: root,
  encoding: "utf8"
});

check(run.status === 0, "Daily context builder sample run succeeds", failures);
check(fs.existsSync(path.join(root, "data/daily-context.json")), "data/daily-context.json exists", failures);
check(fs.existsSync(path.join(root, "generated/daily-context/2026-05-10-daily-context.json")), "generated daily context exists", failures);

const context = readJson("data/daily-context.json");

check(context.public_output_enabled === true, "Daily context is public-safe", failures);
check(Boolean(context.word_of_the_day?.english), "Word of the Day has English word", failures);
check(Boolean(context.word_of_the_day?.hindi), "Word of the Day has Hindi word", failures);
check(Boolean(context.word_of_the_day?.sanskrit), "Word of the Day has Sanskrit field", failures);
check(Array.isArray(context.first_light?.signals), "First Light has signal array", failures);
check(context.vedic_guidance_status?.enabled === false, "Vedic guidance remains disabled", failures);
check(context.panchang_status?.enabled === false, "Panchang display remains disabled", failures);

console.log("");
console.log("Daily context summary:");
console.log(`- Word: ${context.word_of_the_day.english} / ${context.word_of_the_day.hindi}`);
console.log(`- First Light signals: ${context.first_light.signals.length}`);
console.log("- Vedic/Panchang premium output: disabled");

if (failures.length) {
  console.log("");
  console.log("Daily context preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Daily context preflight passed.");
