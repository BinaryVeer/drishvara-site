import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag25UmbrellaPlan: "data/content-intelligence/featured-reads/ag25-featured-reads-production-strengthening-plan.json",
  ag25SourceGate: "data/content-intelligence/featured-reads/ag25-featured-reads-source-reference-gate-model.json",
  ag25ProductionControl: "data/content-intelligence/featured-reads/ag25-featured-reads-production-control-model.json",
  ag25QualityModel: "data/content-intelligence/featured-reads/ag25-featured-reads-quality-strengthening-model.json",

  ag25aReview: "data/content-intelligence/quality-reviews/ag25a-featured-reads-inventory-gap-audit.json",
  ag25aAudit: "data/content-intelligence/featured-reads/ag25a-featured-reads-inventory-gap-audit.json",
  ag25aInventory: "data/content-intelligence/featured-reads/ag25a-featured-reads-inventory-register.json",
  ag25aGapRegister: "data/content-intelligence/featured-reads/ag25a-featured-reads-gap-register.json",
  ag25aCategorySummary: "data/content-intelligence/featured-reads/ag25a-category-card-summary-inventory.json",

  ag25bReview: "data/content-intelligence/quality-reviews/ag25b-reference-verification-strengthening.json",
  ag25bPlan: "data/content-intelligence/featured-reads/ag25b-reference-verification-strengthening-plan.json",
  ag25bWorklist: "data/content-intelligence/featured-reads/ag25b-reference-verification-worklist.json",
  ag25bSchema: "data/content-intelligence/featured-reads/ag25b-reference-status-schema.json",
  ag25bPriority: "data/content-intelligence/featured-reads/ag25b-reference-priority-register.json",

  ag25cReview: "data/content-intelligence/quality-reviews/ag25c-image-credit-attribution-completion.json",
  ag25cPlan: "data/content-intelligence/featured-reads/ag25c-image-credit-attribution-completion-plan.json",
  ag25cWorklist: "data/content-intelligence/featured-reads/ag25c-image-credit-attribution-worklist.json",
  ag25cSchema: "data/content-intelligence/featured-reads/ag25c-attribution-status-schema.json",
  ag25cPriority: "data/content-intelligence/featured-reads/ag25c-object-credit-priority-register.json",

  ag25dReview: "data/content-intelligence/quality-reviews/ag25d-featured-reads-layout-audit.json",
  ag25dPlan: "data/content-intelligence/featured-reads/ag25d-featured-reads-layout-audit-plan.json",
  ag25dWorklist: "data/content-intelligence/featured-reads/ag25d-layout-readiness-worklist.json",
  ag25dCardModel: "data/content-intelligence/featured-reads/ag25d-card-summary-layout-check-model.json",
  ag25dMobileModel: "data/content-intelligence/featured-reads/ag25d-mobile-article-width-audit-model.json",
  ag25dReadiness: "data/content-intelligence/quality-registry/ag25d-featured-reads-production-readiness-closure-readiness-record.json",
  ag25dBoundary: "data/content-intelligence/mutation-plans/ag25d-to-ag25z-featured-reads-production-readiness-closure-boundary.json",

  ag24zClosure: "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json",
  ag26UmbrellaPlan: "data/content-intelligence/admin-editor/ag26-admin-editor-manual-workflow-strengthening-plan.json",
  ag27DecisionCheckpoint: "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag25z-featured-reads-production-readiness-closure.json",
  closure: "data/content-intelligence/featured-reads/ag25z-featured-reads-production-readiness-closure.json",
  sourceChain: "data/content-intelligence/featured-reads/ag25z-ag25-detailed-source-chain-register.json",
  readinessMatrix: "data/content-intelligence/featured-reads/ag25z-featured-reads-readiness-matrix.json",
  unresolvedRegister: "data/content-intelligence/featured-reads/ag25z-unresolved-featured-reads-work-register.json",
  consumptionPlan: "data/content-intelligence/featured-reads/ag25z-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag25z-featured-reads-production-readiness-closure-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag25z-editor-workspace-ux-plan-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag25z-to-ag26a-editor-workspace-ux-plan-boundary.json",
  registry: "data/quality/ag25z-featured-reads-production-readiness-closure.json",
  preview: "data/quality/ag25z-featured-reads-production-readiness-closure-preview.json",
  doc: "docs/quality/AG25Z_FEATURED_READS_PRODUCTION_READINESS_CLOSURE.md"
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

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG25Z input: ${p}`);
}

const records = Object.fromEntries(
  Object.entries(inputs).map(([key, file]) => [key, readJson(file)])
);

if (records.ag25UmbrellaPlan.status !== "featured_reads_production_strengthening_created_ready_for_ag26") throw new Error("AG25 umbrella plan status mismatch.");
if (records.ag25aReview.status !== "featured_reads_inventory_gap_audit_created_ready_for_ag25b") throw new Error("AG25A review status mismatch.");
if (records.ag25bReview.status !== "reference_verification_strengthening_created_ready_for_ag25c") throw new Error("AG25B review status mismatch.");
if (records.ag25cReview.status !== "image_credit_attribution_completion_created_ready_for_ag25d") throw new Error("AG25C review status mismatch.");
if (records.ag25dReview.status !== "featured_reads_layout_audit_created_ready_for_ag25z") throw new Error("AG25D review status mismatch.");
if (records.ag25dPlan.status !== "featured_reads_layout_audit_created_ready_for_ag25z") throw new Error("AG25D plan status mismatch.");
if (records.ag25dReadiness.ready_for_ag25z !== true) throw new Error("AG25D readiness does not permit AG25Z.");
if (records.ag25dBoundary.next_stage_id !== "AG25Z") throw new Error("AG25D boundary does not point to AG25Z.");
if (records.ag24zClosure.status !== "episodic_knowledge_engine_closed_ready_for_ag25") throw new Error("AG24Z closure status mismatch.");
if (records.ag26UmbrellaPlan.status !== "admin_editor_manual_workflow_strengthening_created_ready_for_ag27") throw new Error("AG26 umbrella plan status mismatch.");
if (records.ag27DecisionCheckpoint.checkpoint_decision?.backend_deferred !== true) throw new Error("Backend must remain deferred.");

const blockedState = {
  ag25_detailed_chain_closed: true,
  featured_read_generation_enabled: false,
  article_file_created: false,
  article_file_mutated: false,
  reference_runtime_verification_enabled: false,
  attribution_runtime_enabled: false,
  layout_runtime_enabled: false,
  image_generation_triggered: false,
  public_index_mutated: false,
  homepage_mutated: false,
  category_page_mutated: false,
  sitemap_feed_mutated: false,
  data_written_to_runtime: false,
  github_token_created: false,
  github_write_performed: false,
  deployment_triggered: false,
  published: false,
  supabase_auth_backend_activated: false
};

const sourceChain = {
  module_id: "AG25Z",
  title: "AG25 Detailed Source Chain Register",
  status: "ag25_detailed_source_chain_registered_for_closure",
  chain_length: 4,
  closed_chain: [
    {
      stage_id: "AG25A",
      title: "Featured Reads Inventory and Gap Audit",
      status: records.ag25aAudit.status,
      file: inputs.ag25aAudit
    },
    {
      stage_id: "AG25B",
      title: "Reference Verification Strengthening",
      status: records.ag25bPlan.status,
      file: inputs.ag25bPlan
    },
    {
      stage_id: "AG25C",
      title: "Image Credit and Attribution Completion",
      status: records.ag25cPlan.status,
      file: inputs.ag25cPlan
    },
    {
      stage_id: "AG25D",
      title: "Featured Reads Layout Audit",
      status: records.ag25dPlan.status,
      file: inputs.ag25dPlan
    }
  ],
  umbrella_records_consumed: [
    inputs.ag25UmbrellaPlan,
    inputs.ag26UmbrellaPlan,
    inputs.ag27DecisionCheckpoint
  ],
  blocked_state: blockedState
};

const readinessMatrix = {
  module_id: "AG25Z",
  title: "Featured Reads Readiness Matrix",
  status: "featured_reads_readiness_matrix_created_no_public_mutation",
  inventory: {
    article_files_scanned: records.ag25aInventory.total_article_files_scanned,
    categories_detected: records.ag25aInventory.total_categories_detected,
    articles_with_gaps: records.ag25aGapRegister.total_articles_with_gaps,
    total_gap_count: records.ag25aGapRegister.total_gap_count
  },
  references: {
    total_work_items: records.ag25bWorklist.total_work_items,
    items_requiring_reference_strengthening: records.ag25bWorklist.items_requiring_reference_strengthening,
    runtime_link_check_performed: false
  },
  attribution: {
    total_work_items: records.ag25cWorklist.total_work_items,
    items_requiring_credit_or_attribution_completion: records.ag25cWorklist.items_requiring_credit_or_attribution_completion,
    runtime_attribution_check_performed: false
  },
  layout: {
    total_work_items: records.ag25dWorklist.total_work_items,
    items_requiring_layout_review: records.ag25dWorklist.items_requiring_layout_review,
    runtime_layout_check_performed: false
  },
  closure_readiness: {
    ready_for_editor_workspace_ux_plan: true,
    ready_for_publication: false,
    ready_for_deployment: false,
    ready_for_backend_activation: false
  },
  blocked_state: blockedState
};

const unresolvedRegister = {
  module_id: "AG25Z",
  title: "Unresolved Featured Reads Work Register",
  status: "unresolved_featured_reads_work_registered_for_ag26a",
  unresolved_groups: {
    inventory_gaps: records.ag25aGapRegister.total_gap_count,
    reference_strengthening_items: records.ag25bWorklist.items_requiring_reference_strengthening,
    attribution_completion_items: records.ag25cWorklist.items_requiring_credit_or_attribution_completion,
    layout_review_items: records.ag25dWorklist.items_requiring_layout_review
  },
  carry_forward_to_ag26a: [
    "Editor workspace should expose correction fields for reference status.",
    "Editor workspace should expose correction fields for image credit and attribution status.",
    "Editor workspace should expose correction fields for card/summary/layout readiness.",
    "Editor workspace should preserve public=false and publish=false controls."
  ],
  unresolved_publication_status: "not_ready_for_publication",
  blocked_state: blockedState
};

const consumptionPlan = {
  module_id: "AG25Z",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag26a_to_ag26z",
  future_consumption: {
    AG26A: "Editor Workspace UX Plan should consume AG25Z readiness matrix and unresolved work register to design editor-side correction/review surfaces.",
    AG26B: "Admin Workspace UX Plan should consume AG25Z closure and blocker records for admin governance/status dashboards.",
    AG26C: "Static UX Scaffold should consume AG25Z closure without enabling runtime backend.",
    AG26D: "UX Scaffold Audit should verify that AG25Z unresolved work can be reviewed without public mutation.",
    AG26Z: "Manual Admin/Editor Workflow Closure should close AG26A-AG26D while preserving AG27 backend deferral."
  },
  blocked_state: blockedState
};

const closure = {
  module_id: "AG25Z",
  title: "Featured Reads Production Readiness Closure",
  status: "featured_reads_production_readiness_closed_ready_for_ag26a",
  purpose:
    "Close the detailed AG25A-AG25D Featured Reads Production Readiness chain and hand off unresolved reference, attribution, layout and card-readiness work to AG26A Editor Workspace UX Plan without publishing or mutating public files.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  consumed_source_summary: {
    ag25_umbrella_status: records.ag25UmbrellaPlan.status,
    ag25a_status: records.ag25aAudit.status,
    ag25b_status: records.ag25bPlan.status,
    ag25c_status: records.ag25cPlan.status,
    ag25d_status: records.ag25dPlan.status,
    ag24z_status: records.ag24zClosure.status,
    ag26_umbrella_status: records.ag26UmbrellaPlan.status,
    ag27_backend_deferred: records.ag27DecisionCheckpoint.checkpoint_decision?.backend_deferred === true
  },
  closure_decision: {
    ag25_detailed_chain_closed: true,
    ready_for_ag26a: true,
    next_stage_id: "AG26A",
    next_stage_title: "Editor Workspace UX Plan",
    publication_ready: false,
    deployment_ready: false,
    backend_activation_ready: false,
    no_public_mutation_done: true,
    no_runtime_activation_done: true
  },
  closure_summary: {
    detailed_stages_closed: 4,
    article_files_scanned: records.ag25aInventory.total_article_files_scanned,
    categories_detected: records.ag25aInventory.total_categories_detected,
    total_inventory_gaps: records.ag25aGapRegister.total_gap_count,
    reference_strengthening_items: records.ag25bWorklist.items_requiring_reference_strengthening,
    attribution_completion_items: records.ag25cWorklist.items_requiring_credit_or_attribution_completion,
    layout_review_items: records.ag25dWorklist.items_requiring_layout_review,
    generated_featured_reads: false,
    article_file_mutation_done: false,
    public_publish_done: false,
    backend_activation_done: false
  },
  source_chain_file: outputs.sourceChain,
  readiness_matrix_file: outputs.readinessMatrix,
  unresolved_register_file: outputs.unresolvedRegister,
  future_consumption_plan_file: outputs.consumptionPlan,
  supabase_auth_backend_deferred: true,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG25Z",
  title: "Featured Reads Production Readiness Closure Blocker Register",
  status: "ag25_closed_runtime_operations_blocked_pending_ag26a",
  blocked_items: [
    "No Featured Read generation.",
    "No article file creation.",
    "No article file mutation.",
    "No runtime reference verification.",
    "No runtime attribution check.",
    "No runtime layout check.",
    "No image generation trigger.",
    "No public index mutation.",
    "No homepage mutation.",
    "No category page mutation.",
    "No sitemap/feed mutation.",
    "No GitHub token creation.",
    "No GitHub write.",
    "No deployment trigger.",
    "No publishing.",
    "No Supabase/Auth/backend activation."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG25Z",
  title: "Editor Workspace UX Plan Readiness Record",
  status: "ready_for_ag26a_editor_workspace_ux_plan",
  ready_for_ag26a: true,
  next_stage_id: "AG26A",
  next_stage_title: "Editor Workspace UX Plan",
  ag25_detailed_closure_created: true,
  source_chain_registered: true,
  readiness_matrix_created: true,
  unresolved_register_created: true,
  real_execution_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG25Z",
  title: "AG25Z to AG26A Editor Workspace UX Plan Boundary",
  status: "ag26a_boundary_created_not_started",
  next_stage_id: "AG26A",
  next_stage_title: "Editor Workspace UX Plan",
  allowed_scope: [
    "Consume AG25Z Featured Reads readiness matrix.",
    "Consume unresolved reference, attribution, card and layout work registers.",
    "Design editor-side planning UX only.",
    "Keep account creation, Auth, backend, article mutation, public mutation, deployment and publishing blocked."
  ],
  blocked_scope: blocker.blocked_items,
  supabase_auth_backend_deferred: true
};

const review = {
  module_id: "AG25Z",
  title: "Featured Reads Production Readiness Closure",
  status: "featured_reads_production_readiness_closed_ready_for_ag26a",
  depends_on: ["AG25A", "AG25B", "AG25C", "AG25D", "AG25", "AG24Z", "AG26", "AG27"],
  generated_from: inputs,
  closure_file: outputs.closure,
  source_chain_file: outputs.sourceChain,
  readiness_matrix_file: outputs.readinessMatrix,
  unresolved_register_file: outputs.unresolvedRegister,
  future_consumption_plan_file: outputs.consumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    featured_reads_production_readiness_closed: true,
    ag25_detailed_chain_closed: true,
    detailed_stages_closed: 4,
    ready_for_ag26a: true,
    publication_ready: false,
    deployment_ready: false,
    backend_activation_ready: false,
    generated_featured_reads: false,
    article_file_mutation_done: false,
    public_mutation_done: false,
    deployment_done: false,
    publishing_done: false,
    backend_activation_done: false,
    real_execution_done: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG25Z",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG25Z",
  preview_only: true,
  status: review.status,
  message: "AG25Z Featured Reads Production Readiness Closure created. Next: AG26A Editor Workspace UX Plan.",
  detailed_stages_closed: 4,
  ready_for_ag26a: true,
  publication_ready: 0,
  deployment_ready: 0,
  generated_featured_reads: 0,
  mutated_articles: 0,
  public_items: 0,
  backend_objects: 0,
  blocked_state: blockedState
};

const doc = `# AG25Z — Featured Reads Production Readiness Closure

## Purpose

AG25Z closes the detailed AG25 Featured Reads Production Readiness chain.

## Closed Chain

- AG25A — Featured Reads Inventory and Gap Audit.
- AG25B — Reference Verification Strengthening.
- AG25C — Image Credit and Attribution Completion.
- AG25D — Featured Reads Layout Audit.

## Closure Finding

AG25 detailed readiness is closed as a governed, non-mutating, non-publishing and no-backend planning foundation.

## Handoff

Next stage: AG26A — Editor Workspace UX Plan.

AG26A must consume AG25Z readiness matrix and unresolved work register, especially reference, attribution, card, summary and layout correction needs.

## Blocked State

No Featured Read generation, article mutation, runtime verification, image generation, layout mutation, public mutation, GitHub write, deployment, publishing or Supabase/Auth/backend activation is performed.
`;

writeJson(outputs.review, review);
writeJson(outputs.closure, closure);
writeJson(outputs.sourceChain, sourceChain);
writeJson(outputs.readinessMatrix, readinessMatrix);
writeJson(outputs.unresolvedRegister, unresolvedRegister);
writeJson(outputs.consumptionPlan, consumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG25Z Featured Reads Production Readiness Closure generated.");
console.log("✅ AG25A-AG25D detailed source chain closed.");
console.log("✅ Readiness matrix and unresolved work register created.");
console.log("✅ No generation, article mutation, public mutation, deployment, publishing or backend activation performed.");
console.log("✅ AG26A Editor Workspace UX Plan boundary created.");
