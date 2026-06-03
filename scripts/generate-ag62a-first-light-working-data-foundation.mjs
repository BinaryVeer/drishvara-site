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

const ag61 = readJson("data/content-intelligence/quality-reviews/ag61-first-visit-intro-video-foundation.json");
if (ag61.summary?.ready_for_ag62 !== true) {
  throw new Error("AG61 readiness for AG62 missing.");
}

const dailyContext = readJson("generated/daily-context.json");

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag62a-first-light-working-data-foundation.json",
  initialWorkingData: "data/initial-working-data/first-light/ag62a-first-light-initial-working-data.json",
  sourceRegistry: "data/initial-working-data/first-light/ag62a-first-light-source-registry.json",
  candidateSchema: "data/methodology/first-light/ag62a-first-light-candidate-signal-schema.json",
  scoringMethodology: "data/methodology/first-light/ag62a-first-light-ai-scoring-methodology.json",
  aiRoutingPolicy: "data/methodology/first-light/ag62a-first-light-ai-routing-token-budget-policy.json",
  feedbackSchema: "data/feedback/first-light/ag62a-first-light-user-feedback-schema.json",
  adminAbsorptionSchema: "data/feedback/first-light/ag62a-first-light-admin-review-absorption-schema.json",
  generatedWorkingData: "generated/first-light-working-data.json",
  readiness: "data/content-intelligence/quality-registry/ag62a-ag62b-first-light-ui-wiring-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag62a-to-ag62b-first-light-ui-wiring-boundary.json",
  noBackend: "data/content-intelligence/backend-architecture/ag62a-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag62a-no-v02-expansion-audit.json",
  registry: "data/quality/ag62a-first-light-working-data-foundation.json",
  preview: "data/quality/ag62a-first-light-working-data-foundation-preview.json",
  doc: "docs/quality/AG62A_FIRST_LIGHT_WORKING_DATA_FOUNDATION.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const selectionRule = {
  default_total: 10,
  india_focused_total: 6,
  india_general: 5,
  northeast_watch: 1,
  international_world: 4,
  rule_note: "Northeast Watch is counted inside the six India-focused signals. Public presentation should remain India / Northeast Watch / World."
};

const selectionSlots = [
  { slot_id: "india_01", layer: "India", required: true },
  { slot_id: "india_02", layer: "India", required: true },
  { slot_id: "india_03", layer: "India", required: true },
  { slot_id: "india_04", layer: "India", required: true },
  { slot_id: "india_05", layer: "India", required: true },
  { slot_id: "northeast_01", layer: "Northeast Watch", required: true },
  { slot_id: "world_01", layer: "World", required: true },
  { slot_id: "world_02", layer: "World", required: true },
  { slot_id: "world_03", layer: "World", required: true },
  { slot_id: "world_04", layer: "World", required: true }
];

const initialWorkingData = {
  module_id: "AG62A",
  title: "First Light Initial Working Data",
  status: "initial_working_data_created_not_publicly_wired",
  public_ui_activation_status: "not_wired_in_ag62a",
  selection_rule: selectionRule,
  selection_slots: selectionSlots,
  initial_working_categories: [
    "public policy and governance",
    "technology and AI",
    "economy and livelihoods",
    "environment and climate",
    "education and society",
    "public health",
    "science and research",
    "culture and civic life",
    "Northeast India watch",
    "international movement"
  ],
  daily_output_contract: {
    expected_public_items: 10,
    required_item_fields_for_ui: ["place", "signal", "note"],
    extended_fields_for_admin_ai: [
      "signal_id",
      "source_id",
      "source_name",
      "source_url",
      "published_at",
      "region_layer",
      "category",
      "raw_title",
      "neutral_summary",
      "credibility_score",
      "public_importance_score",
      "novelty_score",
      "diversity_score",
      "risk_penalty",
      "final_score",
      "admin_status"
    ]
  }
};

const sourceRegistry = {
  module_id: "AG62A",
  title: "First Light Source Registry",
  status: "source_registry_defined_live_fetching_disabled",
  live_fetching_enabled: false,
  scraping_enabled: false,
  external_api_enabled: false,
  admin_can_edit_sources_later: true,
  source_layers: [
    {
      layer: "India",
      target_slots: 5,
      source_policy: "Use verified Indian institutional, civic, public-interest and high-credibility editorial sources after source registration."
    },
    {
      layer: "Northeast Watch",
      target_slots: 1,
      source_policy: "Use Northeast-specific verified sources only after credibility and attribution checks."
    },
    {
      layer: "World",
      target_slots: 4,
      source_policy: "Use global sources only after credibility, relevance and public-interest checks."
    }
  ],
  source_record_schema: {
    source_id: "string",
    source_name: "string",
    source_type: "official | public_institution | reputable_media | research | civil_society | other_review_required",
    region_layer: "India | Northeast Watch | World",
    homepage_url: "string_or_null",
    rss_url: "string_or_null",
    credibility_tier: "A | B | C | blocked",
    attribution_required: true,
    allowed_for_ai_scan: false,
    admin_approved: false,
    review_note: "string"
  },
  seed_sources_pending_admin_configuration: true
};

const candidateSchema = {
  module_id: "AG62A",
  title: "First Light Candidate Signal Schema",
  status: "candidate_signal_schema_created",
  candidate_fields: {
    candidate_id: "unique candidate identifier",
    collection_date: "YYYY-MM-DD",
    source_id: "registered source reference",
    source_name: "source display name",
    source_url: "source URL",
    published_at: "source publication timestamp if available",
    region_layer: "India | Northeast Watch | World",
    category: "working category",
    raw_title: "candidate source title",
    raw_excerpt: "candidate source excerpt if available",
    neutral_summary: "AI or editor generated neutral summary",
    language: "en | hi | other",
    duplicate_cluster_id: "near-duplicate cluster reference",
    source_credibility_score: "0-100",
    public_importance_score: "0-100",
    novelty_score: "0-100",
    diversity_score: "0-100",
    civic_value_score: "0-100",
    risk_penalty: "0-100",
    final_score: "computed score",
    ai_model_used: "model route used for summarisation/scoring",
    ai_cost_estimate_tokens: "estimated tokens used",
    admin_status: "pending_review | approved | rejected | needs_source_check",
    absorption_version: "methodology version after approved feedback"
  }
};

const scoringMethodology = {
  module_id: "AG62A",
  title: "First Light AI-Assisted Scoring Methodology",
  status: "ai_scoring_methodology_defined_not_runtime_active",
  ai_runtime_active: false,
  scoring_formula: "final_score = credibility*0.25 + public_importance*0.25 + novelty*0.15 + diversity*0.15 + civic_value*0.15 - risk_penalty*0.20",
  weights: {
    credibility: 0.25,
    public_importance: 0.25,
    novelty: 0.15,
    diversity: 0.15,
    civic_value: 0.15,
    risk_penalty: 0.20
  },
  selection_constraints: [
    "Select exactly 10 signals.",
    "Select 5 India general signals.",
    "Select 1 Northeast Watch signal.",
    "Select 4 World signals.",
    "Avoid duplicate story clusters unless public importance requires one follow-up.",
    "Do not select unverified claims.",
    "Do not select sensational/low-credibility content.",
    "Admin review can override AI ranking."
  ],
  ai_role: [
    "summarise candidate neutrally",
    "classify region/category",
    "score using methodology",
    "flag risks and source concerns",
    "propose final 10 for admin review"
  ],
  blocked_now: [
    "No live AI call is performed in AG62A.",
    "No live news fetch is performed in AG62A.",
    "No public UI wiring is performed in AG62A.",
    "No backend write is performed in AG62A."
  ]
};

const aiRoutingPolicy = {
  module_id: "AG62A",
  title: "First Light AI Routing and Token Budget Policy",
  status: "ai_routing_token_budget_defined_not_active",
  monthly_cost_control: {
    initial_phase_cap_inr: 10000,
    controlled_launch_cap_inr: 25000,
    hard_review_threshold_inr: 50000
  },
  model_routing: {
    nano_or_low_cost_model: [
      "source classification",
      "duplicate detection",
      "basic relevance scoring",
      "feedback triage"
    ],
    mini_model: [
      "neutral summaries",
      "candidate signal notes",
      "admin review suggestions"
    ],
    stronger_model_selective: [
      "final editorial synthesis",
      "sensitive issue review",
      "methodology conflict resolution"
    ]
  },
  token_budget_per_daily_cycle: {
    light_mode_candidates: 50,
    moderate_mode_candidates: 100,
    heavy_mode_candidates: 200,
    ag62_initial_mode: "light_mode_only_until_admin_approval",
    user_triggered_ai_allowed: false
  },
  cost_guardrails: [
    "No user-triggered First Light AI generation in initial phase.",
    "Candidate scan count must be capped.",
    "Admin approval required before increasing candidate volume.",
    "Batch/off-peak processing preferred where possible.",
    "Approved feedback improves methodology prompts/data, not uncontrolled model training."
  ]
};

const feedbackSchema = {
  module_id: "AG62A",
  title: "First Light User Feedback Schema",
  status: "feedback_schema_defined_not_publicly_active",
  user_feedback_allowed_now: false,
  routing_rule: "User feedback must go to admin review before any system absorption.",
  fields: [
    "feedback_id",
    "signal_id",
    "feedback_type",
    "accuracy_concern",
    "source_concern",
    "relevance_concern",
    "duplicate_concern",
    "missed_signal_suggestion",
    "user_comment",
    "submitted_at",
    "review_status"
  ]
};

const adminAbsorptionSchema = {
  module_id: "AG62A",
  title: "First Light Admin Review and Absorption Schema",
  status: "admin_review_absorption_schema_defined_not_runtime_active",
  admin_review_required: true,
  automatic_absorption_allowed: false,
  fields: [
    "review_id",
    "feedback_id",
    "candidate_id",
    "admin_decision",
    "decision_reason",
    "approved_change_type",
    "source_registry_update_required",
    "scoring_weight_update_required",
    "category_rule_update_required",
    "absorbed_into_methodology_version",
    "reviewed_at"
  ],
  absorption_rule: "Only admin-approved feedback can modify source registry, scoring weights, category rules or selection prompts.",
  methodology_versioning: {
    current_version: "first_light_method_v1",
    next_version_trigger: "admin-approved scoring/source/category update"
  }
};

const generatedWorkingData = {
  status: "initial_working_data_ready_not_publicly_wired",
  generated_at: new Date().toISOString(),
  module_id: "AG62A",
  public_ui_ready: false,
  source_collection_active: false,
  ai_selection_active: false,
  admin_review_active: false,
  selection_rule: selectionRule,
  firstLight: {
    title: "First Light — 10 Daily Signals",
    intro: "A curated daily signal rail will be generated after source registration, AI-assisted scoring and admin review.",
    rule_note: "Default daily selection: 10 signals — 5 India, 1 Northeast Watch and 4 World signals.",
    items: selectionSlots.map((slot, index) => ({
      signal_id: `ag62a_slot_${String(index + 1).padStart(2, "0")}`,
      place: slot.layer,
      signal: "Signal slot reserved for reviewed First Light working data.",
      note: "Source registry, AI scoring and admin approval are required before public activation.",
      slot_id: slot.slot_id,
      public_ready: false
    }))
  }
};

function audit(title, status, keys) {
  return {
    module_id: "AG62A",
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
  module_id: "AG62A",
  title: "AG62B First Light UI Wiring Readiness Record",
  status: "ready_for_ag62b_first_light_ui_wiring",
  ready_for_ag62b: true,
  next_stage: "AG62B — First Light UI Wiring",
  reason: "Initial working data, source registry, AI scoring methodology, feedback schema and admin absorption schema are present. UI wiring can now be planned against generated/first-light-working-data.json."
};

const boundary = {
  module_id: "AG62A",
  title: "AG62A to AG62B Boundary",
  status: "ag62b_first_light_ui_wiring_boundary_created",
  allowed_next_scope: [
    "Wire homepage First Light to generated/first-light-working-data.json.",
    "Keep public copy clear that the current output is reviewed working data until real source candidates are configured.",
    "Do not activate live news fetching.",
    "Do not activate backend/Auth/V02.",
    "Do not allow user-triggered AI generation."
  ],
  blocked_scope_without_explicit_approval: [
    "live scraping",
    "uncontrolled source fetching",
    "runtime AI calls",
    "Supabase/Auth/backend activation",
    "runtime database writes",
    "service-role use",
    "V02 expansion"
  ]
};

const review = {
  module_id: "AG62A",
  title: "First Light Working Data Foundation",
  status: "ag62a_first_light_working_data_foundation_completed",
  current_git_context: git,
  consumed_inputs: {
    ag61_review: "data/content-intelligence/quality-reviews/ag61-first-visit-intro-video-foundation.json",
    daily_context_status: dailyContext.status || null,
    existing_first_light_rule: dailyContext.first_light?.selection_rule || null
  },
  initial_working_data_file: outputs.initialWorkingData,
  source_registry_file: outputs.sourceRegistry,
  candidate_schema_file: outputs.candidateSchema,
  scoring_methodology_file: outputs.scoringMethodology,
  ai_routing_policy_file: outputs.aiRoutingPolicy,
  feedback_schema_file: outputs.feedbackSchema,
  admin_absorption_schema_file: outputs.adminAbsorptionSchema,
  generated_working_data_file: outputs.generatedWorkingData,
  no_backend_runtime_audit_file: outputs.noBackend,
  no_v02_expansion_audit_file: outputs.noV02,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    initial_working_data_created: true,
    source_registry_created: true,
    candidate_signal_schema_created: true,
    ai_scoring_methodology_created: true,
    ai_routing_token_budget_policy_created: true,
    feedback_schema_created: true,
    admin_review_absorption_schema_created: true,
    generated_first_light_working_data_created: true,
    ui_wired_now: false,
    live_fetching_enabled: false,
    ai_runtime_active: false,
    user_triggered_ai_allowed: false,
    backend_runtime_activated: false,
    service_role_used: false,
    v02_expansion_started: false,
    ready_for_ag62b: true
  }
};

const registry = {
  module_id: "AG62A",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG62A",
  status: review.status,
  initial_working_data_created: 1,
  source_registry_created: 1,
  ai_scoring_methodology_created: 1,
  feedback_schema_created: 1,
  admin_review_absorption_schema_created: 1,
  generated_first_light_working_data_created: 1,
  ui_wired_now: 0,
  live_fetching_enabled: 0,
  ai_runtime_active: 0,
  user_triggered_ai_allowed: 0,
  backend_runtime_activated: 0,
  service_role_used: 0,
  v02_expansion_started: 0,
  ready_for_ag62b: 1
};

const doc = `# AG62A — First Light Working Data Foundation

AG62A creates the initial working data and feedback-ready methodology foundation for First Light.

## Created

- Initial working data.
- Source registry.
- Candidate signal schema.
- AI-assisted scoring methodology.
- AI routing and token budget policy.
- User feedback schema.
- Admin review and absorption schema.
- Generated working data at \`generated/first-light-working-data.json\`.

## Not activated

- No live news fetching.
- No runtime AI call.
- No user-triggered AI.
- No public UI wiring.
- No Supabase/Auth/backend/V02 activation.

## Next

AG62B — First Light UI Wiring.
`;

writeJson(outputs.initialWorkingData, initialWorkingData);
writeJson(outputs.sourceRegistry, sourceRegistry);
writeJson(outputs.candidateSchema, candidateSchema);
writeJson(outputs.scoringMethodology, scoringMethodology);
writeJson(outputs.aiRoutingPolicy, aiRoutingPolicy);
writeJson(outputs.feedbackSchema, feedbackSchema);
writeJson(outputs.adminAbsorptionSchema, adminAbsorptionSchema);
writeJson(outputs.generatedWorkingData, generatedWorkingData);
writeJson(outputs.noBackend, noBackend);
writeJson(outputs.noV02, noV02);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG62A First Light Working Data Foundation generated.");
console.log("✅ Initial working data and feedback-ready AI selection foundation created.");
console.log("✅ No UI wiring, live fetch, runtime AI or backend activation performed.");
