import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag41aSop: "data/content-intelligence/backend-architecture/ag41a-dynamic-publishing-sop.json",
  ag41aRoleGate: "data/content-intelligence/backend-architecture/ag41a-role-gate-model.json",
  ag41aWorkflowSop: "data/content-intelligence/backend-architecture/ag41a-publishing-workflow-sop.json",
  ag41aAuditRollbackSop: "data/content-intelligence/backend-architecture/ag41a-audit-rollback-sop.json",
  ag41aSecuritySop: "data/content-intelligence/backend-architecture/ag41a-security-and-grant-sop.json",
  ag41aNoMutation: "data/content-intelligence/backend-architecture/ag41a-no-mutation-audit-register.json",
  ag41aReadiness: "data/content-intelligence/quality-registry/ag41a-batch-dynamic-publishing-plan-readiness-record.json",
  ag41aBoundary: "data/content-intelligence/mutation-plans/ag41a-to-ag41b-batch-dynamic-publishing-plan-boundary.json",
  ag40zClosure: "data/content-intelligence/backend-architecture/ag40z-dynamic-stabilisation-closure.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag41b-batch-dynamic-publishing-plan.json",
  plan: "data/content-intelligence/backend-architecture/ag41b-batch-dynamic-publishing-plan.json",
  candidatePolicy: "data/content-intelligence/backend-architecture/ag41b-batch-candidate-selection-policy.json",
  batchRiskPlan: "data/content-intelligence/backend-architecture/ag41b-batch-risk-control-plan.json",
  batchValidationPlan: "data/content-intelligence/backend-architecture/ag41b-batch-validation-plan.json",
  rolloutPlan: "data/content-intelligence/backend-architecture/ag41b-batch-rollout-schedule-plan.json",
  noMutationAudit: "data/content-intelligence/backend-architecture/ag41b-no-mutation-audit-register.json",
  blocker: "data/content-intelligence/quality-registry/ag41b-batch-dynamic-publishing-plan-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag41b-monitoring-audit-dashboard-plan-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag41b-to-ag41c-monitoring-audit-dashboard-plan-boundary.json",
  registry: "data/quality/ag41b-batch-dynamic-publishing-plan.json",
  preview: "data/quality/ag41b-batch-dynamic-publishing-plan-preview.json",
  doc: "docs/quality/AG41B_BATCH_DYNAMIC_PUBLISHING_PLAN.md"
};

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}
function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG41B input: ${p}`);
}

const r = Object.fromEntries(Object.entries(inputs).map(([k, f]) => [k, readJson(f)]));

if (r.ag41aSop.status !== "dynamic_publishing_sop_created_ready_for_ag41b_batch_plan") throw new Error("AG41A SOP status mismatch.");
if (r.ag41aSop.sop_decision.proceed_to_ag41b_batch_dynamic_publishing_plan !== true) throw new Error("AG41A does not permit AG41B.");
if (r.ag41aNoMutation.audit_passed !== true) throw new Error("AG41A no-mutation audit must pass.");
if (r.ag41aReadiness.ready_for_ag41b !== true) throw new Error("AG41A readiness does not permit AG41B.");
if (r.ag41aBoundary.next_stage_id !== "AG41B") throw new Error("AG41A boundary does not point to AG41B.");
if (r.ag40zClosure.status !== "dynamic_stabilisation_closure_created_ready_for_ag41a_sop") throw new Error("AG40Z closure status mismatch.");

const blockedState = {
  batch_dynamic_publishing_plan_created: true,
  candidate_selection_policy_created: true,
  batch_risk_control_plan_created: true,
  batch_validation_plan_created: true,
  rollout_schedule_plan_created: true,
  monitoring_audit_dashboard_plan_ready: true,

  batch_execution_authorized_now: false,
  batch_publish_executed: false,
  public_mutation_approved_now: false,
  execution_authorized_now: false,
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
  sql_file_created: false,
  sql_grants_executed: false
};

const candidatePolicy = {
  module_id: "AG41B",
  title: "Batch Candidate Selection Policy",
  status: "batch_candidate_selection_policy_created",
  candidate_rules: [
    "Only articles that have completed internal quality, reference and image/attribution checks may enter a batch.",
    "Only articles with clear category, slug, title, excerpt and body readiness may enter a batch.",
    "No article may enter batch execution without Admin final approval.",
    "Editor-submitted articles must remain assigned-only until Admin review.",
    "Rollback readiness must be confirmed before any future execution.",
    "Batch execution requires a separate explicit operator approval stage."
  ],
  recommended_initial_batch_size: {
    first_controlled_batch: 1,
    second_controlled_batch_if_successful: 3,
    later_batch_upper_limit_before_automation: 5
  },
  excluded_from_batch: [
    "draft articles without review",
    "articles without references under editorial verification",
    "articles with missing image credit/attribution",
    "articles with unresolved layout/mobile issues",
    "articles without rollback plan"
  ],
  blocked_state: blockedState
};

const batchRiskPlan = {
  module_id: "AG41B",
  title: "Batch Risk Control Plan",
  status: "batch_risk_control_plan_created",
  risk_controls: [
    {
      risk_id: "wrong_article_batch",
      control: "batch manifest must list exact article ids/slugs before future execution"
    },
    {
      risk_id: "unreviewed_publication",
      control: "Admin final approval required for each article"
    },
    {
      risk_id: "listing_breakage",
      control: "public listing check required after each controlled batch"
    },
    {
      risk_id: "rollback_failure",
      control: "rollback record and restore action required before future execution"
    },
    {
      risk_id: "excess_public_mutation",
      control: "initial batch size capped and must be manually approved"
    },
    {
      risk_id: "secret_exposure",
      control: "no service-role key in repo/chat/browser/public config"
    }
  ],
  batch_execution_allowed_in_ag41b: false,
  blocked_state: blockedState
};

const batchValidationPlan = {
  module_id: "AG41B",
  title: "Batch Validation Plan",
  status: "batch_validation_plan_created",
  validation_sequence: [
    "validate article metadata completeness",
    "validate body/content readiness",
    "validate reference links and editorial verification state",
    "validate image credits/attribution",
    "validate Admin approval gate",
    "validate rollback readiness",
    "validate public URL pattern",
    "validate public listing impact",
    "validate audit-log requirement",
    "validate post-publish stabilisation checks"
  ],
  required_before_future_batch_execution: true,
  validation_executed_in_ag41b: false,
  blocked_state: blockedState
};

const rolloutPlan = {
  module_id: "AG41B",
  title: "Batch Rollout Schedule Plan",
  status: "batch_rollout_schedule_plan_created",
  rollout_phases: [
    {
      phase_id: "phase_1_single_article",
      batch_size: 1,
      purpose: "prove controlled batch path with one approved article",
      execution_allowed_in_ag41b: false
    },
    {
      phase_id: "phase_2_small_batch",
      batch_size: 3,
      purpose: "test small-batch listing and audit behaviour after phase 1 success",
      execution_allowed_in_ag41b: false
    },
    {
      phase_id: "phase_3_limited_batch",
      batch_size: 5,
      purpose: "limited repeatable batch only after prior audit success",
      execution_allowed_in_ag41b: false
    }
  ],
  rollout_requires_separate_approval: true,
  blocked_state: blockedState
};

const noMutationAudit = {
  module_id: "AG41B",
  title: "No-mutation Audit Register",
  status: "no_mutation_audit_passed_for_ag41b",
  checks: [
    { check_id: "planning_only", passed: true },
    { check_id: "no_batch_execution", passed: true },
    { check_id: "no_public_mutation", passed: true },
    { check_id: "no_real_publish", passed: true },
    { check_id: "no_database_write", passed: true },
    { check_id: "no_audit_log_write", passed: true },
    { check_id: "no_rollback_write", passed: true },
    { check_id: "no_deployment", passed: true },
    { check_id: "no_sql_file_created", passed: true },
    { check_id: "no_sql_grant_execution", passed: true },
    { check_id: "no_service_role_key", passed: true },
    { check_id: "no_anon_grant", passed: true }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const plan = {
  module_id: "AG41B",
  title: "Batch Dynamic Publishing Plan",
  status: "batch_dynamic_publishing_plan_created_ready_for_ag41c_monitoring_dashboard_plan",
  purpose:
    "Create the governed batch dynamic publishing plan after AG41A SOP, without executing any batch, public mutation, database write, deployment, SQL grant or service-role key action.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  plan_decision: {
    batch_dynamic_publishing_plan_created: true,
    candidate_selection_policy_created: true,
    batch_risk_control_plan_created: true,
    batch_validation_plan_created: true,
    rollout_schedule_plan_created: true,
    proceed_to_ag41c_monitoring_audit_dashboard_plan: true,

    batch_execution_authorized_now: false,
    batch_publish_executed: false,
    real_publish_executed: false,
    database_write_done: false,
    audit_log_write_done: false,
    rollback_write_done: false,
    public_article_mutated: false,
    deployment_done: false,
    public_mutation_done: false,
    dynamic_publish_runtime_enabled: false,
    service_role_key_recorded: false,
    service_role_key_exposed: false,
    anon_access_granted: false,
    sql_file_created: false,
    sql_grants_executed: false
  },
  candidate_policy_file: outputs.candidatePolicy,
  batch_risk_plan_file: outputs.batchRiskPlan,
  batch_validation_plan_file: outputs.batchValidationPlan,
  rollout_plan_file: outputs.rolloutPlan,
  no_mutation_audit_file: outputs.noMutationAudit,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG41B",
  title: "Batch Dynamic Publishing Plan Blocker Register",
  status: "batch_dynamic_publishing_plan_blockers_preserved",
  blocked_items: [
    "No batch execution.",
    "No public mutation.",
    "No real publish.",
    "No queue-state write.",
    "No database write.",
    "No audit-log write.",
    "No rollback write.",
    "No deployment.",
    "No SQL file created.",
    "No SQL grant execution.",
    "No service-role key exposure.",
    "No anon grants."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG41B",
  title: "Monitoring and Audit Dashboard Plan Readiness Record",
  status: "ready_for_ag41c_monitoring_audit_dashboard_plan",
  ready_for_ag41c: true,
  next_stage_id: "AG41C",
  next_stage_title: "Monitoring and Audit Dashboard Plan",
  batch_dynamic_publishing_plan_created: true,
  deployment_allowed_next: false,
  public_mutation_allowed_next: false,
  real_publish_allowed_next: false,
  database_write_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG41B",
  title: "AG41B to AG41C Monitoring and Audit Dashboard Plan Boundary",
  status: "ag41c_monitoring_audit_dashboard_plan_boundary_created",
  next_stage_id: "AG41C",
  next_stage_title: "Monitoring and Audit Dashboard Plan",
  allowed_scope: [
    "Consume AG41B batch dynamic publishing plan.",
    "Create monitoring and audit dashboard plan.",
    "Keep mutation, deployment, SQL execution and service-role key exposure blocked unless separately approved."
  ],
  blocked_scope: blocker.blocked_items,
  blocked_state: blockedState
};

const review = {
  module_id: "AG41B",
  title: "Batch Dynamic Publishing Plan",
  status: plan.status,
  depends_on: ["AG41A", "AG40Z"],
  generated_from: inputs,
  plan_file: outputs.plan,
  candidate_policy_file: outputs.candidatePolicy,
  batch_risk_plan_file: outputs.batchRiskPlan,
  batch_validation_plan_file: outputs.batchValidationPlan,
  rollout_plan_file: outputs.rolloutPlan,
  no_mutation_audit_file: outputs.noMutationAudit,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    batch_dynamic_publishing_plan_created: true,
    ready_for_ag41c: true,
    batch_execution_authorized_now: false,
    batch_publish_executed: false,
    real_publish_executed: false,
    database_write_done: false,
    public_mutation_done: false,
    deployment_done: false,
    service_role_key_exposed: false,
    anon_access_granted: false,
    sql_file_created: false,
    sql_grants_executed: false
  },
  blocked_state: blockedState
};

const registry = { module_id: "AG41B", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG41B",
  preview_only: false,
  status: review.status,
  batch_dynamic_publishing_plan_created: 1,
  ready_for_ag41c: 1,
  batch_execution_authorized_now: 0,
  batch_publish_executed: 0,
  real_publish_executed: 0,
  database_write_done: 0,
  public_mutation_done: 0,
  deployment_done: 0,
  service_role_key_exposed: 0,
  anon_access_granted: 0,
  sql_file_created: 0,
  sql_grants_executed: 0
};

const doc = `# AG41B — Batch Dynamic Publishing Plan

## Result

AG41B Batch Dynamic Publishing Plan is created.

## Plan Coverage

- Candidate selection policy.
- Batch risk control plan.
- Batch validation plan.
- Batch rollout schedule plan.
- No-mutation audit.

## Recommended Batch Path

- First controlled batch: 1 article.
- Second controlled batch: 3 articles.
- Later limited batch before automation: 5 articles.

## Still Blocked

- No batch execution.
- No public mutation.
- No real publish.
- No database write.
- No audit-log write.
- No rollback write.
- No deployment.
- No SQL grant execution.
- No service-role key exposure.
- No anon grants.

## Next

AG41C — Monitoring and Audit Dashboard Plan.
`;

writeJson(outputs.candidatePolicy, candidatePolicy);
writeJson(outputs.batchRiskPlan, batchRiskPlan);
writeJson(outputs.batchValidationPlan, batchValidationPlan);
writeJson(outputs.rolloutPlan, rolloutPlan);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.plan, plan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG41B Batch Dynamic Publishing Plan generated.");
console.log("✅ Candidate policy, risk controls, validation plan and rollout plan are present.");
console.log("✅ Ready for AG41C Monitoring and Audit Dashboard Plan.");
console.log("✅ No batch execution, public mutation, real publish, database write, deployment, SQL grant execution or service-role key recorded.");
