import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag23dReview: "data/content-intelligence/quality-reviews/ag23d-discover-read-reflect-mapping.json",
  ag23dMapping: "data/content-intelligence/homepage/ag23d-discover-read-reflect-mapping.json",
  ag23dMovement: "data/content-intelligence/homepage/ag23d-homepage-movement-module-map.json",
  ag23dPlacement: "data/content-intelligence/homepage/ag23d-signal-output-placement-map.json",
  ag23dReflection: "data/content-intelligence/homepage/ag23d-reflection-layer-map.json",
  ag23dReadiness: "data/content-intelligence/quality-registry/ag23d-daily-homepage-data-schema-readiness-record.json",
  ag23dBoundary: "data/content-intelligence/mutation-plans/ag23d-to-ag23e-daily-homepage-data-schema-boundary.json",
  supabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag23e-daily-homepage-data-schema.json",
  schema: "data/content-intelligence/homepage/ag23e-daily-homepage-data-schema.json",
  firstLightSchema: "data/content-intelligence/homepage/ag23e-first-light-card-schema.json",
  readSurfaceSchema: "data/content-intelligence/homepage/ag23e-read-surface-schema.json",
  reflectionSchema: "data/content-intelligence/homepage/ag23e-reflection-surface-schema.json",
  blocker: "data/content-intelligence/quality-registry/ag23e-daily-homepage-data-schema-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag23e-first-light-source-verification-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag23e-to-ag23f-first-light-source-verification-plan-boundary.json",
  registry: "data/quality/ag23e-daily-homepage-data-schema.json",
  preview: "data/quality/ag23e-daily-homepage-data-schema-preview.json",
  doc: "docs/quality/AG23E_DAILY_HOMEPAGE_DATA_SCHEMA.md"
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
  if (!exists(p)) throw new Error(`Missing AG23E input: ${p}`);
}

const ag23dReview = readJson(inputs.ag23dReview);
const ag23dMapping = readJson(inputs.ag23dMapping);
const ag23dReadiness = readJson(inputs.ag23dReadiness);
const ag23dBoundary = readJson(inputs.ag23dBoundary);
const supabaseReminder = readJson(inputs.supabaseReminder);

if (ag23dReview.status !== "discover_read_reflect_mapping_created_ready_for_ag23e") {
  throw new Error("AG23D review is not ready for AG23E.");
}
if (ag23dMapping.status !== "discover_read_reflect_mapping_created_ready_for_ag23e") {
  throw new Error("AG23D mapping status mismatch.");
}
if (ag23dReadiness.ready_for_ag23e !== true) {
  throw new Error("AG23D readiness does not allow AG23E.");
}
if (ag23dBoundary.next_stage_id !== "AG23E") {
  throw new Error("AG23D boundary does not point to AG23E.");
}

const blockedState = {
  homepage_mutated: false,
  data_written_to_runtime: false,
  live_feed_enabled: false,
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

const firstLightSchema = {
  module_id: "AG23E",
  title: "First Light Card Schema",
  status: "first_light_card_schema_created_no_runtime_write",
  fields: [
    "signal_id",
    "signal_date",
    "signal_window",
    "signal_type",
    "region_scope",
    "headline",
    "one_line_signal",
    "source_band",
    "verification_status",
    "freshness_score",
    "risk_note",
    "recommended_output_type"
  ],
  verification_status_values: ["verified", "needs_review", "hold", "reject"],
  blocked_state: blockedState
};

const readSurfaceSchema = {
  module_id: "AG23E",
  title: "Read Surface Schema",
  status: "read_surface_schema_created_no_runtime_write",
  fields: [
    "read_id",
    "source_signal_id",
    "title",
    "category",
    "summary",
    "article_brief_path",
    "series_candidate",
    "episode_number",
    "reference_requirement",
    "image_credit_requirement",
    "publish_status"
  ],
  publish_status_values: ["draft", "review", "approved_for_later_static_apply", "hold", "reject"],
  blocked_state: blockedState
};

const reflectionSchema = {
  module_id: "AG23E",
  title: "Reflection Surface Schema",
  status: "reflection_surface_schema_created_no_runtime_write",
  fields: [
    "reflection_id",
    "reflection_date",
    "module_type",
    "display_title",
    "short_text",
    "source_basis",
    "cultural_safety_note",
    "display_priority",
    "status"
  ],
  module_type_values: ["founder_notebook", "today_guidance", "word_for_day", "panchang_festival_view"],
  blocked_state: blockedState
};

const schema = {
  module_id: "AG23E",
  title: "Daily Homepage Data Schema",
  status: "daily_homepage_data_schema_created_ready_for_ag23f",
  purpose: "Define planning-only data schema for the daily homepage surface across Discover, Read and Reflect.",
  homepage_route: ["Discover", "Read", "Reflect"],
  daily_surface_record: {
    date_key: "YYYY-MM-DD",
    route_version: "discover_read_reflect_v1",
    first_light_cards: [],
    read_surface_items: [],
    reflection_items: [],
    editorial_status: "draft",
    source_verification_status: "pending",
    runtime_enabled: false
  },
  schema_files: {
    first_light_card_schema: outputs.firstLightSchema,
    read_surface_schema: outputs.readSurfaceSchema,
    reflection_surface_schema: outputs.reflectionSchema
  },
  supabase_auth_backend_deferred: true,
  supabase_reminder: supabaseReminder.reminder,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG23E",
  title: "Daily Homepage Data Schema Blocker Register",
  status: "daily_homepage_schema_operations_blocked_pending_ag23f",
  blocked_items: [
    "No homepage mutation.",
    "No runtime data write.",
    "No live feed.",
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
  module_id: "AG23E",
  title: "First Light Source Verification Readiness Record",
  status: "ready_for_ag23f_first_light_source_verification_plan",
  ready_for_ag23f: true,
  next_stage_id: "AG23F",
  next_stage_title: "First Light Source and Verification Plan",
  daily_homepage_schema_created: true,
  first_light_card_schema_created: true,
  read_surface_schema_created: true,
  reflection_surface_schema_created: true,
  real_execution_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG23E",
  title: "AG23E to AG23F First Light Source and Verification Plan Boundary",
  status: "ag23f_boundary_created_not_started",
  next_stage_id: "AG23F",
  next_stage_title: "First Light Source and Verification Plan",
  allowed_scope: [
    "Define source verification workflow.",
    "Define allowed source categories and rejection rules.",
    "Define checks against unsupported breaking-news claims.",
    "Keep non-live and non-mutating."
  ],
  blocked_scope: blocker.blocked_items,
  supabase_auth_backend_deferred: true
};

const review = {
  module_id: "AG23E",
  title: "Daily Homepage Data Schema",
  status: "daily_homepage_data_schema_created_ready_for_ag23f",
  depends_on: ["AG23D"],
  generated_from: inputs,
  schema_file: outputs.schema,
  first_light_schema_file: outputs.firstLightSchema,
  read_surface_schema_file: outputs.readSurfaceSchema,
  reflection_schema_file: outputs.reflectionSchema,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    daily_homepage_schema_created: true,
    first_light_schema_created: true,
    read_surface_schema_created: true,
    reflection_schema_created: true,
    ready_for_ag23f: true,
    real_execution_done: false,
    supabase_auth_backend_deferred: true
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG23E",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG23E",
  preview_only: true,
  status: review.status,
  message: "AG23E Daily Homepage Data Schema created. Next: AG23F First Light Source and Verification Plan.",
  blocked_state: blockedState
};

const doc = `# AG23E — Daily Homepage Data Schema

## Purpose

AG23E defines the planning-only daily homepage data schema for the Discover, Read and Reflect route.

## Schema Areas

- First Light cards.
- Read surface items.
- Reflection surface items.
- Daily homepage surface record.

## Blocked State

No homepage mutation, runtime write, live feed, scraping, external API call, article generation, GitHub write, deployment, publishing, or Supabase/Auth/backend activation is performed.

## Next Stage

AG23F — First Light Source and Verification Plan.
`;

writeJson(outputs.review, review);
writeJson(outputs.schema, schema);
writeJson(outputs.firstLightSchema, firstLightSchema);
writeJson(outputs.readSurfaceSchema, readSurfaceSchema);
writeJson(outputs.reflectionSchema, reflectionSchema);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG23E Daily Homepage Data Schema generated.");
console.log("✅ First Light, Read surface and Reflection schemas created.");
console.log("✅ No homepage mutation, runtime write, GitHub write or publishing performed.");
console.log("✅ AG23F First Light Source and Verification Plan boundary created.");
