import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) {
  console.error(`❌ AG57Z validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag57c-defect-clearance-validation.json",
  "data/content-intelligence/pre-live/ag57c-defect-clearance-validation-record.json",
  "data/content-intelligence/quality-registry/ag57c-ag57z-pre-live-defect-clearance-closure-readiness-record.json",

  "data/content-intelligence/quality-reviews/ag57z-pre-live-defect-clearance-closure.json",
  "data/content-intelligence/pre-live/ag57z-source-consumption-record.json",
  "data/content-intelligence/pre-live/ag57z-pre-live-defect-clearance-closure-record.json",
  "data/content-intelligence/pre-live/ag57z-final-defect-status-record.json",
  "data/content-intelligence/pre-live/ag57z-ag58-final-static-release-candidate-handoff-record.json",
  "data/content-intelligence/backend-architecture/ag57z-no-deployment-execution-audit.json",
  "data/content-intelligence/backend-architecture/ag57z-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag57z-no-v02-expansion-audit.json",
  "data/content-intelligence/quality-registry/ag57z-ag58a-final-static-release-candidate-build-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag57z-to-ag58a-final-static-release-candidate-build-readiness-boundary.json",
  "data/quality/ag57z-pre-live-defect-clearance-closure.json",
  "data/quality/ag57z-pre-live-defect-clearance-closure-preview.json",
  "docs/quality/AG57Z_PRE_LIVE_DEFECT_CLEARANCE_CLOSURE.md",
  "scripts/generate-ag57z-pre-live-defect-clearance-closure.mjs",
  "scripts/validate-ag57z-pre-live-defect-clearance-closure.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag57cReview = readJson("data/content-intelligence/quality-reviews/ag57c-defect-clearance-validation.json");
const ag57cValidation = readJson("data/content-intelligence/pre-live/ag57c-defect-clearance-validation-record.json");
const ag57cReadiness = readJson("data/content-intelligence/quality-registry/ag57c-ag57z-pre-live-defect-clearance-closure-readiness-record.json");

if (ag57cReview.status !== "defect_clearance_validation_ready_for_ag57z") fail("AG57C status mismatch.");
if (ag57cReview.summary.all_ag56z_pre_live_defects_validated_cleared !== true) fail("AG57C all-defects-cleared missing.");
if (ag57cValidation.cleared_defect_count !== 5) fail("AG57C cleared defect count must be 5.");
if (ag57cValidation.remaining_defect_count !== 0) fail("AG57C remaining defect count must be 0.");
if (ag57cReadiness.ready_for_ag57z !== true) fail("AG57Z readiness missing.");

const review = readJson("data/content-intelligence/quality-reviews/ag57z-pre-live-defect-clearance-closure.json");
const closure = readJson("data/content-intelligence/pre-live/ag57z-pre-live-defect-clearance-closure-record.json");
const finalStatus = readJson("data/content-intelligence/pre-live/ag57z-final-defect-status-record.json");
const handoff = readJson("data/content-intelligence/pre-live/ag57z-ag58-final-static-release-candidate-handoff-record.json");
const noDeployment = readJson("data/content-intelligence/backend-architecture/ag57z-no-deployment-execution-audit.json");
const noBackend = readJson("data/content-intelligence/backend-architecture/ag57z-no-backend-auth-rls-database-runtime-audit.json");
const noV02 = readJson("data/content-intelligence/backend-architecture/ag57z-no-v02-expansion-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag57z-ag58a-final-static-release-candidate-build-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag57z-to-ag58a-final-static-release-candidate-build-readiness-boundary.json");
const preview = readJson("data/quality/ag57z-pre-live-defect-clearance-closure-preview.json");
const pkg = readJson("package.json");

if (review.status !== "pre_live_defect_clearance_closed_ready_for_ag58a") fail("AG57Z review status mismatch.");
if (review.summary.ag57z_pre_live_defect_clearance_closed !== true) fail("AG57Z closure summary missing.");
if (review.summary.all_pre_live_defects_cleared !== true) fail("All pre-live defects must be cleared.");
if (review.summary.cleared_defect_count !== 5) fail("Cleared defect count must be 5.");
if (review.summary.remaining_defect_count !== 0) fail("Remaining defect count must be 0.");
if (review.summary.ready_for_ag58a_final_static_release_candidate_build_readiness !== true) fail("AG58A readiness summary missing.");

if (closure.audit_passed !== true) fail("Closure record must pass.");
if (closure.all_pre_live_defects_cleared !== true) fail("Closure must show all defects cleared.");
if (closure.remaining_defect_count !== 0) fail("Closure remaining defect count must be zero.");
if (closure.deployment_performed !== false) fail("Deployment must remain false.");
if (closure.backend_runtime_activated !== false) fail("Backend runtime must remain false.");
if (closure.service_role_used !== false) fail("Service role must remain false.");
if (closure.v02_expansion_started !== false) fail("V02 expansion must remain false.");

if (finalStatus.audit_passed !== true) fail("Final defect status must pass.");
if (finalStatus.original_pre_live_defect_count !== 5) fail("Original defect count must be 5.");
if (finalStatus.cleared_defect_count !== 5) fail("Final cleared defect count must be 5.");
if (finalStatus.remaining_defect_count !== 0) fail("Final remaining defect count must be 0.");
for (const item of finalStatus.closed_defects) {
  if (item.status !== "cleared") fail(`Closed defect not cleared: ${item.defect_id}`);
}

if (handoff.status !== "ag58_final_static_release_candidate_handoff_recorded") fail("AG58 handoff status mismatch.");
if (handoff.next_stage_id !== "AG58A") fail("Handoff must point to AG58A.");

for (const audit of [noDeployment, noBackend, noV02]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${audit.title} failed checks must be zero.`);
}

if (readiness.ready_for_ag58a !== true) fail("AG58A readiness must be true.");
if (readiness.remaining_pre_live_defect_count !== 0) fail("AG58A readiness remaining defect count must be 0.");
if (boundary.status !== "ag58a_final_static_release_candidate_build_readiness_boundary_created") fail("AG58A boundary mismatch.");

if (preview.ag57z_pre_live_defect_clearance_closed !== 1) fail("Preview closure flag missing.");
if (preview.all_pre_live_defects_cleared !== 1) fail("Preview all-defects-cleared missing.");
if (preview.remaining_defect_count !== 0) fail("Preview remaining defect count must be 0.");

if (!pkg.scripts?.["generate:ag57z"]) fail("Missing package script: generate:ag57z");
if (!pkg.scripts?.["validate:ag57z"]) fail("Missing package script: validate:ag57z");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag57z")) fail("validate:project must include validate:ag57z.");

pass("AG57Z Pre-Live Defect Clearance Closure is present.");
pass("AG57A/AG57B/AG57C sequence is closed.");
pass("All five pre-live defects are closed.");
pass("Final defect status record is valid.");
pass("AG58 handoff is valid.");
pass("No deployment/backend/runtime/service-role/V02 action is recorded.");
pass("AG58A Final Static Release Candidate Build Readiness is valid.");
