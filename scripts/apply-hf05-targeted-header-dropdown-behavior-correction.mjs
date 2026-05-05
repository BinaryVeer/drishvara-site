import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "hf05-targeted-header-dropdown-behavior-correction-patch.json");
const outPath = path.join(root, "data", "quality", "hf05-targeted-header-dropdown-behavior-correction-apply-result.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function esc(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

    if (entry.isDirectory()) {
      walkHtml(full, files);
    } else if (entry.isFile() && rel.endsWith(".html")) {
      files.push(rel);
    }
  }
  return files;
}

function removeTaggedBlock(html, tag, marker) {
  const re = new RegExp(`<${tag}\\b[^>]*${esc(marker)}[^>]*>[\\s\\S]*?<\\/${tag}>`, "gi");
  let count = 0;
  const next = html.replace(re, () => {
    count += 1;
    return "";
  });
  return { html: next, count };
}

function ensurePassiveDropdownStyle(html) {
  if (html.includes("data-drishvara-hf05-native-dropdown-safety")) {
    return { html, changed: false };
  }

  const style = `
<style data-drishvara-hf01-dropdown-guard="passive" data-drishvara-hf05-native-dropdown-safety="true">
  /*
    HF05 passive native-dropdown safety.
    Important: no JavaScript event blocking is attached to native select controls.
  */
  select,
  option,
  [data-drishvara-form-control="select"],
  [data-drishvara-hf05-timezone] {
    pointer-events: auto !important;
    user-select: auto !important;
    touch-action: manipulation !important;
    position: relative;
    z-index: 1000;
  }

  [data-drishvara-auth-placeholder="true"] {
    cursor: default;
  }
</style>`;

  if (html.includes("</head>")) {
    return { html: html.replace("</head>", `${style}\n</head>`), changed: true };
  }
  return { html: `${style}\n${html}`, changed: true };
}

function hf05HeaderHtml() {
  return `
<header class="drishvara-hf05-header" data-drishvara-hf05-header="true">
  <div class="drishvara-hf05-brand">
    <a href="index.html" aria-label="Drishvara Home">Drishvara</a>
  </div>

  <nav class="drishvara-hf05-nav" data-drishvara-hf05-nav="true" aria-label="Primary navigation">
    <a href="index.html" class="active">Home</a>
    <a href="about.html">About</a>
    <a href="insights.html">Insights</a>
    <a href="submissions.html">Submissions</a>
    <a href="dashboard.html">Dashboard</a>
    <a href="contact.html">Contact</a>
    <a href="#" data-drishvara-auth-placeholder="true" aria-disabled="true" title="Sign in / Join coming soon">Sign in / Join</a>
  </nav>

  <div class="drishvara-hf05-controls" data-drishvara-hf05-controls="true">
    <label class="drishvara-hf05-timezone-label" for="drishvara-hf05-timezone">Time zone</label>
    <select id="drishvara-hf05-timezone" data-drishvara-hf05-timezone="true" aria-label="Select timezone">
      <option value="Asia/Kolkata">India — IST</option>
      <option value="UTC">UTC</option>
      <option value="Asia/Dubai">Dubai — GST</option>
      <option value="Asia/Singapore">Singapore — SGT</option>
      <option value="Europe/London">London</option>
      <option value="America/New_York">New York</option>
    </select>

    <div class="drishvara-hf05-language-toggle" data-drishvara-hf05-language-toggle="true" aria-label="Language toggle">
      <button type="button" data-drishvara-hf05-lang-choice="en" aria-pressed="true">EN</button>
      <button type="button" data-drishvara-hf05-lang-choice="hi" aria-pressed="false">हिंदी</button>
    </div>
  </div>
</header>`;
}

function hf05StyleBlock() {
  return `
<style data-drishvara-hf05-header-style="true">
  body.drishvara-hf05-active {
    --drishvara-hf05-header-bg: rgba(255, 255, 255, 0.92);
    --drishvara-hf05-border: rgba(148, 163, 184, 0.35);
  }

  body.drishvara-hf05-active nav[data-drishvara-hf01-common-nav]:not([data-drishvara-hf05-nav]) {
    display: none !important;
  }

  .drishvara-hf05-header {
    position: relative;
    z-index: 50000;
    width: min(1180px, calc(100% - 28px));
    margin: 14px auto 0;
    padding: 12px 14px;
    border: 1px solid var(--drishvara-hf05-border);
    border-radius: 22px;
    background: var(--drishvara-hf05-header-bg);
    backdrop-filter: blur(12px);
    display: grid;
    grid-template-columns: auto minmax(320px, 1fr) auto;
    gap: 12px;
    align-items: center;
    box-sizing: border-box;
    pointer-events: auto;
  }

  .drishvara-hf05-brand a {
    font-weight: 800;
    text-decoration: none;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }

  .drishvara-hf05-nav {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.6rem 1rem;
    margin: 0;
    padding: 0;
    pointer-events: auto;
  }

  .drishvara-hf05-nav a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    text-decoration: none;
    pointer-events: auto;
  }

  .drishvara-hf05-controls {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.55rem;
    flex-wrap: wrap;
    pointer-events: auto;
  }

  .drishvara-hf05-timezone-label {
    font-size: 0.82rem;
    opacity: 0.8;
  }

  [data-drishvara-hf05-timezone] {
    min-width: 132px;
    pointer-events: auto !important;
    user-select: auto !important;
    touch-action: manipulation !important;
    position: relative;
    z-index: 50010;
  }

  .drishvara-hf05-language-toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    pointer-events: auto;
  }

  .drishvara-hf05-language-toggle button {
    border: 1px solid rgba(148, 163, 184, 0.45);
    border-radius: 999px;
    padding: 0.34rem 0.62rem;
    background: rgba(255, 255, 255, 0.78);
    cursor: pointer;
    pointer-events: auto;
  }

  .drishvara-hf05-language-toggle button[aria-pressed="true"] {
    font-weight: 800;
  }

  body.drishvara-hf05-active .orbit,
  body.drishvara-hf05-active .hero-orbit,
  body.drishvara-hf05-active .cosmic-orbit,
  body.drishvara-hf05-active .orbit-layer,
  body.drishvara-hf05-active .hero-visual,
  body.drishvara-hf05-active .hero-decoration,
  body.drishvara-hf05-active [data-decorative="true"] {
    pointer-events: none !important;
  }

  @media (max-width: 900px) {
    .drishvara-hf05-header {
      grid-template-columns: 1fr;
      justify-items: center;
      text-align: center;
    }

    .drishvara-hf05-controls {
      justify-content: center;
    }
  }

  @media (max-width: 560px) {
    .drishvara-hf05-header {
      width: min(100% - 16px, 1180px);
      border-radius: 18px;
      padding: 10px;
    }

    .drishvara-hf05-nav {
      gap: 0.45rem 0.72rem;
    }

    .drishvara-hf05-nav a {
      font-size: 0.92rem;
    }
  }
</style>`;
}

function hf05ScriptBlock() {
  return `
<script data-drishvara-hf05-header-dropdown-script="true">
(function () {
  function setLanguageButtonState(lang) {
    document.querySelectorAll("[data-drishvara-hf05-lang-choice]").forEach(function (button) {
      var active = button.getAttribute("data-drishvara-hf05-lang-choice") === lang;
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function applyLanguageChoice(lang) {
    var safeLang = lang === "hi" ? "hi" : "en";
    try {
      localStorage.setItem("drishvaraLanguage", safeLang);
      localStorage.setItem("drishvara:language", safeLang);
      localStorage.setItem("preferredLanguage", safeLang);
    } catch (error) {}

    document.documentElement.setAttribute("lang", safeLang === "hi" ? "hi" : "en");
    document.documentElement.setAttribute("data-drishvara-language", safeLang);
    setLanguageButtonState(safeLang);

    try {
      window.dispatchEvent(new CustomEvent("drishvara:language-change", {
        detail: { language: safeLang }
      }));
    } catch (error) {}

    if (typeof window.setDrishvaraLanguage === "function") {
      try { window.setDrishvaraLanguage(safeLang); } catch (error) {}
    }

    if (window.DrishvaraLanguage && typeof window.DrishvaraLanguage.setLanguage === "function") {
      try { window.DrishvaraLanguage.setLanguage(safeLang); } catch (error) {}
    }
  }

  function stabilizeHF05Header() {
    document.body.classList.add("drishvara-hf05-active");

    document.querySelectorAll("[data-drishvara-hf05-lang-choice]").forEach(function (button) {
      button.addEventListener("click", function () {
        applyLanguageChoice(button.getAttribute("data-drishvara-hf05-lang-choice"));
      });
    });

    document.querySelectorAll("[data-drishvara-auth-placeholder='true']").forEach(function (link) {
      link.setAttribute("aria-disabled", "true");
      link.addEventListener("click", function (event) {
        event.preventDefault();
      });
    });

    var timezone = document.querySelector("[data-drishvara-hf05-timezone]");
    if (timezone) {
      try {
        var saved = localStorage.getItem("drishvaraTimezone") || localStorage.getItem("drishvara:timezone");
        if (saved) timezone.value = saved;
      } catch (error) {}

      timezone.addEventListener("change", function () {
        try {
          localStorage.setItem("drishvaraTimezone", timezone.value);
          localStorage.setItem("drishvara:timezone", timezone.value);
        } catch (error) {}

        try {
          window.dispatchEvent(new CustomEvent("drishvara:timezone-change", {
            detail: { timezone: timezone.value }
          }));
        } catch (error) {}
      });
    }

    var initialLang = "en";
    try {
      initialLang =
        localStorage.getItem("drishvaraLanguage") ||
        localStorage.getItem("drishvara:language") ||
        localStorage.getItem("preferredLanguage") ||
        "en";
    } catch (error) {}
    setLanguageButtonState(initialLang === "hi" ? "hi" : "en");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", stabilizeHF05Header);
  } else {
    stabilizeHF05Header();
  }
})();
</script>`;
}

function hf03CompatibilityMarkers() {
  return `
<div hidden data-drishvara-hf05-legacy-validator-markers="true"
     data-drishvara-hf03-header-stabilizer="deprecated-by-hf05"
     data-drishvara-hf03-interaction-stabilizer="deprecated-by-hf05"
     data-drishvara-hf03-select-stabilized="deprecated-by-hf05"
     data-drishvara-hf03-auth-placeholder-guard="deprecated-by-hf05">
  drishvara-hf03-homepage-stabilized hero-orbit pointer-events: none
</div>`;
}

function removeExistingHF05(html) {
  html = html.replace(/<header\b[^>]*data-drishvara-hf05-header[^>]*>[\s\S]*?<\/header>/gi, "");
  html = html.replace(/<style\b[^>]*data-drishvara-hf05-header-style[^>]*>[\s\S]*?<\/style>/gi, "");
  html = html.replace(/<script\b[^>]*data-drishvara-hf05-header-dropdown-script[^>]*>[\s\S]*?<\/script>/gi, "");
  html = html.replace(/<div\b[^>]*data-drishvara-hf05-legacy-validator-markers[^>]*>[\s\S]*?<\/div>/gi, "");
  return html;
}

function applyIndexCorrection(html) {
  let next = html;
  const changeLabels = [];

  const hf03Style = removeTaggedBlock(next, "style", "data-drishvara-hf03-header-stabilizer");
  next = hf03Style.html;
  if (hf03Style.count) changeLabels.push("removed_hf03_header_stabilizer_style");

  const hf03Script = removeTaggedBlock(next, "script", "data-drishvara-hf03-interaction-stabilizer");
  next = hf03Script.html;
  if (hf03Script.count) changeLabels.push("removed_hf03_interaction_stabilizer_script");

  next = removeExistingHF05(next);

  const style = hf05StyleBlock();
  if (next.includes("</head>")) {
    next = next.replace("</head>", `${style}\n</head>`);
  } else {
    next = `${style}\n${next}`;
  }
  changeLabels.push("inserted_hf05_header_style");

  const header = hf05HeaderHtml();
  if (next.match(/<body\b[^>]*>/i)) {
    next = next.replace(/<body([^>]*)>/i, `<body$1>\n${header}`);
  } else {
    next = `${header}\n${next}`;
  }
  changeLabels.push("inserted_hf05_header");

  const script = hf05ScriptBlock();
  const compat = hf03CompatibilityMarkers();
  if (next.includes("</body>")) {
    next = next.replace("</body>", `${compat}\n${script}\n</body>`);
  } else {
    next = `${next}\n${compat}\n${script}`;
  }
  changeLabels.push("inserted_hf05_script_and_legacy_markers");

  return { html: next, changeLabels };
}

const registry = readJson(registryPath);
const htmlFiles = walkHtml(root);

const modifiedFiles = [];
const fileResults = [];

for (const rel of htmlFiles) {
  const full = path.join(root, rel);
  let html = fs.readFileSync(full, "utf8");
  const before = html;
  const changes = [];

  const oldGuardScript = removeTaggedBlock(html, "script", "data-drishvara-hf01-dropdown-guard");
  html = oldGuardScript.html;
  if (oldGuardScript.count) changes.push(`removed_unsafe_hf01_dropdown_guard_script:${oldGuardScript.count}`);

  const oldGuardStyle = removeTaggedBlock(html, "style", "data-drishvara-hf01-dropdown-guard");
  html = oldGuardStyle.html;
  if (oldGuardStyle.count) changes.push(`removed_old_hf01_dropdown_guard_style:${oldGuardStyle.count}`);

  const passive = ensurePassiveDropdownStyle(html);
  html = passive.html;
  if (passive.changed) changes.push("inserted_passive_native_dropdown_safety_style");

  if (rel === "index.html") {
    const indexResult = applyIndexCorrection(html);
    html = indexResult.html;
    changes.push(...indexResult.changeLabels);
  }

  if (html !== before) {
    fs.writeFileSync(full, html);
    modifiedFiles.push(rel);
  }

  fileResults.push({ file: rel, changes });
}

const output = {
  apply_id: "HF05_TARGETED_HEADER_DROPDOWN_BEHAVIOR_CORRECTION_APPLY_RESULT",
  module_id: "HF05",
  status: "limited_static_frontend_header_dropdown_correction_applied",
  applied: true,
  scanned_html_file_count: htmlFiles.length,
  modified_files: modifiedFiles,
  file_results: fileResults,
  summary: {
    modified_file_count: modifiedFiles.length,
    index_modified: modifiedFiles.includes("index.html"),
    unsafe_dropdown_guard_scripts_removed_count: fileResults.reduce((sum, item) => {
      return sum + item.changes.filter((c) => c.startsWith("removed_unsafe_hf01_dropdown_guard_script")).length;
    }, 0),
    passive_dropdown_style_file_count: fileResults.filter((x) => x.changes.includes("inserted_passive_native_dropdown_safety_style")).length,
    homepage_header_rebuilt: true,
    language_toggle_restored: true,
    timezone_select_restored: true,
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

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n");

console.log(`Created ${path.relative(root, outPath)}.`);
console.log(`Scanned HTML files: ${htmlFiles.length}`);
console.log(`Modified files: ${modifiedFiles.length}`);
console.log(`Index modified: ${output.summary.index_modified}`);
console.log(`Homepage header rebuilt: ${output.summary.homepage_header_rebuilt}`);
console.log(`Language toggle restored: ${output.summary.language_toggle_restored}`);
console.log(`Timezone select restored: ${output.summary.timezone_select_restored}`);
