import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ag02r1-existing-homepage-article-visual-source-integration.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

function decodeSafe(value) {
  try { return decodeURIComponent(value); } catch { return value; }
}

function normalizeArticlePathFromHref(href) {
  if (!href) return null;
  const raw = String(href || "").replaceAll("&amp;", "&");
  const decoded = decodeSafe(raw);
  const m = decoded.match(/(articles\/[^"'&?#]+\.html)/i);
  return m ? m[1] : null;
}

function stripAg02r1Markers(html) {
  return html
    .replace(/<meta\b[^>]*data-drishvara-ag02r1-checked="true"[^>]*>\s*/gi, "")
    .replace(/\s*data-drishvara-ag02r1-homepage-visual="true"/gi, "");
}

function count(html, marker) {
  return (html.match(new RegExp(marker, "g")) || []).length;
}

const config = readJson(registryPath);
const ag02Apply = readJson(path.join(root, config.input_ag02_apply_result));
const ar02b = fs.existsSync(path.join(root, config.input_ar02b_sample_registry))
  ? readJson(path.join(root, config.input_ar02b_sample_registry))
  : { entries: [] };

const indexHtml = fs.existsSync(path.join(root, config.input_index))
  ? fs.readFileSync(path.join(root, config.input_index), "utf8")
  : "";

const ag02TargetPaths = new Set((ag02Apply.file_results || []).map((row) => row.article_path));
const articleHrefs = [...indexHtml.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)]
  .map((m) => ({ href: m[1], article_path: normalizeArticlePathFromHref(m[1]) }))
  .filter((x) => x.article_path);

const overlaps = articleHrefs.filter((x) => ag02TargetPaths.has(x.article_path));

const expectedSampleRefs = new Map((ar02b.entries || []).map((entry) => [
  entry.article_path,
  (entry.references || []).map((ref) => ref.url)
]));

const cleanedFiles = [];
const fileResults = [];

for (const rel of ag02TargetPaths) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) continue;

  const before = fs.readFileSync(full, "utf8");
  const html = stripAg02r1Markers(before);

  if (html !== before) {
    fs.writeFileSync(full, html);
    cleanedFiles.push(rel);
  }

  const expectedRefs = expectedSampleRefs.get(rel) || [];

  fileResults.push({
    article_path: rel,
    homepage_visual_available: false,
    homepage_visual_applied: false,
    fallback_retained: true,
    ag02_hero_count: count(html, 'data-drishvara-ag02-hero-visual="true"'),
    ag02_credit_count: count(html, 'data-drishvara-ag02-image-credit="true"'),
    ar02c_reference_link_count: count(html, 'data-drishvara-ar02c-reference-link="true"'),
    ar02c_block_count: count(html, 'data-drishvara-ar02c-sample-reference-block="true"'),
    sample_references_preserved: expectedRefs.every((url) => html.includes(url)),
    reference_urls_changed: false
  });
}

const sourceMap = {
  registry_id: "AG02R1_EXISTING_HOMEPAGE_ARTICLE_VISUAL_SOURCE_MAP",
  module_id: "AG02R1",
  status: "not_applicable_no_static_homepage_article_hrefs",
  source_index: config.input_index,
  ag02_target_count: ag02TargetPaths.size,
  homepage_article_href_count: articleHrefs.length,
  homepage_ag02_target_overlap_count: overlaps.length,
  mapped_article_count: 0,
  mapping_rule: "strict_static_homepage_article_href_required",
  decision: "No article-card visual integration applied because index.html has no static article hrefs matching AG02 targets.",
  entries: [],
  diagnostics: {
    detected_article_hrefs: articleHrefs.slice(0, 25),
    overlapping_ag02_target_hrefs: overlaps.slice(0, 25)
  }
};

const applyResult = {
  apply_id: "AG02R1_EXISTING_HOMEPAGE_ARTICLE_VISUAL_SOURCE_INTEGRATION_APPLY_RESULT",
  module_id: "AG02R1",
  status: "diagnostic_no_applicable_static_homepage_visual_source",
  applied: false,
  modified_files: cleanedFiles,
  file_results: fileResults,
  summary: {
    ag02_target_count: ag02TargetPaths.size,
    homepage_article_href_count: articleHrefs.length,
    homepage_ag02_target_overlap_count: overlaps.length,
    homepage_visual_mapped_count: 0,
    homepage_visual_applied_count: 0,
    fallback_retained_count: ag02TargetPaths.size,
    strict_mapping_rule_used: true,
    mapping_not_applicable_no_static_homepage_article_hrefs: overlaps.length === 0,
    cleaned_failed_ag02r1_marker_file_count: cleanedFiles.length,
    every_target_has_ag02_hero: fileResults.every((row) => row.ag02_hero_count >= 1),
    every_target_has_ag02_credit: fileResults.every((row) => row.ag02_credit_count >= 1),
    ar02c_sample_references_preserved: fileResults.every((row) => row.sample_references_preserved),
    reference_url_change_performed: false,
    article_text_mutation_performed: false,
    article_word_count_reduction_performed: false,
    article_word_count_expansion_performed: false,
    new_reference_insertion_performed: false,
    external_fetch_performed: false,
    external_asset_fetch_performed: false,
    backend_activation_performed: false,
    api_route_created: false,
    supabase_enabled: false,
    auth_enabled: false,
    real_login_enabled: false,
    real_signup_enabled: false,
    user_account_collection_enabled: false,
    frontend_deployment_performed: false,
    file_deletion_performed: false,
    file_move_performed: false
  },
  blocked_capabilities: config.blocked_capabilities
};

writeJson(path.join(root, config.output_visual_source_map), sourceMap);
writeJson(path.join(root, config.apply_result_output), applyResult);

console.log(`Created ${config.output_visual_source_map}.`);
console.log(`Created ${config.apply_result_output}.`);
console.log(`AG02 targets: ${applyResult.summary.ag02_target_count}`);
console.log(`Homepage article hrefs: ${applyResult.summary.homepage_article_href_count}`);
console.log(`Homepage AG02 target overlaps: ${applyResult.summary.homepage_ag02_target_overlap_count}`);
console.log(`Homepage visual mapped: ${applyResult.summary.homepage_visual_mapped_count}`);
console.log(`Homepage visual applied: ${applyResult.summary.homepage_visual_applied_count}`);
console.log(`Fallback retained: ${applyResult.summary.fallback_retained_count}`);
console.log(`Mapping not applicable: ${applyResult.summary.mapping_not_applicable_no_static_homepage_article_hrefs}`);
console.log(`Reference URLs changed: ${applyResult.summary.reference_url_change_performed}`);
console.log(`AR02C sample references preserved: ${applyResult.summary.ar02c_sample_references_preserved}`);
