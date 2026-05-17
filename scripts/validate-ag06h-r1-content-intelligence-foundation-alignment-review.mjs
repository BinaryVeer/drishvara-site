import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/long-form-article-standard.json",
  "data/content-intelligence/publish-queue/long-form-upgrade-queue.json",
  "data/content-intelligence/quality-reviews/long-form-content-packet-upgrade-dry-run-review.json",
  "data/content-intelligence/quality-reviews/batch-01-content-packet-upgrade-planning.json",
  "data/content-intelligence/schema/content-packet.schema.json",
  "data/content-intelligence/quality-reviews/content-intelligence-foundation-alignment-review.json",
  "data/content-intelligence/publish-queue/content-intelligence-foundation-remaining-roadmap.json",
  "data/quality/ag06h-r1-content-intelligence-foundation-alignment-review.json",
  "data/quality/ag06h-r1-content-intelligence-foundation-alignment-review-preview.json",
  "docs/quality/AG06H_R1_CONTENT_INTELLIGENCE_FOUNDATION_ALIGNMENT_REVIEW.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG06H-R1 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const review = readJson("data/content-intelligence/quality-reviews/content-intelligence-foundation-alignment-review.json");
const roadmap = readJson("data/content-intelligence/publish-queue/content-intelligence-foundation-remaining-roadmap.json");
const registry = readJson("data/quality/ag06h-r1-content-intelligence-foundation-alignment-review.json");
const preview = readJson("data/quality/ag06h-r1-content-intelligence-foundation-alignment-review-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG06H_R1_CONTENT_INTELLIGENCE_FOUNDATION_ALIGNMENT_REVIEW.md"), "utf8");

for (const obj of [review, roadmap, registry, preview]) {
  if (obj.module_id !== "AG06H-R1") fail(`module_id must be AG06H-R1 in ${obj.title || "preview"}`);
}

if (preview.preview_only !== true) fail("Preview must be preview-only");
if (registry.governance_only !== true) fail("Registry must be governance-only");
if (registry.alignment_review_only !== true) fail("Registry must be alignment-review-only");
if (review.status !== "alignment_review_only") fail("Review status must be alignment_review_only");
if (roadmap.status !== "roadmap_only") fail("Roadmap status must be roadmap_only");

const alignment = review.handbook_foundation_alignment || [];
if (alignment.length !== 6) fail("Handbook foundation alignment must contain 6 items");

const coverageByStage = Object.fromEntries(alignment.map((row) => [row.handbook_stage, row.coverage_status]));
if (coverageByStage.AG06E !== "covered") fail("AG06E must be covered");
if (coverageByStage.AG06F !== "partly_covered_requires_closure") fail("AG06F handbook intent must require closure");
if (coverageByStage.AG06G !== "partly_covered_requires_closure") fail("AG06G handbook intent must require closure");
if (coverageByStage.AG06H !== "partly_covered_requires_closure") fail("AG06H handbook intent must require closure");
if (coverageByStage.AG06I !== "partly_covered_requires_closure") fail("AG06I handbook intent must require closure");
if (coverageByStage.AG06Z !== "pending") fail("AG06Z must be pending");

const pathRows = review.corrected_remaining_path || [];
const expectedStages = ["AG06I", "AG06J", "AG06K", "AG06L", "AG06Z", "AG07+"];
if (pathRows.length !== expectedStages.length) fail("Corrected remaining path length mismatch");
for (const stage of expectedStages) {
  if (!pathRows.find((row) => row.next_stage === stage)) fail(`Missing corrected remaining stage: ${stage}`);
}

if (review.decision.proceed_to_ag06i_visual_data_infographic_schema_closure !== true) fail("Decision must proceed to AG06I visual/data/infographic schema closure");
if (review.decision.do_not_proceed_to_reference_discovery_yet !== true) fail("Decision must pause reference discovery");
if (review.decision.ag07_production_generation_blocked_until_ag06z !== true) fail("AG07 must remain blocked until AG06Z");
if (review.decision.preserve_completed_ag06e_to_ag06h_commits !== true) fail("Completed AG06E-AG06H commits must be preserved");

if (review.summary.immediate_next_stage !== "AG06I") fail("Immediate next stage must be AG06I");
if (review.summary.ag07_blocked_until_ag06z !== true) fail("AG07 must be blocked until AG06Z");
if (review.summary.article_mutation_allowed !== false) fail("Article mutation must remain disallowed");
if (review.summary.content_packet_generation_allowed !== false) fail("Content packet generation must remain disallowed");
if (review.summary.public_publishing_allowed !== false) fail("Public publishing must remain disallowed");
if (review.summary.backend_auth_supabase_allowed !== false) fail("Backend/Auth/Supabase must remain disallowed");

for (const falseField of [
  "mutation_performed",
  "public_article_mutation_performed",
  "article_html_mutation_performed",
  "homepage_mutation_performed",
  "css_mutation_performed",
  "javascript_mutation_performed",
  "reference_url_change_performed",
  "reference_insertion_performed",
  "verified_reference_population_performed",
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
  "scaffold_import_performed",
  "file_deletion_performed",
  "file_move_performed",
  "public_article_archive_performed",
  "public_article_delete_performed",
  "public_publishing_performed",
  "content_packet_generation_performed",
  "content_packet_created",
  "article_rewrite_performed",
  "visual_asset_generation_performed",
  "infographic_generation_performed",
  "quality_scoring_performed",
  "visitor_value_scoring_performed"
]) {
  for (const obj of [review, roadmap, registry]) {
    if (obj[falseField] !== false) fail(`${falseField} must be false in ${obj.title}`);
  }
}

for (const scriptName of ["generate:ag06h-r1", "validate:ag06h-r1"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag06h-r1")) {
  fail("validate:project must include validate:ag06h-r1");
}

for (const phrase of [
  "Purpose",
  "Inputs",
  "Alignment Finding",
  "Corrected Remaining Path",
  "Decision",
  "Explicit Exclusions",
  "Acceptance Criteria",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG06H-R1 document missing phrase: ${phrase}`);
}

pass("AG06H-R1 registry is present.");
pass("AG06H-R1 document is present.");
pass("AG06H-R1 alignment review, remaining roadmap and preview are present.");
pass("Completed AG06E-AG06H inputs are consumed.");
pass("Transition-handbook foundation sequence is represented.");
pass("Coverage statuses are classified.");
pass("Corrected AG06I-AG06Z remaining path is recorded.");
pass("Reference discovery is paused until foundation alignment is closed.");
pass("AG07 production generation remains blocked until AG06Z.");
pass("AG06H-R1 is governance alignment-review only.");
pass("No public article/reference/scaffold/CSS/JS/backend/Auth/Supabase/publishing mutation is enabled or performed.");
pass("AG06I Visual/Data/Infographic Requirement Schema Closure is identified as next.");
