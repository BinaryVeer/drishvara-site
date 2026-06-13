import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error("❌ AG74J validation failed: " + message); process.exit(1); }
function pass(message) { console.log("✅ " + message); }

const required = [
  "data/knowledge-base/panchang-festival/production/ag74j-drishvara-varanasi-standard-profile.json",
  "data/knowledge-base/panchang-festival/production/ag74j-date-input-and-supported-range-contract.json",
  "data/knowledge-base/panchang-festival/production/ag74j-location-coordinate-timezone-contract.json",
  "data/knowledge-base/panchang-festival/production/ag74j-varanasi-hindu-year-and-month-convention-contract.json",
  "data/knowledge-base/panchang-festival/production/ag74j-lunar-month-and-four-page-book-slot-contract.json",
  "data/knowledge-base/panchang-festival/production/ag74j-festival-and-ritual-window-semantics-contract.json",
  "data/knowledge-base/panchang-festival/production/ag74j-astronomical-method-and-sunrise-contract.json",
  "data/knowledge-base/panchang-festival/production/ag74j-methodology-and-rule-set-version-contract.json",
  "data/content-intelligence/mutation-plans/ag74j-to-ag74k-panchang-input-resolver-boundary.json",
  "data/content-intelligence/quality-registry/ag74j-ag74k-panchang-input-resolver-readiness-record.json",
  "data/content-intelligence/quality-reviews/ag74j-panchang-contract-and-methodology-lock.json",
  "data/quality/ag74j-panchang-contract-and-methodology-lock.json",
  "data/quality/ag74j-panchang-contract-and-methodology-lock-preview.json",
  "docs/quality/AG74J_PANCHANG_CONTRACT_AND_METHODOLOGY_LOCK.md",
  "data/content-intelligence/quality-registry/ag74i-ag74j-panchang-contract-lock-readiness-record.json",
  "data/knowledge-base/location-intelligence/production/ag74i-varanasi-default-location-alias-record.json",
  "data/methodology/m01-panchang-calculation-methodology.json",
  "data/methodology/m04-location-timezone-sunrise-basis.json"
];
for (const file of required) if (!exists(file)) fail("Missing required file: " + file);

const prior = readJson("data/content-intelligence/quality-registry/ag74i-ag74j-panchang-contract-lock-readiness-record.json");
if (prior.status !== "ready_for_ag74j_panchang_contract_and_methodology_lock") fail("AG74I readiness status mismatch.");

const alias = readJson("data/knowledge-base/location-intelligence/production/ag74i-varanasi-default-location-alias-record.json");
if (alias.canonical_location_id !== "varanasi_in" || alias.timezone !== "Asia/Kolkata") fail("AG74I Varanasi identity was not preserved.");

const profile = readJson("data/knowledge-base/panchang-festival/production/ag74j-drishvara-varanasi-standard-profile.json");
if (profile.status !== "ag74j_canonical_profile_locked_ag74k_ready") fail("Canonical profile status mismatch.");
if (profile.profile_id !== "drishvara_varanasi_standard_v1") fail("Canonical profile ID mismatch.");
if (profile.lunar_month_convention !== "purnimanta") fail("Purnimanta convention is not locked.");
if (profile.hindu_year_system !== "vikram_samvat") fail("Vikram Samvat is not locked.");
if (profile.astronomical_profile !== "modern_drik_ephemeris_profile") fail("Modern Drik profile is not locked.");
if (profile.ayanamsha_profile !== "lahiri_chitrapaksha") fail("Lahiri/Chitrapaksha is not locked.");
if (profile.user_method_selection?.enabled !== false) fail("Public method selection must remain disabled.");
if (profile.rishikesh_panchang?.included_in_ag74j !== false) fail("Rishikesh Panchang must not be included in AG74J.");
for (const [key, value] of Object.entries(profile.activation_state || {})) if (value !== false) fail("Runtime activation flag must remain false: " + key);

const date = readJson("data/knowledge-base/panchang-festival/production/ag74j-date-input-and-supported-range-contract.json");
if (date.supported_range.start !== "1900-01-01" || date.supported_range.end !== "2100-12-31") fail("Supported date range mismatch.");
if (date.validation_rules.silent_clamping_allowed !== false) fail("Silent date clamping must be prohibited.");
if (date.validation_rules.nearest_supported_date_substitution_allowed !== false) fail("Nearest-date substitution must be prohibited.");
if (date.annual_book_date_semantics.instant_conversion_from_daily_selected_place_allowed !== false) fail("Annual book date must not be instant-converted from another place.");

const location = readJson("data/knowledge-base/panchang-festival/production/ag74j-location-coordinate-timezone-contract.json");
if (location.default_public_location.canonical_location_id !== "varanasi_in") fail("Default place mismatch.");
if (location.default_public_location.timezone !== "Asia/Kolkata") fail("Default timezone mismatch.");
if (location.timezone_contract.iana_timezone_required !== true) fail("IANA timezone is not required.");
if (location.rejection_rules.silent_varanasi_substitution_for_invalid_place_allowed !== false) fail("Invalid places must not silently fall back to Varanasi.");
if (location.rejection_rules.unrestricted_place_name_geocoding_allowed !== false) fail("Unrestricted geocoding must remain disabled.");

const calendar = readJson("data/knowledge-base/panchang-festival/production/ag74j-varanasi-hindu-year-and-month-convention-contract.json");
if (calendar.hindu_year.system !== "vikram_samvat" || calendar.hindu_year.style !== "chaitradi") fail("Hindu year profile mismatch.");
if (calendar.hindu_year.boundary_event !== "chaitra_shukla_pratipada") fail("Year boundary mismatch.");
if (calendar.lunar_month.convention !== "purnimanta") fail("Lunar month convention mismatch.");
if (calendar.year_month_boundary_relation.samvat_year_boundary_independent_of_purnimanta_month_boundary !== true) fail("Purnimanta month and Samvat year boundary separation is missing.");

const month = readJson("data/knowledge-base/panchang-festival/production/ag74j-lunar-month-and-four-page-book-slot-contract.json");
const expectedMonths = ["chaitra", "vaishakha", "jyeshtha", "ashadha", "shravana", "bhadrapada", "ashvina", "kartika", "margashirsha", "pausha", "magha", "phalguna"];
if (JSON.stringify(month.canonical_month_order) !== JSON.stringify(expectedMonths)) fail("Canonical month order mismatch.");
if (month.annual_book.physical_page_count !== 4 || month.annual_book.canonical_slots_per_page !== 3) fail("Annual book pagination mismatch.");
if (month.annual_book.physical_month_record_count_fixed !== false) fail("Physical month record count must remain variable.");
if (month.solar_ingress_assignment.adhika_instance_order !== "adhika_precedes_nija_or_regular_instance") fail("Adhika/Nija ordering mismatch.");

const observance = readJson("data/knowledge-base/panchang-festival/production/ag74j-festival-and-ritual-window-semantics-contract.json");
if (observance.separation_rules.public_window_and_ritual_window_must_remain_distinct !== true) fail("Public and ritual windows must remain distinct.");
if (observance.separation_rules.tithi_boundary_may_not_be_relabelled_as_ritual_window !== true) fail("Tithi boundary relabelling prohibition is missing.");
if (observance.separation_rules.fabricated_window_allowed !== false) fail("Fabricated observance windows must remain prohibited.");

const astronomy = readJson("data/knowledge-base/panchang-festival/production/ag74j-astronomical-method-and-sunrise-contract.json");
if (astronomy.calculation_tradition.profile !== "modern_drik_ephemeris_profile") fail("Astronomical profile mismatch.");
if (astronomy.ayanamsha.identity !== "lahiri_chitrapaksha") fail("Ayanamsha mismatch.");
if (astronomy.ephemeris.backend_vendor_locked_in_ag74j !== false || astronomy.ephemeris.backend_selection_deferred_to !== "AG74L") fail("Backend selection boundary mismatch.");
if (astronomy.sunrise.basis !== "apparent_upper_limb_level_horizon") fail("Sunrise basis mismatch.");
if (astronomy.runtime_enabled !== false || astronomy.external_ephemeris_api_enabled !== false) fail("Astronomical runtime or external API was activated.");

const versions = readJson("data/knowledge-base/panchang-festival/production/ag74j-methodology-and-rule-set-version-contract.json");
for (const [key, value] of Object.entries(versions.versions || {})) if (value !== "1.0.0") fail("Version must be 1.0.0 for " + key);

const boundary = readJson("data/content-intelligence/mutation-plans/ag74j-to-ag74k-panchang-input-resolver-boundary.json");
if (boundary.from_module !== "AG74J" || boundary.to_module !== "AG74K") fail("AG74J→AG74K boundary mismatch.");
if (!boundary.ag74k_must_not_activate.includes("astronomical ephemeris calculation")) fail("AG74K astronomical activation prohibition is missing.");

const readiness = readJson("data/content-intelligence/quality-registry/ag74j-ag74k-panchang-input-resolver-readiness-record.json");
if (readiness.status !== "ready_for_ag74k_panchang_input_resolver") fail("AG74K readiness status mismatch.");
if (readiness.readiness_checks.rishikesh_panchang_included !== false || readiness.readiness_checks.public_method_selector_enabled !== false) fail("Rishikesh or method-selector policy mismatch.");
for (const key of ["astronomical_runtime_activated", "festival_generation_activated", "backend_runtime_activated", "supabase_activation_performed", "personal_location_storage_enabled"]) if (readiness.readiness_checks[key] !== false) fail("Activation flag must remain false: " + key);

const quality = readJson("data/quality/ag74j-panchang-contract-and-methodology-lock.json");
if (quality.status !== "ag74j_completed" || quality.issue_count !== 0 || quality.ready_for_ag74k !== true) fail("AG74J quality/readiness mismatch.");
if (quality.public_ui_changed !== false) fail("AG74J must not change the public UI.");

const pkg = readJson("package.json");
if (pkg.scripts?.["validate:ag74j"] !== "node scripts/validate-ag74j-panchang-contract-and-methodology-lock.mjs") fail("validate:ag74j package script mismatch.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag74i && npm run validate:ag74j")) fail("validate:project does not include AG74J after AG74I.");

const m01 = readJson("data/methodology/m01-panchang-calculation-methodology.json");
const m04 = readJson("data/methodology/m04-location-timezone-sunrise-basis.json");
if (m01.runtime_enabled !== false || m04.runtime_enabled !== false) fail("Protected methodology runtime posture changed.");

pass("AG74J Drishvara Varanasi Standard profile is locked.");
pass("Purnimanta, Vikram Samvat Chaitradi, modern Drik, Lahiri/Chitrapaksha and sunrise contracts are valid.");
pass("Rishikesh Panchang and public method selection remain excluded.");
pass("AG74K Panchang input resolver is ready.");
pass("No UI, backend, Supabase, storage, geocoding or astronomical runtime was activated.");
