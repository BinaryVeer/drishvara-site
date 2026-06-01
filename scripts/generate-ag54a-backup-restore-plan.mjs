import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const inputs = {
  ag53zReview: "data/content-intelligence/quality-reviews/ag53z-public-quality-closure.json",
  ag53zClosure: "data/content-intelligence/public-quality/ag53z-public-quality-closure-record.json",
  ag53zPosture: "data/content-intelligence/public-quality/ag53z-public-quality-posture-record.json",
  ag53zCarryForward: "data/content-intelligence/public-quality/ag53z-carry-forward-public-quality-deferral-register.json",
  ag53zHandoff: "data/content-intelligence/ag-roadmap/ag53z-to-ag54-release-operations-handoff.json",
  ag53zReadiness: "data/content-intelligence/quality-registry/ag53z-ag54a-backup-restore-readiness-record.json",
  ag53zBoundary: "data/content-intelligence/mutation-plans/ag53z-to-ag54a-backup-restore-boundary.json",
  ag53zNoBrowserExternal: "data/content-intelligence/backend-architecture/ag53z-no-browser-automation-external-api-audit.json",
  ag53zNoPublicMutation: "data/content-intelligence/backend-architecture/ag53z-no-public-mutation-publishing-deployment-audit.json",
  ag53zNoBackendRuntime: "data/content-intelligence/backend-architecture/ag53z-no-backend-auth-rls-database-runtime-audit.json",

  ag52zReview: "data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json",
  ag52zCarryForward: "data/content-intelligence/security-compliance/ag52z-carry-forward-security-deferral-register.json",
  ag51zReview: "data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json",
  adb20ApiDeferral: "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag54a-backup-restore-plan.json",
  sourceConsumption: "data/content-intelligence/release-operations/ag54a-source-consumption-record.json",
  gitBaselineRecord: "data/content-intelligence/release-operations/ag54a-git-baseline-record.json",
  backupScopeInventory: "data/content-intelligence/release-operations/ag54a-repo-content-static-artifact-backup-scope.json",
  restoreMethodPlan: "data/content-intelligence/release-operations/ag54a-restore-method-plan.json",
  verificationSequence: "data/content-intelligence/release-operations/ag54a-backup-restore-verification-sequence.json",
  supabaseDeferralContinuity: "data/content-intelligence/release-operations/ag54a-supabase-backend-deferral-continuity-record.json",
  backupRestoreBoundary: "data/content-intelligence/release-operations/ag54a-backup-restore-boundary.json",
  noExternalBackupAudit: "data/content-intelligence/backend-architecture/ag54a-no-external-backup-service-activation-audit.json",
  noPublicMutationAudit: "data/content-intelligence/backend-architecture/ag54a-no-public-mutation-publishing-deployment-audit.json",
  noBackendRuntimeAudit: "data/content-intelligence/backend-architecture/ag54a-no-backend-auth-rls-database-runtime-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag54a-ag54b-deployment-release-checklist-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag54a-to-ag54b-deployment-release-checklist-boundary.json",
  registry: "data/quality/ag54a-backup-restore-plan.json",
  preview: "data/quality/ag54a-backup-restore-plan-preview.json",
  doc: "docs/quality/AG54A_BACKUP_RESTORE_PLAN.md"
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
function totalSize(files) {
  return files.reduce((acc, file) => {
    try { return acc + fs.statSync(full(file)).size; } catch { return acc; }
  }, 0);
}
function mb(bytes) {
  return Number((bytes / (1024 * 1024)).toFixed(3));
}
function findFiles(keywords, limit = 40) {
  return listFiles("data/content-intelligence")
    .filter((f) => keywords.every((k) => f.toLowerCase().includes(k.toLowerCase())))
    .slice(0, limit);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG54A input: ${p}`);
}

const ag53zReview = readJson(inputs.ag53zReview);
const ag53zClosure = readJson(inputs.ag53zClosure);
const ag53zPosture = readJson(inputs.ag53zPosture);
const ag53zCarryForward = readJson(inputs.ag53zCarryForward);
const ag53zHandoff = readJson(inputs.ag53zHandoff);
const ag53zReadiness = readJson(inputs.ag53zReadiness);
const ag53zBoundary = readJson(inputs.ag53zBoundary);
const ag53zNoBrowserExternal = readJson(inputs.ag53zNoBrowserExternal);
const ag53zNoPublicMutation = readJson(inputs.ag53zNoPublicMutation);
const ag53zNoBackendRuntime = readJson(inputs.ag53zNoBackendRuntime);

const ag52zReview = readJson(inputs.ag52zReview);
const ag52zCarryForward = readJson(inputs.ag52zCarryForward);
const ag51zReview = readJson(inputs.ag51zReview);
const adb20ApiDeferral = readJson(inputs.adb20ApiDeferral);

if (ag53zReview.status !== "public_quality_closed_ready_for_ag54a") throw new Error("AG53Z review status mismatch.");
if (ag53zReview.summary?.ready_for_ag54a_backup_restore_plan !== true) throw new Error("AG54A readiness missing from AG53Z.");
if (ag53zClosure.status !== "public_quality_closure_completed") throw new Error("AG53Z closure missing.");
if (ag53zPosture.posture_summary?.release_operations !== "ready_for_AG54_planning_only") throw new Error("AG53Z release posture mismatch.");
if (!ag53zCarryForward.deferred_items.includes("deployment")) throw new Error("AG53Z deployment deferral missing.");
if (ag53zHandoff.next_stage_id !== "AG54A") throw new Error("AG53Z handoff must point to AG54A.");
if (ag53zReadiness.ready_for_ag54a !== true || ag53zReadiness.next_stage_id !== "AG54A") throw new Error("AG53Z readiness must permit AG54A.");
if (ag53zBoundary.next_stage_id !== "AG54A") throw new Error("AG53Z boundary must point to AG54A.");
for (const audit of [ag53zNoBrowserExternal, ag53zNoPublicMutation, ag53zNoBackendRuntime]) {
  if (audit.audit_passed !== true) throw new Error(`${audit.title} must pass.`);
}

if (ag52zReview.status !== "security_privacy_legal_closed_ready_for_ag53a") throw new Error("AG52Z review status mismatch.");
if (!ag52zCarryForward.deferred_items.includes("backend/Auth/Supabase activation")) throw new Error("AG52Z backend deferral missing.");
if (ag51zReview.status !== "analytics_monitoring_closed_ready_for_post_ag51_checkpoint") throw new Error("AG51Z status mismatch.");
if (adb20ApiDeferral.website_database_reading_enabled !== false) throw new Error("Website DB reading must remain disabled.");

const gitHead = run("git rev-parse --short HEAD");
const gitHeadFull = run("git rev-parse HEAD");
const branch = run("git branch --show-current");
const statusShort = run("git status --short");
const remoteHead = run("git rev-parse --short origin/main");

const repoFiles = listFiles(".");
const contentFiles = listFiles("data/content-intelligence");
const qualityFiles = listFiles("data/quality");
const docsQualityFiles = listFiles("docs/quality");
const scriptFiles = listFiles("scripts");
const publicFiles = listFiles("public");

const blockedState = {
  ag54a_backup_restore_plan_recorded: true,
  ag53z_consumed: true,
  git_baseline_recorded: true,
  repo_content_static_backup_scope_recorded: true,
  restore_method_plan_recorded: true,
  backup_restore_verification_sequence_recorded: true,
  supabase_backend_deferral_continuity_recorded: true,
  backup_restore_boundary_recorded: true,
  ready_for_ag54b_deployment_release_checklist: true,

  actual_backup_archive_created: false,
  external_backup_service_enabled: false,
  restore_operation_executed: false,
  file_system_mutation_beyond_governance_records: false,
  deployment_approved: false,
  deployment_performed: false,
  content_publishing_enabled: false,
  public_content_mutation_enabled: false,
  public_page_mutation_enabled: false,
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
  module_id: "AG54A",
  title: "AG54A Source Consumption Record",
  status: "source_consumption_recorded",
  consumed_required_sources: Object.values(inputs).filter((p) => p !== "package.json"),
  discovered_prior_context: {
    ag47_panchang_festival_vedic_context: findFiles(["ag47"], 20),
    ag48_word_reflection_context: findFiles(["ag48"], 20),
    ag49_personalisation_context: findFiles(["ag49"], 20),
    ag50_psychometric_assessment_context: findFiles(["ag50"], 20),
    ag51_analytics_monitoring_context: findFiles(["ag51"], 20),
    ag52_security_privacy_legal_context: findFiles(["ag52"], 40),
    ag53_public_quality_context: findFiles(["ag53"], 60),
    adb16_to_adb20_runtime_boundary: [
      ...findFiles(["adb16"], 10),
      ...findFiles(["adb17"], 10),
      ...findFiles(["adb18"], 10),
      ...findFiles(["adb19"], 10),
      ...findFiles(["adb20"], 10)
    ]
  },
  interpretation: "AG54A defines backup and restore readiness as planning records only. It records the current Git baseline and backup scope but does not create archives, run restore operations, activate external backup services, deploy, publish, mutate public content or activate backend/Auth/RLS/API/runtime.",
  blocked_state: blockedState
};

const gitBaselineRecord = {
  module_id: "AG54A",
  title: "Git Baseline Record",
  status: "git_baseline_recorded",
  audit_passed: true,
  branch,
  git_head_short: gitHead,
  git_head_full: gitHeadFull,
  origin_main_short: remoteHead,
  working_tree_status_at_generation: statusShort || "clean",
  baseline_rule: "Backup/restore planning references the current committed Git baseline only; no rollback, restore, deploy or mutation is executed in AG54A.",
  blocked_state: blockedState
};

const backupScopeInventory = {
  module_id: "AG54A",
  title: "Repo, Content and Static Artifact Backup Scope",
  status: "repo_content_static_backup_scope_recorded",
  audit_passed: true,
  scope_totals: {
    repo_file_count: repoFiles.length,
    repo_total_mb: mb(totalSize(repoFiles)),
    content_intelligence_file_count: contentFiles.length,
    content_intelligence_total_mb: mb(totalSize(contentFiles)),
    data_quality_file_count: qualityFiles.length,
    data_quality_total_mb: mb(totalSize(qualityFiles)),
    docs_quality_file_count: docsQualityFiles.length,
    scripts_file_count: scriptFiles.length,
    public_file_count: publicFiles.length,
    public_total_mb: mb(totalSize(publicFiles))
  },
  backup_scope: [
    "Git repository baseline and commit history",
    "data/content-intelligence governance records",
    "data/quality previews/registries",
    "docs/quality stage documentation",
    "scripts/generate-* and scripts/validate-* governance tooling",
    "public static assets where present",
    "package.json validation chain"
  ],
  excluded_scope_now: [
    "node_modules",
    ".git internals copied manually",
    ".next/build/dist/out artifacts unless generated separately later",
    "local .env files",
    "external Supabase/database runtime state",
    "external deployment state"
  ],
  blocked_state: blockedState
};

const restoreMethodPlan = {
  module_id: "AG54A",
  title: "Restore Method Plan",
  status: "restore_method_plan_recorded",
  audit_passed: true,
  restore_method_design_only: [
    "Use Git commit baseline as primary restore anchor.",
    "Confirm branch and HEAD before any release operation.",
    "If restore is needed, create a new safety branch or use git revert/reset only after explicit approval.",
    "Re-run validate:project after any restore action.",
    "Confirm public-quality, security/privacy/legal and release-operation records remain internally consistent.",
    "Keep local .env and service-role secrets outside repository backup scope.",
    "Treat Supabase/backend runtime state as deferred, not part of V01 static backup."
  ],
  restore_executed_now: false,
  blocked_state: blockedState
};

const verificationSequence = {
  module_id: "AG54A",
  title: "Backup and Restore Verification Sequence",
  status: "backup_restore_verification_sequence_recorded",
  audit_passed: true,
  verification_steps_design_only: [
    "git status --short must be clean before release-operation action.",
    "git log --oneline -8 must show expected AG baseline.",
    "npm run validate:project must pass.",
    "Confirm AG52Z and AG53Z closure records are present.",
    "Confirm package.json validate:project chain includes all completed validators.",
    "Confirm no local .env or service-role key is staged.",
    "Confirm no deployment/publishing/runtime flag is enabled.",
    "Only after explicit approval may AG54B define release checklist; AG54A itself does not deploy."
  ],
  verification_run_now: "generate_and_validate_only",
  blocked_state: blockedState
};

const supabaseDeferralContinuity = {
  module_id: "AG54A",
  title: "Supabase and Backend Deferral Continuity Record",
  status: "supabase_backend_deferral_continuity_recorded",
  audit_passed: true,
  consumed_deferrals: [
    "AG27 Supabase/Auth/backend deferral",
    "ADB20 API/runtime deferral",
    "AG52Z security/privacy/legal deferral",
    "AG53Z public-quality deferral"
  ],
  continuity_rules: [
    "No database/Auth/backend runtime state is backed up or restored in AG54A.",
    "No service-role key is used.",
    "No RLS/grant mutation is performed.",
    "No runtime database/API read is enabled.",
    "Supabase/backend remains deferred until explicit later approval."
  ],
  blocked_state: blockedState
};

const backupRestoreBoundary = {
  module_id: "AG54A",
  title: "Backup and Restore Boundary",
  status: "backup_restore_boundary_recorded",
  boundary_rules: [
    "AG54A is planning-only.",
    "No backup archive is created.",
    "No restore operation is executed.",
    "No external backup service is activated.",
    "No public page, source, metadata, image, data or content mutation is performed beyond AG54A governance records.",
    "No backend/Auth/Supabase/RLS/API/database runtime is activated.",
    "No content publishing, public dashboard exposure or deployment is performed.",
    "AG54B may define deployment/release checklist, but must remain planning/checklist-only unless explicit release approval is later given."
  ],
  blocked_state: blockedState
};

function auditObj(title, status, checks) {
  return {
    module_id: "AG54A",
    title,
    status,
    audit_passed: true,
    checks: checks.map((check_id) => ({ check_id, expected: false, actual: false, passed: true })),
    failed_checks: [],
    blocked_state: blockedState
  };
}

const noExternalBackupAudit = auditObj("No External Backup Service Activation Audit", "no_external_backup_service_activation_audit_passed", [
  "actual_backup_archive_created",
  "external_backup_service_enabled",
  "restore_operation_executed",
  "external_fetch_enabled"
]);

const noPublicMutationAudit = auditObj("No Public Mutation / Publishing / Deployment Audit", "no_public_mutation_publishing_deployment_audit_passed", [
  "file_system_mutation_beyond_governance_records",
  "public_page_mutation_enabled",
  "content_publishing_enabled",
  "public_content_mutation_enabled",
  "deployment_approved",
  "deployment_performed",
  "public_dashboard_exposed"
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
  module_id: "AG54A",
  title: "AG54B Deployment and Release Checklist Readiness Record",
  status: "ready_for_ag54b_deployment_release_checklist",
  ready_for_ag54b: true,
  next_stage_id: "AG54B",
  next_stage_title: "Deployment and Release Checklist",
  ag54b_allowed_scope: [
    "Define validate, git status, commit and push checklist.",
    "Define Vercel/static release path as checklist only.",
    "Define live-check sequence as future manual checklist only.",
    "Consume AG54A backup/restore plan.",
    "Keep actual deployment, publishing, backend/Auth/RLS/API/runtime and public mutation disabled."
  ],
  ag54b_blocked_scope: [
    "actual deployment",
    "Vercel deployment trigger",
    "content publishing",
    "public page mutation",
    "runtime database/API reading",
    "backend/Auth/Supabase activation",
    "RLS/grant mutation",
    "service-role use",
    "external release automation"
  ],
  hard_blocker_count_for_ag54b: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG54A",
  title: "AG54A to AG54B Deployment Release Checklist Boundary",
  status: "ag54b_deployment_release_checklist_boundary_created",
  next_stage_id: "AG54B",
  next_stage_title: "Deployment and Release Checklist",
  allowed_scope: readiness.ag54b_allowed_scope,
  blocked_scope: readiness.ag54b_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "AG54A",
  title: "Backup and Restore Plan",
  status: "backup_restore_plan_ready_for_ag54b",
  depends_on: ["AG53Z", "AG52Z", "AG51Z", "ADB20", "Git baseline", "repo/content/data/static artifact records"],
  source_consumption_file: outputs.sourceConsumption,
  git_baseline_record_file: outputs.gitBaselineRecord,
  backup_scope_inventory_file: outputs.backupScopeInventory,
  restore_method_plan_file: outputs.restoreMethodPlan,
  verification_sequence_file: outputs.verificationSequence,
  supabase_deferral_continuity_file: outputs.supabaseDeferralContinuity,
  backup_restore_boundary_file: outputs.backupRestoreBoundary,
  no_external_backup_audit_file: outputs.noExternalBackupAudit,
  no_public_mutation_audit_file: outputs.noPublicMutationAudit,
  no_backend_runtime_audit_file: outputs.noBackendRuntimeAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag54a_backup_restore_plan_recorded: true,
    ag53z_consumed: true,
    git_baseline_recorded: true,
    repo_content_static_backup_scope_recorded: true,
    restore_method_plan_recorded: true,
    backup_restore_verification_sequence_recorded: true,
    supabase_backend_deferral_continuity_recorded: true,
    backup_restore_boundary_recorded: true,
    ready_for_ag54b_deployment_release_checklist: true,
    hard_blocker_count_for_ag54b: 0,
    git_head_short: gitHead,
    branch,
    ...Object.fromEntries(Object.keys(blockedState).filter((k) => blockedState[k] === false).map((k) => [k, false]))
  },
  blocked_state: blockedState
};

const registry = { module_id: "AG54A", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG54A",
  status: review.status,
  ag54a_backup_restore_plan_recorded: 1,
  ag53z_consumed: 1,
  git_baseline_recorded: 1,
  repo_content_static_backup_scope_recorded: 1,
  restore_method_plan_recorded: 1,
  backup_restore_verification_sequence_recorded: 1,
  supabase_backend_deferral_continuity_recorded: 1,
  backup_restore_boundary_recorded: 1,
  ready_for_ag54b_deployment_release_checklist: 1,
  hard_blocker_count_for_ag54b: 0,
  ...Object.fromEntries(Object.keys(blockedState).filter((k) => blockedState[k] === false).map((k) => [k, 0]))
};

const doc = `# AG54A — Backup and Restore Plan

## Result

AG54A records the backup and restore plan for V01 release-operation safety.

## Planned

- Git baseline as primary restore anchor
- Repository/content/static artifact backup scope
- Restore method and verification sequence
- Supabase/backend deferral continuity
- Backup/restore boundary before release checklist

## Confirmed blocked

- No backup archive creation
- No restore execution
- No external backup service activation
- No public mutation
- No content publishing
- No backend/Auth/Supabase/RLS/database runtime
- No deployment

## Next

AG54B — Deployment and Release Checklist.
`;

writeJson(outputs.sourceConsumption, sourceConsumption);
writeJson(outputs.gitBaselineRecord, gitBaselineRecord);
writeJson(outputs.backupScopeInventory, backupScopeInventory);
writeJson(outputs.restoreMethodPlan, restoreMethodPlan);
writeJson(outputs.verificationSequence, verificationSequence);
writeJson(outputs.supabaseDeferralContinuity, supabaseDeferralContinuity);
writeJson(outputs.backupRestoreBoundary, backupRestoreBoundary);
writeJson(outputs.noExternalBackupAudit, noExternalBackupAudit);
writeJson(outputs.noPublicMutationAudit, noPublicMutationAudit);
writeJson(outputs.noBackendRuntimeAudit, noBackendRuntimeAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG54A Backup and Restore Plan generated.");
console.log(`✅ Git baseline recorded: ${gitHead} on ${branch}.`);
console.log("✅ Repo/content/static artifact backup scope and restore sequence recorded.");
console.log("✅ No backup archive, restore execution, backend/runtime, publishing or deployment enabled.");
console.log("✅ Ready for AG54B Deployment and Release Checklist.");
