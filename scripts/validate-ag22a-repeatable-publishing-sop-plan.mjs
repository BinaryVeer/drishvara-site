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
  console.error(`❌ AG22A validation failed: ${msg}`);
  process.exit(1);
}
function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag21z-simplified-closure-after-ag21e-revert.json",
  "data/content-intelligence/closure-records/ag21z-simplified-closure-after-ag21e-revert.json",
  "data/content-intelligence/mutation-plans/ag21z-to-ag22a-first-controlled-static-apply-decision-gate-boundary.json",

  "data/content-intelligence/quality-reviews/ag22a-repeatable-publishing-sop-plan.json",
  "data/content-intelligence/go-live/ag22a-repeatable-publishing-sop-plan.json",
  "data/content-intelligence/go-live/ag22a-source-to-static-publish-route-map.json",
  "data/content-intelligence/go-live/ag22a-batch-publishing-dry-run-scope.json",
  "data/content-intelligence/quality-registry/ag22a-repeatable-publishing-sop-blocker-register.json",
  "data/content-intelligence/quality-registry/ag22a-repeatable-publishing-sop-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag22a-to-ag22b-repeatable-publishing-sop-audit-boundary.json",
  "data/content-intelligence/schema/repeatable-publishing-sop-plan.schema.json",
  "data/content-intelligence/learning/ag22a-repeatable-publishing-sop-plan-learning.json",
  "data/quality/ag22a-repeatable-publishing-sop-plan.json",
  "data/quality/ag22a-repeatable-publishing-sop-plan-preview.json",
  "docs/quality/AG22A_REPEATABLE_PUBLISHING_SOP_PLAN.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

if (exists("data/content-intelligence/quality-reviews/ag21e-controlled-static-apply-execution-confirmation.json")) {
  fail("AG21E file still exists; it should remain reverted.");
}

const ag21z = readJson("data/content-intelligence/quality-reviews/ag21z-simplified-closure-after-ag21e-revert.json");
const ag21zBoundary = readJson("data/content-intelligence/mutation-plans/ag21z-to-ag22a-first-controlled-static-apply-decision-gate-boundary.json");
const review = readJson("data/content-intelligence/quality-reviews/ag22a-repeatable-publishing-sop-plan.json");
const sop = readJson("data/content-intelligence/go-live/ag22a-repeatable-publishing-sop-plan.json");
const route = readJson("data/content-intelligence/go-live/ag22a-source-to-static-publish-route-map.json");
const batch = readJson("data/content-intelligence/go-live/ag22a-batch-publishing-dry-run-scope.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag22a-repeatable-publishing-sop-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag22a-to-ag22b-repeatable-publishing-sop-audit-boundary.json");
const pkg = readJson("package.json");

if (ag21z.status !== "ag21_closed_after_ag21e_revert_ready_for_ag22a_decision_gate") fail("AG21Z not ready.");
if (ag21zBoundary.next_stage_id !== "AG22A") fail("AG21Z boundary must point to AG22A.");

if (review.status !== "repeatable_publishing_sop_plan_created_pending_audit") fail("Review status mismatch.");
if (sop.status !== "repeatable_publishing_sop_plan_created_pending_audit") fail("SOP status mismatch.");
if (route.status !== "route_map_created_no_execution") fail("Route map status mismatch.");
if (batch.status !== "batch_dry_run_scope_defined_no_execution") fail("Batch scope status mismatch.");
if (readiness.ready_for_ag22b !== true) fail("AG22B readiness missing.");
if (boundary.next_stage_id !== "AG22B") fail("AG22B boundary missing.");

for (const [k, v] of Object.entries(sop.blocked_state)) {
  if (v !== false) fail(`Blocked state must remain false: ${k}`);
}

if (!pkg.scripts?.["generate:ag22a"]) fail("Missing generate:ag22a script.");
if (!pkg.scripts?.["validate:ag22a"]) fail("Missing validate:ag22a script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag22a")) fail("validate:project must include validate:ag22a.");
if (pkg.scripts?.["validate:project"]?.includes("validate:ag21e")) fail("validate:project must not include AG21E.");

pass("AG22A SOP plan is present.");
pass("AG22A route map and batch dry-run scope are present.");
pass("AG22A performs no mutation, GitHub write, deployment or publishing.");
pass("AG22B SOP Audit boundary is ready.");
