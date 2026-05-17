import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/content-intelligence-foundation-closure.json",
  "data/content-intelligence/learning/content-intelligence-foundation-closure-handoff.json",
  "data/content-intelligence/quality-reviews/long-form-article-standard.json",
  "data/content-intelligence/schema/content-packet.schema.json",
  "data/content-intelligence/publish-queue/long-form-upgrade-queue.json",
  "data/content-intelligence/publish-queue/long-form-batch-01-content-packet-planning.json",
  "data/content-intelligence/visual-registry/visual-data-infographic-requirement-standard.json",
  "data/content-intelligence/reference-registry/reference-source-credibility-standard.json",
  "data/content-intelligence/run-registry/jsonl-first-content-intelligence-store-manifest.json",
  "data/content-intelligence/publish-queue/publish-queue-approval-state-register.json",
  "data/content-intelligence/quality-reviews/ag07a-long-form-content-packet-generator-design-dry-run-boundary.json",
  "data/content-intelligence/run-registry/ag07a-content-packet-generator-boundary-dry-run-plan.json",
  "data/content-intelligence/schema/long-form-content-packet-generator-boundary.schema.json",
  "data/quality/ag07a-long-form-content-packet-generator-design-dry-run-boundary.json",
  "data/quality/ag07a-long-form-content-packet-generator-design-dry-run-boundary-preview.json",
  "docs/quality/AG07A_LONG_FORM_CONTENT_PACKET_GENERATOR_DESIGN_DRY_RUN_BOUNDARY.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG07A validation failed: ${message}`);
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

const ag06zClosure = readJson("data/content-intelligence/quality-reviews/content-intelligence-foundation-closure.json");
const ag06zHandoff = readJson("data/content-intelligence/learning/content-intelligence-foundation-closure-handoff.json");
const ag06lRegister = readJson("data/content-intelligence/publish-queue/publish-queue-approval-state-register.json");

const review = readJson("data/content-intelligence/quality-reviews/ag07a-long-form-content-packet-generator-design-dry-run-boundary.json");
const dryRunPlan = readJson("data/content-intelligence/run-registry/ag07a-content-packet-generator-boundary-dry-run-plan.json");
const schema = readJson("data/content-intelligence/schema/long-form-content-packet-generator-boundary.schema.json");
const registry = readJson("data/quality/ag07a-long-form-content-packet-generator-design-dry-run-boundary.json");
const preview = readJson("data/quality/ag07a-long-form-content-packet-generator-design-dry-run-boundary-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG07A_LONG_FORM_CONTENT_PACKET_GENERATOR_DESIGN_DRY_RUN_BOUNDARY.md"), "utf8");

for (const obj of [review, dryRunPlan, schema, registry, preview]) {
  if (obj.module_id !== "AG07A") fail(`module_id must be AG07A in ${obj.title || "preview"}`);
}

if (review.status !== "design_dry_run_boundary_only") fail("Review status must be design_dry_run_boundary_only");
if (dryRunPlan.status !== "design_dry_run_boundary_only") fail("Dry-run plan status must be design_dry_run_boundary_only");
if (schema.status !== "schema_only") fail("Schema status must be schema_only");
if (registry.design_dry_run_boundary_only !== true) fail("Registry must be design_dry_run_boundary_only");
if (preview.preview_only !== true) fail("Preview must be preview-only");

if (ag06zClosure.status !== "foundation_closed") fail("AG06Z foundation must be closed before AG07A");
if (ag06zClosure.summary.content_intelligence_foundation_closed !== true) fail("AG06Z summary must mark foundation closed");
if (ag06zClosure.summary.ag07_requires_explicit_user_approval !== true) fail("AG07 must require explicit approval");
if (ag06zHandoff.ready_for_ag07_execution_without_approval !== false) fail("AG07 execution without approval must remain blocked");
if (ag06zHandoff.recommended_next_discussion.module_id !== "AG07A") fail("AG06Z handoff must recommend AG07A");

for (const obj of [review, dryRunPlan, registry, preview]) {
  if (obj.summary.ag06z_foundation_closed !== true) fail(`${obj.title || "preview"} must confirm AG06Z foundation closure`);
  if (obj.summary.ag07_requires_explicit_user_approval !== true) fail(`${obj.title || "preview"} must require AG07 explicit approval`);
  if (obj.summary.generator_boundary_defined !== true) fail(`${obj.title || "preview"} must define generator boundary`);
  if (obj.summary.input_contract_defined !== true) fail(`${obj.title || "preview"} must define input contract`);
  if (obj.summary.output_contract_defined !== true) fail(`${obj.title || "preview"} must define output contract`);
  if (obj.summary.generator_implementation_allowed_in_ag07a !== false) fail(`${obj.title || "preview"} must block generator implementation`);
  if (obj.summary.dry_run_execution_allowed_in_ag07a !== false) fail(`${obj.title || "preview"} must block dry-run execution`);
  if (obj.summary.content_packet_generation_allowed !== false) fail(`${obj.title || "preview"} must block content packet generation`);
  if (obj.summary.public_article_mutation_allowed !== false) fail(`${obj.title || "preview"} must block public article mutation`);
}

if (!Array.isArray(ag06lRegister.approval_queue_entries) || ag06lRegister.approval_queue_entries.length < 1) {
  fail("AG06L approval register must contain entries");
}
for (const entry of ag06lRegister.approval_queue_entries) {
  if (entry.approval_state !== "not_approved") fail(`Approval entry must remain not_approved: ${entry.approval_queue_id}`);
  if (entry.publish_ready !== false) fail(`Approval entry must remain not publish-ready: ${entry.approval_queue_id}`);
}

for (const requiredInput of [
  "source_article_path",
  "source_article_classification",
  "long_form_article_standard",
  "content_packet_schema",
  "reference_source_credibility_standard",
  "visual_data_infographic_standard",
  "jsonl_store_governance",
  "publish_queue_approval_state",
  "mutation_controls"
]) {
  if (!dryRunPlan.future_generator_input_contract.required_inputs.includes(requiredInput)) {
    fail(`Missing future generator required input: ${requiredInput}`);
  }
}

for (const metadata of [
  "content_packet_id",
  "source_article_path",
  "article_slug",
  "category",
  "target_word_count_range",
  "reference_requirement",
  "visual_requirement",
  "quality_gate_requirement",
  "visitor_value_gate_requirement",
  "publish_readiness_gate_requirement",
  "mutation_controls",
  "audit_trace"
]) {
  if (!dryRunPlan.future_generator_output_contract.required_output_metadata.includes(metadata)) {
    fail(`Missing future generator required output metadata: ${metadata}`);
  }
}

for (const gate of [
  "ag06z_foundation_closed",
  "long_form_standard_available",
  "content_packet_schema_available",
  "reference_credibility_standard_available",
  "visual_data_standard_available",
  "jsonl_store_governance_available",
  "approval_register_available",
  "no_public_mutation_in_ag07a",
  "no_generation_execution_in_ag07a"
]) {
  if (!dryRunPlan.future_validation_gates.find((x) => x.gate_id === gate)) fail(`Missing future validation gate: ${gate}`);
}

for (const step of dryRunPlan.future_dry_run_steps) {
  if (step.allowed_in_ag07a !== false) fail(`Future dry-run step must remain blocked in AG07A: ${step.step_id}`);
}

for (const entry of preview.batch_preview) {
  if (entry.generation_status_in_ag07a !== "not_generated") fail(`Batch preview entry must remain not_generated: ${entry.preview_id}`);
  if (entry.content_packet_created !== false) fail(`Batch preview entry must not create content packet: ${entry.preview_id}`);
  if (entry.article_mutation_allowed !== false) fail(`Batch preview entry must not allow article mutation: ${entry.preview_id}`);
  if (entry.reference_insertion_allowed !== false) fail(`Batch preview entry must not allow reference insertion: ${entry.preview_id}`);
  if (entry.public_publishing_allowed !== false) fail(`Batch preview entry must not allow publishing: ${entry.preview_id}`);
}

if (review.closure_decision.decision !== "ag07a_generator_design_dry_run_boundary_closed") fail("AG07A closure decision mismatch");
if (review.closure_decision.proceed_to_ag07b_only_with_explicit_user_approval !== true) fail("AG07B must require explicit approval");
if (review.closure_decision.generator_implementation_allowed !== false) fail("Generator implementation must not be allowed");
if (review.closure_decision.dry_run_execution_allowed !== false) fail("Dry-run execution must not be allowed");
if (review.closure_decision.content_packet_generation_allowed !== false) fail("Content packet generation must not be allowed");
if (review.closure_decision.content_packet_output_write_allowed !== false) fail("Content packet output write must not be allowed");

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
  "content_packet_output_written"
]) {
  for (const obj of [review, dryRunPlan, schema, registry]) {
    if (obj[falseField] !== false) fail(`${falseField} must be false in ${obj.title}`);
  }
}

for (const scriptName of ["generate:ag07a", "validate:ag07a"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag07a")) {
  fail("validate:project must include validate:ag07a");
}

for (const phrase of [
  "Purpose",
  "Inputs",
  "Boundary Decision",
  "Future Generator Input Contract",
  "Future Generator Output Contract",
  "Future Dry-Run Boundary",
  "Explicit Exclusions",
  "Acceptance Criteria",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG07A document missing phrase: ${phrase}`);
}

pass("AG07A registry is present.");
pass("AG07A document is present.");
pass("AG07A review, dry-run boundary plan, schema and preview are present.");
pass("AG06Z foundation closure and AG07 explicit-approval boundary are consumed.");
pass("Generator input contract is defined.");
pass("Generator output contract is defined.");
pass("Future validation gates are defined.");
pass("Future dry-run steps are defined but not executed.");
pass("Batch preview entries remain not generated.");
pass("AG07A is design/dry-run-boundary only.");
pass("No generator implementation, dry-run execution, content packet generation, output write, public mutation, reference insertion, visual generation, scaffold import, JSONL append, publishing or backend/Auth/Supabase activation is enabled or performed.");
pass("AG07B is identified as next only with explicit approval.");
