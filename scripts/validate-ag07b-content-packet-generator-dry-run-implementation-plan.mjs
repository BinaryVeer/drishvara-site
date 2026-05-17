import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag07a-long-form-content-packet-generator-design-dry-run-boundary.json",
  "data/content-intelligence/run-registry/ag07a-content-packet-generator-boundary-dry-run-plan.json",
  "data/content-intelligence/schema/long-form-content-packet-generator-boundary.schema.json",
  "data/content-intelligence/quality-reviews/content-intelligence-foundation-closure.json",
  "data/content-intelligence/learning/content-intelligence-foundation-closure-handoff.json",
  "data/content-intelligence/schema/content-packet.schema.json",
  "data/content-intelligence/quality-reviews/long-form-article-standard.json",
  "data/content-intelligence/publish-queue/long-form-upgrade-queue.json",
  "data/content-intelligence/publish-queue/long-form-batch-01-content-packet-planning.json",
  "data/content-intelligence/visual-registry/visual-data-infographic-requirement-standard.json",
  "data/content-intelligence/reference-registry/reference-source-credibility-standard.json",
  "data/content-intelligence/run-registry/jsonl-first-content-intelligence-store-manifest.json",
  "data/content-intelligence/publish-queue/publish-queue-approval-state-register.json",
  "data/content-intelligence/quality-reviews/ag07b-content-packet-generator-dry-run-implementation-plan.json",
  "data/content-intelligence/run-registry/ag07b-content-packet-generator-dry-run-implementation-plan.json",
  "data/content-intelligence/schema/content-packet-generator-dry-run-implementation-plan.schema.json",
  "data/quality/ag07b-content-packet-generator-dry-run-implementation-plan.json",
  "data/quality/ag07b-content-packet-generator-dry-run-implementation-plan-preview.json",
  "docs/quality/AG07B_CONTENT_PACKET_GENERATOR_DRY_RUN_IMPLEMENTATION_PLAN.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG07B validation failed: ${message}`);
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

const ag07aReview = readJson("data/content-intelligence/quality-reviews/ag07a-long-form-content-packet-generator-design-dry-run-boundary.json");
const ag06zClosure = readJson("data/content-intelligence/quality-reviews/content-intelligence-foundation-closure.json");
const ag06zHandoff = readJson("data/content-intelligence/learning/content-intelligence-foundation-closure-handoff.json");
const ag06lRegister = readJson("data/content-intelligence/publish-queue/publish-queue-approval-state-register.json");

const review = readJson("data/content-intelligence/quality-reviews/ag07b-content-packet-generator-dry-run-implementation-plan.json");
const plan = readJson("data/content-intelligence/run-registry/ag07b-content-packet-generator-dry-run-implementation-plan.json");
const schema = readJson("data/content-intelligence/schema/content-packet-generator-dry-run-implementation-plan.schema.json");
const registry = readJson("data/quality/ag07b-content-packet-generator-dry-run-implementation-plan.json");
const preview = readJson("data/quality/ag07b-content-packet-generator-dry-run-implementation-plan-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG07B_CONTENT_PACKET_GENERATOR_DRY_RUN_IMPLEMENTATION_PLAN.md"), "utf8");

for (const obj of [review, plan, schema, registry, preview]) {
  if (obj.module_id !== "AG07B") fail(`module_id must be AG07B in ${obj.title || "preview"}`);
}

if (review.status !== "implementation_plan_only") fail("Review status must be implementation_plan_only");
if (plan.status !== "implementation_plan_only") fail("Plan status must be implementation_plan_only");
if (schema.status !== "schema_only") fail("Schema status must be schema_only");
if (registry.implementation_plan_only !== true) fail("Registry must be implementation_plan_only");
if (preview.preview_only !== true) fail("Preview must be preview-only");

if (ag07aReview.status !== "design_dry_run_boundary_only") fail("AG07A must be closed as design/dry-run-boundary only");
if (ag07aReview.closure_decision.proceed_to_ag07b_only_with_explicit_user_approval !== true) fail("AG07A must require explicit approval for AG07B");
if (ag07aReview.closure_decision.generator_implementation_allowed !== false) fail("AG07A must block generator implementation");
if (ag07aReview.closure_decision.dry_run_execution_allowed !== false) fail("AG07A must block dry-run execution");
if (ag07aReview.closure_decision.content_packet_generation_allowed !== false) fail("AG07A must block content packet generation");

if (ag06zClosure.status !== "foundation_closed") fail("AG06Z foundation must be closed");
if (ag06zClosure.summary.content_intelligence_foundation_closed !== true) fail("AG06Z foundation closure summary must be true");
if (ag06zClosure.summary.ag07_requires_explicit_user_approval !== true) fail("AG07 explicit approval must remain required");
if (ag06zHandoff.ready_for_ag07_execution_without_approval !== false) fail("AG07 execution without approval must remain blocked");

for (const obj of [review, plan, registry, preview]) {
  if (obj.summary.ag06z_foundation_closed !== true) fail(`${obj.title || "preview"} must confirm AG06Z foundation closure`);
  if (obj.summary.ag07a_boundary_closed !== true) fail(`${obj.title || "preview"} must confirm AG07A boundary closure`);
  if (obj.summary.implementation_plan_defined !== true) fail(`${obj.title || "preview"} must define implementation plan`);
  if (obj.summary.generator_code_creation_allowed_in_ag07b !== false) fail(`${obj.title || "preview"} must block generator code creation`);
  if (obj.summary.generator_implementation_allowed_in_ag07b !== false) fail(`${obj.title || "preview"} must block generator implementation`);
  if (obj.summary.dry_run_execution_allowed_in_ag07b !== false) fail(`${obj.title || "preview"} must block dry-run execution`);
  if (obj.summary.content_packet_generation_allowed !== false) fail(`${obj.title || "preview"} must block content packet generation`);
  if (obj.summary.content_packet_output_write_allowed !== false) fail(`${obj.title || "preview"} must block output writing`);
}

if (!Array.isArray(ag06lRegister.approval_queue_entries) || ag06lRegister.approval_queue_entries.length < 1) {
  fail("AG06L approval register must contain entries");
}
for (const entry of ag06lRegister.approval_queue_entries) {
  if (entry.approval_state !== "not_approved") fail(`Approval entry must remain not_approved: ${entry.approval_queue_id}`);
  if (entry.publish_ready !== false) fail(`Approval entry must remain not publish-ready: ${entry.approval_queue_id}`);
}

for (const component of plan.planned_components) {
  if (component.implementation_status_in_ag07b !== "planned_not_created") fail(`Component must remain planned_not_created: ${component.component_id}`);
  if (component.file_creation_allowed_in_ag07b !== false) fail(`Component file creation must be false: ${component.component_id}`);
  if (component.execution_allowed_in_ag07b !== false) fail(`Component execution must be false: ${component.component_id}`);
}

for (const futureFile of plan.future_implementation_files) {
  if (futureFile.allowed_in_ag07b !== false) fail(`Future file must not be allowed in AG07B: ${futureFile.future_file_path}`);
  if (futureFile.requires_explicit_later_approval !== true) fail(`Future file must require later approval: ${futureFile.future_file_path}`);
}

for (const step of plan.dry_run_algorithm_plan) {
  if (step.execution_allowed_in_ag07b !== false) fail(`Algorithm step must not execute in AG07B: ${step.step_id}`);
}

for (const validation of [
  "ag06z_foundation_closed",
  "ag07a_boundary_closed",
  "generator_execution_blocked",
  "content_packet_output_write_blocked",
  "public_mutation_blocked",
  "reference_insertion_blocked",
  "jsonl_append_blocked",
  "publishing_blocked"
]) {
  if (!plan.planned_validation_matrix.find((x) => x.validation_id === validation)) {
    fail(`Missing planned validation: ${validation}`);
  }
}

for (const candidate of plan.candidate_preview) {
  if (candidate.selected_for_execution_in_ag07b !== false) fail(`Candidate must not be selected for execution: ${candidate.preview_id}`);
  if (candidate.content_packet_generation_performed !== false) fail(`Candidate must not generate packet: ${candidate.preview_id}`);
  if (candidate.content_packet_output_written !== false) fail(`Candidate must not write output: ${candidate.preview_id}`);
  if (candidate.public_article_mutation_performed !== false) fail(`Candidate must not mutate article: ${candidate.preview_id}`);
  if (candidate.reference_insertion_performed !== false) fail(`Candidate must not insert reference: ${candidate.preview_id}`);
  if (candidate.jsonl_append_performed !== false) fail(`Candidate must not append JSONL: ${candidate.preview_id}`);
  if (candidate.publishing_performed !== false) fail(`Candidate must not publish: ${candidate.preview_id}`);
}

if (review.closure_decision.decision !== "ag07b_content_packet_generator_dry_run_implementation_plan_closed") fail("AG07B closure decision mismatch");
if (review.closure_decision.proceed_to_ag07c_only_with_explicit_user_approval !== true) fail("AG07C must require explicit approval");
if (review.closure_decision.generator_code_creation_allowed !== false) fail("Generator code creation must not be allowed");
if (review.closure_decision.generator_implementation_allowed !== false) fail("Generator implementation must not be allowed");
if (review.closure_decision.dry_run_execution_allowed !== false) fail("Dry-run execution must not be allowed");
if (review.closure_decision.content_packet_generation_allowed !== false) fail("Content packet generation must not be allowed");
if (review.closure_decision.content_packet_output_write_allowed !== false) fail("Output write must not be allowed");
if (review.closure_decision.public_article_mutation_allowed !== false) fail("Public article mutation must not be allowed");
if (review.closure_decision.reference_insertion_allowed !== false) fail("Reference insertion must not be allowed");
if (review.closure_decision.jsonl_append_allowed !== false) fail("JSONL append must not be allowed");
if (review.closure_decision.publishing_allowed !== false) fail("Publishing must not be allowed");
if (review.closure_decision.backend_auth_supabase_allowed !== false) fail("Backend/Auth/Supabase must not be allowed");

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
  "content_packet_generation_performed",
  "content_packet_created",
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
  "ag07_production_tooling_started",
  "ag07_content_packet_generator_implemented",
  "ag07_dry_run_execution_performed",
  "content_packet_output_written",
  "dry_run_preview_written",
  "generator_code_created",
  "generator_runtime_created"
]) {
  for (const obj of [review, plan, schema, registry]) {
    if (obj[falseField] !== false) fail(`${falseField} must be false in ${obj.title}`);
  }
}

for (const scriptName of ["generate:ag07b", "validate:ag07b"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag07b")) {
  fail("validate:project must include validate:ag07b");
}

for (const phrase of [
  "Purpose",
  "Inputs",
  "Planned Components",
  "Future Dry-Run Algorithm",
  "Future Implementation Files",
  "Explicit Exclusions",
  "Acceptance Criteria",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG07B document missing phrase: ${phrase}`);
}

pass("AG07B registry is present.");
pass("AG07B document is present.");
pass("AG07B review, implementation plan, schema and preview are present.");
pass("AG07A boundary closure and AG06Z foundation closure are consumed.");
pass("Planned components are defined but not created.");
pass("Future implementation files are listed but not created.");
pass("Future dry-run algorithm steps are defined but not executed.");
pass("Candidate preview entries remain not selected for execution.");
pass("AG07B is implementation-plan only.");
pass("No generator code creation, generator implementation, dry-run execution, content packet generation, output write, public mutation, reference insertion, visual generation, scaffold import, JSONL append, publishing or backend/Auth/Supabase activation is enabled or performed.");
pass("AG07C is identified as next only with explicit approval.");
