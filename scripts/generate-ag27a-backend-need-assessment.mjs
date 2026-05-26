import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag26zReview: "data/content-intelligence/quality-reviews/ag26z-manual-admin-editor-workflow-closure.json",
  ag26zClosure: "data/content-intelligence/admin-editor/ag26z-manual-admin-editor-workflow-closure.json",
  ag26zSourceChain: "data/content-intelligence/admin-editor/ag26z-ag26-detailed-source-chain-register.json",
  ag26zRoutingClosure: "data/content-intelligence/admin-editor/ag26z-admin-editor-routing-closure-register.json",
  ag26zNonRuntimeClosure: "data/content-intelligence/admin-editor/ag26z-non-runtime-closure-register.json",
  ag26zExistingAg27Handoff: "data/content-intelligence/admin-editor/ag26z-existing-ag27-handoff-confirmation.json",
  ag26zReadiness: "data/content-intelligence/quality-registry/ag26z-post-ag26-backend-deferral-readiness-record.json",
  ag26zBoundary: "data/content-intelligence/mutation-plans/ag26z-to-existing-ag27-backend-decision-checkpoint-boundary.json",

  ag27ExistingCheckpoint: "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",

  ag26UmbrellaPlan: "data/content-intelligence/admin-editor/ag26-admin-editor-manual-workflow-strengthening-plan.json",
  ag25zClosure: "data/content-intelligence/featured-reads/ag25z-featured-reads-production-readiness-closure.json",
  ag24zClosure: "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag27a-backend-need-assessment.json",
  assessment: "data/content-intelligence/backend-decision/ag27a-backend-need-assessment.json",
  needSignalRegister: "data/content-intelligence/backend-decision/ag27a-backend-need-signal-register.json",
  requirementMatrix: "data/content-intelligence/backend-decision/ag27a-backend-requirement-matrix.json",
  staticVsBackendAssessment: "data/content-intelligence/backend-decision/ag27a-static-vs-backend-continuation-assessment.json",
  consumptionPlan: "data/content-intelligence/backend-decision/ag27a-future-consumption-plan.json",
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

if (records.ag26zClosure.status !== "manual_admin_editor_workflow_closed_existing_ag27_backend_deferred") throw new Error("AG26Z closure status mismatch.");
if (records.ag26zClosure.closure_decision?.ag26_detailed_chain_closed !== true) throw new Error("AG26 detailed chain must be closed.");
if (records.ag26zClosure.closure_decision?.do_not_start_ag28_without_explicit_approval !== true) throw new Error("AG28 approval guard missing.");
if (records.ag26zSourceChain.chain_length !== 5) throw new Error("AG26 source chain must contain 5 closed stages.");
if (records.ag26zExistingAg27Handoff.status !== "existing_ag27_checkpoint_confirmed_backend_deferred") throw new Error("AG26Z existing AG27 handoff status mismatch.");
if (records.ag26zReadiness.explicit_approval_required_before_ag28 !== true) throw new Error("Explicit approval before AG28 must remain required.");
if (records.ag27ExistingCheckpoint.status !== "supabase_auth_backend_decision_checkpoint_created_backend_deferred") throw new Error("Existing AG27 checkpoint status mismatch.");
if (records.ag27ExistingCheckpoint.checkpoint_decision?.backend_deferred !== true) throw new Error("Existing AG27 backend deferral must remain true.");
if (records.ag27ExistingCheckpoint.checkpoint_decision?.ag28_to_ag40_allowed_now !== false) throw new Error("AG28-AG40 must remain blocked.");
if (records.ag26UmbrellaPlan.status !== "admin_editor_manual_workflow_strengthening_created_ready_for_ag27") throw new Error("AG26 umbrella status mismatch.");
if (records.ag25zClosure.status !== "featured_reads_production_readiness_closed_ready_for_ag26a") throw new Error("AG25Z closure status mismatch.");
if (records.ag24zClosure.status !== "episodic_knowledge_engine_closed_ready_for_ag25") throw new Error("AG24Z closure status mismatch.");

const blockedState = {
  backend_need_assessment_created: true,
  backend_activation_approved: false,
  backend_enabled: false,
  auth_enabled: false,
  supabase_enabled: false,
  database_created: false,
  migration_created: false,
  rls_policy_created: false,
  secret_created: false,
  admin_login_created: false,
  editor_login_created: false,
  runtime_queue_created: false,
  runtime_write_enabled: false,
  dynamic_publishing_enabled: false,
  article_file_mutated: false,
  github_token_created: false,
  github_write_performed: false,
  deployment_triggered: false,
  published: false
};

const needSignals = [
  {
    signal_id: "multi_user_admin_editor_login",
    label: "Multi-user Admin/Editor login",
    future_backend_need: true,
    needed_now_for_static_path: false,
    reason: "Real Admin and Editor login requires Auth/session and role persistence, but AG26 is currently only a non-runtime planning scaffold."
  },
  {
    signal_id: "database_backed_review_queue",
    label: "Database-backed review and assignment queue",
    future_backend_need: true,
    needed_now_for_static_path: false,
    reason: "Live Admin review queue, Editor assignment, returned edits and decision states require persistent queue tables; current stage only preserves queue models."
  },
  {
    signal_id: "richer_audit_trail",
    label: "Richer audit trail and decision history",
    future_backend_need: true,
    needed_now_for_static_path: false,
    reason: "Real audit logs require append-only database records, actor identity and timestamped actions; current records are static governance artifacts."
  },
  {
    signal_id: "subscriber_personalization",
    label: "Subscriber or reader personalization",
    future_backend_need: true,
    needed_now_for_static_path: false,
    reason: "Subscriber profiles, preferences, saved items, personalization and entitlements require backend/Auth/data storage, which remains deferred."
  },
  {
    signal_id: "dynamic_admin_publishing",
    label: "Dynamic Admin publishing",
    future_backend_need: true,
    needed_now_for_static_path: false,
    reason: "Admin-click publish from a dashboard requires runtime state and write path; current path remains static/GitHub-controlled and no-publish."
  },
  {
    signal_id: "runtime_object_generation_tracking",
    label: "Runtime object generation tracking",
    future_backend_need: true,
    needed_now_for_static_path: false,
    reason: "Generated images, graphs, tables, infographics and prompts need cost, provenance and status tracking before runtime generation is enabled."
  },
  {
    signal_id: "static_governance_continuation",
    label: "Static governance continuation",
    future_backend_need: false,
    needed_now_for_static_path: true,
    reason: "The current approved path can continue using static governed records without activating backend/Auth/Supabase."
  }
];

const needSignalRegister = {
  module_id: "AG27A",
  title: "Backend Need Signal Register",
  status: "backend_need_signal_register_created_no_activation",
  signals: needSignals,
  future_backend_need_count: needSignals.filter((item) => item.future_backend_need).length,
  immediate_static_path_need_count: needSignals.filter((item) => item.needed_now_for_static_path).length,
  backend_activation_approved_now: false,
  blocked_state: blockedState
};

const requirementRows = [
  {
    capability: "Admin/Editor login",
    can_continue_static_now: true,
    backend_required_for_runtime: true,
    activation_status: "deferred",
    notes: "Planned in AG26, not implemented."
  },
  {
    capability: "Admin review queue",
    can_continue_static_now: true,
    backend_required_for_runtime: true,
    activation_status: "deferred",
    notes: "Queue model exists; runtime queue remains blocked."
  },
  {
    capability: "Editor assignment and return-to-Admin flow",
    can_continue_static_now: true,
    backend_required_for_runtime: true,
    activation_status: "deferred",
    notes: "Routing governance is closed; no live workflow queue exists yet."
  },
  {
    capability: "Admin final publish control",
    can_continue_static_now: true,
    backend_required_for_runtime: true,
    activation_status: "deferred",
    notes: "Admin-only publish authority is preserved; publish runtime remains blocked."
  },
  {
    capability: "Audit trail",
    can_continue_static_now: true,
    backend_required_for_runtime: true,
    activation_status: "deferred",
    notes: "Current audit is file-based governance; live audit trail needs backend."
  },
  {
    capability: "Subscriber/personalization",
    can_continue_static_now: true,
    backend_required_for_runtime: true,
    activation_status: "deferred",
    notes: "Can remain planned until backend/Auth activation is separately approved."
  },
  {
    capability: "Static article and governance pipeline",
    can_continue_static_now: true,
    backend_required_for_runtime: false,
    activation_status: "continue_static",
    notes: "Current governed static path remains valid."
  }
];

const requirementMatrix = {
  module_id: "AG27A",
  title: "Backend Requirement Matrix",
  status: "backend_requirement_matrix_created_no_activation",
  requirement_rows: requirementRows,
  immediate_backend_required_for_current_static_path: false,
  backend_required_for_future_dynamic_admin_editor_runtime: true,
  backend_activation_approved_now: false,
  blocked_state: blockedState
};

const staticVsBackendAssessment = {
  module_id: "AG27A",
  title: "Static vs Backend Continuation Assessment",
  status: "static_vs_backend_assessment_created_continue_static_for_now",
  decision_frame: {
    continue_static_path_now: true,
    activate_backend_now: false,
    plan_backend_architecture_now: false,
    require_ag27b_decision_audit_next: true,
    require_explicit_approval_before_ag27c_or_later_backend_architecture: true
  },
  rationale: [
    "AG26Z closed the Admin/Editor manual workflow as a non-runtime planning foundation.",
    "Existing AG27 already confirms Supabase/Auth/backend remains deferred.",
    "No user approval has been given to activate backend/Auth/Supabase.",
    "Backend is a future need for real login, runtime queue, audit trail, dynamic publishing and subscriber features.",
    "Current work should remain static/GitHub-controlled until explicit backend approval is given."
  ],
  blocked_state: blockedState
};

const consumptionPlan = {
  module_id: "AG27A",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag27b",
  future_consumption: {
    AG27B:
      "Backend Decision Audit should consume AG27A need signals, requirement matrix, static-vs-backend assessment, AG26Z closure and existing AG27 checkpoint to decide continue static / plan backend / choose another backend.",
    AG27C:
      "Supabase/Auth Architecture Plan must remain conditional and should be generated only if backend planning is explicitly approved.",
    AG27D:
      "Security/RLS planning must remain conditional and should not start without explicit approval.",
    AG27Z:
      "Backend Decision Closure should close the AG27 detailed decision chain as backend deferred unless approval changes."
  },
  blocked_state: blockedState
};

const assessment = {
  module_id: "AG27A",
  title: "Backend Need Assessment",
  status: "backend_need_assessment_created_ready_for_ag27b",
  purpose:
    "Assess whether Drishvara now requires backend/Auth/Supabase for Admin/Editor login, runtime queues, audit logs, subscriber features and dynamic publishing, while preserving backend deferral and no activation.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  consumed_source_summary: {
    ag26z_status: records.ag26zClosure.status,
    ag26_detailed_chain_closed: records.ag26zClosure.closure_decision?.ag26_detailed_chain_closed === true,
    existing_ag27_status: records.ag27ExistingCheckpoint.status,
    existing_ag27_backend_deferred: records.ag27ExistingCheckpoint.checkpoint_decision?.backend_deferred === true,
    ag28_blocked: records.ag27ExistingCheckpoint.checkpoint_decision?.ag28_to_ag40_allowed_now === false,
    explicit_approval_required_before_ag28: records.ag26zReadiness.explicit_approval_required_before_ag28 === true
  },
  assessment_decision: {
    backend_is_future_requirement_for_runtime_admin_editor: true,
    backend_required_now_for_current_static_governed_path: false,
    backend_activation_approved_now: false,
    continue_static_now: true,
    proceed_to_ag27b_decision_audit: true,
    ag27c_architecture_plan_allowed_now: false,
    ag27d_security_rls_plan_allowed_now: false,
    ag28_allowed_now: false,
    explicit_approval_required_before_backend_planning_or_activation: true
  },
  need_signal_register_file: outputs.needSignalRegister,
  requirement_matrix_file: outputs.requirementMatrix,
  static_vs_backend_assessment_file: outputs.staticVsBackendAssessment,
  future_consumption_plan_file: outputs.consumptionPlan,
  supabase_auth_backend_deferred: true,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG27A",
  title: "Backend Need Assessment Blocker Register",
  status: "backend_need_assessment_runtime_operations_blocked_pending_ag27b",
  blocked_items: [
    "No backend activation.",
    "No Auth activation.",
    "No Supabase activation.",
    "No database creation.",
    "No migration creation.",
    "No RLS policy creation.",
    "No secret creation.",
    "No Admin login creation.",
    "No Editor login creation.",
    "No runtime queue creation.",
    "No runtime write path.",
    "No dynamic publishing.",
    "No article mutation.",
    "No GitHub token creation.",
    "No GitHub write.",
    "No deployment trigger.",
    "No publishing.",
    "No AG27C architecture planning unless explicitly approved.",
    "No AG27D RLS/security planning unless explicitly approved.",
    "No AG28 backend/Auth/dynamic publishing start without explicit approval."
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
  need_signal_register_created: true,
  requirement_matrix_created: true,
  static_vs_backend_assessment_created: true,
  backend_activation_allowed_now: false,
  ag27c_allowed_now: false,
  ag27d_allowed_now: false,
  ag28_allowed_now: false,
  explicit_approval_required_before_backend_planning_or_activation: true,
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
    "Consume AG27A backend need assessment.",
    "Consume AG26Z manual Admin/Editor workflow closure.",
    "Consume existing AG27 backend decision checkpoint.",
    "Audit whether to continue static, plan Supabase/Auth, or choose another backend.",
    "Do not activate backend/Auth/Supabase.",
    "Do not create database, secrets, migrations, RLS policies, runtime queues, GitHub writes, deployment or publishing."
  ],
  blocked_scope: blocker.blocked_items,
  supabase_auth_backend_deferred: true,
  explicit_approval_required_before_ag27c: true,
  explicit_approval_required_before_ag28: true
};

const review = {
  module_id: "AG27A",
  title: "Backend Need Assessment",
  status: "backend_need_assessment_created_ready_for_ag27b",
  depends_on: ["AG26Z", "AG27_EXISTING", "AG26", "AG25Z", "AG24Z"],
  generated_from: inputs,
  assessment_file: outputs.assessment,
  need_signal_register_file: outputs.needSignalRegister,
  requirement_matrix_file: outputs.requirementMatrix,
  static_vs_backend_assessment_file: outputs.staticVsBackendAssessment,
  future_consumption_plan_file: outputs.consumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    backend_need_assessment_created: true,
    backend_is_future_requirement_for_runtime_admin_editor: true,
    backend_required_now_for_current_static_governed_path: false,
    continue_static_now: true,
    ready_for_ag27b: true,
    backend_activation_approved_now: false,
    ag27c_allowed_now: false,
    ag27d_allowed_now: false,
    ag28_allowed_now: false,
    backend_enabled: false,
    auth_enabled: false,
    supabase_enabled: false,
    database_created: false,
    migration_created: false,
    secret_created: false,
    runtime_queue_created: false,
    runtime_write_enabled: false,
    deployment_done: false,
    publishing_done: false,
    real_execution_done: false
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
  message: "AG27A Backend Need Assessment created. Backend is a future runtime requirement, but current path continues static; next: AG27B Backend Decision Audit.",
  backend_is_future_requirement_for_runtime_admin_editor: true,
  backend_required_now_for_current_static_path: 0,
  continue_static_now: true,
  ready_for_ag27b: true,
  backend_activation_approved_now: 0,
  ag27c_allowed_now: 0,
  ag27d_allowed_now: 0,
  ag28_allowed_now: 0,
  backend_objects: 0,
  auth_objects: 0,
  database_objects: 0,
  runtime_queues: 0,
  deployments: 0,
  published_items: 0,
  blocked_state: blockedState
};

const doc = `# AG27A — Backend Need Assessment

## Purpose

AG27A assesses whether Drishvara currently requires backend/Auth/Supabase for real Admin/Editor login, database-backed review queues, audit logs, subscriber features and dynamic publishing.

## Assessment Result

Backend is a future requirement for runtime Admin/Editor workflow and dynamic publishing, but backend is not required for the current static governed path.

The current decision remains:

- Continue static now.
- Do not activate Supabase/Auth/backend.
- Do not start AG27C or AG27D without explicit approval.
- Do not start AG28 without explicit approval.

## Consumed Source-of-Truth

- AG26Z Manual Admin/Editor Workflow Closure.
- Existing AG27 backend decision checkpoint.
- AG26 umbrella Admin/Editor workflow strengthening.
- AG25Z Featured Reads Production Readiness Closure.
- AG24Z Episodic Knowledge Engine Closure.

## Need Signals

- Multi-user Admin/Editor login.
- Database-backed review queue.
- Richer audit trail.
- Subscriber/personalization features.
- Dynamic Admin publishing.
- Runtime object generation tracking.
- Static governance continuation.

## Non-Activation Boundary

AG27A does not create backend, Auth, Supabase, database, migrations, RLS policies, secrets, logins, runtime queues, GitHub writes, deployment or publishing.

## Next Stage

AG27B — Backend Decision Audit.
`;

writeJson(outputs.review, review);
writeJson(outputs.assessment, assessment);
writeJson(outputs.needSignalRegister, needSignalRegister);
writeJson(outputs.requirementMatrix, requirementMatrix);
writeJson(outputs.staticVsBackendAssessment, staticVsBackendAssessment);
writeJson(outputs.consumptionPlan, consumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG27A Backend Need Assessment generated.");
console.log("✅ Backend identified as future runtime requirement.");
console.log("✅ Current static governed path remains valid.");
console.log("✅ Backend/Auth/Supabase remains deferred.");
console.log("✅ AG27B Backend Decision Audit boundary created.");
console.log("✅ No backend, Auth, database, queue, deployment or publishing performed.");
