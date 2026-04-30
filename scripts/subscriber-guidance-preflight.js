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

console.log("Drishvara subscriber daily guidance preflight");
console.log("");

const methodPath = "data/knowledge/subscribers/daily-guidance-methods.json";
const schemaPath = "data/knowledge/subscribers/daily-guidance-schema.json";
const contextPath = "data/knowledge/subscribers/sample-subscriber-context.json";
const enginePath = "scripts/subscriber-guidance-engine.js";
const outputFolder = "generated/subscribers/daily-guidance";

check(fs.existsSync(path.join(root, methodPath)), "Subscriber guidance method registry exists", failures);
check(fs.existsSync(path.join(root, schemaPath)), "Subscriber guidance schema exists", failures);
check(fs.existsSync(path.join(root, contextPath)), "Sample subscriber context exists", failures);
check(fs.existsSync(path.join(root, enginePath)), "Subscriber guidance engine exists", failures);
check(fs.existsSync(path.join(root, outputFolder)), "Subscriber guidance output folder exists", failures);

const methods = readJson(methodPath);
const schema = readJson(schemaPath);
const context = readJson(contextPath);

check(methods.public_output_enabled === false, "Subscriber guidance is not public output", failures);
check(methods.subscriber_output_enabled === false, "Subscriber guidance output remains disabled at scaffold stage", failures);
check(methods.login_required === true, "Subscriber guidance requires login", failures);
check(methods.subscription_required === true, "Subscriber guidance requires subscription", failures);
check(methods.guidance_components?.some((item) => item.id === "lucky_number"), "Method registry includes lucky number", failures);
check(methods.guidance_components?.some((item) => item.id === "lucky_color"), "Method registry includes lucky color", failures);
check(methods.guidance_components?.some((item) => item.id === "mantra"), "Method registry includes mantra", failures);
check(methods.guidance_components?.some((item) => item.id === "what_to_do"), "Method registry includes what-to-do", failures);
check(methods.guidance_components?.some((item) => item.id === "what_not_to_do"), "Method registry includes what-not-to-do", failures);
check(methods.guardrails?.some((item) => item.includes("Do not invent mantra")), "Method registry blocks invented mantra", failures);

check(schema.login_required === true, "Schema requires login", failures);
check(schema.subscription_required === true, "Schema requires subscription", failures);
check(schema.public_output_enabled === false, "Schema blocks public output", failures);
check(Boolean(schema.daily_output_fields?.lucky_number), "Schema includes lucky number output", failures);
check(Boolean(schema.daily_output_fields?.lucky_color), "Schema includes lucky color output", failures);
check(Boolean(schema.daily_output_fields?.mantra), "Schema includes mantra output", failures);

check(context.subscription_status === "active", "Sample subscriber context has active subscription", failures);
check(context.consent_to_generate_personal_guidance === true, "Sample context has consent", failures);
check(Boolean(context.current_location?.timezone), "Sample context has timezone", failures);

const run = spawnSync("node", [
  "scripts/subscriber-guidance-engine.js",
  "--date=2026-05-10",
  "--context=data/knowledge/subscribers/sample-subscriber-context.json"
], {
  cwd: root,
  encoding: "utf8"
});

check(run.status === 0, "Subscriber guidance engine sample run succeeds", failures);

let sample = null;
try {
  sample = JSON.parse(run.stdout);
} catch {
  failures.push("Subscriber guidance sample output is valid JSON");
  console.log("❌ Subscriber guidance sample output is valid JSON");
}

if (sample) {
  check(sample.public_output_enabled === false, "Sample guidance is not public-enabled", failures);
  check(sample.subscriber_output_enabled === false, "Sample subscriber display remains disabled at scaffold stage", failures);
  check(sample.generation_status === "scaffold_only", "Sample guidance is scaffold-only", failures);
  check(sample.review_status === "under_review", "Sample guidance is under review", failures);
  check(sample.daily_guidance?.lucky_number?.value === null, "Sample does not invent lucky number", failures);
  check(sample.daily_guidance?.lucky_color?.value === null, "Sample does not invent lucky color", failures);
  check(sample.daily_guidance?.mantra?.text_devanagari === null, "Sample does not invent mantra", failures);
  check(Array.isArray(sample.daily_guidance?.what_to_do) && sample.daily_guidance.what_to_do.length === 0, "Sample does not invent what-to-do", failures);
  check(Array.isArray(sample.daily_guidance?.what_not_to_do) && sample.daily_guidance.what_not_to_do.length === 0, "Sample does not invent what-not-to-do", failures);
  check(sample.safe_context?.civil_weekday?.value_hi === "रविवार", "Sample inherits safe Panchang weekday context", failures);
}

console.log("");
console.log("Subscriber guidance scaffold summary:");
console.log("- Public output: disabled");
console.log("- Subscriber display: disabled at scaffold stage");
console.log("- Lucky number/color/mantra: blocked until approved rules");
console.log("- Panchang dependency: scaffold-only safe weekday context");

if (failures.length) {
  console.log("");
  console.log("Subscriber guidance preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Subscriber daily guidance preflight passed.");
