import fs from "node:fs";
import path from "node:path";

const registryPath = path.join(process.cwd(), "data", "quality", "lr00-live-readiness-review-before-runtime-backend-activation.json");
const docPath = path.join(process.cwd(), "docs", "quality", "LR00_LIVE_READINESS_REVIEW_BEFORE_RUNTIME_BACKEND_ACTIVATION.md");
const previewPath = path.join(process.cwd(), "data", "quality", "lr00-live-readiness-review-preview.json");
const qa01Path = path.join(process.cwd(), "data", "quality", "qa01-build-asset-seo-link-smoke-test-plan.json");
const qa01PreviewPath = path.join(process.cwd(), "data", "quality", "qa01-build-asset-seo-link-smoke-preview.json");
const packagePath = path.join(process.cwd(), "package.json");

function fail(message) {
  console.error(`❌ LR00 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, previewPath, qa01Path, qa01PreviewPath, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing LR00 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
const qa01 = JSON.parse(fs.readFileSync(qa01Path, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "LR00") fail("module_id must be LR00");
if (preview.module_id !== "LR00") fail("preview output module_id must be LR00");
if (preview.preview_only !== true) fail("preview output must be preview_only=true");

if (qa01.recommended_next_stage?.module_id !== "LR00") {
  fail("QA01 must recommend LR00 as next stage before LR00 proceeds");
}

for (const dep of ["QA01", "QA00", "ID02", "IR00"]) {
  if (!registry.depends_on.includes(dep)) fail(`LR00 must depend on ${dep}`);
}

for (const flag of [
  "runtime_enabled",
  "server_endpoint_enabled",
  "api_route_enabled",
  "backend_activation_enabled",
  "supabase_enabled",
  "auth_enabled",
  "payment_enabled",
  "admin_ui_enabled",
  "subscriber_output_enabled",
  "public_dynamic_output_enabled",
  "homepage_mutation_enabled",
  "asset_mutation_enabled",
  "seo_metadata_mutation_enabled",
  "sitemap_mutation_enabled",
  "language_runtime_mutation_enabled",
  "file_deletion_enabled",
  "file_move_enabled",
  "gitignore_modification_enabled",
  "ml_ingestion_enabled",
  "embedding_generation_enabled",
  "model_training_enabled",
  "vector_database_write_enabled",
  "external_api_fetch_enabled",
  "frontend_deployment_enabled",
  "backend_deployment_enabled",
  "activation_decision_enabled"
]) {
  if (registry[flag] !== false) fail(`${flag} must remain false in LR00`);
}

for (const area of [
  "validation",
  "repo",
  "asset",
  "link",
  "seo",
  "language",
  "hero_visual",
  "responsive",
  "console",
  "deployment",
  "activation_boundary"
]) {
  if (!registry.review_areas.includes(area)) fail(`Missing review area: ${area}`);
}

for (const status of [
  "pass",
  "warning",
  "blocker",
  "manual_check_required",
  "acceptable_for_now",
  "not_checked",
  "not_applicable"
]) {
  if (!registry.allowed_review_statuses.includes(status)) fail(`Missing review status: ${status}`);
}

for (const decision of [
  "no_go_for_activation",
  "conditional_go_for_manual_live_review",
  "go_for_static_live_observation_only",
  "no_go_until_findings_reviewed",
  "go_for_fix_patch_only"
]) {
  if (!registry.allowed_decisions.includes(decision)) fail(`Missing allowed decision: ${decision}`);
}

if (!Array.isArray(registry.review_items) || registry.review_items.length < 12) {
  fail("LR00 must declare at least 12 review items");
}

for (const item of registry.review_items) {
  for (const field of ["item_key", "area", "check", "status"]) {
    if (!(field in item)) fail(`Review item missing field: ${field}`);
  }
  if (!registry.review_areas.includes(item.area)) fail(`Unknown review area: ${item.area}`);
  if (!registry.allowed_review_statuses.includes(item.status)) fail(`Invalid review status: ${item.status}`);
}

for (const key of [
  "runtime_activation",
  "backend_activation",
  "supabase_activation",
  "auth_activation",
  "api_activation",
  "payment_activation",
  "admin_activation",
  "public_dynamic_output_activation",
  "subscriber_output_activation",
  "ml_embedding_activation"
]) {
  if (registry.default_activation_decision[key] !== "no_go_for_activation") {
    fail(`Default activation decision for ${key} must be no_go_for_activation`);
  }
}

for (const field of registry.preview_required_fields) {
  if (!(field in preview)) fail(`Preview output missing field: ${field}`);
}

if (preview.summary.mutation_performed_count !== 0) fail("mutation_performed_count must be zero");
if (preview.summary.activation_performed_count !== 0) fail("activation_performed_count must be zero");

for (const falseField of [
  "homepage_mutation_enabled",
  "asset_mutation_enabled",
  "backend_activation_enabled",
  "api_route_enabled",
  "supabase_enabled",
  "auth_enabled",
  "public_dynamic_output_enabled",
  "subscriber_output_enabled",
  "frontend_deployment_enabled",
  "backend_deployment_enabled"
]) {
  if (preview.summary[falseField] !== false) fail(`Preview summary ${falseField} must be false`);
}

for (const noGoField of [
  "runtime_activation",
  "backend_activation",
  "supabase_activation",
  "auth_activation",
  "api_activation",
  "public_dynamic_output_activation",
  "subscriber_output_activation"
]) {
  if (preview.decision[noGoField] !== "no_go_for_activation") {
    fail(`Preview decision ${noGoField} must be no_go_for_activation`);
  }
}

for (const item of preview.review_items) {
  if (item.mutation_performed !== false) fail(`Review item ${item.item_key} must not mutate files`);
  if (item.activation_performed !== false) fail(`Review item ${item.item_key} must not activate anything`);
  if (!registry.allowed_review_statuses.includes(item.status)) fail(`Preview item ${item.item_key} invalid status`);
}

if (registry.finding_treatment.auto_fix_allowed !== false) fail("Auto-fix must be false");
if (registry.finding_treatment.auto_delete_allowed !== false) fail("Auto-delete must be false");
if (registry.finding_treatment.requires_separate_fix_patch !== true) fail("Findings must require a separate fix patch");

for (const blocked of registry.blocked_capabilities) {
  if (!preview.blocked_capabilities.includes(blocked)) {
    fail(`Preview missing blocked capability: ${blocked}`);
  }
}

if (registry.recommended_next_stage?.module_id !== "LF00") {
  fail("LR00 recommended next stage must be LF00");
}
if (registry.recommended_next_stage?.runtime_allowed !== false) fail("LF00 runtime_allowed must be false");
if (registry.recommended_next_stage?.deployment_allowed !== false) fail("LF00 deployment_allowed must be false");
if (registry.recommended_next_stage?.activation_decision_allowed !== false) fail("LF00 activation decision must be false");

for (const scriptName of ["generate:lr00", "validate:lr00", "validate:live", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing required npm script: ${scriptName}`);
}

for (const phrase of [
  "Live Readiness Doctrine",
  "Review Areas",
  "Findings Treatment",
  "Live Review Decision Doctrine",
  "Manual Live Review Checklist",
  "Backend Activation Boundary",
  "Recommended Follow-up Logic",
  "Explicit Exclusions",
  "LR00 does not"
]) {
  if (!docText.includes(phrase)) fail(`LR00 document missing phrase: ${phrase}`);
}

pass("LR00 registry is present.");
pass("LR00 document is present.");
pass("LR00 live-readiness review preview is present and marked preview-only.");
pass("QA00 and QA01 evidence is reviewed.");
pass("Missing asset/link findings are recorded without auto-fix or mutation.");
pass("Live-readiness decision remains non-activation.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("Manual live review checklist is declared.");
pass("LF00 is recorded as the recommended findings review/fix-plan stage.");
pass("LR00 is live-readiness-review-only and safe to commit.");
