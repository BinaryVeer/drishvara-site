import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(relativePath) {
  return path.join(root, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(full(relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(full(relativePath), "utf8"));
}

function fail(message) {
  console.error(`❌ AG74O-R1C validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

const requiredFiles = [
  "package.json",
  "scripts/generate-ag74o-r1c-global-national-capital-bank.mjs",
  "scripts/validate-ag74o-r1c-global-national-capital-bank.mjs",
  "data/knowledge-base/location-intelligence/production/ag74o-r1c-core-195-country-identity-register.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1c-global-national-capital-bank.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1c-capital-role-link-bank.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1c-extended-entity-capital-register.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1c-country-alias-crosswalk.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1c-authoritative-source-register.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1c-capital-conflict-review-queue.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1c-capital-timezone-review-queue.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1c-source-attribution-register.json",
  "data/content-intelligence/quality-reviews/ag74o-r1c-global-national-capital-bank.json",
  "data/content-intelligence/quality-registry/ag74o-r1c-ag74o-r1d-major-international-city-bank-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag74o-r1c-to-ag74o-r1d-major-international-city-bank-boundary.json",
  "data/quality/ag74o-r1c-global-national-capital-bank.json",
  "docs/quality/AG74O_R1C_GLOBAL_NATIONAL_CAPITAL_BANK.md",
];

for (const file of requiredFiles) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (
  pkg.scripts?.["generate:ag74o-r1c"] !==
  "node scripts/generate-ag74o-r1c-global-national-capital-bank.mjs"
) {
  fail("Missing or incorrect generate:ag74o-r1c package script.");
}
if (
  pkg.scripts?.["validate:ag74o-r1c"] !==
  "node scripts/validate-ag74o-r1c-global-national-capital-bank.mjs"
) {
  fail("Missing or incorrect validate:ag74o-r1c package script.");
}
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag74o-r1c")) {
  fail("validate:project must include validate:ag74o-r1c.");
}

const identity = readJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1c-core-195-country-identity-register.json"
);
if (
  identity.status !== "ag74o_r1c_core_195_country_identity_register_created" ||
  identity.records.length !== 195 ||
  identity.counts.records !== 195 ||
  identity.counts.unique_iso2 !== 195 ||
  identity.counts.unique_iso3 !== 195 ||
  identity.counts.unique_m49 !== 195 ||
  identity.counts.world_bank_crosschecks !== 194 ||
  identity.counts.expected_world_bank_absences !== 1
) {
  fail("Core-195 identity register count or status mismatch.");
}
for (const record of identity.records) {
  if (
    !record.country_record_id ||
    !record.iso2 ||
    !record.iso3 ||
    !record.m49 ||
    record.identity_verification_status !==
      "identity_crosswalk_verified_for_candidate_bank" ||
    record.computation_approval_status !== "blocked" ||
    record.public_selection_status !== "blocked"
  ) {
    fail(`Core identity governance mismatch: ${record.country_record_id}`);
  }
}
if (
  identity.governance.automatic_public_promotion_allowed !== false ||
  identity.governance.automatic_computation_activation_allowed !== false
) {
  fail("Identity-register activation boundary mismatch.");
}

const capital = readJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1c-global-national-capital-bank.json"
);
if (
  capital.status !== "ag74o_r1c_global_national_capital_candidate_bank_created" ||
  capital.records.length !== 195 ||
  capital.counts.core_country_records !== 195 ||
  capital.counts.records_with_world_bank_coordinate_crosscheck !== 194 ||
  capital.counts.expected_world_bank_absences !== 1 ||
  capital.counts.conflict_review_records !== 7 ||
  capital.counts.special_case_review_records !== 12
) {
  fail("National-capital candidate-bank count or status mismatch.");
}
for (const record of capital.records) {
  if (
    record.automatic_promotion_allowed !== false ||
    record.capital_role_verification_status !==
      "pending_current_authoritative_review" ||
    record.timezone_verification_status !== "pending_capital_level_mapping" ||
    record.computation_approval_status !== "blocked" ||
    record.public_selection_status !== "blocked"
  ) {
    fail(`Capital candidate activation mismatch: ${record.capital_bank_record_id}`);
  }
  if (
    record.world_bank_crosscheck &&
    (record.world_bank_crosscheck.evidence_status !==
      "crosscheck_candidate_not_coordinate_verified" ||
      record.world_bank_crosscheck.direct_promotion_allowed !== false)
  ) {
    fail(`World Bank coordinate boundary mismatch: ${record.capital_bank_record_id}`);
  }
}
if (
  capital.governance.bank_type !== "candidate_bank_not_public_runtime_bank" ||
  capital.governance.world_bank_coordinates_are_verified_coordinates !== false ||
  capital.governance.country_zone_candidate_is_capital_timezone_verification !==
    false ||
  capital.governance.runtime_external_api_dependency_allowed !== false ||
  capital.governance.public_output_allowed_now !== false
) {
  fail("National-capital bank governance mismatch.");
}

const roleLinks = readJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1c-capital-role-link-bank.json"
);
if (
  roleLinks.status !== "ag74o_r1c_capital_role_link_candidate_bank_created" ||
  roleLinks.counts.core_country_records !== 195 ||
  roleLinks.records.length !== roleLinks.counts.role_link_records ||
  roleLinks.records.length < 195 ||
  roleLinks.counts.conflict_review_records !== 7 ||
  roleLinks.counts.special_case_review_records !== 12
) {
  fail("Capital-role link bank count or status mismatch.");
}
for (const record of roleLinks.records) {
  if (
    record.automatic_role_promotion_allowed !== false ||
    record.role_verification_status !== "pending_current_authoritative_review" ||
    record.computation_approval_status !== "blocked" ||
    record.public_selection_status !== "blocked"
  ) {
    fail(`Capital-role link activation mismatch: ${record.role_link_id}`);
  }
}

const extended = readJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1c-extended-entity-capital-register.json"
);
if (
  extended.status !== "ag74o_r1c_extended_entity_capital_register_created" ||
  extended.records.length !== 6 ||
  extended.counts.records !== 6 ||
  extended.governance.merged_into_core_195 !== false ||
  extended.governance.automatic_sovereign_scope_promotion_allowed !== false
) {
  fail("Extended-entity register mismatch.");
}
for (const record of extended.records) {
  if (
    record.automatic_promotion_allowed !== false ||
    record.computation_approval_status !== "blocked" ||
    record.public_selection_status !== "blocked"
  ) {
    fail(`Extended-entity activation mismatch: ${record.extended_entity_record_id}`);
  }
}

const aliases = readJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1c-country-alias-crosswalk.json"
);
if (
  aliases.status !== "ag74o_r1c_country_capital_alias_crosswalk_created" ||
  aliases.country_alias_records.length !== 195 ||
  aliases.counts.country_records !== 195 ||
  aliases.counts.country_alias_values < 20 ||
  aliases.capital_alias_candidate_records.length < 3 ||
  aliases.governance.aliases_change_sovereign_scope !== false ||
  aliases.governance.alias_match_creates_duplicate_city_automatically !== false
) {
  fail("Country/capital alias crosswalk mismatch.");
}

const sources = readJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1c-authoritative-source-register.json"
);
if (
  sources.status !== "ag74o_r1c_authoritative_source_register_created" ||
  sources.source_records.length !== 5 ||
  sources.internal_candidate_inputs.length !== 1 ||
  sources.governance.runtime_fetch_dependency_allowed !== false ||
  sources.governance.automatic_public_or_computation_promotion_allowed !== false
) {
  fail("Authoritative-source register mismatch.");
}
for (const record of sources.source_records) {
  if (
    !record.source_id ||
    !record.source_url ||
    !record.sha256 ||
    record.direct_public_or_computation_promotion_allowed !== false
  ) {
    fail(`Authoritative-source evidence mismatch: ${record.source_id}`);
  }
}

const conflict = readJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1c-capital-conflict-review-queue.json"
);
if (
  conflict.status !== "ag74o_r1c_capital_conflict_review_queue_created" ||
  conflict.record_count !== 7 ||
  conflict.records.length !== 7 ||
  conflict.unresolved_count !== 7 ||
  conflict.governance.automatic_resolution_allowed !== false
) {
  fail("Capital-conflict queue mismatch.");
}
for (const record of conflict.records) {
  if (
    record.review_status !== "open" ||
    record.computation_approval_status !== "blocked" ||
    record.public_selection_status !== "blocked"
  ) {
    fail(`Capital-conflict activation mismatch: ${record.checklist_id}`);
  }
}

const timezone = readJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1c-capital-timezone-review-queue.json"
);
if (
  timezone.status !== "ag74o_r1c_capital_timezone_review_queue_created" ||
  timezone.records.length !== 195 ||
  timezone.counts.records !== 195 ||
  timezone.counts.single_zone_country_candidates !== 167 ||
  timezone.counts.multi_zone_country_reviews !== 28 ||
  timezone.counts.timezone_verified_records !== 0
) {
  fail("Capital-timezone queue count or status mismatch.");
}
for (const record of timezone.records) {
  if (
    record.timezone_verification_status !== "pending_capital_level_mapping" ||
    record.automatic_timezone_promotion_allowed !== false ||
    record.computation_approval_status !== "blocked" ||
    record.public_selection_status !== "blocked"
  ) {
    fail(`Capital-timezone activation mismatch: ${record.timezone_review_id}`);
  }
}

const attribution = readJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1c-source-attribution-register.json"
);
if (
  attribution.status !== "ag74o_r1c_source_attribution_register_created" ||
  attribution.records.length !== 6 ||
  attribution.governance.runtime_external_fetch_required !== false ||
  attribution.governance.public_output_allowed_now !== false
) {
  fail("Source-attribution register mismatch.");
}

const review = readJson(
  "data/content-intelligence/quality-reviews/ag74o-r1c-global-national-capital-bank.json"
);
if (
  review.status !== "ag74o_r1c_global_national_capital_bank_completed" ||
  review.issue_count !== 0 ||
  review.summary.identity_records !== 195 ||
  review.summary.capital_candidate_country_records !== 195 ||
  review.summary.extended_entity_records !== 6 ||
  review.summary.unresolved_capital_conflicts !== 7 ||
  review.summary.special_case_reviews !== 12 ||
  review.summary.multi_zone_timezone_reviews !== 28 ||
  review.summary.ready_for_ag74o_r1d !== true
) {
  fail("R1C quality-review record mismatch.");
}
for (const key of [
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
  "data/content-intelligence/quality-registry/ag74o-r1c-ag74o-r1d-major-international-city-bank-readiness-record.json"
);
if (
  readiness.status !== "ag74o_r1c_ready_for_major_international_city_bank" ||
  readiness.ready_for_ag74o_r1d !== true ||
  readiness.core_195_identity_records !== 195 ||
  readiness.national_capital_candidate_country_records !== 195 ||
  readiness.extended_entity_records !== 6 ||
  readiness.public_record_count_now !== 0 ||
  readiness.computation_approved_record_count_now !== 0 ||
  readiness.next_stage_not_auto_started !== true
) {
  fail("AG74O-R1D readiness record mismatch.");
}

const boundary = readJson(
  "data/content-intelligence/mutation-plans/ag74o-r1c-to-ag74o-r1d-major-international-city-bank-boundary.json"
);
if (
  boundary.status !== "ag74o_r1c_to_r1d_boundary_locked" ||
  boundary.next_stage !== "AG74O-R1D" ||
  boundary.next_stage_not_auto_started !== true ||
  !boundary.blocked_without_explicit_validation.includes(
    "Public location-combobox activation"
  ) ||
  !boundary.blocked_without_explicit_validation.includes(
    "Panchang computation for candidate global records"
  )
) {
  fail("AG74O-R1C to R1D boundary mismatch.");
}

const quality = readJson(
  "data/quality/ag74o-r1c-global-national-capital-bank.json"
);
if (
  quality.status !== "ag74o_r1c_completed" ||
  quality.issue_count !== 0 ||
  quality.public_activation_allowed_now !== false ||
  quality.computation_activation_allowed_now !== false ||
  quality.ready_for_ag74o_r1d !== true
) {
  fail("R1C quality record mismatch.");
}

const documentation = fs.readFileSync(
  full("docs/quality/AG74O_R1C_GLOBAL_NATIONAL_CAPITAL_BANK.md"),
  "utf8"
);
for (const phrase of [
  "195 core sovereign-state identity records",
  "Public-selection approvals: **0**",
  "Computation approvals: **0**",
  "World Bank coordinates are retained only as crosscheck candidates",
]) {
  if (!documentation.includes(phrase)) {
    fail(`R1C documentation phrase missing: ${phrase}`);
  }
}

pass("AG74O-R1C governed national-capital candidate bank is valid.");
pass("195 core identities and 195 country-level capital candidate records are present.");
pass("Seven conflict reviews, twelve special cases and all timezone mappings remain governed.");
pass("Public selection, Panchang computation, runtime API, Supabase and homepage mutation remain blocked.");
pass("AG74O-R1D is ready but not auto-started.");
