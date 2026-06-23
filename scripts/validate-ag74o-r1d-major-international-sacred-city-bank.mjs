import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const full = (p) => path.join(root, p);
const readJson = (p) => JSON.parse(fs.readFileSync(full(p), "utf8"));
const exists = (p) => fs.existsSync(full(p));
function fail(message) {
  console.error(`❌ AG74O-R1D validation failed: ${message}`);
  process.exit(1);
}
function pass(message) {
  console.log(`✅ ${message}`);
}

const required = [
  "package.json",
  "scripts/generate-ag74o-r1d-major-international-sacred-city-bank.mjs",
  "scripts/validate-ag74o-r1d-major-international-sacred-city-bank.mjs",
  "data/knowledge-base/location-intelligence/production/ag74o-r1d-major-international-city-candidate-bank.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1d-sacred-reference-city-candidate-bank.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1d-cross-bank-canonical-place-review-queue.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1d-coordinate-timezone-review-queue.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1d-source-attribution-register.json",
  "data/content-intelligence/quality-reviews/ag74o-r1d-major-international-sacred-city-bank.json",
  "data/content-intelligence/quality-registry/ag74o-r1d-ag74o-r1e-unified-location-index-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag74o-r1d-to-ag74o-r1e-unified-location-index-boundary.json",
  "data/quality/ag74o-r1d-major-international-sacred-city-bank.json",
  "docs/quality/AG74O_R1D_MAJOR_INTERNATIONAL_SACRED_CITY_BANK.md",
];
for (const p of required) if (!exists(p)) fail(`Missing required file: ${p}`);

const pkg = readJson("package.json");
if (
  pkg.scripts?.["generate:ag74o-r1d"] !==
  "node scripts/generate-ag74o-r1d-major-international-sacred-city-bank.mjs"
) fail("generate:ag74o-r1d package script mismatch.");
if (
  pkg.scripts?.["validate:ag74o-r1d"] !==
  "node scripts/validate-ag74o-r1d-major-international-sacred-city-bank.mjs"
) fail("validate:ag74o-r1d package script mismatch.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag74o-r1d")) {
  fail("validate:project must include validate:ag74o-r1d.");
}

const major = readJson(required[3]);
const sacred = readJson(required[4]);
const cross = readJson(required[5]);
const queue = readJson(required[6]);
const source = readJson(required[7]);
const review = readJson(required[8]);
const readiness = readJson(required[9]);
const boundary = readJson(required[10]);
const quality = readJson(required[11]);

if (major.record_count !== 1204 || major.records.length !== 1204) {
  fail("Major-city candidate count mismatch.");
}
if (major.counts.national_capital_bank_overlaps !== 186) {
  fail("R1C national-capital overlap count mismatch.");
}
if (sacred.record_count !== 51 || sacred.records.length !== 51) {
  fail("Sacred/reference candidate count mismatch.");
}
if (sacred.source_match_count !== 34) {
  fail("Sacred/reference source-match count mismatch.");
}
if (cross.r1c_national_capital_overlap_count !== 186) {
  fail("Cross-bank R1C overlap count mismatch.");
}
if (queue.record_count !== 1255 || queue.records.length !== 1255) {
  fail("Coordinate/timezone queue count mismatch.");
}

for (const record of [...major.records, ...sacred.records]) {
  if (
    record.computation_approval_status !== "blocked" ||
    record.public_selection_status !== "blocked"
  ) fail(`Activation boundary mismatch: ${record.location_record_id}`);
}
for (const record of queue.records) {
  if (
    record.computation_approval_status !== "blocked" ||
    record.public_selection_status !== "blocked"
  ) fail(`Queue activation boundary mismatch: ${record.queue_record_id}`);
}

if (
  major.governance.source_licence !==
    "SimpleMaps Basic World Cities CC BY 4.0" ||
  major.governance.bulk_public_redistribution_allowed !== false ||
  major.governance.population_ranking_is_approval !== false ||
  major.governance.runtime_external_api_dependency_allowed !== false ||
  major.governance.public_output_allowed_now !== false
) fail("Major-city source/governance boundary mismatch.");

if (
  sacred.governance.automatic_role_promotion_allowed !== false ||
  sacred.governance.computation_approved_records !== 0 ||
  sacred.governance.public_selection_approved_records !== 0
) fail("Sacred/reference approval boundary mismatch.");

if (
  source.governance.source_attribution_must_be_retained !== true ||
  source.governance.runtime_external_api_dependency_allowed !== false ||
  source.governance.public_output_allowed_now !== false
) fail("Source attribution boundary mismatch.");

if (
  review.status !==
    "ag74o_r1d_major_international_sacred_city_bank_completed" ||
  review.issue_count !== 0 ||
  review.summary.ready_for_ag74o_r1e !== true
) fail("R1D review record mismatch.");

for (const flag of [
  "public_location_selector_activated",
  "panchang_computation_activated",
  "runtime_external_api_activated",
  "supabase_activated",
  "homepage_ui_changed",
]) {
  if (review.summary[flag] !== false) fail(`${flag} must remain false.`);
}

if (
  readiness.ready_for_ag74o_r1e !== true ||
  readiness.public_record_count_now !== 0 ||
  readiness.computation_approved_record_count_now !== 0 ||
  readiness.next_stage_not_auto_started !== true
) fail("R1E readiness boundary mismatch.");

if (
  boundary.next_stage !== "AG74O-R1E" ||
  boundary.next_stage_not_auto_started !== true
) fail("R1D-to-R1E boundary mismatch.");

if (
  quality.status !== "pass" ||
  quality.issue_count !== 0 ||
  !Object.values(quality.checks).every(Boolean)
) fail("R1D quality record mismatch.");

pass("AG74O-R1D major international and sacred/reference candidate banks are valid.");
pass("1,204 major-city and 51 sacred/reference candidate records are present.");
pass("186 R1C capital overlaps remain governed through canonical-place review.");
pass("All 1,255 coordinate/timezone records remain blocked from public/computation activation.");
pass("AG74O-R1E is ready but not auto-started.");
