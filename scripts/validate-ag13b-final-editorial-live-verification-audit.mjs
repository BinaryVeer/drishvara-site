import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag13a-final-editorial-live-verification-readiness-plan.json",
  "data/content-intelligence/mutation-plans/ag13a-final-editorial-live-verification-readiness-plan.json",
  "data/content-intelligence/quality-registry/ag13a-final-editorial-live-verification-checklist-record.json",
  "data/content-intelligence/quality-registry/ag13a-final-editorial-live-verification-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag13a-to-ag13b-final-editorial-live-verification-audit-boundary.json",
  "data/content-intelligence/object-registry/ag12z-refined-article-production-state-record.json",
  "data/content-intelligence/apply-records/ag12c-controlled-layout-refinement-apply.json",

  "data/content-intelligence/quality-reviews/ag13b-final-editorial-live-verification-audit.json",
  "data/content-intelligence/audit-records/ag13b-final-editorial-live-verification-audit-report.json",
  "data/content-intelligence/quality-registry/ag13b-final-editorial-live-verification-observation-record.json",
  "data/content-intelligence/quality-registry/ag13b-live-preview-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag13b-to-ag13c-controlled-live-preview-observation-boundary.json",
  "data/content-intelligence/schema/final-editorial-live-verification-audit.schema.json",
  "data/content-intelligence/learning/ag13b-final-editorial-live-verification-audit-learning.json",
  "data/quality/ag13b-final-editorial-live-verification-audit.json",
  "data/quality/ag13b-final-editorial-live-verification-audit-preview.json",
  "docs/quality/AG13B_FINAL_EDITORIAL_LIVE_VERIFICATION_AUDIT.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG13B validation failed: ${message}`);
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

function articleHashAcceptedByRepairChain(recordedHash, currentHash, articlePath = null) {
  if (recordedHash === currentHash) return true;

  const repairRecords = [
    {
      path: "data/content-intelligence/apply-records/ag12c-r1-public-object-label-layout-repair.json",
      status: "public_object_label_layout_repair_applied"
    },
    {
      path: "data/content-intelligence/apply-records/ar01-r1-credit-reference-surface-cleanup.json",
      status: "credit_reference_surface_cleanup_applied"
    }
  ];

  const edges = [];

  for (const repairRecord of repairRecords) {
    const fullRepairPath = path.join(root, repairRecord.path);
    if (!fs.existsSync(fullRepairPath)) continue;

    try {
      const record = JSON.parse(fs.readFileSync(fullRepairPath, "utf8"));
      const articlePathMatches =
        articlePath === null ||
        articlePath === undefined ||
        record.selected_article_path === articlePath;

      if (
        record.status === repairRecord.status &&
        articlePathMatches &&
        record.pre_repair_hash &&
        record.post_repair_hash
      ) {
        edges.push([record.pre_repair_hash, record.post_repair_hash]);
      }
    } catch {}
  }

  function canReach(start, target) {
    if (!start || !target) return false;

    let current = start;
    const seen = new Set([current]);

    for (let i = 0; i < edges.length + 3; i += 1) {
      if (current === target) return true;

      const edge = edges.find(([from]) => from === current);
      if (!edge) return false;

      current = edge[1];
      if (seen.has(current)) return false;
      seen.add(current);
    }

    return current === target;
  }

  return canReach(recordedHash, currentHash) || canReach(currentHash, recordedHash);
}

function hashPairMatchesCurrentOrAg12cR1Repair(leftHash, rightHash, articlePath = null) {
  return articleHashAcceptedByRepairChain(leftHash, rightHash, articlePath);
}


for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag13aReview = readJson("data/content-intelligence/quality-reviews/ag13a-final-editorial-live-verification-readiness-plan.json");
const ag13aChecklist = readJson("data/content-intelligence/quality-registry/ag13a-final-editorial-live-verification-checklist-record.json");
const ag13aReadiness = readJson("data/content-intelligence/quality-registry/ag13a-final-editorial-live-verification-readiness-record.json");
const ag13aBoundary = readJson("data/content-intelligence/mutation-plans/ag13a-to-ag13b-final-editorial-live-verification-audit-boundary.json");
const ag12zState = readJson("data/content-intelligence/object-registry/ag12z-refined-article-production-state-record.json");
const ag12cApply = readJson("data/content-intelligence/apply-records/ag12c-controlled-layout-refinement-apply.json");

const review = readJson("data/content-intelligence/quality-reviews/ag13b-final-editorial-live-verification-audit.json");
const audit = readJson("data/content-intelligence/audit-records/ag13b-final-editorial-live-verification-audit-report.json");
const observation = readJson("data/content-intelligence/quality-registry/ag13b-final-editorial-live-verification-observation-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag13b-live-preview-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag13b-to-ag13c-controlled-live-preview-observation-boundary.json");
const schema = readJson("data/content-intelligence/schema/final-editorial-live-verification-audit.schema.json");
const learning = readJson("data/content-intelligence/learning/ag13b-final-editorial-live-verification-audit-learning.json");
const registry = readJson("data/quality/ag13b-final-editorial-live-verification-audit.json");
const preview = readJson("data/quality/ag13b-final-editorial-live-verification-audit-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG13B_FINAL_EDITORIAL_LIVE_VERIFICATION_AUDIT.md"), "utf8");

for (const obj of [review, audit, observation, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG13B") fail(`module_id must be AG13B in ${obj.title || "object"}`);
}

if (ag13aReview.status !== "final_editorial_live_verification_readiness_plan_created_no_mutation") fail("AG13A review status mismatch");
if (ag13aReadiness.ready_for_ag13b !== true) fail("AG13A readiness for AG13B missing");
if (ag13aBoundary.next_stage_id !== "AG13B") fail("AG13B boundary missing in AG13A");

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
  if (!hashPairMatchesCurrentOrAg12cR1Repair(articleHash, ag12cR1Apply.post_repair_hash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Current article hash must match AG12C-R1 post-repair hash or AG12C-R1/AR01-R1 approved repair-chain state missing");
  if (!hashPairMatchesCurrentOrAg12cR1Repair(ag12cR1Apply.pre_repair_hash, ag12cApply.post_refinement_hash, typeof articlePath !== "undefined" ? articlePath : null)) fail("AG12C-R1 must supersede AG12C post-refinement hash or AG12C-R1/AR01-R1 approved repair-chain state missing");
} else if (articleHash !== ag12cApply.post_refinement_hash) {
  fail("Current article hash must remain AG12C post-refinement hash");
}
if (backupHash !== ag12cApply.pre_refinement_hash) fail("Rollback backup hash must remain AG12C pre-refinement hash");

if (review.status !== "final_editorial_live_verification_audit_passed_ready_for_live_preview_observation") fail("Review status mismatch");
if (audit.status !== "final_editorial_live_verification_audit_passed_ready_for_live_preview_observation") fail("Audit status mismatch");
if (observation.status !== "final_editorial_live_verification_static_audit_passed_ready_for_live_preview_observation") fail("Observation status mismatch");
if (readiness.status !== "ready_for_ag13c_controlled_live_preview_observation") fail("Readiness status mismatch");

if (!Array.isArray(audit.checks) || audit.checks.length !== 8) fail("AG13B must record eight audit checks");
if (audit.failed_checks.length !== 0) fail("AG13B failed checks must be zero");
if (audit.decision.ready_for_ag13c_controlled_live_preview_observation !== true) fail("AG13C readiness decision missing");
if (audit.decision.publish_ready !== false) fail("AG13B must not mark publish ready");

if (observation.desktop_preview_checklist_count !== ag13aChecklist.desktop_preview_checks.length) fail("Desktop checklist count mismatch");
if (observation.mobile_preview_checklist_count !== ag13aChecklist.mobile_preview_checks.length) fail("Mobile checklist count mismatch");
if (observation.static_observation.refined_object_treatment_valid !== true) fail("Refined object treatment must be valid");
if (observation.static_observation.ready_for_controlled_live_preview_observation !== true) fail("Live preview observation readiness missing");

if (ag12zState.primary_visible_object_count !== 4) fail("AG12Z state primary visible object count must be four");
if (ag12zState.collapsed_pilot_object_count !== 3) fail("AG12Z state collapsed pilot object count must be three");

if (readiness.ready_for_ag13c !== true) fail("AG13C readiness missing");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");
if (readiness.publish_approval_required !== true) fail("Publish approval must remain required");
if (readiness.backend_activation_ready !== false) fail("Backend activation must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");

if (boundary.status !== "ag13c_boundary_created_not_started") fail("AG13C boundary status mismatch");
if (boundary.next_stage_id !== "AG13C") fail("AG13C handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG13C explicit approval missing");

if (schema.status !== "schema_final_editorial_live_verification_audit_only") fail("Schema status mismatch");

for (const key of [
  "final_editorial_static_audit_allowed_in_ag13b",
  "verification_checklist_audit_allowed_in_ag13b",
  "object_treatment_audit_allowed_in_ag13b",
  "rollback_audit_allowed_in_ag13b",
  "ag13c_boundary_allowed_in_ag13b"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_mutation_allowed_in_ag13b",
  "object_generation_allowed_in_ag13b",
  "object_insertion_allowed_in_ag13b",
  "object_removal_allowed_in_ag13b",
  "live_fetch_allowed_in_ag13b",
  "deployment_trigger_allowed_in_ag13b",
  "css_js_mutation_allowed_in_ag13b",
  "data_fetch_allowed_in_ag13b",
  "reference_url_change_allowed_in_ag13b",
  "database_write_allowed_in_ag13b",
  "supabase_write_allowed_in_ag13b",
  "backend_auth_supabase_activation_allowed_in_ag13b",
  "public_publishing_operation_allowed_in_ag13b"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, audit, observation, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.final_editorial_live_verification_audit_only !== true) fail(`${obj.title || "object"} must be AG13B audit only`);
  if (obj.article_mutation_performed_in_ag13b !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.object_generation_performed_in_ag13b !== false) fail(`${obj.title || "object"} must not generate object`);
  if (obj.object_insertion_performed_in_ag13b !== false) fail(`${obj.title || "object"} must not insert object`);
  if (obj.live_fetch_performed_in_ag13b !== false) fail(`${obj.title || "object"} must not fetch live URL`);
  if (obj.deployment_trigger_performed_in_ag13b !== false) fail(`${obj.title || "object"} must not trigger deployment`);
  if (obj.css_file_mutation_performed_in_ag13b !== false) fail(`${obj.title || "object"} must not mutate CSS`);
  if (obj.js_file_mutation_performed_in_ag13b !== false) fail(`${obj.title || "object"} must not mutate JS`);
  if (obj.backend_auth_supabase_activation_performed_in_ag13b !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_operation_performed_in_ag13b !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Audit Result", "Decision", "Live Boundary", "Publishing Boundary", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG13B document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag13b", "validate:ag13b"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag13b")) {
  fail("validate:project must include validate:ag13b");
}

pass("AG13B registry is present.");
pass("AG13B document is present.");
pass("AG13B review, audit report, observation record, readiness record, AG13C boundary, schema, learning and preview are present.");
pass("AG13A readiness plan and AG12Z refined article state are consumed.");
pass("Current article hash remains AG12C/AG12Z/AG13A refined state.");
pass("Static final editorial/live-verification audit passed.");
pass("Article is ready for AG13C controlled live/deployment preview observation but not publish-approved.");
pass("Publishing, backend and Supabase activation remain blocked.");
pass("No article mutation, live fetch, deployment trigger, object generation, CSS/JS mutation, backend activation or publishing operation is performed.");
pass("AG13C controlled live preview observation boundary is created with explicit approval required.");
pass("AG13B is Final Editorial and Live Verification Audit only.");
