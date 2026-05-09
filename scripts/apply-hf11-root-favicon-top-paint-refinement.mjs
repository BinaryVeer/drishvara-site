import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "hf11-root-favicon-top-paint-refinement-patch.json");
const outPath = path.join(root, "data", "quality", "hf11-root-favicon-top-paint-refinement-apply-result.json");
const rootFaviconPath = path.join(root, "favicon.svg");
const assetFaviconPath = path.join(root, "assets", "drishvara-favicon.svg");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function isExcluded(relPath) {
  const p = relPath.replaceAll(path.sep, "/").toLowerCase();
  if (p.startsWith("archive/")) return true;
  if (p.startsWith("node_modules/")) return true;
  if (p.startsWith("drishvara_phase01_scaffold/")) return true;
  if (p.includes("backup")) return true;
  if (p === "admin.html") return true;
  return false;
}

function walkHtml(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(root, full).replaceAll(path.sep, "/");
    if (isExcluded(rel)) continue;
    if (entry.isDirectory()) walkHtml(full, files);
    else if (entry.isFile() && rel.endsWith(".html")) files.push(rel);
  }
  return files.sort();
}

function faviconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <radialGradient id="gold" cx="50%" cy="35%" r="70%">
      <stop offset="0%" stop-color="#ffe38a"/>
      <stop offset="46%" stop-color="#d7ad45"/>
      <stop offset="100%" stop-color="#7b5a14"/>
    </radialGradient>
    <linearGradient id="navy" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#071329"/>
      <stop offset="100%" stop-color="#10254c"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="28" fill="url(#navy)"/>
  <path d="M29 76c19-35 49-46 75-31-17 3-30 11-40 25 14-7 29-7 44 1-23 31-63 36-89 16 11 1 22-2 32-9-8 1-16 0-22-2z" fill="url(#gold)"/>
  <circle cx="65" cy="70" r="8" fill="#fff0b3"/>
  <path d="M70 30c8 10 4 20-6 27 2-9-1-15-7-20 8 1 11-3 13-7z" fill="#f2c95d"/>
  <path d="M76 17c14 16 12 30-4 42 5-14 2-25-8-34 7 1 10-2 12-8z" fill="#d7ad45"/>
</svg>
`;
}

function stripHF11(html) {
  html = html.replace(new RegExp('<style\\b[^>]*data-drishvara-hf11-top-paint-refinement[^>]*>[\\s\\S]*?<\\/style>', 'gi'), "");
  html = html.replace(new RegExp('<link\\b[^>]*data-drishvara-hf11-root-favicon[^>]*>', 'gi'), "");
  return html;
}

function faviconLinks() {
  return `
<link rel="icon" type="image/svg+xml" href="/favicon.svg" data-drishvara-hf11-root-favicon="true">
<link rel="shortcut icon" type="image/svg+xml" href="/favicon.svg" data-drishvara-hf11-root-favicon="true">
<link rel="alternate icon" type="image/svg+xml" href="/assets/drishvara-favicon.svg" data-drishvara-hf11-root-favicon="true">`;
}

function topPaintStyle() {
  return `<style data-drishvara-hf11-top-paint-refinement="true">
/*
  HF11: top paint-band refinement.
  Keeps the settled design but reduces the perceived top color band.
*/
html,
body {
  background-color: #071329 !important;
}

body {
  background:
    linear-gradient(180deg, #071329 0%, #071329 22%, #0b1833 100%) !important;
}

body::before {
  content: "";
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  height: 132px;
  pointer-events: none;
  z-index: 0;
  background: linear-gradient(180deg, #071329 0%, rgba(7, 19, 41, 0.96) 100%);
}

[data-drishvara-hf07-unified-header] {
  margin-top: 16px !important;
  position: relative !important;
  z-index: 90000 !important;
}

@media (max-width: 700px) {
  body::before {
    height: 96px;
  }

  [data-drishvara-hf07-unified-header] {
    margin-top: 10px !important;
  }
}
</style>`;
}

function insertAfterHeadOpen(html, insert) {
  const match = html.match(/<head\b[^>]*>/i);
  if (match) return html.replace(match[0], `${match[0]}\n${insert}`);
  return `${insert}\n${html}`;
}

const registry = readJson(registryPath);

fs.writeFileSync(rootFaviconPath, faviconSvg());
fs.mkdirSync(path.dirname(assetFaviconPath), { recursive: true });
if (!fs.existsSync(assetFaviconPath)) fs.writeFileSync(assetFaviconPath, faviconSvg());

const htmlFiles = walkHtml(root);
const modifiedFiles = [];
const fileResults = [];

for (const rel of htmlFiles) {
  const full = path.join(root, rel);
  const before = fs.readFileSync(full, "utf8");
  let html = stripHF11(before);
  const changes = [];

  html = insertAfterHeadOpen(html, faviconLinks());
  changes.push("inserted_root_favicon_links");

  html = insertAfterHeadOpen(html, topPaintStyle());
  changes.push("inserted_top_paint_refinement");

  if (html !== before) {
    fs.writeFileSync(full, html);
    modifiedFiles.push(rel);
  }

  fileResults.push({ file: rel, changes });
}

const output = {
  apply_id: "HF11_ROOT_FAVICON_TOP_PAINT_REFINEMENT_APPLY_RESULT",
  module_id: "HF11",
  status: "targeted_static_root_favicon_top_paint_refinement_applied",
  applied: true,
  scanned_html_file_count: htmlFiles.length,
  modified_files: modifiedFiles,
  root_favicon_created: fs.existsSync(rootFaviconPath),
  asset_favicon_present: fs.existsSync(assetFaviconPath),
  file_results: fileResults,
  summary: {
    modified_file_count: modifiedFiles.length,
    index_modified: modifiedFiles.includes("index.html"),
    root_favicon_created: fs.existsSync(rootFaviconPath),
    asset_favicon_present: fs.existsSync(assetFaviconPath),
    root_favicon_link_file_count: fileResults.filter((x) => x.changes.includes("inserted_root_favicon_links")).length,
    top_paint_refinement_file_count: fileResults.filter((x) => x.changes.includes("inserted_top_paint_refinement")).length,
    backend_activation_performed: false,
    api_route_created: false,
    supabase_enabled: false,
    auth_enabled: false,
    real_login_enabled: false,
    real_signup_enabled: false,
    user_account_collection_enabled: false,
    credential_collection_enabled: false,
    frontend_deployment_performed: false,
    file_deletion_performed: false,
    file_move_performed: false
  },
  blocked_capabilities: registry.blocked_capabilities
};

fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n");

console.log(`Created ${path.relative(root, outPath)}.`);
console.log(`Root favicon created: ${output.summary.root_favicon_created}`);
console.log(`Root favicon link files: ${output.summary.root_favicon_link_file_count}`);
console.log(`Top paint refinement files: ${output.summary.top_paint_refinement_file_count}`);
