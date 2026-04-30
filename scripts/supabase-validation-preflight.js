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

console.log("Drishvara Supabase validation SQL pack preflight");
console.log("");

const validationSql = "supabase/validation/01_post_migration_validation.sql";
const rlsSql = "supabase/validation/02_rls_manual_smoke_tests.sql";
const rollbackSql = "supabase/validation/99_emergency_test_rollback.sql";
const guide = "docs/activation/supabase-post-apply-validation-guide.md";
const registryPath = "data/backend/activation/supabase-activation-stage-01b.json";
const stage01aRegistryPath = "data/backend/activation/supabase-activation-stage-01.json";

check(exists(validationSql), "Post-migration validation SQL exists", failures);
check(exists(rlsSql), "RLS manual smoke-test SQL exists", failures);
check(exists(rollbackSql), "Emergency test rollback SQL exists", failures);
check(exists(guide), "Post-apply validation guide exists", failures);
check(exists(registryPath), "Stage 01B activation registry exists", failures);
check(exists(stage01aRegistryPath), "Stage 01A registry exists", failures);

const validation = read(validationSql);
const rls = read(rlsSql);
const rollback = read(rollbackSql);
const guideText = read(guide);
const registry = readJson(registryPath);
const stage01aRegistry = readJson(stage01aRegistryPath);

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
  check(validation.includes(table), `Validation SQL checks ${table}`, failures);
  check(rollback.includes(`public.${table}`), `Rollback SQL includes ${table}`, failures);
}

check(validation.includes("information_schema.tables"), "Validation checks table existence", failures);
check(validation.includes("rowsecurity"), "Validation checks RLS enabled state", failures);
check(validation.includes("pg_policies"), "Validation checks policy existence", failures);
check(validation.includes("information_schema.triggers"), "Validation checks triggers", failures);
check(validation.includes("information_schema.table_constraints"), "Validation checks constraints", failures);
check(validation.includes("public_display_allowed"), "Validation checks public display defaults", failures);
check(validation.includes("subscriber_display_allowed"), "Validation checks subscriber display defaults", failures);
check(validation.includes("image_upload_enabled"), "Validation checks palm image upload default", failures);
check(validation.includes("scheduled_day"), "Validation checks Knowledge Vault review day", failures);
check(validation.includes("set_updated_at"), "Validation checks updated_at function", failures);

check(rls.includes("Anonymous insert should fail"), "RLS smoke tests include anonymous insert failure", failures);
check(rls.includes("Authenticated user can insert own user_submissions"), "RLS smoke tests include own insert", failures);
check(rls.includes("cannot read another user's records"), "RLS smoke tests include cross-user isolation", failures);
check(rls.includes("Palmistry request cannot use public URL"), "RLS smoke tests include palm public URL block", failures);

check(rollback.includes("TEST ENVIRONMENT ONLY"), "Rollback SQL is clearly test-only", failures);
check(rollback.includes("drop table if exists public.knowledge_update_reviews cascade"), "Rollback starts with dependent review table", failures);
check(rollback.includes("drop function if exists public.set_updated_at() cascade"), "Rollback drops helper function last", failures);

check(registry.status === "validation_pack_only", "Stage 01B registry is validation-pack-only", failures);
check(registry.live_apply_enabled === false, "Stage 01B live apply remains disabled", failures);
check(registry.blocked_in_this_stage.includes("automatic_migration_apply"), "Stage 01B blocks automatic migration apply", failures);
check(registry.blocked_in_this_stage.includes("frontend_supabase_insert"), "Stage 01B blocks frontend Supabase insert", failures);

check(stage01aRegistry.live_apply_enabled === false, "Stage 01A still keeps live apply disabled", failures);

check(guideText.includes("7 tables must exist"), "Guide states expected table count", failures);
check(guideText.includes("RLS must be enabled"), "Guide requires RLS", failures);
check(guideText.includes("Rollback SQL is for test environment only"), "Guide protects rollback use", failures);

console.log("");
console.log("Supabase validation SQL summary:");
console.log("- Post-migration validation SQL: ready");
console.log("- Manual RLS smoke tests: documented");
console.log("- Emergency rollback SQL: test-only");
console.log("- Live apply: still disabled");

if (failures.length) {
  console.log("");
  console.log("Supabase validation SQL pack preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Supabase validation SQL pack preflight passed.");
