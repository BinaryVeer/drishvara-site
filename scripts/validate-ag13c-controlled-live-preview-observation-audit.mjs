import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag13b-final-editorial-live-verification-audit.json",
  "data/content-intelligence/audit-records/ag13b-final-editorial-live-verification-audit-report.json",
  "data/content-intelligence/quality-registry/ag13b-final-editorial-live-verification-observation-record.json",
  "data/content-intelligence/quality-registry/ag13b-live-preview-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag13b-to-ag13c-controlled-live-preview-observation-boundary.json",
  "data/content-intelligence/apply-records/ag12c-controlled-layout-refinement-apply.json",

  "data/content-intelligence/quality-reviews/ag13c-controlled-live-preview-observation-audit.json",
  "data/content-intelligence/audit-records/ag13c-controlled-live-preview-observation-audit-report.json",
  "data/content-intelligence/quality-registry/ag13c-live-preview-observation-record.json",
  "data/content-intelligence/quality-registry/ag13c-final-publish-decision-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag13c-to-ag13z-final-live-verification-publish-decision-closure-boundary.json",
  "data/content-intelligence/schema/controlled-live-preview-observation-audit.schema.json",
  "data/content-intelligence/learning/ag13c-controlled-live-preview-observation-audit-learning.json",
  "data/quality/ag13c-controlled-live-preview-observation-audit.json",
  "data/quality/ag13c-controlled-live-preview-observation-audit-preview.json",
  "docs/quality/AG13C_CONTROLLED_LIVE_PREVIEW_OBSERVATION_AUDIT.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG13C validation failed: ${message}`);
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

function ag12cR1AwarePostRefinementHashMatches(ag12cApply, currentHash) {
  const ag12cR1ApplyPath = path.join(root, "data/content-intelligence/apply-records/ag12c-r1-public-object-label-layout-repair.json");

  if (fs.existsSync(ag12cR1ApplyPath)) {
    try {
      const ag12cR1Apply = JSON.parse(fs.readFileSync(ag12cR1ApplyPath, "utf8"));
      return (
        ag12cR1Apply.status === "public_object_label_layout_repair_applied" &&
        ag12cR1Apply.selected_article_path === ag12cApply.selected_article_path &&
        ag12cR1Apply.pre_repair_hash === ag12cApply.post_refinement_hash &&
        ag12cR1Apply.post_repair_hash === currentHash
      );
    } catch {
      return false;
    }
  }

  return ag12cApply.post_refinement_hash === currentHash;
}


for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag13bReview = readJson("data/content-intelligence/quality-reviews/ag13b-final-editorial-live-verification-audit.json");
const ag13bAudit = readJson("data/content-intelligence/audit-records/ag13b-final-editorial-live-verification-audit-report.json");
const ag13bReadiness = readJson("data/content-intelligence/quality-registry/ag13b-live-preview-readiness-record.json");
const ag13bBoundary = readJson("data/content-intelligence/mutation-plans/ag13b-to-ag13c-controlled-live-preview-observation-boundary.json");
const ag12cApply = readJson("data/content-intelligence/apply-records/ag12c-controlled-layout-refinement-apply.json");

const review = readJson("data/content-intelligence/quality-reviews/ag13c-controlled-live-preview-observation-audit.json");
const audit = readJson("data/content-intelligence/audit-records/ag13c-controlled-live-preview-observation-audit-report.json");
const observation = readJson("data/content-intelligence/quality-registry/ag13c-live-preview-observation-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag13c-final-publish-decision-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag13c-to-ag13z-final-live-verification-publish-decision-closure-boundary.json");
const schema = readJson("data/content-intelligence/schema/controlled-live-preview-observation-audit.schema.json");
const learning = readJson("data/content-intelligence/learning/ag13c-controlled-live-preview-observation-audit-learning.json");
const registry = readJson("data/quality/ag13c-controlled-live-preview-observation-audit.json");
const preview = readJson("data/quality/ag13c-controlled-live-preview-observation-audit-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG13C_CONTROLLED_LIVE_PREVIEW_OBSERVATION_AUDIT.md"), "utf8");

for (const obj of [review, audit, observation, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG13C") fail(`module_id must be AG13C in ${obj.title || "object"}`);
}

if (ag13bReview.status !== "final_editorial_live_verification_audit_passed_ready_for_live_preview_observation") fail("AG13B review status mismatch");
if (ag13bAudit.failed_checks.length !== 0) fail("AG13B failed checks must be zero");
if (ag13bReadiness.ready_for_ag13c !== true) fail("AG13B readiness for AG13C missing");
if (ag13bBoundary.next_stage_id !== "AG13C") fail("AG13C boundary missing in AG13B");

const articlePath = ag12cApply.selected_article_path;
const backupPath = ag12cApply.backup_path;

if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
if (!fs.existsSync(path.join(root, backupPath))) fail(`Rollback backup missing: ${backupPath}`);

const localHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
const backupHash = sha256(fs.readFileSync(path.join(root, backupPath), "utf8"));

if (!ag12cR1AwarePostRefinementHashMatches(ag12cApply, localHash)) fail("Article hash must match AG12C or AG12C-R1 refined state");
if (backupHash !== ag12cApply.pre_refinement_hash) fail("Rollback backup hash must remain AG12C pre-refinement hash");

if (review.status !== "controlled_live_preview_observation_audit_passed") fail("Review status mismatch");
if (audit.status !== "controlled_live_preview_observation_audit_passed") fail("Audit status mismatch");
if (observation.status !== "controlled_live_preview_observation_passed_ready_for_final_publish_decision_closure") fail("Observation status mismatch");
if (readiness.status !== "ready_for_ag13z_final_live_verification_publish_decision_closure") fail("Readiness status mismatch");

if (!Array.isArray(audit.checks) || audit.checks.length !== 9) fail("AG13C must record nine audit checks");
if (audit.failed_checks.length !== 0) fail("AG13C failed checks must be zero");
if (audit.decision.live_preview_observation_passed !== true) fail("Live preview observation decision must pass");
if (audit.decision.ready_for_ag13z_final_publish_decision_closure !== true) fail("AG13Z readiness decision missing");
if (audit.decision.publish_ready !== false) fail("AG13C must not mark publish ready");

if (!observation.live_url || !observation.live_url.startsWith("http")) fail("Live URL must be recorded");
if (!(observation.http_status >= 200 && observation.http_status < 300)) fail("Live HTTP status must be 2xx");
if (observation.live_checks.status_ok !== true) fail("Live status check must pass");
if (observation.live_checks.contains_refined_layout_marker !== true) fail("Live refined layout marker must be present");
if (observation.live_checks.collapsed_pilot_count !== 3) fail("Live collapsed pilot object count must be three");
if (observation.live_checks.contains_primary_chart !== true) fail("Live chart marker must be present");
if (observation.live_checks.contains_table !== true) fail("Live table marker must be present");
if (observation.live_checks.contains_composite !== true) fail("Live composite marker must be present");
if (observation.live_checks.contains_drishvara_credit !== true) fail("Live Drishvara credit must be present");
if (observation.live_checks.contains_caption_or_accessibility_text !== true) fail("Live caption/accessibility text must be present");

if (readiness.ready_for_ag13z !== true) fail("AG13Z readiness missing");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");
if (readiness.publish_approval_required !== true) fail("Publish approval must remain required");
if (readiness.backend_activation_ready !== false) fail("Backend activation must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");

if (boundary.status !== "ag13z_boundary_created_not_started") fail("AG13Z boundary status mismatch");
if (boundary.next_stage_id !== "AG13Z") fail("AG13Z handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG13Z explicit approval missing");

if (schema.status !== "schema_controlled_live_preview_observation_audit") fail("Schema status mismatch");

for (const key of [
  "live_fetch_allowed_in_ag13c",
  "live_preview_observation_allowed_in_ag13c",
  "marker_level_live_validation_allowed_in_ag13c",
  "readiness_record_allowed_in_ag13c",
  "ag13z_boundary_allowed_in_ag13c"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_mutation_allowed_in_ag13c",
  "object_generation_allowed_in_ag13c",
  "object_insertion_allowed_in_ag13c",
  "object_removal_allowed_in_ag13c",
  "deployment_trigger_allowed_in_ag13c",
  "css_js_mutation_allowed_in_ag13c",
  "reference_url_change_allowed_in_ag13c",
  "database_write_allowed_in_ag13c",
  "supabase_write_allowed_in_ag13c",
  "backend_auth_supabase_activation_allowed_in_ag13c",
  "public_publishing_operation_allowed_in_ag13c"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, audit, observation, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.controlled_live_preview_observation_audit_only !== true) fail(`${obj.title || "object"} must be AG13C observation only`);
  if (obj.live_fetch_performed_in_ag13c !== true) fail(`${obj.title || "object"} must record live fetch`);
  if (obj.deployment_trigger_performed_in_ag13c !== false) fail(`${obj.title || "object"} must not trigger deployment`);
  if (obj.article_mutation_performed_in_ag13c !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.object_generation_performed_in_ag13c !== false) fail(`${obj.title || "object"} must not generate object`);
  if (obj.object_insertion_performed_in_ag13c !== false) fail(`${obj.title || "object"} must not insert object`);
  if (obj.css_file_mutation_performed_in_ag13c !== false) fail(`${obj.title || "object"} must not mutate CSS`);
  if (obj.js_file_mutation_performed_in_ag13c !== false) fail(`${obj.title || "object"} must not mutate JS`);
  if (obj.backend_auth_supabase_activation_performed_in_ag13c !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_operation_performed_in_ag13c !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Live URL", "Observation Result", "Decision", "Publishing Boundary", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG13C document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag13c", "validate:ag13c"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag13c")) {
  fail("validate:project must include validate:ag13c");
}

pass("AG13C registry is present.");
pass("AG13C document is present.");
pass("AG13C review, live observation audit, readiness record, AG13Z boundary, schema, learning and preview are present.");
pass("AG13B readiness and AG12C refined article state are consumed.");
pass("Local article hash remains AG12C post-refinement hash.");
pass("Controlled live URL observation passed with marker-level validation.");
pass("Live article includes refined layout, primary object evidence, credits and accessibility/caption indicators.");
pass("Article is ready for AG13Z final publish-decision closure but not publish-approved in AG13C.");
pass("Publishing, backend and Supabase activation remain blocked.");
pass("No article mutation, deployment trigger, object generation, CSS/JS mutation, backend activation or publishing operation is performed.");
pass("AG13Z final live verification/publish decision closure boundary is created with explicit approval required.");
pass("AG13C is Controlled Live Preview Observation Audit only.");
