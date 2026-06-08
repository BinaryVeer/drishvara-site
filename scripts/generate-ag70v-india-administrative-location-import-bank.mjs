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

const ag70u = readJson("data/content-intelligence/quality-reviews/ag70u-location-import-and-selection-validation.json");
const locationRegistry = readJson("data/knowledge-base/location-intelligence/production/location-selection-registry.json");
const importContracts = readJson("data/knowledge-base/location-intelligence/production/location-official-import-contracts.json");
const panchangManifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag70u.status !== "ag70u_location_import_and_selection_validation_completed") {
  throw new Error("AG70U must be complete before AG70V.");
}
if (ag70u.summary?.ready_for_ag70v !== true) {
  throw new Error("AG70U readiness for AG70V is missing.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.source_expansion_active !== false) {
  throw new Error("generated/word-of-day.json must remain inactive.");
}

const outputs = {
  sourcePolicy: "data/knowledge-base/location-intelligence/production/ag70v-government-source-freshness-policy.json",
  refreshPolicy: "data/knowledge-base/location-intelligence/production/ag70v-four-month-refresh-cadence-policy.json",
  sourceRegistry: "data/knowledge-base/location-intelligence/production/ag70v-india-administrative-source-registry.json",
  fetchPlan: "data/knowledge-base/location-intelligence/production/ag70v-government-source-fetch-plan.json",
  importBank: "data/knowledge-base/location-intelligence/production/india-administrative-location-import-bank.json",
  importSchema: "data/knowledge-base/location-intelligence/production/india-administrative-location-import-schema.json",
  sampleRecords: "data/knowledge-base/location-intelligence/production/ag70v-india-administrative-seed-records.json",
  coordinatePolicy: "data/knowledge-base/location-intelligence/production/ag70v-india-admin-coordinate-basis-policy.json",
  refreshAudit: "data/knowledge-base/location-intelligence/production/ag70v-refresh-safety-audit.json",
  noPublicOutputAudit: "data/knowledge-base/location-intelligence/production/ag70v-no-public-output-audit.json",
  panchangManifest: "data/knowledge-base/panchang-festival/production/production-bank-manifest.json",
  review: "data/content-intelligence/quality-reviews/ag70v-india-administrative-location-import-bank.json",
  readiness: "data/content-intelligence/quality-registry/ag70v-ag70w-india-cities-capitals-coordinate-bank-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag70v-to-ag70w-india-cities-capitals-coordinate-bank-boundary.json",
  quality: "data/quality/ag70v-india-administrative-location-import-bank.json",
  preview: "data/quality/ag70v-india-administrative-location-import-bank-preview.json",
  doc: "docs/quality/AG70V_INDIA_ADMINISTRATIVE_LOCATION_IMPORT_BANK.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short=8 HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short=8 origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const sourceRegistry = {
  module_id: "AG70V",
  title: "India Administrative Source Registry",
  status: "india_administrative_source_registry_created_fetch_ready",
  source_priority: [
    {
      source_id: "gov_in_lgd_data_gov_catalog",
      source_family: "LGD / data.gov.in",
      source_type: "government_administrative_identity_codes",
      use_case: "State, District, Sub-district/Block, Village/local-body administrative identity and codes",
      reference_url: "https://www.data.gov.in/catalog/local-government-directory-lgd",
      freshness_requirement_months: 12,
      refresh_interval_months: 4,
      source_status: "approved_primary_identity_source"
    },
    {
      source_id: "gov_in_lgd_direct",
      source_family: "LGD",
      source_type: "government_administrative_directory",
      use_case: "Direct cross-check of administrative hierarchy and LGD codes",
      reference_url: "https://lgdirectory.gov.in/",
      freshness_requirement_months: 12,
      refresh_interval_months: 4,
      source_status: "approved_primary_identity_crosscheck_source"
    },
    {
      source_id: "survey_of_india_abdb",
      source_family: "Survey of India",
      source_type: "government_geospatial_boundary_coordinate_basis",
      use_case: "State/District/Sub-district boundary, HQ/centroid/selected point coordinate verification",
      reference_url: "https://surveyofindia.gov.in/pages/administrative-boundary-data-base-abdb-",
      freshness_requirement_months: 12,
      refresh_interval_months: 4,
      source_status: "approved_coordinate_boundary_source_pending_dataset_access"
    }
  ],
  public_output_allowed_now: false
};

const sourcePolicy = {
  module_id: "AG70V",
  title: "Government Source Freshness Policy",
  status: "government_source_freshness_policy_created_for_india_admin_import",
  source_rule: "Prefer government/official source datasets updated within the past 12 months. If a source is older, unavailable, or has unclear metadata, records must remain review_required and not computation_approved.",
  freshness_window_months: 12,
  source_families_allowed: [
    "LGD / data.gov.in",
    "LGD direct",
    "Survey of India / approved government geospatial source"
  ],
  non_government_source_allowed_for_india_admin_import_now: false,
  public_output_allowed_now: false
};

const refreshPolicy = {
  module_id: "AG70V",
  title: "Four-month India Administrative Location Refresh Cadence Policy",
  status: "four_month_refresh_cadence_policy_created",
  refresh_interval_months: 4,
  refresh_target_scope: [
    "Indian States/UTs",
    "Indian Districts",
    "Indian Sub-districts / Blocks",
    "Coordinate/boundary/HQ basis"
  ],
  refresh_steps: [
    "Fetch latest source metadata from approved government source registry.",
    "Stage additions, renames, retirements and code changes as candidates.",
    "Compare with last approved registry.",
    "Do not auto-overwrite approved records.",
    "Generate diff report and validation report.",
    "Promote only after validation/review."
  ],
  failure_policy: {
    fetch_failure: "Keep last approved data active and create refresh_failure_review_required record.",
    schema_change: "Block import and require manual schema review.",
    large_unexpected_change: "Block promotion and require manual review."
  },
  public_output_allowed_now: false
};

const fetchPlan = {
  module_id: "AG70V",
  title: "Government Source Fetch Plan",
  status: "government_source_fetch_plan_created_no_runtime_fetch_dependency",
  fetch_mode: "manual_or_ci_controlled_fetch_not_runtime_dependency",
  runtime_fetch_dependency_allowed: false,
  sources_to_attempt_in_future_import_runner: sourceRegistry.source_priority.map((s) => ({
    source_id: s.source_id,
    reference_url: s.reference_url,
    expected_use: s.use_case,
    fetch_result_required_fields: [
      "source_url",
      "http_status_or_file_status",
      "metadata_last_updated",
      "download_or_api_availability",
      "schema_summary",
      "record_count_if_available",
      "fetch_timestamp",
      "review_status"
    ]
  })),
  no_fetch_performed_now: true,
  reason_no_fetch_now: "AG70V creates governed import bank/source policy. Full fetch/import requires approved source access path and should be executed through controlled import runner."
};

const importSchema = {
  module_id: "AG70V",
  title: "India Administrative Location Import Schema",
  status: "india_administrative_location_import_schema_created",
  record_required_fields: [
    "location_record_id",
    "location_type",
    "country_name",
    "state_or_ut_name",
    "state_or_ut_lgd_code",
    "district_name",
    "district_lgd_code",
    "subdistrict_or_block_name",
    "subdistrict_or_block_lgd_code",
    "display_label",
    "timezone",
    "latitude_decimal",
    "longitude_decimal",
    "administrative_source_status",
    "coordinate_source_status",
    "computation_allowed_now",
    "review_status"
  ],
  supported_location_types: [
    "state_or_ut",
    "district",
    "subdistrict_or_block"
  ],
  public_output_allowed_now: false
};

const seedRecords = [
  {
    location_record_id: "ag70v_india_admin_state_arunachal_pradesh_seed",
    location_type: "state_or_ut",
    country_name: "India",
    state_or_ut_name: "Arunachal Pradesh",
    state_or_ut_lgd_code: null,
    district_name: null,
    district_lgd_code: null,
    subdistrict_or_block_name: null,
    subdistrict_or_block_lgd_code: null,
    display_label: "Arunachal Pradesh-India",
    timezone: "Asia/Kolkata",
    latitude_decimal: null,
    longitude_decimal: null,
    administrative_source_status: "government_source_pending_fetch",
    coordinate_source_status: "pending_government_geospatial_verification",
    computation_allowed_now: false,
    review_status: "candidate_seed_only"
  },
  {
    location_record_id: "ag70v_india_admin_district_anjaw_seed",
    location_type: "district",
    country_name: "India",
    state_or_ut_name: "Arunachal Pradesh",
    state_or_ut_lgd_code: null,
    district_name: "Anjaw",
    district_lgd_code: null,
    subdistrict_or_block_name: null,
    subdistrict_or_block_lgd_code: null,
    display_label: "Anjaw-Arunachal Pradesh-India",
    timezone: "Asia/Kolkata",
    latitude_decimal: null,
    longitude_decimal: null,
    administrative_source_status: "government_source_pending_fetch",
    coordinate_source_status: "pending_government_geospatial_verification",
    computation_allowed_now: false,
    review_status: "candidate_seed_only"
  },
  {
    location_record_id: "ag70v_india_admin_block_bhawanathpur_garhwa_seed",
    location_type: "subdistrict_or_block",
    country_name: "India",
    state_or_ut_name: "Jharkhand",
    state_or_ut_lgd_code: null,
    district_name: "Garhwa",
    district_lgd_code: null,
    subdistrict_or_block_name: "Bhawanathpur",
    subdistrict_or_block_lgd_code: null,
    display_label: "Bhawanathpur-Garhwa-Jharkhand-India",
    timezone: "Asia/Kolkata",
    latitude_decimal: null,
    longitude_decimal: null,
    administrative_source_status: "government_source_pending_fetch",
    coordinate_source_status: "pending_government_geospatial_verification",
    computation_allowed_now: false,
    review_status: "candidate_seed_only"
  }
];

const importBank = {
  module_id: "AG70V",
  title: "India Administrative Location Import Bank",
  status: "india_administrative_location_import_bank_created_government_source_pending",
  purpose: "Create governed India administrative location import bank for States/UTs, Districts and Sub-districts/Blocks.",
  primary_identity_source: "LGD / data.gov.in",
  preferred_coordinate_source: "Survey of India / approved government geospatial source",
  source_freshness_window_months: 12,
  refresh_interval_months: 4,
  actual_full_import_performed_now: false,
  reason_full_import_not_performed_now: "Full import requires controlled fetch/download of official datasets and schema/metadata validation. AG70V prepares the governed import bank and seed candidates only.",
  seed_record_count: seedRecords.length,
  approved_computation_record_count: 0,
  public_dropdown_activation_performed_now: false,
  records: seedRecords
};

const coordinatePolicy = {
  module_id: "AG70V",
  title: "India Administrative Coordinate Basis Policy",
  status: "india_admin_coordinate_basis_policy_created",
  rule: "LGD/data.gov.in establishes administrative identity/code basis. Coordinates, centroids, headquarters or boundary-derived points must come from Survey of India or another approved government geospatial source before computation approval.",
  coordinate_required_for_computation: true,
  timezone_required_for_computation: true,
  allow_lgd_record_without_coordinate: true,
  lgd_without_coordinate_status: "identity_verified_coordinate_pending",
  computation_allowed_for_coordinate_pending_records: false,
  public_output_allowed_now: false
};

const refreshAudit = {
  module_id: "AG70V",
  title: "Refresh Safety Audit",
  status: "refresh_safety_audit_passed",
  refresh_interval_months: 4,
  automatic_fetch_pattern_defined: true,
  automatic_promotion_allowed: false,
  old_data_retained_on_fetch_failure: true,
  review_alert_required_on_fetch_failure: true,
  large_unexpected_change_blocks_promotion: true,
  public_output_allowed_now: false
};

const noPublicOutputAudit = {
  module_id: "AG70V",
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
  status: "production_bank_manifest_created_india_administrative_location_import_bank",
  current_status: "india_administrative_location_import_bank_created_public_blocked",
  ag70v_files: {
    source_policy: outputs.sourcePolicy,
    refresh_policy: outputs.refreshPolicy,
    source_registry: outputs.sourceRegistry,
    fetch_plan: outputs.fetchPlan,
    import_bank: outputs.importBank,
    import_schema: outputs.importSchema,
    sample_records: outputs.sampleRecords,
    coordinate_policy: outputs.coordinatePolicy,
    refresh_audit: outputs.refreshAudit,
    no_public_output_audit: outputs.noPublicOutputAudit
  },
  current_counts: {
    ...(panchangManifest.current_counts || {}),
    india_admin_import_seed_records: seedRecords.length,
    india_admin_approved_computation_records: 0,
    government_source_freshness_policy_records: 1,
    four_month_refresh_cadence_policy_records: 1,
    full_location_import_records_added_now: 0,
    public_panchang_outputs: 0,
    word_output_records: 0
  },
  next_required_stage: "AG70W — India Cities and Capitals Coordinate Bank"
};

const review = {
  module_id: "AG70V",
  title: "India Administrative Location Import Bank",
  status: "ag70v_india_administrative_location_import_bank_completed",
  current_git_context: git,
  consumed_previous_stage: {
    ag70u_review: "data/content-intelligence/quality-reviews/ag70u-location-import-and-selection-validation.json",
    location_registry: "data/knowledge-base/location-intelligence/production/location-selection-registry.json",
    import_contracts: "data/knowledge-base/location-intelligence/production/location-official-import-contracts.json"
  },
  generated_records: outputs,
  summary: {
    india_admin_import_bank_created: true,
    government_source_freshness_policy_created: true,
    four_month_refresh_cadence_policy_created: true,
    government_source_registry_created: true,
    fetch_plan_created: true,
    import_schema_created: true,
    coordinate_basis_policy_created: true,
    seed_record_count: seedRecords.length,
    approved_computation_record_count: 0,
    full_import_performed_now: false,
    public_dropdown_activation_performed_now: false,
    panchang_recomputation_performed_now: false,
    star_reflection_computation_performed_now: false,
    generated_word_json_modified: false,
    ui_display_changed: false,
    backend_runtime_activated: false,
    supabase_activation_performed: false,
    ready_for_ag70w: true
  }
};

const readiness = {
  module_id: "AG70V",
  title: "AG70W India Cities and Capitals Coordinate Bank Readiness Record",
  status: "ready_for_ag70w_india_cities_capitals_coordinate_bank",
  ready_for_ag70w: true,
  next_stage: "AG70W — India Cities and Capitals Coordinate Bank",
  reason: "India administrative import bank and source/freshness/refresh policies are established. Next stage can focus on Indian capitals and major city coordinates."
};

const boundary = {
  module_id: "AG70V",
  title: "AG70V to AG70W India Cities and Capitals Coordinate Bank Boundary",
  status: "ag70w_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Create India cities and capitals coordinate bank.",
    "Populate/prepare capital and major city coordinate records with source/freshness status.",
    "Keep records source-status controlled.",
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
    "backend/Auth activation",
    "external Panchang site as source of truth",
    "external Panchang site as data-generation input",
    "external Panchang site as runtime dependency",
    "external Panchang site as production validation source"
  ]
};

const quality = {
  module_id: "AG70V",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG70V",
  status: review.status,
  seed_record_count: seedRecords.length,
  approved_computation_record_count: 0,
  full_import_performed_now: 0,
  refresh_interval_months: 4,
  source_freshness_window_months: 12,
  public_output_allowed_now: 0,
  ready_for_ag70w: 1
};

const doc = `# AG70V — India Administrative Location Import Bank

AG70V creates the governed India administrative location import bank.

## Source policy

Government-source-first. Preferred identity/code source: LGD / data.gov.in. Preferred coordinate/boundary source: Survey of India or approved government geospatial source.

## Freshness and refresh

- Prefer datasets updated within the past 12 months.
- Refresh cadence: every 4 months.
- No automatic overwrite of approved records.
- Failed fetch keeps last approved data active and creates a review alert.

## Created

- Government source freshness policy.
- Four-month refresh cadence policy.
- India administrative source registry.
- Government source fetch plan.
- India administrative import schema.
- India administrative import bank with seed examples.
- Coordinate basis policy.
- Refresh safety audit.
- No-public-output audit.

## Not done

- No full import.
- No public dropdown activation.
- No Panchang recomputation.
- No Star Reflection computation.
- No UI/backend/Supabase activation.
`;

writeJson(outputs.sourcePolicy, sourcePolicy);
writeJson(outputs.refreshPolicy, refreshPolicy);
writeJson(outputs.sourceRegistry, sourceRegistry);
writeJson(outputs.fetchPlan, fetchPlan);
writeJson(outputs.importBank, importBank);
writeJson(outputs.importSchema, importSchema);
writeJson(outputs.sampleRecords, { module_id: "AG70V", title: "India Administrative Seed Records", status: "seed_records_created_pending_government_fetch", records: seedRecords });
writeJson(outputs.coordinatePolicy, coordinatePolicy);
writeJson(outputs.refreshAudit, refreshAudit);
writeJson(outputs.noPublicOutputAudit, noPublicOutputAudit);
writeJson(outputs.panchangManifest, updatedPanchangManifest);
writeJson(outputs.review, review);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.quality, quality);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG70V India administrative location import bank generated.");
console.log("✅ Government-source freshness and 4-month refresh policy created.");
console.log("✅ Full import not performed; records remain source-status controlled.");
console.log("✅ Public output, dropdown activation, recomputation, UI/backend/Supabase remain blocked.");
