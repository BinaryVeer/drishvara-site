import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag06hR1Review: "data/content-intelligence/quality-reviews/content-intelligence-foundation-alignment-review.json",
  ag06iClosure: "data/content-intelligence/quality-reviews/visual-data-infographic-requirement-schema-closure.json",
  ag06jClosure: "data/content-intelligence/quality-reviews/reference-source-credibility-schema-closure.json",
  ag06jReferenceStandard: "data/content-intelligence/reference-registry/reference-source-credibility-standard.json",
  ag06bContentPacketSchema: "data/content-intelligence/schema/content-packet.schema.json",
  ag06fUpgradeQueue: "data/content-intelligence/publish-queue/long-form-upgrade-queue.json",
  ag06hBatchPlanning: "data/content-intelligence/publish-queue/long-form-batch-01-content-packet-planning.json"
};

const registryPath = path.join(root, "data", "quality", "ag06k-jsonl-first-content-intelligence-store-governance.json");
const previewPath = path.join(root, "data", "quality", "ag06k-jsonl-first-content-intelligence-store-governance-preview.json");
const governancePath = path.join(root, "data", "content-intelligence", "quality-reviews", "jsonl-first-content-intelligence-store-governance.json");
const standardPath = path.join(root, "data", "content-intelligence", "learning", "jsonl-first-content-intelligence-store-standard.json");
const schemaPath = path.join(root, "data", "content-intelligence", "schema", "jsonl-first-content-intelligence-store.schema.json");
const manifestPath = path.join(root, "data", "content-intelligence", "run-registry", "jsonl-first-content-intelligence-store-manifest.json");
const docPath = path.join(root, "docs", "quality", "AG06K_JSONL_FIRST_CONTENT_INTELLIGENCE_STORE_GOVERNANCE.md");

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
  database_write_performed: false
};

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) {
    throw new Error(`Missing required AG06K input ${name}: ${relativePath}`);
  }
}

const ag06hR1 = readJson(inputs.ag06hR1Review);
const ag06i = readJson(inputs.ag06iClosure);
const ag06j = readJson(inputs.ag06jClosure);
const ag06jStandard = readJson(inputs.ag06jReferenceStandard);
const ag06bContentPacketSchema = readJson(inputs.ag06bContentPacketSchema);
const ag06fQueue = readJson(inputs.ag06fUpgradeQueue);
const ag06hPlanning = readJson(inputs.ag06hBatchPlanning);

const recordFamilies = [
  {
    family_id: "content_packet_record",
    future_file_path: "data/content-intelligence/content-packets/content-packets.jsonl",
    purpose: "Future durable content packet records for long-form article production.",
    owner_folder: "content-packets",
    record_status_in_ag06k: "schema_only_not_created",
    required_identity_fields: ["record_id", "content_packet_id", "article_slug", "category", "title", "version", "created_at", "updated_at"],
    required_governance_fields: ["stage_id", "approval_state", "source_trace", "mutation_controls", "audit_trace"]
  },
  {
    family_id: "reference_candidate_record",
    future_file_path: "data/content-intelligence/reference-registry/reference-candidates.jsonl",
    purpose: "Future candidate reference pool records before approval.",
    owner_folder: "reference-registry",
    record_status_in_ag06k: "schema_only_not_created",
    required_identity_fields: ["record_id", "article_or_packet_id", "reference_id", "candidate_url_hash", "source_type"],
    required_governance_fields: ["credibility_tier", "link_health_status", "approval_status", "reviewer_note", "audit_trace"]
  },
  {
    family_id: "approved_reference_record",
    future_file_path: "data/content-intelligence/reference-registry/approved-references.jsonl",
    purpose: "Future approved reference records after source credibility review.",
    owner_folder: "reference-registry",
    record_status_in_ag06k: "schema_only_not_created",
    required_identity_fields: ["record_id", "article_or_packet_id", "reference_id", "canonical_url_hash"],
    required_governance_fields: ["approval_status", "approved_by_stage", "claim_or_section_supported", "source_quality_score", "audit_trace"]
  },
  {
    family_id: "rejected_reference_record",
    future_file_path: "data/content-intelligence/reference-registry/rejected-references.jsonl",
    purpose: "Future rejected reference trail with rejection reasons.",
    owner_folder: "reference-registry",
    record_status_in_ag06k: "schema_only_not_created",
    required_identity_fields: ["record_id", "article_or_packet_id", "reference_id"],
    required_governance_fields: ["rejection_reason", "replacement_required", "reviewer_note", "audit_trace"]
  },
  {
    family_id: "visual_plan_record",
    future_file_path: "data/content-intelligence/visual-registry/visual-plans.jsonl",
    purpose: "Future visual/data/infographic planning records.",
    owner_folder: "visual-registry",
    record_status_in_ag06k: "schema_only_not_created",
    required_identity_fields: ["record_id", "article_or_packet_id", "visual_id", "visual_type"],
    required_governance_fields: ["rights_or_credit_status", "generation_status", "review_status", "visual_quality_score", "audit_trace"]
  },
  {
    family_id: "quality_review_record",
    future_file_path: "data/content-intelligence/quality-reviews/quality-reviews.jsonl",
    purpose: "Future quality, visitor-value and publish-readiness review records.",
    owner_folder: "quality-reviews",
    record_status_in_ag06k: "schema_only_not_created",
    required_identity_fields: ["record_id", "article_or_packet_id", "review_id", "review_stage"],
    required_governance_fields: ["quality_score", "visitor_value_score", "publish_readiness_gates", "review_status", "audit_trace"]
  },
  {
    family_id: "publish_queue_state_record",
    future_file_path: "data/content-intelligence/publish-queue/publish-queue-states.jsonl",
    purpose: "Future article approval and publish queue state transitions.",
    owner_folder: "publish-queue",
    record_status_in_ag06k: "schema_only_not_created",
    required_identity_fields: ["record_id", "article_or_packet_id", "queue_id", "state"],
    required_governance_fields: ["allowed_next_states", "blocked_actions", "approval_required", "audit_trace"]
  },
  {
    family_id: "learning_snapshot_record",
    future_file_path: "data/content-intelligence/learning/learning-snapshots.jsonl",
    purpose: "Future learning snapshots from article production, review and correction cycles.",
    owner_folder: "learning",
    record_status_in_ag06k: "schema_only_not_created",
    required_identity_fields: ["record_id", "learning_id", "source_stage", "related_article_or_packet_id"],
    required_governance_fields: ["learning_type", "safe_to_reuse", "review_status", "audit_trace"]
  },
  {
    family_id: "run_registry_record",
    future_file_path: "data/content-intelligence/run-registry/run-registry.jsonl",
    purpose: "Future generation/review run records and reproducibility metadata.",
    owner_folder: "run-registry",
    record_status_in_ag06k: "schema_only_not_created",
    required_identity_fields: ["record_id", "run_id", "stage_id", "timestamp"],
    required_governance_fields: ["input_artifacts", "output_artifacts", "mutation_flags", "validation_status", "audit_trace"]
  },
  {
    family_id: "audit_event_record",
    future_file_path: "data/content-intelligence/run-registry/audit-events.jsonl",
    purpose: "Future append-only audit event records for governance-critical decisions.",
    owner_folder: "run-registry",
    record_status_in_ag06k: "schema_only_not_created",
    required_identity_fields: ["record_id", "event_id", "stage_id", "timestamp"],
    required_governance_fields: ["event_type", "decision", "actor_or_process", "affected_artifacts", "audit_trace"]
  }
];

const commonLineContract = {
  encoding: "utf-8",
  line_format: "one_valid_json_object_per_line",
  blank_lines_allowed: false,
  trailing_commas_allowed: false,
  append_only_default: true,
  stable_record_id_required: true,
  schema_version_required: true,
  stage_id_required: true,
  created_at_required: true,
  updated_at_required: true,
  audit_trace_required: true,
  mutation_controls_required: true,
  source_trace_required: true,
  public_ready_flag_default: false,
  publish_ready_flag_default: false
};

const stateModel = [
  "planned_not_created",
  "draft_record_allowed_in_future_stage",
  "under_review",
  "revision_required",
  "approved_for_content_packet",
  "approved_for_publish_queue",
  "publish_ready",
  "published_in_later_stage",
  "rejected",
  "archived_by_explicit_approval_only"
];

const guardrailRules = [
  "AG06K defines future JSONL store governance but does not create production JSONL records.",
  "AG06K does not append to JSONL files.",
  "AG06K does not import scaffold outputs.",
  "AG06K does not write to any database.",
  "AG06K does not activate Supabase or Auth.",
  "AG06K does not mutate public articles.",
  "AG06K does not insert references.",
  "AG06K does not generate content packets.",
  "AG06K does not publish content."
];

const standard = {
  module_id: "AG06K",
  title: "JSONL-first Content Intelligence Store Standard",
  standard_type: "future_jsonl_first_content_intelligence_store_standard",
  status: "storage_governance_schema_only",
  governance_only: true,
  depends_on: ["AG06H-R1", "AG06I", "AG06J", "AG06B"],
  generated_from: inputs,
  purpose: "Define JSONL-first storage governance for future content packets, source candidates, visual plans, quality reviews, publish queue state, learning snapshots, run registry and audit events without generating production JSONL content.",
  summary: {
    record_family_count: recordFamilies.length,
    common_line_contract_defined: true,
    append_only_default: true,
    schema_version_required: true,
    audit_trace_required: true,
    mutation_controls_required: true,
    source_trace_required: true,
    state_model_count: stateModel.length,
    jsonl_file_creation_allowed_in_ag06k: false,
    jsonl_append_allowed_in_ag06k: false,
    jsonl_import_allowed_in_ag06k: false,
    database_write_allowed_in_ag06k: false,
    public_article_mutation_allowed: false,
    content_packet_generation_allowed: false,
    public_publishing_allowed: false,
    next_stage_id: "AG06L"
  },
  common_line_contract: commonLineContract,
  record_families: recordFamilies,
  state_model: stateModel,
  required_store_manifest_fields: [
    "store_id",
    "store_name",
    "owner_folder",
    "future_file_path",
    "record_family",
    "schema_id",
    "schema_version",
    "append_policy",
    "review_policy",
    "mutation_policy",
    "retention_policy",
    "activation_status"
  ],
  future_file_naming_rules: {
    extension: ".jsonl",
    naming_style: "lowercase-kebab-case",
    one_record_family_per_file: true,
    no_mixed_record_families: true,
    no_public_article_html_inside_jsonl: true,
    no_raw_secret_or_private_identity_storage: true
  },
  data_safety_rules: {
    pii_default_allowed: false,
    secrets_allowed: false,
    raw_user_profile_storage_allowed: false,
    public_html_mutation_through_jsonl_allowed: false,
    database_sync_allowed_in_ag06k: false,
    external_publish_allowed_in_ag06k: false
  },
  validation_rules_for_future_jsonl: [
    "Each line must parse as one JSON object.",
    "Each record must include record_id, schema_id, schema_version, stage_id and audit_trace.",
    "Each record must include mutation_controls.",
    "Each record family must match the declared future file path.",
    "No record may mark public_ready=true unless a later approved stage permits it.",
    "No record may mark publish_ready=true unless the publish-readiness register approves it.",
    "No record may contain secrets, tokens or raw credentials.",
    "No record may be imported from scaffold output without explicit approval."
  ],
  guardrail_rules: guardrailRules,
  next_stage: {
    module_id: "AG06L",
    title: "Publish Queue and Approval State Register",
    allowed_scope: "queue/approval schema and governance only",
    blocked_scope: "publishing, article mutation, reference insertion, backend activation"
  },
  ...falseGuards
};

const manifest = {
  module_id: "AG06K",
  title: "JSONL-first Content Intelligence Store Manifest",
  status: "manifest_schema_only",
  governance_only: true,
  generated_from: inputs,
  summary: standard.summary,
  stores: recordFamilies.map((family) => ({
    store_id: `store_${family.family_id}`,
    store_name: family.family_id,
    owner_folder: family.owner_folder,
    future_file_path: family.future_file_path,
    record_family: family.family_id,
    schema_id: `drishvara/ag06k/${family.family_id}.jsonl-record`,
    schema_version: "0.1.0-planning",
    append_policy: "append_only_default_future_stage",
    review_policy: "manual_or_validator_review_required_before_publish_readiness",
    mutation_policy: "no_mutation_in_ag06k",
    retention_policy: "retain_for_audit_until_explicit_retention_policy_exists",
    activation_status: "not_created_not_active_in_ag06k",
    jsonl_file_created: false,
    jsonl_append_performed: false
  })),
  ...falseGuards
};

const schema = {
  schema_id: "drishvara/ag06k/jsonl-first-content-intelligence-store.schema.json",
  module_id: "AG06K",
  title: "JSONL-first Content Intelligence Store Governance Schema",
  status: "schema_only",
  description: "Schema for future JSONL-first content-intelligence stores. This schema does not create JSONL files, append records, import scaffold outputs, mutate public articles, activate database storage or publish content.",
  required_top_level_fields: [
    "store_id",
    "record_family",
    "future_file_path",
    "common_line_contract",
    "record_required_fields",
    "state_model",
    "mutation_controls",
    "audit_trace"
  ],
  common_line_contract: commonLineContract,
  record_family_ids: recordFamilies.map((family) => family.family_id),
  record_family_contracts: recordFamilies.map((family) => ({
    family_id: family.family_id,
    future_file_path: family.future_file_path,
    required_identity_fields: family.required_identity_fields,
    required_governance_fields: family.required_governance_fields
  })),
  allowed_states: stateModel,
  future_jsonl_creation_allowed_in_ag06k: false,
  future_jsonl_append_allowed_in_ag06k: false,
  scaffold_import_allowed_in_ag06k: false,
  database_write_allowed_in_ag06k: false,
  public_mutation_allowed_in_ag06k: false,
  ...falseGuards
};

const governance = {
  module_id: "AG06K",
  title: "JSONL-first Content Intelligence Store Governance",
  status: "storage_governance_schema_only",
  governance_only: true,
  depends_on: ["AG06H-R1", "AG06I", "AG06J", "AG06B"],
  generated_from: inputs,
  summary: standard.summary,
  alignment_with_ag06h_r1: {
    corrected_remaining_path_contains_ag06k: Array.isArray(ag06hR1.corrected_remaining_path)
      ? ag06hR1.corrected_remaining_path.some((x) => x.next_stage === "AG06K")
      : false,
    ag07_blocked_until_ag06z: ag06hR1.summary.ag07_blocked_until_ag06z
  },
  alignment_with_ag06i: {
    visual_standard_closed: ag06i.closure_decision?.decision === "visual_data_infographic_requirement_schema_closed_for_foundation",
    visual_asset_generation_allowed: ag06i.closure_decision?.visual_asset_generation_allowed
  },
  alignment_with_ag06j: {
    reference_standard_closed: ag06j.closure_decision?.decision === "reference_source_credibility_schema_closed_for_foundation",
    web_fetching_by_script_allowed: ag06j.closure_decision?.web_fetching_by_script_allowed,
    reference_insertion_allowed: ag06j.closure_decision?.reference_insertion_allowed,
    source_type_count: ag06jStandard.source_type_taxonomy?.length
  },
  alignment_with_ag06b: {
    content_packet_schema_id: ag06bContentPacketSchema.schema_id,
    content_packet_required_sections_present: Array.isArray(ag06bContentPacketSchema.required_sections),
    content_packet_required_section_count: Array.isArray(ag06bContentPacketSchema.required_sections) ? ag06bContentPacketSchema.required_sections.length : 0
  },
  current_queue_evidence: {
    ag06f_queue_entry_count: ag06fQueue.summary?.queue_entry_count,
    ag06h_batch_planning_entry_count: ag06hPlanning.summary?.planning_entry_count
  },
  standard_file: "data/content-intelligence/learning/jsonl-first-content-intelligence-store-standard.json",
  schema_file: "data/content-intelligence/schema/jsonl-first-content-intelligence-store.schema.json",
  manifest_file: "data/content-intelligence/run-registry/jsonl-first-content-intelligence-store-manifest.json",
  closure_decision: {
    decision: "jsonl_first_content_intelligence_store_governance_closed_for_foundation",
    proceed_to_ag06l_publish_queue_approval_state_register: true,
    jsonl_file_creation_allowed: false,
    jsonl_append_allowed: false,
    jsonl_import_allowed: false,
    scaffold_import_allowed: false,
    database_write_allowed: false,
    public_article_mutation_allowed: false,
    content_packet_generation_allowed: false,
    publication_allowed: false
  },
  ...falseGuards
};

const registry = {
  module_id: "AG06K",
  title: "JSONL-first Content Intelligence Store Governance",
  governance_only: true,
  storage_governance_schema_only: true,
  depends_on: ["AG06H-R1", "AG06I", "AG06J", "AG06B"],
  generated_artifacts: {
    governance_review: "data/content-intelligence/quality-reviews/jsonl-first-content-intelligence-store-governance.json",
    store_standard: "data/content-intelligence/learning/jsonl-first-content-intelligence-store-standard.json",
    schema: "data/content-intelligence/schema/jsonl-first-content-intelligence-store.schema.json",
    manifest: "data/content-intelligence/run-registry/jsonl-first-content-intelligence-store-manifest.json",
    preview: "data/quality/ag06k-jsonl-first-content-intelligence-store-governance-preview.json",
    document: "docs/quality/AG06K_JSONL_FIRST_CONTENT_INTELLIGENCE_STORE_GOVERNANCE.md"
  },
  summary: standard.summary,
  next_recommended_stage: standard.next_stage,
  ...falseGuards
};

const preview = {
  module_id: "AG06K",
  preview_only: true,
  summary: standard.summary,
  record_families_preview: recordFamilies.map((family) => ({
    family_id: family.family_id,
    future_file_path: family.future_file_path,
    record_status_in_ag06k: family.record_status_in_ag06k
  })),
  state_model_preview: stateModel,
  no_mutation_summary: {
    jsonl_file_created: false,
    jsonl_append_performed: false,
    jsonl_import_performed: false,
    scaffold_import_performed: false,
    database_write_performed: false,
    public_article_mutation_performed: false,
    reference_insertion_performed: false,
    content_packet_generation_performed: false,
    public_publishing_performed: false,
    backend_activation_performed: false,
    supabase_enabled: false,
    auth_enabled: false
  },
  next_stage_id: "AG06L"
};

const doc = `# AG06K — JSONL-first Content Intelligence Store Governance

## Purpose

AG06K closes the JSONL-first content-intelligence store governance layer for future Drishvara long-form production.

This stage defines future JSONL record families, line contracts, storage manifest rules, state model, validation rules and safety controls.

AG06K does not create production JSONL files, append JSONL records, import scaffold outputs, mutate public articles, insert references, generate content packets, write to a database, publish content, or activate backend/Auth/Supabase/API functionality.

## Inputs

AG06K consumes:

- AG06H-R1 Content Intelligence Foundation Alignment Review.
- AG06I Visual/Data/Infographic Requirement Schema Closure.
- AG06J Reference and Source Credibility Schema Closure.
- AG06B Content Packet Schema.
- AG06F Long-Form Production Queue.
- AG06H Batch 01 Content Packet Upgrade Planning.

## JSONL-first Store Principle

Future content-intelligence records should be stored as append-oriented JSONL records before any database or runtime activation.

Each line must be one complete JSON object. Each record must include stable identity, schema version, stage ID, source trace, mutation controls and audit trace.

## Future Record Families

AG06K defines future JSONL record families for:

- content packet records;
- reference candidate records;
- approved reference records;
- rejected reference records;
- visual plan records;
- quality review records;
- publish queue state records;
- learning snapshot records;
- run registry records;
- audit event records.

These are future store contracts only. AG06K does not create or populate the production JSONL files.

## Common Line Contract

Every future JSONL record must follow the common line contract:

- UTF-8 encoding;
- one valid JSON object per line;
- no blank lines;
- no trailing commas;
- stable record ID;
- schema ID and schema version;
- stage ID;
- source trace;
- mutation controls;
- audit trace;
- public-ready and publish-ready flags defaulting to false.

## State Model

AG06K defines a future state model:

- planned_not_created;
- draft_record_allowed_in_future_stage;
- under_review;
- revision_required;
- approved_for_content_packet;
- approved_for_publish_queue;
- publish_ready;
- published_in_later_stage;
- rejected;
- archived_by_explicit_approval_only.

## Safety Rules

AG06K records these safety rules:

- no raw secrets or credentials in JSONL;
- no raw user profile storage;
- no public article HTML mutation through JSONL;
- no database sync in AG06K;
- no Supabase activation in AG06K;
- no scaffold import in AG06K;
- no publishing in AG06K.

## Explicit Exclusions

AG06K does not:

- create production JSONL content files;
- append records to JSONL files;
- import scaffold outputs;
- write to any database;
- activate Supabase, Auth, API routes or backend services;
- mutate current public article HTML;
- insert, populate or change reference URLs;
- modify CSS or JavaScript;
- copy, move, delete, import or publish scaffold files;
- generate article rewrites;
- generate upgraded content packets;
- generate visual assets or infographics;
- assign final quality or visitor-value scores;
- publish content;
- mark any existing public article as final Drishvara-quality content.

## Acceptance Criteria

AG06K is acceptable only if:

- AG06H-R1, AG06I, AG06J and AG06B inputs are present;
- future JSONL record families are defined;
- common line contract is defined;
- store manifest fields are defined;
- state model is defined;
- JSONL safety rules are defined;
- package scripts for generate:ag06k and validate:ag06k are present;
- validate:project includes validate:ag06k;
- no JSONL production file creation, JSONL append, scaffold import, database write, public article mutation, reference insertion, content generation, backend/Auth/Supabase activation or publishing is performed.

## Next Stage

The next stage is AG06L — Publish Queue and Approval State Register.
`;

writeJson(standardPath, standard);
writeJson(schemaPath, schema);
writeJson(manifestPath, manifest);
writeJson(governancePath, governance);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG06K JSONL-first content intelligence store governance artifacts generated.");
