import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag08kReview: "data/content-intelligence/quality-reviews/ag08k-controlled-visual-image-insertion-apply.json",
  ag08kApplyRecord: "data/content-intelligence/apply-records/ag08k-controlled-visual-image-insertion-apply.json",
  ag08kAuditPrep: "data/content-intelligence/quality-registry/ag08k-post-insertion-audit-prep.json",
  ag08kLayoutRecord: "data/content-intelligence/quality-registry/ag08k-layout-preservation-record.json",
  ag08kaAssetRecord: "data/content-intelligence/visual-registry/ag08ka-finalised-visual-asset-record.json",
  ag08gApplyRecord: "data/content-intelligence/apply-records/ag08g-one-article-controlled-apply.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag08l-post-visual-insertion-audit.json");
const auditReportPath = path.join(root, "data/content-intelligence/audit-records/ag08l-post-visual-insertion-audit-report.json");
const rollbackPath = path.join(root, "data/content-intelligence/quality-registry/ag08l-rollback-readiness-record.json");
const layoutIntegrityPath = path.join(root, "data/content-intelligence/quality-registry/ag08l-layout-visual-integrity-record.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/post-visual-insertion-audit.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag08l-post-visual-insertion-audit-learning.json");
const registryPath = path.join(root, "data/quality/ag08l-post-visual-insertion-audit.json");
const previewPath = path.join(root, "data/quality/ag08l-post-visual-insertion-audit-preview.json");
const docPath = path.join(root, "docs/quality/AG08L_POST_VISUAL_INSERTION_AUDIT.md");

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

function countOccurrences(text, needle) {
  return String(text || "").split(needle).length - 1;
}

function listHtmlFiles(dir) {
  const out = [];
  const absRoot = path.join(root, dir);
  if (!fs.existsSync(absRoot)) return out;

  function walk(absDir) {
    for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
      const abs = path.join(absDir, entry.name);
      if (entry.isDirectory()) walk(abs);
      else if (entry.isFile() && entry.name.endsWith(".html")) {
        out.push(path.relative(root, abs));
      }
    }
  }

  walk(absRoot);
  return out;
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) {
    throw new Error(`Missing required AG08L input ${name}: ${relativePath}`);
  }
}

const ag08kReview = readJson(inputs.ag08kReview);
const ag08kApply = readJson(inputs.ag08kApplyRecord);
const ag08kAuditPrep = readJson(inputs.ag08kAuditPrep);
const ag08kLayout = readJson(inputs.ag08kLayoutRecord);
const ag08kaAsset = readJson(inputs.ag08kaAssetRecord);
const ag08gApply = readJson(inputs.ag08gApplyRecord);

if (ag08kReview.status !== "controlled_visual_image_inserted_pending_post_insertion_audit") {
  throw new Error("AG08L requires AG08K review to be pending post-insertion audit.");
}

if (ag08kApply.status !== "controlled_visual_image_inserted_pending_post_insertion_audit") {
  throw new Error("AG08L requires AG08K apply record to be pending post-insertion audit.");
}

if (ag08kAuditPrep.status !== "post_visual_insertion_audit_required") {
  throw new Error("AG08L requires AG08K audit prep.");
}

const selectedArticlePath = ag08kApply.selected_article_path;
const backupPath = ag08kApply.backup_path;
const assetPath = ag08kApply.asset_path;

if (!exists(selectedArticlePath)) throw new Error(`AG08L selected article missing: ${selectedArticlePath}`);
if (!exists(backupPath)) throw new Error(`AG08L backup missing: ${backupPath}`);
if (!exists(assetPath)) throw new Error(`AG08L asset missing: ${assetPath}`);

const targetHtml = fs.readFileSync(path.join(root, selectedArticlePath), "utf8");
const backupHtml = fs.readFileSync(path.join(root, backupPath), "utf8");
const assetSvg = fs.readFileSync(path.join(root, assetPath), "utf8");

const targetHash = sha256(targetHtml);
const backupHash = sha256(backupHtml);
const assetHash = sha256(assetSvg);

const articleFilesWithAg08kMarker = listHtmlFiles("articles").filter((file) => {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  return html.includes("AG08K-HERO-VISUAL-INSERTION");
});

const hasAg03cB2Evidence =
  /AG03C-B2/i.test(targetHtml) ||
  /data-drishvara-ag03c-b2-reference-block=["']true["']/i.test(targetHtml);

const hasAg05dEvidence =
  /AG05D/i.test(targetHtml) ||
  /data-drishvara-ag05d-visible-reference-block=["']true["']/i.test(targetHtml) ||
  /drishvara-ag05d-visible-reference-block/i.test(targetHtml);

const noMutationControls = {
  post_visual_insertion_audit_only: true,
  selected_article_read_performed: true,
  backup_read_performed: true,
  asset_read_performed: true,
  new_article_mutation_performed_in_ag08l: false,
  selected_article_file_write_performed_in_ag08l: false,
  image_insertion_performed_in_ag08l: false,
  visual_generation_performed_in_ag08l: false,
  image_asset_creation_performed_in_ag08l: false,
  css_mutation_performed_in_ag08l: false,
  js_mutation_performed_in_ag08l: false,
  reference_insertion_performed_in_ag08l: false,
  reference_url_change_performed_in_ag08l: false,
  production_jsonl_append_performed_in_ag08l: false,
  database_write_performed_in_ag08l: false,
  supabase_write_performed_in_ag08l: false,
  backend_auth_supabase_activation_performed_in_ag08l: false,
  public_publishing_performed_in_ag08l: false,
  publishing_approval_performed_in_ag08l: false,
  rollback_execution_performed_in_ag08l: false
};

const backupIntegrity = {
  backup_exists: true,
  backup_path: backupPath,
  backup_hash_current: backupHash,
  backup_hash_recorded: ag08kApply.backup_hash,
  pre_insertion_hash_recorded: ag08kApply.pre_insertion_hash,
  backup_matches_recorded_backup_hash: backupHash === ag08kApply.backup_hash,
  backup_matches_pre_insertion_hash: backupHash === ag08kApply.pre_insertion_hash,
  backup_matches_ag08g_post_apply_hash: backupHash === ag08gApply.post_apply_hash,
  backup_has_no_ag08k_marker: !backupHtml.includes("AG08K-HERO-VISUAL-INSERTION"),
  backup_integrity_status:
    backupHash === ag08kApply.backup_hash &&
    backupHash === ag08kApply.pre_insertion_hash &&
    backupHash === ag08gApply.post_apply_hash &&
    !backupHtml.includes("AG08K-HERO-VISUAL-INSERTION")
      ? "passed"
      : "failed"
};

const visualScope = {
  selected_article_path: selectedArticlePath,
  target_hash_current: targetHash,
  post_insertion_hash_recorded: ag08kApply.post_insertion_hash,
  target_matches_ag08k_post_insertion_hash: targetHash === ag08kApply.post_insertion_hash,
  target_differs_from_backup: targetHash !== backupHash,
  ag08k_marker_count_in_target: countOccurrences(targetHtml, "AG08K-HERO-VISUAL-INSERTION"),
  ag08k_hero_block_id_count: countOccurrences(targetHtml, 'id="ag08k-hero-visual-block"'),
  article_files_with_ag08k_marker: articleFilesWithAg08kMarker,
  exactly_one_article_contains_ag08k_marker:
    articleFilesWithAg08kMarker.length === 1 && articleFilesWithAg08kMarker[0] === selectedArticlePath,
  visual_scope_status:
    targetHash === ag08kApply.post_insertion_hash &&
    targetHash !== backupHash &&
    countOccurrences(targetHtml, "AG08K-HERO-VISUAL-INSERTION") === 1 &&
    countOccurrences(targetHtml, 'id="ag08k-hero-visual-block"') === 1 &&
    articleFilesWithAg08kMarker.length === 1 &&
    articleFilesWithAg08kMarker[0] === selectedArticlePath
      ? "passed"
      : "failed"
};

const assetMetadataAudit = {
  asset_path: assetPath,
  asset_src_inserted: ag08kApply.asset_src_inserted,
  asset_hash_current: assetHash,
  asset_hash_recorded_in_ag08k: ag08kApply.asset_hash_sha256,
  asset_hash_recorded_in_ag08ka: ag08kaAsset.asset.asset_hash_sha256,
  target_contains_asset_src: targetHtml.includes(ag08kApply.asset_src_inserted),
  target_contains_alt_text: targetHtml.includes(ag08kApply.inserted_alt_text),
  target_contains_caption: targetHtml.includes(ag08kApply.inserted_caption),
  target_contains_credit: targetHtml.includes(ag08kApply.inserted_credit),
  svg_has_title: assetSvg.includes("<title"),
  svg_has_description: assetSvg.includes("<desc"),
  asset_metadata_status:
    assetHash === ag08kApply.asset_hash_sha256 &&
    assetHash === ag08kaAsset.asset.asset_hash_sha256 &&
    targetHtml.includes(ag08kApply.asset_src_inserted) &&
    targetHtml.includes(ag08kApply.inserted_alt_text) &&
    targetHtml.includes(ag08kApply.inserted_caption) &&
    targetHtml.includes(ag08kApply.inserted_credit) &&
    assetSvg.includes("<title") &&
    assetSvg.includes("<desc")
      ? "passed"
      : "failed"
};

const governancePreservation = {
  ag08g_marker_count: countOccurrences(targetHtml, "AG08G-CONTROLLED-APPLY"),
  ag08g_reference_marker_count: countOccurrences(targetHtml, "AG08G-APPROVED-REFERENCES"),
  ag08g_legacy_marker_count: countOccurrences(targetHtml, "AG08G-LEGACY-GOVERNANCE-PRESERVED"),
  ag03c_b2_evidence_present: hasAg03cB2Evidence,
  ag05d_evidence_present: hasAg05dEvidence,
  governance_preservation_status:
    countOccurrences(targetHtml, "AG08G-CONTROLLED-APPLY") === 1 &&
    countOccurrences(targetHtml, "AG08G-APPROVED-REFERENCES") === 1 &&
    countOccurrences(targetHtml, "AG08G-LEGACY-GOVERNANCE-PRESERVED") === 1 &&
    hasAg03cB2Evidence &&
    hasAg05dEvidence
      ? "passed"
      : "failed"
};

const layoutIntegrity = {
  module_id: "AG08L",
  title: "Layout and Visual Integrity Record",
  status: "layout_visual_integrity_audited",
  selected_article_path: selectedArticlePath,
  source_layout_record_status: ag08kLayout.status,
  inserted_block_id: "ag08k-hero-visual-block",
  hero_visual_centered_requirement_recorded: ag08kLayout.article_shape_preservation.hero_image_centered_in_reading_column === true,
  article_shape_preservation_required: ag08kLayout.article_shape_preservation.preserve_article_shape_required === true,
  justified_text_preservation_required: ag08kLayout.article_shape_preservation.preserve_justified_text_required === true,
  hero_visual_does_not_require_text_wrap: ag08kLayout.article_shape_preservation.text_wrap_required === false,
  width_height_declared: targetHtml.includes('width="1600"') && targetHtml.includes('height="900"'),
  figure_block_present: targetHtml.includes("<figure") && targetHtml.includes("ag08k-hero-visual-block"),
  figcaption_present: targetHtml.includes("<figcaption>"),
  credit_present: targetHtml.includes("drishvara-visual-credit"),
  no_table_graph_or_wrapped_object_inserted_in_ag08k: ag08kLayout.article_shape_preservation.no_table_or_graph_wrap_added === true,
  layout_integrity_status:
    ag08kLayout.article_shape_preservation.hero_image_centered_in_reading_column === true &&
    ag08kLayout.article_shape_preservation.preserve_article_shape_required === true &&
    ag08kLayout.article_shape_preservation.preserve_justified_text_required === true &&
    ag08kLayout.article_shape_preservation.text_wrap_required === false &&
    targetHtml.includes('width="1600"') &&
    targetHtml.includes('height="900"') &&
    targetHtml.includes("<figure") &&
    targetHtml.includes("ag08k-hero-visual-block") &&
    targetHtml.includes("<figcaption>") &&
    targetHtml.includes("drishvara-visual-credit")
      ? "passed"
      : "failed",
  ...noMutationControls
};

const forbiddenSystemGuards = {
  external_gpt_image_generation_performed_in_ag08k: ag08kApply.external_gpt_image_generation_performed_in_ag08k,
  external_image_api_call_performed_in_ag08k: ag08kApply.external_image_api_call_performed_in_ag08k,
  new_visual_asset_created_in_ag08k: ag08kApply.new_visual_asset_created_in_ag08k,
  css_mutation_performed_in_ag08k: ag08kApply.css_mutation_performed_in_ag08k,
  js_mutation_performed_in_ag08k: ag08kApply.js_mutation_performed_in_ag08k,
  reference_insertion_performed_in_ag08k: ag08kApply.reference_insertion_performed_in_ag08k,
  reference_url_change_performed_in_ag08k: ag08kApply.reference_url_change_performed_in_ag08k,
  production_jsonl_append_performed_in_ag08k: ag08kApply.production_jsonl_append_performed_in_ag08k,
  database_write_performed_in_ag08k: ag08kApply.database_write_performed_in_ag08k,
  supabase_write_performed_in_ag08k: ag08kApply.supabase_write_performed_in_ag08k,
  backend_auth_supabase_activation_performed_in_ag08k: ag08kApply.backend_auth_supabase_activation_performed_in_ag08k,
  public_publishing_performed_in_ag08k: ag08kApply.public_publishing_performed_in_ag08k,
  forbidden_system_guard_status:
    ag08kApply.external_gpt_image_generation_performed_in_ag08k === false &&
    ag08kApply.external_image_api_call_performed_in_ag08k === false &&
    ag08kApply.new_visual_asset_created_in_ag08k === false &&
    ag08kApply.css_mutation_performed_in_ag08k === false &&
    ag08kApply.js_mutation_performed_in_ag08k === false &&
    ag08kApply.reference_insertion_performed_in_ag08k === false &&
    ag08kApply.reference_url_change_performed_in_ag08k === false &&
    ag08kApply.production_jsonl_append_performed_in_ag08k === false &&
    ag08kApply.database_write_performed_in_ag08k === false &&
    ag08kApply.supabase_write_performed_in_ag08k === false &&
    ag08kApply.backend_auth_supabase_activation_performed_in_ag08k === false &&
    ag08kApply.public_publishing_performed_in_ag08k === false
      ? "passed"
      : "failed"
};

const rollbackReadiness = {
  rollback_ready: backupIntegrity.backup_integrity_status === "passed",
  rollback_source: backupPath,
  rollback_target: selectedArticlePath,
  expected_restore_hash: backupHash,
  current_target_hash: targetHash,
  rollback_execution_performed: false,
  rollback_validation_steps: [
    "Copy AG08K backup file to selected article path.",
    "Confirm selected article hash equals AG08K backup hash.",
    "Confirm AG08K hero visual marker is absent after rollback.",
    "Confirm AG08G marker and reference blocks remain as pre-visual AG08G state.",
    "Run validate:project after rollback."
  ]
};

const auditChecks = [
  {
    check_id: "AG08L-CHECK-001",
    name: "ag08k_apply_consumed",
    status: ag08kApply.status === "controlled_visual_image_inserted_pending_post_insertion_audit" ? "passed" : "failed",
    evidence: ag08kApply.status
  },
  {
    check_id: "AG08L-CHECK-002",
    name: "backup_integrity",
    status: backupIntegrity.backup_integrity_status,
    evidence: backupIntegrity
  },
  {
    check_id: "AG08L-CHECK-003",
    name: "visual_insertion_scope",
    status: visualScope.visual_scope_status,
    evidence: visualScope
  },
  {
    check_id: "AG08L-CHECK-004",
    name: "asset_metadata",
    status: assetMetadataAudit.asset_metadata_status,
    evidence: assetMetadataAudit
  },
  {
    check_id: "AG08L-CHECK-005",
    name: "layout_integrity",
    status: layoutIntegrity.layout_integrity_status,
    evidence: layoutIntegrity
  },
  {
    check_id: "AG08L-CHECK-006",
    name: "governance_preservation",
    status: governancePreservation.governance_preservation_status,
    evidence: governancePreservation
  },
  {
    check_id: "AG08L-CHECK-007",
    name: "forbidden_system_guards",
    status: forbiddenSystemGuards.forbidden_system_guard_status,
    evidence: forbiddenSystemGuards
  },
  {
    check_id: "AG08L-CHECK-008",
    name: "rollback_readiness",
    status: rollbackReadiness.rollback_ready ? "passed" : "failed",
    evidence: rollbackReadiness
  }
];

const auditStatus = auditChecks.every((check) => check.status === "passed")
  ? "post_visual_insertion_audit_passed"
  : "post_visual_insertion_audit_review_required";

const summary = {
  selected_article_path: selectedArticlePath,
  backup_path: backupPath,
  asset_path: assetPath,
  audit_status: auditStatus,
  backup_integrity_status: backupIntegrity.backup_integrity_status,
  visual_scope_status: visualScope.visual_scope_status,
  asset_metadata_status: assetMetadataAudit.asset_metadata_status,
  layout_integrity_status: layoutIntegrity.layout_integrity_status,
  governance_preservation_status: governancePreservation.governance_preservation_status,
  forbidden_system_guard_status: forbiddenSystemGuards.forbidden_system_guard_status,
  rollback_ready: rollbackReadiness.rollback_ready,
  production_readiness_after_ag08l:
    auditStatus === "post_visual_insertion_audit_passed"
      ? "visual_insertion_audited"
      : "visual_insertion_audit_review_required",
  publish_readiness_after_ag08l: "static_file_changed_not_publish_approved",
  next_stage_id: "AG08Z",
  next_stage_title: "Repeatable Article Upgrade Cycle Closure",
  next_stage_requires_explicit_approval: true,
  ...noMutationControls
};

const auditReport = {
  module_id: "AG08L",
  title: "Post-Visual-Insertion Audit Report",
  status: auditStatus,
  selected_article_path: selectedArticlePath,
  backup_path: backupPath,
  asset_path: assetPath,
  generated_from: inputs,
  backup_integrity: backupIntegrity,
  visual_scope: visualScope,
  asset_metadata_audit: assetMetadataAudit,
  layout_integrity: layoutIntegrity,
  governance_preservation: governancePreservation,
  forbidden_system_guards: forbiddenSystemGuards,
  rollback_readiness: rollbackReadiness,
  audit_checks: auditChecks,
  ...noMutationControls
};

const rollbackRecord = {
  module_id: "AG08L",
  title: "Rollback Readiness Record",
  status: rollbackReadiness.rollback_ready ? "rollback_ready_not_executed" : "rollback_not_ready",
  selected_article_path: selectedArticlePath,
  backup_path: backupPath,
  rollback_readiness: rollbackReadiness,
  backup_integrity: backupIntegrity,
  rollback_execution_performed: false,
  ...noMutationControls
};

const schema = {
  module_id: "AG08L",
  title: "Post-Visual-Insertion Audit Schema",
  status: "schema_post_visual_insertion_audit_only",
  audit_backup_integrity_allowed_in_ag08l: true,
  audit_visual_scope_allowed_in_ag08l: true,
  audit_asset_metadata_allowed_in_ag08l: true,
  audit_layout_integrity_allowed_in_ag08l: true,
  audit_governance_preservation_allowed_in_ag08l: true,
  audit_forbidden_system_guards_allowed_in_ag08l: true,
  audit_rollback_readiness_allowed_in_ag08l: true,
  article_mutation_allowed_in_ag08l: false,
  selected_article_file_write_allowed_in_ag08l: false,
  image_insertion_allowed_in_ag08l: false,
  visual_generation_allowed_in_ag08l: false,
  image_asset_creation_allowed_in_ag08l: false,
  css_js_mutation_allowed_in_ag08l: false,
  reference_insertion_allowed_in_ag08l: false,
  reference_url_change_allowed_in_ag08l: false,
  production_jsonl_append_allowed_in_ag08l: false,
  database_write_allowed_in_ag08l: false,
  supabase_write_allowed_in_ag08l: false,
  backend_auth_supabase_activation_allowed_in_ag08l: false,
  publishing_allowed_in_ag08l: false,
  rollback_execution_allowed_in_ag08l: false,
  ...noMutationControls
};

const review = {
  module_id: "AG08L",
  title: "Post-Visual-Insertion Audit",
  status: auditStatus,
  depends_on: ["AG08K", "AG08K-A", "AG08J", "AG08G"],
  generated_from: inputs,
  summary,
  audit_report_file: "data/content-intelligence/audit-records/ag08l-post-visual-insertion-audit-report.json",
  rollback_readiness_file: "data/content-intelligence/quality-registry/ag08l-rollback-readiness-record.json",
  layout_visual_integrity_file: "data/content-intelligence/quality-registry/ag08l-layout-visual-integrity-record.json",
  schema_file: "data/content-intelligence/schema/post-visual-insertion-audit.schema.json",
  learning_file: "data/content-intelligence/learning/ag08l-post-visual-insertion-audit-learning.json",
  closure_decision: {
    decision:
      auditStatus === "post_visual_insertion_audit_passed"
        ? "ag08k_visual_insertion_audited_pending_cycle_closure"
        : "ag08k_visual_insertion_audit_review_required",
    proceed_to_ag08z_only_with_explicit_user_approval: true,
    selected_article_path: selectedArticlePath,
    article_mutation_performed_in_ag08l: false,
    image_insertion_performed_in_ag08l: false,
    visual_generation_performed_in_ag08l: false,
    css_mutation_performed_in_ag08l: false,
    js_mutation_performed_in_ag08l: false,
    reference_insertion_performed_in_ag08l: false,
    production_jsonl_append_performed_in_ag08l: false,
    database_write_performed_in_ag08l: false,
    supabase_write_performed_in_ag08l: false,
    backend_auth_supabase_activation_performed_in_ag08l: false,
    public_publishing_performed_in_ag08l: false,
    production_readiness: summary.production_readiness_after_ag08l,
    publish_readiness: summary.publish_readiness_after_ag08l
  },
  ...noMutationControls
};

const learning = {
  module_id: "AG08L",
  title: "Post-Visual-Insertion Audit Learning",
  status: "learning_record_only",
  summary,
  ag08l_learning_points: [
    "Visual insertion audit must validate the inserted visual path, hash, alt text, caption and visible credit.",
    "Fresh visual-insertion backup is separate from AG08G text/reference backup.",
    "Hero visual insertion is safer as a first visual apply than inline graph/table insertion.",
    "Layout preservation should be audited as a first-class quality gate.",
    "Cycle closure should remain blocked until post-visual-insertion audit passes."
  ],
  ...noMutationControls
};

const registry = {
  module_id: "AG08L",
  title: "Post-Visual-Insertion Audit",
  status: auditStatus,
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag08l-post-visual-insertion-audit.json",
    audit_report: "data/content-intelligence/audit-records/ag08l-post-visual-insertion-audit-report.json",
    rollback_readiness: "data/content-intelligence/quality-registry/ag08l-rollback-readiness-record.json",
    layout_visual_integrity: "data/content-intelligence/quality-registry/ag08l-layout-visual-integrity-record.json",
    schema: "data/content-intelligence/schema/post-visual-insertion-audit.schema.json",
    learning: "data/content-intelligence/learning/ag08l-post-visual-insertion-audit-learning.json",
    preview: "data/quality/ag08l-post-visual-insertion-audit-preview.json",
    document: "docs/quality/AG08L_POST_VISUAL_INSERTION_AUDIT.md"
  },
  summary,
  ...noMutationControls
};

const preview = {
  module_id: "AG08L",
  preview_only: true,
  status: auditStatus,
  summary,
  audit_checks: auditChecks,
  backup_integrity: backupIntegrity,
  visual_scope: visualScope,
  asset_metadata_audit: assetMetadataAudit,
  layout_integrity: {
    status: layoutIntegrity.layout_integrity_status,
    inserted_block_id: layoutIntegrity.inserted_block_id,
    article_shape_preservation_required: layoutIntegrity.article_shape_preservation_required,
    justified_text_preservation_required: layoutIntegrity.justified_text_preservation_required
  },
  governance_preservation: governancePreservation,
  rollback_readiness: rollbackReadiness,
  next_stage: {
    next_stage_id: "AG08Z",
    next_stage_title: "Repeatable Article Upgrade Cycle Closure",
    explicit_approval_required: true
  },
  ...noMutationControls
};

const doc = `# AG08L — Post-Visual-Insertion Audit

## Purpose

AG08L audits the AG08K controlled visual image insertion.

AG08L is audit-only. It does not mutate the article, insert another image, generate a visual, edit CSS/JS, change references, append JSONL records, write to database/Supabase, activate backend/Auth/Supabase, publish, approve publishing or execute rollback.

## Target Article

- Path: \`${selectedArticlePath}\`
- Current hash: \`${targetHash}\`
- Backup: \`${backupPath}\`
- Asset: \`${assetPath}\`

## Audit Result

- Overall: \`${auditStatus}\`
- Backup integrity: \`${backupIntegrity.backup_integrity_status}\`
- Visual scope: \`${visualScope.visual_scope_status}\`
- Asset metadata: \`${assetMetadataAudit.asset_metadata_status}\`
- Layout integrity: \`${layoutIntegrity.layout_integrity_status}\`
- Governance preservation: \`${governancePreservation.governance_preservation_status}\`
- Forbidden-system guards: \`${forbiddenSystemGuards.forbidden_system_guard_status}\`
- Rollback ready: \`${rollbackReadiness.rollback_ready}\`

## Next Stage

AG08Z — Repeatable Article Upgrade Cycle Closure — is recommended only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(auditReportPath, auditReport);
writeJson(rollbackPath, rollbackRecord);
writeJson(layoutIntegrityPath, layoutIntegrity);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG08L post-visual-insertion audit artifacts generated.");
console.log(`✅ Audit target: ${selectedArticlePath}`);
console.log(`✅ Audit status: ${auditStatus}`);
console.log(`✅ Rollback ready: ${rollbackReadiness.rollback_ready}`);
