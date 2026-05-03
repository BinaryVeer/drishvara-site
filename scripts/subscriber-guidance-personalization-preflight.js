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

console.log("Drishvara D07 Subscriber Daily Guidance Personalization Schema preflight");
console.log("");

const schemaFile = "data/knowledge/subscribers/subscriber-guidance-personalization-schema-d07.json";
const inputPolicyFile = "data/knowledge/subscribers/personalization-input-policy-d07.json";
const previewFile = "data/knowledge/subscribers/subscriber-guidance-personalization-preview-d07.json";
const docFile = "docs/knowledge/subscriber-guidance-personalization-schema-d07.md";
const builderFile = "scripts/build-subscriber-guidance-personalization-preview-d07.js";
const existingSubscriberSchemaFile = "data/knowledge/subscribers/daily-guidance-schema.json";
const d03File = "data/knowledge/daily-guidance/daily-guidance-rule-schema-d03.json";
const d04File = "data/knowledge/daily-guidance/daily-guidance-selection-preview-d04.json";
const d06File = "data/knowledge/sanatan/mantra-review-preview-d06.json";
const runtimeFile = "assets/js/drishvara-language-runtime.js";
const authClientFile = "assets/js/auth-client.js";
const sessionGuardFile = "assets/js/session-guard.js";

for (const file of [schemaFile, inputPolicyFile, previewFile, docFile, builderFile, existingSubscriberSchemaFile, d03File, d04File, d06File, runtimeFile, authClientFile, sessionGuardFile]) {
  check(exists(file), `${file} exists`);
}

const schema = json(schemaFile);
const inputPolicy = json(inputPolicyFile);
const preview = json(previewFile);
const existingSubscriberSchema = json(existingSubscriberSchemaFile);
const d03 = json(d03File);
const d04 = json(d04File);
const d06 = json(d06File);
const doc = read(docFile);
const builder = read(builderFile);
const runtime = read(runtimeFile);
const authClient = read(authClientFile);
const sessionGuard = read(sessionGuardFile);

check(schema.status === "schema_scaffold_only", "D07 schema is scaffold-only");
check(schema.subscriber_guidance_live_enabled === false, "Subscriber guidance remains disabled");
check(schema.premium_guidance_enabled === false, "Premium guidance remains disabled");
check(schema.personalized_output_enabled === false, "Personalized output remains disabled");
check(schema.public_personalized_output_enabled === false, "Public personalized output remains disabled");
check(schema.supabase_enabled === false, "Supabase remains disabled");
check(schema.auth_enabled === false, "Auth remains disabled");
check(schema.subscription_gate_enabled === false, "Subscription gate remains disabled");
check(schema.payment_enabled === false, "Payment remains disabled");
check(schema.admin_actions_enabled === false, "Admin actions remain disabled");
check(schema.external_api_fetch_enabled === false, "External API fetch remains disabled");
check(schema.runtime_language_change_enabled === false, "Language runtime remains untouched");

check(schema.brand.en === "Drishvara", "English brand is Drishvara");
check(schema.brand.hi === "द्रिश्वारा", "Hindi brand is द्रिश्वारा");

for (const group of ["identity_context", "birth_context", "daily_context", "preference_context"]) {
  check(Boolean(schema.personalization_input_groups?.[group]), `${group} input group exists`);
  check(schema.personalization_input_groups[group].enabled_now === false, `${group} is disabled now`);
  check(Array.isArray(schema.personalization_input_groups[group].future_fields), `${group} future fields listed`);
}

for (const section of ["daily_reflection", "what_to_do", "what_not_to_do", "lucky_number", "lucky_color", "mantra", "word_of_the_day", "panchang_context", "festival_or_observance_context"]) {
  check(schema.future_output_sections.includes(section), `Future output section exists: ${section}`);
}

check(schema.strict_output_rules.some((rule) => rule.includes("Do not present guidance as deterministic prediction")), "Deterministic prediction blocked");
check(schema.strict_output_rules.some((rule) => rule.includes("Do not claim guaranteed outcomes")), "Guaranteed outcomes blocked");
check(schema.strict_output_rules.some((rule) => rule.includes("Do not unlock premium guidance only on login")), "Login-only premium unlock blocked");

check(inputPolicy.status === "policy_scaffold_only", "Input policy is scaffold-only");
check(inputPolicy.collection_enabled_now === false, "Collection is disabled now");
check(inputPolicy.subscriber_profile_storage_enabled === false, "Subscriber profile storage disabled");
check(inputPolicy.birth_context_processing_enabled === false, "Birth context processing disabled");
check(inputPolicy.sensitive_data_public_exposure_allowed === false, "Sensitive data public exposure blocked");
check(inputPolicy.required_future_controls.includes("explicit consent"), "Explicit consent required in future");
check(inputPolicy.required_future_controls.includes("secure storage"), "Secure storage required in future");
check(inputPolicy.blocked_now.includes("collecting date/time/place of birth"), "Birth details collection blocked now");
check(inputPolicy.blocked_now.includes("login-only premium unlock"), "Login-only premium unlock blocked now");

check(preview.status === "preview_not_live", "Preview is not live");
check(preview.subscriber_guidance_live_enabled === false, "Preview keeps subscriber guidance disabled");
check(preview.premium_guidance_enabled === false, "Preview keeps premium guidance disabled");
check(preview.personalized_output_enabled === false, "Preview keeps personalized output disabled");
check(preview.supabase_enabled === false, "Preview keeps Supabase disabled");
check(preview.auth_enabled === false, "Preview keeps Auth disabled");
check(Array.isArray(preview.items), "Preview items array exists");
check(preview.items.length >= 1, "At least one synthetic preview exists");

for (const item of preview.items) {
  const label = item.preview_id || "unknown-preview";
  check(item.preview_only === true, `Preview item marked preview-only: ${label}`);
  check(item.live_output_enabled === false, `Preview item live output disabled: ${label}`);
  check(item.subscriber_guidance_live_enabled === false, `Preview item subscriber guidance disabled: ${label}`);
  check(item.premium_guidance_enabled === false, `Preview item premium guidance disabled: ${label}`);
  check(item.auth_required_but_not_enabled === true, `Preview item records auth required but not enabled: ${label}`);
  check(item.subscription_gate_required_but_not_enabled === true, `Preview item records subscription gate required but not enabled: ${label}`);
  check(item.input_context?.synthetic_profile === true, `Preview item uses synthetic profile: ${label}`);
  check(item.input_context?.birth_context_used === false, `Preview item does not use birth context: ${label}`);
  check(item.input_context?.profile_storage_used === false, `Preview item does not use profile storage: ${label}`);
  check(Boolean(item.output_preview?.daily_reflection_en), `Preview has English reflection: ${label}`);
  check(Boolean(item.output_preview?.daily_reflection_hi), `Preview has Hindi reflection: ${label}`);
}

check(existingSubscriberSchema.public_output_enabled === false || JSON.stringify(existingSubscriberSchema).includes("requires_login"), "Existing subscriber guidance schema remains non-public/login-gated");
check(d03.public_dynamic_output_enabled === false, "D03 public dynamic output remains disabled");
check(d04.public_dynamic_output_enabled === false, "D04 public dynamic output remains disabled");
check(d06.public_dynamic_mantra_enabled === false, "D06 public mantra output remains disabled");

check(builder.includes("synthetic-preview-only"), "Builder uses synthetic preview only");
check(builder.includes("profile_storage_used: false"), "Builder avoids profile storage");
check(builder.includes("birth_context_used: false"), "Builder avoids birth context");
check(!builder.includes("fetch("), "Builder does not fetch external APIs");
check(!builder.includes("createClient("), "Builder does not instantiate Supabase");
check(!builder.includes("supabase.auth"), "Builder does not call Supabase auth");
check(!builder.includes("SERVICE_ROLE"), "Builder does not expose service role");

check(doc.includes("scaffold-only"), "Doc states scaffold-only");
check(doc.includes("does not"), "Doc includes non-goals");
check(doc.includes("does not collect birth details"), "Doc blocks birth detail collection");
check(doc.includes("must not be collected"), "Doc protects sensitive profile data");

check(runtime.includes("2026.05.02-h05"), "H05/H05B runtime remains stable");
check(!runtime.includes("fetch("), "Runtime does not fetch external APIs");
check(!runtime.includes("createClient("), "Runtime does not instantiate Supabase");
check(!runtime.includes("supabase.auth"), "Runtime does not call Supabase auth");
check(!runtime.includes("SERVICE_ROLE"), "Runtime does not expose service role");

check(!authClient.includes("createClient("), "Auth client still does not instantiate Supabase");
check(!authClient.includes("supabase.auth"), "Auth client still does not call Supabase auth");
check(!authClient.includes("SERVICE_ROLE"), "Auth client does not expose service role");
check(!sessionGuard.includes("createClient("), "Session guard still does not instantiate Supabase");
check(!sessionGuard.includes("supabase.auth"), "Session guard still does not call Supabase auth");
check(!sessionGuard.includes("SERVICE_ROLE"), "Session guard does not expose service role");

console.log("");
console.log("D07 Subscriber Daily Guidance Personalization Schema summary:");
console.log(`- Synthetic previews: ${preview.items.length}`);
console.log("- Subscriber guidance live output: disabled");
console.log("- Premium guidance: disabled");
console.log("- Auth/Supabase/payment/subscription gate: disabled");
console.log("- Birth context collection/processing: disabled");

if (failures.length) {
  console.log("");
  console.log("D07 Subscriber Daily Guidance Personalization Schema preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("D07 Subscriber Daily Guidance Personalization Schema preflight passed.");
