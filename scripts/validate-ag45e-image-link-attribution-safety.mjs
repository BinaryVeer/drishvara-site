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
  console.error(`❌ AG45E validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag45d-title-subtitle-inference-metadata.json",
  "data/content-intelligence/daily-surface/ag45d-source-attribution-language-rules.json",
  "data/content-intelligence/daily-surface/ag45d-signal-inference-metadata-map.json",
  "data/content-intelligence/daily-surface/ag45d-signal-card-copy-template-model.json",
  "data/content-intelligence/backend-architecture/ag45d-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag45d-image-link-attribution-safety-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag45d-to-ag45e-image-link-attribution-safety-boundary.json",

  "data/content-intelligence/quality-reviews/ag45e-image-link-attribution-safety.json",
  "data/content-intelligence/daily-surface/ag45e-source-link-canonical-url-safety-model.json",
  "data/content-intelligence/daily-surface/ag45e-thumbnail-image-safety-model.json",
  "data/content-intelligence/daily-surface/ag45e-attribution-credit-display-model.json",
  "data/content-intelligence/daily-surface/ag45e-external-asset-no-download-policy.json",
  "data/content-intelligence/daily-surface/ag45e-verification-status-bands-model.json",
  "data/content-intelligence/daily-surface/ag45e-image-reference-governance-consumption-map.json",
  "data/content-intelligence/backend-architecture/ag45e-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag45e-video-of-the-day-safety-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag45e-to-ag45f-video-of-the-day-safety-boundary.json",
  "data/quality/ag45e-image-link-attribution-safety.json",
  "data/quality/ag45e-image-link-attribution-safety-preview.json",
  "docs/quality/AG45E_IMAGE_LINK_ATTRIBUTION_SAFETY.md",
  "scripts/generate-ag45e-image-link-attribution-safety.mjs",
  "scripts/validate-ag45e-image-link-attribution-safety.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag45dReview = readJson("data/content-intelligence/quality-reviews/ag45d-title-subtitle-inference-metadata.json");
const ag45dAttributionRules = readJson("data/content-intelligence/daily-surface/ag45d-source-attribution-language-rules.json");
const ag45dMetadataMap = readJson("data/content-intelligence/daily-surface/ag45d-signal-inference-metadata-map.json");
const ag45dCardCopyTemplate = readJson("data/content-intelligence/daily-surface/ag45d-signal-card-copy-template-model.json");
const ag45dNoMutationAudit = readJson("data/content-intelligence/backend-architecture/ag45d-no-mutation-audit-register.json");
const ag45dReadiness = readJson("data/content-intelligence/quality-registry/ag45d-image-link-attribution-safety-readiness-record.json");
const ag45dBoundary = readJson("data/content-intelligence/mutation-plans/ag45d-to-ag45e-image-link-attribution-safety-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ag45e-image-link-attribution-safety.json");
const linkSafetyModel = readJson("data/content-intelligence/daily-surface/ag45e-source-link-canonical-url-safety-model.json");
const thumbnailImageSafetyModel = readJson("data/content-intelligence/daily-surface/ag45e-thumbnail-image-safety-model.json");
const attributionCreditModel = readJson("data/content-intelligence/daily-surface/ag45e-attribution-credit-display-model.json");
const externalAssetPolicy = readJson("data/content-intelligence/daily-surface/ag45e-external-asset-no-download-policy.json");
const verificationStatusModel = readJson("data/content-intelligence/daily-surface/ag45e-verification-status-bands-model.json");
const imageReferenceGovernanceConsumption = readJson("data/content-intelligence/daily-surface/ag45e-image-reference-governance-consumption-map.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/ag45e-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag45e-video-of-the-day-safety-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag45e-to-ag45f-video-of-the-day-safety-boundary.json");
const preview = readJson("data/quality/ag45e-image-link-attribution-safety-preview.json");
const pkg = readJson("package.json");

if (ag45dReview.status !== "title_subtitle_inference_metadata_rules_ready_for_ag45e") fail("AG45D review status mismatch.");
if (ag45dReview.summary.ready_for_ag45e !== true) fail("AG45D readiness summary missing.");
if (!JSON.stringify(ag45dAttributionRules).includes("Source Attribution")) fail("AG45D attribution rules missing.");
if (!JSON.stringify(ag45dMetadataMap).includes("source_url")) fail("AG45D metadata source_url missing.");
if (!JSON.stringify(ag45dMetadataMap).includes("image_credit")) fail("AG45D metadata image_credit missing.");
if (!JSON.stringify(ag45dMetadataMap).includes("video_credit")) fail("AG45D metadata video_credit missing.");
if (ag45dCardCopyTemplate.compact_card_constraints.source_link_required_later !== true) fail("AG45D card source link requirement missing.");
if (ag45dNoMutationAudit.status !== "no_mutation_audit_passed_for_ag45d") fail("AG45D no-mutation audit mismatch.");
if (ag45dReadiness.ready_for_ag45e !== true) fail("AG45D readiness must permit AG45E.");
if (ag45dBoundary.next_stage_id !== "AG45E") fail("AG45D boundary must point to AG45E.");

if (review.status !== "image_link_attribution_safety_model_ready_for_ag45f") fail("Review status mismatch.");
if (review.summary.ag45e_image_link_attribution_safety_recorded !== true) fail("AG45E summary flag missing.");
if (review.summary.link_safety_model_recorded !== true) fail("Link safety summary missing.");
if (review.summary.thumbnail_image_safety_model_recorded !== true) fail("Thumbnail/image safety summary missing.");
if (review.summary.attribution_credit_display_model_recorded !== true) fail("Attribution credit summary missing.");
if (review.summary.external_asset_no_download_policy_recorded !== true) fail("No-download policy summary missing.");
if (review.summary.verification_status_bands_recorded !== true) fail("Verification bands summary missing.");
if (review.summary.ready_for_ag45f !== true) fail("AG45F readiness missing.");
if (review.summary.hard_blocker_count_for_ag45f !== 0) fail("AG45F blocker count must be zero.");
if (review.summary.external_link_verification_executed !== false) fail("External link verification must remain false.");
if (review.summary.image_fetch_executed !== false) fail("Image fetch must remain false.");
if (review.summary.thumbnail_fetch_executed !== false) fail("Thumbnail fetch must remain false.");
if (review.summary.video_fetch_executed !== false) fail("Video fetch must remain false.");
if (review.summary.image_downloaded_or_rehosted !== false) fail("Image download/rehost must remain false.");
if (review.summary.video_downloaded_or_rehosted !== false) fail("Video download/rehost must remain false.");
if (review.summary.homepage_mutated !== false) fail("Homepage mutation must remain false.");
if (review.summary.database_write_performed !== false) fail("Database write must remain false.");

if (linkSafetyModel.status !== "source_link_canonical_url_safety_model_recorded") fail("Link safety status mismatch.");
for (const field of ["source_url", "canonical_url", "verification_status", "safety_status"]) {
  if (!linkSafetyModel.planned_fields.includes(field)) fail(`Link safety planned field missing: ${field}`);
}
if (linkSafetyModel.live_link_verification_now !== false) fail("Live link verification must be false.");
if (!JSON.stringify(linkSafetyModel.rules).includes("do not fetch or verify links in AG45E")) fail("No link fetch/verify rule missing.");

if (thumbnailImageSafetyModel.status !== "thumbnail_image_safety_model_recorded") fail("Thumbnail image safety status mismatch.");
if (thumbnailImageSafetyModel.image_fetch_now !== false) fail("Image fetch must be false.");
if (!JSON.stringify(thumbnailImageSafetyModel.safety_rules).includes("Do not download or store publisher images in AG45E")) fail("No publisher image download rule missing.");
if (!JSON.stringify(thumbnailImageSafetyModel.safety_rules).includes("adult, explicit")) fail("Adult/explicit imagery guard missing.");
if (!JSON.stringify(thumbnailImageSafetyModel.source_types).includes("drishvara_editorial_synthesis")) fail("Drishvara editorial synthesis source type missing.");

if (attributionCreditModel.status !== "attribution_credit_display_model_recorded") fail("Attribution credit status mismatch.");
if (!JSON.stringify(attributionCreditModel.display_rules).includes("Visual: Drishvara editorial synthesis")) fail("Drishvara visual credit rule missing.");
if (!JSON.stringify(attributionCreditModel.display_rules).includes("under editorial verification")) fail("Editorial verification rule missing.");
if (!JSON.stringify(attributionCreditModel.public_credit_templates).includes("Source: [Publisher]")) fail("Source publisher credit template missing.");

if (externalAssetPolicy.status !== "external_asset_no_download_policy_recorded") fail("External asset policy status mismatch.");
for (const phrase of ["No third-party image", "No publisher page is scraped", "No link-preview extraction", "No video embedding"]) {
  if (!JSON.stringify(externalAssetPolicy.policy_rules).includes(phrase)) fail(`External asset policy phrase missing: ${phrase}`);
}
if (!externalAssetPolicy.blocked_now.includes("image download")) fail("Image download blocked-now rule missing.");
if (!externalAssetPolicy.blocked_now.includes("video download")) fail("Video download blocked-now rule missing.");

if (verificationStatusModel.status !== "verification_status_bands_model_recorded") fail("Verification status model mismatch.");
for (const status of ["verified", "under_editorial_verification", "metadata_only_not_fetched", "unsafe_or_excluded"]) {
  if (!JSON.stringify(verificationStatusModel.bands).includes(status)) fail(`Verification status missing: ${status}`);
}
if (verificationStatusModel.default_status_for_ag45e !== "metadata_only_not_fetched") fail("Default status must be metadata_only_not_fetched.");

if (imageReferenceGovernanceConsumption.status !== "image_reference_governance_consumed_where_available") fail("Image/reference governance consumption status mismatch.");
if (!JSON.stringify(imageReferenceGovernanceConsumption.consumption_rules).includes("Do not duplicate earlier image/reference credit modules")) fail("No-duplicate image/reference rule missing.");
if (!JSON.stringify(imageReferenceGovernanceConsumption.consumption_rules).includes("Reference fetching remains blocked")) fail("Reference fetch blocked rule missing.");

if (noMutationAudit.status !== "no_mutation_audit_passed_for_ag45e") fail("No-mutation audit status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");
for (const check of noMutationAudit.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (readiness.ready_for_ag45f !== true) fail("Readiness must permit AG45F.");
if (readiness.next_stage_id !== "AG45F") fail("Readiness next stage must be AG45F.");
if (readiness.daily_signal_fetch_allowed_next !== false) fail("Daily signal fetch must remain blocked.");
if (readiness.news_scraping_allowed_next !== false) fail("News scraping must remain blocked.");
if (readiness.external_link_verification_allowed_next !== false) fail("External link verification must remain blocked.");
if (readiness.image_fetch_allowed_next !== false) fail("Image fetch must remain blocked.");
if (readiness.thumbnail_fetch_allowed_next !== false) fail("Thumbnail fetch must remain blocked.");
if (readiness.video_fetch_allowed_next !== false) fail("Video fetch must remain blocked.");
if (readiness.video_popup_activation_allowed_next !== false) fail("Video popup activation must remain blocked.");
if (readiness.homepage_mutation_allowed_next !== false) fail("Homepage mutation must remain blocked.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain blocked.");
if (readiness.backend_activation_allowed_next !== false) fail("Backend activation must remain blocked.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG45F") fail("Boundary must point to AG45F.");

if (preview.ag45e_image_link_attribution_safety_recorded !== 1) fail("Preview AG45E flag missing.");
if (preview.link_safety_model_recorded !== 1) fail("Preview link safety flag missing.");
if (preview.thumbnail_image_safety_model_recorded !== 1) fail("Preview image safety flag missing.");
if (preview.attribution_credit_display_model_recorded !== 1) fail("Preview attribution flag missing.");
if (preview.external_asset_no_download_policy_recorded !== 1) fail("Preview no-download flag missing.");
if (preview.verification_status_bands_recorded !== 1) fail("Preview verification bands flag missing.");
if (preview.ready_for_ag45f !== 1) fail("Preview AG45F readiness missing.");
if (preview.external_link_verification_executed !== 0) fail("Preview link verification must be zero.");
if (preview.image_fetch_executed !== 0) fail("Preview image fetch must be zero.");
if (preview.thumbnail_fetch_executed !== 0) fail("Preview thumbnail fetch must be zero.");
if (preview.video_fetch_executed !== 0) fail("Preview video fetch must be zero.");
if (preview.image_downloaded_or_rehosted !== 0) fail("Preview image download/rehost must be zero.");
if (preview.video_downloaded_or_rehosted !== 0) fail("Preview video download/rehost must be zero.");
if (preview.homepage_mutated !== 0) fail("Preview homepage mutation must be zero.");
if (preview.database_write_performed !== 0) fail("Preview DB write must be zero.");
if (preview.backend_auth_supabase_activation_performed !== 0) fail("Preview backend activation must be zero.");
if (preview.deployment_performed !== 0) fail("Preview deployment must be zero.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be zero.");

if (!pkg.scripts?.["generate:ag45e"]) fail("Missing package script: generate:ag45e");
if (!pkg.scripts?.["validate:ag45e"]) fail("Missing package script: validate:ag45e");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag45e")) fail("validate:project must include validate:ag45e.");

pass("AG45E Image, Thumbnail, Link and Attribution Safety Model is present.");
pass("AG45D title/subtitle/metadata rules are consumed.");
pass("Source link and canonical URL safety model is valid.");
pass("Thumbnail/image safety and no-download/no-rehost policy are valid.");
pass("Attribution and credit display model is valid.");
pass("Verification status bands are valid.");
pass("Existing image/reference governance is consumed without duplication where available.");
pass("No-mutation audit is valid.");
pass("AG45F Video-of-the-Day Selection, Safety and Credit Model readiness is valid.");
pass("No live fetch, scraping, link verification, image/video fetch, download/rehost, homepage mutation, database/backend activation, deployment or service-role exposure is recorded.");
