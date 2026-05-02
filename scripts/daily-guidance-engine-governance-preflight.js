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

console.log("Drishvara D01 Daily Guidance & Panchang Engine Governance preflight");
console.log("");

const files = [
  "data/knowledge/daily-guidance/daily-guidance-engine-governance-d01.json",
  "data/knowledge/sanatan/panchang-source-policy-d01.json",
  "data/knowledge/sanatan/mantra-selection-policy-d01.json",
  "docs/knowledge/daily-guidance-panchang-engine-governance-d01.md",
  "assets/js/drishvara-language-runtime.js",
  "data/knowledge/sanatan/panchang-engine-schema.json",
  "data/knowledge/subscribers/daily-guidance-schema.json"
];

for (const file of files) check(exists(file), `${file} exists`);

const engine = json("data/knowledge/daily-guidance/daily-guidance-engine-governance-d01.json");
const sourcePolicy = json("data/knowledge/sanatan/panchang-source-policy-d01.json");
const mantraPolicy = json("data/knowledge/sanatan/mantra-selection-policy-d01.json");
const doc = read("docs/knowledge/daily-guidance-panchang-engine-governance-d01.md");
const runtime = read("assets/js/drishvara-language-runtime.js");

check(engine.status === "governance_only", "D01 is governance-only");
check(engine.public_dynamic_output_enabled === false, "Public dynamic daily output remains disabled");
check(engine.external_api_fetch_enabled === false, "External API fetch remains disabled");
check(engine.runtime_language_change_enabled === false, "Language runtime remains untouched");
check(engine.article_body_translation_enabled === false, "Article body translation remains untouched");
check(engine.supabase_enabled === false, "Supabase remains disabled");
check(engine.auth_enabled === false, "Auth remains disabled");
check(engine.payment_enabled === false, "Payment remains disabled");
check(engine.premium_guidance_enabled === false, "Premium guidance remains disabled");
check(engine.admin_actions_enabled === false, "Admin actions remain disabled");

for (const key of ["word_of_the_day", "vedic_guidance", "panchang_festival", "mantra", "lucky_colour_number"]) {
  check(Boolean(engine.modules?.[key]), `${key} module governance exists`);
}

check(engine.modules.panchang_festival.requires_location === true, "Panchang future engine requires location");
check(engine.modules.panchang_festival.requires_source_validation === true, "Panchang requires source validation");
check(engine.modules.mantra.requires_sanskrit_review === true, "Mantra requires Sanskrit review");
check(engine.modules.lucky_colour_number.requires_auth === true, "Lucky colour/number remains auth-gated future feature");

check(sourcePolicy.status === "source_policy_scaffold", "Panchang source policy scaffold exists");
check(sourcePolicy.blocked_source_categories.includes("unvalidated AI-generated Panchang values"), "Unvalidated AI Panchang values blocked");
check(sourcePolicy.required_fields_for_future_daily_record.includes("source_basis"), "Future daily record requires source_basis");
check(sourcePolicy.review_status_values.includes("approved"), "Approved review status exists");

check(mantraPolicy.public_dynamic_mantra_enabled === false, "Dynamic public mantra remains disabled");
check(mantraPolicy.rules.some((r) => r.includes("Do not generate new mantras automatically")), "Automatic mantra generation blocked");
check(mantraPolicy.future_record_fields.includes("sanskrit_text"), "Mantra records require Sanskrit text");

check(doc.includes("governance-only"), "Doc states governance-only");
check(doc.includes("does not"), "Doc includes non-goals");
check(doc.includes("reviewed before public dynamic use"), "Doc requires review before dynamic use");

check(runtime.includes("2026.05.02-h05"), "H05/H05B runtime remains stable");
check(!runtime.includes("fetch("), "Runtime does not fetch external APIs");
check(!runtime.includes("createClient("), "Runtime does not instantiate Supabase");
check(!runtime.includes("supabase.auth"), "Runtime does not call Supabase auth");
check(!runtime.includes("SERVICE_ROLE"), "Runtime does not expose service role");

console.log("");
console.log("D01 Daily Guidance & Panchang governance summary:");
console.log("- Public dynamic Panchang/Vedic output: disabled");
console.log("- External APIs: disabled");
console.log("- Runtime language logic: unchanged");
console.log("- Supabase/Auth/payment/premium/admin: disabled");

if (failures.length) {
  console.log("");
  console.log("D01 Daily Guidance governance preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("D01 Daily Guidance & Panchang governance preflight passed.");
