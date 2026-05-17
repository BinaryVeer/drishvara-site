import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag07e-preview-packet-revision-plan.json",
  "data/content-intelligence/run-registry/ag07e-preview-packet-revision-roadmap.json",
  "data/content-intelligence/schema/preview-packet-revision-plan.schema.json",
  "data/content-intelligence/learning/ag07e-preview-packet-revision-planning-learning.json",
  "data/content-intelligence/quality-reviews/ag07d-preview-packet-review-gap-audit.json",
  "data/content-intelligence/run-registry/ag07d-preview-packet-gap-matrix.json",
  "data/content-intelligence/content-packets/ag07c-preview-only-dry-run-content-packet.json",
  "data/content-intelligence/schema/content-packet-preview-dry-run.schema.json",
  "data/content-intelligence/schema/content-packet.schema.json",
  "data/content-intelligence/quality-reviews/long-form-article-standard.json",
  "data/content-intelligence/visual-registry/visual-data-infographic-requirement-standard.json",
  "data/content-intelligence/reference-registry/reference-source-credibility-standard.json",
  "data/content-intelligence/run-registry/jsonl-first-content-intelligence-store-manifest.json",
  "data/content-intelligence/publish-queue/publish-queue-approval-state-register.json",
  "data/content-intelligence/quality-reviews/ag07f-preview-packet-schema-revision-boundary.json",
  "data/content-intelligence/run-registry/ag07f-preview-packet-contract-boundary-plan.json",
  "data/content-intelligence/schema/preview-packet-revised-contract.schema.json",
  "data/content-intelligence/learning/ag07f-preview-packet-schema-boundary-learning.json",
  "data/quality/ag07f-preview-packet-schema-revision-boundary.json",
  "data/quality/ag07f-preview-packet-schema-revision-boundary-preview.json",
  "docs/quality/AG07F_PREVIEW_PACKET_SCHEMA_REVISION_BOUNDARY.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG07F validation failed: ${message}`);
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

const ag07eReview = readJson("data/content-intelligence/quality-reviews/ag07e-preview-packet-revision-plan.json");
const ag07eRoadmap = readJson("data/content-intelligence/run-registry/ag07e-preview-packet-revision-roadmap.json");
const ag07dReview = readJson("data/content-intelligence/quality-reviews/ag07d-preview-packet-review-gap-audit.json");
const ag07dGapMatrix = readJson("data/content-intelligence/run-registry/ag07d-preview-packet-gap-matrix.json");
const ag07cPacket = readJson("data/content-intelligence/content-packets/ag07c-preview-only-dry-run-content-packet.json");

const review = readJson("data/content-intelligence/quality-reviews/ag07f-preview-packet-schema-revision-boundary.json");
const boundaryPlan = readJson("data/content-intelligence/run-registry/ag07f-preview-packet-contract-boundary-plan.json");
const revisedSchema = readJson("data/content-intelligence/schema/preview-packet-revised-contract.schema.json");
const learning = readJson("data/content-intelligence/learning/ag07f-preview-packet-schema-boundary-learning.json");
const registry = readJson("data/quality/ag07f-preview-packet-schema-revision-boundary.json");
const preview = readJson("data/quality/ag07f-preview-packet-schema-revision-boundary-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG07F_PREVIEW_PACKET_SCHEMA_REVISION_BOUNDARY.md"), "utf8");

for (const obj of [review, boundaryPlan, revisedSchema, learning, registry, preview]) {
  if (obj.module_id !== "AG07F") fail(`module_id must be AG07F in ${obj.title || "preview"}`);
}

if (review.status !== "schema_contract_boundary_defined") fail("Review status must be schema_contract_boundary_defined");
if (boundaryPlan.status !== "schema_contract_boundary_defined") fail("Boundary plan status must be schema_contract_boundary_defined");
if (revisedSchema.status !== "schema_contract_boundary_only") fail("Revised schema status must be schema_contract_boundary_only");
if (learning.status !== "learning_record_only") fail("Learning status must be learning_record_only");

for (const obj of [review, boundaryPlan, revisedSchema, learning, registry, preview]) {
  if (obj.schema_contract_revision_boundary_only !== true) fail(`${obj.title || "preview"} must be schema/contract boundary only`);
}

if (ag07eReview.status !== "revision_plan_completed") fail("AG07E must be revision_plan_completed");
if (ag07eReview.closure_decision.proceed_to_ag07f_only_with_explicit_user_approval !== true) fail("AG07E must require explicit approval for AG07F");
if (ag07eReview.closure_decision.packet_revision_execution_allowed !== false) fail("AG07E must block packet revision execution");
if (ag07eReview.closure_decision.article_prose_generation_allowed !== false) fail("AG07E must block article prose generation");
if (ag07eReview.closure_decision.public_article_mutation_allowed !== false) fail("AG07E must block public mutation");
if (ag07eReview.closure_decision.reference_insertion_allowed !== false) fail("AG07E must block reference insertion");
if (ag07eReview.closure_decision.visual_generation_allowed !== false) fail("AG07E must block visual generation");
if (ag07eReview.closure_decision.jsonl_production_append_allowed !== false) fail("AG07E must block JSONL production append");

if (ag07dReview.status !== "gap_audit_completed") fail("AG07D must be gap_audit_completed");
if (!Array.isArray(ag07dGapMatrix.gap_items) || ag07dGapMatrix.gap_items.length < 8) fail("AG07D gap matrix must have at least 8 gap items");
if (!Array.isArray(ag07eRoadmap.revision_items) || ag07eRoadmap.revision_items.length < 7) fail("AG07E roadmap must have at least 7 revision items");

if (ag07cPacket.status !== "preview_only_dry_run") fail("AG07C packet must remain preview_only_dry_run");
if (ag07cPacket.preview_only !== true) fail("AG07C packet must remain preview-only");
if (ag07cPacket.production_packet !== false) fail("AG07C packet must remain non-production");
if (ag07cPacket.publish_ready !== false) fail("AG07C packet must remain not publish-ready");
if (ag07cPacket.publication_allowed !== false) fail("AG07C packet must remain not publication-allowed");

for (const obj of [review, boundaryPlan, registry, preview]) {
  if (obj.summary.schema_contract_revision_boundary_defined !== true) fail(`${obj.title || "preview"} must define schema boundary`);
  if (obj.summary.schema_contract_revision_executed !== false) fail(`${obj.title || "preview"} must not execute schema revision`);
  if (obj.summary.packet_revision_execution_performed !== false) fail(`${obj.title || "preview"} must not execute packet revision`);
  if (obj.summary.revised_packet_created !== false) fail(`${obj.title || "preview"} must not create revised packet`);
  if (obj.summary.production_readiness_after_ag07f !== "not_ready") fail(`${obj.title || "preview"} must keep production readiness not_ready`);
  if (obj.summary.publish_readiness_after_ag07f !== "blocked") fail(`${obj.title || "preview"} must keep publish readiness blocked`);
  if (obj.summary.article_prose_generated !== false) fail(`${obj.title || "preview"} must not generate article prose`);
  if (obj.summary.public_article_mutation_allowed !== false) fail(`${obj.title || "preview"} must block public mutation`);
  if (obj.summary.reference_insertion_allowed !== false) fail(`${obj.title || "preview"} must block reference insertion`);
  if (obj.summary.visual_generation_allowed !== false) fail(`${obj.title || "preview"} must block visual generation`);
  if (obj.summary.jsonl_production_append_allowed !== false) fail(`${obj.title || "preview"} must block JSONL production append`);
  if (obj.summary.database_write_allowed !== false) fail(`${obj.title || "preview"} must block database write`);
  if (obj.summary.publishing_allowed !== false) fail(`${obj.title || "preview"} must block publishing`);
  if (obj.summary.backend_auth_supabase_allowed !== false) fail(`${obj.title || "preview"} must block backend/Auth/Supabase`);
}

if (!Array.isArray(boundaryPlan.proposed_contract_sections) || boundaryPlan.proposed_contract_sections.length < 10) {
  fail("Boundary plan must contain at least 10 proposed contract sections");
}

for (const requiredSection of [
  "identity",
  "source_context",
  "reader_value",
  "long_form_structure",
  "reference_plan",
  "visual_data_plan",
  "quality_value_gates",
  "publish_approval_gate",
  "persistence_mapping",
  "audit_trace"
]) {
  const section = boundaryPlan.proposed_contract_sections.find((item) => item.section_id === requiredSection);
  if (!section) fail(`Missing proposed contract section: ${requiredSection}`);
  if (!Array.isArray(section.required_fields) || section.required_fields.length < 1) {
    fail(`Proposed contract section must define required fields: ${requiredSection}`);
  }
  if (section.applies_to_current_ag07c_packet_in_ag07f !== false) {
    fail(`Proposed contract section must not apply to AG07C packet in AG07F: ${requiredSection}`);
  }
}

if (!Array.isArray(boundaryPlan.contract_rules) || boundaryPlan.contract_rules.length < 6) fail("Contract rules must be present");
for (const rule of boundaryPlan.contract_rules) {
  if (rule.enforcement_status !== "boundary_defined_not_executed") fail(`Contract rule must remain boundary-only: ${rule.rule_id}`);
}

if (!Array.isArray(boundaryPlan.proposed_schema_delta) || boundaryPlan.proposed_schema_delta.length < 7) fail("Proposed schema deltas must be present");
for (const delta of boundaryPlan.proposed_schema_delta) {
  if (delta.applied_in_ag07f !== false) fail(`Schema delta must not be applied in AG07F: ${delta.delta_id}`);
}

if (revisedSchema.applies_to_current_ag07c_packet_in_ag07f !== false) fail("Revised schema must not apply to current AG07C packet in AG07F");
if (revisedSchema.future_application_requires_explicit_approval !== true) fail("Revised schema future application must require explicit approval");

for (const [key, expected] of Object.entries({
  preview_only: true,
  production_packet: false,
  publish_ready: false,
  publication_allowed: false,
  article_prose_generation_allowed: false,
  public_article_mutation_allowed: false,
  reference_insertion_allowed: false,
  visual_generation_allowed: false,
  jsonl_production_append_allowed: false,
  database_write_allowed: false,
  backend_auth_supabase_allowed: false
})) {
  if (revisedSchema.required_global_guards[key] !== expected) fail(`Revised schema required guard mismatch: ${key}`);
}

if (review.closure_decision.decision !== "ag07f_preview_packet_schema_revision_boundary_closed") fail("AG07F closure decision mismatch");
if (review.closure_decision.proceed_to_ag07g_only_with_explicit_user_approval !== true) fail("AG07G must require explicit approval");
if (review.closure_decision.schema_contract_revision_boundary_defined !== true) fail("Schema boundary must be defined");
if (review.closure_decision.schema_contract_revision_executed !== false) fail("Schema revision must not be executed");
if (review.closure_decision.packet_revision_execution_performed !== false) fail("Packet revision execution must not be performed");
if (review.closure_decision.revised_packet_created !== false) fail("Revised packet must not be created");
if (review.closure_decision.production_readiness !== "not_ready") fail("Production readiness must remain not_ready");
if (review.closure_decision.publish_readiness !== "blocked") fail("Publish readiness must remain blocked");
if (review.closure_decision.article_prose_generation_allowed !== false) fail("Article prose generation must not be allowed");
if (review.closure_decision.public_article_mutation_allowed !== false) fail("Public mutation must not be allowed");
if (review.closure_decision.reference_insertion_allowed !== false) fail("Reference insertion must not be allowed");
if (review.closure_decision.visual_generation_allowed !== false) fail("Visual generation must not be allowed");
if (review.closure_decision.jsonl_production_append_allowed !== false) fail("JSONL production append must not be allowed");
if (review.closure_decision.database_write_allowed !== false) fail("Database write must not be allowed");
if (review.closure_decision.publishing_allowed !== false) fail("Publishing must not be allowed");
if (review.closure_decision.backend_auth_supabase_allowed !== false) fail("Backend/Auth/Supabase must not be allowed");

for (const falseField of [
  "packet_revision_execution_performed",
  "preview_packet_modified",
  "current_ag07c_packet_modified",
  "revised_packet_created",
  "article_prose_generated",
  "narrative_text_generated",
  "production_content_generated",
  "public_article_mutation_performed",
  "article_html_mutation_performed",
  "reference_insertion_performed",
  "reference_url_population_performed",
  "reference_url_change_performed",
  "visual_generation_performed",
  "visual_asset_generation_performed",
  "infographic_generation_performed",
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
  for (const obj of [review, boundaryPlan, revisedSchema, learning, registry, preview]) {
    if (obj[falseField] !== false) fail(`${falseField} must be false in ${obj.title || "preview"}`);
  }
}

for (const scriptName of ["generate:ag07f", "validate:ag07f"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag07f")) {
  fail("validate:project must include validate:ag07f");
}

for (const phrase of [
  "Purpose",
  "Inputs",
  "Contract Boundary",
  "Packet Status",
  "Production Readiness Decision",
  "Explicit Exclusions",
  "Acceptance Criteria",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG07F document missing phrase: ${phrase}`);
}

pass("AG07F registry is present.");
pass("AG07F document is present.");
pass("AG07F review, boundary plan, revised contract schema, learning record and preview are present.");
pass("AG07E revision plan is consumed.");
pass("Proposed contract sections are defined.");
pass("Proposed schema deltas are recorded but not applied.");
pass("AG07C packet remains unchanged, preview-only and non-production.");
pass("Production readiness remains not_ready.");
pass("Publish readiness remains blocked.");
pass("AG07F is schema/contract revision boundary only.");
pass("No packet revision execution, revised packet creation, article prose generation, public mutation, reference insertion, visual generation, scaffold import, JSONL production append, database write, approval-state change, publishing or backend/Auth/Supabase activation is enabled or performed.");
pass("AG07G Reference Discovery Boundary / Workbench is identified as next only with explicit approval.");
