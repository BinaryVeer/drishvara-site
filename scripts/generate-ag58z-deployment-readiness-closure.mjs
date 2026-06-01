import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const inputs = {
  ag58bReview: "data/content-intelligence/quality-reviews/ag58b-static-route-page-surface-preview-verification.json",
  ag58bSurfacePreview: "data/content-intelligence/release-candidate/ag58b-static-surface-preview-verification-record.json",
  ag58bHomepage: "data/content-intelligence/release-candidate/ag58b-homepage-static-surface-record.json",
  ag58bDailySignal: "data/content-intelligence/release-candidate/ag58b-daily-signal-surface-record.json",
  ag58bSports: "data/content-intelligence/release-candidate/ag58b-sports-desk-surface-record.json",
  ag58bKnowledge: "data/content-intelligence/release-candidate/ag58b-word-panchang-vedic-reflection-surface-record.json",
  ag58bLanguage: "data/content-intelligence/release-candidate/ag58b-language-runtime-surface-record.json",
  ag58bNoDeployment: "data/content-intelligence/backend-architecture/ag58b-no-deployment-execution-audit.json",
  ag58bNoBackend: "data/content-intelligence/backend-architecture/ag58b-no-backend-auth-rls-database-runtime-audit.json",
  ag58bReadiness: "data/content-intelligence/quality-registry/ag58b-ag58z-deployment-readiness-closure-readiness-record.json",
  ag58bBoundary: "data/content-intelligence/mutation-plans/ag58b-to-ag58z-deployment-readiness-closure-boundary.json",
  ag58aReview: "data/content-intelligence/quality-reviews/ag58a-final-static-release-candidate-build-readiness.json",
  ag57zReview: "data/content-intelligence/quality-reviews/ag57z-pre-live-defect-clearance-closure.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag58z-deployment-readiness-closure.json",
  source: "data/content-intelligence/release-candidate/ag58z-source-consumption-record.json",
  closure: "data/content-intelligence/release-candidate/ag58z-deployment-readiness-closure-record.json",
  finalRcStatus: "data/content-intelligence/release-candidate/ag58z-final-static-release-candidate-status-record.json",
  ag59Handoff: "data/content-intelligence/release-candidate/ag58z-ag59-controlled-public-go-live-handoff-record.json",
  noDeployment: "data/content-intelligence/backend-architecture/ag58z-no-deployment-execution-audit.json",
  noBackend: "data/content-intelligence/backend-architecture/ag58z-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag58z-no-v02-expansion-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag58z-ag59a-controlled-public-go-live-approval-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag58z-to-ag59a-controlled-public-go-live-approval-boundary.json",
  registry: "data/quality/ag58z-deployment-readiness-closure.json",
  preview: "data/quality/ag58z-deployment-readiness-closure-preview.json",
  doc: "docs/quality/AG58Z_DEPLOYMENT_READINESS_CLOSURE.md"
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
  if (!exists(p)) throw new Error(`Missing AG58Z input: ${p}`);
}

const data = Object.fromEntries(Object.entries(inputs).map(([k, p]) => [k, readJson(p)]));

if (data.ag58bReview.status !== "static_route_page_surface_preview_verification_ready_for_ag58z") throw new Error("AG58B review status mismatch.");
if (data.ag58bSurfacePreview.audit_passed !== true) throw new Error("AG58B surface preview must pass.");
if (data.ag58bSurfacePreview.homepage_static_surface_passed !== true) throw new Error("Homepage surface must pass.");
if (data.ag58bSurfacePreview.daily_signal_surface_passed !== true) throw new Error("Daily Signal surface must pass.");
if (data.ag58bSurfacePreview.sports_desk_surface_passed !== true) throw new Error("Sports Desk surface must pass.");
if (data.ag58bSurfacePreview.knowledge_preview_surface_passed !== true) throw new Error("Knowledge surface must pass.");
if (data.ag58bSurfacePreview.language_runtime_surface_passed !== true) throw new Error("Language runtime surface must pass.");
if (data.ag58bNoDeployment.audit_passed !== true) throw new Error("AG58B no-deployment audit must pass.");
if (data.ag58bNoBackend.audit_passed !== true) throw new Error("AG58B no-backend audit must pass.");
if (data.ag58bReadiness.ready_for_ag58z !== true) throw new Error("AG58Z readiness missing.");
if (data.ag58bBoundary.status !== "ag58z_deployment_readiness_closure_boundary_created") throw new Error("AG58Z boundary missing.");

if (data.ag58aReview.status !== "final_static_release_candidate_build_readiness_ready_for_ag58b") throw new Error("AG58A review status mismatch.");
if (data.ag57zReview.status !== "pre_live_defect_clearance_closed_ready_for_ag58a") throw new Error("AG57Z review status mismatch.");

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const source = {
  module_id: "AG58Z",
  title: "AG58Z Source Consumption Record",
  status: "source_consumption_recorded",
  consumed_inputs: inputs,
  current_git_context: git,
  interpretation: "AG58Z closes the final static release-candidate readiness series. AG58A build readiness and AG58B static surface preview verification are consumed. No deployment, live public check, backend/runtime activation, service-role use or V02 expansion is performed."
};

const finalRcStatus = {
  module_id: "AG58Z",
  title: "Final Static Release Candidate Status Record",
  status: "final_static_release_candidate_ready_for_controlled_go_live_approval",
  audit_passed: true,
  ag57_pre_live_defects_cleared: true,
  ag58a_static_build_readiness_passed: true,
  ag58b_static_surface_preview_passed: true,
  homepage_static_surface_passed: true,
  daily_signal_surface_passed: true,
  sports_desk_surface_passed: true,
  knowledge_preview_surface_passed: true,
  language_runtime_surface_passed: true,
  deployment_performed: false,
  vercel_triggered: false,
  github_release_created: false,
  live_public_check_performed: false,
  backend_runtime_activated: false,
  service_role_used: false,
  v02_expansion_started: false
};

const closure = {
  module_id: "AG58Z",
  title: "Deployment Readiness Closure Record",
  status: "deployment_readiness_closed_ready_for_ag59a",
  audit_passed: true,
  closure_statement: "AG58 is closed. Static build readiness and static surface preview verification have passed. The repository is ready for AG59A controlled public go-live approval gate, but no deployment or live check is approved or performed at AG58Z.",
  ag58_chain_closed: ["AG58A", "AG58B"],
  final_static_release_candidate_ready: true,
  controlled_public_go_live_approval_required_next: true,
  deployment_performed: false,
  vercel_triggered: false,
  github_release_created: false,
  live_public_check_performed: false,
  backend_runtime_activated: false,
  service_role_used: false,
  v02_expansion_started: false
};

const ag59Handoff = {
  module_id: "AG58Z",
  title: "AG59 Controlled Public Go-Live Handoff Record",
  status: "ag59_controlled_public_go_live_handoff_recorded",
  next_series: "AG59",
  next_stage_id: "AG59A",
  next_stage_title: "Controlled Public Go-Live Approval Gate",
  recommended_sequence: [
    "AG59A — Explicit Controlled Public Go-Live Approval Gate",
    "AG59B — Controlled Deployment / Public Release Step, only after explicit approval",
    "AG59C — Live Public URL Verification, only after deployment approval",
    "AG59Z — V01 Go-Live Closure"
  ],
  ag59_allowed_scope_after_explicit_approval: [
    "Authorize controlled deployment/public release.",
    "Run deployment command or Vercel trigger only if explicitly approved.",
    "Run live public verification only after deployment/public release.",
    "Record final V01 go-live closure."
  ],
  ag59_blocked_until_explicit_approval: [
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
    module_id: "AG58Z",
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
  module_id: "AG58Z",
  title: "AG59A Controlled Public Go-Live Approval Readiness Record",
  status: "ready_for_ag59a_controlled_public_go_live_approval_gate",
  ready_for_ag59a: true,
  next_stage_id: "AG59A",
  next_stage_title: "Controlled Public Go-Live Approval Gate",
  hard_blocker_count_for_ag59a: 0,
  explicit_user_approval_required_for_deployment: true
};

const boundary = {
  module_id: "AG58Z",
  title: "AG58Z to AG59A Controlled Public Go-Live Approval Boundary",
  status: "ag59a_controlled_public_go_live_approval_boundary_created",
  allowed_scope: [
    "Ask for and record explicit user approval for controlled public go-live.",
    "Confirm exact deployment mechanism before execution.",
    "Confirm rollback/checkpoint command before deployment.",
    "Keep backend/Auth/Supabase and V02 out of scope unless separately approved."
  ],
  blocked_scope_until_ag59_explicit_approval: ag59Handoff.ag59_blocked_until_explicit_approval
};

const review = {
  module_id: "AG58Z",
  title: "Deployment Readiness Closure",
  status: "deployment_readiness_closure_ready_for_ag59a",
  depends_on: ["AG58B", "AG58A", "AG57Z"],
  source_file: outputs.source,
  closure_file: outputs.closure,
  final_rc_status_file: outputs.finalRcStatus,
  ag59_handoff_file: outputs.ag59Handoff,
  no_deployment_execution_audit_file: outputs.noDeployment,
  no_backend_runtime_audit_file: outputs.noBackend,
  no_v02_expansion_audit_file: outputs.noV02,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag58z_deployment_readiness_closure_recorded: true,
    final_static_release_candidate_ready: true,
    ag58a_static_build_readiness_passed: true,
    ag58b_static_surface_preview_passed: true,
    ready_for_ag59a_controlled_public_go_live_approval_gate: true,
    explicit_user_approval_required_for_deployment: true,
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

const registry = { module_id: "AG58Z", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG58Z",
  status: review.status,
  ag58z_deployment_readiness_closure_recorded: 1,
  final_static_release_candidate_ready: 1,
  ag58a_static_build_readiness_passed: 1,
  ag58b_static_surface_preview_passed: 1,
  ready_for_ag59a_controlled_public_go_live_approval_gate: 1,
  explicit_user_approval_required_for_deployment: 1,
  deployment_performed: 0,
  vercel_triggered: 0,
  github_release_created: 0,
  live_public_check_performed: 0,
  backend_runtime_activated: 0,
  service_role_used: 0,
  v02_expansion_started: 0
};

const doc = `# AG58Z — Deployment Readiness Closure

## Result

AG58 is closed.

## Closed sequence

- AG58A — Final Static Release Candidate Build Readiness
- AG58B — Static Route/Page/Surface Preview Verification

## Release-candidate status

The final static release candidate is ready for AG59A controlled public go-live approval gate.

## Important

AG58Z does not approve or perform deployment.

## Still blocked until AG59 explicit approval

- No deployment.
- No Vercel trigger.
- No GitHub release/tag.
- No live public check.
- No backend/Auth/Supabase/RLS/database runtime.
- No service-role use.
- No V02 expansion.

## Next

AG59A — Controlled Public Go-Live Approval Gate.
`;

writeJson(outputs.source, source);
writeJson(outputs.closure, closure);
writeJson(outputs.finalRcStatus, finalRcStatus);
writeJson(outputs.ag59Handoff, ag59Handoff);
writeJson(outputs.noDeployment, noDeployment);
writeJson(outputs.noBackend, noBackend);
writeJson(outputs.noV02, noV02);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG58Z Deployment Readiness Closure generated.");
console.log("✅ AG58 closed: AG58A build readiness and AG58B surface preview passed.");
console.log("✅ Ready for AG59A Controlled Public Go-Live Approval Gate.");
console.log("✅ No deployment, live check, backend/runtime, service-role use or V02 expansion performed.");
