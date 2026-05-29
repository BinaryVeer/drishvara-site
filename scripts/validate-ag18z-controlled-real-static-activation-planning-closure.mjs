import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag18a-controlled-real-static-activation-planning.json",
  "data/content-intelligence/quality-reviews/ag18b-controlled-real-static-activation-plan-audit.json",
  "data/content-intelligence/quality-reviews/ag18c-first-public-candidate-file-delta-dry-run.json",
  "data/content-intelligence/quality-reviews/ag18d-first-public-candidate-file-delta-dry-run-audit.json",
  "data/content-intelligence/quality-reviews/ag18e-non-active-real-static-activation-scaffold.json",
  "data/content-intelligence/quality-reviews/ag18f-non-active-real-static-activation-scaffold-audit.json",
  "data/content-intelligence/audit-records/ag18f-non-active-real-static-activation-scaffold-audit-report.json",
  "data/content-intelligence/closure-records/ag18f-non-active-real-static-activation-scaffold-audit-closure.json",
  "data/content-intelligence/quality-registry/ag18f-non-active-real-static-activation-scaffold-safety-record.json",
  "data/content-intelligence/quality-registry/ag18f-controlled-real-static-activation-planning-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag18f-to-ag18z-controlled-real-static-activation-planning-closure-boundary.json",
  "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",

  "data/content-intelligence/quality-reviews/ag18z-controlled-real-static-activation-planning-closure.json",
  "data/content-intelligence/closure-records/ag18z-controlled-real-static-activation-planning-closure.json",
  "data/content-intelligence/go-live/ag18z-controlled-real-static-activation-planning-summary.json",
  "data/content-intelligence/quality-registry/ag18z-real-static-activation-pre-apply-blocked-register.json",
  "data/content-intelligence/quality-registry/ag18z-first-static-activation-pre-apply-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag18z-to-ag19a-first-static-activation-pre-apply-readiness-plan-boundary.json",
  "data/content-intelligence/schema/controlled-real-static-activation-planning-closure.schema.json",
  "data/content-intelligence/learning/ag18z-controlled-real-static-activation-planning-closure-learning.json",
  "data/quality/ag18z-controlled-real-static-activation-planning-closure.json",
  "data/quality/ag18z-controlled-real-static-activation-planning-closure-preview.json",
  "docs/quality/AG18Z_CONTROLLED_REAL_STATIC_ACTIVATION_PLANNING_CLOSURE.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG18Z validation failed: ${message}`);
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

const ag18fReview = readJson("data/content-intelligence/quality-reviews/ag18f-non-active-real-static-activation-scaffold-audit.json");
const ag18fAudit = readJson("data/content-intelligence/audit-records/ag18f-non-active-real-static-activation-scaffold-audit-report.json");
const ag18fClosure = readJson("data/content-intelligence/closure-records/ag18f-non-active-real-static-activation-scaffold-audit-closure.json");
const ag18fSafety = readJson("data/content-intelligence/quality-registry/ag18f-non-active-real-static-activation-scaffold-safety-record.json");
const ag18fReadiness = readJson("data/content-intelligence/quality-registry/ag18f-controlled-real-static-activation-planning-closure-readiness-record.json");
const ag18fBoundary = readJson("data/content-intelligence/mutation-plans/ag18f-to-ag18z-controlled-real-static-activation-planning-closure-boundary.json");
const ag17bReminder = readJson("data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");

const review = readJson("data/content-intelligence/quality-reviews/ag18z-controlled-real-static-activation-planning-closure.json");
const closure = readJson("data/content-intelligence/closure-records/ag18z-controlled-real-static-activation-planning-closure.json");
const summary = readJson("data/content-intelligence/go-live/ag18z-controlled-real-static-activation-planning-summary.json");
const blocked = readJson("data/content-intelligence/quality-registry/ag18z-real-static-activation-pre-apply-blocked-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag18z-first-static-activation-pre-apply-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag18z-to-ag19a-first-static-activation-pre-apply-readiness-plan-boundary.json");
const schema = readJson("data/content-intelligence/schema/controlled-real-static-activation-planning-closure.schema.json");
const learning = readJson("data/content-intelligence/learning/ag18z-controlled-real-static-activation-planning-closure-learning.json");
const registry = readJson("data/quality/ag18z-controlled-real-static-activation-planning-closure.json");
const preview = readJson("data/quality/ag18z-controlled-real-static-activation-planning-closure-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG18Z_CONTROLLED_REAL_STATIC_ACTIVATION_PLANNING_CLOSURE.md"), "utf8");

for (const obj of [review, closure, summary, blocked, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG18Z") fail(`module_id must be AG18Z in ${obj.title || "object"}`);
}

if (ag18fReview.status !== "non_active_real_static_activation_scaffold_audit_passed_ready_for_ag18z_closure") fail("AG18F review status mismatch");
if (ag18fAudit.failed_checks.length !== 0) fail("AG18F failed checks must be zero");
if (ag18fClosure.closure_decision.proceed_to_ag18z_controlled_real_static_activation_planning_closure !== true) fail("AG18F closure handoff missing");
if (ag18fReadiness.ready_for_ag18z !== true) fail("AG18F readiness for AG18Z missing");
if (ag18fBoundary.next_stage_id !== "AG18Z") fail("AG18Z boundary missing in AG18F");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
const currentHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (!hashPairMatchesCurrentOrAg12cR1Repair(currentHash, ag13zCandidate.article_hash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Seed candidate hash mismatch or AG12C-R1/AR01-R1 approved repair-chain state missing");

if (review.status !== "controlled_real_static_activation_planning_chain_closed_ready_for_ag19a_pre_apply") fail("Review status mismatch");
if (closure.status !== "controlled_real_static_activation_planning_chain_closed_ready_for_ag19a_pre_apply") fail("Closure status mismatch");
if (summary.status !== "ag18_controlled_real_static_activation_planning_completed") fail("Summary status mismatch");
if (blocked.status !== "real_static_activation_pre_apply_operations_remain_blocked") fail("Blocked register status mismatch");
if (readiness.status !== "ready_for_ag19a_first_static_activation_pre_apply_readiness_plan") fail("Readiness status mismatch");

if (summary.completed_stage_count !== 6) fail("AG18Z must summarise six AG18 stages");
for (const stage of ["AG18A", "AG18B", "AG18C", "AG18D", "AG18E", "AG18F"]) {
  if (!summary.completed_stages.some((item) => item.stage_id === stage)) fail(`Missing completed stage ${stage}`);
}

if (summary.selected_path !== "hybrid_staged_path_static_first") fail("Summary selected path mismatch");
if (summary.static_github_controlled_first !== true) fail("Static/GitHub first must be true");
if (summary.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must be deferred");
if (summary.supabase_auth_reminder_required_in_future !== true) fail("Supabase/Auth reminder must be required");

const finalState = summary.final_ag18_state;
for (const key of [
  "real_static_activation_planning_defined",
  "plan_audited",
  "first_candidate_dry_run_completed",
  "first_candidate_dry_run_audited",
  "non_active_real_static_activation_scaffold_created",
  "non_active_real_static_activation_scaffold_audited",
  "ready_for_ag19_pre_apply_readiness_planning"
]) {
  if (finalState[key] !== true) fail(`Final AG18 state must confirm ${key}`);
}
for (const key of [
  "candidate_apply_enabled",
  "github_token_created",
  "github_token_exposed",
  "github_token_wired",
  "github_write_enabled",
  "article_mutation_enabled",
  "queue_mutation_enabled",
  "admin_editor_execution_enabled",
  "public_visibility_switch_enabled",
  "public_index_mutation_enabled",
  "deployment_trigger_enabled",
  "publishing_enabled",
  "supabase_auth_backend_enabled"
]) {
  if (finalState[key] !== false) fail(`Final AG18 state must block ${key}`);
}

for (const item of [
  "Real candidate apply.",
  "Real GitHub token creation.",
  "Real GitHub write.",
  "Real public visibility switch.",
  "Real public index mutation.",
  "Deployment trigger.",
  "Publish execution.",
  "Supabase/Auth/backend activation."
]) {
  if (!blocked.blocked_items_after_ag18_closure.includes(item)) fail(`Blocked item missing: ${item}`);
}
if (blocked.supabase_auth_backend_deferred !== true) fail("Blocked register must defer Supabase/Auth/backend");
if (!blocked.reminder.includes("static/GitHub-controlled go-live first")) fail("Blocked reminder must mention static/GitHub first");
if (!blocked.reminder.includes("Supabase/Auth/backend later")) fail("Blocked reminder must mention Supabase/Auth/backend later");

if (readiness.ready_for_ag19a !== true) fail("AG19A readiness missing");
if (readiness.ag18_chain_closed !== true) fail("AG18 chain closure missing");
if (readiness.recommended_next_stage !== "AG19A") fail("Recommended next stage must be AG19A");
if (readiness.github_token_ready !== false) fail("GitHub token must remain blocked");
if (readiness.github_write_ready !== false) fail("GitHub write must remain blocked");
if (readiness.candidate_apply_ready !== false) fail("Candidate apply must remain blocked");
if (readiness.public_visibility_switch_ready !== false) fail("Visibility switch must remain blocked");
if (readiness.public_index_mutation_ready !== false) fail("Public index mutation must remain blocked");
if (readiness.deployment_trigger_ready !== false) fail("Deployment must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");

if (closure.final_decision.ag18_chain_closed !== true) fail("AG18 chain closure missing");
if (closure.final_decision.proceed_to_ag19a_first_static_activation_pre_apply_readiness_plan !== true) fail("AG19A handoff missing");
if (closure.final_decision.static_github_controlled_first_confirmed !== true) fail("Static/GitHub first closure missing");
if (closure.final_decision.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend deferred closure missing");
for (const key of [
  "proceed_to_real_candidate_apply",
  "proceed_to_github_token_creation",
  "proceed_to_github_write",
  "proceed_to_article_mutation",
  "proceed_to_queue_mutation",
  "proceed_to_admin_editor_execution",
  "proceed_to_public_visibility_switch",
  "proceed_to_public_index_mutation",
  "proceed_to_deployment_trigger",
  "proceed_to_publish_execution",
  "proceed_to_supabase_auth_backend_activation"
]) {
  if (closure.final_decision[key] !== false) fail(`Closure must block ${key}`);
}

if (ag18fSafety.safety_assertions.supabase_auth_backend_enabled !== false) fail("AG18F safety must block Supabase/Auth/backend");
if (ag18fSafety.safety_assertions.github_write_enabled !== false) fail("AG18F safety must block GitHub write");
if (ag18fSafety.safety_assertions.public_visibility_switch_enabled !== false) fail("AG18F safety must block visibility switch");
if (ag18fSafety.safety_assertions.public_index_mutation_enabled !== false) fail("AG18F safety must block public index mutation");
if (ag18fSafety.safety_assertions.deployment_trigger_enabled !== false) fail("AG18F safety must block deployment");
if (ag18fSafety.safety_assertions.publishing_enabled !== false) fail("AG18F safety must block publishing");

if (boundary.status !== "ag19a_boundary_created_not_started") fail("AG19A boundary status mismatch");
if (boundary.next_stage_id !== "AG19A") fail("AG19A handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG19A explicit approval missing");
if (boundary.supabase_auth_defer_reminder_required_in_ag19a !== true) fail("AG19A must carry Supabase/Auth reminder");

if (schema.status !== "schema_controlled_real_static_activation_planning_closure_only") fail("Schema status mismatch");

for (const key of [
  "chain_closure_allowed_in_ag18z",
  "planning_summary_allowed_in_ag18z",
  "blocked_register_allowed_in_ag18z",
  "next_path_boundary_allowed_in_ag18z"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_generation_allowed_in_ag18z",
  "article_mutation_allowed_in_ag18z",
  "queue_mutation_allowed_in_ag18z",
  "active_admin_review_queue_record_creation_allowed_in_ag18z",
  "queue_index_mutation_allowed_in_ag18z",
  "admin_action_execution_allowed_in_ag18z",
  "editor_action_execution_allowed_in_ag18z",
  "auth_activation_allowed_in_ag18z",
  "backend_activation_allowed_in_ag18z",
  "supabase_activation_allowed_in_ag18z",
  "github_token_creation_or_exposure_allowed_in_ag18z",
  "github_write_operation_allowed_in_ag18z",
  "public_visibility_switch_allowed_in_ag18z",
  "public_index_mutation_allowed_in_ag18z",
  "public_publishing_operation_allowed_in_ag18z",
  "deployment_trigger_allowed_in_ag18z"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, closure, summary, blocked, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.controlled_real_static_activation_planning_closure_only !== true) fail(`${obj.title || "object"} must be AG18Z closure-only`);
  if (obj.article_generation_performed_in_ag18z !== false) fail(`${obj.title || "object"} must not generate articles`);
  if (obj.article_mutation_performed_in_ag18z !== false) fail(`${obj.title || "object"} must not mutate articles`);
  if (obj.github_token_created_or_exposed_in_ag18z !== false) fail(`${obj.title || "object"} must not create/expose token`);
  if (obj.github_write_operation_performed_in_ag18z !== false) fail(`${obj.title || "object"} must not write to GitHub`);
  if (obj.public_visibility_switch_performed_in_ag18z !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag18z !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.deployment_trigger_performed_in_ag18z !== false) fail(`${obj.title || "object"} must not trigger deployment`);
  if (obj.public_publishing_operation_performed_in_ag18z !== false) fail(`${obj.title || "object"} must not publish`);
  if (obj.supabase_activation_performed_in_ag18z !== false) fail(`${obj.title || "object"} must not activate Supabase`);
}

if (!ag17bReminder.reminder.includes("static/GitHub-controlled go-live first")) fail("Supabase reminder must mention static/GitHub first");
if (!ag17bReminder.reminder.includes("Supabase/Auth/backend later")) fail("Supabase reminder must mention Supabase/Auth/backend later");

for (const phrase of ["Purpose", "Completed Chain", "Final Decision", "Supabase/Auth Reminder", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG18Z document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag18z", "validate:ag18z"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag18z")) {
  fail("validate:project must include validate:ag18z");
}

pass("AG18Z registry is present.");
pass("AG18Z document is present.");
pass("AG18Z review, closure, summary, blocked register, readiness, AG19A boundary, schema, learning and preview are present.");
pass("AG18A through AG18F chain is consumed and summarised.");
pass("Controlled real static activation planning chain is closed.");
pass("Candidate planning, plan audit, dry-run, dry-run audit, non-active scaffold and scaffold audit are preserved.");
pass("Real candidate apply, GitHub token, GitHub write, visibility switch, public index mutation, deployment and publishing remain blocked.");
pass("Supabase/Auth/backend remains deferred and future reminder is required.");
pass("AG19A First Static Activation Pre-Apply Readiness Plan boundary is created with explicit approval required.");
pass("AG18Z is Controlled Real Static Activation Planning Closure only.");
