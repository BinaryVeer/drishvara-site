import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const configPath = path.join(root, "data", "quality", "ag05e-r1-post-ag05d-r1-ar01-placeholder-neutralization-audit.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

function ag03ReferenceUrls(html) {
  return [...new Set([...html.matchAll(/<a\b[^>]*data-drishvara-ag03c[^>]*reference-link=["']true["'][^>]*href=["']([^"']+)["'][^>]*>/gi)].map((m) => m[1]))];
}

function ag05dVisibleBlockCount(html) {
  return (html.match(/data-drishvara-ag05d-visible-reference-block=["']true["']/g) || []).length;
}

function hasHiddenAttrs(block) {
  return /data-drishvara-ag05d-r1-ar01-placeholder-neutralized=["']true["']/i.test(block) ||
    /\bhidden\b/i.test(block) ||
    /aria-hidden=["']true["']/i.test(block) ||
    /display\s*:\s*none/i.test(block);
}

function isVisibleAr01Placeholder(block) {
  return /data-drishvara-ar01-reference-status|data-drishvara-ar01-reference-slot|drishvara-ar01-status/i.test(block) &&
    /Under editorial verification|Reference\s*1\s*:|Reference\s*2\s*:/i.test(block) &&
    !hasHiddenAttrs(block) &&
    !/data-drishvara-ag05d-visible-reference-block=["']true["']/i.test(block);
}

function visibleAr01PlaceholderCount(html) {
  const blocks = [...html.matchAll(/<(section|div|aside|span|li)\b[^>]*>[\s\S]*?<\/\1>/gi)].map((m) => m[0]);
  return blocks.filter(isVisibleAr01Placeholder).length;
}

function neutralizedAr01PlaceholderCount(html) {
  return (html.match(/data-drishvara-ag05d-r1-ar01-placeholder-neutralized=["']true["']/g) || []).length;
}

function neutralizedAr01BlocksAreHidden(html) {
  const blocks = [...html.matchAll(/<(section|div|aside|span|li)\b[^>]*data-drishvara-ag05d-r1-ar01-placeholder-neutralized=["']true["'][^>]*>[\s\S]*?<\/\1>/gi)].map((m) => m[0]);
  if (blocks.length === 0) return false;
  return blocks.every((block) =>
    /\bhidden\b/i.test(block) &&
    /aria-hidden=["']true["']/i.test(block) &&
    /display\s*:\s*none/i.test(block)
  );
}

function firstAg03LinkIndex(html) {
  const m = html.match(/<a\b[^>]*data-drishvara-ag03c[^>]*reference-link=["']true["']/i);
  return m ? m.index : -1;
}

function backLinkIndex(html) {
  return html.search(/←\s*Back to Home|Back to Home|Open Insights/i);
}

const config = readJson(configPath);
const ag05dR1 = readJson(path.join(root, config.input_files.ag05d_r1_apply_result));
const ag05d = readJson(path.join(root, config.input_files.ag05d_apply_result));
const ag05e = readJson(path.join(root, config.input_files.ag05e_audit));
const ag03z = readJson(path.join(root, config.input_files.ag03z_closure));
const ag04z = readJson(path.join(root, config.input_files.ag04z_closure));

if (ag05dR1.module_id !== "AG05D-R1") throw new Error("AG05D-R1 apply result missing/invalid.");
if (ag05dR1.summary?.ready_for_ag05e_r1_post_repair_audit !== true) throw new Error("AG05D-R1 must authorize AG05E-R1.");
if (ag05d.module_id !== "AG05D") throw new Error("AG05D apply result missing/invalid.");
if (ag05e.module_id !== "AG05E") throw new Error("AG05E audit missing/invalid.");
if (ag03z.summary?.ag03_reference_scaling_closed !== true) throw new Error("AG03Z closure must remain true.");
if (ag04z.summary?.ag04_visual_credit_width_governance_closed !== true) throw new Error("AG04Z closure must remain true.");

const processedRows = (ag05dR1.file_results || []).filter((row) => row.status === "processed");

const auditRows = processedRows.map((row) => {
  const full = path.join(root, row.article_path);

  if (!fs.existsSync(full)) {
    return {
      article_path: row.article_path,
      status: "missing_on_disk",
      passed: false
    };
  }

  const html = fs.readFileSync(full, "utf8");
  const urls = ag03ReferenceUrls(html);
  const urlsUnchanged = JSON.stringify(row.reference_urls_unchanged === true ? urls : []) === JSON.stringify(urls) &&
    row.reference_urls_unchanged === true;

  const visibleAr01 = visibleAr01PlaceholderCount(html);
  const neutralizedAr01 = neutralizedAr01PlaceholderCount(html);
  const neutralizedHidden = neutralizedAr01BlocksAreHidden(html);
  const ag05dBlocks = ag05dVisibleBlockCount(html);

  const firstRef = firstAg03LinkIndex(html);
  const back = backLinkIndex(html);
  const refsBeforeBack = back === -1 ? true : (firstRef >= 0 && firstRef < back);

  const passed = urls.length === config.expected.references_per_article &&
    ag05dBlocks === config.expected.visible_ag05d_block_per_article &&
    visibleAr01 === config.expected.visible_ar01_placeholder_count &&
    neutralizedAr01 >= 1 &&
    neutralizedHidden === true &&
    row.reference_urls_unchanged === true &&
    refsBeforeBack === true;

  return {
    article_path: row.article_path,
    status: "audited",
    ag03_reference_link_count: urls.length,
    ag05d_visible_reference_block_count: ag05dBlocks,
    visible_ar01_placeholder_count: visibleAr01,
    neutralized_ar01_placeholder_count: neutralizedAr01,
    neutralized_ar01_placeholders_hidden: neutralizedHidden,
    reference_urls_unchanged_from_ag05d_r1: row.reference_urls_unchanged === true,
    ag03_before_back_links: refsBeforeBack,
    passed
  };
});

const failedRows = auditRows.filter((row) => row.passed !== true);

const audit = {
  audit_id: "AG05E_R1_POST_AG05D_R1_AR01_PLACEHOLDER_NEUTRALIZATION_AUDIT",
  module_id: "AG05E-R1",
  status: failedRows.length === 0 ? "post_ag05d_r1_ar01_placeholder_neutralization_audit_passed" : "post_ag05d_r1_ar01_placeholder_neutralization_audit_failed",
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
    ag05d_r1_summary: ag05dR1.summary,
    ag05d_summary: ag05d.summary,
    ag05e_summary: ag05e.summary,
    ag03z_closed: ag03z.summary.ag03_reference_scaling_closed === true,
    ag04z_closed: ag04z.summary.ag04_visual_credit_width_governance_closed === true
  },

  summary: {
    audited_article_count: auditRows.length,
    expected_article_count: config.expected.article_count,
    articles_with_two_ag03_links: auditRows.filter((row) => row.ag03_reference_link_count === 2).length,
    articles_with_one_ag05d_visible_block: auditRows.filter((row) => row.ag05d_visible_reference_block_count === 1).length,
    articles_with_zero_visible_ar01_placeholders: auditRows.filter((row) => row.visible_ar01_placeholder_count === 0).length,
    articles_with_neutralized_ar01_placeholders: auditRows.filter((row) => row.neutralized_ar01_placeholder_count >= 1).length,
    articles_with_neutralized_ar01_placeholders_hidden: auditRows.filter((row) => row.neutralized_ar01_placeholders_hidden === true).length,
    articles_with_reference_urls_unchanged_from_ag05d_r1: auditRows.filter((row) => row.reference_urls_unchanged_from_ag05d_r1 === true).length,
    articles_with_ag03_before_back_links: auditRows.filter((row) => row.ag03_before_back_links === true).length,
    total_visible_ar01_placeholder_count: auditRows.reduce((sum, row) => sum + (row.visible_ar01_placeholder_count || 0), 0),
    total_neutralized_ar01_placeholder_count: auditRows.reduce((sum, row) => sum + (row.neutralized_ar01_placeholder_count || 0), 0),
    failed_article_count: failedRows.length,
    ag03_integrity_preserved: auditRows.every((row) => row.ag03_reference_link_count === 2),
    ag04_closure_preserved: ag04z.summary.ag04_visual_credit_width_governance_closed === true,
    reference_url_change_performed: false,
    audit_only_no_mutation: true,
    ready_for_ag05f_live_redeployment_manual_verification: failedRows.length === 0
  },

  article_audit_results: auditRows,
  failed_article_audit_results: failedRows,
  next_recommended_stage: config.recommended_next_stage
};

const preview = {
  preview_id: "AG05E_R1_POST_AG05D_R1_AR01_PLACEHOLDER_NEUTRALIZATION_PREVIEW",
  module_id: "AG05E-R1",
  preview_only: true,
  status: audit.status,
  summary: audit.summary,
  failed_article_audit_results: failedRows,
  mutation_performed: false,
  next_recommended_stage: config.recommended_next_stage
};

writeJson(path.join(root, config.outputs.audit), audit);
writeJson(path.join(root, config.outputs.preview), preview);

console.log(`Created ${config.outputs.audit}.`);
console.log(`Created ${config.outputs.preview}.`);
console.log(`Audited articles: ${audit.summary.audited_article_count}`);
console.log(`Articles with two AG03 links: ${audit.summary.articles_with_two_ag03_links}`);
console.log(`Articles with one AG05D visible block: ${audit.summary.articles_with_one_ag05d_visible_block}`);
console.log(`Articles with zero visible AR01 placeholders: ${audit.summary.articles_with_zero_visible_ar01_placeholders}`);
console.log(`Neutralized AR01 placeholder total: ${audit.summary.total_neutralized_ar01_placeholder_count}`);
console.log(`Failed article count: ${audit.summary.failed_article_count}`);
console.log(`Ready for AG05F: ${audit.summary.ready_for_ag05f_live_redeployment_manual_verification}`);
console.log("Mutation performed: false");
