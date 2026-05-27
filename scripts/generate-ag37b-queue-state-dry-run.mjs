import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag37aPackage: "data/content-intelligence/backend-architecture/ag37a-dynamic-publish-dry-run-package.json",
  ag37aSimulation: "data/content-intelligence/backend-architecture/ag37a-admin-publish-action-dry-run-simulation.json",
  ag37aGuard: "data/content-intelligence/backend-architecture/ag37a-publish-guard-evaluation-record.json",
  ag37aNonMutation: "data/content-intelligence/backend-architecture/ag37a-non-mutation-audit-register.json",
  ag37aReadiness: "data/content-intelligence/quality-registry/ag37a-queue-state-dry-run-readiness-record.json",
  ag37aBoundary: "data/content-intelligence/mutation-plans/ag37a-to-ag37b-queue-state-dry-run-boundary.json",
  ag31StateModel: "data/content-intelligence/backend-architecture/ag31a-article-state-model.json",
  ag31TransitionMap: "data/content-intelligence/backend-architecture/ag31a-article-state-transition-map.json",
  ag36zClosure: "data/content-intelligence/backend-architecture/ag36z-login-live-test-closure.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag37b-queue-state-dry-run.json",
  package: "data/content-intelligence/backend-architecture/ag37b-queue-state-dry-run-package.json",
  beforeAfterModel: "data/content-intelligence/backend-architecture/ag37b-queue-state-before-after-model.json",
  transitionSimulation: "data/content-intelligence/backend-architecture/ag37b-queue-transition-dry-run-simulation.json",
  stateGuardRecord: "data/content-intelligence/backend-architecture/ag37b-state-guard-evaluation-record.json",
  nonMutationAudit: "data/content-intelligence/backend-architecture/ag37b-non-mutation-audit-register.json",
  blocker: "data/content-intelligence/quality-registry/ag37b-queue-state-dry-run-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag37b-audit-log-dry-run-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag37b-to-ag37c-audit-log-dry-run-boundary.json",
  registry: "data/quality/ag37b-queue-state-dry-run.json",
  preview: "data/quality/ag37b-queue-state-dry-run-preview.json",
  doc: "docs/quality/AG37B_QUEUE_STATE_DRY_RUN.md"
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
  if (!exists(p)) throw new Error(`Missing AG37B input: ${p}`);
}

const records = Object.fromEntries(Object.entries(inputs).map(([k, f]) => [k, readJson(f)]));

if (records.ag37aPackage.status !== "dynamic_publish_dry_run_created_ready_for_ag37b") {
  throw new Error("AG37A package status mismatch.");
}
if (records.ag37aReadiness.ready_for_ag37b !== true) {
  throw new Error("AG37A readiness does not permit AG37B.");
}
if (records.ag37aBoundary.next_stage_id !== "AG37B") {
  throw new Error("AG37A boundary does not point to AG37B.");
}
if (records.ag37aNonMutation.audit_passed !== true) {
  throw new Error("AG37A non-mutation audit must pass.");
}
if (records.ag37aGuard.all_guard_checks_passed_for_dry_run !== true) {
  throw new Error("AG37A guard checks must pass.");
}
if (records.ag36zClosure.status !== "login_live_test_closure_created_ready_for_ag37a") {
  throw new Error("AG36Z closure status mismatch.");
}

const blockedState = {
  queue_state_dry_run_created: true,
  queue_transition_simulated: true,
  before_after_model_created: true,
  audit_log_dry_run_ready: true,

  actual_queue_state_changed: false,
  real_publish_executed: false,
  public_article_mutated: false,
  database_write_done: false,
  audit_log_write_done: false,
  rollback_write_done: false,
  deployment_triggered: false,
  public_mutation_done: false,
  dynamic_publish_runtime_enabled: false,
  service_role_key_recorded: false,
  service_role_key_exposed: false,
  password_recorded: false,
  token_recorded: false,
  cookie_recorded: false,
  supabase_key_recorded: false
};

const candidate = {
  article_id: "dry_run_seed_candidate_001",
  slug: "enhancing-public-healthcare-delivery-digital-innovation",
  category: "policy",
  title: "Enhancing Public Healthcare Delivery through Digital Innovation",
  source_status: "ready_for_admin_review",
  target_status: "published",
  public_visibility_before: false,
  public_visibility_after: "simulated_only_not_written",
  queue_membership_before: "admin_review_queue",
  queue_membership_after: "removed_from_admin_review_queue_simulated_only"
};

const beforeAfterModel = {
  module_id: "AG37B",
  title: "Queue State Before/After Model",
  status: "queue_state_before_after_model_created",
  candidate,
  before_state: {
    article_status: "ready_for_admin_review",
    queue_bucket: "admin_review_queue",
    public_visibility: false,
    publish_action_available_to_admin: true,
    archive_action_available_to_admin: true,
    return_action_available_to_admin: true
  },
  simulated_after_state: {
    article_status: "published",
    queue_bucket: "published_queue_or_public_surface_pending_apply",
    public_visibility: "true_if_real_publish_later_approved",
    publish_action_available_to_admin: false,
    archive_action_available_to_admin: false,
    return_action_available_to_admin: false
  },
  actual_after_state_written: null,
  dry_run_only: true,
  blocked_state: blockedState
};

const transitionSimulation = {
  module_id: "AG37B",
  title: "Queue Transition Dry-run Simulation",
  status: "queue_transition_simulated_without_write",
  transition: {
    from_status: "ready_for_admin_review",
    to_status: "published",
    from_queue: "admin_review_queue",
    to_queue: "published_or_removed_from_pending_queue",
    actor_role: "admin",
    action: "publish",
    transition_type: "dry_run_only"
  },
  simulated_effects: [
    "Candidate leaves Admin Review Queue.",
    "Candidate obtains published status.",
    "Candidate would become eligible for public surface only after real controlled apply.",
    "Admin action buttons would become unavailable after publish."
  ],
  actual_effects_executed: [],
  dry_run_only: true,
  blocked_state: blockedState
};

const stateGuardRecord = {
  module_id: "AG37B",
  title: "State Guard Evaluation Record",
  status: "state_guard_evaluation_passed_for_dry_run",
  guard_checks: [
    {
      check_id: "source_state_allowed",
      expected: "ready_for_admin_review",
      simulated_value: "ready_for_admin_review",
      passed: true
    },
    {
      check_id: "target_state_allowed",
      expected: "published",
      simulated_value: "published",
      passed: true
    },
    {
      check_id: "admin_actor_required",
      expected: "admin",
      simulated_value: "admin",
      passed: true
    },
    {
      check_id: "editor_cannot_publish_preserved",
      expected: true,
      simulated_value: true,
      passed: true
    },
    {
      check_id: "no_direct_public_write",
      expected: true,
      simulated_value: true,
      passed: true
    }
  ],
  all_state_guard_checks_passed: true,
  blocked_state: blockedState
};

const nonMutationAudit = {
  module_id: "AG37B",
  title: "Queue State Non-mutation Audit Register",
  status: "queue_state_non_mutation_audit_passed",
  checks: [
    {
      check_id: "no_actual_queue_state_change",
      passed: true,
      evidence: "Queue state is represented only in AG37B JSON model."
    },
    {
      check_id: "no_database_write",
      passed: true,
      evidence: "No Supabase/API/database write command is generated."
    },
    {
      check_id: "no_public_article_mutation",
      passed: true,
      evidence: "Public visibility remains simulated only."
    },
    {
      check_id: "no_audit_log_write",
      passed: true,
      evidence: "Audit log dry-run is deferred to AG37C."
    },
    {
      check_id: "no_rollback_write",
      passed: true,
      evidence: "Rollback dry-run is deferred to AG37C."
    },
    {
      check_id: "no_service_role_key",
      passed: true,
      evidence: "No service-role key is used or recorded."
    },
    {
      check_id: "no_deployment",
      passed: true,
      evidence: "No deployment command is generated."
    }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const packageRecord = {
  module_id: "AG37B",
  title: "Queue State Dry-run Package",
  status: "queue_state_dry_run_created_ready_for_ag37c",
  purpose:
    "Simulate queue-state transition for Admin publish action after AG37A dry-run, without actual queue mutation, database write, public mutation, deployment, service-role key or audit-log write.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  dry_run_decision: {
    queue_state_dry_run_created: true,
    queue_transition_simulated: true,
    before_after_model_created: true,
    proceed_to_ag37c_audit_log_dry_run: true,

    actual_queue_state_changed: false,
    real_publish_executed: false,
    public_article_mutated: false,
    database_write_done: false,
    audit_log_write_done: false,
    rollback_write_done: false,
    deployment_done: false,
    public_mutation_done: false,
    dynamic_publish_runtime_enabled: false,
    service_role_key_recorded: false,
    service_role_key_exposed: false
  },
  before_after_model_file: outputs.beforeAfterModel,
  transition_simulation_file: outputs.transitionSimulation,
  state_guard_record_file: outputs.stateGuardRecord,
  non_mutation_audit_file: outputs.nonMutationAudit,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG37B",
  title: "Queue State Dry-run Blocker Register",
  status: "queue_state_dry_run_blockers_preserved",
  blocked_items: [
    "No actual queue state change.",
    "No real publish.",
    "No public article mutation.",
    "No database write.",
    "No audit log write.",
    "No rollback write.",
    "No service-role key exposure.",
    "No deployment.",
    "No public mutation.",
    "No dynamic publish runtime enablement."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG37B",
  title: "Audit Log Dry-run Readiness Record",
  status: "ready_for_ag37c_audit_log_dry_run",
  ready_for_ag37c: true,
  next_stage_id: "AG37C",
  next_stage_title: "Audit Log Dry-run",
  dry_run_only: true,
  queue_transition_simulated: true,
  state_guard_evaluation_passed: true,
  non_mutation_audit_passed: true,
  deployment_allowed_next: false,
  public_mutation_allowed_next: false,
  real_publish_allowed_next: false,
  database_write_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG37B",
  title: "AG37B to AG37C Audit Log Dry-run Boundary",
  status: "ag37c_audit_log_dry_run_boundary_created",
  next_stage_id: "AG37C",
  next_stage_title: "Audit Log Dry-run",
  allowed_scope: [
    "Consume AG37B queue-state dry-run.",
    "Simulate audit log event shape only.",
    "Simulate rollback reference shape only.",
    "Keep database write, public mutation and deployment blocked."
  ],
  blocked_scope: blocker.blocked_items,
  blocked_state: blockedState
};

const review = {
  module_id: "AG37B",
  title: "Queue State Dry-run",
  status: "queue_state_dry_run_created_ready_for_ag37c",
  depends_on: ["AG37A", "AG36Z", "AG31A"],
  generated_from: inputs,
  package_file: outputs.package,
  before_after_model_file: outputs.beforeAfterModel,
  transition_simulation_file: outputs.transitionSimulation,
  state_guard_record_file: outputs.stateGuardRecord,
  non_mutation_audit_file: outputs.nonMutationAudit,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    queue_state_dry_run_created: true,
    queue_transition_simulated: true,
    state_guard_evaluation_passed: true,
    non_mutation_audit_passed: true,
    ready_for_ag37c: true,

    actual_queue_state_changed: false,
    real_publish_executed: false,
    public_article_mutated: false,
    database_write_done: false,
    audit_log_write_done: false,
    rollback_write_done: false,
    deployment_done: false,
    public_mutation_done: false,
    dynamic_publish_runtime_enabled: false,
    service_role_key_exposed: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG37B",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG37B",
  preview_only: false,
  status: review.status,
  message: "AG37B Queue State Dry-run created. Ready for AG37C Audit Log Dry-run.",
  queue_state_dry_run_created: 1,
  queue_transition_simulated: 1,
  ready_for_ag37c: 1,
  actual_queue_state_changed: 0,
  real_publish_executed: 0,
  public_article_mutated: 0,
  database_write_done: 0,
  audit_log_write_done: 0,
  rollback_write_done: 0,
  deployment_done: 0,
  public_mutation_done: 0,
  dynamic_publish_runtime_enabled: 0,
  service_role_key_exposed: 0
};

const doc = `# AG37B — Queue State Dry-run

## Purpose

AG37B simulates the queue-state transition that would occur after an Admin publish action.

## Dry-run Result

The queue-state transition is simulated only. No actual queue mutation, database write, audit-log write, rollback write, public mutation, deployment or real publish action is executed.

## Simulated Transition

- From status: ready_for_admin_review
- To status: published
- From queue: admin_review_queue
- To queue: published_or_removed_from_pending_queue
- Actor role: admin
- Action: publish

## Still Blocked

- No actual queue state change.
- No real publish.
- No public mutation.
- No database write.
- No service-role key.
- No deployment.
- No dynamic publish runtime enablement.

## Next

AG37C — Audit Log Dry-run.
`;

writeJson(outputs.beforeAfterModel, beforeAfterModel);
writeJson(outputs.transitionSimulation, transitionSimulation);
writeJson(outputs.stateGuardRecord, stateGuardRecord);
writeJson(outputs.nonMutationAudit, nonMutationAudit);
writeJson(outputs.package, packageRecord);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG37B Queue State Dry-run generated.");
console.log("✅ Queue transition simulated without mutation.");
console.log("✅ Ready for AG37C Audit Log Dry-run.");
console.log("✅ No queue write, database write, public mutation, deployment, service-role key or real publish recorded.");
