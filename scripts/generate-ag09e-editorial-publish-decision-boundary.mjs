import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag09dReview: "data/content-intelligence/quality-reviews/ag09d-post-correction-public-experience-audit.json",
  ag09dAudit: "data/content-intelligence/audit-records/ag09d-post-correction-public-experience-audit-report.json",
  ag09dReadiness: "data/content-intelligence/quality-registry/ag09d-public-experience-readiness-record.json",
  ag09dRollback: "data/content-intelligence/quality-registry/ag09d-rollback-readiness-record.json",
  ag09cApply: "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag09e-editorial-publish-decision-boundary.json");
const decisionPath = path.join(root, "data/content-intelligence/approval-registry/ag09e-editorial-publish-decision-record.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag09e-editorial-publish-readiness-boundary.json");
const nextBoundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag09e-to-ag09f-controlled-publish-preparation-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/editorial-publish-decision-boundary.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag09e-editorial-publish-decision-boundary-learning.json");
const registryPath = path.join(root, "data/quality/ag09e-editorial-publish-decision-boundary.json");
const previewPath = path.join(root, "data/quality/ag09e-editorial-publish-decision-boundary-preview.json");
const docPath = path.join(root, "docs/quality/AG09E_EDITORIAL_PUBLISH_DECISION_BOUNDARY.md");

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function writeJson(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n");
}

function writeText(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, value);
}

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) throw new Error(`Missing required AG09E input ${name}: ${relativePath}`);
}

const ag09dReview = readJson(inputs.ag09dReview);
const ag09dAudit = readJson(inputs.ag09dAudit);
const ag09dReadiness = readJson(inputs.ag09dReadiness);
const ag09dRollback = readJson(inputs.ag09dRollback);
const ag09cApply = readJson(inputs.ag09cApply);

if (ag09dReview.status !== "post_correction_public_experience_audit_passed") {
  throw new Error("AG09E requires AG09D review to pass.");
}

if (ag09dAudit.status !== "post_correction_public_experience_audit_passed") {
  throw new Error("AG09E requires AG09D audit to pass.");
}

if (ag09dReadiness.status !== "public_experience_corrections_audited_pending_editorial_publish_decision") {
  throw new Error("AG09E requires AG09D public-experience readiness.");
}

if (ag09dRollback.status !== "rollback_ready_not_executed") {
  throw new Error("AG09E requires rollback readiness to be carried forward.");
}

const selectedArticlePath = ag09cApply.selected_article_path;
if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);

const articleHtml = fs.readFileSync(path.join(root, selectedArticlePath), "utf8");
const articleHash = sha256(articleHtml);

if (articleHash !== ag09cApply.post_correction_hash) {
  throw new Error("AG09E selected article hash must match AG09C post-correction hash.");
}

const noMutationControls = {
  editorial_publish_decision_boundary_only: true,
  selected_article_read_performed: true,
  article_mutation_performed_in_ag09e: false,
  selected_article_file_write_performed_in_ag09e: false,
  homepage_mutation_performed_in_ag09e: false,
  css_mutation_performed_in_ag09e: false,
  js_mutation_performed_in_ag09e: false,
  reference_insertion_performed_in_ag09e: false,
  reference_url_change_performed_in_ag09e: false,
  visual_generation_performed_in_ag09e: false,
  image_asset_creation_performed_in_ag09e: false,
  image_insertion_performed_in_ag09e: false,
  live_url_fetch_performed_in_ag09e: false,
  production_jsonl_append_performed_in_ag09e: false,
  database_write_performed_in_ag09e: false,
  supabase_write_performed_in_ag09e: false,
  backend_auth_supabase_activation_performed_in_ag09e: false,
  public_publishing_performed_in_ag09e: false,
  publishing_approval_granted_in_ag09e: false,
  rollback_execution_performed_in_ag09e: false
};

const eligibilityChecks = [
  {
    check_id: "AG09E-CHECK-001",
    name: "ag09d_audit_passed",
    status: ag09dAudit.status === "post_correction_public_experience_audit_passed" ? "passed" : "failed",
    evidence: ag09dAudit.status
  },
  {
    check_id: "AG09E-CHECK-002",
    name: "selected_article_hash_matches_ag09c",
    status: articleHash === ag09cApply.post_correction_hash ? "passed" : "failed",
    evidence: articleHash
  },
  {
    check_id: "AG09E-CHECK-003",
    name: "public_experience_ready_for_editorial_review",
    status: ag09dReadiness.public_experience_ready_for_editorial_review === true ? "passed" : "failed",
    evidence: ag09dReadiness.status
  },
  {
    check_id: "AG09E-CHECK-004",
    name: "rollback_ready_not_executed",
    status: ag09dRollback.status === "rollback_ready_not_executed" ? "passed" : "failed",
    evidence: ag09dRollback.status
  },
  {
    check_id: "AG09E-CHECK-005",
    name: "forbidden_system_guards_carried_forward",
    status: ag09dAudit.forbidden_system_guards?.forbidden_system_guard_status === "passed" ? "passed" : "failed",
    evidence: ag09dAudit.forbidden_system_guards?.forbidden_system_guard_status
  }
];

const eligibleForEditorialDecision = eligibilityChecks.every((check) => check.status === "passed");

const decisionRecord = {
  module_id: "AG09E",
  title: "Editorial Publish Decision Record",
  status: eligibleForEditorialDecision
    ? "editorial_publish_decision_boundary_created_not_approved"
    : "editorial_publish_decision_boundary_review_required",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag09e: articleHash,
  decision_type: "editorial_publish_boundary_only",
  editorial_publish_candidate: eligibleForEditorialDecision,
  editorial_publish_approved: false,
  public_publishing_performed: false,
  publish_decision_required_from_user: true,
  publish_decision_options: [
    {
      option_id: "AG09E-OPTION-001",
      label: "Approve controlled publish-preparation stage",
      next_stage: "AG09F",
      description: "Prepare controlled publish/live-verification checklist without backend activation."
    },
    {
      option_id: "AG09E-OPTION-002",
      label: "Hold for manual editorial review",
      next_stage: null,
      description: "Keep the article static changes in repository but do not proceed toward publish decision."
    },
    {
      option_id: "AG09E-OPTION-003",
      label: "Rollback AG09C public-experience corrections",
      next_stage: "AG09R",
      description: "Use AG09D rollback readiness if corrections need to be reverted."
    }
  ],
  eligibility_checks: eligibilityChecks,
  ...noMutationControls
};

const readiness = {
  module_id: "AG09E",
  title: "Editorial Publish Readiness Boundary",
  status: eligibleForEditorialDecision
    ? "eligible_for_editorial_publish_consideration_not_approved"
    : "not_eligible_for_editorial_publish_consideration",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag09e: articleHash,
  eligible_for_editorial_publish_consideration: eligibleForEditorialDecision,
  publish_ready: false,
  publish_approval_granted: false,
  publish_readiness: "blocked_pending_explicit_editorial_publish_approval",
  backend_activation_ready: false,
  database_activation_ready: false,
  supabase_activation_ready: false,
  live_verification_required_before_final_publish: true,
  ...noMutationControls
};

const nextBoundary = {
  module_id: "AG09E",
  title: "AG09E to AG09F Controlled Publish Preparation Boundary",
  status: "future_publish_preparation_boundary_created_not_executed",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag09e: articleHash,
  next_stage_id: "AG09F",
  next_stage_title: "Controlled Publish Preparation and Live Verification Plan",
  explicit_approval_required: true,
  ag09f_allowed_scope: [
    "Prepare final public-readiness checklist.",
    "Prepare live URL verification plan.",
    "Prepare Vercel/static deployment observation checklist.",
    "Confirm no backend/Auth/Supabase/database activation.",
    "Confirm manual editorial approval remains separate."
  ],
  ag09f_blocked_scope: [
    "No new article mutation.",
    "No homepage mutation.",
    "No CSS/JS mutation.",
    "No new reference insertion.",
    "No new visual/image generation or insertion.",
    "No Supabase/database/backend/Auth activation.",
    "No automatic publishing approval."
  ],
  ...noMutationControls
};

const schema = {
  module_id: "AG09E",
  title: "Editorial Publish Decision Boundary Schema",
  status: "schema_decision_boundary_only",
  editorial_decision_record_allowed_in_ag09e: true,
  publish_readiness_boundary_allowed_in_ag09e: true,
  future_publish_preparation_boundary_allowed_in_ag09e: true,
  article_mutation_allowed_in_ag09e: false,
  homepage_mutation_allowed_in_ag09e: false,
  css_js_mutation_allowed_in_ag09e: false,
  reference_insertion_allowed_in_ag09e: false,
  visual_generation_allowed_in_ag09e: false,
  image_insertion_allowed_in_ag09e: false,
  live_url_fetch_allowed_in_ag09e: false,
  production_jsonl_append_allowed_in_ag09e: false,
  database_write_allowed_in_ag09e: false,
  supabase_write_allowed_in_ag09e: false,
  backend_auth_supabase_activation_allowed_in_ag09e: false,
  publishing_allowed_in_ag09e: false,
  publishing_approval_allowed_in_ag09e: false,
  rollback_execution_allowed_in_ag09e: false,
  ...noMutationControls
};

const summary = {
  selected_article_path: selectedArticlePath,
  article_hash_at_ag09e: articleHash,
  eligibility_status: readiness.status,
  editorial_publish_candidate: decisionRecord.editorial_publish_candidate,
  editorial_publish_approved: false,
  public_publishing_performed: false,
  publish_readiness: readiness.publish_readiness,
  next_stage_id: "AG09F",
  next_stage_title: "Controlled Publish Preparation and Live Verification Plan",
  next_stage_requires_explicit_approval: true,
  ...noMutationControls
};

const review = {
  module_id: "AG09E",
  title: "Editorial Publish Decision Boundary",
  status: decisionRecord.status,
  depends_on: ["AG09D", "AG09C", "AG09B", "AG09A"],
  generated_from: inputs,
  summary,
  decision_record_file: "data/content-intelligence/approval-registry/ag09e-editorial-publish-decision-record.json",
  readiness_file: "data/content-intelligence/quality-registry/ag09e-editorial-publish-readiness-boundary.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag09e-to-ag09f-controlled-publish-preparation-boundary.json",
  schema_file: "data/content-intelligence/schema/editorial-publish-decision-boundary.schema.json",
  learning_file: "data/content-intelligence/learning/ag09e-editorial-publish-decision-boundary-learning.json",
  closure_decision: {
    decision: eligibleForEditorialDecision
      ? "ag09e_decision_boundary_created_pending_explicit_publish_preparation_approval"
      : "ag09e_decision_boundary_review_required",
    proceed_to_ag09f_only_with_explicit_user_approval: true,
    publish_approval_granted: false,
    public_publishing_performed: false,
    ...noMutationControls
  },
  ...noMutationControls
};

const learning = {
  module_id: "AG09E",
  title: "Editorial Publish Decision Boundary Learning",
  status: "learning_record_only",
  summary,
  learning_points: [
    "Editorial publish readiness must not be confused with actual publishing.",
    "A passed public-experience audit makes the article eligible for editorial consideration, not automatically published.",
    "AG09F should prepare live verification and deployment observation without backend activation.",
    "Rollback readiness remains important until final editorial decision is complete."
  ],
  ...noMutationControls
};

const registry = {
  module_id: "AG09E",
  title: "Editorial Publish Decision Boundary",
  status: decisionRecord.status,
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag09e-editorial-publish-decision-boundary.json",
    decision_record: "data/content-intelligence/approval-registry/ag09e-editorial-publish-decision-record.json",
    readiness: "data/content-intelligence/quality-registry/ag09e-editorial-publish-readiness-boundary.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag09e-to-ag09f-controlled-publish-preparation-boundary.json",
    schema: "data/content-intelligence/schema/editorial-publish-decision-boundary.schema.json",
    learning: "data/content-intelligence/learning/ag09e-editorial-publish-decision-boundary-learning.json",
    preview: "data/quality/ag09e-editorial-publish-decision-boundary-preview.json",
    document: "docs/quality/AG09E_EDITORIAL_PUBLISH_DECISION_BOUNDARY.md"
  },
  summary,
  ...noMutationControls
};

const preview = {
  module_id: "AG09E",
  preview_only: true,
  status: decisionRecord.status,
  summary,
  eligibility_checks: eligibilityChecks,
  publish_decision_options: decisionRecord.publish_decision_options,
  ag09f_handoff: nextBoundary,
  ...noMutationControls
};

const doc = `# AG09E — Editorial Publish Decision Boundary

## Purpose

AG09E records whether the AG09D-audited article is eligible for editorial publish consideration.

AG09E is decision-boundary only. It does not mutate files, approve publishing, perform live URL fetches, activate backend/Auth/Supabase/database paths, or publish anything.

## Decision Result

- Selected article: \`${selectedArticlePath}\`
- Article hash: \`${articleHash}\`
- Editorial publish candidate: \`${decisionRecord.editorial_publish_candidate}\`
- Editorial publish approved: \`false\`
- Public publishing performed: \`false\`

## Boundary

The article is eligible for editorial consideration only if AG09D passed. Actual publish approval remains blocked until explicitly approved.

## Next Stage

AG09F — Controlled Publish Preparation and Live Verification Plan — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(decisionPath, decisionRecord);
writeJson(readinessPath, readiness);
writeJson(nextBoundaryPath, nextBoundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

const articleHashAfter = sha256(fs.readFileSync(path.join(root, selectedArticlePath), "utf8"));
if (articleHashAfter !== articleHash) {
  throw new Error("AG09E attempted to mutate selected article. Refusing to continue.");
}

console.log("✅ AG09E editorial publish decision boundary artifacts generated.");
console.log(`✅ Decision target: ${selectedArticlePath}`);
console.log(`✅ Editorial publish candidate: ${decisionRecord.editorial_publish_candidate}`);
console.log("✅ Publish approval remains blocked.");
console.log("✅ No mutation, live fetch, backend activation or publishing performed.");
console.log("✅ AG09F handoff created with explicit approval required.");
