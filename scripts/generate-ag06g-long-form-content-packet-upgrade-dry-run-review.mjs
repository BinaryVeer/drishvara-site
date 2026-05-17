import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const queuePath = path.join(root, "data", "content-intelligence", "publish-queue", "long-form-upgrade-queue.json");
const mappingPath = path.join(root, "data", "content-intelligence", "quality-reviews", "long-form-upgrade-mapping.json");
const ag06fRegistryPath = path.join(root, "data", "quality", "ag06f-long-form-production-queue.json");

const registryPath = path.join(root, "data", "quality", "ag06g-long-form-content-packet-upgrade-dry-run-review.json");
const previewPath = path.join(root, "data", "quality", "ag06g-long-form-content-packet-upgrade-dry-run-review-preview.json");
const docPath = path.join(root, "docs", "quality", "AG06G_LONG_FORM_CONTENT_PACKET_UPGRADE_DRY_RUN_REVIEW.md");
const dryRunReviewPath = path.join(root, "data", "content-intelligence", "quality-reviews", "long-form-content-packet-upgrade-dry-run-review.json");
const batchSelectionPath = path.join(root, "data", "content-intelligence", "publish-queue", "long-form-batch-01-dry-run-selection.json");

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n");
}

function writeText(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, value);
}

const falseGuards = {
  mutation_performed: false,
  public_article_mutation_performed: false,
  article_html_mutation_performed: false,
  homepage_mutation_performed: false,
  css_mutation_performed: false,
  javascript_mutation_performed: false,
  reference_url_change_performed: false,
  external_fetch_performed_by_script: false,
  live_url_fetch_performed: false,
  backend_activation_performed: false,
  api_route_created: false,
  supabase_enabled: false,
  auth_enabled: false,
  real_login_enabled: false,
  real_signup_enabled: false,
  user_account_collection_enabled: false,
  frontend_deployment_performed: false,
  scaffold_file_copy_performed: false,
  scaffold_file_move_performed: false,
  scaffold_file_delete_performed: false,
  file_deletion_performed: false,
  file_move_performed: false,
  public_article_archive_performed: false,
  public_article_delete_performed: false,
  public_publishing_performed: false,
  content_packet_generation_performed: false,
  article_rewrite_performed: false,
  scaffold_import_performed: false
};

const queue = readJson(queuePath);
const mapping = readJson(mappingPath);
const ag06fRegistry = readJson(ag06fRegistryPath);

const queueRows = queue.article_upgrade_queue || [];

const highPriorityRows = queueRows.filter((row) => row.upgrade_priority === "high");
const selectedRows = highPriorityRows.slice(0, 5);

function mapSelection(row, index) {
  const mappingRow = (mapping.article_to_scaffold_upgrade_mapping || []).find((x) => x.queue_id === row.queue_id);
  const scaffoldCandidates = mappingRow?.scaffold_candidates || [];

  return {
    dry_run_selection_id: `ag06g_batch01_${String(index + 1).padStart(2, "0")}`,
    source_queue_id: row.queue_id,
    source_article_path: row.source_article_path,
    category: row.category,
    detected_title: row.detected_title,
    source_word_count_estimate: row.source_word_count_estimate,
    source_reference_link_count: row.source_reference_link_count,
    upgrade_priority: row.upgrade_priority,
    selection_reason: "Selected for Batch 01 dry-run because the article is high-priority and requires reference-governance/content-packet upgrade review before any future long-form production.",
    required_upgrade_work: row.required_upgrade_work,
    target_standard: row.target_standard,
    scaffold_review_candidates: scaffoldCandidates.slice(0, 3).map((candidate) => ({
      run_id: candidate.run_id,
      content_id_candidate: candidate.content_id_candidate,
      detected_title: candidate.detected_title,
      run_directory: candidate.run_directory,
      final_markdown_word_count_estimate: candidate.final_markdown_word_count_estimate,
      token_overlap_score: candidate.token_overlap_score,
      has_visual_plan: candidate.has_visual_plan,
      has_learning_snapshot: candidate.has_learning_snapshot,
      review_status: "candidate_reference_only_not_imported"
    })),
    dry_run_review_status: {
      content_packet_upgrade_reviewed: false,
      source_article_reviewed: false,
      scaffold_candidate_reviewed: false,
      reference_gap_reviewed: false,
      visual_gap_reviewed: false,
      data_enrichment_gap_reviewed: false,
      quality_gate_reviewed: false,
      visitor_value_gate_reviewed: false,
      ready_for_content_packet_planning: false,
      ready_for_article_mutation: false,
      ready_for_publication: false
    },
    blocked_actions: [
      "public_article_html_mutation",
      "reference_url_change",
      "scaffold_copy_move_delete_import",
      "article_rewrite_generation",
      "content_packet_generation",
      "public_publishing",
      "backend_auth_supabase_activation"
    ],
    mutation_controls: {
      public_article_mutation_performed: false,
      reference_url_change_performed: false,
      scaffold_file_copy_performed: false,
      scaffold_file_move_performed: false,
      scaffold_file_delete_performed: false,
      scaffold_import_performed: false,
      content_packet_generation_performed: false,
      article_rewrite_performed: false,
      public_publishing_performed: false
    },
    notes: "AG06G selects and reviews only. It does not generate upgraded content packets or mutate any public/scaffold artifact."
  };
}

const batchSelections = selectedRows.map(mapSelection);

const summary = {
  source_queue_entry_count_from_ag06f: queue.summary.queue_entry_count,
  high_priority_available_count_from_ag06f: queue.summary.high_priority_queue_count,
  medium_priority_available_count_from_ag06f: queue.summary.medium_priority_queue_count,
  reference_governance_required_count_from_ag06f: queue.summary.reference_governance_required_count,
  selected_batch_id: "AG06G_BATCH_01_DRY_RUN",
  selected_batch_count: batchSelections.length,
  selected_high_priority_count: batchSelections.filter((x) => x.upgrade_priority === "high").length,
  selected_medium_priority_count: batchSelections.filter((x) => x.upgrade_priority === "medium").length,
  selected_reference_governance_required_count: batchSelections.filter((x) => x.required_upgrade_work.reference_governance_required === true).length,
  selected_entries_ready_for_content_packet_planning_count: 0,
  selected_entries_ready_for_article_mutation_count: 0,
  selected_entries_ready_for_publication_count: 0,
  dry_run_review_only: true,
  batch_selection_only: true,
  content_packet_generation_performed: false,
  article_rewrite_performed: false,
  current_public_articles_mutated: false,
  scaffold_outputs_mutated: false,
  reference_url_change_performed: false,
  public_publishing_enabled: false,
  next_stage_id: "AG06H"
};

const batchSelection = {
  module_id: "AG06G",
  batch_id: "AG06G_BATCH_01_DRY_RUN",
  title: "Long-Form Batch 01 Dry-Run Selection",
  status: "dry_run_selection_only",
  depends_on: ["AG06F", "AG06E", "AG06D", "AG06C"],
  selection_rule: {
    basis: "Select all high-priority AG06F entries first.",
    selected_count: batchSelections.length,
    maximum_batch_size: 5,
    priority_order: ["high", "medium"],
    publication_decision: "not_applicable_in_ag06g"
  },
  summary,
  selected_entries: batchSelections,
  ...falseGuards
};

const dryRunReview = {
  module_id: "AG06G",
  title: "Long-Form Content Packet Upgrade Dry-Run Review",
  status: "review_only",
  depends_on: ["AG06F"],
  generated_from: {
    ag06f_queue: "data/content-intelligence/publish-queue/long-form-upgrade-queue.json",
    ag06f_mapping: "data/content-intelligence/quality-reviews/long-form-upgrade-mapping.json",
    ag06f_registry: "data/quality/ag06f-long-form-production-queue.json"
  },
  summary,
  review_decision: {
    decision: "dry_run_batch_selected_not_approved_for_mutation",
    batch_01_selected: true,
    content_packet_generation_allowed: false,
    article_mutation_allowed: false,
    scaffold_import_allowed: false,
    publication_allowed: false,
    backend_auth_supabase_allowed: false
  },
  selected_batch: batchSelection,
  next_recommended_stage: {
    module_id: "AG06H",
    title: "Batch 01 Content Packet Upgrade Planning",
    allowed_scope: "planning and review only unless separately approved",
    blocked_scope: "public article mutation, scaffold import, publishing, backend/Auth/Supabase activation"
  },
  ...falseGuards
};

const registry = {
  module_id: "AG06G",
  title: "Long-Form Content Packet Upgrade Dry-Run Review",
  governance_only: true,
  dry_run_review_only: true,
  batch_selection_only: true,
  depends_on: ["AG06F"],
  generated_artifacts: {
    dry_run_review: "data/content-intelligence/quality-reviews/long-form-content-packet-upgrade-dry-run-review.json",
    batch_selection: "data/content-intelligence/publish-queue/long-form-batch-01-dry-run-selection.json",
    preview: "data/quality/ag06g-long-form-content-packet-upgrade-dry-run-review-preview.json",
    document: "docs/quality/AG06G_LONG_FORM_CONTENT_PACKET_UPGRADE_DRY_RUN_REVIEW.md"
  },
  source_ag06f_summary: ag06fRegistry.summary,
  summary,
  next_recommended_stage: dryRunReview.next_recommended_stage,
  ...falseGuards
};

const preview = {
  module_id: "AG06G",
  preview_only: true,
  summary,
  selected_entries_preview: batchSelections.map((entry) => ({
    dry_run_selection_id: entry.dry_run_selection_id,
    source_queue_id: entry.source_queue_id,
    source_article_path: entry.source_article_path,
    detected_title: entry.detected_title,
    upgrade_priority: entry.upgrade_priority,
    source_word_count_estimate: entry.source_word_count_estimate,
    scaffold_candidate_count: entry.scaffold_review_candidates.length,
    ready_for_content_packet_planning: entry.dry_run_review_status.ready_for_content_packet_planning,
    ready_for_article_mutation: entry.dry_run_review_status.ready_for_article_mutation,
    ready_for_publication: entry.dry_run_review_status.ready_for_publication
  })),
  no_mutation_summary: {
    public_article_mutation_performed: false,
    reference_url_change_performed: false,
    scaffold_file_copy_performed: false,
    scaffold_file_move_performed: false,
    scaffold_file_delete_performed: false,
    scaffold_import_performed: false,
    content_packet_generation_performed: false,
    article_rewrite_performed: false,
    public_publishing_performed: false
  },
  next_stage_id: "AG06H"
};

const doc = `# AG06G — Long-Form Content Packet Upgrade Dry-Run Review

## Purpose

AG06G performs the first non-mutating dry-run review of the AG06F long-form production queue. It selects Batch 01 for future content-packet upgrade planning while preserving all no-go controls.

AG06G does not generate upgraded article text, does not create content packets, does not edit public article HTML, does not import scaffold outputs, does not change reference URLs, and does not publish anything.

## Inputs

AG06G consumes:

- AG06F long-form upgrade queue.
- AG06F long-form upgrade mapping.
- AG06F registry summary.

## Selection Logic

Batch 01 is selected from high-priority AG06F queue items first. High-priority entries are those requiring reference-governance and long-form upgrade attention before any future production use.

The selected batch is a dry-run selection only. It is not an approval for article mutation, scaffold import, content packet generation, or public publishing.

## Dry-Run Review Position

Every selected entry remains:

- not ready for content-packet generation;
- not ready for article mutation;
- not ready for scaffold import;
- not ready for publication.

The purpose of this stage is to identify a controlled first batch and record the planning requirements that a later stage may use.

## Explicit Exclusions

AG06G does not:

- mutate current public article HTML;
- alter AG03/AG05 reference blocks or URLs;
- copy, move, delete, import, or publish scaffold files;
- generate article rewrites;
- generate upgraded content packets;
- modify CSS or JavaScript;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup, or public dynamic output;
- mark any existing public article as final Drishvara-quality content.

## Acceptance Criteria

AG06G is acceptable only if:

- AG06F queue and mapping are consumed;
- Batch 01 dry-run selection exists;
- selected batch count is exactly 5 unless fewer high-priority items exist;
- selected entries are high-priority entries first;
- every selected entry remains ready_for_article_mutation=false;
- every selected entry remains ready_for_publication=false;
- content_packet_generation_performed remains false;
- article_rewrite_performed remains false;
- scaffold_import_performed remains false;
- package scripts for generate:ag06g and validate:ag06g are present;
- validate:project includes validate:ag06g;
- no public article/reference/scaffold/CSS/JS/backend/Auth/Supabase/publishing mutation is performed.

## Next Stage

The recommended next stage is AG06H — Batch 01 Content Packet Upgrade Planning. AG06H may plan the structure of upgraded content packets for the selected batch, but it must remain non-mutating unless separately approved.
`;

writeJson(batchSelectionPath, batchSelection);
writeJson(dryRunReviewPath, dryRunReview);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG06G long-form content packet upgrade dry-run review artifacts generated.");
