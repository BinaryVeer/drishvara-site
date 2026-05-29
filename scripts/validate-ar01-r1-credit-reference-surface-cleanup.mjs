import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const required = [
  "articles/policy/enhancing-public-healthcare-delivery-digital-innovation.html",
  "data/content-intelligence/quality-reviews/ar01-r1-credit-reference-surface-cleanup.json",
  "data/content-intelligence/apply-records/ar01-r1-credit-reference-surface-cleanup.json",
  "data/content-intelligence/credit-reference/ar01-r1-drishvara-editorial-synthesis-credit-policy.json",
  "data/content-intelligence/audit-records/ar01-r1-credit-reference-surface-cleanup-audit.json",
  "data/content-intelligence/quality-registry/ar01-r1-credit-reference-surface-cleanup-readiness-record.json",
  "data/quality/ar01-r1-credit-reference-surface-cleanup.json",
  "data/quality/ar01-r1-credit-reference-surface-cleanup-preview.json",
  "docs/quality/AR01_R1_CREDIT_REFERENCE_SURFACE_CLEANUP.md",
  "scripts/apply-ar01-r1-credit-reference-surface-cleanup.mjs",
  "scripts/validate-ar01-r1-credit-reference-surface-cleanup.mjs",
  "package.json"
];

function full(p) {
  return path.join(root, p);
}

function fail(message) {
  console.error(`❌ AR01-R1 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(full(p), "utf8"));
}

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function count(text, needle) {
  return text.split(needle).length - 1;
}

for (const file of required) {
  if (!fs.existsSync(full(file))) fail(`Missing file: ${file}`);
}

const articlePath = "articles/policy/enhancing-public-healthcare-delivery-digital-innovation.html";
const html = fs.readFileSync(full(articlePath), "utf8");
const apply = readJson("data/content-intelligence/apply-records/ar01-r1-credit-reference-surface-cleanup.json");
const policy = readJson("data/content-intelligence/credit-reference/ar01-r1-drishvara-editorial-synthesis-credit-policy.json");
const audit = readJson("data/content-intelligence/audit-records/ar01-r1-credit-reference-surface-cleanup-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ar01-r1-credit-reference-surface-cleanup-readiness-record.json");
const preview = readJson("data/quality/ar01-r1-credit-reference-surface-cleanup-preview.json");
const pkg = readJson("package.json");

if (apply.status !== "credit_reference_surface_cleanup_applied") fail("Apply status mismatch.");
if (policy.status !== "drishvara_editorial_synthesis_credit_policy_recorded") fail("Policy status mismatch.");
if (audit.status !== "credit_reference_surface_cleanup_audit_passed") fail("Audit status mismatch.");
if (readiness.status !== "ready_for_ag43c_quality_longform_readiness_integration") fail("Readiness status mismatch.");

if (sha256(html) !== apply.post_repair_hash) fail("Current article hash must match AR01-R1 post-repair hash.");

for (const phrase of [
  "Final image-source attribution",
  "Image credit / attribution:",
  "Visual: Drishvara.</small>",
  "Chart: Drishvara. Source:"
]) {
  if (html.includes(phrase)) fail(`Removed public credit phrase still present: ${phrase}`);
}

for (const phrase of [
  "Visual: Drishvara editorial synthesis.",
  "Chart: Drishvara editorial synthesis. Basis: deterministic article-text term count.",
  "Infographic: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation.",
  "Diagram: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation.",
  "Table: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation."
]) {
  if (!html.includes(phrase)) fail(`Expected normalized credit phrase missing: ${phrase}`);
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
  if (count(html, marker) !== 1) fail(`Governed object marker missing or duplicated: ${marker}`);
}

if (apply.reference_fetch_performed !== false) fail("Reference fetch must be false.");
if (apply.image_generation_performed !== false) fail("Image generation must be false.");
if (apply.existing_object_removed !== false) fail("Object removal must be false.");
if (apply.public_publishing_operation_performed !== false) fail("Publishing must be false.");
if (apply.database_write_performed !== false) fail("Database write must be false.");
if (apply.deployment_performed !== false) fail("Deployment must be false.");
if (apply.backend_auth_supabase_activation_performed !== false) fail("Backend/Auth/Supabase activation must be false.");
if (apply.service_role_key_exposed !== false) fail("Service-role exposure must be false.");

if (audit.failed_checks.length !== 0) fail("Audit failed checks must be zero.");
for (const check of audit.checks) {
  if (check.passed !== true) fail(`Audit check failed: ${check.check_id}`);
}

if (readiness.ready_for_ag43c !== true) fail("AG43C readiness missing.");
if (preview.bad_credit_phrases_removed !== 1) fail("Preview bad phrase removal missing.");

if (!pkg.scripts?.["apply:ar01-r1"]) fail("Missing package script: apply:ar01-r1");
if (!pkg.scripts?.["validate:ar01-r1"]) fail("Missing package script: validate:ar01-r1");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ar01-r1")) fail("validate:project must include validate:ar01-r1.");

pass("AR01-R1 credit/reference surface cleanup is present.");
pass("Drishvara-created visual/object credit phrases are normalized.");
pass("Unnecessary image-source attribution-under-verification wording is removed where Drishvara-created visuals are used.");
pass("All governed object markers are preserved once.");
pass("No reference fetch, image generation, object removal, publishing, deployment, database write, backend activation or service-role exposure is recorded.");
pass("AG43C quality and long-form readiness integration can consume this correction without duplicating AR01.");
