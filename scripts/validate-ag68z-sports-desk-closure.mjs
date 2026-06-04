import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG68Z validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "index.html",
  "generated/sports-desk-working-data.json",
  "data/content-intelligence/quality-reviews/ag68a-sports-desk-working-data-foundation.json",
  "data/content-intelligence/quality-reviews/ag68b-sports-desk-ui-wiring.json",
  "scripts/generate-ag68z-sports-desk-closure.mjs",
  "scripts/validate-ag68z-sports-desk-closure.mjs",
  "data/content-intelligence/quality-reviews/ag68z-sports-desk-closure.json",
  "data/content-intelligence/closure-records/ag68z-sports-desk-working-data-and-ui-wiring-closure.json",
  "data/content-intelligence/phase-01-modules/ag68z-sports-desk-final-status-record.json",
  "data/content-intelligence/phase-01-modules/ag68z-sports-desk-static-verification-evidence-record.json",
  "data/content-intelligence/mutation-plans/ag68z-to-next-governed-stage-boundary.json",
  "data/content-intelligence/backend-architecture/ag68z-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag68z-no-v02-expansion-audit.json",
  "data/quality/ag68z-sports-desk-closure.json",
  "data/quality/ag68z-sports-desk-closure-preview.json",
  "docs/quality/AG68Z_SPORTS_DESK_CLOSURE.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag68z"]) fail("Missing generate:ag68z script.");
if (!pkg.scripts?.["validate:ag68z"]) fail("Missing validate:ag68z script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag68z")) fail("validate:project must include validate:ag68z.");

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
  "data-drishvara-ag68b-live-sourcing-active",
  "data-drishvara-ag68b-runtime-api-active",
  "data-drishvara-ag68b-ai-generation-active"
]) {
  if (!indexHtml.includes(marker)) fail(`Missing AG68Z index closure marker: ${marker}`);
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

const sections = working.sports_desk?.sections || [];
for (const section of ["live_events", "tournament_watch", "major_updates", "featured_sports_article"]) {
  const found = sections.find((x) => x.section_id === section);
  if (!found) fail(`Missing working-data section: ${section}`);
  if (found.active !== false) fail(`${section} must remain inactive.`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag68z-sports-desk-closure.json");
if (review.status !== "ag68z_sports_desk_closure_completed") fail("Review status mismatch.");

for (const key of [
  "ag68a_working_data_foundation_completed",
  "ag68b_ui_wiring_completed",
  "sports_desk_row_closed_at_safe_working_data_level",
  "generated_sports_desk_source_connected",
  "homepage_ui_wired_to_generated_sports_desk_data",
  "live_events_target_wired",
  "tournament_watch_target_wired",
  "major_updates_target_wired",
  "featured_sports_article_target_wired",
  "fallback_preserved_on_fetch_failure",
  "local_static_evidence_recorded",
  "next_governed_stage_requires_user_confirmation"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true in review summary.`);
}

for (const key of [
  "live_url_verification_completed",
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

const closure = readJson("data/content-intelligence/closure-records/ag68z-sports-desk-working-data-and-ui-wiring-closure.json");
if (closure.status !== "ag68z_sports_desk_closed") fail("Closure status mismatch.");
if (!closure.closed_stages.some((x) => x.includes("AG68A"))) fail("AG68A must be closed.");
if (!closure.closed_stages.some((x) => x.includes("AG68B"))) fail("AG68B must be closed.");

const finalStatus = readJson("data/content-intelligence/phase-01-modules/ag68z-sports-desk-final-status-record.json");
if (finalStatus.status !== "sports_desk_working_data_and_ui_wiring_closed") fail("Final status mismatch.");
if (finalStatus.current_safe_public_state.homepage_ui_wired_to_generated_data !== true) fail("Homepage UI wired flag missing.");
if (finalStatus.inactive_runtime_state.live_sports_sourcing_active !== false) fail("Final status live sourcing must be false.");

const evidence = readJson("data/content-intelligence/phase-01-modules/ag68z-sports-desk-static-verification-evidence-record.json");
if (evidence.status !== "local_static_verification_recorded") fail("Static evidence status mismatch.");
if (evidence.live_url_verification_completed !== false) fail("Live URL verification must be false.");
if (evidence.live_url_verification_claimed !== false) fail("Live URL verification must not be claimed.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag68z-to-next-governed-stage-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("Next stage must not auto-start.");
if (!boundary.blocked_scope_without_explicit_approval.includes("live sports sourcing")) fail("Live sports sourcing blocker missing.");
if (!boundary.blocked_scope_without_explicit_approval.includes("V02 expansion")) fail("V02 blocker missing.");

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag68z-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag68z-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG68Z Sports Desk Closure is present.");
pass("AG68A foundation and AG68B UI wiring are closed.");
pass("Sports Desk UI remains wired to generated working data.");
pass("Live sports sourcing, runtime API, external API, AI, backend and V02 remain inactive.");
pass("Next governed stage requires explicit confirmation.");
