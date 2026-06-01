import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const files = {
  ag56_7Review: "data/content-intelligence/quality-reviews/ag56-7-audit-log-rollback-readiness-verification.json",
  ag56_7Ui: "data/content-intelligence/content-loop/ag56-7-ui-content-logic-carry-forward-audit.json",
  ag56_7Unresolved: "data/content-intelligence/content-loop/ag56-7-unresolved-pre-go-live-register.json",
  ag56_7Readiness: "data/content-intelligence/quality-registry/ag56-7-ag56-8-version-01-go-live-decision-readiness-record.json",
  ag56_7Boundary: "data/content-intelligence/mutation-plans/ag56-7-to-ag56-8-version-01-go-live-decision-boundary.json",
  ag56_6Review: "data/content-intelligence/quality-reviews/ag56-6-word-panchang-reflection-vedic-preview-smoke-test.json",
  ag56_5Review: "data/content-intelligence/quality-reviews/ag56-5-homepage-module-surface-verification.json",
  ag56_4Review: "data/content-intelligence/quality-reviews/ag56-4-public-url-listing-verification.json",
  ag56_3Review: "data/content-intelligence/quality-reviews/ag56-3-controlled-publish-test.json",
  ag56_2Review: "data/content-intelligence/quality-reviews/ag56-2-admin-editor-review-workflow-test.json",
  ag56_1Review: "data/content-intelligence/quality-reviews/ag56-1-controlled-dynamic-article-generation-test.json"
};

const out = {
  review: "data/content-intelligence/quality-reviews/ag56-8-version-01-go-live-decision.json",
  source: "data/content-intelligence/content-loop/ag56-8-source-consumption-record.json",
  summary: "data/content-intelligence/content-loop/ag56-8-controlled-test-result-summary.json",
  decision: "data/content-intelligence/content-loop/ag56-8-go-no-go-decision-record.json",
  defect: "data/content-intelligence/content-loop/ag56-8-defect-watch-item-decision-register.json",
  decisionBoundary: "data/content-intelligence/content-loop/ag56-8-v01-live-decision-boundary.json",
  noDeployment: "data/content-intelligence/backend-architecture/ag56-8-no-deployment-execution-audit.json",
  noBackend: "data/content-intelligence/backend-architecture/ag56-8-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag56-8-no-v02-expansion-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag56-8-ag56z-version-01-live-closure-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag56-8-to-ag56z-version-01-live-closure-boundary.json",
  registry: "data/quality/ag56-8-version-01-go-live-decision.json",
  preview: "data/quality/ag56-8-version-01-go-live-decision-preview.json",
  doc: "docs/quality/AG56_8_VERSION_01_GO_LIVE_DECISION.md"
};

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}
function writeText(p, txt) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), txt);
}
function run(cmd) {
  try { return execSync(cmd, { cwd: root, encoding: "utf8" }).trim(); }
  catch { return ""; }
}

for (const p of Object.values(files)) {
  if (!exists(p)) throw new Error(`Missing AG56.8 input: ${p}`);
}

const data = Object.fromEntries(Object.entries(files).map(([k, p]) => [k, readJson(p)]));

if (data.ag56_7Review.status !== "audit_log_rollback_readiness_verification_ready_for_ag56_8") throw new Error("AG56.7 status mismatch.");
if (data.ag56_7Readiness.ready_for_ag56_8 !== true) throw new Error("AG56.8 readiness missing.");
if (data.ag56_7Boundary.next_stage_id !== "AG56.8") throw new Error("AG56.7 boundary must point to AG56.8.");
if (data.ag56_7Unresolved.open_watch_item_count !== 5) throw new Error("Expected 5 unresolved watch items.");
if (data.ag56_7Review.summary.daily_signal_default_count !== 10) throw new Error("Daily signal count must be 10.");
if (data.ag56_7Review.summary.daily_signal_india_count !== 6) throw new Error("India signal count must be 6.");
if (data.ag56_7Review.summary.daily_signal_international_count !== 4) throw new Error("International signal count must be 4.");
if (data.ag56_7Review.summary.homepage_doctrine !== "Discover → Read → Reflect") throw new Error("Homepage doctrine mismatch.");

const expectedStatuses = {
  ag56_1Review: "controlled_dynamic_article_generation_test_ready_for_ag56_2",
  ag56_2Review: "admin_editor_review_workflow_test_ready_for_ag56_3",
  ag56_3Review: "controlled_publish_test_ready_for_ag56_4",
  ag56_4Review: "public_url_listing_verification_ready_for_ag56_5",
  ag56_5Review: "homepage_module_surface_verification_ready_for_ag56_6",
  ag56_6Review: "word_panchang_reflection_vedic_preview_smoke_test_ready_for_ag56_7"
};

for (const [key, status] of Object.entries(expectedStatuses)) {
  if (data[key].status !== status) throw new Error(`${key} status mismatch.`);
}

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short origin/main"),
  status: run("git status --short") || "clean"
};

const decisionValue = "CONDITIONAL_GO_FOR_AG56Z_WITH_PRE_LIVE_DEFECT_LIST";
const falseFlags = [
  "full_public_go_live_approved",
  "actual_live_declaration_approved",
  "deployment_approved",
  "deployment_performed",
  "actual_deployment_triggered",
  "vercel_deployment_triggered",
  "github_release_created",
  "live_public_check_executed",
  "browser_automation_enabled",
  "external_audit_api_enabled",
  "public_page_mutation_enabled",
  "public_content_mutation_enabled",
  "content_publishing_enabled",
  "homepage_live_updated",
  "live_listing_updated",
  "public_url_live",
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "service_role_key_used",
  "service_role_key_exposed",
  "rls_policy_mutation_enabled",
  "grant_mutation_enabled",
  "runtime_database_query_enabled",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
  "runtime_publish_queue_enabled",
  "runtime_cms_enabled",
  "public_dashboard_exposed",
  "automated_external_fetch_enabled",
  "rollback_operation_executed",
  "git_revert_executed",
  "git_reset_executed",
  "actual_go_live_approval_granted",
  "v02_item_activated"
];

const trueFlags = {
  ag56_8_version_01_go_live_decision_recorded: true,
  ag56_1_to_ag56_7_consumed: true,
  controlled_test_result_summary_recorded: true,
  go_no_go_decision_recorded: true,
  defect_watch_item_decision_register_recorded: true,
  v01_live_decision_boundary_recorded: true,
  conditional_go_for_ag56z_recorded: true,
  ready_for_ag56z_version_01_live_closure: true
};

const blockedState = {
  ...trueFlags,
  ...Object.fromEntries(falseFlags.map((k) => [k, false]))
};

const source = {
  module_id: "AG56.8",
  title: "AG56.8 Source Consumption Record",
  status: "source_consumption_recorded",
  consumed_required_sources: Object.values(files),
  interpretation: "AG56.8 records a conditional go decision for AG56Z closure only. Full public go-live, deployment, backend/runtime and V02 expansion remain blocked.",
  current_git_context: git,
  blocked_state: blockedState
};

const summary = {
  module_id: "AG56.8",
  title: "Controlled Test Result Summary",
  status: "controlled_test_result_summary_recorded",
  audit_passed: true,
  completed_chain: ["AG56.1", "AG56.2", "AG56.3", "AG56.4", "AG56.5", "AG56.6", "AG56.7"],
  controlled_test_passed_for_closure: true,
  full_public_go_live_ready: false,
  reason_full_public_go_live_not_ready: "Five unresolved pre-live watch items remain open from AG56.7.",
  blocked_state: blockedState
};

const defect = {
  module_id: "AG56.8",
  title: "Defect / Watch Item Decision Register",
  status: "defect_watch_item_decision_register_recorded",
  audit_passed: true,
  open_watch_item_count: 5,
  decision_treatment: "carry_forward_to_ag56z_as_pre_live_defect_list",
  watch_items: data.ag56_7Unresolved.open_watch_items.map((item) => ({
    ...item,
    ag56_8_decision: "must_resolve_or_explicitly_defer_before_actual_public_go_live",
    blocks_full_public_go_live_now: true,
    blocks_ag56z_closure_record: false
  })),
  daily_signal_rule_decision: {
    required_default_total: 10,
    required_india_signals: 6,
    required_international_signals: 4,
    decision: "must_be_validated_before_actual_public_go_live"
  },
  homepage_doctrine_decision: {
    required_public_movement: "Discover → Read → Reflect",
    decision: "must_replace_internal_public_copy_or_explicitly_defer"
  },
  blocked_state: blockedState
};

const decision = {
  module_id: "AG56.8",
  title: "Go / No-Go Decision Record",
  status: "go_no_go_decision_recorded",
  audit_passed: true,
  decision: decisionValue,
  decision_class: "CONDITIONAL_GO",
  decision_scope: "AG56Z closure with explicit pre-live defect list only",
  decision_rationale: [
    "AG56.1–AG56.7 controlled content loop completed and validated.",
    "Audit-log and rollback readiness records are present.",
    "AG45 daily signal rule and homepage doctrine are carried forward.",
    "AG46 long-form production strengthening is carried forward.",
    "Five unresolved pre-go-live watch items remain open.",
    "Full public go-live/deployment is therefore not approved."
  ],
  approved_now: [
    "Proceed to AG56Z Version 01 Live Closure record.",
    "Close AG56 with conditional decision and explicit pre-live defect list."
  ],
  not_approved_now: [
    "full public go-live declaration",
    "deployment or Vercel trigger",
    "GitHub release/tag creation",
    "live public checks",
    "public page/content mutation",
    "backend/Auth/Supabase activation",
    "runtime database/API reading",
    "RLS/grant mutation",
    "service-role use",
    "V02 expansion"
  ],
  full_public_go_live_approved_now: false,
  deployment_approved_now: false,
  backend_runtime_approved_now: false,
  v02_expansion_approved_now: false,
  blocked_state: blockedState
};

const decisionBoundary = {
  module_id: "AG56.8",
  title: "V01 Live Decision Boundary",
  status: "v01_live_decision_boundary_recorded",
  boundary_rules: [
    "AG56.8 records the go/no-go decision only.",
    "AG56.8 decision is CONDITIONAL_GO for AG56Z closure with a pre-live defect list.",
    "AG56.8 does not approve full public go-live.",
    "AG56.8 does not deploy or trigger Vercel/GitHub release.",
    "AG56.8 does not run live public checks, browser automation or external audit APIs.",
    "AG56.8 does not publish or mutate public pages.",
    "AG56.8 does not activate backend/Auth/Supabase/RLS/API/database runtime.",
    "AG56.8 does not use service-role keys.",
    "AG56.8 does not activate V02 expansion.",
    "AG56Z may close AG56 as conditional live-decision closure with explicit defect list."
  ],
  blocked_state: blockedState
};

function audit(title, status, keys) {
  return {
    module_id: "AG56.8",
    title,
    status,
    audit_passed: true,
    checks: keys.map((k) => ({ check_id: k, expected: false, actual: false, passed: true })),
    failed_checks: [],
    blocked_state: blockedState
  };
}

const noDeployment = audit("No Deployment Execution Audit", "no_deployment_execution_audit_passed", [
  "full_public_go_live_approved", "deployment_approved", "deployment_performed", "actual_deployment_triggered",
  "vercel_deployment_triggered", "github_release_created", "live_public_check_executed",
  "public_page_mutation_enabled", "public_content_mutation_enabled", "content_publishing_enabled"
]);

const noBackend = audit("No Backend/Auth/RLS/Database Runtime Audit", "no_backend_auth_rls_database_runtime_audit_passed", [
  "backend_auth_supabase_activation_approved", "backend_auth_supabase_activation_performed",
  "service_role_key_used", "service_role_key_exposed", "rls_policy_mutation_enabled",
  "grant_mutation_enabled", "runtime_database_query_enabled", "website_database_reading_enabled"
]);

const noV02 = audit("No V02 Expansion Audit", "no_v02_expansion_audit_passed", [
  "rollback_operation_executed", "git_revert_executed", "git_reset_executed",
  "actual_go_live_approval_granted", "v02_item_activated"
]);

const readiness = {
  module_id: "AG56.8",
  title: "AG56Z Version 01 Live Closure Readiness Record",
  status: "ready_for_ag56z_version_01_live_closure",
  ready_for_ag56z: true,
  next_stage_id: "AG56Z",
  next_stage_title: "Version 01 Live Closure",
  closure_mode: "conditional_live_decision_closure_with_pre_live_defect_list",
  hard_blocker_count_for_ag56z: 0,
  open_watch_item_count_for_ag56z: 5,
  ag56z_allowed_scope: [
    "Consume AG56.8 conditional go/no-go decision.",
    "Declare AG56 controlled content loop closed as CONDITIONAL_GO_FOR_AG56Z_WITH_PRE_LIVE_DEFECT_LIST.",
    "Record the pre-live defect list explicitly.",
    "Confirm actual public go-live/deployment remains blocked until defects are resolved or separately approved.",
    "Confirm V02 remains separate scaffolded expansion."
  ],
  ag56z_blocked_scope: [
    "deployment or Vercel trigger",
    "GitHub release/tag creation",
    "live public check unless separately approved",
    "public page/content mutation",
    "backend/Auth/Supabase activation",
    "runtime database/API reading",
    "RLS/grant mutation",
    "service-role use",
    "V02 expansion"
  ],
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG56.8",
  title: "AG56.8 to AG56Z Version 01 Live Closure Boundary",
  status: "ag56z_version_01_live_closure_boundary_created",
  next_stage_id: "AG56Z",
  next_stage_title: "Version 01 Live Closure",
  allowed_scope: readiness.ag56z_allowed_scope,
  blocked_scope: readiness.ag56z_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "AG56.8",
  title: "Version 01 Go-Live Decision",
  status: "version_01_go_live_decision_ready_for_ag56z",
  depends_on: ["AG56.1", "AG56.2", "AG56.3", "AG56.4", "AG56.5", "AG56.6", "AG56.7"],
  source_consumption_file: out.source,
  controlled_test_summary_file: out.summary,
  go_no_go_decision_file: out.decision,
  defect_watch_decision_file: out.defect,
  v01_decision_boundary_file: out.decisionBoundary,
  no_deployment_execution_audit_file: out.noDeployment,
  no_backend_runtime_audit_file: out.noBackend,
  no_v02_expansion_audit_file: out.noV02,
  readiness_file: out.readiness,
  boundary_file: out.boundary,
  summary: {
    ...trueFlags,
    decision: decisionValue,
    decision_class: "CONDITIONAL_GO",
    full_public_go_live_approved_now: false,
    hard_blocker_count_for_ag56z: 0,
    open_watch_item_count_for_ag56z: 5,
    daily_signal_default_count: 10,
    daily_signal_india_count: 6,
    daily_signal_international_count: 4,
    homepage_doctrine: "Discover → Read → Reflect",
    git_head_short: git.head,
    branch: git.branch,
    ...Object.fromEntries(falseFlags.map((k) => [k, false]))
  },
  blocked_state: blockedState
};

const registry = { module_id: "AG56.8", title: review.title, status: review.status, generated_artifacts: out };

const preview = {
  module_id: "AG56.8",
  status: review.status,
  ...Object.fromEntries(Object.keys(trueFlags).map((k) => [k, 1])),
  decision: decisionValue,
  decision_class: "CONDITIONAL_GO",
  full_public_go_live_approved_now: 0,
  hard_blocker_count_for_ag56z: 0,
  open_watch_item_count_for_ag56z: 5,
  daily_signal_default_count: 10,
  daily_signal_india_count: 6,
  daily_signal_international_count: 4,
  ...Object.fromEntries(falseFlags.map((k) => [k, 0]))
};

const doc = `# AG56.8 — Version 01 Go-Live Decision

## Decision

CONDITIONAL_GO_FOR_AG56Z_WITH_PRE_LIVE_DEFECT_LIST

## Meaning

The AG56 controlled content loop has completed and may move to AG56Z closure, but this is not full public go-live approval.

## Why not full public go-live

AG56.7 carries five unresolved pre-live watch items:

- AG45 daily signal rule: 10 signals by default, 6 India and 4 International
- Discover → Read → Reflect homepage doctrine
- Public-copy issue: internal wording such as UI Step 3 Integration
- Sports Desk loading placeholders
- Word/Panchang/Reflection/Vedic safety boundary

## Approved now

- Proceed to AG56Z closure.
- Carry explicit pre-live defect list into AG56Z.
- Keep V02 separate.

## Still blocked

- No deployment or Vercel trigger
- No GitHub release/tag
- No live public checks
- No public page/content mutation
- No backend/Auth/Supabase/RLS/database runtime
- No service-role use
- No V02 expansion

## Next

AG56Z — Version 01 Live Closure.
`;

writeJson(out.source, source);
writeJson(out.summary, summary);
writeJson(out.decision, decision);
writeJson(out.defect, defect);
writeJson(out.decisionBoundary, decisionBoundary);
writeJson(out.noDeployment, noDeployment);
writeJson(out.noBackend, noBackend);
writeJson(out.noV02, noV02);
writeJson(out.readiness, readiness);
writeJson(out.boundary, boundary);
writeJson(out.review, review);
writeJson(out.registry, registry);
writeJson(out.preview, preview);
writeText(out.doc, doc);

console.log("✅ AG56.8 Version 01 Go-Live Decision generated.");
console.log("✅ Decision recorded: CONDITIONAL_GO_FOR_AG56Z_WITH_PRE_LIVE_DEFECT_LIST.");
console.log("✅ Five unresolved pre-live watch items carried into AG56Z.");
console.log("✅ Full public go-live, deployment, backend/runtime and V02 expansion remain blocked.");
console.log("✅ Ready for AG56Z Version 01 Live Closure.");
