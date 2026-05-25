import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag22cReview: "data/content-intelligence/quality-reviews/ag22c-batch-publishing-dry-run.json",
  ag22cReport: "data/content-intelligence/go-live/ag22c-batch-publishing-dry-run-report.json",
  ag22cManifest: "data/content-intelligence/go-live/ag22c-dry-run-candidate-manifest.json",
  ag22cDeltas: "data/content-intelligence/go-live/ag22c-proposed-public-surface-deltas.json",
  ag22cBlocker: "data/content-intelligence/quality-registry/ag22c-batch-publishing-dry-run-blocker-register.json",
  ag22cReadiness: "data/content-intelligence/quality-registry/ag22c-batch-dry-run-audit-readiness-record.json",
  ag22cBoundary: "data/content-intelligence/mutation-plans/ag22c-to-ag22d-batch-dry-run-audit-boundary.json",
  supabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag22d-batch-dry-run-audit.json",
  audit: "data/content-intelligence/audit-records/ag22d-batch-dry-run-audit-report.json",
  decision: "data/content-intelligence/go-live/ag22d-repeatable-static-publishing-workflow-closure-decision-record.json",
  readiness: "data/content-intelligence/quality-registry/ag22d-repeatable-static-publishing-workflow-closure-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag22d-to-ag22z-repeatable-static-publishing-workflow-closure-boundary.json",
  registry: "data/quality/ag22d-batch-dry-run-audit.json",
  preview: "data/quality/ag22d-batch-dry-run-audit-preview.json",
  doc: "docs/quality/AG22D_BATCH_DRY_RUN_AUDIT.md"
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
  if (!exists(p)) throw new Error(`Missing AG22D input: ${p}`);
}

const reviewC = readJson(inputs.ag22cReview);
const report = readJson(inputs.ag22cReport);
const manifest = readJson(inputs.ag22cManifest);
const deltas = readJson(inputs.ag22cDeltas);
const blockerC = readJson(inputs.ag22cBlocker);
const readinessC = readJson(inputs.ag22cReadiness);
const boundaryC = readJson(inputs.ag22cBoundary);
const supabaseReminder = readJson(inputs.supabaseReminder);

if (reviewC.status !== "batch_publishing_dry_run_completed_ready_for_ag22d_audit") {
  throw new Error("AG22C review is not ready for AG22D.");
}
if (report.status !== "batch_publishing_dry_run_completed_no_publish") {
  throw new Error("AG22C dry-run report status mismatch.");
}
if (readinessC.ready_for_ag22d !== true) {
  throw new Error("AG22C readiness does not allow AG22D.");
}
if (boundaryC.next_stage_id !== "AG22D") {
  throw new Error("AG22C boundary does not point to AG22D.");
}

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

const checks = [
  {
    check_id: "AG22D-01",
    area: "candidate_manifest",
    passed: manifest.candidates?.length === 3,
    note: "Dry-run contains three article candidate types."
  },
  {
    check_id: "AG22D-02",
    area: "surface_deltas",
    passed: deltas.proposed_deltas?.length === 3 && deltas.proposed_deltas.every((d) => d.mutate_now === false),
    note: "Public surface deltas are plan-only and non-mutating."
  },
  {
    check_id: "AG22D-03",
    area: "dry_run_report",
    passed:
      report.dry_run_only === true &&
      report.dry_run_result.github_write_performed === false &&
      report.dry_run_result.deployment_triggered === false &&
      report.dry_run_result.published === false,
    note: "Dry-run completed without GitHub write, deployment or publishing."
  },
  {
    check_id: "AG22D-04",
    area: "blocked_state",
    passed: Object.values(reviewC.blocked_state || {}).every((v) => v === false),
    note: "All real actions remain blocked."
  },
  {
    check_id: "AG22D-05",
    area: "supabase_defer",
    passed: report.supabase_auth_backend_deferred === true,
    note: "Supabase/Auth/backend remains deferred."
  }
];

const failed = checks.filter((c) => c.passed !== true);
if (failed.length) {
  throw new Error(`AG22D audit failed: ${failed.map((c) => c.check_id).join(", ")}`);
}

const audit = {
  module_id: "AG22D",
  title: "Batch Dry-run Audit Report",
  status: "batch_dry_run_audit_passed",
  checks,
  failed_checks: failed,
  summary: {
    audit_passed: true,
    failed_checks: 0,
    candidate_count: manifest.candidates.length,
    deltas_count: deltas.proposed_deltas.length,
    real_execution_done: false,
    supabase_auth_backend_deferred: true
  },
  blocked_state: blockedState
};

const decision = {
  module_id: "AG22D",
  title: "Repeatable Static Publishing Workflow Closure Decision Record",
  status: "batch_dry_run_audit_passed_ready_for_ag22z_closure",
  decision: {
    proceed_to_ag22z_repeatable_static_publishing_workflow_closure: true,
    perform_real_article_generation_now: false,
    perform_article_mutation_now: false,
    perform_github_write_now: false,
    perform_public_visibility_switch_now: false,
    perform_deployment_now: false,
    perform_publishing_now: false,
    activate_supabase_auth_backend_now: false
  },
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG22D",
  title: "Repeatable Static Publishing Workflow Closure Readiness Record",
  status: "ready_for_ag22z_repeatable_static_publishing_workflow_closure",
  ready_for_ag22z: true,
  next_stage_id: "AG22Z",
  next_stage_title: "Repeatable Static Publishing Workflow Closure",
  real_publish_allowed: false,
  supabase_auth_backend_deferred: true,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG22D",
  title: "AG22D to AG22Z Repeatable Static Publishing Workflow Closure Boundary",
  status: "ag22z_boundary_created_not_started",
  next_stage_id: "AG22Z",
  next_stage_title: "Repeatable Static Publishing Workflow Closure",
  allowed_scope: [
    "Close AG22 repeatable publishing workflow.",
    "Summarise AG22A to AG22D outputs.",
    "Record that SOP and batch dry-run are ready.",
    "Keep real publishing blocked until later explicit controlled apply."
  ],
  blocked_scope: blockerC.blocked_items,
  supabase_auth_backend_deferred: true
};

const review = {
  module_id: "AG22D",
  title: "Batch Dry-run Audit",
  status: "batch_dry_run_audit_passed_ready_for_ag22z_closure",
  depends_on: ["AG22C"],
  generated_from: inputs,
  audit_file: outputs.audit,
  decision_file: outputs.decision,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: audit.summary,
  blocked_state: blockedState
};

const registry = {
  module_id: "AG22D",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG22D",
  preview_only: true,
  status: review.status,
  message: "AG22D batch dry-run audit passed. Next: AG22Z workflow closure.",
  blocked_state: blockedState
};

const doc = `# AG22D — Batch Dry-run Audit

## Purpose

AG22D audits the AG22C batch publishing dry-run.

## Audit Result

The dry-run candidate manifest, proposed static paths and proposed public surface deltas passed audit.

## Decision

AG22Z may proceed as Repeatable Static Publishing Workflow Closure.

## Blocked State

No article file creation, article mutation, queue mutation, GitHub token creation, GitHub write, public visibility switch, public index mutation, deployment, live smoke-test, rollback, publishing, or Supabase/Auth/backend activation was performed.

## Next Stage

AG22Z — Repeatable Static Publishing Workflow Closure.
`;

writeJson(outputs.review, review);
writeJson(outputs.audit, audit);
writeJson(outputs.decision, decision);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG22D Batch Dry-run Audit generated.");
console.log("✅ Batch dry-run audit passed.");
console.log("✅ AG22Z Repeatable Static Publishing Workflow Closure boundary created.");
console.log("✅ No mutation, GitHub write, deployment or publishing performed.");
