import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag07cPacket: "data/content-intelligence/content-packets/ag07c-preview-only-dry-run-content-packet.json",
  ag07cExecution: "data/content-intelligence/run-registry/ag07c-preview-only-dry-run-execution-record.json",
  ag07cReview: "data/content-intelligence/quality-reviews/ag07c-content-packet-generator-preview-only-dry-run.json",
  ag07cSchema: "data/content-intelligence/schema/content-packet-preview-dry-run.schema.json",
  ag07bReview: "data/content-intelligence/quality-reviews/ag07b-content-packet-generator-dry-run-implementation-plan.json",
  ag07aReview: "data/content-intelligence/quality-reviews/ag07a-long-form-content-packet-generator-design-dry-run-boundary.json",
  ag06zClosure: "data/content-intelligence/quality-reviews/content-intelligence-foundation-closure.json",
  ag06eStandard: "data/content-intelligence/quality-reviews/long-form-article-standard.json",
  ag06iVisualStandard: "data/content-intelligence/visual-registry/visual-data-infographic-requirement-standard.json",
  ag06jReferenceStandard: "data/content-intelligence/reference-registry/reference-source-credibility-standard.json",
  ag06kStoreManifest: "data/content-intelligence/run-registry/jsonl-first-content-intelligence-store-manifest.json",
  ag06lApprovalRegister: "data/content-intelligence/publish-queue/publish-queue-approval-state-register.json"
};

const reviewPath = path.join(root, "data", "content-intelligence", "quality-reviews", "ag07d-preview-packet-review-gap-audit.json");
const gapMatrixPath = path.join(root, "data", "content-intelligence", "run-registry", "ag07d-preview-packet-gap-matrix.json");
const learningPath = path.join(root, "data", "content-intelligence", "learning", "ag07d-preview-packet-review-learning.json");
const registryPath = path.join(root, "data", "quality", "ag07d-preview-packet-review-gap-audit.json");
const previewPath = path.join(root, "data", "quality", "ag07d-preview-packet-review-gap-audit-preview.json");
const docPath = path.join(root, "docs", "quality", "AG07D_PREVIEW_PACKET_REVIEW_GAP_AUDIT.md");

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function writeJson(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n");
}

function writeText(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, value);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

const noMutationControls = {
  article_prose_generated: false,
  narrative_text_generated: false,
  production_content_generated: false,
  public_article_mutation_performed: false,
  article_html_mutation_performed: false,
  reference_insertion_performed: false,
  reference_url_population_performed: false,
  reference_url_change_performed: false,
  visual_generation_performed: false,
  visual_asset_generation_performed: false,
  infographic_generation_performed: false,
  scaffold_import_performed: false,
  scaffold_file_copy_performed: false,
  scaffold_file_move_performed: false,
  scaffold_file_delete_performed: false,
  jsonl_append_performed: false,
  jsonl_production_record_created: false,
  database_write_performed: false,
  supabase_enabled: false,
  auth_enabled: false,
  backend_activation_performed: false,
  api_route_created: false,
  approval_state_changed: false,
  publish_ready_set: false,
  public_publishing_performed: false,
  publication_approval_granted: false
};

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) {
    throw new Error(`Missing required AG07D input ${name}: ${relativePath}`);
  }
}

const ag07cPacket = readJson(inputs.ag07cPacket);
const ag07cExecution = readJson(inputs.ag07cExecution);
const ag07cReview = readJson(inputs.ag07cReview);
const ag07cSchema = readJson(inputs.ag07cSchema);
const ag07bReview = readJson(inputs.ag07bReview);
const ag07aReview = readJson(inputs.ag07aReview);
const ag06zClosure = readJson(inputs.ag06zClosure);
const ag06eStandard = readJson(inputs.ag06eStandard);
const ag06iVisualStandard = readJson(inputs.ag06iVisualStandard);
const ag06jReferenceStandard = readJson(inputs.ag06jReferenceStandard);
const ag06kManifest = readJson(inputs.ag06kStoreManifest);
const ag06lApprovalRegister = readJson(inputs.ag06lApprovalRegister);

const packetSections = asArray(ag07cPacket.packet_sections);
const approvalEntries = asArray(ag06lApprovalRegister.approval_queue_entries);

const gapItems = [
  {
    gap_id: "AG07D-GAP-001",
    gap_area: "section_depth",
    severity: "expected_preview_gap",
    finding: "All packet sections are placeholder-only.",
    evidence: {
      section_count: packetSections.length,
      placeholder_only_count: packetSections.filter((section) => section.preview_content_status === "placeholder_only").length
    },
    production_blocker: true,
    recommended_next_action: "Define section-level drafting requirements in a later revision-plan stage before any production packet generation."
  },
  {
    gap_id: "AG07D-GAP-002",
    gap_area: "article_prose",
    severity: "expected_preview_gap",
    finding: "No article prose or narrative text is generated in AG07C.",
    evidence: {
      narrative_text_generated: ag07cExecution.packet_integrity_summary?.narrative_text_generated,
      article_text_generated: ag07cExecution.packet_integrity_summary?.article_text_generated
    },
    production_blocker: true,
    recommended_next_action: "Keep prose generation blocked until a later explicitly approved packet drafting stage."
  },
  {
    gap_id: "AG07D-GAP-003",
    gap_area: "reference_plan",
    severity: "required_before_production",
    finding: "Reference requirement exists, but no candidate or approved reference URLs are populated.",
    evidence: {
      approved_reference_count: ag07cPacket.reference_requirement_preview?.approved_reference_count,
      candidate_reference_count: ag07cPacket.reference_requirement_preview?.candidate_reference_count,
      urls_count: asArray(ag07cPacket.reference_requirement_preview?.urls).length,
      source_taxonomy_available: ag07cPacket.reference_requirement_preview?.source_taxonomy_available
    },
    production_blocker: true,
    recommended_next_action: "Create a later reference discovery/review workbench before any production packet is marked reference-ready."
  },
  {
    gap_id: "AG07D-GAP-004",
    gap_area: "visual_data_plan",
    severity: "required_before_production",
    finding: "Visual requirements are represented, but no visual asset, infographic, image credit or alt text is generated.",
    evidence: {
      visual_type_count: ag07cPacket.visual_requirement_preview?.visual_type_count,
      primary_hero_visual_required: ag07cPacket.visual_requirement_preview?.primary_hero_visual_required,
      structured_visual_or_data_unit_required: ag07cPacket.visual_requirement_preview?.structured_visual_or_data_unit_required,
      visual_asset_generation_performed: ag07cPacket.visual_requirement_preview?.visual_asset_generation_performed
    },
    production_blocker: true,
    recommended_next_action: "Define visual/data enrichment workbench before any production article packet is considered complete."
  },
  {
    gap_id: "AG07D-GAP-005",
    gap_area: "quality_scoring",
    severity: "required_before_publish_readiness",
    finding: "Quality score and visitor-value score are required by AG06E but not computed in the AG07C preview packet.",
    evidence: {
      quality_score_required: ag07cPacket.target_article_standard?.quality_score_required,
      visitor_value_score_required: ag07cPacket.target_article_standard?.visitor_value_score_required,
      quality_scoring_performed: false,
      visitor_value_scoring_performed: false
    },
    production_blocker: true,
    recommended_next_action: "Define a later packet quality/visitor-value scoring audit before production closure."
  },
  {
    gap_id: "AG07D-GAP-006",
    gap_area: "publish_readiness",
    severity: "hard_blocker",
    finding: "Packet is not publish-ready and not publication-allowed.",
    evidence: {
      preview_only: ag07cPacket.preview_only,
      production_packet: ag07cPacket.production_packet,
      publish_ready: ag07cPacket.publish_ready,
      publication_allowed: ag07cPacket.publication_allowed
    },
    production_blocker: true,
    recommended_next_action: "Keep publish-readiness blocked until production packet generation, editorial review, reference review and visual review are separately closed."
  },
  {
    gap_id: "AG07D-GAP-007",
    gap_area: "approval_state",
    severity: "hard_blocker",
    finding: "Approval state remains not approved and no approval transition has occurred.",
    evidence: {
      approval_state: ag07cPacket.approval_state_snapshot?.approval_state,
      publish_ready: ag07cPacket.approval_state_snapshot?.publish_ready,
      approval_state_changed: ag07cPacket.approval_state_changed
    },
    production_blocker: true,
    recommended_next_action: "Keep approval-state transition blocked until a dedicated publish approval stage."
  },
  {
    gap_id: "AG07D-GAP-008",
    gap_area: "data_persistence",
    severity: "future_mapping_required",
    finding: "Future JSONL/database/Supabase mapping is represented, but no production JSONL append or database write is performed.",
    evidence: {
      jsonl_store_count: ag07cPacket.jsonl_database_boundary?.jsonl_store_count,
      jsonl_append_performed: ag07cPacket.jsonl_database_boundary?.jsonl_append_performed,
      database_write_performed: ag07cPacket.jsonl_database_boundary?.database_write_performed,
      supabase_enabled: ag07cPacket.jsonl_database_boundary?.supabase_enabled
    },
    production_blocker: true,
    recommended_next_action: "Carry schema-to-database mapping forward without enabling Supabase writes."
  }
];

const reviewDimensions = [
  {
    dimension_id: "schema_completeness",
    status: "passes_preview_level",
    observation: "Preview packet contains the required top-level packet contracts and section skeletons.",
    production_readiness: "not_ready"
  },
  {
    dimension_id: "content_depth",
    status: "gap_recorded",
    observation: "Section bodies are placeholders only.",
    production_readiness: "not_ready"
  },
  {
    dimension_id: "reference_readiness",
    status: "gap_recorded",
    observation: "Reference taxonomy exists, but URLs and approvals are empty.",
    production_readiness: "not_ready"
  },
  {
    dimension_id: "visual_readiness",
    status: "gap_recorded",
    observation: "Visual requirements exist, but no visual asset or data unit is generated.",
    production_readiness: "not_ready"
  },
  {
    dimension_id: "quality_readiness",
    status: "gap_recorded",
    observation: "Quality and visitor-value scores are not computed.",
    production_readiness: "not_ready"
  },
  {
    dimension_id: "publish_readiness",
    status: "blocked",
    observation: "Packet remains preview-only, non-production and not publish-ready.",
    production_readiness: "blocked"
  }
];

const recommendedNextActions = [
  {
    action_id: "AG07E-ACTION-001",
    action: "Create a preview packet revision plan.",
    allowed_in_ag07d: false,
    recommended_stage: "AG07E",
    production_mutation_required: false
  },
  {
    action_id: "AG07E-ACTION-002",
    action: "Define stronger section-level packet fields for future drafting.",
    allowed_in_ag07d: false,
    recommended_stage: "AG07E",
    production_mutation_required: false
  },
  {
    action_id: "AG07E-ACTION-003",
    action: "Define reference-workbench handoff requirements.",
    allowed_in_ag07d: false,
    recommended_stage: "AG07E or AG07G",
    production_mutation_required: false
  },
  {
    action_id: "AG07E-ACTION-004",
    action: "Define visual/data enrichment handoff requirements.",
    allowed_in_ag07d: false,
    recommended_stage: "AG07E or AG07H",
    production_mutation_required: false
  },
  {
    action_id: "AG07E-ACTION-005",
    action: "Preserve schema-to-Supabase/database compatibility without enabling database writes.",
    allowed_in_ag07d: false,
    recommended_stage: "DB mapping boundary stage",
    production_mutation_required: false
  }
];

const summary = {
  ag07c_preview_packet_present: true,
  ag07c_preview_packet_status: ag07cPacket.status,
  packet_preview_only: ag07cPacket.preview_only === true,
  packet_production_packet: ag07cPacket.production_packet === true,
  packet_publish_ready: ag07cPacket.publish_ready === true,
  packet_publication_allowed: ag07cPacket.publication_allowed === true,
  packet_section_count: packetSections.length,
  placeholder_only_section_count: packetSections.filter((section) => section.preview_content_status === "placeholder_only").length,
  gap_count: gapItems.length,
  production_blocker_count: gapItems.filter((gap) => gap.production_blocker === true).length,
  review_dimension_count: reviewDimensions.length,
  recommended_next_action_count: recommendedNextActions.length,
  production_readiness: "not_ready",
  publish_readiness: "blocked",
  review_audit_only: true,
  article_prose_generated: false,
  public_article_mutation_allowed: false,
  reference_insertion_allowed: false,
  visual_generation_allowed: false,
  jsonl_production_append_allowed: false,
  database_write_allowed: false,
  publishing_allowed: false,
  backend_auth_supabase_allowed: false,
  next_stage_id: "AG07E"
};

const gapMatrix = {
  module_id: "AG07D",
  title: "Preview Packet Gap Matrix",
  status: "gap_audit_completed",
  review_audit_only: true,
  generated_from: inputs,
  summary,
  reviewed_packet: {
    content_packet_id: ag07cPacket.content_packet_id,
    status: ag07cPacket.status,
    preview_only: ag07cPacket.preview_only,
    production_packet: ag07cPacket.production_packet,
    publish_ready: ag07cPacket.publish_ready,
    publication_allowed: ag07cPacket.publication_allowed,
    selected_candidate: ag07cPacket.selected_candidate
  },
  review_dimensions: reviewDimensions,
  gap_items: gapItems,
  recommended_next_actions: recommendedNextActions,
  ...noMutationControls
};

const learning = {
  module_id: "AG07D",
  title: "Preview Packet Review Learning",
  status: "learning_record_only",
  review_audit_only: true,
  summary,
  learning_points: [
    "AG07C proves safe preview packet creation is possible without public mutation.",
    "The current preview packet is structurally useful but not content-complete.",
    "The packet needs future section-depth planning before any production generation.",
    "Reference and visual workbenches must remain separate controlled stages.",
    "Schema paths remain future-database compatible, but Supabase/database activation remains blocked."
  ],
  carried_forward_doctrine: [
    "Preview-only packet output is not production content.",
    "Placeholder sections are acceptable for AG07C but must be treated as production blockers.",
    "Reference URL discovery, population and insertion require later approval.",
    "Visual generation requires later approval.",
    "JSONL/database/Supabase persistence requires a separate activation boundary."
  ],
  ...noMutationControls
};

const review = {
  module_id: "AG07D",
  title: "Preview Packet Review and Gap Audit",
  status: "gap_audit_completed",
  governance_only: true,
  review_audit_only: true,
  depends_on: ["AG07C", "AG07B", "AG07A", "AG06Z"],
  generated_from: inputs,
  summary,
  alignment_with_ag07c: {
    ag07c_status: ag07cReview.status,
    ag07c_decision: ag07cReview.dry_run_decision?.decision,
    ag07d_requires_explicit_approval: ag07cReview.dry_run_decision?.proceed_to_ag07d_review_only_with_explicit_user_approval,
    preview_packet_created: ag07cReview.dry_run_decision?.preview_only_packet_created,
    production_packet_created: ag07cReview.dry_run_decision?.production_packet_created,
    public_article_mutation_allowed: ag07cReview.dry_run_decision?.public_article_mutation_allowed,
    reference_insertion_allowed: ag07cReview.dry_run_decision?.reference_insertion_allowed,
    jsonl_production_append_allowed: ag07cReview.dry_run_decision?.jsonl_production_append_allowed,
    publishing_allowed: ag07cReview.dry_run_decision?.publishing_allowed,
    backend_auth_supabase_allowed: ag07cReview.dry_run_decision?.backend_auth_supabase_allowed
  },
  foundation_alignment: {
    ag06z_foundation_closed: ag06zClosure.status === "foundation_closed",
    ag07a_boundary_closed: ag07aReview.status === "design_dry_run_boundary_only",
    ag07b_plan_closed: ag07bReview.status === "implementation_plan_only",
    long_form_word_count_min: ag06eStandard.summary?.word_count_min || 1500,
    long_form_word_count_max: ag06eStandard.summary?.word_count_max || 2200,
    visual_type_count: asArray(ag06iVisualStandard.visual_types).length,
    source_type_count: asArray(ag06jReferenceStandard.source_type_taxonomy).length,
    jsonl_store_count: asArray(ag06kManifest.stores).length,
    approval_register_count: approvalEntries.length,
    ag07c_schema_status: ag07cSchema.status
  },
  gap_matrix_file: "data/content-intelligence/run-registry/ag07d-preview-packet-gap-matrix.json",
  learning_file: "data/content-intelligence/learning/ag07d-preview-packet-review-learning.json",
  closure_decision: {
    decision: "ag07d_preview_packet_review_gap_audit_closed",
    proceed_to_ag07e_revision_plan_only_with_explicit_user_approval: true,
    production_readiness: "not_ready",
    publish_readiness: "blocked",
    article_prose_generation_allowed: false,
    public_article_mutation_allowed: false,
    reference_insertion_allowed: false,
    visual_generation_allowed: false,
    scaffold_import_allowed: false,
    jsonl_production_append_allowed: false,
    database_write_allowed: false,
    publishing_allowed: false,
    backend_auth_supabase_allowed: false
  },
  ...noMutationControls
};

const registry = {
  module_id: "AG07D",
  title: "Preview Packet Review and Gap Audit",
  governance_only: true,
  review_audit_only: true,
  depends_on: ["AG07C"],
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag07d-preview-packet-review-gap-audit.json",
    gap_matrix: "data/content-intelligence/run-registry/ag07d-preview-packet-gap-matrix.json",
    learning: "data/content-intelligence/learning/ag07d-preview-packet-review-learning.json",
    preview: "data/quality/ag07d-preview-packet-review-gap-audit-preview.json",
    document: "docs/quality/AG07D_PREVIEW_PACKET_REVIEW_GAP_AUDIT.md"
  },
  summary,
  next_recommended_stage: {
    module_id: "AG07E",
    title: "Preview Packet Revision Plan",
    allowed_scope: "revision planning only unless explicitly expanded",
    blocked_scope: "article prose generation, public mutation, reference insertion, visual generation, JSONL production append, publishing, backend/Auth/Supabase activation"
  },
  ...noMutationControls
};

const preview = {
  module_id: "AG07D",
  preview_only: true,
  review_audit_only: true,
  summary,
  reviewed_packet_preview: {
    content_packet_id: ag07cPacket.content_packet_id,
    status: ag07cPacket.status,
    selected_candidate: ag07cPacket.selected_candidate,
    section_count: packetSections.length
  },
  gap_preview: gapItems.map((gap) => ({
    gap_id: gap.gap_id,
    gap_area: gap.gap_area,
    severity: gap.severity,
    production_blocker: gap.production_blocker,
    recommended_next_action: gap.recommended_next_action
  })),
  next_stage_id: "AG07E",
  ...noMutationControls
};

const doc = `# AG07D — Preview Packet Review and Gap Audit

## Purpose

AG07D reviews the AG07C preview-only content packet skeleton and records structural gaps before any expansion, production generation or public mutation is considered.

This stage is review/audit only. It does not generate article prose, mutate public articles, insert references, generate visuals, append JSONL records, publish content, write to a database, or activate backend/Auth/Supabase/API functionality.

## Inputs

AG07D consumes:

- AG07C preview-only content packet skeleton.
- AG07C execution record.
- AG07C review and schema.
- AG07B implementation plan.
- AG07A generator boundary.
- AG06Z foundation closure.
- AG06E long-form article standard.
- AG06I visual/data standard.
- AG06J reference/source credibility standard.
- AG06K JSONL-first store manifest.
- AG06L publish queue approval state register.

## Review Findings

AG07D records the following expected preview-stage gaps:

- section skeleton exists but section depth is missing;
- article prose is not generated;
- reference plan is represented but URLs and approvals are empty;
- visual/data plan is represented but no visual asset exists;
- quality and visitor-value scores are not computed;
- packet is not publish-ready;
- approval state remains not approved;
- schema/database mapping remains future-compatible but inactive.

## Production Readiness Decision

The AG07C preview packet is useful as a safe structural proof, but it is not production-ready.

Production readiness remains blocked.

Publish readiness remains blocked.

## Explicit Exclusions

AG07D does not:

- generate article prose;
- generate production content packets;
- mutate public article HTML;
- insert, populate or change reference URLs;
- fetch live URLs;
- generate visual assets or infographics;
- copy, move, delete or import scaffold outputs;
- create or append production JSONL records;
- write to any database;
- change approval states;
- set publish_ready=true;
- publish content;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup or public dynamic output.

## Acceptance Criteria

AG07D is acceptable only if:

- AG07C preview packet is present;
- AG07C packet remains preview-only, non-production, not publish-ready and not publication-allowed;
- gap matrix is generated;
- expected preview-stage gaps are recorded;
- production readiness is marked not_ready;
- publish readiness is marked blocked;
- AG07E is identified as next only with explicit approval;
- package scripts for generate:ag07d and validate:ag07d are present;
- validate:project includes validate:ag07d;
- no article prose generation, public mutation, reference insertion, visual generation, scaffold import, JSONL production append, database write, approval-state change, publishing or backend/Auth/Supabase activation is performed.

## Next Stage

The next possible stage is AG07E — Preview Packet Revision Plan.

AG07E must not start automatically. It requires explicit approval.
`;

writeJson(reviewPath, review);
writeJson(gapMatrixPath, gapMatrix);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG07D preview packet review and gap audit artifacts generated.");
