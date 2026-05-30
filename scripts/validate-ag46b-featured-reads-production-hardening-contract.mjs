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
  console.error(`❌ AG46B validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag46a-featured-reads-production-strengthening-entry.json",
  "data/content-intelligence/featured-reads/ag46a-featured-reads-source-of-truth-consumption-map.json",
  "data/content-intelligence/featured-reads/ag46a-production-strengthening-scope-guard.json",
  "data/content-intelligence/featured-reads/ag46a-no-duplicate-governance-map.json",
  "data/content-intelligence/featured-reads/ag46a-delta-strengthening-register.json",
  "data/content-intelligence/backend-architecture/ag46a-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag46a-production-hardening-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag46a-to-ag46b-featured-reads-production-hardening-boundary.json",

  "data/content-intelligence/quality-reviews/ag46b-featured-reads-production-hardening-contract.json",
  "data/content-intelligence/featured-reads/ag46b-reference-section-production-contract.json",
  "data/content-intelligence/featured-reads/ag46b-visual-credit-production-contract.json",
  "data/content-intelligence/featured-reads/ag46b-long-form-scanability-contract.json",
  "data/content-intelligence/featured-reads/ag46b-object-layout-clean-export-contract.json",
  "data/content-intelligence/featured-reads/ag46b-admin-review-handoff-contract.json",
  "data/content-intelligence/featured-reads/ag46b-no-duplicate-consumption-audit.json",
  "data/content-intelligence/backend-architecture/ag46b-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag46b-production-readiness-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag46b-to-ag46c-featured-reads-production-readiness-audit-boundary.json",
  "data/quality/ag46b-featured-reads-production-hardening-contract.json",
  "data/quality/ag46b-featured-reads-production-hardening-contract-preview.json",
  "docs/quality/AG46B_FEATURED_READS_PRODUCTION_HARDENING_CONTRACT.md",
  "scripts/generate-ag46b-featured-reads-production-hardening-contract.mjs",
  "scripts/validate-ag46b-featured-reads-production-hardening-contract.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag46aReview = readJson("data/content-intelligence/quality-reviews/ag46a-featured-reads-production-strengthening-entry.json");
const ag46aSourceConsumptionMap = readJson("data/content-intelligence/featured-reads/ag46a-featured-reads-source-of-truth-consumption-map.json");
const ag46aNoDuplicateMap = readJson("data/content-intelligence/featured-reads/ag46a-no-duplicate-governance-map.json");
const ag46aDeltaRegister = readJson("data/content-intelligence/featured-reads/ag46a-delta-strengthening-register.json");
const ag46aNoMutationAudit = readJson("data/content-intelligence/backend-architecture/ag46a-no-mutation-audit-register.json");
const ag46aReadiness = readJson("data/content-intelligence/quality-registry/ag46a-production-hardening-readiness-record.json");
const ag46aBoundary = readJson("data/content-intelligence/mutation-plans/ag46a-to-ag46b-featured-reads-production-hardening-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ag46b-featured-reads-production-hardening-contract.json");
const referenceSectionContract = readJson("data/content-intelligence/featured-reads/ag46b-reference-section-production-contract.json");
const visualCreditContract = readJson("data/content-intelligence/featured-reads/ag46b-visual-credit-production-contract.json");
const longFormScanabilityContract = readJson("data/content-intelligence/featured-reads/ag46b-long-form-scanability-contract.json");
const objectLayoutExportContract = readJson("data/content-intelligence/featured-reads/ag46b-object-layout-clean-export-contract.json");
const adminReviewHandoffContract = readJson("data/content-intelligence/featured-reads/ag46b-admin-review-handoff-contract.json");
const noDuplicateConsumptionAudit = readJson("data/content-intelligence/featured-reads/ag46b-no-duplicate-consumption-audit.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/ag46b-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag46b-production-readiness-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag46b-to-ag46c-featured-reads-production-readiness-audit-boundary.json");
const preview = readJson("data/quality/ag46b-featured-reads-production-hardening-contract-preview.json");
const pkg = readJson("package.json");

if (ag46aReview.status !== "featured_reads_production_strengthening_entry_ready_for_ag46b") fail("AG46A review status mismatch.");
if (ag46aReview.summary.ready_for_ag46b !== true) fail("AG46A readiness summary missing.");
if (!JSON.stringify(ag46aSourceConsumptionMap).includes("AG43")) fail("AG43 source consumption missing.");
if (!JSON.stringify(ag46aSourceConsumptionMap).includes("AG45")) fail("AG45 source consumption missing.");
if (!JSON.stringify(ag46aNoDuplicateMap).includes("AR01 / AG05D")) fail("AR01/AG05D no-duplicate family missing.");
if (!JSON.stringify(ag46aNoDuplicateMap).includes("AV01 / AV02")) fail("AV01/AV02 no-duplicate family missing.");
if (ag46aNoMutationAudit.audit_passed !== true) fail("AG46A no-mutation audit must pass.");
if (ag46aReadiness.ready_for_ag46b !== true) fail("AG46A readiness must permit AG46B.");
if (ag46aBoundary.next_stage_id !== "AG46B") fail("AG46A boundary must point to AG46B.");

for (const item of ["reference_section_production_contract", "visual_credit_production_contract", "long_form_scanability_contract", "clean_export_contract", "admin_review_handoff_contract"]) {
  if (!JSON.stringify(ag46aDeltaRegister.delta_items_for_ag46b).includes(item)) fail(`AG46A delta missing: ${item}`);
}

if (review.status !== "featured_reads_production_hardening_contract_ready_for_ag46c") fail("Review status mismatch.");
if (review.summary.ag46b_featured_reads_production_hardening_contract_recorded !== true) fail("AG46B summary flag missing.");
if (review.summary.ag46a_consumed !== true) fail("AG46A consumed flag missing.");
if (review.summary.ag43z_consumed !== true) fail("AG43Z consumed flag missing.");
if (review.summary.ag45z_consumed !== true) fail("AG45Z consumed flag missing.");
if (review.summary.reference_section_contract_recorded !== true) fail("Reference contract summary missing.");
if (review.summary.visual_credit_contract_recorded !== true) fail("Visual credit contract summary missing.");
if (review.summary.long_form_scanability_contract_recorded !== true) fail("Scanability contract summary missing.");
if (review.summary.object_layout_clean_export_contract_recorded !== true) fail("Object/export contract summary missing.");
if (review.summary.admin_review_handoff_contract_recorded !== true) fail("Admin handoff contract summary missing.");
if (review.summary.no_duplicate_consumption_audit_recorded !== true) fail("No-duplicate audit summary missing.");
if (review.summary.ready_for_ag46c !== true) fail("AG46C readiness missing.");
if (review.summary.hard_blocker_count_for_ag46c !== 0) fail("AG46C blocker count must be zero.");
for (const key of ["article_mutated", "article_generated", "reference_fetch_executed", "image_fetch_executed", "image_generation_executed", "clean_export_generated", "admin_queue_mutated", "homepage_mutated", "sql_file_created", "database_write_performed", "backend_auth_supabase_activation_performed", "deployment_performed", "service_role_key_exposed"]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (referenceSectionContract.status !== "reference_section_production_contract_recorded") fail("Reference contract status mismatch.");
if (!JSON.stringify(referenceSectionContract.contract_rules).includes("one clean final section")) fail("One final reference section rule missing.");
if (!JSON.stringify(referenceSectionContract.contract_rules).includes("No live reference fetching")) fail("No live reference fetch rule missing.");

if (visualCreditContract.status !== "visual_credit_production_contract_recorded") fail("Visual credit contract status mismatch.");
if (!JSON.stringify(visualCreditContract.contract_rules).includes("Drishvara editorial synthesis")) fail("Drishvara visual synthesis rule missing.");
if (!JSON.stringify(visualCreditContract.contract_rules).includes("No image fetching")) fail("No image fetching rule missing.");
if (!JSON.stringify(visualCreditContract.production_acceptance_criteria_later).includes("no internal object labels")) fail("No internal object labels visual criterion missing.");

if (longFormScanabilityContract.status !== "long_form_scanability_contract_recorded") fail("Long-form scanability contract status mismatch.");
if (!JSON.stringify(longFormScanabilityContract.contract_rules).includes("clear subheadings")) fail("Clear subheadings rule missing.");
if (!JSON.stringify(longFormScanabilityContract.contract_rules).includes("No article text mutation")) fail("No article mutation scanability rule missing.");

if (objectLayoutExportContract.status !== "object_layout_clean_export_contract_recorded") fail("Object layout/export contract status mismatch.");
if (!JSON.stringify(objectLayoutExportContract.contract_rules).includes("must not clip text")) fail("No clipping rule missing.");
if (!JSON.stringify(objectLayoutExportContract.contract_rules).includes("browser print headers and footers")) fail("Clean export browser header/footer rule missing.");
if (!JSON.stringify(objectLayoutExportContract.contract_rules).includes("No PDF/export file is generated")) fail("No PDF/export generation rule missing.");

if (adminReviewHandoffContract.status !== "admin_review_handoff_contract_recorded") fail("Admin handoff contract status mismatch.");
if (!JSON.stringify(adminReviewHandoffContract.contract_rules).includes("Admin/Editor review")) fail("Admin/Editor review rule missing.");
if (!JSON.stringify(adminReviewHandoffContract.contract_rules).includes("No admin queue mutation")) fail("No admin queue mutation rule missing.");

if (noDuplicateConsumptionAudit.status !== "no_duplicate_consumption_audit_passed") fail("No-duplicate consumption audit status mismatch.");
if (noDuplicateConsumptionAudit.audit_passed !== true) fail("No-duplicate audit must pass.");
if (noDuplicateConsumptionAudit.failed_checks.length !== 0) fail("No-duplicate failed checks must be zero.");
for (const check of noDuplicateConsumptionAudit.checks) {
  if (check.passed !== true) fail(`No-duplicate check failed: ${check.check_id}`);
}

if (noMutationAudit.status !== "no_mutation_audit_passed_for_ag46b") fail("No-mutation audit status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");
for (const check of noMutationAudit.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (readiness.ready_for_ag46c !== true) fail("Readiness must permit AG46C.");
if (readiness.next_stage_id !== "AG46C") fail("Readiness next stage must be AG46C.");
if (readiness.article_mutation_allowed_next !== false) fail("Article mutation must remain blocked.");
if (readiness.reference_fetch_allowed_next !== false) fail("Reference fetch must remain blocked.");
if (readiness.image_generation_allowed_next !== false) fail("Image generation must remain blocked.");
if (readiness.clean_export_generation_allowed_next !== false) fail("Clean export generation must remain blocked.");
if (readiness.admin_queue_mutation_allowed_next !== false) fail("Admin queue mutation must remain blocked.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain blocked.");
if (readiness.backend_activation_allowed_next !== false) fail("Backend activation must remain blocked.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG46C") fail("Boundary must point to AG46C.");
if (!JSON.stringify(boundary.allowed_scope).includes("Audit AG46A and AG46B")) fail("AG46C audit scope missing.");
if (!JSON.stringify(boundary.allowed_scope).includes("Prepare AG46Z closure readiness")) fail("AG46Z readiness boundary missing.");

if (preview.ag46b_featured_reads_production_hardening_contract_recorded !== 1) fail("Preview AG46B flag missing.");
if (preview.ag46a_consumed !== 1) fail("Preview AG46A consumed missing.");
if (preview.ag43z_consumed !== 1) fail("Preview AG43Z consumed missing.");
if (preview.ag45z_consumed !== 1) fail("Preview AG45Z consumed missing.");
if (preview.reference_section_contract_recorded !== 1) fail("Preview reference contract missing.");
if (preview.visual_credit_contract_recorded !== 1) fail("Preview visual credit contract missing.");
if (preview.long_form_scanability_contract_recorded !== 1) fail("Preview scanability contract missing.");
if (preview.object_layout_clean_export_contract_recorded !== 1) fail("Preview object/export contract missing.");
if (preview.admin_review_handoff_contract_recorded !== 1) fail("Preview admin contract missing.");
if (preview.ready_for_ag46c !== 1) fail("Preview AG46C readiness missing.");
for (const key of ["article_mutated", "article_generated", "reference_fetch_executed", "image_fetch_executed", "image_generation_executed", "clean_export_generated", "admin_queue_mutated", "homepage_mutated", "sql_file_created", "database_write_performed", "backend_auth_supabase_activation_performed", "deployment_performed", "service_role_key_exposed"]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ag46b"]) fail("Missing package script: generate:ag46b");
if (!pkg.scripts?.["validate:ag46b"]) fail("Missing package script: validate:ag46b");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag46b")) fail("validate:project must include validate:ag46b.");

pass("AG46B Featured Reads Production Hardening Contract is present.");
pass("AG46A, AG43Z and AG45Z are consumed.");
pass("Reference section production contract is valid.");
pass("Visual credit production contract is valid.");
pass("Long-form scanability contract is valid.");
pass("Object layout and clean export contract is valid.");
pass("Admin review handoff contract is valid.");
pass("No-duplicate consumption audit is valid.");
pass("No-mutation audit is valid.");
pass("AG46C Featured Reads Production Readiness Audit readiness is valid.");
pass("No article mutation, reference fetch, image generation, clean export, admin queue mutation, SQL, database write, backend activation, deployment or service-role exposure is recorded.");
