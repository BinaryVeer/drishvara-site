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
  console.error(`❌ AG27C validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag27b-backend-decision-audit.json",
  "data/content-intelligence/backend-decision/ag27b-backend-decision-audit.json",
  "data/content-intelligence/backend-decision/ag27b-backend-option-decision-matrix.json",
  "data/content-intelligence/backend-decision/ag27b-supabase-planning-decision-record.json",
  "data/content-intelligence/backend-decision/ag27b-non-activation-audit-register.json",
  "data/content-intelligence/quality-registry/ag27b-supabase-auth-security-rls-plan-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag27b-to-ag27c-supabase-auth-security-rls-plan-boundary.json",
  "data/content-intelligence/backend-decision/ag27a-backend-need-assessment.json",
  "data/content-intelligence/admin-editor/ag26z-manual-admin-editor-workflow-closure.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",
  "data/content-intelligence/backend-decision/ag27-backend-deferral-record.json",
  "data/content-intelligence/mutation-plans/ag27-to-ag28-conditional-backend-path-boundary.json",

  "data/content-intelligence/quality-reviews/ag27c-supabase-auth-security-rls-plan.json",
  "data/content-intelligence/backend-decision/ag27c-supabase-auth-security-rls-plan.json",
  "data/content-intelligence/backend-decision/ag27c-supabase-table-plan.json",
  "data/content-intelligence/backend-decision/ag27c-auth-role-access-model.json",
  "data/content-intelligence/backend-decision/ag27c-rls-policy-plan.json",
  "data/content-intelligence/backend-decision/ag27c-audit-secret-governance-plan.json",
  "data/content-intelligence/backend-decision/ag27c-non-activation-audit-register.json",
  "data/content-intelligence/backend-decision/ag27c-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag27c-supabase-auth-security-rls-plan-blocker-register.json",
  "data/content-intelligence/quality-registry/ag27c-conditional-security-rls-detail-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag27c-to-ag27d-conditional-security-rls-detail-boundary.json",
  "data/quality/ag27c-supabase-auth-security-rls-plan.json",
  "data/quality/ag27c-supabase-auth-security-rls-plan-preview.json",
  "docs/quality/AG27C_SUPABASE_AUTH_SECURITY_RLS_PLAN.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag27c-supabase-auth-security-rls-plan.json");
const plan = readJson("data/content-intelligence/backend-decision/ag27c-supabase-auth-security-rls-plan.json");
const tablePlan = readJson("data/content-intelligence/backend-decision/ag27c-supabase-table-plan.json");
const roleModel = readJson("data/content-intelligence/backend-decision/ag27c-auth-role-access-model.json");
const rlsPlan = readJson("data/content-intelligence/backend-decision/ag27c-rls-policy-plan.json");
const auditSecret = readJson("data/content-intelligence/backend-decision/ag27c-audit-secret-governance-plan.json");
const nonActivation = readJson("data/content-intelligence/backend-decision/ag27c-non-activation-audit-register.json");
const consumption = readJson("data/content-intelligence/backend-decision/ag27c-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag27c-supabase-auth-security-rls-plan-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag27c-conditional-security-rls-detail-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag27c-to-ag27d-conditional-security-rls-detail-boundary.json");
const registry = readJson("data/quality/ag27c-supabase-auth-security-rls-plan.json");
const preview = readJson("data/quality/ag27c-supabase-auth-security-rls-plan-preview.json");

const ag27b = readJson("data/content-intelligence/backend-decision/ag27b-backend-decision-audit.json");
const ag27bReadiness = readJson("data/content-intelligence/quality-registry/ag27b-supabase-auth-security-rls-plan-readiness-record.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const ag27 = readJson("data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json");
const ag27Boundary = readJson("data/content-intelligence/mutation-plans/ag27-to-ag28-conditional-backend-path-boundary.json");
const pkg = readJson("package.json");

if (review.status !== "supabase_auth_security_rls_plan_created_ready_for_conditional_ag27d") fail("Review status mismatch.");
if (plan.status !== "supabase_auth_security_rls_plan_created_ready_for_conditional_ag27d") fail("Plan status mismatch.");
if (plan.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (plan.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (plan.planning_decision.table_planning_created !== true) fail("Table planning missing.");
if (plan.planning_decision.role_access_planning_created !== true) fail("Role planning missing.");
if (plan.planning_decision.rls_policy_planning_created !== true) fail("RLS planning missing.");
if (plan.planning_decision.audit_secret_governance_created !== true) fail("Audit/secret governance missing.");
if (plan.planning_decision.proceed_to_conditional_ag27d !== true) fail("Conditional AG27D must be ready.");
if (plan.planning_decision.backend_activation_approved_now !== false) fail("Backend activation must be false.");
if (plan.planning_decision.supabase_sandbox_activation_approved_now !== false) fail("Supabase sandbox activation must be false.");
if (plan.planning_decision.auth_activation_approved_now !== false) fail("Auth activation must be false.");
if (plan.planning_decision.database_creation_approved_now !== false) fail("Database creation must be false.");
if (plan.planning_decision.rls_policy_application_approved_now !== false) fail("RLS application must be false.");
if (plan.planning_decision.secrets_or_env_setup_approved_now !== false) fail("Secrets/env setup must be false.");
if (plan.planning_decision.ag28_allowed_now !== false) fail("AG28 must remain false.");

for (const flag of [
  "backend_activation_allowed_in_ag27c",
  "supabase_activation_allowed_in_ag27c",
  "auth_activation_allowed_in_ag27c",
  "database_creation_allowed_in_ag27c",
  "table_creation_allowed_in_ag27c",
  "rls_policy_application_allowed_in_ag27c",
  "secret_creation_allowed_in_ag27c",
  "env_var_write_allowed_in_ag27c",
  "server_route_creation_allowed_in_ag27c",
  "deployment_allowed_in_ag27c",
  "public_mutation_allowed_in_ag27c"
]) {
  if (plan[flag] !== false) fail(`${flag} must be false.`);
}

if (tablePlan.status !== "supabase_table_plan_created_no_database_creation") fail("Table plan status mismatch.");
if (tablePlan.table_count !== tablePlan.tables.length) fail("Table count mismatch.");
if (tablePlan.table_count < 10) fail("Expected at least 10 planned backend tables.");
if (tablePlan.sql_generated !== false) fail("SQL must not be generated.");
if (tablePlan.migration_generated !== false) fail("Migration must not be generated.");
if (tablePlan.database_creation_allowed !== false) fail("Database creation must be false.");
for (const t of tablePlan.tables) {
  if (t.create_now !== false) fail(`${t.table_name} must not be created now.`);
}

if (roleModel.status !== "auth_role_access_model_created_no_auth_activation") fail("Role model status mismatch.");
if (roleModel.auth_activation_allowed !== false) fail("Auth activation must be false.");
if (roleModel.login_creation_allowed !== false) fail("Login creation must be false.");
for (const role of ["admin", "editor", "subscriber", "anonymous_public"]) {
  if (!roleModel.roles.some((item) => item.role_code === role)) fail(`Missing role: ${role}`);
}
const editor = roleModel.roles.find((item) => item.role_code === "editor");
if (editor.can_browse_all_articles !== false) fail("Editor global browse must be false.");
if (editor.can_self_assign !== false) fail("Editor self-assign must be false.");
if (editor.can_create_independent_article !== false) fail("Editor independent creation must be false.");
if (editor.can_publish_now !== false) fail("Editor publish must be false.");

if (rlsPlan.status !== "rls_policy_plan_created_no_policy_application") fail("RLS plan status mismatch.");
if (rlsPlan.rls_application_allowed !== false) fail("RLS application must be false.");
if (rlsPlan.policy_sql_generated !== false) fail("RLS SQL must not be generated.");
for (const policyId of ["admin_full_review_scope", "editor_assigned_only_scope", "public_published_read_only_scope", "audit_append_only_scope"]) {
  if (!rlsPlan.policy_groups.some((item) => item.policy_id === policyId)) fail(`Missing RLS policy group: ${policyId}`);
}
for (const policy of rlsPlan.policy_groups) {
  if (policy.apply_now !== false) fail(`${policy.policy_id} must not apply now.`);
}

if (auditSecret.status !== "audit_secret_governance_plan_created_no_secret_storage") fail("Audit/secret plan status mismatch.");
if (auditSecret.secrets_created !== false) fail("Secrets must not be created.");
if (auditSecret.env_vars_written !== false) fail("Env vars must not be written.");
if (!auditSecret.secret_governance_rules.some((rule) => rule.includes("No Supabase key in repository"))) fail("No Supabase key rule missing.");
if (!auditSecret.env_var_names_planned_only.includes("SUPABASE_SERVICE_ROLE_KEY")) fail("Service role env var name planning missing.");

if (nonActivation.status !== "supabase_auth_security_rls_non_activation_audit_passed") fail("Non-activation audit status mismatch.");
if (nonActivation.audit_passed !== true) fail("Non-activation audit must pass.");
for (const check of nonActivation.checks) {
  if (check.passed !== true) fail(`Non-activation check failed: ${check.check_id}`);
}

if (!consumption.future_consumption?.AG27D) fail("AG27D consumption note missing.");
if (!consumption.future_consumption?.AG27Z) fail("AG27Z consumption note missing.");
if (!consumption.future_consumption?.AG28) fail("AG28 note missing.");
if (!consumption.future_consumption?.AG29_to_AG40) fail("AG29-AG40 note missing.");

if (blocker.status !== "supabase_auth_security_rls_plan_operations_blocked_pending_conditional_ag27d") fail("Blocker status mismatch.");
if (readiness.ready_for_ag27d !== true) fail("AG27D readiness missing.");
if (readiness.real_execution_allowed_now !== false) fail("Real execution must remain false.");
if (boundary.next_stage_id !== "AG27D") fail("AG27D boundary missing.");
if (boundary.backend_planning_selected !== true) fail("Boundary must keep backend planning selected.");
if (boundary.backend_activation_deferred !== true) fail("Boundary must defer backend activation.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Boundary must defer Supabase/Auth/backend.");
if (boundary.explicit_approval_required_before_activation !== true) fail("Explicit approval before activation required.");

if (review.summary.supabase_auth_security_rls_plan_created !== true) fail("Review summary missing.");
if (review.summary.table_plan_created !== true) fail("Review table plan missing.");
if (review.summary.role_access_model_created !== true) fail("Review role model missing.");
if (review.summary.rls_policy_plan_created !== true) fail("Review RLS plan missing.");
if (review.summary.audit_secret_governance_plan_created !== true) fail("Review audit/secret plan missing.");
if (review.summary.proceed_to_conditional_ag27d !== true) fail("Review must proceed to conditional AG27D.");
if (review.summary.backend_activation_allowed_now !== false) fail("Backend activation must be false.");
if (review.summary.supabase_activation_allowed_now !== false) fail("Supabase activation must be false.");
if (review.summary.auth_activation_allowed_now !== false) fail("Auth activation must be false.");
if (review.summary.database_creation_allowed_now !== false) fail("Database creation must be false.");
if (review.summary.table_creation_allowed_now !== false) fail("Table creation must be false.");
if (review.summary.rls_policy_application_allowed_now !== false) fail("RLS application must be false.");
if (review.summary.secret_creation_allowed_now !== false) fail("Secrets must be false.");
if (review.summary.env_var_write_allowed_now !== false) fail("Env write must be false.");
if (review.summary.server_route_creation_allowed_now !== false) fail("Server route creation must be false.");
if (review.summary.ag28_allowed_now !== false) fail("AG28 must be false.");
if (review.summary.ready_for_ag27d !== true) fail("Ready for AG27D missing.");

if (ag27b.status !== "backend_decision_audit_created_ready_for_ag27c") fail("AG27B source status mismatch.");
if (ag27b.decision_audit.backend_planning_approved_for_next_stage !== true) fail("AG27B planning approval missing.");
if (ag27bReadiness.ready_for_ag27c !== true) fail("AG27B readiness must allow AG27C.");
if (ag26zRole.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("AG26Z editor assigned-only rule missing.");
if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("AG26Z Admin final clearance missing.");
if (ag27.checkpoint_decision.backend_deferred !== true) fail("AG27 backend deferral must remain true.");
if (ag27.checkpoint_decision.backend_activation_approved !== false) fail("AG27 backend activation must remain unapproved.");
if (ag27Boundary.explicit_approval_required !== true) fail("AG27 boundary explicit approval missing.");

if (registry.status !== "supabase_auth_security_rls_plan_created_ready_for_conditional_ag27d") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.table_plan_created !== 1) fail("Preview must mark table plan created.");
if (preview.role_access_model_created !== 1) fail("Preview must mark role model created.");
if (preview.rls_policy_plan_created !== 1) fail("Preview must mark RLS plan created.");
if (preview.backend_activation_allowed !== 0) fail("Preview must record 0 backend activation.");
if (preview.supabase_activation_allowed !== 0) fail("Preview must record 0 Supabase activation.");
if (preview.auth_activation_allowed !== 0) fail("Preview must record 0 Auth activation.");
if (preview.database_objects_created !== 0) fail("Preview must record 0 database objects.");
if (preview.rls_policies_applied !== 0) fail("Preview must record 0 applied RLS policies.");
if (preview.secrets_created !== 0) fail("Preview must record 0 secrets.");
if (preview.env_vars_written !== 0) fail("Preview must record 0 env writes.");
if (preview.deployment_done !== 0) fail("Preview must record 0 deployment.");
if (preview.public_items !== 0) fail("Preview must record 0 public items.");
if (preview.backend_objects !== 0) fail("Preview must record 0 backend objects.");
if (preview.ag28_allowed_now !== 0) fail("Preview must mark AG28 blocked.");

for (const expectedInput of [
  "data/content-intelligence/backend-decision/ag27b-backend-decision-audit.json",
  "data/content-intelligence/backend-decision/ag27b-supabase-planning-decision-record.json",
  "data/content-intelligence/backend-decision/ag27a-backend-need-assessment.json",
  "data/content-intelligence/admin-editor/ag26z-manual-admin-editor-workflow-closure.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json"
]) {
  if (!plan.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Plan did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (
    k === "supabase_auth_security_rls_plan_created" ||
    k === "table_plan_created" ||
    k === "role_access_model_created" ||
    k === "rls_policy_plan_created" ||
    k === "audit_secret_governance_plan_created"
  ) {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag27c"]) fail("Missing generate:ag27c script.");
if (!pkg.scripts?.["validate:ag27c"]) fail("Missing validate:ag27c script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag27c")) fail("validate:project must include validate:ag27c.");

pass("AG27C Supabase/Auth Security and RLS Plan is present.");
pass("Table, role, RLS, audit and secret-governance planning records are valid.");
pass("Admin final clearance and Editor assigned-only governance are preserved.");
pass("No Supabase/Auth/backend activation, SQL, database, RLS application, secrets, env vars, deployment or public mutation is enabled.");
pass("Conditional AG27D Security/RLS Detail boundary is ready.");
