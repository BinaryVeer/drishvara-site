import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "hf09-smooth-nav-signin-favicon-patch.json");
const outPath = path.join(root, "data", "quality", "hf09-smooth-nav-signin-favicon-apply-result.json");
const faviconPath = path.join(root, "assets", "drishvara-favicon.svg");

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

function prefixFor(rel) {
  const depth = rel.split("/").length - 1;
  return "../".repeat(depth);
}

function stripProtectedAndCleanLiteralNewline(html) {
  const blocks = [];
  html = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, function (block) {
    const token = `__DRISHVARA_HF09_PROTECTED_BLOCK_${blocks.length}__`;
    blocks.push(block);
    return token;
  });

  html = html.replace(/\\n/g, "\n");

  blocks.forEach((block, index) => {
    html = html.replace(`__DRISHVARA_HF09_PROTECTED_BLOCK_${index}__`, block);
  });

  return html;
}

function stripHF09(html) {
  html = html.replace(new RegExp('<style\\b[^>]*data-drishvara-hf09-flicker-guard[^>]*>[\\s\\S]*?<\\/style>', 'gi'), "");
  html = html.replace(new RegExp('<link\\b[^>]*data-drishvara-hf09-favicon[^>]*>', 'gi'), "");
  return html;
}

function flickerGuardStyle() {
  return `
<style data-drishvara-hf09-flicker-guard="true">
  /*
    HF09 early paint guard.
    Prevents legacy nav/header fragments and accidental text artifacts from flashing during navigation.
  */
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

  [data-drishvara-hf07-unified-header] {
    visibility: visible !important;
    opacity: 1 !important;
  }

  [data-drishvara-hf07-nav] {
    display: flex !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
</style>`;
}

function faviconLinks(rel) {
  const pre = prefixFor(rel);
  return `
<link rel="icon" type="image/svg+xml" href="${pre}assets/drishvara-favicon.svg" data-drishvara-hf09-favicon="true">
<link rel="shortcut icon" type="image/svg+xml" href="${pre}assets/drishvara-favicon.svg" data-drishvara-hf09-favicon="true">`;
}

function insertBeforeHeadClose(html, insert) {
  if (html.includes("</head>")) return html.replace("</head>", `${insert}\n</head>`);
  return `${insert}\n${html}`;
}

function authHrefFor(rel) {
  return `${prefixFor(rel)}login.html`;
}

function convertSigninLinks(html, rel) {
  const href = authHrefFor(rel);
  html = html.replace(/<a\b([^>]*data-drishvara-auth-placeholder="true"[^>]*)href="#"/gi, `<a$1href="${href}"`);
  html = html.replace(/<a\b([^>]*href="#\"[^>]*data-drishvara-auth-placeholder="true"[^>]*)/gi, function (m) {
    return m.replace('href="#"', `href="${href}"`);
  });

  // Prevent old scripts from blocking the new login page link.
  html = html.replace(/link\.addEventListener\("click", function \(event\) \{\s*event\.preventDefault\(\);\s*\}\);/g, "");
  html = html.replace(/event\.preventDefault\(\);\s*\/\/ HF09 removed static auth-blocker/g, "");

  return html;
}

function loginPageHtml() {
  return `<!doctype html>
<html lang="en" data-drishvara-language="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sign in / Join · Drishvara</title>
  <meta name="description" content="Static sign in and join preview for Drishvara. Account access is not active yet.">
  <link rel="icon" type="image/svg+xml" href="assets/drishvara-favicon.svg" data-drishvara-hf09-favicon="true">
  <link rel="shortcut icon" type="image/svg+xml" href="assets/drishvara-favicon.svg" data-drishvara-hf09-favicon="true">
  <style data-drishvara-hf09-flicker-guard="true">
    :root {
      --drishvara-bg: #071329;
      --drishvara-panel: rgba(20, 38, 72, 0.82);
      --drishvara-gold: #d7ad45;
      --drishvara-text: #f8f1df;
      --drishvara-muted: rgba(248, 241, 223, 0.74);
      --drishvara-border: rgba(211, 169, 72, 0.32);
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      min-height: 100vh;
      font-family: Georgia, "Times New Roman", serif;
      color: var(--drishvara-text);
      background:
        radial-gradient(circle at top, rgba(211, 169, 72, 0.14), transparent 34rem),
        linear-gradient(180deg, #071329 0%, #0b1833 100%);
    }

    .drishvara-login-shell {
      width: min(1120px, calc(100% - 32px));
      margin: 0 auto;
      padding: 24px 0 56px;
    }

    .drishvara-login-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 14px 18px;
      border: 1px solid var(--drishvara-border);
      border-radius: 24px;
      background: rgba(8, 20, 44, 0.94);
      box-shadow: 0 18px 52px rgba(0,0,0,0.22);
    }

    .drishvara-login-brand {
      color: var(--drishvara-gold);
      font-weight: 800;
      text-decoration: none;
      letter-spacing: 0.02em;
    }

    .drishvara-login-nav {
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem 1rem;
      justify-content: flex-end;
    }

    .drishvara-login-nav a {
      color: var(--drishvara-text);
      text-decoration: none;
      white-space: nowrap;
    }

    .drishvara-login-main {
      display: grid;
      grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
      gap: 28px;
      align-items: stretch;
      margin-top: 52px;
    }

    .drishvara-login-hero,
    .drishvara-login-card {
      border: 1px solid rgba(211, 169, 72, 0.25);
      border-radius: 28px;
      background: var(--drishvara-panel);
      padding: clamp(24px, 4vw, 44px);
      box-shadow: 0 22px 70px rgba(0,0,0,0.24);
    }

    .drishvara-kicker {
      color: var(--drishvara-gold);
      text-transform: uppercase;
      letter-spacing: 0.16em;
      font-size: 0.78rem;
      font-weight: 700;
    }

    h1 {
      margin: 12px 0 16px;
      font-size: clamp(2.4rem, 6vw, 4.8rem);
      line-height: 0.98;
    }

    p {
      color: var(--drishvara-muted);
      line-height: 1.7;
      font-size: 1.05rem;
    }

    .drishvara-login-note {
      margin-top: 24px;
      padding: 16px 18px;
      border-radius: 18px;
      border: 1px solid rgba(211, 169, 72, 0.24);
      background: rgba(7, 19, 41, 0.58);
      color: var(--drishvara-muted);
    }

    .drishvara-disabled-form {
      display: grid;
      gap: 14px;
      margin-top: 20px;
    }

    .drishvara-disabled-form label {
      display: grid;
      gap: 7px;
      color: var(--drishvara-muted);
    }

    .drishvara-disabled-form input {
      width: 100%;
      border: 1px solid rgba(248, 241, 223, 0.16);
      border-radius: 14px;
      padding: 12px 14px;
      background: rgba(5, 16, 37, 0.72);
      color: var(--drishvara-text);
    }

    .drishvara-disabled-form input:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .drishvara-disabled-button {
      margin-top: 8px;
      border: 0;
      border-radius: 999px;
      padding: 13px 18px;
      background: var(--drishvara-gold);
      color: #071329;
      font-weight: 800;
      cursor: not-allowed;
      opacity: 0.76;
    }

    .drishvara-path-list {
      margin: 22px 0 0;
      padding: 0;
      list-style: none;
      display: grid;
      gap: 12px;
    }

    .drishvara-path-list li {
      padding: 14px 16px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: var(--drishvara-muted);
    }

    @media (max-width: 860px) {
      .drishvara-login-header {
        flex-direction: column;
        text-align: center;
      }

      .drishvara-login-nav {
        justify-content: center;
      }

      .drishvara-login-main {
        grid-template-columns: 1fr;
        margin-top: 32px;
      }
    }
  </style>
</head>
<body data-drishvara-hf09-static-login-page="true">
  <div class="drishvara-login-shell">
    <header class="drishvara-login-header">
      <a class="drishvara-login-brand" href="index.html">Drishvara</a>
      <nav class="drishvara-login-nav" aria-label="Primary navigation">
        <a href="index.html">Home</a>
        <a href="about.html">About</a>
        <a href="insights.html">Insights</a>
        <a href="submissions.html">Submissions</a>
        <a href="dashboard.html">Dashboard</a>
        <a href="contact.html">Contact</a>
      </nav>
    </header>

    <main class="drishvara-login-main">
      <section class="drishvara-login-hero">
        <div class="drishvara-kicker">Access preview</div>
        <h1>Sign in / Join</h1>
        <p>
          Drishvara account access is being prepared carefully. The page is available as a static preview only;
          live sign-in, membership, personalization, and profile storage are not active yet.
        </p>
        <div class="drishvara-login-note">
          No credentials are collected on this page. When account access is enabled later, it will be introduced
          with explicit privacy, consent, deletion, and data-use boundaries.
        </div>
      </section>

      <section class="drishvara-login-card">
        <div class="drishvara-kicker">Coming later</div>
        <h2>Join pathway</h2>
        <p>
          Future access may include saved reading preferences, opt-in reflective guidance, submissions tracking,
          and member-specific settings after review and approval.
        </p>

        <form class="drishvara-disabled-form" aria-label="Static sign in preview">
          <label>
            Email
            <input type="email" placeholder="Not active yet" disabled>
          </label>
          <label>
            Password
            <input type="password" placeholder="Not active yet" disabled>
          </label>
          <button class="drishvara-disabled-button" type="button" disabled>Access not active</button>
        </form>

        <ul class="drishvara-path-list">
          <li>Static preview only — no backend connection.</li>
          <li>No user account, password, or personal data is stored.</li>
          <li>For communication, use the Contact page until account access is formally enabled.</li>
        </ul>
      </section>
    </main>
  </div>
</body>
</html>
`;
}

function makeFavicon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <radialGradient id="g" cx="50%" cy="35%" r="70%">
      <stop offset="0%" stop-color="#ffe38a"/>
      <stop offset="48%" stop-color="#d7ad45"/>
      <stop offset="100%" stop-color="#7b5a14"/>
    </radialGradient>
    <linearGradient id="b" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#071329"/>
      <stop offset="100%" stop-color="#10254c"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="28" fill="url(#b)"/>
  <path d="M30 75c18-34 48-45 73-30-16 2-29 10-39 24 14-7 28-7 43 1-22 30-62 35-87 16 10 1 21-2 31-9-8 1-15 0-21-2z" fill="url(#g)"/>
  <circle cx="65" cy="70" r="8" fill="#ffe9a6"/>
  <path d="M70 30c8 10 4 20-6 27 2-9-1-15-7-20 8 1 11-3 13-7z" fill="#f2c95d"/>
  <path d="M76 17c14 16 12 30-4 42 5-14 2-25-8-34 7 1 10-2 12-8z" fill="#d7ad45"/>
</svg>
`;
}

const registry = readJson(registryPath);
fs.mkdirSync(path.dirname(faviconPath), { recursive: true });
fs.writeFileSync(faviconPath, makeFavicon());

const htmlFiles = walkHtml(root);
const modifiedFiles = [];
const fileResults = [];

for (const rel of htmlFiles) {
  const full = path.join(root, rel);
  let before = fs.readFileSync(full, "utf8");
  let html = stripHF09(before);
  const changes = [];

  html = stripProtectedAndCleanLiteralNewline(html);

  html = insertBeforeHeadClose(html, faviconLinks(rel));
  changes.push("inserted_favicon_links");

  if (rel !== "login.html") {
    html = insertBeforeHeadClose(html, flickerGuardStyle());
    changes.push("inserted_early_flicker_guard");
    html = convertSigninLinks(html, rel);
    changes.push("converted_signin_join_href");
  }

  if (rel === "login.html") {
    html = loginPageHtml();
    changes.push("created_static_login_page");
  }

  if (html !== before) {
    fs.writeFileSync(full, html);
    modifiedFiles.push(rel);
  }

  fileResults.push({ file: rel, changes });
}

const output = {
  apply_id: "HF09_SMOOTH_NAV_SIGNIN_FAVICON_APPLY_RESULT",
  module_id: "HF09",
  status: "targeted_static_frontend_smooth_nav_signin_favicon_applied",
  applied: true,
  scanned_html_file_count: htmlFiles.length,
  modified_files: modifiedFiles,
  favicon_created: fs.existsSync(faviconPath),
  file_results: fileResults,
  summary: {
    modified_file_count: modifiedFiles.length,
    index_modified: modifiedFiles.includes("index.html"),
    login_page_created: fs.existsSync(path.join(root, "login.html")),
    favicon_created: fs.existsSync(faviconPath),
    favicon_link_file_count: fileResults.filter((x) => x.changes.includes("inserted_favicon_links")).length,
    flicker_guard_file_count: fileResults.filter((x) => x.changes.includes("inserted_early_flicker_guard")).length,
    signin_link_conversion_file_count: fileResults.filter((x) => x.changes.includes("converted_signin_join_href")).length,
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
console.log(`Login page created: ${output.summary.login_page_created}`);
console.log(`Favicon created: ${output.summary.favicon_created}`);
console.log(`Flicker guard files: ${output.summary.flicker_guard_file_count}`);
