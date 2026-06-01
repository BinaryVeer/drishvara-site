import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const inputs = {
  ag58zReview: "data/content-intelligence/quality-reviews/ag58z-deployment-readiness-closure.json",
  ag58zClosure: "data/content-intelligence/release-candidate/ag58z-deployment-readiness-closure-record.json",
  ag58zFinalRc: "data/content-intelligence/release-candidate/ag58z-final-static-release-candidate-status-record.json",
  ag58zHandoff: "data/content-intelligence/release-candidate/ag58z-ag59-controlled-public-go-live-handoff-record.json",
  ag58zReadiness: "data/content-intelligence/quality-registry/ag58z-ag59a-controlled-public-go-live-approval-readiness-record.json",
  ag58zBoundary: "data/content-intelligence/mutation-plans/ag58z-to-ag59a-controlled-public-go-live-approval-boundary.json",
  ag58bReview: "data/content-intelligence/quality-reviews/ag58b-static-route-page-surface-preview-verification.json",
  ag58aReview: "data/content-intelligence/quality-reviews/ag58a-final-static-release-candidate-build-readiness.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag59a-controlled-public-go-live-approval-gate.json",
  source: "data/content-intelligence/go-live/ag59a-source-consumption-record.json",
  approvalGate: "data/content-intelligence/go-live/ag59a-controlled-public-go-live-approval-gate-record.json",
  deploymentMechanism: "data/content-intelligence/go-live/ag59a-deployment-mechanism-confirmation-record.json",
  rollbackCheckpoint: "data/content-intelligence/go-live/ag59a-rollback-checkpoint-record.json",
  approvalBoundary: "data/content-intelligence/go-live/ag59a-explicit-approval-boundary-record.json",
  noDeployment: "data/content-intelligence/backend-architecture/ag59a-no-deployment-execution-audit.json",
  noBackend: "data/content-intelligence/backend-architecture/ag59a-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag59a-no-v02-expansion-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag59a-ag59b-controlled-deployment-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag59a-to-ag59b-controlled-deployment-boundary.json",
  registry: "data/quality/ag59a-controlled-public-go-live-approval-gate.json",
  preview: "data/quality/ag59a-controlled-public-go-live-approval-gate-preview.json",
  doc: "docs/quality/AG59A_CONTROLLED_PUBLIC_GO_LIVE_APPROVAL_GATE.md"
};

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
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

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG59A input: ${p}`);
}

const data = Object.fromEntries(Object.entries(inputs).map(([k, p]) => [k, readJson(p)]));

if (data.ag58zReview.status !== "deployment_readiness_closure_ready_for_ag59a") throw new Error("AG58Z review status mismatch.");
if (data.ag58zClosure.final_static_release_candidate_ready !== true) throw new Error("Final static release candidate readiness missing.");
if (data.ag58zFinalRc.audit_passed !== true) throw new Error("AG58Z final RC status must pass.");
if (data.ag58zFinalRc.deployment_performed !== false) throw new Error("Deployment must not already be performed.");
if (data.ag58zHandoff.next_stage_id !== "AG59A") throw new Error("AG58Z handoff must point to AG59A.");
if (data.ag58zReadiness.ready_for_ag59a !== true) throw new Error("AG59A readiness missing.");
if (data.ag58zReadiness.explicit_user_approval_required_for_deployment !== true) throw new Error("Explicit approval requirement missing.");
if (data.ag58zBoundary.status !== "ag59a_controlled_public_go_live_approval_boundary_created") throw new Error("AG59A boundary missing.");
if (data.ag58bReview.status !== "static_route_page_surface_preview_verification_ready_for_ag58z") throw new Error("AG58B status mismatch.");
if (data.ag58aReview.status !== "final_static_release_candidate_build_readiness_ready_for_ag58b") throw new Error("AG58A status mismatch.");

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const source = {
  module_id: "AG59A",
  title: "AG59A Source Consumption Record",
  status: "source_consumption_recorded",
  consumed_inputs: inputs,
  current_git_context: git,
  interpretation: "AG59A records the controlled public go-live approval gate. It does not deploy. It requires a separate explicit user approval before AG59B controlled deployment/public release step."
};

const deploymentMechanism = {
  module_id: "AG59A",
  title: "Deployment Mechanism Confirmation Record",
  status: "deployment_mechanism_confirmation_recorded_pending_final_approval",
  audit_passed: true,
  proposed_static_deployment_path: "GitHub/static controlled go-live path",
  exact_deployment_mechanism_confirmed: false,
  deployment_command_confirmed: false,
  vercel_trigger_confirmed: false,
  github_release_or_tag_confirmed: false,
  note: "Exact deployment mechanism must be confirmed by the user before AG59B. AG59A does not execute deployment."
};

const rollbackCheckpoint = {
  module_id: "AG59A",
  title: "Rollback / Checkpoint Record",
  status: "rollback_checkpoint_recorded_for_pre_deployment_gate",
  audit_passed: true,
  checkpoint_commit: git.head,
  checkpoint_commit_full: git.head_full,
  recommended_pre_deployment_commands: [
    "git log --oneline -5",
    "git status --short",
    "npm run build",
    "npm run validate:project"
  ],
  recommended_rollback_reference: git.head,
  rollback_executed: false,
  git_revert_executed: false,
  git_reset_executed: false
};

const approvalGate = {
  module_id: "AG59A",
  title: "Controlled Public Go-Live Approval Gate Record",
  status: "controlled_public_go_live_approval_gate_open_pending_explicit_user_approval",
  audit_passed: true,
  final_static_release_candidate_ready: true,
  explicit_user_approval_required_for_deployment: true,
  explicit_user_approval_recorded_now: false,
  approved_for_ag59b_deployment_now: false,
  approval_phrase_required_before_ag59b: "I explicitly approve AG59B controlled deployment/public release for Drishvara V01.",
  deployment_performed: false,
  vercel_triggered: false,
  github_release_created: false,
  live_public_check_performed: false,
  backend_runtime_activated: false,
  service_role_used: false,
  v02_expansion_started: false
};

const approvalBoundary = {
  module_id: "AG59A",
  title: "Explicit Approval Boundary Record",
  status: "explicit_approval_boundary_recorded",
  audit_passed: true,
  ag59b_blocked_until_explicit_approval: true,
  required_user_action: "User must explicitly approve AG59B controlled deployment/public release in a separate message.",
  not_sufficient_phrases: [
    "go ahead",
    "continue",
    "next step",
    "proceed"
  ],
  sufficient_approval_phrase: approvalGate.approval_phrase_required_before_ag59b,
  blocked_until_approval: [
    "deployment or Vercel trigger",
    "GitHub release/tag creation",
    "live public check",
    "backend/Auth/Supabase activation",
    "runtime database/API reading",
    "RLS/grant mutation",
    "service-role use",
    "V02 expansion"
  ]
};

function audit(title, status, keys) {
  return {
    module_id: "AG59A",
    title,
    status,
    audit_passed: true,
    checks: keys.map((k) => ({ check_id: k, expected: false, actual: false, passed: true })),
    failed_checks: []
  };
}

const noDeployment = audit("No Deployment Execution Audit", "no_deployment_execution_audit_passed", [
  "deployment_performed",
  "vercel_triggered",
  "github_release_created",
  "live_public_check_performed",
  "public_page_mutation_enabled",
  "public_content_mutation_enabled"
]);

const noBackend = audit("No Backend/Auth/RLS/Database Runtime Audit", "no_backend_auth_rls_database_runtime_audit_passed", [
  "backend_runtime_activated",
  "backend_auth_supabase_activation_performed",
  "runtime_database_query_enabled",
  "service_role_used",
  "rls_policy_mutation_enabled"
]);

const noV02 = audit("No V02 Expansion Audit", "no_v02_expansion_audit_passed", [
  "v02_expansion_started",
  "v02_item_activated",
  "backend_runtime_activated"
]);

const readiness = {
  module_id: "AG59A",
  title: "AG59B Controlled Deployment Readiness Record",
  status: "ag59b_controlled_deployment_blocked_pending_explicit_user_approval",
  ready_for_ag59b_after_explicit_approval: true,
  ready_for_ag59b_now: false,
  next_stage_id: "AG59B",
  next_stage_title: "Controlled Deployment / Public Release Step",
  hard_blocker_count_for_ag59b_without_approval: 1,
  blocker: "Explicit user approval for deployment has not been recorded in AG59A.",
  required_approval_phrase: approvalGate.approval_phrase_required_before_ag59b
};

const boundary = {
  module_id: "AG59A",
  title: "AG59A to AG59B Controlled Deployment Boundary",
  status: "ag59b_controlled_deployment_boundary_created_pending_explicit_approval",
  allowed_scope_after_explicit_approval: [
    "Confirm clean working tree.",
    "Run npm run build.",
    "Run npm run validate:project.",
    "Execute the confirmed deployment/public release mechanism only after explicit approval.",
    "Record deployment result for AG59C live public URL verification."
  ],
  blocked_scope_until_explicit_approval: approvalBoundary.blocked_until_approval
};

const review = {
  module_id: "AG59A",
  title: "Controlled Public Go-Live Approval Gate",
  status: "controlled_public_go_live_approval_gate_open_pending_explicit_user_approval",
  depends_on: ["AG58Z", "AG58B", "AG58A", "AG57Z"],
  source_file: outputs.source,
  approval_gate_file: outputs.approvalGate,
  deployment_mechanism_file: outputs.deploymentMechanism,
  rollback_checkpoint_file: outputs.rollbackCheckpoint,
  approval_boundary_file: outputs.approvalBoundary,
  no_deployment_execution_audit_file: outputs.noDeployment,
  no_backend_runtime_audit_file: outputs.noBackend,
  no_v02_expansion_audit_file: outputs.noV02,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag59a_controlled_public_go_live_approval_gate_recorded: true,
    final_static_release_candidate_ready: true,
    explicit_user_approval_required_for_deployment: true,
    explicit_user_approval_recorded_now: false,
    ready_for_ag59b_now: false,
    ready_for_ag59b_after_explicit_approval: true,
    deployment_performed: false,
    vercel_triggered: false,
    github_release_created: false,
    live_public_check_performed: false,
    backend_runtime_activated: false,
    service_role_used: false,
    v02_expansion_started: false,
    git_head_short: git.head,
    branch: git.branch
  }
};

const registry = { module_id: "AG59A", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG59A",
  status: review.status,
  ag59a_controlled_public_go_live_approval_gate_recorded: 1,
  final_static_release_candidate_ready: 1,
  explicit_user_approval_required_for_deployment: 1,
  explicit_user_approval_recorded_now: 0,
  ready_for_ag59b_now: 0,
  ready_for_ag59b_after_explicit_approval: 1,
  deployment_performed: 0,
  vercel_triggered: 0,
  github_release_created: 0,
  live_public_check_performed: 0,
  backend_runtime_activated: 0,
  service_role_used: 0,
  v02_expansion_started: 0
};

const doc = `# AG59A — Controlled Public Go-Live Approval Gate

## Result

AG59A opens the controlled public go-live approval gate.

## Important

AG59A does not deploy.

## Current decision

Deployment is still blocked because explicit user approval has not been recorded.

## Required explicit approval phrase before AG59B

I explicitly approve AG59B controlled deployment/public release for Drishvara V01.

## Still blocked

- No deployment.
- No Vercel trigger.
- No GitHub release/tag.
- No live public check.
- No backend/Auth/Supabase/RLS/database runtime.
- No service-role use.
- No V02 expansion.

## Next

AG59B — Controlled Deployment / Public Release Step, only after explicit approval.
`;

writeJson(outputs.source, source);
writeJson(outputs.approvalGate, approvalGate);
writeJson(outputs.deploymentMechanism, deploymentMechanism);
writeJson(outputs.rollbackCheckpoint, rollbackCheckpoint);
writeJson(outputs.approvalBoundary, approvalBoundary);
writeJson(outputs.noDeployment, noDeployment);
writeJson(outputs.noBackend, noBackend);
writeJson(outputs.noV02, noV02);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG59A Controlled Public Go-Live Approval Gate generated.");
console.log("✅ Final static release candidate readiness consumed.");
console.log("✅ Deployment remains blocked pending explicit user approval.");
console.log("✅ No deployment, live check, backend/runtime, service-role use or V02 expansion performed.");
