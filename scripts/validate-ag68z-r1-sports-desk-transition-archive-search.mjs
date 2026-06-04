import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG68Z-R1 validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "index.html",
  "generated/sports-desk-working-data.json",
  "generated/sports-desk-archive-index.json",
  "data/content-intelligence/quality-reviews/ag68z-sports-desk-closure.json",
  "scripts/generate-ag68z-r1-sports-desk-transition-archive-search.mjs",
  "scripts/validate-ag68z-r1-sports-desk-transition-archive-search.mjs",
  "data/content-intelligence/quality-reviews/ag68z-r1-sports-desk-transition-archive-search.json",
  "data/content-intelligence/phase-01-modules/ag68z-r1-sports-desk-transition-archive-search-apply-record.json",
  "data/content-intelligence/phase-01-modules/ag68z-r1-sports-desk-transition-visual-contract-record.json",
  "data/methodology/sports-desk/ag68z-r1-sports-archive-search-and-link-verification-policy.json",
  "data/methodology/sports-desk/ag68z-r1-future-sports-database-table-model.json",
  "data/initial-working-data/sports-desk/ag68z-r1-sports-desk-multi-slot-working-data.json",
  "data/content-intelligence/quality-registry/ag68z-r1-public-module-verification-sweep-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag68z-r1-to-public-module-live-static-verification-sweep-boundary.json",
  "data/content-intelligence/backend-architecture/ag68z-r1-sports-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag68z-r1-sports-no-v02-expansion-audit.json",
  "data/quality/ag68z-r1-sports-desk-transition-archive-search.json",
  "data/quality/ag68z-r1-sports-desk-transition-archive-search-preview.json",
  "docs/quality/AG68Z_R1_SPORTS_DESK_TRANSITION_ARCHIVE_SEARCH.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag68z-r1"]) fail("Missing generate:ag68z-r1 script.");
if (!pkg.scripts?.["validate:ag68z-r1"]) fail("Missing validate:ag68z-r1 script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag68z-r1")) fail("validate:project must include validate:ag68z-r1.");

const indexHtml = read("index.html");
for (const marker of [
  'data-drishvara-ag68z-r1-sports-desk-transition-style="true"',
  'data-drishvara-ag68z-r1-sports-desk-transition-archive="true"',
  "generated/sports-desk-working-data.json",
  "generated/sports-desk-archive-index.json",
  "drishvaraAg68zr1LoadSportsDeskTransitions",
  "sports-archive-search",
  "sports-archive-search-input",
  "sports-archive-search-button",
  "data-drishvara-ag68z-r1-sports-transition-card",
  "data-drishvara-ag68z-r1-sports-archive-search"
]) {
  if (!indexHtml.includes(marker)) fail(`Missing AG68Z-R1 index marker: ${marker}`);
}

const working = readJson("generated/sports-desk-working-data.json");
if (working.transition_layout_ready !== true) fail("transition_layout_ready must be true.");
if (working.archive_search_shell_active !== true) fail("archive_search_shell_active must be true.");
if (working.database_archive_search_active !== false) fail("database_archive_search_active must be false.");
if (working.verified_link_policy_active !== true) fail("verified_link_policy_active must be true.");

for (const key of [
  "source_collection_active",
  "live_sports_sourcing_active",
  "external_api_fetch_active",
  "runtime_sports_api_active",
  "ai_generation_active",
  "ai_selection_active",
  "report_generation_enabled"
]) {
  if (working[key] !== false) fail(`${key} must remain false.`);
}

const sections = Object.fromEntries((working.sports_desk?.sections || []).map((s) => [s.section_id, s]));
const expectedCounts = {
  live_events: 3,
  tournament_watch: 3,
  major_updates: 3,
  featured_sports_article: 2
};

for (const [sectionId, count] of Object.entries(expectedCounts)) {
  const section = sections[sectionId];
  if (!section) fail(`Missing section: ${sectionId}`);
  if (section.active !== false) fail(`${sectionId} must remain inactive.`);
  if (section.transition_ready !== true) fail(`${sectionId} transition_ready must be true.`);
  if (section.visible_cards_per_section !== 1) fail(`${sectionId} must have one visible card.`);
  if (!Array.isArray(section.items) || section.items.length !== count) fail(`${sectionId} must have ${count} items.`);
}

const archive = readJson("generated/sports-desk-archive-index.json");
if (archive.status !== "archive_search_shell_ready_no_database_runtime") fail("Archive index status mismatch.");
if (archive.archive_search_shell_active !== true) fail("Archive search shell must be true.");
if (archive.static_archive_search_enabled !== true) fail("Static archive search shell must be true.");
if (archive.database_search_active !== false) fail("Database search must be false.");
if (archive.backend_runtime_activated !== false) fail("Backend runtime must be false.");
if (archive.verified_link_required !== true) fail("Verified link required flag missing.");
if (!Array.isArray(archive.records)) fail("Archive records must be an array.");

const doctrine = readJson("data/methodology/sports-desk/ag68z-r1-sports-archive-search-and-link-verification-policy.json");
if (doctrine.database_runtime_active !== false) fail("Doctrine database runtime must be false.");
if (doctrine.archive_search_shell_active !== true) fail("Doctrine archive shell must be true.");
if (doctrine.verified_link_required !== true) fail("Doctrine verified link required missing.");
if (!doctrine.link_acceptance_rules.some((x) => x.includes("official"))) fail("Official source rule missing.");
if (!doctrine.blocked_sources.some((x) => x.includes("betting"))) fail("Betting/odds source block missing.");

const dbModel = readJson("data/methodology/sports-desk/ag68z-r1-future-sports-database-table-model.json");
if (dbModel.database_runtime_active !== false) fail("Future DB model must not activate database.");
for (const table of ["sports_events", "sports_event_sources", "sports_archive_search_index", "sports_admin_review_log"]) {
  if (!Array.isArray(dbModel.future_tables?.[table])) fail(`Missing future table: ${table}`);
}

const visual = readJson("data/content-intelligence/phase-01-modules/ag68z-r1-sports-desk-transition-visual-contract-record.json");
if (visual.section_contract.live_events.total_slots !== 3) fail("Live Events slot count mismatch.");
if (visual.section_contract.tournament_watch.total_slots !== 3) fail("Tournament Watch slot count mismatch.");
if (visual.section_contract.major_updates.total_slots !== 3) fail("Major Updates slot count mismatch.");
if (visual.section_contract.featured_sports_article.total_slots !== 2) fail("Featured Sports Article slot count mismatch.");
if (visual.archive_search_contract.search_shell_visible !== true) fail("Archive search shell visible flag missing.");
if (visual.archive_search_contract.database_search_active !== false) fail("Archive database search must be false.");

const review = readJson("data/content-intelligence/quality-reviews/ag68z-r1-sports-desk-transition-archive-search.json");
if (review.status !== "ag68z_r1_sports_desk_transition_archive_search_completed") fail("Review status mismatch.");

for (const key of [
  "sports_multislot_transition_layout_added",
  "one_visible_card_per_subhead",
  "transition_effect_enabled",
  "archive_search_shell_added",
  "archive_index_created",
  "verified_link_policy_recorded",
  "future_database_model_recorded",
  "ready_for_public_module_verification_sweep"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true in review summary.`);
}

for (const [key, expected] of Object.entries({
  live_events_slots_count: 3,
  tournament_watch_slots_count: 3,
  major_updates_slots_count: 3,
  featured_sports_article_slots_count: 2
})) {
  if (review.summary[key] !== expected) fail(`${key} must be ${expected}.`);
}

for (const key of [
  "database_archive_search_active",
  "backend_runtime_activated",
  "source_collection_active",
  "live_sports_sourcing_active",
  "external_api_fetch_active",
  "runtime_sports_api_active",
  "ai_generation_active",
  "service_role_used",
  "v02_expansion_started"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false in review summary.`);
}

const readiness = readJson("data/content-intelligence/quality-registry/ag68z-r1-public-module-verification-sweep-readiness-record.json");
if (readiness.ready_for_verification_sweep !== true) fail("Verification sweep readiness missing.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag68z-r1-to-public-module-live-static-verification-sweep-boundary.json");
if (!boundary.blocked_scope_without_explicit_approval.includes("database archive search activation")) fail("Database archive search blocker missing.");
if (!boundary.blocked_scope_without_explicit_approval.includes("live sports sourcing")) fail("Live sports sourcing blocker missing.");

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag68z-r1-sports-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag68z-r1-sports-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG68Z-R1 Sports Desk transition/archive/search correction is present.");
pass("Sports Desk has multi-slot transition layout with one visible card per sub-head.");
pass("Archive search shell, verified-link policy and future database model are recorded.");
pass("Database/backend/live sports sourcing/runtime API/AI/V02 remain inactive.");
pass("Public module verification sweep readiness is valid.");
