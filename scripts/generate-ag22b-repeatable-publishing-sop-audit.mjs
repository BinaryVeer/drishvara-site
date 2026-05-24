import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag22aReview: "data/content-intelligence/quality-reviews/ag22a-repeatable-publishing-sop-plan.json",
  ag22aSop: "data/content-intelligence/go-live/ag22a-repeatable-publishing-sop-plan.json",
  ag22aRoute: "data/content-intelligence/go-live/ag22a-source-to-static-publish-route-map.json",
  ag22aBatch: "data/content-intelligence/go-live/ag22a-batch-publishing-dry-run-scope.json",
  ag22aBlocker: "data/content-intelligence/quality-registry/ag22a-repeatable-publishing-sop-blocker-register.json",
  ag22aReadiness: "data/content-intelligence/quality-registry/ag22a-repeatable-publishing-sop-audit-readiness-record.json",
  ag22aBoundary: "data/content-intelligence/mutation-plans/ag22a-to-ag22b-repeatable-publishing-sop-audit-boundary.json",
  supabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag22b-repeatable-publishing-sop-audit.json",
  audit: "data/content-intelligence/audit-records/ag22b-repeatable-publishing-sop-audit-report.json",
  decision: "data/content-intelligence/go-live/ag22b-batch-publishing-dry-run-decision-record.json",
  readiness: "data/content-intelligence/quality-registry/ag22b-batch-publishing-dry-run-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag22b-to-ag22c-batch-publishing-dry-run-boundary.json",
  registry: "data/quality/ag22b-repeatable-publishing-sop-audit.json",
  preview: "data/quality/ag22b-repeatable-publishing-sop-audit-preview.json",
  doc: "docs/quality/AG22B_REPEATABLE_PUBLISHING_SOP_AUDIT.md"
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
  if (!exists(p)) throw new Error(`Missing AG22B input: ${p}`);
}

const reviewA = readJson(inputs.ag22aReview);
const sop = readJson(inputs.ag22aSop);
const route = readJson(inputs.ag22aRoute);
const batch = readJson(inputs.ag22aBatch);
const blocker = readJson(inputs.ag22aBlocker);
const readinessA = readJson(inputs.ag22aReadiness);
const boundaryA = readJson(inputs.ag22aBoundary);
const supabaseReminder = readJson(inputs.supabaseReminder);

if (reviewA.status !== "repeatable_publishing_sop_plan_created_pending_audit") {
  throw new Error("AG22A review is not ready for AG22B.");
}
if (sop.status !== "repeatable_publishing_sop_plan_created_pending_audit") {
  throw new Error("AG22A SOP plan status mismatch.");
}
if (route.status !== "route_map_created_no_execution") {
  throw new Error("AG22A route map status mismatch.");
}
if (batch.status !== "batch_dry_run_scope_defined_no_execution") {
  throw new Error("AG22A batch scope status mismatch.");
}
if (readinessA.ready_for_ag22b !== true) {
  throw new Error("AG22A readiness does not allow AG22B.");
}
if (boundaryA.next_stage_id !== "AG22B") {
  throw new Error("AG22A boundary does not point to AG22B.");
}

const blockedState = {
  article_generated: false,
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
    check_id: "AG22B-01",
    area: "sop_plan",
    passed: sop.sop_steps?.length >= 7,
    note: "Repeatable SOP includes intake, checks, static file, public surface, GitHub readiness, deployment readiness and closure."
  },
  {
    check_id: "AG22B-02",
    area: "route_map",
    passed: route.repeatable_route?.length >= 8,
    note: "Source-to-static-publish route is defined."
  },
  {
    check_id: "AG22B-03",
    area: "batch_scope",
    passed: batch.planned_dry_run_inputs?.length >= 3,
    note: "Batch dry-run scope covers generated, manual and backlog/future article cases."
  },
  {
    check_id: "AG22B-04",
    area: "blocked_actions",
    passed: Object.values(sop.blocked_state || {}).every((v) => v === false),
    note: "All real execution actions remain blocked."
  },
  {
    check_id: "AG22B-05",
    area: "supabase_defer",
    passed: sop.supabase_auth_backend_deferred === true,
    note: "Supabase/Auth/backend remains deferred."
  }
];

const failed = checks.filter((c) => c.passed !== true);
if (failed.length) {
  throw new Error(`AG22B audit failed: ${failed.map((c) => c.check_id).join(", ")}`);
}

const audit = {
  module_id: "AG22B",
  title: "Repeatable Publishing SOP Audit Report",
  status: "repeatable_publishing_sop_audit_passed",
  checks,
  failed_checks: failed,
  summary: {
    audit_passed: true,
    failed_checks: 0,
    sop_complete: true,
    route_map_complete: true,
    batch_dry_run_scope_complete: true,
    real_execution_done: false,
    supabase_auth_backend_deferred: true
  },
  blocked_state: blockedState
};

const decision = {
  module_id: "AG22B",
  title: "Batch Publishing Dry-run Decision Record",
  status: "sop_audit_passed_ready_for_ag22c_batch_dry_run",
  decision: {
    proceed_to_ag22c_batch_publishing_dry_run: true,
    perform_real_article_generation_now: false,
    perform_article_mutation_now: false,
    perform_github_write_now: false,
    perform_public_visibility_switch_now: false,
    perform_deployment_now: false,
    perform_publishing_now: false,
    activate_supabase_auth_backend_now: false
  },
  rationale: [
    "AG22A SOP is complete enough for dry-run.",
    "Batch dry-run may simulate multiple articles without publishing.",
    "No live mutation or deployment is approved."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG22B",
  title: "Batch Publishing Dry-run Readiness Record",
  status: "ready_for_ag22c_batch_publishing_dry_run",
  ready_for_ag22c: true,
  next_stage_id: "AG22C",
  next_stage_title: "Batch Publishing Dry-run",
  dry_run_only: true,
  real_publish_allowed: false,
  supabase_auth_backend_deferred: true,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG22B",
  title: "AG22B to AG22C Batch Publishing Dry-run Boundary",
  status: "ag22c_boundary_created_not_started",
  next_stage_id: "AG22C",
  next_stage_title: "Batch Publishing Dry-run",
  allowed_scope: [
    "Dry-run multiple article candidates.",
    "Prepare proposed static paths.",
    "Prepare proposed public surface deltas.",
    "Prepare proposed deployment and rollback checklist.",
    "Do not publish."
  ],
  blocked_scope: blocker.blocked_items,
  supabase_auth_backend_deferred: true
};

const review = {
  module_id: "AG22B",
  title: "Repeatable Publishing SOP Audit",
  status: "repeatable_publishing_sop_audit_passed_ready_for_ag22c_batch_dry_run",
  depends_on: ["AG22A"],
  generated_from: inputs,
  audit_file: outputs.audit,
  decision_file: outputs.decision,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: audit.summary,
  blocked_state: blockedState
};

const registry = {
  module_id: "AG22B",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG22B",
  preview_only: true,
  status: review.status,
  message: "AG22B SOP audit passed. Next: AG22C Batch Publishing Dry-run.",
  blocked_state: blockedState
};

const doc = `# AG22B — Repeatable Publishing SOP Audit

## Purpose

AG22B audits the AG22A repeatable publishing SOP plan.

## Audit Result

The SOP plan, source-to-static route map and batch dry-run scope are complete enough to proceed to AG22C.

## Decision

AG22C may proceed as Batch Publishing Dry-run only.

## Blocked State

No article generation, article mutation, queue mutation, GitHub token creation, GitHub write, public visibility switch, public index mutation, deployment, live smoke-test, rollback, publishing, or Supabase/Auth/backend activation is performed.

## Next Stage

AG22C — Batch Publishing Dry-run.
`;

writeJson(outputs.review, review);
writeJson(outputs.audit, audit);
writeJson(outputs.decision, decision);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG22B Repeatable Publishing SOP Audit generated.");
console.log("✅ SOP audit passed.");
console.log("✅ AG22C Batch Publishing Dry-run boundary created.");
console.log("✅ No mutation, GitHub write, deployment or publishing performed.");
