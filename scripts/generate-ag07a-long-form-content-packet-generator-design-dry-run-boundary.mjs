import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag06zClosure: "data/content-intelligence/quality-reviews/content-intelligence-foundation-closure.json",
  ag06zEvidence: "data/content-intelligence/run-registry/content-intelligence-foundation-closure-evidence.json",
  ag06zHandoff: "data/content-intelligence/learning/content-intelligence-foundation-closure-handoff.json",
  ag06eStandard: "data/content-intelligence/quality-reviews/long-form-article-standard.json",
  ag06bContentPacketSchema: "data/content-intelligence/schema/content-packet.schema.json",
  ag06fUpgradeQueue: "data/content-intelligence/publish-queue/long-form-upgrade-queue.json",
  ag06hBatchPlanning: "data/content-intelligence/publish-queue/long-form-batch-01-content-packet-planning.json",
  ag06iVisualStandard: "data/content-intelligence/visual-registry/visual-data-infographic-requirement-standard.json",
  ag06jReferenceStandard: "data/content-intelligence/reference-registry/reference-source-credibility-standard.json",
  ag06kStoreManifest: "data/content-intelligence/run-registry/jsonl-first-content-intelligence-store-manifest.json",
  ag06lApprovalRegister: "data/content-intelligence/publish-queue/publish-queue-approval-state-register.json"
};

const reviewPath = path.join(root, "data", "content-intelligence", "quality-reviews", "ag07a-long-form-content-packet-generator-design-dry-run-boundary.json");
const dryRunPlanPath = path.join(root, "data", "content-intelligence", "run-registry", "ag07a-content-packet-generator-boundary-dry-run-plan.json");
const schemaPath = path.join(root, "data", "content-intelligence", "schema", "long-form-content-packet-generator-boundary.schema.json");
const registryPath = path.join(root, "data", "quality", "ag07a-long-form-content-packet-generator-design-dry-run-boundary.json");
const previewPath = path.join(root, "data", "quality", "ag07a-long-form-content-packet-generator-design-dry-run-boundary-preview.json");
const docPath = path.join(root, "docs", "quality", "AG07A_LONG_FORM_CONTENT_PACKET_GENERATOR_DESIGN_DRY_RUN_BOUNDARY.md");

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

const falseGuards = {
  mutation_performed: false,
  public_article_mutation_performed: false,
  article_html_mutation_performed: false,
  homepage_mutation_performed: false,
  css_mutation_performed: false,
  javascript_mutation_performed: false,
  reference_url_change_performed: false,
  reference_insertion_performed: false,
  reference_url_population_performed: false,
  verified_reference_population_performed: false,
  candidate_reference_population_performed: false,
  external_fetch_performed_by_script: false,
  live_url_fetch_performed: false,
  link_health_fetch_performed: false,
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
  scaffold_import_performed: false,
  file_deletion_performed: false,
  file_move_performed: false,
  public_article_archive_performed: false,
  public_article_delete_performed: false,
  public_publishing_performed: false,
  content_packet_generation_performed: false,
  content_packet_created: false,
  article_rewrite_performed: false,
  visual_asset_generation_performed: false,
  infographic_generation_performed: false,
  quality_scoring_performed: false,
  visitor_value_scoring_performed: false,
  jsonl_file_created: false,
  jsonl_production_record_created: false,
  jsonl_append_performed: false,
  jsonl_import_performed: false,
  database_write_performed: false,
  approval_state_changed: false,
  publish_ready_set: false,
  publish_queue_transition_performed: false,
  publication_approval_granted: false,
  ag07_production_tooling_started: false,
  ag07_content_packet_generator_implemented: false,
  ag07_dry_run_execution_performed: false,
  content_packet_output_written: false
};

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) {
    throw new Error(`Missing required AG07A input ${name}: ${relativePath}`);
  }
}

const ag06zClosure = readJson(inputs.ag06zClosure);
const ag06zEvidence = readJson(inputs.ag06zEvidence);
const ag06zHandoff = readJson(inputs.ag06zHandoff);
const ag06eStandard = readJson(inputs.ag06eStandard);
const ag06bSchema = readJson(inputs.ag06bContentPacketSchema);
const ag06fQueue = readJson(inputs.ag06fUpgradeQueue);
const ag06hPlanning = readJson(inputs.ag06hBatchPlanning);
const ag06iVisualStandard = readJson(inputs.ag06iVisualStandard);
const ag06jReferenceStandard = readJson(inputs.ag06jReferenceStandard);
const ag06kManifest = readJson(inputs.ag06kStoreManifest);
const ag06lApprovalRegister = readJson(inputs.ag06lApprovalRegister);

const articleQueue = asArray(
  ag06fQueue.article_upgrade_queue ||
  ag06fQueue.queue_entries ||
  ag06fQueue.entries ||
  ag06fQueue.long_form_upgrade_queue ||
  ag06fQueue.upgrade_queue ||
  ag06fQueue.items
);

const approvalEntries = asArray(ag06lApprovalRegister.approval_queue_entries);

const generatorBoundary = {
  boundary_id: "ag07a_long_form_content_packet_generator_design_dry_run_boundary",
  allowed_scope_in_ag07a: [
    "Define generator input contract.",
    "Define generator output contract.",
    "Define dry-run execution constraints.",
    "Define validation gates for later generator implementation.",
    "Define prohibited side effects.",
    "Map AG06 foundation standards into generator design."
  ],
  blocked_scope_in_ag07a: [
    "Do not implement production generator logic.",
    "Do not generate real content packets.",
    "Do not write content packet output files.",
    "Do not rewrite article text.",
    "Do not insert or change references.",
    "Do not fetch URLs.",
    "Do not generate visual assets.",
    "Do not import scaffold files.",
    "Do not append JSONL records.",
    "Do not change approval states.",
    "Do not publish content.",
    "Do not activate backend/Auth/Supabase/API."
  ],
  dry_run_definition: "AG07A may define a dry-run boundary and future contracts only. AG07A itself must not execute content-packet generation."
};

const futureGeneratorInputContract = {
  required_inputs: [
    "source_article_path",
    "source_article_classification",
    "long_form_article_standard",
    "content_packet_schema",
    "reference_source_credibility_standard",
    "visual_data_infographic_standard",
    "jsonl_store_governance",
    "publish_queue_approval_state",
    "mutation_controls"
  ],
  required_preconditions_before_later_generation: [
    "AG06Z foundation closure must be committed and pushed.",
    "Queue entry must remain not publish-ready before generation.",
    "Content packet generation must be explicitly approved in a later stage.",
    "Reference discovery/population must remain separate unless explicitly approved.",
    "Visual generation must remain separate unless explicitly approved.",
    "Public article mutation must remain blocked."
  ],
  prohibited_inputs: [
    "raw secrets",
    "private user data",
    "unreviewed web content",
    "unapproved scaffold import",
    "unverified reference URL insertion"
  ]
};

const futureGeneratorOutputContract = {
  future_content_packet_sections: asArray(ag06bSchema.required_sections),
  required_output_metadata: [
    "content_packet_id",
    "source_article_path",
    "article_slug",
    "category",
    "target_word_count_range",
    "reference_requirement",
    "visual_requirement",
    "quality_gate_requirement",
    "visitor_value_gate_requirement",
    "publish_readiness_gate_requirement",
    "mutation_controls",
    "audit_trace"
  ],
  output_statuses_allowed_in_later_stage: [
    "planned",
    "drafted_for_review",
    "revision_required",
    "approved_for_reference_review",
    "approved_for_visual_review",
    "approved_for_quality_review",
    "blocked"
  ],
  outputs_not_allowed_in_ag07a: [
    "content packet JSON file",
    "content packet markdown",
    "article rewrite",
    "article HTML",
    "reference insertion patch",
    "visual asset file",
    "JSONL production record"
  ]
};

const futureValidationGates = [
  {
    gate_id: "ag06z_foundation_closed",
    source_stage: "AG06Z",
    required: true,
    current_status_in_ag07a: ag06zClosure.status === "foundation_closed" ? "available" : "missing"
  },
  {
    gate_id: "long_form_standard_available",
    source_stage: "AG06E",
    required: true,
    current_status_in_ag07a: "available"
  },
  {
    gate_id: "content_packet_schema_available",
    source_stage: "AG06B",
    required: true,
    current_status_in_ag07a: "available"
  },
  {
    gate_id: "reference_credibility_standard_available",
    source_stage: "AG06J",
    required: true,
    current_status_in_ag07a: "available"
  },
  {
    gate_id: "visual_data_standard_available",
    source_stage: "AG06I",
    required: true,
    current_status_in_ag07a: "available"
  },
  {
    gate_id: "jsonl_store_governance_available",
    source_stage: "AG06K",
    required: true,
    current_status_in_ag07a: "available"
  },
  {
    gate_id: "approval_register_available",
    source_stage: "AG06L",
    required: true,
    current_status_in_ag07a: "available"
  },
  {
    gate_id: "no_public_mutation_in_ag07a",
    source_stage: "AG07A",
    required: true,
    current_status_in_ag07a: "enforced"
  },
  {
    gate_id: "no_generation_execution_in_ag07a",
    source_stage: "AG07A",
    required: true,
    current_status_in_ag07a: "enforced"
  }
];

const futureDryRunSteps = [
  {
    step_id: "load_queue_entry",
    description: "Later dry-run may load one approved queue entry without changing its approval state.",
    allowed_in_ag07a: false
  },
  {
    step_id: "assemble_input_context",
    description: "Later dry-run may assemble standards, schema and article inventory metadata.",
    allowed_in_ag07a: false
  },
  {
    step_id: "draft_content_packet_object_in_memory",
    description: "Later dry-run may draft a content packet object in memory only.",
    allowed_in_ag07a: false
  },
  {
    step_id: "validate_content_packet_object",
    description: "Later dry-run may validate a draft object against content-packet contract.",
    allowed_in_ag07a: false
  },
  {
    step_id: "write_dry_run_preview",
    description: "Later dry-run may write a dry-run preview only after explicit approval.",
    allowed_in_ag07a: false
  }
];

const batchPreview = articleQueue.slice(0, 5).map((entry, index) => ({
  preview_id: `ag07a_boundary_preview_${String(index + 1).padStart(3, "0")}`,
  source_queue_id: entry.queue_id || entry.source_queue_id || null,
  source_article_path: entry.source_article_path || null,
  category: entry.category || null,
  detected_title: entry.detected_title || null,
  upgrade_priority: entry.upgrade_priority || null,
  generation_status_in_ag07a: "not_generated",
  content_packet_created: false,
  article_mutation_allowed: false,
  reference_insertion_allowed: false,
  public_publishing_allowed: false
}));

const summary = {
  ag06z_foundation_closed: ag06zClosure.summary?.content_intelligence_foundation_closed === true,
  ag07_requires_explicit_user_approval: ag06zClosure.summary?.ag07_requires_explicit_user_approval === true,
  source_queue_count_from_ag06f: articleQueue.length,
  approval_queue_count_from_ag06l: approvalEntries.length,
  approval_entries_not_publish_ready: approvalEntries.every((entry) => entry.publish_ready === false),
  generator_boundary_defined: true,
  input_contract_defined: true,
  output_contract_defined: true,
  future_validation_gate_count: futureValidationGates.length,
  future_dry_run_step_count: futureDryRunSteps.length,
  batch_preview_count: batchPreview.length,
  generator_implementation_allowed_in_ag07a: false,
  dry_run_execution_allowed_in_ag07a: false,
  content_packet_generation_allowed: false,
  content_packet_output_write_allowed: false,
  public_article_mutation_allowed: false,
  reference_insertion_allowed: false,
  visual_generation_allowed: false,
  scaffold_import_allowed: false,
  jsonl_append_allowed: false,
  publishing_allowed: false,
  backend_auth_supabase_allowed: false,
  next_stage_id: "AG07B"
};

const dryRunPlan = {
  module_id: "AG07A",
  title: "Long-Form Content Packet Generator Design / Dry-Run Boundary Plan",
  status: "design_dry_run_boundary_only",
  governance_only: true,
  generated_from: inputs,
  summary,
  generator_boundary: generatorBoundary,
  future_generator_input_contract: futureGeneratorInputContract,
  future_generator_output_contract: futureGeneratorOutputContract,
  future_validation_gates: futureValidationGates,
  future_dry_run_steps: futureDryRunSteps,
  batch_preview: batchPreview,
  ...falseGuards
};

const schema = {
  schema_id: "drishvara/ag07a/long-form-content-packet-generator-boundary.schema.json",
  module_id: "AG07A",
  title: "Long-Form Content Packet Generator Boundary Schema",
  status: "schema_only",
  description: "Schema for future long-form content packet generator boundary. AG07A defines contracts only and does not implement or execute generation.",
  required_top_level_fields_for_future_generator: [
    "source_article_path",
    "content_packet_id",
    "target_article_standard",
    "required_sections",
    "reference_requirement",
    "visual_requirement",
    "quality_requirement",
    "visitor_value_requirement",
    "publish_readiness_requirement",
    "mutation_controls",
    "audit_trace"
  ],
  required_sections_from_ag06b: asArray(ag06bSchema.required_sections),
  word_count_standard: {
    min: ag06eStandard.summary?.word_count_min || 1500,
    max: ag06eStandard.summary?.word_count_max || 2200
  },
  reference_standard: {
    min: ag06eStandard.summary?.verified_reference_min || 2,
    max: ag06eStandard.summary?.verified_reference_max || 5
  },
  visual_standard_required: true,
  source_credibility_standard_required: true,
  publish_queue_approval_state_required: true,
  generator_implementation_allowed_in_ag07a: false,
  dry_run_execution_allowed_in_ag07a: false,
  content_packet_output_write_allowed_in_ag07a: false,
  public_mutation_allowed_in_ag07a: false,
  ...falseGuards
};

const review = {
  module_id: "AG07A",
  title: "Long-Form Content Packet Generator Design / Dry-Run Boundary",
  status: "design_dry_run_boundary_only",
  governance_only: true,
  depends_on: ["AG06Z", "AG06E", "AG06B", "AG06F", "AG06H", "AG06I", "AG06J", "AG06K", "AG06L"],
  generated_from: inputs,
  summary,
  alignment_with_ag06z: {
    ag06z_status: ag06zClosure.status,
    foundation_closed: ag06zClosure.summary?.content_intelligence_foundation_closed,
    ag07_requires_explicit_user_approval: ag06zClosure.summary?.ag07_requires_explicit_user_approval,
    recommended_next_discussion: ag06zHandoff.recommended_next_discussion
  },
  alignment_with_ag06e: {
    word_count_min: ag06eStandard.summary?.word_count_min || 1500,
    word_count_max: ag06eStandard.summary?.word_count_max || 2200,
    verified_reference_min: ag06eStandard.summary?.verified_reference_min || 2,
    verified_reference_max: ag06eStandard.summary?.verified_reference_max || 5
  },
  alignment_with_ag06i_ag06j_ag06k_ag06l: {
    visual_type_count: asArray(ag06iVisualStandard.visual_types).length,
    source_type_count: asArray(ag06jReferenceStandard.source_type_taxonomy).length,
    jsonl_store_count: asArray(ag06kManifest.stores).length,
    approval_register_count: approvalEntries.length
  },
  closure_decision: {
    decision: "ag07a_generator_design_dry_run_boundary_closed",
    proceed_to_ag07b_only_with_explicit_user_approval: true,
    generator_implementation_allowed: false,
    dry_run_execution_allowed: false,
    content_packet_generation_allowed: false,
    content_packet_output_write_allowed: false,
    public_article_mutation_allowed: false,
    reference_insertion_allowed: false,
    visual_generation_allowed: false,
    scaffold_import_allowed: false,
    jsonl_append_allowed: false,
    publishing_allowed: false,
    backend_auth_supabase_allowed: false
  },
  dry_run_plan_file: "data/content-intelligence/run-registry/ag07a-content-packet-generator-boundary-dry-run-plan.json",
  schema_file: "data/content-intelligence/schema/long-form-content-packet-generator-boundary.schema.json",
  ...falseGuards
};

const registry = {
  module_id: "AG07A",
  title: "Long-Form Content Packet Generator Design / Dry-Run Boundary",
  governance_only: true,
  design_dry_run_boundary_only: true,
  depends_on: ["AG06Z"],
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag07a-long-form-content-packet-generator-design-dry-run-boundary.json",
    dry_run_plan: "data/content-intelligence/run-registry/ag07a-content-packet-generator-boundary-dry-run-plan.json",
    schema: "data/content-intelligence/schema/long-form-content-packet-generator-boundary.schema.json",
    preview: "data/quality/ag07a-long-form-content-packet-generator-design-dry-run-boundary-preview.json",
    document: "docs/quality/AG07A_LONG_FORM_CONTENT_PACKET_GENERATOR_DESIGN_DRY_RUN_BOUNDARY.md"
  },
  summary,
  next_recommended_stage: {
    module_id: "AG07B",
    title: "Content Packet Generator Dry-Run Implementation Plan",
    allowed_scope: "only after explicit user approval",
    blocked_scope: "public mutation, publishing, backend/Auth/Supabase activation"
  },
  ...falseGuards
};

const preview = {
  module_id: "AG07A",
  preview_only: true,
  summary,
  batch_preview: batchPreview,
  no_mutation_summary: {
    generator_implementation_allowed_in_ag07a: false,
    dry_run_execution_allowed_in_ag07a: false,
    content_packet_generation_performed: false,
    content_packet_output_written: false,
    public_article_mutation_performed: false,
    reference_insertion_performed: false,
    visual_asset_generation_performed: false,
    scaffold_import_performed: false,
    jsonl_append_performed: false,
    public_publishing_performed: false,
    backend_activation_performed: false,
    supabase_enabled: false,
    auth_enabled: false
  },
  next_stage_id: "AG07B"
};

const doc = `# AG07A — Long-Form Content Packet Generator Design / Dry-Run Boundary

## Purpose

AG07A defines the controlled boundary for a future long-form content packet generator.

This stage is design and dry-run-boundary only. It records the input contract, output contract, validation gates, prohibited side effects and future dry-run steps before any actual generator implementation is attempted.

AG07A does not implement generator logic, execute a dry-run, generate content packets, write content packet outputs, rewrite public articles, insert references, generate visual assets, import scaffold outputs, append JSONL records, publish content, or activate backend/Auth/Supabase/API functionality.

## Inputs

AG07A consumes:

- AG06Z Content Intelligence Foundation Closure.
- AG06E Long-Form Article Standard.
- AG06B Content Packet Schema.
- AG06F Long-Form Production Queue.
- AG06H Batch 01 Content Packet Planning.
- AG06I Visual/Data/Infographic Requirement Standard.
- AG06J Reference and Source Credibility Standard.
- AG06K JSONL-first Store Manifest.
- AG06L Publish Queue and Approval State Register.

## Boundary Decision

AG07A is allowed to define:

- generator input contract;
- generator output contract;
- validation gates;
- future dry-run steps;
- prohibited side effects;
- alignment with AG06 foundation controls.

AG07A is not allowed to:

- implement the generator;
- execute generation;
- create content packets;
- write content-packet files;
- mutate public articles;
- insert references;
- generate visuals;
- import scaffold outputs;
- append JSONL records;
- publish content.

## Future Generator Input Contract

A later approved generator must receive:

- source article path;
- article classification and queue metadata;
- long-form article standard;
- content packet schema;
- reference credibility standard;
- visual/data/infographic standard;
- JSONL store governance;
- approval-state register status;
- mutation controls;
- audit trace.

## Future Generator Output Contract

A later approved generator may produce only reviewable content-packet objects, subject to later approval. Such packets must include:

- stable content packet ID;
- source article path;
- category and slug;
- target word count range;
- section plan;
- reference requirement;
- visual requirement;
- quality and visitor-value gate requirements;
- publish-readiness requirements;
- mutation controls;
- audit trace.

AG07A itself produces no content packet output.

## Future Dry-Run Boundary

A later stage may separately request approval for dry-run implementation.

That later dry-run must remain non-public, non-publishing and non-mutating unless explicitly expanded.

## Explicit Exclusions

AG07A does not:

- generate content packets;
- write content packet JSON, markdown or HTML;
- rewrite article text;
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

AG07A is acceptable only if:

- AG06Z closure is present and foundation_closed;
- AG07 explicit-approval requirement is carried forward;
- generator input contract is defined;
- generator output contract is defined;
- validation gates are defined;
- future dry-run steps are defined but not executed;
- batch preview entries, if present, remain not generated;
- package scripts for generate:ag07a and validate:ag07a are present;
- validate:project includes validate:ag07a;
- no generator implementation, dry-run execution, content packet generation, output write, public mutation, reference insertion, visual generation, scaffold import, JSONL append, publishing or backend/Auth/Supabase activation is performed.

## Next Stage

The next possible stage is AG07B — Content Packet Generator Dry-Run Implementation Plan.

AG07B must not start automatically. It requires explicit approval.
`;

writeJson(reviewPath, review);
writeJson(dryRunPlanPath, dryRunPlan);
writeJson(schemaPath, schema);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG07A long-form content packet generator design/dry-run boundary artifacts generated.");
