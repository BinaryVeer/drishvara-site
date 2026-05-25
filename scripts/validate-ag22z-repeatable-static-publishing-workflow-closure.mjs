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
  console.error(`❌ AG22Z validation failed: ${msg}`);
  process.exit(1);
}
function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag22a-repeatable-publishing-sop-plan.json",
  "data/content-intelligence/quality-reviews/ag22b-repeatable-publishing-sop-audit.json",
  "data/content-intelligence/quality-reviews/ag22c-batch-publishing-dry-run.json",
  "data/content-intelligence/quality-reviews/ag22d-batch-dry-run-audit.json",
  "data/content-intelligence/audit-records/ag22d-batch-dry-run-audit-report.json",
  "data/content-intelligence/go-live/ag22d-repeatable-static-publishing-workflow-closure-decision-record.json",
  "data/content-intelligence/quality-registry/ag22d-repeatable-static-publishing-workflow-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag22d-to-ag22z-repeatable-static-publishing-workflow-closure-boundary.json",

  "data/content-intelligence/quality-reviews/ag22z-repeatable-static-publishing-workflow-closure.json",
  "data/content-intelligence/closure-records/ag22z-repeatable-static-publishing-workflow-closure.json",
  "data/content-intelligence/go-live/ag22z-repeatable-static-publishing-workflow-summary.json",
  "data/content-intelligence/quality-registry/ag22z-first-controlled-static-publish-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag22z-to-ag23a-first-controlled-static-publish-candidate-gate-boundary.json",
  "data/quality/ag22z-repeatable-static-publishing-workflow-closure.json",
  "data/quality/ag22z-repeatable-static-publishing-workflow-closure-preview.json",
  "docs/quality/AG22Z_REPEATABLE_STATIC_PUBLISHING_WORKFLOW_CLOSURE.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag22z-repeatable-static-publishing-workflow-closure.json");
const closure = readJson("data/content-intelligence/closure-records/ag22z-repeatable-static-publishing-workflow-closure.json");
const summary = readJson("data/content-intelligence/go-live/ag22z-repeatable-static-publishing-workflow-summary.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag22z-first-controlled-static-publish-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag22z-to-ag23a-first-controlled-static-publish-candidate-gate-boundary.json");
const pkg = readJson("package.json");

if (review.status !== "ag22_repeatable_static_publishing_workflow_closed_ready_for_ag23a_candidate_gate") fail("Review status mismatch.");
if (closure.closure_decision.ag22_closed !== true) fail("AG22 closure missing.");
if (closure.closure_decision.proceed_to_ag23a_first_controlled_static_publish_candidate_gate !== true) fail("AG23A handoff missing.");
if (summary.result.workflow_ready_for_first_controlled_static_publish_candidate_gate !== true) fail("Workflow readiness missing.");
if (readiness.ready_for_ag23a !== true) fail("AG23A readiness missing.");
if (boundary.next_stage_id !== "AG23A") fail("AG23A boundary missing.");

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (v !== false) fail(`Blocked state must remain false: ${k}`);
}

if (!pkg.scripts?.["generate:ag22z"]) fail("Missing generate:ag22z script.");
if (!pkg.scripts?.["validate:ag22z"]) fail("Missing validate:ag22z script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag22z")) fail("validate:project must include validate:ag22z.");

pass("AG22Z workflow closure is present.");
pass("AG22A to AG22D chain is closed.");
pass("AG23A First Controlled Static Publish Candidate Gate boundary is ready.");
pass("No mutation, GitHub write, deployment or publishing is enabled.");
