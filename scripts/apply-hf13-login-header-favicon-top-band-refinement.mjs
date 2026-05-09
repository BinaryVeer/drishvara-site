import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "hf13-login-header-favicon-top-band-refinement-patch.json");
const outPath = path.join(root, "data", "quality", "hf13-login-header-favicon-top-band-refinement-apply-result.json");

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

function stripHF13(html) {
  html = html.replace(new RegExp('<style\\b[^>]*data-drishvara-hf13-login-header-visible[^>]*>[\\s\\S]*?<\\/style>', 'gi'), "");
  html = html.replace(new RegExp('<style\\b[^>]*data-drishvara-hf13-top-band-neutralised[^>]*>[\\s\\S]*?<\\/style>', 'gi'), "");
  html = html.replace(new RegExp('<link\\b[^>]*data-drishvara-hf13-smooth-favicon[^>]*>', 'gi'), "");
  return html;
}

function insertAfterHeadOpen(html, insert) {
  const match = html.match(/<head\b[^>]*>/i);
  if (match) return html.replace(match[0], `${match[0]}\n${insert}`);
  return `${insert}\n${html}`;
}

function smoothFaviconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <radialGradient id="g1" cx="45%" cy="35%" r="70%">
      <stop offset="0%" stop-color="#fff2b3"/>
      <stop offset="42%" stop-color="#d7ad45"/>
      <stop offset="100%" stop-color="#8c681a"/>
    </radialGradient>
    <radialGradient id="g2" cx="40%" cy="30%" r="80%">
      <stop offset="0%" stop-color="#16315e"/>
      <stop offset="100%" stop-color="#071329"/>
    </radialGradient>
  </defs>
  <rect x="6" y="6" width="116" height="116" rx="30" fill="url(#g2)"/>
  <path d="M24 76c18-34 49-47 80-34-18 4-33 14-44 30 15-8 31-8 48 0-24 32-64 37-91 16 12 2 25-2 37-11-11 3-21 2-30-1z" fill="url(#g1)"/>
  <circle cx="65" cy="68" r="8.8" fill="#fff0b3"/>
  <path d="M67 31c8 9 5 18-4 25 2-8-1-14-8-19 7 1 10-2 12-6z" fill="#f4ce63"/>
  <path d="M75 18c14 15 13 29-4 42 5-14 2-25-8-34 7 1 10-2 12-8z" fill="#d7ad45"/>
</svg>
`;
}

function createSmoothIcons() {
  const svgPath = path.join(root, "favicon.svg");
  const assetSvgPath = path.join(root, "assets", "drishvara-favicon.svg");
  fs.mkdirSync(path.dirname(assetSvgPath), { recursive: true });

  fs.writeFileSync(svgPath, smoothFaviconSvg());
  fs.writeFileSync(assetSvgPath, smoothFaviconSvg());

  const py = `
from PIL import Image, ImageDraw
from pathlib import Path

root = Path("${root.replaceAll("\\", "\\\\")}")
scale = 4
size = 256
img = Image.new("RGBA", (size*scale, size*scale), (0,0,0,0))
d = ImageDraw.Draw(img)

def S(v): return int(v*scale)

# navy rounded background
d.rounded_rectangle([S(10), S(10), S(246), S(246)], radius=S(58), fill=(7,19,41,255))

# gold eye-like sweep using smooth polygons
gold1 = (215,173,69,255)
gold2 = (246,208,100,255)
gold3 = (142,104,26,255)

d.pieslice([S(28), S(58), S(230), S(210)], start=195, end=355, fill=gold1)
d.pieslice([S(48), S(54), S(198), S(184)], start=200, end=350, fill=gold2)
d.pieslice([S(82), S(42), S(222), S(172)], start=210, end=325, fill=gold1)

# flame forms
d.pieslice([S(118), S(32), S(178), S(122)], start=250, end=70, fill=gold1)
d.pieslice([S(102), S(56), S(150), S(128)], start=250, end=75, fill=gold2)

# centre
d.ellipse([S(116), S(112), S(150), S(146)], fill=(255,240,179,255))

# antialias resize
img = img.resize((size, size), Image.Resampling.LANCZOS)
img.save(root / "apple-touch-icon.png")
img.save(root / "favicon.ico", sizes=[(16,16), (24,24), (32,32), (48,48), (64,64), (128,128), (256,256)])
`;
  execFileSync("python3", ["-c", py], { stdio: "inherit" });
}

function faviconLinks() {
  return `
<link rel="icon" href="/favicon.ico?v=hf13" sizes="any" data-drishvara-hf13-smooth-favicon="true">
<link rel="shortcut icon" href="/favicon.ico?v=hf13" data-drishvara-hf13-smooth-favicon="true">
<link rel="icon" type="image/svg+xml" href="/favicon.svg?v=hf13" data-drishvara-hf13-smooth-favicon="true">
<link rel="apple-touch-icon" href="/apple-touch-icon.png?v=hf13" data-drishvara-hf13-smooth-favicon="true">`;
}

function topBandNeutralStyle() {
  return `<style data-drishvara-hf13-top-band-neutralised="true">
/*
  HF13: neutralise visible top band while preserving settled design.
*/
html,
body {
  background-color: #071329 !important;
}

body {
  background:
    radial-gradient(circle at 50% 18%, rgba(211, 169, 72, 0.07), transparent 34rem),
    linear-gradient(180deg, #071329 0%, #071329 38%, #0b1833 100%) !important;
}

body::before {
  background: transparent !important;
  opacity: 0 !important;
  display: none !important;
}

[data-drishvara-hf07-unified-header] {
  margin-top: 18px !important;
  background: linear-gradient(135deg, rgba(8, 20, 44, 0.96), rgba(12, 27, 56, 0.94)) !important;
}
</style>`;
}

function loginHeaderStyle() {
  return `<style data-drishvara-hf13-login-header-visible="true">
/*
  HF13: login page navigation visibility.
*/
body[data-drishvara-hf09-static-login-page="true"] .drishvara-login-shell {
  padding-top: 24px !important;
}

body[data-drishvara-hf09-static-login-page="true"] .drishvara-login-header {
  display: flex !important;
  visibility: visible !important;
  opacity: 1 !important;
  position: relative !important;
  z-index: 99999 !important;
  background: linear-gradient(135deg, rgba(8, 20, 44, 0.98), rgba(14, 31, 63, 0.94)) !important;
  border: 1px solid rgba(211, 169, 72, 0.42) !important;
  box-shadow: 0 18px 52px rgba(0,0,0,0.26) !important;
}

body[data-drishvara-hf09-static-login-page="true"] .drishvara-login-brand {
  color: #d7ad45 !important;
  opacity: 1 !important;
  visibility: visible !important;
}

body[data-drishvara-hf09-static-login-page="true"] .drishvara-login-nav,
body[data-drishvara-hf09-static-login-page="true"] .drishvara-login-nav a {
  display: flex !important;
  visibility: visible !important;
  opacity: 1 !important;
  color: #f8f1df !important;
}

body[data-drishvara-hf09-static-login-page="true"] .drishvara-login-nav {
  flex-wrap: wrap !important;
  gap: 0.65rem 1rem !important;
}

body[data-drishvara-hf09-static-login-page="true"] .drishvara-login-nav a:hover {
  color: #d7ad45 !important;
}
</style>`;
}

const registry = readJson(registryPath);
createSmoothIcons();

const htmlFiles = walkHtml(root);
const modifiedFiles = [];
const fileResults = [];

for (const rel of htmlFiles) {
  const full = path.join(root, rel);
  const before = fs.readFileSync(full, "utf8");
  let html = stripHF13(before);
  const changes = [];

  html = insertAfterHeadOpen(html, faviconLinks());
  changes.push("inserted_hf13_smooth_favicon_links");

  html = insertAfterHeadOpen(html, topBandNeutralStyle());
  changes.push("inserted_hf13_top_band_neutralisation");

  if (rel === "login.html") {
    html = insertAfterHeadOpen(html, loginHeaderStyle());
    changes.push("inserted_hf13_login_header_visibility");
  }

  if (html !== before) {
    fs.writeFileSync(full, html);
    modifiedFiles.push(rel);
  }

  fileResults.push({ file: rel, changes });
}

const output = {
  apply_id: "HF13_LOGIN_HEADER_FAVICON_TOP_BAND_REFINEMENT_APPLY_RESULT",
  module_id: "HF13",
  status: "targeted_static_visual_refinement_after_hf12_applied",
  applied: true,
  scanned_html_file_count: htmlFiles.length,
  modified_files: modifiedFiles,
  file_results: fileResults,
  summary: {
    modified_file_count: modifiedFiles.length,
    index_modified: modifiedFiles.includes("index.html"),
    login_modified: modifiedFiles.includes("login.html"),
    favicon_ico_exists: fs.existsSync(path.join(root, "favicon.ico")),
    favicon_svg_exists: fs.existsSync(path.join(root, "favicon.svg")),
    apple_touch_icon_exists: fs.existsSync(path.join(root, "apple-touch-icon.png")),
    asset_favicon_exists: fs.existsSync(path.join(root, "assets", "drishvara-favicon.svg")),
    smooth_favicon_link_file_count: fileResults.filter((x) => x.changes.includes("inserted_hf13_smooth_favicon_links")).length,
    top_band_neutralisation_file_count: fileResults.filter((x) => x.changes.includes("inserted_hf13_top_band_neutralisation")).length,
    login_header_visibility_file_count: fileResults.filter((x) => x.changes.includes("inserted_hf13_login_header_visibility")).length,
    dropdown_logic_changed: false,
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
console.log(`Modified files: ${modifiedFiles.length}`);
console.log(`Smooth favicon assets present: ${output.summary.favicon_ico_exists && output.summary.favicon_svg_exists}`);
console.log(`Login header visibility files: ${output.summary.login_header_visibility_file_count}`);
