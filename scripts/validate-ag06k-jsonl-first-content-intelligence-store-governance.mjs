import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/content-intelligence-foundation-alignment-review.json",
  "data/content-intelligence/quality-reviews/visual-data-infographic-requirement-schema-closure.json",
  "data/content-intelligence/quality-reviews/reference-source-credibility-schema-closure.json",
  "data/content-intelligence/reference-registry/reference-source-credibility-standard.json",
  "data/content-intelligence/schema/content-packet.schema.json",
  "data/content-intelligence/publish-queue/long-form-upgrade-queue.json",
  "data/content-intelligence/publish-queue/long-form-batch-01-content-packet-planning.json",
  "data/content-intelligence/quality-reviews/jsonl-first-content-intelligence-store-governance.json",
  "data/content-intelligence/learning/jsonl-first-content-intelligence-store-standard.json",
  "data/content-intelligence/schema/jsonl-first-content-intelligence-store.schema.json",
  "data/content-intelligence/run-registry/jsonl-first-content-intelligence-store-manifest.json",
  "data/quality/ag06k-jsonl-first-content-intelligence-store-governance.json",
  "data/quality/ag06k-jsonl-first-content-intelligence-store-governance-preview.json",
  "docs/quality/AG06K_JSONL_FIRST_CONTENT_INTELLIGENCE_STORE_GOVERNANCE.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG06K validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag06hR1 = readJson("data/content-intelligence/quality-reviews/content-intelligence-foundation-alignment-review.json");
const ag06i = readJson("data/content-intelligence/quality-reviews/visual-data-infographic-requirement-schema-closure.json");
const ag06j = readJson("data/content-intelligence/quality-reviews/reference-source-credibility-schema-closure.json");
const governance = readJson("data/content-intelligence/quality-reviews/jsonl-first-content-intelligence-store-governance.json");
const standard = readJson("data/content-intelligence/learning/jsonl-first-content-intelligence-store-standard.json");
const schema = readJson("data/content-intelligence/schema/jsonl-first-content-intelligence-store.schema.json");
const manifest = readJson("data/content-intelligence/run-registry/jsonl-first-content-intelligence-store-manifest.json");
const registry = readJson("data/quality/ag06k-jsonl-first-content-intelligence-store-governance.json");
const preview = readJson("data/quality/ag06k-jsonl-first-content-intelligence-store-governance-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG06K_JSONL_FIRST_CONTENT_INTELLIGENCE_STORE_GOVERNANCE.md"), "utf8");

for (const obj of [governance, standard, schema, manifest, registry, preview]) {
  if (obj.module_id !== "AG06K") fail(`module_id must be AG06K in ${obj.title || "preview"}`);
}

if (preview.preview_only !== true) fail("Preview must be preview-only");
if (registry.governance_only !== true) fail("Registry must be governance-only");
if (registry.storage_governance_schema_only !== true) fail("Registry must be storage-governance-schema-only");
if (governance.status !== "storage_governance_schema_only") fail("Governance status must be storage_governance_schema_only");
if (standard.status !== "storage_governance_schema_only") fail("Standard status must be storage_governance_schema_only");
if (schema.status !== "schema_only") fail("Schema status must be schema_only");
if (manifest.status !== "manifest_schema_only") fail("Manifest status must be manifest_schema_only");

if (!Array.isArray(ag06hR1.corrected_remaining_path) || !ag06hR1.corrected_remaining_path.some((x) => x.next_stage === "AG06K")) {
  fail("AG06H-R1 corrected path must include AG06K");
}
if (ag06hR1.summary.ag07_blocked_until_ag06z !== true) fail("AG07 must remain blocked until AG06Z");
if (ag06i.closure_decision.visual_asset_generation_allowed !== false) fail("AG06I must block visual generation");
if (ag06j.closure_decision.web_fetching_by_script_allowed !== false) fail("AG06J must block web fetching");
if (ag06j.closure_decision.reference_insertion_allowed !== false) fail("AG06J must block reference insertion");

if (!Array.isArray(standard.record_families) || standard.record_families.length < 8) fail("At least 8 record families must be defined");
for (const familyId of [
  "content_packet_record",
  "reference_candidate_record",
  "approved_reference_record",
  "rejected_reference_record",
  "visual_plan_record",
  "quality_review_record",
  "publish_queue_state_record",
  "learning_snapshot_record",
  "run_registry_record",
  "audit_event_record"
]) {
  if (!standard.record_families.find((x) => x.family_id === familyId)) fail(`Missing record family: ${familyId}`);
  if (!schema.record_family_ids.includes(familyId)) fail(`Schema missing record family: ${familyId}`);
}

for (const family of standard.record_families) {
  if (!family.future_file_path.endsWith(".jsonl")) fail(`Future file path must end with .jsonl: ${family.family_id}`);
  if (family.record_status_in_ag06k !== "schema_only_not_created") fail(`Record family must remain schema_only_not_created: ${family.family_id}`);
  if (!Array.isArray(family.required_identity_fields) || family.required_identity_fields.length < 1) fail(`Missing identity fields: ${family.family_id}`);
  if (!Array.isArray(family.required_governance_fields) || family.required_governance_fields.length < 1) fail(`Missing governance fields: ${family.family_id}`);
}

if (manifest.stores.length !== standard.record_families.length) fail("Manifest store count must match record family count");
for (const store of manifest.stores) {
  if (!store.future_file_path.endsWith(".jsonl")) fail(`Manifest future path must be .jsonl: ${store.store_id}`);
  if (store.activation_status !== "not_created_not_active_in_ag06k") fail(`Manifest store must not be active: ${store.store_id}`);
  if (store.jsonl_file_created !== false) fail(`Manifest store JSONL created flag must be false: ${store.store_id}`);
  if (store.jsonl_append_performed !== false) fail(`Manifest store append flag must be false: ${store.store_id}`);
}

const contract = standard.common_line_contract;
for (const [key, expected] of Object.entries({
  encoding: "utf-8",
  line_format: "one_valid_json_object_per_line",
  blank_lines_allowed: false,
  trailing_commas_allowed: false,
  append_only_default: true,
  stable_record_id_required: true,
  schema_version_required: true,
  stage_id_required: true,
  audit_trace_required: true,
  mutation_controls_required: true,
  source_trace_required: true,
  public_ready_flag_default: false,
  publish_ready_flag_default: false
})) {
  if (contract[key] !== expected) fail(`Common line contract mismatch for ${key}`);
  if (schema.common_line_contract[key] !== expected) fail(`Schema common line contract mismatch for ${key}`);
}

for (const state of [
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
]) {
  if (!standard.state_model.includes(state)) fail(`Missing state: ${state}`);
  if (!schema.allowed_states.includes(state)) fail(`Schema missing state: ${state}`);
}

for (const field of [
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
]) {
  if (!standard.required_store_manifest_fields.includes(field)) fail(`Missing manifest field: ${field}`);
}

if (standard.future_file_naming_rules.extension !== ".jsonl") fail("Future file extension must be .jsonl");
if (standard.future_file_naming_rules.one_record_family_per_file !== true) fail("One record family per file must be true");
if (standard.future_file_naming_rules.no_public_article_html_inside_jsonl !== true) fail("No public article HTML inside JSONL must be true");
if (standard.future_file_naming_rules.no_raw_secret_or_private_identity_storage !== true) fail("No raw secrets/private identity storage must be true");

if (standard.data_safety_rules.pii_default_allowed !== false) fail("PII default allowed must be false");
if (standard.data_safety_rules.secrets_allowed !== false) fail("Secrets allowed must be false");
if (standard.data_safety_rules.raw_user_profile_storage_allowed !== false) fail("Raw user profile storage must be false");
if (standard.data_safety_rules.database_sync_allowed_in_ag06k !== false) fail("Database sync in AG06K must be false");

if (governance.closure_decision.decision !== "jsonl_first_content_intelligence_store_governance_closed_for_foundation") fail("Closure decision mismatch");
if (governance.closure_decision.proceed_to_ag06l_publish_queue_approval_state_register !== true) fail("AG06L must be next");
if (governance.closure_decision.jsonl_file_creation_allowed !== false) fail("JSONL file creation must not be allowed");
if (governance.closure_decision.jsonl_append_allowed !== false) fail("JSONL append must not be allowed");
if (governance.closure_decision.jsonl_import_allowed !== false) fail("JSONL import must not be allowed");
if (governance.closure_decision.scaffold_import_allowed !== false) fail("Scaffold import must not be allowed");
if (governance.closure_decision.database_write_allowed !== false) fail("Database write must not be allowed");
if (governance.closure_decision.public_article_mutation_allowed !== false) fail("Public article mutation must not be allowed");
if (governance.closure_decision.content_packet_generation_allowed !== false) fail("Content packet generation must not be allowed");
if (governance.closure_decision.publication_allowed !== false) fail("Publication must not be allowed");

for (const falseField of [
  "mutation_performed",
  "public_article_mutation_performed",
  "article_html_mutation_performed",
  "homepage_mutation_performed",
  "css_mutation_performed",
  "javascript_mutation_performed",
  "reference_url_change_performed",
  "reference_insertion_performed",
  "reference_url_population_performed",
  "verified_reference_population_performed",
  "candidate_reference_population_performed",
  "external_fetch_performed_by_script",
  "live_url_fetch_performed",
  "link_health_fetch_performed",
  "backend_activation_performed",
  "api_route_created",
  "supabase_enabled",
  "auth_enabled",
  "real_login_enabled",
  "real_signup_enabled",
  "user_account_collection_enabled",
  "frontend_deployment_performed",
  "scaffold_file_copy_performed",
  "scaffold_file_move_performed",
  "scaffold_file_delete_performed",
  "scaffold_import_performed",
  "file_deletion_performed",
  "file_move_performed",
  "public_article_archive_performed",
  "public_article_delete_performed",
  "public_publishing_performed",
  "content_packet_generation_performed",
  "content_packet_created",
  "article_rewrite_performed",
  "visual_asset_generation_performed",
  "infographic_generation_performed",
  "quality_scoring_performed",
  "visitor_value_scoring_performed",
  "jsonl_file_created",
  "jsonl_production_record_created",
  "jsonl_append_performed",
  "jsonl_import_performed",
  "database_write_performed"
]) {
  for (const obj of [governance, standard, schema, manifest, registry]) {
    if (obj[falseField] !== false) fail(`${falseField} must be false in ${obj.title}`);
  }
}

for (const scriptName of ["generate:ag06k", "validate:ag06k"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag06k")) {
  fail("validate:project must include validate:ag06k");
}

for (const phrase of [
  "Purpose",
  "Inputs",
  "JSONL-first Store Principle",
  "Future Record Families",
  "Common Line Contract",
  "State Model",
  "Safety Rules",
  "Explicit Exclusions",
  "Acceptance Criteria",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG06K document missing phrase: ${phrase}`);
}

pass("AG06K registry is present.");
pass("AG06K document is present.");
pass("AG06K governance review, store standard, schema, manifest and preview are present.");
pass("AG06H-R1, AG06I, AG06J and AG06B inputs are consumed.");
pass("Future JSONL record families are defined.");
pass("Common line contract is defined.");
pass("Store manifest fields are defined.");
pass("State model is defined.");
pass("JSONL safety rules are defined.");
pass("AG06K is storage governance/schema only.");
pass("No JSONL production file creation, JSONL append, scaffold import, database write, public article mutation, reference insertion, content generation, backend/Auth/Supabase activation or publishing is enabled or performed.");
pass("AG06L Publish Queue and Approval State Register is identified as next.");
