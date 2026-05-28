import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag13c-controlled-live-preview-observation-audit.json",
  "data/content-intelligence/audit-records/ag13c-controlled-live-preview-observation-audit-report.json",
  "data/content-intelligence/quality-registry/ag13c-live-preview-observation-record.json",
  "data/content-intelligence/quality-registry/ag13c-final-publish-decision-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag13c-to-ag13z-final-live-verification-publish-decision-closure-boundary.json",
  "data/content-intelligence/apply-records/ag12c-controlled-layout-refinement-apply.json",
  "data/content-intelligence/object-registry/ag12z-refined-article-production-state-record.json",

  "data/content-intelligence/quality-reviews/ag13z-final-live-verification-admin-review-handoff-closure.json",
  "data/content-intelligence/closure-records/ag13z-final-live-verification-admin-review-handoff-closure.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",
  "data/admin-review/index/admin-review-queue-index.json",
  "data/content-intelligence/quality-registry/ag13z-admin-review-handoff-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag13z-to-ag14a-admin-review-queue-architecture-boundary.json",
  "data/content-intelligence/schema/final-live-verification-admin-review-handoff-closure.schema.json",
  "data/content-intelligence/learning/ag13z-final-live-verification-admin-review-handoff-closure-learning.json",
  "data/quality/ag13z-final-live-verification-admin-review-handoff-closure.json",
  "data/quality/ag13z-final-live-verification-admin-review-handoff-closure-preview.json",
  "docs/quality/AG13Z_FINAL_LIVE_VERIFICATION_ADMIN_REVIEW_HANDOFF_CLOSURE.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG13Z validation failed: ${message}`);
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

function hashPairMatchesCurrentOrAg12cR1Repair(leftHash, rightHash, articlePath = null) {
  if (leftHash === rightHash) return true;

  const ag12cR1ApplyPath = path.join(root, "data/content-intelligence/apply-records/ag12c-r1-public-object-label-layout-repair.json");
  if (!fs.existsSync(ag12cR1ApplyPath)) return false;

  try {
    const ag12cR1Apply = JSON.parse(fs.readFileSync(ag12cR1ApplyPath, "utf8"));

    const articlePathMatches =
      articlePath === null ||
      articlePath === undefined ||
      ag12cR1Apply.selected_article_path === articlePath;

    if (!articlePathMatches) return false;

    return (
      ag12cR1Apply.status === "public_object_label_layout_repair_applied" &&
      (
        (
          ag12cR1Apply.pre_repair_hash === leftHash &&
          ag12cR1Apply.post_repair_hash === rightHash
        ) ||
        (
          ag12cR1Apply.pre_repair_hash === rightHash &&
          ag12cR1Apply.post_repair_hash === leftHash
        )
      )
    );
  } catch {
    return false;
  }
}


for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag13cReview = readJson("data/content-intelligence/quality-reviews/ag13c-controlled-live-preview-observation-audit.json");
const ag13cAudit = readJson("data/content-intelligence/audit-records/ag13c-controlled-live-preview-observation-audit-report.json");
const ag13cReadiness = readJson("data/content-intelligence/quality-registry/ag13c-final-publish-decision-readiness-record.json");
const ag13cBoundary = readJson("data/content-intelligence/mutation-plans/ag13c-to-ag13z-final-live-verification-publish-decision-closure-boundary.json");
const ag12cApply = readJson("data/content-intelligence/apply-records/ag12c-controlled-layout-refinement-apply.json");

const review = readJson("data/content-intelligence/quality-reviews/ag13z-final-live-verification-admin-review-handoff-closure.json");
const closure = readJson("data/content-intelligence/closure-records/ag13z-final-live-verification-admin-review-handoff-closure.json");
const candidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");
const queueIndex = readJson("data/admin-review/index/admin-review-queue-index.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag13z-admin-review-handoff-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag13z-to-ag14a-admin-review-queue-architecture-boundary.json");
const schema = readJson("data/content-intelligence/schema/final-live-verification-admin-review-handoff-closure.schema.json");
const learning = readJson("data/content-intelligence/learning/ag13z-final-live-verification-admin-review-handoff-closure-learning.json");
const registry = readJson("data/quality/ag13z-final-live-verification-admin-review-handoff-closure.json");
const preview = readJson("data/quality/ag13z-final-live-verification-admin-review-handoff-closure-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG13Z_FINAL_LIVE_VERIFICATION_ADMIN_REVIEW_HANDOFF_CLOSURE.md"), "utf8");

for (const obj of [review, closure, candidate, queueIndex, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG13Z") fail(`module_id must be AG13Z in ${obj.title || obj.record_type || "object"}`);
}

if (ag13cReview.status !== "controlled_live_preview_observation_audit_passed") fail("AG13C review status mismatch");
if (ag13cAudit.failed_checks.length !== 0) fail("AG13C failed checks must be zero");
if (ag13cReadiness.ready_for_ag13z !== true) fail("AG13C readiness for AG13Z missing");
if (ag13cBoundary.next_stage_id !== "AG13Z") fail("AG13Z boundary missing in AG13C");

const articlePath = ag12cApply.selected_article_path;
const backupPath = ag12cApply.backup_path;

if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
if (!fs.existsSync(path.join(root, backupPath))) fail(`Rollback backup missing: ${backupPath}`);

const articleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
const backupHash = sha256(fs.readFileSync(path.join(root, backupPath), "utf8"));

const ag12cR1ApplyPath = "data/content-intelligence/apply-records/ag12c-r1-public-object-label-layout-repair.json";
const hasAg12cR1Repair = fs.existsSync(path.join(root, ag12cR1ApplyPath));
const ag12cR1Apply = hasAg12cR1Repair ? readJson(ag12cR1ApplyPath) : null;

if (hasAg12cR1Repair) {
  if (!hashPairMatchesCurrentOrAg12cR1Repair(articleHash, ag12cR1Apply.post_repair_hash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Current article hash must match AG12C-R1 post-repair hash or AG12C-R1 repaired article state missing");
  if (!hashPairMatchesCurrentOrAg12cR1Repair(ag12cR1Apply.pre_repair_hash, ag12cApply.post_refinement_hash, typeof articlePath !== "undefined" ? articlePath : null)) fail("AG12C-R1 must supersede AG12C post-refinement hash or AG12C-R1 repaired article state missing");
} else if (articleHash !== ag12cApply.post_refinement_hash) {
  fail("Current article hash must remain AG12C post-refinement hash");
}
if (backupHash !== ag12cApply.pre_refinement_hash) fail("Rollback backup hash must remain AG12C pre-refinement hash");

if (review.status !== "final_live_verification_closed_admin_review_handoff_created") fail("Review status mismatch");
if (closure.status !== "final_live_verification_closed_admin_review_handoff_created") fail("Closure status mismatch");

if (candidate.record_type !== "admin_review_candidate_packet") fail("Candidate packet type mismatch");
if (candidate.status !== "ready_for_admin_review") fail("Candidate must be ready for admin review");
if (candidate.admin_visibility !== "admin_review_only") fail("Candidate must be admin-review only");
if (candidate.public_visibility !== false) fail("Candidate public visibility must be false");
if (candidate.publish_approved !== false) fail("Candidate must not be publish-approved");
if (candidate.publish_readiness_score < 80 || candidate.publish_readiness_score > 100) fail("Publish readiness score must be realistic");
if (!Array.isArray(candidate.hard_blockers) || candidate.hard_blockers.length !== 0) fail("Hard blockers must be empty");
if (!Array.isArray(candidate.available_admin_actions) || candidate.available_admin_actions.length !== 4) fail("Four admin actions must be available");
for (const action of ["archive", "return_for_correction", "publish", "publish_and_close"]) {
  if (!candidate.available_admin_actions.includes(action)) fail(`Missing admin action: ${action}`);
}

if (queueIndex.record_type !== "admin_review_queue_index") fail("Queue index type mismatch");
if (queueIndex.status !== "admin_review_queue_seeded") fail("Queue index status mismatch");
if (queueIndex.total_candidates !== 1) fail("Queue index must contain one seeded candidate");
if (!Array.isArray(queueIndex.candidates) || queueIndex.candidates.length !== 1) fail("Queue index candidate list mismatch");

if (readiness.status !== "ready_for_ag14a_admin_review_queue_architecture") fail("Readiness status mismatch");
if (readiness.ready_for_ag14a !== true) fail("AG14A readiness missing");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");
if (readiness.publish_approval_required !== true) fail("Publish approval must remain required");
if (readiness.backend_activation_ready !== false) fail("Backend activation must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");

if (boundary.status !== "ag14a_boundary_created_not_started") fail("AG14A boundary status mismatch");
if (boundary.next_stage_id !== "AG14A") fail("AG14A handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG14A explicit approval missing");

if (schema.status !== "schema_final_live_verification_admin_review_handoff_closure_only") fail("Schema status mismatch");

for (const key of [
  "final_live_verification_closure_allowed_in_ag13z",
  "admin_candidate_packet_allowed_in_ag13z",
  "admin_queue_index_allowed_in_ag13z",
  "publish_readiness_score_allowed_in_ag13z",
  "ag14a_boundary_allowed_in_ag13z"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_mutation_allowed_in_ag13z",
  "automatic_publish_allowed_in_ag13z",
  "public_visibility_switch_allowed_in_ag13z",
  "object_generation_allowed_in_ag13z",
  "object_insertion_allowed_in_ag13z",
  "object_removal_allowed_in_ag13z",
  "live_fetch_allowed_in_ag13z",
  "deployment_trigger_allowed_in_ag13z",
  "css_js_mutation_allowed_in_ag13z",
  "database_write_allowed_in_ag13z",
  "supabase_write_allowed_in_ag13z",
  "backend_auth_supabase_activation_allowed_in_ag13z",
  "public_publishing_operation_allowed_in_ag13z"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, closure, candidate, queueIndex, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.final_live_verification_admin_review_handoff_closure_only !== true) fail(`${obj.title || obj.record_type || "object"} must be AG13Z closure only`);
  if (obj.article_mutation_performed_in_ag13z !== false) fail(`${obj.title || obj.record_type || "object"} must not mutate article`);
  if (obj.object_generation_performed_in_ag13z !== false) fail(`${obj.title || obj.record_type || "object"} must not generate object`);
  if (obj.object_insertion_performed_in_ag13z !== false) fail(`${obj.title || obj.record_type || "object"} must not insert object`);
  if (obj.deployment_trigger_performed_in_ag13z !== false) fail(`${obj.title || obj.record_type || "object"} must not trigger deployment`);
  if (obj.backend_auth_supabase_activation_performed_in_ag13z !== false) fail(`${obj.title || obj.record_type || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_operation_performed_in_ag13z !== false) fail(`${obj.title || obj.record_type || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Closure Result", "Admin Review Candidate", "Publish Readiness", "Admin Actions Planned", "Publishing Boundary", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG13Z document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag13z", "validate:ag13z"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag13z")) {
  fail("validate:project must include validate:ag13z");
}

pass("AG13Z registry is present.");
pass("AG13Z document is present.");
pass("AG13Z review, closure, admin candidate, queue index, readiness, AG14A boundary, schema, learning and preview are present.");
pass("AG13C live observation and AG12C refined article state are consumed.");
pass("Current article hash remains AG12C post-refinement hash.");
pass("Admin Review Candidate Packet is created with publish-readiness score and zero hard blockers.");
pass("Admin actions are prepared: Archive, Return for correction, Publish, Publish and close.");
pass("Publishing remains blocked pending Admin decision.");
pass("Backend and Supabase activation remain blocked.");
pass("No article mutation, public visibility switch, deployment trigger, backend activation or publishing operation is performed.");
pass("AG14A admin review queue architecture boundary is created with explicit approval required.");
pass("AG13Z is Final Live Verification and Admin Review Handoff Closure only.");
