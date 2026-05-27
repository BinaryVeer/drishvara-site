import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(p) {
  return fs.existsSync(path.join(root, p));
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
}

function fail(msg) {
  console.error(`❌ AG35B manual confirmation validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag35b-supabase-schema-apply-package.json",
  "data/content-intelligence/backend-architecture/ag35b-schema-manifest.json",
  "data/content-intelligence/backend-architecture/ag35b-rls-manifest.json",
  "data/content-intelligence/backend-architecture/ag35b-manual-supabase-apply-guide.json",
  "data/content-intelligence/quality-registry/ag35b-auth-role-setup-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag35b-to-ag35c-auth-role-setup-boundary.json",
  "supabase/migrations/20260527_ag35b_drishvara_controlled_schema.sql",

  "data/content-intelligence/quality-reviews/ag35b-manual-schema-apply-confirmation.json",
  "data/content-intelligence/backend-architecture/ag35b-manual-schema-apply-confirmation.json",
  "data/content-intelligence/backend-architecture/ag35b-manual-supabase-result-record.json",
  "data/content-intelligence/quality-registry/ag35b-auth-role-setup-confirmed-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag35b-confirmed-to-ag35c-auth-role-setup-boundary.json",
  "data/quality/ag35b-manual-schema-apply-confirmation.json",
  "data/quality/ag35b-manual-schema-apply-confirmation-preview.json",
  "docs/quality/AG35B_MANUAL_SCHEMA_APPLY_CONFIRMATION.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const confirmation = readJson("data/content-intelligence/backend-architecture/ag35b-manual-schema-apply-confirmation.json");
const result = readJson("data/content-intelligence/backend-architecture/ag35b-manual-supabase-result-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag35b-auth-role-setup-confirmed-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag35b-confirmed-to-ag35c-auth-role-setup-boundary.json");
const review = readJson("data/content-intelligence/quality-reviews/ag35b-manual-schema-apply-confirmation.json");
const preview = readJson("data/quality/ag35b-manual-schema-apply-confirmation-preview.json");
const pkg = readJson("package.json");

if (confirmation.status !== "manual_schema_apply_confirmed_ready_for_ag35c") fail("Confirmation status mismatch.");
if (confirmation.confirmation_decision.manual_schema_apply_confirmed !== true) fail("Manual schema apply must be confirmed.");
if (confirmation.confirmation_decision.manual_rls_apply_confirmed !== true) fail("Manual RLS apply must be confirmed.");
if (confirmation.confirmation_decision.supabase_sql_editor_result_success !== true) fail("Supabase success result missing.");
if (confirmation.confirmation_decision.proceed_to_ag35c_auth_role_setup !== true) fail("AG35C readiness missing.");

for (const flag of [
  "secrets_recorded_in_repo",
  "env_vars_recorded_in_repo",
  "service_role_key_recorded_in_repo",
  "service_role_key_exposed",
  "auth_user_created_by_repo",
  "credential_created_by_repo",
  "deployment_done",
  "public_mutation_done"
]) {
  if (confirmation.confirmation_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (result.operator_reported_result !== "Success. No rows returned") fail("Supabase result text mismatch.");
if (result.full_ag35b_sql_applied_after_repair_patch !== true) fail("Full AG35B SQL apply confirmation missing.");
if (result.result_contains_secrets !== false) fail("Result must not contain secrets.");
if (result.result_contains_project_url !== false) fail("Result must not contain project URL.");
if (result.result_contains_credentials !== false) fail("Result must not contain credentials.");

if (readiness.ready_for_ag35c !== true) fail("AG35C confirmed readiness missing.");
if (readiness.allowed_ag35c_mode !== "controlled_auth_role_setup") fail("AG35C mode mismatch.");
if (readiness.manual_schema_apply_confirmed !== true) fail("Manual schema apply readiness missing.");
if (readiness.manual_rls_apply_confirmed !== true) fail("Manual RLS readiness missing.");
if (readiness.secrets_required_in_chat_or_repo !== false) fail("Secrets must not be required in chat/repo.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain false.");

if (boundary.next_stage_id !== "AG35C") fail("Boundary must point to AG35C.");
if (boundary.manual_schema_apply_confirmed !== true) fail("Boundary manual apply confirmation missing.");
if (boundary.controlled_activation_selected !== true) fail("Boundary controlled activation missing.");

if (review.summary.ready_for_ag35c !== true) fail("Review AG35C readiness missing.");
if (preview.ready_for_ag35c !== 1) fail("Preview AG35C readiness missing.");
if (preview.service_role_key_exposed !== 0) fail("Preview service role exposure must be 0.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");

if (!pkg.scripts?.["generate:ag35b-confirm"]) fail("Missing generate:ag35b-confirm script.");
if (!pkg.scripts?.["validate:ag35b-confirm"]) fail("Missing validate:ag35b-confirm script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag35b-confirm")) {
  fail("validate:project must include validate:ag35b-confirm.");
}

pass("AG35B manual schema apply confirmation is present.");
pass("Supabase result is recorded without secrets.");
pass("AG35C Auth Role Setup confirmed readiness is valid.");
pass("No service-role key, env vars, deployment or public mutation is recorded.");
