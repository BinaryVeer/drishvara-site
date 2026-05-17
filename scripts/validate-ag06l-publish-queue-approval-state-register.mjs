import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/content-intelligence-foundation-alignment-review.json",
  "data/content-intelligence/quality-reviews/long-form-article-standard.json",
  "data/content-intelligence/publish-queue/long-form-upgrade-queue.json",
  "data/content-intelligence/quality-reviews/long-form-content-packet-upgrade-dry-run-review.json",
  "data/content-intelligence/publish-queue/long-form-batch-01-content-packet-planning.json",
  "data/content-intelligence/quality-reviews/visual-data-infographic-requirement-schema-closure.json",
  "data/content-intelligence/quality-reviews/reference-source-credibility-schema-closure.json",
  "data/content-intelligence/quality-reviews/jsonl-first-content-intelligence-store-governance.json",
  "data/content-intelligence/learning/jsonl-first-content-intelligence-store-standard.json",
  "data/content-intelligence/run-registry/jsonl-first-content-intelligence-store-manifest.json",
  "data/content-intelligence/quality-reviews/publish-queue-approval-state-register.json",
  "data/content-intelligence/publish-queue/publish-queue-approval-state-register.json",
  "data/content-intelligence/schema/publish-queue-approval-state.schema.json",
  "data/quality/ag06l-publish-queue-approval-state-register.json",
  "data/quality/ag06l-publish-queue-approval-state-register-preview.json",
  "docs/quality/AG06L_PUBLISH_QUEUE_APPROVAL_STATE_REGISTER.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG06L validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag06hR1 = readJson("data/content-intelligence/quality-reviews/content-intelligence-foundation-alignment-review.json");
const ag06f = readJson("data/content-intelligence/publish-queue/long-form-upgrade-queue.json");
const ag06g = readJson("data/content-intelligence/quality-reviews/long-form-content-packet-upgrade-dry-run-review.json");
const ag06h = readJson("data/content-intelligence/publish-queue/long-form-batch-01-content-packet-planning.json");
const ag06i = readJson("data/content-intelligence/quality-reviews/visual-data-infographic-requirement-schema-closure.json");
const ag06j = readJson("data/content-intelligence/quality-reviews/reference-source-credibility-schema-closure.json");
const ag06k = readJson("data/content-intelligence/quality-reviews/jsonl-first-content-intelligence-store-governance.json");
const review = readJson("data/content-intelligence/quality-reviews/publish-queue-approval-state-register.json");
const approvalRegister = readJson("data/content-intelligence/publish-queue/publish-queue-approval-state-register.json");
const schema = readJson("data/content-intelligence/schema/publish-queue-approval-state.schema.json");
const registry = readJson("data/quality/ag06l-publish-queue-approval-state-register.json");
const preview = readJson("data/quality/ag06l-publish-queue-approval-state-register-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG06L_PUBLISH_QUEUE_APPROVAL_STATE_REGISTER.md"), "utf8");

for (const obj of [review, approvalRegister, schema, registry, preview]) {
  if (obj.module_id !== "AG06L") fail(`module_id must be AG06L in ${obj.title || "preview"}`);
}

if (preview.preview_only !== true) fail("Preview must be preview-only");
if (registry.governance_only !== true) fail("Registry must be governance-only");
if (registry.queue_approval_schema_only !== true) fail("Registry must be queue-approval-schema-only");
if (review.status !== "queue_approval_schema_only") fail("Review status must be queue_approval_schema_only");
if (approvalRegister.status !== "queue_approval_schema_only") fail("Approval register status must be queue_approval_schema_only");
if (schema.status !== "schema_only") fail("Schema status must be schema_only");

if (!Array.isArray(ag06hR1.corrected_remaining_path) || !ag06hR1.corrected_remaining_path.some((x) => x.next_stage === "AG06L")) {
  fail("AG06H-R1 corrected path must include AG06L");
}
if (ag06hR1.summary.ag07_blocked_until_ag06z !== true) fail("AG07 must remain blocked until AG06Z");
if (ag06g.review_decision.content_packet_generation_allowed !== false) fail("AG06G must block content packet generation");
if (ag06g.review_decision.article_mutation_allowed !== false) fail("AG06G must block article mutation");
if (ag06h.summary.content_packet_generation_performed !== false) fail("AG06H must not generate content packets");
if (ag06i.closure_decision.visual_asset_generation_allowed !== false) fail("AG06I must block visual generation");
if (ag06j.closure_decision.reference_insertion_allowed !== false) fail("AG06J must block reference insertion");
if (ag06k.closure_decision.jsonl_append_allowed !== false) fail("AG06K must block JSONL append");
if (ag06k.closure_decision.publication_allowed !== false) fail("AG06K must block publication");

const sourceQueue = asArray(
  ag06f.article_upgrade_queue ||
  ag06f.queue_entries ||
  ag06f.entries ||
  ag06f.long_form_upgrade_queue ||
  ag06f.upgrade_queue ||
  ag06f.items
);

const approvalEntries = asArray(approvalRegister.approval_queue_entries);

if (sourceQueue.length < 1) fail("AG06F queue entries must be present");
if (approvalEntries.length !== sourceQueue.length) fail("Approval register count must match AG06F queue count");
if (approvalRegister.summary.approval_queue_entry_count !== sourceQueue.length) fail("Approval summary count must match AG06F queue count");
if (review.summary.approval_queue_entry_count !== sourceQueue.length) fail("Review summary count must match AG06F queue count");
if (registry.summary.approval_queue_entry_count !== sourceQueue.length) fail("Registry summary count must match AG06F queue count");
if (preview.summary.approval_queue_entry_count !== sourceQueue.length) fail("Preview summary count must match AG06F queue count");

if (!Array.isArray(approvalRegister.state_model) || approvalRegister.state_model.length < 10) fail("State model must contain at least 10 states");
for (const state of [
  "queued_for_upgrade_review",
  "content_packet_planning_only",
  "content_packet_generation_awaiting_explicit_approval",
  "reference_review_pending",
  "visual_review_pending",
  "quality_review_pending",
  "visitor_value_review_pending",
  "editorial_review_pending",
  "approved_for_publish_readiness_review",
  "publish_ready_locked_in_future_stage",
  "published_in_later_approved_stage",
  "revision_required",
  "rejected",
  "paused",
  "archived_by_explicit_approval_only"
]) {
  if (!approvalRegister.state_model.find((x) => x.state_id === state)) fail(`Missing state: ${state}`);
  if (!schema.allowed_states.includes(state)) fail(`Schema missing state: ${state}`);
}

for (const checkpoint of [
  "content_packet_generation_permission",
  "reference_approval",
  "visual_data_approval",
  "quality_score_approval",
  "visitor_value_score_approval",
  "editorial_approval",
  "final_publish_approval"
]) {
  if (!approvalRegister.approval_checkpoints.find((x) => x.checkpoint_id === checkpoint)) fail(`Missing checkpoint: ${checkpoint}`);
  if (!schema.approval_checkpoints.includes(checkpoint)) fail(`Schema missing checkpoint: ${checkpoint}`);
}

for (const role of [
  "content_operator",
  "reference_reviewer",
  "visual_reviewer",
  "quality_reviewer",
  "editorial_reviewer",
  "founder_or_authorized_publisher"
]) {
  if (!approvalRegister.approval_roles.find((x) => x.role_id === role)) fail(`Missing approval role: ${role}`);
  if (!schema.approval_role_ids.includes(role)) fail(`Schema missing approval role: ${role}`);
}

for (const group of [
  "long_form_content_standard",
  "reference_source_credibility",
  "visual_data_infographic",
  "jsonl_store_auditability",
  "public_mutation_and_publish_control"
]) {
  if (!approvalRegister.publish_readiness_gate_groups.find((x) => x.group_id === group)) fail(`Missing gate group: ${group}`);
  if (!schema.publish_readiness_gate_groups.includes(group)) fail(`Schema missing gate group: ${group}`);
}

for (const entry of approvalEntries) {
  if (!entry.approval_queue_id) fail("Approval entry missing approval_queue_id");
  if (!entry.source_article_path) fail(`Approval entry missing source_article_path: ${entry.approval_queue_id}`);
  if (entry.current_state !== "queued_for_upgrade_review") fail(`AG06L current state must remain queued_for_upgrade_review: ${entry.approval_queue_id}`);
  if (entry.approval_state !== "not_approved") fail(`Approval state must remain not_approved: ${entry.approval_queue_id}`);
  if (entry.publish_ready !== false) fail(`publish_ready must remain false: ${entry.approval_queue_id}`);
  if (entry.publication_allowed !== false) fail(`publication_allowed must remain false: ${entry.approval_queue_id}`);
  if (entry.article_mutation_allowed !== false) fail(`article_mutation_allowed must remain false: ${entry.approval_queue_id}`);
  if (entry.reference_insertion_allowed !== false) fail(`reference_insertion_allowed must remain false: ${entry.approval_queue_id}`);
  if (entry.content_packet_generation_allowed !== false) fail(`content_packet_generation_allowed must remain false: ${entry.approval_queue_id}`);
  if (entry.jsonl_append_allowed !== false) fail(`jsonl_append_allowed must remain false: ${entry.approval_queue_id}`);
  if (entry.allowed_next_state_in_ag06l !== null) fail(`allowed_next_state_in_ag06l must be null: ${entry.approval_queue_id}`);

  for (const checkpoint of entry.required_approval_checkpoints) {
    if (checkpoint.passed !== false) fail(`Checkpoint must not pass in AG06L: ${entry.approval_queue_id}`);
    if (checkpoint.approval_record_created !== false) fail(`Approval record must not be created in AG06L: ${entry.approval_queue_id}`);
  }

  for (const group of entry.required_gate_groups) {
    if (group.current_status !== "not_evaluated_in_ag06l") fail(`Gate group must not be evaluated in AG06L: ${entry.approval_queue_id}`);
    if (group.passed !== false) fail(`Gate group must not pass in AG06L: ${entry.approval_queue_id}`);
  }

  for (const transition of entry.blocked_transitions_in_ag06l) {
    if (transition.allowed_in_ag06l !== false) fail(`Transition must be blocked in AG06L: ${entry.approval_queue_id}`);
  }

  for (const [key, expected] of Object.entries({
    public_article_mutation_performed: false,
    reference_insertion_performed: false,
    content_packet_generation_performed: false,
    jsonl_append_performed: false,
    scaffold_import_performed: false,
    public_publishing_performed: false,
    backend_activation_performed: false,
    supabase_enabled: false,
    auth_enabled: false
  })) {
    if (entry.mutation_controls[key] !== expected) fail(`${key} must be false: ${entry.approval_queue_id}`);
  }
}

if (review.closure_decision.decision !== "publish_queue_approval_state_register_closed_for_foundation") fail("Closure decision mismatch");
if (review.closure_decision.proceed_to_ag06z_content_intelligence_foundation_closure !== true) fail("AG06Z must be next");
if (review.closure_decision.approval_state_change_allowed !== false) fail("Approval state change must not be allowed");
if (review.closure_decision.publish_ready_lock_allowed !== false) fail("Publish-ready lock must not be allowed");
if (review.closure_decision.publishing_allowed !== false) fail("Publishing must not be allowed");
if (review.closure_decision.public_article_mutation_allowed !== false) fail("Public article mutation must not be allowed");
if (review.closure_decision.reference_insertion_allowed !== false) fail("Reference insertion must not be allowed");
if (review.closure_decision.content_packet_generation_allowed !== false) fail("Content packet generation must not be allowed");
if (review.closure_decision.jsonl_append_allowed !== false) fail("JSONL append must not be allowed");
if (review.closure_decision.scaffold_import_allowed !== false) fail("Scaffold import must not be allowed");
if (review.closure_decision.backend_auth_supabase_allowed !== false) fail("Backend/Auth/Supabase must not be allowed");

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
  "database_write_performed",
  "approval_state_changed",
  "publish_ready_set",
  "publish_queue_transition_performed",
  "publication_approval_granted"
]) {
  for (const obj of [review, approvalRegister, schema, registry]) {
    if (obj[falseField] !== false) fail(`${falseField} must be false in ${obj.title}`);
  }
}

for (const scriptName of ["generate:ag06l", "validate:ag06l"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag06l")) {
  fail("validate:project must include validate:ag06l");
}

for (const phrase of [
  "Purpose",
  "Inputs",
  "Queue Logic",
  "Approval State Model",
  "Approval Checkpoints",
  "Publish-Readiness Gate Groups",
  "Explicit Exclusions",
  "Acceptance Criteria",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG06L document missing phrase: ${phrase}`);
}

pass("AG06L registry is present.");
pass("AG06L document is present.");
pass("AG06L review, approval register, schema and preview are present.");
pass("AG06H-R1, AG06E, AG06F, AG06G, AG06H, AG06I, AG06J and AG06K inputs are consumed.");
pass("Approval register count matches AG06F queue count.");
pass("Every approval register entry remains not approved and not publish-ready.");
pass("State model is defined.");
pass("Approval checkpoints are defined.");
pass("Transition rules are defined and blocked in AG06L.");
pass("Approval role labels are defined as future process roles only.");
pass("Publish-readiness gate groups are defined.");
pass("AG06L is queue/approval schema governance only.");
pass("No approval-state change, publish-ready lock, publishing, public article mutation, reference insertion, content packet generation, JSONL append, scaffold import, database write, backend/Auth/Supabase activation or public output is enabled or performed.");
pass("AG06Z Content Intelligence Foundation Closure is identified as next.");
