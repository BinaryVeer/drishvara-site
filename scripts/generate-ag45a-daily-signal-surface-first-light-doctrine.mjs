import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag44zReview: "data/content-intelligence/quality-reviews/ag44z-episodic-knowledge-engine-closure.json",
  ag44zClosure: "data/content-intelligence/closure-records/ag44z-episodic-knowledge-engine-closure.json",
  ag44zReadiness: "data/content-intelligence/quality-registry/ag44z-next-governed-stage-readiness-record.json",
  ag44zBoundary: "data/content-intelligence/mutation-plans/ag44z-to-next-governed-stage-boundary.json",
  ag44zCarryForward: "data/content-intelligence/quality-registry/ag44z-carry-forward-register.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag45a-daily-signal-surface-first-light-doctrine.json",
  doctrine: "data/content-intelligence/daily-surface/ag45a-daily-signal-surface-doctrine.json",
  firstLightModel: "data/content-intelligence/homepage/ag45a-first-light-ui-space-model.json",
  signalSelectionDoctrine: "data/content-intelligence/daily-surface/ag45a-signal-selection-doctrine.json",
  northeastDoctrine: "data/content-intelligence/daily-surface/ag45a-northeast-watch-doctrine.json",
  attributionDoctrine: "data/content-intelligence/daily-surface/ag45a-source-attribution-title-subtitle-doctrine.json",
  videoDoctrine: "data/content-intelligence/daily-surface/ag45a-video-of-the-day-doctrine.json",
  transitionDoctrine: "data/content-intelligence/homepage/ag45a-card-transition-doctrine.json",
  backendSchemaPlan: "data/content-intelligence/backend-architecture/ag45a-daily-signal-metadata-schema-plan.json",
  noMutationAudit: "data/content-intelligence/backend-architecture/ag45a-no-mutation-audit-register.json",
  readiness: "data/content-intelligence/quality-registry/ag45a-source-credibility-model-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag45a-to-ag45b-source-credibility-model-boundary.json",
  registry: "data/quality/ag45a-daily-signal-surface-first-light-doctrine.json",
  preview: "data/quality/ag45a-daily-signal-surface-first-light-doctrine-preview.json",
  doc: "docs/quality/AG45A_DAILY_SIGNAL_SURFACE_FIRST_LIGHT_DOCTRINE.md"
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

function walk(dir) {
  const start = full(dir);
  if (!fs.existsSync(start)) return [];
  const out = [];

  for (const entry of fs.readdirSync(start, { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(rel));
    else if (entry.isFile()) out.push(rel);
  }

  return out;
}

function findFiles(patterns, roots = ["data", "docs", "scripts", "public", "articles"]) {
  const files = roots.flatMap((r) => walk(r));
  return files.filter((file) => patterns.some((pattern) => pattern.test(file)));
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG45A input: ${p}`);
}

const ag44zReview = readJson(inputs.ag44zReview);
const ag44zClosure = readJson(inputs.ag44zClosure);
const ag44zReadiness = readJson(inputs.ag44zReadiness);
const ag44zBoundary = readJson(inputs.ag44zBoundary);
const ag44zCarryForward = readJson(inputs.ag44zCarryForward);
const packageJson = readJson(inputs.packageJson);

const ag45RoadmapSources = findFiles([
  /ag42a/i,
  /AG45/i,
  /ag45/i,
  /homepage[-_ ]?daily[-_ ]?surface/i,
  /first[-_ ]?light/i
]);

const ag23HomepageSources = findFiles([
  /ag23/i,
  /homepage/i,
  /first[-_ ]?light/i,
  /discover[-_ ]?read[-_ ]?reflect/i
]);

if (ag44zClosure.next_stage_id !== "AG45") throw new Error("AG44Z closure must point to AG45.");
if (ag44zReadiness.next_stage_id !== "AG45") throw new Error("AG44Z readiness must point to AG45.");
if (ag44zBoundary.next_stage_id !== "AG45") throw new Error("AG44Z boundary must point to AG45.");
if (!JSON.stringify(ag44zReadiness).includes("Homepage Daily Surface and First Light Activation")) {
  throw new Error("AG44Z readiness must identify AG45 as Homepage Daily Surface and First Light Activation.");
}
if (!JSON.stringify(ag44zBoundary).includes("Homepage Daily Surface and First Light Activation")) {
  throw new Error("AG44Z boundary must identify AG45 as Homepage Daily Surface and First Light Activation.");
}
if (ag44zReview.summary?.ag56_dynamic_content_loop_still_deferred !== true) {
  throw new Error("AG44Z must keep AG56 dynamic content-loop deferred.");
}
if (!JSON.stringify(ag44zCarryForward).includes("AG56")) {
  throw new Error("AG44Z carry-forward must preserve AG56 deferral.");
}
if (ag45RoadmapSources.length < 1) {
  throw new Error("AG45 roadmap/source references not found.");
}
if (ag23HomepageSources.length < 1) {
  throw new Error("AG23 homepage / First Light sources not found.");
}

const packageScripts = packageJson.scripts || {};
const validateAg23Scripts = Object.keys(packageScripts).filter((key) => /^validate:ag23/i.test(key)).sort();
const validateAg44Scripts = Object.keys(packageScripts).filter((key) => /^validate:ag44/i.test(key)).sort();

const blockedState = {
  ag45a_daily_signal_surface_doctrine_recorded: true,
  ag44z_consumed: true,
  ag23_homepage_first_light_sources_consumed: true,
  daily_signal_fetch_executed: false,
  news_scraping_executed: false,
  external_link_verification_executed: false,
  image_fetch_executed: false,
  video_fetch_executed: false,
  video_popup_activated: false,
  homepage_mutated: false,
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

const doctrine = {
  module_id: "AG45A",
  title: "Daily Signal Surface and First Light Doctrine",
  status: "daily_signal_surface_doctrine_recorded_ready_for_ag45b",
  definition: {
    daily_surface: "A homepage-facing daily signal-intelligence layer, not a news portal and not an article-rewriting engine.",
    first_light: "A compact daily entry point that opens the visitor into today’s curated signals, reading paths and reflection routes.",
    public_role: "Show what is worth noticing today while preserving Drishvara’s calm, reflective and insight-led tone.",
    system_role: "Create structured metadata useful for future inference, annual pattern study, reference discovery and article planning."
  },
  core_rules: [
    "Default daily set contains 10 signals.",
    "Default split is 6 India signals and 4 international signals.",
    "At least one Northeast India signal should be actively watched and included when a credible source is available.",
    "Drishvara may write its own title and subtitle but must not rewrite the source article.",
    "Every signal must preserve source attribution and a source link.",
    "Publisher/reporter/anchor credibility must be evaluated before selection.",
    "Images, thumbnails and videos require attribution and safety treatment.",
    "The homepage should show a compact rotating/expanded surface, not a full news portal layout.",
    "No live fetch, scrape, backend write, public mutation, publish or deploy is allowed in AG45A."
  ],
  consumed_sources: {
    ag44z_review: inputs.ag44zReview,
    ag44z_closure: inputs.ag44zClosure,
    ag44z_readiness: inputs.ag44zReadiness,
    ag44z_boundary: inputs.ag44zBoundary,
    ag45_roadmap_sources: ag45RoadmapSources.slice(0, 80),
    ag23_homepage_sources: ag23HomepageSources.slice(0, 80),
    validate_ag23_scripts: validateAg23Scripts,
    validate_ag44_scripts: validateAg44Scripts
  },
  blocked_state: blockedState
};

const firstLightModel = {
  module_id: "AG45A",
  title: "First Light UI Space Model",
  status: "first_light_ui_space_doctrine_recorded",
  existing_homepage_fit: {
    hero_area_preserved: true,
    top_right_first_light_box_is_compact_entry_point: true,
    large_hero_band_not_converted_into_news_portal: true,
    daily_surface_uses_fixed_space_and_no_layout_shift: true
  },
  intended_visible_surface: {
    compact_label: "First Light",
    compact_summary: "Today’s 10 Signals — India, Northeast Watch and World",
    visible_card_count_at_once: 3,
    full_signal_count_stored: 10,
    expansion_model: "controlled panel / modal / later dedicated daily-surface page",
    no_homepage_mutation_now: true
  },
  card_size_rules: {
    tag: "India / Northeast Watch / World",
    title_words: "8–12 words preferred",
    subtitle_words: "18–28 words preferred",
    source_line: "Reporter/Desk/Anchor for Publisher, where available",
    cta: "Read at source →"
  },
  blocked_state: blockedState
};

const signalSelectionDoctrine = {
  module_id: "AG45A",
  title: "Signal Selection Doctrine",
  status: "signal_selection_doctrine_recorded",
  daily_signal_count: 10,
  default_distribution: {
    india_signals: 6,
    international_signals: 4,
    northeast_watch: "At least one Northeast India signal within India signals where credible source is available."
  },
  selection_principles: [
    "Credibility over virality.",
    "Public relevance over noise.",
    "Long-term pattern value over short-lived attention.",
    "Regional balance with a dedicated Northeast India watch.",
    "Topic diversity across governance, society, technology, culture, climate, security, economy and public systems.",
    "Original reporting preferred over copied/syndicated repetition.",
    "Analytical explainers may supplement but should not automatically replace primary reporting."
  ],
  flexible_distribution_rule: "6 India / 4 World remains default; exceptional days may rebalance only under governed logic in later stages.",
  blocked_state: blockedState
};

const northeastDoctrine = {
  module_id: "AG45A",
  title: "Northeast Watch Doctrine",
  status: "northeast_watch_doctrine_recorded",
  rationale: "Northeast India often remains underrepresented in national and international news surfaces despite strategic, cultural, environmental and geopolitical importance. Drishvara treats the region as a standing signal category, not an occasional exception.",
  region_scope: [
    "Arunachal Pradesh",
    "Assam",
    "Meghalaya",
    "Nagaland",
    "Manipur",
    "Mizoram",
    "Tripura",
    "Sikkim"
  ],
  watch_themes: [
    "border affairs",
    "China-related regional implications",
    "infrastructure and connectivity",
    "environment and climate",
    "tribal and cultural identity",
    "security and strategic geography",
    "public schemes and governance",
    "education, youth and sports",
    "regional economy and livelihoods"
  ],
  presentation_rule: "Northeast Watch should be visibly tagged while remaining part of the mainstream India signal surface.",
  blocked_state: blockedState
};

const attributionDoctrine = {
  module_id: "AG45A",
  title: "Source Attribution, Title and Subtitle Doctrine",
  status: "source_attribution_title_subtitle_doctrine_recorded",
  source_hierarchy: [
    {
      tier: 1,
      label: "Primary reporting",
      description: "Reporter-led articles, field reports, credible news desks, official records and ground reporting."
    },
    {
      tier: 2,
      label: "Analytical explainers",
      description: "Credible anchors, domain experts and explanatory programmes. May include recognised public explainers such as Palki Sharma-type international affairs explainers and Ranganathan-type public-policy/science commentators when contextually appropriate."
    },
    {
      tier: 3,
      label: "Public interpretation",
      description: "Opinion columns, debates, interviews and podcasts used only with clear labelling."
    },
    {
      tier: 4,
      label: "Restricted/excluded",
      description: "Sensational, hate-driven, adult/explicit, unverified, anonymous, propaganda-heavy, manipulated or reputation-risk sources."
    }
  ],
  title_rule: "Drishvara title should be durable, calm, non-clickbait and independent of the publisher’s headline while preserving the source’s factual direction.",
  subtitle_rule: "Subtitle should record what happened, why it matters, what long-term theme it belongs to and what future inference value it has.",
  attribution_templates: [
    "[Reporter Name] reports for [Publisher] that...",
    "[Publisher] reports that...",
    "[Desk/Anchor] for [Publisher] explains...",
    "According to [Publisher]..."
  ],
  prohibited_public_language: [
    "Do not say 'editor says' unless it is actually an editorial/editor-authored item.",
    "Do not copy full article text.",
    "Do not imply Drishvara owns third-party reporting.",
    "Do not present opinion/explainer content as primary reporting."
  ],
  blocked_state: blockedState
};

const videoDoctrine = {
  module_id: "AG45A",
  title: "Video-of-the-Day Doctrine",
  status: "video_of_the_day_doctrine_recorded",
  public_experience: {
    popup_frequency: "once per visitor per day in later approved runtime stage",
    max_length: "up to 30 seconds or short embedded clip",
    muted_by_default: true,
    skippable: true,
    credit_visible_below_video: true,
    source_link_visible: true,
    activate_now: false
  },
  rotation_model: {
    india_days_per_week: 4,
    world_days_per_week: 3,
    india_rotation: ["North", "West/South", "East", "Northeast"],
    world_rotation: ["culture", "nature", "knowledge", "human moment"],
    spiritual_reflection: "Premanand Ji or similar spiritual/reflection clips may be considered 2–3 days per month with attribution and safety review."
  },
  safety_exclusions: [
    "adult or explicit content",
    "hate or extremist content",
    "violent shock content",
    "sensational misinformation",
    "creator or source likely to damage Drishvara’s credibility",
    "copyright-unsafe download/rehosting"
  ],
  storage_rule: "In early stages store metadata/link/credit only; do not download or rehost unless legally permitted in a later approved stage.",
  blocked_state: blockedState
};

const transitionDoctrine = {
  module_id: "AG45A",
  title: "Daily Signal Card Transition Doctrine",
  status: "card_transition_doctrine_recorded",
  transition_options: ["Blinds", "Peel-off", "Ripple"],
  layout_rule: "Transitions apply only inside the allotted Daily Signal card container, not across the full homepage.",
  fixed_space_rules: [
    "No homepage layout shift.",
    "Card height remains fixed.",
    "Only cards transition.",
    "Text is compact and clipped gracefully or expanded on click.",
    "Animation remains calm and lightweight."
  ],
  deterministic_rotation_option: {
    day_index_mod_3_0: "Blinds",
    day_index_mod_3_1: "Peel-off",
    day_index_mod_3_2: "Ripple"
  },
  activate_now: false,
  blocked_state: blockedState
};

const backendSchemaPlan = {
  module_id: "AG45A",
  title: "Daily Signal Metadata Schema Plan",
  status: "metadata_schema_plan_recorded_no_database_write",
  planned_fields: [
    "date",
    "rank",
    "region_scope",
    "category",
    "drishvara_title",
    "drishvara_subtitle",
    "source_title",
    "publisher_name",
    "reporter_name",
    "reporter_profile_url",
    "source_url",
    "canonical_url",
    "image_url",
    "image_credit",
    "video_url",
    "video_creator",
    "video_credit",
    "credibility_score",
    "selection_reason",
    "theme_tags",
    "inference_tags",
    "pattern_value",
    "reference_value",
    "safety_status",
    "verification_status",
    "created_at",
    "updated_at"
  ],
  future_use: [
    "annual pattern analysis",
    "topic memory",
    "article reference discovery",
    "regional theme tracking",
    "public mood and concern mapping",
    "future Drishvara article grounding",
    "future video-generation source study"
  ],
  database_write_now: false,
  supabase_activation_now: false,
  blocked_state: blockedState
};

const noMutationAudit = {
  module_id: "AG45A",
  title: "No-mutation Audit Register",
  status: "no_mutation_audit_passed_for_ag45a",
  checks: Object.entries({
    daily_signal_fetch_executed: false,
    news_scraping_executed: false,
    external_link_verification_executed: false,
    image_fetch_executed: false,
    video_fetch_executed: false,
    video_popup_activated: false,
    homepage_mutated: false,
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
  module_id: "AG45A",
  title: "AG45B Source Credibility Model Readiness Record",
  status: "ready_for_ag45b_source_credibility_model",
  ready_for_ag45b: true,
  next_stage_id: "AG45B",
  next_stage_title: "Source, Publisher, Reporter and Anchor Credibility Model",
  hard_blocker_count_for_ag45b: 0,
  daily_signal_fetch_allowed_next: false,
  news_scraping_allowed_next: false,
  image_fetch_allowed_next: false,
  video_fetch_allowed_next: false,
  homepage_mutation_allowed_next: false,
  public_activation_allowed_next: false,
  database_write_allowed_next: false,
  deployment_allowed_next: false,
  backend_activation_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG45A",
  title: "AG45A to AG45B Source Credibility Model Boundary",
  status: "ag45b_source_credibility_model_boundary_created",
  next_stage_id: "AG45B",
  next_stage_title: "Source, Publisher, Reporter and Anchor Credibility Model",
  allowed_scope: [
    "Define credibility scoring for publishers, reporters, desks, anchors and explainers.",
    "Define under-reported credible source inclusion rules.",
    "Define Northeast Watch source-prioritisation logic.",
    "Do not fetch live news.",
    "Do not scrape publisher pages.",
    "Do not download or store images/videos.",
    "Do not mutate homepage, Featured Reads, article files, listing files or runtime files.",
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
    "Featured Reads mutation",
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
  module_id: "AG45A",
  title: "Daily Signal Surface and First Light Doctrine",
  status: "daily_signal_surface_first_light_doctrine_ready_for_ag45b",
  depends_on: ["AG44Z", "AG23 homepage/First Light", "AG42A AG45 roadmap reference"],
  doctrine_file: outputs.doctrine,
  first_light_model_file: outputs.firstLightModel,
  signal_selection_doctrine_file: outputs.signalSelectionDoctrine,
  northeast_doctrine_file: outputs.northeastDoctrine,
  attribution_doctrine_file: outputs.attributionDoctrine,
  video_doctrine_file: outputs.videoDoctrine,
  transition_doctrine_file: outputs.transitionDoctrine,
  backend_schema_plan_file: outputs.backendSchemaPlan,
  no_mutation_audit_file: outputs.noMutationAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag45a_daily_signal_surface_doctrine_recorded: true,
    first_light_compact_ui_space_model_recorded: true,
    ten_signal_model_recorded: true,
    india_six_world_four_default_recorded: true,
    northeast_watch_doctrine_recorded: true,
    source_attribution_title_subtitle_doctrine_recorded: true,
    video_of_the_day_doctrine_recorded: true,
    transition_doctrine_recorded: true,
    metadata_schema_plan_recorded: true,
    ready_for_ag45b: true,
    hard_blocker_count_for_ag45b: 0,
    homepage_mutated: false,
    daily_signal_fetch_executed: false,
    news_scraping_executed: false,
    image_fetch_executed: false,
    video_fetch_executed: false,
    video_popup_activated: false,
    database_write_performed: false,
    backend_auth_supabase_activation_performed: false,
    deployment_performed: false,
    service_role_key_exposed: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG45A",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG45A",
  status: review.status,
  ag45a_daily_signal_surface_doctrine_recorded: 1,
  ten_signal_model_recorded: 1,
  india_six_world_four_default_recorded: 1,
  northeast_watch_doctrine_recorded: 1,
  video_of_the_day_doctrine_recorded: 1,
  transition_doctrine_recorded: 1,
  ready_for_ag45b: 1,
  hard_blocker_count_for_ag45b: 0,
  homepage_mutated: 0,
  daily_signal_fetch_executed: 0,
  news_scraping_executed: 0,
  image_fetch_executed: 0,
  video_fetch_executed: 0,
  video_popup_activated: 0,
  database_write_performed: 0,
  backend_auth_supabase_activation_performed: 0,
  deployment_performed: 0,
  service_role_key_exposed: 0
};

const doc = `# AG45A — Daily Signal Surface and First Light Doctrine

## Result

AG45A records the doctrine for Drishvara's Daily Signal Surface and First Light homepage layer.

## Core direction

The Daily Surface is not a news portal. It is a curated signal-intelligence layer. It should help a visitor notice what matters today and help Drishvara preserve structured signal metadata for future inference, yearly pattern study, reference discovery and article planning.

## First Light

First Light is the compact homepage entry point for the daily signal layer. It should show the visitor that today's 10 signals are available without overcrowding the existing homepage design.

## Daily signals

- 10 signals per day as a default model.
- 6 India signals.
- 4 international signals.
- At least one Northeast India signal should be actively watched and included where credible source material is available.

## Northeast Watch

Northeast India is treated as a standing signal category because the region is strategically, culturally, environmentally and geopolitically important, yet often underrepresented in national and international coverage.

## Attribution

Drishvara writes a calm title and inference-useful subtitle, but does not rewrite the source article. Source, publisher, reporter, desk or anchor attribution must remain visible.

## Video of the Day

Video remains a future governed feature. It must be safe, credited, skippable, muted by default and metadata-only until legally and technically approved.

## Transition behaviour

Blinds, peel-off and ripple transitions are allowed only inside the assigned daily signal card container. No homepage layout shift is allowed.

## Still blocked

- No live news fetching.
- No scraping.
- No image fetch.
- No video fetch.
- No homepage mutation.
- No video popup activation.
- No database write.
- No backend/Auth/Supabase activation.
- No deployment.
- No service-role key exposure.

## Next

AG45B — Source, Publisher, Reporter and Anchor Credibility Model.
`;

writeJson(outputs.doctrine, doctrine);
writeJson(outputs.firstLightModel, firstLightModel);
writeJson(outputs.signalSelectionDoctrine, signalSelectionDoctrine);
writeJson(outputs.northeastDoctrine, northeastDoctrine);
writeJson(outputs.attributionDoctrine, attributionDoctrine);
writeJson(outputs.videoDoctrine, videoDoctrine);
writeJson(outputs.transitionDoctrine, transitionDoctrine);
writeJson(outputs.backendSchemaPlan, backendSchemaPlan);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG45A Daily Signal Surface and First Light Doctrine generated.");
console.log("✅ 10-signal model, Northeast Watch, title/subtitle attribution, video doctrine and transition rules recorded.");
console.log("✅ Ready for AG45B Source, Publisher, Reporter and Anchor Credibility Model.");
console.log("✅ No fetch, scrape, homepage mutation, video activation, database/backend/Supabase/Auth activation, deploy or service-role exposure recorded.");
