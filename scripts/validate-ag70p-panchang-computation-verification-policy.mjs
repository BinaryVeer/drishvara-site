import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG70P validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag70p-panchang-computation-verification-policy.mjs",
  "scripts/validate-ag70p-panchang-computation-verification-policy.mjs",
  "data/knowledge-base/panchang-festival/production/ag70p-panchang-computation-verification-policy.json",
  "data/knowledge-base/panchang-festival/production/ag70p-manual-post-output-comparison-policy.json",
  "data/knowledge-base/panchang-festival/production/ag70p-discrepancy-recording-policy.json",
  "data/knowledge-base/panchang-festival/production/ag70p-verification-readiness-register.json",
  "data/knowledge-base/panchang-festival/production/ag70p-context-interpretation-gate.json",
  "data/knowledge-base/panchang-festival/production/ag70p-no-external-source-of-truth-audit.json",
  "data/knowledge-base/panchang-festival/production/ag70p-no-public-output-audit.json",
  "data/content-intelligence/quality-reviews/ag70p-panchang-computation-verification-policy.json",
  "data/content-intelligence/quality-registry/ag70p-ag70q-panchang-context-interpretation-bank-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag70p-to-ag70q-panchang-context-interpretation-bank-boundary.json",
  "data/quality/ag70p-panchang-computation-verification-policy.json",
  "data/quality/ag70p-panchang-computation-verification-policy-preview.json",
  "docs/quality/AG70P_PANCHANG_COMPUTATION_VERIFICATION_POLICY.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag70p"]) fail("Missing generate:ag70p script.");
if (!pkg.scripts?.["validate:ag70p"]) fail("Missing validate:ag70p script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag70p")) fail("validate:project must include validate:ag70p.");

const policy = readJson("data/knowledge-base/panchang-festival/production/ag70p-panchang-computation-verification-policy.json");
if (policy.status !== "panchang_computation_verification_policy_created") fail("Verification policy status mismatch.");
if (policy.external_sites_as_source_of_truth_allowed !== false) fail("External source-of-truth must be false.");
if (policy.external_sites_as_runtime_dependency_allowed !== false) fail("External runtime dependency must be false.");
if (policy.external_sites_as_data_generation_input_allowed !== false) fail("External data-generation input must be false.");
if (policy.external_sites_as_auto_correction_allowed !== false) fail("External auto-correction must be false.");
if (policy.public_output_allowed_now !== false) fail("Public output must be blocked.");
if (!policy.verification_hierarchy.some((x) => x.name === "manual_post_output_external_comparison" && x.source_of_truth_role === "comparison_only_not_authoritative")) {
  fail("Manual comparison must be comparison-only, not authoritative.");
}

const manual = readJson("data/knowledge-base/panchang-festival/production/ag70p-manual-post-output-comparison-policy.json");
if (manual.status !== "manual_post_output_comparison_policy_created") fail("Manual comparison policy status mismatch.");
for (const blocked of [
  "No external Panchang site as production source of truth.",
  "No external Panchang site as data-generation input.",
  "No scraping or runtime dependency.",
  "No automatic overwrite of internal computed value.",
  "No public claim based only on external comparison."
]) {
  if (!manual.blocked_use.includes(blocked)) fail(`Manual comparison blocked-use missing: ${blocked}`);
}
if (manual.public_output_allowed_now !== false) fail("Manual comparison public output must be false.");

const discrepancy = readJson("data/knowledge-base/panchang-festival/production/ag70p-discrepancy-recording-policy.json");
if (discrepancy.status !== "panchang_discrepancy_recording_policy_created") fail("Discrepancy policy status mismatch.");
if (discrepancy.correction_policy.auto_correction_allowed !== false) fail("Auto-correction must be false.");
if (discrepancy.correction_policy.manual_review_required !== true) fail("Manual review must be required.");
if (discrepancy.discrepancy_records_created_now !== 0) fail("Discrepancy records must be zero.");

const readinessRegister = readJson("data/knowledge-base/panchang-festival/production/ag70p-verification-readiness-register.json");
if (readinessRegister.status !== "verification_readiness_register_created") fail("Verification readiness register status mismatch.");
if (readinessRegister.internal_records_available.internally_validated_panchang_daily_records !== 7) fail("Validated daily count must be 7.");
if (readinessRegister.internal_records_available.published_observance_events !== 0) fail("Published observance events must be zero.");
if (readinessRegister.internal_records_available.confirmed_eclipse_events !== 0) fail("Confirmed eclipse events must be zero.");
if (readinessRegister.verification_readiness.eclipse_confirmation_verification_ready !== false) fail("Eclipse confirmation verification must remain false.");

const contextGate = readJson("data/knowledge-base/panchang-festival/production/ag70p-context-interpretation-gate.json");
if (contextGate.status !== "context_interpretation_gate_created_not_started") fail("Context gate status mismatch.");
if (contextGate.ag70q_allowed_after_ag70p !== true) fail("AG70Q should be allowed after AG70P.");
if (contextGate.context_interpretation_records_created_now !== 0) fail("Context records must be zero.");
if (contextGate.word_output_allowed_now !== false) fail("Word output must be blocked.");
if (contextGate.public_output_allowed_now !== false) fail("Public output must be blocked.");

const noExternal = readJson("data/knowledge-base/panchang-festival/production/ag70p-no-external-source-of-truth-audit.json");
if (noExternal.status !== "no_external_source_of_truth_audit_passed") fail("No-external audit status mismatch.");
for (const key of [
  "external_panchang_sites_used_as_source_of_truth",
  "external_panchang_sites_used_for_data_generation",
  "external_panchang_sites_used_as_runtime_dependency",
  "external_panchang_sites_used_as_production_validation_source",
  "external_eclipse_sites_used_as_source_of_truth",
  "external_eclipse_sites_used_for_data_generation",
  "external_eclipse_sites_used_as_runtime_dependency",
  "external_eclipse_sites_used_as_production_validation_source",
  "public_claim_based_on_external_site_now"
]) {
  if (noExternal[key] !== false) fail(`${key} must be false.`);
}
if (noExternal.external_sites_allowed_only_for_manual_post_output_comparison !== true) fail("Manual comparison allowance must be true.");

const noPublic = readJson("data/knowledge-base/panchang-festival/production/ag70p-no-public-output-audit.json");
if (noPublic.status !== "no_public_output_audit_passed") fail("No-public audit status mismatch.");
for (const key of [
  "public_panchang_output_allowed_now",
  "public_observance_output_allowed_now",
  "public_eclipse_output_allowed_now",
  "generated_word_json_modified",
  "ui_display_changed",
  "supabase_activation_performed",
  "backend_runtime_activated"
]) {
  if (noPublic[key] !== false) fail(`${key} must be false.`);
}
if (noPublic.context_interpretation_records_created_now !== 0) fail("Context records must be zero.");

const manifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const allowedPanchangManifestStatuses = [
  "production_bank_manifest_created_panchang_computation_verification_policy",
  "production_bank_manifest_created_panchang_context_interpretation_bank_batch_01",
  "production_bank_manifest_created_today_panchang_context_preview_output_test",
  "production_bank_manifest_created_today_panchang_preview_manual_verification_gate",
  "production_bank_manifest_created_location_intelligence_registry_panchang_basis_normalisation",
  "production_bank_manifest_created_location_import_selection_validation",
  "production_bank_manifest_created_india_administrative_location_import_bank",
  "production_bank_manifest_created_india_cities_capitals_coordinate_bank",
  "production_bank_manifest_created_global_capitals_major_cities_coordinate_bank",
  "production_bank_manifest_created_location_selection_resolver_test",
  "production_bank_manifest_created_location_intelligence_foundation_closure"
];
if (!allowedPanchangManifestStatuses.includes(manifest.status)) fail("Panchang manifest status mismatch.");
if (manifest.current_counts.panchang_verification_policy_records !== 1) fail("Manifest verification policy count must be 1.");
if (manifest.current_counts.manual_comparison_policy_records !== 1) fail("Manifest manual comparison policy count must be 1.");
if (manifest.current_counts.discrepancy_records !== 0) fail("Manifest discrepancy records must be zero.");
if (![0, 7].includes(manifest.current_counts.context_interpretation_records)) fail("Manifest context records must be 0 before AG70Q or 7 after AG70Q.");
if (manifest.current_counts.public_panchang_outputs !== 0) fail("Manifest public outputs must be zero.");

const review = readJson("data/content-intelligence/quality-reviews/ag70p-panchang-computation-verification-policy.json");
if (review.status !== "ag70p_panchang_computation_verification_policy_completed") fail("Review status mismatch.");
for (const key of [
  "verification_policy_created",
  "manual_post_output_comparison_policy_created",
  "discrepancy_recording_policy_created",
  "verification_readiness_register_created",
  "context_interpretation_gate_created",
  "internal_validation_remains_primary",
  "external_sites_allowed_only_for_manual_post_output_comparison",
  "ready_for_ag70q"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}
for (const key of [
  "external_sites_used_as_source_of_truth",
  "external_sites_used_for_data_generation",
  "external_sites_used_as_runtime_dependency",
  "external_sites_used_as_production_validation_source",
  "auto_correction_from_external_site_allowed",
  "public_panchang_output_allowed_now",
  "public_observance_output_allowed_now",
  "public_eclipse_output_allowed_now",
  "context_interpretation_records_created_now",
  "generated_word_json_modified",
  "ui_display_changed",
  "supabase_activation_performed",
  "backend_runtime_activated"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false.`);
}

const readiness = readJson("data/content-intelligence/quality-registry/ag70p-ag70q-panchang-context-interpretation-bank-readiness-record.json");
if (readiness.ready_for_ag70q !== true) fail("AG70Q readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag70p-to-ag70q-panchang-context-interpretation-bank-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("AG70Q boundary must not auto-start.");
for (const blocker of [
  "public Panchang output",
  "public observance event publication",
  "public eclipse event publication",
  "generated/word-of-day.json replacement",
  "external Panchang site as source of truth",
  "external Panchang site as data-generation input",
  "external Panchang site as runtime dependency",
  "external Panchang site as production validation source"
]) {
  if (!boundary.blocked_scope_without_explicit_approval.includes(blocker)) fail(`Boundary blocker missing: ${blocker}`);
}

pass("AG70P Panchang computation verification policy is valid.");
pass("External sites are comparison-only, not source/runtime/data-generation/validation.");
pass("Public output and context/Word/UI/backend/Supabase activation remain blocked.");
