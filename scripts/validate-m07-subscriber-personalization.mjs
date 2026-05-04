import fs from "node:fs";
import path from "node:path";

const registryPath = path.join(process.cwd(), "data", "methodology", "m07-subscriber-personalization-scoring.json");
const docPath = path.join(process.cwd(), "docs", "methodology", "M07_SUBSCRIBER_PERSONALIZATION_SCORING.md");

function fail(message) {
  console.error(`❌ M07 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

if (!fs.existsSync(registryPath)) fail(`Missing M07 registry: ${registryPath}`);
if (!fs.existsSync(docPath)) fail(`Missing M07 document: ${docPath}`);

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "M07") fail("module_id must be M07");

for (const dep of ["M00", "M01", "M02", "M03", "M04", "M04A", "M05", "M06", "M06A"]) {
  if (!Array.isArray(registry.depends_on) || !registry.depends_on.includes(dep)) {
    fail(`M07 must depend on ${dep}`);
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
  "personalization_runtime_enabled",
  "dashboard_card_runtime_enabled",
  "premium_guidance_enabled",
  "fortune_output_enabled",
  "dob_prediction_enabled",
  "kundli_generation_enabled",
  "horoscope_generation_enabled",
  "lucky_number_output_enabled",
  "lucky_colour_output_enabled",
  "mantra_output_enabled",
  "automatic_remedy_enabled"
]) {
  if (registry[flag] !== false) fail(`${flag} must remain false in M07`);
}

for (const feature of [
  "generic_date_context",
  "weekday_context",
  "tithi_context",
  "observance_context",
  "festival_context",
  "location_context_with_consent",
  "timezone_context_with_consent",
  "language_preference",
  "script_preference",
  "spiritual_preference_with_consent",
  "m06a_symbolic_score_context",
  "internal_review_status"
]) {
  if (!registry.allowed_input_feature_families.includes(feature)) {
    fail(`Missing allowed input feature family: ${feature}`);
  }
}

for (const feature of [
  "name",
  "date_of_birth",
  "birth_time",
  "birth_location",
  "current_location",
  "historical_interaction_preference"
]) {
  if (!registry.restricted_input_feature_families_requiring_consent.includes(feature)) {
    fail(`Missing restricted feature family: ${feature}`);
  }
}

for (const feature of [
  "inferred_caste",
  "inferred_religion",
  "inferred_ethnicity",
  "inferred_community",
  "inferred_health_status",
  "inferred_political_belief",
  "inferred_sexuality",
  "inferred_financial_status",
  "hidden_behavioural_targeting",
  "fear_response",
  "manipulation_likelihood"
]) {
  if (!registry.prohibited_feature_families.includes(feature)) {
    fail(`Missing prohibited feature family: ${feature}`);
  }
}

for (const term of [
  "context_relevance",
  "consented_preference_fit",
  "language_fit",
  "location_fit",
  "observance_fit",
  "symbolic_score_fit",
  "profile_completeness_fit",
  "uncertainty_penalty",
  "privacy_penalty",
  "safety_penalty",
  "repetition_penalty"
]) {
  if (!registry.conceptual_formula_terms.includes(term)) {
    fail(`Missing conceptual formula term: ${term}`);
  }
}

for (const score of [
  "relevance_score",
  "confidence_score",
  "safety_score",
  "consent_score",
  "explanation_score",
  "personalization_depth_score",
  "fallback_score",
  "repetition_score",
  "review_readiness_score"
]) {
  if (!registry.score_types.includes(score)) {
    fail(`Missing score type: ${score}`);
  }
}

for (const card of [
  "generic_daily_reflection",
  "panchang_context_card",
  "festival_context_card",
  "symbolic_number_card",
  "symbolic_colour_card",
  "reviewed_mantra_card",
  "what_to_do_suggestion_card",
  "what_not_to_do_suggestion_card",
  "premium_deeper_guidance_card",
  "internal_review_only_card"
]) {
  if (!registry.guidance_card_families_not_activated.includes(card)) {
    fail(`Missing guidance card family: ${card}`);
  }
}

for (const category of [
  "mindful_conduct",
  "simple_devotion",
  "reading_or_reflection",
  "gratitude",
  "restraint_in_speech",
  "planning_or_discipline",
  "charity_or_service_suggestion"
]) {
  if (!registry.allowed_what_to_do_categories.includes(category)) {
    fail(`Missing allowed what-to-do category: ${category}`);
  }
}

for (const category of [
  "medical_instruction",
  "legal_instruction",
  "financial_instruction",
  "fear_based_prohibition",
  "caste_community_based_behaviour",
  "guaranteed_remedy",
  "harmful_fasting_instruction",
  "unsafe_ritual_instruction"
]) {
  if (!registry.prohibited_what_to_do_categories.includes(category)) {
    fail(`Missing prohibited what-to-do category: ${category}`);
  }
}

for (const label of [
  "generic",
  "context_aware",
  "location_aware",
  "preference_aware",
  "profile_aware",
  "premium_reviewed",
  "human_review_required"
]) {
  if (!registry.personalization_depth_labels.includes(label)) {
    fail(`Missing personalization depth label: ${label}`);
  }
}

for (const fallback of [
  "generic_daily_reflection",
  "generic_panchang_context",
  "non_personalized_symbolic_guidance",
  "no_mantra_today",
  "no_personalized_guidance_today",
  "human_review_required"
]) {
  if (!registry.fallback_types.includes(fallback)) {
    fail(`Missing fallback type: ${fallback}`);
  }
}

for (const target of [
  "inappropriate_personalization",
  "over_personalization",
  "stale_recommendations",
  "fallback_frequency",
  "consent_gate_failures",
  "privacy_concerns",
  "explanation_confusion",
  "user_feedback",
  "source_conflicts",
  "safety_incidents"
]) {
  if (!registry.m04a_review_targets.includes(target)) {
    fail(`Missing M04A review target: ${target}`);
  }
}

for (const field of [
  "scoring_id",
  "profile_id",
  "consent_refs",
  "input_feature_refs",
  "excluded_feature_refs",
  "formula_version",
  "weight_version",
  "safety_gate_result",
  "privacy_gate_result",
  "entitlement_gate_result",
  "selected_guidance_category",
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
  "subscriber_context_ref",
  "consent_basis",
  "feature_set",
  "excluded_features",
  "formula_version",
  "weight_breakdown",
  "score_breakdown",
  "safety_gate_result",
  "privacy_gate_result",
  "fallback_status",
  "selected_guidance_category",
  "explanation_label",
  "personalization_depth",
  "audit_trace_id",
  "review_status",
  "public_output_allowed"
]) {
  if (!registry.future_output_contract_required_sections.includes(section)) {
    fail(`Missing future output contract section: ${section}`);
  }
}

for (const exclusion of [
  "subscriber_login",
  "subscriber_profile_runtime",
  "personalization_runtime",
  "dashboard_cards",
  "premium_guidance",
  "fortune_output",
  "dob_prediction",
  "kundli_generation",
  "horoscope_generation",
  "lucky_number_output",
  "lucky_colour_output",
  "mantra_output",
  "what_to_do_output",
  "what_not_to_do_output",
  "auth",
  "supabase",
  "payment",
  "subscription_entitlement",
  "external_api_fetch",
  "behavioural_targeting",
  "public_guidance"
]) {
  if (!registry.scope.excluded.includes(exclusion)) {
    fail(`Missing explicit M07 exclusion: ${exclusion}`);
  }
}

for (const phrase of [
  "Subscriber Personalization Scoring Doctrine",
  "Personalization Is Not Prediction Doctrine",
  "Consent and Entitlement Separation Doctrine",
  "Allowed Input Feature Families",
  "Restricted Input Feature Families",
  "Prohibited Feature Families",
  "Feature Weight Doctrine",
  "Core Personalization Formula",
  "Score Types",
  "Guidance Card Eligibility Doctrine",
  "Daily Guidance Category Scoring",
  "What To Do / What Not To Do Scoring",
  "Personalization Depth Doctrine",
  "Uncertainty and Fallback Doctrine",
  "Repetition and Freshness Doctrine",
  "Safety Gate Doctrine",
  "Privacy and Minimization Doctrine",
  "Explanation Doctrine",
  "M06A Integration Doctrine",
  "M04A Calibration Learning Doctrine",
  "Audit Trace Doctrine",
  "Output Contract Doctrine",
  "M07 does not implement"
]) {
  if (!docText.includes(phrase)) fail(`M07 document missing section/phrase: ${phrase}`);
}

pass("M07 methodology registry is present.");
pass("M07 methodology document is present.");
pass("M07 depends on M00, M01, M02, M03, M04, M04A, M05, M06, and M06A.");
pass("Runtime/auth/payment/Supabase/API/subscriber/public guidance flags are disabled.");
pass("Allowed, restricted, and prohibited feature families are declared.");
pass("Feature weights, score types, and personalization formula doctrine are declared.");
pass("Guidance card, daily category, what-to-do, fallback, and depth doctrines are declared.");
pass("M06A integration, M04A calibration-learning, audit trace, privacy, and safety doctrines are declared.");
pass("M07 is methodology-only and safe to commit.");
