import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag14zReview: "data/content-intelligence/quality-reviews/ag14z-admin-editor-secure-handler-chain-closure.json",
  ag14zClosure: "data/content-intelligence/closure-records/ag14z-admin-editor-secure-handler-chain-closure.json",
  ag14zSummary: "data/content-intelligence/admin-architecture/ag14z-admin-editor-chain-completion-summary.json",
  ag14zBlocked: "data/content-intelligence/quality-registry/ag14z-live-implementation-blocked-register.json",
  ag14zReadiness: "data/content-intelligence/quality-registry/ag14z-next-path-readiness-record.json",
  ag14zBoundary: "data/content-intelligence/mutation-plans/ag14z-to-ag15a-next-path-decision-boundary.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",
  ag13zQueueIndex: "data/admin-review/index/admin-review-queue-index.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag15a-next-path-decision-after-admin-editor-chain-closure.json");
const decisionPath = path.join(root, "data/content-intelligence/content-pipeline/ag15a-next-path-decision-record.json");
const conveyorPath = path.join(root, "data/content-intelligence/content-pipeline/ag15a-generated-article-admin-queue-conveyor-scope-record.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag15a-generated-article-admin-queue-integration-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag15a-to-ag15b-generated-article-admin-queue-integration-plan-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/next-path-decision-after-admin-editor-chain-closure.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag15a-next-path-decision-after-admin-editor-chain-closure-learning.json");
const registryPath = path.join(root, "data/quality/ag15a-next-path-decision-after-admin-editor-chain-closure.json");
const previewPath = path.join(root, "data/quality/ag15a-next-path-decision-after-admin-editor-chain-closure-preview.json");
const docPath = path.join(root, "docs/quality/AG15A_NEXT_PATH_DECISION_AFTER_ADMIN_EDITOR_CHAIN_CLOSURE.md");

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function writeJson(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n");
}

function writeText(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, value);
}

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) throw new Error(`Missing AG15A input ${name}: ${relativePath}`);
}

const ag14zReview = readJson(inputs.ag14zReview);
const ag14zClosure = readJson(inputs.ag14zClosure);
const ag14zSummary = readJson(inputs.ag14zSummary);
const ag14zBlocked = readJson(inputs.ag14zBlocked);
const ag14zReadiness = readJson(inputs.ag14zReadiness);
const ag14zBoundary = readJson(inputs.ag14zBoundary);
const ag13zCandidate = readJson(inputs.ag13zCandidate);
const ag13zQueueIndex = readJson(inputs.ag13zQueueIndex);

if (ag14zReview.status !== "admin_editor_secure_handler_chain_closed_future_live_implementation_blocked") {
  throw new Error("AG15A requires AG14Z review closure.");
}
if (ag14zClosure.final_decision.ag14_chain_closed !== true) {
  throw new Error("AG15A requires AG14 chain to be closed.");
}
if (ag14zReadiness.ready_for_ag15a !== true) {
  throw new Error("AG15A requires AG14Z readiness.");
}
if (ag14zBoundary.next_stage_id !== "AG15A" || ag14zBoundary.explicit_approval_required !== true) {
  throw new Error("AG15A requires AG14Z to AG15A explicit boundary.");
}

const selectedArticlePath = ag13zCandidate.selected_article_path;
if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);

const articleHash = sha256(fs.readFileSync(path.join(root, selectedArticlePath), "utf8"));
if (articleHash !== ag13zCandidate.article_hash) {
  throw new Error("AG15A requires AG13Z seed candidate hash to remain unchanged.");
}

const stageControls = {
  next_path_decision_after_ag14_closure_only: true,
  next_path_decision_created_in_ag15a: true,
  generated_article_admin_queue_conveyor_scope_created_in_ag15a: true,
  ag15b_boundary_created_in_ag15a: true,
  selected_article_read_performed: true,

  article_generation_performed_in_ag15a: false,
  article_mutation_performed_in_ag15a: false,
  queue_mutation_performed_in_ag15a: false,
  admin_action_execution_performed_in_ag15a: false,
  editor_action_execution_performed_in_ag15a: false,
  real_credential_created_in_ag15a: false,
  hardcoded_password_created_in_ag15a: false,
  password_hash_created_in_repo_in_ag15a: false,
  auth_activation_performed_in_ag15a: false,
  backend_activation_performed_in_ag15a: false,
  supabase_activation_performed_in_ag15a: false,
  database_write_performed_in_ag15a: false,
  github_token_created_or_exposed_in_ag15a: false,
  github_write_operation_performed_in_ag15a: false,
  active_action_handler_created_in_ag15a: false,
  api_endpoint_created_in_ag15a: false,
  public_visibility_switch_performed_in_ag15a: false,
  public_publishing_operation_performed_in_ag15a: false,
  deployment_trigger_performed_in_ag15a: false
};

const decision = {
  module_id: "AG15A",
  title: "Next Path Decision after Admin Editor Secure Handler Chain Closure",
  status: "next_path_decision_completed_content_queue_integration_selected",
  ag14_chain_state: {
    ag14_chain_closed: true,
    completed_stage_count: ag14zSummary.completed_stage_count,
    live_admin_editor_implementation_blocked: true,
    public_publish_execution_active: false
  },
  decision_options: [
    {
      path_id: "content_article_queue_integration",
      label: "Generated Article to Admin Review Queue Integration",
      selected: true,
      rationale: [
        "New generated articles must systematically land in Admin Review Queue after quality checks.",
        "Admin/Editor architecture is ready as a governed destination, but real action execution remains blocked.",
        "This path strengthens production movement without premature Auth/action-handler activation."
      ],
      next_stage: "AG15B"
    },
    {
      path_id: "admin_editor_visual_refinement",
      label: "Admin/Editor visual UI refinement only",
      selected: false,
      rationale: [
        "Useful later, but less urgent than ensuring future generated articles enter the review queue."
      ]
    },
    {
      path_id: "real_auth_action_execution_planning",
      label: "Real Auth/action-handler implementation planning",
      selected: false,
      rationale: [
        "Premature until generated article queue integration and publication-state records are stable."
      ]
    }
  ],
  selected_path: {
    path_id: "content_article_queue_integration",
    next_stage_id: "AG15B",
    next_stage_title: "Generated Article to Admin Review Queue Integration Plan"
  },
  retained_blocks: ag14zBlocked.final_ag14_blocked_items,
  ...stageControls
};

const conveyorScope = {
  module_id: "AG15A",
  title: "Generated Article Admin Queue Conveyor Scope Record",
  status: "generated_article_admin_queue_conveyor_scope_defined",
  purpose: "Define the next production conveyor belt from future generated article to Admin Review Queue without enabling live publishing.",
  conveyor_principle: "Every newly generated article should have a deterministic path: generation output → quality evidence → preview state → Admin Review Queue record → public visibility remains false until approved.",
  current_seed_queue_state: {
    seed_queue_index: inputs.ag13zQueueIndex,
    seed_candidate: {
      article_id: ag13zCandidate.article_id,
      selected_article_path: ag13zCandidate.selected_article_path,
      status: ag13zCandidate.status,
      publish_readiness_score: ag13zCandidate.publish_readiness_score,
      public_visibility: ag13zCandidate.public_visibility,
      publish_approved: ag13zCandidate.publish_approved
    }
  },
  ag15b_planning_scope: [
    "Define generated article intake record.",
    "Define required quality evidence before Admin queue handoff.",
    "Define generated article queue record schema.",
    "Define article preview/public visibility flags.",
    "Define reference/credit/object/layout readiness fields.",
    "Define batch validation checks.",
    "Define failure states and non-public archive states.",
    "Keep actual article generation and queue mutation blocked until later approved stage."
  ],
  ag15b_core_questions: [
    "What minimum metadata must every generated article carry?",
    "Which quality checks must pass before Admin queue entry?",
    "How should public visibility remain false by default?",
    "How should rejected/archived article intelligence be retained?",
    "How should object-rich and text-only articles be routed differently?"
  ],
  not_in_ag15b_scope_yet: [
    "No new article generation.",
    "No live Admin/Editor action execution.",
    "No real Auth.",
    "No public publishing.",
    "No visibility switch.",
    "No GitHub write token wiring."
  ],
  ...stageControls
};

const readiness = {
  module_id: "AG15A",
  title: "Generated Article Admin Queue Integration Readiness Record",
  status: "ready_for_ag15b_generated_article_admin_queue_integration_plan",
  ready_for_ag15b: true,
  ag15b_explicit_approval_required: true,
  selected_next_path: "content_article_queue_integration",
  article_generation_ready: false,
  queue_mutation_ready: false,
  admin_action_execution_ready: false,
  real_auth_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  github_write_ready: false,
  publish_ready: false,
  reason: "AG15A chooses the content/article queue integration path. AG15B should plan schema and governance only before any generation or mutation.",
  ...stageControls
};

const boundary = {
  module_id: "AG15A",
  title: "AG15A to AG15B Generated Article Admin Queue Integration Plan Boundary",
  status: "ag15b_boundary_created_not_started",
  next_stage_id: "AG15B",
  next_stage_title: "Generated Article to Admin Review Queue Integration Plan",
  explicit_approval_required: true,
  ag15b_allowed_scope: [
    "Plan generated article intake-to-admin-queue conveyor.",
    "Define generated article queue record schema.",
    "Define mandatory quality-evidence fields.",
    "Define preview/public visibility state fields.",
    "Define batch validation requirements.",
    "Define archive/return/failure states for generated articles.",
    "Define object-rich versus text-only routing logic."
  ],
  ag15b_blocked_scope: [
    "No new article generation.",
    "No article mutation.",
    "No queue mutation.",
    "No Admin/Editor action execution.",
    "No real credentials.",
    "No Auth/backend/Supabase activation.",
    "No GitHub write token wiring.",
    "No public visibility switch.",
    "No publishing operation.",
    "No deployment trigger."
  ],
  ...stageControls
};

const schema = {
  module_id: "AG15A",
  title: "Next Path Decision after Admin Editor Chain Closure Schema",
  status: "schema_next_path_decision_after_ag14_closure_only",
  next_path_decision_allowed_in_ag15a: true,
  content_queue_integration_selection_allowed_in_ag15a: true,
  conveyor_scope_record_allowed_in_ag15a: true,
  ag15b_boundary_allowed_in_ag15a: true,

  article_generation_allowed_in_ag15a: false,
  article_mutation_allowed_in_ag15a: false,
  queue_mutation_allowed_in_ag15a: false,
  admin_action_execution_allowed_in_ag15a: false,
  editor_action_execution_allowed_in_ag15a: false,
  real_credential_creation_allowed_in_ag15a: false,
  hardcoded_password_allowed_in_ag15a: false,
  password_hash_commit_allowed_in_ag15a: false,
  auth_activation_allowed_in_ag15a: false,
  backend_activation_allowed_in_ag15a: false,
  supabase_activation_allowed_in_ag15a: false,
  database_write_allowed_in_ag15a: false,
  github_token_creation_or_exposure_allowed_in_ag15a: false,
  github_write_operation_allowed_in_ag15a: false,
  active_action_handler_creation_allowed_in_ag15a: false,
  public_visibility_switch_allowed_in_ag15a: false,
  public_publishing_operation_allowed_in_ag15a: false,
  deployment_trigger_allowed_in_ag15a: false,
  ...stageControls
};

const review = {
  module_id: "AG15A",
  title: "Next Path Decision after Admin Editor Secure Handler Chain Closure",
  status: "next_path_decision_completed_content_queue_integration_selected",
  depends_on: ["AG14Z"],
  generated_from: inputs,
  decision_file: "data/content-intelligence/content-pipeline/ag15a-next-path-decision-record.json",
  conveyor_scope_file: "data/content-intelligence/content-pipeline/ag15a-generated-article-admin-queue-conveyor-scope-record.json",
  readiness_file: "data/content-intelligence/quality-registry/ag15a-generated-article-admin-queue-integration-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag15a-to-ag15b-generated-article-admin-queue-integration-plan-boundary.json",
  schema_file: "data/content-intelligence/schema/next-path-decision-after-admin-editor-chain-closure.schema.json",
  summary: {
    selected_path: "content_article_queue_integration",
    next_stage: "AG15B",
    ready_for_ag15b: true,
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG15A",
  title: "Next Path Decision after Admin Editor Chain Closure Learning",
  status: "learning_record_only",
  learning_points: [
    "The article methodology is strong; the next gap is production routing from generated article to Admin queue.",
    "Real Auth/action execution is premature until future generated articles consistently carry queue-ready metadata and quality evidence.",
    "AG15B should plan queue integration before any new article generation or mutation.",
    "Public visibility must remain false by default for generated articles until Admin approval is later enabled.",
    "Archived/rejected generated articles should retain intelligence for reuse, not be deleted."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG15A",
  title: "Next Path Decision after Admin Editor Secure Handler Chain Closure",
  status: "next_path_decision_completed_content_queue_integration_selected",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag15a-next-path-decision-after-admin-editor-chain-closure.json",
    decision: "data/content-intelligence/content-pipeline/ag15a-next-path-decision-record.json",
    conveyor_scope: "data/content-intelligence/content-pipeline/ag15a-generated-article-admin-queue-conveyor-scope-record.json",
    readiness: "data/content-intelligence/quality-registry/ag15a-generated-article-admin-queue-integration-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag15a-to-ag15b-generated-article-admin-queue-integration-plan-boundary.json",
    schema: "data/content-intelligence/schema/next-path-decision-after-admin-editor-chain-closure.schema.json",
    learning: "data/content-intelligence/learning/ag15a-next-path-decision-after-admin-editor-chain-closure-learning.json",
    preview: "data/quality/ag15a-next-path-decision-after-admin-editor-chain-closure-preview.json",
    document: "docs/quality/AG15A_NEXT_PATH_DECISION_AFTER_ADMIN_EDITOR_CHAIN_CLOSURE.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG15A",
  preview_only: true,
  status: "next_path_decision_completed_content_queue_integration_selected",
  selected_path: "content_article_queue_integration",
  next_stage: "AG15B",
  article_generation_ready: false,
  queue_mutation_ready: false,
  publish_ready: false,
  ready_for_ag15b: true,
  next_stage_boundary: boundary,
  ...stageControls
};

const doc = `# AG15A — Next Path Decision after Admin Editor Chain Closure

## Purpose

AG15A decides the next governed path after AG14 Admin/Editor secure-handler chain closure.

AG15A is decision only. It does not generate articles, mutate articles, mutate queues, execute Admin/Editor actions, activate Auth/backend/Supabase, wire GitHub tokens, switch public visibility or publish anything.

## Decision

Selected path: Generated Article to Admin Review Queue Integration.

## Rationale

The article intelligence flow is already strong. The next production gap is the conveyor belt from future generated article to quality evidence, preview state and Admin Review Queue.

## Next Stage

AG15B — Generated Article to Admin Review Queue Integration Plan — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(decisionPath, decision);
writeJson(conveyorPath, conveyorScope);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG15A next path decision generated.");
console.log("✅ Selected path: Generated Article to Admin Review Queue Integration.");
console.log("✅ AG15B boundary created.");
console.log("✅ No article generation, article mutation, queue mutation, Auth/backend/Supabase activation, visibility switch or publishing performed.");
