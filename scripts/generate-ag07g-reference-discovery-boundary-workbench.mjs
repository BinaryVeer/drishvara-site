import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag07fReview: "data/content-intelligence/quality-reviews/ag07f-preview-packet-schema-revision-boundary.json",
  ag07fBoundaryPlan: "data/content-intelligence/run-registry/ag07f-preview-packet-contract-boundary-plan.json",
  ag07fRevisedSchema: "data/content-intelligence/schema/preview-packet-revised-contract.schema.json",
  ag07fLearning: "data/content-intelligence/learning/ag07f-preview-packet-schema-boundary-learning.json",
  ag07eReview: "data/content-intelligence/quality-reviews/ag07e-preview-packet-revision-plan.json",
  ag07cPacket: "data/content-intelligence/content-packets/ag07c-preview-only-dry-run-content-packet.json",
  ag06jReferenceStandard: "data/content-intelligence/reference-registry/reference-source-credibility-standard.json",
  ag06eLongFormStandard: "data/content-intelligence/quality-reviews/long-form-article-standard.json",
  ag06kStoreManifest: "data/content-intelligence/run-registry/jsonl-first-content-intelligence-store-manifest.json",
  ag06lApprovalRegister: "data/content-intelligence/publish-queue/publish-queue-approval-state-register.json"
};

const reviewPath = path.join(root, "data", "content-intelligence", "quality-reviews", "ag07g-reference-discovery-boundary-workbench.json");
const workbenchPath = path.join(root, "data", "content-intelligence", "reference-registry", "ag07g-reference-discovery-workbench.json");
const schemaPath = path.join(root, "data", "content-intelligence", "schema", "reference-discovery-workbench.schema.json");
const learningPath = path.join(root, "data", "content-intelligence", "learning", "ag07g-reference-discovery-boundary-learning.json");
const registryPath = path.join(root, "data", "quality", "ag07g-reference-discovery-boundary-workbench.json");
const previewPath = path.join(root, "data", "quality", "ag07g-reference-discovery-boundary-workbench-preview.json");
const docPath = path.join(root, "docs", "quality", "AG07G_REFERENCE_DISCOVERY_BOUNDARY_WORKBENCH.md");

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
  reference_discovery_boundary_only: true,
  reference_url_population_performed: false,
  candidate_reference_url_population_performed: false,
  approved_reference_url_population_performed: false,
  rejected_reference_url_population_performed: false,
  live_url_fetch_performed: false,
  web_fetch_performed: false,
  link_health_fetch_performed: false,
  reference_insertion_performed: false,
  article_prose_generated: false,
  narrative_text_generated: false,
  production_content_generated: false,
  public_article_mutation_performed: false,
  article_html_mutation_performed: false,
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
    throw new Error(`Missing required AG07G input ${name}: ${relativePath}`);
  }
}

const ag07fReview = readJson(inputs.ag07fReview);
const ag07fBoundaryPlan = readJson(inputs.ag07fBoundaryPlan);
const ag07fRevisedSchema = readJson(inputs.ag07fRevisedSchema);
const ag07fLearning = readJson(inputs.ag07fLearning);
const ag07eReview = readJson(inputs.ag07eReview);
const ag07cPacket = readJson(inputs.ag07cPacket);
const ag06jReferenceStandard = readJson(inputs.ag06jReferenceStandard);
const ag06eLongFormStandard = readJson(inputs.ag06eLongFormStandard);
const ag06kStoreManifest = readJson(inputs.ag06kStoreManifest);
const ag06lApprovalRegister = readJson(inputs.ag06lApprovalRegister);

const proposedContractSections = asArray(ag07fBoundaryPlan.proposed_contract_sections);
const referenceContractSection = proposedContractSections.find((section) => section.section_id === "reference_plan") || {};
const approvalEntries = asArray(ag06lApprovalRegister.approval_queue_entries);

const sourceTypeTaxonomy = asArray(
  ag06jReferenceStandard.source_type_taxonomy ||
  ag06jReferenceStandard.source_types ||
  []
);

const credibilityTiers = asArray(
  ag06jReferenceStandard.credibility_tiers ||
  ag06jReferenceStandard.source_credibility_tiers ||
  []
);

const rejectionReasons = asArray(
  ag06jReferenceStandard.rejection_reasons ||
  ag06jReferenceStandard.reference_rejection_reasons ||
  []
);

const lifecycleStatuses = asArray(
  ag06jReferenceStandard.lifecycle_statuses ||
  ag06jReferenceStandard.reference_lifecycle_statuses ||
  []
);

const minRefs = ag06eLongFormStandard.summary?.verified_reference_min || 2;
const maxRefs = ag06eLongFormStandard.summary?.verified_reference_max || 5;

const sourceCategorySlots = [
  {
    slot_id: "AG07G-SLOT-001",
    source_category: "primary_or_authoritative_source",
    purpose: "Prefer official, original, institutional or canonical source where available.",
    expected_count_min: 1,
    expected_count_max: 2,
    candidate_url_population_allowed_in_ag07g: false,
    approved_url_population_allowed_in_ag07g: false,
    urls: []
  },
  {
    slot_id: "AG07G-SLOT-002",
    source_category: "credible_context_source",
    purpose: "Use a reliable secondary source for context, background or explanation.",
    expected_count_min: 1,
    expected_count_max: 2,
    candidate_url_population_allowed_in_ag07g: false,
    approved_url_population_allowed_in_ag07g: false,
    urls: []
  },
  {
    slot_id: "AG07G-SLOT-003",
    source_category: "data_or_evidence_source",
    purpose: "Use data, report, paper, dataset or structured evidence where relevant.",
    expected_count_min: 0,
    expected_count_max: 1,
    candidate_url_population_allowed_in_ag07g: false,
    approved_url_population_allowed_in_ag07g: false,
    urls: []
  }
];

const candidateReferenceSlots = Array.from({ length: maxRefs }, (_, index) => ({
  slot_id: `AG07G-CANDIDATE-${String(index + 1).padStart(2, "0")}`,
  slot_order: index + 1,
  required_before_publish: index < minRefs,
  candidate_status: "empty_boundary_slot",
  candidate_url: "",
  approved_url: "",
  rejected_url: "",
  source_type_target: index === 0 ? "primary_or_authoritative_source" : "credible_context_source",
  credibility_tier_target: "credible_or_authoritative",
  discovery_allowed_in_ag07g: false,
  url_population_allowed_in_ag07g: false,
  live_fetch_allowed_in_ag07g: false,
  link_health_check_allowed_in_ag07g: false,
  insertion_allowed_in_ag07g: false,
  reviewer_decision: "not_started",
  rejection_reason: "",
  notes: "Boundary slot only. No URL is populated in AG07G."
}));

const reviewWorkflow = [
  {
    step_id: "AG07G-WF-001",
    step_name: "candidate_discovery",
    description: "Future step to discover candidate sources for each slot.",
    allowed_in_ag07g: false,
    future_approval_required: true
  },
  {
    step_id: "AG07G-WF-002",
    step_name: "credibility_screening",
    description: "Future step to check source authority, relevance and quality.",
    allowed_in_ag07g: false,
    future_approval_required: true
  },
  {
    step_id: "AG07G-WF-003",
    step_name: "link_health_review",
    description: "Future step to check if links are reachable, non-spam, non-broken and relevant.",
    allowed_in_ag07g: false,
    future_approval_required: true
  },
  {
    step_id: "AG07G-WF-004",
    step_name: "editorial_approval",
    description: "Future step to approve references before packet production or article insertion.",
    allowed_in_ag07g: false,
    future_approval_required: true
  },
  {
    step_id: "AG07G-WF-005",
    step_name: "article_reference_insertion",
    description: "Future public article insertion step; explicitly blocked in AG07G.",
    allowed_in_ag07g: false,
    future_approval_required: true
  }
];

const linkHealthFields = [
  "not_checked",
  "reachable",
  "redirected",
  "paywalled",
  "broken",
  "spam_or_parked",
  "irrelevant",
  "requires_editorial_verification"
];

const credibilityChecklist = [
  {
    check_id: "AG07G-CHECK-001",
    check_name: "source_identity",
    description: "Source identity must be clear before approval.",
    required_before_approval: true,
    evaluated_in_ag07g: false
  },
  {
    check_id: "AG07G-CHECK-002",
    check_name: "relevance_to_article",
    description: "Source must directly support the future article claim or context.",
    required_before_approval: true,
    evaluated_in_ag07g: false
  },
  {
    check_id: "AG07G-CHECK-003",
    check_name: "credibility_tier",
    description: "Source must meet the credibility standard defined in AG06J.",
    required_before_approval: true,
    evaluated_in_ag07g: false
  },
  {
    check_id: "AG07G-CHECK-004",
    check_name: "link_health",
    description: "Source URL must be reachable and non-spam before insertion.",
    required_before_approval: true,
    evaluated_in_ag07g: false
  },
  {
    check_id: "AG07G-CHECK-005",
    check_name: "non_invented_reference",
    description: "Reference must not be invented, guessed or placeholder-disguised as verified.",
    required_before_approval: true,
    evaluated_in_ag07g: false
  }
];

const futureStageHandoff = [
  {
    stage_id: "AG07H",
    title: "Visual and Data Enrichment Boundary / Workbench",
    receives_from_ag07g: ["reference_need_context", "source_evidence_expectation"],
    allowed_scope: "visual/data planning only with explicit approval",
    blocked_actions: ["visual_generation", "article_mutation", "publishing"]
  },
  {
    stage_id: "AG07I",
    title: "Quality and Visitor-Value Scoring Boundary",
    receives_from_ag07g: ["reference_readiness_fields", "credibility_checklist"],
    allowed_scope: "quality/visitor-value scoring boundary only with explicit approval",
    blocked_actions: ["publish_ready_set", "approval_state_change", "publishing"]
  },
  {
    stage_id: "AG07J",
    title: "Reference Candidate Population Dry Run",
    receives_from_ag07g: ["candidate_reference_slots", "source_category_slots", "review_workflow"],
    allowed_scope: "candidate URL population only if explicitly approved later",
    blocked_actions: ["reference_insertion", "public_article_mutation", "publishing", "backend_auth_supabase_activation"]
  }
];

const summary = {
  ag07f_boundary_consumed: ag07fReview.status === "schema_contract_boundary_defined",
  ag07e_revision_plan_consumed: ag07eReview.status === "revision_plan_completed",
  ag07c_packet_present: true,
  ag07c_packet_unchanged: true,
  reference_contract_section_present: Boolean(referenceContractSection.section_id),
  source_category_slot_count: sourceCategorySlots.length,
  candidate_reference_slot_count: candidateReferenceSlots.length,
  source_type_taxonomy_available: sourceTypeTaxonomy.length > 0,
  credibility_tier_available: credibilityTiers.length > 0,
  lifecycle_status_available: lifecycleStatuses.length > 0,
  rejection_reason_available: rejectionReasons.length > 0,
  review_workflow_step_count: reviewWorkflow.length,
  credibility_check_count: credibilityChecklist.length,
  reference_url_population_performed: false,
  candidate_reference_url_count: 0,
  approved_reference_url_count: 0,
  rejected_reference_url_count: 0,
  live_url_fetch_performed: false,
  link_health_fetch_performed: false,
  reference_insertion_performed: false,
  production_readiness_after_ag07g: "not_ready",
  publish_readiness_after_ag07g: "blocked",
  public_article_mutation_allowed: false,
  article_prose_generated: false,
  visual_generation_allowed: false,
  jsonl_production_append_allowed: false,
  database_write_allowed: false,
  publishing_allowed: false,
  backend_auth_supabase_allowed: false,
  next_stage_id: "AG07H"
};

const workbench = {
  module_id: "AG07G",
  title: "Reference Discovery Boundary Workbench",
  status: "reference_discovery_boundary_defined",
  reference_discovery_boundary_only: true,
  generated_from: inputs,
  summary,
  source_packet_snapshot: {
    content_packet_id: ag07cPacket.content_packet_id,
    status: ag07cPacket.status,
    preview_only: ag07cPacket.preview_only,
    production_packet: ag07cPacket.production_packet,
    publish_ready: ag07cPacket.publish_ready,
    publication_allowed: ag07cPacket.publication_allowed,
    packet_modified_in_ag07g: false
  },
  reference_standard_snapshot: {
    min_verified_references: minRefs,
    max_verified_references: maxRefs,
    source_type_taxonomy_count: sourceTypeTaxonomy.length,
    credibility_tier_count: credibilityTiers.length,
    lifecycle_status_count: lifecycleStatuses.length,
    rejection_reason_count: rejectionReasons.length
  },
  source_category_slots: sourceCategorySlots,
  candidate_reference_slots: candidateReferenceSlots,
  review_workflow: reviewWorkflow,
  credibility_checklist: credibilityChecklist,
  link_health_fields: linkHealthFields,
  future_stage_handoff: futureStageHandoff,
  ...noMutationControls
};

const schema = {
  schema_id: "drishvara/ag07g/reference-discovery-workbench.schema.json",
  module_id: "AG07G",
  title: "Reference Discovery Workbench Schema",
  status: "schema_boundary_only",
  description: "Schema for a future reference discovery/review workbench. AG07G defines empty candidate slots and review fields only; it does not populate URLs or insert references.",
  required_top_level_fields: [
    "source_packet_snapshot",
    "reference_standard_snapshot",
    "source_category_slots",
    "candidate_reference_slots",
    "review_workflow",
    "credibility_checklist",
    "link_health_fields",
    "mutation_controls"
  ],
  candidate_slot_required_fields: [
    "slot_id",
    "slot_order",
    "required_before_publish",
    "candidate_status",
    "candidate_url",
    "approved_url",
    "rejected_url",
    "source_type_target",
    "credibility_tier_target",
    "discovery_allowed_in_ag07g",
    "url_population_allowed_in_ag07g",
    "live_fetch_allowed_in_ag07g",
    "link_health_check_allowed_in_ag07g",
    "insertion_allowed_in_ag07g",
    "reviewer_decision",
    "rejection_reason"
  ],
  allowed_candidate_statuses: [
    "empty_boundary_slot",
    "candidate_discovery_pending",
    "candidate_review_pending",
    "candidate_approved",
    "candidate_rejected"
  ],
  allowed_reviewer_decisions: [
    "not_started",
    "approve_later",
    "reject_later",
    "needs_more_context",
    "requires_editorial_verification"
  ],
  url_population_allowed_in_ag07g: false,
  reference_insertion_allowed_in_ag07g: false,
  web_fetch_allowed_in_ag07g: false,
  link_health_fetch_allowed_in_ag07g: false,
  article_mutation_allowed_in_ag07g: false,
  publishing_allowed_in_ag07g: false,
  backend_auth_supabase_allowed_in_ag07g: false,
  ...noMutationControls
};

const learning = {
  module_id: "AG07G",
  title: "Reference Discovery Boundary Learning",
  status: "learning_record_only",
  reference_discovery_boundary_only: true,
  generated_from: inputs,
  summary,
  learning_points_from_ag07f: asArray(ag07fLearning.ag07f_learning_points),
  ag07g_learning_points: [
    "Reference planning can be structured without populating or inserting URLs.",
    "Candidate slots must remain empty until a separately approved discovery/population stage.",
    "Credibility, link-health and rejection fields should exist before candidate URL work begins.",
    "Reference insertion into public article HTML must remain a later controlled mutation stage.",
    "Schema-to-database compatibility is preserved through structured workbench records, but persistence remains blocked."
  ],
  carried_forward_doctrine: [
    "Reference discovery boundary is not URL population.",
    "Candidate slots are not verified references.",
    "Approved references require future review and approval.",
    "No public article mutation may occur in AG07G.",
    "No JSONL/database/Supabase persistence may occur in AG07G."
  ],
  ...noMutationControls
};

const review = {
  module_id: "AG07G",
  title: "Reference Discovery Boundary / Workbench",
  status: "reference_discovery_boundary_defined",
  governance_only: true,
  reference_discovery_boundary_only: true,
  depends_on: ["AG07F", "AG07E", "AG07C", "AG06J", "AG06E", "AG06K", "AG06L"],
  generated_from: inputs,
  summary,
  alignment_with_ag07f: {
    ag07f_status: ag07fReview.status,
    ag07f_decision: ag07fReview.closure_decision?.decision,
    ag07g_requires_explicit_approval: ag07fReview.closure_decision?.proceed_to_ag07g_only_with_explicit_user_approval,
    reference_insertion_allowed: ag07fReview.closure_decision?.reference_insertion_allowed,
    public_article_mutation_allowed: ag07fReview.closure_decision?.public_article_mutation_allowed,
    article_prose_generation_allowed: ag07fReview.closure_decision?.article_prose_generation_allowed,
    visual_generation_allowed: ag07fReview.closure_decision?.visual_generation_allowed,
    jsonl_production_append_allowed: ag07fReview.closure_decision?.jsonl_production_append_allowed,
    backend_auth_supabase_allowed: ag07fReview.closure_decision?.backend_auth_supabase_allowed
  },
  workbench_file: "data/content-intelligence/reference-registry/ag07g-reference-discovery-workbench.json",
  schema_file: "data/content-intelligence/schema/reference-discovery-workbench.schema.json",
  learning_file: "data/content-intelligence/learning/ag07g-reference-discovery-boundary-learning.json",
  closure_decision: {
    decision: "ag07g_reference_discovery_boundary_closed",
    proceed_to_ag07h_only_with_explicit_user_approval: true,
    reference_discovery_boundary_defined: true,
    reference_url_population_performed: false,
    candidate_reference_url_population_performed: false,
    approved_reference_url_population_performed: false,
    reference_insertion_performed: false,
    live_url_fetch_performed: false,
    link_health_fetch_performed: false,
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
  module_id: "AG07G",
  title: "Reference Discovery Boundary / Workbench",
  governance_only: true,
  reference_discovery_boundary_only: true,
  depends_on: ["AG07F"],
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag07g-reference-discovery-boundary-workbench.json",
    workbench: "data/content-intelligence/reference-registry/ag07g-reference-discovery-workbench.json",
    schema: "data/content-intelligence/schema/reference-discovery-workbench.schema.json",
    learning: "data/content-intelligence/learning/ag07g-reference-discovery-boundary-learning.json",
    preview: "data/quality/ag07g-reference-discovery-boundary-workbench-preview.json",
    document: "docs/quality/AG07G_REFERENCE_DISCOVERY_BOUNDARY_WORKBENCH.md"
  },
  summary,
  next_recommended_stage: {
    module_id: "AG07H",
    title: "Visual and Data Enrichment Boundary / Workbench",
    allowed_scope: "visual/data enrichment boundary only unless explicitly expanded",
    blocked_scope: "reference URL population, reference insertion, article prose generation, public mutation, visual generation, JSONL production append, publishing, backend/Auth/Supabase activation"
  },
  ...noMutationControls
};

const preview = {
  module_id: "AG07G",
  preview_only: true,
  reference_discovery_boundary_only: true,
  summary,
  source_packet_snapshot: workbench.source_packet_snapshot,
  source_category_slots: sourceCategorySlots.map((slot) => ({
    slot_id: slot.slot_id,
    source_category: slot.source_category,
    expected_count_min: slot.expected_count_min,
    expected_count_max: slot.expected_count_max,
    urls_count: slot.urls.length,
    url_population_allowed_in_ag07g: slot.candidate_url_population_allowed_in_ag07g
  })),
  candidate_reference_slots: candidateReferenceSlots.map((slot) => ({
    slot_id: slot.slot_id,
    required_before_publish: slot.required_before_publish,
    candidate_status: slot.candidate_status,
    candidate_url_empty: slot.candidate_url === "",
    approved_url_empty: slot.approved_url === "",
    url_population_allowed_in_ag07g: slot.url_population_allowed_in_ag07g,
    insertion_allowed_in_ag07g: slot.insertion_allowed_in_ag07g
  })),
  review_workflow: reviewWorkflow,
  credibility_checklist: credibilityChecklist,
  future_stage_handoff: futureStageHandoff,
  next_stage_id: "AG07H",
  ...noMutationControls
};

const doc = `# AG07G — Reference Discovery Boundary / Workbench

## Purpose

AG07G defines the reference discovery and review workbench boundary for future long-form content packets.

This stage is reference-boundary only. It does not populate reference URLs, insert references into article HTML, fetch live URLs, run link-health checks, generate article prose, mutate public articles, generate visuals, append JSONL records, publish content, write to a database, or activate backend/Auth/Supabase/API functionality.

## Inputs

AG07G consumes:

- AG07F Preview Packet Schema Revision Boundary.
- AG07F contract boundary plan.
- AG07F revised contract schema.
- AG07F learning record.
- AG07E Preview Packet Revision Plan.
- AG07C preview-only packet skeleton.
- AG06J reference/source credibility standard.
- AG06E long-form article standard.
- AG06K JSONL-first store manifest.
- AG06L publish queue approval state register.

## Workbench Boundary

AG07G defines:

- source category slots;
- candidate reference slots;
- credibility checklist;
- link-health fields;
- review workflow;
- future handoff to later controlled stages.

All candidate URL, approved URL and rejected URL fields remain empty in AG07G.

## Reference Status

AG07G does not create verified references.

It does not populate candidate references.

It does not approve references.

It does not reject references.

It does not insert references into public article HTML.

## Production Readiness Decision

AG07G does not make the packet production-ready.

Production readiness remains not_ready.

Publish readiness remains blocked.

## Explicit Exclusions

AG07G does not:

- populate candidate reference URLs;
- populate approved reference URLs;
- populate rejected reference URLs;
- fetch live URLs;
- perform link-health checks;
- insert references into article HTML;
- generate article prose;
- generate production content packets;
- mutate public article HTML;
- generate visual assets or infographics;
- copy, move, delete or import scaffold outputs;
- create or append production JSONL records;
- write to any database;
- change approval states;
- set publish_ready=true;
- publish content;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup or public dynamic output.

## Acceptance Criteria

AG07G is acceptable only if:

- AG07F boundary is consumed;
- AG06J reference/source credibility standard is consumed;
- candidate reference slots are created as empty boundary slots;
- candidate_url, approved_url and rejected_url fields remain empty;
- reference URL population remains false;
- reference insertion remains false;
- live fetch and link-health fetch remain false;
- production readiness remains not_ready;
- publish readiness remains blocked;
- AG07H is identified as next only with explicit approval;
- package scripts for generate:ag07g and validate:ag07g are present;
- validate:project includes validate:ag07g;
- no reference URL population, reference insertion, article prose generation, public mutation, visual generation, scaffold import, JSONL production append, database write, approval-state change, publishing or backend/Auth/Supabase activation is performed.

## Next Stage

The next possible stage is AG07H — Visual and Data Enrichment Boundary / Workbench.

AG07H must not start automatically. It requires explicit approval.
`;

writeJson(reviewPath, review);
writeJson(workbenchPath, workbench);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG07G reference discovery boundary/workbench artifacts generated.");
