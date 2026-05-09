import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "hf10-header-paint-transition-refinement-patch.json");
const outPath = path.join(root, "data", "quality", "hf10-header-paint-transition-refinement-apply-result.json");

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

function stripHF10(html) {
  html = html.replace(new RegExp('<style\\b[^>]*data-drishvara-hf10-critical-paint[^>]*>[\\s\\S]*?<\\/style>', 'gi'), "");
  html = html.replace(new RegExp('<script\\b[^>]*data-drishvara-hf10-paint-ready[^>]*>[\\s\\S]*?<\\/script>', 'gi'), "");
  html = html.replace(new RegExp('<meta\\b[^>]*data-drishvara-hf10-theme-color[^>]*>', 'gi'), "");
  return html;
}

function criticalPaintStyle() {
  return `<style data-drishvara-hf10-critical-paint="true">
/*
  HF10 early paint layer.
  Prevents top-band color flash and header transition during page navigation.
*/
:root {
  color-scheme: dark;
  --drishvara-paint-bg: #071329;
  --drishvara-paint-bg-2: #0b1833;
  --drishvara-paint-gold: #d7ad45;
  --drishvara-paint-text: #f8f1df;
  --drishvara-paint-border: rgba(211, 169, 72, 0.34);
}

html,
body {
  margin: 0;
  min-height: 100%;
  background-color: var(--drishvara-paint-bg) !important;
}

body {
  background:
    radial-gradient(circle at top center, rgba(211, 169, 72, 0.10), transparent 34rem),
    linear-gradient(180deg, var(--drishvara-paint-bg) 0%, var(--drishvara-paint-bg-2) 100%) !important;
  color: var(--drishvara-paint-text);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

[data-drishvara-hf07-unified-header] {
  background:
    linear-gradient(135deg, rgba(8, 20, 44, 0.98), rgba(14, 31, 63, 0.94)) !important;
  border-color: var(--drishvara-paint-border) !important;
  color: var(--drishvara-paint-text) !important;
  opacity: 1 !important;
  visibility: visible !important;
  transform: none !important;
  transition: none !important;
  animation: none !important;
  will-change: auto !important;
  backface-visibility: hidden;
}

[data-drishvara-hf07-nav],
[data-drishvara-hf07-controls],
[data-drishvara-hf07-timezone],
[data-drishvara-hf07-language-toggle] {
  opacity: 1 !important;
  visibility: visible !important;
  transition: none !important;
  animation: none !important;
}

nav[data-drishvara-hf01-common-nav]:not([data-drishvara-hf07-nav]),
.drishvara-hf05-header,
[data-drishvara-hf06-duplicate-nav="true"],
[data-drishvara-hf07-duplicate-nav="true"] {
  display: none !important;
  visibility: hidden !important;
  height: 0 !important;
  overflow: hidden !important;
  margin: 0 !important;
  padding: 0 !important;
}

.drishvara-hf07-header,
.drishvara-hf07-nav,
.drishvara-hf07-controls {
  transition: none !important;
  animation: none !important;
}
</style>`;
}

function paintReadyScript() {
  return `<script data-drishvara-hf10-paint-ready="true">
(function () {
  function markReady() {
    document.documentElement.setAttribute("data-drishvara-hf10-paint", "ready");
    if (document.body) document.body.classList.add("drishvara-hf10-paint-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", markReady, { once: true });
  } else {
    markReady();
  }
})();
</script>`;
}

function themeMeta() {
  return `<meta name="theme-color" content="#071329" data-drishvara-hf10-theme-color="true">`;
}

function insertAfterHeadOpen(html, insert) {
  const match = html.match(/<head\b[^>]*>/i);
  if (match) {
    return html.replace(match[0], `${match[0]}\n${insert}`);
  }
  return `${insert}\n${html}`;
}

const registry = readJson(registryPath);
const htmlFiles = walkHtml(root);
const modifiedFiles = [];
const fileResults = [];

for (const rel of htmlFiles) {
  const full = path.join(root, rel);
  const before = fs.readFileSync(full, "utf8");
  let html = stripHF10(before);
  const changes = [];

  html = insertAfterHeadOpen(html, themeMeta());
  changes.push("inserted_hf10_theme_color");

  html = insertAfterHeadOpen(html, criticalPaintStyle());
  changes.push("inserted_hf10_critical_paint");

  html = insertAfterHeadOpen(html, paintReadyScript());
  changes.push("inserted_hf10_paint_ready_script");

  if (html !== before) {
    fs.writeFileSync(full, html);
    modifiedFiles.push(rel);
  }

  fileResults.push({ file: rel, changes });
}

const output = {
  apply_id: "HF10_HEADER_PAINT_TRANSITION_REFINEMENT_APPLY_RESULT",
  module_id: "HF10",
  status: "targeted_static_header_paint_transition_refinement_applied",
  applied: true,
  scanned_html_file_count: htmlFiles.length,
  modified_files: modifiedFiles,
  file_results: fileResults,
  summary: {
    modified_file_count: modifiedFiles.length,
    index_modified: modifiedFiles.includes("index.html"),
    critical_paint_file_count: fileResults.filter((x) => x.changes.includes("inserted_hf10_critical_paint")).length,
    theme_color_file_count: fileResults.filter((x) => x.changes.includes("inserted_hf10_theme_color")).length,
    paint_ready_script_file_count: fileResults.filter((x) => x.changes.includes("inserted_hf10_paint_ready_script")).length,
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
console.log(`Scanned HTML files: ${htmlFiles.length}`);
console.log(`Modified files: ${modifiedFiles.length}`);
console.log(`Critical paint files: ${output.summary.critical_paint_file_count}`);
console.log(`Theme-color files: ${output.summary.theme_color_file_count}`);
