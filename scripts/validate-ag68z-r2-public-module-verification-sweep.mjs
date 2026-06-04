import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG68Z-R2 validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "index.html",
  "scripts/generate-ag68z-r2-public-module-verification-sweep.mjs",
  "scripts/validate-ag68z-r2-public-module-verification-sweep.mjs",
  "data/content-intelligence/quality-reviews/ag68z-r2-public-module-live-static-verification-sweep.json",
  "data/content-intelligence/phase-01-modules/ag68z-r2-public-module-static-verification-evidence-record.json",
  "data/content-intelligence/phase-01-modules/ag68z-r2-public-module-live-verification-evidence-record.json",
  "data/content-intelligence/phase-01-modules/ag68z-r2-generated-json-availability-record.json",
  "data/content-intelligence/mutation-plans/ag68z-r2-to-next-governed-stage-boundary.json",
  "data/content-intelligence/backend-architecture/ag68z-r2-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag68z-r2-no-v02-expansion-audit.json",
  "data/quality/ag68z-r2-public-module-live-static-verification-sweep.json",
  "data/quality/ag68z-r2-public-module-live-static-verification-sweep-preview.json",
  "docs/quality/AG68Z_R2_PUBLIC_MODULE_LIVE_STATIC_VERIFICATION_SWEEP.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag68z-r2"]) fail("Missing generate:ag68z-r2 script.");
if (!pkg.scripts?.["validate:ag68z-r2"]) fail("Missing validate:ag68z-r2 script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag68z-r2")) fail("validate:project must include validate:ag68z-r2.");

const review = readJson("data/content-intelligence/quality-reviews/ag68z-r2-public-module-live-static-verification-sweep.json");
if (review.status !== "ag68z_r2_public_module_live_static_verification_sweep_completed") fail("Review status mismatch.");

for (const key of [
  "local_static_verification_completed",
  "local_static_verification_passed",
  "generated_json_local_availability_checked",
  "live_url_verification_attempted",
  "live_generated_json_checked",
  "next_governed_stage_requires_user_confirmation"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true in review summary.`);
}

for (const key of [
  "backend_runtime_activated",
  "database_runtime_activated",
  "service_role_used",
  "live_sports_sourcing_active",
  "runtime_sports_api_active",
  "external_api_fetch_active",
  "v02_expansion_started"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false in review summary.`);
}

if (typeof review.summary.live_url_verification_reachable !== "boolean") fail("Live URL reachability must be boolean.");
if (review.summary.live_url_verification_claimed !== review.summary.live_url_verification_reachable) {
  fail("Live verification claim must match reachability.");
}

const staticEvidence = readJson("data/content-intelligence/phase-01-modules/ag68z-r2-public-module-static-verification-evidence-record.json");
if (staticEvidence.status !== "local_static_verification_completed") fail("Static evidence status mismatch.");
if (staticEvidence.static_passed !== true) fail("Static verification must pass.");
if (!Array.isArray(staticEvidence.static_results) || staticEvidence.static_results.length < 8) fail("At least 8 modules must be checked.");
if (staticEvidence.failed_modules.length !== 0) fail("Failed module list must be empty.");

const liveEvidence = readJson("data/content-intelligence/phase-01-modules/ag68z-r2-public-module-live-verification-evidence-record.json");
if (liveEvidence.live_homepage.attempted !== true) fail("Live homepage check must be attempted.");
if (liveEvidence.live_verification_claimed !== liveEvidence.live_homepage.reachable) fail("Live claim must match reachability.");

const generatedEvidence = readJson("data/content-intelligence/phase-01-modules/ag68z-r2-generated-json-availability-record.json");
if (!Array.isArray(generatedEvidence.local_generated_refs) || generatedEvidence.local_generated_refs.length < 5) {
  fail("Generated JSON local refs must include at least 5 files.");
}
if (!generatedEvidence.local_generated_refs.every((x) => x.local_exists === true && x.local_bytes > 0)) {
  fail("All local generated refs must exist with bytes.");
}
if (!Array.isArray(generatedEvidence.live_generated_results)) fail("Live generated results must be an array.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag68z-r2-to-next-governed-stage-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("Next stage must not auto-start.");
if (!boundary.blocked_scope_without_explicit_approval.includes("backend/Auth/Supabase activation")) fail("Backend blocker missing.");
if (!boundary.blocked_scope_without_explicit_approval.includes("V02 expansion")) fail("V02 blocker missing.");

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag68z-r2-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag68z-r2-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG68Z-R2 public module live/static verification sweep is present.");
pass("Local static verification passed.");
pass("Live verification was attempted and recorded honestly.");
pass("Generated JSON availability was checked.");
pass("No backend/database/live sports/runtime API/V02 activation is recorded.");
