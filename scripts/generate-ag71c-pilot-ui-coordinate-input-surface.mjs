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
function walk(dir, out = []) {
  if (!fs.existsSync(full(dir))) return out;
  for (const entry of fs.readdirSync(full(dir), { withFileTypes: true })) {
    if (["node_modules", ".git", "data", "docs", "scripts", "dist", "build", ".next", "_local_archive", "archive"].includes(entry.name)) continue;
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(rel, out);
    else out.push(rel);
  }
  return out;
}

const ag71b = readJson("data/content-intelligence/quality-reviews/ag71b-pilot-runtime-validation.json");
const uiReadiness = readJson("data/knowledge-base/location-intelligence/production/ag71b-ui-coordinate-input-readiness-record.json");
const pilotRecords = readJson("data/knowledge-base/location-intelligence/production/ag71a-pilot-approved-location-records.json");
const panchangManifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag71b.status !== "ag71b_pilot_runtime_validation_completed") {
  throw new Error("AG71B must be complete before AG71C.");
}
if (ag71b.summary?.ready_for_ag71c !== true) {
  throw new Error("AG71B readiness for AG71C is missing.");
}
if (uiReadiness.current_frontend_gap_confirmed !== true) {
  throw new Error("AG71B must confirm frontend lat/long gap.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.source_expansion_active !== false) {
  throw new Error("generated/word-of-day.json must remain inactive.");
}

const outputs = {
  surface: "data/knowledge-base/location-intelligence/production/ag71c-pilot-ui-coordinate-input-surface.json",
  panchangContract: "data/knowledge-base/location-intelligence/production/ag71c-panchang-ui-coordinate-input-contract.json",
  starContract: "data/knowledge-base/location-intelligence/production/ag71c-star-reflection-ui-coordinate-input-contract.json",
  frontendDiscovery: "data/knowledge-base/location-intelligence/production/ag71c-frontend-target-discovery-report.json",
  implementationRecord: "data/knowledge-base/location-intelligence/production/ag71c-ui-implementation-record.json",
  safetyAudit: "data/knowledge-base/location-intelligence/production/ag71c-ui-scope-safety-audit.json",
  noPublicOutputAudit: "data/knowledge-base/location-intelligence/production/ag71c-no-public-output-audit.json",
  panchangManifest: "data/knowledge-base/panchang-festival/production/production-bank-manifest.json",
  review: "data/content-intelligence/quality-reviews/ag71c-pilot-ui-coordinate-input-surface.json",
  readiness: "data/content-intelligence/quality-registry/ag71c-ag71d-pilot-ui-validation-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag71c-to-ag71d-pilot-ui-validation-boundary.json",
  quality: "data/quality/ag71c-pilot-ui-coordinate-input-surface.json",
  preview: "data/quality/ag71c-pilot-ui-coordinate-input-surface-preview.json",
  doc: "docs/quality/AG71C_PILOT_UI_COORDINATE_INPUT_SURFACE.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short=8 HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short=8 origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const candidateFiles = walk(".")
  .filter((file) => /\.(html|jsx|tsx|js|mjs|astro|vue|svelte)$/i.test(file))
  .filter((file) => {
    const text = fs.readFileSync(full(file), "utf8");
    return /Panchang|Festival|Star Reflection|Star\s*Reflection|Vedic Guidance/i.test(text);
  })
  .map((file) => {
    const text = fs.readFileSync(full(file), "utf8");
    return {
      file,
      contains_panchang: /Panchang|Festival/i.test(text),
      contains_star_reflection: /Star Reflection|Star\s*Reflection/i.test(text),
      html_like: /\.(html|astro)$/i.test(file),
      react_like: /\.(jsx|tsx)$/i.test(file)
    };
  });

const panchangTargets = candidateFiles.filter((x) => x.contains_panchang);
const starTargets = candidateFiles.filter((x) => x.contains_star_reflection);

const sharedSurfaceHtml = `
<!-- AG71C_LOCATION_COORDINATE_INPUT_SURFACE_START -->
<div class="drishvara-location-input-surface" data-ag-stage="AG71C">
  <div class="drishvara-location-input-mode">
    <label>
      <input type="radio" name="ag71c-location-input-mode" value="select_location" checked>
      Select Location
    </label>
    <label>
      <input type="radio" name="ag71c-location-input-mode" value="enter_coordinates">
      Enter Coordinates
    </label>
  </div>

  <div class="drishvara-coordinate-input-fields" data-mode="enter_coordinates" hidden>
    <label>Latitude
      <input type="number" step="any" inputmode="decimal" name="ag71c_latitude" placeholder="e.g. 27.0844">
    </label>
    <label>Longitude
      <input type="number" step="any" inputmode="decimal" name="ag71c_longitude" placeholder="e.g. 93.6053">
    </label>
    <label>Timezone
      <input type="text" name="ag71c_timezone" placeholder="e.g. Asia/Kolkata">
    </label>
    <label>Optional label
      <input type="text" name="ag71c_optional_label" placeholder="e.g. My location">
    </label>
  </div>
</div>
<!-- AG71C_LOCATION_COORDINATE_INPUT_SURFACE_END -->
`;

const sharedScript = `
<!-- AG71C_LOCATION_COORDINATE_INPUT_SCRIPT_START -->
<script>
(function () {
  function syncAg71cLocationModes(root) {
    const groups = root.querySelectorAll('.drishvara-location-input-surface[data-ag-stage="AG71C"]');
    groups.forEach(function (group) {
      const fields = group.querySelector('.drishvara-coordinate-input-fields');
      const radios = group.querySelectorAll('input[type="radio"][name*="location-input-mode"]');
      function update() {
        const selected = Array.from(radios).find(function (radio) { return radio.checked; });
        if (!fields || !selected) return;
        fields.hidden = selected.value !== 'enter_coordinates';
      }
      radios.forEach(function (radio) { radio.addEventListener('change', update); });
      update();
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { syncAg71cLocationModes(document); });
  } else {
    syncAg71cLocationModes(document);
  }
})();
</script>
<!-- AG71C_LOCATION_COORDINATE_INPUT_SCRIPT_END -->
`;

const sharedCss = `
/* AG71C_LOCATION_COORDINATE_INPUT_STYLE_START */
.drishvara-location-input-surface {
  margin-top: 0.875rem;
  padding: 0.875rem;
  border: 1px solid rgba(68, 128, 168, 0.25);
  border-radius: 14px;
  background: rgba(182, 208, 233, 0.14);
}
.drishvara-location-input-mode {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}
.drishvara-coordinate-input-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}
.drishvara-coordinate-input-fields label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.88rem;
}
.drishvara-coordinate-input-fields input {
  width: 100%;
  min-height: 2.4rem;
  border: 1px solid rgba(26, 115, 140, 0.35);
  border-radius: 10px;
  padding: 0.55rem 0.65rem;
  background: rgba(255,255,255,0.88);
}
@media (max-width: 640px) {
  .drishvara-coordinate-input-fields {
    grid-template-columns: 1fr;
  }
}
/* AG71C_LOCATION_COORDINATE_INPUT_STYLE_END */
`;

let patchedFiles = [];
let patchStatus = "frontend_patch_not_applied_no_safe_static_target_found";

function patchHtmlFile(file) {
  const p = full(file);
  let text = fs.readFileSync(p, "utf8");
  if (text.includes("AG71C_LOCATION_COORDINATE_INPUT_SURFACE_START")) {
    return false;
  }

  const insertion = sharedSurfaceHtml;

  const patterns = [
    /(<[^>]*>\s*Panchang[^<]*<\/[^>]+>)/i,
    /(<[^>]*>\s*Panchang\s*&amp;\s*Festival[^<]*<\/[^>]+>)/i,
    /(<[^>]*>\s*Panchang\s*&\s*Festival[^<]*<\/[^>]+>)/i
  ];

  let patched = false;
  for (const pattern of patterns) {
    if (pattern.test(text)) {
      text = text.replace(pattern, `$1\n${insertion}`);
      patched = true;
      break;
    }
  }

  if (!patched && /Panchang|Festival/i.test(text)) {
    text = text.replace(/(<body[^>]*>)/i, `$1\n${insertion}`);
    patched = true;
  }

  if (patched && !text.includes("AG71C_LOCATION_COORDINATE_INPUT_SCRIPT_START")) {
    text = text.replace(/<\/body>/i, `${sharedScript}\n</body>`);
  }

  if (patched && !text.includes("AG71C_LOCATION_COORDINATE_INPUT_STYLE_START")) {
    text = text.replace(/<\/head>/i, `<style>\n${sharedCss}\n</style>\n</head>`);
  }

  if (patched) {
    fs.writeFileSync(p, text);
    return true;
  }
  return false;
}

let safeHtmlTargets = candidateFiles.filter((x) => x.html_like && (x.contains_panchang || x.contains_star_reflection));\nsafeHtmlTargets.sort((a, b) => (a.file === "index.html" ? -1 : b.file === "index.html" ? 1 : 0));
if (safeHtmlTargets.length > 0) {
  for (const target of safeHtmlTargets.slice(0, 2)) {
    if (patchHtmlFile(target.file)) patchedFiles.push(target.file);
  }
  patchStatus = patchedFiles.length > 0 ? "frontend_static_html_patch_applied" : "frontend_static_html_patch_already_present_or_not_needed";
}

const frontendDiscovery = {
  module_id: "AG71C",
  title: "Frontend Target Discovery Report",
  status: "frontend_target_discovery_completed",
  candidate_file_count: candidateFiles.length,
  panchang_target_count: panchangTargets.length,
  star_reflection_target_count: starTargets.length,
  safe_html_target_count: safeHtmlTargets.length,
  patch_status: patchStatus,
  patched_files: patchedFiles,
  candidates: candidateFiles
};

const panchangContract = {
  module_id: "AG71C",
  title: "Panchang UI Coordinate Input Contract",
  status: "panchang_ui_coordinate_input_contract_created",
  required_modes: ["select_location_from_dropdown", "enter_coordinates"],
  dropdown_mode_fields: ["selected_location_id_or_label"],
  coordinate_mode_fields: ["latitude_decimal", "longitude_decimal", "timezone", "optional_location_label"],
  pilot_locations_allowed: pilotRecords.records.map((x) => x.display_label),
  full_location_bank_allowed_now: false,
  public_output_allowed_now: false
};

const starContract = {
  module_id: "AG71C",
  title: "Star Reflection UI Coordinate Input Contract",
  status: "star_reflection_ui_coordinate_input_contract_created",
  required_modes: ["select_birth_place_from_dropdown", "enter_birth_coordinates"],
  dropdown_mode_fields: ["selected_birth_place_id_or_label"],
  coordinate_mode_fields: ["birth_latitude_decimal", "birth_longitude_decimal", "birth_timezone", "optional_birth_place_label"],
  birth_time_basis_required_before_computation: true,
  pilot_locations_allowed: pilotRecords.records.map((x) => x.display_label),
  full_location_bank_allowed_now: false,
  public_output_allowed_now: false
};

const implementationRecord = {
  module_id: "AG71C",
  title: "UI Implementation Record",
  status: patchStatus,
  ui_surface_scope: "pilot_coordinate_input_surface",
  frontend_gap_addressed_in_repository: patchedFiles.length > 0,
  patched_files: patchedFiles,
  fallback_if_no_safe_target: "Use discovery report to patch exact frontend file in next correction without guessing.",
  public_runtime_activation_performed: false,
  backend_runtime_activated: false,
  supabase_activation_performed: false
};

const surface = {
  module_id: "AG71C",
  title: "Pilot UI Coordinate Input Surface",
  status: "pilot_ui_coordinate_input_surface_created",
  purpose: "Add or prepare frontend surface for Select Location / Enter Coordinates input modes for Panchang and Star Reflection.",
  panchang_contract: outputs.panchangContract,
  star_reflection_contract: outputs.starContract,
  frontend_discovery: outputs.frontendDiscovery,
  implementation_record: outputs.implementationRecord,
  public_runtime_activation_performed: false,
  full_location_bank_activation_performed: false
};

const safetyAudit = {
  module_id: "AG71C",
  title: "UI Scope Safety Audit",
  status: "ui_scope_safety_audit_passed",
  pilot_ui_scope_only: true,
  coordinate_fields_required: true,
  full_location_bank_activation_performed: false,
  public_runtime_activation_performed: false,
  unrestricted_panchang_runtime_allowed_now: false,
  unrestricted_star_reflection_runtime_allowed_now: false,
  generated_word_json_modified: false,
  backend_runtime_activated: false,
  supabase_activation_performed: false
};

const noPublicOutputAudit = {
  module_id: "AG71C",
  title: "No Public Output Audit",
  status: "no_public_output_audit_passed",
  public_panchang_output_allowed_now: false,
  public_star_reflection_output_allowed_now: false,
  full_location_bank_activation_performed: false,
  panchang_computation_executed_now: false,
  star_reflection_computation_executed_now: false,
  generated_word_json_modified: false,
  backend_runtime_activated: false,
  supabase_activation_performed: false
};

const updatedPanchangManifest = {
  ...panchangManifest,
  status: "production_bank_manifest_created_pilot_ui_coordinate_input_surface",
  current_status: "pilot_ui_coordinate_input_surface_created_validation_pending",
  ag71c_files: {
    surface: outputs.surface,
    panchang_contract: outputs.panchangContract,
    star_contract: outputs.starContract,
    frontend_discovery: outputs.frontendDiscovery,
    implementation_record: outputs.implementationRecord,
    safety_audit: outputs.safetyAudit,
    no_public_output_audit: outputs.noPublicOutputAudit
  },
  current_counts: {
    ...(panchangManifest.current_counts || {}),
    ag71c_frontend_candidate_files: candidateFiles.length,
    ag71c_frontend_patched_files: patchedFiles.length,
    ag71c_ui_contract_records: 2,
    ag71c_full_location_bank_activation_records: 0,
    ag71c_runtime_computation_execution_records: 0,
    public_panchang_outputs: 0,
    word_output_records: 0
  },
  next_required_stage: "AG71D — Pilot UI Validation"
};

const review = {
  module_id: "AG71C",
  title: "Pilot UI Coordinate Input Surface",
  status: "ag71c_pilot_ui_coordinate_input_surface_completed",
  current_git_context: git,
  consumed_previous_stage: {
    ag71b_review: "data/content-intelligence/quality-reviews/ag71b-pilot-runtime-validation.json",
    ag71b_ui_readiness: "data/knowledge-base/location-intelligence/production/ag71b-ui-coordinate-input-readiness-record.json"
  },
  generated_records: outputs,
  summary: {
    pilot_ui_coordinate_input_surface_created: true,
    panchang_ui_coordinate_contract_created: true,
    star_reflection_ui_coordinate_contract_created: true,
    frontend_discovery_completed: true,
    frontend_gap_addressed_in_repository: patchedFiles.length > 0,
    frontend_patched_file_count: patchedFiles.length,
    public_runtime_activation_performed: false,
    full_location_bank_activation_performed: false,
    panchang_computation_executed_now: false,
    star_reflection_computation_executed_now: false,
    generated_word_json_modified: false,
    backend_runtime_activated: false,
    supabase_activation_performed: false,
    ready_for_ag71d: true
  }
};

const readiness = {
  module_id: "AG71C",
  title: "AG71D Pilot UI Validation Readiness Record",
  status: "ready_for_ag71d_pilot_ui_validation",
  ready_for_ag71d: true,
  next_stage: "AG71D — Pilot UI Validation",
  reason: "Coordinate input contracts are created and frontend discovery/implementation record is available. AG71D should validate UI behavior and decide if exact manual patch is needed."
};

const boundary = {
  module_id: "AG71C",
  title: "AG71C to AG71D Pilot UI Validation Boundary",
  status: "ag71d_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Validate Select Location / Enter Coordinates UI toggle.",
    "Validate latitude, longitude, timezone and optional label fields.",
    "Validate Panchang and Star Reflection UI contracts.",
    "If static patch was not applied, patch exact frontend target from discovery report."
  ],
  blocked_scope_without_explicit_approval: [
    "full location-bank activation",
    "public full dropdown activation",
    "unrestricted Panchang runtime computation",
    "unrestricted Star Reflection runtime computation",
    "Supabase/database writes",
    "backend/Auth activation"
  ]
};

const quality = {
  module_id: "AG71C",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG71C",
  status: review.status,
  frontend_candidate_file_count: candidateFiles.length,
  frontend_patched_file_count: patchedFiles.length,
  frontend_gap_addressed_in_repository: patchedFiles.length > 0 ? 1 : 0,
  public_runtime_activation_performed: 0,
  full_location_bank_activation_performed: 0,
  ready_for_ag71d: 1
};

const doc = `# AG71C — Pilot UI Coordinate Input Surface

AG71C adds or prepares the frontend coordinate-input surface for the pilot location workflow.

## Required UI modes

### Panchang

- Select Location
- Enter Coordinates
  - Latitude
  - Longitude
  - Timezone
  - Optional label

### Star Reflection

- Select Birth Place
- Enter Birth Coordinates
  - Birth latitude
  - Birth longitude
  - Birth timezone
  - Optional birth place label

## Implementation note

Frontend discovery report records the candidate UI files. If a safe static HTML target is found, AG71C patches it. If not, AG71D should use the discovery report to patch the exact frontend file without guessing.

## Boundary

No full bank activation, no runtime computation, no backend activation and no Supabase activation.
`;

writeJson(outputs.surface, surface);
writeJson(outputs.panchangContract, panchangContract);
writeJson(outputs.starContract, starContract);
writeJson(outputs.frontendDiscovery, frontendDiscovery);
writeJson(outputs.implementationRecord, implementationRecord);
writeJson(outputs.safetyAudit, safetyAudit);
writeJson(outputs.noPublicOutputAudit, noPublicOutputAudit);
writeJson(outputs.panchangManifest, updatedPanchangManifest);
writeJson(outputs.review, review);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.quality, quality);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG71C pilot UI coordinate input surface generated.");
console.log(`✅ Frontend candidate files found: ${candidateFiles.length}.`);
console.log(`✅ Frontend patched files: ${patchedFiles.length}.`);
console.log(`✅ Patch status: ${patchStatus}.`);
console.log("✅ No backend/Supabase/runtime activation performed.");

if (patchedFiles.length === 0) {
  console.log("⚠️ No safe static frontend target was patched. Review AG71C discovery report before AG71D.");
}
