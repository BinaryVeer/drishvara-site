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
  "data/content-intelligence/admin-editor/ag26c-static-ux-scaffold-plan.json",
  "data/content-intelligence/admin-editor/ag26c-admin-editor-static-screen-scaffold.json",
  "data/content-intelligence/admin-editor/ag26c-admin-editor-navigation-scaffold.json",
  "data/content-intelligence/admin-editor/ag26c-static-component-registry.json",
  "data/content-intelligence/admin-editor/ag26c-workflow-state-scaffold.json",
  "data/content-intelligence/admin-editor/ag26c-no-runtime-implementation-guard.json",
  "data/content-intelligence/quality-registry/ag26c-ux-scaffold-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag26c-to-ag26d-ux-scaffold-audit-boundary.json",
  "data/content-intelligence/admin-editor/ag26a-admin-editor-system-routing-model.json",
  "data/content-intelligence/admin-editor/ag26b-admin-workspace-ux-plan.json",
  "data/content-intelligence/admin-editor/ag26b-admin-final-publish-control-model.json",
  "data/content-intelligence/featured-reads/ag25z-featured-reads-production-readiness-closure.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",

  "data/content-intelligence/quality-reviews/ag26d-ux-scaffold-audit.json",
  "data/content-intelligence/admin-editor/ag26d-ux-scaffold-audit.json",
  "data/content-intelligence/admin-editor/ag26d-screen-navigation-audit.json",
  "data/content-intelligence/admin-editor/ag26d-role-routing-audit.json",
  "data/content-intelligence/admin-editor/ag26d-no-runtime-guard-audit.json",
  "data/content-intelligence/admin-editor/ag26d-readiness-findings-register.json",
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
const screenAudit = readJson("data/content-intelligence/admin-editor/ag26d-screen-navigation-audit.json");
const roleAudit = readJson("data/content-intelligence/admin-editor/ag26d-role-routing-audit.json");
const guardAudit = readJson("data/content-intelligence/admin-editor/ag26d-no-runtime-guard-audit.json");
const findings = readJson("data/content-intelligence/admin-editor/ag26d-readiness-findings-register.json");
const consumption = readJson("data/content-intelligence/admin-editor/ag26d-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag26d-ux-scaffold-audit-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag26d-manual-admin-editor-workflow-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag26d-to-ag26z-manual-admin-editor-workflow-closure-boundary.json");
const registry = readJson("data/quality/ag26d-ux-scaffold-audit.json");
const preview = readJson("data/quality/ag26d-ux-scaffold-audit-preview.json");
const ag26c = readJson("data/content-intelligence/admin-editor/ag26c-static-ux-scaffold-plan.json");
const ag26cReadiness = readJson("data/content-intelligence/quality-registry/ag26c-ux-scaffold-audit-readiness-record.json");
const routing = readJson("data/content-intelligence/admin-editor/ag26a-admin-editor-system-routing-model.json");
const publishControl = readJson("data/content-intelligence/admin-editor/ag26b-admin-final-publish-control-model.json");
const ag27 = readJson("data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json");
const pkg = readJson("package.json");

if (review.status !== "ux_scaffold_audit_passed_ready_for_ag26z") fail("Review status mismatch.");
if (audit.status !== "ux_scaffold_audit_passed_ready_for_ag26z") fail("Audit status mismatch.");
if (audit.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (audit.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");
if (audit.audit_scope.next_stage !== "AG26Z") fail("Next stage must be AG26Z.");
if (audit.audit_scope.screen_navigation_audit_passed !== true) fail("Screen/navigation audit must pass.");
if (audit.audit_scope.role_routing_audit_passed !== true) fail("Role/routing audit must pass.");
if (audit.audit_scope.no_runtime_guard_audit_passed !== true) fail("No-runtime guard audit must pass.");

for (const flag of [
  "runtime_ui_allowed_after_audit",
  "auth_activation_allowed_after_audit",
  "backend_activation_allowed_after_audit",
  "article_mutation_allowed_after_audit",
  "object_generation_allowed_after_audit",
  "publication_allowed_after_audit",
  "deployment_allowed_after_audit"
]) {
  if (audit[flag] !== false) fail(`${flag} must be false.`);
}
if (audit.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must remain deferred.");

if (screenAudit.status !== "screen_navigation_audit_passed_ready_for_ag26z") fail("Screen audit status mismatch.");
if (screenAudit.audit_passed !== true) fail("Screen audit must pass.");
if (screenAudit.findings.runtime_ui_created !== false) fail("Runtime UI must remain false.");
if (screenAudit.findings.runtime_routes_created !== false) fail("Runtime routes must remain false.");
if (screenAudit.findings.system_generated_content_first_lands_in_admin !== true) fail("System content must land in Admin.");
if (screenAudit.findings.editor_created_new_candidate_lands_in_admin !== true) fail("Editor-created candidate must land in Admin.");
if (screenAudit.findings.admin_assigned_edit_lands_in_editor !== true) fail("Admin-assigned edit must land in Editor.");
if (screenAudit.findings.editor_returned_edit_lands_in_admin !== true) fail("Editor-returned edit must land in Admin.");
if (screenAudit.findings.admin_final_publish_only !== true) fail("Admin final publish only missing.");
if (screenAudit.findings.editor_publish_route_exists !== false) fail("Editor publish route must not exist.");

if (roleAudit.status !== "role_routing_audit_passed_ready_for_ag26z") fail("Role audit status mismatch.");
if (roleAudit.audit_passed !== true) fail("Role audit must pass.");
for (const [k, v] of Object.entries(roleAudit.audit_rules)) {
  if (v !== true) fail(`Role audit rule must pass: ${k}`);
}

if (guardAudit.status !== "no_runtime_guard_audit_passed_ready_for_ag26z") fail("Guard audit status mismatch.");
if (guardAudit.audit_passed !== true) fail("Guard audit must pass.");
for (const [k, v] of Object.entries(guardAudit.guard_summary)) {
  if (v !== true) fail(`Guard summary must pass: ${k}`);
}

if (findings.status !== "readiness_findings_registered_ready_for_ag26z") fail("Findings status mismatch.");
if (findings.ready_for_ag26z !== true) fail("Findings must be ready for AG26Z.");
if (!Array.isArray(findings.blocker_findings) || findings.blocker_findings.length !== 0) fail("Blocker findings must be empty.");
if (!findings.passed_findings.some((item) => item.includes("Admin-only final publish authority"))) fail("Admin-only publish finding missing.");
if (!findings.passed_findings.some((item) => item.includes("Editor publish authority is blocked"))) fail("Editor publish block finding missing.");

if (!consumption.future_consumption?.AG26Z) fail("AG26Z consumption note missing.");
if (!consumption.future_consumption?.future_runtime_ui) fail("Future runtime UI note missing.");
if (!consumption.future_consumption?.future_publishing_path) fail("Future publishing path note missing.");
if (blocker.status !== "ux_scaffold_audit_runtime_operations_blocked_pending_ag26z") fail("Blocker status mismatch.");
if (readiness.ready_for_ag26z !== true) fail("AG26Z readiness missing.");
if (boundary.next_stage_id !== "AG26Z") fail("AG26Z boundary missing.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Boundary must keep backend deferred.");

if (review.summary.ux_scaffold_audit_created !== true) fail("Review summary missing.");
if (review.summary.screen_navigation_audit_passed !== true) fail("Screen audit summary missing.");
if (review.summary.role_routing_audit_passed !== true) fail("Role audit summary missing.");
if (review.summary.no_runtime_guard_audit_passed !== true) fail("Guard audit summary missing.");
if (review.summary.admin_first_system_content_flow_preserved !== true) fail("Admin-first flow must be preserved.");
if (review.summary.editor_independent_new_candidate_flow_preserved !== true) fail("Editor independent candidate flow must be preserved.");
if (review.summary.admin_assigned_editor_edit_flow_preserved !== true) fail("Admin-assigned edit flow must be preserved.");
if (review.summary.editor_return_to_admin_flow_preserved !== true) fail("Editor return-to-Admin flow must be preserved.");
if (review.summary.admin_final_publish_authority_preserved !== true) fail("Admin publish authority must be preserved.");
if (review.summary.editor_publish_authority_blocked !== true) fail("Editor publish authority must be blocked.");
if (review.summary.ready_for_ag26z !== true) fail("AG26Z readiness summary missing.");

for (const flag of [
  "runtime_ui_created",
  "runtime_route_created",
  "component_file_created",
  "auth_enabled",
  "backend_enabled",
  "queue_mutation_done",
  "article_file_mutation_done",
  "object_generation_done",
  "deployment_done",
  "publishing_done",
  "real_execution_done"
]) {
  if (review.summary[flag] !== false) fail(`${flag} must remain false.`);
}

if (ag26c.status !== "static_ux_scaffold_created_ready_for_ag26d") fail("AG26C source status mismatch.");
if (ag26cReadiness.ready_for_ag26d !== true) fail("AG26C readiness must allow AG26D.");
if (routing.role_routing_rules.admin_final_publish_authority !== true) fail("Routing must preserve Admin publish authority.");
if (routing.role_routing_rules.editor_publish_authority !== false) fail("Routing must block Editor publishing.");
if (publishControl.final_publish_authority !== "admin_only") fail("Publish control must be admin_only.");
if (publishControl.editor_publish_authority !== false) fail("Publish control must block Editor publish.");
if (publishControl.system_publish_without_admin !== false) fail("System publish without Admin must be false.");
if (ag27.checkpoint_decision.backend_deferred !== true) fail("AG27 backend deferral must remain true.");

if (registry.status !== "ux_scaffold_audit_passed_ready_for_ag26z") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.screen_navigation_audit_passed !== true) fail("Preview screen audit must pass.");
if (preview.role_routing_audit_passed !== true) fail("Preview role audit must pass.");
if (preview.no_runtime_guard_audit_passed !== true) fail("Preview guard audit must pass.");
if (preview.ready_for_ag26z !== true) fail("Preview must be ready for AG26Z.");
if (preview.runtime_ui_created !== 0) fail("Preview must record 0 runtime UI.");
if (preview.routes_created !== 0) fail("Preview must record 0 routes.");
if (preview.component_files_created !== 0) fail("Preview must record 0 component files.");
if (preview.auth_enabled !== 0) fail("Preview must record 0 Auth.");
if (preview.backend_enabled !== 0) fail("Preview must record 0 backend.");
if (preview.mutated_articles !== 0) fail("Preview must record 0 article mutations.");
if (preview.generated_objects !== 0) fail("Preview must record 0 generated objects.");
if (preview.published_items !== 0) fail("Preview must record 0 published items.");
if (preview.backend_objects !== 0) fail("Preview must record 0 backend objects.");

for (const expectedInput of [
  "data/content-intelligence/admin-editor/ag26c-static-ux-scaffold-plan.json",
  "data/content-intelligence/admin-editor/ag26c-admin-editor-static-screen-scaffold.json",
  "data/content-intelligence/admin-editor/ag26c-admin-editor-navigation-scaffold.json",
  "data/content-intelligence/admin-editor/ag26c-no-runtime-implementation-guard.json",
  "data/content-intelligence/admin-editor/ag26a-admin-editor-system-routing-model.json",
  "data/content-intelligence/admin-editor/ag26b-admin-workspace-ux-plan.json",
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
pass("Screen/navigation audit passed.");
pass("Role/routing audit passed.");
pass("No-runtime guard audit passed.");
pass("AG26Z Manual Admin/Editor Workflow Closure boundary is ready.");
pass("No runtime UI, routes, component files, Auth, backend, article mutation, object generation, GitHub write, deployment or publishing is enabled.");
