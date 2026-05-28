import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
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
  "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",

  "data/content-intelligence/quality-reviews/ag19d-final-public-delta-dry-run-audit.json",
  "data/content-intelligence/audit-records/ag19d-final-public-delta-dry-run-audit-report.json",
  "data/content-intelligence/go-live/ag19d-first-static-activation-approval-package-readiness-decision-record.json",
  "data/content-intelligence/quality-registry/ag19d-final-public-delta-dry-run-safety-record.json",
  "data/content-intelligence/quality-registry/ag19d-first-static-activation-approval-package-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag19d-to-ag19e-first-static-activation-approval-package-boundary.json",
  "data/content-intelligence/schema/final-public-delta-dry-run-audit.schema.json",
  "data/content-intelligence/learning/ag19d-final-public-delta-dry-run-audit-learning.json",
  "data/quality/ag19d-final-public-delta-dry-run-audit.json",
  "data/quality/ag19d-final-public-delta-dry-run-audit-preview.json",
  "docs/quality/AG19D_FINAL_PUBLIC_DELTA_DRY_RUN_AUDIT.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG19D validation failed: ${message}`);
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

const ag19cReview = readJson("data/content-intelligence/quality-reviews/ag19c-final-public-delta-dry-run.json");
const ag19cFinalDelta = readJson("data/content-intelligence/go-live/ag19c-final-public-delta-dry-run-record.json");
const ag19cBeforeAfter = readJson("data/content-intelligence/go-live/ag19c-before-after-public-surface-preview.json");
const ag19cFeatured = readJson("data/content-intelligence/go-live/ag19c-featured-reads-final-delta-preview.json");
const ag19cCategory = readJson("data/content-intelligence/go-live/ag19c-category-listing-final-delta-preview.json");
const ag19cHomepage = readJson("data/content-intelligence/go-live/ag19c-homepage-card-final-delta-preview.json");
const ag19cSitemap = readJson("data/content-intelligence/go-live/ag19c-sitemap-feed-search-final-delta-preview.json");
const ag19cRollback = readJson("data/content-intelligence/go-live/ag19c-rollback-smoke-test-final-preview.json");
const ag19cReadiness = readJson("data/content-intelligence/quality-registry/ag19c-final-public-delta-dry-run-audit-readiness-record.json");
const ag19cBoundary = readJson("data/content-intelligence/mutation-plans/ag19c-to-ag19d-final-public-delta-dry-run-audit-boundary.json");
const ag17bReminder = readJson("data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");

const review = readJson("data/content-intelligence/quality-reviews/ag19d-final-public-delta-dry-run-audit.json");
const audit = readJson("data/content-intelligence/audit-records/ag19d-final-public-delta-dry-run-audit-report.json");
const decision = readJson("data/content-intelligence/go-live/ag19d-first-static-activation-approval-package-readiness-decision-record.json");
const safety = readJson("data/content-intelligence/quality-registry/ag19d-final-public-delta-dry-run-safety-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag19d-first-static-activation-approval-package-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag19d-to-ag19e-first-static-activation-approval-package-boundary.json");
const schema = readJson("data/content-intelligence/schema/final-public-delta-dry-run-audit.schema.json");
const learning = readJson("data/content-intelligence/learning/ag19d-final-public-delta-dry-run-audit-learning.json");
const registry = readJson("data/quality/ag19d-final-public-delta-dry-run-audit.json");
const preview = readJson("data/quality/ag19d-final-public-delta-dry-run-audit-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG19D_FINAL_PUBLIC_DELTA_DRY_RUN_AUDIT.md"), "utf8");

for (const obj of [review, audit, decision, safety, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG19D") fail(`module_id must be AG19D in ${obj.title || "object"}`);
}

if (ag19cReview.status !== "final_public_delta_dry_run_completed_ready_for_ag19d_audit") fail("AG19C review status mismatch");
if (ag19cReadiness.ready_for_ag19d !== true) fail("AG19C readiness for AG19D missing");
if (ag19cBoundary.next_stage_id !== "AG19D") fail("AG19D boundary missing in AG19C");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
const currentHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (!hashPairMatchesCurrentOrAg12cR1Repair(currentHash, ag13zCandidate.article_hash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Seed candidate hash mismatch or AG12C-R1 repaired article state missing");

if (review.status !== "final_public_delta_dry_run_audit_passed_ready_for_ag19e_approval_package") fail("Review status mismatch");
if (audit.status !== "final_public_delta_dry_run_audit_passed") fail("Audit status mismatch");
if (decision.status !== "final_public_delta_dry_run_audit_passed_ready_for_ag19e_approval_package") fail("Decision status mismatch");
if (safety.status !== "final_public_delta_dry_run_safe_for_approval_package_only") fail("Safety status mismatch");
if (readiness.status !== "ready_for_ag19e_first_static_activation_approval_package") fail("Readiness status mismatch");

if (!Array.isArray(audit.checks) || audit.checks.length !== 13) fail("AG19D audit must include thirteen checks");
if (audit.failed_checks.length !== 0) fail("AG19D failed checks must be zero");
if (audit.decision.ag19c_final_delta_dry_run_valid !== true) fail("AG19C final delta dry-run must be valid");
if (audit.decision.ready_for_first_static_activation_approval_package !== true) fail("AG19E approval package readiness missing");

if (ag19cFinalDelta.candidate_article_path !== articlePath) fail("Candidate article path mismatch");
if (!hashPairMatchesCurrentOrAg12cR1Repair(ag19cFinalDelta.candidate_article_hash, currentHash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Candidate article hash mismatch or AG12C-R1 repaired article state missing");
if (!ag19cFinalDelta.proposed_public_targets_preview.every((target) => target.exact_file_mutation_now === false && target.apply_now === false)) fail("Final delta targets must remain no-mutation/no-apply");
if (ag19cFinalDelta.dry_run_result.final_delta_preview_completed !== true) fail("Final delta preview must be completed");
for (const key of [
  "exact_files_selected_for_real_apply_now",
  "real_file_delta_generated_now",
  "git_write_performed_now",
  "public_visibility_switched_now",
  "public_index_mutated_now",
  "deployment_triggered_now",
  "published_now"
]) {
  if (ag19cFinalDelta.dry_run_result[key] !== false) fail(`Final delta execution state must remain false: ${key}`);
}

if (!Object.values(ag19cBeforeAfter.actual_after_state_now).every((value) => value === false)) fail("Actual after-state must remain false");
if (ag19cBeforeAfter.mutation_now !== false) fail("Before/after preview must not mutate");
if (ag19cFeatured.preview_card.include_now !== false || ag19cFeatured.featured_reads_index_mutated !== false) fail("Featured preview must not include/mutate now");
if (ag19cCategory.preview_listing.include_now !== false || ag19cCategory.category_listing_mutated !== false) fail("Category preview must not include/mutate now");
if (ag19cHomepage.homepage_card_preview.include_now !== false || ag19cHomepage.homepage_mutated !== false) fail("Homepage preview must not include/mutate now");
if (ag19cSitemap.sitemap_feed_search_mutated !== false) fail("Sitemap/feed/search must not mutate");
if (!ag19cSitemap.preview_targets.every((target) => target.include_now === false && target.mutation_now === false)) fail("Sitemap/feed/search targets must not include/mutate now");
if (ag19cRollback.rollback_preview.rollback_executed_now !== false) fail("Rollback must not execute");
if (ag19cRollback.smoke_test_preview.smoke_test_executed_now !== false) fail("Smoke test must not execute");

if (decision.decision.proceed_to_first_static_activation_approval_package !== true) fail("Decision must approve AG19E approval package");
for (const key of [
  "proceed_to_real_candidate_apply",
  "proceed_to_github_token_creation",
  "proceed_to_github_write",
  "proceed_to_public_visibility_switch",
  "proceed_to_public_index_mutation",
  "proceed_to_deployment_trigger",
  "proceed_to_publish_execution",
  "proceed_to_supabase_auth_backend_activation"
]) {
  if (decision.decision[key] !== false) fail(`Decision must block ${key}`);
}
if (decision.recommended_next_stage !== "AG19E") fail("Recommended next stage must be AG19E");

if (safety.safety_assertions.first_static_activation_approval_package_allowed !== true) fail("Safety must allow only approval package");
for (const key of [
  "candidate_real_apply_enabled",
  "github_token_created",
  "github_token_exposed",
  "github_token_wired",
  "github_write_enabled",
  "article_mutation_enabled",
  "queue_mutation_enabled",
  "public_visibility_switch_enabled",
  "public_index_mutation_enabled",
  "deployment_trigger_enabled",
  "publishing_enabled",
  "admin_editor_execution_enabled"
]) {
  if (safety.safety_assertions[key] !== false) fail(`Safety must block ${key}`);
}

if (readiness.ready_for_ag19e !== true) fail("AG19E readiness missing");
if (readiness.final_public_delta_dry_run_audit_passed !== true) fail("Audit pass readiness missing");
if (readiness.first_static_activation_approval_package_ready !== true) fail("Approval package readiness missing");
if (readiness.github_token_ready !== false) fail("GitHub token must remain blocked");
if (readiness.github_write_ready !== false) fail("GitHub write must remain blocked");
if (readiness.candidate_apply_ready !== false) fail("Candidate apply must remain blocked");
if (readiness.public_visibility_switch_ready !== false) fail("Visibility switch must remain blocked");
if (readiness.public_index_mutation_ready !== false) fail("Public index mutation must remain blocked");
if (readiness.deployment_trigger_ready !== false) fail("Deployment trigger must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");

if (boundary.status !== "ag19e_boundary_created_not_started") fail("AG19E boundary status mismatch");
if (boundary.next_stage_id !== "AG19E") fail("AG19E handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG19E explicit approval missing");
if (boundary.supabase_auth_defer_reminder_required_in_ag19e !== true) fail("AG19E must carry Supabase/Auth reminder");

if (schema.status !== "schema_final_public_delta_dry_run_audit_only") fail("Schema status mismatch");
for (const key of [
  "final_public_delta_dry_run_audit_allowed_in_ag19d",
  "approval_package_decision_allowed_in_ag19d",
  "safety_record_allowed_in_ag19d",
  "ag19e_boundary_allowed_in_ag19d"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}
for (const key of [
  "article_generation_allowed_in_ag19d",
  "article_mutation_allowed_in_ag19d",
  "queue_mutation_allowed_in_ag19d",
  "admin_action_execution_allowed_in_ag19d",
  "editor_action_execution_allowed_in_ag19d",
  "auth_activation_allowed_in_ag19d",
  "backend_activation_allowed_in_ag19d",
  "supabase_activation_allowed_in_ag19d",
  "github_token_creation_or_exposure_allowed_in_ag19d",
  "github_write_operation_allowed_in_ag19d",
  "public_visibility_switch_allowed_in_ag19d",
  "public_index_mutation_allowed_in_ag19d",
  "public_publishing_operation_allowed_in_ag19d",
  "deployment_trigger_allowed_in_ag19d"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, audit, decision, safety, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.final_public_delta_dry_run_audit_only !== true) fail(`${obj.title || "object"} must be AG19D audit-only`);
  if (obj.article_generation_performed_in_ag19d !== false) fail(`${obj.title || "object"} must not generate articles`);
  if (obj.article_mutation_performed_in_ag19d !== false) fail(`${obj.title || "object"} must not mutate articles`);
  if (obj.github_token_created_or_exposed_in_ag19d !== false) fail(`${obj.title || "object"} must not create/expose token`);
  if (obj.github_write_operation_performed_in_ag19d !== false) fail(`${obj.title || "object"} must not write to GitHub`);
  if (obj.public_visibility_switch_performed_in_ag19d !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag19d !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.deployment_trigger_performed_in_ag19d !== false) fail(`${obj.title || "object"} must not trigger deployment`);
  if (obj.public_publishing_operation_performed_in_ag19d !== false) fail(`${obj.title || "object"} must not publish`);
  if (obj.supabase_activation_performed_in_ag19d !== false) fail(`${obj.title || "object"} must not activate Supabase`);
}

if (!ag17bReminder.reminder.includes("static/GitHub-controlled go-live first")) fail("Supabase reminder must mention static/GitHub first");
if (!ag17bReminder.reminder.includes("Supabase/Auth/backend later")) fail("Supabase reminder must mention Supabase/Auth/backend later");

for (const phrase of ["Purpose", "Audit Result", "Decision", "Supabase/Auth Reminder", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG19D document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag19d", "validate:ag19d"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag19d")) {
  fail("validate:project must include validate:ag19d");
}

pass("AG19D registry is present.");
pass("AG19D document is present.");
pass("AG19D review, audit report, approval package decision, safety, readiness, AG19E boundary, schema, learning and preview are present.");
pass("AG19C final public delta dry-run is consumed.");
pass("Final public delta dry-run audit passed with zero failed checks.");
pass("Public surface previews remain non-active and non-mutating.");
pass("Rollback and smoke-test preview remain non-executing.");
pass("No candidate apply, GitHub token, GitHub write, visibility switch, public index mutation, deployment or publishing occurred.");
pass("Supabase/Auth/backend remains deferred and reminder is carried forward.");
pass("AG19E First Static Activation Approval Package boundary is created with explicit approval required.");
pass("AG19D is Final Public Delta Dry-run Audit only.");
