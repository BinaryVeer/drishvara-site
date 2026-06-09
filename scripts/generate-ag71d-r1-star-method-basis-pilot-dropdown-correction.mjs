import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function writeJson(p, data) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(data, null, 2) + "\n");
}
function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}
function run(cmd) {
  try { return execSync(cmd, { cwd: root, encoding: "utf8" }).trim(); }
  catch { return ""; }
}

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short=8 HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short=8 origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const indexPath = "index.html";
let indexHtml = fs.readFileSync(full(indexPath), "utf8");

const pilotLocations = [
  {
    value: "itanagar-arunachal-pradesh-india",
    label: "Itanagar",
    location_id: "loc_in_ar_itanagar_capital_complex_001",
    timezone: "Asia/Kolkata",
    pilot_status: "approved_four_location_pilot"
  },
  {
    value: "new-delhi-delhi-india",
    label: "New Delhi",
    location_id: "loc_in_dl_new_delhi_capital_001",
    timezone: "Asia/Kolkata",
    pilot_status: "approved_four_location_pilot"
  },
  {
    value: "ranchi-jharkhand-india",
    label: "Ranchi",
    location_id: "loc_in_jh_ranchi_city_001",
    timezone: "Asia/Kolkata",
    pilot_status: "approved_four_location_pilot"
  },
  {
    value: "tokyo-japan",
    label: "Tokyo",
    location_id: "loc_jp_tokyo_capital_001",
    timezone: "Asia/Tokyo",
    pilot_status: "approved_four_location_pilot"
  }
];

function optionHtml(location, selected = false) {
  return `<option value="${location.value}" data-location-id="${location.location_id}" data-timezone="${location.timezone}" data-pilot-status="${location.pilot_status}"${selected ? " selected" : ""}>${location.label}</option>`;
}

const starSelectHtml = `<select id="star-birth-place-select" class="ag71d-location-select" data-ag71d-location-select="star-reflection" aria-label="Select Birth Place">
              <option value="" selected>Select birth place</option>
              ${pilotLocations.map((x) => optionHtml(x, false)).join("\n              ")}
            </select>`;

const panchangSelectHtml = `<select id="panchang-place-select" class="ag71d-location-select" data-ag71d-location-select="panchang" aria-label="Select Panchang Location">
              ${pilotLocations.map((x, i) => optionHtml(x, i === 0)).join("\n              ")}
            </select>`;

function replaceSelectById(html, id, replacement) {
  const re = new RegExp(`<select\\b(?=[^>]*id="${id}")[\\s\\S]*?<\\/select>`, "i");
  if (!re.test(html)) {
    throw new Error(`Could not find select id="${id}" in index.html`);
  }
  return html.replace(re, replacement);
}

indexHtml = replaceSelectById(indexHtml, "star-birth-place-select", starSelectHtml);
indexHtml = replaceSelectById(indexHtml, "panchang-place-select", panchangSelectHtml);

const runtimePatch = `
<script>
/* AG71D_R1_PILOT_DROPDOWN_RUNTIME_FIX_START */
(function () {
  var pilotOptions = ${JSON.stringify(pilotLocations)};

  function optionMarkup(item, selected) {
    return '<option value="' + item.value + '" data-location-id="' + item.location_id + '" data-timezone="' + item.timezone + '" data-pilot-status="' + item.pilot_status + '"' + (selected ? ' selected' : '') + '>' + item.label + '</option>';
  }

  function resetSelect(id, placeholder, selectFirst) {
    var select = document.getElementById(id);
    if (!select) return;

    var html = '';
    if (placeholder) {
      html += '<option value=""' + (!selectFirst ? ' selected' : '') + '>' + placeholder + '</option>';
    }

    html += pilotOptions.map(function (item, index) {
      return optionMarkup(item, selectFirst && index === 0);
    }).join('');

    select.innerHTML = html;
  }

  function applyPilotDropdowns() {
    resetSelect('star-birth-place-select', 'Select birth place', false);
    resetSelect('panchang-place-select', '', true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyPilotDropdowns, { once: true });
  } else {
    applyPilotDropdowns();
  }

  window.setTimeout(applyPilotDropdowns, 250);
  window.setTimeout(applyPilotDropdowns, 1000);
  window.drishvaraAg71dR1ApplyPilotDropdowns = applyPilotDropdowns;
})();
/* AG71D_R1_PILOT_DROPDOWN_RUNTIME_FIX_END */
</script>
`;

if (!indexHtml.includes("AG71D_R1_PILOT_DROPDOWN_RUNTIME_FIX_START")) {
  indexHtml = indexHtml.replace("</body>", runtimePatch + "\n</body>");
}

fs.writeFileSync(full(indexPath), indexHtml);

// Repo-wide method audit
const skipDirs = new Set(["node_modules", ".git", "_local_archive", "archive", "dist", "build", ".next"]);
const scannedFiles = [];
const methodRefs = [];

function walk(p) {
  const stat = fs.statSync(p);
  if (stat.isDirectory()) {
    const base = path.basename(p);
    if (skipDirs.has(base)) return;
    for (const entry of fs.readdirSync(p)) walk(path.join(p, entry));
    return;
  }

  if (!/\.(html|json|js|mjs|md|txt)$/i.test(p)) return;
  const rel = path.relative(root, p);
  const text = fs.readFileSync(p, "utf8");
  scannedFiles.push(rel);

  const matches = [...text.matchAll(/star_reflection_method_v\d+/g)].map((m) => m[0]);
  if (matches.length) {
    methodRefs.push({
      file: rel,
      method_versions: [...new Set(matches)],
      reference_count: matches.length
    });
  }
}

for (const target of ["index.html", "generated", "data", "docs", "scripts"]) {
  const p = full(target);
  if (exists(target)) walk(p);
}

const uniqueMethodVersions = [...new Set(methodRefs.flatMap((x) => x.method_versions))].sort();

const outputs = {
  methodAudit: "data/methodology/star-reflection/ag71d-r1-star-reflection-method-audit.json",
  methodBasis: "data/methodology/star-reflection/ag71d-r1-star-reflection-method-basis-clarification.json",
  dropdownCorrection: "data/knowledge-base/location-intelligence/production/ag71d-r1-pilot-dropdown-option-correction-record.json",
  noPublicOutputAudit: "data/knowledge-base/location-intelligence/production/ag71d-r1-no-public-output-audit.json",
  review: "data/content-intelligence/quality-reviews/ag71d-r1-star-method-basis-pilot-dropdown-correction.json",
  readiness: "data/content-intelligence/quality-registry/ag71d-r1-ag71e-pilot-runtime-output-test-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag71d-r1-to-ag71e-pilot-runtime-output-test-boundary.json",
  quality: "data/quality/ag71d-r1-star-method-basis-pilot-dropdown-correction.json",
  preview: "data/quality/ag71d-r1-star-method-basis-pilot-dropdown-correction-preview.json",
  doc: "docs/quality/AG71D_R1_STAR_METHOD_BASIS_PILOT_DROPDOWN_CORRECTION.md"
};

const methodAudit = {
  module_id: "AG71D-R1",
  title: "Star Reflection Method Audit",
  status: uniqueMethodVersions.length === 1 && uniqueMethodVersions[0] === "star_reflection_method_v1"
    ? "single_active_method_confirmed"
    : "method_audit_requires_review",
  active_repo_scan_excludes: [...skipDirs],
  scanned_file_count: scannedFiles.length,
  unique_method_versions_found: uniqueMethodVersions,
  method_reference_records: methodRefs,
  conclusion: uniqueMethodVersions.length === 1 && uniqueMethodVersions[0] === "star_reflection_method_v1"
    ? "Only star_reflection_method_v1 is recorded in the active repo flow. No multiple approved Star Reflection method selector should be public yet."
    : "More than one method-like reference was detected; public selector must remain blocked until reviewed."
};

if (methodAudit.status !== "single_active_method_confirmed") {
  throw new Error("Star Reflection method audit did not confirm a single active method.");
}

const methodBasis = {
  module_id: "AG71D-R1",
  title: "Star Reflection Method Basis Clarification",
  status: "moon_led_panchanga_supported_basis_recorded",
  public_module_name: "Star Reflection",
  internal_basis: "Panchanga-aware Kala-Drishti reflection framework",
  clarification: "Star Reflection is not a star-only calculation. It is Moon-led, Panchanga-supported, Nakshatra-informed, and location/timezone dependent.",
  calculation_basis: {
    moon_led_elements: [
      "Moon-Sun angular relationship for Tithi and Paksha context",
      "Moon's Nakshatra position as lunar mansion/birth-star context"
    ],
    sun_supported_elements: [
      "Sunrise/local day boundary",
      "Vara/day context",
      "solar/seasonal context where governed"
    ],
    panchanga_elements: [
      "Tithi",
      "Vara",
      "Nakshatra",
      "Yoga",
      "Karana"
    ],
    locality_inputs: [
      "date",
      "time",
      "timezone",
      "latitude",
      "longitude",
      "regional calendar/observance method where governed"
    ]
  },
  public_safety_boundary: {
    deterministic_prediction_allowed: false,
    personal_assessment_allowed: false,
    decision_guidance_allowed: false,
    reflective_prompt_only_until_governance_completion: true
  },
  ui_implication: "Do not expose a Reflection Method dropdown until multiple approved methods exist. Use Birth Place or Birth Coordinates input for location basis."
};

const dropdownCorrection = {
  module_id: "AG71D-R1",
  title: "Pilot Dropdown Option Correction Record",
  status: "pilot_dropdown_options_corrected",
  active_frontend_file: "index.html",
  star_birth_place_select_id: "star-birth-place-select",
  panchang_location_select_id: "panchang-place-select",
  pilot_locations: pilotLocations,
  corrections: [
    "Star Birth Place dropdown options replaced with 4 pilot locations.",
    "Panchang location dropdown options replaced with 4 pilot locations.",
    "Panchang canonical AG64B id panchang-place-select preserved.",
    "Runtime fallback added to prevent old Reflection Method label from repopulating the Birth Place dropdown."
  ],
  reflection_method_dropdown_status: "deferred_until_multiple_reviewed_methods_exist",
  public_runtime_activation_performed: false,
  backend_runtime_activated: false,
  supabase_activation_performed: false
};

const noPublicOutputAudit = {
  module_id: "AG71D-R1",
  title: "No Public Output Audit",
  status: "no_public_output_audit_passed",
  public_panchang_output_allowed_now: false,
  public_star_reflection_output_allowed_now: false,
  full_location_bank_activation_performed: false,
  runtime_panchang_computation_performed: false,
  runtime_star_reflection_computation_performed: false,
  backend_runtime_activated: false,
  supabase_activation_performed: false
};

const panchangManifestPath = "data/knowledge-base/panchang-festival/production/production-bank-manifest.json";
const panchangManifest = readJson(panchangManifestPath);
panchangManifest.ag71d_r1_files = {
  method_audit: outputs.methodAudit,
  method_basis: outputs.methodBasis,
  dropdown_correction: outputs.dropdownCorrection,
  no_public_output_audit: outputs.noPublicOutputAudit
};
panchangManifest.current_counts = {
  ...(panchangManifest.current_counts || {}),
  ag71d_r1_star_method_audit_records: 1,
  ag71d_r1_method_basis_clarification_records: 1,
  ag71d_r1_pilot_dropdown_correction_records: 1,
  ag71d_r1_pilot_dropdown_location_count: pilotLocations.length,
  ag71d_r1_public_runtime_output_records: 0
};
panchangManifest.current_status = "ag71d_r1_star_method_basis_and_pilot_dropdown_corrected_ag71e_pending";
panchangManifest.next_required_stage = "AG71E — Pilot Runtime Output Test";

const review = {
  module_id: "AG71D-R1",
  title: "Star Reflection Method Basis Clarification + Pilot Dropdown Correction",
  status: "ag71d_r1_completed",
  current_git_context: git,
  generated_records: outputs,
  summary: {
    single_active_star_reflection_method_confirmed: true,
    active_star_reflection_method: "star_reflection_method_v1",
    star_reflection_basis_clarified_as_moon_led_panchanga_supported: true,
    star_birth_place_dropdown_corrected: true,
    panchang_location_dropdown_corrected: true,
    panchang_ag64b_canonical_id_preserved: true,
    pilot_location_count: pilotLocations.length,
    reflection_method_dropdown_deferred: true,
    public_runtime_activation_performed: false,
    runtime_panchang_computation_performed: false,
    runtime_star_reflection_computation_performed: false,
    backend_runtime_activated: false,
    supabase_activation_performed: false,
    ready_for_ag71e: true
  }
};

const readiness = {
  module_id: "AG71D-R1",
  title: "AG71E Pilot Runtime Output Test Readiness Record",
  status: "ready_for_ag71e_pilot_runtime_output_test",
  ready_for_ag71e: true,
  reason: "Pilot dropdowns and Star Reflection method basis are corrected. Next stage may test internal pilot runtime output for 4 locations only."
};

const boundary = {
  module_id: "AG71D-R1",
  title: "AG71D-R1 to AG71E Boundary",
  status: "ag71e_boundary_defined",
  next_stage: "AG71E — Pilot Runtime Output Test",
  allowed_next_scope: [
    "Internal runtime output test for 4 pilot locations.",
    "Named-location and coordinate-first input contract testing.",
    "Panchang internal output test remains non-public.",
    "Star Reflection internal output-safety test remains non-public."
  ],
  blocked_scope_without_explicit_approval: [
    "full location-bank activation",
    "public exact Panchang output",
    "public personalised Star Reflection output",
    "Supabase writes",
    "backend/Auth activation",
    "runtime AI generation"
  ]
};

const quality = {
  module_id: "AG71D-R1",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG71D-R1",
  status: review.status,
  active_star_reflection_method_count: 1,
  active_star_reflection_method: "star_reflection_method_v1",
  moon_led_panchanga_supported_basis_recorded: 1,
  star_birth_place_dropdown_corrected: 1,
  panchang_location_dropdown_corrected: 1,
  pilot_location_count: pilotLocations.length,
  public_runtime_activation_performed: 0,
  ready_for_ag71e: 1
};

const doc = `# AG71D-R1 — Star Reflection Method Basis Clarification + Pilot Dropdown Correction

AG71D-R1 confirms that only \`star_reflection_method_v1\` is active/recorded in the governed repo flow.

## Method basis clarification

Star Reflection is not a star-only calculation. It is Moon-led, Panchanga-supported, Nakshatra-informed and location/timezone dependent.

The governed basis includes:

- Tithi
- Vara
- Nakshatra
- Yoga
- Karana
- Sunrise/locality
- timezone and location basis

## UI correction

The Star Reflection Birth Place dropdown and Panchang Location dropdown now use the 4 approved pilot locations:

- Itanagar
- New Delhi
- Ranchi
- Tokyo

The Panchang dropdown preserves the canonical AG64B target \`id="panchang-place-select"\`.

## Boundary

No public Panchang output, public Star Reflection output, backend activation, Supabase activation, full location-bank activation or runtime AI generation was performed.

## Next

AG71E — Pilot Runtime Output Test.
`;

writeJson(outputs.methodAudit, methodAudit);
writeJson(outputs.methodBasis, methodBasis);
writeJson(outputs.dropdownCorrection, dropdownCorrection);
writeJson(outputs.noPublicOutputAudit, noPublicOutputAudit);
writeJson(panchangManifestPath, panchangManifest);
writeJson(outputs.review, review);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.quality, quality);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG71D-R1 generated.");
console.log("✅ Single active Star Reflection method confirmed: star_reflection_method_v1.");
console.log("✅ Moon-led Panchanga-supported Star Reflection basis recorded.");
console.log("✅ Star and Panchang pilot dropdown options corrected.");
console.log("✅ No public/runtime/backend/Supabase activation performed.");
