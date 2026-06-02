import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG59Z validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "data/content-intelligence/quality-reviews/ag59c-live-public-url-verification.json",
  "data/content-intelligence/quality-reviews/ag59c-r1-live-runtime-rendered-copy-stabilisation.json",
  "data/content-intelligence/quality-reviews/ag59z-v01-go-live-closure.json",
  "data/content-intelligence/go-live/ag59z-source-consumption-record.json",
  "data/content-intelligence/go-live/ag59z-v01-go-live-closure-record.json",
  "data/content-intelligence/go-live/ag59z-final-v01-live-status-record.json",
  "data/content-intelligence/go-live/ag59z-public-url-record.json",
  "data/content-intelligence/go-live/ag59z-backend-v02-deferral-continuity-record.json",
  "data/content-intelligence/go-live/ag59z-post-live-stabilisation-handoff-record.json",
  "data/content-intelligence/backend-architecture/ag59z-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag59z-no-v02-expansion-audit.json",
  "data/content-intelligence/quality-registry/ag59z-post-live-stabilisation-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag59z-to-post-live-stabilisation-boundary.json",
  "data/quality/ag59z-v01-go-live-closure.json",
  "data/quality/ag59z-v01-go-live-closure-preview.json",
  "docs/quality/AG59Z_V01_GO_LIVE_CLOSURE.md",
  "scripts/generate-ag59z-v01-go-live-closure.mjs",
  "scripts/validate-ag59z-v01-go-live-closure.mjs"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag59z"]) fail("Missing generate:ag59z script.");
if (!pkg.scripts?.["validate:ag59z"]) fail("Missing validate:ag59z script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag59z")) fail("validate:project must include validate:ag59z.");

const ag59c = readJson("data/content-intelligence/quality-reviews/ag59c-live-public-url-verification.json");
const ag59cR1 = readJson("data/content-intelligence/quality-reviews/ag59c-r1-live-runtime-rendered-copy-stabilisation.json");

if (ag59c.status !== "live_public_url_verification_passed_ready_for_ag59z") fail("AG59C status mismatch.");
if (ag59cR1.status !== "live_runtime_rendered_copy_stabilisation_passed_ready_for_ag59z") fail("AG59C-R1 status mismatch.");
if (ag59cR1.summary.ready_for_ag59z !== true) fail("AG59C-R1 readiness missing.");

const review = readJson("data/content-intelligence/quality-reviews/ag59z-v01-go-live-closure.json");
const closure = readJson("data/content-intelligence/go-live/ag59z-v01-go-live-closure-record.json");
const finalLive = readJson("data/content-intelligence/go-live/ag59z-final-v01-live-status-record.json");
const publicUrl = readJson("data/content-intelligence/go-live/ag59z-public-url-record.json");
const deferral = readJson("data/content-intelligence/go-live/ag59z-backend-v02-deferral-continuity-record.json");
const handoff = readJson("data/content-intelligence/go-live/ag59z-post-live-stabilisation-handoff-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag59z-post-live-stabilisation-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag59z-to-post-live-stabilisation-boundary.json");
const preview = readJson("data/quality/ag59z-v01-go-live-closure-preview.json");

if (review.status !== "v01_go_live_closed") fail("AG59Z review status mismatch.");
if (review.summary.v01_live_closed !== true) fail("V01 live closure summary missing.");
if (review.summary.live_public_url_verified !== true) fail("Live public URL verification summary missing.");
if (review.summary.live_runtime_rendered_copy_stabilised !== true) fail("Runtime/rendered-copy stabilisation summary missing.");
if (review.summary.backend_runtime_activated !== false) fail("Backend runtime must remain false.");
if (review.summary.service_role_used !== false) fail("Service role must remain false.");
if (review.summary.v02_expansion_started !== false) fail("V02 expansion must remain false.");

if (closure.status !== "v01_go_live_closed") fail("Closure status mismatch.");
if (closure.v01_live_verified !== true) fail("Closure must verify V01 live.");
if (!closure.closed_sequence.includes("AG59C-R1")) fail("Closure must include AG59C-R1.");
if (finalLive.status !== "drishvara_v01_live_verified") fail("Final live status mismatch.");
if (finalLive.v01_live !== true) fail("Final live status must show V01 live.");
if (finalLive.live_runtime_rendered_copy_stabilised !== true) fail("Final live status must include runtime/rendered-copy stabilisation.");

if (publicUrl.live_url !== "https://binaryveer.github.io/drishvara-site/") fail("Public URL mismatch.");
if (publicUrl.runtime_rendered_copy_verified_by_ag59c_r1 !== true) fail("Public URL must record AG59C-R1 verification.");

if (deferral.backend_auth_supabase_activated !== false) fail("Backend/Auth/Supabase must remain deferred.");
if (deferral.service_role_used !== false) fail("Service role must remain false.");
if (deferral.v02_expansion_started !== false) fail("V02 expansion must remain false.");

if (handoff.audit_passed !== true) fail("Post-live handoff must pass.");
if (readiness.ready_for_optional_post_live_stabilisation !== true) fail("Post-live readiness missing.");
if (boundary.status !== "post_live_stabilisation_boundary_created") fail("Post-live boundary mismatch.");

for (const f of [
  "data/content-intelligence/backend-architecture/ag59z-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag59z-no-v02-expansion-audit.json"
]) {
  const audit = readJson(f);
  if (audit.audit_passed !== true) fail(`${f} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${f} failed checks must be zero.`);
}

if (preview.v01_live_closed !== 1) fail("Preview V01 live closure missing.");
if (preview.live_runtime_rendered_copy_stabilised !== 1) fail("Preview runtime/rendered-copy stabilisation missing.");
if (preview.backend_runtime_activated !== 0) fail("Preview backend runtime must be zero.");
if (preview.v02_expansion_started !== 0) fail("Preview V02 expansion must be zero.");

pass("AG59Z V01 Go-Live Closure is present.");
pass("Drishvara V01 live URL is closed and recorded.");
pass("AG59C and AG59C-R1 evidence are consumed.");
pass("Backend/Auth/Supabase and V02 deferrals are preserved.");
pass("Post-live stabilisation handoff is valid.");
