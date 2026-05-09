import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ar02c-sample-article-reference-insertion-patch.json");
const sampleRegistryPath = path.join(root, "data", "editorial", "ar02b-sample-verified-reference-candidates.json");
const applyOutPath = path.join(root, "data", "quality", "ar02c-sample-article-reference-insertion-apply-result.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function stripAR02CStyle(html) {
  return html.replace(new RegExp('<style\\b[^>]*data-drishvara-ar02c-sample-reference-style[^>]*>[\\s\\S]*?<\\/style>', 'gi'), "");
}

function insertBeforeHeadClose(html, insert) {
  if (html.includes("</head>")) return html.replace("</head>", `${insert}\n</head>`);
  return `${insert}\n${html}`;
}

function styleBlock() {
  return `
<style data-drishvara-ar02c-sample-reference-style="true">
  .drishvara-ar02c-verified {
    border-color: rgba(91, 196, 132, 0.34) !important;
    background: linear-gradient(180deg, rgba(12, 47, 39, 0.72), rgba(12, 27, 56, 0.78)) !important;
  }

  .drishvara-ar02c-status {
    color: #8be0a4 !important;
    border-color: rgba(139, 224, 164, 0.38) !important;
  }

  .drishvara-ar02c-reference-list {
    display: grid;
    gap: 0.8rem;
    margin: 1rem 0;
    padding-left: 1.25rem;
  }

  .drishvara-ar02c-reference-list li {
    line-height: 1.55;
  }

  .drishvara-ar02c-reference-list a {
    color: #ffe38a;
    text-decoration: underline;
    text-underline-offset: 0.18em;
  }

  .drishvara-ar02c-reference-meta {
    display: block;
    margin-top: 0.25rem;
    color: rgba(248, 241, 223, 0.68);
    font-size: 0.92rem;
  }
</style>`;
}

function referenceBlock(entry) {
  const refs = entry.references;
  if (!Array.isArray(refs) || refs.length !== 2) {
    throw new Error(`AR02C requires exactly two accepted references for ${entry.article_path}`);
  }

  const refItems = refs.map((ref) => {
    return `<li data-drishvara-ar01-reference-slot="${ref.slot}" data-drishvara-ar02c-reference-link="true">
      <a href="${escapeHtml(ref.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(ref.title)}</a>
      <span class="drishvara-ar02c-reference-meta">Source: ${escapeHtml(ref.source_name)} · Type: ${escapeHtml(ref.source_type)} · AR02B decision: ${escapeHtml(ref.decision)}</span>
    </li>`;
  }).join("\n    ");

  return `
<section class="drishvara-ar01-evidence drishvara-ar02c-verified" data-drishvara-ar01-evidence-block="true" data-drishvara-ar02c-sample-reference-block="true" aria-label="Editorial references and image credit">
  <h2>Editorial references and image credit</h2>
  <span class="drishvara-ar01-status drishvara-ar02c-status" data-drishvara-ar01-reference-status="ar02c_sample_accepted" data-drishvara-ar02c-reference-status="sample_accepted">Sample references accepted</span>
  <p>
    The following two references have been selected through Drishvara’s AR02B sample verified-reference workbench. Remaining articles will continue to show “under editorial verification” until their own reference checks are completed.
  </p>
  <ol class="drishvara-ar01-reference-list drishvara-ar02c-reference-list">
    ${refItems}
  </ol>
  <div class="drishvara-ar01-image-credit" data-drishvara-ar01-image-credit="true" data-drishvara-ar02c-image-credit="true">
    Image credit / attribution: Drishvara editorial visual. Final source attribution for article imagery, where applicable, remains under editorial verification.
  </div>
</section>`;
}

function replaceEvidenceBlock(html, entry) {
  const blockPattern = /<section\b[^>]*data-drishvara-ar01-evidence-block="true"[^>]*>[\s\S]*?<\/section>/i;
  if (!blockPattern.test(html)) {
    throw new Error(`AR01 evidence block not found in ${entry.article_path}`);
  }
  return html.replace(blockPattern, referenceBlock(entry));
}

const registry = readJson(registryPath);
const sample = readJson(sampleRegistryPath);

if (sample.sample_article_count !== 5) {
  throw new Error("AR02C requires exactly five AR02B sample articles.");
}

const modifiedFiles = [];
const fileResults = [];

for (const entry of sample.entries) {
  const rel = entry.article_path;
  const full = path.join(root, rel);

  if (!fs.existsSync(full)) throw new Error(`Missing sample article: ${rel}`);

  const before = fs.readFileSync(full, "utf8");
  let html = stripAR02CStyle(before);
  html = insertBeforeHeadClose(html, styleBlock());
  html = replaceEvidenceBlock(html, entry);

  const linkCount = (html.match(/data-drishvara-ar02c-reference-link="true"/g) || []).length;
  const blockCount = (html.match(/data-drishvara-ar02c-sample-reference-block="true"/g) || []).length;

  if (html !== before) {
    fs.writeFileSync(full, html);
    modifiedFiles.push(rel);
  }

  fileResults.push({
    article_path: rel,
    modified: html !== before,
    ar02c_block_count: blockCount,
    ar02c_reference_link_count: linkCount,
    image_credit_present: html.includes('data-drishvara-ar02c-image-credit="true"'),
    urls_inserted: entry.references.map((ref) => ref.url)
  });
}

const applyResult = {
  apply_id: "AR02C_SAMPLE_ARTICLE_REFERENCE_INSERTION_APPLY_RESULT",
  module_id: "AR02C",
  status: "sample_article_reference_insertion_applied",
  applied: true,
  sample_article_count: sample.sample_article_count,
  modified_files: modifiedFiles,
  file_results: fileResults,
  summary: {
    modified_file_count: modifiedFiles.length,
    exactly_five_sample_articles_modified: modifiedFiles.length === 5,
    total_reference_links_inserted: fileResults.reduce((sum, row) => sum + row.ar02c_reference_link_count, 0),
    every_sample_has_two_reference_links: fileResults.every((row) => row.ar02c_reference_link_count === 2),
    every_sample_has_image_credit: fileResults.every((row) => row.image_credit_present),
    non_sample_article_mutation_performed: false,
    external_fetch_performed: false,
    new_reference_generation_performed: false,
    random_reference_insertion_performed: false,
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

fs.writeFileSync(applyOutPath, JSON.stringify(applyResult, null, 2) + "\n");

console.log(`Created ${path.relative(root, applyOutPath)}.`);
console.log(`Modified sample articles: ${modifiedFiles.length}`);
console.log(`Reference links inserted: ${applyResult.summary.total_reference_links_inserted}`);
console.log(`Every sample has two links: ${applyResult.summary.every_sample_has_two_reference_links}`);
