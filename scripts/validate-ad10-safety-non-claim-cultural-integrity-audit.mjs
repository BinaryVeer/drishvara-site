import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) {
  return path.join(root, p);
}

function exists(p) {
  return fs.existsSync(full(p));
}

function read(p) {
  return fs.readFileSync(full(p), "utf8");
}

function readJson(p) {
  return JSON.parse(read(p));
}

function fail(message) {
  console.error(`❌ AD10 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ad09-kala-drishti-methodology-statement.json",
  "data/content-intelligence/backend-architecture/ad09-no-generation-no-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ad09-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ad09-ad10-safety-cultural-integrity-readiness-record.json",
  "data/content-intelligence/mutation-plans/ad09-to-ad10-safety-cultural-integrity-boundary.json",

  "data/content-intelligence/quality-reviews/ad10-safety-non-claim-cultural-integrity-audit.json",
  "data/content-intelligence/ad-foundation/ad10-non-prediction-language-audit.json",
  "data/content-intelligence/ad-foundation/ad10-cultural-integrity-audit.json",
  "data/content-intelligence/ad-foundation/ad10-source-discipline-audit.json",
  "data/content-intelligence/ad-foundation/ad10-regional-difference-handling-audit.json",
  "data/content-intelligence/ad-foundation/ad10-copyright-attribution-safety-audit.json",
  "data/content-intelligence/ad-foundation/ad10-claim-risk-public-safety-audit.json",
  "data/content-intelligence/backend-architecture/ad10-no-runtime-no-public-activation-audit.json",
  "data/content-intelligence/backend-architecture/ad10-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ad10-adz-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ad10-to-adz-astro-drishvara-foundation-closure-boundary.json",
  "data/quality/ad10-safety-non-claim-cultural-integrity-audit.json",
  "data/quality/ad10-safety-non-claim-cultural-integrity-audit-preview.json",
  "docs/quality/AD10_SAFETY_NON_CLAIM_CULTURAL_INTEGRITY_AUDIT.md",
  "scripts/generate-ad10-safety-non-claim-cultural-integrity-audit.mjs",
  "scripts/validate-ad10-safety-non-claim-cultural-integrity-audit.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ad09Review = readJson("data/content-intelligence/quality-reviews/ad09-kala-drishti-methodology-statement.json");
const ad09NoGenerationAudit = readJson("data/content-intelligence/backend-architecture/ad09-no-generation-no-runtime-audit.json");
const ad09NoMutationAudit = readJson("data/content-intelligence/backend-architecture/ad09-no-mutation-audit-register.json");
const ad09Readiness = readJson("data/content-intelligence/quality-registry/ad09-ad10-safety-cultural-integrity-readiness-record.json");
const ad09Boundary = readJson("data/content-intelligence/mutation-plans/ad09-to-ad10-safety-cultural-integrity-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ad10-safety-non-claim-cultural-integrity-audit.json");
const nonPredictionLanguageAudit = readJson("data/content-intelligence/ad-foundation/ad10-non-prediction-language-audit.json");
const culturalIntegrityAudit = readJson("data/content-intelligence/ad-foundation/ad10-cultural-integrity-audit.json");
const sourceDisciplineAudit = readJson("data/content-intelligence/ad-foundation/ad10-source-discipline-audit.json");
const regionalDifferenceAudit = readJson("data/content-intelligence/ad-foundation/ad10-regional-difference-handling-audit.json");
const copyrightAttributionAudit = readJson("data/content-intelligence/ad-foundation/ad10-copyright-attribution-safety-audit.json");
const claimRiskPublicSafetyAudit = readJson("data/content-intelligence/ad-foundation/ad10-claim-risk-public-safety-audit.json");
const noRuntimeNoPublicActivationAudit = readJson("data/content-intelligence/backend-architecture/ad10-no-runtime-no-public-activation-audit.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/ad10-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ad10-adz-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ad10-to-adz-astro-drishvara-foundation-closure-boundary.json");
const preview = readJson("data/quality/ad10-safety-non-claim-cultural-integrity-audit-preview.json");
const pkg = readJson("package.json");

if (ad09Review.status !== "kala_drishti_methodology_statement_ready_for_ad10") fail("AD09 review status mismatch.");
if (ad09Review.summary.ready_for_ad10 !== true) fail("AD09 readiness summary missing.");
if (ad09NoGenerationAudit.audit_passed !== true) fail("AD09 no generation/no runtime audit must pass.");
if (ad09NoMutationAudit.audit_passed !== true) fail("AD09 no-mutation audit must pass.");
if (ad09Readiness.ready_for_ad10 !== true) fail("AD09 readiness must permit AD10.");
if (ad09Boundary.next_stage_id !== "AD10") fail("AD09 boundary must point to AD10.");

if (review.status !== "safety_non_claim_cultural_integrity_audit_ready_for_adz") fail("AD10 review status mismatch.");
for (const key of [
  "ad10_safety_non_claim_cultural_integrity_audit_recorded",
  "ad00_to_ad09_consumed",
  "non_prediction_language_audit_recorded",
  "cultural_integrity_audit_recorded",
  "source_discipline_audit_recorded",
  "regional_difference_handling_audit_recorded",
  "copyright_attribution_safety_audit_recorded",
  "claim_risk_public_safety_audit_recorded",
  "no_runtime_no_public_activation_audit_recorded",
  "ready_for_adz"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}
if (review.summary.hard_blocker_count_for_adz !== 0) fail("ADZ blocker count must be zero.");
for (const key of ["ag47_resume_allowed", "homepage_mutated", "public_content_generated", "methodology_published_publicly", "guidance_generated", "star_reflection_generated", "word_of_day_generated", "panchang_prediction_generated", "deterministic_prediction_generated", "panchang_calculation_executed", "seed_data_inserted", "sql_file_created", "sql_executed", "database_write_performed", "supabase_table_created", "supabase_schema_modified", "backend_auth_supabase_activation_performed", "deployment_performed", "service_role_key_exposed"]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (nonPredictionLanguageAudit.status !== "non_prediction_language_audit_passed") fail("Non-prediction audit status mismatch.");
if (nonPredictionLanguageAudit.hard_blockers_found !== 0) fail("Non-prediction hard blockers must be zero.");
for (const cls of ["guaranteed_result", "fatalistic_destiny_claim", "medical_legal_financial_directive", "live_panchang_claim_without_engine"]) {
  if (!nonPredictionLanguageAudit.prohibited_language_classes.includes(cls)) fail(`Prohibited language class missing: ${cls}`);
}

if (culturalIntegrityAudit.status !== "cultural_integrity_audit_passed") fail("Cultural integrity audit status mismatch.");
if (!JSON.stringify(culturalIntegrityAudit.audit_points).includes("Nityanand Mishra ji")) fail("Nityanand cultural integrity point missing.");
if (!JSON.stringify(culturalIntegrityAudit.audit_points).includes("Regional Panchang practices")) fail("Regional Panchang cultural integrity point missing.");
if (culturalIntegrityAudit.hard_blockers_found !== 0) fail("Cultural integrity hard blockers must be zero.");

if (sourceDisciplineAudit.status !== "source_discipline_audit_passed") fail("Source discipline audit status mismatch.");
for (const field of ["source_id", "source_title", "source_locator", "supported_claim", "source_confidence_band", "verification_status", "editorial_review_status", "public_use_allowed"]) {
  if (!sourceDisciplineAudit.required_future_metadata.includes(field)) fail(`Source discipline field missing: ${field}`);
}
if (sourceDisciplineAudit.hard_blockers_found !== 0) fail("Source discipline hard blockers must be zero.");

if (regionalDifferenceAudit.status !== "regional_difference_handling_audit_passed") fail("Regional difference audit status mismatch.");
for (const phrase of ["North India", "Bihar/Mithila/East India", "South Indian Panchangam", "No festival date was finalised"]) {
  if (!JSON.stringify(regionalDifferenceAudit.audit_points).includes(phrase)) fail(`Regional difference phrase missing: ${phrase}`);
}
if (regionalDifferenceAudit.hard_blockers_found !== 0) fail("Regional difference hard blockers must be zero.");

if (copyrightAttributionAudit.status !== "copyright_attribution_safety_audit_passed") fail("Copyright attribution audit status mismatch.");
for (const phrase of ["long copyrighted passages", "source locator", "AD10 does not reproduce"]) {
  if (!JSON.stringify(copyrightAttributionAudit.audit_points).includes(phrase)) fail(`Copyright/attribution phrase missing: ${phrase}`);
}
if (copyrightAttributionAudit.hard_blockers_found !== 0) fail("Copyright hard blockers must be zero.");

if (claimRiskPublicSafetyAudit.status !== "claim_risk_public_safety_audit_passed") fail("Claim-risk audit status mismatch.");
for (const cls of ["medical_legal_financial_safety_advice", "fear_based_language", "fatalistic_claim", "guaranteed_outcome", "deterministic_prediction", "unsupported_personal_profile"]) {
  if (!claimRiskPublicSafetyAudit.claim_risk_blocked_classes.includes(cls)) fail(`Claim-risk blocked class missing: ${cls}`);
}
if (claimRiskPublicSafetyAudit.hard_blockers_found !== 0) fail("Claim-risk hard blockers must be zero.");

if (noRuntimeNoPublicActivationAudit.status !== "no_runtime_no_public_activation_audit_passed_for_ad10") fail("No runtime/no public activation audit status mismatch.");
if (noRuntimeNoPublicActivationAudit.audit_passed !== true) fail("No runtime audit must pass.");
if (noRuntimeNoPublicActivationAudit.failed_checks.length !== 0) fail("No runtime audit failed checks must be zero.");
for (const check of noRuntimeNoPublicActivationAudit.checks) {
  if (check.passed !== true) fail(`No runtime check failed: ${check.check_id}`);
}

if (noMutationAudit.status !== "no_mutation_audit_passed_for_ad10") fail("No-mutation audit status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");
for (const check of noMutationAudit.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (readiness.status !== "ready_for_adz_astro_drishvara_data_foundation_closure") fail("Readiness status mismatch.");
if (readiness.ready_for_adz !== true) fail("Readiness must permit ADZ.");
if (readiness.next_stage_id !== "ADZ") fail("Readiness next stage must be ADZ.");
if (readiness.hard_blocker_count_for_adz !== 0) fail("ADZ hard blockers must be zero.");
for (const key of ["safety_audit_passed", "non_claim_audit_passed", "cultural_integrity_audit_passed", "source_discipline_audit_passed", "regional_difference_audit_passed", "copyright_attribution_audit_passed", "runtime_activation_audit_passed"]) {
  if (readiness[key] !== true) fail(`${key} must be true.`);
}
if (readiness.sql_creation_allowed_next !== false) fail("SQL creation must remain blocked.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain blocked.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "ADZ") fail("Boundary must point to ADZ.");
if (!JSON.stringify(boundary.allowed_scope).includes("Close AD00 through AD10")) fail("ADZ closure scope missing.");
if (!JSON.stringify(boundary.allowed_scope).includes("ADB01 database build approval checkpoint")) fail("ADB01 checkpoint boundary missing.");
if (!boundary.blocked_scope.includes("SQL execution")) fail("SQL execution blocked scope missing.");
if (!boundary.blocked_scope.includes("service-role key exposure")) fail("Service-role exposure blocked scope missing.");

for (const key of [
  "ad10_safety_non_claim_cultural_integrity_audit_recorded",
  "ad00_to_ad09_consumed",
  "non_prediction_language_audit_recorded",
  "cultural_integrity_audit_recorded",
  "source_discipline_audit_recorded",
  "regional_difference_handling_audit_recorded",
  "copyright_attribution_safety_audit_recorded",
  "claim_risk_public_safety_audit_recorded",
  "no_runtime_no_public_activation_audit_recorded",
  "ready_for_adz"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}
if (preview.hard_blocker_count_for_adz !== 0) fail("Preview blocker count must be zero.");
for (const key of ["ag47_resume_allowed", "homepage_mutated", "public_content_generated", "methodology_published_publicly", "guidance_generated", "star_reflection_generated", "word_of_day_generated", "panchang_prediction_generated", "deterministic_prediction_generated", "panchang_calculation_executed", "seed_data_inserted", "sql_file_created", "sql_executed", "database_write_performed", "supabase_table_created", "supabase_schema_modified", "backend_auth_supabase_activation_performed", "deployment_performed", "service_role_key_exposed"]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ad10"]) fail("Missing package script: generate:ad10");
if (!pkg.scripts?.["validate:ad10"]) fail("Missing package script: validate:ad10");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ad10")) fail("validate:project must include validate:ad10.");

pass("AD10 Safety, Non-claim and Cultural Integrity Audit is present.");
pass("AD00 through AD09 are consumed.");
pass("Non-prediction language audit passed.");
pass("Cultural integrity audit passed.");
pass("Source discipline audit passed.");
pass("Regional difference handling audit passed.");
pass("Copyright and attribution safety audit passed.");
pass("Claim-risk and public safety audit passed.");
pass("No runtime / no public activation audit passed.");
pass("No-mutation audit is valid.");
pass("ADZ Astro-Drishvara Data Foundation Closure readiness is valid.");
pass("No publication, public content generation, Panchang calculation, SQL, DB write, backend activation, deployment or service-role exposure is recorded.");
