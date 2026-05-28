import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(p) { return fs.existsSync(path.join(root, p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(path.join(root, p), "utf8")); }
function fail(msg) { console.error(`❌ AG42D validation failed: ${msg}`); process.exit(1); }
function pass(msg) { console.log(`✅ ${msg}`); }

const required = [
  "data/content-intelligence/backend-architecture/ag42c-failed-publish-rollback-dry-run.json",
  "data/content-intelligence/backend-architecture/ag42c-failed-publish-rollback-risk-register.json",
  "data/content-intelligence/backend-architecture/ag42c-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag42c-permission-audit-stress-review-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag42c-to-ag42d-permission-audit-stress-review-boundary.json",
  "data/content-intelligence/backend-architecture/ag42b-route-guard-review-record.json",
  "data/content-intelligence/backend-architecture/ag42b-defect-classification-register.json",
  "data/content-intelligence/backend-architecture/ag41a-role-gate-model.json",
  "data/content-intelligence/backend-architecture/ag41a-audit-rollback-sop.json",
  "data/content-intelligence/backend-architecture/ag41a-security-and-grant-sop.json",

  "data/content-intelligence/quality-reviews/ag42d-permission-audit-stress-review.json",
  "data/content-intelligence/backend-architecture/ag42d-permission-audit-stress-review.json",
  "data/content-intelligence/backend-architecture/ag42d-admin-editor-permission-stress-model.json",
  "data/content-intelligence/backend-architecture/ag42d-direct-url-access-stress-model.json",
  "data/content-intelligence/backend-architecture/ag42d-audit-log-required-field-model.json",
  "data/content-intelligence/backend-architecture/ag42d-role-boundary-exception-register.json",
  "data/content-intelligence/backend-architecture/ag42d-ag42z-closure-readiness-checklist.json",
  "data/content-intelligence/backend-architecture/ag42d-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag42d-permission-audit-stress-review-blocker-register.json",
  "data/content-intelligence/quality-registry/ag42d-dynamic-workflow-hardening-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag42d-to-ag42z-dynamic-workflow-hardening-closure-boundary.json",
  "data/quality/ag42d-permission-audit-stress-review.json",
  "data/quality/ag42d-permission-audit-stress-review-preview.json",
  "docs/quality/AG42D_PERMISSION_AUDIT_STRESS_REVIEW.md",
  "package.json"
];

for (const f of required) if (!exists(f)) fail(`Missing file: ${f}`);

const ag42c = readJson("data/content-intelligence/backend-architecture/ag42c-failed-publish-rollback-dry-run.json");
const ag42cRisk = readJson("data/content-intelligence/backend-architecture/ag42c-failed-publish-rollback-risk-register.json");
const ag42cNoMutation = readJson("data/content-intelligence/backend-architecture/ag42c-no-mutation-audit-register.json");
const ag42cReadiness = readJson("data/content-intelligence/quality-registry/ag42c-permission-audit-stress-review-readiness-record.json");
const ag42cBoundary = readJson("data/content-intelligence/mutation-plans/ag42c-to-ag42d-permission-audit-stress-review-boundary.json");

const stressReview = readJson("data/content-intelligence/backend-architecture/ag42d-permission-audit-stress-review.json");
const permission = readJson("data/content-intelligence/backend-architecture/ag42d-admin-editor-permission-stress-model.json");
const directUrl = readJson("data/content-intelligence/backend-architecture/ag42d-direct-url-access-stress-model.json");
const auditField = readJson("data/content-intelligence/backend-architecture/ag42d-audit-log-required-field-model.json");
const exceptions = readJson("data/content-intelligence/backend-architecture/ag42d-role-boundary-exception-register.json");
const closureChecklist = readJson("data/content-intelligence/backend-architecture/ag42d-ag42z-closure-readiness-checklist.json");
const noMutation = readJson("data/content-intelligence/backend-architecture/ag42d-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag42d-dynamic-workflow-hardening-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag42d-to-ag42z-dynamic-workflow-hardening-closure-boundary.json");
const review = readJson("data/content-intelligence/quality-reviews/ag42d-permission-audit-stress-review.json");
const preview = readJson("data/quality/ag42d-permission-audit-stress-review-preview.json");
const pkg = readJson("package.json");

if (ag42c.status !== "failed_publish_rollback_dry_run_created_ready_for_ag42d_permission_audit_stress_review") fail("AG42C source mismatch.");
if (ag42cNoMutation.audit_passed !== true) fail("AG42C no-mutation audit must pass.");
if (ag42cReadiness.ready_for_ag42d !== true) fail("AG42C readiness must allow AG42D.");
if (ag42cBoundary.next_stage_id !== "AG42D") fail("AG42C boundary must point to AG42D.");
if (ag42cRisk.hard_blocker_count_for_ag42d !== 0) fail("AG42C hard blocker count must be 0.");

if (stressReview.status !== "permission_audit_stress_review_created_ready_for_ag42z_dynamic_workflow_hardening_closure") fail("Stress review status mismatch.");
if (stressReview.stress_decision.permission_audit_stress_review_created !== true) fail("Stress review creation missing.");
if (stressReview.stress_decision.proceed_to_ag42z_dynamic_workflow_hardening_closure !== true) fail("AG42Z readiness missing.");

for (const flag of [
  "first_controlled_batch_execution_approved_now",
  "first_controlled_batch_executed",
  "batch_execution_authorized_now",
  "batch_publish_executed",
  "candidate_selected_for_execution",
  "real_publish_executed",
  "database_write_done",
  "audit_log_write_done",
  "rollback_write_done",
  "public_article_mutated",
  "listing_mutated",
  "article_file_created_or_changed",
  "route_guard_runtime_modified",
  "deployment_done",
  "public_mutation_done",
  "dynamic_publish_runtime_enabled",
  "backend_activation_approved_now",
  "supabase_activation_approved_now",
  "auth_activation_approved_now",
  "service_role_key_recorded",
  "service_role_key_exposed",
  "anon_access_granted",
  "sql_file_created",
  "sql_grants_executed"
]) {
  if (stressReview.stress_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (permission.status !== "admin_editor_permission_stress_model_created_no_runtime_change") fail("Permission stress model status mismatch.");
if (permission.permission_runtime_modified_in_ag42d !== false) fail("Permission runtime must not be modified.");
if (!permission.stress_cases.some((item) => item.case_id === "perm01_editor_cannot_publish")) fail("Editor cannot publish stress case missing.");
if (!permission.stress_cases.some((item) => item.case_id === "perm03_admin_final_clearance")) fail("Admin final clearance stress case missing.");
for (const item of permission.stress_cases) {
  if (item.runtime_test_executed_in_ag42d !== false) fail(`Runtime test must be false: ${item.case_id}`);
  if (item.mutation_done !== false) fail(`Mutation must be false: ${item.case_id}`);
}

if (directUrl.status !== "direct_url_access_stress_model_created_no_route_change") fail("Direct URL model status mismatch.");
if (directUrl.direct_url_runtime_test_executed_in_ag42d !== false) fail("Direct URL runtime test must not execute.");
if (!directUrl.direct_url_stress_cases.some((item) => item.case_id === "url01_editor_opens_admin_dashboard")) fail("Editor direct admin URL case missing.");
for (const item of directUrl.direct_url_stress_cases) {
  if (item.route_guard_modified_in_ag42d !== false) fail(`Route guard modification must be false: ${item.case_id}`);
}

if (auditField.status !== "audit_log_required_field_model_created_no_audit_write") fail("Audit field model status mismatch.");
for (const field of [
  "actor_id",
  "actor_role",
  "action_type",
  "article_id_or_slug",
  "previous_status",
  "new_status",
  "decision_note",
  "timestamp",
  "public_url_verification_status",
  "listing_verification_status",
  "rollback_reference_where_applicable"
]) {
  if (!auditField.required_audit_fields.includes(field)) fail(`Required audit field missing: ${field}`);
}
if (auditField.audit_log_write_done_in_ag42d !== false) fail("Audit log write must not occur.");
for (const action of auditField.action_coverage) {
  if (action.audit_log_write_done_in_ag42d !== false) fail(`Audit write must be false for ${action.action_type}`);
}

if (exceptions.status !== "role_boundary_exception_register_created") fail("Exception register status mismatch.");
if (exceptions.hard_blocker_count_for_ag42z !== 0) fail("Hard blocker count for AG42Z must be 0.");
if (!exceptions.exceptions.some((item) => item.exception_id === "ag42d_e01")) fail("Direct URL carry-forward exception missing.");

if (closureChecklist.ready_for_ag42z !== true) fail("AG42Z closure checklist readiness missing.");
for (const item of closureChecklist.checklist) {
  if (item.complete !== true) fail(`AG42Z checklist item incomplete: ${item.item_id}`);
}

if (noMutation.audit_passed !== true) fail("No-mutation audit must pass.");
for (const check of noMutation.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (readiness.ready_for_ag42z !== true) fail("AG42Z readiness missing.");
if (readiness.next_stage_id !== "AG42Z") fail("Next stage must be AG42Z.");
if (readiness.hard_blocker_count_for_ag42z !== 0) fail("Readiness hard blocker count must be 0.");
if (readiness.first_controlled_dynamic_content_loop_deferred_to_ag56 !== true) fail("AG56 deferral must remain.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain false.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.real_publish_allowed_next !== false) fail("Real publish must remain false.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain false.");
if (readiness.backend_activation_allowed_next !== false) fail("Backend activation must remain false.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG42Z") fail("Boundary must point to AG42Z.");
if (review.summary.ready_for_ag42z !== true) fail("Review AG42Z readiness missing.");
if (review.summary.hard_blocker_count_for_ag42z !== 0) fail("Review hard blocker count must be 0.");
if (preview.ready_for_ag42z !== 1) fail("Preview AG42Z readiness missing.");
if (preview.first_controlled_dynamic_content_loop_deferred_to_ag56 !== 1) fail("Preview AG56 deferral missing.");
if (preview.first_controlled_batch_executed !== 0) fail("Preview first batch execution must be 0.");
if (preview.candidate_selected_for_execution !== 0) fail("Preview candidate selection must be 0.");
if (preview.real_publish_executed !== 0) fail("Preview real publish must be 0.");
if (preview.public_article_mutated !== 0) fail("Preview public article mutation must be 0.");
if (preview.listing_mutated !== 0) fail("Preview listing mutation must be 0.");
if (preview.route_guard_runtime_modified !== 0) fail("Preview route guard runtime modification must be 0.");
if (preview.database_write_done !== 0) fail("Preview DB write must be 0.");
if (preview.audit_log_write_done !== 0) fail("Preview audit-log write must be 0.");
if (preview.rollback_write_done !== 0) fail("Preview rollback write must be 0.");
if (preview.deployment_done !== 0) fail("Preview deployment must be 0.");
if (preview.backend_activation_approved_now !== 0) fail("Preview backend activation must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");

if (!pkg.scripts?.["generate:ag42d"]) fail("Missing generate:ag42d script.");
if (!pkg.scripts?.["validate:ag42d"]) fail("Missing validate:ag42d script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag42d")) fail("validate:project must include validate:ag42d.");

pass("AG42D Admin/Editor Permission and Audit-log Stress Review is present.");
pass("Permission, direct URL, audit-log field and closure readiness models are valid.");
pass("No-mutation audit is valid.");
pass("AG42Z Dynamic Workflow Hardening Closure readiness is valid.");
pass("No permission runtime change, audit-log write, publish, database write, deployment, SQL grant execution or service-role key is recorded.");
