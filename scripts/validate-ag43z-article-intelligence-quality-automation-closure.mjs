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
  console.error(`❌ AG43Z validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}


function reviewReadyForStage(record, currentStageId, nextStageId) {
  const raw = JSON.stringify(record || {}).toUpperCase();
  const status = String(record?.status || "").toUpperCase();

  const current = String(currentStageId || "").toUpperCase();
  const next = String(nextStageId || "").toUpperCase();

  return (
    raw.includes(current) &&
    raw.includes(next) &&
    (
      raw.includes(`READY_FOR_${next}`) ||
      raw.includes(`READY FOR ${next}`) ||
      raw.includes(`NEXT_STAGE_ID":"${next}`) ||
      raw.includes(`NEXT_STAGE_ID":"${next.toLowerCase()}`.toUpperCase()) ||
      status.includes(`READY_FOR_${next}`) ||
      status.includes("READY")
    )
  );
}

function count(text, needle) {
  return text.split(needle).length - 1;
}

const required = [
  "articles/policy/enhancing-public-healthcare-delivery-digital-innovation.html",

  "data/content-intelligence/quality-reviews/ag43a-article-intelligence-integration-entry.json",
  "data/content-intelligence/quality-reviews/ag43b-topic-reference-image-integration.json",
  "data/content-intelligence/quality-reviews/ag43c-article-quality-longform-readiness-integration.json",
  "data/content-intelligence/quality-reviews/ag43d-quality-readiness-audit-template-hardening-boundary.json",

  "data/content-intelligence/mutation-plans/ag43d-to-ag43z-article-intelligence-quality-closure-boundary.json",
  "data/content-intelligence/quality-registry/ag43d-carry-forward-template-export-reference-register.json",
  "data/content-intelligence/quality-registry/ag43d-template-hardening-readiness-record.json",

  "data/content-intelligence/apply-records/ag12c-r1-public-object-label-layout-repair.json",
  "data/content-intelligence/apply-records/ar01-r1-credit-reference-surface-cleanup.json",

  "data/content-intelligence/quality-reviews/ag43z-article-intelligence-quality-automation-closure.json",
  "data/content-intelligence/closure-records/ag43z-article-intelligence-quality-automation-closure.json",
  "data/content-intelligence/backend-architecture/ag43z-ag43-chain-integration-audit.json",
  "data/content-intelligence/quality-registry/ag43z-carry-forward-register.json",
  "data/content-intelligence/backend-architecture/ag43z-no-mutation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag43z-no-duplicate-closure-audit-register.json",
  "data/content-intelligence/quality-registry/ag43z-ag44-episodic-engine-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag43z-to-ag44-episodic-knowledge-engine-boundary.json",
  "data/quality/ag43z-article-intelligence-quality-automation-closure.json",
  "data/quality/ag43z-article-intelligence-quality-automation-closure-preview.json",
  "docs/quality/AG43Z_ARTICLE_INTELLIGENCE_QUALITY_AUTOMATION_CLOSURE.md",
  "scripts/generate-ag43z-article-intelligence-quality-automation-closure.mjs",
  "scripts/validate-ag43z-article-intelligence-quality-automation-closure.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const articlePath = "articles/policy/enhancing-public-healthcare-delivery-digital-innovation.html";
const articleHtml = read(articlePath);
const articleHash = sha256(articleHtml);

const ag43aReview = readJson("data/content-intelligence/quality-reviews/ag43a-article-intelligence-integration-entry.json");
const ag43bReview = readJson("data/content-intelligence/quality-reviews/ag43b-topic-reference-image-integration.json");
const ag43cReview = readJson("data/content-intelligence/quality-reviews/ag43c-article-quality-longform-readiness-integration.json");
const ag43dReview = readJson("data/content-intelligence/quality-reviews/ag43d-quality-readiness-audit-template-hardening-boundary.json");
const ag43dBoundary = readJson("data/content-intelligence/mutation-plans/ag43d-to-ag43z-article-intelligence-quality-closure-boundary.json");
const ag43dCarryForward = readJson("data/content-intelligence/quality-registry/ag43d-carry-forward-template-export-reference-register.json");
const ag43dReadiness = readJson("data/content-intelligence/quality-registry/ag43d-template-hardening-readiness-record.json");
const ag12cR1Apply = readJson("data/content-intelligence/apply-records/ag12c-r1-public-object-label-layout-repair.json");
const ar01R1Apply = readJson("data/content-intelligence/apply-records/ar01-r1-credit-reference-surface-cleanup.json");

const review = readJson("data/content-intelligence/quality-reviews/ag43z-article-intelligence-quality-automation-closure.json");
const closure = readJson("data/content-intelligence/closure-records/ag43z-article-intelligence-quality-automation-closure.json");
const integrationAudit = readJson("data/content-intelligence/backend-architecture/ag43z-ag43-chain-integration-audit.json");
const carryForward = readJson("data/content-intelligence/quality-registry/ag43z-carry-forward-register.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/ag43z-no-mutation-audit-register.json");
const noDuplicateAudit = readJson("data/content-intelligence/backend-architecture/ag43z-no-duplicate-closure-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag43z-ag44-episodic-engine-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag43z-to-ag44-episodic-knowledge-engine-boundary.json");
const preview = readJson("data/quality/ag43z-article-intelligence-quality-automation-closure-preview.json");
const pkg = readJson("package.json");

if (!reviewReadyForStage(ag43aReview, "AG43A", "AG43B")) fail("AG43A review does not show readiness for AG43B.");
if (!reviewReadyForStage(ag43bReview, "AG43B", "AG43C")) fail("AG43B review does not show readiness for AG43C.");
if (!reviewReadyForStage(ag43cReview, "AG43C", "AG43D")) fail("AG43C review does not show readiness for AG43D.");
if (!reviewReadyForStage(ag43dReview, "AG43D", "AG43Z")) fail("AG43D review must show readiness for AG43Z.");
if (ag43dBoundary.next_stage_id !== "AG43Z") fail("AG43D boundary must point to AG43Z.");
if (ag43dReadiness.ready_for_ag43z !== true) fail("AG43D readiness for AG43Z missing.");
if (ag43dCarryForward.hard_blocker_count_for_ag43z !== 0) fail("AG43D hard blocker count for AG43Z must be zero.");
if (ag12cR1Apply.status !== "public_object_label_layout_repair_applied") fail("AG12C-R1 status mismatch.");
if (ar01R1Apply.status !== "credit_reference_surface_cleanup_applied") fail("AR01-R1 status mismatch.");
if (ar01R1Apply.post_repair_hash !== articleHash) fail("Current article hash must match AR01-R1 post repair hash.");

const ag43dCombined = [
  JSON.stringify(ag43dReview),
  JSON.stringify(ag43dBoundary),
  JSON.stringify(ag43dCarryForward),
  JSON.stringify(ag43dReadiness)
].join("\n");

for (const phrase of [
  "AG43E",
  "ag43e",
  "ready_for_ag43e",
  "hard_blocker_count_for_ag43e",
  "ag43d-to-ag43e-template-hardening-planning-boundary"
]) {
  if (ag43dCombined.includes(phrase)) fail(`AG43E reference remains in AG43D corrected artifacts: ${phrase}`);
}

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
  if (!articleHtml.includes(phrase)) fail(`Expected corrected article phrase missing: ${phrase}`);
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

if (closure.status !== "ag43_article_intelligence_quality_automation_closed_ready_for_ag44") fail("Closure status mismatch.");
if (closure.next_stage_id !== "AG44") fail("Closure must point to AG44.");
if (closure.no_extra_stage_created !== true) fail("Closure must confirm no extra stage created.");
if (closure.current_article_hash !== articleHash) fail("Closure article hash mismatch.");

if (review.status !== closure.status) fail("Review status must match closure status.");
if (review.summary.ag43z_closure_completed !== true) fail("Review AG43Z completion missing.");
if (review.summary.ag43a_closed !== true) fail("AG43A closure flag missing.");
if (review.summary.ag43b_closed !== true) fail("AG43B closure flag missing.");
if (review.summary.ag43c_closed !== true) fail("AG43C closure flag missing.");
if (review.summary.ag43d_closed !== true) fail("AG43D closure flag missing.");
if (review.summary.ag43e_created_or_required !== false) fail("AG43E must not be created or required.");
if (review.summary.ready_for_ag44 !== true) fail("AG44 readiness missing.");
if (review.summary.hard_blocker_count_for_ag44 !== 0) fail("Hard blocker count for AG44 must be zero.");

if (integrationAudit.status !== "ag43_chain_integrated_and_closed") fail("Integration audit status mismatch.");
if (!integrationAudit.closed_chain.join(">").includes("AG43A>AG43B>AG43C>AG43D")) fail("Closed chain mismatch.");
if (!integrationAudit.intentionally_not_created.includes("AG43E")) fail("AG43E not-created record missing.");
if (integrationAudit.failed_checks.length !== 0) fail("Integration audit failed checks must be zero.");
for (const check of integrationAudit.checks) {
  if (check.passed !== true) fail(`Integration audit check failed: ${check.check_id}`);
}

if (carryForward.status !== "carry_forward_items_recorded_for_later_approved_stages") fail("Carry-forward status mismatch.");
if (carryForward.prohibited_next_stage !== "AG43E") fail("Carry-forward must prohibit AG43E.");
if (carryForward.hard_blocker_count_for_ag44 !== 0) fail("AG44 hard blocker count must be zero.");
const carryTargets = JSON.stringify(carryForward.carried_forward_to_later_approved_stages);
for (const target of ["AG46", "AG53", "AG56"]) {
  if (!carryTargets.includes(target)) fail(`Carry-forward target missing: ${target}`);
}

if (noMutationAudit.status !== "no_mutation_audit_passed_for_ag43z") fail("No-mutation audit status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");
for (const check of noMutationAudit.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (noDuplicateAudit.status !== "no_duplicate_closure_audit_passed_for_ag43z") fail("No-duplicate audit status mismatch.");
if (noDuplicateAudit.failed_checks.length !== 0) fail("No-duplicate failed checks must be zero.");
for (const check of noDuplicateAudit.checks) {
  if (check.passed !== true) fail(`No-duplicate check failed: ${check.check_id}`);
}

if (readiness.ready_for_ag44 !== true) fail("Readiness must permit AG44.");
if (readiness.next_stage_id !== "AG44") fail("Readiness next stage must be AG44.");
if (readiness.ag43e_created_or_required !== false) fail("Readiness must not require AG43E.");
if (readiness.article_mutation_allowed_next !== false) fail("Article mutation must remain blocked.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain blocked.");
if (readiness.article_generation_allowed_next !== false) fail("Article generation must remain blocked.");
if (readiness.reference_fetch_allowed_next !== false) fail("Reference fetch must remain blocked.");
if (readiness.image_generation_allowed_next !== false) fail("Image generation must remain blocked.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain blocked.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain blocked.");
if (readiness.backend_activation_allowed_next !== false) fail("Backend activation must remain blocked.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG44") fail("Boundary must point to AG44.");
if (boundary.blocked_scope.includes("AG43E creation") !== true) fail("Boundary must block AG43E creation.");

if (preview.ag43z_closure_completed !== 1) fail("Preview closure flag missing.");
if (preview.ag43e_created_or_required !== 0) fail("Preview AG43E flag must be zero.");
if (preview.ready_for_ag44 !== 1) fail("Preview AG44 readiness missing.");
if (preview.article_mutated !== 0) fail("Preview article mutation must be zero.");
if (preview.article_generated !== 0) fail("Preview article generation must be zero.");
if (preview.template_mutated !== 0) fail("Preview template mutation must be zero.");
if (preview.css_js_mutated !== 0) fail("Preview CSS/JS mutation must be zero.");
if (preview.reference_fetch_executed !== 0) fail("Preview reference fetch must be zero.");
if (preview.image_generation_executed !== 0) fail("Preview image generation must be zero.");
if (preview.public_publishing_operation_performed !== 0) fail("Preview publishing must be zero.");
if (preview.database_write_performed !== 0) fail("Preview database write must be zero.");
if (preview.deployment_performed !== 0) fail("Preview deployment must be zero.");
if (preview.backend_auth_supabase_activation_performed !== 0) fail("Preview backend activation must be zero.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be zero.");

if (!pkg.scripts?.["generate:ag43z"]) fail("Missing package script: generate:ag43z");
if (!pkg.scripts?.["validate:ag43z"]) fail("Missing package script: validate:ag43z");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag43z")) fail("validate:project must include validate:ag43z.");

pass("AG43Z Article Intelligence and Quality Automation Closure is present.");
pass("AG43A → AG43B → AG43C → AG43D chain is closed.");
pass("AG43E is not created or required.");
pass("AG43D corrected boundary to AG43Z is preserved.");
pass("Carry-forward to AG46 / AG53 / AG56 is recorded.");
pass("No-duplicate and no-mutation closure audits are valid.");
pass("AG44 Episodic Knowledge Engine Activation readiness is valid.");
pass("No mutation, publish, deployment, database/backend/Supabase/Auth activation or service-role exposure is recorded.");
