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

console.log("Drishvara controlled Auth enablement checklist preflight");
console.log("");

const checklistPath = "docs/activation/controlled-auth-enablement-checklist.md";
const testTemplatePath = "docs/activation/auth-enablement-test-record-template.md";
const registryPath = "data/backend/activation/supabase-auth-stage-02e.json";

const stage02aPath = "data/backend/activation/supabase-auth-stage-02a.json";
const stage02bPath = "data/backend/activation/supabase-auth-stage-02b.json";
const stage02cPath = "data/backend/activation/supabase-auth-stage-02c.json";
const stage02dPath = "data/backend/activation/supabase-auth-stage-02d.json";
const rlsRecordPath = "data/backend/security/supabase-rls-lockdown-2026-05-02.json";

[
  checklistPath,
  testTemplatePath,
  registryPath,
  stage02aPath,
  stage02bPath,
  stage02cPath,
  stage02dPath,
  rlsRecordPath
].forEach((file) => check(exists(file), `${file} exists`, failures));

const checklist = read(checklistPath);
const testTemplate = read(testTemplatePath);
const registry = readJson(registryPath);
const stage02a = readJson(stage02aPath);
const stage02b = readJson(stage02bPath);
const stage02c = readJson(stage02cPath);
const stage02d = readJson(stage02dPath);
const rlsRecord = readJson(rlsRecordPath);

check(registry.status === "checklist_only", "Stage 02E is checklist-only", failures);
check(registry.live_auth_enabled_from_repo === false, "Stage 02E does not enable Auth from repo", failures);
check(registry.frontend_supabase_client_enabled === false, "Stage 02E keeps frontend Supabase client disabled", failures);
check(registry.session_detection_enabled === false, "Stage 02E keeps session detection disabled", failures);
check(registry.dashboard_data_unlock_enabled === false, "Stage 02E keeps dashboard data locked", failures);
check(registry.subscription_gate_enabled === false, "Stage 02E keeps subscription gate disabled", failures);
check(registry.premium_guidance_enabled === false, "Stage 02E keeps premium guidance disabled", failures);

check(registry.recommended_initial_auth_method === "email_otp_or_magic_link", "Initial Auth method is email OTP/magic link", failures);
check(registry.recommended_signup_policy === "controlled_or_invite_only_initially", "Initial signup policy is controlled/invite-only", failures);

check(registry.required_redirect_urls.local.includes("http://localhost:5173/login.html"), "Registry includes local login redirect", failures);
check(registry.required_redirect_urls.local.includes("http://localhost:5173/dashboard.html"), "Registry includes local dashboard redirect", failures);
check(registry.required_redirect_urls.production.includes("https://www.drishvara.com/login.html"), "Registry includes production login redirect", failures);
check(registry.required_redirect_urls.production.includes("https://www.drishvara.com/dashboard.html"), "Registry includes production dashboard redirect", failures);

check(registry.blocked_in_this_stage.includes("live_auth_enablement_in_code"), "Stage 02E blocks live Auth enablement in code", failures);
check(registry.blocked_in_this_stage.includes("frontend_supabase_create_client"), "Stage 02E blocks frontend Supabase client", failures);
check(registry.blocked_in_this_stage.includes("dashboard_data_unlock"), "Stage 02E blocks dashboard data unlock", failures);
check(registry.blocked_in_this_stage.includes("premium_guidance_unlock"), "Stage 02E blocks premium guidance unlock", failures);
check(registry.blocked_in_this_stage.includes("payment_provider"), "Stage 02E blocks payment provider", failures);
check(registry.blocked_in_this_stage.includes("palm_image_upload"), "Stage 02E blocks palm image upload", failures);
check(registry.blocked_in_this_stage.includes("admin_backend_actions"), "Stage 02E blocks admin backend actions", failures);

check(checklist.includes("This stage does not enable live Auth"), "Checklist states live Auth is not enabled", failures);
check(checklist.includes("Email OTP / Magic Link"), "Checklist includes OTP/magic-link method", failures);
check(checklist.includes("Controlled / invite-only"), "Checklist recommends controlled invite-only initial signup", failures);
check(checklist.includes("http://localhost:5173/login.html"), "Checklist includes local login redirect", failures);
check(checklist.includes("https://www.drishvara.com/login.html"), "Checklist includes production login redirect", failures);
check(checklist.includes("Disable / Rollback Auth Procedure"), "Checklist includes disable/rollback procedure", failures);
check(checklist.includes("Login alone must not unlock premium guidance"), "Checklist blocks login-only premium unlock", failures);
check(checklist.includes("Admin access must not be inferred from email alone"), "Checklist blocks email-only admin inference", failures);
check(checklist.includes("Service role key must never be exposed to frontend"), "Checklist protects service role key", failures);

check(testTemplate.includes("Local Test Result"), "Test template includes local test result section", failures);
check(testTemplate.includes("Production Test Result"), "Test template includes production test result section", failures);
check(testTemplate.includes("Dashboard Gate Result"), "Test template includes dashboard gate result section", failures);
check(testTemplate.includes("Premium guidance not shown"), "Test template verifies premium guidance remains blocked", failures);
check(testTemplate.includes("Stop Confirmation"), "Test template includes stop confirmation", failures);

check(stage02a.live_auth_enabled === false, "Stage 02A still keeps live Auth disabled", failures);
check(stage02b.live_auth_enabled === false, "Stage 02B still keeps live Auth disabled", failures);
check(stage02b.supabase_client_enabled === false, "Stage 02B still keeps Supabase client disabled", failures);
check(stage02c.live_auth_enabled === false, "Stage 02C still keeps live Auth disabled", failures);
check(stage02c.dashboard_data_unlock_enabled === false, "Stage 02C still keeps dashboard data locked", failures);
check(stage02d.live_auth_enabled === false, "Stage 02D still keeps live Auth disabled", failures);
check(rlsRecord.database_action_completed === true, "RLS lockdown record exists before Auth enablement", failures);
check(rlsRecord.frontend_supabase_enabled === false, "RLS record still keeps frontend Supabase disabled", failures);

const forbiddenSecretFiles = [".env", ".env.local", ".env.production", ".env.development"];
for (const file of forbiddenSecretFiles) {
  check(!exists(file), `${file} is not present in repo root`, failures);
}

const publicJsFiles = [
  "assets/js/auth-client.js",
  "assets/js/session-guard.js",
  "assets/js/submission-client.js",
  "assets/js/site-language.js",
  "assets/js/timezone-context.js",
  "assets/js/sports-context.js",
  "assets/js/seo-runtime.js"
];

for (const file of publicJsFiles) {
  if (!exists(file)) continue;
  const js = read(file);
  check(!js.includes("createClient("), `${file} does not instantiate Supabase client`, failures);
  check(!js.includes("supabase.auth"), `${file} does not call supabase.auth`, failures);
  check(!js.includes("SUPABASE_SERVICE_ROLE_KEY"), `${file} does not expose SUPABASE_SERVICE_ROLE_KEY`, failures);
  check(!js.includes("SERVICE_ROLE"), `${file} does not expose SERVICE_ROLE`, failures);
  check(!js.includes("SUPABASE_SECRET"), `${file} does not expose SUPABASE_SECRET`, failures);
}

console.log("");
console.log("Controlled Auth enablement checklist summary:");
console.log("- Auth enablement: checklist-only");
console.log("- Supabase frontend client: disabled");
console.log("- Redirect URLs: documented");
console.log("- Login tests: templated");
console.log("- Premium/payment/palm/admin: still blocked");

if (failures.length) {
  console.log("");
  console.log("Controlled Auth enablement checklist preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Controlled Auth enablement checklist preflight passed.");
