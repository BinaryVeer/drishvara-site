import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const configPath = path.join(root, "data", "quality", "ag03b-b3-r1-reference-candidate-review-approval.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

const config = readJson(configPath);
const candidates = readJson(path.join(root, config.input_files.ag03b_b3_candidate_registry));
const policy = config.approval_policy;

if (candidates.module_id !== "AG03B-B3") {
  throw new Error("Input candidate registry must be AG03B-B3.");
}

const entries = (candidates.entries || []).map((entry, index) => ({
  approval_id: `AG03B_B3_R1_APPROVAL_${String(index + 1).padStart(3, "0")}`,
  batch_id: policy.target_batch_id,
  article_path: entry.article_path,
  category: entry.category,
  title: entry.title,
  approved_reference_count: entry.references.length,
  approval_status: policy.approval_status,
  article_insertion_status: policy.article_insertion_status,
  approved_for_ag03c_b3_insertion: true,
  references: entry.references.map((ref) => ({
    slot: ref.slot,
    url: ref.url,
    title: ref.title,
    publisher: ref.publisher,
    source_domain: ref.source_domain,
    source_type: ref.source_type,
    relevance_note: ref.relevance_note,
    credibility_note: ref.credibility_note,
    approval_status: policy.approval_status,
    article_insertion_status: policy.article_insertion_status
  }))
}));

const approval = {
  approval_record_id: "AG03B_B3_R1_REFERENCE_CANDIDATE_APPROVAL_RECORD",
  module_id: "AG03B-B3-R1",
  status: "batch_03_reference_candidates_approved_for_ag03c_b3_insertion",
  generated_at: new Date().toISOString(),
  source_candidate_registry: config.input_files.ag03b_b3_candidate_registry,

  mutation_performed: false,
  article_html_mutation_performed: false,
  article_text_mutation_performed: false,
  article_image_mutation_performed: false,
  image_credit_mutation_performed: false,
  reference_url_change_performed: false,
  new_reference_insertion_performed: false,
  article_reference_insertion_performed: false,
  reference_approval_performed: true,
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

  summary: {
    approved_article_count: entries.length,
    required_articles: policy.required_articles,
    required_references_per_article: policy.required_references_per_article,
    approved_reference_count: entries.reduce((sum, entry) => sum + entry.references.length, 0),
    entries_with_two_approved_references: entries.filter((entry) => entry.references.length === policy.required_references_per_article).length,
    article_reference_insertion_performed: false,
    ready_for_ag03c_b3: true
  },
  entries
};

const preview = {
  preview_id: "AG03B_B3_R1_REFERENCE_CANDIDATE_APPROVAL_PREVIEW",
  module_id: "AG03B-B3-R1",
  status: "preview_batch_03_reference_candidate_approval",
  preview_only: true,
  summary: approval.summary,
  entries: entries.map((entry) => ({
    article_path: entry.article_path,
    approved_reference_count: entry.approved_reference_count,
    approval_status: entry.approval_status,
    references: entry.references.map((ref) => ({
      slot: ref.slot,
      title: ref.title,
      publisher: ref.publisher,
      source_domain: ref.source_domain
    }))
  })),
  mutation_performed: false,
  blocked_capabilities: config.blocked_capabilities,
  next_recommended_stage: config.recommended_next_stage
};

writeJson(path.join(root, config.outputs.approval_record), approval);
writeJson(path.join(root, config.outputs.preview), preview);

console.log(`Created ${config.outputs.approval_record}.`);
console.log(`Created ${config.outputs.preview}.`);
console.log(`Approved articles: ${approval.summary.approved_article_count}`);
console.log(`Approved references: ${approval.summary.approved_reference_count}`);
console.log(`Ready for AG03C-B3: ${approval.summary.ready_for_ag03c_b3}`);
console.log("Article reference insertion performed: false");
