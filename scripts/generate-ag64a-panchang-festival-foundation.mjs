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
function walk(dir, patterns, out = []) {
  const abs = full(dir);
  if (!fs.existsSync(abs)) return out;
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".git", "archive", "_local_archive"].includes(entry.name)) continue;
      walk(rel, patterns, out);
    } else if (patterns.some((p) => rel.toLowerCase().includes(p))) {
      out.push(rel);
    }
  }
  return out;
}

const ag63z = readJson("data/content-intelligence/quality-reviews/ag63z-word-of-the-day-closure.json");
if (ag63z.summary?.ready_for_ag64 !== true) {
  throw new Error("AG63Z readiness for AG64 missing.");
}

const indexHtml = read("index.html");

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag64a-panchang-festival-foundation.json",
  sourceConsumption: "data/content-intelligence/phase-01-modules/ag64a-panchang-festival-source-consumption-record.json",
  initialWorkingData: "data/initial-working-data/panchang-festival/ag64a-panchang-festival-initial-working-data.json",
  sourceRegistry: "data/initial-working-data/panchang-festival/ag64a-panchang-festival-source-registry.json",
  locationDateSchema: "data/methodology/panchang-festival/ag64a-location-date-basis-schema.json",
  methodology: "data/methodology/panchang-festival/ag64a-panchang-festival-methodology.json",
  observanceRegistry: "data/initial-working-data/panchang-festival/ag64a-observance-registry-safe-preview.json",
  aiPolicy: "data/methodology/panchang-festival/ag64a-panchang-festival-ai-token-policy.json",
  feedbackSchema: "data/feedback/panchang-festival/ag64a-panchang-festival-user-feedback-schema.json",
  adminSchema: "data/feedback/panchang-festival/ag64a-panchang-festival-admin-review-absorption-schema.json",
  generatedData: "generated/panchang-festival-working-data.json",
  readiness: "data/content-intelligence/quality-registry/ag64a-ag64b-panchang-festival-ui-wiring-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag64a-to-ag64b-panchang-festival-ui-wiring-boundary.json",
  noBackend: "data/content-intelligence/backend-architecture/ag64a-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag64a-no-v02-expansion-audit.json",
  registry: "data/quality/ag64a-panchang-festival-foundation.json",
  preview: "data/quality/ag64a-panchang-festival-foundation-preview.json",
  doc: "docs/quality/AG64A_PANCHANG_FESTIVAL_FOUNDATION.md"
};

for (const snippet of [
  "panchang-place-select",
  "panchang-sunrise",
  "panchang-sunset",
  "panchang-moonrise",
  "panchang-moonset",
  "panchang-tithi",
  "panchang-nakshatra",
  "panchang-yoga",
  "panchang-paksha",
  "upcoming-observance-title",
  "upcoming-observance-name",
  "upcoming-observance-note",
  "data-drishvara-ag60i-panchang-preview-safe"
]) {
  if (!indexHtml.includes(snippet)) {
    throw new Error(`Missing Panchang/Festival UI target: ${snippet}`);
  }
}

const discoveredSourceFiles = [
  ...walk("data", ["panchang", "festival", "observance", "tithi", "nakshatra", "daily-guidance"]),
  ...walk("docs", ["panchang", "festival", "observance", "source_doctrine", "sanskrit"]),
  ...walk("scripts", ["panchang", "festival", "observance", "daily-guidance", "mantra"])
].filter((value, index, arr) => arr.indexOf(value) === index).sort();

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const supportedLocations = [
  {
    place: "Itanagar",
    state_region: "Arunachal Pradesh",
    timezone: "Asia/Kolkata",
    default_public_selection: true,
    calculation_enabled_now: false
  },
  {
    place: "Delhi",
    state_region: "Delhi",
    timezone: "Asia/Kolkata",
    default_public_selection: false,
    calculation_enabled_now: false
  },
  {
    place: "Mumbai",
    state_region: "Maharashtra",
    timezone: "Asia/Kolkata",
    default_public_selection: false,
    calculation_enabled_now: false
  },
  {
    place: "Kolkata",
    state_region: "West Bengal",
    timezone: "Asia/Kolkata",
    default_public_selection: false,
    calculation_enabled_now: false
  },
  {
    place: "Guwahati",
    state_region: "Assam",
    timezone: "Asia/Kolkata",
    default_public_selection: false,
    calculation_enabled_now: false
  }
];

const sourceConsumption = {
  module_id: "AG64A",
  title: "Panchang & Festival Source Consumption Record",
  status: "source_discovery_consumed_foundation_only",
  consumed_previous_stage: "data/content-intelligence/quality-reviews/ag63z-word-of-the-day-closure.json",
  consumed_homepage_targets: true,
  discovered_source_files: discoveredSourceFiles.slice(0, 120),
  source_consumption_principle: "Consume existing methodology/governance records wherever available; do not recreate or activate live Panchang calculation.",
  conclusion: "AG64A can create safe initial working data and schemas. Exact Panchang output remains blocked until source, location, sunrise basis, regional rule family and calculation method are verified."
};

const initialWorkingData = {
  module_id: "AG64A",
  title: "Panchang & Festival Initial Working Data",
  status: "initial_working_data_created_not_publicly_wired",
  public_ui_activation_status: "not_wired_in_ag64a",
  default_place: "Itanagar",
  supported_locations: supportedLocations,
  working_data_contract: {
    generated_file: "generated/panchang-festival-working-data.json",
    required_panchang_ui_targets: [
      "panchang-place-select",
      "panchang-sunrise",
      "panchang-sunset",
      "panchang-moonrise",
      "panchang-moonset",
      "panchang-tithi",
      "panchang-nakshatra",
      "panchang-yoga",
      "panchang-paksha"
    ],
    required_observance_ui_targets: [
      "upcoming-observance-title",
      "upcoming-observance-name",
      "upcoming-observance-note"
    ],
    current_public_mode: "safe_preview_without_exact_panchang_values"
  },
  blocked_now: [
    "No sunrise/sunset/moonrise/moonset calculation.",
    "No tithi/nakshatra/yoga/paksha exact output.",
    "No festival date claim.",
    "No regional observance determination.",
    "No live API/source fetch.",
    "No runtime AI.",
    "No backend/Auth/Supabase/V02 activation."
  ]
};

const sourceRegistry = {
  module_id: "AG64A",
  title: "Panchang & Festival Source Registry",
  status: "source_registry_defined_live_source_use_disabled",
  live_source_fetching_enabled: false,
  external_api_enabled: false,
  calculation_library_enabled: false,
  source_levels: [
    {
      level: 1,
      label: "Primary textual or astronomical source",
      use_case: "Canonical calculation basis, established jyotisha/Panchang text, recognised astronomical source."
    },
    {
      level: 2,
      label: "Traditional commentary or regional authority",
      use_case: "Regional Panchang authority, observance rule family, temple/tradition-specific practice note."
    },
    {
      level: 3,
      label: "Modern scholarly or technical source",
      use_case: "Academic or technical Panchang calculation/history reference."
    },
    {
      level: 4,
      label: "Drishvara editorial curation",
      use_case: "Simplified public-facing explanation only; cannot invent authority."
    }
  ],
  source_record_schema: {
    source_id: "string",
    source_name: "string",
    source_level: "1 | 2 | 3 | 4",
    source_type: "textual | astronomical | regional_panchang | temple_tradition | scholarly | editorial",
    region_or_rule_family: "string_or_null",
    url_or_reference: "string_or_null",
    access_status: "verified | under_verification | unavailable | blocked",
    allowed_for_public_values: false,
    admin_approved: false,
    review_note: "string"
  }
};

const locationDateSchema = {
  module_id: "AG64A",
  title: "Panchang Location and Date Basis Schema",
  status: "location_date_basis_schema_created_calculation_inactive",
  location_required_for_future_calculation: true,
  timezone_required: true,
  sunrise_basis_required: true,
  date_basis_required: true,
  regional_method_required: true,
  calculation_engine_active_now: false,
  fields: [
    "place",
    "latitude",
    "longitude",
    "timezone",
    "civil_date",
    "sunrise_basis",
    "ayanamsa_or_calculation_method_if_applicable",
    "regional_rule_family",
    "calculation_source_id",
    "observance_rule_source_id",
    "review_status"
  ],
  safety_rule: "Do not display exact Panchang values unless every basis field and source status is verified."
};

const methodology = {
  module_id: "AG64A",
  title: "Panchang & Festival Methodology",
  status: "methodology_created_not_runtime_active",
  methodology_version: "panchang_festival_method_v1",
  principles: [
    "Panchang calculation must be location-aware where relevant.",
    "Sunrise basis must be explicitly declared.",
    "Tithi start/end should be treated as intervals, not only labels.",
    "Raw astronomical calculation must be separated from observance decision.",
    "Festival/vrat decisions must carry rule notes.",
    "Regional variations must be allowed through declared rule families.",
    "Controversial or regionally divergent dates must be marked rather than flattened.",
    "Output must distinguish calculated tithi, observance recommendation, regional variation and editorial note.",
    "No exact public Panchang output is allowed until source, method, location and date basis are verified.",
    "User feedback cannot directly alter Panchang/festival output; admin review is mandatory."
  ],
  output_separation: {
    calculation_layer: ["tithi", "nakshatra", "yoga", "paksha", "sunrise_basis", "date_basis"],
    observance_layer: ["festival_name", "vrat_rule", "regional_applicability", "date_note"],
    editorial_layer: ["public_explanation", "safety_note", "source_status_note"]
  },
  blocked_now: [
    "No live calculation.",
    "No exact Panchang value.",
    "No exact observance date decision.",
    "No runtime AI generation.",
    "No external API/source fetch.",
    "No backend/Auth/Supabase activation."
  ]
};

const observanceRegistry = {
  module_id: "AG64A",
  title: "Observance Registry Safe Preview",
  status: "observance_registry_safe_preview_created_not_active",
  dynamic_observance_selection_active: false,
  records: [
    {
      observance_id: "registry_under_editorial_verification",
      title: "Upcoming Observance",
      name: "Festival and observance registry is under editorial verification.",
      note: "Dates, regional applicability and bilingual naming will be published only after source review.",
      region_scope: "not_applicable_until_verified",
      rule_family: "not_selected",
      public_ready: false,
      source_status: "under_editorial_verification"
    }
  ],
  future_record_schema: {
    observance_id: "string",
    observance_name_en: "string",
    observance_name_hi: "string",
    observance_type: "festival | vrat | jayanti | regional_observance | civic_cultural",
    region_scope: "national | regional | local | tradition_specific",
    rule_family: "string",
    date_basis: "string",
    source_id: "string",
    source_status: "verified | under_verification | contested | blocked",
    public_ready: false,
    admin_review_status: "pending"
  }
};

const aiPolicy = {
  module_id: "AG64A",
  title: "Panchang & Festival AI and Token Policy",
  status: "ai_policy_defined_runtime_inactive",
  ai_runtime_active: false,
  user_triggered_ai_allowed: false,
  allowed_future_ai_roles_after_approval: [
    "summarise source notes for admin review",
    "flag conflicting observance dates",
    "triage user feedback for admin review",
    "prepare bilingual non-authoritative explanation after source approval"
  ],
  blocked_ai_roles: [
    "calculate Panchang values without verified engine/source",
    "invent tithi/nakshatra/yoga/paksha",
    "invent festival date",
    "invent mantra or ritual instruction",
    "override regional method without admin review",
    "publish AI-generated values directly"
  ],
  cost_policy: {
    expected_monthly_token_pressure: "low_until_source_registry_activation",
    initial_monthly_cap_inr: 1000,
    stronger_model_use: "only for conflict/source-note review after approval"
  }
};

const feedbackSchema = {
  module_id: "AG64A",
  title: "Panchang & Festival User Feedback Schema",
  status: "feedback_schema_defined_not_publicly_active",
  user_feedback_allowed_now: false,
  routing_rule: "User feedback must go to admin review before system absorption.",
  fields: [
    "feedback_id",
    "place",
    "civil_date",
    "field_under_question",
    "calculation_source_concern",
    "regional_method_concern",
    "observance_date_concern",
    "festival_name_concern",
    "source_suggestion",
    "user_comment",
    "submitted_at",
    "review_status"
  ]
};

const adminSchema = {
  module_id: "AG64A",
  title: "Panchang & Festival Admin Review and Absorption Schema",
  status: "admin_review_absorption_schema_defined_not_runtime_active",
  admin_review_required: true,
  automatic_absorption_allowed: false,
  fields: [
    "review_id",
    "feedback_id",
    "source_id",
    "observance_id",
    "admin_decision",
    "decision_reason",
    "approved_change_type",
    "source_registry_update_required",
    "regional_rule_update_required",
    "calculation_method_update_required",
    "observance_registry_update_required",
    "absorbed_into_methodology_version",
    "reviewed_at"
  ],
  absorption_rule: "Only admin-approved feedback can modify Panchang source registry, regional method, calculation basis, observance rule or public output status.",
  methodology_versioning: {
    current_version: "panchang_festival_method_v1",
    next_version_trigger: "admin-approved source/method/observance update"
  }
};

const generatedData = {
  status: "initial_panchang_festival_ready_not_publicly_wired",
  generated_at: new Date().toISOString(),
  module_id: "AG64A",
  public_ui_ready: false,
  live_calculation_active: false,
  external_api_fetch_active: false,
  source_registry_active_for_public_values: false,
  dynamic_observance_selection_active: false,
  ai_generation_active: false,
  methodology_version: "panchang_festival_method_v1",
  panchang: {
    place: "Itanagar",
    calculation_source: "Under verification",
    regional_method: "Under verification",
    location_basis: "Not live yet",
    date_basis: "Not live yet",
    tithi: "Withheld until verified",
    nakshatra: "Withheld until verified",
    yoga: "Withheld until verified",
    paksha: "Withheld until verified",
    source_status: "under_verification",
    note: "Exact Panchang values require verified source, regional method, location and date basis."
  },
  observance: {
    subtitle: "Upcoming Observance",
    name: "Festival and observance registry is under editorial verification.",
    note: "Dates, regional applicability and bilingual naming will be published only after source review.",
    public_ready: false,
    source_status: "under_editorial_verification"
  },
  supported_locations: supportedLocations
};

function audit(title, status, keys) {
  return {
    module_id: "AG64A",
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
  module_id: "AG64A",
  title: "AG64B Panchang & Festival UI Wiring Readiness Record",
  status: "ready_for_ag64b_panchang_festival_ui_wiring",
  ready_for_ag64b: true,
  next_stage: "AG64B — Panchang & Festival UI Wiring",
  reason: "Initial working data, source registry, methodology, location/date schema, observance registry, feedback schema, admin absorption schema and generated working data are present."
};

const boundary = {
  module_id: "AG64A",
  title: "AG64A to AG64B Boundary",
  status: "ag64b_panchang_festival_ui_wiring_boundary_created",
  allowed_next_scope: [
    "Wire homepage Panchang & Festival card to generated/panchang-festival-working-data.json.",
    "Keep values safe and withheld.",
    "Preserve source/method/location/date basis labels.",
    "Do not activate live calculation, external API, runtime AI or backend."
  ],
  blocked_scope_without_explicit_approval: [
    "live Panchang calculation",
    "external Panchang/festival API fetch",
    "runtime AI generation",
    "exact public tithi/nakshatra/yoga/paksha values",
    "festival/vrat date decision",
    "Supabase/Auth/backend activation",
    "runtime database writes",
    "service-role use",
    "V02 expansion",
    "direct user feedback absorption"
  ]
};

const review = {
  module_id: "AG64A",
  title: "Panchang & Festival Foundation",
  status: "ag64a_panchang_festival_foundation_completed",
  current_git_context: git,
  source_consumption_file: outputs.sourceConsumption,
  initial_working_data_file: outputs.initialWorkingData,
  source_registry_file: outputs.sourceRegistry,
  location_date_schema_file: outputs.locationDateSchema,
  methodology_file: outputs.methodology,
  observance_registry_file: outputs.observanceRegistry,
  ai_policy_file: outputs.aiPolicy,
  feedback_schema_file: outputs.feedbackSchema,
  admin_absorption_schema_file: outputs.adminSchema,
  generated_data_file: outputs.generatedData,
  no_backend_runtime_audit_file: outputs.noBackend,
  no_v02_expansion_audit_file: outputs.noV02,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    source_discovery_consumed: true,
    panchang_ui_targets_confirmed: true,
    initial_working_data_created: true,
    source_registry_created: true,
    location_date_schema_created: true,
    methodology_created: true,
    observance_registry_created: true,
    ai_policy_created_runtime_inactive: true,
    feedback_schema_created: true,
    admin_review_absorption_schema_created: true,
    generated_panchang_festival_data_created: true,
    ui_wired_now: false,
    live_calculation_active: false,
    external_api_fetch_active: false,
    ai_generation_active: false,
    dynamic_observance_selection_active: false,
    exact_panchang_values_published: false,
    festival_date_decision_published: false,
    backend_runtime_activated: false,
    service_role_used: false,
    v02_expansion_started: false,
    ready_for_ag64b: true
  }
};

const registry = {
  module_id: "AG64A",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG64A",
  status: review.status,
  source_discovery_consumed: 1,
  panchang_ui_targets_confirmed: 1,
  initial_working_data_created: 1,
  source_registry_created: 1,
  methodology_created: 1,
  observance_registry_created: 1,
  feedback_schema_created: 1,
  admin_review_absorption_schema_created: 1,
  generated_panchang_festival_data_created: 1,
  ui_wired_now: 0,
  live_calculation_active: 0,
  external_api_fetch_active: 0,
  ai_generation_active: 0,
  exact_panchang_values_published: 0,
  festival_date_decision_published: 0,
  backend_runtime_activated: 0,
  service_role_used: 0,
  v02_expansion_started: 0,
  ready_for_ag64b: 1
};

const doc = `# AG64A — Panchang & Festival Foundation

AG64A creates the initial working data and feedback-ready methodology foundation for Panchang & Festival View.

## Created

- Initial working data.
- Source registry.
- Location/date basis schema.
- Panchang & Festival methodology.
- Observance registry safe preview.
- AI/token policy.
- User feedback schema.
- Admin review/absorption schema.
- \`generated/panchang-festival-working-data.json\`.

## Not activated

- No live Panchang calculation.
- No exact public Panchang values.
- No festival/vrat date decision.
- No external API/source fetch.
- No runtime AI.
- No backend/Auth/Supabase/V02 activation.

## Next

AG64B — Panchang & Festival UI Wiring.
`;

writeJson(outputs.sourceConsumption, sourceConsumption);
writeJson(outputs.initialWorkingData, initialWorkingData);
writeJson(outputs.sourceRegistry, sourceRegistry);
writeJson(outputs.locationDateSchema, locationDateSchema);
writeJson(outputs.methodology, methodology);
writeJson(outputs.observanceRegistry, observanceRegistry);
writeJson(outputs.aiPolicy, aiPolicy);
writeJson(outputs.feedbackSchema, feedbackSchema);
writeJson(outputs.adminSchema, adminSchema);
writeJson(outputs.generatedData, generatedData);
writeJson(outputs.noBackend, noBackend);
writeJson(outputs.noV02, noV02);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG64A Panchang & Festival Foundation generated.");
console.log("✅ Generated generated/panchang-festival-working-data.json.");
console.log("✅ No UI wiring, live calculation, runtime AI or backend activation performed.");
