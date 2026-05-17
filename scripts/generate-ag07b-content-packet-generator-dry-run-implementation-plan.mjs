import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag07aReview: "data/content-intelligence/quality-reviews/ag07a-long-form-content-packet-generator-design-dry-run-boundary.json",
  ag07aDryRunBoundaryPlan: "data/content-intelligence/run-registry/ag07a-content-packet-generator-boundary-dry-run-plan.json",
  ag07aSchema: "data/content-intelligence/schema/long-form-content-packet-generator-boundary.schema.json",
  ag06zClosure: "data/content-intelligence/quality-reviews/content-intelligence-foundation-closure.json",
  ag06zHandoff: "data/content-intelligence/learning/content-intelligence-foundation-closure-handoff.json",
  ag06bContentPacketSchema: "data/content-intelligence/schema/content-packet.schema.json",
  ag06eStandard: "data/content-intelligence/quality-reviews/long-form-article-standard.json",
  ag06fUpgradeQueue: "data/content-intelligence/publish-queue/long-form-upgrade-queue.json",
  ag06hBatchPlanning: "data/content-intelligence/publish-queue/long-form-batch-01-content-packet-planning.json",
  ag06iVisualStandard: "data/content-intelligence/visual-registry/visual-data-infographic-requirement-standard.json",
  ag06jReferenceStandard: "data/content-intelligence/reference-registry/reference-source-credibility-standard.json",
  ag06kStoreManifest: "data/content-intelligence/run-registry/jsonl-first-content-intelligence-store-manifest.json",
  ag06lApprovalRegister: "data/content-intelligence/publish-queue/publish-queue-approval-state-register.json"
};

const reviewPath = path.join(root, "data", "content-intelligence", "quality-reviews", "ag07b-content-packet-generator-dry-run-implementation-plan.json");
const planPath = path.join(root, "data", "content-intelligence", "run-registry", "ag07b-content-packet-generator-dry-run-implementation-plan.json");
const schemaPath = path.join(root, "data", "content-intelligence", "schema", "content-packet-generator-dry-run-implementation-plan.schema.json");
const registryPath = path.join(root, "data", "quality", "ag07b-content-packet-generator-dry-run-implementation-plan.json");
const previewPath = path.join(root, "data", "quality", "ag07b-content-packet-generator-dry-run-implementation-plan-preview.json");
const docPath = path.join(root, "docs", "quality", "AG07B_CONTENT_PACKET_GENERATOR_DRY_RUN_IMPLEMENTATION_PLAN.md");

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
  content_packet_output_written: false,
  dry_run_preview_written: false,
  generator_code_created: false,
  generator_runtime_created: false
};

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) {
    throw new Error(`Missing required AG07B input ${name}: ${relativePath}`);
  }
}

const ag07aReview = readJson(inputs.ag07aReview);
const ag07aPlan = readJson(inputs.ag07aDryRunBoundaryPlan);
const ag07aSchema = readJson(inputs.ag07aSchema);
const ag06zClosure = readJson(inputs.ag06zClosure);
const ag06zHandoff = readJson(inputs.ag06zHandoff);
const ag06bSchema = readJson(inputs.ag06bContentPacketSchema);
const ag06eStandard = readJson(inputs.ag06eStandard);
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

const planningEntries = asArray(
  ag06hPlanning.planning_queue ||
  ag06hPlanning.content_packet_planning_queue ||
  ag06hPlanning.batch_01_planning_entries ||
  ag06hPlanning.entries ||
  ag06hPlanning.items
);

const approvalEntries = asArray(ag06lApprovalRegister.approval_queue_entries);
const ag07aBatchPreview = asArray(ag07aPlan.batch_preview);

const plannedComponents = [
  {
    component_id: "readonly_input_loader",
    purpose: "Later dry-run implementation may load one queue/planning item and related standards in read-only mode.",
    implementation_status_in_ag07b: "planned_not_created",
    file_creation_allowed_in_ag07b: false,
    execution_allowed_in_ag07b: false
  },
  {
    component_id: "source_context_assembler",
    purpose: "Later dry-run implementation may assemble source article metadata, classification, standards and gate requirements.",
    implementation_status_in_ag07b: "planned_not_created",
    file_creation_allowed_in_ag07b: false,
    execution_allowed_in_ag07b: false
  },
  {
    component_id: "content_packet_object_builder",
    purpose: "Later dry-run implementation may create a non-public in-memory packet object from schema requirements.",
    implementation_status_in_ag07b: "planned_not_created",
    file_creation_allowed_in_ag07b: false,
    execution_allowed_in_ag07b: false
  },
  {
    component_id: "dry_run_validator",
    purpose: "Later dry-run implementation may validate packet-object shape and guardrails without writing production outputs.",
    implementation_status_in_ag07b: "planned_not_created",
    file_creation_allowed_in_ag07b: false,
    execution_allowed_in_ag07b: false
  },
  {
    component_id: "dry_run_preview_writer",
    purpose: "Later approved stage may write preview-only dry-run output, never public article HTML.",
    implementation_status_in_ag07b: "planned_not_created",
    file_creation_allowed_in_ag07b: false,
    execution_allowed_in_ag07b: false
  },
  {
    component_id: "audit_trace_builder",
    purpose: "Later implementation may add audit trace for inputs, blocked actions, validator status and review route.",
    implementation_status_in_ag07b: "planned_not_created",
    file_creation_allowed_in_ag07b: false,
    execution_allowed_in_ag07b: false
  }
];

const futureImplementationFiles = [
  {
    future_file_path: "scripts/generate-ag07c-content-packet-generator-dry-run-preview.mjs",
    future_purpose: "Potential later dry-run preview generator script.",
    allowed_in_ag07b: false,
    requires_explicit_later_approval: true
  },
  {
    future_file_path: "scripts/validate-ag07c-content-packet-generator-dry-run-preview.mjs",
    future_purpose: "Potential later validator for dry-run preview outputs.",
    allowed_in_ag07b: false,
    requires_explicit_later_approval: true
  },
  {
    future_file_path: "data/content-intelligence/content-packets/ag07c-dry-run-preview.json",
    future_purpose: "Potential later preview-only dry-run content packet output.",
    allowed_in_ag07b: false,
    requires_explicit_later_approval: true
  },
  {
    future_file_path: "data/quality/ag07c-content-packet-generator-dry-run-preview.json",
    future_purpose: "Potential later quality registry for dry-run preview.",
    allowed_in_ag07b: false,
    requires_explicit_later_approval: true
  }
];

const dryRunAlgorithmPlan = [
  {
    step_id: "select_single_planning_entry",
    description: "Select one AG06H planning entry or AG07A preview candidate for later dry-run.",
    execution_allowed_in_ag07b: false
  },
  {
    step_id: "load_source_article_metadata_only",
    description: "Load only metadata/path/classification. Do not rewrite or parse article text for final output.",
    execution_allowed_in_ag07b: false
  },
  {
    step_id: "attach_ag06e_standard",
    description: "Attach word count, reference, visual, quality and visitor-value requirements.",
    execution_allowed_in_ag07b: false
  },
  {
    step_id: "attach_ag06i_ag06j_requirements",
    description: "Attach visual/data and reference/source credibility requirements without populating URLs or generating visuals.",
    execution_allowed_in_ag07b: false
  },
  {
    step_id: "build_in_memory_packet_skeleton",
    description: "Build a skeleton packet object with section placeholders only in a later stage.",
    execution_allowed_in_ag07b: false
  },
  {
    step_id: "validate_packet_skeleton",
    description: "Validate required fields and mutation guards in a later stage.",
    execution_allowed_in_ag07b: false
  },
  {
    step_id: "write_preview_only_if_later_approved",
    description: "Write preview-only dry-run output only in a later explicitly approved stage.",
    execution_allowed_in_ag07b: false
  }
];

const implementationGuardrails = [
  "No generator code is created in AG07B.",
  "No dry-run execution is performed in AG07B.",
  "No content packet output is written in AG07B.",
  "No public article HTML is read for mutation or changed.",
  "No reference URL is fetched, populated, inserted or changed.",
  "No visual asset or infographic is generated.",
  "No scaffold file is copied, moved, deleted or imported.",
  "No JSONL production record is created or appended.",
  "No approval state is changed.",
  "No publish-ready lock is set.",
  "No publishing is performed.",
  "No backend/Auth/Supabase/API route is created or activated."
];

const plannedValidationMatrix = [
  {
    validation_id: "ag06z_foundation_closed",
    source: "AG06Z",
    required_for_later_ag07c: true,
    status_in_ag07b: ag06zClosure.status === "foundation_closed" ? "available" : "missing"
  },
  {
    validation_id: "ag07a_boundary_closed",
    source: "AG07A",
    required_for_later_ag07c: true,
    status_in_ag07b: ag07aReview.status === "design_dry_run_boundary_only" ? "available" : "missing"
  },
  {
    validation_id: "generator_execution_blocked",
    source: "AG07B",
    required_for_later_ag07c: true,
    status_in_ag07b: "enforced"
  },
  {
    validation_id: "content_packet_output_write_blocked",
    source: "AG07B",
    required_for_later_ag07c: true,
    status_in_ag07b: "enforced"
  },
  {
    validation_id: "public_mutation_blocked",
    source: "AG07B",
    required_for_later_ag07c: true,
    status_in_ag07b: "enforced"
  },
  {
    validation_id: "reference_insertion_blocked",
    source: "AG07B",
    required_for_later_ag07c: true,
    status_in_ag07b: "enforced"
  },
  {
    validation_id: "jsonl_append_blocked",
    source: "AG07B",
    required_for_later_ag07c: true,
    status_in_ag07b: "enforced"
  },
  {
    validation_id: "publishing_blocked",
    source: "AG07B",
    required_for_later_ag07c: true,
    status_in_ag07b: "enforced"
  }
];

const candidatePreview = ag07aBatchPreview.slice(0, 5).map((entry, index) => ({
  preview_id: `ag07b_plan_candidate_${String(index + 1).padStart(3, "0")}`,
  source_article_path: entry.source_article_path || null,
  source_queue_id: entry.source_queue_id || null,
  category: entry.category || null,
  detected_title: entry.detected_title || null,
  planned_for_future_dry_run: true,
  selected_for_execution_in_ag07b: false,
  content_packet_generation_performed: false,
  content_packet_output_written: false,
  public_article_mutation_performed: false,
  reference_insertion_performed: false,
  jsonl_append_performed: false,
  publishing_performed: false
}));

const summary = {
  ag06z_foundation_closed: ag06zClosure.summary?.content_intelligence_foundation_closed === true,
  ag07a_boundary_closed: ag07aReview.status === "design_dry_run_boundary_only",
  ag07_requires_explicit_user_approval: ag06zClosure.summary?.ag07_requires_explicit_user_approval === true,
  source_queue_count_from_ag06f: articleQueue.length,
  planning_entry_count_from_ag06h: planningEntries.length,
  approval_queue_count_from_ag06l: approvalEntries.length,
  approval_entries_not_publish_ready: approvalEntries.every((entry) => entry.publish_ready === false),
  planned_component_count: plannedComponents.length,
  future_implementation_file_count: futureImplementationFiles.length,
  dry_run_algorithm_step_count: dryRunAlgorithmPlan.length,
  planned_validation_count: plannedValidationMatrix.length,
  candidate_preview_count: candidatePreview.length,
  implementation_plan_defined: true,
  generator_code_creation_allowed_in_ag07b: false,
  generator_implementation_allowed_in_ag07b: false,
  dry_run_execution_allowed_in_ag07b: false,
  content_packet_generation_allowed: false,
  content_packet_output_write_allowed: false,
  public_article_mutation_allowed: false,
  reference_insertion_allowed: false,
  visual_generation_allowed: false,
  scaffold_import_allowed: false,
  jsonl_append_allowed: false,
  publishing_allowed: false,
  backend_auth_supabase_allowed: false,
  next_stage_id: "AG07C"
};

const implementationPlan = {
  module_id: "AG07B",
  title: "Content Packet Generator Dry-Run Implementation Plan",
  status: "implementation_plan_only",
  governance_only: true,
  generated_from: inputs,
  summary,
  planned_components: plannedComponents,
  future_implementation_files: futureImplementationFiles,
  dry_run_algorithm_plan: dryRunAlgorithmPlan,
  implementation_guardrails: implementationGuardrails,
  planned_validation_matrix: plannedValidationMatrix,
  candidate_preview: candidatePreview,
  future_execution_boundary: {
    next_possible_stage: "AG07C",
    ag07c_requires_explicit_user_approval: true,
    ag07c_recommended_scope: "preview-only dry-run script creation and execution for one candidate, if explicitly approved",
    ag07c_default_blocked_actions: [
      "public article mutation",
      "reference insertion",
      "visual generation",
      "scaffold import",
      "JSONL production append",
      "publishing",
      "backend/Auth/Supabase activation"
    ]
  },
  ...falseGuards
};

const schema = {
  schema_id: "drishvara/ag07b/content-packet-generator-dry-run-implementation-plan.schema.json",
  module_id: "AG07B",
  title: "Content Packet Generator Dry-Run Implementation Plan Schema",
  status: "schema_only",
  description: "Schema for a future content-packet generator dry-run implementation plan. AG07B does not create generator code or execute generation.",
  required_plan_fields: [
    "planned_components",
    "future_implementation_files",
    "dry_run_algorithm_plan",
    "implementation_guardrails",
    "planned_validation_matrix",
    "candidate_preview",
    "future_execution_boundary",
    "mutation_controls"
  ],
  planned_component_required_fields: [
    "component_id",
    "purpose",
    "implementation_status_in_ag07b",
    "file_creation_allowed_in_ag07b",
    "execution_allowed_in_ag07b"
  ],
  future_file_required_fields: [
    "future_file_path",
    "future_purpose",
    "allowed_in_ag07b",
    "requires_explicit_later_approval"
  ],
  required_content_packet_sections_from_ag06b: asArray(ag06bSchema.required_sections),
  long_form_standard_from_ag06e: {
    word_count_min: ag06eStandard.summary?.word_count_min || 1500,
    word_count_max: ag06eStandard.summary?.word_count_max || 2200,
    verified_reference_min: ag06eStandard.summary?.verified_reference_min || 2,
    verified_reference_max: ag06eStandard.summary?.verified_reference_max || 5
  },
  ag07b_allowed_to_create_generator_code: false,
  ag07b_allowed_to_execute_dry_run: false,
  ag07b_allowed_to_write_content_packet_output: false,
  ag07b_allowed_to_mutate_public_article: false,
  ...falseGuards
};

const review = {
  module_id: "AG07B",
  title: "Content Packet Generator Dry-Run Implementation Plan Review",
  status: "implementation_plan_only",
  governance_only: true,
  depends_on: ["AG07A", "AG06Z", "AG06B", "AG06E", "AG06F", "AG06H", "AG06I", "AG06J", "AG06K", "AG06L"],
  generated_from: inputs,
  summary,
  alignment_with_ag07a: {
    ag07a_status: ag07aReview.status,
    ag07a_decision: ag07aReview.closure_decision?.decision,
    ag07b_requires_explicit_approval: ag07aReview.closure_decision?.proceed_to_ag07b_only_with_explicit_user_approval,
    generator_implementation_allowed_by_ag07a: ag07aReview.closure_decision?.generator_implementation_allowed,
    dry_run_execution_allowed_by_ag07a: ag07aReview.closure_decision?.dry_run_execution_allowed,
    content_packet_output_write_allowed_by_ag07a: ag07aReview.closure_decision?.content_packet_output_write_allowed
  },
  alignment_with_ag06z: {
    ag06z_status: ag06zClosure.status,
    foundation_closed: ag06zClosure.summary?.content_intelligence_foundation_closed,
    ag07_requires_explicit_user_approval: ag06zClosure.summary?.ag07_requires_explicit_user_approval,
    ready_for_ag07_execution_without_approval: ag06zHandoff.ready_for_ag07_execution_without_approval
  },
  alignment_with_ag06_foundation: {
    content_packet_required_section_count: asArray(ag06bSchema.required_sections).length,
    visual_type_count: asArray(ag06iVisualStandard.visual_types).length,
    source_type_count: asArray(ag06jReferenceStandard.source_type_taxonomy).length,
    jsonl_store_count: asArray(ag06kManifest.stores).length,
    approval_register_count: approvalEntries.length
  },
  closure_decision: {
    decision: "ag07b_content_packet_generator_dry_run_implementation_plan_closed",
    proceed_to_ag07c_only_with_explicit_user_approval: true,
    generator_code_creation_allowed: false,
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
  plan_file: "data/content-intelligence/run-registry/ag07b-content-packet-generator-dry-run-implementation-plan.json",
  schema_file: "data/content-intelligence/schema/content-packet-generator-dry-run-implementation-plan.schema.json",
  ...falseGuards
};

const registry = {
  module_id: "AG07B",
  title: "Content Packet Generator Dry-Run Implementation Plan",
  governance_only: true,
  implementation_plan_only: true,
  depends_on: ["AG07A"],
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag07b-content-packet-generator-dry-run-implementation-plan.json",
    implementation_plan: "data/content-intelligence/run-registry/ag07b-content-packet-generator-dry-run-implementation-plan.json",
    schema: "data/content-intelligence/schema/content-packet-generator-dry-run-implementation-plan.schema.json",
    preview: "data/quality/ag07b-content-packet-generator-dry-run-implementation-plan-preview.json",
    document: "docs/quality/AG07B_CONTENT_PACKET_GENERATOR_DRY_RUN_IMPLEMENTATION_PLAN.md"
  },
  summary,
  next_recommended_stage: {
    module_id: "AG07C",
    title: "Content Packet Generator Preview-Only Dry Run",
    allowed_scope: "only after explicit user approval",
    blocked_scope: "public mutation, reference insertion, visual generation, JSONL production append, publishing, backend/Auth/Supabase activation"
  },
  ...falseGuards
};

const preview = {
  module_id: "AG07B",
  preview_only: true,
  summary,
  planned_components_preview: plannedComponents.map((component) => ({
    component_id: component.component_id,
    implementation_status_in_ag07b: component.implementation_status_in_ag07b,
    execution_allowed_in_ag07b: component.execution_allowed_in_ag07b
  })),
  future_implementation_files_preview: futureImplementationFiles,
  candidate_preview: candidatePreview,
  no_mutation_summary: {
    generator_code_created: false,
    generator_runtime_created: false,
    ag07_content_packet_generator_implemented: false,
    ag07_dry_run_execution_performed: false,
    content_packet_generation_performed: false,
    content_packet_output_written: false,
    dry_run_preview_written: false,
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
  next_stage_id: "AG07C"
};

const doc = `# AG07B — Content Packet Generator Dry-Run Implementation Plan

## Purpose

AG07B defines the implementation plan for a future content packet generator dry-run.

This stage is planning only. It does not create generator code, execute a dry-run, generate content packets, write preview outputs, rewrite public articles, insert references, generate visuals, import scaffold outputs, append JSONL records, publish content, or activate backend/Auth/Supabase/API functionality.

## Inputs

AG07B consumes:

- AG07A Long-Form Content Packet Generator Design / Dry-Run Boundary.
- AG06Z Content Intelligence Foundation Closure.
- AG06B Content Packet Schema.
- AG06E Long-Form Article Standard.
- AG06F Long-Form Production Queue.
- AG06H Batch 01 Content Packet Planning.
- AG06I Visual/Data/Infographic Requirement Standard.
- AG06J Reference and Source Credibility Standard.
- AG06K JSONL-first Store Manifest.
- AG06L Publish Queue and Approval State Register.

## Planned Components

AG07B defines future components only:

- read-only input loader;
- source context assembler;
- content packet object builder;
- dry-run validator;
- dry-run preview writer;
- audit trace builder.

All components remain planned and not created in AG07B.

## Future Dry-Run Algorithm

AG07B records a later-stage algorithm plan:

- select one planning entry;
- load source article metadata only;
- attach AG06E long-form standard;
- attach AG06I and AG06J requirements;
- build an in-memory packet skeleton;
- validate packet skeleton;
- write preview only if a later stage explicitly approves it.

No step is executed in AG07B.

## Future Implementation Files

AG07B records possible future file paths for AG07C. These files are not created in AG07B and require explicit approval in a later stage.

## Explicit Exclusions

AG07B does not:

- create generator code;
- create generator runtime;
- execute a dry-run;
- generate content packets;
- write content packet JSON, markdown or HTML;
- write dry-run preview outputs;
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

AG07B is acceptable only if:

- AG07A is present and closed as design/dry-run-boundary only;
- AG06Z foundation closure is present;
- planned components are defined but not created;
- future implementation files are listed but not created;
- future dry-run algorithm steps are defined but not executed;
- candidate preview entries remain not selected for execution;
- package scripts for generate:ag07b and validate:ag07b are present;
- validate:project includes validate:ag07b;
- no generator code creation, generator implementation, dry-run execution, content packet generation, output write, public mutation, reference insertion, visual generation, scaffold import, JSONL append, publishing or backend/Auth/Supabase activation is performed.

## Next Stage

The next possible stage is AG07C — Content Packet Generator Preview-Only Dry Run.

AG07C must not start automatically. It requires explicit approval.
`;

writeJson(reviewPath, review);
writeJson(planPath, implementationPlan);
writeJson(schemaPath, schema);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG07B content packet generator dry-run implementation plan artifacts generated.");
