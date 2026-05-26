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
  console.error(`❌ AG26D validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag26c-static-ux-scaffold.json",
  "data/content-intelligence/admin-editor/ag26c-static-ux-scaffold.json",
  "data/content-intelligence/admin-editor/ag26c-static-screen-registry.json",
  "data/content-intelligence/admin-editor/ag26c-static-component-registry.json",
  "data/content-intelligence/admin-editor/ag26c-admin-editor-role-flow-scaffold.json",
  "data/content-intelligence/admin-editor/ag26c-static-ux-non-execution-model.json",
  "data/content-intelligence/quality-registry/ag26c-ux-scaffold-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag26c-to-ag26d-ux-scaffold-audit-boundary.json",
  "data/content-intelligence/admin-editor/ag26b-admin-workspace-ux-plan.json",
  "data/content-intelligence/admin-editor/ag26b-admin-assignment-control-model.json",
  "data/content-intelligence/admin-editor/ag26b-admin-review-action-model.json",
  "data/content-intelligence/admin-editor/ag26a-editor-workspace-ux-plan.json",
  "data/content-intelligence/admin-editor/ag26a-editor-admin-assignment-alignment-record.json",
  "data/content-intelligence/admin-editor/ag26-admin-editor-manual-workflow-strengthening-plan.json",
  "data/content-intelligence/featured-reads/ag25z-featured-reads-production-readiness-closure.json",
  "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",

  "data/content-intelligence/quality-reviews/ag26d-ux-scaffold-audit.json",
  "data/content-intelligence/admin-editor/ag26d-ux-scaffold-audit.json",
  "data/content-intelligence/admin-editor/ag26d-role-separation-audit-model.json",
  "data/content-intelligence/admin-editor/ag26d-no-live-action-audit-model.json",
  "data/content-intelligence/admin-editor/ag26d-static-scaffold-risk-register.json",
  "data/content-intelligence/admin-editor/ag26d-audit-findings-register.json",
  "data/content-intelligence/admin-editor/ag26d-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag26d-ux-scaffold-audit-blocker-register.json",
  "data/content-intelligence/quality-registry/ag26d-manual-admin-editor-workflow-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag26d-to-ag26z-manual-admin-editor-workflow-closure-boundary.json",
  "data/quality/ag26d-ux-scaffold-audit.json",
  "data/quality/ag26d-ux-scaffold-audit-preview.json",
  "docs/quality/AG26D_UX_SCAFFOLD_AUDIT.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag26d-ux-scaffold-audit.json");
const audit = readJson("data/content-intelligence/admin-editor/ag26d-ux-scaffold-audit.json");
const roleAudit = readJson("data/content-intelligence/admin-editor/ag26d-role-separation-audit-model.json");
const noLiveAudit = readJson("data/content-intelligence/admin-editor/ag26d-no-live-action-audit-model.json");
const risk = readJson("data/content-intelligence/admin-editor/ag26d-static-scaffold-risk-register.json");
const findings = readJson("data/content-intelligence/admin-editor/ag26d-audit-findings-register.json");
const consumption = readJson("data/content-intelligence/admin-editor/ag26d-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag26d-ux-scaffold-audit-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag26d-manual-admin-editor-workflow-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag26d-to-ag26z-manual-admin-editor-workflow-closure-boundary.json");
const registry = readJson("data/quality/ag26d-ux-scaffold-audit.json");
const preview = readJson("data/quality/ag26d-ux-scaffold-audit-preview.json");
const ag26c = readJson("data/content-intelligence/admin-editor/ag26c-static-ux-scaffold.json");
const ag26cReadiness = readJson("data/content-intelligence/quality-registry/ag26c-ux-scaffold-audit-readiness-record.json");
const ag26aAlignment = readJson("data/content-intelligence/admin-editor/ag26a-editor-admin-assignment-alignment-record.json");
const ag27 = readJson("data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json");
const pkg = readJson("package.json");

if (review.status !== "ux_scaffold_audit_created_ready_for_ag26z") fail("Review status mismatch.");
if (audit.status !== "ux_scaffold_audit_created_ready_for_ag26z") fail("Audit status mismatch.");
if (audit.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (audit.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");
if (audit.audit_scope.next_stage !== "AG26Z") fail("Next stage must be AG26Z.");
if (audit.ux_scaffold_audit_created !== true) fail("Audit must be created.");
if (audit.audit_passed !== true) fail("Audit must pass.");

for (const flag of [
  "runtime_ui_allowed_in_ag26d",
  "live_route_creation_allowed_in_ag26d",
  "admin_login_creation_allowed_in_ag26d",
  "editor_login_creation_allowed_in_ag26d",
  "auth_activation_allowed_in_ag26d",
  "backend_activation_allowed_in_ag26d",
  "assignment_runtime_allowed_in_ag26d",
  "review_action_execution_allowed_in_ag26d",
  "article_file_mutation_allowed_in_ag26d",
  "object_generation_allowed_in_ag26d",
  "publish_execution_allowed_in_ag26d",
  "public_mutation_allowed_in_ag26d",
  "deployment_allowed_in_ag26d"
]) {
  if (audit[flag] !== false) fail(`${flag} must be false.`);
}
if (audit.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must remain deferred.");

if (roleAudit.status !== "role_separation_audit_passed") fail("Role audit status mismatch.");
if (roleAudit.role_separation_passed !== true) fail("Role separation must pass.");
if (roleAudit.failed_checks.length !== 0) fail("Role audit must have zero failed checks.");

if (noLiveAudit.status !== "no_live_action_audit_passed") fail("No-live-action audit status mismatch.");
if (noLiveAudit.all_live_actions_blocked !== true) fail("All live actions must be blocked.");
if (noLiveAudit.failed_checks.length !== 0) fail("No-live-action audit must have zero failed checks.");

if (risk.status !== "static_scaffold_risk_register_created_no_blocking_risk") fail("Risk register status mismatch.");
if (risk.blocking_risk_count !== 0) fail("Blocking risk count must be zero.");

if (findings.status !== "ux_scaffold_audit_findings_passed_ready_for_ag26z") fail("Findings status mismatch.");
if (findings.audit_passed !== true) fail("Findings audit must pass.");
if (findings.failed_checks !== 0) fail("Findings failed checks must be zero.");
if (findings.total_checks !== findings.passed_checks) fail("All checks must pass.");

if (!consumption.future_consumption?.AG26Z) fail("AG26Z consumption note missing.");
if (!consumption.future_consumption?.future_static_apply_path) fail("Future static apply path note missing.");
if (!consumption.future_consumption?.AG27_and_later) fail("AG27/later note missing.");
if (blocker.status !== "ux_scaffold_audit_operations_blocked_pending_ag26z") fail("Blocker status mismatch.");
if (readiness.ready_for_ag26z !== true) fail("AG26Z readiness missing.");
if (readiness.audit_passed !== true) fail("Readiness must mark audit passed.");
if (boundary.next_stage_id !== "AG26Z") fail("AG26Z boundary missing.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Boundary must keep backend deferred.");
if (boundary.admin_final_clearance_required !== true) fail("Boundary must keep Admin final clearance.");
if (!boundary.editor_workflow_rule.includes("Admin assigns item to Editor")) fail("Boundary must preserve workflow rule.");

if (review.summary.ux_scaffold_audit_created !== true) fail("Review summary missing.");
if (review.summary.audit_passed !== true) fail("Review summary must pass audit.");
if (review.summary.failed_checks !== 0) fail("Review summary failed checks must be zero.");
if (review.summary.role_separation_passed !== true) fail("Review role separation must pass.");
if (review.summary.no_live_action_passed !== true) fail("Review no-live-action must pass.");
if (review.summary.ready_for_ag26z !== true) fail("Review must be ready for AG26Z.");

for (const flag of [
  "runtime_ui_created",
  "live_route_created",
  "admin_login_created",
  "editor_login_created",
  "auth_enabled",
  "backend_enabled",
  "assignment_write_done",
  "review_action_executed",
  "article_file_mutation_done",
  "object_generation_done",
  "publish_executed",
  "public_mutation_done",
  "deployment_done",
  "publishing_done",
  "backend_activation_done",
  "real_execution_done"
]) {
  if (review.summary[flag] !== false) fail(`${flag} must remain false.`);
}

if (ag26c.status !== "static_ux_scaffold_created_ready_for_ag26d") fail("AG26C source scaffold status mismatch.");
if (ag26cReadiness.ready_for_ag26d !== true) fail("AG26C readiness must allow AG26D.");
if (ag26aAlignment.alignment_decision.editor_can_only_work_on_admin_assigned_items !== true) fail("AG26A assigned-only rule missing.");
if (ag26aAlignment.alignment_decision.editor_returns_work_to_admin !== true) fail("AG26A return-to-admin rule missing.");
if (ag27.checkpoint_decision.backend_deferred !== true) fail("AG27 backend deferral must remain true.");
if (ag27.checkpoint_decision.backend_activation_approved !== false) fail("Backend activation must remain unapproved.");

if (registry.status !== "ux_scaffold_audit_created_ready_for_ag26z") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.audit_passed !== true) fail("Preview must show audit passed.");
if (preview.failed_checks !== 0) fail("Preview must record 0 failed checks.");
if (preview.runtime_ui_created !== 0) fail("Preview must record 0 runtime UI.");
if (preview.live_routes_created !== 0) fail("Preview must record 0 live routes.");
if (preview.auth_enabled !== 0) fail("Preview must record 0 Auth.");
if (preview.backend_enabled !== 0) fail("Preview must record 0 backend.");
if (preview.assignment_writes !== 0) fail("Preview must record 0 assignment writes.");
if (preview.executed_actions !== 0) fail("Preview must record 0 executed actions.");
if (preview.public_items !== 0) fail("Preview must record 0 public items.");
if (preview.backend_objects !== 0) fail("Preview must record 0 backend objects.");

for (const expectedInput of [
  "data/content-intelligence/admin-editor/ag26c-static-ux-scaffold.json",
  "data/content-intelligence/admin-editor/ag26c-static-screen-registry.json",
  "data/content-intelligence/admin-editor/ag26c-static-component-registry.json",
  "data/content-intelligence/admin-editor/ag26c-admin-editor-role-flow-scaffold.json",
  "data/content-intelligence/admin-editor/ag26c-static-ux-non-execution-model.json",
  "data/content-intelligence/admin-editor/ag26b-admin-workspace-ux-plan.json",
  "data/content-intelligence/admin-editor/ag26a-editor-workspace-ux-plan.json",
  "data/content-intelligence/admin-editor/ag26a-editor-admin-assignment-alignment-record.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json"
]) {
  if (!audit.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Audit did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (k === "ux_scaffold_audit_created") {
    if (v !== true) fail("ux_scaffold_audit_created must be true.");
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag26d"]) fail("Missing generate:ag26d script.");
if (!pkg.scripts?.["validate:ag26d"]) fail("Missing validate:ag26d script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag26d")) fail("validate:project must include validate:ag26d.");

pass("AG26D UX Scaffold Audit is present.");
pass("Role separation audit passed.");
pass("No-live-action audit passed.");
pass("Static scaffold risk and findings registers are valid.");
pass("AG26Z Manual Admin/Editor Workflow Closure boundary is ready.");
pass("No runtime UI, live route, Auth, backend, assignment write, review action, publish execution, GitHub write, deployment or publishing is enabled.");
