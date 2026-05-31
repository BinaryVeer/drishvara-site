import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG48B validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag48a-word-bank-rotation-consumption.json",
  "data/content-intelligence/word-reflection/ag48a-word-bank-consumption-record.json",
  "data/content-intelligence/word-reflection/ag48a-rotation-policy-consumption-record.json",
  "data/content-intelligence/word-reflection/ag48a-word-approval-status-boundary.json",
  "data/content-intelligence/word-reflection/ag48a-repeat-control-boundary.json",
  "data/content-intelligence/word-reflection/ag48a-reflection-readiness-seed-record.json",
  "data/content-intelligence/backend-architecture/ag48a-no-personalisation-auth-activation-audit.json",
  "data/content-intelligence/backend-architecture/ag48a-no-runtime-api-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag48a-no-public-word-generation-audit.json",
  "data/content-intelligence/quality-registry/ag48a-ag48b-multilingual-language-safety-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag48a-to-ag48b-multilingual-language-safety-boundary.json",
  "data/content-intelligence/ag-roadmap/ag47r-v01-implementation-roadmap-source-of-truth.json",
  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

  "data/content-intelligence/quality-reviews/ag48b-multilingual-language-safety-review.json",
  "data/content-intelligence/word-reflection/ag48b-multilingual-field-safety-audit.json",
  "data/content-intelligence/word-reflection/ag48b-sanskrit-hindi-english-meaning-boundary.json",
  "data/content-intelligence/word-reflection/ag48b-transliteration-script-integrity-boundary.json",
  "data/content-intelligence/word-reflection/ag48b-language-toggle-stability-review.json",
  "data/content-intelligence/word-reflection/ag48b-unreviewed-sanskrit-mantra-publication-blocker.json",
  "data/content-intelligence/word-reflection/ag48b-reflection-language-safety-handoff.json",
  "data/content-intelligence/backend-architecture/ag48b-no-personalisation-auth-activation-audit.json",
  "data/content-intelligence/backend-architecture/ag48b-no-runtime-api-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag48b-no-public-language-generation-audit.json",
  "data/content-intelligence/quality-registry/ag48b-ag48c-reflection-homepage-integration-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag48b-to-ag48c-reflection-homepage-integration-boundary.json",
  "data/quality/ag48b-multilingual-language-safety-review.json",
  "data/quality/ag48b-multilingual-language-safety-review-preview.json",
  "docs/quality/AG48B_MULTILINGUAL_LANGUAGE_SAFETY_REVIEW.md",
  "scripts/generate-ag48b-multilingual-language-safety-review.mjs",
  "scripts/validate-ag48b-multilingual-language-safety-review.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag48aReview = readJson("data/content-intelligence/quality-reviews/ag48a-word-bank-rotation-consumption.json");
const ag48aWordBank = readJson("data/content-intelligence/word-reflection/ag48a-word-bank-consumption-record.json");
const ag48aApproval = readJson("data/content-intelligence/word-reflection/ag48a-word-approval-status-boundary.json");
const ag48aReflection = readJson("data/content-intelligence/word-reflection/ag48a-reflection-readiness-seed-record.json");
const ag48aNoAuth = readJson("data/content-intelligence/backend-architecture/ag48a-no-personalisation-auth-activation-audit.json");
const ag48aNoRuntime = readJson("data/content-intelligence/backend-architecture/ag48a-no-runtime-api-deployment-audit.json");
const ag48aNoPublicGeneration = readJson("data/content-intelligence/backend-architecture/ag48a-no-public-word-generation-audit.json");
const ag48aReadiness = readJson("data/content-intelligence/quality-registry/ag48a-ag48b-multilingual-language-safety-readiness-record.json");
const ag48aBoundary = readJson("data/content-intelligence/mutation-plans/ag48a-to-ag48b-multilingual-language-safety-boundary.json");
const ag47rSourceOfTruth = readJson("data/content-intelligence/ag-roadmap/ag47r-v01-implementation-roadmap-source-of-truth.json");
const adb20Api = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");

if (ag48aReview.status !== "word_bank_rotation_consumed_ready_for_ag48b") fail("AG48A review status mismatch.");
if (ag48aWordBank.consumption_boundary.editorial_review_required_before_public_use !== true) fail("AG48A editorial review requirement missing.");
if (ag48aApproval.default_public_use_allowed !== false) fail("AG48A public-use default must be false.");
if (ag48aReflection.reflection_position.public_generated_reflection_disabled_now !== true) fail("AG48A generated reflection must be disabled.");
if (ag48aNoAuth.audit_passed !== true) fail("AG48A no-auth audit must pass.");
if (ag48aNoRuntime.audit_passed !== true) fail("AG48A no-runtime audit must pass.");
if (ag48aNoPublicGeneration.audit_passed !== true) fail("AG48A no-public-generation audit must pass.");
if (ag48aReadiness.ready_for_ag48b !== true) fail("AG48A readiness must permit AG48B.");
if (ag48aBoundary.next_stage_id !== "AG48B") fail("AG48A boundary must point to AG48B.");
if (!JSON.stringify(ag47rSourceOfTruth.governing_rule).includes("AG48 remains Word of the Day and Reflection")) fail("AG48 roadmap source-of-truth missing.");
if (adb20Api.website_database_reading_enabled !== false) fail("Website DB reading must remain disabled.");

const review = readJson("data/content-intelligence/quality-reviews/ag48b-multilingual-language-safety-review.json");
const multilingualFieldAudit = readJson("data/content-intelligence/word-reflection/ag48b-multilingual-field-safety-audit.json");
const meaningBoundary = readJson("data/content-intelligence/word-reflection/ag48b-sanskrit-hindi-english-meaning-boundary.json");
const transliterationBoundary = readJson("data/content-intelligence/word-reflection/ag48b-transliteration-script-integrity-boundary.json");
const languageToggleReview = readJson("data/content-intelligence/word-reflection/ag48b-language-toggle-stability-review.json");
const sanskritMantraBlocker = readJson("data/content-intelligence/word-reflection/ag48b-unreviewed-sanskrit-mantra-publication-blocker.json");
const reflectionLanguageHandoff = readJson("data/content-intelligence/word-reflection/ag48b-reflection-language-safety-handoff.json");
const noPersonalisationAuthAudit = readJson("data/content-intelligence/backend-architecture/ag48b-no-personalisation-auth-activation-audit.json");
const noRuntimeApiDeploymentAudit = readJson("data/content-intelligence/backend-architecture/ag48b-no-runtime-api-deployment-audit.json");
const noPublicGenerationAudit = readJson("data/content-intelligence/backend-architecture/ag48b-no-public-language-generation-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag48b-ag48c-reflection-homepage-integration-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag48b-to-ag48c-reflection-homepage-integration-boundary.json");
const preview = readJson("data/quality/ag48b-multilingual-language-safety-review-preview.json");
const pkg = readJson("package.json");

if (review.status !== "multilingual_language_safety_ready_for_ag48c") fail("AG48B review status mismatch.");

for (const key of [
  "ag48b_multilingual_language_safety_recorded",
  "ag48a_consumed",
  "multilingual_field_safety_audited",
  "meaning_boundary_recorded",
  "transliteration_script_integrity_recorded",
  "language_toggle_stability_reviewed",
  "unreviewed_sanskrit_mantra_publication_blocked",
  "reflection_language_safety_handoff_recorded",
  "ready_for_ag48c_reflection_homepage_integration"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}

if (review.summary.hard_blocker_count_for_ag48c !== 0) fail("AG48C blocker count must be zero.");

for (const key of [
  "word_publication_approved_now",
  "word_publication_executed",
  "public_word_generated_now",
  "public_reflection_generated_now",
  "unreviewed_sanskrit_mantra_publication_allowed",
  "auto_translation_publication_allowed",
  "auto_transliteration_publication_allowed",
  "language_toggle_runtime_mutation_enabled",
  "personalisation_auth_activation_approved",
  "personalisation_auth_activation_performed",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "rls_public_policy_activation_approved",
  "deployment_approved",
  "deployment_performed",
  "service_role_key_exposed",
  "public_generated_word_output",
  "public_content_generated"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (multilingualFieldAudit.status !== "multilingual_field_safety_audit_recorded") fail("Multilingual audit status mismatch.");
if (multilingualFieldAudit.field_review_requirements.sanskrit_field_review_required !== true) fail("Sanskrit field review must be required.");
if (multilingualFieldAudit.field_review_requirements.public_use_allowed_default !== false) fail("Public-use default must be false.");

if (meaningBoundary.status !== "meaning_boundary_recorded") fail("Meaning boundary status mismatch.");
for (const field of ["hindi_meaning", "english_meaning", "review_status", "public_use_allowed"]) {
  if (!meaningBoundary.required_fields_before_public_word_use.includes(field)) fail(`Meaning boundary missing field: ${field}`);
}
if (meaningBoundary.public_use_default !== false) fail("Meaning public-use default must be false.");

if (transliterationBoundary.status !== "transliteration_script_integrity_recorded") fail("Transliteration boundary status mismatch.");
if (transliterationBoundary.auto_transliteration_publication_allowed !== false) fail("Auto transliteration publication must be false.");
if (transliterationBoundary.script_review_required_before_public_use !== true) fail("Script review must be required.");

if (languageToggleReview.status !== "language_toggle_stability_review_recorded") fail("Language toggle review status mismatch.");
if (languageToggleReview.language_toggle_runtime_mutation_enabled !== false) fail("Language toggle runtime mutation must be false.");
if (!JSON.stringify(languageToggleReview.toggle_safety_rules).includes("must not mutate source content")) fail("Language mutation safety rule missing.");

if (sanskritMantraBlocker.status !== "unreviewed_sanskrit_mantra_publication_blocker_recorded") fail("Sanskrit/mantra blocker status mismatch.");
if (sanskritMantraBlocker.unreviewed_sanskrit_mantra_publication_allowed !== false) fail("Unreviewed Sanskrit/mantra publication must be false.");

if (reflectionLanguageHandoff.status !== "reflection_language_safety_handoff_recorded") fail("Reflection handoff status mismatch.");
if (reflectionLanguageHandoff.ready_for_ag48c !== true) fail("Reflection handoff must be ready for AG48C.");
if (reflectionLanguageHandoff.handoff_to_stage !== "AG48C") fail("Reflection handoff must point to AG48C.");

if (noPersonalisationAuthAudit.audit_passed !== true) fail("No personalisation/Auth audit must pass.");
if (noPersonalisationAuthAudit.failed_checks.length !== 0) fail("No personalisation/Auth failed checks must be zero.");

if (noRuntimeApiDeploymentAudit.audit_passed !== true) fail("No runtime/API/deployment audit must pass.");
if (noRuntimeApiDeploymentAudit.failed_checks.length !== 0) fail("No runtime/API/deployment failed checks must be zero.");

if (noPublicGenerationAudit.audit_passed !== true) fail("No public language generation audit must pass.");
if (noPublicGenerationAudit.failed_checks.length !== 0) fail("No public generation failed checks must be zero.");

if (readiness.status !== "ready_for_ag48c_reflection_homepage_integration") fail("AG48C readiness status mismatch.");
if (readiness.ready_for_ag48c !== true) fail("AG48C readiness must be true.");
if (readiness.next_stage_id !== "AG48C") fail("Readiness must point to AG48C.");
if (!readiness.ag48c_allowed_scope.includes("Map word/reflection to Discover/Reflect surface.")) fail("AG48C mapping scope missing.");

if (boundary.next_stage_id !== "AG48C") fail("Boundary must point to AG48C.");

for (const key of [
  "ag48b_multilingual_language_safety_recorded",
  "ag48a_consumed",
  "multilingual_field_safety_audited",
  "meaning_boundary_recorded",
  "transliteration_script_integrity_recorded",
  "language_toggle_stability_reviewed",
  "unreviewed_sanskrit_mantra_publication_blocked",
  "reflection_language_safety_handoff_recorded",
  "ready_for_ag48c_reflection_homepage_integration"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}

for (const key of [
  "word_publication_approved_now",
  "word_publication_executed",
  "public_word_generated_now",
  "public_reflection_generated_now",
  "unreviewed_sanskrit_mantra_publication_allowed",
  "auto_translation_publication_allowed",
  "auto_transliteration_publication_allowed",
  "language_toggle_runtime_mutation_enabled",
  "personalisation_auth_activation_approved",
  "personalisation_auth_activation_performed",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "rls_public_policy_activation_approved",
  "deployment_approved",
  "deployment_performed",
  "service_role_key_exposed",
  "public_generated_word_output",
  "public_content_generated"
]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ag48b"]) fail("Missing package script: generate:ag48b");
if (!pkg.scripts?.["validate:ag48b"]) fail("Missing package script: validate:ag48b");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag48b")) fail("validate:project must include validate:ag48b.");

pass("AG48B Multilingual Language Safety Review is present.");
pass("AG48A inputs are consumed.");
pass("Multilingual field safety audit is valid.");
pass("Meaning boundary is valid.");
pass("Transliteration/script integrity boundary is valid.");
pass("Language toggle stability review is valid.");
pass("Unreviewed Sanskrit/mantra publication blocker is valid.");
pass("Reflection language safety handoff is valid.");
pass("No personalisation/Auth activation audit is valid.");
pass("No runtime/API/deployment audit is valid.");
pass("No public language generation audit is valid.");
pass("AG48C Reflection Homepage Integration readiness is valid.");
