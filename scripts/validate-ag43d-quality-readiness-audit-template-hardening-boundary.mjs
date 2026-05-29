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
  console.error(`❌ AG43D validation failed: ${message}`);
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

  "data/content-intelligence/apply-records/ag12c-r1-public-object-label-layout-repair.json",
  "data/content-intelligence/apply-records/ar01-r1-credit-reference-surface-cleanup.json",

  "data/content-intelligence/quality-reviews/ag43d-quality-readiness-audit-template-hardening-boundary.json",
  "data/content-intelligence/backend-architecture/ag43d-quality-readiness-audit-report.json",
  "data/content-intelligence/backend-architecture/ag43d-template-rendering-hardening-boundary.json",
  "data/content-intelligence/backend-architecture/ag43d-print-pdf-export-hardening-boundary.json",
  "data/content-intelligence/backend-architecture/ag43d-reference-consolidation-boundary.json",
  "data/content-intelligence/quality-registry/ag43d-carry-forward-template-export-reference-register.json",
  "data/content-intelligence/backend-architecture/ag43d-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag43d-quality-readiness-audit-blocker-register.json",
  "data/content-intelligence/quality-registry/ag43d-template-hardening-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag43d-to-ag43z-article-intelligence-quality-closure-boundary.json",
  "data/quality/ag43d-quality-readiness-audit-template-hardening-boundary.json",
  "data/quality/ag43d-quality-readiness-audit-template-hardening-boundary-preview.json",
  "docs/quality/AG43D_QUALITY_READINESS_AUDIT_TEMPLATE_HARDENING_BOUNDARY.md",
  "scripts/generate-ag43d-quality-readiness-audit-template-hardening-boundary.mjs",
  "scripts/validate-ag43d-quality-readiness-audit-template-hardening-boundary.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const articlePath = "articles/policy/enhancing-public-healthcare-delivery-digital-innovation.html";
const articleHtml = read(articlePath);
const articleHash = sha256(articleHtml);

const ag43cReview = readJson("data/content-intelligence/quality-reviews/ag43c-article-quality-longform-readiness-integration.json");
const ag43cIntegration = readJson("data/content-intelligence/backend-architecture/ag43c-article-quality-longform-readiness-integration.json");
const ag43cNoDuplicateAudit = readJson("data/content-intelligence/backend-architecture/ag43c-no-duplicate-quality-audit-register.json");
const ag43cNoMutationAudit = readJson("data/content-intelligence/backend-architecture/ag43c-no-mutation-audit-register.json");
const ag43cBlocker = readJson("data/content-intelligence/quality-registry/ag43c-article-quality-longform-readiness-blocker-register.json");
const ag43cReadiness = readJson("data/content-intelligence/quality-registry/ag43c-quality-readiness-audit-boundary-record.json");
const ag43cBoundary = readJson("data/content-intelligence/mutation-plans/ag43c-to-ag43d-quality-readiness-audit-boundary.json");

const ag12cR1Apply = readJson("data/content-intelligence/apply-records/ag12c-r1-public-object-label-layout-repair.json");
const ar01R1Apply = readJson("data/content-intelligence/apply-records/ar01-r1-credit-reference-surface-cleanup.json");

const review = readJson("data/content-intelligence/quality-reviews/ag43d-quality-readiness-audit-template-hardening-boundary.json");
const audit = readJson("data/content-intelligence/backend-architecture/ag43d-quality-readiness-audit-report.json");
const templateBoundary = readJson("data/content-intelligence/backend-architecture/ag43d-template-rendering-hardening-boundary.json");
const exportBoundary = readJson("data/content-intelligence/backend-architecture/ag43d-print-pdf-export-hardening-boundary.json");
const referenceBoundary = readJson("data/content-intelligence/backend-architecture/ag43d-reference-consolidation-boundary.json");
const carryForward = readJson("data/content-intelligence/quality-registry/ag43d-carry-forward-template-export-reference-register.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/ag43d-no-mutation-audit-register.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag43d-quality-readiness-audit-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag43d-template-hardening-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag43d-to-ag43z-article-intelligence-quality-closure-boundary.json");
const preview = readJson("data/quality/ag43d-quality-readiness-audit-template-hardening-boundary-preview.json");
const pkg = readJson("package.json");

if (ag43cReview.status !== "article_quality_longform_readiness_integrated_ready_for_ag43d") fail("AG43C review status mismatch.");
if (ag43cIntegration.current_article_hash !== articleHash) fail("AG43C integration hash must match current article.");
if (ag43cNoDuplicateAudit.status !== "no_duplicate_quality_audit_passed") fail("AG43C no-duplicate audit mismatch.");
if (ag43cNoMutationAudit.status !== "no_mutation_audit_passed_for_ag43c") fail("AG43C no-mutation audit mismatch.");
if (ag43cBlocker.hard_blocker_count_for_ag43d !== 0) fail("AG43C hard blocker count must be zero.");
if (ag43cReadiness.ready_for_ag43d !== true) fail("AG43C readiness must allow AG43D.");
if (ag43cBoundary.next_stage_id !== "AG43D") fail("AG43C boundary must point to AG43D.");

if (ag12cR1Apply.status !== "public_object_label_layout_repair_applied") fail("AG12C-R1 status mismatch.");
if (ar01R1Apply.status !== "credit_reference_surface_cleanup_applied") fail("AR01-R1 status mismatch.");
if (ar01R1Apply.post_repair_hash !== articleHash) fail("Current article hash must match AR01-R1 post repair hash.");

for (const phrase of [
  "Additional pilot object:",
  'data-drishvara-layout-treatment="collapsed-pilot-annex"',
  "Final image-source attribution",
  "Image credit / attribution:"
]) {
  if (articleHtml.includes(phrase)) fail(`Blocked public phrase remains: ${phrase}`);
}

for (const phrase of [
  'data-drishvara-layout-treatment="reader-facing-object"',
  "Drishvara editorial synthesis",
  "Chart: Drishvara editorial synthesis. Basis: deterministic article-text term count.",
  "Infographic: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation.",
  "Diagram: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation.",
  "Table: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation."
]) {
  if (!articleHtml.includes(phrase)) fail(`Expected cleaned public phrase missing: ${phrase}`);
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

if (review.status !== "quality_readiness_audit_passed_ready_for_ag43z") fail("Review status mismatch.");
if (review.current_article_hash !== articleHash) fail("Review article hash mismatch.");
if (review.summary.ready_for_ag43z !== true) fail("Review AG43Z readiness missing.");
if (review.summary.hard_blocker_count_for_ag43z !== 0) fail("Review hard blocker count must be zero.");

if (audit.status !== "quality_readiness_audit_passed_template_hardening_boundary_ready") fail("Audit status mismatch.");
if (audit.failed_checks.length !== 0) fail("Audit failed checks must be zero.");
for (const check of audit.checks) {
  if (check.passed !== true) fail(`Audit check failed: ${check.check_id}`);
}

if (templateBoundary.status !== "template_rendering_hardening_boundary_created") fail("Template boundary status mismatch.");
if (templateBoundary.article_mutation_allowed_next !== false) fail("Template boundary must block article mutation.");
if (templateBoundary.css_js_mutation_allowed_next !== false) fail("Template boundary must block CSS/JS mutation.");
if (templateBoundary.deployment_allowed_next !== false) fail("Template boundary must block deployment.");

if (exportBoundary.status !== "print_pdf_export_hardening_boundary_created") fail("Export boundary status mismatch.");
if (exportBoundary.mutation_now !== false) fail("Export boundary must be non-mutating.");

if (referenceBoundary.status !== "reference_consolidation_boundary_created") fail("Reference boundary status mismatch.");
if (referenceBoundary.reference_fetch_allowed_now !== false) fail("Reference fetch must remain blocked.");
if (referenceBoundary.external_link_verification_allowed_now !== false) fail("External link verification must remain blocked.");

if (carryForward.status !== "carry_forward_items_recorded_for_ag43z") fail("Carry-forward status mismatch.");
if (carryForward.hard_blocker_count_for_ag43z !== 0) fail("Carry-forward hard blocker count must be zero.");
if (!carryForward.items.some((item) => item.category === "template_rendering")) fail("Template rendering carry-forward missing.");
if (!carryForward.items.some((item) => item.category === "print_pdf_export")) fail("Print/PDF export carry-forward missing.");
if (!carryForward.items.some((item) => item.category === "reference_consolidation")) fail("Reference consolidation carry-forward missing.");

if (noMutationAudit.status !== "no_mutation_audit_passed_for_ag43d") fail("No-mutation audit status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");
for (const check of noMutationAudit.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (blocker.status !== "no_hard_blockers_for_ag43z") fail("Blocker status mismatch.");
if (blocker.hard_blocker_count_for_ag43z !== 0) fail("Blocker count must be zero.");

if (readiness.ready_for_ag43z !== true) fail("Readiness must permit AG43Z.");
if (readiness.next_stage_id !== "AG43Z") fail("Readiness next stage must be AG43Z.");
if (readiness.article_mutation_allowed_next !== false) fail("Article mutation must remain blocked.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain blocked.");
if (readiness.article_generation_allowed_next !== false) fail("Article generation must remain blocked.");
if (readiness.reference_fetch_allowed_next !== false) fail("Reference fetch must remain blocked.");
if (readiness.image_generation_allowed_next !== false) fail("Image generation must remain blocked.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain blocked.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain blocked.");
if (readiness.backend_activation_allowed_next !== false) fail("Backend activation must remain blocked.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG43Z") fail("Boundary must point to AG43Z.");
if (preview.ready_for_ag43z !== 1) fail("Preview AG43Z readiness missing.");
if (preview.article_mutated !== 0) fail("Preview article mutation must be zero.");
if (preview.template_mutated !== 0) fail("Preview template mutation must be zero.");
if (preview.css_js_mutated !== 0) fail("Preview CSS/JS mutation must be zero.");
if (preview.reference_fetch_executed !== 0) fail("Preview reference fetch must be zero.");
if (preview.image_generation_executed !== 0) fail("Preview image generation must be zero.");
if (preview.public_publishing_operation_performed !== 0) fail("Preview publishing must be zero.");
if (preview.database_write_performed !== 0) fail("Preview database write must be zero.");
if (preview.deployment_performed !== 0) fail("Preview deployment must be zero.");
if (preview.backend_auth_supabase_activation_performed !== 0) fail("Preview backend activation must be zero.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be zero.");

if (!pkg.scripts?.["generate:ag43d"]) fail("Missing package script: generate:ag43d");
if (!pkg.scripts?.["validate:ag43d"]) fail("Missing package script: validate:ag43d");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag43d")) fail("validate:project must include validate:ag43d.");

pass("AG43D Quality Readiness Audit and Template-Hardening Boundary is present.");
pass("AG43C, AG12C-R1 and AR01-R1 are consumed.");
pass("Quality readiness audit is valid with zero hard blockers.");
pass("Template/rendering, print/PDF export and reference consolidation boundaries are valid.");
pass("Carry-forward register for AG43Z/AG46/AG53/AG56 is valid.");
pass("No-mutation audit is valid.");
pass("AG43Z Article Intelligence and Quality Automation Closure readiness is valid.");
pass("No article/template/CSS/JS mutation, reference fetch, image generation, publishing, deployment, database write, backend activation or service-role key exposure is recorded.");
