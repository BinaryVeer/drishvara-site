import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const full = (relativePath) => path.join(root, relativePath);
const readJson = (relativePath) =>
  JSON.parse(fs.readFileSync(full(relativePath), "utf8"));
const exists = (relativePath) => fs.existsSync(full(relativePath));

function fail(message) {
  console.error(`❌ AG74O-R1E validation failed: ${message}`);
  process.exit(1);
}
function pass(message) {
  console.log(`✅ ${message}`);
}
function uniqueCount(records, field) {
  return new Set(records.map((record) => record[field])).size;
}

const required = [
  "package.json",
  "scripts/generate-ag74o-r1e-unified-location-index.mjs",
  "scripts/validate-ag74o-r1e-unified-location-index.mjs",
  "data/knowledge-base/location-intelligence/production/ag74o-r1e-unified-location-index.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1e-canonical-place-link-bank.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1e-unified-alias-search-index.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1e-coordinate-timezone-review-state-register.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1e-unresolved-canonical-review-queue.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1e-source-attribution-continuity-register.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1e-approval-state-preservation-register.json",
  "data/content-intelligence/quality-reviews/ag74o-r1e-unified-location-index.json",
  "data/content-intelligence/quality-registry/ag74o-r1e-ag74o-r2-selector-calculation-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag74o-r1e-to-ag74o-r2-selector-calculation-boundary.json",
  "data/quality/ag74o-r1e-unified-location-index.json",
  "docs/quality/AG74O_R1E_UNIFIED_LOCATION_INDEX.md",
];

for (const relativePath of required) {
  if (!exists(relativePath)) fail(`Missing required file: ${relativePath}`);
}

const pkg = readJson("package.json");
if (
  pkg.scripts?.["generate:ag74o-r1e"] !==
  "node scripts/generate-ag74o-r1e-unified-location-index.mjs"
) {
  fail("generate:ag74o-r1e package script mismatch.");
}
if (
  pkg.scripts?.["validate:ag74o-r1e"] !==
  "node scripts/validate-ag74o-r1e-unified-location-index.mjs"
) {
  fail("validate:ag74o-r1e package script mismatch.");
}
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag74o-r1e")) {
  fail("validate:project must include validate:ag74o-r1e.");
}

const index = readJson(required[3]);
const links = readJson(required[4]);
const aliases = readJson(required[5]);
const coordinate = readJson(required[6]);
const unresolved = readJson(required[7]);
const attribution = readJson(required[8]);
const approval = readJson(required[9]);
const review = readJson(required[10]);
const readiness = readJson(required[11]);
const boundary = readJson(required[12]);
const quality = readJson(required[13]);

if (index.record_count !== 7946 || index.records.length !== 7946) {
  fail("Unified index record count mismatch.");
}
if (
  uniqueCount(index.records, "unified_index_record_id") !== 7946 ||
  uniqueCount(index.records, "source_record_id") !== 7946
) {
  fail("Unified index identifier uniqueness mismatch.");
}
if (links.record_count !== 6483 || links.records.length !== 6483) {
  fail("Canonical candidate-bucket count mismatch.");
}
if (uniqueCount(links.records, "candidate_bucket_id") !== 6483) {
  fail("Candidate-bucket identifier uniqueness mismatch.");
}
if (aliases.record_count !== 6704 || aliases.records.length !== 6704) {
  fail("Alias/search-label record count mismatch.");
}
if (aliases.ambiguous_label_review_count !== 24) {
  fail("Ambiguous alias/search-label count mismatch.");
}
if (coordinate.record_count !== 7946 || coordinate.records.length !== 7946) {
  fail("Coordinate/timezone state-register count mismatch.");
}
if (unresolved.record_count !== 1419 || unresolved.records.length !== 1419) {
  fail("Unified unresolved-review queue count mismatch.");
}
const expectedTypes = {
  cross_bank_canonical_place_comparison: 243,
  same_stage_hierarchy_or_duplicate_comparison: 949,
  ambiguous_normalised_search_label: 24,
  r1d_cross_bank_review_carry_forward: 196,
  r1c_capital_conflict_carry_forward: 7,
};
for (const [key, value] of Object.entries(expectedTypes)) {
  if (unresolved.review_type_counts?.[key] !== value) {
    fail(`Unresolved-review type count mismatch for ${key}.`);
  }
}
if (approval.record_count !== 7946 || approval.records.length !== 7946) {
  fail("Approval-state preservation record count mismatch.");
}
if (
  approval.public_selection_approved_count !== 0 ||
  approval.computation_approved_count !== 0 ||
  approval.canonical_place_approved_count !== 0 ||
  approval.coordinate_approved_count !== 0 ||
  approval.timezone_approved_count !== 0
) {
  fail("One or more approval counts are non-zero.");
}

for (const record of index.records) {
  if (
    record.canonical_place_approval_status !== "not_approved" ||
    record.computation_approval_status !== "blocked" ||
    record.public_selection_status !== "blocked" ||
    record.automatic_merge_allowed !== false ||
    record.automatic_alias_resolution_allowed !== false
  ) {
    fail(`Unified-index activation boundary mismatch: ${record.unified_index_record_id}`);
  }
}
for (const record of links.records) {
  if (
    record.canonical_place_approval_status !== "not_approved" ||
    record.automatic_merge_allowed !== false ||
    record.computation_approval_status !== "blocked" ||
    record.public_selection_status !== "blocked"
  ) {
    fail(`Canonical-link boundary mismatch: ${record.candidate_bucket_id}`);
  }
}
for (const record of aliases.records) {
  if (
    record.automatic_public_resolution_allowed !== false ||
    record.public_selection_status !== "blocked" ||
    record.computation_approval_status !== "blocked"
  ) {
    fail(`Alias/search boundary mismatch: ${record.search_label_record_id}`);
  }
}
for (const record of coordinate.records) {
  if (
    record.automatic_coordinate_approval_allowed !== false ||
    record.automatic_timezone_approval_allowed !== false ||
    record.public_selection_status !== "blocked" ||
    record.computation_approval_status !== "blocked"
  ) {
    fail(`Coordinate/timezone boundary mismatch: ${record.review_state_record_id}`);
  }
}
for (const record of unresolved.records) {
  if (
    record.automatic_resolution_allowed !== false ||
    record.public_selection_status !== "blocked" ||
    record.computation_approval_status !== "blocked"
  ) {
    fail(`Unresolved-review boundary mismatch: ${record.unified_review_record_id}`);
  }
}

if (
  attribution.governance.source_lineage_must_be_retained !== true ||
  attribution.governance.licensed_source_attribution_must_be_retained !== true ||
  attribution.governance.runtime_external_api_dependency_allowed !== false ||
  attribution.governance.public_output_allowed_now !== false
) {
  fail("Source-attribution continuity boundary mismatch.");
}

if (
  review.status !== "ag74o_r1e_unified_location_index_completed" ||
  review.issue_count !== 0 ||
  review.summary.ready_for_ag74o_r2_planning !== true
) {
  fail("R1E quality-review status mismatch.");
}
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
  readiness.ready_for_ag74o_r2_planning !== true ||
  readiness.ready_for_public_runtime_activation !== false ||
  readiness.public_record_count_now !== 0 ||
  readiness.computation_approved_record_count_now !== 0 ||
  readiness.next_stage_not_auto_started !== true
) {
  fail("R2 readiness boundary mismatch.");
}
if (
  boundary.next_stage !== "AG74O-R2" ||
  boundary.next_stage_not_auto_started !== true
) {
  fail("R1E-to-R2 boundary mismatch.");
}
if (
  quality.status !== "pass" ||
  quality.issue_count !== 0 ||
  !Object.values(quality.checks).every(Boolean)
) {
  fail("R1E quality record mismatch.");
}

pass("AG74O-R1E unified governed location index is valid.");
pass("7,946 source-role index records and 6,483 candidate-link buckets are present.");
pass("6,704 alias/search-label records retain 24 governed ambiguity reviews.");
pass("All 1,419 unresolved reviews remain blocked from automatic resolution.");
pass("AG74O-R2 is ready for planning but public runtime activation remains blocked.");
