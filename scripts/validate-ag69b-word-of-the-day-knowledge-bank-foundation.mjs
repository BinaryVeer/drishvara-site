import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG69B validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag69b-word-of-the-day-knowledge-bank-foundation.mjs",
  "scripts/validate-ag69b-word-of-the-day-knowledge-bank-foundation.mjs",
  "data/knowledge-base/word-of-day/ag69b-word-field-ontology.json",
  "data/knowledge-base/word-of-day/ag69b-word-source-hierarchy.json",
  "data/knowledge-base/word-of-day/ag69b-word-candidate-bank-foundation.json",
  "data/knowledge-base/word-of-day/ag69b-word-purity-source-safety-rules.json",
  "data/knowledge-base/word-of-day/ag69b-word-review-approval-workflow.json",
  "data/knowledge-base/word-of-day/ag69b-word-output-test-plan.json",
  "data/knowledge-base/word-of-day/ag69b-word-result-saving-model.json",
  "data/content-intelligence/backend-architecture/ag69b-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag69b-no-v02-expansion-audit.json",
  "data/content-intelligence/quality-registry/ag69b-ag69c-word-review-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag69b-to-ag69c-word-review-approved-bank-boundary.json",
  "data/content-intelligence/quality-reviews/ag69b-word-of-the-day-knowledge-bank-foundation.json",
  "data/quality/ag69b-word-of-the-day-knowledge-bank-foundation.json",
  "data/quality/ag69b-word-of-the-day-knowledge-bank-foundation-preview.json",
  "docs/quality/AG69B_WORD_OF_THE_DAY_KNOWLEDGE_BANK_FOUNDATION.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag69b"]) fail("Missing generate:ag69b script.");
if (!pkg.scripts?.["validate:ag69b"]) fail("Missing validate:ag69b script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag69b")) fail("validate:project must include validate:ag69b.");

const review = readJson("data/content-intelligence/quality-reviews/ag69b-word-of-the-day-knowledge-bank-foundation.json");
if (review.status !== "ag69b_word_of_the_day_knowledge_bank_foundation_completed") fail("Review status mismatch.");

for (const key of [
  "ag69a_consumed",
  "word_field_ontology_defined",
  "word_source_hierarchy_defined",
  "candidate_word_bank_foundation_created",
  "candidate_word_records_created",
  "word_purity_rules_defined",
  "no_invented_sanskrit_rule_recorded",
  "no_loose_transliteration_rule_recorded",
  "no_unsupported_etymology_rule_recorded",
  "review_workflow_defined",
  "output_test_planned_not_executed",
  "result_saving_model_planned_not_runtime",
  "ready_for_ag69c"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true in review summary.`);
}

for (const key of [
  "approved_word_bank_created",
  "public_output_from_candidate_records_allowed",
  "generated_word_json_modified",
  "ui_display_changed",
  "supabase_database_write_performed",
  "backend_runtime_activated",
  "database_runtime_activated",
  "service_role_used",
  "v02_expansion_started"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false in review summary.`);
}

const ontology = readJson("data/knowledge-base/word-of-day/ag69b-word-field-ontology.json");
const ontologyFields = ontology.required_fields.map((x) => x.field);
for (const field of [
  "record_id",
  "bank_class",
  "word_id",
  "english_word",
  "hindi_word",
  "sanskrit_word",
  "transliteration",
  "meaning",
  "source_reference_id",
  "source_tier",
  "source_status",
  "review_status",
  "claim_level",
  "public_use_permission",
  "public_output_allowed",
  "etymology_claim_allowed",
  "classical_claim_allowed",
  "language_review_status",
  "safety_review_status",
  "editorial_review_status"
]) {
  if (!ontologyFields.includes(field)) fail(`Ontology missing field: ${field}`);
}
if (ontology.public_gate.bank_class_required !== "approved") fail("Public gate must require approved bank class.");

const sourceHierarchy = readJson("data/knowledge-base/word-of-day/ag69b-word-source-hierarchy.json");
if (!Array.isArray(sourceHierarchy.source_hierarchy) || sourceHierarchy.source_hierarchy.length < 5) fail("Source hierarchy incomplete.");
if (!sourceHierarchy.source_hierarchy.some((x) => x.tier === "blocked")) fail("Blocked source tier missing.");

const candidateBank = readJson("data/knowledge-base/word-of-day/ag69b-word-candidate-bank-foundation.json");
if (candidateBank.status !== "candidate_bank_foundation_created_not_public") fail("Candidate bank status mismatch.");
if (candidateBank.approved_bank_created !== false) fail("Approved bank must not be created in AG69B.");
if (candidateBank.public_output_allowed_from_this_bank !== false) fail("Candidate bank must not allow public output.");
if (!Array.isArray(candidateBank.candidate_records) || candidateBank.candidate_records.length < 5) fail("Candidate records must be present.");

for (const record of candidateBank.candidate_records) {
  if (record.bank_class !== "candidate") fail(`Record ${record.record_id} must remain candidate.`);
  if (record.public_output_allowed !== false) fail(`Record ${record.record_id} must not allow public output.`);
  if (record.public_use_permission !== "not_allowed") fail(`Record ${record.record_id} public use permission must be not_allowed.`);
  if (record.review_status !== "candidate") fail(`Record ${record.record_id} review status must be candidate.`);
  if (record.source_status !== "candidate_unverified") fail(`Record ${record.record_id} source status must be candidate_unverified.`);
  if (record.etymology_claim_allowed !== false) fail(`Record ${record.record_id} etymology claim must be false.`);
  if (record.classical_claim_allowed !== false) fail(`Record ${record.record_id} classical claim must be false.`);
}

const purity = readJson("data/knowledge-base/word-of-day/ag69b-word-purity-source-safety-rules.json");
for (const blocker of [
  "invented_sanskrit",
  "loose_transliteration",
  "unsupported_etymology",
  "candidate_record_used_for_public_output"
]) {
  if (!purity.blocked_conditions.includes(blocker)) fail(`Purity blocker missing: ${blocker}`);
}

const workflow = readJson("data/knowledge-base/word-of-day/ag69b-word-review-approval-workflow.json");
for (const step of ["candidate_record_created", "source_checked", "reviewed", "approved", "output_tested", "public_safe"]) {
  if (!workflow.workflow.includes(step)) fail(`Workflow step missing: ${step}`);
}

const outputTest = readJson("data/knowledge-base/word-of-day/ag69b-word-output-test-plan.json");
if (outputTest.output_generation_now !== false) fail("Output generation must be false.");
if (outputTest.generated_word_json_modified !== false) fail("generated/word-of-day.json must not be modified.");

const resultPlan = readJson("data/knowledge-base/word-of-day/ag69b-word-result-saving-model.json");
if (resultPlan.result_saving_runtime_active !== false) fail("Result-saving runtime must be inactive.");
if (resultPlan.static_result_schema_only !== true) fail("Result-saving plan must be static schema only.");

const readiness = readJson("data/content-intelligence/quality-registry/ag69b-ag69c-word-review-readiness-record.json");
if (readiness.ready_for_ag69c !== true) fail("AG69C readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag69b-to-ag69c-word-review-approved-bank-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("Next stage must not auto-start.");
for (const blocked of [
  "public use of candidate word records",
  "generated/word-of-day.json replacement from candidate data",
  "Supabase/database writes",
  "unsupported Sanskrit claim",
  "unsupported etymology claim",
  "V02 expansion"
]) {
  if (!boundary.blocked_scope_without_explicit_approval.includes(blocked)) fail(`Boundary blocker missing: ${blocked}`);
}

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag69b-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag69b-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG69B Word of the Day Knowledge Bank Foundation is present.");
pass("Word field ontology and source hierarchy are valid.");
pass("Candidate-only word bank foundation is valid.");
pass("Candidate records are blocked from public output.");
pass("Word purity, source and safety rules are valid.");
pass("No generated Word output, UI change, Supabase/database/backend/service-role/V02 activation is recorded.");
