import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "hf12-select-freeze-elimination-favicon-ico-patch.json");
const outPath = path.join(root, "data", "quality", "hf12-select-freeze-elimination-favicon-ico-apply-result.json");

const icoBase64 = "AAABAAEAICAAAAEAIACzAAAAFgAAAIlQTkcNChoKAAAADUlIRFIAAAAgAAAAIAgGAAAAc3p69AAAAHpJREFUeNpjYBfW/D+QmGHIO+D6WlcMTDcHYLOcVEcMXQfgs5wUR4w6YNQBow4YGg4gxjKqO4BcS0l1DAO5lv9/swoDk+MIBmpZTqwj0B0yMh2A7IhRBzCQm/2oYTlFDqBWmcBAj0KIpHJgUJSEg6IuGO0ZjTpgxDgAAKkqcLQDd6kBAAAAAElFTkSuQmCC";
const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAeklEQVR42mNgF9b8P5CYYcg74PpaVwxMNwdgs5xURwxdB+CznBRHjDpg1AGjDhgaDiDGMqo7gFxLSXUMA7mW/3+zCgOT4wgGallOrCPQHTIyHYDsiFEHMJCb/ahhOUUOoFaZwECPQoikcmBQlISDoi4Y7RmNOmDEOAAAqSpwtAN3qQEAAAAASUVORK5CYII=";

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

function stripHF12(html) {
  html = html.replace(new RegExp('<style\\b[^>]*data-drishvara-hf12-select-freeze-elimination[^>]*>[\\s\\S]*?<\\/style>', 'gi'), "");
  html = html.replace(new RegExp('<script\\b[^>]*data-drishvara-hf12-safe-select-system[^>]*>[\\s\\S]*?<\\/script>', 'gi'), "");
  html = html.replace(new RegExp('<link\\b[^>]*data-drishvara-hf12-favicon-ico[^>]*>', 'gi'), "");
  return html;
}

function faviconLinks() {
  return `
<link rel="icon" href="/favicon.ico?v=hf12" sizes="any" data-drishvara-hf12-favicon-ico="true">
<link rel="shortcut icon" href="/favicon.ico?v=hf12" data-drishvara-hf12-favicon-ico="true">
<link rel="icon" type="image/svg+xml" href="/favicon.svg?v=hf12" data-drishvara-hf12-favicon-ico="true">
<link rel="apple-touch-icon" href="/apple-touch-icon.png?v=hf12" data-drishvara-hf12-favicon-ico="true">`;
}

function selectStyle() {
  return `<style data-drishvara-hf12-select-freeze-elimination="true">
/*
  HF12: eliminate native select freeze by replacing user-facing select interaction
  with safe button-based controls while keeping original select values synced.
*/
.drishvara-hf12-native-select-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  opacity: 0 !important;
  pointer-events: none !important;
  overflow: hidden !important;
  clip: rect(0 0 0 0) !important;
  clip-path: inset(50%) !important;
  white-space: nowrap !important;
}

[data-drishvara-hf07-unified-header] select:not([data-drishvara-hf07-timezone]) {
  display: none !important;
  visibility: hidden !important;
  pointer-events: none !important;
}

.drishvara-hf12-select {
  position: relative;
  display: inline-block;
  min-width: min(220px, 100%);
  max-width: 100%;
  z-index: 95000;
  font-family: inherit;
}

.drishvara-hf12-select-button {
  width: 100%;
  min-height: 38px;
  border-radius: 999px;
  border: 1px solid rgba(211, 169, 72, 0.38);
  background: rgba(5, 16, 37, 0.96);
  color: #f8f1df;
  padding: 8px 38px 8px 14px;
  text-align: left;
  cursor: pointer;
  font: inherit;
  line-height: 1.2;
  position: relative;
}

.drishvara-hf12-select-button::after {
  content: "⌄";
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-53%);
  opacity: 0.86;
}

.drishvara-hf12-select-menu {
  display: none;
  position: absolute;
  left: 0;
  top: calc(100% + 6px);
  width: max(100%, 220px);
  max-width: min(360px, 90vw);
  max-height: 280px;
  overflow-y: auto;
  border: 1px solid rgba(211, 169, 72, 0.36);
  border-radius: 16px;
  background: #071329;
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.34);
  padding: 6px;
  z-index: 99999;
}

.drishvara-hf12-select[data-open="true"] .drishvara-hf12-select-menu {
  display: grid;
  gap: 4px;
}

.drishvara-hf12-select-option {
  border: 0;
  width: 100%;
  border-radius: 12px;
  background: transparent;
  color: #f8f1df;
  padding: 9px 10px;
  text-align: left;
  cursor: pointer;
  font: inherit;
}

.drishvara-hf12-select-option:hover,
.drishvara-hf12-select-option[aria-selected="true"] {
  background: rgba(211, 169, 72, 0.18);
  color: #ffe38a;
}

[data-drishvara-hf07-unified-header] .drishvara-hf12-select {
  min-width: 170px;
}

[data-drishvara-hf07-unified-header] .drishvara-hf12-select-button {
  height: 38px;
}

@media (max-width: 700px) {
  .drishvara-hf12-select {
    width: min(260px, 92vw);
  }

  .drishvara-hf12-select-menu {
    width: min(320px, 92vw);
  }
}
</style>`;
}

function selectScript() {
  return `<script data-drishvara-hf12-safe-select-system="true">
(function () {
  function closeAllExcept(except) {
    document.querySelectorAll("[data-drishvara-hf12-select]").forEach(function (wrap) {
      if (wrap !== except) wrap.setAttribute("data-open", "false");
    });
  }

  function selectedText(select) {
    var option = select.options[select.selectedIndex];
    return option ? option.textContent.trim() : "Select";
  }

  function buildSafeSelect(select) {
    if (!select || select.dataset.drishvaraHf12Converted === "true") return;

    var inHeader = !!select.closest("[data-drishvara-hf07-unified-header]");
    var isCurrentHeaderTimezone = select.hasAttribute("data-drishvara-hf07-timezone");

    if (inHeader && !isCurrentHeaderTimezone) {
      select.classList.add("drishvara-hf12-native-select-hidden");
      select.dataset.drishvaraHf12Converted = "true";
      return;
    }

    var wrap = document.createElement("div");
    wrap.className = "drishvara-hf12-select";
    wrap.setAttribute("data-drishvara-hf12-select", "true");
    wrap.setAttribute("data-open", "false");

    var button = document.createElement("button");
    button.type = "button";
    button.className = "drishvara-hf12-select-button";
    button.setAttribute("aria-haspopup", "listbox");
    button.setAttribute("aria-expanded", "false");
    button.textContent = selectedText(select);

    var menu = document.createElement("div");
    menu.className = "drishvara-hf12-select-menu";
    menu.setAttribute("role", "listbox");

    Array.prototype.slice.call(select.options).forEach(function (option) {
      var item = document.createElement("button");
      item.type = "button";
      item.className = "drishvara-hf12-select-option";
      item.setAttribute("role", "option");
      item.dataset.value = option.value;
      item.textContent = option.textContent;
      item.setAttribute("aria-selected", option.selected ? "true" : "false");

      item.addEventListener("click", function () {
        select.value = option.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));

        button.textContent = selectedText(select);
        menu.querySelectorAll(".drishvara-hf12-select-option").forEach(function (x) {
          x.setAttribute("aria-selected", x === item ? "true" : "false");
        });

        wrap.setAttribute("data-open", "false");
        button.setAttribute("aria-expanded", "false");
      });

      menu.appendChild(item);
    });

    button.addEventListener("click", function () {
      var willOpen = wrap.getAttribute("data-open") !== "true";
      closeAllExcept(wrap);
      wrap.setAttribute("data-open", willOpen ? "true" : "false");
      button.setAttribute("aria-expanded", willOpen ? "true" : "false");
    });

    select.addEventListener("change", function () {
      button.textContent = selectedText(select);
      menu.querySelectorAll(".drishvara-hf12-select-option").forEach(function (item) {
        item.setAttribute("aria-selected", item.dataset.value === select.value ? "true" : "false");
      });
    });

    wrap.appendChild(button);
    wrap.appendChild(menu);

    select.classList.add("drishvara-hf12-native-select-hidden");
    select.dataset.drishvaraHf12Converted = "true";
    select.insertAdjacentElement("afterend", wrap);
  }

  function activateSafeSelects() {
    document.querySelectorAll("select").forEach(buildSafeSelect);

    document.addEventListener("click", function (event) {
      if (!event.target.closest("[data-drishvara-hf12-select]")) closeAllExcept(null);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeAllExcept(null);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", activateSafeSelects, { once: true });
  } else {
    activateSafeSelects();
  }
})();
</script>`;
}

function insertAfterHeadOpen(html, insert) {
  const match = html.match(/<head\b[^>]*>/i);
  if (match) return html.replace(match[0], `${match[0]}\n${insert}`);
  return `${insert}\n${html}`;
}

const registry = readJson(registryPath);

fs.writeFileSync(path.join(root, "favicon.ico"), Buffer.from(icoBase64, "base64"));
fs.writeFileSync(path.join(root, "apple-touch-icon.png"), Buffer.from(pngBase64, "base64"));
fs.writeFileSync(path.join(root, "favicon.svg"), faviconSvg());
fs.mkdirSync(path.join(root, "assets"), { recursive: true });
fs.writeFileSync(path.join(root, "assets", "drishvara-favicon.svg"), faviconSvg());

const htmlFiles = walkHtml(root);
const modifiedFiles = [];
const fileResults = [];

for (const rel of htmlFiles) {
  const full = path.join(root, rel);
  const before = fs.readFileSync(full, "utf8");
  let html = stripHF12(before);
  const changes = [];

  html = insertAfterHeadOpen(html, faviconLinks());
  changes.push("inserted_hf12_favicon_links");

  html = insertAfterHeadOpen(html, selectStyle());
  changes.push("inserted_hf12_select_style");

  html = insertAfterHeadOpen(html, selectScript());
  changes.push("inserted_hf12_select_script");

  if (html !== before) {
    fs.writeFileSync(full, html);
    modifiedFiles.push(rel);
  }

  fileResults.push({ file: rel, changes });
}

const output = {
  apply_id: "HF12_SELECT_FREEZE_ELIMINATION_FAVICON_ICO_APPLY_RESULT",
  module_id: "HF12",
  status: "targeted_static_select_freeze_elimination_favicon_ico_applied",
  applied: true,
  scanned_html_file_count: htmlFiles.length,
  modified_files: modifiedFiles,
  root_favicon_ico_created: fs.existsSync(path.join(root, "favicon.ico")),
  root_favicon_svg_created: fs.existsSync(path.join(root, "favicon.svg")),
  apple_touch_icon_created: fs.existsSync(path.join(root, "apple-touch-icon.png")),
  file_results: fileResults,
  summary: {
    modified_file_count: modifiedFiles.length,
    index_modified: modifiedFiles.includes("index.html"),
    select_style_file_count: fileResults.filter((x) => x.changes.includes("inserted_hf12_select_style")).length,
    select_script_file_count: fileResults.filter((x) => x.changes.includes("inserted_hf12_select_script")).length,
    favicon_link_file_count: fileResults.filter((x) => x.changes.includes("inserted_hf12_favicon_links")).length,
    favicon_ico_created: fs.existsSync(path.join(root, "favicon.ico")),
    favicon_svg_created: fs.existsSync(path.join(root, "favicon.svg")),
    apple_touch_icon_created: fs.existsSync(path.join(root, "apple-touch-icon.png")),
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
console.log(`favicon.ico created: ${output.summary.favicon_ico_created}`);
console.log(`Safe select script files: ${output.summary.select_script_file_count}`);
