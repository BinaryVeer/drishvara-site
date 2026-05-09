import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "av02-article-hero-fallback-repair-reference-guard.json");
const sampleRegistryPath = path.join(root, "data", "editorial", "ar02b-sample-verified-reference-candidates.json");
const applyOutPath = path.join(root, "data", "quality", "av02-article-hero-fallback-repair-reference-guard-apply-result.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function walkArticles() {
  const base = path.join(root, "articles");
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
  walk(base);
  return files.sort();
}

function categoryFromPath(rel) {
  const m = rel.match(/articles\/([^/]+)\//);
  return m ? m[1] : "media";
}

function escXml(s) {
  return String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function categoryTitle(cat) {
  return {
    media: "Media & Society",
    policy: "Public Programmes",
    spiritual: "Spirituality",
    sports: "Sports",
    world: "World Affairs"
  }[cat] || "Drishvara";
}

function categorySubtitle(cat) {
  return {
    media: "Information, representation and public understanding",
    policy: "Governance, institutions and public service",
    spiritual: "Reflection, practice and inner growth",
    sports: "Performance, discipline and human excellence",
    world: "Global affairs, strategy and public consequence"
  }[cat] || "Civilizational intelligence";
}

function makeSvg(cat) {
  const title = escXml(categoryTitle(cat));
  const subtitle = escXml(categorySubtitle(cat));
  const label = escXml(cat.toUpperCase());

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 720" role="img" aria-label="${title}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#071329"/>
      <stop offset="48%" stop-color="#102247"/>
      <stop offset="100%" stop-color="#071329"/>
    </linearGradient>
    <radialGradient id="glow" cx="52%" cy="36%" r="52%">
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
  <path d="M155 510 C400 348, 640 328, 1245 250" fill="none" stroke="url(#gold)" stroke-width="9" opacity="0.62"/>
  <path d="M175 575 C420 428, 700 392, 1215 362" fill="none" stroke="url(#gold)" stroke-width="5" opacity="0.36"/>
  <circle cx="295" cy="235" r="78" fill="none" stroke="#d7ad45" stroke-width="3" opacity="0.22"/>
  <circle cx="1110" cy="530" r="116" fill="none" stroke="#d7ad45" stroke-width="3" opacity="0.18"/>
  <text x="120" y="215" fill="#d7ad45" font-family="Georgia, serif" font-size="34" letter-spacing="8">${label}</text>
  <text x="120" y="315" fill="#f8f1df" font-family="Georgia, serif" font-size="78" font-weight="700">${title}</text>
  <text x="120" y="390" fill="#c9d1df" font-family="Georgia, serif" font-size="32">${subtitle}</text>
  <text x="120" y="610" fill="#d7ad45" font-family="Georgia, serif" font-size="24" letter-spacing="5">DRISHVARA READING SURFACE</text>
</svg>`;
}

function ensureValidFallbackAssets(config) {
  for (const [cat, rel] of Object.entries(config.category_fallback_assets)) {
    const full = path.join(root, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, makeSvg(cat), "utf8");
  }
}

function stripAV02(html) {
  html = html.replace(/<style\b[^>]*data-drishvara-av02-article-visual-repair[^>]*>[\s\S]*?<\/style>/gi, "");
  html = html.replace(/<script\b[^>]*data-drishvara-av02-router-reference-guard-script[^>]*>[\s\S]*?<\/script>/gi, "");
  return html;
}

function insertBeforeHeadClose(html, block) {
  if (html.includes("</head>")) return html.replace("</head>", `${block}\n</head>`);
  return `${block}\n${html}`;
}

function av02Style() {
  return `<style data-drishvara-av02-article-visual-repair="true">
/* AV02: broad justified article reading and corrected article visual behaviour */
:root {
  --drishvara-article-outer-max: 1280px;
  --drishvara-article-body-max: 1160px;
  --drishvara-article-text-max: 1120px;
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
  text-align: justify !important;
  text-justify: inter-word;
  line-height: 1.82;
  hyphens: auto;
}

img[data-drishvara-av01-category-fallback-visual="true"] {
  width: min(100%, 1120px) !important;
  max-height: 560px !important;
  height: auto !important;
  object-fit: cover !important;
  display: block !important;
  margin: 0 auto 2rem !important;
  border-radius: 18px;
}

img[data-drishvara-av02-restored-brand-mark="true"] {
  width: 34px !important;
  height: 34px !important;
  max-width: 34px !important;
  max-height: 34px !important;
  object-fit: contain !important;
  display: block !important;
  margin: 0 auto 1rem !important;
  border: 0 !important;
  border-radius: 0 !important;
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
  }
}
</style>`;
}

function routerGuardScript() {
  return `<script data-drishvara-av02-router-reference-guard-script="true">
(function () {
  function hasReferenceBlock() {
    return !!document.querySelector('[data-drishvara-ar01-evidence-block="true"], [data-drishvara-ar02c-sample-reference-block="true"]');
  }

  function removeFallbackGuard() {
    var guard = document.querySelector('[data-drishvara-av02-router-reference-guard="true"]');
    if (guard) guard.remove();
  }

  function addFallbackGuard() {
    var natural = hasReferenceBlock();
    if (natural) {
      removeFallbackGuard();
      return;
    }

    if (document.querySelector('[data-drishvara-av02-router-reference-guard="true"]')) return;

    var host = document.querySelector("article") || document.querySelector("main") || document.body;
    var section = document.createElement("section");
    section.className = "drishvara-ar01-evidence";
    section.setAttribute("data-drishvara-av02-router-reference-guard", "true");
    section.setAttribute("data-drishvara-ar01-evidence-block", "true");
    section.innerHTML =
      '<h2>Editorial references and image credit</h2>' +
      '<span class="drishvara-ar01-status" data-drishvara-ar01-reference-status="under_editorial_verification">Under editorial verification</span>' +
      '<p>Reference links for this article are being verified through Drishvara’s editorial process. Links will be displayed only after relevance, reachability, credibility, and non-error availability are checked.</p>' +
      '<ol class="drishvara-ar01-reference-list">' +
      '<li data-drishvara-ar01-reference-slot="1"><strong>Reference 1:</strong> Under editorial verification.</li>' +
      '<li data-drishvara-ar01-reference-slot="2"><strong>Reference 2:</strong> Under editorial verification.</li>' +
      '</ol>' +
      '<div class="drishvara-ar01-image-credit" data-drishvara-ar01-image-credit="true">Image credit / attribution: Drishvara editorial visual. Final image-source attribution, where applicable, is under editorial verification.</div>';

    host.appendChild(section);
  }

  function schedule() {
    [400, 1200, 2500].forEach(function (delay) {
      window.setTimeout(addFallbackGuard, delay);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule, { once: true });
  } else {
    schedule();
  }
})();
</script>`;
}

function restoreBrandMarksBeforeTitle(html) {
  const h1Index = html.search(/<h1\b/i);
  if (h1Index < 0) return { html, restored: 0 };

  let restored = 0;
  html = html.replace(/<img\b[^>]*data-drishvara-av01-category-fallback-visual="true"[^>]*>/gi, (tag, offset) => {
    if (offset > h1Index) return tag;

    restored += 1;

    let out = tag;
    if (/\bsrc=["'][^"']*["']/i.test(out)) {
      out = out.replace(/\bsrc=["'][^"']*["']/i, 'src="/favicon.svg"');
    } else {
      out = out.replace(/<img/i, '<img src="/favicon.svg"');
    }

    out = out.replace(/\s*data-drishvara-av01-category-fallback-visual=["'][^"']*["']/i, '');
    if (!/data-drishvara-av02-restored-brand-mark=/i.test(out)) {
      out = out.replace(/<img/i, '<img data-drishvara-av02-restored-brand-mark="true"');
    }

    if (/\balt=["'][^"']*["']/i.test(out)) {
      out = out.replace(/\balt=["'][^"']*["']/i, 'alt="Drishvara"');
    } else {
      out = out.replace(/<img/i, '<img alt="Drishvara"');
    }

    return out;
  });

  return { html, restored };
}

const config = readJson(registryPath);
const sample = fs.existsSync(sampleRegistryPath) ? readJson(sampleRegistryPath) : { entries: [] };
const samplePaths = new Set((sample.entries || []).map((entry) => entry.article_path));

ensureValidFallbackAssets(config);

const files = walkArticles();
const modifiedFiles = [];
const fileResults = [];

for (const rel of files) {
  const full = path.join(root, rel);
  const before = fs.readFileSync(full, "utf8");

  let html = stripAV02(before);
  html = insertBeforeHeadClose(html, av02Style());

  const restored = restoreBrandMarksBeforeTitle(html);
  html = restored.html;

  if (html !== before) {
    fs.writeFileSync(full, html);
    modifiedFiles.push(rel);
  }

  fileResults.push({
    article_path: rel,
    modified: html !== before,
    restored_brand_marks: restored.restored,
    av02_style_present: html.includes('data-drishvara-av02-article-visual-repair="true"'),
    av02_brand_restore_marker_count: (html.match(/data-drishvara-av02-restored-brand-mark="true"/g) || []).length,
    av01_fallback_visual_count: (html.match(/data-drishvara-av01-category-fallback-visual="true"/g) || []).length,
    ar02c_block_count: (html.match(/data-drishvara-ar02c-sample-reference-block="true"/g) || []).length,
    ar02c_reference_link_count: (html.match(/data-drishvara-ar02c-reference-link="true"/g) || []).length,
    ar02c_image_credit_present: html.includes('data-drishvara-ar02c-image-credit="true"')
  });
}

const routerPath = path.join(root, "article.html");
let routerStylePresent = false;
let routerGuardPresent = false;
let routerModified = false;

if (fs.existsSync(routerPath)) {
  const before = fs.readFileSync(routerPath, "utf8");
  let html = stripAV02(before);
  html = insertBeforeHeadClose(html, av02Style());
  html = insertBeforeHeadClose(html, routerGuardScript());

  routerStylePresent = html.includes('data-drishvara-av02-article-visual-repair="true"');
  routerGuardPresent = html.includes('data-drishvara-av02-router-reference-guard-script="true"');

  if (html !== before) {
    fs.writeFileSync(routerPath, html);
    routerModified = true;
  }
}

const sampleResults = fileResults.filter((row) => samplePaths.has(row.article_path));

const result = {
  apply_id: "AV02_ARTICLE_HERO_FALLBACK_REPAIR_REFERENCE_GUARD_APPLY_RESULT",
  module_id: "AV02",
  status: "article_visual_repair_reference_guard_applied",
  applied: true,
  modified_files: modifiedFiles,
  file_results: fileResults,
  summary: {
    article_file_count: files.length,
    modified_file_count: modifiedFiles.length,
    fallback_assets_regenerated: Object.values(config.category_fallback_assets).every((rel) => fs.existsSync(path.join(root, rel))),
    total_brand_marks_restored: fileResults.reduce((sum, row) => sum + row.restored_brand_marks, 0),
    all_article_pages_have_av02_style: fileResults.every((row) => row.av02_style_present),
    router_modified: routerModified,
    router_style_present: routerStylePresent,
    router_reference_guard_present: routerGuardPresent,
    ar02c_sample_reference_links_preserved: sampleResults.every((row) => row.ar02c_block_count === 1 && row.ar02c_reference_link_count === 2),
    ar02c_sample_image_credit_preserved: sampleResults.every((row) => row.ar02c_image_credit_present),
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
  }
};

fs.writeFileSync(applyOutPath, JSON.stringify(result, null, 2) + "\n");

console.log(`Created ${path.relative(root, applyOutPath)}.`);
console.log(`Fallback assets regenerated: ${result.summary.fallback_assets_regenerated}`);
console.log(`Brand marks restored: ${result.summary.total_brand_marks_restored}`);
console.log(`Router reference guard present: ${result.summary.router_reference_guard_present}`);
console.log(`AR02C sample links preserved: ${result.summary.ar02c_sample_reference_links_preserved}`);
