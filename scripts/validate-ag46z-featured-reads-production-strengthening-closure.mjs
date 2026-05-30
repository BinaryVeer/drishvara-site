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
  console.error(`❌ AG46Z validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag46a-featured-reads-production-strengthening-entry.json",
  "data/content-intelligence/quality-reviews/ag46b-featured-reads-production-hardening-contract.json",
  "data/content-intelligence/quality-reviews/ag46c-featured-reads-production-readiness-audit.json",
  "data/content-intelligence/quality-registry/ag46c-ag46-chain-integrity-audit.json",
  "data/content-intelligence/backend-architecture/ag46c-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag46c-ag46z-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag46c-to-ag46z-featured-reads-production-strengthening-closure-boundary.json",

  "data/content-intelligence/quality-reviews/ag46z-featured-reads-production-strengthening-closure.json",
  "data/content-intelligence/closure-records/ag46z-featured-reads-production-strengthening-closure.json",
  "data/content-intelligence/homepage/ag46z-homepage-three-movement-route-ownership-map.json",
  "data/content-intelligence/quality-registry/ag46z-ag46-chain-integration-audit.json",
  "data/content-intelligence/quality-registry/ag46z-carry-forward-register.json",
  "data/content-intelligence/backend-architecture/ag46z-no-duplicate-closure-audit-register.json",
  "data/content-intelligence/backend-architecture/ag46z-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag46z-next-governed-stage-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag46z-to-next-governed-stage-boundary.json",
  "data/quality/ag46z-featured-reads-production-strengthening-closure.json",
  "data/quality/ag46z-featured-reads-production-strengthening-closure-preview.json",
  "docs/quality/AG46Z_FEATURED_READS_PRODUCTION_STRENGTHENING_CLOSURE.md",
  "scripts/generate-ag46z-featured-reads-production-strengthening-closure.mjs",
  "scripts/validate-ag46z-featured-reads-production-strengthening-closure.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag46aReview = readJson("data/content-intelligence/quality-reviews/ag46a-featured-reads-production-strengthening-entry.json");
const ag46bReview = readJson("data/content-intelligence/quality-reviews/ag46b-featured-reads-production-hardening-contract.json");
const ag46cReview = readJson("data/content-intelligence/quality-reviews/ag46c-featured-reads-production-readiness-audit.json");
const ag46cChainIntegrityAudit = readJson("data/content-intelligence/quality-registry/ag46c-ag46-chain-integrity-audit.json");
const ag46cNoMutationAudit = readJson("data/content-intelligence/backend-architecture/ag46c-no-mutation-audit-register.json");
const ag46cReadiness = readJson("data/content-intelligence/quality-registry/ag46c-ag46z-closure-readiness-record.json");
const ag46cBoundary = readJson("data/content-intelligence/mutation-plans/ag46c-to-ag46z-featured-reads-production-strengthening-closure-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ag46z-featured-reads-production-strengthening-closure.json");
const closure = readJson("data/content-intelligence/closure-records/ag46z-featured-reads-production-strengthening-closure.json");
const routeOwnershipMap = readJson("data/content-intelligence/homepage/ag46z-homepage-three-movement-route-ownership-map.json");
const chainIntegrationAudit = readJson("data/content-intelligence/quality-registry/ag46z-ag46-chain-integration-audit.json");
const carryForwardRegister = readJson("data/content-intelligence/quality-registry/ag46z-carry-forward-register.json");
const noDuplicateClosureAudit = readJson("data/content-intelligence/backend-architecture/ag46z-no-duplicate-closure-audit-register.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/ag46z-no-mutation-audit-register.json");
const nextStageReadiness = readJson("data/content-intelligence/quality-registry/ag46z-next-governed-stage-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag46z-to-next-governed-stage-boundary.json");
const preview = readJson("data/quality/ag46z-featured-reads-production-strengthening-closure-preview.json");
const pkg = readJson("package.json");

if (ag46aReview.status !== "featured_reads_production_strengthening_entry_ready_for_ag46b") fail("AG46A review status mismatch.");
if (ag46bReview.status !== "featured_reads_production_hardening_contract_ready_for_ag46c") fail("AG46B review status mismatch.");
if (ag46cReview.status !== "featured_reads_production_readiness_audit_ready_for_ag46z") fail("AG46C review status mismatch.");
if (ag46cReview.summary.ready_for_ag46z !== true) fail("AG46C readiness summary missing.");
if (ag46cChainIntegrityAudit.audit_passed !== true) fail("AG46C chain integrity audit must pass.");
if (ag46cChainIntegrityAudit.next_stage_id !== "AG46Z") fail("AG46C chain audit must point to AG46Z.");
if (ag46cNoMutationAudit.audit_passed !== true) fail("AG46C no-mutation audit must pass.");
if (ag46cReadiness.ready_for_ag46z !== true) fail("AG46C readiness must permit AG46Z.");
if (ag46cBoundary.next_stage_id !== "AG46Z") fail("AG46C boundary must point to AG46Z.");

if (review.status !== "featured_reads_production_strengthening_closure_ready_for_next_governed_stage") fail("Review status mismatch.");
for (const key of [
  "ag46z_featured_reads_production_strengthening_closed",
  "ag46a_to_ag46c_chain_closed",
  "featured_reads_production_strengthening_module_complete",
  "homepage_three_movement_route_ownership_recorded",
  "ag45_owns_first_light",
  "ag46_owns_reading_surface",
  "reflection_layer_deferred",
  "ag43z_consumed",
  "ag45z_consumed",
  "no_duplicate_ag46_module_required",
  "carry_forward_recorded",
  "ready_for_next_governed_stage"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}
if (review.summary.hard_blocker_count !== 0) fail("Hard blocker count must be zero.");

for (const key of ["article_mutated", "article_generated", "reference_fetch_executed", "image_fetch_executed", "image_generation_executed", "clean_export_generated", "pdf_generated", "admin_queue_mutated", "sql_file_created", "database_write_performed", "backend_auth_supabase_activation_performed", "deployment_performed", "service_role_key_exposed"]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (routeOwnershipMap.status !== "homepage_three_movement_route_ownership_recorded") fail("Route ownership status mismatch.");
if (!JSON.stringify(routeOwnershipMap).includes("AG45 owns First Light")) fail("AG45 First Light ownership missing.");
if (!JSON.stringify(routeOwnershipMap).includes("AG46 owns Reading Surface")) fail("AG46 Reading Surface ownership missing.");
if (!JSON.stringify(routeOwnershipMap).includes("Reflection Layer is not AG46 scope")) fail("Reflection Layer deferral missing.");
if (!JSON.stringify(routeOwnershipMap).includes("AG46Z closes only Reading Surface")) fail("AG46 Reading Surface closure rule missing.");

if (closure.status !== "featured_reads_production_strengthening_closed") fail("Closure status mismatch.");
for (const stage of ["AG46A", "AG46B", "AG46C", "AG46Z"]) {
  if (!closure.closed_chain.includes(stage)) fail(`Closure chain missing: ${stage}`);
}
for (const source of ["AG43Z", "AG45Z"]) {
  if (!closure.source_of_truth_consumed.includes(source)) fail(`Closure source-of-truth missing: ${source}`);
}
if (closure.next_stage_id !== "AG47") fail("Closure next stage must be AG47 placeholder.");
if (!JSON.stringify(closure.closure_basis).includes("AG45 owns First Light")) fail("Closure AG45 First Light basis missing.");
if (!JSON.stringify(closure.closure_basis).includes("AG46 owns Reading Surface")) fail("Closure AG46 Reading Surface basis missing.");
if (!JSON.stringify(closure.closure_basis).includes("Reflection Layer remains deferred")) fail("Closure Reflection Layer deferral basis missing.");

if (chainIntegrationAudit.status !== "ag46_chain_integration_audit_passed") fail("Chain integration audit status mismatch.");
if (chainIntegrationAudit.audit_passed !== true) fail("Chain integration audit must pass.");
if (chainIntegrationAudit.homepage_route_alignment.first_light_owner !== "AG45") fail("Chain route First Light owner mismatch.");
if (chainIntegrationAudit.homepage_route_alignment.reading_surface_owner !== "AG46") fail("Chain route Reading Surface owner mismatch.");
if (chainIntegrationAudit.homepage_route_alignment.reflection_layer_owner !== "deferred_later_reflection_modules") fail("Chain route Reflection owner mismatch.");

if (carryForwardRegister.status !== "carry_forward_recorded_for_later_governed_stages") fail("Carry-forward status mismatch.");
for (const phrase of ["First Light", "Reading Surface", "Reflection Layer", "reference section", "visual credit", "clean export", "Admin Review", "backend"]) {
  if (!JSON.stringify(carryForwardRegister.carry_forward_items).includes(phrase)) fail(`Carry-forward phrase missing: ${phrase}`);
}
for (const target of ["AG47", "AG48", "AG49", "AG52", "AG53", "AG55", "AG56"]) {
  if (!JSON.stringify(carryForwardRegister.carry_forward_items).includes(target)) fail(`Carry-forward target missing: ${target}`);
}

if (noDuplicateClosureAudit.status !== "no_duplicate_ag46_module_required") fail("No-duplicate closure status mismatch.");
if (noDuplicateClosureAudit.audit_passed !== true) fail("No-duplicate audit must pass.");
if (noDuplicateClosureAudit.failed_checks.length !== 0) fail("No-duplicate failed checks must be zero.");
if (!JSON.stringify(noDuplicateClosureAudit).includes("First Light remains owned by AG45")) fail("No-duplicate First Light guard missing.");
if (!JSON.stringify(noDuplicateClosureAudit).includes("Reflection Layer is deferred")) fail("No-duplicate Reflection Layer guard missing.");

if (noMutationAudit.status !== "no_mutation_audit_passed_for_ag46z") fail("No-mutation audit status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");
for (const check of noMutationAudit.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (nextStageReadiness.status !== "ready_for_next_governed_stage_after_ag46") fail("Next-stage readiness status mismatch.");
if (nextStageReadiness.ready_for_next_governed_stage !== true) fail("Next-stage readiness must be true.");
if (nextStageReadiness.next_stage_id !== "AG47") fail("Next stage must be AG47 placeholder.");
if (nextStageReadiness.hard_blocker_count !== 0) fail("Next-stage blocker count must be zero.");
if (!JSON.stringify(nextStageReadiness.instruction).includes("AG46Z closes Reading Surface")) fail("Reading Surface instruction missing.");
if (nextStageReadiness.database_write_allowed_next !== false) fail("Database write must remain blocked.");
if (nextStageReadiness.backend_activation_allowed_next !== false) fail("Backend activation must remain blocked.");
if (nextStageReadiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG47") fail("Boundary must point to AG47 placeholder.");
if (!JSON.stringify(boundary.allowed_scope).includes("confirming the approved AG47 title and scope")) fail("AG47 confirmation boundary missing.");
if (!JSON.stringify(boundary.allowed_scope).includes("Do not duplicate AG45 First Light")) fail("AG45 First Light no-duplicate boundary missing.");
if (!JSON.stringify(boundary.allowed_scope).includes("Do not begin Reflection Layer implementation")) fail("Reflection Layer boundary missing.");

for (const key of [
  "ag46z_featured_reads_production_strengthening_closed",
  "ag46a_to_ag46c_chain_closed",
  "featured_reads_production_strengthening_module_complete",
  "homepage_three_movement_route_ownership_recorded",
  "ag45_owns_first_light",
  "ag46_owns_reading_surface",
  "reflection_layer_deferred",
  "ag43z_consumed",
  "ag45z_consumed",
  "no_duplicate_ag46_module_required",
  "carry_forward_recorded",
  "ready_for_next_governed_stage"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}
if (preview.hard_blocker_count !== 0) fail("Preview hard blockers must be zero.");

for (const key of ["article_mutated", "article_generated", "reference_fetch_executed", "image_fetch_executed", "image_generation_executed", "clean_export_generated", "pdf_generated", "admin_queue_mutated", "sql_file_created", "database_write_performed", "backend_auth_supabase_activation_performed", "deployment_performed", "service_role_key_exposed"]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ag46z"]) fail("Missing package script: generate:ag46z");
if (!pkg.scripts?.["validate:ag46z"]) fail("Missing package script: validate:ag46z");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag46z")) fail("validate:project must include validate:ag46z.");

pass("AG46Z Featured Reads Production Strengthening Closure is present.");
pass("AG46A → AG46C chain is closed.");
pass("Homepage route ownership is valid: AG45 owns First Light, AG46 owns Reading Surface, Reflection Layer is deferred.");
pass("AG43Z and AG45Z source-of-truth consumption is preserved.");
pass("Featured Reads Production Strengthening module is complete.");
pass("No duplicate AG46 module is required.");
pass("Carry-forward to later governed implementation/export/admin/backend/reflection stages is recorded.");
pass("No-mutation audit is valid.");
pass("Next governed stage readiness is valid with AG47 title/scope confirmation required.");
pass("No article mutation, reference fetch, image generation, export/PDF generation, admin queue mutation, SQL, database write, backend activation, deployment or service-role exposure is recorded.");
