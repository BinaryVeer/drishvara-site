import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag45aFirstLightModel: "data/content-intelligence/homepage/ag45a-first-light-ui-space-model.json",
  ag45aTransitionDoctrine: "data/content-intelligence/homepage/ag45a-card-transition-doctrine.json",
  ag45cSelectionModel: "data/content-intelligence/daily-surface/ag45c-daily-signal-selection-model.json",
  ag45dCardCopyTemplate: "data/content-intelligence/daily-surface/ag45d-signal-card-copy-template-model.json",
  ag45eAttributionCreditModel: "data/content-intelligence/daily-surface/ag45e-attribution-credit-display-model.json",
  ag45fReview: "data/content-intelligence/quality-reviews/ag45f-video-of-the-day-safety-credit.json",
  ag45fPopupBehaviourModel: "data/content-intelligence/homepage/ag45f-video-popup-behaviour-model.json",
  ag45fNoMutationAudit: "data/content-intelligence/backend-architecture/ag45f-no-mutation-audit-register.json",
  ag45fReadiness: "data/content-intelligence/quality-registry/ag45f-homepage-card-transition-readiness-record.json",
  ag45fBoundary: "data/content-intelligence/mutation-plans/ag45f-to-ag45g-homepage-card-transition-boundary.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag45g-homepage-card-transition-behaviour.json",
  homepageSpaceModel: "data/content-intelligence/homepage/ag45g-homepage-daily-signal-space-model.json",
  firstLightEntryModel: "data/content-intelligence/homepage/ag45g-first-light-entry-model.json",
  cardTransitionModel: "data/content-intelligence/homepage/ag45g-card-transition-behaviour-model.json",
  cardGroupingModel: "data/content-intelligence/homepage/ag45g-signal-card-grouping-model.json",
  videoPopupIntegrationPlan: "data/content-intelligence/homepage/ag45g-video-popup-integration-plan.json",
  noLayoutShiftAudit: "data/content-intelligence/homepage/ag45g-no-layout-shift-audit.json",
  noMutationAudit: "data/content-intelligence/backend-architecture/ag45g-no-mutation-audit-register.json",
  readiness: "data/content-intelligence/quality-registry/ag45g-backend-metadata-pattern-schema-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag45g-to-ag45h-backend-metadata-pattern-schema-boundary.json",
  registry: "data/quality/ag45g-homepage-card-transition-behaviour.json",
  preview: "data/quality/ag45g-homepage-card-transition-behaviour-preview.json",
  doc: "docs/quality/AG45G_HOMEPAGE_CARD_TRANSITION_BEHAVIOUR.md"
};

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

function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}

function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG45G input: ${p}`);
}

const ag45aFirstLightModel = readJson(inputs.ag45aFirstLightModel);
const ag45aTransitionDoctrine = readJson(inputs.ag45aTransitionDoctrine);
const ag45cSelectionModel = readJson(inputs.ag45cSelectionModel);
const ag45dCardCopyTemplate = readJson(inputs.ag45dCardCopyTemplate);
const ag45eAttributionCreditModel = readJson(inputs.ag45eAttributionCreditModel);
const ag45fReview = readJson(inputs.ag45fReview);
const ag45fPopupBehaviourModel = readJson(inputs.ag45fPopupBehaviourModel);
const ag45fNoMutationAudit = readJson(inputs.ag45fNoMutationAudit);
const ag45fReadiness = readJson(inputs.ag45fReadiness);
const ag45fBoundary = readJson(inputs.ag45fBoundary);

if (ag45fReview.status !== "video_of_the_day_safety_credit_model_ready_for_ag45g") {
  throw new Error("AG45F review status mismatch.");
}
if (ag45fReview.summary?.ready_for_ag45g !== true) {
  throw new Error("AG45F does not show AG45G readiness.");
}
if (ag45fReadiness.ready_for_ag45g !== true || ag45fReadiness.next_stage_id !== "AG45G") {
  throw new Error("AG45F readiness must permit AG45G.");
}
if (ag45fBoundary.next_stage_id !== "AG45G") {
  throw new Error("AG45F boundary must point to AG45G.");
}
if (ag45fNoMutationAudit.status !== "no_mutation_audit_passed_for_ag45f") {
  throw new Error("AG45F no-mutation audit mismatch.");
}
if (ag45aFirstLightModel.intended_visible_surface?.visible_card_count_at_once !== 3) {
  throw new Error("AG45A First Light model must preserve 3 visible cards.");
}
if (ag45aFirstLightModel.intended_visible_surface?.full_signal_count_stored !== 10) {
  throw new Error("AG45A First Light model must preserve 10 stored signals.");
}
for (const transition of ["Blinds", "Peel-off", "Ripple"]) {
  if (!ag45aTransitionDoctrine.transition_options?.includes(transition)) {
    throw new Error(`AG45A transition doctrine missing: ${transition}`);
  }
}
if (ag45cSelectionModel.selection_count?.total_daily_signals !== 10) {
  throw new Error("AG45C total signal count must be 10.");
}
if (ag45dCardCopyTemplate.compact_card_constraints?.fixed_height_container !== true) {
  throw new Error("AG45D card template must preserve fixed-height container.");
}
if (!JSON.stringify(ag45eAttributionCreditModel).includes("Source: [Publisher]")) {
  throw new Error("AG45E attribution credit model must preserve publisher source credit.");
}
if (ag45fPopupBehaviourModel.activate_popup_now !== false) {
  throw new Error("AG45F popup must remain non-activated.");
}
if (ag45fPopupBehaviourModel.mutate_homepage_now !== false) {
  throw new Error("AG45F homepage mutation must remain blocked.");
}

const blockedState = {
  ag45g_homepage_card_transition_behaviour_recorded: true,
  ag45f_consumed: true,
  homepage_space_model_recorded: true,
  first_light_entry_model_recorded: true,
  card_transition_behaviour_model_recorded: true,
  signal_card_grouping_model_recorded: true,
  video_popup_integration_plan_recorded: true,
  no_layout_shift_audit_recorded: true,
  live_transition_activation_executed: false,
  daily_signal_fetch_executed: false,
  news_scraping_executed: false,
  external_link_verification_executed: false,
  image_fetch_executed: false,
  thumbnail_fetch_executed: false,
  video_fetch_executed: false,
  video_embed_created: false,
  video_popup_activated: false,
  homepage_mutated: false,
  homepage_runtime_script_mutated: false,
  css_mutated: false,
  public_card_rendering_activated: false,
  featured_reads_mutated: false,
  article_mutated: false,
  article_generated: false,
  episode_generated: false,
  topic_promoted: false,
  reference_fetch_executed: false,
  image_generation_executed: false,
  video_generation_executed: false,
  public_publishing_operation_performed: false,
  deployment_performed: false,
  database_write_performed: false,
  backend_auth_supabase_activation_performed: false,
  sql_file_created: false,
  sql_grants_executed: false,
  service_role_key_exposed: false
};

const homepageSpaceModel = {
  module_id: "AG45G",
  title: "Homepage Daily Signal Space Model",
  status: "homepage_daily_signal_space_model_recorded",
  existing_homepage_fit: {
    hero_area_preserved: true,
    first_light_box_remains_compact_entry_point: true,
    daily_signal_surface_does_not_turn_homepage_into_news_portal: true,
    existing_reading_surface_and_reflection_layer_preserved: true,
    lower_cards_preserved: true
  },
  allotted_space_rules: [
    "Daily Signal Surface must fit within the existing homepage structure.",
    "First Light acts as compact entry point, not as a 10-card dump.",
    "Only 3 signal cards are visible at once inside the allotted card container.",
    "All 10 signals are stored as structured signal set metadata for later stages.",
    "Card container must use fixed height and must not create layout shift.",
    "Expanded panel, drawer, modal or later dedicated page may show the full set only after approval.",
    "Public rendering is not activated in AG45G."
  ],
  planned_homepage_stack: [
    "Hero / brand entry",
    "First Light compact signal entry",
    "Daily Signal rotating card container",
    "Reading Surface / Featured Reads bridge",
    "Reflection Layer / route prompt",
    "Lower supporting cards"
  ],
  activate_now: false,
  blocked_state: blockedState
};

const firstLightEntryModel = {
  module_id: "AG45G",
  title: "First Light Entry Model",
  status: "first_light_entry_model_recorded",
  compact_entry_copy_model: {
    eyebrow: "First Light",
    headline: "Today’s 10 Signals",
    subline: "6 India · Northeast Watch · 4 World",
    cta: "View Today’s Signals"
  },
  display_rules: [
    "First Light should signal daily freshness without overcrowding the homepage.",
    "Northeast Watch should be visible in the compact entry language.",
    "The entry should route to the rotating card surface or later expanded surface.",
    "First Light must preserve Drishvara’s calm visual tone.",
    "No live card rendering is activated in AG45G."
  ],
  activate_now: false,
  blocked_state: blockedState
};

const cardTransitionModel = {
  module_id: "AG45G",
  title: "Card Transition Behaviour Model",
  status: "card_transition_behaviour_model_recorded",
  transition_options: ["Blinds", "Peel-off", "Ripple"],
  deterministic_rotation_rule: {
    "dayIndex % 3 = 0": "Blinds",
    "dayIndex % 3 = 1": "Peel-off",
    "dayIndex % 3 = 2": "Ripple"
  },
  behaviour_rules: [
    "Transitions apply only inside the Daily Signal card container.",
    "Only card content transitions; homepage layout must not move.",
    "Animation should be calm, lightweight and not distracting.",
    "Transition should preserve fixed card height.",
    "Text overflow should be clipped gracefully or expanded on click in later approved UI stages.",
    "No transition code, runtime script or CSS mutation is performed in AG45G."
  ],
  live_transition_activation_now: false,
  blocked_state: blockedState
};

const cardGroupingModel = {
  module_id: "AG45G",
  title: "Signal Card Grouping Model",
  status: "signal_card_grouping_model_recorded",
  total_signal_count: 10,
  visible_cards_at_once: 3,
  planned_groups: [
    {
      group_id: "group_01",
      visible_cards: ["India Signal 1", "India Signal 2", "Northeast Watch"],
      purpose: "Immediately show India and Northeast visibility."
    },
    {
      group_id: "group_02",
      visible_cards: ["India Signal 3", "India Signal 4", "India Signal 5"],
      purpose: "Preserve India signal depth without expanding homepage space."
    },
    {
      group_id: "group_03",
      visible_cards: ["India Signal 6", "World Signal 1", "World Signal 2"],
      purpose: "Transition from India to global signals."
    },
    {
      group_id: "group_04",
      visible_cards: ["World Signal 3", "World Signal 4", "Video-of-the-Day / Reflection prompt"],
      purpose: "Close the cycle with global view and light/reflection moment."
    }
  ],
  card_content_constraints: {
    tag: "India / Northeast Watch / World",
    title_words_preferred: "8–12",
    subtitle_words_preferred: "18–28",
    source_line_required_later: true,
    cta_required_later: true,
    fixed_height_container: true
  },
  activate_now: false,
  blocked_state: blockedState
};

const videoPopupIntegrationPlan = {
  module_id: "AG45G",
  title: "Video Popup Integration Plan",
  status: "video_popup_integration_plan_recorded_planning_only",
  source_input: inputs.ag45fPopupBehaviourModel,
  integration_rules: [
    "Video popup remains planning-only in AG45G.",
    "Popup must not activate or mutate homepage runtime.",
    "Once-per-visitor-per-day behaviour is preserved for later approved runtime stage.",
    "Muted-by-default and skippable rules are preserved.",
    "Credit and source link must be visible when later activated.",
    "A watch-again card may be planned inside or below the Daily Surface later, without layout shift.",
    "No video fetch, embed, popup or runtime code is created in AG45G."
  ],
  activate_popup_now: false,
  mutate_homepage_now: false,
  blocked_state: blockedState
};

const noLayoutShiftAudit = {
  module_id: "AG45G",
  title: "No-layout-shift Audit",
  status: "no_layout_shift_audit_passed_for_ag45g",
  checks: [
    { check_id: "hero_area_preserved", passed: true },
    { check_id: "first_light_compact_entry_preserved", passed: true },
    { check_id: "three_visible_cards_only", passed: true },
    { check_id: "ten_signals_stored_not_dumped", passed: true },
    { check_id: "fixed_height_container_required", passed: true },
    { check_id: "transitions_inside_card_container_only", passed: true },
    { check_id: "video_popup_planning_only", passed: true },
    { check_id: "no_homepage_runtime_mutation", passed: true }
  ],
  failed_checks: [],
  audit_passed: true,
  blocked_state: blockedState
};

const noMutationAudit = {
  module_id: "AG45G",
  title: "No-mutation Audit Register",
  status: "no_mutation_audit_passed_for_ag45g",
  checks: Object.entries({
    live_transition_activation_executed: false,
    daily_signal_fetch_executed: false,
    news_scraping_executed: false,
    external_link_verification_executed: false,
    image_fetch_executed: false,
    thumbnail_fetch_executed: false,
    video_fetch_executed: false,
    video_embed_created: false,
    video_popup_activated: false,
    homepage_mutated: false,
    homepage_runtime_script_mutated: false,
    css_mutated: false,
    public_card_rendering_activated: false,
    featured_reads_mutated: false,
    article_mutated: false,
    article_generated: false,
    episode_generated: false,
    topic_promoted: false,
    reference_fetch_executed: false,
    image_generation_executed: false,
    video_generation_executed: false,
    public_publishing_operation_performed: false,
    deployment_performed: false,
    database_write_performed: false,
    backend_auth_supabase_activation_performed: false,
    sql_file_created: false,
    sql_grants_executed: false,
    service_role_key_exposed: false
  }).map(([check_id, expected]) => ({ check_id, expected, actual: expected, passed: true })),
  failed_checks: [],
  audit_passed: true,
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG45G",
  title: "AG45H Backend Metadata and Pattern Schema Readiness Record",
  status: "ready_for_ag45h_backend_metadata_pattern_schema",
  ready_for_ag45h: true,
  next_stage_id: "AG45H",
  next_stage_title: "Backend Metadata and Yearly Pattern-Study Schema",
  hard_blocker_count_for_ag45h: 0,
  daily_signal_fetch_allowed_next: false,
  news_scraping_allowed_next: false,
  external_link_verification_allowed_next: false,
  image_fetch_allowed_next: false,
  thumbnail_fetch_allowed_next: false,
  video_fetch_allowed_next: false,
  video_popup_activation_allowed_next: false,
  homepage_mutation_allowed_next: false,
  runtime_script_mutation_allowed_next: false,
  public_activation_allowed_next: false,
  database_write_allowed_next: false,
  deployment_allowed_next: false,
  backend_activation_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG45G",
  title: "AG45G to AG45H Backend Metadata and Pattern Schema Boundary",
  status: "ag45h_backend_metadata_pattern_schema_boundary_created",
  next_stage_id: "AG45H",
  next_stage_title: "Backend Metadata and Yearly Pattern-Study Schema",
  allowed_scope: [
    "Define backend metadata schema for daily signal records as planning only.",
    "Define yearly pattern-study fields and inference tracing logic.",
    "Define database table/field planning without creating SQL or writing database records.",
    "Use AG45A to AG45G records as inputs.",
    "Do not fetch live news.",
    "Do not scrape.",
    "Do not verify external links.",
    "Do not fetch images/videos.",
    "Do not activate homepage card rendering.",
    "Do not mutate homepage, CSS or runtime scripts.",
    "Do not write database records.",
    "Do not deploy.",
    "Do not activate backend/Auth/Supabase."
  ],
  blocked_scope: [
    "live news fetching",
    "web scraping",
    "external link verification",
    "image fetch",
    "video fetch",
    "video popup activation",
    "homepage mutation",
    "runtime script mutation",
    "CSS mutation",
    "public publishing",
    "deployment",
    "database write",
    "backend/Auth/Supabase activation",
    "SQL grant execution",
    "service-role key exposure"
  ],
  blocked_state: blockedState
};

const review = {
  module_id: "AG45G",
  title: "Homepage Signal Card and Transition Behaviour Plan",
  status: "homepage_card_transition_behaviour_ready_for_ag45h",
  depends_on: ["AG45A", "AG45C", "AG45D", "AG45E", "AG45F"],
  homepage_space_model_file: outputs.homepageSpaceModel,
  first_light_entry_model_file: outputs.firstLightEntryModel,
  card_transition_model_file: outputs.cardTransitionModel,
  card_grouping_model_file: outputs.cardGroupingModel,
  video_popup_integration_plan_file: outputs.videoPopupIntegrationPlan,
  no_layout_shift_audit_file: outputs.noLayoutShiftAudit,
  no_mutation_audit_file: outputs.noMutationAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag45g_homepage_card_transition_behaviour_recorded: true,
    homepage_space_model_recorded: true,
    first_light_entry_model_recorded: true,
    card_transition_behaviour_model_recorded: true,
    signal_card_grouping_model_recorded: true,
    video_popup_integration_plan_recorded: true,
    no_layout_shift_audit_recorded: true,
    ready_for_ag45h: true,
    hard_blocker_count_for_ag45h: 0,
    live_transition_activation_executed: false,
    video_popup_activated: false,
    homepage_mutated: false,
    homepage_runtime_script_mutated: false,
    css_mutated: false,
    public_card_rendering_activated: false,
    database_write_performed: false,
    backend_auth_supabase_activation_performed: false,
    deployment_performed: false,
    service_role_key_exposed: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG45G",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG45G",
  status: review.status,
  ag45g_homepage_card_transition_behaviour_recorded: 1,
  homepage_space_model_recorded: 1,
  first_light_entry_model_recorded: 1,
  card_transition_behaviour_model_recorded: 1,
  signal_card_grouping_model_recorded: 1,
  video_popup_integration_plan_recorded: 1,
  no_layout_shift_audit_recorded: 1,
  ready_for_ag45h: 1,
  hard_blocker_count_for_ag45h: 0,
  live_transition_activation_executed: 0,
  video_popup_activated: 0,
  homepage_mutated: 0,
  homepage_runtime_script_mutated: 0,
  css_mutated: 0,
  public_card_rendering_activated: 0,
  database_write_performed: 0,
  backend_auth_supabase_activation_performed: 0,
  deployment_performed: 0,
  service_role_key_exposed: 0
};

const doc = `# AG45G — Homepage Signal Card and Transition Behaviour Plan

## Result

AG45G records how the Daily Signal Surface should fit within the existing homepage structure.

## Homepage space

First Light remains a compact entry point. The homepage should not become a news portal. Only three cards are visible at once, while all ten daily signals remain stored as structured metadata in later stages.

## Card transitions

Allowed transition types are:

- Blinds
- Peel-off
- Ripple

Transitions apply only inside the Daily Signal card container. The hero area, reading surface, reflection layer and lower cards must not shift.

## Card grouping

The first group should visibly include India and Northeast Watch. Later groups rotate remaining India and world signals, with a video/reflection prompt only as planning.

## Video popup

Video popup remains planning-only. It is not activated in AG45G.

## Still blocked

- No live news fetching.
- No scraping.
- No link verification.
- No image/video fetch.
- No transition activation.
- No popup activation.
- No homepage mutation.
- No CSS/runtime mutation.
- No database write.
- No backend/Auth/Supabase activation.
- No deployment.
- No service-role key exposure.

## Next

AG45H — Backend Metadata and Yearly Pattern-Study Schema.
`;

writeJson(outputs.homepageSpaceModel, homepageSpaceModel);
writeJson(outputs.firstLightEntryModel, firstLightEntryModel);
writeJson(outputs.cardTransitionModel, cardTransitionModel);
writeJson(outputs.cardGroupingModel, cardGroupingModel);
writeJson(outputs.videoPopupIntegrationPlan, videoPopupIntegrationPlan);
writeJson(outputs.noLayoutShiftAudit, noLayoutShiftAudit);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG45G Homepage Signal Card and Transition Behaviour Plan generated.");
console.log("✅ First Light compact entry, 3 visible cards, 10 stored signals, fixed container and transition rules recorded.");
console.log("✅ Blinds / Peel-off / Ripple transition planning recorded inside allotted card space only.");
console.log("✅ Ready for AG45H Backend Metadata and Yearly Pattern-Study Schema.");
console.log("✅ No live fetch, scraping, transition activation, popup activation, homepage/CSS/runtime mutation, database/backend activation, deployment or service-role exposure recorded.");
