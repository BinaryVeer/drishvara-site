import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag19eReview: "data/content-intelligence/quality-reviews/ag19e-first-static-activation-approval-package.json",
  ag19ePackage: "data/content-intelligence/go-live/ag19e-first-static-activation-approval-package.json",
  ag19eCandidate: "data/content-intelligence/go-live/ag19e-candidate-evidence-approval-summary.json",
  ag19ePublicDelta: "data/content-intelligence/go-live/ag19e-final-public-delta-approval-summary.json",
  ag19eRollback: "data/content-intelligence/go-live/ag19e-rollback-smoke-test-approval-summary.json",
  ag19eGithub: "data/content-intelligence/go-live/ag19e-github-secret-governance-approval-summary.json",
  ag19eApprovalPhrase: "data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json",
  ag19eBlockers: "data/content-intelligence/quality-registry/ag19e-approval-package-blocker-register.json",
  ag19eReadiness: "data/content-intelligence/quality-registry/ag19e-approval-package-audit-readiness-record.json",
  ag19eBoundary: "data/content-intelligence/mutation-plans/ag19e-to-ag19f-first-static-activation-approval-package-audit-boundary.json",
  ag19dDecision: "data/content-intelligence/go-live/ag19d-first-static-activation-approval-package-readiness-decision-record.json",
  ag19dSafety: "data/content-intelligence/quality-registry/ag19d-final-public-delta-dry-run-safety-record.json",
  ag17bSupabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag19f-first-static-activation-approval-package-audit.json");
const auditPath = path.join(root, "data/content-intelligence/audit-records/ag19f-first-static-activation-approval-package-audit-report.json");
const closurePath = path.join(root, "data/content-intelligence/closure-records/ag19f-first-static-activation-approval-package-audit-closure.json");
const safetyPath = path.join(root, "data/content-intelligence/quality-registry/ag19f-first-static-activation-approval-package-safety-record.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag19f-first-static-activation-planning-closure-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag19f-to-ag19z-first-static-activation-planning-closure-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/first-static-activation-approval-package-audit.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag19f-first-static-activation-approval-package-audit-learning.json");
const registryPath = path.join(root, "data/quality/ag19f-first-static-activation-approval-package-audit.json");
const previewPath = path.join(root, "data/quality/ag19f-first-static-activation-approval-package-audit-preview.json");
const docPath = path.join(root, "docs/quality/AG19F_FIRST_STATIC_ACTIVATION_APPROVAL_PACKAGE_AUDIT.md");

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
  if (!exists(relativePath)) throw new Error(`Missing AG19F input ${name}: ${relativePath}`);
}

const data = Object.fromEntries(Object.entries(inputs).map(([key, relativePath]) => [key, readJson(relativePath)]));

if (data.ag19eReview.status !== "first_static_activation_approval_package_created_pending_audit") {
  throw new Error("AG19F requires AG19E review readiness.");
}
if (data.ag19ePackage.status !== "first_static_activation_approval_package_created_pending_audit") {
  throw new Error("AG19F requires AG19E approval package.");
}
if (data.ag19eReadiness.ready_for_ag19f !== true) {
  throw new Error("AG19F requires AG19E readiness.");
}
if (data.ag19eBoundary.next_stage_id !== "AG19F" || data.ag19eBoundary.explicit_approval_required !== true) {
  throw new Error("AG19F requires AG19E to AG19F explicit boundary.");
}

const articlePath = data.ag13zCandidate.selected_article_path;
if (!exists(articlePath)) throw new Error(`Selected article missing: ${articlePath}`);

const currentArticleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentArticleHash !== data.ag13zCandidate.article_hash) {
  throw new Error("AG19F requires seed candidate article hash to remain unchanged.");
}

const stageControls = {
  first_static_activation_approval_package_audit_only: true,
  ag19e_approval_package_audited_in_ag19f: true,
  approval_package_audit_closure_created_in_ag19f: true,
  approval_package_safety_record_created_in_ag19f: true,
  ag19z_boundary_created_in_ag19f: true,
  selected_article_read_performed: true,

  article_generation_performed_in_ag19f: false,
  article_mutation_performed_in_ag19f: false,
  queue_mutation_performed_in_ag19f: false,
  active_admin_review_queue_record_created_in_ag19f: false,
  queue_index_mutation_performed_in_ag19f: false,
  admin_action_execution_performed_in_ag19f: false,
  editor_action_execution_performed_in_ag19f: false,
  real_credential_created_in_ag19f: false,
  hardcoded_password_created_in_repo_in_ag19f: false,
  password_hash_created_in_repo_in_ag19f: false,
  auth_activation_performed_in_ag19f: false,
  backend_activation_performed_in_ag19f: false,
  supabase_activation_performed_in_ag19f: false,
  database_write_performed_in_ag19f: false,
  github_token_created_or_exposed_in_ag19f: false,
  github_write_operation_performed_in_ag19f: false,
  active_action_handler_created_in_ag19f: false,
  api_endpoint_created_in_ag19f: false,
  public_visibility_switch_performed_in_ag19f: false,
  public_index_mutation_performed_in_ag19f: false,
  deployment_trigger_performed_in_ag19f: false,
  public_publishing_operation_performed_in_ag19f: false
};

const auditChecks = [
  {
    check_id: "AG19F-AUDIT-001",
    area: "ag19e_dependency",
    status: "passed",
    note: "AG19E review, approval package, summaries, blocker register, readiness and boundary are present."
  },
  {
    check_id: "AG19F-AUDIT-002",
    area: "approval_package",
    status:
      data.ag19ePackage.package_only === true &&
      data.ag19ePackage.candidate.article_path === articlePath &&
      data.ag19ePackage.candidate.article_hash === currentArticleHash &&
      data.ag19ePackage.current_decision_state.approval_package_created === true &&
      data.ag19ePackage.current_decision_state.ready_for_ag19f_audit === true &&
      data.ag19ePackage.current_decision_state.explicit_user_approval_received_now === false &&
      data.ag19ePackage.current_decision_state.real_static_apply_authorised_now === false &&
      data.ag19ePackage.current_decision_state.candidate_apply_enabled_now === false &&
      data.ag19ePackage.current_decision_state.github_token_enabled_now === false &&
      data.ag19ePackage.current_decision_state.github_write_enabled_now === false &&
      data.ag19ePackage.current_decision_state.visibility_switch_enabled_now === false &&
      data.ag19ePackage.current_decision_state.public_index_mutation_enabled_now === false &&
      data.ag19ePackage.current_decision_state.deployment_enabled_now === false &&
      data.ag19ePackage.current_decision_state.publishing_enabled_now === false
        ? "passed"
        : "failed",
    note: "Approval package must be package-only and must not authorise real apply or publishing."
  },
  {
    check_id: "AG19F-AUDIT-003",
    area: "candidate_evidence_summary",
    status:
      data.ag19eCandidate.status === "candidate_evidence_summarised_for_approval_package_no_apply" &&
      data.ag19eCandidate.candidate.article_path === articlePath &&
      data.ag19eCandidate.candidate.article_hash === currentArticleHash &&
      Object.values(data.ag19eCandidate.current_evidence_state).every((value) => value === false)
        ? "passed"
        : "failed",
    note: "Candidate evidence summary must remain no-apply and unverified for real activation."
  },
  {
    check_id: "AG19F-AUDIT-004",
    area: "final_public_delta_summary",
    status:
      data.ag19ePublicDelta.status === "final_public_delta_summarised_for_approval_package_no_mutation" &&
      data.ag19ePublicDelta.summary_state.final_delta_dry_run_completed === true &&
      data.ag19ePublicDelta.summary_state.public_surface_preview_completed === true &&
      data.ag19ePublicDelta.summary_state.exact_file_delta_approved_now === false &&
      data.ag19ePublicDelta.summary_state.public_visibility_switched_now === false &&
      data.ag19ePublicDelta.summary_state.public_index_mutated_now === false &&
      data.ag19ePublicDelta.summary_state.git_write_performed_now === false &&
      data.ag19ePublicDelta.summary_state.published_now === false
        ? "passed"
        : "failed",
    note: "Final public delta summary must confirm dry-run evidence only and no mutation."
  },
  {
    check_id: "AG19F-AUDIT-005",
    area: "rollback_smoke_test_summary",
    status:
      data.ag19eRollback.status === "rollback_smoke_test_summarised_for_approval_package_no_execution" &&
      Object.values(data.ag19eRollback.current_state).every((value) => value === false)
        ? "passed"
        : "failed",
    note: "Rollback and smoke-test summary must not execute rollback, deployment, smoke-test or publishing."
  },
  {
    check_id: "AG19F-AUDIT-006",
    area: "github_secret_governance_summary",
    status:
      data.ag19eGithub.status === "github_secret_governance_summarised_no_secrets_created" &&
      Object.values(data.ag19eGithub.current_secret_state).every((value) => value === false) &&
      data.ag19eGithub.governance_rules.some((rule) => rule.includes("No GitHub token is created")) &&
      data.ag19eGithub.governance_rules.some((rule) => rule.includes("No GitHub write is performed"))
        ? "passed"
        : "failed",
    note: "GitHub governance summary must create no secrets and enable no GitHub write."
  },
  {
    check_id: "AG19F-AUDIT-007",
    area: "explicit_approval_phrase",
    status:
      data.ag19eApprovalPhrase.status === "explicit_approval_phrase_defined_not_executed" &&
      data.ag19eApprovalPhrase.approval_required_before_future_apply === true &&
      data.ag19eApprovalPhrase.exact_phrase_required_later === "Proceed with first controlled static apply" &&
      Object.values(data.ag19eApprovalPhrase.current_approval_state).every((value) => value === false)
        ? "passed"
        : "failed",
    note: "Explicit approval phrase must be defined but not executed."
  },
  {
    check_id: "AG19F-AUDIT-008",
    area: "blocker_register",
    status:
      data.ag19eBlockers.blocked_items.includes("Real candidate apply.") &&
      data.ag19eBlockers.blocked_items.includes("Real GitHub token creation.") &&
      data.ag19eBlockers.blocked_items.includes("Real GitHub write.") &&
      data.ag19eBlockers.blocked_items.includes("Real public visibility switch.") &&
      data.ag19eBlockers.blocked_items.includes("Real public index mutation.") &&
      data.ag19eBlockers.blocked_items.includes("Deployment trigger.") &&
      data.ag19eBlockers.blocked_items.includes("Publish execution.") &&
      data.ag19eBlockers.blocked_items.includes("Supabase/Auth/backend activation.") &&
      data.ag19eBlockers.supabase_auth_backend_deferred === true
        ? "passed"
        : "failed",
    note: "Approval package blocker register must keep all real activation operations blocked."
  },
  {
    check_id: "AG19F-AUDIT-009",
    area: "ag19d_decision_inheritance",
    status:
      data.ag19dDecision.decision.proceed_to_first_static_activation_approval_package === true &&
      data.ag19dDecision.decision.proceed_to_real_candidate_apply === false &&
      data.ag19dDecision.decision.proceed_to_github_token_creation === false &&
      data.ag19dDecision.decision.proceed_to_github_write === false &&
      data.ag19dDecision.decision.proceed_to_public_visibility_switch === false &&
      data.ag19dDecision.decision.proceed_to_public_index_mutation === false &&
      data.ag19dDecision.decision.proceed_to_deployment_trigger === false &&
      data.ag19dDecision.decision.proceed_to_publish_execution === false &&
      data.ag19dDecision.decision.proceed_to_supabase_auth_backend_activation === false
        ? "passed"
        : "failed",
    note: "AG19D decision must allow only approval package and block all real activation."
  },
  {
    check_id: "AG19F-AUDIT-010",
    area: "ag19d_safety_inheritance",
    status:
      data.ag19dSafety.safety_assertions.first_static_activation_approval_package_allowed === true &&
      data.ag19dSafety.safety_assertions.candidate_real_apply_enabled === false &&
      data.ag19dSafety.safety_assertions.github_token_created === false &&
      data.ag19dSafety.safety_assertions.github_write_enabled === false &&
      data.ag19dSafety.safety_assertions.public_visibility_switch_enabled === false &&
      data.ag19dSafety.safety_assertions.public_index_mutation_enabled === false &&
      data.ag19dSafety.safety_assertions.deployment_trigger_enabled === false &&
      data.ag19dSafety.safety_assertions.publishing_enabled === false
        ? "passed"
        : "failed",
    note: "AG19D safety controls must remain inherited."
  },
  {
    check_id: "AG19F-AUDIT-011",
    area: "readiness_alignment",
    status:
      data.ag19eReadiness.ready_for_ag19f === true &&
      data.ag19eReadiness.github_token_ready === false &&
      data.ag19eReadiness.github_write_ready === false &&
      data.ag19eReadiness.candidate_apply_ready === false &&
      data.ag19eReadiness.public_visibility_switch_ready === false &&
      data.ag19eReadiness.public_index_mutation_ready === false &&
      data.ag19eReadiness.deployment_trigger_ready === false &&
      data.ag19eReadiness.publish_ready === false &&
      data.ag19eReadiness.supabase_activation_ready === false
        ? "passed"
        : "failed",
    note: "AG19E readiness must point to AG19F audit while real activation remains blocked."
  },
  {
    check_id: "AG19F-AUDIT-012",
    area: "supabase_auth_defer_reminder",
    status:
      data.ag17bSupabaseReminder.status === "supabase_auth_backend_defer_reminder_carried_forward" &&
      data.ag17bSupabaseReminder.reminder.includes("static/GitHub-controlled go-live first") &&
      data.ag17bSupabaseReminder.reminder.includes("Supabase/Auth/backend later")
        ? "passed"
        : "failed",
    note: "Supabase/Auth/backend defer reminder must remain active."
  },
  {
    check_id: "AG19F-AUDIT-013",
    area: "forbidden_operations",
    status: "passed",
    note: "AG19F is audit-only and performs no article generation, mutation, credentials, GitHub write, visibility switch, public index mutation, deployment, publishing or backend activation."
  }
];

const failedChecks = auditChecks.filter((check) => check.status === "failed");
if (failedChecks.length > 0) {
  throw new Error(`AG19F audit failed: ${failedChecks.map((check) => check.check_id).join(", ")}`);
}

const auditReport = {
  module_id: "AG19F",
  title: "First Static Activation Approval Package Audit Report",
  status: "first_static_activation_approval_package_audit_passed",
  checks: auditChecks,
  failed_checks: failedChecks,
  audit_summary: {
    total_checks: auditChecks.length,
    passed: auditChecks.filter((check) => check.status === "passed").length,
    failed: failedChecks.length
  },
  decision: {
    ag19e_approval_package_valid: true,
    candidate_evidence_summary_valid: true,
    final_public_delta_summary_valid: true,
    rollback_smoke_test_summary_valid: true,
    github_secret_governance_summary_valid: true,
    explicit_approval_phrase_valid: true,
    no_candidate_apply_performed: true,
    no_github_token_created: true,
    no_github_write_performed: true,
    no_public_visibility_switch_performed: true,
    no_public_index_mutation_performed: true,
    no_deployment_triggered: true,
    no_publishing_performed: true,
    supabase_auth_backend_deferred: true,
    ready_for_ag19z_closure: true
  },
  ...stageControls
};

const closure = {
  module_id: "AG19F",
  title: "First Static Activation Approval Package Audit Closure",
  status: "first_static_activation_approval_package_audit_passed_ready_for_ag19z_closure",
  closed_scope: [
    "AG19E first static activation approval package.",
    "Candidate evidence approval summary.",
    "Final public delta approval summary.",
    "Rollback and smoke-test approval summary.",
    "GitHub secret governance approval summary.",
    "Explicit approval phrase record."
  ],
  unresolved_for_real_static_apply: [
    "Explicit user approval phrase execution.",
    "GitHub token creation or secure availability.",
    "GitHub write.",
    "Article/file mutation.",
    "Public visibility switch.",
    "Public index mutation.",
    "Deployment trigger.",
    "Live post-deploy smoke-test.",
    "Supabase/Auth/backend activation remains deferred."
  ],
  closure_decision: {
    close_ag19e_approval_package_audit: true,
    proceed_to_ag19z_first_static_activation_planning_closure: true,
    proceed_to_real_candidate_apply: false,
    proceed_to_github_token_creation: false,
    proceed_to_github_write: false,
    proceed_to_public_visibility_switch: false,
    proceed_to_public_index_mutation: false,
    proceed_to_deployment_trigger: false,
    proceed_to_publish_execution: false,
    proceed_to_supabase_auth_backend_activation: false
  },
  ...stageControls
};

const safety = {
  module_id: "AG19F",
  title: "First Static Activation Approval Package Safety Record",
  status: "approval_package_safe_for_ag19z_closure_only",
  safety_assertions: {
    static_github_controlled_first: true,
    supabase_auth_backend_deferred: true,
    ag19z_closure_allowed: true,
    candidate_real_apply_enabled: false,
    github_token_created: false,
    github_token_exposed: false,
    github_token_wired: false,
    github_write_enabled: false,
    article_mutation_enabled: false,
    queue_mutation_enabled: false,
    public_visibility_switch_enabled: false,
    public_index_mutation_enabled: false,
    deployment_trigger_enabled: false,
    publishing_enabled: false,
    admin_editor_execution_enabled: false
  },
  reminder: data.ag17bSupabaseReminder.reminder,
  ...stageControls
};

const readiness = {
  module_id: "AG19F",
  title: "First Static Activation Planning Closure Readiness Record",
  status: "ready_for_ag19z_first_static_activation_planning_closure",
  ready_for_ag19z: true,
  ag19z_explicit_approval_required: true,
  first_static_activation_approval_package_audit_passed: true,
  failed_checks: 0,
  selected_path: "hybrid_staged_path_static_first",
  static_github_controlled_first: true,
  supabase_auth_backend_deferred: true,
  supabase_auth_reminder_required_in_future: true,

  article_generation_ready: false,
  article_mutation_ready: false,
  queue_mutation_ready: false,
  admin_action_execution_ready: false,
  editor_action_execution_ready: false,
  real_auth_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  github_token_ready: false,
  github_write_ready: false,
  candidate_apply_ready: false,
  public_visibility_switch_ready: false,
  public_index_mutation_ready: false,
  deployment_trigger_ready: false,
  publish_ready: false,
  reason: "AG19F audits the approval package. AG19Z should close AG19 and create AG20A controlled static apply readiness boundary.",
  ...stageControls
};

const boundary = {
  module_id: "AG19F",
  title: "AG19F to AG19Z First Static Activation Planning Closure Boundary",
  status: "ag19z_boundary_created_not_started",
  next_stage_id: "AG19Z",
  next_stage_title: "First Static Activation Planning Closure",
  explicit_approval_required: true,
  selected_path: "hybrid_staged_path_static_first",
  ag19z_allowed_scope: [
    "Close AG19 first static activation planning chain.",
    "Summarise AG19A through AG19F outputs.",
    "Record remaining blockers before AG20 controlled static apply readiness.",
    "Carry forward Supabase/Auth/backend defer reminder.",
    "Create AG20A controlled static apply readiness boundary."
  ],
  ag19z_blocked_scope: [
    "No article mutation.",
    "No active queue mutation.",
    "No Admin/Editor action execution.",
    "No real credentials.",
    "No Auth/backend/Supabase activation.",
    "No GitHub token creation or wiring.",
    "No GitHub content write.",
    "No public visibility switch.",
    "No public index mutation.",
    "No publishing operation.",
    "No deployment trigger."
  ],
  supabase_auth_defer_reminder_required_in_ag19z: true,
  ...stageControls
};

const schema = {
  module_id: "AG19F",
  title: "First Static Activation Approval Package Audit Schema",
  status: "schema_first_static_activation_approval_package_audit_only",
  approval_package_audit_allowed_in_ag19f: true,
  audit_report_allowed_in_ag19f: true,
  audit_closure_allowed_in_ag19f: true,
  safety_record_allowed_in_ag19f: true,
  ag19z_boundary_allowed_in_ag19f: true,

  article_generation_allowed_in_ag19f: false,
  article_mutation_allowed_in_ag19f: false,
  queue_mutation_allowed_in_ag19f: false,
  active_admin_review_queue_record_creation_allowed_in_ag19f: false,
  queue_index_mutation_allowed_in_ag19f: false,
  admin_action_execution_allowed_in_ag19f: false,
  editor_action_execution_allowed_in_ag19f: false,
  real_credential_creation_allowed_in_ag19f: false,
  auth_activation_allowed_in_ag19f: false,
  backend_activation_allowed_in_ag19f: false,
  supabase_activation_allowed_in_ag19f: false,
  database_write_allowed_in_ag19f: false,
  github_token_creation_or_exposure_allowed_in_ag19f: false,
  github_write_operation_allowed_in_ag19f: false,
  active_action_handler_creation_allowed_in_ag19f: false,
  api_endpoint_creation_allowed_in_ag19f: false,
  public_visibility_switch_allowed_in_ag19f: false,
  public_index_mutation_allowed_in_ag19f: false,
  public_publishing_operation_allowed_in_ag19f: false,
  deployment_trigger_allowed_in_ag19f: false,
  ...stageControls
};

const review = {
  module_id: "AG19F",
  title: "First Static Activation Approval Package Audit",
  status: "first_static_activation_approval_package_audit_passed_ready_for_ag19z_closure",
  depends_on: ["AG19E"],
  generated_from: inputs,
  audit_report_file: "data/content-intelligence/audit-records/ag19f-first-static-activation-approval-package-audit-report.json",
  closure_file: "data/content-intelligence/closure-records/ag19f-first-static-activation-approval-package-audit-closure.json",
  safety_file: "data/content-intelligence/quality-registry/ag19f-first-static-activation-approval-package-safety-record.json",
  readiness_file: "data/content-intelligence/quality-registry/ag19f-first-static-activation-planning-closure-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag19f-to-ag19z-first-static-activation-planning-closure-boundary.json",
  schema_file: "data/content-intelligence/schema/first-static-activation-approval-package-audit.schema.json",
  summary: {
    audit_passed: true,
    failed_checks: 0,
    ready_for_ag19z: true,
    selected_path: "hybrid_staged_path_static_first",
    supabase_auth_backend_deferred: true,
    github_token_ready: false,
    github_write_ready: false,
    candidate_apply_ready: false,
    public_visibility_switch_ready: false,
    public_index_mutation_ready: false,
    deployment_trigger_ready: false,
    publish_ready: false,
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG19F",
  title: "First Static Activation Approval Package Audit Learning",
  status: "learning_record_only",
  learning_points: [
    "AG19E approval package passed audit with zero failed checks.",
    "The explicit approval phrase is valid but not executed.",
    "No GitHub token, GitHub write, visibility switch, public index mutation, deployment or publishing occurred.",
    "The next safe step is AG19Z closure, then AG20A controlled static apply readiness.",
    "Supabase/Auth/backend remains deferred under the hybrid staged path."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG19F",
  title: "First Static Activation Approval Package Audit",
  status: "first_static_activation_approval_package_audit_passed_ready_for_ag19z_closure",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag19f-first-static-activation-approval-package-audit.json",
    audit_report: "data/content-intelligence/audit-records/ag19f-first-static-activation-approval-package-audit-report.json",
    closure: "data/content-intelligence/closure-records/ag19f-first-static-activation-approval-package-audit-closure.json",
    safety: "data/content-intelligence/quality-registry/ag19f-first-static-activation-approval-package-safety-record.json",
    readiness: "data/content-intelligence/quality-registry/ag19f-first-static-activation-planning-closure-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag19f-to-ag19z-first-static-activation-planning-closure-boundary.json",
    schema: "data/content-intelligence/schema/first-static-activation-approval-package-audit.schema.json",
    learning: "data/content-intelligence/learning/ag19f-first-static-activation-approval-package-audit-learning.json",
    preview: "data/quality/ag19f-first-static-activation-approval-package-audit-preview.json",
    document: "docs/quality/AG19F_FIRST_STATIC_ACTIVATION_APPROVAL_PACKAGE_AUDIT.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG19F",
  preview_only: true,
  status: "first_static_activation_approval_package_audit_passed_ready_for_ag19z_closure",
  audit_passed: true,
  failed_checks: 0,
  ready_for_ag19z: true,
  selected_path: "hybrid_staged_path_static_first",
  supabase_auth_backend_deferred: true,
  github_token_ready: false,
  github_write_ready: false,
  candidate_apply_ready: false,
  public_visibility_switch_ready: false,
  public_index_mutation_ready: false,
  deployment_trigger_ready: false,
  publish_ready: false,
  next_stage_boundary: boundary,
  ...stageControls
};

const doc = `# AG19F — First Static Activation Approval Package Audit

## Purpose

AG19F audits the AG19E first static activation approval package.

AG19F is audit-only. It does not generate articles, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, create or wire GitHub tokens, write to GitHub, switch public visibility, mutate public indexes, trigger deployment or publish anything.

## Audit Result

AG19E first static activation approval package passed audit with zero failed checks.

## Decision

AG19Z may proceed only as First Static Activation Planning Closure.

Not approved: real candidate apply, GitHub token creation, GitHub write, public visibility switch, public index mutation, deployment trigger, publish execution or Supabase/Auth/backend activation.

## Supabase/Auth Reminder

Hybrid staged path remains in force: static/GitHub-controlled go-live first; Supabase/Auth/backend later only after explicit reminder, review and approval.

## Next Stage

AG19Z — First Static Activation Planning Closure — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(auditPath, auditReport);
writeJson(closurePath, closure);
writeJson(safetyPath, safety);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG19F First Static Activation Approval Package Audit generated.");
console.log("✅ AG19E approval package audit passed with zero failed checks.");
console.log("✅ Explicit approval phrase remains defined but not executed.");
console.log("✅ GitHub token, GitHub write, visibility switch, public index mutation, deployment and publishing remain blocked.");
console.log("✅ Supabase/Auth/backend remains deferred.");
console.log("✅ AG19Z First Static Activation Planning Closure boundary created.");
