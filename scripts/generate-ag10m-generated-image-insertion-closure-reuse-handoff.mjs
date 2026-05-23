import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag10lReview: "data/content-intelligence/quality-reviews/ag10l-post-generated-image-insertion-audit.json",
  ag10lAuditReport: "data/content-intelligence/audit-records/ag10l-post-generated-image-insertion-audit-report.json",
  ag10lReadiness: "data/content-intelligence/quality-registry/ag10l-generated-image-insertion-readiness-record.json",
  ag10lRollback: "data/content-intelligence/quality-registry/ag10l-generated-image-insertion-rollback-readiness-record.json",
  ag10lBoundary: "data/content-intelligence/mutation-plans/ag10l-to-ag10m-generated-image-insertion-closure-reuse-handoff-boundary.json",
  ag10kApply: "data/content-intelligence/apply-records/ag10k-controlled-generated-image-insertion-apply.json",
  ag10jAssetRecord: "data/content-intelligence/visual-registry/ag10j-finalised-generated-image-asset-record.json",
  ag10jCostRecord: "data/content-intelligence/quality-registry/ag10j-generated-image-cost-reuse-record.json",
  ag10iConcept: "data/content-intelligence/object-registry/ag10i-reusable-image-concept-candidate-record.json",
  ag10iPrompt: "data/content-intelligence/object-registry/ag10i-finalised-prompt-concept-record.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag10m-generated-image-insertion-closure-reuse-handoff.json");
const closurePath = path.join(root, "data/content-intelligence/closure-records/ag10m-generated-image-insertion-closure-reuse-handoff.json");
const reuseHandoffPath = path.join(root, "data/content-intelligence/object-registry/ag10m-generated-image-reuse-handoff-record.json");
const finalReadinessPath = path.join(root, "data/content-intelligence/quality-registry/ag10m-generated-image-final-readiness-record.json");
const nextBoundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag10m-to-ag10z-governed-object-pipeline-closure-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/generated-image-insertion-closure-reuse-handoff.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag10m-generated-image-insertion-closure-reuse-handoff-learning.json");
const registryPath = path.join(root, "data/quality/ag10m-generated-image-insertion-closure-reuse-handoff.json");
const previewPath = path.join(root, "data/quality/ag10m-generated-image-insertion-closure-reuse-handoff-preview.json");
const docPath = path.join(root, "docs/quality/AG10M_GENERATED_IMAGE_INSERTION_CLOSURE_REUSE_HANDOFF.md");

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function writeJson(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n");
}

function writeText(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, value);
}

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) throw new Error(`Missing required AG10M input ${name}: ${relativePath}`);
}

const ag10lReview = readJson(inputs.ag10lReview);
const ag10lAuditReport = readJson(inputs.ag10lAuditReport);
const ag10lReadiness = readJson(inputs.ag10lReadiness);
const ag10lRollback = readJson(inputs.ag10lRollback);
const ag10lBoundary = readJson(inputs.ag10lBoundary);
const ag10kApply = readJson(inputs.ag10kApply);
const ag10jAssetRecord = readJson(inputs.ag10jAssetRecord);
const ag10jCostRecord = readJson(inputs.ag10jCostRecord);
const ag10iConcept = readJson(inputs.ag10iConcept);
const ag10iPrompt = readJson(inputs.ag10iPrompt);

if (ag10lReview.status !== "post_generated_image_insertion_audit_passed") {
  throw new Error("AG10M requires AG10L audit passed review.");
}
if (ag10lAuditReport.status !== "post_generated_image_insertion_audit_passed") {
  throw new Error("AG10M requires AG10L audit report passed.");
}
if (ag10lReadiness.ready_for_ag10m !== true) {
  throw new Error("AG10M requires AG10L readiness for AG10M.");
}
if (ag10lBoundary.next_stage_id !== "AG10M" || ag10lBoundary.explicit_approval_required !== true) {
  throw new Error("AG10M requires AG10L to AG10M explicit boundary.");
}

const selectedArticlePath = ag10kApply.selected_article_path;
const assetPath = ag10kApply.asset_path;
const backupPath = ag10kApply.backup_path;

if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);
if (!exists(assetPath)) throw new Error(`Asset missing: ${assetPath}`);
if (!exists(backupPath)) throw new Error(`Backup missing: ${backupPath}`);

const articleHash = sha256(fs.readFileSync(path.join(root, selectedArticlePath), "utf8"));
const assetHash = sha256(fs.readFileSync(path.join(root, assetPath), "utf8"));
const backupHash = sha256(fs.readFileSync(path.join(root, backupPath), "utf8"));

if (articleHash !== ag10kApply.post_insertion_hash) {
  throw new Error("AG10M article hash must remain AG10K post-insertion hash.");
}
if (assetHash !== ag10jAssetRecord.asset_hash_sha256) {
  throw new Error("AG10M asset hash must match AG10J asset record.");
}
if (backupHash !== ag10kApply.pre_insertion_hash) {
  throw new Error("AG10M backup hash must match AG10K pre-insertion hash.");
}

const stageControls = {
  generated_image_insertion_closure_reuse_handoff_only: true,
  selected_article_read_performed: true,
  asset_read_performed: true,
  backup_read_performed: true,

  article_mutation_performed_in_ag10m: false,
  selected_article_file_write_performed_in_ag10m: false,
  object_insertion_performed_in_ag10m: false,
  image_generation_performed_in_ag10m: false,
  external_image_api_call_performed_in_ag10m: false,
  image_asset_creation_performed_in_ag10m: false,
  new_asset_creation_performed_in_ag10m: false,
  reference_insertion_performed_in_ag10m: false,
  reference_url_change_performed_in_ag10m: false,
  homepage_mutation_performed_in_ag10m: false,
  css_file_mutation_performed_in_ag10m: false,
  js_file_mutation_performed_in_ag10m: false,
  data_fetch_performed_in_ag10m: false,
  dataset_creation_performed_in_ag10m: false,
  live_url_fetch_performed_in_ag10m: false,
  deployment_trigger_performed_in_ag10m: false,
  production_jsonl_append_performed_in_ag10m: false,
  database_write_performed_in_ag10m: false,
  supabase_write_performed_in_ag10m: false,
  backend_auth_supabase_activation_performed_in_ag10m: false,
  rollback_execution_performed_in_ag10m: false,
  public_publishing_operation_performed_in_ag10m: false
};

const reuseHandoff = {
  module_id: "AG10M",
  title: "Generated Image Reuse Handoff Record",
  status: "generated_image_reuse_handoff_recorded",
  selected_article_path: selectedArticlePath,
  asset_id: ag10jAssetRecord.asset_id,
  asset_path: assetPath,
  asset_hash_sha256: assetHash,
  concept_template_candidate_id: ag10iConcept.concept_template_candidate_id,
  prompt_record_id: ag10iPrompt.prompt_record_id,
  reusable_asset_family: "digital_public_healthcare_service_pathway",
  reusable_for_article_types: ag10iConcept.reusable_for_article_types,
  reuse_assets: {
    rendered_svg_asset: {
      path: assetPath,
      reuse_status: "approved_for_contextual_reuse_after_future_layout_check",
      restriction: "Do not reuse where article requires real location, official dashboard, exact facility evidence, or non-health governance theme."
    },
    concept_template: {
      id: ag10iConcept.concept_template_candidate_id,
      reuse_status: "approved_for_policy_digital_governance_visual_template_library"
    },
    prompt_pattern: {
      id: ag10iPrompt.prompt_record_id,
      reuse_status: "approved_with_variation_required_to_avoid_repetitive_visuals"
    },
    caption_alt_credit_pattern: {
      caption: ag10kApply.caption,
      alt_text: ag10kApply.alt_text,
      visible_credit: ag10kApply.visible_credit,
      reuse_status: "approved_as_pattern_not_fixed_text"
    }
  },
  reuse_gate_questions: [
    "Will this improve what a visitor sees?",
    "Will this make articles more trustworthy?",
    "Will this make Drishvara memorable?",
    "Will this reduce future cost?",
    "Will this create reusable intelligence?"
  ],
  future_reuse_conditions: [
    "Run the five-question inclusion gate before reuse.",
    "Confirm topic fit and avoid misleading evidence implication.",
    "Confirm article placement and mobile layout.",
    "Confirm visible credit remains present.",
    "Confirm no new backend/database/Supabase activation is required.",
    "Confirm asset hash if reusing the same SVG file."
  ],
  ...stageControls
};

const closure = {
  module_id: "AG10M",
  title: "Generated Image Insertion Closure and Reuse Handoff",
  status: "generated_image_insertion_chain_closed_reuse_handoff_recorded",
  selected_article_path: selectedArticlePath,
  asset_path: assetPath,
  backup_path: backupPath,
  article_hash_at_closure: articleHash,
  asset_hash_sha256: assetHash,
  backup_hash_sha256: backupHash,
  consumed_evidence: {
    ag10l_audit_status: ag10lAuditReport.status,
    ag10l_failed_checks: ag10lAuditReport.failed_checks.length,
    ag10l_ready_for_ag10m: ag10lReadiness.ready_for_ag10m,
    ag10l_rollback_ready: ag10lRollback.rollback_ready,
    ag10k_apply_status: ag10kApply.status,
    ag10j_asset_status: ag10jAssetRecord.status
  },
  closure_decision: {
    generated_image_insertion_chain_closed: true,
    reuse_handoff_recorded: true,
    rollback_readiness_carried_forward: true,
    publishing_ready: false,
    backend_activation_ready: false,
    next_governed_closure_stage: "AG10Z"
  },
  ...stageControls
};

const finalReadiness = {
  module_id: "AG10M",
  title: "Generated Image Final Readiness Record",
  status: "ag10_generated_image_chain_closed_pending_ag10z",
  selected_article_path: selectedArticlePath,
  asset_path: assetPath,
  article_hash_at_closure: articleHash,
  asset_hash_sha256: assetHash,
  ag10l_audit_passed: true,
  generated_image_insertion_chain_closed: true,
  reuse_handoff_recorded: true,
  rollback_ready: true,
  ready_for_ag10z: true,
  publishing_ready: false,
  backend_activation_ready: false,
  explicit_ag10z_approval_required: true,
  ...stageControls
};

const nextBoundary = {
  module_id: "AG10M",
  title: "AG10M to AG10Z Governed Object Pipeline Closure Boundary",
  status: "ag10z_boundary_created_not_started",
  selected_article_path: selectedArticlePath,
  asset_path: assetPath,
  article_hash_at_closure: articleHash,
  next_stage_id: "AG10Z",
  next_stage_title: "Governed Object Pipeline Closure and Future Object-Type Handoff",
  explicit_approval_required: true,
  ag10z_allowed_scope: [
    "Close AG10 governed object-pipeline planning and generated-image insertion chain.",
    "Record remaining object families for future controlled cycles.",
    "Carry forward reusable asset/concept/template intelligence.",
    "Confirm publishing/backend/Supabase remains blocked unless separately approved."
  ],
  ag10z_blocked_scope: [
    "No article mutation.",
    "No object insertion.",
    "No image/chart/infographic/table/map generation.",
    "No CSS/JS mutation.",
    "No backend/Auth/Supabase/database activation.",
    "No public publishing operation."
  ],
  ...stageControls
};

const schema = {
  module_id: "AG10M",
  title: "Generated Image Insertion Closure and Reuse Handoff Schema",
  status: "schema_generated_image_insertion_closure_reuse_handoff_only",
  closure_allowed_in_ag10m: true,
  reuse_handoff_allowed_in_ag10m: true,
  final_readiness_allowed_in_ag10m: true,
  ag10z_boundary_allowed_in_ag10m: true,

  article_mutation_allowed_in_ag10m: false,
  object_insertion_allowed_in_ag10m: false,
  image_generation_allowed_in_ag10m: false,
  external_image_api_call_allowed_in_ag10m: false,
  new_asset_creation_allowed_in_ag10m: false,
  reference_insertion_allowed_in_ag10m: false,
  reference_url_change_allowed_in_ag10m: false,
  homepage_mutation_allowed_in_ag10m: false,
  css_js_mutation_allowed_in_ag10m: false,
  backend_auth_supabase_activation_allowed_in_ag10m: false,
  public_publishing_operation_allowed_in_ag10m: false,
  ...stageControls
};

const review = {
  module_id: "AG10M",
  title: "Generated Image Insertion Closure and Reuse Handoff",
  status: "generated_image_insertion_chain_closed_reuse_handoff_recorded",
  depends_on: ["AG10L", "AG10K", "AG10J", "AG10I"],
  generated_from: inputs,
  closure_file: "data/content-intelligence/closure-records/ag10m-generated-image-insertion-closure-reuse-handoff.json",
  reuse_handoff_file: "data/content-intelligence/object-registry/ag10m-generated-image-reuse-handoff-record.json",
  final_readiness_file: "data/content-intelligence/quality-registry/ag10m-generated-image-final-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag10m-to-ag10z-governed-object-pipeline-closure-boundary.json",
  schema_file: "data/content-intelligence/schema/generated-image-insertion-closure-reuse-handoff.schema.json",
  learning_file: "data/content-intelligence/learning/ag10m-generated-image-insertion-closure-reuse-handoff-learning.json",
  summary: {
    selected_article_path: selectedArticlePath,
    asset_path: assetPath,
    article_hash_at_closure: articleHash,
    asset_hash_sha256: assetHash,
    chain_closed: true,
    reuse_handoff_recorded: true,
    next_stage_id: "AG10Z",
    next_stage_title: "Governed Object Pipeline Closure and Future Object-Type Handoff",
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG10M",
  title: "Generated Image Insertion Closure and Reuse Handoff Learning",
  status: "learning_record_only",
  learning_points: [
    "Generated-image insertion chains should close only after a passed post-insertion audit.",
    "Reusable visual intelligence should be separated into rendered asset, concept template, prompt pattern, and caption/alt/credit pattern.",
    "Future reuse must pass the five-question inclusion gate again.",
    "Validator forward-compatibility should use controlled apply records instead of only historic hard-coded hashes.",
    "Backend/Supabase remains a separate future activation track and must not be coupled to static article/object pipeline closure."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG10M",
  title: "Generated Image Insertion Closure and Reuse Handoff",
  status: "generated_image_insertion_chain_closed_reuse_handoff_recorded",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag10m-generated-image-insertion-closure-reuse-handoff.json",
    closure: "data/content-intelligence/closure-records/ag10m-generated-image-insertion-closure-reuse-handoff.json",
    reuse_handoff: "data/content-intelligence/object-registry/ag10m-generated-image-reuse-handoff-record.json",
    final_readiness: "data/content-intelligence/quality-registry/ag10m-generated-image-final-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag10m-to-ag10z-governed-object-pipeline-closure-boundary.json",
    schema: "data/content-intelligence/schema/generated-image-insertion-closure-reuse-handoff.schema.json",
    learning: "data/content-intelligence/learning/ag10m-generated-image-insertion-closure-reuse-handoff-learning.json",
    preview: "data/quality/ag10m-generated-image-insertion-closure-reuse-handoff-preview.json",
    document: "docs/quality/AG10M_GENERATED_IMAGE_INSERTION_CLOSURE_REUSE_HANDOFF.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG10M",
  preview_only: true,
  status: "generated_image_insertion_chain_closed_reuse_handoff_recorded",
  selected_article_path: selectedArticlePath,
  asset_path: assetPath,
  article_hash_at_closure: articleHash,
  asset_hash_sha256: assetHash,
  reuse_summary: reuseHandoff.reuse_assets,
  next_stage: nextBoundary,
  ...stageControls
};

const doc = `# AG10M — Generated Image Insertion Closure and Reuse Handoff

## Purpose

AG10M closes the generated-image insertion chain after AG10L audit passed and records reuse intelligence for the asset, concept, prompt pattern, caption, alt text and visible credit.

## Closure Result

- Status: \`generated_image_insertion_chain_closed_reuse_handoff_recorded\`
- Selected article: \`${selectedArticlePath}\`
- Asset path: \`${assetPath}\`
- Article hash at closure: \`${articleHash}\`
- Asset hash: \`${assetHash}\`
- AG10L failed checks: \`${ag10lAuditReport.failed_checks.length}\`
- Rollback ready: \`${ag10lRollback.rollback_ready}\`

## Reuse Handoff

AG10M records the reusable rendered SVG asset, concept template, prompt pattern, and caption/alt/credit pattern for future governed object-pipeline cycles.

Future reuse must again pass the five-question inclusion gate and must remain context-safe.

## Boundaries

AG10M does not mutate the article, insert objects, generate images, create new assets, change references, mutate homepage/CSS/JS, activate backend/Auth/Supabase/database systems, execute rollback or publish anything.

## Next Stage

AG10Z — Governed Object Pipeline Closure and Future Object-Type Handoff — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(closurePath, closure);
writeJson(reuseHandoffPath, reuseHandoff);
writeJson(finalReadinessPath, finalReadiness);
writeJson(nextBoundaryPath, nextBoundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG10M generated image insertion closure and reuse handoff artifacts generated.");
console.log("✅ Generated image insertion chain closed.");
console.log("✅ Reusable asset, concept, prompt pattern, caption/alt/credit pattern recorded.");
console.log("✅ Rollback readiness and AG10L audit evidence carried forward.");
console.log("✅ No article mutation, object insertion, image generation, new asset creation, backend activation or publishing performed.");
console.log("✅ AG10Z handoff created with explicit approval required.");
