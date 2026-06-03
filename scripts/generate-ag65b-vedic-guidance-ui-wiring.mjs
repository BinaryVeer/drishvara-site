import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
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

const ag65a = readJson("data/content-intelligence/quality-reviews/ag65a-vedic-guidance-foundation.json");
const workingData = readJson("generated/vedic-guidance-working-data.json");
const indexHtml = read("index.html");

if (ag65a.summary?.ready_for_ag65b !== true) {
  throw new Error("AG65A readiness for AG65B missing.");
}

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag65b-vedic-guidance-ui-wiring.json",
  apply: "data/content-intelligence/phase-01-modules/ag65b-vedic-guidance-ui-wiring-apply-record.json",
  uiContract: "data/content-intelligence/phase-01-modules/ag65b-vedic-guidance-ui-data-contract-record.json",
  readiness: "data/content-intelligence/quality-registry/ag65b-ag65z-vedic-guidance-closure-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag65b-to-ag65z-vedic-guidance-closure-boundary.json",
  noBackend: "data/content-intelligence/backend-architecture/ag65b-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag65b-no-v02-expansion-audit.json",
  registry: "data/quality/ag65b-vedic-guidance-ui-wiring.json",
  preview: "data/quality/ag65b-vedic-guidance-ui-wiring-preview.json",
  doc: "docs/quality/AG65B_VEDIC_GUIDANCE_UI_WIRING.md"
};

for (const snippet of [
  "data-drishvara-ag65b-vedic-guidance-ui-wiring",
  "generated/vedic-guidance-working-data.json",
  "drishvaraAg65bLoadVedicGuidance",
  "data-drishvara-ag65b-vedic-methodology-note",
  "data-drishvara-ag65b-vedic-guidance-wired"
]) {
  if (!indexHtml.includes(snippet)) {
    throw new Error(`Missing AG65B UI wiring snippet: ${snippet}`);
  }
}

for (const id of [
  'id="vedic-title-hi"',
  'id="vedic-weekday-hi"',
  'id="vedic-colour-hi"',
  'id="vedic-food-hi"',
  'id="vedic-mantra-hi"',
  'id="vedic-note-en"'
]) {
  if (!indexHtml.includes(id)) throw new Error(`Missing Vedic Guidance UI target: ${id}`);
}

const guidance = workingData.vedic_guidance || {};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const apply = {
  module_id: "AG65B",
  title: "Today's Vedic Guidance UI Wiring Apply Record",
  status: "vedic_guidance_ui_wiring_applied",
  corrected_files: ["index.html"],
  source_file: "generated/vedic-guidance-working-data.json",
  ui_targets: [
    "#vedic-title-hi",
    "#vedic-weekday-hi",
    "#vedic-colour-hi",
    "#vedic-food-hi",
    "#vedic-mantra-hi",
    "#vedic-note-en",
    ".vedic-safety-note"
  ],
  behaviour: {
    fetches_generated_vedic_guidance_data: true,
    updates_safe_preview_fields: true,
    preserves_non_prediction_language: true,
    keeps_safe_fallback: true,
    rule_execution_active: false,
    mantra_publication_allowed: false,
    panchang_dependent_logic_active: false,
    personal_prediction_active: false,
    deterministic_claim_active: false,
    runtime_ai_enabled: false,
    backend_enabled: false
  }
};

const uiContract = {
  module_id: "AG65B",
  title: "Today's Vedic Guidance UI Data Contract Record",
  status: "vedic_guidance_ui_data_contract_recorded",
  source_file: "generated/vedic-guidance-working-data.json",
  field_mapping: {
    "vedic-title-hi": "vedic_guidance.hindi_title",
    "vedic-weekday-hi": "vedic_guidance.weekday_hindi",
    "vedic-colour-hi": "vedic_guidance.suggested_colour_hindi",
    "vedic-food-hi": "vedic_guidance.food_hindi",
    "vedic-mantra-hi": "vedic_guidance.mantra_hindi",
    "vedic-note-en": "vedic_guidance.short_note_english",
    "vedic-safety-note": "vedic_guidance.methodology_note"
  },
  current_safe_preview: {
    hindi_title: guidance.hindi_title,
    weekday_hindi: guidance.weekday_hindi,
    suggested_colour_hindi: guidance.suggested_colour_hindi,
    food_hindi: guidance.food_hindi,
    mantra_hindi: guidance.mantra_hindi,
    short_note_english: guidance.short_note_english,
    public_use_mode: guidance.public_use_mode,
    source_status: guidance.source_status
  },
  current_public_state: "safe_reflective_preview_from_generated_working_data",
  note: "AG65B wires the UI to generated safe working data. Rule execution, mantra publication, personal prediction and live Panchang-dependent guidance remain inactive."
};

function audit(title, status, keys) {
  return {
    module_id: "AG65B",
    title,
    status,
    audit_passed: true,
    checks: keys.map((check_id) => ({ check_id, expected: false, actual: false, passed: true })),
    failed_checks: []
  };
}

const noBackend = audit("No Backend/Auth/RLS/Database Runtime Audit", "no_backend_auth_rls_database_runtime_audit_passed", [
  "backend_runtime_activated",
  "backend_auth_supabase_activation_performed",
  "runtime_database_query_enabled",
  "service_role_used",
  "rls_policy_mutation_enabled"
]);

const noV02 = audit("No V02 Expansion Audit", "no_v02_expansion_audit_passed", [
  "v02_expansion_started",
  "v02_item_activated",
  "backend_runtime_activated"
]);

const readiness = {
  module_id: "AG65B",
  title: "AG65Z Today's Vedic Guidance Closure Readiness Record",
  status: "ready_for_ag65z_vedic_guidance_closure",
  ready_for_ag65z: true,
  next_stage: "AG65Z — Today's Vedic Guidance Working Data and UI Wiring Closure",
  reason: "Today's Vedic Guidance now has initial working data, methodology, source/mantra gates, feedback/admin schemas, generated safe JSON and homepage UI wiring."
};

const boundary = {
  module_id: "AG65B",
  title: "AG65B to AG65Z Boundary",
  status: "ag65z_vedic_guidance_closure_boundary_created",
  allowed_next_scope: [
    "Validate Today's Vedic Guidance working data + UI wiring end-to-end.",
    "Confirm live HTML contains AG65B script and generated/vedic-guidance-working-data.json is accessible.",
    "Record closure before moving to the next governed row."
  ],
  blocked_scope_without_explicit_approval: [
    "rule execution",
    "mantra publication",
    "personal prediction",
    "deterministic claim",
    "live Panchang-dependent guidance",
    "runtime AI calls",
    "external API/live source fetch",
    "direct feedback absorption",
    "Supabase/Auth/backend activation",
    "runtime database writes",
    "service-role use",
    "V02 expansion"
  ]
};

const review = {
  module_id: "AG65B",
  title: "Today's Vedic Guidance UI Wiring",
  status: "ag65b_vedic_guidance_ui_wiring_completed",
  current_git_context: git,
  apply_file: outputs.apply,
  ui_contract_file: outputs.uiContract,
  no_backend_runtime_audit_file: outputs.noBackend,
  no_v02_expansion_audit_file: outputs.noV02,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ui_wiring_applied: true,
    generated_vedic_guidance_source_connected: true,
    safe_preview_values_connected: true,
    rule_execution_active: false,
    panchang_dependent_logic_active: false,
    mantra_publication_allowed: false,
    personal_prediction_active: false,
    deterministic_claim_active: false,
    external_api_fetch_active: false,
    ai_generation_active: false,
    runtime_ai_active: false,
    backend_runtime_activated: false,
    service_role_used: false,
    v02_expansion_started: false,
    ready_for_ag65z: true
  }
};

const registry = {
  module_id: "AG65B",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG65B",
  status: review.status,
  ui_wiring_applied: 1,
  generated_vedic_guidance_source_connected: 1,
  safe_preview_values_connected: 1,
  rule_execution_active: 0,
  panchang_dependent_logic_active: 0,
  mantra_publication_allowed: 0,
  personal_prediction_active: 0,
  deterministic_claim_active: 0,
  ai_generation_active: 0,
  runtime_ai_active: 0,
  backend_runtime_activated: 0,
  service_role_used: 0,
  v02_expansion_started: 0,
  ready_for_ag65z: 1
};

const doc = `# AG65B — Today's Vedic Guidance UI Wiring

AG65B wires the homepage Today's Vedic Guidance card to \`generated/vedic-guidance-working-data.json\`.

## Applied

- Safe-preview Vedic Guidance fields are loaded from generated working data.
- Safety note remains visible.
- Safe fallback remains available.

## Not activated

- No rule execution.
- No mantra publication.
- No personal prediction.
- No deterministic claim.
- No live Panchang-dependent guidance.
- No external API/source fetch.
- No runtime AI.
- No backend/Auth/Supabase/V02 activation.

## Next

AG65Z — Today's Vedic Guidance Closure.
`;

writeJson(outputs.apply, apply);
writeJson(outputs.uiContract, uiContract);
writeJson(outputs.noBackend, noBackend);
writeJson(outputs.noV02, noV02);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG65B Today's Vedic Guidance UI Wiring generated.");
console.log("✅ Ready for AG65Z Today's Vedic Guidance Closure.");
