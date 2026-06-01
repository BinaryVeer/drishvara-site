import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) {
  console.error(`❌ AG58B validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "index.html",
  "assets/js/drishvara-language-runtime.js",
  "data/content-intelligence/quality-reviews/ag58a-final-static-release-candidate-build-readiness.json",
  "data/content-intelligence/release-candidate/ag58a-static-build-readiness-manifest.json",

  "data/content-intelligence/quality-reviews/ag58b-static-route-page-surface-preview-verification.json",
  "data/content-intelligence/release-candidate/ag58b-source-consumption-record.json",
  "data/content-intelligence/release-candidate/ag58b-static-surface-preview-verification-record.json",
  "data/content-intelligence/release-candidate/ag58b-homepage-static-surface-record.json",
  "data/content-intelligence/release-candidate/ag58b-daily-signal-surface-record.json",
  "data/content-intelligence/release-candidate/ag58b-sports-desk-surface-record.json",
  "data/content-intelligence/release-candidate/ag58b-word-panchang-vedic-reflection-surface-record.json",
  "data/content-intelligence/release-candidate/ag58b-language-runtime-surface-record.json",
  "data/content-intelligence/backend-architecture/ag58b-no-deployment-execution-audit.json",
  "data/content-intelligence/backend-architecture/ag58b-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/quality-registry/ag58b-ag58z-deployment-readiness-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag58b-to-ag58z-deployment-readiness-closure-boundary.json",
  "data/quality/ag58b-static-route-page-surface-preview-verification.json",
  "data/quality/ag58b-static-route-page-surface-preview-verification-preview.json",
  "docs/quality/AG58B_STATIC_ROUTE_PAGE_SURFACE_PREVIEW_VERIFICATION.md",
  "scripts/generate-ag58b-static-route-page-surface-preview-verification.mjs",
  "scripts/validate-ag58b-static-route-page-surface-preview-verification.mjs"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag58b"]) fail("Missing generate:ag58b script.");
if (!pkg.scripts?.["validate:ag58b"]) fail("Missing validate:ag58b script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag58b")) fail("validate:project must include validate:ag58b.");

const ag58a = readJson("data/content-intelligence/quality-reviews/ag58a-final-static-release-candidate-build-readiness.json");
const ag58aManifest = readJson("data/content-intelligence/release-candidate/ag58a-static-build-readiness-manifest.json");
if (ag58a.status !== "final_static_release_candidate_build_readiness_ready_for_ag58b") fail("AG58A status mismatch.");
if (ag58aManifest.audit_passed !== true) fail("AG58A build manifest must pass.");

const review = readJson("data/content-intelligence/quality-reviews/ag58b-static-route-page-surface-preview-verification.json");
const surface = readJson("data/content-intelligence/release-candidate/ag58b-static-surface-preview-verification-record.json");
const homepage = readJson("data/content-intelligence/release-candidate/ag58b-homepage-static-surface-record.json");
const daily = readJson("data/content-intelligence/release-candidate/ag58b-daily-signal-surface-record.json");
const sports = readJson("data/content-intelligence/release-candidate/ag58b-sports-desk-surface-record.json");
const knowledge = readJson("data/content-intelligence/release-candidate/ag58b-word-panchang-vedic-reflection-surface-record.json");
const language = readJson("data/content-intelligence/release-candidate/ag58b-language-runtime-surface-record.json");
const noDeployment = readJson("data/content-intelligence/backend-architecture/ag58b-no-deployment-execution-audit.json");
const noBackend = readJson("data/content-intelligence/backend-architecture/ag58b-no-backend-auth-rls-database-runtime-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag58b-ag58z-deployment-readiness-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag58b-to-ag58z-deployment-readiness-closure-boundary.json");
const preview = readJson("data/quality/ag58b-static-route-page-surface-preview-verification-preview.json");

if (review.status !== "static_route_page_surface_preview_verification_ready_for_ag58z") fail("AG58B review status mismatch.");

for (const key of [
  "homepage_static_surface_passed",
  "daily_signal_surface_passed",
  "sports_desk_surface_passed",
  "knowledge_preview_surface_passed",
  "language_runtime_surface_passed"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
  if (surface[key] !== true) fail(`${key} surface record missing.`);
  if (preview[key] !== 1) fail(`${key} preview missing.`);
}

if (review.summary.deployment_performed !== false) fail("Deployment must remain false.");
if (review.summary.vercel_triggered !== false) fail("Vercel trigger must remain false.");
if (review.summary.github_release_created !== false) fail("GitHub release must remain false.");
if (review.summary.live_public_check_performed !== false) fail("Live public check must remain false.");
if (review.summary.backend_runtime_activated !== false) fail("Backend runtime must remain false.");
if (review.summary.service_role_used !== false) fail("Service role must remain false.");
if (review.summary.v02_expansion_started !== false) fail("V02 expansion must remain false.");

if (homepage.audit_passed !== true) fail("Homepage surface must pass.");
if (daily.audit_passed !== true) fail("Daily Signal surface must pass.");
if (sports.audit_passed !== true) fail("Sports Desk surface must pass.");
if (knowledge.audit_passed !== true) fail("Knowledge surface must pass.");
if (language.audit_passed !== true) fail("Language runtime surface must pass.");

for (const audit of [noDeployment, noBackend]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${audit.title} failed checks must be zero.`);
}

if (readiness.ready_for_ag58z !== true) fail("AG58Z readiness must be true.");
if (readiness.next_stage_id !== "AG58Z") fail("Readiness must point to AG58Z.");
if (boundary.status !== "ag58z_deployment_readiness_closure_boundary_created") fail("AG58Z boundary mismatch.");

pass("AG58B Static Route/Page/Surface Preview Verification is present.");
pass("Homepage static surface is valid.");
pass("Daily Signal / First Light surface is valid.");
pass("Sports Desk fallback surface is valid.");
pass("Word/Panchang/Vedic/Star Reflection safety surface is valid.");
pass("Language runtime surface is valid.");
pass("No deployment/backend/runtime/service-role/V02 action is recorded.");
pass("AG58Z Deployment Readiness Closure readiness is valid.");
