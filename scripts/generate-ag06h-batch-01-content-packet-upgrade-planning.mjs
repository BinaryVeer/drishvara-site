import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const batchSelectionPath = path.join(root, "data", "content-intelligence", "publish-queue", "long-form-batch-01-dry-run-selection.json");
const dryRunReviewPath = path.join(root, "data", "content-intelligence", "quality-reviews", "long-form-content-packet-upgrade-dry-run-review.json");
const longFormStandardPath = path.join(root, "data", "content-intelligence", "quality-reviews", "long-form-article-standard.json");
const contentPacketSchemaPath = path.join(root, "data", "content-intelligence", "schema", "content-packet.schema.json");

const registryPath = path.join(root, "data", "quality", "ag06h-batch-01-content-packet-upgrade-planning.json");
const previewPath = path.join(root, "data", "quality", "ag06h-batch-01-content-packet-upgrade-planning-preview.json");
const docPath = path.join(root, "docs", "quality", "AG06H_BATCH_01_CONTENT_PACKET_UPGRADE_PLANNING.md");
const planningPath = path.join(root, "data", "content-intelligence", "quality-reviews", "batch-01-content-packet-upgrade-planning.json");
const planningQueuePath = path.join(root, "data", "content-intelligence", "publish-queue", "long-form-batch-01-content-packet-planning.json");
const planningSchemaPath = path.join(root, "data", "content-intelligence", "schema", "batch-01-content-packet-planning.schema.json");

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
  content_packet_created: false,
  article_rewrite_performed: false,
  scaffold_import_performed: false,
  verified_reference_population_performed: false,
  visual_asset_generation_performed: false,
  infographic_generation_performed: false,
  quality_scoring_performed: false,
  visitor_value_scoring_performed: false
};

const batchSelection = readJson(batchSelectionPath);
const dryRunReview = readJson(dryRunReviewPath);
const longFormStandard = readJson(longFormStandardPath);
const contentPacketSchema = readJson(contentPacketSchemaPath);

const selectedEntries = batchSelection.selected_entries || [];
const requiredSectionsFromSchema = Array.isArray(contentPacketSchema.required_sections)
  ? contentPacketSchema.required_sections
  : [];

const fieldsFromSchema = contentPacketSchema.fields && typeof contentPacketSchema.fields === "object"
  ? Object.keys(contentPacketSchema.fields)
  : [];

const fallbackRequiredSections = [
  "article_identity",
  "topic_intent",
  "reader_value_promise",
  "long_form_outline",
  "draft_body",
  "verified_references",
  "visual_plan",
  "data_enrichment_plan",
  "quality_review",
  "visitor_value_review",
  "publish_readiness"
];

const requiredSections = requiredSectionsFromSchema.length ? requiredSectionsFromSchema : fallbackRequiredSections;

function makePlannedSectionStatus(sectionName) {
  return {
    section_name: sectionName,
    required: true,
    planning_status: "planned_not_generated",
    generation_status: "not_generated",
    review_status: "pending_future_review",
    mutation_performed: false
  };
}

function makePlanningEntry(entry, index) {
  return {
    planning_id: `ag06h_batch01_plan_${String(index + 1).padStart(2, "0")}`,
    source_dry_run_selection_id: entry.dry_run_selection_id,
    source_queue_id: entry.source_queue_id,
    source_article_path: entry.source_article_path,
    category: entry.category,
    detected_title: entry.detected_title,
    source_word_count_estimate: entry.source_word_count_estimate,
    source_reference_link_count: entry.source_reference_link_count,
    upgrade_priority: entry.upgrade_priority,
    planning_scope: "content_packet_upgrade_planning_only",
    planned_target_standard: {
      word_count_min: longFormStandard.summary.word_count_min,
      word_count_max: longFormStandard.summary.word_count_max,
      verified_reference_min: longFormStandard.summary.verified_reference_min,
      verified_reference_max: longFormStandard.summary.verified_reference_max,
      requires_visual_plan: longFormStandard.summary.requires_visual_plan,
      requires_primary_visual: longFormStandard.summary.requires_primary_visual,
      requires_image_credit: longFormStandard.summary.requires_image_credit,
      requires_data_box_chart_graph_or_infographic: longFormStandard.summary.requires_data_box_chart_graph_or_infographic,
      quality_score_min_publish_ready: longFormStandard.summary.quality_score_min_publish_ready,
      visitor_value_score_min_publish_ready: longFormStandard.summary.visitor_value_score_min_publish_ready
    },
    planning_requirements: {
      source_article_review_required: true,
      reference_discovery_plan_required: true,
      reference_verification_plan_required: true,
      long_form_outline_plan_required: true,
      visual_plan_required: true,
      image_credit_plan_required: true,
      data_enrichment_plan_required: true,
      quality_review_plan_required: true,
      visitor_value_review_plan_required: true,
      editorial_review_plan_required: true,
      publish_readiness_review_plan_required: true
    },
    planned_content_packet_sections: requiredSections.map(makePlannedSectionStatus),
    planned_publish_readiness_gates: longFormStandard.publish_readiness_gates.map((gate) => ({
      gate,
      planned: true,
      passed: false,
      review_status: "pending_future_review"
    })),
    scaffold_candidate_planning: {
      candidate_count: entry.scaffold_review_candidates.length,
      candidates: entry.scaffold_review_candidates.map((candidate) => ({
        run_id: candidate.run_id,
        content_id_candidate: candidate.content_id_candidate,
        detected_title: candidate.detected_title,
        run_directory: candidate.run_directory,
        final_markdown_word_count_estimate: candidate.final_markdown_word_count_estimate,
        token_overlap_score: candidate.token_overlap_score,
        has_visual_plan: candidate.has_visual_plan,
        has_learning_snapshot: candidate.has_learning_snapshot,
        permitted_use_in_ag06h: "review_reference_only",
        import_status: "not_imported",
        copy_move_delete_status: "not_performed"
      }))
    },
    planning_decision_status: {
      content_packet_plan_created: true,
      content_packet_generated: false,
      article_rewrite_generated: false,
      reference_urls_populated: false,
      visual_asset_generated: false,
      infographic_generated: false,
      quality_scored: false,
      visitor_value_scored: false,
      ready_for_content_packet_generation: false,
      ready_for_article_mutation: false,
      ready_for_publication: false
    },
    blocked_actions: [
      "public_article_html_mutation",
      "reference_url_population_or_change",
      "scaffold_copy_move_delete_import",
      "article_rewrite_generation",
      "content_packet_generation",
      "visual_asset_generation",
      "infographic_generation",
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
    notes: "AG06H creates planning requirements only. It does not generate the content packet, article rewrite, references, visuals, infographic, scores, or public article mutation."
  };
}

const planningEntries = selectedEntries.map(makePlanningEntry);

const summary = {
  source_batch_id_from_ag06g: batchSelection.batch_id,
  source_selected_batch_count_from_ag06g: selectedEntries.length,
  planning_entry_count: planningEntries.length,
  high_priority_planning_entry_count: planningEntries.filter((x) => x.upgrade_priority === "high").length,
  medium_priority_planning_entry_count: planningEntries.filter((x) => x.upgrade_priority === "medium").length,
  entries_with_reference_discovery_plan_required: planningEntries.filter((x) => x.planning_requirements.reference_discovery_plan_required).length,
  entries_with_visual_plan_required: planningEntries.filter((x) => x.planning_requirements.visual_plan_required).length,
  entries_with_data_enrichment_plan_required: planningEntries.filter((x) => x.planning_requirements.data_enrichment_plan_required).length,
  content_packet_schema_required_section_count: requiredSections.length,
  content_packet_schema_field_count: fieldsFromSchema.length,
  publish_readiness_gate_count: longFormStandard.publish_readiness_gates.length,
  planning_only: true,
  content_packet_generation_performed: false,
  content_packet_created: false,
  article_rewrite_performed: false,
  current_public_articles_mutated: false,
  scaffold_outputs_mutated: false,
  reference_url_change_performed: false,
  verified_reference_population_performed: false,
  visual_asset_generation_performed: false,
  infographic_generation_performed: false,
  quality_scoring_performed: false,
  visitor_value_scoring_performed: false,
  public_publishing_enabled: false,
  next_stage_id: "AG06I"
};

const planningQueue = {
  module_id: "AG06H",
  queue_id: "long-form-batch-01-content-packet-planning",
  title: "Batch 01 Content Packet Upgrade Planning Queue",
  status: "planning_only",
  depends_on: ["AG06G", "AG06F", "AG06E", "AG06B"],
  generated_from: {
    ag06g_batch_selection: "data/content-intelligence/publish-queue/long-form-batch-01-dry-run-selection.json",
    ag06g_dry_run_review: "data/content-intelligence/quality-reviews/long-form-content-packet-upgrade-dry-run-review.json",
    ag06e_long_form_standard: "data/content-intelligence/quality-reviews/long-form-article-standard.json",
    ag06b_content_packet_schema: "data/content-intelligence/schema/content-packet.schema.json"
  },
  summary,
  content_packet_schema_snapshot: {
    schema_id: contentPacketSchema.schema_id,
    schema_version: contentPacketSchema.schema_version,
    governance_module: contentPacketSchema.governance_module,
    required_sections: requiredSections,
    field_keys: fieldsFromSchema,
    schema_structure_note: "AG06H uses required_sections and fields because the existing content-packet schema is not a JSON-Schema properties-based document."
  },
  planning_entries: planningEntries,
  ...falseGuards
};

const planningReview = {
  module_id: "AG06H",
  title: "Batch 01 Content Packet Upgrade Planning Review",
  status: "planning_review_only",
  depends_on: ["AG06G"],
  generated_from: planningQueue.generated_from,
  summary,
  planning_decision: {
    decision: "batch_01_content_packet_planning_created_not_approved_for_generation",
    batch_01_planning_created: true,
    content_packet_generation_allowed: false,
    article_rewrite_allowed: false,
    reference_population_allowed: false,
    visual_generation_allowed: false,
    scaffold_import_allowed: false,
    article_mutation_allowed: false,
    publication_allowed: false,
    backend_auth_supabase_allowed: false
  },
  planning_queue: planningQueue,
  next_recommended_stage: {
    module_id: "AG06I",
    title: "Batch 01 Source and Reference Discovery Workbench",
    allowed_scope: "research/discovery workbench and candidate reference planning only unless separately approved",
    blocked_scope: "public article mutation, reference insertion, scaffold import, content packet generation, publishing, backend/Auth/Supabase activation"
  },
  ...falseGuards
};

const registry = {
  module_id: "AG06H",
  title: "Batch 01 Content Packet Upgrade Planning",
  governance_only: true,
  planning_only: true,
  content_packet_generation_allowed: false,
  depends_on: ["AG06G"],
  generated_artifacts: {
    planning_review: "data/content-intelligence/quality-reviews/batch-01-content-packet-upgrade-planning.json",
    planning_queue: "data/content-intelligence/publish-queue/long-form-batch-01-content-packet-planning.json",
    planning_schema: "data/content-intelligence/schema/batch-01-content-packet-planning.schema.json",
    preview: "data/quality/ag06h-batch-01-content-packet-upgrade-planning-preview.json",
    document: "docs/quality/AG06H_BATCH_01_CONTENT_PACKET_UPGRADE_PLANNING.md"
  },
  summary,
  next_recommended_stage: planningReview.next_recommended_stage,
  ...falseGuards
};

const planningSchema = {
  schema_id: "drishvara/ag06h/batch-01-content-packet-planning.schema.json",
  module_id: "AG06H",
  title: "Batch 01 Content Packet Upgrade Planning Schema",
  status: "planning_schema_only",
  description: "Planning schema for Batch 01 long-form content packet upgrade planning. This is not a generated content packet schema and does not authorize article mutation or publication.",
  required_top_level_sections: [
    "planning_id",
    "source_dry_run_selection_id",
    "source_article_path",
    "planned_target_standard",
    "planning_requirements",
    "planned_content_packet_sections",
    "planned_publish_readiness_gates",
    "planning_decision_status",
    "mutation_controls"
  ],
  planning_entry_field_requirements: {
    content_packet_generated: false,
    article_rewrite_generated: false,
    reference_urls_populated: false,
    visual_asset_generated: false,
    infographic_generated: false,
    ready_for_article_mutation: false,
    ready_for_publication: false
  },
  inherited_required_sections_from_content_packet_schema: requiredSections,
  inherited_publish_readiness_gates_from_ag06e: longFormStandard.publish_readiness_gates,
  ...falseGuards
};

const preview = {
  module_id: "AG06H",
  preview_only: true,
  summary,
  selected_planning_preview: planningEntries.map((entry) => ({
    planning_id: entry.planning_id,
    source_article_path: entry.source_article_path,
    detected_title: entry.detected_title,
    upgrade_priority: entry.upgrade_priority,
    planned_section_count: entry.planned_content_packet_sections.length,
    planned_gate_count: entry.planned_publish_readiness_gates.length,
    content_packet_generated: entry.planning_decision_status.content_packet_generated,
    article_rewrite_generated: entry.planning_decision_status.article_rewrite_generated,
    ready_for_article_mutation: entry.planning_decision_status.ready_for_article_mutation,
    ready_for_publication: entry.planning_decision_status.ready_for_publication
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
  next_stage_id: "AG06I"
};

const doc = `# AG06H — Batch 01 Content Packet Upgrade Planning

## Purpose

AG06H creates a non-mutating planning layer for the five Batch 01 entries selected in AG06G. It translates the AG06E long-form article standard and the existing AG06B content-packet schema structure into planning requirements for future content-packet upgrade work.

AG06H does not generate content packets, article rewrites, verified reference URLs, visual assets, infographics, quality scores, visitor-value scores, public article edits, or publishing actions.

## Inputs

AG06H consumes:

- AG06G Batch 01 dry-run selection.
- AG06G dry-run review decision.
- AG06E long-form article standard.
- AG06B content-packet schema.

## Planning Logic

Each AG06G selected Batch 01 entry becomes one AG06H planning entry. The planning entry records:

- source article path and title;
- current word-count and reference gap;
- AG06E target standard;
- required planning work;
- planned content-packet sections;
- planned publish-readiness gates;
- scaffold candidate review status;
- blocked actions and mutation controls.

## Content-Packet Schema Position

The existing content-packet schema uses required_sections and fields rather than a JSON-Schema properties structure. AG06H therefore creates section-level planning templates only. It does not produce actual content-packet payloads.

## Readiness Position

Every AG06H planning entry remains:

- content_packet_generated=false;
- article_rewrite_generated=false;
- reference_urls_populated=false;
- visual_asset_generated=false;
- infographic_generated=false;
- ready_for_article_mutation=false;
- ready_for_publication=false.

## Explicit Exclusions

AG06H does not:

- mutate current public article HTML;
- populate, alter, or insert reference URLs;
- copy, move, delete, import, or publish scaffold files;
- generate article rewrites;
- generate upgraded content packets;
- generate visual assets or infographics;
- assign final quality or visitor-value scores;
- modify CSS or JavaScript;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup, or public dynamic output;
- mark any existing public article as final Drishvara-quality content.

## Acceptance Criteria

AG06H is acceptable only if:

- AG06G Batch 01 selection is consumed;
- the planning queue contains exactly the AG06G selected batch count;
- every selected Batch 01 item has one planning entry;
- AG06E word-count, reference, visual, quality, visitor-value and publish-readiness gates are represented;
- AG06B content-packet required sections or fallback required sections are represented;
- every planning entry remains not generated, not mutated and not publish-ready;
- content_packet_generation_performed remains false;
- article_rewrite_performed remains false;
- scaffold_import_performed remains false;
- package scripts for generate:ag06h and validate:ag06h are present;
- validate:project includes validate:ag06h;
- no public article/reference/scaffold/CSS/JS/backend/Auth/Supabase/publishing mutation is performed.

## Next Stage

The recommended next stage is AG06I — Batch 01 Source and Reference Discovery Workbench. AG06I may create research and candidate-reference planning workbench records, but it must not insert references, mutate articles, import scaffold files, generate article rewrites, or publish content unless separately approved.
`;

writeJson(planningQueuePath, planningQueue);
writeJson(planningPath, planningReview);
writeJson(planningSchemaPath, planningSchema);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG06H batch 01 content packet upgrade planning artifacts generated.");
