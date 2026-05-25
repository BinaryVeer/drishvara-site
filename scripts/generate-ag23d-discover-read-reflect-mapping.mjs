import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag23cReview: "data/content-intelligence/quality-reviews/ag23c-signal-to-article-conversion-logic.json",
  ag23cLogic: "data/content-intelligence/homepage/ag23c-signal-to-article-conversion-logic.json",
  ag23cScoring: "data/content-intelligence/homepage/ag23c-signal-scoring-fields.json",
  ag23cBrief: "data/content-intelligence/homepage/ag23c-article-brief-template.json",
  ag23cEpisode: "data/content-intelligence/homepage/ag23c-weekly-episode-candidate-logic.json",
  ag23cReadiness: "data/content-intelligence/quality-registry/ag23c-discover-read-reflect-mapping-readiness-record.json",
  ag23cBoundary: "data/content-intelligence/mutation-plans/ag23c-to-ag23d-discover-read-reflect-mapping-boundary.json",
  ag23aRoute: "data/content-intelligence/homepage/ag23a-discover-read-reflect-route-map.json",
  supabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag23d-discover-read-reflect-mapping.json",
  mapping: "data/content-intelligence/homepage/ag23d-discover-read-reflect-mapping.json",
  movementMap: "data/content-intelligence/homepage/ag23d-homepage-movement-module-map.json",
  placementMap: "data/content-intelligence/homepage/ag23d-signal-output-placement-map.json",
  reflectionMap: "data/content-intelligence/homepage/ag23d-reflection-layer-map.json",
  blocker: "data/content-intelligence/quality-registry/ag23d-discover-read-reflect-mapping-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag23d-daily-homepage-data-schema-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag23d-to-ag23e-daily-homepage-data-schema-boundary.json",
  registry: "data/quality/ag23d-discover-read-reflect-mapping.json",
  preview: "data/quality/ag23d-discover-read-reflect-mapping-preview.json",
  doc: "docs/quality/AG23D_DISCOVER_READ_REFLECT_MAPPING.md"
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
  if (!exists(p)) throw new Error(`Missing AG23D input: ${p}`);
}

const ag23cReview = readJson(inputs.ag23cReview);
const ag23cLogic = readJson(inputs.ag23cLogic);
const ag23cReadiness = readJson(inputs.ag23cReadiness);
const ag23cBoundary = readJson(inputs.ag23cBoundary);
const ag23aRoute = readJson(inputs.ag23aRoute);
const supabaseReminder = readJson(inputs.supabaseReminder);

if (ag23cReview.status !== "signal_to_article_conversion_logic_created_ready_for_ag23d") {
  throw new Error("AG23C review is not ready for AG23D.");
}
if (ag23cLogic.status !== "signal_to_article_conversion_logic_created_ready_for_ag23d") {
  throw new Error("AG23C logic status mismatch.");
}
if (ag23cReadiness.ready_for_ag23d !== true) {
  throw new Error("AG23C readiness does not allow AG23D.");
}
if (ag23cBoundary.next_stage_id !== "AG23D") {
  throw new Error("AG23C boundary does not point to AG23D.");
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

const movementMap = {
  module_id: "AG23D",
  title: "Homepage Movement Module Map",
  status: "homepage_movement_module_map_created_no_ui_mutation",
  movements: [
    {
      movement: "Discover",
      homepage_role: "Surface meaningful 24-hour signals and daily cues.",
      planned_modules: ["First Light", "Daily Signal Cards", "Regional/National/World Signal Cues"],
      source_from: "AG23B signal engine",
      live_now: false
    },
    {
      movement: "Read",
      homepage_role: "Convert selected signals into Featured Reads and episode pathways.",
      planned_modules: ["Featured Reads", "Article Briefs", "Weekly Article Episodes"],
      source_from: "AG23C conversion logic",
      live_now: false
    },
    {
      movement: "Reflect",
      homepage_role: "Create meaning, continuity and return value.",
      planned_modules: ["Founder Notebook", "Today’s Vedic Guidance", "Word for the Day", "Panchang/Festival View"],
      source_from: "Drishvara reflection modules",
      live_now: false
    }
  ],
  blocked_state: blockedState
};

const placementMap = {
  module_id: "AG23D",
  title: "Signal Output Placement Map",
  status: "signal_output_placement_map_created_no_homepage_mutation",
  placements: [
    {
      output_type: "daily_homepage_signal_card",
      movement: "Discover",
      planned_surface: "First Light / signal row",
      mutate_now: false
    },
    {
      output_type: "short_featured_read",
      movement: "Read",
      planned_surface: "Featured Reads card",
      mutate_now: false
    },
    {
      output_type: "long_featured_read",
      movement: "Read",
      planned_surface: "Featured Reads primary article",
      mutate_now: false
    },
    {
      output_type: "weekly_episode_candidate",
      movement: "Read",
      planned_surface: "Weekly Article Episodes / series rail",
      mutate_now: false
    },
    {
      output_type: "hold_for_later",
      movement: "Reflect",
      planned_surface: "Editorial queue / future reflection",
      mutate_now: false
    }
  ],
  blocked_state: blockedState
};

const reflectionMap = {
  module_id: "AG23D",
  title: "Reflection Layer Map",
  status: "reflection_layer_map_created_no_homepage_mutation",
  reflection_layers: [
    {
      layer: "Founder Notebook",
      purpose: "Original observation and editorial continuity.",
      maps_to: "Reflect"
    },
    {
      layer: "Today’s Vedic Guidance",
      purpose: "Daily interpretive and cultural-spiritual cue.",
      maps_to: "Reflect"
    },
    {
      layer: "Word for the Day",
      purpose: "Language, meaning and retention hook.",
      maps_to: "Reflect"
    },
    {
      layer: "Panchang and Festival View",
      purpose: "Time, calendar and observance context.",
      maps_to: "Reflect"
    }
  ],
  blocked_state: blockedState
};

const mapping = {
  module_id: "AG23D",
  title: "Discover Read Reflect Mapping",
  status: "discover_read_reflect_mapping_created_ready_for_ag23e",
  purpose: "Map First Light signals and article conversion outcomes into the homepage daily journey.",
  inherited_route: ag23aRoute.route_name,
  route_order: ["Discover", "Read", "Reflect"],
  conversion_outputs: ag23cLogic.decision_rules.map((x) => x.outcome),
  movement_map_file: outputs.movementMap,
  placement_map_file: outputs.placementMap,
  reflection_map_file: outputs.reflectionMap,
  supabase_auth_backend_deferred: true,
  supabase_reminder: supabaseReminder.reminder,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG23D",
  title: "Discover Read Reflect Mapping Blocker Register",
  status: "discover_read_reflect_mapping_operations_blocked_pending_ag23e",
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
  module_id: "AG23D",
  title: "Daily Homepage Data Schema Readiness Record",
  status: "ready_for_ag23e_daily_homepage_data_schema",
  ready_for_ag23e: true,
  next_stage_id: "AG23E",
  next_stage_title: "Daily Homepage Data Schema",
  discover_read_reflect_mapping_created: true,
  homepage_movement_map_created: true,
  signal_output_placement_map_created: true,
  reflection_layer_map_created: true,
  real_execution_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG23D",
  title: "AG23D to AG23E Daily Homepage Data Schema Boundary",
  status: "ag23e_boundary_created_not_started",
  next_stage_id: "AG23E",
  next_stage_title: "Daily Homepage Data Schema",
  allowed_scope: [
    "Define daily homepage data schema.",
    "Define data fields for First Light, Featured Reads, weekly episodes and reflection layers.",
    "Keep schema non-live and non-mutating."
  ],
  blocked_scope: blocker.blocked_items,
  supabase_auth_backend_deferred: true
};

const review = {
  module_id: "AG23D",
  title: "Discover Read Reflect Mapping",
  status: "discover_read_reflect_mapping_created_ready_for_ag23e",
  depends_on: ["AG23C"],
  generated_from: inputs,
  mapping_file: outputs.mapping,
  movement_map_file: outputs.movementMap,
  placement_map_file: outputs.placementMap,
  reflection_map_file: outputs.reflectionMap,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    discover_read_reflect_mapping_created: true,
    movement_map_created: true,
    placement_map_created: true,
    reflection_map_created: true,
    ready_for_ag23e: true,
    real_execution_done: false,
    supabase_auth_backend_deferred: true
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG23D",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG23D",
  preview_only: true,
  status: review.status,
  message: "AG23D mapping created. Next: AG23E Daily Homepage Data Schema.",
  blocked_state: blockedState
};

const doc = `# AG23D — Discover/Read/Reflect Mapping

## Purpose

AG23D maps First Light signals and article conversion outputs into the daily homepage journey.

## Mapping

- Discover: First Light and daily signal cards.
- Read: Featured Reads, article briefs and weekly episode candidates.
- Reflect: Founder Notebook, Today's Vedic Guidance, Word for the Day, Panchang and Festival View.

## Blocked State

No homepage mutation, scraping, external API call, article generation, GitHub write, deployment, publishing, or Supabase/Auth/backend activation is performed.

## Next Stage

AG23E — Daily Homepage Data Schema.
`;

writeJson(outputs.review, review);
writeJson(outputs.mapping, mapping);
writeJson(outputs.movementMap, movementMap);
writeJson(outputs.placementMap, placementMap);
writeJson(outputs.reflectionMap, reflectionMap);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG23D Discover/Read/Reflect Mapping generated.");
console.log("✅ Movement, placement and reflection maps created.");
console.log("✅ No homepage mutation, article generation, GitHub write or publishing performed.");
console.log("✅ AG23E Daily Homepage Data Schema boundary created.");
