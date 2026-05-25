import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag22aReview: "data/content-intelligence/quality-reviews/ag22a-repeatable-publishing-sop-plan.json",
  ag22bReview: "data/content-intelligence/quality-reviews/ag22b-repeatable-publishing-sop-audit.json",
  ag22cReview: "data/content-intelligence/quality-reviews/ag22c-batch-publishing-dry-run.json",
  ag22dReview: "data/content-intelligence/quality-reviews/ag22d-batch-dry-run-audit.json",
  ag22dAudit: "data/content-intelligence/audit-records/ag22d-batch-dry-run-audit-report.json",
  ag22dDecision: "data/content-intelligence/go-live/ag22d-repeatable-static-publishing-workflow-closure-decision-record.json",
  ag22dReadiness: "data/content-intelligence/quality-registry/ag22d-repeatable-static-publishing-workflow-closure-readiness-record.json",
  ag22dBoundary: "data/content-intelligence/mutation-plans/ag22d-to-ag22z-repeatable-static-publishing-workflow-closure-boundary.json",
  supabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag22z-repeatable-static-publishing-workflow-closure.json",
  closure: "data/content-intelligence/closure-records/ag22z-repeatable-static-publishing-workflow-closure.json",
  summary: "data/content-intelligence/go-live/ag22z-repeatable-static-publishing-workflow-summary.json",
  readiness: "data/content-intelligence/quality-registry/ag22z-first-controlled-static-publish-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag22z-to-ag23a-first-controlled-static-publish-candidate-gate-boundary.json",
  registry: "data/quality/ag22z-repeatable-static-publishing-workflow-closure.json",
  preview: "data/quality/ag22z-repeatable-static-publishing-workflow-closure-preview.json",
  doc: "docs/quality/AG22Z_REPEATABLE_STATIC_PUBLISHING_WORKFLOW_CLOSURE.md"
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
  if (!exists(p)) throw new Error(`Missing AG22Z input: ${p}`);
}

const ag22a = readJson(inputs.ag22aReview);
const ag22b = readJson(inputs.ag22bReview);
const ag22c = readJson(inputs.ag22cReview);
const ag22d = readJson(inputs.ag22dReview);
const ag22dAudit = readJson(inputs.ag22dAudit);
const ag22dDecision = readJson(inputs.ag22dDecision);
const ag22dReadiness = readJson(inputs.ag22dReadiness);
const ag22dBoundary = readJson(inputs.ag22dBoundary);
const supabaseReminder = readJson(inputs.supabaseReminder);

if (ag22a.status !== "repeatable_publishing_sop_plan_created_pending_audit") throw new Error("AG22A status mismatch.");
if (ag22b.status !== "repeatable_publishing_sop_audit_passed_ready_for_ag22c_batch_dry_run") throw new Error("AG22B status mismatch.");
if (ag22c.status !== "batch_publishing_dry_run_completed_ready_for_ag22d_audit") throw new Error("AG22C status mismatch.");
if (ag22d.status !== "batch_dry_run_audit_passed_ready_for_ag22z_closure") throw new Error("AG22D status mismatch.");
if (ag22dAudit.failed_checks.length !== 0) throw new Error("AG22D audit has failed checks.");
if (ag22dDecision.decision.proceed_to_ag22z_repeatable_static_publishing_workflow_closure !== true) throw new Error("AG22D decision does not allow AG22Z.");
if (ag22dReadiness.ready_for_ag22z !== true) throw new Error("AG22D readiness does not allow AG22Z.");
if (ag22dBoundary.next_stage_id !== "AG22Z") throw new Error("AG22D boundary does not point to AG22Z.");

const blockedState = {
  article_generated: false,
  article_file_created: false,
  article_mutated: false,
  queue_mutated: false,
  github_token_created: false,
  github_write_performed: false,
  public_visibility_switched: false,
  public_index_mutated: false,
  deployment_triggered: false,
  live_smoke_test_performed: false,
  rollback_executed: false,
  article_published: false,
  supabase_auth_backend_activated: false
};

const completedStages = [
  "AG22A — Repeatable Publishing SOP Plan",
  "AG22B — SOP Audit",
  "AG22C — Batch Publishing Dry-run",
  "AG22D — Batch Dry-run Audit"
];

const summary = {
  module_id: "AG22Z",
  title: "Repeatable Static Publishing Workflow Summary",
  status: "repeatable_static_publishing_workflow_closed",
  completed_stages: completedStages,
  result: {
    sop_defined: true,
    sop_audited: true,
    batch_dry_run_completed: true,
    batch_dry_run_audited: true,
    workflow_ready_for_first_controlled_static_publish_candidate_gate: true,
    real_execution_done: false
  },
  supabase_auth_backend_deferred: true,
  supabase_reminder: supabaseReminder.reminder,
  blocked_state: blockedState
};

const closure = {
  module_id: "AG22Z",
  title: "Repeatable Static Publishing Workflow Closure",
  status: "ag22_repeatable_static_publishing_workflow_closed_ready_for_ag23a_candidate_gate",
  closure_decision: {
    ag22_closed: true,
    proceed_to_ag23a_first_controlled_static_publish_candidate_gate: true,
    perform_article_mutation_now: false,
    perform_github_write_now: false,
    perform_public_visibility_switch_now: false,
    perform_deployment_now: false,
    perform_publishing_now: false,
    activate_supabase_auth_backend_now: false
  },
  summary_file: outputs.summary,
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG22Z",
  title: "First Controlled Static Publish Readiness Record",
  status: "ready_for_ag23a_first_controlled_static_publish_candidate_gate",
  ready_for_ag23a: true,
  next_stage_id: "AG23A",
  next_stage_title: "First Controlled Static Publish Candidate Gate",
  real_publish_allowed_now: false,
  supabase_auth_backend_deferred: true,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG22Z",
  title: "AG22Z to AG23A First Controlled Static Publish Candidate Gate Boundary",
  status: "ag23a_boundary_created_not_started",
  next_stage_id: "AG23A",
  next_stage_title: "First Controlled Static Publish Candidate Gate",
  allowed_scope: [
    "Select or confirm first article candidate for controlled static publish.",
    "Confirm intended static file path and public surface deltas.",
    "Confirm GitHub write, deployment, smoke-test and rollback preconditions.",
    "Keep Supabase/Auth/backend deferred."
  ],
  blocked_scope: [
    "No article mutation.",
    "No GitHub token creation.",
    "No GitHub write.",
    "No public visibility switch.",
    "No deployment.",
    "No publishing.",
    "No Supabase/Auth/backend activation."
  ],
  supabase_auth_backend_deferred: true
};

const review = {
  module_id: "AG22Z",
  title: "Repeatable Static Publishing Workflow Closure",
  status: closure.status,
  depends_on: ["AG22A", "AG22B", "AG22C", "AG22D"],
  generated_from: inputs,
  closure_file: outputs.closure,
  summary_file: outputs.summary,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  blocked_state: blockedState
};

const registry = {
  module_id: "AG22Z",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG22Z",
  preview_only: true,
  status: review.status,
  message: "AG22 repeatable static publishing workflow closed. Next: AG23A First Controlled Static Publish Candidate Gate.",
  blocked_state: blockedState
};

const doc = `# AG22Z — Repeatable Static Publishing Workflow Closure

## Purpose

AG22Z closes the AG22 repeatable static publishing workflow.

## Completed Chain

- AG22A — Repeatable Publishing SOP Plan.
- AG22B — SOP Audit.
- AG22C — Batch Publishing Dry-run.
- AG22D — Batch Dry-run Audit.

## Result

The repeatable publishing SOP is defined, audited, dry-run tested and ready for the next controlled candidate gate.

## Blocked State

No article mutation, queue mutation, GitHub token creation, GitHub write, public visibility switch, public index mutation, deployment, live smoke-test, rollback, publishing, or Supabase/Auth/backend activation was performed.

## Next Stage

AG23A — First Controlled Static Publish Candidate Gate.
`;

writeJson(outputs.review, review);
writeJson(outputs.closure, closure);
writeJson(outputs.summary, summary);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG22Z Repeatable Static Publishing Workflow Closure generated.");
console.log("✅ AG22A to AG22D chain closed.");
console.log("✅ AG23A First Controlled Static Publish Candidate Gate boundary created.");
console.log("✅ No mutation, GitHub write, deployment or publishing performed.");
