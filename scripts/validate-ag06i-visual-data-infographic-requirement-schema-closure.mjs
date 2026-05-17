import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/content-intelligence-foundation-alignment-review.json",
  "data/content-intelligence/quality-reviews/long-form-article-standard.json",
  "data/content-intelligence/publish-queue/long-form-batch-01-content-packet-planning.json",
  "data/content-intelligence/schema/content-packet.schema.json",
  "data/content-intelligence/quality-reviews/visual-data-infographic-requirement-schema-closure.json",
  "data/content-intelligence/visual-registry/visual-data-infographic-requirement-standard.json",
  "data/content-intelligence/schema/visual-data-infographic-requirement.schema.json",
  "data/quality/ag06i-visual-data-infographic-requirement-schema-closure.json",
  "data/quality/ag06i-visual-data-infographic-requirement-schema-closure-preview.json",
  "docs/quality/AG06I_VISUAL_DATA_INFOGRAPHIC_REQUIREMENT_SCHEMA_CLOSURE.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG06I validation failed: ${message}`);
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

const ag06hR1 = readJson("data/content-intelligence/quality-reviews/content-intelligence-foundation-alignment-review.json");
const ag06e = readJson("data/content-intelligence/quality-reviews/long-form-article-standard.json");
const closure = readJson("data/content-intelligence/quality-reviews/visual-data-infographic-requirement-schema-closure.json");
const standard = readJson("data/content-intelligence/visual-registry/visual-data-infographic-requirement-standard.json");
const schema = readJson("data/content-intelligence/schema/visual-data-infographic-requirement.schema.json");
const registry = readJson("data/quality/ag06i-visual-data-infographic-requirement-schema-closure.json");
const preview = readJson("data/quality/ag06i-visual-data-infographic-requirement-schema-closure-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG06I_VISUAL_DATA_INFOGRAPHIC_REQUIREMENT_SCHEMA_CLOSURE.md"), "utf8");

for (const obj of [closure, standard, schema, registry, preview]) {
  if (obj.module_id !== "AG06I") fail(`module_id must be AG06I in ${obj.title || "preview"}`);
}

if (preview.preview_only !== true) fail("Preview must be preview-only");
if (registry.governance_only !== true) fail("Registry must be governance-only");
if (registry.schema_closure_only !== true) fail("Registry must be schema-closure-only");
if (closure.status !== "schema_closure_only") fail("Closure status must be schema_closure_only");
if (standard.status !== "schema_closure_only") fail("Standard status must be schema_closure_only");
if (schema.status !== "schema_only") fail("Schema status must be schema_only");

if (ag06hR1.summary.immediate_next_stage !== "AG06I") fail("AG06H-R1 must identify AG06I as immediate next stage");
if (ag06hR1.decision.do_not_proceed_to_reference_discovery_yet !== true) fail("AG06H-R1 must pause reference discovery");
if (ag06hR1.summary.ag07_blocked_until_ag06z !== true) fail("AG07 must remain blocked until AG06Z");

if (standard.summary.primary_hero_visual_required !== true) fail("Primary hero visual must be required");
if (standard.summary.minimum_primary_hero_visual_count !== 1) fail("Minimum primary hero visual count must be 1");
if (standard.summary.structured_visual_or_data_unit_required !== true) fail("Structured visual/data unit must be required");
if (standard.summary.minimum_structured_visual_or_data_unit_count !== 1) fail("Minimum structured visual/data unit count must be 1");
if (standard.summary.image_credit_or_attribution_required !== true) fail("Image credit/attribution must be required");
if (standard.summary.alt_text_plan_required !== true) fail("Alt-text plan must be required");
if (standard.summary.mobile_safe_layout_required !== true) fail("Mobile-safe layout must be required");
if (standard.summary.visual_quality_score_required !== true) fail("Visual quality score must be required for future readiness");
if (standard.summary.visual_quality_score_min_publish_ready !== 80) fail("Visual quality score threshold must be 80");

if (closure.ag06e_gate_alignment.requires_visual_plan !== ag06e.summary.requires_visual_plan) fail("AG06E visual plan requirement must align");
if (closure.ag06e_gate_alignment.requires_primary_visual !== ag06e.summary.requires_primary_visual) fail("AG06E primary visual requirement must align");
if (closure.ag06e_gate_alignment.requires_image_credit !== ag06e.summary.requires_image_credit) fail("AG06E image credit requirement must align");
if (closure.ag06e_gate_alignment.requires_data_box_chart_graph_or_infographic !== ag06e.summary.requires_data_box_chart_graph_or_infographic) fail("AG06E data enrichment requirement must align");

if (!Array.isArray(standard.visual_types) || standard.visual_types.length < 8) fail("Visual types must include at least 8 types");
for (const typeId of ["hero_visual", "data_box", "comparison_table", "timeline", "concept_diagram", "flowchart", "chart_or_graph", "map_or_spatial_view", "infographic"]) {
  if (!standard.visual_types.find((x) => x.type_id === typeId)) fail(`Missing visual type: ${typeId}`);
}

if (!Array.isArray(standard.structured_enrichment_types) || standard.structured_enrichment_types.length < 1) fail("Structured enrichment types must be present");
if (standard.structured_enrichment_types.includes("hero_visual")) fail("Hero visual must not count as structured enrichment unit");

for (const field of [
  "visual_id",
  "visual_type",
  "article_or_packet_id",
  "placement",
  "visual_intent",
  "reader_value",
  "source_or_data_basis",
  "rights_or_credit_status",
  "credit_or_attribution_text",
  "alt_text_plan",
  "caption_or_context_plan",
  "mobile_safe_layout_expectation",
  "generation_status",
  "review_status"
]) {
  if (!standard.per_visual_record_required_fields.includes(field)) fail(`Missing per-visual required field: ${field}`);
  if (!schema.per_visual_record_required_fields.includes(field)) fail(`Schema missing per-visual required field: ${field}`);
}

const visualWeightTotal = Object.values(standard.visual_quality_scoring.weights || {}).reduce((a, b) => a + b, 0);
if (visualWeightTotal !== 100) fail(`Visual quality scoring weights must total 100, got ${visualWeightTotal}`);
if (standard.visual_quality_scoring.publish_ready_minimum !== 80) fail("Visual publish-ready threshold must be 80");

for (const gate of [
  "primary_hero_visual_planned",
  "primary_hero_visual_credit_or_attribution_planned",
  "primary_hero_visual_alt_text_planned",
  "at_least_one_structured_visual_or_data_unit_planned",
  "visual_source_or_data_basis_recorded",
  "rights_credit_review_pending_or_passed",
  "mobile_safe_layout_expectation_recorded",
  "visual_quality_score_planned",
  "no_visual_asset_generation_in_ag06i",
  "no_public_article_mutation_in_ag06i"
]) {
  if (!standard.publish_readiness_gates.includes(gate)) fail(`Missing publish readiness gate: ${gate}`);
  if (!schema.publish_readiness_gates.includes(gate)) fail(`Schema missing publish readiness gate: ${gate}`);
}

if (closure.closure_decision.decision !== "visual_data_infographic_requirement_schema_closed_for_foundation") fail("Closure decision mismatch");
if (closure.closure_decision.proceed_to_ag06j_reference_source_credibility_schema_closure !== true) fail("AG06J must be next");
if (closure.closure_decision.visual_asset_generation_allowed !== false) fail("Visual asset generation must not be allowed");
if (closure.closure_decision.public_article_mutation_allowed !== false) fail("Public article mutation must not be allowed");
if (closure.closure_decision.content_packet_generation_allowed !== false) fail("Content packet generation must not be allowed");
if (closure.closure_decision.publication_allowed !== false) fail("Publication must not be allowed");

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
  "image_generation_performed",
  "infographic_generation_performed",
  "chart_generation_performed",
  "map_generation_performed",
  "quality_scoring_performed",
  "visitor_value_scoring_performed"
]) {
  for (const obj of [closure, standard, schema, registry]) {
    if (obj[falseField] !== false) fail(`${falseField} must be false in ${obj.title}`);
  }
}

for (const scriptName of ["generate:ag06i", "validate:ag06i"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag06i")) {
  fail("validate:project must include validate:ag06i");
}

for (const phrase of [
  "Purpose",
  "Inputs",
  "Mandatory Visual Standard",
  "Visual Quality Requirements",
  "Visual Quality Scoring",
  "Publish-Readiness Gates",
  "Explicit Exclusions",
  "Acceptance Criteria",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG06I document missing phrase: ${phrase}`);
}

pass("AG06I registry is present.");
pass("AG06I document is present.");
pass("AG06I closure review, visual standard, schema and preview are present.");
pass("AG06H-R1 alignment is consumed and reference discovery remains paused.");
pass("Primary hero visual requirement is defined.");
pass("Structured visual/data-unit requirement is defined.");
pass("Image credit, alt-text, caption/context and mobile-safe layout requirements are defined.");
pass("Allowed visual and data enrichment types are recorded.");
pass("Visual quality scoring weights total 100.");
pass("Publish-readiness gates are recorded.");
pass("AG06I is governance/schema closure only.");
pass("No visual generation, article mutation, reference change, CSS/JS mutation, scaffold import, backend/Auth/Supabase activation or publishing is enabled or performed.");
pass("AG06J Reference and Source Credibility Schema Closure is identified as next.");
