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

console.log("Drishvara D04 Daily Guidance Rule Validation & Selection Preview preflight");
console.log("");

const files = [
  "data/knowledge/daily-guidance/daily-guidance-rule-validation-policy-d04.json",
  "data/knowledge/daily-guidance/daily-guidance-selection-preview-d04.json",
  "data/knowledge/daily-guidance/daily-guidance-rule-schema-d03.json",
  "data/knowledge/daily-guidance/daily-guidance-rule-examples-d03.json",
  "data/knowledge/daily-guidance/word-of-day-bank-d02.json",
  "docs/knowledge/daily-guidance-rule-validation-selection-preview-d04.md",
  "scripts/build-daily-guidance-selection-preview-d04.js",
  "assets/js/drishvara-language-runtime.js",
  "data/daily-context.json"
];

for (const file of files) check(exists(file), `${file} exists`);

const policy = json("data/knowledge/daily-guidance/daily-guidance-rule-validation-policy-d04.json");
const preview = json("data/knowledge/daily-guidance/daily-guidance-selection-preview-d04.json");
const schema = json("data/knowledge/daily-guidance/daily-guidance-rule-schema-d03.json");
const examples = json("data/knowledge/daily-guidance/daily-guidance-rule-examples-d03.json");
const wordBank = json("data/knowledge/daily-guidance/word-of-day-bank-d02.json");
const doc = read("docs/knowledge/daily-guidance-rule-validation-selection-preview-d04.md");
const builder = read("scripts/build-daily-guidance-selection-preview-d04.js");
const runtime = read("assets/js/drishvara-language-runtime.js");

check(policy.status === "validation_policy_only", "D04 validation policy only");
check(policy.public_dynamic_output_enabled === false, "Public dynamic output remains disabled");
check(policy.selection_preview_enabled === true, "Selection preview is enabled");
check(policy.selection_preview_live_enabled === false, "Selection preview is not live");
check(policy.subscriber_guidance_enabled === false, "Subscriber guidance remains disabled");
check(policy.premium_guidance_enabled === false, "Premium guidance remains disabled");
check(policy.external_api_fetch_enabled === false, "External API fetch remains disabled");
check(policy.runtime_language_change_enabled === false, "Language runtime remains unchanged");
check(policy.supabase_enabled === false, "Supabase remains disabled");
check(policy.auth_enabled === false, "Auth remains disabled");
check(policy.payment_enabled === false, "Payment remains disabled");
check(policy.admin_actions_enabled === false, "Admin actions remain disabled");

check(policy.brand.en === "Drishvara", "English brand is Drishvara");
check(policy.brand.hi === "द्रिश्वारा", "Hindi brand is द्रिश्वारा");

for (const id of [
  "rule-type-must-be-allowed",
  "tone-must-be-allowed",
  "review-status-required",
  "source-basis-required",
  "hindi-english-pair-required",
  "no-live-selection"
]) {
  check(policy.validation_rules.some((rule) => rule.id === id), `Validation rule exists: ${id}`);
}

check(preview.status === "preview_not_live", "Preview status is not live");
check(preview.public_dynamic_output_enabled === false, "Preview does not enable public dynamic output");
check(preview.selection_preview_live_enabled === false, "Preview live output remains disabled");
check(Array.isArray(preview.items), "Preview has items array");
check(preview.items.length >= 3, "Preview has at least three sample selections");

const ruleIds = new Set((examples.items || []).map((item) => item.rule_id));
const wordIds = new Set((wordBank.items || []).map((item) => item.id));

for (const item of preview.items) {
  const label = item.preview_id || "unknown-preview";
  check(item.preview_only === true, `Preview item marked preview-only: ${label}`);
  check(item.live_output_enabled === false, `Preview item live output disabled: ${label}`);
  check(ruleIds.has(item.selected_rule_id), `Preview item selected rule exists: ${label}`);
  check(wordIds.has(item.input_context?.word_id), `Preview item input word exists: ${label}`);
  check(Boolean(item.guidance_preview?.text_en), `Preview item has English guidance: ${label}`);
  check(Boolean(item.guidance_preview?.text_hi), `Preview item has Hindi guidance: ${label}`);
  check(schema.allowed_tones.includes(item.guidance_preview?.tone), `Preview item tone allowed: ${label}`);
  check(schema.review_status_values.includes(item.guidance_preview?.review_status), `Preview item review status allowed: ${label}`);
  check(Boolean(item.guidance_preview?.source_basis), `Preview item has source basis: ${label}`);
}

check(schema.status === "schema_only", "D03 schema remains schema-only");
check(schema.public_dynamic_output_enabled === false, "D03 public dynamic output remains disabled");
check(wordBank.public_dynamic_output_enabled === false, "D02 word dynamic output remains disabled");

check(builder.includes("preview_only: true"), "Builder marks previews only");
check(builder.includes("live_output_enabled: false"), "Builder disables live output");
check(!builder.includes("fetch("), "Builder does not fetch external APIs");
check(!builder.includes("createClient("), "Builder does not instantiate Supabase");
check(!builder.includes("supabase.auth"), "Builder does not call Supabase auth");
check(!builder.includes("SERVICE_ROLE"), "Builder does not expose service role");

check(doc.includes("does not"), "Doc includes non-goals");
check(doc.includes("not live"), "Doc states preview is not live");
check(doc.includes("does not update `data/daily-context.json`"), "Doc protects daily context output");

check(runtime.includes("2026.05.02-h05"), "H05/H05B runtime remains stable");
check(!runtime.includes("fetch("), "Runtime does not fetch external APIs");
check(!runtime.includes("createClient("), "Runtime does not instantiate Supabase");
check(!runtime.includes("supabase.auth"), "Runtime does not call Supabase auth");
check(!runtime.includes("SERVICE_ROLE"), "Runtime does not expose service role");

console.log("");
console.log("D04 Daily Guidance selection preview summary:");
console.log(`- Preview selections: ${preview.items.length}`);
console.log("- Public dynamic output: disabled");
console.log("- Daily context mutation: blocked");
console.log("- External API fetch: disabled");
console.log("- Supabase/Auth/payment/premium/admin: disabled");

if (failures.length) {
  console.log("");
  console.log("D04 Daily Guidance Rule Validation & Selection Preview preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("D04 Daily Guidance Rule Validation & Selection Preview preflight passed.");
