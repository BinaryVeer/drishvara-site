import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag27aReview: "data/content-intelligence/quality-reviews/ag27a-backend-need-assessment.json",
  ag27aAssessment: "data/content-intelligence/backend-decision/ag27a-backend-need-assessment.json",
  ag27aSignalRegister: "data/content-intelligence/backend-decision/ag27a-backend-need-signal-register.json",
  ag27aMatrix: "data/content-intelligence/backend-decision/ag27a-static-vs-backend-readiness-matrix.json",
  ag27aScope: "data/content-intelligence/backend-decision/ag27a-backend-planning-scope-register.json",
  ag27aReadiness: "data/content-intelligence/quality-registry/ag27a-backend-decision-audit-readiness-record.json",
  ag27aBoundary: "data/content-intelligence/mutation-plans/ag27a-to-ag27b-backend-decision-audit-boundary.json",

  ag26zReview: "data/content-intelligence/quality-reviews/ag26z-manual-admin-editor-workflow-closure.json",
  ag26zClosure: "data/content-intelligence/admin-editor/ag26z-manual-admin-editor-workflow-closure.json",
  ag26zRoleGovernance: "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",
  ag26zBackendCarryForward: "data/content-intelligence/admin-editor/ag26z-ag27-backend-deferral-carry-forward.json",

  ag27Checkpoint: "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",
  ag27DeferralRecord: "data/content-intelligence/backend-decision/ag27-backend-deferral-record.json",
  ag27Boundary: "data/content-intelligence/mutation-plans/ag27-to-ag28-conditional-backend-path-boundary.json",

  ag25zClosure: "data/content-intelligence/featured-reads/ag25z-featured-reads-production-readiness-closure.json",
  ag24zClosure: "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag27b-backend-decision-audit.json",
  audit: "data/content-intelligence/backend-decision/ag27b-backend-decision-audit.json",
  optionMatrix: "data/content-intelligence/backend-decision/ag27b-backend-option-decision-matrix.json",
  supabasePlanningDecision: "data/content-intelligence/backend-decision/ag27b-supabase-planning-decision-record.json",
  nonActivationAudit: "data/content-intelligence/backend-decision/ag27b-non-activation-audit-register.json",
  futureConsumptionPlan: "data/content-intelligence/backend-decision/ag27b-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag27b-backend-decision-audit-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag27b-supabase-auth-security-rls-plan-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag27b-to-ag27c-supabase-auth-security-rls-plan-boundary.json",
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
if (records.ag27aReadiness.ready_for_ag27b !== true) throw new Error("AG27A readiness does not permit AG27B.");
if (records.ag27aBoundary.next_stage_id !== "AG27B") throw new Error("AG27A boundary does not point to AG27B.");
if (records.ag27aAssessment.assessment_decision?.backend_planning_should_continue_to_ag27b !== true) throw new Error("AG27A must permit backend planning to AG27B.");
if (records.ag27aAssessment.assessment_decision?.backend_activation_should_start_now !== false) throw new Error("Backend activation must remain blocked.");
if (records.ag26zReview.status !== "manual_admin_editor_workflow_closed_ag27_backend_deferred") throw new Error("AG26Z review status mismatch.");
if (records.ag26zClosure.closure_decision?.ag26_detailed_chain_closed !== true) throw new Error("AG26 detailed chain must be closed.");
if (records.ag26zBackendCarryForward.backend_deferred !== true) throw new Error("AG26Z backend deferral missing.");
if (records.ag27Checkpoint.status !== "supabase_auth_backend_decision_checkpoint_created_backend_deferred") throw new Error("AG27 checkpoint status mismatch.");
if (records.ag27Checkpoint.checkpoint_decision?.backend_deferred !== true) throw new Error("AG27 backend deferral missing.");
if (records.ag27Checkpoint.checkpoint_decision?.backend_activation_approved !== false) throw new Error("Backend activation must remain unapproved.");
if (records.ag27Boundary.explicit_approval_required !== true) throw new Error("AG27 boundary explicit approval gate missing.");
if (records.ag25zClosure.status !== "featured_reads_production_readiness_closed_ready_for_ag26a") throw new Error("AG25Z status mismatch.");
if (records.ag24zClosure.status !== "episodic_knowledge_engine_closed_ready_for_ag25") throw new Error("AG24Z status mismatch.");

const blockedState = {
  backend_decision_audit_created: true,
  selected_non_active_backend_planning_path: true,
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

const options = [
  {
    option_id: "continue_static_only",
    label: "Continue static/GitHub-controlled path only",
    fit_for_current_public_site: "high",
    fit_for_real_admin_editor_queue: "low",
    fit_for_audit_logs_and_rollback: "low",
    fit_for_future_dynamic_publish: "low",
    operational_risk: "low",
    cost_now: "low",
    selected: false,
    decision_note: "Safe for current public reading surface, but insufficient for real Admin/Editor login, database queue and dynamic publishing."
  },
  {
    option_id: "controlled_non_active_supabase_auth_planning",
    label: "Plan Supabase/Auth/backend architecture without activation",
    fit_for_current_public_site: "medium",
    fit_for_real_admin_editor_queue: "high",
    fit_for_audit_logs_and_rollback: "high",
    fit_for_future_dynamic_publish: "high",
    operational_risk: "medium_controlled",
    cost_now: "low_planning_only",
    selected: true,
    decision_note: "Best next planning path because it prepares Admin/Editor roles, queue, audit logs, RLS and state model without activating runtime backend."
  },
  {
    option_id: "choose_other_backend",
    label: "Choose another backend later",
    fit_for_current_public_site: "medium",
    fit_for_real_admin_editor_queue: "unknown_until_evaluated",
    fit_for_audit_logs_and_rollback: "unknown_until_evaluated",
    fit_for_future_dynamic_publish: "unknown_until_evaluated",
    operational_risk: "unknown",
    cost_now: "medium_due_to_re-evaluation",
    selected: false,
    decision_note: "Not selected now because existing planning and prior checkpoint already reference Supabase/Auth as the controlled path."
  }
];

const decisionChecks = [
  {
    check_id: "backend_need_exists",
    expected: "Backend need exists for future real workflow",
    passed: records.ag27aAssessment.assessment_decision.backend_need_for_future_real_admin_editor_workflow === true
  },
  {
    check_id: "static_path_still_safe_now",
    expected: "Static path remains sufficient for current no-runtime stage",
    passed: records.ag27aAssessment.assessment_decision.static_github_controlled_path_sufficient_for_current_no_runtime_stage === true
  },
  {
    check_id: "activation_not_needed_now",
    expected: "Backend activation should not start now",
    passed: records.ag27aAssessment.assessment_decision.backend_activation_should_start_now === false
  },
  {
    check_id: "ag28_still_blocked",
    expected: "AG28 remains blocked pending explicit approval",
    passed: records.ag27Boundary.explicit_approval_required === true
  },
  {
    check_id: "supabase_planning_is_reasonable",
    expected: "Supabase/Auth planning is the selected non-active path",
    passed: options.find((item) => item.option_id === "controlled_non_active_supabase_auth_planning")?.selected === true
  }
];

const optionMatrix = {
  module_id: "AG27B",
  title: "Backend Option Decision Matrix",
  status: "backend_option_decision_matrix_created_no_activation",
  options,
  selected_option_id: "controlled_non_active_supabase_auth_planning",
  selected_decision:
    "Proceed with non-active Supabase/Auth/backend planning through AG27C. Do not activate Supabase, Auth, database, secrets, runtime routes or deployment.",
  rejected_paths: [
    "continue_static_only_as_final_path_for_admin_editor_workflow",
    "switch_to_other_backend_now",
    "activate_supabase_now"
  ],
  blocked_state: blockedState
};

const supabasePlanningDecision = {
  module_id: "AG27B",
  title: "Supabase Planning Decision Record",
  status: "supabase_auth_backend_planning_selected_no_activation",
  decision: {
    backend_planning_path_selected: true,
    selected_backend_family: "Supabase/Auth planning",
    planning_mode: "non_active_architecture_and_security_planning_only",
    proceed_to_ag27c: true,
    proceed_to_ag28_now: false,
    supabase_sandbox_activation_now: false,
    auth_activation_now: false,
    database_creation_now: false,
    secrets_or_env_setup_now: false,
    deployment_now: false
  },
  rationale: [
    "AG26 Admin/Editor workflow requires future role separation and assigned queues.",
    "AG26 publish actions are plan-only and require future controlled execution path.",
    "AG27A identified backend need for real queue, audit logs, rollback and dynamic publishing.",
    "Planning can proceed without activating runtime backend."
  ],
  blocked_state: blockedState
};

const nonActivationAudit = {
  module_id: "AG27B",
  title: "Backend Decision Non-Activation Audit Register",
  status: "backend_decision_non_activation_audit_passed",
  checks: [
    {
      check_id: "no_supabase_project_created",
      passed: true,
      evidence: "AG27B creates records only; no Supabase project commands or secrets."
    },
    {
      check_id: "no_database_created",
      passed: true,
      evidence: "No SQL, migration, table creation, RLS policy or database command is generated."
    },
    {
      check_id: "no_auth_enabled",
      passed: true,
      evidence: "Auth remains plan-only and blocked."
    },
    {
      check_id: "no_secret_or_env_write",
      passed: true,
      evidence: "Secrets/env vars are explicitly blocked."
    },
    {
      check_id: "no_runtime_routes",
      passed: true,
      evidence: "No server/API routes are created."
    },
    {
      check_id: "no_deployment_or_public_mutation",
      passed: true,
      evidence: "Deployment and public mutation remain blocked."
    }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const futureConsumptionPlan = {
  module_id: "AG27B",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag27c",
  future_consumption: {
    AG27C:
      "Supabase/Auth Security and RLS Plan should consume AG27B selected non-active Supabase planning decision and plan tables, roles, RLS, audit and secrets governance without activation.",
    AG27D:
      "Only if planning remains approved, AG27D may deepen access/security model. It must still remain no-activation unless a later explicit stage allows activation.",
    AG27Z:
      "Backend Decision Closure should close AG27 detailed chain as backend planning approved but activation deferred, or as backend fully deferred.",
    AG28:
      "AG28 Backend/Auth Architecture Blueprint may start only after AG27Z explicitly permits non-active architecture planning. It still must not activate backend."
  },
  blocked_state: blockedState
};

const audit = {
  module_id: "AG27B",
  title: "Backend Decision Audit",
  status: "backend_decision_audit_created_ready_for_ag27c",
  purpose:
    "Audit backend options after AG27A and decide the next governed backend path: continue static only, plan Supabase/Auth, or choose another backend. AG27B selects non-active Supabase/Auth/backend planning for AG27C without activation.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  consumed_source_summary: {
    ag27a_status: records.ag27aAssessment.status,
    ag27a_backend_planning_allowed: records.ag27aAssessment.backend_planning_allowed_in_ag27a === true,
    ag26z_status: records.ag26zClosure.status,
    ag27_checkpoint_status: records.ag27Checkpoint.status,
    ag27_backend_deferred: records.ag27Checkpoint.checkpoint_decision?.backend_deferred === true,
    ag28_blocked: records.ag27Boundary.explicit_approval_required === true
  },
  decision_audit: {
    decision_checks: decisionChecks,
    failed_checks: decisionChecks.filter((check) => check.passed !== true),
    selected_option_id: "controlled_non_active_supabase_auth_planning",
    decision_result: "proceed_to_ag27c_security_rls_planning_no_activation",
    backend_planning_approved_for_next_stage: true,
    backend_activation_approved_now: false,
    supabase_sandbox_activation_approved_now: false,
    auth_activation_approved_now: false,
    database_creation_approved_now: false,
    secrets_or_env_setup_approved_now: false,
    ag28_allowed_now: false
  },
  option_matrix_file: outputs.optionMatrix,
  supabase_planning_decision_file: outputs.supabasePlanningDecision,
  non_activation_audit_file: outputs.nonActivationAudit,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  backend_decision_audit_created: true,
  backend_planning_selected_in_ag27b: true,
  backend_activation_allowed_in_ag27b: false,
  supabase_activation_allowed_in_ag27b: false,
  auth_activation_allowed_in_ag27b: false,
  database_creation_allowed_in_ag27b: false,
  rls_policy_creation_allowed_in_ag27b: false,
  secret_creation_allowed_in_ag27b: false,
  deployment_allowed_in_ag27b: false,
  public_mutation_allowed_in_ag27b: false,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG27B",
  title: "Backend Decision Audit Blocker Register",
  status: "backend_decision_audit_operations_blocked_pending_ag27c",
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
    "No AG28 start until AG27Z permits it."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG27B",
  title: "Supabase/Auth Security and RLS Plan Readiness Record",
  status: "ready_for_ag27c_supabase_auth_security_rls_plan",
  ready_for_ag27c: true,
  next_stage_id: "AG27C",
  next_stage_title: "Supabase/Auth Security and RLS Plan",
  backend_decision_audit_created: true,
  option_matrix_created: true,
  supabase_planning_decision_created: true,
  non_activation_audit_passed: true,
  real_execution_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG27B",
  title: "AG27B to AG27C Supabase/Auth Security and RLS Plan Boundary",
  status: "ag27c_boundary_created_not_started",
  next_stage_id: "AG27C",
  next_stage_title: "Supabase/Auth Security and RLS Plan",
  allowed_scope: [
    "Consume AG27A backend need assessment.",
    "Consume AG27B selected non-active Supabase/Auth planning decision.",
    "Plan tables, roles, RLS, audit, rollback and secrets governance.",
    "Keep Supabase/Auth/backend activation blocked.",
    "Keep secrets, env vars, database creation, RLS application, deployment and public mutation blocked."
  ],
  blocked_scope: blocker.blocked_items,
  backend_planning_selected: true,
  backend_activation_deferred: true,
  supabase_auth_backend_deferred: true,
  explicit_approval_required_before_activation: true
};

const review = {
  module_id: "AG27B",
  title: "Backend Decision Audit",
  status: "backend_decision_audit_created_ready_for_ag27c",
  depends_on: ["AG27A", "AG26Z", "AG27", "AG25Z", "AG24Z"],
  generated_from: inputs,
  audit_file: outputs.audit,
  option_matrix_file: outputs.optionMatrix,
  supabase_planning_decision_file: outputs.supabasePlanningDecision,
  non_activation_audit_file: outputs.nonActivationAudit,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    backend_decision_audit_created: true,
    selected_option_id: "controlled_non_active_supabase_auth_planning",
    backend_planning_selected: true,
    proceed_to_ag27c: true,
    backend_activation_allowed_now: false,
    supabase_activation_allowed_now: false,
    auth_activation_allowed_now: false,
    database_creation_allowed_now: false,
    rls_policy_creation_allowed_now: false,
    secret_creation_allowed_now: false,
    deployment_done: false,
    public_mutation_done: false,
    backend_activation_done: false,
    real_execution_done: false,
    ag28_allowed_now: false,
    ready_for_ag27c: true
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
  message: "AG27B Backend Decision Audit created. Selected non-active Supabase/Auth planning path. Next: AG27C Supabase/Auth Security and RLS Plan.",
  backend_decision_audit_created: 1,
  backend_planning_selected: 1,
  proceed_to_ag27c: 1,
  backend_activation_allowed: 0,
  supabase_activation_allowed: 0,
  auth_activation_allowed: 0,
  database_objects_created: 0,
  rls_policies_created: 0,
  secrets_created: 0,
  deployment_done: 0,
  public_items: 0,
  backend_objects: 0,
  ag28_allowed_now: 0,
  blocked_state: blockedState
};

const doc = `# AG27B — Backend Decision Audit

## Purpose

AG27B audits the backend decision after AG27A and selects the next governed path.

## Decision

Selected path:

**Controlled non-active Supabase/Auth/backend planning.**

This means AG27C may plan tables, roles, RLS, audit logs, rollback records and secrets governance.

## Not Approved

AG27B does not approve real activation.

The following remain blocked:

- Supabase project creation or connection.
- Database table creation.
- RLS policy application.
- Auth activation.
- Admin/Editor login creation.
- Secrets or environment variable writing.
- Runtime API/server routes.
- Deployment.
- Publishing.
- Public mutation.

## Next Stage

AG27C — Supabase/Auth Security and RLS Plan.
`;

writeJson(outputs.review, review);
writeJson(outputs.audit, audit);
writeJson(outputs.optionMatrix, optionMatrix);
writeJson(outputs.supabasePlanningDecision, supabasePlanningDecision);
writeJson(outputs.nonActivationAudit, nonActivationAudit);
writeJson(outputs.futureConsumptionPlan, futureConsumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG27B Backend Decision Audit generated.");
console.log("✅ Selected non-active Supabase/Auth/backend planning path.");
console.log("✅ Backend activation, Supabase activation, Auth activation, database creation, secrets, deployment and public mutation remain blocked.");
console.log("✅ AG27C Supabase/Auth Security and RLS Plan boundary created.");
