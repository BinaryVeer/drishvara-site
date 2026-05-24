import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();









function ag12cControlledLayoutRefinementAllowsPostMutation(selectedPath = null, currentHash = null) {
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag12c-controlled-layout-refinement-apply.json");

  if (!fs.existsSync(applyRecordPath)) return false;

  try {
    const applyRecord = JSON.parse(fs.readFileSync(applyRecordPath, "utf8"));
    const targetPath = selectedPath || applyRecord.selected_article_path;

    if (!targetPath || applyRecord.selected_article_path !== targetPath) return false;

    const fullArticlePath = path.join(root, targetPath);
    if (!fs.existsSync(fullArticlePath)) return false;

    const html = fs.readFileSync(fullArticlePath, "utf8");
    const hashToCheck = currentHash || sha256(html);

    return (
      applyRecord.status === "controlled_layout_refinement_applied_pending_post_refinement_audit" &&
      applyRecord.post_refinement_hash === hashToCheck &&
      html.includes("AG12C-LAYOUT-REFINEMENT:START") &&
      html.includes('data-drishvara-layout-treatment="collapsed-pilot-annex"')
    );
  } catch {
    return false;
  }
}

function ag11gControlledCompositeInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
  if (ag12cControlledLayoutRefinementAllowsPostMutation(...arguments)) return true;
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag11g-article-support-composite-object-controlled-cycle-apply.json");

  if (!fs.existsSync(applyRecordPath)) return false;

  try {
    const applyRecord = JSON.parse(fs.readFileSync(applyRecordPath, "utf8"));
    const targetPath = selectedPath || applyRecord.selected_article_path;

    if (!targetPath || applyRecord.selected_article_path !== targetPath) return false;

    const fullArticlePath = path.join(root, targetPath);
    if (!fs.existsSync(fullArticlePath)) return false;

    const html = fs.readFileSync(fullArticlePath, "utf8");
    const hashToCheck = currentHash || sha256(html);

    return (
      applyRecord.status === "article_support_composite_object_inserted_audited_closed" &&
      applyRecord.post_insertion_hash === hashToCheck &&
      html.includes(applyRecord.insertion_marker_start) &&
      html.includes(applyRecord.insertion_marker_end) &&
      html.includes(applyRecord.object_title) &&
      html.includes(applyRecord.visible_credit) &&
      html.includes("AG11G-COMPOSITE-001")
    );
  } catch {
    return false;
  }
}

function ag11fControlledMapInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
  if (ag11gControlledCompositeInsertionAllowsPostMutation(...arguments)) return true;
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag11f-map-geographic-object-controlled-cycle-apply.json");

  if (!fs.existsSync(applyRecordPath)) return false;

  try {
    const applyRecord = JSON.parse(fs.readFileSync(applyRecordPath, "utf8"));
    const targetPath = selectedPath || applyRecord.selected_article_path;

    if (!targetPath || applyRecord.selected_article_path !== targetPath) return false;

    const fullArticlePath = path.join(root, targetPath);
    if (!fs.existsSync(fullArticlePath)) return false;

    const html = fs.readFileSync(fullArticlePath, "utf8");
    const hashToCheck = currentHash || sha256(html);

    return (
      applyRecord.status === "map_geographic_object_inserted_audited_closed" &&
      applyRecord.post_insertion_hash === hashToCheck &&
      html.includes(applyRecord.insertion_marker_start) &&
      html.includes(applyRecord.insertion_marker_end) &&
      html.includes(applyRecord.asset_src_in_article) &&
      html.includes(applyRecord.map_title) &&
      html.includes(applyRecord.visible_credit)
    );
  } catch {
    return false;
  }
}

function ag11eControlledTableInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
  if (ag11fControlledMapInsertionAllowsPostMutation(...arguments)) return true;
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag11e-table-structured-object-controlled-cycle-apply.json");

  if (!fs.existsSync(applyRecordPath)) return false;

  try {
    const applyRecord = JSON.parse(fs.readFileSync(applyRecordPath, "utf8"));
    const targetPath = selectedPath || applyRecord.selected_article_path;

    if (!targetPath || applyRecord.selected_article_path !== targetPath) return false;

    const fullArticlePath = path.join(root, targetPath);
    if (!fs.existsSync(fullArticlePath)) return false;

    const html = fs.readFileSync(fullArticlePath, "utf8");
    const hashToCheck = currentHash || sha256(html);

    return (
      applyRecord.status === "table_structured_object_inserted_audited_closed" &&
      applyRecord.post_insertion_hash === hashToCheck &&
      html.includes(applyRecord.insertion_marker_start) &&
      html.includes(applyRecord.insertion_marker_end) &&
      html.includes(applyRecord.table_title) &&
      html.includes(applyRecord.visible_credit) &&
      html.includes("AG11E-TABLE-001")
    );
  } catch {
    return false;
  }
}

function ag11dControlledFigureDiagramInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
  if (ag11eControlledTableInsertionAllowsPostMutation(...arguments)) return true;
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag11d-figure-diagram-controlled-cycle-apply.json");

  if (!fs.existsSync(applyRecordPath)) return false;

  try {
    const applyRecord = JSON.parse(fs.readFileSync(applyRecordPath, "utf8"));
    const targetPath = selectedPath || applyRecord.selected_article_path;

    if (!targetPath || applyRecord.selected_article_path !== targetPath) return false;

    const fullArticlePath = path.join(root, targetPath);
    if (!fs.existsSync(fullArticlePath)) return false;

    const html = fs.readFileSync(fullArticlePath, "utf8");
    const hashToCheck = currentHash || sha256(html);

    return (
      applyRecord.status === "figure_diagram_inserted_audited_closed" &&
      applyRecord.post_insertion_hash === hashToCheck &&
      html.includes(applyRecord.insertion_marker_start) &&
      html.includes(applyRecord.insertion_marker_end) &&
      html.includes(applyRecord.asset_src_in_article) &&
      html.includes(applyRecord.diagram_title) &&
      html.includes(applyRecord.visible_credit)
    );
  } catch {
    return false;
  }
}

function ag11cControlledInfographicInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
  if (ag11dControlledFigureDiagramInsertionAllowsPostMutation(...arguments)) return true;
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag11c-infographic-controlled-cycle-apply.json");

  if (!fs.existsSync(applyRecordPath)) return false;

  try {
    const applyRecord = JSON.parse(fs.readFileSync(applyRecordPath, "utf8"));
    const targetPath = selectedPath || applyRecord.selected_article_path;

    if (!targetPath || applyRecord.selected_article_path !== targetPath) return false;

    const fullArticlePath = path.join(root, targetPath);
    if (!fs.existsSync(fullArticlePath)) return false;

    const html = fs.readFileSync(fullArticlePath, "utf8");
    const hashToCheck = currentHash || sha256(html);

    return (
      applyRecord.status === "infographic_inserted_audited_closed" &&
      applyRecord.post_insertion_hash === hashToCheck &&
      html.includes(applyRecord.insertion_marker_start) &&
      html.includes(applyRecord.insertion_marker_end) &&
      html.includes(applyRecord.asset_src_in_article) &&
      html.includes(applyRecord.infographic_title) &&
      html.includes(applyRecord.visible_credit)
    );
  } catch {
    return false;
  }
}

function ag11bControlledChartInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
  if (ag11cControlledInfographicInsertionAllowsPostMutation(...arguments)) return true;
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag11b-chart-bi-graph-controlled-cycle-apply.json");

  if (!fs.existsSync(applyRecordPath)) return false;

  try {
    const applyRecord = JSON.parse(fs.readFileSync(applyRecordPath, "utf8"));
    const targetPath = selectedPath || applyRecord.selected_article_path;

    if (!targetPath || applyRecord.selected_article_path !== targetPath) return false;

    const fullArticlePath = path.join(root, targetPath);
    if (!fs.existsSync(fullArticlePath)) return false;

    const html = fs.readFileSync(fullArticlePath, "utf8");
    const hashToCheck = currentHash || sha256(html);

    return (
      applyRecord.status === "chart_bi_graph_inserted_audited_closed" &&
      applyRecord.post_insertion_hash === hashToCheck &&
      html.includes(applyRecord.insertion_marker_start) &&
      html.includes(applyRecord.insertion_marker_end) &&
      html.includes(applyRecord.asset_src_in_article) &&
      html.includes(applyRecord.chart_title) &&
      html.includes(applyRecord.visible_credit)
    );
  } catch {
    return false;
  }
}

function ag10kControlledGeneratedImageInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
  if (ag11bControlledChartInsertionAllowsPostMutation(...arguments)) return true;
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag10k-controlled-generated-image-insertion-apply.json");

  if (!fs.existsSync(applyRecordPath)) return false;

  try {
    const applyRecord = JSON.parse(fs.readFileSync(applyRecordPath, "utf8"));
    const targetPath = selectedPath || applyRecord.selected_article_path;

    if (!targetPath || applyRecord.selected_article_path !== targetPath) return false;

    const fullArticlePath = path.join(root, targetPath);
    if (!fs.existsSync(fullArticlePath)) return false;

    const html = fs.readFileSync(fullArticlePath, "utf8");
    const hashToCheck = currentHash || sha256(html);

    return (
      applyRecord.status === "generated_image_inserted_pending_post_insertion_audit" &&
      applyRecord.post_insertion_hash === hashToCheck &&
      html.includes(applyRecord.insertion_marker_start) &&
      html.includes(applyRecord.insertion_marker_end) &&
      html.includes(applyRecord.asset_src_in_article) &&
      html.includes(applyRecord.visible_credit)
    );
  } catch {
    return false;
  }
}

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag10g-map-geographic-object-pipeline-planning.json",
  "data/content-intelligence/mutation-plans/ag10g-map-geographic-object-pipeline-planning.json",
  "data/content-intelligence/quality-registry/ag10g-new-aspect-inclusion-gate.json",
  "data/content-intelligence/quality-registry/ag10g-map-geographic-object-pipeline-readiness.json",
  "data/content-intelligence/mutation-plans/ag10g-to-ag10h-generated-image-editorial-visual-pipeline-planning-boundary.json",
  "data/content-intelligence/object-registry/ag10b-normalized-object-taxonomy.json",
  "data/content-intelligence/object-registry/ag10b-object-selection-scoring-doctrine.json",
  "data/content-intelligence/object-registry/ag10b-object-eligibility-rules.json",
  "data/content-intelligence/object-registry/ag10a-theme-color-layout-doctrine.json",
  "data/content-intelligence/object-registry/ag10a-ownership-rights-credit-doctrine.json",
  "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json",

  "data/content-intelligence/quality-reviews/ag10h-generated-image-editorial-visual-pipeline-planning.json",
  "data/content-intelligence/mutation-plans/ag10h-generated-image-editorial-visual-pipeline-planning.json",
  "data/content-intelligence/quality-registry/ag10h-image-generation-gate-readiness.json",
  "data/content-intelligence/object-registry/ag10h-generated-image-editorial-visual-family-registry.json",
  "data/content-intelligence/object-registry/ag10h-image-prompt-concept-schema.json",
  "data/content-intelligence/object-registry/ag10h-reusable-image-concept-render-instance-doctrine.json",
  "data/content-intelligence/object-registry/ag10h-image-theme-credit-mobile-doctrine.json",
  "data/content-intelligence/quality-registry/ag10h-generated-image-editorial-visual-pipeline-readiness.json",
  "data/content-intelligence/mutation-plans/ag10h-to-ag10i-generated-image-candidate-selection-prompt-finalisation-boundary.json",
  "data/content-intelligence/schema/generated-image-editorial-visual-pipeline-planning.schema.json",
  "data/content-intelligence/learning/ag10h-generated-image-editorial-visual-pipeline-planning-learning.json",
  "data/quality/ag10h-generated-image-editorial-visual-pipeline-planning.json",
  "data/quality/ag10h-generated-image-editorial-visual-pipeline-planning-preview.json",
  "docs/quality/AG10H_GENERATED_IMAGE_EDITORIAL_VISUAL_PIPELINE_PLANNING.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG10H validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag10gReview = readJson("data/content-intelligence/quality-reviews/ag10g-map-geographic-object-pipeline-planning.json");
const ag10gReadiness = readJson("data/content-intelligence/quality-registry/ag10g-map-geographic-object-pipeline-readiness.json");
const ag10gBoundary = readJson("data/content-intelligence/mutation-plans/ag10g-to-ag10h-generated-image-editorial-visual-pipeline-planning-boundary.json");
const ag09cApply = readJson("data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json");

const review = readJson("data/content-intelligence/quality-reviews/ag10h-generated-image-editorial-visual-pipeline-planning.json");
const plan = readJson("data/content-intelligence/mutation-plans/ag10h-generated-image-editorial-visual-pipeline-planning.json");
const gateReadiness = readJson("data/content-intelligence/quality-registry/ag10h-image-generation-gate-readiness.json");
const familyRegistry = readJson("data/content-intelligence/object-registry/ag10h-generated-image-editorial-visual-family-registry.json");
const promptSchema = readJson("data/content-intelligence/object-registry/ag10h-image-prompt-concept-schema.json");
const templateDoctrine = readJson("data/content-intelligence/object-registry/ag10h-reusable-image-concept-render-instance-doctrine.json");
const visualDoctrine = readJson("data/content-intelligence/object-registry/ag10h-image-theme-credit-mobile-doctrine.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag10h-generated-image-editorial-visual-pipeline-readiness.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag10h-to-ag10i-generated-image-candidate-selection-prompt-finalisation-boundary.json");
const schema = readJson("data/content-intelligence/schema/generated-image-editorial-visual-pipeline-planning.schema.json");
const learning = readJson("data/content-intelligence/learning/ag10h-generated-image-editorial-visual-pipeline-planning-learning.json");
const registry = readJson("data/quality/ag10h-generated-image-editorial-visual-pipeline-planning.json");
const preview = readJson("data/quality/ag10h-generated-image-editorial-visual-pipeline-planning-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG10H_GENERATED_IMAGE_EDITORIAL_VISUAL_PIPELINE_PLANNING.md"), "utf8");

for (const obj of [review, plan, gateReadiness, familyRegistry, promptSchema, templateDoctrine, visualDoctrine, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG10H") fail(`module_id must be AG10H in ${obj.title || "object"}`);
}

if (ag10gReview.status !== "map_geographic_object_pipeline_planning_created_not_executed") fail("AG10G review status mismatch");
if (ag10gReadiness.ready_for_ag10h !== true) fail("AG10G readiness for AG10H missing");
if (ag10gBoundary.next_stage_id !== "AG10H") fail("AG10H boundary missing in AG10G");

const target = ag09cApply.selected_article_path;
if (!fs.existsSync(path.join(root, target))) fail(`Selected article missing: ${target}`);

const currentHash = sha256(fs.readFileSync(path.join(root, target), "utf8"));
if (currentHash !== ag09cApply.post_correction_hash) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("Selected article hash must match AG09C post-correction hash or AG10K controlled generated-image post-insertion record explains the later approved article state or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state");

if (review.status !== "generated_image_editorial_visual_pipeline_planning_created_not_executed") fail("Review status mismatch");
if (plan.status !== "generated_image_editorial_visual_pipeline_planning_created_not_executed") fail("Plan status mismatch");
if (registry.status !== "generated_image_editorial_visual_pipeline_planning_created_not_executed") fail("Registry status mismatch");
if (preview.status !== "generated_image_editorial_visual_pipeline_planning_created_not_executed") fail("Preview status mismatch");

if (gateReadiness.status !== "image_generation_gate_readiness_created_not_applied") fail("Gate readiness status mismatch");
if (!Array.isArray(gateReadiness.gate_questions_carried_forward) || gateReadiness.gate_questions_carried_forward.length !== 5) {
  fail("Image generation gate must carry forward five questions");
}

for (const question of [
  "Will this improve what a visitor sees?",
  "Will this make articles more trustworthy?",
  "Will this make Drishvara memorable?",
  "Will this reduce future cost?",
  "Will this create reusable intelligence?"
]) {
  if (!gateReadiness.gate_questions_carried_forward.some((item) => item.question === question)) {
    fail(`Missing carried-forward gate question: ${question}`);
  }
}

if (gateReadiness.ag10h_gate_assessment.generated_image_editorial_visual_pipeline_planning.inclusion_decision !== "allowed_for_planning_only") {
  fail("AG10H gate assessment must be planning-only allowed");
}

if (familyRegistry.status !== "generated_image_editorial_visual_family_registry_created_not_applied") fail("Family registry status mismatch");
if (!Array.isArray(familyRegistry.image_families) || familyRegistry.image_families.length !== 6) fail("Image family count mismatch");
if (familyRegistry.source_image_object_count < 10) fail("Source image object count appears incomplete");

const allTypes = familyRegistry.image_families.flatMap((item) => item.image_types || []);
for (const item of [
  "hero_image",
  "data_backed_visual_cover",
  "single_image_editorial_visual",
  "section_support_image",
  "editorial_illustration",
  "conceptual_illustration",
  "stylized_generated_image",
  "photo_style_generated_image",
  "annotated_image",
  "quote_image_hybrid",
  "multi_panel_editorial_visual"
]) {
  if (!allTypes.includes(item)) fail(`Missing generated/editorial image type: ${item}`);
}

for (const field of [
  "image_type",
  "article_id",
  "concept_template_id",
  "prompt_or_concept_record",
  "generation_method",
  "rights_controller",
  "ownership_status",
  "credit_display",
  "caption",
  "alt_text",
  "mobile_fallback_text",
  "reuse_eligibility_status"
]) {
  if (!familyRegistry.universal_image_schema.required_metadata.includes(field)) {
    fail(`Missing universal image metadata field: ${field}`);
  }
}

for (const field of [
  "editorial_purpose",
  "core_message",
  "visual_metaphor_or_scene",
  "composition_guidance",
  "style_constraints",
  "negative_constraints",
  "source_reference_policy",
  "cost_control_note"
]) {
  if (!familyRegistry.universal_image_schema.required_concept_fields.includes(field)) {
    fail(`Missing universal image concept field: ${field}`);
  }
}

if (promptSchema.status !== "image_prompt_concept_schema_created_not_applied") fail("Prompt/concept schema status mismatch");
if (!Array.isArray(promptSchema.schema_components) || promptSchema.schema_components.length !== 8) fail("Prompt/concept schema component count mismatch");

for (const componentType of [
  "concept_record",
  "prompt_record",
  "source_reference_record",
  "rights_provenance_record",
  "safety_risk_record",
  "rendered_visual_record",
  "accessibility_record",
  "reuse_record"
]) {
  if (!promptSchema.schema_components.some((item) => item.component_type === componentType)) {
    fail(`Missing prompt/concept schema component type: ${componentType}`);
  }
}

if (!promptSchema.validation_rules.some((rule) => rule.includes("New Aspect Inclusion Gate"))) fail("Inclusion gate validation rule missing");
if (!promptSchema.validation_rules.some((rule) => rule.includes("No prompt is finalised"))) fail("Prompt finalisation block rule missing");

if (templateDoctrine.status !== "reusable_image_concept_template_doctrine_created_not_applied") fail("Template doctrine status mismatch");

for (const step of [
  "image_concept_template",
  "prompt_or_concept_binding",
  "rendered_visual_instance",
  "article_placement",
  "post_insertion_layout_audit",
  "reuse_log"
]) {
  if (!templateDoctrine.pipeline_model.includes(step)) fail(`Missing image concept pipeline step: ${step}`);
}

for (const field of [
  "concept_template_id",
  "image_family",
  "image_type",
  "theme_variant",
  "prompt_schema_required",
  "rights_controller",
  "ownership_status",
  "template_hash"
]) {
  if (!templateDoctrine.image_concept_template_fields.includes(field)) fail(`Missing image concept template field: ${field}`);
}

for (const field of [
  "rendered_visual_id",
  "concept_template_id",
  "article_id",
  "prompt_record_id",
  "generation_method",
  "asset_path",
  "asset_hash",
  "caption",
  "credit",
  "alt_text",
  "rendered_hash"
]) {
  if (!templateDoctrine.rendered_visual_fields.includes(field)) fail(`Missing rendered visual field: ${field}`);
}

if (visualDoctrine.status !== "image_theme_credit_mobile_doctrine_created_not_applied") fail("Visual doctrine status mismatch");

for (const credit of [
  "Visual: Drishvara.",
  "Generated visual: Drishvara.",
  "Illustration: Drishvara.",
  "Source/reference: [source]. Visual: Drishvara."
]) {
  if (!visualDoctrine.credit_rules.some((item) => item.credit === credit)) fail(`Missing image credit rule: ${credit}`);
}

if (!visualDoctrine.ownership_rules.some((item) => item.includes("Drishvara-owned/controlled"))) fail("Drishvara ownership rule missing");
if (!visualDoctrine.mobile_rules.some((item) => item.includes("No uncontrolled horizontal overflow"))) fail("Mobile overflow rule missing");
if (!visualDoctrine.placement_rules.some((item) => item.includes("must not deform article shape"))) fail("Article-shape placement rule missing");
if (!visualDoctrine.cost_rules.some((item) => item.includes("Do not generate a new image"))) fail("Cost-control no-new-generation rule missing");
if (!visualDoctrine.accessibility_rules.some((item) => item.includes("Alt text"))) fail("Alt text accessibility rule missing");

if (readiness.status !== "generated_image_editorial_visual_pipeline_planning_ready_pending_explicit_ag10i") fail("Readiness status mismatch");
if (readiness.ready_for_ag10i !== true) fail("AG10I readiness missing");
if (readiness.image_generation_ready !== false) fail("Image generation readiness must remain false");
if (readiness.external_image_api_call_ready !== false) fail("External image API readiness must remain false");
if (readiness.image_asset_creation_ready !== false) fail("Image asset creation readiness must remain false");
if (readiness.prompt_finalisation_ready !== false) fail("Prompt finalisation readiness must remain false");
if (readiness.object_insertion_ready !== false) fail("Object insertion readiness must remain false");

if (boundary.status !== "ag10i_boundary_created_not_started") fail("AG10I boundary status mismatch");
if (boundary.next_stage_id !== "AG10I") fail("AG10I handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG10I must require explicit approval");

if (schema.status !== "schema_generated_image_editorial_visual_pipeline_planning_only") fail("Schema status mismatch");

for (const key of [
  "image_generation_gate_readiness_allowed_in_ag10h",
  "image_family_registry_allowed_in_ag10h",
  "prompt_concept_schema_allowed_in_ag10h",
  "reusable_image_concept_doctrine_allowed_in_ag10h",
  "image_theme_credit_mobile_doctrine_allowed_in_ag10h",
  "ag10i_boundary_allowed_in_ag10h"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_mutation_allowed_in_ag10h",
  "homepage_mutation_allowed_in_ag10h",
  "css_js_mutation_allowed_in_ag10h",
  "image_generation_allowed_in_ag10h",
  "external_image_api_call_allowed_in_ag10h",
  "image_asset_creation_allowed_in_ag10h",
  "rendered_image_creation_allowed_in_ag10h",
  "visual_generation_allowed_in_ag10h",
  "prompt_finalisation_allowed_in_ag10h",
  "candidate_image_selection_allowed_in_ag10h",
  "image_concept_template_creation_allowed_in_ag10h",
  "object_insertion_allowed_in_ag10h",
  "chart_generation_allowed_in_ag10h",
  "infographic_generation_allowed_in_ag10h",
  "table_generation_allowed_in_ag10h",
  "figure_generation_allowed_in_ag10h",
  "diagram_generation_allowed_in_ag10h",
  "map_generation_allowed_in_ag10h",
  "data_fetch_allowed_in_ag10h",
  "dataset_creation_allowed_in_ag10h",
  "live_url_fetch_allowed_in_ag10h",
  "deployment_trigger_allowed_in_ag10h",
  "production_jsonl_append_allowed_in_ag10h",
  "database_write_allowed_in_ag10h",
  "supabase_write_allowed_in_ag10h",
  "backend_auth_supabase_activation_allowed_in_ag10h",
  "public_publishing_operation_allowed_in_ag10h"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, plan, gateReadiness, familyRegistry, promptSchema, templateDoctrine, visualDoctrine, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.generated_image_editorial_visual_pipeline_planning_only !== true) fail(`${obj.title || "object"} must be planning-only`);
  if (obj.article_mutation_performed_in_ag10h !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.image_generation_performed_in_ag10h !== false) fail(`${obj.title || "object"} must not generate image`);
  if (obj.external_image_api_call_performed_in_ag10h !== false) fail(`${obj.title || "object"} must not call image API`);
  if (obj.image_asset_creation_performed_in_ag10h !== false) fail(`${obj.title || "object"} must not create image asset`);
  if (obj.rendered_image_creation_performed_in_ag10h !== false) fail(`${obj.title || "object"} must not create rendered image`);
  if (obj.prompt_finalisation_performed_in_ag10h !== false) fail(`${obj.title || "object"} must not finalise prompt`);
  if (obj.candidate_image_selection_performed_in_ag10h !== false) fail(`${obj.title || "object"} must not select candidate image`);
  if (obj.object_insertion_performed_in_ag10h !== false) fail(`${obj.title || "object"} must not insert object`);
  if (obj.database_write_performed_in_ag10h !== false) fail(`${obj.title || "object"} must not write database`);
  if (obj.supabase_write_performed_in_ag10h !== false) fail(`${obj.title || "object"} must not write Supabase`);
  if (obj.backend_auth_supabase_activation_performed_in_ag10h !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_operation_performed_in_ag10h !== false) fail(`${obj.title || "object"} must not publish`);
}

if (review.closure_decision.decision !== "ag10h_generated_image_editorial_visual_planning_created_pending_explicit_ag10i") fail("Closure decision mismatch");
if (review.closure_decision.proceed_to_ag10i_only_with_explicit_user_approval !== true) fail("AG10I must require explicit approval");

for (const scriptName of ["generate:ag10h", "validate:ag10h"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag10h")) {
  fail("validate:project must include validate:ag10h");
}

for (const phrase of ["Purpose", "New Aspect Inclusion Gate", "Image Families", "Prompt and Concept Schema", "Template and Rendered Instance Model", "Credit Logic", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG10H document missing phrase: ${phrase}`);
}

pass("AG10H registry is present.");
pass("AG10H document is present.");
pass("AG10H review, plan, gate readiness, family registry, prompt/concept schema, reusable image concept doctrine, visual doctrine, readiness, AG10I boundary, schema, learning record and preview are present.");
pass("AG10G planning, inclusion gate and handoff are consumed.");
pass("Selected article hash remains stable.");
pass("New Aspect Inclusion Gate is carried forward for generated image/editorial visual pipeline.");
pass("Generated image and editorial visual family registry is created.");
pass("Image prompt/concept/source/rights/provenance schema is created.");
pass("Reusable image concept-template and rendered visual instance doctrine is created.");
pass("Image theme, ownership, source/credit, mobile, placement, accessibility and cost rules are created.");
pass("AG10I generated image candidate selection and prompt finalisation boundary is created with explicit approval required.");
pass("No image generation, external image API call, asset creation, prompt finalisation, object insertion, article mutation, backend activation or publishing operation is performed.");
pass("AG10H is Generated Image and Editorial Visual Pipeline Planning only.");
