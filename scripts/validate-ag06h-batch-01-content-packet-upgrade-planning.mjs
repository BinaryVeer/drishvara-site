import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const batchSelectionPath = path.join(root, "data", "content-intelligence", "publish-queue", "long-form-batch-01-dry-run-selection.json");
const dryRunReviewPath = path.join(root, "data", "content-intelligence", "quality-reviews", "long-form-content-packet-upgrade-dry-run-review.json");
const longFormStandardPath = path.join(root, "data", "content-intelligence", "quality-reviews", "long-form-article-standard.json");
const contentPacketSchemaPath = path.join(root, "data", "content-intelligence", "schema", "content-packet.schema.json");

const registryPath = path.join(root, "data", "quality", "ag06h-batch-01-content-packet-upgrade-planning.json");
const previewPath = path.join(root, "data", "quality", "ag06h-batch-01-content-packet-upgrade-planning-preview.json");
const docPath = path.join(root, "docs", "quality", "AG06H_BATCH_01_CONTENT_PACKET_UPGRADE_PLANNING.md");
const planningPath = path.join(root, "data", "content-intelligence", "quality-reviews", "batch-01-content-packet-upgrade-planning.json");
const planningQueuePath = path.join(root, "data", "content-intelligence", "publish-queue", "long-form-batch-01-content-packet-planning.json");
const planningSchemaPath = path.join(root, "data", "content-intelligence", "schema", "batch-01-content-packet-planning.schema.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AG06H validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const p of [
  batchSelectionPath,
  dryRunReviewPath,
  longFormStandardPath,
  contentPacketSchemaPath,
  registryPath,
  previewPath,
  docPath,
  planningPath,
  planningQueuePath,
  planningSchemaPath,
  packagePath
]) {
  if (!fs.existsSync(p)) fail(`Missing AG06H required file: ${p}`);
}

const batchSelection = readJson(batchSelectionPath);
const dryRunReview = readJson(dryRunReviewPath);
const longFormStandard = readJson(longFormStandardPath);
const contentPacketSchema = readJson(contentPacketSchemaPath);
const registry = readJson(registryPath);
const preview = readJson(previewPath);
const planningReview = readJson(planningPath);
const planningQueue = readJson(planningQueuePath);
const planningSchema = readJson(planningSchemaPath);
const pkg = readJson(packagePath);
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "AG06H") fail("Registry module_id must be AG06H");
if (preview.module_id !== "AG06H") fail("Preview module_id must be AG06H");
if (planningReview.module_id !== "AG06H") fail("Planning review module_id must be AG06H");
if (planningQueue.module_id !== "AG06H") fail("Planning queue module_id must be AG06H");
if (planningSchema.module_id !== "AG06H") fail("Planning schema module_id must be AG06H");
if (preview.preview_only !== true) fail("Preview must be preview-only");
if (registry.governance_only !== true) fail("Registry must be governance-only");
if (registry.planning_only !== true) fail("Registry must be planning-only");
if (registry.content_packet_generation_allowed !== false) fail("Content packet generation must not be allowed");

if (dryRunReview.review_decision.content_packet_generation_allowed !== false) fail("AG06G must block content-packet generation");
if (dryRunReview.review_decision.article_mutation_allowed !== false) fail("AG06G must block article mutation");
if (dryRunReview.review_decision.scaffold_import_allowed !== false) fail("AG06G must block scaffold import");
if (dryRunReview.review_decision.publication_allowed !== false) fail("AG06G must block publication");

const selectedEntries = batchSelection.selected_entries || [];
const planningEntries = planningQueue.planning_entries || [];

if (planningQueue.summary.source_selected_batch_count_from_ag06g !== selectedEntries.length) fail("Planning summary must match AG06G selected count");
if (planningQueue.summary.planning_entry_count !== selectedEntries.length) fail("Planning entry count must match AG06G selected count");
if (planningEntries.length !== selectedEntries.length) fail("Planning entries length must match AG06G selected count");
if (registry.summary.planning_entry_count !== selectedEntries.length) fail("Registry planning count must match AG06G selected count");
if (preview.summary.planning_entry_count !== selectedEntries.length) fail("Preview planning count must match AG06G selected count");

if (planningQueue.summary.content_packet_generation_performed !== false) fail("Content packet generation must be false");
if (planningQueue.summary.content_packet_created !== false) fail("Content packet created must be false");
if (planningQueue.summary.article_rewrite_performed !== false) fail("Article rewrite must be false");
if (planningQueue.summary.current_public_articles_mutated !== false) fail("Current public articles mutated must be false");
if (planningQueue.summary.scaffold_outputs_mutated !== false) fail("Scaffold outputs mutated must be false");
if (planningQueue.summary.reference_url_change_performed !== false) fail("Reference URL change must be false");
if (planningQueue.summary.public_publishing_enabled !== false) fail("Public publishing enabled must be false");

const selectedById = new Map(selectedEntries.map((entry) => [entry.dry_run_selection_id, entry]));
const selectedArticlePaths = new Set(selectedEntries.map((entry) => entry.source_article_path));
const plannedArticlePaths = new Set();

for (const entry of planningEntries) {
  if (!entry.planning_id) fail("Planning entry missing planning_id");
  if (!selectedById.has(entry.source_dry_run_selection_id)) fail(`Planning entry not linked to AG06G selection: ${entry.planning_id}`);
  if (!selectedArticlePaths.has(entry.source_article_path)) fail(`Planning entry article not selected in AG06G: ${entry.source_article_path}`);
  if (plannedArticlePaths.has(entry.source_article_path)) fail(`Duplicate planning entry for article: ${entry.source_article_path}`);
  plannedArticlePaths.add(entry.source_article_path);

  if (entry.planned_target_standard.word_count_min !== longFormStandard.summary.word_count_min) fail(`Word count min mismatch: ${entry.planning_id}`);
  if (entry.planned_target_standard.word_count_max !== longFormStandard.summary.word_count_max) fail(`Word count max mismatch: ${entry.planning_id}`);
  if (entry.planned_target_standard.verified_reference_min !== longFormStandard.summary.verified_reference_min) fail(`Reference min mismatch: ${entry.planning_id}`);
  if (entry.planned_target_standard.verified_reference_max !== longFormStandard.summary.verified_reference_max) fail(`Reference max mismatch: ${entry.planning_id}`);
  if (entry.planned_target_standard.quality_score_min_publish_ready !== longFormStandard.summary.quality_score_min_publish_ready) fail(`Quality threshold mismatch: ${entry.planning_id}`);
  if (entry.planned_target_standard.visitor_value_score_min_publish_ready !== longFormStandard.summary.visitor_value_score_min_publish_ready) fail(`Visitor-value threshold mismatch: ${entry.planning_id}`);

  for (const key of [
    "source_article_review_required",
    "reference_discovery_plan_required",
    "reference_verification_plan_required",
    "long_form_outline_plan_required",
    "visual_plan_required",
    "image_credit_plan_required",
    "data_enrichment_plan_required",
    "quality_review_plan_required",
    "visitor_value_review_plan_required",
    "editorial_review_plan_required",
    "publish_readiness_review_plan_required"
  ]) {
    if (entry.planning_requirements[key] !== true) fail(`${key} must be true: ${entry.planning_id}`);
  }

  if (!Array.isArray(entry.planned_content_packet_sections)) fail(`Planned sections must be array: ${entry.planning_id}`);
  if (entry.planned_content_packet_sections.length < 1) fail(`Planned sections must not be empty: ${entry.planning_id}`);
  for (const section of entry.planned_content_packet_sections) {
    if (section.planning_status !== "planned_not_generated") fail(`Section planning status must be planned_not_generated: ${entry.planning_id}`);
    if (section.generation_status !== "not_generated") fail(`Section generation status must be not_generated: ${entry.planning_id}`);
    if (section.mutation_performed !== false) fail(`Section mutation must be false: ${entry.planning_id}`);
  }

  if (!Array.isArray(entry.planned_publish_readiness_gates)) fail(`Planned gates must be array: ${entry.planning_id}`);
  if (entry.planned_publish_readiness_gates.length !== longFormStandard.publish_readiness_gates.length) fail(`Publish gate count mismatch: ${entry.planning_id}`);
  for (const gate of entry.planned_publish_readiness_gates) {
    if (gate.passed !== false) fail(`Publish gate must not be passed in AG06H: ${entry.planning_id}`);
  }

  if (entry.planning_decision_status.content_packet_generated !== false) fail(`Content packet generated must be false: ${entry.planning_id}`);
  if (entry.planning_decision_status.article_rewrite_generated !== false) fail(`Article rewrite generated must be false: ${entry.planning_id}`);
  if (entry.planning_decision_status.reference_urls_populated !== false) fail(`Reference URLs populated must be false: ${entry.planning_id}`);
  if (entry.planning_decision_status.visual_asset_generated !== false) fail(`Visual asset generated must be false: ${entry.planning_id}`);
  if (entry.planning_decision_status.infographic_generated !== false) fail(`Infographic generated must be false: ${entry.planning_id}`);
  if (entry.planning_decision_status.quality_scored !== false) fail(`Quality scored must be false: ${entry.planning_id}`);
  if (entry.planning_decision_status.visitor_value_scored !== false) fail(`Visitor-value scored must be false: ${entry.planning_id}`);
  if (entry.planning_decision_status.ready_for_content_packet_generation !== false) fail(`Content packet generation readiness must be false: ${entry.planning_id}`);
  if (entry.planning_decision_status.ready_for_article_mutation !== false) fail(`Article mutation readiness must be false: ${entry.planning_id}`);
  if (entry.planning_decision_status.ready_for_publication !== false) fail(`Publication readiness must be false: ${entry.planning_id}`);

  if (entry.mutation_controls.public_article_mutation_performed !== false) fail(`Public article mutation must be false: ${entry.planning_id}`);
  if (entry.mutation_controls.reference_url_change_performed !== false) fail(`Reference URL change must be false: ${entry.planning_id}`);
  if (entry.mutation_controls.scaffold_file_copy_performed !== false) fail(`Scaffold copy must be false: ${entry.planning_id}`);
  if (entry.mutation_controls.scaffold_file_move_performed !== false) fail(`Scaffold move must be false: ${entry.planning_id}`);
  if (entry.mutation_controls.scaffold_file_delete_performed !== false) fail(`Scaffold delete must be false: ${entry.planning_id}`);
  if (entry.mutation_controls.scaffold_import_performed !== false) fail(`Scaffold import must be false: ${entry.planning_id}`);
  if (entry.mutation_controls.content_packet_generation_performed !== false) fail(`Content packet generation must be false: ${entry.planning_id}`);
  if (entry.mutation_controls.article_rewrite_performed !== false) fail(`Article rewrite must be false: ${entry.planning_id}`);
  if (entry.mutation_controls.public_publishing_performed !== false) fail(`Public publishing must be false: ${entry.planning_id}`);

  for (const candidate of entry.scaffold_candidate_planning.candidates) {
    if (candidate.permitted_use_in_ag06h !== "review_reference_only") fail(`Scaffold candidate use must be review_reference_only: ${entry.planning_id}`);
    if (candidate.import_status !== "not_imported") fail(`Scaffold candidate import must not occur: ${entry.planning_id}`);
    if (candidate.copy_move_delete_status !== "not_performed") fail(`Scaffold candidate copy/move/delete must not occur: ${entry.planning_id}`);
  }
}

for (const selectedPath of selectedArticlePaths) {
  if (!plannedArticlePaths.has(selectedPath)) fail(`Missing planning entry for selected article: ${selectedPath}`);
}

if (!Array.isArray(planningSchema.inherited_required_sections_from_content_packet_schema)) fail("Planning schema must inherit required sections");
if (planningSchema.inherited_required_sections_from_content_packet_schema.length < 1) fail("Planning schema inherited required sections cannot be empty");
if (!Array.isArray(planningSchema.inherited_publish_readiness_gates_from_ag06e)) fail("Planning schema must inherit AG06E gates");
if (planningSchema.inherited_publish_readiness_gates_from_ag06e.length !== longFormStandard.publish_readiness_gates.length) fail("Planning schema AG06E gate count mismatch");
if (planningQueue.content_packet_schema_snapshot.required_sections.length < 1) fail("Content packet schema snapshot required sections cannot be empty");

for (const falseField of [
  "mutation_performed",
  "public_article_mutation_performed",
  "article_html_mutation_performed",
  "homepage_mutation_performed",
  "css_mutation_performed",
  "javascript_mutation_performed",
  "reference_url_change_performed",
  "external_fetch_performed_by_script",
  "live_url_fetch_performed",
  "backend_activation_performed",
  "api_route_created",
  "supabase_enabled",
  "auth_enabled",
  "real_login_enabled",
  "real_signup_enabled",
  "user_account_collection_enabled",
  "frontend_deployment_performed",
  "scaffold_file_copy_performed",
  "scaffold_file_move_performed",
  "scaffold_file_delete_performed",
  "file_deletion_performed",
  "file_move_performed",
  "public_article_archive_performed",
  "public_article_delete_performed",
  "public_publishing_performed",
  "content_packet_generation_performed",
  "content_packet_created",
  "article_rewrite_performed",
  "scaffold_import_performed",
  "verified_reference_population_performed",
  "visual_asset_generation_performed",
  "infographic_generation_performed",
  "quality_scoring_performed",
  "visitor_value_scoring_performed"
]) {
  for (const obj of [registry, planningReview, planningQueue, planningSchema]) {
    if (obj[falseField] !== false) fail(`${falseField} must be false in ${obj.module_id || obj.title}`);
  }
}

for (const scriptName of ["generate:ag06h", "validate:ag06h"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag06h")) {
  fail("validate:project must include validate:ag06h");
}

for (const phrase of [
  "Purpose",
  "Inputs",
  "Planning Logic",
  "Content-Packet Schema Position",
  "Readiness Position",
  "Explicit Exclusions",
  "Acceptance Criteria",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG06H document missing phrase: ${phrase}`);
}

pass("AG06H registry is present.");
pass("AG06H document is present.");
pass("AG06H planning review, planning queue, planning schema and preview are present.");
pass("AG06G Batch 01 selection is consumed.");
pass("Planning queue count matches AG06G selected batch count.");
pass("Every selected Batch 01 item has one planning entry.");
pass("AG06E standards and publish-readiness gates are represented.");
pass("AG06B content-packet required sections or fallback required sections are represented.");
pass("Every planning entry remains not generated, not mutated and not publish-ready.");
pass("Content-packet generation, article rewrite, reference population, visual generation, scoring and scaffold import remain blocked.");
pass("AG06H is governance planning only.");
pass("No public article/reference/scaffold/CSS/JS/backend/Auth/Supabase/publishing mutation is enabled or performed.");
pass("AG06I is identified as the next controlled stage.");
