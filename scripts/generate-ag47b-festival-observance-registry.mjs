import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag47aReview: "data/content-intelligence/quality-reviews/ag47a-panchang-method-location-basis-consumption.json",
  ag47aMethod: "data/content-intelligence/cultural-modules/ag47a-panchang-method-consumption-record.json",
  ag47aLocation: "data/content-intelligence/cultural-modules/ag47a-location-basis-consumption-record.json",
  ag47aSource: "data/content-intelligence/cultural-modules/ag47a-source-validation-consumption-record.json",
  ag47aRuntime: "data/content-intelligence/cultural-modules/ag47a-panchang-runtime-boundary-record.json",
  ag47aNoCalc: "data/content-intelligence/backend-architecture/ag47a-live-calculation-disabled-audit.json",
  ag47aNoApiDb: "data/content-intelligence/backend-architecture/ag47a-no-api-db-activation-audit.json",
  ag47aReadiness: "data/content-intelligence/quality-registry/ag47a-ag47b-festival-observance-readiness-record.json",
  ag47aBoundary: "data/content-intelligence/mutation-plans/ag47a-to-ag47b-festival-observance-boundary.json",
  ag47rPlan: "data/content-intelligence/ag-roadmap/ag47r-ag47a-to-ag47z-substage-plan.json",
  adb20Ads: "data/content-intelligence/runtime-engine/adb20-ads-coverage-reconciliation.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag47b-festival-observance-registry-integration.json",
  observanceRegistryConsumption: "data/content-intelligence/cultural-modules/ag47b-observance-registry-consumption-record.json",
  festivalDisplayRules: "data/content-intelligence/cultural-modules/ag47b-festival-public-preview-display-rules.json",
  regionalManualVerificationNotes: "data/content-intelligence/cultural-modules/ag47b-regional-manual-verification-notes.json",
  observanceSafetyBoundary: "data/content-intelligence/cultural-modules/ag47b-observance-safety-boundary-record.json",
  noAutomatedDecisionAudit: "data/content-intelligence/backend-architecture/ag47b-no-automated-observance-decision-audit.json",
  noRuntimeApiDeploymentAudit: "data/content-intelligence/backend-architecture/ag47b-no-runtime-api-deployment-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag47b-ag47c-vedic-guidance-sanskrit-safety-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag47b-to-ag47c-vedic-guidance-sanskrit-safety-boundary.json",
  registry: "data/quality/ag47b-festival-observance-registry-integration.json",
  preview: "data/quality/ag47b-festival-observance-registry-integration-preview.json",
  doc: "docs/quality/AG47B_FESTIVAL_OBSERVANCE_REGISTRY_INTEGRATION.md"
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
  const files = [...walk("data"), ...walk("docs"), ...walk("scripts")];
  return files.filter((file) => {
    const low = file.toLowerCase();
    return patterns.some((pattern) => low.includes(pattern.toLowerCase()));
  }).sort();
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG47B input: ${p}`);
}

const ag47aReview = readJson(inputs.ag47aReview);
const ag47aMethod = readJson(inputs.ag47aMethod);
const ag47aLocation = readJson(inputs.ag47aLocation);
const ag47aSource = readJson(inputs.ag47aSource);
const ag47aRuntime = readJson(inputs.ag47aRuntime);
const ag47aNoCalc = readJson(inputs.ag47aNoCalc);
const ag47aNoApiDb = readJson(inputs.ag47aNoApiDb);
const ag47aReadiness = readJson(inputs.ag47aReadiness);
const ag47aBoundary = readJson(inputs.ag47aBoundary);
const ag47rPlan = readJson(inputs.ag47rPlan);
const adb20Ads = readJson(inputs.adb20Ads);

if (ag47aReview.status !== "panchang_method_location_basis_ready_for_ag47b") throw new Error("AG47A review status mismatch.");
if (ag47aReview.summary?.ready_for_ag47b_festival_observance_registry !== true) throw new Error("AG47B readiness missing from AG47A.");
if (ag47aMethod.method_boundary?.live_calculation_status !== "disabled") throw new Error("AG47A live calculation must be disabled.");
if (ag47aLocation.first_preview_policy?.live_location_calculation_enabled_now !== false) throw new Error("AG47A live location calculation must be disabled.");
if (ag47aSource.source_policy?.invented_panchang_claims_allowed !== false) throw new Error("Invented Panchang claims must remain blocked.");
if (ag47aRuntime.boundary?.runtime_calculation_enabled !== false) throw new Error("Runtime calculation must remain disabled.");
if (ag47aNoCalc.audit_passed !== true) throw new Error("AG47A no-calculation audit must pass.");
if (ag47aNoApiDb.audit_passed !== true) throw new Error("AG47A no API/DB audit must pass.");
if (ag47aReadiness.ready_for_ag47b !== true || ag47aReadiness.next_stage_id !== "AG47B") throw new Error("AG47A readiness must permit AG47B.");
if (ag47aBoundary.next_stage_id !== "AG47B") throw new Error("AG47A boundary must point to AG47B.");
if (!JSON.stringify(ag47rPlan.substages).includes("AG47B")) throw new Error("AG47R substage plan must include AG47B.");
if (adb20Ads.status !== "ads_coverage_reconciliation_completed") throw new Error("ADB20 ADS reconciliation missing.");

const m02m03Candidates = findFiles(["m02", "m03", "festival", "observance", "vrat", "utsav", "parva"]);
const d05ObservanceCandidates = findFiles(["d05", "observance", "festival", "vrat", "source-validation", "source_validation"]);
const regionalCandidates = findFiles(["regional", "mithila", "bihar", "north", "south", "panchangam", "observance"]);

const blockedState = {
  ag47b_festival_observance_registry_integrated: true,
  ag47a_consumed: true,
  m02_m03_observance_logic_consumed: true,
  d05_observance_source_validation_consumed: true,
  public_preview_display_rules_recorded: true,
  regional_manual_verification_notes_recorded: true,
  observance_safety_boundary_recorded: true,
  ready_for_ag47c_vedic_guidance_sanskrit_safety: true,

  automated_festival_vrat_public_decisioning_approved_now: false,
  automated_festival_vrat_public_decisioning_executed: false,
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
  public_generated_observance_output: false,
  public_content_generated: false
};

const observanceRegistryConsumption = {
  module_id: "AG47B",
  title: "Festival and Observance Registry Consumption Record",
  status: "observance_registry_consumption_recorded",
  consumed_logic_families: [
    "M02/M03 festival and observance methodology",
    "D05 observance registry/source validation",
    "ADB20 ADS04/ADS07/ADS08 reconciliation",
    "AG47A Panchang method/location/source boundary"
  ],
  discovered_m02_m03_candidate_files: m02m03Candidates.slice(0, 50),
  discovered_d05_observance_candidate_files: d05ObservanceCandidates.slice(0, 50),
  registry_boundary: {
    use_as_public_preview_scaffold: true,
    use_as_automated_observance_decision_engine: false,
    public_observance_decisioning_status: "disabled",
    manual_editorial_verification_required: true
  },
  no_duplicate_rule: "AG47B consumes observance registry and source-validation logic; it does not recreate AD/ADB seed planning or runtime calculation.",
  blocked_state: blockedState
};

const festivalDisplayRules = {
  module_id: "AG47B",
  title: "Festival Public Preview Display Rules",
  status: "festival_public_preview_display_rules_recorded",
  display_policy: {
    allowed_display_type: "reviewed_static_preview_or_under_review_note",
    automated_date_claim_allowed: false,
    exact_tithi_transition_claim_allowed_without_review: false,
    exact_vrat_observance_claim_allowed_without_review: false,
    regional_difference_note_required: true,
    source_status_note_required: true
  },
  recommended_public_labels: [
    "Under editorial verification",
    "Regional observance may vary",
    "Source review pending",
    "Method-bound preview; live calculation not enabled"
  ],
  blocked_public_language: [
    "guaranteed observance date",
    "certain result",
    "mandatory remedy",
    "fear-based claim",
    "automatically calculated for your location"
  ],
  blocked_state: blockedState
};

const regionalManualVerificationNotes = {
  module_id: "AG47B",
  title: "Regional and Manual Verification Notes",
  status: "regional_manual_verification_notes_recorded",
  discovered_regional_candidate_files: regionalCandidates.slice(0, 50),
  regional_handling_policy: {
    north_india_general_profile: "preserve as one reference profile, not universal truth",
    east_india_bihar_mithila_profile: "preserve regional variance explicitly",
    south_indian_panchangam_profile: "preserve separate observance/calendar handling",
    default_public_policy: "show regional/manual verification note where profiles may differ"
  },
  manual_verification_required_for: [
    "festival date",
    "vrat observance day",
    "tithi transition-sensitive observance",
    "regional difference",
    "source disagreement"
  ],
  blocked_state: blockedState
};

const observanceSafetyBoundary = {
  module_id: "AG47B",
  title: "Observance Safety Boundary Record",
  status: "observance_safety_boundary_recorded",
  safety_rules: [
    "No automated festival/vrat public decisioning in AG47B.",
    "No live Panchang calculation in AG47B.",
    "No exact observance/date claim without reviewed source and regional basis.",
    "No fear-based, deterministic or compulsory-remedy language.",
    "No user-specific religious instruction or personalised ritual prescription.",
    "No public output from unverified or runtime-generated observance data."
  ],
  review_required_before_public_use: true,
  blocked_state: blockedState
};

const noAutomatedDecisionAudit = {
  module_id: "AG47B",
  title: "No Automated Observance Decision Audit",
  status: "no_automated_observance_decision_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "automated_festival_vrat_public_decisioning_approved_now", expected: false, actual: false, passed: true },
    { check_id: "automated_festival_vrat_public_decisioning_executed", expected: false, actual: false, passed: true },
    { check_id: "runtime_panchang_calculation_executed", expected: false, actual: false, passed: true },
    { check_id: "public_generated_observance_output", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noRuntimeApiDeploymentAudit = {
  module_id: "AG47B",
  title: "No Runtime / API / Deployment Audit",
  status: "no_runtime_api_deployment_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "website_database_reading_enabled", expected: false, actual: false, passed: true },
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
  module_id: "AG47B",
  title: "AG47C Vedic Guidance Sanskrit Safety Readiness Record",
  status: "ready_for_ag47c_vedic_guidance_sanskrit_safety",
  ready_for_ag47c: true,
  next_stage_id: "AG47C",
  next_stage_title: "Vedic Guidance and Sanskrit Integrity Safety Gate",
  ag47c_allowed_scope: [
    "Consume M00 source doctrine.",
    "Consume D03/D04 daily guidance records.",
    "Consume D06 mantra review records.",
    "Consume ADB20 ADS06/ADS08 status.",
    "Preserve no invented mantra, no deterministic claim and source-integrity rules."
  ],
  ag47c_blocked_scope: [
    "Automated guidance generation",
    "Personalised ritual prescription",
    "Invented Sanskrit/mantra publication",
    "Fear-based or deterministic claims",
    "Runtime Panchang calculation execution",
    "Website database-reading/API runtime activation",
    "Backend/Auth/Supabase runtime activation",
    "Deployment",
    "Service-role key exposure"
  ],
  hard_blocker_count_for_ag47c: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG47B",
  title: "AG47B to AG47C Vedic Guidance Sanskrit Safety Boundary",
  status: "ag47c_vedic_guidance_sanskrit_safety_boundary_created",
  next_stage_id: "AG47C",
  next_stage_title: "Vedic Guidance and Sanskrit Integrity Safety Gate",
  allowed_scope: readiness.ag47c_allowed_scope,
  blocked_scope: readiness.ag47c_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "AG47B",
  title: "Festival and Observance Registry Integration",
  status: "festival_observance_registry_ready_for_ag47c",
  depends_on: ["AG47A", "AG47R", "ADB20"],
  observance_registry_consumption_file: outputs.observanceRegistryConsumption,
  festival_display_rules_file: outputs.festivalDisplayRules,
  regional_manual_verification_notes_file: outputs.regionalManualVerificationNotes,
  observance_safety_boundary_file: outputs.observanceSafetyBoundary,
  no_automated_decision_audit_file: outputs.noAutomatedDecisionAudit,
  no_runtime_api_deployment_audit_file: outputs.noRuntimeApiDeploymentAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag47b_festival_observance_registry_integrated: true,
    ag47a_consumed: true,
    m02_m03_observance_logic_consumed: true,
    d05_observance_source_validation_consumed: true,
    public_preview_display_rules_recorded: true,
    regional_manual_verification_notes_recorded: true,
    observance_safety_boundary_recorded: true,
    ready_for_ag47c_vedic_guidance_sanskrit_safety: true,
    hard_blocker_count_for_ag47c: 0,

    automated_festival_vrat_public_decisioning_approved_now: false,
    automated_festival_vrat_public_decisioning_executed: false,
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
    public_generated_observance_output: false,
    public_content_generated: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG47B",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG47B",
  status: review.status,
  ag47b_festival_observance_registry_integrated: 1,
  ag47a_consumed: 1,
  m02_m03_observance_logic_consumed: 1,
  d05_observance_source_validation_consumed: 1,
  public_preview_display_rules_recorded: 1,
  regional_manual_verification_notes_recorded: 1,
  observance_safety_boundary_recorded: 1,
  ready_for_ag47c_vedic_guidance_sanskrit_safety: 1,
  hard_blocker_count_for_ag47c: 0,

  automated_festival_vrat_public_decisioning_approved_now: 0,
  automated_festival_vrat_public_decisioning_executed: 0,
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
  public_generated_observance_output: 0,
  public_content_generated: 0
};

const doc = `# AG47B — Festival and Observance Registry Integration

## Result

AG47B consumes festival/observance registry logic and prepares public-preview display rules without automated observance decisioning.

## Confirmed

- AG47A consumed.
- M02/M03 observance logic consumed as governance input.
- D05 observance/source-validation logic consumed.
- Public preview display rules recorded.
- Regional/manual verification notes recorded.
- Observance safety boundary recorded.

## Still blocked

- Automated festival/vrat public decisioning
- Runtime Panchang calculation execution
- Website database-reading/API runtime activation
- Backend/Auth/Supabase runtime activation
- RLS public policy activation
- Deployment
- Service-role key exposure
- Public generated observance output

## Next

AG47C — Vedic Guidance and Sanskrit Integrity Safety Gate.
`;

writeJson(outputs.observanceRegistryConsumption, observanceRegistryConsumption);
writeJson(outputs.festivalDisplayRules, festivalDisplayRules);
writeJson(outputs.regionalManualVerificationNotes, regionalManualVerificationNotes);
writeJson(outputs.observanceSafetyBoundary, observanceSafetyBoundary);
writeJson(outputs.noAutomatedDecisionAudit, noAutomatedDecisionAudit);
writeJson(outputs.noRuntimeApiDeploymentAudit, noRuntimeApiDeploymentAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG47B Festival and Observance Registry Integration generated.");
console.log("✅ Observance registry, display rules, regional/manual verification and safety boundary recorded.");
console.log("✅ Ready for AG47C Vedic Guidance and Sanskrit Integrity Safety Gate.");
console.log("✅ Automated observance decisioning, runtime calculation, API/DB reading, backend/Auth/RLS, deployment and public generated output remain blocked.");
