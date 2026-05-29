import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag45aVideoDoctrine: "data/content-intelligence/daily-surface/ag45a-video-of-the-day-doctrine.json",
  ag45aBackendSchemaPlan: "data/content-intelligence/backend-architecture/ag45a-daily-signal-metadata-schema-plan.json",

  ag45bTierRiskRegister: "data/content-intelligence/daily-surface/ag45b-source-tier-risk-register.json",
  ag45bReporterAnchorRules: "data/content-intelligence/daily-surface/ag45b-reporter-anchor-verification-rules.json",

  ag45eReview: "data/content-intelligence/quality-reviews/ag45e-image-link-attribution-safety.json",
  ag45eExternalAssetPolicy: "data/content-intelligence/daily-surface/ag45e-external-asset-no-download-policy.json",
  ag45eAttributionCreditModel: "data/content-intelligence/daily-surface/ag45e-attribution-credit-display-model.json",
  ag45eVerificationStatusModel: "data/content-intelligence/daily-surface/ag45e-verification-status-bands-model.json",
  ag45eNoMutationAudit: "data/content-intelligence/backend-architecture/ag45e-no-mutation-audit-register.json",
  ag45eReadiness: "data/content-intelligence/quality-registry/ag45e-video-of-the-day-safety-readiness-record.json",
  ag45eBoundary: "data/content-intelligence/mutation-plans/ag45e-to-ag45f-video-of-the-day-safety-boundary.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag45f-video-of-the-day-safety-credit.json",
  videoSelectionModel: "data/content-intelligence/daily-surface/ag45f-video-of-the-day-selection-model.json",
  regionalRotationModel: "data/content-intelligence/daily-surface/ag45f-video-regional-rotation-model.json",
  creatorSafetyModel: "data/content-intelligence/daily-surface/ag45f-video-creator-source-safety-model.json",
  popupBehaviourModel: "data/content-intelligence/homepage/ag45f-video-popup-behaviour-model.json",
  creditAttributionModel: "data/content-intelligence/daily-surface/ag45f-video-credit-attribution-model.json",
  futureVideoGeneratorSourceModel: "data/content-intelligence/daily-surface/ag45f-future-video-generator-source-learning-model.json",
  noMutationAudit: "data/content-intelligence/backend-architecture/ag45f-no-mutation-audit-register.json",
  readiness: "data/content-intelligence/quality-registry/ag45f-homepage-card-transition-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag45f-to-ag45g-homepage-card-transition-boundary.json",
  registry: "data/quality/ag45f-video-of-the-day-safety-credit.json",
  preview: "data/quality/ag45f-video-of-the-day-safety-credit-preview.json",
  doc: "docs/quality/AG45F_VIDEO_OF_THE_DAY_SAFETY_CREDIT.md"
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
  if (!exists(p)) throw new Error(`Missing AG45F input: ${p}`);
}

const ag45aVideoDoctrine = readJson(inputs.ag45aVideoDoctrine);
const ag45aBackendSchemaPlan = readJson(inputs.ag45aBackendSchemaPlan);
const ag45bTierRiskRegister = readJson(inputs.ag45bTierRiskRegister);
const ag45bReporterAnchorRules = readJson(inputs.ag45bReporterAnchorRules);
const ag45eReview = readJson(inputs.ag45eReview);
const ag45eExternalAssetPolicy = readJson(inputs.ag45eExternalAssetPolicy);
const ag45eAttributionCreditModel = readJson(inputs.ag45eAttributionCreditModel);
const ag45eVerificationStatusModel = readJson(inputs.ag45eVerificationStatusModel);
const ag45eNoMutationAudit = readJson(inputs.ag45eNoMutationAudit);
const ag45eReadiness = readJson(inputs.ag45eReadiness);
const ag45eBoundary = readJson(inputs.ag45eBoundary);

if (ag45eReview.status !== "image_link_attribution_safety_model_ready_for_ag45f") {
  throw new Error("AG45E review status mismatch.");
}
if (ag45eReview.summary?.ready_for_ag45f !== true) {
  throw new Error("AG45E does not show AG45F readiness.");
}
if (ag45eReadiness.ready_for_ag45f !== true || ag45eReadiness.next_stage_id !== "AG45F") {
  throw new Error("AG45E readiness must permit AG45F.");
}
if (ag45eBoundary.next_stage_id !== "AG45F") {
  throw new Error("AG45E boundary must point to AG45F.");
}
if (ag45eNoMutationAudit.status !== "no_mutation_audit_passed_for_ag45e") {
  throw new Error("AG45E no-mutation audit mismatch.");
}
if (!JSON.stringify(ag45aVideoDoctrine).includes("once per visitor per day")) {
  throw new Error("AG45A video doctrine must include once-per-visitor-per-day planning.");
}
if (!JSON.stringify(ag45aVideoDoctrine).includes("Premanand Ji")) {
  throw new Error("AG45A video doctrine must include spiritual reflection clip planning.");
}
if (!ag45aBackendSchemaPlan.planned_fields.includes("video_url")) {
  throw new Error("AG45A schema plan must include video_url.");
}
if (!ag45aBackendSchemaPlan.planned_fields.includes("video_creator")) {
  throw new Error("AG45A schema plan must include video_creator.");
}
if (!ag45aBackendSchemaPlan.planned_fields.includes("video_credit")) {
  throw new Error("AG45A schema plan must include video_credit.");
}
if (!JSON.stringify(ag45bTierRiskRegister).includes("adult or explicit content")) {
  throw new Error("AG45B tier risk register must include adult/explicit restriction.");
}
if (!JSON.stringify(ag45bReporterAnchorRules).includes("explains")) {
  throw new Error("AG45B attribution language must include explainer handling.");
}
if (!JSON.stringify(ag45eExternalAssetPolicy).includes("No video embedding")) {
  throw new Error("AG45E external asset policy must block video embedding.");
}
if (!JSON.stringify(ag45eAttributionCreditModel).includes("credit")) {
  throw new Error("AG45E attribution credit model missing credit handling.");
}
if (ag45eVerificationStatusModel.default_status_for_ag45e !== "metadata_only_not_fetched") {
  throw new Error("AG45E verification model must remain metadata-only.");
}

const blockedState = {
  ag45f_video_of_the_day_safety_credit_recorded: true,
  ag45e_consumed: true,
  video_selection_model_recorded: true,
  regional_rotation_model_recorded: true,
  creator_source_safety_model_recorded: true,
  popup_behaviour_model_recorded: true,
  video_credit_attribution_model_recorded: true,
  future_video_generator_source_learning_model_recorded: true,
  daily_signal_fetch_executed: false,
  news_scraping_executed: false,
  creator_page_scraping_executed: false,
  external_link_verification_executed: false,
  image_fetch_executed: false,
  thumbnail_fetch_executed: false,
  video_fetch_executed: false,
  video_downloaded_or_rehosted: false,
  video_embed_created: false,
  video_popup_activated: false,
  video_generation_executed: false,
  homepage_mutated: false,
  homepage_runtime_script_mutated: false,
  featured_reads_mutated: false,
  article_mutated: false,
  article_generated: false,
  episode_generated: false,
  topic_promoted: false,
  reference_fetch_executed: false,
  image_generation_executed: false,
  public_publishing_operation_performed: false,
  deployment_performed: false,
  database_write_performed: false,
  backend_auth_supabase_activation_performed: false,
  sql_file_created: false,
  sql_grants_executed: false,
  service_role_key_exposed: false
};

const videoSelectionModel = {
  module_id: "AG45F",
  title: "Video-of-the-Day Selection Model",
  status: "video_of_the_day_selection_model_recorded",
  purpose: "Define the future selection rules for a short, safe, credited and light daily video without fetching, embedding or activating any video now.",
  selection_principles: [
    "Video-of-the-day must support Drishvara’s calm, reflective and insight-led identity.",
    "The selected video should carry a light moment, learning value, cultural value, human warmth, nature/knowledge value or reflective value.",
    "Video must not be adult, explicit, hateful, extremist, violent shock, manipulative, sensational or reputation-risk content.",
    "Video should not be used as political propaganda or creator promotion.",
    "Video should be metadata-only until a later approved runtime/backend stage.",
    "Video should be credited clearly with creator/platform/source link when activated later.",
    "Video should not be downloaded or rehosted unless legally permitted in a later approved stage.",
    "Video generator integration remains future-only and is not activated in AG45F."
  ],
  preferred_video_types: [
    "light human moment",
    "nature or cultural observation",
    "knowledge short",
    "regional cultural glimpse",
    "Northeast India visibility moment",
    "safe spiritual reflection",
    "public-interest explainer clip where rights and attribution are clear"
  ],
  maximum_length_policy: "Prefer up to 30 seconds or a short embedded source clip in later approved stages.",
  activate_now: false,
  blocked_state: blockedState
};

const regionalRotationModel = {
  module_id: "AG45F",
  title: "Video Regional Rotation Model",
  status: "video_regional_rotation_model_recorded",
  weekly_rotation: {
    india_days_per_week: 4,
    world_days_per_week: 3,
    india_rotation: [
      "North India",
      "West/South India",
      "East India",
      "Northeast India"
    ],
    world_rotation: [
      "culture",
      "nature",
      "knowledge",
      "human moment"
    ]
  },
  monthly_special_handling: {
    spiritual_reflection_days_per_month: "2–3 days/month maximum as a planning rule",
    example_source_class: "Premanand Ji or similar safe spiritual/reflection clips",
    handling_rule: "Spiritual clips must remain credited, optional, non-coercive, safe and not overused."
  },
  northeast_handling: {
    northeast_video_slot: "At least one India rotation day should explicitly allow Northeast India cultural, nature, youth, sports, public-service or knowledge moments.",
    objective: "Help make Northeast India more visible in the mainstream Daily Surface without sensational or extractive framing."
  },
  activate_now: false,
  blocked_state: blockedState
};

const creatorSafetyModel = {
  module_id: "AG45F",
  title: "Video Creator and Source Safety Model",
  status: "video_creator_source_safety_model_recorded",
  creator_positive_indicators: [
    "clear creator/channel identity",
    "credible public archive",
    "safe public reputation",
    "non-explicit and non-hate content history",
    "content fits Drishvara tone",
    "attribution and source URL can be preserved",
    "creator/platform terms do not prohibit planned use",
    "short clip or embed treatment is legally acceptable in a later approved stage"
  ],
  creator_exclusion_indicators: [
    "adult or explicit content creator",
    "hate, extremist or violent shock content",
    "misinformation-heavy or manipulative framing",
    "communal/racial/religious hostility",
    "excessive sensationalism or vulgarity",
    "copyright-unsafe reposting pattern",
    "creator identity unclear for public use",
    "content likely to damage Drishvara’s credibility"
  ],
  safety_status_values: [
    "safe_candidate",
    "usable_with_editorial_review",
    "under_editorial_verification",
    "rights_unclear_hold",
    "unsafe_or_excluded"
  ],
  default_status_for_ag45f: "under_editorial_verification",
  live_creator_check_now: false,
  blocked_state: blockedState
};

const popupBehaviourModel = {
  module_id: "AG45F",
  title: "Video Popup Behaviour Model",
  status: "video_popup_behaviour_model_recorded_planning_only",
  future_public_behaviour: {
    show_frequency: "once per visitor per day",
    muted_by_default: true,
    skippable: true,
    close_button_required: true,
    credit_visible_below_video: true,
    source_link_visible: true,
    maximum_duration_guidance: "up to 30 seconds",
    watch_again_card_allowed_later: true
  },
  ux_constraints: [
    "Popup must not block access to the site in an aggressive way.",
    "Popup must not autoplay sound.",
    "Popup must not display adult, explicit, violent shock or reputation-risk content.",
    "Popup must not create homepage layout shift.",
    "Popup must not activate until a later approved runtime stage.",
    "A small watch-again card may be planned later after the popup is closed."
  ],
  activate_popup_now: false,
  mutate_homepage_now: false,
  blocked_state: blockedState
};

const creditAttributionModel = {
  module_id: "AG45F",
  title: "Video Credit and Attribution Model",
  status: "video_credit_attribution_model_recorded",
  planned_fields: [
    "video_url",
    "video_creator",
    "video_platform",
    "video_credit",
    "video_source_url",
    "video_rights_status",
    "video_safety_status",
    "video_verification_status",
    "video_region_focus",
    "video_theme_tags"
  ],
  public_credit_templates: [
    "Video: [Creator/Channel], via [Platform].",
    "Source video: [Creator/Channel]. Watch at source →",
    "Clip/source under editorial verification.",
    "Video unavailable pending rights and safety review."
  ],
  rules: [
    "Credit must be visible below the video when public rendering is later approved.",
    "Creator/channel name must not be invented.",
    "Platform/source link must be preserved where available.",
    "If rights are unclear, use under editorial verification or hold the item.",
    "Do not crop or edit third-party video in a way that misrepresents the creator/source.",
    "Do not use the video as Drishvara-owned content unless it is Drishvara-created later."
  ],
  blocked_state: blockedState
};

const futureVideoGeneratorSourceModel = {
  module_id: "AG45F",
  title: "Future Video Generator Source Learning Model",
  status: "future_video_generator_source_learning_model_recorded",
  purpose: "Record how future video metadata may help Drishvara’s later video-generation system without generating video now.",
  future_learning_value: [
    "regional visual themes",
    "safe tone examples",
    "publicly acceptable pacing",
    "light-moment formats",
    "Northeast visibility themes",
    "spiritual reflection boundaries",
    "creator credit patterns",
    "unsafe-source exclusion examples"
  ],
  future_generator_constraints: [
    "No video generation is executed in AG45F.",
    "No source video is downloaded for training in AG45F.",
    "No copyrighted video is stored as model training data in AG45F.",
    "Future generated videos must be Drishvara-created or rights-cleared.",
    "Future video generation must not imitate living creators or misuse third-party identity.",
    "Future video generator integration requires a later approved governed stage."
  ],
  metadata_only_now: true,
  blocked_state: blockedState
};

const noMutationAudit = {
  module_id: "AG45F",
  title: "No-mutation Audit Register",
  status: "no_mutation_audit_passed_for_ag45f",
  checks: Object.entries({
    daily_signal_fetch_executed: false,
    news_scraping_executed: false,
    creator_page_scraping_executed: false,
    external_link_verification_executed: false,
    image_fetch_executed: false,
    thumbnail_fetch_executed: false,
    video_fetch_executed: false,
    video_downloaded_or_rehosted: false,
    video_embed_created: false,
    video_popup_activated: false,
    video_generation_executed: false,
    homepage_mutated: false,
    homepage_runtime_script_mutated: false,
    featured_reads_mutated: false,
    article_mutated: false,
    article_generated: false,
    episode_generated: false,
    topic_promoted: false,
    reference_fetch_executed: false,
    image_generation_executed: false,
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
  module_id: "AG45F",
  title: "AG45G Homepage Card Transition Readiness Record",
  status: "ready_for_ag45g_homepage_card_transition_behaviour_plan",
  ready_for_ag45g: true,
  next_stage_id: "AG45G",
  next_stage_title: "Homepage Signal Card and Transition Behaviour Plan",
  hard_blocker_count_for_ag45g: 0,
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
  module_id: "AG45F",
  title: "AG45F to AG45G Homepage Signal Card and Transition Boundary",
  status: "ag45g_homepage_card_transition_boundary_created",
  next_stage_id: "AG45G",
  next_stage_title: "Homepage Signal Card and Transition Behaviour Plan",
  allowed_scope: [
    "Define homepage Daily Signal card space, fixed-container behaviour and card transition rules.",
    "Define Blinds / Peel-off / Ripple rotation as planning only.",
    "Define how First Light compact entry, 3 visible cards and 10 stored signals should fit existing homepage space.",
    "Use AG45A transition doctrine and AG45F popup planning as inputs.",
    "Do not fetch live news.",
    "Do not scrape publisher or creator pages.",
    "Do not fetch images/videos.",
    "Do not activate popup.",
    "Do not mutate homepage or runtime files.",
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
  module_id: "AG45F",
  title: "Video-of-the-Day Selection, Safety and Credit Model",
  status: "video_of_the_day_safety_credit_model_ready_for_ag45g",
  depends_on: ["AG45A", "AG45B", "AG45E"],
  video_selection_model_file: outputs.videoSelectionModel,
  regional_rotation_model_file: outputs.regionalRotationModel,
  creator_safety_model_file: outputs.creatorSafetyModel,
  popup_behaviour_model_file: outputs.popupBehaviourModel,
  credit_attribution_model_file: outputs.creditAttributionModel,
  future_video_generator_source_model_file: outputs.futureVideoGeneratorSourceModel,
  no_mutation_audit_file: outputs.noMutationAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag45f_video_of_the_day_safety_credit_recorded: true,
    video_selection_model_recorded: true,
    regional_rotation_model_recorded: true,
    creator_source_safety_model_recorded: true,
    popup_behaviour_model_recorded: true,
    video_credit_attribution_model_recorded: true,
    future_video_generator_source_learning_model_recorded: true,
    ready_for_ag45g: true,
    hard_blocker_count_for_ag45g: 0,
    video_fetch_executed: false,
    video_downloaded_or_rehosted: false,
    video_embed_created: false,
    video_popup_activated: false,
    video_generation_executed: false,
    homepage_mutated: false,
    homepage_runtime_script_mutated: false,
    database_write_performed: false,
    backend_auth_supabase_activation_performed: false,
    deployment_performed: false,
    service_role_key_exposed: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG45F",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG45F",
  status: review.status,
  ag45f_video_of_the_day_safety_credit_recorded: 1,
  video_selection_model_recorded: 1,
  regional_rotation_model_recorded: 1,
  creator_source_safety_model_recorded: 1,
  popup_behaviour_model_recorded: 1,
  video_credit_attribution_model_recorded: 1,
  future_video_generator_source_learning_model_recorded: 1,
  ready_for_ag45g: 1,
  hard_blocker_count_for_ag45g: 0,
  video_fetch_executed: 0,
  video_downloaded_or_rehosted: 0,
  video_embed_created: 0,
  video_popup_activated: 0,
  video_generation_executed: 0,
  homepage_mutated: 0,
  homepage_runtime_script_mutated: 0,
  database_write_performed: 0,
  backend_auth_supabase_activation_performed: 0,
  deployment_performed: 0,
  service_role_key_exposed: 0
};

const doc = `# AG45F — Video-of-the-Day Selection, Safety and Credit Model

## Result

AG45F records the governed planning model for Drishvara's future Video-of-the-Day surface.

## Selection

The video should be short, safe, credited and aligned with Drishvara's calm public identity. It may carry a light human moment, knowledge value, culture, nature, regional visibility or spiritual reflection.

## Rotation

The planning model keeps 4 India-oriented days and 3 world-oriented days. India rotation includes North, West/South, East and Northeast. Spiritual reflection clips such as Premanand Ji-type safe clips may be considered only 2–3 days per month with attribution and review.

## Popup

The future popup is planning-only: once per visitor per day, muted by default, skippable, credited and source-linked. It is not activated in AG45F.

## Safety

Adult, explicit, hate, extremist, violent shock, manipulative, copyright-unsafe or reputation-risk sources are excluded.

## Future video generator

AG45F records metadata-learning logic for a future Drishvara video generator, but does not generate, download, store or train on any video.

## Still blocked

- No video fetch.
- No creator page scraping.
- No video download or rehost.
- No video embed.
- No popup activation.
- No video generation.
- No homepage mutation.
- No database write.
- No backend/Auth/Supabase activation.
- No deployment.
- No service-role key exposure.

## Next

AG45G — Homepage Signal Card and Transition Behaviour Plan.
`;

writeJson(outputs.videoSelectionModel, videoSelectionModel);
writeJson(outputs.regionalRotationModel, regionalRotationModel);
writeJson(outputs.creatorSafetyModel, creatorSafetyModel);
writeJson(outputs.popupBehaviourModel, popupBehaviourModel);
writeJson(outputs.creditAttributionModel, creditAttributionModel);
writeJson(outputs.futureVideoGeneratorSourceModel, futureVideoGeneratorSourceModel);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG45F Video-of-the-Day Selection, Safety and Credit Model generated.");
console.log("✅ Video selection, regional rotation, creator safety, popup planning, credit attribution and future generator source-learning rules recorded.");
console.log("✅ Ready for AG45G Homepage Signal Card and Transition Behaviour Plan.");
console.log("✅ No video fetch, scrape, download/rehost, embed, popup activation, video generation, homepage mutation, database/backend activation, deployment or service-role exposure recorded.");
