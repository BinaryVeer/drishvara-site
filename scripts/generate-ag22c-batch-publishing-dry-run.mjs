import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag22bReview: "data/content-intelligence/quality-reviews/ag22b-repeatable-publishing-sop-audit.json",
  ag22bAudit: "data/content-intelligence/audit-records/ag22b-repeatable-publishing-sop-audit-report.json",
  ag22bDecision: "data/content-intelligence/go-live/ag22b-batch-publishing-dry-run-decision-record.json",
  ag22bReadiness: "data/content-intelligence/quality-registry/ag22b-batch-publishing-dry-run-readiness-record.json",
  ag22bBoundary: "data/content-intelligence/mutation-plans/ag22b-to-ag22c-batch-publishing-dry-run-boundary.json",
  ag22aBatchScope: "data/content-intelligence/go-live/ag22a-batch-publishing-dry-run-scope.json",
  supabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag22c-batch-publishing-dry-run.json",
  dryRunReport: "data/content-intelligence/go-live/ag22c-batch-publishing-dry-run-report.json",
  candidateManifest: "data/content-intelligence/go-live/ag22c-dry-run-candidate-manifest.json",
  publicSurfaceDeltas: "data/content-intelligence/go-live/ag22c-proposed-public-surface-deltas.json",
  blocker: "data/content-intelligence/quality-registry/ag22c-batch-publishing-dry-run-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag22c-batch-dry-run-audit-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag22c-to-ag22d-batch-dry-run-audit-boundary.json",
  registry: "data/quality/ag22c-batch-publishing-dry-run.json",
  preview: "data/quality/ag22c-batch-publishing-dry-run-preview.json",
  doc: "docs/quality/AG22C_BATCH_PUBLISHING_DRY_RUN.md"
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
  if (!exists(p)) throw new Error(`Missing AG22C input: ${p}`);
}

const ag22bReview = readJson(inputs.ag22bReview);
const ag22bAudit = readJson(inputs.ag22bAudit);
const ag22bDecision = readJson(inputs.ag22bDecision);
const ag22bReadiness = readJson(inputs.ag22bReadiness);
const ag22bBoundary = readJson(inputs.ag22bBoundary);
const ag22aBatchScope = readJson(inputs.ag22aBatchScope);
const supabaseReminder = readJson(inputs.supabaseReminder);

if (ag22bReview.status !== "repeatable_publishing_sop_audit_passed_ready_for_ag22c_batch_dry_run") {
  throw new Error("AG22B review is not ready for AG22C.");
}
if (ag22bAudit.failed_checks.length !== 0) {
  throw new Error("AG22B audit has failed checks.");
}
if (ag22bDecision.decision.proceed_to_ag22c_batch_publishing_dry_run !== true) {
  throw new Error("AG22B decision does not allow AG22C.");
}
if (ag22bReadiness.ready_for_ag22c !== true) {
  throw new Error("AG22B readiness does not allow AG22C.");
}
if (ag22bBoundary.next_stage_id !== "AG22C") {
  throw new Error("AG22B boundary does not point to AG22C.");
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

const candidates = [
  {
    dry_run_id: "AG22C-DRY-001",
    source_type: "generated_article_candidate",
    working_title: "Generated Article Candidate — Governance and Public Systems",
    proposed_static_path: "public/featured-reads/governance-public-systems-dry-run.html",
    proposed_category: "public_programmes",
    dry_run_only: true,
    create_file_now: false,
    publish_now: false
  },
  {
    dry_run_id: "AG22C-DRY-002",
    source_type: "manual_article_candidate",
    working_title: "Manual Article Candidate — Vedic Learning Series",
    proposed_static_path: "public/featured-reads/vedic-learning-series-dry-run.html",
    proposed_category: "spirituality",
    dry_run_only: true,
    create_file_now: false,
    publish_now: false
  },
  {
    dry_run_id: "AG22C-DRY-003",
    source_type: "future_series_article_candidate",
    working_title: "Future Series Candidate — Weekly Explainer Episode",
    proposed_static_path: "public/featured-reads/weekly-explainer-episode-dry-run.html",
    proposed_category: "education_series",
    dry_run_only: true,
    create_file_now: false,
    publish_now: false
  }
];

const candidateManifest = {
  module_id: "AG22C",
  title: "Dry-run Candidate Manifest",
  status: "candidate_manifest_created_no_files_written",
  source_scope_from_ag22a: ag22aBatchScope.planned_dry_run_inputs,
  candidates,
  dry_run_only: true,
  blocked_state: blockedState
};

const publicSurfaceDeltas = {
  module_id: "AG22C",
  title: "Proposed Public Surface Deltas",
  status: "public_surface_deltas_planned_no_mutation",
  proposed_deltas: candidates.map((c) => ({
    dry_run_id: c.dry_run_id,
    featured_reads_index_delta: `Would add card for ${c.working_title}`,
    category_listing_delta: `Would add listing under ${c.proposed_category}`,
    homepage_delta: "Conditional; no homepage mutation in dry-run.",
    sitemap_feed_search_delta: "Conditional; no sitemap/feed/search mutation in dry-run.",
    mutate_now: false
  })),
  blocked_state: blockedState
};

const dryRunReport = {
  module_id: "AG22C",
  title: "Batch Publishing Dry-run Report",
  status: "batch_publishing_dry_run_completed_no_publish",
  dry_run_only: true,
  candidate_count: candidates.length,
  dry_run_result: {
    proposed_static_paths_created_as_plan_only: true,
    proposed_public_surface_deltas_created_as_plan_only: true,
    github_write_performed: false,
    deployment_triggered: false,
    live_smoke_test_performed: false,
    published: false
  },
  next_expected_stage: "AG22D",
  next_expected_stage_title: "Batch Dry-run Audit",
  supabase_auth_backend_deferred: true,
  supabase_reminder: supabaseReminder.reminder,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG22C",
  title: "Batch Publishing Dry-run Blocker Register",
  status: "batch_dry_run_operations_blocked_pending_ag22d_audit",
  blocked_items: [
    "No article file creation.",
    "No article mutation.",
    "No queue mutation.",
    "No GitHub token creation.",
    "No GitHub write.",
    "No public visibility switch.",
    "No public index mutation.",
    "No deployment trigger.",
    "No live smoke-test.",
    "No rollback execution.",
    "No publishing.",
    "No Supabase/Auth/backend activation."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG22C",
  title: "Batch Dry-run Audit Readiness Record",
  status: "ready_for_ag22d_batch_dry_run_audit",
  ready_for_ag22d: true,
  next_stage_id: "AG22D",
  next_stage_title: "Batch Dry-run Audit",
  candidate_count: candidates.length,
  dry_run_completed: true,
  real_publish_allowed: false,
  supabase_auth_backend_deferred: true,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG22C",
  title: "AG22C to AG22D Batch Dry-run Audit Boundary",
  status: "ag22d_boundary_created_not_started",
  next_stage_id: "AG22D",
  next_stage_title: "Batch Dry-run Audit",
  allowed_scope: [
    "Audit dry-run candidate manifest.",
    "Audit proposed static paths.",
    "Audit proposed public surface deltas.",
    "Confirm no file mutation, GitHub write, deployment or publishing occurred."
  ],
  blocked_scope: blocker.blocked_items,
  supabase_auth_backend_deferred: true
};

const review = {
  module_id: "AG22C",
  title: "Batch Publishing Dry-run",
  status: "batch_publishing_dry_run_completed_ready_for_ag22d_audit",
  depends_on: ["AG22B"],
  generated_from: inputs,
  dry_run_report_file: outputs.dryRunReport,
  candidate_manifest_file: outputs.candidateManifest,
  public_surface_deltas_file: outputs.publicSurfaceDeltas,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    dry_run_completed: true,
    candidate_count: candidates.length,
    real_execution_done: false,
    ready_for_ag22d: true,
    supabase_auth_backend_deferred: true
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG22C",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG22C",
  preview_only: true,
  status: review.status,
  message: "AG22C batch dry-run completed without publishing. Next: AG22D Batch Dry-run Audit.",
  candidate_count: candidates.length,
  blocked_state: blockedState
};

const doc = `# AG22C — Batch Publishing Dry-run

## Purpose

AG22C dry-runs multiple article candidates through the repeatable static publishing workflow.

## Dry-run Candidates

Three dry-run candidates were simulated:

1. Generated article candidate.
2. Manual article candidate.
3. Future-series article candidate.

## Dry-run Result

Proposed static paths and proposed public surface deltas were created as planning records only.

No article file was created. No GitHub token was created. No GitHub write, public visibility switch, public index mutation, deployment, live smoke-test, rollback, publishing, or Supabase/Auth/backend activation was performed.

## Next Stage

AG22D — Batch Dry-run Audit.
`;

writeJson(outputs.review, review);
writeJson(outputs.dryRunReport, dryRunReport);
writeJson(outputs.candidateManifest, candidateManifest);
writeJson(outputs.publicSurfaceDeltas, publicSurfaceDeltas);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG22C Batch Publishing Dry-run generated.");
console.log("✅ Three dry-run candidates simulated.");
console.log("✅ Proposed static paths and public surface deltas recorded as plan-only.");
console.log("✅ No file mutation, GitHub write, deployment or publishing performed.");
console.log("✅ AG22D Batch Dry-run Audit boundary created.");
