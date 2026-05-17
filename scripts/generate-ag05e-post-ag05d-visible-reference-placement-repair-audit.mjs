import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const configPath = path.join(root, "data", "quality", "ag05e-post-ag05d-visible-reference-placement-repair-audit.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

function ag03ReferenceAnchors(html) {
  return [...html.matchAll(/<a\b[^>]*data-drishvara-ag03c[^>]*reference-link=["']true["'][^>]*href=["']([^"']+)["'][^>]*>[\s\S]*?<\/a>/gi)].map((m) => ({
    href: m[1],
    anchor: m[0]
  }));
}

function uniqueHrefs(items) {
  return [...new Set(items.map((item) => item.href))];
}

function isVisiblePlaceholderBlock(block) {
  const text = String(block || "");
  if (/data-drishvara-ag05d-placeholder-neutralized=["']true["']/i.test(text)) return false;
  if (/\bhidden\b/i.test(text) && /aria-hidden=["']true["']/i.test(text)) return false;

  const referenceHeading = /<h2[^>]*>\s*(References|Editorial references and image credit)\s*<\/h2>/i.test(text);
  const oldReferenceLine = /Reference\s*1\s*:\s*Under editorial verification|Reference\s*2\s*:\s*Under editorial verification|References are under editorial verification/i.test(text);

  return referenceHeading && oldReferenceLine;
}

function visiblePlaceholderCount(html) {
  const blocks = [...html.matchAll(/<(section|div)\b[^>]*>[\s\S]*?<\/\1>/gi)].map((m) => m[0]);
  return blocks.filter(isVisiblePlaceholderBlock).length;
}

function visibleBlockCount(html) {
  return (html.match(/data-drishvara-ag05d-visible-reference-block=["']true["']/g) || []).length;
}

function neutralizedPlaceholderCount(html) {
  return (html.match(/data-drishvara-ag05d-placeholder-neutralized=["']true["']/g) || []).length;
}

function firstAg03LinkIndex(html) {
  const m = html.match(/<a\b[^>]*data-drishvara-ag03c[^>]*reference-link=["']true["']/i);
  return m ? m.index : -1;
}

function backLinkIndex(html) {
  return html.search(/←\s*Back to Home|Back to Home|Open Insights/i);
}

const config = readJson(configPath);
const ag05d = readJson(path.join(root, config.input_files.ag05d_apply_result));
const ag05c = readJson(path.join(root, config.input_files.ag05c_result));
const ag03z = readJson(path.join(root, config.input_files.ag03z_closure));
const ag04z = readJson(path.join(root, config.input_files.ag04z_closure));

if (ag05d.module_id !== "AG05D") throw new Error("AG05D apply result missing/invalid.");
if (ag05d.summary?.ready_for_ag05e_post_repair_audit !== true) throw new Error("AG05D must authorize AG05E.");
if (ag05c.summary?.next_stage_id !== "AG05D") throw new Error("AG05C must have identified AG05D.");
if (ag03z.summary?.ag03_reference_scaling_closed !== true) throw new Error("AG03Z closure must remain true.");
if (ag04z.summary?.ag04_visual_credit_width_governance_closed !== true) throw new Error("AG04Z closure must remain true.");

const processedRows = (ag05d.file_results || []).filter((row) => row.status === "processed");

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
  const hrefs = uniqueHrefs(ag03ReferenceAnchors(html));
  const visiblePlaceholders = visiblePlaceholderCount(html);
  const blocks = visibleBlockCount(html);
  const neutralized = neutralizedPlaceholderCount(html);
  const firstRef = firstAg03LinkIndex(html);
  const back = backLinkIndex(html);

  const urlsUnchanged = JSON.stringify(row.after_reference_urls || []) === JSON.stringify(hrefs);

  return {
    article_path: row.article_path,
    status: "audited",
    ag03_reference_link_count: hrefs.length,
    ag05d_visible_reference_block_count: blocks,
    visible_placeholder_section_count: visiblePlaceholders,
    neutralized_placeholder_section_count: neutralized,
    ag03_before_back_links: back === -1 ? true : (firstRef >= 0 && firstRef < back),
    reference_urls_from_ag05d: row.after_reference_urls || [],
    reference_urls_from_live_source: hrefs,
    reference_urls_unchanged_from_ag05d: urlsUnchanged,
    passed: hrefs.length === 2 &&
      blocks === 1 &&
      visiblePlaceholders === 0 &&
      urlsUnchanged &&
      (back === -1 ? true : (firstRef >= 0 && firstRef < back))
  };
});

const failedRows = auditRows.filter((row) => row.passed !== true);

const audit = {
  audit_id: "AG05E_POST_AG05D_VISIBLE_REFERENCE_PLACEMENT_REPAIR_AUDIT",
  module_id: "AG05E",
  status: failedRows.length === 0 ? "post_ag05d_visible_reference_repair_audit_passed" : "post_ag05d_visible_reference_repair_audit_failed",
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
    ag05d_summary: ag05d.summary,
    ag05c_summary: ag05c.summary,
    ag03z_closed: ag03z.summary.ag03_reference_scaling_closed === true,
    ag04z_closed: ag04z.summary.ag04_visual_credit_width_governance_closed === true
  },

  summary: {
    audited_article_count: auditRows.length,
    expected_article_count: config.expected.processed_article_count,
    articles_with_two_ag03_links: auditRows.filter((row) => row.ag03_reference_link_count === 2).length,
    articles_with_one_ag05d_visible_block: auditRows.filter((row) => row.ag05d_visible_reference_block_count === 1).length,
    articles_with_zero_visible_placeholder_sections: auditRows.filter((row) => row.visible_placeholder_section_count === 0).length,
    articles_with_reference_urls_unchanged_from_ag05d: auditRows.filter((row) => row.reference_urls_unchanged_from_ag05d).length,
    articles_with_ag03_before_back_links: auditRows.filter((row) => row.ag03_before_back_links).length,
    total_neutralized_placeholder_sections: auditRows.reduce((sum, row) => sum + (row.neutralized_placeholder_section_count || 0), 0),
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
  preview_id: "AG05E_POST_AG05D_VISIBLE_REFERENCE_PLACEMENT_REPAIR_PREVIEW",
  module_id: "AG05E",
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
console.log(`Articles with zero visible placeholder sections: ${audit.summary.articles_with_zero_visible_placeholder_sections}`);
console.log(`URLs unchanged from AG05D: ${audit.summary.articles_with_reference_urls_unchanged_from_ag05d}`);
console.log(`Failed article count: ${audit.summary.failed_article_count}`);
console.log(`Ready for AG05F: ${audit.summary.ready_for_ag05f_live_redeployment_manual_verification}`);
console.log("Mutation performed: false");
