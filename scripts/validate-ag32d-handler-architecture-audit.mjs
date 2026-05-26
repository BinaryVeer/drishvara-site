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
  console.error(`❌ AG32D validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag32c-publish-guard-rules.json",
  "data/content-intelligence/backend-architecture/ag32c-admin-role-guard-model.json",
  "data/content-intelligence/backend-architecture/ag32c-approved-state-hash-guard-model.json",
  "data/content-intelligence/backend-architecture/ag32c-public-filter-audit-rollback-guard-model.json",
  "data/content-intelligence/backend-architecture/ag32c-forbidden-publish-path-guard-register.json",
  "data/content-intelligence/backend-architecture/ag32c-guard-rules-non-activation-audit-register.json",
  "data/content-intelligence/quality-registry/ag32c-handler-architecture-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag32c-to-ag32d-handler-architecture-audit-boundary.json",
  "data/content-intelligence/backend-architecture/ag32b-return-archive-handler-plan.json",
  "data/content-intelligence/backend-architecture/ag32b-return-to-editor-handler-plan.json",
  "data/content-intelligence/backend-architecture/ag32b-archive-handler-plan.json",
  "data/content-intelligence/backend-architecture/ag32b-editor-resubmission-path-model.json",
  "data/content-intelligence/backend-architecture/ag32b-admin-decision-handler-model.json",
  "data/content-intelligence/backend-architecture/ag32b-return-archive-handler-non-activation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag32a-publish-handler-plan.json",
  "data/content-intelligence/backend-architecture/ag32a-publish-handler-precondition-register.json",
  "data/content-intelligence/backend-architecture/ag32a-publish-public-filter-model.json",
  "data/content-intelligence/backend-architecture/ag32a-publish-audit-rollback-requirement.json",
  "data/content-intelligence/backend-architecture/ag32a-publish-handler-non-activation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag31z-queue-integration-closure.json",
  "data/content-intelligence/backend-architecture/ag31z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag31d-state-transition-audit.json",
  "data/content-intelligence/backend-architecture/ag31d-illegal-transition-audit-register.json",
  "data/content-intelligence/backend-architecture/ag31d-admin-approval-gate-audit-register.json",
  "data/content-intelligence/backend-architecture/ag31d-editor-restriction-audit-register.json",
  "data/content-intelligence/backend-architecture/ag31d-publish-path-audit-register.json",
  "data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  "data/content-intelligence/quality-reviews/ag32d-handler-architecture-audit.json",
  "data/content-intelligence/backend-architecture/ag32d-handler-architecture-audit.json",
  "data/content-intelligence/backend-architecture/ag32d-plan-only-handler-audit-register.json",
  "data/content-intelligence/backend-architecture/ag32d-no-runtime-mutation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag32d-guard-compliance-audit-register.json",
  "data/content-intelligence/backend-architecture/ag32d-admin-editor-governance-audit-register.json",
  "data/content-intelligence/backend-architecture/ag32d-handler-architecture-non-activation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag32d-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag32d-handler-architecture-audit-blocker-register.json",
  "data/content-intelligence/quality-registry/ag32d-dynamic-handler-architecture-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag32d-to-ag32z-dynamic-handler-architecture-closure-boundary.json",
  "data/quality/ag32d-handler-architecture-audit.json",
  "data/quality/ag32d-handler-architecture-audit-preview.json",
  "docs/quality/AG32D_HANDLER_ARCHITECTURE_AUDIT.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag32d-handler-architecture-audit.json");
const audit = readJson("data/content-intelligence/backend-architecture/ag32d-handler-architecture-audit.json");
const planOnlyAudit = readJson("data/content-intelligence/backend-architecture/ag32d-plan-only-handler-audit-register.json");
const noRuntimeMutationAudit = readJson("data/content-intelligence/backend-architecture/ag32d-no-runtime-mutation-audit-register.json");
const guardComplianceAudit = readJson("data/content-intelligence/backend-architecture/ag32d-guard-compliance-audit-register.json");
const adminEditorGovernanceAudit = readJson("data/content-intelligence/backend-architecture/ag32d-admin-editor-governance-audit-register.json");
const nonActivation = readJson("data/content-intelligence/backend-architecture/ag32d-handler-architecture-non-activation-audit-register.json");
const consumption = readJson("data/content-intelligence/backend-architecture/ag32d-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag32d-handler-architecture-audit-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag32d-dynamic-handler-architecture-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag32d-to-ag32z-dynamic-handler-architecture-closure-boundary.json");
const registry = readJson("data/quality/ag32d-handler-architecture-audit.json");
const preview = readJson("data/quality/ag32d-handler-architecture-audit-preview.json");

const ag32c = readJson("data/content-intelligence/backend-architecture/ag32c-publish-guard-rules.json");
const ag32cReadiness = readJson("data/content-intelligence/quality-registry/ag32c-handler-architecture-audit-readiness-record.json");
const ag32cNonActivation = readJson("data/content-intelligence/backend-architecture/ag32c-guard-rules-non-activation-audit-register.json");
const ag32b = readJson("data/content-intelligence/backend-architecture/ag32b-return-archive-handler-plan.json");
const ag32bNonActivation = readJson("data/content-intelligence/backend-architecture/ag32b-return-archive-handler-non-activation-audit-register.json");
const ag32a = readJson("data/content-intelligence/backend-architecture/ag32a-publish-handler-plan.json");
const ag32aNonActivation = readJson("data/content-intelligence/backend-architecture/ag32a-publish-handler-non-activation-audit-register.json");
const ag31z = readJson("data/content-intelligence/backend-architecture/ag31z-queue-integration-closure.json");
const ag31zBlocker = readJson("data/content-intelligence/backend-architecture/ag31z-activation-blocker-carry-forward.json");
const ag31d = readJson("data/content-intelligence/backend-architecture/ag31d-state-transition-audit.json");
const ag31dPublish = readJson("data/content-intelligence/backend-architecture/ag31d-publish-path-audit-register.json");
const ag30bAssigned = readJson("data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const pkg = readJson("package.json");

if (review.status !== "handler_architecture_audit_created_ready_for_ag32z") fail("Review status mismatch.");
if (audit.status !== "handler_architecture_audit_created_ready_for_ag32z") fail("Audit status mismatch.");
if (audit.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (audit.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (audit.audit_decision.non_active_handler_architecture_audit_created !== true) fail("Audit decision missing.");
if (audit.audit_decision.plan_only_handler_audit_passed !== true) fail("Plan-only audit must pass.");
if (audit.audit_decision.no_runtime_mutation_audit_passed !== true) fail("No-runtime mutation audit must pass.");
if (audit.audit_decision.guard_compliance_audit_passed !== true) fail("Guard compliance audit must pass.");
if (audit.audit_decision.admin_editor_governance_audit_passed !== true) fail("Admin/Editor governance audit must pass.");
if (audit.audit_decision.non_activation_audit_passed !== true) fail("Non-activation audit must pass.");
if (audit.audit_decision.all_audits_passed !== true) fail("All audits must pass.");
if (audit.audit_decision.proceed_to_ag32z_dynamic_handler_architecture_closure !== true) fail("AG32Z readiness missing.");

for (const flag of [
  "publish_handler_runtime_approved_now",
  "return_handler_runtime_approved_now",
  "archive_handler_runtime_approved_now",
  "publish_guard_runtime_approved_now",
  "route_guard_runtime_approved_now",
  "public_filter_runtime_approved_now",
  "audit_runtime_approved_now",
  "hash_runtime_approved_now",
  "rollback_runtime_approved_now",
  "database_creation_approved_now",
  "migration_generation_approved_now",
  "sql_generation_approved_now",
  "rls_policy_application_approved_now",
  "auth_activation_approved_now",
  "backend_connection_approved_now",
  "supabase_connection_approved_now",
  "server_route_creation_approved_now",
  "api_route_creation_approved_now",
  "secret_creation_approved_now",
  "env_var_write_approved_now",
  "deployment_approved_now",
  "public_mutation_approved_now"
]) {
  if (audit.audit_decision[flag] !== false) fail(`${flag} must be false.`);
}

for (const flag of [
  "publish_handler_runtime_allowed_in_ag32d",
  "return_handler_runtime_allowed_in_ag32d",
  "archive_handler_runtime_allowed_in_ag32d",
  "publish_guard_runtime_allowed_in_ag32d",
  "route_guard_runtime_allowed_in_ag32d",
  "public_filter_runtime_allowed_in_ag32d",
  "audit_runtime_allowed_in_ag32d",
  "hash_runtime_allowed_in_ag32d",
  "rollback_runtime_allowed_in_ag32d",
  "database_creation_allowed_in_ag32d",
  "migration_generation_allowed_in_ag32d",
  "sql_generation_allowed_in_ag32d",
  "rls_policy_application_allowed_in_ag32d",
  "auth_activation_allowed_in_ag32d",
  "backend_connection_allowed_in_ag32d",
  "supabase_connection_allowed_in_ag32d",
  "server_route_creation_allowed_in_ag32d",
  "api_route_creation_allowed_in_ag32d",
  "secret_creation_allowed_in_ag32d",
  "env_var_write_allowed_in_ag32d",
  "deployment_allowed_in_ag32d",
  "public_mutation_allowed_in_ag32d"
]) {
  if (audit[flag] !== false) fail(`${flag} must be false.`);
}

for (const item of [planOnlyAudit, noRuntimeMutationAudit, guardComplianceAudit, adminEditorGovernanceAudit, nonActivation]) {
  if (item.audit_passed !== true) fail(`${item.title} must pass.`);
  for (const check of item.checks) {
    if (check.passed !== true) fail(`${item.title} check failed: ${check.check_id}`);
  }
}

if (!consumption.future_consumption?.AG32Z) fail("AG32Z consumption note missing.");
if (!consumption.future_consumption?.AG33) fail("AG33 consumption note missing.");
if (!consumption.future_consumption?.AG34) fail("AG34 consumption note missing.");
if (!consumption.future_consumption?.AG35_and_later) fail("AG35/later consumption note missing.");

if (blocker.status !== "handler_architecture_audit_operations_blocked_pending_ag32z") fail("Blocker status mismatch.");
if (readiness.ready_for_ag32z !== true) fail("AG32Z readiness missing.");
if (readiness.allowed_ag32z_mode !== "non_active_dynamic_handler_architecture_closure_only") fail("AG32Z mode mismatch.");
if (readiness.real_execution_allowed_now !== false) fail("Real execution must be false.");
if (readiness.handler_runtime_allowed_now !== false) fail("Handler runtime must be false.");
if (readiness.guard_runtime_allowed_now !== false) fail("Guard runtime must be false.");
if (readiness.public_mutation_allowed_now !== false) fail("Public mutation must be false.");
if (readiness.auth_activation_allowed_now !== false) fail("Auth activation must be false.");
if (readiness.backend_activation_allowed_now !== false) fail("Backend activation must be false.");
if (readiness.supabase_auth_backend_activation_allowed_now !== false) fail("Supabase/Auth/backend activation must be false.");

if (boundary.next_stage_id !== "AG32Z") fail("Boundary must point to AG32Z.");
if (boundary.status !== "ag32z_boundary_created_non_active_dynamic_handler_architecture_closure_only") fail("Boundary status mismatch.");
if (boundary.backend_planning_selected !== true) fail("Backend planning must be selected.");
if (boundary.backend_activation_deferred !== true) fail("Backend activation must be deferred.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must be deferred.");
if (boundary.explicit_approval_required_before_real_activation !== true) fail("Explicit approval before real activation required.");

if (review.summary.handler_architecture_audit_created !== true) fail("Review summary missing.");
if (review.summary.non_active_handler_architecture_audit_only !== true) fail("Non-active audit summary missing.");
if (review.summary.all_audits_passed !== true) fail("All audits summary must pass.");
if (review.summary.ready_for_ag32z !== true) fail("AG32Z readiness summary missing.");

for (const flag of [
  "publish_handler_runtime_allowed_now",
  "return_handler_runtime_allowed_now",
  "archive_handler_runtime_allowed_now",
  "publish_guard_runtime_allowed_now",
  "route_guard_runtime_allowed_now",
  "public_filter_runtime_allowed_now",
  "audit_runtime_allowed_now",
  "hash_runtime_allowed_now",
  "rollback_runtime_allowed_now",
  "database_creation_allowed_now",
  "migration_generation_allowed_now",
  "sql_generation_allowed_now",
  "rls_policy_application_allowed_now",
  "auth_activation_allowed_now",
  "backend_connection_allowed_now",
  "supabase_connection_allowed_now",
  "server_route_creation_allowed_now",
  "api_route_creation_allowed_now",
  "secret_creation_allowed_now",
  "env_var_write_allowed_now",
  "deployment_done",
  "public_mutation_done",
  "real_execution_done"
]) {
  if (review.summary[flag] !== false) fail(`${flag} must be false.`);
}

if (ag32c.status !== "publish_guard_rules_created_ready_for_ag32d") fail("AG32C source status mismatch.");
if (ag32cReadiness.ready_for_ag32d !== true) fail("AG32C readiness must allow AG32D.");
if (ag32cNonActivation.audit_passed !== true) fail("AG32C non-activation audit must pass.");
if (ag32b.status !== "return_archive_handler_plan_created_ready_for_ag32c") fail("AG32B source status mismatch.");
if (ag32bNonActivation.audit_passed !== true) fail("AG32B non-activation audit must pass.");
if (ag32a.status !== "publish_handler_plan_created_ready_for_ag32b") fail("AG32A source status mismatch.");
if (ag32aNonActivation.audit_passed !== true) fail("AG32A non-activation audit must pass.");
if (ag31z.status !== "queue_integration_closure_created_ready_for_ag32") fail("AG31Z source status mismatch.");
for (const [key, value] of Object.entries(ag31zBlocker.blocked_activation_items)) {
  if (value !== false) fail(`AG31Z activation blocker must remain false: ${key}`);
}
if (ag31d.audit_decision.all_audits_passed !== true) fail("AG31D all audits must pass.");
if (ag31dPublish.audit_passed !== true) fail("AG31D publish path audit must pass.");
if (ag30bAssigned.editor_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Assigned-only source missing.");
if (ag30bAssigned.editor_rules.editor_cannot_publish !== true) fail("Editor no-publish source missing.");
if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");
if (ag26zRole.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only missing.");
if (ag26zRole.role_rules.editor_cannot_publish !== true) fail("Editor cannot publish missing.");

if (registry.status !== "handler_architecture_audit_created_ready_for_ag32z") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.handler_architecture_audit_created !== 1) fail("Preview audit missing.");
if (preview.plan_only_handler_audit_passed !== 1) fail("Preview plan-only audit missing.");
if (preview.no_runtime_mutation_audit_passed !== 1) fail("Preview no-runtime audit missing.");
if (preview.guard_compliance_audit_passed !== 1) fail("Preview guard compliance audit missing.");
if (preview.admin_editor_governance_audit_passed !== 1) fail("Preview governance audit missing.");
if (preview.publish_handler_runtime_created !== 0) fail("Preview publish runtime must be 0.");
if (preview.return_handler_runtime_created !== 0) fail("Preview return runtime must be 0.");
if (preview.archive_handler_runtime_created !== 0) fail("Preview archive runtime must be 0.");
if (preview.publish_guard_runtime_created !== 0) fail("Preview guard runtime must be 0.");
if (preview.route_guard_runtime_created !== 0) fail("Preview route guard runtime must be 0.");
if (preview.public_filter_runtime_created !== 0) fail("Preview public filter runtime must be 0.");
if (preview.audit_runtime_created !== 0) fail("Preview audit runtime must be 0.");
if (preview.hash_runtime_created !== 0) fail("Preview hash runtime must be 0.");
if (preview.rollback_runtime_created !== 0) fail("Preview rollback runtime must be 0.");
if (preview.database_objects_created !== 0) fail("Preview database objects must be 0.");
if (preview.migrations_generated !== 0) fail("Preview migrations must be 0.");
if (preview.sql_generated !== 0) fail("Preview SQL must be 0.");
if (preview.rls_policies_applied !== 0) fail("Preview RLS policies must be 0.");
if (preview.auth_enabled !== 0) fail("Preview Auth must be 0.");
if (preview.backend_connection_enabled !== 0) fail("Preview backend connection must be 0.");
if (preview.supabase_connection_enabled !== 0) fail("Preview Supabase connection must be 0.");
if (preview.secrets_created !== 0) fail("Preview secrets must be 0.");
if (preview.env_vars_written !== 0) fail("Preview env writes must be 0.");
if (preview.server_routes_created !== 0) fail("Preview server routes must be 0.");
if (preview.api_routes_created !== 0) fail("Preview API routes must be 0.");
if (preview.deployment_done !== 0) fail("Preview deployment must be 0.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");

for (const expectedInput of [
  "data/content-intelligence/backend-architecture/ag32c-publish-guard-rules.json",
  "data/content-intelligence/backend-architecture/ag32b-return-archive-handler-plan.json",
  "data/content-intelligence/backend-architecture/ag32a-publish-handler-plan.json",
  "data/content-intelligence/backend-architecture/ag31z-queue-integration-closure.json",
  "data/content-intelligence/backend-architecture/ag31d-state-transition-audit.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
]) {
  if (!audit.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Audit did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (
    k === "handler_architecture_audit_created" ||
    k === "plan_only_handler_audit_created" ||
    k === "no_runtime_mutation_audit_created" ||
    k === "guard_compliance_audit_created" ||
    k === "admin_editor_governance_audit_created" ||
    k === "handler_architecture_non_activation_audit_created"
  ) {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag32d"]) fail("Missing generate:ag32d script.");
if (!pkg.scripts?.["validate:ag32d"]) fail("Missing validate:ag32d script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag32d")) fail("validate:project must include validate:ag32d.");

pass("AG32D Handler Architecture Audit is present.");
pass("Plan-only, no-runtime-mutation, guard compliance and Admin/Editor governance audits are valid.");
pass("Handlers and guards are confirmed non-active and cannot execute.");
pass("No handler runtime, guard runtime, database, Auth/backend/Supabase activation, secrets, deployment or public mutation is enabled.");
pass("AG32Z Dynamic Handler Architecture Closure boundary is ready.");
