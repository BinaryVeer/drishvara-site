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
  console.error(`❌ AG29Z validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag29a-supabase-schema-draft.json",
  "data/content-intelligence/backend-architecture/ag29a-schema-entity-register.json",
  "data/content-intelligence/backend-architecture/ag29a-table-relationship-map.json",
  "data/content-intelligence/backend-architecture/ag29b-rls-policy-plan.json",
  "data/content-intelligence/backend-architecture/ag29b-role-scope-policy-register.json",
  "data/content-intelligence/backend-architecture/ag29b-table-rls-rule-map.json",
  "data/content-intelligence/backend-architecture/ag29c-secret-governance-plan.json",
  "data/content-intelligence/backend-architecture/ag29c-secret-boundary-register.json",
  "data/content-intelligence/backend-architecture/ag29c-service-role-safety-plan.json",
  "data/content-intelligence/backend-architecture/ag29d-schema-rls-security-audit.json",
  "data/content-intelligence/backend-architecture/ag29d-schema-security-audit-register.json",
  "data/content-intelligence/backend-architecture/ag29d-rls-security-audit-register.json",
  "data/content-intelligence/backend-architecture/ag29d-secret-safety-audit-register.json",
  "data/content-intelligence/backend-architecture/ag29d-role-separation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag29d-non-activation-audit-register.json",
  "data/content-intelligence/quality-registry/ag29d-schema-rls-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag29d-to-ag29z-schema-rls-closure-boundary.json",
  "data/content-intelligence/backend-architecture/ag28-backend-auth-architecture-blueprint.json",
  "data/content-intelligence/backend-decision/ag27z-backend-decision-closure.json",
  "data/content-intelligence/backend-decision/ag27z-backend-activation-deferral-register.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  "data/content-intelligence/quality-reviews/ag29z-schema-rls-closure.json",
  "data/content-intelligence/backend-architecture/ag29z-schema-rls-closure.json",
  "data/content-intelligence/backend-architecture/ag29z-ag29-detailed-source-chain-register.json",
  "data/content-intelligence/backend-architecture/ag29z-non-active-schema-rls-planning-closure-register.json",
  "data/content-intelligence/backend-architecture/ag29z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag29z-ag30-login-route-scaffold-handoff-plan.json",
  "data/content-intelligence/backend-architecture/ag29z-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag29z-schema-rls-closure-blocker-register.json",
  "data/content-intelligence/quality-registry/ag29z-ag30-login-route-scaffold-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag29z-to-ag30-login-route-scaffold-boundary.json",
  "data/quality/ag29z-schema-rls-closure.json",
  "data/quality/ag29z-schema-rls-closure-preview.json",
  "docs/quality/AG29Z_SCHEMA_RLS_CLOSURE.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag29z-schema-rls-closure.json");
const closure = readJson("data/content-intelligence/backend-architecture/ag29z-schema-rls-closure.json");
const sourceChain = readJson("data/content-intelligence/backend-architecture/ag29z-ag29-detailed-source-chain-register.json");
const planningClosure = readJson("data/content-intelligence/backend-architecture/ag29z-non-active-schema-rls-planning-closure-register.json");
const activationBlocker = readJson("data/content-intelligence/backend-architecture/ag29z-activation-blocker-carry-forward.json");
const ag30Handoff = readJson("data/content-intelligence/backend-architecture/ag29z-ag30-login-route-scaffold-handoff-plan.json");
const consumption = readJson("data/content-intelligence/backend-architecture/ag29z-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag29z-schema-rls-closure-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag29z-ag30-login-route-scaffold-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag29z-to-ag30-login-route-scaffold-boundary.json");
const registry = readJson("data/quality/ag29z-schema-rls-closure.json");
const preview = readJson("data/quality/ag29z-schema-rls-closure-preview.json");

const ag29a = readJson("data/content-intelligence/backend-architecture/ag29a-supabase-schema-draft.json");
const ag29b = readJson("data/content-intelligence/backend-architecture/ag29b-rls-policy-plan.json");
const ag29c = readJson("data/content-intelligence/backend-architecture/ag29c-secret-governance-plan.json");
const ag29d = readJson("data/content-intelligence/backend-architecture/ag29d-schema-rls-security-audit.json");
const ag29dReadiness = readJson("data/content-intelligence/quality-registry/ag29d-schema-rls-closure-readiness-record.json");
const ag27zDeferral = readJson("data/content-intelligence/backend-decision/ag27z-backend-activation-deferral-register.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const pkg = readJson("package.json");

if (review.status !== "schema_rls_closure_created_ready_for_ag30") fail("Review status mismatch.");
if (closure.status !== "schema_rls_closure_created_ready_for_ag30") fail("Closure status mismatch.");
if (closure.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (closure.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (closure.closure_decision.ag29_detailed_chain_closed !== true) fail("AG29 detailed chain must be closed.");
if (closure.closure_decision.non_active_schema_rls_security_planning_closed !== true) fail("Non-active schema/RLS planning must be closed.");
if (closure.closure_decision.ag30_ready_for_non_active_login_route_scaffold !== true) fail("AG30 readiness missing.");

for (const flag of [
  "backend_activation_approved",
  "supabase_activation_approved",
  "auth_activation_approved",
  "sql_generation_approved",
  "migration_generation_approved",
  "database_creation_approved",
  "rls_policy_creation_approved",
  "rls_policy_application_approved",
  "secret_creation_approved",
  "env_var_write_approved",
  "server_route_creation_approved",
  "api_route_creation_approved",
  "deployment_approved",
  "public_mutation_approved"
]) {
  if (closure.closure_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (sourceChain.chain_length !== 4) fail("Source chain length must be 4.");
for (const stage of ["AG29A", "AG29B", "AG29C", "AG29D"]) {
  if (!sourceChain.closed_chain.some((item) => item.stage_id === stage)) fail(`Missing closed stage ${stage}.`);
}

if (planningClosure.status !== "non_active_schema_rls_planning_closed_ready_for_ag30") fail("Planning closure status mismatch.");
if (planningClosure.closure_points.ag30_login_route_scaffold_can_continue !== true) fail("AG30 continuation missing.");
if (planningClosure.closure_points.real_activation_still_blocked !== true) fail("Real activation must remain blocked.");
if (planningClosure.closure_points.schema_security_audit_passed !== true) fail("Schema audit passed missing.");
if (planningClosure.closure_points.rls_security_audit_passed !== true) fail("RLS audit passed missing.");
if (planningClosure.closure_points.secret_safety_audit_passed !== true) fail("Secret audit passed missing.");
if (planningClosure.closure_points.role_separation_audit_passed !== true) fail("Role audit passed missing.");

for (const [key, value] of Object.entries(activationBlocker.blocked_activation_items)) {
  if (value !== false) fail(`${key} must remain false.`);
}
if (activationBlocker.future_unlock_requirements.length < 6) fail("Future unlock requirements incomplete.");

if (ag30Handoff.status !== "ag30_non_active_login_route_scaffold_handoff_created") fail("AG30 handoff status mismatch.");
if (ag30Handoff.ag30_ready !== true) fail("AG30 handoff readiness missing.");
if (ag30Handoff.ag30_activation_allowed !== false) fail("AG30 activation must be false.");
if (!ag30Handoff.ag30_allowed_scope.includes("Create non-active Admin/Editor login UI scaffold.")) fail("AG30 login UI scaffold scope missing.");
if (!ag30Handoff.ag30_blocked_scope.includes("No Auth activation.")) fail("AG30 Auth activation blocker missing.");

if (!consumption.future_consumption?.AG30) fail("AG30 consumption note missing.");
if (!consumption.future_consumption?.AG31) fail("AG31 consumption note missing.");
if (!consumption.future_consumption?.AG32_to_AG34) fail("AG32-AG34 note missing.");
if (!consumption.future_consumption?.AG35_and_later) fail("AG35/later note missing.");

if (blocker.status !== "schema_rls_closure_runtime_operations_blocked") fail("Blocker status mismatch.");
if (readiness.ready_for_ag30 !== true) fail("AG30 readiness missing.");
if (readiness.allowed_ag30_mode !== "non_active_login_route_scaffold_only") fail("AG30 mode mismatch.");
if (readiness.real_execution_allowed_now !== false) fail("Real execution must be false.");
if (readiness.backend_activation_allowed_now !== false) fail("Backend activation must be false.");
if (readiness.supabase_auth_backend_activation_allowed_now !== false) fail("Supabase/Auth/backend activation must be false.");

if (boundary.next_stage_id !== "AG30") fail("Boundary must point to AG30.");
if (boundary.status !== "ag30_boundary_created_non_active_login_route_scaffold_only") fail("Boundary status mismatch.");
if (boundary.backend_planning_selected !== true) fail("Backend planning must be selected.");
if (boundary.backend_activation_deferred !== true) fail("Backend activation must be deferred.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must be deferred.");
if (boundary.explicit_approval_required_before_real_activation !== true) fail("Explicit approval before real activation required.");

if (review.summary.schema_rls_closure_created !== true) fail("Review summary missing.");
if (review.summary.ag29_detailed_chain_closed !== true) fail("AG29 closure summary missing.");
if (review.summary.detailed_stages_closed !== 4) fail("Detailed stages closed must be 4.");
if (review.summary.ready_for_ag30 !== true) fail("Ready for AG30 missing.");

for (const flag of [
  "backend_activation_allowed_now",
  "supabase_activation_allowed_now",
  "auth_activation_allowed_now",
  "sql_generation_allowed_now",
  "migration_generation_allowed_now",
  "database_creation_allowed_now",
  "rls_policy_creation_allowed_now",
  "rls_policy_application_allowed_now",
  "secret_creation_allowed_now",
  "env_var_write_allowed_now",
  "server_route_creation_allowed_now",
  "api_route_creation_allowed_now",
  "deployment_done",
  "public_mutation_done",
  "real_execution_done"
]) {
  if (review.summary[flag] !== false) fail(`${flag} must be false.`);
}

if (ag29a.status !== "supabase_schema_draft_created_ready_for_ag29b") fail("AG29A source status mismatch.");
if (ag29b.status !== "rls_policy_plan_created_ready_for_ag29c") fail("AG29B source status mismatch.");
if (ag29c.status !== "secret_governance_plan_created_ready_for_ag29d") fail("AG29C source status mismatch.");
if (ag29d.status !== "schema_rls_security_audit_created_ready_for_ag29z") fail("AG29D source status mismatch.");
if (ag29d.audit_decision.all_audits_passed !== true) fail("AG29D all audits must pass.");
if (ag29dReadiness.ready_for_ag29z !== true) fail("AG29D readiness must allow AG29Z.");

for (const [key, value] of Object.entries(ag27zDeferral.deferral_decision)) {
  if (value !== false) fail(`AG27Z deferral must remain false: ${key}`);
}
if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");
if (ag26zRole.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only missing.");
if (ag26zRole.role_rules.editor_cannot_publish !== true) fail("Editor cannot publish missing.");

if (registry.status !== "schema_rls_closure_created_ready_for_ag30") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.ag29_detailed_chain_closed !== 1) fail("Preview AG29 chain closed missing.");
if (preview.ready_for_ag30 !== 1) fail("Preview AG30 readiness missing.");
if (preview.backend_activation_allowed !== 0) fail("Preview must record 0 backend activation.");
if (preview.supabase_activation_allowed !== 0) fail("Preview must record 0 Supabase activation.");
if (preview.auth_enabled !== 0) fail("Preview must record 0 Auth.");
if (preview.sql_generated !== 0) fail("Preview must record 0 SQL.");
if (preview.migrations_generated !== 0) fail("Preview must record 0 migrations.");
if (preview.database_objects_created !== 0) fail("Preview must record 0 database objects.");
if (preview.rls_policies_created !== 0) fail("Preview must record 0 RLS policy creation.");
if (preview.rls_policies_applied !== 0) fail("Preview must record 0 RLS policy application.");
if (preview.secrets_created !== 0) fail("Preview must record 0 secrets.");
if (preview.env_vars_written !== 0) fail("Preview must record 0 env writes.");
if (preview.server_routes_created !== 0) fail("Preview must record 0 server routes.");
if (preview.api_routes_created !== 0) fail("Preview must record 0 API routes.");
if (preview.deployment_done !== 0) fail("Preview must record 0 deployment.");
if (preview.public_items !== 0) fail("Preview must record 0 public items.");
if (preview.backend_objects !== 0) fail("Preview must record 0 backend objects.");

for (const expectedInput of [
  "data/content-intelligence/backend-architecture/ag29a-supabase-schema-draft.json",
  "data/content-intelligence/backend-architecture/ag29b-rls-policy-plan.json",
  "data/content-intelligence/backend-architecture/ag29c-secret-governance-plan.json",
  "data/content-intelligence/backend-architecture/ag29d-schema-rls-security-audit.json",
  "data/content-intelligence/backend-architecture/ag28-backend-auth-architecture-blueprint.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
]) {
  if (!closure.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Closure did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (
    k === "schema_rls_closure_created" ||
    k === "ag29_detailed_chain_closed" ||
    k === "non_active_schema_rls_planning_closed" ||
    k === "ag30_non_active_login_route_scaffold_allowed"
  ) {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag29z"]) fail("Missing generate:ag29z script.");
if (!pkg.scripts?.["validate:ag29z"]) fail("Missing validate:ag29z script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag29z")) fail("validate:project must include validate:ag29z.");

pass("AG29Z Schema/RLS Closure is present.");
pass("AG29A-AG29D detailed schema/RLS/security chain is closed.");
pass("AG30 non-active Admin/Editor Login UI and Route Scaffold boundary is ready.");
pass("Admin final clearance and Editor assigned-only/no-publish governance are preserved.");
pass("No Supabase/Auth/backend activation, SQL, database, RLS, secrets, routes, deployment or public mutation is enabled.");
