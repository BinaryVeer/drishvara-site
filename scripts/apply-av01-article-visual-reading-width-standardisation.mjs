import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "av01-article-visual-reading-width-standardisation-patch.json");
const sampleRegistryPath = path.join(root, "data", "editorial", "ar02b-sample-verified-reference-candidates.json");
const applyOutPath = path.join(root, "data", "quality", "av01-article-visual-reading-width-apply-result.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function articleFiles() {
  const articleRoot = path.join(root, "articles");
  const files = [];

  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      const rel = path.relative(root, full).replaceAll(path.sep, "/");
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && rel.endsWith(".html")) files.push(rel);
    }
  }

  walk(articleRoot);
  return files.sort();
}

function categoryFromPath(rel) {
  const parts = rel.split("/");
  const cat = parts[1] || "media";
  if (cat === "policy") return "policy";
  if (cat === "spiritual") return "spiritual";
  if (cat === "sports") return "sports";
  if (cat === "world") return "world";
  if (cat === "media") return "media";
  return "media";
}

function fallbackAssetFor(rel) {
  const category = categoryFromPath(rel);
  return `/assets/article-defaults/${category}.svg`;
}

function titleForCategory(category) {
  return {
    media: "Media & Society",
    policy: "Public Programmes",
    spiritual: "Spirituality",
    sports: "Sports",
    world: "World Affairs"
  }[category] || "Drishvara";
}

function makeFallbackSvg(category) {
  const title = titleForCategory(category);
  const subtitle = {
    media: "Information, representation and public understanding",
    policy: "Governance, institutions and public service",
    spiritual: "Reflection, practice and inner growth",
    sports: "Performance, discipline and human excellence",
    world: "Global affairs, strategy and public consequence"
  }[category] || "Civilizational intelligence";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 720" role="img" aria-label="${title}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#071329"/>
      <stop offset="55%" stop-color="#102247"/>
      <stop offset="100%" stop-color="#071329"/>
    </linearGradient>
    <radialGradient id="glow" cx="52%" cy="38%" r="48%">
      <stop offset="0%" stop-color="#d7ad45" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#d7ad45" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffe38a"/>
      <stop offset="55%" stop-color="#d7ad45"/>
      <stop offset="100%" stop-color="#8d6819"/>
    </linearGradient>
  </defs>
  <rect width="1400" height="720" rx="46" fill="url(#bg)"/>
  <rect width="1400" height="720" rx="46" fill="url(#glow)"/>
  <path d="M175 515 C395 360, 610 330, 1225 255" fill="none" stroke="url(#gold)" stroke-width="8" opacity="0.55"/>
  <path d="M190 575 C420 430, 680 392, 1205 365" fill="none" stroke="url(#gold)" stroke-width="5" opacity="0.32"/>
  <circle cx="290" cy="238" r="74" fill="none" stroke="#d7ad45" stroke-width="3" opacity="0.24"/>
  <circle cx="1110" cy="532" r="112" fill="none" stroke="#d7ad45" stroke-width="3" opacity="0.20"/>
  <text x="120" y="220" fill="#d7ad45" font-family="Georgia, serif" font-size="34" letter-spacing="8">${category.toUpperCase()}</text>
  <text x="120" y="315" fill="#f8f1df" font-family="Georgia, serif" font-size="78" font-weight="700">${title}</text>
  <text x="120" y="388" fill="#c9d1df" font-family="Georgia, serif" font-size="32">${subtitle}</text>
  <text x="120" y="610" fill="#d7ad45" font-family="Georgia, serif" font-size="24" letter-spacing="5">DRISHVARA READING SURFACE</text>
</svg>`;
}

function ensureFallbackAssets(config) {
  for (const [category, rel] of Object.entries(config.category_fallback_assets)) {
    const full = path.join(root, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, makeFallbackSvg(category));
  }
}

function stripAV01(html) {
  html = html.replace(/<style\b[^>]*data-drishvara-av01-article-reading-width[^>]*>[\s\S]*?<\/style>/gi, "");
  html = html.replace(/<script\b[^>]*data-drishvara-av01-router-visual-fallback[^>]*>[\s\S]*?<\/script>/gi, "");
  html = html.replace(/<meta\b[^>]*data-drishvara-av01-checked[^>]*>\n?/gi, "");
  return html;
}

function insertBeforeHeadClose(html, insert) {
  if (html.includes("</head>")) return html.replace("</head>", `${insert}\n</head>`);
  return `${insert}\n${html}`;
}

function av01Style() {
  return `<style data-drishvara-av01-article-reading-width="true">
/*
  AV01: broad long-form article reading surface.
  Intended for 1200+ word Drishvara articles.
*/
:root {
  --drishvara-article-outer-max: 1240px;
  --drishvara-article-body-max: 1120px;
  --drishvara-article-text-max: 1080px;
}

main,
.article-page main,
.article-shell,
.article-wrap,
.article-container,
.article-content,
.published-article,
article {
  max-width: var(--drishvara-article-outer-max) !important;
  margin-left: auto !important;
  margin-right: auto !important;
}

.article-card,
.article-body,
.article-reading-panel,
.article-panel,
article > section,
main > section {
  max-width: var(--drishvara-article-body-max) !important;
  margin-left: auto !important;
  margin-right: auto !important;
}

article p,
.article-body p,
.article-content p,
.article-card p,
.article-reading-panel p,
.published-article p,
main p {
  max-width: var(--drishvara-article-text-max) !important;
  margin-left: auto;
  margin-right: auto;
  text-align: justify !important;
  text-justify: inter-word;
  line-height: 1.82;
  hyphens: auto;
}

article h1,
.article-content h1,
.article-title,
main h1 {
  max-width: 1180px !important;
  margin-left: auto !important;
  margin-right: auto !important;
}

article img,
.article-content img,
.article-card img,
.published-article img,
main img {
  max-width: 100%;
}

img[data-drishvara-av01-category-fallback-visual="true"] {
  width: min(100%, 1120px) !important;
  max-height: 520px !important;
  object-fit: cover !important;
  display: block !important;
  margin: 0 auto 2rem !important;
  border-radius: 18px;
}

.drishvara-av01-category-fallback-frame {
  max-width: 1120px !important;
  margin: 0 auto 2rem !important;
}

@media (max-width: 780px) {
  :root {
    --drishvara-article-outer-max: calc(100vw - 24px);
    --drishvara-article-body-max: calc(100vw - 28px);
    --drishvara-article-text-max: calc(100vw - 38px);
  }

  article p,
  .article-body p,
  .article-content p,
  .article-card p,
  .article-reading-panel p,
  .published-article p,
  main p {
    text-align: left !important;
    hyphens: none;
    line-height: 1.74;
  }
}
</style>`;
}

function routerScript() {
  return `<script data-drishvara-av01-router-visual-fallback="true">
(function () {
  var fallbackMap = {
    media: "/assets/article-defaults/media.svg",
    policy: "/assets/article-defaults/policy.svg",
    spiritual: "/assets/article-defaults/spiritual.svg",
    sports: "/assets/article-defaults/sports.svg",
    world: "/assets/article-defaults/world.svg"
  };

  function categoryFromPath(pathValue) {
    var match = String(pathValue || "").match(/articles\\/([^/]+)\\//);
    return match && fallbackMap[match[1]] ? match[1] : "media";
  }

  function isLogoLike(src) {
    src = String(src || "").toLowerCase();
    return src.includes("favicon") ||
      src.includes("drishvara-favicon") ||
      src.includes("logo") ||
      src.includes("drishvara-mark") ||
      src.includes("brand-mark");
  }

  function applyFallbacks() {
    var params = new URLSearchParams(window.location.search);
    var pathValue = params.get("path") || window.location.pathname;
    var category = categoryFromPath(pathValue);
    var fallback = fallbackMap[category] || fallbackMap.media;

    document.querySelectorAll("article img, main img, .article-content img, .article-card img").forEach(function (img) {
      var src = img.getAttribute("src") || "";
      var box = img.getBoundingClientRect();
      var appearsHeroSized = box.width > 180 || img.width > 180 || img.className.toLowerCase().includes("hero");

      if (isLogoLike(src) && appearsHeroSized) {
        img.setAttribute("src", fallback);
        img.setAttribute("data-drishvara-av01-category-fallback-visual", "true");
        img.setAttribute("alt", "Drishvara category visual");
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyFallbacks, { once: true });
  } else {
    applyFallbacks();
  }
})();
</script>`;
}

function markChecked(html) {
  if (html.includes('data-drishvara-av01-checked="true"')) return html;
  const marker = '<meta data-drishvara-av01-checked="true" content="article-visual-reading-width-standardised">';
  return insertBeforeHeadClose(html, marker);
}

function replaceLogoImagesInStaticArticle(html, rel) {
  const fallback = fallbackAssetFor(rel);
  let replacedCount = 0;

  html = html.replace(/<img\b[^>]*>/gi, (tag) => {
    const srcMatch = tag.match(/\bsrc=["']([^"']+)["']/i);
    if (!srcMatch) return tag;

    const src = srcMatch[1].toLowerCase();
    const logoLike = src.includes("favicon") || src.includes("logo") || src.includes("drishvara-favicon") || src.includes("drishvara-mark") || src.includes("brand-mark");

    if (!logoLike) return tag;

    replacedCount += 1;

    let out = tag.replace(/\bsrc=["'][^"']+["']/i, `src="${fallback}"`);
    if (/data-drishvara-av01-category-fallback-visual=/i.test(out)) {
      out = out.replace(/data-drishvara-av01-category-fallback-visual=["'][^"']*["']/i, 'data-drishvara-av01-category-fallback-visual="true"');
    } else {
      out = out.replace(/<img/i, '<img data-drishvara-av01-category-fallback-visual="true"');
    }

    if (/\balt=["'][^"']*["']/i.test(out)) {
      out = out.replace(/\balt=["'][^"']*["']/i, 'alt="Drishvara category visual"');
    } else {
      out = out.replace(/<img/i, '<img alt="Drishvara category visual"');
    }

    return out;
  });

  return { html, replacedCount };
}

const registry = readJson(registryPath);
const sample = fs.existsSync(sampleRegistryPath) ? readJson(sampleRegistryPath) : { entries: [] };
ensureFallbackAssets(registry);

const files = articleFiles();
const modifiedFiles = [];
const fileResults = [];

for (const rel of files) {
  const full = path.join(root, rel);
  const before = fs.readFileSync(full, "utf8");
  let html = stripAV01(before);
  html = insertBeforeHeadClose(html, av01Style());

  const replaced = replaceLogoImagesInStaticArticle(html, rel);
  html = replaced.html;
  html = markChecked(html);

  if (html !== before) {
    fs.writeFileSync(full, html);
    modifiedFiles.push(rel);
  }

  fileResults.push({
    article_path: rel,
    modified: html !== before,
    category: categoryFromPath(rel),
    logo_like_images_replaced: replaced.replacedCount,
    av01_style_present: html.includes('data-drishvara-av01-article-reading-width="true"'),
    av01_checked_marker_present: html.includes('data-drishvara-av01-checked="true"'),
    av01_visual_marker_count: (html.match(/data-drishvara-av01-category-fallback-visual="true"/g) || []).length,
    ar02c_reference_link_count: (html.match(/data-drishvara-ar02c-reference-link="true"/g) || []).length,
    ar02c_block_count: (html.match(/data-drishvara-ar02c-sample-reference-block="true"/g) || []).length
  });
}

const routerPath = path.join(root, "article.html");
let routerModified = false;
let routerMarkers = {
  style_present: false,
  script_present: false
};

if (fs.existsSync(routerPath)) {
  const before = fs.readFileSync(routerPath, "utf8");
  let html = stripAV01(before);
  html = insertBeforeHeadClose(html, av01Style());
  html = insertBeforeHeadClose(html, routerScript());
  html = markChecked(html);

  routerMarkers = {
    style_present: html.includes('data-drishvara-av01-article-reading-width="true"'),
    script_present: html.includes('data-drishvara-av01-router-visual-fallback="true"')
  };

  if (html !== before) {
    fs.writeFileSync(routerPath, html);
    routerModified = true;
  }
}

const samplePaths = new Set((sample.entries || []).map((entry) => entry.article_path));
const sampleResults = fileResults.filter((row) => samplePaths.has(row.article_path));

const applyResult = {
  apply_id: "AV01_ARTICLE_VISUAL_READING_WIDTH_APPLY_RESULT",
  module_id: "AV01",
  status: "article_visual_reading_width_standardisation_applied",
  applied: true,
  scanned_article_file_count: files.length,
  modified_files: modifiedFiles,
  router_article_modified: routerModified,
  file_results: fileResults,
  summary: {
    article_file_count: files.length,
    modified_file_count: modifiedFiles.length,
    router_article_modified: routerModified,
    fallback_assets_created: Object.values(registry.category_fallback_assets).every((rel) => fs.existsSync(path.join(root, rel))),
    article_files_with_av01_style: fileResults.filter((row) => row.av01_style_present).length,
    article_files_with_av01_checked_marker: fileResults.filter((row) => row.av01_checked_marker_present).length,
    total_logo_like_images_replaced: fileResults.reduce((sum, row) => sum + row.logo_like_images_replaced, 0),
    router_style_present: routerMarkers.style_present,
    router_script_present: routerMarkers.script_present,
    sample_article_count_checked: sampleResults.length,
    ar02c_sample_references_preserved: sampleResults.every((row) => row.ar02c_block_count === 1 && row.ar02c_reference_link_count === 2),
    reading_width_outer_px: registry.reading_width_policy.outer_max_width_px,
    reading_width_body_px: registry.reading_width_policy.body_max_width_px,
    paragraph_alignment: registry.reading_width_policy.paragraph_alignment,
    article_minimum_word_rule_changed: false,
    article_text_mutation_performed: false,
    article_word_count_reduction_performed: false,
    reference_url_change_performed: false,
    new_reference_insertion_performed: false,
    external_fetch_performed: false,
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
  blocked_capabilities: registry.blocked_capabilities
};

fs.writeFileSync(applyOutPath, JSON.stringify(applyResult, null, 2) + "\n");

console.log(`Created ${path.relative(root, applyOutPath)}.`);
console.log(`Article files scanned: ${applyResult.summary.article_file_count}`);
console.log(`Article files modified: ${applyResult.summary.modified_file_count}`);
console.log(`Fallback assets created: ${applyResult.summary.fallback_assets_created}`);
console.log(`Logo-like article visuals replaced: ${applyResult.summary.total_logo_like_images_replaced}`);
console.log(`Router style/script present: ${applyResult.summary.router_style_present}/${applyResult.summary.router_script_present}`);
console.log(`AR02C sample references preserved: ${applyResult.summary.ar02c_sample_references_preserved}`);
