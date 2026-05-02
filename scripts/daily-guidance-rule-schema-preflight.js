import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const exists = (file) => fs.existsSync(path.join(root, file));
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const json = (file) => JSON.parse(read(file));

const failures = [];
function check(condition, label) {
  if (condition) console.log(`✅ ${label}`);
  else {
    console.log(`❌ ${label}`);
    failures.push(label);
  }
}

console.log("Drishvara D03 Daily Guidance Rule Schema preflight");
console.log("");

const schemaFile = "data/knowledge/daily-guidance/daily-guidance-rule-schema-d03.json";
const examplesFile = "data/knowledge/daily-guidance/daily-guidance-rule-examples-d03.json";
const docFile = "docs/knowledge/daily-guidance-rule-schema-d03.md";
const d01File = "data/knowledge/daily-guidance/daily-guidance-engine-governance-d01.json";
const d02File = "data/knowledge/daily-guidance/word-of-day-bank-d02.json";
const runtimeFile = "assets/js/drishvara-language-runtime.js";

for (const file of [schemaFile, examplesFile, docFile, d01File, d02File, runtimeFile]) {
  check(exists(file), `${file} exists`);
}

const schema = json(schemaFile);
const examples = json(examplesFile);
const d01 = json(d01File);
const d02 = json(d02File);
const doc = read(docFile);
const runtime = read(runtimeFile);

check(schema.status === "schema_only", "D03 is schema-only");
check(schema.public_dynamic_output_enabled === false, "Public dynamic output remains disabled");
check(schema.subscriber_guidance_enabled === false, "Subscriber guidance remains disabled");
check(schema.premium_guidance_enabled === false, "Premium guidance remains disabled");
check(schema.external_api_fetch_enabled === false, "External API fetch remains disabled");
check(schema.runtime_language_change_enabled === false, "Language runtime remains untouched");
check(schema.supabase_enabled === false, "Supabase remains disabled");
check(schema.auth_enabled === false, "Auth remains disabled");
check(schema.payment_enabled === false, "Payment remains disabled");
check(schema.admin_actions_enabled === false, "Admin actions remain disabled");

check(schema.brand.en === "Drishvara", "English brand is Drishvara");
check(schema.brand.hi === "द्रिश्वारा", "Hindi brand is द्रिश्वारा");

for (const ruleType of ["day", "tithi", "nakshatra", "season", "festival", "word_theme", "observance", "fallback"]) {
  check(schema.allowed_rule_types.includes(ruleType), `Allowed rule type exists: ${ruleType}`);
}

for (const tone of ["reflective", "devotional", "disciplined", "calming", "cautionary"]) {
  check(schema.allowed_tones.includes(tone), `Allowed tone exists: ${tone}`);
}

for (const status of ["draft", "needs_review", "approved", "rejected"]) {
  check(schema.review_status_values.includes(status), `Review status exists: ${status}`);
}

check(Boolean(schema.rule_schema?.input_conditions), "Rule schema has input_conditions");
check(Boolean(schema.rule_schema?.output_fields), "Rule schema has output_fields");
check(schema.rule_schema.output_fields.review_status.includes("approved"), "Rule schema documents approval status");
check(schema.display_policy.future_public_dynamic.includes("approved"), "Future public dynamic display requires approval");

check(Array.isArray(examples.items), "Example rules array exists");
check(examples.items.length >= 3, "At least three example rules exist");
check(examples.public_dynamic_output_enabled === false, "Example rules are not live");

for (const item of examples.items) {
  const label = item.rule_id || "unknown";
  check(Boolean(item.rule_id), `Example has rule_id: ${label}`);
  check(schema.allowed_rule_types.includes(item.rule_type), `Example has valid rule_type: ${label}`);
  check(Boolean(item.input_conditions), `Example has input_conditions: ${label}`);
  check(Boolean(item.output_fields), `Example has output_fields: ${label}`);
  check(Boolean(item.output_fields.guidance_text_en), `Example has English guidance: ${label}`);
  check(Boolean(item.output_fields.guidance_text_hi), `Example has Hindi guidance: ${label}`);
  check(schema.allowed_tones.includes(item.output_fields.tone), `Example has valid tone: ${label}`);
  check(schema.review_status_values.includes(item.output_fields.review_status), `Example has valid review status: ${label}`);
}

check(d01.status === "governance_only", "D01 governance remains in place");
check(d01.public_dynamic_output_enabled === false, "D01 public dynamic output remains disabled");
check(d02.public_dynamic_output_enabled === false, "D02 Word of the Day dynamic output remains disabled");

check(doc.includes("schema-only"), "Doc states schema-only");
check(doc.includes("does not"), "Doc includes non-goals");
check(doc.includes("non-deterministic"), "Doc requires non-deterministic guidance");
check(doc.includes("reviewed before public use"), "Doc requires review before public use");

check(runtime.includes("2026.05.02-h05"), "H05/H05B runtime remains stable");
check(!runtime.includes("fetch("), "Runtime does not fetch external APIs");
check(!runtime.includes("createClient("), "Runtime does not instantiate Supabase");
check(!runtime.includes("supabase.auth"), "Runtime does not call Supabase auth");
check(!runtime.includes("SERVICE_ROLE"), "Runtime does not expose service role");

console.log("");
console.log("D03 Daily Guidance Rule Schema summary:");
console.log(`- Example rules: ${examples.items.length}`);
console.log("- Public dynamic output: disabled");
console.log("- Subscriber/premium guidance: disabled");
console.log("- External API fetch: disabled");
console.log("- Runtime language logic: unchanged");

if (failures.length) {
  console.log("");
  console.log("D03 Daily Guidance Rule Schema preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("D03 Daily Guidance Rule Schema preflight passed.");
