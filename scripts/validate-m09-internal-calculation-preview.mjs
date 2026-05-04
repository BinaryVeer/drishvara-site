import fs from "node:fs";
import path from "node:path";

const registryPath = path.join(process.cwd(), "data", "methodology", "m09-internal-calculation-preview.json");
const docPath = path.join(process.cwd(), "docs", "methodology", "M09_INTERNAL_CALCULATION_PREVIEW.md");

function fail(message) {
  console.error(`❌ M09 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

if (!fs.existsSync(registryPath)) fail(`Missing M09 registry: ${registryPath}`);
if (!fs.existsSync(docPath)) fail(`Missing M09 document: ${docPath}`);

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "M09") fail("module_id must be M09");

for (const dep of ["M00", "M01", "M02", "M03", "M04", "M04A", "M05", "M06", "M06A", "M07", "M08"]) {
  if (!Array.isArray(registry.depends_on) || !registry.depends_on.includes(dep)) {
    fail(`M09 must depend on ${dep}`);
  }
}

for (const flag of [
  "runtime_enabled",
  "preview_runtime_enabled",
  "internal_preview_runtime_enabled",
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
  "live_calculation_enabled",
  "automatic_database_mutation_enabled"
]) {
  if (registry[flag] !== false) fail(`${flag} must remain false in M09`);
}

for (const type of [
  "panchang_element_preview",
  "tithi_interval_preview",
  "vrat_fasting_day_rule_preview",
  "named_observance_registry_preview",
  "location_event_window_preview",
  "validation_discrepancy_preview",
  "profile_input_redaction_preview",
  "symbolic_guidance_scoring_preview",
  "personalization_scoring_preview",
  "api_response_envelope_preview",
  "readiness_gate_preview"
]) {
  if (!registry.preview_types.includes(type)) {
    fail(`Missing preview type: ${type}`);
  }
}

for (const role of [
  "methodology_reviewer",
  "source_reviewer",
  "sanskrit_reviewer",
  "calculation_reviewer",
  "observance_rule_reviewer",
  "privacy_reviewer",
  "safety_reviewer",
  "activation_reviewer",
  "admin_reviewer"
]) {
  if (!registry.reviewer_roles_not_implemented.includes(role)) {
    fail(`Missing reviewer role: ${role}`);
  }
}

for (const field of [
  "date_or_date_range",
  "location_basis",
  "timezone_basis",
  "calculation_basis",
  "source_basis",
  "rule_family",
  "preview_reason",
  "reviewer_note"
]) {
  if (!registry.preview_input_required_fields.includes(field)) {
    fail(`Missing preview input field: ${field}`);
  }
}

for (const section of [
  "tithi",
  "vara",
  "nakshatra",
  "yoga",
  "karana",
  "sunrise_basis",
  "ayanamsha_basis",
  "ephemeris_basis",
  "skipped_repeated_flags"
]) {
  if (!registry.panchang_preview_sections.includes(section)) {
    fail(`Missing Panchang preview section: ${section}`);
  }
}

for (const section of [
  "tithi_target",
  "paksha_target",
  "sunrise_relation",
  "sunset_pradosh_relation",
  "moonrise_relation",
  "parana_relation",
  "regional_variant",
  "sampradaya_variant",
  "human_review_requirement"
]) {
  if (!registry.vrat_rule_preview_sections.includes(section)) {
    fail(`Missing vrat rule preview section: ${section}`);
  }
}

for (const section of [
  "observance_id",
  "display_name",
  "category",
  "rule_family_refs",
  "activation_status",
  "source_review_status",
  "sanskrit_review_status",
  "public_output_permission"
]) {
  if (!registry.festival_registry_preview_sections.includes(section)) {
    fail(`Missing festival registry preview section: ${section}`);
  }
}

for (const section of [
  "location_label",
  "coordinate_precision",
  "timezone_id",
  "sunrise_basis",
  "sunset_basis",
  "moonrise_basis",
  "pradosh_window_basis",
  "parana_window_basis",
  "review_status",
  "public_safe_location_label"
]) {
  if (!registry.location_event_window_preview_sections.includes(section)) {
    fail(`Missing location/event-window preview section: ${section}`);
  }
}

for (const section of [
  "validation_cycle_id",
  "target_type",
  "drishvara_proposed_value",
  "reference_value",
  "match_status",
  "severity",
  "suspected_cause",
  "tuning_recommendation",
  "learning_record_reference",
  "backlog_status"
]) {
  if (!registry.validation_discrepancy_preview_sections.includes(section)) {
    fail(`Missing validation discrepancy preview section: ${section}`);
  }
}

for (const section of [
  "profile_completeness_label",
  "consent_status",
  "allowed_fields",
  "blocked_fields",
  "redacted_fields",
  "uncertainty_flags",
  "privacy_flags",
  "fallback_eligibility"
]) {
  if (!registry.profile_redaction_preview_sections.includes(section)) {
    fail(`Missing profile redaction preview section: ${section}`);
  }
}

for (const status of [
  "draft_preview",
  "methodology_only",
  "internal_review_only",
  "source_review_pending",
  "sanskrit_review_pending",
  "calculation_review_pending",
  "privacy_review_pending",
  "safety_review_pending",
  "conflict_detected",
  "human_review_required",
  "ready_for_internal_preview",
  "ready_for_m10_readiness_review",
  "disabled"
]) {
  if (!registry.preview_statuses.includes(status)) {
    fail(`Missing preview status: ${status}`);
  }
}

for (const conflict of [
  "source_conflict",
  "sanskrit_conflict",
  "calculation_conflict",
  "tithi_boundary_conflict",
  "skipped_tithi_conflict",
  "repeated_tithi_conflict",
  "location_timezone_conflict",
  "event_window_conflict",
  "regional_variant_conflict",
  "sampradaya_variant_conflict",
  "privacy_conflict",
  "entitlement_conflict",
  "safety_conflict",
  "insufficient_evidence"
]) {
  if (!registry.conflict_families.includes(conflict)) {
    fail(`Missing conflict family: ${conflict}`);
  }
}

for (const decision of [
  "no_action",
  "request_source_review",
  "request_sanskrit_review",
  "request_calculation_review",
  "request_rule_review",
  "request_privacy_review",
  "request_safety_review",
  "create_learning_record",
  "create_tuning_backlog_item",
  "mark_internal_preview_ready",
  "mark_disabled"
]) {
  if (!registry.reviewer_decision_options.includes(decision)) {
    fail(`Missing reviewer decision option: ${decision}`);
  }
}

for (const field of [
  "preview_id",
  "module_id",
  "preview_type",
  "timestamp",
  "reviewer_role",
  "input_refs",
  "source_refs",
  "calculation_refs",
  "rule_refs",
  "privacy_redactions",
  "conflict_flags",
  "reviewer_decision",
  "public_output_allowed"
]) {
  if (!registry.audit_trace_required_fields.includes(field)) {
    fail(`Missing audit trace field: ${field}`);
  }
}

for (const level of [
  "public_safe",
  "reviewer_visible",
  "restricted_reviewer_only",
  "private_redacted",
  "blocked"
]) {
  if (!registry.redaction_levels.includes(level)) {
    fail(`Missing redaction level: ${level}`);
  }
}

for (const section of [
  "preview_id",
  "preview_type",
  "module_refs",
  "input_context",
  "calculation_context",
  "source_context",
  "rule_context",
  "privacy_context",
  "preview_payload",
  "warnings",
  "errors",
  "conflict_flags",
  "reviewer_decision",
  "audit_trace_id",
  "review_status",
  "export_allowed",
  "public_output_allowed"
]) {
  if (!registry.future_preview_contract_required_sections.includes(section)) {
    fail(`Missing future preview contract section: ${section}`);
  }
}

for (const exclusion of [
  "live_calculation",
  "preview_runtime",
  "server_endpoints",
  "api_routes",
  "auth",
  "supabase",
  "payment",
  "subscription_entitlement",
  "external_api_fetch",
  "geocoding_api",
  "panchang_runtime",
  "festival_runtime",
  "lucky_number_runtime",
  "lucky_colour_runtime",
  "mantra_runtime",
  "personalization_runtime",
  "dashboard_card_rendering",
  "public_panchang_output",
  "public_festival_output",
  "public_guidance",
  "subscriber_output",
  "automatic_database_mutation"
]) {
  if (!registry.scope.excluded.includes(exclusion)) {
    fail(`Missing explicit M09 exclusion: ${exclusion}`);
  }
}

for (const phrase of [
  "Core Preview Doctrine",
  "Internal Preview Types",
  "Preview Access Doctrine",
  "Preview Input Doctrine",
  "Panchang Element Preview Doctrine",
  "Tithi / Vrat Rule Preview Doctrine",
  "Festival Registry Preview Doctrine",
  "Location and Event Window Preview Doctrine",
  "Validation Discrepancy Preview Doctrine",
  "Profile Input Redaction Preview Doctrine",
  "Symbolic Guidance Preview Doctrine",
  "Personalization Scoring Preview Doctrine",
  "API Response Envelope Preview Doctrine",
  "Preview Status Doctrine",
  "Conflict Flag Doctrine",
  "Reviewer Decision Doctrine",
  "Audit Trace Doctrine",
  "Redaction Doctrine",
  "Preview Export Doctrine",
  "M04A Learning Connection",
  "M10 Readiness Connection",
  "M09 does not execute"
]) {
  if (!docText.includes(phrase)) fail(`M09 document missing section/phrase: ${phrase}`);
}

pass("M09 methodology registry is present.");
pass("M09 methodology document is present.");
pass("M09 depends on M00 through M08.");
pass("Runtime/server/Auth/payment/Supabase/API/subscriber/public output flags are disabled.");
pass("Internal preview types, access, input, status, conflict, and reviewer decision doctrines are declared.");
pass("Panchang, vrat, festival, location, validation, profile, symbolic, personalization, and API envelope previews are declared.");
pass("Audit trace, redaction, export, M04A learning, M10 readiness, and safety doctrines are declared.");
pass("M09 is methodology-only and safe to commit.");
