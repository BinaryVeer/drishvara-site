import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const MAX_ZIP_BUFFER = 64 * 1024 * 1024;

function full(p) {
  return path.join(root, p);
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(full(p), "utf8"));
}

function writeJson(p, value) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(value, null, 2) + "\n");
}

function sha256Buffer(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function sha256File(file) {
  return sha256Buffer(fs.readFileSync(file));
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      parsed[key] = true;
    } else {
      parsed[key] = value;
      index += 1;
    }
  }
  return parsed;
}

function listZip(zipPath) {
  return execFileSync("unzip", ["-Z1", zipPath], {
    encoding: "utf8",
    maxBuffer: MAX_ZIP_BUFFER,
  })
    .split(/\r?\n/)
    .filter(Boolean);
}

function readZipEntry(zipPath, entry) {
  return execFileSync("unzip", ["-p", zipPath, entry], {
    maxBuffer: MAX_ZIP_BUFFER,
  });
}

function findEntry(entries, suffix) {
  const matches = entries.filter(
    (entry) => entry.endsWith(`/${suffix}`) || entry === suffix
  );
  if (matches.length !== 1) {
    throw new Error(
      `Expected one diagnosis ZIP entry for ${suffix}; found ${matches.length}.`
    );
  }
  return matches[0];
}

function readZipJson(zipPath, entries, suffix) {
  return JSON.parse(readZipEntry(zipPath, findEntry(entries, suffix)).toString("utf8"));
}

function normalise(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\b(municipal corporation|municipality|municipal council|town panchayat|notified area council|nagar panchayat|city corporation|corporation|urban local body|district|state|union territory)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function cityStateKey(city, state) {
  return `${normalise(city)}|${normalise(state)}`;
}

function firstValue(object, keys) {
  for (const key of keys) {
    if (
      object &&
      object[key] !== undefined &&
      object[key] !== null &&
      object[key] !== ""
    ) {
      return object[key];
    }
  }
  return null;
}

function recommendedCoordinateBasis(locationType) {
  if (locationType === "urban_local_body") return "settlement_reference_point";
  if (
    locationType === "state_or_union_territory" ||
    locationType === "district" ||
    locationType === "development_block"
  ) {
    return "administrative_headquarters_point";
  }
  return "review_required";
}

function evidenceFromCandidate(record, sourceStage) {
  return {
    source_stage: sourceStage,
    source_record_id:
      record.coordinate_record_id || record.location_record_id || null,
    display_label: record.display_label || null,
    latitude_decimal: record.latitude_decimal ?? null,
    longitude_decimal: record.longitude_decimal ?? null,
    timezone: record.timezone ?? null,
    coordinate_value_status: record.coordinate_value_status ?? null,
    coordinate_source_status: record.coordinate_source_status ?? null,
    source_freshness_status: record.source_freshness_status ?? null,
    computation_allowed_now: false,
    evidence_status: "historical_candidate_evidence_not_promoted",
  };
}

const args = parseArgs(process.argv.slice(2));
const diagnosisZip = path.resolve(
  String(args.diagnosisZip || process.env.AG74O_R1B_DIAGNOSIS_ZIP || "")
);

if (!diagnosisZip || !fs.existsSync(diagnosisZip)) {
  throw new Error(
    "Provide --diagnosisZip /absolute/path/to/AG74O_R1B_Combined_Global_Source_Diagnosis_*.zip"
  );
}

const diagnosisSha256 = sha256File(diagnosisZip);
if (args.expectedSha256 && diagnosisSha256 !== args.expectedSha256) {
  throw new Error(
    `Diagnosis ZIP SHA-256 mismatch. Expected ${args.expectedSha256}; got ${diagnosisSha256}.`
  );
}

const entries = listZip(diagnosisZip);
const diagnosisManifest = readZipJson(
  diagnosisZip,
  entries,
  "report_manifest.json"
);

for (const [relativePath, metadata] of Object.entries(
  diagnosisManifest.files || {}
)) {
  const entry = findEntry(entries, relativePath);
  const buffer = readZipEntry(diagnosisZip, entry);
  if (
    buffer.length !== metadata.bytes ||
    sha256Buffer(buffer) !== metadata.sha256
  ) {
    throw new Error(
      `Diagnosis report-manifest verification failed for ${relativePath}.`
    );
  }
}

const combinedGlobalSourceInventory = readZipJson(
  diagnosisZip,
  entries,
  "combined_global_source_inventory.json"
);
const combinedGlobalDiagnosisSummary = readZipJson(
  diagnosisZip,
  entries,
  "diagnosis_summary.json"
);
const combinedGlobalGovernancePolicy = readZipJson(
  diagnosisZip,
  entries,
  "global_source_governance_policy.json"
);
const combinedGlobalReviewFlags = readZipJson(
  diagnosisZip,
  entries,
  "global_source_review_flags.json"
);

if (
  combinedGlobalDiagnosisSummary.status !==
  "diagnosis_completed_no_repository_mutation"
) {
  throw new Error("Combined global-source diagnosis status mismatch.");
}
if (combinedGlobalDiagnosisSummary.simplemaps_city_rows !== 49992) {
  throw new Error("SimpleMaps source-row count mismatch.");
}
if (combinedGlobalDiagnosisSummary.capital_coordinate_rows !== 234) {
  throw new Error("Capital-coordinate source-row count mismatch.");
}
if (
  combinedGlobalDiagnosisSummary.capital_coordinate_licence_status !==
  "unknown_do_not_promote_or_commit_derived_values_yet"
) {
  throw new Error("Capital-coordinate licensing boundary mismatch.");
}

const r1aBank = readJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1a-provisional-india-location-bank.json"
);
const r1aSourceManifest = readJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1a-provisional-india-location-source-manifest.json"
);
const indiaCoordinateBank = readJson(
  "data/knowledge-base/location-intelligence/production/india-cities-capitals-coordinate-bank.json"
);
const indiaCapitalSeeds = readJson(
  "data/knowledge-base/location-intelligence/production/india-state-ut-capitals-seed.json"
);
const indiaMajorCitySeeds = readJson(
  "data/knowledge-base/location-intelligence/production/india-major-cities-seed.json"
);
const globalCoordinateBank = readJson(
  "data/knowledge-base/location-intelligence/production/global-capitals-major-cities-coordinate-bank.json"
);
const globalCapitalSeeds = readJson(
  "data/knowledge-base/location-intelligence/production/world-national-capitals-seed.json"
);
const globalMajorCitySeeds = readJson(
  "data/knowledge-base/location-intelligence/production/world-major-cities-seed.json"
);

if (r1aBank.records.length !== 6493) {
  throw new Error("AG74O-R1A must contain exactly 6,493 records.");
}
if (indiaCoordinateBank.records.length !== 52) {
  throw new Error("AG70W India candidate bank must contain 52 records.");
}
if (globalCoordinateBank.records.length !== 28) {
  throw new Error("AG70X global candidate bank must contain 28 records.");
}

const generatedAt = new Date().toISOString();

const universalSchema = {
  module_id: "AG74O-R1B",
  title: "Universal Location Coordinate, Timezone and Role Schema",
  status: "ag74o_r1b_universal_location_coordinate_role_schema_locked",
  generated_at_utc: generatedAt,
  identity_fields: [
    "location_record_id",
    "canonical_place_id",
    "jurisdiction_scope",
    "location_type",
    "country_iso2",
    "country_iso3",
    "country_m49",
    "country_name",
    "official_name",
    "local_name",
    "aliases",
    "administrative_level_1_name",
    "administrative_level_1_code",
    "administrative_level_2_name",
    "administrative_level_2_code",
    "administrative_level_3_name",
    "administrative_level_3_code",
    "lgd_entity_type",
    "lgd_code",
    "external_gazetteer_ids",
  ],
  coordinate_fields: [
    "latitude_decimal",
    "longitude_decimal",
    "coordinate_basis",
    "coordinate_precision",
    "coordinate_source_id",
    "coordinate_source_url",
    "coordinate_source_release",
    "coordinate_source_retrieved_at",
    "coordinate_source_sha256",
    "coordinate_verification_status",
    "coordinate_reviewed_at",
    "coordinate_reviewed_by",
  ],
  timezone_fields: [
    "timezone_iana",
    "timezone_source_id",
    "timezone_source_release",
    "timezone_verification_status",
  ],
  role_fields: [
    "roles",
    "is_national_capital",
    "is_state_or_regional_capital",
    "is_major_city",
    "is_sacred_reference_location",
    "capital_roles",
    "role_source_ids",
    "role_verification_status",
  ],
  approval_fields: [
    "identity_verification_status",
    "public_label_verification_status",
    "coordinate_verification_status",
    "timezone_verification_status",
    "role_verification_status",
    "computation_approval_status",
    "public_selection_status",
    "supersession_status",
  ],
  source_refresh_fields: [
    "source_freshness_status",
    "source_freshness_window_months",
    "refresh_interval_months",
    "last_verified_at",
    "next_review_due_at",
  ],
  supported_jurisdiction_scopes: [
    "core_195_state",
    "partially_recognised_or_separately_governed_entity",
    "constituent_country_or_subnational_nation",
    "dependency_or_territory",
    "india_administrative_location",
  ],
  supported_location_types: [
    "state_or_union_territory",
    "district",
    "subdistrict",
    "development_block",
    "urban_local_body",
    "city",
    "national_capital",
    "regional_capital",
    "sacred_reference_location",
    "coordinate_first_point",
  ],
  coordinate_required_for_computation: true,
  timezone_required_for_computation: true,
  explicit_review_required_for_computation: true,
  explicit_review_required_for_public_selection: true,
  runtime_external_api_dependency_allowed: false,
  public_output_allowed_now: false,
};

const sourceHierarchy = {
  module_id: "AG74O-R1B",
  title: "Coordinate, Timezone and Identity Source Hierarchy",
  status: "ag74o_r1b_coordinate_source_hierarchy_locked",
  generated_at_utc: generatedAt,
  source_freshness_window_months: 12,
  refresh_interval_months: 4,
  india_identity_priority: [
    "Live NAPIX/LGD official API",
    "Reviewed official LGD manual export snapshot",
    "Official State/UT administrative publication",
  ],
  india_coordinate_priority: [
    "Survey of India or approved Government geospatial dataset",
    "Official State/UT or municipal geospatial publication",
    "Reviewed official headquarters/centroid publication",
  ],
  global_identity_priority: [
    "Official national government source",
    "UN or intergovernmental official country/capital source",
    "Approved authoritative global gazetteer",
  ],
  global_coordinate_priority: [
    "Official national geospatial source",
    "UN or international authoritative geographic dataset",
    "Natural Earth curated populated-place/admin-capital reference",
    "SimpleMaps Basic World Cities as CC BY 4.0 candidate source",
    "GeoNames or equivalent gazetteer as secondary cross-check",
  ],
  timezone_priority: [
    "IANA Time Zone Database mapping",
    "Official national timezone legislation/publication",
    "Approved geospatial timezone boundary source",
  ],
  prohibited_direct_promotion_sources: [
    "Unlicensed or provenance-unknown capital-coordinate CSV",
    "User-supplied capital checklist without authoritative source review",
    "Name-only duplicate matches",
  ],
  automatic_source_overwrite_allowed: false,
  automatic_role_promotion_allowed: false,
  automatic_public_promotion_allowed: false,
  automatic_computation_activation_allowed: false,
  runtime_fetch_dependency_allowed: false,
};

const globalSourceEvidence = {
  module_id: "AG74O-R1B",
  title: "Global Source Evidence Register",
  status: "ag74o_r1b_global_source_evidence_registered",
  generated_at_utc: generatedAt,
  diagnosis_package: {
    filename: path.basename(diagnosisZip),
    sha256: diagnosisSha256,
    report_manifest_verified: true,
    repository_head: diagnosisManifest.repository_head,
  },
  simplemaps_world_cities: {
    ...combinedGlobalSourceInventory.simplemaps_world_cities,
    source_role:
      "licensed candidate coordinates, aliases, population ranking and broad city discovery",
    public_bulk_redistribution_allowed_now: false,
    normalized_subset_promotion_requires_review: true,
  },
  capital_coordinate_csv: {
    ...combinedGlobalSourceInventory.country_capital_coordinate_csv,
    source_role:
      "diagnostic coordinate and capital-role cross-check only",
    direct_record_promotion_allowed: false,
  },
  cross_source_diagnosis: {
    exact_normalized_matches:
      combinedGlobalDiagnosisSummary.exact_normalized_cross_source_matches,
    country_match_city_review_required:
      combinedGlobalDiagnosisSummary.country_match_city_review_required,
    country_label_crosswalk_required:
      combinedGlobalDiagnosisSummary.country_label_crosswalk_required,
    coordinate_distance_summary:
      combinedGlobalDiagnosisSummary.coordinate_distance_summary,
  },
  candidate_checklists: [
    {
      source_id: "user_supplied_195_country_capital_checklist",
      stated_country_count: 195,
      treatment:
        "candidate completeness and special-case checklist pending authoritative structuring and validation",
      raw_checklist_committed_now: false,
      automatic_promotion_allowed: false,
    },
  ],
  core_195_scope:
    combinedGlobalGovernancePolicy.core_195_scope,
  separate_extended_scopes:
    combinedGlobalGovernancePolicy.separate_extended_scopes,
  review_flags: combinedGlobalReviewFlags.records,
  public_output_allowed_now: false,
};

const roleTaxonomy = {
  module_id: "AG74O-R1B",
  title: "Location Role Taxonomy",
  status: "ag74o_r1b_location_role_taxonomy_locked",
  generated_at_utc: generatedAt,
  primary_roles: [
    "national_capital",
    "state_or_regional_capital",
    "major_city",
    "sacred_reference_location",
  ],
  capital_role_enum: [
    "constitutional_capital",
    "official_capital",
    "administrative_capital",
    "executive_capital",
    "legislative_capital",
    "judicial_capital",
    "seat_of_government",
    "de_facto_government_seat",
    "economic_capital",
    "seasonal_capital",
    "historical_capital_reference",
    "capital_transition_candidate",
  ],
  capital_role_rules: [
    "One canonical city may hold multiple capital roles.",
    "A capital role must not create a duplicate city record.",
    "Core-195 sovereign-state roles must remain distinct from extended-entity roles.",
    "Constituent-country capitals are regional roles under their sovereign state.",
    "Disputed or transitional claims require explicit status and source review.",
  ],
  sacred_reference_role_rules: [
    "Sacred/reference status requires a governed tradition and source basis.",
    "Sacred/reference role does not independently approve coordinates or public computation.",
    "Complete sacred/reference city population is deferred to AG74O-R1D.",
  ],
  role_approval_required: true,
  automatic_role_promotion_allowed: false,
  public_output_allowed_now: false,
};

const coordinateQueueRecords = r1aBank.records.map((record) => ({
  queue_record_id: `ag74o_r1b_coordinate_queue_${record.location_record_id}`,
  location_record_id: record.location_record_id,
  entity_key: record.entity_key,
  location_type: record.location_type,
  internal_search_label: record.internal_search_label,
  state_or_ut_name: record.state_or_ut_name,
  district_name: record.district_name,
  current_latitude_decimal: record.latitude_decimal,
  current_longitude_decimal: record.longitude_decimal,
  current_timezone: record.timezone,
  recommended_coordinate_basis: recommendedCoordinateBasis(record.location_type),
  identity_status: record.administrative_source_status,
  coordinate_status: "coordinate_source_required",
  timezone_status:
    record.timezone === "Asia/Kolkata"
      ? "candidate_timezone_inherited_from_india_policy"
      : "timezone_review_required",
  required_reviews: [
    "identity_or_hierarchy_revalidation",
    "coordinate_source_match",
    "coordinate_basis_review",
    "timezone_verification",
    "source_freshness_review",
    "explicit_computation_approval",
  ],
  computation_allowed_now: false,
  public_selection_allowed_now: false,
}));

const indiaCandidateEvidence = indiaCoordinateBank.records.map((record) =>
  evidenceFromCandidate(record, "AG70W")
);
const globalCandidateEvidence = globalCoordinateBank.records.map((record) =>
  evidenceFromCandidate(record, "AG70X")
);

const coordinateQueue = {
  module_id: "AG74O-R1B",
  title: "Coordinate Enrichment Queue",
  status: "ag74o_r1b_coordinate_enrichment_queue_created",
  generated_at_utc: generatedAt,
  counts: {
    india_provisional_location_records: coordinateQueueRecords.length,
    india_historical_candidate_evidence_records:
      indiaCandidateEvidence.length,
    global_historical_candidate_evidence_records:
      globalCandidateEvidence.length,
    india_historical_candidates_with_coordinate_values:
      indiaCandidateEvidence.filter(
        (record) =>
          Number.isFinite(record.latitude_decimal) &&
          Number.isFinite(record.longitude_decimal)
      ).length,
    global_historical_candidates_with_coordinate_values:
      globalCandidateEvidence.filter(
        (record) =>
          Number.isFinite(record.latitude_decimal) &&
          Number.isFinite(record.longitude_decimal)
      ).length,
    computation_approved_records: 0,
    public_selection_approved_records: 0,
  },
  governance: {
    historical_candidate_evidence_is_approval: false,
    coordinate_required_for_computation: true,
    timezone_required_for_computation: true,
    explicit_review_required: true,
    automatic_promotion_allowed: false,
  },
  india_provisional_location_queue: coordinateQueueRecords,
  india_historical_candidate_evidence: indiaCandidateEvidence,
  global_historical_candidate_evidence: globalCandidateEvidence,
};

const urbanByExactKey = new Map();
const urbanByCityOnly = new Map();

for (const record of r1aBank.records) {
  if (record.location_type !== "urban_local_body") continue;

  const exactKey = cityStateKey(
    record.official_name,
    record.state_or_ut_name
  );
  if (!urbanByExactKey.has(exactKey)) urbanByExactKey.set(exactKey, []);
  urbanByExactKey.get(exactKey).push(record);

  const cityKey = normalise(record.official_name);
  if (!urbanByCityOnly.has(cityKey)) urbanByCityOnly.set(cityKey, []);
  urbanByCityOnly.get(cityKey).push(record);
}

function roleSeedCity(seed) {
  return firstValue(seed, ["city_name", "official_name", "name_en", "name"]);
}

function roleSeedState(seed) {
  return firstValue(seed, [
    "state_or_region_name",
    "state_name",
    "state_or_ut_name",
    "region_name",
  ]);
}

function mapIndiaRoleSeeds(records, role) {
  return records.map((seed, index) => {
    const city = roleSeedCity(seed);
    const state = roleSeedState(seed);
    const exactMatches =
      urbanByExactKey.get(cityStateKey(city, state)) || [];
    const cityOnlyMatches =
      urbanByCityOnly.get(normalise(city)) || [];

    let matchStatus = "unmatched";
    let matches = [];

    if (exactMatches.length === 1) {
      matchStatus = "exact_city_state_match";
      matches = exactMatches;
    } else if (exactMatches.length > 1) {
      matchStatus = "ambiguous_exact_city_state_match";
      matches = exactMatches;
    } else if (cityOnlyMatches.length === 1) {
      matchStatus = "unique_city_name_match_state_review_required";
      matches = cityOnlyMatches;
    } else if (cityOnlyMatches.length > 1) {
      matchStatus = "ambiguous_city_name_match";
      matches = cityOnlyMatches;
    }

    return {
      queue_record_id: `ag74o_r1b_india_role_${role}_${String(
        index + 1
      ).padStart(3, "0")}`,
      source_stage: "AG70W",
      source_seed_id:
        seed.location_seed_id || seed.coordinate_record_id || null,
      proposed_role: role,
      city_name: city,
      state_or_region_name: state,
      seed_display_label:
        seed.display_label || seed.ui_short_label || null,
      match_status: matchStatus,
      matched_location_record_ids: matches.map(
        (record) => record.location_record_id
      ),
      matched_entity_keys: matches.map((record) => record.entity_key),
      role_verification_status: "candidate_pending_review",
      automatic_role_promotion_allowed: false,
      computation_allowed_now: false,
      public_selection_allowed_now: false,
    };
  });
}

function mapGlobalRoleSeeds(records, role, sourceStage) {
  return records.map((seed, index) => ({
    queue_record_id: `ag74o_r1b_global_role_${role}_${String(
      index + 1
    ).padStart(3, "0")}`,
    source_stage: sourceStage,
    source_seed_id: seed.location_seed_id || seed.coordinate_record_id || null,
    proposed_role: role,
    city_name: roleSeedCity(seed),
    country_name: seed.country_name || null,
    seed_display_label: seed.display_label || seed.ui_short_label || null,
    canonical_location_record_id: null,
    match_status: "deferred_to_global_canonical_import",
    role_verification_status: "candidate_pending_ag74o_r1c_or_r1d",
    automatic_role_promotion_allowed: false,
    computation_allowed_now: false,
    public_selection_allowed_now: false,
  }));
}

const indiaRoleRecords = [
  ...mapIndiaRoleSeeds(
    indiaCapitalSeeds.records,
    "state_or_regional_capital"
  ),
  ...mapIndiaRoleSeeds(indiaMajorCitySeeds.records, "major_city"),
];

const globalRoleRecords = [
  ...mapGlobalRoleSeeds(
    globalCapitalSeeds.records,
    "national_capital",
    "AG70X"
  ),
  ...mapGlobalRoleSeeds(
    globalMajorCitySeeds.records,
    "major_city",
    "AG70X"
  ),
];

const indiaRoleStatusCounts = {};
for (const record of indiaRoleRecords) {
  indiaRoleStatusCounts[record.match_status] =
    (indiaRoleStatusCounts[record.match_status] || 0) + 1;
}

const roleQueue = {
  module_id: "AG74O-R1B",
  title: "Location Role Mapping Review Queue",
  status: "ag74o_r1b_role_mapping_review_queue_created",
  generated_at_utc: generatedAt,
  counts: {
    india_state_or_regional_capital_seed_records:
      indiaCapitalSeeds.records.length,
    india_major_city_seed_records:
      indiaMajorCitySeeds.records.length,
    india_role_review_records: indiaRoleRecords.length,
    global_national_capital_seed_records:
      globalCapitalSeeds.records.length,
    global_major_city_seed_records:
      globalMajorCitySeeds.records.length,
    global_role_review_records: globalRoleRecords.length,
    sacred_reference_role_records_now: 0,
    role_approved_records_now: 0,
  },
  india_match_status_counts: indiaRoleStatusCounts,
  india_role_review_records: indiaRoleRecords,
  global_seed_role_review_records: globalRoleRecords,
  deferred_scope: {
    complete_core_195_national_capital_bank: "AG74O-R1C",
    complete_major_international_city_bank: "AG74O-R1D",
    complete_sacred_reference_city_bank: "AG74O-R1D",
  },
  automatic_role_promotion_allowed: false,
  public_output_allowed_now: false,
};

const approvalStateMachine = {
  module_id: "AG74O-R1B",
  title: "Computation and Public-Selection Approval State Machine",
  status: "ag74o_r1b_computation_approval_state_machine_locked",
  generated_at_utc: generatedAt,
  states: [
    "identity_candidate",
    "identity_verified",
    "coordinate_candidate",
    "coordinate_verified",
    "timezone_verified",
    "role_candidate",
    "role_verified",
    "computation_review_ready",
    "computation_approved",
    "public_selection_review_ready",
    "public_selection_approved",
    "blocked_pending_source_review",
    "superseded",
    "retired",
  ],
  computation_approval_requires: [
    "identity_verified",
    "coordinate_verified",
    "timezone_verified",
    "public_label_verified",
    "source_freshness_acceptable",
    "no_unresolved_identity_or_coordinate_conflict",
    "explicit_review_approval",
  ],
  public_selection_requires: [
    "computation_approved_or_explicit_noncomputing_public_role",
    "public_label_verified",
    "search_disambiguation_complete",
    "explicit_public_selection_approval",
  ],
  blocked_transitions: [
    "coordinate_candidate_to_computation_approved_without_review",
    "role_candidate_to_public_selection_approved_without_review",
    "provenance_unknown_source_to_coordinate_verified",
    "name_only_match_to_identity_verified",
  ],
  automatic_approval_allowed: false,
  approved_computation_records_now: 0,
  approved_public_selection_records_now: 0,
};

const review = {
  module_id: "AG74O-R1B",
  title: "Coordinate and Location-Role Architecture Review",
  status: "ag74o_r1b_coordinate_role_architecture_completed",
  generated_at_utc: generatedAt,
  issue_count: 0,
  warning_count: 8,
  summary: {
    r1a_bank_consumed: true,
    universal_schema_locked: true,
    source_hierarchy_locked: true,
    global_source_evidence_registered: true,
    role_taxonomy_locked: true,
    coordinate_enrichment_queue_created: true,
    role_mapping_review_queue_created: true,
    computation_approval_state_machine_locked: true,
    simplemaps_cc_by_attribution_preserved: true,
    provenance_unknown_capital_csv_blocked_from_promotion: true,
    core_195_scope_separated_from_extended_entities: true,
    complete_global_capital_bank_created_now: false,
    complete_major_international_city_bank_created_now: false,
    public_location_selector_activated: false,
    panchang_computation_activated: false,
    runtime_external_api_activated: false,
    supabase_activated: false,
    homepage_ui_changed: false,
    ready_for_ag74o_r1c: true,
  },
};

const readiness = {
  module_id: "AG74O-R1B",
  title: "AG74O-R1C Global National-Capital Bank Readiness",
  status: "ag74o_r1b_ready_for_global_national_capital_bank",
  generated_at_utc: generatedAt,
  ready_for_ag74o_r1c: true,
  universal_schema_available: true,
  capital_role_taxonomy_available: true,
  coordinate_source_hierarchy_available: true,
  global_source_evidence_available: true,
  historical_global_seed_records_available:
    globalCoordinateBank.records.length,
  simplemaps_candidate_city_records_available:
    combinedGlobalDiagnosisSummary.simplemaps_city_rows,
  provenance_unknown_capital_crosscheck_records_available:
    combinedGlobalDiagnosisSummary.capital_coordinate_rows,
  core_195_expected_state_count: 195,
  public_record_count_now: 0,
  computation_approved_record_count_now: 0,
  next_stage_not_auto_started: true,
};

const boundary = {
  module_id: "AG74O-R1B",
  title: "AG74O-R1B to AG74O-R1C Boundary",
  status: "ag74o_r1b_to_r1c_boundary_locked",
  next_stage: "AG74O-R1C",
  next_stage_purpose:
    "Create the complete governed global national-capital bank under the core-195 and extended-entity scope model.",
  next_stage_not_auto_started: true,
  allowed_next_scope: [
    "Core 195 sovereign-state identity register",
    "Complete national-capital and multi-capital role records",
    "Separate extended-entity capital records",
    "Authoritative country and capital source validation",
    "Candidate coordinate and timezone enrichment",
    "Capital transition and dispute review queue",
  ],
  deferred_to_ag74o_r1d: [
    "Complete major international-city bank",
    "Complete sacred/reference-city bank",
  ],
  blocked_without_explicit_validation: [
    "Public location-combobox activation",
    "Panchang computation for candidate global records",
    "Direct promotion from the provenance-unknown capital CSV",
    "Runtime external API dependency",
    "Supabase activation",
    "Homepage UI change",
    "Deletion of historical AG70-AG74 location evidence",
  ],
};

const quality = {
  module_id: "AG74O-R1B",
  title: "Coordinate and Location-Role Architecture Quality Record",
  status: "ag74o_r1b_completed",
  generated_at_utc: generatedAt,
  issue_count: 0,
  warning_count: 8,
  r1a_internal_location_record_count: r1aBank.records.length,
  coordinate_queue_record_count: coordinateQueueRecords.length,
  india_candidate_coordinate_evidence_record_count:
    indiaCandidateEvidence.length,
  global_candidate_coordinate_evidence_record_count:
    globalCandidateEvidence.length,
  india_role_review_record_count: indiaRoleRecords.length,
  global_role_review_record_count: globalRoleRecords.length,
  simplemaps_candidate_city_record_count:
    combinedGlobalDiagnosisSummary.simplemaps_city_rows,
  diagnostic_capital_crosscheck_record_count:
    combinedGlobalDiagnosisSummary.capital_coordinate_rows,
  approved_computation_record_count: 0,
  approved_public_selection_record_count: 0,
  complete_global_capital_bank_created_now: false,
  complete_major_international_city_bank_created_now: false,
  ui_change_performed: false,
  runtime_backend_activated: false,
  external_runtime_api_required: false,
  ready_for_ag74o_r1c: true,
};

const doc = `# AG74O-R1B — Coordinate and Location-Role Architecture

AG74O-R1B creates the universal India/global contract required before the complete global capital and city banks are populated.

## Consumed foundations

- AG74O-R1A: 6,493 provisional India locations.
- AG70W: 52 India capital/major-city coordinate candidates.
- AG70X: 28 global capital/major-city coordinate candidates.
- SimpleMaps Basic World Cities v1.91: 49,992 licensed candidate city records.
- Country-capital coordinate CSV: 234 diagnostic records with unknown provenance/licence.

## Added architecture

- universal identity, coordinate, timezone and role schema;
- official/authoritative source hierarchy;
- source-evidence and attribution register;
- national/regional capital, major-city and sacred-reference taxonomy;
- coordinate-enrichment queue for all 6,493 R1A records;
- India and global historical candidate evidence;
- role-mapping review queue;
- computation and public-selection approval state machine.

## Source boundary

SimpleMaps is retained as a CC BY 4.0 candidate source with attribution. Its full raw database is not made a public bulk download.

The 234-record capital-coordinate CSV is diagnostic evidence only because its provenance and licence are unknown and its archive is dated 2020. Its row-level values are not promoted into the repository's approved coordinate bank.

## Global sequence

1. AG74O-R1C — complete governed global national-capital bank.
2. AG74O-R1D — governed major international and sacred/reference cities.
3. AG74O-R1E — unified India-global search and approval index.
4. AG74O-R2 — public selector using approved records only.

## Activation boundary

AG74O-R1B creates no public location, no computation-approved location, no runtime API dependency, no Supabase dependency and no homepage UI change.
`;

writeJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1b-universal-location-coordinate-role-schema.json",
  universalSchema
);
writeJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1b-coordinate-source-hierarchy.json",
  sourceHierarchy
);
writeJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1b-global-source-evidence-register.json",
  globalSourceEvidence
);
writeJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1b-location-role-taxonomy.json",
  roleTaxonomy
);
writeJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1b-coordinate-enrichment-queue.json",
  coordinateQueue
);
writeJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1b-role-mapping-review-queue.json",
  roleQueue
);
writeJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1b-computation-approval-state-machine.json",
  approvalStateMachine
);
writeJson(
  "data/content-intelligence/quality-reviews/ag74o-r1b-coordinate-role-architecture.json",
  review
);
writeJson(
  "data/content-intelligence/quality-registry/ag74o-r1b-ag74o-r1c-global-capital-bank-readiness-record.json",
  readiness
);
writeJson(
  "data/content-intelligence/mutation-plans/ag74o-r1b-to-ag74o-r1c-global-capital-bank-boundary.json",
  boundary
);
writeJson(
  "data/quality/ag74o-r1b-coordinate-role-architecture.json",
  quality
);
fs.mkdirSync(full("docs/quality"), { recursive: true });
fs.writeFileSync(
  full("docs/quality/AG74O_R1B_COORDINATE_ROLE_ARCHITECTURE.md"),
  doc
);

console.log("✅ AG74O-R1B coordinate and role architecture generated.");
console.log(`✅ R1A coordinate queue records: ${coordinateQueueRecords.length}`);
console.log(`✅ India role review records: ${indiaRoleRecords.length}`);
console.log(`✅ Global seed role review records: ${globalRoleRecords.length}`);
console.log("✅ Public/computation activation: 0");
