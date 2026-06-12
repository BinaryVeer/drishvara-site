import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG73D validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "index.html",
  "generated/star-reflection-active-result-data.json",
  "data/methodology/star-reflection/ag73d-star-reflection-active-result-ui-wiring.json",
  "data/methodology/star-reflection/ag73d-star-reflection-active-result-ui-validation-report.json",
  "data/methodology/star-reflection/ag73d-active-result-no-storage-ui-audit.json",
  "data/content-intelligence/quality-registry/ag73d-ag73e-star-reflection-active-result-qa-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag73d-to-ag73e-star-reflection-active-result-qa-boundary.json",
  "data/content-intelligence/quality-reviews/ag73d-star-reflection-active-result-ui-wiring.json",
  "data/quality/ag73d-star-reflection-active-result-ui-wiring.json",
  "data/quality/ag73d-star-reflection-active-result-ui-wiring-preview.json",
  "docs/quality/AG73D_STAR_REFLECTION_ACTIVE_RESULT_UI_WIRING.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const index = fs.readFileSync(full("index.html"), "utf8");

for (const marker of [
  "AG73D_STAR_REFLECTION_ACTIVE_RESULT_UI_WIRING_START",
  "generated/star-reflection-active-result-data.json",
  "Generate Star Reflection Result",
  "Active Star Reflection Result - Reflective Only",
  "Today's Star Reflection Result",
  "Active reflective result generated",
  "data-ag73d-active-result-id",
  "data-ag73d-birth-time-precision",
  "data-ag73d-star-reflection-active-result"
]) {
  if (!index.includes(marker)) fail(`index.html missing AG73D marker: ${marker}`);
}

if (index.includes('var DATA_PATH = "generated/star-reflection-pilot-preview-data.json";')) {
  fail("AG73D controller must not use old Star Reflection pilot preview data path.");
}

const data = readJson("generated/star-reflection-active-result-data.json");
if (data.status !== "ag73c_star_reflection_active_result_data_created") fail("Active result data status mismatch.");
if (data.scope.personal_data_storage !== false) fail("Personal data storage must remain false.");
if (data.scope.backend_runtime_active !== false) fail("Backend runtime must remain false.");
if (data.scope.supabase_active !== false) fail("Supabase activation must remain false.");
if (data.scope.deterministic_prediction !== false) fail("Deterministic prediction must remain false.");

const wiring = readJson("data/methodology/star-reflection/ag73d-star-reflection-active-result-ui-wiring.json");
if (wiring.status !== "ag73d_star_reflection_active_result_ui_wiring_applied") fail("AG73D wiring record status mismatch.");
if (wiring.implementation_summary.birth_time_precision_used_for_record_selection !== true) fail("Birth-time precision must be used for selection.");

const audit = readJson("data/methodology/star-reflection/ag73d-active-result-no-storage-ui-audit.json");
if (audit.status !== "ag73d_active_result_no_storage_ui_audit_passed") fail("AG73D no-storage UI audit status mismatch.");
for (const [key, value] of Object.entries(audit.checks || {})) {
  if (value !== false) fail(`No-storage UI audit check must remain false: ${key}`);
}

const manifest = readJson("data/methodology/star-reflection/star-reflection-method-manifest.json");
const allowed = [
  "ag73d_star_reflection_active_result_wiring_applied_ag73e_ready",
  "ag73e_star_reflection_active_result_qa_closed"
];

if (!allowed.includes(manifest.current_status)) {
  fail(`Manifest is not AG73D-compatible: ${manifest.current_status}`);
}

pass("AG73D Star Reflection active result UI wiring is valid.");
pass("Birth-time-aware active result data is wired.");
pass("AG73E active result QA is ready.");
