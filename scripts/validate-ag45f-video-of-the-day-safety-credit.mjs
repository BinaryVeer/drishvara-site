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
  console.error(`❌ AG45F validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

const required = [
  "data/content-intelligence/daily-surface/ag45a-video-of-the-day-doctrine.json",
  "data/content-intelligence/backend-architecture/ag45a-daily-signal-metadata-schema-plan.json",
  "data/content-intelligence/daily-surface/ag45b-source-tier-risk-register.json",
  "data/content-intelligence/quality-reviews/ag45e-image-link-attribution-safety.json",
  "data/content-intelligence/daily-surface/ag45e-external-asset-no-download-policy.json",
  "data/content-intelligence/daily-surface/ag45e-attribution-credit-display-model.json",
  "data/content-intelligence/daily-surface/ag45e-verification-status-bands-model.json",
  "data/content-intelligence/backend-architecture/ag45e-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag45e-video-of-the-day-safety-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag45e-to-ag45f-video-of-the-day-safety-boundary.json",

  "data/content-intelligence/quality-reviews/ag45f-video-of-the-day-safety-credit.json",
  "data/content-intelligence/daily-surface/ag45f-video-of-the-day-selection-model.json",
  "data/content-intelligence/daily-surface/ag45f-video-regional-rotation-model.json",
  "data/content-intelligence/daily-surface/ag45f-video-creator-source-safety-model.json",
  "data/content-intelligence/homepage/ag45f-video-popup-behaviour-model.json",
  "data/content-intelligence/daily-surface/ag45f-video-credit-attribution-model.json",
  "data/content-intelligence/daily-surface/ag45f-future-video-generator-source-learning-model.json",
  "data/content-intelligence/backend-architecture/ag45f-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag45f-homepage-card-transition-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag45f-to-ag45g-homepage-card-transition-boundary.json",
  "data/quality/ag45f-video-of-the-day-safety-credit.json",
  "data/quality/ag45f-video-of-the-day-safety-credit-preview.json",
  "docs/quality/AG45F_VIDEO_OF_THE_DAY_SAFETY_CREDIT.md",
  "scripts/generate-ag45f-video-of-the-day-safety-credit.mjs",
  "scripts/validate-ag45f-video-of-the-day-safety-credit.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag45aVideoDoctrine = readJson("data/content-intelligence/daily-surface/ag45a-video-of-the-day-doctrine.json");
const ag45aBackendSchemaPlan = readJson("data/content-intelligence/backend-architecture/ag45a-daily-signal-metadata-schema-plan.json");
const ag45bTierRiskRegister = readJson("data/content-intelligence/daily-surface/ag45b-source-tier-risk-register.json");
const ag45eReview = readJson("data/content-intelligence/quality-reviews/ag45e-image-link-attribution-safety.json");
const ag45eExternalAssetPolicy = readJson("data/content-intelligence/daily-surface/ag45e-external-asset-no-download-policy.json");
const ag45eAttributionCreditModel = readJson("data/content-intelligence/daily-surface/ag45e-attribution-credit-display-model.json");
const ag45eVerificationStatusModel = readJson("data/content-intelligence/daily-surface/ag45e-verification-status-bands-model.json");
const ag45eNoMutationAudit = readJson("data/content-intelligence/backend-architecture/ag45e-no-mutation-audit-register.json");
const ag45eReadiness = readJson("data/content-intelligence/quality-registry/ag45e-video-of-the-day-safety-readiness-record.json");
const ag45eBoundary = readJson("data/content-intelligence/mutation-plans/ag45e-to-ag45f-video-of-the-day-safety-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ag45f-video-of-the-day-safety-credit.json");
const videoSelectionModel = readJson("data/content-intelligence/daily-surface/ag45f-video-of-the-day-selection-model.json");
const regionalRotationModel = readJson("data/content-intelligence/daily-surface/ag45f-video-regional-rotation-model.json");
const creatorSafetyModel = readJson("data/content-intelligence/daily-surface/ag45f-video-creator-source-safety-model.json");
const popupBehaviourModel = readJson("data/content-intelligence/homepage/ag45f-video-popup-behaviour-model.json");
const creditAttributionModel = readJson("data/content-intelligence/daily-surface/ag45f-video-credit-attribution-model.json");
const futureVideoGeneratorSourceModel = readJson("data/content-intelligence/daily-surface/ag45f-future-video-generator-source-learning-model.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/ag45f-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag45f-homepage-card-transition-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag45f-to-ag45g-homepage-card-transition-boundary.json");
const preview = readJson("data/quality/ag45f-video-of-the-day-safety-credit-preview.json");
const pkg = readJson("package.json");

if (!JSON.stringify(ag45aVideoDoctrine).includes("once per visitor per day")) fail("AG45A video doctrine must include once-per-day rule.");
if (!JSON.stringify(ag45aVideoDoctrine).includes("Premanand Ji")) fail("AG45A spiritual clip planning missing.");
for (const field of ["video_url", "video_creator", "video_credit"]) {
  if (!ag45aBackendSchemaPlan.planned_fields.includes(field)) fail(`AG45A backend schema missing ${field}.`);
}
if (!JSON.stringify(ag45bTierRiskRegister).includes("adult or explicit content")) fail("AG45B adult/explicit restriction missing.");
if (ag45eReview.status !== "image_link_attribution_safety_model_ready_for_ag45f") fail("AG45E review status mismatch.");
if (ag45eReview.summary.ready_for_ag45f !== true) fail("AG45E readiness summary missing.");
if (!JSON.stringify(ag45eExternalAssetPolicy).includes("No video embedding")) fail("AG45E no video embedding rule missing.");
if (!JSON.stringify(ag45eAttributionCreditModel).includes("credit")) fail("AG45E credit model missing.");
if (ag45eVerificationStatusModel.default_status_for_ag45e !== "metadata_only_not_fetched") fail("AG45E default status mismatch.");
if (ag45eNoMutationAudit.status !== "no_mutation_audit_passed_for_ag45e") fail("AG45E no-mutation audit mismatch.");
if (ag45eReadiness.ready_for_ag45f !== true) fail("AG45E readiness must permit AG45F.");
if (ag45eBoundary.next_stage_id !== "AG45F") fail("AG45E boundary must point to AG45F.");

if (review.status !== "video_of_the_day_safety_credit_model_ready_for_ag45g") fail("Review status mismatch.");
if (review.summary.ag45f_video_of_the_day_safety_credit_recorded !== true) fail("AG45F summary flag missing.");
if (review.summary.video_selection_model_recorded !== true) fail("Video selection summary missing.");
if (review.summary.regional_rotation_model_recorded !== true) fail("Regional rotation summary missing.");
if (review.summary.creator_source_safety_model_recorded !== true) fail("Creator safety summary missing.");
if (review.summary.popup_behaviour_model_recorded !== true) fail("Popup behaviour summary missing.");
if (review.summary.video_credit_attribution_model_recorded !== true) fail("Video credit summary missing.");
if (review.summary.future_video_generator_source_learning_model_recorded !== true) fail("Future generator model summary missing.");
if (review.summary.ready_for_ag45g !== true) fail("AG45G readiness missing.");
if (review.summary.hard_blocker_count_for_ag45g !== 0) fail("AG45G blocker count must be zero.");
if (review.summary.video_fetch_executed !== false) fail("Video fetch must remain false.");
if (review.summary.video_downloaded_or_rehosted !== false) fail("Video download/rehost must remain false.");
if (review.summary.video_embed_created !== false) fail("Video embed must remain false.");
if (review.summary.video_popup_activated !== false) fail("Popup activation must remain false.");
if (review.summary.video_generation_executed !== false) fail("Video generation must remain false.");
if (review.summary.homepage_mutated !== false) fail("Homepage mutation must remain false.");
if (review.summary.database_write_performed !== false) fail("Database write must remain false.");

if (videoSelectionModel.status !== "video_of_the_day_selection_model_recorded") fail("Video selection model status mismatch.");
if (videoSelectionModel.activate_now !== false) fail("Video selection must not activate now.");
if (!JSON.stringify(videoSelectionModel.selection_principles).includes("adult, explicit")) fail("Adult/explicit safety rule missing.");
if (!JSON.stringify(videoSelectionModel.selection_principles).includes("metadata-only")) fail("Metadata-only rule missing.");
if (!JSON.stringify(videoSelectionModel.selection_principles).includes("Video generator integration remains future-only")) fail("Future-only generator rule missing.");
if (!videoSelectionModel.preferred_video_types.includes("Northeast India visibility moment")) fail("Northeast video type missing.");

if (regionalRotationModel.status !== "video_regional_rotation_model_recorded") fail("Regional rotation status mismatch.");
if (regionalRotationModel.weekly_rotation.india_days_per_week !== 4) fail("India video rotation days must be 4.");
if (regionalRotationModel.weekly_rotation.world_days_per_week !== 3) fail("World video rotation days must be 3.");
if (!regionalRotationModel.weekly_rotation.india_rotation.includes("Northeast India")) fail("Northeast rotation missing.");
if (!JSON.stringify(regionalRotationModel.monthly_special_handling).includes("2–3 days/month")) fail("Spiritual clip monthly limit missing.");
if (!JSON.stringify(regionalRotationModel.monthly_special_handling).includes("Premanand Ji")) fail("Premanand Ji handling missing.");

if (creatorSafetyModel.status !== "video_creator_source_safety_model_recorded") fail("Creator safety status mismatch.");
if (creatorSafetyModel.default_status_for_ag45f !== "under_editorial_verification") fail("Creator default status mismatch.");
if (creatorSafetyModel.live_creator_check_now !== false) fail("Live creator check must be false.");
if (!JSON.stringify(creatorSafetyModel.creator_exclusion_indicators).includes("adult or explicit content creator")) fail("Adult/explicit creator exclusion missing.");
if (!JSON.stringify(creatorSafetyModel.creator_exclusion_indicators).includes("copyright-unsafe")) fail("Copyright-unsafe creator exclusion missing.");

if (popupBehaviourModel.status !== "video_popup_behaviour_model_recorded_planning_only") fail("Popup behaviour status mismatch.");
if (popupBehaviourModel.future_public_behaviour.show_frequency !== "once per visitor per day") fail("Popup frequency rule mismatch.");
if (popupBehaviourModel.future_public_behaviour.muted_by_default !== true) fail("Popup muted default missing.");
if (popupBehaviourModel.future_public_behaviour.skippable !== true) fail("Popup skippable rule missing.");
if (popupBehaviourModel.activate_popup_now !== false) fail("Popup activation must be false.");
if (popupBehaviourModel.mutate_homepage_now !== false) fail("Homepage mutation must be false.");

if (creditAttributionModel.status !== "video_credit_attribution_model_recorded") fail("Credit attribution status mismatch.");
for (const field of ["video_url", "video_creator", "video_credit", "video_source_url", "video_rights_status"]) {
  if (!creditAttributionModel.planned_fields.includes(field)) fail(`Video credit field missing: ${field}`);
}
if (!JSON.stringify(creditAttributionModel.public_credit_templates).includes("Video: [Creator/Channel]")) fail("Video creator credit template missing.");
if (!JSON.stringify(creditAttributionModel.rules).includes("Creator/channel name must not be invented")) fail("No invented creator rule missing.");

if (futureVideoGeneratorSourceModel.status !== "future_video_generator_source_learning_model_recorded") fail("Future generator model status mismatch.");
if (futureVideoGeneratorSourceModel.metadata_only_now !== true) fail("Future generator model must be metadata-only now.");
if (!JSON.stringify(futureVideoGeneratorSourceModel.future_generator_constraints).includes("No video generation is executed in AG45F")) fail("No video generation rule missing.");
if (!JSON.stringify(futureVideoGeneratorSourceModel.future_generator_constraints).includes("No source video is downloaded")) fail("No source video download rule missing.");
if (!JSON.stringify(futureVideoGeneratorSourceModel.future_generator_constraints).includes("must not imitate living creators")) fail("Living creator imitation guard missing.");

if (noMutationAudit.status !== "no_mutation_audit_passed_for_ag45f") fail("No-mutation audit status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");
for (const check of noMutationAudit.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (readiness.ready_for_ag45g !== true) fail("Readiness must permit AG45G.");
if (readiness.next_stage_id !== "AG45G") fail("Readiness next stage must be AG45G.");
if (readiness.video_fetch_allowed_next !== false) fail("Video fetch must remain blocked.");
if (readiness.video_popup_activation_allowed_next !== false) fail("Video popup activation must remain blocked.");
if (readiness.homepage_mutation_allowed_next !== false) fail("Homepage mutation must remain blocked.");
if (readiness.runtime_script_mutation_allowed_next !== false) fail("Runtime script mutation must remain blocked.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain blocked.");
if (readiness.backend_activation_allowed_next !== false) fail("Backend activation must remain blocked.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG45G") fail("Boundary must point to AG45G.");

if (preview.ag45f_video_of_the_day_safety_credit_recorded !== 1) fail("Preview AG45F flag missing.");
if (preview.video_selection_model_recorded !== 1) fail("Preview video selection flag missing.");
if (preview.regional_rotation_model_recorded !== 1) fail("Preview regional rotation flag missing.");
if (preview.creator_source_safety_model_recorded !== 1) fail("Preview creator safety flag missing.");
if (preview.popup_behaviour_model_recorded !== 1) fail("Preview popup behaviour flag missing.");
if (preview.video_credit_attribution_model_recorded !== 1) fail("Preview credit flag missing.");
if (preview.future_video_generator_source_learning_model_recorded !== 1) fail("Preview future generator flag missing.");
if (preview.ready_for_ag45g !== 1) fail("Preview AG45G readiness missing.");
if (preview.video_fetch_executed !== 0) fail("Preview video fetch must be zero.");
if (preview.video_downloaded_or_rehosted !== 0) fail("Preview video download/rehost must be zero.");
if (preview.video_embed_created !== 0) fail("Preview video embed must be zero.");
if (preview.video_popup_activated !== 0) fail("Preview popup activation must be zero.");
if (preview.video_generation_executed !== 0) fail("Preview video generation must be zero.");
if (preview.homepage_mutated !== 0) fail("Preview homepage mutation must be zero.");
if (preview.homepage_runtime_script_mutated !== 0) fail("Preview runtime script mutation must be zero.");
if (preview.database_write_performed !== 0) fail("Preview DB write must be zero.");
if (preview.backend_auth_supabase_activation_performed !== 0) fail("Preview backend activation must be zero.");
if (preview.deployment_performed !== 0) fail("Preview deployment must be zero.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be zero.");

if (!pkg.scripts?.["generate:ag45f"]) fail("Missing package script: generate:ag45f");
if (!pkg.scripts?.["validate:ag45f"]) fail("Missing package script: validate:ag45f");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag45f")) fail("validate:project must include validate:ag45f.");

pass("AG45F Video-of-the-Day Selection, Safety and Credit Model is present.");
pass("AG45A video doctrine and AG45E external asset safety rules are consumed.");
pass("Video selection, regional rotation and spiritual reflection handling are valid.");
pass("Creator/source safety model is valid.");
pass("Popup behaviour model is planning-only and non-activating.");
pass("Video credit and attribution model is valid.");
pass("Future video generator source-learning model is metadata-only and non-generative.");
pass("No-mutation audit is valid.");
pass("AG45G Homepage Signal Card and Transition Behaviour Plan readiness is valid.");
pass("No video fetch, scraping, download/rehost, embed, popup activation, generation, homepage mutation, database/backend activation, deployment or service-role exposure is recorded.");
