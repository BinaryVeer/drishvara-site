import fs from "node:fs";
import path from "node:path";

const registryPath = path.join(process.cwd(), "data", "methodology", "m10-methodology-activation-readiness-report.json");
const docPath = path.join(process.cwd(), "docs", "methodology", "M10_METHODLOGY_ACTIVATION_READINESS_REPORT.md");

function fail(message) {
  console.error(`❌ M10 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

if (!fs.existsSync(registryPath)) fail(`Missing M10 registry: ${registryPath}`);
if (!fs.existsSync(docPath)) fail(`Missing M10 document: ${docPath}`);

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "M10") fail("module_id must be M10");

for (const dep of ["M00", "M01", "M02", "M03", "M04", "M04A", "M05", "M06", "M06A", "M07", "M08", "M09"]) {
  if (!Array.isArray(registry.depends_on) || !registry.depends_on.includes(dep)) {
    fail(`M10 must depend on ${dep}`);
  }
}

for (const flag of [
  "runtime_enabled",
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
  "internal_preview_runtime_enabled",
  "premium_guidance_enabled",
  "automatic_activation_enabled",
  "automatic_database_mutation_enabled"
]) {
  if (registry[flag] !== false) fail(`${flag} must remain false in M10`);
}

const requiredModules = ["M00", "M01", "M02", "M03", "M04", "M04A", "M05", "M06", "M06A", "M07", "M08", "M09"];
const matrix = registry.module_readiness_matrix ?? [];
for (const moduleId of requiredModules) {
  const entry = matrix.find((x) => x.module_id === moduleId);
  if (!entry) fail(`Missing readiness matrix entry for ${moduleId}`);
  if (entry.activation_allowed !== false) fail(`${moduleId} activation_allowed must be false in M10`);
  if (entry.runtime_status !== "disabled") fail(`${moduleId} runtime_status must be disabled`);
  if (entry.public_output_status !== "disabled") fail(`${moduleId} public_output_status must be disabled`);
}

for (const level of [
  "methodology_complete",
  "evidence_missing",
  "source_review_pending",
  "sanskrit_review_pending",
  "calculation_review_pending",
  "validation_pending",
  "privacy_review_pending",
  "safety_review_pending",
  "internal_preview_candidate",
  "activation_blocked",
  "disabled"
]) {
  if (!registry.readiness_levels.includes(level)) {
    fail(`Missing readiness level: ${level}`);
  }
}

for (const stage of [
  "methodology_only",
  "internal_data_review",
  "internal_calculation_preview",
  "internal_guidance_preview",
  "limited_staff_pilot",
  "limited_subscriber_pilot",
  "public_generic_output",
  "public_personalized_output",
  "premium_output",
  "disabled"
]) {
  if (!registry.activation_stages.includes(stage)) {
    fail(`Missing activation stage: ${stage}`);
  }
}

for (const gate of [
  "source_gate",
  "sanskrit_gate",
  "calculation_gate",
  "location_timezone_gate",
  "event_window_gate",
  "observance_rule_gate",
  "validation_learning_gate",
  "privacy_gate",
  "consent_gate",
  "entitlement_gate",
  "safety_gate",
  "api_contract_gate",
  "internal_preview_gate",
  "audit_trace_gate",
  "operational_gate"
]) {
  if (!registry.required_go_no_go_gates.includes(gate)) {
    fail(`Missing go/no-go gate: ${gate}`);
  }
}

for (const blocker of [
  "invented_mantra_risk",
  "unsupported_sanskrit_claim",
  "unreviewed_source",
  "calculation_basis_unknown",
  "ayanamsha_basis_unknown",
  "ephemeris_basis_unknown",
  "sunrise_basis_unresolved",
  "location_timezone_ambiguity",
  "consent_missing",
  "privacy_redaction_missing",
  "safety_gate_failed",
  "deterministic_or_fear_based_wording",
  "public_output_allowed_without_review"
]) {
  if (!registry.critical_blockers.includes(blocker)) {
    fail(`Missing critical blocker: ${blocker}`);
  }
}

for (const section of [
  "module_ids_included",
  "source_references",
  "sanskrit_review_notes",
  "calculation_basis",
  "location_time_basis",
  "rule_family_basis",
  "validation_records",
  "learning_register_references",
  "privacy_review",
  "safety_review",
  "api_contract_review",
  "audit_trace_sample",
  "reviewer_signoffs",
  "unresolved_risks",
  "go_no_go_recommendation"
]) {
  if (!registry.evidence_pack_required_sections.includes(section)) {
    fail(`Missing evidence pack section: ${section}`);
  }
}

for (const role of [
  "methodology_owner",
  "source_reviewer",
  "sanskrit_reviewer",
  "calculation_reviewer",
  "observance_rule_reviewer",
  "privacy_reviewer",
  "safety_reviewer",
  "api_contract_reviewer",
  "operational_reviewer",
  "final_approver"
]) {
  if (!registry.reviewer_signoff_roles.includes(role)) {
    fail(`Missing reviewer sign-off role: ${role}`);
  }
}

for (const requirement of [
  "relevant_source_gates_pass",
  "required_calculations_traceable",
  "conflict_flags_preserved",
  "privacy_redaction_defined",
  "audit_trace_available",
  "reviewer_role_defined",
  "public_output_false",
  "m04a_learning_path_available"
]) {
  if (!registry.internal_preview_readiness_requirements.includes(requirement)) {
    fail(`Missing internal preview readiness requirement: ${requirement}`);
  }
}

for (const requirement of [
  "consent_flow_defined",
  "entitlement_flow_defined_if_applicable",
  "privacy_retention_defined",
  "error_messages_reviewed",
  "rollback_plan_defined",
  "learning_register_active",
  "safety_escalation_path_defined",
  "public_claims_reviewed"
]) {
  if (!registry.limited_pilot_readiness_requirements.includes(requirement)) {
    fail(`Missing limited pilot readiness requirement: ${requirement}`);
  }
}

for (const blocker of [
  "source_status_pending",
  "sanskrit_status_pending_for_mantra",
  "calculation_basis_pending",
  "privacy_redaction_incomplete",
  "safety_wording_unreviewed",
  "public_output_allowed_false",
  "conflicts_unresolved",
  "validation_evidence_insufficient"
]) {
  if (!registry.public_activation_blockers.includes(blocker)) {
    fail(`Missing public activation blocker: ${blocker}`);
  }
}

for (const requirement of [
  "consent_gate",
  "privacy_gate",
  "entitlement_gate_if_premium",
  "personalization_safety_gate",
  "profile_uncertainty_handling",
  "fallback_path",
  "audit_trace",
  "redaction_path",
  "learning_register_path"
]) {
  if (!registry.subscriber_guidance_readiness_requirements.includes(requirement)) {
    fail(`Missing subscriber guidance readiness requirement: ${requirement}`);
  }
}

for (const requirement of [
  "feature_disable_flag",
  "module_disable_flag",
  "public_output_disable_flag",
  "subscriber_output_disable_flag",
  "emergency_safety_block",
  "audit_log_preservation",
  "reviewer_note",
  "user_safe_message"
]) {
  if (!registry.rollback_requirements.includes(requirement)) {
    fail(`Missing rollback requirement: ${requirement}`);
  }
}

for (const area of [
  "source_risk",
  "sanskrit_risk",
  "calculation_risk",
  "location_timezone_risk",
  "observance_rule_risk",
  "privacy_risk",
  "consent_risk",
  "entitlement_risk",
  "safety_risk",
  "api_risk",
  "operational_risk",
  "reputation_risk"
]) {
  if (!registry.risk_register_areas.includes(area)) {
    fail(`Missing risk register area: ${area}`);
  }
}

for (const section of [
  "report_id",
  "report_date",
  "module_scope",
  "readiness_matrix",
  "gate_results",
  "blocker_summary",
  "risk_register",
  "evidence_pack_refs",
  "validation_summary",
  "privacy_summary",
  "safety_summary",
  "reviewer_signoffs",
  "go_no_go_recommendation",
  "allowed_next_stage",
  "activation_allowed"
]) {
  if (!registry.readiness_report_contract_required_sections.includes(section)) {
    fail(`Missing readiness report contract section: ${section}`);
  }
}

for (const exclusion of [
  "live_calculation",
  "public_output",
  "subscriber_output",
  "auth",
  "supabase",
  "payment",
  "subscription_entitlement",
  "external_api_fetch",
  "api_routes",
  "internal_preview_runtime",
  "dashboard_cards",
  "premium_guidance",
  "lucky_number_output",
  "lucky_colour_output",
  "mantra_output",
  "personalization_runtime",
  "database_mutation",
  "geocoding",
  "background_jobs",
  "public_launch_approval",
  "paid_launch_approval"
]) {
  if (!registry.scope.excluded.includes(exclusion)) {
    fail(`Missing explicit M10 exclusion: ${exclusion}`);
  }
}

for (const phrase of [
  "Core Readiness Doctrine",
  "Readiness Level Doctrine",
  "Activation Stage Doctrine",
  "Go / No-Go Gate Doctrine",
  "Critical Blocker Doctrine",
  "Evidence Pack Doctrine",
  "Module Readiness Matrix Doctrine",
  "Reviewer Sign-off Doctrine",
  "Validation Threshold Doctrine",
  "Internal Preview Readiness Doctrine",
  "Limited Pilot Readiness Doctrine",
  "Public Activation Readiness Doctrine",
  "Subscriber Guidance Readiness Doctrine",
  "Premium Guidance Readiness Doctrine",
  "Rollback and Disable Doctrine",
  "Operational Readiness Doctrine",
  "Risk Register Doctrine",
  "Readiness Report Contract",
  "M04A Learning Connection",
  "M09 Internal Preview Connection",
  "Final M-Methodology Closure Doctrine",
  "M10 does not activate"
]) {
  if (!docText.includes(phrase)) fail(`M10 document missing section/phrase: ${phrase}`);
}

pass("M10 methodology registry is present.");
pass("M10 methodology document is present.");
pass("M10 depends on M00 through M09.");
pass("Runtime/server/Auth/payment/Supabase/API/subscriber/public output flags are disabled.");
pass("Readiness levels, activation stages, go/no-go gates, and critical blockers are declared.");
pass("Evidence pack, module readiness matrix, reviewer sign-off, validation threshold, and risk register doctrines are declared.");
pass("Internal preview, limited pilot, public activation, subscriber guidance, premium guidance, rollback, and operational readiness doctrines are declared.");
pass("M04A learning, M09 preview, safety, and final methodology closure doctrines are declared.");
pass("M10 is methodology-only and safe to commit.");
