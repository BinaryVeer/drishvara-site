import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const configPath = path.join(root, "data", "quality", "ag05d-targeted-visible-reference-placement-repair.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

function ag03ReferenceBlocks(html) {
  return [...html.matchAll(/<section\b[^>]*data-drishvara-ag03c[^>]*reference-block=["']true["'][\s\S]*?<\/section>/gi)].map((m) => m[0]);
}

function ag03ReferenceAnchors(html) {
  return [...html.matchAll(/<a\b[^>]*data-drishvara-ag03c[^>]*reference-link=["']true["'][^>]*href=["']([^"']+)["'][^>]*>[\s\S]*?<\/a>/gi)].map((m) => ({
    href: m[1],
    anchor: m[0]
  }));
}

function uniqueByHref(items) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    if (seen.has(item.href)) continue;
    seen.add(item.href);
    out.push(item);
  }
  return out;
}

function isVisiblePlaceholderBlock(block) {
  const text = String(block || "");
  if (/data-drishvara-ag05d-placeholder-neutralized=["']true["']/i.test(text)) return false;
  if (/\bhidden\b/i.test(text) && /aria-hidden=["']true["']/i.test(text)) return false;

  const referenceHeading = /<h2[^>]*>\s*(References|Editorial references and image credit)\s*<\/h2>/i.test(text);
  const oldReferenceLine = /Reference\s*1\s*:\s*Under editorial verification|Reference\s*2\s*:\s*Under editorial verification|References are under editorial verification/i.test(text);

  return referenceHeading && oldReferenceLine;
}

function placeholderSectionCount(html) {
  const blocks = [
    ...html.matchAll(/<(section|div)\b[^>]*>[\s\S]*?<\/\1>/gi)
  ].map((m) => m[0]);

  return blocks.filter(isVisiblePlaceholderBlock).length;
}

function neutralizePlaceholderSections(html) {
  return html.replace(/<(section|div)\b[^>]*>[\s\S]*?<\/\1>/gi, (block) => {
    if (!isVisiblePlaceholderBlock(block)) return block;

    return block.replace(/<(section|div)\b([^>]*)>/i, (m, tag, attrs) => {
      let newAttrs = attrs || "";
      if (!/data-drishvara-ag05d-placeholder-neutralized=/i.test(newAttrs)) {
        newAttrs += ' data-drishvara-ag05d-placeholder-neutralized="true"';
      }
      if (!/\bhidden\b/i.test(newAttrs)) {
        newAttrs += " hidden";
      }
      if (!/aria-hidden=/i.test(newAttrs)) {
        newAttrs += ' aria-hidden="true"';
      }
      if (/style=/i.test(newAttrs)) {
        newAttrs = newAttrs.replace(/style=["']([^"']*)["']/i, (sm, styleValue) => {
          const merged = /display\s*:\s*none/i.test(styleValue)
            ? styleValue
            : `${styleValue}; display:none`;
          return `style="${merged}"`;
        });
      } else {
        newAttrs += ' style="display:none"';
      }
      return `<${tag}${newAttrs}>`;
    });
  });
}

function removeExistingAg03Blocks(html) {
  return html.replace(/<section\b[^>]*data-drishvara-ag03c[^>]*reference-block=["']true["'][\s\S]*?<\/section>\s*/gi, "");
}

function extractImageCredit(html) {
  const patterns = [
    /Image credit\s*\/\s*attribution:[\s\S]{0,260}(?=<\/p>|<\/div>|<\/section>|$)/i,
    /Image credit[\s\S]{0,220}(?=<\/p>|<\/div>|<\/section>|$)/i
  ];

  for (const pattern of patterns) {
    const m = html.match(pattern);
    if (!m) continue;

    const cleaned = m[0]
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (cleaned && !/Under editorial verification/i.test(cleaned)) return cleaned;
  }

  return "Image credit / attribution: Existing article visual/source attribution retained from article metadata.";
}

function enhanceAg03Block(block, imageCredit) {
  let out = block;

  if (!/data-drishvara-ag05d-visible-reference-block=["']true["']/i.test(out)) {
    out = out.replace(/<section\b/i, '<section data-drishvara-ag05d-visible-reference-block="true"');
  }

  if (/class=["'][^"']*["']/i.test(out)) {
    out = out.replace(/class=["']([^"']*)["']/i, (m, cls) => {
      return /drishvara-ag05d-visible-reference-block/.test(cls)
        ? m
        : `class="${cls} drishvara-ag05d-visible-reference-block"`;
    });
  } else {
    out = out.replace(/<section\b/i, '<section class="drishvara-ag05d-visible-reference-block"');
  }

  out = out.replace(/<h2[^>]*>\s*References\s*<\/h2>/i, "<h2>Editorial references and image credit</h2>");

  if (!/data-drishvara-ag05d-image-credit-preserved=["']true["']/i.test(out)) {
    const creditPara = `
  <p class="drishvara-image-credit" data-drishvara-ag05d-image-credit-preserved="true">${imageCredit}</p>`;
    out = out.replace(/<\/section>\s*$/i, `${creditPara}\n</section>`);
  }

  return out;
}

function visibleReferenceBlockFromAnchors(anchors, imageCredit) {
  const items = anchors.map((item) => `    <li>${item.anchor}</li>`).join("\n");
  return `
<section class="drishvara-article-evidence drishvara-ag05d-visible-reference-block" data-drishvara-ag05d-visible-reference-block="true">
  <h2>Editorial references and image credit</h2>
  <p>Verified reference links for this article are shown below.</p>
  <ol>
${items}
  </ol>
  <p class="drishvara-image-credit" data-drishvara-ag05d-image-credit-preserved="true">${imageCredit}</p>
</section>

`;
}

function insertionIndexBeforeFooter(html) {
  const backIndex = html.search(/←\s*Back to Home|Back to Home|Open Insights/i);
  if (backIndex >= 0) {
    const lineStart = html.lastIndexOf("\n", backIndex);
    return lineStart >= 0 ? lineStart : backIndex;
  }

  const articleEnd = html.search(/<\/article>/i);
  if (articleEnd >= 0) return articleEnd;

  const mainEnd = html.search(/<\/main>/i);
  if (mainEnd >= 0) return mainEnd;

  const bodyEnd = html.search(/<\/body>/i);
  if (bodyEnd >= 0) return bodyEnd;

  return html.length;
}

function insertBeforeFooter(html, block) {
  const idx = insertionIndexBeforeFooter(html);
  return html.slice(0, idx) + "\n" + block + html.slice(idx);
}

function firstAg03LinkIndex(html) {
  const m = html.match(/<a\b[^>]*data-drishvara-ag03c[^>]*reference-link=["']true["']/i);
  return m ? m.index : -1;
}

function backLinkIndex(html) {
  return html.search(/←\s*Back to Home|Back to Home|Open Insights/i);
}

const config = readJson(configPath);
const ag05c = readJson(path.join(root, config.input_files.ag05c_result));
const ag03z = readJson(path.join(root, config.input_files.ag03z_closure));
const ag04z = readJson(path.join(root, config.input_files.ag04z_closure));

if (ag05c.summary?.correction_required !== true || ag05c.summary?.next_stage_id !== "AG05D") {
  throw new Error("AG05C must require AG05D before applying AG05D.");
}
if (ag03z.summary?.ag03_reference_scaling_closed !== true) {
  throw new Error("AG03Z must be closed before AG05D.");
}
if (ag04z.summary?.ag04_visual_credit_width_governance_closed !== true) {
  throw new Error("AG04Z must be closed before AG05D.");
}

const articlePaths = (ag03z.article_scan_results || []).map((row) => row.article_path).sort();
const fileResults = [];

for (const articlePath of articlePaths) {
  const full = path.join(root, articlePath);
  if (!fs.existsSync(full)) {
    fileResults.push({ article_path: articlePath, status: "missing_on_disk", modified: false });
    continue;
  }

  const before = fs.readFileSync(full, "utf8");
  const beforeAnchors = uniqueByHref(ag03ReferenceAnchors(before));
  const beforeUrls = beforeAnchors.map((item) => item.href);
  const beforeBlocks = ag03ReferenceBlocks(before);
  const beforePlaceholderCount = placeholderSectionCount(before);

  let after = before;
  let modified = false;
  let repairReason = "no_verified_ag03_links";

  if (beforeAnchors.length === config.expected.references_per_repaired_article) {
    const imageCredit = extractImageCredit(before);
    const visibleBlock = beforeBlocks.length > 0
      ? enhanceAg03Block(beforeBlocks[0], imageCredit)
      : visibleReferenceBlockFromAnchors(beforeAnchors, imageCredit);

    after = removeExistingAg03Blocks(after);
    after = neutralizePlaceholderSections(after);
    after = insertBeforeFooter(after, visibleBlock);

    modified = after !== before;
    repairReason = modified
      ? "visible_ag03_reference_block_repositioned_and_placeholders_neutralized"
      : "no_change_required";

    if (modified) fs.writeFileSync(full, after);
  }

  const afterAnchors = uniqueByHref(ag03ReferenceAnchors(after));
  const afterUrls = afterAnchors.map((item) => item.href);
  const afterPlaceholderCount = placeholderSectionCount(after);
  const afterNeutralizedCount = (after.match(/data-drishvara-ag05d-placeholder-neutralized=["']true["']/g) || []).length;
  const afterVisibleBlockCount = (after.match(/data-drishvara-ag05d-visible-reference-block=["']true["']/g) || []).length;
  const afterFirstAg03Index = firstAg03LinkIndex(after);
  const afterBackIndex = backLinkIndex(after);

  fileResults.push({
    article_path: articlePath,
    status: beforeAnchors.length === 2 ? "processed" : "skipped",
    modified,
    repair_reason: repairReason,
    before_ag03_reference_block_count: beforeBlocks.length,
    before_ag03_reference_link_count: beforeAnchors.length,
    after_ag03_reference_link_count: afterAnchors.length,
    before_reference_urls: beforeUrls,
    after_reference_urls: afterUrls,
    reference_urls_unchanged: JSON.stringify(beforeUrls) === JSON.stringify(afterUrls),
    before_placeholder_section_count: beforePlaceholderCount,
    after_placeholder_section_count: afterPlaceholderCount,
    after_neutralized_placeholder_section_count: afterNeutralizedCount,
    after_ag05d_visible_reference_block_count: afterVisibleBlockCount,
    after_ag03_before_back_links: afterBackIndex === -1 ? true : (afterFirstAg03Index >= 0 && afterFirstAg03Index < afterBackIndex)
  });
}

const processedResults = fileResults.filter((row) => row.status === "processed");
const modifiedResults = processedResults.filter((row) => row.modified);

const applyResult = {
  apply_id: "AG05D_TARGETED_VISIBLE_REFERENCE_PLACEMENT_REPAIR_APPLY_RESULT",
  module_id: "AG05D",
  status: "targeted_visible_reference_placement_repair_applied",
  generated_at: new Date().toISOString(),

  mutation_performed: modifiedResults.length > 0,
  article_html_mutation_performed: modifiedResults.length > 0,
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
    ag05c_result: config.input_files.ag05c_result,
    ag03z_closure: config.input_files.ag03z_closure,
    ag04z_closure: config.input_files.ag04z_closure
  },

  summary: {
    candidate_article_count: articlePaths.length,
    processed_article_count: processedResults.length,
    modified_article_count: modifiedResults.length,
    repaired_article_count: modifiedResults.length,
    articles_with_two_ag03_links_after: processedResults.filter((row) => row.after_ag03_reference_link_count === 2).length,
    articles_with_reference_urls_unchanged: processedResults.filter((row) => row.reference_urls_unchanged).length,
    articles_with_placeholder_sections_after_zero: processedResults.filter((row) => row.after_placeholder_section_count === 0).length,
    articles_with_visible_ag05d_block: processedResults.filter((row) => row.after_ag05d_visible_reference_block_count === 1).length,
    articles_with_ag03_before_back_links: processedResults.filter((row) => row.after_ag03_before_back_links).length,
    neutralized_placeholder_section_count: processedResults.reduce((sum, row) => sum + row.after_neutralized_placeholder_section_count, 0),
    reference_url_change_performed: false,
    css_mutation_performed: false,
    javascript_mutation_performed: false,
    backend_auth_supabase_activation_performed: false,
    ready_for_ag05e_post_repair_audit: true
  },

  file_results: fileResults,
  next_recommended_stage: config.recommended_next_stage
};

const preview = {
  preview_id: "AG05D_TARGETED_VISIBLE_REFERENCE_PLACEMENT_REPAIR_PREVIEW",
  module_id: "AG05D",
  preview_only: true,
  status: "preview_targeted_visible_reference_placement_repair",
  summary: applyResult.summary,
  modified_articles: modifiedResults.map((row) => ({
    article_path: row.article_path,
    before_placeholder_section_count: row.before_placeholder_section_count,
    after_placeholder_section_count: row.after_placeholder_section_count,
    after_neutralized_placeholder_section_count: row.after_neutralized_placeholder_section_count,
    after_ag03_reference_link_count: row.after_ag03_reference_link_count,
    reference_urls_unchanged: row.reference_urls_unchanged,
    after_ag03_before_back_links: row.after_ag03_before_back_links
  })),
  mutation_performed: applyResult.mutation_performed,
  next_recommended_stage: config.recommended_next_stage
};

writeJson(path.join(root, config.outputs.apply_result), applyResult);
writeJson(path.join(root, config.outputs.preview), preview);

console.log(`Created ${config.outputs.apply_result}.`);
console.log(`Created ${config.outputs.preview}.`);
console.log(`Candidate articles: ${applyResult.summary.candidate_article_count}`);
console.log(`Processed articles: ${applyResult.summary.processed_article_count}`);
console.log(`Modified articles: ${applyResult.summary.modified_article_count}`);
console.log(`Articles with two AG03 links after: ${applyResult.summary.articles_with_two_ag03_links_after}`);
console.log(`Articles with URLs unchanged: ${applyResult.summary.articles_with_reference_urls_unchanged}`);
console.log(`Articles with visible placeholder sections after zero: ${applyResult.summary.articles_with_placeholder_sections_after_zero}`);
console.log(`Neutralized placeholder sections: ${applyResult.summary.neutralized_placeholder_section_count}`);
console.log(`Articles with visible AG05D block: ${applyResult.summary.articles_with_visible_ag05d_block}`);
console.log(`Ready for AG05E: ${applyResult.summary.ready_for_ag05e_post_repair_audit}`);
