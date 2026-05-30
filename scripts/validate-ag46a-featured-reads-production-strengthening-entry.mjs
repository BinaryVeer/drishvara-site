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
  console.error(`❌ AG46A validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag43z-article-intelligence-quality-automation-closure.json",
  "data/content-intelligence/closure-records/ag43z-article-intelligence-quality-automation-closure.json",
  "data/content-intelligence/quality-reviews/ag45z-daily-signal-surface-first-light-closure.json",
  "data/content-intelligence/closure-records/ag45z-daily-signal-surface-first-light-closure.json",
  "data/content-intelligence/quality-registry/ag45z-carry-forward-register.json",
  "data/content-intelligence/quality-registry/ag45z-ag46-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag45z-to-ag46-featured-reads-production-strengthening-boundary.json",
  "data/content-intelligence/backend-architecture/ag45z-no-mutation-audit-register.json",

  "data/content-intelligence/quality-reviews/ag46a-featured-reads-production-strengthening-entry.json",
  "data/content-intelligence/featured-reads/ag46a-featured-reads-source-of-truth-consumption-map.json",
  "data/content-intelligence/featured-reads/ag46a-production-strengthening-scope-guard.json",
  "data/content-intelligence/featured-reads/ag46a-no-duplicate-governance-map.json",
  "data/content-intelligence/featured-reads/ag46a-delta-strengthening-register.json",
  "data/content-intelligence/backend-architecture/ag46a-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag46a-production-hardening-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag46a-to-ag46b-featured-reads-production-hardening-boundary.json",
  "data/quality/ag46a-featured-reads-production-strengthening-entry.json",
  "data/quality/ag46a-featured-reads-production-strengthening-entry-preview.json",
  "docs/quality/AG46A_FEATURED_READS_PRODUCTION_STRENGTHENING_ENTRY.md",
  "scripts/generate-ag46a-featured-reads-production-strengthening-entry.mjs",
  "scripts/validate-ag46a-featured-reads-production-strengthening-entry.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag43zReview = readJson("data/content-intelligence/quality-reviews/ag43z-article-intelligence-quality-automation-closure.json");
const ag43zClosure = readJson("data/content-intelligence/closure-records/ag43z-article-intelligence-quality-automation-closure.json");
const ag45zReview = readJson("data/content-intelligence/quality-reviews/ag45z-daily-signal-surface-first-light-closure.json");
const ag45zClosure = readJson("data/content-intelligence/closure-records/ag45z-daily-signal-surface-first-light-closure.json");
const ag45zCarryForward = readJson("data/content-intelligence/quality-registry/ag45z-carry-forward-register.json");
const ag45zReadiness = readJson("data/content-intelligence/quality-registry/ag45z-ag46-readiness-record.json");
const ag45zBoundary = readJson("data/content-intelligence/mutation-plans/ag45z-to-ag46-featured-reads-production-strengthening-boundary.json");
const ag45zNoMutationAudit = readJson("data/content-intelligence/backend-architecture/ag45z-no-mutation-audit-register.json");

const review = readJson("data/content-intelligence/quality-reviews/ag46a-featured-reads-production-strengthening-entry.json");
const sourceConsumptionMap = readJson("data/content-intelligence/featured-reads/ag46a-featured-reads-source-of-truth-consumption-map.json");
const productionScopeGuard = readJson("data/content-intelligence/featured-reads/ag46a-production-strengthening-scope-guard.json");
const noDuplicateGovernanceMap = readJson("data/content-intelligence/featured-reads/ag46a-no-duplicate-governance-map.json");
const deltaStrengtheningRegister = readJson("data/content-intelligence/featured-reads/ag46a-delta-strengthening-register.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/ag46a-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag46a-production-hardening-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag46a-to-ag46b-featured-reads-production-hardening-boundary.json");
const preview = readJson("data/quality/ag46a-featured-reads-production-strengthening-entry-preview.json");
const pkg = readJson("package.json");

if (!JSON.stringify(ag43zReview).includes("AG43")) fail("AG43Z review does not look consumed.");
if (!JSON.stringify(ag43zClosure).includes("AG43")) fail("AG43Z closure does not look consumed.");
if (ag45zReview.status !== "daily_signal_surface_first_light_closure_ready_for_ag46") fail("AG45Z review status mismatch.");
if (ag45zReview.summary.ready_for_ag46 !== true) fail("AG45Z readiness summary missing.");
if (ag45zClosure.status !== "daily_signal_surface_first_light_closed") fail("AG45Z closure status mismatch.");
if (ag45zReadiness.ready_for_ag46 !== true) fail("AG45Z readiness must permit AG46.");
if (ag45zBoundary.next_stage_id !== "AG46") fail("AG45Z boundary must point to AG46.");
if (ag45zNoMutationAudit.audit_passed !== true) fail("AG45Z no-mutation audit must pass.");
if (!JSON.stringify(ag45zCarryForward).includes("Featured Reads")) fail("AG45Z carry-forward must include Featured Reads.");

if (review.status !== "featured_reads_production_strengthening_entry_ready_for_ag46b") fail("Review status mismatch.");
if (review.summary.ag46a_featured_reads_production_strengthening_entry_recorded !== true) fail("AG46A summary flag missing.");
if (review.summary.ag43z_consumed !== true) fail("AG43Z consumed flag missing.");
if (review.summary.ag45z_consumed !== true) fail("AG45Z consumed flag missing.");
if (review.summary.source_of_truth_consumption_map_recorded !== true) fail("Source consumption summary missing.");
if (review.summary.production_scope_guard_recorded !== true) fail("Scope guard summary missing.");
if (review.summary.no_duplicate_governance_map_recorded !== true) fail("No-duplicate governance summary missing.");
if (review.summary.delta_strengthening_register_recorded !== true) fail("Delta register summary missing.");
if (review.summary.ready_for_ag46b !== true) fail("AG46B readiness missing.");
if (review.summary.hard_blocker_count_for_ag46b !== 0) fail("AG46B blocker count must be zero.");
if (review.summary.article_mutated !== false) fail("Article mutation must remain false.");
if (review.summary.reference_fetch_executed !== false) fail("Reference fetch must remain false.");
if (review.summary.image_generation_executed !== false) fail("Image generation must remain false.");
if (review.summary.database_write_performed !== false) fail("Database write must remain false.");
if (review.summary.backend_auth_supabase_activation_performed !== false) fail("Backend activation must remain false.");

if (sourceConsumptionMap.status !== "featured_reads_source_of_truth_consumption_map_recorded") fail("Source consumption map status mismatch.");
if (!JSON.stringify(sourceConsumptionMap).includes("AG43")) fail("AG43 source consumption missing.");
if (!JSON.stringify(sourceConsumptionMap).includes("AG45")) fail("AG45 source consumption missing.");
if (!JSON.stringify(sourceConsumptionMap.consumption_rules).includes("must not recreate AG43")) fail("AG43 no-recreate rule missing.");
if (!JSON.stringify(sourceConsumptionMap.consumption_rules).includes("must not recreate AG45")) fail("AG45 no-recreate rule missing.");

if (productionScopeGuard.status !== "production_strengthening_scope_guard_recorded") fail("Scope guard status mismatch.");
if (!productionScopeGuard.blocked_scope.includes("article file mutation")) fail("Article mutation block missing.");
if (!productionScopeGuard.blocked_scope.includes("reference fetching")) fail("Reference fetching block missing.");
if (!productionScopeGuard.blocked_scope.includes("Supabase/Auth/backend activation")) fail("Backend activation block missing.");

if (noDuplicateGovernanceMap.status !== "no_duplicate_governance_map_recorded") fail("No-duplicate governance status mismatch.");
for (const family of ["AG43", "AG45", "AR01 / AG05D / AR01-R1 / AG05D-R2", "AV01 / AV02"]) {
  if (!JSON.stringify(noDuplicateGovernanceMap.existing_modules_to_consume_not_duplicate).includes(family)) fail(`No-duplicate family missing: ${family}`);
}
if (!JSON.stringify(noDuplicateGovernanceMap).includes("delta hardening chain only")) fail("Delta hardening chain rule missing.");

if (deltaStrengtheningRegister.status !== "delta_strengthening_register_recorded") fail("Delta register status mismatch.");
if (deltaStrengtheningRegister.ready_for_ag46b !== true) fail("Delta register must be ready for AG46B.");
for (const item of ["reference_section_production_contract", "visual_credit_production_contract", "long_form_scanability_contract", "clean_export_contract", "admin_review_handoff_contract"]) {
  if (!JSON.stringify(deltaStrengtheningRegister.delta_items_for_ag46b).includes(item)) fail(`Delta item missing: ${item}`);
}

if (noMutationAudit.status !== "no_mutation_audit_passed_for_ag46a") fail("No-mutation audit status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");
for (const check of noMutationAudit.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (readiness.ready_for_ag46b !== true) fail("Readiness must permit AG46B.");
if (readiness.next_stage_id !== "AG46B") fail("Readiness next stage must be AG46B.");
if (readiness.article_mutation_allowed_next !== false) fail("Article mutation must remain blocked.");
if (readiness.reference_fetch_allowed_next !== false) fail("Reference fetch must remain blocked.");
if (readiness.image_generation_allowed_next !== false) fail("Image generation must remain blocked.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain blocked.");
if (readiness.backend_activation_allowed_next !== false) fail("Backend activation must remain blocked.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG46B") fail("Boundary must point to AG46B.");
if (!JSON.stringify(boundary.allowed_scope).includes("Featured Reads production hardening contract")) fail("AG46B production hardening scope missing.");
if (!JSON.stringify(boundary.allowed_scope).includes("Do not mutate public articles")) fail("No article mutation boundary missing.");

if (preview.ag46a_featured_reads_production_strengthening_entry_recorded !== 1) fail("Preview AG46A flag missing.");
if (preview.ag43z_consumed !== 1) fail("Preview AG43Z consumed missing.");
if (preview.ag45z_consumed !== 1) fail("Preview AG45Z consumed missing.");
if (preview.ready_for_ag46b !== 1) fail("Preview AG46B readiness missing.");
if (preview.article_mutated !== 0) fail("Preview article mutation must be zero.");
if (preview.reference_fetch_executed !== 0) fail("Preview reference fetch must be zero.");
if (preview.image_generation_executed !== 0) fail("Preview image generation must be zero.");
if (preview.database_write_performed !== 0) fail("Preview database write must be zero.");
if (preview.backend_auth_supabase_activation_performed !== 0) fail("Preview backend activation must be zero.");
if (preview.deployment_performed !== 0) fail("Preview deployment must be zero.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be zero.");

if (!pkg.scripts?.["generate:ag46a"]) fail("Missing package script: generate:ag46a");
if (!pkg.scripts?.["validate:ag46a"]) fail("Missing package script: validate:ag46a");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag46a")) fail("validate:project must include validate:ag46a.");

pass("AG46A Featured Reads Production Strengthening Entry is present.");
pass("AG43Z and AG45Z source-of-truth records are consumed.");
pass("Production scope guard is valid.");
pass("No-duplicate governance map is valid.");
pass("Delta strengthening register is valid.");
pass("No-mutation audit is valid.");
pass("AG46B Featured Reads Production Hardening Contract readiness is valid.");
pass("No article mutation, reference fetch, image generation, homepage mutation, SQL, database write, backend activation, deployment or service-role exposure is recorded.");
