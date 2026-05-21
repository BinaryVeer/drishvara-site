import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag09cReview: "data/content-intelligence/quality-reviews/ag09c-controlled-public-experience-correction-apply.json",
  ag09cApply: "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json",
  ag09cAuditPrep: "data/content-intelligence/quality-registry/ag09c-post-correction-audit-prep.json",
  ag09bPlan: "data/content-intelligence/mutation-plans/ag09b-public-experience-correction-plan.json",
  ag09aGapRegister: "data/content-intelligence/quality-registry/ag09a-public-experience-gap-register.json",
  ag08kApply: "data/content-intelligence/apply-records/ag08k-controlled-visual-image-insertion-apply.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag09d-post-correction-public-experience-audit.json");
const auditReportPath = path.join(root, "data/content-intelligence/audit-records/ag09d-post-correction-public-experience-audit-report.json");
const rollbackPath = path.join(root, "data/content-intelligence/quality-registry/ag09d-rollback-readiness-record.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag09d-public-experience-readiness-record.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/post-correction-public-experience-audit.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag09d-post-correction-public-experience-audit-learning.json");
const registryPath = path.join(root, "data/quality/ag09d-post-correction-public-experience-audit.json");
const previewPath = path.join(root, "data/quality/ag09d-post-correction-public-experience-audit-preview.json");
const docPath = path.join(root, "docs/quality/AG09D_POST_CORRECTION_PUBLIC_EXPERIENCE_AUDIT.md");

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

function count(text, needle) {
  return String(text || "").split(needle).length - 1;
}

function hasMeta(html, selector) {
  return html.includes(selector);
}

function hasAnyPlannedCorrection(plan, type) {
  return (plan.correction_items || []).some((item) => item.correction_type === type);
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) throw new Error(`Missing required AG09D input ${name}: ${relativePath}`);
}

const ag09cReview = readJson(inputs.ag09cReview);
const ag09cApply = readJson(inputs.ag09cApply);
const ag09cAuditPrep = readJson(inputs.ag09cAuditPrep);
const ag09bPlan = readJson(inputs.ag09bPlan);
const ag09aGaps = readJson(inputs.ag09aGapRegister);
const ag08kApply = readJson(inputs.ag08kApply);

if (ag09cReview.status !== "controlled_public_experience_corrections_applied_pending_audit") {
  throw new Error("AG09D requires AG09C review to be pending audit.");
}

if (ag09cApply.status !== "controlled_public_experience_corrections_applied_pending_audit") {
  throw new Error("AG09D requires AG09C apply record to be pending audit.");
}

if (ag09cAuditPrep.status !== "post_public_experience_correction_audit_required") {
  throw new Error("AG09D requires AG09C audit prep.");
}

const selectedArticlePath = ag09cApply.selected_article_path;
if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);

const articleHtml = fs.readFileSync(path.join(root, selectedArticlePath), "utf8");
const currentArticleHash = sha256(articleHtml);

const noMutationControls = {
  post_correction_public_experience_audit_only: true,
  selected_article_read_performed: true,
  mutated_files_read_performed: true,
  backup_files_read_performed: true,
  article_mutation_performed_in_ag09d: false,
  selected_article_file_write_performed_in_ag09d: false,
  homepage_mutation_performed_in_ag09d: false,
  css_mutation_performed_in_ag09d: false,
  js_mutation_performed_in_ag09d: false,
  reference_insertion_performed_in_ag09d: false,
  reference_url_change_performed_in_ag09d: false,
  visual_generation_performed_in_ag09d: false,
  image_asset_creation_performed_in_ag09d: false,
  image_insertion_performed_in_ag09d: false,
  live_url_fetch_performed_in_ag09d: false,
  production_jsonl_append_performed_in_ag09d: false,
  database_write_performed_in_ag09d: false,
  supabase_write_performed_in_ag09d: false,
  backend_auth_supabase_activation_performed_in_ag09d: false,
  public_publishing_performed_in_ag09d: false,
  publishing_approval_performed_in_ag09d: false,
  rollback_execution_performed_in_ag09d: false
};

const backupAuditItems = (ag09cApply.backups || []).map((backup) => {
  const backupExists = exists(backup.backup_path);
  const backupHash = backupExists ? sha256(fs.readFileSync(path.join(root, backup.backup_path), "utf8")) : null;
  return {
    file_path: backup.file_path,
    backup_path: backup.backup_path,
    backup_exists: backupExists,
    backup_hash_current: backupHash,
    backup_hash_recorded: backup.backup_hash,
    pre_hash_recorded: backup.pre_hash,
    backup_hash_matches_record: backupHash === backup.backup_hash,
    backup_hash_matches_pre_hash: backupHash === backup.pre_hash,
    status: backupExists && backupHash === backup.backup_hash && backupHash === backup.pre_hash ? "passed" : "failed"
  };
});

const mutatedFileAuditItems = (ag09cApply.mutated_files || []).map((file) => {
  const fileExists = exists(file.file_path);
  const fileHash = fileExists ? sha256(fs.readFileSync(path.join(root, file.file_path), "utf8")) : null;
  return {
    file_path: file.file_path,
    file_exists: fileExists,
    current_hash: fileHash,
    recorded_post_hash: file.post_hash,
    pre_hash: file.pre_hash,
    current_hash_matches_record: fileHash === file.post_hash,
    file_differs_from_pre_hash: fileHash !== file.pre_hash,
    correction_type: file.correction_type,
    status: fileExists && fileHash === file.post_hash && fileHash !== file.pre_hash ? "passed" : "failed"
  };
});

const metadataAudit = {
  selected_article_path: selectedArticlePath,
  current_article_hash: currentArticleHash,
  recorded_post_correction_hash: ag09cApply.post_correction_hash,
  current_hash_matches_ag09c: currentArticleHash === ag09cApply.post_correction_hash,
  pre_hash_matches_ag08k_post_insertion: ag09cApply.pre_correction_hash === ag08kApply.post_insertion_hash,
  article_contains_ag09c_metadata_marker: articleHtml.includes("AG09C-PUBLIC-EXPERIENCE-METADATA"),
  canonical_present: hasMeta(articleHtml, 'rel="canonical"'),
  description_present: hasMeta(articleHtml, 'name="description"'),
  og_title_present: hasMeta(articleHtml, 'property="og:title"'),
  og_description_present: hasMeta(articleHtml, 'property="og:description"'),
  og_image_present: hasMeta(articleHtml, 'property="og:image"'),
  twitter_card_present: hasMeta(articleHtml, 'name="twitter:card"'),
  twitter_image_present: hasMeta(articleHtml, 'name="twitter:image"'),
  metadata_audit_status:
    currentArticleHash === ag09cApply.post_correction_hash &&
    ag09cApply.pre_correction_hash === ag08kApply.post_insertion_hash &&
    articleHtml.includes("AG09C-PUBLIC-EXPERIENCE-METADATA") &&
    hasMeta(articleHtml, 'rel="canonical"') &&
    hasMeta(articleHtml, 'name="description"') &&
    hasMeta(articleHtml, 'property="og:title"') &&
    hasMeta(articleHtml, 'property="og:description"') &&
    hasMeta(articleHtml, 'property="og:image"') &&
    hasMeta(articleHtml, 'name="twitter:card"') &&
    hasMeta(articleHtml, 'name="twitter:image"')
      ? "passed"
      : "failed"
};

const listingPlanned = hasAnyPlannedCorrection(ag09bPlan, "homepage_or_featured_listing_discoverability_correction");
const listingMutation = (ag09cApply.mutated_files || []).find((file) => file.file_path !== selectedArticlePath);
const listingHtml = listingMutation && exists(listingMutation.file_path)
  ? fs.readFileSync(path.join(root, listingMutation.file_path), "utf8")
  : "";

const listingAudit = {
  listing_correction_planned: listingPlanned,
  listing_mutation_recorded: Boolean(listingMutation),
  listing_file_path: listingMutation?.file_path || null,
  listing_file_exists: listingMutation ? exists(listingMutation.file_path) : false,
  listing_contains_ag09c_marker: listingHtml.includes("AG09C-PUBLIC-EXPERIENCE-LISTING"),
  listing_contains_selected_article_link: listingHtml.includes(selectedArticlePath),
  listing_audit_status:
    !listingPlanned
      ? "not_applicable"
      : Boolean(listingMutation) &&
        exists(listingMutation.file_path) &&
        listingHtml.includes("AG09C-PUBLIC-EXPERIENCE-LISTING") &&
        listingHtml.includes(selectedArticlePath)
          ? "passed"
          : "failed"
};

const correctionMappingAudit = {
  source_gap_count: ag09aGaps.gap_count,
  ag09b_correction_item_count: ag09bPlan.correction_item_count,
  ag09c_correction_item_count: ag09cApply.correction_item_count,
  applied_count: (ag09cApply.applied_corrections || []).filter((item) => item.applied).length,
  every_ag09b_item_applied: (ag09cApply.applied_corrections || []).filter((item) => item.applied).length === ag09bPlan.correction_item_count,
  correction_mapping_status:
    ag09aGaps.gap_count === ag09bPlan.correction_item_count &&
    ag09bPlan.correction_item_count === ag09cApply.correction_item_count &&
    (ag09cApply.applied_corrections || []).filter((item) => item.applied).length === ag09bPlan.correction_item_count
      ? "passed"
      : "failed"
};

const forbiddenSystemGuards = {
  css_mutation_performed_in_ag09c: ag09cApply.css_mutation_performed_in_ag09c,
  js_mutation_performed_in_ag09c: ag09cApply.js_mutation_performed_in_ag09c,
  reference_insertion_performed_in_ag09c: ag09cApply.reference_insertion_performed_in_ag09c,
  reference_url_change_performed_in_ag09c: ag09cApply.reference_url_change_performed_in_ag09c,
  visual_generation_performed_in_ag09c: ag09cApply.visual_generation_performed_in_ag09c,
  image_asset_creation_performed_in_ag09c: ag09cApply.image_asset_creation_performed_in_ag09c,
  image_insertion_performed_in_ag09c: ag09cApply.image_insertion_performed_in_ag09c,
  live_url_fetch_performed_in_ag09c: ag09cApply.live_url_fetch_performed_in_ag09c,
  production_jsonl_append_performed_in_ag09c: ag09cApply.production_jsonl_append_performed_in_ag09c,
  database_write_performed_in_ag09c: ag09cApply.database_write_performed_in_ag09c,
  supabase_write_performed_in_ag09c: ag09cApply.supabase_write_performed_in_ag09c,
  backend_auth_supabase_activation_performed_in_ag09c: ag09cApply.backend_auth_supabase_activation_performed_in_ag09c,
  public_publishing_performed_in_ag09c: ag09cApply.public_publishing_performed_in_ag09c,
  forbidden_system_guard_status:
    ag09cApply.css_mutation_performed_in_ag09c === false &&
    ag09cApply.js_mutation_performed_in_ag09c === false &&
    ag09cApply.reference_insertion_performed_in_ag09c === false &&
    ag09cApply.reference_url_change_performed_in_ag09c === false &&
    ag09cApply.visual_generation_performed_in_ag09c === false &&
    ag09cApply.image_asset_creation_performed_in_ag09c === false &&
    ag09cApply.image_insertion_performed_in_ag09c === false &&
    ag09cApply.live_url_fetch_performed_in_ag09c === false &&
    ag09cApply.production_jsonl_append_performed_in_ag09c === false &&
    ag09cApply.database_write_performed_in_ag09c === false &&
    ag09cApply.supabase_write_performed_in_ag09c === false &&
    ag09cApply.backend_auth_supabase_activation_performed_in_ag09c === false &&
    ag09cApply.public_publishing_performed_in_ag09c === false
      ? "passed"
      : "failed"
};

const backupStatus = backupAuditItems.length > 0 && backupAuditItems.every((item) => item.status === "passed") ? "passed" : "failed";
const mutatedFileStatus = mutatedFileAuditItems.length > 0 && mutatedFileAuditItems.every((item) => item.status === "passed") ? "passed" : "failed";

const rollbackReadiness = {
  rollback_ready: backupStatus === "passed",
  rollback_execution_performed: false,
  backup_count: backupAuditItems.length,
  mutated_file_count: mutatedFileAuditItems.length,
  backup_audit_items: backupAuditItems,
  rollback_steps: [
    "For each mutated file, copy its AG09C backup path back to the file path.",
    "Confirm each restored file hash equals its recorded pre_hash.",
    "Run validate:project.",
    "Do not execute rollback unless explicitly approved."
  ],
  ...noMutationControls
};

const auditChecks = [
  {
    check_id: "AG09D-CHECK-001",
    name: "ag09c_apply_record_consumed",
    status: ag09cApply.status === "controlled_public_experience_corrections_applied_pending_audit" ? "passed" : "failed"
  },
  {
    check_id: "AG09D-CHECK-002",
    name: "backup_integrity",
    status: backupStatus,
    evidence: backupAuditItems
  },
  {
    check_id: "AG09D-CHECK-003",
    name: "mutated_file_integrity",
    status: mutatedFileStatus,
    evidence: mutatedFileAuditItems
  },
  {
    check_id: "AG09D-CHECK-004",
    name: "metadata_social_preview_correction",
    status: metadataAudit.metadata_audit_status,
    evidence: metadataAudit
  },
  {
    check_id: "AG09D-CHECK-005",
    name: "listing_discoverability_correction",
    status: listingAudit.listing_audit_status,
    evidence: listingAudit
  },
  {
    check_id: "AG09D-CHECK-006",
    name: "correction_mapping",
    status: correctionMappingAudit.correction_mapping_status,
    evidence: correctionMappingAudit
  },
  {
    check_id: "AG09D-CHECK-007",
    name: "forbidden_system_guards",
    status: forbiddenSystemGuards.forbidden_system_guard_status,
    evidence: forbiddenSystemGuards
  },
  {
    check_id: "AG09D-CHECK-008",
    name: "rollback_readiness",
    status: rollbackReadiness.rollback_ready ? "passed" : "failed",
    evidence: rollbackReadiness
  }
];

const auditStatus = auditChecks.every((check) => check.status === "passed" || check.status === "not_applicable")
  ? "post_correction_public_experience_audit_passed"
  : "post_correction_public_experience_audit_review_required";

const publicExperienceReadiness = auditStatus === "post_correction_public_experience_audit_passed"
  ? "public_experience_corrections_audited_pending_editorial_publish_decision"
  : "public_experience_corrections_require_review";

const auditReport = {
  module_id: "AG09D",
  title: "Post-Correction Public Experience Audit Report",
  status: auditStatus,
  selected_article_path: selectedArticlePath,
  generated_from: inputs,
  correction_mapping_audit: correctionMappingAudit,
  backup_integrity: {
    status: backupStatus,
    backup_audit_items: backupAuditItems
  },
  mutated_file_integrity: {
    status: mutatedFileStatus,
    mutated_file_audit_items: mutatedFileAuditItems
  },
  metadata_audit: metadataAudit,
  listing_audit: listingAudit,
  forbidden_system_guards: forbiddenSystemGuards,
  rollback_readiness: rollbackReadiness,
  audit_checks: auditChecks,
  public_experience_readiness: publicExperienceReadiness,
  publish_readiness: "blocked_pending_explicit_editorial_publish_approval",
  ...noMutationControls
};

const rollbackRecord = {
  module_id: "AG09D",
  title: "AG09D Rollback Readiness Record",
  status: rollbackReadiness.rollback_ready ? "rollback_ready_not_executed" : "rollback_not_ready",
  selected_article_path: selectedArticlePath,
  rollback_readiness: rollbackReadiness,
  ...noMutationControls
};

const readinessRecord = {
  module_id: "AG09D",
  title: "AG09D Public Experience Readiness Record",
  status: publicExperienceReadiness,
  selected_article_path: selectedArticlePath,
  audit_status: auditStatus,
  public_experience_ready_for_editorial_review: auditStatus === "post_correction_public_experience_audit_passed",
  publish_ready: false,
  publish_readiness: "blocked_pending_explicit_editorial_publish_approval",
  backend_activation_ready: false,
  database_activation_ready: false,
  supabase_activation_ready: false,
  ...noMutationControls
};

const schema = {
  module_id: "AG09D",
  title: "Post-Correction Public Experience Audit Schema",
  status: "schema_post_correction_audit_only",
  backup_integrity_audit_allowed_in_ag09d: true,
  metadata_social_preview_audit_allowed_in_ag09d: true,
  listing_discoverability_audit_allowed_in_ag09d: true,
  forbidden_system_guard_audit_allowed_in_ag09d: true,
  rollback_readiness_audit_allowed_in_ag09d: true,
  article_mutation_allowed_in_ag09d: false,
  selected_article_file_write_allowed_in_ag09d: false,
  homepage_mutation_allowed_in_ag09d: false,
  css_js_mutation_allowed_in_ag09d: false,
  reference_insertion_allowed_in_ag09d: false,
  reference_url_change_allowed_in_ag09d: false,
  visual_generation_allowed_in_ag09d: false,
  image_asset_creation_allowed_in_ag09d: false,
  image_insertion_allowed_in_ag09d: false,
  live_url_fetch_allowed_in_ag09d: false,
  production_jsonl_append_allowed_in_ag09d: false,
  database_write_allowed_in_ag09d: false,
  supabase_write_allowed_in_ag09d: false,
  backend_auth_supabase_activation_allowed_in_ag09d: false,
  publishing_allowed_in_ag09d: false,
  rollback_execution_allowed_in_ag09d: false,
  ...noMutationControls
};

const summary = {
  selected_article_path: selectedArticlePath,
  audit_status: auditStatus,
  correction_mapping_status: correctionMappingAudit.correction_mapping_status,
  backup_integrity_status: backupStatus,
  mutated_file_integrity_status: mutatedFileStatus,
  metadata_audit_status: metadataAudit.metadata_audit_status,
  listing_audit_status: listingAudit.listing_audit_status,
  forbidden_system_guard_status: forbiddenSystemGuards.forbidden_system_guard_status,
  rollback_ready: rollbackReadiness.rollback_ready,
  public_experience_readiness: publicExperienceReadiness,
  publish_readiness: "blocked_pending_explicit_editorial_publish_approval",
  next_stage_id: "AG09E",
  next_stage_title: "Editorial Publish Decision Boundary",
  next_stage_requires_explicit_approval: true,
  ...noMutationControls
};

const review = {
  module_id: "AG09D",
  title: "Post-Correction Public Experience Audit",
  status: auditStatus,
  depends_on: ["AG09C", "AG09B", "AG09A"],
  generated_from: inputs,
  summary,
  audit_report_file: "data/content-intelligence/audit-records/ag09d-post-correction-public-experience-audit-report.json",
  rollback_readiness_file: "data/content-intelligence/quality-registry/ag09d-rollback-readiness-record.json",
  readiness_file: "data/content-intelligence/quality-registry/ag09d-public-experience-readiness-record.json",
  schema_file: "data/content-intelligence/schema/post-correction-public-experience-audit.schema.json",
  learning_file: "data/content-intelligence/learning/ag09d-post-correction-public-experience-audit-learning.json",
  closure_decision: {
    decision: auditStatus === "post_correction_public_experience_audit_passed"
      ? "ag09d_public_experience_corrections_audited_pending_editorial_publish_boundary"
      : "ag09d_public_experience_corrections_review_required",
    proceed_to_ag09e_only_with_explicit_user_approval: true,
    publish_approval_granted: false,
    ...noMutationControls
  },
  ...noMutationControls
};

const learning = {
  module_id: "AG09D",
  title: "Post-Correction Public Experience Audit Learning",
  status: "learning_record_only",
  summary,
  learning_points: [
    "Public-experience correction audit must remain separate from publish approval.",
    "Metadata/social-preview and listing discoverability can be audited without reopening article-generation stages.",
    "Backups for every mutated file are essential because public-readiness corrections may touch more than the selected article.",
    "CSS/JS/reference/visual/backend/publishing guards should remain explicit in post-correction audit."
  ],
  ...noMutationControls
};

const registry = {
  module_id: "AG09D",
  title: "Post-Correction Public Experience Audit",
  status: auditStatus,
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag09d-post-correction-public-experience-audit.json",
    audit_report: "data/content-intelligence/audit-records/ag09d-post-correction-public-experience-audit-report.json",
    rollback_readiness: "data/content-intelligence/quality-registry/ag09d-rollback-readiness-record.json",
    readiness: "data/content-intelligence/quality-registry/ag09d-public-experience-readiness-record.json",
    schema: "data/content-intelligence/schema/post-correction-public-experience-audit.schema.json",
    learning: "data/content-intelligence/learning/ag09d-post-correction-public-experience-audit-learning.json",
    preview: "data/quality/ag09d-post-correction-public-experience-audit-preview.json",
    document: "docs/quality/AG09D_POST_CORRECTION_PUBLIC_EXPERIENCE_AUDIT.md"
  },
  summary,
  ...noMutationControls
};

const preview = {
  module_id: "AG09D",
  preview_only: true,
  status: auditStatus,
  summary,
  audit_checks: auditChecks,
  metadata_audit: metadataAudit,
  listing_audit: listingAudit,
  rollback_readiness: rollbackReadiness,
  ...noMutationControls
};

const doc = `# AG09D — Post-Correction Public Experience Audit

## Purpose

AG09D audits the AG09C controlled public-experience correction apply.

AG09D is audit-only. It does not mutate the article, homepage, CSS, JavaScript, references, visual assets, images, JSONL records, database/Supabase, backend/Auth/Supabase or publishing state.

## Audit Result

- Status: \`${auditStatus}\`
- Metadata/social-preview audit: \`${metadataAudit.metadata_audit_status}\`
- Listing audit: \`${listingAudit.listing_audit_status}\`
- Backup integrity: \`${backupStatus}\`
- Rollback ready: \`${rollbackReadiness.rollback_ready}\`

## Publish Boundary

Publish readiness remains blocked pending explicit editorial publish approval.

## Next Stage

AG09E — Editorial Publish Decision Boundary — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(auditReportPath, auditReport);
writeJson(rollbackPath, rollbackRecord);
writeJson(readinessPath, readinessRecord);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

const articleHashAfter = sha256(fs.readFileSync(path.join(root, selectedArticlePath), "utf8"));
if (articleHashAfter !== currentArticleHash) {
  throw new Error("AG09D attempted to mutate selected article. Refusing to continue.");
}

console.log("✅ AG09D post-correction public experience audit artifacts generated.");
console.log(`✅ Audit target: ${selectedArticlePath}`);
console.log(`✅ Audit status: ${auditStatus}`);
console.log(`✅ Rollback ready: ${rollbackReadiness.rollback_ready}`);
console.log("✅ No article/homepage/CSS/JS/reference/visual/backend/publishing mutation performed.");
console.log("✅ AG09E handoff created with explicit approval required.");
