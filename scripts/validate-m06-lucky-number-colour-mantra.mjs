import fs from "node:fs";
import path from "node:path";

const registryPath = path.join(process.cwd(), "data", "methodology", "m06-lucky-number-colour-mantra-selection.json");
const docPath = path.join(process.cwd(), "docs", "methodology", "M06_LUCKY_NUMBER_COLOUR_MANTRA_SELECTION.md");

function fail(message) {
  console.error(`❌ M06 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

if (!fs.existsSync(registryPath)) fail(`Missing M06 registry: ${registryPath}`);
if (!fs.existsSync(docPath)) fail(`Missing M06 document: ${docPath}`);

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "M06") fail("module_id must be M06");

for (const dep of ["M00", "M01", "M02", "M03", "M04", "M04A", "M05"]) {
  if (!Array.isArray(registry.depends_on) || !registry.depends_on.includes(dep)) {
    fail(`M06 must depend on ${dep}`);
  }
}

for (const flag of [
  "runtime_enabled",
  "subscriber_output_enabled",
  "public_guidance_enabled",
  "public_panchang_enabled",
  "external_api_fetch_enabled",
  "auth_enabled",
  "payment_enabled",
  "supabase_enabled",
  "lucky_number_runtime_enabled",
  "lucky_colour_runtime_enabled",
  "mantra_runtime_enabled",
  "mantra_generation_enabled",
  "automatic_remedy_enabled",
  "premium_guidance_enabled"
]) {
  if (registry[flag] !== false) fail(`${flag} must remain false in M06`);
}

for (const basis of [
  "daily_symbolic_rotation",
  "weekday_symbolic_rotation",
  "tithi_symbolic_rotation",
  "festival_symbolic_rotation",
  "user_preference",
  "editorial_curation",
  "reviewed_numerological_association"
]) {
  if (!registry.lucky_number_allowed_bases.includes(basis)) {
    fail(`Missing lucky number basis: ${basis}`);
  }
}

for (const basis of [
  "daily_symbolic_rotation",
  "weekday_symbolic_rotation",
  "tithi_symbolic_rotation",
  "festival_symbolic_rotation",
  "seasonal_editorial_theme",
  "user_preference",
  "reviewed_traditional_association"
]) {
  if (!registry.lucky_colour_allowed_bases.includes(basis)) {
    fail(`Missing lucky colour basis: ${basis}`);
  }
}

for (const field of [
  "mantra_id",
  "deity_or_theme",
  "devanagari",
  "iast",
  "plain_english_meaning",
  "source_reference",
  "source_level",
  "usage_context",
  "restriction_note",
  "initiation_required_flag",
  "public_safe_flag",
  "sanskrit_review_status",
  "source_review_status",
  "approval_status"
]) {
  if (!registry.mantra_record_required_fields.includes(field)) {
    fail(`Missing mantra record field: ${field}`);
  }
}

for (const action of [
  "invented_sanskrit_mantra",
  "pseudo_sanskrit_phrase",
  "ai_generated_bija_combination",
  "random_deity_seed_syllable_combination",
  "translation_presented_as_mantra",
  "english_devotional_text_presented_as_sanskrit",
  "unsupported_vedic_puranic_tantric_claim"
]) {
  if (!registry.prohibited_mantra_actions.includes(action)) {
    fail(`Missing prohibited mantra action: ${action}`);
  }
}

for (const risk of [
  "public_simple_devotional",
  "beginner_safe_japa",
  "requires_context",
  "requires_pronunciation_review",
  "initiation_or_diksha_required",
  "tantric_or_restricted",
  "not_for_public_output",
  "human_review_required"
]) {
  if (!registry.mantra_risk_classes.includes(risk)) {
    fail(`Missing mantra risk class: ${risk}`);
  }
}

for (const input of [
  "generic_date",
  "weekday",
  "tithi",
  "festival_or_observance_context",
  "language_preference",
  "script_preference",
  "user_spiritual_preference",
  "profile_completeness_label",
  "uncertainty_label"
]) {
  if (!registry.allowed_input_categories.includes(input)) {
    fail(`Missing allowed input category: ${input}`);
  }
}

for (const input of [
  "name",
  "dob",
  "birth_time",
  "birth_location",
  "current_location",
  "historical_interaction_preference"
]) {
  if (!registry.restricted_input_categories_requiring_consent.includes(input)) {
    fail(`Missing restricted input category: ${input}`);
  }
}

for (const input of [
  "inferred_caste",
  "inferred_religion",
  "inferred_ethnicity",
  "inferred_health_status",
  "inferred_political_belief",
  "hidden_behavioural_targeting"
]) {
  if (!registry.prohibited_input_categories.includes(input)) {
    fail(`Missing prohibited input category: ${input}`);
  }
}

for (const gate of [
  "safety_gate",
  "consent_gate",
  "source_gate",
  "sanskrit_review_gate_for_mantra",
  "restriction_gate_for_mantra",
  "profile_uncertainty_gate",
  "fallback_rule",
  "audit_trace"
]) {
  if (!registry.selection_priority_order.includes(gate)) {
    fail(`Missing selection priority gate: ${gate}`);
  }
}

for (const fallback of [
  "no_personalized_number_available",
  "generic_symbolic_number",
  "generic_symbolic_colour",
  "simple_reviewed_devotional_mantra",
  "no_mantra_today",
  "reflection_only_guidance"
]) {
  if (!registry.fallback_types.includes(fallback)) {
    fail(`Missing fallback type: ${fallback}`);
  }
}

for (const section of [
  "guidance_type",
  "selected_value",
  "selection_basis",
  "source_reference_if_applicable",
  "consent_basis",
  "personalization_level",
  "confidence_label",
  "explanation_label",
  "safety_label",
  "review_status",
  "public_output_allowed"
]) {
  if (!registry.future_output_contract_required_sections.includes(section)) {
    fail(`Missing future output contract section: ${section}`);
  }
}

for (const field of [
  "module_id",
  "selection_id",
  "timestamp",
  "profile_input_refs",
  "consent_refs",
  "rule_family",
  "source_refs",
  "fallback_used",
  "restriction_flags",
  "review_status",
  "output_safety_status"
]) {
  if (!registry.audit_trace_required_fields.includes(field)) {
    fail(`Missing audit trace field: ${field}`);
  }
}

for (const target of [
  "mantra_source_correctness",
  "devanagari_iast_integrity",
  "unsafe_mantra_flags",
  "fallback_frequency",
  "rule_explanation_mismatch",
  "inappropriate_personalization",
  "privacy_concerns"
]) {
  if (!registry.m04a_validation_targets.includes(target)) {
    fail(`Missing M04A validation target: ${target}`);
  }
}

for (const exclusion of [
  "lucky_number_runtime",
  "lucky_colour_runtime",
  "mantra_runtime",
  "mantra_generation",
  "subscriber_dashboard_card",
  "premium_guidance",
  "personalized_output",
  "auth",
  "supabase",
  "payment",
  "subscription_entitlement",
  "external_api_fetch",
  "dob_prediction",
  "kundli_generation",
  "horoscope_generation",
  "automated_astrological_remedy",
  "fear_based_warning",
  "public_guidance"
]) {
  if (!registry.scope.excluded.includes(exclusion)) {
    fail(`Missing explicit M06 exclusion: ${exclusion}`);
  }
}

for (const phrase of [
  "Symbolic Guidance Doctrine",
  "Lucky Number Methodology",
  "Lucky Colour Methodology",
  "Mantra Selection Methodology",
  "No Invented Mantra Doctrine",
  "Mantra Risk Classification",
  "Selection Input Doctrine",
  "Selection Priority Doctrine",
  "Fallback Doctrine",
  "Explanation Label Doctrine",
  "Output Contract Doctrine",
  "Audit Trace Doctrine",
  "Validation and Learning Doctrine",
  "Safety Doctrine",
  "Premium Gating Doctrine",
  "M06 does not generate"
]) {
  if (!docText.includes(phrase)) fail(`M06 document missing section/phrase: ${phrase}`);
}

pass("M06 methodology registry is present.");
pass("M06 methodology document is present.");
pass("M06 depends on M00, M01, M02, M03, M04, M04A, and M05.");
pass("Runtime/auth/payment/Supabase/API/subscriber/public guidance flags are disabled.");
pass("Lucky number and lucky colour symbolic methodologies are declared.");
pass("Mantra source, Sanskrit integrity, no-invented-mantra, and risk doctrines are declared.");
pass("Selection input, priority, fallback, explanation, output contract, and audit trace doctrines are declared.");
pass("M04A validation-learning connection and safety doctrines are declared.");
pass("M06 is methodology-only and safe to commit.");
