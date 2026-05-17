import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const targetArticlePath = "articles/policy/when-implementation-tells-the-real-story.html";
const targetSlug = path.basename(targetArticlePath, ".html");
const backupRelativePath = `archive/ag07p-backups/${targetSlug}-before-ag07p.html`;

const startMarker = "<!-- AG07P-CONTROLLED-APPLY-START -->";
const endMarker = "<!-- AG07P-CONTROLLED-APPLY-END -->";

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag07p-one-article-controlled-apply.json",
  "data/content-intelligence/apply-records/ag07p-one-article-controlled-apply.json",
  "data/content-intelligence/quality-registry/ag07p-post-apply-audit-prep.json",
  "data/content-intelligence/schema/one-article-controlled-apply.schema.json",
  "data/content-intelligence/learning/ag07p-one-article-controlled-apply-learning.json",
  "data/content-intelligence/mutation-plans/ag07o-controlled-single-article-mutation-plan.json",
  targetArticlePath,
  backupRelativePath,
  "data/content-intelligence/quality-reviews/ag07q-post-mutation-audit.json",
  "data/content-intelligence/audit-records/ag07q-post-mutation-audit-report.json",
  "data/content-intelligence/quality-registry/ag07q-rollback-readiness-record.json",
  "data/content-intelligence/schema/post-mutation-audit.schema.json",
  "data/content-intelligence/learning/ag07q-post-mutation-audit-learning.json",
  "data/quality/ag07q-post-mutation-audit.json",
  "data/quality/ag07q-post-mutation-audit-preview.json",
  "docs/quality/AG07Q_POST_MUTATION_AUDIT.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG07Q validation failed: ${message}`);
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

function countOccurrences(text, marker) {
  return text.split(marker).length - 1;
}

function listArticleFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listArticleFiles(absolute));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(path.relative(root, absolute));
    }
  }
  return files.sort();
}

function checkFalseFields(objects, fields) {
  for (const field of fields) {
    for (const obj of objects) {
      if (obj[field] !== false) fail(`${field} must be false in ${obj.title || obj.module_id || "object"}`);
    }
  }
}

function checkTrueFields(objects, fields) {
  for (const field of fields) {
    for (const obj of objects) {
      if (obj[field] !== true) fail(`${field} must be true in ${obj.title || obj.module_id || "object"}`);
    }
  }
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag07pReview = readJson("data/content-intelligence/quality-reviews/ag07p-one-article-controlled-apply.json");
const ag07pApplyRecord = readJson("data/content-intelligence/apply-records/ag07p-one-article-controlled-apply.json");
const ag07pAuditPrep = readJson("data/content-intelligence/quality-registry/ag07p-post-apply-audit-prep.json");
const ag07pSchema = readJson("data/content-intelligence/schema/one-article-controlled-apply.schema.json");

const review = readJson("data/content-intelligence/quality-reviews/ag07q-post-mutation-audit.json");
const auditReport = readJson("data/content-intelligence/audit-records/ag07q-post-mutation-audit-report.json");
const rollbackReadiness = readJson("data/content-intelligence/quality-registry/ag07q-rollback-readiness-record.json");
const schema = readJson("data/content-intelligence/schema/post-mutation-audit.schema.json");
const learning = readJson("data/content-intelligence/learning/ag07q-post-mutation-audit-learning.json");
const registry = readJson("data/quality/ag07q-post-mutation-audit.json");
const preview = readJson("data/quality/ag07q-post-mutation-audit-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG07Q_POST_MUTATION_AUDIT.md"), "utf8");

for (const obj of [review, auditReport, rollbackReadiness, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG07Q") fail(`module_id must be AG07Q in ${obj.title || "preview"}`);
}

if (!["post_mutation_audit_passed", "post_mutation_audit_review_required"].includes(review.status)) fail("Review status mismatch");
if (!["post_mutation_audit_passed", "post_mutation_audit_review_required"].includes(auditReport.status)) fail("Audit report status mismatch");
if (!["rollback_ready", "rollback_not_ready"].includes(rollbackReadiness.status)) fail("Rollback status mismatch");
if (schema.status !== "schema_audit_only") fail("Schema status must be schema_audit_only");
if (learning.status !== "learning_record_only") fail("Learning status must be learning_record_only");

if (ag07pReview.status !== "one_article_controlled_apply_performed") fail("AG07P must be one_article_controlled_apply_performed");
if (ag07pReview.closure_decision.proceed_to_ag07q_only_with_explicit_user_approval !== true) fail("AG07P must require explicit approval for AG07Q");
if (ag07pReview.closure_decision.target_article_path !== targetArticlePath) fail("AG07P target path mismatch");
if (ag07pReview.closure_decision.backup_file_path !== backupRelativePath) fail("AG07P backup path mismatch");
if (ag07pReview.closure_decision.mutated_article_count !== 1) fail("AG07P mutated article count must be 1");
if (ag07pReview.closure_decision.multi_article_mutation_performed !== false) fail("AG07P must not have multi-article mutation");
if (ag07pApplyRecord.validation_observations.one_article_marker_scope_confirmed !== true) fail("AG07P apply record must confirm marker scope");
if (ag07pAuditPrep.next_stage_id !== "AG07Q") fail("AG07P audit prep must point to AG07Q");
if (ag07pSchema.publishing_allowed_in_ag07p !== false) fail("AG07P schema must block publishing");

const targetHtml = fs.readFileSync(path.join(root, targetArticlePath), "utf8");
const backupHtml = fs.readFileSync(path.join(root, backupRelativePath), "utf8");

const targetStartMarkerCount = countOccurrences(targetHtml, startMarker);
const targetEndMarkerCount = countOccurrences(targetHtml, endMarker);
const backupStartMarkerCount = countOccurrences(backupHtml, startMarker);
const backupEndMarkerCount = countOccurrences(backupHtml, endMarker);

if (targetStartMarkerCount !== 1) fail(`Target must have exactly one start marker; found ${targetStartMarkerCount}`);
if (targetEndMarkerCount !== 1) fail(`Target must have exactly one end marker; found ${targetEndMarkerCount}`);
if (backupStartMarkerCount !== 0) fail(`Backup must have zero start markers; found ${backupStartMarkerCount}`);
if (backupEndMarkerCount !== 0) fail(`Backup must have zero end markers; found ${backupEndMarkerCount}`);
if (targetHtml === backupHtml) fail("Target must differ from backup");

const articleFiles = listArticleFiles(path.join(root, "articles"));
const articleFilesWithStartMarker = articleFiles.filter((file) =>
  fs.readFileSync(path.join(root, file), "utf8").includes(startMarker)
);
const articleFilesWithEndMarker = articleFiles.filter((file) =>
  fs.readFileSync(path.join(root, file), "utf8").includes(endMarker)
);

if (articleFilesWithStartMarker.length !== 1 || articleFilesWithStartMarker[0] !== targetArticlePath) {
  fail(`Exactly one article must contain AG07P start marker and it must be target. Found: ${articleFilesWithStartMarker.join(", ")}`);
}

if (articleFilesWithEndMarker.length !== 1 || articleFilesWithEndMarker[0] !== targetArticlePath) {
  fail(`Exactly one article must contain AG07P end marker and it must be target. Found: ${articleFilesWithEndMarker.join(", ")}`);
}

if (auditReport.target_hash_sha256_at_audit_start !== sha256(targetHtml)) fail("Audit report target start hash must match current target hash");
if (auditReport.target_hash_sha256_at_audit_end !== sha256(targetHtml)) fail("Audit report target end hash must match current target hash");
if (auditReport.backup_hash_sha256 !== sha256(backupHtml)) fail("Audit report backup hash must match current backup hash");

if (!Array.isArray(auditReport.audit_checks) || auditReport.audit_checks.length < 13) fail("Audit report must contain audit checks");
for (const item of auditReport.audit_checks) {
  if (item.passed !== true) fail(`Audit check must pass: ${item.audit_id} ${item.audit_name}`);
}

if (auditReport.rollback_readiness.rollback_ready !== true) fail("Audit report rollback must be ready");
if (rollbackReadiness.rollback_readiness.rollback_ready !== true) fail("Rollback readiness record must be ready");
for (const item of rollbackReadiness.rollback_preconditions) {
  if (item.passed !== true) fail(`Rollback precondition must pass: ${item.precondition_id}`);
}

for (const obj of [review, registry, preview]) {
  if (obj.summary.post_mutation_audit_performed !== true) fail(`${obj.title || "preview"} must perform post-mutation audit`);
  if (obj.summary.all_audit_checks_passed !== true) fail(`${obj.title || "preview"} must pass all audit checks`);
  if (obj.summary.target_start_marker_count !== 1) fail(`${obj.title || "preview"} target start marker count must be 1`);
  if (obj.summary.target_end_marker_count !== 1) fail(`${obj.title || "preview"} target end marker count must be 1`);
  if (obj.summary.backup_start_marker_count !== 0) fail(`${obj.title || "preview"} backup start marker count must be 0`);
  if (obj.summary.backup_end_marker_count !== 0) fail(`${obj.title || "preview"} backup end marker count must be 0`);
  if (obj.summary.article_files_with_ag07p_marker_count !== 1) fail(`${obj.title || "preview"} marker article count must be 1`);
  if (obj.summary.rollback_ready !== true) fail(`${obj.title || "preview"} rollback must be ready`);
  if (obj.summary.forbidden_system_guards_passed !== true) fail(`${obj.title || "preview"} forbidden guards must pass`);
  if (obj.summary.new_article_mutation_performed !== false) fail(`${obj.title || "preview"} must not perform new mutation`);
  if (obj.summary.file_edit_performed !== false) fail(`${obj.title || "preview"} must not edit target file`);
  if (obj.summary.production_jsonl_append_performed !== false) fail(`${obj.title || "preview"} must not append JSONL`);
  if (obj.summary.database_write_performed !== false) fail(`${obj.title || "preview"} must not write database`);
  if (obj.summary.supabase_write_performed !== false) fail(`${obj.title || "preview"} must not write Supabase`);
  if (obj.summary.public_publishing_performed !== false) fail(`${obj.title || "preview"} must not publish`);
  if (obj.summary.production_readiness_after_ag07q !== "one_article_apply_audited") fail(`${obj.title || "preview"} production readiness mismatch`);
  if (obj.summary.publish_readiness_after_ag07q !== "static_file_changed_not_publish_approved") fail(`${obj.title || "preview"} publish readiness mismatch`);
  if (obj.summary.next_stage_id !== "AG07Z") fail(`${obj.title || "preview"} next stage must be AG07Z`);
}

if (schema.post_mutation_audit_allowed_in_ag07q !== true) fail("Schema must allow audit");
if (schema.target_article_read_allowed_in_ag07q !== true) fail("Schema must allow target read");
if (schema.backup_file_read_allowed_in_ag07q !== true) fail("Schema must allow backup read");
if (schema.new_article_mutation_allowed_in_ag07q !== false) fail("Schema must block new mutation");
if (schema.file_edit_allowed_in_ag07q !== false) fail("Schema must block file edit");
if (schema.target_article_file_write_allowed_in_ag07q !== false) fail("Schema must block target article write");
if (schema.reference_insertion_allowed_in_ag07q !== false) fail("Schema must block reference insertion");
if (schema.visual_generation_allowed_in_ag07q !== false) fail("Schema must block visual generation");
if (schema.production_jsonl_append_allowed_in_ag07q !== false) fail("Schema must block JSONL append");
if (schema.database_write_allowed_in_ag07q !== false) fail("Schema must block database write");
if (schema.supabase_write_allowed_in_ag07q !== false) fail("Schema must block Supabase write");
if (schema.backend_auth_supabase_allowed_in_ag07q !== false) fail("Schema must block backend/Auth/Supabase");
if (schema.publishing_allowed_in_ag07q !== false) fail("Schema must block publishing");

if (review.closure_decision.decision !== "ag07q_post_mutation_audit_closed_passed") fail("Closure decision must be passed");
if (review.closure_decision.proceed_to_ag07z_only_with_explicit_user_approval !== true) fail("AG07Z must require explicit approval");
if (review.closure_decision.all_audit_checks_passed !== true) fail("Closure must pass all audit checks");
if (review.closure_decision.target_article_path !== targetArticlePath) fail("Closure target path mismatch");
if (review.closure_decision.backup_file_path !== backupRelativePath) fail("Closure backup path mismatch");
if (review.closure_decision.rollback_ready !== true) fail("Closure rollback must be ready");
if (review.closure_decision.forbidden_system_guards_passed !== true) fail("Closure forbidden guards must pass");
if (review.closure_decision.production_readiness !== "one_article_apply_audited") fail("Closure production readiness mismatch");
if (review.closure_decision.publish_readiness !== "static_file_changed_not_publish_approved") fail("Closure publish readiness mismatch");

checkTrueFields([review, auditReport, rollbackReadiness, schema, learning, registry, preview], [
  "post_mutation_audit_only",
  "audit_artifacts_created",
  "target_article_read_performed",
  "backup_file_read_performed",
  "marker_scope_scan_performed",
  "hash_audit_performed",
  "rollback_readiness_checked",
  "forbidden_system_guard_checked",
  "post_apply_quality_checked"
]);

checkFalseFields([review, auditReport, rollbackReadiness, schema, learning, registry, preview], [
  "new_article_mutation_performed",
  "target_article_file_write_performed",
  "public_article_mutation_performed",
  "article_html_mutation_performed",
  "file_edit_performed",
  "file_write_performed",
  "article_file_write_performed",
  "backup_file_created",
  "rollback_execution_performed",
  "rollback_test_performed",
  "reference_insertion_performed",
  "reference_url_population_performed",
  "approved_reference_url_population_performed",
  "visual_generation_performed",
  "visual_asset_generation_performed",
  "image_insertion_performed",
  "data_unit_generation_performed",
  "caption_alt_credit_population_performed",
  "production_jsonl_append_performed",
  "jsonl_append_performed",
  "jsonl_production_record_created",
  "database_write_performed",
  "supabase_write_performed",
  "supabase_enabled",
  "auth_enabled",
  "backend_activation_performed",
  "api_route_created",
  "public_publishing_performed",
  "publication_approval_granted",
  "production_packet_created",
  "actual_production_packet_created",
  "production_content_generated",
  "article_prose_generated",
  "narrative_text_generated",
  "dry_run_score_recalculation_performed",
  "actual_score_calculation_performed",
  "production_score_record_created",
  "publish_ready_approval_performed",
  "approval_state_changed",
  "publish_ready_set",
  "human_apply_approval_performed",
  "multi_article_mutation_performed"
]);

for (const scriptName of ["generate:ag07q", "validate:ag07q"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag07q")) {
  fail("validate:project must include validate:ag07q");
}

for (const phrase of [
  "Purpose",
  "Target Article",
  "Audit Scope",
  "Result",
  "Explicit Exclusions",
  "Acceptance Criteria",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG07Q document missing phrase: ${phrase}`);
}

pass("AG07Q registry is present.");
pass("AG07Q document is present.");
pass("AG07Q review, audit report, rollback readiness, schema, learning record and preview are present.");
pass("AG07P one-article controlled apply is consumed.");
pass("Target article exists and contains exactly one AG07P controlled apply block.");
pass("Backup exists and has no AG07P marker.");
pass("Exactly one article contains the AG07P marker.");
pass("Target differs from backup.");
pass("Rollback readiness is confirmed.");
pass("Forbidden-system guards are confirmed.");
pass("Post-apply quality status is passed.");
pass("No new article mutation, file edit, reference insertion, visual generation or image insertion is performed.");
pass("No production JSONL append, database write, Supabase write, backend/Auth/Supabase activation or publishing is performed.");
pass("Production readiness is one_article_apply_audited.");
pass("Publish readiness remains static_file_changed_not_publish_approved.");
pass("AG07Q is Post-Mutation Audit only.");
pass("AG07Z Closure / Repeatable Production Readiness is identified as next only with explicit approval.");
