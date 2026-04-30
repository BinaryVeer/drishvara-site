import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function readJson(file) {
  return JSON.parse(read(file));
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

console.log("Drishvara Supabase Auth/Login runbook preflight");
console.log("");

const runbookPath = "docs/activation/supabase-auth-login-runbook.md";
const checklistPath = "docs/activation/supabase-auth-login-checklist.md";
const registryPath = "data/backend/activation/supabase-auth-stage-02a.json";
const accessModelPath = "data/backend/auth-access-model.json";
const dashboardSchemaPath = "data/backend/subscriber-dashboard-schema.json";
const stage01cPath = "data/backend/activation/supabase-activation-stage-01c.json";

check(exists(runbookPath), "Auth/login runbook exists", failures);
check(exists(checklistPath), "Auth/login checklist exists", failures);
check(exists(registryPath), "Auth Stage 02A registry exists", failures);
check(exists(accessModelPath), "Auth access model exists", failures);
check(exists(dashboardSchemaPath), "Subscriber dashboard schema exists", failures);
check(exists(stage01cPath), "Stage 01C apply decision registry exists", failures);

const runbook = read(runbookPath);
const checklist = read(checklistPath);
const registry = readJson(registryPath);
const accessModel = readJson(accessModelPath);
const dashboardSchema = readJson(dashboardSchemaPath);
const stage01c = readJson(stage01cPath);

check(registry.status === "runbook_only", "Stage 02A is runbook-only", failures);
check(registry.live_auth_enabled === false, "Live Auth remains disabled", failures);
check(registry.live_session_detection_enabled === false, "Live session detection remains disabled", failures);
check(registry.live_dashboard_gate_enabled === false, "Live dashboard gate remains disabled", failures);

check(registry.recommended_initial_auth_method === "email_otp_or_magic_link", "Recommended initial Auth method is email OTP/magic link", failures);
check(registry.required_redirect_urls?.local?.includes("http://localhost:5173/login.html"), "Registry includes local login redirect", failures);
check(registry.required_redirect_urls?.production?.includes("https://www.drishvara.com/login.html"), "Registry includes production login redirect", failures);

check(registry.blocked_in_this_stage.includes("live_auth_enablement"), "Stage 02A blocks live Auth enablement", failures);
check(registry.blocked_in_this_stage.includes("live_subscription_gate"), "Stage 02A blocks live subscription gate", failures);
check(registry.blocked_in_this_stage.includes("subscriber_guidance_display"), "Stage 02A blocks subscriber guidance display", failures);
check(registry.blocked_in_this_stage.includes("palm_image_upload"), "Stage 02A blocks palm image upload", failures);
check(registry.blocked_in_this_stage.includes("payment_provider"), "Stage 02A blocks payment provider", failures);

check(runbook.includes("This stage does not enable live Auth"), "Runbook clearly says live Auth is not enabled", failures);
check(runbook.includes("Email OTP / magic link"), "Runbook recommends email OTP/magic link", failures);
check(runbook.includes("Redirect URLs"), "Runbook includes redirect URLs", failures);
check(runbook.includes("Do not expose Supabase service role key"), "Runbook protects service role key", failures);
check(runbook.includes("Keep palm image upload disabled"), "Runbook keeps palm upload disabled", failures);

check(checklist.includes("http://localhost:5173/login.html"), "Checklist includes local login URL", failures);
check(checklist.includes("https://www.drishvara.com/login.html"), "Checklist includes production login URL", failures);
check(checklist.includes("Never reads service role key"), "Checklist blocks service role use", failures);
check(checklist.includes("Shows blocked state instead of premium output"), "Checklist keeps premium output blocked", failures);

check(accessModel.live_auth_enabled === false, "Existing access model still keeps live Auth disabled", failures);
check(accessModel.live_subscription_gate_enabled === false, "Existing access model still keeps subscription gate disabled", failures);
check(dashboardSchema.subscriber_dashboard_enabled === false, "Dashboard schema still scaffold-disabled", failures);
check(stage01c.live_apply_enabled === false, "Stage 01C still keeps migration apply disabled in repo", failures);

const publicJsFiles = [
  "assets/js/submission-client.js",
  "assets/js/site-language.js",
  "assets/js/timezone-context.js",
  "assets/js/sports-context.js",
  "assets/js/seo-runtime.js"
];

for (const file of publicJsFiles) {
  if (!exists(file)) continue;
  const js = read(file);
  check(!js.includes("SERVICE_ROLE"), `${file} does not expose SERVICE_ROLE`, failures);
  check(!js.includes("SUPABASE_SERVICE"), `${file} does not expose SUPABASE_SERVICE`, failures);
  check(!js.includes("service_role"), `${file} does not expose service_role`, failures);
}

console.log("");
console.log("Supabase Auth/Login runbook summary:");
console.log("- Live Auth: disabled");
console.log("- Initial method planned: email OTP/magic link");
console.log("- Redirect URLs: documented");
console.log("- Dashboard gate: planned, not live");
console.log("- Premium guidance/payment/palm/admin: blocked");

if (failures.length) {
  console.log("");
  console.log("Supabase Auth/Login runbook preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Supabase Auth/Login runbook preflight passed.");
