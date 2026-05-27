import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag35bReview: "data/content-intelligence/quality-reviews/ag35b-supabase-schema-apply.json",
  ag35bPackage: "data/content-intelligence/backend-architecture/ag35b-supabase-schema-apply-package.json",
  ag35bSchemaManifest: "data/content-intelligence/backend-architecture/ag35b-schema-manifest.json",
  ag35bRlsManifest: "data/content-intelligence/backend-architecture/ag35b-rls-manifest.json",
  ag35bManualGuide: "data/content-intelligence/backend-architecture/ag35b-manual-supabase-apply-guide.json",
  ag35bReadiness: "data/content-intelligence/quality-registry/ag35b-auth-role-setup-readiness-record.json",
  ag35bBoundary: "data/content-intelligence/mutation-plans/ag35b-to-ag35c-auth-role-setup-boundary.json",
  ag35aApproval: "data/content-intelligence/backend-architecture/ag35a-explicit-activation-approval.json",
  ag34zClosure: "data/content-intelligence/backend-architecture/ag34z-backend-activation-readiness-closure.json",
  ag26zRoleGovernance: "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",
  sqlFile: "supabase/migrations/20260527_ag35b_drishvara_controlled_schema.sql"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag35b-manual-schema-apply-confirmation.json",
  confirmation: "data/content-intelligence/backend-architecture/ag35b-manual-schema-apply-confirmation.json",
  supabaseResultRecord: "data/content-intelligence/backend-architecture/ag35b-manual-supabase-result-record.json",
  readiness: "data/content-intelligence/quality-registry/ag35b-auth-role-setup-confirmed-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag35b-confirmed-to-ag35c-auth-role-setup-boundary.json",
  registry: "data/quality/ag35b-manual-schema-apply-confirmation.json",
  preview: "data/quality/ag35b-manual-schema-apply-confirmation-preview.json",
  doc: "docs/quality/AG35B_MANUAL_SCHEMA_APPLY_CONFIRMATION.md"
};

function full(p) {
  return path.join(root, p);
}

function exists(p) {
  return fs.existsSync(full(p));
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(full(p), "utf8"));
}

function readText(p) {
  return fs.readFileSync(full(p), "utf8");
}

function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}

function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG35B confirmation input: ${p}`);
}

const records = Object.fromEntries(
  Object.entries(inputs)
    .filter(([key]) => key !== "sqlFile")
    .map(([key, file]) => [key, readJson(file)])
);

const sql = readText(inputs.sqlFile);

if (records.ag35bPackage.status !== "controlled_supabase_schema_apply_package_created_pending_manual_apply") {
  throw new Error("AG35B package status mismatch.");
}
if (records.ag35bReadiness.ready_for_ag35c !== true) throw new Error("AG35B AG35C readiness missing.");
if (records.ag35bBoundary.next_stage_id !== "AG35C") throw new Error("AG35B boundary does not point to AG35C.");
if (records.ag35aApproval.approval_decision.controlled_activation_authorized !== true) {
  throw new Error("AG35A controlled activation approval missing.");
}
if (!sql.includes("create table if not exists public.profiles")) throw new Error("SQL package missing profiles table.");
if (!sql.includes("alter table public.articles enable row level security")) throw new Error("SQL package missing articles RLS.");
if (!sql.includes("articles_select_admin_or_assigned_editor")) throw new Error("SQL package missing editor-assigned policy.");

const blockedState = {
  manual_schema_apply_confirmation_created: true,
  supabase_sql_editor_result_recorded: true,
  schema_apply_confirmed_by_operator: true,
  rls_apply_confirmed_by_operator: true,
  ready_for_ag35c_auth_role_setup: true,

  secrets_recorded: false,
  env_vars_recorded: false,
  service_role_key_recorded: false,
  service_role_key_exposed: false,
  auth_user_created_by_repo: false,
  credential_created_by_repo: false,
  deployment_triggered: false,
  public_mutation_done: false
};

const supabaseResultRecord = {
  module_id: "AG35B",
  title: "Manual Supabase Result Record",
  status: "manual_supabase_schema_apply_result_recorded_success",
  operator_reported_result: "Success. No rows returned",
  apply_surface: "Supabase SQL Editor",
  apply_mode: "manual_operator_run",
  schema_sql_file_applied: inputs.sqlFile,
  compatibility_repair_patch_applied_before_full_sql: true,
  full_ag35b_sql_applied_after_repair_patch: true,
  result_contains_secrets: false,
  result_contains_project_url: false,
  result_contains_credentials: false,
  blocked_state: blockedState
};

const confirmation = {
  module_id: "AG35B",
  title: "Manual Schema Apply Confirmation",
  status: "manual_schema_apply_confirmed_ready_for_ag35c",
  purpose:
    "Record operator confirmation that the AG35B controlled Supabase schema/RLS SQL package was manually run in Supabase SQL Editor and returned Success. No rows returned.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  confirmation_decision: {
    manual_schema_apply_confirmed: true,
    manual_rls_apply_confirmed: true,
    supabase_sql_editor_result_success: true,
    proceed_to_ag35c_auth_role_setup: true,

    secrets_recorded_in_repo: false,
    env_vars_recorded_in_repo: false,
    service_role_key_recorded_in_repo: false,
    service_role_key_exposed: false,
    auth_user_created_by_repo: false,
    credential_created_by_repo: false,
    deployment_done: false,
    public_mutation_done: false
  },
  supabase_result_record_file: outputs.supabaseResultRecord,
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG35B",
  title: "Auth Role Setup Confirmed Readiness Record",
  status: "ready_for_ag35c_auth_role_setup_confirmed_after_manual_schema_apply",
  ready_for_ag35c: true,
  next_stage_id: "AG35C",
  next_stage_title: "Auth Role Setup",
  allowed_ag35c_mode: "controlled_auth_role_setup",
  manual_schema_apply_confirmed: true,
  manual_rls_apply_confirmed: true,
  secrets_required_in_chat_or_repo: false,
  auth_user_creation_allowed_next_under_controlled_stage: true,
  public_mutation_allowed_next: false,
  deployment_allowed_next: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG35B",
  title: "AG35B Confirmed to AG35C Auth Role Setup Boundary",
  status: "ag35c_boundary_confirmed_controlled_auth_role_setup",
  next_stage_id: "AG35C",
  next_stage_title: "Auth Role Setup",
  allowed_scope: [
    "Consume AG35B manual schema apply confirmation.",
    "Create controlled Auth role setup plan.",
    "Prepare Admin and Editor profile-role mapping.",
    "Keep secrets out of repo and chat.",
    "Keep deployment and public mutation blocked."
  ],
  blocked_scope: [
    "No service-role key in repo or chat.",
    "No password in repo or chat.",
    "No deployment.",
    "No public mutation.",
    "No dynamic publish runtime."
  ],
  manual_schema_apply_confirmed: true,
  controlled_activation_selected: true
};

const review = {
  module_id: "AG35B",
  title: "Manual Schema Apply Confirmation",
  status: "manual_schema_apply_confirmed_ready_for_ag35c",
  depends_on: ["AG35B", "AG35A", "AG34Z"],
  generated_from: inputs,
  confirmation_file: outputs.confirmation,
  supabase_result_record_file: outputs.supabaseResultRecord,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    manual_schema_apply_confirmed: true,
    manual_rls_apply_confirmed: true,
    supabase_sql_editor_result_success: true,
    ready_for_ag35c: true,

    secrets_recorded: false,
    env_vars_recorded: false,
    service_role_key_recorded: false,
    service_role_key_exposed: false,
    deployment_done: false,
    public_mutation_done: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG35B",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG35B",
  preview_only: false,
  status: review.status,
  message: "AG35B manual schema apply confirmed. Next: AG35C Auth Role Setup.",
  manual_schema_apply_confirmed: 1,
  manual_rls_apply_confirmed: 1,
  ready_for_ag35c: 1,
  secrets_recorded: 0,
  env_vars_recorded: 0,
  service_role_key_recorded: 0,
  service_role_key_exposed: 0,
  deployment_done: 0,
  public_mutation_done: 0,
  blocked_state: blockedState
};

const doc = `# AG35B — Manual Schema Apply Confirmation

## Confirmation

The AG35B SQL package was manually run in Supabase SQL Editor after the compatibility repair patch.

Reported result:

\`\`\`text
Success. No rows returned
\`\`\`

## Decision

AG35B schema/RLS apply is confirmed and the project is ready for AG35C — Auth Role Setup.

## Boundary

No secrets, project URLs, service-role keys, passwords or environment variables are stored in this repository.

## Next Stage

AG35C — Auth Role Setup.
`;

writeJson(outputs.supabaseResultRecord, supabaseResultRecord);
writeJson(outputs.confirmation, confirmation);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG35B manual schema apply confirmation generated.");
console.log("✅ Supabase SQL Editor result recorded: Success. No rows returned.");
console.log("✅ Ready for AG35C Auth Role Setup.");
console.log("✅ No secrets, env vars, service-role keys, deployment or public mutation recorded.");
