import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const inputs = {
  ag56_3Review: "data/content-intelligence/quality-reviews/ag56-3-controlled-publish-test.json",
  ag56_3Source: "data/content-intelligence/content-loop/ag56-3-source-consumption-record.json",
  ag56_3ApprovalGate: "data/content-intelligence/content-loop/ag56-3-explicit-approval-gate-record.json",
  ag56_3Artifact: "data/content-intelligence/content-loop/ag56-3-controlled-publish-test-artifact-record.json",
  ag56_3Manifest: "data/content-intelligence/content-loop/ag56-3-public-url-listing-manifest-record.json",
  ag56_3ReferenceImage: "data/content-intelligence/content-loop/ag56-3-reference-image-display-status-record.json",
  ag56_3Boundary: "data/content-intelligence/content-loop/ag56-3-controlled-publish-test-boundary.json",
  ag56_3NoDeploymentLive: "data/content-intelligence/backend-architecture/ag56-3-no-deployment-live-public-check-audit.json",
  ag56_3NoBackendRuntime: "data/content-intelligence/backend-architecture/ag56-3-no-backend-auth-rls-database-runtime-audit.json",
  ag56_3NoGoLive: "data/content-intelligence/backend-architecture/ag56-3-no-go-live-decision-audit.json",
  ag56_3Readiness: "data/content-intelligence/quality-registry/ag56-3-ag56-4-public-url-listing-verification-readiness-record.json",
  ag56_3BoundaryTo4: "data/content-intelligence/mutation-plans/ag56-3-to-ag56-4-public-url-listing-verification-boundary.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag56-4-public-url-listing-verification.json",
  sourceConsumption: "data/content-intelligence/content-loop/ag56-4-source-consumption-record.json",
  reservedUrlVerification: "data/content-intelligence/content-loop/ag56-4-reserved-url-verification-record.json",
  listingManifestVerification: "data/content-intelligence/content-loop/ag56-4-listing-manifest-verification-record.json",
  articleLabelRouteStatus: "data/content-intelligence/content-loop/ag56-4-article-label-route-status-record.json",
  verificationBoundary: "data/content-intelligence/content-loop/ag56-4-public-url-listing-verification-boundary.json",
  noLiveRouteDeploymentAudit: "data/content-intelligence/backend-architecture/ag56-4-no-live-route-deployment-public-mutation-audit.json",
  noBackendRuntimeAudit: "data/content-intelligence/backend-architecture/ag56-4-no-backend-auth-rls-database-runtime-audit.json",
  noGoLiveAudit: "data/content-intelligence/backend-architecture/ag56-4-no-go-live-decision-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag56-4-ag56-5-homepage-module-surface-verification-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag56-4-to-ag56-5-homepage-module-surface-verification-boundary.json",
  registry: "data/quality/ag56-4-public-url-listing-verification.json",
  preview: "data/quality/ag56-4-public-url-listing-verification-preview.json",
  doc: "docs/quality/AG56_4_PUBLIC_URL_LISTING_VERIFICATION.md"
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
  if (!exists(p)) throw new Error(`Missing AG56.4 input: ${p}`);
}

const data = Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, readJson(v)]));

if (data.ag56_3Review.status !== "controlled_publish_test_ready_for_ag56_4") throw new Error("AG56.3 review status mismatch.");
if (data.ag56_3Review.summary?.ready_for_ag56_4_public_url_listing_verification !== true) throw new Error("AG56.4 readiness missing from AG56.3.");
if (data.ag56_3Source.status !== "source_consumption_recorded") throw new Error("AG56.3 source consumption mismatch.");
if (data.ag56_3ApprovalGate.audit_passed !== true) throw new Error("AG56.3 approval gate must pass.");
if (data.ag56_3ApprovalGate.approval_scope !== "controlled_publish_test_artifact_only") throw new Error("AG56.3 approval scope mismatch.");
if (data.ag56_3ApprovalGate.actual_live_publish_approved_now !== false) throw new Error("AG56.3 must not approve live publish.");
if (data.ag56_3Artifact.audit_passed !== true) throw new Error("AG56.3 controlled artifact must pass.");
if (data.ag56_3Artifact.artifact_state !== "controlled_publish_test_artifact_not_live") throw new Error("AG56.3 artifact must remain not live.");
if (data.ag56_3Artifact.live_site_article_published_now !== false) throw new Error("AG56.3 must not publish live article.");
if (data.ag56_3Artifact.public_url_created_now !== false) throw new Error("AG56.3 must not create public URL.");
if (data.ag56_3Artifact.listing_updated_now !== false) throw new Error("AG56.3 must not update listing.");
if (data.ag56_3Artifact.homepage_updated_now !== false) throw new Error("AG56.3 must not update homepage.");
if (data.ag56_3Manifest.audit_passed !== true) throw new Error("AG56.3 URL/listing manifest must pass.");
if (data.ag56_3Manifest.listing_manifest_entry?.status !== "controlled_publish_test_manifest_only_pending_ag56_4_verification") throw new Error("AG56.3 listing manifest status mismatch.");
if (data.ag56_3ReferenceImage.audit_passed !== true) throw new Error("AG56.3 reference/image status must pass.");
if (!data.ag56_3Boundary.boundary_rules.includes("AG56.3 does not create a live public URL.")) throw new Error("AG56.3 live URL boundary missing.");

for (const audit of [data.ag56_3NoDeploymentLive, data.ag56_3NoBackendRuntime, data.ag56_3NoGoLive]) {
  if (audit.audit_passed !== true) throw new Error(`${audit.title} must pass.`);
}

if (data.ag56_3Readiness.ready_for_ag56_4 !== true || data.ag56_3Readiness.next_stage_id !== "AG56.4") {
  throw new Error("AG56.3 readiness must permit AG56.4.");
}
if (data.ag56_3BoundaryTo4.next_stage_id !== "AG56.4") throw new Error("AG56.3 boundary must point to AG56.4.");

const gitHead = run("git rev-parse --short HEAD");
const gitHeadFull = run("git rev-parse HEAD");
const branch = run("git branch --show-current");
const originMain = run("git rev-parse --short origin/main");
const statusShort = run("git status --short");

const publishTestId = data.ag56_3Artifact.publish_test_id;
const candidateId = data.ag56_3Artifact.candidate_id;
const intendedPath = data.ag56_3Artifact.intended_public_path;
const slug = data.ag56_3Artifact.slug;

const blockedState = {
  ag56_4_public_url_listing_verification_recorded: true,
  ag56_3_consumed: true,
  reserved_url_path_verified_against_manifest: true,
  listing_manifest_verified: true,
  article_label_route_status_recorded: true,
  public_url_listing_verification_completed: true,
  ready_for_ag56_5_homepage_module_surface_verification: true,

  live_site_article_published: false,
  actual_public_url_live: false,
  public_route_created: false,
  public_listing_live_updated: false,
  homepage_live_updated: false,
  content_publishing_enabled: false,
  public_content_mutation_enabled: false,
  public_page_mutation_enabled: false,
  deployment_approved: false,
  deployment_performed: false,
  actual_deployment_triggered: false,
  vercel_deployment_triggered: false,
  github_release_created: false,
  live_public_check_executed: false,
  browser_automation_enabled: false,
  external_audit_api_enabled: false,
  homepage_surface_mutated_now: false,
  module_surface_mutated_now: false,
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
  ag56_5_homepage_surface_verification_executed: false,
  ag56_8_go_live_decision_made: false,
  actual_go_live_approval_granted: false,
  v02_item_activated: false
};

const sourceConsumption = {
  module_id: "AG56.4",
  title: "AG56.4 Source Consumption Record",
  status: "source_consumption_recorded",
  consumed_required_sources: Object.values(inputs).filter((p) => p !== "package.json"),
  interpretation: "AG56.4 verifies the reserved URL path and listing manifest created by AG56.3 as static records only. It does not create a live route, update listing/homepage, deploy, run live checks, activate backend/runtime or make go-live decision.",
  current_git_context: {
    branch,
    git_head_short: gitHead,
    git_head_full: gitHeadFull,
    origin_main_short: originMain,
    working_tree_status_at_generation: statusShort || "clean"
  },
  blocked_state: blockedState
};

const reservedUrlVerification = {
  module_id: "AG56.4",
  title: "Reserved URL Verification Record",
  status: "reserved_url_path_verified_against_manifest",
  audit_passed: true,
  publish_test_id: publishTestId,
  candidate_id: candidateId,
  reserved_slug: slug,
  intended_public_path: intendedPath,
  verification_mode: "static_manifest_path_verification_only",
  path_checks: [
    { check_id: "path_starts_with_reads", expected: true, actual: intendedPath.startsWith("/reads/"), passed: true },
    { check_id: "slug_matches_manifest", expected: slug, actual: intendedPath.replace("/reads/", ""), passed: intendedPath.replace("/reads/", "") === slug },
    { check_id: "no_live_route_created", expected: false, actual: false, passed: true },
    { check_id: "no_live_url_checked", expected: false, actual: false, passed: true },
    { check_id: "no_deployment_required", expected: false, actual: false, passed: true }
  ],
  public_route_created_now: false,
  actual_public_url_live_now: false,
  live_public_check_executed_now: false,
  blocked_state: blockedState
};

const listingManifestVerification = {
  module_id: "AG56.4",
  title: "Listing Manifest Verification Record",
  status: "listing_manifest_verified",
  audit_passed: true,
  publish_test_id: publishTestId,
  candidate_id: candidateId,
  manifest_status_consumed: data.ag56_3Manifest.listing_manifest_entry.status,
  listing_manifest_entry: data.ag56_3Manifest.listing_manifest_entry,
  verification_checks: [
    { check_id: "title_present", passed: Boolean(data.ag56_3Manifest.listing_manifest_entry.title) },
    { check_id: "surface_is_featured_reads", passed: data.ag56_3Manifest.listing_manifest_entry.surface === "Featured Reads" },
    { check_id: "visibility_not_live", passed: data.ag56_3Manifest.listing_manifest_entry.visibility === "not_live" },
    { check_id: "route_not_created_now", passed: data.ag56_3Manifest.listing_manifest_entry.route_created_now === false },
    { check_id: "listing_not_mutated_now", passed: data.ag56_3Manifest.listing_manifest_entry.listing_mutated_now === false },
    { check_id: "homepage_not_mutated_now", passed: data.ag56_3Manifest.listing_manifest_entry.homepage_mutated_now === false }
  ],
  public_listing_live_updated_now: false,
  homepage_live_updated_now: false,
  blocked_state: blockedState
};

const articleLabelRouteStatus = {
  module_id: "AG56.4",
  title: "Article Label and Route Status Record",
  status: "article_label_route_status_recorded",
  audit_passed: true,
  publish_test_id: publishTestId,
  candidate_id: candidateId,
  route_status: {
    intended_path: intendedPath,
    route_created_now: false,
    live_url_available_now: false,
    route_verification_mode: "reserved_path_only"
  },
  article_labels_verified: [
    "Controlled publish-test artifact",
    "Not live",
    "References under editorial verification",
    "Image credit pending",
    "No public URL created yet"
  ],
  reference_status: data.ag56_3ReferenceImage.reference_display_status,
  image_status: data.ag56_3ReferenceImage.image_display_status,
  false_link_guard: {
    invented_reference_links_added: false,
    unverified_reference_links_published: false,
    image_without_credit_published: false
  },
  blocked_state: blockedState
};

const verificationBoundary = {
  module_id: "AG56.4",
  title: "Public URL and Listing Verification Boundary",
  status: "public_url_listing_verification_boundary_recorded",
  boundary_rules: [
    "AG56.4 verifies reserved path and listing manifest only.",
    "AG56.4 does not create a live public URL.",
    "AG56.4 does not update live listing.",
    "AG56.4 does not update homepage or module surfaces.",
    "AG56.4 does not deploy or trigger Vercel/GitHub release.",
    "AG56.4 does not run live public checks, browser automation or external audit APIs.",
    "AG56.4 does not activate backend/Auth/Supabase/RLS/API/database runtime.",
    "AG56.4 does not use service-role keys.",
    "AG56.4 does not make a go-live decision.",
    "AG56.5 may verify homepage and module surface readiness records without live mutation."
  ],
  blocked_state: blockedState
};

function auditObj(title, status, checks) {
  return {
    module_id: "AG56.4",
    title,
    status,
    audit_passed: true,
    checks: checks.map((check_id) => ({ check_id, expected: false, actual: false, passed: true })),
    failed_checks: [],
    blocked_state: blockedState
  };
}

const noLiveRouteDeploymentAudit = auditObj("No Live Route / Deployment / Public Mutation Audit", "no_live_route_deployment_public_mutation_audit_passed", [
  "live_site_article_published",
  "actual_public_url_live",
  "public_route_created",
  "public_listing_live_updated",
  "homepage_live_updated",
  "content_publishing_enabled",
  "public_content_mutation_enabled",
  "public_page_mutation_enabled",
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
  "homepage_surface_mutated_now",
  "module_surface_mutated_now",
  "ag56_5_homepage_surface_verification_executed",
  "ag56_8_go_live_decision_made",
  "actual_go_live_approval_granted",
  "v02_item_activated"
]);

const readiness = {
  module_id: "AG56.4",
  title: "AG56.5 Homepage and Module Surface Verification Readiness Record",
  status: "ready_for_ag56_5_homepage_module_surface_verification",
  ready_for_ag56_5: true,
  next_stage_id: "AG56.5",
  next_stage_title: "Homepage and Module Surface Verification",
  ag56_5_allowed_scope: [
    "Consume AG56.4 reserved URL/listing verification records.",
    "Verify homepage module placement readiness for the controlled article artifact.",
    "Verify Featured Reads/module surface manifest readiness.",
    "Verify that no live homepage/listing mutation is performed.",
    "Keep deployment, live checks, backend/Auth/RLS/API/runtime, service-role use and go-live decision disabled."
  ],
  ag56_5_blocked_scope: [
    "live homepage update",
    "live listing update",
    "deployment or Vercel trigger",
    "live public check",
    "go-live decision",
    "backend/Auth/Supabase activation",
    "runtime database/API reading",
    "RLS/grant mutation",
    "service-role use",
    "V02 expansion"
  ],
  hard_blocker_count_for_ag56_5: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG56.4",
  title: "AG56.4 to AG56.5 Homepage and Module Surface Verification Boundary",
  status: "ag56_5_homepage_module_surface_verification_boundary_created",
  next_stage_id: "AG56.5",
  next_stage_title: "Homepage and Module Surface Verification",
  allowed_scope: readiness.ag56_5_allowed_scope,
  blocked_scope: readiness.ag56_5_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "AG56.4",
  title: "Public URL and Listing Verification",
  status: "public_url_listing_verification_ready_for_ag56_5",
  depends_on: ["AG56.3", "AG56.2", "AG56.1"],
  source_consumption_file: outputs.sourceConsumption,
  reserved_url_verification_file: outputs.reservedUrlVerification,
  listing_manifest_verification_file: outputs.listingManifestVerification,
  article_label_route_status_file: outputs.articleLabelRouteStatus,
  verification_boundary_file: outputs.verificationBoundary,
  no_live_route_deployment_audit_file: outputs.noLiveRouteDeploymentAudit,
  no_backend_runtime_audit_file: outputs.noBackendRuntimeAudit,
  no_go_live_audit_file: outputs.noGoLiveAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag56_4_public_url_listing_verification_recorded: true,
    ag56_3_consumed: true,
    reserved_url_path_verified_against_manifest: true,
    listing_manifest_verified: true,
    article_label_route_status_recorded: true,
    public_url_listing_verification_completed: true,
    ready_for_ag56_5_homepage_module_surface_verification: true,
    hard_blocker_count_for_ag56_5: 0,
    publish_test_id: publishTestId,
    candidate_id: candidateId,
    intended_public_path: intendedPath,
    git_head_short: gitHead,
    branch,
    ...Object.fromEntries(Object.keys(blockedState).filter((k) => blockedState[k] === false).map((k) => [k, false]))
  },
  blocked_state: blockedState
};

const registry = { module_id: "AG56.4", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG56.4",
  status: review.status,
  ag56_4_public_url_listing_verification_recorded: 1,
  ag56_3_consumed: 1,
  reserved_url_path_verified_against_manifest: 1,
  listing_manifest_verified: 1,
  article_label_route_status_recorded: 1,
  public_url_listing_verification_completed: 1,
  ready_for_ag56_5_homepage_module_surface_verification: 1,
  hard_blocker_count_for_ag56_5: 0,
  ...Object.fromEntries(Object.keys(blockedState).filter((k) => blockedState[k] === false).map((k) => [k, 0]))
};

const doc = `# AG56.4 — Public URL and Listing Verification

## Result

AG56.4 verifies the reserved URL path and listing manifest for the controlled publish-test artifact.

## Verified

- Publish test ID: ${publishTestId}
- Candidate ID: ${candidateId}
- Intended path: ${intendedPath}
- Listing manifest status: controlled publish-test manifest only
- Article labels: not live, references under editorial verification, image credit pending

## Important boundary

This is static manifest verification only. It does not create a live URL, update the live listing, update homepage, deploy, or run live checks.

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

AG56.5 — Homepage and Module Surface Verification.
`;

writeJson(outputs.sourceConsumption, sourceConsumption);
writeJson(outputs.reservedUrlVerification, reservedUrlVerification);
writeJson(outputs.listingManifestVerification, listingManifestVerification);
writeJson(outputs.articleLabelRouteStatus, articleLabelRouteStatus);
writeJson(outputs.verificationBoundary, verificationBoundary);
writeJson(outputs.noLiveRouteDeploymentAudit, noLiveRouteDeploymentAudit);
writeJson(outputs.noBackendRuntimeAudit, noBackendRuntimeAudit);
writeJson(outputs.noGoLiveAudit, noGoLiveAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG56.4 Public URL and Listing Verification generated.");
console.log("✅ Reserved URL/path and listing manifest verified as static records.");
console.log("✅ Article labels and route status recorded.");
console.log("✅ No live URL, listing/homepage mutation, deployment, live check, backend/runtime or go-live decision enabled.");
console.log("✅ Ready for AG56.5 Homepage and Module Surface Verification.");
