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
  console.error(`❌ AG45G validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

const required = [
  "data/content-intelligence/homepage/ag45a-first-light-ui-space-model.json",
  "data/content-intelligence/homepage/ag45a-card-transition-doctrine.json",
  "data/content-intelligence/daily-surface/ag45c-daily-signal-selection-model.json",
  "data/content-intelligence/daily-surface/ag45d-signal-card-copy-template-model.json",
  "data/content-intelligence/daily-surface/ag45e-attribution-credit-display-model.json",
  "data/content-intelligence/quality-reviews/ag45f-video-of-the-day-safety-credit.json",
  "data/content-intelligence/homepage/ag45f-video-popup-behaviour-model.json",
  "data/content-intelligence/backend-architecture/ag45f-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag45f-homepage-card-transition-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag45f-to-ag45g-homepage-card-transition-boundary.json",

  "data/content-intelligence/quality-reviews/ag45g-homepage-card-transition-behaviour.json",
  "data/content-intelligence/homepage/ag45g-homepage-daily-signal-space-model.json",
  "data/content-intelligence/homepage/ag45g-first-light-entry-model.json",
  "data/content-intelligence/homepage/ag45g-card-transition-behaviour-model.json",
  "data/content-intelligence/homepage/ag45g-signal-card-grouping-model.json",
  "data/content-intelligence/homepage/ag45g-video-popup-integration-plan.json",
  "data/content-intelligence/homepage/ag45g-no-layout-shift-audit.json",
  "data/content-intelligence/backend-architecture/ag45g-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag45g-backend-metadata-pattern-schema-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag45g-to-ag45h-backend-metadata-pattern-schema-boundary.json",
  "data/quality/ag45g-homepage-card-transition-behaviour.json",
  "data/quality/ag45g-homepage-card-transition-behaviour-preview.json",
  "docs/quality/AG45G_HOMEPAGE_CARD_TRANSITION_BEHAVIOUR.md",
  "scripts/generate-ag45g-homepage-card-transition-behaviour.mjs",
  "scripts/validate-ag45g-homepage-card-transition-behaviour.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag45aFirstLightModel = readJson("data/content-intelligence/homepage/ag45a-first-light-ui-space-model.json");
const ag45aTransitionDoctrine = readJson("data/content-intelligence/homepage/ag45a-card-transition-doctrine.json");
const ag45cSelectionModel = readJson("data/content-intelligence/daily-surface/ag45c-daily-signal-selection-model.json");
const ag45dCardCopyTemplate = readJson("data/content-intelligence/daily-surface/ag45d-signal-card-copy-template-model.json");
const ag45eAttributionCreditModel = readJson("data/content-intelligence/daily-surface/ag45e-attribution-credit-display-model.json");
const ag45fReview = readJson("data/content-intelligence/quality-reviews/ag45f-video-of-the-day-safety-credit.json");
const ag45fPopupBehaviourModel = readJson("data/content-intelligence/homepage/ag45f-video-popup-behaviour-model.json");
const ag45fNoMutationAudit = readJson("data/content-intelligence/backend-architecture/ag45f-no-mutation-audit-register.json");
const ag45fReadiness = readJson("data/content-intelligence/quality-registry/ag45f-homepage-card-transition-readiness-record.json");
const ag45fBoundary = readJson("data/content-intelligence/mutation-plans/ag45f-to-ag45g-homepage-card-transition-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ag45g-homepage-card-transition-behaviour.json");
const homepageSpaceModel = readJson("data/content-intelligence/homepage/ag45g-homepage-daily-signal-space-model.json");
const firstLightEntryModel = readJson("data/content-intelligence/homepage/ag45g-first-light-entry-model.json");
const cardTransitionModel = readJson("data/content-intelligence/homepage/ag45g-card-transition-behaviour-model.json");
const cardGroupingModel = readJson("data/content-intelligence/homepage/ag45g-signal-card-grouping-model.json");
const videoPopupIntegrationPlan = readJson("data/content-intelligence/homepage/ag45g-video-popup-integration-plan.json");
const noLayoutShiftAudit = readJson("data/content-intelligence/homepage/ag45g-no-layout-shift-audit.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/ag45g-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag45g-backend-metadata-pattern-schema-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag45g-to-ag45h-backend-metadata-pattern-schema-boundary.json");
const preview = readJson("data/quality/ag45g-homepage-card-transition-behaviour-preview.json");
const pkg = readJson("package.json");

if (ag45aFirstLightModel.intended_visible_surface.visible_card_count_at_once !== 3) fail("AG45A visible card count must be 3.");
if (ag45aFirstLightModel.intended_visible_surface.full_signal_count_stored !== 10) fail("AG45A stored signal count must be 10.");
for (const transition of ["Blinds", "Peel-off", "Ripple"]) {
  if (!ag45aTransitionDoctrine.transition_options.includes(transition)) fail(`AG45A transition missing: ${transition}`);
}
if (ag45cSelectionModel.selection_count.total_daily_signals !== 10) fail("AG45C total signal count must be 10.");
if (ag45dCardCopyTemplate.compact_card_constraints.fixed_height_container !== true) fail("AG45D fixed-height container rule missing.");
if (!JSON.stringify(ag45eAttributionCreditModel).includes("Source: [Publisher]")) fail("AG45E publisher source credit missing.");
if (ag45fReview.status !== "video_of_the_day_safety_credit_model_ready_for_ag45g") fail("AG45F review status mismatch.");
if (ag45fReview.summary.ready_for_ag45g !== true) fail("AG45F readiness summary missing.");
if (ag45fPopupBehaviourModel.activate_popup_now !== false) fail("AG45F popup must remain inactive.");
if (ag45fPopupBehaviourModel.mutate_homepage_now !== false) fail("AG45F homepage mutation must remain false.");
if (ag45fNoMutationAudit.status !== "no_mutation_audit_passed_for_ag45f") fail("AG45F no-mutation audit mismatch.");
if (ag45fReadiness.ready_for_ag45g !== true) fail("AG45F readiness must permit AG45G.");
if (ag45fBoundary.next_stage_id !== "AG45G") fail("AG45F boundary must point to AG45G.");

if (review.status !== "homepage_card_transition_behaviour_ready_for_ag45h") fail("Review status mismatch.");
if (review.summary.ag45g_homepage_card_transition_behaviour_recorded !== true) fail("AG45G summary flag missing.");
if (review.summary.homepage_space_model_recorded !== true) fail("Homepage space summary missing.");
if (review.summary.first_light_entry_model_recorded !== true) fail("First Light entry summary missing.");
if (review.summary.card_transition_behaviour_model_recorded !== true) fail("Card transition summary missing.");
if (review.summary.signal_card_grouping_model_recorded !== true) fail("Card grouping summary missing.");
if (review.summary.video_popup_integration_plan_recorded !== true) fail("Video popup integration summary missing.");
if (review.summary.no_layout_shift_audit_recorded !== true) fail("No-layout-shift audit summary missing.");
if (review.summary.ready_for_ag45h !== true) fail("AG45H readiness missing.");
if (review.summary.hard_blocker_count_for_ag45h !== 0) fail("AG45H blocker count must be zero.");
if (review.summary.live_transition_activation_executed !== false) fail("Live transition activation must remain false.");
if (review.summary.video_popup_activated !== false) fail("Popup activation must remain false.");
if (review.summary.homepage_mutated !== false) fail("Homepage mutation must remain false.");
if (review.summary.homepage_runtime_script_mutated !== false) fail("Runtime script mutation must remain false.");
if (review.summary.css_mutated !== false) fail("CSS mutation must remain false.");
if (review.summary.public_card_rendering_activated !== false) fail("Public card rendering must remain false.");
if (review.summary.database_write_performed !== false) fail("Database write must remain false.");

if (homepageSpaceModel.status !== "homepage_daily_signal_space_model_recorded") fail("Homepage space model status mismatch.");
if (homepageSpaceModel.existing_homepage_fit.hero_area_preserved !== true) fail("Hero area must be preserved.");
if (homepageSpaceModel.existing_homepage_fit.first_light_box_remains_compact_entry_point !== true) fail("First Light compact entry missing.");
if (!JSON.stringify(homepageSpaceModel.allotted_space_rules).includes("Only 3 signal cards are visible at once")) fail("3 visible cards rule missing.");
if (!JSON.stringify(homepageSpaceModel.allotted_space_rules).includes("All 10 signals are stored")) fail("10 stored signals rule missing.");
if (homepageSpaceModel.activate_now !== false) fail("Homepage space must not activate now.");

if (firstLightEntryModel.status !== "first_light_entry_model_recorded") fail("First Light entry status mismatch.");
if (firstLightEntryModel.compact_entry_copy_model.headline !== "Today’s 10 Signals") fail("First Light headline mismatch.");
if (!firstLightEntryModel.compact_entry_copy_model.subline.includes("Northeast Watch")) fail("Northeast Watch missing in compact entry.");
if (firstLightEntryModel.activate_now !== false) fail("First Light entry must not activate now.");

if (cardTransitionModel.status !== "card_transition_behaviour_model_recorded") fail("Card transition status mismatch.");
for (const transition of ["Blinds", "Peel-off", "Ripple"]) {
  if (!cardTransitionModel.transition_options.includes(transition)) fail(`AG45G transition missing: ${transition}`);
}
if (cardTransitionModel.deterministic_rotation_rule["dayIndex % 3 = 0"] !== "Blinds") fail("Blinds dayIndex rule missing.");
if (cardTransitionModel.deterministic_rotation_rule["dayIndex % 3 = 1"] !== "Peel-off") fail("Peel-off dayIndex rule missing.");
if (cardTransitionModel.deterministic_rotation_rule["dayIndex % 3 = 2"] !== "Ripple") fail("Ripple dayIndex rule missing.");
if (cardTransitionModel.live_transition_activation_now !== false) fail("Transition activation must remain false.");
if (!JSON.stringify(cardTransitionModel.behaviour_rules).includes("inside the Daily Signal card container")) fail("Inside card container rule missing.");

if (cardGroupingModel.status !== "signal_card_grouping_model_recorded") fail("Card grouping status mismatch.");
if (cardGroupingModel.total_signal_count !== 10) fail("Card grouping total signal count must be 10.");
if (cardGroupingModel.visible_cards_at_once !== 3) fail("Visible cards at once must be 3.");
if (!JSON.stringify(cardGroupingModel.planned_groups).includes("Northeast Watch")) fail("Northeast Watch planned group missing.");
if (cardGroupingModel.activate_now !== false) fail("Card grouping must not activate now.");

if (videoPopupIntegrationPlan.status !== "video_popup_integration_plan_recorded_planning_only") fail("Video popup integration status mismatch.");
if (videoPopupIntegrationPlan.activate_popup_now !== false) fail("Popup activation must be false.");
if (videoPopupIntegrationPlan.mutate_homepage_now !== false) fail("Popup must not mutate homepage.");
if (!JSON.stringify(videoPopupIntegrationPlan.integration_rules).includes("No video fetch, embed, popup or runtime code")) fail("No video fetch/embed/popup/runtime rule missing.");

if (noLayoutShiftAudit.status !== "no_layout_shift_audit_passed_for_ag45g") fail("No-layout-shift audit status mismatch.");
if (noLayoutShiftAudit.audit_passed !== true) fail("No-layout-shift audit must pass.");
if (noLayoutShiftAudit.failed_checks.length !== 0) fail("No-layout-shift failed checks must be zero.");
for (const check of noLayoutShiftAudit.checks) {
  if (check.passed !== true) fail(`No-layout-shift check failed: ${check.check_id}`);
}

if (noMutationAudit.status !== "no_mutation_audit_passed_for_ag45g") fail("No-mutation audit status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");
for (const check of noMutationAudit.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (readiness.ready_for_ag45h !== true) fail("Readiness must permit AG45H.");
if (readiness.next_stage_id !== "AG45H") fail("Readiness next stage must be AG45H.");
if (readiness.homepage_mutation_allowed_next !== false) fail("Homepage mutation must remain blocked.");
if (readiness.runtime_script_mutation_allowed_next !== false) fail("Runtime script mutation must remain blocked.");
if (readiness.public_activation_allowed_next !== false) fail("Public activation must remain blocked.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain blocked.");
if (readiness.backend_activation_allowed_next !== false) fail("Backend activation must remain blocked.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG45H") fail("Boundary must point to AG45H.");

if (preview.ag45g_homepage_card_transition_behaviour_recorded !== 1) fail("Preview AG45G flag missing.");
if (preview.homepage_space_model_recorded !== 1) fail("Preview homepage space flag missing.");
if (preview.first_light_entry_model_recorded !== 1) fail("Preview First Light flag missing.");
if (preview.card_transition_behaviour_model_recorded !== 1) fail("Preview transition flag missing.");
if (preview.signal_card_grouping_model_recorded !== 1) fail("Preview grouping flag missing.");
if (preview.video_popup_integration_plan_recorded !== 1) fail("Preview popup plan flag missing.");
if (preview.no_layout_shift_audit_recorded !== 1) fail("Preview layout-shift audit flag missing.");
if (preview.ready_for_ag45h !== 1) fail("Preview AG45H readiness missing.");
if (preview.live_transition_activation_executed !== 0) fail("Preview live transition activation must be zero.");
if (preview.video_popup_activated !== 0) fail("Preview popup activation must be zero.");
if (preview.homepage_mutated !== 0) fail("Preview homepage mutation must be zero.");
if (preview.homepage_runtime_script_mutated !== 0) fail("Preview runtime script mutation must be zero.");
if (preview.css_mutated !== 0) fail("Preview CSS mutation must be zero.");
if (preview.public_card_rendering_activated !== 0) fail("Preview card rendering must be zero.");
if (preview.database_write_performed !== 0) fail("Preview DB write must be zero.");
if (preview.backend_auth_supabase_activation_performed !== 0) fail("Preview backend activation must be zero.");
if (preview.deployment_performed !== 0) fail("Preview deployment must be zero.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be zero.");

if (!pkg.scripts?.["generate:ag45g"]) fail("Missing package script: generate:ag45g");
if (!pkg.scripts?.["validate:ag45g"]) fail("Missing package script: validate:ag45g");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag45g")) fail("validate:project must include validate:ag45g.");

pass("AG45G Homepage Signal Card and Transition Behaviour Plan is present.");
pass("AG45A First Light/transition doctrine and AG45F video popup planning are consumed.");
pass("Homepage fixed-space model is valid.");
pass("First Light compact entry model is valid.");
pass("Blinds / Peel-off / Ripple transition behaviour is valid.");
pass("Signal card grouping preserves 3 visible cards and 10 stored signals.");
pass("Video popup integration remains planning-only.");
pass("No-layout-shift audit is valid.");
pass("No-mutation audit is valid.");
pass("AG45H Backend Metadata and Yearly Pattern-Study Schema readiness is valid.");
pass("No transition activation, popup activation, homepage/CSS/runtime mutation, database/backend activation, deployment or service-role exposure is recorded.");
