import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const configPath = path.join(root, "data", "quality", "ag06d-existing-public-article-classification.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

const config = readJson(configPath);
const ag06a = readJson(path.join(root, config.input_files.ag06a_audit));
const ag06b = readJson(path.join(root, config.input_files.ag06b_manifest));
const ag06c = readJson(path.join(root, config.input_files.ag06c_register));
const activeRegister = readJson(path.join(root, config.input_files.source_tree_active_register));

if (ag06a.module_id !== "AG06A") throw new Error("AG06A audit missing/invalid.");
if (ag06a.summary?.next_stage_id !== "AG06B") throw new Error("AG06A source context invalid.");
if (ag06b.module_id !== "AG06B") throw new Error("AG06B manifest missing/invalid.");
if (ag06b.summary?.ready_for_ag06c_scaffold_output_preservation_register !== true) throw new Error("AG06B must have authorized AG06C.");
if (ag06c.module_id !== "AG06C") throw new Error("AG06C register missing/invalid.");
if (ag06c.summary?.ready_for_ag06d_existing_public_article_classification !== true) throw new Error("AG06C must authorize AG06D.");
if (activeRegister.register_id !== "SOURCE_TREE_ACTIVE_REGISTER") throw new Error("Source Tree Active Register missing/invalid.");

const t = config.classification_thresholds;
const publicArticles = ag06a.public_article_inventory || [];

function hasStructuredVisual(row) {
  return row.table_signal_present === true ||
    row.svg_signal_present === true ||
    row.canvas_signal_present === true ||
    row.chart_graph_infographic_text_signal_present === true;
}

function hasCompleteReferenceGovernance(row) {
  return row.ag03_reference_link_count === t.verified_reference_link_count_required &&
    row.ag05d_visible_reference_block_count === t.visible_reference_block_required &&
    row.visible_ar01_placeholder_count === t.visible_ar01_placeholder_count_allowed;
}

function classify(row) {
  const classificationTags = ["test_corpus_retention_candidate"];

  const referenceGovernanceNeeded = !hasCompleteReferenceGovernance(row);
  const longFormUpgradeNeeded = row.word_count_estimate < t.long_form_min_word_count;
  const preferredLengthMissing = row.word_count_estimate < t.preferred_min_word_count;
  const visualEnrichmentNeeded = !hasStructuredVisual(row);

  if (referenceGovernanceNeeded) classificationTags.push("reference_governance_candidate");
  if (longFormUpgradeNeeded) classificationTags.push("long_form_upgrade_candidate");
  if (preferredLengthMissing) classificationTags.push("below_preferred_length_candidate");
  if (visualEnrichmentNeeded) classificationTags.push("visual_enrichment_candidate");

  const finalPublicProductReady =
    !referenceGovernanceNeeded &&
    !longFormUpgradeNeeded &&
    !visualEnrichmentNeeded;

  if (finalPublicProductReady) classificationTags.push("final_public_product_ready");

  let recommendedHandling = "retain_as_test_corpus_and_route_to_long_form_visual_upgrade";
  let priority = "medium";

  if (referenceGovernanceNeeded) {
    recommendedHandling = "retain_as_test_corpus_and_route_to_reference_governance_before_upgrade";
    priority = "high";
  } else if (longFormUpgradeNeeded && visualEnrichmentNeeded) {
    recommendedHandling = "retain_as_test_corpus_and_upgrade_using_long_form_visual_standard";
    priority = "medium";
  } else if (finalPublicProductReady) {
    recommendedHandling = "eligible_for_final_public_quality_review";
    priority = "low";
  }

  return {
    article_path: row.article_path,
    category: row.category,
    detected_title: row.detected_title,
    word_count_estimate: row.word_count_estimate,
    ag03_reference_link_count: row.ag03_reference_link_count,
    ag05d_visible_reference_block_count: row.ag05d_visible_reference_block_count,
    visible_ar01_placeholder_count: row.visible_ar01_placeholder_count,
    has_complete_reference_governance: !referenceGovernanceNeeded,
    has_structured_visual_signal: hasStructuredVisual(row),
    meets_long_form_min_word_count: !longFormUpgradeNeeded,
    meets_preferred_min_word_count: !preferredLengthMissing,
    final_public_product_ready: finalPublicProductReady,
    classification_tags: classificationTags,
    recommended_handling: recommendedHandling,
    upgrade_priority: priority,
    public_article_mutation_performed: false,
    archive_or_delete_recommended_by_ag06d: false,
    notes: "AG06D classifies only. It does not edit, archive, delete or publish public articles."
  };
}

const classifications = publicArticles.map(classify);

const countTag = (tag) => classifications.filter((row) => row.classification_tags.includes(tag)).length;

const summary = {
  classified_public_article_count: classifications.length,
  source_public_article_count_from_ag06a: ag06a.summary.public_article_count,
  test_corpus_retention_candidate_count: countTag("test_corpus_retention_candidate"),
  reference_governance_candidate_count: countTag("reference_governance_candidate"),
  expected_reference_governance_candidate_count_from_ag06a: ag06a.summary.unguided_public_article_count,
  long_form_upgrade_candidate_count: countTag("long_form_upgrade_candidate"),
  below_preferred_length_candidate_count: countTag("below_preferred_length_candidate"),
  visual_enrichment_candidate_count: countTag("visual_enrichment_candidate"),
  final_public_product_ready_count: countTag("final_public_product_ready"),
  archive_or_delete_recommended_count: classifications.filter((row) => row.archive_or_delete_recommended_by_ag06d).length,
  high_priority_upgrade_or_governance_count: classifications.filter((row) => row.upgrade_priority === "high").length,
  medium_priority_upgrade_count: classifications.filter((row) => row.upgrade_priority === "medium").length,
  public_article_mutation_performed: false,
  reference_url_change_performed: false,
  backend_auth_supabase_activation_performed: false,
  classification_register_only: true,
  ready_for_ag06e_long_form_article_standard: true,
  next_stage_id: "AG06E"
};

const register = {
  register_id: "AG06D_EXISTING_PUBLIC_ARTICLE_CLASSIFICATION_REGISTER",
  module_id: "AG06D",
  status: "existing_public_article_classification_completed",
  generated_at: new Date().toISOString(),

  mutation_performed: false,
  public_article_mutation_performed: false,
  article_html_mutation_performed: false,
  homepage_mutation_performed: false,
  css_mutation_performed: false,
  javascript_mutation_performed: false,
  reference_url_change_performed: false,
  external_fetch_performed_by_script: false,
  live_url_fetch_performed: false,
  backend_activation_performed: false,
  api_route_created: false,
  supabase_enabled: false,
  auth_enabled: false,
  real_login_enabled: false,
  real_signup_enabled: false,
  user_account_collection_enabled: false,
  frontend_deployment_performed: false,
  public_article_archive_performed: false,
  public_article_delete_performed: false,
  file_deletion_performed: false,
  file_move_performed: false,

  source_context: {
    ag06a_summary: ag06a.summary,
    ag06b_summary: ag06b.summary,
    ag06c_summary: ag06c.summary,
    source_tree_register_status: activeRegister.status
  },

  classification_thresholds: t,
  summary,
  public_article_classifications: classifications,
  reference_governance_candidates: classifications.filter((row) => row.classification_tags.includes("reference_governance_candidate")),
  long_form_upgrade_candidates: classifications.filter((row) => row.classification_tags.includes("long_form_upgrade_candidate")),
  visual_enrichment_candidates: classifications.filter((row) => row.classification_tags.includes("visual_enrichment_candidate")),
  next_recommended_stage: config.recommended_next_stage
};

const preview = {
  preview_id: "AG06D_EXISTING_PUBLIC_ARTICLE_CLASSIFICATION_PREVIEW",
  module_id: "AG06D",
  preview_only: true,
  status: "preview_existing_public_article_classification",
  summary,
  reference_governance_candidates: register.reference_governance_candidates.map((row) => ({
    article_path: row.article_path,
    word_count_estimate: row.word_count_estimate,
    ag03_reference_link_count: row.ag03_reference_link_count,
    ag05d_visible_reference_block_count: row.ag05d_visible_reference_block_count,
    recommended_handling: row.recommended_handling
  })),
  sample_upgrade_candidates: classifications.slice(0, 20).map((row) => ({
    article_path: row.article_path,
    word_count_estimate: row.word_count_estimate,
    classification_tags: row.classification_tags,
    upgrade_priority: row.upgrade_priority,
    recommended_handling: row.recommended_handling
  })),
  mutation_performed: false,
  next_recommended_stage: config.recommended_next_stage
};

writeJson(path.join(root, config.outputs.classification_register), register);
writeJson(path.join(root, config.outputs.preview), preview);

console.log(`Created ${config.outputs.classification_register}.`);
console.log(`Created ${config.outputs.preview}.`);
console.log(`Classified public articles: ${summary.classified_public_article_count}`);
console.log(`Reference governance candidates: ${summary.reference_governance_candidate_count}`);
console.log(`Long-form upgrade candidates: ${summary.long_form_upgrade_candidate_count}`);
console.log(`Visual enrichment candidates: ${summary.visual_enrichment_candidate_count}`);
console.log(`Final public product ready: ${summary.final_public_product_ready_count}`);
console.log(`Next stage: ${summary.next_stage_id}`);
console.log("Mutation performed: false");
