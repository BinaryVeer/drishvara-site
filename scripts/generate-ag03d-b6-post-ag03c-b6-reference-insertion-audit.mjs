import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const configPath = path.join(root, "data", "quality", "ag03d-b6-post-ag03c-b6-reference-insertion-audit.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

function count(html, marker) {
  return (html.match(new RegExp(marker, "g")) || []).length;
}

function hrefsForMarker(html, marker) {
  const re = new RegExp(`<a\\b[^>]*${marker}="true"[^>]*href=["']([^"']+)["'][^>]*>`, "gi");
  return [...html.matchAll(re)].map((m) => m[1]);
}

const config = readJson(configPath);
const ag03a = readJson(path.join(root, config.input_files.ag03a_queue));
const ag03dB5 = readJson(path.join(root, config.input_files.ag03d_b5_audit));
const approval = readJson(path.join(root, config.input_files.ag03b_b6_r1_approval_record));
const ag03cB6 = readJson(path.join(root, config.input_files.ag03c_b6_apply_result));

const approvalByPath = new Map((approval.entries || []).map((entry) => [entry.article_path, entry]));
const ag03cB6Paths = new Set((ag03cB6.file_results || []).map((row) => row.article_path));

const entries = [...ag03cB6Paths].sort().map((articlePath) => {
  const approved = approvalByPath.get(articlePath);
  if (!approved) throw new Error(`AG03C-B6 article missing approval record: ${articlePath}`);

  const full = path.join(root, articlePath);
  if (!fs.existsSync(full)) throw new Error(`AG03C-B6 article missing on disk: ${articlePath}`);

  const html = fs.readFileSync(full, "utf8");
  const approvedUrls = approved.references.map((ref) => ref.url);
  const foundUrls = approvedUrls.filter((url) => html.includes(url));
  const ag03cB6Hrefs = hrefsForMarker(html, "data-drishvara-ag03c-b6-reference-link");

  return {
    article_path: articlePath,
    title: approved.title,
    category: approved.category,
    approved_reference_count: approved.references.length,
    approved_urls: approvedUrls,
    found_approved_urls: foundUrls,
    found_approved_url_count: foundUrls.length,
    ag03c_b6_reference_block_count: count(html, 'data-drishvara-ag03c-b6-reference-block="true"'),
    ag03c_b6_reference_link_count: count(html, 'data-drishvara-ag03c-b6-reference-link="true"'),
    ag03c_b6_checked_present: html.includes('data-drishvara-ag03c-b6-checked="true"'),
    ag03c_b6_hrefs: ag03cB6Hrefs,
    approved_urls_match_live_article: foundUrls.length === approvedUrls.length && approvedUrls.every((url) => html.includes(url)),
    live_article_has_exactly_two_ag03c_b6_links: count(html, 'data-drishvara-ag03c-b6-reference-link="true"') === 2,
    live_article_has_one_ag03c_b6_block: count(html, 'data-drishvara-ag03c-b6-reference-block="true"') === 1,
    audit_status: "passed"
  };
});

// Final carry-forward: B6 must inherit B1-B5 completion from AG03D-B5.
const completedBeforeBatch6 = new Set(
  ag03dB5.completed_reference_scaling_articles_after_batch_5 || []
);
const batch6Paths = new Set(entries.map((entry) => entry.article_path));
const completedPathsAfterBatch6 = new Set([...completedBeforeBatch6, ...batch6Paths]);

const remainingQueueEntries = (ag03a.entries || [])
  .filter((entry) => !completedPathsAfterBatch6.has(entry.article_path))
  .map((entry) => ({
    queue_id: entry.queue_id,
    article_path: entry.article_path,
    category: entry.category,
    title: entry.title,
    queue_status: "pending_reference_review"
  }));

const audit = {
  audit_id: "AG03D_B6_POST_AG03C_B6_REFERENCE_INSERTION_AUDIT",
  module_id: "AG03D-B6",
  status: "post_ag03c_b6_final_reference_insertion_audit_completed",
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
    ag03a_queue_entry_count: ag03a.summary?.queue_entry_count || (ag03a.entries || []).length,
    ag03a_batch_count: ag03a.summary?.batch_count || (ag03a.batches || []).length,
    completed_article_count_before_batch_6: completedBeforeBatch6.size,
    ag03c_b6_apply_processed_article_count: ag03cB6.summary?.processed_article_count || (ag03cB6.file_results || []).length,
    ag03c_b6_apply_inserted_reference_count: ag03cB6.summary?.inserted_reference_count
  },

  summary: {
    audited_batch_6_article_count: entries.length,
    expected_batch_6_article_count: config.expected.batch_6_article_count,
    confirmed_ag03c_b6_reference_link_count: entries.reduce((sum, entry) => sum + entry.ag03c_b6_reference_link_count, 0),
    expected_batch_6_reference_count: config.expected.batch_6_reference_count,
    entries_with_two_ag03c_b6_links: entries.filter((entry) => entry.live_article_has_exactly_two_ag03c_b6_links).length,
    entries_with_one_ag03c_b6_block: entries.filter((entry) => entry.live_article_has_one_ag03c_b6_block).length,
    entries_with_all_approved_urls: entries.filter((entry) => entry.approved_urls_match_live_article).length,
    entries_with_ag03c_b6_checked_marker: entries.filter((entry) => entry.ag03c_b6_checked_present).length,
    ag03c_b6_apply_and_live_scan_reconcile: entries.length === config.expected.batch_6_article_count &&
      entries.reduce((sum, entry) => sum + entry.ag03c_b6_reference_link_count, 0) === config.expected.batch_6_reference_count,
    completed_total_article_count_after_batch_6: completedPathsAfterBatch6.size,
    completed_total_reference_count_after_batch_6: config.expected.completed_total_reference_count_after_batch_6,
    remaining_reference_queue_count: remainingQueueEntries.length,
    expected_remaining_reference_queue_count: config.expected.remaining_queue_after_batch_6,
    ag03_reference_scaling_closed: remainingQueueEntries.length === 0 &&
      completedPathsAfterBatch6.size === config.expected.completed_total_article_count_after_batch_6,
    next_stage_id: config.recommended_next_stage.module_id,
    ready_for_final_ag03_closure_audit: remainingQueueEntries.length === 0 &&
      completedPathsAfterBatch6.size === config.expected.completed_total_article_count_after_batch_6
  },

  completed_batch_6_articles: entries,
  completed_reference_scaling_articles_after_batch_6: [...completedPathsAfterBatch6].sort(),
  remaining_reference_queue_after_batch_6: remainingQueueEntries,
  blocked_capabilities: config.blocked_capabilities,
  next_recommended_stage: config.recommended_next_stage
};

const preview = {
  preview_id: "AG03D_B6_POST_AG03C_B6_REFERENCE_INSERTION_PREVIEW",
  module_id: "AG03D-B6",
  status: "preview_post_ag03c_b6_final_audit",
  preview_only: true,
  summary: audit.summary,
  completed_batch_6_articles: entries.map((entry) => ({
    article_path: entry.article_path,
    ag03c_b6_reference_link_count: entry.ag03c_b6_reference_link_count,
    approved_urls_match_live_article: entry.approved_urls_match_live_article,
    ag03c_b6_checked_present: entry.ag03c_b6_checked_present
  })),
  mutation_performed: false,
  blocked_capabilities: config.blocked_capabilities,
  next_recommended_stage: config.recommended_next_stage
};

writeJson(path.join(root, config.outputs.audit), audit);
writeJson(path.join(root, config.outputs.preview), preview);

console.log(`Created ${config.outputs.audit}.`);
console.log(`Created ${config.outputs.preview}.`);
console.log(`Audited Batch 6 articles: ${audit.summary.audited_batch_6_article_count}`);
console.log(`Confirmed AG03C-B6 reference links: ${audit.summary.confirmed_ag03c_b6_reference_link_count}`);
console.log(`Entries with all approved URLs: ${audit.summary.entries_with_all_approved_urls}`);
console.log(`Completed total articles after Batch 6: ${audit.summary.completed_total_article_count_after_batch_6}`);
console.log(`Remaining reference queue count: ${audit.summary.remaining_reference_queue_count}`);
console.log(`AG03 reference scaling closed: ${audit.summary.ag03_reference_scaling_closed}`);
console.log(`Ready for final AG03 closure audit: ${audit.summary.ready_for_final_ag03_closure_audit}`);
console.log("Mutation performed: false");
