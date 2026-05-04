import fs from "node:fs";
import path from "node:path";

const registryPath = path.join(process.cwd(), "data", "methodology", "m06a-symbolic-scoring-formula-mapping.json");
const docPath = path.join(process.cwd(), "docs", "methodology", "M06A_SYMBOLIC_SCORING_FORMULA_MAPPING.md");

function fail(message) {
  console.error(`❌ M06A validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

if (!fs.existsSync(registryPath)) fail(`Missing M06A registry: ${registryPath}`);
if (!fs.existsSync(docPath)) fail(`Missing M06A document: ${docPath}`);

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "M06A") fail("module_id must be M06A");

for (const dep of ["M00", "M01", "M02", "M03", "M04", "M04A", "M05", "M06"]) {
  if (!Array.isArray(registry.depends_on) || !registry.depends_on.includes(dep)) {
    fail(`M06A must depend on ${dep}`);
  }
}

for (const flag of [
  "runtime_enabled",
  "subscriber_output_enabled",
  "public_guidance_enabled",
  "external_api_fetch_enabled",
  "auth_enabled",
  "payment_enabled",
  "supabase_enabled",
  "live_scoring_enabled",
  "lucky_number_output_enabled",
  "lucky_colour_output_enabled",
  "mantra_output_enabled",
  "automatic_remedy_enabled",
  "personalization_runtime_enabled"
]) {
  if (registry[flag] !== false) fail(`${flag} must remain false in M06A`);
}

for (const term of [
  "base_rotation_weight",
  "weekday_weight",
  "tithi_weight",
  "observance_context_weight",
  "deity_theme_weight",
  "consented_preference_weight",
  "editorial_context_weight",
  "source_confidence_weight",
  "repetition_penalty",
  "uncertainty_penalty",
  "privacy_safety_penalty"
]) {
  if (!registry.conceptual_formula_terms.includes(term)) {
    fail(`Missing conceptual formula term: ${term}`);
  }
}

for (const family of [
  "base_daily_rotation_mapping",
  "weekday_symbolic_mapping",
  "tithi_symbolic_mapping",
  "festival_vrat_symbolic_mapping",
  "deity_theme_symbolic_mapping",
  "reviewed_traditional_association",
  "editorial_curation",
  "user_preference_with_consent"
]) {
  if (!registry.allowed_number_mapping_families.includes(family)) {
    fail(`Missing number mapping family: ${family}`);
  }
}

for (const family of [
  "base_daily_rotation_mapping",
  "weekday_symbolic_mapping",
  "tithi_symbolic_mapping",
  "festival_vrat_symbolic_mapping",
  "deity_theme_symbolic_mapping",
  "seasonal_editorial_mapping",
  "reviewed_traditional_association",
  "user_preference_with_consent",
  "ui_safe_colour_palette_mapping"
]) {
  if (!registry.allowed_colour_mapping_families.includes(family)) {
    fail(`Missing colour mapping family: ${family}`);
  }
}

for (const field of [
  "candidate_id",
  "candidate_type",
  "value",
  "mapping_family",
  "source_basis",
  "eligible_contexts",
  "review_status",
  "public_safe_status"
]) {
  if (!registry.candidate_required_fields.includes(field)) {
    fail(`Missing candidate field: ${field}`);
  }
}

for (const method of [
  "date_indexed_rotation",
  "weekday_indexed_rotation",
  "tithi_indexed_rotation",
  "reviewed_observance_indexed_mapping",
  "consented_preference_matching",
  "curated_editorial_schedule"
]) {
  if (!registry.allowed_non_random_methods.includes(method)) {
    fail(`Missing allowed non-random method: ${method}`);
  }
}

for (const method of [
  "hidden_random_selection",
  "engagement_optimized_manipulation",
  "paid_tier_bias_without_disclosure",
  "fear_based_selection",
  "private_data_inference_without_consent"
]) {
  if (!registry.prohibited_selection_methods.includes(method)) {
    fail(`Missing prohibited selection method: ${method}`);
  }
}

for (const fallback of [
  "generic_symbolic_number",
  "generic_symbolic_colour",
  "reflection_only_guidance",
  "no_personalized_symbolic_guidance_today",
  "human_review_required"
]) {
  if (!registry.fallback_types.includes(fallback)) {
    fail(`Missing fallback type: ${fallback}`);
  }
}

for (const label of [
  "reviewed_source",
  "editorial_curated",
  "traditional_association_pending_review",
  "weak_source",
  "source_conflict",
  "not_allowed"
]) {
  if (!registry.source_confidence_labels.includes(label)) {
    fail(`Missing source confidence label: ${label}`);
  }
}

for (const field of [
  "scoring_id",
  "module_id",
  "timestamp",
  "candidate_set_id",
  "scoring_formula_version",
  "mapping_version",
  "input_refs",
  "consent_refs",
  "weight_breakdown",
  "penalties_applied",
  "selected_candidate_id",
  "fallback_used",
  "explanation_label",
  "review_status",
  "public_output_allowed"
]) {
  if (!registry.audit_trace_required_fields.includes(field)) {
    fail(`Missing audit trace field: ${field}`);
  }
}

for (const section of [
  "scoring_id",
  "guidance_type",
  "candidate_set",
  "input_context",
  "consent_basis",
  "formula_version",
  "mapping_version",
  "weight_breakdown",
  "penalties",
  "selected_candidate",
  "explanation_label",
  "safety_label",
  "audit_trace_id",
  "review_status",
  "public_output_allowed"
]) {
  if (!registry.future_scoring_contract_required_sections.includes(section)) {
    fail(`Missing future scoring contract section: ${section}`);
  }
}

for (const exclusion of [
  "live_scoring",
  "subscriber_personalization_runtime",
  "lucky_number_runtime",
  "lucky_colour_runtime",
  "mantra_runtime",
  "mantra_generation",
  "automatic_remedy",
  "premium_guidance",
  "dashboard_cards",
  "auth",
  "supabase",
  "payment",
  "subscription_entitlement",
  "external_api_fetch",
  "dob_prediction",
  "kundli_generation",
  "horoscope_generation",
  "public_guidance"
]) {
  if (!registry.scope.excluded.includes(exclusion)) {
    fail(`Missing explicit M06A exclusion: ${exclusion}`);
  }
}

for (const phrase of [
  "Symbolic Scoring Doctrine",
  "Core Scoring Formula",
  "Default Weight Doctrine",
  "Number Mapping Doctrine",
  "Colour Mapping Doctrine",
  "Mantra Interaction Doctrine",
  "Candidate Generation Doctrine",
  "Score Explanation Doctrine",
  "Non-Randomness Doctrine",
  "Repetition Control Doctrine",
  "Uncertainty and Fallback Doctrine",
  "Safety and Privacy Doctrine",
  "Source Confidence Doctrine",
  "Audit Trace Doctrine",
  "Calibration and Learning Doctrine",
  "M06A does not implement"
]) {
  if (!docText.includes(phrase)) fail(`M06A document missing section/phrase: ${phrase}`);
}

pass("M06A methodology registry is present.");
pass("M06A methodology document is present.");
pass("M06A depends on M00, M01, M02, M03, M04, M04A, M05, and M06.");
pass("Runtime/auth/payment/Supabase/API/subscriber/public guidance flags are disabled.");
pass("Symbolic scoring formula and weight doctrine are declared.");
pass("Number and colour mapping families are declared.");
pass("Candidate generation, explanation, non-randomness, repetition, fallback, and source confidence doctrines are declared.");
pass("Audit trace, calibration-learning, safety, and privacy doctrines are declared.");
pass("M06A is methodology-only and safe to commit.");
