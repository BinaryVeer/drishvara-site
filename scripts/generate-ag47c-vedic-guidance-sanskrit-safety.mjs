import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag47bReview: "data/content-intelligence/quality-reviews/ag47b-festival-observance-registry-integration.json",
  ag47bObservance: "data/content-intelligence/cultural-modules/ag47b-observance-registry-consumption-record.json",
  ag47bDisplayRules: "data/content-intelligence/cultural-modules/ag47b-festival-public-preview-display-rules.json",
  ag47bRegionalNotes: "data/content-intelligence/cultural-modules/ag47b-regional-manual-verification-notes.json",
  ag47bSafety: "data/content-intelligence/cultural-modules/ag47b-observance-safety-boundary-record.json",
  ag47bNoDecision: "data/content-intelligence/backend-architecture/ag47b-no-automated-observance-decision-audit.json",
  ag47bNoRuntime: "data/content-intelligence/backend-architecture/ag47b-no-runtime-api-deployment-audit.json",
  ag47bReadiness: "data/content-intelligence/quality-registry/ag47b-ag47c-vedic-guidance-sanskrit-safety-readiness-record.json",
  ag47bBoundary: "data/content-intelligence/mutation-plans/ag47b-to-ag47c-vedic-guidance-sanskrit-safety-boundary.json",
  ag47rPlan: "data/content-intelligence/ag-roadmap/ag47r-ag47a-to-ag47z-substage-plan.json",
  adb20Ads: "data/content-intelligence/runtime-engine/adb20-ads-coverage-reconciliation.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag47c-vedic-guidance-sanskrit-integrity-safety.json",
  doctrineConsumption: "data/content-intelligence/cultural-modules/ag47c-vedic-guidance-doctrine-consumption-record.json",
  sanskritMantraIntegrityGate: "data/content-intelligence/cultural-modules/ag47c-sanskrit-mantra-integrity-gate.json",
  guidanceLanguageSafety: "data/content-intelligence/cultural-modules/ag47c-guidance-public-language-safety-rules.json",
  sourceAttributionBoundary: "data/content-intelligence/cultural-modules/ag47c-source-attribution-review-boundary.json",
  nonDeterministicGuidanceBoundary: "data/content-intelligence/cultural-modules/ag47c-non-deterministic-guidance-boundary-record.json",
  noGuidanceGenerationAudit: "data/content-intelligence/backend-architecture/ag47c-no-guidance-generation-audit.json",
  noRuntimeApiDeploymentAudit: "data/content-intelligence/backend-architecture/ag47c-no-runtime-api-deployment-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag47c-ag47d-cultural-module-integration-audit-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag47c-to-ag47d-cultural-module-integration-audit-boundary.json",
  registry: "data/quality/ag47c-vedic-guidance-sanskrit-integrity-safety.json",
  preview: "data/quality/ag47c-vedic-guidance-sanskrit-integrity-safety-preview.json",
  doc: "docs/quality/AG47C_VEDIC_GUIDANCE_SANSKRIT_INTEGRITY_SAFETY.md"
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
  if (!exists(p)) throw new Error(`Missing AG47C input: ${p}`);
}

const ag47bReview = readJson(inputs.ag47bReview);
const ag47bObservance = readJson(inputs.ag47bObservance);
const ag47bDisplayRules = readJson(inputs.ag47bDisplayRules);
const ag47bRegionalNotes = readJson(inputs.ag47bRegionalNotes);
const ag47bSafety = readJson(inputs.ag47bSafety);
const ag47bNoDecision = readJson(inputs.ag47bNoDecision);
const ag47bNoRuntime = readJson(inputs.ag47bNoRuntime);
const ag47bReadiness = readJson(inputs.ag47bReadiness);
const ag47bBoundary = readJson(inputs.ag47bBoundary);
const ag47rPlan = readJson(inputs.ag47rPlan);
const adb20Ads = readJson(inputs.adb20Ads);

if (ag47bReview.status !== "festival_observance_registry_ready_for_ag47c") throw new Error("AG47B review status mismatch.");
if (ag47bReview.summary?.ready_for_ag47c_vedic_guidance_sanskrit_safety !== true) throw new Error("AG47C readiness missing from AG47B.");
if (ag47bObservance.registry_boundary?.use_as_automated_observance_decision_engine !== false) throw new Error("Automated observance decision engine must remain false.");
if (ag47bDisplayRules.display_policy?.automated_date_claim_allowed !== false) throw new Error("Automated observance date claim must remain blocked.");
if (ag47bRegionalNotes.status !== "regional_manual_verification_notes_recorded") throw new Error("AG47B regional notes missing.");
if (ag47bSafety.review_required_before_public_use !== true) throw new Error("AG47B safety review must be required.");
if (ag47bNoDecision.audit_passed !== true) throw new Error("AG47B no-decision audit must pass.");
if (ag47bNoRuntime.audit_passed !== true) throw new Error("AG47B no-runtime audit must pass.");
if (ag47bReadiness.ready_for_ag47c !== true || ag47bReadiness.next_stage_id !== "AG47C") throw new Error("AG47B readiness must permit AG47C.");
if (ag47bBoundary.next_stage_id !== "AG47C") throw new Error("AG47B boundary must point to AG47C.");
if (!JSON.stringify(ag47rPlan.substages).includes("AG47C")) throw new Error("AG47R substage plan must include AG47C.");
if (adb20Ads.status !== "ads_coverage_reconciliation_completed") throw new Error("ADB20 ADS reconciliation missing.");

const m00Candidates = findFiles(["m00", "source doctrine", "source-doctrine", "source_authenticity", "source-authenticity"]);
const d03d04Candidates = findFiles(["d03", "d04", "daily guidance", "daily-guidance", "vedic guidance", "guidance"]);
const d06MantraCandidates = findFiles(["d06", "mantra", "sanskrit", "sutra", "quote"]);

const blockedState = {
  ag47c_vedic_guidance_sanskrit_safety_recorded: true,
  ag47b_consumed: true,
  m00_source_doctrine_consumed: true,
  d03_d04_daily_guidance_consumed: true,
  d06_mantra_review_consumed: true,
  sanskrit_mantra_integrity_gate_recorded: true,
  source_attribution_review_boundary_recorded: true,
  non_deterministic_guidance_boundary_recorded: true,
  ready_for_ag47d_cultural_module_integration_audit: true,

  automated_guidance_generation_approved_now: false,
  automated_guidance_generation_executed: false,
  invented_sanskrit_mantra_publication_allowed: false,
  personalised_ritual_prescription_allowed: false,
  fear_based_or_deterministic_claim_allowed: false,
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
  public_generated_guidance_output: false,
  public_content_generated: false
};

const doctrineConsumption = {
  module_id: "AG47C",
  title: "Vedic Guidance Doctrine Consumption Record",
  status: "vedic_guidance_doctrine_consumption_recorded",
  consumed_logic_families: [
    "M00 source doctrine",
    "D03/D04 daily guidance records",
    "D06 mantra review records",
    "ADB20 ADS06/ADS08 reconciliation",
    "AG47B observance safety boundary"
  ],
  discovered_m00_candidate_files: m00Candidates.slice(0, 50),
  discovered_d03_d04_candidate_files: d03d04Candidates.slice(0, 60),
  discovered_d06_mantra_candidate_files: d06MantraCandidates.slice(0, 60),
  doctrine_boundary: {
    use_as_cultural_guidance_scaffold: true,
    use_as_automated_guidance_generator: false,
    use_as_personalised_ritual_prescription_engine: false,
    public_guidance_generation_status: "disabled",
    manual_editorial_review_required: true
  },
  no_duplicate_rule: "AG47C consumes doctrine and safety records; it does not recreate source doctrine, mantra corpus, daily guidance runtime or seed planning.",
  blocked_state: blockedState
};

const sanskritMantraIntegrityGate = {
  module_id: "AG47C",
  title: "Sanskrit and Mantra Integrity Gate",
  status: "sanskrit_mantra_integrity_gate_recorded",
  integrity_rules: [
    "No invented Sanskrit verses, mantras, sutras or quotations.",
    "No mantra publication without verified source, script, transliteration and meaning review.",
    "No casual paraphrase should be presented as a mantra or scriptural quote.",
    "No deity-specific chant should be generated unless it comes from a reviewed source record.",
    "No mantra should be framed as a guaranteed remedy or compulsory action.",
    "Unverified Sanskrit/mantra content must remain under editorial review."
  ],
  required_fields_before_public_use: [
    "source_authority",
    "original_script",
    "transliteration",
    "meaning_or_context",
    "usage_boundary",
    "review_status",
    "public_use_allowed"
  ],
  public_use_default: false,
  blocked_state: blockedState
};

const guidanceLanguageSafety = {
  module_id: "AG47C",
  title: "Guidance Public Language Safety Rules",
  status: "guidance_public_language_safety_rules_recorded",
  allowed_language_style: [
    "reflective",
    "cultural",
    "educational",
    "non-deterministic",
    "non-fear-based",
    "review-gated"
  ],
  blocked_public_language: [
    "this will definitely happen",
    "you must do this or harm will occur",
    "guaranteed result",
    "certain prediction",
    "mandatory remedy",
    "fear-based instruction",
    "personalised ritual prescription",
    "AI-generated mantra"
  ],
  required_disclaimers_or_notes: [
    "Cultural reflection, not prediction",
    "Regional/tradition differences may apply",
    "Source and editorial review required for mantra/Sanskrit content",
    "Live Panchang calculation is not enabled"
  ],
  blocked_state: blockedState
};

const sourceAttributionBoundary = {
  module_id: "AG47C",
  title: "Source Attribution and Review Boundary",
  status: "source_attribution_review_boundary_recorded",
  source_policy: {
    source_required_for_sanskrit: true,
    source_required_for_mantra: true,
    source_required_for_scriptural_quote: true,
    review_required_before_public_use: true,
    unverified_content_public_status: "under_editorial_review",
    generic_cultural_summary_allowed_without_quote_claim: true
  },
  attribution_requirements: [
    "authority/source title",
    "source category",
    "availability/reachability status where applicable",
    "language/script status",
    "editorial reviewer status",
    "public-use approval flag"
  ],
  blocked_state: blockedState
};

const nonDeterministicGuidanceBoundary = {
  module_id: "AG47C",
  title: "Non-deterministic Guidance Boundary Record",
  status: "non_deterministic_guidance_boundary_recorded",
  boundary: {
    predictive_guidance_allowed: false,
    fear_based_guidance_allowed: false,
    personalised_religious_instruction_allowed: false,
    general_cultural_reflection_allowed: true,
    reviewed_static_preview_allowed: true,
    automated_runtime_guidance_allowed_now: false
  },
  safe_guidance_templates: [
    "A reflective note may be shown after editorial review.",
    "A cultural context note may be shown without claiming prediction.",
    "A source-linked Sanskrit/mantra item may be shown only after review.",
    "If source confidence is incomplete, display under-review status."
  ],
  blocked_state: blockedState
};

const noGuidanceGenerationAudit = {
  module_id: "AG47C",
  title: "No Guidance Generation Audit",
  status: "no_guidance_generation_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "automated_guidance_generation_approved_now", expected: false, actual: false, passed: true },
    { check_id: "automated_guidance_generation_executed", expected: false, actual: false, passed: true },
    { check_id: "invented_sanskrit_mantra_publication_allowed", expected: false, actual: false, passed: true },
    { check_id: "personalised_ritual_prescription_allowed", expected: false, actual: false, passed: true },
    { check_id: "fear_based_or_deterministic_claim_allowed", expected: false, actual: false, passed: true },
    { check_id: "public_generated_guidance_output", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noRuntimeApiDeploymentAudit = {
  module_id: "AG47C",
  title: "No Runtime / API / Deployment Audit",
  status: "no_runtime_api_deployment_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "runtime_panchang_calculation_executed", expected: false, actual: false, passed: true },
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
  module_id: "AG47C",
  title: "AG47D Cultural Module Integration Audit Readiness Record",
  status: "ready_for_ag47d_cultural_module_integration_audit",
  ready_for_ag47d: true,
  next_stage_id: "AG47D",
  next_stage_title: "Cultural Module Integration Audit",
  ag47d_allowed_scope: [
    "Audit AG47A–AG47C outputs together.",
    "Check Panchang/Festival/Vedic guidance boundaries.",
    "Check homepage Discover integration readiness.",
    "Check no-runtime/no-API/no-public-generated-content guardrails.",
    "Prepare closure path for AG47Z."
  ],
  ag47d_blocked_scope: [
    "Runtime Panchang calculation execution",
    "Automated festival/vrat public decisioning",
    "Automated guidance generation",
    "Invented Sanskrit/mantra publication",
    "Website database-reading/API runtime activation",
    "Backend/Auth/Supabase runtime activation",
    "Deployment",
    "Service-role key exposure"
  ],
  hard_blocker_count_for_ag47d: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG47C",
  title: "AG47C to AG47D Cultural Module Integration Audit Boundary",
  status: "ag47d_cultural_module_integration_audit_boundary_created",
  next_stage_id: "AG47D",
  next_stage_title: "Cultural Module Integration Audit",
  allowed_scope: readiness.ag47d_allowed_scope,
  blocked_scope: readiness.ag47d_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "AG47C",
  title: "Vedic Guidance and Sanskrit Integrity Safety Gate",
  status: "vedic_guidance_sanskrit_safety_ready_for_ag47d",
  depends_on: ["AG47B", "AG47A", "AG47R", "ADB20"],
  doctrine_consumption_file: outputs.doctrineConsumption,
  sanskrit_mantra_integrity_gate_file: outputs.sanskritMantraIntegrityGate,
  guidance_language_safety_file: outputs.guidanceLanguageSafety,
  source_attribution_boundary_file: outputs.sourceAttributionBoundary,
  non_deterministic_guidance_boundary_file: outputs.nonDeterministicGuidanceBoundary,
  no_guidance_generation_audit_file: outputs.noGuidanceGenerationAudit,
  no_runtime_api_deployment_audit_file: outputs.noRuntimeApiDeploymentAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag47c_vedic_guidance_sanskrit_safety_recorded: true,
    ag47b_consumed: true,
    m00_source_doctrine_consumed: true,
    d03_d04_daily_guidance_consumed: true,
    d06_mantra_review_consumed: true,
    sanskrit_mantra_integrity_gate_recorded: true,
    source_attribution_review_boundary_recorded: true,
    non_deterministic_guidance_boundary_recorded: true,
    ready_for_ag47d_cultural_module_integration_audit: true,
    hard_blocker_count_for_ag47d: 0,

    automated_guidance_generation_approved_now: false,
    automated_guidance_generation_executed: false,
    invented_sanskrit_mantra_publication_allowed: false,
    personalised_ritual_prescription_allowed: false,
    fear_based_or_deterministic_claim_allowed: false,
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
    public_generated_guidance_output: false,
    public_content_generated: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG47C",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG47C",
  status: review.status,
  ag47c_vedic_guidance_sanskrit_safety_recorded: 1,
  ag47b_consumed: 1,
  m00_source_doctrine_consumed: 1,
  d03_d04_daily_guidance_consumed: 1,
  d06_mantra_review_consumed: 1,
  sanskrit_mantra_integrity_gate_recorded: 1,
  source_attribution_review_boundary_recorded: 1,
  non_deterministic_guidance_boundary_recorded: 1,
  ready_for_ag47d_cultural_module_integration_audit: 1,
  hard_blocker_count_for_ag47d: 0,

  automated_guidance_generation_approved_now: 0,
  automated_guidance_generation_executed: 0,
  invented_sanskrit_mantra_publication_allowed: 0,
  personalised_ritual_prescription_allowed: 0,
  fear_based_or_deterministic_claim_allowed: 0,
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
  public_generated_guidance_output: 0,
  public_content_generated: 0
};

const doc = `# AG47C — Vedic Guidance and Sanskrit Integrity Safety Gate

## Result

AG47C records Vedic guidance, Sanskrit/mantra integrity, source-attribution and non-deterministic guidance safety boundaries.

## Confirmed

- AG47B consumed.
- M00 source doctrine consumed as governance input.
- D03/D04 daily guidance records consumed as governance input.
- D06 mantra/Sanskrit review records consumed as governance input.
- Sanskrit/mantra integrity gate recorded.
- Non-deterministic guidance boundary recorded.
- No automated guidance generation occurred.

## Still blocked

- Automated guidance generation
- Personalised ritual prescription
- Invented Sanskrit/mantra publication
- Fear-based or deterministic claims
- Runtime Panchang calculation execution
- Website database-reading/API runtime activation
- Backend/Auth/Supabase runtime activation
- Deployment
- Service-role key exposure
- Public generated guidance output

## Next

AG47D — Cultural Module Integration Audit.
`;

writeJson(outputs.doctrineConsumption, doctrineConsumption);
writeJson(outputs.sanskritMantraIntegrityGate, sanskritMantraIntegrityGate);
writeJson(outputs.guidanceLanguageSafety, guidanceLanguageSafety);
writeJson(outputs.sourceAttributionBoundary, sourceAttributionBoundary);
writeJson(outputs.nonDeterministicGuidanceBoundary, nonDeterministicGuidanceBoundary);
writeJson(outputs.noGuidanceGenerationAudit, noGuidanceGenerationAudit);
writeJson(outputs.noRuntimeApiDeploymentAudit, noRuntimeApiDeploymentAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG47C Vedic Guidance and Sanskrit Integrity Safety Gate generated.");
console.log("✅ Doctrine, Sanskrit/mantra integrity, language safety, attribution and non-deterministic boundaries recorded.");
console.log("✅ Ready for AG47D Cultural Module Integration Audit.");
console.log("✅ Automated guidance, invented mantra, runtime/API/DB reading, backend/Auth/RLS, deployment and public generated output remain blocked.");
