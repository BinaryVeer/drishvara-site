import fs from "node:fs";
import path from "node:path";

const registryPath = path.join(process.cwd(), "data", "methodology", "m08-server-side-api-contract.json");
const docPath = path.join(process.cwd(), "docs", "methodology", "M08_SERVER_SIDE_API_CONTRACT.md");

function fail(message) {
  console.error(`❌ M08 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

if (!fs.existsSync(registryPath)) fail(`Missing M08 registry: ${registryPath}`);
if (!fs.existsSync(docPath)) fail(`Missing M08 document: ${docPath}`);

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "M08") fail("module_id must be M08");

for (const dep of ["M00", "M01", "M02", "M03", "M04", "M04A", "M05", "M06", "M06A", "M07"]) {
  if (!Array.isArray(registry.depends_on) || !registry.depends_on.includes(dep)) {
    fail(`M08 must depend on ${dep}`);
  }
}

for (const flag of [
  "runtime_enabled",
  "server_endpoint_enabled",
  "subscriber_output_enabled",
  "public_guidance_enabled",
  "public_panchang_enabled",
  "public_festival_dates_enabled",
  "external_api_fetch_enabled",
  "auth_enabled",
  "payment_enabled",
  "supabase_enabled",
  "premium_guidance_enabled",
  "dashboard_card_runtime_enabled",
  "personalization_runtime_enabled",
  "lucky_number_output_enabled",
  "lucky_colour_output_enabled",
  "mantra_output_enabled"
]) {
  if (registry[flag] !== false) fail(`${flag} must remain false in M08`);
}

for (const route of [
  "/api/v1/methodology/status",
  "/api/v1/panchang/estimate",
  "/api/v1/observance/registry",
  "/api/v1/location/resolve",
  "/api/v1/profile/inputs",
  "/api/v1/guidance/symbolic",
  "/api/v1/personalization/score",
  "/api/v1/consent/status",
  "/api/v1/entitlement/status",
  "/api/v1/audit/trace"
]) {
  if (!registry.future_route_families_not_activated.includes(route)) {
    fail(`Missing future route family: ${route}`);
  }
}

for (const field of [
  "api_version",
  "request_id",
  "request_timestamp",
  "client_context",
  "requested_module",
  "requested_operation",
  "consent_context",
  "entitlement_context",
  "privacy_context",
  "payload"
]) {
  if (!registry.request_envelope_required_fields.includes(field)) {
    fail(`Missing request envelope field: ${field}`);
  }
}

for (const field of [
  "api_version",
  "request_id",
  "response_timestamp",
  "module_id",
  "operation",
  "status",
  "data",
  "warnings",
  "errors",
  "source_basis",
  "consent_basis",
  "entitlement_basis",
  "privacy_basis",
  "safety_basis",
  "audit_trace_id",
  "public_output_allowed",
  "human_review_required"
]) {
  if (!registry.response_envelope_required_fields.includes(field)) {
    fail(`Missing response envelope field: ${field}`);
  }
}

for (const error of [
  "validation_error",
  "missing_consent",
  "insufficient_entitlement",
  "privacy_blocked",
  "source_review_pending",
  "sanskrit_review_pending",
  "calculation_review_pending",
  "safety_blocked",
  "human_review_required",
  "conflict_detected",
  "internal_methodology_disabled"
]) {
  if (!registry.error_families.includes(error)) {
    fail(`Missing error family: ${error}`);
  }
}

for (const field of [
  "consent_required",
  "consent_present",
  "consent_scope",
  "consent_version",
  "data_fields_allowed",
  "data_fields_blocked",
  "fallback_allowed"
]) {
  if (!registry.consent_gate_required_fields.includes(field)) {
    fail(`Missing consent gate field: ${field}`);
  }
}

for (const field of [
  "entitlement_required",
  "entitlement_present",
  "entitlement_level",
  "allowed_features",
  "blocked_features",
  "premium_locked_cards",
  "free_fallback_available",
  "reason_code"
]) {
  if (!registry.entitlement_gate_required_fields.includes(field)) {
    fail(`Missing entitlement gate field: ${field}`);
  }
}

for (const field of [
  "privacy_status",
  "redacted_fields",
  "public_safe_fields",
  "internal_only_fields",
  "retention_label",
  "purpose_label",
  "data_minimization_status",
  "deletion_export_eligible",
  "audit_required"
]) {
  if (!registry.privacy_gate_required_fields.includes(field)) {
    fail(`Missing privacy gate field: ${field}`);
  }
}

for (const section of [
  "tithi",
  "vara",
  "nakshatra",
  "yoga",
  "karana",
  "calculation_basis",
  "ayanamsha_basis",
  "ephemeris_basis",
  "conflict_flags"
]) {
  if (!registry.panchang_estimate_contract_sections.includes(section)) {
    fail(`Missing Panchang estimate contract section: ${section}`);
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
  "public_output_allowed"
]) {
  if (!registry.observance_registry_contract_sections.includes(section)) {
    fail(`Missing observance registry contract section: ${section}`);
  }
}

for (const section of [
  "location_id",
  "public_safe_location_label",
  "coordinate_precision",
  "timezone_id",
  "sunrise",
  "sunset",
  "moonrise",
  "pradosh_window",
  "parana_window",
  "basis_disclosure",
  "edge_case_flags",
  "review_status"
]) {
  if (!registry.location_event_window_contract_sections.includes(section)) {
    fail(`Missing location/event-window contract section: ${section}`);
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
  "spiritual_preference",
  "privacy_flags",
  "public_output_allowed"
]) {
  if (!registry.profile_input_contract_sections.includes(section)) {
    fail(`Missing profile input contract section: ${section}`);
  }
}

for (const section of [
  "guidance_type",
  "selected_value",
  "selection_basis",
  "scoring_basis",
  "consent_basis",
  "personalization_level",
  "explanation_label",
  "safety_label",
  "review_status",
  "public_output_allowed"
]) {
  if (!registry.symbolic_guidance_contract_sections.includes(section)) {
    fail(`Missing symbolic guidance contract section: ${section}`);
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
  "entitlement_gate_result",
  "selected_guidance_category",
  "audit_trace_id",
  "public_output_allowed"
]) {
  if (!registry.personalization_scoring_contract_sections.includes(section)) {
    fail(`Missing personalization scoring contract section: ${section}`);
  }
}

for (const field of [
  "audit_trace_id",
  "request_id",
  "module_id",
  "operation",
  "timestamp",
  "input_refs",
  "consent_refs",
  "entitlement_refs",
  "source_refs",
  "privacy_redactions",
  "safety_gate_result",
  "fallback_used",
  "public_output_allowed"
]) {
  if (!registry.audit_trace_required_fields.includes(field)) {
    fail(`Missing audit trace field: ${field}`);
  }
}

for (const exclusion of [
  "live_api_endpoints",
  "server_runtime",
  "middleware",
  "auth",
  "supabase",
  "database_connection",
  "payment_gateway",
  "subscription_billing",
  "external_api_fetch",
  "live_panchang_calculation",
  "live_festival_calculation",
  "live_subscriber_guidance",
  "live_lucky_number",
  "live_lucky_colour",
  "live_mantra",
  "live_personalization_scoring",
  "dashboard_card_rendering",
  "public_routes",
  "premium_gating_runtime"
]) {
  if (!registry.scope.excluded.includes(exclusion)) {
    fail(`Missing explicit M08 exclusion: ${exclusion}`);
  }
}

for (const phrase of [
  "API Versioning Doctrine",
  "Request Envelope Doctrine",
  "Response Envelope Doctrine",
  "Error Taxonomy Doctrine",
  "Consent Gate Contract",
  "Entitlement Gate Contract",
  "Privacy Gate Contract",
  "Panchang Estimate Contract",
  "Observance Registry Contract",
  "Location and Event Window Contract",
  "Profile Input Contract",
  "Symbolic Guidance Contract",
  "Personalization Scoring Contract",
  "Internal Preview Contract",
  "Dashboard Card Contract",
  "Audit Trace Contract",
  "Security and Rate-Limit Doctrine",
  "Caching Doctrine",
  "Status and Readiness Doctrine",
  "Validation and Learning Connection",
  "M08 does not implement"
]) {
  if (!docText.includes(phrase)) fail(`M08 document missing section/phrase: ${phrase}`);
}

pass("M08 methodology registry is present.");
pass("M08 methodology document is present.");
pass("M08 depends on M00 through M07.");
pass("Runtime/server/Auth/payment/Supabase/API/subscriber/public output flags are disabled.");
pass("API versioning, request envelope, response envelope, and error taxonomy are declared.");
pass("Consent, entitlement, and privacy gate contracts are declared.");
pass("Panchang, observance, location, profile, symbolic guidance, and personalization contracts are declared.");
pass("Internal preview, dashboard card, audit trace, security, caching, readiness, and safety doctrines are declared.");
pass("M08 is methodology-only and safe to commit.");
