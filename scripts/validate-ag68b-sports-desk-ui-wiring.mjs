import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG68B validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "index.html",
  "generated/sports-desk-working-data.json",
  "data/content-intelligence/quality-reviews/ag68a-sports-desk-working-data-foundation.json",
  "scripts/generate-ag68b-sports-desk-ui-wiring.mjs",
  "scripts/validate-ag68b-sports-desk-ui-wiring.mjs",
  "data/content-intelligence/quality-reviews/ag68b-sports-desk-ui-wiring.json",
  "data/content-intelligence/phase-01-modules/ag68b-sports-desk-ui-wiring-apply-record.json",
  "data/content-intelligence/phase-01-modules/ag68b-sports-desk-ui-data-contract-record.json",
  "data/content-intelligence/quality-registry/ag68b-ag68z-sports-desk-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag68b-to-ag68z-sports-desk-closure-boundary.json",
  "data/content-intelligence/backend-architecture/ag68b-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag68b-no-v02-expansion-audit.json",
  "data/quality/ag68b-sports-desk-ui-wiring.json",
  "data/quality/ag68b-sports-desk-ui-wiring-preview.json",
  "docs/quality/AG68B_SPORTS_DESK_UI_WIRING.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag68b"]) fail("Missing generate:ag68b script.");
if (!pkg.scripts?.["validate:ag68b"]) fail("Missing validate:ag68b script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag68b")) fail("validate:project must include validate:ag68b.");

const indexHtml = read("index.html");
for (const marker of [
  'data-drishvara-ag68b-sports-desk-ui-wiring="true"',
  "generated/sports-desk-working-data.json",
  "drishvaraAg68bLoadSportsDesk",
  "applyAg68bSportsDesk",
  "sports-live-events-list",
  "sports-tournaments-list",
  "sports-major-updates-list",
  "featured-sports-article-wrap",
  "data-drishvara-ag68b-sports-desk-wired",
  "data-drishvara-ag68b-live-sourcing-active",
  "data-drishvara-ag68b-runtime-api-active",
  "data-drishvara-ag68b-ai-generation-active"
]) {
  if (!indexHtml.includes(marker)) fail(`Missing AG68B index marker: ${marker}`);
}

const working = readJson("generated/sports-desk-working-data.json");
for (const key of [
  "public_ui_ready",
  "working_data_publicly_wired",
  "source_collection_active",
  "live_sports_sourcing_active",
  "external_api_fetch_active",
  "runtime_sports_api_active",
  "ai_generation_active",
  "ai_selection_active",
  "report_generation_enabled"
]) {
  if (working[key] !== false) fail(`${key} must remain false in generated working data.`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag68b-sports-desk-ui-wiring.json");
if (review.status !== "ag68b_sports_desk_ui_wiring_completed") fail("Review status mismatch.");

for (const key of [
  "index_html_wired",
  "sports_desk_fetches_generated_working_data",
  "live_events_target_wired",
  "tournament_watch_target_wired",
  "major_updates_target_wired",
  "featured_sports_article_target_wired",
  "fallback_preserved_on_fetch_failure",
  "working_data_publicly_wired",
  "ready_for_ag68z"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true in review summary.`);
}

for (const key of [
  "public_ui_ready",
  "source_collection_active",
  "live_sports_sourcing_active",
  "external_api_fetch_active",
  "runtime_sports_api_active",
  "ai_generation_active",
  "ai_selection_active",
  "backend_runtime_activated",
  "service_role_used",
  "v02_expansion_started"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false in review summary.`);
}

const apply = readJson("data/content-intelligence/phase-01-modules/ag68b-sports-desk-ui-wiring-apply-record.json");
if (!apply.mutated_files.includes("index.html")) fail("Apply record must include index.html.");
if (apply.wiring_behaviour.fetches_generated_working_data !== true) fail("Fetch wiring behaviour missing.");
if (apply.wiring_behaviour.active_sports_feed_enabled !== false) fail("Active sports feed must be false.");
if (apply.wiring_behaviour.external_api_enabled !== false) fail("External API must be false.");

const contract = readJson("data/content-intelligence/phase-01-modules/ag68b-sports-desk-ui-data-contract-record.json");
for (const section of ["live_events", "tournament_watch", "major_updates", "featured_sports_article"]) {
  if (!contract.required_sections.includes(section)) fail(`Contract missing section: ${section}`);
}
if (contract.active_state_now.working_data_publicly_wired_after_ag68b !== true) fail("Contract wiring state missing.");
if (contract.active_state_now.live_sports_sourcing_active !== false) fail("Contract live sourcing must be false.");

const readiness = readJson("data/content-intelligence/quality-registry/ag68b-ag68z-sports-desk-closure-readiness-record.json");
if (readiness.ready_for_ag68z !== true) fail("AG68Z readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag68b-to-ag68z-sports-desk-closure-boundary.json");
if (!boundary.blocked_scope_without_explicit_approval.includes("live sports sourcing")) fail("Live sports sourcing blocker missing.");
if (!boundary.blocked_scope_without_explicit_approval.includes("runtime sports API")) fail("Runtime sports API blocker missing.");

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag68b-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag68b-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG68B Sports Desk UI wiring is present.");
pass("Sports Desk UI targets fetch generated working data.");
pass("Fallback behaviour is preserved.");
pass("Live sports sourcing, external API, runtime API, AI, backend and V02 remain inactive.");
pass("AG68Z closure readiness is valid.");
