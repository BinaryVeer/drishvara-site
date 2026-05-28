import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(p) { return fs.existsSync(path.join(root, p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(path.join(root, p), "utf8")); }
function fail(msg) { console.error(`❌ AG42B validation failed: ${msg}`); process.exit(1); }
function pass(msg) { console.log(`✅ ${msg}`); }

const required = [
  "data/content-intelligence/backend-architecture/ag42a-roadmap-reconciliation-existing-logic-gate.json",
  "data/content-intelligence/backend-architecture/ag42a-existing-logic-consumption-register.json",
  "data/content-intelligence/backend-architecture/ag42a-ag41z-boundary-supersession-record.json",
  "data/content-intelligence/backend-architecture/ag42a-no-duplicate-audit-rulebook.json",
  "data/content-intelligence/backend-architecture/ag42a-delta-hardening-entry-plan.json",
  "data/content-intelligence/quality-registry/ag42a-workflow-defect-review-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag42a-to-ag42b-workflow-defect-review-boundary.json",

  "data/content-intelligence/quality-reviews/ag42b-workflow-defect-review.json",
  "data/content-intelligence/backend-architecture/ag42b-workflow-defect-review.json",
  "data/content-intelligence/backend-architecture/ag42b-workflow-surface-inventory.json",
  "data/content-intelligence/backend-architecture/ag42b-route-guard-review-record.json",
  "data/content-intelligence/backend-architecture/ag42b-workflow-hardening-backlog.json",
  "data/content-intelligence/backend-architecture/ag42b-defect-classification-register.json",
  "data/content-intelligence/backend-architecture/ag42b-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag42b-workflow-defect-review-blocker-register.json",
  "data/content-intelligence/quality-registry/ag42b-failed-publish-rollback-dry-run-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag42b-to-ag42c-failed-publish-rollback-dry-run-boundary.json",
  "data/quality/ag42b-workflow-defect-review.json",
  "data/quality/ag42b-workflow-defect-review-preview.json",
  "docs/quality/AG42B_WORKFLOW_DEFECT_REVIEW.md",
  "package.json"
];

for (const f of required) if (!exists(f)) fail(`Missing file: ${f}`);

const ag42aGate = readJson("data/content-intelligence/backend-architecture/ag42a-roadmap-reconciliation-existing-logic-gate.json");
const ag42aSupersession = readJson("data/content-intelligence/backend-architecture/ag42a-ag41z-boundary-supersession-record.json");
const ag42aReadiness = readJson("data/content-intelligence/quality-registry/ag42a-workflow-defect-review-readiness-record.json");
const ag42aBoundary = readJson("data/content-intelligence/mutation-plans/ag42a-to-ag42b-workflow-defect-review-boundary.json");

const defectReview = readJson("data/content-intelligence/backend-architecture/ag42b-workflow-defect-review.json");
const surfaceInventory = readJson("data/content-intelligence/backend-architecture/ag42b-workflow-surface-inventory.json");
const routeGuard = readJson("data/content-intelligence/backend-architecture/ag42b-route-guard-review-record.json");
const backlog = readJson("data/content-intelligence/backend-architecture/ag42b-workflow-hardening-backlog.json");
const classification = readJson("data/content-intelligence/backend-architecture/ag42b-defect-classification-register.json");
const noMutation = readJson("data/content-intelligence/backend-architecture/ag42b-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag42b-failed-publish-rollback-dry-run-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag42b-to-ag42c-failed-publish-rollback-dry-run-boundary.json");
const review = readJson("data/content-intelligence/quality-reviews/ag42b-workflow-defect-review.json");
const preview = readJson("data/quality/ag42b-workflow-defect-review-preview.json");
const pkg = readJson("package.json");

if (ag42aGate.status !== "roadmap_reconciliation_existing_logic_gate_created_ready_for_ag42b") fail("AG42A source mismatch.");
if (ag42aReadiness.ready_for_ag42b !== true) fail("AG42A readiness must allow AG42B.");
if (ag42aBoundary.next_stage_id !== "AG42B") fail("AG42A boundary must point to AG42B.");
if (ag42aSupersession.supersession_decision.first_controlled_dynamic_content_loop_deferred_to_ag56 !== true) fail("AG42A AG56 deferral missing.");

if (defectReview.status !== "workflow_defect_review_created_ready_for_ag42c_failed_publish_rollback_dry_run") fail("Defect review status mismatch.");
if (defectReview.review_decision.workflow_defect_review_created !== true) fail("Workflow defect review creation missing.");
if (defectReview.review_decision.proceed_to_ag42c_failed_publish_rollback_dry_run !== true) fail("AG42C readiness missing.");

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
  if (defectReview.review_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (surfaceInventory.status !== "workflow_surface_inventory_created") fail("Surface inventory status mismatch.");
if (!Array.isArray(surfaceInventory.inspected_surfaces)) fail("Surface inventory must have inspected surfaces.");
for (const surface of ["admin_login", "editor_login", "admin_dashboard", "editor_dashboard"]) {
  if (!surfaceInventory.inspected_surfaces.some((item) => item.surface_id === surface)) {
    fail(`Surface inventory missing ${surface}`);
  }
}
if (surfaceInventory.core_surface_summary.service_role_signal_count !== 0) {
  const unsafeEntries = (surfaceInventory.inspected_surfaces || []).filter((item) => item.service_role_exposure_signal === true);
  if (unsafeEntries.length > 0) {
    fail(`Unsafe service-role exposure signal found in inspected surfaces: ${unsafeEntries.map((item) => item.path).join(", ")}`);
  }
}

if (routeGuard.status !== "route_guard_review_created_no_runtime_change") fail("Route guard review status mismatch.");
if (!routeGuard.route_guard_review.some((item) => item.check_id === "editor_no_publish_guard")) fail("Editor no-publish guard review missing.");
if (!routeGuard.route_guard_review.some((item) => item.check_id === "admin_final_clearance_guard")) fail("Admin final clearance guard review missing.");
if (routeGuard.route_guard_runtime_modified !== false) fail("Route guard runtime must not be modified.");

if (classification.status !== "defect_classification_register_created") fail("Defect classification status mismatch.");
if (!classification.defect_categories.includes("rollback_gap")) fail("Rollback gap category missing.");
if (!classification.defect_categories.includes("audit_log_gap")) fail("Audit log gap category missing.");
if (classification.hard_blocker_count_for_ag42c !== 0) fail("Hard blocker count for AG42C must be 0.");

if (backlog.status !== "workflow_hardening_backlog_created_ready_for_ag42c") fail("Hardening backlog status mismatch.");
if (!backlog.ag42c_candidate_items.includes("ag42b_h01")) fail("AG42C failed publish backlog item missing.");
if (!backlog.ag42c_candidate_items.includes("ag42b_h02")) fail("AG42C rollback backlog item missing.");
for (const item of backlog.backlog_items) {
  const mutationKey = Object.keys(item).find((key) => key.startsWith("mutation_allowed_in_"));
  if (mutationKey && item[mutationKey] !== false) fail(`Backlog item mutation must be false: ${item.item_id}`);
}

if (noMutation.audit_passed !== true) fail("No-mutation audit must pass.");
for (const check of noMutation.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (readiness.ready_for_ag42c !== true) fail("AG42C readiness missing.");
if (readiness.next_stage_id !== "AG42C") fail("Next stage must be AG42C.");
if (readiness.first_controlled_dynamic_content_loop_deferred_to_ag56 !== true) fail("AG56 deferral must remain.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain false.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.real_publish_allowed_next !== false) fail("Real publish must remain false.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain false.");
if (readiness.backend_activation_allowed_next !== false) fail("Backend activation must remain false.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG42C") fail("Boundary must point to AG42C.");
if (review.summary.ready_for_ag42c !== true) fail("Review AG42C readiness missing.");
if (review.summary.hard_blocker_count_for_ag42c !== 0) fail("Review hard blocker count must be 0.");
if (preview.ready_for_ag42c !== 1) fail("Preview AG42C readiness missing.");
if (preview.first_controlled_dynamic_content_loop_deferred_to_ag56 !== 1) fail("Preview AG56 deferral missing.");
if (preview.first_controlled_batch_executed !== 0) fail("Preview first batch execution must be 0.");
if (preview.candidate_selected_for_execution !== 0) fail("Preview candidate selection must be 0.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");
if (preview.database_write_done !== 0) fail("Preview DB write must be 0.");
if (preview.deployment_done !== 0) fail("Preview deployment must be 0.");
if (preview.backend_activation_approved_now !== 0) fail("Preview backend activation must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");

if (!pkg.scripts?.["generate:ag42b"]) fail("Missing generate:ag42b script.");
if (!pkg.scripts?.["validate:ag42b"]) fail("Missing validate:ag42b script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag42b")) fail("validate:project must include validate:ag42b.");

pass("AG42B Workflow Defect Review is present.");
pass("Workflow surface inventory, route guard review, defect classification and hardening backlog are valid.");
pass("No-mutation audit is valid.");
pass("AG42C Failed Publish and Rollback Dry-run readiness is valid.");
pass("No first controlled batch execution, public mutation, real publish, database write, deployment, SQL grant execution or service-role key is recorded.");
