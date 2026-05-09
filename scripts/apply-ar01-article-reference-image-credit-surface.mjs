import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "ar01-article-reference-image-credit-surface-patch.json");
const applyOutPath = path.join(root, "data", "quality", "ar01-article-reference-image-credit-surface-apply-result.json");
const editorialRegistryPath = path.join(root, "data", "editorial", "article-reference-image-credit-registry.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function walkArticleHtml() {
  const articleRoot = path.join(root, "articles");
  const files = [];

  if (!fs.existsSync(articleRoot)) return files;

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      const rel = path.relative(root, full).replaceAll(path.sep, "/");

      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile() && rel.endsWith(".html")) {
        files.push(rel);
      }
    }
  }

  walk(articleRoot);
  return files.sort();
}

function stripAR01(html) {
  html = html.replace(new RegExp('<style\\b[^>]*data-drishvara-ar01-reference-image-credit-style[^>]*>[\\s\\S]*?<\\/style>', 'gi'), "");
  html = html.replace(new RegExp('<section\\b[^>]*data-drishvara-ar01-evidence-block[^>]*>[\\s\\S]*?<\\/section>', 'gi'), "");
  return html;
}

function insertBefore(html, closingTag, insert) {
  if (html.includes(closingTag)) return html.replace(closingTag, `${insert}\n${closingTag}`);
  return `${html}\n${insert}`;
}

function insertBeforeHeadClose(html, insert) {
  if (html.includes("</head>")) return html.replace("</head>", `${insert}\n</head>`);
  return `${insert}\n${html}`;
}

function titleFromHtml(html, rel) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return h1[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (title) return title[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

  return rel.split("/").pop().replace(".html", "").replaceAll("-", " ");
}

function categoryFromPath(rel) {
  const parts = rel.split("/");
  return parts.length >= 3 ? parts[1] : "uncategorised";
}

function styleBlock() {
  return `
<style data-drishvara-ar01-reference-image-credit-style="true">
  .drishvara-ar01-evidence {
    margin: 2.4rem auto 1.4rem;
    padding: clamp(1.2rem, 2vw, 1.6rem);
    border: 1px solid rgba(211, 169, 72, 0.28);
    border-radius: 22px;
    background: rgba(12, 27, 56, 0.76);
    color: #f8f1df;
  }

  .drishvara-ar01-evidence h2 {
    margin: 0 0 0.75rem;
    font-size: clamp(1.2rem, 2vw, 1.55rem);
    line-height: 1.2;
  }

  .drishvara-ar01-evidence p {
    margin: 0.4rem 0;
    color: rgba(248, 241, 223, 0.78);
    line-height: 1.65;
  }

  .drishvara-ar01-reference-list {
    display: grid;
    gap: 0.6rem;
    margin: 1rem 0;
    padding-left: 1.25rem;
  }

  .drishvara-ar01-reference-list li {
    color: rgba(248, 241, 223, 0.82);
    line-height: 1.55;
  }

  .drishvara-ar01-status {
    display: inline-flex;
    width: fit-content;
    margin: 0.35rem 0 0.7rem;
    padding: 0.32rem 0.7rem;
    border-radius: 999px;
    border: 1px solid rgba(211, 169, 72, 0.34);
    color: #d7ad45;
    font-size: 0.86rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .drishvara-ar01-image-credit {
    margin-top: 1rem;
    padding-top: 0.8rem;
    border-top: 1px solid rgba(248, 241, 223, 0.12);
    color: rgba(248, 241, 223, 0.66);
    font-size: 0.92rem;
    line-height: 1.55;
  }
</style>`;
}

function evidenceBlock(title, rel) {
  const category = categoryFromPath(rel);
  return `
<section class="drishvara-ar01-evidence" data-drishvara-ar01-evidence-block="true" aria-label="Editorial references and image credit">
  <h2>Editorial references and image credit</h2>
  <span class="drishvara-ar01-status" data-drishvara-ar01-reference-status="under_editorial_verification">Under editorial verification</span>
  <p>
    Reference links for this article are being verified through Drishvara’s editorial process. Links will be displayed only after they are checked for relevance, reachability, credibility, and non-error availability.
  </p>
  <ol class="drishvara-ar01-reference-list">
    <li data-drishvara-ar01-reference-slot="1"><strong>Reference 1:</strong> Under editorial verification.</li>
    <li data-drishvara-ar01-reference-slot="2"><strong>Reference 2:</strong> Under editorial verification.</li>
  </ol>
  <div class="drishvara-ar01-image-credit" data-drishvara-ar01-image-credit="true">
    Image credit / attribution: Drishvara editorial visual for “${title.replaceAll('"', '&quot;')}” (${category}). Final image-source attribution, where applicable, is under editorial verification.
  </div>
</section>`;
}

const config = readJson(registryPath);
const files = walkArticleHtml();
const modifiedFiles = [];
const articleEntries = [];

for (const rel of files) {
  const full = path.join(root, rel);
  const before = fs.readFileSync(full, "utf8");
  let html = stripAR01(before);
  const title = titleFromHtml(html, rel);

  html = insertBeforeHeadClose(html, styleBlock());

  const block = evidenceBlock(title, rel);
  if (html.includes("</article>")) {
    html = insertBefore(html, "</article>", block);
  } else if (html.includes("</main>")) {
    html = insertBefore(html, "</main>", block);
  } else {
    html = insertBefore(html, "</body>", block);
  }

  if (html !== before) {
    fs.writeFileSync(full, html);
    modifiedFiles.push(rel);
  }

  articleEntries.push({
    article_path: rel,
    category: categoryFromPath(rel),
    title,
    reference_status: "under_editorial_verification",
    required_reference_slots: 2,
    verified_reference_count: 0,
    reference_slots: [
      {
        slot: 1,
        status: "under_editorial_verification",
        url: null,
        verification_notes: "Pending AR02 verified reference selection."
      },
      {
        slot: 2,
        status: "under_editorial_verification",
        url: null,
        verification_notes: "Pending AR02 verified reference selection."
      }
    ],
    image_credit_status: "under_editorial_verification",
    image_credit_note: "Visible AR01 image-credit block added; final source attribution pending where applicable."
  });
}

const editorialRegistry = {
  registry_id: "AR01_ARTICLE_REFERENCE_IMAGE_CREDIT_REGISTRY",
  module_id: "AR01",
  status: "created",
  reference_policy: config.reference_policy,
  article_count: articleEntries.length,
  verified_reference_count: 0,
  all_articles_under_editorial_verification: true,
  articles: articleEntries
};

fs.mkdirSync(path.dirname(editorialRegistryPath), { recursive: true });
fs.writeFileSync(editorialRegistryPath, JSON.stringify(editorialRegistry, null, 2) + "\n");

const applyResult = {
  apply_id: "AR01_ARTICLE_REFERENCE_IMAGE_CREDIT_SURFACE_APPLY_RESULT",
  module_id: "AR01",
  status: "article_reference_image_credit_surface_applied",
  applied: true,
  scanned_article_file_count: files.length,
  modified_files: modifiedFiles,
  editorial_registry_created: fs.existsSync(editorialRegistryPath),
  summary: {
    modified_file_count: modifiedFiles.length,
    article_count: articleEntries.length,
    evidence_block_file_count: articleEntries.length,
    reference_slots_per_article: 2,
    verified_reference_count: 0,
    all_articles_under_editorial_verification: true,
    unverified_external_links_inserted: false,
    external_link_verification_performed: false,
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
  blocked_capabilities: config.blocked_capabilities
};

fs.writeFileSync(applyOutPath, JSON.stringify(applyResult, null, 2) + "\n");

console.log(`Created ${path.relative(root, applyOutPath)}.`);
console.log(`Created ${path.relative(root, editorialRegistryPath)}.`);
console.log(`Article files scanned: ${files.length}`);
console.log(`Article files modified: ${modifiedFiles.length}`);
console.log(`Verified references inserted: 0`);
