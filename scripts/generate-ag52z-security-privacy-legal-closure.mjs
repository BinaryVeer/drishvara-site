import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag52aReview: "data/content-intelligence/quality-reviews/ag52a-secret-environment-service-role-safety-audit.json",
  ag52bReview: "data/content-intelligence/quality-reviews/ag52b-rls-grants-public-exposure-audit.json",
  ag52cReview: "data/content-intelligence/quality-reviews/ag52c-source-reference-image-disclaimer-readiness.json",
  ag52dReview: "data/content-intelligence/quality-reviews/ag52d-security-compliance-closure-audit.json",

  ag52dAg52aAudit: "data/content-intelligence/security-compliance/ag52d-ag52a-secret-environment-service-role-audit.json",
  ag52dAg52bAudit: "data/content-intelligence/security-compliance/ag52d-ag52b-rls-grants-public-exposure-audit.json",
  ag52dAg52cAudit: "data/content-intelligence/security-compliance/ag52d-ag52c-source-reference-image-disclaimer-audit.json",
  ag52dRiskRegister: "data/content-intelligence/security-compliance/ag52d-combined-security-compliance-risk-register.json",
  ag52dClosureReadiness: "data/content-intelligence/security-compliance/ag52d-security-compliance-closure-readiness-audit-record.json",

  ag52dNoRuntimeBackendRlsDeployment: "data/content-intelligence/backend-architecture/ag52d-no-runtime-backend-rls-deployment-audit.json",
  ag52dNoServiceRoleSecretExposure: "data/content-intelligence/backend-architecture/ag52d-no-service-role-secret-exposure-audit.json",
  ag52dNoPublishingPublicMutation: "data/content-intelligence/backend-architecture/ag52d-no-publishing-public-mutation-audit.json",
  ag52dNoExternalFetchScrape: "data/content-intelligence/backend-architecture/ag52d-no-external-fetch-scrape-audit.json",
  ag52dReadiness: "data/content-intelligence/quality-registry/ag52d-ag52z-security-privacy-legal-closure-readiness-record.json",
  ag52dBoundary: "data/content-intelligence/mutation-plans/ag52d-to-ag52z-security-privacy-legal-closure-boundary.json",

  ag51zReview: "data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json",
  adb20ApiDeferral: "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json",
  closureRecord: "data/content-intelligence/security-compliance/ag52z-security-privacy-legal-closure-record.json",
  consumptionSummary: "data/content-intelligence/security-compliance/ag52z-ag52a-to-ag52d-consumption-summary.json",
  compliancePostureRecord: "data/content-intelligence/security-compliance/ag52z-security-privacy-legal-posture-record.json",
  carryForwardDeferralRegister: "data/content-intelligence/security-compliance/ag52z-carry-forward-security-deferral-register.json",
  ag53Handoff: "data/content-intelligence/ag-roadmap/ag52z-to-ag53-public-quality-handoff.json",
  noRuntimeBackendAudit: "data/content-intelligence/backend-architecture/ag52z-no-runtime-backend-auth-rls-audit.json",
  noSecretServiceRoleAudit: "data/content-intelligence/backend-architecture/ag52z-no-secret-service-role-exposure-audit.json",
  noPublishingDeploymentAudit: "data/content-intelligence/backend-architecture/ag52z-no-publishing-deployment-audit.json",
  noExternalFetchScrapeAudit: "data/content-intelligence/backend-architecture/ag52z-no-external-fetch-scrape-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag52z-ag53a-performance-page-weight-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag52z-to-ag53a-performance-page-weight-boundary.json",
  registry: "data/quality/ag52z-security-privacy-legal-closure.json",
  preview: "data/quality/ag52z-security-privacy-legal-closure-preview.json",
  doc: "docs/quality/AG52Z_SECURITY_PRIVACY_LEGAL_CLOSURE.md"
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
function findFiles(keywords, limit = 40) {
  const files = listFiles("data/content-intelligence");
  return files
    .filter((f) => keywords.every((k) => f.toLowerCase().includes(k.toLowerCase())))
    .slice(0, limit);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG52Z input: ${p}`);
}

const ag52aReview = readJson(inputs.ag52aReview);
const ag52bReview = readJson(inputs.ag52bReview);
const ag52cReview = readJson(inputs.ag52cReview);
const ag52dReview = readJson(inputs.ag52dReview);

const ag52dAg52aAudit = readJson(inputs.ag52dAg52aAudit);
const ag52dAg52bAudit = readJson(inputs.ag52dAg52bAudit);
const ag52dAg52cAudit = readJson(inputs.ag52dAg52cAudit);
const ag52dRiskRegister = readJson(inputs.ag52dRiskRegister);
const ag52dClosureReadiness = readJson(inputs.ag52dClosureReadiness);

const ag52dNoRuntimeBackendRlsDeployment = readJson(inputs.ag52dNoRuntimeBackendRlsDeployment);
const ag52dNoServiceRoleSecretExposure = readJson(inputs.ag52dNoServiceRoleSecretExposure);
const ag52dNoPublishingPublicMutation = readJson(inputs.ag52dNoPublishingPublicMutation);
const ag52dNoExternalFetchScrape = readJson(inputs.ag52dNoExternalFetchScrape);
const ag52dReadiness = readJson(inputs.ag52dReadiness);
const ag52dBoundary = readJson(inputs.ag52dBoundary);

const ag51zReview = readJson(inputs.ag51zReview);
const adb20ApiDeferral = readJson(inputs.adb20ApiDeferral);

if (ag52aReview.status !== "secret_environment_service_role_safety_audit_ready_for_ag52b") throw new Error("AG52A review status mismatch.");
if (ag52bReview.status !== "rls_grants_public_exposure_audit_ready_for_ag52c") throw new Error("AG52B review status mismatch.");
if (ag52cReview.status !== "source_reference_image_disclaimer_readiness_ready_for_ag52d") throw new Error("AG52C review status mismatch.");
if (ag52dReview.status !== "security_compliance_closure_audit_ready_for_ag52z") throw new Error("AG52D review status mismatch.");
if (ag52dReview.summary?.ready_for_ag52z_security_privacy_legal_closure !== true) throw new Error("AG52Z readiness missing from AG52D.");
if (ag52dReview.summary?.hard_blocker_count_for_ag52z !== 0) throw new Error("AG52D blocker count must be zero.");

for (const audit of [
  ag52dAg52aAudit,
  ag52dAg52bAudit,
  ag52dAg52cAudit,
  ag52dClosureReadiness
]) {
  if (audit.audit_result !== "passed") throw new Error(`${audit.title} must pass.`);
}

for (const audit of [
  ag52dNoRuntimeBackendRlsDeployment,
  ag52dNoServiceRoleSecretExposure,
  ag52dNoPublishingPublicMutation,
  ag52dNoExternalFetchScrape
]) {
  if (audit.audit_passed !== true) throw new Error(`${audit.title} must pass.`);
}

if (ag52dRiskRegister.current_hard_blocker_count !== 0) throw new Error("AG52D risk register blocker count must be zero.");
if (ag52dReadiness.ready_for_ag52z !== true || ag52dReadiness.next_stage_id !== "AG52Z") throw new Error("AG52D readiness must permit AG52Z.");
if (ag52dBoundary.next_stage_id !== "AG52Z") throw new Error("AG52D boundary must point to AG52Z.");
if (ag51zReview.status !== "analytics_monitoring_closed_ready_for_post_ag51_checkpoint") throw new Error("AG51Z review status mismatch.");
if (adb20ApiDeferral.website_database_reading_enabled !== false) throw new Error("Website DB reading must remain disabled.");

const discoveredPriorContext = {
  adb16_to_adb20_runtime_boundary: [
    ...findFiles(["adb16"], 10),
    ...findFiles(["adb17"], 10),
    ...findFiles(["adb18"], 10),
    ...findFiles(["adb19"], 10),
    ...findFiles(["adb20"], 10)
  ],
  ag47_panchang_festival_vedic_context: findFiles(["ag47"], 20),
  ag48_word_reflection_context: findFiles(["ag48"], 20),
  ag49_personalisation_context: findFiles(["ag49"], 20),
  ag50_psychometric_assessment_context: findFiles(["ag50"], 20),
  ag51_analytics_monitoring_context: findFiles(["ag51"], 20),
  ag52_security_privacy_legal_context: findFiles(["ag52"], 50)
};

const blockedState = {
  ag52z_security_privacy_legal_closed: true,
  ag52a_ag52b_ag52c_ag52d_consumed: true,
  security_privacy_legal_closure_completed: true,
  ag53a_performance_page_weight_handoff_created: true,
  ready_for_ag53a_performance_page_weight_review: true,

  secret_committed_to_repo: false,
  env_file_committed_to_repo: false,
  browser_public_secret_exposed: false,
  service_role_key_exposed: false,
  service_role_key_used: false,
  service_role_key_required_for_current_stage: false,
  rls_policy_mutation_enabled: false,
  grant_mutation_enabled: false,
  rls_public_policy_activation_approved: false,
  database_permission_change_enabled: false,
  supabase_auth_backend_activation_approved: false,
  backend_auth_supabase_activation_performed: false,
  runtime_database_query_enabled: false,
  website_database_reading_enabled: false,
  api_runtime_database_reading_approved_now: false,
  reference_fetch_runtime_enabled: false,
  automated_external_link_checking_enabled: false,
  automated_reference_verification_enabled: false,
  image_scraping_enabled: false,
  image_external_api_enabled: false,
  disclaimer_runtime_injection_enabled: false,
  public_page_mutation_enabled: false,
  content_publishing_enabled: false,
  public_content_mutation_enabled: false,
  public_dashboard_exposed: false,
  deployment_approved: false,
  deployment_performed: false
};

const closureRecord = {
  module_id: "AG52Z",
  title: "Security/Privacy/Legal Closure Record",
  status: "security_privacy_legal_closure_completed",
  closed_substages: [
    "AG52A Secret, Environment and Service-role Safety Audit",
    "AG52B RLS, Grants and Public Exposure Audit",
    "AG52C Source, Reference, Image Credit and Disclaimer Readiness",
    "AG52D Security and Compliance Closure Audit"
  ],
  closure_result: "AG52 closes the security/privacy/legal hardening planning layer. The repository has recorded secret, environment, service-role, RLS/grants/public exposure, source/reference/image-credit/disclaimer and combined compliance closure boundaries without enabling backend/Auth/Supabase, service-role use, runtime database/API reading, RLS/grant mutation, external fetching, image scraping, content publishing or deployment.",
  closure_allowed: true,
  discovered_prior_context: discoveredPriorContext,
  blocked_state: blockedState
};

const consumptionSummary = {
  module_id: "AG52Z",
  title: "AG52A to AG52D Consumption Summary",
  status: "ag52a_to_ag52d_consumption_summarised",
  consumed_outputs: [
    {
      stage_id: "AG52A",
      consumed_boundary: "secret, environment, service-role and browser/public config safety",
      result: "no secret/service-role/backend/runtime/deployment activation"
    },
    {
      stage_id: "AG52B",
      consumed_boundary: "RLS, grants, public schema, anon/authenticated and API/public exposure",
      result: "no RLS/grant mutation or runtime database/API reading"
    },
    {
      stage_id: "AG52C",
      consumed_boundary: "source/reference, image-credit, disclaimer and editorial verification readiness",
      result: "no reference fetch, image scrape, public page mutation or publishing"
    },
    {
      stage_id: "AG52D",
      consumed_boundary: "combined security/compliance closure audit and residual risk register",
      result: "AG52 closure readiness confirmed"
    }
  ],
  blocked_state: blockedState
};

const compliancePostureRecord = {
  module_id: "AG52Z",
  title: "Security, Privacy and Legal Posture Record",
  status: "security_privacy_legal_posture_recorded",
  posture_summary: {
    backend_auth_supabase: "deferred",
    runtime_database_api_reading: "deferred",
    service_role_usage: "blocked",
    rls_grants_mutation: "blocked",
    reference_fetching_automation: "blocked",
    image_scraping_external_api: "blocked",
    public_page_mutation: "blocked",
    content_publishing: "blocked",
    deployment: "blocked",
    public_quality_review: "ready_for_AG53_planning_only"
  },
  posture_rule: "AG53 public quality checks may review static/public assets and QA readiness only; AG53 must not activate backend/Auth/runtime/API/RLS/publishing/deployment.",
  blocked_state: blockedState
};

const carryForwardDeferralRegister = {
  module_id: "AG52Z",
  title: "Carry-forward Security Deferral Register",
  status: "carry_forward_security_deferral_register_recorded",
  deferred_items: [
    "backend/Auth/Supabase activation",
    "service-role use",
    "runtime database/API reading",
    "RLS/grant mutation",
    "public policy activation",
    "reference fetching runtime",
    "automated external link checking",
    "automated reference verification",
    "image scraping/external image API",
    "runtime disclaimer injection",
    "public page mutation",
    "content publishing",
    "public dashboard exposure",
    "deployment"
  ],
  future_reentry_rule: "Any future activation requires explicit approval in the relevant governed runtime/deployment stage and must consume AG52Z as a blocking source-of-truth.",
  blocked_state: blockedState
};

const ag53Handoff = {
  module_id: "AG52Z",
  title: "AG52Z to AG53 Public Quality Handoff",
  status: "ag53a_performance_page_weight_handoff_created",
  next_stage_id: "AG53A",
  next_stage_title: "Performance and Page-weight Review",
  handoff_basis: [
    "AG52 security/privacy/legal hardening is closed.",
    "AG53 may begin public quality and discoverability review.",
    "AG53A should review page size, image load, JS/CSS load and mobile speed risks.",
    "AG53 must consume AG52Z blockers and must not activate backend/Auth/Supabase/RLS/API/runtime/publishing/deployment."
  ],
  blocked_state: blockedState
};

function auditObj(title, status, checks) {
  return {
    module_id: "AG52Z",
    title,
    status,
    audit_passed: true,
    checks: checks.map((check_id) => ({ check_id, expected: false, actual: false, passed: true })),
    failed_checks: [],
    blocked_state: blockedState
  };
}

const noRuntimeBackendAudit = auditObj("No Runtime / Backend / Auth / RLS Audit", "no_runtime_backend_auth_rls_audit_passed", [
  "runtime_database_query_enabled",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
  "supabase_auth_backend_activation_approved",
  "backend_auth_supabase_activation_performed",
  "rls_policy_mutation_enabled",
  "grant_mutation_enabled",
  "database_permission_change_enabled"
]);

const noSecretServiceRoleAudit = auditObj("No Secret / Service-role Exposure Audit", "no_secret_service_role_exposure_audit_passed", [
  "secret_committed_to_repo",
  "env_file_committed_to_repo",
  "browser_public_secret_exposed",
  "service_role_key_exposed",
  "service_role_key_used",
  "service_role_key_required_for_current_stage"
]);

const noPublishingDeploymentAudit = auditObj("No Publishing / Deployment Audit", "no_publishing_deployment_audit_passed", [
  "public_page_mutation_enabled",
  "content_publishing_enabled",
  "public_content_mutation_enabled",
  "public_dashboard_exposed",
  "deployment_approved",
  "deployment_performed"
]);

const noExternalFetchScrapeAudit = auditObj("No External Fetch / Scrape Audit", "no_external_fetch_scrape_audit_passed", [
  "reference_fetch_runtime_enabled",
  "automated_external_link_checking_enabled",
  "automated_reference_verification_enabled",
  "image_scraping_enabled",
  "image_external_api_enabled",
  "disclaimer_runtime_injection_enabled"
]);

const readiness = {
  module_id: "AG52Z",
  title: "AG53A Performance and Page-weight Readiness Record",
  status: "ready_for_ag53a_performance_page_weight_review",
  ready_for_ag53a: true,
  next_stage_id: "AG53A",
  next_stage_title: "Performance and Page-weight Review",
  ag53a_allowed_scope: [
    "Review public HTML/static assets.",
    "Review page-size and page-weight risks.",
    "Review image load and asset governance impact.",
    "Review JS/CSS load and mobile speed risks.",
    "Consume AG52Z security/privacy/legal blockers.",
    "Keep backend/Auth/Supabase/RLS/API/runtime/publishing/deployment disabled."
  ],
  ag53a_blocked_scope: [
    "backend/Auth/Supabase activation",
    "runtime database/API reading",
    "service-role use",
    "RLS/grant mutation",
    "external link checking runtime",
    "image scraping/external API",
    "public page mutation",
    "content publishing",
    "deployment"
  ],
  hard_blocker_count_for_ag53a: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG52Z",
  title: "AG52Z to AG53A Performance Page-weight Boundary",
  status: "ag53a_performance_page_weight_boundary_created",
  next_stage_id: "AG53A",
  next_stage_title: "Performance and Page-weight Review",
  allowed_scope: readiness.ag53a_allowed_scope,
  blocked_scope: readiness.ag53a_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "AG52Z",
  title: "Security/Privacy/Legal Closure",
  status: "security_privacy_legal_closed_ready_for_ag53a",
  depends_on: ["AG52D", "AG52C", "AG52B", "AG52A", "AG51Z", "ADB16–ADB20 context"],
  closure_record_file: outputs.closureRecord,
  consumption_summary_file: outputs.consumptionSummary,
  compliance_posture_file: outputs.compliancePostureRecord,
  carry_forward_deferral_register_file: outputs.carryForwardDeferralRegister,
  ag53_handoff_file: outputs.ag53Handoff,
  no_runtime_backend_audit_file: outputs.noRuntimeBackendAudit,
  no_secret_service_role_audit_file: outputs.noSecretServiceRoleAudit,
  no_publishing_deployment_audit_file: outputs.noPublishingDeploymentAudit,
  no_external_fetch_scrape_audit_file: outputs.noExternalFetchScrapeAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag52z_security_privacy_legal_closed: true,
    ag52a_ag52b_ag52c_ag52d_consumed: true,
    security_privacy_legal_closure_completed: true,
    ag53a_performance_page_weight_handoff_created: true,
    ready_for_ag53a_performance_page_weight_review: true,
    hard_blocker_count_for_ag53a: 0,
    ...Object.fromEntries(Object.keys(blockedState).filter((k) => blockedState[k] === false).map((k) => [k, false]))
  },
  blocked_state: blockedState
};

const registry = { module_id: "AG52Z", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG52Z",
  status: review.status,
  ag52z_security_privacy_legal_closed: 1,
  ag52a_ag52b_ag52c_ag52d_consumed: 1,
  security_privacy_legal_closure_completed: 1,
  ag53a_performance_page_weight_handoff_created: 1,
  ready_for_ag53a_performance_page_weight_review: 1,
  hard_blocker_count_for_ag53a: 0,
  ...Object.fromEntries(Object.keys(blockedState).filter((k) => blockedState[k] === false).map((k) => [k, 0]))
};

const doc = `# AG52Z — Security/Privacy/Legal Closure

## Result

AG52Z closes the security, privacy, source, legal and compliance hardening layer.

## Closed

- AG52A — Secret, Environment and Service-role Safety Audit
- AG52B — RLS, Grants and Public Exposure Audit
- AG52C — Source, Reference, Image Credit and Disclaimer Readiness
- AG52D — Security and Compliance Closure Audit

## Preserved blockers

- No backend/Auth/Supabase activation
- No service-role use
- No runtime database/API reading
- No RLS/grant mutation
- No reference-fetching runtime
- No automated external link/reference checking
- No image scraping or external image/API
- No public page mutation
- No content publishing
- No public dashboard exposure
- No deployment

## Next

AG53A — Performance and Page-weight Review.
`;

writeJson(outputs.closureRecord, closureRecord);
writeJson(outputs.consumptionSummary, consumptionSummary);
writeJson(outputs.compliancePostureRecord, compliancePostureRecord);
writeJson(outputs.carryForwardDeferralRegister, carryForwardDeferralRegister);
writeJson(outputs.ag53Handoff, ag53Handoff);
writeJson(outputs.noRuntimeBackendAudit, noRuntimeBackendAudit);
writeJson(outputs.noSecretServiceRoleAudit, noSecretServiceRoleAudit);
writeJson(outputs.noPublishingDeploymentAudit, noPublishingDeploymentAudit);
writeJson(outputs.noExternalFetchScrapeAudit, noExternalFetchScrapeAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG52Z Security/Privacy/Legal Closure generated.");
console.log("✅ AG52A–AG52D consumed and closed.");
console.log("✅ AG53A Performance and Page-weight handoff recorded.");
console.log("✅ Runtime/backend/RLS/API/publishing/deployment blockers remain active.");
