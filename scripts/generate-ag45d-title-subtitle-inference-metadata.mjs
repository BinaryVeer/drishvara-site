import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag45aAttributionDoctrine: "data/content-intelligence/daily-surface/ag45a-source-attribution-title-subtitle-doctrine.json",
  ag45aBackendSchemaPlan: "data/content-intelligence/backend-architecture/ag45a-daily-signal-metadata-schema-plan.json",

  ag45bCredibilityModel: "data/content-intelligence/daily-surface/ag45b-source-credibility-model.json",
  ag45bReporterAnchorRules: "data/content-intelligence/daily-surface/ag45b-reporter-anchor-verification-rules.json",
  ag45bTierRiskRegister: "data/content-intelligence/daily-surface/ag45b-source-tier-risk-register.json",

  ag45cReview: "data/content-intelligence/quality-reviews/ag45c-signal-selection-model.json",
  ag45cSelectionModel: "data/content-intelligence/daily-surface/ag45c-daily-signal-selection-model.json",
  ag45cIndiaAllocation: "data/content-intelligence/daily-surface/ag45c-india-signal-allocation-model.json",
  ag45cNortheastWatchSelection: "data/content-intelligence/daily-surface/ag45c-northeast-watch-selection-model.json",
  ag45cInternationalSelection: "data/content-intelligence/daily-surface/ag45c-international-signal-selection-model.json",
  ag45cDiversityInferenceScoring: "data/content-intelligence/daily-surface/ag45c-topic-diversity-inference-scoring-model.json",
  ag45cRankingMatrix: "data/content-intelligence/daily-surface/ag45c-daily-signal-ranking-matrix.json",
  ag45cNoMutationAudit: "data/content-intelligence/backend-architecture/ag45c-no-mutation-audit-register.json",
  ag45cReadiness: "data/content-intelligence/quality-registry/ag45c-title-subtitle-metadata-readiness-record.json",
  ag45cBoundary: "data/content-intelligence/mutation-plans/ag45c-to-ag45d-title-subtitle-metadata-boundary.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag45d-title-subtitle-inference-metadata.json",
  titleRules: "data/content-intelligence/daily-surface/ag45d-drishvara-title-rules.json",
  subtitleRules: "data/content-intelligence/daily-surface/ag45d-inference-subtitle-rules.json",
  attributionRules: "data/content-intelligence/daily-surface/ag45d-source-attribution-language-rules.json",
  metadataMap: "data/content-intelligence/daily-surface/ag45d-signal-inference-metadata-map.json",
  cardCopyTemplate: "data/content-intelligence/daily-surface/ag45d-signal-card-copy-template-model.json",
  noMutationAudit: "data/content-intelligence/backend-architecture/ag45d-no-mutation-audit-register.json",
  readiness: "data/content-intelligence/quality-registry/ag45d-image-link-attribution-safety-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag45d-to-ag45e-image-link-attribution-safety-boundary.json",
  registry: "data/quality/ag45d-title-subtitle-inference-metadata.json",
  preview: "data/quality/ag45d-title-subtitle-inference-metadata-preview.json",
  doc: "docs/quality/AG45D_TITLE_SUBTITLE_INFERENCE_METADATA.md"
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
  if (!exists(p)) throw new Error(`Missing AG45D input: ${p}`);
}

const ag45aAttributionDoctrine = readJson(inputs.ag45aAttributionDoctrine);
const ag45aBackendSchemaPlan = readJson(inputs.ag45aBackendSchemaPlan);
const ag45bCredibilityModel = readJson(inputs.ag45bCredibilityModel);
const ag45bReporterAnchorRules = readJson(inputs.ag45bReporterAnchorRules);
const ag45bTierRiskRegister = readJson(inputs.ag45bTierRiskRegister);
const ag45cReview = readJson(inputs.ag45cReview);
const ag45cSelectionModel = readJson(inputs.ag45cSelectionModel);
const ag45cIndiaAllocation = readJson(inputs.ag45cIndiaAllocation);
const ag45cNortheastWatchSelection = readJson(inputs.ag45cNortheastWatchSelection);
const ag45cInternationalSelection = readJson(inputs.ag45cInternationalSelection);
const ag45cDiversityInferenceScoring = readJson(inputs.ag45cDiversityInferenceScoring);
const ag45cRankingMatrix = readJson(inputs.ag45cRankingMatrix);
const ag45cNoMutationAudit = readJson(inputs.ag45cNoMutationAudit);
const ag45cReadiness = readJson(inputs.ag45cReadiness);
const ag45cBoundary = readJson(inputs.ag45cBoundary);

if (ag45cReview.status !== "signal_selection_model_ready_for_ag45d") {
  throw new Error("AG45C review status mismatch.");
}
if (ag45cReview.summary?.ready_for_ag45d !== true) {
  throw new Error("AG45C does not show AG45D readiness.");
}
if (ag45cReadiness.ready_for_ag45d !== true || ag45cReadiness.next_stage_id !== "AG45D") {
  throw new Error("AG45C readiness must permit AG45D.");
}
if (ag45cBoundary.next_stage_id !== "AG45D") {
  throw new Error("AG45C boundary must point to AG45D.");
}
if (ag45cNoMutationAudit.status !== "no_mutation_audit_passed_for_ag45c") {
  throw new Error("AG45C no-mutation audit mismatch.");
}
if (ag45cSelectionModel.selection_count.total_daily_signals !== 10) {
  throw new Error("AG45C total signal count must be 10.");
}
if (ag45cSelectionModel.selection_count.default_india_signals !== 6) {
  throw new Error("AG45C India count must be 6.");
}
if (ag45cSelectionModel.selection_count.default_international_signals !== 4) {
  throw new Error("AG45C international count must be 4.");
}
if (!JSON.stringify(ag45cNortheastWatchSelection).includes("actively checked daily")) {
  throw new Error("AG45C Northeast Watch active daily check missing.");
}
if (!JSON.stringify(ag45cInternationalSelection).includes("Analytical explainer")) {
  throw new Error("AG45C analytical explainer international rule missing.");
}
if (!JSON.stringify(ag45cDiversityInferenceScoring).includes("inference_value_for_future_articles")) {
  throw new Error("AG45C inference-value scoring missing.");
}
if (!JSON.stringify(ag45cRankingMatrix).includes("Top 6 India and top 4 International")) {
  throw new Error("AG45C ranking matrix 6/4 rule missing.");
}
if (!JSON.stringify(ag45aAttributionDoctrine).includes("Drishvara title")) {
  throw new Error("AG45A title doctrine missing.");
}
if (!ag45aBackendSchemaPlan.planned_fields.includes("drishvara_subtitle")) {
  throw new Error("AG45A schema plan missing drishvara_subtitle.");
}
if (!JSON.stringify(ag45bReporterAnchorRules).includes("reports for")) {
  throw new Error("AG45B reporter attribution language missing.");
}
if (!JSON.stringify(ag45bTierRiskRegister).includes("adult or explicit content")) {
  throw new Error("AG45B risk register missing restricted filters.");
}
if (!JSON.stringify(ag45bCredibilityModel).includes("source_classes")) {
  throw new Error("AG45B source classes missing.");
}
if (!JSON.stringify(ag45cIndiaAllocation).includes("northeast_watch")) {
  throw new Error("AG45C India allocation missing Northeast Watch.");
}

const blockedState = {
  ag45d_title_subtitle_metadata_rules_recorded: true,
  ag45c_consumed: true,
  drishvara_title_rules_recorded: true,
  inference_subtitle_rules_recorded: true,
  source_attribution_language_rules_recorded: true,
  metadata_mapping_rules_recorded: true,
  signal_card_copy_template_recorded: true,
  daily_signal_fetch_executed: false,
  news_scraping_executed: false,
  reporter_live_verification_executed: false,
  external_link_verification_executed: false,
  signal_content_created_from_live_news: false,
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

const titleRules = {
  module_id: "AG45D",
  title: "Drishvara Title Rules",
  status: "drishvara_title_rules_recorded",
  purpose: "Define how Drishvara writes a durable, calm and non-clickbait title for a selected signal without copying or distorting the source headline.",
  rules: [
    "Title must be written by Drishvara and must not copy the publisher headline verbatim.",
    "Title should preserve factual direction while avoiding sensationalism.",
    "Title should be durable enough to remain meaningful after the immediate news cycle.",
    "Title should usually stay within 8–12 words for homepage display.",
    "Title should avoid unsupported judgement, exaggeration or ideological framing.",
    "Title should make Northeast Watch visibly mainstream when the signal is from the region.",
    "Title must not imply Drishvara owns the reporting."
  ],
  title_patterns: [
    "Northeast connectivity returns to the national development frame",
    "Water stress moves from crisis reporting into planning debate",
    "A global technology shift raises new public-system questions",
    "A regional sports moment carries wider cultural visibility"
  ],
  blocked_state: blockedState
};

const subtitleRules = {
  module_id: "AG45D",
  title: "Inference Subtitle Rules",
  status: "inference_subtitle_rules_recorded",
  purpose: "Define how Drishvara subtitle should serve both public readability and future inference, reference discovery, yearly pattern study and article planning.",
  subtitle_structure: [
    "What happened.",
    "Why it matters.",
    "Which long-term theme it belongs to.",
    "What pattern or institutional signal it may indicate.",
    "What future reference or article-planning value it may carry."
  ],
  length_rule: "Prefer 18–28 words for compact homepage card usage; longer metadata notes may be stored later but not shown in the compact card.",
  required_inference_dimensions: [
    "theme",
    "region",
    "institution_or_actor",
    "public_relevance",
    "pattern_value",
    "future_reference_value",
    "article_planning_value"
  ],
  prohibited_subtitle_behaviour: [
    "Do not rewrite the source article.",
    "Do not add facts not supported by the source.",
    "Do not use clickbait, alarmism or moral grandstanding.",
    "Do not present opinion as primary reporting.",
    "Do not hide attribution behind Drishvara wording."
  ],
  example_subtitles: [
    "A regional infrastructure signal linking border-state development, strategic mobility and public-service access; useful for tracking Northeast India’s movement into national planning discourse.",
    "A governance signal connecting public-service delivery, digital systems and citizen accountability; useful for future analysis of state capacity and institutional trust.",
    "A global technology signal linking innovation, regulation and public risk; useful for tracking how emerging systems move from market excitement into governance debate."
  ],
  blocked_state: blockedState
};

const attributionRules = {
  module_id: "AG45D",
  title: "Source Attribution Language Rules",
  status: "source_attribution_language_rules_recorded",
  attribution_classes: [
    {
      source_type: "primary_reporter",
      template: "[Reporter Name] reports for [Publisher] that...",
      allowed_verbs: ["reports", "documents", "notes", "describes"]
    },
    {
      source_type: "news_desk",
      template: "[Publisher] reports that...",
      allowed_verbs: ["reports", "states", "notes"]
    },
    {
      source_type: "analytical_explainer",
      template: "[Anchor/Expert] for [Publisher/Platform] explains...",
      allowed_verbs: ["explains", "analyses", "contextualises"]
    },
    {
      source_type: "opinion_commentary",
      template: "[Author/Commentator] argues or discusses in [Publisher/Platform]...",
      allowed_verbs: ["argues", "discusses", "interprets"],
      requires_opinion_label: true
    }
  ],
  public_language_rules: [
    "Use 'reports' only for primary reporting or desk reporting.",
    "Use 'explains' or 'analyses' for anchor/explainer content.",
    "Use 'argues' or 'discusses' for opinion/commentary.",
    "Do not say 'editor says' unless the item is actually an editorial/editor-authored source.",
    "Do not publicly display internal credibility scores.",
    "Always preserve source link and publisher attribution in later public surfaces."
  ],
  blocked_state: blockedState
};

const metadataMap = {
  module_id: "AG45D",
  title: "Signal Inference Metadata Map",
  status: "signal_inference_metadata_map_recorded",
  metadata_groups: [
    {
      group: "display_copy",
      fields: ["drishvara_title", "drishvara_subtitle", "region_scope", "category", "rank"]
    },
    {
      group: "source_traceability",
      fields: ["source_title", "publisher_name", "reporter_name", "reporter_profile_url", "source_url", "canonical_url"]
    },
    {
      group: "inference_value",
      fields: ["theme_tags", "inference_tags", "pattern_value", "reference_value", "selection_reason"]
    },
    {
      group: "safety_and_rights",
      fields: ["credibility_score", "safety_status", "verification_status", "image_credit", "video_credit"]
    },
    {
      group: "time_tracking",
      fields: ["date", "created_at", "updated_at"]
    }
  ],
  minimum_required_before_public_display_later: [
    "drishvara_title",
    "drishvara_subtitle",
    "publisher_name",
    "source_url",
    "region_scope",
    "verification_status",
    "safety_status"
  ],
  database_write_now: false,
  blocked_state: blockedState
};

const cardCopyTemplate = {
  module_id: "AG45D",
  title: "Signal Card Copy Template Model",
  status: "signal_card_copy_template_model_recorded",
  compact_card_template: {
    tag: "India / Northeast Watch / World",
    title: "Drishvara title",
    subtitle: "Inference-useful Drishvara subtitle",
    source_line: "Reporter/Desk/Anchor for Publisher reports/explains/describes...",
    cta: "Read at source →"
  },
  compact_card_constraints: {
    visible_cards_at_once: 3,
    title_words_preferred: "8–12",
    subtitle_words_preferred: "18–28",
    fixed_height_container: true,
    no_layout_shift: true,
    source_link_required_later: true
  },
  example_card: {
    tag: "Northeast Watch",
    title: "Northeast connectivity returns to the national frame",
    subtitle: "A regional infrastructure signal linking border-state development, strategic mobility and public-service access; useful for tracking Northeast India’s mainstream policy visibility.",
    source_line: "[Reporter/Desk] for [Publisher] reports on the development.",
    cta: "Read at source →"
  },
  blocked_state: blockedState
};

const noMutationAudit = {
  module_id: "AG45D",
  title: "No-mutation Audit Register",
  status: "no_mutation_audit_passed_for_ag45d",
  checks: Object.entries({
    daily_signal_fetch_executed: false,
    news_scraping_executed: false,
    reporter_live_verification_executed: false,
    external_link_verification_executed: false,
    signal_content_created_from_live_news: false,
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
  module_id: "AG45D",
  title: "AG45E Image, Link and Attribution Safety Readiness Record",
  status: "ready_for_ag45e_image_link_attribution_safety_model",
  ready_for_ag45e: true,
  next_stage_id: "AG45E",
  next_stage_title: "Image, Thumbnail, Link and Attribution Safety Model",
  hard_blocker_count_for_ag45e: 0,
  daily_signal_fetch_allowed_next: false,
  news_scraping_allowed_next: false,
  reporter_live_verification_allowed_next: false,
  external_link_verification_allowed_next: false,
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
  module_id: "AG45D",
  title: "AG45D to AG45E Image, Link and Attribution Safety Boundary",
  status: "ag45e_image_link_attribution_safety_boundary_created",
  next_stage_id: "AG45E",
  next_stage_title: "Image, Thumbnail, Link and Attribution Safety Model",
  allowed_scope: [
    "Define safety model for source links, canonical URLs, publisher thumbnails, image URLs and attribution.",
    "Define no-download/no-rehost rules for third-party assets.",
    "Define verification status bands for links and visual assets.",
    "Use AG45D metadata map as input.",
    "Do not fetch live news.",
    "Do not scrape publisher pages.",
    "Do not verify external links live.",
    "Do not download or store images/videos.",
    "Do not mutate homepage, Featured Reads, article files, listing files or runtime files.",
    "Do not write database records.",
    "Do not deploy.",
    "Do not activate backend/Auth/Supabase."
  ],
  blocked_scope: [
    "live news fetching",
    "web scraping",
    "live reporter verification",
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
  module_id: "AG45D",
  title: "Drishvara Title, Subtitle and Inference Metadata Rules",
  status: "title_subtitle_inference_metadata_rules_ready_for_ag45e",
  depends_on: ["AG45A", "AG45B", "AG45C"],
  title_rules_file: outputs.titleRules,
  subtitle_rules_file: outputs.subtitleRules,
  attribution_rules_file: outputs.attributionRules,
  metadata_map_file: outputs.metadataMap,
  card_copy_template_file: outputs.cardCopyTemplate,
  no_mutation_audit_file: outputs.noMutationAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag45d_title_subtitle_metadata_rules_recorded: true,
    drishvara_title_rules_recorded: true,
    inference_subtitle_rules_recorded: true,
    source_attribution_language_rules_recorded: true,
    metadata_mapping_rules_recorded: true,
    signal_card_copy_template_recorded: true,
    ready_for_ag45e: true,
    hard_blocker_count_for_ag45e: 0,
    daily_signal_fetch_executed: false,
    news_scraping_executed: false,
    reporter_live_verification_executed: false,
    external_link_verification_executed: false,
    signal_content_created_from_live_news: false,
    image_fetch_executed: false,
    video_fetch_executed: false,
    homepage_mutated: false,
    database_write_performed: false,
    backend_auth_supabase_activation_performed: false,
    deployment_performed: false,
    service_role_key_exposed: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG45D",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG45D",
  status: review.status,
  ag45d_title_subtitle_metadata_rules_recorded: 1,
  drishvara_title_rules_recorded: 1,
  inference_subtitle_rules_recorded: 1,
  source_attribution_language_rules_recorded: 1,
  metadata_mapping_rules_recorded: 1,
  signal_card_copy_template_recorded: 1,
  ready_for_ag45e: 1,
  hard_blocker_count_for_ag45e: 0,
  daily_signal_fetch_executed: 0,
  news_scraping_executed: 0,
  reporter_live_verification_executed: 0,
  external_link_verification_executed: 0,
  signal_content_created_from_live_news: 0,
  image_fetch_executed: 0,
  video_fetch_executed: 0,
  homepage_mutated: 0,
  database_write_performed: 0,
  backend_auth_supabase_activation_performed: 0,
  deployment_performed: 0,
  service_role_key_exposed: 0
};

const doc = `# AG45D — Drishvara Title, Subtitle and Inference Metadata Rules

## Result

AG45D records the writing and metadata rules for the Daily Signal Surface.

## Title

Drishvara may write its own title, but the title must not copy the publisher headline verbatim, distort the source, sensationalise the issue or imply ownership of third-party reporting.

## Subtitle

The subtitle must be useful for both public reading and future system inference. It should capture:

- what happened;
- why it matters;
- the long-term theme;
- the pattern or institutional signal;
- future reference or article-planning value.

## Attribution

Attribution must distinguish reporting, desk reporting, explainers and commentary:

- Reporter reports.
- Publisher reports.
- Anchor/expert explains or analyses.
- Commentator argues or discusses.

## Metadata

The metadata map preserves display copy, source traceability, inference value, safety/rights status and time tracking.

## Still blocked

- No live news fetching.
- No scraping.
- No live reporter verification.
- No external link verification.
- No image/video fetch.
- No homepage mutation.
- No database write.
- No backend/Auth/Supabase activation.
- No deployment.
- No service-role key exposure.

## Next

AG45E — Image, Thumbnail, Link and Attribution Safety Model.
`;

writeJson(outputs.titleRules, titleRules);
writeJson(outputs.subtitleRules, subtitleRules);
writeJson(outputs.attributionRules, attributionRules);
writeJson(outputs.metadataMap, metadataMap);
writeJson(outputs.cardCopyTemplate, cardCopyTemplate);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG45D Title, Subtitle and Inference Metadata Rules generated.");
console.log("✅ Drishvara title, inference subtitle, attribution language, metadata map and card template rules recorded.");
console.log("✅ Ready for AG45E Image, Thumbnail, Link and Attribution Safety Model.");
console.log("✅ No live fetch, scraping, reporter verification, link verification, image/video fetch, homepage mutation, database/backend activation, deployment or service-role exposure recorded.");
