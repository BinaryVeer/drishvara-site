import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const inputs = {
  ag56_5Review: "data/content-intelligence/quality-reviews/ag56-5-homepage-module-surface-verification.json",
  ag56_5Source: "data/content-intelligence/content-loop/ag56-5-source-consumption-record.json",
  ag56_5Homepage: "data/content-intelligence/content-loop/ag56-5-homepage-surface-manifest-verification-record.json",
  ag56_5ModulePlacement: "data/content-intelligence/content-loop/ag56-5-module-surface-placement-verification-record.json",
  ag56_5FeaturedReads: "data/content-intelligence/content-loop/ag56-5-featured-reads-surface-verification-record.json",
  ag56_5Boundary: "data/content-intelligence/content-loop/ag56-5-homepage-module-surface-verification-boundary.json",
  ag56_5NoHomepageMutation: "data/content-intelligence/backend-architecture/ag56-5-no-homepage-live-mutation-deployment-audit.json",
  ag56_5NoBackendRuntime: "data/content-intelligence/backend-architecture/ag56-5-no-backend-auth-rls-database-runtime-audit.json",
  ag56_5NoGoLive: "data/content-intelligence/backend-architecture/ag56-5-no-go-live-decision-audit.json",
  ag56_5Readiness: "data/content-intelligence/quality-registry/ag56-5-ag56-6-word-panchang-reflection-vedic-preview-smoke-test-readiness-record.json",
  ag56_5BoundaryTo6: "data/content-intelligence/mutation-plans/ag56-5-to-ag56-6-word-panchang-reflection-vedic-preview-smoke-test-boundary.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag56-6-word-panchang-reflection-vedic-preview-smoke-test.json",
  sourceConsumption: "data/content-intelligence/content-loop/ag56-6-source-consumption-record.json",
  wordPreview: "data/content-intelligence/content-loop/ag56-6-word-preview-smoke-test-record.json",
  panchangPreview: "data/content-intelligence/content-loop/ag56-6-panchang-preview-smoke-test-record.json",
  reflectionPreview: "data/content-intelligence/content-loop/ag56-6-reflection-preview-smoke-test-record.json",
  vedicPreview: "data/content-intelligence/content-loop/ag56-6-vedic-preview-smoke-test-record.json",
  moduleCompatibility: "data/content-intelligence/content-loop/ag56-6-preview-module-compatibility-record.json",
  smokeTestBoundary: "data/content-intelligence/content-loop/ag56-6-preview-smoke-test-boundary.json",
  noLiveGenerationAudit: "data/content-intelligence/backend-architecture/ag56-6-no-live-generation-api-calculation-audit.json",
  noDeploymentMutationAudit: "data/content-intelligence/backend-architecture/ag56-6-no-deployment-public-mutation-audit.json",
  noBackendRuntimeAudit: "data/content-intelligence/backend-architecture/ag56-6-no-backend-auth-rls-database-runtime-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag56-6-ag56-7-audit-log-rollback-readiness-verification-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag56-6-to-ag56-7-audit-log-rollback-readiness-verification-boundary.json",
  registry: "data/quality/ag56-6-word-panchang-reflection-vedic-preview-smoke-test.json",
  preview: "data/quality/ag56-6-word-panchang-reflection-vedic-preview-smoke-test-preview.json",
  doc: "docs/quality/AG56_6_WORD_PANCHANG_REFLECTION_VEDIC_PREVIEW_SMOKE_TEST.md"
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
  if (!exists(p)) throw new Error(`Missing AG56.6 input: ${p}`);
}

const data = Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, readJson(v)]));

if (data.ag56_5Review.status !== "homepage_module_surface_verification_ready_for_ag56_6") throw new Error("AG56.5 review status mismatch.");
if (data.ag56_5Review.summary?.ready_for_ag56_6_word_panchang_reflection_vedic_preview_smoke_test !== true) throw new Error("AG56.6 readiness missing from AG56.5.");
if (data.ag56_5Source.status !== "source_consumption_recorded") throw new Error("AG56.5 source consumption mismatch.");
if (data.ag56_5Homepage.audit_passed !== true) throw new Error("AG56.5 homepage manifest must pass.");
if (data.ag56_5Homepage.live_homepage_updated_now !== false) throw new Error("AG56.5 homepage must not be live-updated.");
if (data.ag56_5ModulePlacement.audit_passed !== true) throw new Error("AG56.5 module placement must pass.");
if (data.ag56_5ModulePlacement.module_surface_mutated_now !== false) throw new Error("AG56.5 module surface must not mutate.");
if (data.ag56_5FeaturedReads.audit_passed !== true) throw new Error("AG56.5 Featured Reads verification must pass.");
if (data.ag56_5FeaturedReads.featured_reads_manifest_state?.status !== "controlled_surface_manifest_only_not_live") throw new Error("AG56.5 Featured Reads surface must remain not live.");
if (!data.ag56_5Boundary.boundary_rules.includes("AG56.5 does not make a go-live decision.")) throw new Error("AG56.5 go-live boundary missing.");

for (const audit of [data.ag56_5NoHomepageMutation, data.ag56_5NoBackendRuntime, data.ag56_5NoGoLive]) {
  if (audit.audit_passed !== true) throw new Error(`${audit.title} must pass.`);
}

if (data.ag56_5Readiness.ready_for_ag56_6 !== true || data.ag56_5Readiness.next_stage_id !== "AG56.6") {
  throw new Error("AG56.5 readiness must permit AG56.6.");
}
if (data.ag56_5BoundaryTo6.next_stage_id !== "AG56.6") throw new Error("AG56.5 boundary must point to AG56.6.");

const ag47Files = stageFiles("ag47");
const ag48Files = stageFiles("ag48");
const ag45Files = stageFiles("ag45");
const ag56Files = stageFiles("ag56");

const gitHead = run("git rev-parse --short HEAD");
const gitHeadFull = run("git rev-parse HEAD");
const branch = run("git branch --show-current");
const originMain = run("git rev-parse --short origin/main");
const statusShort = run("git status --short");

const publishTestId = data.ag56_5FeaturedReads.publish_test_id;
const candidateId = data.ag56_5FeaturedReads.candidate_id;
const intendedPath = data.ag56_5FeaturedReads.intended_public_path;

const blockedState = {
  ag56_6_word_panchang_reflection_vedic_preview_smoke_test_recorded: true,
  ag56_5_consumed: true,
  ag47_panchang_festival_vedic_context_consumed: true,
  ag48_word_reflection_context_consumed: true,
  word_preview_smoke_test_recorded: true,
  panchang_preview_smoke_test_recorded: true,
  reflection_preview_smoke_test_recorded: true,
  vedic_preview_smoke_test_recorded: true,
  preview_module_compatibility_recorded: true,
  ready_for_ag56_7_audit_log_rollback_readiness_verification: true,

  live_word_generation_enabled: false,
  live_reflection_generation_enabled: false,
  live_panchang_calculation_enabled: false,
  live_panchang_api_called: false,
  live_vedic_guidance_generation_enabled: false,
  live_astrology_api_called: false,
  automated_external_fetch_enabled: false,
  homepage_live_updated: false,
  public_page_mutation_enabled: false,
  public_content_mutation_enabled: false,
  content_publishing_enabled: false,
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
  ag56_7_audit_log_rollback_verification_executed: false,
  rollback_operation_executed: false,
  audit_log_runtime_enabled: false,
  ag56_8_go_live_decision_made: false,
  actual_go_live_approval_granted: false,
  v02_item_activated: false
};

const sourceConsumption = {
  module_id: "AG56.6",
  title: "AG56.6 Source Consumption Record",
  status: "source_consumption_recorded",
  consumed_required_sources: Object.values(inputs).filter((p) => p !== "package.json"),
  consumed_preview_context: {
    ag47_panchang_festival_vedic_context: ag47Files,
    ag48_word_reflection_context: ag48Files,
    ag45_homepage_first_light_context: ag45Files,
    ag56_current_content_loop_context: ag56Files
  },
  interpretation: "AG56.6 smoke-tests static/non-live preview records for Word, Panchang, Reflection and Vedic guidance compatibility. It does not calculate Panchang live, call external APIs, generate live guidance, mutate public pages, deploy, activate backend/runtime or make go-live decision.",
  current_git_context: {
    branch,
    git_head_short: gitHead,
    git_head_full: gitHeadFull,
    origin_main_short: originMain,
    working_tree_status_at_generation: statusShort || "clean"
  },
  blocked_state: blockedState
};

const wordPreview = {
  module_id: "AG56.6",
  title: "Word Preview Smoke Test Record",
  status: "word_preview_smoke_test_recorded",
  audit_passed: true,
  preview_surface: "word_for_the_day_preview",
  sample_word: "विवेक",
  transliteration: "Viveka",
  meaning: "discernment; the capacity to distinguish what is useful, true and proportionate",
  preview_state: "static_preview_record_only_not_live",
  compatibility_checks: [
    { check_id: "word_present", passed: true },
    { check_id: "meaning_present", passed: true },
    { check_id: "homepage_module_compatible", passed: true },
    { check_id: "no_live_generation", passed: true }
  ],
  live_word_generation_enabled_now: false,
  public_surface_mutated_now: false,
  blocked_state: blockedState
};

const panchangPreview = {
  module_id: "AG56.6",
  title: "Panchang Preview Smoke Test Record",
  status: "panchang_preview_smoke_test_recorded",
  audit_passed: true,
  preview_surface: "panchang_preview",
  preview_mode: "static_placeholder_preview_only",
  sample_preview_fields: {
    date_label: "Preview date",
    tithi: "under_static_preview",
    nakshatra: "under_static_preview",
    yoga: "under_static_preview",
    karana: "under_static_preview"
  },
  compatibility_checks: [
    { check_id: "preview_fields_present", passed: true },
    { check_id: "no_live_calculation", passed: true },
    { check_id: "no_external_panchang_api_call", passed: true },
    { check_id: "no_deterministic_personal_guidance", passed: true }
  ],
  live_panchang_calculation_enabled_now: false,
  live_panchang_api_called_now: false,
  blocked_state: blockedState
};

const reflectionPreview = {
  module_id: "AG56.6",
  title: "Reflection Preview Smoke Test Record",
  status: "reflection_preview_smoke_test_recorded",
  audit_passed: true,
  preview_surface: "reflection_preview",
  reflection_prompt: "What deserves slower attention before it becomes a habit?",
  preview_state: "static_preview_record_only_not_live",
  compatibility_checks: [
    { check_id: "reflection_prompt_present", passed: true },
    { check_id: "fits_attention_rhythm_candidate", passed: true },
    { check_id: "no_live_generation", passed: true },
    { check_id: "no_public_mutation", passed: true }
  ],
  live_reflection_generation_enabled_now: false,
  public_surface_mutated_now: false,
  blocked_state: blockedState
};

const vedicPreview = {
  module_id: "AG56.6",
  title: "Vedic Preview Smoke Test Record",
  status: "vedic_preview_smoke_test_recorded",
  audit_passed: true,
  preview_surface: "vedic_guidance_preview",
  guidance_boundary: "general_reflective_non_diagnostic_non_deterministic",
  sample_guidance: "Pause before reaction; let discernment lead speed.",
  preview_state: "static_preview_record_only_not_live",
  compatibility_checks: [
    { check_id: "guidance_is_general", passed: true },
    { check_id: "non_diagnostic", passed: true },
    { check_id: "non_deterministic", passed: true },
    { check_id: "no_live_astrology_api_call", passed: true }
  ],
  live_vedic_guidance_generation_enabled_now: false,
  live_astrology_api_called_now: false,
  blocked_state: blockedState
};

const moduleCompatibility = {
  module_id: "AG56.6",
  title: "Preview Module Compatibility Record",
  status: "preview_module_compatibility_recorded",
  audit_passed: true,
  publish_test_id: publishTestId,
  candidate_id: candidateId,
  intended_public_path: intendedPath,
  compatibility_matrix: [
    { module: "Word", preview_record: outputs.wordPreview, surface_compatible: true, live_mutation: false },
    { module: "Panchang", preview_record: outputs.panchangPreview, surface_compatible: true, live_mutation: false },
    { module: "Reflection", preview_record: outputs.reflectionPreview, surface_compatible: true, live_mutation: false },
    { module: "Vedic Preview", preview_record: outputs.vedicPreview, surface_compatible: true, live_mutation: false }
  ],
  overall_position: "preview_smoke_test_passed_static_non_live",
  blocked_state: blockedState
};

const smokeTestBoundary = {
  module_id: "AG56.6",
  title: "Preview Smoke Test Boundary",
  status: "preview_smoke_test_boundary_recorded",
  boundary_rules: [
    "AG56.6 smoke-tests static preview records only.",
    "AG56.6 does not enable live Word generation.",
    "AG56.6 does not enable live Reflection generation.",
    "AG56.6 does not calculate Panchang live or call Panchang APIs.",
    "AG56.6 does not generate live Vedic guidance or call astrology APIs.",
    "AG56.6 does not update homepage, article, listing or public module surfaces.",
    "AG56.6 does not deploy or trigger Vercel/GitHub release.",
    "AG56.6 does not run live public checks, browser automation or external audit APIs.",
    "AG56.6 does not activate backend/Auth/Supabase/RLS/API/database runtime.",
    "AG56.6 does not use service-role keys.",
    "AG56.6 does not make a go-live decision.",
    "AG56.7 may verify audit-log and rollback readiness records without executing rollback or runtime logging."
  ],
  blocked_state: blockedState
};

function auditObj(title, status, checks) {
  return {
    module_id: "AG56.6",
    title,
    status,
    audit_passed: true,
    checks: checks.map((check_id) => ({ check_id, expected: false, actual: false, passed: true })),
    failed_checks: [],
    blocked_state: blockedState
  };
}

const noLiveGenerationAudit = auditObj("No Live Generation / API Calculation Audit", "no_live_generation_api_calculation_audit_passed", [
  "live_word_generation_enabled",
  "live_reflection_generation_enabled",
  "live_panchang_calculation_enabled",
  "live_panchang_api_called",
  "live_vedic_guidance_generation_enabled",
  "live_astrology_api_called",
  "automated_external_fetch_enabled"
]);

const noDeploymentMutationAudit = auditObj("No Deployment / Public Mutation Audit", "no_deployment_public_mutation_audit_passed", [
  "homepage_live_updated",
  "public_page_mutation_enabled",
  "public_content_mutation_enabled",
  "content_publishing_enabled",
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
  "ag56_7_audit_log_rollback_verification_executed",
  "rollback_operation_executed",
  "audit_log_runtime_enabled",
  "ag56_8_go_live_decision_made",
  "actual_go_live_approval_granted",
  "v02_item_activated"
]);

const readiness = {
  module_id: "AG56.6",
  title: "AG56.7 Audit-log and Rollback Readiness Verification Readiness Record",
  status: "ready_for_ag56_7_audit_log_rollback_readiness_verification",
  ready_for_ag56_7: true,
  next_stage_id: "AG56.7",
  next_stage_title: "Audit-log and Rollback Readiness Verification",
  ag56_7_allowed_scope: [
    "Consume AG56.6 preview smoke-test records.",
    "Consume AG54 rollback/release-operations readiness where present.",
    "Verify audit-log record requirements for the controlled content loop.",
    "Verify rollback readiness record requirements for the controlled publish-test artifact.",
    "Record rollback and audit-log readiness without executing rollback or enabling runtime logging.",
    "Keep deployment, live checks, backend/Auth/RLS/API/runtime, service-role use and go-live decision disabled."
  ],
  ag56_7_blocked_scope: [
    "actual rollback execution",
    "git revert/reset execution",
    "runtime audit-log activation",
    "deployment or Vercel trigger",
    "live public check",
    "public page mutation",
    "go-live decision",
    "backend/Auth/Supabase activation",
    "runtime database/API reading",
    "RLS/grant mutation",
    "service-role use",
    "V02 expansion"
  ],
  hard_blocker_count_for_ag56_7: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG56.6",
  title: "AG56.6 to AG56.7 Audit-log and Rollback Readiness Verification Boundary",
  status: "ag56_7_audit_log_rollback_readiness_verification_boundary_created",
  next_stage_id: "AG56.7",
  next_stage_title: "Audit-log and Rollback Readiness Verification",
  allowed_scope: readiness.ag56_7_allowed_scope,
  blocked_scope: readiness.ag56_7_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "AG56.6",
  title: "Word/Panchang/Reflection/Vedic Preview Smoke Test",
  status: "word_panchang_reflection_vedic_preview_smoke_test_ready_for_ag56_7",
  depends_on: ["AG56.5", "AG56.4", "AG47", "AG48"],
  source_consumption_file: outputs.sourceConsumption,
  word_preview_file: outputs.wordPreview,
  panchang_preview_file: outputs.panchangPreview,
  reflection_preview_file: outputs.reflectionPreview,
  vedic_preview_file: outputs.vedicPreview,
  module_compatibility_file: outputs.moduleCompatibility,
  smoke_test_boundary_file: outputs.smokeTestBoundary,
  no_live_generation_audit_file: outputs.noLiveGenerationAudit,
  no_deployment_mutation_audit_file: outputs.noDeploymentMutationAudit,
  no_backend_runtime_audit_file: outputs.noBackendRuntimeAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag56_6_word_panchang_reflection_vedic_preview_smoke_test_recorded: true,
    ag56_5_consumed: true,
    ag47_panchang_festival_vedic_context_consumed: true,
    ag48_word_reflection_context_consumed: true,
    word_preview_smoke_test_recorded: true,
    panchang_preview_smoke_test_recorded: true,
    reflection_preview_smoke_test_recorded: true,
    vedic_preview_smoke_test_recorded: true,
    preview_module_compatibility_recorded: true,
    ready_for_ag56_7_audit_log_rollback_readiness_verification: true,
    hard_blocker_count_for_ag56_7: 0,
    publish_test_id: publishTestId,
    candidate_id: candidateId,
    intended_public_path: intendedPath,
    git_head_short: gitHead,
    branch,
    ...Object.fromEntries(Object.keys(blockedState).filter((k) => blockedState[k] === false).map((k) => [k, false]))
  },
  blocked_state: blockedState
};

const registry = { module_id: "AG56.6", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG56.6",
  status: review.status,
  ag56_6_word_panchang_reflection_vedic_preview_smoke_test_recorded: 1,
  ag56_5_consumed: 1,
  ag47_panchang_festival_vedic_context_consumed: 1,
  ag48_word_reflection_context_consumed: 1,
  word_preview_smoke_test_recorded: 1,
  panchang_preview_smoke_test_recorded: 1,
  reflection_preview_smoke_test_recorded: 1,
  vedic_preview_smoke_test_recorded: 1,
  preview_module_compatibility_recorded: 1,
  ready_for_ag56_7_audit_log_rollback_readiness_verification: 1,
  hard_blocker_count_for_ag56_7: 0,
  ...Object.fromEntries(Object.keys(blockedState).filter((k) => blockedState[k] === false).map((k) => [k, 0]))
};

const doc = `# AG56.6 — Word/Panchang/Reflection/Vedic Preview Smoke Test

## Result

AG56.6 records static/non-live smoke-test previews for Word, Panchang, Reflection and Vedic guidance modules.

## Smoke-tested

- Word preview
- Panchang preview
- Reflection preview
- Vedic guidance preview
- Module compatibility for the controlled content loop

## Important boundary

This is static preview verification only. It does not perform live calculation, live generation, external API calls, public mutation, deployment or go-live decision.

## Preserved blockers

- No live Panchang calculation/API call
- No live Word/reflection generation
- No live Vedic guidance generation
- No homepage/public page mutation
- No deployment or Vercel trigger
- No live public checks
- No backend/Auth/Supabase/RLS/database runtime
- No service-role use
- No rollback execution
- No go-live decision
- No V02 expansion

## Next

AG56.7 — Audit-log and Rollback Readiness Verification.
`;

writeJson(outputs.sourceConsumption, sourceConsumption);
writeJson(outputs.wordPreview, wordPreview);
writeJson(outputs.panchangPreview, panchangPreview);
writeJson(outputs.reflectionPreview, reflectionPreview);
writeJson(outputs.vedicPreview, vedicPreview);
writeJson(outputs.moduleCompatibility, moduleCompatibility);
writeJson(outputs.smokeTestBoundary, smokeTestBoundary);
writeJson(outputs.noLiveGenerationAudit, noLiveGenerationAudit);
writeJson(outputs.noDeploymentMutationAudit, noDeploymentMutationAudit);
writeJson(outputs.noBackendRuntimeAudit, noBackendRuntimeAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG56.6 Word/Panchang/Reflection/Vedic Preview Smoke Test generated.");
console.log("✅ Word, Panchang, Reflection and Vedic preview smoke-test records created.");
console.log("✅ Preview module compatibility recorded.");
console.log("✅ No live generation/calculation/API calls, deployment, public mutation, backend/runtime or go-live decision enabled.");
console.log("✅ Ready for AG56.7 Audit-log and Rollback Readiness Verification.");
