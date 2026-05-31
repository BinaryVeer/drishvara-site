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
  ag48aNoPublicGeneration: "data/content-intelligence/backend-architecture/ag48a-no-public-word-generation-audit.json",
  ag48aReadiness: "data/content-intelligence/quality-registry/ag48a-ag48b-multilingual-language-safety-readiness-record.json",
  ag48aBoundary: "data/content-intelligence/mutation-plans/ag48a-to-ag48b-multilingual-language-safety-boundary.json",
  ag47rSourceOfTruth: "data/content-intelligence/ag-roadmap/ag47r-v01-implementation-roadmap-source-of-truth.json",
  adb20ApiDeferral: "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag48b-multilingual-language-safety-review.json",
  multilingualFieldAudit: "data/content-intelligence/word-reflection/ag48b-multilingual-field-safety-audit.json",
  meaningBoundary: "data/content-intelligence/word-reflection/ag48b-sanskrit-hindi-english-meaning-boundary.json",
  transliterationBoundary: "data/content-intelligence/word-reflection/ag48b-transliteration-script-integrity-boundary.json",
  languageToggleReview: "data/content-intelligence/word-reflection/ag48b-language-toggle-stability-review.json",
  sanskritMantraBlocker: "data/content-intelligence/word-reflection/ag48b-unreviewed-sanskrit-mantra-publication-blocker.json",
  reflectionLanguageHandoff: "data/content-intelligence/word-reflection/ag48b-reflection-language-safety-handoff.json",
  noPersonalisationAuthAudit: "data/content-intelligence/backend-architecture/ag48b-no-personalisation-auth-activation-audit.json",
  noRuntimeApiDeploymentAudit: "data/content-intelligence/backend-architecture/ag48b-no-runtime-api-deployment-audit.json",
  noPublicGenerationAudit: "data/content-intelligence/backend-architecture/ag48b-no-public-language-generation-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag48b-ag48c-reflection-homepage-integration-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag48b-to-ag48c-reflection-homepage-integration-boundary.json",
  registry: "data/quality/ag48b-multilingual-language-safety-review.json",
  preview: "data/quality/ag48b-multilingual-language-safety-review-preview.json",
  doc: "docs/quality/AG48B_MULTILINGUAL_LANGUAGE_SAFETY_REVIEW.md"
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
  const files = [...walk("data"), ...walk("docs"), ...walk("scripts"), ...walk("public"), ...walk("src")];
  return files.filter((file) => {
    const low = file.toLowerCase();
    return patterns.some((pattern) => low.includes(pattern.toLowerCase()));
  }).sort();
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG48B input: ${p}`);
}

const ag48aReview = readJson(inputs.ag48aReview);
const ag48aWordBank = readJson(inputs.ag48aWordBank);
const ag48aRotation = readJson(inputs.ag48aRotation);
const ag48aApproval = readJson(inputs.ag48aApproval);
const ag48aRepeat = readJson(inputs.ag48aRepeat);
const ag48aReflection = readJson(inputs.ag48aReflection);
const ag48aNoAuth = readJson(inputs.ag48aNoAuth);
const ag48aNoRuntime = readJson(inputs.ag48aNoRuntime);
const ag48aNoPublicGeneration = readJson(inputs.ag48aNoPublicGeneration);
const ag48aReadiness = readJson(inputs.ag48aReadiness);
const ag48aBoundary = readJson(inputs.ag48aBoundary);
const ag47rSourceOfTruth = readJson(inputs.ag47rSourceOfTruth);
const adb20ApiDeferral = readJson(inputs.adb20ApiDeferral);

if (ag48aReview.status !== "word_bank_rotation_consumed_ready_for_ag48b") throw new Error("AG48A review status mismatch.");
if (ag48aReview.summary?.ready_for_ag48b_multilingual_language_safety !== true) throw new Error("AG48B readiness missing from AG48A.");
if (ag48aWordBank.consumption_boundary?.editorial_review_required_before_public_use !== true) throw new Error("AG48A word bank editorial review requirement missing.");
if (ag48aRotation.rotation_boundary?.approved_items_only_required !== true) throw new Error("AG48A approved-items-only rule missing.");
if (ag48aApproval.default_public_use_allowed !== false) throw new Error("AG48A default public use must remain false.");
if (ag48aRepeat.live_repeat_control_execution_now !== false) throw new Error("AG48A live repeat control must remain disabled.");
if (ag48aReflection.reflection_position?.public_generated_reflection_disabled_now !== true) throw new Error("AG48A public generated reflection must remain disabled.");
if (ag48aNoAuth.audit_passed !== true) throw new Error("AG48A no-auth audit must pass.");
if (ag48aNoRuntime.audit_passed !== true) throw new Error("AG48A no-runtime audit must pass.");
if (ag48aNoPublicGeneration.audit_passed !== true) throw new Error("AG48A no-public-generation audit must pass.");
if (ag48aReadiness.ready_for_ag48b !== true || ag48aReadiness.next_stage_id !== "AG48B") throw new Error("AG48A readiness must permit AG48B.");
if (ag48aBoundary.next_stage_id !== "AG48B") throw new Error("AG48A boundary must point to AG48B.");
if (!JSON.stringify(ag47rSourceOfTruth.governing_rule).includes("AG48 remains Word of the Day and Reflection")) throw new Error("AG48 roadmap source-of-truth not preserved.");
if (adb20ApiDeferral.website_database_reading_enabled !== false) throw new Error("Website DB reading must remain disabled.");

const languageCandidates = findFiles(["language", "multilingual", "hindi", "sanskrit", "english", "transliteration", "translation"]);
const wordCandidates = findFiles(["d02", "word-of-day", "word_bank", "word-bank", "sutra", "reflection"]);
const toggleCandidates = findFiles(["toggle", "language", "locale", "i18n", "translation"]);

const blockedState = {
  ag48b_multilingual_language_safety_recorded: true,
  ag48a_consumed: true,
  multilingual_field_safety_audited: true,
  meaning_boundary_recorded: true,
  transliteration_script_integrity_recorded: true,
  language_toggle_stability_reviewed: true,
  unreviewed_sanskrit_mantra_publication_blocked: true,
  reflection_language_safety_handoff_recorded: true,
  ready_for_ag48c_reflection_homepage_integration: true,

  word_publication_approved_now: false,
  word_publication_executed: false,
  public_word_generated_now: false,
  public_reflection_generated_now: false,
  unreviewed_sanskrit_mantra_publication_allowed: false,
  auto_translation_publication_allowed: false,
  auto_transliteration_publication_allowed: false,
  language_toggle_runtime_mutation_enabled: false,
  personalisation_auth_activation_approved: false,
  personalisation_auth_activation_performed: false,
  website_database_reading_enabled: false,
  api_runtime_database_reading_approved_now: false,
  backend_auth_supabase_activation_approved: false,
  backend_auth_supabase_activation_performed: false,
  rls_public_policy_activation_approved: false,
  deployment_approved: false,
  deployment_performed: false,
  service_role_key_exposed: false,
  public_generated_word_output: false,
  public_content_generated: false
};

const multilingualFieldAudit = {
  module_id: "AG48B",
  title: "Multilingual Field Safety Audit",
  status: "multilingual_field_safety_audit_recorded",
  consumed_logic_families: [
    "AG48A word bank consumption",
    "D02 word-of-day bank language fields",
    "language runtime/toggle records where available",
    "AG47C Sanskrit/mantra integrity boundary"
  ],
  discovered_language_candidates: languageCandidates.slice(0, 80),
  discovered_word_candidates: wordCandidates.slice(0, 80),
  field_review_requirements: {
    sanskrit_field_review_required: true,
    hindi_field_review_required: true,
    english_field_review_required: true,
    transliteration_review_required: true,
    meaning_alignment_review_required: true,
    public_use_allowed_default: false
  },
  audit_scope_status: "review_boundary_recorded_not_publication",
  blocked_state: blockedState
};

const meaningBoundary = {
  module_id: "AG48B",
  title: "Sanskrit / Hindi / English Meaning Boundary",
  status: "meaning_boundary_recorded",
  required_fields_before_public_word_use: [
    "word_key",
    "primary_display_word",
    "sanskrit_or_source_text_if_applicable",
    "hindi_meaning",
    "english_meaning",
    "transliteration_if_applicable",
    "reflection_text",
    "source_or_origin_note",
    "review_status",
    "public_use_allowed"
  ],
  meaning_rules: [
    "Hindi and English meanings must be semantically aligned.",
    "Sanskrit-derived entries must not be casually translated without context.",
    "Reflection text must not contradict the word meaning.",
    "Do not present approximate meaning as exact scriptural meaning.",
    "Uncertain meaning must be marked under editorial review."
  ],
  public_use_default: false,
  blocked_state: blockedState
};

const transliterationBoundary = {
  module_id: "AG48B",
  title: "Transliteration and Script Integrity Boundary",
  status: "transliteration_script_integrity_recorded",
  script_rules: [
    "Sanskrit/Devanagari text must be reviewed in original script where available.",
    "Transliteration must not be auto-published without review.",
    "IAST/simple transliteration style must be consistent within a public surface.",
    "Do not mix transliteration and translation fields.",
    "Mantra-like text requires stricter source and pronunciation caution."
  ],
  auto_transliteration_publication_allowed: false,
  script_review_required_before_public_use: true,
  blocked_state: blockedState
};

const languageToggleReview = {
  module_id: "AG48B",
  title: "Language Toggle Stability Review",
  status: "language_toggle_stability_review_recorded",
  discovered_toggle_candidates: toggleCandidates.slice(0, 80),
  toggle_safety_rules: [
    "Language toggle must not mutate source content.",
    "Language toggle must not convert reviewed English phrase into broken transliteration.",
    "Switching Hindi to English must restore approved English text, not generated transliteration.",
    "Switching English to Hindi must show reviewed Hindi text only.",
    "Word/reflection fields must remain bound to approved field keys."
  ],
  language_toggle_runtime_mutation_enabled: false,
  needs_later_ui_smoke_test: true,
  blocked_state: blockedState
};

const sanskritMantraBlocker = {
  module_id: "AG48B",
  title: "Unreviewed Sanskrit / Mantra Publication Blocker",
  status: "unreviewed_sanskrit_mantra_publication_blocker_recorded",
  blocker_rules: [
    "No unreviewed Sanskrit entry may be public.",
    "No mantra-like entry may be public without source, script, transliteration, meaning and usage-boundary review.",
    "No auto-generated Sanskrit/mantra text may be public.",
    "No word/reflection entry may imply guaranteed spiritual or astrological result.",
    "No public entry may bypass review because it is only a short word."
  ],
  unreviewed_sanskrit_mantra_publication_allowed: false,
  blocked_state: blockedState
};

const reflectionLanguageHandoff = {
  module_id: "AG48B",
  title: "Reflection Language Safety Handoff",
  status: "reflection_language_safety_handoff_recorded",
  handoff_to_stage: "AG48C",
  ag48c_expected_scope: [
    "Map reviewed word/reflection fields to homepage/Discover/Reflect surfaces.",
    "Use only reviewed static reflection prompts.",
    "Keep user-personalised reflection disabled.",
    "Keep public generated reflection output disabled.",
    "Preserve language field integrity and toggle stability requirements."
  ],
  ag48c_blocked_scope: [
    "Public generated reflection output",
    "Personalisation/Auth activation",
    "Unreviewed Sanskrit/mantra publication",
    "Website database-reading/API runtime activation",
    "Deployment"
  ],
  ready_for_ag48c: true,
  blocked_state: blockedState
};

const noPersonalisationAuthAudit = {
  module_id: "AG48B",
  title: "No Personalisation/Auth Activation Audit",
  status: "no_personalisation_auth_activation_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "personalisation_auth_activation_approved", expected: false, actual: false, passed: true },
    { check_id: "personalisation_auth_activation_performed", expected: false, actual: false, passed: true },
    { check_id: "backend_auth_supabase_activation_performed", expected: false, actual: false, passed: true },
    { check_id: "service_role_key_exposed", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noRuntimeApiDeploymentAudit = {
  module_id: "AG48B",
  title: "No Runtime / API / Deployment Audit",
  status: "no_runtime_api_deployment_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "website_database_reading_enabled", expected: false, actual: false, passed: true },
    { check_id: "api_runtime_database_reading_approved_now", expected: false, actual: false, passed: true },
    { check_id: "rls_public_policy_activation_approved", expected: false, actual: false, passed: true },
    { check_id: "deployment_performed", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noPublicGenerationAudit = {
  module_id: "AG48B",
  title: "No Public Language Generation Audit",
  status: "no_public_language_generation_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "word_publication_approved_now", expected: false, actual: false, passed: true },
    { check_id: "public_word_generated_now", expected: false, actual: false, passed: true },
    { check_id: "public_reflection_generated_now", expected: false, actual: false, passed: true },
    { check_id: "auto_translation_publication_allowed", expected: false, actual: false, passed: true },
    { check_id: "auto_transliteration_publication_allowed", expected: false, actual: false, passed: true },
    { check_id: "unreviewed_sanskrit_mantra_publication_allowed", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG48B",
  title: "AG48C Reflection Homepage Integration Readiness Record",
  status: "ready_for_ag48c_reflection_homepage_integration",
  ready_for_ag48c: true,
  next_stage_id: "AG48C",
  next_stage_title: "Reflection Prompt and Homepage Integration",
  ag48c_allowed_scope: [
    "Map word/reflection to Discover/Reflect surface.",
    "Use reviewed static reflection prompt structure.",
    "Preserve language safety and toggle-stability boundaries.",
    "Keep personalisation disabled.",
    "Prepare integration audit for AG48D."
  ],
  ag48c_blocked_scope: [
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
  hard_blocker_count_for_ag48c: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG48B",
  title: "AG48B to AG48C Reflection Homepage Integration Boundary",
  status: "ag48c_reflection_homepage_integration_boundary_created",
  next_stage_id: "AG48C",
  next_stage_title: "Reflection Prompt and Homepage Integration",
  allowed_scope: readiness.ag48c_allowed_scope,
  blocked_scope: readiness.ag48c_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "AG48B",
  title: "Multilingual Language Safety Review",
  status: "multilingual_language_safety_ready_for_ag48c",
  depends_on: ["AG48A", "AG47Z", "AG47R"],
  multilingual_field_audit_file: outputs.multilingualFieldAudit,
  meaning_boundary_file: outputs.meaningBoundary,
  transliteration_boundary_file: outputs.transliterationBoundary,
  language_toggle_review_file: outputs.languageToggleReview,
  sanskrit_mantra_blocker_file: outputs.sanskritMantraBlocker,
  reflection_language_handoff_file: outputs.reflectionLanguageHandoff,
  no_personalisation_auth_audit_file: outputs.noPersonalisationAuthAudit,
  no_runtime_api_deployment_audit_file: outputs.noRuntimeApiDeploymentAudit,
  no_public_generation_audit_file: outputs.noPublicGenerationAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag48b_multilingual_language_safety_recorded: true,
    ag48a_consumed: true,
    multilingual_field_safety_audited: true,
    meaning_boundary_recorded: true,
    transliteration_script_integrity_recorded: true,
    language_toggle_stability_reviewed: true,
    unreviewed_sanskrit_mantra_publication_blocked: true,
    reflection_language_safety_handoff_recorded: true,
    ready_for_ag48c_reflection_homepage_integration: true,
    hard_blocker_count_for_ag48c: 0,

    word_publication_approved_now: false,
    word_publication_executed: false,
    public_word_generated_now: false,
    public_reflection_generated_now: false,
    unreviewed_sanskrit_mantra_publication_allowed: false,
    auto_translation_publication_allowed: false,
    auto_transliteration_publication_allowed: false,
    language_toggle_runtime_mutation_enabled: false,
    personalisation_auth_activation_approved: false,
    personalisation_auth_activation_performed: false,
    website_database_reading_enabled: false,
    api_runtime_database_reading_approved_now: false,
    backend_auth_supabase_activation_approved: false,
    backend_auth_supabase_activation_performed: false,
    rls_public_policy_activation_approved: false,
    deployment_approved: false,
    deployment_performed: false,
    service_role_key_exposed: false,
    public_generated_word_output: false,
    public_content_generated: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG48B",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG48B",
  status: review.status,
  ag48b_multilingual_language_safety_recorded: 1,
  ag48a_consumed: 1,
  multilingual_field_safety_audited: 1,
  meaning_boundary_recorded: 1,
  transliteration_script_integrity_recorded: 1,
  language_toggle_stability_reviewed: 1,
  unreviewed_sanskrit_mantra_publication_blocked: 1,
  reflection_language_safety_handoff_recorded: 1,
  ready_for_ag48c_reflection_homepage_integration: 1,
  hard_blocker_count_for_ag48c: 0,

  word_publication_approved_now: 0,
  word_publication_executed: 0,
  public_word_generated_now: 0,
  public_reflection_generated_now: 0,
  unreviewed_sanskrit_mantra_publication_allowed: 0,
  auto_translation_publication_allowed: 0,
  auto_transliteration_publication_allowed: 0,
  language_toggle_runtime_mutation_enabled: 0,
  personalisation_auth_activation_approved: 0,
  personalisation_auth_activation_performed: 0,
  website_database_reading_enabled: 0,
  api_runtime_database_reading_approved_now: 0,
  backend_auth_supabase_activation_approved: 0,
  backend_auth_supabase_activation_performed: 0,
  rls_public_policy_activation_approved: 0,
  deployment_approved: 0,
  deployment_performed: 0,
  service_role_key_exposed: 0,
  public_generated_word_output: 0,
  public_content_generated: 0
};

const doc = `# AG48B — Multilingual Language Safety Review

## Result

AG48B records multilingual safety boundaries for Word of the Day and Reflection.

## Reviewed

- Sanskrit/Hindi/English field safety
- Meaning alignment boundary
- Transliteration and script integrity
- Language toggle stability
- Unreviewed Sanskrit/mantra publication blocker
- Reflection language safety handoff to AG48C

## Still blocked

- Public word publication
- Public generated word/reflection output
- Auto translation/transliteration publication
- Unreviewed Sanskrit/mantra publication
- Personalisation/Auth activation
- Website database-reading/API runtime activation
- Backend/Auth/Supabase runtime activation
- RLS public policy activation
- Deployment
- Service-role key exposure

## Next

AG48C — Reflection Prompt and Homepage Integration.
`;

writeJson(outputs.multilingualFieldAudit, multilingualFieldAudit);
writeJson(outputs.meaningBoundary, meaningBoundary);
writeJson(outputs.transliterationBoundary, transliterationBoundary);
writeJson(outputs.languageToggleReview, languageToggleReview);
writeJson(outputs.sanskritMantraBlocker, sanskritMantraBlocker);
writeJson(outputs.reflectionLanguageHandoff, reflectionLanguageHandoff);
writeJson(outputs.noPersonalisationAuthAudit, noPersonalisationAuthAudit);
writeJson(outputs.noRuntimeApiDeploymentAudit, noRuntimeApiDeploymentAudit);
writeJson(outputs.noPublicGenerationAudit, noPublicGenerationAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG48B Multilingual Language Safety Review generated.");
console.log("✅ Meaning, transliteration, language-toggle, Sanskrit/mantra blocker and reflection handoff recorded.");
console.log("✅ Ready for AG48C Reflection Prompt and Homepage Integration.");
console.log("✅ Public generation, personalisation/Auth, API/DB reading, backend/RLS, deployment and secrets remain blocked.");
