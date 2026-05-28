import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const required = [
  "articles/policy/enhancing-public-healthcare-delivery-digital-innovation.html",
  "data/content-intelligence/apply-records/ag12c-controlled-layout-refinement-apply.json",
  "data/content-intelligence/quality-reviews/ag12c-r1-public-object-label-layout-repair.json",
  "data/content-intelligence/apply-records/ag12c-r1-public-object-label-layout-repair.json",
  "data/content-intelligence/object-registry/ag12c-r1-public-object-layout-treatment-record.json",
  "data/content-intelligence/audit-records/ag12c-r1-public-object-label-layout-repair-audit.json",
  "data/content-intelligence/quality-registry/ag12c-r1-public-object-label-layout-repair-readiness-record.json",
  "data/quality/ag12c-r1-public-object-label-layout-repair.json",
  "data/quality/ag12c-r1-public-object-label-layout-repair-preview.json",
  "docs/quality/AG12C_R1_PUBLIC_OBJECT_LABEL_LAYOUT_REPAIR.md",
  "scripts/apply-ag12c-r1-public-object-label-layout-repair.mjs",
  "scripts/validate-ag12c-r1-public-object-label-layout-repair.mjs",
  "package.json"
];

function full(p) {
  return path.join(root, p);
}

function fail(message) {
  console.error(`❌ AG12C-R1 validation failed: ${message}`);
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
const apply = readJson("data/content-intelligence/apply-records/ag12c-r1-public-object-label-layout-repair.json");
const treatment = readJson("data/content-intelligence/object-registry/ag12c-r1-public-object-layout-treatment-record.json");
const audit = readJson("data/content-intelligence/audit-records/ag12c-r1-public-object-label-layout-repair-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag12c-r1-public-object-label-layout-repair-readiness-record.json");
const preview = readJson("data/quality/ag12c-r1-public-object-label-layout-repair-preview.json");
const pkg = readJson("package.json");

if (apply.status !== "public_object_label_layout_repair_applied") fail("Apply status mismatch.");
if (treatment.status !== "reader_facing_object_layout_treatment_recorded") fail("Treatment status mismatch.");
if (audit.status !== "public_object_label_layout_repair_audit_passed") fail("Audit status mismatch.");
if (readiness.status !== "ready_for_ar01_credit_reference_surface_cleanup") fail("Readiness status mismatch.");

if (sha256(html) !== apply.post_repair_hash) fail("Current article hash must match AG12C-R1 post repair hash.");
if (html.includes("Additional pilot object:")) fail("Internal Additional pilot object label still present.");
if (html.includes('data-drishvara-layout-treatment="collapsed-pilot-annex"')) fail("Collapsed pilot annex treatment still present.");
if (html.includes("ag12c-collapsed-pilot-object")) fail("Collapsed pilot object class still present.");

if (count(html, 'data-drishvara-layout-treatment="reader-facing-object"') !== 3) fail("Exactly three reader-facing object blocks expected.");
for (const title of ["Service-flow view", "Digital feedback loop", "Schematic geographic-access view"]) {
  if (!html.includes(title)) fail(`Reader-facing object title missing: ${title}`);
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
  if (count(html, marker) !== 1) fail(`Governed marker missing or duplicated: ${marker}`);
}

if (apply.object_generation_performed !== false) fail("Object generation must remain false.");
if (apply.new_object_inserted !== false) fail("New object insertion must remain false.");
if (apply.existing_object_removed !== false) fail("Object removal must remain false.");
if (apply.public_publishing_operation_performed !== false) fail("Public publishing must remain false.");
if (apply.database_write_performed !== false) fail("Database write must remain false.");
if (apply.backend_auth_supabase_activation_performed !== false) fail("Backend/Auth/Supabase activation must remain false.");
if (apply.service_role_key_exposed !== false) fail("Service-role key exposure must remain false.");

if (audit.failed_checks.length !== 0) fail("Audit failed checks must be zero.");
for (const check of audit.checks) {
  if (check.passed !== true) fail(`Audit check failed: ${check.check_id}`);
}

if (preview.internal_pilot_labels_removed !== 1) fail("Preview internal label removal missing.");
if (preview.original_governed_object_markers_preserved !== 1) fail("Preview marker preservation missing.");

if (!pkg.scripts?.["apply:ag12c-r1"]) fail("Missing package script: apply:ag12c-r1");
if (!pkg.scripts?.["validate:ag12c-r1"]) fail("Missing package script: validate:ag12c-r1");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag12c-r1")) fail("validate:project must include validate:ag12c-r1.");

pass("AG12C-R1 public object label/layout repair is present.");
pass("Internal pilot labels and collapsed pilot annex treatment are removed.");
pass("Three reader-facing object blocks are present.");
pass("All governed AG10K and AG11B–AG11G object markers are preserved once.");
pass("No object generation, object removal, public publish, database write, backend activation or service-role exposure is recorded.");
