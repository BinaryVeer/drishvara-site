import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag09a-live-readiness-public-experience-audit.json",
  "data/content-intelligence/audit-records/ag09a-live-readiness-public-experience-audit-report.json",
  "data/content-intelligence/quality-registry/ag09a-public-experience-gap-register.json",
  "data/content-intelligence/quality-registry/ag09a-public-experience-readiness.json",
  "data/content-intelligence/apply-records/ag08k-controlled-visual-image-insertion-apply.json",
  "data/content-intelligence/quality-reviews/ag09b-public-experience-correction-plan.json",
  "data/content-intelligence/mutation-plans/ag09b-public-experience-correction-plan.json",
  "data/content-intelligence/quality-registry/ag09b-correction-plan-readiness.json",
  "data/content-intelligence/mutation-plans/ag09b-to-ag09c-controlled-correction-apply-boundary.json",
  "data/content-intelligence/schema/public-experience-correction-plan.schema.json",
  "data/content-intelligence/learning/ag09b-public-experience-correction-plan-learning.json",
  "data/quality/ag09b-public-experience-correction-plan.json",
  "data/quality/ag09b-public-experience-correction-plan-preview.json",
  "docs/quality/AG09B_PUBLIC_EXPERIENCE_CORRECTION_PLAN.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG09B validation failed: ${message}`);
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

function ag09cControlledPublicExperienceCorrectionAllowsPostMutation(selectedPath = null, currentHash = null) {
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json");
  if (!fs.existsSync(applyRecordPath)) return false;

  try {
    const applyRecord = JSON.parse(fs.readFileSync(applyRecordPath, "utf8"));
    if (
      applyRecord.module_id !== "AG09C" ||
      applyRecord.status !== "controlled_public_experience_corrections_applied_pending_audit"
    ) {
      return false;
    }

    if (selectedPath && selectedPath !== applyRecord.selected_article_path) return false;

    const targetAbs = path.join(root, applyRecord.selected_article_path);
    if (!fs.existsSync(targetAbs)) return false;

    const html = fs.readFileSync(targetAbs, "utf8");
    const hashToCheck = currentHash || sha256(html);

    return (
      applyRecord.post_correction_hash === hashToCheck &&
      html.includes("AG09C-PUBLIC-EXPERIENCE-METADATA") &&
      html.includes('property="og:title"') &&
      html.includes('name="twitter:card"')
    );
  } catch {
    return false;
  }
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag09aReview = readJson("data/content-intelligence/quality-reviews/ag09a-live-readiness-public-experience-audit.json");
const ag09aAudit = readJson("data/content-intelligence/audit-records/ag09a-live-readiness-public-experience-audit-report.json");
const ag09aGaps = readJson("data/content-intelligence/quality-registry/ag09a-public-experience-gap-register.json");
const ag08kApply = readJson("data/content-intelligence/apply-records/ag08k-controlled-visual-image-insertion-apply.json");

const review = readJson("data/content-intelligence/quality-reviews/ag09b-public-experience-correction-plan.json");
const plan = readJson("data/content-intelligence/mutation-plans/ag09b-public-experience-correction-plan.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag09b-correction-plan-readiness.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag09b-to-ag09c-controlled-correction-apply-boundary.json");
const schema = readJson("data/content-intelligence/schema/public-experience-correction-plan.schema.json");
const learning = readJson("data/content-intelligence/learning/ag09b-public-experience-correction-plan-learning.json");
const registry = readJson("data/quality/ag09b-public-experience-correction-plan.json");
const preview = readJson("data/quality/ag09b-public-experience-correction-plan-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG09B_PUBLIC_EXPERIENCE_CORRECTION_PLAN.md"), "utf8");

for (const obj of [review, plan, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG09B") fail(`module_id must be AG09B in ${obj.title || "object"}`);
}

if (ag09aReview.status !== "live_readiness_audit_completed") fail("AG09A review must be complete");
if (ag09aAudit.status !== "live_readiness_audit_completed") fail("AG09A audit must be complete");

const target = ag08kApply.selected_article_path;
if (!fs.existsSync(path.join(root, target))) fail(`Selected article missing: ${target}`);

const html = fs.readFileSync(path.join(root, target), "utf8");
const currentHash = sha256(html);
if (currentHash !== ag08kApply.post_insertion_hash && !ag09cControlledPublicExperienceCorrectionAllowsPostMutation()) fail("Selected article hash must match AG08K post-insertion hash or AG09C controlled post-correction hash");

const gapCount = Array.isArray(ag09aGaps.gaps) ? ag09aGaps.gaps.length : 0;

if (plan.status !== "correction_plan_created_not_executed") fail("Plan status mismatch");
if (review.status !== "correction_plan_created_not_executed") fail("Review status mismatch");
if (registry.status !== "correction_plan_created_not_executed") fail("Registry status mismatch");
if (preview.status !== "correction_plan_created_not_executed") fail("Preview status mismatch");

if (plan.source_gap_count !== gapCount) fail("Source gap count mismatch");
if (plan.correction_item_count !== gapCount) fail("Correction item count mismatch");
if (!Array.isArray(plan.correction_items) || plan.correction_items.length !== gapCount) fail("Correction items must map one-to-one with AG09A gaps");

for (const gap of ag09aGaps.gaps) {
  const mapped = plan.correction_items.find((item) => item.source_gap_id === gap.gap_id);
  if (!mapped) fail(`Missing correction item for gap: ${gap.gap_id}`);
  if (mapped.correction_status !== "planned_not_executed") fail(`Correction must remain planned_not_executed: ${mapped.correction_id}`);
  if (mapped.approval_required_before_apply !== true) fail(`Correction must require approval: ${mapped.correction_id}`);
  if (mapped.mutation_allowed_in_ag09b !== false) fail(`Mutation must be blocked in AG09B: ${mapped.correction_id}`);
}

if (readiness.status !== "correction_plan_ready_pending_explicit_ag09c") fail("Readiness status mismatch");
if (readiness.readiness_passed !== true) fail("Readiness must pass");
if (readiness.publish_ready !== false) fail("Publish ready must remain false");
if (readiness.publish_readiness !== "blocked_pending_controlled_correction_apply_and_audit") fail("Publish readiness mismatch");

if (boundary.status !== "future_apply_boundary_created_not_executed") fail("Boundary status mismatch");
if (boundary.next_stage_id !== "AG09C") fail("AG09C handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG09C must require explicit approval");

if (schema.status !== "schema_correction_plan_only") fail("Schema status mismatch");
if (schema.correction_plan_allowed_in_ag09b !== true) fail("Schema must allow correction plan");
if (schema.correction_item_mapping_allowed_in_ag09b !== true) fail("Schema must allow correction mapping");
if (schema.ag09c_apply_boundary_allowed_in_ag09b !== true) fail("Schema must allow AG09C boundary");

if (schema.article_mutation_allowed_in_ag09b !== false) fail("Schema must block article mutation");
if (schema.selected_article_file_write_allowed_in_ag09b !== false) fail("Schema must block selected article write");
if (schema.homepage_mutation_allowed_in_ag09b !== false) fail("Schema must block homepage mutation");
if (schema.css_js_mutation_allowed_in_ag09b !== false) fail("Schema must block CSS/JS mutation");
if (schema.reference_insertion_allowed_in_ag09b !== false) fail("Schema must block reference insertion");
if (schema.reference_url_change_allowed_in_ag09b !== false) fail("Schema must block reference URL change");
if (schema.visual_generation_allowed_in_ag09b !== false) fail("Schema must block visual generation");
if (schema.image_asset_creation_allowed_in_ag09b !== false) fail("Schema must block image asset creation");
if (schema.image_insertion_allowed_in_ag09b !== false) fail("Schema must block image insertion");
if (schema.live_url_fetch_allowed_in_ag09b !== false) fail("Schema must block live URL fetch");
if (schema.production_jsonl_append_allowed_in_ag09b !== false) fail("Schema must block JSONL append");
if (schema.database_write_allowed_in_ag09b !== false) fail("Schema must block database write");
if (schema.supabase_write_allowed_in_ag09b !== false) fail("Schema must block Supabase write");
if (schema.backend_auth_supabase_activation_allowed_in_ag09b !== false) fail("Schema must block backend/Auth/Supabase");
if (schema.publishing_allowed_in_ag09b !== false) fail("Schema must block publishing");

for (const obj of [review, plan, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.correction_plan_only !== true) fail(`${obj.title || "object"} must be correction-plan-only`);
  if (obj.article_mutation_performed_in_ag09b !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.selected_article_file_write_performed_in_ag09b !== false) fail(`${obj.title || "object"} must not write selected article`);
  if (obj.homepage_mutation_performed_in_ag09b !== false) fail(`${obj.title || "object"} must not mutate homepage`);
  if (obj.css_mutation_performed_in_ag09b !== false) fail(`${obj.title || "object"} must not mutate CSS`);
  if (obj.js_mutation_performed_in_ag09b !== false) fail(`${obj.title || "object"} must not mutate JS`);
  if (obj.reference_insertion_performed_in_ag09b !== false) fail(`${obj.title || "object"} must not insert references`);
  if (obj.reference_url_change_performed_in_ag09b !== false) fail(`${obj.title || "object"} must not change reference URL`);
  if (obj.visual_generation_performed_in_ag09b !== false) fail(`${obj.title || "object"} must not generate visual`);
  if (obj.image_asset_creation_performed_in_ag09b !== false) fail(`${obj.title || "object"} must not create image asset`);
  if (obj.image_insertion_performed_in_ag09b !== false) fail(`${obj.title || "object"} must not insert image`);
  if (obj.live_url_fetch_performed_in_ag09b !== false) fail(`${obj.title || "object"} must not fetch live URL`);
  if (obj.production_jsonl_append_performed_in_ag09b !== false) fail(`${obj.title || "object"} must not append JSONL`);
  if (obj.database_write_performed_in_ag09b !== false) fail(`${obj.title || "object"} must not write database`);
  if (obj.supabase_write_performed_in_ag09b !== false) fail(`${obj.title || "object"} must not write Supabase`);
  if (obj.backend_auth_supabase_activation_performed_in_ag09b !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_performed_in_ag09b !== false) fail(`${obj.title || "object"} must not publish`);
}

if (review.closure_decision.decision !== "ag09b_correction_plan_created_pending_explicit_ag09c") fail("Closure decision mismatch");
if (review.closure_decision.proceed_to_ag09c_only_with_explicit_user_approval !== true) fail("AG09C must require explicit approval");
if (review.closure_decision.publish_approval_granted !== false) fail("Publishing must not be approved");

for (const scriptName of ["generate:ag09b", "validate:ag09b"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag09b")) {
  fail("validate:project must include validate:ag09b");
}

for (const phrase of [
  "Purpose",
  "Source",
  "Correction Strategy",
  "Future Apply Boundary",
  "Exclusions"
]) {
  if (!docText.includes(phrase)) fail(`AG09B document missing phrase: ${phrase}`);
}

pass("AG09B registry is present.");
pass("AG09B document is present.");
pass("AG09B review, correction plan, readiness record, AG09C boundary, schema, learning record and preview are present.");
pass("AG09A audit and gap register are consumed.");
pass("Selected article hash remains unchanged from AG08K post-insertion hash.");
pass("Every AG09A gap is mapped to one planned correction item.");
pass("Correction items remain planned_not_executed.");
pass("AG09C controlled apply boundary is created with explicit approval required.");
pass("No article/homepage/CSS/JS mutation, reference insertion, visual generation or image insertion is performed.");
pass("No live URL fetch, JSONL append, database/Supabase write, backend/Auth/Supabase activation or publishing is performed.");
pass("Publish readiness remains blocked pending controlled correction apply and audit.");
pass("AG09B is Public Experience Correction Plan only.");
