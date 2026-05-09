import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ag02-article-image-credit-source-of-truth-repair.json");
const ag01AuditPath = path.join(root, "data", "editorial", "ag01-article-governance-source-of-truth-audit.json");
const ar02bSamplePath = path.join(root, "data", "editorial", "ar02b-sample-verified-reference-candidates.json");
const outputRegistryPath = path.join(root, "data", "editorial", "ag02-article-image-credit-source-of-truth-registry.json");
const applyOutPath = path.join(root, "data", "quality", "ag02-article-image-credit-source-of-truth-apply-result.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

function escHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escXml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function categoryTitle(category) {
  return {
    media: "Media & Society",
    policy: "Public Programmes",
    spiritual: "Spirituality",
    sports: "Sports",
    world: "World Affairs"
  }[category] || "Drishvara";
}

function categorySubtitle(category) {
  return {
    media: "Information, representation and public understanding",
    policy: "Governance, institutions and public service",
    spiritual: "Reflection, practice and inner growth",
    sports: "Performance, discipline and human excellence",
    world: "Global affairs, strategy and public consequence"
  }[category] || "Civilizational intelligence";
}

function makeSvg(category) {
  const title = escXml(categoryTitle(category));
  const subtitle = escXml(categorySubtitle(category));
  const label = escXml(String(category).toUpperCase());

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 760" role="img" aria-label="${title}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#071329"/>
      <stop offset="45%" stop-color="#102247"/>
      <stop offset="100%" stop-color="#071329"/>
    </linearGradient>
    <radialGradient id="glow" cx="52%" cy="38%" r="58%">
      <stop offset="0%" stop-color="#d7ad45" stop-opacity="0.26"/>
      <stop offset="100%" stop-color="#d7ad45" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffe38a"/>
      <stop offset="55%" stop-color="#d7ad45"/>
      <stop offset="100%" stop-color="#8d6819"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="760" rx="48" fill="url(#bg)"/>
  <rect width="1600" height="760" rx="48" fill="url(#glow)"/>
  <path d="M150 520 C430 345, 710 315, 1450 245" fill="none" stroke="url(#gold)" stroke-width="10" opacity="0.62"/>
  <path d="M180 600 C470 428, 805 390, 1410 365" fill="none" stroke="url(#gold)" stroke-width="5" opacity="0.36"/>
  <circle cx="315" cy="235" r="84" fill="none" stroke="#d7ad45" stroke-width="3" opacity="0.22"/>
  <circle cx="1280" cy="540" r="124" fill="none" stroke="#d7ad45" stroke-width="3" opacity="0.18"/>
  <text x="130" y="220" fill="#d7ad45" font-family="Georgia, serif" font-size="34" letter-spacing="8">${label}</text>
  <text x="130" y="322" fill="#f8f1df" font-family="Georgia, serif" font-size="82" font-weight="700">${title}</text>
  <text x="130" y="400" fill="#c9d1df" font-family="Georgia, serif" font-size="32">${subtitle}</text>
  <text x="130" y="640" fill="#d7ad45" font-family="Georgia, serif" font-size="24" letter-spacing="5">DRISHVARA READING SURFACE</text>
</svg>`;
}

function ensureFallbackAssets(config) {
  for (const [category, rel] of Object.entries(config.category_fallback_assets)) {
    const full = path.join(root, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, makeSvg(category), "utf8");
  }
}

function fallbackFor(category, config) {
  return "/" + config.category_fallback_assets[category].replace(/^\/+/, "");
}

function stripAG02(html) {
  html = html.replace(/<style\b[^>]*data-drishvara-ag02-image-credit-repair-style[^>]*>[\s\S]*?<\/style>\s*/gi, "");
  html = html.replace(/<meta\b[^>]*data-drishvara-ag02-checked[^>]*>\s*/gi, "");
  html = html.replace(/<figure\b[^>]*data-drishvara-ag02-hero-visual="true"[^>]*>[\s\S]*?<\/figure>\s*/gi, "");
  return html;
}

function insertBeforeHeadClose(html, block) {
  if (html.includes("</head>")) return html.replace("</head>", `${block}\n</head>`);
  return `${block}\n${html}`;
}

function ag02Style() {
  return `<style data-drishvara-ag02-image-credit-repair-style="true">
/* AG02: source-of-truth category hero fallback for AG01 image gaps */
figure[data-drishvara-ag02-hero-visual="true"] {
  width: min(100%, 1120px);
  margin: 0 auto 2rem;
}

figure[data-drishvara-ag02-hero-visual="true"] img {
  width: 100% !important;
  max-height: 560px !important;
  object-fit: cover !important;
  display: block !important;
  border-radius: 18px;
  border: 1px solid rgba(215, 173, 69, 0.18);
  background: rgba(7, 19, 41, 0.55);
}

figcaption[data-drishvara-ag02-image-credit="true"] {
  margin-top: 0.6rem;
  color: rgba(248, 241, 223, 0.62);
  font-size: 0.9rem;
  text-align: center;
}
</style>`;
}

function markChecked(html) {
  if (html.includes('data-drishvara-ag02-checked="true"')) return html;
  const marker = '<meta data-drishvara-ag02-checked="true" content="image-credit-source-of-truth-repaired">';
  return insertBeforeHeadClose(html, marker);
}

function firstBodyParagraphIndexAfterTitle(html) {
  const h1 = html.search(/<h1\b/i);
  const start = h1 >= 0 ? h1 : 0;
  const afterTitle = html.slice(start);
  const pMatch = afterTitle.match(/<p\b[^>]*>/i);
  if (!pMatch || typeof pMatch.index !== "number") return -1;
  return start + pMatch.index;
}

function heroFigure(entry, fallbackSrc, creditText) {
  const category = categoryTitle(entry.category);
  const alt = `${category} article visual for Drishvara`;
  return `<figure class="drishvara-ag02-hero-visual" data-drishvara-ag02-hero-visual="true" data-drishvara-ag02-category="${escHtml(entry.category)}">
  <img src="${escHtml(fallbackSrc)}" alt="${escHtml(alt)}" loading="lazy" decoding="async">
  <figcaption data-drishvara-ag02-image-credit="true">${escHtml(creditText)}</figcaption>
</figure>
`;
}

function insertHeroFigure(html, entry, fallbackSrc, creditText) {
  const figure = heroFigure(entry, fallbackSrc, creditText);
  const index = firstBodyParagraphIndexAfterTitle(html);

  if (index >= 0) {
    return html.slice(0, index) + figure + html.slice(index);
  }

  const mainClose = html.search(/<\/main>/i);
  if (mainClose >= 0) {
    return html.slice(0, mainClose) + figure + html.slice(mainClose);
  }

  return html + "\n" + figure;
}

function updateExistingCreditBlocks(html, creditText) {
  let updatedCount = 0;

  html = html.replace(/<div\b([^>]*)data-drishvara-ar02c-image-credit="true"([^>]*)>[\s\S]*?<\/div>/gi, (block, a, b) => {
    updatedCount += 1;
    const attrs = `${a}data-drishvara-ar02c-image-credit="true"${b}`;
    const hasAg02 = /data-drishvara-ag02-image-credit=/i.test(attrs);
    const finalAttrs = hasAg02 ? attrs : `${attrs} data-drishvara-ag02-image-credit="true"`;
    return `<div${finalAttrs}>${escHtml(creditText)}</div>`;
  });

  html = html.replace(/<div\b([^>]*)data-drishvara-ar01-image-credit="true"([^>]*)>[\s\S]*?<\/div>/gi, (block, a, b) => {
    if (/data-drishvara-ar02c-image-credit="true"/i.test(block)) return block;
    updatedCount += 1;
    const attrs = `${a}data-drishvara-ar01-image-credit="true"${b}`;
    const hasAg02 = /data-drishvara-ag02-image-credit=/i.test(attrs);
    const finalAttrs = hasAg02 ? attrs : `${attrs} data-drishvara-ag02-image-credit="true"`;
    return `<div${finalAttrs}>${escHtml(creditText)}</div>`;
  });

  return { html, updatedCount };
}

function count(html, marker) {
  return (html.match(new RegExp(marker, "g")) || []).length;
}

function hrefs(html) {
  return [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)].map((m) => m[1]);
}

const config = readJson(registryPath);
const ag01 = readJson(ag01AuditPath);
const ar02b = fs.existsSync(ar02bSamplePath) ? readJson(ar02bSamplePath) : { entries: [] };
const samplePaths = new Set((ar02b.entries || []).map((entry) => entry.article_path));
const expectedSampleRefs = new Map((ar02b.entries || []).map((entry) => [entry.article_path, entry.references.map((ref) => ref.url)]));

ensureFallbackAssets(config);

const targetPaths = ag01.issue_buckets.needs_image_or_credit_repair || [];
const ag01ByPath = new Map(ag01.entries.map((entry) => [entry.article_path, entry]));

const modifiedFiles = [];
const fileResults = [];
const sourceTruthEntries = [];

for (const rel of targetPaths) {
  const entry = ag01ByPath.get(rel);
  if (!entry) throw new Error(`AG01 target missing from entries: ${rel}`);

  const full = path.join(root, rel);
  if (!fs.existsSync(full)) throw new Error(`Target article missing: ${rel}`);

  const before = fs.readFileSync(full, "utf8");
  const beforeLinks = hrefs(before);

  const fallbackSrc = fallbackFor(entry.category, config);
  const creditText = config.fallback_credit_text;

  let html = stripAG02(before);
  html = insertBeforeHeadClose(html, ag02Style());
  html = insertHeroFigure(html, entry, fallbackSrc, creditText);

  const creditUpdate = updateExistingCreditBlocks(html, creditText);
  html = creditUpdate.html;
  html = markChecked(html);

  const afterLinks = hrefs(html);
  const referenceUrlsChanged = JSON.stringify(beforeLinks) !== JSON.stringify(afterLinks);

  if (html !== before) {
    fs.writeFileSync(full, html);
    modifiedFiles.push(rel);
  }

  const sampleExpectedUrls = expectedSampleRefs.get(rel) || [];
  const sampleReferencesPreserved = !samplePaths.has(rel) || sampleExpectedUrls.every((url) => html.includes(url));

  const result = {
    article_path: rel,
    category: entry.category,
    title: entry.title,
    modified: html !== before,
    ag01_original_hero_status: entry.image.hero_image_status,
    ag01_original_hero_src: entry.image.hero_image_src,
    ag02_fallback_src: fallbackSrc,
    ag02_hero_count: count(html, 'data-drishvara-ag02-hero-visual="true"'),
    ag02_credit_count: count(html, 'data-drishvara-ag02-image-credit="true"'),
    ag02_checked_present: html.includes('data-drishvara-ag02-checked="true"'),
    existing_credit_blocks_updated: creditUpdate.updatedCount,
    ar02c_reference_link_count: count(html, 'data-drishvara-ar02c-reference-link="true"'),
    ar02c_block_count: count(html, 'data-drishvara-ar02c-sample-reference-block="true"'),
    ar02c_image_credit_present: html.includes('data-drishvara-ar02c-image-credit="true"'),
    sample_references_preserved: sampleReferencesPreserved,
    reference_urls_changed: referenceUrlsChanged
  };

  fileResults.push(result);

  sourceTruthEntries.push({
    article_path: rel,
    category: entry.category,
    title: entry.title,
    image_source_status: "category_fallback_assigned_by_ag02",
    image_source_path: fallbackSrc,
    image_source_type: "controlled_category_fallback",
    image_credit_status: "ag02_category_fallback_credit_recorded",
    image_credit_text: creditText,
    original_ag01_hero_status: entry.image.hero_image_status,
    original_ag01_hero_src: entry.image.hero_image_src,
    final_image_review_required: true,
    final_article_specific_image_required_later: true
  });
}

const applyResult = {
  apply_id: "AG02_ARTICLE_IMAGE_CREDIT_SOURCE_OF_TRUTH_APPLY_RESULT",
  module_id: "AG02",
  status: "image_credit_source_of_truth_repair_applied",
  applied: true,
  ag01_issue_bucket_count: targetPaths.length,
  targeted_article_count: fileResults.length,
  modified_files: modifiedFiles,
  file_results: fileResults,
  summary: {
    ag01_image_credit_issue_bucket_count: targetPaths.length,
    targeted_article_count: fileResults.length,
    modified_file_count: modifiedFiles.length,
    fallback_assets_exist: Object.values(config.category_fallback_assets).every((rel) => fs.existsSync(path.join(root, rel))),
    every_target_has_ag02_hero: fileResults.every((row) => row.ag02_hero_count >= 1),
    every_target_has_ag02_credit: fileResults.every((row) => row.ag02_credit_count >= 1),
    every_target_has_checked_marker: fileResults.every((row) => row.ag02_checked_present),
    every_target_preserves_reference_urls: fileResults.every((row) => row.reference_urls_changed === false),
    ar02c_sample_references_preserved: fileResults.every((row) => row.sample_references_preserved),
    non_ag01_target_mutation_performed: false,
    article_text_mutation_performed: false,
    article_word_count_reduction_performed: false,
    article_word_count_expansion_performed: false,
    reference_url_change_performed: fileResults.some((row) => row.reference_urls_changed),
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

const sourceTruthRegistry = {
  registry_id: "AG02_ARTICLE_IMAGE_CREDIT_SOURCE_OF_TRUTH_REGISTRY",
  module_id: "AG02",
  status: "category_fallback_source_of_truth_recorded_for_ag01_image_gaps",
  ag01_source: "data/editorial/ag01-article-governance-source-of-truth-audit.json",
  targeted_article_count: sourceTruthEntries.length,
  final_article_specific_images_completed: false,
  entries: sourceTruthEntries
};

writeJson(outputRegistryPath, sourceTruthRegistry);
writeJson(applyOutPath, applyResult);

console.log(`Created ${path.relative(root, outputRegistryPath)}.`);
console.log(`Created ${path.relative(root, applyOutPath)}.`);
console.log(`AG01 image/credit issue bucket count: ${applyResult.summary.ag01_image_credit_issue_bucket_count}`);
console.log(`Targeted articles: ${applyResult.summary.targeted_article_count}`);
console.log(`Modified files: ${applyResult.summary.modified_file_count}`);
console.log(`Every target has AG02 hero: ${applyResult.summary.every_target_has_ag02_hero}`);
console.log(`Every target has AG02 credit: ${applyResult.summary.every_target_has_ag02_credit}`);
console.log(`Reference URLs changed: ${applyResult.summary.reference_url_change_performed}`);
console.log(`AR02C sample references preserved: ${applyResult.summary.ar02c_sample_references_preserved}`);
