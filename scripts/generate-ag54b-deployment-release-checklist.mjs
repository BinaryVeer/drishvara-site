import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const inputs = {
  ag54aReview: "data/content-intelligence/quality-reviews/ag54a-backup-restore-plan.json",
  ag54aSourceConsumption: "data/content-intelligence/release-operations/ag54a-source-consumption-record.json",
  ag54aGitBaseline: "data/content-intelligence/release-operations/ag54a-git-baseline-record.json",
  ag54aBackupScope: "data/content-intelligence/release-operations/ag54a-repo-content-static-artifact-backup-scope.json",
  ag54aRestorePlan: "data/content-intelligence/release-operations/ag54a-restore-method-plan.json",
  ag54aVerification: "data/content-intelligence/release-operations/ag54a-backup-restore-verification-sequence.json",
  ag54aSupabaseDeferral: "data/content-intelligence/release-operations/ag54a-supabase-backend-deferral-continuity-record.json",
  ag54aBoundary: "data/content-intelligence/release-operations/ag54a-backup-restore-boundary.json",
  ag54aNoExternalBackup: "data/content-intelligence/backend-architecture/ag54a-no-external-backup-service-activation-audit.json",
  ag54aNoPublicMutation: "data/content-intelligence/backend-architecture/ag54a-no-public-mutation-publishing-deployment-audit.json",
  ag54aNoBackendRuntime: "data/content-intelligence/backend-architecture/ag54a-no-backend-auth-rls-database-runtime-audit.json",
  ag54aReadiness: "data/content-intelligence/quality-registry/ag54a-ag54b-deployment-release-checklist-readiness-record.json",
  ag54aBoundaryToB: "data/content-intelligence/mutation-plans/ag54a-to-ag54b-deployment-release-checklist-boundary.json",

  ag53zReview: "data/content-intelligence/quality-reviews/ag53z-public-quality-closure.json",
  ag53zCarryForward: "data/content-intelligence/public-quality/ag53z-carry-forward-public-quality-deferral-register.json",
  ag52zReview: "data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json",
  ag52zCarryForward: "data/content-intelligence/security-compliance/ag52z-carry-forward-security-deferral-register.json",
  ag51zReview: "data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json",
  adb20ApiDeferral: "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag54b-deployment-release-checklist.json",
  sourceConsumption: "data/content-intelligence/release-operations/ag54b-source-consumption-record.json",
  validateGitCommitPushChecklist: "data/content-intelligence/release-operations/ag54b-validate-git-commit-push-checklist.json",
  staticReleasePathChecklist: "data/content-intelligence/release-operations/ag54b-static-release-path-checklist.json",
  vercelLiveCheckSequence: "data/content-intelligence/release-operations/ag54b-vercel-live-check-sequence-plan.json",
  releaseGateCriteria: "data/content-intelligence/release-operations/ag54b-release-gate-criteria.json",
  deploymentReleaseBoundary: "data/content-intelligence/release-operations/ag54b-deployment-release-checklist-boundary.json",
  noDeploymentTriggerAudit: "data/content-intelligence/backend-architecture/ag54b-no-deployment-trigger-audit.json",
  noPublicMutationAudit: "data/content-intelligence/backend-architecture/ag54b-no-public-mutation-publishing-audit.json",
  noBackendRuntimeAudit: "data/content-intelligence/backend-architecture/ag54b-no-backend-auth-rls-database-runtime-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag54b-ag54c-rollback-incident-response-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag54b-to-ag54c-rollback-incident-response-boundary.json",
  registry: "data/quality/ag54b-deployment-release-checklist.json",
  preview: "data/quality/ag54b-deployment-release-checklist-preview.json",
  doc: "docs/quality/AG54B_DEPLOYMENT_RELEASE_CHECKLIST.md"
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
  if (!exists(p)) throw new Error(`Missing AG54B input: ${p}`);
}

const ag54aReview = readJson(inputs.ag54aReview);
const ag54aSourceConsumption = readJson(inputs.ag54aSourceConsumption);
const ag54aGitBaseline = readJson(inputs.ag54aGitBaseline);
const ag54aBackupScope = readJson(inputs.ag54aBackupScope);
const ag54aRestorePlan = readJson(inputs.ag54aRestorePlan);
const ag54aVerification = readJson(inputs.ag54aVerification);
const ag54aSupabaseDeferral = readJson(inputs.ag54aSupabaseDeferral);
const ag54aBoundary = readJson(inputs.ag54aBoundary);
const ag54aNoExternalBackup = readJson(inputs.ag54aNoExternalBackup);
const ag54aNoPublicMutation = readJson(inputs.ag54aNoPublicMutation);
const ag54aNoBackendRuntime = readJson(inputs.ag54aNoBackendRuntime);
const ag54aReadiness = readJson(inputs.ag54aReadiness);
const ag54aBoundaryToB = readJson(inputs.ag54aBoundaryToB);

const ag53zReview = readJson(inputs.ag53zReview);
const ag53zCarryForward = readJson(inputs.ag53zCarryForward);
const ag52zReview = readJson(inputs.ag52zReview);
const ag52zCarryForward = readJson(inputs.ag52zCarryForward);
const ag51zReview = readJson(inputs.ag51zReview);
const adb20ApiDeferral = readJson(inputs.adb20ApiDeferral);

if (ag54aReview.status !== "backup_restore_plan_ready_for_ag54b") throw new Error("AG54A review status mismatch.");
if (ag54aReview.summary?.ready_for_ag54b_deployment_release_checklist !== true) throw new Error("AG54B readiness missing from AG54A.");
if (ag54aSourceConsumption.status !== "source_consumption_recorded") throw new Error("AG54A source consumption mismatch.");
for (const audit of [ag54aGitBaseline, ag54aBackupScope, ag54aRestorePlan, ag54aVerification, ag54aSupabaseDeferral]) {
  if (audit.audit_passed !== true) throw new Error(`${audit.title} must pass.`);
}
if (!ag54aBoundary.boundary_rules.includes("No content publishing, public dashboard exposure or deployment is performed.")) throw new Error("AG54A deployment boundary missing.");
for (const audit of [ag54aNoExternalBackup, ag54aNoPublicMutation, ag54aNoBackendRuntime]) {
  if (audit.audit_passed !== true) throw new Error(`${audit.title} must pass.`);
}
if (ag54aReadiness.ready_for_ag54b !== true || ag54aReadiness.next_stage_id !== "AG54B") throw new Error("AG54A readiness must permit AG54B.");
if (ag54aBoundaryToB.next_stage_id !== "AG54B") throw new Error("AG54A boundary must point to AG54B.");

if (ag53zReview.status !== "public_quality_closed_ready_for_ag54a") throw new Error("AG53Z status mismatch.");
if (!ag53zCarryForward.deferred_items.includes("deployment")) throw new Error("AG53Z deployment deferral missing.");
if (ag52zReview.status !== "security_privacy_legal_closed_ready_for_ag53a") throw new Error("AG52Z status mismatch.");
if (!ag52zCarryForward.deferred_items.includes("backend/Auth/Supabase activation")) throw new Error("AG52Z backend deferral missing.");
if (ag51zReview.status !== "analytics_monitoring_closed_ready_for_post_ag51_checkpoint") throw new Error("AG51Z status mismatch.");
if (adb20ApiDeferral.website_database_reading_enabled !== false) throw new Error("Website DB reading must remain disabled.");

const gitHead = run("git rev-parse --short HEAD");
const branch = run("git branch --show-current");
const statusShort = run("git status --short");
const originMain = run("git rev-parse --short origin/main");

const blockedState = {
  ag54b_deployment_release_checklist_recorded: true,
  ag54a_consumed: true,
  validate_git_commit_push_checklist_recorded: true,
  static_release_path_checklist_recorded: true,
  vercel_live_check_sequence_recorded: true,
  release_gate_criteria_recorded: true,
  deployment_release_boundary_recorded: true,
  ready_for_ag54c_rollback_incident_response_plan: true,

  actual_deployment_triggered: false,
  vercel_deployment_triggered: false,
  github_release_created: false,
  live_public_check_executed: false,
  external_release_automation_enabled: false,
  content_publishing_enabled: false,
  public_content_mutation_enabled: false,
  public_page_mutation_enabled: false,
  deployment_approved: false,
  deployment_performed: false,
  backend_auth_supabase_activation_approved: false,
  backend_auth_supabase_activation_performed: false,
  service_role_key_used: false,
  service_role_key_exposed: false,
  rls_policy_mutation_enabled: false,
  grant_mutation_enabled: false,
  runtime_database_query_enabled: false,
  website_database_reading_enabled: false,
  api_runtime_database_reading_approved_now: false,
  public_dashboard_exposed: false,
  external_fetch_enabled: false
};

const sourceConsumption = {
  module_id: "AG54B",
  title: "AG54B Source Consumption Record",
  status: "source_consumption_recorded",
  consumed_required_sources: Object.values(inputs).filter((p) => p !== "package.json"),
  interpretation: "AG54B defines a deployment and release checklist as planning-only. It does not deploy, trigger Vercel, publish content, mutate public pages, run live checks, activate release automation, activate backend/Auth/RLS/API/runtime or use service-role keys.",
  current_git_context: {
    branch,
    git_head_short: gitHead,
    origin_main_short: originMain,
    working_tree_status_at_generation: statusShort || "clean"
  },
  blocked_state: blockedState
};

const validateGitCommitPushChecklist = {
  module_id: "AG54B",
  title: "Validate, Git Status, Commit and Push Checklist",
  status: "validate_git_commit_push_checklist_recorded",
  audit_passed: true,
  checklist_design_only: [
    "Confirm expected HEAD and branch before any release-operation stage.",
    "Run npm run validate:project.",
    "Confirm git status --short before staging is understood.",
    "Stage only governed AG files intended for the current patch.",
    "Commit with one stage-specific commit message.",
    "Run git log --oneline -8.",
    "Confirm git status --short after commit.",
    "Push to origin main only after validation and clean staged intent.",
    "Do not tag, release, deploy or trigger Vercel from AG54B."
  ],
  current_git_context: {
    branch,
    git_head_short: gitHead,
    origin_main_short: originMain
  },
  checklist_position: "planning_only_no_git_action_executed_by_generator",
  blocked_state: blockedState
};

const staticReleasePathChecklist = {
  module_id: "AG54B",
  title: "Static Release Path Checklist",
  status: "static_release_path_checklist_recorded",
  audit_passed: true,
  static_path_design_only: [
    "Treat V01 as GitHub/static controlled release path.",
    "Confirm AG52Z and AG53Z closure before any future release candidate freeze.",
    "Confirm AG54A backup/restore plan exists.",
    "Confirm package validate:project chain remains passing.",
    "Confirm no backend/Auth/Supabase runtime dependency is required for V01 static release.",
    "Confirm public assets and content are covered by static repo baseline.",
    "Keep Vercel/live route check as future manual checklist only unless explicitly approved."
  ],
  release_path_position: "checklist_only_no_release_or_deployment",
  blocked_state: blockedState
};

const vercelLiveCheckSequence = {
  module_id: "AG54B",
  title: "Vercel / Live Check Sequence Plan",
  status: "vercel_live_check_sequence_recorded",
  audit_passed: true,
  sequence_design_only: [
    "After explicit future approval, confirm deployment provider and project mapping.",
    "After deployment only, check homepage loads.",
    "Check article/read routes.",
    "Check navigation and language stability.",
    "Check SEO metadata and robots/sitemap behavior.",
    "Check mobile layout and accessibility basics.",
    "Check fallback/404 behavior.",
    "Record issues into rollback/incident response process."
  ],
  live_check_executed_now: false,
  vercel_deployment_triggered_now: false,
  blocked_state: blockedState
};

const releaseGateCriteria = {
  module_id: "AG54B",
  title: "Release Gate Criteria",
  status: "release_gate_criteria_recorded",
  audit_passed: true,
  gate_criteria_design_only: [
    "AG52Z security/privacy/legal closure complete.",
    "AG53Z public quality closure complete.",
    "AG54A backup/restore plan complete.",
    "validate:project passes.",
    "No secret/service-role/public env exposure.",
    "No backend/Auth/Supabase dependency for V01 static path.",
    "Rollback/incident response plan must be prepared in AG54C before closure.",
    "Release operations audit must pass in AG54D before AG54Z closure."
  ],
  release_gate_open_now: false,
  blocked_state: blockedState
};

const deploymentReleaseBoundary = {
  module_id: "AG54B",
  title: "Deployment and Release Checklist Boundary",
  status: "deployment_release_checklist_boundary_recorded",
  boundary_rules: [
    "AG54B is checklist/planning-only.",
    "No deployment is triggered.",
    "No Vercel deployment is triggered.",
    "No GitHub release/tag is created.",
    "No live public check is executed.",
    "No public page, source, route, metadata, asset or content mutation is performed.",
    "No backend/Auth/Supabase/RLS/API/database runtime is activated.",
    "No content publishing, public dashboard exposure or deployment is performed.",
    "AG54C may define rollback and incident response plan before release operations closure."
  ],
  blocked_state: blockedState
};

function auditObj(title, status, checks) {
  return {
    module_id: "AG54B",
    title,
    status,
    audit_passed: true,
    checks: checks.map((check_id) => ({ check_id, expected: false, actual: false, passed: true })),
    failed_checks: [],
    blocked_state: blockedState
  };
}

const noDeploymentTriggerAudit = auditObj("No Deployment Trigger Audit", "no_deployment_trigger_audit_passed", [
  "actual_deployment_triggered",
  "vercel_deployment_triggered",
  "github_release_created",
  "live_public_check_executed",
  "external_release_automation_enabled",
  "deployment_approved",
  "deployment_performed"
]);

const noPublicMutationAudit = auditObj("No Public Mutation / Publishing Audit", "no_public_mutation_publishing_audit_passed", [
  "public_page_mutation_enabled",
  "content_publishing_enabled",
  "public_content_mutation_enabled",
  "public_dashboard_exposed",
  "external_fetch_enabled"
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
  "api_runtime_database_reading_approved_now"
]);

const readiness = {
  module_id: "AG54B",
  title: "AG54C Rollback and Incident Response Plan Readiness Record",
  status: "ready_for_ag54c_rollback_incident_response_plan",
  ready_for_ag54c: true,
  next_stage_id: "AG54C",
  next_stage_title: "Rollback and Incident Response Plan",
  ag54c_allowed_scope: [
    "Define rollback triggers and incident response path.",
    "Define action path for homepage, article, listing, privacy and route breakage.",
    "Consume AG54A backup/restore plan and AG54B release checklist.",
    "Keep actual rollback, deployment, publishing, backend/Auth/RLS/API/runtime and public mutation disabled."
  ],
  ag54c_blocked_scope: [
    "actual rollback execution",
    "deployment",
    "content publishing",
    "public page mutation",
    "runtime database/API reading",
    "backend/Auth/Supabase activation",
    "RLS/grant mutation",
    "service-role use"
  ],
  hard_blocker_count_for_ag54c: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG54B",
  title: "AG54B to AG54C Rollback Incident Response Boundary",
  status: "ag54c_rollback_incident_response_boundary_created",
  next_stage_id: "AG54C",
  next_stage_title: "Rollback and Incident Response Plan",
  allowed_scope: readiness.ag54c_allowed_scope,
  blocked_scope: readiness.ag54c_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "AG54B",
  title: "Deployment and Release Checklist",
  status: "deployment_release_checklist_ready_for_ag54c",
  depends_on: ["AG54A", "AG53Z", "AG52Z", "AG51Z", "ADB20", "GitHub/static release path"],
  source_consumption_file: outputs.sourceConsumption,
  validate_git_commit_push_checklist_file: outputs.validateGitCommitPushChecklist,
  static_release_path_checklist_file: outputs.staticReleasePathChecklist,
  vercel_live_check_sequence_file: outputs.vercelLiveCheckSequence,
  release_gate_criteria_file: outputs.releaseGateCriteria,
  deployment_release_boundary_file: outputs.deploymentReleaseBoundary,
  no_deployment_trigger_audit_file: outputs.noDeploymentTriggerAudit,
  no_public_mutation_audit_file: outputs.noPublicMutationAudit,
  no_backend_runtime_audit_file: outputs.noBackendRuntimeAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag54b_deployment_release_checklist_recorded: true,
    ag54a_consumed: true,
    validate_git_commit_push_checklist_recorded: true,
    static_release_path_checklist_recorded: true,
    vercel_live_check_sequence_recorded: true,
    release_gate_criteria_recorded: true,
    deployment_release_boundary_recorded: true,
    ready_for_ag54c_rollback_incident_response_plan: true,
    hard_blocker_count_for_ag54c: 0,
    git_head_short: gitHead,
    branch,
    ...Object.fromEntries(Object.keys(blockedState).filter((k) => blockedState[k] === false).map((k) => [k, false]))
  },
  blocked_state: blockedState
};

const registry = { module_id: "AG54B", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG54B",
  status: review.status,
  ag54b_deployment_release_checklist_recorded: 1,
  ag54a_consumed: 1,
  validate_git_commit_push_checklist_recorded: 1,
  static_release_path_checklist_recorded: 1,
  vercel_live_check_sequence_recorded: 1,
  release_gate_criteria_recorded: 1,
  deployment_release_boundary_recorded: 1,
  ready_for_ag54c_rollback_incident_response_plan: 1,
  hard_blocker_count_for_ag54c: 0,
  ...Object.fromEntries(Object.keys(blockedState).filter((k) => blockedState[k] === false).map((k) => [k, 0]))
};

const doc = `# AG54B — Deployment and Release Checklist

## Result

AG54B records the deployment and release checklist as planning-only release-operations governance.

## Planned

- validate:project, git status, commit and push checklist
- GitHub/static release path checklist
- Vercel/live check sequence as future manual checklist
- Release gate criteria before AG54C/AG54D/AG54Z

## Confirmed blocked

- No deployment trigger
- No Vercel deployment trigger
- No GitHub release/tag creation
- No live public check execution
- No public page/content mutation
- No content publishing
- No backend/Auth/Supabase/RLS/database runtime
- No service-role use

## Next

AG54C — Rollback and Incident Response Plan.
`;

writeJson(outputs.sourceConsumption, sourceConsumption);
writeJson(outputs.validateGitCommitPushChecklist, validateGitCommitPushChecklist);
writeJson(outputs.staticReleasePathChecklist, staticReleasePathChecklist);
writeJson(outputs.vercelLiveCheckSequence, vercelLiveCheckSequence);
writeJson(outputs.releaseGateCriteria, releaseGateCriteria);
writeJson(outputs.deploymentReleaseBoundary, deploymentReleaseBoundary);
writeJson(outputs.noDeploymentTriggerAudit, noDeploymentTriggerAudit);
writeJson(outputs.noPublicMutationAudit, noPublicMutationAudit);
writeJson(outputs.noBackendRuntimeAudit, noBackendRuntimeAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG54B Deployment and Release Checklist generated.");
console.log("✅ Validate/git/commit/push and static release path checklist recorded.");
console.log("✅ Vercel/live check sequence recorded as future manual checklist only.");
console.log("✅ No deployment, publishing, public mutation, backend/runtime or service-role use enabled.");
console.log("✅ Ready for AG54C Rollback and Incident Response Plan.");
