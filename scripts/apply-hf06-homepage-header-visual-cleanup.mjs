import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "hf06-homepage-header-visual-cleanup-patch.json");
const indexPath = path.join(root, "index.html");
const outPath = path.join(root, "data", "quality", "hf06-homepage-header-visual-cleanup-apply-result.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const registry = readJson(registryPath);

if (!fs.existsSync(indexPath)) {
  throw new Error("index.html is required for HF06.");
}

let html = fs.readFileSync(indexPath, "utf8");
const before = html;
const changes = [];

const styleMarker = registry.required_markers.hf06_style_marker;
const scriptMarker = registry.required_markers.hf06_script_marker;

html = html.replace(/<style\b[^>]*data-drishvara-hf06-homepage-header-visual-cleanup[^>]*>[\s\S]*?<\/style>/gi, "");
html = html.replace(/<script\b[^>]*data-drishvara-hf06-duplicate-nav-guard[^>]*>[\s\S]*?<\/script>/gi, "");

const styleBlock = `
<style data-drishvara-hf06-homepage-header-visual-cleanup="true">
  /*
    HF06: visual cleanup only.
    Keeps HF05 functional controls but restores Drishvara dark-theme visual hierarchy.
  */

  body.drishvara-hf06-active .drishvara-hf05-header {
    width: min(1180px, calc(100% - 96px)) !important;
    margin: 22px auto 28px !important;
    padding: 10px 14px !important;
    min-height: auto !important;
    border-radius: 22px !important;
    border: 1px solid rgba(211, 169, 72, 0.38) !important;
    background:
      linear-gradient(135deg, rgba(10, 24, 52, 0.94), rgba(18, 36, 70, 0.88)) !important;
    box-shadow: 0 18px 55px rgba(0, 0, 0, 0.24) !important;
    backdrop-filter: blur(14px) !important;
    color: #f8f1df !important;
    display: grid !important;
    grid-template-columns: auto minmax(420px, 1fr) auto !important;
    gap: 14px !important;
    align-items: center !important;
    position: relative !important;
    z-index: 50000 !important;
  }

  body.drishvara-hf06-active .drishvara-hf05-brand a,
  body.drishvara-hf06-active .drishvara-hf05-nav a,
  body.drishvara-hf06-active .drishvara-hf05-header a {
    color: #f8f1df !important;
    opacity: 1 !important;
    text-shadow: none !important;
  }

  body.drishvara-hf06-active .drishvara-hf05-brand a {
    font-weight: 800 !important;
    color: #d7ad45 !important;
  }

  body.drishvara-hf06-active .drishvara-hf05-nav {
    display: flex !important;
    flex-wrap: wrap !important;
    justify-content: center !important;
    align-items: center !important;
    gap: 0.55rem 0.95rem !important;
    width: 100% !important;
  }

  body.drishvara-hf06-active .drishvara-hf05-nav a {
    font-size: 0.96rem !important;
    line-height: 1.2 !important;
    white-space: nowrap !important;
    text-decoration: none !important;
  }

  body.drishvara-hf06-active .drishvara-hf05-nav a.active,
  body.drishvara-hf06-active .drishvara-hf05-nav a:hover {
    color: #d7ad45 !important;
  }

  body.drishvara-hf06-active .drishvara-hf05-controls {
    display: flex !important;
    justify-content: flex-end !important;
    align-items: center !important;
    gap: 0.45rem !important;
    flex-wrap: nowrap !important;
  }

  body.drishvara-hf06-active .drishvara-hf05-timezone-label {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    overflow: hidden !important;
    clip: rect(0 0 0 0) !important;
  }

  body.drishvara-hf06-active [data-drishvara-hf05-timezone],
  body.drishvara-hf06-active .drishvara-hf05-header select {
    min-width: 145px !important;
    max-width: 170px !important;
    height: 34px !important;
    padding: 4px 10px !important;
    border-radius: 999px !important;
    border: 1px solid rgba(211, 169, 72, 0.38) !important;
    background: rgba(7, 19, 43, 0.92) !important;
    color: #f8f1df !important;
    outline: none !important;
    pointer-events: auto !important;
    appearance: auto !important;
  }

  body.drishvara-hf06-active .drishvara-hf05-language-toggle {
    display: inline-flex !important;
    gap: 0.35rem !important;
    align-items: center !important;
  }

  body.drishvara-hf06-active .drishvara-hf05-language-toggle button {
    min-width: 38px !important;
    height: 32px !important;
    padding: 0 0.55rem !important;
    border-radius: 999px !important;
    border: 1px solid rgba(211, 169, 72, 0.38) !important;
    background: rgba(248, 241, 223, 0.08) !important;
    color: #f8f1df !important;
    font-weight: 700 !important;
    cursor: pointer !important;
  }

  body.drishvara-hf06-active .drishvara-hf05-language-toggle button[aria-pressed="true"] {
    background: #d7ad45 !important;
    color: #071329 !important;
  }

  body.drishvara-hf06-active [data-drishvara-hf06-duplicate-nav="true"] {
    display: none !important;
    visibility: hidden !important;
    height: 0 !important;
    overflow: hidden !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  body.drishvara-hf06-active .drishvara-hf05-header + nav,
  body.drishvara-hf06-active .drishvara-hf05-header ~ nav:not([data-drishvara-hf05-nav]) {
    display: none !important;
  }

  @media (max-width: 960px) {
    body.drishvara-hf06-active .drishvara-hf05-header {
      width: min(100% - 28px, 1180px) !important;
      grid-template-columns: 1fr !important;
      justify-items: center !important;
      text-align: center !important;
    }

    body.drishvara-hf06-active .drishvara-hf05-controls {
      justify-content: center !important;
      flex-wrap: wrap !important;
    }
  }

  @media (max-width: 560px) {
    body.drishvara-hf06-active .drishvara-hf05-header {
      width: min(100% - 16px, 1180px) !important;
      margin-top: 12px !important;
      padding: 10px !important;
      border-radius: 18px !important;
    }

    body.drishvara-hf06-active .drishvara-hf05-nav {
      gap: 0.45rem 0.72rem !important;
    }

    body.drishvara-hf06-active .drishvara-hf05-nav a {
      font-size: 0.9rem !important;
    }
  }
</style>`;

const scriptBlock = `
<script data-drishvara-hf06-duplicate-nav-guard="true">
(function () {
  function applyHF06VisualCleanup() {
    document.body.classList.add("drishvara-hf06-active");

    var hf05Nav = document.querySelector("[data-drishvara-hf05-nav]");
    var navs = Array.prototype.slice.call(document.querySelectorAll("nav"));

    navs.forEach(function (nav) {
      if (nav === hf05Nav) return;

      var text = (nav.textContent || "").replace(/\\s+/g, " ").trim();
      var looksLikePrimaryNav =
        text.includes("Home") &&
        text.includes("Submissions") &&
        text.includes("Dashboard");

      if (looksLikePrimaryNav) {
        nav.setAttribute("data-drishvara-hf06-duplicate-nav", "true");
        nav.setAttribute("aria-hidden", "true");
      }
    });

    document.querySelectorAll("[data-drishvara-auth-placeholder='true']").forEach(function (link) {
      link.setAttribute("aria-disabled", "true");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyHF06VisualCleanup);
  } else {
    applyHF06VisualCleanup();
  }
})();
</script>`;

if (html.includes("</head>")) {
  html = html.replace("</head>", `${styleBlock}\n</head>`);
} else {
  html = `${styleBlock}\n${html}`;
}
changes.push("inserted_hf06_visual_cleanup_style");

if (html.includes("</body>")) {
  html = html.replace("</body>", `${scriptBlock}\n</body>`);
} else {
  html = `${html}\n${scriptBlock}`;
}
changes.push("inserted_hf06_duplicate_nav_guard_script");

fs.writeFileSync(indexPath, html);

const output = {
  apply_id: "HF06_HOMEPAGE_HEADER_VISUAL_CLEANUP_APPLY_RESULT",
  module_id: "HF06",
  status: "limited_index_html_visual_cleanup_applied",
  applied: true,
  modified_files: ["index.html"],
  changes,
  summary: {
    modified_file_count: 1,
    index_modified: true,
    hf06_style_marker_present: html.includes(styleMarker),
    hf06_script_marker_present: html.includes(scriptMarker),
    hf05_header_preserved: html.includes(registry.required_markers.hf05_header_marker),
    hf05_timezone_preserved: html.includes(registry.required_markers.hf05_timezone_marker),
    hf05_language_toggle_preserved: html.includes(registry.required_markers.hf05_language_toggle_marker),
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
console.log(`Modified files: index.html`);
console.log(`HF06 style marker present: ${output.summary.hf06_style_marker_present}`);
console.log(`HF06 script marker present: ${output.summary.hf06_script_marker_present}`);
