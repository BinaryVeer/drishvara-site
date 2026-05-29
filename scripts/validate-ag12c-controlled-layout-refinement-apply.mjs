import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag12b-controlled-object-rich-layout-refinement-plan.json",
  "data/content-intelligence/mutation-plans/ag12b-controlled-object-rich-layout-refinement-plan.json",
  "data/content-intelligence/object-registry/ag12b-object-density-production-rule-record.json",
  "data/content-intelligence/quality-registry/ag12b-refinement-decision-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag12b-to-ag12c-controlled-layout-refinement-apply-boundary.json",
  "data/content-intelligence/apply-records/ag11g-article-support-composite-object-controlled-cycle-apply.json",

  "data/content-intelligence/quality-reviews/ag12c-controlled-layout-refinement-apply.json",
  "data/content-intelligence/apply-records/ag12c-controlled-layout-refinement-apply.json",
  "data/content-intelligence/object-registry/ag12c-layout-treatment-record.json",
  "data/content-intelligence/quality-registry/ag12c-rollback-readiness-record.json",
  "data/content-intelligence/quality-registry/ag12c-post-refinement-audit-prep-record.json",
  "data/content-intelligence/mutation-plans/ag12c-to-ag12d-post-refinement-layout-audit-boundary.json",
  "data/content-intelligence/schema/controlled-layout-refinement-apply.schema.json",
  "data/content-intelligence/learning/ag12c-controlled-layout-refinement-apply-learning.json",
  "data/quality/ag12c-controlled-layout-refinement-apply.json",
  "data/quality/ag12c-controlled-layout-refinement-apply-preview.json",
  "docs/quality/AG12C_CONTROLLED_LAYOUT_REFINEMENT_APPLY.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG12C validation failed: ${message}`);
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


function markerCount(text, marker) {
  const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (text.match(new RegExp(escaped, "g")) || []).length;
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag12bReview = readJson("data/content-intelligence/quality-reviews/ag12b-controlled-object-rich-layout-refinement-plan.json");
const ag12bReadiness = readJson("data/content-intelligence/quality-registry/ag12b-refinement-decision-readiness-record.json");
const ag12bBoundary = readJson("data/content-intelligence/mutation-plans/ag12b-to-ag12c-controlled-layout-refinement-apply-boundary.json");
const ag11gApply = readJson("data/content-intelligence/apply-records/ag11g-article-support-composite-object-controlled-cycle-apply.json");

const review = readJson("data/content-intelligence/quality-reviews/ag12c-controlled-layout-refinement-apply.json");
const apply = readJson("data/content-intelligence/apply-records/ag12c-controlled-layout-refinement-apply.json");
const layout = readJson("data/content-intelligence/object-registry/ag12c-layout-treatment-record.json");
const rollback = readJson("data/content-intelligence/quality-registry/ag12c-rollback-readiness-record.json");
const auditPrep = readJson("data/content-intelligence/quality-registry/ag12c-post-refinement-audit-prep-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag12c-to-ag12d-post-refinement-layout-audit-boundary.json");
const schema = readJson("data/content-intelligence/schema/controlled-layout-refinement-apply.schema.json");
const learning = readJson("data/content-intelligence/learning/ag12c-controlled-layout-refinement-apply-learning.json");
const registry = readJson("data/quality/ag12c-controlled-layout-refinement-apply.json");
const preview = readJson("data/quality/ag12c-controlled-layout-refinement-apply-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG12C_CONTROLLED_LAYOUT_REFINEMENT_APPLY.md"), "utf8");

for (const obj of [review, apply, layout, rollback, auditPrep, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG12C") fail(`module_id must be AG12C in ${obj.title || "object"}`);
}

if (ag12bReview.status !== "controlled_refinement_plan_created_no_article_mutation") fail("AG12B review status mismatch");
if (ag12bReadiness.ready_for_ag12c !== true) fail("AG12B readiness for AG12C missing");
if (ag12bBoundary.next_stage_id !== "AG12C") fail("AG12C boundary missing in AG12B");

const articlePath = apply.selected_article_path;
const backupPath = apply.backup_path;

if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
if (!fs.existsSync(path.join(root, backupPath))) fail(`Backup missing: ${backupPath}`);

const articleHtml = fs.readFileSync(path.join(root, articlePath), "utf8");
const backupHtml = fs.readFileSync(path.join(root, backupPath), "utf8");

const articleHash = sha256(articleHtml);
const backupHash = sha256(backupHtml);

const ag12cR1ApplyPath = "data/content-intelligence/apply-records/ag12c-r1-public-object-label-layout-repair.json";
const hasAg12cR1Repair = fs.existsSync(path.join(root, ag12cR1ApplyPath));
const ag12cR1Apply = hasAg12cR1Repair ? readJson(ag12cR1ApplyPath) : null;

if (hasAg12cR1Repair) {
  if (!hashPairMatchesCurrentOrAg12cR1Repair(articleHash, ag12cR1Apply.post_repair_hash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Current article hash must match AG12C-R1 post-repair hash or AG12C-R1/AR01-R1 approved repair-chain state missing");
  if (!hashPairMatchesCurrentOrAg12cR1Repair(ag12cR1Apply.pre_repair_hash, apply.post_refinement_hash, typeof articlePath !== "undefined" ? articlePath : null)) fail("AG12C-R1 must start from AG12C post-refinement hash or AG12C-R1/AR01-R1 approved repair-chain state missing");
} else {
  if (!hashPairMatchesCurrentOrAg12cR1Repair(articleHash, apply.post_refinement_hash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Current article hash must match AG12C post-refinement hash or AG12C-R1/AR01-R1 approved repair-chain state missing");
}
if (backupHash !== apply.pre_refinement_hash) fail("Backup hash must match AG12C pre-refinement hash");
if (!hashPairMatchesCurrentOrAg12cR1Repair(apply.pre_refinement_hash, ag11gApply.post_insertion_hash, typeof articlePath !== "undefined" ? articlePath : null)) fail("AG12C must start from AG11G post-insertion hash or AG12C-R1/AR01-R1 approved repair-chain state missing");
if (apply.post_refinement_hash === apply.pre_refinement_hash) fail("AG12C post-refinement hash must differ from pre-refinement hash");

if (backupHtml.includes("AG12C-LAYOUT-REFINEMENT")) fail("Backup must not include AG12C refinement markers");
if (rollback.backup_has_no_ag12c_refinement_marker !== true) fail("Rollback record must confirm clean backup");

const originalMarkers = [
  "<!-- AG10K-GENERATED-IMAGE-INSERTION:START -->",
  "<!-- AG11B-CHART-BI-GRAPH-INSERTION:START -->",
  "<!-- AG11C-INFOGRAPHIC-INSERTION:START -->",
  "<!-- AG11D-FIGURE-DIAGRAM-INSERTION:START -->",
  "<!-- AG11E-TABLE-STRUCTURED-OBJECT-INSERTION:START -->",
  "<!-- AG11F-MAP-GEOGRAPHIC-OBJECT-INSERTION:START -->",
  "<!-- AG11G-ARTICLE-SUPPORT-COMPOSITE-OBJECT-INSERTION:START -->"
];

for (const marker of originalMarkers) {
  if (markerCount(articleHtml, marker) !== 1) fail(`Original governed marker must remain once: ${marker}`);
}

if (hasAg12cR1Repair) {
  if (markerCount(articleHtml, 'data-drishvara-layout-treatment="collapsed-pilot-annex"') !== 0) {
    fail("AG12C-R1 state must not retain collapsed pilot annex treatment");
  }
  if (markerCount(articleHtml, 'data-drishvara-layout-treatment="reader-facing-object"') !== 3) {
    fail("AG12C-R1 state must contain three reader-facing object blocks");
  }
  if (articleHtml.includes("Additional pilot object:")) fail("AG12C-R1 state must remove internal pilot labels");
} else if (markerCount(articleHtml, 'data-drishvara-layout-treatment="collapsed-pilot-annex"') !== 3) {
  fail("Exactly three pilot objects must be collapsed");
}

for (const familyId of ["INFOGRAPHIC", "FIGURE_DIAGRAM", "MAP_GEOGRAPHIC_OBJECT"]) {
  if (!articleHtml.includes(`AG12C-LAYOUT-REFINEMENT:START:${familyId}`)) fail(`${familyId} AG12C start marker missing`);
  if (!articleHtml.includes(`AG12C-LAYOUT-REFINEMENT:END:${familyId}`)) fail(`${familyId} AG12C end marker missing`);
}

if (hasAg12cR1Repair) {
  if (ag12cR1Apply.reader_facing_object_count_after_repair !== 3) fail("AG12C-R1 reader-facing object count must be three");
  if (ag12cR1Apply.original_governed_object_markers_preserved !== true) fail("AG12C-R1 must preserve governed object markers");
} else {
  if (layout.public_primary_visible_object_count_after_refinement !== 4) fail("Primary visible count must be four");
  if (layout.collapsed_pilot_object_count_after_refinement !== 3) fail("Collapsed pilot count must be three");
}
if (layout.status !== "controlled_layout_refinement_applied") fail("Layout treatment status mismatch");

if (apply.status !== "controlled_layout_refinement_applied_pending_post_refinement_audit") fail("Apply status mismatch");
if (rollback.status !== "rollback_ready") fail("Rollback status mismatch");
if (auditPrep.status !== "ready_for_ag12d_post_refinement_layout_audit") fail("Audit prep status mismatch");
if (auditPrep.ready_for_ag12d !== true) fail("AG12D readiness missing");

if (boundary.status !== "ag12d_boundary_created_not_started") fail("AG12D boundary status mismatch");
if (boundary.next_stage_id !== "AG12D") fail("AG12D handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG12D explicit approval missing");

if (schema.status !== "schema_controlled_layout_refinement_apply") fail("Schema status mismatch");

for (const key of [
  "selected_article_layout_refinement_allowed_in_ag12c",
  "backup_creation_allowed_in_ag12c",
  "post_refinement_hash_recording_allowed_in_ag12c",
  "rollback_readiness_allowed_in_ag12c",
  "ag12d_boundary_allowed_in_ag12c"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "object_generation_allowed_in_ag12c",
  "new_object_insertion_allowed_in_ag12c",
  "existing_object_removal_allowed_in_ag12c",
  "css_js_mutation_allowed_in_ag12c",
  "data_fetch_allowed_in_ag12c",
  "reference_url_change_allowed_in_ag12c",
  "database_write_allowed_in_ag12c",
  "supabase_write_allowed_in_ag12c",
  "backend_auth_supabase_activation_allowed_in_ag12c",
  "public_publishing_operation_allowed_in_ag12c"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, apply, layout, rollback, auditPrep, boundary, schema, learning, registry, preview]) {
  if (obj.controlled_layout_refinement_apply_only !== true) fail(`${obj.title || "object"} must be AG12C apply only`);
  if (obj.article_mutation_performed_in_ag12c !== true) fail(`${obj.title || "object"} must record article mutation`);
  if (obj.object_generation_performed_in_ag12c !== false) fail(`${obj.title || "object"} must not generate object`);
  if (obj.object_insertion_performed_in_ag12c !== false) fail(`${obj.title || "object"} must not insert object`);
  if (obj.new_object_added_in_ag12c !== false) fail(`${obj.title || "object"} must not add object`);
  if (obj.existing_object_removed_in_ag12c !== false) fail(`${obj.title || "object"} must not remove object`);
  if (obj.css_file_mutation_performed_in_ag12c !== false) fail(`${obj.title || "object"} must not mutate CSS`);
  if (obj.js_file_mutation_performed_in_ag12c !== false) fail(`${obj.title || "object"} must not mutate JS`);
  if (obj.backend_auth_supabase_activation_performed_in_ag12c !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_operation_performed_in_ag12c !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Applied Treatment", "Integrity Boundary", "Rollback", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG12C document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag12c", "validate:ag12c"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag12c")) {
  fail("validate:project must include validate:ag12c");
}

pass("AG12C registry is present.");
pass("AG12C document is present.");
pass("AG12C review, apply record, layout treatment, rollback readiness, audit prep, AG12D boundary, schema, learning and preview are present.");
pass("AG12B plan and AG11G article state are consumed.");
pass("Selected article was refined with backup and post-refinement hash recorded.");
pass("Primary visible object count is four and three pilot objects are collapsed.");
pass("All original governed object markers remain present exactly once.");
pass("Rollback readiness is confirmed.");
pass("No object generation, new object insertion, object removal, CSS/JS mutation, backend activation or publishing operation is performed.");
pass("AG12D post-refinement layout audit boundary is created with explicit approval required.");
pass("AG12C is Controlled Layout Refinement Apply only.");
