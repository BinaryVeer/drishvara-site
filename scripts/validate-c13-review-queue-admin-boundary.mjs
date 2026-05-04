import fs from "node:fs";
import path from "node:path";

const registryPath = path.join(process.cwd(), "data", "content", "c13-content-asset-review-queue-admin-boundary-plan.json");
const docPath = path.join(process.cwd(), "docs", "content", "C13_CONTENT_ASSET_REVIEW_QUEUE_ADMIN_BOUNDARY_PLAN.md");
const c12PreviewPath = path.join(process.cwd(), "data", "content", "content-asset-verification-review-preview.json");
const packagePath = path.join(process.cwd(), "package.json");

function fail(message) {
  console.error(`❌ C13 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, c12PreviewPath, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing C13 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const c12Preview = JSON.parse(fs.readFileSync(c12PreviewPath, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "C13") fail("module_id must be C13");

for (const dep of ["C01", "C02", "C03", "C04", "C05", "C06", "C07", "C08", "C09", "C10", "C11", "C12", "I00"]) {
  if (!registry.depends_on.includes(dep)) fail(`C13 must depend on ${dep}`);
}

if (c12Preview.module_id !== "C12" || c12Preview.preview_only !== true) {
  fail("C13 requires C12 preview output to exist and remain preview-only");
}

for (const flag of [
  "runtime_enabled",
  "server_endpoint_enabled",
  "api_route_enabled",
  "subscriber_output_enabled",
  "public_output_enabled",
  "public_guidance_enabled",
  "external_api_fetch_enabled",
  "auth_enabled",
  "payment_enabled",
  "supabase_enabled",
  "rls_enabled",
  "admin_review_enabled",
  "admin_ui_enabled",
  "admin_route_enabled",
  "review_queue_write_enabled",
  "live_review_queue_enabled",
  "reviewer_assignment_enabled",
  "approval_enabled",
  "public_safe_approval_enabled",
  "source_approval_enabled",
  "rights_approval_enabled",
  "image_approval_enabled",
  "ml_training_approval_enabled",
  "embedding_approval_enabled",
  "article_mutation_enabled",
  "homepage_mutation_enabled",
  "sitemap_mutation_enabled",
  "seo_metadata_mutation_enabled",
  "image_registry_write_enabled",
  "quality_metadata_write_enabled",
  "selection_memory_write_enabled",
  "manual_override_enabled",
  "final_registry_write_enabled",
  "database_migration_enabled",
  "ml_ingestion_enabled",
  "embedding_generation_enabled",
  "model_training_enabled",
  "vector_database_write_enabled",
  "link_crawling_enabled",
  "image_download_enabled"
]) {
  if (registry[flag] !== false) fail(`${flag} must remain false in C13`);
}

if (!Array.isArray(registry.live_output_files_created) || registry.live_output_files_created.length !== 0) {
  fail("C13 must not create live output files");
}

for (const field of [
  "queue_item_id",
  "source_preview_ref",
  "review_item_id",
  "asset_id",
  "asset_type",
  "title",
  "article_path",
  "assigned_review_stage",
  "current_review_status",
  "priority",
  "required_reviews",
  "metadata_gaps",
  "blockers",
  "reviewer_role_required",
  "reviewer_assigned_to",
  "reviewer_decision",
  "reviewer_note",
  "approval_status",
  "public_safe_status",
  "source_status",
  "rights_status",
  "quality_status",
  "duplicate_status",
  "image_status",
  "hindi_readiness_status",
  "ml_training_eligible",
  "embedding_eligible",
  "registry_write_allowed",
  "audit_trace_id",
  "created_at",
  "updated_at",
  "next_action"
]) {
  if (!registry.future_review_queue_item_required_fields.includes(field)) {
    fail(`Missing future review queue field: ${field}`);
  }
}

for (const status of [
  "queued",
  "assigned",
  "under_review",
  "source_review_pending",
  "rights_review_pending",
  "quality_review_pending",
  "duplicate_review_pending",
  "image_review_pending",
  "hindi_review_pending",
  "public_safety_review_pending",
  "editorial_review_pending",
  "approved_for_public_candidate",
  "rejected",
  "needs_revision",
  "blocked",
  "archived",
  "closed_no_action"
]) {
  if (!registry.future_queue_statuses.includes(status)) {
    fail(`Missing future queue status: ${status}`);
  }
}

for (const approval of [
  "source_approval",
  "rights_approval",
  "image_approval",
  "quality_approval",
  "public_safe_approval",
  "editorial_approval",
  "ml_training_approval",
  "embedding_approval"
]) {
  if (!registry.approval_categories_separate.includes(approval)) {
    fail(`Missing separate approval category: ${approval}`);
  }
}

for (const requirement of [
  "auth",
  "role_based_access",
  "reviewer_role_mapping",
  "supabase_or_approved_storage",
  "rls_policy",
  "audit_trail",
  "rollback_path",
  "approval_separation",
  "public_output_block",
  "ml_output_block",
  "service_role_key_safety"
]) {
  if (!registry.future_admin_requirements.includes(requirement)) {
    fail(`Missing future admin requirement: ${requirement}`);
  }
}

for (const role of [
  "content_editor",
  "source_reviewer",
  "rights_reviewer",
  "image_reviewer",
  "quality_reviewer",
  "hindi_reviewer",
  "duplicate_reviewer",
  "public_safety_reviewer",
  "ml_eligibility_reviewer",
  "embedding_reviewer",
  "admin_owner",
  "final_approver"
]) {
  if (!registry.future_reviewer_roles.includes(role)) {
    fail(`Missing future reviewer role: ${role}`);
  }
}

for (const decision of [
  "approve_for_next_review",
  "request_revision",
  "request_source_details",
  "request_rights_details",
  "request_image_replacement",
  "request_hindi_review",
  "mark_duplicate",
  "select_canonical_asset",
  "mark_reference_only",
  "mark_internal_only",
  "reject_asset",
  "keep_blocked",
  "escalate_to_admin_owner"
]) {
  if (!registry.future_reviewer_decisions.includes(decision)) {
    fail(`Missing future reviewer decision: ${decision}`);
  }
}

for (const field of [
  "audit_trace_id",
  "queue_item_id",
  "action",
  "previous_status",
  "new_status",
  "reviewer_role",
  "reviewer_id_or_label",
  "timestamp",
  "decision_reason",
  "affected_fields",
  "rollback_available",
  "public_output_changed",
  "ml_eligibility_changed",
  "embedding_eligibility_changed"
]) {
  if (!registry.future_audit_trace_fields.includes(field)) {
    fail(`Missing future audit trace field: ${field}`);
  }
}

for (const req of [
  "table_schema",
  "migration_plan",
  "rls_policy",
  "auth_role_mapping",
  "service_role_key_boundary",
  "backup_and_rollback",
  "seed_import_policy",
  "read_write_separation",
  "local_preview_fallback",
  "admin_approval_flow"
]) {
  if (!registry.future_supabase_requirements_before_activation.includes(req)) {
    fail(`Missing future Supabase requirement: ${req}`);
  }
}

for (const req of [
  "explicit",
  "dry_run_first",
  "idempotent",
  "auditable",
  "reversible",
  "approval_gated",
  "non_public_by_default",
  "non_ml_by_default"
]) {
  if (!registry.future_import_requirements.includes(req)) {
    fail(`Missing future import requirement: ${req}`);
  }
}

for (const blocked of registry.blocked_capabilities) {
  if (![
    "live_review_queue",
    "admin_ui",
    "admin_route",
    "api_route",
    "supabase_table",
    "database_migration",
    "auth",
    "payment",
    "supabase",
    "rls",
    "reviewer_assignment",
    "asset_approval",
    "public_safe_approval",
    "source_approval",
    "rights_approval",
    "image_approval",
    "ml_training_approval",
    "embedding_approval",
    "article_mutation",
    "homepage_mutation",
    "sitemap_mutation",
    "seo_metadata_mutation",
    "final_registry_write",
    "image_registry_write",
    "verified_link_registry_write",
    "selection_memory_write",
    "external_api_fetch",
    "link_crawling",
    "image_download",
    "embedding_generation",
    "model_training",
    "vector_database_write",
    "public_output",
    "subscriber_output"
  ].includes(blocked)) {
    fail(`Unexpected blocked capability label: ${blocked}`);
  }
}

for (const scriptName of ["validate:c13", "validate:content", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing required npm script: ${scriptName}`);
}

for (const phrase of [
  "Review Queue Schema Doctrine",
  "Queue Status Doctrine",
  "Approval Boundary Doctrine",
  "Admin Boundary Doctrine",
  "Reviewer Role Doctrine",
  "Review Decision Doctrine",
  "Audit Trail Doctrine",
  "Supabase Boundary Doctrine",
  "Public Output Boundary Doctrine",
  "ML and Embedding Boundary Doctrine",
  "Import Boundary Doctrine",
  "Admin UI Boundary Doctrine",
  "Explicit Exclusions",
  "C13 does not"
]) {
  if (!docText.includes(phrase)) fail(`C13 document missing phrase: ${phrase}`);
}

pass("C13 registry is present.");
pass("C13 document is present.");
pass("C13 references C12 preview output while keeping it preview-only.");
pass("Future review queue item schema, statuses, approvals, roles, decisions, and audit fields are declared.");
pass("Admin, Supabase, public output, ML/embedding, import, and UI boundaries are declared.");
pass("No live queue, admin UI, Supabase, Auth, approval, registry write, ML, embedding, public output, or subscriber output is enabled.");
pass("C13 is content-governance/schema-only and safe to commit.");
