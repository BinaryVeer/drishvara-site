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

console.log("Drishvara Panchang engine preflight");
console.log("");

const schemaPath = "data/knowledge/sanatan/panchang-engine-schema.json";
const methodsPath = "data/knowledge/sanatan/panchang-methods.json";
const enginePath = "scripts/panchang-engine.js";
const outputFolder = "generated/sanatan/panchang";

check(fs.existsSync(path.join(root, schemaPath)), "Panchang engine schema exists", failures);
check(fs.existsSync(path.join(root, methodsPath)), "Panchang methods registry exists", failures);
check(fs.existsSync(path.join(root, enginePath)), "Panchang engine script exists", failures);
check(fs.existsSync(path.join(root, outputFolder)), "Generated Panchang output folder exists", failures);

const schema = readJson(schemaPath);
const methods = readJson(methodsPath);

check(schema.public_output_enabled === false, "Panchang engine public output is disabled", failures);
check(schema.restricted_until_method_review?.includes("tithi"), "Tithi is restricted until method review", failures);
check(schema.restricted_until_method_review?.includes("nakshatra"), "Nakshatra is restricted until method review", failures);
check(schema.guardrails?.some((item) => item.includes("placeholder logic")), "Schema blocks placeholder Panchang fields", failures);

check(methods.public_output_enabled === false, "Panchang methods public output remains disabled", failures);
check(Array.isArray(methods.calculation_fields), "Panchang methods define calculation fields", failures);

const run = spawnSync("node", [
  "scripts/panchang-engine.js",
  "--date=2026-05-10",
  "--place=Itanagar",
  "--lat=27.0844",
  "--lon=93.6053",
  "--timezone=Asia/Kolkata"
], {
  cwd: root,
  encoding: "utf8"
});

check(run.status === 0, "Panchang engine sample run succeeds", failures);

let sample = null;
try {
  sample = JSON.parse(run.stdout);
} catch {
  failures.push("Panchang engine sample output is valid JSON");
  console.log("❌ Panchang engine sample output is valid JSON");
}

if (sample) {
  check(sample.public_output_enabled === false, "Sample output is not public-enabled", failures);
  check(sample.calculation_status === "scaffold_only", "Sample output is scaffold-only", failures);
  check(sample.review_status === "under_review", "Sample output is under review", failures);
  check(sample.safe_calendar_fields?.vara?.value_en === "Sunday", "Sample output calculates safe vara weekday", failures);
  check(sample.panchang_fields?.tithi === null, "Sample does not guess tithi", failures);
  check(sample.panchang_fields?.nakshatra === null, "Sample does not guess nakshatra", failures);
  check(sample.method?.approved_for_public_use === false, "Sample method is not approved for public use", failures);
}

console.log("");
console.log("Panchang scaffold summary:");
console.log("- Public output: disabled");
console.log("- Safe field currently available: civil-calendar vara only");
console.log("- Full Panchang fields: blocked until reviewed method implementation");

if (failures.length) {
  console.log("");
  console.log("Panchang preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Panchang engine preflight passed.");
