import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

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

console.log("Drishvara Supabase schema preflight");
console.log("");

const migrationFile = "supabase/migrations/20260430_b20a_subscriber_backend_schema.sql";
const registryFile = "data/backend/supabase-schema-registry.json";
const planFile = "docs/supabase-backend-plan.md";

check(fs.existsSync(path.join(root, migrationFile)), "B20A migration file exists", failures);
check(fs.existsSync(path.join(root, registryFile)), "Supabase schema registry exists", failures);
check(fs.existsSync(path.join(root, planFile)), "Supabase backend plan exists", failures);

const sql = read(migrationFile);
const registry = readJson(registryFile);

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
  check(sql.includes(`create table if not exists public.${table}`), `${table} table is created`, failures);
  check(sql.includes(`alter table public.${table} enable row level security`), `${table} has RLS enabled`, failures);
  check(registry.tables.includes(table), `${table} is listed in registry`, failures);
}

check(sql.includes("references auth.users(id)"), "Migration references Supabase auth.users", failures);
check(sql.includes("create extension if not exists pgcrypto"), "Migration enables pgcrypto", failures);
check(sql.includes("public.set_updated_at"), "Migration defines updated_at trigger function", failures);

check(sql.includes("consent_personal_guidance"), "Subscriber profile includes personal guidance consent", failures);
check(sql.includes("consent_profile_storage"), "Subscriber profile includes profile storage consent", failures);

check(sql.includes("subscriber_display_allowed boolean not null default false"), "Guidance cache blocks subscriber display by default", failures);
check(sql.includes("public_display_allowed boolean not null default false"), "Guidance cache blocks public display by default", failures);

check(sql.includes("user_submissions_consent_required"), "User submissions require consent", failures);
check(sql.includes("palm_image_consent_required"), "Palm image requests require image consent", failures);
check(sql.includes("palm_image_private_path_only"), "Palm image path blocks public URL", failures);
check(sql.includes("scheduled_day integer not null default 10"), "Knowledge update reviews default to 10th day", failures);
check(sql.includes("scheduled_day = 10"), "Knowledge update reviews enforce day 10", failures);

check(sql.includes('create policy "subscriber_profiles_select_own"'), "Subscriber profile own-select policy exists", failures);
check(sql.includes('create policy "user_submissions_insert_own"'), "User submissions own-insert policy exists", failures);
check(sql.includes('create policy "palmistry_requests_insert_own"'), "Palmistry requests own-insert policy exists", failures);

check(registry.security?.rls_required === true, "Registry requires RLS", failures);
check(registry.security?.anonymous_public_insert_enabled === false, "Registry blocks anonymous public insert", failures);
check(registry.security?.palm_image_public_urls_allowed === false, "Registry blocks public palm image URLs", failures);

console.log("");
console.log("Supabase schema summary:");
console.log(`- Tables: ${requiredTables.length}`);
console.log("- RLS: required");
console.log("- Anonymous backend intake: disabled");
console.log("- Palm image public URLs: blocked");
console.log("- Monthly Knowledge Vault review day: 10");

if (failures.length) {
  console.log("");
  console.log("Supabase schema preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Supabase schema preflight passed.");
