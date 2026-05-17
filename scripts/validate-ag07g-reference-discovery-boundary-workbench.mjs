import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag07f-preview-packet-schema-revision-boundary.json",
  "data/content-intelligence/run-registry/ag07f-preview-packet-contract-boundary-plan.json",
  "data/content-intelligence/schema/preview-packet-revised-contract.schema.json",
  "data/content-intelligence/learning/ag07f-preview-packet-schema-boundary-learning.json",
  "data/content-intelligence/quality-reviews/ag07e-preview-packet-revision-plan.json",
  "data/content-intelligence/content-packets/ag07c-preview-only-dry-run-content-packet.json",
  "data/content-intelligence/reference-registry/reference-source-credibility-standard.json",
  "data/content-intelligence/quality-reviews/long-form-article-standard.json",
  "data/content-intelligence/run-registry/jsonl-first-content-intelligence-store-manifest.json",
  "data/content-intelligence/publish-queue/publish-queue-approval-state-register.json",
  "data/content-intelligence/quality-reviews/ag07g-reference-discovery-boundary-workbench.json",
  "data/content-intelligence/reference-registry/ag07g-reference-discovery-workbench.json",
  "data/content-intelligence/schema/reference-discovery-workbench.schema.json",
  "data/content-intelligence/learning/ag07g-reference-discovery-boundary-learning.json",
  "data/quality/ag07g-reference-discovery-boundary-workbench.json",
  "data/quality/ag07g-reference-discovery-boundary-workbench-preview.json",
  "docs/quality/AG07G_REFERENCE_DISCOVERY_BOUNDARY_WORKBENCH.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG07G validation failed: ${message}`);
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

const ag07fReview = readJson("data/content-intelligence/quality-reviews/ag07f-preview-packet-schema-revision-boundary.json");
const ag07fBoundaryPlan = readJson("data/content-intelligence/run-registry/ag07f-preview-packet-contract-boundary-plan.json");
const ag07eReview = readJson("data/content-intelligence/quality-reviews/ag07e-preview-packet-revision-plan.json");
const ag07cPacket = readJson("data/content-intelligence/content-packets/ag07c-preview-only-dry-run-content-packet.json");
const ag06jReferenceStandard = readJson("data/content-intelligence/reference-registry/reference-source-credibility-standard.json");

const review = readJson("data/content-intelligence/quality-reviews/ag07g-reference-discovery-boundary-workbench.json");
const workbench = readJson("data/content-intelligence/reference-registry/ag07g-reference-discovery-workbench.json");
const schema = readJson("data/content-intelligence/schema/reference-discovery-workbench.schema.json");
const learning = readJson("data/content-intelligence/learning/ag07g-reference-discovery-boundary-learning.json");
const registry = readJson("data/quality/ag07g-reference-discovery-boundary-workbench.json");
const preview = readJson("data/quality/ag07g-reference-discovery-boundary-workbench-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG07G_REFERENCE_DISCOVERY_BOUNDARY_WORKBENCH.md"), "utf8");

for (const obj of [review, workbench, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG07G") fail(`module_id must be AG07G in ${obj.title || "preview"}`);
}

if (review.status !== "reference_discovery_boundary_defined") fail("Review status must be reference_discovery_boundary_defined");
if (workbench.status !== "reference_discovery_boundary_defined") fail("Workbench status must be reference_discovery_boundary_defined");
if (schema.status !== "schema_boundary_only") fail("Schema status must be schema_boundary_only");
if (learning.status !== "learning_record_only") fail("Learning status must be learning_record_only");

for (const obj of [review, workbench, schema, learning, registry, preview]) {
  if (obj.reference_discovery_boundary_only !== true) fail(`${obj.title || "preview"} must be reference discovery boundary only`);
}

if (ag07fReview.status !== "schema_contract_boundary_defined") fail("AG07F must be schema_contract_boundary_defined");
if (ag07fReview.closure_decision.proceed_to_ag07g_only_with_explicit_user_approval !== true) fail("AG07F must require explicit approval for AG07G");
if (ag07fReview.closure_decision.reference_insertion_allowed !== false) fail("AG07F must block reference insertion");
if (ag07fReview.closure_decision.public_article_mutation_allowed !== false) fail("AG07F must block public mutation");
if (ag07fReview.closure_decision.article_prose_generation_allowed !== false) fail("AG07F must block article prose generation");
if (ag07fReview.closure_decision.visual_generation_allowed !== false) fail("AG07F must block visual generation");
if (ag07fReview.closure_decision.jsonl_production_append_allowed !== false) fail("AG07F must block JSONL production append");

if (ag07eReview.status !== "revision_plan_completed") fail("AG07E must be revision_plan_completed");
if (ag07cPacket.status !== "preview_only_dry_run") fail("AG07C packet must remain preview_only_dry_run");
if (ag07cPacket.preview_only !== true) fail("AG07C packet must remain preview-only");
if (ag07cPacket.production_packet !== false) fail("AG07C packet must remain non-production");
if (ag07cPacket.publish_ready !== false) fail("AG07C packet must remain not publish-ready");
if (ag07cPacket.publication_allowed !== false) fail("AG07C packet must remain not publication-allowed");

const referencePlanSection = (ag07fBoundaryPlan.proposed_contract_sections || []).find((section) => section.section_id === "reference_plan");
if (!referencePlanSection) fail("AG07F reference_plan contract section must be present");

if (!Array.isArray(workbench.source_category_slots) || workbench.source_category_slots.length < 3) fail("Source category slots must be present");
for (const slot of workbench.source_category_slots) {
  if (!Array.isArray(slot.urls) || slot.urls.length !== 0) fail(`Source category slot URLs must be empty: ${slot.slot_id}`);
  if (slot.candidate_url_population_allowed_in_ag07g !== false) fail(`Candidate URL population must be false: ${slot.slot_id}`);
  if (slot.approved_url_population_allowed_in_ag07g !== false) fail(`Approved URL population must be false: ${slot.slot_id}`);
}

if (!Array.isArray(workbench.candidate_reference_slots) || workbench.candidate_reference_slots.length < 2) fail("Candidate reference slots must be present");
for (const slot of workbench.candidate_reference_slots) {
  if (slot.candidate_status !== "empty_boundary_slot") fail(`Candidate slot must be empty boundary slot: ${slot.slot_id}`);
  if (slot.candidate_url !== "") fail(`Candidate URL must be empty: ${slot.slot_id}`);
  if (slot.approved_url !== "") fail(`Approved URL must be empty: ${slot.slot_id}`);
  if (slot.rejected_url !== "") fail(`Rejected URL must be empty: ${slot.slot_id}`);
  if (slot.discovery_allowed_in_ag07g !== false) fail(`Discovery must be false in AG07G: ${slot.slot_id}`);
  if (slot.url_population_allowed_in_ag07g !== false) fail(`URL population must be false in AG07G: ${slot.slot_id}`);
  if (slot.live_fetch_allowed_in_ag07g !== false) fail(`Live fetch must be false in AG07G: ${slot.slot_id}`);
  if (slot.link_health_check_allowed_in_ag07g !== false) fail(`Link health fetch must be false in AG07G: ${slot.slot_id}`);
  if (slot.insertion_allowed_in_ag07g !== false) fail(`Reference insertion must be false in AG07G: ${slot.slot_id}`);
}

if (!Array.isArray(workbench.review_workflow) || workbench.review_workflow.length < 5) fail("Review workflow must be present");
for (const step of workbench.review_workflow) {
  if (step.allowed_in_ag07g !== false) fail(`Workflow step must not be allowed in AG07G: ${step.step_id}`);
  if (step.future_approval_required !== true) fail(`Workflow step must require future approval: ${step.step_id}`);
}

if (!Array.isArray(workbench.credibility_checklist) || workbench.credibility_checklist.length < 5) fail("Credibility checklist must be present");
for (const check of workbench.credibility_checklist) {
  if (check.required_before_approval !== true) fail(`Credibility check must be required before approval: ${check.check_id}`);
  if (check.evaluated_in_ag07g !== false) fail(`Credibility check must not be evaluated in AG07G: ${check.check_id}`);
}

if (!Array.isArray(workbench.link_health_fields) || !workbench.link_health_fields.includes("not_checked")) {
  fail("Link health fields must include not_checked");
}

for (const obj of [review, workbench, registry, preview]) {
  if (obj.summary.reference_url_population_performed !== false) fail(`${obj.title || "preview"} must not populate URLs`);
  if (obj.summary.candidate_reference_url_count !== 0) fail(`${obj.title || "preview"} candidate URL count must be zero`);
  if (obj.summary.approved_reference_url_count !== 0) fail(`${obj.title || "preview"} approved URL count must be zero`);
  if (obj.summary.rejected_reference_url_count !== 0) fail(`${obj.title || "preview"} rejected URL count must be zero`);
  if (obj.summary.live_url_fetch_performed !== false) fail(`${obj.title || "preview"} must not fetch live URLs`);
  if (obj.summary.link_health_fetch_performed !== false) fail(`${obj.title || "preview"} must not perform link-health fetch`);
  if (obj.summary.reference_insertion_performed !== false) fail(`${obj.title || "preview"} must not insert references`);
  if (obj.summary.production_readiness_after_ag07g !== "not_ready") fail(`${obj.title || "preview"} production readiness must remain not_ready`);
  if (obj.summary.publish_readiness_after_ag07g !== "blocked") fail(`${obj.title || "preview"} publish readiness must remain blocked`);
  if (obj.summary.public_article_mutation_allowed !== false) fail(`${obj.title || "preview"} must block public mutation`);
  if (obj.summary.article_prose_generated !== false) fail(`${obj.title || "preview"} must not generate article prose`);
  if (obj.summary.visual_generation_allowed !== false) fail(`${obj.title || "preview"} must block visual generation`);
  if (obj.summary.jsonl_production_append_allowed !== false) fail(`${obj.title || "preview"} must block JSONL append`);
  if (obj.summary.database_write_allowed !== false) fail(`${obj.title || "preview"} must block database write`);
  if (obj.summary.publishing_allowed !== false) fail(`${obj.title || "preview"} must block publishing`);
  if (obj.summary.backend_auth_supabase_allowed !== false) fail(`${obj.title || "preview"} must block backend/Auth/Supabase`);
}

if (schema.url_population_allowed_in_ag07g !== false) fail("Schema must block URL population");
if (schema.reference_insertion_allowed_in_ag07g !== false) fail("Schema must block reference insertion");
if (schema.web_fetch_allowed_in_ag07g !== false) fail("Schema must block web fetch");
if (schema.link_health_fetch_allowed_in_ag07g !== false) fail("Schema must block link-health fetch");
if (schema.article_mutation_allowed_in_ag07g !== false) fail("Schema must block article mutation");
if (schema.publishing_allowed_in_ag07g !== false) fail("Schema must block publishing");
if (schema.backend_auth_supabase_allowed_in_ag07g !== false) fail("Schema must block backend/Auth/Supabase");

if (review.closure_decision.decision !== "ag07g_reference_discovery_boundary_closed") fail("AG07G closure decision mismatch");
if (review.closure_decision.proceed_to_ag07h_only_with_explicit_user_approval !== true) fail("AG07H must require explicit approval");
if (review.closure_decision.reference_discovery_boundary_defined !== true) fail("Reference boundary must be defined");
if (review.closure_decision.reference_url_population_performed !== false) fail("Reference URL population must not be performed");
if (review.closure_decision.candidate_reference_url_population_performed !== false) fail("Candidate URL population must not be performed");
if (review.closure_decision.approved_reference_url_population_performed !== false) fail("Approved URL population must not be performed");
if (review.closure_decision.reference_insertion_performed !== false) fail("Reference insertion must not be performed");
if (review.closure_decision.live_url_fetch_performed !== false) fail("Live URL fetch must not be performed");
if (review.closure_decision.link_health_fetch_performed !== false) fail("Link-health fetch must not be performed");
if (review.closure_decision.production_readiness !== "not_ready") fail("Production readiness must remain not_ready");
if (review.closure_decision.publish_readiness !== "blocked") fail("Publish readiness must remain blocked");
if (review.closure_decision.article_prose_generation_allowed !== false) fail("Article prose generation must be blocked");
if (review.closure_decision.public_article_mutation_allowed !== false) fail("Public mutation must be blocked");
if (review.closure_decision.reference_insertion_allowed !== false) fail("Reference insertion must be blocked");
if (review.closure_decision.visual_generation_allowed !== false) fail("Visual generation must be blocked");
if (review.closure_decision.jsonl_production_append_allowed !== false) fail("JSONL production append must be blocked");
if (review.closure_decision.database_write_allowed !== false) fail("Database write must be blocked");
if (review.closure_decision.publishing_allowed !== false) fail("Publishing must be blocked");
if (review.closure_decision.backend_auth_supabase_allowed !== false) fail("Backend/Auth/Supabase must be blocked");

for (const falseField of [
  "reference_url_population_performed",
  "candidate_reference_url_population_performed",
  "approved_reference_url_population_performed",
  "rejected_reference_url_population_performed",
  "live_url_fetch_performed",
  "web_fetch_performed",
  "link_health_fetch_performed",
  "reference_insertion_performed",
  "article_prose_generated",
  "narrative_text_generated",
  "production_content_generated",
  "public_article_mutation_performed",
  "article_html_mutation_performed",
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
  for (const obj of [review, workbench, schema, learning, registry, preview]) {
    if (obj[falseField] !== false) fail(`${falseField} must be false in ${obj.title || "preview"}`);
  }
}

for (const scriptName of ["generate:ag07g", "validate:ag07g"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag07g")) {
  fail("validate:project must include validate:ag07g");
}

for (const phrase of [
  "Purpose",
  "Inputs",
  "Workbench Boundary",
  "Reference Status",
  "Production Readiness Decision",
  "Explicit Exclusions",
  "Acceptance Criteria",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG07G document missing phrase: ${phrase}`);
}

pass("AG07G registry is present.");
pass("AG07G document is present.");
pass("AG07G review, workbench, schema, learning record and preview are present.");
pass("AG07F boundary is consumed.");
pass("AG06J reference/source credibility standard is consumed.");
pass("Candidate reference slots are created as empty boundary slots.");
pass("Candidate, approved and rejected URL fields remain empty.");
pass("No reference URL population, live URL fetch, link-health fetch or reference insertion is performed.");
pass("AG07C packet remains unchanged, preview-only and non-production.");
pass("Production readiness remains not_ready.");
pass("Publish readiness remains blocked.");
pass("AG07G is reference discovery boundary/workbench only.");
pass("No article prose generation, public mutation, visual generation, scaffold import, JSONL production append, database write, approval-state change, publishing or backend/Auth/Supabase activation is enabled or performed.");
pass("AG07H Visual and Data Enrichment Boundary / Workbench is identified as next only with explicit approval.");
