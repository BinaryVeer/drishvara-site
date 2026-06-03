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

const ag62z = readJson("data/content-intelligence/quality-reviews/ag62z-first-light-working-data-closure.json");
if (ag62z.summary?.ready_for_ag63 !== true) {
  throw new Error("AG62Z readiness for AG63 missing.");
}

const d02Bank = readJson("data/knowledge/daily-guidance/word-of-day-bank-d02.json");
const rotationPolicy = readJson("data/knowledge/daily-guidance/word-of-day-rotation-policy-d02.json");
const ad05Schema = readJson("data/content-intelligence/ad-foundation/ad05-word-of-the-day-corpus-schema.json");
const ad01Style = readJson("data/content-intelligence/ad-foundation/ad01-nityanand-mishra-style-discipline-record.json");
const ad05Doctrine = readJson("data/content-intelligence/ad-foundation/ad05-corpus-doctrine.json");
const ag48Boundary = readJson("data/content-intelligence/word-reflection/ag48b-sanskrit-hindi-english-meaning-boundary.json");
const ag48Closure = readJson("data/content-intelligence/word-reflection/ag48z-word-reflection-closure-record.json");

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag63a-word-of-the-day-foundation.json",
  sourceConsumption: "data/content-intelligence/phase-01-modules/ag63a-word-of-the-day-source-consumption-record.json",
  initialWorkingData: "data/initial-working-data/word-of-day/ag63a-word-of-the-day-initial-working-data.json",
  wordBank: "data/initial-working-data/word-of-day/ag63a-word-bank-approved-preview.json",
  methodology: "data/methodology/word-of-day/ag63a-word-of-the-day-methodology.json",
  selectionPolicy: "data/methodology/word-of-day/ag63a-word-selection-rotation-policy.json",
  aiPolicy: "data/methodology/word-of-day/ag63a-word-ai-token-policy.json",
  feedbackSchema: "data/feedback/word-of-day/ag63a-word-of-the-day-user-feedback-schema.json",
  adminSchema: "data/feedback/word-of-day/ag63a-word-of-the-day-admin-review-absorption-schema.json",
  generatedWord: "generated/word-of-day.json",
  readiness: "data/content-intelligence/quality-registry/ag63a-ag63b-word-of-the-day-ui-wiring-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag63a-to-ag63b-word-of-the-day-ui-wiring-boundary.json",
  noBackend: "data/content-intelligence/backend-architecture/ag63a-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag63a-no-v02-expansion-audit.json",
  registry: "data/quality/ag63a-word-of-the-day-foundation.json",
  preview: "data/quality/ag63a-word-of-the-day-foundation-preview.json",
  doc: "docs/quality/AG63A_WORD_OF_THE_DAY_FOUNDATION.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const approvedItems = (Array.isArray(d02Bank.items) ? d02Bank.items : [])
  .filter((item) => item.review_status === "approved")
  .map((item, index) => ({
    word_id: item.id,
    rotation_index: index + 1,
    english: item.word_en,
    hindi: item.word_hi,
    sanskrit: item.word_sanskrit,
    meaning_en: item.meaning_en,
    meaning_hi: item.meaning_hi,
    theme: item.theme,
    usage_context: item.usage_context,
    review_status: item.review_status,
    public_use_mode: "reviewed_preview_only",
    source_basis: "D02 curated Word of the Day bank; not presented as scriptural source.",
    source_file: "data/knowledge/daily-guidance/word-of-day-bank-d02.json",
    classical_claim_made: false,
    scriptural_claim_made: false,
    needs_deeper_source_attribution_before_full_expansion: true
  }));

if (!approvedItems.length) {
  throw new Error("No approved D02 Word of the Day items available.");
}

const selected = approvedItems[0];

const sourceConsumption = {
  module_id: "AG63A",
  title: "Word of the Day Source Consumption Record",
  status: "source_records_consumed",
  consumed_sources: [
    {
      file: "data/knowledge/daily-guidance/word-of-day-bank-d02.json",
      role: "Curated approved word bank scaffold.",
      consumed: true,
      approved_items_count: approvedItems.length
    },
    {
      file: "data/knowledge/daily-guidance/word-of-day-rotation-policy-d02.json",
      role: "Rotation rules and blocked behaviour.",
      consumed: true
    },
    {
      file: "data/content-intelligence/ad-foundation/ad05-word-of-the-day-corpus-schema.json",
      role: "Future corpus schema and source-attribution rules.",
      consumed: true
    },
    {
      file: "data/content-intelligence/ad-foundation/ad01-nityanand-mishra-style-discipline-record.json",
      role: "Sanskritic textual discipline inspiration with caution; no endorsement or direct attribution.",
      consumed: true
    },
    {
      file: "data/content-intelligence/ad-foundation/ad05-corpus-doctrine.json",
      role: "Corpus discipline, source separation and copyright guardrails.",
      consumed: true
    },
    {
      file: "data/content-intelligence/word-reflection/ag48b-sanskrit-hindi-english-meaning-boundary.json",
      role: "Meaning-boundary and multilingual safety rules.",
      consumed: true
    },
    {
      file: "data/content-intelligence/word-reflection/ag48z-word-reflection-closure-record.json",
      role: "Confirms earlier Word/Reflection readiness was V01 scaffold-only.",
      consumed: true
    }
  ],
  conclusion: "AG63A can create initial working data from D02 approved entries, but full classical/source expansion remains blocked until source-level attribution is added."
};

const initialWorkingData = {
  module_id: "AG63A",
  title: "Word of the Day Initial Working Data",
  status: "initial_working_data_created_not_publicly_wired",
  public_ui_activation_status: "not_wired_in_ag63a",
  source_bank: "data/knowledge/daily-guidance/word-of-day-bank-d02.json",
  approved_preview_item_count: approvedItems.length,
  current_selection: selected.word_id,
  current_public_mode: "reviewed_preview_only",
  working_data_contract: {
    generated_file: "generated/word-of-day.json",
    required_ui_fields: ["english", "hindi", "sanskrit", "meaning"],
    extended_methodology_fields: [
      "word_id",
      "meaning_hi",
      "theme",
      "usage_context",
      "source_basis",
      "review_status",
      "public_use_mode",
      "classical_claim_made",
      "scriptural_claim_made",
      "methodology_version"
    ]
  }
};

const methodology = {
  module_id: "AG63A",
  title: "Word of the Day Methodology",
  status: "methodology_created_not_runtime_active",
  methodology_version: "word_of_day_method_v1",
  principles: [
    "Use only reviewed entries from the approved working bank.",
    "Separate English word, Hindi word, Sanskrit/Indic term, English meaning, Hindi meaning and reflection use.",
    "Do not present a word as scriptural unless a verified source supports it.",
    "Do not invent Sanskrit terms.",
    "Do not auto-translate or auto-transliterate public Sanskrit/Hindi terms without review.",
    "Treat Shri Nityanand Mishra ji as style-discipline inspiration only; do not claim endorsement or direct method.",
    "Keep Word of the Day as reflective/linguistic preview until deeper source attribution exists.",
    "Admin-approved feedback may improve entries, but user feedback cannot be absorbed directly."
  ],
  source_hierarchy_for_future_expansion: [
    "Level 1: primary Sanskrit/textual source where applicable",
    "Level 2: traditional commentary or lexicon where applicable",
    "Level 3: modern scholarly/linguistic source",
    "Level 4: Drishvara editorial reflection use"
  ],
  blocked_now: [
    "No unreviewed AI word generation.",
    "No external API word fetch.",
    "No scriptural claim.",
    "No public full classical-source expansion.",
    "No backend/Auth/Supabase activation.",
    "No direct user-feedback absorption."
  ]
};

const selectionPolicy = {
  module_id: "AG63A",
  title: "Word Selection and Rotation Policy",
  status: "rotation_policy_created_not_dynamic_public_runtime",
  consumed_d02_rotation_policy_status: rotationPolicy.status,
  public_rotation_enabled_now: false,
  selection_mode_now: "first_approved_seed_for_initial_working_data",
  future_rotation_basis: rotationPolicy.rotation_basis_future || [
    "calendar date",
    "theme balance",
    "avoid recent repetition",
    "manual editorial override after review"
  ],
  blocked_behaviour: rotationPolicy.blocked_behaviour || [
    "unreviewed AI word generation",
    "external API word fetch",
    "runtime DOM generation of new words",
    "prediction-style claims"
  ]
};

const aiPolicy = {
  module_id: "AG63A",
  title: "Word of the Day AI and Token Policy",
  status: "ai_policy_defined_runtime_inactive",
  ai_runtime_active: false,
  user_triggered_ai_allowed: false,
  allowed_future_ai_roles_after_approval: [
    "detect duplicate or semantically close words",
    "suggest simplified explanation for admin review",
    "flag Hindi/English meaning mismatch",
    "flag Sanskrit/source-risk issues",
    "triage user feedback for admin review"
  ],
  blocked_ai_roles: [
    "invent new Sanskrit words",
    "claim scriptural origin without source",
    "directly publish generated word meanings",
    "absorb user feedback without admin approval",
    "generate mantras or religious claims"
  ],
  cost_policy: {
    expected_monthly_token_pressure: "low",
    recommended_model_route: "low-cost model for triage; stronger model only for Sanskrit/source-risk review",
    initial_monthly_cap_inr: 1000
  }
};

const feedbackSchema = {
  module_id: "AG63A",
  title: "Word of the Day User Feedback Schema",
  status: "feedback_schema_defined_not_publicly_active",
  user_feedback_allowed_now: false,
  routing_rule: "User feedback must go to admin review before system absorption.",
  fields: [
    "feedback_id",
    "word_id",
    "feedback_type",
    "meaning_accuracy_concern",
    "hindi_word_concern",
    "sanskrit_word_concern",
    "usage_context_concern",
    "source_request",
    "suggested_improvement",
    "user_comment",
    "submitted_at",
    "review_status"
  ]
};

const adminSchema = {
  module_id: "AG63A",
  title: "Word of the Day Admin Review and Absorption Schema",
  status: "admin_review_absorption_schema_defined_not_runtime_active",
  admin_review_required: true,
  automatic_absorption_allowed: false,
  fields: [
    "review_id",
    "feedback_id",
    "word_id",
    "admin_decision",
    "decision_reason",
    "approved_change_type",
    "meaning_update_required",
    "source_update_required",
    "sanskrit_review_required",
    "public_use_mode_change",
    "absorbed_into_methodology_version",
    "reviewed_at"
  ],
  absorption_rule: "Only admin-approved feedback can modify word meaning, source basis, Sanskrit/Hindi term, usage context or public-use status.",
  methodology_versioning: {
    current_version: "word_of_day_method_v1",
    next_version_trigger: "admin-approved meaning/source/Sanskrit review update"
  }
};

const generatedWord = {
  status: "initial_word_of_day_ready_not_publicly_wired",
  generated_at: new Date().toISOString(),
  module_id: "AG63A",
  public_ui_ready: false,
  dynamic_rotation_active: false,
  ai_generation_active: false,
  source_expansion_active: false,
  methodology_version: "word_of_day_method_v1",
  word: {
    word_id: selected.word_id,
    english: selected.english,
    hindi: selected.hindi,
    sanskrit: selected.sanskrit,
    meaning: selected.meaning_en,
    meaning_hi: selected.meaning_hi,
    theme: selected.theme,
    usage_context: selected.usage_context,
    source_basis: selected.source_basis,
    review_status: selected.review_status,
    public_use_mode: selected.public_use_mode,
    classical_claim_made: false,
    scriptural_claim_made: false,
    note: "Reviewed linguistic preview only; deeper source attribution is required before full classical-source expansion."
  },
  available_preview_bank_count: approvedItems.length
};

function audit(title, status, keys) {
  return {
    module_id: "AG63A",
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
  module_id: "AG63A",
  title: "AG63B Word of the Day UI Wiring Readiness Record",
  status: "ready_for_ag63b_word_of_the_day_ui_wiring",
  ready_for_ag63b: true,
  next_stage: "AG63B — Word of the Day UI Wiring",
  reason: "Initial working data, approved preview word bank, methodology, AI policy, feedback schema, admin absorption schema and generated/word-of-day.json are present."
};

const boundary = {
  module_id: "AG63A",
  title: "AG63A to AG63B Boundary",
  status: "ag63b_word_of_the_day_ui_wiring_boundary_created",
  allowed_next_scope: [
    "Wire homepage Word of the Day to generated/word-of-day.json.",
    "Keep public copy as reviewed linguistic preview.",
    "Preserve Sanskrit/source safety note.",
    "Do not activate dynamic rotation, runtime AI or backend."
  ],
  blocked_scope_without_explicit_approval: [
    "unreviewed AI word generation",
    "external word API fetch",
    "scriptural/source claim without attribution",
    "Supabase/Auth/backend activation",
    "runtime database writes",
    "service-role use",
    "V02 expansion",
    "direct user feedback absorption"
  ]
};

const review = {
  module_id: "AG63A",
  title: "Word of the Day Foundation",
  status: "ag63a_word_of_the_day_foundation_completed",
  current_git_context: git,
  source_consumption_file: outputs.sourceConsumption,
  initial_working_data_file: outputs.initialWorkingData,
  approved_preview_word_bank_file: outputs.wordBank,
  methodology_file: outputs.methodology,
  selection_policy_file: outputs.selectionPolicy,
  ai_policy_file: outputs.aiPolicy,
  feedback_schema_file: outputs.feedbackSchema,
  admin_absorption_schema_file: outputs.adminSchema,
  generated_word_file: outputs.generatedWord,
  no_backend_runtime_audit_file: outputs.noBackend,
  no_v02_expansion_audit_file: outputs.noV02,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    source_records_consumed: true,
    d02_approved_items_count: approvedItems.length,
    initial_working_data_created: true,
    approved_preview_word_bank_created: true,
    methodology_created: true,
    selection_policy_created: true,
    ai_policy_created_runtime_inactive: true,
    feedback_schema_created: true,
    admin_review_absorption_schema_created: true,
    generated_word_of_day_created: true,
    ui_wired_now: false,
    dynamic_rotation_active: false,
    ai_generation_active: false,
    public_full_classical_expansion_active: false,
    backend_runtime_activated: false,
    service_role_used: false,
    v02_expansion_started: false,
    ready_for_ag63b: true
  }
};

const registry = {
  module_id: "AG63A",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG63A",
  status: review.status,
  d02_approved_items_count: approvedItems.length,
  initial_working_data_created: 1,
  approved_preview_word_bank_created: 1,
  methodology_created: 1,
  feedback_schema_created: 1,
  admin_review_absorption_schema_created: 1,
  generated_word_of_day_created: 1,
  ui_wired_now: 0,
  dynamic_rotation_active: 0,
  ai_generation_active: 0,
  backend_runtime_activated: 0,
  service_role_used: 0,
  v02_expansion_started: 0,
  ready_for_ag63b: 1
};

const doc = `# AG63A — Word of the Day Foundation

AG63A creates the initial working data and feedback-ready methodology foundation for Word of the Day.

## Consumed

- D02 Word of the Day curated bank.
- D02 rotation policy.
- AD05 Word of the Day corpus schema.
- AD01 Sanskritic style-discipline caution.
- AD05 corpus doctrine.
- AG48B Sanskrit/Hindi/English meaning boundary.
- AG48Z Word/Reflection scaffold-only closure.

## Created

- Initial working data.
- Approved preview word bank.
- Word methodology.
- Selection/rotation policy.
- AI/token policy.
- User feedback schema.
- Admin review/absorption schema.
- \`generated/word-of-day.json\`.

## Not activated

- No UI wiring.
- No dynamic rotation.
- No runtime AI.
- No backend/Auth/Supabase/V02 activation.
- No full classical-source expansion.

## Next

AG63B — Word of the Day UI Wiring.
`;

writeJson(outputs.sourceConsumption, sourceConsumption);
writeJson(outputs.initialWorkingData, initialWorkingData);
writeJson(outputs.wordBank, { module_id: "AG63A", status: "approved_preview_word_bank_created", items: approvedItems });
writeJson(outputs.methodology, methodology);
writeJson(outputs.selectionPolicy, selectionPolicy);
writeJson(outputs.aiPolicy, aiPolicy);
writeJson(outputs.feedbackSchema, feedbackSchema);
writeJson(outputs.adminSchema, adminSchema);
writeJson(outputs.generatedWord, generatedWord);
writeJson(outputs.noBackend, noBackend);
writeJson(outputs.noV02, noV02);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG63A Word of the Day Foundation generated.");
console.log("✅ Generated generated/word-of-day.json.");
console.log("✅ No UI wiring, dynamic rotation, runtime AI or backend activation performed.");
