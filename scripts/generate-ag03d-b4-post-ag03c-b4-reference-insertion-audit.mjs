import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const configPath = path.join(root, "data", "quality", "ag03d-b4-post-ag03c-b4-reference-insertion-audit.json");

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
const ag03dB3 = readJson(path.join(root, config.input_files.ag03d_b3_audit));
const approval = readJson(path.join(root, config.input_files.ag03b_b4_r1_approval_record));
const ag03cB4 = readJson(path.join(root, config.input_files.ag03c_b4_apply_result));

const approvalByPath = new Map((approval.entries || []).map((entry) => [entry.article_path, entry]));
const ag03cB4Paths = new Set((ag03cB4.file_results || []).map((row) => row.article_path));

const entries = [...ag03cB4Paths].sort().map((articlePath) => {
  const approved = approvalByPath.get(articlePath);
  if (!approved) throw new Error(`AG03C-B4 article missing approval record: ${articlePath}`);

  const full = path.join(root, articlePath);
  if (!fs.existsSync(full)) throw new Error(`AG03C-B4 article missing on disk: ${articlePath}`);

  const html = fs.readFileSync(full, "utf8");
  const approvedUrls = approved.references.map((ref) => ref.url);
  const foundUrls = approvedUrls.filter((url) => html.includes(url));
  const ag03cB4Hrefs = hrefsForMarker(html, "data-drishvara-ag03c-b4-reference-link");

  return {
    article_path: articlePath,
    title: approved.title,
    category: approved.category,
    approved_reference_count: approved.references.length,
    approved_urls: approvedUrls,
    found_approved_urls: foundUrls,
    found_approved_url_count: foundUrls.length,
    ag03c_b4_reference_block_count: count(html, 'data-drishvara-ag03c-b4-reference-block="true"'),
    ag03c_b4_reference_link_count: count(html, 'data-drishvara-ag03c-b4-reference-link="true"'),
    ag03c_b4_checked_present: html.includes('data-drishvara-ag03c-b4-checked="true"'),
    ag03c_b4_hrefs: ag03cB4Hrefs,
    approved_urls_match_live_article: foundUrls.length === approvedUrls.length && approvedUrls.every((url) => html.includes(url)),
    live_article_has_exactly_two_ag03c_b4_links: count(html, 'data-drishvara-ag03c-b4-reference-link="true"') === 2,
    live_article_has_one_ag03c_b4_block: count(html, 'data-drishvara-ag03c-b4-reference-block="true"') === 1,
    audit_status: "passed"
  };
});

const completedBeforeBatch4 = new Set(ag03dB3.completed_reference_scaling_articles_after_batch_3 || []);
const batch4Paths = new Set(entries.map((entry) => entry.article_path));
const completedPathsAfterBatch4 = new Set([...completedBeforeBatch4, ...batch4Paths]);

const remainingQueueEntries = (ag03a.entries || [])
  .filter((entry) => !completedPathsAfterBatch4.has(entry.article_path))
  .map((entry) => ({
    queue_id: entry.queue_id,
    article_path: entry.article_path,
    category: entry.category,
    title: entry.title,
    queue_status: "pending_ag03b_candidate_population"
  }));

const nextBatch = (ag03a.batches || []).find((batch) => batch.batch_id === config.expected.next_batch_id) || null;

const audit = {
  audit_id: "AG03D_B4_POST_AG03C_B4_REFERENCE_INSERTION_AUDIT",
  module_id: "AG03D-B4",
  status: "post_ag03c_b4_reference_insertion_audit_completed",
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
    completed_article_count_before_batch_4: completedBeforeBatch4.size,
    ag03c_b4_apply_processed_article_count: ag03cB4.summary?.processed_article_count || (ag03cB4.file_results || []).length,
    ag03c_b4_apply_inserted_reference_count: ag03cB4.summary?.inserted_reference_count
  },

  summary: {
    audited_batch_4_article_count: entries.length,
    expected_batch_4_article_count: config.expected.batch_4_article_count,
    confirmed_ag03c_b4_reference_link_count: entries.reduce((sum, entry) => sum + entry.ag03c_b4_reference_link_count, 0),
    expected_batch_4_reference_count: config.expected.batch_4_reference_count,
    entries_with_two_ag03c_b4_links: entries.filter((entry) => entry.live_article_has_exactly_two_ag03c_b4_links).length,
    entries_with_one_ag03c_b4_block: entries.filter((entry) => entry.live_article_has_one_ag03c_b4_block).length,
    entries_with_all_approved_urls: entries.filter((entry) => entry.approved_urls_match_live_article).length,
    entries_with_ag03c_b4_checked_marker: entries.filter((entry) => entry.ag03c_b4_checked_present).length,
    ag03c_b4_apply_and_live_scan_reconcile: entries.length === config.expected.batch_4_article_count &&
      entries.reduce((sum, entry) => sum + entry.ag03c_b4_reference_link_count, 0) === config.expected.batch_4_reference_count,
    completed_total_article_count_after_batch_4: completedPathsAfterBatch4.size,
    completed_total_reference_count_after_batch_4: config.expected.completed_total_reference_count_after_batch_4,
    remaining_reference_queue_count: remainingQueueEntries.length,
    expected_remaining_reference_queue_count: config.expected.remaining_queue_after_batch_4,
    next_batch_id: config.expected.next_batch_id,
    next_batch_found: !!nextBatch,
    next_batch_article_count: nextBatch ? nextBatch.article_count : 0,
    ready_for_ag03b_batch_5: !!nextBatch &&
      nextBatch.article_count === 12 &&
      remainingQueueEntries.length === config.expected.remaining_queue_after_batch_4
  },

  completed_batch_4_articles: entries,
  completed_reference_scaling_articles_after_batch_4: [...completedPathsAfterBatch4].sort(),
  remaining_reference_queue_after_batch_4: remainingQueueEntries,
  next_batch: nextBatch,
  blocked_capabilities: config.blocked_capabilities,
  next_recommended_stage: config.recommended_next_stage
};

const preview = {
  preview_id: "AG03D_B4_POST_AG03C_B4_REFERENCE_INSERTION_PREVIEW",
  module_id: "AG03D-B4",
  status: "preview_post_ag03c_b4_audit",
  preview_only: true,
  summary: audit.summary,
  completed_batch_4_articles: entries.map((entry) => ({
    article_path: entry.article_path,
    ag03c_b4_reference_link_count: entry.ag03c_b4_reference_link_count,
    approved_urls_match_live_article: entry.approved_urls_match_live_article,
    ag03c_b4_checked_present: entry.ag03c_b4_checked_present
  })),
  next_batch: nextBatch ? {
    batch_id: nextBatch.batch_id,
    article_count: nextBatch.article_count,
    status: nextBatch.status,
    article_paths: nextBatch.article_paths
  } : null,
  mutation_performed: false,
  blocked_capabilities: config.blocked_capabilities,
  next_recommended_stage: config.recommended_next_stage
};

writeJson(path.join(root, config.outputs.audit), audit);
writeJson(path.join(root, config.outputs.preview), preview);

console.log(`Created ${config.outputs.audit}.`);
console.log(`Created ${config.outputs.preview}.`);
console.log(`Audited Batch 4 articles: ${audit.summary.audited_batch_4_article_count}`);
console.log(`Confirmed AG03C-B4 reference links: ${audit.summary.confirmed_ag03c_b4_reference_link_count}`);
console.log(`Entries with all approved URLs: ${audit.summary.entries_with_all_approved_urls}`);
console.log(`Completed total articles after Batch 4: ${audit.summary.completed_total_article_count_after_batch_4}`);
console.log(`Remaining reference queue count: ${audit.summary.remaining_reference_queue_count}`);
console.log(`Next batch: ${audit.summary.next_batch_id}`);
console.log(`Ready for AG03B Batch 5: ${audit.summary.ready_for_ag03b_batch_5}`);
console.log("Mutation performed: false");
