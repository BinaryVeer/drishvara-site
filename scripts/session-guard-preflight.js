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

console.log("Drishvara session guard/dashboard gate scaffold preflight");
console.log("");

const sessionPath = "assets/js/session-guard.js";
const dashboardPath = "dashboard.html";
const registryPath = "data/backend/activation/supabase-auth-stage-02c.json";
const planPath = "docs/activation/session-guard-dashboard-gate-plan.md";
const stage02aPath = "data/backend/activation/supabase-auth-stage-02a.json";
const stage02bPath = "data/backend/activation/supabase-auth-stage-02b.json";
const dashboardSchemaPath = "data/backend/subscriber-dashboard-schema.json";

check(exists(sessionPath), "Session guard script exists", failures);
check(exists(dashboardPath), "Dashboard page exists", failures);
check(exists(registryPath), "Stage 02C registry exists", failures);
check(exists(planPath), "Session guard plan exists", failures);
check(exists(stage02aPath), "Stage 02A registry exists", failures);
check(exists(stage02bPath), "Stage 02B registry exists", failures);
check(exists(dashboardSchemaPath), "Dashboard schema exists", failures);

const session = read(sessionPath);
const dashboard = read(dashboardPath);
const registry = readJson(registryPath);
const stage02a = readJson(stage02aPath);
const stage02b = readJson(stage02bPath);
const dashboardSchema = readJson(dashboardSchemaPath);
const plan = read(planPath);

check(dashboard.includes("assets/js/session-guard.js"), "Dashboard loads session guard", failures);
check(dashboard.includes("data-session-guard-panel"), "Dashboard has session guard mount", failures);

check(session.includes("LIVE_AUTH_ENABLED = false"), "Session guard keeps live Auth disabled", failures);
check(session.includes("SESSION_GUARD_ENABLED = false"), "Session guard keeps session guard disabled", failures);
check(session.includes("DASHBOARD_DATA_UNLOCK_ENABLED = false"), "Session guard keeps dashboard data unlock disabled", failures);
check(session.includes("SUBSCRIPTION_GATE_ENABLED = false"), "Session guard keeps subscription gate disabled", failures);
check(session.includes("PREMIUM_GUIDANCE_ENABLED = false"), "Session guard keeps premium guidance disabled", failures);
check(session.includes("ADMIN_GATE_ENABLED = false"), "Session guard keeps admin gate disabled", failures);
check(session.includes("window.DrishvaraSessionGuard"), "Session guard exposes scaffold state", failures);
check(session.includes("drishvara:languagechange"), "Session guard responds to language changes", failures);
check(session.includes("सेशन गार्ड"), "Session guard includes Hindi copy", failures);

check(!session.includes("createClient("), "Session guard does not instantiate Supabase", failures);
check(!session.includes("@supabase"), "Session guard does not import Supabase package", failures);
check(!session.includes("getSession("), "Session guard does not call getSession()", failures);
check(!session.includes(".getSession("), "Session guard does not call Supabase getSession", failures);
check(!session.includes("supabase.auth"), "Session guard does not call supabase.auth", failures);
check(!session.includes(".from("), "Session guard does not query database", failures);
check(!session.includes("SERVICE_ROLE"), "Session guard does not expose SERVICE_ROLE", failures);
check(!session.includes("SUPABASE_SERVICE"), "Session guard does not expose SUPABASE_SERVICE", failures);
check(!session.includes("service_role"), "Session guard does not expose service_role", failures);

check(registry.status === "scaffold_only", "Stage 02C registry is scaffold-only", failures);
check(registry.live_auth_enabled === false, "Stage 02C keeps live Auth disabled", failures);
check(registry.session_guard_enabled === false, "Stage 02C keeps session guard disabled", failures);
check(registry.dashboard_data_unlock_enabled === false, "Stage 02C keeps dashboard data unlock disabled", failures);
check(registry.subscription_gate_enabled === false, "Stage 02C keeps subscription gate disabled", failures);
check(registry.premium_guidance_enabled === false, "Stage 02C keeps premium guidance disabled", failures);
check(registry.admin_gate_enabled === false, "Stage 02C keeps admin gate disabled", failures);

check(registry.blocked_in_this_stage.includes("get_live_session"), "Stage 02C blocks live session access", failures);
check(registry.blocked_in_this_stage.includes("read_profile_data"), "Stage 02C blocks profile reads", failures);
check(registry.blocked_in_this_stage.includes("read_subscription_data"), "Stage 02C blocks subscription reads", failures);
check(registry.blocked_in_this_stage.includes("unlock_dashboard_data"), "Stage 02C blocks dashboard data unlock", failures);
check(registry.blocked_in_this_stage.includes("unlock_premium_guidance"), "Stage 02C blocks premium guidance unlock", failures);

check(stage02a.live_auth_enabled === false, "Stage 02A still keeps live Auth disabled", failures);
check(stage02b.live_auth_enabled === false, "Stage 02B still keeps live Auth disabled", failures);
check(stage02b.supabase_client_enabled === false, "Stage 02B still keeps Supabase client disabled", failures);
check(dashboardSchema.subscriber_dashboard_enabled === false, "Dashboard schema remains disabled", failures);

check(plan.includes("does not enable live Supabase Auth"), "Plan states live Auth remains disabled", failures);
check(plan.includes("Admin access must not be inferred from email alone"), "Plan blocks email-only admin inference", failures);

console.log("");
console.log("Session guard/dashboard gate summary:");
console.log("- Session guard: scaffolded");
console.log("- Live Auth/session detection: disabled");
console.log("- Dashboard data unlock: disabled");
console.log("- Premium guidance: blocked");
console.log("- Supabase client/database queries: absent");

if (failures.length) {
  console.log("");
  console.log("Session guard/dashboard gate preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Session guard/dashboard gate preflight passed.");
