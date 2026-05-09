import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "hf07-unified-responsive-header-dropdown-system-patch.json");
const outPath = path.join(root, "data", "quality", "hf07-unified-responsive-header-dropdown-system-apply-result.json");

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
    if (entry.isDirectory()) {
      walkHtml(full, files);
    } else if (entry.isFile() && rel.endsWith(".html")) {
      files.push(rel);
    }
  }
  return files.sort();
}

function prefixFor(rel) {
  const depth = rel.split("/").length - 1;
  return "../".repeat(depth);
}

function activeFor(rel, page) {
  if (page === "index" && rel === "index.html") return " active";
  if (page === "about" && rel === "about.html") return " active";
  if (page === "insights" && (rel === "insights.html" || rel.startsWith("articles/"))) return " active";
  if (page === "submissions" && rel === "submissions.html") return " active";
  if (page === "dashboard" && rel === "dashboard.html") return " active";
  if (page === "contact" && rel === "contact.html") return " active";
  return "";
}

function headerHtml(rel) {
  const pre = prefixFor(rel);
  return `
<header class="drishvara-hf07-header" data-drishvara-hf07-unified-header="true">
  <a class="drishvara-hf07-brand" href="${pre}index.html" aria-label="Drishvara Home">Drishvara</a>

  <nav class="drishvara-hf07-nav" data-drishvara-hf07-nav="true" aria-label="Primary navigation">
    <a class="drishvara-hf07-link${activeFor(rel, "index")}" href="${pre}index.html">Home</a>
    <a class="drishvara-hf07-link${activeFor(rel, "about")}" href="${pre}about.html">About</a>
    <a class="drishvara-hf07-link${activeFor(rel, "insights")}" href="${pre}insights.html">Insights</a>
    <a class="drishvara-hf07-link${activeFor(rel, "submissions")}" href="${pre}submissions.html">Submissions</a>
    <a class="drishvara-hf07-link${activeFor(rel, "dashboard")}" href="${pre}dashboard.html">Dashboard</a>
    <a class="drishvara-hf07-link${activeFor(rel, "contact")}" href="${pre}contact.html">Contact</a>
    <a class="drishvara-hf07-link" href="#" data-drishvara-auth-placeholder="true" aria-disabled="true" title="Sign in / Join coming soon">Sign in / Join</a>
  </nav>

  <div class="drishvara-hf07-controls" data-drishvara-hf07-controls="true">
    <label class="drishvara-hf07-timezone-label" for="drishvara-hf07-timezone-${rel.replace(/[^a-zA-Z0-9]/g, "-")}">Time zone</label>
    <select id="drishvara-hf07-timezone-${rel.replace(/[^a-zA-Z0-9]/g, "-")}" data-drishvara-hf07-timezone="true" aria-label="Select timezone">
      <option value="Asia/Kolkata">India — IST</option>
      <option value="UTC">UTC</option>
      <option value="Asia/Dubai">Dubai — GST</option>
      <option value="Asia/Singapore">Singapore — SGT</option>
      <option value="Europe/London">London</option>
      <option value="America/New_York">New York</option>
    </select>

    <div class="drishvara-hf07-language-toggle" data-drishvara-hf07-language-toggle="true" aria-label="Language toggle">
      <button type="button" data-drishvara-hf07-lang-choice="en" aria-pressed="true">EN</button>
      <button type="button" data-drishvara-hf07-lang-choice="hi" aria-pressed="false">हिंदी</button>
    </div>
  </div>
</header>`;
}

function styleBlock() {
  return `
<style data-drishvara-hf07-responsive-dropdowns="true">
  /*
    HF07 unified public UI system.
    Static frontend only. No Auth, API, Supabase, backend, database, or deployment activation.
  */

  :root {
    --drishvara-ui-bg: rgba(8, 20, 44, 0.94);
    --drishvara-ui-bg-2: rgba(14, 31, 63, 0.90);
    --drishvara-ui-gold: #d7ad45;
    --drishvara-ui-text: #f8f1df;
    --drishvara-ui-muted: rgba(248, 241, 223, 0.76);
    --drishvara-ui-border: rgba(211, 169, 72, 0.35);
  }

  body.drishvara-hf07-active {
    overflow-x: hidden;
  }

  .drishvara-hf07-header {
    width: min(1180px, calc(100% - 40px));
    margin: 18px auto 26px;
    padding: 12px 16px;
    border: 1px solid var(--drishvara-ui-border);
    border-radius: 24px;
    background: linear-gradient(135deg, var(--drishvara-ui-bg), var(--drishvara-ui-bg-2));
    box-shadow: 0 18px 52px rgba(0, 0, 0, 0.22);
    backdrop-filter: blur(14px);
    color: var(--drishvara-ui-text);
    display: grid;
    grid-template-columns: auto minmax(320px, 1fr) auto;
    align-items: center;
    gap: 14px;
    position: relative;
    z-index: 90000;
    box-sizing: border-box;
    pointer-events: auto;
  }

  .drishvara-hf07-brand {
    color: var(--drishvara-ui-gold) !important;
    font-weight: 800;
    text-decoration: none;
    white-space: nowrap;
    letter-spacing: 0.02em;
  }

  .drishvara-hf07-nav {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.56rem 0.95rem;
    margin: 0;
    padding: 0;
    pointer-events: auto;
  }

  .drishvara-hf07-link {
    color: var(--drishvara-ui-text) !important;
    opacity: 0.96;
    text-decoration: none;
    white-space: nowrap;
    font-size: 0.96rem;
    line-height: 1.2;
    pointer-events: auto;
  }

  .drishvara-hf07-link.active,
  .drishvara-hf07-link:hover {
    color: var(--drishvara-ui-gold) !important;
  }

  .drishvara-hf07-controls {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    flex-wrap: nowrap;
    pointer-events: auto;
    min-width: 0;
  }

  .drishvara-hf07-timezone-label {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    overflow: hidden !important;
    clip: rect(0 0 0 0) !important;
  }

  select,
  textarea,
  input,
  [data-drishvara-hf07-timezone],
  [data-drishvara-form-control="select"] {
    max-width: 100%;
    box-sizing: border-box;
  }

  select,
  [data-drishvara-hf07-timezone],
  [data-drishvara-hf05-timezone] {
    min-height: 38px;
    pointer-events: auto !important;
    user-select: auto !important;
    touch-action: manipulation !important;
    position: relative;
    z-index: 90010;
  }

  .drishvara-hf07-header select,
  [data-drishvara-hf07-timezone] {
    width: min(170px, 34vw);
    min-width: 132px;
    height: 36px;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid var(--drishvara-ui-border);
    background: rgba(5, 16, 37, 0.96);
    color: var(--drishvara-ui-text);
    outline: none;
    appearance: auto;
  }

  .drishvara-hf07-language-toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    pointer-events: auto;
  }

  .drishvara-hf07-language-toggle button {
    min-width: 38px;
    height: 32px;
    padding: 0 0.55rem;
    border-radius: 999px;
    border: 1px solid var(--drishvara-ui-border);
    background: rgba(248, 241, 223, 0.08);
    color: var(--drishvara-ui-text);
    font-weight: 700;
    cursor: pointer;
    pointer-events: auto;
  }

  .drishvara-hf07-language-toggle button[aria-pressed="true"] {
    background: var(--drishvara-ui-gold);
    color: #071329;
  }

  body.drishvara-hf07-active .drishvara-hf05-header,
  body.drishvara-hf07-active nav[data-drishvara-hf01-common-nav]:not([data-drishvara-hf07-nav]),
  body.drishvara-hf07-active [data-drishvara-hf06-duplicate-nav="true"],
  body.drishvara-hf07-active [data-drishvara-hf07-duplicate-nav="true"] {
    display: none !important;
    visibility: hidden !important;
    height: 0 !important;
    overflow: hidden !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  body.drishvara-hf07-active .orbit,
  body.drishvara-hf07-active .hero-orbit,
  body.drishvara-hf07-active .cosmic-orbit,
  body.drishvara-hf07-active .orbit-layer,
  body.drishvara-hf07-active .hero-visual,
  body.drishvara-hf07-active .hero-decoration,
  body.drishvara-hf07-active [data-decorative="true"] {
    pointer-events: none !important;
  }

  @media (max-width: 980px) {
    .drishvara-hf07-header {
      width: min(100% - 28px, 1180px);
      grid-template-columns: 1fr;
      justify-items: center;
      text-align: center;
      gap: 10px;
    }

    .drishvara-hf07-controls {
      justify-content: center;
      flex-wrap: wrap;
    }

    .drishvara-hf07-header select,
    [data-drishvara-hf07-timezone] {
      width: min(220px, 70vw);
    }
  }

  @media (max-width: 560px) {
    .drishvara-hf07-header {
      width: min(100% - 16px, 1180px);
      margin: 10px auto 18px;
      border-radius: 18px;
      padding: 10px;
    }

    .drishvara-hf07-nav {
      gap: 0.45rem 0.72rem;
    }

    .drishvara-hf07-link {
      font-size: 0.9rem;
    }

    .drishvara-hf07-controls {
      width: 100%;
    }

    .drishvara-hf07-header select,
    [data-drishvara-hf07-timezone] {
      width: min(260px, 92vw);
    }
  }
</style>`;
}

function scriptBlock() {
  return `
<script data-drishvara-hf07-ui-system="true">
(function () {
  function setLanguageButtonState(lang) {
    document.querySelectorAll("[data-drishvara-hf07-lang-choice]").forEach(function (button) {
      var active = button.getAttribute("data-drishvara-hf07-lang-choice") === lang;
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
      window.dispatchEvent(new CustomEvent("drishvara:language-change", { detail: { language: safeLang } }));
    } catch (error) {}

    if (typeof window.setDrishvaraLanguage === "function") {
      try { window.setDrishvaraLanguage(safeLang); } catch (error) {}
    }

    if (window.DrishvaraLanguage && typeof window.DrishvaraLanguage.setLanguage === "function") {
      try { window.DrishvaraLanguage.setLanguage(safeLang); } catch (error) {}
    }
  }

  function activateUI07() {
    document.body.classList.add("drishvara-hf07-active");

    document.querySelectorAll("[data-drishvara-hf07-lang-choice]").forEach(function (button) {
      button.addEventListener("click", function () {
        applyLanguageChoice(button.getAttribute("data-drishvara-hf07-lang-choice"));
      });
    });

    document.querySelectorAll("[data-drishvara-auth-placeholder='true']").forEach(function (link) {
      link.setAttribute("aria-disabled", "true");
      link.addEventListener("click", function (event) {
        event.preventDefault();
      });
    });

    document.querySelectorAll("[data-drishvara-hf07-timezone]").forEach(function (timezone) {
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
          window.dispatchEvent(new CustomEvent("drishvara:timezone-change", { detail: { timezone: timezone.value } }));
        } catch (error) {}
      });
    });

    var initialLang = "en";
    try {
      initialLang =
        localStorage.getItem("drishvaraLanguage") ||
        localStorage.getItem("drishvara:language") ||
        localStorage.getItem("preferredLanguage") ||
        "en";
    } catch (error) {}
    setLanguageButtonState(initialLang === "hi" ? "hi" : "en");

    var hf07Nav = document.querySelector("[data-drishvara-hf07-nav]");
    Array.prototype.slice.call(document.querySelectorAll("nav")).forEach(function (nav) {
      if (nav === hf07Nav) return;
      var text = (nav.textContent || "").replace(/\\s+/g, " ").trim();
      if (text.includes("Home") && text.includes("Submissions") && text.includes("Dashboard")) {
        nav.setAttribute("data-drishvara-hf07-duplicate-nav", "true");
        nav.setAttribute("aria-hidden", "true");
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", activateUI07);
  } else {
    activateUI07();
  }
})();
</script>`;
}

function stripHF07(html) {
  html = html.replace(/<header\\b[^>]*data-drishvara-hf07-unified-header[^>]*>[\\s\\S]*?<\/header>/gi, "");
  html = html.replace(/<style\\b[^>]*data-drishvara-hf07-responsive-dropdowns[^>]*>[\\s\\S]*?<\/style>/gi, "");
  html = html.replace(/<script\\b[^>]*data-drishvara-hf07-ui-system[^>]*>[\\s\\S]*?<\/script>/gi, "");
  return html;
}

function insertAfterBody(html, insert) {
  if (/<body\\b[^>]*>/i.test(html)) {
    return html.replace(/<body([^>]*)>/i, `<body$1>\\n${insert}`);
  }
  return `${insert}\\n${html}`;
}

function insertBeforeHeadClose(html, insert) {
  if (html.includes("</head>")) return html.replace("</head>", `${insert}\\n</head>`);
  return `${insert}\\n${html}`;
}

function insertBeforeBodyClose(html, insert) {
  if (html.includes("</body>")) return html.replace("</body>", `${insert}\\n</body>`);
  return `${html}\\n${insert}`;
}

const registry = readJson(registryPath);
const htmlFiles = walkHtml(root);
const modifiedFiles = [];
const fileResults = [];

for (const rel of htmlFiles) {
  const full = path.join(root, rel);
  const before = fs.readFileSync(full, "utf8");
  let html = stripHF07(before);
  const changes = [];

  html = insertBeforeHeadClose(html, styleBlock());
  changes.push("inserted_hf07_responsive_dropdown_style");

  html = insertAfterBody(html, headerHtml(rel));
  changes.push("inserted_hf07_unified_header");

  html = insertBeforeBodyClose(html, scriptBlock());
  changes.push("inserted_hf07_ui_system_script");

  if (html !== before) {
    fs.writeFileSync(full, html);
    modifiedFiles.push(rel);
  }

  fileResults.push({ file: rel, changes });
}

const output = {
  apply_id: "HF07_UNIFIED_RESPONSIVE_HEADER_DROPDOWN_SYSTEM_APPLY_RESULT",
  module_id: "HF07",
  status: "unified_static_frontend_header_dropdown_system_applied",
  applied: true,
  scanned_html_file_count: htmlFiles.length,
  modified_files: modifiedFiles,
  file_results: fileResults,
  summary: {
    modified_file_count: modifiedFiles.length,
    index_modified: modifiedFiles.includes("index.html"),
    root_page_count: htmlFiles.filter((f) => !f.includes("/")).length,
    article_page_count: htmlFiles.filter((f) => f.startsWith("articles/")).length,
    unified_header_applied_file_count: fileResults.length,
    responsive_dropdown_style_file_count: fileResults.length,
    ui_system_script_file_count: fileResults.length,
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
console.log(`Unified header applied: ${output.summary.unified_header_applied_file_count}`);
console.log(`Responsive dropdown style applied: ${output.summary.responsive_dropdown_style_file_count}`);
