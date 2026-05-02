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

console.log("Drishvara D05 Panchang/Festival Source Registry & Validation Preview preflight");
console.log("");

const sourceFile = "data/knowledge/sanatan/panchang-festival-source-registry-d05.json";
const observanceFile = "data/knowledge/sanatan/festival-observance-registry-d05.json";
const previewFile = "data/knowledge/sanatan/panchang-festival-validation-preview-d05.json";
const docFile = "docs/knowledge/panchang-festival-source-validation-preview-d05.md";
const builderFile = "scripts/build-panchang-festival-validation-preview-d05.js";
const d01File = "data/knowledge/daily-guidance/daily-guidance-engine-governance-d01.json";
const d03File = "data/knowledge/daily-guidance/daily-guidance-rule-schema-d03.json";
const panchangSchemaFile = "data/knowledge/sanatan/panchang-engine-schema.json";
const runtimeFile = "assets/js/drishvara-language-runtime.js";
const dailyContextFile = "data/daily-context.json";

for (const file of [sourceFile, observanceFile, previewFile, docFile, builderFile, d01File, d03File, panchangSchemaFile, runtimeFile, dailyContextFile]) {
  check(exists(file), `${file} exists`);
}

const source = json(sourceFile);
const observance = json(observanceFile);
const preview = json(previewFile);
const d01 = json(d01File);
const d03 = json(d03File);
const doc = read(docFile);
const builder = read(builderFile);
const runtime = read(runtimeFile);

check(source.status === "source_registry_only", "D05 source registry only");
check(source.public_dynamic_output_enabled === false, "Public dynamic Panchang output remains disabled");
check(source.panchang_calculation_enabled === false, "Panchang calculation remains disabled");
check(source.festival_date_calculation_enabled === false, "Festival date calculation remains disabled");
check(source.external_api_fetch_enabled === false, "External API fetch remains disabled");
check(source.runtime_language_change_enabled === false, "Language runtime remains untouched");
check(source.supabase_enabled === false, "Supabase remains disabled");
check(source.auth_enabled === false, "Auth remains disabled");
check(source.payment_enabled === false, "Payment remains disabled");
check(source.premium_guidance_enabled === false, "Premium guidance remains disabled");
check(source.admin_actions_enabled === false, "Admin actions remain disabled");

check(source.brand.en === "Drishvara", "English brand is Drishvara");
check(source.brand.hi === "द्रिश्वारा", "Hindi brand is द्रिश्वारा");

check(Array.isArray(source.approved_source_categories), "Approved source categories exist");
check(source.approved_source_categories.length >= 3, "Enough approved source categories listed");
check(source.blocked_source_categories.includes("unvalidated AI-generated Panchang values"), "Unvalidated AI Panchang values blocked");
check(source.blocked_source_categories.includes("client-side external API fetch without review"), "Client-side unreviewed API fetch blocked");
check(source.required_future_record_fields.includes("source_basis"), "Future record requires source_basis");
check(source.required_future_record_fields.includes("review_status"), "Future record requires review_status");
check(source.review_status_values.includes("approved"), "Approved review status exists");

check(observance.status === "registry_scaffold_not_live", "Festival/observance registry is not live");
check(observance.public_dynamic_output_enabled === false, "Festival public dynamic output disabled");
check(Array.isArray(observance.items), "Festival/observance items array exists");
check(observance.items.length >= 5, "At least five scaffold observances exist");

for (const item of observance.items) {
  const label = item.id || "unknown-observance";
  check(Boolean(item.name_en), `Observance has English name: ${label}`);
  check(Boolean(item.name_hi), `Observance has Hindi name: ${label}`);
  check(["festival", "observance"].includes(item.category), `Observance category valid: ${label}`);
  check(item.date_rule_status === "not_configured", `Observance date rule not configured: ${label}`);
  check(item.requires_source_cross_check === true, `Observance requires source cross-check: ${label}`);
  check(source.review_status_values.includes(item.review_status), `Observance review status valid: ${label}`);
}

check(preview.status === "preview_not_live", "Validation preview is not live");
check(preview.public_dynamic_output_enabled === false, "Preview does not enable public dynamic output");
check(preview.external_api_fetch_enabled === false, "Preview does not enable external API fetch");
check(preview.live_panchang_calculation_enabled === false, "Preview does not enable live Panchang calculation");
check(preview.live_festival_date_assignment_enabled === false, "Preview does not enable live festival date assignment");
check(Array.isArray(preview.items), "Preview items array exists");
check(preview.items.length >= 5, "Preview has at least five validation items");

for (const item of preview.items) {
  const label = item.id || "unknown-preview";
  check(item.preview_only === true, `Preview item marked preview-only: ${label}`);
  check(item.live_output_enabled === false, `Preview item live output disabled: ${label}`);
  check(item.validation_result === "valid_scaffold", `Preview item validates as scaffold: ${label}`);
  check(Array.isArray(item.validation_issues), `Preview item has validation issues array: ${label}`);
}

check(d01.status === "governance_only", "D01 governance remains in place");
check(d01.public_dynamic_output_enabled === false, "D01 public dynamic output remains disabled");
check(d03.status === "schema_only", "D03 rule schema remains schema-only");
check(d03.public_dynamic_output_enabled === false, "D03 public dynamic output remains disabled");

check(builder.includes("preview_only: true"), "Builder marks preview-only");
check(builder.includes("live_output_enabled: false"), "Builder disables live output");
check(!builder.includes("fetch("), "Builder does not fetch external APIs");
check(!builder.includes("createClient("), "Builder does not instantiate Supabase");
check(!builder.includes("supabase.auth"), "Builder does not call Supabase auth");
check(!builder.includes("SERVICE_ROLE"), "Builder does not expose service role");

check(doc.includes("does not"), "Doc includes non-goals");
check(doc.includes("does not update `data/daily-context.json`"), "Doc protects daily context output");
check(doc.includes("does not assign festival dates"), "Doc blocks festival date assignment");

check(runtime.includes("2026.05.02-h05"), "H05/H05B runtime remains stable");
check(!runtime.includes("fetch("), "Runtime does not fetch external APIs");
check(!runtime.includes("createClient("), "Runtime does not instantiate Supabase");
check(!runtime.includes("supabase.auth"), "Runtime does not call Supabase auth");
check(!runtime.includes("SERVICE_ROLE"), "Runtime does not expose service role");

console.log("");
console.log("D05 Panchang/Festival validation preview summary:");
console.log(`- Observance registry items: ${observance.items.length}`);
console.log(`- Preview validation items: ${preview.items.length}`);
console.log("- Public dynamic Panchang/Festival output: disabled");
console.log("- External API fetch: disabled");
console.log("- Daily context mutation: blocked");
console.log("- Supabase/Auth/payment/premium/admin: disabled");

if (failures.length) {
  console.log("");
  console.log("D05 Panchang/Festival Source Registry & Validation Preview preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("D05 Panchang/Festival Source Registry & Validation Preview preflight passed.");
