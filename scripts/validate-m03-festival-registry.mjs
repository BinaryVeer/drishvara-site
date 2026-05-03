import fs from "node:fs";
import path from "node:path";

const registryPath = path.join(process.cwd(), "data", "methodology", "m03-festival-rule-registry.json");
const docPath = path.join(process.cwd(), "docs", "methodology", "M03_FESTIVAL_RULE_REGISTRY.md");

function fail(message) {
  console.error(`❌ M03 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

if (!fs.existsSync(registryPath)) fail(`Missing M03 registry: ${registryPath}`);
if (!fs.existsSync(docPath)) fail(`Missing M03 document: ${docPath}`);

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "M03") fail("module_id must be M03");

for (const dep of ["M00", "M01", "M02"]) {
  if (!Array.isArray(registry.depends_on) || !registry.depends_on.includes(dep)) {
    fail(`M03 must depend on ${dep}`);
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
  "festival_registry_runtime_enabled"
]) {
  if (registry[flag] !== false) fail(`${flag} must remain false in M03`);
}

for (const field of [
  "observance_id",
  "display_name",
  "traditional_name",
  "category",
  "rule_family_refs",
  "tithi_target",
  "paksha_target",
  "lunar_month_target",
  "event_window_basis",
  "regional_variants",
  "sampradaya_variants",
  "source_level",
  "source_reference",
  "sanskrit_review_status",
  "calculation_review_status",
  "observance_rule_review_status",
  "public_activation_status",
  "activation_status"
]) {
  if (!registry.registry_schema_required_fields.includes(field)) {
    fail(`Missing registry schema field: ${field}`);
  }
}

for (const category of [
  "monthly_vrat",
  "annual_festival",
  "sankranti",
  "parana_linked",
  "regional_variant",
  "sampradaya_variant"
]) {
  if (!registry.registry_categories.includes(category)) {
    fail(`Missing registry category: ${category}`);
  }
}

const entries = registry.sample_registry_entries_not_activated ?? [];
if (entries.length < 25) fail(`M03 should include at least 25 non-activated sample entries; found ${entries.length}`);

for (const id of [
  "ekadashi_generic",
  "dwadashi_parana",
  "pradosh_vrat",
  "sankashti_chaturthi",
  "masik_shivaratri",
  "masik_durgashtami",
  "purnima_vrat",
  "amavasya_observance",
  "rama_navami",
  "krishna_janmashtami",
  "ganesha_chaturthi",
  "durga_ashtami",
  "maha_shivaratri",
  "diwali_deepavali",
  "makara_sankranti",
  "smarta_ekadashi_variant",
  "vaishnava_ekadashi_variant"
]) {
  if (!entries.some((x) => x.observance_id === id)) {
    fail(`Missing required sample registry entry: ${id}`);
  }
}

for (const entry of entries) {
  if (entry.public_activation_status !== false) fail(`${entry.observance_id} must not be publicly activated in M03`);
  if (entry.activation_status !== "draft") fail(`${entry.observance_id} must default to draft activation status`);
  if (!Array.isArray(entry.rule_family_refs) || entry.rule_family_refs.length === 0) {
    fail(`${entry.observance_id} must have at least one rule_family_ref`);
  }
}

for (const flag of [
  "skipped_tithi_conflict",
  "repeated_tithi_conflict",
  "sunrise_boundary_conflict",
  "sunset_pradosh_window_conflict",
  "moonrise_window_conflict",
  "parana_window_conflict",
  "regional_conflict",
  "sampradaya_conflict",
  "source_conflict",
  "insufficient_source_evidence"
]) {
  if (!registry.conflict_flags_supported.includes(flag)) {
    fail(`Missing conflict flag support: ${flag}`);
  }
}

for (const exclusion of [
  "live_festival_calendar",
  "public_festival_date_output",
  "subscriber_festival_guidance",
  "personalized_observance_recommendation",
  "auth",
  "supabase",
  "payment",
  "subscription_entitlement",
  "external_api_fetch",
  "automatic_festival_calculation",
  "automatic_religious_recommendation"
]) {
  if (!registry.scope.excluded.includes(exclusion)) {
    fail(`Missing explicit M03 exclusion: ${exclusion}`);
  }
}

for (const phrase of [
  "Named Observance Registry Schema",
  "Registry Categories",
  "Monthly vrat",
  "Annual festival",
  "Solar transition / Sankranti",
  "Parana-linked observance",
  "Regional or sampradaya observance",
  "Rule Family Mapping",
  "Source and Sanskrit Requirements",
  "Regional and Sampradaya Variant Doctrine",
  "Conflict Handling Doctrine",
  "Activation Status Doctrine",
  "M03 does not implement"
]) {
  if (!docText.includes(phrase)) fail(`M03 document missing section/phrase: ${phrase}`);
}

pass("M03 methodology registry is present.");
pass("M03 methodology document is present.");
pass("M03 depends on M00, M01, and M02.");
pass("Runtime/auth/payment/Supabase/API/subscriber/public festival flags are disabled.");
pass("Named observance registry schema is declared.");
pass("Monthly, annual, Sankranti, Parana, regional, and sampradaya categories are declared.");
pass("Required non-activated sample observance entries are present.");
pass("Conflict, source, Sanskrit, and activation status doctrines are declared.");
pass("M03 is methodology-only and safe to commit.");
