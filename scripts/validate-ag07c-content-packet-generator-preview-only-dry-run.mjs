import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag07b-content-packet-generator-dry-run-implementation-plan.json",
  "data/content-intelligence/run-registry/ag07b-content-packet-generator-dry-run-implementation-plan.json",
  "data/content-intelligence/schema/content-packet-generator-dry-run-implementation-plan.schema.json",
  "data/content-intelligence/quality-reviews/ag07a-long-form-content-packet-generator-design-dry-run-boundary.json",
  "data/content-intelligence/quality-reviews/content-intelligence-foundation-closure.json",
  "data/content-intelligence/schema/content-packet.schema.json",
  "data/content-intelligence/quality-reviews/long-form-article-standard.json",
  "data/content-intelligence/visual-registry/visual-data-infographic-requirement-standard.json",
  "data/content-intelligence/reference-registry/reference-source-credibility-standard.json",
  "data/content-intelligence/run-registry/jsonl-first-content-intelligence-store-manifest.json",
  "data/content-intelligence/publish-queue/publish-queue-approval-state-register.json",
  "data/content-intelligence/content-packets/ag07c-preview-only-dry-run-content-packet.json",
  "data/content-intelligence/run-registry/ag07c-preview-only-dry-run-execution-record.json",
  "data/content-intelligence/quality-reviews/ag07c-content-packet-generator-preview-only-dry-run.json",
  "data/content-intelligence/schema/content-packet-preview-dry-run.schema.json",
  "data/quality/ag07c-content-packet-generator-preview-only-dry-run.json",
  "data/quality/ag07c-content-packet-generator-preview-only-dry-run-preview.json",
  "docs/quality/AG07C_CONTENT_PACKET_GENERATOR_PREVIEW_ONLY_DRY_RUN.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG07C validation failed: ${message}`);
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

const ag07bReview = readJson("data/content-intelligence/quality-reviews/ag07b-content-packet-generator-dry-run-implementation-plan.json");
const ag07aReview = readJson("data/content-intelligence/quality-reviews/ag07a-long-form-content-packet-generator-design-dry-run-boundary.json");
const ag06zClosure = readJson("data/content-intelligence/quality-reviews/content-intelligence-foundation-closure.json");
const ag06lRegister = readJson("data/content-intelligence/publish-queue/publish-queue-approval-state-register.json");

const packet = readJson("data/content-intelligence/content-packets/ag07c-preview-only-dry-run-content-packet.json");
const execution = readJson("data/content-intelligence/run-registry/ag07c-preview-only-dry-run-execution-record.json");
const review = readJson("data/content-intelligence/quality-reviews/ag07c-content-packet-generator-preview-only-dry-run.json");
const schema = readJson("data/content-intelligence/schema/content-packet-preview-dry-run.schema.json");
const registry = readJson("data/quality/ag07c-content-packet-generator-preview-only-dry-run.json");
const preview = readJson("data/quality/ag07c-content-packet-generator-preview-only-dry-run-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG07C_CONTENT_PACKET_GENERATOR_PREVIEW_ONLY_DRY_RUN.md"), "utf8");

for (const obj of [packet, execution, review, schema, registry, preview]) {
  if (obj.module_id !== "AG07C") fail(`module_id must be AG07C in ${obj.title || obj.content_packet_id || "preview"}`);
}

if (ag07bReview.status !== "implementation_plan_only") fail("AG07B must be implementation-plan only");
if (ag07bReview.closure_decision.proceed_to_ag07c_only_with_explicit_user_approval !== true) fail("AG07B must require explicit approval for AG07C");
if (ag07bReview.closure_decision.public_article_mutation_allowed !== false) fail("AG07B must block public mutation");
if (ag07bReview.closure_decision.reference_insertion_allowed !== false) fail("AG07B must block reference insertion");
if (ag07bReview.closure_decision.jsonl_append_allowed !== false) fail("AG07B must block JSONL append");
if (ag07bReview.closure_decision.publishing_allowed !== false) fail("AG07B must block publishing");

if (ag07aReview.status !== "design_dry_run_boundary_only") fail("AG07A boundary must be closed");
if (ag06zClosure.status !== "foundation_closed") fail("AG06Z foundation must be closed");
if (ag06zClosure.summary.content_intelligence_foundation_closed !== true) fail("AG06Z summary must mark foundation closed");

if (!Array.isArray(ag06lRegister.approval_queue_entries) || ag06lRegister.approval_queue_entries.length < 1) {
  fail("AG06L approval register must contain entries");
}
for (const entry of ag06lRegister.approval_queue_entries) {
  if (entry.approval_state !== "not_approved") fail(`Approval entry must remain not_approved: ${entry.approval_queue_id}`);
  if (entry.publish_ready !== false) fail(`Approval entry must remain not publish-ready: ${entry.approval_queue_id}`);
}

if (packet.status !== "preview_only_dry_run") fail("Packet status must be preview_only_dry_run");
if (packet.preview_only !== true) fail("Packet must be preview-only");
if (packet.production_packet !== false) fail("Packet must not be production packet");
if (packet.publication_allowed !== false) fail("Packet must not allow publication");
if (packet.publish_ready !== false) fail("Packet must not be publish-ready");
if (packet.approval_state_changed !== false) fail("Packet must not change approval state");

if (!Array.isArray(packet.packet_sections) || packet.packet_sections.length < 1) fail("Packet sections must be present");
for (const section of packet.packet_sections) {
  if (section.preview_content_status !== "placeholder_only") fail(`Section must remain placeholder-only: ${section.section_id}`);
  if (section.narrative_text_generated !== false) fail(`Section must not generate narrative: ${section.section_id}`);
  if (section.public_article_text_generated !== false) fail(`Section must not generate public article text: ${section.section_id}`);
  if (section.production_ready !== false) fail(`Section must not be production ready: ${section.section_id}`);
}

if (packet.reference_requirement_preview.reference_discovery_performed !== false) fail("Reference discovery must not be performed");
if (packet.reference_requirement_preview.reference_url_population_performed !== false) fail("Reference URL population must not be performed");
if (packet.reference_requirement_preview.reference_insertion_performed !== false) fail("Reference insertion must not be performed");
if (packet.reference_requirement_preview.approved_reference_count !== 0) fail("Approved reference count must be zero");
if (packet.reference_requirement_preview.candidate_reference_count !== 0) fail("Candidate reference count must be zero");
if (!Array.isArray(packet.reference_requirement_preview.urls) || packet.reference_requirement_preview.urls.length !== 0) fail("Reference URL list must be empty");

if (packet.visual_requirement_preview.visual_asset_generation_performed !== false) fail("Visual generation must not be performed");
if (packet.visual_requirement_preview.infographic_generation_performed !== false) fail("Infographic generation must not be performed");
if (packet.visual_requirement_preview.image_credit_generated !== false) fail("Image credit must not be generated");
if (packet.visual_requirement_preview.alt_text_generated !== false) fail("Alt text must not be generated");

if (packet.jsonl_database_boundary.jsonl_append_performed !== false) fail("JSONL append must not be performed");
if (packet.jsonl_database_boundary.jsonl_production_record_created !== false) fail("JSONL production record must not be created");
if (packet.jsonl_database_boundary.database_write_performed !== false) fail("Database write must not be performed");
if (packet.jsonl_database_boundary.supabase_enabled !== false) fail("Supabase must not be enabled");

for (const [key, expected] of Object.entries({
  public_article_mutation_performed: false,
  reference_insertion_performed: false,
  visual_asset_generation_performed: false,
  scaffold_import_performed: false,
  jsonl_append_performed: false,
  database_write_performed: false,
  approval_state_changed: false,
  publish_ready_set: false,
  public_publishing_performed: false,
  backend_activation_performed: false,
  supabase_enabled: false,
  auth_enabled: false
})) {
  if (packet.mutation_controls[key] !== expected) fail(`${key} must be false in packet mutation controls`);
}

if (execution.status !== "preview_only_dry_run_completed") fail("Execution record status must be preview_only_dry_run_completed");
if (execution.execution_scope.one_candidate_only !== true) fail("AG07C must use one candidate only");
if (execution.execution_scope.preview_only_packet_skeleton_created !== true) fail("Preview packet skeleton must be created");
if (execution.execution_scope.production_packet_created !== false) fail("Production packet must not be created");
if (execution.packet_integrity_summary.all_sections_placeholder_only !== true) fail("All packet sections must remain placeholder-only");
if (execution.packet_integrity_summary.narrative_text_generated !== false) fail("Narrative text must not be generated");
if (execution.packet_integrity_summary.article_text_generated !== false) fail("Article text must not be generated");
if (execution.packet_integrity_summary.approved_reference_count !== 0) fail("Approved reference count must be zero");
if (execution.packet_integrity_summary.candidate_reference_count !== 0) fail("Candidate reference count must be zero");
if (execution.packet_integrity_summary.visual_asset_count !== 0) fail("Visual asset count must be zero");
if (execution.packet_integrity_summary.production_ready !== false) fail("Preview output must not be production ready");
if (execution.packet_integrity_summary.publish_ready !== false) fail("Preview output must not be publish ready");

for (const obj of [review, registry, preview]) {
  if (obj.summary.preview_only_dry_run_completed !== true) fail(`${obj.title || "preview"} must mark preview dry-run completed`);
  if (obj.summary.preview_packet_created !== true) fail(`${obj.title || "preview"} must mark preview packet created`);
  if (obj.summary.production_packet_created !== false) fail(`${obj.title || "preview"} must block production packet creation`);
  if (obj.summary.public_article_mutation_allowed !== false) fail(`${obj.title || "preview"} must block public mutation`);
  if (obj.summary.reference_insertion_allowed !== false) fail(`${obj.title || "preview"} must block reference insertion`);
  if (obj.summary.jsonl_append_allowed !== false) fail(`${obj.title || "preview"} must block JSONL append`);
  if (obj.summary.database_write_allowed !== false) fail(`${obj.title || "preview"} must block database write`);
  if (obj.summary.publishing_allowed !== false) fail(`${obj.title || "preview"} must block publishing`);
  if (obj.summary.backend_auth_supabase_allowed !== false) fail(`${obj.title || "preview"} must block backend/Auth/Supabase`);
}

if (review.dry_run_decision.decision !== "ag07c_preview_only_dry_run_completed") fail("AG07C decision mismatch");
if (review.dry_run_decision.proceed_to_ag07d_review_only_with_explicit_user_approval !== true) fail("AG07D must require explicit approval");
if (review.dry_run_decision.preview_only_packet_created !== true) fail("Preview packet must be recorded as created");
if (review.dry_run_decision.production_packet_created !== false) fail("Production packet must not be created");
if (review.dry_run_decision.public_article_mutation_allowed !== false) fail("Public mutation must remain blocked");
if (review.dry_run_decision.reference_insertion_allowed !== false) fail("Reference insertion must remain blocked");
if (review.dry_run_decision.jsonl_production_append_allowed !== false) fail("JSONL production append must remain blocked");
if (review.dry_run_decision.database_write_allowed !== false) fail("Database write must remain blocked");
if (review.dry_run_decision.publishing_allowed !== false) fail("Publishing must remain blocked");
if (review.dry_run_decision.backend_auth_supabase_allowed !== false) fail("Backend/Auth/Supabase must remain blocked");

for (const falseField of [
  "mutation_performed",
  "public_article_mutation_performed",
  "article_html_mutation_performed",
  "homepage_mutation_performed",
  "css_mutation_performed",
  "javascript_mutation_performed",
  "reference_url_change_performed",
  "reference_insertion_performed",
  "reference_url_population_performed",
  "verified_reference_population_performed",
  "candidate_reference_population_performed",
  "external_fetch_performed_by_script",
  "live_url_fetch_performed",
  "link_health_fetch_performed",
  "backend_activation_performed",
  "api_route_created",
  "supabase_enabled",
  "auth_enabled",
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
  "production_content_packet_generation_performed",
  "production_content_packet_created",
  "article_rewrite_performed",
  "visual_asset_generation_performed",
  "infographic_generation_performed",
  "quality_scoring_performed",
  "visitor_value_scoring_performed",
  "jsonl_file_created",
  "jsonl_production_record_created",
  "jsonl_append_performed",
  "jsonl_import_performed",
  "database_write_performed",
  "approval_state_changed",
  "publish_ready_set",
  "publish_queue_transition_performed",
  "publication_approval_granted",
  "production_generator_implemented",
  "production_generator_runtime_created",
  "production_output_written"
]) {
  for (const obj of [packet, execution, review, schema, registry]) {
    if (obj[falseField] !== false) fail(`${falseField} must be false in ${obj.title || obj.content_packet_id}`);
  }
}

for (const trueField of [
  "preview_only_dry_run_performed",
  "preview_only_packet_skeleton_created",
  "preview_only_output_written",
  "preview_only_registry_written",
  "preview_only_validation_artifacts_created"
]) {
  for (const obj of [packet, execution, review, schema, registry]) {
    if (obj[trueField] !== true) fail(`${trueField} must be true in ${obj.title || obj.content_packet_id}`);
  }
}

for (const scriptName of ["generate:ag07c", "validate:ag07c"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag07c")) {
  fail("validate:project must include validate:ag07c");
}

for (const phrase of [
  "Purpose",
  "Inputs",
  "Dry-Run Output",
  "Preview-Only Boundary",
  "Explicit Exclusions",
  "Acceptance Criteria",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG07C document missing phrase: ${phrase}`);
}

pass("AG07C registry is present.");
pass("AG07C document is present.");
pass("AG07C preview packet, execution record, review, schema and preview are present.");
pass("AG07B implementation-plan closure, AG07A boundary and AG06Z foundation are consumed.");
pass("Exactly one preview-only packet skeleton is created.");
pass("Packet remains preview-only, non-production, not publish-ready and not publication-allowed.");
pass("All packet sections remain placeholder-only.");
pass("No article prose, reference URLs, visual assets, JSONL production records, database writes or approval-state changes are created.");
pass("No public article mutation, reference insertion, visual generation, scaffold import, JSONL production append, publishing or backend/Auth/Supabase activation is enabled or performed.");
pass("AG07D Preview Packet Review and Gap Audit is identified as next only with explicit approval.");
