import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag18b-controlled-real-static-activation-plan-audit.json",
  "data/content-intelligence/audit-records/ag18b-controlled-real-static-activation-plan-audit-report.json",
  "data/content-intelligence/go-live/ag18b-first-candidate-file-delta-dry-run-readiness-decision-record.json",
  "data/content-intelligence/quality-registry/ag18b-real-static-activation-safety-record.json",
  "data/content-intelligence/quality-registry/ag18b-first-candidate-file-delta-dry-run-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag18b-to-ag18c-first-public-candidate-file-delta-dry-run-boundary.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",

  "data/content-intelligence/quality-reviews/ag18c-first-public-candidate-file-delta-dry-run.json",
  "data/content-intelligence/go-live/ag18c-candidate-readiness-dry-run.json",
  "data/content-intelligence/go-live/ag18c-public-filter-dry-run.json",
  "data/content-intelligence/go-live/ag18c-intended-file-delta-dry-run.json",
  "data/content-intelligence/go-live/ag18c-featured-reads-delta-dry-run.json",
  "data/content-intelligence/go-live/ag18c-category-listing-delta-dry-run.json",
  "data/content-intelligence/go-live/ag18c-homepage-card-delta-dry-run.json",
  "data/content-intelligence/go-live/ag18c-sitemap-feed-search-delta-dry-run.json",
  "data/content-intelligence/go-live/ag18c-rollback-smoke-test-dry-run.json",
  "data/content-intelligence/quality-registry/ag18c-first-public-candidate-file-delta-dry-run-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag18c-to-ag18d-first-public-candidate-file-delta-dry-run-audit-boundary.json",
  "data/content-intelligence/schema/first-public-candidate-file-delta-dry-run.schema.json",
  "data/content-intelligence/learning/ag18c-first-public-candidate-file-delta-dry-run-learning.json",
  "data/quality/ag18c-first-public-candidate-file-delta-dry-run.json",
  "data/quality/ag18c-first-public-candidate-file-delta-dry-run-preview.json",
  "docs/quality/AG18C_FIRST_PUBLIC_CANDIDATE_FILE_DELTA_DRY_RUN.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG18C validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag18bReview = readJson("data/content-intelligence/quality-reviews/ag18b-controlled-real-static-activation-plan-audit.json");
const ag18bAudit = readJson("data/content-intelligence/audit-records/ag18b-controlled-real-static-activation-plan-audit-report.json");
const ag18bDecision = readJson("data/content-intelligence/go-live/ag18b-first-candidate-file-delta-dry-run-readiness-decision-record.json");
const ag18bReadiness = readJson("data/content-intelligence/quality-registry/ag18b-first-candidate-file-delta-dry-run-readiness-record.json");
const ag18bBoundary = readJson("data/content-intelligence/mutation-plans/ag18b-to-ag18c-first-public-candidate-file-delta-dry-run-boundary.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");

const review = readJson("data/content-intelligence/quality-reviews/ag18c-first-public-candidate-file-delta-dry-run.json");
const candidate = readJson("data/content-intelligence/go-live/ag18c-candidate-readiness-dry-run.json");
const publicFilter = readJson("data/content-intelligence/go-live/ag18c-public-filter-dry-run.json");
const fileDelta = readJson("data/content-intelligence/go-live/ag18c-intended-file-delta-dry-run.json");
const featured = readJson("data/content-intelligence/go-live/ag18c-featured-reads-delta-dry-run.json");
const category = readJson("data/content-intelligence/go-live/ag18c-category-listing-delta-dry-run.json");
const homepage = readJson("data/content-intelligence/go-live/ag18c-homepage-card-delta-dry-run.json");
const sitemap = readJson("data/content-intelligence/go-live/ag18c-sitemap-feed-search-delta-dry-run.json");
const rollback = readJson("data/content-intelligence/go-live/ag18c-rollback-smoke-test-dry-run.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag18c-first-public-candidate-file-delta-dry-run-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag18c-to-ag18d-first-public-candidate-file-delta-dry-run-audit-boundary.json");
const schema = readJson("data/content-intelligence/schema/first-public-candidate-file-delta-dry-run.schema.json");
const learning = readJson("data/content-intelligence/learning/ag18c-first-public-candidate-file-delta-dry-run-learning.json");
const registry = readJson("data/quality/ag18c-first-public-candidate-file-delta-dry-run.json");
const preview = readJson("data/quality/ag18c-first-public-candidate-file-delta-dry-run-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG18C_FIRST_PUBLIC_CANDIDATE_FILE_DELTA_DRY_RUN.md"), "utf8");

for (const obj of [review, candidate, publicFilter, fileDelta, featured, category, homepage, sitemap, rollback, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG18C") fail(`module_id must be AG18C in ${obj.title || "object"}`);
}

if (ag18bReview.status !== "controlled_real_static_activation_plan_audit_passed_ready_for_ag18c_dry_run") fail("AG18B review status mismatch");
if (ag18bAudit.failed_checks.length !== 0) fail("AG18B failed checks must be zero");
if (ag18bDecision.decision.proceed_to_first_public_candidate_file_delta_dry_run !== true) fail("AG18B must approve AG18C dry-run");
if (ag18bDecision.decision.proceed_to_github_write !== false) fail("AG18B must block GitHub write");
if (ag18bDecision.decision.proceed_to_public_visibility_switch !== false) fail("AG18B must block visibility switch");
if (ag18bDecision.decision.proceed_to_public_index_mutation !== false) fail("AG18B must block public index mutation");
if (ag18bDecision.decision.proceed_to_deployment_trigger !== false) fail("AG18B must block deployment");
if (ag18bDecision.decision.proceed_to_publish_execution !== false) fail("AG18B must block publishing");
if (ag18bReadiness.ready_for_ag18c !== true) fail("AG18B readiness for AG18C missing");
if (ag18bBoundary.next_stage_id !== "AG18C") fail("AG18C boundary missing in AG18B");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
const currentHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentHash !== ag13zCandidate.article_hash) fail("Seed candidate hash mismatch");

if (review.status !== "first_public_candidate_file_delta_dry_run_completed_ready_for_ag18d_audit") fail("Review status mismatch");
if (candidate.status !== "candidate_readiness_dry_run_completed_no_apply") fail("Candidate dry-run status mismatch");
if (publicFilter.status !== "public_filter_dry_run_completed_no_visibility_switch") fail("Public filter dry-run status mismatch");
if (fileDelta.status !== "intended_file_delta_dry_run_completed_no_file_mutation") fail("File delta dry-run status mismatch");
if (featured.status !== "featured_reads_delta_dry_run_completed_no_mutation") fail("Featured Reads dry-run status mismatch");
if (category.status !== "category_listing_delta_dry_run_completed_no_mutation") fail("Category listing dry-run status mismatch");
if (homepage.status !== "homepage_card_delta_dry_run_completed_no_mutation") fail("Homepage dry-run status mismatch");
if (sitemap.status !== "sitemap_feed_search_delta_dry_run_completed_no_mutation") fail("Sitemap/feed/search dry-run status mismatch");
if (rollback.status !== "rollback_smoke_test_dry_run_completed_no_execution") fail("Rollback dry-run status mismatch");
if (readiness.status !== "ready_for_ag18d_first_public_candidate_file_delta_dry_run_audit") fail("Readiness status mismatch");

if (candidate.candidate.article_path !== articlePath) fail("Candidate article path mismatch");
if (candidate.candidate.article_hash !== currentHash) fail("Candidate article hash mismatch");
if (candidate.current_state_assessment.ready_for_real_apply_now !== false) fail("Candidate must not be ready for real apply now");
for (const [key, value] of Object.entries(candidate.mutation_state_now)) {
  if (value !== false) fail(`Candidate mutation state must remain false: ${key}`);
}

if (publicFilter.current_public_filter_result.passed !== false) fail("Current public filter must fail");
if (publicFilter.current_public_filter_result.public_exposure_allowed_now !== false) fail("Public exposure must not be allowed now");
if (publicFilter.hypothetical_future_public_filter_result.passed !== true) fail("Hypothetical future public filter should model pass");
if (publicFilter.hypothetical_future_public_filter_result.public_exposure_allowed_now !== false) fail("Hypothetical future pass must still not expose now");

if (fileDelta.intended_delta_summary.real_file_mutation_performed !== false) fail("File mutation must not occur");
if (fileDelta.intended_delta_summary.git_write_performed !== false) fail("Git write must not occur");
if (fileDelta.intended_delta_summary.deployment_triggered !== false) fail("Deployment must not occur");
if (!fileDelta.intended_delta_targets_preview.every((target) => target.mutation_now === false)) fail("All delta targets must be no-mutation");

if (featured.mutation_now !== false || featured.featured_reads_index_mutated !== false) fail("Featured Reads must not mutate");
if (category.mutation_now !== false || category.category_listing_mutated !== false) fail("Category listing must not mutate");
if (homepage.mutation_now !== false || homepage.homepage_mutated !== false) fail("Homepage must not mutate");
if (sitemap.sitemap_feed_search_mutated !== false) fail("Sitemap/feed/search must not mutate");
if (!sitemap.preview_targets.every((target) => target.mutation_now === false)) fail("Sitemap/feed/search preview targets must not mutate");

if (rollback.rollback_preview.rollback_executed_now !== false) fail("Rollback must not execute");
if (rollback.smoke_test_preview.smoke_test_executed_now !== false) fail("Smoke test must not execute");

if (readiness.ready_for_ag18d !== true) fail("AG18D readiness missing");
if (readiness.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must remain deferred");
if (readiness.github_token_ready !== false) fail("GitHub token must remain blocked");
if (readiness.github_write_ready !== false) fail("GitHub write must remain blocked");
if (readiness.public_visibility_switch_ready !== false) fail("Visibility switch must remain blocked");
if (readiness.public_index_mutation_ready !== false) fail("Public index mutation must remain blocked");
if (readiness.deployment_trigger_ready !== false) fail("Deployment trigger must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");

if (boundary.status !== "ag18d_boundary_created_not_started") fail("AG18D boundary status mismatch");
if (boundary.next_stage_id !== "AG18D") fail("AG18D handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG18D explicit approval missing");
if (boundary.supabase_auth_defer_reminder_required_in_ag18d !== true) fail("AG18D must carry Supabase/Auth reminder");

if (schema.status !== "schema_first_public_candidate_file_delta_dry_run_only") fail("Schema status mismatch");

for (const key of [
  "candidate_readiness_dry_run_allowed_in_ag18c",
  "public_filter_dry_run_allowed_in_ag18c",
  "intended_file_delta_dry_run_allowed_in_ag18c",
  "featured_reads_delta_dry_run_allowed_in_ag18c",
  "category_listing_delta_dry_run_allowed_in_ag18c",
  "homepage_card_delta_dry_run_allowed_in_ag18c",
  "sitemap_feed_search_delta_dry_run_allowed_in_ag18c",
  "rollback_smoke_test_dry_run_allowed_in_ag18c",
  "ag18d_boundary_allowed_in_ag18c"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_generation_allowed_in_ag18c",
  "article_mutation_allowed_in_ag18c",
  "queue_mutation_allowed_in_ag18c",
  "active_admin_review_queue_record_creation_allowed_in_ag18c",
  "queue_index_mutation_allowed_in_ag18c",
  "admin_action_execution_allowed_in_ag18c",
  "editor_action_execution_allowed_in_ag18c",
  "auth_activation_allowed_in_ag18c",
  "backend_activation_allowed_in_ag18c",
  "supabase_activation_allowed_in_ag18c",
  "github_token_creation_or_exposure_allowed_in_ag18c",
  "github_write_operation_allowed_in_ag18c",
  "public_visibility_switch_allowed_in_ag18c",
  "public_index_mutation_allowed_in_ag18c",
  "public_publishing_operation_allowed_in_ag18c",
  "deployment_trigger_allowed_in_ag18c"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, candidate, publicFilter, fileDelta, featured, category, homepage, sitemap, rollback, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.first_public_candidate_file_delta_dry_run_only !== true) fail(`${obj.title || "object"} must be AG18C dry-run-only`);
  if (obj.article_generation_performed_in_ag18c !== false) fail(`${obj.title || "object"} must not generate articles`);
  if (obj.article_mutation_performed_in_ag18c !== false) fail(`${obj.title || "object"} must not mutate articles`);
  if (obj.github_token_created_or_exposed_in_ag18c !== false) fail(`${obj.title || "object"} must not create/expose token`);
  if (obj.github_write_operation_performed_in_ag18c !== false) fail(`${obj.title || "object"} must not write to GitHub`);
  if (obj.public_visibility_switch_performed_in_ag18c !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag18c !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.deployment_trigger_performed_in_ag18c !== false) fail(`${obj.title || "object"} must not trigger deployment`);
  if (obj.public_publishing_operation_performed_in_ag18c !== false) fail(`${obj.title || "object"} must not publish`);
  if (obj.supabase_activation_performed_in_ag18c !== false) fail(`${obj.title || "object"} must not activate Supabase`);
}

for (const phrase of ["Purpose", "Dry-run Outputs", "Decision State", "Supabase/Auth Reminder", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG18C document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag18c", "validate:ag18c"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag18c")) {
  fail("validate:project must include validate:ag18c");
}

pass("AG18C registry is present.");
pass("AG18C document is present.");
pass("AG18C review, candidate dry-run, public filter dry-run, intended file delta dry-run, public surface delta dry-runs, rollback/smoke-test dry-run, readiness, AG18D boundary, schema, learning and preview are present.");
pass("AG18B controlled real static activation plan audit is consumed.");
pass("Candidate readiness and public filter dry-runs completed without apply.");
pass("Featured Reads, category, homepage and sitemap/feed/search deltas are preview-only.");
pass("Rollback and smoke-test dry-runs completed without execution.");
pass("GitHub token, GitHub write, visibility switch, public index mutation, deployment and publishing remain blocked.");
pass("Supabase/Auth/backend remains deferred and reminder is carried forward.");
pass("AG18D First Public Candidate and File Delta Dry-run Audit boundary is created with explicit approval required.");
pass("AG18C is First Public Candidate and File Delta Dry-run only.");
