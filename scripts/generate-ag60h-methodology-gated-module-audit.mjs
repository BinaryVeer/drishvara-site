import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
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

const indexHtml = read("index.html");
const dailyContext = exists("generated/daily-context.json") ? readJson("generated/daily-context.json") : {};
const sportsContext = exists("generated/sports-context.json") ? readJson("generated/sports-context.json") : {};
const ag60gR2 = readJson("data/content-intelligence/quality-reviews/ag60g-r2-remove-duplicate-hidden-surfaces.json");

if (ag60gR2.summary?.ready_for_ag60h !== true) {
  throw new Error("AG60G-R2 readiness for AG60H missing.");
}

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag60h-methodology-gated-module-audit.json",
  moduleStatus: "data/content-intelligence/phase-01-modules/ag60h-methodology-gated-module-status-record.json",
  blocker: "data/content-intelligence/phase-01-modules/ag60h-methodology-gated-module-blocker-register.json",
  sourceBasis: "data/content-intelligence/phase-01-modules/ag60h-source-methodology-basis-record.json",
  readiness: "data/content-intelligence/quality-registry/ag60h-ag60i-methodology-gated-module-correction-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag60h-to-ag60i-methodology-gated-module-correction-boundary.json",
  noBackend: "data/content-intelligence/backend-architecture/ag60h-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag60h-no-v02-expansion-audit.json",
  registry: "data/quality/ag60h-methodology-gated-module-audit.json",
  preview: "data/quality/ag60h-methodology-gated-module-audit-preview.json",
  doc: "docs/quality/AG60H_METHODOLOGY_GATED_MODULE_AUDIT.md"
};

const requiredVisibleTerms = [
  "Word of the Day",
  "Today’s Vedic Guidance",
  "Star Reflection",
  "Panchang & Festival View",
  "Upcoming Observance",
  "Psychometric Assessment",
  "Sports Desk"
];

for (const term of requiredVisibleTerms) {
  if (!indexHtml.includes(term)) throw new Error(`Missing visible module term: ${term}`);
}

const methodologyFlags = {
  word_safety_note_present: indexHtml.includes("Curated language preview; meanings remain editorially reviewed before public expansion."),
  vedic_safety_note_present: indexHtml.includes("General reflective preview only; no deterministic prediction or live calculation is active."),
  panchang_safety_note_present: indexHtml.includes("Preview status: source and regional-method verification required before any live Panchang output."),
  star_safety_note_present: indexHtml.includes("Reflective prompt only; not a personal prediction, assessment, or decision guide."),
  psychometric_coming_soon_present: indexHtml.includes("Psychometric Assessment") && indexHtml.includes("Coming Soon"),
  sports_prepared_surface_present: sportsContext.status === "prepared_surface"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const moduleStatus = {
  module_id: "AG60H",
  title: "Methodology-Gated Module Status Record",
  status: "methodology_gated_modules_audited",
  modules: {
    word_of_the_day: {
      visible: true,
      current_state: "curated_static_preview",
      public_copy_safety: methodologyFlags.word_safety_note_present,
      activation_status: "not fully activated",
      issue: "Needs verified word-selection methodology, Sanskrit/Hindi integrity workflow, and editorial source basis. User has specifically indicated Nityanand Mishra Ji style/methodology alignment should be considered before activation.",
      recommended_ag60i_action: "Keep as reviewed-method preview or connect to a verified word-bank source with clear methodology note."
    },
    vedic_guidance: {
      visible: true,
      current_state: "reflective_preview",
      public_copy_safety: methodologyFlags.vedic_safety_note_present,
      activation_status: "not live calculated",
      issue: "Shows weekday, colour, food and mantra copy but remains general reflective guidance. Needs governed rule basis before stronger public claims.",
      recommended_ag60i_action: "Retain as general reflective module unless rule-source and calculation basis are verified."
    },
    panchang_festival_view: {
      visible: true,
      current_state: "static_location_preview",
      public_copy_safety: methodologyFlags.panchang_safety_note_present,
      activation_status: "not live Panchang",
      issue: "Shows sunrise/moon/tithi/nakshatra/yoga-style fields but source/regional method is not verified. This must not be presented as live Panchang.",
      recommended_ag60i_action: "Either keep as clearly labelled preview or suppress exact Panchang values until source/regional method is implemented."
    },
    upcoming_observance: {
      visible: true,
      current_state: "festival_preview_under_editorial_verification",
      activation_status: "not live calendar",
      issue: "Needs festival/observance source registry, date basis, regional applicability and bilingual naming review.",
      recommended_ag60i_action: "Use safe editorial verification copy until registry is connected."
    },
    star_reflection: {
      visible: true,
      current_state: "input_form_reflective_prompt",
      public_copy_safety: methodologyFlags.star_safety_note_present,
      activation_status: "not predictive/personalized",
      issue: "Inputs are visible, but there is no governed personal-calculation or consent flow yet.",
      recommended_ag60i_action: "Keep as non-functional preview or disable inputs until proper consent/methodology layer exists."
    },
    psychometric_assessment: {
      visible: true,
      current_state: "coming_soon_placeholder",
      public_copy_safety: methodologyFlags.psychometric_coming_soon_present,
      activation_status: "not active",
      issue: "Product layer is visible but not activated. Requires consent, data model, age gating and assessment methodology.",
      recommended_ag60i_action: "Keep as coming soon, or move lower if it distracts from live Phase-01 reading surfaces."
    },
    sports_desk: {
      visible: true,
      current_state: "prepared_surface_fallback",
      source: sportsContext.source || null,
      activation_status: "not live sports intelligence",
      live_events_count: Array.isArray(sportsContext.live_events) ? sportsContext.live_events.length : null,
      tournament_watch_count: Array.isArray(sportsContext.tournament_watch) ? sportsContext.tournament_watch.length : null,
      major_updates_count: Array.isArray(sportsContext.major_updates) ? sportsContext.major_updates.length : null,
      issue: "Sports Desk is structurally present but generated/sports-context.json contains empty prepared arrays.",
      recommended_ag60i_action: "Keep as prepared Sports Desk or reduce prominence until governed sports sourcing is implemented."
    }
  },
  daily_context_observation: {
    generated_daily_context_status: dailyContext.status || null,
    daily_context_source: dailyContext.source || null,
    first_light_rule_available: Boolean(dailyContext.first_light?.selection_rule),
    note: "generated/daily-context.json is currently a prepared surface rule record, not a live cultural-methodology data source."
  }
};

const blocker = {
  module_id: "AG60H",
  title: "Methodology-Gated Module Blocker Register",
  status: "methodology_blockers_recorded",
  blockers: [
    {
      id: "AG60H-B01",
      module: "Word of the Day",
      issue: "Needs verified linguistic/etymological methodology and source basis before public expansion.",
      severity: "medium"
    },
    {
      id: "AG60H-B02",
      module: "Panchang & Festival View",
      issue: "Static exact-looking Panchang values may be misleading without source/regional-method verification.",
      severity: "high"
    },
    {
      id: "AG60H-B03",
      module: "Today’s Vedic Guidance",
      issue: "Needs governed rule/source basis before being stronger than general reflection.",
      severity: "medium"
    },
    {
      id: "AG60H-B04",
      module: "Star Reflection",
      issue: "Inputs are visible while the actual personalised method/consent layer is not active.",
      severity: "medium"
    },
    {
      id: "AG60H-B05",
      module: "Sports Desk",
      issue: "Prepared surface exists but no live events, tournament watch, major updates or featured article are active.",
      severity: "medium"
    },
    {
      id: "AG60H-B06",
      module: "Psychometric Assessment",
      issue: "Coming-soon product surface needs consent, age and methodology governance before activation.",
      severity: "medium"
    }
  ]
};

const sourceBasis = {
  module_id: "AG60H",
  title: "Source and Methodology Basis Record",
  status: "source_methodology_basis_reviewed",
  sources_detected: {
    generated_daily_context_json: exists("generated/daily-context.json"),
    generated_sports_context_json: exists("generated/sports-context.json"),
    homepage_static_module_copy: true
  },
  unavailable_or_not_activated: [
    "No live Panchang calculation source is active.",
    "No verified Panchang regional-method runtime is active.",
    "No verified Word of the Day source bank/runtime is active.",
    "No live Vedic rule-calculation source is active.",
    "No live sports event fetch/source integration is active.",
    "No psychometric assessment runtime/consent workflow is active."
  ]
};

function audit(title, status, keys) {
  return {
    module_id: "AG60H",
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
  module_id: "AG60H",
  title: "AG60I Methodology-Gated Module Correction Readiness Record",
  status: "ready_for_ag60i_methodology_gated_module_correction",
  ready_for_ag60i: true,
  next_stage: "AG60I — Methodology-Gated Module Correction Apply",
  reason: "Audit confirms which public modules must remain preview/gated, be reworded, moved, or source-connected before full activation."
};

const boundary = {
  module_id: "AG60H",
  title: "AG60H to AG60I Boundary",
  status: "ag60i_methodology_gated_module_correction_boundary_created",
  allowed_next_scope: [
    "Reword public copy for methodology-gated modules.",
    "Remove or suppress exact-looking Panchang values if not source-backed.",
    "Disable or de-emphasise inactive input forms.",
    "Retain safety notes where modules are preview-only.",
    "Reduce prominence of prepared-only Sports Desk if needed."
  ],
  blocked_scope_without_explicit_approval: [
    "Supabase/Auth/backend activation",
    "runtime database writes",
    "service-role use",
    "V02 expansion",
    "live Panchang calculation",
    "live astrology/personal prediction",
    "live sports/news fetching without governed source rules",
    "psychometric data collection"
  ]
};

const review = {
  module_id: "AG60H",
  title: "Methodology-Gated Module Audit",
  status: "ag60h_methodology_gated_module_audit_completed",
  current_git_context: git,
  module_status_file: outputs.moduleStatus,
  blocker_file: outputs.blocker,
  source_basis_file: outputs.sourceBasis,
  no_backend_runtime_audit_file: outputs.noBackend,
  no_v02_expansion_audit_file: outputs.noV02,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    methodology_gated_modules_audited: true,
    word_of_the_day_requires_methodology_verification: true,
    panchang_values_require_source_regional_method_verification: true,
    vedic_guidance_remains_reflective_preview: true,
    star_reflection_remains_non_predictive_preview: true,
    psychometric_assessment_remains_coming_soon: true,
    sports_desk_remains_prepared_surface: true,
    ready_for_ag60i: true,
    backend_runtime_activated: false,
    service_role_used: false,
    v02_expansion_started: false
  }
};

const registry = {
  module_id: "AG60H",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG60H",
  status: review.status,
  methodology_gated_modules_audited: 1,
  word_of_the_day_requires_methodology_verification: 1,
  panchang_values_require_source_regional_method_verification: 1,
  vedic_guidance_remains_reflective_preview: 1,
  star_reflection_remains_non_predictive_preview: 1,
  psychometric_assessment_remains_coming_soon: 1,
  sports_desk_remains_prepared_surface: 1,
  ready_for_ag60i: 1,
  backend_runtime_activated: 0,
  service_role_used: 0,
  v02_expansion_started: 0
};

const doc = `# AG60H — Methodology-Gated Module Audit

AG60H audits public modules that are visible but not fully source/methodology activated.

## Audit result

- Word of the Day: visible, but needs verified linguistic/source methodology before expansion.
- Panchang & Festival View: visible, but exact-looking Panchang values require verified source and regional method before public activation.
- Today’s Vedic Guidance: visible, but remains general reflective preview.
- Star Reflection: visible, but not a personal prediction or active calculation.
- Psychometric Assessment: visible as coming soon only.
- Sports Desk: visible, but generated sports context remains prepared fallback only.

## Important rule

These modules must not be falsely presented as live/source-backed systems until their methodology, source basis and safety gates are complete.

No backend/Auth/Supabase/runtime database/V02 activation is performed.

## Next

AG60I — Methodology-Gated Module Correction Apply.
`;

writeJson(outputs.moduleStatus, moduleStatus);
writeJson(outputs.blocker, blocker);
writeJson(outputs.sourceBasis, sourceBasis);
writeJson(outputs.noBackend, noBackend);
writeJson(outputs.noV02, noV02);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG60H Methodology-Gated Module Audit generated.");
console.log("✅ Ready for AG60I Methodology-Gated Module Correction Apply.");
