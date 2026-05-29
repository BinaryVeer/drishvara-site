import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

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

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function fail(message) {
  console.error(`❌ AG43C validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function count(text, needle) {
  return text.split(needle).length - 1;
}

const required = [
  "articles/policy/enhancing-public-healthcare-delivery-digital-innovation.html",

  "data/content-intelligence/quality-reviews/ag43b-topic-reference-image-integration.json",
  "data/content-intelligence/backend-architecture/ag43b-topic-reference-image-governance-integration.json",
  "data/content-intelligence/backend-architecture/ag43b-topic-reference-image-readiness-matrix.json",
  "data/content-intelligence/backend-architecture/ag43b-combined-readiness-threshold-model.json",
  "data/content-intelligence/quality-registry/ag43b-quality-longform-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag43b-to-ag43c-quality-longform-readiness-boundary.json",

  "data/content-intelligence/apply-records/ag12c-r1-public-object-label-layout-repair.json",
  "data/content-intelligence/audit-records/ag12c-r1-public-object-label-layout-repair-audit.json",
  "data/content-intelligence/quality-registry/ag12c-r1-public-object-label-layout-repair-readiness-record.json",

  "data/content-intelligence/apply-records/ar01-r1-credit-reference-surface-cleanup.json",
  "data/content-intelligence/credit-reference/ar01-r1-drishvara-editorial-synthesis-credit-policy.json",
  "data/content-intelligence/audit-records/ar01-r1-credit-reference-surface-cleanup-audit.json",
  "data/content-intelligence/quality-registry/ar01-r1-credit-reference-surface-cleanup-readiness-record.json",

  "scripts/article-quality-review-preflight.js",
  "scripts/validate-ag06b-content-intelligence-schema.mjs",

  "data/content-intelligence/quality-reviews/ag43c-article-quality-longform-readiness-integration.json",
  "data/content-intelligence/backend-architecture/ag43c-article-quality-longform-readiness-integration.json",
  "data/content-intelligence/backend-architecture/ag43c-existing-quality-module-consumption-map.json",
  "data/content-intelligence/quality-rules/ag43c-longform-featured-read-standard.json",
  "data/content-intelligence/quality-rules/ag43c-public-readiness-delta-rulebook.json",
  "data/content-intelligence/backend-architecture/ag43c-object-placement-credit-reference-readiness-model.json",
  "data/content-intelligence/backend-architecture/ag43c-no-duplicate-quality-audit-register.json",
  "data/content-intelligence/backend-architecture/ag43c-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag43c-article-quality-longform-readiness-blocker-register.json",
  "data/content-intelligence/quality-registry/ag43c-quality-readiness-audit-boundary-record.json",
  "data/content-intelligence/mutation-plans/ag43c-to-ag43d-quality-readiness-audit-boundary.json",
  "data/quality/ag43c-article-quality-longform-readiness-integration.json",
  "data/quality/ag43c-article-quality-longform-readiness-integration-preview.json",
  "docs/quality/AG43C_ARTICLE_QUALITY_LONGFORM_READINESS_INTEGRATION.md",
  "scripts/generate-ag43c-article-quality-longform-readiness-integration.mjs",
  "scripts/validate-ag43c-article-quality-longform-readiness-integration.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const articlePath = "articles/policy/enhancing-public-healthcare-delivery-digital-innovation.html";
const articleHtml = read(articlePath);
const articleHash = sha256(articleHtml);

const ag43bReview = readJson("data/content-intelligence/quality-reviews/ag43b-topic-reference-image-integration.json");
const ag43bIntegration = readJson("data/content-intelligence/backend-architecture/ag43b-topic-reference-image-governance-integration.json");
const ag43bReadiness = readJson("data/content-intelligence/quality-registry/ag43b-quality-longform-readiness-record.json");
const ag43bBoundary = readJson("data/content-intelligence/mutation-plans/ag43b-to-ag43c-quality-longform-readiness-boundary.json");

const ag12cR1Apply = readJson("data/content-intelligence/apply-records/ag12c-r1-public-object-label-layout-repair.json");
const ag12cR1Audit = readJson("data/content-intelligence/audit-records/ag12c-r1-public-object-label-layout-repair-audit.json");
const ar01R1Apply = readJson("data/content-intelligence/apply-records/ar01-r1-credit-reference-surface-cleanup.json");
const ar01R1Audit = readJson("data/content-intelligence/audit-records/ar01-r1-credit-reference-surface-cleanup-audit.json");

const review = readJson("data/content-intelligence/quality-reviews/ag43c-article-quality-longform-readiness-integration.json");
const integration = readJson("data/content-intelligence/backend-architecture/ag43c-article-quality-longform-readiness-integration.json");
const consumptionMap = readJson("data/content-intelligence/backend-architecture/ag43c-existing-quality-module-consumption-map.json");
const longformStandard = readJson("data/content-intelligence/quality-rules/ag43c-longform-featured-read-standard.json");
const publicDeltaRulebook = readJson("data/content-intelligence/quality-rules/ag43c-public-readiness-delta-rulebook.json");
const objectModel = readJson("data/content-intelligence/backend-architecture/ag43c-object-placement-credit-reference-readiness-model.json");
const noDuplicateAudit = readJson("data/content-intelligence/backend-architecture/ag43c-no-duplicate-quality-audit-register.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/ag43c-no-mutation-audit-register.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag43c-article-quality-longform-readiness-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag43c-quality-readiness-audit-boundary-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag43c-to-ag43d-quality-readiness-audit-boundary.json");
const preview = readJson("data/quality/ag43c-article-quality-longform-readiness-integration-preview.json");
const pkg = readJson("package.json");

const articleQualityPreflight = read("scripts/article-quality-review-preflight.js");
const ag06bValidator = read("scripts/validate-ag06b-content-intelligence-schema.mjs");

if (ag43bReview.summary?.ready_for_ag43c !== true) fail("AG43B ready_for_ag43c missing.");
if (ag43bIntegration.status !== "topic_reference_image_integration_created_ready_for_ag43c_quality_longform_readiness") fail("AG43B integration status mismatch.");
if (ag43bReadiness.ready_for_ag43c !== true) fail("AG43B readiness mismatch.");
if (ag43bBoundary.next_stage_id !== "AG43C") fail("AG43B boundary must point to AG43C.");

if (ag12cR1Apply.status !== "public_object_label_layout_repair_applied") fail("AG12C-R1 apply status mismatch.");
if (ag12cR1Audit.status !== "public_object_label_layout_repair_audit_passed") fail("AG12C-R1 audit status mismatch.");
if (ar01R1Apply.status !== "credit_reference_surface_cleanup_applied") fail("AR01-R1 apply status mismatch.");
if (ar01R1Apply.post_repair_hash !== articleHash) fail("Current article hash must match AR01-R1 post repair hash.");
if (ar01R1Audit.status !== "credit_reference_surface_cleanup_audit_passed") fail("AR01-R1 audit status mismatch.");

for (const signal of ["source_reference_status", "image_approval_status", "quality_score"]) {
  if (!articleQualityPreflight.includes(signal)) fail(`Existing article quality preflight signal missing: ${signal}`);
}

for (const signal of ["reference", "visual"]) {
  if (!ag06bValidator.includes(signal)) fail(`AG06B governance signal missing: ${signal}`);
}

for (const phrase of [
  "Additional pilot object:",
  'data-drishvara-layout-treatment="collapsed-pilot-annex"',
  "Final image-source attribution",
  "Image credit / attribution:"
]) {
  if (articleHtml.includes(phrase)) fail(`Bad public-readiness phrase remains: ${phrase}`);
}

for (const phrase of [
  'data-drishvara-layout-treatment="reader-facing-object"',
  "Drishvara editorial synthesis",
  "Chart: Drishvara editorial synthesis. Basis: deterministic article-text term count.",
  "Infographic: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation.",
  "Diagram: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation.",
  "Table: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation."
]) {
  if (!articleHtml.includes(phrase)) fail(`Required cleaned public-readiness phrase missing: ${phrase}`);
}

for (const marker of [
  "<!-- AG10K-GENERATED-IMAGE-INSERTION:START -->",
  "<!-- AG11B-CHART-BI-GRAPH-INSERTION:START -->",
  "<!-- AG11C-INFOGRAPHIC-INSERTION:START -->",
  "<!-- AG11D-FIGURE-DIAGRAM-INSERTION:START -->",
  "<!-- AG11E-TABLE-STRUCTURED-OBJECT-INSERTION:START -->",
  "<!-- AG11F-MAP-GEOGRAPHIC-OBJECT-INSERTION:START -->",
  "<!-- AG11G-ARTICLE-SUPPORT-COMPOSITE-OBJECT-INSERTION:START -->"
]) {
  if (count(articleHtml, marker) !== 1) fail(`Governed object marker missing or duplicated: ${marker}`);
}

if (review.status !== "article_quality_longform_readiness_integrated_ready_for_ag43d") fail("Review status mismatch.");
if (integration.status !== "article_quality_longform_readiness_integrated_ready_for_ag43d") fail("Integration status mismatch.");
if (integration.current_article_hash !== articleHash) fail("Integration article hash mismatch.");
if (integration.integration_result.duplicate_quality_module_created !== false) fail("Duplicate quality module flag must be false.");
if (integration.integration_result.ready_for_ag43d !== true) fail("AG43D readiness missing.");

if (consumptionMap.status !== "existing_quality_modules_consumed_no_duplication") fail("Consumption map status mismatch.");
if (!consumptionMap.consumed_existing_modules.every((item) => item.duplicated === false)) fail("Consumption map must not duplicate modules.");

if (longformStandard.status !== "longform_featured_read_standard_recorded") fail("Longform standard status mismatch.");
if (!Array.isArray(longformStandard.standard_rules) || longformStandard.standard_rules.length < 8) fail("Longform standard rules insufficient.");

if (publicDeltaRulebook.status !== "public_readiness_delta_rules_recorded") fail("Public delta rulebook status mismatch.");
if (publicDeltaRulebook.duplicate_module_created !== false) fail("Public delta rulebook must not create duplicate module.");

if (objectModel.status !== "object_placement_credit_reference_readiness_model_created") fail("Object model status mismatch.");
if (objectModel.readiness_result.object_inclusion_logic_preserved !== true) fail("Object inclusion logic must be preserved.");
if (objectModel.readiness_result.credit_reference_surface_public_ready_for_drishvara_created_visuals !== true) fail("Credit surface readiness missing.");

if (noDuplicateAudit.status !== "no_duplicate_quality_audit_passed") fail("No duplicate audit status mismatch.");
if (noDuplicateAudit.failed_checks.length !== 0) fail("No duplicate audit failed checks must be zero.");
for (const check of noDuplicateAudit.checks) {
  if (check.passed !== true) fail(`No duplicate audit check failed: ${check.check_id}`);
}

if (noMutationAudit.status !== "no_mutation_audit_passed_for_ag43c") fail("No mutation audit status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No mutation failed checks must be zero.");
for (const check of noMutationAudit.checks) {
  if (check.passed !== true) fail(`No mutation audit check failed: ${check.check_id}`);
}

if (blocker.status !== "no_hard_blockers_for_ag43d") fail("Blocker status mismatch.");
if (blocker.hard_blocker_count_for_ag43d !== 0) fail("Hard blocker count for AG43D must be zero.");
if (readiness.ready_for_ag43d !== true) fail("Readiness must permit AG43D.");
if (readiness.next_stage_id !== "AG43D") fail("Next stage must be AG43D.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain blocked.");
if (readiness.article_generation_allowed_next !== false) fail("Article generation must remain blocked.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain blocked.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain blocked.");
if (readiness.backend_activation_allowed_next !== false) fail("Backend activation must remain blocked.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG43D") fail("Boundary must point to AG43D.");
if (preview.ready_for_ag43d !== 1) fail("Preview AG43D readiness missing.");
if (preview.article_mutated !== 0) fail("Preview article mutation must be zero.");
if (preview.article_generated !== 0) fail("Preview article generation must be zero.");
if (preview.reference_fetch_executed !== 0) fail("Preview reference fetch must be zero.");
if (preview.image_generation_executed !== 0) fail("Preview image generation must be zero.");
if (preview.public_publishing_operation_performed !== 0) fail("Preview publishing must be zero.");
if (preview.database_write_performed !== 0) fail("Preview database write must be zero.");
if (preview.deployment_performed !== 0) fail("Preview deployment must be zero.");
if (preview.backend_auth_supabase_activation_performed !== 0) fail("Preview backend activation must be zero.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be zero.");

if (!pkg.scripts?.["generate:ag43c"]) fail("Missing package script: generate:ag43c");
if (!pkg.scripts?.["validate:ag43c"]) fail("Missing package script: validate:ag43c");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag43c")) fail("validate:project must include validate:ag43c.");

pass("AG43C Article Quality and Long-form Readiness Integration is present.");
pass("AG43B, AG12C-R1, AR01-R1, article-quality preflight and AG06B are consumed.");
pass("Existing quality/object/credit modules are consumed without duplication.");
pass("Public-readiness delta rules and Version 01 long-form standard are valid.");
pass("Object inclusion logic and cleaned credit/reference surface are preserved.");
pass("No-mutation and no-duplicate audits are valid.");
pass("AG43D Quality Readiness Audit and Template-Hardening Boundary readiness is valid.");
pass("No article generation, article mutation, reference fetch, image generation, publishing, deployment, database write, backend activation or service-role key exposure is recorded.");
