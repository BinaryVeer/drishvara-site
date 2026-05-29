import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function articleHashAcceptedByRepairChain(recordedHash, currentHash, articlePath = null) {
  if (recordedHash === currentHash) return true;

  const repairRecords = [
    {
      path: "data/content-intelligence/apply-records/ag12c-r1-public-object-label-layout-repair.json",
      status: "public_object_label_layout_repair_applied"
    },
    {
      path: "data/content-intelligence/apply-records/ar01-r1-credit-reference-surface-cleanup.json",
      status: "credit_reference_surface_cleanup_applied"
    }
  ];

  const edges = [];

  for (const repairRecord of repairRecords) {
    const fullRepairPath = path.join(root, repairRecord.path);
    if (!fs.existsSync(fullRepairPath)) continue;

    try {
      const record = JSON.parse(fs.readFileSync(fullRepairPath, "utf8"));
      const articlePathMatches =
        articlePath === null ||
        articlePath === undefined ||
        record.selected_article_path === articlePath;

      if (
        record.status === repairRecord.status &&
        articlePathMatches &&
        record.pre_repair_hash &&
        record.post_repair_hash
      ) {
        edges.push([record.pre_repair_hash, record.post_repair_hash]);
      }
    } catch {}
  }

  function canReach(start, target) {
    if (!start || !target) return false;

    let current = start;
    const seen = new Set([current]);

    for (let i = 0; i < edges.length + 3; i += 1) {
      if (current === target) return true;

      const edge = edges.find(([from]) => from === current);
      if (!edge) return false;

      current = edge[1];
      if (seen.has(current)) return false;
      seen.add(current);
    }

    return current === target;
  }

  return canReach(recordedHash, currentHash) || canReach(currentHash, recordedHash);
}

function hashPairMatchesCurrentOrAg12cR1Repair(leftHash, rightHash, articlePath = null) {
  return articleHashAcceptedByRepairChain(leftHash, rightHash, articlePath);
}


function exists(p) {
  return fs.existsSync(path.join(root, p));
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
}

function fail(msg) {
  console.error(`❌ AG32C validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag32b-return-archive-handler-plan.json",
  "data/content-intelligence/backend-architecture/ag32b-return-to-editor-handler-plan.json",
  "data/content-intelligence/backend-architecture/ag32b-archive-handler-plan.json",
  "data/content-intelligence/backend-architecture/ag32b-return-archive-handler-non-activation-audit-register.json",
  "data/content-intelligence/quality-registry/ag32b-publish-guard-rules-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag32b-to-ag32c-publish-guard-rules-boundary.json",
  "data/content-intelligence/backend-architecture/ag32a-publish-handler-plan.json",
  "data/content-intelligence/backend-architecture/ag32a-publish-handler-precondition-register.json",
  "data/content-intelligence/backend-architecture/ag32a-publish-public-filter-model.json",
  "data/content-intelligence/backend-architecture/ag32a-publish-audit-rollback-requirement.json",
  "data/content-intelligence/backend-architecture/ag32a-publish-handler-non-activation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag31z-queue-integration-closure.json",
  "data/content-intelligence/backend-architecture/ag31z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag31d-state-transition-audit.json",
  "data/content-intelligence/backend-architecture/ag31d-illegal-transition-audit-register.json",
  "data/content-intelligence/backend-architecture/ag31d-admin-approval-gate-audit-register.json",
  "data/content-intelligence/backend-architecture/ag31d-editor-restriction-audit-register.json",
  "data/content-intelligence/backend-architecture/ag31d-publish-path-audit-register.json",
  "data/content-intelligence/backend-architecture/ag31c-audit-log-field-schema.json",
  "data/content-intelligence/backend-architecture/ag31c-before-after-hash-model.json",
  "data/content-intelligence/backend-architecture/ag31a-article-state-transition-map.json",
  "data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  "data/content-intelligence/quality-reviews/ag32c-publish-guard-rules.json",
  "data/content-intelligence/backend-architecture/ag32c-publish-guard-rules.json",
  "data/content-intelligence/backend-architecture/ag32c-admin-role-guard-model.json",
  "data/content-intelligence/backend-architecture/ag32c-approved-state-hash-guard-model.json",
  "data/content-intelligence/backend-architecture/ag32c-public-filter-audit-rollback-guard-model.json",
  "data/content-intelligence/backend-architecture/ag32c-forbidden-publish-path-guard-register.json",
  "data/content-intelligence/backend-architecture/ag32c-guard-rules-non-activation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag32c-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag32c-publish-guard-rules-blocker-register.json",
  "data/content-intelligence/quality-registry/ag32c-handler-architecture-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag32c-to-ag32d-handler-architecture-audit-boundary.json",
  "data/quality/ag32c-publish-guard-rules.json",
  "data/quality/ag32c-publish-guard-rules-preview.json",
  "docs/quality/AG32C_PUBLISH_GUARD_RULES.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag32c-publish-guard-rules.json");
const rules = readJson("data/content-intelligence/backend-architecture/ag32c-publish-guard-rules.json");
const adminGuard = readJson("data/content-intelligence/backend-architecture/ag32c-admin-role-guard-model.json");
const stateHashGuard = readJson("data/content-intelligence/backend-architecture/ag32c-approved-state-hash-guard-model.json");
const auditRollbackGuard = readJson("data/content-intelligence/backend-architecture/ag32c-public-filter-audit-rollback-guard-model.json");
const forbiddenGuard = readJson("data/content-intelligence/backend-architecture/ag32c-forbidden-publish-path-guard-register.json");
const nonActivation = readJson("data/content-intelligence/backend-architecture/ag32c-guard-rules-non-activation-audit-register.json");
const consumption = readJson("data/content-intelligence/backend-architecture/ag32c-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag32c-publish-guard-rules-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag32c-handler-architecture-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag32c-to-ag32d-handler-architecture-audit-boundary.json");
const registry = readJson("data/quality/ag32c-publish-guard-rules.json");
const preview = readJson("data/quality/ag32c-publish-guard-rules-preview.json");

const ag32b = readJson("data/content-intelligence/backend-architecture/ag32b-return-archive-handler-plan.json");
const ag32bReadiness = readJson("data/content-intelligence/quality-registry/ag32b-publish-guard-rules-readiness-record.json");
const ag32bNonActivation = readJson("data/content-intelligence/backend-architecture/ag32b-return-archive-handler-non-activation-audit-register.json");
const ag32a = readJson("data/content-intelligence/backend-architecture/ag32a-publish-handler-plan.json");
const ag32aNonActivation = readJson("data/content-intelligence/backend-architecture/ag32a-publish-handler-non-activation-audit-register.json");
const ag31z = readJson("data/content-intelligence/backend-architecture/ag31z-queue-integration-closure.json");
const ag31zBlocker = readJson("data/content-intelligence/backend-architecture/ag31z-activation-blocker-carry-forward.json");
const ag31d = readJson("data/content-intelligence/backend-architecture/ag31d-state-transition-audit.json");
const ag31dPublish = readJson("data/content-intelligence/backend-architecture/ag31d-publish-path-audit-register.json");
const ag31aTransition = readJson("data/content-intelligence/backend-architecture/ag31a-article-state-transition-map.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const pkg = readJson("package.json");

if (review.status !== "publish_guard_rules_created_ready_for_ag32d") fail("Review status mismatch.");
if (rules.status !== "publish_guard_rules_created_ready_for_ag32d") fail("Rules status mismatch.");
if (rules.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (rules.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (rules.rules_decision.non_active_publish_guard_rules_created !== true) fail("Rules decision missing.");
if (rules.rules_decision.admin_role_guard_model_created !== true) fail("Admin guard decision missing.");
if (!hashPairMatchesCurrentOrAg12cR1Repair(rules.rules_decision.approved_state_hash_guard_created, true, typeof articlePath !== "undefined" ? articlePath : null)) fail("State/hash guard decision missing. or AG12C-R1/AR01-R1 approved repair-chain state missing");
if (rules.rules_decision.public_filter_audit_rollback_guard_created !== true) fail("Audit/rollback guard decision missing.");
if (rules.rules_decision.forbidden_publish_path_guard_created !== true) fail("Forbidden guard decision missing.");
if (rules.rules_decision.proceed_to_ag32d_handler_architecture_audit !== true) fail("AG32D readiness missing.");

for (const flag of [
  "publish_guard_runtime_approved_now",
  "publish_handler_runtime_approved_now",
  "route_guard_runtime_approved_now",
  "public_filter_runtime_approved_now",
  "audit_runtime_approved_now",
  "hash_runtime_approved_now",
  "rollback_runtime_approved_now",
  "database_creation_approved_now",
  "migration_generation_approved_now",
  "sql_generation_approved_now",
  "rls_policy_application_approved_now",
  "auth_activation_approved_now",
  "backend_connection_approved_now",
  "supabase_connection_approved_now",
  "server_route_creation_approved_now",
  "api_route_creation_approved_now",
  "secret_creation_approved_now",
  "env_var_write_approved_now",
  "deployment_approved_now",
  "public_mutation_approved_now"
]) {
  if (rules.rules_decision[flag] !== false) fail(`${flag} must be false.`);
}

for (const flag of [
  "publish_guard_runtime_allowed_in_ag32c",
  "publish_handler_runtime_allowed_in_ag32c",
  "route_guard_runtime_allowed_in_ag32c",
  "public_filter_runtime_allowed_in_ag32c",
  "audit_runtime_allowed_in_ag32c",
  "hash_runtime_allowed_in_ag32c",
  "rollback_runtime_allowed_in_ag32c",
  "database_creation_allowed_in_ag32c",
  "migration_generation_allowed_in_ag32c",
  "sql_generation_allowed_in_ag32c",
  "rls_policy_application_allowed_in_ag32c",
  "auth_activation_allowed_in_ag32c",
  "backend_connection_allowed_in_ag32c",
  "supabase_connection_allowed_in_ag32c",
  "server_route_creation_allowed_in_ag32c",
  "api_route_creation_allowed_in_ag32c",
  "secret_creation_allowed_in_ag32c",
  "env_var_write_allowed_in_ag32c",
  "deployment_allowed_in_ag32c",
  "public_mutation_allowed_in_ag32c"
]) {
  if (rules[flag] !== false) fail(`${flag} must be false.`);
}

if (adminGuard.status !== "admin_role_guard_model_created_no_runtime") fail("Admin guard status mismatch.");
if (adminGuard.required_future_role !== "admin") fail("Admin role guard must require Admin.");
if (adminGuard.required_final_clearance !== true) fail("Admin final clearance required missing.");
if (adminGuard.editor_explicitly_blocked !== true) fail("Editor explicit block missing.");
if (adminGuard.execute_now !== false) fail("Admin guard must not execute.");
if (adminGuard.runtime_created !== false) fail("Admin guard runtime must be false.");
if (adminGuard.auth_created !== false) fail("Auth must not be created.");
if (adminGuard.route_guard_created !== false) fail("Route guard must not be created.");

if (stateHashGuard.status !== "approved_state_hash_guard_model_created_no_runtime") fail("State/hash guard status mismatch.");
if (stateHashGuard.required_input_state !== "publish_approved") fail("Input state must be publish_approved.");
if (stateHashGuard.required_output_state !== "published") fail("Output state must be published.");
if (!hashPairMatchesCurrentOrAg12cR1Repair(stateHashGuard.required_hashes.before_hash_required, true, typeof articlePath !== "undefined" ? articlePath : null)) fail("before_hash required missing. or AG12C-R1/AR01-R1 approved repair-chain state missing");
if (!hashPairMatchesCurrentOrAg12cR1Repair(stateHashGuard.required_hashes.after_hash_required, true, typeof articlePath !== "undefined" ? articlePath : null)) fail("after_hash required missing. or AG12C-R1/AR01-R1 approved repair-chain state missing");
if (!stateHashGuard.forbidden_input_states.includes("draft")) fail("draft forbidden input missing.");
if (!stateHashGuard.forbidden_input_states.includes("admin_review")) fail("admin_review forbidden input missing.");
if (!hashPairMatchesCurrentOrAg12cR1Repair(stateHashGuard.execute_now, false, typeof articlePath !== "undefined" ? articlePath : null)) fail("State/hash guard must not execute. or AG12C-R1/AR01-R1 approved repair-chain state missing");
if (!hashPairMatchesCurrentOrAg12cR1Repair(stateHashGuard.hash_runtime_created, false, typeof articlePath !== "undefined" ? articlePath : null)) fail("Hash runtime must be false. or AG12C-R1/AR01-R1 approved repair-chain state missing");
if (stateHashGuard.state_runtime_created !== false) fail("State runtime must be false.");

if (auditRollbackGuard.status !== "public_filter_audit_rollback_guard_model_created_no_runtime") fail("Audit/rollback guard status mismatch.");
for (const check of ["state_is_publish_approved", "admin_final_clearance_exists", "audit_and_rollback_ready"]) {
  if (!auditRollbackGuard.required_public_filter_checks.includes(check)) fail(`Missing public filter check: ${check}`);
}
for (const field of ["actor_id", "before_state", "after_state", "before_hash", "after_hash", "created_at"]) {
  if (!auditRollbackGuard.required_audit_fields.includes(field)) fail(`Missing audit field: ${field}`);
}
if (auditRollbackGuard.required_rollback.rollback_reference_required !== true) fail("Rollback reference missing.");
if (auditRollbackGuard.execute_now !== false) fail("Audit/rollback guard must not execute.");
if (auditRollbackGuard.public_filter_runtime_created !== false) fail("Public filter runtime must be false.");
if (auditRollbackGuard.audit_runtime_created !== false) fail("Audit runtime must be false.");
if (auditRollbackGuard.rollback_runtime_created !== false) fail("Rollback runtime must be false.");
if (auditRollbackGuard.public_mutation_done !== false) fail("Public mutation must be false.");

if (forbiddenGuard.status !== "forbidden_publish_path_guard_register_created_no_runtime") fail("Forbidden guard status mismatch.");
for (const forbidden of ["draft_to_published", "editor_publish", "public_mutation_without_audit", "public_mutation_without_rollback"]) {
  if (!forbiddenGuard.forbidden_paths.includes(forbidden)) fail(`Missing forbidden path: ${forbidden}`);
}
for (const [key, value] of Object.entries(forbiddenGuard.guard_result)) {
  if (value !== true) fail(`${key} must be true.`);
}
if (forbiddenGuard.execute_now !== false) fail("Forbidden path guard must not execute.");
if (forbiddenGuard.runtime_created !== false) fail("Forbidden path runtime must be false.");
if (forbiddenGuard.public_mutation_done !== false) fail("Forbidden public mutation must be false.");

if (nonActivation.status !== "guard_rules_non_activation_audit_passed") fail("Non-activation status mismatch.");
if (nonActivation.audit_passed !== true) fail("Non-activation audit must pass.");
for (const check of nonActivation.checks) {
  if (check.passed !== true) fail(`Non-activation check failed: ${check.check_id}`);
}

if (!consumption.future_consumption?.AG32D) fail("AG32D consumption note missing.");
if (!consumption.future_consumption?.AG32Z) fail("AG32Z consumption note missing.");
if (!consumption.future_consumption?.AG33) fail("AG33 consumption note missing.");
if (!consumption.future_consumption?.AG34) fail("AG34 consumption note missing.");

if (blocker.status !== "publish_guard_rules_operations_blocked_pending_ag32d") fail("Blocker status mismatch.");
if (readiness.ready_for_ag32d !== true) fail("AG32D readiness missing.");
if (readiness.allowed_ag32d_mode !== "non_active_handler_architecture_audit_only") fail("AG32D mode mismatch.");
if (readiness.real_execution_allowed_now !== false) fail("Real execution must be false.");
if (readiness.publish_guard_runtime_allowed_now !== false) fail("Publish guard runtime must be false.");
if (readiness.publish_handler_runtime_allowed_now !== false) fail("Publish handler runtime must be false.");
if (readiness.public_mutation_allowed_now !== false) fail("Public mutation must be false.");

if (boundary.next_stage_id !== "AG32D") fail("Boundary must point to AG32D.");
if (boundary.status !== "ag32d_boundary_created_non_active_handler_architecture_audit_only") fail("Boundary status mismatch.");
if (boundary.backend_planning_selected !== true) fail("Backend planning must be selected.");
if (boundary.backend_activation_deferred !== true) fail("Backend activation must be deferred.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must be deferred.");
if (boundary.explicit_approval_required_before_real_activation !== true) fail("Explicit approval before real activation required.");

if (review.summary.publish_guard_rules_created !== true) fail("Review summary missing.");
if (review.summary.non_active_publish_guard_rules_only !== true) fail("Non-active rules summary missing.");
if (review.summary.ready_for_ag32d !== true) fail("AG32D readiness summary missing.");

for (const flag of [
  "publish_guard_runtime_allowed_now",
  "publish_handler_runtime_allowed_now",
  "route_guard_runtime_allowed_now",
  "public_filter_runtime_allowed_now",
  "audit_runtime_allowed_now",
  "hash_runtime_allowed_now",
  "rollback_runtime_allowed_now",
  "database_creation_allowed_now",
  "migration_generation_allowed_now",
  "sql_generation_allowed_now",
  "rls_policy_application_allowed_now",
  "auth_activation_allowed_now",
  "backend_connection_allowed_now",
  "supabase_connection_allowed_now",
  "server_route_creation_allowed_now",
  "api_route_creation_allowed_now",
  "secret_creation_allowed_now",
  "env_var_write_allowed_now",
  "deployment_done",
  "public_mutation_done",
  "real_execution_done"
]) {
  if (review.summary[flag] !== false) fail(`${flag} must be false.`);
}

if (ag32b.status !== "return_archive_handler_plan_created_ready_for_ag32c") fail("AG32B source status mismatch.");
if (ag32bReadiness.ready_for_ag32c !== true) fail("AG32B readiness must allow AG32C.");
if (ag32bNonActivation.audit_passed !== true) fail("AG32B non-activation audit must pass.");
if (ag32a.status !== "publish_handler_plan_created_ready_for_ag32b") fail("AG32A source status mismatch.");
if (ag32aNonActivation.audit_passed !== true) fail("AG32A non-activation audit must pass.");
if (ag31z.status !== "queue_integration_closure_created_ready_for_ag32") fail("AG31Z source status mismatch.");
for (const [key, value] of Object.entries(ag31zBlocker.blocked_activation_items)) {
  if (value !== false) fail(`AG31Z activation blocker must remain false: ${key}`);
}
if (ag31d.audit_decision.all_audits_passed !== true) fail("AG31D all audits must pass.");
if (ag31dPublish.audit_passed !== true) fail("AG31D publish audit must pass.");
if (!ag31aTransition.transitions.some((t) => t.from === "admin_review" && t.to === "publish_approved" && t.actor === "admin")) fail("Admin approval path missing.");
if (!ag31aTransition.transitions.some((t) => t.from === "publish_approved" && t.to === "published" && t.actor === "future_controlled_publish_handler")) fail("Controlled publish path missing.");
if (!ag31aTransition.forbidden_transitions.some((t) => t.actor === "editor" && t.to === "published")) fail("Editor publish block missing.");
if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");
if (ag26zRole.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only missing.");
if (ag26zRole.role_rules.editor_cannot_publish !== true) fail("Editor cannot publish missing.");

if (registry.status !== "publish_guard_rules_created_ready_for_ag32d") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.publish_guard_rules_created !== 1) fail("Preview rules missing.");
if (preview.publish_guard_runtime_created !== 0) fail("Preview guard runtime must be 0.");
if (preview.publish_handler_runtime_created !== 0) fail("Preview publish runtime must be 0.");
if (preview.route_guard_runtime_created !== 0) fail("Preview route guard runtime must be 0.");
if (preview.public_filter_runtime_created !== 0) fail("Preview public filter runtime must be 0.");
if (preview.audit_runtime_created !== 0) fail("Preview audit runtime must be 0.");
if (preview.hash_runtime_created !== 0) fail("Preview hash runtime must be 0.");
if (preview.rollback_runtime_created !== 0) fail("Preview rollback runtime must be 0.");
if (preview.database_objects_created !== 0) fail("Preview database objects must be 0.");
if (preview.migrations_generated !== 0) fail("Preview migrations must be 0.");
if (preview.sql_generated !== 0) fail("Preview SQL must be 0.");
if (preview.rls_policies_applied !== 0) fail("Preview RLS policies must be 0.");
if (preview.auth_enabled !== 0) fail("Preview Auth must be 0.");
if (preview.backend_connection_enabled !== 0) fail("Preview backend connection must be 0.");
if (preview.supabase_connection_enabled !== 0) fail("Preview Supabase connection must be 0.");
if (preview.secrets_created !== 0) fail("Preview secrets must be 0.");
if (preview.env_vars_written !== 0) fail("Preview env writes must be 0.");
if (preview.server_routes_created !== 0) fail("Preview server routes must be 0.");
if (preview.api_routes_created !== 0) fail("Preview API routes must be 0.");
if (preview.deployment_done !== 0) fail("Preview deployment must be 0.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");

for (const expectedInput of [
  "data/content-intelligence/backend-architecture/ag32b-return-archive-handler-plan.json",
  "data/content-intelligence/backend-architecture/ag32a-publish-handler-plan.json",
  "data/content-intelligence/backend-architecture/ag32a-publish-public-filter-model.json",
  "data/content-intelligence/backend-architecture/ag32a-publish-audit-rollback-requirement.json",
  "data/content-intelligence/backend-architecture/ag31d-publish-path-audit-register.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
]) {
  if (!rules.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Rules did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (
    k === "publish_guard_rules_created" ||
    k === "admin_role_guard_model_created" ||
    k === "approved_state_hash_guard_created" ||
    k === "public_filter_audit_rollback_guard_created" ||
    k === "forbidden_publish_path_guard_created" ||
    k === "guard_rules_non_activation_audit_created"
  ) {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag32c"]) fail("Missing generate:ag32c script.");
if (!pkg.scripts?.["validate:ag32c"]) fail("Missing validate:ag32c script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag32c")) fail("validate:project must include validate:ag32c.");

pass("AG32C Publish Guard Rules are present.");
pass("Admin role, approved state/hash, public filter, audit/rollback and forbidden path guards are valid.");
pass("No guard runtime, publish runtime, database, Auth/backend/Supabase activation, secrets, deployment or public mutation is enabled.");
pass("AG32D Handler Architecture Audit boundary is ready.");
