import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const configPath = path.join(root, "data", "quality", "ag04a-r2-manual-visual-review-result-record.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

const config = readJson(configPath);
const r1 = readJson(path.join(root, config.input_files.ag04a_r1_register));

const entries = r1.entries || [];
const manualQueue = r1.manual_review_queue || [];

const correctionRequired =
  manualQueue.length > 0 ||
  (r1.summary?.articles_with_logo_or_brand_like_primary_image || 0) > 0 ||
  (r1.summary?.articles_with_credit_or_source_evidence || 0) < config.expected.article_count ||
  (r1.summary?.articles_with_reading_width_evidence_aligned || 0) < config.expected.article_count ||
  r1.summary?.ag03_integrity_preserved !== true;

const nextStage = correctionRequired ? {
  module_id: "AG04B",
  title: "Targeted Article Visual, Credit and Reading Width Correction Patch",
  required: true,
  reason: "AG04A-R1 evidence indicates one or more article visual/credit/width issues require correction."
} : {
  module_id: "AG04Z",
  title: "Article Visual, Credit and Reading Width Governance Closure",
  required: true,
  reason: "AG04A-R1 evidence indicates no targeted correction queue is required."
};

const record = {
  record_id: "AG04A_R2_MANUAL_VISUAL_REVIEW_RESULT_RECORD",
  module_id: "AG04A-R2",
  status: correctionRequired ? "correction_required_before_closure" : "no_correction_required_ready_for_closure",
  generated_at: new Date().toISOString(),

  mutation_performed: false,
  article_html_mutation_performed: false,
  article_text_mutation_performed: false,
  article_image_mutation_performed: false,
  image_credit_mutation_performed: false,
  reference_url_change_performed: false,
  css_mutation_performed: false,
  external_fetch_performed_by_script: false,
  backend_activation_performed: false,
  api_route_created: false,
  supabase_enabled: false,
  auth_enabled: false,
  real_login_enabled: false,
  real_signup_enabled: false,
  user_account_collection_enabled: false,
  frontend_deployment_performed: false,
  file_deletion_performed: false,
  file_move_performed: false,

  summary: {
    reviewed_article_count: entries.length,
    expected_article_count: config.expected.article_count,
    live_ag03_reference_link_count: r1.summary.live_ag03_reference_link_count,
    expected_ag03_reference_link_count: config.expected.ag03_reference_link_count,
    articles_with_exactly_two_ag03_links: r1.summary.articles_with_exactly_two_ag03_links,
    articles_with_primary_image_src: r1.summary.articles_with_primary_image_src,
    articles_with_logo_or_brand_like_primary_image: r1.summary.articles_with_logo_or_brand_like_primary_image,
    articles_with_credit_or_source_evidence: r1.summary.articles_with_credit_or_source_evidence,
    articles_with_reading_width_evidence_aligned: r1.summary.articles_with_reading_width_evidence_aligned,
    manual_review_queue_count: manualQueue.length,
    ag03_integrity_preserved: r1.summary.ag03_integrity_preserved,
    correction_required: correctionRequired,
    audit_only_no_mutation: true,
    next_stage_id: nextStage.module_id
  },

  manual_review_queue: manualQueue,
  next_recommended_stage: nextStage
};

const preview = {
  preview_id: "AG04A_R2_MANUAL_VISUAL_REVIEW_RESULT_PREVIEW",
  module_id: "AG04A-R2",
  preview_only: true,
  status: record.status,
  summary: record.summary,
  next_recommended_stage: nextStage,
  mutation_performed: false
};

writeJson(path.join(root, config.outputs.review_result), record);
writeJson(path.join(root, config.outputs.preview), preview);

console.log(`Created ${config.outputs.review_result}.`);
console.log(`Created ${config.outputs.preview}.`);
console.log(`Reviewed articles: ${record.summary.reviewed_article_count}`);
console.log(`Manual review queue count: ${record.summary.manual_review_queue_count}`);
console.log(`Correction required: ${record.summary.correction_required}`);
console.log(`Next stage: ${record.summary.next_stage_id}`);
console.log("Mutation performed: false");
