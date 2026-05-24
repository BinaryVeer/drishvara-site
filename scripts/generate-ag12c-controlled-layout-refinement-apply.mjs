import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag12bReview: "data/content-intelligence/quality-reviews/ag12b-controlled-object-rich-layout-refinement-plan.json",
  ag12bPlan: "data/content-intelligence/mutation-plans/ag12b-controlled-object-rich-layout-refinement-plan.json",
  ag12bDensityRules: "data/content-intelligence/object-registry/ag12b-object-density-production-rule-record.json",
  ag12bReadiness: "data/content-intelligence/quality-registry/ag12b-refinement-decision-readiness-record.json",
  ag12bBoundary: "data/content-intelligence/mutation-plans/ag12b-to-ag12c-controlled-layout-refinement-apply-boundary.json",
  ag11gApply: "data/content-intelligence/apply-records/ag11g-article-support-composite-object-controlled-cycle-apply.json"
};

const backupRelativePath = "data/content-intelligence/backups/ag12c-pre-layout-refinement-enhancing-public-healthcare-delivery-digital-innovation.html";

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag12c-controlled-layout-refinement-apply.json");
const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag12c-controlled-layout-refinement-apply.json");
const layoutTreatmentPath = path.join(root, "data/content-intelligence/object-registry/ag12c-layout-treatment-record.json");
const rollbackPath = path.join(root, "data/content-intelligence/quality-registry/ag12c-rollback-readiness-record.json");
const auditPrepPath = path.join(root, "data/content-intelligence/quality-registry/ag12c-post-refinement-audit-prep-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag12c-to-ag12d-post-refinement-layout-audit-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/controlled-layout-refinement-apply.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag12c-controlled-layout-refinement-apply-learning.json");
const registryPath = path.join(root, "data/quality/ag12c-controlled-layout-refinement-apply.json");
const previewPath = path.join(root, "data/quality/ag12c-controlled-layout-refinement-apply-preview.json");
const docPath = path.join(root, "docs/quality/AG12C_CONTROLLED_LAYOUT_REFINEMENT_APPLY.md");

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function writeJson(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n");
}

function writeText(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, value);
}

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function markerCount(text, marker) {
  const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (text.match(new RegExp(escaped, "g")) || []).length;
}

function getBlock(html, startMarker, endMarker) {
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker);
  if (start < 0 || end < 0 || end < start) {
    throw new Error(`Cannot locate block for ${startMarker}`);
  }
  return {
    start,
    end: end + endMarker.length,
    block: html.slice(start, end + endMarker.length)
  };
}

function collapseBlock(html, treatment) {
  const located = getBlock(html, treatment.marker_start, treatment.marker_end);
  if (located.block.includes('data-drishvara-layout-treatment="collapsed-pilot-annex"')) {
    throw new Error(`${treatment.family_id} already appears collapsed. Refusing duplicate AG12C apply.`);
  }

  const wrapped = `
<!-- AG12C-LAYOUT-REFINEMENT:START:${treatment.family_id} -->
<details class="drishvara-layout-refinement ag12c-collapsed-pilot-object" data-drishvara-stage="AG12C" data-drishvara-layout-treatment="collapsed-pilot-annex" data-object-family="${treatment.family_id}" style="max-width:940px;margin:1.5rem auto;border:1px solid rgba(182,208,233,0.95);border-radius:18px;background:#F7FAFC;padding:0.85rem 1rem;">
  <summary style="cursor:pointer;font-weight:800;color:#17324d;line-height:1.45;">${treatment.summary_label}</summary>
  <div style="margin-top:1rem;">
${located.block}
  </div>
</details>
<!-- AG12C-LAYOUT-REFINEMENT:END:${treatment.family_id} -->`;

  return html.slice(0, located.start) + wrapped + html.slice(located.end);
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) throw new Error(`Missing required AG12C input ${name}: ${relativePath}`);
}

const ag12bReview = readJson(inputs.ag12bReview);
const ag12bPlan = readJson(inputs.ag12bPlan);
const ag12bReadiness = readJson(inputs.ag12bReadiness);
const ag12bBoundary = readJson(inputs.ag12bBoundary);
const ag11gApply = readJson(inputs.ag11gApply);

if (ag12bReview.status !== "controlled_refinement_plan_created_no_article_mutation") {
  throw new Error("AG12C requires AG12B review.");
}
if (ag12bReadiness.ready_for_ag12c !== true) {
  throw new Error("AG12C requires AG12B readiness.");
}
if (ag12bBoundary.next_stage_id !== "AG12C" || ag12bBoundary.explicit_approval_required !== true) {
  throw new Error("AG12C requires AG12B to AG12C explicit boundary.");
}
if (ag12bPlan.recommended_ag12c_apply_scope?.mutation_required !== true) {
  throw new Error("AG12C requires AG12B mutation-required scope.");
}

const selectedArticlePath = ag11gApply.selected_article_path;
if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);

const articlePath = path.join(root, selectedArticlePath);
const originalHtml = fs.readFileSync(articlePath, "utf8");
const preHash = sha256(originalHtml);

if (preHash !== ag11gApply.post_insertion_hash) {
  throw new Error("AG12C requires article hash to start from AG11G post-insertion hash.");
}

if (originalHtml.includes("AG12C-LAYOUT-REFINEMENT:START")) {
  throw new Error("AG12C layout refinement already appears to be applied.");
}

const primaryVisibleObjects = [
  "GENERATED_IMAGE_EDITORIAL_VISUAL",
  "CHART_BI_GRAPH",
  "TABLE_STRUCTURED_OBJECT",
  "ARTICLE_SUPPORT_COMPOSITE"
];

const collapsedPilotObjects = [
  {
    family_id: "INFOGRAPHIC",
    stage: "AG11C",
    marker_start: "<!-- AG11C-INFOGRAPHIC-INSERTION:START -->",
    marker_end: "<!-- AG11C-INFOGRAPHIC-INSERTION:END -->",
    summary_label: "Additional pilot object: infographic service-flow view"
  },
  {
    family_id: "FIGURE_DIAGRAM",
    stage: "AG11D",
    marker_start: "<!-- AG11D-FIGURE-DIAGRAM-INSERTION:START -->",
    marker_end: "<!-- AG11D-FIGURE-DIAGRAM-INSERTION:END -->",
    summary_label: "Additional pilot object: feedback-loop diagram"
  },
  {
    family_id: "MAP_GEOGRAPHIC_OBJECT",
    stage: "AG11F",
    marker_start: "<!-- AG11F-MAP-GEOGRAPHIC-OBJECT-INSERTION:START -->",
    marker_end: "<!-- AG11F-MAP-GEOGRAPHIC-OBJECT-INSERTION:END -->",
    summary_label: "Additional pilot object: schematic geographic-access view"
  }
];

let refinedHtml = originalHtml;

for (const treatment of collapsedPilotObjects) {
  refinedHtml = collapseBlock(refinedHtml, treatment);
}

const postHash = sha256(refinedHtml);
writeText(path.join(root, backupRelativePath), originalHtml);
fs.writeFileSync(articlePath, refinedHtml);

const finalHtml = fs.readFileSync(articlePath, "utf8");
const finalHash = sha256(finalHtml);

if (finalHash !== postHash) throw new Error("AG12C post-write hash mismatch.");
if (finalHash === preHash) throw new Error("AG12C expected article hash to change after layout refinement.");

for (const treatment of collapsedPilotObjects) {
  if (markerCount(finalHtml, treatment.marker_start) !== 1 || markerCount(finalHtml, treatment.marker_end) !== 1) {
    throw new Error(`${treatment.family_id} original object marker count changed.`);
  }
  if (markerCount(finalHtml, `<!-- AG12C-LAYOUT-REFINEMENT:START:${treatment.family_id} -->`) !== 1) {
    throw new Error(`${treatment.family_id} AG12C refinement start marker missing.`);
  }
}

const collapsedCount = markerCount(finalHtml, 'data-drishvara-layout-treatment="collapsed-pilot-annex"');
if (collapsedCount !== collapsedPilotObjects.length) {
  throw new Error("AG12C collapsed pilot object count mismatch.");
}

const stageControls = {
  controlled_layout_refinement_apply_only: true,
  selected_article_layout_refinement_applied_in_ag12c: true,
  selected_article_read_performed: true,
  selected_article_file_write_performed_in_ag12c: true,
  backup_created_in_ag12c: true,
  article_mutation_performed_in_ag12c: true,
  object_density_reduced_in_public_reading_flow: true,

  object_generation_performed_in_ag12c: false,
  object_insertion_performed_in_ag12c: false,
  new_object_added_in_ag12c: false,
  existing_object_removed_in_ag12c: false,
  image_generation_performed_in_ag12c: false,
  data_fetch_performed_in_ag12c: false,
  reference_url_change_performed_in_ag12c: false,
  homepage_mutation_performed_in_ag12c: false,
  css_file_mutation_performed_in_ag12c: false,
  js_file_mutation_performed_in_ag12c: false,
  production_jsonl_append_performed_in_ag12c: false,
  database_write_performed_in_ag12c: false,
  supabase_write_performed_in_ag12c: false,
  backend_auth_supabase_activation_performed_in_ag12c: false,
  public_publishing_operation_performed_in_ag12c: false
};

const layoutTreatment = {
  module_id: "AG12C",
  title: "Layout Treatment Record",
  status: "controlled_layout_refinement_applied",
  selected_article_path: selectedArticlePath,
  pre_refinement_hash: preHash,
  post_refinement_hash: postHash,
  public_primary_visible_object_count_after_refinement: primaryVisibleObjects.length,
  collapsed_pilot_object_count_after_refinement: collapsedPilotObjects.length,
  primary_visible_objects: primaryVisibleObjects,
  collapsed_pilot_objects: collapsedPilotObjects,
  treatment_logic: "Retain high-value primary reading objects in normal flow and collapse secondary pilot objects into optional details blocks without deleting objects.",
  production_density_alignment: "Moves normal reading flow from seven visible objects toward a production-safe 3-4 primary-object band while preserving pilot evidence.",
  ...stageControls
};

const applyRecord = {
  module_id: "AG12C",
  title: "Controlled Layout Refinement Apply Record",
  status: "controlled_layout_refinement_applied_pending_post_refinement_audit",
  selected_article_path: selectedArticlePath,
  backup_path: backupRelativePath,
  pre_refinement_hash: preHash,
  post_refinement_hash: postHash,
  prior_hash_source: "AG11G post-insertion hash",
  mutated_files: [selectedArticlePath],
  layout_treatment_record_file: "data/content-intelligence/object-registry/ag12c-layout-treatment-record.json",
  collapsed_pilot_objects: collapsedPilotObjects.map((item) => item.family_id),
  primary_visible_objects: primaryVisibleObjects,
  refinement_markers: collapsedPilotObjects.map((item) => ({
    family_id: item.family_id,
    start: `<!-- AG12C-LAYOUT-REFINEMENT:START:${item.family_id} -->`,
    end: `<!-- AG12C-LAYOUT-REFINEMENT:END:${item.family_id} -->`
  })),
  ...stageControls
};

const rollback = {
  module_id: "AG12C",
  title: "Rollback Readiness Record",
  status: "rollback_ready",
  selected_article_path: selectedArticlePath,
  backup_path: backupRelativePath,
  backup_hash: preHash,
  current_post_refinement_hash: postHash,
  rollback_method: "Replace selected article with AG12C backup file if post-refinement audit fails.",
  backup_has_no_ag12c_refinement_marker: !fs.readFileSync(path.join(root, backupRelativePath), "utf8").includes("AG12C-LAYOUT-REFINEMENT"),
  ...stageControls
};

const auditPrep = {
  module_id: "AG12C",
  title: "Post-Refinement Audit Preparation Record",
  status: "ready_for_ag12d_post_refinement_layout_audit",
  selected_article_path: selectedArticlePath,
  post_refinement_hash: postHash,
  audit_focus: [
    "Confirm primary visible object count.",
    "Confirm collapsed pilot objects remain accessible.",
    "Confirm original object markers remain exactly once.",
    "Confirm captions/credits remain present.",
    "Confirm mobile static layout remains safe.",
    "Confirm no object was generated, inserted or removed."
  ],
  ready_for_ag12d: true,
  ...stageControls
};

const boundary = {
  module_id: "AG12C",
  title: "AG12C to AG12D Post-Refinement Layout Audit Boundary",
  status: "ag12d_boundary_created_not_started",
  selected_article_path: selectedArticlePath,
  article_hash_after_ag12c: postHash,
  next_stage_id: "AG12D",
  next_stage_title: "Post-Refinement Layout Audit",
  explicit_approval_required: true,
  ag12d_allowed_scope: [
    "Audit post-refinement article layout.",
    "Verify object marker preservation.",
    "Verify primary/collapsed object treatment.",
    "Verify rollback readiness.",
    "Prepare AG12Z production-readiness closure boundary if passed."
  ],
  ag12d_blocked_scope: [
    "No article mutation.",
    "No object generation.",
    "No object insertion.",
    "No CSS/JS mutation.",
    "No backend/Auth/Supabase/database activation.",
    "No public publishing operation."
  ],
  ...stageControls
};

const schema = {
  module_id: "AG12C",
  title: "Controlled Layout Refinement Apply Schema",
  status: "schema_controlled_layout_refinement_apply",
  selected_article_layout_refinement_allowed_in_ag12c: true,
  backup_creation_allowed_in_ag12c: true,
  post_refinement_hash_recording_allowed_in_ag12c: true,
  rollback_readiness_allowed_in_ag12c: true,
  ag12d_boundary_allowed_in_ag12c: true,

  object_generation_allowed_in_ag12c: false,
  new_object_insertion_allowed_in_ag12c: false,
  existing_object_removal_allowed_in_ag12c: false,
  css_js_mutation_allowed_in_ag12c: false,
  data_fetch_allowed_in_ag12c: false,
  reference_url_change_allowed_in_ag12c: false,
  production_jsonl_append_allowed_in_ag12c: false,
  database_write_allowed_in_ag12c: false,
  supabase_write_allowed_in_ag12c: false,
  backend_auth_supabase_activation_allowed_in_ag12c: false,
  public_publishing_operation_allowed_in_ag12c: false,
  ...stageControls
};

const review = {
  module_id: "AG12C",
  title: "Controlled Layout Refinement Apply",
  status: "controlled_layout_refinement_applied_pending_post_refinement_audit",
  depends_on: ["AG12B"],
  generated_from: inputs,
  apply_record_file: "data/content-intelligence/apply-records/ag12c-controlled-layout-refinement-apply.json",
  layout_treatment_file: "data/content-intelligence/object-registry/ag12c-layout-treatment-record.json",
  rollback_record_file: "data/content-intelligence/quality-registry/ag12c-rollback-readiness-record.json",
  audit_prep_file: "data/content-intelligence/quality-registry/ag12c-post-refinement-audit-prep-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag12c-to-ag12d-post-refinement-layout-audit-boundary.json",
  summary: {
    selected_article_path: selectedArticlePath,
    pre_refinement_hash: preHash,
    post_refinement_hash: postHash,
    primary_visible_object_count: primaryVisibleObjects.length,
    collapsed_pilot_object_count: collapsedPilotObjects.length,
    next_stage_id: "AG12D",
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG12C",
  title: "Controlled Layout Refinement Apply Learning",
  status: "learning_record_only",
  learning_points: [
    "Object density can be reduced without deleting governed object evidence by collapsing secondary pilot objects.",
    "Layout refinement should preserve all original object markers and credits.",
    "A post-refinement audit is mandatory before production-readiness closure.",
    "Future implementation should centralise latest-approved article hash rather than patching validators repeatedly.",
    "No new objects should be generated during layout refinement apply."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG12C",
  title: "Controlled Layout Refinement Apply",
  status: "controlled_layout_refinement_applied_pending_post_refinement_audit",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag12c-controlled-layout-refinement-apply.json",
    apply_record: "data/content-intelligence/apply-records/ag12c-controlled-layout-refinement-apply.json",
    layout_treatment: "data/content-intelligence/object-registry/ag12c-layout-treatment-record.json",
    rollback: "data/content-intelligence/quality-registry/ag12c-rollback-readiness-record.json",
    audit_prep: "data/content-intelligence/quality-registry/ag12c-post-refinement-audit-prep-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag12c-to-ag12d-post-refinement-layout-audit-boundary.json",
    schema: "data/content-intelligence/schema/controlled-layout-refinement-apply.schema.json",
    learning: "data/content-intelligence/learning/ag12c-controlled-layout-refinement-apply-learning.json",
    preview: "data/quality/ag12c-controlled-layout-refinement-apply-preview.json",
    document: "docs/quality/AG12C_CONTROLLED_LAYOUT_REFINEMENT_APPLY.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG12C",
  preview_only: true,
  status: "controlled_layout_refinement_applied_pending_post_refinement_audit",
  selected_article_path: selectedArticlePath,
  pre_refinement_hash: preHash,
  post_refinement_hash: postHash,
  primary_visible_objects: primaryVisibleObjects,
  collapsed_pilot_objects: collapsedPilotObjects.map((item) => item.family_id),
  next_stage: boundary,
  ...stageControls
};

const doc = `# AG12C — Controlled Layout Refinement Apply

## Purpose

AG12C applies controlled layout refinement to the selected object-rich pilot article.

## Applied Treatment

The article remains object-complete, but the normal reading flow is refined:

- Primary visible objects retained: generated image/editorial visual, chart/BI graph, table/structured object, and reader-lens composite.
- Secondary pilot objects collapsed into optional details blocks: infographic, figure/diagram, and schematic map/geographic object.

## Integrity Boundary

AG12C does not generate objects, insert new objects, remove existing governed objects, change references, mutate CSS/JS, activate backend/Auth/Supabase/database systems or publish anything.

## Rollback

A pre-refinement backup has been created at:

\`${backupRelativePath}\`

## Next Stage

AG12D — Post-Refinement Layout Audit — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(applyRecordPath, applyRecord);
writeJson(layoutTreatmentPath, layoutTreatment);
writeJson(rollbackPath, rollback);
writeJson(auditPrepPath, auditPrep);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG12C controlled layout refinement apply completed.");
console.log("✅ Backup created before mutation.");
console.log("✅ Primary visible object count after refinement: 4");
console.log("✅ Collapsed pilot objects after refinement: 3");
console.log("✅ Existing governed objects preserved; no object generated, inserted or removed.");
console.log(`✅ Pre-hash: ${preHash}`);
console.log(`✅ Post-hash: ${postHash}`);
console.log("✅ Rollback readiness recorded.");
console.log("✅ No CSS/JS mutation, backend/Supabase activation or publishing performed.");
console.log("✅ AG12D post-refinement layout audit boundary created with explicit approval required.");
