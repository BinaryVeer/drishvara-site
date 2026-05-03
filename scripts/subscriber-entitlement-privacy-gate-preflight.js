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

console.log("Drishvara D08 Subscriber Entitlement & Privacy Gate Preview preflight");
console.log("");

const schemaFile = "data/knowledge/subscribers/subscriber-entitlement-privacy-gate-d08.json";
const previewFile = "data/knowledge/subscribers/subscriber-entitlement-privacy-gate-preview-d08.json";
const docFile = "docs/knowledge/subscriber-entitlement-privacy-gate-preview-d08.md";
const builderFile = "scripts/build-subscriber-entitlement-privacy-gate-preview-d08.js";
const d07SchemaFile = "data/knowledge/subscribers/subscriber-guidance-personalization-schema-d07.json";
const authModelFile = "data/backend/auth-access-model.json";
const paymentPlansFile = "data/backend/payments/subscription-plans.json";
const runtimeFile = "assets/js/drishvara-language-runtime.js";
const authClientFile = "assets/js/auth-client.js";
const sessionGuardFile = "assets/js/session-guard.js";

for (const file of [schemaFile, previewFile, docFile, builderFile, d07SchemaFile, authModelFile, paymentPlansFile, runtimeFile, authClientFile, sessionGuardFile]) {
  check(exists(file), `${file} exists`);
}

const schema = json(schemaFile);
const preview = json(previewFile);
const d07 = json(d07SchemaFile);
const authModel = json(authModelFile);
const doc = read(docFile);
const builder = read(builderFile);
const runtime = read(runtimeFile);
const authClient = read(authClientFile);
const sessionGuard = read(sessionGuardFile);

check(schema.status === "gate_schema_preview_only", "D08 gate schema is preview-only");
check(schema.auth_enabled === false, "Auth remains disabled");
check(schema.supabase_enabled === false, "Supabase remains disabled");
check(schema.payment_enabled === false, "Payment remains disabled");
check(schema.subscription_gate_live_enabled === false, "Subscription gate remains disabled");
check(schema.entitlement_check_live_enabled === false, "Entitlement check remains disabled");
check(schema.subscriber_guidance_live_enabled === false, "Subscriber guidance remains disabled");
check(schema.premium_guidance_enabled === false, "Premium guidance remains disabled");
check(schema.personalized_output_enabled === false, "Personalized output remains disabled");
check(schema.public_personalized_output_enabled === false, "Public personalized output remains disabled");
check(schema.external_api_fetch_enabled === false, "External API fetch remains disabled");
check(schema.runtime_language_change_enabled === false, "Language runtime remains untouched");
check(schema.admin_actions_enabled === false, "Admin actions remain disabled");

check(schema.brand.en === "Drishvara", "English brand is Drishvara");
check(schema.brand.hi === "द्रिश्वारा", "Hindi brand is द्रिश्वारा");

for (const gate of [
  "authenticated_session",
  "subscriber_profile_exists",
  "explicit_consent_active",
  "subscription_entitlement_active",
  "privacy_safe_inputs_available",
  "approved_guidance_rules_available"
]) {
  check(schema.future_gate_sequence.some((item) => item.gate === gate), `Future gate exists: ${gate}`);
}

check(schema.future_gate_sequence.every((item) => item.enabled_now === false), "All future gates are disabled now");
check(schema.privacy_controls_required_future.includes("explicit consent before profile personalization"), "Explicit consent required");
check(schema.privacy_controls_required_future.includes("secure subscriber profile storage"), "Secure storage required");
check(schema.blocked_now.includes("login-only premium unlock"), "Login-only premium unlock blocked");
check(schema.blocked_now.includes("frontend Supabase profile read"), "Frontend Supabase profile read blocked");
check(schema.blocked_now.includes("birth detail collection"), "Birth detail collection blocked");

check(preview.status === "preview_not_live", "Preview is not live");
check(preview.auth_enabled === false, "Preview keeps Auth disabled");
check(preview.supabase_enabled === false, "Preview keeps Supabase disabled");
check(preview.payment_enabled === false, "Preview keeps payment disabled");
check(preview.subscription_gate_live_enabled === false, "Preview keeps subscription gate disabled");
check(preview.entitlement_check_live_enabled === false, "Preview keeps entitlement check disabled");
check(preview.subscriber_guidance_live_enabled === false, "Preview keeps subscriber guidance disabled");
check(preview.premium_guidance_enabled === false, "Preview keeps premium guidance disabled");
check(Array.isArray(preview.items), "Preview items array exists");
check(preview.items.length >= 3, "At least three gate scenarios exist");

for (const item of preview.items) {
  const label = item.scenario_id || "unknown-scenario";
  check(item.preview_only === true, `Scenario marked preview-only: ${label}`);
  check(item.live_output_enabled === false, `Scenario live output disabled: ${label}`);
  check(item.auth_enabled === false, `Scenario Auth disabled: ${label}`);
  check(item.supabase_enabled === false, `Scenario Supabase disabled: ${label}`);
  check(item.payment_enabled === false, `Scenario payment disabled: ${label}`);
  check(item.premium_guidance_enabled === false, `Scenario premium guidance disabled: ${label}`);
  check(item.subscriber_guidance_live_enabled === false, `Scenario subscriber guidance disabled: ${label}`);
  check(Array.isArray(item.gates), `Scenario gates array exists: ${label}`);
  check(item.gates.length >= 6, `Scenario evaluates all gates: ${label}`);
}

check(preview.items.some((item) => item.scenario_id === "anonymous-user" && item.gate_result === "blocked"), "Anonymous scenario is blocked");
check(preview.items.some((item) => item.scenario_id === "logged-in-no-subscription" && item.first_blocking_gate === "subscription_entitlement_active"), "Logged-in no-subscription scenario blocks at entitlement");
check(preview.items.some((item) => item.scenario_id === "future-valid-subscriber-preview" && item.gate_result === "would_pass_in_future_after_activation"), "Future valid subscriber scenario is preview-pass only");

check(d07.subscriber_guidance_live_enabled === false, "D07 subscriber guidance remains disabled");
check(d07.premium_guidance_enabled === false, "D07 premium guidance remains disabled");
check(d07.auth_enabled === false, "D07 Auth remains disabled");
check(d07.supabase_enabled === false, "D07 Supabase remains disabled");

check(JSON.stringify(authModel).includes("disabled") || JSON.stringify(authModel).includes("false"), "Auth access model remains disabled/scaffolded");
check(fs.existsSync(path.join(root, "data/backend/payments/subscription-plans.json")), "Payment subscription plans file remains scaffolded");

check(builder.includes("preview_only: true"), "Builder marks preview-only");
check(builder.includes("live_output_enabled: false"), "Builder disables live output");
check(builder.includes("auth_enabled: false"), "Builder keeps Auth disabled");
check(builder.includes("supabase_enabled: false"), "Builder keeps Supabase disabled");
check(builder.includes("payment_enabled: false"), "Builder keeps payment disabled");
check(!builder.includes("fetch("), "Builder does not fetch external APIs");
check(!builder.includes("createClient("), "Builder does not instantiate Supabase");
check(!builder.includes("supabase.auth"), "Builder does not call Supabase auth");
check(!builder.includes("SERVICE_ROLE"), "Builder does not expose service role");

check(doc.includes("preview-only"), "Doc states preview-only");
check(doc.includes("does not"), "Doc includes non-goals");
check(doc.includes("Login alone must never unlock premium guidance"), "Doc blocks login-only premium unlock");
check(doc.includes("must not be collected"), "Doc protects sensitive data collection");

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
console.log("D08 Subscriber Entitlement & Privacy Gate Preview summary:");
console.log(`- Gate scenarios: ${preview.items.length}`);
console.log("- Auth/Supabase/payment/subscription gate: disabled");
console.log("- Entitlement check: preview-only");
console.log("- Premium guidance: disabled");
console.log("- Birth/profile sensitive data collection: blocked");

if (failures.length) {
  console.log("");
  console.log("D08 Subscriber Entitlement & Privacy Gate Preview preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("D08 Subscriber Entitlement & Privacy Gate Preview preflight passed.");
