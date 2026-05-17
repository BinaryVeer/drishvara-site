import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag07z-repeatable-production-readiness-closure.json",
  "data/content-intelligence/closure-registry/ag07z-controlled-chain-closure.json",
  "data/content-intelligence/run-registry/ag07z-next-cycle-recommendations.json",
  "data/content-intelligence/schema/repeatable-production-readiness-closure.schema.json",
  "data/content-intelligence/learning/ag07z-repeatable-production-readiness-learning.json",
  "data/content-intelligence/quality-reviews/ag08a-repeatable-article-upgrade-cycle-planning.json",
  "data/content-intelligence/run-registry/ag08a-repeatable-article-upgrade-roadmap.json",
  "data/content-intelligence/selection-registry/ag08a-next-article-selection-criteria.json",
  "data/content-intelligence/schema/repeatable-article-upgrade-cycle-planning.schema.json",
  "data/content-intelligence/learning/ag08a-repeatable-article-upgrade-cycle-planning-learning.json",
  "data/quality/ag08a-repeatable-article-upgrade-cycle-planning.json",
  "data/quality/ag08a-repeatable-article-upgrade-cycle-planning-preview.json",
  "docs/quality/AG08A_REPEATABLE_ARTICLE_UPGRADE_CYCLE_PLANNING.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG08A validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function checkFalseFields(objects, fields) {
  for (const field of fields) {
    for (const obj of objects) {
      if (obj[field] !== false) fail(`${field} must be false in ${obj.title || obj.module_id || "object"}`);
    }
  }
}

function checkTrueFields(objects, fields) {
  for (const field of fields) {
    for (const obj of objects) {
      if (obj[field] !== true) fail(`${field} must be true in ${obj.title || obj.module_id || "object"}`);
    }
  }
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag07zReview = readJson("data/content-intelligence/quality-reviews/ag07z-repeatable-production-readiness-closure.json");
const ag07zClosure = readJson("data/content-intelligence/closure-registry/ag07z-controlled-chain-closure.json");
const ag07zNextCycle = readJson("data/content-intelligence/run-registry/ag07z-next-cycle-recommendations.json");
const ag07zSchema = readJson("data/content-intelligence/schema/repeatable-production-readiness-closure.schema.json");

const review = readJson("data/content-intelligence/quality-reviews/ag08a-repeatable-article-upgrade-cycle-planning.json");
const roadmap = readJson("data/content-intelligence/run-registry/ag08a-repeatable-article-upgrade-roadmap.json");
const selection = readJson("data/content-intelligence/selection-registry/ag08a-next-article-selection-criteria.json");
const schema = readJson("data/content-intelligence/schema/repeatable-article-upgrade-cycle-planning.schema.json");
const learning = readJson("data/content-intelligence/learning/ag08a-repeatable-article-upgrade-cycle-planning-learning.json");
const registry = readJson("data/quality/ag08a-repeatable-article-upgrade-cycle-planning.json");
const preview = readJson("data/quality/ag08a-repeatable-article-upgrade-cycle-planning-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG08A_REPEATABLE_ARTICLE_UPGRADE_CYCLE_PLANNING.md"), "utf8");

for (const obj of [review, roadmap, selection, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG08A") fail(`module_id must be AG08A in ${obj.title || "preview"}`);
}

if (ag07zReview.status !== "ag07_repeatable_production_readiness_closed") fail("AG07Z must be closed");
if (ag07zReview.closure_decision.ag07_chain_closed !== true) fail("AG07Z chain closure must be true");
if (ag07zReview.closure_decision.next_cycle_requires_explicit_approval !== true) fail("AG07Z next cycle must require explicit approval");
if (ag07zClosure.status !== "ag07_controlled_chain_closed") fail("AG07Z closure record must be closed");
if (ag07zNextCycle.activation_status !== "not_started") fail("AG07Z next cycle must not be started");
if (ag07zSchema.new_article_mutation_allowed_in_ag07z !== false) fail("AG07Z schema must block mutation");

if (review.status !== "repeatable_article_upgrade_cycle_planning_created") fail("AG08A review status mismatch");
if (roadmap.status !== "roadmap_created_not_started") fail("AG08A roadmap status mismatch");
if (selection.status !== "selection_criteria_created_not_applied") fail("AG08A selection status mismatch");
if (schema.status !== "schema_planning_only") fail("AG08A schema status mismatch");
if (learning.status !== "learning_record_only") fail("AG08A learning status mismatch");

if (!Array.isArray(roadmap.stage_map) || roadmap.stage_map.length < 8) fail("Roadmap stage map must contain future stages");
if (roadmap.next_stage_handoff.next_stage_id !== "AG08B") fail("Roadmap must hand off to AG08B");
if (roadmap.next_stage_handoff.explicit_approval_required !== true) fail("AG08B handoff must require explicit approval");
if (roadmap.operating_model.default_mode !== "one_article_at_a_time") fail("Default operating mode must be one article at a time");
if (roadmap.operating_model.batch_mode_status !== "deferred") fail("Batch mode must be deferred");

if (selection.selection_not_performed_in_ag08a !== true) fail("AG08A must not perform selection");
if (selection.recommended_selection_mode !== "single_article_only") fail("Selection mode must be single_article_only");
if (selection.target_count_for_next_cycle !== 1) fail("Target count must be 1");
if (!Array.isArray(selection.priority_dimensions) || selection.priority_dimensions.length < 6) fail("Selection priority dimensions missing");
if (!selection.required_selection_output_for_ag08b.one_target_article_path) fail("AG08B must require one target article path");

if (schema.planning_allowed_in_ag08a !== true) fail("Schema must allow planning");
if (schema.roadmap_creation_allowed_in_ag08a !== true) fail("Schema must allow roadmap creation");
if (schema.selection_criteria_creation_allowed_in_ag08a !== true) fail("Schema must allow selection criteria creation");
if (schema.next_article_selection_allowed_in_ag08a !== false) fail("Schema must block article selection");
if (schema.article_mutation_allowed_in_ag08a !== false) fail("Schema must block article mutation");
if (schema.file_edit_allowed_in_ag08a !== false) fail("Schema must block file edit");
if (schema.reference_insertion_allowed_in_ag08a !== false) fail("Schema must block reference insertion");
if (schema.visual_generation_allowed_in_ag08a !== false) fail("Schema must block visual generation");
if (schema.production_jsonl_append_allowed_in_ag08a !== false) fail("Schema must block JSONL append");
if (schema.database_write_allowed_in_ag08a !== false) fail("Schema must block database write");
if (schema.supabase_write_allowed_in_ag08a !== false) fail("Schema must block Supabase write");
if (schema.backend_auth_supabase_allowed_in_ag08a !== false) fail("Schema must block backend/Auth/Supabase");
if (schema.publishing_allowed_in_ag08a !== false) fail("Schema must block publishing");

for (const obj of [review, registry, preview]) {
  if (obj.summary.ag08a_planning_created !== true) fail(`${obj.title || "preview"} must create AG08A planning`);
  if (obj.summary.repeatable_roadmap_created !== true) fail(`${obj.title || "preview"} must create roadmap`);
  if (obj.summary.selection_criteria_created !== true) fail(`${obj.title || "preview"} must create selection criteria`);
  if (obj.summary.future_stage_map_created !== true) fail(`${obj.title || "preview"} must create future stage map`);
  if (obj.summary.next_stage_id !== "AG08B") fail(`${obj.title || "preview"} next stage must be AG08B`);
  if (obj.summary.next_article_selected !== false) fail(`${obj.title || "preview"} must not select next article`);
  if (obj.summary.article_mutation_performed !== false) fail(`${obj.title || "preview"} must not mutate article`);
  if (obj.summary.reference_insertion_performed !== false) fail(`${obj.title || "preview"} must not insert references`);
  if (obj.summary.visual_generation_performed !== false) fail(`${obj.title || "preview"} must not generate visuals`);
  if (obj.summary.production_jsonl_append_performed !== false) fail(`${obj.title || "preview"} must not append JSONL`);
  if (obj.summary.database_write_performed !== false) fail(`${obj.title || "preview"} must not write database`);
  if (obj.summary.supabase_write_performed !== false) fail(`${obj.title || "preview"} must not write Supabase`);
  if (obj.summary.backend_auth_supabase_activation_performed !== false) fail(`${obj.title || "preview"} must not activate backend/Auth/Supabase`);
  if (obj.summary.publishing_performed !== false) fail(`${obj.title || "preview"} must not publish`);
  if (obj.summary.production_readiness_after_ag08a !== "repeatable_cycle_planned_not_started") fail(`${obj.title || "preview"} production readiness mismatch`);
  if (obj.summary.publish_readiness_after_ag08a !== "blocked") fail(`${obj.title || "preview"} publish readiness mismatch`);
}

if (review.closure_decision.decision !== "ag08a_planning_closed_ready_for_ag08b_selection") fail("Closure decision mismatch");
if (review.closure_decision.proceed_to_ag08b_only_with_explicit_user_approval !== true) fail("AG08B must require explicit approval");
if (review.closure_decision.next_article_selected !== false) fail("Closure must not select article");
if (review.closure_decision.article_mutation_performed !== false) fail("Closure must not mutate article");
if (review.closure_decision.production_readiness !== "repeatable_cycle_planned_not_started") fail("Closure production readiness mismatch");
if (review.closure_decision.publish_readiness !== "blocked") fail("Closure publish readiness mismatch");

checkTrueFields([review, roadmap, selection, schema, learning, registry, preview], [
  "planning_governance_only",
  "repeatable_cycle_planning_created",
  "roadmap_created",
  "selection_criteria_created",
  "next_stage_handoff_created",
  "future_stage_map_created",
  "batch_decision_recorded",
  "evidence_consumed_only"
]);

checkFalseFields([review, roadmap, selection, schema, learning, registry, preview], [
  "next_cycle_started",
  "next_article_selected",
  "candidate_packet_created",
  "production_packet_created",
  "article_inference_generated",
  "score_calculation_performed",
  "approval_state_changed",
  "publish_ready_set",
  "new_article_mutation_performed",
  "public_article_mutation_performed",
  "article_html_mutation_performed",
  "static_live_apply_performed",
  "static_live_mutation_performed",
  "file_edit_performed",
  "file_write_performed",
  "article_file_write_performed",
  "target_article_file_write_performed",
  "backup_file_created",
  "rollback_execution_performed",
  "reference_insertion_performed",
  "reference_url_population_performed",
  "approved_reference_url_population_performed",
  "live_url_fetch_performed",
  "visual_generation_performed",
  "visual_asset_generation_performed",
  "image_insertion_performed",
  "data_unit_generation_performed",
  "caption_alt_credit_population_performed",
  "production_jsonl_append_performed",
  "jsonl_append_performed",
  "jsonl_production_record_created",
  "database_write_performed",
  "supabase_write_performed",
  "supabase_enabled",
  "auth_enabled",
  "backend_activation_performed",
  "backend_auth_supabase_activation_performed",
  "api_route_created",
  "public_publishing_performed",
  "publication_approval_granted",
  "public_output_activation_performed",
  "subscriber_output_activation_performed",
  "admin_output_activation_performed",
  "payment_activation_performed",
  "multi_article_mutation_performed"
]);

for (const scriptName of ["generate:ag08a", "validate:ag08a"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag08a")) {
  fail("validate:project must include validate:ag08a");
}

for (const phrase of [
  "Purpose",
  "Input Closure Consumed",
  "Recommended Operating Model",
  "Future Stage Map",
  "Selection Criteria",
  "Compulsory Gates",
  "Explicit Exclusions",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG08A document missing phrase: ${phrase}`);
}

pass("AG08A registry is present.");
pass("AG08A document is present.");
pass("AG08A review, roadmap, selection criteria, schema, learning record and preview are present.");
pass("AG07Z closure is consumed.");
pass("Repeatable article-upgrade roadmap is created.");
pass("Future stage map is created.");
pass("Next-article selection criteria are created but not applied.");
pass("Single-article mode is recommended and batch mode is deferred.");
pass("AG08B handoff is created with explicit approval required.");
pass("No next article is selected in AG08A.");
pass("No article mutation, file edit, reference insertion, visual generation or image insertion is performed.");
pass("No production JSONL append, database write, Supabase write, backend/Auth/Supabase activation or publishing is performed.");
pass("Production readiness is repeatable_cycle_planned_not_started.");
pass("Publish readiness remains blocked.");
pass("AG08A is Repeatable Article Upgrade Cycle Planning only.");
