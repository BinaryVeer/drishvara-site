import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag27aReview: "data/content-intelligence/quality-reviews/ag27a-backend-need-assessment.json",
  ag27aAssessment: "data/content-intelligence/backend-decision/ag27a-backend-need-assessment.json",
  ag27aNeedSignalRegister: "data/content-intelligence/backend-decision/ag27a-backend-need-signal-register.json",
  ag27aRequirementMatrix: "data/content-intelligence/backend-decision/ag27a-backend-requirement-matrix.json",
  ag27aStaticVsBackendAssessment: "data/content-intelligence/backend-decision/ag27a-static-vs-backend-continuation-assessment.json",
  ag27aReadiness: "data/content-intelligence/quality-registry/ag27a-backend-decision-audit-readiness-record.json",
  ag27aBoundary: "data/content-intelligence/mutation-plans/ag27a-to-ag27b-backend-decision-audit-boundary.json",

  existingAg27Checkpoint: "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",

  ag26zClosure: "data/content-intelligence/admin-editor/ag26z-manual-admin-editor-workflow-closure.json",
  ag26zRoutingClosure: "data/content-intelligence/admin-editor/ag26z-admin-editor-routing-closure-register.json",
  ag26zNonRuntimeClosure: "data/content-intelligence/admin-editor/ag26z-non-runtime-closure-register.json",
  ag26zExistingAg27Handoff: "data/content-intelligence/admin-editor/ag26z-existing-ag27-handoff-confirmation.json",

  ag26UmbrellaPlan: "data/content-intelligence/admin-editor/ag26-admin-editor-manual-workflow-strengthening-plan.json",
  ag25zClosure: "data/content-intelligence/featured-reads/ag25z-featured-reads-production-readiness-closure.json",
  ag24zClosure: "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag27b-backend-decision-audit.json",
  audit: "data/content-intelligence/backend-decision/ag27b-backend-decision-audit.json",
  decisionMatrix: "data/content-intelligence/backend-decision/ag27b-backend-decision-matrix.json",
  optionAudit: "data/content-intelligence/backend-decision/ag27b-backend-option-audit-register.json",
  prerequisiteAudit: "data/content-intelligence/backend-decision/ag27b-backend-prerequisite-audit-register.json",
  conditionalGate: "data/content-intelligence/backend-decision/ag27b-conditional-ag27c-ag27d-gate-register.json",
  consumptionPlan: "data/content-intelligence/backend-decision/ag27b-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag27b-backend-decision-audit-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag27b-backend-decision-closure-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag27b-to-ag27z-backend-decision-closure-boundary.json",
  registry: "data/quality/ag27b-backend-decision-audit.json",
  preview: "data/quality/ag27b-backend-decision-audit-preview.json",
  doc: "docs/quality/AG27B_BACKEND_DECISION_AUDIT.md"
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
  if (!exists(p)) throw new Error(`Missing AG27B input: ${p}`);
}

const records = Object.fromEntries(
  Object.entries(inputs).map(([key, file]) => [key, readJson(file)])
);

if (records.ag27aReview.status !== "backend_need_assessment_created_ready_for_ag27b") throw new Error("AG27A review status mismatch.");
if (records.ag27aAssessment.status !== "backend_need_assessment_created_ready_for_ag27b") throw new Error("AG27A assessment status mismatch.");
if (records.ag27aAssessment.assessment_decision?.continue_static_now !== true) throw new Error("AG27A must continue static now.");
if (records.ag27aAssessment.assessment_decision?.backend_activation_approved_now !== false) throw new Error("Backend activation must not be approved.");
if (records.ag27aReadiness.ready_for_ag27b !== true) throw new Error("AG27A readiness does not permit AG27B.");
if (records.ag27aBoundary.next_stage_id !== "AG27B") throw new Error("AG27A boundary does not point to AG27B.");
if (records.existingAg27Checkpoint.status !== "supabase_auth_backend_decision_checkpoint_created_backend_deferred") throw new Error("Existing AG27 checkpoint status mismatch.");
if (records.existingAg27Checkpoint.checkpoint_decision?.backend_deferred !== true) throw new Error("Existing AG27 backend deferral must remain true.");
if (records.existingAg27Checkpoint.checkpoint_decision?.ag28_to_ag40_allowed_now !== false) throw new Error("AG28-AG40 must remain blocked.");
if (records.ag26zClosure.status !== "manual_admin_editor_workflow_closed_existing_ag27_backend_deferred") throw new Error("AG26Z closure status mismatch.");
if (records.ag26zExistingAg27Handoff.status !== "existing_ag27_checkpoint_confirmed_backend_deferred") throw new Error("AG26Z AG27 handoff status mismatch.");
if (records.ag26UmbrellaPlan.status !== "admin_editor_manual_workflow_strengthening_created_ready_for_ag27") throw new Error("AG26 umbrella status mismatch.");
if (records.ag25zClosure.status !== "featured_reads_production_readiness_closed_ready_for_ag26a") throw new Error("AG25Z closure status mismatch.");
if (records.ag24zClosure.status !== "episodic_knowledge_engine_closed_ready_for_ag25") throw new Error("AG24Z closure status mismatch.");

const blockedState = {
  backend_decision_audit_created: true,
  continue_static_decision_preserved: true,
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
  ag27c_allowed_now: false,
  ag27d_allowed_now: false,
  ag28_allowed_now: false,
  article_file_mutated: false,
  github_token_created: false,
  github_write_performed: false,
  deployment_triggered: false,
  published: false
};

const decisionRows = [
  {
    option_id: "continue_static",
    label: "Continue static/GitHub-controlled path",
    selected_now: true,
    activation_required: false,
    reason: "Current approved path does not require runtime Auth/backend and AG26Z closed Admin/Editor workflow as non-runtime planning."
  },
  {
    option_id: "plan_supabase_auth_backend",
    label: "Plan Supabase/Auth/backend",
    selected_now: false,
    activation_required: false,
    reason: "May be needed later for real login, runtime queues, audit logs and dynamic publishing, but explicit approval has not been given."
  },
  {
    option_id: "choose_alternate_backend",
    label: "Choose another backend",
    selected_now: false,
    activation_required: false,
    reason: "No comparative backend selection has been approved; current checkpoint remains backend-deferred."
  },
  {
    option_id: "activate_backend_now",
    label: "Activate backend now",
    selected_now: false,
    activation_required: true,
    reason: "Not allowed; user has not approved Supabase/Auth/backend activation."
  }
];

const decisionMatrix = {
  module_id: "AG27B",
  title: "Backend Decision Matrix",
  status: "backend_decision_matrix_created_continue_static",
  decision_rows: decisionRows,
  selected_decision: "continue_static",
  backend_planning_approved_now: false,
  backend_activation_approved_now: false,
  supabase_auth_architecture_plan_allowed_now: false,
  rls_security_plan_allowed_now: false,
  ag28_allowed_now: false,
  blocked_state: blockedState
};

const optionAudit = {
  module_id: "AG27B",
  title: "Backend Option Audit Register",
  status: "backend_option_audit_registered_continue_static",
  audited_options: [
    {
      option_id: "continue_static",
      audit_result: "selected_for_now",
      notes: "Preserves non-runtime governed path and avoids premature Supabase/Auth/backend activation."
    },
    {
      option_id: "supabase_auth_backend",
      audit_result: "future_candidate_not_approved",
      notes: "Appropriate future option for Auth, database-backed queues, audit trail and dynamic publishing, but not approved now."
    },
    {
      option_id: "alternate_backend",
      audit_result: "not_selected",
      notes: "No alternate backend evaluation has been approved."
    }
  ],
  final_audit_position: "continue_static_now_backend_deferred",
  blocked_state: blockedState
};

const prerequisiteAudit = {
  module_id: "AG27B",
  title: "Backend Prerequisite Audit Register",
  status: "backend_prerequisite_audit_created_not_ready_for_activation",
  prerequisites_for_future_backend: [
    {
      prerequisite_id: "explicit_user_approval",
      satisfied_now: false,
      required_before: "AG27C/AG27D/AG28"
    },
    {
      prerequisite_id: "backend_provider_decision",
      satisfied_now: false,
      required_before: "architecture planning"
    },
    {
      prerequisite_id: "auth_role_model_approval",
      satisfied_now: false,
      required_before: "Auth scaffold"
    },
    {
      prerequisite_id: "database_schema_scope_approval",
      satisfied_now: false,
      required_before: "schema planning"
    },
    {
      prerequisite_id: "secret_governance_plan",
      satisfied_now: false,
      required_before: "any key/secret usage"
    },
    {
      prerequisite_id: "cost_and_maintenance_acceptance",
      satisfied_now: false,
      required_before: "backend activation"
    }
  ],
  activation_readiness: {
    backend_ready_now: false,
    auth_ready_now: false,
    supabase_ready_now: false,
    dynamic_publish_ready_now: false
  },
  blocked_state: blockedState
};

const conditionalGate = {
  module_id: "AG27B",
  title: "Conditional AG27C/AG27D Gate Register",
  status: "ag27c_ag27d_gate_closed_pending_explicit_approval",
  ag27c_supabase_auth_architecture_plan: {
    allowed_now: false,
    reason: "AG27C is only if approved. No explicit approval has been given."
  },
  ag27d_supabase_auth_security_rls_plan: {
    allowed_now: false,
    reason: "AG27D is only if approved. No explicit approval has been given."
  },
  direct_to_ag27z_backend_decision_closure: true,
  ag28_backend_auth_architecture_blueprint_allowed_now: false,
  explicit_approval_required_before_ag27c_ag27d_or_ag28: true,
  blocked_state: blockedState
};

const consumptionPlan = {
  module_id: "AG27B",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag27z",
  future_consumption: {
    AG27Z:
      "Backend Decision Closure should consume AG27A need assessment, AG27B decision audit, existing AG27 checkpoint and AG26Z closure, then close AG27 detailed chain as backend deferred / continue static.",
    AG27C:
      "AG27C must remain skipped unless explicit approval is given for backend architecture planning.",
    AG27D:
      "AG27D must remain skipped unless explicit approval is given for Supabase/Auth security and RLS planning.",
    AG28:
      "AG28 must remain blocked unless explicit approval is given after AG27Z closure."
  },
  blocked_state: blockedState
};

const audit = {
  module_id: "AG27B",
  title: "Backend Decision Audit",
  status: "backend_decision_audit_created_ready_for_ag27z",
  purpose:
    "Audit backend decision options after AG27A and confirm whether Drishvara should continue static, plan backend/Auth/Supabase, choose another backend, or activate backend now. Because no approval has been given, the audit selects continue-static and routes directly to AG27Z closure.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  consumed_source_summary: {
    ag27a_status: records.ag27aAssessment.status,
    ag27a_continue_static_now: records.ag27aAssessment.assessment_decision?.continue_static_now === true,
    existing_ag27_status: records.existingAg27Checkpoint.status,
    existing_ag27_backend_deferred: records.existingAg27Checkpoint.checkpoint_decision?.backend_deferred === true,
    ag26z_status: records.ag26zClosure.status,
    ag26z_ag28_guard: records.ag26zClosure.closure_decision?.do_not_start_ag28_without_explicit_approval === true
  },
  audit_decision: {
    selected_decision: "continue_static",
    backend_planning_approved_now: false,
    backend_activation_approved_now: false,
    supabase_auth_architecture_plan_allowed_now: false,
    security_rls_plan_allowed_now: false,
    skip_ag27c_ag27d_unless_approved: true,
    proceed_to_ag27z_backend_decision_closure: true,
    ag28_allowed_now: false,
    explicit_approval_required_before_ag27c_ag27d_or_ag28: true
  },
  decision_matrix_file: outputs.decisionMatrix,
  option_audit_file: outputs.optionAudit,
  prerequisite_audit_file: outputs.prerequisiteAudit,
  conditional_gate_file: outputs.conditionalGate,
  future_consumption_plan_file: outputs.consumptionPlan,
  supabase_auth_backend_deferred: true,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG27B",
  title: "Backend Decision Audit Blocker Register",
  status: "backend_decision_audit_runtime_operations_blocked_pending_ag27z",
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
  module_id: "AG27B",
  title: "Backend Decision Closure Readiness Record",
  status: "ready_for_ag27z_backend_decision_closure",
  ready_for_ag27z: true,
  next_stage_id: "AG27Z",
  next_stage_title: "Backend Decision Closure",
  backend_decision_audit_created: true,
  decision_matrix_created: true,
  option_audit_created: true,
  prerequisite_audit_created: true,
  conditional_gate_created: true,
  selected_decision: "continue_static",
  ag27c_allowed_now: false,
  ag27d_allowed_now: false,
  ag28_allowed_now: false,
  backend_activation_allowed_now: false,
  explicit_approval_required_before_backend_planning_or_activation: true,
  real_execution_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG27B",
  title: "AG27B to AG27Z Backend Decision Closure Boundary",
  status: "ag27z_boundary_created_not_started",
  next_stage_id: "AG27Z",
  next_stage_title: "Backend Decision Closure",
  allowed_scope: [
    "Consume AG27A Backend Need Assessment.",
    "Consume AG27B Backend Decision Audit.",
    "Consume existing AG27 backend-deferred checkpoint.",
    "Close detailed AG27 as continue-static/backend-deferred.",
    "Record that AG27C and AG27D were not run because backend planning was not approved.",
    "Keep AG28 blocked pending explicit approval."
  ],
  blocked_scope: blocker.blocked_items,
  supabase_auth_backend_deferred: true,
  explicit_approval_required_before_ag27c: true,
  explicit_approval_required_before_ag27d: true,
  explicit_approval_required_before_ag28: true
};

const review = {
  module_id: "AG27B",
  title: "Backend Decision Audit",
  status: "backend_decision_audit_created_ready_for_ag27z",
  depends_on: ["AG27A", "AG27_EXISTING", "AG26Z"],
  generated_from: inputs,
  audit_file: outputs.audit,
  decision_matrix_file: outputs.decisionMatrix,
  option_audit_file: outputs.optionAudit,
  prerequisite_audit_file: outputs.prerequisiteAudit,
  conditional_gate_file: outputs.conditionalGate,
  future_consumption_plan_file: outputs.consumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    backend_decision_audit_created: true,
    selected_decision: "continue_static",
    continue_static_now: true,
    ready_for_ag27z: true,
    backend_planning_approved_now: false,
    backend_activation_approved_now: false,
    ag27c_allowed_now: false,
    ag27d_allowed_now: false,
    ag28_allowed_now: false,
    backend_enabled: false,
    auth_enabled: false,
    supabase_enabled: false,
    database_created: false,
    migration_created: false,
    rls_policy_created: false,
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
  module_id: "AG27B",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG27B",
  preview_only: true,
  status: review.status,
  message: "AG27B Backend Decision Audit created. Decision: continue static; AG27C/AG27D skipped unless explicitly approved; next: AG27Z Backend Decision Closure.",
  selected_decision: "continue_static",
  ready_for_ag27z: true,
  backend_planning_approved_now: 0,
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

const doc = `# AG27B — Backend Decision Audit

## Purpose

AG27B audits the backend decision after AG27A.

It decides whether Drishvara should:

- continue static,
- plan Supabase/Auth,
- choose another backend, or
- activate backend now.

## Decision

The selected decision is:

**Continue static.**

Backend remains a future requirement for runtime Admin/Editor login, live queues, audit logs, subscriber features and dynamic publishing, but it is not approved for planning or activation now.

## Conditional Stages

- AG27C — Supabase/Auth Architecture Plan is skipped unless explicitly approved.
- AG27D — Supabase/Auth Security and RLS Plan is skipped unless explicitly approved.
- AG28 remains blocked unless explicitly approved.

## Non-Activation Boundary

AG27B does not create backend, Auth, Supabase, database, migrations, RLS policies, secrets, logins, runtime queues, GitHub writes, deployment or publishing.

## Next Stage

AG27Z — Backend Decision Closure.
`;

writeJson(outputs.review, review);
writeJson(outputs.audit, audit);
writeJson(outputs.decisionMatrix, decisionMatrix);
writeJson(outputs.optionAudit, optionAudit);
writeJson(outputs.prerequisiteAudit, prerequisiteAudit);
writeJson(outputs.conditionalGate, conditionalGate);
writeJson(outputs.consumptionPlan, consumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG27B Backend Decision Audit generated.");
console.log("✅ Decision selected: continue static.");
console.log("✅ AG27C/AG27D remain skipped unless explicitly approved.");
console.log("✅ AG28 remains blocked pending explicit approval.");
console.log("✅ AG27Z Backend Decision Closure boundary created.");
console.log("✅ No backend, Auth, database, queue, deployment or publishing performed.");
