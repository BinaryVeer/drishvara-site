import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag37zClosure: "data/content-intelligence/backend-architecture/ag37z-dynamic-publish-dry-run-closure.json",
  ag37zReadiness: "data/content-intelligence/quality-registry/ag37z-controlled-apply-decision-readiness-record.json",
  ag37zBoundary: "data/content-intelligence/mutation-plans/ag37z-to-ag38a-controlled-apply-decision-boundary.json",
  ag37zCarryForward: "data/content-intelligence/backend-architecture/ag37z-post-dry-run-blocker-carry-forward.json",
  ag37zFuturePlan: "data/content-intelligence/backend-architecture/ag37z-future-consumption-plan.json",

  ag36zClosure: "data/content-intelligence/backend-architecture/ag36z-login-live-test-closure.json",
  ag35zClosure: "data/content-intelligence/backend-architecture/ag35z-backend-auth-activation-closure.json",
  ag35bConfirm: "data/content-intelligence/backend-architecture/ag35b-manual-schema-apply-confirmation.json",
  ag35cConfirm: "data/content-intelligence/backend-architecture/ag35c-manual-auth-role-confirmation.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag38a-controlled-apply-decision-checkpoint.json",
  checkpoint: "data/content-intelligence/backend-architecture/ag38a-controlled-apply-decision-checkpoint.json",
  explicitGrantReadiness: "data/content-intelligence/backend-architecture/ag38a-supabase-explicit-grant-readiness-record.json",
  controlledApplyRiskReview: "data/content-intelligence/backend-architecture/ag38a-controlled-apply-risk-review-record.json",
  operatorApprovalGate: "data/content-intelligence/backend-architecture/ag38a-operator-approval-gate-record.json",
  blocker: "data/content-intelligence/quality-registry/ag38a-controlled-apply-decision-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag38a-controlled-apply-package-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag38a-to-ag38b-controlled-apply-package-boundary.json",
  registry: "data/quality/ag38a-controlled-apply-decision-checkpoint.json",
  preview: "data/quality/ag38a-controlled-apply-decision-checkpoint-preview.json",
  doc: "docs/quality/AG38A_CONTROLLED_APPLY_DECISION_CHECKPOINT.md"
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
  if (!exists(p)) throw new Error(`Missing AG38A input: ${p}`);
}

const records = Object.fromEntries(Object.entries(inputs).map(([k, f]) => [k, readJson(f)]));

if (records.ag37zClosure.status !== "dynamic_publish_dry_run_closure_created_ready_for_ag38a_decision") {
  throw new Error("AG37Z closure status mismatch.");
}
if (records.ag37zReadiness.ready_for_ag38a !== true) {
  throw new Error("AG37Z readiness does not permit AG38A.");
}
if (records.ag37zReadiness.allowed_ag38a_mode !== "decision_checkpoint_only_no_real_publish_without_explicit_operator_approval") {
  throw new Error("AG38A allowed mode mismatch.");
}
if (records.ag37zBoundary.next_stage_id !== "AG38A") {
  throw new Error("AG37Z boundary does not point to AG38A.");
}
if (records.ag36zClosure.status !== "login_live_test_closure_created_ready_for_ag37a") {
  throw new Error("AG36Z closure status mismatch.");
}
if (records.ag35zClosure.status !== "backend_auth_activation_closure_created_ready_for_ag36a") {
  throw new Error("AG35Z closure status mismatch.");
}

const blockedState = {
  controlled_apply_decision_checkpoint_created: true,
  supabase_explicit_grant_review_added: true,
  operator_approval_gate_created: true,
  controlled_apply_package_ready_to_plan: true,

  real_publish_executed: false,
  actual_queue_state_changed: false,
  audit_log_write_done: false,
  rollback_write_done: false,
  database_write_done: false,
  public_article_mutated: false,
  deployment_triggered: false,
  public_mutation_done: false,
  dynamic_publish_runtime_enabled: false,
  service_role_key_recorded: false,
  service_role_key_exposed: false,
  anon_access_granted: false,
  write_grants_prepared: false,
  sql_grants_executed: false
};

const explicitGrantReadiness = {
  module_id: "AG38A",
  title: "Supabase Explicit Grant Readiness Record",
  status: "explicit_grant_review_added_no_sql_executed",
  reason:
    "Supabase has announced that new public tables will require explicit GRANTs for Data API access. Existing projects continue current behaviour for now, but Drishvara should become future-proof before controlled apply/public runtime work.",
  decision_scope: "readiness_review_only",
  current_treatment: {
    no_sql_grant_executed_in_ag38a: true,
    no_schema_migration_created_in_ag38a: true,
    no_supabase_cli_or_sql_editor_action_required_in_ag38a: true,
    no_anon_grant_to_admin_editor_tables: true,
    no_write_grant_until_controlled_apply_is_explicitly_approved: true,
    rls_remains_primary_access_control_layer: true
  },
  proposed_future_grant_direction: {
    schema_usage_for_authenticated: "grant usage on schema public to authenticated",
    select_grants_for_authenticated_only: [
      "public.profiles",
      "public.articles",
      "public.article_assignments",
      "public.article_audit_logs",
      "public.publish_rollback_refs"
    ],
    anon_grants_for_admin_editor_workflow: [],
    write_grants_for_ag38a: [],
    write_grants_require_later_explicit_approval: true
  },
  blocker_notes: [
    "Do not grant Admin/Editor workflow tables to anon.",
    "Do not prepare insert/update/delete grants in AG38A.",
    "Do not run SQL in AG38A.",
    "Do not use service-role key in repo/chat.",
    "Keep RLS policies as the real access-control boundary."
  ],
  blocked_state: blockedState
};

const controlledApplyRiskReview = {
  module_id: "AG38A",
  title: "Controlled Apply Risk Review Record",
  status: "controlled_apply_risk_review_created_no_apply_authorized",
  reviewed_risks: [
    {
      risk_id: "unintended_public_publication",
      severity: "high",
      mitigation_required_before_apply: "Use test/non-public article only and verify public surface after dry-run."
    },
    {
      risk_id: "incorrect_queue_state_transition",
      severity: "medium",
      mitigation_required_before_apply: "Use AG37B before/after queue-state model and rollback reference."
    },
    {
      risk_id: "missing_audit_or_rollback",
      severity: "high",
      mitigation_required_before_apply: "Prepare audit-log and rollback write path before any real apply."
    },
    {
      risk_id: "insufficient_data_api_grants",
      severity: "medium",
      mitigation_required_before_apply: "Prepare explicit authenticated-only GRANT package after review."
    },
    {
      risk_id: "excessive_anon_exposure",
      severity: "high",
      mitigation_required_before_apply: "No anon grants for Admin/Editor workflow tables."
    }
  ],
  risk_review_passed_for_decision_checkpoint: true,
  real_apply_authorized: false,
  blocked_state: blockedState
};

const operatorApprovalGate = {
  module_id: "AG38A",
  title: "Operator Approval Gate Record",
  status: "explicit_operator_approval_required_before_any_real_apply",
  approval_state: {
    explicit_operator_approval_recorded_in_ag38a: false,
    real_apply_allowed_now: false,
    public_mutation_allowed_now: false,
    database_write_allowed_now: false,
    audit_log_write_allowed_now: false,
    rollback_write_allowed_now: false,
    deployment_allowed_now: false,
    service_role_key_allowed_in_repo_or_chat: false
  },
  required_before_ag38b_or_later_real_apply: [
    "Identify exact test/non-public article.",
    "Prepare controlled apply package.",
    "Prepare explicit authenticated-only GRANT package where required.",
    "Prepare rollback path.",
    "Prepare audit-log write path.",
    "Confirm no anon exposure.",
    "Receive explicit operator approval."
  ],
  blocked_state: blockedState
};

const checkpoint = {
  module_id: "AG38A",
  title: "Controlled Apply Decision Checkpoint",
  status: "controlled_apply_decision_checkpoint_created_ready_for_ag38b_package_planning",
  purpose:
    "Create a decision checkpoint after AG37 dry-run closure to assess readiness for a future controlled apply package, while preserving all blockers against real publish, database writes, public mutation and deployment.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  decision: {
    ag38a_is_decision_checkpoint_only: true,
    controlled_apply_package_may_be_planned_next: true,
    supabase_explicit_grant_review_added: true,
    explicit_operator_approval_required_before_real_apply: true,

    real_apply_approved_now: false,
    real_publish_executed: false,
    actual_queue_state_changed: false,
    audit_log_write_done: false,
    rollback_write_done: false,
    database_write_done: false,
    public_article_mutated: false,
    deployment_done: false,
    public_mutation_done: false,
    dynamic_publish_runtime_enabled: false,
    service_role_key_recorded: false,
    service_role_key_exposed: false,
    anon_access_granted: false,
    write_grants_prepared: false,
    sql_grants_executed: false
  },
  explicit_grant_readiness_file: outputs.explicitGrantReadiness,
  controlled_apply_risk_review_file: outputs.controlledApplyRiskReview,
  operator_approval_gate_file: outputs.operatorApprovalGate,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG38A",
  title: "Controlled Apply Decision Blocker Register",
  status: "controlled_apply_decision_blockers_preserved",
  blocked_items: [
    "No real publish.",
    "No queue-state write.",
    "No audit-log write.",
    "No rollback write.",
    "No database write.",
    "No public article mutation.",
    "No deployment.",
    "No public mutation.",
    "No dynamic publish runtime enablement.",
    "No service-role key exposure.",
    "No anon grant for Admin/Editor workflow tables.",
    "No write grants prepared or executed in AG38A.",
    "No SQL grants executed in AG38A."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG38A",
  title: "Controlled Apply Package Readiness Record",
  status: "ready_for_ag38b_controlled_apply_package_planning",
  ready_for_ag38b: true,
  next_stage_id: "AG38B",
  next_stage_title: "Controlled Apply Package Planning",
  allowed_ag38b_mode: "package_planning_only_no_real_apply_without_explicit_operator_approval",
  supabase_explicit_grant_review_required_in_ag38b: true,
  explicit_operator_approval_required_for_any_real_apply: true,
  deployment_allowed_next: false,
  public_mutation_allowed_next: false,
  real_publish_allowed_next: false,
  database_write_allowed_next: false,
  audit_log_write_allowed_next: false,
  rollback_write_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  anon_grants_allowed_next: false,
  write_grants_allowed_next_without_approval: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG38A",
  title: "AG38A to AG38B Controlled Apply Package Boundary",
  status: "ag38b_controlled_apply_package_boundary_created",
  next_stage_id: "AG38B",
  next_stage_title: "Controlled Apply Package Planning",
  allowed_scope: [
    "Consume AG38A decision checkpoint.",
    "Plan controlled apply package only.",
    "Include explicit Supabase GRANT review.",
    "Plan authenticated-only read grants where required.",
    "Keep anon grants blocked for Admin/Editor workflow tables.",
    "Keep real publish, database write, public mutation and deployment blocked unless separately approved."
  ],
  blocked_scope: blocker.blocked_items,
  blocked_state: blockedState
};

const review = {
  module_id: "AG38A",
  title: "Controlled Apply Decision Checkpoint",
  status: "controlled_apply_decision_checkpoint_created_ready_for_ag38b_package_planning",
  depends_on: ["AG37Z", "AG36Z", "AG35Z"],
  generated_from: inputs,
  checkpoint_file: outputs.checkpoint,
  explicit_grant_readiness_file: outputs.explicitGrantReadiness,
  controlled_apply_risk_review_file: outputs.controlledApplyRiskReview,
  operator_approval_gate_file: outputs.operatorApprovalGate,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    controlled_apply_decision_checkpoint_created: true,
    supabase_explicit_grant_review_added: true,
    ready_for_ag38b_package_planning: true,
    explicit_operator_approval_required: true,

    real_apply_approved_now: false,
    real_publish_executed: false,
    actual_queue_state_changed: false,
    audit_log_write_done: false,
    rollback_write_done: false,
    database_write_done: false,
    public_article_mutated: false,
    deployment_done: false,
    public_mutation_done: false,
    dynamic_publish_runtime_enabled: false,
    service_role_key_exposed: false,
    anon_access_granted: false,
    sql_grants_executed: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG38A",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG38A",
  preview_only: false,
  status: review.status,
  message: "AG38A Controlled Apply Decision Checkpoint created. Ready for AG38B package planning only.",
  controlled_apply_decision_checkpoint_created: 1,
  supabase_explicit_grant_review_added: 1,
  ready_for_ag38b_package_planning: 1,
  explicit_operator_approval_required: 1,
  real_apply_approved_now: 0,
  real_publish_executed: 0,
  database_write_done: 0,
  public_article_mutated: 0,
  deployment_done: 0,
  public_mutation_done: 0,
  dynamic_publish_runtime_enabled: 0,
  service_role_key_exposed: 0,
  anon_access_granted: 0,
  sql_grants_executed: 0
};

const doc = `# AG38A — Controlled Apply Decision Checkpoint

## Result

AG38A Controlled Apply Decision Checkpoint is created.

## Important Decision

AG38A is a checkpoint only. It does not approve or perform real publish, queue-state write, audit-log write, rollback write, database write, public mutation or deployment.

## Supabase Explicit GRANT Readiness

The Supabase Data API explicit-GRANT change has been added to the governed readiness track.

Future controlled apply planning must review:

- authenticated-only access requirements;
- no anon grants for Admin/Editor workflow tables;
- no write grants unless explicitly approved;
- RLS remains the primary access-control boundary.

## Still Blocked

- No real publish.
- No queue-state write.
- No audit-log write.
- No rollback write.
- No database write.
- No public article mutation.
- No deployment.
- No public mutation.
- No dynamic publish runtime.
- No service-role key exposure.
- No anon grants for Admin/Editor workflow tables.
- No SQL grants executed.

## Next

AG38B — Controlled Apply Package Planning.

AG38B must remain package-planning only unless explicit operator approval is separately recorded.
`;

writeJson(outputs.explicitGrantReadiness, explicitGrantReadiness);
writeJson(outputs.controlledApplyRiskReview, controlledApplyRiskReview);
writeJson(outputs.operatorApprovalGate, operatorApprovalGate);
writeJson(outputs.checkpoint, checkpoint);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG38A Controlled Apply Decision Checkpoint generated.");
console.log("✅ Supabase explicit GRANT readiness review added.");
console.log("✅ Ready for AG38B package planning only.");
console.log("✅ No real publish, database write, public mutation, deployment, SQL grant execution or service-role key recorded.");
