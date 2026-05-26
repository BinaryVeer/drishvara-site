import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const files = {
  ag26aPlan: "data/content-intelligence/admin-editor/ag26a-editor-workspace-ux-plan.json",
  ag26aReview: "data/content-intelligence/quality-reviews/ag26a-editor-workspace-ux-plan.json",
  ag26aPreview: "data/quality/ag26a-editor-workspace-ux-plan-preview.json",
  ag26aReadiness: "data/content-intelligence/quality-registry/ag26a-admin-workspace-ux-plan-readiness-record.json",
  ag26aBoundary: "data/content-intelligence/mutation-plans/ag26a-to-ag26b-admin-workspace-ux-plan-boundary.json",
  ag26aBlocker: "data/content-intelligence/quality-registry/ag26a-editor-workspace-ux-plan-blocker-register.json",
  ag25zClosure: "data/content-intelligence/featured-reads/ag25z-featured-reads-production-readiness-closure.json",
  ag26UmbrellaPlan: "data/content-intelligence/admin-editor/ag26-admin-editor-manual-workflow-strengthening-plan.json",
  ag27DecisionCheckpoint: "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag26a-editor-admin-routing-alignment.json",
  routingModel: "data/content-intelligence/admin-editor/ag26a-admin-editor-system-routing-model.json",
  authoringEditPolicy: "data/content-intelligence/admin-editor/ag26a-editor-authoring-and-admin-assigned-edit-policy.json",
  registry: "data/quality/ag26a-editor-admin-routing-alignment.json",
  preview: "data/quality/ag26a-editor-admin-routing-alignment-preview.json",
  doc: "docs/quality/AG26A_EDITOR_ADMIN_ROUTING_ALIGNMENT.md"
};

function exists(p) {
  return fs.existsSync(path.join(root, p));
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
}

function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
  fs.writeFileSync(path.join(root, p), JSON.stringify(obj, null, 2) + "\n");
}

function writeText(p, text) {
  fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
  fs.writeFileSync(path.join(root, p), text);
}

for (const p of Object.values(files)) {
  if (!exists(p)) throw new Error(`Missing AG26A routing input: ${p}`);
}

const plan = readJson(files.ag26aPlan);
const review = readJson(files.ag26aReview);
const preview = readJson(files.ag26aPreview);
const readiness = readJson(files.ag26aReadiness);
const boundary = readJson(files.ag26aBoundary);
const blocker = readJson(files.ag26aBlocker);
const ag25zClosure = readJson(files.ag25zClosure);
const ag26UmbrellaPlan = readJson(files.ag26UmbrellaPlan);
const ag27DecisionCheckpoint = readJson(files.ag27DecisionCheckpoint);

if (plan.status !== "editor_workspace_ux_plan_created_ready_for_ag26b") throw new Error("AG26A plan status mismatch.");
if (review.status !== "editor_workspace_ux_plan_created_ready_for_ag26b") throw new Error("AG26A review status mismatch.");
if (ag25zClosure.status !== "featured_reads_production_readiness_closed_ready_for_ag26a") throw new Error("AG25Z closure status mismatch.");
if (ag26UmbrellaPlan.status !== "admin_editor_manual_workflow_strengthening_created_ready_for_ag27") throw new Error("AG26 umbrella status mismatch.");
if (ag27DecisionCheckpoint.checkpoint_decision?.backend_deferred !== true) throw new Error("Backend must remain deferred.");

const blockedState = {
  routing_alignment_created: true,
  editor_independent_new_article_candidate_allowed: true,
  editor_direct_system_article_edit_allowed: false,
  editor_can_edit_admin_assigned_system_article: true,
  system_generated_content_first_goes_to_admin: true,
  admin_core_reviewer_for_system_generated_content: true,
  editor_returns_to_admin_after_edit: true,
  admin_final_publish_authority: true,
  editor_publish_authority: false,
  article_file_mutated: false,
  article_created: false,
  backend_enabled: false,
  auth_enabled: false,
  supabase_enabled: false,
  public_index_mutated: false,
  homepage_mutated: false,
  github_write_performed: false,
  deployment_triggered: false,
  published: false
};

const routingModel = {
  module_id: "AG26A_ALIGNMENT",
  title: "Admin-Editor-System Routing Model",
  status: "admin_editor_system_routing_model_created_ready_for_ag26b",
  purpose: "Clarify role routing for editor-created article candidates, system-generated content, Admin review, Editor editing assignment and final publishing authority.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  role_routing_rules: {
    editor_independent_new_article_candidate_allowed: true,
    editor_can_use_full_toolset_for_own_new_article_candidate: true,
    editor_new_article_candidate_goes_to_admin_review: true,

    system_generated_content_first_goes_to_admin: true,
    admin_core_reviewer_for_system_generated_content: true,
    admin_can_publish_system_generated_content_after_review: true,
    admin_can_send_system_generated_content_to_editor_for_editing: true,

    editor_direct_system_article_pickup_allowed: false,
    editor_direct_system_article_edit_allowed: false,
    editor_can_edit_admin_assigned_system_article: true,
    editor_can_use_full_toolset_for_admin_assigned_edit: true,
    editor_returns_to_admin_after_edit: true,

    admin_final_reviewer_after_editor_return: true,
    admin_final_publish_authority: true,
    editor_publish_authority: false
  },
  canonical_flows: [
    {
      flow_id: "editor_new_article_candidate_flow",
      title: "Editor Independent New Article Candidate Flow",
      steps: [
        "Editor creates a new article candidate independently.",
        "Editor may use article authoring, reference, image, graph, table, infographic, diagram, layout and preview tools.",
        "Editor submits the candidate to Admin.",
        "Admin reviews and decides hold, return, approve for future publication, or publish when publishing path is active."
      ],
      editor_can_initiate: true,
      admin_review_required: true,
      editor_publish_allowed: false
    },
    {
      flow_id: "system_generated_content_review_flow",
      title: "System/AI Generated Content Review Flow",
      steps: [
        "System/AI pipeline generates article or module candidate.",
        "System sends the candidate to Admin first.",
        "Admin reviews the system-generated candidate.",
        "Admin may publish, hold, reject, or send to Editor for editing.",
        "Editor edits only if Admin assigns it.",
        "Editor returns edited candidate to Admin.",
        "Admin makes final publish decision."
      ],
      editor_can_initiate: false,
      admin_review_required: true,
      editor_publish_allowed: false
    },
    {
      flow_id: "admin_assigned_editor_edit_flow",
      title: "Admin-Assigned Editor Edit Flow",
      steps: [
        "Admin forwards a system-generated or existing article candidate to Editor.",
        "Editor edits using the full editor toolset.",
        "Editor may correct references, attribution, objects, layout, SEO/card fields and article sections.",
        "Editor sends the edited version back to Admin.",
        "Admin performs final review and publication decision."
      ],
      editor_can_initiate: false,
      admin_assignment_required: true,
      editor_publish_allowed: false
    }
  ],
  blocked_state: blockedState
};

const authoringEditPolicy = {
  module_id: "AG26A_ALIGNMENT",
  title: "Editor Authoring and Admin-Assigned Edit Policy",
  status: "editor_authoring_admin_assigned_edit_policy_created",
  editor_permissions: {
    independent_new_article_candidate_creation: true,
    independent_new_article_tool_use: true,
    independent_system_generated_article_edit: false,
    edit_admin_assigned_system_generated_article: true,
    edit_admin_assigned_existing_article: true,
    send_back_to_admin: true,
    publish_to_world: false
  },
  admin_permissions: {
    receives_system_generated_content_first: true,
    core_reviewer_for_system_generated_content: true,
    assigns_to_editor_for_editing: true,
    receives_editor_returned_content: true,
    final_publish_authority: true
  },
  system_permissions: {
    system_pushes_generated_content_to_admin: true,
    system_pushes_generated_content_directly_to_editor: false,
    system_publishes_without_admin: false
  },
  blocked_state: blockedState
};

plan.admin_editor_system_routing_model_file = outputs.routingModel;
plan.editor_authoring_and_admin_assigned_edit_policy_file = outputs.authoringEditPolicy;
plan.routing_governance = {
  editor_independent_new_article_candidate_allowed: true,
  editor_can_use_full_toolset_for_new_article_candidate: true,
  editor_new_article_candidate_must_go_to_admin: true,

  system_generated_content_first_goes_to_admin: true,
  admin_core_reviewer_for_system_generated_content: true,
  admin_can_forward_system_generated_content_to_editor: true,

  editor_direct_system_article_edit_allowed: false,
  editor_can_edit_admin_assigned_system_article: true,
  editor_returns_to_admin_after_edit: true,

  admin_final_publish_authority: true,
  editor_publish_authority: false
};

review.routing_alignment_file = outputs.review;
review.admin_editor_system_routing_model_file = outputs.routingModel;
review.editor_authoring_and_admin_assigned_edit_policy_file = outputs.authoringEditPolicy;
review.summary = {
  ...review.summary,
  admin_editor_system_routing_aligned: true,
  editor_independent_new_article_candidate_allowed: true,
  editor_direct_system_article_edit_allowed: false,
  editor_can_edit_admin_assigned_system_article: true,
  system_generated_content_first_goes_to_admin: true,
  admin_core_reviewer_for_system_generated_content: true,
  editor_returns_to_admin_after_edit: true,
  admin_final_publish_authority: true,
  editor_publish_authority: false
};

preview.admin_editor_system_routing_aligned = true;
preview.editor_independent_new_article_candidate_allowed = true;
preview.editor_direct_system_article_edit_allowed = 0;
preview.editor_can_edit_admin_assigned_system_article = true;
preview.system_generated_content_first_goes_to_admin = true;
preview.admin_final_publish_authority = true;
preview.editor_publish_authority = 0;

readiness.admin_editor_system_routing_aligned = true;
readiness.ready_for_ag26b = true;

boundary.allowed_scope = Array.from(new Set([
  ...(boundary.allowed_scope || []),
  "Consume AG26A Admin-Editor-System routing model.",
  "Plan Admin workspace as the core review, assignment and final publish-control surface.",
  "Preserve rule that system-generated content first goes to Admin.",
  "Preserve rule that Editor may independently create new article candidates but cannot publish.",
  "Preserve rule that Editor edits system-generated content only after Admin assignment."
]));

blocker.blocked_items = Array.from(new Set([
  ...(blocker.blocked_items || []),
  "No Editor direct edit of system-generated content without Admin assignment.",
  "No Editor publishing authority.",
  "No system-generated content bypassing Admin review.",
  "No system publishing without Admin."
]));

const alignmentReview = {
  module_id: "AG26A_ALIGNMENT",
  title: "Editor/Admin Routing Alignment",
  status: "editor_admin_routing_alignment_created_ready_for_ag26b",
  depends_on: ["AG26A", "AG25Z", "AG26", "AG27"],
  generated_from: files,
  patched_files: [
    files.ag26aPlan,
    files.ag26aReview,
    files.ag26aPreview,
    files.ag26aReadiness,
    files.ag26aBoundary,
    files.ag26aBlocker
  ],
  generated_files: outputs,
  summary: {
    routing_alignment_created: true,
    editor_independent_new_article_candidate_allowed: true,
    editor_new_article_candidate_goes_to_admin_review: true,
    system_generated_content_first_goes_to_admin: true,
    admin_core_reviewer_for_system_generated_content: true,
    admin_can_forward_system_content_to_editor_for_edit: true,
    editor_direct_system_article_edit_allowed: false,
    editor_can_edit_admin_assigned_system_article: true,
    editor_returns_to_admin_after_edit: true,
    admin_final_publish_authority: true,
    editor_publish_authority: false,
    ready_for_ag26b: true,
    article_mutation_done: false,
    backend_activation_done: false,
    deployment_done: false,
    publishing_done: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG26A_ALIGNMENT",
  title: alignmentReview.title,
  status: alignmentReview.status,
  generated_artifacts: outputs
};

const alignmentPreview = {
  module_id: "AG26A_ALIGNMENT",
  preview_only: true,
  status: alignmentReview.status,
  message: "AG26A routing alignment created. Editor can independently create new article candidates, but system-generated content goes to Admin first; Editor edits system content only after Admin assignment and returns it to Admin.",
  editor_independent_new_article_candidate_allowed: true,
  editor_direct_system_article_edit_allowed: 0,
  editor_can_edit_admin_assigned_system_article: true,
  system_generated_content_first_goes_to_admin: true,
  admin_final_publish_authority: true,
  editor_publish_authority: 0,
  mutated_articles: 0,
  public_items: 0,
  backend_objects: 0
};

const doc = `# AG26A Alignment — Editor/Admin/System Routing

## Corrected Governance

Editor is an independent creator for new article candidates, but Editor is not the final publisher.

For system-generated or AI-generated content, the system sends the generated content first to Admin. Admin is the core reviewer. Admin may publish, hold, reject, or forward the item to Editor for editing. Editor edits only when Admin assigns such system-generated or existing article content, then sends it back to Admin. Admin remains the final reviewer and final publish authority.

## Canonical Flows

### Editor Independent New Article Candidate

Editor creates a new article candidate independently, uses all editor tools, and sends it to Admin for review. Editor cannot publish.

### System/AI Generated Article

System creates candidate, sends to Admin first, Admin reviews. If editing is required, Admin forwards to Editor. Editor edits and returns to Admin. Admin decides final publication.

### Admin-Assigned Edit

Admin assigns a generated/existing article to Editor. Editor uses full toolset for correction/enrichment and returns it to Admin. Admin publishes only after final review.

## Preserved Blocks

No runtime UI, no login, no Auth, no backend, no Supabase, no article mutation, no GitHub write, no deployment and no publishing are performed in this alignment patch.
`;

writeJson(files.ag26aPlan, plan);
writeJson(files.ag26aReview, review);
writeJson(files.ag26aPreview, preview);
writeJson(files.ag26aReadiness, readiness);
writeJson(files.ag26aBoundary, boundary);
writeJson(files.ag26aBlocker, blocker);

writeJson(outputs.review, alignmentReview);
writeJson(outputs.routingModel, routingModel);
writeJson(outputs.authoringEditPolicy, authoringEditPolicy);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, alignmentPreview);
writeText(outputs.doc, doc);

console.log("✅ AG26A Editor/Admin/System routing alignment generated.");
console.log("✅ Editor independent new article candidate creation preserved.");
console.log("✅ System-generated content now routes to Admin first.");
console.log("✅ Editor edits system-generated/existing content only after Admin assignment.");
console.log("✅ Admin remains final reviewer and publish authority.");
console.log("✅ No runtime UI, Auth, backend, article mutation, deployment or publishing performed.");
