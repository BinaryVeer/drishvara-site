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
  console.error(`❌ AG45I validation failed: ${message}`);
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
  "data/content-intelligence/backend-architecture/ag45h-no-sql-no-db-write-audit.json",
  "data/content-intelligence/backend-architecture/ag45h-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag45h-legal-safety-reputation-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag45h-to-ag45i-legal-safety-reputation-audit-boundary.json",

  "data/content-intelligence/quality-reviews/ag45i-legal-safety-reputation-audit.json",
  "data/content-intelligence/daily-surface/ag45i-legal-attribution-audit.json",
  "data/content-intelligence/daily-surface/ag45i-source-reputation-safety-audit.json",
  "data/content-intelligence/daily-surface/ag45i-content-rights-risk-audit.json",
  "data/content-intelligence/homepage/ag45i-public-surface-nonactivation-audit.json",
  "data/content-intelligence/backend-architecture/ag45i-backend-deferral-service-key-audit.json",
  "data/content-intelligence/quality-registry/ag45i-ag45-chain-integrity-audit.json",
  "data/content-intelligence/backend-architecture/ag45i-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag45i-ag45z-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag45i-to-ag45z-daily-signal-surface-closure-boundary.json",
  "data/quality/ag45i-legal-safety-reputation-audit.json",
  "data/quality/ag45i-legal-safety-reputation-audit-preview.json",
  "docs/quality/AG45I_LEGAL_SAFETY_REPUTATION_AUDIT.md",
  "scripts/generate-ag45i-legal-safety-reputation-audit.mjs",
  "scripts/validate-ag45i-legal-safety-reputation-audit.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag45hNoSqlDbAudit = readJson("data/content-intelligence/backend-architecture/ag45h-no-sql-no-db-write-audit.json");
const ag45hNoMutationAudit = readJson("data/content-intelligence/backend-architecture/ag45h-no-mutation-audit-register.json");
const ag45hReadiness = readJson("data/content-intelligence/quality-registry/ag45h-legal-safety-reputation-audit-readiness-record.json");
const ag45hBoundary = readJson("data/content-intelligence/mutation-plans/ag45h-to-ag45i-legal-safety-reputation-audit-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ag45i-legal-safety-reputation-audit.json");
const legalAttributionAudit = readJson("data/content-intelligence/daily-surface/ag45i-legal-attribution-audit.json");
const sourceReputationAudit = readJson("data/content-intelligence/daily-surface/ag45i-source-reputation-safety-audit.json");
const contentRightsAudit = readJson("data/content-intelligence/daily-surface/ag45i-content-rights-risk-audit.json");
const publicSurfaceAudit = readJson("data/content-intelligence/homepage/ag45i-public-surface-nonactivation-audit.json");
const backendDeferralAudit = readJson("data/content-intelligence/backend-architecture/ag45i-backend-deferral-service-key-audit.json");
const ag45ChainAudit = readJson("data/content-intelligence/quality-registry/ag45i-ag45-chain-integrity-audit.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/ag45i-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag45i-ag45z-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag45i-to-ag45z-daily-signal-surface-closure-boundary.json");
const preview = readJson("data/quality/ag45i-legal-safety-reputation-audit-preview.json");
const pkg = readJson("package.json");

if (ag45hNoSqlDbAudit.audit_passed !== true) fail("AG45H no-SQL/no-DB audit must pass.");
if (ag45hNoMutationAudit.audit_passed !== true) fail("AG45H no-mutation audit must pass.");
if (ag45hReadiness.ready_for_ag45i !== true) fail("AG45H readiness must permit AG45I.");
if (ag45hBoundary.next_stage_id !== "AG45I") fail("AG45H boundary must point to AG45I.");

if (review.status !== "legal_safety_reputation_audit_ready_for_ag45z") fail("Review status mismatch.");
if (review.summary.ag45i_legal_safety_reputation_audit_recorded !== true) fail("AG45I summary flag missing.");
if (review.summary.legal_attribution_audit_passed !== true) fail("Legal attribution audit summary missing.");
if (review.summary.source_reputation_safety_audit_passed !== true) fail("Source reputation audit summary missing.");
if (review.summary.content_rights_risk_audit_passed !== true) fail("Content rights audit summary missing.");
if (review.summary.public_surface_nonactivation_audit_passed !== true) fail("Public surface audit summary missing.");
if (review.summary.backend_deferral_service_key_audit_passed !== true) fail("Backend deferral audit summary missing.");
if (review.summary.ag45_chain_integrity_audit_passed !== true) fail("Chain integrity audit summary missing.");
if (review.summary.ready_for_ag45z !== true) fail("AG45Z readiness missing.");
if (review.summary.hard_blocker_count_for_ag45z !== 0) fail("AG45Z blocker count must be zero.");
if (review.summary.daily_signal_fetch_executed !== false) fail("Daily signal fetch must remain false.");
if (review.summary.news_scraping_executed !== false) fail("News scraping must remain false.");
if (review.summary.external_link_verification_executed !== false) fail("External link verification must remain false.");
if (review.summary.image_fetch_executed !== false) fail("Image fetch must remain false.");
if (review.summary.video_fetch_executed !== false) fail("Video fetch must remain false.");
if (review.summary.homepage_mutated !== false) fail("Homepage mutation must remain false.");
if (review.summary.public_card_rendering_activated !== false) fail("Public card rendering must remain false.");
if (review.summary.sql_file_created !== false) fail("SQL file creation must remain false.");
if (review.summary.database_write_performed !== false) fail("Database write must remain false.");
if (review.summary.backend_auth_supabase_activation_performed !== false) fail("Backend activation must remain false.");
if (review.summary.service_role_key_exposed !== false) fail("Service-role exposure must remain false.");
if (review.summary.deployment_performed !== false) fail("Deployment must remain false.");

for (const audit of [
  legalAttributionAudit,
  sourceReputationAudit,
  contentRightsAudit,
  publicSurfaceAudit,
  backendDeferralAudit,
  ag45ChainAudit,
  noMutationAudit
]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
}

if (legalAttributionAudit.status !== "legal_attribution_audit_passed") fail("Legal attribution status mismatch.");
if (!JSON.stringify(legalAttributionAudit).includes("editor-says restriction")) fail("Editor-says audit basis missing.");

if (sourceReputationAudit.status !== "source_reputation_safety_audit_passed") fail("Source reputation status mismatch.");
if (!JSON.stringify(sourceReputationAudit).includes("Northeast")) fail("Northeast source audit missing.");
if (!JSON.stringify(sourceReputationAudit).includes("adult, explicit")) fail("Adult/explicit source safety audit missing.");

if (contentRightsAudit.status !== "content_rights_risk_audit_passed") fail("Content rights status mismatch.");
if (!JSON.stringify(contentRightsAudit).includes("no_third_party_image_download")) fail("Third-party image download audit missing.");
if (!JSON.stringify(contentRightsAudit).includes("no_video_download_rehost")) fail("Video download/rehost audit missing.");

if (publicSurfaceAudit.status !== "public_surface_nonactivation_audit_passed") fail("Public surface status mismatch.");
if (!JSON.stringify(publicSurfaceAudit).includes("transitions_not_activated")) fail("Transition non-activation audit missing.");
if (!JSON.stringify(publicSurfaceAudit).includes("video_popup_not_activated")) fail("Video popup non-activation audit missing.");

if (backendDeferralAudit.status !== "backend_deferral_service_key_audit_passed") fail("Backend deferral status mismatch.");
for (const stage of ["AG49", "AG52", "AG55", "AG56"]) {
  if (!backendDeferralAudit.deferred_to_later_stages.includes(stage)) fail(`Deferred stage missing: ${stage}`);
}
if (!JSON.stringify(backendDeferralAudit).includes("no_service_role_key")) fail("Service-key audit missing.");

if (ag45ChainAudit.status !== "ag45_chain_integrity_audit_passed") fail("Chain integrity status mismatch.");
for (const stage of ["AG45A", "AG45B", "AG45C", "AG45D", "AG45E", "AG45F", "AG45G", "AG45H", "AG45I"]) {
  if (!ag45ChainAudit.completed_chain.includes(stage)) fail(`Completed chain missing: ${stage}`);
}
if (ag45ChainAudit.next_stage_id !== "AG45Z") fail("Chain audit next stage must be AG45Z.");
if (!JSON.stringify(ag45ChainAudit).includes("No duplicate Daily Signal Surface module")) fail("No-duplicate module warning missing.");

if (noMutationAudit.status !== "no_mutation_audit_passed_for_ag45i") fail("No-mutation audit status mismatch.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");
for (const check of noMutationAudit.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (readiness.ready_for_ag45z !== true) fail("Readiness must permit AG45Z.");
if (readiness.next_stage_id !== "AG45Z") fail("Readiness next stage must be AG45Z.");
if (readiness.hard_blocker_count_for_ag45z !== 0) fail("AG45Z blocker count must be zero.");
if (readiness.daily_signal_fetch_allowed_next !== false) fail("Daily signal fetch must remain blocked.");
if (readiness.news_scraping_allowed_next !== false) fail("News scraping must remain blocked.");
if (readiness.external_link_verification_allowed_next !== false) fail("External link verification must remain blocked.");
if (readiness.image_fetch_allowed_next !== false) fail("Image fetch must remain blocked.");
if (readiness.video_fetch_allowed_next !== false) fail("Video fetch must remain blocked.");
if (readiness.homepage_mutation_allowed_next !== false) fail("Homepage mutation must remain blocked.");
if (readiness.sql_creation_allowed_next !== false) fail("SQL creation must remain blocked.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain blocked.");
if (readiness.backend_activation_allowed_next !== false) fail("Backend activation must remain blocked.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG45Z") fail("Boundary must point to AG45Z.");

if (preview.ag45i_legal_safety_reputation_audit_recorded !== 1) fail("Preview AG45I flag missing.");
if (preview.legal_attribution_audit_passed !== 1) fail("Preview legal audit flag missing.");
if (preview.source_reputation_safety_audit_passed !== 1) fail("Preview source audit flag missing.");
if (preview.content_rights_risk_audit_passed !== 1) fail("Preview rights audit flag missing.");
if (preview.public_surface_nonactivation_audit_passed !== 1) fail("Preview public surface audit flag missing.");
if (preview.backend_deferral_service_key_audit_passed !== 1) fail("Preview backend audit flag missing.");
if (preview.ag45_chain_integrity_audit_passed !== 1) fail("Preview chain audit flag missing.");
if (preview.ready_for_ag45z !== 1) fail("Preview AG45Z readiness missing.");
if (preview.hard_blocker_count_for_ag45z !== 0) fail("Preview blocker count must be zero.");
if (preview.daily_signal_fetch_executed !== 0) fail("Preview fetch must be zero.");
if (preview.news_scraping_executed !== 0) fail("Preview scraping must be zero.");
if (preview.external_link_verification_executed !== 0) fail("Preview link verification must be zero.");
if (preview.image_fetch_executed !== 0) fail("Preview image fetch must be zero.");
if (preview.video_fetch_executed !== 0) fail("Preview video fetch must be zero.");
if (preview.homepage_mutated !== 0) fail("Preview homepage mutation must be zero.");
if (preview.public_card_rendering_activated !== 0) fail("Preview public card rendering must be zero.");
if (preview.sql_file_created !== 0) fail("Preview SQL file must be zero.");
if (preview.database_write_performed !== 0) fail("Preview DB write must be zero.");
if (preview.backend_auth_supabase_activation_performed !== 0) fail("Preview backend activation must be zero.");
if (preview.service_role_key_exposed !== 0) fail("Preview service role exposure must be zero.");
if (preview.deployment_performed !== 0) fail("Preview deployment must be zero.");

if (!pkg.scripts?.["generate:ag45i"]) fail("Missing package script: generate:ag45i");
if (!pkg.scripts?.["validate:ag45i"]) fail("Missing package script: validate:ag45i");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag45i")) fail("validate:project must include validate:ag45i.");

pass("AG45I Legal, Safety and Reputation-Risk Audit is present.");
pass("AG45A through AG45H chain is consumed.");
pass("Legal and attribution audit passed.");
pass("Source reputation and safety audit passed.");
pass("Content rights and asset-risk audit passed.");
pass("Public surface non-activation audit passed.");
pass("Backend deferral and service-key audit passed.");
pass("AG45 chain integrity audit passed.");
pass("No-mutation audit is valid.");
pass("AG45Z Daily Signal Surface and First Light Closure readiness is valid.");
pass("No fetch, scraping, link verification, image/video fetch, homepage mutation, SQL, database write, backend activation, deployment or service-role exposure is recorded.");
