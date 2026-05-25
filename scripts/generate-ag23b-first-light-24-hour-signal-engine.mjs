import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag23aReview: "data/content-intelligence/quality-reviews/ag23a-homepage-daily-route-doctrine.json",
  ag23aDoctrine: "data/content-intelligence/homepage/ag23a-homepage-daily-route-doctrine.json",
  ag23aRoute: "data/content-intelligence/homepage/ag23a-discover-read-reflect-route-map.json",
  ag23aModuleMap: "data/content-intelligence/homepage/ag23a-homepage-module-intent-map.json",
  ag23aReadiness: "data/content-intelligence/quality-registry/ag23a-first-light-signal-engine-readiness-record.json",
  ag23aBoundary: "data/content-intelligence/mutation-plans/ag23a-to-ag23b-first-light-24-hour-signal-engine-boundary.json",
  supabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag23b-first-light-24-hour-signal-engine.json",
  engine: "data/content-intelligence/homepage/ag23b-first-light-24-hour-signal-engine.json",
  signalTypes: "data/content-intelligence/homepage/ag23b-first-light-signal-type-registry.json",
  sourceBands: "data/content-intelligence/homepage/ag23b-first-light-source-band-plan.json",
  freshnessRules: "data/content-intelligence/homepage/ag23b-first-light-freshness-and-safety-rules.json",
  blocker: "data/content-intelligence/quality-registry/ag23b-first-light-signal-engine-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag23b-signal-to-article-conversion-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag23b-to-ag23c-signal-to-article-conversion-logic-boundary.json",
  registry: "data/quality/ag23b-first-light-24-hour-signal-engine.json",
  preview: "data/quality/ag23b-first-light-24-hour-signal-engine-preview.json",
  doc: "docs/quality/AG23B_FIRST_LIGHT_24_HOUR_SIGNAL_ENGINE.md"
};

function exists(p) {
  return fs.existsSync(path.join(root, p));
}
function readJson(p) {
  return JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
}
function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
  fs.writeFileSync(path.join(root, p), JSON.stringify(obj, null, 2) + "\n");
}
function writeText(p, text) {
  fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
  fs.writeFileSync(path.join(root, p), text);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG23B input: ${p}`);
}

const ag23aReview = readJson(inputs.ag23aReview);
const ag23aReadiness = readJson(inputs.ag23aReadiness);
const ag23aBoundary = readJson(inputs.ag23aBoundary);
const supabaseReminder = readJson(inputs.supabaseReminder);

if (ag23aReview.status !== "homepage_daily_route_doctrine_created_ready_for_ag23b") {
  throw new Error("AG23A review is not ready for AG23B.");
}
if (ag23aReadiness.ready_for_ag23b !== true) {
  throw new Error("AG23A readiness does not allow AG23B.");
}
if (ag23aBoundary.next_stage_id !== "AG23B") {
  throw new Error("AG23A boundary does not point to AG23B.");
}

const blockedState = {
  homepage_mutated: false,
  first_light_live_feed_enabled: false,
  news_scraping_enabled: false,
  external_api_called: false,
  article_generated: false,
  article_file_created: false,
  github_token_created: false,
  github_write_performed: false,
  deployment_triggered: false,
  article_published: false,
  supabase_auth_backend_activated: false
};

const signalTypes = {
  module_id: "AG23B",
  title: "First Light Signal Type Registry",
  status: "signal_type_registry_created_no_live_feed",
  signal_types: [
    {
      signal_type: "india_public_life",
      purpose: "National governance, public programmes, civic systems and institutional developments."
    },
    {
      signal_type: "regional_northeast",
      purpose: "Arunachal/Northeast-relevant social, ecological, infrastructure and governance signals."
    },
    {
      signal_type: "world_affairs",
      purpose: "Major global events with explanatory or reflective value."
    },
    {
      signal_type: "knowledge_science_health",
      purpose: "Science, health, education, technology and learning-oriented developments."
    },
    {
      signal_type: "culture_spirituality_time",
      purpose: "Calendar, festival, civilizational, reflective and spiritual context."
    },
    {
      signal_type: "long_series_candidate",
      purpose: "Signals suitable for weekly/episodic treatment over several weeks."
    }
  ],
  blocked_state: blockedState
};

const sourceBands = {
  module_id: "AG23B",
  title: "First Light Source Band Plan",
  status: "source_band_plan_created_no_fetching",
  source_bands: [
    {
      band: "official_primary",
      examples: ["government portals", "official releases", "institutional reports"],
      trust_use: "highest_preference_for_policy_or_public_programme_claims"
    },
    {
      band: "reputed_news_reference",
      examples: ["established national/international newsrooms"],
      trust_use: "contextual_signal_only_until_verified"
    },
    {
      band: "knowledge_reference",
      examples: ["research institutions", "academic explainers", "reputed public knowledge sources"],
      trust_use: "for science, health, education and explanatory topics"
    },
    {
      band: "cultural_calendar_reference",
      examples: ["calendar records", "festival references", "traditional timing sources"],
      trust_use: "for reflective/calendar context with careful wording"
    }
  ],
  no_live_fetching_now: true,
  blocked_state: blockedState
};

const freshnessRules = {
  module_id: "AG23B",
  title: "First Light Freshness and Safety Rules",
  status: "freshness_and_safety_rules_created_no_claims",
  rules: [
    "Prefer 24-hour signals only when reliable sources are available.",
    "Do not present unverified social media claims as facts.",
    "Use cautious wording for developing events.",
    "Separate signal summary from Drishvara reflection.",
    "Do not auto-generate article from a signal until AG23C conversion logic scores it.",
    "Do not activate scraping, API calls or live feeds in AG23B."
  ],
  blocked_state: blockedState
};

const engine = {
  module_id: "AG23B",
  title: "First Light 24-Hour Signal Engine",
  status: "first_light_24_hour_signal_engine_created_pending_ag23c",
  engine_type: "planning_only_non_live",
  purpose: "Define how Drishvara will identify and structure curated 24-hour signals for the homepage Discover layer.",
  signal_window: "rolling_24_hour_reference_window",
  signal_type_registry_file: outputs.signalTypes,
  source_band_plan_file: outputs.sourceBands,
  freshness_rules_file: outputs.freshnessRules,
  future_outputs: [
    "daily_signal_candidates",
    "signal_relevance_scores",
    "article_brief_candidates",
    "weekly_episode_candidates",
    "homepage_discover_cards"
  ],
  supabase_auth_backend_deferred: true,
  supabase_reminder: supabaseReminder.reminder,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG23B",
  title: "First Light Signal Engine Blocker Register",
  status: "first_light_signal_engine_operations_blocked_pending_ag23c",
  blocked_items: [
    "No homepage mutation.",
    "No live First Light feed.",
    "No scraping.",
    "No external API call.",
    "No article generation.",
    "No article file creation.",
    "No GitHub token creation.",
    "No GitHub write.",
    "No deployment trigger.",
    "No publishing.",
    "No Supabase/Auth/backend activation."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG23B",
  title: "Signal-to-Article Conversion Readiness Record",
  status: "ready_for_ag23c_signal_to_article_conversion_logic",
  ready_for_ag23c: true,
  next_stage_id: "AG23C",
  next_stage_title: "Signal-to-Article Conversion Logic",
  signal_engine_created: true,
  signal_types_created: true,
  source_bands_created: true,
  freshness_rules_created: true,
  real_execution_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG23B",
  title: "AG23B to AG23C Signal-to-Article Conversion Logic Boundary",
  status: "ag23c_boundary_created_not_started",
  next_stage_id: "AG23C",
  next_stage_title: "Signal-to-Article Conversion Logic",
  allowed_scope: [
    "Define how signals become article briefs or episode candidates.",
    "Define scoring fields for relevance, freshness, Drishvara fit, risk and series potential.",
    "Keep it non-live and non-mutating."
  ],
  blocked_scope: blocker.blocked_items,
  supabase_auth_backend_deferred: true
};

const review = {
  module_id: "AG23B",
  title: "First Light 24-Hour Signal Engine",
  status: "first_light_24_hour_signal_engine_created_ready_for_ag23c",
  depends_on: ["AG23A"],
  generated_from: inputs,
  engine_file: outputs.engine,
  signal_types_file: outputs.signalTypes,
  source_bands_file: outputs.sourceBands,
  freshness_rules_file: outputs.freshnessRules,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    first_light_signal_engine_created: true,
    live_feed_enabled: false,
    scraping_enabled: false,
    ready_for_ag23c: true,
    real_execution_done: false,
    supabase_auth_backend_deferred: true
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG23B",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG23B",
  preview_only: true,
  status: review.status,
  message: "AG23B First Light signal engine created. Next: AG23C Signal-to-Article Conversion Logic.",
  blocked_state: blockedState
};

const doc = `# AG23B — First Light 24-Hour Signal Engine

## Purpose

AG23B defines the non-live First Light signal engine for the homepage Discover layer.

## Signal Bands

- India public life
- Regional/Northeast relevance
- World affairs
- Knowledge, science, health and education
- Culture, spirituality and time
- Long-series candidates

## Safety

AG23B does not fetch live news, scrape websites, call APIs, generate articles, mutate homepage files, write to GitHub, deploy or publish.

## Next Stage

AG23C — Signal-to-Article Conversion Logic.
`;

writeJson(outputs.review, review);
writeJson(outputs.engine, engine);
writeJson(outputs.signalTypes, signalTypes);
writeJson(outputs.sourceBands, sourceBands);
writeJson(outputs.freshnessRules, freshnessRules);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG23B First Light 24-Hour Signal Engine generated.");
console.log("✅ Signal types, source bands and freshness/safety rules created.");
console.log("✅ No live feed, scraping, API call, homepage mutation, GitHub write or publishing performed.");
console.log("✅ AG23C Signal-to-Article Conversion Logic boundary created.");
