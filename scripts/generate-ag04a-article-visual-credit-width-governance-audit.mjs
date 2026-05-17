import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const configPath = path.join(root, "data", "quality", "ag04a-article-visual-credit-width-governance-audit.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

function listFiles(dir, ext) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listFiles(p, ext));
    } else if (entry.isFile() && p.toLowerCase().endsWith(ext)) {
      results.push(p);
    }
  }
  return results;
}

function rel(p) {
  return path.relative(root, p).replaceAll(path.sep, "/");
}

function countAg03ReferenceLinks(html) {
  return (html.match(/data-drishvara-ag03c[^=\s>"]*reference-link=["']true["']/g) || []).length;
}

function countAg03ReferenceBlocks(html) {
  return (html.match(/data-drishvara-ag03c[^=\s>"]*reference-block=["']true["']/g) || []).length;
}

function extractSrcs(html) {
  const srcs = [];

  for (const m of html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)) {
    srcs.push({ src: m[1], source: "img" });
  }

  for (const m of html.matchAll(/<source\b[^>]*\bsrcset=["']([^"']+)["'][^>]*>/gi)) {
    const first = String(m[1]).split(",")[0].trim().split(/\s+/)[0];
    if (first) srcs.push({ src: first, source: "source-srcset" });
  }

  for (const m of html.matchAll(/url\(["']?([^"')]+)["']?\)/gi)) {
    srcs.push({ src: m[1], source: "css-url" });
  }

  return [...new Map(srcs.map((item) => [`${item.source}:${item.src}`, item])).values()];
}

function isImageLike(src) {
  return /\.(png|jpe?g|webp|svg|gif|avif)(\?|#|$)/i.test(src);
}

function isLikelyLogoOrBrand(src) {
  const s = String(src || "").toLowerCase();
  return /logo|favicon|apple-touch|brand|seal|mark|emblem|icon/.test(s);
}

function isLikelyArticleVisual(src) {
  const s = String(src || "").toLowerCase();
  if (!isImageLike(s)) return false;
  if (isLikelyLogoOrBrand(s)) return false;
  return /article|visual|hero|media|policy|spiritual|sports|world|generated|image|photo|assets\/article|assets\/images|assets\/hero/.test(s) || isImageLike(s);
}

function extractMaxWidthSignals(text) {
  const signals = [];
  for (const m of text.matchAll(/max-width\s*:\s*([0-9.]+)\s*(px|rem|ch|%)/gi)) {
    const value = Number(m[1]);
    const unit = m[2].toLowerCase();
    let broad = false;
    if (unit === "px" && value >= 900) broad = true;
    if (unit === "rem" && value >= 56) broad = true;
    if (unit === "ch" && value >= 85) broad = true;
    if (unit === "%" && value >= 85) broad = true;
    signals.push({ value, unit, broad });
  }
  return signals;
}

function hasJustifySignal(text) {
  return /text-align\s*:\s*justify|text-align-justify|\bjustify\b/i.test(text);
}

function cssGovernanceSignals() {
  const cssFiles = [
    ...listFiles(path.join(root, "assets"), ".css"),
    ...listFiles(root, ".css").filter((p) => !p.includes(`${path.sep}node_modules${path.sep}`))
  ];

  const fileResults = cssFiles.map((file) => {
    const text = fs.readFileSync(file, "utf8");
    const maxWidthSignals = extractMaxWidthSignals(text);
    return {
      file_path: rel(file),
      max_width_signals: maxWidthSignals,
      has_broad_width_signal: maxWidthSignals.some((s) => s.broad),
      has_justify_signal: hasJustifySignal(text),
      has_article_selector_signal: /article|post|reading|content|prose|drishvara-article|article-body|article-content/i.test(text)
    };
  });

  return {
    css_file_count: fileResults.length,
    files_with_broad_width_signal: fileResults.filter((r) => r.has_broad_width_signal).length,
    files_with_justify_signal: fileResults.filter((r) => r.has_justify_signal).length,
    files_with_article_selector_signal: fileResults.filter((r) => r.has_article_selector_signal).length,
    global_broad_width_signal_present: fileResults.some((r) => r.has_broad_width_signal && r.has_article_selector_signal),
    global_justify_signal_present: fileResults.some((r) => r.has_justify_signal && r.has_article_selector_signal),
    css_files: fileResults
  };
}

const config = readJson(configPath);
const ag03z = readJson(path.join(root, config.input_files.ag03z_closure_audit));

if (ag03z.summary?.ag03_reference_scaling_closed !== true) {
  throw new Error("AG03Z must be closed before AG04A audit.");
}

const completedArticlePaths = (ag03z.article_scan_results || []).map((row) => row.article_path).sort();
const cssSignals = cssGovernanceSignals();

const articleResults = completedArticlePaths.map((articlePath) => {
  const full = path.join(root, articlePath);
  if (!fs.existsSync(full)) throw new Error(`AG04A article missing on disk: ${articlePath}`);

  const html = fs.readFileSync(full, "utf8");
  const srcs = extractSrcs(html);
  const imageSrcs = srcs.filter((item) => isImageLike(item.src));
  const probableLogoSrcs = imageSrcs.filter((item) => isLikelyLogoOrBrand(item.src));
  const likelyArticleVisualSrcs = imageSrcs.filter((item) => isLikelyArticleVisual(item.src));

  const hasAg02HeroMarker = html.includes('data-drishvara-ag02-hero-visual="true"');
  const hasAg02CreditMarker = html.includes('data-drishvara-ag02-image-credit="true"');
  const hasGenericCreditText = /image\s*(credit|source|attribution)|photo\s*(credit|source|attribution)|visual\s*(credit|source|attribution)|source\s*:/i.test(html);

  const htmlMaxWidthSignals = extractMaxWidthSignals(html);
  const htmlHasBroadWidthSignal = htmlMaxWidthSignals.some((s) => s.broad);
  const htmlHasJustifySignal = hasJustifySignal(html);

  const ag03ReferenceLinkCount = countAg03ReferenceLinks(html);
  const ag03ReferenceBlockCount = countAg03ReferenceBlocks(html);

  const hasUsableArticleVisual = hasAg02HeroMarker || likelyArticleVisualSrcs.length > 0;
  const probableLogoFallbackVisual = probableLogoSrcs.length > 0 && likelyArticleVisualSrcs.length === 0 && !hasAg02HeroMarker;
  const hasImageCredit = hasAg02CreditMarker || hasGenericCreditText;
  const readingWidthAppearsAligned = (htmlHasBroadWidthSignal || cssSignals.global_broad_width_signal_present) &&
    (htmlHasJustifySignal || cssSignals.global_justify_signal_present);

  const issueTypes = [];
  if (!hasUsableArticleVisual) issueTypes.push("missing_article_visual");
  if (probableLogoFallbackVisual) issueTypes.push("probable_default_logo_or_brand_visual");
  if (!hasImageCredit) issueTypes.push("missing_image_credit_or_source");
  if (!readingWidthAppearsAligned) issueTypes.push("reading_width_or_justification_needs_review");
  if (ag03ReferenceLinkCount !== config.expected.references_per_article) issueTypes.push("ag03_reference_integrity_drift");

  return {
    article_path: articlePath,
    ag03_reference_link_count: ag03ReferenceLinkCount,
    ag03_reference_block_count: ag03ReferenceBlockCount,
    ag03_integrity_status: ag03ReferenceLinkCount === config.expected.references_per_article ? "passed" : "failed",

    has_ag02_hero_marker: hasAg02HeroMarker,
    image_src_count: imageSrcs.length,
    likely_article_visual_src_count: likelyArticleVisualSrcs.length,
    probable_logo_or_brand_src_count: probableLogoSrcs.length,
    likely_article_visual_srcs: likelyArticleVisualSrcs.map((item) => item.src),
    probable_logo_or_brand_srcs: probableLogoSrcs.map((item) => item.src),
    has_usable_article_visual: hasUsableArticleVisual,
    probable_logo_fallback_visual: probableLogoFallbackVisual,

    has_ag02_image_credit_marker: hasAg02CreditMarker,
    has_generic_credit_text: hasGenericCreditText,
    has_image_credit_or_source: hasImageCredit,

    html_broad_width_signal_present: htmlHasBroadWidthSignal,
    html_justify_signal_present: htmlHasJustifySignal,
    global_css_broad_width_signal_present: cssSignals.global_broad_width_signal_present,
    global_css_justify_signal_present: cssSignals.global_justify_signal_present,
    reading_width_appears_aligned: readingWidthAppearsAligned,

    issue_types: issueTypes,
    needs_ag04b_follow_up: issueTypes.length > 0
  };
});

const issueQueue = articleResults
  .filter((row) => row.needs_ag04b_follow_up)
  .map((row) => ({
    article_path: row.article_path,
    issue_types: row.issue_types,
    has_usable_article_visual: row.has_usable_article_visual,
    probable_logo_fallback_visual: row.probable_logo_fallback_visual,
    has_image_credit_or_source: row.has_image_credit_or_source,
    reading_width_appears_aligned: row.reading_width_appears_aligned,
    ag03_integrity_status: row.ag03_integrity_status
  }));

const issueTypeCounts = {};
for (const issueType of config.issue_types) {
  issueTypeCounts[issueType] = issueQueue.filter((row) => row.issue_types.includes(issueType)).length;
}

const audit = {
  audit_id: "AG04A_ARTICLE_VISUAL_CREDIT_WIDTH_GOVERNANCE_AUDIT",
  module_id: "AG04A",
  status: "article_visual_credit_width_governance_audit_completed",
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
    ag03z_audit: config.input_files.ag03z_closure_audit,
    ag03z_closed: ag03z.summary.ag03_reference_scaling_closed === true,
    ag03z_article_count: ag03z.summary.live_scanned_completed_article_count,
    ag03z_reference_count: ag03z.summary.live_ag03_reference_link_count
  },

  summary: {
    scanned_article_count: articleResults.length,
    expected_article_count: config.expected.article_count,
    live_ag03_reference_link_count: articleResults.reduce((sum, row) => sum + row.ag03_reference_link_count, 0),
    expected_ag03_reference_link_count: config.expected.ag03_reference_link_count,
    articles_with_exactly_two_ag03_links: articleResults.filter((row) => row.ag03_reference_link_count === config.expected.references_per_article).length,
    articles_with_usable_article_visual: articleResults.filter((row) => row.has_usable_article_visual).length,
    articles_with_probable_logo_fallback_visual: articleResults.filter((row) => row.probable_logo_fallback_visual).length,
    articles_with_image_credit_or_source: articleResults.filter((row) => row.has_image_credit_or_source).length,
    articles_with_reading_width_aligned: articleResults.filter((row) => row.reading_width_appears_aligned).length,
    ag04b_follow_up_article_count: issueQueue.length,
    issue_type_counts: issueTypeCounts,
    ag03_integrity_preserved: articleResults.every((row) => row.ag03_reference_link_count === config.expected.references_per_article),
    audit_only_no_mutation: true,
    ready_for_ag04b_targeted_correction: true
  },

  css_governance_signals: cssSignals,
  article_results: articleResults,
  ag04b_issue_queue: issueQueue,
  blocked_capabilities: config.blocked_capabilities,
  next_recommended_stage: config.recommended_next_stage
};

const preview = {
  preview_id: "AG04A_ARTICLE_VISUAL_CREDIT_WIDTH_GOVERNANCE_PREVIEW",
  module_id: "AG04A",
  status: "preview_article_visual_credit_width_governance_audit",
  preview_only: true,
  summary: audit.summary,
  css_governance_summary: {
    css_file_count: cssSignals.css_file_count,
    global_broad_width_signal_present: cssSignals.global_broad_width_signal_present,
    global_justify_signal_present: cssSignals.global_justify_signal_present
  },
  first_20_issue_queue_entries: issueQueue.slice(0, 20),
  mutation_performed: false,
  next_recommended_stage: config.recommended_next_stage
};

writeJson(path.join(root, config.outputs.audit), audit);
writeJson(path.join(root, config.outputs.preview), preview);

console.log(`Created ${config.outputs.audit}.`);
console.log(`Created ${config.outputs.preview}.`);
console.log(`Scanned articles: ${audit.summary.scanned_article_count}`);
console.log(`Live AG03 reference links: ${audit.summary.live_ag03_reference_link_count}`);
console.log(`Articles with exactly two AG03 links: ${audit.summary.articles_with_exactly_two_ag03_links}`);
console.log(`Articles with usable article visual: ${audit.summary.articles_with_usable_article_visual}`);
console.log(`Articles with probable logo fallback visual: ${audit.summary.articles_with_probable_logo_fallback_visual}`);
console.log(`Articles with image credit/source: ${audit.summary.articles_with_image_credit_or_source}`);
console.log(`Articles with reading width aligned: ${audit.summary.articles_with_reading_width_aligned}`);
console.log(`AG04B follow-up article count: ${audit.summary.ag04b_follow_up_article_count}`);
console.log(`AG03 integrity preserved: ${audit.summary.ag03_integrity_preserved}`);
console.log("Mutation performed: false");
