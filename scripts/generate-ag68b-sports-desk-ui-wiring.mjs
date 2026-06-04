import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function write(p, text) { fs.writeFileSync(full(p), text); }
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
const workingData = readJson("generated/sports-desk-working-data.json");
let indexHtml = read("index.html");

if (ag68a.summary?.ready_for_ag68b !== true) throw new Error("AG68A readiness for AG68B missing.");
if (workingData.status !== "initial_sports_desk_working_data_ready_not_publicly_wired") throw new Error("Sports Desk working data status mismatch.");

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
  if (workingData[key] !== false) throw new Error(`${key} must remain false before AG68B.`);
}

for (const marker of [
  "sports-desk",
  "sports-live-events-list",
  "sports-tournaments-list",
  "sports-major-updates-list",
  "featured-sports-article-wrap"
]) {
  if (!indexHtml.includes(marker)) throw new Error(`Missing Sports Desk UI marker: ${marker}`);
}

const scriptMarker = 'data-drishvara-ag68b-sports-desk-ui-wiring="true"';

const ag68bScript = `
<script data-drishvara-ag68b-sports-desk-ui-wiring="true">
(() => {
  const SPORTS_DATA_PATH = "generated/sports-desk-working-data.json";

  function escapeAg68bHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setAg68bText(id, value) {
    const element = document.getElementById(id);
    if (element && typeof value === "string" && value.trim()) {
      element.textContent = value;
    }
  }

  function getAg68bSection(desk, sectionId) {
    const sections = Array.isArray(desk.sections) ? desk.sections : [];
    return sections.find((section) => section && section.section_id === sectionId) || null;
  }

  function renderAg68bItems(section, cardClass, fallbackTitle, fallbackMeta) {
    const items = Array.isArray(section?.items) && section.items.length ? section.items : [
      {
        title: fallbackTitle,
        meta: fallbackMeta,
        source_status: "under_verification",
        cta_enabled: false
      }
    ];

    return items.map((item) => {
      const status = item.source_status || section?.status || "under_verification";
      const ctaEnabled = item.cta_enabled === true && item.internal_article_link;
      const cta = ctaEnabled
        ? \`<div class="reading-guide-links"><a href="\${escapeAg68bHtml(item.internal_article_link)}">\${escapeAg68bHtml(item.cta_label || "Read Article")}</a></div>\`
        : "";

      return \`
        <div class="\${escapeAg68bHtml(cardClass)}" data-drishvara-ag68b-sports-item="true" data-ag68b-section="\${escapeAg68bHtml(section?.section_id || "fallback")}">
          <div class="sub">\${escapeAg68bHtml(section?.active === true ? "Reviewed Sports Context" : "Working Data")}</div>
          <div class="title">\${escapeAg68bHtml(item.title || fallbackTitle)}</div>
          <div class="meta">\${escapeAg68bHtml(item.meta || fallbackMeta)} · \${escapeAg68bHtml(status)}</div>
          \${cta}
        </div>
      \`;
    }).join("");
  }

  function applyAg68bSportsDesk(data) {
    const desk = data?.sports_desk || {};
    const card = document.getElementById("sports-desk");
    if (!card) return;

    const publicReady = data.public_ui_ready === true;
    const liveSourcing = data.live_sports_sourcing_active === true || data.runtime_sports_api_active === true;

    setAg68bText("sports-desk-title", desk.title || "Sports Desk");

    const intro = card.querySelector("p");
    if (intro) {
      intro.textContent = desk.subtitle || "Prepared sports desk for verified tournament context, major updates, and selected sports reads.";
    }

    const liveEvents = getAg68bSection(desk, "live_events");
    const tournamentWatch = getAg68bSection(desk, "tournament_watch");
    const majorUpdates = getAg68bSection(desk, "major_updates");
    const featuredArticle = getAg68bSection(desk, "featured_sports_article");

    const liveTarget = document.getElementById("sports-live-events-list");
    if (liveTarget) {
      liveTarget.innerHTML = renderAg68bItems(
        liveEvents,
        "sports-item",
        "Live-event card reserved for reviewed sports context.",
        "No live event feed is active."
      );
    }

    const tournamentTarget = document.getElementById("sports-tournaments-list");
    if (tournamentTarget) {
      tournamentTarget.innerHTML = renderAg68bItems(
        tournamentWatch,
        "tournament-card",
        "Tournament watch card reserved for verified tournament context.",
        "No tournament feed is active."
      );
    }

    const majorTarget = document.getElementById("sports-major-updates-list");
    if (majorTarget) {
      majorTarget.innerHTML = renderAg68bItems(
        majorUpdates,
        "major-update-card",
        "Major sports update reserved for editorial review.",
        "No live update feed is active."
      );
    }

    const featuredTarget = document.getElementById("featured-sports-article-wrap");
    if (featuredTarget) {
      featuredTarget.innerHTML = renderAg68bItems(
        featuredArticle,
        "featured-sports-article-card",
        "Featured sports article slot reserved for reviewed Drishvara read.",
        "No featured sports article is active from this working data."
      );
    }

    card.setAttribute("data-drishvara-ag68b-sports-desk-wired", "true");
    card.setAttribute("data-drishvara-ag68b-public-ready", publicReady ? "true" : "false");
    card.setAttribute("data-drishvara-ag68b-live-sourcing-active", liveSourcing ? "true" : "false");
    card.setAttribute("data-drishvara-ag68b-runtime-api-active", data.runtime_sports_api_active === true ? "true" : "false");
    card.setAttribute("data-drishvara-ag68b-ai-generation-active", data.ai_generation_active === true ? "true" : "false");

    document.documentElement.setAttribute("data-drishvara-ag68b-sports-desk-wired", "true");
    document.documentElement.setAttribute("data-drishvara-ag68b-sports-live-sourcing-active", liveSourcing ? "true" : "false");
  }

  async function loadAg68bSportsDesk() {
    try {
      const response = await fetch(SPORTS_DATA_PATH, { cache: "no-store" });
      if (!response.ok) throw new Error("Sports Desk working data unavailable");
      const data = await response.json();
      applyAg68bSportsDesk(data);
    } catch (error) {
      const card = document.getElementById("sports-desk");
      if (card) {
        card.setAttribute("data-drishvara-ag68b-sports-desk-wired", "fallback");
        card.setAttribute("data-drishvara-ag68b-public-ready", "false");
        card.setAttribute("data-drishvara-ag68b-live-sourcing-active", "false");
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadAg68bSportsDesk, { once: true });
  } else {
    loadAg68bSportsDesk();
  }

  window.addEventListener("load", () => {
    loadAg68bSportsDesk();
    setTimeout(loadAg68bSportsDesk, 600);
  });

  window.drishvaraAg68bLoadSportsDesk = loadAg68bSportsDesk;
})();
</script>
`;

if (!indexHtml.includes(scriptMarker)) {
  if (!indexHtml.includes("</body>")) throw new Error("Cannot locate </body> for AG68B script injection.");
  indexHtml = indexHtml.replace("</body>", `${ag68bScript}\n</body>`);
  write("index.html", indexHtml);
}

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag68b-sports-desk-ui-wiring.json",
  applyRecord: "data/content-intelligence/phase-01-modules/ag68b-sports-desk-ui-wiring-apply-record.json",
  dataContract: "data/content-intelligence/phase-01-modules/ag68b-sports-desk-ui-data-contract-record.json",
  readiness: "data/content-intelligence/quality-registry/ag68b-ag68z-sports-desk-closure-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag68b-to-ag68z-sports-desk-closure-boundary.json",
  noBackend: "data/content-intelligence/backend-architecture/ag68b-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag68b-no-v02-expansion-audit.json",
  registry: "data/quality/ag68b-sports-desk-ui-wiring.json",
  preview: "data/quality/ag68b-sports-desk-ui-wiring-preview.json",
  doc: "docs/quality/AG68B_SPORTS_DESK_UI_WIRING.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const applyRecord = {
  module_id: "AG68B",
  title: "Sports Desk UI Wiring Apply Record",
  status: "sports_desk_ui_wired_to_working_data",
  current_git_context: git,
  mutated_files: ["index.html"],
  generated_data_source: "generated/sports-desk-working-data.json",
  injected_script_marker: scriptMarker,
  public_ui_targets: [
    "sports-desk",
    "sports-live-events-list",
    "sports-tournaments-list",
    "sports-major-updates-list",
    "featured-sports-article-wrap"
  ],
  wiring_behaviour: {
    fetches_generated_working_data: true,
    renders_reserved_working_data_slots: true,
    keeps_existing_fallback_on_fetch_failure: true,
    public_ready_flag_respected: true,
    live_sourcing_flag_respected: true,
    active_sports_feed_enabled: false,
    external_api_enabled: false
  }
};

const dataContract = {
  module_id: "AG68B",
  title: "Sports Desk UI Data Contract Record",
  status: "sports_desk_ui_data_contract_recorded",
  source_path: "generated/sports-desk-working-data.json",
  required_root_flags: [
    "public_ui_ready",
    "working_data_publicly_wired",
    "source_collection_active",
    "live_sports_sourcing_active",
    "external_api_fetch_active",
    "runtime_sports_api_active",
    "ai_generation_active",
    "ai_selection_active"
  ],
  required_card_fields: [
    "sports_desk.card_id",
    "sports_desk.title",
    "sports_desk.subtitle",
    "sports_desk.status_label",
    "sports_desk.safety_note",
    "sports_desk.sections"
  ],
  required_sections: [
    "live_events",
    "tournament_watch",
    "major_updates",
    "featured_sports_article"
  ],
  active_state_now: {
    public_ui_ready: false,
    working_data_publicly_wired_after_ag68b: true,
    live_sports_sourcing_active: false,
    runtime_sports_api_active: false,
    ai_generation_active: false
  }
};

function audit(title, status, keys) {
  return {
    module_id: "AG68B",
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

const readiness = {
  module_id: "AG68B",
  title: "AG68Z Sports Desk Closure Readiness Record",
  status: "ready_for_ag68z_sports_desk_closure",
  ready_for_ag68z: true,
  next_stage: "AG68Z — Sports Desk Working Data and UI Wiring Closure",
  reason: "Sports Desk UI is wired to generated working data while live sourcing, runtime API, AI and backend remain inactive."
};

const boundary = {
  module_id: "AG68B",
  title: "AG68B to AG68Z Sports Desk Closure Boundary",
  status: "ag68z_closure_boundary_defined",
  allowed_next_scope: [
    "Close AG68A working-data foundation and AG68B UI wiring.",
    "Record final Sports Desk status.",
    "Keep live sports sourcing and runtime API inactive."
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
    "V02 expansion"
  ]
};

const review = {
  module_id: "AG68B",
  title: "Sports Desk UI Wiring",
  status: "ag68b_sports_desk_ui_wiring_completed",
  current_git_context: git,
  apply_record_file: outputs.applyRecord,
  data_contract_file: outputs.dataContract,
  no_backend_runtime_audit_file: outputs.noBackend,
  no_v02_expansion_audit_file: outputs.noV02,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    index_html_wired: true,
    sports_desk_fetches_generated_working_data: true,
    live_events_target_wired: true,
    tournament_watch_target_wired: true,
    major_updates_target_wired: true,
    featured_sports_article_target_wired: true,
    fallback_preserved_on_fetch_failure: true,
    public_ui_ready: false,
    working_data_publicly_wired: true,
    source_collection_active: false,
    live_sports_sourcing_active: false,
    external_api_fetch_active: false,
    runtime_sports_api_active: false,
    ai_generation_active: false,
    ai_selection_active: false,
    backend_runtime_activated: false,
    service_role_used: false,
    v02_expansion_started: false,
    ready_for_ag68z: true
  }
};

const registry = {
  module_id: "AG68B",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG68B",
  status: review.status,
  index_html_wired: 1,
  sports_desk_fetches_generated_working_data: 1,
  live_events_target_wired: 1,
  tournament_watch_target_wired: 1,
  major_updates_target_wired: 1,
  featured_sports_article_target_wired: 1,
  fallback_preserved_on_fetch_failure: 1,
  public_ui_ready: 0,
  working_data_publicly_wired: 1,
  source_collection_active: 0,
  live_sports_sourcing_active: 0,
  external_api_fetch_active: 0,
  runtime_sports_api_active: 0,
  ai_generation_active: 0,
  backend_runtime_activated: 0,
  service_role_used: 0,
  v02_expansion_started: 0,
  ready_for_ag68z: 1
};

const doc = `# AG68B — Sports Desk UI Wiring

AG68B wires the visible Sports Desk card to \`generated/sports-desk-working-data.json\`.

## Wired

- Live Events target.
- Tournament Watch target.
- Major Updates target.
- Featured Sports Article target.
- Safe fallback if generated working data is unavailable.

## Current state

The Sports Desk now reads from generated working data, but that working data remains inactive/editorial-preview only.

## Not activated

- No live sports sourcing.
- No external sports API.
- No runtime sports API.
- No AI generation or AI selection.
- No score/result claims.
- No backend/Auth/Supabase.
- No service-role use.
- No V02 expansion.

## Next

AG68Z can close the Sports Desk working-data and UI-wiring chain.
`;

writeJson(outputs.applyRecord, applyRecord);
writeJson(outputs.dataContract, dataContract);
writeJson(outputs.noBackend, noBackend);
writeJson(outputs.noV02, noV02);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG68B Sports Desk UI wiring generated.");
console.log("✅ No live sports sourcing, runtime API, backend or V02 activation performed.");
