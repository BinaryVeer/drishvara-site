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
  console.error(`❌ AG46C validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag46a-featured-reads-production-strengthening-entry.json",
  "data/content-intelligence/backend-architecture/ag46a-no-mutation-audit-register.json",
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

  "data/content-intelligence/quality-reviews/ag46c-featured-reads-production-readiness-audit.json",
  "data/content-intelligence/featured-reads/ag46c-production-contract-coverage-audit.json",
  "data/content-intelligence/featured-reads/ag46c-reference-production-readiness-audit.json",
  "data/content-intelligence/featured-reads/ag46c-visual-credit-readiness-audit.json",
  "data/content-intelligence/featured-reads/ag46c-scanability-export-readiness-audit.json",
  "data/content-intelligence/featured-reads/ag46c-admin-review-handoff-readiness-audit.json",
  "data/content-intelligence/quality-registry/ag46c-ag46-chain-integrity-audit.json",
  "data/content-intelligence/backend-architecture/ag46c-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag46c-ag46z-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag46c-to-ag46z-featured-reads-production-strengthening-closure-boundary.json",
  "data/quality/ag46c-featured-reads-production-readiness-audit.json",
  "data/quality/ag46c-featured-reads-production-readiness-audit-preview.json",
  "docs/quality/AG46C_FEATURED_READS_PRODUCTION_READINESS_AUDIT.md",
  "scripts/generate-ag46c-featured-reads-production-readiness-audit.mjs",
  "scripts/validate-ag46c-featured-reads-production-readiness-audit.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag46aReview = readJson("data/content-intelligence/quality-reviews/ag46a-featured-reads-production-strengthening-entry.json");
const ag46aNoMutationAudit = readJson("data/content-intelligence/backend-architecture/ag46a-no-mutation-audit-register.json");
const ag46bReview = readJson("data/content-intelligence/quality-reviews/ag46b-featured-reads-production-hardening-contract.json");
const ag46bNoDuplicateAudit = readJson("data/content-intelligence/featured-reads/ag46b-no-duplicate-consumption-audit.json");
const ag46bNoMutationAudit = readJson("data/content-intelligence/backend-architecture/ag46b-no-mutation-audit-register.json");
const ag46bReadiness = readJson("data/content-intelligence/quality-registry/ag46b-production-readiness-audit-readiness-record.json");
const ag46bBoundary = readJson("data/content-intelligence/mutation-plans/ag46b-to-ag46c-featured-reads-production-readiness-audit-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ag46c-featured-reads-production-readiness-audit.json");
const contractCoverageAudit = readJson("data/content-intelligence/featured-reads/ag46c-production-contract-coverage-audit.json");
const referenceReadinessAudit = readJson("data/content-intelligence/featured-reads/ag46c-reference-production-readiness-audit.json");
const visualCreditReadinessAudit = readJson("data/content-intelligence/featured-reads/ag46c-visual-credit-readiness-audit.json");
const scanabilityExportReadinessAudit = readJson("data/content-intelligence/featured-reads/ag46c-scanability-export-readiness-audit.json");
const adminHandoffReadinessAudit = readJson("data/content-intelligence/featured-reads/ag46c-admin-review-handoff-readiness-audit.json");
const chainIntegrityAudit = readJson("data/content-intelligence/quality-registry/ag46c-ag46-chain-integrity-audit.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/ag46c-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag46c-ag46z-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag46c-to-ag46z-featured-reads-production-strengthening-closure-boundary.json");
const preview = readJson("data/quality/ag46c-featured-reads-production-readiness-audit-preview.json");
const pkg = readJson("package.json");

if (ag46aReview.status !== "featured_reads_production_strengthening_entry_ready_for_ag46b") fail("AG46A review status mismatch.");
if (ag46aNoMutationAudit.audit_passed !== true) fail("AG46A no-mutation audit must pass.");
if (ag46bReview.status !== "featured_reads_production_hardening_contract_ready_for_ag46c") fail("AG46B review status mismatch.");
if (ag46bReview.summary.ready_for_ag46c !== true) fail("AG46B readiness summary missing.");
if (ag46bNoDuplicateAudit.audit_passed !== true) fail("AG46B no-duplicate audit must pass.");
if (ag46bNoMutationAudit.audit_passed !== true) fail("AG46B no-mutation audit must pass.");
if (ag46bReadiness.ready_for_ag46c !== true) fail("AG46B readiness must permit AG46C.");
if (ag46bBoundary.next_stage_id !== "AG46C") fail("AG46B boundary must point to AG46C.");

if (review.status !== "featured_reads_production_readiness_audit_ready_for_ag46z") fail("Review status mismatch.");
if (review.summary.ag46c_featured_reads_production_readiness_audit_recorded !== true) fail("AG46C summary flag missing.");
if (review.summary.ag46a_consumed !== true) fail("AG46A consumed flag missing.");
if (review.summary.ag46b_consumed !== true) fail("AG46B consumed flag missing.");
if (review.summary.production_contract_coverage_audit_passed !== true) fail("Contract coverage audit summary missing.");
if (review.summary.reference_production_readiness_audit_passed !== true) fail("Reference readiness summary missing.");
if (review.summary.visual_credit_readiness_audit_passed !== true) fail("Visual credit summary missing.");
if (review.summary.scanability_export_readiness_audit_passed !== true) fail("Scanability/export summary missing.");
if (review.summary.admin_review_handoff_readiness_audit_passed !== true) fail("Admin handoff summary missing.");
if (review.summary.ag46_chain_integrity_audit_passed !== true) fail("Chain integrity summary missing.");
if (review.summary.ready_for_ag46z !== true) fail("AG46Z readiness missing.");
if (review.summary.hard_blocker_count_for_ag46z !== 0) fail("AG46Z blocker count must be zero.");

for (const key of ["article_mutated", "article_generated", "reference_fetch_executed", "image_fetch_executed", "image_generation_executed", "clean_export_generated", "pdf_generated", "admin_queue_mutated", "sql_file_created", "database_write_performed", "backend_auth_supabase_activation_performed", "deployment_performed", "service_role_key_exposed"]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

for (const audit of [
  contractCoverageAudit,
  referenceReadinessAudit,
  visualCreditReadinessAudit,
  scanabilityExportReadinessAudit,
  adminHandoffReadinessAudit,
  chainIntegrityAudit,
  noMutationAudit
]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
}

if (contractCoverageAudit.status !== "production_contract_coverage_audit_passed") fail("Contract coverage audit status mismatch.");
if (!JSON.stringify(contractCoverageAudit).includes("reference_section_contract_present")) fail("Reference contract coverage missing.");
if (!JSON.stringify(contractCoverageAudit).includes("visual_credit_contract_present")) fail("Visual contract coverage missing.");
if (!JSON.stringify(contractCoverageAudit).includes("admin_review_handoff_contract_present")) fail("Admin contract coverage missing.");

if (referenceReadinessAudit.status !== "reference_production_readiness_audit_passed") fail("Reference readiness status mismatch.");
if (!JSON.stringify(referenceReadinessAudit).includes("single_final_reference_section_required")) fail("Single final reference section audit missing.");
if (!JSON.stringify(referenceReadinessAudit).includes("no_reference_fetch_executed")) fail("No reference fetch audit missing.");

if (visualCreditReadinessAudit.status !== "visual_credit_readiness_audit_passed") fail("Visual credit readiness status mismatch.");
if (!JSON.stringify(visualCreditReadinessAudit).includes("drishvara_editorial_synthesis_credit_present")) fail("Drishvara editorial synthesis audit missing.");
if (!JSON.stringify(visualCreditReadinessAudit).includes("no_image_fetch_or_generation_executed")) fail("No image fetch/generation audit missing.");

if (scanabilityExportReadinessAudit.status !== "scanability_export_readiness_audit_passed") fail("Scanability/export readiness status mismatch.");
if (!JSON.stringify(scanabilityExportReadinessAudit).includes("clear_subheadings_required")) fail("Clear subheadings audit missing.");
if (!JSON.stringify(scanabilityExportReadinessAudit).includes("browser_header_footer_exclusion_required")) fail("Browser header/footer audit missing.");
if (!JSON.stringify(scanabilityExportReadinessAudit).includes("no_export_or_pdf_generated")) fail("No export/PDF audit missing.");

if (adminHandoffReadinessAudit.status !== "admin_review_handoff_readiness_audit_passed") fail("Admin handoff readiness status mismatch.");
if (!JSON.stringify(adminHandoffReadinessAudit).includes("admin_editor_review_required")) fail("Admin editor review audit missing.");
if (!JSON.stringify(adminHandoffReadinessAudit).includes("no_admin_queue_mutation_executed")) fail("No admin queue mutation audit missing.");

if (chainIntegrityAudit.status !== "ag46_chain_integrity_audit_passed") fail("Chain integrity status mismatch.");
for (const stage of ["AG46A", "AG46B", "AG46C"]) {
  if (!chainIntegrityAudit.completed_chain.includes(stage)) fail(`Chain stage missing: ${stage}`);
}
for (const source of ["AG43Z", "AG45Z"]) {
  if (!chainIntegrityAudit.source_of_truth_consumed.includes(source)) fail(`Source-of-truth missing: ${source}`);
}
if (chainIntegrityAudit.next_stage_id !== "AG46Z") fail("Chain integrity next stage must be AG46Z.");

if (noMutationAudit.status !== "no_mutation_audit_passed_for_ag46c") fail("No-mutation status mismatch.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");
for (const check of noMutationAudit.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (readiness.ready_for_ag46z !== true) fail("Readiness must permit AG46Z.");
if (readiness.next_stage_id !== "AG46Z") fail("Readiness next stage must be AG46Z.");
if (readiness.hard_blocker_count_for_ag46z !== 0) fail("AG46Z blocker count must be zero.");
if (readiness.reference_fetch_allowed_next !== false) fail("Reference fetch must remain blocked.");
if (readiness.image_generation_allowed_next !== false) fail("Image generation must remain blocked.");
if (readiness.clean_export_generation_allowed_next !== false) fail("Clean export must remain blocked.");
if (readiness.admin_queue_mutation_allowed_next !== false) fail("Admin queue mutation must remain blocked.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain blocked.");
if (readiness.backend_activation_allowed_next !== false) fail("Backend activation must remain blocked.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG46Z") fail("Boundary must point to AG46Z.");
if (!JSON.stringify(boundary.allowed_scope).includes("Close AG46A through AG46C")) fail("AG46Z closure boundary missing.");
if (!JSON.stringify(boundary.allowed_scope).includes("Confirm AG43Z and AG45Z were consumed without duplication")) fail("AG43Z/AG45Z no-duplicate closure boundary missing.");

if (preview.ag46c_featured_reads_production_readiness_audit_recorded !== 1) fail("Preview AG46C flag missing.");
if (preview.ready_for_ag46z !== 1) fail("Preview AG46Z readiness missing.");
if (preview.hard_blocker_count_for_ag46z !== 0) fail("Preview blocker count must be zero.");
for (const key of ["article_mutated", "article_generated", "reference_fetch_executed", "image_fetch_executed", "image_generation_executed", "clean_export_generated", "pdf_generated", "admin_queue_mutated", "sql_file_created", "database_write_performed", "backend_auth_supabase_activation_performed", "deployment_performed", "service_role_key_exposed"]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ag46c"]) fail("Missing package script: generate:ag46c");
if (!pkg.scripts?.["validate:ag46c"]) fail("Missing package script: validate:ag46c");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag46c")) fail("validate:project must include validate:ag46c.");

pass("AG46C Featured Reads Production Readiness Audit is present.");
pass("AG46A and AG46B records are consumed.");
pass("Production contract coverage audit is valid.");
pass("Reference production readiness audit is valid.");
pass("Visual credit readiness audit is valid.");
pass("Scanability and clean export readiness audit is valid.");
pass("Admin review handoff readiness audit is valid.");
pass("AG46 chain integrity audit is valid.");
pass("No-mutation audit is valid.");
pass("AG46Z Featured Reads Production Strengthening Closure readiness is valid.");
pass("No article mutation, reference fetch, image generation, export/PDF generation, admin queue mutation, SQL, database write, backend activation, deployment or service-role exposure is recorded.");
