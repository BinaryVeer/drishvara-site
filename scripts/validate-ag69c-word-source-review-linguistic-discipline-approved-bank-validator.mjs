import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG69C validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag69c-word-source-review-linguistic-discipline-approved-bank-validator.mjs",
  "scripts/validate-ag69c-word-source-review-linguistic-discipline-approved-bank-validator.mjs",
  "data/knowledge-base/word-of-day/ag69c-word-source-review-doctrine.json",
  "data/knowledge-base/word-of-day/ag69c-linguistic-discipline-gate.json",
  "data/knowledge-base/word-of-day/ag69c-published-work-candidate-source-handling.json",
  "data/knowledge-base/word-of-day/ag69c-approved-bank-eligibility-validator-config.json",
  "data/knowledge-base/word-of-day/ag69c-candidate-record-review-assessment.json",
  "data/knowledge-base/word-of-day/ag69c-approved-bank-placeholder-no-public-output.json",
  "data/knowledge-base/word-of-day/ag69c-source-acquisition-plan.json",
  "data/content-intelligence/backend-architecture/ag69c-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag69c-no-v02-expansion-audit.json",
  "data/content-intelligence/quality-registry/ag69c-ag69d-source-acquisition-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag69c-to-ag69d-source-acquisition-boundary.json",
  "data/content-intelligence/quality-reviews/ag69c-word-source-review-linguistic-discipline-approved-bank-validator.json",
  "data/quality/ag69c-word-source-review-linguistic-discipline-approved-bank-validator.json",
  "data/quality/ag69c-word-source-review-linguistic-discipline-approved-bank-validator-preview.json",
  "docs/quality/AG69C_WORD_SOURCE_REVIEW_LINGUISTIC_DISCIPLINE_APPROVED_BANK_VALIDATOR.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag69c"]) fail("Missing generate:ag69c script.");
if (!pkg.scripts?.["validate:ag69c"]) fail("Missing validate:ag69c script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag69c")) fail("validate:project must include validate:ag69c.");

const review = readJson("data/content-intelligence/quality-reviews/ag69c-word-source-review-linguistic-discipline-approved-bank-validator.json");
if (review.status !== "ag69c_word_source_review_linguistic_discipline_approved_bank_validator_completed") fail("Review status mismatch.");

for (const key of [
  "ag69b_consumed",
  "source_review_doctrine_defined",
  "linguistic_discipline_gate_defined",
  "internal_textual_discipline_check_required",
  "published_work_candidate_handling_defined",
  "public_attribution_of_internal_influence_blocked",
  "approved_bank_eligibility_validator_defined",
  "candidate_records_assessed",
  "all_candidate_records_remain_candidate",
  "ready_for_ag69d"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}

for (const key of [
  "reviewed_records_created",
  "approved_records_created",
  "public_output_from_candidate_or_reviewed_records_allowed",
  "approved_bank_created",
  "source_fetching_performed_now",
  "source_content_saved_now",
  "generated_word_json_modified",
  "ui_display_changed",
  "supabase_database_write_performed",
  "backend_runtime_activated",
  "database_runtime_activated",
  "service_role_used",
  "v02_expansion_started"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false.`);
}

const doctrine = readJson("data/knowledge-base/word-of-day/ag69c-word-source-review-doctrine.json");
for (const req of [
  "At least one authenticated lexical or published source reference for the word form and basic meaning.",
  "If Sanskrit form is used, Sanskrit lexical/source confirmation is required.",
  "If transliteration is used, transliteration review is required."
]) {
  if (!doctrine.minimum_source_requirements_for_approved_record.includes(req)) fail(`Source requirement missing: ${req}`);
}
if (!doctrine.blocked_behaviour.includes("AI-generated meaning treated as source.")) fail("AI-as-source blocker missing.");

const discipline = readJson("data/knowledge-base/word-of-day/ag69c-linguistic-discipline-gate.json");
if (!discipline.gate_fields_required_for_future_review.includes("internal_textual_discipline_check")) fail("Internal textual discipline field missing.");
if (discipline.internal_textual_discipline_rule.public_attribution_allowed !== false) fail("Internal discipline public attribution must be false.");
if (!discipline.internal_textual_discipline_rule.note.includes("publicly named")) fail("Internal discipline naming note missing.");

const published = readJson("data/knowledge-base/word-of-day/ag69c-published-work-candidate-source-handling.json");
if (published.specific_source_added_now !== false) fail("No specific published source must be added now.");
if (published.public_attribution_added_now !== false) fail("No public attribution must be added now.");
for (const condition of [
  "The work must be publicly available or independently citable.",
  "The exact work must be separately verified before being treated as a source.",
  "No private influence name is inserted into public UI or public output."
]) {
  if (!published.strict_conditions.includes(condition)) fail(`Published-work condition missing: ${condition}`);
}

const eligibility = readJson("data/knowledge-base/word-of-day/ag69c-approved-bank-eligibility-validator-config.json");
if (eligibility.candidate_records_eligible_now !== false) fail("Candidate records must not be eligible now.");
if (eligibility.approved_bank_creation_now !== false) fail("Approved bank must not be created now.");
if (eligibility.public_output_creation_now !== false) fail("Public output must not be created now.");
for (const rule of [
  "source_reference_id must be present",
  "source_status must be approved_source",
  "review_status must be approved",
  "public_use_permission must be approved_for_public_output",
  "internal_textual_discipline_check must be passed or not_applicable"
]) {
  if (!eligibility.eligibility_rules.includes(rule)) fail(`Eligibility rule missing: ${rule}`);
}

const assessment = readJson("data/knowledge-base/word-of-day/ag69c-candidate-record-review-assessment.json");
if (assessment.reviewed_count_now !== 0) fail("Reviewed count must be 0.");
if (assessment.approved_count_now !== 0) fail("Approved count must be 0.");
if (assessment.summary.all_records_remain_candidate !== true) fail("All records must remain candidate.");
if (!assessment.candidate_records.every((x) => x.eligible_for_approved_bank === false)) fail("No candidate may be approved.");

const approved = readJson("data/knowledge-base/word-of-day/ag69c-approved-bank-placeholder-no-public-output.json");
if (approved.approved_record_count !== 0) fail("Approved record count must be 0.");
if (approved.public_output_allowed !== false) fail("Public output must be false.");
if (approved.generated_word_json_modified !== false) fail("Generated word JSON must not be modified.");

const acquisition = readJson("data/knowledge-base/word-of-day/ag69c-source-acquisition-plan.json");
if (acquisition.source_fetching_performed_now !== false) fail("Source fetching must not occur in AG69C.");
if (acquisition.source_content_saved_now !== false) fail("Source content saving must not occur in AG69C.");

const readiness = readJson("data/content-intelligence/quality-registry/ag69c-ag69d-source-acquisition-readiness-record.json");
if (readiness.ready_for_ag69d !== true) fail("AG69D readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag69c-to-ag69d-source-acquisition-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("Next stage must not auto-start.");
for (const blocked of [
  "bulk copyrighted source ingestion",
  "approved word bank creation without source review",
  "generated/word-of-day.json replacement",
  "public use of candidate or reviewed word records",
  "Supabase/database writes",
  "public attribution of internal study influence",
  "V02 expansion"
]) {
  if (!boundary.blocked_scope_without_explicit_approval.includes(blocked)) fail(`Boundary blocker missing: ${blocked}`);
}

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag69c-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag69c-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG69C Word source review, linguistic discipline and approved-bank validator is present.");
pass("Internal textual discipline gate is valid and public attribution remains blocked.");
pass("Published-work candidate handling is defined without adding public attribution.");
pass("Candidate records are assessed but remain candidate-only.");
pass("Approved bank remains empty and no generated word output is changed.");
pass("No source fetching, Supabase/database/backend/service-role/V02 activation is recorded.");
