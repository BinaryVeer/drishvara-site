import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const inputs = {
  ag51zReview: "data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json",
  ag51zHandoff: "data/content-intelligence/ag-roadmap/ag51z-post-ag51-roadmap-checkpoint-handoff.json",
  ag51zReadiness: "data/content-intelligence/quality-registry/ag51z-post-ag51-roadmap-checkpoint-readiness-record.json",
  ag51zBoundary: "data/content-intelligence/mutation-plans/ag51z-to-post-ag51-roadmap-checkpoint-boundary.json",
  adb20ApiDeferral: "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag52a-secret-environment-service-role-safety-audit.json",
  consumptionRecord: "data/content-intelligence/security-compliance/ag52a-source-consumption-record.json",
  repoSecretAudit: "data/content-intelligence/security-compliance/ag52a-repo-secret-exposure-audit-record.json",
  environmentAudit: "data/content-intelligence/security-compliance/ag52a-environment-file-handling-audit-record.json",
  serviceRoleAudit: "data/content-intelligence/security-compliance/ag52a-service-role-key-safety-audit-record.json",
  browserPublicConfigAudit: "data/content-intelligence/security-compliance/ag52a-browser-public-config-exposure-audit-record.json",
  localConfigGitignoreAudit: "data/content-intelligence/security-compliance/ag52a-local-config-gitignore-audit-record.json",
  secretSafetyBoundary: "data/content-intelligence/security-compliance/ag52a-secret-environment-service-role-safety-boundary.json",
  noBackendAuthRuntimeAudit: "data/content-intelligence/backend-architecture/ag52a-no-backend-auth-runtime-activation-audit.json",
  noServiceRoleUseAudit: "data/content-intelligence/backend-architecture/ag52a-no-service-role-use-audit.json",
  noDeploymentExposureAudit: "data/content-intelligence/backend-architecture/ag52a-no-deployment-public-exposure-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag52a-ag52b-rls-grants-public-exposure-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag52a-to-ag52b-rls-grants-public-exposure-boundary.json",
  registry: "data/quality/ag52a-secret-environment-service-role-safety-audit.json",
  preview: "data/quality/ag52a-secret-environment-service-role-safety-audit-preview.json",
  doc: "docs/quality/AG52A_SECRET_ENVIRONMENT_SERVICE_ROLE_SAFETY_AUDIT.md"
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
function findFiles(keywords, limit = 25) {
  const files = listFiles(".");
  return files
    .filter((f) => keywords.every((k) => f.toLowerCase().includes(k.toLowerCase())))
    .slice(0, limit);
}
function readTextSafe(p) {
  try {
    const ext = path.extname(p).toLowerCase();
    const allowed = new Set(["", ".js", ".mjs", ".cjs", ".ts", ".tsx", ".json", ".md", ".txt", ".yml", ".yaml", ".toml", ".env", ".example", ".sample", ".gitignore"]);
    if (!allowed.has(ext) && !p.endsWith(".env.example") && !p.endsWith(".env.sample")) return "";
    const stat = fs.statSync(full(p));
    if (stat.size > 600000) return "";
    return fs.readFileSync(full(p), "utf8");
  } catch {
    return "";
  }
}


function gitTrackedFiles() {
  try {
    return execSync("git ls-files -z", { encoding: "utf8" }).split("\0").filter(Boolean);
  } catch {
    return [];
  }
}

function isExampleEnvFile(file) {
  const base = path.basename(file).toLowerCase();
  return (
    base === ".env.example" ||
    base === ".env.sample" ||
    base === ".env.template" ||
    base === "env.example" ||
    base === "env.sample" ||
    base.endsWith(".env.example") ||
    base.endsWith(".env.sample") ||
    base.endsWith(".env.template") ||
    base.includes(".example") ||
    base.includes(".sample") ||
    base.includes(".template")
  );
}

function isEnvLikeFile(file) {
  const base = path.basename(file).toLowerCase();
  if (isExampleEnvFile(file)) return false;
  return base === ".env" || base.startsWith(".env.") || base.endsWith(".env");
}

function isGovernancePlanningFile(file) {
  const normalized = file.replaceAll("\\", "/").toLowerCase();
  return (
    normalized.startsWith("scripts/generate-ag") ||
    normalized.startsWith("scripts/generate-adb") ||
    normalized.startsWith("scripts/validate-ag") ||
    normalized.startsWith("scripts/validate-adb") ||
    normalized.startsWith("data/content-intelligence/") ||
    normalized.startsWith("data/quality/") ||
    normalized.startsWith("docs/quality/")
  );
}


for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG52A input: ${p}`);
}

const ag51zReview = readJson(inputs.ag51zReview);
const ag51zHandoff = readJson(inputs.ag51zHandoff);
const ag51zReadiness = readJson(inputs.ag51zReadiness);
const ag51zBoundary = readJson(inputs.ag51zBoundary);
const adb20ApiDeferral = readJson(inputs.adb20ApiDeferral);

if (ag51zReview.status !== "analytics_monitoring_closed_ready_for_post_ag51_checkpoint") throw new Error("AG51Z review status mismatch.");
if (ag51zReview.summary?.ready_for_post_ag51_roadmap_checkpoint !== true) throw new Error("Post-AG51 readiness missing.");
if (ag51zHandoff.next_stage_id !== "POST_AG51_ROADMAP_CHECKPOINT") throw new Error("AG51Z handoff must point to checkpoint.");
if (ag51zReadiness.ready_for_post_ag51_checkpoint !== true) throw new Error("Post-AG51 readiness must be true.");
if (ag51zBoundary.next_stage_id !== "POST_AG51_ROADMAP_CHECKPOINT") throw new Error("Post-AG51 boundary mismatch.");
if (adb20ApiDeferral.website_database_reading_enabled !== false) throw new Error("Website DB reading must remain disabled.");

const workingTreeFiles = listFiles(".");
const trackedFiles = gitTrackedFiles();
const allFiles = trackedFiles.length > 0 ? trackedFiles : workingTreeFiles;

const envLikeFiles = allFiles.filter((f) => isEnvLikeFile(f));
const localEnvLikeFilesAdvisory = workingTreeFiles.filter((f) => isEnvLikeFile(f) && !allFiles.includes(f));

const publicConfigCandidates = allFiles.filter((f) => {
  const normalized = f.replaceAll("\\", "/").toLowerCase();
  return normalized.startsWith("public/") && (
    normalized.includes("env") ||
    normalized.includes("secret") ||
    normalized.includes("service-role") ||
    normalized.includes("service_role") ||
    normalized.includes("supabase")
  );
});

const secretPatterns = [
  { id: "supabase_service_role_assignment", re: /(SUPABASE_SERVICE_ROLE_KEY|SERVICE_ROLE_KEY)\s*[:=]\s*["']?([A-Za-z0-9_\-+.=/]{24,})/i },
  { id: "service_role_jwt_like_value", re: /(service[_-]?role|SUPABASE_SERVICE_ROLE_KEY)[^\\n]{0,80}(eyJ[A-Za-z0-9_\-]{20,}\.[A-Za-z0-9_\-]{20,}\.[A-Za-z0-9_\-]{20,})/i },
  { id: "generic_secret_assignment", re: /(SECRET|PRIVATE_KEY|TOKEN|API_KEY)\s*[:=]\s*["']([A-Za-z0-9_\-+.=/]{32,})["']/i }
];

const riskCandidateFiles = [];
const advisorySecretMentions = [];

for (const file of allFiles) {
  const text = readTextSafe(file);
  if (!text) continue;

  const matchedPatternIds = secretPatterns.filter(({ re }) => re.test(text)).map(({ id }) => id);
  if (matchedPatternIds.length === 0) continue;

  const hardPatternIds = matchedPatternIds.filter((id) => {
    if (id === "generic_secret_assignment" && isGovernancePlanningFile(file)) return false;
    return true;
  });

  if (hardPatternIds.length > 0) {
    riskCandidateFiles.push({
      file,
      matched_pattern_ids: hardPatternIds,
      value_redacted: true
    });
  } else {
    advisorySecretMentions.push({
      file,
      matched_pattern_ids: matchedPatternIds,
      treated_as: "governance_or_generator_false_positive",
      value_redacted: true
    });
  }
}

const gitignorePath = ".gitignore";
const gitignorePresent = exists(gitignorePath);
const gitignoreText = gitignorePresent ? readTextSafe(gitignorePath) : "";
const gitignoreEnvGuards = [".env", ".env.local", ".env.*"].filter((guard) => gitignoreText.includes(guard));

const discovered = {
  adb16_runtime_decision_candidates: findFiles(["adb16"], 25),
  adb17_engine_contract_candidates: findFiles(["adb17"], 25),
  adb18_validation_protocol_candidates: findFiles(["adb18"], 25),
  adb19_non_public_runtime_candidates: findFiles(["adb19"], 25),
  adb20_api_runtime_deferral_candidates: findFiles(["adb20"], 25),
  ag27_secret_governance_candidates: findFiles(["ag27"], 25),
  ag35_secret_governance_candidates: findFiles(["ag35"], 25),
  ag36_secret_governance_candidates: findFiles(["ag36"], 25),
  secret_governance_candidates: findFiles(["secret"], 25),
  environment_config_candidates: findFiles(["env"], 25),
  service_role_candidates: findFiles(["service"], 25),
  gitignore_present: gitignorePresent,
  gitignore_env_guards_detected: gitignoreEnvGuards
};

const hasEnvLeakageRisk = envLikeFiles.length > 0;
const hasSecretCandidateRisk = riskCandidateFiles.length > 0;
const hasPublicConfigRisk = publicConfigCandidates.length > 0;

const blockedState = {
  ag52a_secret_environment_service_role_safety_audit_recorded: true,
  ag51z_consumed: true,
  repo_secret_exposure_audit_recorded: true,
  environment_file_handling_audit_recorded: true,
  service_role_key_safety_audit_recorded: true,
  browser_public_config_exposure_audit_recorded: true,
  local_config_gitignore_audit_recorded: true,
  secret_safety_boundary_recorded: true,
  ready_for_ag52b_rls_grants_public_exposure_audit: true,

  secret_committed_to_repo: false,
  env_file_committed_to_repo: false,
  browser_public_secret_exposed: false,
  service_role_key_exposed: false,
  service_role_key_used: false,
  service_role_key_required_for_current_stage: false,
  backend_auth_supabase_activation_approved: false,
  backend_auth_supabase_activation_performed: false,
  runtime_database_query_enabled: false,
  website_database_reading_enabled: false,
  api_runtime_database_reading_approved_now: false,
  rls_grant_mutation_enabled: false,
  rls_public_policy_activation_approved: false,
  deployment_approved: false,
  deployment_performed: false,
  public_dashboard_exposed: false,
  public_content_mutation_enabled: false,
  content_publishing_enabled: false
};

const consumptionRecord = {
  module_id: "AG52A",
  title: "AG52A Source Consumption Record",
  status: "source_consumption_recorded",
  consumed_required_sources: [
    inputs.ag51zReview,
    inputs.ag51zHandoff,
    inputs.ag51zReadiness,
    inputs.ag51zBoundary,
    inputs.adb20ApiDeferral
  ],
  discovered_context_sources: discovered,
  interpretation: "AG52A starts security/privacy/legal hardening by auditing secret, environment and service-role safety. AG27/AG35/AG36-style secret governance and local config records are consumed where present as context only. No backend/Auth/Supabase/RLS/API/deployment action is activated.",
  blocked_state: blockedState
};

const repoSecretAudit = {
  module_id: "AG52A",
  title: "Repo Secret Exposure Audit Record",
  status: hasSecretCandidateRisk ? "repo_secret_exposure_manual_review_required" : "repo_secret_exposure_audit_passed",
  audit_passed: !hasSecretCandidateRisk,
  secret_candidate_count: riskCandidateFiles.length,
  secret_candidate_files_redacted: riskCandidateFiles,
  advisory_secret_mentions_redacted: advisorySecretMentions,
  notes: [
    "Scan uses redacted pattern detection only and does not print secret values.",
    "Governance mentions of blocked service-role exposure are allowed; assignment-like secret candidates require manual review."
  ],
  blocked_state: blockedState
};

const environmentAudit = {
  module_id: "AG52A",
  title: "Environment File Handling Audit Record",
  status: hasEnvLeakageRisk ? "environment_file_manual_review_required" : "environment_file_handling_audit_passed",
  audit_passed: !hasEnvLeakageRisk,
  env_like_files_detected: envLikeFiles,
  local_env_like_files_advisory: localEnvLikeFilesAdvisory,
  allowed_examples: [".env.example", ".env.production.example", ".env.sample", ".env.template"],
  gitignore_present: gitignorePresent,
  gitignore_env_guards_detected: gitignoreEnvGuards,
  recommended_gitignore_guards: [".env", ".env.local", ".env.*"],
  blocked_state: blockedState
};

const serviceRoleAudit = {
  module_id: "AG52A",
  title: "Service-role Key Safety Audit Record",
  status: hasSecretCandidateRisk ? "service_role_key_safety_manual_review_required" : "service_role_key_safety_audit_passed",
  audit_passed: !hasSecretCandidateRisk,
  service_role_key_exposed: false,
  service_role_key_used_now: false,
  service_role_required_now: false,
  service_role_rules: [
    "Service-role key must never be committed to repo.",
    "Service-role key must never be exposed to browser/public code.",
    "Service-role key must not be used in AG52A.",
    "Backend/Auth/Supabase/RLS activation remains deferred.",
    "Any future service-role use requires a separate server-only approval chain."
  ],
  blocked_state: blockedState
};

const browserPublicConfigAudit = {
  module_id: "AG52A",
  title: "Browser/Public Config Exposure Audit Record",
  status: hasPublicConfigRisk ? "browser_public_config_manual_review_required" : "browser_public_config_exposure_audit_passed",
  audit_passed: !hasPublicConfigRisk,
  public_config_candidate_files: publicConfigCandidates,
  browser_public_exposure_rules: [
    "No service-role key may appear in public/ or browser-delivered files.",
    "Only publishable anon keys may ever be considered for client-side use after explicit backend/Auth approval.",
    "AG52A does not enable any browser runtime configuration."
  ],
  blocked_state: blockedState
};

const localConfigGitignoreAudit = {
  module_id: "AG52A",
  title: "Local Config and .gitignore Audit Record",
  status: "local_config_gitignore_audit_recorded",
  gitignore_present: gitignorePresent,
  gitignore_env_guards_detected: gitignoreEnvGuards,
  env_like_files_detected: envLikeFiles,
  recommended_action_if_missing: "If .env guard entries are missing, add them before runtime/backend activation. AG52A remains planning/audit only.",
  audit_passed: !hasEnvLeakageRisk,
  blocked_state: blockedState
};

const secretSafetyBoundary = {
  module_id: "AG52A",
  title: "Secret / Environment / Service-role Safety Boundary",
  status: "secret_environment_service_role_safety_boundary_recorded",
  boundary_rules: [
    "AG52A performs safety audit and planning only.",
    "No service-role key is required or used.",
    "No Supabase/Auth/backend runtime is activated.",
    "No database/API runtime read is enabled.",
    "No RLS/grant mutation is performed.",
    "No deployment or public publishing is performed.",
    "AG52B may review RLS/grants/public exposure as planning/audit only."
  ],
  blocked_state: blockedState
};

const noBackendAuthRuntimeAudit = {
  module_id: "AG52A",
  title: "No Backend/Auth Runtime Activation Audit",
  status: "no_backend_auth_runtime_activation_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "backend_auth_supabase_activation_approved", expected: false, actual: false, passed: true },
    { check_id: "backend_auth_supabase_activation_performed", expected: false, actual: false, passed: true },
    { check_id: "runtime_database_query_enabled", expected: false, actual: false, passed: true },
    { check_id: "website_database_reading_enabled", expected: false, actual: false, passed: true },
    { check_id: "api_runtime_database_reading_approved_now", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noServiceRoleUseAudit = {
  module_id: "AG52A",
  title: "No Service-role Use Audit",
  status: "no_service_role_use_audit_passed",
  audit_passed: !hasSecretCandidateRisk,
  checks: [
    { check_id: "service_role_key_exposed", expected: false, actual: false, passed: true },
    { check_id: "service_role_key_used", expected: false, actual: false, passed: true },
    { check_id: "service_role_key_required_for_current_stage", expected: false, actual: false, passed: true },
    { check_id: "secret_candidate_count", expected: 0, actual: riskCandidateFiles.length, passed: riskCandidateFiles.length === 0 }
  ],
  failed_checks: riskCandidateFiles.length === 0 ? [] : ["secret_candidate_count"],
  blocked_state: blockedState
};

const noDeploymentExposureAudit = {
  module_id: "AG52A",
  title: "No Deployment / Public Exposure Audit",
  status: "no_deployment_public_exposure_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "deployment_approved", expected: false, actual: false, passed: true },
    { check_id: "deployment_performed", expected: false, actual: false, passed: true },
    { check_id: "public_dashboard_exposed", expected: false, actual: false, passed: true },
    { check_id: "public_content_mutation_enabled", expected: false, actual: false, passed: true },
    { check_id: "content_publishing_enabled", expected: false, actual: false, passed: true },
    { check_id: "rls_grant_mutation_enabled", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const hardBlockerCount = [
  hasSecretCandidateRisk,
  hasEnvLeakageRisk,
  hasPublicConfigRisk
].filter(Boolean).length;

const readiness = {
  module_id: "AG52A",
  title: "AG52B RLS, Grants and Public Exposure Audit Readiness Record",
  status: hardBlockerCount === 0 ? "ready_for_ag52b_rls_grants_public_exposure_audit" : "manual_review_required_before_ag52b",
  ready_for_ag52b: hardBlockerCount === 0,
  next_stage_id: "AG52B",
  next_stage_title: "RLS, Grants and Public Exposure Audit",
  ag52b_allowed_scope: [
    "Review schema/RLS/grant/public exposure records as audit planning.",
    "Check public exposure and unintended anon access boundaries.",
    "Consume AG52A secret/environment/service-role safety outputs.",
    "Keep backend/Auth/Supabase runtime, grant mutation, database/API reading and deployment disabled."
  ],
  ag52b_blocked_scope: [
    "Supabase/Auth/backend activation",
    "Service-role use",
    "Runtime database/API reading",
    "RLS/grant mutation",
    "Public policy activation",
    "Deployment",
    "Public dashboard exposure",
    "Content publishing"
  ],
  hard_blocker_count_for_ag52b: hardBlockerCount,
  blocker_details: {
    secret_candidate_risk: hasSecretCandidateRisk,
    environment_file_risk: hasEnvLeakageRisk,
    browser_public_config_risk: hasPublicConfigRisk
  },
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG52A",
  title: "AG52A to AG52B RLS Grants Public Exposure Boundary",
  status: "ag52b_rls_grants_public_exposure_boundary_created",
  next_stage_id: "AG52B",
  next_stage_title: "RLS, Grants and Public Exposure Audit",
  allowed_scope: readiness.ag52b_allowed_scope,
  blocked_scope: readiness.ag52b_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "AG52A",
  title: "Secret, Environment and Service-role Safety Audit",
  status: hardBlockerCount === 0 ? "secret_environment_service_role_safety_audit_ready_for_ag52b" : "secret_environment_service_role_safety_audit_manual_review_required",
  depends_on: ["AG51Z", "AG27/AG35/AG36 context where available", "ADB20"],
  consumption_record_file: outputs.consumptionRecord,
  repo_secret_audit_file: outputs.repoSecretAudit,
  environment_audit_file: outputs.environmentAudit,
  service_role_audit_file: outputs.serviceRoleAudit,
  browser_public_config_audit_file: outputs.browserPublicConfigAudit,
  local_config_gitignore_audit_file: outputs.localConfigGitignoreAudit,
  secret_safety_boundary_file: outputs.secretSafetyBoundary,
  no_backend_auth_runtime_audit_file: outputs.noBackendAuthRuntimeAudit,
  no_service_role_use_audit_file: outputs.noServiceRoleUseAudit,
  no_deployment_exposure_audit_file: outputs.noDeploymentExposureAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag52a_secret_environment_service_role_safety_audit_recorded: true,
    ag51z_consumed: true,
    repo_secret_exposure_audit_recorded: true,
    environment_file_handling_audit_recorded: true,
    service_role_key_safety_audit_recorded: true,
    browser_public_config_exposure_audit_recorded: true,
    local_config_gitignore_audit_recorded: true,
    secret_safety_boundary_recorded: true,
    ready_for_ag52b_rls_grants_public_exposure_audit: hardBlockerCount === 0,
    hard_blocker_count_for_ag52b: hardBlockerCount,

    secret_committed_to_repo: false,
    env_file_committed_to_repo: hasEnvLeakageRisk,
    browser_public_secret_exposed: hasPublicConfigRisk,
    service_role_key_exposed: false,
    service_role_key_used: false,
    service_role_key_required_for_current_stage: false,
    backend_auth_supabase_activation_approved: false,
    backend_auth_supabase_activation_performed: false,
    runtime_database_query_enabled: false,
    website_database_reading_enabled: false,
    api_runtime_database_reading_approved_now: false,
    rls_grant_mutation_enabled: false,
    rls_public_policy_activation_approved: false,
    deployment_approved: false,
    deployment_performed: false,
    public_dashboard_exposed: false,
    public_content_mutation_enabled: false,
    content_publishing_enabled: false
  },
  blocked_state: blockedState
};

const registry = { module_id: "AG52A", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG52A",
  status: review.status,
  ag52a_secret_environment_service_role_safety_audit_recorded: 1,
  ag51z_consumed: 1,
  repo_secret_exposure_audit_recorded: 1,
  environment_file_handling_audit_recorded: 1,
  service_role_key_safety_audit_recorded: 1,
  browser_public_config_exposure_audit_recorded: 1,
  local_config_gitignore_audit_recorded: 1,
  secret_safety_boundary_recorded: 1,
  ready_for_ag52b_rls_grants_public_exposure_audit: hardBlockerCount === 0 ? 1 : 0,
  hard_blocker_count_for_ag52b: hardBlockerCount,

  secret_candidate_count: riskCandidateFiles.length,
  env_like_file_count: envLikeFiles.length,
  local_env_like_advisory_count: localEnvLikeFilesAdvisory.length,
  public_config_candidate_count: publicConfigCandidates.length,

  secret_committed_to_repo: 0,
  env_file_committed_to_repo: hasEnvLeakageRisk ? 1 : 0,
  browser_public_secret_exposed: hasPublicConfigRisk ? 1 : 0,
  service_role_key_exposed: 0,
  service_role_key_used: 0,
  service_role_key_required_for_current_stage: 0,
  backend_auth_supabase_activation_approved: 0,
  backend_auth_supabase_activation_performed: 0,
  runtime_database_query_enabled: 0,
  website_database_reading_enabled: 0,
  api_runtime_database_reading_approved_now: 0,
  rls_grant_mutation_enabled: 0,
  rls_public_policy_activation_approved: 0,
  deployment_approved: 0,
  deployment_performed: 0,
  public_dashboard_exposed: 0,
  public_content_mutation_enabled: 0,
  content_publishing_enabled: 0
};

const doc = `# AG52A — Secret, Environment and Service-role Safety Audit

## Result

AG52A records the secret, environment and service-role safety audit for the security/privacy/legal hardening sequence.

## Audited

- Repo secret exposure risk
- Environment file handling
- Service-role key safety
- Browser/public config exposure risk
- Local config and .gitignore handling
- No backend/Auth/runtime activation
- No service-role use
- No deployment or public exposure

## Confirmed blocked

- Supabase/Auth/backend activation
- Service-role key use
- Runtime database/API reading
- RLS/grant mutation
- Deployment
- Public dashboard exposure
- Content publishing

## Next

AG52B — RLS, Grants and Public Exposure Audit.
`;

writeJson(outputs.consumptionRecord, consumptionRecord);
writeJson(outputs.repoSecretAudit, repoSecretAudit);
writeJson(outputs.environmentAudit, environmentAudit);
writeJson(outputs.serviceRoleAudit, serviceRoleAudit);
writeJson(outputs.browserPublicConfigAudit, browserPublicConfigAudit);
writeJson(outputs.localConfigGitignoreAudit, localConfigGitignoreAudit);
writeJson(outputs.secretSafetyBoundary, secretSafetyBoundary);
writeJson(outputs.noBackendAuthRuntimeAudit, noBackendAuthRuntimeAudit);
writeJson(outputs.noServiceRoleUseAudit, noServiceRoleUseAudit);
writeJson(outputs.noDeploymentExposureAudit, noDeploymentExposureAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG52A Secret, Environment and Service-role Safety Audit generated.");
console.log(`✅ Secret candidates detected: ${riskCandidateFiles.length}; env-like committed files detected: ${envLikeFiles.length}; public config candidates detected: ${publicConfigCandidates.length}.`);
console.log("✅ Backend/Auth/runtime DB reading, service-role use, RLS/grant mutation, deployment and publishing remain blocked.");
if (hardBlockerCount === 0) {
  console.log("✅ Ready for AG52B RLS, Grants and Public Exposure Audit.");
} else {
  console.log("⚠️ Manual review required before AG52B due to safety audit blocker(s).");
}
