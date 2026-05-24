import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag13zReview: "data/content-intelligence/quality-reviews/ag13z-final-live-verification-admin-review-handoff-closure.json",
  ag13zClosure: "data/content-intelligence/closure-records/ag13z-final-live-verification-admin-review-handoff-closure.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",
  ag13zQueueIndex: "data/admin-review/index/admin-review-queue-index.json",
  ag13zReadiness: "data/content-intelligence/quality-registry/ag13z-admin-review-handoff-readiness-record.json",
  ag13zBoundary: "data/content-intelligence/mutation-plans/ag13z-to-ag14a-admin-review-queue-architecture-boundary.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag14a-admin-editor-login-role-credential-architecture.json");
const architecturePath = path.join(root, "data/content-intelligence/admin-architecture/ag14a-admin-editor-review-publishing-control-architecture.json");
const credentialDoctrinePath = path.join(root, "data/content-intelligence/admin-architecture/ag14a-bootstrap-credential-first-login-doctrine.json");
const roleRightsPath = path.join(root, "data/content-intelligence/admin-architecture/ag14a-admin-editor-role-rights-matrix.json");
const workflowPath = path.join(root, "data/content-intelligence/admin-architecture/ag14a-admin-editor-workflow-state-model.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag14a-admin-editor-architecture-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag14a-to-ag14b-admin-editor-login-ui-scaffold-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/admin-editor-login-role-credential-architecture.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag14a-admin-editor-login-role-credential-architecture-learning.json");
const registryPath = path.join(root, "data/quality/ag14a-admin-editor-login-role-credential-architecture.json");
const previewPath = path.join(root, "data/quality/ag14a-admin-editor-login-role-credential-architecture-preview.json");
const docPath = path.join(root, "docs/quality/AG14A_ADMIN_EDITOR_LOGIN_ROLE_CREDENTIAL_ARCHITECTURE.md");

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

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) throw new Error(`Missing AG14A input ${name}: ${relativePath}`);
}

const ag13zReview = readJson(inputs.ag13zReview);
const ag13zClosure = readJson(inputs.ag13zClosure);
const ag13zCandidate = readJson(inputs.ag13zCandidate);
const ag13zQueueIndex = readJson(inputs.ag13zQueueIndex);
const ag13zReadiness = readJson(inputs.ag13zReadiness);
const ag13zBoundary = readJson(inputs.ag13zBoundary);

if (ag13zReview.status !== "final_live_verification_closed_admin_review_handoff_created") {
  throw new Error("AG14A requires AG13Z review closure.");
}
if (ag13zReadiness.ready_for_ag14a !== true) {
  throw new Error("AG14A requires AG13Z readiness.");
}
if (ag13zBoundary.next_stage_id !== "AG14A" || ag13zBoundary.explicit_approval_required !== true) {
  throw new Error("AG14A requires AG13Z to AG14A explicit boundary.");
}
if (ag13zCandidate.status !== "ready_for_admin_review") {
  throw new Error("AG14A requires seeded Admin Review candidate.");
}

const selectedArticlePath = ag13zCandidate.selected_article_path;
if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);

const articleHash = sha256(fs.readFileSync(path.join(root, selectedArticlePath), "utf8"));

if (articleHash !== ag13zCandidate.article_hash) {
  throw new Error("AG14A requires selected article hash to match AG13Z candidate hash.");
}

const stageControls = {
  admin_editor_login_role_credential_architecture_only: true,
  admin_editor_roles_defined_in_ag14a: true,
  bootstrap_credential_doctrine_defined_in_ag14a: true,
  first_login_reset_doctrine_defined_in_ag14a: true,
  admin_editor_workflow_defined_in_ag14a: true,
  ag14b_boundary_created_in_ag14a: true,
  selected_article_read_performed: true,

  login_page_created_in_ag14a: false,
  dashboard_page_created_in_ag14a: false,
  credential_created_in_public_code_in_ag14a: false,
  hardcoded_password_created_in_ag14a: false,
  password_hash_created_in_repo_in_ag14a: false,
  auth_activation_performed_in_ag14a: false,
  backend_activation_performed_in_ag14a: false,
  supabase_activation_performed_in_ag14a: false,
  database_write_performed_in_ag14a: false,
  article_mutation_performed_in_ag14a: false,
  public_visibility_switch_performed_in_ag14a: false,
  object_generation_performed_in_ag14a: false,
  object_insertion_performed_in_ag14a: false,
  object_removal_performed_in_ag14a: false,
  css_file_mutation_performed_in_ag14a: false,
  js_file_mutation_performed_in_ag14a: false,
  deployment_trigger_performed_in_ag14a: false,
  public_publishing_operation_performed_in_ag14a: false
};

const credentialDoctrine = {
  module_id: "AG14A",
  title: "Bootstrap Credential and First Login Doctrine",
  status: "bootstrap_credential_doctrine_defined_no_credentials_created",
  credential_principle: "Initial Admin and Editor credentials may exist only as secure bootstrap credentials outside public repository code.",
  bootstrap_identity_placeholders: [
    {
      role: "admin",
      login_identifier_placeholder: "admin@drishvara.internal",
      real_credential_storage: "environment_secret_or_server_side_auth_provider_only",
      first_login_password_reset_required: true,
      can_reset_editor_access: true,
      can_publish: true
    },
    {
      role: "editor",
      login_identifier_placeholder: "editor@drishvara.internal",
      real_credential_storage: "environment_secret_or_server_side_auth_provider_only",
      first_login_password_reset_required: true,
      can_reset_editor_access: false,
      can_publish: false
    }
  ],
  prohibited_credential_practices: [
    "No hardcoded password in HTML.",
    "No hardcoded password in JavaScript.",
    "No GitHub token in browser-side code.",
    "No real password or password hash committed to repository.",
    "No fake login represented as real security."
  ],
  first_login_required_flow: [
    "Bootstrap login accepted by secure auth layer.",
    "User is immediately forced to change password.",
    "Temporary bootstrap credential is invalidated.",
    "First-login completion is recorded.",
    "Role permissions are applied after reset."
  ],
  future_secure_auth_options: [
    "GitHub-backed static admin workflow with server-side action proxy.",
    "Supabase Auth with admin/editor role table.",
    "Hybrid static queue first, Supabase/Auth activation later."
  ],
  selected_recommendation_for_next_stage: "Design UI scaffold first; keep real authentication and credential storage blocked until explicitly approved.",
  ...stageControls
};

const roleRights = {
  module_id: "AG14A",
  title: "Admin and Editor Role Rights Matrix",
  status: "admin_editor_role_rights_defined",
  roles: [
    {
      role: "admin",
      purpose: "Final publishing authority and queue governance.",
      allowed_rights: [
        "View all Admin Review candidates.",
        "View publish-readiness score, hard blockers, warnings and remarks.",
        "Preview article in live-site style.",
        "Archive article.",
        "Return article for correction.",
        "Publish article.",
        "Publish and close article.",
        "View audit trail.",
        "Reset editor access after secure auth is activated."
      ],
      blocked_rights: [
        "No direct credential hardcoding.",
        "No bypass of audit trail.",
        "No backend/Auth/Supabase activation without separate approval."
      ]
    },
    {
      role: "editor",
      purpose: "Manual article creation and correction workspace.",
      allowed_rights: [
        "Create new manual article.",
        "Save manual article draft.",
        "Edit returned article.",
        "Edit title, subtitle, category, tags and article body.",
        "Add/edit references, captions, credits and alt text.",
        "Preview desktop and mobile layout.",
        "Submit article to Admin.",
        "Resubmit corrected article to Admin."
      ],
      blocked_rights: [
        "Cannot publish.",
        "Cannot publish and close.",
        "Cannot approve public visibility.",
        "Cannot archive final record unless Admin grants it later.",
        "Cannot reset Admin credential."
      ]
    }
  ],
  admin_actions: [
    "archive",
    "return_for_correction",
    "publish",
    "publish_and_close"
  ],
  editor_actions: [
    "create_manual_article",
    "save_draft",
    "edit_returned_article",
    "preview",
    "submit_to_admin",
    "resubmit_to_admin"
  ],
  ...stageControls
};

const workflow = {
  module_id: "AG14A",
  title: "Admin and Editor Workflow State Model",
  status: "admin_editor_workflow_state_model_defined",
  entry_routes: [
    {
      route: "pipeline_generated_article",
      state_flow: [
        "pipeline_verified",
        "ready_for_admin_review",
        "admin_decision_pending"
      ]
    },
    {
      route: "editor_manual_article",
      state_flow: [
        "editor_draft",
        "submitted_to_admin",
        "ready_for_admin_review",
        "admin_decision_pending"
      ]
    },
    {
      route: "returned_for_correction",
      state_flow: [
        "returned_for_correction",
        "editor_revision",
        "resubmitted_to_admin",
        "ready_for_admin_review"
      ]
    }
  ],
  visibility_states: [
    {
      state: "admin_only",
      public_visibility: false,
      meaning: "Visible in Admin/Editor workspace only."
    },
    {
      state: "returned_for_correction",
      public_visibility: false,
      meaning: "Visible to Editor for correction and to Admin for audit trail."
    },
    {
      state: "archived",
      public_visibility: false,
      meaning: "Not public, retained for intelligence, audit and reuse."
    },
    {
      state: "published",
      public_visibility: true,
      meaning: "Publicly visible after Admin approval."
    },
    {
      state: "published_closed",
      public_visibility: true,
      meaning: "Published and removed from pending workflow queue."
    }
  ],
  audit_trail_required_fields: [
    "article_id",
    "version",
    "actor_role",
    "actor_identifier",
    "action",
    "decision_remarks",
    "timestamp",
    "pre_action_hash",
    "post_action_hash",
    "previous_status",
    "new_status"
  ],
  versioning_model: [
    "v1_pipeline_or_editor_original",
    "v2_editor_correction",
    "v3_additional_revision_if_returned_again"
  ],
  ...stageControls
};

const architecture = {
  module_id: "AG14A",
  title: "Admin Review Queue and Publishing Control Architecture",
  status: "admin_editor_login_role_credential_architecture_defined",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag14a: articleHash,
  current_seed_candidate: {
    article_id: ag13zCandidate.article_id,
    title: ag13zCandidate.title,
    status: ag13zCandidate.status,
    publish_readiness_score: ag13zCandidate.publish_readiness_score,
    public_visibility: ag13zCandidate.public_visibility,
    publish_approved: ag13zCandidate.publish_approved
  },
  planned_routes: {
    public_sign_in_join_page: "Keep for public/member-facing future use. Do not mix Admin login here.",
    admin_login_route: "/admin.html",
    admin_dashboard_route: "/admin-dashboard.html",
    editor_dashboard_route: "/editor-dashboard.html",
    editor_manual_create_route: "/editor-create.html",
    editor_correction_route: "/editor-correction.html"
  },
  design_principles: [
    "Admin and Editor UI should use current Drishvara dark navy/gold visual language.",
    "Admin route should be hidden from public navigation initially.",
    "Admin/Editor login UI may be scaffolded before real auth activation.",
    "Real credentials must be stored outside repository code.",
    "Admin alone controls public visibility.",
    "Editor can manually create and correct content but cannot publish."
  ],
  preferred_implementation_path: "Static/GitHub-backed queue architecture first; Supabase/Auth activation later only after explicit approval.",
  ...stageControls
};

const readiness = {
  module_id: "AG14A",
  title: "Admin Editor Architecture Readiness Record",
  status: "ready_for_ag14b_admin_editor_login_ui_scaffold",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag14a: articleHash,
  ready_for_ag14b: true,
  ag14b_explicit_approval_required: true,
  real_auth_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  publish_ready: false,
  reason_blocked: "AG14A is architecture only. AG14B may create UI scaffold, but real authentication and credential storage remain blocked pending separate approval.",
  ...stageControls
};

const boundary = {
  module_id: "AG14A",
  title: "AG14A to AG14B Admin Editor Login UI Scaffold Boundary",
  status: "ag14b_boundary_created_not_started",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag14a: articleHash,
  next_stage_id: "AG14B",
  next_stage_title: "Admin and Editor Login UI Scaffold",
  explicit_approval_required: true,
  ag14b_allowed_scope: [
    "Create visual Admin/Editor login UI scaffold.",
    "Create Admin dashboard preview scaffold.",
    "Create Editor dashboard/manual-creation/correction preview scaffold.",
    "Use current Drishvara visual style.",
    "Use placeholder bootstrap credential doctrine text only.",
    "No real credentials in repository."
  ],
  ag14b_blocked_scope: [
    "No real credential generation.",
    "No hardcoded password.",
    "No Auth/backend/Supabase activation.",
    "No database write.",
    "No article publishing.",
    "No public visibility switch."
  ],
  ...stageControls
};

const schema = {
  module_id: "AG14A",
  title: "Admin Editor Login Role Credential Architecture Schema",
  status: "schema_admin_editor_login_role_credential_architecture_only",
  architecture_allowed_in_ag14a: true,
  credential_doctrine_allowed_in_ag14a: true,
  role_rights_matrix_allowed_in_ag14a: true,
  workflow_state_model_allowed_in_ag14a: true,
  ag14b_boundary_allowed_in_ag14a: true,

  login_page_creation_allowed_in_ag14a: false,
  real_credential_creation_allowed_in_ag14a: false,
  hardcoded_password_allowed_in_ag14a: false,
  password_hash_commit_allowed_in_ag14a: false,
  auth_activation_allowed_in_ag14a: false,
  backend_activation_allowed_in_ag14a: false,
  supabase_activation_allowed_in_ag14a: false,
  article_mutation_allowed_in_ag14a: false,
  public_visibility_switch_allowed_in_ag14a: false,
  public_publishing_operation_allowed_in_ag14a: false,
  ...stageControls
};

const review = {
  module_id: "AG14A",
  title: "Admin + Editor Login, Role and Credential Architecture",
  status: "admin_editor_login_role_credential_architecture_defined",
  depends_on: ["AG13Z"],
  generated_from: inputs,
  architecture_file: "data/content-intelligence/admin-architecture/ag14a-admin-editor-review-publishing-control-architecture.json",
  credential_doctrine_file: "data/content-intelligence/admin-architecture/ag14a-bootstrap-credential-first-login-doctrine.json",
  role_rights_file: "data/content-intelligence/admin-architecture/ag14a-admin-editor-role-rights-matrix.json",
  workflow_file: "data/content-intelligence/admin-architecture/ag14a-admin-editor-workflow-state-model.json",
  readiness_file: "data/content-intelligence/quality-registry/ag14a-admin-editor-architecture-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag14a-to-ag14b-admin-editor-login-ui-scaffold-boundary.json",
  schema_file: "data/content-intelligence/schema/admin-editor-login-role-credential-architecture.schema.json",
  summary: {
    selected_article_path: selectedArticlePath,
    article_hash_at_ag14a: articleHash,
    admin_role_defined: true,
    editor_role_defined: true,
    bootstrap_credential_doctrine_defined: true,
    real_credentials_created: false,
    ready_for_ag14b: true,
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG14A",
  title: "Admin Editor Login Role Credential Architecture Learning",
  status: "learning_record_only",
  learning_points: [
    "Admin and Editor roles must be separate: Editor can create/correct, Admin alone can publish.",
    "Bootstrap credentials are acceptable only if stored outside public repository code and forced to reset on first login.",
    "Manual editor-created articles should enter Admin Review just like pipeline-generated articles.",
    "Return for correction should open manual editor correction workspace, not automatic AI regeneration.",
    "Static/GitHub-backed queue can be used first, with Supabase/Auth activation deferred."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG14A",
  title: "Admin + Editor Login, Role and Credential Architecture",
  status: "admin_editor_login_role_credential_architecture_defined",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag14a-admin-editor-login-role-credential-architecture.json",
    architecture: "data/content-intelligence/admin-architecture/ag14a-admin-editor-review-publishing-control-architecture.json",
    credential_doctrine: "data/content-intelligence/admin-architecture/ag14a-bootstrap-credential-first-login-doctrine.json",
    role_rights: "data/content-intelligence/admin-architecture/ag14a-admin-editor-role-rights-matrix.json",
    workflow: "data/content-intelligence/admin-architecture/ag14a-admin-editor-workflow-state-model.json",
    readiness: "data/content-intelligence/quality-registry/ag14a-admin-editor-architecture-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag14a-to-ag14b-admin-editor-login-ui-scaffold-boundary.json",
    schema: "data/content-intelligence/schema/admin-editor-login-role-credential-architecture.schema.json",
    learning: "data/content-intelligence/learning/ag14a-admin-editor-login-role-credential-architecture-learning.json",
    preview: "data/quality/ag14a-admin-editor-login-role-credential-architecture-preview.json",
    document: "docs/quality/AG14A_ADMIN_EDITOR_LOGIN_ROLE_CREDENTIAL_ARCHITECTURE.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG14A",
  preview_only: true,
  status: "admin_editor_login_role_credential_architecture_defined",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag14a: articleHash,
  admin_route: "/admin.html",
  editor_routes: ["/editor-dashboard.html", "/editor-create.html", "/editor-correction.html"],
  real_credentials_created: false,
  hardcoded_password_created: false,
  ready_for_ag14b: true,
  next_stage: boundary,
  ...stageControls
};

const doc = `# AG14A — Admin + Editor Login, Role and Credential Architecture

## Purpose

AG14A defines the Admin and Editor architecture for Drishvara publishing control.

AG14A is architecture only. It does not create login pages, credentials, password hashes, backend/Auth/Supabase activation, database writes, article mutation, visibility switching or publishing.

## Admin Role

Admin has final publishing authority. Admin can review, archive, return for correction, publish, publish and close, and review audit trail.

## Editor Role

Editor can manually create articles, edit returned articles, save drafts, preview, and submit/resubmit to Admin. Editor cannot publish.

## Bootstrap Credential Doctrine

Initial Admin/Editor credentials may be used only as secure bootstrap credentials outside public repository code.

First login must force password reset. Real passwords or password hashes must not be committed to GitHub.

## Planned Routes

- Admin login: /admin.html
- Admin dashboard: /admin-dashboard.html
- Editor dashboard: /editor-dashboard.html
- Editor manual article creation: /editor-create.html
- Editor correction workspace: /editor-correction.html

## Next Stage

AG14B — Admin and Editor Login UI Scaffold — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(architecturePath, architecture);
writeJson(credentialDoctrinePath, credentialDoctrine);
writeJson(roleRightsPath, roleRights);
writeJson(workflowPath, workflow);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG14A Admin + Editor login, role and credential architecture artifacts generated.");
console.log("✅ Admin and Editor roles defined.");
console.log("✅ Bootstrap credential and first-login reset doctrine defined.");
console.log("✅ Manual Editor creation and correction workflow included.");
console.log("✅ Admin Review Queue / Editor Workspace state model defined.");
console.log("✅ No real credentials, hardcoded passwords, Auth/backend/Supabase activation or publishing performed.");
console.log("✅ AG14B Admin and Editor Login UI Scaffold boundary created with explicit approval required.");
