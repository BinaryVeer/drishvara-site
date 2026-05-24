import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag17aReview: "data/content-intelligence/quality-reviews/ag17a-controlled-go-live-implementation-path-decision.json",
  ag17aComparison: "data/content-intelligence/go-live/ag17a-go-live-option-comparison-record.json",
  ag17aDecision: "data/content-intelligence/go-live/ag17a-hybrid-staged-path-decision-record.json",
  ag17aReminder: "data/content-intelligence/go-live/ag17a-supabase-auth-defer-reminder-record.json",
  ag17aBlockers: "data/content-intelligence/quality-registry/ag17a-real-activation-blocker-register.json",
  ag17aReadiness: "data/content-intelligence/quality-registry/ag17a-hybrid-static-go-live-planning-readiness-record.json",
  ag17aBoundary: "data/content-intelligence/mutation-plans/ag17a-to-ag17b-hybrid-static-go-live-implementation-plan-boundary.json",
  ag16zBlocked: "data/content-intelligence/quality-registry/ag16z-public-exposure-blocked-register.json",
  ag16zSummary: "data/content-intelligence/content-pipeline/ag16z-public-visibility-publish-control-summary.json",
  ag15zSummary: "data/content-intelligence/content-pipeline/ag15z-generated-article-admin-queue-preparation-summary.json",
  ag14zReview: "data/content-intelligence/quality-reviews/ag14z-admin-editor-secure-handler-chain-closure.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag17b-hybrid-static-go-live-implementation-plan.json");
const architecturePlanPath = path.join(root, "data/content-intelligence/go-live/ag17b-static-github-go-live-architecture-plan.json");
const exposureSequencePath = path.join(root, "data/content-intelligence/go-live/ag17b-controlled-public-exposure-sequence-plan.json");
const githubSecretPlanPath = path.join(root, "data/content-intelligence/go-live/ag17b-github-secret-requirements-no-secrets-plan.json");
const adminEditorPlanPath = path.join(root, "data/content-intelligence/go-live/ag17b-admin-editor-static-action-readiness-plan.json");
const rollbackAuditPlanPath = path.join(root, "data/content-intelligence/go-live/ag17b-static-go-live-rollback-audit-plan.json");
const reminderPath = path.join(root, "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag17b-hybrid-static-go-live-plan-audit-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag17b-to-ag17c-hybrid-static-go-live-plan-audit-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/hybrid-static-go-live-implementation-plan.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag17b-hybrid-static-go-live-implementation-plan-learning.json");
const registryPath = path.join(root, "data/quality/ag17b-hybrid-static-go-live-implementation-plan.json");
const previewPath = path.join(root, "data/quality/ag17b-hybrid-static-go-live-implementation-plan-preview.json");
const docPath = path.join(root, "docs/quality/AG17B_HYBRID_STATIC_GO_LIVE_IMPLEMENTATION_PLAN.md");

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
  if (!exists(relativePath)) throw new Error(`Missing AG17B input ${name}: ${relativePath}`);
}

const ag17aReview = readJson(inputs.ag17aReview);
const ag17aComparison = readJson(inputs.ag17aComparison);
const ag17aDecision = readJson(inputs.ag17aDecision);
const ag17aReminder = readJson(inputs.ag17aReminder);
const ag17aBlockers = readJson(inputs.ag17aBlockers);
const ag17aReadiness = readJson(inputs.ag17aReadiness);
const ag17aBoundary = readJson(inputs.ag17aBoundary);
const ag16zBlocked = readJson(inputs.ag16zBlocked);
const ag16zSummary = readJson(inputs.ag16zSummary);
const ag15zSummary = readJson(inputs.ag15zSummary);
const ag13zCandidate = readJson(inputs.ag13zCandidate);

if (ag17aReview.status !== "hybrid_staged_go_live_path_selected_real_activation_blocked") {
  throw new Error("AG17B requires AG17A decision review.");
}
if (ag17aDecision.selected_path !== "hybrid_staged_path") {
  throw new Error("AG17B requires hybrid staged path selection.");
}
if (ag17aReadiness.ready_for_ag17b !== true) {
  throw new Error("AG17B requires AG17A readiness.");
}
if (ag17aBoundary.next_stage_id !== "AG17B" || ag17aBoundary.explicit_approval_required !== true) {
  throw new Error("AG17B requires AG17A to AG17B explicit boundary.");
}
if (ag17aReminder.status !== "supabase_auth_deferred_with_future_reminder_required") {
  throw new Error("AG17B requires Supabase/Auth defer reminder.");
}

const articlePath = ag13zCandidate.selected_article_path;
if (!exists(articlePath)) throw new Error(`Selected article missing: ${articlePath}`);

const currentArticleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentArticleHash !== ag13zCandidate.article_hash) {
  throw new Error("AG17B requires seed candidate article hash to remain unchanged.");
}

const stageControls = {
  hybrid_static_go_live_implementation_plan_only: true,
  static_github_go_live_architecture_plan_created_in_ag17b: true,
  controlled_public_exposure_sequence_plan_created_in_ag17b: true,
  github_secret_requirements_no_secrets_plan_created_in_ag17b: true,
  admin_editor_static_action_readiness_plan_created_in_ag17b: true,
  rollback_audit_plan_created_in_ag17b: true,
  supabase_auth_defer_reminder_carried_forward_in_ag17b: true,
  ag17c_boundary_created_in_ag17b: true,
  selected_article_read_performed: true,

  article_generation_performed_in_ag17b: false,
  article_mutation_performed_in_ag17b: false,
  queue_mutation_performed_in_ag17b: false,
  active_admin_review_queue_record_created_in_ag17b: false,
  queue_index_mutation_performed_in_ag17b: false,
  admin_action_execution_performed_in_ag17b: false,
  editor_action_execution_performed_in_ag17b: false,
  real_credential_created_in_ag17b: false,
  hardcoded_password_created_in_repo_in_ag17b: false,
  password_hash_created_in_repo_in_ag17b: false,
  auth_activation_performed_in_ag17b: false,
  backend_activation_performed_in_ag17b: false,
  supabase_activation_performed_in_ag17b: false,
  database_write_performed_in_ag17b: false,
  github_token_created_or_exposed_in_ag17b: false,
  github_write_operation_performed_in_ag17b: false,
  active_action_handler_created_in_ag17b: false,
  api_endpoint_created_in_ag17b: false,
  public_visibility_switch_performed_in_ag17b: false,
  public_index_mutation_performed_in_ag17b: false,
  public_publishing_operation_performed_in_ag17b: false,
  deployment_trigger_performed_in_ag17b: false
};

const architecturePlan = {
  module_id: "AG17B",
  title: "Static GitHub Go-live Architecture Plan",
  status: "static_github_go_live_architecture_planned",
  selected_path: "hybrid_staged_path_static_first",
  architecture_mode: "static_github_controlled_first",
  purpose: "Plan a controlled static go-live route using existing GitHub/Vercel/static artifacts before Supabase/Auth/backend activation.",
  planned_components: [
    {
      component_id: "public_static_site",
      role: "Serves approved public pages through the existing static deployment path.",
      activation_now: false
    },
    {
      component_id: "admin_review_records",
      role: "Repository-governed JSON records preserve Admin Review Queue state and quality evidence.",
      activation_now: false
    },
    {
      component_id: "public_filter_helper",
      role: "Non-active AG16E helper remains a reference scaffold for later public-surface filtering.",
      activation_now: false
    },
    {
      component_id: "github_controlled_publish_path",
      role: "Future controlled write path may update approved public records through GitHub, but no token or write is created in AG17B.",
      activation_now: false
    },
    {
      component_id: "supabase_auth_backend",
      role: "Deferred. Must not activate before explicit reminder and separate approval.",
      activation_now: false,
      deferred: true
    }
  ],
  design_principles: [
    "Minimum live surface first.",
    "No backend/Auth before static path is stable.",
    "No public exposure without public_visibility=true and publish_approved=true.",
    "No GitHub token in repository.",
    "No automatic publishing without Admin-controlled decision and audit.",
    "Every real write must be separately approved in a later apply stage."
  ],
  source_lineage: {
    ag14_admin_editor_chain: inputs.ag14zReview,
    ag15_admin_queue_chain: inputs.ag15zSummary,
    ag16_public_visibility_chain: inputs.ag16zSummary,
    ag17a_decision: inputs.ag17aDecision
  },
  ...stageControls
};

const exposureSequence = {
  module_id: "AG17B",
  title: "Controlled Public Exposure Sequence Plan",
  status: "controlled_public_exposure_sequence_planned_no_execution",
  purpose: "Define the future sequence for making an Admin-approved article public, without executing any step.",
  planned_sequence: [
    {
      order: 1,
      step_id: "verify_admin_queue_record",
      description: "Confirm article exists in Admin Review Queue and has Admin-approved decision.",
      execution_now: false
    },
    {
      order: 2,
      step_id: "verify_quality_evidence",
      description: "Confirm quality, reference, credit, object, layout, preview and hash evidence.",
      execution_now: false
    },
    {
      order: 3,
      step_id: "verify_public_filter_eligibility",
      description: "Confirm public_visibility, publish_approved, public_index_allowed, hash and preview controls.",
      execution_now: false
    },
    {
      order: 4,
      step_id: "prepare_public_index_delta",
      description: "Prepare intended public index/listing delta as a reviewable plan, not as a mutation.",
      execution_now: false
    },
    {
      order: 5,
      step_id: "controlled_repository_write_later",
      description: "A later stage may wire controlled GitHub write after secrets, rollback and audit plan are separately approved.",
      execution_now: false
    },
    {
      order: 6,
      step_id: "deployment_trigger_later",
      description: "A later stage may trigger deployment only after public index mutation is approved.",
      execution_now: false
    },
    {
      order: 7,
      step_id: "post_deployment_smoke_test_later",
      description: "Verify public article, Featured Reads, category listing, homepage card, sitemap/feed if applicable.",
      execution_now: false
    }
  ],
  current_ag17b_execution_state: {
    public_visibility_switch_performed: false,
    public_index_mutation_performed: false,
    publishing_operation_performed: false,
    deployment_trigger_performed: false
  },
  inherited_public_exposure_controls: ag16zSummary.final_public_control_state,
  ...stageControls
};

const githubSecretPlan = {
  module_id: "AG17B",
  title: "GitHub Secret Requirements No-Secrets Plan",
  status: "github_secret_requirements_planned_no_secrets_created",
  purpose: "Record future secret/token requirements without creating, exposing or wiring any secret.",
  future_secret_candidates: [
    {
      secret_name_placeholder: "GITHUB_CONTENT_WRITE_TOKEN",
      purpose: "Future least-privilege repository write for approved content/public index updates.",
      created_now: false,
      exposed_now: false,
      wired_now: false
    },
    {
      secret_name_placeholder: "GITHUB_CONTENT_WRITE_BRANCH",
      purpose: "Future controlled branch target for write operations.",
      created_now: false,
      exposed_now: false,
      wired_now: false
    },
    {
      secret_name_placeholder: "GO_LIVE_APPROVAL_KEY",
      purpose: "Future server-side action authorization guard if required.",
      created_now: false,
      exposed_now: false,
      wired_now: false
    }
  ],
  required_future_controls_before_any_secret_use: [
    "Use least-privilege token.",
    "Store only in deployment environment secret manager, never in repo.",
    "No secret in logs, generated JSON, scripts or docs.",
    "Require rollback plan before write.",
    "Require audit record before write.",
    "Require manual approval checkpoint before first real write."
  ],
  github_write_operation_allowed_now: false,
  github_token_creation_allowed_now: false,
  github_token_exposure_allowed_now: false,
  ...stageControls
};

const adminEditorPlan = {
  module_id: "AG17B",
  title: "Admin Editor Static Action Readiness Plan",
  status: "admin_editor_static_action_readiness_planned_no_execution",
  purpose: "Plan how Admin/Editor actions can later interact with the static/GitHub-controlled go-live route.",
  planned_roles: [
    {
      role: "Admin",
      future_actions: [
        "Archive",
        "Return for correction",
        "Publish",
        "Publish and close"
      ],
      execution_now: false
    },
    {
      role: "Editor",
      future_actions: [
        "Manual correction",
        "Manual article creation",
        "Submit to Admin"
      ],
      execution_now: false
    }
  ],
  planned_static_action_model: {
    current_state: "planning_only",
    future_action_submission: "reviewable action payload",
    future_action_handler: "controlled static/GitHub action handler only after separate approval",
    current_active_handler: false
  },
  limitations_of_static_stage: [
    "Not a full multi-user database-backed workflow.",
    "Concurrent edits remain limited until backend/Auth stage.",
    "Credential and role controls must be carefully implemented before action execution."
  ],
  supabase_auth_still_deferred: true,
  ...stageControls
};

const rollbackAuditPlan = {
  module_id: "AG17B",
  title: "Static Go-live Rollback Audit Plan",
  status: "rollback_audit_plan_defined_no_execution",
  purpose: "Define future rollback and audit requirements before any static go-live write.",
  rollback_requirements_before_real_write: [
    "Record pre-write commit hash.",
    "Record affected files and intended deltas.",
    "Record Admin decision and evidence pointer.",
    "Record public filter pass result.",
    "Define revert command or rollback commit path.",
    "Confirm deployment can be reverted or previous commit restored.",
    "Confirm smoke-test checklist before and after write."
  ],
  audit_requirements_before_real_write: [
    "Who approved.",
    "What article was approved.",
    "Which files changed.",
    "Which public surfaces changed.",
    "Which checks passed.",
    "Which deployment was triggered.",
    "Post-deployment observation result."
  ],
  rollback_execution_now: false,
  audit_write_execution_now: false,
  ...stageControls
};

const reminder = {
  module_id: "AG17B",
  title: "Supabase Auth Defer Carry-forward Reminder",
  status: "supabase_auth_backend_defer_reminder_carried_forward",
  reminder: "Hybrid staged path remains selected: static/GitHub-controlled go-live first; Supabase/Auth/backend later only after explicit review and approval.",
  copied_from: inputs.ag17aReminder,
  must_remind_again_before: [
    "Any Supabase table/schema/RLS/Auth design stage.",
    "Any backend API activation stage.",
    "Any database write path stage.",
    "Any multi-user Admin/Editor Auth stage.",
    "Any Edge Function/serverless backend activation stage."
  ],
  forbidden_in_ag17b: [
    "No Supabase activation.",
    "No Auth activation.",
    "No backend activation.",
    "No database write.",
    "No real credentials.",
    "No backend secret wiring."
  ],
  ...stageControls
};

const readiness = {
  module_id: "AG17B",
  title: "Hybrid Static Go-live Plan Audit Readiness Record",
  status: "ready_for_ag17c_hybrid_static_go_live_plan_audit",
  ready_for_ag17c: true,
  ag17c_explicit_approval_required: true,
  selected_path: "hybrid_staged_path",
  static_github_controlled_first: true,
  supabase_auth_deferred: true,
  supabase_auth_reminder_carried_forward: true,
  architecture_plan_defined: true,
  exposure_sequence_plan_defined: true,
  github_secret_requirements_defined_without_secrets: true,
  admin_editor_static_action_readiness_defined: true,
  rollback_audit_plan_defined: true,
  article_generation_ready: false,
  article_mutation_ready: false,
  queue_mutation_ready: false,
  admin_action_execution_ready: false,
  real_auth_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  github_write_ready: false,
  public_visibility_switch_ready: false,
  public_index_mutation_ready: false,
  publish_ready: false,
  reason: "AG17B plans the static/GitHub-controlled go-live route only. AG17C should audit this plan before any non-active implementation scaffold.",
  ...stageControls
};

const boundary = {
  module_id: "AG17B",
  title: "AG17B to AG17C Hybrid Static Go-live Plan Audit Boundary",
  status: "ag17c_boundary_created_not_started",
  next_stage_id: "AG17C",
  next_stage_title: "Hybrid Static Go-live Implementation Plan Audit",
  explicit_approval_required: true,
  selected_path: "hybrid_staged_path",
  ag17c_allowed_scope: [
    "Audit AG17B static/GitHub go-live architecture plan.",
    "Audit public exposure sequence plan.",
    "Audit GitHub secret requirements plan and confirm no secrets were created.",
    "Audit Admin/Editor static action readiness plan.",
    "Audit rollback/audit plan.",
    "Confirm Supabase/Auth/backend remains deferred.",
    "Decide readiness for non-active static go-live implementation scaffold."
  ],
  ag17c_blocked_scope: [
    "No new article generation.",
    "No article mutation.",
    "No active queue mutation.",
    "No active Admin Review Queue record creation.",
    "No queue-index mutation.",
    "No Admin/Editor action execution.",
    "No real credentials.",
    "No Auth/backend/Supabase activation.",
    "No GitHub write token wiring.",
    "No public visibility switch.",
    "No public index mutation.",
    "No publishing operation.",
    "No deployment trigger."
  ],
  supabase_auth_defer_reminder_required_in_ag17c: true,
  ...stageControls
};

const schema = {
  module_id: "AG17B",
  title: "Hybrid Static Go-live Implementation Plan Schema",
  status: "schema_hybrid_static_go_live_implementation_plan_only",
  static_github_go_live_architecture_plan_allowed_in_ag17b: true,
  controlled_public_exposure_sequence_plan_allowed_in_ag17b: true,
  github_secret_requirements_no_secrets_plan_allowed_in_ag17b: true,
  admin_editor_static_action_readiness_plan_allowed_in_ag17b: true,
  rollback_audit_plan_allowed_in_ag17b: true,
  supabase_auth_defer_reminder_allowed_in_ag17b: true,
  ag17c_boundary_allowed_in_ag17b: true,

  article_generation_allowed_in_ag17b: false,
  article_mutation_allowed_in_ag17b: false,
  queue_mutation_allowed_in_ag17b: false,
  active_admin_review_queue_record_creation_allowed_in_ag17b: false,
  queue_index_mutation_allowed_in_ag17b: false,
  admin_action_execution_allowed_in_ag17b: false,
  editor_action_execution_allowed_in_ag17b: false,
  real_credential_creation_allowed_in_ag17b: false,
  hardcoded_password_allowed_in_ag17b: false,
  password_hash_commit_allowed_in_ag17b: false,
  auth_activation_allowed_in_ag17b: false,
  backend_activation_allowed_in_ag17b: false,
  supabase_activation_allowed_in_ag17b: false,
  database_write_allowed_in_ag17b: false,
  github_token_creation_or_exposure_allowed_in_ag17b: false,
  github_write_operation_allowed_in_ag17b: false,
  active_action_handler_creation_allowed_in_ag17b: false,
  api_endpoint_creation_allowed_in_ag17b: false,
  public_visibility_switch_allowed_in_ag17b: false,
  public_index_mutation_allowed_in_ag17b: false,
  public_publishing_operation_allowed_in_ag17b: false,
  deployment_trigger_allowed_in_ag17b: false,
  ...stageControls
};

const review = {
  module_id: "AG17B",
  title: "Hybrid Static Go-live Implementation Plan",
  status: "hybrid_static_go_live_implementation_plan_defined_real_activation_blocked",
  depends_on: ["AG17A"],
  generated_from: inputs,
  architecture_plan_file: "data/content-intelligence/go-live/ag17b-static-github-go-live-architecture-plan.json",
  exposure_sequence_file: "data/content-intelligence/go-live/ag17b-controlled-public-exposure-sequence-plan.json",
  github_secret_plan_file: "data/content-intelligence/go-live/ag17b-github-secret-requirements-no-secrets-plan.json",
  admin_editor_plan_file: "data/content-intelligence/go-live/ag17b-admin-editor-static-action-readiness-plan.json",
  rollback_audit_plan_file: "data/content-intelligence/go-live/ag17b-static-go-live-rollback-audit-plan.json",
  supabase_reminder_file: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  readiness_file: "data/content-intelligence/quality-registry/ag17b-hybrid-static-go-live-plan-audit-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag17b-to-ag17c-hybrid-static-go-live-plan-audit-boundary.json",
  schema_file: "data/content-intelligence/schema/hybrid-static-go-live-implementation-plan.schema.json",
  summary: {
    selected_path: "hybrid_staged_path",
    static_github_controlled_first: true,
    supabase_auth_deferred: true,
    ready_for_ag17c: true,
    publish_ready: false,
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG17B",
  title: "Hybrid Static Go-live Implementation Plan Learning",
  status: "learning_record_only",
  learning_points: [
    "Static/GitHub-controlled go-live should proceed through planning and audit before any write path.",
    "Secrets and GitHub tokens must be planned but not created in AG17B.",
    "Supabase/Auth/backend remains deferred and must be re-flagged before any backend activation stage.",
    "Public exposure must remain impossible until visibility, public index and publish apply stages are separately approved.",
    "Rollback and audit must be designed before the first real publish operation."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG17B",
  title: "Hybrid Static Go-live Implementation Plan",
  status: "hybrid_static_go_live_implementation_plan_defined_real_activation_blocked",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag17b-hybrid-static-go-live-implementation-plan.json",
    architecture_plan: "data/content-intelligence/go-live/ag17b-static-github-go-live-architecture-plan.json",
    exposure_sequence: "data/content-intelligence/go-live/ag17b-controlled-public-exposure-sequence-plan.json",
    github_secret_plan: "data/content-intelligence/go-live/ag17b-github-secret-requirements-no-secrets-plan.json",
    admin_editor_plan: "data/content-intelligence/go-live/ag17b-admin-editor-static-action-readiness-plan.json",
    rollback_audit_plan: "data/content-intelligence/go-live/ag17b-static-go-live-rollback-audit-plan.json",
    supabase_reminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
    readiness: "data/content-intelligence/quality-registry/ag17b-hybrid-static-go-live-plan-audit-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag17b-to-ag17c-hybrid-static-go-live-plan-audit-boundary.json",
    schema: "data/content-intelligence/schema/hybrid-static-go-live-implementation-plan.schema.json",
    learning: "data/content-intelligence/learning/ag17b-hybrid-static-go-live-implementation-plan-learning.json",
    preview: "data/quality/ag17b-hybrid-static-go-live-implementation-plan-preview.json",
    document: "docs/quality/AG17B_HYBRID_STATIC_GO_LIVE_IMPLEMENTATION_PLAN.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG17B",
  preview_only: true,
  status: "hybrid_static_go_live_implementation_plan_defined_real_activation_blocked",
  selected_path: "hybrid_staged_path",
  static_github_controlled_first: true,
  supabase_auth_deferred: true,
  ready_for_ag17c: true,
  github_write_ready: false,
  public_visibility_switch_ready: false,
  public_index_mutation_ready: false,
  publish_ready: false,
  next_stage_boundary: boundary,
  ...stageControls
};

const doc = `# AG17B — Hybrid Static Go-live Implementation Plan

## Purpose

AG17B plans the static/GitHub-controlled first stage of the selected hybrid go-live path.

AG17B is planning only. It does not generate articles, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, wire GitHub tokens, switch public visibility, mutate public indexes, trigger deployment or publish anything.

## Selected Path

Hybrid staged path:

1. Static/GitHub-controlled go-live first.
2. Supabase/Auth/backend later.

## Supabase/Auth Reminder

Supabase/Auth/backend remains deferred. Before any later backend/Auth activation stage, the user must be reminded that the selected path is static first and Supabase/Auth later.

## Planned Outputs

- Static/GitHub go-live architecture plan
- Controlled public exposure sequence plan
- GitHub secret requirements plan with no secrets created
- Admin/Editor static action readiness plan
- Static rollback and audit plan
- Supabase/Auth defer carry-forward reminder

## Next Stage

AG17C — Hybrid Static Go-live Implementation Plan Audit — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(architecturePlanPath, architecturePlan);
writeJson(exposureSequencePath, exposureSequence);
writeJson(githubSecretPlanPath, githubSecretPlan);
writeJson(adminEditorPlanPath, adminEditorPlan);
writeJson(rollbackAuditPlanPath, rollbackAuditPlan);
writeJson(reminderPath, reminder);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG17B Hybrid Static Go-live Implementation Plan generated.");
console.log("✅ Static/GitHub-controlled go-live architecture planned.");
console.log("✅ Public exposure sequence planned without execution.");
console.log("✅ GitHub secret requirements recorded with no secrets created.");
console.log("✅ Supabase/Auth/backend defer reminder carried forward.");
console.log("✅ AG17C Hybrid Static Go-live Plan Audit boundary created.");
console.log("✅ No credentials, GitHub write, visibility switch, public index mutation, deployment or publishing performed.");
