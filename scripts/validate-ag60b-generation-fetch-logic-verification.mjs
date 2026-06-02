import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG60B validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "data/content-intelligence/quality-reviews/ag60a-phase-01-live-module-inventory-source-map.json",
  "data/content-intelligence/phase-01-modules/ag60a-live-module-inventory-record.json",

  "data/content-intelligence/quality-reviews/ag60b-generation-fetch-logic-verification.json",
  "data/content-intelligence/phase-01-modules/ag60b-source-consumption-record.json",
  "data/content-intelligence/phase-01-modules/ag60b-module-generation-fetch-logic-record.json",
  "data/content-intelligence/phase-01-modules/ag60b-title-subtitle-generation-verification-record.json",
  "data/content-intelligence/phase-01-modules/ag60b-source-quality-and-news-selection-gap-record.json",
  "data/content-intelligence/phase-01-modules/ag60b-storage-persistence-status-record.json",
  "data/content-intelligence/phase-01-modules/ag60b-methodology-gated-module-status-record.json",
  "data/content-intelligence/phase-01-modules/ag60b-frontend-backend-mismatch-record.json",
  "data/content-intelligence/quality-registry/ag60b-ag60c-storage-persistence-verification-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag60b-to-ag60c-storage-persistence-verification-boundary.json",
  "data/content-intelligence/backend-architecture/ag60b-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag60b-no-v02-expansion-audit.json",
  "data/quality/ag60b-generation-fetch-logic-verification.json",
  "data/quality/ag60b-generation-fetch-logic-verification-preview.json",
  "docs/quality/AG60B_GENERATION_FETCH_LOGIC_VERIFICATION.md",
  "scripts/generate-ag60b-generation-fetch-logic-verification.mjs",
  "scripts/validate-ag60b-generation-fetch-logic-verification.mjs"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag60b"]) fail("Missing generate:ag60b script.");
if (!pkg.scripts?.["validate:ag60b"]) fail("Missing validate:ag60b script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag60b")) fail("validate:project must include validate:ag60b.");

const ag60a = readJson("data/content-intelligence/quality-reviews/ag60a-phase-01-live-module-inventory-source-map.json");
if (ag60a.status !== "phase_01_live_module_inventory_source_map_recorded") fail("AG60A status mismatch.");

const review = readJson("data/content-intelligence/quality-reviews/ag60b-generation-fetch-logic-verification.json");
const logic = readJson("data/content-intelligence/phase-01-modules/ag60b-module-generation-fetch-logic-record.json");
const title = readJson("data/content-intelligence/phase-01-modules/ag60b-title-subtitle-generation-verification-record.json");
const quality = readJson("data/content-intelligence/phase-01-modules/ag60b-source-quality-and-news-selection-gap-record.json");
const storage = readJson("data/content-intelligence/phase-01-modules/ag60b-storage-persistence-status-record.json");
const methodology = readJson("data/content-intelligence/phase-01-modules/ag60b-methodology-gated-module-status-record.json");
const mismatch = readJson("data/content-intelligence/phase-01-modules/ag60b-frontend-backend-mismatch-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag60b-ag60c-storage-persistence-verification-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag60b-to-ag60c-storage-persistence-verification-boundary.json");
const preview = readJson("data/quality/ag60b-generation-fetch-logic-verification-preview.json");

if (review.status !== "generation_fetch_logic_verification_recorded") fail("AG60B review status mismatch.");
if (review.summary.module_count < 10) fail("Module count too low.");
if (review.summary.modules_with_methodology_pending < 4) fail("Methodology pending count too low.");
if (review.summary.source_quality_gaps_recorded < 3) fail("Source quality gaps missing.");
if (review.summary.frontend_backend_mismatches_recorded < 2) fail("Frontend/backend mismatches missing.");
if (review.summary.ready_for_ag60c !== true) fail("AG60C readiness missing.");

const requiredModuleIds = ["first_light", "sports_desk", "word_of_day", "panchang_festival", "upcoming_observance", "featured_reads", "indexed_reads"];
const ids = logic.records.map((r) => r.module_id);
for (const id of requiredModuleIds) {
  if (!ids.includes(id)) fail(`Missing AG60B logic record for ${id}`);
}

if (!title.checks.some((c) => c.module_id === "first_light")) fail("First Light title/subtitle check missing.");
if (!quality.gaps.some((g) => g.gap_id === "first_light_10_6_4_selection_rule_unverified")) fail("First Light 10/6/4 source gap missing.");
if (!methodology.module_status.some((m) => m.module_id === "word_of_day" && m.requirement.includes("Nityanand"))) fail("Word methodology status missing.");
if (!methodology.module_status.some((m) => m.module_id === "panchang_festival")) fail("Panchang methodology status missing.");
if (!mismatch.mismatches.some((m) => m.mismatch_id === "frontend_claims_dynamic_but_backend_deferred")) fail("Backend-deferred mismatch missing.");
if (!storage.records.some((r) => r.supabase_persistence_status === "not_active_in_v01_static_github_pages")) fail("Storage Supabase deferral missing.");

if (readiness.ready_for_ag60c !== true) fail("AG60C readiness must be true.");
if (boundary.status !== "ag60c_storage_persistence_verification_boundary_created") fail("AG60C boundary mismatch.");

for (const f of [
  "data/content-intelligence/backend-architecture/ag60b-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag60b-no-v02-expansion-audit.json"
]) {
  const audit = readJson(f);
  if (audit.audit_passed !== true) fail(`${f} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${f} failed checks must be zero.`);
}

if (preview.ready_for_ag60c !== 1) fail("Preview AG60C readiness missing.");
if (preview.backend_runtime_activated !== 0) fail("Preview backend runtime must be zero.");

pass("AG60B Generation / Fetch Logic Verification is present.");
pass("Generation/fetch logic records include key Phase-01 modules.");
pass("First Light 10/6/4, source quality and title/subtitle gaps are recorded.");
pass("Word/Panchang/Vedic/Observance methodology-pending statuses are recorded.");
pass("Frontend/backend mismatch and Supabase deferral are recorded.");
pass("No backend/runtime/service-role/V02 action is recorded.");
pass("AG60C Storage / Persistence Verification readiness is valid.");
