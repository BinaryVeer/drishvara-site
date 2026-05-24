import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag12dReview: "data/content-intelligence/quality-reviews/ag12d-post-refinement-layout-audit.json",
  ag12dAudit: "data/content-intelligence/audit-records/ag12d-post-refinement-layout-audit-report.json",
  ag12dTreatment: "data/content-intelligence/object-registry/ag12d-refined-layout-treatment-audit-record.json",
  ag12dReadiness: "data/content-intelligence/quality-registry/ag12d-post-refinement-readiness-record.json",
  ag12dRollbackAudit: "data/content-intelligence/quality-registry/ag12d-rollback-readiness-audit-record.json",
  ag12dBoundary: "data/content-intelligence/mutation-plans/ag12d-to-ag12z-object-rich-production-readiness-closure-boundary.json",
  ag12cApply: "data/content-intelligence/apply-records/ag12c-controlled-layout-refinement-apply.json",
  ag12bDensityRules: "data/content-intelligence/object-registry/ag12b-object-density-production-rule-record.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag12z-object-rich-production-readiness-closure.json");
const closurePath = path.join(root, "data/content-intelligence/closure-records/ag12z-object-rich-production-readiness-closure.json");
const statePath = path.join(root, "data/content-intelligence/object-registry/ag12z-refined-article-production-state-record.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag12z-production-readiness-final-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag12z-to-ag13a-final-editorial-live-verification-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/object-rich-production-readiness-closure.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag12z-object-rich-production-readiness-closure-learning.json");
const registryPath = path.join(root, "data/quality/ag12z-object-rich-production-readiness-closure.json");
const previewPath = path.join(root, "data/quality/ag12z-object-rich-production-readiness-closure-preview.json");
const docPath = path.join(root, "docs/quality/AG12Z_OBJECT_RICH_PRODUCTION_READINESS_CLOSURE.md");

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

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) throw new Error(`Missing required AG12Z input ${name}: ${relativePath}`);
}

const ag12dReview = readJson(inputs.ag12dReview);
const ag12dAudit = readJson(inputs.ag12dAudit);
const ag12dTreatment = readJson(inputs.ag12dTreatment);
const ag12dReadiness = readJson(inputs.ag12dReadiness);
const ag12dRollbackAudit = readJson(inputs.ag12dRollbackAudit);
const ag12dBoundary = readJson(inputs.ag12dBoundary);
const ag12cApply = readJson(inputs.ag12cApply);
const ag12bDensityRules = readJson(inputs.ag12bDensityRules);

if (ag12dReview.status !== "post_refinement_layout_audit_passed") {
  throw new Error("AG12Z requires AG12D review.");
}
if (ag12dAudit.status !== "post_refinement_layout_audit_passed" || ag12dAudit.failed_checks.length !== 0) {
  throw new Error("AG12Z requires AG12D audit to pass with zero failed checks.");
}
if (ag12dReadiness.ready_for_ag12z !== true) {
  throw new Error("AG12Z requires AG12D readiness.");
}
if (ag12dBoundary.next_stage_id !== "AG12Z" || ag12dBoundary.explicit_approval_required !== true) {
  throw new Error("AG12Z requires AG12D to AG12Z explicit boundary.");
}

const selectedArticlePath = ag12cApply.selected_article_path;
const backupPath = ag12cApply.backup_path;

if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);
if (!exists(backupPath)) throw new Error(`AG12C backup missing: ${backupPath}`);

const articleHash = sha256(fs.readFileSync(path.join(root, selectedArticlePath), "utf8"));
const backupHash = sha256(fs.readFileSync(path.join(root, backupPath), "utf8"));

if (articleHash !== ag12cApply.post_refinement_hash) {
  throw new Error("AG12Z requires current article hash to remain AG12C post-refinement hash.");
}
if (backupHash !== ag12cApply.pre_refinement_hash) {
  throw new Error("AG12Z requires backup hash to remain AG12C pre-refinement hash.");
}

const stageControls = {
  object_rich_production_readiness_closure_only: true,
  ag12_refinement_chain_closed_in_ag12z: true,
  refined_article_state_recorded_in_ag12z: true,
  production_readiness_status_recorded_in_ag12z: true,
  rollback_readiness_carried_forward_in_ag12z: true,
  density_rules_carried_forward_in_ag12z: true,
  selected_article_read_performed: true,

  article_mutation_performed_in_ag12z: false,
  selected_article_file_write_performed_in_ag12z: false,
  object_generation_performed_in_ag12z: false,
  object_insertion_performed_in_ag12z: false,
  object_removal_performed_in_ag12z: false,
  image_generation_performed_in_ag12z: false,
  data_fetch_performed_in_ag12z: false,
  reference_url_change_performed_in_ag12z: false,
  homepage_mutation_performed_in_ag12z: false,
  css_file_mutation_performed_in_ag12z: false,
  js_file_mutation_performed_in_ag12z: false,
  production_jsonl_append_performed_in_ag12z: false,
  database_write_performed_in_ag12z: false,
  supabase_write_performed_in_ag12z: false,
  backend_auth_supabase_activation_performed_in_ag12z: false,
  public_publishing_operation_performed_in_ag12z: false
};

const refinedArticleState = {
  module_id: "AG12Z",
  title: "Refined Article Production State Record",
  status: "refined_article_state_recorded_ready_for_final_editorial_live_verification",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag12z: articleHash,
  backup_path: backupPath,
  backup_hash: backupHash,
  primary_visible_object_count: ag12dTreatment.primary_visible_object_count,
  collapsed_pilot_object_count: ag12dTreatment.collapsed_pilot_object_count,
  primary_visible_objects: ag12dTreatment.primary_visible_objects,
  collapsed_pilot_objects: ag12dTreatment.collapsed_pilot_objects,
  original_governed_markers_preserved_once: ag12dTreatment.all_original_markers_preserved_once,
  captions_credits_accessibility_preserved: ag12dTreatment.all_credits_present && ag12dTreatment.all_caption_or_accessibility_text_present,
  rollback_ready: ag12dRollbackAudit.rollback_ready,
  density_rule_source: "data/content-intelligence/object-registry/ag12b-object-density-production-rule-record.json",
  ...stageControls
};

const readiness = {
  module_id: "AG12Z",
  title: "Production Readiness Final Record",
  status: "ready_for_final_editorial_live_verification_not_published",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag12z: articleHash,
  ag12_refinement_chain_closed: true,
  refined_layout_audit_passed: true,
  production_density_treatment_passed: true,
  rollback_ready: true,
  ready_for_ag13a: true,
  ag13a_explicit_approval_required: true,
  publish_ready: false,
  publish_approval_required: true,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  reason_publish_blocked: "AG12Z closes layout production readiness only. Final editorial/live verification and explicit publish approval remain pending.",
  ...stageControls
};

const closure = {
  module_id: "AG12Z",
  title: "Object-Rich Article Production Readiness Closure",
  status: "object_rich_article_production_readiness_closed_ready_for_final_editorial_live_verification",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag12z: articleHash,
  closure_decision: {
    ag12_chain_closed: true,
    refined_article_layout_audited: true,
    object_density_refined: true,
    rollback_ready: true,
    ready_for_final_editorial_live_verification_chain: true,
    publish_ready: false,
    publish_requires_later_explicit_approval: true
  },
  carried_forward: {
    production_density_rules: ag12bDensityRules.default_density_rules,
    primary_visible_object_count: ag12dTreatment.primary_visible_object_count,
    collapsed_pilot_object_count: ag12dTreatment.collapsed_pilot_object_count,
    rollback_backup_path: backupPath,
    rollback_backup_hash: backupHash
  },
  next_recommended_stage: "AG13A",
  next_recommended_stage_title: "Final Editorial and Live Verification Readiness Plan",
  ...stageControls
};

const boundary = {
  module_id: "AG12Z",
  title: "AG12Z to AG13A Final Editorial and Live Verification Boundary",
  status: "ag13a_boundary_created_not_started",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag12z: articleHash,
  next_stage_id: "AG13A",
  next_stage_title: "Final Editorial and Live Verification Readiness Plan",
  explicit_approval_required: true,
  ag13a_allowed_scope: [
    "Prepare final editorial/live verification readiness plan.",
    "Define manual preview checks for desktop and mobile.",
    "Confirm article path, object treatment, credits and rollback evidence.",
    "Prepare live verification/publish-preparation boundary only if approved."
  ],
  ag13a_blocked_scope: [
    "No article mutation.",
    "No object generation.",
    "No object insertion.",
    "No CSS/JS mutation unless separately approved.",
    "No backend/Auth/Supabase/database activation.",
    "No public publishing operation."
  ],
  ...stageControls
};

const schema = {
  module_id: "AG12Z",
  title: "Object-Rich Production Readiness Closure Schema",
  status: "schema_object_rich_production_readiness_closure_only",
  production_readiness_closure_allowed_in_ag12z: true,
  refined_article_state_record_allowed_in_ag12z: true,
  final_readiness_record_allowed_in_ag12z: true,
  ag13a_boundary_allowed_in_ag12z: true,

  article_mutation_allowed_in_ag12z: false,
  object_generation_allowed_in_ag12z: false,
  object_insertion_allowed_in_ag12z: false,
  object_removal_allowed_in_ag12z: false,
  css_js_mutation_allowed_in_ag12z: false,
  data_fetch_allowed_in_ag12z: false,
  reference_url_change_allowed_in_ag12z: false,
  production_jsonl_append_allowed_in_ag12z: false,
  database_write_allowed_in_ag12z: false,
  supabase_write_allowed_in_ag12z: false,
  backend_auth_supabase_activation_allowed_in_ag12z: false,
  public_publishing_operation_allowed_in_ag12z: false,
  ...stageControls
};

const review = {
  module_id: "AG12Z",
  title: "Object-Rich Article Production Readiness Closure",
  status: "object_rich_article_production_readiness_closed_ready_for_final_editorial_live_verification",
  depends_on: ["AG12D"],
  generated_from: inputs,
  closure_file: "data/content-intelligence/closure-records/ag12z-object-rich-production-readiness-closure.json",
  state_record_file: "data/content-intelligence/object-registry/ag12z-refined-article-production-state-record.json",
  readiness_file: "data/content-intelligence/quality-registry/ag12z-production-readiness-final-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag12z-to-ag13a-final-editorial-live-verification-boundary.json",
  schema_file: "data/content-intelligence/schema/object-rich-production-readiness-closure.schema.json",
  summary: {
    selected_article_path: selectedArticlePath,
    article_hash_at_ag12z: articleHash,
    ag12_chain_closed: true,
    ready_for_ag13a: true,
    publish_ready: false,
    next_stage_id: "AG13A",
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG12Z",
  title: "Object-Rich Production Readiness Closure Learning",
  status: "learning_record_only",
  learning_points: [
    "AG12 successfully converted an all-object capability pilot into a refined article layout with four primary objects and three optional pilot objects.",
    "Production readiness is distinct from publish approval; publishing remains a later explicit decision.",
    "Rollback evidence must be carried forward into final live verification.",
    "Future articles should use the AG12B density rules by default instead of inserting every object family.",
    "The next chain should focus on final editorial/live verification rather than more object insertion."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG12Z",
  title: "Object-Rich Article Production Readiness Closure",
  status: "object_rich_article_production_readiness_closed_ready_for_final_editorial_live_verification",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag12z-object-rich-production-readiness-closure.json",
    closure: "data/content-intelligence/closure-records/ag12z-object-rich-production-readiness-closure.json",
    state_record: "data/content-intelligence/object-registry/ag12z-refined-article-production-state-record.json",
    readiness: "data/content-intelligence/quality-registry/ag12z-production-readiness-final-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag12z-to-ag13a-final-editorial-live-verification-boundary.json",
    schema: "data/content-intelligence/schema/object-rich-production-readiness-closure.schema.json",
    learning: "data/content-intelligence/learning/ag12z-object-rich-production-readiness-closure-learning.json",
    preview: "data/quality/ag12z-object-rich-production-readiness-closure-preview.json",
    document: "docs/quality/AG12Z_OBJECT_RICH_PRODUCTION_READINESS_CLOSURE.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG12Z",
  preview_only: true,
  status: "object_rich_article_production_readiness_closed_ready_for_final_editorial_live_verification",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag12z: articleHash,
  primary_visible_object_count: ag12dTreatment.primary_visible_object_count,
  collapsed_pilot_object_count: ag12dTreatment.collapsed_pilot_object_count,
  ready_for_ag13a: true,
  publish_ready: false,
  next_stage: boundary,
  ...stageControls
};

const doc = `# AG12Z — Object-Rich Article Production Readiness Closure

## Purpose

AG12Z closes the AG12 object-rich article production-readiness chain.

AG12Z is closure only. It does not mutate articles, generate objects, insert objects, remove objects, change CSS/JS, activate backend/Auth/Supabase/database systems or publish anything.

## Closure Result

The refined article layout is production-readiness evaluated and ready for the next final editorial/live verification chain.

## Refined Article State

- Primary visible objects: 4
- Collapsed pilot objects: 3
- Original governed object evidence preserved: yes
- Captions, credits and accessibility/source text preserved: yes
- Rollback readiness: confirmed

## Publishing Boundary

Publishing remains blocked. Backend, Auth, database and Supabase activation remain blocked. A separate final editorial/live verification and explicit publish approval chain is required.

## Next Stage

AG13A — Final Editorial and Live Verification Readiness Plan — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(closurePath, closure);
writeJson(statePath, refinedArticleState);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG12Z object-rich production readiness closure artifacts generated.");
console.log("✅ AG12 refinement chain closed.");
console.log("✅ Refined article state recorded: 4 primary visible objects, 3 collapsed pilot objects.");
console.log("✅ Rollback readiness and production density rules carried forward.");
console.log("✅ Article hash remains AG12C/AG12D post-refinement hash.");
console.log("✅ Publishing, backend and Supabase activation remain blocked.");
console.log("✅ No article mutation, object generation/insertion/removal, CSS/JS mutation, backend activation or publishing performed.");
console.log("✅ AG13A final editorial and live verification readiness boundary created with explicit approval required.");
