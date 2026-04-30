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

console.log("Drishvara Supabase activation runbook preflight");
console.log("");

const migrationPath = "supabase/migrations/20260430_b20a_subscriber_backend_schema.sql";
const runbookPath = "docs/activation/supabase-migration-activation-runbook.md";
const checklistPath = "docs/activation/supabase-migration-review-checklist.md";
const registryPath = "data/backend/activation/supabase-activation-stage-01.json";
const schemaRegistryPath = "data/backend/supabase-schema-registry.json";

check(exists(migrationPath), "Supabase migration file exists", failures);
check(exists(runbookPath), "Supabase activation runbook exists", failures);
check(exists(checklistPath), "Supabase migration review checklist exists", failures);
check(exists(registryPath), "Supabase activation stage registry exists", failures);
check(exists(schemaRegistryPath), "Supabase schema registry exists", failures);

const migration = read(migrationPath);
const runbook = read(runbookPath);
const checklist = read(checklistPath);
const registry = readJson(registryPath);
const schemaRegistry = readJson(schemaRegistryPath);

const requiredTables = [
  "subscriber_profiles",
  "subscriptions",
  "subscriber_daily_guidance",
  "user_submissions",
  "feedback_submissions",
  "palmistry_requests",
  "knowledge_update_reviews"
];

for (const table of requiredTables) {
  check(migration.includes(`create table if not exists public.${table}`), `Migration creates ${table}`, failures);
  check(migration.includes(`alter table public.${table} enable row level security`), `Migration enables RLS for ${table}`, failures);
  check(registry.tables_to_create.includes(table), `Activation registry lists ${table}`, failures);
}

check(registry.live_apply_enabled === false, "Live apply remains disabled in registry", failures);
check(registry.status === "runbook_only", "Activation stage is runbook-only", failures);
check(registry.blocked_in_this_stage.includes("live_auth_enablement"), "Auth enablement blocked in this stage", failures);
check(registry.blocked_in_this_stage.includes("live_payment_enablement"), "Payment enablement blocked in this stage", failures);
check(registry.blocked_in_this_stage.includes("palm_image_storage_enablement"), "Palm storage enablement blocked in this stage", failures);
check(registry.blocked_in_this_stage.includes("frontend_supabase_insert"), "Frontend Supabase insert blocked in this stage", failures);

check(schemaRegistry.security?.rls_required === true, "Schema registry requires RLS", failures);
check(schemaRegistry.security?.anonymous_public_insert_enabled === false, "Schema registry blocks anonymous public insert", failures);
check(schemaRegistry.security?.palm_image_public_urls_allowed === false, "Schema registry blocks public palm image URLs", failures);

check(runbook.includes("This stage does not apply the migration automatically"), "Runbook says migration is not auto-applied", failures);
check(runbook.includes("Supabase SQL Editor"), "Runbook includes SQL Editor apply option", failures);
check(runbook.includes("supabase db push"), "Runbook includes CLI apply option", failures);
check(runbook.includes("Rollback Approach"), "Runbook includes rollback approach", failures);
check(runbook.includes("Do not apply the migration unless"), "Runbook includes go/no-go guard", failures);

check(checklist.includes("Anonymous insert fails"), "Checklist includes anonymous insert test", failures);
check(checklist.includes("Cross-user select fails"), "Checklist includes cross-user select test", failures);
check(checklist.includes("Palm image public URL constraint works"), "Checklist includes palm URL constraint test", failures);

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
console.log("Supabase activation runbook summary:");
console.log("- Migration file: present");
console.log("- Runbook: present");
console.log("- Checklist: present");
console.log("- Live apply: disabled");
console.log("- Auth/payment/palm/admin/premium: blocked in this stage");

if (failures.length) {
  console.log("");
  console.log("Supabase activation runbook preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Supabase activation runbook preflight passed.");
