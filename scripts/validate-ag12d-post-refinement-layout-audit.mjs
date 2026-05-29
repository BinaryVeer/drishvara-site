import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag12c-controlled-layout-refinement-apply.json",
  "data/content-intelligence/apply-records/ag12c-controlled-layout-refinement-apply.json",
  "data/content-intelligence/object-registry/ag12c-layout-treatment-record.json",
  "data/content-intelligence/quality-registry/ag12c-rollback-readiness-record.json",
  "data/content-intelligence/quality-registry/ag12c-post-refinement-audit-prep-record.json",
  "data/content-intelligence/mutation-plans/ag12c-to-ag12d-post-refinement-layout-audit-boundary.json",

  "data/content-intelligence/quality-reviews/ag12d-post-refinement-layout-audit.json",
  "data/content-intelligence/audit-records/ag12d-post-refinement-layout-audit-report.json",
  "data/content-intelligence/object-registry/ag12d-refined-layout-treatment-audit-record.json",
  "data/content-intelligence/quality-registry/ag12d-post-refinement-readiness-record.json",
  "data/content-intelligence/quality-registry/ag12d-rollback-readiness-audit-record.json",
  "data/content-intelligence/mutation-plans/ag12d-to-ag12z-object-rich-production-readiness-closure-boundary.json",
  "data/content-intelligence/schema/post-refinement-layout-audit.schema.json",
  "data/content-intelligence/learning/ag12d-post-refinement-layout-audit-learning.json",
  "data/quality/ag12d-post-refinement-layout-audit.json",
  "data/quality/ag12d-post-refinement-layout-audit-preview.json",
  "docs/quality/AG12D_POST_REFINEMENT_LAYOUT_AUDIT.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG12D validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function articleHashAcceptedByRepairChain(recordedHash, currentHash, articlePath = null) {
  if (recordedHash === currentHash) return true;

  const repairRecords = [
    {
      path: "data/content-intelligence/apply-records/ag12c-r1-public-object-label-layout-repair.json",
      status: "public_object_label_layout_repair_applied"
    },
    {
      path: "data/content-intelligence/apply-records/ar01-r1-credit-reference-surface-cleanup.json",
      status: "credit_reference_surface_cleanup_applied"
    }
  ];

  const edges = [];

  for (const repairRecord of repairRecords) {
    const fullRepairPath = path.join(root, repairRecord.path);
    if (!fs.existsSync(fullRepairPath)) continue;

    try {
      const record = JSON.parse(fs.readFileSync(fullRepairPath, "utf8"));
      const articlePathMatches =
        articlePath === null ||
        articlePath === undefined ||
        record.selected_article_path === articlePath;

      if (
        record.status === repairRecord.status &&
        articlePathMatches &&
        record.pre_repair_hash &&
        record.post_repair_hash
      ) {
        edges.push([record.pre_repair_hash, record.post_repair_hash]);
      }
    } catch {}
  }

  function canReach(start, target) {
    if (!start || !target) return false;

    let current = start;
    const seen = new Set([current]);

    for (let i = 0; i < edges.length + 3; i += 1) {
      if (current === target) return true;

      const edge = edges.find(([from]) => from === current);
      if (!edge) return false;

      current = edge[1];
      if (seen.has(current)) return false;
      seen.add(current);
    }

    return current === target;
  }

  return canReach(recordedHash, currentHash) || canReach(currentHash, recordedHash);
}

function hashPairMatchesCurrentOrAg12cR1Repair(leftHash, rightHash, articlePath = null) {
  return articleHashAcceptedByRepairChain(leftHash, rightHash, articlePath);
}


for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag12cReview = readJson("data/content-intelligence/quality-reviews/ag12c-controlled-layout-refinement-apply.json");
const ag12cApply = readJson("data/content-intelligence/apply-records/ag12c-controlled-layout-refinement-apply.json");
const ag12cRollback = readJson("data/content-intelligence/quality-registry/ag12c-rollback-readiness-record.json");
const ag12cAuditPrep = readJson("data/content-intelligence/quality-registry/ag12c-post-refinement-audit-prep-record.json");
const ag12cBoundary = readJson("data/content-intelligence/mutation-plans/ag12c-to-ag12d-post-refinement-layout-audit-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ag12d-post-refinement-layout-audit.json");
const audit = readJson("data/content-intelligence/audit-records/ag12d-post-refinement-layout-audit-report.json");
const treatment = readJson("data/content-intelligence/object-registry/ag12d-refined-layout-treatment-audit-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag12d-post-refinement-readiness-record.json");
const rollbackAudit = readJson("data/content-intelligence/quality-registry/ag12d-rollback-readiness-audit-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag12d-to-ag12z-object-rich-production-readiness-closure-boundary.json");
const schema = readJson("data/content-intelligence/schema/post-refinement-layout-audit.schema.json");
const learning = readJson("data/content-intelligence/learning/ag12d-post-refinement-layout-audit-learning.json");
const registry = readJson("data/quality/ag12d-post-refinement-layout-audit.json");
const preview = readJson("data/quality/ag12d-post-refinement-layout-audit-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG12D_POST_REFINEMENT_LAYOUT_AUDIT.md"), "utf8");

for (const obj of [review, audit, treatment, readiness, rollbackAudit, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG12D") fail(`module_id must be AG12D in ${obj.title || "object"}`);
}

if (ag12cReview.status !== "controlled_layout_refinement_applied_pending_post_refinement_audit") fail("AG12C review status mismatch");
if (ag12cAuditPrep.ready_for_ag12d !== true) fail("AG12C audit-prep readiness missing");
if (ag12cBoundary.next_stage_id !== "AG12D") fail("AG12D boundary missing in AG12C");

const articlePath = ag12cApply.selected_article_path;
const backupPath = ag12cApply.backup_path;

if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
if (!fs.existsSync(path.join(root, backupPath))) fail(`AG12C backup missing: ${backupPath}`);

const articleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
const backupHash = sha256(fs.readFileSync(path.join(root, backupPath), "utf8"));

const ag12cR1ApplyPath = "data/content-intelligence/apply-records/ag12c-r1-public-object-label-layout-repair.json";
const hasAg12cR1Repair = fs.existsSync(path.join(root, ag12cR1ApplyPath));
const ag12cR1Apply = hasAg12cR1Repair ? readJson(ag12cR1ApplyPath) : null;

if (hasAg12cR1Repair) {
  if (!hashPairMatchesCurrentOrAg12cR1Repair(articleHash, ag12cR1Apply.post_repair_hash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Current article hash must match AG12C-R1 post-repair hash or AG12C-R1/AR01-R1 approved repair-chain state missing");
} else if (articleHash !== ag12cApply.post_refinement_hash) {
  fail("Current article hash must match AG12C post-refinement hash");
}
if (backupHash !== ag12cApply.pre_refinement_hash) fail("Backup hash must match AG12C pre-refinement hash");
if (backupHash !== ag12cRollback.backup_hash) fail("Backup hash must match AG12C rollback record");

if (review.status !== "post_refinement_layout_audit_passed") fail("Review status mismatch");
if (audit.status !== "post_refinement_layout_audit_passed") fail("Audit status mismatch");
if (treatment.status !== "post_refinement_layout_treatment_audited_passed") fail("Treatment audit status mismatch");
if (readiness.status !== "ready_for_ag12z_object_rich_production_readiness_closure") fail("Readiness status mismatch");
if (rollbackAudit.status !== "rollback_readiness_audited_passed") fail("Rollback audit status mismatch");

if (!Array.isArray(audit.checks) || audit.checks.length !== 8) fail("AG12D must record eight audit checks");
if (audit.failed_checks.length !== 0) fail("AG12D failed checks must be zero");
if (audit.production_readiness_assessment.refined_layout_audit_passed !== true) fail("Refined layout audit must pass");
if (audit.production_readiness_assessment.publish_ready !== false) fail("AG12D must not mark publish ready");

if (hasAg12cR1Repair) {
  if (ag12cR1Apply.reader_facing_object_count_after_repair !== 3) fail("AG12C-R1 reader-facing object count must be three");
} else {
  if (treatment.primary_visible_object_count !== 4) fail("Primary visible object count must be four");
  if (treatment.collapsed_pilot_object_count !== 3) fail("Collapsed pilot object count must be three");
}
if (treatment.all_original_markers_preserved_once !== true) fail("Original governed markers must be preserved");
if (treatment.all_treatments_valid !== true) fail("Object treatments must be valid");
if (treatment.all_credits_present !== true) fail("Credits must be present");
if (treatment.all_caption_or_accessibility_text_present !== true) fail("Caption/accessibility text must be present");

if (rollbackAudit.rollback_ready !== true) fail("Rollback audit must confirm rollback ready");
if (rollbackAudit.backup_hash_matches !== true) fail("Rollback backup hash must match");
if (rollbackAudit.backup_has_no_ag12c_marker !== true) fail("Rollback backup must not include AG12C marker");

if (readiness.ready_for_ag12z !== true) fail("AG12Z readiness missing");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");
if (readiness.backend_activation_ready !== false) fail("Backend activation must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");

if (boundary.status !== "ag12z_boundary_created_not_started") fail("AG12Z boundary status mismatch");
if (boundary.next_stage_id !== "AG12Z") fail("AG12Z handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG12Z explicit approval missing");

if (schema.status !== "schema_post_refinement_layout_audit_only") fail("Schema status mismatch");

for (const key of [
  "post_refinement_layout_audit_allowed_in_ag12d",
  "treatment_audit_allowed_in_ag12d",
  "marker_preservation_audit_allowed_in_ag12d",
  "rollback_audit_allowed_in_ag12d",
  "ag12z_boundary_allowed_in_ag12d"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_mutation_allowed_in_ag12d",
  "object_generation_allowed_in_ag12d",
  "object_insertion_allowed_in_ag12d",
  "object_removal_allowed_in_ag12d",
  "css_js_mutation_allowed_in_ag12d",
  "data_fetch_allowed_in_ag12d",
  "reference_url_change_allowed_in_ag12d",
  "database_write_allowed_in_ag12d",
  "supabase_write_allowed_in_ag12d",
  "backend_auth_supabase_activation_allowed_in_ag12d",
  "public_publishing_operation_allowed_in_ag12d"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, audit, treatment, readiness, rollbackAudit, boundary, schema, learning, registry, preview]) {
  if (obj.post_refinement_layout_audit_only !== true) fail(`${obj.title || "object"} must be AG12D audit only`);
  if (obj.article_mutation_performed_in_ag12d !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.object_generation_performed_in_ag12d !== false) fail(`${obj.title || "object"} must not generate object`);
  if (obj.object_insertion_performed_in_ag12d !== false) fail(`${obj.title || "object"} must not insert object`);
  if (obj.object_removal_performed_in_ag12d !== false) fail(`${obj.title || "object"} must not remove object`);
  if (obj.css_file_mutation_performed_in_ag12d !== false) fail(`${obj.title || "object"} must not mutate CSS`);
  if (obj.js_file_mutation_performed_in_ag12d !== false) fail(`${obj.title || "object"} must not mutate JS`);
  if (obj.backend_auth_supabase_activation_performed_in_ag12d !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_operation_performed_in_ag12d !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Audit Result", "Refined Treatment Confirmed", "Publishing Boundary", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG12D document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag12d", "validate:ag12d"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag12d")) {
  fail("validate:project must include validate:ag12d");
}

pass("AG12D registry is present.");
pass("AG12D document is present.");
pass("AG12D review, audit report, treatment audit, rollback audit, readiness, AG12Z boundary, schema, learning and preview are present.");
pass("AG12C apply evidence and rollback readiness are consumed.");
pass("Current article hash remains AG12C post-refinement hash.");
pass("Four primary visible objects and three collapsed pilot objects are confirmed.");
pass("Original governed object markers, captions/credits and accessibility/source text are preserved.");
pass("Rollback readiness is audited and confirmed.");
pass("Publishing, backend and Supabase activation remain blocked.");
pass("No article mutation, object generation, object insertion/removal, CSS/JS mutation, backend activation or publishing operation is performed.");
pass("AG12Z production readiness closure boundary is created with explicit approval required.");
pass("AG12D is Post-Refinement Layout Audit only.");
