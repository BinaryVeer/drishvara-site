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
  console.error(`❌ AG45C validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

const required = [
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

  "data/content-intelligence/quality-reviews/ag45c-signal-selection-model.json",
  "data/content-intelligence/daily-surface/ag45c-daily-signal-selection-model.json",
  "data/content-intelligence/daily-surface/ag45c-india-signal-allocation-model.json",
  "data/content-intelligence/daily-surface/ag45c-northeast-watch-selection-model.json",
  "data/content-intelligence/daily-surface/ag45c-international-signal-selection-model.json",
  "data/content-intelligence/daily-surface/ag45c-topic-diversity-inference-scoring-model.json",
  "data/content-intelligence/daily-surface/ag45c-daily-signal-ranking-matrix.json",
  "data/content-intelligence/daily-surface/ag45c-permutation-rebalance-rules.json",
  "data/content-intelligence/backend-architecture/ag45c-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag45c-title-subtitle-metadata-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag45c-to-ag45d-title-subtitle-metadata-boundary.json",
  "data/quality/ag45c-signal-selection-model.json",
  "data/quality/ag45c-signal-selection-model-preview.json",
  "docs/quality/AG45C_SIGNAL_SELECTION_MODEL.md",
  "scripts/generate-ag45c-signal-selection-model.mjs",
  "scripts/validate-ag45c-signal-selection-model.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag45bReview = readJson("data/content-intelligence/quality-reviews/ag45b-source-credibility-model.json");
const ag45bCredibilityModel = readJson("data/content-intelligence/daily-surface/ag45b-source-credibility-model.json");
const ag45bReporterAnchorRules = readJson("data/content-intelligence/daily-surface/ag45b-reporter-anchor-verification-rules.json");
const ag45bUnderreportedModel = readJson("data/content-intelligence/daily-surface/ag45b-underreported-source-inclusion-model.json");
const ag45bNortheastSourceModel = readJson("data/content-intelligence/daily-surface/ag45b-northeast-source-prioritisation-model.json");
const ag45bTierRiskRegister = readJson("data/content-intelligence/daily-surface/ag45b-source-tier-risk-register.json");
const ag45bNoMutationAudit = readJson("data/content-intelligence/backend-architecture/ag45b-no-mutation-audit-register.json");
const ag45bReadiness = readJson("data/content-intelligence/quality-registry/ag45b-signal-selection-model-readiness-record.json");
const ag45bBoundary = readJson("data/content-intelligence/mutation-plans/ag45b-to-ag45c-signal-selection-model-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ag45c-signal-selection-model.json");
const selectionModel = readJson("data/content-intelligence/daily-surface/ag45c-daily-signal-selection-model.json");
const indiaAllocation = readJson("data/content-intelligence/daily-surface/ag45c-india-signal-allocation-model.json");
const northeastWatchSelection = readJson("data/content-intelligence/daily-surface/ag45c-northeast-watch-selection-model.json");
const internationalSelection = readJson("data/content-intelligence/daily-surface/ag45c-international-signal-selection-model.json");
const diversityInferenceScoring = readJson("data/content-intelligence/daily-surface/ag45c-topic-diversity-inference-scoring-model.json");
const rankingMatrix = readJson("data/content-intelligence/daily-surface/ag45c-daily-signal-ranking-matrix.json");
const rebalanceRules = readJson("data/content-intelligence/daily-surface/ag45c-permutation-rebalance-rules.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/ag45c-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag45c-title-subtitle-metadata-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag45c-to-ag45d-title-subtitle-metadata-boundary.json");
const preview = readJson("data/quality/ag45c-signal-selection-model-preview.json");
const pkg = readJson("package.json");

if (ag45bReview.status !== "source_credibility_model_ready_for_ag45c") fail("AG45B review status mismatch.");
if (ag45bReview.summary.ready_for_ag45c !== true) fail("AG45B readiness summary missing.");
if (!JSON.stringify(ag45bCredibilityModel).includes("regional_or_underreported_value")) fail("AG45B regional/underreported dimension missing.");
if (!JSON.stringify(ag45bReporterAnchorRules).includes("3+ years")) fail("AG45B reporter 3+ years rule missing.");
if (!JSON.stringify(ag45bUnderreportedModel).includes("smaller or regional")) fail("AG45B under-reported source rule missing.");
if (!JSON.stringify(ag45bNortheastSourceModel).includes("China-related implications")) fail("AG45B Northeast China-related source rule missing.");
if (!JSON.stringify(ag45bTierRiskRegister).includes("adult or explicit content")) fail("AG45B restricted content filter missing.");
if (ag45bNoMutationAudit.status !== "no_mutation_audit_passed_for_ag45b") fail("AG45B no-mutation audit mismatch.");
if (ag45bReadiness.ready_for_ag45c !== true) fail("AG45B readiness must permit AG45C.");
if (ag45bBoundary.next_stage_id !== "AG45C") fail("AG45B boundary must point to AG45C.");

if (review.status !== "signal_selection_model_ready_for_ag45d") fail("Review status mismatch.");
if (review.summary.ag45c_signal_selection_model_recorded !== true) fail("Signal selection model flag missing.");
if (review.summary.ten_signal_selection_model_recorded !== true) fail("Ten-signal selection flag missing.");
if (review.summary.india_six_signal_allocation_recorded !== true) fail("India six allocation flag missing.");
if (review.summary.northeast_watch_selection_recorded !== true) fail("Northeast watch flag missing.");
if (review.summary.international_four_signal_selection_recorded !== true) fail("International four flag missing.");
if (review.summary.topic_diversity_inference_scoring_recorded !== true) fail("Inference scoring flag missing.");
if (review.summary.permutation_rebalance_rules_recorded !== true) fail("Rebalance rules flag missing.");
if (review.summary.ready_for_ag45d !== true) fail("AG45D readiness missing.");
if (review.summary.hard_blocker_count_for_ag45d !== 0) fail("AG45D blocker count must be zero.");
if (review.summary.daily_signal_fetch_executed !== false) fail("Daily signal fetch must remain false.");
if (review.summary.news_scraping_executed !== false) fail("News scraping must remain false.");
if (review.summary.reporter_live_verification_executed !== false) fail("Reporter live verification must remain false.");
if (review.summary.external_link_verification_executed !== false) fail("External link verification must remain false.");
if (review.summary.homepage_mutated !== false) fail("Homepage mutation must remain false.");
if (review.summary.database_write_performed !== false) fail("Database write must remain false.");

if (selectionModel.status !== "daily_signal_selection_model_recorded_ready_for_ag45d") fail("Selection model status mismatch.");
if (selectionModel.selection_count.total_daily_signals !== 10) fail("Total signal count must be 10.");
if (selectionModel.selection_count.default_india_signals !== 6) fail("Default India count must be 6.");
if (selectionModel.selection_count.default_international_signals !== 4) fail("Default international count must be 4.");
if (!JSON.stringify(selectionModel.selection_count).includes("Northeast Watch")) fail("Northeast Watch minimum missing.");

if (indiaAllocation.status !== "india_signal_allocation_model_recorded") fail("India allocation status mismatch.");
if (indiaAllocation.total_india_slots !== 6) fail("India slots must be 6.");
if (!JSON.stringify(indiaAllocation.default_slot_logic).includes("northeast_watch")) fail("Northeast slot group missing.");
if (!JSON.stringify(indiaAllocation).includes("visibly tagged")) fail("Visible Northeast tag rule missing.");

if (northeastWatchSelection.status !== "northeast_watch_selection_model_recorded") fail("Northeast model status mismatch.");
for (const state of ["Arunachal Pradesh", "Assam", "Manipur", "Sikkim"]) {
  if (!northeastWatchSelection.region_scope.includes(state)) fail(`Northeast state missing: ${state}`);
}
if (!JSON.stringify(northeastWatchSelection.watch_themes).includes("China-related regional implications")) fail("Northeast China-related theme missing.");
if (!JSON.stringify(northeastWatchSelection.minimum_daily_process).includes("actively checked")) fail("Daily Northeast check rule missing.");
if (!JSON.stringify(northeastWatchSelection).includes("Do not force low-credibility Northeast content")) fail("Low-credibility Northeast guard missing.");

if (internationalSelection.status !== "international_signal_selection_model_recorded") fail("International model status mismatch.");
if (internationalSelection.total_international_slots !== 4) fail("International slots must be 4.");
if (internationalSelection.default_slot_logic.length !== 4) fail("International slot logic must have four groups.");
if (!JSON.stringify(internationalSelection).includes("Analytical explainer")) fail("Analytical explainer international rule missing.");

if (diversityInferenceScoring.status !== "topic_diversity_inference_scoring_model_recorded") fail("Diversity scoring status mismatch.");
if (diversityInferenceScoring.scoring_dimensions.length < 8) fail("Scoring dimensions insufficient.");
if (!JSON.stringify(diversityInferenceScoring.scoring_dimensions).includes("inference_value_for_future_articles")) fail("Inference-value scoring missing.");
if (!JSON.stringify(diversityInferenceScoring.inference_subtitle_requirements).includes("long-term theme")) fail("Long-term theme subtitle requirement missing.");

if (rankingMatrix.status !== "daily_signal_ranking_matrix_recorded") fail("Ranking matrix status mismatch.");
if (!JSON.stringify(rankingMatrix.ranking_flow).includes("Top 6 India and top 4 International")) fail("Top 6/4 ranking flow missing.");
if (!JSON.stringify(rankingMatrix.hard_exclusion_gates).includes("adult/explicit content")) fail("Adult/explicit exclusion missing.");
if (rankingMatrix.display_rank_rules.no_live_ranking_now !== true) fail("No live ranking guard missing.");

if (rebalanceRules.status !== "permutation_rebalance_rules_recorded") fail("Rebalance rules status mismatch.");
if (rebalanceRules.default_distribution.india !== 6) fail("Rebalance default India count must be 6.");
if (rebalanceRules.default_distribution.international !== 4) fail("Rebalance default international count must be 4.");
if (!JSON.stringify(rebalanceRules.allowed_rebalance_cases_later).includes("5 India / 5 International")) fail("5/5 rebalance case missing.");
if (!JSON.stringify(rebalanceRules.allowed_rebalance_cases_later).includes("7 India / 3 International")) fail("7/3 rebalance case missing.");
if (!JSON.stringify(rebalanceRules.allowed_rebalance_cases_later).includes("2 Northeast-tagged India signals")) fail("Northeast high relevance rebalance missing.");
if (!JSON.stringify(rebalanceRules.non_negotiable_rules).includes("Northeast Watch must be actively checked daily")) fail("Northeast daily check non-negotiable missing.");

if (noMutationAudit.status !== "no_mutation_audit_passed_for_ag45c") fail("No-mutation audit status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");
for (const check of noMutationAudit.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (readiness.ready_for_ag45d !== true) fail("Readiness must permit AG45D.");
if (readiness.next_stage_id !== "AG45D") fail("Readiness next stage must be AG45D.");
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

if (boundary.next_stage_id !== "AG45D") fail("Boundary must point to AG45D.");

if (preview.ag45c_signal_selection_model_recorded !== 1) fail("Preview model flag missing.");
if (preview.ten_signal_selection_model_recorded !== 1) fail("Preview 10-signal flag missing.");
if (preview.india_six_signal_allocation_recorded !== 1) fail("Preview India six flag missing.");
if (preview.northeast_watch_selection_recorded !== 1) fail("Preview Northeast flag missing.");
if (preview.international_four_signal_selection_recorded !== 1) fail("Preview international four flag missing.");
if (preview.topic_diversity_inference_scoring_recorded !== 1) fail("Preview inference scoring flag missing.");
if (preview.ready_for_ag45d !== 1) fail("Preview AG45D readiness missing.");
if (preview.daily_signal_fetch_executed !== 0) fail("Preview fetch must be zero.");
if (preview.news_scraping_executed !== 0) fail("Preview scraping must be zero.");
if (preview.reporter_live_verification_executed !== 0) fail("Preview reporter verification must be zero.");
if (preview.external_link_verification_executed !== 0) fail("Preview link verification must be zero.");
if (preview.image_fetch_executed !== 0) fail("Preview image fetch must be zero.");
if (preview.video_fetch_executed !== 0) fail("Preview video fetch must be zero.");
if (preview.homepage_mutated !== 0) fail("Preview homepage mutation must be zero.");
if (preview.database_write_performed !== 0) fail("Preview DB write must be zero.");
if (preview.backend_auth_supabase_activation_performed !== 0) fail("Preview backend activation must be zero.");
if (preview.deployment_performed !== 0) fail("Preview deployment must be zero.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be zero.");

if (!pkg.scripts?.["generate:ag45c"]) fail("Missing package script: generate:ag45c");
if (!pkg.scripts?.["validate:ag45c"]) fail("Missing package script: validate:ag45c");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag45c")) fail("validate:project must include validate:ag45c.");

pass("AG45C India, Northeast and International Signal Selection Model is present.");
pass("AG45B credibility model is consumed.");
pass("10-signal model with 6 India, Northeast Watch and 4 international signals is valid.");
pass("India allocation, Northeast Watch and international selection models are valid.");
pass("Topic diversity, inference-value scoring, ranking and rebalance rules are valid.");
pass("No-mutation audit is valid.");
pass("AG45D Title, Subtitle and Inference Metadata Rules readiness is valid.");
pass("No live fetch, scraping, reporter verification, link verification, image/video fetch, homepage mutation, database/backend activation, deployment or service-role exposure is recorded.");
