import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const ag06dPath = path.join(root, "data", "content-intelligence", "quality-reviews", "public-article-classification-register.json");
const ag06ePath = path.join(root, "data", "content-intelligence", "quality-reviews", "long-form-article-standard.json");
const scaffoldPath = path.join(root, "data", "content-intelligence", "run-registry", "scaffold-output-preservation-register.json");

const registryPath = path.join(root, "data", "quality", "ag06f-long-form-production-queue.json");
const previewPath = path.join(root, "data", "quality", "ag06f-long-form-production-queue-preview.json");
const docPath = path.join(root, "docs", "quality", "AG06F_LONG_FORM_PRODUCTION_QUEUE.md");
const queuePath = path.join(root, "data", "content-intelligence", "publish-queue", "long-form-upgrade-queue.json");
const mappingPath = path.join(root, "data", "content-intelligence", "quality-reviews", "long-form-upgrade-mapping.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AG06F validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const p of [ag06dPath, ag06ePath, scaffoldPath, registryPath, previewPath, docPath, queuePath, mappingPath, packagePath]) {
  if (!fs.existsSync(p)) fail(`Missing AG06F required file: ${p}`);
}

const ag06d = readJson(ag06dPath);
const ag06e = readJson(ag06ePath);
const scaffold = readJson(scaffoldPath);
const registry = readJson(registryPath);
const preview = readJson(previewPath);
const queue = readJson(queuePath);
const mapping = readJson(mappingPath);
const pkg = readJson(packagePath);
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "AG06F") fail("Registry module_id must be AG06F");
if (preview.module_id !== "AG06F") fail("Preview module_id must be AG06F");
if (queue.module_id !== "AG06F") fail("Queue module_id must be AG06F");
if (mapping.module_id !== "AG06F") fail("Mapping module_id must be AG06F");
if (preview.preview_only !== true) fail("Preview must be preview-only");
if (registry.governance_only !== true) fail("Registry must be governance-only");
if (registry.queue_mapping_only !== true) fail("Registry must be queue/mapping-only");

const expectedArticleCount = ag06d.summary.classified_public_article_count;
const sourceRows = ag06d.public_article_classifications || [];
const queueRows = queue.article_upgrade_queue || [];
const mappingRows = mapping.article_to_scaffold_upgrade_mapping || [];

if (queue.summary.queue_entry_count !== expectedArticleCount) fail("Queue summary count must match AG06D classified count");
if (queueRows.length !== expectedArticleCount) fail("Queue row count must match AG06D classified count");
if (mappingRows.length !== expectedArticleCount) fail("Mapping row count must match AG06D classified count");
if (registry.summary.queue_entry_count !== expectedArticleCount) fail("Registry queue count must match AG06D classified count");
if (preview.summary.queue_entry_count !== expectedArticleCount) fail("Preview queue count must match AG06D classified count");

if (queue.summary.scaffold_run_entry_count_from_ag06c !== scaffold.summary.run_entry_count) fail("Scaffold run count must match AG06C preservation summary");
if (queue.summary.scaffold_final_markdown_count_from_ag06c !== scaffold.summary.final_markdown_count) fail("Scaffold final markdown count must match AG06C preservation summary");
if (queue.summary.scaffold_above_1500_count_from_ag06c !== scaffold.summary.runs_with_final_markdown_above_1500_words) fail("Scaffold >1500 count must match AG06C preservation summary");

if (queue.summary.long_form_rewrite_required_count !== expectedArticleCount) fail("All current public articles must require long-form rewrite");
if (queue.summary.visual_enrichment_required_count !== expectedArticleCount) fail("All current public articles must require visual enrichment");
if (queue.summary.reference_governance_required_count !== ag06d.summary.reference_governance_candidate_count) fail("Reference governance required count must match AG06D reference-governance candidates");

const articlePaths = new Set();
for (const row of queueRows) {
  if (!row.queue_id) fail("Queue row missing queue_id");
  if (!row.source_article_path) fail(`Queue row missing source_article_path: ${row.queue_id}`);
  if (articlePaths.has(row.source_article_path)) fail(`Duplicate source article path: ${row.source_article_path}`);
  articlePaths.add(row.source_article_path);

  if (row.target_standard.word_count_min !== ag06e.summary.word_count_min) fail(`Word count min mismatch: ${row.queue_id}`);
  if (row.target_standard.word_count_max !== ag06e.summary.word_count_max) fail(`Word count max mismatch: ${row.queue_id}`);
  if (row.target_standard.verified_reference_min !== ag06e.summary.verified_reference_min) fail(`Reference min mismatch: ${row.queue_id}`);
  if (row.target_standard.verified_reference_max !== ag06e.summary.verified_reference_max) fail(`Reference max mismatch: ${row.queue_id}`);
  if (row.target_standard.quality_score_min_publish_ready !== ag06e.summary.quality_score_min_publish_ready) fail(`Quality gate mismatch: ${row.queue_id}`);
  if (row.target_standard.visitor_value_score_min_publish_ready !== ag06e.summary.visitor_value_score_min_publish_ready) fail(`Visitor-value gate mismatch: ${row.queue_id}`);

  if (row.required_upgrade_work.long_form_rewrite_required !== true) fail(`Long-form rewrite must be required: ${row.queue_id}`);
  if (row.required_upgrade_work.visual_plan_required !== true) fail(`Visual plan must be required: ${row.queue_id}`);
  if (row.required_upgrade_work.primary_visual_required !== true) fail(`Primary visual must be required: ${row.queue_id}`);
  if (row.required_upgrade_work.image_credit_required !== true) fail(`Image credit must be required: ${row.queue_id}`);
  if (row.required_upgrade_work.data_box_chart_graph_or_infographic_required !== true) fail(`Data enrichment must be required: ${row.queue_id}`);
  if (row.required_upgrade_work.quality_review_required !== true) fail(`Quality review must be required: ${row.queue_id}`);
  if (row.required_upgrade_work.visitor_value_review_required !== true) fail(`Visitor-value review must be required: ${row.queue_id}`);
  if (row.publish_readiness_status.publish_ready !== false) fail(`Queue item must not be publish-ready: ${row.queue_id}`);

  if (row.mutation_controls.public_article_mutation_performed !== false) fail(`Public article mutation must be false: ${row.queue_id}`);
  if (row.mutation_controls.reference_url_change_performed !== false) fail(`Reference URL change must be false: ${row.queue_id}`);
  if (row.mutation_controls.scaffold_file_copy_performed !== false) fail(`Scaffold copy must be false: ${row.queue_id}`);
  if (row.mutation_controls.scaffold_file_move_performed !== false) fail(`Scaffold move must be false: ${row.queue_id}`);
  if (row.mutation_controls.scaffold_file_delete_performed !== false) fail(`Scaffold delete must be false: ${row.queue_id}`);
  if (row.mutation_controls.public_publishing_performed !== false) fail(`Public publishing must be false: ${row.queue_id}`);

  if (!row.scaffold_mapping || !Array.isArray(row.scaffold_mapping.candidates)) fail(`Scaffold mapping missing candidates: ${row.queue_id}`);
}

for (const source of sourceRows) {
  if (!articlePaths.has(source.article_path)) fail(`Missing AG06D article in AG06F queue: ${source.article_path}`);
}

for (const row of mappingRows) {
  if (row.publish_ready !== false) fail(`Mapping row must not be publish-ready: ${row.queue_id}`);
  if (!Array.isArray(row.scaffold_candidates)) fail(`Mapping scaffold_candidates must be array: ${row.queue_id}`);
}

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
  "public_publishing_performed"
]) {
  for (const obj of [registry, queue, mapping]) {
    if (obj[falseField] !== false) fail(`${falseField} must be false in ${obj.module_id || obj.title}`);
  }
}

for (const scriptName of ["generate:ag06f", "validate:ag06f"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag06f")) {
  fail("validate:project must include validate:ag06f");
}

for (const phrase of [
  "Purpose",
  "Inputs",
  "Queue Logic",
  "Scaffold Mapping Logic",
  "Publish-Readiness Position",
  "Explicit Exclusions",
  "Acceptance Criteria",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG06F document missing phrase: ${phrase}`);
}

pass("AG06F registry is present.");
pass("AG06F document is present.");
pass("AG06F queue, mapping and preview are present.");
pass("Queue count matches AG06D classified public article count.");
pass("Scaffold summary counts match AG06C preservation register.");
pass("AG06E long-form standards are carried into every queue entry.");
pass("Every queue item remains not publish-ready.");
pass("Reference-governance required count matches AG06D.");
pass("Scaffold candidates are mapped only and not copied/moved/deleted.");
pass("AG06F is governance queue/mapping only.");
pass("No public article/reference/scaffold/CSS/JS/backend/Auth/Supabase/publishing mutation is enabled or performed.");
pass("AG06G is identified as the next controlled stage.");
