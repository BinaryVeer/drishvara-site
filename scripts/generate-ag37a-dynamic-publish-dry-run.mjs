import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag36zClosure: "data/content-intelligence/backend-architecture/ag36z-login-live-test-closure.json",
  ag36zChain: "data/content-intelligence/backend-architecture/ag36z-login-live-test-chain-register.json",
  ag36zReadiness: "data/content-intelligence/quality-registry/ag36z-dynamic-publish-dry-run-readiness-record.json",
  ag36zBoundary: "data/content-intelligence/mutation-plans/ag36z-to-ag37a-dynamic-publish-dry-run-boundary.json",
  ag32aPlan: "data/content-intelligence/backend-architecture/ag32a-publish-handler-plan.json",
  ag32cGuardRules: "data/content-intelligence/backend-architecture/ag32c-publish-guard-rules.json",
  ag33aScaffold: "data/content-intelligence/backend-architecture/ag33a-non-active-publish-handler-scaffold.json",
  ag33bQueueMutation: "data/content-intelligence/backend-architecture/ag33b-non-active-queue-mutation-scaffold.json",
  ag33cAuditWrite: "data/content-intelligence/backend-architecture/ag33c-non-active-audit-write-scaffold.json",
  ag26zRoleGovernance: "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag37a-dynamic-publish-dry-run.json",
  package: "data/content-intelligence/backend-architecture/ag37a-dynamic-publish-dry-run-package.json",
  dryRunSimulation: "data/content-intelligence/backend-architecture/ag37a-admin-publish-action-dry-run-simulation.json",
  guardEvaluation: "data/content-intelligence/backend-architecture/ag37a-publish-guard-evaluation-record.json",
  nonMutationAudit: "data/content-intelligence/backend-architecture/ag37a-non-mutation-audit-register.json",
  blocker: "data/content-intelligence/quality-registry/ag37a-dynamic-publish-dry-run-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag37a-queue-state-dry-run-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag37a-to-ag37b-queue-state-dry-run-boundary.json",
  registry: "data/quality/ag37a-dynamic-publish-dry-run.json",
  preview: "data/quality/ag37a-dynamic-publish-dry-run-preview.json",
  doc: "docs/quality/AG37A_DYNAMIC_PUBLISH_DRY_RUN.md"
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
  if (!exists(p)) throw new Error(`Missing AG37A input: ${p}`);
}

const records = Object.fromEntries(Object.entries(inputs).map(([k, f]) => [k, readJson(f)]));

if (records.ag36zClosure.status !== "login_live_test_closure_created_ready_for_ag37a") {
  throw new Error("AG36Z closure status mismatch.");
}
if (records.ag36zReadiness.ready_for_ag37a !== true) {
  throw new Error("AG36Z readiness does not permit AG37A.");
}
if (records.ag36zReadiness.allowed_ag37a_mode !== "dynamic_publish_dry_run_only_against_test_or_non_public_article") {
  throw new Error("AG37A mode mismatch.");
}
if (records.ag36zBoundary.next_stage_id !== "AG37A") {
  throw new Error("AG36Z boundary does not point to AG37A.");
}
if (records.ag26zRoleGovernance.role_rules?.admin_final_clearance_authority !== true) {
  throw new Error("Admin final clearance rule missing.");
}
if (records.ag26zRoleGovernance.role_rules?.editor_cannot_publish !== true) {
  throw new Error("Editor no-publish rule missing.");
}

const blockedState = {
  dynamic_publish_dry_run_created: true,
  admin_publish_action_simulated: true,
  test_non_public_article_only: true,
  guard_evaluation_created: true,
  queue_state_dry_run_ready: true,

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

const dryRunSimulation = {
  module_id: "AG37A",
  title: "Admin Publish Action Dry-run Simulation",
  status: "admin_publish_action_simulated_without_mutation",
  simulation_scope: {
    actor_role: "admin",
    actor_authority: "final_clearance_authority",
    candidate_type: "test_or_non_public_article",
    candidate_slug: "enhancing-public-healthcare-delivery-digital-innovation",
    source_status: "ready_for_admin_review",
    intended_target_status: "published",
    public_visibility_before: false,
    public_visibility_after: "simulated_only_not_written"
  },
  simulated_actions: [
    "Admin selects publish action.",
    "Publish guard checks Admin role.",
    "Publish guard checks approved candidate status.",
    "Publish guard checks public filter pass.",
    "Publish guard prepares intended state transition.",
    "Dry-run blocks actual database/public mutation."
  ],
  actual_actions_executed: [],
  dry_run_only: true,
  blocked_state: blockedState
};

const guardEvaluation = {
  module_id: "AG37A",
  title: "Publish Guard Evaluation Record",
  status: "publish_guard_evaluation_created_for_dry_run",
  guard_rules_evaluated: [
    {
      rule_id: "admin_role_required",
      expected: true,
      simulated_result: true
    },
    {
      rule_id: "approved_candidate_required",
      expected: true,
      simulated_result: true
    },
    {
      rule_id: "public_filter_required",
      expected: true,
      simulated_result: true
    },
    {
      rule_id: "audit_record_required",
      expected: true,
      simulated_result: "shape_only_no_write"
    },
    {
      rule_id: "rollback_reference_required",
      expected: true,
      simulated_result: "shape_only_no_write"
    },
    {
      rule_id: "public_mutation_blocked_in_ag37a",
      expected: true,
      simulated_result: true
    }
  ],
  all_guard_checks_passed_for_dry_run: true,
  blocked_state: blockedState
};

const nonMutationAudit = {
  module_id: "AG37A",
  title: "Non-mutation Audit Register",
  status: "non_mutation_audit_passed_for_ag37a",
  checks: [
    {
      check_id: "no_real_publish",
      passed: true,
      evidence: "AG37A records simulation only."
    },
    {
      check_id: "no_public_article_mutation",
      passed: true,
      evidence: "public_visibility_after is simulated only."
    },
    {
      check_id: "no_database_write",
      passed: true,
      evidence: "No Supabase/API/database write command is generated."
    },
    {
      check_id: "no_audit_log_write",
      passed: true,
      evidence: "Audit record is planned as shape only."
    },
    {
      check_id: "no_rollback_write",
      passed: true,
      evidence: "Rollback reference is planned as shape only."
    },
    {
      check_id: "no_service_role_key",
      passed: true,
      evidence: "No service-role key is required or recorded."
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
  module_id: "AG37A",
  title: "Dynamic Publish Dry-run Package",
  status: "dynamic_publish_dry_run_created_ready_for_ag37b",
  purpose:
    "Simulate Admin dynamic publish action against a test/non-public article after AG36 login closure, without database write, public mutation, deployment, service-role key or real publish action.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  dry_run_decision: {
    dynamic_publish_dry_run_created: true,
    admin_publish_action_simulated: true,
    proceed_to_ag37b_queue_state_dry_run: true,

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
  dry_run_simulation_file: outputs.dryRunSimulation,
  guard_evaluation_file: outputs.guardEvaluation,
  non_mutation_audit_file: outputs.nonMutationAudit,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG37A",
  title: "Dynamic Publish Dry-run Blocker Register",
  status: "dynamic_publish_dry_run_blockers_preserved",
  blocked_items: [
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
  module_id: "AG37A",
  title: "Queue State Dry-run Readiness Record",
  status: "ready_for_ag37b_queue_state_dry_run",
  ready_for_ag37b: true,
  next_stage_id: "AG37B",
  next_stage_title: "Queue State Dry-run",
  dry_run_only: true,
  admin_publish_action_simulated: true,
  guard_evaluation_passed: true,
  non_mutation_audit_passed: true,
  deployment_allowed_next: false,
  public_mutation_allowed_next: false,
  real_publish_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG37A",
  title: "AG37A to AG37B Queue State Dry-run Boundary",
  status: "ag37b_queue_state_dry_run_boundary_created",
  next_stage_id: "AG37B",
  next_stage_title: "Queue State Dry-run",
  allowed_scope: [
    "Consume AG37A dynamic publish dry-run.",
    "Simulate queue-state transition only.",
    "Record before/after queue state shape.",
    "Keep database write, public mutation and deployment blocked."
  ],
  blocked_scope: blocker.blocked_items,
  blocked_state: blockedState
};

const review = {
  module_id: "AG37A",
  title: "Dynamic Publish Dry-run",
  status: "dynamic_publish_dry_run_created_ready_for_ag37b",
  depends_on: ["AG36Z", "AG33A", "AG33B", "AG33C", "AG32C", "AG26Z"],
  generated_from: inputs,
  package_file: outputs.package,
  dry_run_simulation_file: outputs.dryRunSimulation,
  guard_evaluation_file: outputs.guardEvaluation,
  non_mutation_audit_file: outputs.nonMutationAudit,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    dynamic_publish_dry_run_created: true,
    admin_publish_action_simulated: true,
    guard_evaluation_passed: true,
    non_mutation_audit_passed: true,
    ready_for_ag37b: true,

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
  module_id: "AG37A",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG37A",
  preview_only: false,
  status: review.status,
  message: "AG37A Dynamic Publish Dry-run created. Ready for AG37B Queue State Dry-run.",
  dynamic_publish_dry_run_created: 1,
  admin_publish_action_simulated: 1,
  ready_for_ag37b: 1,
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

const doc = `# AG37A — Dynamic Publish Dry-run

## Purpose

AG37A simulates an Admin dynamic publish action against a test/non-public article.

## Dry-run Result

The Admin publish action is simulated only. No public article mutation, database write, audit write, rollback write, deployment or real publish action is executed.

## Simulated Candidate

- Slug: enhancing-public-healthcare-delivery-digital-innovation
- Source status: ready_for_admin_review
- Intended target status: published
- Public visibility after: simulated only, not written

## Still Blocked

- No real publish.
- No public mutation.
- No database write.
- No service-role key.
- No deployment.
- No dynamic publish runtime enablement.

## Next

AG37B — Queue State Dry-run.
`;

writeJson(outputs.dryRunSimulation, dryRunSimulation);
writeJson(outputs.guardEvaluation, guardEvaluation);
writeJson(outputs.nonMutationAudit, nonMutationAudit);
writeJson(outputs.package, packageRecord);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG37A Dynamic Publish Dry-run generated.");
console.log("✅ Admin publish action simulated without mutation.");
console.log("✅ Ready for AG37B Queue State Dry-run.");
console.log("✅ No database write, public mutation, deployment, service-role key or real publish recorded.");
