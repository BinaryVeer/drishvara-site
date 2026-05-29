import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
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
  "data/content-intelligence/quality-registry/ag18b-real-static-activation-safety-record.json",
  "data/content-intelligence/go-live/ag18b-first-candidate-file-delta-dry-run-readiness-decision-record.json",
  "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",

  "data/content-intelligence/quality-reviews/ag18d-first-public-candidate-file-delta-dry-run-audit.json",
  "data/content-intelligence/audit-records/ag18d-first-public-candidate-file-delta-dry-run-audit-report.json",
  "data/content-intelligence/go-live/ag18d-non-active-real-static-activation-scaffold-readiness-decision-record.json",
  "data/content-intelligence/quality-registry/ag18d-file-delta-dry-run-safety-record.json",
  "data/content-intelligence/quality-registry/ag18d-non-active-real-static-activation-scaffold-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag18d-to-ag18e-non-active-real-static-activation-scaffold-boundary.json",
  "data/content-intelligence/schema/first-public-candidate-file-delta-dry-run-audit.schema.json",
  "data/content-intelligence/learning/ag18d-first-public-candidate-file-delta-dry-run-audit-learning.json",
  "data/quality/ag18d-first-public-candidate-file-delta-dry-run-audit.json",
  "data/quality/ag18d-first-public-candidate-file-delta-dry-run-audit-preview.json",
  "docs/quality/AG18D_FIRST_PUBLIC_CANDIDATE_FILE_DELTA_DRY_RUN_AUDIT.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG18D validation failed: ${message}`);
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

function articleHashAcceptedByRepairChain(recordedHash, currentHash, articlePath = null) {
  if (recordedHash === currentHash) return true;

  const repairRecords = [
    {
      path: "data/content-intelligence/apply-records/ag12c-r1-public-object-label-layout-repair.json",
      status: "public_object_label_layout_repair_applied"
    },
    {
      path: "data/content-intelligence/apply-records/ar01-r1-credit-reference-surface-cleanup.json",
      status: "credit_reference_surface_cleanup_applied"
    }
  ];

  const edges = [];

  for (const repairRecord of repairRecords) {
    const fullRepairPath = path.join(root, repairRecord.path);
    if (!fs.existsSync(fullRepairPath)) continue;

    try {
      const record = JSON.parse(fs.readFileSync(fullRepairPath, "utf8"));
      const articlePathMatches =
        articlePath === null ||
        articlePath === undefined ||
        record.selected_article_path === articlePath;

      if (
        record.status === repairRecord.status &&
        articlePathMatches &&
        record.pre_repair_hash &&
        record.post_repair_hash
      ) {
        edges.push([record.pre_repair_hash, record.post_repair_hash]);
      }
    } catch {}
  }

  function canReach(start, target) {
    if (!start || !target) return false;

    let current = start;
    const seen = new Set([current]);

    for (let i = 0; i < edges.length + 3; i += 1) {
      if (current === target) return true;

      const edge = edges.find(([from]) => from === current);
      if (!edge) return false;

      current = edge[1];
      if (seen.has(current)) return false;
      seen.add(current);
    }

    return current === target;
  }

  return canReach(recordedHash, currentHash) || canReach(currentHash, recordedHash);
}

function hashPairMatchesCurrentOrAg12cR1Repair(leftHash, rightHash, articlePath = null) {
  return articleHashAcceptedByRepairChain(leftHash, rightHash, articlePath);
}


for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag18cReview = readJson("data/content-intelligence/quality-reviews/ag18c-first-public-candidate-file-delta-dry-run.json");
const ag18cCandidate = readJson("data/content-intelligence/go-live/ag18c-candidate-readiness-dry-run.json");
const ag18cPublicFilter = readJson("data/content-intelligence/go-live/ag18c-public-filter-dry-run.json");
const ag18cFileDelta = readJson("data/content-intelligence/go-live/ag18c-intended-file-delta-dry-run.json");
const ag18cFeatured = readJson("data/content-intelligence/go-live/ag18c-featured-reads-delta-dry-run.json");
const ag18cCategory = readJson("data/content-intelligence/go-live/ag18c-category-listing-delta-dry-run.json");
const ag18cHomepage = readJson("data/content-intelligence/go-live/ag18c-homepage-card-delta-dry-run.json");
const ag18cSitemap = readJson("data/content-intelligence/go-live/ag18c-sitemap-feed-search-delta-dry-run.json");
const ag18cRollback = readJson("data/content-intelligence/go-live/ag18c-rollback-smoke-test-dry-run.json");
const ag18cReadiness = readJson("data/content-intelligence/quality-registry/ag18c-first-public-candidate-file-delta-dry-run-audit-readiness-record.json");
const ag18cBoundary = readJson("data/content-intelligence/mutation-plans/ag18c-to-ag18d-first-public-candidate-file-delta-dry-run-audit-boundary.json");
const ag17bReminder = readJson("data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");

const review = readJson("data/content-intelligence/quality-reviews/ag18d-first-public-candidate-file-delta-dry-run-audit.json");
const audit = readJson("data/content-intelligence/audit-records/ag18d-first-public-candidate-file-delta-dry-run-audit-report.json");
const decision = readJson("data/content-intelligence/go-live/ag18d-non-active-real-static-activation-scaffold-readiness-decision-record.json");
const safety = readJson("data/content-intelligence/quality-registry/ag18d-file-delta-dry-run-safety-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag18d-non-active-real-static-activation-scaffold-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag18d-to-ag18e-non-active-real-static-activation-scaffold-boundary.json");
const schema = readJson("data/content-intelligence/schema/first-public-candidate-file-delta-dry-run-audit.schema.json");
const learning = readJson("data/content-intelligence/learning/ag18d-first-public-candidate-file-delta-dry-run-audit-learning.json");
const registry = readJson("data/quality/ag18d-first-public-candidate-file-delta-dry-run-audit.json");
const preview = readJson("data/quality/ag18d-first-public-candidate-file-delta-dry-run-audit-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG18D_FIRST_PUBLIC_CANDIDATE_FILE_DELTA_DRY_RUN_AUDIT.md"), "utf8");

for (const obj of [review, audit, decision, safety, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG18D") fail(`module_id must be AG18D in ${obj.title || "object"}`);
}

if (ag18cReview.status !== "first_public_candidate_file_delta_dry_run_completed_ready_for_ag18d_audit") fail("AG18C review status mismatch");
if (ag18cReadiness.ready_for_ag18d !== true) fail("AG18C readiness for AG18D missing");
if (ag18cBoundary.next_stage_id !== "AG18D") fail("AG18D boundary missing in AG18C");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
const currentHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (!hashPairMatchesCurrentOrAg12cR1Repair(currentHash, ag13zCandidate.article_hash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Seed candidate hash mismatch or AG12C-R1/AR01-R1 approved repair-chain state missing");

if (review.status !== "first_public_candidate_file_delta_dry_run_audit_passed_ready_for_ag18e_non_active_scaffold") fail("Review status mismatch");
if (audit.status !== "first_public_candidate_file_delta_dry_run_audit_passed") fail("Audit status mismatch");
if (decision.status !== "ag18c_dry_run_audit_passed_ready_for_ag18e_non_active_scaffold") fail("Decision status mismatch");
if (safety.status !== "file_delta_dry_run_safe_for_non_active_scaffold_only") fail("Safety status mismatch");
if (readiness.status !== "ready_for_ag18e_non_active_real_static_activation_scaffold") fail("Readiness status mismatch");

if (!Array.isArray(audit.checks) || audit.checks.length !== 15) fail("AG18D audit must include fifteen checks");
if (audit.failed_checks.length !== 0) fail("AG18D failed checks must be zero");
if (audit.decision.ag18c_dry_run_valid !== true) fail("AG18C dry-run must be valid");
if (audit.decision.no_file_mutation_performed !== true) fail("No file mutation must be confirmed");
if (audit.decision.no_github_token_created !== true) fail("No GitHub token must be confirmed");
if (audit.decision.no_github_write_performed !== true) fail("No GitHub write must be confirmed");
if (audit.decision.no_public_visibility_switch_performed !== true) fail("No visibility switch must be confirmed");
if (audit.decision.no_public_index_mutation_performed !== true) fail("No public index mutation must be confirmed");
if (audit.decision.no_deployment_triggered !== true) fail("No deployment must be confirmed");
if (audit.decision.no_publishing_performed !== true) fail("No publishing must be confirmed");
if (audit.decision.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must be deferred");
if (audit.decision.ready_for_non_active_real_static_activation_scaffold !== true) fail("AG18E non-active scaffold readiness missing");

if (ag18cCandidate.current_state_assessment.ready_for_real_apply_now !== false) fail("Candidate must not be ready for real apply");
if (!Object.values(ag18cCandidate.mutation_state_now).every((value) => value === false)) fail("Candidate mutation state must remain false");
if (ag18cPublicFilter.current_public_filter_result.public_exposure_allowed_now !== false) fail("Public exposure must not be allowed");
if (ag18cFileDelta.intended_delta_summary.real_file_mutation_performed !== false) fail("File mutation must not occur");
if (ag18cFileDelta.intended_delta_summary.git_write_performed !== false) fail("Git write must not occur");
if (ag18cFileDelta.intended_delta_summary.deployment_triggered !== false) fail("Deployment must not occur");
if (!ag18cFileDelta.intended_delta_targets_preview.every((target) => target.mutation_now === false)) fail("All file delta targets must be no-mutation");
if (ag18cFeatured.featured_reads_index_mutated !== false) fail("Featured Reads must not mutate");
if (ag18cCategory.category_listing_mutated !== false) fail("Category listing must not mutate");
if (ag18cHomepage.homepage_mutated !== false) fail("Homepage must not mutate");
if (ag18cSitemap.sitemap_feed_search_mutated !== false) fail("Sitemap/feed/search must not mutate");
if (ag18cRollback.rollback_preview.rollback_executed_now !== false) fail("Rollback must not execute");
if (ag18cRollback.smoke_test_preview.smoke_test_executed_now !== false) fail("Smoke test must not execute");

if (decision.decision.proceed_to_non_active_real_static_activation_scaffold !== true) fail("Decision must approve AG18E non-active scaffold");
for (const key of [
  "proceed_to_real_candidate_selection_apply",
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
if (decision.recommended_next_stage !== "AG18E") fail("Recommended next stage must be AG18E");

if (safety.safety_assertions.static_github_controlled_first !== true) fail("Safety must confirm static/GitHub first");
if (safety.safety_assertions.supabase_auth_backend_deferred !== true) fail("Safety must defer Supabase/Auth/backend");
for (const key of [
  "candidate_real_apply_enabled",
  "github_token_created",
  "github_token_exposed",
  "github_token_wired",
  "github_write_enabled",
  "file_mutation_enabled",
  "article_mutation_enabled",
  "queue_mutation_enabled",
  "public_visibility_switch_enabled",
  "public_index_mutation_enabled",
  "featured_reads_mutation_enabled",
  "category_listing_mutation_enabled",
  "homepage_mutation_enabled",
  "sitemap_feed_search_mutation_enabled",
  "deployment_trigger_enabled",
  "publishing_enabled",
  "admin_editor_execution_enabled"
]) {
  if (safety.safety_assertions[key] !== false) fail(`Safety must block ${key}`);
}

if (readiness.ready_for_ag18e !== true) fail("AG18E readiness missing");
if (readiness.first_public_candidate_file_delta_dry_run_audit_passed !== true) fail("Audit pass readiness missing");
if (readiness.failed_checks !== 0) fail("Failed checks must be zero");
if (readiness.non_active_real_static_activation_scaffold_ready !== true) fail("Non-active real static activation scaffold readiness missing");
if (readiness.github_token_ready !== false) fail("GitHub token must remain blocked");
if (readiness.github_write_ready !== false) fail("GitHub write must remain blocked");
if (readiness.public_visibility_switch_ready !== false) fail("Visibility switch must remain blocked");
if (readiness.public_index_mutation_ready !== false) fail("Public index mutation must remain blocked");
if (readiness.deployment_trigger_ready !== false) fail("Deployment must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");

if (boundary.status !== "ag18e_boundary_created_not_started") fail("AG18E boundary status mismatch");
if (boundary.next_stage_id !== "AG18E") fail("AG18E handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG18E explicit approval missing");
if (boundary.supabase_auth_defer_reminder_required_in_ag18e !== true) fail("AG18E must carry Supabase/Auth reminder");

if (schema.status !== "schema_first_public_candidate_file_delta_dry_run_audit_only") fail("Schema status mismatch");

for (const key of [
  "dry_run_audit_allowed_in_ag18d",
  "non_active_scaffold_decision_allowed_in_ag18d",
  "safety_record_allowed_in_ag18d",
  "ag18e_boundary_allowed_in_ag18d"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_generation_allowed_in_ag18d",
  "article_mutation_allowed_in_ag18d",
  "queue_mutation_allowed_in_ag18d",
  "active_admin_review_queue_record_creation_allowed_in_ag18d",
  "queue_index_mutation_allowed_in_ag18d",
  "admin_action_execution_allowed_in_ag18d",
  "editor_action_execution_allowed_in_ag18d",
  "auth_activation_allowed_in_ag18d",
  "backend_activation_allowed_in_ag18d",
  "supabase_activation_allowed_in_ag18d",
  "github_token_creation_or_exposure_allowed_in_ag18d",
  "github_write_operation_allowed_in_ag18d",
  "public_visibility_switch_allowed_in_ag18d",
  "public_index_mutation_allowed_in_ag18d",
  "public_publishing_operation_allowed_in_ag18d",
  "deployment_trigger_allowed_in_ag18d"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, audit, decision, safety, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.first_public_candidate_file_delta_dry_run_audit_only !== true) fail(`${obj.title || "object"} must be AG18D audit-only`);
  if (obj.article_generation_performed_in_ag18d !== false) fail(`${obj.title || "object"} must not generate articles`);
  if (obj.article_mutation_performed_in_ag18d !== false) fail(`${obj.title || "object"} must not mutate articles`);
  if (obj.github_token_created_or_exposed_in_ag18d !== false) fail(`${obj.title || "object"} must not create/expose token`);
  if (obj.github_write_operation_performed_in_ag18d !== false) fail(`${obj.title || "object"} must not write to GitHub`);
  if (obj.public_visibility_switch_performed_in_ag18d !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag18d !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.deployment_trigger_performed_in_ag18d !== false) fail(`${obj.title || "object"} must not trigger deployment`);
  if (obj.public_publishing_operation_performed_in_ag18d !== false) fail(`${obj.title || "object"} must not publish`);
  if (obj.supabase_activation_performed_in_ag18d !== false) fail(`${obj.title || "object"} must not activate Supabase`);
}

if (!ag17bReminder.reminder.includes("static/GitHub-controlled go-live first")) fail("Supabase reminder must mention static/GitHub first");
if (!ag17bReminder.reminder.includes("Supabase/Auth/backend later")) fail("Supabase reminder must mention Supabase/Auth/backend later");

for (const phrase of ["Purpose", "Audit Result", "Decision", "Supabase/Auth Reminder", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG18D document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag18d", "validate:ag18d"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag18d")) {
  fail("validate:project must include validate:ag18d");
}

pass("AG18D registry is present.");
pass("AG18D document is present.");
pass("AG18D review, audit report, non-active scaffold decision, safety, readiness, AG18E boundary, schema, learning and preview are present.");
pass("AG18C first public candidate and file delta dry-run is consumed.");
pass("Dry-run audit passed with zero failed checks.");
pass("Candidate readiness, public filter, file delta and public surface deltas remain dry-run only.");
pass("No file mutation, GitHub token, GitHub write, visibility switch, public index mutation, deployment or publishing occurred.");
pass("Supabase/Auth/backend remains deferred and reminder is carried forward.");
pass("Decision recorded: proceed only to AG18E non-active real static activation scaffold.");
pass("AG18E Non-active Real Static Activation Scaffold boundary is created with explicit approval required.");
pass("AG18D is First Public Candidate and File Delta Dry-run Audit only.");
