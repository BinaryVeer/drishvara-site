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
  console.error(`❌ AD06 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ad05-word-sutra-reflection-corpus-schema.json",
  "data/content-intelligence/ad-foundation/ad05-corpus-doctrine.json",
  "data/content-intelligence/ad-foundation/ad05-word-of-the-day-corpus-schema.json",
  "data/content-intelligence/ad-foundation/ad05-sanskrit-name-term-corpus-schema.json",
  "data/content-intelligence/ad-foundation/ad05-sutra-quote-corpus-schema.json",
  "data/content-intelligence/ad-foundation/ad05-reflection-prompt-corpus-schema.json",
  "data/content-intelligence/ad-foundation/ad05-sanskritic-textual-discipline-model.json",
  "data/content-intelligence/ad-foundation/ad05-corpus-source-attribution-review-map.json",
  "data/content-intelligence/ad-foundation/ad05-corpus-database-planning-map.json",
  "data/content-intelligence/backend-architecture/ad05-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ad05-ad06-vedic-guidance-star-reflection-readiness-record.json",
  "data/content-intelligence/mutation-plans/ad05-to-ad06-vedic-guidance-star-reflection-boundary.json",

  "data/content-intelligence/quality-reviews/ad06-vedic-guidance-star-reflection-rule-model.json",
  "data/content-intelligence/ad-foundation/ad06-vedic-guidance-star-reflection-doctrine.json",
  "data/content-intelligence/ad-foundation/ad06-vedic-guidance-rule-model.json",
  "data/content-intelligence/ad-foundation/ad06-star-reflection-rule-model.json",
  "data/content-intelligence/ad-foundation/ad06-panchanga-context-linkage-model.json",
  "data/content-intelligence/ad-foundation/ad06-corpus-guidance-linkage-map.json",
  "data/content-intelligence/ad-foundation/ad06-claim-risk-tone-safety-model.json",
  "data/content-intelligence/ad-foundation/ad06-guidance-reflection-database-planning-map.json",
  "data/content-intelligence/backend-architecture/ad06-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ad06-ad07-database-schema-planning-readiness-record.json",
  "data/content-intelligence/mutation-plans/ad06-to-ad07-database-schema-planning-boundary.json",
  "data/quality/ad06-vedic-guidance-star-reflection-rule-model.json",
  "data/quality/ad06-vedic-guidance-star-reflection-rule-model-preview.json",
  "docs/quality/AD06_VEDIC_GUIDANCE_STAR_REFLECTION_RULE_MODEL.md",
  "scripts/generate-ad06-vedic-guidance-star-reflection-rule-model.mjs",
  "scripts/validate-ad06-vedic-guidance-star-reflection-rule-model.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ad05Review = readJson("data/content-intelligence/quality-reviews/ad05-word-sutra-reflection-corpus-schema.json");
const ad05NoMutationAudit = readJson("data/content-intelligence/backend-architecture/ad05-no-mutation-audit-register.json");
const ad05Readiness = readJson("data/content-intelligence/quality-registry/ad05-ad06-vedic-guidance-star-reflection-readiness-record.json");
const ad05Boundary = readJson("data/content-intelligence/mutation-plans/ad05-to-ad06-vedic-guidance-star-reflection-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ad06-vedic-guidance-star-reflection-rule-model.json");
const guidanceDoctrine = readJson("data/content-intelligence/ad-foundation/ad06-vedic-guidance-star-reflection-doctrine.json");
const vedicGuidanceRuleModel = readJson("data/content-intelligence/ad-foundation/ad06-vedic-guidance-rule-model.json");
const starReflectionRuleModel = readJson("data/content-intelligence/ad-foundation/ad06-star-reflection-rule-model.json");
const panchangaContextLinkageModel = readJson("data/content-intelligence/ad-foundation/ad06-panchanga-context-linkage-model.json");
const corpusGuidanceLinkageMap = readJson("data/content-intelligence/ad-foundation/ad06-corpus-guidance-linkage-map.json");
const claimRiskToneSafetyModel = readJson("data/content-intelligence/ad-foundation/ad06-claim-risk-tone-safety-model.json");
const databasePlanningMap = readJson("data/content-intelligence/ad-foundation/ad06-guidance-reflection-database-planning-map.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/ad06-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ad06-ad07-database-schema-planning-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ad06-to-ad07-database-schema-planning-boundary.json");
const preview = readJson("data/quality/ad06-vedic-guidance-star-reflection-rule-model-preview.json");
const pkg = readJson("package.json");

if (ad05Review.status !== "word_sutra_reflection_corpus_schema_ready_for_ad06") fail("AD05 review status mismatch.");
if (ad05Review.summary.ready_for_ad06 !== true) fail("AD05 readiness summary missing.");
if (ad05NoMutationAudit.audit_passed !== true) fail("AD05 no-mutation audit must pass.");
if (ad05Readiness.ready_for_ad06 !== true) fail("AD05 readiness must permit AD06.");
if (ad05Boundary.next_stage_id !== "AD06") fail("AD05 boundary must point to AD06.");
if (!JSON.stringify(ad05Boundary.allowed_scope).includes("reflective interpretation, not deterministic prediction")) fail("AD05 non-deterministic boundary missing.");

if (review.status !== "vedic_guidance_star_reflection_rule_model_ready_for_ad07") fail("AD06 review status mismatch.");
for (const key of [
  "ad06_vedic_guidance_star_reflection_rule_model_recorded",
  "ad05_consumed",
  "guidance_doctrine_recorded",
  "vedic_guidance_rule_model_recorded",
  "star_reflection_rule_model_recorded",
  "panchanga_context_linkage_model_recorded",
  "corpus_guidance_linkage_map_recorded",
  "claim_risk_tone_safety_model_recorded",
  "guidance_database_planning_map_recorded",
  "ready_for_ad07"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}
if (review.summary.hard_blocker_count_for_ad07 !== 0) fail("AD07 blocker count must be zero.");
for (const key of ["ag47_resume_allowed", "homepage_mutated", "public_content_generated", "guidance_generated", "star_reflection_generated", "vedic_guidance_generated", "word_of_day_generated", "panchang_prediction_generated", "deterministic_prediction_generated", "panchang_calculation_executed", "sql_file_created", "sql_executed", "database_write_performed", "supabase_table_created", "backend_auth_supabase_activation_performed", "deployment_performed", "service_role_key_exposed"]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (guidanceDoctrine.status !== "vedic_guidance_star_reflection_doctrine_recorded") fail("Guidance doctrine status mismatch.");
for (const phrase of ["does not generate", "not deterministic prediction", "No guidance rule may advise medical", "No fear-based"]) {
  if (!JSON.stringify(guidanceDoctrine.doctrine_rules).includes(phrase)) fail(`Guidance doctrine phrase missing: ${phrase}`);
}
for (const layer of ["panchanga_context_layer", "regional_profile_layer", "word_sutra_corpus_layer", "tone_and_safety_layer", "editorial_review_layer"]) {
  if (!guidanceDoctrine.rule_layers.includes(layer)) fail(`Guidance layer missing: ${layer}`);
}

if (vedicGuidanceRuleModel.status !== "vedic_guidance_rule_model_recorded") fail("Vedic guidance rule model status mismatch.");
for (const field of ["guidance_rule_id", "linked_panchanga_elements", "linked_regional_profile_id", "linked_word_id", "linked_quote_id", "claim_risk_level", "safety_note", "public_use_allowed"]) {
  if (!vedicGuidanceRuleModel.schema_fields.includes(field)) fail(`Vedic guidance field missing: ${field}`);
}
if (!JSON.stringify(vedicGuidanceRuleModel.usage_rules).includes("guaranteed outcome")) fail("Guaranteed outcome prohibition missing.");

if (starReflectionRuleModel.status !== "star_reflection_rule_model_recorded") fail("Star reflection rule model status mismatch.");
for (const field of ["star_reflection_rule_id", "linked_nakshatra_id", "linked_rashi_id", "linked_tithi_id", "linked_panchanga_context", "claim_risk_level", "public_use_allowed"]) {
  if (!starReflectionRuleModel.schema_fields.includes(field)) fail(`Star reflection field missing: ${field}`);
}
if (!JSON.stringify(starReflectionRuleModel.usage_rules).includes("not fate or deterministic prediction")) fail("Star reflection non-deterministic rule missing.");

if (panchangaContextLinkageModel.status !== "panchanga_context_linkage_model_recorded") fail("Panchanga context linkage status mismatch.");
for (const context of ["tithi_context", "vara_context", "nakshatra_context", "yoga_context", "karana_context", "regional_profile_context"]) {
  if (!JSON.stringify(panchangaContextLinkageModel.allowed_context_links).includes(context)) fail(`Panchanga context missing: ${context}`);
}
if (!JSON.stringify(panchangaContextLinkageModel.linkage_rules).includes("does not imply calculation execution")) fail("No calculation linkage rule missing.");

if (corpusGuidanceLinkageMap.status !== "corpus_guidance_linkage_map_recorded") fail("Corpus linkage status mismatch.");
for (const family of ["word_corpus", "sanskrit_name_corpus", "sutra_quote_corpus", "reflection_prompt_rules"]) {
  if (!JSON.stringify(corpusGuidanceLinkageMap.linkage_sources).includes(family)) fail(`Corpus linkage missing: ${family}`);
}
if (!JSON.stringify(corpusGuidanceLinkageMap.linkage_rules).includes("Nityanand Mishra ji style discipline")) fail("Nityanand corpus linkage caution missing.");

if (claimRiskToneSafetyModel.status !== "claim_risk_tone_safety_model_recorded") fail("Claim-risk model status mismatch.");
for (const level of ["low", "medium", "high", "blocked"]) {
  if (!JSON.stringify(claimRiskToneSafetyModel.claim_risk_levels).includes(`"level":"${level}"`) && !JSON.stringify(claimRiskToneSafetyModel.claim_risk_levels).includes(`"level": "${level}"`)) fail(`Claim-risk level missing: ${level}`);
}
for (const phrase of ["guaranteed result", "medical/legal/financial directive", "fatalistic destiny claim"]) {
  if (!claimRiskToneSafetyModel.blocked_public_language.includes(phrase)) fail(`Blocked public language missing: ${phrase}`);
}

if (databasePlanningMap.status !== "guidance_reflection_database_planning_map_recorded") fail("Database planning status mismatch.");
for (const table of ["vedic_guidance_rules", "star_reflection_rules", "guidance_context_links", "claim_risk_register", "editorial_review_status"]) {
  if (!JSON.stringify(databasePlanningMap.planned_tables_no_sql).includes(table)) fail(`Planned guidance table missing: ${table}`);
}
if (!JSON.stringify(databasePlanningMap.no_sql_rule).includes("SQL migrations and database writes remain blocked")) fail("No SQL rule missing.");

if (noMutationAudit.status !== "no_mutation_audit_passed_for_ad06") fail("No-mutation status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");
for (const check of noMutationAudit.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (readiness.status !== "ready_for_ad07_database_schema_planning") fail("Readiness status mismatch.");
if (readiness.ready_for_ad07 !== true) fail("Readiness must permit AD07.");
if (readiness.next_stage_id !== "AD07") fail("Readiness next stage must be AD07.");
if (readiness.ag47_resume_allowed_next !== false) fail("AG47 resume must remain blocked.");
if (readiness.guidance_generation_allowed_next !== false) fail("Guidance generation must remain blocked.");
if (readiness.panchang_prediction_allowed_next !== false) fail("Panchang prediction must remain blocked.");
if (readiness.sql_creation_allowed_next !== false) fail("SQL creation must remain blocked.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain blocked.");
if (readiness.backend_activation_allowed_next !== false) fail("Backend activation must remain blocked.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AD07") fail("Boundary must point to AD07.");
if (!JSON.stringify(boundary.allowed_scope).includes("AD00 through AD06")) fail("AD07 source range missing.");
if (!JSON.stringify(boundary.allowed_scope).includes("existing Supabase content-publishing schema snapshot")) fail("Existing Supabase snapshot mapping missing.");
if (!boundary.blocked_scope.includes("SQL execution")) fail("SQL execution blocked scope missing.");
if (!boundary.blocked_scope.includes("service-role key exposure")) fail("Service-role exposure blocked scope missing.");

for (const key of [
  "ad06_vedic_guidance_star_reflection_rule_model_recorded",
  "ad05_consumed",
  "guidance_doctrine_recorded",
  "vedic_guidance_rule_model_recorded",
  "star_reflection_rule_model_recorded",
  "panchanga_context_linkage_model_recorded",
  "corpus_guidance_linkage_map_recorded",
  "claim_risk_tone_safety_model_recorded",
  "guidance_database_planning_map_recorded",
  "ready_for_ad07"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}
if (preview.hard_blocker_count_for_ad07 !== 0) fail("Preview blocker count must be zero.");
for (const key of ["ag47_resume_allowed", "homepage_mutated", "public_content_generated", "guidance_generated", "star_reflection_generated", "vedic_guidance_generated", "word_of_day_generated", "panchang_prediction_generated", "deterministic_prediction_generated", "panchang_calculation_executed", "sql_file_created", "sql_executed", "database_write_performed", "supabase_table_created", "backend_auth_supabase_activation_performed", "deployment_performed", "service_role_key_exposed"]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ad06"]) fail("Missing package script: generate:ad06");
if (!pkg.scripts?.["validate:ad06"]) fail("Missing package script: validate:ad06");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ad06")) fail("validate:project must include validate:ad06.");

pass("AD06 Vedic Guidance and Star Reflection Rule Model is present.");
pass("AD05 corpus schema is consumed.");
pass("Guidance doctrine is valid.");
pass("Vedic Guidance rule model is valid.");
pass("Star Reflection rule model is valid.");
pass("Panchanga context linkage model is valid.");
pass("Corpus guidance linkage map is valid.");
pass("Claim-risk, tone and safety model is valid.");
pass("Guidance/reflection database planning map is valid without SQL.");
pass("No-mutation audit is valid.");
pass("AD07 Supabase and Local Database Schema Planning readiness is valid.");
pass("No guidance generation, prediction, Panchang calculation, SQL, DB write, backend activation, deployment or service-role exposure is recorded.");
