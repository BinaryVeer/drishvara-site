import fs from "node:fs";
import path from "node:path";

const registryPath = path.join(process.cwd(), "data", "review", "r03-backup-archive-repo-cleanliness-policy.json");
const docPath = path.join(process.cwd(), "docs", "review", "R03_BACKUP_ARCHIVE_REPO_CLEANLINESS_POLICY.md");
const packagePath = path.join(process.cwd(), "package.json");

function fail(message) {
  console.error(`❌ R03 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing R03 artifact: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));

if (registry.module_id !== "R03") fail("module_id must be R03");

for (const dep of ["M00", "M01", "M02", "M03", "M04", "M04A", "M05", "M06", "M06A", "M07", "M08", "M09", "M10", "R00", "R01", "R02"]) {
  if (!registry.depends_on.includes(dep)) fail(`R03 must depend on ${dep}`);
}

for (const flag of [
  "runtime_enabled",
  "server_endpoint_enabled",
  "subscriber_output_enabled",
  "public_output_enabled",
  "public_guidance_enabled",
  "public_panchang_enabled",
  "public_festival_dates_enabled",
  "external_api_fetch_enabled",
  "auth_enabled",
  "payment_enabled",
  "supabase_enabled",
  "dashboard_card_runtime_enabled",
  "internal_preview_runtime_enabled",
  "automatic_activation_enabled",
  "automatic_database_mutation_enabled",
  "cleanup_execution_enabled",
  "file_deletion_enabled",
  "file_movement_enabled",
  "gitignore_modification_enabled"
]) {
  if (registry[flag] !== false) fail(`${flag} must remain false in R03`);
}

for (const artifactClass of [
  "html_backup_file",
  "js_backup_file",
  "index_backup_file",
  "image_generation_artifact",
  "archive_folder",
  "hero_asset_folder",
  "methodology_artifact",
  "production_runtime_file",
  "unknown_untracked_file"
]) {
  if (!registry.artifact_classes.includes(artifactClass)) {
    fail(`Missing artifact class: ${artifactClass}`);
  }
}

for (const pattern of [
  "index.backup-*.html",
  "index.html.backup-*",
  "*.backup-*",
  "assets/js/*.backup-*",
  "data/ChatGPT Image*.png"
]) {
  if (!registry.backup_patterns_recorded.includes(pattern)) {
    fail(`Missing backup pattern: ${pattern}`);
  }
}

for (const folder of ["archive/", "assets/hero/"]) {
  if (!registry.folder_patterns_recorded.includes(folder)) {
    fail(`Missing folder pattern: ${folder}`);
  }
}

for (const protectedPath of [
  "docs/methodology/",
  "data/methodology/",
  "docs/review/",
  "data/review/",
  "scripts/validate-*.mjs",
  "package.json"
]) {
  if (!registry.protected_methodology_paths.includes(protectedPath)) {
    fail(`Missing protected methodology path: ${protectedPath}`);
  }
}

for (const status of [
  "unreviewed",
  "retain",
  "archive_inside_repo",
  "archive_outside_repo",
  "add_to_gitignore",
  "delete_after_approval",
  "convert_to_reference_asset",
  "production_file_do_not_touch",
  "methodology_artifact_do_not_touch",
  "needs_human_review"
]) {
  if (!registry.cleanup_decision_statuses.includes(status)) {
    fail(`Missing cleanup decision status: ${status}`);
  }
}

for (const field of [
  "item_id",
  "path",
  "artifact_class",
  "current_git_status",
  "size_if_known",
  "last_modified_if_known",
  "suspected_origin",
  "risk_level",
  "proposed_action",
  "approval_required",
  "reviewer_note",
  "final_status"
]) {
  if (!registry.cleanup_register_required_fields.includes(field)) {
    fail(`Missing cleanup register field: ${field}`);
  }
}

for (const decision of [
  "do_not_delete_files_in_r03",
  "do_not_move_files_in_r03",
  "do_not_modify_gitignore_in_r03",
  "do_not_commit_backup_files_in_r03",
  "record_policy_only",
  "allow_i00_to_proceed_with_clean_boundary",
  "create_c00_only_if_cleanup_execution_is_required"
]) {
  if (!registry.r03_policy_decisions.includes(decision)) {
    fail(`Missing R03 policy decision: ${decision}`);
  }
}

if (registry.future_optional_cleanup_step?.module_id !== "C00") {
  fail("Future optional cleanup step must be C00");
}

if (registry.future_optional_cleanup_step?.deletion_requires_explicit_approval !== true) {
  fail("C00 deletion must require explicit approval");
}

for (const scriptName of ["validate:r03", "validate:methodology"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing required npm script: ${scriptName}`);
}

for (const phrase of [
  "Backup File Policy",
  "Archive Folder Policy",
  "Asset Folder Policy",
  "Git Ignore Policy",
  "Production File Protection Doctrine",
  "Methodology Artifact Protection Doctrine",
  "Cleanup Decision Status",
  "Cleanup Register Doctrine",
  "Risk Doctrine",
  "Future Optional Cleanup Step",
  "R03 does not perform cleanup"
]) {
  if (!docText.includes(phrase)) fail(`R03 document missing phrase: ${phrase}`);
}

pass("R03 registry is present.");
pass("R03 document is present.");
pass("Backup, archive, asset, and gitignore policies are documented.");
pass("Production and methodology artifact protection doctrines are documented.");
pass("Cleanup decision statuses and cleanup register structure are documented.");
pass("R03 explicitly disables deletion, movement, gitignore modification, runtime, and public output.");
pass("Future cleanup execution is deferred to optional C00 with explicit approval.");
pass("R03 is review-only and safe to commit.");
