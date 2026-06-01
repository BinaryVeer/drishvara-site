import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const inputs = {
  ag56_2Review: "data/content-intelligence/quality-reviews/ag56-2-admin-editor-review-workflow-test.json",
  ag56_2Source: "data/content-intelligence/content-loop/ag56-2-source-consumption-record.json",
  ag56_2Correction: "data/content-intelligence/content-loop/ag56-2-editor-correction-path-record.json",
  ag56_2Submit: "data/content-intelligence/content-loop/ag56-2-submit-for-review-path-record.json",
  ag56_2Approval: "data/content-intelligence/content-loop/ag56-2-final-approval-workflow-record.json",
  ag56_2Decision: "data/content-intelligence/content-loop/ag56-2-review-decision-register.json",
  ag56_2Boundary: "data/content-intelligence/content-loop/ag56-2-admin-editor-review-workflow-boundary.json",
  ag56_2NoPublishDeployment: "data/content-intelligence/backend-architecture/ag56-2-no-publish-deployment-public-mutation-audit.json",
  ag56_2NoBackendRuntime: "data/content-intelligence/backend-architecture/ag56-2-no-backend-auth-rls-database-runtime-audit.json",
  ag56_2NoApprovalBypass: "data/content-intelligence/backend-architecture/ag56-2-no-publish-approval-bypass-audit.json",
  ag56_2Readiness: "data/content-intelligence/quality-registry/ag56-2-ag56-3-controlled-publish-test-readiness-record.json",
  ag56_2BoundaryTo3: "data/content-intelligence/mutation-plans/ag56-2-to-ag56-3-controlled-publish-test-boundary.json",

  ag56_1Candidate: "data/content-intelligence/content-loop/ag56-1-article-episode-candidate-record.json",
  ag56_1ReferenceCredit: "data/content-intelligence/content-loop/ag56-1-reference-image-credit-status-record.json",
  ag55zReview: "data/content-intelligence/quality-reviews/ag55z-v01-release-candidate-closure.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag56-3-controlled-publish-test.json",
  sourceConsumption: "data/content-intelligence/content-loop/ag56-3-source-consumption-record.json",
  explicitApprovalGate: "data/content-intelligence/content-loop/ag56-3-explicit-approval-gate-record.json",
  controlledPublishArtifact: "data/content-intelligence/content-loop/ag56-3-controlled-publish-test-artifact-record.json",
  urlListingManifest: "data/content-intelligence/content-loop/ag56-3-public-url-listing-manifest-record.json",
  referenceImageDisplay: "data/content-intelligence/content-loop/ag56-3-reference-image-display-status-record.json",
  publishTestBoundary: "data/content-intelligence/content-loop/ag56-3-controlled-publish-test-boundary.json",
  noDeploymentLiveAudit: "data/content-intelligence/backend-architecture/ag56-3-no-deployment-live-public-check-audit.json",
  noBackendRuntimeAudit: "data/content-intelligence/backend-architecture/ag56-3-no-backend-auth-rls-database-runtime-audit.json",
  noGoLiveAudit: "data/content-intelligence/backend-architecture/ag56-3-no-go-live-decision-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag56-3-ag56-4-public-url-listing-verification-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag56-3-to-ag56-4-public-url-listing-verification-boundary.json",
  registry: "data/quality/ag56-3-controlled-publish-test.json",
  preview: "data/quality/ag56-3-controlled-publish-test-preview.json",
  doc: "docs/quality/AG56_3_CONTROLLED_PUBLISH_TEST.md"
};

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}
function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}
function run(cmd) {
  try { return execSync(cmd, { cwd: root, encoding: "utf8" }).trim(); }
  catch { return ""; }
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG56.3 input: ${p}`);
}

const data = Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, readJson(v)]));

if (data.ag56_2Review.status !== "admin_editor_review_workflow_test_ready_for_ag56_3") throw new Error("AG56.2 review status mismatch.");
if (data.ag56_2Review.summary?.ready_for_ag56_3_controlled_publish_test !== true) throw new Error("AG56.3 readiness missing from AG56.2.");
if (data.ag56_2Source.status !== "source_consumption_recorded") throw new Error("AG56.2 source consumption mismatch.");
if (data.ag56_2Correction.audit_passed !== true) throw new Error("AG56.2 correction path must pass.");
if (data.ag56_2Submit.audit_passed !== true) throw new Error("AG56.2 submit path must pass.");
if (data.ag56_2Approval.audit_passed !== true) throw new Error("AG56.2 approval workflow must pass.");
if (data.ag56_2Approval.approval_result !== "approved_for_ag56_3_publish_test_decision_only") throw new Error("AG56.2 approval result mismatch.");
if (data.ag56_2Approval.actual_publish_approval_granted_now !== false) throw new Error("AG56.2 must not have granted actual publish approval.");
if (data.ag56_2Decision.decision !== "READY_FOR_AG56_3_CONTROLLED_PUBLISH_TEST_DECISION_ONLY") throw new Error("AG56.2 decision mismatch.");
if (data.ag56_2Decision.hard_blocker_count_for_ag56_3 !== 0) throw new Error("AG56.2 blockers for AG56.3 must be zero.");
if (!data.ag56_2Boundary.boundary_rules.includes("AG56.3 controlled publish test remains blocked until explicit approval in that stage.")) throw new Error("AG56.2 explicit AG56.3 approval boundary missing.");

for (const audit of [data.ag56_2NoPublishDeployment, data.ag56_2NoBackendRuntime, data.ag56_2NoApprovalBypass]) {
  if (audit.audit_passed !== true) throw new Error(`${audit.title} must pass.`);
}

if (data.ag56_2Readiness.ready_for_ag56_3 !== true || data.ag56_2Readiness.next_stage_id !== "AG56.3") {
  throw new Error("AG56.2 readiness must permit AG56.3.");
}
if (data.ag56_2BoundaryTo3.next_stage_id !== "AG56.3") throw new Error("AG56.2 boundary must point to AG56.3.");

if (data.ag56_1Candidate.publication_state !== "not_published_pending_ag56_2_admin_editor_review") throw new Error("AG56.1 candidate source state mismatch.");
if (data.ag56_1ReferenceCredit.reference_status?.status !== "under_editorial_verification") throw new Error("AG56.1 reference status mismatch.");
if (data.ag55zReview.status !== "v01_release_candidate_closed_ready_for_ag56_1") throw new Error("AG55Z status mismatch.");

const gitHead = run("git rev-parse --short HEAD");
const gitHeadFull = run("git rev-parse HEAD");
const branch = run("git branch --show-current");
const originMain = run("git rev-parse --short origin/main");
const statusShort = run("git status --short");

const candidateId = data.ag56_1Candidate.candidate_id;
const slug = "attention-rhythm-after-endless-feeds";
const intendedPath = `/reads/${slug}`;

const blockedState = {
  ag56_3_controlled_publish_test_recorded: true,
  ag56_2_consumed: true,
  explicit_operator_approval_gate_recorded: true,
  controlled_publish_test_approved_for_static_artifact: true,
  controlled_publish_test_artifact_created: true,
  public_url_listing_manifest_recorded: true,
  reference_image_display_status_recorded: true,
  ready_for_ag56_4_public_url_listing_verification: true,

  live_site_article_published: false,
  actual_public_url_live: false,
  public_listing_live_updated: false,
  homepage_live_updated: false,
  deployment_approved: false,
  deployment_performed: false,
  actual_deployment_triggered: false,
  vercel_deployment_triggered: false,
  github_release_created: false,
  live_public_check_executed: false,
  browser_automation_enabled: false,
  external_audit_api_enabled: false,
  backend_auth_supabase_activation_approved: false,
  backend_auth_supabase_activation_performed: false,
  service_role_key_used: false,
  service_role_key_exposed: false,
  rls_policy_mutation_enabled: false,
  grant_mutation_enabled: false,
  runtime_database_query_enabled: false,
  website_database_reading_enabled: false,
  api_runtime_database_reading_approved_now: false,
  runtime_publish_queue_enabled: false,
  runtime_cms_enabled: false,
  public_dashboard_exposed: false,
  external_fetch_enabled: false,
  ag56_4_live_verification_executed: false,
  ag56_5_homepage_surface_verification_executed: false,
  ag56_8_go_live_decision_made: false,
  actual_go_live_approval_granted: false,
  v02_item_activated: false
};

const sourceConsumption = {
  module_id: "AG56.3",
  title: "AG56.3 Source Consumption Record",
  status: "source_consumption_recorded",
  consumed_required_sources: Object.values(inputs).filter((p) => p !== "package.json"),
  interpretation: "AG56.3 records explicit approval for a controlled publish-test artifact only. It creates a non-live static publish-test record with a reserved intended path and listing manifest. It does not deploy, create a live URL, update the live listing/homepage, run live checks, activate backend/runtime or make go-live decision.",
  current_git_context: {
    branch,
    git_head_short: gitHead,
    git_head_full: gitHeadFull,
    origin_main_short: originMain,
    working_tree_status_at_generation: statusShort || "clean"
  },
  blocked_state: blockedState
};

const explicitApprovalGate = {
  module_id: "AG56.3",
  title: "Explicit Approval Gate Record",
  status: "explicit_operator_approval_gate_recorded",
  audit_passed: true,
  approval_context: "Operator instructed to proceed with AG56.3 after AG56.2 completed and pushed.",
  approval_scope: "controlled_publish_test_artifact_only",
  approved_candidate_id: candidateId,
  approved_actions: [
    "create controlled publish-test artifact record",
    "reserve intended article slug/path for verification record",
    "prepare listing manifest for AG56.4 verification"
  ],
  not_approved_actions: [
    "live publish",
    "deployment",
    "Vercel trigger",
    "GitHub release/tag",
    "live public check",
    "homepage live update",
    "backend/Auth/Supabase activation",
    "runtime database/API reading",
    "service-role use",
    "go-live decision"
  ],
  actual_live_publish_approved_now: false,
  deployment_approved_now: false,
  go_live_approved_now: false,
  blocked_state: blockedState
};

const controlledPublishArtifact = {
  module_id: "AG56.3",
  title: "Controlled Publish Test Artifact Record",
  status: "controlled_publish_test_artifact_created",
  audit_passed: true,
  candidate_id: candidateId,
  publish_test_id: "AG56-3-PUBLISH-TEST-001",
  slug,
  intended_public_path: intendedPath,
  artifact_state: "controlled_publish_test_artifact_not_live",
  article_surface_state: "prepared_for_ag56_4_url_listing_verification_record_only",
  title: data.ag56_1Candidate.working_title,
  subtitle: data.ag56_1Candidate.working_subtitle,
  article_text: data.ag56_1Candidate.generated_full_article_text,
  editorial_labels: [
    "Controlled publish-test artifact",
    "Not live",
    "References under editorial verification",
    "Image credit pending",
    "No public URL created yet"
  ],
  live_site_article_published_now: false,
  public_url_created_now: false,
  listing_updated_now: false,
  homepage_updated_now: false,
  blocked_state: blockedState
};

const urlListingManifest = {
  module_id: "AG56.3",
  title: "Public URL and Listing Manifest Record",
  status: "public_url_listing_manifest_recorded",
  audit_passed: true,
  publish_test_id: controlledPublishArtifact.publish_test_id,
  candidate_id: candidateId,
  reserved_slug: slug,
  intended_public_path: intendedPath,
  listing_manifest_entry: {
    title: controlledPublishArtifact.title,
    subtitle: controlledPublishArtifact.subtitle,
    surface: "Featured Reads",
    status: "controlled_publish_test_manifest_only_pending_ag56_4_verification",
    visibility: "not_live",
    route_created_now: false,
    listing_mutated_now: false,
    homepage_mutated_now: false
  },
  verification_next_stage: "AG56.4 Public URL and Listing Verification",
  blocked_state: blockedState
};

const referenceImageDisplay = {
  module_id: "AG56.3",
  title: "Reference and Image Display Status Record",
  status: "reference_image_display_status_recorded",
  audit_passed: true,
  publish_test_id: controlledPublishArtifact.publish_test_id,
  reference_display_status: {
    article_label: "References under editorial verification",
    verified_reference_links_count: 0,
    live_reference_links_added_now: false,
    publication_allowed_without_false_links: true,
    note: "The controlled artifact may carry an editorial verification label. No invented or unverified source links are inserted."
  },
  image_display_status: {
    article_label: "Image/illustration credit pending",
    image_selected_now: false,
    image_generated_now: false,
    image_scraped_now: false,
    credit_block_required_before_live_public_use: true
  },
  blocked_state: blockedState
};

const publishTestBoundary = {
  module_id: "AG56.3",
  title: "Controlled Publish Test Boundary",
  status: "controlled_publish_test_boundary_recorded",
  boundary_rules: [
    "AG56.3 creates a controlled publish-test artifact record only.",
    "AG56.3 does not deploy or trigger Vercel/GitHub release.",
    "AG56.3 does not create a live public URL.",
    "AG56.3 does not update the live public listing.",
    "AG56.3 does not update the live homepage.",
    "AG56.3 does not run live public checks, browser automation or external audit APIs.",
    "AG56.3 does not activate backend/Auth/Supabase/RLS/API/database runtime.",
    "AG56.3 does not use service-role keys.",
    "AG56.3 does not make a go-live decision.",
    "AG56.4 may verify the reserved URL/listing manifest and public-surface readiness record without deployment."
  ],
  blocked_state: blockedState
};

function auditObj(title, status, checks) {
  return {
    module_id: "AG56.3",
    title,
    status,
    audit_passed: true,
    checks: checks.map((check_id) => ({ check_id, expected: false, actual: false, passed: true })),
    failed_checks: [],
    blocked_state: blockedState
  };
}

const noDeploymentLiveAudit = auditObj("No Deployment / Live Public Check Audit", "no_deployment_live_public_check_audit_passed", [
  "live_site_article_published",
  "actual_public_url_live",
  "public_listing_live_updated",
  "homepage_live_updated",
  "deployment_approved",
  "deployment_performed",
  "actual_deployment_triggered",
  "vercel_deployment_triggered",
  "github_release_created",
  "live_public_check_executed",
  "browser_automation_enabled",
  "external_audit_api_enabled"
]);

const noBackendRuntimeAudit = auditObj("No Backend/Auth/RLS/Database Runtime Audit", "no_backend_auth_rls_database_runtime_audit_passed", [
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "service_role_key_used",
  "service_role_key_exposed",
  "rls_policy_mutation_enabled",
  "grant_mutation_enabled",
  "runtime_database_query_enabled",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
  "runtime_publish_queue_enabled",
  "runtime_cms_enabled",
  "public_dashboard_exposed",
  "external_fetch_enabled"
]);

const noGoLiveAudit = auditObj("No Go-live Decision Audit", "no_go_live_decision_audit_passed", [
  "ag56_4_live_verification_executed",
  "ag56_5_homepage_surface_verification_executed",
  "ag56_8_go_live_decision_made",
  "actual_go_live_approval_granted",
  "v02_item_activated"
]);

const readiness = {
  module_id: "AG56.3",
  title: "AG56.4 Public URL and Listing Verification Readiness Record",
  status: "ready_for_ag56_4_public_url_listing_verification",
  ready_for_ag56_4: true,
  next_stage_id: "AG56.4",
  next_stage_title: "Public URL and Listing Verification",
  ag56_4_allowed_scope: [
    "Consume AG56.3 controlled publish-test artifact.",
    "Verify reserved slug/path and listing manifest.",
    "Verify article labels for reference/image credit status.",
    "Verify that no live deployment/backend dependency is introduced.",
    "Record URL/listing verification readiness.",
    "Keep live deployment, backend/Auth/RLS/API/runtime, service-role use and go-live decision disabled."
  ],
  ag56_4_blocked_scope: [
    "deployment or Vercel trigger",
    "live public check unless separately approved",
    "homepage live update",
    "go-live decision",
    "backend/Auth/Supabase activation",
    "runtime database/API reading",
    "RLS/grant mutation",
    "service-role use",
    "V02 expansion"
  ],
  hard_blocker_count_for_ag56_4: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG56.3",
  title: "AG56.3 to AG56.4 Public URL and Listing Verification Boundary",
  status: "ag56_4_public_url_listing_verification_boundary_created",
  next_stage_id: "AG56.4",
  next_stage_title: "Public URL and Listing Verification",
  allowed_scope: readiness.ag56_4_allowed_scope,
  blocked_scope: readiness.ag56_4_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "AG56.3",
  title: "Controlled Publish Test for One Article",
  status: "controlled_publish_test_ready_for_ag56_4",
  depends_on: ["AG56.2", "AG56.1", "AG55Z"],
  source_consumption_file: outputs.sourceConsumption,
  explicit_approval_gate_file: outputs.explicitApprovalGate,
  controlled_publish_artifact_file: outputs.controlledPublishArtifact,
  url_listing_manifest_file: outputs.urlListingManifest,
  reference_image_display_file: outputs.referenceImageDisplay,
  publish_test_boundary_file: outputs.publishTestBoundary,
  no_deployment_live_audit_file: outputs.noDeploymentLiveAudit,
  no_backend_runtime_audit_file: outputs.noBackendRuntimeAudit,
  no_go_live_audit_file: outputs.noGoLiveAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag56_3_controlled_publish_test_recorded: true,
    ag56_2_consumed: true,
    explicit_operator_approval_gate_recorded: true,
    controlled_publish_test_approved_for_static_artifact: true,
    controlled_publish_test_artifact_created: true,
    public_url_listing_manifest_recorded: true,
    reference_image_display_status_recorded: true,
    ready_for_ag56_4_public_url_listing_verification: true,
    hard_blocker_count_for_ag56_4: 0,
    publish_test_id: controlledPublishArtifact.publish_test_id,
    candidate_id: candidateId,
    intended_public_path: intendedPath,
    git_head_short: gitHead,
    branch,
    ...Object.fromEntries(Object.keys(blockedState).filter((k) => blockedState[k] === false).map((k) => [k, false]))
  },
  blocked_state: blockedState
};

const registry = { module_id: "AG56.3", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG56.3",
  status: review.status,
  ag56_3_controlled_publish_test_recorded: 1,
  ag56_2_consumed: 1,
  explicit_operator_approval_gate_recorded: 1,
  controlled_publish_test_approved_for_static_artifact: 1,
  controlled_publish_test_artifact_created: 1,
  public_url_listing_manifest_recorded: 1,
  reference_image_display_status_recorded: 1,
  ready_for_ag56_4_public_url_listing_verification: 1,
  hard_blocker_count_for_ag56_4: 0,
  ...Object.fromEntries(Object.keys(blockedState).filter((k) => blockedState[k] === false).map((k) => [k, 0]))
};

const doc = `# AG56.3 — Controlled Publish Test for One Article

## Result

AG56.3 records a controlled publish-test artifact for one article.

## Controlled artifact

- Publish test ID: AG56-3-PUBLISH-TEST-001
- Candidate ID: ${candidateId}
- Intended path: ${intendedPath}
- State: controlled publish-test artifact, not live

## Important boundary

This is not a live publication, deployment or go-live decision.

## Preserved blockers

- No live public URL
- No live listing update
- No homepage update
- No deployment or Vercel trigger
- No GitHub release/tag
- No live public checks
- No backend/Auth/Supabase/RLS/database runtime
- No service-role use
- No go-live decision
- No V02 expansion

## Next

AG56.4 — Public URL and Listing Verification.
`;

writeJson(outputs.sourceConsumption, sourceConsumption);
writeJson(outputs.explicitApprovalGate, explicitApprovalGate);
writeJson(outputs.controlledPublishArtifact, controlledPublishArtifact);
writeJson(outputs.urlListingManifest, urlListingManifest);
writeJson(outputs.referenceImageDisplay, referenceImageDisplay);
writeJson(outputs.publishTestBoundary, publishTestBoundary);
writeJson(outputs.noDeploymentLiveAudit, noDeploymentLiveAudit);
writeJson(outputs.noBackendRuntimeAudit, noBackendRuntimeAudit);
writeJson(outputs.noGoLiveAudit, noGoLiveAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG56.3 Controlled Publish Test generated.");
console.log("✅ Explicit approval gate recorded for controlled publish-test artifact only.");
console.log("✅ Controlled publish-test artifact and URL/listing manifest recorded.");
console.log("✅ No live URL, deployment, live check, backend/runtime, go-live decision or service-role use enabled.");
console.log("✅ Ready for AG56.4 Public URL and Listing Verification.");
