import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag17b-hybrid-static-go-live-implementation-plan.json",
  "data/content-intelligence/go-live/ag17b-static-github-go-live-architecture-plan.json",
  "data/content-intelligence/go-live/ag17b-controlled-public-exposure-sequence-plan.json",
  "data/content-intelligence/go-live/ag17b-github-secret-requirements-no-secrets-plan.json",
  "data/content-intelligence/go-live/ag17b-admin-editor-static-action-readiness-plan.json",
  "data/content-intelligence/go-live/ag17b-static-go-live-rollback-audit-plan.json",
  "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  "data/content-intelligence/quality-registry/ag17b-hybrid-static-go-live-plan-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag17b-to-ag17c-hybrid-static-go-live-plan-audit-boundary.json",
  "data/content-intelligence/go-live/ag17a-hybrid-staged-path-decision-record.json",
  "data/content-intelligence/quality-registry/ag17a-real-activation-blocker-register.json",
  "data/content-intelligence/content-pipeline/ag16z-public-visibility-publish-control-summary.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",

  "data/content-intelligence/quality-reviews/ag17c-hybrid-static-go-live-plan-audit.json",
  "data/content-intelligence/audit-records/ag17c-hybrid-static-go-live-plan-audit-report.json",
  "data/content-intelligence/go-live/ag17c-non-active-static-go-live-scaffold-readiness-decision-record.json",
  "data/content-intelligence/quality-registry/ag17c-static-go-live-safety-record.json",
  "data/content-intelligence/quality-registry/ag17c-non-active-static-go-live-scaffold-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag17c-to-ag17d-non-active-static-go-live-implementation-scaffold-boundary.json",
  "data/content-intelligence/schema/hybrid-static-go-live-plan-audit.schema.json",
  "data/content-intelligence/learning/ag17c-hybrid-static-go-live-plan-audit-learning.json",
  "data/quality/ag17c-hybrid-static-go-live-plan-audit.json",
  "data/quality/ag17c-hybrid-static-go-live-plan-audit-preview.json",
  "docs/quality/AG17C_HYBRID_STATIC_GO_LIVE_PLAN_AUDIT.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG17C validation failed: ${message}`);
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

const ag17bReview = readJson("data/content-intelligence/quality-reviews/ag17b-hybrid-static-go-live-implementation-plan.json");
const ag17bArchitecture = readJson("data/content-intelligence/go-live/ag17b-static-github-go-live-architecture-plan.json");
const ag17bExposure = readJson("data/content-intelligence/go-live/ag17b-controlled-public-exposure-sequence-plan.json");
const ag17bGithubSecret = readJson("data/content-intelligence/go-live/ag17b-github-secret-requirements-no-secrets-plan.json");
const ag17bAdminEditor = readJson("data/content-intelligence/go-live/ag17b-admin-editor-static-action-readiness-plan.json");
const ag17bRollback = readJson("data/content-intelligence/go-live/ag17b-static-go-live-rollback-audit-plan.json");
const ag17bReminder = readJson("data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json");
const ag17bReadiness = readJson("data/content-intelligence/quality-registry/ag17b-hybrid-static-go-live-plan-audit-readiness-record.json");
const ag17bBoundary = readJson("data/content-intelligence/mutation-plans/ag17b-to-ag17c-hybrid-static-go-live-plan-audit-boundary.json");
const ag17aDecision = readJson("data/content-intelligence/go-live/ag17a-hybrid-staged-path-decision-record.json");
const ag16zSummary = readJson("data/content-intelligence/content-pipeline/ag16z-public-visibility-publish-control-summary.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");

const review = readJson("data/content-intelligence/quality-reviews/ag17c-hybrid-static-go-live-plan-audit.json");
const audit = readJson("data/content-intelligence/audit-records/ag17c-hybrid-static-go-live-plan-audit-report.json");
const decision = readJson("data/content-intelligence/go-live/ag17c-non-active-static-go-live-scaffold-readiness-decision-record.json");
const safety = readJson("data/content-intelligence/quality-registry/ag17c-static-go-live-safety-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag17c-non-active-static-go-live-scaffold-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag17c-to-ag17d-non-active-static-go-live-implementation-scaffold-boundary.json");
const schema = readJson("data/content-intelligence/schema/hybrid-static-go-live-plan-audit.schema.json");
const learning = readJson("data/content-intelligence/learning/ag17c-hybrid-static-go-live-plan-audit-learning.json");
const registry = readJson("data/quality/ag17c-hybrid-static-go-live-plan-audit.json");
const preview = readJson("data/quality/ag17c-hybrid-static-go-live-plan-audit-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG17C_HYBRID_STATIC_GO_LIVE_PLAN_AUDIT.md"), "utf8");

for (const obj of [review, audit, decision, safety, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG17C") fail(`module_id must be AG17C in ${obj.title || "object"}`);
}

if (ag17bReview.status !== "hybrid_static_go_live_implementation_plan_defined_real_activation_blocked") fail("AG17B review status mismatch");
if (ag17bReadiness.ready_for_ag17c !== true) fail("AG17B readiness for AG17C missing");
if (ag17bBoundary.next_stage_id !== "AG17C") fail("AG17C boundary missing in AG17B");
if (ag17aDecision.selected_path !== "hybrid_staged_path") fail("AG17A hybrid staged decision missing");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
const currentHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (!hashPairMatchesCurrentOrAg12cR1Repair(currentHash, ag13zCandidate.article_hash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Seed candidate hash mismatch or AG12C-R1 repaired article state missing");

if (review.status !== "hybrid_static_go_live_plan_audit_passed_non_active_scaffold_ready") fail("Review status mismatch");
if (audit.status !== "hybrid_static_go_live_plan_audit_passed") fail("Audit status mismatch");
if (decision.status !== "hybrid_static_plan_audit_passed_non_active_scaffold_ready") fail("Decision status mismatch");
if (safety.status !== "static_go_live_plan_safe_for_non_active_scaffold_only") fail("Safety status mismatch");
if (readiness.status !== "ready_for_ag17d_non_active_static_go_live_implementation_scaffold") fail("Readiness status mismatch");

if (!Array.isArray(audit.checks) || audit.checks.length !== 12) fail("AG17C audit must include twelve checks");
if (audit.failed_checks.length !== 0) fail("AG17C failed checks must be zero");
if (audit.decision.static_github_go_live_plan_valid !== true) fail("Static/GitHub plan must be valid");
if (audit.decision.supabase_auth_deferred !== true) fail("Supabase/Auth must be deferred");
if (audit.decision.no_secrets_created !== true) fail("No secrets must be created");
if (audit.decision.no_github_write_path_activated !== true) fail("No GitHub write path must be activated");
if (audit.decision.no_admin_editor_execution_enabled !== true) fail("No Admin/Editor execution must be enabled");
if (audit.decision.no_visibility_switch_performed !== true) fail("No visibility switch must be performed");
if (audit.decision.no_public_index_mutation_performed !== true) fail("No public index mutation must be performed");
if (audit.decision.no_deployment_triggered !== true) fail("No deployment must be triggered");
if (audit.decision.no_publishing_performed !== true) fail("No publishing must be performed");
if (audit.decision.ready_for_non_active_static_go_live_scaffold !== true) fail("Non-active static scaffold readiness missing");

if (ag17bArchitecture.architecture_mode !== "static_github_controlled_first") fail("Architecture mode must be static/GitHub first");
if (!ag17bArchitecture.planned_components.some((item) => item.component_id === "supabase_auth_backend" && item.deferred === true && item.activation_now === false)) {
  fail("Supabase/Auth backend must be deferred");
}
if (!ag17bExposure.planned_sequence.every((step) => step.execution_now === false)) fail("Exposure sequence must not execute");
if (!ag17bGithubSecret.future_secret_candidates.every((item) => item.created_now === false && item.exposed_now === false && item.wired_now === false)) {
  fail("GitHub secrets must not be created/exposed/wired");
}
if (ag17bAdminEditor.planned_static_action_model.current_active_handler !== false) fail("Admin/Editor handler must not be active");
if (ag17bRollback.rollback_execution_now !== false || ag17bRollback.audit_write_execution_now !== false) fail("Rollback/audit execution must not occur");
if (ag17bReminder.status !== "supabase_auth_backend_defer_reminder_carried_forward") fail("Supabase reminder must be carried forward");

if (ag16zSummary.final_public_control_state.public_visibility_switch_enabled !== false) fail("AG16 visibility switch must remain blocked");
if (ag16zSummary.final_public_control_state.public_index_mutation_enabled !== false) fail("AG16 public index mutation must remain blocked");
if (ag16zSummary.final_public_control_state.publishing_enabled !== false) fail("AG16 publishing must remain blocked");

if (decision.decision.proceed_to_non_active_static_go_live_scaffold !== true) fail("Decision must approve non-active static scaffold");
if (decision.decision.proceed_to_real_github_write !== false) fail("Decision must block real GitHub write");
if (decision.decision.proceed_to_real_admin_editor_execution !== false) fail("Decision must block Admin/Editor execution");
if (decision.decision.proceed_to_public_visibility_switch !== false) fail("Decision must block visibility switch");
if (decision.decision.proceed_to_public_index_mutation !== false) fail("Decision must block public index mutation");
if (decision.decision.proceed_to_deployment_trigger !== false) fail("Decision must block deployment");
if (decision.decision.proceed_to_publish_execution !== false) fail("Decision must block publishing");
if (decision.decision.proceed_to_supabase_auth_backend_activation !== false) fail("Decision must block Supabase/Auth/backend activation");
if (decision.recommended_next_stage !== "AG17D") fail("Recommended next stage must be AG17D");

if (safety.safety_assertions.static_github_path_first !== true) fail("Safety must confirm static/GitHub first");
if (safety.safety_assertions.supabase_auth_backend_deferred !== true) fail("Safety must confirm Supabase/Auth deferred");
if (safety.safety_assertions.secrets_created !== false) fail("Safety must confirm no secrets");
if (safety.safety_assertions.github_write_enabled !== false) fail("Safety must block GitHub write");
if (safety.safety_assertions.public_visibility_switch_enabled !== false) fail("Safety must block visibility switch");
if (safety.safety_assertions.public_index_mutation_enabled !== false) fail("Safety must block public index mutation");
if (safety.safety_assertions.deployment_trigger_enabled !== false) fail("Safety must block deployment");
if (safety.safety_assertions.publishing_enabled !== false) fail("Safety must block publishing");

if (readiness.ready_for_ag17d !== true) fail("AG17D readiness missing");
if (readiness.hybrid_static_plan_audit_passed !== true) fail("Hybrid static audit must pass");
if (readiness.failed_checks !== 0) fail("Failed checks must be zero");
if (readiness.non_active_static_go_live_scaffold_ready !== true) fail("Non-active scaffold readiness missing");
if (readiness.static_github_controlled_first !== true) fail("Static/GitHub first readiness missing");
if (readiness.supabase_auth_deferred !== true) fail("Supabase/Auth deferred readiness missing");
if (readiness.github_write_ready !== false) fail("GitHub write must remain blocked");
if (readiness.public_visibility_switch_ready !== false) fail("Visibility switch must remain blocked");
if (readiness.public_index_mutation_ready !== false) fail("Public index mutation must remain blocked");
if (readiness.deployment_trigger_ready !== false) fail("Deployment must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");

if (boundary.status !== "ag17d_boundary_created_not_started") fail("AG17D boundary status mismatch");
if (boundary.next_stage_id !== "AG17D") fail("AG17D handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG17D explicit approval missing");
if (boundary.supabase_auth_defer_reminder_required_in_ag17d !== true) fail("AG17D must carry Supabase/Auth reminder");

if (schema.status !== "schema_hybrid_static_go_live_plan_audit_only") fail("Schema status mismatch");

for (const key of [
  "plan_audit_allowed_in_ag17c",
  "non_active_scaffold_decision_allowed_in_ag17c",
  "static_go_live_safety_record_allowed_in_ag17c",
  "ag17d_boundary_allowed_in_ag17c"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "static_go_live_scaffold_creation_allowed_in_ag17c",
  "article_generation_allowed_in_ag17c",
  "article_mutation_allowed_in_ag17c",
  "queue_mutation_allowed_in_ag17c",
  "active_admin_review_queue_record_creation_allowed_in_ag17c",
  "queue_index_mutation_allowed_in_ag17c",
  "admin_action_execution_allowed_in_ag17c",
  "editor_action_execution_allowed_in_ag17c",
  "auth_activation_allowed_in_ag17c",
  "backend_activation_allowed_in_ag17c",
  "supabase_activation_allowed_in_ag17c",
  "github_write_operation_allowed_in_ag17c",
  "public_visibility_switch_allowed_in_ag17c",
  "public_index_mutation_allowed_in_ag17c",
  "public_publishing_operation_allowed_in_ag17c",
  "deployment_trigger_allowed_in_ag17c"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, audit, decision, safety, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.hybrid_static_go_live_plan_audit_only !== true) fail(`${obj.title || "object"} must be AG17C audit-only`);
  if (obj.static_go_live_scaffold_created_in_ag17c !== false) fail(`${obj.title || "object"} must not create scaffold`);
  if (obj.article_generation_performed_in_ag17c !== false) fail(`${obj.title || "object"} must not generate articles`);
  if (obj.article_mutation_performed_in_ag17c !== false) fail(`${obj.title || "object"} must not mutate articles`);
  if (obj.queue_mutation_performed_in_ag17c !== false) fail(`${obj.title || "object"} must not mutate queue`);
  if (obj.admin_action_execution_performed_in_ag17c !== false) fail(`${obj.title || "object"} must not execute Admin action`);
  if (obj.supabase_activation_performed_in_ag17c !== false) fail(`${obj.title || "object"} must not activate Supabase`);
  if (obj.github_write_operation_performed_in_ag17c !== false) fail(`${obj.title || "object"} must not perform GitHub write`);
  if (obj.public_visibility_switch_performed_in_ag17c !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag17c !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.deployment_trigger_performed_in_ag17c !== false) fail(`${obj.title || "object"} must not trigger deployment`);
  if (obj.public_publishing_operation_performed_in_ag17c !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Audit Result", "Readiness Decision", "Supabase/Auth Reminder", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG17C document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag17c", "validate:ag17c"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag17c")) {
  fail("validate:project must include validate:ag17c");
}

pass("AG17C registry is present.");
pass("AG17C document is present.");
pass("AG17C review, audit report, non-active scaffold decision, safety, readiness, AG17D boundary, schema, learning and preview are present.");
pass("AG17B hybrid static go-live implementation plan is consumed.");
pass("Hybrid static go-live plan audit passed with zero failed checks.");
pass("Static/GitHub-controlled go-live remains first.");
pass("Supabase/Auth/backend remains deferred and reminder is carried forward.");
pass("Decision recorded: proceed only to non-active static go-live scaffold.");
pass("No credentials, GitHub write, Admin/Editor execution, visibility switch, public index mutation, deployment or publishing are performed.");
pass("AG17D Non-active Static Go-live Implementation Scaffold boundary is created with explicit approval required.");
pass("AG17C is Hybrid Static Go-live Implementation Plan Audit only.");
