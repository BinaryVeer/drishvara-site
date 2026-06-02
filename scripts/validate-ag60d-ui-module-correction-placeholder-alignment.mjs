import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) {
  console.error(`❌ AG60D validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "index.html",
  "data/content-intelligence/quality-reviews/ag60c-storage-persistence-verification.json",
  "data/content-intelligence/quality-reviews/ag60d-ui-module-correction-placeholder-alignment.json",
  "data/content-intelligence/phase-01-modules/ag60d-source-consumption-record.json",
  "data/content-intelligence/phase-01-modules/ag60d-ui-module-correction-apply-record.json",
  "data/content-intelligence/phase-01-modules/ag60d-visible-copy-correction-record.json",
  "data/content-intelligence/phase-01-modules/ag60d-placeholder-alignment-record.json",
  "data/content-intelligence/phase-01-modules/ag60d-methodology-gate-preservation-record.json",
  "data/content-intelligence/quality-registry/ag60d-ag60e-live-module-recheck-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag60d-to-ag60e-live-module-recheck-boundary.json",
  "data/content-intelligence/backend-architecture/ag60d-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag60d-no-v02-expansion-audit.json",
  "data/quality/ag60d-ui-module-correction-placeholder-alignment.json",
  "data/quality/ag60d-ui-module-correction-placeholder-alignment-preview.json",
  "docs/quality/AG60D_UI_MODULE_CORRECTION_PLACEHOLDER_ALIGNMENT.md",
  "scripts/generate-ag60d-ui-module-correction-placeholder-alignment.mjs",
  "scripts/validate-ag60d-ui-module-correction-placeholder-alignment.mjs"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag60d"]) fail("Missing generate:ag60d script.");
if (!pkg.scripts?.["validate:ag60d"]) fail("Missing validate:ag60d script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag60d")) fail("validate:project must include validate:ag60d.");

const index = read("index.html");
for (const oldText of [
  "First Light — 24 Hrs across India",
  "UI STEP 3 INTEGRATION",
  "Integrated UI Step 3",
  "From signal to reading to reflection"
]) {
  if (index.includes(oldText)) fail(`Old visible copy still present in index: ${oldText}`);
}

for (const requiredText of [
  "Discover → Read → Reflect",
  "From daily signals to deeper reading and reflection",
  "First Light — 10 Daily Signals",
  "data-drishvara-ag60d-placeholder-alignment=\"true\""
]) {
  if (!index.includes(requiredText)) fail(`Required corrected text missing: ${requiredText}`);
}

const ag60c = readJson("data/content-intelligence/quality-reviews/ag60c-storage-persistence-verification.json");
if (ag60c.status !== "storage_persistence_verification_recorded") fail("AG60C status mismatch.");

const review = readJson("data/content-intelligence/quality-reviews/ag60d-ui-module-correction-placeholder-alignment.json");
const apply = readJson("data/content-intelligence/phase-01-modules/ag60d-ui-module-correction-apply-record.json");
const visible = readJson("data/content-intelligence/phase-01-modules/ag60d-visible-copy-correction-record.json");
const placeholder = readJson("data/content-intelligence/phase-01-modules/ag60d-placeholder-alignment-record.json");
const methodology = readJson("data/content-intelligence/phase-01-modules/ag60d-methodology-gate-preservation-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag60d-ag60e-live-module-recheck-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag60d-to-ag60e-live-module-recheck-boundary.json");
const preview = readJson("data/quality/ag60d-ui-module-correction-placeholder-alignment-preview.json");

if (review.status !== "ui_module_correction_placeholder_alignment_applied") fail("AG60D review status mismatch.");
if (review.summary.ui_module_correction_applied !== true) fail("UI correction summary missing.");
if (review.summary.first_light_heading_aligned !== true) fail("First Light alignment summary missing.");
if (review.summary.placeholder_alignment_applied !== true) fail("Placeholder alignment summary missing.");
if (review.summary.methodology_gates_preserved !== true) fail("Methodology preservation summary missing.");
if (review.summary.ready_for_ag60e !== true) fail("AG60E readiness summary missing.");

if (apply.audit_passed !== true) fail("Apply record must pass.");
if (!apply.corrections.some((c) => c.includes("First Light"))) fail("First Light correction missing.");
if (!visible.forbidden_results.every((r) => r.passed === true)) fail("Forbidden visible copy check failed.");
if (!visible.required_results.every((r) => r.passed === true)) fail("Required visible copy check failed.");
if (placeholder.audit_passed !== true) fail("Placeholder alignment record must pass.");
if (methodology.audit_passed !== true) fail("Methodology preservation must pass.");
if (readiness.ready_for_ag60e !== true) fail("AG60E readiness missing.");
if (boundary.status !== "ag60e_live_module_recheck_boundary_created") fail("AG60E boundary mismatch.");

for (const f of [
  "data/content-intelligence/backend-architecture/ag60d-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag60d-no-v02-expansion-audit.json"
]) {
  const audit = readJson(f);
  if (audit.audit_passed !== true) fail(`${f} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${f} failed checks must be zero.`);
}

if (preview.ready_for_ag60e !== 1) fail("Preview AG60E readiness missing.");
if (preview.backend_runtime_activated !== 0) fail("Preview backend runtime must be zero.");

pass("AG60D UI / Module Correction and Placeholder Alignment is present.");
pass("First Light heading and legacy labels are corrected.");
pass("Placeholder alignment and methodology gates are preserved.");
pass("No backend/runtime/service-role/V02 action is recorded.");
pass("AG60E Live Module Recheck readiness is valid.");
