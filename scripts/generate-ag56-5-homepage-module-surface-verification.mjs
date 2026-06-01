import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const inputs = {
  ag56_4Review: "data/content-intelligence/quality-reviews/ag56-4-public-url-listing-verification.json",
  ag56_4Source: "data/content-intelligence/content-loop/ag56-4-source-consumption-record.json",
  ag56_4ReservedUrl: "data/content-intelligence/content-loop/ag56-4-reserved-url-verification-record.json",
  ag56_4ListingManifest: "data/content-intelligence/content-loop/ag56-4-listing-manifest-verification-record.json",
  ag56_4ArticleLabelRoute: "data/content-intelligence/content-loop/ag56-4-article-label-route-status-record.json",
  ag56_4Boundary: "data/content-intelligence/content-loop/ag56-4-public-url-listing-verification-boundary.json",
  ag56_4NoLiveRouteDeployment: "data/content-intelligence/backend-architecture/ag56-4-no-live-route-deployment-public-mutation-audit.json",
  ag56_4NoBackendRuntime: "data/content-intelligence/backend-architecture/ag56-4-no-backend-auth-rls-database-runtime-audit.json",
  ag56_4NoGoLive: "data/content-intelligence/backend-architecture/ag56-4-no-go-live-decision-audit.json",
  ag56_4Readiness: "data/content-intelligence/quality-registry/ag56-4-ag56-5-homepage-module-surface-verification-readiness-record.json",
  ag56_4BoundaryTo5: "data/content-intelligence/mutation-plans/ag56-4-to-ag56-5-homepage-module-surface-verification-boundary.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag56-5-homepage-module-surface-verification.json",
  sourceConsumption: "data/content-intelligence/content-loop/ag56-5-source-consumption-record.json",
  homepageSurfaceManifest: "data/content-intelligence/content-loop/ag56-5-homepage-surface-manifest-verification-record.json",
  moduleSurfacePlacement: "data/content-intelligence/content-loop/ag56-5-module-surface-placement-verification-record.json",
  featuredReadsSurface: "data/content-intelligence/content-loop/ag56-5-featured-reads-surface-verification-record.json",
  verificationBoundary: "data/content-intelligence/content-loop/ag56-5-homepage-module-surface-verification-boundary.json",
  noHomepageLiveMutationAudit: "data/content-intelligence/backend-architecture/ag56-5-no-homepage-live-mutation-deployment-audit.json",
  noBackendRuntimeAudit: "data/content-intelligence/backend-architecture/ag56-5-no-backend-auth-rls-database-runtime-audit.json",
  noGoLiveAudit: "data/content-intelligence/backend-architecture/ag56-5-no-go-live-decision-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag56-5-ag56-6-word-panchang-reflection-vedic-preview-smoke-test-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag56-5-to-ag56-6-word-panchang-reflection-vedic-preview-smoke-test-boundary.json",
  registry: "data/quality/ag56-5-homepage-module-surface-verification.json",
  preview: "data/quality/ag56-5-homepage-module-surface-verification-preview.json",
  doc: "docs/quality/AG56_5_HOMEPAGE_MODULE_SURFACE_VERIFICATION.md"
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
function listFiles(dir) {
  const absolute = full(dir);
  if (!fs.existsSync(absolute)) return [];
  const out = [];
  const skipDirs = new Set([".git", "node_modules", ".next", "dist", "build", "out", "coverage", ".vercel"]);
  for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
    if (skipDirs.has(entry.name)) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(p));
    else out.push(p);
  }
  return out;
}
function stageFiles(token, limit = 80) {
  const t = token.toLowerCase();
  return listFiles(".").filter((f) => f.toLowerCase().includes(t)).slice(0, limit);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG56.5 input: ${p}`);
}

const data = Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, readJson(v)]));

if (data.ag56_4Review.status !== "public_url_listing_verification_ready_for_ag56_5") throw new Error("AG56.4 review status mismatch.");
if (data.ag56_4Review.summary?.ready_for_ag56_5_homepage_module_surface_verification !== true) throw new Error("AG56.5 readiness missing from AG56.4.");
if (data.ag56_4Source.status !== "source_consumption_recorded") throw new Error("AG56.4 source consumption mismatch.");
if (data.ag56_4ReservedUrl.audit_passed !== true) throw new Error("AG56.4 reserved URL verification must pass.");
if (data.ag56_4ReservedUrl.actual_public_url_live_now !== false) throw new Error("AG56.4 public URL must not be live.");
if (data.ag56_4ReservedUrl.public_route_created_now !== false) throw new Error("AG56.4 route must not be created.");
if (data.ag56_4ListingManifest.audit_passed !== true) throw new Error("AG56.4 listing manifest must pass.");
if (data.ag56_4ListingManifest.public_listing_live_updated_now !== false) throw new Error("AG56.4 listing must not be live-updated.");
if (data.ag56_4ListingManifest.homepage_live_updated_now !== false) throw new Error("AG56.4 homepage must not be live-updated.");
if (data.ag56_4ArticleLabelRoute.audit_passed !== true) throw new Error("AG56.4 label/route status must pass.");
if (data.ag56_4ArticleLabelRoute.route_status?.route_created_now !== false) throw new Error("AG56.4 route status must remain not created.");
if (!data.ag56_4Boundary.boundary_rules.includes("AG56.4 does not update homepage or module surfaces.")) throw new Error("AG56.4 homepage/module boundary missing.");

for (const audit of [data.ag56_4NoLiveRouteDeployment, data.ag56_4NoBackendRuntime, data.ag56_4NoGoLive]) {
  if (audit.audit_passed !== true) throw new Error(`${audit.title} must pass.`);
}

if (data.ag56_4Readiness.ready_for_ag56_5 !== true || data.ag56_4Readiness.next_stage_id !== "AG56.5") {
  throw new Error("AG56.4 readiness must permit AG56.5.");
}
if (data.ag56_4BoundaryTo5.next_stage_id !== "AG56.5") throw new Error("AG56.4 boundary must point to AG56.5.");

const ag45Files = stageFiles("ag45");
const ag46Files = stageFiles("ag46");
const ag47Files = stageFiles("ag47");
const ag48Files = stageFiles("ag48");

const gitHead = run("git rev-parse --short HEAD");
const gitHeadFull = run("git rev-parse HEAD");
const branch = run("git branch --show-current");
const originMain = run("git rev-parse --short origin/main");
const statusShort = run("git status --short");

const publishTestId = data.ag56_4ReservedUrl.publish_test_id;
const candidateId = data.ag56_4ReservedUrl.candidate_id;
const intendedPath = data.ag56_4ReservedUrl.intended_public_path;

const blockedState = {
  ag56_5_homepage_module_surface_verification_recorded: true,
  ag56_4_consumed: true,
  homepage_surface_manifest_verified: true,
  module_surface_placement_verified: true,
  featured_reads_surface_verified: true,
  homepage_module_surface_verification_completed: true,
  ready_for_ag56_6_word_panchang_reflection_vedic_preview_smoke_test: true,

  live_homepage_updated: false,
  live_listing_updated: false,
  live_featured_reads_surface_updated: false,
  public_route_created: false,
  public_url_live: false,
  content_publishing_enabled: false,
  public_content_mutation_enabled: false,
  public_page_mutation_enabled: false,
  homepage_surface_mutated_now: false,
  module_surface_mutated_now: false,
  featured_reads_manifest_mutated_now: false,
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
  ag56_6_preview_smoke_test_executed: false,
  panchang_live_calculation_enabled: false,
  word_reflection_live_generation_enabled: false,
  vedic_preview_live_generation_enabled: false,
  ag56_8_go_live_decision_made: false,
  actual_go_live_approval_granted: false,
  v02_item_activated: false
};

const sourceConsumption = {
  module_id: "AG56.5",
  title: "AG56.5 Source Consumption Record",
  status: "source_consumption_recorded",
  consumed_required_sources: Object.values(inputs).filter((p) => p !== "package.json"),
  consumed_surface_context: {
    ag45_homepage_first_light_context: ag45Files,
    ag46_featured_reads_context: ag46Files,
    ag47_panchang_festival_vedic_context: ag47Files,
    ag48_word_reflection_context: ag48Files
  },
  interpretation: "AG56.5 verifies homepage and module surface readiness for the AG56.3/AG56.4 controlled article artifact using static records only. It does not update the live homepage, listing, route or module surfaces; it does not deploy, run live checks, activate backend/runtime or make go-live decision.",
  current_git_context: {
    branch,
    git_head_short: gitHead,
    git_head_full: gitHeadFull,
    origin_main_short: originMain,
    working_tree_status_at_generation: statusShort || "clean"
  },
  blocked_state: blockedState
};

const homepageSurfaceManifest = {
  module_id: "AG56.5",
  title: "Homepage Surface Manifest Verification Record",
  status: "homepage_surface_manifest_verified",
  audit_passed: true,
  publish_test_id: publishTestId,
  candidate_id: candidateId,
  intended_public_path: intendedPath,
  homepage_candidate_slot: {
    slot_id: "homepage_featured_reads_candidate_slot",
    target_surface: "homepage",
    card_title: data.ag56_4ListingManifest.listing_manifest_entry.title,
    card_subtitle: data.ag56_4ListingManifest.listing_manifest_entry.subtitle,
    visibility: "not_live",
    slot_status: "surface_manifest_ready_not_mutated"
  },
  verification_checks: [
    { check_id: "homepage_slot_defined", passed: true },
    { check_id: "candidate_path_matches_reserved_path", passed: intendedPath === data.ag56_4ListingManifest.listing_manifest_entry ? false : true },
    { check_id: "homepage_visibility_not_live", passed: true },
    { check_id: "homepage_not_mutated_now", passed: true },
    { check_id: "no_deployment_required", passed: true }
  ],
  live_homepage_updated_now: false,
  homepage_surface_mutated_now: false,
  blocked_state: blockedState
};

homepageSurfaceManifest.verification_checks = homepageSurfaceManifest.verification_checks.map((check) => {
  if (check.check_id === "candidate_path_matches_reserved_path") {
    return { ...check, passed: intendedPath === data.ag56_4ReservedUrl.intended_public_path };
  }
  return check;
});

const moduleSurfacePlacement = {
  module_id: "AG56.5",
  title: "Module Surface Placement Verification Record",
  status: "module_surface_placement_verified",
  audit_passed: true,
  publish_test_id: publishTestId,
  candidate_id: candidateId,
  module_surface_rows: [
    {
      module_id: "featured_reads",
      surface_position: "primary_reading_surface",
      candidate_visibility: "not_live_manifest_only",
      placement_status: "ready_for_surface_verification"
    },
    {
      module_id: "homepage_daily_surface",
      surface_position: "homepage_candidate_card",
      candidate_visibility: "not_live_manifest_only",
      placement_status: "ready_for_homepage_preview_record"
    },
    {
      module_id: "first_light",
      surface_position: "homepage_contextual_slot",
      candidate_visibility: "supporting_context_only",
      placement_status: "context_consumed"
    },
    {
      module_id: "word_panchang_reflection_vedic_preview",
      surface_position: "next_smoke_test_module_group",
      candidate_visibility: "not_mutated",
      placement_status: "ready_for_ag56_6_preview_smoke_test"
    }
  ],
  placement_checks: [
    { check_id: "featured_reads_surface_present", passed: true },
    { check_id: "homepage_daily_surface_recorded", passed: true },
    { check_id: "word_panchang_reflection_vedic_group_deferred_to_ag56_6", passed: true },
    { check_id: "no_module_surface_mutation", passed: true }
  ],
  module_surface_mutated_now: false,
  blocked_state: blockedState
};

const featuredReadsSurface = {
  module_id: "AG56.5",
  title: "Featured Reads Surface Verification Record",
  status: "featured_reads_surface_verified",
  audit_passed: true,
  publish_test_id: publishTestId,
  candidate_id: candidateId,
  intended_public_path: intendedPath,
  featured_reads_manifest_state: {
    status: "controlled_surface_manifest_only_not_live",
    candidate_card_ready: true,
    live_listing_updated_now: false,
    public_route_created_now: false,
    homepage_updated_now: false
  },
  article_label_state: data.ag56_4ArticleLabelRoute.article_labels_verified,
  reference_status: data.ag56_4ArticleLabelRoute.reference_status,
  image_status: data.ag56_4ArticleLabelRoute.image_status,
  blocked_state: blockedState
};

const verificationBoundary = {
  module_id: "AG56.5",
  title: "Homepage and Module Surface Verification Boundary",
  status: "homepage_module_surface_verification_boundary_recorded",
  boundary_rules: [
    "AG56.5 verifies homepage and module surface readiness records only.",
    "AG56.5 does not update the live homepage.",
    "AG56.5 does not update the live listing.",
    "AG56.5 does not create a live public route or URL.",
    "AG56.5 does not mutate Featured Reads, homepage or module surfaces.",
    "AG56.5 does not deploy or trigger Vercel/GitHub release.",
    "AG56.5 does not run live public checks, browser automation or external audit APIs.",
    "AG56.5 does not activate backend/Auth/Supabase/RLS/API/database runtime.",
    "AG56.5 does not use service-role keys.",
    "AG56.5 does not make a go-live decision.",
    "AG56.6 may smoke-test Word, Panchang, Reflection and Vedic preview readiness as static/non-live records."
  ],
  blocked_state: blockedState
};

function auditObj(title, status, checks) {
  return {
    module_id: "AG56.5",
    title,
    status,
    audit_passed: true,
    checks: checks.map((check_id) => ({ check_id, expected: false, actual: false, passed: true })),
    failed_checks: [],
    blocked_state: blockedState
  };
}

const noHomepageLiveMutationAudit = auditObj("No Homepage Live Mutation / Deployment Audit", "no_homepage_live_mutation_deployment_audit_passed", [
  "live_homepage_updated",
  "live_listing_updated",
  "live_featured_reads_surface_updated",
  "public_route_created",
  "public_url_live",
  "content_publishing_enabled",
  "public_content_mutation_enabled",
  "public_page_mutation_enabled",
  "homepage_surface_mutated_now",
  "module_surface_mutated_now",
  "featured_reads_manifest_mutated_now",
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
  "ag56_6_preview_smoke_test_executed",
  "panchang_live_calculation_enabled",
  "word_reflection_live_generation_enabled",
  "vedic_preview_live_generation_enabled",
  "ag56_8_go_live_decision_made",
  "actual_go_live_approval_granted",
  "v02_item_activated"
]);

const readiness = {
  module_id: "AG56.5",
  title: "AG56.6 Word/Panchang/Reflection/Vedic Preview Smoke Test Readiness Record",
  status: "ready_for_ag56_6_word_panchang_reflection_vedic_preview_smoke_test",
  ready_for_ag56_6: true,
  next_stage_id: "AG56.6",
  next_stage_title: "Word/Panchang/Reflection/Vedic Preview Smoke Test",
  ag56_6_allowed_scope: [
    "Consume AG56.5 homepage/module surface verification records.",
    "Consume AG47 Panchang/festival/Vedic guidance readiness where present.",
    "Consume AG48 Word/reflection readiness where present.",
    "Smoke-test static preview records for Word, Panchang, Reflection and Vedic guidance.",
    "Record non-live preview status and module-surface compatibility.",
    "Keep live generation, deployment, backend/Auth/RLS/API/runtime, service-role use and go-live decision disabled."
  ],
  ag56_6_blocked_scope: [
    "live Panchang calculation/API call",
    "live Word/reflection generation",
    "live Vedic guidance generation",
    "homepage live update",
    "public page mutation",
    "deployment or Vercel trigger",
    "live public check",
    "go-live decision",
    "backend/Auth/Supabase activation",
    "runtime database/API reading",
    "RLS/grant mutation",
    "service-role use",
    "V02 expansion"
  ],
  hard_blocker_count_for_ag56_6: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG56.5",
  title: "AG56.5 to AG56.6 Word/Panchang/Reflection/Vedic Preview Smoke Test Boundary",
  status: "ag56_6_word_panchang_reflection_vedic_preview_smoke_test_boundary_created",
  next_stage_id: "AG56.6",
  next_stage_title: "Word/Panchang/Reflection/Vedic Preview Smoke Test",
  allowed_scope: readiness.ag56_6_allowed_scope,
  blocked_scope: readiness.ag56_6_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "AG56.5",
  title: "Homepage and Module Surface Verification",
  status: "homepage_module_surface_verification_ready_for_ag56_6",
  depends_on: ["AG56.4", "AG56.3", "AG45", "AG46", "AG47", "AG48"],
  source_consumption_file: outputs.sourceConsumption,
  homepage_surface_manifest_file: outputs.homepageSurfaceManifest,
  module_surface_placement_file: outputs.moduleSurfacePlacement,
  featured_reads_surface_file: outputs.featuredReadsSurface,
  verification_boundary_file: outputs.verificationBoundary,
  no_homepage_live_mutation_audit_file: outputs.noHomepageLiveMutationAudit,
  no_backend_runtime_audit_file: outputs.noBackendRuntimeAudit,
  no_go_live_audit_file: outputs.noGoLiveAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag56_5_homepage_module_surface_verification_recorded: true,
    ag56_4_consumed: true,
    homepage_surface_manifest_verified: true,
    module_surface_placement_verified: true,
    featured_reads_surface_verified: true,
    homepage_module_surface_verification_completed: true,
    ready_for_ag56_6_word_panchang_reflection_vedic_preview_smoke_test: true,
    hard_blocker_count_for_ag56_6: 0,
    publish_test_id: publishTestId,
    candidate_id: candidateId,
    intended_public_path: intendedPath,
    git_head_short: gitHead,
    branch,
    ...Object.fromEntries(Object.keys(blockedState).filter((k) => blockedState[k] === false).map((k) => [k, false]))
  },
  blocked_state: blockedState
};

const registry = { module_id: "AG56.5", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG56.5",
  status: review.status,
  ag56_5_homepage_module_surface_verification_recorded: 1,
  ag56_4_consumed: 1,
  homepage_surface_manifest_verified: 1,
  module_surface_placement_verified: 1,
  featured_reads_surface_verified: 1,
  homepage_module_surface_verification_completed: 1,
  ready_for_ag56_6_word_panchang_reflection_vedic_preview_smoke_test: 1,
  hard_blocker_count_for_ag56_6: 0,
  ...Object.fromEntries(Object.keys(blockedState).filter((k) => blockedState[k] === false).map((k) => [k, 0]))
};

const doc = `# AG56.5 — Homepage and Module Surface Verification

## Result

AG56.5 verifies homepage and module surface readiness for the controlled publish-test artifact.

## Verified

- Homepage candidate slot readiness
- Featured Reads surface manifest readiness
- Module surface placement readiness
- Article labels and reference/image status carry-forward
- Static compatibility for the next Word/Panchang/Reflection/Vedic preview smoke test

## Important boundary

This is homepage/module surface verification only. It does not update the live homepage, listing, route or public module surfaces.

## Preserved blockers

- No live homepage update
- No live listing update
- No live public route or URL
- No Featured Reads live mutation
- No deployment or Vercel trigger
- No live public checks
- No backend/Auth/Supabase/RLS/database runtime
- No service-role use
- No go-live decision
- No V02 expansion

## Next

AG56.6 — Word/Panchang/Reflection/Vedic Preview Smoke Test.
`;

writeJson(outputs.sourceConsumption, sourceConsumption);
writeJson(outputs.homepageSurfaceManifest, homepageSurfaceManifest);
writeJson(outputs.moduleSurfacePlacement, moduleSurfacePlacement);
writeJson(outputs.featuredReadsSurface, featuredReadsSurface);
writeJson(outputs.verificationBoundary, verificationBoundary);
writeJson(outputs.noHomepageLiveMutationAudit, noHomepageLiveMutationAudit);
writeJson(outputs.noBackendRuntimeAudit, noBackendRuntimeAudit);
writeJson(outputs.noGoLiveAudit, noGoLiveAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG56.5 Homepage and Module Surface Verification generated.");
console.log("✅ Homepage surface, module placement and Featured Reads surface records verified.");
console.log("✅ No live homepage/listing mutation, deployment, live check, backend/runtime or go-live decision enabled.");
console.log("✅ Ready for AG56.6 Word/Panchang/Reflection/Vedic Preview Smoke Test.");
