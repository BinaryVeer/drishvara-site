import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "hf03-targeted-homepage-header-interaction-stabilization-patch.json");
const indexPath = path.join(root, "index.html");
const outPath = path.join(root, "data", "quality", "hf03-homepage-header-interaction-stabilization-apply-result.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const registry = readJson(registryPath);

if (!fs.existsSync(indexPath)) {
  throw new Error("index.html is required for HF03.");
}

let html = fs.readFileSync(indexPath, "utf8");
const before = html;
const changes = [];

const styleMarker = registry.required_markers.hf03_style_marker;
const scriptMarker = registry.required_markers.hf03_script_marker;

const styleBlock = `
<style ${styleMarker}="true">
  /*
    HF03 homepage-only header and interaction stabilizer.
    This intentionally avoids backend/Auth/API activation and only corrects static homepage layout behavior.
  */

  body.drishvara-hf03-homepage-stabilized header,
  body.drishvara-hf03-homepage-stabilized .site-header,
  body.drishvara-hf03-homepage-stabilized .topbar,
  body.drishvara-hf03-homepage-stabilized .top-bar,
  body.drishvara-hf03-homepage-stabilized .home-header,
  body.drishvara-hf03-homepage-stabilized .drishvara-header {
    position: relative !important;
    z-index: 12000 !important;
    pointer-events: auto !important;
  }

  body.drishvara-hf03-homepage-stabilized nav[data-drishvara-hf01-common-nav],
  body.drishvara-hf03-homepage-stabilized nav.site-nav,
  body.drishvara-hf03-homepage-stabilized .site-nav {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: wrap !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 0.75rem 1.25rem !important;
    width: min(100%, 820px) !important;
    max-width: 820px !important;
    margin: 0 auto !important;
    padding: 0.5rem 1rem !important;
    position: relative !important;
    inset: auto !important;
    transform: none !important;
    float: none !important;
    text-align: center !important;
    z-index: 12020 !important;
    pointer-events: auto !important;
  }

  body.drishvara-hf03-homepage-stabilized nav[data-drishvara-hf01-common-nav] a,
  body.drishvara-hf03-homepage-stabilized nav.site-nav a,
  body.drishvara-hf03-homepage-stabilized .site-nav a {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    white-space: nowrap !important;
    margin: 0 !important;
    position: relative !important;
    transform: none !important;
    pointer-events: auto !important;
  }

  body.drishvara-hf03-homepage-stabilized [data-drishvara-auth-placeholder="true"] {
    cursor: default !important;
  }

  body.drishvara-hf03-homepage-stabilized select,
  body.drishvara-hf03-homepage-stabilized .timezone-select,
  body.drishvara-hf03-homepage-stabilized #timezone,
  body.drishvara-hf03-homepage-stabilized #timezoneSelect,
  body.drishvara-hf03-homepage-stabilized #timezone-select,
  body.drishvara-hf03-homepage-stabilized [data-timezone],
  body.drishvara-hf03-homepage-stabilized [data-drishvara-timezone] {
    position: relative !important;
    z-index: 12030 !important;
    pointer-events: auto !important;
  }

  body.drishvara-hf03-homepage-stabilized .language-toggle,
  body.drishvara-hf03-homepage-stabilized .lang-toggle,
  body.drishvara-hf03-homepage-stabilized [data-language-toggle],
  body.drishvara-hf03-homepage-stabilized [data-drishvara-language-toggle] {
    position: relative !important;
    z-index: 12030 !important;
    pointer-events: auto !important;
  }

  body.drishvara-hf03-homepage-stabilized .orbit,
  body.drishvara-hf03-homepage-stabilized .hero-orbit,
  body.drishvara-hf03-homepage-stabilized .cosmic-orbit,
  body.drishvara-hf03-homepage-stabilized .orbit-layer,
  body.drishvara-hf03-homepage-stabilized .hero-visual,
  body.drishvara-hf03-homepage-stabilized .hero-decoration,
  body.drishvara-hf03-homepage-stabilized [data-decorative="true"] {
    pointer-events: none !important;
  }

  @media (max-width: 760px) {
    body.drishvara-hf03-homepage-stabilized nav[data-drishvara-hf01-common-nav],
    body.drishvara-hf03-homepage-stabilized nav.site-nav,
    body.drishvara-hf03-homepage-stabilized .site-nav {
      width: 100% !important;
      max-width: 100% !important;
      gap: 0.55rem 0.85rem !important;
      padding: 0.65rem 0.75rem !important;
    }

    body.drishvara-hf03-homepage-stabilized nav[data-drishvara-hf01-common-nav] a,
    body.drishvara-hf03-homepage-stabilized nav.site-nav a,
    body.drishvara-hf03-homepage-stabilized .site-nav a {
      font-size: 0.95rem !important;
    }
  }
</style>`;

const scriptBlock = `
<script ${scriptMarker}="true">
(function () {
  function stabilizeHomepageHeader() {
    document.body.classList.add("drishvara-hf03-homepage-stabilized");

    var nav = document.querySelector("nav[data-drishvara-hf01-common-nav], nav.site-nav, .site-nav");
    if (nav) {
      nav.setAttribute("data-drishvara-hf03-nav-stabilized", "true");
      nav.querySelectorAll("a").forEach(function (link) {
        link.style.pointerEvents = "auto";
      });
    }

    document.querySelectorAll("select").forEach(function (select) {
      select.setAttribute("data-drishvara-hf03-select-stabilized", "true");
      select.style.pointerEvents = "auto";
      select.style.position = select.style.position || "relative";
      select.style.zIndex = "12030";
      ["click", "mousedown", "pointerdown", "touchstart"].forEach(function (eventName) {
        select.addEventListener(eventName, function (event) {
          event.stopPropagation();
        }, false);
      });
    });

    document.querySelectorAll("[data-drishvara-auth-placeholder='true']").forEach(function (link) {
      link.setAttribute("aria-disabled", "true");
      link.setAttribute("data-drishvara-hf03-auth-placeholder-guard", "true");
      link.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
      }, false);
    });

    document.querySelectorAll(".orbit, .hero-orbit, .cosmic-orbit, .orbit-layer, .hero-visual, .hero-decoration").forEach(function (layer) {
      layer.setAttribute("data-drishvara-hf03-decorative-pointer-safe", "true");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", stabilizeHomepageHeader);
  } else {
    stabilizeHomepageHeader();
  }
})();
</script>`;

if (!html.includes(styleMarker)) {
  if (html.includes("</head>")) {
    html = html.replace("</head>", `${styleBlock}\n</head>`);
  } else {
    html = `${styleBlock}\n${html}`;
  }
  changes.push("inserted_hf03_header_stabilizer_style");
}

if (!html.includes(scriptMarker)) {
  if (html.includes("</body>")) {
    html = html.replace("</body>", `${scriptBlock}\n</body>`);
  } else {
    html = `${html}\n${scriptBlock}`;
  }
  changes.push("inserted_hf03_interaction_stabilizer_script");
}

if (html !== before) {
  fs.writeFileSync(indexPath, html);
}

const output = {
  apply_id: "HF03_HOMEPAGE_HEADER_INTERACTION_STABILIZATION_APPLY_RESULT",
  module_id: "HF03",
  status: "limited_index_html_homepage_stabilization_applied",
  applied: true,
  modified_files: html !== before ? ["index.html"] : [],
  changes,
  summary: {
    modified_file_count: html !== before ? 1 : 0,
    style_marker_present: html.includes(styleMarker),
    script_marker_present: html.includes(scriptMarker),
    required_nav_labels_present: registry.required_nav_labels.every((label) => html.includes(label)),
    dropdown_guard_present: html.includes(registry.required_markers.hf01_dropdown_guard_marker),
    auth_placeholder_present: html.includes(registry.required_markers.auth_placeholder_marker),
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
console.log(`Modified files: ${output.modified_files.join(", ") || "none"}`);
console.log(`Changes: ${changes.join(", ") || "none"}`);
console.log(`HF03 style marker present: ${output.summary.style_marker_present}`);
console.log(`HF03 script marker present: ${output.summary.script_marker_present}`);
