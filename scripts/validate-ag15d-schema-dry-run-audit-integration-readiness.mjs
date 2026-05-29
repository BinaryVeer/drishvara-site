import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag15c-generated-article-admin-queue-schema-dry-run.json",
  "data/content-intelligence/content-pipeline/dry-runs/ag15c-generated-article-intake-dry-run-record.json",
  "data/content-intelligence/content-pipeline/dry-runs/ag15c-admin-review-queue-record-dry-run.json",
  "data/content-intelligence/content-pipeline/dry-runs/ag15c-quality-evidence-preview-state-dry-run.json",
  "data/content-intelligence/audit-records/ag15c-schema-dry-run-validation-report.json",
  "data/content-intelligence/quality-registry/ag15c-schema-dry-run-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag15c-to-ag15d-schema-dry-run-audit-integration-readiness-boundary.json",

  "data/content-intelligence/quality-reviews/ag15d-schema-dry-run-audit-integration-readiness.json",
  "data/content-intelligence/audit-records/ag15d-schema-dry-run-audit-report.json",
  "data/content-intelligence/content-pipeline/ag15d-integration-readiness-decision-record.json",
  "data/content-intelligence/content-pipeline/ag15d-active-integration-blocker-register.json",
  "data/content-intelligence/quality-registry/ag15d-non-active-integration-scaffold-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag15d-to-ag15e-non-active-admin-queue-integration-scaffold-boundary.json",
  "data/content-intelligence/schema/schema-dry-run-audit-integration-readiness.schema.json",
  "data/content-intelligence/learning/ag15d-schema-dry-run-audit-integration-readiness-learning.json",
  "data/quality/ag15d-schema-dry-run-audit-integration-readiness.json",
  "data/quality/ag15d-schema-dry-run-audit-integration-readiness-preview.json",
  "docs/quality/AG15D_SCHEMA_DRY_RUN_AUDIT_INTEGRATION_READINESS.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG15D validation failed: ${message}`);
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

const ag15cReview = readJson("data/content-intelligence/quality-reviews/ag15c-generated-article-admin-queue-schema-dry-run.json");
const ag15cValidation = readJson("data/content-intelligence/audit-records/ag15c-schema-dry-run-validation-report.json");
const ag15cReadiness = readJson("data/content-intelligence/quality-registry/ag15c-schema-dry-run-audit-readiness-record.json");
const ag15cBoundary = readJson("data/content-intelligence/mutation-plans/ag15c-to-ag15d-schema-dry-run-audit-integration-readiness-boundary.json");
const ag15cIntake = readJson("data/content-intelligence/content-pipeline/dry-runs/ag15c-generated-article-intake-dry-run-record.json");
const ag15cQueue = readJson("data/content-intelligence/content-pipeline/dry-runs/ag15c-admin-review-queue-record-dry-run.json");
const ag15cQuality = readJson("data/content-intelligence/content-pipeline/dry-runs/ag15c-quality-evidence-preview-state-dry-run.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");

const review = readJson("data/content-intelligence/quality-reviews/ag15d-schema-dry-run-audit-integration-readiness.json");
const audit = readJson("data/content-intelligence/audit-records/ag15d-schema-dry-run-audit-report.json");
const decision = readJson("data/content-intelligence/content-pipeline/ag15d-integration-readiness-decision-record.json");
const blockers = readJson("data/content-intelligence/content-pipeline/ag15d-active-integration-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag15d-non-active-integration-scaffold-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag15d-to-ag15e-non-active-admin-queue-integration-scaffold-boundary.json");
const schema = readJson("data/content-intelligence/schema/schema-dry-run-audit-integration-readiness.schema.json");
const learning = readJson("data/content-intelligence/learning/ag15d-schema-dry-run-audit-integration-readiness-learning.json");
const registry = readJson("data/quality/ag15d-schema-dry-run-audit-integration-readiness.json");
const preview = readJson("data/quality/ag15d-schema-dry-run-audit-integration-readiness-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG15D_SCHEMA_DRY_RUN_AUDIT_INTEGRATION_READINESS.md"), "utf8");

for (const obj of [review, audit, decision, blockers, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG15D") fail(`module_id must be AG15D in ${obj.title || "object"}`);
}

if (ag15cReview.status !== "generated_article_admin_queue_schema_dry_run_passed") fail("AG15C review status mismatch");
if (ag15cValidation.failed_checks.length !== 0) fail("AG15C validation must have zero failed checks");
if (ag15cReadiness.ready_for_ag15d !== true) fail("AG15C readiness for AG15D missing");
if (ag15cBoundary.next_stage_id !== "AG15D") fail("AG15D boundary missing in AG15C");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
const currentHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (!hashPairMatchesCurrentOrAg12cR1Repair(currentHash, ag13zCandidate.article_hash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Seed candidate hash mismatch or AG12C-R1/AR01-R1 approved repair-chain state missing");
if (!hashPairMatchesCurrentOrAg12cR1Repair(ag15cIntake.article_hash, currentHash, typeof articlePath !== "undefined" ? articlePath : null)) fail("AG15C intake hash mismatch or AG12C-R1/AR01-R1 approved repair-chain state missing");

if (review.status !== "schema_dry_run_audit_passed_non_active_integration_scaffold_ready") fail("Review status mismatch");
if (audit.status !== "schema_dry_run_audit_passed") fail("Audit status mismatch");
if (decision.status !== "schema_dry_run_audit_passed_non_active_integration_scaffold_ready") fail("Decision status mismatch");
if (blockers.status !== "active_integration_blockers_recorded") fail("Blocker register status mismatch");
if (readiness.status !== "ready_for_ag15e_non_active_admin_queue_integration_scaffold") fail("Readiness status mismatch");

if (!Array.isArray(audit.checks) || audit.checks.length !== 11) fail("AG15D audit must include eleven checks");
if (audit.failed_checks.length !== 0) fail("AG15D failed checks must be zero");
if (audit.decision.dry_run_valid !== true) fail("Dry-run must be valid");
if (audit.decision.schema_shape_usable !== true) fail("Schema shape must be usable");
if (audit.decision.ready_for_non_active_integration_scaffold !== true) fail("Non-active integration scaffold readiness missing");
if (audit.decision.active_queue_mutation_ready !== false) fail("Active queue mutation must remain blocked");
if (audit.decision.public_publish_ready !== false) fail("Public publish must remain blocked");

if (ag15cIntake.public_visibility !== false || ag15cIntake.publish_approved !== false) fail("AG15C intake publication controls mismatch");
if (ag15cQueue.public_visibility !== false || ag15cQueue.publish_approved !== false) fail("AG15C queue publication controls mismatch");
if (ag15cQueue.active_queue_index_mutated !== false) fail("AG15C queue index mutation must be false");
if (ag15cQueue.not_written_to_active_queue !== true) fail("AG15C queue record must not be active");
if (!ag15cQuality.mandatory_quality_evidence_results.every((item) => item.dry_run_status === "present_or_mapped")) fail("AG15C evidence mapping incomplete");

if (decision.decision.proceed_to_non_active_integration_scaffold !== true) fail("Decision must approve non-active integration scaffold");
if (decision.decision.proceed_to_active_queue_mutation !== false) fail("Decision must block active queue mutation");
if (decision.decision.proceed_to_new_article_generation !== false) fail("Decision must block new article generation");
if (decision.decision.proceed_to_admin_publish_execution !== false) fail("Decision must block Admin publish execution");
if (decision.decision.proceed_to_visibility_switch !== false) fail("Decision must block visibility switch");
if (decision.recommended_next_stage !== "AG15E") fail("Recommended next stage must be AG15E");

if (!blockers.allowed_next_without_resolving_blockers.includes("Create non-active integration scaffold.")) fail("Non-active integration scaffold must be allowed");
if (!blockers.not_allowed_next_without_resolving_blockers.includes("Write active Admin Review Queue records.")) fail("Active queue writing must remain blocked");
if (!blockers.not_allowed_next_without_resolving_blockers.includes("Publish articles.")) fail("Publishing must remain blocked");

if (readiness.ready_for_ag15e !== true) fail("AG15E readiness missing");
if (readiness.schema_dry_run_audit_passed !== true) fail("Schema dry-run audit must pass");
if (readiness.failed_checks !== 0) fail("Failed checks must be zero");
if (readiness.non_active_integration_scaffold_ready !== true) fail("Non-active integration scaffold readiness missing");
if (readiness.active_queue_mutation_ready !== false) fail("Active queue mutation must remain blocked");
if (readiness.article_generation_ready !== false) fail("Article generation must remain blocked");
if (readiness.queue_mutation_ready !== false) fail("Queue mutation must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");

if (boundary.status !== "ag15e_boundary_created_not_started") fail("AG15E boundary status mismatch");
if (boundary.next_stage_id !== "AG15E") fail("AG15E handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG15E explicit approval missing");

if (schema.status !== "schema_dry_run_audit_integration_readiness_only") fail("Schema status mismatch");

for (const key of [
  "schema_dry_run_audit_allowed_in_ag15d",
  "integration_readiness_decision_allowed_in_ag15d",
  "active_integration_blocker_register_allowed_in_ag15d",
  "ag15e_boundary_allowed_in_ag15d"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_generation_allowed_in_ag15d",
  "article_mutation_allowed_in_ag15d",
  "queue_mutation_allowed_in_ag15d",
  "active_admin_review_queue_record_creation_allowed_in_ag15d",
  "queue_index_mutation_allowed_in_ag15d",
  "non_active_integration_scaffold_creation_allowed_in_ag15d",
  "admin_action_execution_allowed_in_ag15d",
  "editor_action_execution_allowed_in_ag15d",
  "auth_activation_allowed_in_ag15d",
  "backend_activation_allowed_in_ag15d",
  "supabase_activation_allowed_in_ag15d",
  "github_write_operation_allowed_in_ag15d",
  "public_visibility_switch_allowed_in_ag15d",
  "public_publishing_operation_allowed_in_ag15d",
  "deployment_trigger_allowed_in_ag15d"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, audit, decision, blockers, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.schema_dry_run_audit_integration_readiness_only !== true) fail(`${obj.title || "object"} must be AG15D audit/readiness only`);
  if (obj.article_generation_performed_in_ag15d !== false) fail(`${obj.title || "object"} must not generate articles`);
  if (obj.article_mutation_performed_in_ag15d !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.queue_mutation_performed_in_ag15d !== false) fail(`${obj.title || "object"} must not mutate queue`);
  if (obj.active_admin_review_queue_record_created_in_ag15d !== false) fail(`${obj.title || "object"} must not create active queue record`);
  if (obj.queue_index_mutation_performed_in_ag15d !== false) fail(`${obj.title || "object"} must not mutate queue index`);
  if (obj.non_active_integration_scaffold_created_in_ag15d !== false) fail(`${obj.title || "object"} must not create scaffold in AG15D`);
  if (obj.public_visibility_switch_performed_in_ag15d !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_publishing_operation_performed_in_ag15d !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Audit Result", "Readiness Decision", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG15D document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag15d", "validate:ag15d"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag15d")) {
  fail("validate:project must include validate:ag15d");
}

pass("AG15D registry is present.");
pass("AG15D document is present.");
pass("AG15D review, audit report, decision, blocker register, readiness, AG15E boundary, schema, learning and preview are present.");
pass("AG15C schema dry-run is consumed.");
pass("Schema dry-run audit passed with zero failed checks.");
pass("Seed candidate hash and dry-run records are verified.");
pass("public_visibility=false and publish_approved=false are preserved.");
pass("Decision recorded: proceed only to non-active integration scaffold.");
pass("Active queue mutation, new article generation, visibility switch and publishing remain blocked.");
pass("AG15E non-active integration scaffold boundary is created with explicit approval required.");
pass("AG15D is Schema Dry-run Audit and Integration Readiness only.");
