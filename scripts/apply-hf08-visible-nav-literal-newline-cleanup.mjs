import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "hf08-visible-nav-literal-newline-cleanup-patch.json");
const outPath = path.join(root, "data", "quality", "hf08-visible-nav-literal-newline-cleanup-apply-result.json");

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

function stripHF08(html) {
  html = html.replace(new RegExp('<style\\b[^>]*data-drishvara-hf08-visible-nav-cleanup[^>]*>[\\s\\S]*?<\\/style>', 'gi'), "");
  html = html.replace(new RegExp('<script\\b[^>]*data-drishvara-hf08-literal-newline-cleanup[^>]*>[\\s\\S]*?<\\/script>', 'gi'), "");
  return html;
}

function protectBlocksAndCleanLiteralNewline(html) {
  const blocks = [];
  html = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, function (block) {
    const token = `__DRISHVARA_HF08_PROTECTED_BLOCK_${blocks.length}__`;
    blocks.push(block);
    return token;
  });

  // Remove literal backslash+n text created by earlier insertion scripts.
  html = html.replace(/\\n/g, "\n");

  blocks.forEach((block, index) => {
    html = html.replace(`__DRISHVARA_HF08_PROTECTED_BLOCK_${index}__`, block);
  });

  return html;
}

function visibleNavStyle() {
  return `
<style data-drishvara-hf08-visible-nav-cleanup="true">
  /*
    HF08: visible navigation and literal newline cleanup.
    Static frontend only. No backend, Auth, API, Supabase, or deployment activation.
  */

  body.drishvara-hf08-active [data-drishvara-hf07-unified-header] {
    display: grid !important;
    grid-template-columns: auto minmax(520px, 1fr) auto !important;
    align-items: center !important;
    gap: 16px !important;
  }

  body.drishvara-hf08-active [data-drishvara-hf07-nav] {
    display: flex !important;
    visibility: visible !important;
    opacity: 1 !important;
    height: auto !important;
    width: auto !important;
    min-width: 0 !important;
    overflow: visible !important;
    flex-wrap: wrap !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 0.58rem 0.92rem !important;
    margin: 0 !important;
    padding: 0 !important;
    pointer-events: auto !important;
    position: static !important;
    z-index: 90020 !important;
  }

  body.drishvara-hf08-active [data-drishvara-hf07-nav] a,
  body.drishvara-hf08-active .drishvara-hf07-link {
    display: inline-flex !important;
    visibility: visible !important;
    opacity: 1 !important;
    color: #f8f1df !important;
    text-decoration: none !important;
    white-space: nowrap !important;
    line-height: 1.2 !important;
    font-size: 0.96rem !important;
    pointer-events: auto !important;
  }

  body.drishvara-hf08-active [data-drishvara-hf07-nav] a.active,
  body.drishvara-hf08-active [data-drishvara-hf07-nav] a:hover {
    color: #d7ad45 !important;
  }

  body.drishvara-hf08-active [data-drishvara-hf07-controls],
  body.drishvara-hf08-active .drishvara-hf07-controls {
    display: flex !important;
    visibility: visible !important;
    opacity: 1 !important;
    align-items: center !important;
    justify-content: flex-end !important;
    gap: 0.5rem !important;
    flex-wrap: nowrap !important;
    pointer-events: auto !important;
  }

  body.drishvara-hf08-active [data-drishvara-hf07-timezone] {
    display: inline-block !important;
    visibility: visible !important;
    opacity: 1 !important;
    pointer-events: auto !important;
  }

  body.drishvara-hf08-active [data-drishvara-hf07-language-toggle] {
    display: inline-flex !important;
    visibility: visible !important;
    opacity: 1 !important;
    pointer-events: auto !important;
  }

  @media (max-width: 1100px) {
    body.drishvara-hf08-active [data-drishvara-hf07-unified-header] {
      grid-template-columns: 1fr !important;
      justify-items: center !important;
      text-align: center !important;
    }

    body.drishvara-hf08-active [data-drishvara-hf07-nav] {
      max-width: 100% !important;
    }

    body.drishvara-hf08-active [data-drishvara-hf07-controls] {
      justify-content: center !important;
      flex-wrap: wrap !important;
    }
  }

  @media (max-width: 560px) {
    body.drishvara-hf08-active [data-drishvara-hf07-nav] {
      gap: 0.45rem 0.72rem !important;
    }

    body.drishvara-hf08-active [data-drishvara-hf07-nav] a {
      font-size: 0.9rem !important;
    }
  }
</style>`;
}

function cleanupScript() {
  return `
<script data-drishvara-hf08-literal-newline-cleanup="true">
(function () {
  function activateHF08() {
    document.body.classList.add("drishvara-hf08-active");

    // Runtime cleanup only for text nodes containing accidental literal backslash-n.
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(function (node) {
      if (node.nodeValue && node.nodeValue.indexOf("\\\\n") !== -1) {
        node.nodeValue = node.nodeValue.replace(/\\\\n/g, "");
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", activateHF08);
  } else {
    activateHF08();
  }
})();
</script>`;
}

function insertBeforeHeadClose(html, insert) {
  if (html.includes("</head>")) return html.replace("</head>", `${insert}\n</head>`);
  return `${insert}\n${html}`;
}

function insertBeforeBodyClose(html, insert) {
  if (html.includes("</body>")) return html.replace("</body>", `${insert}\n</body>`);
  return `${html}\n${insert}`;
}

const registry = readJson(registryPath);
const htmlFiles = walkHtml(root);
const modifiedFiles = [];
const fileResults = [];

for (const rel of htmlFiles) {
  const full = path.join(root, rel);
  const before = fs.readFileSync(full, "utf8");
  let html = stripHF08(before);
  const beforeLiteralCount = (html.match(/\\n/g) || []).length;

  html = protectBlocksAndCleanLiteralNewline(html);
  html = insertBeforeHeadClose(html, visibleNavStyle());
  html = insertBeforeBodyClose(html, cleanupScript());

  const afterLiteralCountOutsideProtected = (protectBlocksAndCleanLiteralNewline(html).match(/\\n/g) || []).length;

  if (html !== before) {
    fs.writeFileSync(full, html);
    modifiedFiles.push(rel);
  }

  fileResults.push({
    file: rel,
    literal_backslash_n_before: beforeLiteralCount,
    literal_backslash_n_after_clean_probe: afterLiteralCountOutsideProtected,
    hf08_style_inserted: html.includes("data-drishvara-hf08-visible-nav-cleanup"),
    hf08_script_inserted: html.includes("data-drishvara-hf08-literal-newline-cleanup")
  });
}

const output = {
  apply_id: "HF08_VISIBLE_NAV_LITERAL_NEWLINE_CLEANUP_APPLY_RESULT",
  module_id: "HF08",
  status: "targeted_public_ui_visible_nav_literal_newline_cleanup_applied",
  applied: true,
  scanned_html_file_count: htmlFiles.length,
  modified_files: modifiedFiles,
  file_results: fileResults,
  summary: {
    modified_file_count: modifiedFiles.length,
    index_modified: modifiedFiles.includes("index.html"),
    hf08_style_file_count: fileResults.filter((x) => x.hf08_style_inserted).length,
    hf08_script_file_count: fileResults.filter((x) => x.hf08_script_inserted).length,
    files_with_literal_backslash_n_before: fileResults.filter((x) => x.literal_backslash_n_before > 0).length,
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
console.log(`HF08 visible-nav style files: ${output.summary.hf08_style_file_count}`);
console.log(`HF08 literal-newline cleanup script files: ${output.summary.hf08_script_file_count}`);
