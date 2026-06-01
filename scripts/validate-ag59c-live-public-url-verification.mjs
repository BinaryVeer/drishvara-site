import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) {
  console.error(`❌ AG59C validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "data/content-intelligence/quality-reviews/ag59b-controlled-deployment-public-release.json",
  "data/content-intelligence/quality-reviews/ag59b-r1-public-url-discovery-deployment-target-decision.json",

  "data/content-intelligence/quality-reviews/ag59c-live-public-url-verification.json",
  "data/content-intelligence/go-live/ag59c-source-consumption-record.json",
  "data/content-intelligence/go-live/ag59c-live-url-fetch-record.json",
  "data/content-intelligence/go-live/ag59c-live-public-copy-verification-record.json",
  "data/content-intelligence/go-live/ag59c-live-surface-verification-record.json",
  "data/content-intelligence/go-live/ag59c-live-release-status-record.json",
  "data/content-intelligence/backend-architecture/ag59c-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag59c-no-v02-expansion-audit.json",
  "data/content-intelligence/quality-registry/ag59c-ag59z-v01-go-live-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag59c-to-ag59z-v01-go-live-closure-boundary.json",
  "data/quality/ag59c-live-public-url-verification.json",
  "data/quality/ag59c-live-public-url-verification-preview.json",
  "docs/quality/AG59C_LIVE_PUBLIC_URL_VERIFICATION.md",
  "scripts/generate-ag59c-live-public-url-verification.mjs",
  "scripts/validate-ag59c-live-public-url-verification.mjs"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag59c"]) fail("Missing generate:ag59c script.");
if (!pkg.scripts?.["validate:ag59c"]) fail("Missing validate:ag59c script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag59c")) fail("validate:project must include validate:ag59c.");

const review = readJson("data/content-intelligence/quality-reviews/ag59c-live-public-url-verification.json");
const fetch = readJson("data/content-intelligence/go-live/ag59c-live-url-fetch-record.json");
const copy = readJson("data/content-intelligence/go-live/ag59c-live-public-copy-verification-record.json");
const surface = readJson("data/content-intelligence/go-live/ag59c-live-surface-verification-record.json");
const release = readJson("data/content-intelligence/go-live/ag59c-live-release-status-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag59c-ag59z-v01-go-live-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag59c-to-ag59z-v01-go-live-closure-boundary.json");
const preview = readJson("data/quality/ag59c-live-public-url-verification-preview.json");

if (review.status !== "live_public_url_verification_passed_ready_for_ag59z") fail("AG59C review status mismatch.");
if (review.summary.live_url_reachable !== true) fail("Live URL reachable summary missing.");
if (review.summary.status_code !== 200) fail("Status code summary must be 200.");
if (review.summary.forbidden_internal_labels_cleared !== true) fail("Forbidden internal labels must be cleared.");
if (review.summary.required_public_labels_present !== true) fail("Required public labels must be present.");
if (review.summary.live_surface_verification_passed !== true) fail("Live surface verification must pass.");

if (fetch.audit_passed !== true || fetch.status_code !== "200") fail("Live fetch record must pass with 200.");
if (copy.audit_passed !== true) fail("Public copy record must pass.");
if (copy.forbidden_internal_labels_cleared !== true) fail("Forbidden labels not cleared.");
if (copy.required_public_labels_present !== true) fail("Required labels not present.");
if (surface.audit_passed !== true || surface.all_surface_checks_passed !== true) fail("Surface verification must pass.");
if (release.audit_passed !== true || release.public_release_verified !== true) fail("Release status must be verified.");

if (readiness.ready_for_ag59z !== true) fail("AG59Z readiness missing.");
if (boundary.status !== "ag59z_v01_go_live_closure_boundary_created") fail("AG59Z boundary mismatch.");

for (const f of [
  "data/content-intelligence/backend-architecture/ag59c-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag59c-no-v02-expansion-audit.json"
]) {
  const audit = readJson(f);
  if (audit.audit_passed !== true) fail(`${f} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${f} failed checks must be zero.`);
}

if (preview.live_url_reachable !== 1) fail("Preview live reachable missing.");
if (preview.forbidden_internal_labels_cleared !== 1) fail("Preview forbidden clear missing.");
if (preview.ready_for_ag59z_v01_go_live_closure !== 1) fail("Preview AG59Z readiness missing.");

pass("AG59C Live Public URL Verification is present.");
pass("Live GitHub Pages URL is reachable.");
pass("Live public copy is corrected.");
pass("Live public surfaces are valid.");
pass("No backend/runtime/service-role/V02 action is recorded.");
pass("AG59Z V01 Go-Live Closure readiness is valid.");
