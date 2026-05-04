import fs from "node:fs";
import path from "node:path";

const registryPath = path.join(process.cwd(), "data", "methodology", "m04a-periodic-validation-learning-register.json");
const docPath = path.join(process.cwd(), "docs", "methodology", "M04A_PERIODIC_VALIDATION_LEARNING_REGISTER.md");

function fail(message) {
  console.error(`❌ M04A validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

if (!fs.existsSync(registryPath)) fail(`Missing M04A registry: ${registryPath}`);
if (!fs.existsSync(docPath)) fail(`Missing M04A document: ${docPath}`);

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "M04A") fail("module_id must be M04A");

for (const dep of ["M00", "M01", "M02", "M03", "M04"]) {
  if (!Array.isArray(registry.depends_on) || !registry.depends_on.includes(dep)) {
    fail(`M04A must depend on ${dep}`);
  }
}

for (const flag of [
  "runtime_enabled",
  "subscriber_output_enabled",
  "public_panchang_enabled",
  "public_festival_dates_enabled",
  "external_api_fetch_enabled",
  "auth_enabled",
  "payment_enabled",
  "supabase_enabled",
  "live_validation_enabled",
  "automatic_database_mutation_enabled",
  "automatic_correction_enabled"
]) {
  if (registry[flag] !== false) fail(`${flag} must remain false in M04A`);
}

for (const cadence of ["fortnightly", "monthly"]) {
  if (!registry.validation_cadence.includes(cadence)) {
    fail(`Missing validation cadence: ${cadence}`);
  }
}

for (const target of [
  "tithi_at_sunrise",
  "sunrise_timing",
  "sunset_timing",
  "moonrise_timing",
  "pradosh_window",
  "parana_window",
  "ekadashi_decision",
  "named_festival_registry_mapping",
  "regional_variant_handling",
  "sampradaya_variant_handling",
  "conflict_flags"
]) {
  if (!registry.validation_targets.includes(target)) {
    fail(`Missing validation target: ${target}`);
  }
}

for (const field of [
  "validation_cycle_id",
  "validation_date",
  "reviewed_date_range",
  "location",
  "timezone",
  "target_type",
  "target_id",
  "drishvara_value",
  "reference_value",
  "match_status",
  "severity",
  "suspected_cause",
  "source_reference",
  "reviewer_note",
  "action_required",
  "approval_status"
]) {
  if (!registry.validation_record_required_fields.includes(field)) {
    fail(`Missing validation record field: ${field}`);
  }
}

for (const status of [
  "exact_match",
  "acceptable_variance",
  "minor_mismatch",
  "major_mismatch",
  "source_conflict",
  "regional_variant_difference",
  "sampradaya_variant_difference",
  "human_review_required"
]) {
  if (!registry.match_statuses.includes(status)) {
    fail(`Missing match status: ${status}`);
  }
}

for (const severity of ["info", "low", "medium", "high", "critical"]) {
  if (!registry.severity_levels.includes(severity)) {
    fail(`Missing severity level: ${severity}`);
  }
}

for (const field of [
  "learning_record_id",
  "validation_cycle_id",
  "summary",
  "matched_items",
  "mismatched_items",
  "suspected_root_cause",
  "database_tuning_required",
  "methodology_update_required",
  "human_review_required",
  "accepted_learning",
  "next_action"
]) {
  if (!registry.learning_record_required_fields.includes(field)) {
    fail(`Missing learning record field: ${field}`);
  }
}

for (const tuning of [
  "add_missing_source_reference",
  "add_regional_variant",
  "add_sampradaya_variant",
  "adjust_event_window_basis_after_review",
  "update_coordinate_precision",
  "update_timezone_mapping",
  "mark_source_conflict",
  "mark_human_review_required",
  "update_activation_status"
]) {
  if (!registry.database_tuning_recommendation_types.includes(tuning)) {
    fail(`Missing database tuning recommendation type: ${tuning}`);
  }
}

for (const prohibited of [
  "automatic_public_date_correction",
  "automatic_subscriber_output_change",
  "automatic_deletion_of_source_record",
  "automatic_overwriting_of_reviewed_values",
  "automatic_external_api_sync"
]) {
  if (!registry.prohibited_m04a_actions.includes(prohibited)) {
    fail(`Missing prohibited M04A action: ${prohibited}`);
  }
}

for (const status of [
  "proposed",
  "under_review",
  "accepted",
  "rejected",
  "deferred",
  "implemented_in_methodology",
  "implemented_in_database",
  "requires_external_source_review",
  "closed_no_action"
]) {
  if (!registry.calibration_backlog_statuses.includes(status)) {
    fail(`Missing calibration backlog status: ${status}`);
  }
}

for (const metric of [
  "total_records_checked",
  "exact_match_count",
  "mismatch_count",
  "source_conflict_count",
  "critical_mismatch_count",
  "pending_human_review_count",
  "accepted_tuning_count",
  "closure_rate"
]) {
  if (!registry.metrics.includes(metric)) {
    fail(`Missing metric: ${metric}`);
  }
}

for (const exclusion of [
  "live_panchang_calculation",
  "public_festival_date_output",
  "subscriber_guidance",
  "auth",
  "supabase",
  "payment",
  "subscription_entitlement",
  "external_api_fetch",
  "automatic_public_date_correction",
  "automatic_subscriber_output_change",
  "automatic_database_mutation"
]) {
  if (!registry.scope.excluded.includes(exclusion)) {
    fail(`Missing explicit M04A exclusion: ${exclusion}`);
  }
}

for (const phrase of [
  "Validation Cadence Doctrine",
  "Scope of Validation",
  "Validation Source Doctrine",
  "Figure Validation Record",
  "Match and Variance Doctrine",
  "Severity Doctrine",
  "Learning Register Doctrine",
  "Database Tuning Doctrine",
  "Calibration Backlog Doctrine",
  "Review Meeting Doctrine",
  "Metrics Doctrine",
  "Audit and Trace Doctrine",
  "Privacy Doctrine",
  "Safety Doctrine",
  "M04A does not activate"
]) {
  if (!docText.includes(phrase)) fail(`M04A document missing section/phrase: ${phrase}`);
}

pass("M04A methodology registry is present.");
pass("M04A methodology document is present.");
pass("M04A depends on M00, M01, M02, M03, and M04.");
pass("Runtime/auth/payment/Supabase/API/subscriber/public output flags are disabled.");
pass("Fortnightly and monthly validation cadence is declared.");
pass("Figure validation, variance, severity, and learning register doctrines are declared.");
pass("Database tuning, calibration backlog, metrics, privacy, and audit doctrines are declared.");
pass("M04A is methodology-only and safe to commit.");
