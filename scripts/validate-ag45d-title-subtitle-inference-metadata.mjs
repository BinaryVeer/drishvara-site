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
  console.error(`❌ AG45D validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag45c-signal-selection-model.json",
  "data/content-intelligence/daily-surface/ag45c-daily-signal-selection-model.json",
  "data/content-intelligence/daily-surface/ag45c-india-signal-allocation-model.json",
  "data/content-intelligence/daily-surface/ag45c-northeast-watch-selection-model.json",
  "data/content-intelligence/daily-surface/ag45c-international-signal-selection-model.json",
  "data/content-intelligence/daily-surface/ag45c-topic-diversity-inference-scoring-model.json",
  "data/content-intelligence/daily-surface/ag45c-daily-signal-ranking-matrix.json",
  "data/content-intelligence/backend-architecture/ag45c-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag45c-title-subtitle-metadata-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag45c-to-ag45d-title-subtitle-metadata-boundary.json",

  "data/content-intelligence/quality-reviews/ag45d-title-subtitle-inference-metadata.json",
  "data/content-intelligence/daily-surface/ag45d-drishvara-title-rules.json",
  "data/content-intelligence/daily-surface/ag45d-inference-subtitle-rules.json",
  "data/content-intelligence/daily-surface/ag45d-source-attribution-language-rules.json",
  "data/content-intelligence/daily-surface/ag45d-signal-inference-metadata-map.json",
  "data/content-intelligence/daily-surface/ag45d-signal-card-copy-template-model.json",
  "data/content-intelligence/backend-architecture/ag45d-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag45d-image-link-attribution-safety-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag45d-to-ag45e-image-link-attribution-safety-boundary.json",
  "data/quality/ag45d-title-subtitle-inference-metadata.json",
  "data/quality/ag45d-title-subtitle-inference-metadata-preview.json",
  "docs/quality/AG45D_TITLE_SUBTITLE_INFERENCE_METADATA.md",
  "scripts/generate-ag45d-title-subtitle-inference-metadata.mjs",
  "scripts/validate-ag45d-title-subtitle-inference-metadata.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag45cReview = readJson("data/content-intelligence/quality-reviews/ag45c-signal-selection-model.json");
const ag45cSelectionModel = readJson("data/content-intelligence/daily-surface/ag45c-daily-signal-selection-model.json");
const ag45cNortheastWatchSelection = readJson("data/content-intelligence/daily-surface/ag45c-northeast-watch-selection-model.json");
const ag45cInternationalSelection = readJson("data/content-intelligence/daily-surface/ag45c-international-signal-selection-model.json");
const ag45cDiversityInferenceScoring = readJson("data/content-intelligence/daily-surface/ag45c-topic-diversity-inference-scoring-model.json");
const ag45cRankingMatrix = readJson("data/content-intelligence/daily-surface/ag45c-daily-signal-ranking-matrix.json");
const ag45cNoMutationAudit = readJson("data/content-intelligence/backend-architecture/ag45c-no-mutation-audit-register.json");
const ag45cReadiness = readJson("data/content-intelligence/quality-registry/ag45c-title-subtitle-metadata-readiness-record.json");
const ag45cBoundary = readJson("data/content-intelligence/mutation-plans/ag45c-to-ag45d-title-subtitle-metadata-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ag45d-title-subtitle-inference-metadata.json");
const titleRules = readJson("data/content-intelligence/daily-surface/ag45d-drishvara-title-rules.json");
const subtitleRules = readJson("data/content-intelligence/daily-surface/ag45d-inference-subtitle-rules.json");
const attributionRules = readJson("data/content-intelligence/daily-surface/ag45d-source-attribution-language-rules.json");
const metadataMap = readJson("data/content-intelligence/daily-surface/ag45d-signal-inference-metadata-map.json");
const cardCopyTemplate = readJson("data/content-intelligence/daily-surface/ag45d-signal-card-copy-template-model.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/ag45d-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag45d-image-link-attribution-safety-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag45d-to-ag45e-image-link-attribution-safety-boundary.json");
const preview = readJson("data/quality/ag45d-title-subtitle-inference-metadata-preview.json");
const pkg = readJson("package.json");

if (ag45cReview.status !== "signal_selection_model_ready_for_ag45d") fail("AG45C review status mismatch.");
if (ag45cReview.summary.ready_for_ag45d !== true) fail("AG45C readiness summary missing.");
if (ag45cSelectionModel.selection_count.total_daily_signals !== 10) fail("AG45C total signal count must be 10.");
if (ag45cSelectionModel.selection_count.default_india_signals !== 6) fail("AG45C India count must be 6.");
if (ag45cSelectionModel.selection_count.default_international_signals !== 4) fail("AG45C international count must be 4.");
if (!JSON.stringify(ag45cNortheastWatchSelection).includes("actively checked daily")) fail("AG45C Northeast active daily check missing.");
if (!JSON.stringify(ag45cInternationalSelection).includes("Analytical explainer")) fail("AG45C analytical explainer rule missing.");
if (!JSON.stringify(ag45cDiversityInferenceScoring).includes("inference_value_for_future_articles")) fail("AG45C inference-value scoring missing.");
if (!JSON.stringify(ag45cRankingMatrix).includes("Top 6 India and top 4 International")) fail("AG45C ranking matrix missing 6/4 rule.");
if (ag45cNoMutationAudit.status !== "no_mutation_audit_passed_for_ag45c") fail("AG45C no-mutation audit mismatch.");
if (ag45cReadiness.ready_for_ag45d !== true) fail("AG45C readiness must permit AG45D.");
if (ag45cBoundary.next_stage_id !== "AG45D") fail("AG45C boundary must point to AG45D.");

if (review.status !== "title_subtitle_inference_metadata_rules_ready_for_ag45e") fail("Review status mismatch.");
if (review.summary.ag45d_title_subtitle_metadata_rules_recorded !== true) fail("AG45D summary flag missing.");
if (review.summary.drishvara_title_rules_recorded !== true) fail("Title rules summary missing.");
if (review.summary.inference_subtitle_rules_recorded !== true) fail("Subtitle rules summary missing.");
if (review.summary.source_attribution_language_rules_recorded !== true) fail("Attribution rules summary missing.");
if (review.summary.metadata_mapping_rules_recorded !== true) fail("Metadata map summary missing.");
if (review.summary.signal_card_copy_template_recorded !== true) fail("Card template summary missing.");
if (review.summary.ready_for_ag45e !== true) fail("AG45E readiness missing.");
if (review.summary.hard_blocker_count_for_ag45e !== 0) fail("AG45E blocker count must be zero.");
if (review.summary.daily_signal_fetch_executed !== false) fail("Daily signal fetch must remain false.");
if (review.summary.news_scraping_executed !== false) fail("News scraping must remain false.");
if (review.summary.external_link_verification_executed !== false) fail("External link verification must remain false.");
if (review.summary.homepage_mutated !== false) fail("Homepage mutation must remain false.");
if (review.summary.database_write_performed !== false) fail("Database write must remain false.");

if (titleRules.status !== "drishvara_title_rules_recorded") fail("Title rules status mismatch.");
if (!JSON.stringify(titleRules.rules).includes("must not copy the publisher headline verbatim")) fail("No headline-copy rule missing.");
if (!JSON.stringify(titleRules.rules).includes("8–12 words")) fail("Title length rule missing.");
if (!JSON.stringify(titleRules.rules).includes("Northeast Watch")) fail("Northeast title visibility rule missing.");

if (subtitleRules.status !== "inference_subtitle_rules_recorded") fail("Subtitle rules status mismatch.");
for (const phrase of ["What happened", "Why it matters", "long-term theme", "future reference", "article-planning value"]) {
  if (!JSON.stringify(subtitleRules).includes(phrase)) fail(`Subtitle inference phrase missing: ${phrase}`);
}
if (!JSON.stringify(subtitleRules.required_inference_dimensions).includes("pattern_value")) fail("Pattern value dimension missing.");
if (!JSON.stringify(subtitleRules.prohibited_subtitle_behaviour).includes("Do not rewrite the source article")) fail("No rewrite rule missing.");

if (attributionRules.status !== "source_attribution_language_rules_recorded") fail("Attribution rules status mismatch.");
for (const phrase of ["reports for", "reports that", "explains", "argues or discusses"]) {
  if (!JSON.stringify(attributionRules).includes(phrase)) fail(`Attribution phrase missing: ${phrase}`);
}
if (!JSON.stringify(attributionRules.public_language_rules).includes("Do not say 'editor says'")) fail("Editor says guard missing.");

if (metadataMap.status !== "signal_inference_metadata_map_recorded") fail("Metadata map status mismatch.");
for (const field of ["drishvara_title", "drishvara_subtitle", "source_url", "inference_tags", "pattern_value", "verification_status"]) {
  if (!JSON.stringify(metadataMap.metadata_groups).includes(field)) fail(`Metadata field missing: ${field}`);
}
if (metadataMap.database_write_now !== false) fail("Metadata map must not write database now.");

if (cardCopyTemplate.status !== "signal_card_copy_template_model_recorded") fail("Card template status mismatch.");
if (cardCopyTemplate.compact_card_template.tag !== "India / Northeast Watch / World") fail("Card tag model mismatch.");
if (cardCopyTemplate.compact_card_constraints.visible_cards_at_once !== 3) fail("Visible card count must be 3.");
if (cardCopyTemplate.compact_card_constraints.fixed_height_container !== true) fail("Fixed-height container rule missing.");
if (!JSON.stringify(cardCopyTemplate.example_card).includes("Northeast Watch")) fail("Northeast example card missing.");

if (noMutationAudit.status !== "no_mutation_audit_passed_for_ag45d") fail("No-mutation audit status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");
for (const check of noMutationAudit.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (readiness.ready_for_ag45e !== true) fail("Readiness must permit AG45E.");
if (readiness.next_stage_id !== "AG45E") fail("Readiness next stage must be AG45E.");
if (readiness.daily_signal_fetch_allowed_next !== false) fail("Daily signal fetch must remain blocked.");
if (readiness.news_scraping_allowed_next !== false) fail("News scraping must remain blocked.");
if (readiness.external_link_verification_allowed_next !== false) fail("External link verification must remain blocked.");
if (readiness.image_fetch_allowed_next !== false) fail("Image fetch must remain blocked.");
if (readiness.video_fetch_allowed_next !== false) fail("Video fetch must remain blocked.");
if (readiness.homepage_mutation_allowed_next !== false) fail("Homepage mutation must remain blocked.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain blocked.");
if (readiness.backend_activation_allowed_next !== false) fail("Backend activation must remain blocked.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG45E") fail("Boundary must point to AG45E.");

if (preview.ag45d_title_subtitle_metadata_rules_recorded !== 1) fail("Preview AG45D flag missing.");
if (preview.drishvara_title_rules_recorded !== 1) fail("Preview title flag missing.");
if (preview.inference_subtitle_rules_recorded !== 1) fail("Preview subtitle flag missing.");
if (preview.source_attribution_language_rules_recorded !== 1) fail("Preview attribution flag missing.");
if (preview.metadata_mapping_rules_recorded !== 1) fail("Preview metadata flag missing.");
if (preview.signal_card_copy_template_recorded !== 1) fail("Preview card template flag missing.");
if (preview.ready_for_ag45e !== 1) fail("Preview AG45E readiness missing.");
if (preview.daily_signal_fetch_executed !== 0) fail("Preview fetch must be zero.");
if (preview.news_scraping_executed !== 0) fail("Preview scraping must be zero.");
if (preview.external_link_verification_executed !== 0) fail("Preview link verification must be zero.");
if (preview.image_fetch_executed !== 0) fail("Preview image fetch must be zero.");
if (preview.video_fetch_executed !== 0) fail("Preview video fetch must be zero.");
if (preview.homepage_mutated !== 0) fail("Preview homepage mutation must be zero.");
if (preview.database_write_performed !== 0) fail("Preview DB write must be zero.");
if (preview.backend_auth_supabase_activation_performed !== 0) fail("Preview backend activation must be zero.");
if (preview.deployment_performed !== 0) fail("Preview deployment must be zero.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be zero.");

if (!pkg.scripts?.["generate:ag45d"]) fail("Missing package script: generate:ag45d");
if (!pkg.scripts?.["validate:ag45d"]) fail("Missing package script: validate:ag45d");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag45d")) fail("validate:project must include validate:ag45d.");

pass("AG45D Title, Subtitle and Inference Metadata Rules is present.");
pass("AG45C signal selection model is consumed.");
pass("Drishvara title rules are valid.");
pass("Inference subtitle rules are valid.");
pass("Source attribution language rules are valid.");
pass("Signal inference metadata map and compact card template are valid.");
pass("No-mutation audit is valid.");
pass("AG45E Image, Thumbnail, Link and Attribution Safety Model readiness is valid.");
pass("No live fetch, scraping, reporter verification, link verification, image/video fetch, homepage mutation, database/backend activation, deployment or service-role exposure is recorded.");
