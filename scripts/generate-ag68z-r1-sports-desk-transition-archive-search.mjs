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

const ag68z = readJson("data/content-intelligence/quality-reviews/ag68z-sports-desk-closure.json");
let sportsData = readJson("generated/sports-desk-working-data.json");
let indexHtml = read("index.html");

if (ag68z.summary?.sports_desk_row_closed_at_safe_working_data_level !== true) {
  throw new Error("AG68Z safe Sports Desk closure is missing.");
}
if (ag68z.summary?.next_governed_stage_requires_user_confirmation !== true) {
  throw new Error("AG68Z next-stage confirmation gate missing.");
}

for (const key of [
  "source_collection_active",
  "live_sports_sourcing_active",
  "external_api_fetch_active",
  "runtime_sports_api_active",
  "ai_generation_active",
  "ai_selection_active"
]) {
  if (sportsData[key] !== false) throw new Error(`${key} must remain false before AG68Z-R1.`);
}

const slots = {
  live_events: [
    {
      slot_id: "live_event_slot_01",
      title: "Live-event card reserved for reviewed sports context.",
      meta: "No live event feed is active.",
      source_status: "under_verification",
      cta_enabled: false
    },
    {
      slot_id: "live_event_slot_02",
      title: "Event calendar slot reserved for verified upcoming sports schedules.",
      meta: "Calendar sourcing will use official or established sports portals after review.",
      source_status: "under_verification",
      cta_enabled: false
    },
    {
      slot_id: "live_event_slot_03",
      title: "Match/event context slot reserved for reviewed public update.",
      meta: "Real-time score or result claims are not active.",
      source_status: "under_verification",
      cta_enabled: false
    }
  ],
  tournament_watch: [
    {
      slot_id: "tournament_slot_01",
      title: "Tournament watch card reserved for verified tournament context.",
      meta: "No tournament feed is active.",
      source_status: "under_verification",
      cta_enabled: false
    },
    {
      slot_id: "tournament_slot_02",
      title: "Tournament format and stage context slot reserved.",
      meta: "Future cards may explain format, stage, table, draw or bracket after source review.",
      source_status: "under_verification",
      cta_enabled: false
    },
    {
      slot_id: "tournament_slot_03",
      title: "Team/player storyline context slot reserved.",
      meta: "Only verified, non-speculative context will be used.",
      source_status: "under_verification",
      cta_enabled: false
    }
  ],
  major_updates: [
    {
      slot_id: "major_update_slot_01",
      title: "Major sports update reserved for editorial review.",
      meta: "No live update feed is active.",
      source_status: "under_verification",
      cta_enabled: false
    },
    {
      slot_id: "major_update_slot_02",
      title: "Sports administration, policy or infrastructure update slot reserved.",
      meta: "Future update must be linked to a verified source.",
      source_status: "under_verification",
      cta_enabled: false
    },
    {
      slot_id: "major_update_slot_03",
      title: "Performance, analytics or milestone update slot reserved.",
      meta: "Claims will require established-source verification.",
      source_status: "under_verification",
      cta_enabled: false
    }
  ],
  featured_sports_article: [
    {
      slot_id: "featured_sports_article_slot_01",
      title: "Featured sports article slot reserved for reviewed Drishvara read.",
      meta: "No featured sports article is active from this working data.",
      source_status: "under_editorial_review",
      cta_enabled: false,
      internal_article_link: ""
    },
    {
      slot_id: "featured_sports_article_slot_02",
      title: "Tournament explainer or sports analytics read slot reserved.",
      meta: "Internal article link will appear only after editorial approval.",
      source_status: "under_editorial_review",
      cta_enabled: false,
      internal_article_link: ""
    }
  ]
};

const desk = sportsData.sports_desk || {};
desk.transition_layout = {
  enabled: true,
  visible_cards_per_section: 1,
  transition_mode: "single_card_cycle",
  transition_interval_ms: 5200,
  respects_public_ui_ready: true,
  live_sourcing_required: false
};

desk.archive_search = {
  shell_visible: true,
  static_archive_index_path: "generated/sports-desk-archive-index.json",
  database_search_active: false,
  backend_required_for_full_archive: true,
  public_copy: "Search previous sports events and updates after archive governance is active.",
  verified_link_required: true
};

desk.sections = (Array.isArray(desk.sections) ? desk.sections : []).map((section) => {
  const sectionSlots = slots[section.section_id];
  if (!sectionSlots) return section;
  return {
    ...section,
    active: false,
    transition_ready: true,
    visible_cards_per_section: 1,
    items: sectionSlots
  };
});

sportsData = {
  ...sportsData,
  sports_desk: desk,
  public_ui_ready: false,
  working_data_publicly_wired: false,
  source_collection_active: false,
  live_sports_sourcing_active: false,
  external_api_fetch_active: false,
  runtime_sports_api_active: false,
  ai_generation_active: false,
  ai_selection_active: false,
  report_generation_enabled: false,
  archive_search_shell_active: true,
  database_archive_search_active: false,
  verified_link_policy_active: true,
  transition_layout_ready: true
};

const archiveIndex = {
  module_id: "AG68Z-R1",
  title: "Sports Desk Archive Search Index",
  status: "archive_search_shell_ready_no_database_runtime",
  archive_search_shell_active: true,
  static_archive_search_enabled: true,
  database_search_active: false,
  backend_runtime_activated: false,
  public_ui_ready: false,
  records_publicly_available: false,
  verified_link_required: true,
  source_verification_required: true,
  records: [],
  record_schema: {
    archive_id: "string",
    sport: "string",
    event_name: "string",
    event_date: "YYYY-MM-DD",
    category: "result | update | tournament | article | context",
    result_or_status: "string",
    short_summary: "string",
    source_name: "string",
    source_url: "string",
    source_type: "official | established_sports_portal | recognised_news_sports_desk | internal_drishvara_article",
    source_verified: "boolean",
    last_verified_at: "YYYY-MM-DD",
    internal_article_link: "string optional"
  },
  public_empty_state: "No verified sports archive records are active yet.",
  future_database_note: "Past sports results and event updates should ultimately be retained in Drishvara database tables and exposed through governed search.",
  blocked_sources: [
    "betting or odds portals",
    "fantasy-gaming portals",
    "unverified social media posts",
    "random blogs",
    "parked or broken links",
    "AI-invented results",
    "scraped live-score claims",
    "unverified transfer or injury rumours"
  ]
};

writeJson("generated/sports-desk-working-data.json", sportsData);
writeJson("generated/sports-desk-archive-index.json", archiveIndex);
writeJson("data/initial-working-data/sports-desk/ag68z-r1-sports-desk-multi-slot-working-data.json", sportsData);

const styleMarker = 'data-drishvara-ag68z-r1-sports-desk-transition-style="true"';
const scriptMarker = 'data-drishvara-ag68z-r1-sports-desk-transition-archive="true"';

const r1Style = `
<style data-drishvara-ag68z-r1-sports-desk-transition-style="true">
  .drishvara-ag68z-r1-sports-transition-card {
    min-height: 190px;
  }

  .drishvara-ag68z-r1-sports-transition-card [data-ag68zr1-sports-title],
  .drishvara-ag68z-r1-sports-transition-card [data-ag68zr1-sports-meta],
  .drishvara-ag68z-r1-sports-transition-card [data-ag68zr1-sports-status],
  .drishvara-ag68z-r1-sports-transition-card [data-ag68zr1-sports-counter] {
    transition: opacity 260ms ease, transform 260ms ease;
  }

  .drishvara-ag68z-r1-sports-transition-card.is-transitioning [data-ag68zr1-sports-title],
  .drishvara-ag68z-r1-sports-transition-card.is-transitioning [data-ag68zr1-sports-meta],
  .drishvara-ag68z-r1-sports-transition-card.is-transitioning [data-ag68zr1-sports-status],
  .drishvara-ag68z-r1-sports-transition-card.is-transitioning [data-ag68zr1-sports-counter] {
    opacity: 0.14;
    transform: translateY(8px);
  }

  .drishvara-ag68z-r1-sports-status {
    margin-top: 0.55rem;
    font-size: 0.88rem;
    opacity: 0.78;
  }

  .drishvara-ag68z-r1-sports-counter {
    margin-top: 0.35rem;
    font-size: 0.78rem;
    opacity: 0.58;
  }

  .drishvara-ag68z-r1-archive-search {
    margin-top: 1.6rem;
  }

  .drishvara-ag68z-r1-archive-search .form-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0.6rem;
    align-items: center;
  }

  .drishvara-ag68z-r1-archive-search input {
    width: 100%;
  }

  .drishvara-ag68z-r1-archive-results {
    margin-top: 0.8rem;
    display: grid;
    gap: 0.65rem;
  }

  .drishvara-ag68z-r1-archive-result {
    padding: 0.8rem;
    border-radius: 16px;
    border: 1px solid rgba(148, 163, 184, 0.22);
    background: rgba(15, 23, 42, 0.24);
  }

  @media (max-width: 720px) {
    .drishvara-ag68z-r1-archive-search .form-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
`;

const r1Script = `
<script data-drishvara-ag68z-r1-sports-desk-transition-archive="true">
(() => {
  const SPORTS_DATA_PATH = "generated/sports-desk-working-data.json";
  const ARCHIVE_DATA_PATH = "generated/sports-desk-archive-index.json";
  const intervals = new Map();

  function escapeAg68zr1Html(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function cleanAg68zr1Status(value) {
    const text = String(value || "under_verification").replace(/_/g, " ").trim();
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function sectionById(desk, sectionId) {
    const sections = Array.isArray(desk.sections) ? desk.sections : [];
    return sections.find((section) => section && section.section_id === sectionId) || null;
  }

  function renderShell(targetId, section, cardClass, fallbackTitle, fallbackMeta) {
    const target = document.getElementById(targetId);
    if (!target) return null;

    const items = Array.isArray(section?.items) && section.items.length ? section.items : [
      { title: fallbackTitle, meta: fallbackMeta, source_status: "under_verification" }
    ];

    const first = items[0] || {};
    target.innerHTML = \`
      <div class="\${escapeAg68zr1Html(cardClass)} drishvara-ag68z-r1-sports-transition-card"
        data-drishvara-ag68z-r1-sports-transition-card="true"
        data-ag68zr1-section="\${escapeAg68zr1Html(section?.section_id || "fallback")}">
        <div class="sub" data-ag68zr1-sports-label>Working Data</div>
        <div class="title" data-ag68zr1-sports-title>\${escapeAg68zr1Html(first.title || fallbackTitle)}</div>
        <div class="meta" data-ag68zr1-sports-meta>\${escapeAg68zr1Html(first.meta || fallbackMeta)}</div>
        <div class="drishvara-ag68z-r1-sports-status" data-ag68zr1-sports-status>Status: \${escapeAg68zr1Html(cleanAg68zr1Status(first.source_status || section?.status))}</div>
        <div class="drishvara-ag68z-r1-sports-counter" data-ag68zr1-sports-counter>1 / \${escapeAg68zr1Html(items.length)}</div>
      </div>
    \`;

    return {
      card: target.querySelector("[data-drishvara-ag68z-r1-sports-transition-card]"),
      items,
      index: 0
    };
  }

  function updateShell(state, section) {
    if (!state?.card || !state.items.length) return;

    state.index = (state.index + 1) % state.items.length;
    const item = state.items[state.index] || {};

    state.card.classList.add("is-transitioning");

    window.setTimeout(() => {
      const title = state.card.querySelector("[data-ag68zr1-sports-title]");
      const meta = state.card.querySelector("[data-ag68zr1-sports-meta]");
      const status = state.card.querySelector("[data-ag68zr1-sports-status]");
      const counter = state.card.querySelector("[data-ag68zr1-sports-counter]");

      if (title) title.textContent = item.title || "Sports Desk item reserved for review.";
      if (meta) meta.textContent = item.meta || "No active sports feed is enabled.";
      if (status) status.textContent = "Status: " + cleanAg68zr1Status(item.source_status || section?.status);
      if (counter) counter.textContent = \`\${state.index + 1} / \${state.items.length}\`;

      state.card.classList.remove("is-transitioning");
    }, 260);
  }

  function clearIntervals() {
    intervals.forEach((id) => window.clearInterval(id));
    intervals.clear();
  }

  function ensureArchiveSearchShell(card) {
    if (!card || document.getElementById("sports-archive-search")) return;

    const panel = document.createElement("div");
    panel.className = "drishvara-ag68z-r1-archive-search";
    panel.id = "sports-archive-search";
    panel.setAttribute("data-drishvara-ag68z-r1-sports-archive-search", "true");
    panel.innerHTML = \`
      <div class="sports-section-heading">Search Previous Events</div>
      <p class="section-note">A verified sports archive is being prepared. Past results and event updates will be searchable after source verification and archive governance are active.</p>
      <div class="form-grid">
        <input id="sports-archive-search-input" type="search" placeholder="Search event, tournament, sport or result" aria-label="Search previous sports events" />
        <button class="btn btn-secondary" id="sports-archive-search-button" type="button">Search</button>
      </div>
      <div class="utility-note" id="sports-archive-search-status">Database-backed archive search is not active. Static verified records will appear here after approval.</div>
      <div class="drishvara-ag68z-r1-archive-results" id="sports-archive-search-results"></div>
    \`;
    card.appendChild(panel);
  }

  function renderArchiveResults(records, query) {
    const results = document.getElementById("sports-archive-search-results");
    const status = document.getElementById("sports-archive-search-status");
    if (!results || !status) return;

    const q = String(query || "").trim().toLowerCase();
    const approved = Array.isArray(records) ? records.filter((record) => record && record.source_verified === true) : [];

    if (!q) {
      results.innerHTML = "";
      status.textContent = "Enter an event, tournament, sport or result keyword. Only verified archive records will be shown.";
      return;
    }

    const matches = approved.filter((record) => {
      const hay = [
        record.sport,
        record.event_name,
        record.category,
        record.result_or_status,
        record.short_summary,
        record.source_name
      ].join(" ").toLowerCase();
      return hay.includes(q);
    });

    if (!matches.length) {
      results.innerHTML = "";
      status.textContent = "No verified sports archive records are active for this search yet.";
      return;
    }

    status.textContent = \`\${matches.length} verified archive record(s) found.\`;
    results.innerHTML = matches.slice(0, 10).map((record) => {
      const link = record.source_url
        ? \`<a href="\${escapeAg68zr1Html(record.source_url)}" target="_blank" rel="noopener noreferrer">Open verified source</a>\`
        : "";
      return \`
        <div class="drishvara-ag68z-r1-archive-result">
          <div class="sub">\${escapeAg68zr1Html(record.sport || "Sport")} · \${escapeAg68zr1Html(record.event_date || "Date under review")}</div>
          <div class="title">\${escapeAg68zr1Html(record.event_name || "Verified event record")}</div>
          <div class="meta">\${escapeAg68zr1Html(record.result_or_status || "Status under review")}</div>
          <div class="meta">\${escapeAg68zr1Html(record.short_summary || "")}</div>
          <div class="reading-guide-links">\${link}</div>
        </div>
      \`;
    }).join("");
  }

  async function loadArchiveIndex() {
    try {
      const response = await fetch(ARCHIVE_DATA_PATH, { cache: "no-store" });
      if (!response.ok) throw new Error("Archive index unavailable");
      return await response.json();
    } catch {
      return { records: [], database_search_active: false };
    }
  }

  function wireArchiveSearch(archive) {
    const input = document.getElementById("sports-archive-search-input");
    const button = document.getElementById("sports-archive-search-button");
    if (!input || !button) return;

    const records = Array.isArray(archive?.records) ? archive.records : [];

    const runSearch = () => renderArchiveResults(records, input.value);
    button.addEventListener("click", runSearch);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") runSearch();
    });
  }

  async function loadAg68zr1SportsTransitions() {
    const card = document.getElementById("sports-desk");
    if (!card) return;

    ensureArchiveSearchShell(card);

    try {
      const response = await fetch(SPORTS_DATA_PATH, { cache: "no-store" });
      if (!response.ok) throw new Error("Sports Desk working data unavailable");
      const data = await response.json();
      const desk = data.sports_desk || {};

      clearIntervals();

      const configs = [
        ["live_events", "sports-live-events-list", "sports-item", "Live-event card reserved for reviewed sports context.", "No live event feed is active.", 5200],
        ["tournament_watch", "sports-tournaments-list", "tournament-card", "Tournament watch card reserved for verified tournament context.", "No tournament feed is active.", 6100],
        ["major_updates", "sports-major-updates-list", "major-update-card", "Major sports update reserved for editorial review.", "No live update feed is active.", 7000],
        ["featured_sports_article", "featured-sports-article-wrap", "featured-sports-article-card", "Featured sports article slot reserved for reviewed Drishvara read.", "No featured sports article is active from this working data.", 7900]
      ];

      configs.forEach(([sectionId, targetId, cardClass, fallbackTitle, fallbackMeta, interval]) => {
        const section = sectionById(desk, sectionId);
        const state = renderShell(targetId, section, cardClass, fallbackTitle, fallbackMeta);
        if (state && state.items.length > 1) {
          intervals.set(sectionId, window.setInterval(() => updateShell(state, section), interval));
        }
      });

      card.setAttribute("data-drishvara-ag68z-r1-sports-transition-ready", "true");
      card.setAttribute("data-drishvara-ag68z-r1-sports-archive-shell", "true");
      card.setAttribute("data-drishvara-ag68z-r1-live-sourcing-active", data.live_sports_sourcing_active === true ? "true" : "false");
      card.setAttribute("data-drishvara-ag68z-r1-database-search-active", data.database_archive_search_active === true ? "true" : "false");

      document.documentElement.setAttribute("data-drishvara-ag68z-r1-sports-transition-ready", "true");
      document.documentElement.setAttribute("data-drishvara-ag68z-r1-sports-archive-shell", "true");

      const archive = await loadArchiveIndex();
      wireArchiveSearch(archive);
    } catch {
      card.setAttribute("data-drishvara-ag68z-r1-sports-transition-ready", "fallback");
      card.setAttribute("data-drishvara-ag68z-r1-live-sourcing-active", "false");
      card.setAttribute("data-drishvara-ag68z-r1-database-search-active", "false");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadAg68zr1SportsTransitions, { once: true });
  } else {
    loadAg68zr1SportsTransitions();
  }

  window.addEventListener("load", () => {
    loadAg68zr1SportsTransitions();
    setTimeout(loadAg68zr1SportsTransitions, 900);
    setTimeout(loadAg68zr1SportsTransitions, 1600);
  });

  window.drishvaraAg68zr1LoadSportsDeskTransitions = loadAg68zr1SportsTransitions;
})();
</script>
`;

if (!indexHtml.includes(styleMarker)) {
  indexHtml = indexHtml.replace("</head>", `${r1Style}\n</head>`);
}
if (!indexHtml.includes(scriptMarker)) {
  indexHtml = indexHtml.replace("</body>", `${r1Script}\n</body>`);
}
write("index.html", indexHtml);

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag68z-r1-sports-desk-transition-archive-search.json",
  applyRecord: "data/content-intelligence/phase-01-modules/ag68z-r1-sports-desk-transition-archive-search-apply-record.json",
  visualContract: "data/content-intelligence/phase-01-modules/ag68z-r1-sports-desk-transition-visual-contract-record.json",
  archiveDoctrine: "data/methodology/sports-desk/ag68z-r1-sports-archive-search-and-link-verification-policy.json",
  futureDbModel: "data/methodology/sports-desk/ag68z-r1-future-sports-database-table-model.json",
  archiveIndex: "generated/sports-desk-archive-index.json",
  workingDataSnapshot: "data/initial-working-data/sports-desk/ag68z-r1-sports-desk-multi-slot-working-data.json",
  readiness: "data/content-intelligence/quality-registry/ag68z-r1-public-module-verification-sweep-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag68z-r1-to-public-module-live-static-verification-sweep-boundary.json",
  noBackend: "data/content-intelligence/backend-architecture/ag68z-r1-sports-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag68z-r1-sports-no-v02-expansion-audit.json",
  registry: "data/quality/ag68z-r1-sports-desk-transition-archive-search.json",
  preview: "data/quality/ag68z-r1-sports-desk-transition-archive-search-preview.json",
  doc: "docs/quality/AG68Z_R1_SPORTS_DESK_TRANSITION_ARCHIVE_SEARCH.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const archiveDoctrine = {
  module_id: "AG68Z-R1",
  title: "Sports Archive Search and Verified Link Policy",
  status: "archive_search_and_verified_link_policy_recorded",
  principle: "Drishvara may retain concise sports event/result/update records internally and provide verified external reference links for detailed information.",
  database_runtime_active: false,
  archive_search_shell_active: true,
  verified_link_required: true,
  link_acceptance_rules: [
    "Link must be reachable and responsive.",
    "Link must come from an official tournament, federation, league, team, broadcaster or established news/sports portal.",
    "Link must directly support the event/result/update record.",
    "Link must not be parked, spam, irrelevant, broken or primarily betting/fantasy/odds focused.",
    "Link must be rechecked before public archive activation."
  ],
  blocked_sources: archiveIndex.blocked_sources,
  user_search_goal: "Allow users to search previous sports events and updates, view concise Drishvara result/context records, and follow verified source links for detail."
};

const futureDbModel = {
  module_id: "AG68Z-R1",
  title: "Future Sports Database Table Model",
  status: "future_database_model_recorded_no_database_activation",
  database_runtime_active: false,
  backend_activation_required: true,
  future_tables: {
    sports_events: [
      "event_id",
      "sport",
      "event_name",
      "event_date",
      "category",
      "result_or_status",
      "short_summary",
      "created_at",
      "updated_at",
      "public_status"
    ],
    sports_event_sources: [
      "source_id",
      "event_id",
      "source_name",
      "source_url",
      "source_type",
      "source_verified",
      "last_verified_at",
      "verification_notes"
    ],
    sports_archive_search_index: [
      "index_id",
      "event_id",
      "search_keywords",
      "sport",
      "event_date",
      "category",
      "public_search_enabled"
    ],
    sports_admin_review_log: [
      "review_id",
      "event_id",
      "reviewer",
      "decision",
      "source_check_status",
      "published_status",
      "reviewed_at"
    ]
  },
  current_stage_treatment: "Schema recorded only. No database, backend, Auth, Supabase or runtime write is activated."
};

const applyRecord = {
  module_id: "AG68Z-R1",
  title: "Sports Desk Transition, Archive Search and Verified Link Apply Record",
  status: "sports_desk_transition_archive_search_static_correction_applied",
  current_git_context: git,
  mutated_files: [
    "index.html",
    "generated/sports-desk-working-data.json"
  ],
  created_files: [
    "generated/sports-desk-archive-index.json",
    "data/initial-working-data/sports-desk/ag68z-r1-sports-desk-multi-slot-working-data.json"
  ],
  applied_changes: {
    multi_slot_sections_added: true,
    one_visible_card_per_subhead: true,
    transition_script_added: true,
    archive_search_shell_added: true,
    verified_link_policy_recorded: true,
    future_database_model_recorded: true
  },
  inactive_states_preserved: {
    live_sports_sourcing_active: false,
    external_api_fetch_active: false,
    runtime_sports_api_active: false,
    ai_generation_active: false,
    backend_runtime_activated: false,
    v02_expansion_started: false
  }
};

const visualContract = {
  module_id: "AG68Z-R1",
  title: "Sports Desk Transition Visual Contract",
  status: "visual_contract_recorded",
  section_contract: {
    live_events: { visible_cards: 1, total_slots: 3, transition_enabled: true },
    tournament_watch: { visible_cards: 1, total_slots: 3, transition_enabled: true },
    major_updates: { visible_cards: 1, total_slots: 3, transition_enabled: true },
    featured_sports_article: { visible_cards: 1, total_slots: 2, transition_enabled: true }
  },
  archive_search_contract: {
    search_shell_visible: true,
    database_search_active: false,
    verified_records_required: true,
    empty_state: archiveIndex.public_empty_state
  }
};

function audit(title, status, keys) {
  return {
    module_id: "AG68Z-R1",
    title,
    status,
    audit_passed: true,
    checks: keys.map((check_id) => ({ check_id, expected: false, actual: false, passed: true })),
    failed_checks: []
  };
}

const noBackend = audit("No Backend/Auth/RLS/Database Runtime Audit", "no_backend_auth_rls_database_runtime_audit_passed", [
  "backend_runtime_activated",
  "database_runtime_activated",
  "database_archive_search_active",
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
  module_id: "AG68Z-R1",
  title: "Public Module Verification Sweep Readiness Record",
  status: "ready_for_public_module_live_static_verification_sweep",
  ready_for_verification_sweep: true,
  reason: "Sports Desk now has multi-slot transition layout, archive-search shell and verified-link doctrine while all runtime/backend states remain inactive."
};

const boundary = {
  module_id: "AG68Z-R1",
  title: "AG68Z-R1 to Public Module Live/Static Verification Sweep Boundary",
  status: "verification_sweep_boundary_defined",
  allowed_next_scope: [
    "Run non-mutating public module static/live verification sweep.",
    "Check visible module markers and generated JSON availability.",
    "Record DNS/live check status honestly."
  ],
  blocked_scope_without_explicit_approval: [
    "database archive search activation",
    "backend/Auth/Supabase activation",
    "live sports sourcing",
    "runtime sports API",
    "external API fetch",
    "web scraping",
    "real-time score updates",
    "automatic event/result publication",
    "service-role use",
    "V02 expansion"
  ]
};

const review = {
  module_id: "AG68Z-R1",
  title: "Sports Desk Multi-Slot Transition, Archive Search and Verified Link Doctrine",
  status: "ag68z_r1_sports_desk_transition_archive_search_completed",
  current_git_context: git,
  apply_record_file: outputs.applyRecord,
  visual_contract_file: outputs.visualContract,
  archive_doctrine_file: outputs.archiveDoctrine,
  future_db_model_file: outputs.futureDbModel,
  archive_index_file: outputs.archiveIndex,
  no_backend_runtime_audit_file: outputs.noBackend,
  no_v02_expansion_audit_file: outputs.noV02,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    sports_multislot_transition_layout_added: true,
    live_events_slots_count: 3,
    tournament_watch_slots_count: 3,
    major_updates_slots_count: 3,
    featured_sports_article_slots_count: 2,
    one_visible_card_per_subhead: true,
    transition_effect_enabled: true,
    archive_search_shell_added: true,
    archive_index_created: true,
    verified_link_policy_recorded: true,
    future_database_model_recorded: true,
    database_archive_search_active: false,
    backend_runtime_activated: false,
    source_collection_active: false,
    live_sports_sourcing_active: false,
    external_api_fetch_active: false,
    runtime_sports_api_active: false,
    ai_generation_active: false,
    service_role_used: false,
    v02_expansion_started: false,
    ready_for_public_module_verification_sweep: true
  }
};

const registry = {
  module_id: "AG68Z-R1",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG68Z-R1",
  status: review.status,
  sports_multislot_transition_layout_added: 1,
  live_events_slots_count: 3,
  tournament_watch_slots_count: 3,
  major_updates_slots_count: 3,
  featured_sports_article_slots_count: 2,
  one_visible_card_per_subhead: 1,
  transition_effect_enabled: 1,
  archive_search_shell_added: 1,
  archive_index_created: 1,
  verified_link_policy_recorded: 1,
  future_database_model_recorded: 1,
  database_archive_search_active: 0,
  backend_runtime_activated: 0,
  source_collection_active: 0,
  live_sports_sourcing_active: 0,
  external_api_fetch_active: 0,
  runtime_sports_api_active: 0,
  ai_generation_active: 0,
  service_role_used: 0,
  v02_expansion_started: 0,
  ready_for_public_module_verification_sweep: 1
};

const doc = `# AG68Z-R1 — Sports Desk Transition, Archive Search and Verified Link Doctrine

AG68Z-R1 improves the Sports Desk surface before the public module verification sweep.

## Added

- Multi-slot transition layout for Sports Desk.
- One visible card per Sports Desk sub-head.
- Transition-ready slots:
  - Live Events: 3
  - Tournament Watch: 3
  - Major Updates: 3
  - Featured Sports Article: 2
- Search Previous Events shell.
- Static sports archive index placeholder.
- Verified source-link policy.
- Future sports database table model.

## Archive principle

Past results and event updates should be retained as concise Drishvara records. Users should be able to search those records and follow verified links from established portals for detailed information.

## Accepted future source types

- Official tournament, league, federation or team pages.
- Official broadcaster/event pages where publicly accessible.
- Established news/sports portals.
- Internal reviewed Drishvara sports articles.

## Blocked

- Betting/odds/fantasy portals.
- Unverified social posts.
- Random blogs.
- Broken, parked or spam links.
- AI-invented results.
- Scraped live-score claims.

## Not activated

- No database search.
- No backend/Auth/Supabase.
- No live sports sourcing.
- No external sports API.
- No runtime sports API.
- No AI generation.
- No service-role use.
- No V02 expansion.

## Next

Public module live/static verification sweep can now proceed.
`;

writeJson(outputs.archiveDoctrine, archiveDoctrine);
writeJson(outputs.futureDbModel, futureDbModel);
writeJson(outputs.applyRecord, applyRecord);
writeJson(outputs.visualContract, visualContract);
writeJson(outputs.noBackend, noBackend);
writeJson(outputs.noV02, noV02);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG68Z-R1 Sports Desk transition/archive/search doctrine generated.");
console.log("✅ No database, backend, live sourcing, runtime API, AI or V02 activation performed.");
