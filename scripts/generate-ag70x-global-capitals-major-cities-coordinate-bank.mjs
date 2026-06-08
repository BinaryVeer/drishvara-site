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

const ag70w = readJson("data/content-intelligence/quality-reviews/ag70w-india-cities-capitals-coordinate-bank.json");
const worldCapitalsSeed = readJson("data/knowledge-base/location-intelligence/production/world-national-capitals-seed.json");
const worldCitiesSeed = readJson("data/knowledge-base/location-intelligence/production/world-major-cities-seed.json");
const panchangManifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag70w.status !== "ag70w_india_cities_capitals_coordinate_bank_completed") {
  throw new Error("AG70W must be complete before AG70X.");
}
if (ag70w.summary?.ready_for_ag70x !== true) {
  throw new Error("AG70W readiness for AG70X is missing.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.source_expansion_active !== false) {
  throw new Error("generated/word-of-day.json must remain inactive.");
}

const outputs = {
  sourcePolicy: "data/knowledge-base/location-intelligence/production/ag70x-global-coordinate-source-policy.json",
  refreshPolicy: "data/knowledge-base/location-intelligence/production/ag70x-global-coordinate-refresh-cadence-policy.json",
  coordinateSchema: "data/knowledge-base/location-intelligence/production/global-capitals-major-cities-coordinate-schema.json",
  coordinateBank: "data/knowledge-base/location-intelligence/production/global-capitals-major-cities-coordinate-bank.json",
  capitalCandidates: "data/knowledge-base/location-intelligence/production/ag70x-global-national-capital-coordinate-candidates.json",
  majorCityCandidates: "data/knowledge-base/location-intelligence/production/ag70x-global-major-city-coordinate-candidates.json",
  verificationQueue: "data/knowledge-base/location-intelligence/production/ag70x-global-coordinate-verification-queue.json",
  resolverReadiness: "data/knowledge-base/location-intelligence/production/ag70x-global-coordinate-resolver-readiness.json",
  noPublicOutputAudit: "data/knowledge-base/location-intelligence/production/ag70x-no-public-output-audit.json",
  panchangManifest: "data/knowledge-base/panchang-festival/production/production-bank-manifest.json",
  review: "data/content-intelligence/quality-reviews/ag70x-global-capitals-major-cities-coordinate-bank.json",
  readiness: "data/content-intelligence/quality-registry/ag70x-ag70y-location-selection-resolver-test-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag70x-to-ag70y-location-selection-resolver-test-boundary.json",
  quality: "data/quality/ag70x-global-capitals-major-cities-coordinate-bank.json",
  preview: "data/quality/ag70x-global-capitals-major-cities-coordinate-bank-preview.json",
  doc: "docs/quality/AG70X_GLOBAL_CAPITALS_MAJOR_CITIES_COORDINATE_BANK.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short=8 HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short=8 origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const knownGlobalCandidateCoordinates = {
  "Kathmandu-Nepal": [27.7172, 85.3240],
  "Tokyo-Japan": [35.6762, 139.6503],
  "London-United Kingdom": [51.5074, -0.1278],
  "Washington-United States": [38.9072, -77.0369],
  "Canberra-Australia": [-35.2809, 149.1300],
  "Ottawa-Canada": [45.4215, -75.6972],
  "Paris-France": [48.8566, 2.3522],
  "Berlin-Germany": [52.5200, 13.4050],
  "Rome-Italy": [41.9028, 12.4964],
  "Madrid-Spain": [40.4168, -3.7038],
  "Moscow-Russia": [55.7558, 37.6173],
  "Beijing-China": [39.9042, 116.4074],
  "Bangkok-Thailand": [13.7563, 100.5018],
  "Dhaka-Bangladesh": [23.8103, 90.4125],
  "Colombo-Sri Lanka": [6.9271, 79.8612],
  "Abu Dhabi-United Arab Emirates": [24.4539, 54.3773],
  "New York-United States": [40.7128, -74.0060],
  "Dubai-United Arab Emirates": [25.2048, 55.2708],
  "Singapore-Singapore": [1.3521, 103.8198],
  "Hong Kong-China": [22.3193, 114.1694],
  "Los Angeles-United States": [34.0522, -118.2437],
  "Toronto-Canada": [43.6532, -79.3832],
  "Sydney-Australia": [-33.8688, 151.2093],
  "Melbourne-Australia": [-37.8136, 144.9631],
  "Doha-Qatar": [25.2854, 51.5310],
  "Kuala Lumpur-Malaysia": [3.1390, 101.6869],
  "Seoul-South Korea": [37.5665, 126.9780],
  "Istanbul-Turkey": [41.0082, 28.9784]
};

function normaliseSeedRecord(seed, prefix, index) {
  const display = seed.display_label;
  const candidate = knownGlobalCandidateCoordinates[display] || [null, null];

  return {
    coordinate_record_id: `${prefix}_${String(index + 1).padStart(3, "0")}`,
    source_seed_id: seed.location_seed_id,
    location_type: seed.location_type,
    country_name: seed.country_name,
    city_name: seed.city_name,
    display_label: display,
    ui_short_label: seed.ui_short_label,
    timezone: seed.timezone,
    latitude_decimal: candidate[0],
    longitude_decimal: candidate[1],
    coordinate_value_status: candidate[0] === null ? "coordinate_pending" : "candidate_coordinate_pending_authoritative_verification",
    coordinate_source_status: "pending_authoritative_global_source_verification",
    timezone_source_status: "pending_authoritative_timezone_verification",
    source_freshness_status: "pending_metadata_fetch",
    source_freshness_window_months: 12,
    refresh_interval_months: 4,
    computation_allowed_now: false,
    public_dropdown_activation_allowed_now: false,
    review_status: "candidate_coordinate_record_not_approved"
  };
}

const capitalRecords = worldCapitalsSeed.records.map((seed, index) =>
  normaliseSeedRecord(seed, "ag70x_global_capital_coordinate_candidate", index)
);

const majorCityRecords = worldCitiesSeed.records.map((seed, index) =>
  normaliseSeedRecord(seed, "ag70x_global_major_city_coordinate_candidate", index)
);

const combinedRecords = [...capitalRecords, ...majorCityRecords];

const sourcePolicy = {
  module_id: "AG70X",
  title: "Global Coordinate Source Policy",
  status: "global_coordinate_source_policy_created",
  source_rule: "Global national capital and major world city coordinates must be verified through approved authoritative geographic/geospatial sources before computation approval.",
  allowed_source_families_for_review: [
    "official national/geospatial source where available",
    "UN or international authoritative geographic dataset where available",
    "Natural Earth populated places / admin capital dataset as curated public geospatial reference",
    "GeoNames or equivalent authoritative gazetteer as secondary review source"
  ],
  freshness_window_months: 12,
  refresh_interval_months: 4,
  candidate_coordinates_allowed_for_internal_review: true,
  computation_allowed_for_candidate_coordinates: false,
  public_output_allowed_now: false
};

const refreshPolicy = {
  module_id: "AG70X",
  title: "Global Coordinate Refresh Cadence Policy",
  status: "global_coordinate_refresh_cadence_policy_created",
  refresh_interval_months: 4,
  refresh_scope: [
    "national capitals",
    "major world cities",
    "coordinate value",
    "timezone",
    "country/city naming",
    "source metadata"
  ],
  refresh_steps: [
    "Check latest approved authoritative global geographic dataset metadata.",
    "Compare city/capital list and coordinates against current approved bank.",
    "Stage coordinate/name/timezone differences as candidates.",
    "Do not overwrite approved coordinates automatically.",
    "Generate diff and validation report.",
    "Promote only after review."
  ],
  failure_policy: {
    fetch_failure: "Keep last approved global coordinate bank active and create refresh_failure_review_required record.",
    schema_change: "Block import and require manual schema review.",
    large_coordinate_shift: "Block promotion and require manual geospatial review."
  },
  public_output_allowed_now: false
};

const coordinateSchema = {
  module_id: "AG70X",
  title: "Global Capitals / Major Cities Coordinate Schema",
  status: "global_capitals_major_cities_coordinate_schema_created",
  required_fields: [
    "coordinate_record_id",
    "location_type",
    "country_name",
    "city_name",
    "display_label",
    "ui_short_label",
    "timezone",
    "latitude_decimal",
    "longitude_decimal",
    "coordinate_value_status",
    "coordinate_source_status",
    "timezone_source_status",
    "source_freshness_status",
    "source_freshness_window_months",
    "refresh_interval_months",
    "computation_allowed_now",
    "review_status"
  ],
  computation_approval_required_statuses: {
    coordinate_value_status: "verified",
    coordinate_source_status: "authoritative_global_source_verified",
    timezone_source_status: "verified",
    source_freshness_status: "fresh_within_12_months_or_latest_official_release",
    review_status: "approved"
  },
  public_output_allowed_now: false
};

const coordinateBank = {
  module_id: "AG70X",
  title: "Global Capitals and Major World Cities Coordinate Bank",
  status: "global_capitals_major_cities_coordinate_bank_created_candidate_records_public_blocked",
  purpose: "Create candidate coordinate bank for national capitals and major world cities.",
  source_freshness_window_months: 12,
  refresh_interval_months: 4,
  national_capital_candidate_record_count: capitalRecords.length,
  major_world_city_candidate_record_count: majorCityRecords.length,
  total_candidate_record_count: combinedRecords.length,
  approved_computation_record_count: 0,
  actual_authoritative_coordinate_fetch_performed_now: false,
  public_dropdown_activation_performed_now: false,
  records: combinedRecords
};

const verificationQueue = {
  module_id: "AG70X",
  title: "Global Coordinate Verification Queue",
  status: "global_coordinate_verification_queue_created",
  queue_record_count: combinedRecords.length,
  verification_required_before_computation: true,
  verification_target_source_family: "approved authoritative geographic/geospatial source",
  records: combinedRecords.map((record) => ({
    coordinate_record_id: record.coordinate_record_id,
    display_label: record.display_label,
    latitude_decimal: record.latitude_decimal,
    longitude_decimal: record.longitude_decimal,
    timezone: record.timezone,
    required_verification: [
      "authoritative_coordinate_source_match",
      "timezone_confirmation",
      "freshness_metadata_check",
      "country_city_name_review",
      "review_approval"
    ],
    computation_allowed_now: false
  }))
};

const resolverReadiness = {
  module_id: "AG70X",
  title: "Global Coordinate Resolver Readiness",
  status: "global_coordinate_resolver_readiness_created_internal_only",
  named_selection_resolution_supported: true,
  coordinate_value_resolution_supported_for_candidate_records: true,
  computation_resolution_enabled_now: false,
  reason_computation_not_enabled: "Coordinate/timezone values are candidate/pending authoritative-source verification.",
  examples: combinedRecords
    .filter((record) => ["Tokyo-Japan", "London-United Kingdom", "Dubai-United Arab Emirates", "New York-United States"].includes(record.display_label))
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
  module_id: "AG70X",
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
  status: "production_bank_manifest_created_global_capitals_major_cities_coordinate_bank",
  current_status: "global_capitals_major_cities_coordinate_bank_created_candidate_records_public_blocked",
  ag70x_files: {
    source_policy: outputs.sourcePolicy,
    refresh_policy: outputs.refreshPolicy,
    coordinate_schema: outputs.coordinateSchema,
    coordinate_bank: outputs.coordinateBank,
    capital_candidates: outputs.capitalCandidates,
    major_city_candidates: outputs.majorCityCandidates,
    verification_queue: outputs.verificationQueue,
    resolver_readiness: outputs.resolverReadiness,
    no_public_output_audit: outputs.noPublicOutputAudit
  },
  current_counts: {
    ...(panchangManifest.current_counts || {}),
    global_national_capital_candidate_records: capitalRecords.length,
    global_major_city_candidate_records: majorCityRecords.length,
    global_total_candidate_records: combinedRecords.length,
    global_approved_computation_records: 0,
    authoritative_global_coordinate_fetch_records_now: 0,
    public_panchang_outputs: 0,
    word_output_records: 0
  },
  next_required_stage: "AG70Y — Location Selection Resolver Test"
};

const review = {
  module_id: "AG70X",
  title: "Global Capitals and Major World Cities Coordinate Bank",
  status: "ag70x_global_capitals_major_cities_coordinate_bank_completed",
  current_git_context: git,
  consumed_previous_stage: {
    ag70w_review: "data/content-intelligence/quality-reviews/ag70w-india-cities-capitals-coordinate-bank.json",
    world_capitals_seed: "data/knowledge-base/location-intelligence/production/world-national-capitals-seed.json",
    world_major_cities_seed: "data/knowledge-base/location-intelligence/production/world-major-cities-seed.json"
  },
  generated_records: outputs,
  summary: {
    global_coordinate_bank_created: true,
    source_policy_created: true,
    refresh_policy_created: true,
    coordinate_schema_created: true,
    verification_queue_created: true,
    resolver_readiness_created: true,
    national_capital_candidate_record_count: capitalRecords.length,
    major_world_city_candidate_record_count: majorCityRecords.length,
    total_candidate_record_count: combinedRecords.length,
    approved_computation_record_count: 0,
    authoritative_coordinate_fetch_performed_now: false,
    public_dropdown_activation_performed_now: false,
    panchang_recomputation_performed_now: false,
    star_reflection_computation_performed_now: false,
    generated_word_json_modified: false,
    ui_display_changed: false,
    backend_runtime_activated: false,
    supabase_activation_performed: false,
    ready_for_ag70y: true
  }
};

const readiness = {
  module_id: "AG70X",
  title: "AG70Y Location Selection Resolver Test Readiness Record",
  status: "ready_for_ag70y_location_selection_resolver_test",
  ready_for_ag70y: true,
  next_stage: "AG70Y — Location Selection Resolver Test",
  reason: "India and global candidate coordinate banks exist. Next stage can test resolver paths from named location / coordinate-first input to Panchang and Star Reflection input basis while keeping computation/public output blocked."
};

const boundary = {
  module_id: "AG70X",
  title: "AG70X to AG70Y Location Selection Resolver Test Boundary",
  status: "ag70y_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Test named-location resolver for Indian and global candidate records.",
    "Test coordinate-first resolver.",
    "Map resolver output to Panchang and Star Reflection input contracts.",
    "Keep public/UI output and actual computation blocked."
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
  module_id: "AG70X",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG70X",
  status: review.status,
  national_capital_candidate_record_count: capitalRecords.length,
  major_world_city_candidate_record_count: majorCityRecords.length,
  total_candidate_record_count: combinedRecords.length,
  approved_computation_record_count: 0,
  public_output_allowed_now: 0,
  ready_for_ag70y: 1
};

const doc = `# AG70X — Global Capitals and Major World Cities Coordinate Bank

AG70X creates the candidate coordinate bank for global national capitals and major world cities.

## Important boundary

Coordinates and timezones are candidate/internal until authoritative verification is completed. No computation approval is granted in AG70X.

## Created

- Global coordinate source policy.
- 4-month refresh cadence policy.
- Global coordinate schema.
- Global capitals/major-cities candidate coordinate bank.
- National capital coordinate candidate file.
- Major world city coordinate candidate file.
- Verification queue.
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
writeJson(outputs.capitalCandidates, { module_id: "AG70X", title: "Global National Capital Coordinate Candidates", status: "global_national_capital_coordinate_candidates_created_pending_authoritative_verification", record_count: capitalRecords.length, records: capitalRecords });
writeJson(outputs.majorCityCandidates, { module_id: "AG70X", title: "Global Major World City Coordinate Candidates", status: "global_major_city_coordinate_candidates_created_pending_authoritative_verification", record_count: majorCityRecords.length, records: majorCityRecords });
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

console.log("✅ AG70X global capitals/major cities coordinate bank generated.");
console.log(`✅ Candidate records: ${combinedRecords.length}.`);
console.log("✅ Computation and public dropdown activation remain blocked pending authoritative verification.");
