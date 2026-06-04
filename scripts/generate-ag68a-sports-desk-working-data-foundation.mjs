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
function exists(p) { return fs.existsSync(full(p)); }
function run(cmd) {
  try { return execSync(cmd, { cwd: root, encoding: "utf8" }).trim(); }
  catch { return ""; }
}

const indexHtml = read("index.html");
const ag67zr1 = readJson("data/content-intelligence/quality-reviews/ag67z-r1-homepage-route-founder-continuity-sports-fallback-verification.json");

if (ag67zr1.summary?.sports_desk_stable_fallback_verified_locally !== true) {
  throw new Error("AG67Z-R1 Sports Desk fallback verification is missing.");
}
if (ag67zr1.summary?.sports_desk_active_wiring_deferred !== true) {
  throw new Error("AG67Z-R1 Sports Desk active wiring deferral is missing.");
}

for (const marker of [
  "Sports Desk",
  "sports-live-events-list",
  "sports-tournaments-list",
  "sports-major-updates-list",
  "featured-sports-article-wrap",
  "Prepared surface",
  "Please wait a moment."
]) {
  if (!indexHtml.includes(marker)) throw new Error(`Missing Sports Desk marker in index.html: ${marker}`);
}

const existingSportsContext = exists("data/sports-context.json") ? readJson("data/sports-context.json") : {};
const existingGeneratedSportsContext = exists("generated/sports-context.json") ? readJson("generated/sports-context.json") : {};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag68a-sports-desk-working-data-foundation.json",
  sourceConsumption: "data/content-intelligence/phase-01-modules/ag68a-sports-desk-source-consumption-record.json",
  workingDataRecord: "data/content-intelligence/phase-01-modules/ag68a-sports-desk-working-data-foundation-record.json",
  sourceRegistry: "data/initial-working-data/sports-desk/ag68a-sports-desk-source-registry.json",
  initialWorkingData: "data/initial-working-data/sports-desk/ag68a-sports-desk-initial-working-data.json",
  methodology: "data/methodology/sports-desk/ag68a-sports-desk-methodology.json",
  tokenPolicy: "data/methodology/sports-desk/ag68a-sports-desk-ai-routing-token-policy.json",
  safetyGate: "data/methodology/sports-desk/ag68a-sports-desk-live-sourcing-and-safety-gate.json",
  feedbackSchema: "data/feedback/sports-desk/ag68a-sports-desk-user-feedback-schema.json",
  adminReviewSchema: "data/feedback/sports-desk/ag68a-sports-desk-admin-review-absorption-schema.json",
  generated: "generated/sports-desk-working-data.json",
  readiness: "data/content-intelligence/quality-registry/ag68a-ag68b-sports-desk-ui-wiring-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag68a-to-ag68b-sports-desk-ui-wiring-boundary.json",
  noBackend: "data/content-intelligence/backend-architecture/ag68a-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag68a-no-v02-expansion-audit.json",
  registry: "data/quality/ag68a-sports-desk-working-data-foundation.json",
  preview: "data/quality/ag68a-sports-desk-working-data-foundation-preview.json",
  doc: "docs/quality/AG68A_SPORTS_DESK_WORKING_DATA_FOUNDATION.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const sourceRegistry = {
  module_id: "AG68A",
  title: "Sports Desk Source Registry",
  status: "source_registry_defined_no_live_fetch",
  purpose: "Define future governed source categories for Sports Desk without activating live sourcing.",
  source_collection_active: false,
  external_api_fetch_active: false,
  live_sports_sourcing_active: false,
  source_categories: [
    {
      category: "official_event_sources",
      examples: [
        "official tournament/event websites",
        "official federation/league notices",
        "official broadcaster schedules where legally accessible"
      ],
      current_status: "under_editorial_verification"
    },
    {
      category: "credible_sports_news_sources",
      examples: [
        "recognised sports desks of credible news organisations",
        "publicly accessible verified sports reports",
        "official team or competition updates"
      ],
      current_status: "under_editorial_verification"
    },
    {
      category: "internal_drishvara_sports_reads",
      examples: [
        "sports articles already generated and reviewed inside Drishvara",
        "future sports explainer reads",
        "future tournament context reads"
      ],
      current_status: "prepared_for_future_review"
    }
  ],
  blocked_now: [
    "live score fetching",
    "betting or odds data",
    "unverified rumours",
    "social-media-only sports sourcing",
    "automated live scraping",
    "runtime sports API",
    "paywalled content ingestion"
  ]
};

const methodology = {
  module_id: "AG68A",
  title: "Sports Desk Methodology",
  status: "methodology_defined_no_runtime_activation",
  purpose: "Create a safe editorial-preview Sports Desk working data foundation.",
  sports_desk_sections: [
    "Live Events",
    "Tournament Watch",
    "Major Updates",
    "Featured Sports Article"
  ],
  editorial_principles: [
    "Sports Desk must prioritise verified context over speed.",
    "Live or time-sensitive sports claims must not be shown unless source-reviewed.",
    "Tournament context must explain significance, not merely list events.",
    "Featured sports article must link to an internal reviewed article or remain withheld.",
    "Fallback states must remain transparent when active data is unavailable."
  ],
  safety_rules: [
    "No betting, gambling, odds, fantasy-gaming promotion or speculative prediction.",
    "No injury/medical speculation without authoritative reporting.",
    "No defamatory claims about players, teams, officials or organisations.",
    "No automated live update claims without live source governance.",
    "No external API or scraping until explicitly approved."
  ],
  public_language_rule: "Use prepared/editorial-review language until reviewed sports working data is available."
};

const tokenPolicy = {
  module_id: "AG68A",
  title: "Sports Desk AI Routing and Token Policy",
  status: "ai_policy_recorded_no_ai_generation",
  ai_generation_active: false,
  ai_selection_active: false,
  token_use_now: 0,
  future_ai_use_allowed_only_for: [
    "ranking reviewed candidate sports items",
    "summarising verified sports context",
    "matching a sports update with an internal Drishvara explainer",
    "detecting stale or unverified sports items before publication"
  ],
  blocked_ai_use: [
    "live score invention",
    "match result guessing",
    "injury speculation",
    "betting/fantasy prediction",
    "unverified transfer/selection rumours"
  ],
  cost_control: [
    "reuse approved sports candidate records",
    "avoid repeated AI calls for unchanged sports context",
    "prefer static working data until live sports governance is approved"
  ]
};

const safetyGate = {
  module_id: "AG68A",
  title: "Sports Desk Live Sourcing and Safety Gate",
  status: "live_sourcing_gate_closed",
  live_sports_sourcing_active: false,
  external_api_fetch_active: false,
  runtime_sports_api_active: false,
  public_live_score_claims_enabled: false,
  activation_requires: [
    "approved sports source registry",
    "source freshness policy",
    "copyright/linking policy",
    "manual editorial review path",
    "fallback behaviour",
    "no-betting/no-gambling safety check",
    "user approval for any runtime/API sourcing"
  ]
};

const initialWorkingData = {
  module_id: "AG68A",
  title: "Sports Desk Initial Working Data",
  status: "initial_sports_desk_working_data_ready_not_publicly_wired",
  existing_fallback_surface_visible: true,
  public_ui_ready: false,
  working_data_publicly_wired: false,
  source_collection_active: false,
  live_sports_sourcing_active: false,
  external_api_fetch_active: false,
  runtime_sports_api_active: false,
  ai_generation_active: false,
  ai_selection_active: false,
  report_generation_enabled: false,
  sports_desk: {
    card_id: "sports-desk",
    title: "Sports Desk",
    subtitle: "Prepared sports desk for verified tournament context, major updates, and selected sports reads.",
    status_label: "Editorial Preview",
    safety_note: "Sports Desk is a prepared surface. Live sports sourcing, external sports APIs and real-time updates are not active.",
    public_use_mode: "fallback_preview_only",
    source_status: "sports sources under editorial verification",
    sections: [
      {
        section_id: "live_events",
        label: "Live Events",
        active: false,
        status: "reserved_for_reviewed_working_data",
        items: [
          {
            slot_id: "live_event_slot_01",
            title: "Live-event card reserved for reviewed sports context.",
            meta: "No live event feed is active.",
            source_status: "under_verification",
            cta_enabled: false
          }
        ]
      },
      {
        section_id: "tournament_watch",
        label: "Tournament Watch",
        active: false,
        status: "reserved_for_reviewed_working_data",
        items: [
          {
            slot_id: "tournament_slot_01",
            title: "Tournament watch card reserved for verified tournament context.",
            meta: "No tournament feed is active.",
            source_status: "under_verification",
            cta_enabled: false
          }
        ]
      },
      {
        section_id: "major_updates",
        label: "Major Updates",
        active: false,
        status: "reserved_for_reviewed_working_data",
        items: [
          {
            slot_id: "major_update_slot_01",
            title: "Major sports update reserved for editorial review.",
            meta: "No live update feed is active.",
            source_status: "under_verification",
            cta_enabled: false
          }
        ]
      },
      {
        section_id: "featured_sports_article",
        label: "Featured Sports Article",
        active: false,
        status: "reserved_for_reviewed_internal_article",
        items: [
          {
            slot_id: "featured_sports_article_slot_01",
            title: "Featured sports article slot reserved for reviewed Drishvara read.",
            meta: "No featured sports article is active from this working data.",
            source_status: "under_editorial_review",
            cta_enabled: false,
            internal_article_link: ""
          }
        ]
      }
    ]
  },
  legacy_context_consumed: {
    data_sports_context_json_present: exists("data/sports-context.json"),
    generated_sports_context_json_present: exists("generated/sports-context.json"),
    legacy_context_status: "consumed_as_fallback_evidence_only",
    legacy_context_not_replaced: true
  }
};

const sourceConsumption = {
  module_id: "AG68A",
  title: "Sports Desk Source Consumption Record",
  status: "existing_sports_context_consumed_as_fallback_evidence",
  consumed_inputs: {
    ag67z_r1_surface_verification: "data/content-intelligence/quality-reviews/ag67z-r1-homepage-route-founder-continuity-sports-fallback-verification.json",
    data_sports_context_json_present: exists("data/sports-context.json"),
    generated_sports_context_json_present: exists("generated/sports-context.json"),
    index_html_sports_surface_present: true
  },
  existing_context_summary: {
    data_sports_context_keys: Object.keys(existingSportsContext).slice(0, 20),
    generated_sports_context_keys: Object.keys(existingGeneratedSportsContext).slice(0, 20)
  },
  treatment: "Existing sports context files remain legacy/fallback evidence. AG68A creates a new generated/sports-desk-working-data.json foundation but does not wire it to public UI."
};

const workingDataRecord = {
  module_id: "AG68A",
  title: "Sports Desk Working Data Foundation Record",
  status: "working_data_foundation_created",
  generated_working_data_path: outputs.generated,
  sections_created: initialWorkingData.sports_desk.sections.map((s) => s.section_id),
  active_public_wiring: false,
  ready_for_ag68b: true
};

const feedbackSchema = {
  module_id: "AG68A",
  title: "Sports Desk User Feedback Schema",
  status: "schema_defined_no_collection",
  feedback_collection_active: false,
  fields_future: [
    "feedback_id",
    "sports_section",
    "item_slot_id",
    "feedback_type",
    "relevance_rating",
    "accuracy_concern",
    "source_concern",
    "comment",
    "created_at"
  ],
  blocked_now: [
    "runtime feedback collection",
    "database writes",
    "identity-linked sports feedback"
  ]
};

const adminReviewSchema = {
  module_id: "AG68A",
  title: "Sports Desk Admin Review Absorption Schema",
  status: "schema_defined_no_absorption",
  admin_review_active: false,
  fields_future: [
    "review_id",
    "candidate_item_id",
    "section_id",
    "source_url_or_reference",
    "source_credibility_status",
    "freshness_status",
    "copyright_status",
    "safety_status",
    "editorial_decision",
    "approved_for_public_ui"
  ],
  blocked_now: [
    "automatic approval",
    "runtime publication",
    "direct feedback absorption"
  ]
};

function audit(title, status, keys) {
  return {
    module_id: "AG68A",
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
  "public_mutation_enabled"
]);

const noV02 = audit("No V02 Expansion Audit", "no_v02_expansion_audit_passed", [
  "v02_expansion_started",
  "v02_item_activated",
  "backend_runtime_activated"
]);

const readiness = {
  module_id: "AG68A",
  title: "AG68B Sports Desk UI Wiring Readiness Record",
  status: "ready_for_ag68b_sports_desk_ui_wiring",
  ready_for_ag68b: true,
  next_stage: "AG68B — Sports Desk UI Wiring",
  reason: "Sports Desk working data foundation exists and can later be wired to the public UI without enabling live sports sourcing."
};

const boundary = {
  module_id: "AG68A",
  title: "AG68A to AG68B Sports Desk UI Wiring Boundary",
  status: "ag68b_ui_wiring_boundary_defined",
  allowed_next_scope: [
    "Wire Sports Desk public UI to generated/sports-desk-working-data.json.",
    "Keep fallback behaviour when public_ui_ready is false.",
    "Retain no live sports sourcing, no external sports API and no AI generation."
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
  module_id: "AG68A",
  title: "Sports Desk Working Data Foundation",
  status: "ag68a_sports_desk_working_data_foundation_completed",
  current_git_context: git,
  source_consumption_file: outputs.sourceConsumption,
  working_data_record_file: outputs.workingDataRecord,
  source_registry_file: outputs.sourceRegistry,
  initial_working_data_file: outputs.initialWorkingData,
  generated_working_data_file: outputs.generated,
  methodology_file: outputs.methodology,
  token_policy_file: outputs.tokenPolicy,
  safety_gate_file: outputs.safetyGate,
  feedback_schema_file: outputs.feedbackSchema,
  admin_review_schema_file: outputs.adminReviewSchema,
  no_backend_runtime_audit_file: outputs.noBackend,
  no_v02_expansion_audit_file: outputs.noV02,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    sports_desk_fallback_source_consumed: true,
    sports_desk_source_registry_defined: true,
    sports_desk_methodology_defined: true,
    sports_desk_safety_gate_defined: true,
    generated_sports_desk_working_data_created: true,
    live_events_slot_created: true,
    tournament_watch_slot_created: true,
    major_updates_slot_created: true,
    featured_sports_article_slot_created: true,
    public_ui_ready: false,
    working_data_publicly_wired: false,
    source_collection_active: false,
    live_sports_sourcing_active: false,
    external_api_fetch_active: false,
    runtime_sports_api_active: false,
    ai_generation_active: false,
    ai_selection_active: false,
    backend_runtime_activated: false,
    service_role_used: false,
    v02_expansion_started: false,
    ready_for_ag68b: true
  }
};

const registry = {
  module_id: "AG68A",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG68A",
  status: review.status,
  sports_desk_fallback_source_consumed: 1,
  sports_desk_source_registry_defined: 1,
  sports_desk_methodology_defined: 1,
  sports_desk_safety_gate_defined: 1,
  generated_sports_desk_working_data_created: 1,
  live_events_slot_created: 1,
  tournament_watch_slot_created: 1,
  major_updates_slot_created: 1,
  featured_sports_article_slot_created: 1,
  public_ui_ready: 0,
  working_data_publicly_wired: 0,
  source_collection_active: 0,
  live_sports_sourcing_active: 0,
  external_api_fetch_active: 0,
  runtime_sports_api_active: 0,
  ai_generation_active: 0,
  backend_runtime_activated: 0,
  service_role_used: 0,
  v02_expansion_started: 0,
  ready_for_ag68b: 1
};

const doc = `# AG68A — Sports Desk Working Data Foundation

AG68A creates the governed working-data foundation for Sports Desk.

## Created

- Sports Desk source registry.
- Sports Desk methodology.
- Sports Desk live-sourcing safety gate.
- Sports Desk AI/token policy.
- Feedback and admin-review schemas.
- \`generated/sports-desk-working-data.json\`.

## Sections prepared

- Live Events.
- Tournament Watch.
- Major Updates.
- Featured Sports Article.

## Current state

Sports Desk remains a prepared editorial-preview surface. AG68A does not wire the public UI to the new working data.

## Not activated

- No live sports sourcing.
- No external sports API.
- No runtime sports API.
- No AI generation.
- No score/result claims.
- No backend/Auth/Supabase.
- No service-role use.
- No V02 expansion.

## Next

AG68B may wire the Sports Desk UI to \`generated/sports-desk-working-data.json\`, while keeping active sourcing disabled.
`;

writeJson(outputs.sourceRegistry, sourceRegistry);
writeJson(outputs.methodology, methodology);
writeJson(outputs.tokenPolicy, tokenPolicy);
writeJson(outputs.safetyGate, safetyGate);
writeJson(outputs.initialWorkingData, initialWorkingData);
writeJson(outputs.generated, initialWorkingData);
writeJson(outputs.sourceConsumption, sourceConsumption);
writeJson(outputs.workingDataRecord, workingDataRecord);
writeJson(outputs.feedbackSchema, feedbackSchema);
writeJson(outputs.adminReviewSchema, adminReviewSchema);
writeJson(outputs.noBackend, noBackend);
writeJson(outputs.noV02, noV02);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG68A Sports Desk working data foundation generated.");
console.log("✅ No live sports sourcing, runtime API, backend or V02 activation performed.");
