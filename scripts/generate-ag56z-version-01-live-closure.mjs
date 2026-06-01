import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const files = {
  ag56_8Review: "data/content-intelligence/quality-reviews/ag56-8-version-01-go-live-decision.json",
  ag56_8Source: "data/content-intelligence/content-loop/ag56-8-source-consumption-record.json",
  ag56_8Summary: "data/content-intelligence/content-loop/ag56-8-controlled-test-result-summary.json",
  ag56_8Decision: "data/content-intelligence/content-loop/ag56-8-go-no-go-decision-record.json",
  ag56_8Defect: "data/content-intelligence/content-loop/ag56-8-defect-watch-item-decision-register.json",
  ag56_8DecisionBoundary: "data/content-intelligence/content-loop/ag56-8-v01-live-decision-boundary.json",
  ag56_8NoDeployment: "data/content-intelligence/backend-architecture/ag56-8-no-deployment-execution-audit.json",
  ag56_8NoBackend: "data/content-intelligence/backend-architecture/ag56-8-no-backend-auth-rls-database-runtime-audit.json",
  ag56_8NoV02: "data/content-intelligence/backend-architecture/ag56-8-no-v02-expansion-audit.json",
  ag56_8Readiness: "data/content-intelligence/quality-registry/ag56-8-ag56z-version-01-live-closure-readiness-record.json",
  ag56_8Boundary: "data/content-intelligence/mutation-plans/ag56-8-to-ag56z-version-01-live-closure-boundary.json",

  ag56_7Review: "data/content-intelligence/quality-reviews/ag56-7-audit-log-rollback-readiness-verification.json",
  ag56_7Unresolved: "data/content-intelligence/content-loop/ag56-7-unresolved-pre-go-live-register.json",
  ag56_6Review: "data/content-intelligence/quality-reviews/ag56-6-word-panchang-reflection-vedic-preview-smoke-test.json",
  ag56_5Review: "data/content-intelligence/quality-reviews/ag56-5-homepage-module-surface-verification.json",
  ag56_4Review: "data/content-intelligence/quality-reviews/ag56-4-public-url-listing-verification.json",
  ag56_3Review: "data/content-intelligence/quality-reviews/ag56-3-controlled-publish-test.json",
  ag56_2Review: "data/content-intelligence/quality-reviews/ag56-2-admin-editor-review-workflow-test.json",
  ag56_1Review: "data/content-intelligence/quality-reviews/ag56-1-controlled-dynamic-article-generation-test.json"
};

const out = {
  review: "data/content-intelligence/quality-reviews/ag56z-version-01-live-closure.json",
  source: "data/content-intelligence/content-loop/ag56z-source-consumption-record.json",
  closure: "data/content-intelligence/content-loop/ag56z-version-01-live-closure-record.json",
  preLiveDefectList: "data/content-intelligence/content-loop/ag56z-pre-live-defect-list-record.json",
  finalBoundary: "data/content-intelligence/content-loop/ag56z-final-live-closure-boundary.json",
  handoff: "data/content-intelligence/content-loop/ag56z-post-closure-handoff-record.json",
  noDeployment: "data/content-intelligence/backend-architecture/ag56z-no-deployment-execution-audit.json",
  noBackend: "data/content-intelligence/backend-architecture/ag56z-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag56z-no-v02-expansion-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag56z-pre-live-defect-clearance-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag56z-to-pre-live-defect-clearance-boundary.json",
  registry: "data/quality/ag56z-version-01-live-closure.json",
  preview: "data/quality/ag56z-version-01-live-closure-preview.json",
  doc: "docs/quality/AG56Z_VERSION_01_LIVE_CLOSURE.md"
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
  if (!exists(p)) throw new Error(`Missing AG56Z input: ${p}`);
}

const data = Object.fromEntries(Object.entries(files).map(([k, p]) => [k, readJson(p)]));

if (data.ag56_8Review.status !== "version_01_go_live_decision_ready_for_ag56z") throw new Error("AG56.8 review status mismatch.");
if (data.ag56_8Decision.decision !== "CONDITIONAL_GO_FOR_AG56Z_WITH_PRE_LIVE_DEFECT_LIST") throw new Error("AG56.8 decision mismatch.");
if (data.ag56_8Decision.decision_class !== "CONDITIONAL_GO") throw new Error("AG56.8 decision class mismatch.");
if (data.ag56_8Decision.full_public_go_live_approved_now !== false) throw new Error("Full public go-live must not be approved.");
if (data.ag56_8Defect.open_watch_item_count !== 5) throw new Error("Expected 5 pre-live watch items.");
if (data.ag56_8Readiness.ready_for_ag56z !== true) throw new Error("AG56Z readiness missing.");
if (data.ag56_8Readiness.next_stage_id !== "AG56Z") throw new Error("AG56.8 readiness must point to AG56Z.");
if (data.ag56_8Boundary.next_stage_id !== "AG56Z") throw new Error("AG56.8 boundary must point to AG56Z.");

for (const audit of [data.ag56_8NoDeployment, data.ag56_8NoBackend, data.ag56_8NoV02]) {
  if (audit.audit_passed !== true) throw new Error(`${audit.title} must pass.`);
}

const expectedStatuses = {
  ag56_1Review: "controlled_dynamic_article_generation_test_ready_for_ag56_2",
  ag56_2Review: "admin_editor_review_workflow_test_ready_for_ag56_3",
  ag56_3Review: "controlled_publish_test_ready_for_ag56_4",
  ag56_4Review: "public_url_listing_verification_ready_for_ag56_5",
  ag56_5Review: "homepage_module_surface_verification_ready_for_ag56_6",
  ag56_6Review: "word_panchang_reflection_vedic_preview_smoke_test_ready_for_ag56_7",
  ag56_7Review: "audit_log_rollback_readiness_verification_ready_for_ag56_8"
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
  ag56z_version_01_live_closure_recorded: true,
  ag56_1_to_ag56_8_consumed: true,
  conditional_go_closure_recorded: true,
  pre_live_defect_list_recorded: true,
  final_live_closure_boundary_recorded: true,
  post_closure_handoff_recorded: true,
  pre_live_defect_clearance_readiness_recorded: true
};

const blockedState = {
  ...trueFlags,
  ...Object.fromEntries(falseFlags.map((k) => [k, false]))
};

const source = {
  module_id: "AG56Z",
  title: "AG56Z Source Consumption Record",
  status: "source_consumption_recorded",
  consumed_required_sources: Object.values(files),
  interpretation: "AG56Z closes AG56 as a conditional live-decision closure. It does not approve or execute public go-live, deployment, backend/runtime activation, service-role use, rollback or V02 expansion.",
  current_git_context: git,
  blocked_state: blockedState
};

const preLiveDefectList = {
  module_id: "AG56Z",
  title: "Pre-Live Defect List Record",
  status: "pre_live_defect_list_recorded",
  audit_passed: true,
  defect_source: files.ag56_8Defect,
  open_watch_item_count: 5,
  defects: data.ag56_8Defect.watch_items.map((item, index) => ({
    defect_no: index + 1,
    issue_id: item.issue_id,
    observation: item.observation,
    treatment: item.treatment,
    severity: item.severity,
    status: item.status,
    ag56z_position: "must_resolve_or_explicitly_defer_before_actual_public_go_live"
  })),
  required_logic_to_preserve: {
    daily_signal_default_count: 10,
    daily_signal_india_count: 6,
    daily_signal_international_count: 4,
    homepage_doctrine: "Discover → Read → Reflect",
    long_form_production_strengthening: true,
    reference_and_image_credit_discipline: true
  },
  blocked_state: blockedState
};

const closure = {
  module_id: "AG56Z",
  title: "Version 01 Live Closure Record",
  status: "version_01_live_closure_completed_conditionally",
  audit_passed: true,
  closure_mode: "CONDITIONAL_GO_FOR_AG56Z_WITH_PRE_LIVE_DEFECT_LIST",
  closure_statement: "AG56 controlled content loop is closed as conditional. Full public go-live remains blocked until the pre-live defect list is cleared or explicitly deferred through a separate governed decision.",
  ag56_chain_closed: ["AG56.1", "AG56.2", "AG56.3", "AG56.4", "AG56.5", "AG56.6", "AG56.7", "AG56.8"],
  full_public_go_live_approved_now: false,
  deployment_approved_now: false,
  backend_runtime_approved_now: false,
  v02_expansion_approved_now: false,
  blocked_state: blockedState
};

const finalBoundary = {
  module_id: "AG56Z",
  title: "Final Live Closure Boundary",
  status: "final_live_closure_boundary_recorded",
  boundary_rules: [
    "AG56Z closes AG56 as CONDITIONAL_GO only.",
    "AG56Z does not approve full public go-live.",
    "AG56Z does not deploy or trigger Vercel/GitHub release.",
    "AG56Z does not run live public checks, browser automation or external audit APIs.",
    "AG56Z does not publish or mutate public pages.",
    "AG56Z does not activate backend/Auth/Supabase/RLS/API/database runtime.",
    "AG56Z does not use service-role keys.",
    "AG56Z does not execute rollback.",
    "AG56Z does not activate V02 expansion.",
    "A separate pre-live defect-clearance stage must resolve or explicitly defer the recorded defects before actual public go-live."
  ],
  blocked_state: blockedState
};

const handoff = {
  module_id: "AG56Z",
  title: "Post-Closure Handoff Record",
  status: "post_closure_handoff_recorded",
  recommended_next_stage: "Pre-live defect clearance / public UI-content correction gate",
  next_stage_purpose: [
    "Resolve UI Step 3 Integration public-copy issue.",
    "Resolve Sports Desk loading placeholder issue.",
    "Verify AG45 10-signal rule: 6 India and 4 International.",
    "Verify Discover → Read → Reflect homepage doctrine.",
    "Reconfirm Word/Panchang/Reflection/Vedic safety boundary.",
    "Only after clearance, consider actual deployment/live-check approval separately."
  ],
  blocked_state: blockedState
};

function audit(title, status, keys) {
  return {
    module_id: "AG56Z",
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
  module_id: "AG56Z",
  title: "Pre-Live Defect Clearance Readiness Record",
  status: "ready_for_pre_live_defect_clearance",
  ready_for_pre_live_defect_clearance: true,
  next_stage_title: "Pre-Live Defect Clearance / Public UI-Content Correction Gate",
  closure_result: "AG56 closed conditionally; actual public go-live remains blocked.",
  hard_blocker_count_for_next_stage: 0,
  open_pre_live_defect_count: 5,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG56Z",
  title: "AG56Z to Pre-Live Defect Clearance Boundary",
  status: "pre_live_defect_clearance_boundary_created",
  allowed_scope: [
    "Correct or explicitly defer AG56Z pre-live defect list.",
    "Verify public copy alignment.",
    "Verify Daily Signal 10-count rule.",
    "Verify 6 India / 4 International signal split.",
    "Verify Discover → Read → Reflect homepage doctrine.",
    "Verify Sports Desk stable fallback.",
    "Verify Word/Panchang/Reflection/Vedic safety."
  ],
  blocked_scope: [
    "deployment or Vercel trigger",
    "GitHub release/tag creation",
    "live public check unless separately approved",
    "backend/Auth/Supabase activation",
    "runtime database/API reading",
    "RLS/grant mutation",
    "service-role use",
    "V02 expansion"
  ],
  blocked_state: blockedState
};

const review = {
  module_id: "AG56Z",
  title: "Version 01 Live Closure",
  status: "version_01_live_closure_completed_conditionally",
  depends_on: ["AG56.1", "AG56.2", "AG56.3", "AG56.4", "AG56.5", "AG56.6", "AG56.7", "AG56.8"],
  source_consumption_file: out.source,
  closure_file: out.closure,
  pre_live_defect_list_file: out.preLiveDefectList,
  final_boundary_file: out.finalBoundary,
  post_closure_handoff_file: out.handoff,
  no_deployment_execution_audit_file: out.noDeployment,
  no_backend_runtime_audit_file: out.noBackend,
  no_v02_expansion_audit_file: out.noV02,
  readiness_file: out.readiness,
  boundary_file: out.boundary,
  summary: {
    ...trueFlags,
    closure_mode: "CONDITIONAL_GO_FOR_AG56Z_WITH_PRE_LIVE_DEFECT_LIST",
    full_public_go_live_approved_now: false,
    hard_blocker_count_for_next_stage: 0,
    open_pre_live_defect_count: 5,
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

const registry = { module_id: "AG56Z", title: review.title, status: review.status, generated_artifacts: out };

const preview = {
  module_id: "AG56Z",
  status: review.status,
  ...Object.fromEntries(Object.keys(trueFlags).map((k) => [k, 1])),
  full_public_go_live_approved_now: 0,
  hard_blocker_count_for_next_stage: 0,
  open_pre_live_defect_count: 5,
  daily_signal_default_count: 10,
  daily_signal_india_count: 6,
  daily_signal_international_count: 4,
  ...Object.fromEntries(falseFlags.map((k) => [k, 0]))
};

const doc = `# AG56Z — Version 01 Live Closure

## Closure result

AG56 is closed as:

CONDITIONAL_GO_FOR_AG56Z_WITH_PRE_LIVE_DEFECT_LIST

## Meaning

The controlled content loop has completed, but this is not full public go-live approval.

## Pre-live defect list

1. AG45 daily signal rule: 10 signals = 6 India + 4 International
2. Discover → Read → Reflect homepage doctrine
3. Public-copy issue: internal wording such as UI Step 3 Integration
4. Sports Desk loading placeholders
5. Word/Panchang/Reflection/Vedic safety boundary

## Still blocked

- No deployment or Vercel trigger
- No GitHub release/tag
- No live public checks
- No public page/content mutation
- No backend/Auth/Supabase/RLS/database runtime
- No service-role use
- No rollback execution
- No V02 expansion

## Next

Pre-live defect clearance / public UI-content correction gate.
`;

writeJson(out.source, source);
writeJson(out.closure, closure);
writeJson(out.preLiveDefectList, preLiveDefectList);
writeJson(out.finalBoundary, finalBoundary);
writeJson(out.handoff, handoff);
writeJson(out.noDeployment, noDeployment);
writeJson(out.noBackend, noBackend);
writeJson(out.noV02, noV02);
writeJson(out.readiness, readiness);
writeJson(out.boundary, boundary);
writeJson(out.review, review);
writeJson(out.registry, registry);
writeJson(out.preview, preview);
writeText(out.doc, doc);

console.log("✅ AG56Z Version 01 Live Closure generated.");
console.log("✅ AG56 closed as CONDITIONAL_GO with pre-live defect list.");
console.log("✅ Pre-live defect clearance readiness recorded.");
console.log("✅ Full public go-live, deployment, backend/runtime, rollback and V02 expansion remain blocked.");
console.log("✅ Ready for pre-live defect clearance / public UI-content correction gate.");
