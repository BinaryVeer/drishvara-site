import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG60C validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "data/content-intelligence/quality-reviews/ag60b-generation-fetch-logic-verification.json",
  "data/content-intelligence/phase-01-modules/ag60b-module-generation-fetch-logic-record.json",
  "data/content-intelligence/phase-01-modules/ag60b-storage-persistence-status-record.json",

  "data/content-intelligence/quality-reviews/ag60c-storage-persistence-verification.json",
  "data/content-intelligence/phase-01-modules/ag60c-source-consumption-record.json",
  "data/content-intelligence/phase-01-modules/ag60c-module-storage-persistence-matrix-record.json",
  "data/content-intelligence/phase-01-modules/ag60c-static-generated-file-verification-record.json",
  "data/content-intelligence/phase-01-modules/ag60c-future-supabase-persistence-need-record.json",
  "data/content-intelligence/phase-01-modules/ag60c-frontend-storage-sync-gap-record.json",
  "data/content-intelligence/quality-registry/ag60c-ag60d-ui-module-correction-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag60c-to-ag60d-ui-module-correction-boundary.json",
  "data/content-intelligence/backend-architecture/ag60c-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag60c-no-v02-expansion-audit.json",
  "data/quality/ag60c-storage-persistence-verification.json",
  "data/quality/ag60c-storage-persistence-verification-preview.json",
  "docs/quality/AG60C_STORAGE_PERSISTENCE_VERIFICATION.md",
  "scripts/generate-ag60c-storage-persistence-verification.mjs",
  "scripts/validate-ag60c-storage-persistence-verification.mjs"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag60c"]) fail("Missing generate:ag60c script.");
if (!pkg.scripts?.["validate:ag60c"]) fail("Missing validate:ag60c script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag60c")) fail("validate:project must include validate:ag60c.");

const ag60b = readJson("data/content-intelligence/quality-reviews/ag60b-generation-fetch-logic-verification.json");
if (ag60b.status !== "generation_fetch_logic_verification_recorded") fail("AG60B status mismatch.");

const review = readJson("data/content-intelligence/quality-reviews/ag60c-storage-persistence-verification.json");
const matrix = readJson("data/content-intelligence/phase-01-modules/ag60c-module-storage-persistence-matrix-record.json");
const staticFiles = readJson("data/content-intelligence/phase-01-modules/ag60c-static-generated-file-verification-record.json");
const future = readJson("data/content-intelligence/phase-01-modules/ag60c-future-supabase-persistence-need-record.json");
const sync = readJson("data/content-intelligence/phase-01-modules/ag60c-frontend-storage-sync-gap-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag60c-ag60d-ui-module-correction-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag60c-to-ag60d-ui-module-correction-boundary.json");
const preview = readJson("data/quality/ag60c-storage-persistence-verification-preview.json");

if (review.status !== "storage_persistence_verification_recorded") fail("AG60C review status mismatch.");
if (review.summary.module_count < 10) fail("Module count too low.");
if (review.summary.static_generated_files_verified !== true) fail("Static/generated verification missing.");
if (review.summary.future_supabase_needs_mapped < 2) fail("Future Supabase need map too small.");
if (review.summary.frontend_storage_sync_gaps_recorded < 4) fail("Frontend sync gaps missing.");
if (review.summary.ready_for_ag60d !== true) fail("AG60D readiness missing.");
if (review.summary.backend_runtime_activated !== false) fail("Backend runtime must remain false.");

const ids = matrix.records.map((r) => r.module_id);
for (const id of ["first_light", "sports_desk", "indexed_reads", "word_of_day", "panchang_festival"]) {
  if (!ids.includes(id)) fail(`Missing persistence matrix item: ${id}`);
}

if (!staticFiles.all_required_static_files_valid) fail("Static generated files must be valid.");
if (!staticFiles.checks.every((c) => c.exists && c.valid_json)) fail("One or more static generated JSON files invalid.");
if (future.backend_activation_status !== "deferred") fail("Future Supabase backend status must be deferred.");
if (!future.records.every((r) => r.current_status === "not_active_in_v01")) fail("Future Supabase records must not be active.");
if (!sync.gaps.some((g) => g.gap_id === "first_light_title_persistence_sync")) fail("First Light sync gap missing.");
if (!sync.gaps.some((g) => g.gap_id === "ads_placeholder_visible")) fail("Ads placeholder gap missing.");
if (readiness.ready_for_ag60d !== true) fail("AG60D readiness must be true.");
if (boundary.status !== "ag60d_ui_module_correction_boundary_created") fail("AG60D boundary mismatch.");

for (const f of [
  "data/content-intelligence/backend-architecture/ag60c-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag60c-no-v02-expansion-audit.json"
]) {
  const audit = readJson(f);
  if (audit.audit_passed !== true) fail(`${f} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${f} failed checks must be zero.`);
}

if (preview.ready_for_ag60d !== 1) fail("Preview AG60D readiness missing.");
if (preview.backend_runtime_activated !== 0) fail("Preview backend runtime must be zero.");

pass("AG60C Storage / Persistence Verification is present.");
pass("Module storage/persistence matrix is valid.");
pass("Static/generated JSON files are valid.");
pass("Future Supabase needs are mapped without activation.");
pass("Frontend/storage sync gaps are recorded.");
pass("No backend/runtime/service-role/V02 action is recorded.");
pass("AG60D UI / Module Correction readiness is valid.");
