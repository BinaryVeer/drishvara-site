import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag27AReview: "data/content-intelligence/quality-reviews/ag27a-backend-need-assessment.json",
  ag27AAssessment: "data/content-intelligence/backend-decision/ag27a-backend-need-assessment.json",
  ag27ASignalRegister: "data/content-intelligence/backend-decision/ag27a-backend-need-signal-register.json",
  ag27AMatrix: "data/content-intelligence/backend-decision/ag27a-static-vs-backend-readiness-matrix.json",

  ag27BReview: "data/content-intelligence/quality-reviews/ag27b-backend-decision-audit.json",
  ag27BAudit: "data/content-intelligence/backend-decision/ag27b-backend-decision-audit.json",
  ag27BOptionMatrix: "data/content-intelligence/backend-decision/ag27b-backend-option-decision-matrix.json",
  ag27BSupabaseDecision: "data/content-intelligence/backend-decision/ag27b-supabase-planning-decision-record.json",

  ag27CReview: "data/content-intelligence/quality-reviews/ag27c-supabase-auth-security-rls-plan.json",
  ag27CPlan: "data/content-intelligence/backend-decision/ag27c-supabase-auth-security-rls-plan.json",
  ag27CTablePlan: "data/content-intelligence/backend-decision/ag27c-supabase-table-plan.json",
  ag27CRoleAccessModel: "data/content-intelligence/backend-decision/ag27c-auth-role-access-model.json",
  ag27CRlsPolicyPlan: "data/content-intelligence/backend-decision/ag27c-rls-policy-plan.json",
  ag27CAuditSecretPlan: "data/content-intelligence/backend-decision/ag27c-audit-secret-governance-plan.json",

  ag27DReview: "data/content-intelligence/quality-reviews/ag27d-conditional-security-rls-detail-plan.json",
  ag27DPlan: "data/content-intelligence/backend-decision/ag27d-conditional-security-rls-detail-plan.json",
  ag27DAccessBoundaryMatrix: "data/content-intelligence/backend-decision/ag27d-access-boundary-matrix.json",
  ag27DRlsScenarioModel: "data/content-intelligence/backend-decision/ag27d-rls-test-scenario-model.json",
  ag27DSecretRiskRegister: "data/content-intelligence/backend-decision/ag27d-secret-risk-register.json",
  ag27DActivationGuardRegister: "data/content-intelligence/backend-decision/ag27d-activation-guard-register.json",
  ag27DNonActivationAudit: "data/content-intelligence/backend-decision/ag27d-non-activation-audit-register.json",
  ag27DReadiness: "data/content-intelligence/quality-registry/ag27d-backend-decision-closure-readiness-record.json",
  ag27DBoundary: "data/content-intelligence/mutation-plans/ag27d-to-ag27z-backend-decision-closure-boundary.json",

  ag26ZClosure: "data/content-intelligence/admin-editor/ag26z-manual-admin-editor-workflow-closure.json",
  ag26ZRoleGovernance: "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  ag27Checkpoint: "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",
  ag27DeferralRecord: "data/content-intelligence/backend-decision/ag27-backend-deferral-record.json",
  ag27Boundary: "data/content-intelligence/mutation-plans/ag27-to-ag28-conditional-backend-path-boundary.json",

  ag25ZClosure: "data/content-intelligence/featured-reads/ag25z-featured-reads-production-readiness-closure.json",
  ag24ZClosure: "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag27z-backend-decision-closure.json",
  closure: "data/content-intelligence/backend-decision/ag27z-backend-decision-closure.json",
  sourceChain: "data/content-intelligence/backend-decision/ag27z-ag27-detailed-source-chain-register.json",
  planningClosure: "data/content-intelligence/backend-decision/ag27z-non-active-backend-planning-closure-register.json",
  activationDeferral: "data/content-intelligence/backend-decision/ag27z-backend-activation-deferral-register.json",
  ag28Handoff: "data/content-intelligence/backend-decision/ag27z-ag28-non-active-architecture-handoff-plan.json",
  futureConsumptionPlan: "data/content-intelligence/backend-decision/ag27z-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag27z-backend-decision-closure-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag27z-ag28-backend-architecture-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag27z-to-ag28-backend-architecture-boundary.json",
  registry: "data/quality/ag27z-backend-decision-closure.json",
  preview: "data/quality/ag27z-backend-decision-closure-preview.json",
  doc: "docs/quality/AG27Z_BACKEND_DECISION_CLOSURE.md"
};

function full(p) {
  return path.join(root, p);
}

function exists(p) {
  return fs.existsSync(full(p));
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(full(p), "utf8"));
}

function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}

function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG27Z input: ${p}`);
}

const records = Object.fromEntries(
  Object.entries(inputs).map(([key, file]) => [key, readJson(file)])
);

if (records.ag27AAssessment.status !== "backend_need_assessment_created_ready_for_ag27b") throw new Error("AG27A status mismatch.");
if (records.ag27BAudit.status !== "backend_decision_audit_created_ready_for_ag27c") throw new Error("AG27B status mismatch.");
if (records.ag27CPlan.status !== "supabase_auth_security_rls_plan_created_ready_for_conditional_ag27d") throw new Error("AG27C status mismatch.");
if (records.ag27DPlan.status !== "conditional_security_rls_detail_plan_created_ready_for_ag27z") throw new Error("AG27D status mismatch.");
if (records.ag27DReadiness.ready_for_ag27z !== true) throw new Error("AG27D readiness does not permit AG27Z.");
if (records.ag27DBoundary.next_stage_id !== "AG27Z") throw new Error("AG27D boundary does not point to AG27Z.");
if (records.ag27DNonActivationAudit.audit_passed !== true) throw new Error("AG27D non-activation audit must pass.");
if (records.ag26ZClosure.closure_decision?.ag26_detailed_chain_closed !== true) throw new Error("AG26Z chain must be closed.");
if (records.ag26ZRoleGovernance.role_rules?.admin_final_clearance_authority !== true) throw new Error("Admin final clearance missing.");
if (records.ag26ZRoleGovernance.role_rules?.editor_can_only_work_on_admin_assigned_items !== true) throw new Error("Editor assigned-only rule missing.");
if (records.ag27Checkpoint.status !== "supabase_auth_backend_decision_checkpoint_created_backend_deferred") throw new Error("Original AG27 checkpoint status mismatch.");
if (records.ag27Checkpoint.checkpoint_decision?.backend_deferred !== true) throw new Error("Backend deferral missing.");
if (records.ag27Checkpoint.checkpoint_decision?.backend_activation_approved !== false) throw new Error("Backend activation must remain unapproved.");
if (records.ag27Boundary.explicit_approval_required !== true) throw new Error("Original AG27 boundary explicit approval gate missing.");
if (records.ag25ZClosure.status !== "featured_reads_production_readiness_closed_ready_for_ag26a") throw new Error("AG25Z status mismatch.");
if (records.ag24ZClosure.status !== "episodic_knowledge_engine_closed_ready_for_ag25") throw new Error("AG24Z status mismatch.");

const blockedState = {
  backend_decision_closure_created: true,
  ag27_detailed_chain_closed: true,
  non_active_backend_planning_closed: true,
  ag28_non_active_architecture_allowed: true,
  runtime_backend_created: false,
  supabase_project_created: false,
  supabase_connected: false,
  sql_generated: false,
  migration_generated: false,
  database_table_created: false,
  rls_policy_applied: false,
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

const sourceChain = {
  module_id: "AG27Z",
  title: "AG27 Detailed Source Chain Register",
  status: "ag27_detailed_source_chain_registered_for_closure",
  chain_length: 4,
  closed_chain: [
    {
      stage_id: "AG27A",
      title: "Backend Need Assessment",
      status: records.ag27AAssessment.status,
      file: inputs.ag27AAssessment
    },
    {
      stage_id: "AG27B",
      title: "Backend Decision Audit",
      status: records.ag27BAudit.status,
      file: inputs.ag27BAudit
    },
    {
      stage_id: "AG27C",
      title: "Supabase/Auth Security and RLS Plan",
      status: records.ag27CPlan.status,
      file: inputs.ag27CPlan
    },
    {
      stage_id: "AG27D",
      title: "Conditional Security/RLS Detail Plan",
      status: records.ag27DPlan.status,
      file: inputs.ag27DPlan
    }
  ],
  original_checkpoint_consumed: inputs.ag27Checkpoint,
  blocked_state: blockedState
};

const planningClosure = {
  module_id: "AG27Z",
  title: "Non-Active Backend Planning Closure Register",
  status: "non_active_backend_planning_closed_ready_for_ag28_architecture",
  closure_points: {
    backend_need_confirmed_for_future_workflow: true,
    non_active_supabase_auth_planning_selected: true,
    table_planning_completed: true,
    role_access_planning_completed: true,
    rls_policy_planning_completed: true,
    audit_secret_governance_planning_completed: true,
    access_boundary_detail_completed: true,
    rls_scenario_detail_completed: true,
    secret_risk_detail_completed: true,
    activation_guard_detail_completed: true,
    backend_architecture_planning_can_continue_to_ag28: true,
    real_activation_still_blocked: true
  },
  blocked_state: blockedState
};

const activationDeferral = {
  module_id: "AG27Z",
  title: "Backend Activation Deferral Register",
  status: "backend_activation_deferred_after_ag27_closure",
  deferral_decision: {
    backend_activation_approved: false,
    supabase_project_creation_approved: false,
    supabase_connection_approved: false,
    database_creation_approved: false,
    rls_policy_application_approved: false,
    auth_activation_approved: false,
    admin_editor_login_creation_approved: false,
    secrets_or_env_setup_approved: false,
    runtime_route_creation_approved: false,
    deployment_approved: false,
    public_mutation_approved: false
  },
  future_activation_requirements: [
    "Explicit user approval.",
    "Secret-placement review.",
    "RLS policy review.",
    "Test Admin and Editor account plan.",
    "Rollback and audit trail readiness.",
    "No frontend service-role exposure.",
    "Dry-run on non-public data before any dynamic publish action."
  ],
  blocked_state: blockedState
};

const ag28Handoff = {
  module_id: "AG27Z",
  title: "AG28 Non-Active Backend Architecture Handoff Plan",
  status: "ag28_non_active_architecture_handoff_created",
  ag28_allowed_scope: [
    "Create backend/Auth architecture blueprint.",
    "Map AG27C table plan into architecture modules.",
    "Map AG27D access boundaries and activation guards into architecture governance.",
    "Plan non-active API route taxonomy.",
    "Plan non-active queue and audit service boundaries.",
    "Plan non-active environment/secret placement doctrine."
  ],
  ag28_blocked_scope: [
    "No Supabase project creation.",
    "No Supabase connection.",
    "No SQL/migration generation.",
    "No database creation.",
    "No RLS policy application.",
    "No Auth activation.",
    "No Admin/Editor login creation.",
    "No secrets or env var writing.",
    "No runtime route creation.",
    "No deployment.",
    "No public mutation."
  ],
  ag28_ready: true,
  ag28_activation_allowed: false,
  blocked_state: blockedState
};

const futureConsumptionPlan = {
  module_id: "AG27Z",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag28_and_later",
  future_consumption: {
    AG28:
      "AG28 should consume AG27Z closure and create a non-active Backend/Auth Architecture Blueprint. It may plan architecture only and must not activate Supabase/Auth/backend.",
    AG29_to_AG34:
      "Future schema, queue, audit, Admin/Editor login and security stages must consume AG27C/AG27D planning records and AG27Z activation deferral.",
    AG35_and_later:
      "Any real Supabase/Auth/backend activation requires explicit approval and must satisfy AG27D activation guards.",
    static_path:
      "Static/GitHub-controlled publishing path remains safe and may continue independently until real backend activation is approved."
  },
  blocked_state: blockedState
};

const closure = {
  module_id: "AG27Z",
  title: "Backend Decision Closure",
  status: "backend_decision_closed_non_active_architecture_ready_for_ag28",
  purpose:
    "Close the detailed AG27A-AG27D backend decision chain as non-active backend planning approved, while keeping Supabase/Auth/backend activation, database creation, RLS application, secrets, deployment and public mutation blocked.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  consumed_source_summary: {
    ag27a_status: records.ag27AAssessment.status,
    ag27b_status: records.ag27BAudit.status,
    ag27c_status: records.ag27CPlan.status,
    ag27d_status: records.ag27DPlan.status,
    ag26z_status: records.ag26ZClosure.status,
    original_ag27_checkpoint_status: records.ag27Checkpoint.status,
    original_ag27_backend_deferred: records.ag27Checkpoint.checkpoint_decision?.backend_deferred === true
  },
  closure_decision: {
    ag27_detailed_chain_closed: true,
    backend_need_confirmed: true,
    non_active_supabase_auth_backend_planning_approved: true,
    backend_architecture_planning_ready_for_ag28: true,
    ag28_allowed_for_non_active_architecture_only: true,
    backend_activation_approved: false,
    supabase_activation_approved: false,
    auth_activation_approved: false,
    database_creation_approved: false,
    rls_policy_application_approved: false,
    secrets_or_env_setup_approved: false,
    deployment_approved: false,
    public_mutation_approved: false
  },
  closure_summary: {
    detailed_stages_closed: 4,
    planned_tables: records.ag27CTablePlan.table_count,
    planned_access_boundaries: records.ag27DAccessBoundaryMatrix.boundary_count,
    planned_rls_scenarios: records.ag27DRlsScenarioModel.scenario_count,
    activation_guards: records.ag27DActivationGuardRegister.guard_count,
    admin_final_clearance_preserved: true,
    editor_assigned_only_preserved: true,
    real_backend_activation_done: false,
    real_database_created: false,
    real_auth_enabled: false,
    real_secrets_created: false,
    real_deployment_done: false,
    real_public_mutation_done: false
  },
  source_chain_file: outputs.sourceChain,
  planning_closure_file: outputs.planningClosure,
  activation_deferral_file: outputs.activationDeferral,
  ag28_handoff_file: outputs.ag28Handoff,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG27Z",
  title: "Backend Decision Closure Blocker Register",
  status: "backend_decision_closed_runtime_operations_blocked",
  blocked_items: [
    "No Supabase project creation.",
    "No Supabase connection.",
    "No SQL generation.",
    "No migration generation.",
    "No database table creation.",
    "No RLS policy application.",
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
    "No public mutation."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG27Z",
  title: "AG28 Backend Architecture Readiness Record",
  status: "ready_for_ag28_non_active_backend_architecture_blueprint",
  ready_for_ag28: true,
  next_stage_id: "AG28",
  next_stage_title: "Backend/Auth Architecture Blueprint",
  allowed_ag28_mode: "non_active_architecture_blueprint_only",
  real_execution_allowed_now: false,
  backend_activation_allowed_now: false,
  supabase_auth_backend_activation_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG27Z",
  title: "AG27Z to AG28 Backend Architecture Boundary",
  status: "ag28_boundary_created_non_active_architecture_only",
  next_stage_id: "AG28",
  next_stage_title: "Backend/Auth Architecture Blueprint",
  allowed_scope: ag28Handoff.ag28_allowed_scope,
  blocked_scope: ag28Handoff.ag28_blocked_scope,
  backend_planning_selected: true,
  backend_activation_deferred: true,
  supabase_auth_backend_deferred: true,
  explicit_approval_required_before_real_activation: true
};

const review = {
  module_id: "AG27Z",
  title: "Backend Decision Closure",
  status: "backend_decision_closed_non_active_architecture_ready_for_ag28",
  depends_on: ["AG27A", "AG27B", "AG27C", "AG27D", "AG26Z", "AG27", "AG25Z", "AG24Z"],
  generated_from: inputs,
  closure_file: outputs.closure,
  source_chain_file: outputs.sourceChain,
  planning_closure_file: outputs.planningClosure,
  activation_deferral_file: outputs.activationDeferral,
  ag28_handoff_file: outputs.ag28Handoff,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    backend_decision_closure_created: true,
    ag27_detailed_chain_closed: true,
    detailed_stages_closed: 4,
    non_active_backend_planning_approved: true,
    ready_for_ag28_non_active_architecture: true,
    backend_activation_allowed_now: false,
    supabase_activation_allowed_now: false,
    auth_activation_allowed_now: false,
    sql_generation_allowed_now: false,
    migration_generation_allowed_now: false,
    database_creation_allowed_now: false,
    rls_policy_application_allowed_now: false,
    secret_creation_allowed_now: false,
    env_var_write_allowed_now: false,
    server_route_creation_allowed_now: false,
    deployment_done: false,
    public_mutation_done: false,
    backend_activation_done: false,
    real_execution_done: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG27Z",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG27Z",
  preview_only: true,
  status: review.status,
  message: "AG27Z Backend Decision Closure created. AG28 may proceed as non-active backend architecture blueprint only.",
  ag27_detailed_chain_closed: 1,
  non_active_backend_planning_approved: 1,
  ready_for_ag28_non_active_architecture: 1,
  backend_activation_allowed: 0,
  supabase_activation_allowed: 0,
  auth_activation_allowed: 0,
  sql_generated: 0,
  migrations_generated: 0,
  database_objects_created: 0,
  rls_policies_applied: 0,
  secrets_created: 0,
  env_vars_written: 0,
  deployment_done: 0,
  public_items: 0,
  backend_objects: 0,
  blocked_state: blockedState
};

const doc = `# AG27Z — Backend Decision Closure

## Purpose

AG27Z closes the detailed AG27 backend decision chain.

## Closed Chain

- AG27A — Backend Need Assessment.
- AG27B — Backend Decision Audit.
- AG27C — Supabase/Auth Security and RLS Plan.
- AG27D — Conditional Security/RLS Detail Plan.

## Closure Decision

Drishvara is ready to proceed to AG28 for a **non-active Backend/Auth Architecture Blueprint**.

This is planning only.

## Still Blocked

- Supabase project creation.
- Supabase connection.
- SQL or migration generation.
- Database table creation.
- RLS policy application.
- Auth activation.
- Admin/Editor login creation.
- Secrets or environment variables.
- Server/API route creation.
- Deployment.
- Publishing.
- Public mutation.

## Governance Preserved

Admin assigns work to Editor. Editor works only on Admin-assigned items. Editor sends work back to Admin. Admin remains final clearance authority.

## Next Stage

AG28 — Backend/Auth Architecture Blueprint — non-active planning only.
`;

writeJson(outputs.review, review);
writeJson(outputs.closure, closure);
writeJson(outputs.sourceChain, sourceChain);
writeJson(outputs.planningClosure, planningClosure);
writeJson(outputs.activationDeferral, activationDeferral);
writeJson(outputs.ag28Handoff, ag28Handoff);
writeJson(outputs.futureConsumptionPlan, futureConsumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG27Z Backend Decision Closure generated.");
console.log("✅ AG27A-AG27D detailed source chain closed.");
console.log("✅ Non-active Supabase/Auth/backend planning is approved for AG28 architecture blueprint.");
console.log("✅ Real backend/Auth/Supabase activation, SQL, database, secrets, deployment and public mutation remain blocked.");
console.log("✅ AG28 Backend/Auth Architecture Blueprint boundary created.");
