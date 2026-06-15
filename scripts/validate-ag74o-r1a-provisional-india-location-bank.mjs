import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) {
  return path.join(root, p);
}

function exists(p) {
  return fs.existsSync(full(p));
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(full(p), "utf8"));
}

function fail(message) {
  console.error(`❌ AG74O-R1A validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

const requiredFiles = [
  "package.json",
  "scripts/generate-ag74o-r1a-provisional-india-location-bank.mjs",
  "scripts/validate-ag74o-r1a-provisional-india-location-bank.mjs",
  "data/knowledge-base/location-intelligence/production/ag74o-r1a-provisional-india-location-bank.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1a-provisional-india-location-schema.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1a-provisional-india-location-source-manifest.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1a-provisional-india-location-reconciliation-policy.json",
  "data/content-intelligence/quality-reviews/ag74o-r1a-provisional-india-location-bank.json",
  "data/content-intelligence/quality-registry/ag74o-r1a-ag74o-r1b-coordinate-enrichment-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag74o-r1a-to-ag74o-r1b-coordinate-enrichment-boundary.json",
  "data/quality/ag74o-r1a-provisional-india-location-bank.json",
  "docs/quality/AG74O_R1A_PROVISIONAL_INDIA_LOCATION_BANK.md",
];

for (const file of requiredFiles) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (
  pkg.scripts?.["generate:ag74o-r1a"] !==
  "node scripts/generate-ag74o-r1a-provisional-india-location-bank.mjs"
) {
  fail("Missing or incorrect generate:ag74o-r1a package script.");
}
if (
  pkg.scripts?.["validate:ag74o-r1a"] !==
  "node scripts/validate-ag74o-r1a-provisional-india-location-bank.mjs"
) {
  fail("Missing or incorrect validate:ag74o-r1a package script.");
}
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag74o-r1a")) {
  fail("validate:project must include validate:ag74o-r1a.");
}

const bank = readJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1a-provisional-india-location-bank.json"
);
if (bank.status !== "ag74o_r1a_provisional_india_location_bank_generated") {
  fail("Bank status mismatch.");
}
if (bank.counts.total_record_count !== 6493 || bank.records.length !== 6493) {
  fail("Bank must contain exactly 6,493 records.");
}

const expectedCounts = {
  state_or_union_territory: 36,
  district: 784,
  development_block: 2631,
  urban_local_body: 3042,
};
const actualCounts = {};
const recordIds = new Set();
const entityKeys = new Set();
const internalSearchKeys = new Set();

for (const record of bank.records) {
  actualCounts[record.location_type] =
    (actualCounts[record.location_type] || 0) + 1;

  if (recordIds.has(record.location_record_id)) {
    fail(`Duplicate location_record_id: ${record.location_record_id}`);
  }
  if (entityKeys.has(record.entity_key)) {
    fail(`Duplicate entity_key: ${record.entity_key}`);
  }
  if (internalSearchKeys.has(record.internal_search_key)) {
    fail(`Duplicate internal_search_key: ${record.internal_search_key}`);
  }

  recordIds.add(record.location_record_id);
  entityKeys.add(record.entity_key);
  internalSearchKeys.add(record.internal_search_key);

  if (record.country_code !== "IN" || record.country_name !== "India") {
    fail(`Country mismatch: ${record.location_record_id}`);
  }
  if (record.timezone !== "Asia/Kolkata") {
    fail(`Timezone mismatch: ${record.location_record_id}`);
  }
  if (record.latitude_decimal !== null || record.longitude_decimal !== null) {
    fail(`Coordinates must remain null: ${record.location_record_id}`);
  }
  if (record.coordinate_source_status !== "coordinate_pending") {
    fail(`Coordinate status mismatch: ${record.location_record_id}`);
  }
  if (
    record.administrative_source_status !==
    "official_manual_lgd_export_pending_live_api_revalidation"
  ) {
    fail(`Administrative source status mismatch: ${record.location_record_id}`);
  }
  if (record.internal_search_index_allowed_now !== true) {
    fail(`Internal search must be enabled: ${record.location_record_id}`);
  }
  if (
    record.computation_allowed_now !== false ||
    record.public_selection_allowed_now !== false
  ) {
    fail(`Public/computation activation detected: ${record.location_record_id}`);
  }
}

for (const [type, expected] of Object.entries(expectedCounts)) {
  if (actualCounts[type] !== expected) {
    fail(`Type count mismatch for ${type}: ${actualCounts[type]} vs ${expected}`);
  }
}

if (bank.counts.subdistrict_count !== 0) {
  fail("Sub-district count must remain zero pending official import.");
}
if (
  bank.counts.approved_computation_record_count !== 0 ||
  bank.counts.public_selection_record_count !== 0
) {
  fail("Public or computation records must remain zero.");
}
if (
  bank.counts.internal_search_label_collision_count_after_disambiguation !== 0
) {
  fail("Internal search labels must be unique after disambiguation.");
}

const schema = readJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1a-provisional-india-location-schema.json"
);
if (schema.status !== "ag74o_r1a_provisional_india_location_schema_locked") {
  fail("Schema status mismatch.");
}
for (const field of [
  "location_record_id",
  "entity_key",
  "location_type",
  "state_or_ut_lgd_code",
  "internal_search_label",
  "latitude_decimal",
  "longitude_decimal",
  "coordinate_source_status",
  "computation_allowed_now",
  "public_selection_allowed_now",
]) {
  if (!schema.required_record_fields.includes(field)) {
    fail(`Required schema field missing: ${field}`);
  }
}
if (schema.runtime_external_api_dependency_allowed !== false) {
  fail("Runtime external API dependency must remain false.");
}
if (schema.public_output_allowed_now !== false) {
  fail("Schema public output must remain false.");
}

const sourceManifest = readJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1a-provisional-india-location-source-manifest.json"
);
if (sourceManifest.status !== "ag74o_r1a_source_snapshot_verified") {
  fail("Source manifest status mismatch.");
}
if (
  sourceManifest.normalized_source_package.sha256 !==
  "008501c0cf8b845393eab255313c8188ed74a6cd26c43ed8027b45d7620942c6"
) {
  fail("Reviewed normalized source-package hash mismatch.");
}
if (sourceManifest.source_workbook_count !== 52) {
  fail("Source workbook count must be 52.");
}
if (sourceManifest.unclassified_source_count !== 0) {
  fail("Unclassified source count must be zero.");
}
if (sourceManifest.raw_source_archives_committed_to_repository !== false) {
  fail("Raw source archives must remain external.");
}

const reconciliation = readJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1a-provisional-india-location-reconciliation-policy.json"
);
if (
  reconciliation.status !==
  "ag74o_r1a_live_api_reconciliation_policy_locked"
) {
  fail("Reconciliation policy status mismatch.");
}
if (reconciliation.reconciliation_key !== "location_type_and_lgd_code") {
  fail("Reconciliation key mismatch.");
}
if (
  reconciliation.automatic_public_promotion_allowed !== false ||
  reconciliation.automatic_computation_activation_allowed !== false
) {
  fail("Automatic promotion or computation activation must remain false.");
}

const review = readJson(
  "data/content-intelligence/quality-reviews/ag74o-r1a-provisional-india-location-bank.json"
);
if (
  review.status !== "ag74o_r1a_provisional_india_location_bank_completed" ||
  review.issue_count !== 0 ||
  review.summary.ready_for_ag74o_r1b !== true
) {
  fail("Review record mismatch.");
}
for (const key of [
  "public_selection_activated",
  "panchang_computation_activated",
  "ui_changed",
  "backend_runtime_activated",
  "supabase_activated",
]) {
  if (review.summary[key] !== false) {
    fail(`${key} must remain false.`);
  }
}

const readiness = readJson(
  "data/content-intelligence/quality-registry/ag74o-r1a-ag74o-r1b-coordinate-enrichment-readiness-record.json"
);
if (readiness.ready_for_ag74o_r1b !== true) {
  fail("AG74O-R1B readiness must be true.");
}
if (readiness.public_record_count !== 0) {
  fail("Readiness public record count must be zero.");
}

const boundary = readJson(
  "data/content-intelligence/mutation-plans/ag74o-r1a-to-ag74o-r1b-coordinate-enrichment-boundary.json"
);
if (boundary.next_stage_not_auto_started !== true) {
  fail("AG74O-R1B must not auto-start.");
}
for (const blocked of [
  "Public location-combobox activation",
  "Panchang computation for coordinate-pending records",
  "Runtime external API dependency",
  "Supabase activation",
  "Homepage UI change",
  "Deletion of historical AG70-AG74 location evidence",
]) {
  if (!boundary.blocked_without_explicit_validation.includes(blocked)) {
    fail(`Boundary blocker missing: ${blocked}`);
  }
}

const quality = readJson(
  "data/quality/ag74o-r1a-provisional-india-location-bank.json"
);
if (
  quality.status !== "ag74o_r1a_completed" ||
  quality.issue_count !== 0 ||
  quality.record_count !== 6493 ||
  quality.ready_for_ag74o_r1b !== true
) {
  fail("Quality record mismatch.");
}
if (
  quality.computation_allowed_record_count !== 0 ||
  quality.public_selection_allowed_record_count !== 0 ||
  quality.browser_or_ui_change_performed !== false ||
  quality.runtime_backend_activated !== false ||
  quality.external_runtime_api_required !== false
) {
  fail("Quality activation boundary mismatch.");
}

pass("AG74O-R1A provisional India location bank is valid.");
pass("6,493 internal records are unique and searchable.");
pass("Live API, coordinates, public selection and computation remain gated.");
