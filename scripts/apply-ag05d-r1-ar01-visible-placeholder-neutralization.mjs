import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const configPath = path.join(root, "data", "quality", "ag05d-r1-ar01-visible-placeholder-neutralization.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

function ag03ReferenceUrls(html) {
  return [...new Set([...html.matchAll(/<a\b[^>]*data-drishvara-ag03c[^>]*reference-link=["']true["'][^>]*href=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]))];
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

function isAr01Placeholder(block) {
  return /data-drishvara-ar01-reference-status|data-drishvara-ar01-reference-slot|drishvara-ar01-status/i.test(block) &&
    /Under editorial verification|Reference\s*1\s*:|Reference\s*2\s*:/i.test(block) &&
    !hasHiddenAttrs(block) &&
    !/data-drishvara-ag05d-visible-reference-block=["']true["']/i.test(block);
}

function addHiddenAttrs(openingTag) {
  let tag = openingTag;

  if (!/data-drishvara-ag05d-r1-ar01-placeholder-neutralized=/i.test(tag)) {
    tag = tag.replace(/>$/, ' data-drishvara-ag05d-r1-ar01-placeholder-neutralized="true">');
  }
  if (!/\bhidden\b/i.test(tag)) {
    tag = tag.replace(/>$/, " hidden>");
  }
  if (!/aria-hidden=/i.test(tag)) {
    tag = tag.replace(/>$/, ' aria-hidden="true">');
  }
  if (/style=/i.test(tag)) {
    tag = tag.replace(/style=["']([^"']*)["']/i, (m, styleValue) => {
      return /display\s*:\s*none/i.test(styleValue)
        ? m
        : `style="${styleValue}; display:none"`;
    });
  } else {
    tag = tag.replace(/>$/, ' style="display:none">');
  }

  return tag;
}

function hideBlock(block) {
  return block.replace(/^<([a-z0-9]+)\b[^>]*>/i, (m) => addHiddenAttrs(m));
}

function neutralizeAr01Placeholders(html) {
  let out = html;

  // Hide parent containers where AR01 placeholder markers are grouped.
  out = out.replace(/<(section|div|aside)\b[^>]*>[\s\S]*?<\/\1>/gi, (block) => {
    return isAr01Placeholder(block) ? hideBlock(block) : block;
  });

  // Fallback: hide direct AR01 placeholder status/list elements if parent matching missed them.
  out = out.replace(/<(span|li)\b[^>]*(data-drishvara-ar01-reference-status|data-drishvara-ar01-reference-slot|drishvara-ar01-status)[^>]*>[\s\S]*?<\/\1>/gi, (block) => {
    return isAr01Placeholder(block) ? hideBlock(block) : block;
  });

  return out;
}

function visibleAr01PlaceholderCount(html) {
  const blocks = [...html.matchAll(/<(section|div|aside|span|li)\b[^>]*>[\s\S]*?<\/\1>/gi)].map(m => m[0]);
  return blocks.filter(isAr01Placeholder).length;
}

const config = readJson(configPath);
const ag05d = readJson(path.join(root, config.input_files.ag05d_apply_result));

if (ag05d.module_id !== "AG05D") throw new Error("Input must be AG05D apply result.");
if (ag05d.summary?.ready_for_ag05e_post_repair_audit !== true) throw new Error("AG05D must be ready for post-repair audit.");

const processed = (ag05d.file_results || []).filter(row => row.status === "processed");
const results = [];

for (const row of processed) {
  const full = path.join(root, row.article_path);
  if (!fs.existsSync(full)) {
    results.push({ article_path: row.article_path, status: "missing_on_disk", modified: false });
    continue;
  }

  const before = fs.readFileSync(full, "utf8");
  const beforeUrls = ag03ReferenceUrls(before);
  const beforeVisibleAr01 = visibleAr01PlaceholderCount(before);
  const beforeAg05dBlocks = ag05dVisibleBlockCount(before);

  const after = neutralizeAr01Placeholders(before);
  const modified = after !== before;

  if (modified) fs.writeFileSync(full, after);

  const afterUrls = ag03ReferenceUrls(after);
  const afterVisibleAr01 = visibleAr01PlaceholderCount(after);
  const afterAg05dBlocks = ag05dVisibleBlockCount(after);
  const neutralizedCount = (after.match(/data-drishvara-ag05d-r1-ar01-placeholder-neutralized=["']true["']/g) || []).length;

  results.push({
    article_path: row.article_path,
    status: "processed",
    modified,
    before_ag03_reference_link_count: beforeUrls.length,
    after_ag03_reference_link_count: afterUrls.length,
    reference_urls_unchanged: JSON.stringify(beforeUrls) === JSON.stringify(afterUrls),
    before_ag05d_visible_block_count: beforeAg05dBlocks,
    after_ag05d_visible_block_count: afterAg05dBlocks,
    before_visible_ar01_placeholder_count: beforeVisibleAr01,
    after_visible_ar01_placeholder_count: afterVisibleAr01,
    after_neutralized_ar01_placeholder_count: neutralizedCount
  });
}

const modifiedRows = results.filter(r => r.modified);
const result = {
  apply_id: "AG05D_R1_AR01_VISIBLE_PLACEHOLDER_NEUTRALIZATION_APPLY_RESULT",
  module_id: "AG05D-R1",
  status: "ar01_visible_placeholder_neutralization_applied",
  generated_at: new Date().toISOString(),

  mutation_performed: modifiedRows.length > 0,
  article_html_mutation_performed: modifiedRows.length > 0,
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
  frontend_deployment_performed: false,
  file_deletion_performed: false,
  file_move_performed: false,

  summary: {
    processed_article_count: results.length,
    modified_article_count: modifiedRows.length,
    articles_with_two_ag03_links_after: results.filter(r => r.after_ag03_reference_link_count === 2).length,
    articles_with_reference_urls_unchanged: results.filter(r => r.reference_urls_unchanged).length,
    articles_with_one_ag05d_visible_block_after: results.filter(r => r.after_ag05d_visible_block_count === 1).length,
    articles_with_zero_visible_ar01_placeholder_after: results.filter(r => r.after_visible_ar01_placeholder_count === 0).length,
    total_visible_ar01_placeholders_before: results.reduce((sum, r) => sum + (r.before_visible_ar01_placeholder_count || 0), 0),
    total_visible_ar01_placeholders_after: results.reduce((sum, r) => sum + (r.after_visible_ar01_placeholder_count || 0), 0),
    total_neutralized_ar01_placeholders_after: results.reduce((sum, r) => sum + (r.after_neutralized_ar01_placeholder_count || 0), 0),
    reference_url_change_performed: false,
    css_mutation_performed: false,
    javascript_mutation_performed: false,
    backend_auth_supabase_activation_performed: false,
    ready_for_ag05e_r1_post_repair_audit: true
  },

  file_results: results,
  next_recommended_stage: config.recommended_next_stage
};

const preview = {
  preview_id: "AG05D_R1_AR01_VISIBLE_PLACEHOLDER_NEUTRALIZATION_PREVIEW",
  module_id: "AG05D-R1",
  preview_only: true,
  status: result.status,
  summary: result.summary,
  modified_articles: modifiedRows.slice(0, 20).map(r => ({
    article_path: r.article_path,
    before_visible_ar01_placeholder_count: r.before_visible_ar01_placeholder_count,
    after_visible_ar01_placeholder_count: r.after_visible_ar01_placeholder_count,
    after_neutralized_ar01_placeholder_count: r.after_neutralized_ar01_placeholder_count
  })),
  mutation_performed: result.mutation_performed
};

writeJson(path.join(root, config.outputs.apply_result), result);
writeJson(path.join(root, config.outputs.preview), preview);

console.log(`Created ${config.outputs.apply_result}.`);
console.log(`Created ${config.outputs.preview}.`);
console.log(`Processed articles: ${result.summary.processed_article_count}`);
console.log(`Modified articles: ${result.summary.modified_article_count}`);
console.log(`Visible AR01 placeholders before: ${result.summary.total_visible_ar01_placeholders_before}`);
console.log(`Visible AR01 placeholders after: ${result.summary.total_visible_ar01_placeholders_after}`);
console.log(`Neutralized AR01 placeholders after: ${result.summary.total_neutralized_ar01_placeholders_after}`);
console.log(`Ready for AG05E-R1: ${result.summary.ready_for_ag05e_r1_post_repair_audit}`);
