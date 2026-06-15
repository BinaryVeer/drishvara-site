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
  console.error(`❌ AG74O-R1B validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

const requiredFiles = [
  "package.json",
  "scripts/generate-ag74o-r1b-coordinate-role-architecture.mjs",
  "scripts/validate-ag74o-r1b-coordinate-role-architecture.mjs",
  "data/knowledge-base/location-intelligence/production/ag74o-r1b-universal-location-coordinate-role-schema.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1b-coordinate-source-hierarchy.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1b-global-source-evidence-register.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1b-location-role-taxonomy.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1b-coordinate-enrichment-queue.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1b-role-mapping-review-queue.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1b-computation-approval-state-machine.json",
  "data/content-intelligence/quality-reviews/ag74o-r1b-coordinate-role-architecture.json",
  "data/content-intelligence/quality-registry/ag74o-r1b-ag74o-r1c-global-capital-bank-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag74o-r1b-to-ag74o-r1c-global-capital-bank-boundary.json",
  "data/quality/ag74o-r1b-coordinate-role-architecture.json",
  "docs/quality/AG74O_R1B_COORDINATE_ROLE_ARCHITECTURE.md",
];

for (const file of requiredFiles) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (
  pkg.scripts?.["generate:ag74o-r1b"] !==
  "node scripts/generate-ag74o-r1b-coordinate-role-architecture.mjs"
) {
  fail("Missing or incorrect generate:ag74o-r1b package script.");
}
if (
  pkg.scripts?.["validate:ag74o-r1b"] !==
  "node scripts/validate-ag74o-r1b-coordinate-role-architecture.mjs"
) {
  fail("Missing or incorrect validate:ag74o-r1b package script.");
}
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag74o-r1b")) {
  fail("validate:project must include validate:ag74o-r1b.");
}

const schema = readJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1b-universal-location-coordinate-role-schema.json"
);
if (
  schema.status !==
  "ag74o_r1b_universal_location_coordinate_role_schema_locked"
) {
  fail("Universal schema status mismatch.");
}
for (const field of [
  "location_record_id",
  "canonical_place_id",
  "country_iso2",
  "latitude_decimal",
  "longitude_decimal",
  "coordinate_basis",
  "timezone_iana",
  "roles",
  "capital_roles",
  "computation_approval_status",
  "public_selection_status",
]) {
  const allFields = [
    ...schema.identity_fields,
    ...schema.coordinate_fields,
    ...schema.timezone_fields,
    ...schema.role_fields,
    ...schema.approval_fields,
  ];
  if (!allFields.includes(field)) {
    fail(`Universal schema field missing: ${field}`);
  }
}
if (
  schema.coordinate_required_for_computation !== true ||
  schema.timezone_required_for_computation !== true ||
  schema.runtime_external_api_dependency_allowed !== false ||
  schema.public_output_allowed_now !== false
) {
  fail("Universal schema activation boundary mismatch.");
}

const sourceHierarchy = readJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1b-coordinate-source-hierarchy.json"
);
if (
  sourceHierarchy.status !==
  "ag74o_r1b_coordinate_source_hierarchy_locked"
) {
  fail("Source hierarchy status mismatch.");
}
if (
  sourceHierarchy.source_freshness_window_months !== 12 ||
  sourceHierarchy.refresh_interval_months !== 4 ||
  sourceHierarchy.automatic_public_promotion_allowed !== false ||
  sourceHierarchy.automatic_computation_activation_allowed !== false ||
  sourceHierarchy.runtime_fetch_dependency_allowed !== false
) {
  fail("Source hierarchy governance mismatch.");
}
if (
  !sourceHierarchy.global_coordinate_priority.some((item) =>
    item.includes("SimpleMaps Basic World Cities")
  )
) {
  fail("SimpleMaps candidate source is missing from the source hierarchy.");
}

const sourceEvidence = readJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1b-global-source-evidence-register.json"
);
if (
  sourceEvidence.status !==
  "ag74o_r1b_global_source_evidence_registered"
) {
  fail("Global source evidence status mismatch.");
}
if (
  sourceEvidence.diagnosis_package.sha256 !==
  "b5ac4522ddaa32ca62ad93b5f496f7024977dd7f67606446d7eafc20cf1c1ae8"
) {
  fail("Combined diagnosis-package SHA-256 mismatch.");
}
if (
  sourceEvidence.simplemaps_world_cities.row_count !== 49992 ||
  sourceEvidence.simplemaps_world_cities.licence
    .basic_world_cities_database !== "CC BY 4.0" ||
  sourceEvidence.simplemaps_world_cities.licence.attribution_required !== true
) {
  fail("SimpleMaps source evidence mismatch.");
}
if (
  sourceEvidence.capital_coordinate_csv.row_count !== 234 ||
  sourceEvidence.capital_coordinate_csv.licence_status !==
    "unknown_do_not_promote_or_commit_derived_values_yet" ||
  sourceEvidence.capital_coordinate_csv.direct_record_promotion_allowed !==
    false
) {
  fail("Capital-coordinate source boundary mismatch.");
}
if (
  sourceEvidence.core_195_scope.expected_count !== 195 ||
  sourceEvidence.public_output_allowed_now !== false
) {
  fail("Core-195 or public-output boundary mismatch.");
}

const taxonomy = readJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1b-location-role-taxonomy.json"
);
if (taxonomy.status !== "ag74o_r1b_location_role_taxonomy_locked") {
  fail("Role taxonomy status mismatch.");
}
for (const role of [
  "national_capital",
  "state_or_regional_capital",
  "major_city",
  "sacred_reference_location",
]) {
  if (!taxonomy.primary_roles.includes(role)) {
    fail(`Primary role missing: ${role}`);
  }
}
for (const role of [
  "constitutional_capital",
  "administrative_capital",
  "legislative_capital",
  "judicial_capital",
  "seat_of_government",
  "de_facto_government_seat",
  "capital_transition_candidate",
]) {
  if (!taxonomy.capital_role_enum.includes(role)) {
    fail(`Capital role missing: ${role}`);
  }
}
if (
  taxonomy.role_approval_required !== true ||
  taxonomy.automatic_role_promotion_allowed !== false ||
  taxonomy.public_output_allowed_now !== false
) {
  fail("Role taxonomy approval boundary mismatch.");
}

const coordinateQueue = readJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1b-coordinate-enrichment-queue.json"
);
if (
  coordinateQueue.status !==
  "ag74o_r1b_coordinate_enrichment_queue_created"
) {
  fail("Coordinate queue status mismatch.");
}
if (
  coordinateQueue.counts.india_provisional_location_records !== 6493 ||
  coordinateQueue.india_provisional_location_queue.length !== 6493 ||
  coordinateQueue.counts.india_historical_candidate_evidence_records !== 52 ||
  coordinateQueue.india_historical_candidate_evidence.length !== 52 ||
  coordinateQueue.counts.global_historical_candidate_evidence_records !== 28 ||
  coordinateQueue.global_historical_candidate_evidence.length !== 28
) {
  fail("Coordinate queue counts mismatch.");
}
if (
  coordinateQueue.counts.india_historical_candidates_with_coordinate_values !==
    18 ||
  coordinateQueue.counts.global_historical_candidates_with_coordinate_values !==
    28
) {
  fail("Historical coordinate-evidence value counts mismatch.");
}
for (const record of coordinateQueue.india_provisional_location_queue) {
  if (
    record.computation_allowed_now !== false ||
    record.public_selection_allowed_now !== false ||
    record.coordinate_status !== "coordinate_source_required"
  ) {
    fail(`Coordinate queue activation mismatch: ${record.location_record_id}`);
  }
}
if (
  coordinateQueue.counts.computation_approved_records !== 0 ||
  coordinateQueue.counts.public_selection_approved_records !== 0 ||
  coordinateQueue.governance.automatic_promotion_allowed !== false
) {
  fail("Coordinate queue approval boundary mismatch.");
}

const roleQueue = readJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1b-role-mapping-review-queue.json"
);
if (
  roleQueue.status !==
  "ag74o_r1b_role_mapping_review_queue_created"
) {
  fail("Role queue status mismatch.");
}
if (
  roleQueue.counts.india_state_or_regional_capital_seed_records !== 36 ||
  roleQueue.counts.india_major_city_seed_records !== 16 ||
  roleQueue.counts.india_role_review_records !== 52 ||
  roleQueue.india_role_review_records.length !== 52 ||
  roleQueue.counts.global_national_capital_seed_records !== 16 ||
  roleQueue.counts.global_major_city_seed_records !== 12 ||
  roleQueue.counts.global_role_review_records !== 28 ||
  roleQueue.global_seed_role_review_records.length !== 28 ||
  roleQueue.counts.role_approved_records_now !== 0
) {
  fail("Role queue counts mismatch.");
}
for (const record of [
  ...roleQueue.india_role_review_records,
  ...roleQueue.global_seed_role_review_records,
]) {
  if (
    record.automatic_role_promotion_allowed !== false ||
    record.computation_allowed_now !== false ||
    record.public_selection_allowed_now !== false
  ) {
    fail(`Role queue activation mismatch: ${record.queue_record_id}`);
  }
}
if (
  roleQueue.deferred_scope.complete_core_195_national_capital_bank !==
    "AG74O-R1C" ||
  roleQueue.deferred_scope.complete_major_international_city_bank !==
    "AG74O-R1D" ||
  roleQueue.automatic_role_promotion_allowed !== false
) {
  fail("Role queue stage boundary mismatch.");
}

const stateMachine = readJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1b-computation-approval-state-machine.json"
);
if (
  stateMachine.status !==
  "ag74o_r1b_computation_approval_state_machine_locked"
) {
  fail("Approval state-machine status mismatch.");
}
for (const state of [
  "coordinate_verified",
  "timezone_verified",
  "computation_approved",
  "public_selection_approved",
  "blocked_pending_source_review",
  "superseded",
  "retired",
]) {
  if (!stateMachine.states.includes(state)) {
    fail(`Approval state missing: ${state}`);
  }
}
if (
  stateMachine.automatic_approval_allowed !== false ||
  stateMachine.approved_computation_records_now !== 0 ||
  stateMachine.approved_public_selection_records_now !== 0
) {
  fail("Approval state-machine activation mismatch.");
}

const review = readJson(
  "data/content-intelligence/quality-reviews/ag74o-r1b-coordinate-role-architecture.json"
);
if (
  review.status !==
    "ag74o_r1b_coordinate_role_architecture_completed" ||
  review.issue_count !== 0 ||
  review.summary.ready_for_ag74o_r1c !== true
) {
  fail("Review record mismatch.");
}
for (const key of [
  "complete_global_capital_bank_created_now",
  "complete_major_international_city_bank_created_now",
  "public_location_selector_activated",
  "panchang_computation_activated",
  "runtime_external_api_activated",
  "supabase_activated",
  "homepage_ui_changed",
]) {
  if (review.summary[key] !== false) {
    fail(`${key} must remain false.`);
  }
}

const readiness = readJson(
  "data/content-intelligence/quality-registry/ag74o-r1b-ag74o-r1c-global-capital-bank-readiness-record.json"
);
if (
  readiness.status !==
    "ag74o_r1b_ready_for_global_national_capital_bank" ||
  readiness.ready_for_ag74o_r1c !== true ||
  readiness.core_195_expected_state_count !== 195 ||
  readiness.public_record_count_now !== 0 ||
  readiness.computation_approved_record_count_now !== 0 ||
  readiness.next_stage_not_auto_started !== true
) {
  fail("AG74O-R1C readiness mismatch.");
}

const boundary = readJson(
  "data/content-intelligence/mutation-plans/ag74o-r1b-to-ag74o-r1c-global-capital-bank-boundary.json"
);
if (
  boundary.status !== "ag74o_r1b_to_r1c_boundary_locked" ||
  boundary.next_stage !== "AG74O-R1C" ||
  boundary.next_stage_not_auto_started !== true
) {
  fail("AG74O-R1C boundary mismatch.");
}
for (const blocker of [
  "Public location-combobox activation",
  "Panchang computation for candidate global records",
  "Direct promotion from the provenance-unknown capital CSV",
  "Runtime external API dependency",
  "Supabase activation",
  "Homepage UI change",
  "Deletion of historical AG70-AG74 location evidence",
]) {
  if (!boundary.blocked_without_explicit_validation.includes(blocker)) {
    fail(`Boundary blocker missing: ${blocker}`);
  }
}

const quality = readJson(
  "data/quality/ag74o-r1b-coordinate-role-architecture.json"
);
if (
  quality.status !== "ag74o_r1b_completed" ||
  quality.issue_count !== 0 ||
  quality.r1a_internal_location_record_count !== 6493 ||
  quality.coordinate_queue_record_count !== 6493 ||
  quality.india_role_review_record_count !== 52 ||
  quality.global_role_review_record_count !== 28 ||
  quality.simplemaps_candidate_city_record_count !== 49992 ||
  quality.diagnostic_capital_crosscheck_record_count !== 234 ||
  quality.approved_computation_record_count !== 0 ||
  quality.approved_public_selection_record_count !== 0 ||
  quality.ready_for_ag74o_r1c !== true
) {
  fail("Quality record mismatch.");
}
if (
  quality.ui_change_performed !== false ||
  quality.runtime_backend_activated !== false ||
  quality.external_runtime_api_required !== false
) {
  fail("Quality runtime boundary mismatch.");
}

pass("AG74O-R1B coordinate and location-role architecture is valid.");
pass("6,493 India records are queued without public or computation activation.");
pass("Global source evidence is registered and AG74O-R1C is ready.");
