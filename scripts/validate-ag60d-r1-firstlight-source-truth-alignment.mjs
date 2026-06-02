import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) {
  console.error(`❌ AG60D-R1 validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "index.html",
  "data/content-intelligence/quality-reviews/ag60d-ui-module-correction-placeholder-alignment.json",
  "data/content-intelligence/daily-surface/ag45a-signal-selection-doctrine.json",
  "data/content-intelligence/daily-surface/ag45a-northeast-watch-doctrine.json",
  "data/content-intelligence/homepage/ag45a-card-transition-doctrine.json",
  "data/content-intelligence/homepage/ag45a-first-light-ui-space-model.json",
  "data/content-intelligence/daily-surface/ag45d-signal-card-copy-template-model.json",
  "data/content-intelligence/quality-reviews/ag60d-r1-firstlight-source-truth-alignment.json",
  "data/content-intelligence/phase-01-modules/ag60d-r1-source-consumption-record.json",
  "data/content-intelligence/phase-01-modules/ag60d-r1-firstlight-source-truth-apply-record.json",
  "data/content-intelligence/phase-01-modules/ag60d-r1-firstlight-source-truth-alignment-record.json",
  "data/content-intelligence/phase-01-modules/ag60d-r1-sports-strip-deduplication-record.json",
  "data/content-intelligence/quality-registry/ag60d-r1-ag60e-live-module-recheck-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag60d-r1-to-ag60e-live-module-recheck-boundary.json",
  "data/content-intelligence/backend-architecture/ag60d-r1-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag60d-r1-no-v02-expansion-audit.json",
  "data/quality/ag60d-r1-firstlight-source-truth-alignment.json",
  "data/quality/ag60d-r1-firstlight-source-truth-alignment-preview.json",
  "docs/quality/AG60D_R1_FIRSTLIGHT_SOURCE_TRUTH_ALIGNMENT.md",
  "scripts/generate-ag60d-r1-firstlight-source-truth-alignment.mjs",
  "scripts/validate-ag60d-r1-firstlight-source-truth-alignment.mjs"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag60d-r1"]) fail("Missing generate:ag60d-r1 script.");
if (!pkg.scripts?.["validate:ag60d-r1"]) fail("Missing validate:ag60d-r1 script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag60d-r1")) fail("validate:project must include validate:ag60d-r1.");

const index = read("index.html");

for (const bad of ["North India", "National Pulse"]) {
  if (index.includes(bad)) fail(`Wrong First Light label still present: ${bad}`);
}

for (const requiredText of [
  "data-drishvara-ag60d-r1-firstlight-source-truth=\"true\"",
  "India signals form the default national layer",
  "Northeast Watch",
  "World signals provide the international layer",
  "data-drishvara-ag60d-r1-hidden-duplicate-sports-strip"
]) {
  if (!index.includes(requiredText)) fail(`Required AG60D-R1 text/marker missing: ${requiredText}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag60d-r1-firstlight-source-truth-alignment.json");
const apply = readJson("data/content-intelligence/phase-01-modules/ag60d-r1-firstlight-source-truth-apply-record.json");
const alignment = readJson("data/content-intelligence/phase-01-modules/ag60d-r1-firstlight-source-truth-alignment-record.json");
const sports = readJson("data/content-intelligence/phase-01-modules/ag60d-r1-sports-strip-deduplication-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag60d-r1-ag60e-live-module-recheck-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag60d-r1-to-ag60e-live-module-recheck-boundary.json");
const preview = readJson("data/quality/ag60d-r1-firstlight-source-truth-alignment-preview.json");

if (review.status !== "firstlight_source_truth_alignment_applied_ready_for_ag60e") fail("AG60D-R1 review status mismatch.");
if (review.summary.firstlight_source_truth_aligned !== true) fail("First Light source truth summary missing.");
if (review.summary.public_cards_aligned_to_india_northeast_world !== true) fail("India/Northeast/World summary missing.");
if (review.summary.duplicate_live_sports_strip_hidden !== true) fail("Sports strip hidden summary missing.");
if (review.summary.ready_for_ag60e !== true) fail("AG60E readiness summary missing.");

if (apply.audit_passed !== true) fail("Apply record must pass.");
if (alignment.audit_passed !== true) fail("Alignment record must pass.");
if (alignment.source_truth.compact_card_tag_model !== "India / Northeast Watch / World") fail("Compact card tag model mismatch.");
if (!alignment.public_visible_cards.some((c) => c.tag === "India")) fail("India card missing.");
if (!alignment.public_visible_cards.some((c) => c.tag === "Northeast Watch")) fail("Northeast Watch card missing.");
if (!alignment.public_visible_cards.some((c) => c.tag === "World")) fail("World card missing.");
if (sports.status !== "duplicate_live_sports_strip_hidden") fail("Sports strip dedup status mismatch.");
if (sports.sports_desk_retained !== true) fail("Sports Desk retained flag missing.");
if (readiness.ready_for_ag60e !== true) fail("AG60E readiness missing.");
if (boundary.status !== "ag60e_live_module_recheck_boundary_created_after_firstlight_alignment") fail("AG60E boundary mismatch.");

for (const f of [
  "data/content-intelligence/backend-architecture/ag60d-r1-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag60d-r1-no-v02-expansion-audit.json"
]) {
  const audit = readJson(f);
  if (audit.audit_passed !== true) fail(`${f} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${f} failed checks must be zero.`);
}

if (preview.ready_for_ag60e !== 1) fail("Preview AG60E readiness missing.");
if (preview.backend_runtime_activated !== 0) fail("Preview backend runtime must be zero.");

pass("AG60D-R1 First Light Source-of-Truth Alignment is present.");
pass("First Light is aligned to India / Northeast Watch / World.");
pass("Wrong North India / National Pulse labels are removed.");
pass("Duplicate LIVE SPORTS strip is hidden while Sports Desk is retained.");
pass("No backend/runtime/service-role/V02 action is recorded.");
pass("AG60E Live Module Recheck readiness is valid.");
