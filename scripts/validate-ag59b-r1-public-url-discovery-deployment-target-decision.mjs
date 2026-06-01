import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) {
  console.error(`❌ AG59B-R1 validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "data/content-intelligence/quality-reviews/ag59b-controlled-deployment-public-release.json",
  "data/content-intelligence/go-live/ag59b-explicit-approval-record.json",
  "data/content-intelligence/quality-registry/ag59b-ag59c-live-public-url-verification-readiness-record.json",

  "data/content-intelligence/quality-reviews/ag59b-r1-public-url-discovery-deployment-target-decision.json",
  "data/content-intelligence/go-live/ag59b-r1-source-consumption-record.json",
  "data/content-intelligence/go-live/ag59b-r1-public-url-discovery-record.json",
  "data/content-intelligence/go-live/ag59b-r1-deployment-target-decision-record.json",
  "data/content-intelligence/go-live/ag59b-r1-github-pages-activation-plan-record.json",
  "data/content-intelligence/go-live/ag59b-r1-ag59c-live-url-blocker-record.json",
  "data/content-intelligence/backend-architecture/ag59b-r1-no-deployment-execution-audit.json",
  "data/content-intelligence/backend-architecture/ag59b-r1-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag59b-r1-no-v02-expansion-audit.json",
  "data/content-intelligence/quality-registry/ag59b-r1-public-host-activation-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag59b-r1-to-public-host-activation-boundary.json",
  "data/quality/ag59b-r1-public-url-discovery-deployment-target-decision.json",
  "data/quality/ag59b-r1-public-url-discovery-deployment-target-decision-preview.json",
  "docs/quality/AG59B_R1_PUBLIC_URL_DISCOVERY_DEPLOYMENT_TARGET_DECISION.md",
  "scripts/generate-ag59b-r1-public-url-discovery-deployment-target-decision.mjs",
  "scripts/validate-ag59b-r1-public-url-discovery-deployment-target-decision.mjs"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag59b-r1"]) fail("Missing generate:ag59b-r1 script.");
if (!pkg.scripts?.["validate:ag59b-r1"]) fail("Missing validate:ag59b-r1 script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag59b-r1")) fail("validate:project must include validate:ag59b-r1.");

const ag59b = readJson("data/content-intelligence/quality-reviews/ag59b-controlled-deployment-public-release.json");
const ag59bApproval = readJson("data/content-intelligence/go-live/ag59b-explicit-approval-record.json");
if (ag59b.status !== "controlled_public_release_step_ready_for_push_and_ag59c") fail("AG59B status mismatch.");
if (ag59bApproval.explicit_user_approval_recorded !== true) fail("AG59B explicit approval missing.");

const review = readJson("data/content-intelligence/quality-reviews/ag59b-r1-public-url-discovery-deployment-target-decision.json");
const discovery = readJson("data/content-intelligence/go-live/ag59b-r1-public-url-discovery-record.json");
const target = readJson("data/content-intelligence/go-live/ag59b-r1-deployment-target-decision-record.json");
const plan = readJson("data/content-intelligence/go-live/ag59b-r1-github-pages-activation-plan-record.json");
const blocker = readJson("data/content-intelligence/go-live/ag59b-r1-ag59c-live-url-blocker-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag59b-r1-public-host-activation-readiness-record.json");
const preview = readJson("data/quality/ag59b-r1-public-url-discovery-deployment-target-decision-preview.json");

if (review.status !== "public_url_discovery_completed_github_pages_activation_recommended") fail("AG59B-R1 review status mismatch.");
if (review.summary.github_pages_static_branch_root_recommended !== true) fail("GitHub Pages recommendation missing.");
if (review.summary.manual_public_host_activation_required !== true) fail("Manual host activation requirement missing.");
if (review.summary.ready_for_ag59c_now !== false) fail("AG59C must not be ready now.");
if (review.summary.ready_for_ag59c_after_confirmed_url !== true) fail("AG59C after URL readiness missing.");
if (review.summary.live_public_check_performed !== false) fail("Live public check must remain false.");

if (discovery.ag59c_live_url_verification_can_run_now !== false) fail("AG59C cannot run without URL.");
if (target.recommended_target !== "GitHub Pages") fail("Recommended target must be GitHub Pages.");
if (target.recommended_source !== "Deploy from branch: main / root") fail("Recommended source mismatch.");
if (plan.deployment_executed_by_script !== false) fail("Script must not execute deployment.");
if (blocker.ag59c_blocked_now !== true) fail("AG59C blocker missing.");
if (readiness.ready_for_manual_public_host_activation !== true) fail("Manual public host activation readiness missing.");
if (readiness.ready_for_ag59c_now !== false) fail("AG59C readiness now must be false.");
if (preview.ready_for_ag59c_now !== 0) fail("Preview AG59C now must be zero.");

for (const f of [
  "data/content-intelligence/backend-architecture/ag59b-r1-no-deployment-execution-audit.json",
  "data/content-intelligence/backend-architecture/ag59b-r1-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag59b-r1-no-v02-expansion-audit.json"
]) {
  const audit = readJson(f);
  if (audit.audit_passed !== true) fail(`${f} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${f} failed checks must be zero.`);
}

pass("AG59B-R1 Public URL Discovery / Deployment Target Decision is present.");
pass("No confirmed live URL is recorded.");
pass("GitHub Pages main/root activation is recommended.");
pass("AG59C remains blocked until confirmed live URL is available.");
pass("No deployment/backend/runtime/service-role/V02 action is recorded.");
