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
  console.error(`❌ AG26Z validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/admin-editor/ag26-admin-editor-manual-workflow-strengthening-plan.json",
  "data/content-intelligence/admin-editor/ag26a-editor-workspace-ux-plan.json",
  "data/content-intelligence/admin-editor/ag26a-admin-editor-system-routing-model.json",
  "data/content-intelligence/admin-editor/ag26a-editor-authoring-and-admin-assigned-edit-policy.json",
  "data/content-intelligence/admin-editor/ag26b-admin-workspace-ux-plan.json",
  "data/content-intelligence/admin-editor/ag26b-admin-final-publish-control-model.json",
  "data/content-intelligence/admin-editor/ag26c-static-ux-scaffold-plan.json",
  "data/content-intelligence/admin-editor/ag26d-ux-scaffold-audit.json",
  "data/content-intelligence/quality-registry/ag26d-manual-admin-editor-workflow-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag26d-to-ag26z-manual-admin-editor-workflow-closure-boundary.json",
  "data/content-intelligence/featured-reads/ag25z-featured-reads-production-readiness-closure.json",
  "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",

  "data/content-intelligence/quality-reviews/ag26z-manual-admin-editor-workflow-closure.json",
  "data/content-intelligence/admin-editor/ag26z-manual-admin-editor-workflow-closure.json",
  "data/content-intelligence/admin-editor/ag26z-ag26-detailed-source-chain-register.json",
  "data/content-intelligence/admin-editor/ag26z-admin-editor-routing-closure-register.json",
  "data/content-intelligence/admin-editor/ag26z-non-runtime-closure-register.json",
  "data/content-intelligence/admin-editor/ag26z-existing-ag27-handoff-confirmation.json",
  "data/content-intelligence/admin-editor/ag26z-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag26z-manual-admin-editor-workflow-closure-blocker-register.json",
  "data/content-intelligence/quality-registry/ag26z-post-ag26-backend-deferral-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag26z-to-existing-ag27-backend-decision-checkpoint-boundary.json",
  "data/quality/ag26z-manual-admin-editor-workflow-closure.json",
  "data/quality/ag26z-manual-admin-editor-workflow-closure-preview.json",
  "docs/quality/AG26Z_MANUAL_ADMIN_EDITOR_WORKFLOW_CLOSURE.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag26z-manual-admin-editor-workflow-closure.json");
const closure = readJson("data/content-intelligence/admin-editor/ag26z-manual-admin-editor-workflow-closure.json");
const sourceChain = readJson("data/content-intelligence/admin-editor/ag26z-ag26-detailed-source-chain-register.json");
const routingClosure = readJson("data/content-intelligence/admin-editor/ag26z-admin-editor-routing-closure-register.json");
const nonRuntimeClosure = readJson("data/content-intelligence/admin-editor/ag26z-non-runtime-closure-register.json");
const ag27Handoff = readJson("data/content-intelligence/admin-editor/ag26z-existing-ag27-handoff-confirmation.json");
const consumption = readJson("data/content-intelligence/admin-editor/ag26z-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag26z-manual-admin-editor-workflow-closure-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag26z-post-ag26-backend-deferral-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag26z-to-existing-ag27-backend-decision-checkpoint-boundary.json");
const registry = readJson("data/quality/ag26z-manual-admin-editor-workflow-closure.json");
const preview = readJson("data/quality/ag26z-manual-admin-editor-workflow-closure-preview.json");

const ag26d = readJson("data/content-intelligence/admin-editor/ag26d-ux-scaffold-audit.json");
const ag26dReadiness = readJson("data/content-intelligence/quality-registry/ag26d-manual-admin-editor-workflow-closure-readiness-record.json");
const routing = readJson("data/content-intelligence/admin-editor/ag26a-admin-editor-system-routing-model.json");
const publishControl = readJson("data/content-intelligence/admin-editor/ag26b-admin-final-publish-control-model.json");
const ag27 = readJson("data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json");
const pkg = readJson("package.json");

if (review.status !== "manual_admin_editor_workflow_closed_existing_ag27_backend_deferred") fail("Review status mismatch.");
if (closure.status !== "manual_admin_editor_workflow_closed_existing_ag27_backend_deferred") fail("Closure status mismatch.");
if (closure.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (closure.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");
if (closure.closure_decision.ag26_detailed_chain_closed !== true) fail("AG26 detailed chain must be closed.");
if (closure.closure_decision.detailed_stages_closed !== 5) fail("Detailed closed stages must be 5.");
if (closure.closure_decision.existing_ag27_already_completed !== true) fail("Existing AG27 completion must be acknowledged.");
if (closure.closure_decision.backend_activation_ready !== false) fail("Backend activation readiness must be false.");
if (closure.closure_decision.auth_activation_ready !== false) fail("Auth readiness must be false.");
if (closure.closure_decision.supabase_activation_ready !== false) fail("Supabase readiness must be false.");
if (closure.closure_decision.publication_ready !== false) fail("Publication readiness must be false.");
if (closure.closure_decision.deployment_ready !== false) fail("Deployment readiness must be false.");
if (closure.closure_decision.do_not_start_ag28_without_explicit_approval !== true) fail("AG28 explicit approval guard missing.");
if (closure.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must remain deferred.");

if (sourceChain.chain_length !== 5) fail("AG26 detailed source chain must contain 5 stages.");
for (const stage of ["AG26A", "AG26A_ALIGNMENT", "AG26B", "AG26C", "AG26D"]) {
  if (!sourceChain.closed_chain.some((item) => item.stage_id === stage)) fail(`Missing closed stage: ${stage}`);
}

const rules = routingClosure.closed_governance_rules;
if (rules.editor_independent_new_article_candidate_allowed !== true) fail("Editor independent new article candidate must remain allowed.");
if (rules.editor_new_article_candidate_goes_to_admin_review !== true) fail("Editor new candidate must go to Admin review.");
if (rules.system_generated_content_first_goes_to_admin !== true) fail("System content must go to Admin first.");
if (rules.admin_core_reviewer_for_system_generated_content !== true) fail("Admin core reviewer missing.");
if (rules.admin_can_send_system_generated_content_to_editor_for_editing !== true) fail("Admin-to-Editor assignment missing.");
if (rules.editor_direct_system_article_edit_allowed !== false) fail("Editor direct system edit must be blocked.");
if (rules.editor_can_edit_admin_assigned_system_article !== true) fail("Editor Admin-assigned system edit must remain allowed.");
if (rules.editor_returns_to_admin_after_edit !== true) fail("Editor return-to-Admin missing.");
if (rules.admin_final_publish_authority !== true) fail("Admin final publish authority missing.");
if (rules.editor_publish_authority !== false) fail("Editor publish authority must be false.");
if (rules.system_publish_without_admin !== false) fail("System publish without Admin must be false.");

for (const [k, v] of Object.entries(nonRuntimeClosure.closure_guards)) {
  if (v !== true) fail(`Non-runtime closure guard must be true: ${k}`);
}

if (ag27Handoff.status !== "existing_ag27_checkpoint_confirmed_backend_deferred") fail("Existing AG27 handoff status mismatch.");
if (ag27Handoff.ag27_decision.backend_activation_approved !== false) fail("AG27 backend activation must not be approved.");
if (ag27Handoff.ag27_decision.supabase_deferred !== true) fail("AG27 Supabase deferral missing.");
if (ag27Handoff.ag27_decision.auth_deferred !== true) fail("AG27 Auth deferral missing.");
if (ag27Handoff.ag27_decision.backend_deferred !== true) fail("AG27 backend deferral missing.");
if (ag27Handoff.ag27_decision.dynamic_publishing_deferred !== true) fail("AG27 dynamic publishing deferral missing.");
if (ag27Handoff.ag27_decision.ag28_to_ag40_allowed_now !== false) fail("AG28-AG40 must not be allowed now.");
if (ag27Handoff.ag27_decision.explicit_approval_required_before_ag28 !== true) fail("Explicit approval before AG28 missing.");
if (ag27Handoff.do_not_start_ag28_without_explicit_approval !== true) fail("AG28 guard missing.");

if (!consumption.future_consumption?.existing_AG27) fail("Existing AG27 consumption note missing.");
if (!consumption.future_consumption?.AG28_to_AG40) fail("AG28-AG40 consumption note missing.");
if (!consumption.future_consumption?.future_static_path) fail("Future static path note missing.");
if (!consumption.future_consumption?.future_runtime_admin_editor) fail("Future runtime Admin/Editor note missing.");

if (blocker.status !== "ag26_closed_runtime_operations_blocked_existing_ag27_deferred") fail("Blocker status mismatch.");
if (readiness.ready_for_existing_ag27_confirmation !== true) fail("Existing AG27 readiness missing.");
if (readiness.existing_ag27_completed !== true) fail("Existing AG27 completed missing.");
if (readiness.backend_activation_allowed_now !== false) fail("Backend activation must not be allowed now.");
if (readiness.ag28_allowed_now !== false) fail("AG28 must not be allowed now.");
if (readiness.explicit_approval_required_before_ag28 !== true) fail("Explicit approval before AG28 missing.");
if (boundary.next_stage_id !== "AG27_EXISTING_CONFIRMATION") fail("Boundary must point to existing AG27 confirmation.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Boundary must keep backend deferred.");
if (boundary.explicit_approval_required_before_ag28 !== true) fail("Boundary must require explicit approval before AG28.");

if (review.summary.manual_admin_editor_workflow_closed !== true) fail("Review closure summary missing.");
if (review.summary.ag26_detailed_chain_closed !== true) fail("Detailed chain closure summary missing.");
if (review.summary.detailed_stages_closed !== 5) fail("Review must record 5 closed stages.");
if (review.summary.existing_ag27_backend_deferred !== true) fail("Existing AG27 backend deferral missing.");
if (review.summary.ag28_blocked_pending_explicit_approval !== true) fail("AG28 block summary missing.");
if (review.summary.admin_first_system_content_flow_preserved !== true) fail("Admin-first flow must be preserved.");
if (review.summary.editor_independent_new_candidate_flow_preserved !== true) fail("Editor independent candidate flow must be preserved.");
if (review.summary.admin_assigned_editor_edit_flow_preserved !== true) fail("Admin-assigned edit flow must be preserved.");
if (review.summary.editor_return_to_admin_flow_preserved !== true) fail("Editor return-to-Admin flow must be preserved.");
if (review.summary.admin_final_publish_authority_preserved !== true) fail("Admin final publish authority must be preserved.");
if (review.summary.editor_publish_authority_blocked !== true) fail("Editor publish authority must be blocked.");

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

if (ag26d.status !== "ux_scaffold_audit_passed_ready_for_ag26z") fail("AG26D source status mismatch.");
if (ag26dReadiness.ready_for_ag26z !== true) fail("AG26D readiness must allow AG26Z.");
if (routing.role_routing_rules.admin_final_publish_authority !== true) fail("Routing must preserve Admin publish authority.");
if (routing.role_routing_rules.editor_publish_authority !== false) fail("Routing must block Editor publishing.");
if (publishControl.final_publish_authority !== "admin_only") fail("Publish control must be admin_only.");
if (publishControl.editor_publish_authority !== false) fail("Publish control must block Editor publishing.");
if (publishControl.system_publish_without_admin !== false) fail("System publish without Admin must be false.");
if (ag27.status !== "supabase_auth_backend_decision_checkpoint_created_backend_deferred") fail("AG27 status mismatch.");
if (ag27.checkpoint_decision.backend_deferred !== true) fail("AG27 backend deferral must remain true.");
if (ag27.checkpoint_decision.ag28_to_ag40_allowed_now !== false) fail("AG28-AG40 must remain blocked.");

if (registry.status !== "manual_admin_editor_workflow_closed_existing_ag27_backend_deferred") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.detailed_stages_closed !== 5) fail("Preview must record 5 closed stages.");
if (preview.existing_ag27_backend_deferred !== true) fail("Preview must confirm existing AG27 backend deferral.");
if (preview.ag28_allowed_now !== 0) fail("Preview must record 0 AG28 allowed now.");
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
  "data/content-intelligence/admin-editor/ag26a-editor-workspace-ux-plan.json",
  "data/content-intelligence/admin-editor/ag26a-admin-editor-system-routing-model.json",
  "data/content-intelligence/admin-editor/ag26b-admin-workspace-ux-plan.json",
  "data/content-intelligence/admin-editor/ag26c-static-ux-scaffold-plan.json",
  "data/content-intelligence/admin-editor/ag26d-ux-scaffold-audit.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json"
]) {
  if (!closure.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Closure did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (k === "ag26_detailed_chain_closed") {
    if (v !== true) fail("ag26_detailed_chain_closed must be true.");
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag26z"]) fail("Missing generate:ag26z script.");
if (!pkg.scripts?.["validate:ag26z"]) fail("Missing validate:ag26z script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag26z")) fail("validate:project must include validate:ag26z.");

pass("AG26Z Manual Admin/Editor Workflow Closure is present.");
pass("AG26A/AG26A Alignment/AG26B/AG26C/AG26D detailed chain is closed.");
pass("Admin-first system content routing and Admin-only final publish authority are preserved.");
pass("Editor independent new candidate flow and Admin-assigned edit flow are preserved.");
pass("Existing AG27 backend decision checkpoint is confirmed as controlling.");
pass("AG28 remains blocked pending explicit approval.");
pass("No runtime UI, Auth, backend, article mutation, object generation, GitHub write, deployment or publishing is enabled.");
