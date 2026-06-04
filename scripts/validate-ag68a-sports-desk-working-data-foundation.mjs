import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG68A validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "index.html",
  "data/content-intelligence/quality-reviews/ag67z-r1-homepage-route-founder-continuity-sports-fallback-verification.json",
  "scripts/generate-ag68a-sports-desk-working-data-foundation.mjs",
  "scripts/validate-ag68a-sports-desk-working-data-foundation.mjs",
  "data/content-intelligence/quality-reviews/ag68a-sports-desk-working-data-foundation.json",
  "data/content-intelligence/phase-01-modules/ag68a-sports-desk-source-consumption-record.json",
  "data/content-intelligence/phase-01-modules/ag68a-sports-desk-working-data-foundation-record.json",
  "data/initial-working-data/sports-desk/ag68a-sports-desk-source-registry.json",
  "data/initial-working-data/sports-desk/ag68a-sports-desk-initial-working-data.json",
  "data/methodology/sports-desk/ag68a-sports-desk-methodology.json",
  "data/methodology/sports-desk/ag68a-sports-desk-ai-routing-token-policy.json",
  "data/methodology/sports-desk/ag68a-sports-desk-live-sourcing-and-safety-gate.json",
  "data/feedback/sports-desk/ag68a-sports-desk-user-feedback-schema.json",
  "data/feedback/sports-desk/ag68a-sports-desk-admin-review-absorption-schema.json",
  "generated/sports-desk-working-data.json",
  "data/content-intelligence/quality-registry/ag68a-ag68b-sports-desk-ui-wiring-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag68a-to-ag68b-sports-desk-ui-wiring-boundary.json",
  "data/content-intelligence/backend-architecture/ag68a-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag68a-no-v02-expansion-audit.json",
  "data/quality/ag68a-sports-desk-working-data-foundation.json",
  "data/quality/ag68a-sports-desk-working-data-foundation-preview.json",
  "docs/quality/AG68A_SPORTS_DESK_WORKING_DATA_FOUNDATION.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag68a"]) fail("Missing generate:ag68a script.");
if (!pkg.scripts?.["validate:ag68a"]) fail("Missing validate:ag68a script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag68a")) fail("validate:project must include validate:ag68a.");

const indexHtml = read("index.html");
for (const marker of [
  "Sports Desk",
  "sports-live-events-list",
  "sports-tournaments-list",
  "sports-major-updates-list",
  "featured-sports-article-wrap",
  "Prepared surface",
  "Please wait a moment."
]) {
  if (!indexHtml.includes(marker)) fail(`Missing Sports Desk index marker: ${marker}`);
}

const working = readJson("generated/sports-desk-working-data.json");
if (working.status !== "initial_sports_desk_working_data_ready_not_publicly_wired") fail("Working data status mismatch.");
if (working.existing_fallback_surface_visible !== true) fail("Existing fallback visibility must be true.");
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
  if (working[key] !== false) fail(`${key} must be false.`);
}

const sportsDesk = working.sports_desk || {};
if (sportsDesk.card_id !== "sports-desk") fail("Sports Desk card_id mismatch.");
if (sportsDesk.status_label !== "Editorial Preview") fail("Sports Desk status label mismatch.");
if (!Array.isArray(sportsDesk.sections) || sportsDesk.sections.length !== 4) fail("Sports Desk must have four sections.");

const sectionIds = sportsDesk.sections.map((s) => s.section_id).sort();
for (const expected of ["featured_sports_article", "live_events", "major_updates", "tournament_watch"]) {
  if (!sectionIds.includes(expected)) fail(`Missing Sports Desk section: ${expected}`);
}
for (const section of sportsDesk.sections) {
  if (section.active !== false) fail(`${section.section_id} must be inactive.`);
  if (!Array.isArray(section.items) || section.items.length < 1) fail(`${section.section_id} must have a reserved item.`);
}

const sourceRegistry = readJson("data/initial-working-data/sports-desk/ag68a-sports-desk-source-registry.json");
if (sourceRegistry.source_collection_active !== false) fail("Source collection must be false.");
if (sourceRegistry.external_api_fetch_active !== false) fail("External API fetch must be false.");
if (sourceRegistry.live_sports_sourcing_active !== false) fail("Live sports sourcing must be false.");

const methodology = readJson("data/methodology/sports-desk/ag68a-sports-desk-methodology.json");
if (!methodology.sports_desk_sections.includes("Live Events")) fail("Methodology missing Live Events.");
if (!methodology.safety_rules.some((x) => x.includes("No betting"))) fail("No betting safety rule missing.");

const tokenPolicy = readJson("data/methodology/sports-desk/ag68a-sports-desk-ai-routing-token-policy.json");
if (tokenPolicy.ai_generation_active !== false) fail("AI generation must be false.");
if (tokenPolicy.token_use_now !== 0) fail("Token use now must be 0.");

const safetyGate = readJson("data/methodology/sports-desk/ag68a-sports-desk-live-sourcing-and-safety-gate.json");
for (const key of [
  "live_sports_sourcing_active",
  "external_api_fetch_active",
  "runtime_sports_api_active",
  "public_live_score_claims_enabled"
]) {
  if (safetyGate[key] !== false) fail(`${key} must be false in safety gate.`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag68a-sports-desk-working-data-foundation.json");
if (review.status !== "ag68a_sports_desk_working_data_foundation_completed") fail("Review status mismatch.");
for (const key of [
  "sports_desk_fallback_source_consumed",
  "sports_desk_source_registry_defined",
  "sports_desk_methodology_defined",
  "sports_desk_safety_gate_defined",
  "generated_sports_desk_working_data_created",
  "live_events_slot_created",
  "tournament_watch_slot_created",
  "major_updates_slot_created",
  "featured_sports_article_slot_created",
  "ready_for_ag68b"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true in review summary.`);
}

for (const key of [
  "public_ui_ready",
  "working_data_publicly_wired",
  "source_collection_active",
  "live_sports_sourcing_active",
  "external_api_fetch_active",
  "runtime_sports_api_active",
  "ai_generation_active",
  "backend_runtime_activated",
  "service_role_used",
  "v02_expansion_started"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false in review summary.`);
}

const readiness = readJson("data/content-intelligence/quality-registry/ag68a-ag68b-sports-desk-ui-wiring-readiness-record.json");
if (readiness.ready_for_ag68b !== true) fail("AG68B readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag68a-to-ag68b-sports-desk-ui-wiring-boundary.json");
if (!boundary.allowed_next_scope.some((x) => x.includes("generated/sports-desk-working-data.json"))) fail("AG68B boundary must mention generated sports working data.");
if (!boundary.blocked_scope_without_explicit_approval.includes("live sports sourcing")) fail("Live sports sourcing blocker missing.");

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag68a-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag68a-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG68A Sports Desk working data foundation is present.");
pass("Four Sports Desk sections are prepared as inactive reserved working-data slots.");
pass("Source registry, methodology, token policy and live-sourcing safety gate are valid.");
pass("No live sports sourcing, external API, runtime API, AI generation, backend or V02 action is recorded.");
pass("AG68B UI wiring readiness is valid.");
