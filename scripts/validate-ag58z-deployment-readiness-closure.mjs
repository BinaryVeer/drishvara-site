import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) {
  console.error(`❌ AG58Z validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "data/content-intelligence/quality-reviews/ag58b-static-route-page-surface-preview-verification.json",
  "data/content-intelligence/release-candidate/ag58b-static-surface-preview-verification-record.json",
  "data/content-intelligence/quality-registry/ag58b-ag58z-deployment-readiness-closure-readiness-record.json",

  "data/content-intelligence/quality-reviews/ag58z-deployment-readiness-closure.json",
  "data/content-intelligence/release-candidate/ag58z-source-consumption-record.json",
  "data/content-intelligence/release-candidate/ag58z-deployment-readiness-closure-record.json",
  "data/content-intelligence/release-candidate/ag58z-final-static-release-candidate-status-record.json",
  "data/content-intelligence/release-candidate/ag58z-ag59-controlled-public-go-live-handoff-record.json",
  "data/content-intelligence/backend-architecture/ag58z-no-deployment-execution-audit.json",
  "data/content-intelligence/backend-architecture/ag58z-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag58z-no-v02-expansion-audit.json",
  "data/content-intelligence/quality-registry/ag58z-ag59a-controlled-public-go-live-approval-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag58z-to-ag59a-controlled-public-go-live-approval-boundary.json",
  "data/quality/ag58z-deployment-readiness-closure.json",
  "data/quality/ag58z-deployment-readiness-closure-preview.json",
  "docs/quality/AG58Z_DEPLOYMENT_READINESS_CLOSURE.md",
  "scripts/generate-ag58z-deployment-readiness-closure.mjs",
  "scripts/validate-ag58z-deployment-readiness-closure.mjs"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag58z"]) fail("Missing generate:ag58z script.");
if (!pkg.scripts?.["validate:ag58z"]) fail("Missing validate:ag58z script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag58z")) fail("validate:project must include validate:ag58z.");

const ag58b = readJson("data/content-intelligence/quality-reviews/ag58b-static-route-page-surface-preview-verification.json");
const ag58bSurface = readJson("data/content-intelligence/release-candidate/ag58b-static-surface-preview-verification-record.json");
const ag58bReadiness = readJson("data/content-intelligence/quality-registry/ag58b-ag58z-deployment-readiness-closure-readiness-record.json");

if (ag58b.status !== "static_route_page_surface_preview_verification_ready_for_ag58z") fail("AG58B status mismatch.");
if (ag58bSurface.audit_passed !== true) fail("AG58B surface preview must pass.");
if (ag58bReadiness.ready_for_ag58z !== true) fail("AG58Z readiness missing.");

const review = readJson("data/content-intelligence/quality-reviews/ag58z-deployment-readiness-closure.json");
const closure = readJson("data/content-intelligence/release-candidate/ag58z-deployment-readiness-closure-record.json");
const finalStatus = readJson("data/content-intelligence/release-candidate/ag58z-final-static-release-candidate-status-record.json");
const handoff = readJson("data/content-intelligence/release-candidate/ag58z-ag59-controlled-public-go-live-handoff-record.json");
const noDeployment = readJson("data/content-intelligence/backend-architecture/ag58z-no-deployment-execution-audit.json");
const noBackend = readJson("data/content-intelligence/backend-architecture/ag58z-no-backend-auth-rls-database-runtime-audit.json");
const noV02 = readJson("data/content-intelligence/backend-architecture/ag58z-no-v02-expansion-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag58z-ag59a-controlled-public-go-live-approval-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag58z-to-ag59a-controlled-public-go-live-approval-boundary.json");
const preview = readJson("data/quality/ag58z-deployment-readiness-closure-preview.json");

if (review.status !== "deployment_readiness_closure_ready_for_ag59a") fail("AG58Z review status mismatch.");
if (review.summary.final_static_release_candidate_ready !== true) fail("Final static release candidate readiness missing.");
if (review.summary.ready_for_ag59a_controlled_public_go_live_approval_gate !== true) fail("AG59A readiness summary missing.");
if (review.summary.explicit_user_approval_required_for_deployment !== true) fail("Explicit approval requirement missing.");

for (const key of [
  "deployment_performed",
  "vercel_triggered",
  "github_release_created",
  "live_public_check_performed",
  "backend_runtime_activated",
  "service_role_used",
  "v02_expansion_started"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
  if (closure[key] !== false) fail(`${key} must remain false in closure.`);
  if (finalStatus[key] !== false) fail(`${key} must remain false in final status.`);
  if (preview[key] !== 0) fail(`${key} preview must be zero.`);
}

if (closure.audit_passed !== true) fail("Closure record must pass.");
if (closure.final_static_release_candidate_ready !== true) fail("Closure final static RC readiness missing.");
if (closure.controlled_public_go_live_approval_required_next !== true) fail("AG59 approval requirement missing.");

if (finalStatus.audit_passed !== true) fail("Final RC status must pass.");
if (finalStatus.ag58a_static_build_readiness_passed !== true) fail("AG58A continuity missing.");
if (finalStatus.ag58b_static_surface_preview_passed !== true) fail("AG58B continuity missing.");

if (handoff.status !== "ag59_controlled_public_go_live_handoff_recorded") fail("AG59 handoff status mismatch.");
if (handoff.next_stage_id !== "AG59A") fail("Handoff must point to AG59A.");
if (!handoff.ag59_blocked_until_explicit_approval.includes("deployment or Vercel trigger")) fail("AG59 deployment block missing.");

for (const audit of [noDeployment, noBackend, noV02]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${audit.title} failed checks must be zero.`);
}

if (readiness.ready_for_ag59a !== true) fail("AG59A readiness must be true.");
if (readiness.next_stage_id !== "AG59A") fail("Readiness must point to AG59A.");
if (readiness.explicit_user_approval_required_for_deployment !== true) fail("Explicit deployment approval must be required.");
if (boundary.status !== "ag59a_controlled_public_go_live_approval_boundary_created") fail("AG59A boundary mismatch.");

if (preview.final_static_release_candidate_ready !== 1) fail("Preview final static RC readiness missing.");
if (preview.explicit_user_approval_required_for_deployment !== 1) fail("Preview explicit approval flag missing.");

pass("AG58Z Deployment Readiness Closure is present.");
pass("AG58A and AG58B are consumed.");
pass("Final static release candidate is ready for AG59A approval gate.");
pass("Explicit user approval is required before deployment.");
pass("No deployment/live-check/backend/runtime/service-role/V02 action is recorded.");
pass("AG59A Controlled Public Go-Live Approval Gate readiness is valid.");
