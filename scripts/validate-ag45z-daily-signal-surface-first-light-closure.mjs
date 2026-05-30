import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) {
  return path.join(root, p);
}

function exists(p) {
  return fs.existsSync(full(p));
}

function read(p) {
  return fs.readFileSync(full(p), "utf8");
}

function readJson(p) {
  return JSON.parse(read(p));
}

function fail(message) {
  console.error(`❌ AG45Z validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag45a-daily-signal-surface-first-light-doctrine.json",
  "data/content-intelligence/quality-reviews/ag45b-source-credibility-model.json",
  "data/content-intelligence/quality-reviews/ag45c-signal-selection-model.json",
  "data/content-intelligence/quality-reviews/ag45d-title-subtitle-inference-metadata.json",
  "data/content-intelligence/quality-reviews/ag45e-image-link-attribution-safety.json",
  "data/content-intelligence/quality-reviews/ag45f-video-of-the-day-safety-credit.json",
  "data/content-intelligence/quality-reviews/ag45g-homepage-card-transition-behaviour.json",
  "data/content-intelligence/quality-reviews/ag45h-backend-metadata-pattern-schema.json",
  "data/content-intelligence/quality-reviews/ag45i-legal-safety-reputation-audit.json",
  "data/content-intelligence/quality-registry/ag45i-ag45-chain-integrity-audit.json",
  "data/content-intelligence/backend-architecture/ag45i-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag45i-ag45z-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag45i-to-ag45z-daily-signal-surface-closure-boundary.json",

  "data/content-intelligence/quality-reviews/ag45z-daily-signal-surface-first-light-closure.json",
  "data/content-intelligence/closure-records/ag45z-daily-signal-surface-first-light-closure.json",
  "data/content-intelligence/quality-registry/ag45z-ag45-chain-integration-audit.json",
  "data/content-intelligence/quality-registry/ag45z-carry-forward-register.json",
  "data/content-intelligence/backend-architecture/ag45z-no-duplicate-closure-audit-register.json",
  "data/content-intelligence/backend-architecture/ag45z-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag45z-ag46-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag45z-to-ag46-featured-reads-production-strengthening-boundary.json",
  "data/quality/ag45z-daily-signal-surface-first-light-closure.json",
  "data/quality/ag45z-daily-signal-surface-first-light-closure-preview.json",
  "docs/quality/AG45Z_DAILY_SIGNAL_SURFACE_FIRST_LIGHT_CLOSURE.md",
  "scripts/generate-ag45z-daily-signal-surface-first-light-closure.mjs",
  "scripts/validate-ag45z-daily-signal-surface-first-light-closure.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag45iReview = readJson("data/content-intelligence/quality-reviews/ag45i-legal-safety-reputation-audit.json");
const ag45iChainAudit = readJson("data/content-intelligence/quality-registry/ag45i-ag45-chain-integrity-audit.json");
const ag45iNoMutationAudit = readJson("data/content-intelligence/backend-architecture/ag45i-no-mutation-audit-register.json");
const ag45iReadiness = readJson("data/content-intelligence/quality-registry/ag45i-ag45z-closure-readiness-record.json");
const ag45iBoundary = readJson("data/content-intelligence/mutation-plans/ag45i-to-ag45z-daily-signal-surface-closure-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ag45z-daily-signal-surface-first-light-closure.json");
const closure = readJson("data/content-intelligence/closure-records/ag45z-daily-signal-surface-first-light-closure.json");
const chainIntegrationAudit = readJson("data/content-intelligence/quality-registry/ag45z-ag45-chain-integration-audit.json");
const carryForwardRegister = readJson("data/content-intelligence/quality-registry/ag45z-carry-forward-register.json");
const noDuplicateClosureAudit = readJson("data/content-intelligence/backend-architecture/ag45z-no-duplicate-closure-audit-register.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/ag45z-no-mutation-audit-register.json");
const nextStageReadiness = readJson("data/content-intelligence/quality-registry/ag45z-ag46-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag45z-to-ag46-featured-reads-production-strengthening-boundary.json");
const preview = readJson("data/quality/ag45z-daily-signal-surface-first-light-closure-preview.json");
const pkg = readJson("package.json");

if (ag45iReview.status !== "legal_safety_reputation_audit_ready_for_ag45z") fail("AG45I review status mismatch.");
if (ag45iReview.summary.ready_for_ag45z !== true) fail("AG45I readiness summary missing.");
if (ag45iChainAudit.audit_passed !== true) fail("AG45I chain audit must pass.");
if (ag45iChainAudit.next_stage_id !== "AG45Z") fail("AG45I chain audit must point to AG45Z.");
if (ag45iNoMutationAudit.audit_passed !== true) fail("AG45I no-mutation audit must pass.");
if (ag45iReadiness.ready_for_ag45z !== true) fail("AG45I readiness must permit AG45Z.");
if (ag45iBoundary.next_stage_id !== "AG45Z") fail("AG45I boundary must point to AG45Z.");

if (review.status !== "daily_signal_surface_first_light_closure_ready_for_ag46") fail("Review status mismatch.");
if (review.summary.ag45z_daily_signal_surface_first_light_closed !== true) fail("AG45Z closure summary missing.");
if (review.summary.ag45a_to_ag45i_chain_closed !== true) fail("AG45A-I chain closure summary missing.");
if (review.summary.daily_signal_surface_module_complete !== true) fail("Daily Signal module complete summary missing.");
if (review.summary.first_light_module_complete !== true) fail("First Light complete summary missing.");
if (review.summary.no_duplicate_ag45_module_required !== true) fail("No-duplicate summary missing.");
if (review.summary.carry_forward_recorded !== true) fail("Carry-forward summary missing.");
if (review.summary.ready_for_ag46 !== true) fail("AG46 readiness missing.");
if (review.summary.hard_blocker_count_for_ag46 !== 0) fail("AG46 blocker count must be zero.");
if (review.summary.daily_signal_fetch_executed !== false) fail("Fetch must remain false.");
if (review.summary.news_scraping_executed !== false) fail("Scraping must remain false.");
if (review.summary.external_link_verification_executed !== false) fail("Link verification must remain false.");
if (review.summary.image_fetch_executed !== false) fail("Image fetch must remain false.");
if (review.summary.video_fetch_executed !== false) fail("Video fetch must remain false.");
if (review.summary.homepage_mutated !== false) fail("Homepage mutation must remain false.");
if (review.summary.public_card_rendering_activated !== false) fail("Public card rendering must remain false.");
if (review.summary.sql_file_created !== false) fail("SQL file creation must remain false.");
if (review.summary.database_write_performed !== false) fail("Database write must remain false.");
if (review.summary.backend_auth_supabase_activation_performed !== false) fail("Backend activation must remain false.");
if (review.summary.service_role_key_exposed !== false) fail("Service-role exposure must remain false.");
if (review.summary.deployment_performed !== false) fail("Deployment must remain false.");

if (closure.status !== "daily_signal_surface_first_light_closed") fail("Closure status mismatch.");
for (const stage of ["AG45A", "AG45B", "AG45C", "AG45D", "AG45E", "AG45F", "AG45G", "AG45H", "AG45I", "AG45Z"]) {
  if (!closure.closed_chain.includes(stage)) fail(`Closure chain missing: ${stage}`);
}
if (closure.next_stage_id !== "AG46") fail("Closure next stage must be AG46.");

if (chainIntegrationAudit.status !== "ag45_chain_integration_audit_passed") fail("Chain integration audit status mismatch.");
if (chainIntegrationAudit.audit_passed !== true) fail("Chain integration audit must pass.");
for (const stage of ["AG45A", "AG45B", "AG45C", "AG45D", "AG45E", "AG45F", "AG45G", "AG45H", "AG45I", "AG45Z"]) {
  if (!chainIntegrationAudit.completed_chain.includes(stage)) fail(`Chain integration missing: ${stage}`);
}

if (carryForwardRegister.status !== "carry_forward_recorded_for_later_governed_stages") fail("Carry-forward status mismatch.");
for (const target of ["AG46", "AG49", "AG52", "AG55", "AG56"]) {
  if (!JSON.stringify(carryForwardRegister.carry_forward_items).includes(target)) fail(`Carry-forward target missing: ${target}`);
}
if (!JSON.stringify(carryForwardRegister).includes("Supabase table markdown/schema files")) fail("Supabase schema reminder missing.");

if (noDuplicateClosureAudit.status !== "no_duplicate_ag45_module_required") fail("No-duplicate closure status mismatch.");
if (noDuplicateClosureAudit.audit_passed !== true) fail("No-duplicate closure audit must pass.");
if (noDuplicateClosureAudit.failed_checks.length !== 0) fail("No-duplicate failed checks must be zero.");
if (!JSON.stringify(noDuplicateClosureAudit).includes("No new AG45 submodule is required")) fail("No new AG45 submodule guard missing.");

if (noMutationAudit.status !== "no_mutation_audit_passed_for_ag45z") fail("No-mutation audit status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");
for (const check of noMutationAudit.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (nextStageReadiness.status !== "ready_for_ag46_featured_reads_production_strengthening") fail("AG46 readiness status mismatch.");
if (nextStageReadiness.ready_for_ag46 !== true) fail("AG46 readiness must be true.");
if (nextStageReadiness.next_stage_id !== "AG46") fail("Next stage must be AG46.");
if (nextStageReadiness.hard_blocker_count_for_ag46 !== 0) fail("AG46 blocker count must be zero.");
if (nextStageReadiness.daily_signal_fetch_allowed_next !== false) fail("Fetch must remain blocked.");
if (nextStageReadiness.database_write_allowed_next !== false) fail("Database write must remain blocked.");
if (nextStageReadiness.backend_activation_allowed_next !== false) fail("Backend activation must remain blocked.");
if (nextStageReadiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG46") fail("Boundary must point to AG46.");
if (!JSON.stringify(boundary.allowed_scope).includes("Featured Reads Production Strengthening")) fail("AG46 boundary scope missing.");
if (!JSON.stringify(boundary.allowed_scope).includes("Do not duplicate AG43")) fail("AG43 no-duplicate guard missing.");
if (!JSON.stringify(boundary.allowed_scope).includes("Do not duplicate AG45")) fail("AG45 no-duplicate guard missing.");

if (preview.ag45z_daily_signal_surface_first_light_closed !== 1) fail("Preview closure flag missing.");
if (preview.ag45a_to_ag45i_chain_closed !== 1) fail("Preview chain closure flag missing.");
if (preview.daily_signal_surface_module_complete !== 1) fail("Preview daily signal complete flag missing.");
if (preview.first_light_module_complete !== 1) fail("Preview First Light complete flag missing.");
if (preview.no_duplicate_ag45_module_required !== 1) fail("Preview no-duplicate flag missing.");
if (preview.carry_forward_recorded !== 1) fail("Preview carry-forward flag missing.");
if (preview.ready_for_ag46 !== 1) fail("Preview AG46 readiness missing.");
if (preview.daily_signal_fetch_executed !== 0) fail("Preview fetch must be zero.");
if (preview.news_scraping_executed !== 0) fail("Preview scraping must be zero.");
if (preview.external_link_verification_executed !== 0) fail("Preview link verification must be zero.");
if (preview.image_fetch_executed !== 0) fail("Preview image fetch must be zero.");
if (preview.video_fetch_executed !== 0) fail("Preview video fetch must be zero.");
if (preview.homepage_mutated !== 0) fail("Preview homepage mutation must be zero.");
if (preview.public_card_rendering_activated !== 0) fail("Preview public card rendering must be zero.");
if (preview.sql_file_created !== 0) fail("Preview SQL file creation must be zero.");
if (preview.database_write_performed !== 0) fail("Preview DB write must be zero.");
if (preview.backend_auth_supabase_activation_performed !== 0) fail("Preview backend activation must be zero.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be zero.");
if (preview.deployment_performed !== 0) fail("Preview deployment must be zero.");

if (!pkg.scripts?.["generate:ag45z"]) fail("Missing package script: generate:ag45z");
if (!pkg.scripts?.["validate:ag45z"]) fail("Missing package script: validate:ag45z");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag45z")) fail("validate:project must include validate:ag45z.");

pass("AG45Z Daily Signal Surface and First Light Closure is present.");
pass("AG45A → AG45I chain is closed.");
pass("Daily Signal Surface and First Light module is complete as a governed planning chain.");
pass("No duplicate AG45 module is required.");
pass("Carry-forward to AG46 / AG49 / AG52 / AG55 / AG56 is recorded.");
pass("No-mutation audit is valid.");
pass("AG46 Featured Reads Production Strengthening readiness is valid.");
pass("No fetch, scraping, link verification, image/video fetch, homepage mutation, SQL, database write, backend activation, deployment or service-role exposure is recorded.");
