import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const configPath = path.join(root, "data", "quality", "ag04z-article-visual-credit-width-governance-closure.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

const config = readJson(configPath);
const ag04a = readJson(path.join(root, config.input_files.ag04a_audit));
const ag04r1 = readJson(path.join(root, config.input_files.ag04a_r1_register));
const ag04r2 = readJson(path.join(root, config.input_files.ag04a_r2_result));
const ag03z = readJson(path.join(root, config.input_files.ag03z_closure));

if (ag03z.summary?.ag03_reference_scaling_closed !== true) {
  throw new Error("AG03Z reference closure must be true before AG04Z.");
}
if (ag04a.summary?.ag03_integrity_preserved !== true) {
  throw new Error("AG04A must preserve AG03 integrity before AG04Z.");
}
if (ag04r1.summary?.ag03_integrity_preserved !== true) {
  throw new Error("AG04A-R1 must preserve AG03 integrity before AG04Z.");
}
if (ag04r2.summary?.ag03_integrity_preserved !== true) {
  throw new Error("AG04A-R2 must preserve AG03 integrity before AG04Z.");
}

const closureOk =
  ag04r2.summary.reviewed_article_count === config.expected.article_count &&
  ag04r2.summary.live_ag03_reference_link_count === config.expected.ag03_reference_link_count &&
  ag04r2.summary.articles_with_exactly_two_ag03_links === config.expected.article_count &&
  ag04r2.summary.articles_with_primary_image_src === config.expected.article_count &&
  ag04r2.summary.articles_with_logo_or_brand_like_primary_image === config.expected.logo_or_brand_like_primary_image_count &&
  ag04r2.summary.articles_with_credit_or_source_evidence === config.expected.article_count &&
  ag04r2.summary.articles_with_reading_width_evidence_aligned === config.expected.article_count &&
  ag04r2.summary.manual_review_queue_count === config.expected.manual_review_queue_count &&
  ag04r2.summary.correction_required === false &&
  ag04r2.summary.next_stage_id === "AG04Z";

const record = {
  closure_id: "AG04Z_ARTICLE_VISUAL_CREDIT_WIDTH_GOVERNANCE_CLOSURE",
  module_id: "AG04Z",
  status: closureOk ? "ag04_visual_credit_width_governance_closed" : "ag04_closure_blocked",
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

  source_context: {
    ag03z_closed: ag03z.summary.ag03_reference_scaling_closed === true,
    ag04a_summary: ag04a.summary,
    ag04a_r1_summary: ag04r1.summary,
    ag04a_r2_summary: ag04r2.summary
  },

  summary: {
    article_count: ag04r2.summary.reviewed_article_count,
    expected_article_count: config.expected.article_count,
    live_ag03_reference_link_count: ag04r2.summary.live_ag03_reference_link_count,
    expected_ag03_reference_link_count: config.expected.ag03_reference_link_count,
    articles_with_exactly_two_ag03_links: ag04r2.summary.articles_with_exactly_two_ag03_links,
    articles_with_primary_image_src: ag04r2.summary.articles_with_primary_image_src,
    articles_with_logo_or_brand_like_primary_image: ag04r2.summary.articles_with_logo_or_brand_like_primary_image,
    articles_with_credit_or_source_evidence: ag04r2.summary.articles_with_credit_or_source_evidence,
    articles_with_reading_width_evidence_aligned: ag04r2.summary.articles_with_reading_width_evidence_aligned,
    manual_review_queue_count: ag04r2.summary.manual_review_queue_count,
    correction_required: ag04r2.summary.correction_required,
    ag04b_correction_required: false,
    ag03_integrity_preserved: ag04r2.summary.ag03_integrity_preserved,
    audit_only_no_mutation: true,
    ag04_visual_credit_width_governance_closed: closureOk,
    next_stage: config.closure_result.next_stage
  },

  closure_checks: {
    ag03z_reference_closure_confirmed: ag03z.summary.ag03_reference_scaling_closed === true,
    ag04a_audit_confirmed: ag04a.module_id === "AG04A",
    ag04a_r1_evidence_register_confirmed: ag04r1.module_id === "AG04A-R1",
    ag04a_r2_review_result_confirmed: ag04r2.module_id === "AG04A-R2",
    correction_required_false: ag04r2.summary.correction_required === false,
    next_stage_is_ag04z: ag04r2.summary.next_stage_id === "AG04Z",
    closure_ok: closureOk
  },

  closure_result: config.closure_result
};

const preview = {
  preview_id: "AG04Z_ARTICLE_VISUAL_CREDIT_WIDTH_GOVERNANCE_CLOSURE_PREVIEW",
  module_id: "AG04Z",
  preview_only: true,
  status: record.status,
  summary: record.summary,
  closure_checks: record.closure_checks,
  mutation_performed: false
};

writeJson(path.join(root, config.outputs.closure_record), record);
writeJson(path.join(root, config.outputs.preview), preview);

console.log(`Created ${config.outputs.closure_record}.`);
console.log(`Created ${config.outputs.preview}.`);
console.log(`Article count: ${record.summary.article_count}`);
console.log(`Live AG03 reference links: ${record.summary.live_ag03_reference_link_count}`);
console.log(`Primary image evidence: ${record.summary.articles_with_primary_image_src}`);
console.log(`Logo/brand-like primary image count: ${record.summary.articles_with_logo_or_brand_like_primary_image}`);
console.log(`Credit/source evidence: ${record.summary.articles_with_credit_or_source_evidence}`);
console.log(`Reading width aligned: ${record.summary.articles_with_reading_width_evidence_aligned}`);
console.log(`Correction required: ${record.summary.correction_required}`);
console.log(`AG04 governance closed: ${record.summary.ag04_visual_credit_width_governance_closed}`);
console.log("Mutation performed: false");
