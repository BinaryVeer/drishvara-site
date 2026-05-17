import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const configPath = path.join(root, "data", "quality", "ag03c-b3-article-reference-insertion.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttr(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function stripAg03cB3(html) {
  html = html.replace(/<section\b[^>]*data-drishvara-ag03c-b3-reference-block="true"[^>]*>[\s\S]*?<\/section>\s*/gi, "");
  html = html.replace(/<meta\b[^>]*data-drishvara-ag03c-b3-checked="true"[^>]*>\s*/gi, "");
  return html;
}

function markChecked(html) {
  if (html.includes('data-drishvara-ag03c-b3-checked="true"')) return html;
  const marker = '<meta data-drishvara-ag03c-b3-checked="true" content="batch-03-approved-references-inserted">';
  if (html.includes("</head>")) return html.replace("</head>", `${marker}\n</head>`);
  return `${marker}\n${html}`;
}

function referenceBlock(entry) {
  const links = entry.references.map((ref) => {
    return `<li>
      <a data-drishvara-ag03c-b3-reference-link="true" href="${escapeAttr(ref.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(ref.title)}</a>
      <span class="drishvara-reference-source"> — ${escapeHtml(ref.publisher)}</span>
    </li>`;
  }).join("\n");

  return `<section class="drishvara-article-evidence" data-drishvara-ag03c-b3-reference-block="true" data-drishvara-ag03c-batch="03">
  <h2>References</h2>
  <p>Verified references approved under AG03B-B3-R1 for Batch 3 insertion.</p>
  <ol>
${links}
  </ol>
</section>
`;
}

function insertReferenceBlock(html, entry) {
  const block = referenceBlock(entry);

  const ar01Match = html.match(/<section\b[^>]*data-drishvara-ar01-evidence-block="true"[^>]*>[\s\S]*?<\/section>/i);
  if (ar01Match && typeof ar01Match.index === "number") {
    return html.slice(0, ar01Match.index) + block + html.slice(ar01Match.index);
  }

  const mainClose = html.search(/<\/main>/i);
  if (mainClose >= 0) {
    return html.slice(0, mainClose) + block + html.slice(mainClose);
  }

  const bodyClose = html.search(/<\/body>/i);
  if (bodyClose >= 0) {
    return html.slice(0, bodyClose) + block + html.slice(bodyClose);
  }

  return `${html}\n${block}`;
}

function count(html, marker) {
  return (html.match(new RegExp(marker, "g")) || []).length;
}

const config = readJson(configPath);
const approval = readJson(path.join(root, config.input_files.approval_record));

const modifiedFiles = [];
const fileResults = [];

for (const entry of approval.entries || []) {
  const rel = entry.article_path;
  const full = path.join(root, rel);

  if (!fs.existsSync(full)) throw new Error(`Approved Batch 3 article page missing: ${rel}`);

  const before = fs.readFileSync(full, "utf8");
  const beforeWithoutAg03cB3 = stripAg03cB3(before);

  let html = insertReferenceBlock(beforeWithoutAg03cB3, entry);
  html = markChecked(html);

  if (html !== before) {
    fs.writeFileSync(full, html);
    modifiedFiles.push(rel);
  }

  const insertedUrls = entry.references.map((ref) => ref.url);
  const actualInserted = insertedUrls.filter((url) => html.includes(url));

  fileResults.push({
    article_path: rel,
    modified: html !== before,
    approved_reference_count: entry.references.length,
    ag03c_b3_reference_link_count: count(html, 'data-drishvara-ag03c-b3-reference-link="true"'),
    ag03c_b3_reference_block_count: count(html, 'data-drishvara-ag03c-b3-reference-block="true"'),
    ag03c_b3_checked_present: html.includes('data-drishvara-ag03c-b3-checked="true"'),
    inserted_urls: actualInserted,
    inserted_url_count: actualInserted.length,
    inserted_urls_match_approval: actualInserted.length === insertedUrls.length && insertedUrls.every((url) => html.includes(url)),

    before_ag02_hero_present: beforeWithoutAg03cB3.includes('data-drishvara-ag02-hero-visual="true"'),
    after_ag02_hero_present: html.includes('data-drishvara-ag02-hero-visual="true"'),
    ag02_hero_preserved: !beforeWithoutAg03cB3.includes('data-drishvara-ag02-hero-visual="true"') || html.includes('data-drishvara-ag02-hero-visual="true"'),

    before_ag02_credit_present: beforeWithoutAg03cB3.includes('data-drishvara-ag02-image-credit="true"'),
    after_ag02_credit_present: html.includes('data-drishvara-ag02-image-credit="true"'),
    ag02_credit_preserved: !beforeWithoutAg03cB3.includes('data-drishvara-ag02-image-credit="true"') || html.includes('data-drishvara-ag02-image-credit="true"')
  });
}

const applyResult = {
  apply_id: "AG03C_B3_ARTICLE_REFERENCE_INSERTION_APPLY_RESULT",
  module_id: "AG03C-B3",
  status: "batch_03_approved_references_inserted",
  applied: true,
  mutation_performed: true,
  article_html_mutation_performed: true,
  article_text_mutation_performed: false,
  article_image_mutation_performed: false,
  image_credit_mutation_performed: false,
  reference_url_change_performed: false,
  new_reference_insertion_performed: true,
  external_fetch_performed_by_script: false,
  backend_activation_performed: false,
  api_route_created: false,
  supabase_enabled: false,
  auth_enabled: false,
  real_login_enabled: false,
  real_signup_enabled: false,
  user_account_collection_enabled: false,
  frontend_deployment_performed: false,
  file_deletion_performed: false,
  file_move_performed: false,
  modified_files: modifiedFiles,
  summary: {
    approved_article_count: approval.summary.approved_article_count,
    processed_article_count: fileResults.length,
    modified_article_count: modifiedFiles.length,
    expected_reference_count: approval.summary.approved_reference_count,
    inserted_reference_count: fileResults.reduce((sum, row) => sum + row.inserted_url_count, 0),
    articles_with_two_ag03c_b3_reference_links: fileResults.filter((row) => row.ag03c_b3_reference_link_count === 2).length,
    every_article_has_one_ag03c_b3_block: fileResults.every((row) => row.ag03c_b3_reference_block_count === 1),
    every_article_has_checked_marker: fileResults.every((row) => row.ag03c_b3_checked_present),
    every_article_matches_approval_urls: fileResults.every((row) => row.inserted_urls_match_approval),
    every_article_preserves_ag02_hero: fileResults.every((row) => row.ag02_hero_preserved),
    every_article_preserves_ag02_credit: fileResults.every((row) => row.ag02_credit_preserved),
    non_batch_article_mutation_performed: false,
    backend_activation_performed: false,
    supabase_enabled: false,
    auth_enabled: false
  },
  file_results: fileResults,
  blocked_capabilities: config.blocked_capabilities
};

const preview = {
  preview_id: "AG03C_B3_ARTICLE_REFERENCE_INSERTION_PREVIEW",
  module_id: "AG03C-B3",
  status: "preview_after_batch_03_reference_insertion",
  preview_only: true,
  summary: applyResult.summary,
  sample_entries: fileResults.slice(0, 12).map((row) => ({
    article_path: row.article_path,
    ag03c_b3_reference_link_count: row.ag03c_b3_reference_link_count,
    inserted_url_count: row.inserted_url_count,
    before_ag02_hero_present: row.before_ag02_hero_present,
    after_ag02_hero_present: row.after_ag02_hero_present,
    ag02_hero_preserved: row.ag02_hero_preserved,
    before_ag02_credit_present: row.before_ag02_credit_present,
    after_ag02_credit_present: row.after_ag02_credit_present,
    ag02_credit_preserved: row.ag02_credit_preserved
  })),
  mutation_performed: true,
  next_recommended_stage: config.recommended_next_stage
};

writeJson(path.join(root, config.outputs.apply_result), applyResult);
writeJson(path.join(root, config.outputs.preview), preview);

console.log(`Created ${config.outputs.apply_result}.`);
console.log(`Created ${config.outputs.preview}.`);
console.log(`Processed articles: ${applyResult.summary.processed_article_count}`);
console.log(`Modified articles: ${applyResult.summary.modified_article_count}`);
console.log(`Inserted references: ${applyResult.summary.inserted_reference_count}`);
console.log(`Articles with two AG03C-B3 links: ${applyResult.summary.articles_with_two_ag03c_b3_reference_links}`);
console.log(`All URLs match approval: ${applyResult.summary.every_article_matches_approval_urls}`);
console.log(`AG02 hero preserved where present: ${applyResult.summary.every_article_preserves_ag02_hero}`);
console.log(`AG02 credit preserved where present: ${applyResult.summary.every_article_preserves_ag02_credit}`);
