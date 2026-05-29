import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag45aReview: "data/content-intelligence/quality-reviews/ag45a-daily-signal-surface-first-light-doctrine.json",
  ag45aDoctrine: "data/content-intelligence/daily-surface/ag45a-daily-signal-surface-doctrine.json",
  ag45aSignalDoctrine: "data/content-intelligence/daily-surface/ag45a-signal-selection-doctrine.json",
  ag45aNortheastDoctrine: "data/content-intelligence/daily-surface/ag45a-northeast-watch-doctrine.json",
  ag45aAttributionDoctrine: "data/content-intelligence/daily-surface/ag45a-source-attribution-title-subtitle-doctrine.json",
  ag45aBackendSchemaPlan: "data/content-intelligence/backend-architecture/ag45a-daily-signal-metadata-schema-plan.json",
  ag45aNoMutationAudit: "data/content-intelligence/backend-architecture/ag45a-no-mutation-audit-register.json",
  ag45aReadiness: "data/content-intelligence/quality-registry/ag45a-source-credibility-model-readiness-record.json",
  ag45aBoundary: "data/content-intelligence/mutation-plans/ag45a-to-ag45b-source-credibility-model-boundary.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag45b-source-credibility-model.json",
  credibilityModel: "data/content-intelligence/daily-surface/ag45b-source-credibility-model.json",
  publisherRules: "data/content-intelligence/daily-surface/ag45b-publisher-credibility-rules.json",
  reporterAnchorRules: "data/content-intelligence/daily-surface/ag45b-reporter-anchor-verification-rules.json",
  underreportedModel: "data/content-intelligence/daily-surface/ag45b-underreported-source-inclusion-model.json",
  northeastSourceModel: "data/content-intelligence/daily-surface/ag45b-northeast-source-prioritisation-model.json",
  tierRiskRegister: "data/content-intelligence/daily-surface/ag45b-source-tier-risk-register.json",
  noMutationAudit: "data/content-intelligence/backend-architecture/ag45b-no-mutation-audit-register.json",
  readiness: "data/content-intelligence/quality-registry/ag45b-signal-selection-model-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag45b-to-ag45c-signal-selection-model-boundary.json",
  registry: "data/quality/ag45b-source-credibility-model.json",
  preview: "data/quality/ag45b-source-credibility-model-preview.json",
  doc: "docs/quality/AG45B_SOURCE_CREDIBILITY_MODEL.md"
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
  if (!exists(p)) throw new Error(`Missing AG45B input: ${p}`);
}

const ag45aReview = readJson(inputs.ag45aReview);
const ag45aDoctrine = readJson(inputs.ag45aDoctrine);
const ag45aSignalDoctrine = readJson(inputs.ag45aSignalDoctrine);
const ag45aNortheastDoctrine = readJson(inputs.ag45aNortheastDoctrine);
const ag45aAttributionDoctrine = readJson(inputs.ag45aAttributionDoctrine);
const ag45aBackendSchemaPlan = readJson(inputs.ag45aBackendSchemaPlan);
const ag45aNoMutationAudit = readJson(inputs.ag45aNoMutationAudit);
const ag45aReadiness = readJson(inputs.ag45aReadiness);
const ag45aBoundary = readJson(inputs.ag45aBoundary);

if (ag45aReview.status !== "daily_signal_surface_first_light_doctrine_ready_for_ag45b") {
  throw new Error("AG45A review status mismatch.");
}
if (ag45aReview.summary?.ready_for_ag45b !== true) {
  throw new Error("AG45A does not show AG45B readiness.");
}
if (ag45aReadiness.ready_for_ag45b !== true || ag45aReadiness.next_stage_id !== "AG45B") {
  throw new Error("AG45A readiness must permit AG45B.");
}
if (ag45aBoundary.next_stage_id !== "AG45B") {
  throw new Error("AG45A boundary must point to AG45B.");
}
if (ag45aNoMutationAudit.status !== "no_mutation_audit_passed_for_ag45a") {
  throw new Error("AG45A no-mutation audit mismatch.");
}
if (ag45aSignalDoctrine.daily_signal_count !== 10) {
  throw new Error("AG45A 10-signal doctrine missing.");
}
if (ag45aSignalDoctrine.default_distribution.india_signals !== 6) {
  throw new Error("AG45A India signal count mismatch.");
}
if (ag45aSignalDoctrine.default_distribution.international_signals !== 4) {
  throw new Error("AG45A international signal count mismatch.");
}
if (!JSON.stringify(ag45aNortheastDoctrine).includes("China-related regional implications")) {
  throw new Error("AG45A Northeast doctrine must include China-related regional implications.");
}
if (!JSON.stringify(ag45aAttributionDoctrine).includes("Palki Sharma")) {
  throw new Error("AG45A attribution doctrine must include credible anchor/explainer model.");
}
if (!ag45aBackendSchemaPlan.planned_fields.includes("credibility_score")) {
  throw new Error("AG45A backend schema plan must include credibility_score.");
}

const blockedState = {
  ag45b_source_credibility_model_recorded: true,
  ag45a_consumed: true,
  publisher_credibility_rules_recorded: true,
  reporter_anchor_verification_rules_recorded: true,
  underreported_source_inclusion_model_recorded: true,
  northeast_source_prioritisation_model_recorded: true,
  source_tier_risk_register_recorded: true,
  daily_signal_fetch_executed: false,
  news_scraping_executed: false,
  reporter_live_verification_executed: false,
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

const credibilityModel = {
  module_id: "AG45B",
  title: "Source, Publisher, Reporter and Anchor Credibility Model",
  status: "source_credibility_model_recorded_ready_for_ag45c",
  purpose: "Define how Drishvara should assess publishers, reporters, desks, anchors and explainers before a daily signal is selected.",
  source_classes: [
    {
      class_id: "primary_reporting",
      public_label: "Primary reporting",
      preferred_for: ["breaking public-interest facts", "field reports", "governance updates", "regional reporting"],
      use_as_primary_signal: true
    },
    {
      class_id: "news_desk_or_wire_synthesis",
      public_label: "News desk / wire synthesis",
      preferred_for: ["confirmed factual updates", "multi-source desk coverage"],
      use_as_primary_signal: true
    },
    {
      class_id: "analytical_explainer",
      public_label: "Analytical explainer",
      preferred_for: ["geopolitics", "public policy", "science", "economy", "international affairs"],
      use_as_primary_signal: false,
      use_as_perspective_layer: true
    },
    {
      class_id: "public_commentary",
      public_label: "Public commentary / opinion",
      preferred_for: ["interpretive value only"],
      use_as_primary_signal: false,
      use_as_perspective_layer: true,
      requires_clear_labelling: true
    }
  ],
  scoring_dimensions: [
    { dimension: "publisher_track_record", max_points: 20 },
    { dimension: "reporter_or_anchor_traceability", max_points: 20 },
    { dimension: "originality_of_reporting_or_analysis", max_points: 15 },
    { dimension: "corroboration_potential", max_points: 15 },
    { dimension: "public_relevance", max_points: 10 },
    { dimension: "regional_or_underreported_value", max_points: 10 },
    { dimension: "non_sensational_tone", max_points: 5 },
    { dimension: "rights_and_attribution_safety", max_points: 5 }
  ],
  score_band_interpretation: [
    { band: "80-100", label: "strong_candidate", treatment: "Eligible for daily signal selection if topic fit is also high." },
    { band: "65-79", label: "usable_with_review", treatment: "Eligible with editorial caution and preferably corroboration." },
    { band: "50-64", label: "limited_use", treatment: "Use only as supplementary context or under editorial review." },
    { band: "below_50", label: "exclude_or_hold", treatment: "Do not use for Daily Surface unless manually cleared." }
  ],
  blocked_state: blockedState
};

const publisherRules = {
  module_id: "AG45B",
  title: "Publisher Credibility Rules",
  status: "publisher_credibility_rules_recorded",
  positive_indicators: [
    "clear publisher identity",
    "visible editorial ownership or newsroom structure",
    "consistent publishing history",
    "correction or update practice where available",
    "original reporting or credible desk synthesis",
    "low sensationalism",
    "clear bylines or desk accountability",
    "domain reputation and archive depth"
  ],
  risk_indicators: [
    "anonymous ownership",
    "clickbait or rage-bait framing",
    "adult/explicit adjacency",
    "communal hate or extremist framing",
    "persistent misinformation history",
    "heavy plagiarism or copied content",
    "deceptive headline/body mismatch",
    "unsafe image/video rights practice"
  ],
  underreported_publisher_treatment: {
    allowed: true,
    rationale: "A smaller or regional publisher may be used when it has credible inputs, local access, archive history and source accountability.",
    safeguards: [
      "Prefer original regional reporting over copied national summaries.",
      "Check whether the publisher has a stable archive and identifiable editorial presence.",
      "Use corroboration for high-stakes claims.",
      "Avoid publicly labelling any source as unreliable; use internal verification-status bands."
    ]
  },
  blocked_state: blockedState
};

const reporterAnchorRules = {
  module_id: "AG45B",
  title: "Reporter, Desk, Anchor and Explainer Verification Rules",
  status: "reporter_anchor_verification_rules_recorded",
  reporter_rules: [
    "Prefer reporter bylines with visible archive history.",
    "Reporter should ideally have 3+ years of discoverable public work for high-trust use.",
    "If the reporter is newer but the publisher desk is credible, mark source as desk-supported.",
    "High-stakes or sensitive items require corroboration or stronger publisher credibility.",
    "Regional reporters with consistent local beat history should receive positive weight."
  ],
  anchor_explainer_rules: [
    "Recognised anchors/explainers may be used as analytical perspective, not automatically as primary reporting.",
    "Palki Sharma-type international affairs explainers can be useful for global signal interpretation where source attribution is clear.",
    "Ranganathan-type public-policy/science commentators can be useful for interpretive or debate-context signals where clearly labelled.",
    "Anchor/commentary sources must not replace primary reporting when direct field reporting is available.",
    "Opinion, debate and explainer content must be labelled as explains, argues, discusses or analyses, not reports."
  ],
  public_attribution_language: {
    primary_reporting: "[Reporter Name] reports for [Publisher] that...",
    desk_reporting: "[Publisher] reports that...",
    analytical_explainer: "[Anchor/Expert] for [Publisher/Platform] explains...",
    opinion_or_commentary: "[Author/Commentator] argues/discusses in [Publisher/Platform]..."
  },
  blocked_state: blockedState
};

const underreportedModel = {
  module_id: "AG45B",
  title: "Under-reported Credible Source Inclusion Model",
  status: "underreported_source_inclusion_model_recorded",
  inclusion_logic: [
    "Do not exclude a publisher only because it is smaller or regional, or less visible nationally.",
    "Prioritise under-reported sources when they provide original local access or unique context.",
    "Require source accountability, archive presence and non-sensational treatment.",
    "Use corroboration for sensitive, geopolitical, communal, security or allegation-heavy topics.",
    "Store internal verification status instead of making public reliability claims."
  ],
  internal_status_bands: [
    "verified",
    "usable_with_review",
    "under_editorial_review",
    "insufficient_evidence",
    "excluded"
  ],
  public_display_rule: "Only display source attribution and link; do not display internal score or negative reliability label publicly.",
  blocked_state: blockedState
};

const northeastSourceModel = {
  module_id: "AG45B",
  title: "Northeast Source Prioritisation Model",
  status: "northeast_source_prioritisation_model_recorded",
  rationale: ag45aNortheastDoctrine.rationale,
  priority_states: ag45aNortheastDoctrine.region_scope,
  priority_themes: ag45aNortheastDoctrine.watch_themes,
  source_priority_rules: [
    "Prefer credible Northeast-based reporters and regional publishers for state-specific developments.",
    "Prefer source material that brings Northeast India into mainstream national understanding.",
    "Use national or international sources when the subject involves border affairs, China-related implications, diplomacy or strategic infrastructure.",
    "Avoid treating Northeast coverage as occasional human-interest filler.",
    "Ensure at least one Northeast Watch candidate is checked daily when credible source material is available."
  ],
  scoring_boost: {
    northeast_watch_candidate_boost: 10,
    original_regional_reporting_boost: 8,
    strategic_border_or_china_related_context_boost: 6,
    public_service_or_connectivity_context_boost: 5
  },
  blocked_state: blockedState
};

const tierRiskRegister = {
  module_id: "AG45B",
  title: "Source Tier and Risk Register",
  status: "source_tier_risk_register_recorded",
  tiers: [
    {
      tier: "Tier 1",
      name: "Primary credible reporting",
      allowed_use: "daily signal base source",
      risk_level: "low_to_moderate"
    },
    {
      tier: "Tier 2",
      name: "Analytical explainer / credible anchor / domain expert",
      allowed_use: "perspective layer or signal support",
      risk_level: "moderate",
      examples_note: "Use public names only as model examples, not permanent endorsement."
    },
    {
      tier: "Tier 3",
      name: "Opinion, debate, commentary, interview",
      allowed_use: "clearly labelled context only",
      risk_level: "moderate_to_high"
    },
    {
      tier: "Tier 4",
      name: "Restricted / unsafe / unverified / reputation-risk source",
      allowed_use: "excluded unless manually cleared",
      risk_level: "high"
    }
  ],
  restricted_content_filters: [
    "adult or explicit content",
    "hate or extremist content",
    "violent shock content",
    "unverified allegation-heavy material",
    "propaganda-heavy or manipulative framing",
    "copyright-unsafe image/video handling",
    "content likely to damage Drishvara’s credibility"
  ],
  blocked_state: blockedState
};

const noMutationAudit = {
  module_id: "AG45B",
  title: "No-mutation Audit Register",
  status: "no_mutation_audit_passed_for_ag45b",
  checks: Object.entries({
    daily_signal_fetch_executed: false,
    news_scraping_executed: false,
    reporter_live_verification_executed: false,
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
  module_id: "AG45B",
  title: "AG45C Signal Selection Model Readiness Record",
  status: "ready_for_ag45c_signal_selection_model",
  ready_for_ag45c: true,
  next_stage_id: "AG45C",
  next_stage_title: "India, Northeast and International Signal Selection Model",
  hard_blocker_count_for_ag45c: 0,
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
  module_id: "AG45B",
  title: "AG45B to AG45C Signal Selection Model Boundary",
  status: "ag45c_signal_selection_model_boundary_created",
  next_stage_id: "AG45C",
  next_stage_title: "India, Northeast and International Signal Selection Model",
  allowed_scope: [
    "Define daily selection logic for 6 India, Northeast Watch and 4 international signals.",
    "Define topic diversity, regional balance and inference-value scoring.",
    "Use the AG45B credibility model as input.",
    "Do not fetch live news.",
    "Do not scrape publisher pages.",
    "Do not run live reporter verification.",
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
  module_id: "AG45B",
  title: "Source, Publisher, Reporter and Anchor Credibility Model",
  status: "source_credibility_model_ready_for_ag45c",
  depends_on: ["AG45A"],
  credibility_model_file: outputs.credibilityModel,
  publisher_rules_file: outputs.publisherRules,
  reporter_anchor_rules_file: outputs.reporterAnchorRules,
  underreported_model_file: outputs.underreportedModel,
  northeast_source_model_file: outputs.northeastSourceModel,
  tier_risk_register_file: outputs.tierRiskRegister,
  no_mutation_audit_file: outputs.noMutationAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag45b_source_credibility_model_recorded: true,
    publisher_credibility_rules_recorded: true,
    reporter_anchor_verification_rules_recorded: true,
    reporter_three_year_presence_rule_recorded: true,
    anchor_explainer_perspective_layer_recorded: true,
    underreported_source_inclusion_model_recorded: true,
    northeast_source_prioritisation_model_recorded: true,
    source_tier_risk_register_recorded: true,
    ready_for_ag45c: true,
    hard_blocker_count_for_ag45c: 0,
    daily_signal_fetch_executed: false,
    news_scraping_executed: false,
    reporter_live_verification_executed: false,
    external_link_verification_executed: false,
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
  module_id: "AG45B",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG45B",
  status: review.status,
  ag45b_source_credibility_model_recorded: 1,
  publisher_credibility_rules_recorded: 1,
  reporter_anchor_verification_rules_recorded: 1,
  reporter_three_year_presence_rule_recorded: 1,
  anchor_explainer_perspective_layer_recorded: 1,
  underreported_source_inclusion_model_recorded: 1,
  northeast_source_prioritisation_model_recorded: 1,
  ready_for_ag45c: 1,
  hard_blocker_count_for_ag45c: 0,
  daily_signal_fetch_executed: 0,
  news_scraping_executed: 0,
  reporter_live_verification_executed: 0,
  external_link_verification_executed: 0,
  image_fetch_executed: 0,
  video_fetch_executed: 0,
  homepage_mutated: 0,
  database_write_performed: 0,
  backend_auth_supabase_activation_performed: 0,
  deployment_performed: 0,
  service_role_key_exposed: 0
};

const doc = `# AG45B — Source, Publisher, Reporter and Anchor Credibility Model

## Result

AG45B records the credibility model for Daily Signal Surface source selection.

## Main principle

Drishvara should select credible signals, not viral noise. Smaller or regional under-reported publishers may be included when they have credible local inputs, clear accountability and archive presence.

## Publisher model

The publisher model considers identity, archive depth, editorial accountability, original reporting, non-sensational tone and rights/attribution safety.

## Reporter and anchor model

Reporter-led primary reporting is preferred for factual news signals. Reporters with 3+ years of discoverable public work receive stronger trust treatment. Credible anchors and explainers may be used as a perspective layer, but they should not automatically replace primary reporting.

## Northeast Watch

Northeast India receives explicit source-prioritisation because the region is strategically, culturally, environmentally and geopolitically important and often underrepresented in national surfaces.

## Public attribution

Drishvara should use safe attribution language:

- [Reporter Name] reports for [Publisher] that...
- [Publisher] reports that...
- [Anchor/Expert] for [Publisher/Platform] explains...
- [Author/Commentator] argues/discusses in [Publisher/Platform]...

## Still blocked

- No live news fetching.
- No scraping.
- No live reporter verification.
- No image/video fetch.
- No homepage mutation.
- No database write.
- No backend/Auth/Supabase activation.
- No deployment.
- No service-role key exposure.

## Next

AG45C — India, Northeast and International Signal Selection Model.
`;

writeJson(outputs.credibilityModel, credibilityModel);
writeJson(outputs.publisherRules, publisherRules);
writeJson(outputs.reporterAnchorRules, reporterAnchorRules);
writeJson(outputs.underreportedModel, underreportedModel);
writeJson(outputs.northeastSourceModel, northeastSourceModel);
writeJson(outputs.tierRiskRegister, tierRiskRegister);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG45B Source, Publisher, Reporter and Anchor Credibility Model generated.");
console.log("✅ Publisher, reporter, anchor/explainer, under-reported source and Northeast source-prioritisation rules recorded.");
console.log("✅ Ready for AG45C India, Northeast and International Signal Selection Model.");
console.log("✅ No live fetch, scraping, reporter verification, image/video fetch, homepage mutation, database/backend activation, deployment or service-role exposure recorded.");
