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

console.log("Drishvara Supabase RLS lockdown record preflight");
console.log("");

const recordPath = "docs/security/supabase-rls-lockdown-record-2026-05-02.md";
const policyPlanPath = "docs/security/supabase-public-table-policy-plan.md";
const registryPath = "data/backend/security/supabase-rls-lockdown-2026-05-02.json";

const listSqlPath = "supabase/security/01_list_public_tables_without_rls.sql";
const lockdownSqlPath = "supabase/security/02_enable_rls_for_all_public_tables.sql";
const examplesSqlPath = "supabase/security/03_future_public_read_policy_examples.sql";

[
  recordPath,
  policyPlanPath,
  registryPath,
  listSqlPath,
  lockdownSqlPath,
  examplesSqlPath
].forEach((file) => check(exists(file), `${file} exists`, failures));

const record = read(recordPath);
const policyPlan = read(policyPlanPath);
const registry = readJson(registryPath);
const listSql = read(listSqlPath);
const lockdownSql = read(lockdownSqlPath);
const examplesSql = read(examplesSqlPath);

check(registry.status === "recorded", "RLS lockdown status is recorded", failures);
check(registry.database_action_completed === true, "Registry records database action as completed", failures);
check(registry.broad_public_policies_created === false, "Registry records no broad public policies", failures);
check(registry.anonymous_insert_enabled === false, "Registry records anonymous insert disabled", failures);
check(registry.frontend_supabase_enabled === false, "Registry records frontend Supabase disabled", failures);
check(registry.live_auth_enabled === false, "Registry records live Auth disabled", failures);
check(registry.live_payment_enabled === false, "Registry records payment disabled", failures);
check(registry.dashboard_data_unlocked === false, "Registry records dashboard data locked", failures);
check(registry.palm_image_upload_enabled === false, "Registry records palm upload disabled", failures);
check(registry.admin_backend_actions_enabled === false, "Registry records admin actions disabled", failures);
check(registry.subscriber_guidance_enabled === false, "Registry records subscriber guidance disabled", failures);

check(record.includes("0 rows"), "Record documents expected 0-row verification", failures);
check(record.includes("No broad public read/write policy was created"), "Record states no broad policy was created", failures);
check(record.includes("No anonymous insert policy was created"), "Record states no anonymous insert policy was created", failures);
check(record.includes("Frontend Supabase client remains disabled"), "Record keeps frontend Supabase disabled", failures);

check(policyPlan.includes("Do not create broad policies"), "Policy plan blocks broad policies", failures);
check(policyPlan.includes("Future public read policies should be narrow"), "Policy plan requires narrow read policies", failures);
check(policyPlan.includes("Tables That Must Remain Protected"), "Policy plan lists protected tables", failures);
check(policyPlan.includes("subscriber_profiles"), "Policy plan protects subscriber_profiles", failures);
check(policyPlan.includes("palmistry_requests"), "Policy plan protects palmistry_requests", failures);
check(policyPlan.includes("contributor_submissions"), "Policy plan protects contributor_submissions", failures);
check(policyPlan.includes("app_users"), "Policy plan protects app_users", failures);

check(listSql.includes("rowsecurity = false"), "List SQL checks rowsecurity=false", failures);
check(lockdownSql.includes("alter table public.%I enable row level security"), "Lockdown SQL enables RLS dynamically", failures);
check(lockdownSql.includes("rowsecurity = false"), "Lockdown SQL only targets disabled RLS tables", failures);

check(!examplesSql.split("\n").some((line) => line.trim().startsWith("create policy")), "Future policy examples do not contain active create policy statements", failures);
check(examplesSql.includes("-- create policy"), "Future policy examples remain commented", failures);

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
}

console.log("");
console.log("RLS lockdown record summary:");
console.log("- Supabase alert response: recorded");
console.log("- Expected disabled-RLS tables: 0 rows");
console.log("- Broad public policies: not created");
console.log("- Future public policies: plan-only");
console.log("- Frontend/Auth/payment/admin/premium: still disabled");

if (failures.length) {
  console.log("");
  console.log("Supabase RLS lockdown record preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Supabase RLS lockdown record preflight passed.");
