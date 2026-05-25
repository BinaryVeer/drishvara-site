import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(p) {
  return fs.existsSync(path.join(root, p));
}
function readJson(p) {
  return JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
}
function fail(msg) {
  console.error(`❌ AG22D validation failed: ${msg}`);
  process.exit(1);
}
function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag22c-batch-publishing-dry-run.json",
  "data/content-intelligence/go-live/ag22c-batch-publishing-dry-run-report.json",
  "data/content-intelligence/go-live/ag22c-dry-run-candidate-manifest.json",
  "data/content-intelligence/go-live/ag22c-proposed-public-surface-deltas.json",
  "data/content-intelligence/quality-registry/ag22c-batch-dry-run-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag22c-to-ag22d-batch-dry-run-audit-boundary.json",

  "data/content-intelligence/quality-reviews/ag22d-batch-dry-run-audit.json",
  "data/content-intelligence/audit-records/ag22d-batch-dry-run-audit-report.json",
  "data/content-intelligence/go-live/ag22d-repeatable-static-publishing-workflow-closure-decision-record.json",
  "data/content-intelligence/quality-registry/ag22d-repeatable-static-publishing-workflow-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag22d-to-ag22z-repeatable-static-publishing-workflow-closure-boundary.json",
  "data/quality/ag22d-batch-dry-run-audit.json",
  "data/quality/ag22d-batch-dry-run-audit-preview.json",
  "docs/quality/AG22D_BATCH_DRY_RUN_AUDIT.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag22d-batch-dry-run-audit.json");
const audit = readJson("data/content-intelligence/audit-records/ag22d-batch-dry-run-audit-report.json");
const decision = readJson("data/content-intelligence/go-live/ag22d-repeatable-static-publishing-workflow-closure-decision-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag22d-repeatable-static-publishing-workflow-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag22d-to-ag22z-repeatable-static-publishing-workflow-closure-boundary.json");
const pkg = readJson("package.json");

if (review.status !== "batch_dry_run_audit_passed_ready_for_ag22z_closure") fail("Review status mismatch.");
if (audit.status !== "batch_dry_run_audit_passed") fail("Audit status mismatch.");
if (audit.failed_checks.length !== 0) fail("Audit failed checks must be zero.");
if (batch_dry_run_audit_passed_ready_for_ag22z_closure") fail("Review status mismatch.");
if (audit.status !== "batch_dry_run_audit_passed") fail("Auditdecision.decision.proceed_to_ag22z_repeatable_static_publishing_workflow_closure !== true) fail("AG22Z decision missing.");
if (readiness.ready_for_ag22z !== true) fail("AG22Z readiness missing.");
if (boundary.next_stage_id !== "AG22Z") fail("AG22Z boundary missing.");

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (v !== false) fail(`Blocked state must remain false: ${k}`);
}

if (!pkg.scripts?.["generate:ag22d"]) fail("Missing generate:ag22d script.");
if (!pkg.scripts?.["validate:ag22d"]) fail("Missing validate:ag22d script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag22d")) fail("validate:project must include validate:ag22d.");

pass("AG22D batch dry-run audit is present.");
pass("AG22D audit passed with zero failed checks.");
pass("AG22Z workflow closure boundary is ready.");
pass("No mutation, GitHub write, deployment or publishing is enabled.");
