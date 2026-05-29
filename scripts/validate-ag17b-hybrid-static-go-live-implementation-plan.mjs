import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag17a-controlled-go-live-implementation-path-decision.json",
  "data/content-intelligence/go-live/ag17a-go-live-option-comparison-record.json",
  "data/content-intelligence/go-live/ag17a-hybrid-staged-path-decision-record.json",
  "data/content-intelligence/go-live/ag17a-supabase-auth-defer-reminder-record.json",
  "data/content-intelligence/quality-registry/ag17a-real-activation-blocker-register.json",
  "data/content-intelligence/quality-registry/ag17a-hybrid-static-go-live-planning-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag17a-to-ag17b-hybrid-static-go-live-implementation-plan-boundary.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",

  "data/content-intelligence/quality-reviews/ag17b-hybrid-static-go-live-implementation-plan.json",
  "data/content-intelligence/go-live/ag17b-static-github-go-live-architecture-plan.json",
  "data/content-intelligence/go-live/ag17b-controlled-public-exposure-sequence-plan.json",
  "data/content-intelligence/go-live/ag17b-github-secret-requirements-no-secrets-plan.json",
  "data/content-intelligence/go-live/ag17b-admin-editor-static-action-readiness-plan.json",
  "data/content-intelligence/go-live/ag17b-static-go-live-rollback-audit-plan.json",
  "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  "data/content-intelligence/quality-registry/ag17b-hybrid-static-go-live-plan-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag17b-to-ag17c-hybrid-static-go-live-plan-audit-boundary.json",
  "data/content-intelligence/schema/hybrid-static-go-live-implementation-plan.schema.json",
  "data/content-intelligence/learning/ag17b-hybrid-static-go-live-implementation-plan-learning.json",
  "data/quality/ag17b-hybrid-static-go-live-implementation-plan.json",
  "data/quality/ag17b-hybrid-static-go-live-implementation-plan-preview.json",
  "docs/quality/AG17B_HYBRID_STATIC_GO_LIVE_IMPLEMENTATION_PLAN.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG17B validation failed: ${message}`);
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

const ag17aReview = readJson("data/content-intelligence/quality-reviews/ag17a-controlled-go-live-implementation-path-decision.json");
const ag17aDecision = readJson("data/content-intelligence/go-live/ag17a-hybrid-staged-path-decision-record.json");
const ag17aReminder = readJson("data/content-intelligence/go-live/ag17a-supabase-auth-defer-reminder-record.json");
const ag17aReadiness = readJson("data/content-intelligence/quality-registry/ag17a-hybrid-static-go-live-planning-readiness-record.json");
const ag17aBoundary = readJson("data/content-intelligence/mutation-plans/ag17a-to-ag17b-hybrid-static-go-live-implementation-plan-boundary.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");

const review = readJson("data/content-intelligence/quality-reviews/ag17b-hybrid-static-go-live-implementation-plan.json");
const architecture = readJson("data/content-intelligence/go-live/ag17b-static-github-go-live-architecture-plan.json");
const exposure = readJson("data/content-intelligence/go-live/ag17b-controlled-public-exposure-sequence-plan.json");
const githubSecret = readJson("data/content-intelligence/go-live/ag17b-github-secret-requirements-no-secrets-plan.json");
const adminEditor = readJson("data/content-intelligence/go-live/ag17b-admin-editor-static-action-readiness-plan.json");
const rollback = readJson("data/content-intelligence/go-live/ag17b-static-go-live-rollback-audit-plan.json");
const reminder = readJson("data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag17b-hybrid-static-go-live-plan-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag17b-to-ag17c-hybrid-static-go-live-plan-audit-boundary.json");
const schema = readJson("data/content-intelligence/schema/hybrid-static-go-live-implementation-plan.schema.json");
const learning = readJson("data/content-intelligence/learning/ag17b-hybrid-static-go-live-implementation-plan-learning.json");
const registry = readJson("data/quality/ag17b-hybrid-static-go-live-implementation-plan.json");
const preview = readJson("data/quality/ag17b-hybrid-static-go-live-implementation-plan-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG17B_HYBRID_STATIC_GO_LIVE_IMPLEMENTATION_PLAN.md"), "utf8");

for (const obj of [review, architecture, exposure, githubSecret, adminEditor, rollback, reminder, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG17B") fail(`module_id must be AG17B in ${obj.title || "object"}`);
}

if (ag17aReview.status !== "hybrid_staged_go_live_path_selected_real_activation_blocked") fail("AG17A review status mismatch");
if (ag17aDecision.selected_path !== "hybrid_staged_path") fail("AG17A selected path mismatch");
if (ag17aReminder.status !== "supabase_auth_deferred_with_future_reminder_required") fail("AG17A Supabase/Auth reminder missing");
if (ag17aReadiness.ready_for_ag17b !== true) fail("AG17A readiness for AG17B missing");
if (ag17aBoundary.next_stage_id !== "AG17B") fail("AG17B boundary missing in AG17A");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
const currentHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (!hashPairMatchesCurrentOrAg12cR1Repair(currentHash, ag13zCandidate.article_hash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Seed candidate hash mismatch or AG12C-R1/AR01-R1 approved repair-chain state missing");

if (review.status !== "hybrid_static_go_live_implementation_plan_defined_real_activation_blocked") fail("Review status mismatch");
if (architecture.status !== "static_github_go_live_architecture_planned") fail("Architecture plan status mismatch");
if (exposure.status !== "controlled_public_exposure_sequence_planned_no_execution") fail("Exposure sequence status mismatch");
if (githubSecret.status !== "github_secret_requirements_planned_no_secrets_created") fail("GitHub secret plan status mismatch");
if (adminEditor.status !== "admin_editor_static_action_readiness_planned_no_execution") fail("Admin/Editor plan status mismatch");
if (rollback.status !== "rollback_audit_plan_defined_no_execution") fail("Rollback audit plan status mismatch");
if (reminder.status !== "supabase_auth_backend_defer_reminder_carried_forward") fail("Reminder carry-forward status mismatch");
if (readiness.status !== "ready_for_ag17c_hybrid_static_go_live_plan_audit") fail("Readiness status mismatch");

if (architecture.selected_path !== "hybrid_staged_path_static_first") fail("Architecture selected path mismatch");
if (architecture.architecture_mode !== "static_github_controlled_first") fail("Architecture mode must be static/GitHub first");
if (!architecture.planned_components.some((item) => item.component_id === "supabase_auth_backend" && item.deferred === true && item.activation_now === false)) {
  fail("Supabase/Auth backend must be deferred in architecture plan");
}

if (!exposure.planned_sequence.every((step) => step.execution_now === false)) fail("Exposure sequence steps must not execute now");
if (exposure.current_ag17b_execution_state.public_visibility_switch_performed !== false) fail("Visibility switch must not be performed");
if (exposure.current_ag17b_execution_state.public_index_mutation_performed !== false) fail("Public index mutation must not be performed");
if (exposure.current_ag17b_execution_state.publishing_operation_performed !== false) fail("Publishing must not be performed");
if (exposure.current_ag17b_execution_state.deployment_trigger_performed !== false) fail("Deployment must not be triggered");

if (!githubSecret.future_secret_candidates.every((item) => item.created_now === false && item.exposed_now === false && item.wired_now === false)) {
  fail("No GitHub secret candidate may be created, exposed or wired");
}
if (githubSecret.github_write_operation_allowed_now !== false) fail("GitHub write must be blocked now");
if (githubSecret.github_token_creation_allowed_now !== false) fail("GitHub token creation must be blocked now");
if (githubSecret.github_token_exposure_allowed_now !== false) fail("GitHub token exposure must be blocked now");

if (adminEditor.planned_static_action_model.current_active_handler !== false) fail("No active handler may exist");
if (adminEditor.supabase_auth_still_deferred !== true) fail("Supabase/Auth must remain deferred in Admin/Editor plan");
for (const role of adminEditor.planned_roles) {
  if (role.execution_now !== false) fail(`Role ${role.role} must not execute actions now`);
}

if (rollback.rollback_execution_now !== false) fail("Rollback execution must not occur now");
if (rollback.audit_write_execution_now !== false) fail("Audit write execution must not occur now");

if (!reminder.reminder.includes("static/GitHub-controlled go-live first")) fail("Reminder must mention static/GitHub first");
if (!reminder.reminder.includes("Supabase/Auth/backend later")) fail("Reminder must mention Supabase/Auth/backend later");
for (const item of ["No Supabase activation.", "No Auth activation.", "No backend activation.", "No database write.", "No real credentials."]) {
  if (!reminder.forbidden_in_ag17b.includes(item)) fail(`Reminder forbidden item missing: ${item}`);
}

if (readiness.ready_for_ag17c !== true) fail("AG17C readiness missing");
if (readiness.selected_path !== "hybrid_staged_path") fail("Readiness selected path mismatch");
if (readiness.static_github_controlled_first !== true) fail("Static/GitHub first readiness missing");
if (readiness.supabase_auth_deferred !== true) fail("Supabase/Auth deferred readiness missing");
if (readiness.supabase_auth_reminder_carried_forward !== true) fail("Supabase/Auth reminder carry-forward missing");
if (readiness.github_write_ready !== false) fail("GitHub write must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");
if (readiness.public_visibility_switch_ready !== false) fail("Visibility switch must remain blocked");
if (readiness.public_index_mutation_ready !== false) fail("Public index mutation must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");

if (boundary.status !== "ag17c_boundary_created_not_started") fail("AG17C boundary status mismatch");
if (boundary.next_stage_id !== "AG17C") fail("AG17C handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG17C explicit approval missing");
if (boundary.supabase_auth_defer_reminder_required_in_ag17c !== true) fail("AG17C must carry Supabase reminder");

if (schema.status !== "schema_hybrid_static_go_live_implementation_plan_only") fail("Schema status mismatch");

for (const key of [
  "static_github_go_live_architecture_plan_allowed_in_ag17b",
  "controlled_public_exposure_sequence_plan_allowed_in_ag17b",
  "github_secret_requirements_no_secrets_plan_allowed_in_ag17b",
  "admin_editor_static_action_readiness_plan_allowed_in_ag17b",
  "rollback_audit_plan_allowed_in_ag17b",
  "supabase_auth_defer_reminder_allowed_in_ag17b",
  "ag17c_boundary_allowed_in_ag17b"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_generation_allowed_in_ag17b",
  "article_mutation_allowed_in_ag17b",
  "queue_mutation_allowed_in_ag17b",
  "active_admin_review_queue_record_creation_allowed_in_ag17b",
  "queue_index_mutation_allowed_in_ag17b",
  "admin_action_execution_allowed_in_ag17b",
  "editor_action_execution_allowed_in_ag17b",
  "auth_activation_allowed_in_ag17b",
  "backend_activation_allowed_in_ag17b",
  "supabase_activation_allowed_in_ag17b",
  "github_write_operation_allowed_in_ag17b",
  "public_visibility_switch_allowed_in_ag17b",
  "public_index_mutation_allowed_in_ag17b",
  "public_publishing_operation_allowed_in_ag17b",
  "deployment_trigger_allowed_in_ag17b"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, architecture, exposure, githubSecret, adminEditor, rollback, reminder, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.hybrid_static_go_live_implementation_plan_only !== true) fail(`${obj.title || "object"} must be AG17B planning-only`);
  if (obj.article_generation_performed_in_ag17b !== false) fail(`${obj.title || "object"} must not generate articles`);
  if (obj.article_mutation_performed_in_ag17b !== false) fail(`${obj.title || "object"} must not mutate articles`);
  if (obj.queue_mutation_performed_in_ag17b !== false) fail(`${obj.title || "object"} must not mutate queue`);
  if (obj.admin_action_execution_performed_in_ag17b !== false) fail(`${obj.title || "object"} must not execute Admin actions`);
  if (obj.auth_activation_performed_in_ag17b !== false) fail(`${obj.title || "object"} must not activate Auth`);
  if (obj.supabase_activation_performed_in_ag17b !== false) fail(`${obj.title || "object"} must not activate Supabase`);
  if (obj.github_write_operation_performed_in_ag17b !== false) fail(`${obj.title || "object"} must not perform GitHub write`);
  if (obj.public_visibility_switch_performed_in_ag17b !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag17b !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.public_publishing_operation_performed_in_ag17b !== false) fail(`${obj.title || "object"} must not publish`);
  if (obj.deployment_trigger_performed_in_ag17b !== false) fail(`${obj.title || "object"} must not trigger deployment`);
}

for (const phrase of ["Purpose", "Selected Path", "Supabase/Auth Reminder", "Planned Outputs", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG17B document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag17b", "validate:ag17b"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag17b")) {
  fail("validate:project must include validate:ag17b");
}

pass("AG17B registry is present.");
pass("AG17B document is present.");
pass("AG17B review, architecture plan, public exposure sequence, GitHub secret requirements plan, Admin/Editor readiness, rollback/audit plan, Supabase reminder, readiness, AG17C boundary, schema, learning and preview are present.");
pass("AG17A hybrid staged path decision is consumed.");
pass("Static/GitHub-controlled go-live is planned first.");
pass("Supabase/Auth/backend remains deferred and reminder is carried forward.");
pass("No secrets, credentials, GitHub write, Admin/Editor execution, visibility switch, public index mutation, deployment or publishing are performed.");
pass("AG17C Hybrid Static Go-live Plan Audit boundary is created with explicit approval required.");
pass("AG17B is Hybrid Static Go-live Implementation Plan only.");
