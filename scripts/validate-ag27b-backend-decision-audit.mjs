import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(p) {
  return fs.existsSync(path.join(root, p));
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
}

function fail(msg) {
  console.error(`❌ AG27B validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag27a-backend-need-assessment.json",
  "data/content-intelligence/backend-decision/ag27a-backend-need-assessment.json",
  "data/content-intelligence/backend-decision/ag27a-backend-need-signal-register.json",
  "data/content-intelligence/backend-decision/ag27a-static-vs-backend-readiness-matrix.json",
  "data/content-intelligence/backend-decision/ag27a-backend-planning-scope-register.json",
  "data/content-intelligence/quality-registry/ag27a-backend-decision-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag27a-to-ag27b-backend-decision-audit-boundary.json",
  "data/content-intelligence/admin-editor/ag26z-manual-admin-editor-workflow-closure.json",
  "data/content-intelligence/admin-editor/ag26z-ag27-backend-deferral-carry-forward.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",
  "data/content-intelligence/backend-decision/ag27-backend-deferral-record.json",
  "data/content-intelligence/mutation-plans/ag27-to-ag28-conditional-backend-path-boundary.json",

  "data/content-intelligence/quality-reviews/ag27b-backend-decision-audit.json",
  "data/content-intelligence/backend-decision/ag27b-backend-decision-audit.json",
  "data/content-intelligence/backend-decision/ag27b-backend-option-decision-matrix.json",
  "data/content-intelligence/backend-decision/ag27b-supabase-planning-decision-record.json",
  "data/content-intelligence/backend-decision/ag27b-non-activation-audit-register.json",
  "data/content-intelligence/backend-decision/ag27b-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag27b-backend-decision-audit-blocker-register.json",
  "data/content-intelligence/quality-registry/ag27b-supabase-auth-security-rls-plan-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag27b-to-ag27c-supabase-auth-security-rls-plan-boundary.json",
  "data/quality/ag27b-backend-decision-audit.json",
  "data/quality/ag27b-backend-decision-audit-preview.json",
  "docs/quality/AG27B_BACKEND_DECISION_AUDIT.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag27b-backend-decision-audit.json");
const audit = readJson("data/content-intelligence/backend-decision/ag27b-backend-decision-audit.json");
const optionMatrix = readJson("data/content-intelligence/backend-decision/ag27b-backend-option-decision-matrix.json");
const supabaseDecision = readJson("data/content-intelligence/backend-decision/ag27b-supabase-planning-decision-record.json");
const nonActivation = readJson("data/content-intelligence/backend-decision/ag27b-non-activation-audit-register.json");
const consumption = readJson("data/content-intelligence/backend-decision/ag27b-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag27b-backend-decision-audit-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag27b-supabase-auth-security-rls-plan-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag27b-to-ag27c-supabase-auth-security-rls-plan-boundary.json");
const registry = readJson("data/quality/ag27b-backend-decision-audit.json");
const preview = readJson("data/quality/ag27b-backend-decision-audit-preview.json");

const ag27a = readJson("data/content-intelligence/backend-decision/ag27a-backend-need-assessment.json");
const ag27aReadiness = readJson("data/content-intelligence/quality-registry/ag27a-backend-decision-audit-readiness-record.json");
const ag26z = readJson("data/content-intelligence/admin-editor/ag26z-manual-admin-editor-workflow-closure.json");
const ag27 = readJson("data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json");
const ag27Boundary = readJson("data/content-intelligence/mutation-plans/ag27-to-ag28-conditional-backend-path-boundary.json");
const pkg = readJson("package.json");

if (review.status !== "backend_decision_audit_created_ready_for_ag27c") fail("Review status mismatch.");
if (audit.status !== "backend_decision_audit_created_ready_for_ag27c") fail("Audit status mismatch.");
if (audit.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (audit.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (audit.decision_audit.selected_option_id !== "controlled_non_active_supabase_auth_planning") fail("Selected option mismatch.");
if (audit.decision_audit.decision_result !== "proceed_to_ag27c_security_rls_planning_no_activation") fail("Decision result mismatch.");
if (audit.decision_audit.backend_planning_approved_for_next_stage !== true) fail("Backend planning for next stage must be true.");
if (audit.decision_audit.backend_activation_approved_now !== false) fail("Backend activation must be false.");
if (audit.decision_audit.supabase_sandbox_activation_approved_now !== false) fail("Supabase sandbox activation must be false.");
if (audit.decision_audit.auth_activation_approved_now !== false) fail("Auth activation must be false.");
if (audit.decision_audit.database_creation_approved_now !== false) fail("Database creation must be false.");
if (audit.decision_audit.secrets_or_env_setup_approved_now !== false) fail("Secrets/env setup must be false.");
if (audit.decision_audit.ag28_allowed_now !== false) fail("AG28 must remain false.");
if (audit.decision_audit.failed_checks.length !== 0) fail("Decision audit must have zero failed checks.");

for (const flag of [
  "backend_activation_allowed_in_ag27b",
  "supabase_activation_allowed_in_ag27b",
  "auth_activation_allowed_in_ag27b",
  "database_creation_allowed_in_ag27b",
  "rls_policy_creation_allowed_in_ag27b",
  "secret_creation_allowed_in_ag27b",
  "deployment_allowed_in_ag27b",
  "public_mutation_allowed_in_ag27b"
]) {
  if (audit[flag] !== false) fail(`${flag} must be false.`);
}
if (audit.backend_planning_selected_in_ag27b !== true) fail("Backend planning must be selected.");

if (optionMatrix.status !== "backend_option_decision_matrix_created_no_activation") fail("Option matrix status mismatch.");
if (optionMatrix.selected_option_id !== "controlled_non_active_supabase_auth_planning") fail("Option matrix selected option mismatch.");
const selected = optionMatrix.options.find((item) => item.option_id === "controlled_non_active_supabase_auth_planning");
if (!selected || selected.selected !== true) fail("Supabase/Auth non-active planning option must be selected.");
if (!optionMatrix.rejected_paths.includes("activate_supabase_now")) fail("activate_supabase_now must be rejected.");

if (supabaseDecision.status !== "supabase_auth_backend_planning_selected_no_activation") fail("Supabase planning decision status mismatch.");
if (supabaseDecision.decision.backend_planning_path_selected !== true) fail("Backend planning path must be selected.");
if (supabaseDecision.decision.proceed_to_ag27c !== true) fail("Must proceed to AG27C.");
if (supabaseDecision.decision.proceed_to_ag28_now !== false) fail("Must not proceed to AG28 now.");
if (supabaseDecision.decision.supabase_sandbox_activation_now !== false) fail("Supabase sandbox activation must be false.");
if (supabaseDecision.decision.auth_activation_now !== false) fail("Auth activation must be false.");
if (supabaseDecision.decision.database_creation_now !== false) fail("Database creation must be false.");
if (supabaseDecision.decision.secrets_or_env_setup_now !== false) fail("Secrets/env setup must be false.");
if (supabaseDecision.decision.deployment_now !== false) fail("Deployment must be false.");

if (nonActivation.status !== "backend_decision_non_activation_audit_passed") fail("Non-activation audit status mismatch.");
if (nonActivation.audit_passed !== true) fail("Non-activation audit must pass.");
for (const check of nonActivation.checks) {
  if (check.passed !== true) fail(`Non-activation check failed: ${check.check_id}`);
}

if (!consumption.future_consumption?.AG27C) fail("AG27C consumption note missing.");
if (!consumption.future_consumption?.AG27D) fail("AG27D consumption note missing.");
if (!consumption.future_consumption?.AG27Z) fail("AG27Z consumption note missing.");
if (!consumption.future_consumption?.AG28) fail("AG28 note missing.");

if (blocker.status !== "backend_decision_audit_operations_blocked_pending_ag27c") fail("Blocker status mismatch.");
if (readiness.ready_for_ag27c !== true) fail("AG27C readiness missing.");
if (boundary.next_stage_id !== "AG27C") fail("AG27C boundary missing.");
if (boundary.backend_planning_selected !== true) fail("Boundary must select backend planning.");
if (boundary.backend_activation_deferred !== true) fail("Boundary must defer backend activation.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Boundary must defer Supabase/Auth/backend.");
if (boundary.explicit_approval_required_before_activation !== true) fail("Explicit approval before activation required.");

if (review.summary.backend_decision_audit_created !== true) fail("Review summary missing.");
if (review.summary.backend_planning_selected !== true) fail("Review must select backend planning.");
if (review.summary.proceed_to_ag27c !== true) fail("Review must proceed to AG27C.");
if (review.summary.backend_activation_allowed_now !== false) fail("Backend activation must be false.");
if (review.summary.supabase_activation_allowed_now !== false) fail("Supabase activation must be false.");
if (review.summary.auth_activation_allowed_now !== false) fail("Auth activation must be false.");
if (review.summary.database_creation_allowed_now !== false) fail("Database creation must be false.");
if (review.summary.rls_policy_creation_allowed_now !== false) fail("RLS creation must be false.");
if (review.summary.secret_creation_allowed_now !== false) fail("Secrets must be false.");
if (review.summary.ag28_allowed_now !== false) fail("AG28 must be false.");
if (review.summary.ready_for_ag27c !== true) fail("Ready for AG27C missing.");

if (ag27a.status !== "backend_need_assessment_created_ready_for_ag27b") fail("AG27A source status mismatch.");
if (ag27aReadiness.ready_for_ag27b !== true) fail("AG27A readiness must allow AG27B.");
if (ag26z.closure_decision.ag26_detailed_chain_closed !== true) fail("AG26Z chain must be closed.");
if (ag27.checkpoint_decision.backend_deferred !== true) fail("AG27 backend deferral must remain true.");
if (ag27.checkpoint_decision.backend_activation_approved !== false) fail("AG27 backend activation must remain unapproved.");
if (ag27Boundary.explicit_approval_required !== true) fail("AG27 boundary explicit approval missing.");

if (registry.status !== "backend_decision_audit_created_ready_for_ag27c") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.backend_planning_selected !== 1) fail("Preview must mark backend planning selected.");
if (preview.proceed_to_ag27c !== 1) fail("Preview must mark proceed to AG27C.");
if (preview.backend_activation_allowed !== 0) fail("Preview must record 0 backend activation.");
if (preview.supabase_activation_allowed !== 0) fail("Preview must record 0 Supabase activation.");
if (preview.auth_activation_allowed !== 0) fail("Preview must record 0 Auth activation.");
if (preview.database_objects_created !== 0) fail("Preview must record 0 database objects.");
if (preview.rls_policies_created !== 0) fail("Preview must record 0 RLS policies.");
if (preview.secrets_created !== 0) fail("Preview must record 0 secrets.");
if (preview.deployment_done !== 0) fail("Preview must record 0 deployment.");
if (preview.public_items !== 0) fail("Preview must record 0 public items.");
if (preview.backend_objects !== 0) fail("Preview must record 0 backend objects.");
if (preview.ag28_allowed_now !== 0) fail("Preview must mark AG28 blocked.");

for (const expectedInput of [
  "data/content-intelligence/backend-decision/ag27a-backend-need-assessment.json",
  "data/content-intelligence/backend-decision/ag27a-backend-need-signal-register.json",
  "data/content-intelligence/backend-decision/ag27a-static-vs-backend-readiness-matrix.json",
  "data/content-intelligence/admin-editor/ag26z-manual-admin-editor-workflow-closure.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",
  "data/content-intelligence/mutation-plans/ag27-to-ag28-conditional-backend-path-boundary.json"
]) {
  if (!audit.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Audit did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (k === "backend_decision_audit_created" || k === "selected_non_active_backend_planning_path") {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag27b"]) fail("Missing generate:ag27b script.");
if (!pkg.scripts?.["validate:ag27b"]) fail("Missing validate:ag27b script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag27b")) fail("validate:project must include validate:ag27b.");

pass("AG27B Backend Decision Audit is present.");
pass("Controlled non-active Supabase/Auth/backend planning is selected.");
pass("Backend activation, Supabase activation, Auth activation, database, RLS, secrets, deployment and public mutation remain blocked.");
pass("AG27C Supabase/Auth Security and RLS Plan boundary is ready.");
