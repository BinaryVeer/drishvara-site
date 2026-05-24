import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function fail(msg) {
  console.error(`❌ AG21Z validation failed: ${msg}`);
  process.exit(1);
}
function pass(msg) {
  console.log(`✅ ${msg}`);
}
function exists(p) {
  return fs.existsSync(path.join(root, p));
}
function readJson(p) {
  return JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
}

const required = [
  "data/content-intelligence/quality-reviews/ag21d-controlled-static-apply-execution-readiness-audit.json",
  "data/content-intelligence/quality-reviews/ag21z-simplified-closure-after-ag21e-revert.json",
  "data/content-intelligence/closure-records/ag21z-simplified-closure-after-ag21e-revert.json",
  "data/content-intelligence/mutation-plans/ag21z-to-ag22a-first-controlled-static-apply-decision-gate-boundary.json",
  "data/quality/ag21z-simplified-closure-after-ag21e-revert.json",
  "data/quality/ag21z-simplified-closure-after-ag21e-revert-preview.json",
  "docs/quality/AG21Z_SIMPLIFIED_CLOSURE_AFTER_AG21E_REVERT.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

if (exists("data/content-intelligence/quality-reviews/ag21e-controlled-static-apply-execution-confirmation.json")) {
  fail("AG21E file still exists after revert.");
}

const review = readJson("data/content-intelligence/quality-reviews/ag21z-simplified-closure-after-ag21e-revert.json");
const closure = readJson("data/content-intelligence/closure-records/ag21z-simplified-closure-after-ag21e-revert.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag21z-to-ag22a-first-controlled-static-apply-decision-gate-boundary.json");
const pkg = readJson("package.json");

if (review.status !== "ag21_closed_after_ag21e_revert_ready_for_ag22a_decision_gate") fail("Review status mismatch.");
if (closure.final_decision.ag21_closed !== true) fail("AG21 closure not confirmed.");
if (closure.final_decision.proceed_to_ag21e !== false) fail("AG21E must remain stopped.");
if (closure.final_decision.execute_real_apply_now !== false) fail("Real apply must remain blocked.");
if (boundary.next_stage_id !== "AG22A") fail("Next stage must be AG22A.");
if (!pkg.scripts?.["validate:ag21z"]) fail("Missing validate:ag21z script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag21z")) fail("validate:project must include AG21Z.");
if (pkg.scripts?.["validate:project"]?.includes("validate:ag21e")) fail("validate:project must not include AG21E after revert.");

pass("AG21E revert is acknowledged.");
pass("AG21Z simplified closure is valid.");
pass("AG21 is closed from AG21D.");
pass("AG22A decision gate boundary is ready.");
pass("No real apply or publishing is enabled.");
