import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag26zReview: "data/content-intelligence/quality-reviews/ag26z-manual-admin-editor-workflow-closure.json",
  ag26zClosure: "data/content-intelligence/admin-editor/ag26z-manual-admin-editor-workflow-closure.json",
  ag26zSourceChain: "data/content-intelligence/admin-editor/ag26z-ag26-detailed-source-chain-register.json",
  ag26zRoleGovernance: "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",
  ag26zNonActivation: "data/content-intelligence/admin-editor/ag26z-non-activation-closure-register.json",
  ag26zBackendCarryForward: "data/content-intelligence/admin-editor/ag26z-ag27-backend-deferral-carry-forward.json",
  ag26zBoundary: "data/content-intelligence/mutation-plans/ag26z-to-post-ag26-roadmap-boundary.json",

  ag27Checkpoint: "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",
  ag27DeferralRecord: "data/content-intelligence/backend-decision/ag27-backend-deferral-record.json",
  ag27Boundary: "data/content-intelligence/mutation-plans/ag27-to-ag28-conditional-backend-path-boundary.json",

  ag26UmbrellaPlan: "data/content-intelligence/admin-editor/ag26-admin-editor-manual-workflow-strengthening-plan.json",
  ag25zClosure: "data/content-intelligence/featured-reads/ag25z-featured-reads-production-readiness-closure.json",
  ag24zClosure: "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag27a-backend-need-assessment.json",
  assessment: "data/content-intelligence/backend-decision/ag27a-backend-need-assessment.json",
  signalRegister: "data/content-intelligence/backend-decision/ag27a-backend-need-signal-register.json",
  staticVsBackendMatrix: "data/content-intelligence/backend-decision/ag27a-static-vs-backend-readiness-matrix.json",
  backendPlanningScope: "data/content-intelligence/backend-decision/ag27a-backend-planning-scope-register.json",
  futureConsumptionPlan: "data/content-intelligence/backend-decision/ag27a-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag27a-backend-need-assessment-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag27a-backend-decision-audit-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag27a-to-ag27b-backend-decision-audit-boundary.json",
  registry: "data/quality/ag27a-backend-need-assessment.json",
  preview: "data/quality/ag27a-backend-need-assessment-preview.json",
  doc: "docs/quality/AG27A_BACKEND_NEED_ASSESSMENT.md"
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
  if (!exists(p)) throw new Error(`Missing AG27A input: ${p}`);
}

const records = Object.fromEntries(
  Object.entries(inputs).map(([key, file]) => [key, readJson(file)])
);

if (records.ag26zReview.status !== "manual_admin_editor_workflow_closed_ag27_backend_deferred") throw new Error("AG26Z review status mismatch.");
if (records.ag26zClosure.status !== "manual_admin_editor_workflow_closed_ag27_backend_deferred") throw new Error("AG26Z closure status mismatch.");
if (records.ag26zClosure.closure_decision?.ag26_detailed_chain_closed !== true) throw new Error("AG26 detailed chain must be closed.");
if (records.ag26zClosure.closure_decision?.ag28_blocked_pending_explicit_approval !== true) throw new Error("AG28 must remain blocked.");
if (records.ag26zBackendCarryForward.backend_deferred !== true) throw new Error("AG26Z must carry backend deferral.");
if (records.ag26zBackendCarryForward.explicit_approval_required_before_ag28 !== true) throw new Error("AG28 explicit approval gate missing.");
if (records.ag27Checkpoint.status !== "supabase_auth_backend_decision_checkpoint_created_backend_deferred") throw new Error("AG27 checkpoint status mismatch.");
if (records.ag27Checkpoint.checkpoint_decision?.backend_deferred !== true) throw new Error("AG27 backend deferral missing.");
if (records.ag27Checkpoint.checkpoint_decision?.backend_activation_approved !== false) throw new Error("Backend activation must remain unapproved.");
if (records.ag27Boundary.explicit_approval_required !== true) throw new Error("AG27→AG28 explicit approval gate missing.");
if (records.ag26UmbrellaPlan.status !== "admin_editor_manual_workflow_strengthening_created_ready_for_ag27") throw new Error("AG26 umbrella status mismatch.");
if (records.ag25zClosure.status !== "featured_reads_production_readiness_closed_ready_for_ag26a") throw new Error("AG25Z status mismatch.");
if (records.ag24zClosure.status !== "episodic_knowledge_engine_closed_ready_for_ag25") throw new Error("AG24Z status mismatch.");

const blockedState = {
  backend_need_assessment_created: true,
  backend_planning_allowed: true,
  runtime_backend_created: false,
  supabase_project_created: false,
  supabase_connected: false,
  database_table_created: false,
  rls_policy_created: false,
  auth_enabled: false,
  admin_login_created: false,
  editor_login_created: false,
  secrets_created: false,
  env_vars_written: false,
  server_route_created: false,
  api_route_created: false,
  queue_runtime_created: false,
  audit_runtime_created: false,
  article_state_runtime_created: false,
  dynamic_publish_runtime_created: false,
  github_token_created: false,
  github_write_performed: false,
  deployment_triggered: false,
  published: false,
  public_mutation_done: false,
  supabase_auth_backend_activated: false
};

const needSignals = [
  {
    signal_id: "admin_editor_multi_user_roles",
    label: "Admin/Editor multi-user role separation",
    source: "AG26A-AG26Z Admin/Editor workflow",
    backend_relevance: "high",
    current_static_support: "planning_only",
    backend_needed_for_real_execution: true,
    activation_needed_now: false
  },
  {
    signal_id: "database_backed_review_queue",
    label: "Database-backed review and assignment queue",
    source: "AG26B assignment control and AG26C role-flow scaffold",
    backend_relevance: "high",
    current_static_support: "planning_only",
    backend_needed_for_real_execution: true,
    activation_needed_now: false
  },
  {
    signal_id: "audit_logs_and_delta_history",
    label: "Audit logs, delta review and rollback records",
    source: "AG26B evidence/delta review and AG26D audit",
    backend_relevance: "high",
    current_static_support: "record_only",
    backend_needed_for_real_execution: true,
    activation_needed_now: false
  },
  {
    signal_id: "article_state_machine",
    label: "Article states: draft, editor submitted, admin review, returned, archived, approved, published",
    source: "AG26A/AG26B review-state and Admin action models",
    backend_relevance: "high",
    current_static_support: "planning_only",
    backend_needed_for_real_execution: true,
    activation_needed_now: false
  },
  {
    signal_id: "dynamic_publish_action",
    label: "Admin dynamic publish action",
    source: "AG26B publish and publish-and-close plan-only actions",
    backend_relevance: "future_high",
    current_static_support: "blocked_plan_only",
    backend_needed_for_real_execution: true,
    activation_needed_now: false
  },
  {
    signal_id: "subscriber_features",
    label: "Subscriber/user features",
    source: "future personalization/subscriber roadmap",
    backend_relevance: "medium_future",
    current_static_support: "not_required_for_current_stage",
    backend_needed_for_real_execution: true,
    activation_needed_now: false
  },
  {
    signal_id: "static_github_controlled_continuation",
    label: "Static/GitHub-controlled continuation",
    source: "AG26Z boundary and AG27 backend deferral",
    backend_relevance: "current_safe_path",
    current_static_support: "sufficient_for_now",
    backend_needed_for_real_execution: false,
    activation_needed_now: false
  }
];

const signalRegister = {
  module_id: "AG27A",
  title: "Backend Need Signal Register",
  status: "backend_need_signal_register_created_no_activation",
  signal_count: needSignals.length,
  high_backend_relevance_count: needSignals.filter((item) => item.backend_relevance === "high").length,
  signals: needSignals,
  assessment_summary: {
    backend_planning_is_now_useful: true,
    backend_activation_is_needed_now: false,
    static_path_remains_valid_now: true,
    controlled_backend_planning_should_continue_to_ag27b: true
  },
  blocked_state: blockedState
};

const staticVsBackendMatrix = {
  module_id: "AG27A",
  title: "Static vs Backend Readiness Matrix",
  status: "static_vs_backend_matrix_created_no_activation",
  matrix: [
    {
      capability: "Article reading/public pages",
      static_path: "sufficient_now",
      backend_path: "not_required_now",
      decision: "continue_static"
    },
    {
      capability: "Admin assigns article to Editor",
      static_path: "planning_only",
      backend_path: "needed_for_real_queue",
      decision: "plan_backend_do_not_activate"
    },
    {
      capability: "Editor assigned-only workspace",
      static_path: "planning_only",
      backend_path: "needed_for_login_and_row_scope",
      decision: "plan_backend_do_not_activate"
    },
    {
      capability: "Audit log and rollback trail",
      static_path: "record_only",
      backend_path: "needed_for_real_actions",
      decision: "plan_backend_do_not_activate"
    },
    {
      capability: "Publish and publish-and-close",
      static_path: "blocked_plan_only",
      backend_path: "needed_for_dynamic_execution",
      decision: "defer_execution"
    },
    {
      capability: "Subscriber/account features",
      static_path: "not_current",
      backend_path: "future_needed",
      decision: "defer_to_later"
    }
  ],
  conclusion: {
    backend_need_exists_for_future_real_workflow: true,
    backend_activation_required_immediately: false,
    controlled_backend_planning_should_begin: true,
    supabase_sandbox_activation_should_wait: true
  },
  blocked_state: blockedState
};

const backendPlanningScope = {
  module_id: "AG27A",
  title: "Backend Planning Scope Register",
  status: "backend_planning_scope_created_no_backend_activation",
  planning_allowed_now: [
    "Need assessment",
    "Decision audit",
    "Non-active backend architecture blueprint",
    "Non-active table plan",
    "Non-active role and access model",
    "Non-active RLS/security planning",
    "Secret-governance planning without storing secrets",
    "Audit-log shape planning",
    "Rollback-state planning"
  ],
  explicitly_blocked_now: [
    "Supabase project creation",
    "Supabase connection",
    "Database table creation",
    "RLS policy application",
    "Auth activation",
    "Admin login creation",
    "Editor login creation",
    "Secrets or env var writing",
    "Runtime API route creation",
    "Dynamic publish handler activation",
    "Deployment",
    "Public mutation"
  ],
  operator_context: {
    backend_planning_requested: true,
    backend_activation_requested: false,
    controlled_sandbox_activation_requested: false,
    current_decision: "plan_backend_without_activation"
  },
  blocked_state: blockedState
};

const futureConsumptionPlan = {
  module_id: "AG27A",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag27b",
  future_consumption: {
    AG27B: "Backend Decision Audit should consume AG27A need signals and decide whether to continue static only, continue non-active backend planning, or prepare controlled sandbox planning.",
    AG27C: "Supabase/Auth Security and RLS Plan should only plan tables, roles, RLS, audit and secrets governance; still no activation.",
    AG27D: "Only if explicitly approved, AG27D can prepare detailed access/security planning. It must still not activate backend unless a later stage permits it.",
    AG27Z: "Backend Decision Closure should close AG27 as backend deferred or backend planning approved.",
    AG28: "AG28 Backend/Auth Architecture Blueprint should remain blocked until AG27Z explicitly permits non-active backend architecture planning."
  },
  blocked_state: blockedState
};

const assessment = {
  module_id: "AG27A",
  title: "Backend Need Assessment",
  status: "backend_need_assessment_created_ready_for_ag27b",
  purpose:
    "Assess whether Drishvara now needs backend planning for Admin/Editor login, database-backed queue, richer audit, article states, subscriber features and dynamic publish workflow, without activating Supabase/Auth/backend.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  consumed_source_summary: {
    ag26z_status: records.ag26zClosure.status,
    ag26z_closed: records.ag26zClosure.closure_decision?.ag26_detailed_chain_closed === true,
    ag27_checkpoint_status: records.ag27Checkpoint.status,
    ag27_backend_deferred: records.ag27Checkpoint.checkpoint_decision?.backend_deferred === true,
    ag28_blocked: records.ag27Boundary.explicit_approval_required === true,
    ag25z_status: records.ag25zClosure.status,
    ag24z_status: records.ag24zClosure.status
  },
  assessment_decision: {
    backend_need_for_future_real_admin_editor_workflow: true,
    backend_need_for_future_dynamic_publish: true,
    backend_need_for_future_audit_and_rollback: true,
    backend_need_for_future_subscriber_features: true,
    static_github_controlled_path_sufficient_for_current_no_runtime_stage: true,
    backend_planning_should_continue_to_ag27b: true,
    backend_activation_should_start_now: false,
    supabase_sandbox_activation_should_start_now: false,
    secrets_or_env_setup_allowed_now: false,
    ag28_allowed_now: false
  },
  signal_register_file: outputs.signalRegister,
  static_vs_backend_matrix_file: outputs.staticVsBackendMatrix,
  backend_planning_scope_file: outputs.backendPlanningScope,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  backend_need_assessment_created: true,
  backend_planning_allowed_in_ag27a: true,
  backend_activation_allowed_in_ag27a: false,
  supabase_activation_allowed_in_ag27a: false,
  auth_activation_allowed_in_ag27a: false,
  database_creation_allowed_in_ag27a: false,
  secret_creation_allowed_in_ag27a: false,
  deployment_allowed_in_ag27a: false,
  public_mutation_allowed_in_ag27a: false,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG27A",
  title: "Backend Need Assessment Blocker Register",
  status: "backend_need_assessment_operations_blocked_pending_ag27b",
  blocked_items: [
    "No Supabase project creation.",
    "No Supabase connection.",
    "No database table creation.",
    "No RLS policy creation.",
    "No Auth activation.",
    "No Admin login creation.",
    "No Editor login creation.",
    "No secrets creation.",
    "No environment variable write.",
    "No server/API route creation.",
    "No queue runtime creation.",
    "No audit runtime creation.",
    "No article state runtime creation.",
    "No dynamic publish runtime creation.",
    "No GitHub token creation.",
    "No GitHub write.",
    "No deployment trigger.",
    "No publishing.",
    "No public mutation.",
    "No AG28 start until AG27 closure permits it."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG27A",
  title: "Backend Decision Audit Readiness Record",
  status: "ready_for_ag27b_backend_decision_audit",
  ready_for_ag27b: true,
  next_stage_id: "AG27B",
  next_stage_title: "Backend Decision Audit",
  backend_need_assessment_created: true,
  signal_register_created: true,
  static_vs_backend_matrix_created: true,
  backend_planning_scope_created: true,
  real_execution_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG27A",
  title: "AG27A to AG27B Backend Decision Audit Boundary",
  status: "ag27b_boundary_created_not_started",
  next_stage_id: "AG27B",
  next_stage_title: "Backend Decision Audit",
  allowed_scope: [
    "Consume AG27A backend need signals.",
    "Audit whether to continue static, continue non-active backend planning, or prepare controlled sandbox planning.",
    "Keep Supabase/Auth/backend activation blocked.",
    "Keep secrets, env vars, database tables, RLS policies and deployment blocked."
  ],
  blocked_scope: blocker.blocked_items,
  backend_activation_deferred: true,
  supabase_auth_backend_deferred: true,
  explicit_approval_required_before_activation: true
};

const review = {
  module_id: "AG27A",
  title: "Backend Need Assessment",
  status: "backend_need_assessment_created_ready_for_ag27b",
  depends_on: ["AG26Z", "AG27", "AG25Z", "AG24Z"],
  generated_from: inputs,
  assessment_file: outputs.assessment,
  signal_register_file: outputs.signalRegister,
  static_vs_backend_matrix_file: outputs.staticVsBackendMatrix,
  backend_planning_scope_file: outputs.backendPlanningScope,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    backend_need_assessment_created: true,
    backend_need_for_future_real_workflow: true,
    backend_planning_should_continue_to_ag27b: true,
    static_path_sufficient_for_current_stage: true,
    backend_activation_allowed_now: false,
    supabase_activation_allowed_now: false,
    auth_activation_allowed_now: false,
    database_creation_allowed_now: false,
    secret_creation_allowed_now: false,
    deployment_done: false,
    public_mutation_done: false,
    backend_activation_done: false,
    real_execution_done: false,
    ready_for_ag27b: true
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG27A",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG27A",
  preview_only: true,
  status: review.status,
  message: "AG27A Backend Need Assessment created. Next: AG27B Backend Decision Audit.",
  backend_need_assessment_created: 1,
  backend_planning_allowed: 1,
  backend_activation_allowed: 0,
  supabase_activation_allowed: 0,
  auth_activation_allowed: 0,
  database_objects_created: 0,
  secrets_created: 0,
  deployment_done: 0,
  public_items: 0,
  backend_objects: 0,
  blocked_state: blockedState
};

const doc = `# AG27A — Backend Need Assessment

## Purpose

AG27A assesses whether Drishvara now requires backend planning for Admin/Editor login, database-backed queues, audit logs, article states, rollback, subscriber features and future dynamic publishing.

## Decision

Backend planning is useful and should continue to AG27B.

Backend activation is not approved here.

## Current Assessment

- Static/GitHub-controlled path remains sufficient for the current no-runtime stage.
- Future real Admin/Editor workflow will require backend.
- Future dynamic publishing will require backend.
- Future audit logs, rollback and article-state management will require backend.
- Future subscriber/account features will require backend.

## Strict Blockers

No Supabase project creation, database table creation, RLS policy application, Auth activation, secrets, env vars, runtime API, deployment, publishing or public mutation is performed.

## Next Stage

AG27B — Backend Decision Audit.
`;

writeJson(outputs.review, review);
writeJson(outputs.assessment, assessment);
writeJson(outputs.signalRegister, signalRegister);
writeJson(outputs.staticVsBackendMatrix, staticVsBackendMatrix);
writeJson(outputs.backendPlanningScope, backendPlanningScope);
writeJson(outputs.futureConsumptionPlan, futureConsumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG27A Backend Need Assessment generated.");
console.log("✅ Backend planning need identified for future real Admin/Editor, queue, audit and dynamic publish workflow.");
console.log("✅ Static path remains sufficient for current no-runtime stage.");
console.log("✅ No Supabase/Auth/backend activation, secrets, database, deployment or public mutation performed.");
console.log("✅ AG27B Backend Decision Audit boundary created.");
