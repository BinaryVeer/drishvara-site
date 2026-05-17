import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/content-intelligence-foundation-alignment-review.json",
  "data/content-intelligence/quality-reviews/long-form-article-standard.json",
  "data/content-intelligence/quality-reviews/visual-data-infographic-requirement-schema-closure.json",
  "data/content-intelligence/visual-registry/visual-data-infographic-requirement-standard.json",
  "data/content-intelligence/schema/content-packet.schema.json",
  "data/content-intelligence/quality-reviews/reference-source-credibility-schema-closure.json",
  "data/content-intelligence/reference-registry/reference-source-credibility-standard.json",
  "data/content-intelligence/schema/reference-source-credibility.schema.json",
  "data/quality/ag06j-reference-source-credibility-schema-closure.json",
  "data/quality/ag06j-reference-source-credibility-schema-closure-preview.json",
  "docs/quality/AG06J_REFERENCE_SOURCE_CREDIBILITY_SCHEMA_CLOSURE.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG06J validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag06hR1 = readJson("data/content-intelligence/quality-reviews/content-intelligence-foundation-alignment-review.json");
const ag06e = readJson("data/content-intelligence/quality-reviews/long-form-article-standard.json");
const ag06i = readJson("data/content-intelligence/quality-reviews/visual-data-infographic-requirement-schema-closure.json");
const ag06iVisualStandard = readJson("data/content-intelligence/visual-registry/visual-data-infographic-requirement-standard.json");
const closure = readJson("data/content-intelligence/quality-reviews/reference-source-credibility-schema-closure.json");
const standard = readJson("data/content-intelligence/reference-registry/reference-source-credibility-standard.json");
const schema = readJson("data/content-intelligence/schema/reference-source-credibility.schema.json");
const registry = readJson("data/quality/ag06j-reference-source-credibility-schema-closure.json");
const preview = readJson("data/quality/ag06j-reference-source-credibility-schema-closure-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG06J_REFERENCE_SOURCE_CREDIBILITY_SCHEMA_CLOSURE.md"), "utf8");

for (const obj of [closure, standard, schema, registry, preview]) {
  if (obj.module_id !== "AG06J") fail(`module_id must be AG06J in ${obj.title || "preview"}`);
}

if (preview.preview_only !== true) fail("Preview must be preview-only");
if (registry.governance_only !== true) fail("Registry must be governance-only");
if (registry.schema_closure_only !== true) fail("Registry must be schema-closure-only");
if (closure.status !== "schema_closure_only") fail("Closure status must be schema_closure_only");
if (standard.status !== "schema_closure_only") fail("Standard status must be schema_closure_only");
if (schema.status !== "schema_only") fail("Schema status must be schema_only");

if (!Array.isArray(ag06hR1.corrected_remaining_path) || !ag06hR1.corrected_remaining_path.some((x) => x.next_stage === "AG06J")) {
  fail("AG06H-R1 corrected path must include AG06J");
}
if (ag06hR1.summary.ag07_blocked_until_ag06z !== true) fail("AG07 must remain blocked until AG06Z");
if (ag06i.summary.next_stage_id !== "AG06J") fail("AG06I must identify AG06J as next");
if (!ag06iVisualStandard.publish_readiness_gates.includes("visual_source_or_data_basis_recorded")) {
  fail("AG06I visual/source basis gate must remain present");
}

if (standard.summary.verified_reference_min_per_long_form_article !== ag06e.summary.verified_reference_min) fail("Verified reference minimum must align with AG06E");
if (standard.summary.verified_reference_max_per_long_form_article !== ag06e.summary.verified_reference_max) fail("Verified reference maximum must align with AG06E");
if (standard.summary.approved_reference_minimum_required_for_publish_ready !== ag06e.summary.verified_reference_min) fail("Approved reference minimum must equal AG06E minimum");
if (standard.summary.source_quality_score_required !== true) fail("Source quality score must be required for future readiness");
if (standard.summary.source_quality_score_min_publish_ready !== 85) fail("Source quality threshold must be 85");
if (standard.summary.link_health_review_required !== true) fail("Link health review must be required");
if (standard.summary.approved_and_rejected_source_trail_required !== true) fail("Approved/rejected trail must be required");
if (standard.summary.no_web_fetching_by_script !== true) fail("No web fetching by script must be true");
if (standard.summary.reference_url_population_allowed !== false) fail("Reference URL population must not be allowed");
if (standard.summary.reference_insertion_allowed !== false) fail("Reference insertion must not be allowed");
if (standard.summary.public_article_mutation_allowed !== false) fail("Public article mutation must not be allowed");

if (!Array.isArray(standard.source_type_taxonomy) || standard.source_type_taxonomy.length < 8) fail("Source type taxonomy must contain at least 8 types");
for (const sourceType of [
  "official_government_or_public_institution",
  "peer_reviewed_or_academic",
  "recognized_institutional_report",
  "credible_data_or_statistics_source",
  "reputable_news_or_wire",
  "primary_document_or_original_material",
  "weak_or_disallowed_source"
]) {
  if (!standard.source_type_taxonomy.find((x) => x.source_type === sourceType)) fail(`Missing source type: ${sourceType}`);
  if (!schema.source_type_taxonomy.includes(sourceType)) fail(`Schema missing source type: ${sourceType}`);
}

for (const tier of ["preferred", "accepted", "conditional", "restricted", "rejected"]) {
  if (!standard.credibility_tiers.find((x) => x.tier === tier)) fail(`Missing credibility tier: ${tier}`);
  if (!schema.credibility_tiers.includes(tier)) fail(`Schema missing credibility tier: ${tier}`);
}

for (const status of [
  "candidate_planned",
  "reachability_review_pending",
  "credibility_review_pending",
  "approved_for_content_packet",
  "approved_for_public_insertion_in_later_stage",
  "rejected",
  "under_editorial_verification"
]) {
  if (!standard.reference_lifecycle_statuses.includes(status)) fail(`Missing lifecycle status: ${status}`);
  if (!schema.reference_lifecycle_statuses.includes(status)) fail(`Schema missing lifecycle status: ${status}`);
}

for (const reason of [
  "unreachable_or_broken",
  "parked_domain_or_spam",
  "irrelevant_to_article_claim",
  "low_credibility_source",
  "better_primary_source_available"
]) {
  if (!standard.rejection_reasons.includes(reason)) fail(`Missing rejection reason: ${reason}`);
  if (!schema.rejection_reasons.includes(reason)) fail(`Schema missing rejection reason: ${reason}`);
}

for (const field of [
  "reference_id",
  "article_or_packet_id",
  "claim_or_section_supported",
  "candidate_url",
  "canonical_url",
  "title",
  "publisher_or_institution",
  "author_or_authoring_body",
  "source_type",
  "credibility_tier",
  "link_health_status",
  "approval_status",
  "rejection_reason",
  "reviewer_note"
]) {
  if (!standard.per_reference_candidate_required_fields.includes(field)) fail(`Missing per-reference required field: ${field}`);
  if (!schema.per_reference_candidate_required_fields.includes(field)) fail(`Schema missing per-reference required field: ${field}`);
}

for (const linkStatus of [
  "not_checked_in_ag06j",
  "manual_check_pending",
  "reachable",
  "broken",
  "parked_or_spam",
  "requires_replacement"
]) {
  if (!standard.allowed_link_health_statuses.includes(linkStatus)) fail(`Missing link-health status: ${linkStatus}`);
  if (!schema.allowed_link_health_statuses.includes(linkStatus)) fail(`Schema missing link-health status: ${linkStatus}`);
}

const sourceWeightTotal = Object.values(standard.source_quality_scoring.weights || {}).reduce((a, b) => a + b, 0);
if (sourceWeightTotal !== 100) fail(`Source quality scoring weights must total 100, got ${sourceWeightTotal}`);
if (standard.source_quality_scoring.publish_ready_minimum !== 85) fail("Source publish-ready threshold must be 85");

for (const gate of [
  "candidate_reference_pool_planned",
  "minimum_approved_reference_count_met",
  "source_type_recorded_for_each_reference",
  "credibility_tier_recorded_for_each_reference",
  "claim_or_section_supported_recorded",
  "link_health_review_pending_or_passed",
  "approved_and_rejected_source_trail_recorded",
  "source_quality_score_planned",
  "no_web_fetching_by_script_in_ag06j",
  "no_reference_insertion_in_ag06j",
  "no_public_article_mutation_in_ag06j"
]) {
  if (!standard.publish_readiness_gates.includes(gate)) fail(`Missing publish-readiness gate: ${gate}`);
  if (!schema.publish_readiness_gates.includes(gate)) fail(`Schema missing publish-readiness gate: ${gate}`);
}

if (closure.closure_decision.decision !== "reference_source_credibility_schema_closed_for_foundation") fail("Closure decision mismatch");
if (closure.closure_decision.proceed_to_ag06k_jsonl_first_content_intelligence_store_governance !== true) fail("AG06K must be next");
if (closure.closure_decision.web_fetching_by_script_allowed !== false) fail("Web fetching by script must not be allowed");
if (closure.closure_decision.reference_url_population_allowed !== false) fail("Reference URL population must not be allowed");
if (closure.closure_decision.reference_insertion_allowed !== false) fail("Reference insertion must not be allowed");
if (closure.closure_decision.public_article_mutation_allowed !== false) fail("Public article mutation must not be allowed");
if (closure.closure_decision.content_packet_generation_allowed !== false) fail("Content packet generation must not be allowed");
if (closure.closure_decision.publication_allowed !== false) fail("Publication must not be allowed");

for (const falseField of [
  "mutation_performed",
  "public_article_mutation_performed",
  "article_html_mutation_performed",
  "homepage_mutation_performed",
  "css_mutation_performed",
  "javascript_mutation_performed",
  "reference_url_change_performed",
  "reference_insertion_performed",
  "reference_url_population_performed",
  "verified_reference_population_performed",
  "candidate_reference_population_performed",
  "external_fetch_performed_by_script",
  "live_url_fetch_performed",
  "link_health_fetch_performed",
  "backend_activation_performed",
  "api_route_created",
  "supabase_enabled",
  "auth_enabled",
  "real_login_enabled",
  "real_signup_enabled",
  "user_account_collection_enabled",
  "frontend_deployment_performed",
  "scaffold_file_copy_performed",
  "scaffold_file_move_performed",
  "scaffold_file_delete_performed",
  "scaffold_import_performed",
  "file_deletion_performed",
  "file_move_performed",
  "public_article_archive_performed",
  "public_article_delete_performed",
  "public_publishing_performed",
  "content_packet_generation_performed",
  "content_packet_created",
  "article_rewrite_performed",
  "visual_asset_generation_performed",
  "infographic_generation_performed",
  "quality_scoring_performed",
  "visitor_value_scoring_performed"
]) {
  for (const obj of [closure, standard, schema, registry]) {
    if (obj[falseField] !== false) fail(`${falseField} must be false in ${obj.title}`);
  }
}

for (const scriptName of ["generate:ag06j", "validate:ag06j"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag06j")) {
  fail("validate:project must include validate:ag06j");
}

for (const phrase of [
  "Purpose",
  "Inputs",
  "Reference Standard",
  "Source Type Taxonomy",
  "Credibility Tiers",
  "Link Health and Rejection Rules",
  "Source Quality Scoring",
  "Publish-Readiness Gates",
  "Explicit Exclusions",
  "Acceptance Criteria",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG06J document missing phrase: ${phrase}`);
}

pass("AG06J registry is present.");
pass("AG06J document is present.");
pass("AG06J closure review, reference standard, schema and preview are present.");
pass("AG06H-R1 and AG06I alignment are consumed.");
pass("2-5 verified reference rule is carried forward.");
pass("Candidate, approved and rejected reference structures are defined.");
pass("Source type taxonomy is recorded.");
pass("Credibility tiers are recorded.");
pass("Lifecycle statuses are recorded.");
pass("Rejection reasons and link-health statuses are recorded.");
pass("Source quality scoring weights total 100.");
pass("Publish-readiness gates are recorded.");
pass("AG06J is governance/schema closure only.");
pass("No web fetch, reference URL population, reference insertion, public article mutation, CSS/JS mutation, scaffold import, content generation, backend/Auth/Supabase activation or publishing is enabled or performed.");
pass("AG06K JSONL-first Content Intelligence Store Governance is identified as next.");
