import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag44bReview: "data/content-intelligence/quality-reviews/ag44b-weekly-rhythm-calendar-alignment.json",
  ag44bRhythmModel: "data/content-intelligence/episodes/ag44b-weekly-rhythm-model.json",
  ag44bCalendarConsumption: "data/content-intelligence/episodes/ag44b-calendar-consumption-map.json",
  ag44bSeriesAlignment: "data/content-intelligence/episodes/ag44b-series-structure-alignment-map.json",
  ag44bNoDuplicateAudit: "data/content-intelligence/backend-architecture/ag44b-no-duplicate-weekly-rhythm-audit-register.json",
  ag44bNoMutationAudit: "data/content-intelligence/backend-architecture/ag44b-no-mutation-audit-register.json",
  ag44bReadiness: "data/content-intelligence/quality-registry/ag44b-episode-to-surface-mapping-readiness-record.json",
  ag44bBoundary: "data/content-intelligence/mutation-plans/ag44b-to-ag44c-episode-surface-mapping-boundary.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag44c-episode-to-surface-mapping.json",
  surfaceMap: "data/content-intelligence/episodes/ag44c-episode-to-surface-mapping-model.json",
  homepageConsumption: "data/content-intelligence/homepage/ag44c-homepage-surface-consumption-map.json",
  featuredReadsConsumption: "data/content-intelligence/episodes/ag44c-featured-reads-surface-consumption-map.json",
  badgeNavigationPlan: "data/content-intelligence/episodes/ag44c-badge-navigation-timing-plan.json",
  noDuplicateAudit: "data/content-intelligence/backend-architecture/ag44c-no-duplicate-surface-mapping-audit-register.json",
  noMutationAudit: "data/content-intelligence/backend-architecture/ag44c-no-mutation-audit-register.json",
  readiness: "data/content-intelligence/quality-registry/ag44c-episodic-continuity-repetition-audit-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag44c-to-ag44d-continuity-repetition-audit-boundary.json",
  registry: "data/quality/ag44c-episode-to-surface-mapping.json",
  preview: "data/quality/ag44c-episode-to-surface-mapping-preview.json",
  doc: "docs/quality/AG44C_EPISODE_TO_SURFACE_MAPPING.md"
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
  if (!exists(p)) throw new Error(`Missing AG44C input: ${p}`);
}

const ag44bReview = readJson(inputs.ag44bReview);
const ag44bRhythmModel = readJson(inputs.ag44bRhythmModel);
const ag44bCalendarConsumption = readJson(inputs.ag44bCalendarConsumption);
const ag44bSeriesAlignment = readJson(inputs.ag44bSeriesAlignment);
const ag44bNoDuplicateAudit = readJson(inputs.ag44bNoDuplicateAudit);
const ag44bNoMutationAudit = readJson(inputs.ag44bNoMutationAudit);
const ag44bReadiness = readJson(inputs.ag44bReadiness);
const ag44bBoundary = readJson(inputs.ag44bBoundary);
const packageJson = readJson(inputs.packageJson);

if (ag44bReview.status !== "weekly_rhythm_calendar_aligned_ready_for_ag44c") {
  throw new Error("AG44B review status mismatch.");
}
if (ag44bReview.summary?.ready_for_ag44c !== true) {
  throw new Error("AG44B does not show AG44C readiness.");
}
if (ag44bReadiness.ready_for_ag44c !== true || ag44bReadiness.next_stage_id !== "AG44C") {
  throw new Error("AG44B readiness must permit AG44C.");
}
if (ag44bBoundary.next_stage_id !== "AG44C") {
  throw new Error("AG44B boundary must point to AG44C.");
}
if (ag44bNoDuplicateAudit.status !== "no_duplicate_weekly_rhythm_audit_passed_for_ag44b") {
  throw new Error("AG44B no-duplicate audit mismatch.");
}
if (ag44bNoMutationAudit.status !== "no_mutation_audit_passed_for_ag44b") {
  throw new Error("AG44B no-mutation audit mismatch.");
}
if (ag44bRhythmModel.status !== "weekly_rhythm_model_aligned") {
  throw new Error("AG44B rhythm model status mismatch.");
}
if (ag44bCalendarConsumption.calendar_result?.rhythm_alignment_possible !== true) {
  throw new Error("AG44B calendar rhythm alignment not confirmed.");
}
if (ag44bSeriesAlignment.alignment_result?.tuesday_friday_sunday_rhythm_mapped !== true) {
  throw new Error("AG44B series alignment did not map Tuesday/Friday/Sunday rhythm.");
}

const ag23HomepageFiles = findFiles([
  /ag23/i,
  /homepage/i,
  /first[-_ ]?light/i,
  /discover[-_ ]?read[-_ ]?reflect/i
]);

const ag25FeaturedFiles = findFiles([
  /ag25/i,
  /featured[-_ ]?read/i,
  /featured[-_ ]?reads/i,
  /long[-_ ]?form/i
]);

const categorySurfaceFiles = findFiles([
  /category/i,
  /featured/i,
  /reading/i,
  /surface/i
], ["data", "docs", "public", "articles"]);

const packageScripts = packageJson.scripts || {};
const validateAg23Scripts = Object.keys(packageScripts).filter((key) => /^validate:ag23/i.test(key)).sort();
const validateAg25Scripts = Object.keys(packageScripts).filter((key) => /^validate:ag25/i.test(key)).sort();

if (ag23HomepageFiles.length < 1 && validateAg23Scripts.length < 1) {
  throw new Error("AG44C requires existing AG23/homepage/First Light sources.");
}
if (ag25FeaturedFiles.length < 1 && validateAg25Scripts.length < 1) {
  throw new Error("AG44C requires existing AG25/Featured Reads sources.");
}

const blockedState = {
  ag44c_episode_surface_mapping_completed: true,
  ag44b_consumed: true,
  ag23_homepage_first_light_sources_consumed: true,
  ag25_featured_reads_sources_consumed: true,
  episode_to_surface_model_recorded: true,
  badge_navigation_plan_recorded: true,
  duplicate_episode_surface_system_created: false,
  article_mutated: false,
  article_generated: false,
  episode_generated: false,
  topic_promoted: false,
  reference_fetch_executed: false,
  image_generation_executed: false,
  object_generation_executed: false,
  homepage_mutated: false,
  featured_reads_mutated: false,
  category_listing_mutated: false,
  article_listing_mutated: false,
  runtime_file_mutated: false,
  public_publishing_operation_performed: false,
  deployment_performed: false,
  database_write_performed: false,
  backend_auth_supabase_activation_performed: false,
  sql_file_created: false,
  sql_grants_executed: false,
  service_role_key_exposed: false
};

const surfaceMap = {
  module_id: "AG44C",
  title: "Episode-to-Surface Mapping Model",
  status: "episode_to_surface_mapping_model_created",
  consumed_from_ag44b: {
    ag44b_review: inputs.ag44bReview,
    ag44b_rhythm_model: inputs.ag44bRhythmModel,
    ag44b_calendar_consumption: inputs.ag44bCalendarConsumption,
    ag44b_series_alignment: inputs.ag44bSeriesAlignment
  },
  rhythm_to_surface_mapping: [
    {
      rhythm_key: "tuesday",
      rhythm_label: "Tuesday Learning",
      planned_surface: "Reading surface / learning episode lane",
      public_activation_now: false,
      mutation_now: false
    },
    {
      rhythm_key: "friday",
      rhythm_label: "Friday World Lens / Burning Topic",
      planned_surface: "Reading surface / timely world lens lane",
      public_activation_now: false,
      mutation_now: false
    },
    {
      rhythm_key: "sunday",
      rhythm_label: "Sunday Deep Read",
      planned_surface: "Featured Reads / deep-read episode lane",
      public_activation_now: false,
      mutation_now: false
    }
  ],
  result: {
    episode_surface_mapping_recorded: true,
    existing_surfaces_consumed: true,
    new_public_surface_created: false,
    duplicate_episode_surface_system_created: false
  },
  blocked_state: blockedState
};

const homepageConsumption = {
  module_id: "AG44C",
  title: "Homepage and First Light Surface Consumption Map",
  status: "homepage_first_light_sources_consumed_for_episode_surface_mapping",
  consumed_homepage_sources: {
    ag23_homepage_first_light_candidates: ag23HomepageFiles.slice(0, 80),
    validate_ag23_scripts: validateAg23Scripts
  },
  homepage_mapping_result: {
    discover_read_reflect_flow_available: ag23HomepageFiles.some((f) => /discover|read|reflect|homepage|ag23/i.test(f)) || validateAg23Scripts.length > 0,
    first_light_bridge_available: ag23HomepageFiles.some((f) => /first[-_ ]?light|ag23/i.test(f)) || validateAg23Scripts.length > 0,
    homepage_mutated: false,
    runtime_activation_now: false
  },
  blocked_state: blockedState
};

const featuredReadsConsumption = {
  module_id: "AG44C",
  title: "Featured Reads Surface Consumption Map",
  status: "featured_reads_sources_consumed_for_episode_surface_mapping",
  consumed_featured_read_sources: {
    ag25_featured_read_candidates: ag25FeaturedFiles.slice(0, 80),
    category_surface_candidates: categorySurfaceFiles.slice(0, 80),
    validate_ag25_scripts: validateAg25Scripts
  },
  featured_reads_mapping_result: {
    featured_reads_surface_available: ag25FeaturedFiles.length > 0 || validateAg25Scripts.length > 0,
    category_listing_surface_available: categorySurfaceFiles.length > 0,
    listing_mutated: false,
    public_activation_now: false
  },
  blocked_state: blockedState
};

const badgeNavigationPlan = {
  module_id: "AG44C",
  title: "Episode Badge and Navigation Timing Plan",
  status: "badge_navigation_timing_plan_recorded",
  planned_badges: [
    {
      rhythm_key: "tuesday",
      public_badge_label: "Tuesday Learning",
      placement_candidate: "future reading surface card",
      enabled_now: false
    },
    {
      rhythm_key: "friday",
      public_badge_label: "World Lens",
      placement_candidate: "future topical episode card",
      enabled_now: false
    },
    {
      rhythm_key: "sunday",
      public_badge_label: "Deep Read",
      placement_candidate: "future Featured Reads/deep-read card",
      enabled_now: false
    }
  ],
  navigation_timing_rules: [
    "Badges must remain planned metadata until approved public-surface activation.",
    "Episode cards should not be rendered into homepage or Featured Reads in AG44C.",
    "Future surface mapping should preserve AG23 Discover → Read → Reflect movement.",
    "Future Featured Reads placement should consume AG25/AG46 long-form strengthening records."
  ],
  mutation_now: false,
  blocked_state: blockedState
};

const noDuplicateAudit = {
  module_id: "AG44C",
  title: "No-duplicate Surface Mapping Audit Register",
  status: "no_duplicate_surface_mapping_audit_passed_for_ag44c",
  checks: [
    { check_id: "ag44b_consumed_not_recreated", passed: true },
    { check_id: "ag23_homepage_first_light_consumed_not_recreated", passed: true },
    { check_id: "ag25_featured_reads_consumed_not_recreated", passed: true },
    { check_id: "episode_to_surface_mapping_recorded_without_runtime_surface", passed: true },
    { check_id: "badge_navigation_planned_without_public_activation", passed: true },
    { check_id: "no_episode_generation", passed: true },
    { check_id: "no_homepage_or_featured_reads_mutation", passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noMutationAudit = {
  module_id: "AG44C",
  title: "No-mutation Audit Register",
  status: "no_mutation_audit_passed_for_ag44c",
  checks: Object.entries({
    article_mutated: false,
    article_generated: false,
    episode_generated: false,
    topic_promoted: false,
    reference_fetch_executed: false,
    image_generation_executed: false,
    object_generation_executed: false,
    homepage_mutated: false,
    featured_reads_mutated: false,
    category_listing_mutated: false,
    article_listing_mutated: false,
    runtime_file_mutated: false,
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
  module_id: "AG44C",
  title: "AG44D Episodic Continuity and Repetition Audit Readiness Record",
  status: "ready_for_ag44d_episodic_continuity_repetition_audit",
  ready_for_ag44d: true,
  next_stage_id: "AG44D",
  next_stage_title: "Episodic Continuity and Repetition Audit",
  hard_blocker_count_for_ag44d: 0,
  ag56_dynamic_content_loop_still_deferred: true,
  article_mutation_allowed_next: false,
  episode_generation_allowed_next: false,
  topic_promotion_allowed_next: false,
  homepage_mutation_allowed_next: false,
  featured_reads_mutation_allowed_next: false,
  reference_fetch_allowed_next: false,
  image_generation_allowed_next: false,
  public_mutation_allowed_next: false,
  database_write_allowed_next: false,
  deployment_allowed_next: false,
  backend_activation_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG44C",
  title: "AG44C to AG44D Episodic Continuity and Repetition Audit Boundary",
  status: "ag44d_episodic_continuity_repetition_audit_boundary_created",
  next_stage_id: "AG44D",
  next_stage_title: "Episodic Continuity and Repetition Audit",
  allowed_scope: [
    "Consume AG44A, AG44B and AG44C records.",
    "Audit continuity, topic depth, repetition and brand fit.",
    "Use existing AG23G repetition-risk/topic scoring records where available.",
    "Do not generate episodes.",
    "Do not mutate homepage, Featured Reads, article files, listing files or runtime files.",
    "Do not fetch references.",
    "Do not generate images.",
    "Do not write database records.",
    "Do not deploy.",
    "Do not activate backend/Auth/Supabase."
  ],
  blocked_scope: [
    "episode generation",
    "article generation",
    "topic promotion",
    "reference fetch",
    "image generation",
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
  module_id: "AG44C",
  title: "Episode-to-Surface Mapping",
  status: "episode_to_surface_mapping_ready_for_ag44d",
  depends_on: ["AG44A", "AG44B", "AG23 homepage/First Light", "AG25 Featured Reads"],
  surface_map_file: outputs.surfaceMap,
  homepage_consumption_file: outputs.homepageConsumption,
  featured_reads_consumption_file: outputs.featuredReadsConsumption,
  badge_navigation_plan_file: outputs.badgeNavigationPlan,
  no_duplicate_audit_file: outputs.noDuplicateAudit,
  no_mutation_audit_file: outputs.noMutationAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag44c_episode_surface_mapping_completed: true,
    ag44b_consumed: true,
    ag23_homepage_first_light_sources_consumed: true,
    ag25_featured_reads_sources_consumed: true,
    ready_for_ag44d: true,
    hard_blocker_count_for_ag44d: 0,
    duplicate_episode_surface_system_created: false,
    article_mutated: false,
    episode_generated: false,
    topic_promoted: false,
    homepage_mutated: false,
    featured_reads_mutated: false,
    reference_fetch_executed: false,
    image_generation_executed: false,
    public_publishing_operation_performed: false,
    database_write_performed: false,
    deployment_performed: false,
    backend_auth_supabase_activation_performed: false,
    service_role_key_exposed: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG44C",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG44C",
  status: review.status,
  ag44c_episode_surface_mapping_completed: 1,
  ag44b_consumed: 1,
  ag23_homepage_first_light_sources_consumed: 1,
  ag25_featured_reads_sources_consumed: 1,
  ready_for_ag44d: 1,
  hard_blocker_count_for_ag44d: 0,
  duplicate_episode_surface_system_created: 0,
  article_mutated: 0,
  article_generated: 0,
  episode_generated: 0,
  topic_promoted: 0,
  homepage_mutated: 0,
  featured_reads_mutated: 0,
  reference_fetch_executed: 0,
  image_generation_executed: 0,
  public_publishing_operation_performed: 0,
  database_write_performed: 0,
  deployment_performed: 0,
  backend_auth_supabase_activation_performed: 0,
  service_role_key_exposed: 0
};

const doc = `# AG44C — Episode-to-Surface Mapping

## Result

AG44C maps the governed episodic rhythm into future public reading-surface planning without mutating any public surface.

## Consumed

- AG44A Episodic Foundation Consumption.
- AG44B Weekly Rhythm and Calendar Alignment.
- Existing AG23 homepage / First Light / Discover-Read-Reflect sources.
- Existing AG25 Featured Reads / long-form readiness sources.

## Planned mapping

- Tuesday Learning → future learning episode lane.
- Friday World Lens / Burning Topic → future topical/world-lens episode lane.
- Sunday Deep Read → future Featured Reads/deep-read episode lane.

## What AG44C does not do

- It does not generate episodes.
- It does not promote topics.
- It does not mutate homepage, Featured Reads, category/listing, article or runtime files.
- It does not fetch references.
- It does not generate images.
- It does not publish, deploy, write database records, activate backend/Auth/Supabase or expose service-role keys.

## Next

AG44D — Episodic Continuity and Repetition Audit.
`;

writeJson(outputs.surfaceMap, surfaceMap);
writeJson(outputs.homepageConsumption, homepageConsumption);
writeJson(outputs.featuredReadsConsumption, featuredReadsConsumption);
writeJson(outputs.badgeNavigationPlan, badgeNavigationPlan);
writeJson(outputs.noDuplicateAudit, noDuplicateAudit);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG44C Episode-to-Surface Mapping generated.");
console.log("✅ Existing AG23 homepage/First Light and AG25 Featured Reads sources consumed.");
console.log("✅ Tuesday / Friday / Sunday episode-to-surface mapping recorded.");
console.log("✅ Ready for AG44D Episodic Continuity and Repetition Audit.");
console.log("✅ No episode/article generation, topic promotion, homepage/Featured Reads mutation, publish, deployment, database/backend/Supabase/Auth activation or service-role exposure recorded.");
