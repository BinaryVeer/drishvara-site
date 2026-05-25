import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag26Review: "data/content-intelligence/quality-reviews/ag26-admin-editor-manual-workflow-strengthening.json",
  ag26Plan: "data/content-intelligence/admin-editor/ag26-admin-editor-manual-workflow-strengthening-plan.json",
  ag26RolePermission: "data/content-intelligence/admin-editor/ag26-admin-editor-role-permission-planning-model.json",
  ag26ManualQueue: "data/content-intelligence/admin-editor/ag26-manual-review-queue-workflow-model.json",
  ag26ApprovalGate: "data/content-intelligence/admin-editor/ag26-editorial-approval-gate-model.json",
  ag26ConsumptionPlan: "data/content-intelligence/admin-editor/ag26-future-consumption-plan.json",
  ag26Readiness: "data/content-intelligence/quality-registry/ag26-supabase-auth-backend-decision-checkpoint-readiness-record.json",
  ag26Boundary: "data/content-intelligence/mutation-plans/ag26-to-ag27-supabase-auth-backend-decision-checkpoint-boundary.json",
  ag25Plan: "data/content-intelligence/featured-reads/ag25-featured-reads-production-strengthening-plan.json",
  ag25SourceGate: "data/content-intelligence/featured-reads/ag25-featured-reads-source-reference-gate-model.json",
  ag24zClosure: "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json",
  ag24zNonActivation: "data/content-intelligence/episodes/ag24z-non-activation-closure-register.json",
  ag24zSourceChain: "data/content-intelligence/episodes/ag24z-ag24-source-chain-register.json",
  supabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag27-supabase-auth-backend-decision-checkpoint.json",
  checkpoint: "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",
  decisionMatrix: "data/content-intelligence/backend-decision/ag27-backend-decision-matrix.json",
  prerequisiteRegister: "data/content-intelligence/backend-decision/ag27-backend-activation-prerequisite-register.json",
  deferralRecord: "data/content-intelligence/backend-decision/ag27-backend-deferral-record.json",
  consumptionPlan: "data/content-intelligence/backend-decision/ag27-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag27-supabase-auth-backend-decision-checkpoint-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag27-conditional-backend-path-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag27-to-ag28-conditional-backend-path-boundary.json",
  registry: "data/quality/ag27-supabase-auth-backend-decision-checkpoint.json",
  preview: "data/quality/ag27-supabase-auth-backend-decision-checkpoint-preview.json",
  doc: "docs/quality/AG27_SUPABASE_AUTH_BACKEND_DECISION_CHECKPOINT.md"
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
  if (!exists(p)) throw new Error(`Missing AG27 input: ${p}`);
}

const records = Object.fromEntries(
  Object.entries(inputs).map(([key, file]) => [key, readJson(file)])
);

if (records.ag26Review.status !== "admin_editor_manual_workflow_strengthening_created_ready_for_ag27") throw new Error("AG26 review status mismatch.");
if (records.ag26Plan.status !== "admin_editor_manual_workflow_strengthening_created_ready_for_ag27") throw new Error("AG26 plan status mismatch.");
if (records.ag26Readiness.ready_for_ag27 !== true) throw new Error("AG26 readiness does not permit AG27.");
if (records.ag26Boundary.next_stage_id !== "AG27") throw new Error("AG26 boundary does not point to AG27.");
if (records.ag26Plan.auth_activation_allowed_in_ag26 !== false) throw new Error("AG26 must not have activated Auth.");
if (records.ag26Plan.backend_activation_allowed_in_ag26 !== false) throw new Error("AG26 must not have activated backend.");
if (records.ag26Plan.supabase_auth_backend_deferred !== true) throw new Error("AG26 must defer Supabase/Auth/backend.");
if (records.ag25Plan.status !== "featured_reads_production_strengthening_created_ready_for_ag26") throw new Error("AG25 plan status mismatch.");
if (records.ag24zClosure.status !== "episodic_knowledge_engine_closed_ready_for_ag25") throw new Error("AG24Z closure status mismatch.");
if (records.ag24zNonActivation.closure_guards.no_supabase !== true) throw new Error("AG24Z must keep Supabase blocked.");
if (records.ag24zNonActivation.closure_guards.no_auth !== true) throw new Error("AG24Z must keep Auth blocked.");
if (records.ag24zNonActivation.closure_guards.no_backend_activation !== true) throw new Error("AG24Z must keep backend blocked.");
if (records.ag24zSourceChain.chain_length !== 9) throw new Error("AG24 source chain must contain 9 stages.");

const blockedState = {
  backend_decision_checkpoint_created: true,
  backend_activation_approved: false,
  supabase_enabled: false,
  auth_enabled: false,
  backend_enabled: false,
  database_schema_created: false,
  database_migration_created: false,
  env_secret_created: false,
  user_accounts_created: false,
  admin_login_created: false,
  editor_login_created: false,
  runtime_api_created: false,
  runtime_write_enabled: false,
  dynamic_publishing_enabled: false,
  public_index_mutated: false,
  homepage_mutated: false,
  github_write_performed: false,
  deployment_triggered: false,
  published: false
};

const decisionMatrix = {
  module_id: "AG27",
  title: "Backend Decision Matrix",
  status: "backend_decision_matrix_created_no_activation",
  current_decision: "defer_supabase_auth_backend",
  decision_basis: [
    "Hybrid staged path selected: static/GitHub-controlled go-live first.",
    "AG24Z closed the episodic engine as non-active and no-backend.",
    "AG25 and AG26 strengthened production and manual workflow planning without runtime activation.",
    "No explicit user approval has been given to activate Supabase/Auth/backend.",
    "Backend activation would introduce security, cost, operations and governance responsibilities that require a separate approval point."
  ],
  decision_options: [
    {
      option_id: "continue_static_governed_path",
      label: "Continue static/GitHub-controlled path",
      selected_now: true,
      requires_user_approval: false,
      risk_level: "low",
      note: "Preserves current non-mutating/non-backend governance."
    },
    {
      option_id: "prepare_backend_design_only",
      label: "Prepare backend design only",
      selected_now: false,
      requires_user_approval: true,
      risk_level: "medium",
      note: "Would still avoid activation but may begin schema planning if approved."
    },
    {
      option_id: "activate_supabase_auth_backend",
      label: "Activate Supabase/Auth/backend",
      selected_now: false,
      requires_user_approval: true,
      risk_level: "high",
      note: "Blocked unless explicit approval is given after AG27."
    }
  ],
  blocked_state: blockedState
};

const prerequisiteRegister = {
  module_id: "AG27",
  title: "Backend Activation Prerequisite Register",
  status: "backend_activation_prerequisites_registered_not_satisfied",
  activation_allowed_now: false,
  explicit_user_approval_required: true,
  prerequisites: [
    {
      prerequisite_id: "approval",
      label: "Explicit approval to activate backend",
      satisfied: false
    },
    {
      prerequisite_id: "data_model",
      label: "Final backend data model reviewed",
      satisfied: false
    },
    {
      prerequisite_id: "security",
      label: "Auth/security/access-control rules reviewed",
      satisfied: false
    },
    {
      prerequisite_id: "cost",
      label: "Cost and usage exposure reviewed",
      satisfied: false
    },
    {
      prerequisite_id: "secrets",
      label: "Secrets/environment variable handling approved",
      satisfied: false
    },
    {
      prerequisite_id: "rollback",
      label: "Rollback and disablement plan prepared",
      satisfied: false
    },
    {
      prerequisite_id: "manual_governance",
      label: "Admin/Editor manual governance translated into backend rules",
      satisfied: false
    }
  ],
  blocked_state: blockedState
};

const deferralRecord = {
  module_id: "AG27",
  title: "Backend Deferral Record",
  status: "supabase_auth_backend_deferred_after_decision_checkpoint",
  deferral_decision: {
    supabase_deferred: true,
    auth_deferred: true,
    backend_deferred: true,
    dynamic_publishing_deferred: true,
    ag28_activation_not_approved: true
  },
  deferral_reason:
    "No explicit approval has been given to activate Supabase/Auth/backend. The current governed path remains static/GitHub-controlled and non-runtime.",
  carry_forward_warning:
    "Before any AG28/backend stage, request explicit approval and confirm security, cost, database, Auth and rollback decisions.",
  blocked_state: blockedState
};

const consumptionPlan = {
  module_id: "AG27",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_conditional_backend_or_static_path",
  future_consumption: {
    conditional_AG28_to_AG40:
      "AG28–AG40 backend/Auth/dynamic publishing stages must remain blocked unless explicit approval is given after AG27.",
    static_continuation:
      "If backend remains deferred, future stages should continue consuming AG24–AG27 governance records under the static/GitHub-controlled path.",
    AG41_to_AG50:
      "Post-dynamic stabilisation and later product layers should consume this decision record and must not assume backend activation."
  },
  blocked_state: blockedState
};

const checkpoint = {
  module_id: "AG27",
  title: "Supabase/Auth/Backend Decision Checkpoint",
  status: "supabase_auth_backend_decision_checkpoint_created_backend_deferred",
  purpose:
    "Record the formal backend decision checkpoint after AG26, preserving the hybrid staged path and confirming that Supabase/Auth/backend remains deferred unless explicitly approved later.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  consumed_source_summary: {
    ag26_status: records.ag26Plan.status,
    ag26_ready_for_ag27: records.ag26Readiness.ready_for_ag27 === true,
    ag25_status: records.ag25Plan.status,
    ag24z_status: records.ag24zClosure.status,
    ag24_source_chain_length: records.ag24zSourceChain.chain_length,
    supabase_reminder_consumed: true
  },
  checkpoint_decision: {
    current_path: "static_github_controlled_path",
    backend_activation_approved: false,
    supabase_deferred: true,
    auth_deferred: true,
    backend_deferred: true,
    dynamic_publishing_deferred: true,
    ag28_to_ag40_allowed_now: false,
    explicit_approval_required_before_ag28: true
  },
  decision_matrix_file: outputs.decisionMatrix,
  prerequisite_register_file: outputs.prerequisiteRegister,
  deferral_record_file: outputs.deferralRecord,
  future_consumption_plan_file: outputs.consumptionPlan,
  supabase_reminder: records.supabaseReminder.reminder || "Supabase/Auth/backend remains deferred and must not be activated without explicit approval.",
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG27",
  title: "Supabase/Auth/Backend Decision Checkpoint Blocker Register",
  status: "backend_activation_blocked_pending_explicit_approval",
  blocked_items: [
    "No Supabase activation.",
    "No Auth activation.",
    "No backend activation.",
    "No database schema creation.",
    "No database migration creation.",
    "No environment secret creation.",
    "No user account creation.",
    "No Admin login creation.",
    "No Editor login creation.",
    "No runtime API creation.",
    "No runtime write activation.",
    "No dynamic publishing activation.",
    "No public index mutation.",
    "No homepage mutation.",
    "No GitHub write automation.",
    "No deployment trigger.",
    "No publishing."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG27",
  title: "Conditional Backend Path Readiness Record",
  status: "conditional_backend_path_not_approved",
  ready_for_ag28_backend_activation: false,
  explicit_approval_required_for_ag28: true,
  next_stage_id: "AG28",
  next_stage_title: "Conditional backend/Auth/dynamic publishing path only if explicitly approved",
  checkpoint_created: true,
  decision_matrix_created: true,
  prerequisites_registered: true,
  deferral_record_created: true,
  real_execution_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG27",
  title: "AG27 to AG28 Conditional Backend Path Boundary",
  status: "ag28_backend_path_blocked_pending_explicit_approval",
  next_stage_id: "AG28",
  next_stage_title: "Conditional backend/Auth/dynamic publishing path",
  allowed_scope_without_approval: [
    "Review AG27 decision record.",
    "Discuss whether backend remains deferred.",
    "Prepare no code and no activation."
  ],
  allowed_scope_only_if_explicitly_approved: [
    "Begin backend design planning.",
    "Prepare Supabase/Auth/backend schema planning.",
    "Define security and rollback controls before runtime activation."
  ],
  blocked_scope: blocker.blocked_items,
  supabase_auth_backend_deferred: true,
  explicit_approval_required: true
};

const review = {
  module_id: "AG27",
  title: "Supabase/Auth/Backend Decision Checkpoint",
  status: "supabase_auth_backend_decision_checkpoint_created_backend_deferred",
  depends_on: ["AG26", "AG25", "AG24Z", "AG24I", "AG24H", "AG24F"],
  generated_from: inputs,
  checkpoint_file: outputs.checkpoint,
  decision_matrix_file: outputs.decisionMatrix,
  prerequisite_register_file: outputs.prerequisiteRegister,
  deferral_record_file: outputs.deferralRecord,
  future_consumption_plan_file: outputs.consumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    decision_checkpoint_created: true,
    backend_activation_approved: false,
    supabase_deferred: true,
    auth_deferred: true,
    backend_deferred: true,
    ag28_to_ag40_allowed_now: false,
    explicit_approval_required_before_ag28: true,
    ready_for_ag28_backend_activation: false,
    real_execution_done: false,
    deployment_done: false,
    publishing_done: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG27",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG27",
  preview_only: true,
  status: review.status,
  message: "AG27 Supabase/Auth/Backend Decision Checkpoint created. Backend remains deferred. AG28 is blocked unless explicitly approved.",
  backend_activation_approved: 0,
  supabase_enabled: 0,
  auth_enabled: 0,
  backend_enabled: 0,
  dynamic_publishing_enabled: 0,
  database_objects_created: 0,
  user_accounts_created: 0,
  public_items: 0,
  blocked_state: blockedState
};

const doc = `# AG27 — Supabase/Auth/Backend Decision Checkpoint

## Purpose

AG27 records the formal decision checkpoint for Supabase/Auth/backend after AG26.

## Decision

Current decision: **Supabase/Auth/backend remains deferred.**

AG27 does not activate backend systems. AG28–AG40 backend/Auth/dynamic publishing stages remain blocked unless explicit approval is given after this checkpoint.

## Consumed Source-of-Truth

- AG26 Admin/Editor Manual Workflow Strengthening.
- AG25 Featured Reads Production Strengthening.
- AG24Z Episodic Knowledge Engine Closure.
- AG24Z Non-Activation Closure Register.
- AG24 source-chain records.
- Supabase/Auth/backend defer reminder.

## Blocked State

No Supabase activation, Auth activation, backend activation, database schema, migrations, secrets, user accounts, runtime APIs, runtime writes, dynamic publishing, public mutation, deployment or publishing is performed.

## Next Boundary

AG28 is conditional only. Do not proceed to backend activation unless explicitly approved.
`;

writeJson(outputs.review, review);
writeJson(outputs.checkpoint, checkpoint);
writeJson(outputs.decisionMatrix, decisionMatrix);
writeJson(outputs.prerequisiteRegister, prerequisiteRegister);
writeJson(outputs.deferralRecord, deferralRecord);
writeJson(outputs.consumptionPlan, consumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG27 Supabase/Auth/Backend Decision Checkpoint generated.");
console.log("✅ Decision matrix, prerequisite register and deferral record created.");
console.log("✅ Backend remains deferred. No Supabase/Auth/backend activation performed.");
console.log("✅ AG28 conditional boundary created and blocked pending explicit approval.");
