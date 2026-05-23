import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();





function ag11dControlledFigureDiagramInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
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
  "data/content-intelligence/quality-reviews/ag10h-generated-image-editorial-visual-pipeline-planning.json",
  "data/content-intelligence/mutation-plans/ag10h-generated-image-editorial-visual-pipeline-planning.json",
  "data/content-intelligence/quality-registry/ag10h-image-generation-gate-readiness.json",
  "data/content-intelligence/object-registry/ag10h-generated-image-editorial-visual-family-registry.json",
  "data/content-intelligence/object-registry/ag10h-image-prompt-concept-schema.json",
  "data/content-intelligence/object-registry/ag10h-reusable-image-concept-render-instance-doctrine.json",
  "data/content-intelligence/object-registry/ag10h-image-theme-credit-mobile-doctrine.json",
  "data/content-intelligence/quality-registry/ag10h-generated-image-editorial-visual-pipeline-readiness.json",
  "data/content-intelligence/mutation-plans/ag10h-to-ag10i-generated-image-candidate-selection-prompt-finalisation-boundary.json",
  "data/content-intelligence/object-registry/ag10b-object-selection-scoring-doctrine.json",
  "data/content-intelligence/object-registry/ag10b-object-eligibility-rules.json",
  "data/content-intelligence/object-registry/ag10a-theme-color-layout-doctrine.json",
  "data/content-intelligence/object-registry/ag10a-ownership-rights-credit-doctrine.json",
  "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json",

  "data/content-intelligence/quality-reviews/ag10i-generated-image-candidate-selection-prompt-finalisation.json",
  "data/content-intelligence/mutation-plans/ag10i-generated-image-candidate-selection-prompt-finalisation.json",
  "data/content-intelligence/object-registry/ag10i-generated-image-candidate-selection-record.json",
  "data/content-intelligence/object-registry/ag10i-reusable-image-concept-candidate-record.json",
  "data/content-intelligence/object-registry/ag10i-finalised-prompt-concept-record.json",
  "data/content-intelligence/quality-registry/ag10i-rights-provenance-source-check-record.json",
  "data/content-intelligence/quality-registry/ag10i-cost-reuse-decision-record.json",
  "data/content-intelligence/quality-registry/ag10i-generated-image-candidate-readiness.json",
  "data/content-intelligence/mutation-plans/ag10i-to-ag10j-controlled-generated-image-asset-creation-source-finalisation-boundary.json",
  "data/content-intelligence/schema/generated-image-candidate-selection-prompt-finalisation.schema.json",
  "data/content-intelligence/learning/ag10i-generated-image-candidate-selection-prompt-finalisation-learning.json",
  "data/quality/ag10i-generated-image-candidate-selection-prompt-finalisation.json",
  "data/quality/ag10i-generated-image-candidate-selection-prompt-finalisation-preview.json",
  "docs/quality/AG10I_GENERATED_IMAGE_CANDIDATE_SELECTION_PROMPT_FINALISATION.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG10I validation failed: ${message}`);
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

const ag10hReview = readJson("data/content-intelligence/quality-reviews/ag10h-generated-image-editorial-visual-pipeline-planning.json");
const ag10hReadiness = readJson("data/content-intelligence/quality-registry/ag10h-generated-image-editorial-visual-pipeline-readiness.json");
const ag10hBoundary = readJson("data/content-intelligence/mutation-plans/ag10h-to-ag10i-generated-image-candidate-selection-prompt-finalisation-boundary.json");
const ag09cApply = readJson("data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json");

const review = readJson("data/content-intelligence/quality-reviews/ag10i-generated-image-candidate-selection-prompt-finalisation.json");
const plan = readJson("data/content-intelligence/mutation-plans/ag10i-generated-image-candidate-selection-prompt-finalisation.json");
const candidate = readJson("data/content-intelligence/object-registry/ag10i-generated-image-candidate-selection-record.json");
const concept = readJson("data/content-intelligence/object-registry/ag10i-reusable-image-concept-candidate-record.json");
const prompt = readJson("data/content-intelligence/object-registry/ag10i-finalised-prompt-concept-record.json");
const rights = readJson("data/content-intelligence/quality-registry/ag10i-rights-provenance-source-check-record.json");
const cost = readJson("data/content-intelligence/quality-registry/ag10i-cost-reuse-decision-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag10i-generated-image-candidate-readiness.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag10i-to-ag10j-controlled-generated-image-asset-creation-source-finalisation-boundary.json");
const schema = readJson("data/content-intelligence/schema/generated-image-candidate-selection-prompt-finalisation.schema.json");
const learning = readJson("data/content-intelligence/learning/ag10i-generated-image-candidate-selection-prompt-finalisation-learning.json");
const registry = readJson("data/quality/ag10i-generated-image-candidate-selection-prompt-finalisation.json");
const preview = readJson("data/quality/ag10i-generated-image-candidate-selection-prompt-finalisation-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG10I_GENERATED_IMAGE_CANDIDATE_SELECTION_PROMPT_FINALISATION.md"), "utf8");

for (const obj of [review, plan, candidate, concept, prompt, rights, cost, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG10I") fail(`module_id must be AG10I in ${obj.title || "object"}`);
}

if (ag10hReview.status !== "generated_image_editorial_visual_pipeline_planning_created_not_executed") fail("AG10H review status mismatch");
if (ag10hReadiness.ready_for_ag10i !== true) fail("AG10H readiness for AG10I missing");
if (ag10hBoundary.next_stage_id !== "AG10I") fail("AG10I boundary missing in AG10H");

const target = ag09cApply.selected_article_path;
if (!fs.existsSync(path.join(root, target))) fail(`Selected article missing: ${target}`);

const currentHash = sha256(fs.readFileSync(path.join(root, target), "utf8"));
if (currentHash !== ag09cApply.post_correction_hash) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) fail("Selected article hash must match AG09C post-correction hash or AG10K controlled generated-image post-insertion record explains the later approved article state or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state");

if (review.status !== "generated_image_candidate_prompt_finalised_not_generated") fail("Review status mismatch");
if (plan.status !== "generated_image_candidate_prompt_finalised_not_generated") fail("Plan status mismatch");
if (registry.status !== "generated_image_candidate_prompt_finalised_not_generated") fail("Registry status mismatch");
if (preview.status !== "generated_image_candidate_prompt_finalised_not_generated") fail("Preview status mismatch");

if (candidate.status !== "generated_image_candidate_selected_not_generated") fail("Candidate selection status mismatch");
if (candidate.candidate_id !== "AG10I-IMG-CAND-001") fail("Candidate ID mismatch");
if (candidate.selected_image_type !== "section_support_image") fail("Selected image type mismatch");
if (candidate.secondary_image_type !== "editorial_illustration") fail("Secondary image type mismatch");
if (candidate.five_gate_assessment.inclusion_decision !== "approved_for_candidate_record_only") fail("Five-gate decision mismatch");
if (candidate.object_selection_score.score_total < 80) fail("Object selection score must be strong candidate band");

const scoreTotal = candidate.object_selection_score.dimensions.reduce((sum, item) => sum + item.score_awarded, 0);
if (scoreTotal !== candidate.object_selection_score.score_total) fail("Candidate score dimension sum mismatch");

for (const gateKey of ["visitor_value", "trust_value", "memory_value", "cost_value", "intelligence_value"]) {
  if (!candidate.five_gate_assessment[gateKey]) fail(`Missing five-gate assessment key: ${gateKey}`);
}

if (concept.status !== "reusable_image_concept_candidate_created_not_rendered") fail("Concept candidate status mismatch");
if (concept.linked_candidate_id !== candidate.candidate_id) fail("Concept linked candidate mismatch");
if (!concept.reuse_logic.template_reuse_allowed) fail("Concept template reuse must be allowed");
if (!concept.layout_guidance.caption_required || !concept.layout_guidance.visible_credit_required || !concept.layout_guidance.mobile_fallback_required) {
  fail("Concept layout guidance must require caption, credit and mobile fallback");
}

if (prompt.status !== "prompt_concept_finalised_for_future_controlled_generation_not_executed") fail("Prompt status mismatch");
if (prompt.linked_candidate_id !== candidate.candidate_id) fail("Prompt linked candidate mismatch");
if (prompt.prompt_finalised_for_future_stage !== true) fail("Prompt must be finalised for future stage");
if (prompt.generation_allowed_in_ag10i !== false) fail("Prompt record must block generation in AG10I");
if (prompt.external_image_api_call_allowed_in_ag10i !== false) fail("Prompt record must block external image API in AG10I");
if (!prompt.finalised_prompt_text.includes("no real logos")) fail("Prompt must include no real logos constraint");
if (!prompt.negative_constraints.includes("No identifiable real person.")) fail("Negative constraints must block identifiable real person");
if (prompt.visible_credit_candidate !== "Visual: Drishvara.") fail("Visible credit candidate mismatch");

if (rights.status !== "rights_provenance_source_check_prepared_not_generated") fail("Rights check status mismatch");
if (rights.linked_candidate_id !== candidate.candidate_id) fail("Rights check linked candidate mismatch");
if (rights.source_reference_status !== "no_external_reference_used_in_ag10i") fail("Source reference status mismatch");
if (rights.ag10j_rights_clearance_required_before_asset_creation !== true) fail("AG10J rights clearance requirement missing");
for (const riskKey of ["brand_logo_risk", "government_logo_risk", "real_dashboard_risk", "living_artist_style_risk", "misleading_real_world_evidence_risk"]) {
  if (rights.risk_checks[riskKey] !== "blocked") fail(`Risk check must be blocked: ${riskKey}`);
}

if (cost.status !== "cost_reuse_decision_prepared_not_generated") fail("Cost/reuse status mismatch");
if (cost.linked_candidate_id !== candidate.candidate_id) fail("Cost/reuse linked candidate mismatch");
if (cost.cost_decision.prefer_existing_asset_before_generation !== true) fail("Cost rule must prefer existing asset first");
if (cost.cost_decision.prefer_internal_svg_or_simple_editorial_workflow_before_external_generation !== true) {
  fail("Cost rule must prefer internal/simple workflow before external generation");
}
if (cost.ag10j_cost_gate_required_before_generation !== true) fail("AG10J cost gate requirement missing");

if (readiness.status !== "generated_image_candidate_ready_pending_explicit_ag10j") fail("Readiness status mismatch");
if (readiness.ready_for_ag10j !== true) fail("AG10J readiness missing");
if (readiness.candidate_selection_record_created !== true) fail("Candidate selection readiness missing");
if (readiness.prompt_concept_record_finalised !== true) fail("Prompt finalisation readiness missing");
if (readiness.image_generation_ready !== false) fail("Image generation readiness must remain false");
if (readiness.external_image_api_call_ready !== false) fail("External image API readiness must remain false");
if (readiness.image_asset_creation_ready !== false) fail("Image asset readiness must remain false");
if (readiness.object_insertion_ready !== false) fail("Object insertion readiness must remain false");

if (boundary.status !== "ag10j_boundary_created_not_started") fail("AG10J boundary status mismatch");
if (boundary.next_stage_id !== "AG10J") fail("AG10J handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG10J must require explicit approval");

if (schema.status !== "schema_generated_image_candidate_selection_prompt_finalisation_only") fail("Schema status mismatch");

for (const key of [
  "candidate_selection_allowed_in_ag10i",
  "reusable_concept_candidate_allowed_in_ag10i",
  "prompt_concept_finalisation_allowed_in_ag10i",
  "rights_provenance_source_check_allowed_in_ag10i",
  "cost_reuse_decision_allowed_in_ag10i",
  "ag10j_boundary_allowed_in_ag10i"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "image_generation_allowed_in_ag10i",
  "external_image_api_call_allowed_in_ag10i",
  "image_asset_creation_allowed_in_ag10i",
  "rendered_image_creation_allowed_in_ag10i",
  "visual_generation_allowed_in_ag10i",
  "object_insertion_allowed_in_ag10i",
  "article_mutation_allowed_in_ag10i",
  "homepage_mutation_allowed_in_ag10i",
  "css_js_mutation_allowed_in_ag10i",
  "reference_insertion_allowed_in_ag10i",
  "chart_generation_allowed_in_ag10i",
  "infographic_generation_allowed_in_ag10i",
  "table_generation_allowed_in_ag10i",
  "figure_generation_allowed_in_ag10i",
  "diagram_generation_allowed_in_ag10i",
  "map_generation_allowed_in_ag10i",
  "data_fetch_allowed_in_ag10i",
  "dataset_creation_allowed_in_ag10i",
  "live_url_fetch_allowed_in_ag10i",
  "deployment_trigger_allowed_in_ag10i",
  "production_jsonl_append_allowed_in_ag10i",
  "database_write_allowed_in_ag10i",
  "supabase_write_allowed_in_ag10i",
  "backend_auth_supabase_activation_allowed_in_ag10i",
  "public_publishing_operation_allowed_in_ag10i"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, plan, candidate, concept, prompt, rights, cost, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.generated_image_candidate_selection_prompt_finalisation_only !== true) fail(`${obj.title || "object"} must be AG10I-only`);
  if (obj.image_generation_performed_in_ag10i !== false) fail(`${obj.title || "object"} must not generate image`);
  if (obj.external_image_api_call_performed_in_ag10i !== false) fail(`${obj.title || "object"} must not call external image API`);
  if (obj.image_asset_creation_performed_in_ag10i !== false) fail(`${obj.title || "object"} must not create image asset`);
  if (obj.rendered_image_creation_performed_in_ag10i !== false) fail(`${obj.title || "object"} must not create rendered image`);
  if (obj.object_insertion_performed_in_ag10i !== false) fail(`${obj.title || "object"} must not insert object`);
  if (obj.article_mutation_performed_in_ag10i !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.css_mutation_performed_in_ag10i !== false) fail(`${obj.title || "object"} must not mutate CSS`);
  if (obj.js_mutation_performed_in_ag10i !== false) fail(`${obj.title || "object"} must not mutate JS`);
  if (obj.database_write_performed_in_ag10i !== false) fail(`${obj.title || "object"} must not write database`);
  if (obj.supabase_write_performed_in_ag10i !== false) fail(`${obj.title || "object"} must not write Supabase`);
  if (obj.backend_auth_supabase_activation_performed_in_ag10i !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_operation_performed_in_ag10i !== false) fail(`${obj.title || "object"} must not publish`);
}

if (review.closure_decision.decision !== "ag10i_candidate_prompt_finalised_pending_explicit_ag10j") fail("Closure decision mismatch");
if (review.closure_decision.proceed_to_ag10j_only_with_explicit_user_approval !== true) fail("AG10J must require explicit approval");

for (const scriptName of ["generate:ag10i", "validate:ag10i"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag10i")) {
  fail("validate:project must include validate:ag10i");
}

for (const phrase of ["Purpose", "Selected Candidate", "New Aspect Inclusion Gate", "Prompt / Concept Record", "Rights, Provenance and Cost", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG10I document missing phrase: ${phrase}`);
}

pass("AG10I registry is present.");
pass("AG10I document is present.");
pass("AG10I review, plan, candidate selection, reusable concept candidate, prompt record, rights/provenance check, cost/reuse decision, readiness, AG10J boundary, schema, learning record and preview are present.");
pass("AG10H planning and handoff are consumed.");
pass("Selected article hash remains stable.");
pass("Generated image/editorial visual candidate is selected.");
pass("Five-question New Aspect Inclusion Gate is applied to the candidate.");
pass("Reusable image concept candidate is recorded.");
pass("Prompt/concept record is finalised for future controlled generation only.");
pass("Rights/provenance/source and cost/reuse checks are prepared.");
pass("AG10J controlled generated image asset creation/source finalisation boundary is created with explicit approval required.");
pass("No image generation, external image API call, image asset creation, rendered image creation, object insertion, article mutation, backend activation or publishing operation is performed.");
pass("AG10I is Generated Image Candidate Selection and Prompt Finalisation only.");
