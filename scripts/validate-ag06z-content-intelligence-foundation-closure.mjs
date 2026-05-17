import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "data/quality/ag06a-full-source-of-truth-inventory-audit.json",
  "data/quality/ag06b-content-intelligence-schema.json",
  "data/quality/ag06c-scaffold-output-preservation-register.json",
  "data/quality/ag06d-existing-public-article-classification.json",
  "data/quality/ag06e-long-form-article-standard.json",
  "data/quality/ag06f-long-form-production-queue.json",
  "data/quality/ag06g-long-form-content-packet-upgrade-dry-run-review.json",
  "data/quality/ag06h-batch-01-content-packet-upgrade-planning.json",
  "data/quality/ag06h-r1-content-intelligence-foundation-alignment-review.json",
  "data/quality/ag06i-visual-data-infographic-requirement-schema-closure.json",
  "data/quality/ag06j-reference-source-credibility-schema-closure.json",
  "data/quality/ag06k-jsonl-first-content-intelligence-store-governance.json",
  "data/quality/ag06l-publish-queue-approval-state-register.json",
  "data/content-intelligence/quality-reviews/content-intelligence-foundation-alignment-review.json",
  "data/content-intelligence/quality-reviews/publish-queue-approval-state-register.json",
  "data/content-intelligence/publish-queue/publish-queue-approval-state-register.json",
  "data/content-intelligence/quality-reviews/content-intelligence-foundation-closure.json",
  "data/content-intelligence/run-registry/content-intelligence-foundation-closure-evidence.json",
  "data/content-intelligence/learning/content-intelligence-foundation-closure-handoff.json",
  "data/quality/ag06z-content-intelligence-foundation-closure.json",
  "data/quality/ag06z-content-intelligence-foundation-closure-preview.json",
  "docs/quality/AG06Z_CONTENT_INTELLIGENCE_FOUNDATION_CLOSURE.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG06Z validation failed: ${message}`);
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

const ag06hR1Review = readJson("data/content-intelligence/quality-reviews/content-intelligence-foundation-alignment-review.json");
const ag06lReview = readJson("data/content-intelligence/quality-reviews/publish-queue-approval-state-register.json");
const ag06lRegister = readJson("data/content-intelligence/publish-queue/publish-queue-approval-state-register.json");

const closure = readJson("data/content-intelligence/quality-reviews/content-intelligence-foundation-closure.json");
const evidence = readJson("data/content-intelligence/run-registry/content-intelligence-foundation-closure-evidence.json");
const handoff = readJson("data/content-intelligence/learning/content-intelligence-foundation-closure-handoff.json");
const registry = readJson("data/quality/ag06z-content-intelligence-foundation-closure.json");
const preview = readJson("data/quality/ag06z-content-intelligence-foundation-closure-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG06Z_CONTENT_INTELLIGENCE_FOUNDATION_CLOSURE.md"), "utf8");

for (const obj of [closure, evidence, handoff, registry, preview]) {
  if (obj.module_id !== "AG06Z") fail(`module_id must be AG06Z in ${obj.title || "preview"}`);
}

if (closure.status !== "foundation_closed") fail("Closure status must be foundation_closed");
if (closure.governance_only !== true) fail("Closure must be governance-only");
if (closure.closure_audit_only !== true) fail("Closure must be closure-audit-only");
if (evidence.status !== "closure_evidence_only") fail("Evidence must be closure_evidence_only");
if (handoff.status !== "handoff_only") fail("Handoff must be handoff_only");
if (registry.foundation_closed !== true) fail("Registry must mark foundation_closed=true");
if (preview.preview_only !== true) fail("Preview must be preview-only");

if (!Array.isArray(ag06hR1Review.corrected_remaining_path) || !ag06hR1Review.corrected_remaining_path.some((x) => x.next_stage === "AG06Z")) {
  fail("AG06H-R1 corrected remaining path must include AG06Z");
}
if (ag06hR1Review.summary.ag07_blocked_until_ag06z !== true) fail("AG07 must remain blocked until AG06Z in AG06H-R1");
if (ag06lReview.closure_decision.proceed_to_ag06z_content_intelligence_foundation_closure !== true) fail("AG06L must point to AG06Z closure");

for (const obj of [closure, evidence, registry, preview]) {
  if (obj.summary.foundation_stage_count !== 13) fail(`${obj.title || "preview"} must report 13 foundation stages`);
  if (obj.summary.closed_stage_count !== 13) fail(`${obj.title || "preview"} must report 13 closed stages`);
  if (obj.summary.all_foundation_stages_closed !== true) fail(`${obj.title || "preview"} must mark all foundation stages closed`);
  if (obj.summary.content_intelligence_foundation_closed !== true) fail(`${obj.title || "preview"} must mark foundation closed`);
  if (obj.summary.ag07_production_tooling_allowed_automatically !== false) fail(`${obj.title || "preview"} must block automatic AG07 tooling`);
  if (obj.summary.ag07_requires_explicit_user_approval !== true) fail(`${obj.title || "preview"} must require explicit AG07 approval`);
}

for (const stageId of ["AG06A", "AG06B", "AG06C", "AG06D", "AG06E", "AG06F", "AG06G", "AG06H", "AG06H-R1", "AG06I", "AG06J", "AG06K", "AG06L"]) {
  if (!closure.foundation_stages.find((stage) => stage.stage_id === stageId && stage.closure_status === "closed")) {
    fail(`Closure missing closed stage: ${stageId}`);
  }
  if (!evidence.foundation_stages.find((stage) => stage.stage_id === stageId && stage.closure_status === "closed")) {
    fail(`Evidence missing closed stage: ${stageId}`);
  }
}

if (closure.closure_decision.decision !== "content_intelligence_foundation_closed") fail("Closure decision mismatch");
if (closure.closure_decision.ag06_foundation_closed !== true) fail("AG06 foundation must be closed");
if (closure.closure_decision.proceed_to_ag07_only_with_explicit_user_approval !== true) fail("AG07 must require explicit approval");
if (closure.closure_decision.ag07_production_tooling_started !== false) fail("AG07 production tooling must not be started");

if (handoff.ready_for_ag07_discussion !== true) fail("Handoff must allow AG07 discussion");
if (handoff.ready_for_ag07_execution_without_approval !== false) fail("Handoff must block AG07 execution without approval");
if (handoff.recommended_next_discussion.module_id !== "AG07A") fail("Recommended next discussion must be AG07A");

if (!Array.isArray(ag06lRegister.approval_queue_entries) || ag06lRegister.approval_queue_entries.length < 1) {
  fail("AG06L approval register must contain entries");
}
for (const entry of ag06lRegister.approval_queue_entries) {
  if (entry.approval_state !== "not_approved") fail(`AG06L entry must remain not_approved: ${entry.approval_queue_id}`);
  if (entry.publish_ready !== false) fail(`AG06L entry must remain not publish-ready: ${entry.approval_queue_id}`);
  if (entry.publication_allowed !== false) fail(`AG06L entry must not allow publication: ${entry.approval_queue_id}`);
}

for (const control of [
  "No current public article is final Drishvara-quality content.",
  "Current public articles remain test corpus and upgrade candidates.",
  "Future long-form Featured Reads require 1500-2200 words.",
  "Future long-form Featured Reads require 2-5 verified references.",
  "Future long-form Featured Reads require visual/data/infographic planning.",
  "AG07 production tooling may begin only after AG06Z closure and explicit approval."
]) {
  if (!closure.permanent_foundation_controls.includes(control)) fail(`Missing permanent foundation control: ${control}`);
  if (!handoff.permanent_foundation_controls.includes(control)) fail(`Handoff missing permanent foundation control: ${control}`);
}

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
  "publication_approval_granted",
  "ag07_production_tooling_started"
]) {
  for (const obj of [closure, evidence, handoff, registry]) {
    if (obj[falseField] !== false) fail(`${falseField} must be false in ${obj.title}`);
  }
}

for (const scriptName of ["generate:ag06z", "validate:ag06z"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag06z")) {
  fail("validate:project must include validate:ag06z");
}

for (const phrase of [
  "Purpose",
  "Closure Coverage",
  "Foundation Decisions Preserved",
  "Explicit Exclusions",
  "Acceptance Criteria",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG06Z document missing phrase: ${phrase}`);
}

pass("AG06Z registry is present.");
pass("AG06Z document is present.");
pass("AG06Z closure review, evidence, handoff and preview are present.");
pass("AG06A through AG06L evidence files are present.");
pass("AG06H-R1 corrected remaining path includes AG06Z.");
pass("AG06L closure decision points to AG06Z.");
pass("All 13 foundation stages are marked closed.");
pass("AG06 foundation is formally closed.");
pass("AG07 discussion is allowed only after AG06Z, but AG07 execution requires explicit approval.");
pass("AG06L approval entries remain not approved and not publish-ready.");
pass("No public article mutation, reference insertion, content packet generation, JSONL append, scaffold import, database write, backend/Auth/Supabase activation, public output, publishing or AG07 production tooling is enabled or performed.");
pass("AG07A controlled production-tooling discussion is identified as the next possible discussion.");
