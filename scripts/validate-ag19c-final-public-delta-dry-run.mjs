import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag19b-pre-apply-readiness-audit.json",
  "data/content-intelligence/audit-records/ag19b-pre-apply-readiness-audit-report.json",
  "data/content-intelligence/go-live/ag19b-final-public-delta-dry-run-readiness-decision-record.json",
  "data/content-intelligence/quality-registry/ag19b-pre-apply-safety-record.json",
  "data/content-intelligence/quality-registry/ag19b-final-public-delta-dry-run-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag19b-to-ag19c-final-public-delta-dry-run-boundary.json",
  "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",

  "data/content-intelligence/quality-reviews/ag19c-final-public-delta-dry-run.json",
  "data/content-intelligence/go-live/ag19c-final-public-delta-dry-run-record.json",
  "data/content-intelligence/go-live/ag19c-before-after-public-surface-preview.json",
  "data/content-intelligence/go-live/ag19c-featured-reads-final-delta-preview.json",
  "data/content-intelligence/go-live/ag19c-category-listing-final-delta-preview.json",
  "data/content-intelligence/go-live/ag19c-homepage-card-final-delta-preview.json",
  "data/content-intelligence/go-live/ag19c-sitemap-feed-search-final-delta-preview.json",
  "data/content-intelligence/go-live/ag19c-rollback-smoke-test-final-preview.json",
  "data/content-intelligence/quality-registry/ag19c-final-public-delta-dry-run-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag19c-to-ag19d-final-public-delta-dry-run-audit-boundary.json",
  "data/content-intelligence/schema/final-public-delta-dry-run.schema.json",
  "data/content-intelligence/learning/ag19c-final-public-delta-dry-run-learning.json",
  "data/quality/ag19c-final-public-delta-dry-run.json",
  "data/quality/ag19c-final-public-delta-dry-run-preview.json",
  "docs/quality/AG19C_FINAL_PUBLIC_DELTA_DRY_RUN.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG19C validation failed: ${message}`);
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

function hashPairMatchesCurrentOrAg12cR1Repair(leftHash, rightHash, articlePath = null) {
  if (leftHash === rightHash) return true;

  const ag12cR1ApplyPath = path.join(root, "data/content-intelligence/apply-records/ag12c-r1-public-object-label-layout-repair.json");
  if (!fs.existsSync(ag12cR1ApplyPath)) return false;

  try {
    const ag12cR1Apply = JSON.parse(fs.readFileSync(ag12cR1ApplyPath, "utf8"));

    const articlePathMatches =
      articlePath === null ||
      articlePath === undefined ||
      ag12cR1Apply.selected_article_path === articlePath;

    if (!articlePathMatches) return false;

    return (
      ag12cR1Apply.status === "public_object_label_layout_repair_applied" &&
      (
        (
          ag12cR1Apply.pre_repair_hash === leftHash &&
          ag12cR1Apply.post_repair_hash === rightHash
        ) ||
        (
          ag12cR1Apply.pre_repair_hash === rightHash &&
          ag12cR1Apply.post_repair_hash === leftHash
        )
      )
    );
  } catch {
    return false;
  }
}


for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag19bReview = readJson("data/content-intelligence/quality-reviews/ag19b-pre-apply-readiness-audit.json");
const ag19bAudit = readJson("data/content-intelligence/audit-records/ag19b-pre-apply-readiness-audit-report.json");
const ag19bDecision = readJson("data/content-intelligence/go-live/ag19b-final-public-delta-dry-run-readiness-decision-record.json");
const ag19bReadiness = readJson("data/content-intelligence/quality-registry/ag19b-final-public-delta-dry-run-readiness-record.json");
const ag19bBoundary = readJson("data/content-intelligence/mutation-plans/ag19b-to-ag19c-final-public-delta-dry-run-boundary.json");
const ag17bReminder = readJson("data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");

const review = readJson("data/content-intelligence/quality-reviews/ag19c-final-public-delta-dry-run.json");
const finalDelta = readJson("data/content-intelligence/go-live/ag19c-final-public-delta-dry-run-record.json");
const beforeAfter = readJson("data/content-intelligence/go-live/ag19c-before-after-public-surface-preview.json");
const featured = readJson("data/content-intelligence/go-live/ag19c-featured-reads-final-delta-preview.json");
const category = readJson("data/content-intelligence/go-live/ag19c-category-listing-final-delta-preview.json");
const homepage = readJson("data/content-intelligence/go-live/ag19c-homepage-card-final-delta-preview.json");
const sitemap = readJson("data/content-intelligence/go-live/ag19c-sitemap-feed-search-final-delta-preview.json");
const rollback = readJson("data/content-intelligence/go-live/ag19c-rollback-smoke-test-final-preview.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag19c-final-public-delta-dry-run-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag19c-to-ag19d-final-public-delta-dry-run-audit-boundary.json");
const schema = readJson("data/content-intelligence/schema/final-public-delta-dry-run.schema.json");
const learning = readJson("data/content-intelligence/learning/ag19c-final-public-delta-dry-run-learning.json");
const registry = readJson("data/quality/ag19c-final-public-delta-dry-run.json");
const preview = readJson("data/quality/ag19c-final-public-delta-dry-run-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG19C_FINAL_PUBLIC_DELTA_DRY_RUN.md"), "utf8");

for (const obj of [review, finalDelta, beforeAfter, featured, category, homepage, sitemap, rollback, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG19C") fail(`module_id must be AG19C in ${obj.title || "object"}`);
}

if (ag19bReview.status !== "pre_apply_readiness_audit_passed_ready_for_ag19c_final_public_delta_dry_run") fail("AG19B review status mismatch");
if (ag19bAudit.failed_checks.length !== 0) fail("AG19B failed checks must be zero");
if (ag19bDecision.decision.proceed_to_final_public_delta_dry_run !== true) fail("AG19B must approve AG19C dry-run");
if (ag19bReadiness.ready_for_ag19c !== true) fail("AG19B readiness for AG19C missing");
if (ag19bBoundary.next_stage_id !== "AG19C") fail("AG19C boundary missing in AG19B");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
const currentHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (!hashPairMatchesCurrentOrAg12cR1Repair(currentHash, ag13zCandidate.article_hash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Seed candidate hash mismatch or AG12C-R1 repaired article state missing");

if (review.status !== "final_public_delta_dry_run_completed_ready_for_ag19d_audit") fail("Review status mismatch");
if (finalDelta.status !== "final_public_delta_dry_run_completed_no_mutation") fail("Final delta dry-run status mismatch");
if (beforeAfter.status !== "before_after_public_surface_preview_completed_no_mutation") fail("Before/after preview status mismatch");
if (featured.status !== "featured_reads_final_delta_preview_completed_no_mutation") fail("Featured preview status mismatch");
if (category.status !== "category_listing_final_delta_preview_completed_no_mutation") fail("Category preview status mismatch");
if (homepage.status !== "homepage_card_final_delta_preview_completed_no_mutation") fail("Homepage preview status mismatch");
if (sitemap.status !== "sitemap_feed_search_final_delta_preview_completed_no_mutation") fail("Sitemap/feed/search preview status mismatch");
if (rollback.status !== "rollback_smoke_test_final_preview_completed_no_execution") fail("Rollback/smoke preview status mismatch");

if (finalDelta.candidate_article_path !== articlePath) fail("Candidate article path mismatch");
if (!hashPairMatchesCurrentOrAg12cR1Repair(finalDelta.candidate_article_hash, currentHash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Candidate article hash mismatch or AG12C-R1 repaired article state missing");
if (!finalDelta.proposed_public_targets_preview.every((target) => target.exact_file_mutation_now === false && target.apply_now === false)) {
  fail("All final public targets must remain no-mutation/no-apply");
}
for (const [key, value] of Object.entries(finalDelta.dry_run_result)) {
  if (key === "final_delta_preview_completed") {
    if (value !== true) fail("Final delta preview must be completed");
  } else if (value !== false) {
    fail(`Final delta execution state must remain false: ${key}`);
  }
}

for (const [key, value] of Object.entries(beforeAfter.actual_after_state_now)) {
  if (value !== false) fail(`Actual after-state must remain false: ${key}`);
}
if (beforeAfter.mutation_now !== false) fail("Before/after preview must not mutate");

if (featured.mutation_now !== false || featured.featured_reads_index_mutated !== false || featured.preview_card.include_now !== false) fail("Featured Reads must not mutate/include now");
if (category.mutation_now !== false || category.category_listing_mutated !== false || category.preview_listing.include_now !== false) fail("Category listing must not mutate/include now");
if (homepage.mutation_now !== false || homepage.homepage_mutated !== false || homepage.homepage_card_preview.include_now !== false) fail("Homepage must not mutate/include now");
if (sitemap.sitemap_feed_search_mutated !== false) fail("Sitemap/feed/search must not mutate");
if (!sitemap.preview_targets.every((target) => target.include_now === false && target.mutation_now === false)) fail("Sitemap/feed/search preview targets must not include/mutate now");

if (rollback.rollback_preview.rollback_executed_now !== false) fail("Rollback must not execute");
if (rollback.smoke_test_preview.smoke_test_executed_now !== false) fail("Smoke test must not execute");

if (readiness.status !== "ready_for_ag19d_final_public_delta_dry_run_audit") fail("Readiness status mismatch");
if (readiness.ready_for_ag19d !== true) fail("AG19D readiness missing");
if (readiness.final_public_delta_dry_run_completed !== true) fail("Final public delta dry-run completion missing");
if (readiness.github_token_ready !== false) fail("GitHub token must remain blocked");
if (readiness.github_write_ready !== false) fail("GitHub write must remain blocked");
if (readiness.candidate_apply_ready !== false) fail("Candidate apply must remain blocked");
if (readiness.public_visibility_switch_ready !== false) fail("Visibility switch must remain blocked");
if (readiness.public_index_mutation_ready !== false) fail("Public index mutation must remain blocked");
if (readiness.deployment_trigger_ready !== false) fail("Deployment must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");

if (boundary.status !== "ag19d_boundary_created_not_started") fail("AG19D boundary status mismatch");
if (boundary.next_stage_id !== "AG19D") fail("AG19D handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG19D explicit approval missing");
if (boundary.supabase_auth_defer_reminder_required_in_ag19d !== true) fail("AG19D must carry Supabase/Auth reminder");

if (schema.status !== "schema_final_public_delta_dry_run_only") fail("Schema status mismatch");
for (const key of [
  "final_public_delta_dry_run_allowed_in_ag19c",
  "before_after_public_surface_preview_allowed_in_ag19c",
  "featured_reads_delta_preview_allowed_in_ag19c",
  "category_listing_delta_preview_allowed_in_ag19c",
  "homepage_card_delta_preview_allowed_in_ag19c",
  "sitemap_feed_search_delta_preview_allowed_in_ag19c",
  "rollback_smoke_test_final_preview_allowed_in_ag19c",
  "ag19d_boundary_allowed_in_ag19c"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}
for (const key of [
  "article_generation_allowed_in_ag19c",
  "article_mutation_allowed_in_ag19c",
  "queue_mutation_allowed_in_ag19c",
  "admin_action_execution_allowed_in_ag19c",
  "editor_action_execution_allowed_in_ag19c",
  "auth_activation_allowed_in_ag19c",
  "backend_activation_allowed_in_ag19c",
  "supabase_activation_allowed_in_ag19c",
  "github_token_creation_or_exposure_allowed_in_ag19c",
  "github_write_operation_allowed_in_ag19c",
  "public_visibility_switch_allowed_in_ag19c",
  "public_index_mutation_allowed_in_ag19c",
  "public_publishing_operation_allowed_in_ag19c",
  "deployment_trigger_allowed_in_ag19c"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, finalDelta, beforeAfter, featured, category, homepage, sitemap, rollback, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.final_public_delta_dry_run_only !== true) fail(`${obj.title || "object"} must be AG19C dry-run-only`);
  if (obj.article_generation_performed_in_ag19c !== false) fail(`${obj.title || "object"} must not generate articles`);
  if (obj.article_mutation_performed_in_ag19c !== false) fail(`${obj.title || "object"} must not mutate articles`);
  if (obj.github_token_created_or_exposed_in_ag19c !== false) fail(`${obj.title || "object"} must not create/expose token`);
  if (obj.github_write_operation_performed_in_ag19c !== false) fail(`${obj.title || "object"} must not write to GitHub`);
  if (obj.public_visibility_switch_performed_in_ag19c !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag19c !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.deployment_trigger_performed_in_ag19c !== false) fail(`${obj.title || "object"} must not trigger deployment`);
  if (obj.public_publishing_operation_performed_in_ag19c !== false) fail(`${obj.title || "object"} must not publish`);
  if (obj.supabase_activation_performed_in_ag19c !== false) fail(`${obj.title || "object"} must not activate Supabase`);
}

if (!ag17bReminder.reminder.includes("static/GitHub-controlled go-live first")) fail("Supabase reminder must mention static/GitHub first");
if (!ag17bReminder.reminder.includes("Supabase/Auth/backend later")) fail("Supabase reminder must mention Supabase/Auth/backend later");

for (const phrase of ["Purpose", "Dry-run Outputs", "Decision State", "Supabase/Auth Reminder", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG19C document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag19c", "validate:ag19c"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag19c")) {
  fail("validate:project must include validate:ag19c");
}

pass("AG19C registry is present.");
pass("AG19C document is present.");
pass("AG19C review, final delta dry-run, before/after preview, public surface previews, rollback/smoke-test preview, readiness, AG19D boundary, schema, learning and preview are present.");
pass("AG19B pre-apply readiness audit is consumed.");
pass("Final public delta dry-run completed without mutation.");
pass("Featured Reads, category, homepage and sitemap/feed/search previews remain non-active.");
pass("Rollback and smoke-test final preview completed without execution.");
pass("No GitHub token, GitHub write, visibility switch, public index mutation, deployment or publishing occurred.");
pass("Supabase/Auth/backend remains deferred and reminder is carried forward.");
pass("AG19D Final Public Delta Dry-run Audit boundary is created with explicit approval required.");
pass("AG19C is Final Public Delta Dry-run only.");
