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
  "data/content-intelligence/quality-reviews/ag07q-post-mutation-audit.json",
  "data/content-intelligence/audit-records/ag07q-post-mutation-audit-report.json",
  "data/content-intelligence/quality-registry/ag07q-rollback-readiness-record.json",
  "data/content-intelligence/schema/post-mutation-audit.schema.json",
  "data/content-intelligence/learning/ag07q-post-mutation-audit-learning.json",
  "data/content-intelligence/quality-reviews/ag07p-one-article-controlled-apply.json",
  "data/content-intelligence/apply-records/ag07p-one-article-controlled-apply.json",
  "data/content-intelligence/quality-reviews/ag07o-approval-controlled-single-article-mutation-plan.json",
  "data/content-intelligence/content-packets/ag07n-production-packet-candidate.json",
  "data/quality/ag06z-content-intelligence-foundation-closure.json",
  targetArticlePath,
  backupRelativePath,
  "data/content-intelligence/quality-reviews/ag07z-repeatable-production-readiness-closure.json",
  "data/content-intelligence/closure-registry/ag07z-controlled-chain-closure.json",
  "data/content-intelligence/run-registry/ag07z-next-cycle-recommendations.json",
  "data/content-intelligence/schema/repeatable-production-readiness-closure.schema.json",
  "data/content-intelligence/learning/ag07z-repeatable-production-readiness-learning.json",
  "data/quality/ag07z-repeatable-production-readiness-closure.json",
  "data/quality/ag07z-repeatable-production-readiness-closure-preview.json",
  "docs/quality/AG07Z_REPEATABLE_PRODUCTION_READINESS_CLOSURE.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG07Z validation failed: ${message}`);
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

const ag07qReview = readJson("data/content-intelligence/quality-reviews/ag07q-post-mutation-audit.json");
const ag07qAuditReport = readJson("data/content-intelligence/audit-records/ag07q-post-mutation-audit-report.json");
const ag07qRollbackReadiness = readJson("data/content-intelligence/quality-registry/ag07q-rollback-readiness-record.json");
const ag07qSchema = readJson("data/content-intelligence/schema/post-mutation-audit.schema.json");
const ag07pReview = readJson("data/content-intelligence/quality-reviews/ag07p-one-article-controlled-apply.json");
const ag07oReview = readJson("data/content-intelligence/quality-reviews/ag07o-approval-controlled-single-article-mutation-plan.json");
const ag07nCandidate = readJson("data/content-intelligence/content-packets/ag07n-production-packet-candidate.json");

const review = readJson("data/content-intelligence/quality-reviews/ag07z-repeatable-production-readiness-closure.json");
const closureRecord = readJson("data/content-intelligence/closure-registry/ag07z-controlled-chain-closure.json");
const nextCycle = readJson("data/content-intelligence/run-registry/ag07z-next-cycle-recommendations.json");
const schema = readJson("data/content-intelligence/schema/repeatable-production-readiness-closure.schema.json");
const learning = readJson("data/content-intelligence/learning/ag07z-repeatable-production-readiness-learning.json");
const registry = readJson("data/quality/ag07z-repeatable-production-readiness-closure.json");
const preview = readJson("data/quality/ag07z-repeatable-production-readiness-closure-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG07Z_REPEATABLE_PRODUCTION_READINESS_CLOSURE.md"), "utf8");

for (const obj of [review, closureRecord, nextCycle, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG07Z") fail(`module_id must be AG07Z in ${obj.title || "preview"}`);
}

if (!["ag07_repeatable_production_readiness_closed", "ag07_repeatable_production_readiness_review_required"].includes(review.status)) fail("Review status mismatch");
if (!["ag07_controlled_chain_closed", "ag07_controlled_chain_closure_review_required"].includes(closureRecord.status)) fail("Closure record status mismatch");
if (nextCycle.status !== "recommendations_recorded") fail("Next-cycle status must be recommendations_recorded");
if (schema.status !== "schema_closure_only") fail("Schema status must be schema_closure_only");
if (learning.status !== "learning_record_only") fail("Learning status must be learning_record_only");

if (ag07qReview.status !== "post_mutation_audit_passed") fail("AG07Q must be post_mutation_audit_passed");
if (ag07qReview.closure_decision.proceed_to_ag07z_only_with_explicit_user_approval !== true) fail("AG07Q must require explicit approval for AG07Z");
if (ag07qReview.closure_decision.all_audit_checks_passed !== true) fail("AG07Q must pass all audit checks");
if (ag07qReview.closure_decision.rollback_ready !== true) fail("AG07Q rollback must be ready");
if (ag07qReview.closure_decision.forbidden_system_guards_passed !== true) fail("AG07Q forbidden guards must pass");
if (ag07qReview.closure_decision.new_article_mutation_performed !== false) fail("AG07Q must not perform new mutation");
if (ag07qReview.closure_decision.file_edit_performed !== false) fail("AG07Q must not edit files");
if (ag07qReview.closure_decision.public_publishing_performed !== false) fail("AG07Q must not publish");
if (ag07qAuditReport.status !== "post_mutation_audit_passed") fail("AG07Q audit report must be passed");
if (ag07qRollbackReadiness.status !== "rollback_ready") fail("AG07Q rollback readiness must be ready");
if (ag07qSchema.new_article_mutation_allowed_in_ag07q !== false) fail("AG07Q schema must block new mutation");
if (ag07pReview.status !== "one_article_controlled_apply_performed") fail("AG07P must exist");
if (ag07oReview.status !== "approval_controlled_single_article_mutation_plan_created") fail("AG07O must exist");
if (ag07nCandidate.status !== "production_packet_candidate_created") fail("AG07N candidate must exist");

const targetHtml = fs.readFileSync(path.join(root, targetArticlePath), "utf8");
const backupHtml = fs.readFileSync(path.join(root, backupRelativePath), "utf8");

const targetStartMarkerCount = countOccurrences(targetHtml, startMarker);
const targetEndMarkerCount = countOccurrences(targetHtml, endMarker);
const backupStartMarkerCount = countOccurrences(backupHtml, startMarker);
const backupEndMarkerCount = countOccurrences(backupHtml, endMarker);

if (targetStartMarkerCount !== 1) fail(`Target must have exactly one AG07P start marker; found ${targetStartMarkerCount}`);
if (targetEndMarkerCount !== 1) fail(`Target must have exactly one AG07P end marker; found ${targetEndMarkerCount}`);
if (backupStartMarkerCount !== 0) fail(`Backup must have zero AG07P start markers; found ${backupStartMarkerCount}`);
if (backupEndMarkerCount !== 0) fail(`Backup must have zero AG07P end markers; found ${backupEndMarkerCount}`);

const articleFiles = listArticleFiles(path.join(root, "articles"));
const articleFilesWithMarker = articleFiles.filter((file) =>
  fs.readFileSync(path.join(root, file), "utf8").includes(startMarker)
);

if (articleFilesWithMarker.length !== 1 || articleFilesWithMarker[0] !== targetArticlePath) {
  fail(`Exactly one article must contain AG07P marker and it must be target. Found: ${articleFilesWithMarker.join(", ")}`);
}

if (closureRecord.final_evidence.target_hash_sha256_at_closure !== sha256(targetHtml)) fail("Closure target hash must match current target hash");
if (closureRecord.final_evidence.backup_hash_sha256_at_closure !== sha256(backupHtml)) fail("Closure backup hash must match current backup hash");

for (const obj of [review, registry, preview]) {
  if (obj.summary.ag07_chain_closure_performed !== true) fail(`${obj.title || "preview"} must perform chain closure`);
  if (obj.summary.all_closure_evidence_passed !== true) fail(`${obj.title || "preview"} must pass all closure evidence`);
  if (obj.summary.final_evidence_recorded !== true) fail(`${obj.title || "preview"} must record final evidence`);
  if (obj.summary.repeatable_doctrine_created !== true) fail(`${obj.title || "preview"} must create repeatable doctrine`);
  if (obj.summary.future_safe_operating_rules_created !== true) fail(`${obj.title || "preview"} must create future-safe rules`);
  if (obj.summary.next_cycle_recommendations_created !== true) fail(`${obj.title || "preview"} must create next-cycle recommendations`);
  if (obj.summary.target_start_marker_count !== 1) fail(`${obj.title || "preview"} target start marker count must be 1`);
  if (obj.summary.target_end_marker_count !== 1) fail(`${obj.title || "preview"} target end marker count must be 1`);
  if (obj.summary.backup_start_marker_count !== 0) fail(`${obj.title || "preview"} backup start marker count must be 0`);
  if (obj.summary.backup_end_marker_count !== 0) fail(`${obj.title || "preview"} backup end marker count must be 0`);
  if (obj.summary.article_files_with_ag07p_marker_count !== 1) fail(`${obj.title || "preview"} marker article count must be 1`);
  if (obj.summary.rollback_ready !== true) fail(`${obj.title || "preview"} rollback must be ready`);
  if (obj.summary.forbidden_system_guards_passed !== true) fail(`${obj.title || "preview"} forbidden guards must pass`);
  if (obj.summary.production_readiness_after_ag07z !== "repeatable_chain_closed_one_article_audited") fail(`${obj.title || "preview"} production readiness mismatch`);
  if (obj.summary.publish_readiness_after_ag07z !== "static_file_changed_not_publish_approved") fail(`${obj.title || "preview"} publish readiness mismatch`);
}

if (closureRecord.closure_readiness.closure_ready !== true) fail("Closure readiness must be true");
if (!Array.isArray(closureRecord.repeatable_doctrine) || closureRecord.repeatable_doctrine.length < 10) fail("Repeatable doctrine must have at least 10 rules");
if (!Array.isArray(closureRecord.future_safe_operating_rules) || closureRecord.future_safe_operating_rules.length < 7) fail("Future-safe operating rules must have at least 7 rules");
if (!Array.isArray(nextCycle.recommended_options) || nextCycle.recommended_options.length < 4) fail("Next-cycle recommendations must include options");
if (nextCycle.explicit_approval_required !== true) fail("Next cycle must require explicit approval");
if (nextCycle.activation_status !== "not_started") fail("Next cycle must not be started");

if (schema.closure_governance_allowed_in_ag07z !== true) fail("Schema must allow closure governance");
if (schema.final_evidence_recording_allowed_in_ag07z !== true) fail("Schema must allow evidence recording");
if (schema.repeatable_doctrine_recording_allowed_in_ag07z !== true) fail("Schema must allow doctrine recording");
if (schema.new_article_mutation_allowed_in_ag07z !== false) fail("Schema must block new mutation");
if (schema.file_edit_allowed_in_ag07z !== false) fail("Schema must block file edit");
if (schema.target_article_file_write_allowed_in_ag07z !== false) fail("Schema must block target article write");
if (schema.reference_insertion_allowed_in_ag07z !== false) fail("Schema must block reference insertion");
if (schema.visual_generation_allowed_in_ag07z !== false) fail("Schema must block visual generation");
if (schema.production_jsonl_append_allowed_in_ag07z !== false) fail("Schema must block JSONL append");
if (schema.database_write_allowed_in_ag07z !== false) fail("Schema must block database write");
if (schema.supabase_write_allowed_in_ag07z !== false) fail("Schema must block Supabase write");
if (schema.backend_auth_supabase_allowed_in_ag07z !== false) fail("Schema must block backend/Auth/Supabase");
if (schema.publishing_allowed_in_ag07z !== false) fail("Schema must block publishing");

if (review.closure_decision.decision !== "ag07z_controlled_chain_closed") fail("Closure decision must close chain");
if (review.closure_decision.ag07_chain_closed !== true) fail("AG07 chain must be closed");
if (review.closure_decision.repeatable_production_readiness_recorded !== true) fail("Repeatable readiness must be recorded");
if (review.closure_decision.next_cycle_requires_explicit_approval !== true) fail("Next cycle must require explicit approval");
if (review.closure_decision.production_readiness !== "repeatable_chain_closed_one_article_audited") fail("Closure production readiness mismatch");
if (review.closure_decision.publish_readiness !== "static_file_changed_not_publish_approved") fail("Closure publish readiness mismatch");

checkTrueFields([review, closureRecord, nextCycle, schema, learning, registry, preview], [
  "closure_governance_only",
  "ag07_chain_closure_created",
  "final_evidence_recorded",
  "repeatable_doctrine_created",
  "future_safe_operating_rules_created",
  "next_cycle_recommendations_created",
  "closure_artifacts_created",
  "target_article_read_performed",
  "backup_file_read_performed",
  "marker_scope_verified",
  "rollback_readiness_carried_forward",
  "forbidden_system_guard_carried_forward",
  "post_apply_quality_carried_forward"
]);

checkFalseFields([review, closureRecord, nextCycle, schema, learning, registry, preview], [
  "new_article_mutation_performed",
  "public_article_mutation_performed",
  "article_html_mutation_performed",
  "static_live_apply_performed",
  "static_live_mutation_performed",
  "file_edit_performed",
  "file_write_performed",
  "article_file_write_performed",
  "target_article_file_write_performed",
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
  "multi_article_mutation_performed",
  "backend_auth_supabase_activation_performed"
]);

for (const scriptName of ["generate:ag07z", "validate:ag07z"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag07z")) {
  fail("validate:project must include validate:ag07z");
}

for (const phrase of [
  "Purpose",
  "Closed Chain",
  "Final Evidence",
  "Closure Decision",
  "Repeatable Doctrine",
  "Explicit Exclusions",
  "Next-Cycle Recommendation"
]) {
  if (!docText.includes(phrase)) fail(`AG07Z document missing phrase: ${phrase}`);
}

pass("AG07Z registry is present.");
pass("AG07Z document is present.");
pass("AG07Z review, closure record, next-cycle recommendations, schema, learning record and preview are present.");
pass("AG07Q post-mutation audit is consumed and passed.");
pass("Final evidence is recorded.");
pass("Target article marker scope remains valid.");
pass("Backup integrity remains valid.");
pass("Rollback readiness is carried forward.");
pass("Forbidden-system guards are carried forward.");
pass("Repeatable doctrine is created.");
pass("Future-safe operating rules are created.");
pass("Next-cycle recommendations are recorded but not started.");
pass("No new article mutation, file edit, reference insertion, visual generation or image insertion is performed.");
pass("No production JSONL append, database write, Supabase write, backend/Auth/Supabase activation or publishing is performed.");
pass("Production readiness is repeatable_chain_closed_one_article_audited.");
pass("Publish readiness remains static_file_changed_not_publish_approved.");
pass("AG07Z closes the AG07 controlled article-upgrade chain.");
