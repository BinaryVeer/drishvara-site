import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag11zReview: "data/content-intelligence/quality-reviews/ag11z-remaining-object-family-completion-closure.json",
  ag11zClosure: "data/content-intelligence/closure-records/ag11z-remaining-object-family-completion-closure.json",
  ag11zFamilyCompletion: "data/content-intelligence/object-registry/ag11z-completed-object-family-insertion-record.json",
  ag11zReadiness: "data/content-intelligence/quality-registry/ag11z-object-family-completion-readiness-record.json",
  ag11zBoundary: "data/content-intelligence/mutation-plans/ag11z-to-ag12a-object-rich-article-layout-production-readiness-audit-boundary.json",
  ag11gApply: "data/content-intelligence/apply-records/ag11g-article-support-composite-object-controlled-cycle-apply.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag12a-object-rich-article-layout-production-readiness-audit.json");
const auditPath = path.join(root, "data/content-intelligence/audit-records/ag12a-object-rich-article-layout-production-readiness-audit-report.json");
const densityPath = path.join(root, "data/content-intelligence/object-registry/ag12a-object-sequence-density-record.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag12a-layout-production-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag12a-to-ag12b-controlled-object-rich-layout-refinement-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/object-rich-article-layout-production-readiness-audit.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag12a-object-rich-article-layout-production-readiness-audit-learning.json");
const registryPath = path.join(root, "data/quality/ag12a-object-rich-article-layout-production-readiness-audit.json");
const previewPath = path.join(root, "data/quality/ag12a-object-rich-article-layout-production-readiness-audit-preview.json");
const docPath = path.join(root, "docs/quality/AG12A_OBJECT_RICH_ARTICLE_LAYOUT_PRODUCTION_READINESS_AUDIT.md");

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

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) throw new Error(`Missing required AG12A input ${name}: ${relativePath}`);
}

const ag11zReview = readJson(inputs.ag11zReview);
const ag11zClosure = readJson(inputs.ag11zClosure);
const ag11zFamilyCompletion = readJson(inputs.ag11zFamilyCompletion);
const ag11zReadiness = readJson(inputs.ag11zReadiness);
const ag11zBoundary = readJson(inputs.ag11zBoundary);
const ag11gApply = readJson(inputs.ag11gApply);

if (ag11zReview.status !== "remaining_object_family_completion_closed_all_families_completed_once") {
  throw new Error("AG12A requires AG11Z closure review.");
}
if (ag11zReadiness.ready_for_ag12a !== true) {
  throw new Error("AG12A requires AG11Z readiness.");
}
if (ag11zBoundary.next_stage_id !== "AG12A" || ag11zBoundary.explicit_approval_required !== true) {
  throw new Error("AG12A requires AG11Z to AG12A explicit boundary.");
}

const selectedArticlePath = ag11gApply.selected_article_path;
if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);

const articleHtml = fs.readFileSync(path.join(root, selectedArticlePath), "utf8");
const articleHash = sha256(articleHtml);

if (articleHash !== ag11gApply.post_insertion_hash) {
  throw new Error("AG12A requires article hash to remain AG11G post-insertion hash.");
}

const objectMarkers = [
  {
    family_id: "GENERATED_IMAGE_EDITORIAL_VISUAL",
    stage: "AG10K",
    marker_start: "<!-- AG10K-GENERATED-IMAGE-INSERTION:START -->",
    marker_end: "<!-- AG10K-GENERATED-IMAGE-INSERTION:END -->",
    visible_credit_hint: "Image: Drishvara"
  },
  {
    family_id: "CHART_BI_GRAPH",
    stage: "AG11B",
    marker_start: "<!-- AG11B-CHART-BI-GRAPH-INSERTION:START -->",
    marker_end: "<!-- AG11B-CHART-BI-GRAPH-INSERTION:END -->",
    visible_credit_hint: "Chart: Drishvara"
  },
  {
    family_id: "INFOGRAPHIC",
    stage: "AG11C",
    marker_start: "<!-- AG11C-INFOGRAPHIC-INSERTION:START -->",
    marker_end: "<!-- AG11C-INFOGRAPHIC-INSERTION:END -->",
    visible_credit_hint: "Infographic: Drishvara"
  },
  {
    family_id: "FIGURE_DIAGRAM",
    stage: "AG11D",
    marker_start: "<!-- AG11D-FIGURE-DIAGRAM-INSERTION:START -->",
    marker_end: "<!-- AG11D-FIGURE-DIAGRAM-INSERTION:END -->",
    visible_credit_hint: "Diagram: Drishvara"
  },
  {
    family_id: "TABLE_STRUCTURED_OBJECT",
    stage: "AG11E",
    marker_start: "<!-- AG11E-TABLE-STRUCTURED-OBJECT-INSERTION:START -->",
    marker_end: "<!-- AG11E-TABLE-STRUCTURED-OBJECT-INSERTION:END -->",
    visible_credit_hint: "Table: Drishvara"
  },
  {
    family_id: "MAP_GEOGRAPHIC_OBJECT",
    stage: "AG11F",
    marker_start: "<!-- AG11F-MAP-GEOGRAPHIC-OBJECT-INSERTION:START -->",
    marker_end: "<!-- AG11F-MAP-GEOGRAPHIC-OBJECT-INSERTION:END -->",
    visible_credit_hint: "Schematic map object: Drishvara"
  },
  {
    family_id: "ARTICLE_SUPPORT_COMPOSITE",
    stage: "AG11G",
    marker_start: "<!-- AG11G-ARTICLE-SUPPORT-COMPOSITE-OBJECT-INSERTION:START -->",
    marker_end: "<!-- AG11G-ARTICLE-SUPPORT-COMPOSITE-OBJECT-INSERTION:END -->",
    visible_credit_hint: "Composite object: Drishvara"
  }
];

const objectSequence = objectMarkers.map((object) => {
  const startIndex = articleHtml.indexOf(object.marker_start);
  const endIndex = articleHtml.indexOf(object.marker_end);
  const present = startIndex >= 0 && endIndex >= 0;
  const blockHtml = present
    ? articleHtml.slice(startIndex, endIndex + object.marker_end.length)
    : "";

  const visibleCreditPresent =
    blockHtml.includes(object.visible_credit_hint) ||
    (/Drishvara/i.test(blockHtml) && /(Image|Chart|Infographic|Diagram|Table|map|Map|Composite|object|Source|Credit)/i.test(blockHtml));

  return {
    ...object,
    start_marker_count: markerCount(articleHtml, object.marker_start),
    end_marker_count: markerCount(articleHtml, object.marker_end),
    start_index: startIndex,
    end_index: endIndex,
    present,
    visible_credit_present: visibleCreditPresent
  };
});

const ordered = objectSequence.every((object, index, array) => {
  if (index === 0) return true;
  return array[index - 1].start_index < object.start_index;
});

const objectCount = objectSequence.filter((object) => object.present).length;
const articleWordCountApprox = stripHtml(articleHtml).split(/\s+/).filter(Boolean).length;
const objectDensityBand = objectCount >= 7 ? "object_rich_pilot_high_density" : "standard_density";
const refinementRecommended = objectCount >= 7;

const auditChecks = [
  {
    check_id: "AG12A-AUDIT-001",
    area: "article_hash_stability",
    status: articleHash === ag11gApply.post_insertion_hash ? "passed" : "failed",
    note: "AG12A must not mutate the article."
  },
  {
    check_id: "AG12A-AUDIT-002",
    area: "object_marker_presence",
    status: objectSequence.every((object) => object.start_marker_count === 1 && object.end_marker_count === 1) ? "passed" : "failed",
    note: "Each governed object insertion marker must appear exactly once."
  },
  {
    check_id: "AG12A-AUDIT-003",
    area: "object_sequence",
    status: ordered ? "passed" : "failed",
    note: "Object sequence should follow AG10K then AG11B through AG11G."
  },
  {
    check_id: "AG12A-AUDIT-004",
    area: "caption_credit_presence",
    status: objectSequence.every((object) => object.visible_credit_present) ? "passed" : "failed",
    note: "Every object should retain visible credit/source line."
  },
  {
    check_id: "AG12A-AUDIT-005",
    area: "mobile_static_safety",
    status: articleHtml.includes("width:100%") && articleHtml.includes("height:auto") && articleHtml.includes("overflow-x:auto") ? "passed" : "failed",
    note: "Responsive image sizing and table overflow controls are present."
  },
  {
    check_id: "AG12A-AUDIT-006",
    area: "object_density",
    status: "observation",
    note: "This article is intentionally object-rich because it carries all object-family pilot insertions. Production refinement is recommended before using this density as default."
  },
  {
    check_id: "AG12A-AUDIT-007",
    area: "forbidden_mutation_guards",
    status: "passed",
    note: "AG12A performs audit only."
  }
];

const failedChecks = auditChecks.filter((check) => check.status === "failed");

if (failedChecks.length > 0) {
  throw new Error(`AG12A audit failed: ${failedChecks.map((check) => check.check_id).join(", ")}`);
}

const stageControls = {
  object_rich_article_layout_production_readiness_audit_only: true,
  layout_static_audit_performed_in_ag12a: true,
  object_density_audit_performed_in_ag12a: true,
  placement_sequence_audit_performed_in_ag12a: true,
  caption_credit_audit_performed_in_ag12a: true,
  mobile_static_safety_audit_performed_in_ag12a: true,
  controlled_refinement_recommended: refinementRecommended,
  ready_for_ag12b: true,
  selected_article_read_performed: true,

  article_mutation_performed_in_ag12a: false,
  selected_article_file_write_performed_in_ag12a: false,
  object_generation_performed_in_ag12a: false,
  object_insertion_performed_in_ag12a: false,
  image_generation_performed_in_ag12a: false,
  data_fetch_performed_in_ag12a: false,
  reference_url_change_performed_in_ag12a: false,
  homepage_mutation_performed_in_ag12a: false,
  css_file_mutation_performed_in_ag12a: false,
  js_file_mutation_performed_in_ag12a: false,
  production_jsonl_append_performed_in_ag12a: false,
  database_write_performed_in_ag12a: false,
  supabase_write_performed_in_ag12a: false,
  backend_auth_supabase_activation_performed_in_ag12a: false,
  public_publishing_operation_performed_in_ag12a: false
};

const densityRecord = {
  module_id: "AG12A",
  title: "Object Sequence and Density Record",
  status: "object_rich_article_density_audited_refinement_recommended",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag12a: articleHash,
  approximate_word_count_with_objects: articleWordCountApprox,
  object_count: objectCount,
  object_density_band: objectDensityBand,
  object_sequence_ordered: ordered,
  object_sequence: objectSequence,
  density_observation: "The selected article now contains all governed object families. This is valuable as a capability pilot but should not become default article density without a controlled layout/refinement rule.",
  recommended_treatment: "Proceed to AG12B controlled object-rich layout refinement plan before any production/publish decision.",
  ...stageControls
};

const auditReport = {
  module_id: "AG12A",
  title: "Object-Rich Article Layout and Production Readiness Audit Report",
  status: "object_rich_article_layout_audit_completed_refinement_recommended",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag12a: articleHash,
  checks: auditChecks,
  failed_checks: failedChecks,
  audit_summary: {
    total_checks: auditChecks.length,
    passed: auditChecks.filter((check) => check.status === "passed").length,
    observations: auditChecks.filter((check) => check.status === "observation").length,
    failed: failedChecks.length
  },
  production_readiness_decision: {
    static_layout_audit_passed: true,
    object_density_high: refinementRecommended,
    controlled_refinement_recommended_before_publish: refinementRecommended,
    publish_ready: false,
    reason_publish_blocked: "Object-rich pilot article passed static audit, but production density/reading-flow refinement should be reviewed in AG12B before publish readiness closure."
  },
  ...stageControls
};

const readiness = {
  module_id: "AG12A",
  title: "Layout Production Readiness Record",
  status: "ready_for_ag12b_controlled_object_rich_layout_refinement",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag12a: articleHash,
  static_audit_passed: true,
  object_density_review_required: true,
  controlled_refinement_recommended: true,
  ready_for_ag12b: true,
  ag12b_explicit_approval_required: true,
  publish_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  ...stageControls
};

const boundary = {
  module_id: "AG12A",
  title: "AG12A to AG12B Controlled Object-Rich Layout Refinement Boundary",
  status: "ag12b_boundary_created_not_started",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag12a: articleHash,
  next_stage_id: "AG12B",
  next_stage_title: "Controlled Object-Rich Layout Refinement Plan",
  explicit_approval_required: true,
  ag12b_allowed_scope: [
    "Prepare controlled layout refinement plan based on AG12A audit.",
    "Decide whether to keep all objects in the pilot article or classify it as a capability/demo article.",
    "Define production density rules for future articles.",
    "Prepare controlled apply boundary only if article mutation is required."
  ],
  ag12b_blocked_scope: [
    "No direct article mutation in AG12B unless a later controlled apply stage is approved.",
    "No object generation.",
    "No object insertion.",
    "No CSS/JS mutation unless separately approved.",
    "No backend/Auth/Supabase/database activation.",
    "No public publishing operation."
  ],
  ...stageControls
};

const schema = {
  module_id: "AG12A",
  title: "Object-Rich Article Layout Production Readiness Audit Schema",
  status: "schema_object_rich_article_layout_audit_only",
  layout_audit_allowed_in_ag12a: true,
  density_audit_allowed_in_ag12a: true,
  sequence_audit_allowed_in_ag12a: true,
  caption_credit_audit_allowed_in_ag12a: true,
  mobile_static_safety_audit_allowed_in_ag12a: true,
  ag12b_boundary_allowed_in_ag12a: true,

  article_mutation_allowed_in_ag12a: false,
  object_generation_allowed_in_ag12a: false,
  object_insertion_allowed_in_ag12a: false,
  css_js_mutation_allowed_in_ag12a: false,
  data_fetch_allowed_in_ag12a: false,
  reference_url_change_allowed_in_ag12a: false,
  production_jsonl_append_allowed_in_ag12a: false,
  database_write_allowed_in_ag12a: false,
  supabase_write_allowed_in_ag12a: false,
  backend_auth_supabase_activation_allowed_in_ag12a: false,
  public_publishing_operation_allowed_in_ag12a: false,
  ...stageControls
};

const review = {
  module_id: "AG12A",
  title: "Object-Rich Article Layout and Production Readiness Audit",
  status: "object_rich_article_layout_audit_completed_refinement_recommended",
  depends_on: ["AG11Z"],
  generated_from: inputs,
  audit_report_file: "data/content-intelligence/audit-records/ag12a-object-rich-article-layout-production-readiness-audit-report.json",
  density_record_file: "data/content-intelligence/object-registry/ag12a-object-sequence-density-record.json",
  readiness_file: "data/content-intelligence/quality-registry/ag12a-layout-production-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag12a-to-ag12b-controlled-object-rich-layout-refinement-boundary.json",
  schema_file: "data/content-intelligence/schema/object-rich-article-layout-production-readiness-audit.schema.json",
  summary: {
    selected_article_path: selectedArticlePath,
    article_hash_at_ag12a: articleHash,
    object_count: objectCount,
    object_sequence_ordered: ordered,
    failed_audit_checks: failedChecks.length,
    next_stage_id: "AG12B",
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG12A",
  title: "Object-Rich Article Layout Production Readiness Audit Learning",
  status: "learning_record_only",
  learning_points: [
    "An article carrying all object families is useful as a governed capability pilot but may be too dense as a normal production article.",
    "Production density rules should decide how many object types should appear in a public article by article type and word count.",
    "AG12B should plan refinement before any final publish-readiness closure.",
    "Object-rich articles need sequence, caption, credit, mobile and density audits after insertion chains close.",
    "AG12A should remain audit-only and must not mutate the article."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG12A",
  title: "Object-Rich Article Layout and Production Readiness Audit",
  status: "object_rich_article_layout_audit_completed_refinement_recommended",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag12a-object-rich-article-layout-production-readiness-audit.json",
    audit_report: "data/content-intelligence/audit-records/ag12a-object-rich-article-layout-production-readiness-audit-report.json",
    density_record: "data/content-intelligence/object-registry/ag12a-object-sequence-density-record.json",
    readiness: "data/content-intelligence/quality-registry/ag12a-layout-production-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag12a-to-ag12b-controlled-object-rich-layout-refinement-boundary.json",
    schema: "data/content-intelligence/schema/object-rich-article-layout-production-readiness-audit.schema.json",
    learning: "data/content-intelligence/learning/ag12a-object-rich-article-layout-production-readiness-audit-learning.json",
    preview: "data/quality/ag12a-object-rich-article-layout-production-readiness-audit-preview.json",
    document: "docs/quality/AG12A_OBJECT_RICH_ARTICLE_LAYOUT_PRODUCTION_READINESS_AUDIT.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG12A",
  preview_only: true,
  status: "object_rich_article_layout_audit_completed_refinement_recommended",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag12a: articleHash,
  object_count: objectCount,
  object_density_band: objectDensityBand,
  refinement_recommended: refinementRecommended,
  next_stage: boundary,
  ...stageControls
};

const doc = `# AG12A — Object-Rich Article Layout and Production Readiness Audit

## Purpose

AG12A audits the object-rich selected article after completion of AG10 and AG11 object-family insertion cycles.

AG12A is audit only. It does not mutate articles, generate objects, insert objects, change CSS/JS, activate backend/Auth/Supabase/database systems or publish anything.

## Audit Result

The static layout audit passed with no failed checks. However, the selected article now contains all object families and is therefore classified as an object-rich pilot article.

## Object Families Audited

1. Generated image / editorial visual
2. Chart / BI graph
3. Infographic
4. Figure / diagram
5. Table / structured object
6. Map / geographic object
7. Article-support composite object

## Production Readiness Decision

Publishing remains blocked. A controlled layout refinement plan is recommended before final production/publish readiness because normal public articles should not automatically inherit this high object density.

## Next Stage

AG12B — Controlled Object-Rich Layout Refinement Plan — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(auditPath, auditReport);
writeJson(densityPath, densityRecord);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG12A object-rich article layout and production readiness audit artifacts generated.");
console.log("✅ Static layout, object sequence, object density, caption/credit and mobile safety checks completed.");
console.log(`✅ Object count audited: ${objectCount}`);
console.log("✅ Audit passed with refinement recommendation due to object-rich pilot density.");
console.log("✅ Article hash remains unchanged at AG11G post-insertion state.");
console.log("✅ No article mutation, object generation, object insertion, CSS/JS mutation, backend activation or publishing performed.");
console.log("✅ AG12B controlled object-rich layout refinement boundary created with explicit approval required.");
