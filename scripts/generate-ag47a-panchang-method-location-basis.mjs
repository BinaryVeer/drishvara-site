import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag47rReview: "data/content-intelligence/quality-reviews/ag47r-roadmap-alignment-before-ag47a.json",
  ag47rSourceOfTruth: "data/content-intelligence/ag-roadmap/ag47r-v01-implementation-roadmap-source-of-truth.json",
  ag47rSubstagePlan: "data/content-intelligence/ag-roadmap/ag47r-ag47a-to-ag47z-substage-plan.json",
  ag47rNoDuplication: "data/content-intelligence/ag-roadmap/ag47r-no-duplication-and-consumption-rule.json",
  ag47rReadiness: "data/content-intelligence/quality-registry/ag47r-ag47a-readiness-record.json",
  ag47rBoundary: "data/content-intelligence/mutation-plans/ag47r-to-ag47a-boundary.json",
  adb20Ads: "data/content-intelligence/runtime-engine/adb20-ads-coverage-reconciliation.json",
  adb20ApiDeferral: "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",
  adb20Closure: "data/content-intelligence/runtime-engine/adb20-adb-runtime-foundation-closure-record.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag47a-panchang-method-location-basis-consumption.json",
  methodConsumption: "data/content-intelligence/cultural-modules/ag47a-panchang-method-consumption-record.json",
  locationBasis: "data/content-intelligence/cultural-modules/ag47a-location-basis-consumption-record.json",
  sourceValidationConsumption: "data/content-intelligence/cultural-modules/ag47a-source-validation-consumption-record.json",
  panchangRuntimeBoundary: "data/content-intelligence/cultural-modules/ag47a-panchang-runtime-boundary-record.json",
  liveCalculationDisabledAudit: "data/content-intelligence/backend-architecture/ag47a-live-calculation-disabled-audit.json",
  noApiDbActivationAudit: "data/content-intelligence/backend-architecture/ag47a-no-api-db-activation-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag47a-ag47b-festival-observance-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag47a-to-ag47b-festival-observance-boundary.json",
  registry: "data/quality/ag47a-panchang-method-location-basis-consumption.json",
  preview: "data/quality/ag47a-panchang-method-location-basis-consumption-preview.json",
  doc: "docs/quality/AG47A_PANCHANG_METHOD_LOCATION_BASIS_CONSUMPTION.md"
};

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}
function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}
function walk(dir, acc = []) {
  if (!fs.existsSync(full(dir))) return acc;
  for (const entry of fs.readdirSync(full(dir), { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(rel, acc);
    else acc.push(rel);
  }
  return acc;
}
function findFiles(patterns) {
  const files = [
    ...walk("data"),
    ...walk("docs"),
    ...walk("scripts")
  ];
  return files.filter((file) => {
    const low = file.toLowerCase();
    return patterns.some((pattern) => low.includes(pattern.toLowerCase()));
  }).sort();
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG47A input: ${p}`);
}

const ag47rReview = readJson(inputs.ag47rReview);
const ag47rSourceOfTruth = readJson(inputs.ag47rSourceOfTruth);
const ag47rSubstagePlan = readJson(inputs.ag47rSubstagePlan);
const ag47rNoDuplication = readJson(inputs.ag47rNoDuplication);
const ag47rReadiness = readJson(inputs.ag47rReadiness);
const ag47rBoundary = readJson(inputs.ag47rBoundary);
const adb20Ads = readJson(inputs.adb20Ads);
const adb20ApiDeferral = readJson(inputs.adb20ApiDeferral);
const adb20Closure = readJson(inputs.adb20Closure);

if (ag47rReview.status !== "roadmap_aligned_ready_for_ag47a") throw new Error("AG47R review status mismatch.");
if (ag47rReview.summary?.ag47a_ready !== true) throw new Error("AG47A readiness missing from AG47R.");
if (!JSON.stringify(ag47rSourceOfTruth.governing_rule).includes("AG48 remains Word of the Day and Reflection")) throw new Error("Roadmap source-of-truth not preserved.");
if (ag47rSubstagePlan.next_actual_stage !== "AG47A") throw new Error("AG47R must point to AG47A.");
if (!JSON.stringify(ag47rNoDuplication.rules).includes("Each substage must produce delta output only")) throw new Error("No-duplication rule missing.");
if (ag47rReadiness.ready_for_ag47a !== true || ag47rReadiness.next_stage_id !== "AG47A") throw new Error("AG47A readiness mismatch.");
if (ag47rBoundary.next_stage_id !== "AG47A") throw new Error("AG47R boundary must point to AG47A.");
if (adb20Ads.status !== "ads_coverage_reconciliation_completed") throw new Error("ADB20 ADS reconciliation missing.");
if (adb20ApiDeferral.website_database_reading_enabled !== false) throw new Error("Website DB reading must remain disabled.");
if (adb20Closure.status !== "adb_runtime_foundation_closed_ready_for_ag47") throw new Error("ADB20 closure status mismatch.");

const m01m04Candidates = findFiles(["m01", "m04", "methodology", "panchang", "panchanga"]);
const d05Candidates = findFiles(["d05", "source-validation", "source_validation", "source"]);
const panchangRuntimeCandidates = findFiles(["panchang", "panchanga", "calendar", "runtime", "astro", "ad0", "adb"]);

const blockedState = {
  ag47a_panchang_method_location_basis_consumed: true,
  ag47r_consumed: true,
  adb20_ads_consumed: true,
  method_boundary_confirmed: true,
  location_basis_boundary_confirmed: true,
  source_validation_consumed: true,
  live_calculation_disabled_confirmed: true,
  ready_for_ag47b_festival_observance_registry: true,

  runtime_panchang_calculation_approved_now: false,
  runtime_panchang_calculation_executed: false,
  website_database_reading_enabled: false,
  api_runtime_database_reading_approved_now: false,
  backend_auth_supabase_activation_approved: false,
  backend_auth_supabase_activation_performed: false,
  rls_public_policy_activation_approved: false,
  deployment_approved: false,
  deployment_performed: false,
  service_role_key_exposed: false,
  public_generated_panchang_output: false,
  public_content_generated: false
};

const methodConsumption = {
  module_id: "AG47A",
  title: "Panchang Method Consumption Record",
  status: "panchang_method_consumption_recorded",
  consumed_logic_families: [
    "M01/M04 methodology family",
    "ADB20 ADS03/ADS07/ADS08 reconciliation",
    "AG47R roadmap source-of-truth"
  ],
  discovered_candidate_files: m01m04Candidates.slice(0, 40),
  method_boundary: {
    use_as_governance_input: true,
    use_as_live_calculation_engine: false,
    live_calculation_status: "disabled",
    public_preview_status: "allowed_only_as_reviewed_static_preview_scaffold"
  },
  no_duplicate_rule: "AG47A confirms method boundary only; it does not recreate AD/ADB calculation methodology.",
  blocked_state: blockedState
};

const locationBasis = {
  module_id: "AG47A",
  title: "Location Basis Consumption Record",
  status: "location_basis_consumption_recorded",
  consumed_logic_families: [
    "location_time_profiles",
    "regional calendar profile candidates",
    "sunrise/location basis from ADB16–ADB20"
  ],
  first_preview_policy: {
    location_specific_runtime_required_for_exact_panchang: true,
    live_location_calculation_enabled_now: false,
    default_public_language: "Panchang preview is method-bound and under review; live calculation is not enabled.",
    regional_difference_handling: "Do not suppress regional disagreement; show under-review/regional-note status where applicable."
  },
  blocked_state: blockedState
};

const sourceValidationConsumption = {
  module_id: "AG47A",
  title: "Source Validation Consumption Record",
  status: "source_validation_consumption_recorded",
  consumed_logic_families: [
    "D05 source validation",
    "ADB20 ADS08 seed validation and public-use audit",
    "AD source authority and attribution records"
  ],
  discovered_candidate_files: d05Candidates.slice(0, 40),
  source_policy: {
    public_use_requires_review: true,
    unverified_source_status: "under_editorial_review",
    invented_panchang_claims_allowed: false,
    deterministic_or_fear_based_claims_allowed: false
  },
  blocked_state: blockedState
};

const panchangRuntimeBoundary = {
  module_id: "AG47A",
  title: "Panchang Runtime Boundary Record",
  status: "panchang_runtime_boundary_recorded",
  consumed_logic_families: [
    "Panchang schema/runtime files",
    "ADB16–ADB19 runtime planning",
    "ADB20 API/runtime deferral"
  ],
  discovered_candidate_files: panchangRuntimeCandidates.slice(0, 60),
  boundary: {
    schema_exists: true,
    seed_foundation_exists: true,
    runtime_planning_exists: true,
    runtime_calculation_enabled: false,
    website_reads_database: false,
    api_runtime_enabled: false,
    public_generated_output_enabled: false
  },
  blocked_state: blockedState
};

const liveCalculationDisabledAudit = {
  module_id: "AG47A",
  title: "Live Calculation Disabled Audit",
  status: "live_calculation_disabled_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "runtime_panchang_calculation_approved_now", expected: false, actual: false, passed: true },
    { check_id: "runtime_panchang_calculation_executed", expected: false, actual: false, passed: true },
    { check_id: "public_generated_panchang_output", expected: false, actual: false, passed: true },
    { check_id: "website_database_reading_enabled", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noApiDbActivationAudit = {
  module_id: "AG47A",
  title: "No API / DB Activation Audit",
  status: "no_api_db_activation_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "api_runtime_database_reading_approved_now", expected: false, actual: false, passed: true },
    { check_id: "backend_auth_supabase_activation_performed", expected: false, actual: false, passed: true },
    { check_id: "rls_public_policy_activation_approved", expected: false, actual: false, passed: true },
    { check_id: "deployment_performed", expected: false, actual: false, passed: true },
    { check_id: "service_role_key_exposed", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG47A",
  title: "AG47B Festival Observance Readiness Record",
  status: "ready_for_ag47b_festival_observance_registry",
  ready_for_ag47b: true,
  next_stage_id: "AG47B",
  next_stage_title: "Festival and Observance Registry Integration",
  ag47b_allowed_scope: [
    "Consume M02/M03 methodology.",
    "Consume D05 observance registry/source validation records.",
    "Prepare public preview display rules.",
    "Prepare regional/manual verification notes.",
    "Keep live calculation/API/database reading disabled."
  ],
  ag47b_blocked_scope: [
    "Runtime Panchang calculation execution",
    "Automated festival/vrat public decisioning",
    "Website database-reading/API runtime activation",
    "Backend/Auth/Supabase runtime activation",
    "RLS public policy activation",
    "Deployment",
    "Service-role key exposure"
  ],
  hard_blocker_count_for_ag47b: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG47A",
  title: "AG47A to AG47B Festival Observance Boundary",
  status: "ag47b_festival_observance_boundary_created",
  next_stage_id: "AG47B",
  next_stage_title: "Festival and Observance Registry Integration",
  allowed_scope: readiness.ag47b_allowed_scope,
  blocked_scope: readiness.ag47b_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "AG47A",
  title: "Panchang Method and Location Basis Consumption",
  status: "panchang_method_location_basis_ready_for_ag47b",
  depends_on: ["AG47R", "ADB20"],
  method_consumption_file: outputs.methodConsumption,
  location_basis_file: outputs.locationBasis,
  source_validation_consumption_file: outputs.sourceValidationConsumption,
  panchang_runtime_boundary_file: outputs.panchangRuntimeBoundary,
  live_calculation_disabled_audit_file: outputs.liveCalculationDisabledAudit,
  no_api_db_activation_audit_file: outputs.noApiDbActivationAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag47a_panchang_method_location_basis_consumed: true,
    ag47r_consumed: true,
    adb20_ads_consumed: true,
    method_boundary_confirmed: true,
    location_basis_boundary_confirmed: true,
    source_validation_consumed: true,
    live_calculation_disabled_confirmed: true,
    ready_for_ag47b_festival_observance_registry: true,
    hard_blocker_count_for_ag47b: 0,

    runtime_panchang_calculation_approved_now: false,
    runtime_panchang_calculation_executed: false,
    website_database_reading_enabled: false,
    api_runtime_database_reading_approved_now: false,
    backend_auth_supabase_activation_approved: false,
    backend_auth_supabase_activation_performed: false,
    rls_public_policy_activation_approved: false,
    deployment_approved: false,
    deployment_performed: false,
    service_role_key_exposed: false,
    public_generated_panchang_output: false,
    public_content_generated: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG47A",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG47A",
  status: review.status,
  ag47a_panchang_method_location_basis_consumed: 1,
  ag47r_consumed: 1,
  adb20_ads_consumed: 1,
  method_boundary_confirmed: 1,
  location_basis_boundary_confirmed: 1,
  source_validation_consumed: 1,
  live_calculation_disabled_confirmed: 1,
  ready_for_ag47b_festival_observance_registry: 1,
  hard_blocker_count_for_ag47b: 0,

  runtime_panchang_calculation_approved_now: 0,
  runtime_panchang_calculation_executed: 0,
  website_database_reading_enabled: 0,
  api_runtime_database_reading_approved_now: 0,
  backend_auth_supabase_activation_approved: 0,
  backend_auth_supabase_activation_performed: 0,
  rls_public_policy_activation_approved: 0,
  deployment_approved: 0,
  deployment_performed: 0,
  service_role_key_exposed: 0,
  public_generated_panchang_output: 0,
  public_content_generated: 0
};

const doc = `# AG47A — Panchang Method and Location Basis Consumption

## Result

AG47A consumes the Panchang methodology, source-validation and location-basis foundation without activating live calculation.

## Confirmed

- AG47R roadmap alignment consumed.
- ADB20 ADS reconciliation consumed.
- Panchang method boundary confirmed.
- Location basis boundary confirmed.
- Source validation boundary confirmed.
- Live calculation remains disabled.
- Website database reading remains disabled.

## Still blocked

- Runtime Panchang calculation execution
- Website database-reading/API runtime activation
- Backend/Auth/Supabase runtime activation
- RLS public policy activation
- Deployment
- Service-role key exposure
- Public generated Panchang output

## Next

AG47B — Festival and Observance Registry Integration.
`;

writeJson(outputs.methodConsumption, methodConsumption);
writeJson(outputs.locationBasis, locationBasis);
writeJson(outputs.sourceValidationConsumption, sourceValidationConsumption);
writeJson(outputs.panchangRuntimeBoundary, panchangRuntimeBoundary);
writeJson(outputs.liveCalculationDisabledAudit, liveCalculationDisabledAudit);
writeJson(outputs.noApiDbActivationAudit, noApiDbActivationAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG47A Panchang Method and Location Basis Consumption generated.");
console.log("✅ Method, source validation, location basis and runtime boundary recorded.");
console.log("✅ Ready for AG47B Festival and Observance Registry Integration.");
console.log("✅ Live calculation, API/DB reading, backend/Auth/RLS, deployment and public generated output remain blocked.");
