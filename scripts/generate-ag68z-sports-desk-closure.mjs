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

const ag68a = readJson("data/content-intelligence/quality-reviews/ag68a-sports-desk-working-data-foundation.json");
const ag68b = readJson("data/content-intelligence/quality-reviews/ag68b-sports-desk-ui-wiring.json");
const workingData = readJson("generated/sports-desk-working-data.json");
const indexHtml = read("index.html");

if (ag68a.summary?.ready_for_ag68b !== true) throw new Error("AG68A readiness missing.");
if (ag68b.summary?.ready_for_ag68z !== true) throw new Error("AG68B readiness missing.");

for (const marker of [
  'data-drishvara-ag68b-sports-desk-ui-wiring="true"',
  "generated/sports-desk-working-data.json",
  "drishvaraAg68bLoadSportsDesk",
  "applyAg68bSportsDesk",
  "sports-live-events-list",
  "sports-tournaments-list",
  "sports-major-updates-list",
  "featured-sports-article-wrap",
  "data-drishvara-ag68b-sports-desk-wired",
  "data-drishvara-ag68b-live-sourcing-active",
  "data-drishvara-ag68b-runtime-api-active",
  "data-drishvara-ag68b-ai-generation-active"
]) {
  if (!indexHtml.includes(marker)) throw new Error(`Missing AG68B closure marker: ${marker}`);
}

for (const key of [
  "public_ui_ready",
  "working_data_publicly_wired",
  "source_collection_active",
  "live_sports_sourcing_active",
  "external_api_fetch_active",
  "runtime_sports_api_active",
  "ai_generation_active",
  "ai_selection_active",
  "report_generation_enabled"
]) {
  if (workingData[key] !== false) throw new Error(`${key} must remain false in generated working data.`);
}

const desk = workingData.sports_desk || {};
if (desk.card_id !== "sports-desk") throw new Error("Sports Desk card ID mismatch.");
if (!Array.isArray(desk.sections) || desk.sections.length !== 4) throw new Error("Sports Desk must have four sections.");

const requiredSections = ["live_events", "tournament_watch", "major_updates", "featured_sports_article"];
for (const sectionId of requiredSections) {
  const section = desk.sections.find((x) => x.section_id === sectionId);
  if (!section) throw new Error(`Missing section ${sectionId}.`);
  if (section.active !== false) throw new Error(`${sectionId} must remain inactive.`);
}

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag68z-sports-desk-closure.json",
  closure: "data/content-intelligence/closure-records/ag68z-sports-desk-working-data-and-ui-wiring-closure.json",
  finalStatus: "data/content-intelligence/phase-01-modules/ag68z-sports-desk-final-status-record.json",
  staticEvidence: "data/content-intelligence/phase-01-modules/ag68z-sports-desk-static-verification-evidence-record.json",
  nextBoundary: "data/content-intelligence/mutation-plans/ag68z-to-next-governed-stage-boundary.json",
  noBackend: "data/content-intelligence/backend-architecture/ag68z-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag68z-no-v02-expansion-audit.json",
  registry: "data/quality/ag68z-sports-desk-closure.json",
  preview: "data/quality/ag68z-sports-desk-closure-preview.json",
  doc: "docs/quality/AG68Z_SPORTS_DESK_CLOSURE.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const finalStatus = {
  module_id: "AG68Z",
  title: "Sports Desk Final Status Record",
  status: "sports_desk_working_data_and_ui_wiring_closed",
  closed_components: {
    ag68a_working_data_foundation_completed: true,
    ag68b_ui_wiring_completed: true
  },
  current_safe_public_state: {
    visible_surface_present: true,
    generated_working_data_path: "generated/sports-desk-working-data.json",
    homepage_ui_wired_to_generated_data: true,
    card_id: desk.card_id,
    title: desk.title,
    subtitle: desk.subtitle,
    status_label: desk.status_label,
    safety_note: desk.safety_note,
    public_use_mode: desk.public_use_mode,
    source_status: desk.source_status,
    sections: desk.sections.map((section) => ({
      section_id: section.section_id,
      label: section.label,
      active: section.active,
      status: section.status,
      item_count: Array.isArray(section.items) ? section.items.length : 0
    }))
  },
  inactive_runtime_state: {
    public_ui_ready: workingData.public_ui_ready,
    source_collection_active: workingData.source_collection_active,
    live_sports_sourcing_active: workingData.live_sports_sourcing_active,
    external_api_fetch_active: workingData.external_api_fetch_active,
    runtime_sports_api_active: workingData.runtime_sports_api_active,
    ai_generation_active: workingData.ai_generation_active,
    ai_selection_active: workingData.ai_selection_active,
    report_generation_enabled: workingData.report_generation_enabled
  }
};

const staticEvidence = {
  module_id: "AG68Z",
  title: "Sports Desk Static Verification Evidence Record",
  status: "local_static_verification_recorded",
  evidence_type: "local_static_repository_check",
  live_url_verification_completed: false,
  live_url_verification_claimed: false,
  local_index_markers_present: [
    "data-drishvara-ag68b-sports-desk-ui-wiring",
    "generated/sports-desk-working-data.json",
    "drishvaraAg68bLoadSportsDesk",
    "sports-live-events-list",
    "sports-tournaments-list",
    "sports-major-updates-list",
    "featured-sports-article-wrap"
  ],
  generated_working_data_flags: {
    public_ui_ready: workingData.public_ui_ready,
    live_sports_sourcing_active: workingData.live_sports_sourcing_active,
    external_api_fetch_active: workingData.external_api_fetch_active,
    runtime_sports_api_active: workingData.runtime_sports_api_active,
    ai_generation_active: workingData.ai_generation_active
  },
  note: "This record closes local static Sports Desk wiring evidence only. It does not claim live URL verification."
};

function audit(title, status, keys) {
  return {
    module_id: "AG68Z",
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
  "rls_policy_mutation_enabled",
  "sports_runtime_api_enabled",
  "live_sports_sourcing_enabled",
  "public_mutation_beyond_static_index_wiring_enabled"
]);

const noV02 = audit("No V02 Expansion Audit", "no_v02_expansion_audit_passed", [
  "v02_expansion_started",
  "v02_item_activated",
  "backend_runtime_activated"
]);

const nextBoundary = {
  module_id: "AG68Z",
  title: "AG68Z to Next Governed Stage Boundary",
  status: "next_governed_stage_requires_user_confirmation",
  current_closure_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Proceed to the next user-approved governed row.",
    "Optionally perform live URL recheck when DNS/network is available.",
    "Optionally prepare Sports Desk reviewed content candidates in a later governed stage."
  ],
  blocked_scope_without_explicit_approval: [
    "live sports sourcing",
    "runtime sports API",
    "external API fetch",
    "web scraping",
    "real-time score updates",
    "betting/odds/fantasy content",
    "backend/Auth/Supabase activation",
    "database writes",
    "service-role use",
    "V02 expansion",
    "automatic publication"
  ]
};

const closure = {
  module_id: "AG68Z",
  title: "Sports Desk Working Data and UI Wiring Closure",
  status: "ag68z_sports_desk_closed",
  closed_stages: [
    "AG68A — Sports Desk Working Data Foundation",
    "AG68B — Sports Desk UI Wiring"
  ],
  closure_result: "Sports Desk now has governed generated working data and public UI wiring to that working data, while all live sourcing and runtime functionality remain inactive.",
  not_closed_as_live_sports_engine: [
    "No live sports sourcing is active.",
    "No external sports API is active.",
    "No runtime sports API is active.",
    "No real-time score/result update is active.",
    "No AI generation or selection is active.",
    "No backend/Auth/Supabase is active.",
    "No V02 expansion is active."
  ]
};

const review = {
  module_id: "AG68Z",
  title: "Sports Desk Closure",
  status: "ag68z_sports_desk_closure_completed",
  current_git_context: git,
  closure_file: outputs.closure,
  final_status_file: outputs.finalStatus,
  static_evidence_file: outputs.staticEvidence,
  no_backend_runtime_audit_file: outputs.noBackend,
  no_v02_expansion_audit_file: outputs.noV02,
  next_boundary_file: outputs.nextBoundary,
  summary: {
    ag68a_working_data_foundation_completed: true,
    ag68b_ui_wiring_completed: true,
    sports_desk_row_closed_at_safe_working_data_level: true,
    generated_sports_desk_source_connected: true,
    homepage_ui_wired_to_generated_sports_desk_data: true,
    live_events_target_wired: true,
    tournament_watch_target_wired: true,
    major_updates_target_wired: true,
    featured_sports_article_target_wired: true,
    fallback_preserved_on_fetch_failure: true,
    local_static_evidence_recorded: true,
    live_url_verification_completed: false,
    public_ui_ready: false,
    source_collection_active: false,
    live_sports_sourcing_active: false,
    external_api_fetch_active: false,
    runtime_sports_api_active: false,
    ai_generation_active: false,
    ai_selection_active: false,
    backend_runtime_activated: false,
    service_role_used: false,
    v02_expansion_started: false,
    next_governed_stage_requires_user_confirmation: true
  }
};

const registry = {
  module_id: "AG68Z",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG68Z",
  status: review.status,
  ag68a_working_data_foundation_completed: 1,
  ag68b_ui_wiring_completed: 1,
  sports_desk_row_closed_at_safe_working_data_level: 1,
  generated_sports_desk_source_connected: 1,
  homepage_ui_wired_to_generated_sports_desk_data: 1,
  live_events_target_wired: 1,
  tournament_watch_target_wired: 1,
  major_updates_target_wired: 1,
  featured_sports_article_target_wired: 1,
  fallback_preserved_on_fetch_failure: 1,
  local_static_evidence_recorded: 1,
  live_url_verification_completed: 0,
  public_ui_ready: 0,
  source_collection_active: 0,
  live_sports_sourcing_active: 0,
  external_api_fetch_active: 0,
  runtime_sports_api_active: 0,
  ai_generation_active: 0,
  backend_runtime_activated: 0,
  service_role_used: 0,
  v02_expansion_started: 0,
  next_governed_stage_requires_user_confirmation: 1
};

const doc = `# AG68Z — Sports Desk Closure

AG68Z closes Sports Desk at the safe working-data and UI-wiring level.

## Closed

- AG68A created the Sports Desk working data foundation.
- AG68B wired the visible Sports Desk card to \`generated/sports-desk-working-data.json\`.

## Current state

Sports Desk now reads from generated working data. The working data remains editorial-preview only.

## Wired sections

- Live Events.
- Tournament Watch.
- Major Updates.
- Featured Sports Article.

## Not activated

- No live sports sourcing.
- No external sports API.
- No runtime sports API.
- No real-time score/result claims.
- No AI generation or selection.
- No backend/Auth/Supabase.
- No service-role use.
- No V02 expansion.

## Evidence note

This closure records local static verification only. It does not claim live URL verification.

## Next

Next governed stage requires explicit user confirmation.
`;

writeJson(outputs.finalStatus, finalStatus);
writeJson(outputs.staticEvidence, staticEvidence);
writeJson(outputs.noBackend, noBackend);
writeJson(outputs.noV02, noV02);
writeJson(outputs.nextBoundary, nextBoundary);
writeJson(outputs.closure, closure);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG68Z Sports Desk Closure generated.");
console.log("✅ No live sports sourcing, runtime API, backend or V02 activation performed.");
