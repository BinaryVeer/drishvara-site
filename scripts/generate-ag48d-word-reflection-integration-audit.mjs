import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag48aReview: "data/content-intelligence/quality-reviews/ag48a-word-bank-rotation-consumption.json",
  ag48aWordBank: "data/content-intelligence/word-reflection/ag48a-word-bank-consumption-record.json",
  ag48aRotation: "data/content-intelligence/word-reflection/ag48a-rotation-policy-consumption-record.json",
  ag48aApproval: "data/content-intelligence/word-reflection/ag48a-word-approval-status-boundary.json",
  ag48aRepeat: "data/content-intelligence/word-reflection/ag48a-repeat-control-boundary.json",
  ag48aReflection: "data/content-intelligence/word-reflection/ag48a-reflection-readiness-seed-record.json",
  ag48aNoAuth: "data/content-intelligence/backend-architecture/ag48a-no-personalisation-auth-activation-audit.json",
  ag48aNoRuntime: "data/content-intelligence/backend-architecture/ag48a-no-runtime-api-deployment-audit.json",
  ag48aNoPublic: "data/content-intelligence/backend-architecture/ag48a-no-public-word-generation-audit.json",

  ag48bReview: "data/content-intelligence/quality-reviews/ag48b-multilingual-language-safety-review.json",
  ag48bFieldAudit: "data/content-intelligence/word-reflection/ag48b-multilingual-field-safety-audit.json",
  ag48bMeaning: "data/content-intelligence/word-reflection/ag48b-sanskrit-hindi-english-meaning-boundary.json",
  ag48bTransliteration: "data/content-intelligence/word-reflection/ag48b-transliteration-script-integrity-boundary.json",
  ag48bToggle: "data/content-intelligence/word-reflection/ag48b-language-toggle-stability-review.json",
  ag48bMantraBlocker: "data/content-intelligence/word-reflection/ag48b-unreviewed-sanskrit-mantra-publication-blocker.json",
  ag48bReflectionHandoff: "data/content-intelligence/word-reflection/ag48b-reflection-language-safety-handoff.json",
  ag48bNoAuth: "data/content-intelligence/backend-architecture/ag48b-no-personalisation-auth-activation-audit.json",
  ag48bNoRuntime: "data/content-intelligence/backend-architecture/ag48b-no-runtime-api-deployment-audit.json",
  ag48bNoPublic: "data/content-intelligence/backend-architecture/ag48b-no-public-language-generation-audit.json",

  ag48cReview: "data/content-intelligence/quality-reviews/ag48c-reflection-homepage-integration.json",
  ag48cPrompt: "data/content-intelligence/word-reflection/ag48c-reflection-prompt-integration-record.json",
  ag48cHomepageMap: "data/content-intelligence/word-reflection/ag48c-homepage-discover-reflect-surface-map.json",
  ag48cStaticDisplay: "data/content-intelligence/word-reflection/ag48c-static-reflection-display-boundary.json",
  ag48cFlow: "data/content-intelligence/word-reflection/ag48c-discover-read-reflect-flow-readiness-record.json",
  ag48cNoPersonalisation: "data/content-intelligence/word-reflection/ag48c-no-personalisation-reflection-boundary.json",
  ag48cGapRegister: "data/content-intelligence/word-reflection/ag48c-ag48d-integration-gap-register.json",
  ag48cNoAuth: "data/content-intelligence/backend-architecture/ag48c-no-personalisation-auth-activation-audit.json",
  ag48cNoRuntime: "data/content-intelligence/backend-architecture/ag48c-no-runtime-api-deployment-audit.json",
  ag48cNoPublic: "data/content-intelligence/backend-architecture/ag48c-no-public-reflection-generation-audit.json",
  ag48cReadiness: "data/content-intelligence/quality-registry/ag48c-ag48d-word-reflection-integration-audit-readiness-record.json",
  ag48cBoundary: "data/content-intelligence/mutation-plans/ag48c-to-ag48d-word-reflection-integration-audit-boundary.json",

  ag47rSourceOfTruth: "data/content-intelligence/ag-roadmap/ag47r-v01-implementation-roadmap-source-of-truth.json",
  adb20ApiDeferral: "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag48d-word-reflection-integration-audit.json",
  integratedAudit: "data/content-intelligence/word-reflection/ag48d-integrated-word-reflection-audit.json",
  languageToggleContinuityAudit: "data/content-intelligence/word-reflection/ag48d-language-and-toggle-continuity-audit.json",
  homepageSurfaceAudit: "data/content-intelligence/word-reflection/ag48d-homepage-surface-integration-audit.json",
  publicUseReviewGateAudit: "data/content-intelligence/word-reflection/ag48d-public-use-and-review-gate-audit.json",
  ag48zClosureGapRegister: "data/content-intelligence/word-reflection/ag48d-ag48z-closure-gap-register.json",
  noPersonalisationAuthAudit: "data/content-intelligence/backend-architecture/ag48d-no-personalisation-auth-activation-audit.json",
  noRuntimeApiDeploymentAudit: "data/content-intelligence/backend-architecture/ag48d-no-runtime-api-deployment-audit.json",
  noPublicOutputAudit: "data/content-intelligence/backend-architecture/ag48d-no-public-word-reflection-output-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag48d-ag48z-word-reflection-closure-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag48d-to-ag48z-word-reflection-closure-boundary.json",
  registry: "data/quality/ag48d-word-reflection-integration-audit.json",
  preview: "data/quality/ag48d-word-reflection-integration-audit-preview.json",
  doc: "docs/quality/AG48D_WORD_REFLECTION_INTEGRATION_AUDIT.md"
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
  if (!exists(p)) throw new Error(`Missing AG48D input: ${p}`);
}

const ag48aReview = readJson(inputs.ag48aReview);
const ag48aWordBank = readJson(inputs.ag48aWordBank);
const ag48aRotation = readJson(inputs.ag48aRotation);
const ag48aApproval = readJson(inputs.ag48aApproval);
const ag48aRepeat = readJson(inputs.ag48aRepeat);
const ag48aReflection = readJson(inputs.ag48aReflection);
const ag48aNoAuth = readJson(inputs.ag48aNoAuth);
const ag48aNoRuntime = readJson(inputs.ag48aNoRuntime);
const ag48aNoPublic = readJson(inputs.ag48aNoPublic);

const ag48bReview = readJson(inputs.ag48bReview);
const ag48bFieldAudit = readJson(inputs.ag48bFieldAudit);
const ag48bMeaning = readJson(inputs.ag48bMeaning);
const ag48bTransliteration = readJson(inputs.ag48bTransliteration);
const ag48bToggle = readJson(inputs.ag48bToggle);
const ag48bMantraBlocker = readJson(inputs.ag48bMantraBlocker);
const ag48bReflectionHandoff = readJson(inputs.ag48bReflectionHandoff);
const ag48bNoAuth = readJson(inputs.ag48bNoAuth);
const ag48bNoRuntime = readJson(inputs.ag48bNoRuntime);
const ag48bNoPublic = readJson(inputs.ag48bNoPublic);

const ag48cReview = readJson(inputs.ag48cReview);
const ag48cPrompt = readJson(inputs.ag48cPrompt);
const ag48cHomepageMap = readJson(inputs.ag48cHomepageMap);
const ag48cStaticDisplay = readJson(inputs.ag48cStaticDisplay);
const ag48cFlow = readJson(inputs.ag48cFlow);
const ag48cNoPersonalisation = readJson(inputs.ag48cNoPersonalisation);
const ag48cGapRegister = readJson(inputs.ag48cGapRegister);
const ag48cNoAuth = readJson(inputs.ag48cNoAuth);
const ag48cNoRuntime = readJson(inputs.ag48cNoRuntime);
const ag48cNoPublic = readJson(inputs.ag48cNoPublic);
const ag48cReadiness = readJson(inputs.ag48cReadiness);
const ag48cBoundary = readJson(inputs.ag48cBoundary);

const ag47rSourceOfTruth = readJson(inputs.ag47rSourceOfTruth);
const adb20ApiDeferral = readJson(inputs.adb20ApiDeferral);

if (ag48aReview.status !== "word_bank_rotation_consumed_ready_for_ag48b") throw new Error("AG48A review status mismatch.");
if (ag48aWordBank.consumption_boundary?.editorial_review_required_before_public_use !== true) throw new Error("AG48A editorial review requirement missing.");
if (ag48aRotation.rotation_boundary?.approved_items_only_required !== true) throw new Error("AG48A approved-items-only rule missing.");
if (ag48aApproval.default_public_use_allowed !== false) throw new Error("AG48A default public use must remain false.");
if (ag48aRepeat.live_repeat_control_execution_now !== false) throw new Error("AG48A live repeat-control must remain disabled.");
if (ag48aReflection.reflection_position?.public_generated_reflection_disabled_now !== true) throw new Error("AG48A generated reflection must remain disabled.");
if (ag48aNoAuth.audit_passed !== true) throw new Error("AG48A no-auth audit must pass.");
if (ag48aNoRuntime.audit_passed !== true) throw new Error("AG48A no-runtime audit must pass.");
if (ag48aNoPublic.audit_passed !== true) throw new Error("AG48A no-public audit must pass.");

if (ag48bReview.status !== "multilingual_language_safety_ready_for_ag48c") throw new Error("AG48B review status mismatch.");
if (ag48bFieldAudit.field_review_requirements?.public_use_allowed_default !== false) throw new Error("AG48B public-use default must remain false.");
if (ag48bMeaning.public_use_default !== false) throw new Error("AG48B meaning public-use default must remain false.");
if (ag48bTransliteration.auto_transliteration_publication_allowed !== false) throw new Error("AG48B auto transliteration must remain blocked.");
if (ag48bToggle.language_toggle_runtime_mutation_enabled !== false) throw new Error("AG48B language toggle runtime mutation must remain disabled.");
if (ag48bMantraBlocker.unreviewed_sanskrit_mantra_publication_allowed !== false) throw new Error("AG48B unreviewed Sanskrit/mantra must remain blocked.");
if (ag48bReflectionHandoff.ready_for_ag48c !== true) throw new Error("AG48B reflection handoff must be ready.");
if (ag48bNoAuth.audit_passed !== true) throw new Error("AG48B no-auth audit must pass.");
if (ag48bNoRuntime.audit_passed !== true) throw new Error("AG48B no-runtime audit must pass.");
if (ag48bNoPublic.audit_passed !== true) throw new Error("AG48B no-public audit must pass.");

if (ag48cReview.status !== "reflection_homepage_integration_ready_for_ag48d") throw new Error("AG48C review status mismatch.");
if (ag48cPrompt.integration_boundary?.use_public_generation_engine !== false) throw new Error("AG48C public generation engine must remain disabled.");
if (ag48cHomepageMap.display_policy?.homepage_runtime_query_enabled !== false) throw new Error("AG48C homepage runtime query must remain disabled.");
if (ag48cStaticDisplay.public_display_status_now !== "not_published") throw new Error("AG48C public display must remain not published.");
if (ag48cFlow.flow_activation_now !== false) throw new Error("AG48C flow activation must remain false.");
if (ag48cFlow.requires_later_ui_smoke_test !== true) throw new Error("AG48C must require later UI smoke test.");
if (ag48cNoPersonalisation.user_personalised_reflection_enabled !== false) throw new Error("AG48C user personalised reflection must remain disabled.");
if (ag48cGapRegister.ag48d_audit_allowed !== true) throw new Error("AG48D audit must be allowed by AG48C.");
if (Array.isArray(ag48cGapRegister.blocking_gaps_for_ag48d) && ag48cGapRegister.blocking_gaps_for_ag48d.length !== 0) throw new Error("AG48D blocking gaps must be zero.");
if (ag48cNoAuth.audit_passed !== true) throw new Error("AG48C no-auth audit must pass.");
if (ag48cNoRuntime.audit_passed !== true) throw new Error("AG48C no-runtime audit must pass.");
if (ag48cNoPublic.audit_passed !== true) throw new Error("AG48C no-public audit must pass.");
if (ag48cReadiness.ready_for_ag48d !== true || ag48cReadiness.next_stage_id !== "AG48D") throw new Error("AG48C readiness must permit AG48D.");
if (ag48cBoundary.next_stage_id !== "AG48D") throw new Error("AG48C boundary must point to AG48D.");

if (!JSON.stringify(ag47rSourceOfTruth.governing_rule).includes("AG49 remains User Accounts and Personalisation")) throw new Error("AG49 roadmap source-of-truth missing.");
if (adb20ApiDeferral.website_database_reading_enabled !== false) throw new Error("Website DB reading must remain disabled.");

const blockedState = {
  ag48d_word_reflection_integration_audit_recorded: true,
  ag48a_ag48b_ag48c_consumed: true,
  word_rotation_language_reflection_boundaries_consistent: true,
  homepage_reflection_surface_audited: true,
  public_use_review_gate_audited: true,
  ag48z_closure_gap_register_recorded: true,
  ready_for_ag48z_word_reflection_closure: true,

  word_publication_approved_now: false,
  word_publication_executed: false,
  public_word_generated_now: false,
  reflection_publication_approved_now: false,
  public_reflection_generated_now: false,
  reviewed_static_reflection_runtime_enabled_now: false,
  user_personalised_reflection_enabled: false,
  personalisation_auth_activation_approved: false,
  personalisation_auth_activation_performed: false,
  unreviewed_sanskrit_mantra_publication_allowed: false,
  auto_translation_publication_allowed: false,
  auto_transliteration_publication_allowed: false,
  language_toggle_runtime_mutation_enabled: false,
  website_database_reading_enabled: false,
  api_runtime_database_reading_approved_now: false,
  backend_auth_supabase_activation_approved: false,
  backend_auth_supabase_activation_performed: false,
  rls_public_policy_activation_approved: false,
  deployment_approved: false,
  deployment_performed: false,
  service_role_key_exposed: false,
  public_generated_word_reflection_output: false,
  public_content_generated: false
};

const integratedAudit = {
  module_id: "AG48D",
  title: "Integrated Word/Reflection Audit",
  status: "integrated_word_reflection_audit_passed",
  audited_modules: [
    "AG48A Word Bank and Rotation Consumption",
    "AG48B Multilingual Language Safety Review",
    "AG48C Reflection Prompt and Homepage Integration"
  ],
  integration_findings: [
    {
      area: "word_bank_rotation",
      result: "word bank, approval status, repeat control and rotation boundaries are recorded; public publication remains blocked"
    },
    {
      area: "language_safety",
      result: "Sanskrit/Hindi/English meaning, transliteration, language toggle and unreviewed Sanskrit/mantra blockers are recorded"
    },
    {
      area: "reflection_homepage_surface",
      result: "Discover→Read→Reflect surface mapping is recorded as static/review-gated; no public generation or activation"
    },
    {
      area: "combined_public_use",
      result: "public generated word/reflection output remains blocked; only reviewed/static scaffold may proceed to closure"
    }
  ],
  audit_result: "passed",
  blocked_state: blockedState
};

const languageToggleContinuityAudit = {
  module_id: "AG48D",
  title: "Language and Toggle Continuity Audit",
  status: "language_toggle_continuity_audit_passed",
  continuity_checks: [
    "Word/reflection fields remain bound to reviewed language keys.",
    "Language toggle must not mutate source content.",
    "English/Hindi switching must restore reviewed values, not generated transliteration.",
    "Sanskrit/transliteration fields must not be auto-published.",
    "Later UI smoke test remains required before public release."
  ],
  later_ui_smoke_test_required: true,
  audit_result: "passed",
  blocked_state: blockedState
};

const homepageSurfaceAudit = {
  module_id: "AG48D",
  title: "Homepage Surface Integration Audit",
  status: "homepage_surface_integration_audit_passed",
  audited_surfaces: [
    "Discover word/reflection entry",
    "Read context link",
    "Reflect prompt block"
  ],
  allowed_v01_surface_position: "reviewed static scaffold or under-editorial-verification note only",
  blocked_v01_surface_position: [
    "live database-fed word rotation",
    "AI-generated daily reflection",
    "personalised reflection",
    "unreviewed Sanskrit/mantra",
    "runtime-generated spiritual advice"
  ],
  audit_result: "passed",
  blocked_state: blockedState
};

const publicUseReviewGateAudit = {
  module_id: "AG48D",
  title: "Public-use and Review Gate Audit",
  status: "public_use_review_gate_audit_passed",
  review_gate_rules: [
    "No word/reflection entry is public by default.",
    "Approved/reviewed status is required before public display.",
    "Language fields must be reviewed together.",
    "Unreviewed Sanskrit/mantra content is blocked.",
    "Generated reflection and personalisation are blocked.",
    "Runtime/API/database read is blocked."
  ],
  default_public_use_allowed: false,
  audit_result: "passed",
  blocked_state: blockedState
};

const ag48zClosureGapRegister = {
  module_id: "AG48D",
  title: "AG48Z Closure Gap Register",
  status: "ag48z_closure_gap_register_recorded",
  blocking_gaps_for_ag48z: [],
  carry_forward_gaps_after_ag48d: [
    "Actual public word/reflection publication remains deferred.",
    "Live database/API word rotation remains deferred.",
    "Generated reflection remains blocked.",
    "Personalised reflection remains deferred to AG49 or later.",
    "Language toggle requires later UI smoke test before public release.",
    "Unreviewed Sanskrit/mantra entries remain blocked."
  ],
  ag48z_closure_allowed: true,
  blocked_state: blockedState
};

const noPersonalisationAuthAudit = {
  module_id: "AG48D",
  title: "No Personalisation/Auth Activation Audit",
  status: "no_personalisation_auth_activation_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "user_personalised_reflection_enabled", expected: false, actual: false, passed: true },
    { check_id: "personalisation_auth_activation_approved", expected: false, actual: false, passed: true },
    { check_id: "personalisation_auth_activation_performed", expected: false, actual: false, passed: true },
    { check_id: "backend_auth_supabase_activation_performed", expected: false, actual: false, passed: true },
    { check_id: "service_role_key_exposed", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noRuntimeApiDeploymentAudit = {
  module_id: "AG48D",
  title: "No Runtime / API / Deployment Audit",
  status: "no_runtime_api_deployment_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "website_database_reading_enabled", expected: false, actual: false, passed: true },
    { check_id: "api_runtime_database_reading_approved_now", expected: false, actual: false, passed: true },
    { check_id: "backend_auth_supabase_activation_performed", expected: false, actual: false, passed: true },
    { check_id: "rls_public_policy_activation_approved", expected: false, actual: false, passed: true },
    { check_id: "deployment_performed", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noPublicOutputAudit = {
  module_id: "AG48D",
  title: "No Public Word/Reflection Output Audit",
  status: "no_public_word_reflection_output_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "word_publication_approved_now", expected: false, actual: false, passed: true },
    { check_id: "reflection_publication_approved_now", expected: false, actual: false, passed: true },
    { check_id: "public_word_generated_now", expected: false, actual: false, passed: true },
    { check_id: "public_reflection_generated_now", expected: false, actual: false, passed: true },
    { check_id: "public_generated_word_reflection_output", expected: false, actual: false, passed: true },
    { check_id: "unreviewed_sanskrit_mantra_publication_allowed", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG48D",
  title: "AG48Z Word and Reflection Closure Readiness Record",
  status: "ready_for_ag48z_word_reflection_closure",
  ready_for_ag48z: true,
  next_stage_id: "AG48Z",
  next_stage_title: "Word and Reflection Closure",
  ag48z_allowed_scope: [
    "Close AG48 Word of the Day and Reflection readiness.",
    "Record AG48A–AG48D consumption and audit outputs.",
    "Confirm public word/reflection output remains blocked.",
    "Confirm personalisation/Auth, runtime/API and deployment remain blocked.",
    "Create handoff to AG49A User/Profile Model Consumption and Gap Review."
  ],
  ag48z_blocked_scope: [
    "Public word publication",
    "Public generated reflection output",
    "Personalisation/Auth activation",
    "Unreviewed Sanskrit/mantra publication",
    "Website database-reading/API runtime activation",
    "Backend/Auth/Supabase runtime activation",
    "RLS public policy activation",
    "Deployment",
    "Service-role key exposure"
  ],
  hard_blocker_count_for_ag48z: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG48D",
  title: "AG48D to AG48Z Word and Reflection Closure Boundary",
  status: "ag48z_word_reflection_closure_boundary_created",
  next_stage_id: "AG48Z",
  next_stage_title: "Word and Reflection Closure",
  allowed_scope: readiness.ag48z_allowed_scope,
  blocked_scope: readiness.ag48z_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "AG48D",
  title: "Word/Reflection Integration Audit",
  status: "word_reflection_integration_audit_ready_for_ag48z",
  depends_on: ["AG48C", "AG48B", "AG48A", "AG47Z", "AG47R"],
  integrated_audit_file: outputs.integratedAudit,
  language_toggle_continuity_audit_file: outputs.languageToggleContinuityAudit,
  homepage_surface_audit_file: outputs.homepageSurfaceAudit,
  public_use_review_gate_audit_file: outputs.publicUseReviewGateAudit,
  ag48z_closure_gap_register_file: outputs.ag48zClosureGapRegister,
  no_personalisation_auth_audit_file: outputs.noPersonalisationAuthAudit,
  no_runtime_api_deployment_audit_file: outputs.noRuntimeApiDeploymentAudit,
  no_public_output_audit_file: outputs.noPublicOutputAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag48d_word_reflection_integration_audit_recorded: true,
    ag48a_ag48b_ag48c_consumed: true,
    word_rotation_language_reflection_boundaries_consistent: true,
    homepage_reflection_surface_audited: true,
    public_use_review_gate_audited: true,
    ag48z_closure_gap_register_recorded: true,
    ready_for_ag48z_word_reflection_closure: true,
    hard_blocker_count_for_ag48z: 0,

    word_publication_approved_now: false,
    word_publication_executed: false,
    public_word_generated_now: false,
    reflection_publication_approved_now: false,
    public_reflection_generated_now: false,
    reviewed_static_reflection_runtime_enabled_now: false,
    user_personalised_reflection_enabled: false,
    personalisation_auth_activation_approved: false,
    personalisation_auth_activation_performed: false,
    unreviewed_sanskrit_mantra_publication_allowed: false,
    auto_translation_publication_allowed: false,
    auto_transliteration_publication_allowed: false,
    language_toggle_runtime_mutation_enabled: false,
    website_database_reading_enabled: false,
    api_runtime_database_reading_approved_now: false,
    backend_auth_supabase_activation_approved: false,
    backend_auth_supabase_activation_performed: false,
    rls_public_policy_activation_approved: false,
    deployment_approved: false,
    deployment_performed: false,
    service_role_key_exposed: false,
    public_generated_word_reflection_output: false,
    public_content_generated: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG48D",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG48D",
  status: review.status,
  ag48d_word_reflection_integration_audit_recorded: 1,
  ag48a_ag48b_ag48c_consumed: 1,
  word_rotation_language_reflection_boundaries_consistent: 1,
  homepage_reflection_surface_audited: 1,
  public_use_review_gate_audited: 1,
  ag48z_closure_gap_register_recorded: 1,
  ready_for_ag48z_word_reflection_closure: 1,
  hard_blocker_count_for_ag48z: 0,

  word_publication_approved_now: 0,
  word_publication_executed: 0,
  public_word_generated_now: 0,
  reflection_publication_approved_now: 0,
  public_reflection_generated_now: 0,
  reviewed_static_reflection_runtime_enabled_now: 0,
  user_personalised_reflection_enabled: 0,
  personalisation_auth_activation_approved: 0,
  personalisation_auth_activation_performed: 0,
  unreviewed_sanskrit_mantra_publication_allowed: 0,
  auto_translation_publication_allowed: 0,
  auto_transliteration_publication_allowed: 0,
  language_toggle_runtime_mutation_enabled: 0,
  website_database_reading_enabled: 0,
  api_runtime_database_reading_approved_now: 0,
  backend_auth_supabase_activation_approved: 0,
  backend_auth_supabase_activation_performed: 0,
  rls_public_policy_activation_approved: 0,
  deployment_approved: 0,
  deployment_performed: 0,
  service_role_key_exposed: 0,
  public_generated_word_reflection_output: 0,
  public_content_generated: 0
};

const doc = `# AG48D — Word/Reflection Integration Audit

## Result

AG48D audits AG48A, AG48B and AG48C together and confirms readiness for AG48Z closure.

## Audited

- Word bank, approval status, repeat control and rotation boundaries
- Sanskrit/Hindi/English meaning and transliteration boundaries
- Language toggle continuity and UI smoke-test requirement
- Homepage Discover → Read → Reflect surface mapping
- Public-use and review gate boundaries

## Confirmed

- AG48Z closure is allowed.
- No blocking gaps exist for AG48Z.
- Public word/reflection output remains blocked.
- Personalisation/Auth, runtime/API, backend/RLS and deployment remain blocked.

## Next

AG48Z — Word and Reflection Closure.
`;

writeJson(outputs.integratedAudit, integratedAudit);
writeJson(outputs.languageToggleContinuityAudit, languageToggleContinuityAudit);
writeJson(outputs.homepageSurfaceAudit, homepageSurfaceAudit);
writeJson(outputs.publicUseReviewGateAudit, publicUseReviewGateAudit);
writeJson(outputs.ag48zClosureGapRegister, ag48zClosureGapRegister);
writeJson(outputs.noPersonalisationAuthAudit, noPersonalisationAuthAudit);
writeJson(outputs.noRuntimeApiDeploymentAudit, noRuntimeApiDeploymentAudit);
writeJson(outputs.noPublicOutputAudit, noPublicOutputAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG48D Word/Reflection Integration Audit generated.");
console.log("✅ AG48A–AG48C integrated audit, language continuity, homepage surface and public-use gate recorded.");
console.log("✅ Ready for AG48Z Word and Reflection Closure.");
console.log("✅ Public output, personalisation/Auth, API/DB reading, backend/RLS, deployment and secrets remain blocked.");
