import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) {
  console.error(`❌ AG59B validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "data/content-intelligence/quality-reviews/ag59a-controlled-public-go-live-approval-gate.json",
  "data/content-intelligence/go-live/ag59a-controlled-public-go-live-approval-gate-record.json",

  "data/content-intelligence/quality-reviews/ag59b-controlled-deployment-public-release.json",
  "data/content-intelligence/go-live/ag59b-source-consumption-record.json",
  "data/content-intelligence/go-live/ag59b-explicit-approval-record.json",
  "data/content-intelligence/go-live/ag59b-controlled-release-plan-record.json",
  "data/content-intelligence/go-live/ag59b-controlled-release-execution-record.json",
  "data/content-intelligence/go-live/ag59b-rollback-checkpoint-continuity-record.json",
  "data/content-intelligence/backend-architecture/ag59b-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag59b-no-v02-expansion-audit.json",
  "data/content-intelligence/backend-architecture/ag59b-no-live-public-check-audit.json",
  "data/content-intelligence/quality-registry/ag59b-ag59c-live-public-url-verification-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag59b-to-ag59c-live-public-url-verification-boundary.json",
  "data/quality/ag59b-controlled-deployment-public-release.json",
  "data/quality/ag59b-controlled-deployment-public-release-preview.json",
  "docs/quality/AG59B_CONTROLLED_DEPLOYMENT_PUBLIC_RELEASE.md",
  "scripts/generate-ag59b-controlled-deployment-public-release.mjs",
  "scripts/validate-ag59b-controlled-deployment-public-release.mjs"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag59b"]) fail("Missing generate:ag59b script.");
if (!pkg.scripts?.["validate:ag59b"]) fail("Missing validate:ag59b script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag59b")) fail("validate:project must include validate:ag59b.");

const ag59a = readJson("data/content-intelligence/quality-reviews/ag59a-controlled-public-go-live-approval-gate.json");
const ag59aGate = readJson("data/content-intelligence/go-live/ag59a-controlled-public-go-live-approval-gate-record.json");
if (ag59a.status !== "controlled_public_go_live_approval_gate_open_pending_explicit_user_approval") fail("AG59A status mismatch.");

const approval = readJson("data/content-intelligence/go-live/ag59b-explicit-approval-record.json");
if (approval.explicit_user_approval_recorded !== true) fail("Explicit approval must be recorded.");
if (approval.approval_phrase_received !== ag59aGate.approval_phrase_required_before_ag59b) fail("Approval phrase mismatch.");
if (approval.approved_for_ag59b_controlled_public_release !== true) fail("AG59B approval missing.");

const review = readJson("data/content-intelligence/quality-reviews/ag59b-controlled-deployment-public-release.json");
const releasePlan = readJson("data/content-intelligence/go-live/ag59b-controlled-release-plan-record.json");
const releaseExecution = readJson("data/content-intelligence/go-live/ag59b-controlled-release-execution-record.json");
const rollback = readJson("data/content-intelligence/go-live/ag59b-rollback-checkpoint-continuity-record.json");
const noBackend = readJson("data/content-intelligence/backend-architecture/ag59b-no-backend-auth-rls-database-runtime-audit.json");
const noV02 = readJson("data/content-intelligence/backend-architecture/ag59b-no-v02-expansion-audit.json");
const noLiveCheck = readJson("data/content-intelligence/backend-architecture/ag59b-no-live-public-check-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag59b-ag59c-live-public-url-verification-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag59b-to-ag59c-live-public-url-verification-boundary.json");
const preview = readJson("data/quality/ag59b-controlled-deployment-public-release-preview.json");

if (review.status !== "controlled_public_release_step_ready_for_push_and_ag59c") fail("AG59B review status mismatch.");
if (review.summary.explicit_user_approval_recorded !== true) fail("Approval summary missing.");
if (review.summary.controlled_public_release_step_authorized !== true) fail("Controlled public release authorization missing.");
if (review.summary.repository_push_to_main_required_to_complete_ag59b !== true) fail("Repository push requirement missing.");
if (review.summary.ready_for_ag59c_after_push !== true) fail("AG59C readiness after push missing.");

if (releasePlan.release_command !== "git push origin main") fail("Release command mismatch.");
if (releasePlan.live_public_check_deferred_to_ag59c !== true) fail("Live public check must be deferred to AG59C.");
if (releaseExecution.controlled_public_release_step_authorized !== true) fail("Release execution authorization missing.");
if (releaseExecution.live_public_check_performed !== false) fail("Live public check must remain false in AG59B.");

if (rollback.rollback_executed !== false) fail("Rollback must not execute in AG59B.");

for (const audit of [noBackend, noV02, noLiveCheck]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${audit.title} failed checks must be zero.`);
}

if (readiness.ready_for_ag59c_after_push !== true) fail("AG59C after-push readiness missing.");
if (readiness.next_stage_id !== "AG59C") fail("Readiness must point to AG59C.");
if (boundary.status !== "ag59c_live_public_url_verification_boundary_created") fail("AG59C boundary mismatch.");

for (const key of [
  "deployment_platform_cli_executed_by_generator",
  "github_release_created",
  "live_public_check_performed",
  "backend_runtime_activated",
  "service_role_used",
  "v02_expansion_started"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
  if (preview[key] !== 0) fail(`${key} preview must be zero.`);
}

pass("AG59B Controlled Deployment / Public Release Step is present.");
pass("Explicit approval is recorded.");
pass("Controlled static public release path is valid.");
pass("Repository push to main is the release command.");
pass("Live public URL verification is deferred to AG59C.");
pass("No backend/runtime/service-role/V02 action is recorded.");
