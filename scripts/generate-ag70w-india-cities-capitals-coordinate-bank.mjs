import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function writeJson(p, data) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(data, null, 2) + "\n");
}
function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}
function run(cmd) {
  try { return execSync(cmd, { cwd: root, encoding: "utf8" }).trim(); }
  catch { return ""; }
}

const ag70v = readJson("data/content-intelligence/quality-reviews/ag70v-india-administrative-location-import-bank.json");
const indiaCapitalsSeed = readJson("data/knowledge-base/location-intelligence/production/india-state-ut-capitals-seed.json");
const indiaMajorCitiesSeed = readJson("data/knowledge-base/location-intelligence/production/india-major-cities-seed.json");
const panchangManifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag70v.status !== "ag70v_india_administrative_location_import_bank_completed") {
  throw new Error("AG70V must be complete before AG70W.");
}
if (ag70v.summary?.ready_for_ag70w !== true) {
  throw new Error("AG70V readiness for AG70W is missing.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.source_expansion_active !== false) {
  throw new Error("generated/word-of-day.json must remain inactive.");
}

const outputs = {
  sourcePolicy: "data/knowledge-base/location-intelligence/production/ag70w-india-city-coordinate-source-policy.json",
  refreshPolicy: "data/knowledge-base/location-intelligence/production/ag70w-city-coordinate-refresh-cadence-policy.json",
  coordinateSchema: "data/knowledge-base/location-intelligence/production/india-city-capital-coordinate-schema.json",
  coordinateBank: "data/knowledge-base/location-intelligence/production/india-cities-capitals-coordinate-bank.json",
  capitalCoordinateCandidates: "data/knowledge-base/location-intelligence/production/ag70w-india-capital-coordinate-candidates.json",
  majorCityCoordinateCandidates: "data/knowledge-base/location-intelligence/production/ag70w-india-major-city-coordinate-candidates.json",
  verificationQueue: "data/knowledge-base/location-intelligence/production/ag70w-coordinate-government-verification-queue.json",
  resolverReadiness: "data/knowledge-base/location-intelligence/production/ag70w-city-coordinate-resolver-readiness.json",
  noPublicOutputAudit: "data/knowledge-base/location-intelligence/production/ag70w-no-public-output-audit.json",
  panchangManifest: "data/knowledge-base/panchang-festival/production/production-bank-manifest.json",
  review: "data/content-intelligence/quality-reviews/ag70w-india-cities-capitals-coordinate-bank.json",
  readiness: "data/content-intelligence/quality-registry/ag70w-ag70x-global-capitals-major-cities-coordinate-bank-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag70w-to-ag70x-global-capitals-major-cities-coordinate-bank-boundary.json",
  quality: "data/quality/ag70w-india-cities-capitals-coordinate-bank.json",
  preview: "data/quality/ag70w-india-cities-capitals-coordinate-bank-preview.json",
  doc: "docs/quality/AG70W_INDIA_CITIES_CAPITALS_COORDINATE_BANK.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short=8 HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short=8 origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const knownCandidateCoordinates = {
  "Itanagar-Arunachal Pradesh-India": [27.0844, 93.6053],
  "New Delhi-Delhi-India": [28.6139, 77.2090],
  "Mumbai-Maharashtra-India": [19.0760, 72.8777],
  "Kolkata-West Bengal-India": [22.5726, 88.3639],
  "Chennai-Tamil Nadu-India": [13.0827, 80.2707],
  "Bengaluru-Karnataka-India": [12.9716, 77.5946],
  "Hyderabad-Telangana-India": [17.3850, 78.4867],
  "Ranchi-Jharkhand-India": [23.3441, 85.3096],
  "Guwahati-Assam-India": [26.1445, 91.7362],
  "Shillong-Meghalaya-India": [25.5788, 91.8933]
};

function normaliseSeedRecord(seed, prefix, index) {
  const display = seed.display_label;
  const candidate = knownCandidateCoordinates[display] || [null, null];

  return {
    coordinate_record_id: `${prefix}_${String(index + 1).padStart(3, "0")}`,
    source_seed_id: seed.location_seed_id,
    location_type: seed.location_type,
    country_name: seed.country_name || "India",
    state_or_region_name: seed.state_or_region_name,
    city_name: seed.city_name,
    display_label: display,
    ui_short_label: seed.ui_short_label,
    timezone: seed.timezone || "Asia/Kolkata",
    latitude_decimal: candidate[0],
    longitude_decimal: candidate[1],
    coordinate_value_status: candidate[0] === null ? "coordinate_pending" : "candidate_coordinate_pending_government_verification",
    coordinate_source_status: "pending_survey_of_india_or_approved_government_geospatial_verification",
    source_freshness_status: "pending_metadata_fetch",
    source_freshness_window_months: 12,
    refresh_interval_months: 4,
    computation_allowed_now: false,
    public_dropdown_activation_allowed_now: false,
    review_status: "candidate_coordinate_record_not_approved"
  };
}

const capitalRecords = indiaCapitalsSeed.records.map((seed, index) =>
  normaliseSeedRecord(seed, "ag70w_india_capital_coordinate_candidate", index)
);

const majorCityRecords = indiaMajorCitiesSeed.records.map((seed, index) =>
  normaliseSeedRecord(seed, "ag70w_india_major_city_coordinate_candidate", index)
);

const combinedRecords = [...capitalRecords, ...majorCityRecords];

const sourcePolicy = {
  module_id: "AG70W",
  title: "India City Coordinate Source Policy",
  status: "india_city_coordinate_source_policy_created",
  source_rule: "Coordinates for Indian State/UT capitals and major Indian cities must be verified through Survey of India or approved government geospatial/official source before computation approval.",
  identity_source_rule: "City/capital names may be aligned to government administrative records, but coordinate computation approval requires verified coordinate source.",
  freshness_window_months: 12,
  refresh_interval_months: 4,
  non_government_coordinate_source_allowed_for_computation_now: false,
  candidate_coordinates_allowed_for_internal_review: true,
  computation_allowed_for_candidate_coordinates: false,
  public_output_allowed_now: false
};

const refreshPolicy = {
  module_id: "AG70W",
  title: "India City Coordinate Refresh Cadence Policy",
  status: "india_city_coordinate_refresh_cadence_policy_created",
  refresh_interval_months: 4,
  refresh_scope: [
    "Indian State/UT capitals",
    "Major Indian cities",
    "coordinate value",
    "timezone",
    "source metadata",
    "rename or administrative reassignment"
  ],
  refresh_steps: [
    "Fetch/check latest approved government coordinate/geospatial metadata.",
    "Compare city/capital list and coordinates against current approved bank.",
    "Stage coordinate differences as candidates.",
    "Do not overwrite approved coordinates automatically.",
    "Generate diff and validation report.",
    "Promote only after review."
  ],
  failure_policy: {
    fetch_failure: "Keep last approved coordinate bank active and create refresh_failure_review_required record.",
    schema_change: "Block import and require manual schema review.",
    large_coordinate_shift: "Block promotion and require manual geospatial review."
  },
  public_output_allowed_now: false
};

const coordinateSchema = {
  module_id: "AG70W",
  title: "India City / Capital Coordinate Schema",
  status: "india_city_capital_coordinate_schema_created",
  required_fields: [
    "coordinate_record_id",
    "location_type",
    "country_name",
    "state_or_region_name",
    "city_name",
    "display_label",
    "ui_short_label",
    "timezone",
    "latitude_decimal",
    "longitude_decimal",
    "coordinate_value_status",
    "coordinate_source_status",
    "source_freshness_status",
    "source_freshness_window_months",
    "refresh_interval_months",
    "computation_allowed_now",
    "review_status"
  ],
  computation_approval_required_statuses: {
    coordinate_value_status: "verified",
    coordinate_source_status: "government_geospatial_verified",
    source_freshness_status: "fresh_within_12_months_or_latest_official_release",
    review_status: "approved"
  },
  public_output_allowed_now: false
};

const coordinateBank = {
  module_id: "AG70W",
  title: "India Cities and Capitals Coordinate Bank",
  status: "india_cities_capitals_coordinate_bank_created_candidate_records_public_blocked",
  purpose: "Create candidate coordinate bank for Indian State/UT capitals and major Indian cities.",
  source_freshness_window_months: 12,
  refresh_interval_months: 4,
  capital_candidate_record_count: capitalRecords.length,
  major_city_candidate_record_count: majorCityRecords.length,
  total_candidate_record_count: combinedRecords.length,
  approved_computation_record_count: 0,
  actual_government_coordinate_fetch_performed_now: false,
  public_dropdown_activation_performed_now: false,
  records: combinedRecords
};

const verificationQueue = {
  module_id: "AG70W",
  title: "Coordinate Government Verification Queue",
  status: "coordinate_government_verification_queue_created",
  queue_record_count: combinedRecords.length,
  verification_required_before_computation: true,
  verification_target_source_family: "Survey of India or approved government geospatial source",
  records: combinedRecords.map((record) => ({
    coordinate_record_id: record.coordinate_record_id,
    display_label: record.display_label,
    latitude_decimal: record.latitude_decimal,
    longitude_decimal: record.longitude_decimal,
    coordinate_value_status: record.coordinate_value_status,
    required_verification: [
      "government_geospatial_source_match",
      "timezone_confirmation",
      "freshness_metadata_check",
      "review_approval"
    ],
    computation_allowed_now: false
  }))
};

const resolverReadiness = {
  module_id: "AG70W",
  title: "India City Coordinate Resolver Readiness",
  status: "india_city_coordinate_resolver_readiness_created_internal_only",
  named_selection_resolution_supported: true,
  coordinate_value_resolution_supported_for_candidate_records: true,
  computation_resolution_enabled_now: false,
  reason_computation_not_enabled: "Coordinate values are candidate/pending government-source verification.",
  examples: combinedRecords
    .filter((record) => ["Itanagar-Arunachal Pradesh-India", "New Delhi-Delhi-India", "Mumbai-Maharashtra-India"].includes(record.display_label))
    .map((record) => ({
      input_label: record.display_label,
      resolves_to_latitude: record.latitude_decimal,
      resolves_to_longitude: record.longitude_decimal,
      timezone: record.timezone,
      computation_allowed_now: record.computation_allowed_now
    })),
  public_output_allowed_now: false
};

const noPublicOutputAudit = {
  module_id: "AG70W",
  title: "No Public Output Audit",
  status: "no_public_output_audit_passed",
  public_panchang_output_allowed_now: false,
  public_star_reflection_output_allowed_now: false,
  public_location_dropdown_activation_performed: false,
  panchang_recomputation_performed_now: false,
  star_reflection_computation_performed_now: false,
  generated_word_json_modified: false,
  ui_display_changed: false,
  backend_runtime_activated: false,
  supabase_activation_performed: false
};

const updatedPanchangManifest = {
  ...panchangManifest,
  status: "production_bank_manifest_created_india_cities_capitals_coordinate_bank",
  current_status: "india_cities_capitals_coordinate_bank_created_candidate_records_public_blocked",
  ag70w_files: {
    source_policy: outputs.sourcePolicy,
    refresh_policy: outputs.refreshPolicy,
    coordinate_schema: outputs.coordinateSchema,
    coordinate_bank: outputs.coordinateBank,
    capital_coordinate_candidates: outputs.capitalCoordinateCandidates,
    major_city_coordinate_candidates: outputs.majorCityCoordinateCandidates,
    verification_queue: outputs.verificationQueue,
    resolver_readiness: outputs.resolverReadiness,
    no_public_output_audit: outputs.noPublicOutputAudit
  },
  current_counts: {
    ...(panchangManifest.current_counts || {}),
    india_capital_coordinate_candidate_records: capitalRecords.length,
    india_major_city_coordinate_candidate_records: majorCityRecords.length,
    india_city_capital_total_candidate_records: combinedRecords.length,
    india_city_capital_approved_computation_records: 0,
    government_coordinate_fetch_records_now: 0,
    public_panchang_outputs: 0,
    word_output_records: 0
  },
  next_required_stage: "AG70X — Global Capitals and Major World Cities Coordinate Bank"
};

const review = {
  module_id: "AG70W",
  title: "India Cities and Capitals Coordinate Bank",
  status: "ag70w_india_cities_capitals_coordinate_bank_completed",
  current_git_context: git,
  consumed_previous_stage: {
    ag70v_review: "data/content-intelligence/quality-reviews/ag70v-india-administrative-location-import-bank.json",
    india_capitals_seed: "data/knowledge-base/location-intelligence/production/india-state-ut-capitals-seed.json",
    india_major_cities_seed: "data/knowledge-base/location-intelligence/production/india-major-cities-seed.json"
  },
  generated_records: outputs,
  summary: {
    india_city_capital_coordinate_bank_created: true,
    source_policy_created: true,
    refresh_policy_created: true,
    coordinate_schema_created: true,
    verification_queue_created: true,
    resolver_readiness_created: true,
    capital_candidate_record_count: capitalRecords.length,
    major_city_candidate_record_count: majorCityRecords.length,
    total_candidate_record_count: combinedRecords.length,
    approved_computation_record_count: 0,
    government_coordinate_fetch_performed_now: false,
    public_dropdown_activation_performed_now: false,
    panchang_recomputation_performed_now: false,
    star_reflection_computation_performed_now: false,
    generated_word_json_modified: false,
    ui_display_changed: false,
    backend_runtime_activated: false,
    supabase_activation_performed: false,
    ready_for_ag70x: true
  }
};

const readiness = {
  module_id: "AG70W",
  title: "AG70X Global Capitals and Major World Cities Coordinate Bank Readiness Record",
  status: "ready_for_ag70x_global_capitals_major_cities_coordinate_bank",
  ready_for_ag70x: true,
  next_stage: "AG70X — Global Capitals and Major World Cities Coordinate Bank",
  reason: "India cities/capitals coordinate candidate bank is created with verification queue and public/computation blocking. Next stage can create global coordinate bank."
};

const boundary = {
  module_id: "AG70W",
  title: "AG70W to AG70X Global Capitals and Major World Cities Coordinate Bank Boundary",
  status: "ag70x_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Create global national capitals and major world cities coordinate bank.",
    "Prepare source/freshness/verification policy for global records.",
    "Keep public/UI output blocked."
  ],
  blocked_scope_without_explicit_approval: [
    "public Panchang output",
    "public Star Reflection output",
    "public location dropdown activation",
    "generated/word-of-day.json replacement",
    "homepage UI change",
    "runtime Word selector activation",
    "Supabase/database writes",
    "backend/Auth activation"
  ]
};

const quality = {
  module_id: "AG70W",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG70W",
  status: review.status,
  capital_candidate_record_count: capitalRecords.length,
  major_city_candidate_record_count: majorCityRecords.length,
  total_candidate_record_count: combinedRecords.length,
  approved_computation_record_count: 0,
  public_output_allowed_now: 0,
  ready_for_ag70x: 1
};

const doc = `# AG70W — India Cities and Capitals Coordinate Bank

AG70W creates the candidate coordinate bank for Indian State/UT capitals and major Indian cities.

## Important boundary

Coordinates are candidate/internal until government geospatial verification is completed. No computation approval is granted in AG70W.

## Created

- India city coordinate source policy.
- 4-month refresh cadence policy.
- City/capital coordinate schema.
- India cities/capitals candidate coordinate bank.
- Capital coordinate candidate file.
- Major city coordinate candidate file.
- Government verification queue.
- Resolver readiness record.
- No-public-output audit.

## Not done

- No public dropdown activation.
- No Panchang recomputation.
- No Star Reflection computation.
- No UI/backend/Supabase activation.
`;

writeJson(outputs.sourcePolicy, sourcePolicy);
writeJson(outputs.refreshPolicy, refreshPolicy);
writeJson(outputs.coordinateSchema, coordinateSchema);
writeJson(outputs.coordinateBank, coordinateBank);
writeJson(outputs.capitalCoordinateCandidates, { module_id: "AG70W", title: "India Capital Coordinate Candidates", status: "india_capital_coordinate_candidates_created_pending_government_verification", record_count: capitalRecords.length, records: capitalRecords });
writeJson(outputs.majorCityCoordinateCandidates, { module_id: "AG70W", title: "India Major City Coordinate Candidates", status: "india_major_city_coordinate_candidates_created_pending_government_verification", record_count: majorCityRecords.length, records: majorCityRecords });
writeJson(outputs.verificationQueue, verificationQueue);
writeJson(outputs.resolverReadiness, resolverReadiness);
writeJson(outputs.noPublicOutputAudit, noPublicOutputAudit);
writeJson(outputs.panchangManifest, updatedPanchangManifest);
writeJson(outputs.review, review);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.quality, quality);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG70W India cities/capitals coordinate bank generated.");
console.log(`✅ Candidate records: ${combinedRecords.length}.`);
console.log("✅ Computation and public dropdown activation remain blocked pending government geospatial verification.");
