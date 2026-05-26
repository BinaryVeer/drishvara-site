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
  console.error(`❌ AG26A routing validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/admin-editor/ag26a-editor-workspace-ux-plan.json",
  "data/content-intelligence/quality-reviews/ag26a-editor-workspace-ux-plan.json",
  "data/content-intelligence/admin-editor/ag26a-admin-editor-system-routing-model.json",
  "data/content-intelligence/admin-editor/ag26a-editor-authoring-and-admin-assigned-edit-policy.json",
  "data/content-intelligence/quality-reviews/ag26a-editor-admin-routing-alignment.json",
  "data/quality/ag26a-editor-admin-routing-alignment.json",
  "data/quality/ag26a-editor-admin-routing-alignment-preview.json",
  "docs/quality/AG26A_EDITOR_ADMIN_ROUTING_ALIGNMENT.md",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const plan = readJson("data/content-intelligence/admin-editor/ag26a-editor-workspace-ux-plan.json");
const review = readJson("data/content-intelligence/quality-reviews/ag26a-editor-workspace-ux-plan.json");
const routing = readJson("data/content-intelligence/admin-editor/ag26a-admin-editor-system-routing-model.json");
const policy = readJson("data/content-intelligence/admin-editor/ag26a-editor-authoring-and-admin-assigned-edit-policy.json");
const alignment = readJson("data/content-intelligence/quality-reviews/ag26a-editor-admin-routing-alignment.json");
const preview = readJson("data/quality/ag26a-editor-admin-routing-alignment-preview.json");
const ag27 = readJson("data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json");
const pkg = readJson("package.json");

if (plan.status !== "editor_workspace_ux_plan_created_ready_for_ag26b") fail("AG26A plan status mismatch.");
if (review.status !== "editor_workspace_ux_plan_created_ready_for_ag26b") fail("AG26A review status mismatch.");
if (routing.status !== "admin_editor_system_routing_model_created_ready_for_ag26b") fail("Routing model status mismatch.");
if (policy.status !== "editor_authoring_admin_assigned_edit_policy_created") fail("Policy status mismatch.");
if (alignment.status !== "editor_admin_routing_alignment_created_ready_for_ag26b") fail("Alignment review status mismatch.");

const rules = routing.role_routing_rules;
if (rules.editor_independent_new_article_candidate_allowed !== true) fail("Editor independent new article candidate must be allowed.");
if (rules.editor_can_use_full_toolset_for_own_new_article_candidate !== true) fail("Editor toolset for own candidate must be allowed.");
if (rules.editor_new_article_candidate_goes_to_admin_review !== true) fail("Editor new candidate must go to Admin review.");
if (rules.system_generated_content_first_goes_to_admin !== true) fail("System-generated content must go to Admin first.");
if (rules.admin_core_reviewer_for_system_generated_content !== true) fail("Admin must be core reviewer.");
if (rules.admin_can_send_system_generated_content_to_editor_for_editing !== true) fail("Admin must be able to assign to Editor.");
if (rules.editor_direct_system_article_edit_allowed !== false) fail("Editor direct system article edit must be blocked.");
if (rules.editor_can_edit_admin_assigned_system_article !== true) fail("Editor must edit Admin-assigned system article.");
if (rules.editor_returns_to_admin_after_edit !== true) fail("Editor must return edited content to Admin.");
if (rules.admin_final_publish_authority !== true) fail("Admin must have final publish authority.");
if (rules.editor_publish_authority !== false) fail("Editor publish authority must be false.");

if (policy.editor_permissions.independent_new_article_candidate_creation !== true) fail("Policy must allow Editor independent new article candidate.");
if (policy.editor_permissions.independent_system_generated_article_edit !== false) fail("Policy must block independent system article edit.");
if (policy.editor_permissions.edit_admin_assigned_system_generated_article !== true) fail("Policy must allow Admin-assigned system article edit.");
if (policy.editor_permissions.publish_to_world !== false) fail("Policy must block Editor publishing.");
if (policy.admin_permissions.receives_system_generated_content_first !== true) fail("Admin must receive system content first.");
if (policy.admin_permissions.final_publish_authority !== true) fail("Admin final publish authority missing.");
if (policy.system_permissions.system_pushes_generated_content_directly_to_editor !== false) fail("System must not push generated content directly to Editor.");
if (policy.system_permissions.system_publishes_without_admin !== false) fail("System must not publish without Admin.");

if (plan.routing_governance.editor_independent_new_article_candidate_allowed !== true) fail("Plan routing governance missing Editor new article permission.");
if (plan.routing_governance.editor_direct_system_article_edit_allowed !== false) fail("Plan routing must block direct system article edit.");
if (plan.routing_governance.admin_final_publish_authority !== true) fail("Plan routing must preserve Admin final publish authority.");
if (plan.routing_governance.editor_publish_authority !== false) fail("Plan routing must block Editor publish authority.");

if (review.summary.admin_editor_system_routing_aligned !== true) fail("Review summary routing aligned missing.");
if (review.summary.editor_direct_system_article_edit_allowed !== false) fail("Review summary must block direct system article edit.");
if (review.summary.admin_final_publish_authority !== true) fail("Review summary must preserve Admin final publish authority.");
if (review.summary.editor_publish_authority !== false) fail("Review summary must block Editor publish authority.");

if (preview.editor_independent_new_article_candidate_allowed !== true) fail("Preview must allow Editor new article candidate.");
if (preview.editor_direct_system_article_edit_allowed !== 0) fail("Preview must record 0 direct system article edit.");
if (preview.editor_publish_authority !== 0) fail("Preview must record 0 Editor publish authority.");
if (preview.mutated_articles !== 0) fail("Preview must record 0 article mutation.");
if (preview.public_items !== 0) fail("Preview must record 0 public items.");
if (preview.backend_objects !== 0) fail("Preview must record 0 backend objects.");

if (ag27.checkpoint_decision.backend_deferred !== true) fail("AG27 backend deferral must remain true.");

for (const [k, v] of Object.entries(alignment.blocked_state)) {
  if ([
    "routing_alignment_created",
    "editor_independent_new_article_candidate_allowed",
    "editor_can_edit_admin_assigned_system_article",
    "system_generated_content_first_goes_to_admin",
    "admin_core_reviewer_for_system_generated_content",
    "editor_returns_to_admin_after_edit",
    "admin_final_publish_authority"
  ].includes(k)) {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`${k} must be false.`);
  }
}

if (!pkg.scripts?.["generate:ag26a-routing"]) fail("Missing generate:ag26a-routing script.");
if (!pkg.scripts?.["validate:ag26a-routing"]) fail("Missing validate:ag26a-routing script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag26a-routing")) fail("validate:project must include validate:ag26a-routing.");

pass("AG26A Editor/Admin/System routing alignment is valid.");
pass("Editor independent new article candidate creation is allowed.");
pass("System-generated content routes to Admin first.");
pass("Editor edits system-generated/existing content only after Admin assignment.");
pass("Editor returns edited content to Admin.");
pass("Admin remains final publish authority.");
pass("No article mutation, backend activation, deployment or publishing is enabled.");
