import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag14bReview: "data/content-intelligence/quality-reviews/ag14b-admin-editor-login-ui-scaffold.json",
  ag14bApply: "data/content-intelligence/apply-records/ag14b-admin-editor-login-ui-scaffold-apply.json",
  ag14bInventory: "data/content-intelligence/admin-architecture/ag14b-admin-editor-ui-page-inventory.json",
  ag14bQueueRendering: "data/content-intelligence/admin-architecture/ag14b-static-readonly-queue-rendering-record.json",
  ag14bReadiness: "data/content-intelligence/quality-registry/ag14b-admin-editor-ui-scaffold-readiness-record.json",
  ag14bBoundary: "data/content-intelligence/mutation-plans/ag14b-to-ag14c-admin-editor-ui-scaffold-audit-boundary.json",
  ag14aArchitecture: "data/content-intelligence/admin-architecture/ag14a-admin-editor-review-publishing-control-architecture.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag14c-admin-editor-ui-scaffold-route-separation-audit.json");
const auditPath = path.join(root, "data/content-intelligence/audit-records/ag14c-admin-editor-ui-scaffold-route-separation-audit-report.json");
const separationPath = path.join(root, "data/content-intelligence/admin-architecture/ag14c-public-signin-internal-admin-route-separation-record.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag14c-route-separation-refinement-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag14c-to-ag14d-public-signin-internal-admin-route-separation-apply-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/admin-editor-ui-scaffold-route-separation-audit.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag14c-admin-editor-ui-scaffold-route-separation-audit-learning.json");
const registryPath = path.join(root, "data/quality/ag14c-admin-editor-ui-scaffold-route-separation-audit.json");
const previewPath = path.join(root, "data/quality/ag14c-admin-editor-ui-scaffold-route-separation-audit-preview.json");
const docPath = path.join(root, "docs/quality/AG14C_ADMIN_EDITOR_UI_SCAFFOLD_ROUTE_SEPARATION_AUDIT.md");

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

function readTextIfExists(relativePath) {
  const full = path.join(root, relativePath);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
}

function listRootHtmlFiles() {
  return fs.readdirSync(root)
    .filter((name) => name.endsWith(".html"))
    .filter((name) => fs.statSync(path.join(root, name)).isFile());
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) throw new Error(`Missing AG14C input ${name}: ${relativePath}`);
}

const ag14bReview = readJson(inputs.ag14bReview);
const ag14bApply = readJson(inputs.ag14bApply);
const ag14bInventory = readJson(inputs.ag14bInventory);
const ag14bReadiness = readJson(inputs.ag14bReadiness);
const ag14bBoundary = readJson(inputs.ag14bBoundary);
const ag14aArchitecture = readJson(inputs.ag14aArchitecture);

if (ag14bReview.status !== "admin_editor_login_ui_scaffold_created_pending_audit") {
  throw new Error("AG14C requires AG14B review.");
}
if (ag14bReadiness.ready_for_ag14c !== true) {
  throw new Error("AG14C requires AG14B readiness.");
}
if (ag14bBoundary.next_stage_id !== "AG14C" || ag14bBoundary.explicit_approval_required !== true) {
  throw new Error("AG14C requires AG14B to AG14C explicit boundary.");
}

const requiredUiPages = [
  "admin.html",
  "admin-dashboard.html",
  "editor-dashboard.html",
  "editor-create.html",
  "editor-correction.html"
];

const pageFindings = requiredUiPages.map((page) => {
  const html = readTextIfExists(page);
  return {
    page,
    exists: exists(page),
    hash: exists(page) ? sha256(html) : null,
    has_scaffold_marker: html.includes('data-drishvara-admin-ui="ag14b-scaffold"'),
    has_noindex: html.includes('name="robots" content="noindex,nofollow"'),
    has_scaffold_auth_mode: html.includes('data-auth-mode="scaffold-only"'),
    has_real_auth_signals: /supabase|signInWithPassword|localStorage|sessionStorage|document\.cookie|bcrypt|passwordHash|createUser/i.test(html),
    has_hardcoded_bootstrap_identifier: /admin@drishvara\.internal|editor@drishvara\.internal/i.test(html),
    has_disabled_actions: page === "admin-dashboard.html"
      ? html.includes("disabled data-admin-action")
      : page.startsWith("editor-")
        ? html.includes("disabled data-editor-action") || page === "editor-dashboard.html"
        : html.includes("disabled data-auth-action")
  };
});

const rootHtmlFiles = listRootHtmlFiles();
const publicHtmlFiles = rootHtmlFiles.filter((name) => !requiredUiPages.includes(name));
const publicNavigationScan = publicHtmlFiles.map((file) => {
  const html = readTextIfExists(file);
  return {
    file,
    references_admin_html: /href=["']admin\.html["']/i.test(html),
    references_admin_dashboard: /href=["']admin-dashboard\.html["']/i.test(html),
    references_editor_dashboard: /href=["']editor-dashboard\.html["']/i.test(html),
    has_signin_join_text: /sign\s*in|join/i.test(html),
    references_public_signin: /href=["'](?:signin|sign-in|join)\.html["']/i.test(html)
  };
});

const publicSigninCandidates = ["signin.html", "sign-in.html", "join.html"];
const existingPublicSigninCandidates = publicSigninCandidates.filter((file) => exists(file));
const hasSeparatePublicSigninPage = existingPublicSigninCandidates.some((file) => {
  const html = readTextIfExists(file);
  return !html.includes('data-drishvara-admin-ui="ag14b-scaffold"');
});

const publicNavReferencesInternalAdmin = publicNavigationScan.some(
  (scan) => scan.references_admin_html || scan.references_admin_dashboard || scan.references_editor_dashboard
);

const anyCredentialRisk = pageFindings.some(
  (finding) => finding.has_real_auth_signals || finding.has_hardcoded_bootstrap_identifier
);

const allPagesExist = pageFindings.every((finding) => finding.exists);
const allScaffoldMarked = pageFindings.every((finding) => finding.has_scaffold_marker);
const allNoindex = pageFindings.every((finding) => finding.has_noindex);
const allDisabled = pageFindings.every((finding) => finding.has_disabled_actions);

const routeSeparationRequired = true;

const stageControls = {
  admin_editor_ui_scaffold_route_separation_audit_only: true,
  ui_scaffold_audited_in_ag14c: true,
  route_separation_audited_in_ag14c: true,
  public_signin_separation_decision_recorded_in_ag14c: true,
  ag14d_boundary_created_in_ag14c: true,

  article_mutation_performed_in_ag14c: false,
  page_mutation_performed_in_ag14c: false,
  login_page_created_in_ag14c: false,
  signin_page_created_in_ag14c: false,
  real_credential_created_in_ag14c: false,
  hardcoded_password_created_in_ag14c: false,
  auth_activation_performed_in_ag14c: false,
  backend_activation_performed_in_ag14c: false,
  supabase_activation_performed_in_ag14c: false,
  database_write_performed_in_ag14c: false,
  public_visibility_switch_performed_in_ag14c: false,
  public_publishing_operation_performed_in_ag14c: false,
  deployment_trigger_performed_in_ag14c: false
};

const auditChecks = [
  {
    check_id: "AG14C-AUDIT-001",
    area: "ui_pages_exist",
    status: allPagesExist ? "passed" : "failed",
    note: "All five AG14B scaffold pages must exist."
  },
  {
    check_id: "AG14C-AUDIT-002",
    area: "scaffold_marker",
    status: allScaffoldMarked ? "passed" : "failed",
    note: "All Admin/Editor scaffold pages must carry AG14B scaffold marker."
  },
  {
    check_id: "AG14C-AUDIT-003",
    area: "noindex_boundary",
    status: allNoindex ? "passed" : "failed",
    note: "Admin/Editor scaffold pages must be noindex/nofollow."
  },
  {
    check_id: "AG14C-AUDIT-004",
    area: "credential_safety",
    status: !anyCredentialRisk ? "passed" : "failed",
    note: "No real credentials, bootstrap identifiers, password hashes or auth implementation should appear in scaffold pages."
  },
  {
    check_id: "AG14C-AUDIT-005",
    area: "disabled_actions",
    status: allDisabled ? "passed" : "failed",
    note: "Admin/Editor action buttons should remain disabled scaffold actions."
  },
  {
    check_id: "AG14C-AUDIT-006",
    area: "public_route_product_positioning",
    status: "refinement_required",
    note: "Product decision: public Sign in / Join must be separate from internal Admin/Editor route."
  },
  {
    check_id: "AG14C-AUDIT-007",
    area: "public_nav_internal_admin_exposure",
    status: publicNavReferencesInternalAdmin ? "refinement_required" : "passed",
    note: publicNavReferencesInternalAdmin
      ? "One or more public pages reference internal Admin/Editor route."
      : "No direct public navigation reference to internal Admin/Editor route was detected in scanned root HTML files."
  },
  {
    check_id: "AG14C-AUDIT-008",
    area: "separate_public_signin_page",
    status: hasSeparatePublicSigninPage ? "passed" : "refinement_required",
    note: hasSeparatePublicSigninPage
      ? `Separate public sign-in/join page exists: ${existingPublicSigninCandidates.join(", ")}`
      : "Separate public Sign in / Join page should be created/restored in AG14D."
  },
  {
    check_id: "AG14C-AUDIT-009",
    area: "forbidden_mutation_guards",
    status: "passed",
    note: "AG14C is audit only and does not mutate pages."
  }
];

const failedChecks = auditChecks.filter((check) => check.status === "failed");
if (failedChecks.length > 0) {
  throw new Error(`AG14C audit failed: ${failedChecks.map((check) => check.check_id).join(", ")}`);
}

const refinementChecks = auditChecks.filter((check) => check.status === "refinement_required");

const separationRecord = {
  module_id: "AG14C",
  title: "Public Sign-in and Internal Admin Route Separation Record",
  status: "public_signin_internal_admin_route_separation_refinement_required",
  product_decision: {
    public_signin_join_route: "signin.html",
    internal_admin_route: "admin.html",
    admin_dashboard_route: "admin-dashboard.html",
    editor_dashboard_route: "editor-dashboard.html",
    decision: "Keep public visitor Sign in / Join separate from internal Admin/Editor console.",
    rationale: [
      "Public Sign in / Join supports future subscriber/member positioning.",
      "Admin/Editor console is back-office publishing control and should not be public-nav facing.",
      "Internal routes should stay noindex/nofollow and hidden from normal public navigation."
    ]
  },
  current_findings: {
    existing_public_signin_candidates: existingPublicSigninCandidates,
    has_separate_public_signin_page: hasSeparatePublicSigninPage,
    public_nav_references_internal_admin: publicNavReferencesInternalAdmin,
    scanned_public_html_files: publicNavigationScan,
    admin_editor_pages: pageFindings
  },
  required_ag14d_treatment: [
    "Create or restore signin.html as public visitor/member Sign in / Join preview page.",
    "Keep admin.html as internal Admin/Editor access route.",
    "Ensure public nav Sign in / Join points to signin.html, not admin.html.",
    "Keep admin/editor routes noindex/nofollow.",
    "Do not activate real authentication, credentials, backend, Supabase or publishing."
  ],
  ...stageControls
};

const auditReport = {
  module_id: "AG14C",
  title: "Admin Editor UI Scaffold Route Separation Audit Report",
  status: "ui_scaffold_audit_passed_route_separation_refinement_required",
  checks: auditChecks,
  failed_checks: failedChecks,
  refinement_required_checks: refinementChecks,
  audit_summary: {
    total_checks: auditChecks.length,
    passed: auditChecks.filter((check) => check.status === "passed").length,
    refinement_required: refinementChecks.length,
    failed: failedChecks.length
  },
  decision: {
    ui_scaffold_integrity_passed: true,
    credential_safety_passed: true,
    route_separation_required: routeSeparationRequired,
    ready_for_ag14d_route_separation_apply: true
  },
  ...stageControls
};

const readiness = {
  module_id: "AG14C",
  title: "Route Separation Refinement Readiness Record",
  status: "ready_for_ag14d_public_signin_internal_admin_route_separation_apply",
  ready_for_ag14d: true,
  ag14d_explicit_approval_required: true,
  route_separation_required: true,
  publish_ready: false,
  real_auth_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  reason: "AG14C confirms UI scaffold is safe but product route separation must be applied before workflow action modelling.",
  ...stageControls
};

const boundary = {
  module_id: "AG14C",
  title: "AG14C to AG14D Public Sign-in Internal Admin Route Separation Apply Boundary",
  status: "ag14d_boundary_created_not_started",
  next_stage_id: "AG14D",
  next_stage_title: "Public Sign-in and Internal Admin Route Separation Apply",
  explicit_approval_required: true,
  ag14d_allowed_scope: [
    "Create or restore public signin.html page.",
    "Keep admin.html as internal Admin/Editor access page.",
    "Update public navigation Sign in / Join links to signin.html where required.",
    "Keep Admin/Editor pages noindex/nofollow.",
    "Record pre/post file hashes and rollback readiness."
  ],
  ag14d_blocked_scope: [
    "No real credential creation.",
    "No hardcoded passwords.",
    "No Auth/backend/Supabase activation.",
    "No article publishing.",
    "No public visibility switch for article candidates."
  ],
  ...stageControls
};

const schema = {
  module_id: "AG14C",
  title: "Admin Editor UI Scaffold Route Separation Audit Schema",
  status: "schema_admin_editor_ui_scaffold_route_separation_audit_only",
  ui_scaffold_audit_allowed_in_ag14c: true,
  route_separation_audit_allowed_in_ag14c: true,
  product_positioning_decision_allowed_in_ag14c: true,
  ag14d_boundary_allowed_in_ag14c: true,

  page_mutation_allowed_in_ag14c: false,
  login_page_creation_allowed_in_ag14c: false,
  signin_page_creation_allowed_in_ag14c: false,
  real_credential_creation_allowed_in_ag14c: false,
  hardcoded_password_allowed_in_ag14c: false,
  auth_activation_allowed_in_ag14c: false,
  backend_activation_allowed_in_ag14c: false,
  supabase_activation_allowed_in_ag14c: false,
  public_publishing_operation_allowed_in_ag14c: false,
  ...stageControls
};

const review = {
  module_id: "AG14C",
  title: "Admin Editor UI Scaffold Route Separation Audit",
  status: "ui_scaffold_audit_passed_route_separation_refinement_required",
  depends_on: ["AG14B"],
  generated_from: inputs,
  audit_report_file: "data/content-intelligence/audit-records/ag14c-admin-editor-ui-scaffold-route-separation-audit-report.json",
  separation_record_file: "data/content-intelligence/admin-architecture/ag14c-public-signin-internal-admin-route-separation-record.json",
  readiness_file: "data/content-intelligence/quality-registry/ag14c-route-separation-refinement-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag14c-to-ag14d-public-signin-internal-admin-route-separation-apply-boundary.json",
  schema_file: "data/content-intelligence/schema/admin-editor-ui-scaffold-route-separation-audit.schema.json",
  summary: {
    ui_scaffold_integrity_passed: true,
    route_separation_required: true,
    public_signin_route_decision: "signin.html",
    internal_admin_route_decision: "admin.html",
    ready_for_ag14d: true,
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG14C",
  title: "Admin Editor UI Scaffold Route Separation Audit Learning",
  status: "learning_record_only",
  learning_points: [
    "Public Sign in / Join should be a product/member route, not an internal Admin/Editor route.",
    "Admin/Editor pages should remain hidden from normal public navigation and noindex/nofollow.",
    "Route separation should be applied before building action models.",
    "Scaffold UI can be public-file based, but real authentication must remain outside public code.",
    "Future generated articles should enter Admin Review Queue without exposing internal console in public navigation."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG14C",
  title: "Admin Editor UI Scaffold Route Separation Audit",
  status: "ui_scaffold_audit_passed_route_separation_refinement_required",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag14c-admin-editor-ui-scaffold-route-separation-audit.json",
    audit_report: "data/content-intelligence/audit-records/ag14c-admin-editor-ui-scaffold-route-separation-audit-report.json",
    separation_record: "data/content-intelligence/admin-architecture/ag14c-public-signin-internal-admin-route-separation-record.json",
    readiness: "data/content-intelligence/quality-registry/ag14c-route-separation-refinement-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag14c-to-ag14d-public-signin-internal-admin-route-separation-apply-boundary.json",
    schema: "data/content-intelligence/schema/admin-editor-ui-scaffold-route-separation-audit.schema.json",
    learning: "data/content-intelligence/learning/ag14c-admin-editor-ui-scaffold-route-separation-audit-learning.json",
    preview: "data/quality/ag14c-admin-editor-ui-scaffold-route-separation-audit-preview.json",
    document: "docs/quality/AG14C_ADMIN_EDITOR_UI_SCAFFOLD_ROUTE_SEPARATION_AUDIT.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG14C",
  preview_only: true,
  status: "ui_scaffold_audit_passed_route_separation_refinement_required",
  public_signin_route_decision: "signin.html",
  internal_admin_route_decision: "admin.html",
  route_separation_required: true,
  ready_for_ag14d: true,
  next_stage: boundary,
  ...stageControls
};

const doc = `# AG14C — Admin Editor UI Scaffold Route Separation Audit

## Purpose

AG14C audits the Admin/Editor scaffold and records the product route-separation decision.

AG14C is audit only. It does not mutate pages, create sign-in pages, activate authentication, create credentials, activate backend/Supabase, switch public visibility or publish anything.

## Product Decision

Public Sign in / Join and internal Admin/Editor access must remain separate.

- Public route: /signin.html
- Internal Admin/Editor route: /admin.html

## Audit Result

The Admin/Editor UI scaffold passed safety checks. Route separation refinement is required so public visitors are not sent to the internal Admin/Editor console.

## Next Stage

AG14D — Public Sign-in and Internal Admin Route Separation Apply — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(auditPath, auditReport);
writeJson(separationPath, separationRecord);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG14C Admin Editor UI Scaffold Route Separation Audit generated.");
console.log("✅ Admin/Editor scaffold safety audited.");
console.log("✅ Product decision recorded: public Sign in / Join must be separate from internal Admin/Editor access.");
console.log("✅ Public route decision: signin.html");
console.log("✅ Internal route decision: admin.html");
console.log("✅ Route separation refinement required and AG14D boundary created.");
console.log("✅ No page mutation, credential creation, Auth/backend/Supabase activation or publishing performed.");
