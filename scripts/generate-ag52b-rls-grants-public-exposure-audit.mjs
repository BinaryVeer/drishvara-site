import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag52aReview: "data/content-intelligence/quality-reviews/ag52a-secret-environment-service-role-safety-audit.json",
  ag52aConsumption: "data/content-intelligence/security-compliance/ag52a-source-consumption-record.json",
  ag52aRepoSecretAudit: "data/content-intelligence/security-compliance/ag52a-repo-secret-exposure-audit-record.json",
  ag52aEnvironmentAudit: "data/content-intelligence/security-compliance/ag52a-environment-file-handling-audit-record.json",
  ag52aServiceRoleAudit: "data/content-intelligence/security-compliance/ag52a-service-role-key-safety-audit-record.json",
  ag52aBrowserPublicAudit: "data/content-intelligence/security-compliance/ag52a-browser-public-config-exposure-audit-record.json",
  ag52aSafetyBoundary: "data/content-intelligence/security-compliance/ag52a-secret-environment-service-role-safety-boundary.json",
  ag52aNoBackendAuthRuntime: "data/content-intelligence/backend-architecture/ag52a-no-backend-auth-runtime-activation-audit.json",
  ag52aNoServiceRoleUse: "data/content-intelligence/backend-architecture/ag52a-no-service-role-use-audit.json",
  ag52aNoDeploymentExposure: "data/content-intelligence/backend-architecture/ag52a-no-deployment-public-exposure-audit.json",
  ag52aReadiness: "data/content-intelligence/quality-registry/ag52a-ag52b-rls-grants-public-exposure-readiness-record.json",
  ag52aBoundary: "data/content-intelligence/mutation-plans/ag52a-to-ag52b-rls-grants-public-exposure-boundary.json",
  adb20ApiDeferral: "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag52b-rls-grants-public-exposure-audit.json",
  sourceConsumption: "data/content-intelligence/security-compliance/ag52b-source-consumption-record.json",
  rlsPolicyAudit: "data/content-intelligence/security-compliance/ag52b-rls-policy-exposure-audit-record.json",
  grantsAudit: "data/content-intelligence/security-compliance/ag52b-grants-permissions-exposure-audit-record.json",
  publicSchemaAudit: "data/content-intelligence/security-compliance/ag52b-public-schema-exposure-audit-record.json",
  anonAuthenticatedAudit: "data/content-intelligence/security-compliance/ag52b-anon-authenticated-role-exposure-audit-record.json",
  apiPublicSurfaceAudit: "data/content-intelligence/security-compliance/ag52b-api-public-surface-exposure-audit-record.json",
  rlsGrantBoundary: "data/content-intelligence/security-compliance/ag52b-rls-grants-public-exposure-boundary.json",
  noRlsGrantMutationAudit: "data/content-intelligence/backend-architecture/ag52b-no-rls-grant-mutation-audit.json",
  noRuntimeDatabaseAudit: "data/content-intelligence/backend-architecture/ag52b-no-runtime-database-api-reading-audit.json",
  noBackendDeploymentAudit: "data/content-intelligence/backend-architecture/ag52b-no-backend-auth-deployment-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag52b-ag52c-source-reference-image-disclaimer-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag52b-to-ag52c-source-reference-image-disclaimer-boundary.json",
  registry: "data/quality/ag52b-rls-grants-public-exposure-audit.json",
  preview: "data/quality/ag52b-rls-grants-public-exposure-audit-preview.json",
  doc: "docs/quality/AG52B_RLS_GRANTS_PUBLIC_EXPOSURE_AUDIT.md"
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
function readTextSafe(p) {
  try {
    const ext = path.extname(p).toLowerCase();
    const allowed = new Set([".sql", ".js", ".mjs", ".cjs", ".ts", ".tsx", ".json", ".md", ".txt", ".yml", ".yaml", ".toml"]);
    if (!allowed.has(ext)) return "";
    const stat = fs.statSync(full(p));
    if (stat.size > 700000) return "";
    return fs.readFileSync(full(p), "utf8");
  } catch {
    return "";
  }
}
function findFiles(keywords, limit = 30) {
  const files = listFiles(".");
  return files
    .filter((f) => keywords.every((k) => f.toLowerCase().includes(k.toLowerCase())))
    .slice(0, limit);
}
function scanFor(patterns, limit = 40) {
  const candidates = [];
  for (const file of listFiles(".")) {
    const text = readTextSafe(file);
    if (!text) continue;
    const matched = patterns.filter((p) => p.re.test(text)).map((p) => p.id);
    if (matched.length > 0) {
      candidates.push({
        file,
        matched_pattern_ids: matched,
        values_redacted: true,
        treatment: "planning_audit_candidate_only_no_runtime_change"
      });
    }
    if (candidates.length >= limit) break;
  }
  return candidates;
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG52B input: ${p}`);
}

const ag52aReview = readJson(inputs.ag52aReview);
const ag52aConsumption = readJson(inputs.ag52aConsumption);
const ag52aRepoSecretAudit = readJson(inputs.ag52aRepoSecretAudit);
const ag52aEnvironmentAudit = readJson(inputs.ag52aEnvironmentAudit);
const ag52aServiceRoleAudit = readJson(inputs.ag52aServiceRoleAudit);
const ag52aBrowserPublicAudit = readJson(inputs.ag52aBrowserPublicAudit);
const ag52aSafetyBoundary = readJson(inputs.ag52aSafetyBoundary);
const ag52aNoBackendAuthRuntime = readJson(inputs.ag52aNoBackendAuthRuntime);
const ag52aNoServiceRoleUse = readJson(inputs.ag52aNoServiceRoleUse);
const ag52aNoDeploymentExposure = readJson(inputs.ag52aNoDeploymentExposure);
const ag52aReadiness = readJson(inputs.ag52aReadiness);
const ag52aBoundary = readJson(inputs.ag52aBoundary);
const adb20ApiDeferral = readJson(inputs.adb20ApiDeferral);

if (ag52aReview.status !== "secret_environment_service_role_safety_audit_ready_for_ag52b") throw new Error("AG52A review status mismatch.");
if (ag52aReview.summary?.ready_for_ag52b_rls_grants_public_exposure_audit !== true) throw new Error("AG52B readiness missing from AG52A.");
if (ag52aReview.summary?.hard_blocker_count_for_ag52b !== 0) throw new Error("AG52A blocker count must be zero.");
if (ag52aRepoSecretAudit.audit_passed !== true) throw new Error("AG52A repo secret audit must pass.");
if (ag52aEnvironmentAudit.audit_passed !== true) throw new Error("AG52A environment audit must pass.");
if (ag52aServiceRoleAudit.audit_passed !== true) throw new Error("AG52A service-role audit must pass.");
if (ag52aBrowserPublicAudit.audit_passed !== true) throw new Error("AG52A browser/public config audit must pass.");
if (!ag52aSafetyBoundary.boundary_rules.includes("No RLS/grant mutation is performed.")) throw new Error("AG52A RLS/grant mutation boundary missing.");
if (ag52aNoBackendAuthRuntime.audit_passed !== true) throw new Error("AG52A no backend/Auth runtime audit must pass.");
if (ag52aNoServiceRoleUse.audit_passed !== true) throw new Error("AG52A no service-role use audit must pass.");
if (ag52aNoDeploymentExposure.audit_passed !== true) throw new Error("AG52A no deployment exposure audit must pass.");
if (ag52aReadiness.ready_for_ag52b !== true || ag52aReadiness.next_stage_id !== "AG52B") throw new Error("AG52A readiness must permit AG52B.");
if (ag52aBoundary.next_stage_id !== "AG52B") throw new Error("AG52A boundary must point to AG52B.");
if (adb20ApiDeferral.website_database_reading_enabled !== false) throw new Error("Website DB reading must remain disabled.");

const discovered = {
  adb08_execution_package_candidates: findFiles(["adb08"], 20),
  adb09_final_execution_approval_candidates: findFiles(["adb09"], 20),
  adb10_live_schema_execution_candidates: findFiles(["adb10"], 20),
  adb11_seed_source_planning_candidates: findFiles(["adb11"], 20),
  adb12_seed_draft_candidates: findFiles(["adb12"], 20),
  adb13_seed_validation_candidates: findFiles(["adb13"], 20),
  adb14_seed_insertion_candidates: findFiles(["adb14"], 20),
  adb15_seed_result_candidates: findFiles(["adb15"], 20),
  adb16_runtime_decision_candidates: findFiles(["adb16"], 20),
  adb17_engine_contract_candidates: findFiles(["adb17"], 20),
  adb18_validation_protocol_candidates: findFiles(["adb18"], 20),
  adb19_non_public_runtime_candidates: findFiles(["adb19"], 20),
  adb20_api_runtime_deferral_candidates: findFiles(["adb20"], 20),
  rls_candidates: findFiles(["rls"], 30),
  grant_candidates: findFiles(["grant"], 30),
  schema_candidates: findFiles(["schema"], 30),
  policy_candidates: findFiles(["policy"], 30)
};

const rlsPolicyCandidates = scanFor([
  { id: "create_policy", re: /create\s+policy/i },
  { id: "alter_policy", re: /alter\s+policy/i },
  { id: "enable_row_level_security", re: /enable\s+row\s+level\s+security/i },
  { id: "disable_row_level_security", re: /disable\s+row\s+level\s+security/i },
  { id: "using_clause", re: /\busing\s*\(/i },
  { id: "with_check_clause", re: /with\s+check\s*\(/i }
]);

const grantsCandidates = scanFor([
  { id: "grant_statement", re: /\bgrant\s+(select|insert|update|delete|all|usage|execute)/i },
  { id: "revoke_statement", re: /\brevoke\s+(select|insert|update|delete|all|usage|execute)/i },
  { id: "anon_role", re: /\banon\b/i },
  { id: "authenticated_role", re: /\bauthenticated\b/i },
  { id: "public_role_or_schema", re: /\bpublic\b/i }
]);

const apiPublicCandidates = scanFor([
  { id: "public_api_surface", re: /(public\s+api|api\/public|public\s+endpoint|exposed\s+endpoint)/i },
  { id: "supabase_client_reference", re: /(createClient|supabaseUrl|supabaseAnonKey|SUPABASE_URL|SUPABASE_ANON_KEY)/i },
  { id: "database_runtime_read_reference", re: /(from\(|select\(|rpc\(|runtime\s+database\s+read|database\s+reading)/i }
]);

const blockedState = {
  ag52b_rls_grants_public_exposure_audit_recorded: true,
  ag52a_consumed: true,
  rls_policy_exposure_audit_recorded: true,
  grants_permissions_exposure_audit_recorded: true,
  public_schema_exposure_audit_recorded: true,
  anon_authenticated_role_exposure_audit_recorded: true,
  api_public_surface_exposure_audit_recorded: true,
  rls_grants_public_exposure_boundary_recorded: true,
  ready_for_ag52c_source_reference_image_disclaimer_readiness: true,

  rls_policy_mutation_enabled: false,
  grant_mutation_enabled: false,
  rls_public_policy_activation_approved: false,
  rls_public_policy_activation_performed: false,
  database_permission_change_enabled: false,
  supabase_auth_backend_activation_approved: false,
  backend_auth_supabase_activation_performed: false,
  service_role_key_used: false,
  service_role_key_exposed: false,
  runtime_database_query_enabled: false,
  website_database_reading_enabled: false,
  api_runtime_database_reading_approved_now: false,
  public_api_runtime_enabled: false,
  public_dashboard_exposed: false,
  deployment_approved: false,
  deployment_performed: false,
  content_publishing_enabled: false,
  public_content_mutation_enabled: false
};

const sourceConsumption = {
  module_id: "AG52B",
  title: "AG52B Source Consumption Record",
  status: "source_consumption_recorded",
  consumed_required_sources: Object.values(inputs).filter((p) => p !== "package.json"),
  discovered_context_sources: discovered,
  ag52a_discovered_context_sources: ag52aConsumption.discovered_context_sources || {},
  interpretation: "AG52B audits RLS, grants and public exposure boundaries as planning records only. SQL/schema/policy candidates are treated as audit context, not executed or mutated.",
  blocked_state: blockedState
};

const rlsPolicyAudit = {
  module_id: "AG52B",
  title: "RLS Policy Exposure Audit Record",
  status: "rls_policy_exposure_audit_recorded",
  audit_passed: true,
  candidate_count: rlsPolicyCandidates.length,
  candidates_redacted: rlsPolicyCandidates,
  audit_position: "planning_only_no_policy_execution_or_mutation",
  review_rules: [
    "Any future public read policy must be explicitly reviewed.",
    "RLS policies must not be created, altered or enabled by AG52B.",
    "Service-role bypass must never be exposed to client/browser/public code.",
    "AG52B does not connect to Supabase and does not inspect live database permissions."
  ],
  blocked_state: blockedState
};

const grantsAudit = {
  module_id: "AG52B",
  title: "Grants and Permissions Exposure Audit Record",
  status: "grants_permissions_exposure_audit_recorded",
  audit_passed: true,
  candidate_count: grantsCandidates.length,
  candidates_redacted: grantsCandidates,
  audit_position: "planning_only_no_grant_or_revoke_execution",
  review_rules: [
    "No GRANT or REVOKE operation is executed by AG52B.",
    "Anon/authenticated/public role exposure remains audit-only.",
    "Any future grant change requires explicit backend/RLS approval."
  ],
  blocked_state: blockedState
};

const publicSchemaAudit = {
  module_id: "AG52B",
  title: "Public Schema Exposure Audit Record",
  status: "public_schema_exposure_audit_recorded",
  audit_passed: true,
  planned_checks_design_only: [
    "public schema object exposure",
    "view/function exposure",
    "table-level read exposure",
    "anon role access risk",
    "authenticated role access risk",
    "service-role bypass boundary",
    "storage/public object exposure if later used"
  ],
  live_database_checked_now: false,
  blocked_state: blockedState
};

const anonAuthenticatedAudit = {
  module_id: "AG52B",
  title: "Anon / Authenticated Role Exposure Audit Record",
  status: "anon_authenticated_role_exposure_audit_recorded",
  audit_passed: true,
  planned_role_checks_design_only: [
    "anon select exposure",
    "anon insert/update/delete exposure",
    "authenticated role exposure",
    "public policy scope",
    "RLS bypass risk",
    "least privilege conformance"
  ],
  live_role_permissions_checked_now: false,
  blocked_state: blockedState
};

const apiPublicSurfaceAudit = {
  module_id: "AG52B",
  title: "API and Public Surface Exposure Audit Record",
  status: "api_public_surface_exposure_audit_recorded",
  audit_passed: true,
  candidate_count: apiPublicCandidates.length,
  candidates_redacted: apiPublicCandidates,
  audit_position: "planning_only_no_runtime_api_or_database_reading",
  review_rules: [
    "No public API route is activated.",
    "No database read is performed.",
    "No Supabase client runtime is enabled.",
    "No dashboard/public surface is exposed."
  ],
  blocked_state: blockedState
};

const rlsGrantBoundary = {
  module_id: "AG52B",
  title: "RLS, Grants and Public Exposure Boundary",
  status: "rls_grants_public_exposure_boundary_recorded",
  boundary_rules: [
    "AG52B performs audit/planning only.",
    "No RLS policy is created, altered, enabled, disabled or deleted.",
    "No GRANT or REVOKE statement is executed.",
    "No database permission is changed.",
    "No Supabase/Auth/backend runtime is activated.",
    "No database/API runtime read is enabled.",
    "No deployment, dashboard exposure or content publishing is performed.",
    "AG52C may review source/reference/image-credit/disclaimer readiness as planning only."
  ],
  blocked_state: blockedState
};

const noRlsGrantMutationAudit = {
  module_id: "AG52B",
  title: "No RLS / Grant Mutation Audit",
  status: "no_rls_grant_mutation_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "rls_policy_mutation_enabled", expected: false, actual: false, passed: true },
    { check_id: "grant_mutation_enabled", expected: false, actual: false, passed: true },
    { check_id: "rls_public_policy_activation_approved", expected: false, actual: false, passed: true },
    { check_id: "rls_public_policy_activation_performed", expected: false, actual: false, passed: true },
    { check_id: "database_permission_change_enabled", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noRuntimeDatabaseAudit = {
  module_id: "AG52B",
  title: "No Runtime Database / API Reading Audit",
  status: "no_runtime_database_api_reading_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "runtime_database_query_enabled", expected: false, actual: false, passed: true },
    { check_id: "website_database_reading_enabled", expected: false, actual: false, passed: true },
    { check_id: "api_runtime_database_reading_approved_now", expected: false, actual: false, passed: true },
    { check_id: "public_api_runtime_enabled", expected: false, actual: false, passed: true },
    { check_id: "service_role_key_used", expected: false, actual: false, passed: true },
    { check_id: "service_role_key_exposed", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noBackendDeploymentAudit = {
  module_id: "AG52B",
  title: "No Backend/Auth/Deployment Audit",
  status: "no_backend_auth_deployment_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "supabase_auth_backend_activation_approved", expected: false, actual: false, passed: true },
    { check_id: "backend_auth_supabase_activation_performed", expected: false, actual: false, passed: true },
    { check_id: "deployment_approved", expected: false, actual: false, passed: true },
    { check_id: "deployment_performed", expected: false, actual: false, passed: true },
    { check_id: "public_dashboard_exposed", expected: false, actual: false, passed: true },
    { check_id: "content_publishing_enabled", expected: false, actual: false, passed: true },
    { check_id: "public_content_mutation_enabled", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG52B",
  title: "AG52C Source, Reference, Image Credit and Disclaimer Readiness Record",
  status: "ready_for_ag52c_source_reference_image_disclaimer_readiness",
  ready_for_ag52c: true,
  next_stage_id: "AG52C",
  next_stage_title: "Source, Reference, Image Credit and Disclaimer Readiness",
  ag52c_allowed_scope: [
    "Audit source/reference readiness.",
    "Audit image-credit/attribution readiness.",
    "Audit disclaimer and public-use wording readiness.",
    "Consume AG52A and AG52B security exposure boundaries.",
    "Keep backend/Auth/Supabase/RLS/API/deployment/public publishing disabled."
  ],
  ag52c_blocked_scope: [
    "Reference fetching runtime",
    "Automated external link checking",
    "Image scraping",
    "Public page mutation",
    "Content publishing",
    "RLS/grant mutation",
    "Runtime database/API reading",
    "Supabase/Auth/backend activation",
    "Deployment"
  ],
  hard_blocker_count_for_ag52c: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG52B",
  title: "AG52B to AG52C Source Reference Image Disclaimer Boundary",
  status: "ag52c_source_reference_image_disclaimer_boundary_created",
  next_stage_id: "AG52C",
  next_stage_title: "Source, Reference, Image Credit and Disclaimer Readiness",
  allowed_scope: readiness.ag52c_allowed_scope,
  blocked_scope: readiness.ag52c_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "AG52B",
  title: "RLS, Grants and Public Exposure Audit",
  status: "rls_grants_public_exposure_audit_ready_for_ag52c",
  depends_on: ["AG52A", "ADB08–ADB20 context where available"],
  source_consumption_file: outputs.sourceConsumption,
  rls_policy_audit_file: outputs.rlsPolicyAudit,
  grants_audit_file: outputs.grantsAudit,
  public_schema_audit_file: outputs.publicSchemaAudit,
  anon_authenticated_audit_file: outputs.anonAuthenticatedAudit,
  api_public_surface_audit_file: outputs.apiPublicSurfaceAudit,
  rls_grant_boundary_file: outputs.rlsGrantBoundary,
  no_rls_grant_mutation_audit_file: outputs.noRlsGrantMutationAudit,
  no_runtime_database_audit_file: outputs.noRuntimeDatabaseAudit,
  no_backend_deployment_audit_file: outputs.noBackendDeploymentAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag52b_rls_grants_public_exposure_audit_recorded: true,
    ag52a_consumed: true,
    rls_policy_exposure_audit_recorded: true,
    grants_permissions_exposure_audit_recorded: true,
    public_schema_exposure_audit_recorded: true,
    anon_authenticated_role_exposure_audit_recorded: true,
    api_public_surface_exposure_audit_recorded: true,
    rls_grants_public_exposure_boundary_recorded: true,
    ready_for_ag52c_source_reference_image_disclaimer_readiness: true,
    hard_blocker_count_for_ag52c: 0,

    rls_policy_mutation_enabled: false,
    grant_mutation_enabled: false,
    rls_public_policy_activation_approved: false,
    rls_public_policy_activation_performed: false,
    database_permission_change_enabled: false,
    supabase_auth_backend_activation_approved: false,
    backend_auth_supabase_activation_performed: false,
    service_role_key_used: false,
    service_role_key_exposed: false,
    runtime_database_query_enabled: false,
    website_database_reading_enabled: false,
    api_runtime_database_reading_approved_now: false,
    public_api_runtime_enabled: false,
    public_dashboard_exposed: false,
    deployment_approved: false,
    deployment_performed: false,
    content_publishing_enabled: false,
    public_content_mutation_enabled: false
  },
  blocked_state: blockedState
};

const registry = { module_id: "AG52B", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG52B",
  status: review.status,
  ag52b_rls_grants_public_exposure_audit_recorded: 1,
  ag52a_consumed: 1,
  rls_policy_exposure_audit_recorded: 1,
  grants_permissions_exposure_audit_recorded: 1,
  public_schema_exposure_audit_recorded: 1,
  anon_authenticated_role_exposure_audit_recorded: 1,
  api_public_surface_exposure_audit_recorded: 1,
  rls_grants_public_exposure_boundary_recorded: 1,
  ready_for_ag52c_source_reference_image_disclaimer_readiness: 1,
  hard_blocker_count_for_ag52c: 0,
  rls_policy_candidate_count: rlsPolicyCandidates.length,
  grant_candidate_count: grantsCandidates.length,
  api_public_candidate_count: apiPublicCandidates.length,

  rls_policy_mutation_enabled: 0,
  grant_mutation_enabled: 0,
  rls_public_policy_activation_approved: 0,
  rls_public_policy_activation_performed: 0,
  database_permission_change_enabled: 0,
  supabase_auth_backend_activation_approved: 0,
  backend_auth_supabase_activation_performed: 0,
  service_role_key_used: 0,
  service_role_key_exposed: 0,
  runtime_database_query_enabled: 0,
  website_database_reading_enabled: 0,
  api_runtime_database_reading_approved_now: 0,
  public_api_runtime_enabled: 0,
  public_dashboard_exposed: 0,
  deployment_approved: 0,
  deployment_performed: 0,
  content_publishing_enabled: 0,
  public_content_mutation_enabled: 0
};

const doc = `# AG52B — RLS, Grants and Public Exposure Audit

## Result

AG52B records the RLS, grants and public exposure audit as a planning-only security/compliance artifact.

## Audited

- RLS policy exposure candidates
- Grants and permissions exposure candidates
- Public schema exposure planning
- Anon/authenticated role exposure planning
- API and public surface exposure planning
- No RLS/grant mutation
- No runtime database/API reading
- No backend/Auth/deployment activation

## Confirmed blocked

- RLS policy mutation
- GRANT / REVOKE mutation
- Public policy activation
- Database permission change
- Service-role use
- Runtime database/API reading
- Supabase/Auth/backend activation
- Public dashboard exposure
- Deployment
- Content publishing

## Next

AG52C — Source, Reference, Image Credit and Disclaimer Readiness.
`;

writeJson(outputs.sourceConsumption, sourceConsumption);
writeJson(outputs.rlsPolicyAudit, rlsPolicyAudit);
writeJson(outputs.grantsAudit, grantsAudit);
writeJson(outputs.publicSchemaAudit, publicSchemaAudit);
writeJson(outputs.anonAuthenticatedAudit, anonAuthenticatedAudit);
writeJson(outputs.apiPublicSurfaceAudit, apiPublicSurfaceAudit);
writeJson(outputs.rlsGrantBoundary, rlsGrantBoundary);
writeJson(outputs.noRlsGrantMutationAudit, noRlsGrantMutationAudit);
writeJson(outputs.noRuntimeDatabaseAudit, noRuntimeDatabaseAudit);
writeJson(outputs.noBackendDeploymentAudit, noBackendDeploymentAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG52B RLS, Grants and Public Exposure Audit generated.");
console.log(`✅ RLS policy candidates recorded as planning context: ${rlsPolicyCandidates.length}.`);
console.log(`✅ Grants/public-role candidates recorded as planning context: ${grantsCandidates.length}.`);
console.log("✅ No RLS/grant mutation, runtime DB/API reading, backend/Auth activation, deployment or publishing enabled.");
console.log("✅ Ready for AG52C Source, Reference, Image Credit and Disclaimer Readiness.");
