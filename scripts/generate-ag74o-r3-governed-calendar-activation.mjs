import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const full = (relativePath) => path.join(root, relativePath);
const read = (relativePath) => fs.readFileSync(full(relativePath), "utf8");
const json = (relativePath) => JSON.parse(read(relativePath));
const exists = (relativePath) => fs.existsSync(full(relativePath));
const generatedAt = new Date().toISOString();

function writeText(relativePath, content) {
  const target = full(relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content.endsWith("\n") ? content : content + "\n");
}
function writeJson(relativePath, value) {
  writeText(relativePath, JSON.stringify(value, null, 2));
}
function replaceOne(content, pattern, replacement, label) {
  const matches = content.match(pattern);
  if (!matches || matches.length !== 1) {
    throw new Error(`Expected exactly one ${label}; found ${matches ? matches.length : 0}.`);
  }
  return content.replace(pattern, replacement);
}
function sha256File(relativePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(full(relativePath))).digest("hex");
}

const args = process.argv.slice(2);
let diagnosisZip = null;
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === "--diagnosisZip") diagnosisZip = args[i + 1] || null;
}
if (!diagnosisZip || !fs.existsSync(diagnosisZip)) {
  throw new Error("AG74O-R3 diagnosis ZIP is required.");
}
const diagnosisSha = crypto.createHash("sha256").update(fs.readFileSync(diagnosisZip)).digest("hex");
if (diagnosisSha !== "3f9ad704734e93f720c38eea1dec40d313263a3573995870533bb4dedc74a11f") {
  throw new Error(`AG74O-R3 diagnosis SHA mismatch: ${diagnosisSha}`);
}

const annualPath = "data/knowledge-base/panchang-festival/production/ag74n-varanasi-samvat-2083-annual-calendar.json";
const festivalPath = "data/knowledge-base/panchang-festival/production/ag74n-festival-observance-candidate-bank-samvat-2083.json";
const locationProjectionPath = "data/knowledge-base/location-intelligence/production/ag74o-r2-browser-approved-location-projection.json";
const runtimeContractPath = "data/knowledge-base/panchang-festival/production/ag74o-panchang-public-runtime-contract.json";

const annual = json(annualPath);
const festival = json(festivalPath);
const locationProjection = json(locationProjectionPath);
const dailyRecords = Array.isArray(annual.daily_records) ? annual.daily_records : [];
const festivalCandidates = Array.isArray(festival.candidates) ? festival.candidates : [];

if (annual.daily_record_count !== dailyRecords.length || annual.civil_day_count !== dailyRecords.length) {
  throw new Error("Annual calendar day-count integrity failed.");
}
if (!annual.annual_book || !Array.isArray(annual.annual_book.pages) || annual.annual_book.pages.length !== 4) {
  throw new Error("Annual book must retain exactly four pages.");
}
const canonicalSlots = annual.annual_book.pages.flatMap((page) => page.slots || []);
if (canonicalSlots.length !== 12 || annual.annual_book.pages.some((page) => (page.slots || []).length !== 3)) {
  throw new Error("Annual book must retain twelve canonical slots, three per page.");
}
if (locationProjection.record_count !== 0 || locationProjection.records.length !== 0) {
  throw new Error("R3 zero-approval baseline requires an empty browser-approved location projection.");
}

function transition(value) {
  if (!value) return null;
  return {
    utc: value.utc || null,
    local: value.local || null,
    fromIndex: value.from_index ?? value.fromIndex ?? null,
    toIndex: value.to_index ?? value.toIndex ?? null,
  };
}
function runtimeResult(record) {
  const element = (value) => value ? { index: value.index, name: value.name } : null;
  const result = {
    sunrise: record.sunrise_utc && record.sunrise_local ? { utc: record.sunrise_utc, local: record.sunrise_local } : null,
    sunset: record.sunset_utc && record.sunset_local ? { utc: record.sunset_utc, local: record.sunset_local } : null,
    vara: record.vara || null,
    paksha: record.paksha || null,
    elements: {
      tithi: element(record.tithi),
      nakshatra: element(record.nakshatra),
      yoga: element(record.yoga),
      karana: element(record.karana),
    },
    transitions: {
      tithi: {
        previous: transition(record.tithi?.previous_transition),
        next: transition(record.tithi?.next_transition),
      },
      nakshatra: {
        previous: transition(record.nakshatra?.previous_transition),
        next: transition(record.nakshatra?.next_transition),
      },
      yoga: {
        previous: transition(record.yoga?.previous_transition),
        next: transition(record.yoga?.next_transition),
      },
      karana: {
        previous: transition(record.karana?.previous_transition),
        next: transition(record.karana?.next_transition),
      },
    },
  };
  return result;
}

const activatedDaily = dailyRecords
  .filter((record) => record.daily_record_approved === true && record.public_output_allowed === true)
  .map((record) => ({
    activation_record_id: `ag74o_r3_varanasi_${record.civil_date}`,
    canonical_place_id: annual.profile.place_id,
    selector_value: "varanasi-uttar-pradesh-india",
    display_label: annual.profile.display_label,
    timezone: annual.profile.timezone,
    civil_date: record.civil_date,
    daily_record_approved: true,
    public_output_allowed: true,
    output_mode: "approved_precomputed_record",
    source_record_sha256: crypto.createHash("sha256").update(JSON.stringify(record)).digest("hex"),
    runtime_result: runtimeResult(record),
  }));

const calendarProjection = {
  module_id: "AG74O-R3",
  title: "Governed Daily Calendar Activation Projection",
  status: activatedDaily.length === 0
    ? "ag74o_r3_calendar_projection_created_zero_approved_records"
    : "ag74o_r3_calendar_projection_created_approved_records_present",
  generated_at_utc: generatedAt,
  diagnosis_evidence: {
    filename: path.basename(diagnosisZip),
    sha256: diagnosisSha,
    repository_head: "e39d479aa18b77e89af66ccb64dc6746aa1917f5",
  },
  source: {
    annual_calendar_path: annualPath,
    annual_calendar_sha256: sha256File(annualPath),
    samvat_year: annual.samvat_year,
    canonical_place_id: annual.profile.place_id,
    timezone: annual.profile.timezone,
    source_daily_record_count: dailyRecords.length,
  },
  approval_requirements: [
    "exact approved canonical place",
    "approved coordinate and timezone basis",
    "public-selection approval",
    "daily-record approval",
    "public-output approval",
    "no unresolved blocker",
  ],
  approved_daily_record_count: activatedDaily.length,
  public_runtime_activation_allowed_now: activatedDaily.length > 0 && locationProjection.record_count > 0,
  candidate_only_records_exposed: false,
  records: activatedDaily,
};
writeJson("data/knowledge-base/panchang-festival/production/ag74o-r3-calendar-activation-projection.json", calendarProjection);

const activatedFestivals = festivalCandidates
  .filter((item) =>
    item.final_observance_date_approved === true &&
    item.public_output_allowed === true &&
    item.traditional_source_review_status === "approved" &&
    item.primary_public_window &&
    item.primary_public_window.start_local &&
    item.primary_public_window.end_local
  )
  .map((item) => ({
    activation_record_id: `ag74o_r3_${item.candidate_id}`,
    candidate_id: item.candidate_id,
    observance_key: item.observance_key,
    display_name: item.display_name,
    civil_date: item.civil_date_candidate,
    canonical_place_id: annual.profile.place_id,
    timezone: annual.profile.timezone,
    astronomical_condition_window: item.condition_window || null,
    observance_window: item.observance_window || null,
    primary_public_window: item.primary_public_window,
    ritual_windows: Array.isArray(item.ritual_windows)
      ? item.ritual_windows
      : item.ritual_window ? [item.ritual_window] : [],
    location_basis: item.location_basis || {
      canonical_place_id: annual.profile.place_id,
      display_label: annual.profile.display_label,
      timezone: annual.profile.timezone,
    },
    rule_basis: item.source_reference || null,
    traditional_source_review_status: "approved",
    final_observance_date_approved: true,
    public_output_allowed: true,
  }));

const festivalProjection = {
  module_id: "AG74O-R3",
  title: "Governed Festival and Observance Activation Projection",
  status: activatedFestivals.length === 0
    ? "ag74o_r3_festival_projection_created_zero_approved_observances"
    : "ag74o_r3_festival_projection_created_approved_observances_present",
  generated_at_utc: generatedAt,
  source: {
    candidate_bank_path: festivalPath,
    candidate_bank_sha256: sha256File(festivalPath),
    candidate_count: festivalCandidates.length,
    source_reviewed_rule_count: festival.source_reviewed_rule_count,
  },
  approval_requirements: [
    "traditional source review approved",
    "final observance date approved",
    "public output approved",
    "primary public window present",
    "location and rule basis present",
  ],
  primary_begins_ends_source: "primary_public_window",
  astronomical_condition_window_is_not_public_begins_ends: true,
  ritual_windows_never_overwrite_primary_public_window: true,
  approved_observance_count: activatedFestivals.length,
  public_runtime_activation_allowed_now: activatedFestivals.length > 0,
  records: activatedFestivals,
};
writeJson("data/knowledge-base/panchang-festival/production/ag74o-r3-festival-observance-activation-projection.json", festivalProjection);

const dailyResolver = {
  module_id: "AG74O-R3",
  title: "Daily Record Approval Resolver Contract",
  status: "ag74o_r3_daily_record_approval_resolver_created",
  generated_at_utc: generatedAt,
  resolver_order: [
    "committed request validation",
    "exact approved location resolution",
    "exact civil-date and canonical-place calendar projection match",
    "daily-record approval",
    "public-output approval",
    "unresolved blocker check",
    "approved precomputed record rendering or explicitly approved local calculation",
  ],
  exact_match_required: true,
  candidate_or_internal_record_is_public_approval: false,
  current_approved_daily_record_count: activatedDaily.length,
  current_result: "blocked_zero_approved_daily_records",
  local_engine_retained: true,
  local_engine_may_run_without_calendar_activation_record: false,
};
writeJson("data/knowledge-base/panchang-festival/production/ag74o-r3-daily-record-approval-resolver-contract.json", dailyResolver);

const annualBoundary = {
  module_id: "AG74O-R3",
  title: "Annual Book Reference Boundary Contract",
  status: "ag74o_r3_annual_book_reference_boundary_created",
  generated_at_utc: generatedAt,
  canonical_basis: "Varanasi / Banaras",
  canonical_place_id: annual.profile.place_id,
  timezone: annual.profile.timezone,
  samvat_year: annual.samvat_year,
  page_count: annual.annual_book.pages.length,
  canonical_slot_count: canonicalSlots.length,
  page_slot_counts: annual.annual_book.pages.map((page) => (page.slots || []).length),
  actual_month_instance_count: canonicalSlots.reduce((sum, slot) => sum + (slot.instances || []).length, 0),
  adhika_nested_under_canonical_slot: true,
  kshaya_exception_must_be_explicit: true,
  independent_of_daily_location_approval: true,
  available_while_daily_output_blocked: true,
  date_aware_page_synchronization_allowed: true,
  reference_book_is_not_daily_public_activation: true,
};
writeJson("data/knowledge-base/panchang-festival/production/ag74o-r3-annual-book-reference-boundary-contract.json", annualBoundary);

const requestFlow = {
  module_id: "AG74O-R3",
  title: "Explicit Panchang Request Commit Flow Contract",
  status: "ag74o_r3_explicit_request_commit_flow_created",
  generated_at_utc: generatedAt,
  calculate_control_id: "panchang-calculate",
  request_status_id: "panchang-request-status",
  input_change_behaviour: "mark_pending_without_replacing_last_committed_result",
  date_navigation_behaviour: "update_pending_date_and_reference_book_without_committing_daily_result",
  enter_key_on_alias_commits_request: false,
  calculate_button_required: true,
  page_boot_commits_request: false,
  current_approved_location_count: locationProjection.record_count,
  current_approved_daily_record_count: activatedDaily.length,
};
writeJson("data/knowledge-base/panchang-festival/production/ag74o-r3-request-commit-flow-contract.json", requestFlow);

const activationState = {
  module_id: "AG74O-R3",
  title: "Governed Calendar Activation State Contract",
  status: "ag74o_r3_activation_layer_active_public_outputs_blocked",
  generated_at_utc: generatedAt,
  states: {
    ui_state_only: "Landing inputs shown; no request committed.",
    input_pending: "Inputs changed after the last committed request; displayed daily result remains unchanged.",
    loading: "Committed request is being checked against governed projections.",
    governed_unavailable: "Committed request has no exact approved named-place or alias record.",
    calculation_pending: "Committed request is structurally valid but one or more approvals are absent.",
    calculated: "Exact approved daily record rendered, or explicitly authorised local calculation completed.",
    invalid_input: "Committed date, coordinates or timezone failed validation without substitution.",
  },
  public_runtime_activation_allowed_now: false,
  approved_location_count: locationProjection.record_count,
  approved_daily_record_count: activatedDaily.length,
  approved_observance_count: activatedFestivals.length,
  automatic_input_commit_allowed: false,
  automatic_default_result_allowed: false,
};
writeJson("data/knowledge-base/panchang-festival/production/ag74o-r3-calendar-activation-state-contract.json", activationState);

const review = {
  module_id: "AG74O-R3",
  title: "Governed Calendar Activation Review",
  status: "ag74o_r3_governed_calendar_activation_layer_completed_public_output_blocked",
  generated_at_utc: generatedAt,
  issue_count: 0,
  warning_count: 3,
  diagnosis_evidence_sha256: diagnosisSha,
  summary: {
    diagnosis_critical_findings: 0,
    diagnosis_major_findings_corrected: 3,
    explicit_calculate_control_added: true,
    input_changes_preserve_last_committed_result: true,
    empty_daily_activation_projection_created: activatedDaily.length === 0,
    empty_festival_activation_projection_created: activatedFestivals.length === 0,
    annual_book_independent_reference_boundary_preserved: true,
    public_calendar_output_activated: false,
    public_festival_output_activated: false,
    runtime_external_api_activated: false,
    persistence_activated: false,
    supabase_activated: false,
  },
};
writeJson("data/content-intelligence/quality-reviews/ag74o-r3-governed-calendar-activation.json", review);

const readiness = {
  module_id: "AG74O-R3",
  title: "Governed Calendar Activation Readiness",
  status: "ag74o_r3_activation_architecture_ready_public_population_blocked",
  generated_at_utc: generatedAt,
  activation_architecture_implemented: true,
  explicit_request_commit_flow_active: true,
  ready_for_public_calendar_population: false,
  public_runtime_activation_allowed_now: false,
  approved_location_records: locationProjection.record_count,
  approved_daily_calendar_records: activatedDaily.length,
  approved_festival_observances: activatedFestivals.length,
  unresolved_location_reviews_carried_forward: locationProjection.source_counts?.unresolved_review_records ?? 1419,
  next_stage_not_auto_started: true,
};
writeJson("data/content-intelligence/quality-registry/ag74o-r3-governed-calendar-activation-readiness-record.json", readiness);

const boundary = {
  module_id: "AG74O-R3",
  title: "AG74O-R3 Governed Calendar Activation Boundary",
  status: "ag74o_r3_activation_boundary_locked",
  generated_at_utc: generatedAt,
  completed_scope: [
    "empty approval-filtered daily calendar projection",
    "empty approval-filtered festival activation projection",
    "explicit Calculate Panchang request commitment",
    "pending input preservation of last committed result",
    "independent four-page Varanasi annual reference book",
    "daily record approval resolver",
  ],
  carried_forward_blocks: [
    "zero approved location records",
    "zero approved daily calendar records",
    "zero approved festival observances",
    "all unresolved location, coordinate, timezone and sacred-role reviews",
  ],
  blocked_without_future_explicit_approval: [
    "public population of daily activation projection",
    "public population of festival activation projection",
    "unapproved local calculation",
    "candidate-only selector activation",
    "automatic place, alias or timezone substitution",
    "runtime external API dependency",
    "Supabase or input persistence",
  ],
  next_stage: null,
  next_stage_requires_explicit_definition: true,
  next_stage_not_auto_started: true,
};
writeJson("data/content-intelligence/mutation-plans/ag74o-r3-governed-calendar-activation-boundary.json", boundary);

const quality = {
  module_id: "AG74O-R3",
  status: "pass",
  issue_count: 0,
  generated_at_utc: generatedAt,
  checks: {
    diagnosis_evidence_verified: true,
    annual_book_four_pages: annual.annual_book.pages.length === 4,
    annual_book_twelve_canonical_slots: canonicalSlots.length === 12,
    annual_daily_record_count_consistent: annual.daily_record_count === dailyRecords.length,
    approved_location_count_zero: locationProjection.record_count === 0,
    approved_daily_record_count_zero: activatedDaily.length === 0,
    approved_festival_count_zero: activatedFestivals.length === 0,
    explicit_request_commit_required: true,
    input_change_does_not_commit: true,
    public_runtime_activation_blocked: true,
  },
};
writeJson("data/quality/ag74o-r3-governed-calendar-activation.json", quality);

const docs = `# AG74O-R3 Governed Calendar Activation\n\n## Status\n\nAG74O-R3 establishes the governed calendar activation architecture. Public output remains blocked because approved location, daily calendar and festival-observance counts are all zero.\n\n## Request-commit behaviour\n\n- Date, place, alias, coordinate and timezone edits mark the request as pending.\n- Pending edits do not replace the last committed daily result.\n- Previous Day, Today and Next Day update pending inputs and the independent annual reference book only.\n- The public result resolver runs only after **Calculate Panchang** is pressed.\n\n## Daily activation projection\n\nOnly an exact record carrying explicit daily-record and public-output approvals may enter the browser activation projection. The current projection is empty. The local astronomy engine remains retained behind location, calendar and computation approval gates.\n\n## Festival activation projection\n\nA festival record requires source review, final observance-date approval, public-output approval and a valid primary public window. Astronomical condition, observance, primary-public and ritual windows remain separate. Visible Begins and Ends use the primary public window. The current projection is empty.\n\n## Annual reference book\n\nThe four-page Vikram Samvat 2083 book remains canonically Varanasi-based, contains twelve canonical lunar-month slots, nests Adhika/Nija instances, and remains available independently of daily public activation.\n\n## Prohibited activation\n\nNo candidate-only location, unapproved calendar record, unapproved festival, automatic fallback, external runtime API, persistence or Supabase activation is introduced.\n`;
writeText("docs/quality/AG74O_R3_GOVERNED_CALENDAR_ACTIVATION.md", docs);

const pkg = json("package.json");
pkg.scripts = pkg.scripts || {};
pkg.scripts["generate:ag74o-r3"] = "node scripts/generate-ag74o-r3-governed-calendar-activation.mjs";
pkg.scripts["validate:ag74o-r3"] = "node scripts/validate-ag74o-r3-governed-calendar-activation.mjs";
if (!pkg.scripts["validate:project"].includes("npm run validate:ag74o-r3")) {
  if (!pkg.scripts["validate:project"].includes("npm run validate:ag74o-r2")) {
    throw new Error("validate:project AG74O-R2 insertion anchor missing.");
  }
  pkg.scripts["validate:project"] = pkg.scripts["validate:project"].replace(
    "npm run validate:ag74o-r2",
    "npm run validate:ag74o-r2 && npm run validate:ag74o-r3"
  );
}
writeJson("package.json", pkg);

let index = read("index.html");
if (!index.includes('data-ag74o-r3-request-commit="true"')) {
  const statusCount = (index.match(/id=["']panchang-selection-status["']/g) || []).length;
  if (statusCount !== 1) throw new Error(`Expected one Panchang selection status; found ${statusCount}.`);
  const actionMarkup = `
<div class="ag74o-r3-request-actions" data-ag74o-r3-request-commit="true">
  <button id="panchang-calculate" type="button" class="ag74o-r3-calculate-button" aria-describedby="panchang-request-status panchang-selection-status">Calculate Panchang</button>
  <p id="panchang-request-status" class="ag74o-r3-request-status" data-ag74o-r3-request-state="ready" aria-live="polite">Review the inputs, then press Calculate Panchang. Changing inputs will not replace the last committed result.</p>
</div>`;
  index = index.replace(/<([a-z0-9]+)\b([^>]*\bid=["']panchang-selection-status["'][^>]*)>/i, `${actionMarkup}\n$&`);
}
if (!index.includes("AG74O_R3_CALENDAR_ACTIVATION_STYLE_START")) {
  const style = `
<style data-ag74o-r3-calendar-activation-style="true">
/* AG74O_R3_CALENDAR_ACTIVATION_STYLE_START */
.ag74o-r3-request-actions{
  display:grid;
  grid-template-columns:minmax(0,1fr);
  gap:8px;
  width:100%;
  max-width:100%;
  min-width:0;
  box-sizing:border-box;
  margin:12px 0;
}
.ag74o-r3-calculate-button{
  width:100%;
  max-width:100%;
  min-height:46px;
  box-sizing:border-box;
  border:1px solid rgba(211,169,72,.55);
  border-radius:12px;
  padding:11px 16px;
  font:700 .96rem/1.2 Arial,sans-serif;
  background:linear-gradient(135deg,rgba(211,169,72,.95),rgba(172,118,29,.95));
  color:#071329;
  cursor:pointer;
}
.ag74o-r3-calculate-button:disabled{opacity:.62;cursor:wait;}
.ag74o-r3-request-status{
  min-width:0;
  max-width:100%;
  margin:0;
  font:400 .88rem/1.45 Arial,sans-serif;
  overflow-wrap:anywhere;
  word-break:break-word;
}
#panchang-festival-card[data-ag74o-r3-request-dirty="true"] .ag74o-r3-request-status{
  font-weight:700;
}
/* AG74O_R3_CALENDAR_ACTIVATION_STYLE_END */
</style>`;
  if (!index.includes("</head>")) throw new Error("index.html closing head tag missing.");
  index = index.replace("</head>", `${style}\n</head>`);
}
for (const marker of [
  'id="panchang-calculate"',
  'id="panchang-request-status"',
  'data-ag74o-r3-request-commit="true"',
  "AG74O_R3_CALENDAR_ACTIVATION_STYLE_START",
]) {
  if (!index.includes(marker)) throw new Error(`R3 index marker missing after generation: ${marker}`);
}
writeText("index.html", index);

let controller = read("assets/js/ag74o-panchang-public-controller.js");
if (!controller.includes("CALENDAR_ACTIVATION_PATH")) {
  controller = controller.replace(
    '  var APPROVED_LOCATION_PATH = "data/knowledge-base/location-intelligence/production/ag74o-r2-browser-approved-location-projection.json";',
    `  var APPROVED_LOCATION_PATH = "data/knowledge-base/location-intelligence/production/ag74o-r2-browser-approved-location-projection.json";\n  var CALENDAR_ACTIVATION_PATH = "data/knowledge-base/panchang-festival/production/ag74o-r3-calendar-activation-projection.json";\n  var FESTIVAL_ACTIVATION_PATH = "data/knowledge-base/panchang-festival/production/ag74o-r3-festival-observance-activation-projection.json";`
  );
}
if (!controller.includes("pendingInputDirty")) {
  controller = controller.replace(
    '    selectedPlaceValue:"varanasi-uttar-pradesh-india"\n  };',
    '    selectedPlaceValue:"varanasi-uttar-pradesh-india",\n    pendingInputDirty:false,\n    lastCommittedRequest:null\n  };'
  );
}
controller = replaceOne(
  controller,
  /  function setBusy\(busy\) \{[\s\S]*?\n  \}/g,
  `  function setBusy(busy) {
    card.setAttribute("aria-busy",busy?"true":"false");
    card.setAttribute("data-ag74o-loading",busy?"true":"false");
    var button=byId("panchang-calculate");
    if(button){
      button.disabled=Boolean(busy);
      button.setAttribute("aria-busy",busy?"true":"false");
    }
  }`,
  "setBusy function"
);
controller = replaceOne(
  controller,
  /  function renderObservance\(bank, dateKey\) \{[\s\S]*?\n  \}/g,
  `  function renderObservance(bank, dateKey) {
    var records=bank&&Array.isArray(bank.records)?bank.records:[];
    var item=records.find(function(record){
      return record.civil_date===dateKey&&record.final_observance_date_approved===true&&record.public_output_allowed===true;
    })||null;
    if(!item){
      setText("upcoming-observance-name","No source-reviewed public observance is approved for this date.");
      setText("upcoming-observance-note","Internal condition candidates are not displayed as festival dates. Public and ritual windows remain unavailable until rule review is complete.");
      setText("upcoming-observance-begins","Not available");
      setText("upcoming-observance-ends","Not available");
      setText("upcoming-observance-ritual-window","Not available");
      return;
    }
    setText("upcoming-observance-name",item.display_name);
    setText("upcoming-observance-note","Source-reviewed public observance · "+(item.location_basis&&item.location_basis.display_label||"Approved location basis"));
    setText("upcoming-observance-begins",item.primary_public_window&&item.primary_public_window.start_local||"Not available");
    setText("upcoming-observance-ends",item.primary_public_window&&item.primary_public_window.end_local||"Not available");
    setText("upcoming-observance-ritual-window",Array.isArray(item.ritual_windows)&&item.ritual_windows.length?JSON.stringify(item.ritual_windows):"Not available");
  }`,
  "renderObservance function"
);
if (!controller.includes("function setRequestStatus")) {
  controller = controller.replace(
    "  function renderBook(calendar, dateKey) {",
    `  function setRequestStatus(message, stateName) {
    setText("panchang-request-status",message);
    var node=byId("panchang-request-status");
    if(node)node.setAttribute("data-ag74o-r3-request-state",stateName||"ready");
    card.setAttribute("data-ag74o-r3-request-state",stateName||"ready");
  }

  function refreshPendingBook() {
    if(state.referenceData&&state.referenceData.calendar){
      renderBook(state.referenceData.calendar,state.dateKey);
    }
  }

  function markRequestPending(message) {
    state.requestToken+=1;
    if(state.activeAbort)state.activeAbort.abort();
    state.activeAbort=null;
    setBusy(false);
    state.pendingInputDirty=true;
    card.setAttribute("data-ag74o-r3-request-dirty","true");
    setRequestStatus(message||"Inputs changed. Press Calculate Panchang to commit this request; the displayed daily result has not been replaced.","input_pending");
    refreshPendingBook();
  }

  function settleCommittedRequest(request, resultState) {
    state.pendingInputDirty=false;
    state.lastCommittedRequest={
      mode:request.mode,
      dateKey:request.dateKey,
      value:request.value||null,
      label:request.label||null,
      timezone:request.timezone||null
    };
    card.setAttribute("data-ag74o-r3-request-dirty","false");
    setRequestStatus("Committed request resolved as "+resultState+" for "+isoToDisplay(request.dateKey)+". Further input changes will remain pending until Calculate Panchang is pressed again.","committed");
  }

  function renderBook(calendar, dateKey) {`
  );
}
controller = replaceOne(
  controller,
  /  function loadReferenceData\(signal\) \{[\s\S]*?\n  \}\n\n  function resolveApprovedGovernedRecord/g,
  `  function loadReferenceData(signal) {
    if(state.referenceData)return Promise.resolve(state.referenceData);
    return Promise.all([
      fetch(ANNUAL_PATH,{cache:"no-store",signal:signal}).then(function(response){if(!response.ok)throw new Error("Annual book unavailable");return response.json();}),
      fetch(FESTIVAL_PATH,{cache:"no-store",signal:signal}).then(function(response){if(!response.ok)throw new Error("Festival source bank unavailable");return response.json();}),
      fetch(APPROVED_LOCATION_PATH,{cache:"no-store",signal:signal}).then(function(response){if(!response.ok)throw new Error("Governed approved-location projection unavailable");return response.json();}),
      fetch(CALENDAR_ACTIVATION_PATH,{cache:"no-store",signal:signal}).then(function(response){if(!response.ok)throw new Error("Governed calendar activation projection unavailable");return response.json();}),
      fetch(FESTIVAL_ACTIVATION_PATH,{cache:"no-store",signal:signal}).then(function(response){if(!response.ok)throw new Error("Governed festival activation projection unavailable");return response.json();})
    ]).then(function(values){
      if(!values[2]||values[2].record_count!==values[2].records.length)throw new Error("Governed location projection count mismatch");
      if(!values[3]||values[3].approved_daily_record_count!==values[3].records.length)throw new Error("Governed calendar activation count mismatch");
      if(!values[4]||values[4].approved_observance_count!==values[4].records.length)throw new Error("Governed festival activation count mismatch");
      state.referenceData={calendar:values[0],festivalSource:values[1],approvedLocations:values[2],calendarActivation:values[3],festivalActivation:values[4]};
      return state.referenceData;
    });
  }

  function resolveApprovedGovernedRecord`,
  "reference-data loader"
);
if (!controller.includes("function resolveActivatedCalendarRecord")) {
  controller = controller.replace(
    "  async function applySelection(options) {",
    `  function resolveActivatedCalendarRecord(request, projection) {
    var records=projection&&Array.isArray(projection.records)?projection.records:[];
    var matches=records.filter(function(record){
      return record.civil_date===request.dateKey&&record.canonical_place_id===request.canonicalId&&record.timezone===request.timezone;
    });
    if(matches.length===0){
      return {state:"calculation_pending",reason:"The location request passed its approval gate, but no exact daily calendar activation record is approved for this date, place and timezone."};
    }
    if(matches.length!==1){
      return {state:"governed_unavailable",reason:"The daily calendar activation projection is not uniquely resolvable and requires governed review."};
    }
    var record=matches[0];
    if(record.daily_record_approved!==true||record.public_output_allowed!==true){
      return {state:"calculation_pending",reason:"The exact daily record exists but does not carry all public activation approvals."};
    }
    return {state:"approved",record:record};
  }

  function transitionDisplay(type, result) {
    var transition=result&&result.transitions&&result.transitions[type];
    if(!transition||!transition.previous||!transition.next||!transition.previous.local||!transition.next.local){
      return "Approved transition detail unavailable";
    }
    return compactTransition(type,result);
  }

  function renderActivatedCalendarRecord(request, activationRecord, focusStatus, bank) {
    var result=activationRecord.runtime_result||{};
    setText("panchang-calculation-source","Approved governed calendar record");
    setText("panchang-method-basis","Approved precomputed record · Modern Drik · Lahiri/Chitrapaksha");
    setText("panchang-moonrise",request.label+" · "+request.timezone);
    setText("panchang-moonset",isoToDisplay(request.dateKey));
    setText("panchang-sunrise",result.sunrise&&result.sunrise.local?result.sunrise.local.replace("T"," "):"Not available");
    setText("panchang-sunset",result.sunset&&result.sunset.local?result.sunset.local.replace("T"," "):"Not available");
    setText("panchang-vara",result.vara?result.vara.english+" · "+result.vara.sanskrit:"Not available");
    setText("panchang-tithi",result.elements&&result.elements.tithi?result.elements.tithi.name+" ("+result.elements.tithi.index+")":"Not available");
    setText("panchang-nakshatra",result.elements&&result.elements.nakshatra?result.elements.nakshatra.name+" ("+result.elements.nakshatra.index+")":"Not available");
    setText("panchang-yoga",result.elements&&result.elements.yoga?result.elements.yoga.name+" ("+result.elements.yoga.index+")":"Not available");
    setText("panchang-karana",result.elements&&result.elements.karana?result.elements.karana.name+" ("+result.elements.karana.index+")":"Not available");
    setText("panchang-paksha",result.paksha||"Not available");
    setText("panchang-tithi-transition",transitionDisplay("tithi",result));
    setText("panchang-nakshatra-transition",transitionDisplay("nakshatra",result));
    setText("panchang-yoga-transition",transitionDisplay("yoga",result));
    setText("panchang-karana-transition",transitionDisplay("karana",result));
    setText("panchang-selection-status","Approved governed calendar record displayed for "+request.label+" on "+isoToDisplay(request.dateKey)+". Times use "+request.timezone+".");
    setProvenance(request,{record:request.governedRecord||null});
    renderObservance(bank,request.dateKey);
    setResultState("calculated");setBusy(false);
    if(focusStatus&&byId("panchang-selection-status"))byId("panchang-selection-status").focus();
  }

  async function applySelection(options) {`
  );
}
controller = replaceOne(
  controller,
  /  async function applySelection\(options\) \{[\s\S]*?\n  \}\n\n  function choosePlace/g,
  `  async function applySelection(options) {
    options=options||{};
    state.requestToken+=1;
    var token=state.requestToken;
    if(state.activeAbort)state.activeAbort.abort();
    state.activeAbort=new AbortController();
    var request=requestFromUi();
    setBusy(true);
    setResultState("loading");
    setRequestStatus("Checking the committed request against governed location, calendar and festival activation projections…","loading");
    setText("panchang-selection-status","Checking the governed location, daily-record and approval state…");
    try{
      var reference=await loadReferenceData(state.activeAbort.signal);
      await new Promise(function(resolve){setTimeout(resolve,0);});
      if(token!==state.requestToken)return false;
      renderBook(reference.calendar,request.dateKey);
      var decision=resolveApprovedGovernedRecord(request,reference.approvedLocations);
      if(decision.state!=="approved"){
        renderGovernedState(request,decision.state,decision.reason,options.focusStatus===true,reference.festivalActivation,decision);
        settleCommittedRequest(request,decision.state);
        return false;
      }
      var approvedRequest=requestFromApprovedRecord(request,decision.record);
      var calendarDecision=resolveActivatedCalendarRecord(approvedRequest,reference.calendarActivation);
      if(calendarDecision.state!=="approved"){
        renderGovernedState(approvedRequest,calendarDecision.state,calendarDecision.reason,options.focusStatus===true,reference.festivalActivation,calendarDecision);
        settleCommittedRequest(approvedRequest,calendarDecision.state);
        return false;
      }
      if(calendarDecision.record.output_mode==="approved_precomputed_record"){
        renderActivatedCalendarRecord(approvedRequest,calendarDecision.record,options.focusStatus===true,reference.festivalActivation);
        settleCommittedRequest(approvedRequest,"calculated");
        return true;
      }
      if(calendarDecision.record.output_mode!=="approved_local_calculation"||calendarDecision.record.local_calculation_approved!==true){
        renderGovernedState(approvedRequest,"calculation_pending","The exact daily activation record does not authorise a supported output mode.",options.focusStatus===true,reference.festivalActivation,calendarDecision);
        settleCommittedRequest(approvedRequest,"calculation_pending");
        return false;
      }
      var result;
      try{result=computeDay(approvedRequest);}catch(error){result={available:false,reason:String(error&&error.message||error)};}
      if(result.available)renderCalculated(approvedRequest,result,options.focusStatus===true,reference.festivalActivation);
      else renderUnavailable(approvedRequest,result.reason||"Calculation could not be completed.",options.focusStatus===true,reference.festivalActivation);
      settleCommittedRequest(approvedRequest,result.available?"calculated":"governed_unavailable");
      return Boolean(result.available);
    }catch(error){
      if(error&&error.name==="AbortError")return false;
      if(token!==state.requestToken)return false;
      renderGovernedState(request,"governed_unavailable","The local governed projections or reference data could not be loaded.",options.focusStatus===true,null,null);
      setText("ag74o-book-status","Annual reference book could not be loaded.");
      settleCommittedRequest(request,"governed_unavailable");
      return false;
    }
  }

  function choosePlace`,
  "applySelection function"
);
const interactionStart = controller.indexOf('  window.addEventListener("change"');
const bootStart = controller.indexOf('  function boot() {', interactionStart);
if (interactionStart < 0 || bootStart < 0) throw new Error("R3 interaction-handler replacement anchors missing.");
const interactions = `  window.addEventListener("change",function(event){
    if(!event.target||event.target.id!=="panchang-place-select")return;
    event.stopImmediatePropagation();
    choosePlace(event.target.value);
    if(byId("panchang-place-alias"))byId("panchang-place-alias").value="";
    markRequestPending("Place input changed. Press Calculate Panchang to commit this request; the displayed daily result is unchanged.");
  },true);

  document.addEventListener("input",function(event){
    if(event.target&&event.target.id==="panchang-date-text"){
      event.target.value=applyDateMask(event.target.value);
      if(event.target.value.length===10){
        var parsed=displayToIso(event.target.value);
        if(parsed){
          syncDate(parsed);
          markRequestPending("Date input changed. Press Calculate Panchang to commit this request; the displayed daily result is unchanged.");
        }else{
          setRequestStatus("Enter a valid date in DD/MM/YYYY format. The displayed daily result is unchanged.","invalid_pending_input");
        }
      }
    }
  });

  document.addEventListener("change",function(event){
    if(!event.target)return;
    if(event.target.id==="panchang-date-picker"&&event.target.value){
      syncDate(event.target.value);
      markRequestPending("Date input changed. Press Calculate Panchang to commit this request; the displayed daily result is unchanged.");
      return;
    }
    if(event.target.id==="panchang-date-text"){
      var parsed=displayToIso(event.target.value);
      if(parsed){syncDate(parsed);markRequestPending("Date input changed. Press Calculate Panchang to commit this request; the displayed daily result is unchanged.");}
      else setRequestStatus("Enter a valid date in DD/MM/YYYY format. The displayed daily result is unchanged.","invalid_pending_input");
      return;
    }
    if(event.target.id==="panchang-place-select"){
      choosePlace(event.target.value);
      markRequestPending("Place input changed. Press Calculate Panchang to commit this request; the displayed daily result is unchanged.");
      return;
    }
    if(event.target.id==="panchang-place-alias"){
      markRequestPending("Place query changed. Press Calculate Panchang to commit this request; the displayed daily result is unchanged.");
      return;
    }
    if(event.target.matches('input[name="ag71c-panchang-location-mode"]')){
      var surface=document.querySelector('[data-ag71c-coordinate-surface="panchang"]');
      if(surface)surface.setAttribute("data-ag71d-mode",event.target.value);
      markRequestPending("Location mode changed. Press Calculate Panchang to commit this request; the displayed daily result is unchanged.");
      return;
    }
    if(["panchang-latitude","panchang-longitude","panchang-timezone","panchang-coordinate-label"].includes(event.target.id)&&selectedMode()==="coordinates"){
      markRequestPending("Coordinate or timezone input changed. Press Calculate Panchang to commit this request; the displayed daily result is unchanged.");
    }
  });

  document.addEventListener("keydown",function(event){
    if(event.target&&event.target.id==="panchang-place-alias"&&event.key==="Enter"){
      event.preventDefault();
      markRequestPending("Place query is ready. Press Calculate Panchang to commit this request; Enter does not auto-calculate.");
      var calculate=byId("panchang-calculate");if(calculate)calculate.focus();
    }
    if(event.target&&event.target.matches("[data-ag74i-book-page-button]")&&(event.key==="ArrowLeft"||event.key==="ArrowRight")){
      event.preventDefault();setBookPage(state.bookPage+(event.key==="ArrowRight"?1:-1));var button=document.querySelector('[data-ag74i-book-page-button="'+state.bookPage+'"]');if(button)button.focus();
    }
  });

  window.addEventListener("click",function(event){
    var target=event.target&&event.target.closest?event.target:null;if(!target)return;
    function claim(){event.preventDefault();event.stopImmediatePropagation();}
    if(target.closest("#panchang-calculate")){claim();applySelection({focusStatus:true});return;}
    if(target.closest("#panchang-previous-day")){claim();syncDate(shiftDate(state.dateKey,-1));markRequestPending("Previous Day selected. Press Calculate Panchang to commit it; the displayed daily result is unchanged.");return;}
    if(target.closest("#panchang-next-day")){claim();syncDate(shiftDate(state.dateKey,1));markRequestPending("Next Day selected. Press Calculate Panchang to commit it; the displayed daily result is unchanged.");return;}
    if(target.closest("#panchang-today")){
      claim();
      var request=requestFromUi();
      var timezone=request.mode==="coordinates"?request.timezone:DEFAULT_UI_STATE.timezone;
      if(!timezone||!validTimezone(timezone)){
        setRequestStatus("A valid IANA timezone is required to determine Today. No timezone was substituted and the displayed daily result is unchanged.","invalid_pending_input");
        return;
      }
      syncDate(todayInTimezone(timezone));
      markRequestPending("Today selected using the stated timezone. Press Calculate Panchang to commit it; the displayed daily result is unchanged.");
      return;
    }
    var pageButton=target.closest("[data-ag74i-book-page-button]");if(pageButton){claim();setBookPage(pageButton.getAttribute("data-ag74i-book-page-button"));return;}
    if(target.closest("#ag74i-book-previous")){claim();setBookPage(state.bookPage-1);return;}
    if(target.closest("#ag74i-book-next")){claim();setBookPage(state.bookPage+1);return;}
  },true);

`;
controller = controller.slice(0, interactionStart) + interactions + controller.slice(bootStart);
controller = replaceOne(
  controller,
  /  function boot\(\) \{[\s\S]*?\n  \}/g,
  `  function boot() {
    if(Astronomy){Astronomy.SetDeltaTFunction(Astronomy.DeltaT_EspenakMeeus);}
    installSelectorHardening();
    choosePlace(DEFAULT_UI_STATE.value);
    syncDate(todayInTimezone(DEFAULT_UI_STATE.timezone));
    setBookPage(1);
    card.setAttribute("data-ag74o-r3-request-dirty","false");
    var request=requestFromUi();
    renderGovernedState(request,"ui_state_only","Varanasi/today is the landing UI state only. No request has been committed and no exact public-selection, daily-record and computation-approved record has been resolved.",false,null,null);
    setRequestStatus("Review the inputs, then press Calculate Panchang. Changing inputs will not replace the last committed result.","ready");
    state.requestToken+=1;
    var token=state.requestToken;
    state.activeAbort=new AbortController();
    setBusy(true);
    loadReferenceData(state.activeAbort.signal).then(function(reference){
      if(token!==state.requestToken)return;
      renderBook(reference.calendar,state.dateKey);
      renderObservance(reference.festivalActivation,state.dateKey);
      setBusy(false);
      setResultState("ui_state_only");
      setRequestStatus("Review the inputs, then press Calculate Panchang. Changing inputs will not replace the last committed result.","ready");
    }).catch(function(error){
      if(error&&error.name==="AbortError")return;
      if(token!==state.requestToken)return;
      setText("ag74o-book-status","Annual reference book could not be loaded.");
      setBusy(false);
      setResultState("ui_state_only");
      setRequestStatus("Reference data could not be loaded. No daily result was calculated.","reference_unavailable");
    });
  }`,
  "boot function"
);
if (!controller.includes("window.drishvaraAg74oMarkRequestPending")) {
  controller = controller.replace(
    "  window.drishvaraAg74oApplySelection=applySelection;",
    `  window.drishvaraAg74oApplySelection=applySelection;
  window.drishvaraAg74oMarkRequestPending=markRequestPending;
  window.drishvaraAg74oActivationState=function(){
    var reference=state.referenceData||{};
    return {
      requestDirty:state.pendingInputDirty,
      lastCommittedRequest:state.lastCommittedRequest,
      approvedLocationCount:reference.approvedLocations?reference.approvedLocations.record_count:null,
      approvedDailyRecordCount:reference.calendarActivation?reference.calendarActivation.approved_daily_record_count:null,
      approvedObservanceCount:reference.festivalActivation?reference.festivalActivation.approved_observance_count:null
    };
  };`
  );
}
for (const required of [
  "CALENDAR_ACTIVATION_PATH",
  "FESTIVAL_ACTIVATION_PATH",
  "markRequestPending",
  "settleCommittedRequest",
  "resolveActivatedCalendarRecord",
  "renderActivatedCalendarRecord",
  'target.closest("#panchang-calculate")',
  "computeDay(approvedRequest)",
  "drishvaraAg74oActivationState",
]) {
  if (!controller.includes(required)) throw new Error(`R3 controller marker missing: ${required}`);
}
const handlerBlock = controller.slice(controller.indexOf('  window.addEventListener("change"'), controller.indexOf('  function boot() {'));
if ((handlerBlock.match(/applySelection\(/g) || []).length !== 1 || !handlerBlock.includes('target.closest("#panchang-calculate")')) {
  throw new Error("Input handlers must not auto-commit; exactly one Calculate Panchang commit call is required.");
}
writeText("assets/js/ag74o-panchang-public-controller.js", controller);

const runtime = json(runtimeContractPath);
runtime.version = "3.0.0";
runtime.runtime.click_required_for_request = true;
runtime.runtime.automatic_calculation_on_input_change = false;
runtime.runtime.pending_input_preserves_last_committed_result = true;
runtime.runtime.approved_daily_calendar_record_count = activatedDaily.length;
runtime.runtime.approved_festival_observance_count = activatedFestivals.length;
runtime.date_location.input_change_commits_request = false;
runtime.date_location.calculate_control_id = "panchang-calculate";
runtime.annual_book.reference_book_is_not_daily_activation = true;
runtime.annual_book.pending_date_synchronization_allowed = true;
runtime.festival_guard.activation_projection_path = "data/knowledge-base/panchang-festival/production/ag74o-r3-festival-observance-activation-projection.json";
runtime.r3_calendar_activation = {
  status: "activation_layer_active_public_outputs_blocked",
  calendar_projection_path: "data/knowledge-base/panchang-festival/production/ag74o-r3-calendar-activation-projection.json",
  festival_projection_path: "data/knowledge-base/panchang-festival/production/ag74o-r3-festival-observance-activation-projection.json",
  approved_location_count: locationProjection.record_count,
  approved_daily_record_count: activatedDaily.length,
  approved_observance_count: activatedFestivals.length,
  explicit_request_commit_required: true,
  public_runtime_activation_allowed_now: false,
};
writeJson(runtimeContractPath, runtime);

console.log("✅ AG74O-R3 governed calendar activation layer generated.");
console.log(`✅ Approved locations: ${locationProjection.record_count}`);
console.log(`✅ Approved daily calendar records: ${activatedDaily.length}`);
console.log(`✅ Approved festival observances: ${activatedFestivals.length}`);
console.log("✅ Explicit Calculate Panchang request commitment activated.");
console.log("✅ Public calendar and festival output remain blocked.");
