import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const configPath = path.join(root, "data", "quality", "ag03z-final-verified-reference-closure-audit.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

function countAg03ReferenceLinks(html) {
  return (html.match(/data-drishvara-ag03c[^=\s>"]*reference-link="true"/g) || []).length;
}

function countAg03ReferenceBlocks(html) {
  return (html.match(/data-drishvara-ag03c[^=\s>"]*reference-block="true"/g) || []).length;
}

function countAg03CheckedMarkers(html) {
  return (html.match(/data-drishvara-ag03c[^=\s>"]*checked="true"/g) || []).length;
}

const config = readJson(configPath);
const ag03a = readJson(path.join(root, config.input_files.ag03a_queue));
const ag03dB6 = readJson(path.join(root, config.input_files.ag03d_b6_audit));

const completedPaths = ag03dB6.completed_reference_scaling_articles_after_batch_6 || [];

const articleResults = completedPaths.map((articlePath) => {
  const full = path.join(root, articlePath);
  if (!fs.existsSync(full)) throw new Error(`Completed AG03 article missing on disk: ${articlePath}`);

  const html = fs.readFileSync(full, "utf8");
  const ag03ReferenceLinkCount = countAg03ReferenceLinks(html);
  const ag03ReferenceBlockCount = countAg03ReferenceBlocks(html);
  const ag03CheckedMarkerCount = countAg03CheckedMarkers(html);

  return {
    article_path: articlePath,
    ag03_reference_link_count: ag03ReferenceLinkCount,
    ag03_reference_block_count: ag03ReferenceBlockCount,
    ag03_checked_marker_count: ag03CheckedMarkerCount,
    has_exactly_two_ag03_reference_links: ag03ReferenceLinkCount === config.expected.references_per_article,
    has_ag03_reference_block: ag03ReferenceBlockCount >= 1,
    has_ag03_checked_marker: ag03CheckedMarkerCount >= 1,
    scan_status: ag03ReferenceLinkCount === config.expected.references_per_article ? "passed" : "failed"
  };
});

const queueEntries = ag03a.entries || [];
const completedSet = new Set(completedPaths);
const missingFromCompletedSet = queueEntries
  .filter((entry) => !completedSet.has(entry.article_path))
  .map((entry) => ({
    queue_id: entry.queue_id,
    article_path: entry.article_path,
    category: entry.category,
    title: entry.title
  }));

const totalLiveAg03ReferenceLinks = articleResults.reduce((sum, row) => sum + row.ag03_reference_link_count, 0);

const closureAudit = {
  audit_id: "AG03Z_FINAL_VERIFIED_REFERENCE_CLOSURE_AUDIT",
  module_id: "AG03Z",
  status: "ag03_verified_reference_scaling_closed",
  generated_at: new Date().toISOString(),

  mutation_performed: false,
  article_html_mutation_performed: false,
  article_text_mutation_performed: false,
  article_image_mutation_performed: false,
  image_credit_mutation_performed: false,
  reference_url_change_performed: false,
  new_reference_insertion_performed: false,
  reference_candidate_population_performed: false,
  reference_approval_performed: false,
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

  source_context: {
    ag03a_queue_entry_count: queueEntries.length,
    ag03a_batch_count: (ag03a.batches || []).length,
    ag03d_b6_completed_article_count: ag03dB6.summary.completed_total_article_count_after_batch_6,
    ag03d_b6_completed_reference_count: ag03dB6.summary.completed_total_reference_count_after_batch_6,
    ag03d_b6_remaining_reference_queue_count: ag03dB6.summary.remaining_reference_queue_count,
    ag03d_b6_closed: ag03dB6.summary.ag03_reference_scaling_closed === true
  },

  summary: {
    ag03a_queue_entry_count: queueEntries.length,
    completed_article_count_from_ag03d_b6: completedPaths.length,
    live_scanned_completed_article_count: articleResults.length,
    articles_with_exactly_two_ag03_reference_links: articleResults.filter((row) => row.has_exactly_two_ag03_reference_links).length,
    articles_with_ag03_reference_block: articleResults.filter((row) => row.has_ag03_reference_block).length,
    articles_with_ag03_checked_marker: articleResults.filter((row) => row.has_ag03_checked_marker).length,
    live_ag03_reference_link_count: totalLiveAg03ReferenceLinks,
    expected_ag03_reference_link_count: config.expected.completed_reference_count,
    missing_queue_entries_after_closure: missingFromCompletedSet.length,
    ag03d_b6_remaining_reference_queue_count: ag03dB6.summary.remaining_reference_queue_count,
    ag03_reference_scaling_closed: (
      queueEntries.length === config.expected.ag03a_queue_entry_count &&
      completedPaths.length === config.expected.completed_article_count &&
      articleResults.length === config.expected.completed_article_count &&
      articleResults.every((row) => row.has_exactly_two_ag03_reference_links) &&
      totalLiveAg03ReferenceLinks === config.expected.completed_reference_count &&
      missingFromCompletedSet.length === 0 &&
      ag03dB6.summary.remaining_reference_queue_count === 0 &&
      ag03dB6.summary.ag03_reference_scaling_closed === true
    ),
    next_reference_action_required: false
  },

  article_scan_results: articleResults,
  missing_queue_entries_after_closure: missingFromCompletedSet,
  blocked_capabilities: config.blocked_capabilities,
  closure_result: config.closure_result
};

const preview = {
  preview_id: "AG03Z_FINAL_VERIFIED_REFERENCE_CLOSURE_PREVIEW",
  module_id: "AG03Z",
  status: "preview_ag03_verified_reference_closure",
  preview_only: true,
  summary: closureAudit.summary,
  sample_article_scan_results: articleResults.slice(0, 12),
  mutation_performed: false,
  blocked_capabilities: config.blocked_capabilities,
  closure_result: config.closure_result
};

writeJson(path.join(root, config.outputs.closure_audit), closureAudit);
writeJson(path.join(root, config.outputs.preview), preview);

console.log(`Created ${config.outputs.closure_audit}.`);
console.log(`Created ${config.outputs.preview}.`);
console.log(`AG03A queue entries: ${closureAudit.summary.ag03a_queue_entry_count}`);
console.log(`Completed articles from AG03D-B6: ${closureAudit.summary.completed_article_count_from_ag03d_b6}`);
console.log(`Live scanned completed articles: ${closureAudit.summary.live_scanned_completed_article_count}`);
console.log(`Articles with exactly two AG03 reference links: ${closureAudit.summary.articles_with_exactly_two_ag03_reference_links}`);
console.log(`Live AG03 reference link count: ${closureAudit.summary.live_ag03_reference_link_count}`);
console.log(`Missing queue entries after closure: ${closureAudit.summary.missing_queue_entries_after_closure}`);
console.log(`AG03 reference scaling closed: ${closureAudit.summary.ag03_reference_scaling_closed}`);
console.log("Mutation performed: false");
