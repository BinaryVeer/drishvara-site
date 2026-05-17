import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag07g-reference-discovery-boundary-workbench.json",
  "data/content-intelligence/reference-registry/ag07g-reference-discovery-workbench.json",
  "data/content-intelligence/schema/reference-discovery-workbench.schema.json",
  "data/content-intelligence/learning/ag07g-reference-discovery-boundary-learning.json",
  "data/content-intelligence/quality-reviews/ag07f-preview-packet-schema-revision-boundary.json",
  "data/content-intelligence/run-registry/ag07f-preview-packet-contract-boundary-plan.json",
  "data/content-intelligence/schema/preview-packet-revised-contract.schema.json",
  "data/content-intelligence/content-packets/ag07c-preview-only-dry-run-content-packet.json",
  "data/content-intelligence/visual-registry/visual-data-infographic-requirement-standard.json",
  "data/content-intelligence/quality-reviews/long-form-article-standard.json",
  "data/content-intelligence/run-registry/jsonl-first-content-intelligence-store-manifest.json",
  "data/content-intelligence/publish-queue/publish-queue-approval-state-register.json",
  "data/content-intelligence/quality-reviews/ag07h-visual-data-enrichment-boundary-workbench.json",
  "data/content-intelligence/visual-registry/ag07h-visual-data-enrichment-workbench.json",
  "data/content-intelligence/schema/visual-data-enrichment-workbench.schema.json",
  "data/content-intelligence/learning/ag07h-visual-data-enrichment-boundary-learning.json",
  "data/quality/ag07h-visual-data-enrichment-boundary-workbench.json",
  "data/quality/ag07h-visual-data-enrichment-boundary-workbench-preview.json",
  "docs/quality/AG07H_VISUAL_DATA_ENRICHMENT_BOUNDARY_WORKBENCH.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG07H validation failed: ${message}`);
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

const ag07gReview = readJson("data/content-intelligence/quality-reviews/ag07g-reference-discovery-boundary-workbench.json");
const ag07gWorkbench = readJson("data/content-intelligence/reference-registry/ag07g-reference-discovery-workbench.json");
const ag07fReview = readJson("data/content-intelligence/quality-reviews/ag07f-preview-packet-schema-revision-boundary.json");
const ag07fBoundaryPlan = readJson("data/content-intelligence/run-registry/ag07f-preview-packet-contract-boundary-plan.json");
const ag07cPacket = readJson("data/content-intelligence/content-packets/ag07c-preview-only-dry-run-content-packet.json");
const ag06iVisualStandard = readJson("data/content-intelligence/visual-registry/visual-data-infographic-requirement-standard.json");

const review = readJson("data/content-intelligence/quality-reviews/ag07h-visual-data-enrichment-boundary-workbench.json");
const workbench = readJson("data/content-intelligence/visual-registry/ag07h-visual-data-enrichment-workbench.json");
const schema = readJson("data/content-intelligence/schema/visual-data-enrichment-workbench.schema.json");
const learning = readJson("data/content-intelligence/learning/ag07h-visual-data-enrichment-boundary-learning.json");
const registry = readJson("data/quality/ag07h-visual-data-enrichment-boundary-workbench.json");
const preview = readJson("data/quality/ag07h-visual-data-enrichment-boundary-workbench-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG07H_VISUAL_DATA_ENRICHMENT_BOUNDARY_WORKBENCH.md"), "utf8");

for (const obj of [review, workbench, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG07H") fail(`module_id must be AG07H in ${obj.title || "preview"}`);
}

if (review.status !== "visual_data_enrichment_boundary_defined") fail("Review status must be visual_data_enrichment_boundary_defined");
if (workbench.status !== "visual_data_enrichment_boundary_defined") fail("Workbench status must be visual_data_enrichment_boundary_defined");
if (schema.status !== "schema_boundary_only") fail("Schema status must be schema_boundary_only");
if (learning.status !== "learning_record_only") fail("Learning status must be learning_record_only");

for (const obj of [review, workbench, schema, learning, registry, preview]) {
  if (obj.visual_data_enrichment_boundary_only !== true) fail(`${obj.title || "preview"} must be visual/data enrichment boundary only`);
}

if (ag07gReview.status !== "reference_discovery_boundary_defined") fail("AG07G must be reference_discovery_boundary_defined");
if (ag07gReview.closure_decision.proceed_to_ag07h_only_with_explicit_user_approval !== true) fail("AG07G must require explicit approval for AG07H");
if (ag07gReview.closure_decision.visual_generation_allowed !== false) fail("AG07G must block visual generation");
if (ag07gReview.closure_decision.reference_insertion_allowed !== false) fail("AG07G must block reference insertion");
if (ag07gReview.closure_decision.public_article_mutation_allowed !== false) fail("AG07G must block public mutation");
if (ag07gReview.closure_decision.article_prose_generation_allowed !== false) fail("AG07G must block article prose generation");
if (ag07gReview.closure_decision.jsonl_production_append_allowed !== false) fail("AG07G must block JSONL production append");

if (ag07fReview.status !== "schema_contract_boundary_defined") fail("AG07F must be schema_contract_boundary_defined");
if (ag07cPacket.status !== "preview_only_dry_run") fail("AG07C packet must remain preview_only_dry_run");
if (ag07cPacket.preview_only !== true) fail("AG07C packet must remain preview-only");
if (ag07cPacket.production_packet !== false) fail("AG07C packet must remain non-production");
if (ag07cPacket.publish_ready !== false) fail("AG07C packet must remain not publish-ready");
if (ag07cPacket.publication_allowed !== false) fail("AG07C packet must remain not publication-allowed");

const visualDataSection = (ag07fBoundaryPlan.proposed_contract_sections || []).find((section) => section.section_id === "visual_data_plan");
if (!visualDataSection) fail("AG07F visual_data_plan contract section must be present");

if (!ag06iVisualStandard || typeof ag06iVisualStandard !== "object") fail("AG06I visual standard must be readable");

if (!Array.isArray(workbench.visual_need_slots) || workbench.visual_need_slots.length < 3) fail("Visual need slots must be present");
for (const slot of workbench.visual_need_slots) {
  if (slot.review_status !== "boundary_slot_empty") fail(`Visual slot must be boundary_slot_empty: ${slot.slot_id}`);
  if (slot.visual_generation_allowed_in_ag07h !== false) fail(`Visual generation must be false: ${slot.slot_id}`);
  if (slot.image_insertion_allowed_in_ag07h !== false) fail(`Image insertion must be false: ${slot.slot_id}`);
  if (slot.asset_path !== "") fail(`Asset path must be empty: ${slot.slot_id}`);
  if (slot.asset_url !== "") fail(`Asset URL must be empty: ${slot.slot_id}`);
  if (slot.caption !== "") fail(`Caption must be empty: ${slot.slot_id}`);
  if (slot.alt_text !== "") fail(`Alt text must be empty: ${slot.slot_id}`);
  if (slot.image_credit !== "") fail(`Image credit must be empty: ${slot.slot_id}`);
}

if (!Array.isArray(workbench.data_unit_slots) || workbench.data_unit_slots.length < 3) fail("Data unit slots must be present");
for (const slot of workbench.data_unit_slots) {
  if (slot.review_status !== "boundary_slot_empty") fail(`Data unit slot must be boundary_slot_empty: ${slot.slot_id}`);
  if (slot.data_generation_allowed_in_ag07h !== false) fail(`Data generation must be false: ${slot.slot_id}`);
  if (!Array.isArray(slot.data_values) || slot.data_values.length !== 0) fail(`Data values must be empty: ${slot.slot_id}`);
}

if (!Array.isArray(workbench.accessibility_and_attribution_fields) || workbench.accessibility_and_attribution_fields.length < 4) {
  fail("Accessibility and attribution fields must be present");
}

for (const field of workbench.accessibility_and_attribution_fields) {
  if (field.populated_in_ag07h !== false) fail(`Accessibility/attribution field must not be populated: ${field.field_id}`);
  if (field.value !== "") fail(`Accessibility/attribution field value must be empty: ${field.field_id}`);
}

if (!Array.isArray(workbench.mobile_safe_layout_rules) || workbench.mobile_safe_layout_rules.length < 4) fail("Mobile-safe layout rules must be present");
for (const rule of workbench.mobile_safe_layout_rules) {
  if (rule.evaluated_in_ag07h !== false) fail(`Mobile rule must not be evaluated in AG07H: ${rule.rule_id}`);
  if (rule.future_approval_required !== true) fail(`Mobile rule must require future approval: ${rule.rule_id}`);
}

if (!Array.isArray(workbench.review_workflow) || workbench.review_workflow.length < 5) fail("Review workflow must be present");
for (const step of workbench.review_workflow) {
  if (step.allowed_in_ag07h !== false) fail(`Workflow step must not be allowed in AG07H: ${step.step_id}`);
  if (step.future_approval_required !== true) fail(`Workflow step must require future approval: ${step.step_id}`);
}

if (!Array.isArray(ag07gWorkbench.candidate_reference_slots) || ag07gWorkbench.candidate_reference_slots.length < 2) {
  fail("AG07G candidate reference slots must be present for visual/reference boundary handoff");
}

for (const obj of [review, workbench, registry, preview]) {
  if (obj.summary.visual_generation_performed !== false) fail(`${obj.title || "preview"} must not generate visuals`);
  if (obj.summary.visual_asset_generation_performed !== false) fail(`${obj.title || "preview"} must not generate visual assets`);
  if (obj.summary.image_insertion_performed !== false) fail(`${obj.title || "preview"} must not insert images`);
  if (obj.summary.image_credit_population_performed !== false) fail(`${obj.title || "preview"} must not populate image credits`);
  if (obj.summary.alt_text_population_performed !== false) fail(`${obj.title || "preview"} must not populate alt text`);
  if (obj.summary.caption_population_performed !== false) fail(`${obj.title || "preview"} must not populate captions`);
  if (obj.summary.data_unit_generation_performed !== false) fail(`${obj.title || "preview"} must not generate data units`);
  if (obj.summary.produced_visual_asset_count !== 0) fail(`${obj.title || "preview"} produced visual asset count must be zero`);
  if (obj.summary.inserted_image_count !== 0) fail(`${obj.title || "preview"} inserted image count must be zero`);
  if (obj.summary.generated_data_unit_count !== 0) fail(`${obj.title || "preview"} generated data unit count must be zero`);
  if (obj.summary.production_readiness_after_ag07h !== "not_ready") fail(`${obj.title || "preview"} production readiness must remain not_ready`);
  if (obj.summary.publish_readiness_after_ag07h !== "blocked") fail(`${obj.title || "preview"} publish readiness must remain blocked`);
  if (obj.summary.public_article_mutation_allowed !== false) fail(`${obj.title || "preview"} must block public mutation`);
  if (obj.summary.article_prose_generated !== false) fail(`${obj.title || "preview"} must not generate article prose`);
  if (obj.summary.reference_insertion_allowed !== false) fail(`${obj.title || "preview"} must block reference insertion`);
  if (obj.summary.jsonl_production_append_allowed !== false) fail(`${obj.title || "preview"} must block JSONL append`);
  if (obj.summary.database_write_allowed !== false) fail(`${obj.title || "preview"} must block database write`);
  if (obj.summary.publishing_allowed !== false) fail(`${obj.title || "preview"} must block publishing`);
  if (obj.summary.backend_auth_supabase_allowed !== false) fail(`${obj.title || "preview"} must block backend/Auth/Supabase`);
}

if (schema.visual_generation_allowed_in_ag07h !== false) fail("Schema must block visual generation");
if (schema.image_insertion_allowed_in_ag07h !== false) fail("Schema must block image insertion");
if (schema.data_unit_generation_allowed_in_ag07h !== false) fail("Schema must block data-unit generation");
if (schema.image_credit_population_allowed_in_ag07h !== false) fail("Schema must block image credit population");
if (schema.alt_text_population_allowed_in_ag07h !== false) fail("Schema must block alt-text population");
if (schema.caption_population_allowed_in_ag07h !== false) fail("Schema must block caption population");
if (schema.article_mutation_allowed_in_ag07h !== false) fail("Schema must block article mutation");
if (schema.reference_insertion_allowed_in_ag07h !== false) fail("Schema must block reference insertion");
if (schema.jsonl_append_allowed_in_ag07h !== false) fail("Schema must block JSONL append");
if (schema.database_write_allowed_in_ag07h !== false) fail("Schema must block database write");
if (schema.publishing_allowed_in_ag07h !== false) fail("Schema must block publishing");
if (schema.backend_auth_supabase_allowed_in_ag07h !== false) fail("Schema must block backend/Auth/Supabase");

if (review.closure_decision.decision !== "ag07h_visual_data_enrichment_boundary_closed") fail("AG07H closure decision mismatch");
if (review.closure_decision.proceed_to_ag07i_only_with_explicit_user_approval !== true) fail("AG07I must require explicit approval");
if (review.closure_decision.visual_data_enrichment_boundary_defined !== true) fail("Visual/data boundary must be defined");
if (review.closure_decision.visual_generation_performed !== false) fail("Visual generation must not be performed");
if (review.closure_decision.visual_asset_generation_performed !== false) fail("Visual asset generation must not be performed");
if (review.closure_decision.image_insertion_performed !== false) fail("Image insertion must not be performed");
if (review.closure_decision.data_unit_generation_performed !== false) fail("Data-unit generation must not be performed");
if (review.closure_decision.image_credit_population_performed !== false) fail("Image credit population must not be performed");
if (review.closure_decision.alt_text_population_performed !== false) fail("Alt text population must not be performed");
if (review.closure_decision.caption_population_performed !== false) fail("Caption population must not be performed");
if (review.closure_decision.production_readiness !== "not_ready") fail("Production readiness must remain not_ready");
if (review.closure_decision.publish_readiness !== "blocked") fail("Publish readiness must remain blocked");
if (review.closure_decision.article_prose_generation_allowed !== false) fail("Article prose generation must be blocked");
if (review.closure_decision.public_article_mutation_allowed !== false) fail("Public mutation must be blocked");
if (review.closure_decision.reference_insertion_allowed !== false) fail("Reference insertion must be blocked");
if (review.closure_decision.visual_generation_allowed !== false) fail("Visual generation must be blocked");
if (review.closure_decision.image_insertion_allowed !== false) fail("Image insertion must be blocked");
if (review.closure_decision.jsonl_production_append_allowed !== false) fail("JSONL production append must be blocked");
if (review.closure_decision.database_write_allowed !== false) fail("Database write must be blocked");
if (review.closure_decision.publishing_allowed !== false) fail("Publishing must be blocked");
if (review.closure_decision.backend_auth_supabase_allowed !== false) fail("Backend/Auth/Supabase must be blocked");

for (const falseField of [
  "visual_generation_performed",
  "visual_asset_generation_performed",
  "infographic_generation_performed",
  "data_unit_generation_performed",
  "image_insertion_performed",
  "hero_image_insertion_performed",
  "article_image_mutation_performed",
  "image_credit_population_performed",
  "alt_text_population_performed",
  "caption_population_performed",
  "public_article_mutation_performed",
  "article_html_mutation_performed",
  "article_prose_generated",
  "narrative_text_generated",
  "production_content_generated",
  "reference_insertion_performed",
  "reference_url_population_performed",
  "live_url_fetch_performed",
  "web_fetch_performed",
  "link_health_fetch_performed",
  "scaffold_import_performed",
  "scaffold_file_copy_performed",
  "scaffold_file_move_performed",
  "scaffold_file_delete_performed",
  "jsonl_append_performed",
  "jsonl_production_record_created",
  "database_write_performed",
  "supabase_enabled",
  "auth_enabled",
  "backend_activation_performed",
  "api_route_created",
  "approval_state_changed",
  "publish_ready_set",
  "public_publishing_performed",
  "publication_approval_granted"
]) {
  for (const obj of [review, workbench, schema, learning, registry, preview]) {
    if (obj[falseField] !== false) fail(`${falseField} must be false in ${obj.title || "preview"}`);
  }
}

for (const scriptName of ["generate:ag07h", "validate:ag07h"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag07h")) {
  fail("validate:project must include validate:ag07h");
}

for (const phrase of [
  "Purpose",
  "Inputs",
  "Workbench Boundary",
  "Visual and Data Status",
  "Production Readiness Decision",
  "Explicit Exclusions",
  "Acceptance Criteria",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG07H document missing phrase: ${phrase}`);
}

pass("AG07H registry is present.");
pass("AG07H document is present.");
pass("AG07H review, workbench, schema, learning record and preview are present.");
pass("AG07G boundary is consumed.");
pass("AG06I visual/data standard is consumed.");
pass("Visual need slots are created as empty boundary slots.");
pass("Data-unit slots are created with empty data values.");
pass("Caption, alt-text and image-credit fields remain empty.");
pass("No visual generation, image insertion, data-unit generation or visual asset mutation is performed.");
pass("AG07C packet remains unchanged, preview-only and non-production.");
pass("Production readiness remains not_ready.");
pass("Publish readiness remains blocked.");
pass("AG07H is visual/data enrichment boundary/workbench only.");
pass("No article prose generation, public mutation, reference insertion, scaffold import, JSONL production append, database write, approval-state change, publishing or backend/Auth/Supabase activation is enabled or performed.");
pass("AG07I Quality and Visitor-Value Scoring Boundary is identified as next only with explicit approval.");
