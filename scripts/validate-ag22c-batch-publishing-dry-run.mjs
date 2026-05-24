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
  console.error(`❌ AG22C validation failed: ${msg}`);
  process.exit(1);
}
function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag22b-repeatable-publishing-sop-audit.json",
  "data/content-intelligence/audit-records/ag22b-repeatable-publishing-sop-audit-report.json",
  "data/content-intelligence/go-live/ag22b-batch-publishing-dry-run-decision-record.json",
  "data/content-intelligence/quality-registry/ag22b-batch-publishing-dry-run-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag22b-to-ag22c-batch-publishing-dry-run-boundary.json",

  "data/content-intelligence/quality-reviews/ag22c-batch-publishing-dry-run.json",
  "data/content-intelligence/go-live/ag22c-batch-publishing-dry-run-report.json",
  "data/content-intelligence/go-live/ag22c-dry-run-candidate-manifest.json",
  "data/content-intelligence/go-live/ag22c-proposed-public-surface-deltas.json",
  "data/content-intelligence/quality-registry/ag22c-batch-publishing-dry-run-blocker-register.json",
  "data/content-intelligence/quality-registry/ag22c-batch-dry-run-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag22c-to-ag22d-batch-dry-run-audit-boundary.json",
  "data/quality/ag22c-batch-publishing-dry-run.json",
  "data/quality/ag22c-batch-publishing-dry-run-preview.json",
  "docs/quality/AG22C_BATCH_PUBLISHING_DRY_RUN.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag22c-batch-publishing-dry-run.json");
const report = readJson("data/content-intelligence/go-live/ag22c-batch-publishing-dry-run-report.json");
const manifest = readJson("data/content-intelligence/go-live/ag22c-dry-run-candidate-manifest.json");
const deltas = readJson("data/content-intelligence/go-live/ag22c-proposed-public-surface-deltas.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag22c-batch-dry-run-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag22c-to-ag22d-batch-dry-run-audit-boundary.json");
const pkg = readJson("package.json");

if (review.status !== "batch_publishing_dry_run_completed_ready_for_ag22d_audit") fail("Review status mismatch.");
if (report.status !== "batch_publishing_dry_run_completed_no_publish") fail("Report status mismatch.");
if (manifest.candidates.length !== 3) fail("Dry-run must include three candidates.");
if (deltas.proposed_deltas.length !== 3) fail("Dry-run must include three public surface delta records.");
if (readiness.ready_for_ag22d !== true) fail("AG22D readiness missing.");
if (boundary.next_stage_id !== "AG22D") fail("AG22D boundary missing.");

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (v !== false) fail(`Blocked state must remain false: ${k}`);
}

if (!pkg.scripts?.["generate:ag22c"]) fail("Missing generate:ag22c script.");
if (!pkg.scripts?.["validate:ag22c"]) fail("Missing validate:ag22c script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag22c")) fail("validate:project must include validate:ag22c.");

pass("AG22C batch dry-run is present.");
pass("AG22C includes three dry-run candidates.");
pass("AG22C created proposed paths and surface deltas as plan-only.");
pass("AG22D Batch Dry-run Audit boundary is ready.");
pass("No mutation, GitHub write, deployment or publishing is enabled.");
