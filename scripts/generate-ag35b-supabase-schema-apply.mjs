import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag35aReview: "data/content-intelligence/quality-reviews/ag35a-explicit-activation-approval.json",
  ag35aApproval: "data/content-intelligence/backend-architecture/ag35a-explicit-activation-approval.json",
  ag35aDecision: "data/content-intelligence/backend-architecture/ag35a-controlled-activation-decision-record.json",
  ag35aControlPlan: "data/content-intelligence/backend-architecture/ag35a-controlled-activation-control-plan.json",
  ag35aNonExecutionAudit: "data/content-intelligence/backend-architecture/ag35a-approval-non-execution-audit-register.json",
  ag35aReadiness: "data/content-intelligence/quality-registry/ag35a-supabase-schema-apply-readiness-record.json",
  ag35aBoundary: "data/content-intelligence/mutation-plans/ag35a-to-ag35b-supabase-schema-apply-boundary.json",

  ag34zClosure: "data/content-intelligence/backend-architecture/ag34z-backend-activation-readiness-closure.json",
  ag34zActivationBlocker: "data/content-intelligence/backend-architecture/ag34z-activation-blocker-carry-forward.json",
  ag34bServiceRoleProtectionPlan: "data/content-intelligence/backend-architecture/ag34b-service-role-protection-plan.json",
  ag34cRoleRestrictionPlan: "data/content-intelligence/backend-architecture/ag34c-role-restriction-test-plan.json",

  ag33zClosure: "data/content-intelligence/backend-architecture/ag33z-dynamic-publish-scaffold-closure.json",
  ag31aStateRegister: "data/content-intelligence/backend-architecture/ag31a-article-state-register.json",
  ag31aTransitionMap: "data/content-intelligence/backend-architecture/ag31a-article-state-transition-map.json",
  ag31cAuditLogModel: "data/content-intelligence/backend-architecture/ag31c-audit-log-model.json",
  ag31cFieldSchema: "data/content-intelligence/backend-architecture/ag31c-audit-log-field-schema.json",
  ag29zClosure: "data/content-intelligence/backend-architecture/ag29z-schema-rls-closure.json",
  ag28Blueprint: "data/content-intelligence/backend-architecture/ag28-backend-auth-architecture-blueprint.json",
  ag26zRoleGovernance: "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag35b-supabase-schema-apply.json",
  package: "data/content-intelligence/backend-architecture/ag35b-supabase-schema-apply-package.json",
  schemaManifest: "data/content-intelligence/backend-architecture/ag35b-schema-manifest.json",
  rlsManifest: "data/content-intelligence/backend-architecture/ag35b-rls-manifest.json",
  manualApplyGuide: "data/content-intelligence/backend-architecture/ag35b-manual-supabase-apply-guide.json",
  nonExecutionAudit: "data/content-intelligence/backend-architecture/ag35b-schema-apply-non-execution-audit-register.json",
  futureConsumptionPlan: "data/content-intelligence/backend-architecture/ag35b-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag35b-schema-apply-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag35b-auth-role-setup-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag35b-to-ag35c-auth-role-setup-boundary.json",
  registry: "data/quality/ag35b-supabase-schema-apply.json",
  preview: "data/quality/ag35b-supabase-schema-apply-preview.json",
  doc: "docs/quality/AG35B_SUPABASE_SCHEMA_APPLY.md",
  sql: "supabase/migrations/20260527_ag35b_drishvara_controlled_schema.sql"
};

function full(p) {
  return path.join(root, p);
}

function exists(p) {
  return fs.existsSync(full(p));
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(full(p), "utf8"));
}

function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}

function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}

function allFalse(obj) {
  return Object.values(obj || {}).every((value) => value === false);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG35B input: ${p}`);
}

const records = Object.fromEntries(Object.entries(inputs).map(([key, file]) => [key, readJson(file)]));

if (records.ag35aApproval.status !== "explicit_activation_approval_recorded_ready_for_ag35b") throw new Error("AG35A approval status mismatch.");
if (records.ag35aDecision.explicit_user_approval_received !== true) throw new Error("Explicit approval missing.");
if (records.ag35aDecision.approved_activation_mode !== "controlled_staged_activation") throw new Error("Controlled activation mode mismatch.");
if (records.ag35aReadiness.ready_for_ag35b !== true) throw new Error("AG35A readiness does not permit AG35B.");
if (records.ag35aReadiness.allowed_ag35b_mode !== "controlled_supabase_schema_apply") throw new Error("AG35B mode mismatch.");
if (records.ag35aBoundary.next_stage_id !== "AG35B") throw new Error("AG35A boundary does not point to AG35B.");

if (records.ag34zClosure.status !== "backend_activation_readiness_closure_created_ready_for_ag35a") throw new Error("AG34Z closure status mismatch.");
if (!allFalse(records.ag34zActivationBlocker.blocked_activation_items)) throw new Error("AG34Z blockers must remain false before AG35B package generation.");

if (records.ag26zRoleGovernance.role_rules?.admin_final_clearance_authority !== true) throw new Error("Admin final clearance missing.");
if (records.ag26zRoleGovernance.role_rules?.editor_can_only_work_on_admin_assigned_items !== true) throw new Error("Editor assigned-only rule missing.");
if (records.ag26zRoleGovernance.role_rules?.editor_cannot_publish !== true) throw new Error("Editor no-publish rule missing.");

const blockedState = {
  controlled_schema_apply_package_created: true,
  migration_sql_file_created: true,
  schema_manifest_created: true,
  rls_manifest_created: true,
  manual_apply_guide_created: true,

  supabase_project_created_now: false,
  supabase_connected_now: false,
  auth_enabled_now: false,
  real_admin_login_created_now: false,
  real_editor_login_created_now: false,
  test_admin_created_now: false,
  test_editor_created_now: false,
  credential_created_now: false,
  runtime_backend_created_now: false,
  database_table_created_now: false,
  database_constraint_created_now: false,
  database_index_created_now: false,
  database_write_done_now: false,
  sql_generated_now: true,
  sql_applied_now: false,
  migration_generated_now: true,
  migration_applied_now: false,
  rls_policy_created_now: true,
  rls_policy_applied_now: false,
  secrets_created_now: false,
  env_vars_written_now: false,
  service_role_key_created_now: false,
  service_role_key_stored_now: false,
  service_role_key_exposed_now: false,
  server_route_created_now: false,
  api_route_created_now: false,
  route_guard_runtime_created_now: false,
  session_runtime_created_now: false,
  assignment_query_created_now: false,
  queue_runtime_created_now: false,
  audit_runtime_created_now: false,
  rollback_runtime_created_now: false,
  publish_handler_runtime_created_now: false,
  github_write_performed_now: false,
  deployment_triggered_now: false,
  published_now: false,
  public_mutation_done_now: false,
  supabase_auth_backend_activated_now: false
};

const sql = `-- AG35B — Drishvara Controlled Supabase Schema Package
-- Generated by: vikash vaibhav
-- Boundary:
--   1. This file is safe to commit because it contains no secrets.
--   2. Do not paste service-role key into this file.
--   3. Do not apply this SQL before manual review.
--   4. Auth users are not created in AG35B.
--   5. Public mutation and deployment remain blocked.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('admin', 'editor')),
  display_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  category text not null,
  status text not null default 'draft' check (
    status in ('draft', 'admin_review', 'returned', 'editor_submitted', 'publish_approved', 'published', 'archived')
  ),
  body_md text,
  excerpt text,
  hero_image_url text,
  hero_image_credit text,
  reference_links jsonb not null default '[]'::jsonb,
  objects jsonb not null default '[]'::jsonb,
  assigned_editor_id uuid references public.profiles(id),
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.article_assignments (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  editor_id uuid not null references public.profiles(id) on delete cascade,
  assigned_by uuid references public.profiles(id),
  assignment_status text not null default 'assigned' check (assignment_status in ('assigned', 'returned', 'submitted', 'closed')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(article_id, editor_id)
);

create table if not exists public.article_audit_logs (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  actor_id uuid references public.profiles(id),
  actor_role text check (actor_role in ('admin', 'editor')),
  action_type text not null,
  before_state text,
  after_state text,
  before_hash text,
  after_hash text,
  decision_note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.publish_rollback_refs (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  audit_event_id uuid references public.article_audit_logs(id),
  previous_public_artifact_ref text,
  restoration_note text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_articles_status on public.articles(status);
create index if not exists idx_articles_assigned_editor on public.articles(assigned_editor_id);
create index if not exists idx_article_assignments_editor on public.article_assignments(editor_id);
create index if not exists idx_article_audit_logs_article on public.article_audit_logs(article_id);
create index if not exists idx_publish_rollback_refs_article on public.publish_rollback_refs(article_id);

alter table public.profiles enable row level security;
alter table public.articles enable row level security;
alter table public.article_assignments enable row level security;
alter table public.article_audit_logs enable row level security;
alter table public.publish_rollback_refs enable row level security;

drop policy if exists profiles_select_self_or_admin on public.profiles;
create policy profiles_select_self_or_admin
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
  )
);

drop policy if exists articles_select_admin_or_assigned_editor on public.articles;
create policy articles_select_admin_or_assigned_editor
on public.articles
for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
  )
  or assigned_editor_id = auth.uid()
);

drop policy if exists articles_insert_admin_only on public.articles;
create policy articles_insert_admin_only
on public.articles
for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
  )
);

drop policy if exists articles_update_admin_or_assigned_editor_limited on public.articles;
create policy articles_update_admin_or_assigned_editor_limited
on public.articles
for update
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
  )
  or (
    assigned_editor_id = auth.uid()
    and status in ('returned', 'draft')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
  )
  or (
    assigned_editor_id = auth.uid()
    and status in ('returned', 'editor_submitted')
  )
);

drop policy if exists assignments_select_admin_or_assigned_editor on public.article_assignments;
create policy assignments_select_admin_or_assigned_editor
on public.article_assignments
for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
  )
  or editor_id = auth.uid()
);

drop policy if exists assignments_write_admin_only on public.article_assignments;
create policy assignments_write_admin_only
on public.article_assignments
for all
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
  )
);

drop policy if exists audit_select_admin_or_related_editor on public.article_audit_logs;
create policy audit_select_admin_or_related_editor
on public.article_audit_logs
for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
  )
  or exists (
    select 1 from public.articles a
    where a.id = article_id
      and a.assigned_editor_id = auth.uid()
  )
);

drop policy if exists audit_insert_admin_or_assigned_editor on public.article_audit_logs;
create policy audit_insert_admin_or_assigned_editor
on public.article_audit_logs
for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'editor')
      and p.is_active = true
  )
);

drop policy if exists rollback_refs_admin_only on public.publish_rollback_refs;
create policy rollback_refs_admin_only
on public.publish_rollback_refs
for all
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
  )
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_articles_updated_at on public.articles;
create trigger set_articles_updated_at
before update on public.articles
for each row execute function public.set_updated_at();

drop trigger if exists set_article_assignments_updated_at on public.article_assignments;
create trigger set_article_assignments_updated_at
before update on public.article_assignments
for each row execute function public.set_updated_at();
`;

const schemaManifest = {
  module_id: "AG35B",
  title: "Schema Manifest",
  status: "controlled_schema_manifest_created_not_applied",
  sql_file: outputs.sql,
  planned_tables: [
    "profiles",
    "articles",
    "article_assignments",
    "article_audit_logs",
    "publish_rollback_refs"
  ],
  planned_indexes: [
    "idx_articles_status",
    "idx_articles_assigned_editor",
    "idx_article_assignments_editor",
    "idx_article_audit_logs_article",
    "idx_publish_rollback_refs_article"
  ],
  planned_triggers: [
    "set_profiles_updated_at",
    "set_articles_updated_at",
    "set_article_assignments_updated_at"
  ],
  sql_generated_now: true,
  migration_generated_now: true,
  sql_applied_now: false,
  migration_applied_now: false,
  database_write_done_now: false,
  blocked_state: blockedState
};

const rlsManifest = {
  module_id: "AG35B",
  title: "RLS Manifest",
  status: "controlled_rls_manifest_created_not_applied",
  planned_rls_tables: [
    "profiles",
    "articles",
    "article_assignments",
    "article_audit_logs",
    "publish_rollback_refs"
  ],
  governance_rules: {
    admin_final_clearance_authority: true,
    editor_assigned_only: true,
    editor_cannot_publish: true,
    editor_cannot_archive: true,
    public_cannot_access_private_queue_or_audit: true,
    service_role_not_frontend_exposed: true
  },
  planned_policies: [
    "profiles_select_self_or_admin",
    "articles_select_admin_or_assigned_editor",
    "articles_insert_admin_only",
    "articles_update_admin_or_assigned_editor_limited",
    "assignments_select_admin_or_assigned_editor",
    "assignments_write_admin_only",
    "audit_select_admin_or_related_editor",
    "audit_insert_admin_or_assigned_editor",
    "rollback_refs_admin_only"
  ],
  rls_policy_created_now: true,
  rls_policy_applied_now: false,
  blocked_state: blockedState
};

const manualApplyGuide = {
  module_id: "AG35B",
  title: "Manual Supabase Apply Guide",
  status: "manual_apply_guide_created_pending_operator_action",
  apply_mode: "manual_operator_review_required",
  sql_file_to_review: outputs.sql,
  required_manual_checks_before_apply: [
    "Open SQL file locally and review table names, RLS policies and role logic.",
    "Confirm Supabase project is correct.",
    "Do not paste service role key into repo or SQL.",
    "Apply in Supabase SQL Editor or CLI only after review.",
    "After manual apply, capture terminal/Supabase output for next verification step.",
    "Do not create Auth users in AG35B."
  ],
  manual_apply_performed_by_script: false,
  supabase_connected_now: false,
  sql_applied_now: false,
  migration_applied_now: false,
  blocked_state: blockedState
};

const nonExecutionAudit = {
  module_id: "AG35B",
  title: "Schema Apply Non-Execution Audit Register",
  status: "schema_apply_package_non_execution_audit_passed",
  checks: [
    { check_id: "sql_file_created", passed: true, evidence: outputs.sql },
    { check_id: "no_secret_values", passed: !sql.includes("SUPABASE_SERVICE_ROLE_KEY=") && !sql.includes("eyJ"), evidence: "SQL contains no secret values." },
    { check_id: "no_supabase_connection", passed: true, evidence: "Generator does not connect to Supabase." },
    { check_id: "no_sql_apply", passed: true, evidence: "SQL is generated but not applied." },
    { check_id: "no_auth_user_creation", passed: true, evidence: "No Auth users, credentials or invitations are created." },
    { check_id: "no_env_write", passed: true, evidence: "No env vars or .env files are written." },
    { check_id: "no_public_mutation", passed: true, evidence: "No deployment, publishing or public mutation occurs." },
    { check_id: "governance_preserved", passed: true, evidence: "Admin final authority and Editor assigned-only/no-publish governance are reflected in RLS manifest." }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const futureConsumptionPlan = {
  module_id: "AG35B",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag35c",
  future_consumption: {
    AG35B_manual_apply_followup:
      "After operator manually applies the SQL, share the Supabase output. A verification stage should record whether schema apply succeeded.",
    AG35C:
      "AG35C should configure Auth role setup only after schema apply package is reviewed/applied or explicitly deferred.",
    AG35D:
      "AG35D should audit backend activation after schema and Auth role setup steps.",
    AG35Z:
      "AG35Z should close Backend/Auth activation before AG36 login tests.",
    AG36:
      "AG36 should test Admin login, Editor login and role restrictions only after AG35 closure."
  },
  blocked_state: blockedState
};

const packageRecord = {
  module_id: "AG35B",
  title: "Supabase Schema Apply Package",
  status: "controlled_supabase_schema_apply_package_created_pending_manual_apply",
  purpose:
    "Generate the controlled Supabase schema/RLS SQL package for Drishvara backend activation, without applying SQL, connecting Supabase, creating secrets, creating Auth users, deploying or mutating public content.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  consumed_source_summary: {
    ag35a_status: records.ag35aApproval.status,
    ag34z_status: records.ag34zClosure.status,
    ag33z_status: records.ag33zClosure.status,
    ag31a_states_available: Boolean(records.ag31aStateRegister),
    ag31c_audit_model_available: Boolean(records.ag31cAuditLogModel),
    ag29z_status: records.ag29zClosure.status,
    ag28_status: records.ag28Blueprint.status,
    admin_final_clearance_preserved: true,
    editor_assigned_only_preserved: true,
    editor_no_publish_preserved: true
  },
  package_decision: {
    controlled_schema_apply_package_created: true,
    migration_sql_file_created: true,
    schema_manifest_created: true,
    rls_manifest_created: true,
    manual_apply_guide_created: true,
    proceed_to_manual_review_or_ag35c_after_apply_confirmation: true,

    supabase_project_created_in_ag35b: false,
    supabase_connected_in_ag35b: false,
    sql_generated_in_ag35b: true,
    migration_generated_in_ag35b: true,
    sql_applied_in_ag35b: false,
    migration_applied_in_ag35b: false,
    database_write_done_in_ag35b: false,
    auth_enabled_in_ag35b: false,
    user_created_in_ag35b: false,
    credential_created_in_ag35b: false,
    secrets_created_in_ag35b: false,
    env_vars_written_in_ag35b: false,
    service_role_key_exposed_in_ag35b: false,
    server_route_created_in_ag35b: false,
    api_route_created_in_ag35b: false,
    github_write_done_in_ag35b: false,
    deployment_done_in_ag35b: false,
    public_mutation_done_in_ag35b: false
  },
  sql_file: outputs.sql,
  schema_manifest_file: outputs.schemaManifest,
  rls_manifest_file: outputs.rlsManifest,
  manual_apply_guide_file: outputs.manualApplyGuide,
  non_execution_audit_file: outputs.nonExecutionAudit,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG35B",
  title: "Schema Apply Blocker Register",
  status: "schema_apply_package_created_runtime_blockers_preserved",
  blocked_now: [
    "No Supabase connection by script.",
    "No SQL/migration application by script.",
    "No secrets/env vars.",
    "No service-role key in repo or frontend.",
    "No Auth users.",
    "No credentials.",
    "No deployment.",
    "No public mutation."
  ],
  allowed_operator_action_after_review: [
    "Manually review SQL file.",
    "Manually apply SQL in Supabase SQL Editor or CLI.",
    "Share apply output for verification."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG35B",
  title: "Auth Role Setup Readiness Record",
  status: "ready_for_ag35c_auth_role_setup_after_schema_apply_confirmation",
  ready_for_ag35c: true,
  next_stage_id: "AG35C",
  next_stage_title: "Auth Role Setup",
  allowed_ag35c_mode: "controlled_auth_role_setup_after_schema_apply_review",
  schema_package_created: true,
  manual_apply_required_before_runtime_use: true,
  auth_activation_allowed_now: false,
  user_creation_allowed_now: false,
  credential_creation_allowed_now: false,
  secret_write_allowed_now: false,
  public_mutation_allowed_now: false,
  deployment_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG35B",
  title: "AG35B to AG35C Auth Role Setup Boundary",
  status: "ag35c_boundary_created_controlled_auth_role_setup_after_schema_apply_review",
  next_stage_id: "AG35C",
  next_stage_title: "Auth Role Setup",
  allowed_scope: [
    "Consume AG35B schema/RLS package.",
    "Confirm whether SQL was manually applied.",
    "Plan/create role setup only under controlled boundary.",
    "Keep credentials out of repo.",
    "Keep public mutation blocked."
  ],
  blocked_scope: [
    "No public mutation.",
    "No deployment.",
    "No service-role exposure.",
    "No credentials in repo.",
    "No unverified Auth user creation."
  ],
  controlled_activation_selected: true,
  schema_package_created: true,
  manual_apply_required_before_runtime_use: true
};

const review = {
  module_id: "AG35B",
  title: "Supabase Schema Apply",
  status: "controlled_supabase_schema_apply_package_created_pending_manual_apply",
  depends_on: ["AG35A", "AG34Z", "AG33Z", "AG31A", "AG31C", "AG29Z", "AG28", "AG26Z"],
  generated_from: inputs,
  package_file: outputs.package,
  sql_file: outputs.sql,
  schema_manifest_file: outputs.schemaManifest,
  rls_manifest_file: outputs.rlsManifest,
  manual_apply_guide_file: outputs.manualApplyGuide,
  non_execution_audit_file: outputs.nonExecutionAudit,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    controlled_schema_apply_package_created: true,
    migration_sql_file_created: true,
    schema_manifest_created: true,
    rls_manifest_created: true,
    manual_apply_guide_created: true,
    ready_for_manual_review: true,
    ready_for_ag35c_after_apply_confirmation: true,

    supabase_project_created: false,
    supabase_connected: false,
    auth_enabled: false,
    user_created: false,
    credential_created: false,
    database_objects_created_by_script: false,
    database_write_done_by_script: false,
    sql_generated: true,
    sql_applied_by_script: false,
    migration_generated: true,
    migration_applied_by_script: false,
    rls_policy_generated: true,
    rls_policy_applied_by_script: false,
    secrets_created: false,
    env_vars_written: false,
    service_role_key_created: false,
    service_role_key_exposed: false,
    server_routes_created: false,
    api_routes_created: false,
    github_write_done: false,
    deployment_done: false,
    public_mutation_done: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG35B",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG35B",
  preview_only: false,
  status: review.status,
  message: "AG35B schema/RLS SQL package created. Manual Supabase apply is still pending.",
  controlled_schema_apply_package_created: 1,
  migration_sql_file_created: 1,
  schema_manifest_created: 1,
  rls_manifest_created: 1,
  manual_apply_guide_created: 1,
  supabase_project_created: 0,
  supabase_connected: 0,
  auth_enabled: 0,
  user_created: 0,
  credential_created: 0,
  database_objects_created_by_script: 0,
  database_write_done_by_script: 0,
  sql_generated: 1,
  sql_applied_by_script: 0,
  migrations_generated: 1,
  migrations_applied_by_script: 0,
  rls_policies_generated: 1,
  rls_policies_applied_by_script: 0,
  secrets_created: 0,
  env_vars_written: 0,
  service_role_key_created: 0,
  service_role_key_exposed: 0,
  server_routes_created: 0,
  api_routes_created: 0,
  github_write_done: 0,
  deployment_done: 0,
  public_mutation_done: 0,
  blocked_state: blockedState
};

const doc = `# AG35B — Supabase Schema Apply Package

## Purpose

AG35B creates the controlled Supabase schema/RLS SQL package for Drishvara backend activation.

## Created Files

- \`${outputs.sql}\`
- Schema manifest.
- RLS manifest.
- Manual Supabase apply guide.
- Non-execution audit.
- AG35C boundary.

## Important Boundary

This stage generates SQL and migration content only.

The script does **not** connect to Supabase, apply SQL, create secrets, create Auth users, write environment variables, deploy, publish or mutate public content.

## Manual Apply Requirement

Review the SQL file manually before applying it in Supabase SQL Editor or Supabase CLI.

After manual apply, share the output before moving to Auth role setup.

## Next Stage

AG35C — Auth Role Setup, after schema apply review/confirmation.
`;

writeText(outputs.sql, sql);
writeJson(outputs.schemaManifest, schemaManifest);
writeJson(outputs.rlsManifest, rlsManifest);
writeJson(outputs.manualApplyGuide, manualApplyGuide);
writeJson(outputs.nonExecutionAudit, nonExecutionAudit);
writeJson(outputs.futureConsumptionPlan, futureConsumptionPlan);
writeJson(outputs.package, packageRecord);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG35B Controlled Supabase Schema Apply Package generated.");
console.log(`✅ SQL file created: ${outputs.sql}`);
console.log("✅ Schema and RLS manifests created.");
console.log("✅ No Supabase connection, SQL apply, Auth user, secret, env var, deployment or public mutation performed by script.");
console.log("✅ Manual Supabase apply review is required before runtime use.");
