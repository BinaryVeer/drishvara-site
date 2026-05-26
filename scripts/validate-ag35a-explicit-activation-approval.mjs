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
  console.error(`❌ AG35A validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

function allFalse(obj) {
  return Object.values(obj || {}).every((value) => value === false);
}

const required = [
  "data/content-intelligence/backend-architecture/ag34z-backend-activation-readiness-closure.json",
  "data/content-intelligence/backend-architecture/ag34z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag34z-ag35-explicit-activation-approval-handoff-plan.json",
  "data/content-intelligence/quality-registry/ag34z-ag35-explicit-activation-approval-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag34z-to-ag35a-explicit-activation-approval-boundary.json",
  "data/content-intelligence/backend-architecture/ag34d-backend-readiness-audit.json",
  "data/content-intelligence/backend-architecture/ag33z-dynamic-publish-scaffold-closure.json",
  "data/content-intelligence/backend-architecture/ag33z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag29z-schema-rls-closure.json",
  "data/content-intelligence/backend-architecture/ag28-backend-auth-architecture-blueprint.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  "data/content-intelligence/quality-reviews/ag35a-explicit-activation-approval.json",
  "data/content-intelligence/backend-architecture/ag35a-explicit-activation-approval.json",
  "data/content-intelligence/backend-architecture/ag35a-controlled-activation-decision-record.json",
  "data/content-intelligence/backend-architecture/ag35a-activation-risk-acknowledgement-record.json",
  "data/content-intelligence/backend-architecture/ag35a-controlled-activation-control-plan.json",
  "data/content-intelligence/backend-architecture/ag35a-approval-non-execution-audit-register.json",
  "data/content-intelligence/backend-architecture/ag35a-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag35a-controlled-activation-blocker-register.json",
  "data/content-intelligence/quality-registry/ag35a-supabase-schema-apply-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag35a-to-ag35b-supabase-schema-apply-boundary.json",
  "data/quality/ag35a-explicit-activation-approval.json",
  "data/quality/ag35a-explicit-activation-approval-preview.json",
  "docs/quality/AG35A_EXPLICIT_ACTIVATION_APPROVAL.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag35a-explicit-activation-approval.json");
const approval = readJson("data/content-intelligence/backend-architecture/ag35a-explicit-activation-approval.json");
const decision = readJson("data/content-intelligence/backend-architecture/ag35a-controlled-activation-decision-record.json");
const risk = readJson("data/content-intelligence/backend-architecture/ag35a-activation-risk-acknowledgement-record.json");
const control = readJson("data/content-intelligence/backend-architecture/ag35a-controlled-activation-control-plan.json");
const nonExecution = readJson("data/content-intelligence/backend-architecture/ag35a-approval-non-execution-audit-register.json");
const consumption = readJson("data/content-intelligence/backend-architecture/ag35a-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag35a-controlled-activation-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag35a-supabase-schema-apply-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag35a-to-ag35b-supabase-schema-apply-boundary.json");
const registry = readJson("data/quality/ag35a-explicit-activation-approval.json");
const preview = readJson("data/quality/ag35a-explicit-activation-approval-preview.json");

const ag34z = readJson("data/content-intelligence/backend-architecture/ag34z-backend-activation-readiness-closure.json");
const ag34zReadiness = readJson("data/content-intelligence/quality-registry/ag34z-ag35-explicit-activation-approval-readiness-record.json");
const ag34zBlocker = readJson("data/content-intelligence/backend-architecture/ag34z-activation-blocker-carry-forward.json");
const ag34zBoundary = readJson("data/content-intelligence/mutation-plans/ag34z-to-ag35a-explicit-activation-approval-boundary.json");
const ag34d = readJson("data/content-intelligence/backend-architecture/ag34d-backend-readiness-audit.json");
const ag33zBlocker = readJson("data/content-intelligence/backend-architecture/ag33z-activation-blocker-carry-forward.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const pkg = readJson("package.json");

if (review.status !== "explicit_activation_approval_recorded_ready_for_ag35b") fail("Review status mismatch.");
if (approval.status !== "explicit_activation_approval_recorded_ready_for_ag35b") fail("Approval status mismatch.");
if (approval.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (approval.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (approval.approval_decision.explicit_user_approval_received !== true) fail("Explicit approval must be recorded.");
if (approval.approval_decision.controlled_activation_authorized !== true) fail("Controlled activation must be authorized.");
if (approval.approval_decision.proceed_to_ag35b_supabase_schema_apply !== true) fail("AG35B readiness missing.");

for (const flag of [
  "supabase_project_created_in_ag35a",
  "supabase_connected_in_ag35a",
  "auth_enabled_in_ag35a",
  "database_created_in_ag35a",
  "database_write_done_in_ag35a",
  "sql_generated_in_ag35a",
  "sql_applied_in_ag35a",
  "migration_generated_in_ag35a",
  "migration_applied_in_ag35a",
  "rls_policy_created_in_ag35a",
  "rls_policy_applied_in_ag35a",
  "secrets_created_in_ag35a",
  "env_vars_written_in_ag35a",
  "service_role_key_created_in_ag35a",
  "service_role_key_exposed_in_ag35a",
  "user_created_in_ag35a",
  "credential_created_in_ag35a",
  "server_route_created_in_ag35a",
  "api_route_created_in_ag35a",
  "runtime_handler_created_in_ag35a",
  "github_write_done_in_ag35a",
  "deployment_done_in_ag35a",
  "public_mutation_done_in_ag35a"
]) {
  if (approval.approval_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (decision.explicit_user_approval_received !== true) fail("Decision approval missing.");
if (decision.approved_activation_mode !== "controlled_staged_activation") fail("Activation mode mismatch.");
if (decision.approved_next_stage !== "AG35B — Supabase Schema Apply") fail("Approved next stage mismatch.");

if (!Array.isArray(risk.acknowledged_risk_domains) || risk.acknowledged_risk_domains.length < 4) fail("Risk acknowledgement incomplete.");
if (!control.control_sequence.includes("AG35B — Supabase Schema Apply")) fail("Control sequence missing AG35B.");

if (nonExecution.audit_passed !== true) fail("Non-execution audit must pass.");
for (const check of nonExecution.checks) {
  if (check.passed !== true) fail(`Non-execution check failed: ${check.check_id}`);
}

for (const key of ["AG35B", "AG35C", "AG35D", "AG35Z", "AG36"]) {
  if (!consumption.future_consumption?.[key]) fail(`${key} consumption note missing.`);
}

if (readiness.ready_for_ag35b !== true) fail("AG35B readiness missing.");
if (readiness.allowed_ag35b_mode !== "controlled_supabase_schema_apply") fail("AG35B mode mismatch.");
if (readiness.explicit_user_approval_received !== true) fail("Readiness approval missing.");
if (readiness.controlled_activation_authorized !== true) fail("Controlled activation readiness missing.");
if (readiness.schema_apply_allowed_next !== true) fail("Schema apply next must be allowed.");

for (const flag of [
  "auth_activation_allowed_now",
  "user_creation_allowed_now",
  "credential_creation_allowed_now",
  "secret_write_allowed_now",
  "public_mutation_allowed_now",
  "deployment_allowed_now"
]) {
  if (readiness[flag] !== false) fail(`${flag} must be false.`);
}

if (boundary.next_stage_id !== "AG35B") fail("Boundary must point to AG35B.");
if (boundary.status !== "ag35b_boundary_created_controlled_supabase_schema_apply") fail("Boundary status mismatch.");
if (boundary.explicit_approval_received !== true) fail("Boundary must record approval.");
if (boundary.controlled_activation_selected !== true) fail("Boundary must record controlled activation.");

if (ag34z.status !== "backend_activation_readiness_closure_created_ready_for_ag35a") fail("AG34Z source status mismatch.");
if (ag34zReadiness.ready_for_ag35a !== true) fail("AG34Z readiness must allow AG35A.");
if (ag34zReadiness.explicit_user_approval_required_next !== true) fail("AG34Z explicit approval requirement missing.");
if (ag34zBoundary.next_stage_id !== "AG35A") fail("AG34Z boundary must point to AG35A.");
if (ag34d.audit_decision.all_audits_passed !== true) fail("AG34D audits must pass.");
if (!allFalse(ag34zBlocker.blocked_activation_items)) fail("AG34Z blockers must remain false before AG35A.");
if (!allFalse(ag33zBlocker.blocked_activation_items)) fail("AG33Z blockers must remain false before AG35A.");

if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");
if (ag26zRole.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only missing.");
if (ag26zRole.role_rules.editor_cannot_publish !== true) fail("Editor cannot publish missing.");

if (registry.status !== "explicit_activation_approval_recorded_ready_for_ag35b") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.explicit_activation_approval_recorded !== 1) fail("Preview approval missing.");
if (preview.controlled_activation_authorized !== 1) fail("Preview controlled activation missing.");
if (preview.ready_for_ag35b !== 1) fail("Preview AG35B readiness missing.");

for (const zeroField of [
  "supabase_project_created",
  "supabase_connected",
  "auth_enabled",
  "user_created",
  "credential_created",
  "database_objects_created",
  "database_write_done",
  "sql_generated",
  "sql_applied",
  "migrations_generated",
  "migrations_applied",
  "rls_policies_created",
  "rls_policies_applied",
  "secrets_created",
  "env_vars_written",
  "service_role_key_created",
  "service_role_key_exposed",
  "server_routes_created",
  "api_routes_created",
  "github_write_done",
  "deployment_done",
  "public_mutation_done"
]) {
  if (preview[zeroField] !== 0) fail(`Preview ${zeroField} must be 0.`);
}

for (const expectedInput of [
  "data/content-intelligence/backend-architecture/ag34z-backend-activation-readiness-closure.json",
  "data/content-intelligence/backend-architecture/ag34z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag34z-ag35-explicit-activation-approval-handoff-plan.json",
  "data/content-intelligence/backend-architecture/ag29z-schema-rls-closure.json",
  "data/content-intelligence/backend-architecture/ag28-backend-auth-architecture-blueprint.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
]) {
  if (!approval.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Approval did not consume expected input: ${expectedInput}`);
  }
}

if (!pkg.scripts?.["generate:ag35a"]) fail("Missing generate:ag35a script.");
if (!pkg.scripts?.["validate:ag35a"]) fail("Missing validate:ag35a script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag35a")) fail("validate:project must include validate:ag35a.");

pass("AG35A Explicit Activation Approval is present.");
pass("Controlled activation approval is recorded.");
pass("AG35B Supabase Schema Apply boundary is ready.");
pass("No Supabase/Auth/backend activation, database, RLS, secrets, accounts, deployment or public mutation is executed in AG35A.");
