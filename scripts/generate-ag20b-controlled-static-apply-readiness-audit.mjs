import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag20aReview: "data/content-intelligence/quality-reviews/ag20a-controlled-static-apply-readiness.json",
  ag20aPackage: "data/content-intelligence/go-live/ag20a-controlled-static-apply-readiness-package.json",
  ag20aCandidate: "data/content-intelligence/go-live/ag20a-candidate-apply-readiness-check.json",
  ag20aGithub: "data/content-intelligence/go-live/ag20a-github-token-readiness-no-secrets-check.json",
  ag20aSurfaces: "data/content-intelligence/go-live/ag20a-public-surface-apply-map.json",
  ag20aRollback: "data/content-intelligence/go-live/ag20a-rollback-smoke-test-readiness-check.json",
  ag20aApprovalGate: "data/content-intelligence/go-live/ag20a-explicit-approval-gate-readiness-check.json",
  ag20aBlocker: "data/content-intelligence/quality-registry/ag20a-controlled-static-apply-blocker-register.json",
  ag20aReadiness: "data/content-intelligence/quality-registry/ag20a-controlled-static-apply-readiness-audit-readiness-record.json",
  ag20aBoundary: "data/content-intelligence/mutation-plans/ag20a-to-ag20b-controlled-static-apply-readiness-audit-boundary.json",

  ag19zSummary: "data/content-intelligence/go-live/ag19z-first-static-activation-planning-summary.json",
  ag19zClosure: "data/content-intelligence/closure-records/ag19z-first-static-activation-planning-closure.json",
  ag19eApprovalPhrase: "data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json",
  ag17bSupabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json"
};

const out = {
  review: "data/content-intelligence/quality-reviews/ag20b-controlled-static-apply-readiness-audit.json",
  audit: "data/content-intelligence/audit-records/ag20b-controlled-static-apply-readiness-audit-report.json",
  decision: "data/content-intelligence/go-live/ag20b-controlled-static-apply-final-authorization-readiness-decision-record.json",
  safety: "data/content-intelligence/quality-registry/ag20b-controlled-static-apply-safety-record.json",
  readiness: "data/content-intelligence/quality-registry/ag20b-controlled-static-apply-final-authorization-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag20b-to-ag20c-controlled-static-apply-final-authorization-boundary.json",
  schema: "data/content-intelligence/schema/controlled-static-apply-readiness-audit.schema.json",
  learning: "data/content-intelligence/learning/ag20b-controlled-static-apply-readiness-audit-learning.json",
  registry: "data/quality/ag20b-controlled-static-apply-readiness-audit.json",
  preview: "data/quality/ag20b-controlled-static-apply-readiness-audit-preview.json",
  doc: "docs/quality/AG20B_CONTROLLED_STATIC_APPLY_READINESS_AUDIT.md"
};

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(path.join(root, filePath)), { recursive: true });
}
function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}
function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}
function writeJson(relativePath, value) {
  ensureDir(relativePath);
  fs.writeFileSync(path.join(root, relativePath), JSON.stringify(value, null, 2) + "\n");
}
function writeText(relativePath, value) {
  ensureDir(relativePath);
  fs.writeFileSync(path.join(root, relativePath), value);
}
function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) throw new Error(`Missing AG20B input ${name}: ${relativePath}`);
}

const data = Object.fromEntries(Object.entries(inputs).map(([key, relativePath]) => [key, readJson(relativePath)]));

if (data.ag20aReview.status !== "controlled_static_apply_readiness_package_created_pending_audit") {
  throw new Error("AG20B requires AG20A review readiness.");
}
if (data.ag20aPackage.status !== "controlled_static_apply_readiness_package_created_pending_audit") {
  throw new Error("AG20B requires AG20A readiness package.");
}
if (data.ag20aReadiness.ready_for_ag20b !== true) {
  throw new Error("AG20B requires AG20A readiness.");
}
if (data.ag20aBoundary.next_stage_id !== "AG20B" || data.ag20aBoundary.explicit_approval_required !== true) {
  throw new Error("AG20B requires AG20A to AG20B explicit boundary.");
}

const requiredPhrase = "Proceed with first controlled static apply";
if (data.ag19eApprovalPhrase.exact_phrase_required_later !== requiredPhrase) {
  throw new Error("AG20B requires the approved AG19E phrase.");
}

const articlePath = data.ag13zCandidate.selected_article_path;
if (!exists(articlePath)) throw new Error(`Selected article missing: ${articlePath}`);

const currentArticleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentArticleHash !== data.ag13zCandidate.article_hash) {
  throw new Error("AG20B requires seed candidate article hash to remain unchanged.");
}

const stageControls = {
  controlled_static_apply_readiness_audit_only: true,
  ag20a_readiness_package_audited_in_ag20b: true,
  final_authorization_decision_created_in_ag20b: true,
  controlled_static_apply_safety_record_created_in_ag20b: true,
  ag20c_boundary_created_in_ag20b: true,
  selected_article_read_performed: true,

  explicit_approval_phrase_executed_in_ag20b: false,
  article_generation_performed_in_ag20b: false,
  article_mutation_performed_in_ag20b: false,
  queue_mutation_performed_in_ag20b: false,
  active_admin_review_queue_record_created_in_ag20b: false,
  queue_index_mutation_performed_in_ag20b: false,
  admin_action_execution_performed_in_ag20b: false,
  editor_action_execution_performed_in_ag20b: false,
  real_credential_created_in_ag20b: false,
  hardcoded_password_created_in_repo_in_ag20b: false,
  password_hash_created_in_repo_in_ag20b: false,
  auth_activation_performed_in_ag20b: false,
  backend_activation_performed_in_ag20b: false,
  supabase_activation_performed_in_ag20b: false,
  database_write_performed_in_ag20b: false,
  github_token_created_or_exposed_in_ag20b: false,
  github_write_operation_performed_in_ag20b: false,
  active_action_handler_created_in_ag20b: false,
  api_endpoint_created_in_ag20b: false,
  public_visibility_switch_performed_in_ag20b: false,
  public_index_mutation_performed_in_ag20b: false,
  deployment_trigger_performed_in_ag20b: false,
  public_publishing_operation_performed_in_ag20b: false
};

const auditChecks = [
  {
    check_id: "AG20B-AUDIT-001",
    area: "ag20a_dependency",
    status: "passed",
    note: "AG20A review, readiness package, checks, blocker register, readiness and boundary are present."
  },
  {
    check_id: "AG20B-AUDIT-002",
    area: "readiness_package",
    status:
      data.ag20aPackage.readiness_only === true &&
      data.ag20aPackage.candidate.article_path === articlePath &&
      data.ag20aPackage.candidate.article_hash === currentArticleHash &&
      data.ag20aPackage.required_future_approval_phrase === requiredPhrase &&
      data.ag20aPackage.current_decision_state.readiness_package_created === true &&
      data.ag20aPackage.current_decision_state.ready_for_ag20b_audit === true &&
      data.ag20aPackage.current_decision_state.explicit_approval_phrase_executed_now === false &&
      data.ag20aPackage.current_decision_state.controlled_static_apply_authorised_now === false &&
      data.ag20aPackage.current_decision_state.candidate_apply_enabled_now === false &&
      data.ag20aPackage.current_decision_state.github_token_enabled_now === false &&
      data.ag20aPackage.current_decision_state.github_write_enabled_now === false &&
      data.ag20aPackage.current_decision_state.visibility_switch_enabled_now === false &&
      data.ag20aPackage.current_decision_state.public_index_mutation_enabled_now === false &&
      data.ag20aPackage.current_decision_state.deployment_enabled_now === false &&
      data.ag20aPackage.current_decision_state.publishing_enabled_now === false
        ? "passed"
        : "failed",
    note: "Readiness package must be readiness-only and must not authorise apply, token, write, visibility, deployment or publishing."
  },
  {
    check_id: "AG20B-AUDIT-003",
    area: "candidate_apply_readiness",
    status:
      data.ag20aCandidate.status === "candidate_apply_readiness_checked_no_apply" &&
      data.ag20aCandidate.candidate.article_path === articlePath &&
      data.ag20aCandidate.candidate.article_hash === currentArticleHash &&
      data.ag20aCandidate.current_apply_state.candidate_apply_ready_for_audit_review === true &&
      data.ag20aCandidate.current_apply_state.candidate_apply_executed_now === false &&
      data.ag20aCandidate.current_apply_state.article_mutated_now === false &&
      data.ag20aCandidate.current_apply_state.public_visibility_switched_now === false &&
      data.ag20aCandidate.current_apply_state.published_now === false
        ? "passed"
        : "failed",
    note: "Candidate readiness may be checked for audit review only; no candidate apply or article mutation may occur."
  },
  {
    check_id: "AG20B-AUDIT-004",
    area: "github_token_no_secrets",
    status:
      data.ag20aGithub.status === "github_token_readiness_checked_no_secrets_created" &&
      Object.values(data.ag20aGithub.current_secret_state).every((value) => value === false) &&
      data.ag20aGithub.readiness_rules.some((rule) => rule.includes("No token is created")) &&
      data.ag20aGithub.readiness_rules.some((rule) => rule.includes("GitHub write remains blocked"))
        ? "passed"
        : "failed",
    note: "GitHub token readiness must create no secrets and enable no write."
  },
  {
    check_id: "AG20B-AUDIT-005",
    area: "public_surface_apply_map",
    status:
      data.ag20aSurfaces.status === "public_surface_apply_map_defined_no_mutation" &&
      data.ag20aSurfaces.future_surface_map.every((surface) => surface.mutated_now === false) &&
      Object.values(data.ag20aSurfaces.current_public_surface_state).every((value) => value === false)
        ? "passed"
        : "failed",
    note: "Public surface apply map must remain non-mutating."
  },
  {
    check_id: "AG20B-AUDIT-006",
    area: "rollback_smoke_test_readiness",
    status:
      data.ag20aRollback.status === "rollback_smoke_test_readiness_checked_no_execution" &&
      data.ag20aRollback.current_execution_state.rollback_ready_for_audit_review === true &&
      data.ag20aRollback.current_execution_state.smoke_test_ready_for_audit_review === true &&
      data.ag20aRollback.current_execution_state.rollback_executed_now === false &&
      data.ag20aRollback.current_execution_state.smoke_test_executed_now === false &&
      data.ag20aRollback.current_execution_state.deployment_triggered_now === false &&
      data.ag20aRollback.current_execution_state.published_now === false
        ? "passed"
        : "failed",
    note: "Rollback/smoke-test readiness may be checked; no rollback, smoke-test, deployment or publishing may execute."
  },
  {
    check_id: "AG20B-AUDIT-007",
    area: "explicit_approval_gate",
    status:
      data.ag20aApprovalGate.status === "explicit_approval_gate_ready_not_executed" &&
      data.ag20aApprovalGate.required_future_approval_phrase === requiredPhrase &&
      Object.values(data.ag20aApprovalGate.current_approval_state).every((value) => value === false)
        ? "passed"
        : "failed",
    note: "Explicit approval gate must preserve the phrase but not execute it."
  },
  {
    check_id: "AG20B-AUDIT-008",
    area: "blocker_register",
    status:
      data.ag20aBlocker.blocked_items.includes("Explicit approval phrase execution.") &&
      data.ag20aBlocker.blocked_items.includes("Real candidate apply.") &&
      data.ag20aBlocker.blocked_items.includes("Real GitHub token creation.") &&
      data.ag20aBlocker.blocked_items.includes("Real GitHub write.") &&
      data.ag20aBlocker.blocked_items.includes("Real public visibility switch.") &&
      data.ag20aBlocker.blocked_items.includes("Real public index mutation.") &&
      data.ag20aBlocker.blocked_items.includes("Deployment trigger.") &&
      data.ag20aBlocker.blocked_items.includes("Publish execution.") &&
      data.ag20aBlocker.blocked_items.includes("Supabase/Auth/backend activation.") &&
      data.ag20aBlocker.supabase_auth_backend_deferred === true
        ? "passed"
        : "failed",
    note: "AG20A blocker register must keep all real apply operations blocked."
  },
  {
    check_id: "AG20B-AUDIT-009",
    area: "ag19z_inheritance",
    status:
      data.ag19zSummary.final_ag19_state.ready_for_ag20_controlled_static_apply_readiness === true &&
      data.ag19zSummary.final_ag19_state.explicit_user_approval_executed === false &&
      data.ag19zSummary.final_ag19_state.candidate_apply_enabled === false &&
      data.ag19zSummary.final_ag19_state.github_token_created === false &&
      data.ag19zSummary.final_ag19_state.github_write_enabled === false &&
      data.ag19zSummary.final_ag19_state.public_visibility_switch_enabled === false &&
      data.ag19zSummary.final_ag19_state.public_index_mutation_enabled === false &&
      data.ag19zSummary.final_ag19_state.deployment_trigger_enabled === false &&
      data.ag19zSummary.final_ag19_state.publishing_enabled === false &&
      data.ag19zSummary.final_ag19_state.supabase_auth_backend_enabled === false
        ? "passed"
        : "failed",
    note: "AG19Z final state must remain inherited and non-active."
  },
  {
    check_id: "AG20B-AUDIT-010",
    area: "readiness_alignment",
    status:
      data.ag20aReadiness.ready_for_ag20b === true &&
      data.ag20aReadiness.required_future_approval_phrase === requiredPhrase &&
      data.ag20aReadiness.github_token_ready === false &&
      data.ag20aReadiness.github_write_ready === false &&
      data.ag20aReadiness.candidate_apply_ready === false &&
      data.ag20aReadiness.public_visibility_switch_ready === false &&
      data.ag20aReadiness.public_index_mutation_ready === false &&
      data.ag20aReadiness.deployment_trigger_ready === false &&
      data.ag20aReadiness.publish_ready === false &&
      data.ag20aReadiness.supabase_activation_ready === false
        ? "passed"
        : "failed",
    note: "AG20A readiness must point to audit while real apply remains blocked."
  },
  {
    check_id: "AG20B-AUDIT-011",
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
    check_id: "AG20B-AUDIT-012",
    area: "forbidden_operations",
    status: "passed",
    note: "AG20B is audit-only and performs no approval phrase execution, article mutation, credentials, GitHub write, visibility switch, public index mutation, deployment, publishing or backend activation."
  }
];

const failedChecks = auditChecks.filter((check) => check.status === "failed");
if (failedChecks.length > 0) {
  throw new Error(`AG20B audit failed: ${failedChecks.map((check) => check.check_id).join(", ")}`);
}

const audit = {
  module_id: "AG20B",
  title: "Controlled Static Apply Readiness Audit Report",
  status: "controlled_static_apply_readiness_audit_passed",
  checks: auditChecks,
  failed_checks: failedChecks,
  audit_summary: {
    total_checks: auditChecks.length,
    passed: auditChecks.filter((check) => check.status === "passed").length,
    failed: failedChecks.length
  },
  decision: {
    ag20a_readiness_package_valid: true,
    candidate_apply_readiness_valid: true,
    github_token_no_secrets_valid: true,
    public_surface_apply_map_valid: true,
    rollback_smoke_test_readiness_valid: true,
    explicit_approval_gate_valid: true,
    no_approval_phrase_executed: true,
    no_candidate_apply_performed: true,
    no_github_token_created: true,
    no_github_write_performed: true,
    no_public_visibility_switch_performed: true,
    no_public_index_mutation_performed: true,
    no_deployment_triggered: true,
    no_publishing_performed: true,
    supabase_auth_backend_deferred: true,
    ready_for_controlled_static_apply_final_authorization: true
  },
  ...stageControls
};

const decision = {
  module_id: "AG20B",
  title: "Controlled Static Apply Final Authorization Readiness Decision Record",
  status: "controlled_static_apply_readiness_audit_passed_ready_for_ag20c_final_authorization",
  decision: {
    proceed_to_controlled_static_apply_final_authorization: true,
    proceed_to_execute_approval_phrase: false,
    proceed_to_real_candidate_apply: false,
    proceed_to_github_token_creation: false,
    proceed_to_github_write: false,
    proceed_to_public_visibility_switch: false,
    proceed_to_public_index_mutation: false,
    proceed_to_deployment_trigger: false,
    proceed_to_publish_execution: false,
    proceed_to_supabase_auth_backend_activation: false
  },
  recommended_next_stage: "AG20C",
  recommended_next_stage_title: "Controlled Static Apply Final Authorization",
  required_future_approval_phrase: requiredPhrase,
  rationale: [
    "AG20A readiness package passed audit with zero failed checks.",
    "The next safe step is final authorization package only.",
    "The exact approval phrase remains required but not executed.",
    "No real apply, token, GitHub write, visibility switch, public mutation, deployment or publishing is approved.",
    "Supabase/Auth/backend remains deferred."
  ],
  ...stageControls
};

const safety = {
  module_id: "AG20B",
  title: "Controlled Static Apply Safety Record",
  status: "controlled_static_apply_safe_for_final_authorization_only",
  safety_assertions: {
    static_github_controlled_first: true,
    supabase_auth_backend_deferred: true,
    final_authorization_allowed: true,
    approval_phrase_executed: false,
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
  module_id: "AG20B",
  title: "Controlled Static Apply Final Authorization Readiness Record",
  status: "ready_for_ag20c_controlled_static_apply_final_authorization",
  ready_for_ag20c: true,
  ag20c_explicit_approval_required: true,
  controlled_static_apply_readiness_audit_passed: true,
  failed_checks: 0,
  final_authorization_ready: true,
  selected_path: "hybrid_staged_path_static_first",
  static_github_controlled_first: true,
  supabase_auth_backend_deferred: true,
  supabase_auth_reminder_required_in_future: true,
  required_future_approval_phrase: requiredPhrase,

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
  reason: "AG20B approves AG20C final authorization package only. Real controlled static apply remains blocked.",
  ...stageControls
};

const boundary = {
  module_id: "AG20B",
  title: "AG20B to AG20C Controlled Static Apply Final Authorization Boundary",
  status: "ag20c_boundary_created_not_started",
  next_stage_id: "AG20C",
  next_stage_title: "Controlled Static Apply Final Authorization",
  explicit_approval_required: true,
  selected_path: "hybrid_staged_path_static_first",
  required_future_approval_phrase: requiredPhrase,
  ag20c_allowed_scope: [
    "Prepare controlled static apply final authorization package.",
    "Restate exact approval phrase required before real apply.",
    "Confirm candidate path and hash.",
    "Confirm public surfaces to be included in later real apply.",
    "Confirm GitHub token and write remain blocked unless exact approval is executed later.",
    "Confirm rollback and smoke-test readiness.",
    "Carry forward Supabase/Auth/backend defer reminder."
  ],
  ag20c_blocked_scope: [
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
  supabase_auth_defer_reminder_required_in_ag20c: true,
  ...stageControls
};

const schema = {
  module_id: "AG20B",
  title: "Controlled Static Apply Readiness Audit Schema",
  status: "schema_controlled_static_apply_readiness_audit_only",
  readiness_audit_allowed_in_ag20b: true,
  final_authorization_decision_allowed_in_ag20b: true,
  safety_record_allowed_in_ag20b: true,
  ag20c_boundary_allowed_in_ag20b: true,

  explicit_approval_phrase_execution_allowed_in_ag20b: false,
  article_generation_allowed_in_ag20b: false,
  article_mutation_allowed_in_ag20b: false,
  queue_mutation_allowed_in_ag20b: false,
  active_admin_review_queue_record_creation_allowed_in_ag20b: false,
  queue_index_mutation_allowed_in_ag20b: false,
  admin_action_execution_allowed_in_ag20b: false,
  editor_action_execution_allowed_in_ag20b: false,
  real_credential_creation_allowed_in_ag20b: false,
  auth_activation_allowed_in_ag20b: false,
  backend_activation_allowed_in_ag20b: false,
  supabase_activation_allowed_in_ag20b: false,
  database_write_allowed_in_ag20b: false,
  github_token_creation_or_exposure_allowed_in_ag20b: false,
  github_write_operation_allowed_in_ag20b: false,
  active_action_handler_creation_allowed_in_ag20b: false,
  api_endpoint_creation_allowed_in_ag20b: false,
  public_visibility_switch_allowed_in_ag20b: false,
  public_index_mutation_allowed_in_ag20b: false,
  public_publishing_operation_allowed_in_ag20b: false,
  deployment_trigger_allowed_in_ag20b: false,
  ...stageControls
};

const review = {
  module_id: "AG20B",
  title: "Controlled Static Apply Readiness Audit",
  status: "controlled_static_apply_readiness_audit_passed_ready_for_ag20c_final_authorization",
  depends_on: ["AG20A"],
  generated_from: inputs,
  audit_report_file: out.audit,
  decision_file: out.decision,
  safety_file: out.safety,
  readiness_file: out.readiness,
  next_boundary_file: out.boundary,
  schema_file: out.schema,
  summary: {
    audit_passed: true,
    failed_checks: 0,
    ready_for_ag20c: true,
    selected_path: "hybrid_staged_path_static_first",
    required_future_approval_phrase: requiredPhrase,
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
  module_id: "AG20B",
  title: "Controlled Static Apply Readiness Audit Learning",
  status: "learning_record_only",
  learning_points: [
    "AG20A readiness package passed audit with zero failed checks.",
    "The next safe step is AG20C final authorization package only.",
    "The explicit approval phrase remains required but not executed.",
    "No GitHub token, GitHub write, visibility switch, public index mutation, deployment or publishing occurred.",
    "Supabase/Auth/backend remains deferred under the hybrid staged path."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG20B",
  title: "Controlled Static Apply Readiness Audit",
  status: "controlled_static_apply_readiness_audit_passed_ready_for_ag20c_final_authorization",
  generated_artifacts: {
    review: out.review,
    audit_report: out.audit,
    decision: out.decision,
    safety: out.safety,
    readiness: out.readiness,
    next_boundary: out.boundary,
    schema: out.schema,
    learning: out.learning,
    preview: out.preview,
    document: out.doc
  },
  ...stageControls
};

const preview = {
  module_id: "AG20B",
  preview_only: true,
  status: "controlled_static_apply_readiness_audit_passed_ready_for_ag20c_final_authorization",
  audit_passed: true,
  failed_checks: 0,
  ready_for_ag20c: true,
  selected_path: "hybrid_staged_path_static_first",
  required_future_approval_phrase: requiredPhrase,
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

const doc = `# AG20B — Controlled Static Apply Readiness Audit

## Purpose

AG20B audits the AG20A controlled static apply readiness package.

AG20B is audit-only. It does not execute the approval phrase, generate articles, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, create or wire GitHub tokens, write to GitHub, switch public visibility, mutate public indexes, trigger deployment or publish anything.

## Audit Result

AG20A controlled static apply readiness package passed audit with zero failed checks.

## Decision

AG20C may proceed only as Controlled Static Apply Final Authorization.

Not approved: approval phrase execution, real candidate apply, GitHub token creation, GitHub write, public visibility switch, public index mutation, deployment trigger, publish execution or Supabase/Auth/backend activation.

## Approval Phrase

Future controlled static apply still requires the exact phrase:

\`Proceed with first controlled static apply\`

This phrase is not executed in AG20B.

## Supabase/Auth Reminder

Hybrid staged path remains in force: static/GitHub-controlled go-live first; Supabase/Auth/backend later only after explicit reminder, review and approval.

## Next Stage

AG20C — Controlled Static Apply Final Authorization — only with explicit approval.
`;

writeJson(out.review, review);
writeJson(out.audit, audit);
writeJson(out.decision, decision);
writeJson(out.safety, safety);
writeJson(out.readiness, readiness);
writeJson(out.boundary, boundary);
writeJson(out.schema, schema);
writeJson(out.learning, learning);
writeJson(out.registry, registry);
writeJson(out.preview, preview);
writeText(out.doc, doc);

console.log("✅ AG20B Controlled Static Apply Readiness Audit generated.");
console.log("✅ AG20A readiness audit passed with zero failed checks.");
console.log("✅ Decision recorded: proceed only to AG20C final authorization package.");
console.log("✅ Explicit approval phrase remains required but not executed.");
console.log("✅ GitHub token, GitHub write, visibility switch, public index mutation, deployment and publishing remain blocked.");
console.log("✅ Supabase/Auth/backend remains deferred.");
console.log("✅ AG20C Controlled Static Apply Final Authorization boundary created.");
