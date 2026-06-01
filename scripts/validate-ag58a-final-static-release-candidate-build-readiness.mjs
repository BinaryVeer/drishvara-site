import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) {
  console.error(`❌ AG58A validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/build-static-release-candidate.mjs",
  "data/content-intelligence/release-candidate/ag58a-static-build-readiness-manifest.json",
  "data/content-intelligence/quality-reviews/ag57z-pre-live-defect-clearance-closure.json",

  "data/content-intelligence/quality-reviews/ag58a-final-static-release-candidate-build-readiness.json",
  "data/content-intelligence/release-candidate/ag58a-source-consumption-record.json",
  "data/content-intelligence/release-candidate/ag58a-build-readiness-record.json",
  "data/content-intelligence/backend-architecture/ag58a-no-deployment-execution-audit.json",
  "data/content-intelligence/backend-architecture/ag58a-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/quality-registry/ag58a-ag58b-static-route-page-surface-preview-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag58a-to-ag58b-static-route-page-surface-preview-boundary.json",
  "data/quality/ag58a-final-static-release-candidate-build-readiness.json",
  "data/quality/ag58a-final-static-release-candidate-build-readiness-preview.json",
  "docs/quality/AG58A_FINAL_STATIC_RELEASE_CANDIDATE_BUILD_READINESS.md",
  "scripts/generate-ag58a-final-static-release-candidate-build-readiness.mjs",
  "scripts/validate-ag58a-final-static-release-candidate-build-readiness.mjs"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const pkg = readJson("package.json");
if (pkg.scripts?.build !== "node scripts/build-static-release-candidate.mjs") fail("Top-level build script mismatch.");
if (!pkg.scripts?.["validate:ag58a"]) fail("Missing validate:ag58a script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag58a")) fail("validate:project must include validate:ag58a.");

const manifest = readJson("data/content-intelligence/release-candidate/ag58a-static-build-readiness-manifest.json");
if (manifest.audit_passed !== true) fail("Static build readiness manifest must pass.");
if (manifest.status !== "static_build_readiness_passed") fail("Static build readiness status mismatch.");
if (manifest.failures.length !== 0) fail("Static build manifest failures must be zero.");

const ag57z = readJson("data/content-intelligence/quality-reviews/ag57z-pre-live-defect-clearance-closure.json");
if (ag57z.status !== "pre_live_defect_clearance_closed_ready_for_ag58a") fail("AG57Z status mismatch.");
if (ag57z.summary.remaining_defect_count !== 0) fail("AG57Z remaining defect count must be zero.");

const review = readJson("data/content-intelligence/quality-reviews/ag58a-final-static-release-candidate-build-readiness.json");
const buildRecord = readJson("data/content-intelligence/release-candidate/ag58a-build-readiness-record.json");
const noDeployment = readJson("data/content-intelligence/backend-architecture/ag58a-no-deployment-execution-audit.json");
const noBackend = readJson("data/content-intelligence/backend-architecture/ag58a-no-backend-auth-rls-database-runtime-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag58a-ag58b-static-route-page-surface-preview-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag58a-to-ag58b-static-route-page-surface-preview-boundary.json");
const preview = readJson("data/quality/ag58a-final-static-release-candidate-build-readiness-preview.json");

if (review.status !== "final_static_release_candidate_build_readiness_ready_for_ag58b") fail("AG58A review status mismatch.");
if (review.summary.static_build_readiness_passed !== true) fail("Static build readiness summary missing.");
if (review.summary.all_ag57_pre_live_defects_remain_cleared !== true) fail("AG57 clearance continuity missing.");
if (review.summary.deployment_performed !== false) fail("Deployment must remain false.");
if (review.summary.vercel_triggered !== false) fail("Vercel trigger must remain false.");
if (review.summary.backend_runtime_activated !== false) fail("Backend runtime must remain false.");
if (review.summary.service_role_used !== false) fail("Service-role use must remain false.");
if (review.summary.v02_expansion_started !== false) fail("V02 expansion must remain false.");

if (buildRecord.audit_passed !== true) fail("Build readiness record must pass.");
if (buildRecord.build_script !== "node scripts/build-static-release-candidate.mjs") fail("Build readiness script mismatch.");

for (const audit of [noDeployment, noBackend]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${audit.title} failed checks must be zero.`);
}

if (readiness.ready_for_ag58b !== true) fail("AG58B readiness must be true.");
if (readiness.next_stage_id !== "AG58B") fail("Readiness must point to AG58B.");
if (boundary.status !== "ag58b_static_route_page_surface_preview_boundary_created") fail("AG58B boundary mismatch.");

if (preview.static_build_readiness_passed !== 1) fail("Preview static build readiness missing.");
if (preview.deployment_performed !== 0) fail("Preview deployment flag must be zero.");

pass("AG58A Final Static Release Candidate Build Readiness is present.");
pass("Top-level npm build script is static-safe.");
pass("Static build readiness manifest is valid.");
pass("AG57 defect-clearance continuity is preserved.");
pass("No deployment/backend/runtime/service-role/V02 action is recorded.");
pass("AG58B Static Route/Page/Surface Preview Verification readiness is valid.");
