import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ar02a-verified-reference-selection-workbench.json");
const ar01RegistryPath = path.join(root, "data", "editorial", "article-reference-image-credit-registry.json");
const workbenchPath = path.join(root, "data", "editorial", "verified-reference-selection-workbench.json");
const previewPath = path.join(root, "data", "quality", "ar02a-verified-reference-selection-workbench-preview.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function candidateSlot(article, slot) {
  return {
    slot,
    candidate_url: null,
    candidate_title: null,
    candidate_source_name: null,
    candidate_source_type: null,

    checks: {
      article_relevance: "pending",
      source_credibility: "pending",
      reachability: "pending",
      http_status: null,
      non_error_page: "pending",
      spam_or_parked_domain_risk: "pending",
      duplicate_reference_risk: "pending",
      language_accessibility: "pending"
    },

    decision: {
      editorial_decision: "pending",
      accepted_for_article: false,
      rejection_reason: null,
      reviewer_note: "Pending verified candidate population in AR02B."
    }
  };
}

const config = readJson(registryPath);
const ar01 = readJson(ar01RegistryPath);

if (!Array.isArray(ar01.articles) || ar01.articles.length === 0) {
  throw new Error("AR01 article registry has no articles.");
}

const entries = ar01.articles.map((article) => {
  return {
    article_path: article.article_path,
    article_title: article.title,
    category: article.category,
    ar01_reference_status: article.reference_status,
    required_verified_references: 2,
    current_verified_reference_count: 0,
    workbench_status: "pending_candidate_population",
    candidate_references: [
      candidateSlot(article, 1),
      candidateSlot(article, 2)
    ],
    final_reference_decision: {
      ready_for_article_insertion: false,
      accepted_reference_count: 0,
      final_reviewer: null,
      final_review_note: "Not ready. Candidate references are not yet populated or verified."
    }
  };
});

const workbench = {
  workbench_id: "AR02A_VERIFIED_REFERENCE_SELECTION_WORKBENCH",
  module_id: "AR02A",
  status: "structure_created_no_external_links",
  source_registry: "data/editorial/article-reference-image-credit-registry.json",
  article_count: entries.length,
  required_reference_slots_per_article: config.required_reference_slots_per_article,
  external_link_verification_performed: false,
  article_html_mutation_performed: false,
  unverified_external_links_inserted: false,
  total_candidate_slots: entries.length * config.required_reference_slots_per_article,
  populated_candidate_url_count: 0,
  accepted_reference_count: 0,
  entries
};

fs.mkdirSync(path.dirname(workbenchPath), { recursive: true });
fs.writeFileSync(workbenchPath, JSON.stringify(workbench, null, 2) + "\n");

const preview = {
  preview_id: "AR02A_VERIFIED_REFERENCE_SELECTION_WORKBENCH_PREVIEW",
  module_id: "AR02A",
  status: "preview_after_workbench_structure_generation",
  preview_only: true,
  article_count: workbench.article_count,
  total_candidate_slots: workbench.total_candidate_slots,
  populated_candidate_url_count: workbench.populated_candidate_url_count,
  accepted_reference_count: workbench.accepted_reference_count,
  sample_entries: workbench.entries.slice(0, 5).map((entry) => ({
    article_path: entry.article_path,
    article_title: entry.article_title,
    category: entry.category,
    candidate_slot_count: entry.candidate_references.length,
    all_candidate_urls_null: entry.candidate_references.every((candidate) => candidate.candidate_url === null),
    final_ready_for_article_insertion: entry.final_reference_decision.ready_for_article_insertion
  })),
  summary: {
    workbench_created: true,
    article_count_matches_ar01: workbench.article_count === ar01.article_count,
    all_entries_have_two_candidate_slots: workbench.entries.every((entry) => entry.candidate_references.length === 2),
    all_candidate_urls_null: workbench.entries.every((entry) => entry.candidate_references.every((candidate) => candidate.candidate_url === null)),
    all_decisions_pending: workbench.entries.every((entry) => entry.candidate_references.every((candidate) => candidate.decision.editorial_decision === "pending")),
    no_article_html_mutation: true,
    external_link_verification_performed: false,
    unverified_external_links_inserted: false,
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
  blocked_capabilities: config.blocked_capabilities,
  next_recommended_stage: config.recommended_next_stage
};

fs.writeFileSync(previewPath, JSON.stringify(preview, null, 2) + "\n");

console.log(`Created ${path.relative(root, workbenchPath)}.`);
console.log(`Created ${path.relative(root, previewPath)}.`);
console.log(`Article count: ${workbench.article_count}`);
console.log(`Total candidate slots: ${workbench.total_candidate_slots}`);
console.log(`Populated candidate URLs: ${workbench.populated_candidate_url_count}`);
