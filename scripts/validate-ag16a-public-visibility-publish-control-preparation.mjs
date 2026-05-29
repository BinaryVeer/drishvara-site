import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag15z-generated-article-admin-queue-integration-closure.json",
  "data/content-intelligence/closure-records/ag15z-generated-article-admin-queue-integration-closure.json",
  "data/content-intelligence/content-pipeline/ag15z-generated-article-admin-queue-preparation-summary.json",
  "data/content-intelligence/quality-registry/ag15z-active-integration-blocked-register.json",
  "data/content-intelligence/quality-registry/ag15z-next-path-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag15z-to-ag16a-public-visibility-publish-control-boundary.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",

  "data/content-intelligence/quality-reviews/ag16a-public-visibility-publish-control-preparation.json",
  "data/content-intelligence/content-pipeline/ag16a-public-visibility-state-model.json",
  "data/content-intelligence/content-pipeline/ag16a-publish-control-state-model.json",
  "data/content-intelligence/content-pipeline/ag16a-featured-reads-public-filter-plan.json",
  "data/content-intelligence/content-pipeline/ag16a-archive-internal-intelligence-plan.json",
  "data/content-intelligence/quality-registry/ag16a-public-visibility-publish-control-schema-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag16a-to-ag16b-public-visibility-publish-filter-schema-plan-boundary.json",
  "data/content-intelligence/schema/public-visibility-publish-control-preparation.schema.json",
  "data/content-intelligence/learning/ag16a-public-visibility-publish-control-preparation-learning.json",
  "data/quality/ag16a-public-visibility-publish-control-preparation.json",
  "data/quality/ag16a-public-visibility-publish-control-preparation-preview.json",
  "docs/quality/AG16A_PUBLIC_VISIBILITY_PUBLISH_CONTROL_PREPARATION.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG16A validation failed: ${message}`);
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

const ag15zReview = readJson("data/content-intelligence/quality-reviews/ag15z-generated-article-admin-queue-integration-closure.json");
const ag15zClosure = readJson("data/content-intelligence/closure-records/ag15z-generated-article-admin-queue-integration-closure.json");
const ag15zReadiness = readJson("data/content-intelligence/quality-registry/ag15z-next-path-readiness-record.json");
const ag15zBoundary = readJson("data/content-intelligence/mutation-plans/ag15z-to-ag16a-public-visibility-publish-control-boundary.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");

const review = readJson("data/content-intelligence/quality-reviews/ag16a-public-visibility-publish-control-preparation.json");
const visibility = readJson("data/content-intelligence/content-pipeline/ag16a-public-visibility-state-model.json");
const publishControl = readJson("data/content-intelligence/content-pipeline/ag16a-publish-control-state-model.json");
const featuredFilter = readJson("data/content-intelligence/content-pipeline/ag16a-featured-reads-public-filter-plan.json");
const archivePlan = readJson("data/content-intelligence/content-pipeline/ag16a-archive-internal-intelligence-plan.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag16a-public-visibility-publish-control-schema-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag16a-to-ag16b-public-visibility-publish-filter-schema-plan-boundary.json");
const schema = readJson("data/content-intelligence/schema/public-visibility-publish-control-preparation.schema.json");
const learning = readJson("data/content-intelligence/learning/ag16a-public-visibility-publish-control-preparation-learning.json");
const registry = readJson("data/quality/ag16a-public-visibility-publish-control-preparation.json");
const preview = readJson("data/quality/ag16a-public-visibility-publish-control-preparation-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG16A_PUBLIC_VISIBILITY_PUBLISH_CONTROL_PREPARATION.md"), "utf8");

for (const obj of [review, visibility, publishControl, featuredFilter, archivePlan, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG16A") fail(`module_id must be AG16A in ${obj.title || "object"}`);
}

if (ag15zReview.status !== "generated_article_admin_queue_integration_chain_closed_future_active_integration_blocked") fail("AG15Z review status mismatch");
if (ag15zClosure.final_decision.ag15_chain_closed !== true) fail("AG15 chain closure missing");
if (ag15zReadiness.ready_for_ag16a !== true) fail("AG15Z readiness for AG16A missing");
if (ag15zBoundary.next_stage_id !== "AG16A") fail("AG16A boundary missing in AG15Z");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
const currentHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (!hashPairMatchesCurrentOrAg12cR1Repair(currentHash, ag13zCandidate.article_hash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Seed candidate hash mismatch or AG12C-R1/AR01-R1 approved repair-chain state missing");

if (review.status !== "public_visibility_publish_control_preparation_defined") fail("Review status mismatch");
if (visibility.status !== "public_visibility_state_model_defined") fail("Visibility model status mismatch");
if (publishControl.status !== "publish_control_state_model_defined") fail("Publish control model status mismatch");
if (featuredFilter.status !== "featured_reads_public_filter_plan_defined") fail("Featured Reads filter status mismatch");
if (archivePlan.status !== "archive_internal_intelligence_plan_defined") fail("Archive plan status mismatch");
if (readiness.status !== "ready_for_ag16b_public_visibility_publish_filter_schema_plan") fail("Readiness status mismatch");

if (visibility.default_state.public_visibility !== false) fail("Default public_visibility must be false");
if (visibility.default_state.publish_approved !== false) fail("Default publish_approved must be false");
if (!visibility.visibility_states.some((item) => item.state === "public_published" && item.public_visibility === true && item.publish_approved === true)) {
  fail("public_published state must require public_visibility=true and publish_approved=true");
}
if (!visibility.visibility_states.some((item) => item.state === "archived_internal" && item.public_visibility === false && item.publish_approved === false)) {
  fail("archived_internal state must remain non-public");
}
if (!visibility.hard_rule.includes("public_visibility=true and publish_approved=true")) fail("Visibility hard rule missing");

for (const gate of ["admin_decision_gate", "quality_evidence_gate", "hash_integrity_gate", "visibility_state_gate", "public_index_gate"]) {
  if (!publishControl.publish_control_gates.some((item) => item.gate_id === gate && item.required === true)) {
    fail(`Missing required publish gate: ${gate}`);
  }
}
if (!publishControl.blocked_until_later_stage.includes("Visibility switch.")) fail("Visibility switch must remain blocked");
if (!publishControl.blocked_until_later_stage.includes("Publishing operation.")) fail("Publishing operation must remain blocked");

if (!featuredFilter.filter_rule.include_if_all_true.includes("public_visibility === true")) fail("Featured filter must require public_visibility true");
if (!featuredFilter.filter_rule.include_if_all_true.includes("publish_approved === true")) fail("Featured filter must require publish_approved true");
if (!featuredFilter.filter_rule.exclude_if_any_true.includes("public_visibility === false")) fail("Featured filter must exclude public_visibility false");
if (!featuredFilter.filter_rule.exclude_if_any_true.includes("publish_approved === false")) fail("Featured filter must exclude publish_approved false");

for (const state of archivePlan.archive_states) {
  if (state.public_visibility !== false) fail(`Archive state ${state.state} must be non-public`);
  if (state.publish_approved !== false) fail(`Archive state ${state.state} must not be publish-approved`);
  if (state.public_exposure_allowed !== false) fail(`Archive state ${state.state} must block public exposure`);
}

if (readiness.ready_for_ag16b !== true) fail("AG16B readiness missing");
if (readiness.active_visibility_switch_ready !== false) fail("Visibility switch must remain blocked");
if (readiness.public_index_mutation_ready !== false) fail("Public index mutation must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");

if (boundary.status !== "ag16b_boundary_created_not_started") fail("AG16B boundary status mismatch");
if (boundary.next_stage_id !== "AG16B") fail("AG16B handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG16B explicit approval missing");

if (schema.status !== "schema_public_visibility_publish_control_preparation_only") fail("Schema status mismatch");

for (const key of [
  "public_visibility_state_model_allowed_in_ag16a",
  "publish_control_state_model_allowed_in_ag16a",
  "featured_reads_filter_plan_allowed_in_ag16a",
  "archive_internal_intelligence_plan_allowed_in_ag16a",
  "ag16b_boundary_allowed_in_ag16a"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_generation_allowed_in_ag16a",
  "article_mutation_allowed_in_ag16a",
  "queue_mutation_allowed_in_ag16a",
  "active_admin_review_queue_record_creation_allowed_in_ag16a",
  "queue_index_mutation_allowed_in_ag16a",
  "admin_action_execution_allowed_in_ag16a",
  "editor_action_execution_allowed_in_ag16a",
  "auth_activation_allowed_in_ag16a",
  "backend_activation_allowed_in_ag16a",
  "supabase_activation_allowed_in_ag16a",
  "github_write_operation_allowed_in_ag16a",
  "public_visibility_switch_allowed_in_ag16a",
  "public_index_mutation_allowed_in_ag16a",
  "public_publishing_operation_allowed_in_ag16a",
  "deployment_trigger_allowed_in_ag16a"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, visibility, publishControl, featuredFilter, archivePlan, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.public_visibility_publish_control_preparation_only !== true) fail(`${obj.title || "object"} must be AG16A preparation only`);
  if (obj.article_generation_performed_in_ag16a !== false) fail(`${obj.title || "object"} must not generate articles`);
  if (obj.article_mutation_performed_in_ag16a !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.queue_mutation_performed_in_ag16a !== false) fail(`${obj.title || "object"} must not mutate queue`);
  if (obj.public_visibility_switch_performed_in_ag16a !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag16a !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.public_publishing_operation_performed_in_ag16a !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Core Rule", "Planned Controls", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG16A document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag16a", "validate:ag16a"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag16a")) {
  fail("validate:project must include validate:ag16a");
}

pass("AG16A registry is present.");
pass("AG16A document is present.");
pass("AG16A review, visibility model, publish-control model, Featured Reads filter plan, archive plan, readiness, AG16B boundary, schema, learning and preview are present.");
pass("AG15Z closure is consumed.");
pass("Public visibility and publish-control doctrine is defined.");
pass("Rule enforced: public article exposure requires public_visibility=true and publish_approved=true.");
pass("Archived/returned/internal states remain non-public.");
pass("AG16B public visibility and publish-filter schema boundary is created with explicit approval required.");
pass("No article generation, article mutation, queue mutation, visibility switch, public index mutation or publishing is performed.");
pass("AG16A is Public Visibility and Publish-Control Preparation only.");
