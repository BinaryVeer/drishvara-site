import fs from "node:fs";
import path from "node:path";

const registryPath = path.join(process.cwd(), "data", "methodology", "m02-tithi-vrat-fasting-rule-methodology.json");
const docPath = path.join(process.cwd(), "docs", "methodology", "M02_TITHI_VRAT_FASTING_DAY_RULE_ENGINE.md");

function fail(message) {
  console.error(`❌ M02 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

if (!fs.existsSync(registryPath)) {
  fail(`Missing M02 registry: ${registryPath}`);
}

if (!fs.existsSync(docPath)) {
  fail(`Missing M02 document: ${docPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "M02") {
  fail("module_id must be M02");
}

for (const dep of ["M00", "M01"]) {
  if (!Array.isArray(registry.depends_on) || !registry.depends_on.includes(dep)) {
    fail(`M02 must depend on ${dep}`);
  }
}

const disabledFlags = [
  "runtime_enabled",
  "subscriber_output_enabled",
  "public_panchang_enabled",
  "external_api_fetch_enabled",
  "auth_enabled",
  "payment_enabled",
  "supabase_enabled",
  "rule_engine_runtime_enabled",
  "festival_date_publication_enabled"
];

for (const flag of disabledFlags) {
  if (registry[flag] !== false) {
    fail(`${flag} must remain false in M02`);
  }
}

const tithiTargets = registry.all_tithi_targets ?? [];
if (tithiTargets.length !== 30) {
  fail(`M02 must include all 30 tithi targets; found ${tithiTargets.length}`);
}

const shuklaCount = tithiTargets.filter((x) => x.paksha === "shukla").length;
const krishnaCount = tithiTargets.filter((x) => x.paksha === "krishna").length;

if (shuklaCount !== 15 || krishnaCount !== 15) {
  fail(`M02 must include 15 Shukla and 15 Krishna targets; found Shukla=${shuklaCount}, Krishna=${krishnaCount}`);
}

for (const requiredName of [
  "Pratipada",
  "Dwitiya",
  "Tritiya",
  "Chaturthi",
  "Panchami",
  "Shashthi",
  "Saptami",
  "Ashtami",
  "Navami",
  "Dashami",
  "Ekadashi",
  "Dwadashi",
  "Trayodashi",
  "Chaturdashi",
  "Purnima",
  "Amavasya"
]) {
  if (!tithiTargets.some((x) => x.name === requiredName)) {
    fail(`Missing tithi target name: ${requiredName}`);
  }
}

const requiredRuleFamilies = [
  "tithi_only",
  "tithi_paksha",
  "lunar_month_tithi",
  "weekday_tithi",
  "sunrise_touching",
  "sunset_pradosh_overlap",
  "moonrise_overlap",
  "parana_fast_breaking",
  "nakshatra_linked",
  "yoga_karana_linked",
  "solar_transition_sankranti",
  "regional_calendar_variant",
  "sampradaya_variant"
];

const foundRuleFamilies = (registry.rule_families ?? []).map((x) => x.key);

for (const family of requiredRuleFamilies) {
  if (!foundRuleFamilies.includes(family)) {
    fail(`Missing rule family: ${family}`);
  }
}

for (const family of registry.rule_families ?? []) {
  if (family.runtime_enabled !== false) {
    fail(`Rule family ${family.key} must not be runtime enabled in M02`);
  }
}

const requiredInputs = [
  "local_date",
  "location",
  "timezone",
  "sunrise_time",
  "sunset_time_if_required",
  "moonrise_time_if_required",
  "tithi_interval",
  "paksha",
  "lunar_month",
  "weekday",
  "tithi_at_sunrise",
  "skipped_repeated_tithi_flags",
  "calculation_basis",
  "source_registry_reference",
  "rule_family",
  "review_status"
];

for (const input of requiredInputs) {
  if (!registry.required_rule_inputs.includes(input)) {
    fail(`Missing required rule input: ${input}`);
  }
}

const requiredConflictFlags = [
  "skipped_tithi",
  "repeated_tithi",
  "tithi_overlapping_sunset_window",
  "tithi_overlapping_moonrise_window",
  "regional_date_conflict",
  "sampradaya_conflict",
  "panchang_source_conflict",
  "insufficient_source_evidence"
];

for (const flag of requiredConflictFlags) {
  if (!registry.conflict_flags.includes(flag)) {
    fail(`Missing conflict flag: ${flag}`);
  }
}

const requiredExclusions = [
  "live_panchang_runtime",
  "public_panchang_calendar",
  "subscriber_output",
  "personalized_daily_guidance",
  "auth",
  "supabase",
  "payment",
  "subscription_entitlement",
  "external_api_fetch",
  "festival_date_publication",
  "automatic_religious_recommendation"
];

for (const exclusion of requiredExclusions) {
  if (!registry.scope.excluded.includes(exclusion)) {
    fail(`Missing explicit M02 exclusion: ${exclusion}`);
  }
}

const requiredDocPhrases = [
  "All-Tithi Coverage Doctrine",
  "Shukla Paksha tithis",
  "Krishna Paksha tithis",
  "Observance Rule Families",
  "Sunset / Pradosh-kala rule",
  "Moonrise-based rule",
  "Parana / fast-breaking rule",
  "Regional calendar rule",
  "Sampradaya rule",
  "Conflict and Ambiguity Doctrine",
  "M02 does not implement"
];

for (const phrase of requiredDocPhrases) {
  if (!docText.includes(phrase)) {
    fail(`M02 document missing section/phrase: ${phrase}`);
  }
}

pass("M02 methodology registry is present.");
pass("M02 methodology document is present.");
pass("M02 depends on M00 and M01.");
pass("Runtime/auth/payment/Supabase/API/subscriber/public Panchang flags are disabled.");
pass("All 30 tithi rule targets are declared.");
pass("Broad vrat and fasting-day rule families are declared.");
pass("Sunrise, sunset/Pradosh, moonrise, Parana, regional, and sampradaya dependencies are declared.");
pass("Conflict, source, and review doctrines are declared.");
pass("M02 is methodology-only and safe to commit.");
