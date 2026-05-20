import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag08g-one-article-controlled-apply.json",
  "data/content-intelligence/apply-records/ag08g-one-article-controlled-apply.json",
  "data/content-intelligence/quality-registry/ag08g-post-apply-audit-prep.json",
  "data/content-intelligence/quality-reviews/ag08h-post-apply-audit.json",
  "data/content-intelligence/audit-records/ag08h-post-apply-audit-report.json",
  "data/content-intelligence/quality-registry/ag08h-rollback-readiness-record.json",
  "data/content-intelligence/schema/post-apply-audit-ag08h.schema.json",
  "data/content-intelligence/learning/ag08h-post-apply-audit-learning.json",
  "data/quality/ag08h-post-apply-audit.json",
  "data/quality/ag08h-post-apply-audit-preview.json",
  "docs/quality/AG08H_POST_APPLY_AUDIT.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG08H validation failed: ${message}`);
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

function ag08kControlledVisualInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag08k-controlled-visual-image-insertion-apply.json");
  if (!fs.existsSync(applyRecordPath)) return false;

  try {
    const applyRecord = JSON.parse(fs.readFileSync(applyRecordPath, "utf8"));
    if (
      applyRecord.module_id !== "AG08K" ||
      applyRecord.status !== "controlled_visual_image_inserted_pending_post_insertion_audit" ||
      applyRecord.image_insertion_performed_in_ag08k !== true ||
      applyRecord.article_mutation_performed_in_ag08k !== true ||
      applyRecord.exactly_one_visual_block_inserted !== true
    ) {
      return false;
    }

    if (selectedPath && selectedPath !== applyRecord.selected_article_path) return false;

    const targetAbs = path.join(root, applyRecord.selected_article_path);
    if (!fs.existsSync(targetAbs)) return false;

    const html = fs.readFileSync(targetAbs, "utf8");
    const hashToCheck = currentHash || sha256(html);

    return (
      applyRecord.post_insertion_hash === hashToCheck &&
      html.includes("AG08K-HERO-VISUAL-INSERTION") &&
      html.includes(applyRecord.asset_src_inserted)
    );
  } catch {
    return false;
  }
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

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag08gReview = readJson("data/content-intelligence/quality-reviews/ag08g-one-article-controlled-apply.json");
const ag08gApply = readJson("data/content-intelligence/apply-records/ag08g-one-article-controlled-apply.json");
const ag08gAuditPrep = readJson("data/content-intelligence/quality-registry/ag08g-post-apply-audit-prep.json");

const review = readJson("data/content-intelligence/quality-reviews/ag08h-post-apply-audit.json");
const audit = readJson("data/content-intelligence/audit-records/ag08h-post-apply-audit-report.json");
const rollback = readJson("data/content-intelligence/quality-registry/ag08h-rollback-readiness-record.json");
const schema = readJson("data/content-intelligence/schema/post-apply-audit-ag08h.schema.json");
const learning = readJson("data/content-intelligence/learning/ag08h-post-apply-audit-learning.json");
const registry = readJson("data/quality/ag08h-post-apply-audit.json");
const preview = readJson("data/quality/ag08h-post-apply-audit-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG08H_POST_APPLY_AUDIT.md"), "utf8");

for (const obj of [review, audit, rollback, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG08H") fail(`module_id must be AG08H in ${obj.title || "object"}`);
}

if (ag08gReview.status !== "one_article_controlled_apply_completed") fail("AG08G review must be completed");
if (ag08gApply.status !== "one_article_controlled_apply_completed_pending_audit") fail("AG08G apply record status mismatch");
if (ag08gAuditPrep.status !== "post_apply_audit_required") fail("AG08G audit prep must require audit");

const target = ag08gApply.selected_article_path;
const backupPath = ag08gApply.backup_path;

if (!fs.existsSync(path.join(root, target))) fail(`Target article missing: ${target}`);
if (!fs.existsSync(path.join(root, backupPath))) fail(`Backup missing: ${backupPath}`);

const targetHtml = fs.readFileSync(path.join(root, target), "utf8");
const backupHtml = fs.readFileSync(path.join(root, backupPath), "utf8");
const targetHash = sha256(targetHtml);
const backupHash = sha256(backupHtml);
const hasLegacyMarker = targetHtml.includes("AG08G-LEGACY-GOVERNANCE-PRESERVED");
const hasAg03cB2Evidence =
  /AG03C-B2/i.test(targetHtml) ||
  /data-drishvara-ag03c-b2-reference-block=["']true["']/i.test(targetHtml);

const hasAg05dEvidence =
  /AG05D/i.test(targetHtml) ||
  /data-drishvara-ag05d-visible-reference-block=["']true["']/i.test(targetHtml) ||
  /drishvara-ag05d-visible-reference-block/i.test(targetHtml);


if (targetHash !== ag08gApply.post_apply_hash && !ag08kControlledVisualInsertionAllowsPostMutation(target, targetHash)) fail("Target hash must match AG08G post-apply hash or AG08K controlled visual insertion hash");
if (backupHash !== ag08gApply.backup_hash) fail("Backup hash must match AG08G backup hash");
if (backupHash !== ag08gApply.pre_apply_hash) fail("Backup hash must match AG08G pre-apply hash");
if (targetHash === backupHash) fail("Target must differ from backup");
if (backupHtml.includes("AG08G-CONTROLLED-APPLY")) fail("Backup must not contain AG08G marker");

if (countOccurrences(targetHtml, "AG08G-CONTROLLED-APPLY") !== 1) fail("Target must contain exactly one AG08G marker");
if (countOccurrences(targetHtml, "AG08G-APPROVED-REFERENCES") !== 1) fail("Target must contain exactly one AG08G approved references marker");

const markerFiles = listHtmlFiles("articles").filter((file) => {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  return html.includes("AG08G-CONTROLLED-APPLY");
});

if (markerFiles.length !== 1) fail(`Exactly one article must contain AG08G marker; found ${markerFiles.length}`);
if (markerFiles[0] !== target) fail(`AG08G marker found in wrong article: ${markerFiles[0]}`);

if (audit.status !== "post_apply_audit_passed") fail("AG08H audit report must pass");
if (review.status !== "post_apply_audit_passed") fail("AG08H review must pass");
if (registry.status !== "post_apply_audit_passed") fail("AG08H registry must pass");
if (preview.status !== "post_apply_audit_passed") fail("AG08H preview must pass");

if (audit.backup_integrity.backup_integrity_status !== "passed") fail("Backup integrity must pass");
if (audit.mutation_scope.mutation_scope_status !== "passed") fail("Mutation scope must pass");
if (audit.reference_audit.reference_insertion_status !== "passed") fail("Reference insertion audit must pass");
if (audit.legacy_governance_preservation.legacy_governance_preservation_status !== "passed") fail("Legacy governance preservation must pass");
if (audit.forbidden_system_guards.forbidden_system_guard_status !== "passed") fail("Forbidden-system guards must pass");
if (audit.rollback_readiness.rollback_ready !== true) fail("Rollback readiness must be true");

if (!hasLegacyMarker) fail("Legacy governance preservation marker missing");
if (!hasAg03cB2Evidence) fail("AG03C-B2 legacy evidence missing");
if (!hasAg05dEvidence) fail("AG05D legacy evidence missing");

const refChecks = audit.reference_audit.inserted_reference_checks || [];
if (refChecks.length < 2) fail("At least two reference checks required");
for (const ref of refChecks) {
  if (ref.approved_in_ag08f !== true) fail(`Reference not approved in AG08F: ${ref.reference_id}`);
  if (ref.inserted_in_target_article !== true) fail(`Reference not inserted in target: ${ref.reference_id}`);
  if (!targetHtml.includes(ref.url)) fail(`Reference URL missing from target: ${ref.url}`);
}

if (rollback.status !== "rollback_ready_not_executed") fail("Rollback record must be ready and not executed");
if (rollback.rollback_readiness.rollback_execution_performed !== false) fail("Rollback must not be executed in AG08H");

if (schema.new_article_mutation_allowed_in_ag08h !== false) fail("Schema must block new article mutation");
if (schema.selected_article_file_write_allowed_in_ag08h !== false) fail("Schema must block selected article write");
if (schema.reference_insertion_allowed_in_ag08h !== false) fail("Schema must block reference insertion");
if (schema.visual_generation_allowed_in_ag08h !== false) fail("Schema must block visual generation");
if (schema.image_insertion_allowed_in_ag08h !== false) fail("Schema must block image insertion");
if (schema.production_jsonl_append_allowed_in_ag08h !== false) fail("Schema must block JSONL append");
if (schema.database_write_allowed_in_ag08h !== false) fail("Schema must block database write");
if (schema.supabase_write_allowed_in_ag08h !== false) fail("Schema must block Supabase write");
if (schema.backend_auth_supabase_activation_allowed_in_ag08h !== false) fail("Schema must block backend/Auth/Supabase");
if (schema.publishing_allowed_in_ag08h !== false) fail("Schema must block publishing");
if (schema.rollback_execution_allowed_in_ag08h !== false) fail("Schema must block rollback execution");

for (const obj of [review, audit, rollback, schema, learning, registry, preview]) {
  if (obj.post_apply_audit_only !== true) fail(`${obj.title || "object"} must be post-apply audit only`);
  if (obj.new_article_mutation_performed !== false) fail(`${obj.title || "object"} must not create new article mutation`);
  if (obj.selected_article_mutation_performed_in_ag08h !== false) fail(`${obj.title || "object"} must not mutate selected article in AG08H`);
  if (obj.file_edit_performed_in_ag08h !== false) fail(`${obj.title || "object"} must not edit files in AG08H`);
  if (obj.reference_insertion_performed_in_ag08h !== false) fail(`${obj.title || "object"} must not insert references in AG08H`);
  if (obj.visual_generation_performed_in_ag08h !== false) fail(`${obj.title || "object"} must not generate visuals in AG08H`);
  if (obj.image_insertion_performed_in_ag08h !== false) fail(`${obj.title || "object"} must not insert images in AG08H`);
  if (obj.production_jsonl_append_performed_in_ag08h !== false) fail(`${obj.title || "object"} must not append JSONL in AG08H`);
  if (obj.database_write_performed_in_ag08h !== false) fail(`${obj.title || "object"} must not write database in AG08H`);
  if (obj.supabase_write_performed_in_ag08h !== false) fail(`${obj.title || "object"} must not write Supabase in AG08H`);
  if (obj.backend_auth_supabase_activation_performed_in_ag08h !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase in AG08H`);
  if (obj.public_publishing_performed_in_ag08h !== false) fail(`${obj.title || "object"} must not publish in AG08H`);
}

if (review.closure_decision.decision !== "ag08g_apply_audited_pending_next_explicit_stage") fail("AG08H closure decision mismatch");
if (review.closure_decision.proceed_to_ag08i_only_with_explicit_user_approval !== true) fail("AG08I must require explicit approval");
if (review.closure_decision.production_readiness !== "one_article_apply_audited") fail("Production readiness mismatch");
if (review.closure_decision.publish_readiness !== "static_file_changed_not_publish_approved") fail("Publish readiness mismatch");

for (const scriptName of ["generate:ag08h", "validate:ag08h"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag08h")) {
  fail("validate:project must include validate:ag08h");
}

for (const phrase of [
  "Purpose",
  "Selected Article",
  "Audit Status",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG08H document missing phrase: ${phrase}`);
}

pass("AG08H registry is present.");
pass("AG08H document is present.");
pass("AG08H review, audit report, rollback readiness, schema, learning record and preview are present.");
pass("AG08G apply record and audit prep are consumed.");
pass("Backup integrity is confirmed.");
pass("Single-article mutation scope is confirmed.");
pass("AG08G marker count is valid.");
pass("AG08F-approved references are confirmed in the target article.");
pass("Legacy governance preservation is confirmed.");
pass("Forbidden-system guards are confirmed.");
pass("Rollback readiness is confirmed.");
pass("No new article mutation, file edit, reference insertion, visual generation or image insertion is performed.");
pass("No production JSONL append, database write, Supabase write, backend/Auth/Supabase activation or publishing is performed.");
pass("Production readiness is one_article_apply_audited.");
pass("Publish readiness remains static_file_changed_not_publish_approved.");
pass("AG08I Visual Generation / Image Insertion Plan is identified as next only with explicit approval.");
