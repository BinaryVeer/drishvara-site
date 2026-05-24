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
  console.error(`❌ AG22B validation failed: ${msg}`);
  process.exit(1);
}
function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag22a-repeatable-publishing-sop-plan.json",
  "data/content-intelligence/go-live/ag22a-repeatable-publishing-sop-plan.json",
  "data/content-intelligence/go-live/ag22a-source-to-static-publish-route-map.json",
  "data/content-intelligence/go-live/ag22a-batch-publishing-dry-run-scope.json",
  "data/content-intelligence/mutation-plans/ag22a-to-ag22b-repeatable-publishing-sop-audit-boundary.json",

  "data/content-intelligence/quality-reviews/ag22b-repeatable-publishing-sop-audit.json",
  "data/content-intelligence/audit-records/ag22b-repeatable-publishing-sop-audit-report.json",
  "data/content-intelligence/go-live/ag22b-batch-publishing-dry-run-decision-record.json",
  "data/content-intelligence/quality-registry/ag22b-batch-publishing-dry-run-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag22b-to-ag22c-batch-publishing-dry-run-boundary.json",
  "data/quality/ag22b-repeatable-publishing-sop-audit.json",
  "data/quality/ag22b-repeatable-publishing-sop-audit-preview.json",
  "docs/quality/AG22B_REPEATABLE_PUBLISHING_SOP_AUDIT.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag22b-repeatable-publishing-sop-audit.json");
const audit = readJson("data/content-intelligence/audit-records/ag22b-repeatable-publishing-sop-audit-report.json");
const decision = readJson("data/content-intelligence/go-live/ag22b-batch-publishing-dry-run-decision-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag22b-batch-publishing-dry-run-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag22b-to-ag22c-batch-publishing-dry-run-boundary.json");
const pkg = readJson("package.json");

if (review.status !== "repeatable_publishing_sop_audit_passed_ready_for_ag22c_batch_dry_run") fail("Review status mismatch.");
if (audit.status !== "repeatable_publishing_sop_audit_passed") fail("Audit status mismatch.");
if (audit.failed_checks.length !== 0) fail("Audit failed checks must be zero.");
if (decision.decision.proceed_to_ag22c_batch_publishing_dry_run !== true) fail("AG22C decision missing.");
if (readiness.ready_for_ag22c !== true) fail("AG22C readiness missing.");
if (boundary.next_stage_id !== "AG22C") fail("AG22C boundary missing.");

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (v !== false) fail(`Blocked state must remain false: ${k}`);
}

if (!pkg.scripts?.["generate:ag22b"]) fail("Missing generate:ag22b script.");
if (!pkg.scripts?.["validate:ag22b"]) fail("Missing validate:ag22b script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag22b")) fail("validate:project must include validate:ag22b.");

pass("AG22B SOP audit is present.");
pass("AG22B audit passed with zero failed checks.");
pass("AG22C Batch Publishing Dry-run boundary is ready.");
pass("No mutation, GitHub write, deployment or publishing is enabled.");
