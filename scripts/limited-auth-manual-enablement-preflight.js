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

console.log("Drishvara limited Auth manual enablement runbook preflight");
console.log("");

const required = [
  "docs/activation/limited-auth-manual-enablement-runbook.md",
  "docs/activation/limited-auth-test-record-template.md",
  "data/backend/activation/supabase-auth-stage-02f.json",
  "data/backend/security/supabase-rls-lockdown-2026-05-02.json",
  "data/content/quality/content-governance-status-matrix.json",
  "login.html",
  "dashboard.html",
  "assets/js/auth-client.js",
  "assets/js/session-guard.js"
];

for (const file of required) check(exists(file), `${file} exists`);

const runbook = read("docs/activation/limited-auth-manual-enablement-runbook.md");
const template = read("docs/activation/limited-auth-test-record-template.md");
const registry = json("data/backend/activation/supabase-auth-stage-02f.json");

check(registry.status === "runbook_only", "Stage 02F is runbook-only");
check(registry.live_auth_enabled_from_repo === false, "Live Auth remains disabled from repo");
check(registry.frontend_supabase_client_enabled === false, "Frontend Supabase client remains disabled");
check(registry.session_detection_enabled === false, "Session detection remains disabled");
check(registry.dashboard_data_unlock_enabled === false, "Dashboard data remains locked");
check(registry.premium_guidance_enabled === false, "Premium guidance remains blocked");
check(registry.payment_provider_enabled === false, "Payment remains blocked");
check(registry.palm_image_upload_enabled === false, "Palm upload remains blocked");
check(registry.admin_backend_actions_enabled === false, "Admin actions remain blocked");

check(registry.required_redirect_urls.local.includes("http://localhost:5173/login.html"), "Local login redirect recorded");
check(registry.required_redirect_urls.production.includes("https://www.drishvara.com/login.html"), "Production login redirect recorded");
check(registry.blocked_in_this_stage.includes("frontend_supabase_create_client"), "Frontend Supabase create client blocked");
check(registry.blocked_in_this_stage.includes("premium_guidance_unlock"), "Premium unlock blocked");
check(registry.known_parallel_ui_hotfix_needed.includes("homepage_language_toggle_runtime"), "Homepage language hotfix recorded");

check(runbook.includes("RLS verification returned 0 rows"), "Runbook records RLS 0-row result");
check(runbook.includes("Login is only identity verification"), "Runbook records identity-only login rule");
check(runbook.includes("Public UI Hotfix H01"), "Runbook records H01 next step");
check(template.includes("Premium guidance remains blocked"), "Template confirms premium blocked");
check(template.includes("Admin actions remain blocked"), "Template confirms admin blocked");

for (const file of [".env", ".env.local", ".env.production", ".env.development"]) {
  check(!exists(file), `${file} not present in repo root`);
}

for (const file of [
  "assets/js/auth-client.js",
  "assets/js/session-guard.js",
  "assets/js/submission-client.js",
  "assets/js/site-language.js",
  "assets/js/timezone-context.js",
  "assets/js/sports-context.js",
  "assets/js/seo-runtime.js"
]) {
  if (!exists(file)) continue;
  const source = read(file);
  check(!source.includes("createClient("), `${file} does not instantiate Supabase client`);
  check(!source.includes("supabase.auth"), `${file} does not call supabase.auth`);
  check(!source.includes("signInWithOtp"), `${file} does not call signInWithOtp`);
  check(!source.includes("SERVICE_ROLE"), `${file} does not expose SERVICE_ROLE`);
}

console.log("");
console.log("Limited Auth manual enablement runbook summary:");
console.log("- Stage 02F mode: runbook-only");
console.log("- Frontend Auth: disabled");
console.log("- Dashboard/premium/payment/palm/admin: blocked");
console.log("- H01 homepage language/runtime hotfix: recorded for next step");

if (failures.length) {
  console.log("");
  console.log("Limited Auth manual enablement runbook preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Limited Auth manual enablement runbook preflight passed.");
