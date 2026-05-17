import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const targetArticlePath = "articles/policy/when-implementation-tells-the-real-story.html";
const targetSlug = path.basename(targetArticlePath, ".html");
const backupRelativePath = `archive/ag07p-backups/${targetSlug}-before-ag07p.html`;
const startMarker = "<!-- AG07P-CONTROLLED-APPLY-START -->";
const endMarker = "<!-- AG07P-CONTROLLED-APPLY-END -->";

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag07o-approval-controlled-single-article-mutation-plan.json",
  "data/content-intelligence/mutation-plans/ag07o-controlled-single-article-mutation-plan.json",
  "data/content-intelligence/approval-registry/ag07o-approval-plan-record.json",
  "data/content-intelligence/schema/approval-controlled-single-article-mutation-plan.schema.json",
  "data/content-intelligence/learning/ag07o-approval-controlled-single-article-mutation-plan-learning.json",
  "data/content-intelligence/content-packets/ag07n-production-packet-candidate.json",
  "data/content-intelligence/quality-registry/ag07n-production-packet-candidate-readiness.json",
  targetArticlePath,
  backupRelativePath,
  "data/content-intelligence/quality-reviews/ag07p-one-article-controlled-apply.json",
  "data/content-intelligence/apply-records/ag07p-one-article-controlled-apply.json",
  "data/content-intelligence/quality-registry/ag07p-post-apply-audit-prep.json",
  "data/content-intelligence/schema/one-article-controlled-apply.schema.json",
  "data/content-intelligence/learning/ag07p-one-article-controlled-apply-learning.json",
  "data/quality/ag07p-one-article-controlled-apply.json",
  "data/quality/ag07p-one-article-controlled-apply-preview.json",
  "docs/quality/AG07P_ONE_ARTICLE_CONTROLLED_APPLY.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG07P validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
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

const ag07oReview = readJson("data/content-intelligence/quality-reviews/ag07o-approval-controlled-single-article-mutation-plan.json");
const ag07oMutationPlan = readJson("data/content-intelligence/mutation-plans/ag07o-controlled-single-article-mutation-plan.json");
const ag07oApprovalPlan = readJson("data/content-intelligence/approval-registry/ag07o-approval-plan-record.json");
const ag07oSchema = readJson("data/content-intelligence/schema/approval-controlled-single-article-mutation-plan.schema.json");
const ag07nCandidate = readJson("data/content-intelligence/content-packets/ag07n-production-packet-candidate.json");

const review = readJson("data/content-intelligence/quality-reviews/ag07p-one-article-controlled-apply.json");
const applyRecord = readJson("data/content-intelligence/apply-records/ag07p-one-article-controlled-apply.json");
const auditPrep = readJson("data/content-intelligence/quality-registry/ag07p-post-apply-audit-prep.json");
const schema = readJson("data/content-intelligence/schema/one-article-controlled-apply.schema.json");
const learning = readJson("data/content-intelligence/learning/ag07p-one-article-controlled-apply-learning.json");
const registry = readJson("data/quality/ag07p-one-article-controlled-apply.json");
const preview = readJson("data/quality/ag07p-one-article-controlled-apply-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG07P_ONE_ARTICLE_CONTROLLED_APPLY.md"), "utf8");

for (const obj of [review, applyRecord, auditPrep, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG07P") fail(`module_id must be AG07P in ${obj.title || "preview"}`);
}

if (review.status !== "one_article_controlled_apply_performed") fail("Review status must be one_article_controlled_apply_performed");
if (applyRecord.status !== "one_article_controlled_apply_performed") fail("Apply record status must be one_article_controlled_apply_performed");
if (auditPrep.status !== "post_apply_audit_prep_created") fail("Audit prep status must be post_apply_audit_prep_created");
if (schema.status !== "schema_controlled_apply_only") fail("Schema status must be schema_controlled_apply_only");
if (learning.status !== "learning_record_only") fail("Learning status must be learning_record_only");

if (ag07oReview.status !== "approval_controlled_single_article_mutation_plan_created") fail("AG07O must be approval_controlled_single_article_mutation_plan_created");
if (ag07oReview.closure_decision.proceed_to_ag07p_only_with_explicit_user_approval !== true) fail("AG07O must require explicit approval for AG07P");
if (ag07oReview.closure_decision.ag07p_handoff_created !== true) fail("AG07O must create AG07P handoff");
if (ag07oReview.closure_decision.file_edit_performed !== false) fail("AG07O must not have edited files");
if (ag07oReview.closure_decision.static_live_apply_performed !== false) fail("AG07O must not have applied static live mutation");
if (ag07oMutationPlan.ag07p_handoff.explicit_approval_required !== true) fail("AG07O handoff must require explicit approval");
if (ag07oApprovalPlan.approval_state.approval_state_changed !== false) fail("AG07O approval state must not change");
if (ag07oSchema.static_live_apply_allowed_in_ag07o !== false) fail("AG07O schema must block static-live apply");
if (ag07nCandidate.status !== "production_packet_candidate_created") fail("AG07N candidate must exist");

const targetHtml = fs.readFileSync(path.join(root, targetArticlePath), "utf8");
const backupHtml = fs.readFileSync(path.join(root, backupRelativePath), "utf8");

const targetStartCount = countOccurrences(targetHtml, startMarker);
const targetEndCount = countOccurrences(targetHtml, endMarker);
if (targetStartCount !== 1) fail(`Target article must contain exactly one AG07P start marker; found ${targetStartCount}`);
if (targetEndCount !== 1) fail(`Target article must contain exactly one AG07P end marker; found ${targetEndCount}`);
if (backupHtml.includes(startMarker) || backupHtml.includes(endMarker)) fail("Backup file must not contain AG07P markers");
if (targetHtml === backupHtml) fail("Target article must differ from backup after controlled apply");

const articleFiles = listArticleFiles(path.join(root, "articles"));
const articleFilesWithMarker = articleFiles.filter((file) =>
  fs.readFileSync(path.join(root, file), "utf8").includes(startMarker)
);
if (articleFilesWithMarker.length !== 1) fail(`Exactly one article file must contain AG07P marker; found ${articleFilesWithMarker.length}`);
if (articleFilesWithMarker[0] !== targetArticlePath) fail(`AG07P marker must be only in target article; found ${articleFilesWithMarker[0]}`);

for (const obj of [review, applyRecord, auditPrep, schema, learning, registry, preview]) {
  if (obj.target_article_path !== targetArticlePath) fail(`${obj.title || "object"} target path mismatch`);
  if (obj.backup_file_path !== backupRelativePath) fail(`${obj.title || "object"} backup path mismatch`);
}

for (const obj of [review, registry, preview]) {
  if (obj.summary.one_article_controlled_apply_performed !== true) fail(`${obj.title || "preview"} must perform one-article controlled apply`);
  if (obj.summary.pre_apply_backup_created !== true) fail(`${obj.title || "preview"} must create pre-apply backup`);
  if (obj.summary.target_article_mutated !== true) fail(`${obj.title || "preview"} must mutate target article`);
  if (obj.summary.actual_public_mutation_performed !== true) fail(`${obj.title || "preview"} must record public mutation`);
  if (obj.summary.multi_article_mutation_performed !== false) fail(`${obj.title || "preview"} must not mutate multiple articles`);
  if (obj.summary.mutated_article_count !== 1) fail(`${obj.title || "preview"} mutated article count must be 1`);
  if (obj.summary.article_files_with_ag07p_marker_count !== 1) fail(`${obj.title || "preview"} marker article count must be 1`);
  if (obj.summary.reference_insertion_performed !== false) fail(`${obj.title || "preview"} must not insert references`);
  if (obj.summary.reference_url_population_performed !== false) fail(`${obj.title || "preview"} must not populate reference URLs`);
  if (obj.summary.visual_generation_performed !== false) fail(`${obj.title || "preview"} must not generate visuals`);
  if (obj.summary.production_jsonl_append_performed !== false) fail(`${obj.title || "preview"} must not append JSONL`);
  if (obj.summary.database_write_performed !== false) fail(`${obj.title || "preview"} must not write database`);
  if (obj.summary.supabase_write_performed !== false) fail(`${obj.title || "preview"} must not write Supabase`);
  if (obj.summary.public_publishing_performed !== false) fail(`${obj.title || "preview"} must not publish`);
  if (obj.summary.production_readiness_after_ag07p !== "one_article_applied_pending_post_apply_audit") fail(`${obj.title || "preview"} production readiness mismatch`);
  if (obj.summary.publish_readiness_after_ag07p !== "static_file_changed_not_publish_approved") fail(`${obj.title || "preview"} publish readiness mismatch`);
  if (obj.summary.next_stage_id !== "AG07Q") fail(`${obj.title || "preview"} next stage must be AG07Q`);
}

if (applyRecord.validation_observations.target_start_marker_count !== 1) fail("Apply record start marker count must be 1");
if (applyRecord.validation_observations.target_end_marker_count !== 1) fail("Apply record end marker count must be 1");
if (applyRecord.validation_observations.backup_contains_ag07p_marker !== false) fail("Apply record must confirm backup has no marker");
if (applyRecord.validation_observations.target_differs_from_backup !== true) fail("Apply record must confirm target differs from backup");
if (applyRecord.validation_observations.one_article_marker_scope_confirmed !== true) fail("Apply record must confirm one-article marker scope");

if (!Array.isArray(auditPrep.audit_checklist) || auditPrep.audit_checklist.length < 6) fail("Audit prep checklist must be present");
for (const item of auditPrep.audit_checklist) {
  if (item.observed_in_ag07p !== true) fail(`Audit prep observation must pass: ${item.audit_id}`);
}

if (schema.one_article_controlled_apply_allowed_in_ag07p !== true) fail("Schema must allow one-article apply");
if (schema.pre_apply_backup_allowed_in_ag07p !== true) fail("Schema must allow pre-apply backup");
if (schema.target_article_file_write_allowed_in_ag07p !== true) fail("Schema must allow target article write");
if (schema.multi_article_mutation_allowed_in_ag07p !== false) fail("Schema must block multi-article mutation");
if (schema.production_jsonl_append_allowed_in_ag07p !== false) fail("Schema must block production JSONL append");
if (schema.database_write_allowed_in_ag07p !== false) fail("Schema must block database write");
if (schema.supabase_write_allowed_in_ag07p !== false) fail("Schema must block Supabase write");
if (schema.backend_auth_supabase_allowed_in_ag07p !== false) fail("Schema must block backend/Auth/Supabase");
if (schema.publishing_allowed_in_ag07p !== false) fail("Schema must block publishing");

if (review.closure_decision.decision !== "ag07p_one_article_controlled_apply_closed_pending_audit") fail("Closure decision mismatch");
if (review.closure_decision.proceed_to_ag07q_only_with_explicit_user_approval !== true) fail("AG07Q must require explicit approval");
if (review.closure_decision.target_article_path !== targetArticlePath) fail("Closure target path mismatch");
if (review.closure_decision.backup_file_path !== backupRelativePath) fail("Closure backup path mismatch");
if (review.closure_decision.mutated_article_count !== 1) fail("Closure mutated count must be 1");
if (review.closure_decision.multi_article_mutation_performed !== false) fail("Closure must block multi-article mutation");
if (review.closure_decision.production_jsonl_append_performed !== false) fail("Closure must block JSONL append");
if (review.closure_decision.database_write_performed !== false) fail("Closure must block database write");
if (review.closure_decision.supabase_write_performed !== false) fail("Closure must block Supabase write");
if (review.closure_decision.public_publishing_performed !== false) fail("Closure must block publishing");

checkTrueFields([review, applyRecord, auditPrep, schema, learning, registry, preview], [
  "one_article_controlled_apply_only",
  "pre_apply_backup_created",
  "backup_file_created",
  "target_article_mutated",
  "actual_public_mutation_performed",
  "public_article_mutation_performed",
  "article_html_mutation_performed",
  "static_live_apply_performed",
  "static_live_mutation_performed",
  "file_edit_performed",
  "file_write_performed",
  "article_file_write_performed",
  "human_apply_approval_performed"
]);

checkFalseFields([review, applyRecord, auditPrep, schema, learning, registry, preview], [
  "multi_article_mutation_performed",
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
  "reference_insertion_performed",
  "reference_url_population_performed",
  "approved_reference_url_population_performed",
  "visual_generation_performed",
  "visual_asset_generation_performed",
  "image_insertion_performed",
  "data_unit_generation_performed",
  "caption_alt_credit_population_performed",
  "production_packet_created",
  "actual_production_packet_created",
  "production_content_generated",
  "dry_run_score_recalculation_performed",
  "actual_score_calculation_performed",
  "production_score_record_created",
  "publish_ready_approval_performed",
  "approval_state_changed",
  "publish_ready_set",
  "scaffold_import_performed",
  "scaffold_file_copy_performed",
  "scaffold_file_move_performed",
  "scaffold_file_delete_performed"
]);

for (const scriptName of ["generate:ag07p", "validate:ag07p"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag07p")) {
  fail("validate:project must include validate:ag07p");
}

for (const phrase of [
  "Purpose",
  "Target Article",
  "What AG07P Performed",
  "What AG07P Did Not Perform",
  "Marker",
  "Audit Requirement",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG07P document missing phrase: ${phrase}`);
}

pass("AG07P registry is present.");
pass("AG07P document is present.");
pass("AG07P review, apply record, audit prep, schema, learning record and preview are present.");
pass("AG07O controlled mutation plan is consumed.");
pass("Approved target article path is enforced.");
pass("Pre-apply backup exists and has no AG07P marker.");
pass("Exactly one target article file is mutated.");
pass("Target article contains exactly one AG07P controlled apply block.");
pass("No multi-article mutation is performed.");
pass("No reference insertion, reference URL population, visual generation or image insertion is performed.");
pass("No production JSONL append, database write, Supabase write, backend/Auth/Supabase activation or publishing is performed.");
pass("Production readiness is one_article_applied_pending_post_apply_audit.");
pass("Publish readiness is static_file_changed_not_publish_approved.");
pass("AG07P is One-Article Controlled Apply only.");
pass("AG07Q Post-Mutation Audit is identified as next only with explicit approval.");
