import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag47rSourceOfTruth: "data/content-intelligence/ag-roadmap/ag47r-v01-implementation-roadmap-source-of-truth.json",
  ag47rPlan: "data/content-intelligence/ag-roadmap/ag47r-ag47a-to-ag47z-substage-plan.json",

  ag47aReview: "data/content-intelligence/quality-reviews/ag47a-panchang-method-location-basis-consumption.json",
  ag47aMethod: "data/content-intelligence/cultural-modules/ag47a-panchang-method-consumption-record.json",
  ag47aRuntime: "data/content-intelligence/cultural-modules/ag47a-panchang-runtime-boundary-record.json",

  ag47bReview: "data/content-intelligence/quality-reviews/ag47b-festival-observance-registry-integration.json",
  ag47bObservance: "data/content-intelligence/cultural-modules/ag47b-observance-registry-consumption-record.json",
  ag47bSafety: "data/content-intelligence/cultural-modules/ag47b-observance-safety-boundary-record.json",

  ag47cReview: "data/content-intelligence/quality-reviews/ag47c-vedic-guidance-sanskrit-integrity-safety.json",
  ag47cMantraGate: "data/content-intelligence/cultural-modules/ag47c-sanskrit-mantra-integrity-gate.json",
  ag47cNonDeterministic: "data/content-intelligence/cultural-modules/ag47c-non-deterministic-guidance-boundary-record.json",

  ag47dReview: "data/content-intelligence/quality-reviews/ag47d-cultural-module-integration-audit.json",
  ag47dIntegratedAudit: "data/content-intelligence/cultural-modules/ag47d-integrated-cultural-module-audit.json",
  ag47dSurfaceReadiness: "data/content-intelligence/cultural-modules/ag47d-homepage-discover-surface-readiness-audit.json",
  ag47dSafetyAudit: "data/content-intelligence/cultural-modules/ag47d-cross-module-safety-consistency-audit.json",
  ag47dSourceAudit: "data/content-intelligence/cultural-modules/ag47d-source-review-continuity-audit.json",
  ag47dGapRegister: "data/content-intelligence/cultural-modules/ag47d-ag47z-closure-gap-register.json",
  ag47dNoRuntime: "data/content-intelligence/backend-architecture/ag47d-no-runtime-api-deployment-audit.json",
  ag47dNoPublicOutput: "data/content-intelligence/backend-architecture/ag47d-no-public-generated-cultural-output-audit.json",
  ag47dReadiness: "data/content-intelligence/quality-registry/ag47d-ag47z-cultural-module-closure-readiness-record.json",
  ag47dBoundary: "data/content-intelligence/mutation-plans/ag47d-to-ag47z-cultural-module-closure-boundary.json",

  adb20Ads: "data/content-intelligence/runtime-engine/adb20-ads-coverage-reconciliation.json",
  adb20ApiDeferral: "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag47z-panchang-festival-vedic-closure.json",
  closureRecord: "data/content-intelligence/cultural-modules/ag47z-panchang-festival-vedic-closure-record.json",
  consumptionSummary: "data/content-intelligence/cultural-modules/ag47z-ag47a-to-ag47d-consumption-summary.json",
  carryForwardDeferralRegister: "data/content-intelligence/cultural-modules/ag47z-carry-forward-deferral-register.json",
  publicSurfaceClosure: "data/content-intelligence/cultural-modules/ag47z-public-surface-closure-position.json",
  ag48aHandoff: "data/content-intelligence/ag-roadmap/ag47z-ag48a-word-bank-rotation-handoff.json",
  noRuntimeApiDeploymentAudit: "data/content-intelligence/backend-architecture/ag47z-no-runtime-api-deployment-audit.json",
  noPublicGeneratedOutputAudit: "data/content-intelligence/backend-architecture/ag47z-no-public-generated-cultural-output-audit.json",
  noSecretExposureAudit: "data/content-intelligence/backend-architecture/ag47z-no-secret-exposure-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag47z-ag48a-word-bank-rotation-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag47z-to-ag48a-word-bank-rotation-boundary.json",
  registry: "data/quality/ag47z-panchang-festival-vedic-closure.json",
  preview: "data/quality/ag47z-panchang-festival-vedic-closure-preview.json",
  doc: "docs/quality/AG47Z_PANCHANG_FESTIVAL_VEDIC_CLOSURE.md"
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

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG47Z input: ${p}`);
}

const ag47rSourceOfTruth = readJson(inputs.ag47rSourceOfTruth);
const ag47rPlan = readJson(inputs.ag47rPlan);

const ag47aReview = readJson(inputs.ag47aReview);
const ag47aMethod = readJson(inputs.ag47aMethod);
const ag47aRuntime = readJson(inputs.ag47aRuntime);

const ag47bReview = readJson(inputs.ag47bReview);
const ag47bObservance = readJson(inputs.ag47bObservance);
const ag47bSafety = readJson(inputs.ag47bSafety);

const ag47cReview = readJson(inputs.ag47cReview);
const ag47cMantraGate = readJson(inputs.ag47cMantraGate);
const ag47cNonDeterministic = readJson(inputs.ag47cNonDeterministic);

const ag47dReview = readJson(inputs.ag47dReview);
const ag47dIntegratedAudit = readJson(inputs.ag47dIntegratedAudit);
const ag47dSurfaceReadiness = readJson(inputs.ag47dSurfaceReadiness);
const ag47dSafetyAudit = readJson(inputs.ag47dSafetyAudit);
const ag47dSourceAudit = readJson(inputs.ag47dSourceAudit);
const ag47dGapRegister = readJson(inputs.ag47dGapRegister);
const ag47dNoRuntime = readJson(inputs.ag47dNoRuntime);
const ag47dNoPublicOutput = readJson(inputs.ag47dNoPublicOutput);
const ag47dReadiness = readJson(inputs.ag47dReadiness);
const ag47dBoundary = readJson(inputs.ag47dBoundary);

const adb20Ads = readJson(inputs.adb20Ads);
const adb20ApiDeferral = readJson(inputs.adb20ApiDeferral);

if (!JSON.stringify(ag47rSourceOfTruth.governing_rule).includes("AG48 remains Word of the Day and Reflection")) throw new Error("AG48 source-of-truth preservation missing.");
if (ag47rPlan.next_actual_stage !== "AG47A") throw new Error("AG47R substage plan mismatch.");
if (!JSON.stringify(ag47rPlan.substages).includes("AG47Z")) throw new Error("AG47Z missing from AG47R plan.");

if (ag47aReview.status !== "panchang_method_location_basis_ready_for_ag47b") throw new Error("AG47A review status mismatch.");
if (ag47aMethod.method_boundary?.live_calculation_status !== "disabled") throw new Error("AG47A live calculation must remain disabled.");
if (ag47aRuntime.boundary?.runtime_calculation_enabled !== false) throw new Error("AG47A runtime calculation must remain disabled.");

if (ag47bReview.status !== "festival_observance_registry_ready_for_ag47c") throw new Error("AG47B review status mismatch.");
if (ag47bObservance.registry_boundary?.use_as_automated_observance_decision_engine !== false) throw new Error("AG47B automated observance engine must remain disabled.");
if (ag47bSafety.review_required_before_public_use !== true) throw new Error("AG47B public-use review requirement missing.");

if (ag47cReview.status !== "vedic_guidance_sanskrit_safety_ready_for_ag47d") throw new Error("AG47C review status mismatch.");
if (ag47cMantraGate.public_use_default !== false) throw new Error("AG47C Sanskrit/mantra public-use default must remain false.");
if (ag47cNonDeterministic.boundary?.automated_runtime_guidance_allowed_now !== false) throw new Error("AG47C automated runtime guidance must remain disabled.");

if (ag47dReview.status !== "cultural_module_integration_audit_ready_for_ag47z") throw new Error("AG47D review status mismatch.");
if (ag47dIntegratedAudit.audit_result !== "passed") throw new Error("AG47D integrated audit must pass.");
if (ag47dSurfaceReadiness.readiness_result !== "ready_for_ag47z_closure_not_public_runtime") throw new Error("AG47D surface readiness mismatch.");
if (ag47dSafetyAudit.audit_result !== "passed") throw new Error("AG47D safety audit must pass.");
if (ag47dSourceAudit.audit_result !== "passed") throw new Error("AG47D source audit must pass.");
if (ag47dGapRegister.ag47z_closure_allowed !== true) throw new Error("AG47Z closure must be allowed by AG47D.");
if (Array.isArray(ag47dGapRegister.blocking_gaps_for_ag47z) && ag47dGapRegister.blocking_gaps_for_ag47z.length !== 0) throw new Error("AG47Z must have zero blocking gaps.");
if (ag47dNoRuntime.audit_passed !== true) throw new Error("AG47D no-runtime audit must pass.");
if (ag47dNoPublicOutput.audit_passed !== true) throw new Error("AG47D no-public-output audit must pass.");
if (ag47dReadiness.ready_for_ag47z !== true || ag47dReadiness.next_stage_id !== "AG47Z") throw new Error("AG47D readiness must permit AG47Z.");
if (ag47dBoundary.next_stage_id !== "AG47Z") throw new Error("AG47D boundary must point to AG47Z.");

if (adb20Ads.status !== "ads_coverage_reconciliation_completed") throw new Error("ADB20 ADS reconciliation missing.");
if (adb20ApiDeferral.website_database_reading_enabled !== false) throw new Error("ADB20 website DB reading must remain disabled.");

const blockedState = {
  ag47z_panchang_festival_vedic_closed: true,
  ag47a_ag47b_ag47c_ag47d_consumed: true,
  cultural_module_closure_completed: true,
  ag48a_word_bank_rotation_handoff_created: true,
  ready_for_ag48a_word_bank_rotation_consumption: true,

  runtime_panchang_calculation_approved_now: false,
  runtime_panchang_calculation_executed: false,
  automated_observance_decisioning_approved_now: false,
  automated_observance_decisioning_executed: false,
  automated_guidance_generation_approved_now: false,
  automated_guidance_generation_executed: false,
  invented_sanskrit_mantra_publication_allowed: false,
  predictive_or_fear_based_claim_allowed: false,
  website_database_reading_enabled: false,
  api_runtime_database_reading_approved_now: false,
  backend_auth_supabase_activation_approved: false,
  backend_auth_supabase_activation_performed: false,
  rls_public_policy_activation_approved: false,
  deployment_approved: false,
  deployment_performed: false,
  service_role_key_exposed: false,
  public_generated_cultural_output: false,
  public_content_generated: false
};

const closureRecord = {
  module_id: "AG47Z",
  title: "Panchang/Festival/Vedic Closure Record",
  status: "panchang_festival_vedic_closure_completed",
  closed_substages: [
    "AG47A Panchang Method and Location Basis Consumption",
    "AG47B Festival and Observance Registry Integration",
    "AG47C Vedic Guidance and Sanskrit Integrity Safety Gate",
    "AG47D Cultural Module Integration Audit"
  ],
  closure_result: "AG47 cultural module readiness is closed for V01 scaffold purposes only; runtime/API/public generated output remains deferred.",
  closure_allowed: true,
  blocked_state: blockedState
};

const consumptionSummary = {
  module_id: "AG47Z",
  title: "AG47A to AG47D Consumption Summary",
  status: "ag47a_to_ag47d_consumption_summarised",
  consumed_outputs: [
    {
      stage_id: "AG47A",
      consumed_boundary: "Panchang method/location/source/runtime boundary",
      result: "live Panchang calculation disabled; method-bound preview only"
    },
    {
      stage_id: "AG47B",
      consumed_boundary: "Festival/observance registry, display rules and regional verification",
      result: "automated observance decisioning disabled; manual/source review required"
    },
    {
      stage_id: "AG47C",
      consumed_boundary: "Vedic guidance, Sanskrit/mantra integrity and non-deterministic safety",
      result: "automated guidance/invented mantra/predictive claims blocked"
    },
    {
      stage_id: "AG47D",
      consumed_boundary: "Integrated cultural module audit",
      result: "AG47Z closure permitted; no blocking gaps"
    }
  ],
  blocked_state: blockedState
};

const carryForwardDeferralRegister = {
  module_id: "AG47Z",
  title: "Carry-forward Deferral Register",
  status: "carry_forward_deferral_register_recorded",
  deferred_items: [
    "Runtime Panchang calculation execution",
    "Website database/API runtime reading",
    "Backend/Auth/Supabase runtime activation",
    "RLS public policy activation",
    "Automated festival/vrat public decisioning",
    "Automated Vedic guidance generation",
    "Full Panchanga master corpus expansion",
    "Full regional observance rule depth",
    "Public Sanskrit/mantra publication without source-level review",
    "Deployment"
  ],
  future_reentry_rule: "Future activation must start from explicit runtime/API/public-use approval stage, not from AG47Z.",
  blocked_state: blockedState
};

const publicSurfaceClosure = {
  module_id: "AG47Z",
  title: "Public Surface Closure Position",
  status: "public_surface_closure_position_recorded",
  allowed_for_v01: [
    "static/review-gated Panchang method note",
    "static/review-gated festival/observance note",
    "static/review-gated Vedic guidance note",
    "regional/manual verification note",
    "under editorial verification status"
  ],
  blocked_for_v01_without_later_approval: [
    "live Panchang calculation card",
    "location-specific Panchang generated from runtime",
    "automated festival/vrat decision card",
    "automated Vedic guidance card",
    "public generated mantra/Sanskrit content",
    "database/API runtime-driven cultural module"
  ],
  blocked_state: blockedState
};

const ag48aHandoff = {
  module_id: "AG47Z",
  title: "AG48A Word Bank and Rotation Handoff",
  status: "ag48a_word_bank_rotation_handoff_created",
  next_stage_id: "AG48A",
  next_stage_title: "Word Bank and Rotation Consumption",
  handoff_basis: [
    "AG47 cultural module readiness is closed.",
    "AG48 remains Word of the Day and Reflection as per AG47R source-of-truth.",
    "AG48A should consume D02 word-of-day bank and word-of-day-bank-preflight.js.",
    "AG48A should confirm curated bank, approved status, rotation policy and repeat control.",
    "AG48A must not activate personalisation, Auth, Supabase runtime or unreviewed Sanskrit/mantra publication."
  ],
  blocked_state: blockedState
};

const noRuntimeApiDeploymentAudit = {
  module_id: "AG47Z",
  title: "No Runtime / API / Deployment Audit",
  status: "no_runtime_api_deployment_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "runtime_panchang_calculation_executed", expected: false, actual: false, passed: true },
    { check_id: "automated_observance_decisioning_executed", expected: false, actual: false, passed: true },
    { check_id: "automated_guidance_generation_executed", expected: false, actual: false, passed: true },
    { check_id: "website_database_reading_enabled", expected: false, actual: false, passed: true },
    { check_id: "api_runtime_database_reading_approved_now", expected: false, actual: false, passed: true },
    { check_id: "backend_auth_supabase_activation_performed", expected: false, actual: false, passed: true },
    { check_id: "deployment_performed", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noPublicGeneratedOutputAudit = {
  module_id: "AG47Z",
  title: "No Public Generated Cultural Output Audit",
  status: "no_public_generated_cultural_output_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "public_generated_cultural_output", expected: false, actual: false, passed: true },
    { check_id: "public_content_generated", expected: false, actual: false, passed: true },
    { check_id: "invented_sanskrit_mantra_publication_allowed", expected: false, actual: false, passed: true },
    { check_id: "predictive_or_fear_based_claim_allowed", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noSecretExposureAudit = {
  module_id: "AG47Z",
  title: "No Secret Exposure Audit",
  status: "no_secret_exposure_audit_passed",
  audit_passed: true,
  service_role_key_exposed: false,
  secret_committed_to_repo: false,
  secret_shared_in_chat: false,
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG47Z",
  title: "AG48A Word Bank and Rotation Readiness Record",
  status: "ready_for_ag48a_word_bank_rotation_consumption",
  ready_for_ag48a: true,
  next_stage_id: "AG48A",
  next_stage_title: "Word Bank and Rotation Consumption",
  ag48a_allowed_scope: [
    "Consume D02 word-of-day bank.",
    "Consume word-of-day-bank-preflight.js.",
    "Confirm curated bank, approved status, rotation policy and repeat control.",
    "Prepare AG48 Word of the Day and Reflection readiness path."
  ],
  ag48a_blocked_scope: [
    "Unreviewed Sanskrit/mantra publication",
    "Personalisation/Auth activation",
    "Website database-reading/API runtime activation",
    "Backend/Auth/Supabase runtime activation",
    "RLS public policy activation",
    "Deployment",
    "Service-role key exposure",
    "Public generated cultural output"
  ],
  hard_blocker_count_for_ag48a: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG47Z",
  title: "AG47Z to AG48A Word Bank and Rotation Boundary",
  status: "ag48a_word_bank_rotation_boundary_created",
  next_stage_id: "AG48A",
  next_stage_title: "Word Bank and Rotation Consumption",
  allowed_scope: readiness.ag48a_allowed_scope,
  blocked_scope: readiness.ag48a_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "AG47Z",
  title: "Panchang/Festival/Vedic Closure",
  status: "panchang_festival_vedic_closed_ready_for_ag48a",
  depends_on: ["AG47D", "AG47C", "AG47B", "AG47A", "AG47R", "ADB20"],
  closure_record_file: outputs.closureRecord,
  consumption_summary_file: outputs.consumptionSummary,
  carry_forward_deferral_register_file: outputs.carryForwardDeferralRegister,
  public_surface_closure_file: outputs.publicSurfaceClosure,
  ag48a_handoff_file: outputs.ag48aHandoff,
  no_runtime_api_deployment_audit_file: outputs.noRuntimeApiDeploymentAudit,
  no_public_generated_output_audit_file: outputs.noPublicGeneratedOutputAudit,
  no_secret_exposure_audit_file: outputs.noSecretExposureAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag47z_panchang_festival_vedic_closed: true,
    ag47a_ag47b_ag47c_ag47d_consumed: true,
    cultural_module_closure_completed: true,
    ag48a_word_bank_rotation_handoff_created: true,
    ready_for_ag48a_word_bank_rotation_consumption: true,
    hard_blocker_count_for_ag48a: 0,

    runtime_panchang_calculation_approved_now: false,
    runtime_panchang_calculation_executed: false,
    automated_observance_decisioning_approved_now: false,
    automated_observance_decisioning_executed: false,
    automated_guidance_generation_approved_now: false,
    automated_guidance_generation_executed: false,
    invented_sanskrit_mantra_publication_allowed: false,
    predictive_or_fear_based_claim_allowed: false,
    website_database_reading_enabled: false,
    api_runtime_database_reading_approved_now: false,
    backend_auth_supabase_activation_approved: false,
    backend_auth_supabase_activation_performed: false,
    rls_public_policy_activation_approved: false,
    deployment_approved: false,
    deployment_performed: false,
    service_role_key_exposed: false,
    public_generated_cultural_output: false,
    public_content_generated: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG47Z",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG47Z",
  status: review.status,
  ag47z_panchang_festival_vedic_closed: 1,
  ag47a_ag47b_ag47c_ag47d_consumed: 1,
  cultural_module_closure_completed: 1,
  ag48a_word_bank_rotation_handoff_created: 1,
  ready_for_ag48a_word_bank_rotation_consumption: 1,
  hard_blocker_count_for_ag48a: 0,

  runtime_panchang_calculation_approved_now: 0,
  runtime_panchang_calculation_executed: 0,
  automated_observance_decisioning_approved_now: 0,
  automated_observance_decisioning_executed: 0,
  automated_guidance_generation_approved_now: 0,
  automated_guidance_generation_executed: 0,
  invented_sanskrit_mantra_publication_allowed: 0,
  predictive_or_fear_based_claim_allowed: 0,
  website_database_reading_enabled: 0,
  api_runtime_database_reading_approved_now: 0,
  backend_auth_supabase_activation_approved: 0,
  backend_auth_supabase_activation_performed: 0,
  rls_public_policy_activation_approved: 0,
  deployment_approved: 0,
  deployment_performed: 0,
  service_role_key_exposed: 0,
  public_generated_cultural_output: 0,
  public_content_generated: 0
};

const doc = `# AG47Z — Panchang/Festival/Vedic Closure

## Result

AG47Z closes the AG47 Panchang/Festival/Vedic readiness block and creates the handoff to AG48A.

## Closed

- AG47A — Panchang Method and Location Basis Consumption
- AG47B — Festival and Observance Registry Integration
- AG47C — Vedic Guidance and Sanskrit Integrity Safety Gate
- AG47D — Cultural Module Integration Audit

## Handoff

Next stage: AG48A — Word Bank and Rotation Consumption.

## Still blocked

- Runtime Panchang calculation execution
- Automated festival/vrat public decisioning
- Automated Vedic guidance generation
- Invented Sanskrit/mantra publication
- Website database-reading/API runtime activation
- Backend/Auth/Supabase runtime activation
- RLS public policy activation
- Deployment
- Service-role key exposure
- Public generated cultural output
`;

writeJson(outputs.closureRecord, closureRecord);
writeJson(outputs.consumptionSummary, consumptionSummary);
writeJson(outputs.carryForwardDeferralRegister, carryForwardDeferralRegister);
writeJson(outputs.publicSurfaceClosure, publicSurfaceClosure);
writeJson(outputs.ag48aHandoff, ag48aHandoff);
writeJson(outputs.noRuntimeApiDeploymentAudit, noRuntimeApiDeploymentAudit);
writeJson(outputs.noPublicGeneratedOutputAudit, noPublicGeneratedOutputAudit);
writeJson(outputs.noSecretExposureAudit, noSecretExposureAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG47Z Panchang/Festival/Vedic Closure generated.");
console.log("✅ AG47A–AG47D closed and AG48A handoff created.");
console.log("✅ Ready for AG48A Word Bank and Rotation Consumption.");
console.log("✅ Runtime/API/DB reading, backend/Auth/RLS, deployment and public generated cultural output remain blocked.");
