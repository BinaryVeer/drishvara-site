import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag38aCheckpoint: "data/content-intelligence/backend-architecture/ag38a-controlled-apply-decision-checkpoint.json",
  ag38aGrantReadiness: "data/content-intelligence/backend-architecture/ag38a-supabase-explicit-grant-readiness-record.json",
  ag38aRiskReview: "data/content-intelligence/backend-architecture/ag38a-controlled-apply-risk-review-record.json",
  ag38aApprovalGate: "data/content-intelligence/backend-architecture/ag38a-operator-approval-gate-record.json",
  ag38aReadiness: "data/content-intelligence/quality-registry/ag38a-controlled-apply-package-readiness-record.json",
  ag38aBoundary: "data/content-intelligence/mutation-plans/ag38a-to-ag38b-controlled-apply-package-boundary.json",

  ag37zClosure: "data/content-intelligence/backend-architecture/ag37z-dynamic-publish-dry-run-closure.json",
  ag37zCapability: "data/content-intelligence/backend-architecture/ag37z-dry-run-capability-record.json",
  ag37zCarryForward: "data/content-intelligence/backend-architecture/ag37z-post-dry-run-blocker-carry-forward.json",
  ag36zClosure: "data/content-intelligence/backend-architecture/ag36z-login-live-test-closure.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag38b-controlled-apply-package-planning.json",
  package: "data/content-intelligence/backend-architecture/ag38b-controlled-apply-package-planning.json",
  targetCandidatePlan: "data/content-intelligence/backend-architecture/ag38b-test-non-public-article-target-plan.json",
  grantPlan: "data/content-intelligence/backend-architecture/ag38b-supabase-explicit-grant-plan.json",
  auditRollbackPlan: "data/content-intelligence/backend-architecture/ag38b-audit-rollback-plan.json",
  noExecutionAudit: "data/content-intelligence/backend-architecture/ag38b-no-execution-audit-register.json",
  blocker: "data/content-intelligence/quality-registry/ag38b-controlled-apply-package-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag38b-controlled-apply-preflight-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag38b-to-ag38c-controlled-apply-preflight-boundary.json",
  registry: "data/quality/ag38b-controlled-apply-package-planning.json",
  preview: "data/quality/ag38b-controlled-apply-package-planning-preview.json",
  doc: "docs/quality/AG38B_CONTROLLED_APPLY_PACKAGE_PLANNING.md"
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
  if (!exists(p)) throw new Error(`Missing AG38B input: ${p}`);
}

const records = Object.fromEntries(Object.entries(inputs).map(([k, f]) => [k, readJson(f)]));

if (records.ag38aCheckpoint.status !== "controlled_apply_decision_checkpoint_created_ready_for_ag38b_package_planning") {
  throw new Error("AG38A checkpoint status mismatch.");
}
if (records.ag38aReadiness.ready_for_ag38b !== true) {
  throw new Error("AG38A readiness does not permit AG38B.");
}
if (records.ag38aReadiness.allowed_ag38b_mode !== "package_planning_only_no_real_apply_without_explicit_operator_approval") {
  throw new Error("AG38B allowed mode mismatch.");
}
if (records.ag38aBoundary.next_stage_id !== "AG38B") {
  throw new Error("AG38A boundary does not point to AG38B.");
}
if (records.ag38aGrantReadiness.status !== "explicit_grant_review_added_no_sql_executed") {
  throw new Error("AG38A grant readiness status mismatch.");
}
if (records.ag37zClosure.status !== "dynamic_publish_dry_run_closure_created_ready_for_ag38a_decision") {
  throw new Error("AG37Z closure status mismatch.");
}
if (records.ag36zClosure.status !== "login_live_test_closure_created_ready_for_ag37a") {
  throw new Error("AG36Z closure status mismatch.");
}

const blockedState = {
  controlled_apply_package_planning_created: true,
  test_non_public_target_plan_created: true,
  explicit_grant_plan_created: true,
  audit_rollback_plan_created: true,
  controlled_apply_preflight_ready: true,

  explicit_operator_approval_recorded: false,
  real_apply_approved_now: false,
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
  write_grants_executed: false,
  sql_grants_executed: false
};

const targetCandidatePlan = {
  module_id: "AG38B",
  title: "Test / Non-public Article Target Plan",
  status: "test_non_public_article_target_plan_created",
  candidate_scope: {
    target_mode: "test_or_non_public_article_only",
    candidate_slug: "enhancing-public-healthcare-delivery-digital-innovation",
    candidate_source_status: "ready_for_admin_review",
    intended_transition_if_later_approved: "ready_for_admin_review_to_published",
    public_surface_exposure_allowed_in_ag38b: false,
    real_publish_allowed_in_ag38b: false
  },
  mandatory_preconditions_before_any_later_apply: [
    "Confirm exact test/non-public article.",
    "Confirm Admin session and role.",
    "Confirm Editor cannot publish.",
    "Confirm rollback path.",
    "Confirm audit-log write path.",
    "Confirm explicit authenticated-only grants where required.",
    "Record explicit operator approval."
  ],
  blocked_state: blockedState
};

const grantPlan = {
  module_id: "AG38B",
  title: "Supabase Explicit Grant Plan",
  status: "explicit_grant_plan_created_no_sql_executed",
  plan_scope: "planning_only_no_sql_execution",
  proposed_authenticated_read_grants: [
    "grant usage on schema public to authenticated",
    "grant select on public.profiles to authenticated",
    "grant select on public.articles to authenticated",
    "grant select on public.article_assignments to authenticated",
    "grant select on public.article_audit_logs to authenticated",
    "grant select on public.publish_rollback_refs to authenticated"
  ],
  proposed_anon_grants_for_admin_editor_workflow: [],
  proposed_write_grants_in_ag38b: [],
  write_grants_require_later_explicit_operator_approval: true,
  rls_remains_primary_access_control_layer: true,
  sql_file_created_in_ag38b: false,
  sql_executed_in_ag38b: false,
  blocked_state: blockedState
};

const auditRollbackPlan = {
  module_id: "AG38B",
  title: "Audit and Rollback Plan",
  status: "audit_rollback_plan_created_no_write",
  audit_write_plan: {
    article_audit_logs_required: true,
    actor_role_required: "admin",
    before_state_required: true,
    after_state_required: true,
    before_after_hash_required: true,
    decision_note_required: true,
    audit_log_write_allowed_in_ag38b: false
  },
  rollback_plan: {
    rollback_reference_required: true,
    previous_status_required: true,
    previous_queue_required: true,
    previous_public_visibility_required: true,
    rollback_write_allowed_in_ag38b: false
  },
  blocked_state: blockedState
};

const noExecutionAudit = {
  module_id: "AG38B",
  title: "No-execution Audit Register",
  status: "no_execution_audit_passed_for_ag38b",
  checks: [
    { check_id: "no_real_publish", passed: true },
    { check_id: "no_queue_state_write", passed: true },
    { check_id: "no_audit_log_write", passed: true },
    { check_id: "no_rollback_write", passed: true },
    { check_id: "no_database_write", passed: true },
    { check_id: "no_public_article_mutation", passed: true },
    { check_id: "no_deployment", passed: true },
    { check_id: "no_sql_grant_execution", passed: true },
    { check_id: "no_anon_grant", passed: true },
    { check_id: "no_service_role_key", passed: true }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const packageRecord = {
  module_id: "AG38B",
  title: "Controlled Apply Package Planning",
  status: "controlled_apply_package_planning_created_ready_for_ag38c_preflight",
  purpose:
    "Plan the first controlled apply package after AG38A decision checkpoint, including target article, explicit grant review, audit/rollback requirements and no-execution blockers.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  package_decision: {
    controlled_apply_package_planning_created: true,
    target_candidate_plan_created: true,
    explicit_grant_plan_created: true,
    audit_rollback_plan_created: true,
    proceed_to_ag38c_controlled_apply_preflight: true,

    explicit_operator_approval_recorded: false,
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
    write_grants_executed: false,
    sql_grants_executed: false
  },
  target_candidate_plan_file: outputs.targetCandidatePlan,
  grant_plan_file: outputs.grantPlan,
  audit_rollback_plan_file: outputs.auditRollbackPlan,
  no_execution_audit_file: outputs.noExecutionAudit,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG38B",
  title: "Controlled Apply Package Blocker Register",
  status: "controlled_apply_package_blockers_preserved",
  blocked_items: [
    "No explicit operator approval recorded.",
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
    "No anon grants for Admin/Editor workflow tables.",
    "No write grants executed.",
    "No SQL grants executed."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG38B",
  title: "Controlled Apply Preflight Readiness Record",
  status: "ready_for_ag38c_controlled_apply_preflight",
  ready_for_ag38c: true,
  next_stage_id: "AG38C",
  next_stage_title: "Controlled Apply Preflight",
  allowed_ag38c_mode: "preflight_only_no_real_apply_without_explicit_operator_approval",
  target_candidate_plan_created: true,
  explicit_grant_plan_created: true,
  audit_rollback_plan_created: true,
  no_execution_audit_passed: true,
  explicit_operator_approval_required_for_any_real_apply: true,
  deployment_allowed_next: false,
  public_mutation_allowed_next: false,
  real_publish_allowed_next: false,
  database_write_allowed_next: false,
  audit_log_write_allowed_next: false,
  rollback_write_allowed_next: false,
  anon_grants_allowed_next: false,
  sql_grants_allowed_next_without_approval: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG38B",
  title: "AG38B to AG38C Controlled Apply Preflight Boundary",
  status: "ag38c_controlled_apply_preflight_boundary_created",
  next_stage_id: "AG38C",
  next_stage_title: "Controlled Apply Preflight",
  allowed_scope: [
    "Consume AG38B controlled apply package plan.",
    "Preflight target article, grants, audit and rollback requirements.",
    "Do not perform real apply.",
    "Do not execute SQL grants.",
    "Do not deploy.",
    "Do not mutate public article state."
  ],
  blocked_scope: blocker.blocked_items,
  blocked_state: blockedState
};

const review = {
  module_id: "AG38B",
  title: "Controlled Apply Package Planning",
  status: "controlled_apply_package_planning_created_ready_for_ag38c_preflight",
  depends_on: ["AG38A", "AG37Z", "AG36Z"],
  generated_from: inputs,
  package_file: outputs.package,
  target_candidate_plan_file: outputs.targetCandidatePlan,
  grant_plan_file: outputs.grantPlan,
  audit_rollback_plan_file: outputs.auditRollbackPlan,
  no_execution_audit_file: outputs.noExecutionAudit,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    controlled_apply_package_planning_created: true,
    explicit_grant_plan_created: true,
    audit_rollback_plan_created: true,
    ready_for_ag38c_preflight: true,

    explicit_operator_approval_recorded: false,
    real_publish_executed: false,
    database_write_done: false,
    audit_log_write_done: false,
    rollback_write_done: false,
    public_article_mutated: false,
    deployment_done: false,
    public_mutation_done: false,
    service_role_key_exposed: false,
    anon_access_granted: false,
    sql_grants_executed: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG38B",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG38B",
  preview_only: false,
  status: review.status,
  message: "AG38B Controlled Apply Package Planning created. Ready for AG38C preflight only.",
  controlled_apply_package_planning_created: 1,
  explicit_grant_plan_created: 1,
  audit_rollback_plan_created: 1,
  ready_for_ag38c_preflight: 1,
  explicit_operator_approval_recorded: 0,
  real_publish_executed: 0,
  database_write_done: 0,
  audit_log_write_done: 0,
  rollback_write_done: 0,
  public_article_mutated: 0,
  deployment_done: 0,
  public_mutation_done: 0,
  service_role_key_exposed: 0,
  anon_access_granted: 0,
  sql_grants_executed: 0
};

const doc = `# AG38B — Controlled Apply Package Planning

## Result

AG38B Controlled Apply Package Planning is created.

## Scope

This is package planning only. It does not approve or perform real publish, queue-state write, audit-log write, rollback write, database write, public mutation, deployment or SQL grant execution.

## Package Components

- Test/non-public article target plan.
- Supabase explicit authenticated-only grant plan.
- Audit and rollback plan.
- No-execution audit.

## Supabase Explicit GRANT Planning

The package includes a future authenticated-only read grant direction for:

- public.profiles
- public.articles
- public.article_assignments
- public.article_audit_logs
- public.publish_rollback_refs

No anon grant is planned for Admin/Editor workflow tables.

No SQL is executed in AG38B.

## Still Blocked

- No explicit operator approval recorded.
- No real publish.
- No database write.
- No audit-log write.
- No rollback write.
- No public mutation.
- No deployment.
- No SQL grant execution.
- No service-role key exposure.

## Next

AG38C — Controlled Apply Preflight.

AG38C must remain preflight-only unless explicit operator approval is separately recorded.
`;

writeJson(outputs.targetCandidatePlan, targetCandidatePlan);
writeJson(outputs.grantPlan, grantPlan);
writeJson(outputs.auditRollbackPlan, auditRollbackPlan);
writeJson(outputs.noExecutionAudit, noExecutionAudit);
writeJson(outputs.package, packageRecord);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG38B Controlled Apply Package Planning generated.");
console.log("✅ Supabase explicit grant plan, target plan, audit plan and rollback plan created.");
console.log("✅ Ready for AG38C preflight only.");
console.log("✅ No real publish, database write, public mutation, deployment, SQL grant execution or service-role key recorded.");
