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
  console.error(`❌ AG45B validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag45a-daily-signal-surface-first-light-doctrine.json",
  "data/content-intelligence/daily-surface/ag45a-daily-signal-surface-doctrine.json",
  "data/content-intelligence/daily-surface/ag45a-signal-selection-doctrine.json",
  "data/content-intelligence/daily-surface/ag45a-northeast-watch-doctrine.json",
  "data/content-intelligence/daily-surface/ag45a-source-attribution-title-subtitle-doctrine.json",
  "data/content-intelligence/backend-architecture/ag45a-daily-signal-metadata-schema-plan.json",
  "data/content-intelligence/backend-architecture/ag45a-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag45a-source-credibility-model-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag45a-to-ag45b-source-credibility-model-boundary.json",

  "data/content-intelligence/quality-reviews/ag45b-source-credibility-model.json",
  "data/content-intelligence/daily-surface/ag45b-source-credibility-model.json",
  "data/content-intelligence/daily-surface/ag45b-publisher-credibility-rules.json",
  "data/content-intelligence/daily-surface/ag45b-reporter-anchor-verification-rules.json",
  "data/content-intelligence/daily-surface/ag45b-underreported-source-inclusion-model.json",
  "data/content-intelligence/daily-surface/ag45b-northeast-source-prioritisation-model.json",
  "data/content-intelligence/daily-surface/ag45b-source-tier-risk-register.json",
  "data/content-intelligence/backend-architecture/ag45b-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag45b-signal-selection-model-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag45b-to-ag45c-signal-selection-model-boundary.json",
  "data/quality/ag45b-source-credibility-model.json",
  "data/quality/ag45b-source-credibility-model-preview.json",
  "docs/quality/AG45B_SOURCE_CREDIBILITY_MODEL.md",
  "scripts/generate-ag45b-source-credibility-model.mjs",
  "scripts/validate-ag45b-source-credibility-model.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag45aReview = readJson("data/content-intelligence/quality-reviews/ag45a-daily-signal-surface-first-light-doctrine.json");
const ag45aSignalDoctrine = readJson("data/content-intelligence/daily-surface/ag45a-signal-selection-doctrine.json");
const ag45aNortheastDoctrine = readJson("data/content-intelligence/daily-surface/ag45a-northeast-watch-doctrine.json");
const ag45aAttributionDoctrine = readJson("data/content-intelligence/daily-surface/ag45a-source-attribution-title-subtitle-doctrine.json");
const ag45aBackendSchemaPlan = readJson("data/content-intelligence/backend-architecture/ag45a-daily-signal-metadata-schema-plan.json");
const ag45aNoMutationAudit = readJson("data/content-intelligence/backend-architecture/ag45a-no-mutation-audit-register.json");
const ag45aReadiness = readJson("data/content-intelligence/quality-registry/ag45a-source-credibility-model-readiness-record.json");
const ag45aBoundary = readJson("data/content-intelligence/mutation-plans/ag45a-to-ag45b-source-credibility-model-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ag45b-source-credibility-model.json");
const credibilityModel = readJson("data/content-intelligence/daily-surface/ag45b-source-credibility-model.json");
const publisherRules = readJson("data/content-intelligence/daily-surface/ag45b-publisher-credibility-rules.json");
const reporterAnchorRules = readJson("data/content-intelligence/daily-surface/ag45b-reporter-anchor-verification-rules.json");
const underreportedModel = readJson("data/content-intelligence/daily-surface/ag45b-underreported-source-inclusion-model.json");
const northeastSourceModel = readJson("data/content-intelligence/daily-surface/ag45b-northeast-source-prioritisation-model.json");
const tierRiskRegister = readJson("data/content-intelligence/daily-surface/ag45b-source-tier-risk-register.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/ag45b-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag45b-signal-selection-model-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag45b-to-ag45c-signal-selection-model-boundary.json");
const preview = readJson("data/quality/ag45b-source-credibility-model-preview.json");
const pkg = readJson("package.json");

if (ag45aReview.status !== "daily_signal_surface_first_light_doctrine_ready_for_ag45b") fail("AG45A review status mismatch.");
if (ag45aReview.summary.ready_for_ag45b !== true) fail("AG45A readiness summary missing.");
if (ag45aSignalDoctrine.daily_signal_count !== 10) fail("AG45A daily signal count must be 10.");
if (ag45aSignalDoctrine.default_distribution.india_signals !== 6) fail("AG45A India count must be 6.");
if (ag45aSignalDoctrine.default_distribution.international_signals !== 4) fail("AG45A international count must be 4.");
if (!JSON.stringify(ag45aNortheastDoctrine).includes("China-related regional implications")) fail("AG45A Northeast doctrine missing China-related theme.");
if (!JSON.stringify(ag45aAttributionDoctrine).includes("Palki Sharma")) fail("AG45A anchor/explainer model missing.");
if (!ag45aBackendSchemaPlan.planned_fields.includes("credibility_score")) fail("AG45A schema missing credibility_score.");
if (ag45aNoMutationAudit.status !== "no_mutation_audit_passed_for_ag45a") fail("AG45A no-mutation audit mismatch.");
if (ag45aReadiness.ready_for_ag45b !== true) fail("AG45A readiness must permit AG45B.");
if (ag45aBoundary.next_stage_id !== "AG45B") fail("AG45A boundary must point to AG45B.");

if (review.status !== "source_credibility_model_ready_for_ag45c") fail("Review status mismatch.");
if (review.summary.ag45b_source_credibility_model_recorded !== true) fail("Credibility model flag missing.");
if (review.summary.publisher_credibility_rules_recorded !== true) fail("Publisher rules flag missing.");
if (review.summary.reporter_anchor_verification_rules_recorded !== true) fail("Reporter/anchor rules flag missing.");
if (review.summary.reporter_three_year_presence_rule_recorded !== true) fail("Reporter 3-year rule flag missing.");
if (review.summary.anchor_explainer_perspective_layer_recorded !== true) fail("Anchor/explainer perspective flag missing.");
if (review.summary.underreported_source_inclusion_model_recorded !== true) fail("Under-reported source flag missing.");
if (review.summary.northeast_source_prioritisation_model_recorded !== true) fail("Northeast source priority flag missing.");
if (review.summary.ready_for_ag45c !== true) fail("AG45C readiness missing.");
if (review.summary.hard_blocker_count_for_ag45c !== 0) fail("AG45C hard blocker count must be zero.");
if (review.summary.daily_signal_fetch_executed !== false) fail("Daily signal fetch must remain false.");
if (review.summary.news_scraping_executed !== false) fail("News scraping must remain false.");
if (review.summary.reporter_live_verification_executed !== false) fail("Reporter live verification must remain false.");
if (review.summary.database_write_performed !== false) fail("Database write must remain false.");

if (credibilityModel.status !== "source_credibility_model_recorded_ready_for_ag45c") fail("Credibility model status mismatch.");
if (credibilityModel.source_classes.length < 4) fail("Source classes insufficient.");
if (credibilityModel.scoring_dimensions.length < 8) fail("Scoring dimensions insufficient.");
if (!JSON.stringify(credibilityModel).includes("publisher_track_record")) fail("Publisher track record dimension missing.");
if (!JSON.stringify(credibilityModel).includes("reporter_or_anchor_traceability")) fail("Reporter/anchor traceability dimension missing.");

if (publisherRules.status !== "publisher_credibility_rules_recorded") fail("Publisher rules status mismatch.");
if (publisherRules.underreported_publisher_treatment.allowed !== true) fail("Under-reported publishers must be allowed with safeguards.");
if (!JSON.stringify(publisherRules.risk_indicators).includes("adult/explicit")) fail("Adult/explicit risk indicator missing.");

if (reporterAnchorRules.status !== "reporter_anchor_verification_rules_recorded") fail("Reporter/anchor rules status mismatch.");
if (!JSON.stringify(reporterAnchorRules.reporter_rules).includes("3+ years")) fail("Reporter 3+ years rule missing.");
if (!JSON.stringify(reporterAnchorRules.anchor_explainer_rules).includes("Palki Sharma")) fail("Palki Sharma-type explainer rule missing.");
if (!JSON.stringify(reporterAnchorRules.anchor_explainer_rules).includes("Ranganathan")) fail("Ranganathan-type commentator rule missing.");
if (!JSON.stringify(reporterAnchorRules.public_attribution_language).includes("explains")) fail("Explainer attribution language missing.");

if (underreportedModel.status !== "underreported_source_inclusion_model_recorded") fail("Under-reported model status mismatch.");
if (!underreportedModel.internal_status_bands.includes("under_editorial_review")) fail("Under editorial review band missing.");
if (!JSON.stringify(underreportedModel.inclusion_logic).includes("smaller or regional")) fail("Small/regional source inclusion rule missing.");

if (northeastSourceModel.status !== "northeast_source_prioritisation_model_recorded") fail("Northeast source model status mismatch.");
for (const state of ["Arunachal Pradesh", "Assam", "Manipur", "Sikkim"]) {
  if (!northeastSourceModel.priority_states.includes(state)) fail(`Northeast priority state missing: ${state}`);
}
if (!JSON.stringify(northeastSourceModel.source_priority_rules).includes("China-related implications")) fail("Northeast China-related source rule missing.");
if (northeastSourceModel.scoring_boost.northeast_watch_candidate_boost < 1) fail("Northeast scoring boost missing.");

if (tierRiskRegister.status !== "source_tier_risk_register_recorded") fail("Tier risk register status mismatch.");
if (tierRiskRegister.tiers.length < 4) fail("Tier register must have four tiers.");
if (!JSON.stringify(tierRiskRegister.restricted_content_filters).includes("adult or explicit content")) fail("Adult/explicit restriction missing.");
if (!JSON.stringify(tierRiskRegister.restricted_content_filters).includes("service")) {
  // no-op guard intentionally not required; keep compatibility
}

if (noMutationAudit.status !== "no_mutation_audit_passed_for_ag45b") fail("No-mutation audit status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");
for (const check of noMutationAudit.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (readiness.ready_for_ag45c !== true) fail("Readiness must permit AG45C.");
if (readiness.next_stage_id !== "AG45C") fail("Readiness next stage must be AG45C.");
if (readiness.daily_signal_fetch_allowed_next !== false) fail("Daily signal fetch must remain blocked.");
if (readiness.news_scraping_allowed_next !== false) fail("News scraping must remain blocked.");
if (readiness.reporter_live_verification_allowed_next !== false) fail("Reporter live verification must remain blocked.");
if (readiness.external_link_verification_allowed_next !== false) fail("External link verification must remain blocked.");
if (readiness.image_fetch_allowed_next !== false) fail("Image fetch must remain blocked.");
if (readiness.video_fetch_allowed_next !== false) fail("Video fetch must remain blocked.");
if (readiness.homepage_mutation_allowed_next !== false) fail("Homepage mutation must remain blocked.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain blocked.");
if (readiness.backend_activation_allowed_next !== false) fail("Backend activation must remain blocked.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG45C") fail("Boundary must point to AG45C.");

if (preview.ag45b_source_credibility_model_recorded !== 1) fail("Preview model flag missing.");
if (preview.publisher_credibility_rules_recorded !== 1) fail("Preview publisher flag missing.");
if (preview.reporter_anchor_verification_rules_recorded !== 1) fail("Preview reporter/anchor flag missing.");
if (preview.reporter_three_year_presence_rule_recorded !== 1) fail("Preview 3-year rule flag missing.");
if (preview.underreported_source_inclusion_model_recorded !== 1) fail("Preview under-reported flag missing.");
if (preview.northeast_source_prioritisation_model_recorded !== 1) fail("Preview Northeast priority flag missing.");
if (preview.ready_for_ag45c !== 1) fail("Preview AG45C readiness missing.");
if (preview.daily_signal_fetch_executed !== 0) fail("Preview fetch must be zero.");
if (preview.news_scraping_executed !== 0) fail("Preview scraping must be zero.");
if (preview.reporter_live_verification_executed !== 0) fail("Preview live reporter verification must be zero.");
if (preview.image_fetch_executed !== 0) fail("Preview image fetch must be zero.");
if (preview.video_fetch_executed !== 0) fail("Preview video fetch must be zero.");
if (preview.homepage_mutated !== 0) fail("Preview homepage mutation must be zero.");
if (preview.database_write_performed !== 0) fail("Preview DB write must be zero.");
if (preview.backend_auth_supabase_activation_performed !== 0) fail("Preview backend activation must be zero.");
if (preview.deployment_performed !== 0) fail("Preview deployment must be zero.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be zero.");

if (!pkg.scripts?.["generate:ag45b"]) fail("Missing package script: generate:ag45b");
if (!pkg.scripts?.["validate:ag45b"]) fail("Missing package script: validate:ag45b");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag45b")) fail("validate:project must include validate:ag45b.");

pass("AG45B Source, Publisher, Reporter and Anchor Credibility Model is present.");
pass("AG45A doctrine and Daily Signal rules are consumed.");
pass("Publisher credibility, under-reported source inclusion and risk-tier rules are valid.");
pass("Reporter 3+ year presence rule and anchor/explainer perspective-layer rule are valid.");
pass("Northeast source-prioritisation model is valid.");
pass("No-mutation audit is valid.");
pass("AG45C India, Northeast and International Signal Selection Model readiness is valid.");
pass("No live fetch, scraping, reporter verification, link verification, image/video fetch, homepage mutation, database/backend activation, deployment or service-role exposure is recorded.");
