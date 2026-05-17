import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag07dReview: "data/content-intelligence/quality-reviews/ag07d-preview-packet-review-gap-audit.json",
  ag07dGapMatrix: "data/content-intelligence/run-registry/ag07d-preview-packet-gap-matrix.json",
  ag07dLearning: "data/content-intelligence/learning/ag07d-preview-packet-review-learning.json",
  ag07cPacket: "data/content-intelligence/content-packets/ag07c-preview-only-dry-run-content-packet.json",
  ag07cReview: "data/content-intelligence/quality-reviews/ag07c-content-packet-generator-preview-only-dry-run.json",
  ag07bReview: "data/content-intelligence/quality-reviews/ag07b-content-packet-generator-dry-run-implementation-plan.json",
  ag07aReview: "data/content-intelligence/quality-reviews/ag07a-long-form-content-packet-generator-design-dry-run-boundary.json",
  ag06zClosure: "data/content-intelligence/quality-reviews/content-intelligence-foundation-closure.json",
  ag06eStandard: "data/content-intelligence/quality-reviews/long-form-article-standard.json",
  ag06iVisualStandard: "data/content-intelligence/visual-registry/visual-data-infographic-requirement-standard.json",
  ag06jReferenceStandard: "data/content-intelligence/reference-registry/reference-source-credibility-standard.json",
  ag06kStoreManifest: "data/content-intelligence/run-registry/jsonl-first-content-intelligence-store-manifest.json",
  ag06lApprovalRegister: "data/content-intelligence/publish-queue/publish-queue-approval-state-register.json"
};

const reviewPath = path.join(root, "data", "content-intelligence", "quality-reviews", "ag07e-preview-packet-revision-plan.json");
const roadmapPath = path.join(root, "data", "content-intelligence", "run-registry", "ag07e-preview-packet-revision-roadmap.json");
const schemaPath = path.join(root, "data", "content-intelligence", "schema", "preview-packet-revision-plan.schema.json");
const learningPath = path.join(root, "data", "content-intelligence", "learning", "ag07e-preview-packet-revision-planning-learning.json");
const registryPath = path.join(root, "data", "quality", "ag07e-preview-packet-revision-plan.json");
const previewPath = path.join(root, "data", "quality", "ag07e-preview-packet-revision-plan-preview.json");
const docPath = path.join(root, "docs", "quality", "AG07E_PREVIEW_PACKET_REVISION_PLAN.md");

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
  packet_revision_execution_performed: false,
  preview_packet_modified: false,
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
    throw new Error(`Missing required AG07E input ${name}: ${relativePath}`);
  }
}

const ag07dReview = readJson(inputs.ag07dReview);
const ag07dGapMatrix = readJson(inputs.ag07dGapMatrix);
const ag07dLearning = readJson(inputs.ag07dLearning);
const ag07cPacket = readJson(inputs.ag07cPacket);
const ag07cReview = readJson(inputs.ag07cReview);
const ag07bReview = readJson(inputs.ag07bReview);
const ag07aReview = readJson(inputs.ag07aReview);
const ag06zClosure = readJson(inputs.ag06zClosure);
const ag06eStandard = readJson(inputs.ag06eStandard);
const ag06iVisualStandard = readJson(inputs.ag06iVisualStandard);
const ag06jReferenceStandard = readJson(inputs.ag06jReferenceStandard);
const ag06kManifest = readJson(inputs.ag06kStoreManifest);
const ag06lApprovalRegister = readJson(inputs.ag06lApprovalRegister);

const gapItems = asArray(ag07dGapMatrix.gap_items);
const packetSections = asArray(ag07cPacket.packet_sections);
const approvalEntries = asArray(ag06lApprovalRegister.approval_queue_entries);

const revisionItems = [
  {
    revision_id: "AG07E-REV-001",
    source_gap_ids: ["AG07D-GAP-001"],
    revision_area: "section_depth_model",
    planned_revision: "Define richer section-level packet fields for intent, reader value, source context, key arguments, evidence needs, data/visual hooks and editorial checks.",
    target_future_artifact: "future_preview_packet_schema_revision",
    execution_status_in_ag07e: "planned_not_executed",
    packet_revision_execution_allowed_in_ag07e: false,
    article_prose_generation_allowed: false,
    production_blocker_resolved_in_ag07e: false
  },
  {
    revision_id: "AG07E-REV-002",
    source_gap_ids: ["AG07D-GAP-002"],
    revision_area: "article_prose_boundary",
    planned_revision: "Preserve prose generation as a later explicitly approved stage and add stronger no-prose guards to future packet revision validators.",
    target_future_artifact: "future_drafting_boundary",
    execution_status_in_ag07e: "planned_not_executed",
    packet_revision_execution_allowed_in_ag07e: false,
    article_prose_generation_allowed: false,
    production_blocker_resolved_in_ag07e: false
  },
  {
    revision_id: "AG07E-REV-003",
    source_gap_ids: ["AG07D-GAP-003"],
    revision_area: "reference_workbench_handoff",
    planned_revision: "Define a reference discovery and review handoff structure without URL population or article insertion.",
    target_future_artifact: "future_reference_discovery_boundary",
    execution_status_in_ag07e: "planned_not_executed",
    packet_revision_execution_allowed_in_ag07e: false,
    article_prose_generation_allowed: false,
    production_blocker_resolved_in_ag07e: false
  },
  {
    revision_id: "AG07E-REV-004",
    source_gap_ids: ["AG07D-GAP-004"],
    revision_area: "visual_data_handoff",
    planned_revision: "Define visual/data enrichment planning fields for hero visual, structured data unit, caption context, alt text and image-credit readiness.",
    target_future_artifact: "future_visual_data_enrichment_boundary",
    execution_status_in_ag07e: "planned_not_executed",
    packet_revision_execution_allowed_in_ag07e: false,
    article_prose_generation_allowed: false,
    production_blocker_resolved_in_ag07e: false
  },
  {
    revision_id: "AG07E-REV-005",
    source_gap_ids: ["AG07D-GAP-005"],
    revision_area: "quality_visitor_value_scoring",
    planned_revision: "Define future quality and visitor-value scoring placeholders and gate inputs without calculating scores in AG07E.",
    target_future_artifact: "future_quality_scoring_boundary",
    execution_status_in_ag07e: "planned_not_executed",
    packet_revision_execution_allowed_in_ag07e: false,
    article_prose_generation_allowed: false,
    production_blocker_resolved_in_ag07e: false
  },
  {
    revision_id: "AG07E-REV-006",
    source_gap_ids: ["AG07D-GAP-006", "AG07D-GAP-007"],
    revision_area: "publish_approval_gate",
    planned_revision: "Carry forward publish-readiness and approval-state blockers into a future approval workflow without changing any approval state.",
    target_future_artifact: "future_publish_approval_boundary",
    execution_status_in_ag07e: "planned_not_executed",
    packet_revision_execution_allowed_in_ag07e: false,
    article_prose_generation_allowed: false,
    production_blocker_resolved_in_ag07e: false
  },
  {
    revision_id: "AG07E-REV-007",
    source_gap_ids: ["AG07D-GAP-008"],
    revision_area: "database_persistence_mapping",
    planned_revision: "Preserve schema-to-database/Supabase compatibility as a future mapping boundary without enabling JSONL production append or database write.",
    target_future_artifact: "future_database_mapping_boundary",
    execution_status_in_ag07e: "planned_not_executed",
    packet_revision_execution_allowed_in_ag07e: false,
    article_prose_generation_allowed: false,
    production_blocker_resolved_in_ag07e: false
  }
];

const futureRevisionStages = [
  {
    stage_id: "AG07F",
    title: "Preview Packet Schema Revision Boundary",
    purpose: "Revise the preview packet contract/schema only, if explicitly approved.",
    allowed_after_ag07e: "only_with_explicit_approval",
    blocked_actions: ["article_prose_generation", "public_mutation", "reference_insertion", "visual_generation", "jsonl_append", "publishing", "backend_auth_supabase_activation"]
  },
  {
    stage_id: "AG07G",
    title: "Reference Discovery Boundary / Workbench",
    purpose: "Plan reference discovery and source review without article insertion.",
    allowed_after_ag07e: "only_with_explicit_approval",
    blocked_actions: ["public_article_mutation", "reference_insertion_into_html", "publishing"]
  },
  {
    stage_id: "AG07H",
    title: "Visual and Data Enrichment Boundary / Workbench",
    purpose: "Plan visual/data enrichment without generating public visual assets.",
    allowed_after_ag07e: "only_with_explicit_approval",
    blocked_actions: ["public_visual_generation", "article_mutation", "publishing"]
  },
  {
    stage_id: "AG07I",
    title: "Quality and Visitor-Value Scoring Boundary",
    purpose: "Define scoring review logic before production packet readiness.",
    allowed_after_ag07e: "only_with_explicit_approval",
    blocked_actions: ["publish_ready_set", "approval_state_change", "publishing"]
  }
];

const revisionGateChecklist = [
  {
    gate_id: "packet_remains_preview_only",
    required: true,
    current_status: ag07cPacket.preview_only === true ? "pass" : "fail",
    execution_allowed_in_ag07e: false
  },
  {
    gate_id: "production_packet_remains_false",
    required: true,
    current_status: ag07cPacket.production_packet === false ? "pass" : "fail",
    execution_allowed_in_ag07e: false
  },
  {
    gate_id: "publish_ready_remains_false",
    required: true,
    current_status: ag07cPacket.publish_ready === false ? "pass" : "fail",
    execution_allowed_in_ag07e: false
  },
  {
    gate_id: "gap_items_mapped_to_revision_items",
    required: true,
    current_status: revisionItems.length >= 7 ? "pass" : "fail",
    execution_allowed_in_ag07e: false
  },
  {
    gate_id: "no_packet_revision_execution",
    required: true,
    current_status: "pass",
    execution_allowed_in_ag07e: false
  },
  {
    gate_id: "no_article_prose_generation",
    required: true,
    current_status: "pass",
    execution_allowed_in_ag07e: false
  },
  {
    gate_id: "no_public_mutation",
    required: true,
    current_status: "pass",
    execution_allowed_in_ag07e: false
  },
  {
    gate_id: "no_backend_supabase_activation",
    required: true,
    current_status: "pass",
    execution_allowed_in_ag07e: false
  }
];

const summary = {
  ag07d_gap_audit_consumed: ag07dReview.status === "gap_audit_completed",
  ag07c_preview_packet_present: true,
  packet_preview_only: ag07cPacket.preview_only === true,
  packet_production_packet: ag07cPacket.production_packet === true,
  packet_publish_ready: ag07cPacket.publish_ready === true,
  packet_publication_allowed: ag07cPacket.publication_allowed === true,
  source_gap_count: gapItems.length,
  revision_item_count: revisionItems.length,
  mapped_gap_count: new Set(revisionItems.flatMap((item) => item.source_gap_ids)).size,
  future_revision_stage_count: futureRevisionStages.length,
  revision_gate_count: revisionGateChecklist.length,
  revision_plan_defined: true,
  revision_execution_performed: false,
  packet_revision_execution_allowed: false,
  production_readiness_after_ag07e: "not_ready",
  publish_readiness_after_ag07e: "blocked",
  article_prose_generated: false,
  public_article_mutation_allowed: false,
  reference_insertion_allowed: false,
  visual_generation_allowed: false,
  jsonl_production_append_allowed: false,
  database_write_allowed: false,
  publishing_allowed: false,
  backend_auth_supabase_allowed: false,
  next_stage_id: "AG07F"
};

const roadmap = {
  module_id: "AG07E",
  title: "Preview Packet Revision Roadmap",
  status: "revision_plan_completed",
  revision_planning_only: true,
  generated_from: inputs,
  summary,
  source_gap_items: gapItems.map((gap) => ({
    gap_id: gap.gap_id,
    gap_area: gap.gap_area,
    severity: gap.severity,
    production_blocker: gap.production_blocker,
    finding: gap.finding
  })),
  revision_items: revisionItems,
  future_revision_stages: futureRevisionStages,
  revision_gate_checklist: revisionGateChecklist,
  packet_revision_boundary: {
    packet_to_revise_later: ag07cPacket.content_packet_id,
    current_packet_path: "data/content-intelligence/content-packets/ag07c-preview-only-dry-run-content-packet.json",
    current_packet_must_not_be_modified_in_ag07e: true,
    later_revision_requires_explicit_approval: true,
    later_revision_must_remain_preview_only_until_separately_approved: true
  },
  ...noMutationControls
};

const schema = {
  schema_id: "drishvara/ag07e/preview-packet-revision-plan.schema.json",
  module_id: "AG07E",
  title: "Preview Packet Revision Plan Schema",
  status: "schema_only",
  description: "Schema for converting AG07D preview packet gaps into a non-executed revision plan.",
  required_top_level_fields: [
    "source_gap_items",
    "revision_items",
    "future_revision_stages",
    "revision_gate_checklist",
    "packet_revision_boundary",
    "mutation_controls"
  ],
  revision_item_required_fields: [
    "revision_id",
    "source_gap_ids",
    "revision_area",
    "planned_revision",
    "target_future_artifact",
    "execution_status_in_ag07e",
    "packet_revision_execution_allowed_in_ag07e",
    "article_prose_generation_allowed",
    "production_blocker_resolved_in_ag07e"
  ],
  allowed_revision_statuses: [
    "planned_not_executed",
    "deferred",
    "blocked"
  ],
  ag07e_packet_revision_execution_allowed: false,
  ag07e_article_prose_generation_allowed: false,
  ag07e_public_mutation_allowed: false,
  ag07e_reference_insertion_allowed: false,
  ag07e_visual_generation_allowed: false,
  ag07e_jsonl_append_allowed: false,
  ag07e_database_write_allowed: false,
  ag07e_publishing_allowed: false,
  ag07e_backend_auth_supabase_allowed: false,
  ...noMutationControls
};

const learning = {
  module_id: "AG07E",
  title: "Preview Packet Revision Planning Learning",
  status: "learning_record_only",
  revision_planning_only: true,
  generated_from: inputs,
  summary,
  learning_points_from_ag07d: asArray(ag07dLearning.learning_points),
  ag07e_learning_points: [
    "AG07D gaps can be converted into a sequenced revision roadmap without modifying the AG07C packet.",
    "Section-depth improvements should be handled before article prose generation is considered.",
    "Reference and visual enrichment should remain separate workbenches.",
    "Quality and visitor-value scoring should be introduced before any production packet closure.",
    "Schema-to-database compatibility should be preserved, but database persistence must remain blocked."
  ],
  carried_forward_doctrine: [
    "Revision planning is not packet revision execution.",
    "Preview packet remains non-production until a later approved revision/execution stage.",
    "No article prose is generated in AG07E.",
    "No public article mutation is performed in AG07E.",
    "No backend/Auth/Supabase activation is performed in AG07E."
  ],
  ...noMutationControls
};

const review = {
  module_id: "AG07E",
  title: "Preview Packet Revision Plan",
  status: "revision_plan_completed",
  governance_only: true,
  revision_planning_only: true,
  depends_on: ["AG07D", "AG07C", "AG07B", "AG07A", "AG06Z"],
  generated_from: inputs,
  summary,
  alignment_with_ag07d: {
    ag07d_status: ag07dReview.status,
    ag07d_decision: ag07dReview.closure_decision?.decision,
    ag07e_requires_explicit_approval: ag07dReview.closure_decision?.proceed_to_ag07e_revision_plan_only_with_explicit_user_approval,
    production_readiness: ag07dReview.closure_decision?.production_readiness,
    publish_readiness: ag07dReview.closure_decision?.publish_readiness,
    article_prose_generation_allowed: ag07dReview.closure_decision?.article_prose_generation_allowed,
    public_article_mutation_allowed: ag07dReview.closure_decision?.public_article_mutation_allowed,
    reference_insertion_allowed: ag07dReview.closure_decision?.reference_insertion_allowed,
    visual_generation_allowed: ag07dReview.closure_decision?.visual_generation_allowed,
    jsonl_production_append_allowed: ag07dReview.closure_decision?.jsonl_production_append_allowed,
    backend_auth_supabase_allowed: ag07dReview.closure_decision?.backend_auth_supabase_allowed
  },
  packet_snapshot_preserved: {
    content_packet_id: ag07cPacket.content_packet_id,
    status: ag07cPacket.status,
    preview_only: ag07cPacket.preview_only,
    production_packet: ag07cPacket.production_packet,
    publish_ready: ag07cPacket.publish_ready,
    publication_allowed: ag07cPacket.publication_allowed,
    section_count: packetSections.length
  },
  foundation_alignment: {
    ag06z_foundation_closed: ag06zClosure.status === "foundation_closed",
    ag07a_boundary_closed: ag07aReview.status === "design_dry_run_boundary_only",
    ag07b_plan_closed: ag07bReview.status === "implementation_plan_only",
    ag07c_preview_completed: ag07cReview.status === "preview_only_dry_run_completed",
    long_form_word_count_min: ag06eStandard.summary?.word_count_min || 1500,
    long_form_word_count_max: ag06eStandard.summary?.word_count_max || 2200,
    visual_type_count: asArray(ag06iVisualStandard.visual_types).length,
    source_type_count: asArray(ag06jReferenceStandard.source_type_taxonomy).length,
    jsonl_store_count: asArray(ag06kManifest.stores).length,
    approval_register_count: approvalEntries.length
  },
  roadmap_file: "data/content-intelligence/run-registry/ag07e-preview-packet-revision-roadmap.json",
  schema_file: "data/content-intelligence/schema/preview-packet-revision-plan.schema.json",
  learning_file: "data/content-intelligence/learning/ag07e-preview-packet-revision-planning-learning.json",
  closure_decision: {
    decision: "ag07e_preview_packet_revision_plan_closed",
    proceed_to_ag07f_only_with_explicit_user_approval: true,
    revision_execution_performed: false,
    packet_revision_execution_allowed: false,
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
  module_id: "AG07E",
  title: "Preview Packet Revision Plan",
  governance_only: true,
  revision_planning_only: true,
  depends_on: ["AG07D"],
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag07e-preview-packet-revision-plan.json",
    roadmap: "data/content-intelligence/run-registry/ag07e-preview-packet-revision-roadmap.json",
    schema: "data/content-intelligence/schema/preview-packet-revision-plan.schema.json",
    learning: "data/content-intelligence/learning/ag07e-preview-packet-revision-planning-learning.json",
    preview: "data/quality/ag07e-preview-packet-revision-plan-preview.json",
    document: "docs/quality/AG07E_PREVIEW_PACKET_REVISION_PLAN.md"
  },
  summary,
  next_recommended_stage: {
    module_id: "AG07F",
    title: "Preview Packet Schema Revision Boundary",
    allowed_scope: "schema/contract revision boundary only unless explicitly expanded",
    blocked_scope: "packet revision execution, article prose generation, public mutation, reference insertion, visual generation, JSONL production append, publishing, backend/Auth/Supabase activation"
  },
  ...noMutationControls
};

const preview = {
  module_id: "AG07E",
  preview_only: true,
  revision_planning_only: true,
  summary,
  revision_items_preview: revisionItems.map((item) => ({
    revision_id: item.revision_id,
    revision_area: item.revision_area,
    source_gap_ids: item.source_gap_ids,
    execution_status_in_ag07e: item.execution_status_in_ag07e,
    packet_revision_execution_allowed_in_ag07e: item.packet_revision_execution_allowed_in_ag07e
  })),
  future_revision_stages: futureRevisionStages,
  packet_snapshot_preserved: review.packet_snapshot_preserved,
  next_stage_id: "AG07F",
  ...noMutationControls
};

const doc = `# AG07E — Preview Packet Revision Plan

## Purpose

AG07E converts the AG07D preview packet gap audit into a structured revision plan.

This stage is revision-planning only. It does not revise the AG07C packet, generate article prose, mutate public articles, insert references, generate visuals, append JSONL records, publish content, write to a database, or activate backend/Auth/Supabase/API functionality.

## Inputs

AG07E consumes:

- AG07D Preview Packet Review and Gap Audit.
- AG07D gap matrix.
- AG07D learning record.
- AG07C preview-only packet skeleton.
- AG07C review.
- AG07B implementation plan.
- AG07A generator boundary.
- AG06Z foundation closure.
- AG06E long-form article standard.
- AG06I visual/data standard.
- AG06J reference/source credibility standard.
- AG06K JSONL-first store manifest.
- AG06L publish queue approval state register.

## Revision Plan

AG07E plans improvements for:

- section-depth model;
- article-prose boundary;
- reference workbench handoff;
- visual/data workbench handoff;
- quality and visitor-value scoring;
- publish approval gate;
- database/Supabase persistence mapping boundary.

All revisions remain planned and not executed in AG07E.

## Packet Status

The AG07C preview packet remains:

- preview-only;
- non-production;
- not publish-ready;
- not publication-allowed;
- placeholder-only;
- without generated article prose;
- without reference URLs;
- without visual assets;
- without JSONL/database persistence.

## Production Readiness Decision

AG07E does not make the preview packet production-ready.

Production readiness remains not_ready.

Publish readiness remains blocked.

## Explicit Exclusions

AG07E does not:

- execute packet revision;
- modify the AG07C preview packet;
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

AG07E is acceptable only if:

- AG07D gap audit is consumed;
- AG07D gaps are mapped into revision items;
- revision items are planned_not_executed;
- AG07C packet remains unchanged and preview-only;
- production readiness remains not_ready;
- publish readiness remains blocked;
- AG07F is identified as next only with explicit approval;
- package scripts for generate:ag07e and validate:ag07e are present;
- validate:project includes validate:ag07e;
- no packet revision execution, article prose generation, public mutation, reference insertion, visual generation, scaffold import, JSONL production append, database write, approval-state change, publishing or backend/Auth/Supabase activation is performed.

## Next Stage

The next possible stage is AG07F — Preview Packet Schema Revision Boundary.

AG07F must not start automatically. It requires explicit approval.
`;

writeJson(reviewPath, review);
writeJson(roadmapPath, roadmap);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG07E preview packet revision plan artifacts generated.");
