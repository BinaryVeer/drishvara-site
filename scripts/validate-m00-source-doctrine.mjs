import fs from "node:fs";
import path from "node:path";

const doctrinePath = path.join(process.cwd(), "data", "methodology", "m00-source-doctrine.json");
const docPath = path.join(process.cwd(), "docs", "methodology", "M00_SOURCE_DOCTRINE_AND_SANSKRIT_INTEGRITY.md");

function fail(message) {
  console.error(`❌ M00 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

if (!fs.existsSync(doctrinePath)) {
  fail(`Missing doctrine registry: ${doctrinePath}`);
}

if (!fs.existsSync(docPath)) {
  fail(`Missing doctrine document: ${docPath}`);
}

const doctrine = JSON.parse(fs.readFileSync(doctrinePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

const requiredTopLevelKeys = [
  "module_id",
  "module_title",
  "phase",
  "status",
  "runtime_enabled",
  "subscriber_output_enabled",
  "public_panchang_enabled",
  "external_api_fetch_enabled",
  "auth_enabled",
  "payment_enabled",
  "supabase_enabled",
  "core_principles",
  "panchang_foundation",
  "source_hierarchy",
  "sanskrit_integrity",
  "subscriber_guidance_guardrails",
  "privacy_and_entitlement",
  "review_gates",
  "approved_output_labels",
  "explicit_scope_exclusions",
  "inspiration_disclaimer"
];

for (const key of requiredTopLevelKeys) {
  if (!(key in doctrine)) {
    fail(`Missing top-level key: ${key}`);
  }
}

if (doctrine.module_id !== "M00") {
  fail("module_id must be M00");
}

const disabledFlags = [
  "runtime_enabled",
  "subscriber_output_enabled",
  "public_panchang_enabled",
  "external_api_fetch_enabled",
  "auth_enabled",
  "payment_enabled",
  "supabase_enabled"
];

for (const flag of disabledFlags) {
  if (doctrine[flag] !== false) {
    fail(`${flag} must remain false in M00`);
  }
}

const requiredPanchangElements = ["tithi", "vara", "nakshatra", "yoga", "karana"];
const foundElements = doctrine?.panchang_foundation?.five_elements ?? [];

for (const element of requiredPanchangElements) {
  if (!foundElements.includes(element)) {
    fail(`Panchang foundation missing element: ${element}`);
  }
}

const requiredPrinciples = [
  "source_first",
  "sanskrit_integrity",
  "no_pseudo_sanskrit",
  "no_invented_mantras",
  "subscriber_consent_first",
  "privacy_by_design",
  "non_deterministic_guidance"
];

for (const principle of requiredPrinciples) {
  if (!doctrine.core_principles.includes(principle)) {
    fail(`Missing core principle: ${principle}`);
  }
}

const requiredSanskritFields = [
  "devanagari",
  "iast",
  "plain_english_meaning",
  "source_reference",
  "usage_context",
  "review_status"
];

const sanskritFields = doctrine?.sanskrit_integrity?.required_fields_for_sanskrit_item ?? [];

for (const field of requiredSanskritFields) {
  if (!sanskritFields.includes(field)) {
    fail(`Missing Sanskrit item field: ${field}`);
  }
}

const requiredReviewGates = [
  "source_review",
  "sanskrit_review",
  "calculation_review",
  "observance_rule_review",
  "privacy_review",
  "entitlement_review",
  "output_safety_review"
];

for (const gate of requiredReviewGates) {
  if (!doctrine.review_gates.includes(gate)) {
    fail(`Missing review gate: ${gate}`);
  }
}

const requiredExclusions = [
  "live_panchang_calculation",
  "subscriber_login",
  "subscription_payment",
  "supabase_integration",
  "external_panchang_api",
  "external_festival_api",
  "personalized_subscriber_output",
  "public_dynamic_panchang_page",
  "mantra_generation",
  "fortune_prediction_engine",
  "dashboard_runtime_cards"
];

for (const exclusion of requiredExclusions) {
  if (!doctrine.explicit_scope_exclusions.includes(exclusion)) {
    fail(`Missing explicit M00 scope exclusion: ${exclusion}`);
  }
}

const requiredDocPhrases = [
  "No invented mantras",
  "Panchang Foundation",
  "Privacy and Consent Doctrine",
  "Entitlement and Gating Doctrine",
  "Required Review Gates",
  "Scope Exclusions"
];

for (const phrase of requiredDocPhrases) {
  if (!docText.includes(phrase)) {
    fail(`M00 document missing section/phrase: ${phrase}`);
  }
}

pass("M00 source doctrine registry is present.");
pass("M00 doctrine document is present.");
pass("Runtime/auth/payment/Supabase/API/subscriber output flags are disabled.");
pass("Panchang five-element foundation is declared.");
pass("Sanskrit integrity fields and no-invented-mantra doctrine are declared.");
pass("Privacy, entitlement, and output safety review gates are declared.");
pass("M00 is governance/methodology-only and safe to commit.");
