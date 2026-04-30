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

console.log("Drishvara Auth environment/redirect preflight");
console.log("");

const checklistPath = "docs/activation/auth-environment-redirect-checklist.md";
const envMapPath = "data/backend/activation/auth-env-variable-map.json";
const registryPath = "data/backend/activation/supabase-auth-stage-02d.json";
const stage02aPath = "data/backend/activation/supabase-auth-stage-02a.json";
const stage02bPath = "data/backend/activation/supabase-auth-stage-02b.json";
const stage02cPath = "data/backend/activation/supabase-auth-stage-02c.json";

check(exists(checklistPath), "Auth environment/redirect checklist exists", failures);
check(exists(envMapPath), "Auth environment variable map exists", failures);
check(exists(registryPath), "Stage 02D registry exists", failures);
check(exists(stage02aPath), "Stage 02A registry exists", failures);
check(exists(stage02bPath), "Stage 02B registry exists", failures);
check(exists(stage02cPath), "Stage 02C registry exists", failures);

const checklist = read(checklistPath);
const envMap = readJson(envMapPath);
const registry = readJson(registryPath);
const stage02a = readJson(stage02aPath);
const stage02b = readJson(stage02bPath);
const stage02c = readJson(stage02cPath);

check(registry.status === "checklist_only", "Stage 02D is checklist-only", failures);
check(registry.live_auth_enabled === false, "Stage 02D keeps live Auth disabled", failures);
check(registry.environment_variables_added === false, "Stage 02D adds no real environment variables", failures);
check(registry.redirect_urls_configured_live === false, "Stage 02D does not configure live redirects", failures);

check(envMap.status === "planning_only", "Environment variable map is planning-only", failures);
check(envMap.live_auth_enabled === false, "Environment variable map keeps live Auth disabled", failures);
check(envMap.allowed_browser_exposed_variables_future.some((item) => item.name === "NEXT_PUBLIC_SUPABASE_URL"), "Future public Supabase URL is mapped", failures);
check(envMap.allowed_browser_exposed_variables_future.some((item) => item.name === "NEXT_PUBLIC_SUPABASE_ANON_KEY"), "Future public anon key is mapped", failures);
check(envMap.blocked_from_frontend.includes("SUPABASE_SERVICE_ROLE_KEY"), "Service role key is blocked from frontend", failures);
check(envMap.blocked_from_frontend.includes("SUPABASE_SECRET_KEY"), "Supabase secret key is blocked from frontend", failures);
check(envMap.blocked_from_frontend.includes("PAYMENT_WEBHOOK_SECRET"), "Payment webhook secret is blocked from frontend", failures);

check(envMap.redirect_urls.local.includes("http://localhost:5173/login.html"), "Local login redirect is mapped", failures);
check(envMap.redirect_urls.local.includes("http://localhost:5173/dashboard.html"), "Local dashboard redirect is mapped", failures);
check(envMap.redirect_urls.production.includes("https://www.drishvara.com/login.html"), "Production login redirect is mapped", failures);
check(envMap.redirect_urls.production.includes("https://www.drishvara.com/dashboard.html"), "Production dashboard redirect is mapped", failures);

check(checklist.includes("NEXT_PUBLIC_SUPABASE_URL"), "Checklist mentions public Supabase URL", failures);
check(checklist.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY"), "Checklist mentions public anon key", failures);
check(checklist.includes("SUPABASE_SERVICE_ROLE_KEY"), "Checklist warns about service role key", failures);
check(checklist.includes("Do not commit `.env.local`"), "Checklist blocks committing .env.local", failures);
check(checklist.includes("Login alone must not unlock premium guidance"), "Checklist blocks login-only premium unlock", failures);
check(checklist.includes("Admin access must not be inferred from email alone"), "Checklist blocks email-only admin inference", failures);

check(registry.blocked_in_this_stage.includes("live_auth_enablement"), "Stage 02D blocks live Auth enablement", failures);
check(registry.blocked_in_this_stage.includes("adding_real_keys_to_repo"), "Stage 02D blocks real keys in repo", failures);
check(registry.blocked_in_this_stage.includes("frontend_supabase_create_client"), "Stage 02D blocks frontend Supabase client", failures);
check(registry.blocked_in_this_stage.includes("live_session_detection"), "Stage 02D blocks live session detection", failures);
check(registry.blocked_in_this_stage.includes("dashboard_data_unlock"), "Stage 02D blocks dashboard data unlock", failures);
check(registry.blocked_in_this_stage.includes("premium_guidance_unlock"), "Stage 02D blocks premium guidance unlock", failures);

check(stage02a.live_auth_enabled === false, "Stage 02A still keeps live Auth disabled", failures);
check(stage02b.live_auth_enabled === false, "Stage 02B still keeps live Auth disabled", failures);
check(stage02b.supabase_client_enabled === false, "Stage 02B still keeps Supabase client disabled", failures);
check(stage02c.live_auth_enabled === false, "Stage 02C still keeps live Auth disabled", failures);
check(stage02c.dashboard_data_unlock_enabled === false, "Stage 02C still keeps dashboard data locked", failures);

const forbiddenSecretFiles = [
  ".env",
  ".env.local",
  ".env.production",
  ".env.development"
];

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
  check(!js.includes("SUPABASE_SERVICE_ROLE_KEY"), `${file} does not expose SUPABASE_SERVICE_ROLE_KEY`, failures);
  check(!js.includes("SERVICE_ROLE"), `${file} does not expose SERVICE_ROLE`, failures);
  check(!js.includes("SUPABASE_SECRET"), `${file} does not expose SUPABASE_SECRET`, failures);
  check(!js.includes("PAYMENT_WEBHOOK_SECRET"), `${file} does not expose PAYMENT_WEBHOOK_SECRET`, failures);
}

console.log("");
console.log("Auth environment/redirect summary:");
console.log("- Live Auth: disabled");
console.log("- Real keys: not added");
console.log("- Redirect URLs: documented");
console.log("- Service role: blocked from frontend");
console.log("- Dashboard/premium guidance: still blocked");

if (failures.length) {
  console.log("");
  console.log("Auth environment/redirect preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Auth environment/redirect preflight passed.");
