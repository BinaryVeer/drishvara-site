import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const queuePath = path.join(root, "data", "content-intelligence", "publish-queue", "long-form-upgrade-queue.json");
const mappingPath = path.join(root, "data", "content-intelligence", "quality-reviews", "long-form-upgrade-mapping.json");
const registryPath = path.join(root, "data", "quality", "ag06g-long-form-content-packet-upgrade-dry-run-review.json");
const previewPath = path.join(root, "data", "quality", "ag06g-long-form-content-packet-upgrade-dry-run-review-preview.json");
const docPath = path.join(root, "docs", "quality", "AG06G_LONG_FORM_CONTENT_PACKET_UPGRADE_DRY_RUN_REVIEW.md");
const dryRunReviewPath = path.join(root, "data", "content-intelligence", "quality-reviews", "long-form-content-packet-upgrade-dry-run-review.json");
const batchSelectionPath = path.join(root, "data", "content-intelligence", "publish-queue", "long-form-batch-01-dry-run-selection.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AG06G validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const p of [queuePath, mappingPath, registryPath, previewPath, docPath, dryRunReviewPath, batchSelectionPath, packagePath]) {
  if (!fs.existsSync(p)) fail(`Missing AG06G required file: ${p}`);
}

const queue = readJson(queuePath);
const mapping = readJson(mappingPath);
const registry = readJson(registryPath);
const preview = readJson(previewPath);
const dryRunReview = readJson(dryRunReviewPath);
const batchSelection = readJson(batchSelectionPath);
const pkg = readJson(packagePath);
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "AG06G") fail("Registry module_id must be AG06G");
if (preview.module_id !== "AG06G") fail("Preview module_id must be AG06G");
if (dryRunReview.module_id !== "AG06G") fail("Dry-run review module_id must be AG06G");
if (batchSelection.module_id !== "AG06G") fail("Batch selection module_id must be AG06G");
if (preview.preview_only !== true) fail("Preview must be preview-only");
if (registry.governance_only !== true) fail("Registry must be governance-only");
if (registry.dry_run_review_only !== true) fail("Registry must be dry-run-review-only");
if (registry.batch_selection_only !== true) fail("Registry must be batch-selection-only");

const highPriorityAvailable = queue.summary.high_priority_queue_count;
const expectedSelectionCount = Math.min(5, highPriorityAvailable);
const selectedEntries = batchSelection.selected_entries || [];

if (batchSelection.summary.source_queue_entry_count_from_ag06f !== queue.summary.queue_entry_count) fail("AG06G source queue count must match AG06F");
if (batchSelection.summary.high_priority_available_count_from_ag06f !== queue.summary.high_priority_queue_count) fail("High priority count must match AG06F");
if (batchSelection.summary.selected_batch_count !== expectedSelectionCount) fail(`Selected batch count must be ${expectedSelectionCount}`);
if (selectedEntries.length !== expectedSelectionCount) fail(`Selected entries length must be ${expectedSelectionCount}`);
if (batchSelection.summary.selected_high_priority_count !== expectedSelectionCount) fail("All selected Batch 01 entries must be high-priority");
if (batchSelection.summary.selected_medium_priority_count !== 0) fail("Batch 01 dry-run must not include medium priority while high-priority items exist");
if (batchSelection.summary.selected_entries_ready_for_content_packet_planning_count !== 0) fail("No selected entry should be ready for content-packet planning in AG06G");
if (batchSelection.summary.selected_entries_ready_for_article_mutation_count !== 0) fail("No selected entry should be ready for article mutation in AG06G");
if (batchSelection.summary.selected_entries_ready_for_publication_count !== 0) fail("No selected entry should be ready for publication in AG06G");

const queueIds = new Set((queue.article_upgrade_queue || []).map((row) => row.queue_id));
const mappingIds = new Set((mapping.article_to_scaffold_upgrade_mapping || []).map((row) => row.queue_id));

for (const entry of selectedEntries) {
  if (!entry.dry_run_selection_id) fail("Selected entry missing dry_run_selection_id");
  if (!queueIds.has(entry.source_queue_id)) fail(`Selected source queue id not found in AG06F queue: ${entry.source_queue_id}`);
  if (!mappingIds.has(entry.source_queue_id)) fail(`Selected source queue id not found in AG06F mapping: ${entry.source_queue_id}`);
  if (entry.upgrade_priority !== "high") fail(`Selected entry must be high-priority: ${entry.source_queue_id}`);
  if (entry.required_upgrade_work.reference_governance_required !== true) fail(`Selected entry must require reference governance: ${entry.source_queue_id}`);

  if (entry.dry_run_review_status.ready_for_content_packet_planning !== false) fail(`Content-packet planning readiness must be false: ${entry.source_queue_id}`);
  if (entry.dry_run_review_status.ready_for_article_mutation !== false) fail(`Article mutation readiness must be false: ${entry.source_queue_id}`);
  if (entry.dry_run_review_status.ready_for_publication !== false) fail(`Publication readiness must be false: ${entry.source_queue_id}`);

  if (entry.mutation_controls.public_article_mutation_performed !== false) fail(`Public article mutation must be false: ${entry.source_queue_id}`);
  if (entry.mutation_controls.reference_url_change_performed !== false) fail(`Reference URL change must be false: ${entry.source_queue_id}`);
  if (entry.mutation_controls.scaffold_file_copy_performed !== false) fail(`Scaffold copy must be false: ${entry.source_queue_id}`);
  if (entry.mutation_controls.scaffold_file_move_performed !== false) fail(`Scaffold move must be false: ${entry.source_queue_id}`);
  if (entry.mutation_controls.scaffold_file_delete_performed !== false) fail(`Scaffold delete must be false: ${entry.source_queue_id}`);
  if (entry.mutation_controls.scaffold_import_performed !== false) fail(`Scaffold import must be false: ${entry.source_queue_id}`);
  if (entry.mutation_controls.content_packet_generation_performed !== false) fail(`Content packet generation must be false: ${entry.source_queue_id}`);
  if (entry.mutation_controls.article_rewrite_performed !== false) fail(`Article rewrite must be false: ${entry.source_queue_id}`);
  if (entry.mutation_controls.public_publishing_performed !== false) fail(`Public publishing must be false: ${entry.source_queue_id}`);
}

if (dryRunReview.review_decision.decision !== "dry_run_batch_selected_not_approved_for_mutation") fail("Review decision must remain non-mutating");
if (dryRunReview.review_decision.content_packet_generation_allowed !== false) fail("Content packet generation must not be allowed");
if (dryRunReview.review_decision.article_mutation_allowed !== false) fail("Article mutation must not be allowed");
if (dryRunReview.review_decision.scaffold_import_allowed !== false) fail("Scaffold import must not be allowed");
if (dryRunReview.review_decision.publication_allowed !== false) fail("Publication must not be allowed");
if (dryRunReview.summary.next_stage_id !== "AG06H") fail("Next stage must be AG06H");

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
  "article_rewrite_performed",
  "scaffold_import_performed"
]) {
  for (const obj of [registry, dryRunReview, batchSelection]) {
    if (obj[falseField] !== false) fail(`${falseField} must be false in ${obj.module_id || obj.title}`);
  }
}

for (const scriptName of ["generate:ag06g", "validate:ag06g"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag06g")) {
  fail("validate:project must include validate:ag06g");
}

for (const phrase of [
  "Purpose",
  "Inputs",
  "Selection Logic",
  "Dry-Run Review Position",
  "Explicit Exclusions",
  "Acceptance Criteria",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG06G document missing phrase: ${phrase}`);
}

pass("AG06G registry is present.");
pass("AG06G document is present.");
pass("AG06G dry-run review, batch selection and preview are present.");
pass("AG06F queue and mapping are consumed.");
pass("Batch 01 dry-run selection count is correct.");
pass("Selected entries are high-priority entries first.");
pass("Every selected entry remains not ready for article mutation.");
pass("Every selected entry remains not ready for publication.");
pass("Content-packet generation, article rewrite and scaffold import remain blocked.");
pass("AG06G is governance dry-run review only.");
pass("No public article/reference/scaffold/CSS/JS/backend/Auth/Supabase/publishing mutation is enabled or performed.");
pass("AG06H is identified as the next controlled stage.");
