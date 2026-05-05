import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "hf01-targeted-static-frontend-correction-patch.json");
const outPath = path.join(root, "data", "quality", "hf01-targeted-static-frontend-correction-apply-result.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const registry = readJson(registryPath);

function isExcluded(relPath) {
  const p = relPath.replaceAll(path.sep, "/");
  const lower = p.toLowerCase();
  if (lower.includes("backup")) return true;
  return registry.excluded_paths.some((marker) => lower.startsWith(marker.toLowerCase()) || lower.includes(`/${marker.toLowerCase()}`));
}

function walkHtml(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(root, full).replaceAll(path.sep, "/");
    if (isExcluded(rel)) continue;

    if (entry.isDirectory()) {
      walkHtml(full, files);
    } else if (entry.isFile() && rel.endsWith(".html")) {
      if (rel === "admin.html") continue;
      files.push(rel);
    }
  }
  return files;
}

function prefixFor(rel) {
  if (rel.startsWith("articles/")) return "../../";
  return "";
}

function activeFor(rel) {
  if (rel === "index.html") return "Home";
  if (rel === "about.html") return "About";
  if (rel === "insights.html" || rel.startsWith("articles/") || rel === "article.html") return "Insights";
  if (rel === "submissions.html") return "Submissions";
  if (rel === "dashboard.html") return "Dashboard";
  if (rel === "contact.html") return "Contact";
  return "";
}

function navHtml(rel) {
  const prefix = prefixFor(rel);
  const active = activeFor(rel);
  const item = (label, href) => {
    const cls = active === label ? ' class="active"' : "";
    return `      <a href="${prefix}${href}"${cls}>${label}</a>`;
  };

  return [
    item("Home", "index.html"),
    item("About", "about.html"),
    item("Insights", "insights.html"),
    item("Submissions", "submissions.html"),
    item("Dashboard", "dashboard.html"),
    item("Contact", "contact.html"),
    `      <a href="#" class="account-placeholder" data-drishvara-auth-placeholder="true" aria-disabled="true" title="Sign in / Join coming soon">Sign in / Join</a>`
  ].join("\n");
}

function replaceFirstNav(html, rel) {
  const navMatch = html.match(/<nav\b([^>]*)>[\s\S]*?<\/nav>/i);
  const commonNav = `<nav class="site-nav" data-drishvara-hf01-common-nav="true">\n${navHtml(rel)}\n    </nav>`;

  if (navMatch) {
    const attrs = navMatch[1] || ' class="site-nav" data-drishvara-hf01-common-nav="true"';
    const next = `<nav${attrs}>\n${navHtml(rel)}\n    </nav>`;
    return { html: html.replace(navMatch[0], next), changed: next !== navMatch[0] };
  }

  if (html.includes("<body")) {
    return {
      html: html.replace(/<body([^>]*)>/i, `<body$1>\n${commonNav}`),
      changed: true
    };
  }

  return {
    html: `${commonNav}\n${html}`,
    changed: true
  };
}

function injectDropdownGuard(html) {
  if (html.includes("data-drishvara-hf01-dropdown-guard")) return { html, changed: false };

  const style = `
<style data-drishvara-hf01-dropdown-guard="true">
  select,
  option,
  .submission-form select,
  [data-drishvara-form-control="select"] {
    position: relative !important;
    z-index: 10050 !important;
    pointer-events: auto !important;
  }
</style>`;

  const script = `
<script data-drishvara-hf01-dropdown-guard="true">
(function () {
  function guardSelectControls() {
    document.querySelectorAll("select").forEach(function (select) {
      select.setAttribute("data-drishvara-form-control", "select");
      ["click", "mousedown", "pointerdown", "touchstart"].forEach(function (eventName) {
        select.addEventListener(eventName, function (event) {
          event.stopPropagation();
        }, false);
      });
    });

    document.querySelectorAll("[data-drishvara-auth-placeholder='true']").forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", guardSelectControls);
  } else {
    guardSelectControls();
  }
})();
</script>`;

  let next = html;
  if (next.includes("</head>")) {
    next = next.replace("</head>", `${style}\n</head>`);
  } else {
    next = style + "\n" + next;
  }

  if (next.includes("</body>")) {
    next = next.replace("</body>", `${script}\n</body>`);
  } else {
    next = next + "\n" + script;
  }

  return { html: next, changed: true };
}

function trustBlock() {
  return `
<section class="article-trust-block" data-drishvara-hf01-trust-block="true" style="margin: 2rem 0; padding: 1.25rem; border: 1px solid rgba(148, 163, 184, 0.35); border-radius: 18px; background: rgba(255,255,255,0.68);">
  <h2 style="margin-top: 0;">References</h2>
  <p>References are under editorial verification.</p>
  <h2>Image credit</h2>
  <p>Image credit: under review.</p>
</section>`;
}

function injectArticleTrustBlock(html, rel) {
  const isArticle = rel === "article.html" || rel.startsWith("articles/");
  if (!isArticle) return { html, changed: false };
  if (html.includes("data-drishvara-hf01-trust-block")) return { html, changed: false };

  const block = trustBlock();

  if (html.includes("</article>")) {
    return { html: html.replace("</article>", `${block}\n</article>`), changed: true };
  }
  if (html.includes("</main>")) {
    return { html: html.replace("</main>", `${block}\n</main>`), changed: true };
  }
  if (html.includes("</body>")) {
    return { html: html.replace("</body>", `${block}\n</body>`), changed: true };
  }
  return { html: html + "\n" + block, changed: true };
}

const htmlFiles = walkHtml(root).filter((rel) => {
  if (rel.startsWith("node_modules/")) return false;
  if (rel.startsWith("drishvara_phase01_scaffold/")) return false;
  if (rel.includes("backup")) return false;
  if (rel === "admin.html") return false;
  return rel === "index.html" ||
    rel === "about.html" ||
    rel === "article.html" ||
    rel === "contact.html" ||
    rel === "dashboard.html" ||
    rel === "insights.html" ||
    rel === "login.html" ||
    rel === "submissions.html" ||
    rel.startsWith("articles/");
});

const modifiedFiles = [];
const perFile = [];

for (const rel of htmlFiles) {
  const full = path.join(root, rel);
  let html = fs.readFileSync(full, "utf8");
  const before = html;
  const changes = [];

  const nav = replaceFirstNav(html, rel);
  html = nav.html;
  if (nav.changed) changes.push("common_navigation");

  const guard = injectDropdownGuard(html);
  html = guard.html;
  if (guard.changed) changes.push("dropdown_select_guard");

  const trust = injectArticleTrustBlock(html, rel);
  html = trust.html;
  if (trust.changed) changes.push("article_reference_image_credit_block");

  if (html !== before) {
    fs.writeFileSync(full, html);
    modifiedFiles.push(rel);
  }

  perFile.push({ file: rel, changes });
}

const output = {
  apply_id: "HF01_TARGETED_STATIC_FRONTEND_CORRECTION_APPLY_RESULT",
  module_id: "HF01",
  status: "limited_static_frontend_correction_applied",
  applied: true,
  scanned_html_file_count: htmlFiles.length,
  modified_files: modifiedFiles,
  file_results: perFile,
  summary: {
    modified_file_count: modifiedFiles.length,
    navigation_corrected_file_count: perFile.filter((x) => x.changes.includes("common_navigation")).length,
    dropdown_guard_file_count: perFile.filter((x) => x.changes.includes("dropdown_select_guard")).length,
    trust_block_file_count: perFile.filter((x) => x.changes.includes("article_reference_image_credit_block")).length,
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
console.log(`Navigation corrected files: ${output.summary.navigation_corrected_file_count}`);
console.log(`Dropdown guard files: ${output.summary.dropdown_guard_file_count}`);
console.log(`Article trust block files: ${output.summary.trust_block_file_count}`);
