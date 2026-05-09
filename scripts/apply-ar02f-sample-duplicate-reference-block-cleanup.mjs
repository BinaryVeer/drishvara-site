import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ar02f-sample-duplicate-reference-block-cleanup.json");
const sampleRegistryPath = path.join(root, "data", "editorial", "ar02b-sample-verified-reference-candidates.json");
const ar02eResultPath = path.join(root, "data", "editorial", "ar02e-sample-reference-live-review-result.json");
const applyOutPath = path.join(root, "data", "quality", "ar02f-sample-duplicate-reference-block-cleanup-apply-result.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function normalise(value) {
  return String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function stripAr02cBlocks(html) {
  return html.replace(/<section\b[^>]*data-drishvara-ar02c-sample-reference-block="true"[^>]*>[\s\S]*?<\/section>/gi, "");
}

function countLegacyOutsideAr02c(html, phrases) {
  const outside = normalise(stripAr02cBlocks(html));
  return phrases.filter((phrase) => outside.includes(normalise(phrase))).length;
}

function restoreAr02cImageCredit(block) {
  if (block.includes('data-drishvara-ar02c-image-credit="true"')) return block;

  const credit = `
  <div class="drishvara-ar01-image-credit" data-drishvara-ar01-image-credit="true" data-drishvara-ar02c-image-credit="true">
    Image credit / attribution: Drishvara editorial visual. Final source attribution for article imagery, where applicable, remains under editorial verification.
  </div>`;

  return block.replace(/<\/section>\s*$/i, `${credit}\n</section>`);
}

function protectAr02cBlocks(html) {
  const protectedBlocks = [];
  const protectedHtml = html.replace(/<section\b[^>]*data-drishvara-ar02c-sample-reference-block="true"[^>]*>[\s\S]*?<\/section>/gi, (block) => {
    const index = protectedBlocks.length;
    protectedBlocks.push(restoreAr02cImageCredit(block));
    return `<!--DRISHVARA_AR02C_PROTECTED_BLOCK_${index}-->`;
  });

  return { protectedHtml, protectedBlocks };
}

function restoreProtectedBlocks(html, protectedBlocks) {
  let restored = html;
  protectedBlocks.forEach((block, index) => {
    restored = restored.replace(`<!--DRISHVARA_AR02C_PROTECTED_BLOCK_${index}-->`, block);
  });
  return restored;
}

function removeLegacyBlocksOutsideProtectedAr02c(html, phrases) {
  let removedCount = 0;
  const tags = ["section", "aside", "div"];

  for (const tag of tags) {
    const pattern = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, "gi");

    html = html.replace(pattern, (block) => {
      const n = normalise(block);
      const hasLegacyPhrase = phrases.some((phrase) => n.includes(normalise(phrase)));

      if (hasLegacyPhrase) {
        removedCount += 1;
        return "";
      }

      return block;
    });
  }

  return { html, removedCount };
}

function markCleanupChecked(html) {
  if (html.includes('data-drishvara-ar02f-cleanup-checked="true"')) return html;

  const marker = '<meta data-drishvara-ar02f-cleanup-checked="true" content="sample-duplicate-cleanup-checked">';
  if (html.includes("</head>")) return html.replace("</head>", `${marker}\n</head>`);
  return `${marker}\n${html}`;
}

const registry = readJson(registryPath);
const sample = readJson(sampleRegistryPath);
const ar02e = readJson(ar02eResultPath);

if (sample.sample_article_count !== 5) throw new Error("AR02F requires five AR02B sample articles.");
if (ar02e.ready_for_scale_up !== false) throw new Error("AR02F expects AR02E to block scale-up before cleanup.");

const phrases = registry.legacy_phrases_to_remove_outside_ar02c;
const modifiedFiles = [];
const fileResults = [];

for (const entry of sample.entries) {
  const rel = entry.article_path;
  const full = path.join(root, rel);

  if (!fs.existsSync(full)) throw new Error(`Missing sample article: ${rel}`);

  const before = fs.readFileSync(full, "utf8");
  const legacyBefore = countLegacyOutsideAr02c(before, phrases);

  const protectedResult = protectAr02cBlocks(before);
  const cleanupResult = removeLegacyBlocksOutsideProtectedAr02c(protectedResult.protectedHtml, phrases);

  let html = restoreProtectedBlocks(cleanupResult.html, protectedResult.protectedBlocks);
  html = markCleanupChecked(html);

  const legacyAfter = countLegacyOutsideAr02c(html, phrases);
  const ar02cBlockCount = (html.match(/data-drishvara-ar02c-sample-reference-block="true"/g) || []).length;
  const ar02cLinkCount = (html.match(/data-drishvara-ar02c-reference-link="true"/g) || []).length;
  const imageCreditPresent = html.includes('data-drishvara-ar02c-image-credit="true"');

  if (html !== before) {
    fs.writeFileSync(full, html);
    modifiedFiles.push(rel);
  }

  fileResults.push({
    article_path: rel,
    modified: html !== before,
    legacy_phrase_count_before: legacyBefore,
    legacy_phrase_count_after: legacyAfter,
    legacy_blocks_removed: cleanupResult.removedCount,
    ar02c_block_count: ar02cBlockCount,
    ar02c_reference_link_count: ar02cLinkCount,
    ar02c_image_credit_present: imageCreditPresent,
    expected_urls_preserved: entry.references.every((ref) => html.includes(ref.url))
  });
}

const applyResult = {
  apply_id: "AR02F_SAMPLE_DUPLICATE_REFERENCE_BLOCK_CLEANUP_APPLY_RESULT",
  module_id: "AR02F",
  status: "sample_duplicate_cleanup_applied",
  applied: true,
  sample_article_count: sample.sample_article_count,
  modified_files: modifiedFiles,
  file_results: fileResults,
  summary: {
    scanned_sample_article_count: fileResults.length,
    modified_file_count: modifiedFiles.length,
    total_legacy_blocks_removed: fileResults.reduce((sum, row) => sum + row.legacy_blocks_removed, 0),
    every_sample_has_ar02c_block: fileResults.every((row) => row.ar02c_block_count === 1),
    every_sample_has_two_ar02c_links: fileResults.every((row) => row.ar02c_reference_link_count === 2),
    every_sample_has_image_credit: fileResults.every((row) => row.ar02c_image_credit_present),
    every_sample_preserves_expected_urls: fileResults.every((row) => row.expected_urls_preserved),
    no_legacy_phrases_outside_ar02c: fileResults.every((row) => row.legacy_phrase_count_after === 0),
    non_sample_article_mutation_performed: false,
    external_fetch_performed: false,
    new_reference_generation_performed: false,
    reference_url_change_performed: false,
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
console.log(`Sample articles scanned: ${applyResult.summary.scanned_sample_article_count}`);
console.log(`Modified files: ${applyResult.summary.modified_file_count}`);
console.log(`Legacy blocks removed: ${applyResult.summary.total_legacy_blocks_removed}`);
console.log(`Every sample has image credit: ${applyResult.summary.every_sample_has_image_credit}`);
console.log(`No legacy phrases outside AR02C: ${applyResult.summary.no_legacy_phrases_outside_ar02c}`);
