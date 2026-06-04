import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG67Z-R1 validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "index.html",
  "data/homepage-ui.json",
  "data/sports-context.json",
  "scripts/generate-ag67z-r1-homepage-surface-fallback-verification.mjs",
  "scripts/validate-ag67z-r1-homepage-surface-fallback-verification.mjs",
  "data/content-intelligence/quality-reviews/ag67z-r1-homepage-route-founder-continuity-sports-fallback-verification.json",
  "data/content-intelligence/phase-01-modules/ag67z-r1-homepage-route-founder-continuity-sports-fallback-record.json",
  "data/content-intelligence/phase-01-modules/ag67z-r1-sports-desk-active-wiring-deferral-record.json",
  "data/content-intelligence/mutation-plans/ag67z-r1-to-next-governed-stage-boundary.json",
  "data/content-intelligence/backend-architecture/ag67z-r1-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag67z-r1-no-v02-expansion-audit.json",
  "data/quality/ag67z-r1-homepage-surface-fallback-verification.json",
  "data/quality/ag67z-r1-homepage-surface-fallback-verification-preview.json",
  "docs/quality/AG67Z_R1_HOMEPAGE_SURFACE_FALLBACK_VERIFICATION.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag67z-r1"]) fail("Missing generate:ag67z-r1 script.");
if (!pkg.scripts?.["validate:ag67z-r1"]) fail("Missing validate:ag67z-r1 script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag67z-r1")) fail("validate:project must include validate:ag67z-r1.");

const indexHtml = read("index.html");
for (const marker of [
  "batch03-route-card",
  "Today’s Drishvara Route",
  "One homepage, three movements",
  "Discover → Read → Reflect",
  "founder-notebook-card",
  "founder-notebook-title",
  "founder-notebook-entry",
  "batch03-continuity-kicker",
  "Built for daily return",
  "Sports Desk",
  "sports-live-events-list",
  "sports-tournaments-list",
  "sports-major-updates-list",
  "featured-sports-article-wrap",
  "Prepared surface",
  "Please wait a moment."
]) {
  if (!indexHtml.includes(marker)) fail(`Missing index marker: ${marker}`);
}

const homepageUi = readJson("data/homepage-ui.json");
const homepageText = JSON.stringify(homepageUi);
for (const text of ["Founder Notebook", "Weekly Signal", "One homepage, three movements", "Continuity Layer", "Built for daily return"]) {
  if (!homepageText.includes(text)) fail(`homepage-ui missing: ${text}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag67z-r1-homepage-route-founder-continuity-sports-fallback-verification.json");
const surface = readJson("data/content-intelligence/phase-01-modules/ag67z-r1-homepage-route-founder-continuity-sports-fallback-record.json");
const sports = readJson("data/content-intelligence/phase-01-modules/ag67z-r1-sports-desk-active-wiring-deferral-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag67z-r1-to-next-governed-stage-boundary.json");
const preview = readJson("data/quality/ag67z-r1-homepage-surface-fallback-verification-preview.json");

if (review.status !== "ag67z_r1_homepage_surface_fallback_verification_completed") fail("Review status mismatch.");

for (const key of [
  "route_surface_verified_locally",
  "founder_notebook_verified_locally",
  "continuity_layer_verified_locally",
  "sports_desk_stable_fallback_verified_locally",
  "sports_desk_active_wiring_deferred",
  "live_url_verification_failed_due_dns"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}

for (const key of [
  "live_url_verification_completed",
  "index_html_mutated",
  "public_ui_mutated",
  "backend_runtime_activated",
  "service_role_used",
  "v02_expansion_started"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false.`);
}

if (surface.verified_surfaces.todays_drishvara_route.present_in_index !== true) fail("Route surface not verified.");
if (surface.verified_surfaces.founder_notebook.present_in_homepage_ui_json !== true) fail("Founder homepage-ui verification missing.");
if (surface.verified_surfaces.continuity_layer.present_in_homepage_ui_json !== true) fail("Continuity homepage-ui verification missing.");
if (surface.verified_surfaces.sports_desk.active_wiring_status !== "deferred") fail("Sports active wiring must be deferred.");
if (surface.verified_surfaces.sports_desk.live_sports_sourcing_active !== false) fail("Sports live sourcing must be false.");
if (surface.live_url_verification.completed !== false) fail("Live URL verification must be incomplete in this record.");

if (sports.status !== "sports_desk_active_wiring_deferred") fail("Sports deferral status mismatch.");
if (sports.current_state.visible_surface_present !== true) fail("Sports visible surface missing.");
if (sports.current_state.stable_prepared_fallback_present !== true) fail("Sports fallback missing.");
if (sports.current_state.live_sports_sourcing_active !== false) fail("Sports live sourcing must be false.");
if (sports.future_stage_needed.needed !== true) fail("Future Sports Desk stage flag missing.");

if (boundary.next_stage_not_auto_started !== true) fail("Next stage must not auto-start.");
if (preview.route_surface_verified_locally !== 1) fail("Preview route verification missing.");
if (preview.sports_desk_active_wiring_deferred !== 1) fail("Preview sports deferral missing.");
if (preview.live_url_verification_completed !== 0) fail("Preview live verification should be 0.");

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag67z-r1-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag67z-r1-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG67Z-R1 local homepage surface verification is present.");
pass("Route, Founder Notebook and Continuity Layer are locally verified.");
pass("Sports Desk stable fallback is verified and active wiring is deferred.");
pass("DNS/live check failure is recorded without claiming live verification.");
pass("No UI mutation, backend/runtime, live sports sourcing or V02 action is recorded.");
