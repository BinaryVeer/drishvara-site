import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "ag03a-verified-reference-scaling-readiness-queue.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

function categoryFromPath(articlePath) {
  const m = String(articlePath || "").match(/^articles\/([^/]+)\//);
  return m ? m[1] : "unknown";
}

function buildResearchPrompt(entry) {
  return [
    `Find two credible, reachable, non-error references for the Drishvara article: "${entry.title}".`,
    `Category: ${entry.category}.`,
    "Prefer official, multilateral, academic, institutional, or reputable public-interest sources.",
    "Avoid spam, parked domains, generic blogs, weak listicles, and duplicate references.",
    "Do not approve a source unless it directly supports the article theme."
  ].join(" ");
}

function toBatches(entries, batchSize) {
  const batches = [];
  for (let i = 0; i < entries.length; i += batchSize) {
    const items = entries.slice(i, i + batchSize);
    batches.push({
      batch_id: `AG03B_BATCH_${String(batches.length + 1).padStart(2, "0")}`,
      batch_number: batches.length + 1,
      status: batches.length === 0 ? "candidate_for_next_stage" : "queued_for_later",
      article_count: items.length,
      article_paths: items.map((entry) => entry.article_path),
      candidate_population_status: "pending",
      reference_insertion_status: "not_allowed_in_ag03a"
    });
  }
  return batches;
}

const config = readJson(registryPath);
const ag01r1 = readJson(path.join(root, config.input_files.ag01r1_audit));
const workbench = readJson(path.join(root, config.input_files.ar02a_workbench));
const ar02b = readJson(path.join(root, config.input_files.ar02b_sample_registry));
const ag02r2 = readJson(path.join(root, config.input_files.ag02r2_visual_registry));

const requiredRefs = config.reference_policy.required_public_verified_references_per_article;
const batchSize = config.reference_policy.batch_size;

const workbenchByPath = new Map((workbench.entries || []).map((entry) => [entry.article_path, entry]));
const samplePaths = new Set((ar02b.entries || []).map((entry) => entry.article_path));
const ag02r2ByPath = new Map((ag02r2.entries || []).map((entry) => [entry.article_path, entry]));

const missingRefEntries = (ag01r1.entries || [])
  .filter((entry) => !entry.references?.has_two_public_verified_references)
  .sort((a, b) => {
    const c = String(a.category).localeCompare(String(b.category));
    return c || String(a.article_path).localeCompare(String(b.article_path));
  });

const queueEntries = missingRefEntries.map((entry, index) => {
  const wb = workbenchByPath.get(entry.article_path) || {};
  const currentPublic = Number(entry.references?.visible_ar02c_reference_link_count || 0);
  const currentWorkbench = Number(wb.current_verified_reference_count || 0);
  const missingCount = Math.max(0, requiredRefs - Math.max(currentPublic, currentWorkbench));

  return {
    queue_id: `AG03A_REF_QUEUE_${String(index + 1).padStart(3, "0")}`,
    article_path: entry.article_path,
    category: entry.category || categoryFromPath(entry.article_path),
    title: entry.title || wb.article_title || path.basename(entry.article_path, ".html").replaceAll("-", " "),
    ar02b_sample_article: samplePaths.has(entry.article_path),
    current_public_verified_reference_count: currentPublic,
    current_workbench_verified_reference_count: currentWorkbench,
    required_verified_reference_count: requiredRefs,
    missing_verified_reference_count: missingCount,
    ag01r1_reference_status: entry.references?.reference_publication_status || "unknown",
    ar02a_workbench_status: wb.workbench_status || "missing_from_workbench",
    ar02a_ready_for_article_insertion: wb.final_reference_decision?.ready_for_article_insertion === true,
    ag02r2_visual_review_status: ag02r2ByPath.get(entry.article_path)?.editorial_selection_status || "not_in_ag02r2_or_not_targeted",
    priority_group: samplePaths.has(entry.article_path) ? "already_sampled_review_only" : "remaining_reference_scaling",
    queue_status: "pending_candidate_population",
    candidate_population_allowed_in_ag03a: false,
    reference_insertion_allowed_in_ag03a: false,
    external_fetch_allowed_in_ag03a: false,
    recommended_research_prompt_for_ag03b: buildResearchPrompt(entry),
    required_checks_for_ag03b: config.reference_policy.must_check
  };
});

const nonSampleQueueEntries = queueEntries.filter((entry) => !entry.ar02b_sample_article);
const batches = toBatches(nonSampleQueueEntries, batchSize);

const queue = {
  queue_id: "AG03A_VERIFIED_REFERENCE_SCALING_READINESS_QUEUE",
  module_id: "AG03A",
  status: "reference_scaling_queue_created_no_mutation",
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
  external_fetch_performed: false,
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
  file_move_performed: false,
  source_context: {
    ag01r1_article_count: ag01r1.summary?.article_count || null,
    ag01r1_missing_two_public_verified_references: ag01r1.summary?.missing_two_public_verified_references || null,
    ar02a_workbench_article_count: workbench.article_count || (workbench.entries || []).length,
    ar02b_sample_article_count: ar02b.sample_article_count || (ar02b.entries || []).length,
    ag02r2_ready_for_image_application: ag02r2.summary?.ready_for_ag02r3_application === true
  },
  summary: {
    total_missing_reference_articles_from_ag01r1: missingRefEntries.length,
    queue_entry_count: queueEntries.length,
    sample_article_count_in_missing_queue: queueEntries.filter((entry) => entry.ar02b_sample_article).length,
    non_sample_reference_scaling_queue_count: nonSampleQueueEntries.length,
    required_verified_references_per_article: requiredRefs,
    batch_size: batchSize,
    batch_count: batches.length,
    first_batch_article_count: batches[0]?.article_count || 0,
    candidate_population_performed: false,
    reference_insertion_performed: false,
    external_fetch_performed: false,
    ready_for_ag03b_batch_1: nonSampleQueueEntries.length > 0
  },
  batches,
  entries: queueEntries
};

const preview = {
  preview_id: "AG03A_VERIFIED_REFERENCE_SCALING_READINESS_PREVIEW",
  module_id: "AG03A",
  status: "preview_reference_scaling_queue_no_mutation",
  preview_only: true,
  summary: queue.summary,
  first_batch: batches[0] || null,
  sample_entries: nonSampleQueueEntries.slice(0, 12).map((entry) => ({
    queue_id: entry.queue_id,
    article_path: entry.article_path,
    title: entry.title,
    category: entry.category,
    missing_verified_reference_count: entry.missing_verified_reference_count,
    queue_status: entry.queue_status
  })),
  mutation_performed: false,
  blocked_capabilities: config.blocked_capabilities,
  next_recommended_stage: config.recommended_next_stage
};

writeJson(path.join(root, config.outputs.queue), queue);
writeJson(path.join(root, config.outputs.preview), preview);

console.log(`Created ${config.outputs.queue}.`);
console.log(`Created ${config.outputs.preview}.`);
console.log(`AG01R1 missing reference articles: ${queue.summary.total_missing_reference_articles_from_ag01r1}`);
console.log(`Queue entries: ${queue.summary.queue_entry_count}`);
console.log(`Non-sample queue entries: ${queue.summary.non_sample_reference_scaling_queue_count}`);
console.log(`Batch count: ${queue.summary.batch_count}`);
console.log(`First batch article count: ${queue.summary.first_batch_article_count}`);
console.log("Candidate population performed: false");
console.log("Reference insertion performed: false");
