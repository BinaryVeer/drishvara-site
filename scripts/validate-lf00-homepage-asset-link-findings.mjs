import fs from "node:fs";
import path from "node:path";

const registryPath = path.join(process.cwd(), "data", "quality", "lf00-homepage-asset-link-findings-review-fix-plan.json");
const docPath = path.join(process.cwd(), "docs", "quality", "LF00_HOMEPAGE_ASSET_LINK_FINDINGS_REVIEW_FIX_PLAN.md");
const previewPath = path.join(process.cwd(), "data", "quality", "lf00-homepage-asset-link-findings-preview.json");
const lr00Path = path.join(process.cwd(), "data", "quality", "lr00-live-readiness-review-before-runtime-backend-activation.json");
const lr00PreviewPath = path.join(process.cwd(), "data", "quality", "lr00-live-readiness-review-preview.json");
const qa01PreviewPath = path.join(process.cwd(), "data", "quality", "qa01-build-asset-seo-link-smoke-preview.json");
const packagePath = path.join(process.cwd(), "package.json");

function fail(message) {
  console.error(`❌ LF00 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, previewPath, lr00Path, lr00PreviewPath, qa01PreviewPath, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing LF00 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
const lr00 = JSON.parse(fs.readFileSync(lr00Path, "utf8"));
const qa01Preview = JSON.parse(fs.readFileSync(qa01PreviewPath, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "LF00") fail("module_id must be LF00");
if (preview.module_id !== "LF00") fail("preview output module_id must be LF00");
if (preview.preview_only !== true) fail("preview output must be preview_only=true");

if (lr00.recommended_next_stage?.module_id !== "LF00") {
  fail("LR00 must recommend LF00 as next stage before LF00 proceeds");
}

for (const dep of ["LR00", "QA01", "QA00"]) {
  if (!registry.depends_on.includes(dep)) fail(`LF00 must depend on ${dep}`);
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
  "activation_decision_enabled",
  "auto_fix_enabled"
]) {
  if (registry[flag] !== false) fail(`${flag} must remain false in LF00`);
}

for (const cls of [
  "critical_asset_candidate",
  "hero_visual_candidate",
  "logo_candidate",
  "language_runtime_candidate",
  "stylesheet_candidate",
  "script_candidate",
  "image_candidate",
  "favicon_or_og_candidate",
  "non_critical_asset_candidate",
  "unknown_asset_candidate"
]) {
  if (!registry.asset_finding_classes.includes(cls)) fail(`Missing asset finding class: ${cls}`);
}

for (const cls of [
  "primary_navigation_candidate",
  "cta_candidate",
  "article_link_candidate",
  "footer_link_candidate",
  "internal_page_candidate",
  "unknown_link_candidate"
]) {
  if (!registry.link_finding_classes.includes(cls)) fail(`Missing link finding class: ${cls}`);
}

for (const action of [
  "verify_reference",
  "restore_missing_file",
  "correct_path",
  "replace_with_existing_asset",
  "remove_dead_reference",
  "create_target_page_later",
  "defer_if_non_critical",
  "manual_live_check_required"
]) {
  if (!registry.recommended_action_types.includes(action)) fail(`Missing action type: ${action}`);
}

for (const field of registry.preview_required_fields) {
  if (!(field in preview)) fail(`Preview output missing field: ${field}`);
}

const expectedAssetCount = qa01Preview?.summary?.missing_local_asset_count;
const expectedLinkCount = qa01Preview?.summary?.missing_local_link_count;

if (preview.summary.asset_finding_count !== expectedAssetCount) {
  fail(`Asset finding count must match QA01 missing asset count (${expectedAssetCount})`);
}

if (preview.summary.link_finding_count !== expectedLinkCount) {
  fail(`Link finding count must match QA01 missing link count (${expectedLinkCount})`);
}

if (preview.summary.auto_fix_performed_count !== 0) fail("auto_fix_performed_count must be zero");
if (preview.summary.mutation_performed_count !== 0) fail("mutation_performed_count must be zero");

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

for (const finding of [...preview.asset_findings, ...preview.link_findings]) {
  for (const field of ["finding_id", "reference", "finding_class", "severity", "recommended_action", "manual_review_required", "auto_fix_performed", "mutation_performed"]) {
    if (!(field in finding)) fail(`Finding missing field: ${field}`);
  }
  if (finding.manual_review_required !== true) fail(`Finding ${finding.finding_id} must require manual review`);
  if (finding.auto_fix_performed !== false) fail(`Finding ${finding.finding_id} must not auto-fix`);
  if (finding.mutation_performed !== false) fail(`Finding ${finding.finding_id} must not mutate files`);
}

if (preview.decision.activation_allowed !== false) fail("LF00 must not allow activation");
if (registry.recommended_next_stage?.module_id !== "LF01") fail("LF00 recommended next stage must be LF01");
if (registry.recommended_next_stage?.runtime_allowed !== false) fail("LF01 runtime_allowed must be false");
if (registry.recommended_next_stage?.deployment_allowed !== false) fail("LF01 deployment_allowed must be false");
if (registry.recommended_next_stage?.activation_decision_allowed !== false) fail("LF01 activation decision must be false");

for (const blocked of registry.blocked_capabilities) {
  if (!preview.blocked_capabilities.includes(blocked)) {
    fail(`Preview missing blocked capability: ${blocked}`);
  }
}

for (const scriptName of ["generate:lf00", "validate:lf00", "validate:findings", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing required npm script: ${scriptName}`);
}

for (const phrase of [
  "Findings Review Doctrine",
  "Asset Finding Classification",
  "Link Finding Classification",
  "Recommended Action Types",
  "Fix Patch Boundary",
  "No-Mutation Doctrine",
  "Manual Review Checklist",
  "Live Confidence Decision Doctrine",
  "Explicit Exclusions",
  "LF00 does not"
]) {
  if (!docText.includes(phrase)) fail(`LF00 document missing phrase: ${phrase}`);
}

pass("LF00 registry is present.");
pass("LF00 document is present.");
pass("LF00 findings review/fix-plan preview is present and marked preview-only.");
pass("QA01 and LR00 evidence is reviewed.");
pass("Missing local asset and link findings are extracted and classified.");
pass("Recommended actions are declared without auto-fix or mutation.");
pass("No homepage, asset, SEO, language runtime, backend, API, Supabase, Auth, ML, public/subscriber output, deployment, deletion, or movement is enabled.");
pass("LF01 is recorded as the recommended targeted fix patch stage.");
pass("LF00 is findings-review/fix-plan-only and safe to commit.");
