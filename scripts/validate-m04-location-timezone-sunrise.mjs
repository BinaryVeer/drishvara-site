import fs from "node:fs";
import path from "node:path";

const registryPath = path.join(process.cwd(), "data", "methodology", "m04-location-timezone-sunrise-basis.json");
const docPath = path.join(process.cwd(), "docs", "methodology", "M04_LOCATION_TIMEZONE_SUNRISE_BASIS.md");

function fail(message) {
  console.error(`❌ M04 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

if (!fs.existsSync(registryPath)) fail(`Missing M04 registry: ${registryPath}`);
if (!fs.existsSync(docPath)) fail(`Missing M04 document: ${docPath}`);

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "M04") fail("module_id must be M04");

for (const dep of ["M00", "M01", "M02", "M03"]) {
  if (!Array.isArray(registry.depends_on) || !registry.depends_on.includes(dep)) {
    fail(`M04 must depend on ${dep}`);
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
  "geocoding_runtime_enabled",
  "sunrise_runtime_enabled",
  "sunset_runtime_enabled",
  "moonrise_runtime_enabled",
  "event_window_runtime_enabled"
]) {
  if (registry[flag] !== false) fail(`${flag} must remain false in M04`);
}

for (const field of [
  "location_id",
  "location_name",
  "country",
  "region",
  "district_or_city",
  "latitude",
  "longitude",
  "coordinate_precision",
  "coordinate_source",
  "timezone_id",
  "timezone_source",
  "timezone_version",
  "review_status",
  "public_safe_label"
]) {
  if (!registry.location_record_required_fields.includes(field)) {
    fail(`Missing location record field: ${field}`);
  }
}

for (const label of [
  "exact_user_confirmed",
  "city_centroid",
  "district_centroid",
  "state_centroid",
  "country_centroid",
  "approximate_manual",
  "pending_review"
]) {
  if (!registry.coordinate_precision_labels.includes(label)) {
    fail(`Missing coordinate precision label: ${label}`);
  }
}

if (registry.timezone_requirements?.iana_timezone_required !== true) {
  fail("IANA timezone must be required in M04");
}

if (registry.timezone_requirements?.fixed_utc_offset_only_allowed !== false) {
  fail("Fixed UTC offset only must not be allowed as the M04 standard");
}

for (const disclosure of [
  "geometric_or_apparent_basis",
  "solar_disk_limb_convention",
  "atmospheric_refraction_assumption",
  "elevation_handling",
  "horizon_handling",
  "coordinate_basis",
  "algorithm_or_ephemeris_source",
  "validation_source",
  "review_status"
]) {
  if (!registry.sunrise_basis.required_disclosures.includes(disclosure)) {
    fail(`Missing sunrise disclosure: ${disclosure}`);
  }
}

for (const label of [
  "sunrise",
  "sunset",
  "moonrise",
  "pradosh_kala",
  "parana_window",
  "solar_ingress",
  "nishita_kala",
  "aparahna_kala",
  "madhyahna_kala",
  "custom_reviewed_window"
]) {
  if (!registry.event_window_labels.includes(label)) {
    fail(`Missing event-window label: ${label}`);
  }
}

for (const req of [
  "local_sunset_time",
  "pradosh_window_start",
  "pradosh_window_end",
  "window_definition_source",
  "trayodashi_overlap",
  "review_status"
]) {
  if (!registry.pradosh_window_requirements.includes(req)) {
    fail(`Missing Pradosh window requirement: ${req}`);
  }
}

for (const req of [
  "fasting_observance_date",
  "parana_date",
  "sunrise_on_parana_date",
  "parana_start",
  "parana_end",
  "review_status"
]) {
  if (!registry.parana_window_requirements.includes(req)) {
    fail(`Missing Parana window requirement: ${req}`);
  }
}

for (const flag of [
  "no_sunrise",
  "no_sunset",
  "polar_day",
  "polar_night",
  "no_moonrise",
  "ambiguous_event_window",
  "human_review_required"
]) {
  if (!registry.edge_case_flags.includes(flag)) {
    fail(`Missing edge-case flag: ${flag}`);
  }
}

for (const rule of [
  "do_not_store_precise_user_coordinates_without_consent",
  "do_not_publicly_expose_exact_birth_location",
  "store_minimum_location_precision_required",
  "separate_calculation_location_from_displayed_location"
]) {
  if (!registry.privacy_rules.includes(rule)) {
    fail(`Missing privacy rule: ${rule}`);
  }
}

for (const section of [
  "date",
  "location_id",
  "timezone_id",
  "sunrise",
  "sunset",
  "moonrise",
  "pradosh_window",
  "parana_window",
  "basis_disclosure",
  "approximation_flags",
  "conflict_flags",
  "review_status"
]) {
  if (!registry.future_event_window_contract_required_sections.includes(section)) {
    fail(`Missing future event-window contract section: ${section}`);
  }
}

for (const exclusion of [
  "live_sunrise_calculation",
  "live_sunset_calculation",
  "live_moonrise_calculation",
  "public_panchang_calendar",
  "public_festival_date_output",
  "subscriber_output",
  "personalized_guidance",
  "auth",
  "supabase",
  "payment",
  "subscription_entitlement",
  "external_api_fetch",
  "geocoding_api",
  "map_api",
  "gps_tracking",
  "runtime_dashboard_card"
]) {
  if (!registry.scope.excluded.includes(exclusion)) {
    fail(`Missing explicit M04 exclusion: ${exclusion}`);
  }
}

for (const phrase of [
  "Location Basis Doctrine",
  "Coordinate Precision Doctrine",
  "Timezone Doctrine",
  "Local Civil Time and UTC Doctrine",
  "Sunrise Basis Doctrine",
  "Sunset Basis Doctrine",
  "Moonrise Basis Doctrine",
  "Pradosh Window Basis Doctrine",
  "Parana Window Basis Doctrine",
  "Event-Window Basis Doctrine",
  "Polar and Extreme Latitude Doctrine",
  "Elevation and Horizon Doctrine",
  "Geocoding and Privacy Doctrine",
  "Validation Doctrine",
  "M04 does not implement"
]) {
  if (!docText.includes(phrase)) fail(`M04 document missing section/phrase: ${phrase}`);
}

pass("M04 methodology registry is present.");
pass("M04 methodology document is present.");
pass("M04 depends on M00, M01, M02, and M03.");
pass("Runtime/auth/payment/Supabase/API/subscriber/public Panchang flags are disabled.");
pass("Location, coordinate precision, and timezone basis are declared.");
pass("Sunrise, sunset, moonrise, Pradosh, Parana, and event-window bases are declared.");
pass("Polar/extreme latitude, elevation/horizon, privacy, and validation doctrines are declared.");
pass("M04 is methodology-only and safe to commit.");
