import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) {
  console.error(`❌ AG59A validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "data/content-intelligence/quality-reviews/ag58z-deployment-readiness-closure.json",
  "data/content-intelligence/release-candidate/ag58z-final-static-release-candidate-status-record.json",
  "data/content-intelligence/quality-registry/ag58z-ag59a-controlled-public-go-live-approval-readiness-record.json",

  "data/content-intelligence/quality-reviews/ag59a-controlled-public-go-live-approval-gate.json",
  "data/content-intelligence/go-live/ag59a-source-consumption-record.json",
  "data/content-intelligence/go-live/ag59a-controlled-public-go-live-approval-gate-record.json",
  "data/content-intelligence/go-live/ag59a-deployment-mechanism-confirmation-record.json",
  "data/content-intelligence/go-live/ag59a-rollback-checkpoint-record.json",
  "data/content-intelligence/go-live/ag59a-explicit-approval-boundary-record.json",
  "data/content-intelligence/backend-architecture/ag59a-no-deployment-execution-audit.json",
  "data/content-intelligence/backend-architecture/ag59a-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag59a-no-v02-expansion-audit.json",
  "data/content-intelligence/quality-registry/ag59a-ag59b-controlled-deployment-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag59a-to-ag59b-controlled-deployment-boundary.json",
  "data/quality/ag59a-controlled-public-go-live-approval-gate.json",
  "data/quality/ag59a-controlled-public-go-live-approval-gate-preview.json",
  "docs/quality/AG59A_CONTROLLED_PUBLIC_GO_LIVE_APPROVAL_GATE.md",
  "scripts/generate-ag59a-controlled-public-go-live-approval-gate.mjs",
  "scripts/validate-ag59a-controlled-public-go-live-approval-gate.mjs"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag59a"]) fail("Missing generate:ag59a script.");
if (!pkg.scripts?.["validate:ag59a"]) fail("Missing validate:ag59a script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag59a")) fail("validate:project must include validate:ag59a.");

const ag58z = readJson("data/content-intelligence/quality-reviews/ag58z-deployment-readiness-closure.json");
const ag58zFinal = readJson("data/content-intelligence/release-candidate/ag58z-final-static-release-candidate-status-record.json");
const ag58zReady = readJson("data/content-intelligence/quality-registry/ag58z-ag59a-controlled-public-go-live-approval-readiness-record.json");

if (ag58z.status !== "deployment_readiness_closure_ready_for_ag59a") fail("AG58Z status mismatch.");
if (ag58z.summary.final_static_release_candidate_ready !== true) fail("Final static RC readiness missing.");
if (ag58zFinal.audit_passed !== true) fail("AG58Z final RC status must pass.");
if (ag58zReady.ready_for_ag59a !== true) fail("AG59A readiness missing.");
if (ag58zReady.explicit_user_approval_required_for_deployment !== true) fail("Explicit approval requirement missing.");

const review = readJson("data/content-intelligence/quality-reviews/ag59a-controlled-public-go-live-approval-gate.json");
const gate = readJson("data/content-intelligence/go-live/ag59a-controlled-public-go-live-approval-gate-record.json");
const mechanism = readJson("data/content-intelligence/go-live/ag59a-deployment-mechanism-confirmation-record.json");
const rollback = readJson("data/content-intelligence/go-live/ag59a-rollback-checkpoint-record.json");
const approvalBoundary = readJson("data/content-intelligence/go-live/ag59a-explicit-approval-boundary-record.json");
const noDeployment = readJson("data/content-intelligence/backend-architecture/ag59a-no-deployment-execution-audit.json");
const noBackend = readJson("data/content-intelligence/backend-architecture/ag59a-no-backend-auth-rls-database-runtime-audit.json");
const noV02 = readJson("data/content-intelligence/backend-architecture/ag59a-no-v02-expansion-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag59a-ag59b-controlled-deployment-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag59a-to-ag59b-controlled-deployment-boundary.json");
const preview = readJson("data/quality/ag59a-controlled-public-go-live-approval-gate-preview.json");

if (review.status !== "controlled_public_go_live_approval_gate_open_pending_explicit_user_approval") fail("AG59A review status mismatch.");
if (review.summary.final_static_release_candidate_ready !== true) fail("Final static RC readiness missing in AG59A.");
if (review.summary.explicit_user_approval_required_for_deployment !== true) fail("Explicit approval required summary missing.");
if (review.summary.explicit_user_approval_recorded_now !== false) fail("Explicit approval must not be recorded by AG59A.");
if (review.summary.ready_for_ag59b_now !== false) fail("AG59B must not be ready now.");
if (review.summary.ready_for_ag59b_after_explicit_approval !== true) fail("AG59B readiness after approval missing.");

if (gate.explicit_user_approval_recorded_now !== false) fail("Gate must not record approval now.");
if (gate.approved_for_ag59b_deployment_now !== false) fail("AG59B must not be approved now.");
if (!gate.approval_phrase_required_before_ag59b.includes("I explicitly approve AG59B controlled deployment/public release")) fail("Approval phrase missing.");

if (mechanism.exact_deployment_mechanism_confirmed !== false) fail("Deployment mechanism must remain unconfirmed.");
if (rollback.rollback_executed !== false) fail("Rollback must not execute.");

if (approvalBoundary.ag59b_blocked_until_explicit_approval !== true) fail("AG59B block until approval missing.");
if (!approvalBoundary.not_sufficient_phrases.includes("go ahead")) fail("Insufficient phrase guard missing.");

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
  if (gate[key] !== false) fail(`${key} must remain false in gate.`);
  if (preview[key] !== 0) fail(`${key} preview must be zero.`);
}

for (const audit of [noDeployment, noBackend, noV02]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${audit.title} failed checks must be zero.`);
}

if (readiness.ready_for_ag59b_now !== false) fail("AG59B must remain blocked now.");
if (readiness.ready_for_ag59b_after_explicit_approval !== true) fail("AG59B after-approval readiness missing.");
if (readiness.hard_blocker_count_for_ag59b_without_approval !== 1) fail("One approval blocker must remain.");
if (boundary.status !== "ag59b_controlled_deployment_boundary_created_pending_explicit_approval") fail("AG59B boundary mismatch.");

pass("AG59A Controlled Public Go-Live Approval Gate is present.");
pass("Final static release candidate is consumed.");
pass("Explicit user approval is required before deployment.");
pass("AG59B remains blocked until explicit approval.");
pass("No deployment/live-check/backend/runtime/service-role/V02 action is recorded.");
