import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag07d-preview-packet-review-gap-audit.json",
  "data/content-intelligence/run-registry/ag07d-preview-packet-gap-matrix.json",
  "data/content-intelligence/learning/ag07d-preview-packet-review-learning.json",
  "data/content-intelligence/content-packets/ag07c-preview-only-dry-run-content-packet.json",
  "data/content-intelligence/quality-reviews/ag07c-content-packet-generator-preview-only-dry-run.json",
  "data/content-intelligence/quality-reviews/ag07b-content-packet-generator-dry-run-implementation-plan.json",
  "data/content-intelligence/quality-reviews/ag07a-long-form-content-packet-generator-design-dry-run-boundary.json",
  "data/content-intelligence/quality-reviews/content-intelligence-foundation-closure.json",
  "data/content-intelligence/quality-reviews/long-form-article-standard.json",
  "data/content-intelligence/visual-registry/visual-data-infographic-requirement-standard.json",
  "data/content-intelligence/reference-registry/reference-source-credibility-standard.json",
  "data/content-intelligence/run-registry/jsonl-first-content-intelligence-store-manifest.json",
  "data/content-intelligence/publish-queue/publish-queue-approval-state-register.json",
  "data/content-intelligence/quality-reviews/ag07e-preview-packet-revision-plan.json",
  "data/content-intelligence/run-registry/ag07e-preview-packet-revision-roadmap.json",
  "data/content-intelligence/schema/preview-packet-revision-plan.schema.json",
  "data/content-intelligence/learning/ag07e-preview-packet-revision-planning-learning.json",
  "data/quality/ag07e-preview-packet-revision-plan.json",
  "data/quality/ag07e-preview-packet-revision-plan-preview.json",
  "docs/quality/AG07E_PREVIEW_PACKET_REVISION_PLAN.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG07E validation failed: ${message}`);
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

const ag07dReview = readJson("data/content-intelligence/quality-reviews/ag07d-preview-packet-review-gap-audit.json");
const ag07dGapMatrix = readJson("data/content-intelligence/run-registry/ag07d-preview-packet-gap-matrix.json");
const ag07cPacket = readJson("data/content-intelligence/content-packets/ag07c-preview-only-dry-run-content-packet.json");
const ag07cReview = readJson("data/content-intelligence/quality-reviews/ag07c-content-packet-generator-preview-only-dry-run.json");
const ag07bReview = readJson("data/content-intelligence/quality-reviews/ag07b-content-packet-generator-dry-run-implementation-plan.json");
const ag07aReview = readJson("data/content-intelligence/quality-reviews/ag07a-long-form-content-packet-generator-design-dry-run-boundary.json");
const ag06zClosure = readJson("data/content-intelligence/quality-reviews/content-intelligence-foundation-closure.json");

const review = readJson("data/content-intelligence/quality-reviews/ag07e-preview-packet-revision-plan.json");
const roadmap = readJson("data/content-intelligence/run-registry/ag07e-preview-packet-revision-roadmap.json");
const schema = readJson("data/content-intelligence/schema/preview-packet-revision-plan.schema.json");
const learning = readJson("data/content-intelligence/learning/ag07e-preview-packet-revision-planning-learning.json");
const registry = readJson("data/quality/ag07e-preview-packet-revision-plan.json");
const preview = readJson("data/quality/ag07e-preview-packet-revision-plan-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG07E_PREVIEW_PACKET_REVISION_PLAN.md"), "utf8");

for (const obj of [review, roadmap, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG07E") fail(`module_id must be AG07E in ${obj.title || "preview"}`);
}

if (review.status !== "revision_plan_completed") fail("Review status must be revision_plan_completed");
if (roadmap.status !== "revision_plan_completed") fail("Roadmap status must be revision_plan_completed");
if (schema.status !== "schema_only") fail("Schema status must be schema_only");
if (learning.status !== "learning_record_only") fail("Learning status must be learning_record_only");
if (review.revision_planning_only !== true) fail("Review must be revision-planning only");
if (roadmap.revision_planning_only !== true) fail("Roadmap must be revision-planning only");
if (registry.revision_planning_only !== true) fail("Registry must be revision-planning only");
if (preview.revision_planning_only !== true) fail("Preview must be revision-planning only");

if (ag07dReview.status !== "gap_audit_completed") fail("AG07D must be gap_audit_completed");
if (ag07dReview.closure_decision.proceed_to_ag07e_revision_plan_only_with_explicit_user_approval !== true) fail("AG07D must require explicit approval for AG07E");
if (ag07dReview.closure_decision.article_prose_generation_allowed !== false) fail("AG07D must block article prose generation");
if (ag07dReview.closure_decision.public_article_mutation_allowed !== false) fail("AG07D must block public mutation");
if (ag07dReview.closure_decision.reference_insertion_allowed !== false) fail("AG07D must block reference insertion");
if (ag07dReview.closure_decision.visual_generation_allowed !== false) fail("AG07D must block visual generation");
if (ag07dReview.closure_decision.jsonl_production_append_allowed !== false) fail("AG07D must block JSONL production append");

if (ag07cPacket.status !== "preview_only_dry_run") fail("AG07C packet must remain preview_only_dry_run");
if (ag07cPacket.preview_only !== true) fail("AG07C packet must remain preview-only");
if (ag07cPacket.production_packet !== false) fail("AG07C packet must remain non-production");
if (ag07cPacket.publish_ready !== false) fail("AG07C packet must remain not publish-ready");
if (ag07cPacket.publication_allowed !== false) fail("AG07C packet must remain not publication-allowed");

if (ag07cReview.status !== "preview_only_dry_run_completed") fail("AG07C review must remain completed");
if (ag07bReview.status !== "implementation_plan_only") fail("AG07B must remain implementation-plan only");
if (ag07aReview.status !== "design_dry_run_boundary_only") fail("AG07A must remain boundary-only");
if (ag06zClosure.status !== "foundation_closed") fail("AG06Z must remain foundation_closed");

for (const obj of [review, roadmap, registry, preview]) {
  if (obj.summary.revision_plan_defined !== true) fail(`${obj.title || "preview"} must define revision plan`);
  if (obj.summary.revision_execution_performed !== false) fail(`${obj.title || "preview"} must not execute revision`);
  if (obj.summary.packet_revision_execution_allowed !== false) fail(`${obj.title || "preview"} must block packet revision execution`);
  if (obj.summary.production_readiness_after_ag07e !== "not_ready") fail(`${obj.title || "preview"} must keep production readiness not_ready`);
  if (obj.summary.publish_readiness_after_ag07e !== "blocked") fail(`${obj.title || "preview"} must keep publish readiness blocked`);
  if (obj.summary.article_prose_generated !== false) fail(`${obj.title || "preview"} must not generate article prose`);
  if (obj.summary.public_article_mutation_allowed !== false) fail(`${obj.title || "preview"} must block public mutation`);
  if (obj.summary.reference_insertion_allowed !== false) fail(`${obj.title || "preview"} must block reference insertion`);
  if (obj.summary.visual_generation_allowed !== false) fail(`${obj.title || "preview"} must block visual generation`);
  if (obj.summary.jsonl_production_append_allowed !== false) fail(`${obj.title || "preview"} must block JSONL production append`);
  if (obj.summary.database_write_allowed !== false) fail(`${obj.title || "preview"} must block database write`);
  if (obj.summary.publishing_allowed !== false) fail(`${obj.title || "preview"} must block publishing`);
  if (obj.summary.backend_auth_supabase_allowed !== false) fail(`${obj.title || "preview"} must block backend/Auth/Supabase`);
}

if (!Array.isArray(ag07dGapMatrix.gap_items) || ag07dGapMatrix.gap_items.length < 8) fail("AG07D gap matrix must have at least 8 gap items");
if (!Array.isArray(roadmap.revision_items) || roadmap.revision_items.length < 7) fail("AG07E roadmap must contain at least 7 revision items");

const mappedGapIds = new Set(roadmap.revision_items.flatMap((item) => item.source_gap_ids || []));
for (const gap of ag07dGapMatrix.gap_items) {
  if (!mappedGapIds.has(gap.gap_id)) fail(`AG07D gap not mapped into AG07E revision item: ${gap.gap_id}`);
}

for (const item of roadmap.revision_items) {
  if (item.execution_status_in_ag07e !== "planned_not_executed") fail(`Revision item must be planned_not_executed: ${item.revision_id}`);
  if (item.packet_revision_execution_allowed_in_ag07e !== false) fail(`Packet revision execution must be false: ${item.revision_id}`);
  if (item.article_prose_generation_allowed !== false) fail(`Article prose generation must be false: ${item.revision_id}`);
  if (item.production_blocker_resolved_in_ag07e !== false) fail(`Production blocker must not be resolved in AG07E: ${item.revision_id}`);
}

for (const requiredArea of [
  "section_depth_model",
  "article_prose_boundary",
  "reference_workbench_handoff",
  "visual_data_handoff",
  "quality_visitor_value_scoring",
  "publish_approval_gate",
  "database_persistence_mapping"
]) {
  if (!roadmap.revision_items.find((item) => item.revision_area === requiredArea)) {
    fail(`Missing revision area: ${requiredArea}`);
  }
}

for (const gate of roadmap.revision_gate_checklist) {
  if (gate.current_status !== "pass") fail(`Revision gate must pass: ${gate.gate_id}`);
  if (gate.execution_allowed_in_ag07e !== false) fail(`Revision gate must block execution: ${gate.gate_id}`);
}

if (review.closure_decision.decision !== "ag07e_preview_packet_revision_plan_closed") fail("AG07E closure decision mismatch");
if (review.closure_decision.proceed_to_ag07f_only_with_explicit_user_approval !== true) fail("AG07F must require explicit approval");
if (review.closure_decision.revision_execution_performed !== false) fail("Revision execution must not be performed");
if (review.closure_decision.packet_revision_execution_allowed !== false) fail("Packet revision execution must not be allowed");
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
  for (const obj of [review, roadmap, schema, learning, registry, preview]) {
    if (obj[falseField] !== false) fail(`${falseField} must be false in ${obj.title || "preview"}`);
  }
}

for (const scriptName of ["generate:ag07e", "validate:ag07e"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag07e")) {
  fail("validate:project must include validate:ag07e");
}

for (const phrase of [
  "Purpose",
  "Inputs",
  "Revision Plan",
  "Packet Status",
  "Production Readiness Decision",
  "Explicit Exclusions",
  "Acceptance Criteria",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG07E document missing phrase: ${phrase}`);
}

pass("AG07E registry is present.");
pass("AG07E document is present.");
pass("AG07E review, roadmap, schema, learning record and preview are present.");
pass("AG07D gap audit is consumed.");
pass("AG07D gaps are mapped into revision items.");
pass("All revision items remain planned_not_executed.");
pass("AG07C packet remains unchanged, preview-only and non-production.");
pass("Production readiness remains not_ready.");
pass("Publish readiness remains blocked.");
pass("AG07E is revision-planning only.");
pass("No packet revision execution, article prose generation, public mutation, reference insertion, visual generation, scaffold import, JSONL production append, database write, approval-state change, publishing or backend/Auth/Supabase activation is enabled or performed.");
pass("AG07F Preview Packet Schema Revision Boundary is identified as next only with explicit approval.");
