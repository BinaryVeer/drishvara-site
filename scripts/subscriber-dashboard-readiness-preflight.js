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

console.log("Drishvara D09 Subscriber Guidance Dashboard Readiness Matrix preflight");
console.log("");

const matrixFile = "data/knowledge/subscribers/subscriber-dashboard-readiness-matrix-d09.json";
const previewFile = "data/knowledge/subscribers/subscriber-dashboard-readiness-preview-d09.json";
const docFile = "docs/knowledge/subscriber-dashboard-readiness-matrix-d09.md";
const builderFile = "scripts/build-subscriber-dashboard-readiness-preview-d09.js";
const d08File = "data/knowledge/subscribers/subscriber-entitlement-privacy-gate-d08.json";
const d08PreviewFile = "data/knowledge/subscribers/subscriber-entitlement-privacy-gate-preview-d08.json";
const dashboardSchemaFile = "data/backend/subscriber-dashboard-schema.json";
const dashboardFile = "dashboard.html";
const runtimeFile = "assets/js/drishvara-language-runtime.js";
const authClientFile = "assets/js/auth-client.js";
const sessionGuardFile = "assets/js/session-guard.js";

for (const file of [matrixFile, previewFile, docFile, builderFile, d08File, d08PreviewFile, dashboardSchemaFile, dashboardFile, runtimeFile, authClientFile, sessionGuardFile]) {
  check(exists(file), `${file} exists`);
}

const matrix = json(matrixFile);
const preview = json(previewFile);
const d08 = json(d08File);
const d08Preview = json(d08PreviewFile);
const dashboardSchema = json(dashboardSchemaFile);
const doc = read(docFile);
const builder = read(builderFile);
const dashboard = read(dashboardFile);
const runtime = read(runtimeFile);
const authClient = read(authClientFile);
const sessionGuard = read(sessionGuardFile);

check(matrix.status === "readiness_matrix_only", "D09 matrix is readiness-only");
check(matrix.dashboard_live_data_enabled === false, "Dashboard live data remains disabled");
check(matrix.subscriber_guidance_live_enabled === false, "Subscriber guidance remains disabled");
check(matrix.premium_guidance_enabled === false, "Premium guidance remains disabled");
check(matrix.personalized_output_enabled === false, "Personalized output remains disabled");
check(matrix.auth_enabled === false, "Auth remains disabled");
check(matrix.supabase_enabled === false, "Supabase remains disabled");
check(matrix.payment_enabled === false, "Payment remains disabled");
check(matrix.subscription_gate_live_enabled === false, "Subscription gate remains disabled");
check(matrix.entitlement_check_live_enabled === false, "Entitlement check remains disabled");
check(matrix.external_api_fetch_enabled === false, "External API fetch remains disabled");
check(matrix.runtime_language_change_enabled === false, "Language runtime remains untouched");
check(matrix.admin_actions_enabled === false, "Admin actions remain disabled");

check(matrix.brand.en === "Drishvara", "English brand is Drishvara");
check(matrix.brand.hi === "द्रिश्वारा", "Hindi brand is द्रिश्वारा");

check(Array.isArray(matrix.dashboard_cards), "Dashboard cards array exists");
check(matrix.dashboard_cards.length >= 10, "Dashboard matrix has enough card definitions");

for (const cardId of [
  "login_status",
  "subscription_status",
  "privacy_consent",
  "profile_readiness",
  "daily_reflection",
  "what_to_do",
  "what_not_to_do",
  "lucky_number",
  "lucky_color",
  "mantra",
  "word_of_the_day",
  "panchang_context"
]) {
  check(matrix.dashboard_cards.some((card) => card.card_id === cardId), `Dashboard card exists: ${cardId}`);
}

check(matrix.dashboard_cards.every((card) => card.enabled_now === false), "All dashboard cards are disabled now");
check(matrix.dashboard_cards.every((card) => Array.isArray(card.required_gates)), "All dashboard cards list required gates");
check(matrix.readiness_levels.includes("blocked_until_auth"), "Readiness level includes blocked_until_auth");
check(matrix.readiness_levels.includes("blocked_until_subscription"), "Readiness level includes blocked_until_subscription");
check(matrix.readiness_levels.includes("ready_for_future_activation"), "Readiness level includes ready_for_future_activation");

check(preview.status === "preview_not_live", "Preview is not live");
check(preview.dashboard_live_data_enabled === false, "Preview keeps dashboard live data disabled");
check(preview.subscriber_guidance_live_enabled === false, "Preview keeps subscriber guidance disabled");
check(preview.premium_guidance_enabled === false, "Preview keeps premium guidance disabled");
check(preview.auth_enabled === false, "Preview keeps Auth disabled");
check(preview.supabase_enabled === false, "Preview keeps Supabase disabled");
check(preview.payment_enabled === false, "Preview keeps payment disabled");
check(Array.isArray(preview.items), "Preview items array exists");
check(preview.items.length >= 3, "Preview has at least three scenarios");

for (const item of preview.items) {
  const label = item.scenario_id || "unknown-scenario";
  check(item.preview_only === true, `Scenario marked preview-only: ${label}`);
  check(item.dashboard_live_data_enabled === false, `Scenario dashboard live data disabled: ${label}`);
  check(item.subscriber_guidance_live_enabled === false, `Scenario subscriber guidance disabled: ${label}`);
  check(item.premium_guidance_enabled === false, `Scenario premium guidance disabled: ${label}`);
  check(item.auth_enabled === false, `Scenario Auth disabled: ${label}`);
  check(item.supabase_enabled === false, `Scenario Supabase disabled: ${label}`);
  check(item.payment_enabled === false, `Scenario payment disabled: ${label}`);
  check(Array.isArray(item.cards), `Scenario cards array exists: ${label}`);
  check(item.cards.length === matrix.dashboard_cards.length, `Scenario evaluates all dashboard cards: ${label}`);
  check(item.cards.every((card) => card.enabled_now === false), `Scenario keeps every card disabled now: ${label}`);
  check(item.cards.every((card) => card.live_data_enabled === false), `Scenario keeps every card live-data disabled: ${label}`);
}

check(d08.subscription_gate_live_enabled === false, "D08 subscription gate remains disabled");
check(d08.entitlement_check_live_enabled === false, "D08 entitlement check remains disabled");
check(d08.subscriber_guidance_live_enabled === false, "D08 subscriber guidance remains disabled");
check(d08Preview.subscriber_guidance_live_enabled === false, "D08 preview subscriber guidance remains disabled");

check(JSON.stringify(dashboardSchema).includes("disabled") || JSON.stringify(dashboardSchema).includes("false"), "Subscriber dashboard schema remains disabled/scaffolded");
check(dashboard.includes("noindex"), "Dashboard remains noindex");
check(!dashboard.includes("createClient("), "Dashboard does not instantiate Supabase");
check(!dashboard.includes("supabase.auth"), "Dashboard does not call Supabase auth");
check(!dashboard.includes("SERVICE_ROLE"), "Dashboard does not expose service role");

check(builder.includes("preview_only: true"), "Builder marks preview-only");
check(builder.includes("dashboard_live_data_enabled: false"), "Builder disables dashboard live data");
check(builder.includes("subscriber_guidance_live_enabled: false"), "Builder disables subscriber guidance");
check(!builder.includes("fetch("), "Builder does not fetch external APIs");
check(!builder.includes("createClient("), "Builder does not instantiate Supabase");
check(!builder.includes("supabase.auth"), "Builder does not call Supabase auth");
check(!builder.includes("SERVICE_ROLE"), "Builder does not expose service role");

check(doc.includes("non-live"), "Doc states non-live");
check(doc.includes("does not"), "Doc includes non-goals");
check(doc.includes("Dashboard cards may remain visible as scaffold or blocked states only"), "Doc protects dashboard card output");
check(doc.includes("No card should expose personalized subscriber guidance"), "Doc blocks personalized subscriber exposure");

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
console.log("D09 Subscriber Guidance Dashboard Readiness Matrix summary:");
console.log(`- Dashboard cards: ${matrix.dashboard_cards.length}`);
console.log(`- Preview scenarios: ${preview.items.length}`);
console.log("- Dashboard live data: disabled");
console.log("- Auth/Supabase/payment/subscription gate: disabled");
console.log("- Premium/subscriber guidance: disabled");

if (failures.length) {
  console.log("");
  console.log("D09 Subscriber Guidance Dashboard Readiness Matrix preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("D09 Subscriber Guidance Dashboard Readiness Matrix preflight passed.");
