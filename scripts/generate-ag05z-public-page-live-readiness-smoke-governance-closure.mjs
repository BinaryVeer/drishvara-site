import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const configPath = path.join(root, "data", "quality", "ag05z-public-page-live-readiness-smoke-governance-closure.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

const config = readJson(configPath);

const ag05f = readJson(path.join(root, config.input_files.ag05f_record));
const ag05eR1 = readJson(path.join(root, config.input_files.ag05e_r1_audit));
const ag05dR1 = readJson(path.join(root, config.input_files.ag05d_r1_apply_result));
const ag05e = readJson(path.join(root, config.input_files.ag05e_audit));
const ag05d = readJson(path.join(root, config.input_files.ag05d_apply_result));
const ag05c = readJson(path.join(root, config.input_files.ag05c_result));
const ag05b = readJson(path.join(root, config.input_files.ag05b_checklist));
const ag05a = readJson(path.join(root, config.input_files.ag05a_audit));
const ag04z = readJson(path.join(root, config.input_files.ag04z_closure));
const ag03z = readJson(path.join(root, config.input_files.ag03z_closure));

if (ag05f.module_id !== "AG05F") throw new Error("AG05F record missing/invalid.");
if (ag05eR1.module_id !== "AG05E-R1") throw new Error("AG05E-R1 audit missing/invalid.");
if (ag05dR1.module_id !== "AG05D-R1") throw new Error("AG05D-R1 apply result missing/invalid.");
if (ag05e.module_id !== "AG05E") throw new Error("AG05E audit missing/invalid.");
if (ag05d.module_id !== "AG05D") throw new Error("AG05D apply result missing/invalid.");
if (ag05c.module_id !== "AG05C") throw new Error("AG05C result missing/invalid.");
if (ag05b.module_id !== "AG05B") throw new Error("AG05B checklist missing/invalid.");
if (ag05a.module_id !== "AG05A") throw new Error("AG05A audit missing/invalid.");

const closureChecks = {
  ag03z_closed: ag03z.summary?.ag03_reference_scaling_closed === true,
  ag04z_closed: ag04z.summary?.ag04_visual_credit_width_governance_closed === true,
  ag05a_static_smoke_completed: ag05a.summary?.ready_for_ag05b_manual_live_review_record === true,
  ag05b_checklist_completed: ag05b.summary?.ready_for_ag05c_manual_live_review_result_record === true,
  ag05c_recorded_correction_need: ag05c.summary?.correction_required === true && ag05c.summary?.next_stage_id === "AG05D",
  ag05d_repair_ready_for_audit: ag05d.summary?.ready_for_ag05e_post_repair_audit === true,
  ag05e_repair_audit_passed: ag05e.summary?.ready_for_ag05f_live_redeployment_manual_verification === true,
  ag05d_r1_repair_ready_for_audit: ag05dR1.summary?.ready_for_ag05e_r1_post_repair_audit === true,
  ag05e_r1_audit_passed: ag05eR1.summary?.ready_for_ag05f_live_redeployment_manual_verification === true,
  ag05f_live_verification_passed: ag05f.summary?.live_verification_passed === true,
  ag05f_correction_required_false: ag05f.summary?.correction_required === false,
  ag05f_next_stage_ag05z: ag05f.summary?.next_stage_id === "AG05Z"
};

const closureOk =
  Object.values(closureChecks).every(Boolean) &&
  ag05eR1.summary.audited_article_count === config.expected.article_count &&
  ag05eR1.summary.articles_with_two_ag03_links === config.expected.article_count &&
  ag05eR1.summary.articles_with_one_ag05d_visible_block === config.expected.article_count &&
  ag05eR1.summary.total_visible_ar01_placeholder_count === config.expected.visible_ar01_placeholder_count &&
  ag05eR1.summary.failed_article_count === 0 &&
  ag05f.summary.visible_ar01_placeholder_count === config.expected.visible_ar01_placeholder_count &&
  ag05f.summary.ag03_reference_link_count === config.expected.ag03_links_per_article &&
  ag05f.summary.ag05d_visible_block_count === config.expected.ag05d_visible_block_per_article;

const closureRecord = {
  closure_id: "AG05Z_PUBLIC_PAGE_LIVE_READINESS_SMOKE_GOVERNANCE_CLOSURE",
  module_id: "AG05Z",
  status: closureOk ? "ag05_public_page_live_readiness_smoke_governance_closed" : "ag05_closure_blocked",
  generated_at: new Date().toISOString(),

  mutation_performed: false,
  article_html_mutation_performed: false,
  homepage_mutation_performed: false,
  css_mutation_performed: false,
  javascript_mutation_performed: false,
  favicon_mutation_performed: false,
  navigation_mutation_performed: false,
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
  file_deletion_performed: false,
  file_move_performed: false,

  source_context: {
    ag05f_summary: ag05f.summary,
    ag05e_r1_summary: ag05eR1.summary,
    ag05d_r1_summary: ag05dR1.summary,
    ag05e_summary: ag05e.summary,
    ag05d_summary: ag05d.summary,
    ag05c_summary: ag05c.summary,
    ag05b_summary: ag05b.summary,
    ag05a_summary: ag05a.summary,
    ag04z_summary: ag04z.summary,
    ag03z_summary: ag03z.summary
  },

  summary: {
    ag05_public_page_live_readiness_smoke_governance_closed: closureOk,
    ag03_closure_preserved: closureChecks.ag03z_closed,
    ag04_closure_preserved: closureChecks.ag04z_closed,
    article_count_audited_after_repair: ag05eR1.summary.audited_article_count,
    articles_with_two_ag03_links: ag05eR1.summary.articles_with_two_ag03_links,
    articles_with_one_ag05d_visible_block: ag05eR1.summary.articles_with_one_ag05d_visible_block,
    total_visible_ar01_placeholder_count: ag05eR1.summary.total_visible_ar01_placeholder_count,
    failed_article_count_after_repair: ag05eR1.summary.failed_article_count,
    live_verification_passed: ag05f.summary.live_verification_passed,
    live_visible_ar01_placeholder_count: ag05f.summary.visible_ar01_placeholder_count,
    correction_required: ag05f.summary.correction_required,
    reference_url_change_performed: false,
    backend_auth_supabase_activation_performed: false,
    audit_only_no_mutation: true,
    next_stage: config.closure_result.next_stage
  },

  closure_checks: closureChecks,
  closure_result: config.closure_result
};

const preview = {
  preview_id: "AG05Z_PUBLIC_PAGE_LIVE_READINESS_SMOKE_GOVERNANCE_CLOSURE_PREVIEW",
  module_id: "AG05Z",
  preview_only: true,
  status: closureRecord.status,
  summary: closureRecord.summary,
  closure_checks: closureChecks,
  mutation_performed: false
};

writeJson(path.join(root, config.outputs.closure_record), closureRecord);
writeJson(path.join(root, config.outputs.preview), preview);

console.log(`Created ${config.outputs.closure_record}.`);
console.log(`Created ${config.outputs.preview}.`);
console.log(`AG05 closed: ${closureRecord.summary.ag05_public_page_live_readiness_smoke_governance_closed}`);
console.log(`Article count audited after repair: ${closureRecord.summary.article_count_audited_after_repair}`);
console.log(`Articles with two AG03 links: ${closureRecord.summary.articles_with_two_ag03_links}`);
console.log(`Articles with visible AG05D block: ${closureRecord.summary.articles_with_one_ag05d_visible_block}`);
console.log(`Visible AR01 placeholder count: ${closureRecord.summary.total_visible_ar01_placeholder_count}`);
console.log(`Live verification passed: ${closureRecord.summary.live_verification_passed}`);
console.log(`Correction required: ${closureRecord.summary.correction_required}`);
console.log("Mutation performed: false");
