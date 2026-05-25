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
  console.error(`❌ AG23I validation failed: ${msg}`);
  process.exit(1);
}
function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag23h-homepage-daily-surface-scaffold.json",
  "data/content-intelligence/quality-reviews/ag23i-homepage-daily-surface-audit.json",
  "data/content-intelligence/audit-records/ag23i-homepage-daily-surface-audit-report.json",
  "data/content-intelligence/go-live/ag23i-homepage-daily-surface-and-first-light-closure-decision-record.json",
  "data/content-intelligence/quality-registry/ag23i-homepage-daily-surface-and-first-light-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag23i-to-ag23z-homepage-daily-surface-and-first-light-closure-boundary.json",
  "data/quality/ag23i-homepage-daily-surface-audit.json",
  "data/quality/ag23i-homepage-daily-surface-audit-preview.json",
  "docs/quality/AG23I_HOMEPAGE_DAILY_SURFACE_AUDIT.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag23i-homepage-daily-surface-audit.json");
const audit = readJson("data/content-intelligence/audit-records/ag23i-homepage-daily-surface-audit-report.json");
const decision = readJson("data/content-intelligence/go-live/ag23i-homepage-daily-surface-and-first-light-closure-decision-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag23i-homepage-daily-surface-and-first-light-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag23i-to-ag23z-homepage-daily-surface-and-first-light-closure-boundary.json");
const pkg = readJson("package.json");

if (review.status !== "homepage_daily_surface_audit_passed_ready_for_ag23z_closure") fail("Review status mismatch.");
if (audit.status !== "homepage_daily_surface_audit_passed") fail("Audit status mismatch.");
if (!Array.isArray(audit.failed_checks) || audit.failed_checks.length !== 0) fail("Audit failed checks must be zero.");
if (decision.decision.proceed_to_ag23z_homepage_daily_surface_and_first_light_closure !== true) fail("AG23Z decision missing.");
if (readiness.ready_for_ag23z !== true) fail("AG23Z readiness missing.");
if (boundary.next_stage_id !== "AG23Z") fail("AG23Z boundary missing.");

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (v !== false) fail(`Blocked state must remain false: ${k}`);
}

if (!pkg.scripts?.["generate:ag23i"]) fail("Missing generate:ag23i script.");
if (!pkg.scripts?.["validate:ag23i"]) fail("Missing validate:ag23i script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag23i")) fail("validate:project must include validate:ag23i.");

pass("AG23I Homepage Daily Surface Audit is present.");
pass("AG23I audit passed with zero failed checks.");
pass("AG23Z Homepage Daily Surface and First Light Closure boundary is ready.");
pass("No runtime write, homepage mutation, GitHub write, deployment or publishing is enabled.");
