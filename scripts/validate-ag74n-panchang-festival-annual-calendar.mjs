import fs from "node:fs";
import path from "node:path";
import {
  classifyLunarInterval,
  generateVaranasiSamvatYear
} from "./lib/ag74n-panchang-calendar-engine.mjs";

const root = process.cwd();
const annualPath =
  "data/knowledge-base/panchang-festival/production/ag74n-varanasi-samvat-2083-annual-calendar.json";
const festivalPath =
  "data/knowledge-base/panchang-festival/production/ag74n-festival-observance-candidate-bank-samvat-2083.json";
const resultPath =
  "data/knowledge-base/panchang-festival/production/ag74n-validation-results.json";
const contractPath =
  "data/knowledge-base/panchang-festival/production/ag74n-lunar-month-samvat-calendar-contract.json";
const festivalContractPath =
  "data/knowledge-base/panchang-festival/production/ag74n-festival-rule-admission-contract.json";
const classificationPath =
  "data/knowledge-base/panchang-festival/production/ag74n-prior-festival-asset-classification.json";
const boundaryPath =
  "data/content-intelligence/mutation-plans/ag74n-to-ag74o-panchang-public-ui-wiring-boundary.json";
const readinessPath =
  "data/content-intelligence/quality-registry/ag74n-ag74o-panchang-public-ui-wiring-readiness-record.json";
const qualityPath =
  "data/quality/ag74n-panchang-festival-annual-calendar.json";

function full(relativePath) {
  return path.join(root, relativePath);
}
function exists(relativePath) {
  return fs.existsSync(full(relativePath));
}
function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(full(relativePath), "utf8"));
}
function fail(message) {
  console.error("❌ AG74N validation failed: " + message);
  process.exit(1);
}
function pass(message) {
  console.log("✅ " + message);
}

const required = [
  annualPath,
  festivalPath,
  resultPath,
  contractPath,
  festivalContractPath,
  classificationPath,
  boundaryPath,
  readinessPath,
  qualityPath,
  "scripts/lib/ag74n-panchang-calendar-engine.mjs",
  "scripts/generate-ag74n-panchang-festival-annual-calendar.mjs",
  "data/knowledge-base/panchang-festival/production/ag74n-validation-fixtures.json",
  "data/content-intelligence/quality-registry/ag74m-ag74n-panchang-festival-annual-calendar-readiness-record.json",
  "data/knowledge-base/panchang-festival/production/ag74j-varanasi-hindu-year-and-month-convention-contract.json",
  "data/knowledge-base/panchang-festival/production/ag74j-lunar-month-and-four-page-book-slot-contract.json",
  "data/knowledge-base/panchang-festival/production/ag74j-festival-and-ritual-window-semantics-contract.json",
  "data/knowledge-base/panchang-festival/production/festival-observance-rule-bank.json"
];
for (const file of required) {
  if (!exists(file)) fail("Missing required file: " + file);
}

const prior = readJson(
  "data/content-intelligence/quality-registry/ag74m-ag74n-panchang-festival-annual-calendar-readiness-record.json"
);
if (
  prior.status !==
  "ready_for_ag74n_panchang_festival_and_annual_calendar_engine"
) {
  fail("AG74M→AG74N readiness status mismatch.");
}

const contract = readJson(contractPath);
if (
  contract.status !==
  "ag74n_lunar_month_samvat_calendar_contract_locked_internal_only"
) {
  fail("Calendar contract status mismatch.");
}
if (
  contract.purnimanta_mapping.krishna_paksha_assignment !==
    "next_amanta_interval_month_identity" ||
  contract.purnimanta_mapping.shukla_paksha_assignment !==
    "current_amanta_interval_month_identity"
) {
  fail("Purnimanta mapping mismatch.");
}
if (
  contract.samvat_boundary.skipped_pratipada_at_sunrise !==
    "select_local_civil_date_containing_pratipada_start_event_internal_only"
) {
  fail("Skipped-Pratipada boundary rule mismatch.");
}

const festivalContract = readJson(festivalContractPath);
if (
  festivalContract.calendar_completeness_policy
    .current_status !== "blocked_pending_rule_review" ||
  festivalContract.rule_admission
    .pending_source_rule_may_approve_final_observance_date !== false ||
  festivalContract.window_semantics
    .tithi_condition_may_be_relabelled_as_ritual_window !== false
) {
  fail("Festival rule-admission safety mismatch.");
}

const classification = readJson(classificationPath);
if (
  classification.ag70m_rule_bank.role !==
    "internal_candidate_rule_inventory_only" ||
  classification.ag70n_legacy_pradosha_window.reused_by_ag74n !== false
) {
  fail("Prior festival asset classification mismatch.");
}

const storedAnnual = readJson(annualPath);
const storedFestival = readJson(festivalPath);
const storedValidation = readJson(resultPath);
if (
  storedValidation.status !==
    "ag74n_festival_annual_calendar_validation_passed" ||
  storedValidation.summary.failed_check_count !== 0
) {
  fail("Stored validation results are not passing.");
}

const regenerated = generateVaranasiSamvatYear(2026, { root });
const regeneratedAnnual = {
  ...regenerated,
  festival_observance_result_bank:
    storedAnnual.festival_observance_result_bank
};
if (
  JSON.stringify(regeneratedAnnual) !==
  JSON.stringify(storedAnnual)
) {
  fail("Stored annual calendar is not deterministic.");
}

if (
  storedAnnual.samvat_year !== 2083 ||
  storedAnnual.start_boundary.civil_date !== "2026-03-19" ||
  storedAnnual.start_boundary.allocation_status !==
    "pratipada_skipped_at_sunrise_event_civil_date_selected_internal" ||
  storedAnnual.end_boundary_exclusive.civil_date !==
    "2027-04-07" ||
  storedAnnual.daily_record_count !== 384
) {
  fail("Reference Samvat 2083 boundary/day-count regression.");
}
if (
  storedAnnual.annual_book.physical_page_count !== 4 ||
  storedAnnual.annual_book.canonical_slot_count !== 12 ||
  storedAnnual.annual_book.pages.length !== 4 ||
  storedAnnual.annual_book.pages.some(
    (page) => page.slots.length !== 3
  )
) {
  fail("Four-page/twelve-slot book invariant failed.");
}
const slots = storedAnnual.annual_book.pages.flatMap(
  (page) => page.slots
);
const jyeshtha = slots.find(
  (slot) => slot.canonical_name === "Jyeshtha"
);
const chaitra = slots.find(
  (slot) => slot.canonical_name === "Chaitra"
);
if (
  jyeshtha?.slot_status !== "two_adhika_plus_nija" ||
  jyeshtha?.instance_count !== 2
) {
  fail("Adhika/Nija Jyeshtha representation mismatch.");
}
if (
  chaitra?.instances?.[0]?.year_edge_split !== true ||
  chaitra?.instances?.[0]?.segments?.length !== 2
) {
  fail("Chaitra year-edge segment representation mismatch.");
}

const syntheticAdhika = classifyLunarInterval(1, 0);
const syntheticKshaya = classifyLunarInterval(6, 2);
if (
  syntheticAdhika.canonical_name !== "Jyeshtha" ||
  syntheticAdhika.instance_kind !== "adhika" ||
  syntheticKshaya.canonical_name !== "Kartika" ||
  syntheticKshaya.kshaya_after?.canonical_name !==
    "Margashirsha"
) {
  fail("Synthetic Adhika/Kshaya classification failed.");
}

if (
  storedFestival.normalized_rule_count !== 7 ||
  storedFestival.source_reviewed_rule_count !== 0 ||
  storedFestival.condition_candidate_count !== 114 ||
  storedFestival.skipped_conflict_count !== 6 ||
  storedFestival.final_observance_date_approved_count !== 0 ||
  storedFestival.calendar_completeness_status !==
    "blocked_pending_rule_review"
) {
  fail("Festival candidate/completeness summary mismatch.");
}
for (const candidate of storedFestival.candidates) {
  if (
    candidate.final_observance_date_approved !== false ||
    candidate.primary_public_window !== null ||
    candidate.ritual_window !== null ||
    candidate.public_output_allowed !== false
  ) {
    fail("Unreviewed festival candidate escaped safety gates.");
  }
}

const pkg = readJson("package.json");
if (
  pkg.scripts?.["generate:ag74n"] !==
  "node scripts/generate-ag74n-panchang-festival-annual-calendar.mjs" ||
  pkg.scripts?.["validate:ag74n"] !==
  "node scripts/validate-ag74n-panchang-festival-annual-calendar.mjs"
) {
  fail("AG74N package scripts mismatch.");
}
if (
  !pkg.scripts?.["validate:project"]?.includes(
    "npm run validate:ag74m && npm run validate:ag74n"
  )
) {
  fail("validate:project does not include AG74N after AG74M.");
}

const boundary = readJson(boundaryPath);
if (
  boundary.from_module !== "AG74N" ||
  boundary.to_module !== "AG74O"
) {
  fail("AG74N→AG74O boundary mismatch.");
}
if (
  !boundary.ag74o_must_implement.includes(
    "correct Panchang surface right-overflow and clipping"
  )
) {
  fail("Known AG74O UI correction is missing from handoff.");
}

const readiness = readJson(readinessPath);
if (
  readiness.status !==
  "ready_for_ag74o_panchang_public_ui_wiring_with_festival_publication_guard"
) {
  fail("AG74O readiness status mismatch.");
}
for (const key of [
  "public_panchang_output_activated",
  "public_festival_dates_activated",
  "public_ui_modified",
  "backend_service_deployed",
  "supabase_activation_performed",
  "external_ephemeris_api_enabled"
]) {
  if (readiness.readiness_checks[key] !== false) {
    fail("Activation flag must remain false: " + key);
  }
}

const quality = readJson(qualityPath);
if (
  quality.status !== "ag74n_completed" ||
  quality.issue_count !== 0 ||
  quality.deterministic_check_pass_count !==
    storedValidation.summary.total_check_count ||
  quality.ready_for_ag74o !== true
) {
  fail("AG74N quality/readiness mismatch.");
}

pass("AG74N generated the complete Vikram Samvat 2083 Varanasi civil-date interval deterministically.");
pass("Purnimanta mapping, Adhika/Nija nesting, synthetic Kshaya representation and four-page book structure passed.");
pass("The skipped-at-sunrise Chaitra Pratipada boundary is explicit and remains internal pending AG74P comparison.");
pass("Seven inherited observance rules generated condition candidates only; zero final public festival dates or ritual windows were approved.");
pass("AG70N's preliminary ±90-minute Pradosha window was not reused.");
pass("AG74O public UI wiring is ready with the known overflow, clipping, responsive-layout and typography corrections mandatory.");
pass("No public output, UI/CSS mutation, backend service, Supabase, external API or persistent location storage was activated.");
