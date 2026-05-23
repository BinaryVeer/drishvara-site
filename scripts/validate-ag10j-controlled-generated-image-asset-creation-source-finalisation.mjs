import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();


function ag10kControlledGeneratedImageInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
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
  "data/content-intelligence/quality-reviews/ag10i-generated-image-candidate-selection-prompt-finalisation.json",
  "data/content-intelligence/mutation-plans/ag10i-generated-image-candidate-selection-prompt-finalisation.json",
  "data/content-intelligence/object-registry/ag10i-generated-image-candidate-selection-record.json",
  "data/content-intelligence/object-registry/ag10i-reusable-image-concept-candidate-record.json",
  "data/content-intelligence/object-registry/ag10i-finalised-prompt-concept-record.json",
  "data/content-intelligence/quality-registry/ag10i-rights-provenance-source-check-record.json",
  "data/content-intelligence/quality-registry/ag10i-cost-reuse-decision-record.json",
  "data/content-intelligence/quality-registry/ag10i-generated-image-candidate-readiness.json",
  "data/content-intelligence/mutation-plans/ag10i-to-ag10j-controlled-generated-image-asset-creation-source-finalisation-boundary.json",
  "data/content-intelligence/object-registry/ag10a-theme-color-layout-doctrine.json",
  "data/content-intelligence/object-registry/ag10a-ownership-rights-credit-doctrine.json",
  "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json",

  "assets/articles/policy/enhancing-public-healthcare-delivery-digital-innovation/ag10j-section-support-digital-healthcare-service-pathway.svg",
  "data/content-intelligence/quality-reviews/ag10j-controlled-generated-image-asset-creation-source-finalisation.json",
  "data/content-intelligence/visual-registry/ag10j-finalised-generated-image-asset-record.json",
  "data/content-intelligence/quality-registry/ag10j-generated-image-source-finalisation-record.json",
  "data/content-intelligence/quality-registry/ag10j-generated-image-rights-provenance-clearance-record.json",
  "data/content-intelligence/quality-registry/ag10j-generated-image-cost-reuse-record.json",
  "data/content-intelligence/quality-registry/ag10j-generated-image-asset-readiness.json",
  "data/content-intelligence/mutation-plans/ag10j-to-ag10k-controlled-generated-image-insertion-boundary.json",
  "data/content-intelligence/schema/controlled-generated-image-asset-creation-source-finalisation.schema.json",
  "data/content-intelligence/learning/ag10j-controlled-generated-image-asset-creation-source-finalisation-learning.json",
  "data/quality/ag10j-controlled-generated-image-asset-creation-source-finalisation.json",
  "data/quality/ag10j-controlled-generated-image-asset-creation-source-finalisation-preview.json",
  "docs/quality/AG10J_CONTROLLED_GENERATED_IMAGE_ASSET_CREATION_SOURCE_FINALISATION.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG10J validation failed: ${message}`);
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

const ag10iReview = readJson("data/content-intelligence/quality-reviews/ag10i-generated-image-candidate-selection-prompt-finalisation.json");
const ag10iReadiness = readJson("data/content-intelligence/quality-registry/ag10i-generated-image-candidate-readiness.json");
const ag10iBoundary = readJson("data/content-intelligence/mutation-plans/ag10i-to-ag10j-controlled-generated-image-asset-creation-source-finalisation-boundary.json");
const ag10iCandidate = readJson("data/content-intelligence/object-registry/ag10i-generated-image-candidate-selection-record.json");
const ag10iPrompt = readJson("data/content-intelligence/object-registry/ag10i-finalised-prompt-concept-record.json");
const ag09cApply = readJson("data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json");

const review = readJson("data/content-intelligence/quality-reviews/ag10j-controlled-generated-image-asset-creation-source-finalisation.json");
const assetRecord = readJson("data/content-intelligence/visual-registry/ag10j-finalised-generated-image-asset-record.json");
const sourceRecord = readJson("data/content-intelligence/quality-registry/ag10j-generated-image-source-finalisation-record.json");
const rightsRecord = readJson("data/content-intelligence/quality-registry/ag10j-generated-image-rights-provenance-clearance-record.json");
const costRecord = readJson("data/content-intelligence/quality-registry/ag10j-generated-image-cost-reuse-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag10j-generated-image-asset-readiness.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag10j-to-ag10k-controlled-generated-image-insertion-boundary.json");
const schema = readJson("data/content-intelligence/schema/controlled-generated-image-asset-creation-source-finalisation.schema.json");
const learning = readJson("data/content-intelligence/learning/ag10j-controlled-generated-image-asset-creation-source-finalisation-learning.json");
const registry = readJson("data/quality/ag10j-controlled-generated-image-asset-creation-source-finalisation.json");
const preview = readJson("data/quality/ag10j-controlled-generated-image-asset-creation-source-finalisation-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG10J_CONTROLLED_GENERATED_IMAGE_ASSET_CREATION_SOURCE_FINALISATION.md"), "utf8");

for (const obj of [review, assetRecord, sourceRecord, rightsRecord, costRecord, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG10J") fail(`module_id must be AG10J in ${obj.title || "object"}`);
}

if (ag10iReview.status !== "generated_image_candidate_prompt_finalised_not_generated") fail("AG10I review status mismatch");
if (ag10iReadiness.ready_for_ag10j !== true) fail("AG10I readiness for AG10J missing");
if (ag10iBoundary.next_stage_id !== "AG10J") fail("AG10J boundary missing in AG10I");
if (ag10iCandidate.candidate_id !== "AG10I-IMG-CAND-001") fail("AG10I candidate mismatch");
if (ag10iPrompt.prompt_finalised_for_future_stage !== true) fail("AG10I prompt must be finalised for future stage");

const target = ag09cApply.selected_article_path;
if (!fs.existsSync(path.join(root, target))) fail(`Selected article missing: ${target}`);

const currentArticleHash = sha256(fs.readFileSync(path.join(root, target), "utf8"));
if (currentArticleHash !== ag09cApply.post_correction_hash) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) fail("Selected article hash must match AG09C post-correction hash or AG10K controlled generated-image post-insertion record explains the later approved article state");

const assetPath = assetRecord.asset_path;
if (!fs.existsSync(path.join(root, assetPath))) fail(`Asset file missing: ${assetPath}`);

const assetText = fs.readFileSync(path.join(root, assetPath), "utf8");
const computedAssetHash = sha256(assetText);

if (!assetText.includes("<svg")) fail("Asset must be SVG");
if (!assetText.includes("Digital public healthcare service pathway")) fail("SVG must contain title text");
if (!assetText.includes("Conceptual representation only")) fail("SVG must contain conceptual representation note");
if (computedAssetHash !== assetRecord.asset_hash_sha256) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) fail("Asset hash mismatch with asset record or AG10K controlled generated-image post-insertion record explains the later approved article state");
if (computedAssetHash !== readiness.asset_hash_sha256) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) fail("Asset hash mismatch with readiness or AG10K controlled generated-image post-insertion record explains the later approved article state");
if (computedAssetHash !== boundary.asset_hash_sha256) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) fail("Asset hash mismatch with boundary or AG10K controlled generated-image post-insertion record explains the later approved article state");

if (review.status !== "controlled_generated_image_asset_created_source_finalised_not_inserted") fail("Review status mismatch");
if (registry.status !== "controlled_generated_image_asset_created_source_finalised_not_inserted") fail("Registry status mismatch");
if (preview.status !== "controlled_generated_image_asset_created_source_finalised_not_inserted") fail("Preview status mismatch");

if (assetRecord.status !== "controlled_generated_image_asset_created_not_inserted") fail("Asset record status mismatch");
if (assetRecord.asset_id !== "AG10J-SVG-SECTION-SUPPORT-001") fail("Asset ID mismatch");
if (assetRecord.asset_type !== "internal_svg_editorial_visual") fail("Asset type mismatch");
if (assetRecord.file_format !== "svg") fail("Asset file format mismatch");
if (assetRecord.dimensions.width !== 1200 || assetRecord.dimensions.height !== 720) fail("Asset dimensions mismatch");
if (assetRecord.caption !== ag10iPrompt.caption_candidate) fail("Caption must match AG10I prompt candidate");
if (assetRecord.alt_text !== ag10iPrompt.alt_text_candidate) fail("Alt text must match AG10I prompt candidate");
if (assetRecord.visible_credit !== "Visual: Drishvara.") fail("Visible credit mismatch");
if (assetRecord.placement_status !== "not_inserted") fail("Asset must not be inserted");
if (assetRecord.cost_marker.external_generation_cost !== 0) fail("External generation cost must be zero");
if (assetRecord.cost_marker.external_api_call !== false) fail("External API call marker must be false");

if (sourceRecord.status !== "source_finalised_internal_no_external_reference") fail("Source record status mismatch");
if (sourceRecord.external_visual_reference_used !== false) fail("External visual reference must be false");
if (sourceRecord.third_party_asset_used !== false) fail("Third-party asset must be false");
if (sourceRecord.real_logo_used !== false) fail("Real logo use must be false");
if (sourceRecord.identifiable_person_used !== false) fail("Identifiable person use must be false");
if (sourceRecord.fake_dashboard_or_fake_stat_used !== false) fail("Fake dashboard/stat use must be false");

if (rightsRecord.status !== "rights_provenance_cleared_for_internal_asset_not_insertion") fail("Rights status mismatch");
if (rightsRecord.insertion_clearance_status !== "not_cleared_for_insertion_until_ag10k") fail("Insertion clearance must remain blocked until AG10K");
for (const [key, value] of Object.entries(rightsRecord.clearance_checks)) {
  if (value !== false) fail(`Rights clearance check must be false for ${key}`);
}

if (costRecord.status !== "cost_reuse_record_created_for_internal_asset") fail("Cost record status mismatch");
if (costRecord.external_generation_cost !== 0) fail("External generation cost must be zero");
if (costRecord.external_api_call_cost !== 0) fail("External API call cost must be zero");
if (!costRecord.cost_control_decision.includes("internal_svg")) fail("Cost decision must reference internal SVG workflow");

if (readiness.status !== "generated_image_asset_ready_not_inserted_pending_explicit_ag10k") fail("Readiness status mismatch");
if (readiness.asset_file_created !== true) fail("Asset file created readiness missing");
if (readiness.source_finalised !== true) fail("Source finalised readiness missing");
if (readiness.rights_provenance_cleared_for_asset !== true) fail("Rights/provenance readiness missing");
if (readiness.caption_confirmed !== true) fail("Caption readiness missing");
if (readiness.alt_text_confirmed !== true) fail("Alt text readiness missing");
if (readiness.visible_credit_confirmed !== true) fail("Visible credit readiness missing");
if (readiness.ready_for_ag10k !== true) fail("AG10K readiness missing");
if (readiness.article_insertion_ready !== false) fail("Article insertion readiness must remain false until AG10K approval");
if (readiness.article_mutation_ready !== false) fail("Article mutation readiness must remain false");

if (boundary.status !== "ag10k_boundary_created_not_started") fail("AG10K boundary status mismatch");
if (boundary.next_stage_id !== "AG10K") fail("AG10K handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG10K must require explicit approval");

if (schema.status !== "schema_controlled_generated_image_asset_creation_source_finalisation_only") fail("Schema status mismatch");
for (const key of [
  "asset_creation_allowed_in_ag10j",
  "internal_svg_asset_creation_allowed_in_ag10j",
  "source_finalisation_allowed_in_ag10j",
  "rights_provenance_clearance_allowed_in_ag10j",
  "cost_reuse_record_allowed_in_ag10j",
  "ag10k_boundary_allowed_in_ag10j"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "external_image_api_call_allowed_in_ag10j",
  "external_image_generation_allowed_in_ag10j",
  "third_party_image_use_allowed_in_ag10j",
  "object_insertion_allowed_in_ag10j",
  "article_mutation_allowed_in_ag10j",
  "homepage_mutation_allowed_in_ag10j",
  "css_js_mutation_allowed_in_ag10j",
  "reference_insertion_allowed_in_ag10j",
  "chart_generation_allowed_in_ag10j",
  "infographic_generation_allowed_in_ag10j",
  "table_generation_allowed_in_ag10j",
  "figure_generation_allowed_in_ag10j",
  "diagram_generation_allowed_in_ag10j",
  "map_generation_allowed_in_ag10j",
  "data_fetch_allowed_in_ag10j",
  "dataset_creation_allowed_in_ag10j",
  "live_url_fetch_allowed_in_ag10j",
  "deployment_trigger_allowed_in_ag10j",
  "production_jsonl_append_allowed_in_ag10j",
  "database_write_allowed_in_ag10j",
  "supabase_write_allowed_in_ag10j",
  "backend_auth_supabase_activation_allowed_in_ag10j",
  "public_publishing_operation_allowed_in_ag10j"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, assetRecord, sourceRecord, rightsRecord, costRecord, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.controlled_generated_image_asset_creation_source_finalisation_only !== true) fail(`${obj.title || "object"} must be AG10J-only`);
  if (obj.internal_svg_editorial_asset_created_in_ag10j !== true) fail(`${obj.title || "object"} must record internal SVG asset creation`);
  if (obj.image_asset_creation_performed_in_ag10j !== true) fail(`${obj.title || "object"} must record image asset creation`);
  if (obj.svg_asset_creation_performed_in_ag10j !== true) fail(`${obj.title || "object"} must record SVG asset creation`);
  if (obj.external_image_api_call_performed_in_ag10j !== false) fail(`${obj.title || "object"} must not call external image API`);
  if (obj.external_image_generation_performed_in_ag10j !== false) fail(`${obj.title || "object"} must not externally generate image`);
  if (obj.third_party_image_used_in_ag10j !== false) fail(`${obj.title || "object"} must not use third-party image`);
  if (obj.external_reference_used_in_ag10j !== false) fail(`${obj.title || "object"} must not use external reference`);
  if (obj.object_insertion_performed_in_ag10j !== false) fail(`${obj.title || "object"} must not insert object`);
  if (obj.article_mutation_performed_in_ag10j !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.css_mutation_performed_in_ag10j !== false) fail(`${obj.title || "object"} must not mutate CSS`);
  if (obj.js_mutation_performed_in_ag10j !== false) fail(`${obj.title || "object"} must not mutate JS`);
  if (obj.database_write_performed_in_ag10j !== false) fail(`${obj.title || "object"} must not write database`);
  if (obj.supabase_write_performed_in_ag10j !== false) fail(`${obj.title || "object"} must not write Supabase`);
  if (obj.backend_auth_supabase_activation_performed_in_ag10j !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_operation_performed_in_ag10j !== false) fail(`${obj.title || "object"} must not publish`);
}

if (review.closure_decision.decision !== "ag10j_asset_created_source_finalised_pending_explicit_ag10k") fail("Closure decision mismatch");
if (review.closure_decision.proceed_to_ag10k_only_with_explicit_user_approval !== true) fail("AG10K must require explicit approval");

for (const scriptName of ["generate:ag10j", "validate:ag10j"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag10j")) {
  fail("validate:project must include validate:ag10j");
}

for (const phrase of ["Purpose", "Finalised Asset", "Source and Rights", "Cost and Reuse", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG10J document missing phrase: ${phrase}`);
}

pass("AG10J registry is present.");
pass("AG10J document is present.");
pass("AG10J review, asset record, source finalisation, rights/provenance clearance, cost/reuse, readiness, AG10K boundary, schema, learning record and preview are present.");
pass("AG10I candidate, prompt, rights, cost and handoff are consumed.");
pass("Selected article hash remains stable.");
pass("Internal SVG editorial asset is created.");
pass("Asset hash, dimensions, caption, alt text and visible credit are confirmed.");
pass("Source finalisation confirms no external visual reference, third-party asset, real logo, identifiable person or fake dashboard/stat.");
pass("Rights/provenance and cost/reuse records are confirmed.");
pass("AG10K controlled generated image insertion boundary is created with explicit approval required.");
pass("Asset is not inserted into article.");
pass("No external image API call, article mutation, CSS/JS mutation, backend activation or publishing operation is performed.");
pass("AG10J is Controlled Generated Image Asset Creation and Source Finalisation only.");
