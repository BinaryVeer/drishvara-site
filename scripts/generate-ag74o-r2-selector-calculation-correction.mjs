import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const EXPECTED_DIAGNOSIS_SHA =
  "83b5253fd0c9c50081087a7bc8cfe255d10643eff87e045bc875b60bddece828";
const EXPECTED_BASELINE =
  "1065f845ccc5894051b9f5f44e19cdecd873cd58";
const MAX_BUFFER = 512 * 1024 * 1024;

function full(relativePath) {
  return path.join(root, relativePath);
}
function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(full(relativePath), "utf8"));
}
function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(full(relativePath)), { recursive: true });
  fs.writeFileSync(full(relativePath), JSON.stringify(value, null, 2) + "\n");
}
function writeText(relativePath, value) {
  fs.mkdirSync(path.dirname(full(relativePath)), { recursive: true });
  fs.writeFileSync(full(relativePath), value);
}
function sha256File(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}
function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = true;
    } else {
      parsed[key] = next;
      index += 1;
    }
  }
  return parsed;
}
function listZip(zipPath) {
  return execFileSync("unzip", ["-Z1", zipPath], {
    encoding: "utf8",
    maxBuffer: MAX_BUFFER,
  }).split(/\r?\n/).filter(Boolean);
}
function findEntry(entries, suffix) {
  const matches = entries.filter(
    (entry) => entry === suffix || entry.endsWith(`/${suffix}`)
  );
  if (matches.length !== 1) {
    throw new Error(
      `Expected exactly one ZIP entry ending with ${suffix}; found ${matches.length}.`
    );
  }
  return matches[0];
}
function readZipJson(zipPath, entries, suffix) {
  const body = execFileSync(
    "unzip",
    ["-p", zipPath, findEntry(entries, suffix)],
    { encoding: "utf8", maxBuffer: MAX_BUFFER }
  );
  return JSON.parse(body);
}
function replaceOne(source, pattern, replacement, label) {
  const matches = source.match(pattern);
  if (!matches || matches.length !== 1) {
    throw new Error(
      `${label} replacement requires exactly one match; found ${matches ? matches.length : 0}.`
    );
  }
  return source.replace(pattern, replacement);
}

const args = parseArgs(process.argv.slice(2));
const diagnosisZip = path.resolve(
  String(args.diagnosisZip || process.env.AG74O_R2_DIAGNOSIS_ZIP || "")
);
if (!diagnosisZip || !fs.existsSync(diagnosisZip)) {
  throw new Error(
    "Provide --diagnosisZip /absolute/path/to/AG74O_R2_Selector_Calculation_Diagnosis_*.zip"
  );
}
const diagnosisSha = sha256File(diagnosisZip);
if (diagnosisSha !== EXPECTED_DIAGNOSIS_SHA) {
  throw new Error(
    `Diagnosis SHA-256 mismatch. Expected ${EXPECTED_DIAGNOSIS_SHA}; got ${diagnosisSha}.`
  );
}

const entries = listZip(diagnosisZip);
const diagnosis = readZipJson(diagnosisZip, entries, "diagnosis_report.json");
const sourceHashes = readZipJson(
  diagnosisZip,
  entries,
  "source_hash_inventory.json"
);
const requiredContract = readZipJson(
  diagnosisZip,
  entries,
  "required_r2_resolution_contract.json"
);
const findings = readZipJson(
  diagnosisZip,
  entries,
  "selector_calculation_findings.json"
);

if (diagnosis.repository?.head !== EXPECTED_BASELINE) {
  throw new Error("R2 diagnosis repository baseline mismatch.");
}
if (diagnosis.ready_for_r2_apply_package_planning !== true) {
  throw new Error("R2 diagnosis is not ready for apply-package planning.");
}
if (diagnosis.failures?.length) {
  throw new Error("R2 diagnosis contains failures.");
}
if (
  findings.critical_finding_count !== 4 ||
  findings.major_finding_count !== 4 ||
  findings.finding_count !== 8
) {
  throw new Error("R2 diagnosis finding-count mismatch.");
}
if (
  diagnosis.approval_counts?.public_selection_approved_count !== 0 ||
  diagnosis.approval_counts?.computation_approved_count !== 0 ||
  diagnosis.approval_counts?.canonical_place_approved_count !== 0 ||
  diagnosis.approval_counts?.coordinate_approved_count !== 0 ||
  diagnosis.approval_counts?.timezone_approved_count !== 0
) {
  throw new Error("R2 diagnosis approval baseline is not zero.");
}

for (const [relativePath, expectedSha] of Object.entries(sourceHashes)) {
  if (!fs.existsSync(full(relativePath))) {
    throw new Error(`Missing governed R2 input: ${relativePath}`);
  }
  const actualSha = sha256File(full(relativePath));
  if (actualSha !== expectedSha) {
    throw new Error(
      `Governed R2 input changed: ${relativePath}. Expected ${expectedSha}; got ${actualSha}.`
    );
  }
}

const generatedAt = new Date().toISOString();

const projection = {
  module_id: "AG74O-R2",
  title: "Browser-Approved Governed Location Projection",
  status: "ag74o_r2_browser_projection_created_no_approved_records",
  generated_at_utc: generatedAt,
  diagnosis_evidence: {
    filename: path.basename(diagnosisZip),
    sha256: diagnosisSha,
    report_manifest_verified: true,
    repository_head: diagnosis.repository.head,
  },
  default_ui_state: {
    selector_value: "varanasi-uttar-pradesh-india",
    display_label: "Varanasi / Banaras",
    timezone_display_basis: "Asia/Kolkata",
    date_basis: "today_in_ui_state_timezone",
    canonical_place_record_resolved: false,
    coordinate_approved: false,
    timezone_approved: false,
    public_selection_approved: false,
    computation_approved: false,
    automatic_result_allowed: false,
  },
  source_counts: diagnosis.r1e_counts,
  approval_counts: diagnosis.approval_counts,
  record_count: 0,
  search_label_count: 0,
  governance: {
    projection_contains_only_fully_approved_records: true,
    candidate_only_records_exposed_as_selector_options: false,
    default_ui_state_is_approval: false,
    automatic_place_substitution_allowed: false,
    automatic_timezone_substitution_allowed: false,
    automatic_calculation_allowed: false,
    runtime_external_api_dependency_allowed: false,
    public_output_allowed_now: false,
  },
  records: [],
  search_labels: [],
};

const selectorContract = {
  module_id: "AG74O-R2",
  title: "Selector Query and Exact Resolution Contract",
  status: "ag74o_r2_selector_query_resolution_contract_created",
  generated_at_utc: generatedAt,
  ...requiredContract,
  current_browser_projection_record_count: projection.record_count,
  exact_resolution_outcomes: {
    exact_fully_approved_record: "approved_for_calculation_gate",
    exact_candidate_or_unapproved_ui_state: "calculation_pending",
    unknown_named_place_or_alias: "governed_unavailable",
    ambiguous_alias: "governed_unavailable",
    invalid_coordinate_or_timezone_input: "invalid_input",
    valid_unapproved_coordinate_request: "calculation_pending",
  },
  governance: {
    fallback_to_default_place_allowed: false,
    fallback_to_default_timezone_allowed: false,
    ambiguous_alias_auto_resolution_allowed: false,
    candidate_only_public_option_allowed: false,
  },
};

const calculationContract = {
  module_id: "AG74O-R2",
  title: "Approval-Aware Panchang Calculation Resolver Contract",
  status: "ag74o_r2_calculation_approval_resolver_contract_created",
  generated_at_utc: generatedAt,
  gate_order: [
    "exact canonical-place resolution",
    "canonical-place approval",
    "coordinate approval",
    "timezone approval",
    "public-selection approval",
    "computation approval",
    "supported date validation",
    "unresolved-review blocker check",
    "local calculation execution",
  ],
  current_gate_result: "blocked_no_computation_approved_records",
  current_computation_approved_record_count: 0,
  compute_day_may_run_before_gate: false,
  internal_calculation_engine_retained: true,
  direct_internal_engine_test_allowed: true,
  public_unapproved_calculation_allowed: false,
  automatic_calculation_on_page_boot_allowed: false,
  runtime_external_api_dependency_allowed: false,
};

const provenanceContract = {
  module_id: "AG74O-R2",
  title: "Location, Coordinate and Timezone Provenance Display Contract",
  status: "ag74o_r2_location_provenance_display_contract_created",
  generated_at_utc: generatedAt,
  required_dom_ids: [
    "panchang-location-provenance",
    "panchang-coordinate-provenance",
    "panchang-timezone-provenance",
    "panchang-approval-provenance",
  ],
  required_fields: requiredContract.provenance_fields,
  ui_state_language: {
    location: "UI state only until an exact approved canonical record resolves",
    coordinate: "No approved coordinate basis",
    timezone: "Timezone may establish the UI date basis without approving calculation",
    approval: "Public selection and computation approval shown separately",
  },
  candidate_value_may_be_described_as_approved: false,
  missing_provenance_may_be_silently_substituted: false,
};

const resultStateContract = {
  module_id: "AG74O-R2",
  title: "Governed Panchang Result-State Contract",
  status: "ag74o_r2_result_state_contract_created",
  generated_at_utc: generatedAt,
  states: {
    ui_state_only: {
      calculation_performed: false,
      meaning: "Landing date and place labels are established without resolving or calculating a result.",
    },
    loading: {
      calculation_performed: false,
      meaning: "Governed projection and local reference files are being checked.",
    },
    governed_unavailable: {
      calculation_performed: false,
      meaning: "No exact approved named-location or alias resolution exists.",
    },
    calculation_pending: {
      calculation_performed: false,
      meaning: "Input is structurally valid but one or more explicit approvals are absent.",
    },
    calculated: {
      calculation_performed: true,
      meaning: "All approval gates passed and the local browser engine completed.",
    },
    invalid_input: {
      calculation_performed: false,
      meaning: "Date, coordinate or IANA timezone validation failed without substitution.",
    },
  },
  default_state: "ui_state_only",
  default_varanasi_today_calculation_allowed: false,
  unapproved_coordinate_calculation_allowed: false,
};

writeJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r2-browser-approved-location-projection.json",
  projection
);
writeJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r2-selector-query-resolution-contract.json",
  selectorContract
);
writeJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r2-calculation-approval-resolver-contract.json",
  calculationContract
);
writeJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r2-location-provenance-display-contract.json",
  provenanceContract
);
writeJson(
  "data/knowledge-base/panchang-festival/production/ag74o-r2-result-state-contract.json",
  resultStateContract
);

let index = fs.readFileSync(full("index.html"), "utf8");

const selectPattern =
  /<select\b[^>]*\bid=["']panchang-place-select["'][^>]*>[\s\S]*?<\/select>/g;
const selectMatch = index.match(selectPattern);
if (!selectMatch || selectMatch.length !== 1) {
  throw new Error(
    `Expected exactly one Panchang place select; found ${selectMatch ? selectMatch.length : 0}.`
  );
}
let openingTag = selectMatch[0].match(/^<select\b[^>]*>/i)?.[0];
if (!openingTag) throw new Error("Panchang place select opening tag could not be parsed.");
openingTag = openingTag
  .replace(/\sdisabled(?:=["'][^"']*["'])?/gi, "")
  .replace(/\saria-disabled=["'][^"']*["']/gi, "")
  .replace(/\sdata-ag74o-r2-approved-option-count=["'][^"']*["']/gi, "")
  .replace(/\sdata-ag74o-r2-ui-state-only=["'][^"']*["']/gi, "")
  .replace(
    />$/,
    ' data-ag74o-r2-approved-option-count="0" data-ag74o-r2-ui-state-only="true" aria-describedby="panchang-selection-status panchang-approval-provenance">'
  );
const originalSelectMarkup = selectMatch[0];
const originalOptionsMarkup = originalSelectMarkup.slice(
  originalSelectMarkup.indexOf(">") + 1,
  originalSelectMarkup.toLowerCase().lastIndexOf("</select>")
);

let correctedOptionsMarkup = originalOptionsMarkup
  .replace(
    /<option\b(?=[^>]*\bvalue=["']varanasi-uttar-pradesh-india["'])/i,
    '<option data-ag74o-r2-ui-state-only="true" data-ag74o-r2-public-approved="false" data-ag74o-r2-computation-approved="false"'
  )
  .replace(
    /<option\b(?=[^>]*\bvalue=["'](?:itanagar-arunachal-pradesh-india|new-delhi-delhi-india|ranchi-jharkhand-india|tokyo-japan)["'])/gi,
    '<option data-ag74o-r2-legacy-compat-option="true" data-ag74o-r2-public-approved="false" data-ag74o-r2-computation-approved="false"'
  );

const correctedSelect =
  `${openingTag}${correctedOptionsMarkup}</select>`;
index = index.replace(selectPattern, correctedSelect);

if (!index.includes('data-ag74o-r2-provenance="true"')) {
  const statusPattern =
    /<([a-z0-9]+)\b([^>]*\bid=["']panchang-selection-status["'][^>]*)>[\s\S]*?<\/\1>/gi;
  const matches = index.match(statusPattern);
  if (!matches || matches.length !== 1) {
    throw new Error(
      `Expected exactly one Panchang selection-status element; found ${matches ? matches.length : 0}.`
    );
  }
  const provenanceMarkup = `
<div class="ag74o-r2-provenance" data-ag74o-r2-provenance="true" aria-label="Location and approval provenance">
  <p><strong>Location basis:</strong> <span id="panchang-location-provenance">Varanasi / Banaras · landing UI state only</span></p>
  <p><strong>Coordinate basis:</strong> <span id="panchang-coordinate-provenance">No approved coordinate basis</span></p>
  <p><strong>Timezone basis:</strong> <span id="panchang-timezone-provenance">Asia/Kolkata · UI date basis only</span></p>
  <p><strong>Approval basis:</strong> <span id="panchang-approval-provenance">Public selection blocked · computation blocked</span></p>
</div>`;
  index = index.replace(statusPattern, (match) => `${match}${provenanceMarkup}`);
}

if (!index.includes("AG74O_R2_SELECTOR_CALCULATION_STYLE_START")) {
  const style = `
<style data-ag74o-r2-selector-calculation-style="true">
/* AG74O_R2_SELECTOR_CALCULATION_STYLE_START */
.ag74o-r2-provenance{
  display:grid;
  grid-template-columns:minmax(0,1fr);
  gap:6px;
  width:100%;
  max-width:100%;
  min-width:0;
  box-sizing:border-box;
  margin-top:10px;
  padding:12px 14px;
  border:1px solid rgba(211,169,72,.22);
  border-radius:14px;
  background:rgba(7,19,41,.5);
  font-family:Arial,sans-serif;
  font-size:.9rem;
  line-height:1.45;
  overflow:hidden;
}
.ag74o-r2-provenance p,
.ag74o-r2-provenance span,
.ag74o-r2-provenance strong{
  min-width:0;
  max-width:100%;
  margin:0;
  overflow-wrap:anywhere;
  word-break:break-word;
}
#panchang-festival-card .form-grid{
  display:block!important;
  width:100%!important;
  max-width:100%!important;
  min-width:0!important;
  margin:0!important;
  padding:0!important;
  box-sizing:border-box!important;
}
#panchang-festival-card [data-ag74o-place-selection="governed-dropdown-only"]{
  position:relative!important;
  left:auto!important;
  right:auto!important;
  inset:auto!important;
  transform:none!important;
  display:block!important;
  width:100%!important;
  max-width:100%!important;
  min-width:0!important;
  margin:.9rem 0 1rem!important;
  padding:0!important;
  grid-column:1 / -1!important;
  justify-self:stretch!important;
  align-self:stretch!important;
  box-sizing:border-box!important;
}
[data-ag74o-place-selection="governed-dropdown-only"],
[data-ag74o-place-selection="governed-dropdown-only"] .drishvara-hf12-select,
[data-ag74o-daily-result-surface="true"],
.ag74i-date-surface,
.ag71c-coordinate-surface,
.ag74i-calendar-book{
  min-width:0!important;
  max-width:100%!important;
  box-sizing:border-box!important;
}
[data-ag74o-place-selection="governed-dropdown-only"] .drishvara-hf12-select-button,
[data-ag74o-place-selection="governed-dropdown-only"] .drishvara-hf12-select-menu{
  max-width:100%!important;
  box-sizing:border-box!important;
}
[data-ag74o-daily-result-surface="true"] td,
[data-ag74o-daily-result-surface="true"] th{
  min-width:0;
  overflow-wrap:anywhere;
  word-break:break-word;
}
/* AG74O_R2_SELECTOR_CALCULATION_STYLE_END */
</style>
`;
  if (!index.includes("</head>")) throw new Error("index.html closing head tag is missing.");
  index = index.replace("</head>", `${style}</head>`);
}

const legacyStaticCompatibilityLabels = [
  "Itanagar",
  "New Delhi",
  "Ranchi",
  "Tokyo",
];
for (const label of legacyStaticCompatibilityLabels) {
  if (!index.includes(`>${label}</option>`)) {
    throw new Error(
      `Required corrected index marker missing: legacy Panchang compatibility option ${label}`
    );
  }
}
if (
  (index.match(/data-ag74o-r2-legacy-compat-option="true"/g) || []).length !== 4
) {
  throw new Error(
    "Required corrected index marker mismatch: expected exactly four legacy compatibility options."
  );
}
if (
  !index.includes('data-ag74o-r2-public-approved="false"') ||
  !index.includes('data-ag74o-r2-computation-approved="false"')
) {
  throw new Error(
    "Required corrected index marker missing: approval-block attributes."
  );
}

writeText("index.html", index);

let controller = fs.readFileSync(
  full("assets/js/ag74o-panchang-public-controller.js"),
  "utf8"
);

controller = replaceOne(
  controller,
  /  var LOCATION_MAP = \{[\s\S]*?\n  \};\n\n  var ALIASES = \{[\s\S]*?\n  \};/g,
  `  var APPROVED_LOCATION_PATH = "data/knowledge-base/location-intelligence/production/ag74o-r2-browser-approved-location-projection.json";
  var DEFAULT_UI_STATE = {
    value:"varanasi-uttar-pradesh-india",
    canonicalId:null,
    label:"Varanasi / Banaras",
    timezone:"Asia/Kolkata",
    latitude:null,
    longitude:null,
    publicSelectionApproved:false,
    computationApproved:false
  };`,
  "hardcoded location and alias maps"
);

controller = replaceOne(
  controller,
  /  function setResultState\(name\) \{[\s\S]*?\n  \}/g,
  `  function setResultState(name) {
    var mapped=name==="calculated"?"unique_publicly_approved_record":name;
    card.setAttribute("data-ag74o-result-state",name);
    card.setAttribute("data-ag74i-result-state",mapped);
  }`,
  "result-state function"
);

controller = replaceOne(
  controller,
  /  function renderUnavailable\(request, reason, focusStatus, bank\) \{[\s\S]*?\n  \}\n\n  function renderCalculated/g,
  `  function setProvenance(request, decision) {
    decision=decision||{};
    var label=request&&request.label?request.label:"Unresolved location";
    var timezone=request&&request.timezone?request.timezone:"No timezone resolved";
    var coordinateText="No approved coordinate basis";
    if(request&&request.mode==="coordinates"&&Number.isFinite(request.latitude)&&Number.isFinite(request.longitude)){
      coordinateText=request.latitude+", "+request.longitude+" · user supplied, not computation-approved";
    }else if(decision.record&&Number.isFinite(decision.record.latitude)&&Number.isFinite(decision.record.longitude)){
      coordinateText=decision.record.latitude+", "+decision.record.longitude+" · approved governed projection";
    }
    setText("panchang-location-provenance",label+(decision.record?" · exact governed record":" · UI/input state only"));
    setText("panchang-coordinate-provenance",coordinateText);
    setText("panchang-timezone-provenance",timezone+(decision.record?" · approved governed projection":" · not approved for computation"));
    setText("panchang-approval-provenance",decision.record?"Public selection approved · computation approved":"Public selection blocked · computation blocked");
  }

  function renderGovernedState(request, stateName, reason, focusStatus, bank, decision) {
    var pending=stateName==="calculation_pending"||stateName==="ui_state_only";
    var invalid=stateName==="invalid_input";
    setText("panchang-calculation-source",pending?"No Panchang computation performed":invalid?"Invalid input — no calculation performed":"Governed result unavailable");
    setText("panchang-method-basis","Approval-aware governed resolver · local engine not invoked");
    setText("panchang-moonrise",(request.label||"Unresolved location")+" · "+(request.timezone||"Timezone unavailable"));
    setText("panchang-moonset",isoToDisplay(request.dateKey));
    var dailyValue=pending?"Pending approval":"Unavailable";
    ["panchang-sunrise","panchang-sunset","panchang-vara","panchang-tithi","panchang-nakshatra","panchang-yoga","panchang-karana","panchang-paksha"].forEach(function(id){setText(id,dailyValue);});
    ["panchang-tithi-transition","panchang-nakshatra-transition","panchang-yoga-transition","panchang-karana-transition"].forEach(function(id){setText(id,dailyValue);});
    setText("panchang-selection-status",reason+" No alternate date, place or timezone has been substituted.");
    setProvenance(request,decision);
    renderObservance(bank,request.dateKey);
    setResultState(stateName);
    setBusy(false);
    if(focusStatus&&byId("panchang-selection-status"))byId("panchang-selection-status").focus();
  }

  function renderUnavailable(request, reason, focusStatus, bank) {
    renderGovernedState(request,"governed_unavailable",reason,focusStatus,bank,null);
  }

  function renderCalculated`,
  "unavailable renderer"
);

const calculatedStatus =
  '    setText("panchang-selection-status","Calculated for "+request.label+" on "+isoToDisplay(request.dateKey)+". Times use "+request.timezone+". No input has been stored.");';
if (!controller.includes(calculatedStatus)) {
  throw new Error("Calculated status marker is missing.");
}
controller = controller.replace(
  calculatedStatus,
  `${calculatedStatus}
    setProvenance(request,{record:request.governedRecord||null});`
);

controller = replaceOne(
  controller,
  /  function selectedMode\(\) \{[\s\S]*?\n  \}\n\n  function choosePlace/g,
  `  function selectedMode() { var checked=document.querySelector('input[name="ag71c-panchang-location-mode"]:checked');return checked&&checked.value==="coordinates"?"coordinates":"place"; }
  function normalAlias(value){return String(value||"").normalize("NFKD").replace(/[\\u0300-\\u036f]/g,"").trim().toLowerCase().replace(/[^a-z0-9]+/g," ").replace(/\\s+/g," ").trim();}

  var selectorHardeningActive=false;
  var selectorObserver=null;

  function hardenUiStateSelector() {
    if(selectorHardeningActive)return;
    selectorHardeningActive=true;
    try{
      var select=byId("panchang-place-select");
      if(!select)return;

      Array.prototype.slice.call(select.options||[]).forEach(function(option){
        if(option.value!==DEFAULT_UI_STATE.value)option.remove();
      });

      var option=Array.prototype.slice.call(select.options||[]).find(function(item){
        return item.value===DEFAULT_UI_STATE.value;
      });

      if(!option){
        option=document.createElement("option");
        option.value=DEFAULT_UI_STATE.value;
        select.appendChild(option);
      }

      option.textContent="Varanasi / Banaras — landing UI state; calculation approval pending";
      option.selected=true;
      option.setAttribute("data-ag74o-r2-ui-state-only","true");
      option.setAttribute("data-ag74o-r2-public-approved","false");
      option.setAttribute("data-ag74o-r2-computation-approved","false");

      select.value=DEFAULT_UI_STATE.value;
      select.disabled=false;
      select.removeAttribute("aria-disabled");
      select.setAttribute("data-ag74o-r2-approved-option-count","0");
      select.setAttribute("data-ag74o-r2-ui-state-only","true");

      var safeWrap=select.nextElementSibling&&select.nextElementSibling.matches&&select.nextElementSibling.matches("[data-drishvara-hf12-select]")?select.nextElementSibling:null;
      if(safeWrap){
        safeWrap.setAttribute("data-open","false");
        var safeButton=safeWrap.querySelector(".drishvara-hf12-select-button");
        if(safeButton){
          safeButton.textContent=option.textContent;
          safeButton.disabled=false;
          safeButton.removeAttribute("aria-disabled");
          safeButton.setAttribute("aria-expanded","false");
        }

        safeWrap.querySelectorAll(".drishvara-hf12-select-option").forEach(function(item){
          if(item.dataset.value!==DEFAULT_UI_STATE.value){
            item.remove();
            return;
          }
          item.textContent=option.textContent;
          item.disabled=false;
          item.removeAttribute("aria-disabled");
          item.setAttribute("aria-selected","true");
          item.setAttribute("data-ag74o-r2-ui-state-only","true");
          item.setAttribute("data-ag74o-r2-public-approved","false");
        });
      }
    }finally{
      selectorHardeningActive=false;
    }
  }

  function installSelectorHardening() {
    var select=byId("panchang-place-select");
    if(!select)return;
    hardenUiStateSelector();
    if(selectorObserver)selectorObserver.disconnect();
    selectorObserver=new MutationObserver(function(){
      window.setTimeout(hardenUiStateSelector,0);
    });
    selectorObserver.observe(select,{childList:true,subtree:false});
    window.setTimeout(hardenUiStateSelector,0);
    window.setTimeout(hardenUiStateSelector,100);
  }

  function requestFromUi() {
    if(selectedMode()==="coordinates"){
      return {
        mode:"coordinates",
        dateKey:state.dateKey,
        label:(byId("panchang-coordinate-label")&&byId("panchang-coordinate-label").value.trim())||"Entered coordinates",
        latitude:Number(byId("panchang-latitude").value),
        longitude:Number(byId("panchang-longitude").value),
        timezone:String(byId("panchang-timezone").value||"").trim()
      };
    }
    var alias=normalAlias(byId("panchang-place-alias")&&byId("panchang-place-alias").value);
    return {
      mode:"place",
      dateKey:state.dateKey,
      query:alias,
      value:DEFAULT_UI_STATE.value,
      label:alias?"Entered place alias: "+alias:DEFAULT_UI_STATE.label,
      latitude:null,
      longitude:null,
      timezone:alias?"":DEFAULT_UI_STATE.timezone,
      canonicalId:null,
      uiStateOnly:!alias
    };
  }

  function loadReferenceData(signal) {
    if(state.referenceData)return Promise.resolve(state.referenceData);
    return Promise.all([
      fetch(ANNUAL_PATH,{cache:"no-store",signal:signal}).then(function(response){if(!response.ok)throw new Error("Annual book unavailable");return response.json();}),
      fetch(FESTIVAL_PATH,{cache:"no-store",signal:signal}).then(function(response){if(!response.ok)throw new Error("Festival guard bank unavailable");return response.json();}),
      fetch(APPROVED_LOCATION_PATH,{cache:"no-store",signal:signal}).then(function(response){if(!response.ok)throw new Error("Governed approved-location projection unavailable");return response.json();})
    ]).then(function(values){
      if(!values[2]||values[2].record_count!==values[2].records.length)throw new Error("Governed projection count mismatch");
      state.referenceData={calendar:values[0],festival:values[1],approvedLocations:values[2]};
      return state.referenceData;
    });
  }

  function resolveApprovedGovernedRecord(request, projection) {
    if(!request.dateKey||request.dateKey<SUPPORTED_START||request.dateKey>SUPPORTED_END){
      return {state:"invalid_input",reason:"Date must be from 01/01/1900 to 31/12/2100."};
    }
    if(request.mode==="coordinates"){
      if(!Number.isFinite(request.latitude)||request.latitude< -90||request.latitude>90||!Number.isFinite(request.longitude)||request.longitude< -180||request.longitude>180){
        return {state:"invalid_input",reason:"Latitude or longitude is outside the supported worldwide range."};
      }
      if(!request.timezone||!validTimezone(request.timezone)){
        return {state:"invalid_input",reason:"Enter a validated IANA timezone for the supplied coordinates. Asia/Kolkata or another timezone will not be substituted."};
      }
      return {state:"calculation_pending",reason:"The coordinate request is valid, but no explicit coordinate, timezone and computation approval exists."};
    }
    var records=projection&&Array.isArray(projection.records)?projection.records:[];
    if(request.query){
      var matches=records.filter(function(record){
        return Array.isArray(record.search_labels)&&record.search_labels.indexOf(request.query)!==-1;
      });
      if(matches.length!==1){
        return {state:"governed_unavailable",reason:matches.length>1?"The place alias is ambiguous and requires governed review.":"This place or alias is not in the publicly approved governed location projection. Use coordinates with a validated IANA timezone to create a calculation-pending request."};
      }
      return {state:"approved",record:matches[0]};
    }
    var record=records.find(function(item){return item.selector_value===request.value;});
    if(!record){
      return {state:"calculation_pending",reason:"Varanasi/today is established as the landing UI state, but no exact public-selection and computation-approved record is available."};
    }
    return {state:"approved",record:record};
  }

  function requestFromApprovedRecord(request, record) {
    return {
      mode:"place",
      dateKey:request.dateKey,
      value:record.selector_value,
      canonicalId:record.canonical_place_id,
      label:record.display_label,
      latitude:Number(record.latitude),
      longitude:Number(record.longitude),
      timezone:record.timezone,
      governedRecord:record
    };
  }

  async function applySelection(options) {
    options=options||{};
    state.requestToken+=1;
    var token=state.requestToken;
    if(state.activeAbort)state.activeAbort.abort();
    state.activeAbort=new AbortController();
    var request=requestFromUi();
    setBusy(true);
    setResultState("loading");
    setText("panchang-selection-status","Checking the governed location projection and approval state…");
    try{
      var reference=await loadReferenceData(state.activeAbort.signal);
      await new Promise(function(resolve){setTimeout(resolve,0);});
      if(token!==state.requestToken)return false;
      renderBook(reference.calendar,request.dateKey);
      var decision=resolveApprovedGovernedRecord(request,reference.approvedLocations);
      if(decision.state!=="approved"){
        renderGovernedState(request,decision.state,decision.reason,options.focusStatus===true,reference.festival,decision);
        return false;
      }
      var approvedRequest=requestFromApprovedRecord(request,decision.record);
      var result;
      try{result=computeDay(approvedRequest);}catch(error){result={available:false,reason:String(error&&error.message||error)};}
      if(result.available)renderCalculated(approvedRequest,result,options.focusStatus===true,reference.festival);
      else renderUnavailable(approvedRequest,result.reason||"Calculation could not be completed.",options.focusStatus===true,reference.festival);
      return Boolean(result.available);
    }catch(error){
      if(error&&error.name==="AbortError")return false;
      if(token!==state.requestToken)return false;
      renderGovernedState(request,"governed_unavailable","The local governed projection or reference data could not be loaded.",options.focusStatus===true,null,null);
      setText("ag74o-book-status","Annual reference book could not be loaded.");
      return false;
    }
  }

  function choosePlace`,
  "request and approval resolver block"
);

controller = replaceOne(
  controller,
  /  function choosePlace\(value\) \{[\s\S]*?\n  \}\n\n  window\.addEventListener\("change"/g,
  `  function choosePlace(value) {
    if(value!==DEFAULT_UI_STATE.value)return false;
    hardenUiStateSelector();
    state.selectedPlaceValue=DEFAULT_UI_STATE.value;
    var select=byId("panchang-place-select");
    if(select){
      select.value=DEFAULT_UI_STATE.value;
      select.disabled=false;
      select.removeAttribute("aria-disabled");
      select.setAttribute("data-ag74o-selected-value",DEFAULT_UI_STATE.value);
      select.setAttribute("data-ag74o-r2-approved-option-count","0");
      select.setAttribute("data-ag74o-r2-ui-state-only","true");
      var safeWrap=select.nextElementSibling&&select.nextElementSibling.matches&&select.nextElementSibling.matches("[data-drishvara-hf12-select]")?select.nextElementSibling:null;
      if(safeWrap){
        safeWrap.setAttribute("data-open","false");
        var safeButton=safeWrap.querySelector(".drishvara-hf12-select-button");
        if(safeButton){
          safeButton.textContent="Varanasi / Banaras — landing UI state; calculation approval pending";
          safeButton.disabled=false;
          safeButton.removeAttribute("aria-disabled");
          safeButton.setAttribute("aria-expanded","false");
        }
        safeWrap.querySelectorAll(".drishvara-hf12-select-option").forEach(function(item){
          item.disabled=false;
          item.removeAttribute("aria-disabled");
          item.setAttribute("aria-selected",item.dataset.value===DEFAULT_UI_STATE.value?"true":"false");
        });
      }
    }
    document.querySelectorAll('[data-ag71d-r4-select-kind="panchang"]').forEach(function(button){
      button.setAttribute("aria-pressed","false");
      button.setAttribute("aria-disabled","true");
    });
    var summary=document.querySelector('[data-ag71d-r5-selection-summary="panchang"]');
    if(summary)summary.textContent="Panchang landing state: Varansi / Banaras. Calculation approval pending.";
    card.setAttribute("data-ag74o-selected-place",DEFAULT_UI_STATE.value);
    return true;
  }

  window.addEventListener("change"`,
  "choose-place function"
);

controller = controller.replace(
  'if(event.target.id==="panchang-place-alias"){var request=requestFromUi();if(!request.invalid&&request.value)choosePlace(request.value);applySelection({focusStatus:true});return;}',
  'if(event.target.id==="panchang-place-alias"){applySelection({focusStatus:true});return;}'
);
controller = controller.replace(
  'if(event.target&&event.target.id==="panchang-place-alias"&&event.key==="Enter"){event.preventDefault();var request=requestFromUi();if(!request.invalid&&request.value)choosePlace(request.value);applySelection({focusStatus:true});}',
  'if(event.target&&event.target.id==="panchang-place-alias"&&event.key==="Enter"){event.preventDefault();applySelection({focusStatus:true});}'
);

const todayLine =
  '    if(target.closest("#panchang-today")){claim();var request=requestFromUi();syncDate(todayInTimezone(request.timezone&&validTimezone(request.timezone)?request.timezone:"Asia/Kolkata"));applySelection({focusStatus:true});return;}';
if (!controller.includes(todayLine)) {
  throw new Error("Today-action fallback marker is missing.");
}
controller = controller.replace(
  todayLine,
  `    if(target.closest("#panchang-today")){
      claim();
      var request=requestFromUi();
      var timezone=request.mode==="coordinates"?request.timezone:DEFAULT_UI_STATE.timezone;
      if(!timezone||!validTimezone(timezone)){
        renderGovernedState(request,"invalid_input","A valid IANA timezone is required to determine Today. No timezone has been substituted.",true,state.referenceData&&state.referenceData.festival,null);
        return;
      }
      syncDate(todayInTimezone(timezone));
      applySelection({focusStatus:true});
      return;
    }`
);

controller = replaceOne(
  controller,
  /  function boot\(\) \{[\s\S]*?\n  \}/g,
  `  function boot() {
    if(Astronomy){
      Astronomy.SetDeltaTFunction(Astronomy.DeltaT_EspenakMeeus);
    }
    installSelectorHardening();
    choosePlace(DEFAULT_UI_STATE.value);
    syncDate(todayInTimezone(DEFAULT_UI_STATE.timezone));
    setBookPage(1);
    var request=requestFromUi();
    renderGovernedState(
      request,
      "ui_state_only",
      "Varanasi/today is the landing UI state only. No exact public-selection and computation-approved record has been resolved.",
      false,
      null,
      null
    );
    state.requestToken+=1;
    var token=state.requestToken;
    state.activeAbort=new AbortController();
    setBusy(true);
    loadReferenceData(state.activeAbort.signal).then(function(reference){
      if(token!==state.requestToken)return;
      renderBook(reference.calendar,state.dateKey);
      renderObservance(reference.festival,state.dateKey);
      setBusy(false);
      setResultState("ui_state_only");
    }).catch(function(error){
      if(error&&error.name==="AbortError")return;
      if(token!==state.requestToken)return;
      setText("ag74o-book-status","Annual reference book could not be loaded.");
      setBusy(false);
      setResultState("ui_state_only");
    });
  }`,
  "boot function"
);

controller = controller.replace(
  "  window.drishvaraAg74oApplySelection=applySelection;",
  `  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",function(){
      window.setTimeout(installSelectorHardening,0);
    },{once:true});
  }else{
    window.setTimeout(installSelectorHardening,0);
  }

  window.drishvaraAg74oApplySelection=applySelection;`
);

for (const forbidden of [
  "var LOCATION_MAP = {",
  "var ALIASES = {",
  'LOCATION_MAP[value]||LOCATION_MAP["varanasi-uttar-pradesh-india"]',
  'request.timezone&&validTimezone(request.timezone)?request.timezone:"Asia/Kolkata"',
  'choosePlace("varanasi-uttar-pradesh-india");syncDate(todayInTimezone("Asia/Kolkata"));setBookPage(1);applySelection();',
]) {
  if (controller.includes(forbidden)) {
    throw new Error(`Forbidden legacy controller marker remains: ${forbidden}`);
  }
}
for (const required of [
  "APPROVED_LOCATION_PATH",
  "SetDeltaTFunction",
  "hardenUiStateSelector",
  "installSelectorHardening",
  "MutationObserver",
  "resolveApprovedGovernedRecord",
  "calculation_pending",
  "ui_state_only",
  "panchang-location-provenance",
  "computeDay(approvedRequest)",
]) {
  if (!controller.includes(required)) {
    throw new Error(`Required corrected controller marker missing: ${required}`);
  }
}
writeText(
  "assets/js/ag74o-panchang-public-controller.js",
  controller
);

const runtimeContract = {
  module_id: "AG74O",
  title: "Panchang Public Browser Runtime Contract",
  status: "ag74o_r2_governed_selector_calculation_gate_active_runtime_approval_blocked",
  version: "2.0.0",
  runtime: {
    execution: "static_browser_only",
    astronomy_library:
      "astronomy-engine@2.1.19_exact_local_vendored_browser_bundle",
    browser_bundle_sha256:
      "f41139a87941ea017ab902b954c9389fa27ea72083d7fab4971756d7769d14e6",
    daily_engine: "retained_but_invoked_only_after_explicit_approval_gate",
    supported_start: "1900-01-01",
    supported_end: "2100-12-31",
    default_ui_state_location: "Varanasi / Banaras",
    default_ui_state_timezone: "Asia/Kolkata",
    automatic_calculation_on_boot: false,
    click_required_for_request: false,
    approved_browser_projection_record_count: 0,
    public_runtime_activation_allowed_now: false,
  },
  date_location: {
    native_and_text_sync: true,
    previous_today_next: true,
    named_place_selector_state:
      "active_governed_query_control_zero_approved_results",
    alias_query_state:
      "governed_unavailable_until_exact_public_approval",
    coordinate_mode_state:
      "validated_request_returns_calculation_pending_until_approved",
    nearest_substitution: false,
    timezone_substitution: false,
    reverse_geocoding: false,
    public_named_location_control:
      "approval_aware_governed_projection_only",
    legacy_pilot_quick_pick_visible: false,
  },
  result_states: Object.keys(resultStateContract.states),
  provenance_display: {
    location_basis_visible: true,
    coordinate_basis_visible: true,
    timezone_basis_visible: true,
    approval_basis_visible: true,
  },
  annual_book: {
    basis: "Varanasi_independent_of_daily_selected_location",
    reference_samvat_year: 2083,
    page_count: 4,
    canonical_slot_count: 12,
    available_while_daily_calculation_is_blocked: true,
  },
  festival_guard: {
    condition_candidates_publicly_visible: false,
    approved_final_observance_required: true,
    approved_public_output_required: true,
    ritual_window_never_inferred: true,
  },
  external_api_used: false,
  persistence_enabled: false,
  backend_service_deployed: false,
  supabase_activation_performed: false,
  public_method_selector: false,
  ui_surface: {
    visible_daily_result_surface_count: 1,
    legacy_ag71e_panel: "hidden_inert_compatibility_only",
    named_place_selector:
      "single_active_governed_query_control_zero_approved_records",
    coordinate_mode_selector_retained: true,
    legacy_quick_pick_buttons_visible: false,
  },
};
writeJson(
  "data/knowledge-base/panchang-festival/production/ag74o-panchang-public-runtime-contract.json",
  runtimeContract
);

const review = {
  module_id: "AG74O-R2",
  title: "Selector and Calculation Correction Review",
  status: "ag74o_r2_selector_calculation_correction_completed",
  generated_at_utc: generatedAt,
  issue_count: 0,
  warning_count: 0,
  resolved_findings: findings.findings.map((finding) => ({
    finding_id: finding.finding_id,
    severity: finding.severity,
    title: finding.title,
    resolution_status: "corrected_and_validated",
  })),
  summary: {
    critical_findings_corrected: 4,
    major_findings_corrected: 4,
    browser_approved_location_records: 0,
    automatic_default_calculation_removed: true,
    alternate_place_fallback_removed: true,
    timezone_fallback_removed: true,
    approval_gate_precedes_calculation: true,
    calculation_pending_state_added: true,
    provenance_display_added: true,
    public_location_selector_activated: false,
    panchang_computation_activated: false,
    runtime_external_api_activated: false,
    supabase_activated: false,
    input_persistence_enabled: false,
    ready_for_ag74o_r3_planning: true,
  },
};

const readiness = {
  module_id: "AG74O-R2",
  title: "AG74O-R3 Governed Calendar Activation Readiness",
  status: "ag74o_r2_ready_for_governed_calendar_activation_planning",
  generated_at_utc: generatedAt,
  ready_for_ag74o_r3_planning: true,
  ready_for_public_runtime_activation: false,
  browser_approved_location_records: 0,
  public_selection_approved_records: 0,
  computation_approved_records: 0,
  default_varanasi_today_is_ui_state_only: true,
  selector_calculation_gate_corrected: true,
  next_stage_not_auto_started: true,
};

const nextBoundary = {
  module_id: "AG74O-R2",
  title: "AG74O-R2 to AG74O-R3 Boundary",
  status: "ag74o_r2_to_r3_boundary_locked",
  next_stage: "AG74O-R3",
  next_stage_purpose:
    "Plan governed calendar activation using the corrected approval-aware selector and calculation path without promoting candidate-only locations or bypassing explicit approvals.",
  next_stage_not_auto_started: true,
  allowed_next_scope: [
    "Governed calendar activation planning",
    "Approved-record runtime projection refresh",
    "Annual calendar and daily-result synchronization",
    "Explicit approval-state consumption",
    "Unavailable and calculation-pending state preservation",
  ],
  carried_forward_mandatory_blocks: [
    "Zero public-selection approved records",
    "Zero computation-approved records",
    "All 1,419 unresolved R1E canonical/search reviews",
    "All unresolved coordinate and timezone reviews",
    "All sacred/reference role-source reviews",
  ],
  blocked_without_explicit_validation: [
    "Candidate-only selector activation",
    "Unapproved Panchang computation",
    "Default Varanasi/today result fabrication",
    "Automatic place or timezone substitution",
    "Automatic ambiguous-alias resolution",
    "Runtime external API dependency",
    "Supabase or input persistence",
  ],
};

const quality = {
  module_id: "AG74O-R2",
  status: "pass",
  issue_count: 0,
  generated_at_utc: generatedAt,
  checks: {
    diagnosis_evidence_verified: true,
    projection_record_count_zero: projection.record_count === 0,
    default_ui_state_not_approval:
      projection.default_ui_state.public_selection_approved === false &&
      projection.default_ui_state.computation_approved === false,
    automatic_boot_calculation_removed: true,
    exact_approval_resolver_present: true,
    coordinate_pending_state_present: true,
    named_place_unavailable_state_present: true,
    provenance_display_present: true,
    alternate_place_fallback_removed: true,
    alternate_timezone_fallback_removed: true,
    public_selection_approved_count_zero: true,
    computation_approved_count_zero: true,
    next_stage_is_r3: true,
  },
};

writeJson(
  "data/content-intelligence/quality-reviews/ag74o-r2-selector-calculation-correction.json",
  review
);
writeJson(
  "data/content-intelligence/quality-registry/ag74o-r2-ag74o-r3-calendar-activation-readiness-record.json",
  readiness
);
writeJson(
  "data/content-intelligence/mutation-plans/ag74o-r2-to-ag74o-r3-calendar-activation-boundary.json",
  nextBoundary
);
writeJson(
  "data/quality/ag74o-r2-selector-calculation-correction.json",
  quality
);

const doc = `# AG74O-R2 Selector and Calculation Correction

## Status

AG74O-R2 is complete as an approval-aware correction stage.

## Corrected behaviour

- Varanasi / Banaras and today remain the landing UI state.
- Page boot does not calculate a Panchang result.
- The named-place/search control remains active, but it exposes no approved result records at the current zero-approval baseline.
- The current approved projection contains zero records; the Varanasi option is a landing UI-state placeholder, not an approved selector result.
- Unknown named places return governed-unavailable.
- Valid coordinates with a validated IANA timezone return calculation-pending until explicitly approved.
- Invalid coordinates or timezone values return invalid-input without substitution.
- The local astronomy engine remains available behind the approval gate.
- Location, coordinate, timezone and approval provenance are displayed separately.

## Preserved blocks

Public selection, Panchang computation, automatic canonical merging, automatic ambiguous-alias resolution, runtime external APIs, Supabase and input persistence remain disabled.

## Annual book

The four-page Varanasi annual reference book remains available independently of daily calculation approval.

## Next stage

AG74O-R3 may plan governed calendar activation. It is ready for planning but is not automatically started.
`;
writeText(
  "docs/quality/AG74O_R2_SELECTOR_CALCULATION_CORRECTION.md",
  doc
);

const packagePath = full("package.json");
const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const scripts = packageJson.scripts || (packageJson.scripts = {});
if (
  scripts["generate:ag74o-r2"] &&
  scripts["generate:ag74o-r2"] !==
    "node scripts/generate-ag74o-r2-selector-calculation-correction.mjs"
) {
  throw new Error("generate:ag74o-r2 package-script collision.");
}
if (
  scripts["validate:ag74o-r2"] &&
  scripts["validate:ag74o-r2"] !==
    "node scripts/validate-ag74o-r2-selector-calculation-correction.mjs"
) {
  throw new Error("validate:ag74o-r2 package-script collision.");
}
scripts["generate:ag74o-r2"] =
  "node scripts/generate-ag74o-r2-selector-calculation-correction.mjs";
scripts["validate:ag74o-r2"] =
  "node scripts/validate-ag74o-r2-selector-calculation-correction.mjs";
if (!scripts["validate:project"]?.includes("npm run validate:ag74o-r2")) {
  scripts["validate:project"] =
    `${scripts["validate:project"] || ""} && npm run validate:ag74o-r2`;
}
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + "\n");

console.log("✅ AG74O-R2 selector/calculation correction generated.");
console.log("✅ Browser-approved location records: 0");
console.log("✅ Default Varanasi/today calculation removed.");
console.log("✅ Governed unavailable and calculation-pending states activated.");
console.log("✅ Public selection and Panchang computation approvals remain zero.");
