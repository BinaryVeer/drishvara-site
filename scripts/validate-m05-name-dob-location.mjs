import fs from "node:fs";
import path from "node:path";

const registryPath = path.join(process.cwd(), "data", "methodology", "m05-name-dob-location-methodology.json");
const docPath = path.join(process.cwd(), "docs", "methodology", "M05_NAME_DOB_LOCATION_METHODOLOGY.md");

function fail(message) {
  console.error(`❌ M05 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

if (!fs.existsSync(registryPath)) fail(`Missing M05 registry: ${registryPath}`);
if (!fs.existsSync(docPath)) fail(`Missing M05 document: ${docPath}`);

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "M05") fail("module_id must be M05");

for (const dep of ["M00", "M01", "M02", "M03", "M04", "M04A"]) {
  if (!Array.isArray(registry.depends_on) || !registry.depends_on.includes(dep)) {
    fail(`M05 must depend on ${dep}`);
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
  "profile_runtime_enabled",
  "dob_prediction_enabled",
  "kundli_generation_enabled",
  "horoscope_generation_enabled",
  "lucky_number_enabled",
  "lucky_colour_enabled",
  "mantra_selection_enabled",
  "personalization_scoring_enabled"
]) {
  if (registry[flag] !== false) fail(`${flag} must remain false in M05`);
}

for (const consent of [
  "store_name",
  "store_date_of_birth",
  "store_birth_time",
  "store_birth_location",
  "store_current_location",
  "use_location_for_calculation",
  "use_dob_for_personalization",
  "use_language_preference",
  "use_spiritual_preference",
  "show_premium_guidance"
]) {
  if (!registry.consent_required_for.includes(consent)) {
    fail(`Missing consent requirement: ${consent}`);
  }
}

for (const field of [
  "raw_name",
  "display_name",
  "normalized_name",
  "script_detected",
  "transliteration_if_user_approved",
  "preferred_salutation",
  "language_preference",
  "review_status"
]) {
  if (!registry.name_record_required_fields.includes(field)) {
    fail(`Missing name record field: ${field}`);
  }
}

for (const inference of [
  "caste",
  "religion",
  "ethnicity",
  "gender_identity",
  "community",
  "social_status"
]) {
  if (!registry.prohibited_name_inferences.includes(inference)) {
    fail(`Missing prohibited name inference: ${inference}`);
  }
}

for (const field of [
  "date_value",
  "date_format_submitted",
  "calendar_system_if_applicable",
  "validation_status",
  "precision_level",
  "consent_status"
]) {
  if (!registry.dob_record_required_fields.includes(field)) {
    fail(`Missing DOB record field: ${field}`);
  }
}

for (const field of [
  "time_value",
  "time_format",
  "uncertainty_level",
  "approximate_flag",
  "source_of_time",
  "consent_status"
]) {
  if (!registry.birth_time_record_required_fields.includes(field)) {
    fail(`Missing birth time record field: ${field}`);
  }
}

for (const field of [
  "user_entered_birth_location",
  "normalized_birth_location",
  "public_safe_birth_location_label",
  "coordinate_precision",
  "timezone_at_birth_if_required",
  "consent_status"
]) {
  if (!registry.birth_location_record_required_fields.includes(field)) {
    fail(`Missing birth location record field: ${field}`);
  }
}

for (const field of [
  "current_location_label",
  "calculation_location",
  "display_location",
  "coordinate_precision",
  "timezone",
  "consent_status"
]) {
  if (!registry.current_location_record_required_fields.includes(field)) {
    fail(`Missing current location record field: ${field}`);
  }
}

for (const field of [
  "preferred_language",
  "preferred_script",
  "fallback_language",
  "sanskrit_display_preference",
  "transliteration_preference",
  "simple_explanation_preference"
]) {
  if (!registry.language_script_preference_fields.includes(field)) {
    fail(`Missing language/script preference field: ${field}`);
  }
}

for (const label of [
  "anonymous",
  "generic_user",
  "basic_profile",
  "name_only_profile",
  "dob_without_time",
  "dob_with_time",
  "location_enabled",
  "full_consent_profile",
  "premium_eligible_profile",
  "human_review_required"
]) {
  if (!registry.profile_completeness_labels.includes(label)) {
    fail(`Missing profile completeness label: ${label}`);
  }
}

for (const label of [
  "exact",
  "approximate",
  "user_unsure",
  "system_normalized",
  "pending_confirmation",
  "not_provided",
  "withheld_by_user"
]) {
  if (!registry.uncertainty_labels.includes(label)) {
    fail(`Missing uncertainty label: ${label}`);
  }
}

for (const control of [
  "consent_record",
  "purpose_label",
  "data_minimization",
  "retention_policy",
  "deletion_request_support",
  "export_request_support",
  "public_safe_display",
  "internal_access_control",
  "audit_trace"
]) {
  if (!registry.privacy_controls_required.includes(control)) {
    fail(`Missing privacy control: ${control}`);
  }
}

for (const section of [
  "profile_id",
  "consent_status",
  "name_record",
  "dob_record",
  "birth_time_record",
  "birth_location_record",
  "current_location_record",
  "language_preference",
  "script_preference",
  "spiritual_preference",
  "uncertainty_flags",
  "privacy_flags",
  "review_status",
  "public_output_allowed"
]) {
  if (!registry.future_profile_input_contract_required_sections.includes(section)) {
    fail(`Missing future profile contract section: ${section}`);
  }
}

for (const exclusion of [
  "subscriber_login",
  "profile_form_runtime",
  "dob_runtime_processing",
  "kundli_generation",
  "horoscope_prediction",
  "birth_chart_calculation",
  "automatic_astrological_inference",
  "public_personality_claim",
  "premium_guidance",
  "dashboard_card",
  "lucky_number",
  "lucky_colour",
  "mantra_selection",
  "payment",
  "supabase",
  "auth",
  "external_api_fetch",
  "live_personalization"
]) {
  if (!registry.scope.excluded.includes(exclusion)) {
    fail(`Missing explicit M05 exclusion: ${exclusion}`);
  }
}

for (const phrase of [
  "Consent-First Doctrine",
  "Data Minimization Doctrine",
  "Name Methodology",
  "Sanskrit and Transliteration Doctrine for Names",
  "DOB Methodology",
  "Birth Time Methodology",
  "Birth Location Methodology",
  "Current Location Methodology",
  "Language and Script Preference",
  "Spiritual Preference Doctrine",
  "Personalization Input Classification",
  "Profile Completeness Doctrine",
  "Uncertainty Doctrine",
  "Safety Doctrine",
  "Privacy and Retention Doctrine",
  "M05 does not implement"
]) {
  if (!docText.includes(phrase)) fail(`M05 document missing section/phrase: ${phrase}`);
}

pass("M05 methodology registry is present.");
pass("M05 methodology document is present.");
pass("M05 depends on M00, M01, M02, M03, M04, and M04A.");
pass("Runtime/auth/payment/Supabase/API/subscriber/public guidance flags are disabled.");
pass("Consent, data minimization, name, DOB, birth time, and location methodologies are declared.");
pass("Language/script, spiritual preference, profile completeness, and uncertainty doctrines are declared.");
pass("Privacy, safety, future profile contract, and downstream dependency rules are declared.");
pass("M05 is methodology-only and safe to commit.");
