import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag08gReview: "data/content-intelligence/quality-reviews/ag08g-one-article-controlled-apply.json",
  ag08gApplyRecord: "data/content-intelligence/apply-records/ag08g-one-article-controlled-apply.json",
  ag08gAuditPrep: "data/content-intelligence/quality-registry/ag08g-post-apply-audit-prep.json",
  ag08gSchema: "data/content-intelligence/schema/one-article-controlled-apply-ag08g.schema.json",
  ag08gLearning: "data/content-intelligence/learning/ag08g-one-article-controlled-apply-learning.json",
  ag08fApproval: "data/content-intelligence/approval-registry/ag08f-draft-reference-approval-record.json",
  ag08fApplyPlan: "data/content-intelligence/mutation-plans/ag08f-controlled-apply-plan.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag08h-post-apply-audit.json");
const auditReportPath = path.join(root, "data/content-intelligence/audit-records/ag08h-post-apply-audit-report.json");
const rollbackPath = path.join(root, "data/content-intelligence/quality-registry/ag08h-rollback-readiness-record.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/post-apply-audit-ag08h.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag08h-post-apply-audit-learning.json");
const registryPath = path.join(root, "data/quality/ag08h-post-apply-audit.json");
const previewPath = path.join(root, "data/quality/ag08h-post-apply-audit-preview.json");
const docPath = path.join(root, "docs/quality/AG08H_POST_APPLY_AUDIT.md");

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
    throw new Error(`Missing required AG08H input ${name}: ${relativePath}`);
  }
}

const ag08gReview = readJson(inputs.ag08gReview);
const ag08gApply = readJson(inputs.ag08gApplyRecord);
const ag08gAuditPrep = readJson(inputs.ag08gAuditPrep);
const ag08gSchema = readJson(inputs.ag08gSchema);
const ag08gLearning = readJson(inputs.ag08gLearning);
const ag08fApproval = readJson(inputs.ag08fApproval);
const ag08fApplyPlan = readJson(inputs.ag08fApplyPlan);

const selectedArticlePath = ag08gApply.selected_article_path;
const backupPath = ag08gApply.backup_path;

if (!selectedArticlePath) throw new Error("AG08H selected article path missing from AG08G apply record.");
if (!backupPath) throw new Error("AG08H backup path missing from AG08G apply record.");
if (!exists(selectedArticlePath)) throw new Error(`AG08H selected article missing: ${selectedArticlePath}`);
if (!exists(backupPath)) throw new Error(`AG08H backup missing: ${backupPath}`);

const articleHtml = fs.readFileSync(path.join(root, selectedArticlePath), "utf8");
const backupHtml = fs.readFileSync(path.join(root, backupPath), "utf8");
const currentArticleHash = sha256(articleHtml);
const currentBackupHash = sha256(backupHtml);

const allArticleFiles = listHtmlFiles("articles");
const articleFilesWithAg08gMarker = allArticleFiles.filter((file) => {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  return html.includes("AG08G-CONTROLLED-APPLY");
});

const approvedReferences = ag08fApproval.reference_approval?.approved_references || [];
const insertedReferenceChecks = approvedReferences.map((ref) => ({
  reference_id: ref.reference_id,
  title: ref.title,
  url: ref.url,
  approved_in_ag08f: ref.approval_status === "approved_for_ag08g_insertion",
  inserted_in_target_article: articleHtml.includes(ref.url),
  inserted_status: articleHtml.includes(ref.url) ? "present" : "missing"
}));

const hasLegacyMarker = articleHtml.includes("AG08G-LEGACY-GOVERNANCE-PRESERVED");
const hasAg03cB2Evidence =
  /AG03C-B2/i.test(articleHtml) ||
  /data-drishvara-ag03c-b2-reference-block=["']true["']/i.test(articleHtml);

const hasAg05dEvidence =
  /AG05D/i.test(articleHtml) ||
  /data-drishvara-ag05d-visible-reference-block=["']true["']/i.test(articleHtml) ||
  /drishvara-ag05d-visible-reference-block/i.test(articleHtml);

const hasAg03Evidence =
  /AG03/i.test(articleHtml) ||
  /data-drishvara-ag03c-b2-reference-block=["']true["']/i.test(articleHtml);

const legacyChecks = {
  ag08g_legacy_preservation_marker_present: hasLegacyMarker,
  ag03c_b2_marker_present: hasAg03cB2Evidence,
  ag05d_marker_present: hasAg05dEvidence,
  ag03_reference_integrity_visible: hasAg03Evidence,
  legacy_governance_preservation_status:
    hasLegacyMarker && hasAg03cB2Evidence && hasAg05dEvidence
      ? "passed"
      : "review_required"
};

const backupIntegrity = {
  backup_exists: true,
  backup_path: backupPath,
  backup_hash_current: currentBackupHash,
  backup_hash_recorded: ag08gApply.backup_hash,
  pre_apply_hash_recorded: ag08gApply.pre_apply_hash,
  backup_matches_recorded_backup_hash: currentBackupHash === ag08gApply.backup_hash,
  backup_matches_pre_apply_hash: currentBackupHash === ag08gApply.pre_apply_hash,
  backup_has_ag08g_marker: backupHtml.includes("AG08G-CONTROLLED-APPLY"),
  backup_integrity_status:
    currentBackupHash === ag08gApply.backup_hash &&
    currentBackupHash === ag08gApply.pre_apply_hash &&
    !backupHtml.includes("AG08G-CONTROLLED-APPLY")
      ? "passed"
      : "failed"
};

const mutationScope = {
  selected_article_path: selectedArticlePath,
  current_article_hash: currentArticleHash,
  post_apply_hash_recorded: ag08gApply.post_apply_hash,
  article_matches_post_apply_hash: currentArticleHash === ag08gApply.post_apply_hash,
  article_differs_from_backup: currentArticleHash !== currentBackupHash,
  ag08g_marker_count_in_target: countOccurrences(articleHtml, "AG08G-CONTROLLED-APPLY"),
  approved_reference_marker_count_in_target: countOccurrences(articleHtml, "AG08G-APPROVED-REFERENCES"),
  article_files_with_ag08g_marker: articleFilesWithAg08gMarker,
  exactly_one_article_contains_ag08g_marker:
    articleFilesWithAg08gMarker.length === 1 && articleFilesWithAg08gMarker[0] === selectedArticlePath,
  mutation_scope_status:
    currentArticleHash === ag08gApply.post_apply_hash &&
    currentArticleHash !== currentBackupHash &&
    countOccurrences(articleHtml, "AG08G-CONTROLLED-APPLY") === 1 &&
    countOccurrences(articleHtml, "AG08G-APPROVED-REFERENCES") === 1 &&
    articleFilesWithAg08gMarker.length === 1 &&
    articleFilesWithAg08gMarker[0] === selectedArticlePath
      ? "passed"
      : "failed"
};

const referenceAudit = {
  approved_reference_count: approvedReferences.length,
  inserted_reference_count: insertedReferenceChecks.filter((item) => item.inserted_in_target_article).length,
  inserted_reference_checks: insertedReferenceChecks,
  reference_insertion_status:
    approvedReferences.length >= 2 &&
    insertedReferenceChecks.every((item) => item.approved_in_ag08f && item.inserted_in_target_article)
      ? "passed"
      : "failed"
};

const forbiddenSystemGuards = {
  no_new_article_mutation_in_ag08h: true,
  no_file_edit_to_selected_article_in_ag08h: true,
  no_reference_insertion_in_ag08h: true,
  no_visual_generation_in_ag08h: true,
  no_image_insertion_in_ag08h: true,
  no_production_jsonl_append_in_ag08h: true,
  no_database_write_in_ag08h: true,
  no_supabase_write_in_ag08h: true,
  no_backend_auth_supabase_activation_in_ag08h: true,
  no_publishing_approval_in_ag08h: true,
  carried_from_ag08g: {
    visual_generation_performed: ag08gApply.visual_generation_performed,
    image_insertion_performed: ag08gApply.image_insertion_performed,
    production_jsonl_append_performed: ag08gApply.production_jsonl_append_performed,
    database_write_performed: ag08gApply.database_write_performed,
    supabase_write_performed: ag08gApply.supabase_write_performed,
    backend_auth_supabase_activation_performed: ag08gApply.backend_auth_supabase_activation_performed,
    public_publishing_performed: ag08gApply.public_publishing_performed
  },
  forbidden_system_guard_status:
    ag08gApply.visual_generation_performed === false &&
    ag08gApply.image_insertion_performed === false &&
    ag08gApply.production_jsonl_append_performed === false &&
    ag08gApply.database_write_performed === false &&
    ag08gApply.supabase_write_performed === false &&
    ag08gApply.backend_auth_supabase_activation_performed === false &&
    ag08gApply.public_publishing_performed === false
      ? "passed"
      : "failed"
};

const rollbackReadiness = {
  rollback_ready: backupIntegrity.backup_integrity_status === "passed",
  rollback_source: backupPath,
  rollback_target: selectedArticlePath,
  expected_restore_hash: currentBackupHash,
  current_target_hash: currentArticleHash,
  rollback_validation_steps: [
    "Copy backup file to selected article path.",
    "Confirm selected article hash equals backup hash.",
    "Confirm AG08G marker is absent after rollback.",
    "Run validate:ag08g only if AG08G remains expected, or run a dedicated rollback validator if rollback is executed.",
    "Run validate:project after rollback."
  ],
  rollback_execution_performed: false
};

const auditChecks = [
  {
    check_id: "AG08H-CHECK-001",
    name: "ag08g_apply_record_consumed",
    status: ag08gApply.status === "one_article_controlled_apply_completed_pending_audit" ? "passed" : "failed",
    evidence: ag08gApply.status
  },
  {
    check_id: "AG08H-CHECK-002",
    name: "backup_integrity",
    status: backupIntegrity.backup_integrity_status,
    evidence: backupIntegrity
  },
  {
    check_id: "AG08H-CHECK-003",
    name: "single_article_mutation_scope",
    status: mutationScope.mutation_scope_status,
    evidence: mutationScope
  },
  {
    check_id: "AG08H-CHECK-004",
    name: "approved_reference_insertion",
    status: referenceAudit.reference_insertion_status,
    evidence: referenceAudit
  },
  {
    check_id: "AG08H-CHECK-005",
    name: "legacy_governance_preservation",
    status: legacyChecks.legacy_governance_preservation_status,
    evidence: legacyChecks
  },
  {
    check_id: "AG08H-CHECK-006",
    name: "forbidden_system_guards",
    status: forbiddenSystemGuards.forbidden_system_guard_status,
    evidence: forbiddenSystemGuards
  },
  {
    check_id: "AG08H-CHECK-007",
    name: "rollback_readiness",
    status: rollbackReadiness.rollback_ready ? "passed" : "failed",
    evidence: rollbackReadiness
  }
];

const allCriticalPassed = auditChecks
  .filter((check) => check.check_id !== "AG08H-CHECK-005")
  .every((check) => check.status === "passed");

const legacyPassedOrReviewable = legacyChecks.legacy_governance_preservation_status === "passed";

const auditStatus =
  allCriticalPassed && legacyPassedOrReviewable
    ? "post_apply_audit_passed"
    : "post_apply_audit_review_required";

const noMutationControls = {
  post_apply_audit_only: true,
  selected_article_read_performed: true,
  backup_read_performed: true,
  audit_artifacts_created: true,
  new_article_mutation_performed: false,
  selected_article_mutation_performed_in_ag08h: false,
  article_mutation_performed_in_ag08h: false,
  file_edit_performed_in_ag08h: false,
  selected_article_file_write_performed_in_ag08h: false,
  reference_insertion_performed_in_ag08h: false,
  visual_generation_performed_in_ag08h: false,
  image_insertion_performed_in_ag08h: false,
  production_jsonl_append_performed_in_ag08h: false,
  database_write_performed_in_ag08h: false,
  supabase_write_performed_in_ag08h: false,
  backend_auth_supabase_activation_performed_in_ag08h: false,
  public_publishing_performed_in_ag08h: false,
  publishing_approval_performed_in_ag08h: false,
  rollback_execution_performed: false
};

const summary = {
  selected_article_path: selectedArticlePath,
  backup_path: backupPath,
  audit_status: auditStatus,
  backup_integrity_status: backupIntegrity.backup_integrity_status,
  mutation_scope_status: mutationScope.mutation_scope_status,
  approved_reference_insertion_status: referenceAudit.reference_insertion_status,
  legacy_governance_preservation_status: legacyChecks.legacy_governance_preservation_status,
  forbidden_system_guard_status: forbiddenSystemGuards.forbidden_system_guard_status,
  rollback_ready: rollbackReadiness.rollback_ready,
  project_validation_status: "validate_project_required_after_ag08h_artifacts",
  production_readiness_after_ag08h:
    auditStatus === "post_apply_audit_passed"
      ? "one_article_apply_audited"
      : "one_article_apply_audit_review_required",
  publish_readiness_after_ag08h: "static_file_changed_not_publish_approved",
  next_stage_id: "AG08I",
  next_stage_title: "Visual Generation / Image Insertion Plan",
  next_stage_requires_explicit_approval: true,
  ...noMutationControls
};

const auditReport = {
  module_id: "AG08H",
  title: "Post-Apply Audit Report",
  status: auditStatus,
  selected_article_path: selectedArticlePath,
  backup_path: backupPath,
  generated_from: inputs,
  ag08g_evidence: {
    ag08g_review_status: ag08gReview.status,
    ag08g_apply_status: ag08gApply.status,
    ag08g_schema_status: ag08gSchema.status,
    ag08g_audit_prep_status: ag08gAuditPrep.status,
    ag08g_learning_status: ag08gLearning.status
  },
  backup_integrity: backupIntegrity,
  mutation_scope: mutationScope,
  reference_audit: referenceAudit,
  legacy_governance_preservation: legacyChecks,
  forbidden_system_guards: forbiddenSystemGuards,
  rollback_readiness: rollbackReadiness,
  audit_checks: auditChecks,
  ...noMutationControls
};

const schema = {
  module_id: "AG08H",
  title: "Post-Apply Audit Schema",
  status: "schema_post_apply_audit_only",
  audit_backup_integrity_allowed_in_ag08h: true,
  audit_single_article_mutation_scope_allowed_in_ag08h: true,
  audit_reference_insertion_allowed_in_ag08h: true,
  audit_legacy_governance_preservation_allowed_in_ag08h: true,
  audit_forbidden_system_guards_allowed_in_ag08h: true,
  audit_rollback_readiness_allowed_in_ag08h: true,
  new_article_mutation_allowed_in_ag08h: false,
  selected_article_file_write_allowed_in_ag08h: false,
  reference_insertion_allowed_in_ag08h: false,
  visual_generation_allowed_in_ag08h: false,
  image_insertion_allowed_in_ag08h: false,
  production_jsonl_append_allowed_in_ag08h: false,
  database_write_allowed_in_ag08h: false,
  supabase_write_allowed_in_ag08h: false,
  backend_auth_supabase_activation_allowed_in_ag08h: false,
  publishing_allowed_in_ag08h: false,
  rollback_execution_allowed_in_ag08h: false,
  ...noMutationControls
};

const rollbackRecord = {
  module_id: "AG08H",
  title: "Rollback Readiness Record",
  status: rollbackReadiness.rollback_ready ? "rollback_ready_not_executed" : "rollback_not_ready",
  selected_article_path: selectedArticlePath,
  backup_path: backupPath,
  rollback_readiness: rollbackReadiness,
  backup_integrity: backupIntegrity,
  rollback_execution_performed: false,
  ...noMutationControls
};

const review = {
  module_id: "AG08H",
  title: "Post-Apply Audit",
  status: auditStatus,
  depends_on: ["AG08G", "AG08F"],
  generated_from: inputs,
  summary,
  audit_report_file: "data/content-intelligence/audit-records/ag08h-post-apply-audit-report.json",
  rollback_readiness_file: "data/content-intelligence/quality-registry/ag08h-rollback-readiness-record.json",
  schema_file: "data/content-intelligence/schema/post-apply-audit-ag08h.schema.json",
  learning_file: "data/content-intelligence/learning/ag08h-post-apply-audit-learning.json",
  closure_decision: {
    decision:
      auditStatus === "post_apply_audit_passed"
        ? "ag08g_apply_audited_pending_next_explicit_stage"
        : "ag08g_apply_audit_review_required",
    proceed_to_ag08i_only_with_explicit_user_approval: true,
    selected_article_path: selectedArticlePath,
    article_mutation_performed_in_ag08h: false,
    reference_insertion_performed_in_ag08h: false,
    visual_generation_performed_in_ag08h: false,
    image_insertion_performed_in_ag08h: false,
    production_jsonl_append_performed_in_ag08h: false,
    database_write_performed_in_ag08h: false,
    supabase_write_performed_in_ag08h: false,
    backend_auth_supabase_activation_performed_in_ag08h: false,
    public_publishing_performed_in_ag08h: false,
    production_readiness: summary.production_readiness_after_ag08h,
    publish_readiness: summary.publish_readiness_after_ag08h
  },
  ...noMutationControls
};

const learning = {
  module_id: "AG08H",
  title: "Post-Apply Audit Learning",
  status: "learning_record_only",
  summary,
  ag08h_learning_points: [
    "Post-apply audit must validate the target file against AG08G post-apply hash.",
    "The backup must remain pre-apply and marker-free.",
    "Legacy AG03/AG05 governance markers must survive article replacement.",
    "Reference insertion should be verified against AG08F-approved references only.",
    "Visual generation should stay separate from the first text/reference controlled apply.",
    "Rollback readiness must be recorded but not executed in audit stage."
  ],
  ...noMutationControls
};

const registry = {
  module_id: "AG08H",
  title: "Post-Apply Audit",
  status: auditStatus,
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag08h-post-apply-audit.json",
    audit_report: "data/content-intelligence/audit-records/ag08h-post-apply-audit-report.json",
    rollback_readiness: "data/content-intelligence/quality-registry/ag08h-rollback-readiness-record.json",
    schema: "data/content-intelligence/schema/post-apply-audit-ag08h.schema.json",
    learning: "data/content-intelligence/learning/ag08h-post-apply-audit-learning.json",
    preview: "data/quality/ag08h-post-apply-audit-preview.json",
    document: "docs/quality/AG08H_POST_APPLY_AUDIT.md"
  },
  summary,
  ...noMutationControls
};

const preview = {
  module_id: "AG08H",
  preview_only: true,
  status: auditStatus,
  summary,
  audit_checks: auditChecks,
  backup_integrity: backupIntegrity,
  mutation_scope: mutationScope,
  reference_audit: {
    approved_reference_count: referenceAudit.approved_reference_count,
    inserted_reference_count: referenceAudit.inserted_reference_count,
    reference_insertion_status: referenceAudit.reference_insertion_status
  },
  legacy_governance_preservation: legacyChecks,
  rollback_readiness: rollbackReadiness,
  next_stage: {
    next_stage_id: "AG08I",
    next_stage_title: "Visual Generation / Image Insertion Plan",
    explicit_approval_required: true,
    note: "AG08I should be a separate controlled plan/apply path for visual assets and image insertion."
  },
  ...noMutationControls
};

const doc = `# AG08H — Post-Apply Audit

## Purpose

AG08H audits the AG08G one-article controlled apply for backup integrity, marker scope, approved reference insertion, legacy governance preservation, forbidden-system guards and rollback readiness.

AG08H is audit-only. It does not mutate the selected article, edit public files, insert references, generate visuals, insert images, append production JSONL records, write to database/Supabase, activate backend/Auth/Supabase, approve publishing or execute rollback.

## Selected Article

- Path: \`${selectedArticlePath}\`
- Backup: \`${backupPath}\`
- Current article hash: \`${currentArticleHash}\`
- Backup hash: \`${currentBackupHash}\`

## Audit Status

- Overall: \`${auditStatus}\`
- Backup integrity: \`${backupIntegrity.backup_integrity_status}\`
- Mutation scope: \`${mutationScope.mutation_scope_status}\`
- Reference insertion: \`${referenceAudit.reference_insertion_status}\`
- Legacy governance preservation: \`${legacyChecks.legacy_governance_preservation_status}\`
- Forbidden-system guards: \`${forbiddenSystemGuards.forbidden_system_guard_status}\`
- Rollback ready: \`${rollbackReadiness.rollback_ready}\`

## Next Stage

AG08I — Visual Generation / Image Insertion Plan — is recommended only with explicit approval.

AG08I should remain separate because visual generation and image insertion introduce asset rights, attribution, alt text, layout, mobile and loading risks.
`;

writeJson(reviewPath, review);
writeJson(auditReportPath, auditReport);
writeJson(rollbackPath, rollbackRecord);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG08H post-apply audit artifacts generated.");
console.log(`✅ Audit target: ${selectedArticlePath}`);
console.log(`✅ Audit status: ${auditStatus}`);
console.log(`✅ Rollback ready: ${rollbackReadiness.rollback_ready}`);
