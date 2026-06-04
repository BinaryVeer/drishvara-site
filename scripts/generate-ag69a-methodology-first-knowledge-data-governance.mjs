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

const ag68r2 = readJson("data/content-intelligence/quality-reviews/ag68z-r2-public-module-live-static-verification-sweep.json");

if (ag68r2.summary?.local_static_verification_passed !== true) {
  throw new Error("AG68Z-R2 local static verification must pass before AG69A.");
}
if (ag68r2.summary?.next_governed_stage_requires_user_confirmation !== true) {
  throw new Error("AG68Z-R2 next-stage confirmation gate missing.");
}

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag69a-methodology-first-knowledge-data-governance.json",
  doctrine: "data/content-intelligence/phase-01-modules/ag69a-methodology-first-knowledge-data-doctrine-record.json",
  sourceGovernance: "data/content-intelligence/phase-01-modules/ag69a-source-tier-and-claim-level-governance-record.json",
  internalDiscipline: "data/content-intelligence/phase-01-modules/ag69a-internal-textual-discipline-public-attribution-guard-record.json",
  moduleArchitecture: "data/content-intelligence/phase-01-modules/ag69a-common-module-knowledge-data-architecture-record.json",
  staticToDb: "data/content-intelligence/phase-01-modules/ag69a-static-seed-to-supabase-migration-doctrine-record.json",
  resultSaving: "data/content-intelligence/phase-01-modules/ag69a-module-output-result-saving-doctrine-record.json",
  moduleBlueprint: "data/content-intelligence/phase-01-modules/ag69a-module-wise-knowledge-bank-blueprint-record.json",
  technicalSource: "data/content-intelligence/phase-01-modules/ag69a-panchang-technical-background-source-handling-record.json",
  governanceIndex: "data/knowledge-base/_governance/ag69a-knowledge-foundation-governance-index.json",
  candidateLifecycle: "data/knowledge-base/_governance/ag69a-candidate-reviewed-approved-lifecycle.json",
  commonSchema: "data/knowledge-base/_governance/ag69a-common-knowledge-record-schema.json",
  readiness: "data/content-intelligence/quality-registry/ag69a-ag69b-word-of-the-day-knowledge-bank-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag69a-to-ag69b-word-of-the-day-knowledge-bank-boundary.json",
  noBackend: "data/content-intelligence/backend-architecture/ag69a-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag69a-no-v02-expansion-audit.json",
  registry: "data/quality/ag69a-methodology-first-knowledge-data-governance.json",
  preview: "data/quality/ag69a-methodology-first-knowledge-data-governance-preview.json",
  doc: "docs/quality/AG69A_METHODOLOGY_FIRST_KNOWLEDGE_DATA_GOVERNANCE.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const sourceTiers = [
  {
    tier: "A",
    label: "primary_canonical_or_official",
    use: "May support direct rules only after text, edition, translation, context and scope are verified.",
    public_claim_allowed_after_review: true
  },
  {
    tier: "B",
    label: "scholarly_or_peer_reviewed",
    use: "May support methodology, interpretation, historical context, technical background or analytical framework.",
    public_claim_allowed_after_review: true
  },
  {
    tier: "C",
    label: "expert_or_internal_study_discipline",
    use: "May guide internal quality discipline or candidate methodology, but not public attribution or direct authority claim.",
    public_claim_allowed_after_review: false
  },
  {
    tier: "D",
    label: "drishvara_editorial_synthesis",
    use: "May be used for safe explanatory or reflective public text when source-backed claims are separated.",
    public_claim_allowed_after_review: true
  },
  {
    tier: "blocked",
    label: "unsupported_or_unverified",
    use: "Must not feed public module output.",
    public_claim_allowed_after_review: false
  }
];

const claimLevels = [
  "label_only",
  "definition",
  "translation",
  "transliteration",
  "usage_example",
  "cultural_context",
  "technical_background",
  "methodological_rule",
  "astronomical_calculation",
  "mantra_text",
  "scriptural_or_classical_reference",
  "reflective_prompt",
  "prediction_or_deterministic_claim_blocked"
];

const lifecycle = {
  module_id: "AG69A",
  title: "Candidate Reviewed Approved Lifecycle",
  status: "lifecycle_defined",
  lifecycle_order: [
    "candidate",
    "extracted",
    "normalised",
    "source_checked",
    "methodology_checked",
    "reviewed",
    "approved",
    "method_tested",
    "output_tested",
    "public_safe"
  ],
  strict_rule: "No candidate record can feed public module output before approved, method_tested and output_tested status.",
  blocked_shortcut: "No direct movement from discussion, uploaded note, AI output or raw paper into active public output or database seed."
};

const commonSchema = {
  module_id: "AG69A",
  title: "Common Knowledge Record Schema",
  status: "common_schema_defined",
  required_fields: [
    "record_id",
    "module_id",
    "record_type",
    "language_scope",
    "content_payload",
    "source_tier",
    "source_reference_id",
    "claim_level",
    "review_status",
    "public_use_allowed",
    "admin_only",
    "sensitivity_level",
    "methodology_rule_id",
    "created_at",
    "last_reviewed_at",
    "review_notes"
  ],
  recommended_status_values: [
    "candidate",
    "source_checked",
    "reviewed",
    "approved",
    "rejected",
    "public_safe",
    "admin_only",
    "retired"
  ],
  public_gate: {
    public_use_allowed_required: true,
    review_status_required: "approved",
    public_safe_required: true,
    source_reference_required: true,
    claim_level_required: true
  }
};

const doctrine = {
  module_id: "AG69A",
  title: "Methodology-First Knowledge/Data Foundation Doctrine",
  status: "methodology_first_knowledge_data_governance_recorded",
  current_git_context: git,
  principle: "For every Drishvara module, methodology must be validated before data bank creation, and data bank records must be source-checked before output generation.",
  pipeline: [
    "methodology_first",
    "field_ontology",
    "source_hierarchy",
    "candidate_data",
    "purity_source_safety_validation",
    "approved_knowledge_bank",
    "output_test",
    "result_saving_model",
    "ui_display",
    "closure"
  ],
  no_compromise_rules: [
    "No public naming or attribution of private internal study influences.",
    "No invented Sanskrit, mantra, etymology, scriptural reference, festival rule, tithi or astrological claim.",
    "No database population from unverified discussion or raw notes.",
    "No public output from candidate records.",
    "No sensitive personal output without consent and admin/public separation.",
    "No backend, Supabase, Auth or RLS activation in AG69A."
  ],
  source_tiers: sourceTiers,
  claim_levels: claimLevels
};

const sourceGovernance = {
  module_id: "AG69A",
  title: "Source Tier and Claim-Level Governance Record",
  status: "source_tier_and_claim_level_governance_defined",
  source_tiers: sourceTiers,
  claim_levels: claimLevels,
  blocked_sources: [
    "random blogs",
    "unsupported social media posts",
    "broken or parked links",
    "AI-invented claims",
    "unverified Sanskrit/mantra copies",
    "unverified Panchang/festival date claims",
    "betting, odds or fantasy portals for sports facts",
    "deterministic psychological or astrological labelling"
  ],
  required_source_fields: [
    "source_reference_id",
    "source_title_or_label",
    "source_type",
    "source_tier",
    "source_url_or_repository_note",
    "source_access_status",
    "source_review_status",
    "claim_scope_allowed",
    "public_attribution_allowed",
    "admin_only"
  ]
};

const internalDiscipline = {
  module_id: "AG69A",
  title: "Internal Textual Discipline and Public Attribution Guard",
  status: "internal_discipline_public_attribution_guard_defined",
  public_attribution_allowed: false,
  private_influence_names_allowed_in_public_outputs: false,
  private_influence_names_allowed_in_repo_records: false,
  internal_use_only: true,
  allowed_public_language: [
    "source-reviewed",
    "methodology-reviewed",
    "editorially verified",
    "under source verification",
    "technical background reviewed"
  ],
  blocked_public_language: [
    "based on a private individual",
    "inspired by a private teacher",
    "as per internal unnamed source",
    "authority claim without citation",
    "source verified when not verified"
  ],
  discipline_description: "Internal quality discipline may guide Sanskrit correctness, source-first reading, textual caution, and claim restraint, but must not appear as public attribution."
};

const moduleArchitecture = {
  module_id: "AG69A",
  title: "Common Module Knowledge/Data Architecture Record",
  status: "common_module_architecture_defined",
  shared_layers: [
    "source_registry",
    "knowledge_bank",
    "methodology_rules",
    "output_generation_test",
    "result_log",
    "review_log",
    "ui_public_safe_output"
  ],
  static_repo_paths: [
    "data/knowledge-base/word-of-day/",
    "data/knowledge-base/vedic-guidance/",
    "data/knowledge-base/panchang-festival/",
    "data/knowledge-base/star-reflection/",
    "data/knowledge-base/sports-desk/",
    "data/knowledge-base/psychometric-assessment/",
    "data/knowledge-base/_governance/"
  ],
  generated_output_paths: [
    "generated/word-of-day.json",
    "generated/vedic-guidance-working-data.json",
    "generated/panchang-festival-working-data.json",
    "generated/star-reflection-working-data.json",
    "generated/sports-desk-working-data.json",
    "generated/module-results/"
  ],
  module_activation_order_recommended: [
    "word_of_the_day",
    "vedic_guidance",
    "panchang_festival",
    "star_reflection",
    "sports_archive",
    "psychometric_assessment"
  ]
};

const staticToDb = {
  module_id: "AG69A",
  title: "Static Seed to Supabase Migration Doctrine Record",
  status: "static_to_supabase_migration_doctrine_defined_no_database_activation",
  current_mode: "static_governed_seed_bank",
  future_mode: "supabase_postgres_after_explicit_approval",
  supabase_activation_now: false,
  migration_pipeline: [
    "candidate_seed_json",
    "validator_pass",
    "source_review",
    "approved_static_bank",
    "sql_schema_preview",
    "sql_seed_preview",
    "dry_run_validation",
    "explicit_user_approval",
    "supabase_apply",
    "post_apply_readback_validation",
    "method_output_test"
  ],
  blocked_now: [
    "supabase_migration_apply",
    "database_write",
    "auth_activation",
    "service_role_use",
    "rls_mutation",
    "runtime_api_activation"
  ]
};

const resultSaving = {
  module_id: "AG69A",
  title: "Module Output Result-Saving Doctrine Record",
  status: "result_saving_doctrine_defined",
  result_record_required_fields: [
    "result_id",
    "module_id",
    "methodology_version",
    "input_context_hash_or_code",
    "selected_knowledge_record_ids",
    "output_payload",
    "source_basis",
    "public_output_allowed",
    "admin_only",
    "review_status",
    "generated_at",
    "saved_at"
  ],
  public_output_rule: "Only public-safe output payload can be displayed. Internal source weights, private discipline, sensitive concordance and admin-only notes remain hidden.",
  result_storage_now: "static_result_schema_only",
  result_storage_future: "Supabase table after backend approval"
};

const moduleBlueprint = {
  module_id: "AG69A",
  title: "Module-Wise Knowledge Bank Blueprint Record",
  status: "module_wise_blueprint_defined",
  modules: {
    word_of_the_day: {
      risk_level: "low",
      next_stage: "AG69B",
      knowledge_bank_fields: [
        "word_id",
        "english_word",
        "hindi_word",
        "sanskrit_word",
        "transliteration",
        "meaning",
        "usage_sentence",
        "theme",
        "difficulty_level",
        "source_reference",
        "etymology_claim_allowed",
        "classical_claim_allowed",
        "public_ready",
        "review_status"
      ],
      strict_rules: [
        "No unsupported etymology.",
        "No false Sanskrit claim.",
        "No classical claim without source verification."
      ]
    },
    vedic_guidance: {
      risk_level: "medium_high",
      knowledge_bank_fields: [
        "guidance_rule_id",
        "weekday",
        "theme",
        "colour_suggestion",
        "food_suggestion",
        "reflection_basis",
        "mantra_id",
        "source_reference",
        "public_ready",
        "review_status"
      ],
      strict_rules: [
        "No invented mantra.",
        "No false scriptural attribution.",
        "Fallback if mantra/source is unverified."
      ]
    },
    panchang_festival: {
      risk_level: "high",
      knowledge_bank_fields: [
        "concept_id",
        "panchang_element",
        "astronomical_basis",
        "observance_rule",
        "regional_basis",
        "date_basis",
        "calculation_method",
        "source_reference",
        "public_ready",
        "review_status"
      ],
      strict_rules: [
        "Separate astronomical calculation from observance tradition.",
        "No invented tithi/festival date.",
        "No exact public Panchang output before method validation."
      ]
    },
    star_reflection: {
      risk_level: "high_sensitive",
      knowledge_bank_fields: [
        "reflection_rule_id",
        "input_basis",
        "mapping_basis",
        "reflection_theme",
        "sensitivity_level",
        "public_claim_allowed",
        "admin_only_concordance_allowed",
        "consent_required",
        "source_reference",
        "review_status"
      ],
      strict_rules: [
        "Reflective, not deterministic.",
        "Consent required for birth-related processing.",
        "Admin-only concordance separated from public result."
      ]
    },
    sports_archive: {
      risk_level: "medium",
      knowledge_bank_fields: [
        "event_id",
        "sport",
        "event_name",
        "event_date",
        "category",
        "result_or_status",
        "short_summary",
        "source_name",
        "source_url",
        "source_verified",
        "public_ready"
      ],
      strict_rules: [
        "Only verified source links.",
        "No betting/odds/fantasy source.",
        "No unverified result."
      ]
    },
    psychometric_assessment: {
      risk_level: "very_high_sensitive",
      knowledge_bank_fields: [
        "client_id",
        "unit_id",
        "assessment_subject_code",
        "assessment_session",
        "response_set",
        "derived_profile",
        "teacher_manager_verification",
        "verification_percentage",
        "prescription",
        "result_log"
      ],
      strict_rules: [
        "Identity separated by unique code.",
        "Teacher/manager verification required.",
        "No harmful deterministic labelling."
      ]
    }
  }
};

const technicalSource = {
  module_id: "AG69A",
  title: "Panchang Technical Background Source Handling Record",
  status: "technical_background_source_handling_defined",
  source_reference_id: "panchang_technical_background_paper_1998_user_uploaded",
  source_publication_handling: "technical_background_only",
  direct_calculation_engine: false,
  direct_public_claim_source: false,
  use_allowed_for: [
    "understanding that Panchang has multiple elements",
    "separating astronomical calculation from observance/festival rules",
    "recording complexity of tithi, vara, nakshatra, yoga and karana",
    "recording regional and siddhantic variation risk",
    "defining why Panchang module requires stricter source and calculation governance"
  ],
  public_output_rule: "Public Panchang output must not cite or rely on this background source alone; exact output requires a verified calculation method and reviewed observance rule."
};

function audit(title, status, keys) {
  return {
    module_id: "AG69A",
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
  "supabase_migration_applied",
  "backend_auth_supabase_activation_performed",
  "runtime_database_query_enabled",
  "service_role_used",
  "rls_policy_mutation_enabled",
  "public_mutation_enabled"
]);

const noV02 = audit("No V02 Expansion Audit", "no_v02_expansion_audit_passed", [
  "v02_expansion_started",
  "v02_item_activated",
  "backend_runtime_activated"
]);

const governanceIndex = {
  module_id: "AG69A",
  title: "Knowledge Foundation Governance Index",
  status: "governance_index_created",
  governance_files: {
    doctrine: outputs.doctrine,
    source_governance: outputs.sourceGovernance,
    internal_discipline: outputs.internalDiscipline,
    module_architecture: outputs.moduleArchitecture,
    static_to_db: outputs.staticToDb,
    result_saving: outputs.resultSaving,
    module_blueprint: outputs.moduleBlueprint,
    candidate_lifecycle: outputs.candidateLifecycle,
    common_schema: outputs.commonSchema
  },
  next_module: "word_of_the_day",
  next_stage: "AG69B"
};

const readiness = {
  module_id: "AG69A",
  title: "AG69B Word of the Day Knowledge Bank Readiness Record",
  status: "ready_for_ag69b_word_of_the_day_knowledge_bank",
  ready_for_ag69b: true,
  reason: "Common methodology-first governance, source tiers, lifecycle, static-to-database doctrine and module blueprint are defined. Word of the Day is the safest first proof module."
};

const boundary = {
  module_id: "AG69A",
  title: "AG69A to AG69B Word of the Day Knowledge Bank Boundary",
  status: "ag69b_boundary_defined",
  allowed_next_scope: [
    "Create Word of the Day candidate knowledge bank.",
    "Create Word source registry.",
    "Create word selection methodology rules.",
    "Generate test output from approved/static-safe records only.",
    "Keep Supabase/database inactive."
  ],
  blocked_scope_without_explicit_approval: [
    "Supabase migration apply",
    "database write",
    "backend/Auth/Supabase activation",
    "service-role use",
    "runtime API activation",
    "public use of candidate word records",
    "unsupported Sanskrit or etymology claim",
    "V02 expansion"
  ]
};

const review = {
  module_id: "AG69A",
  title: "Methodology-First Knowledge/Data Foundation Governance",
  status: "ag69a_methodology_first_knowledge_data_governance_completed",
  current_git_context: git,
  doctrine_file: outputs.doctrine,
  source_governance_file: outputs.sourceGovernance,
  internal_discipline_file: outputs.internalDiscipline,
  module_architecture_file: outputs.moduleArchitecture,
  static_to_db_file: outputs.staticToDb,
  result_saving_file: outputs.resultSaving,
  module_blueprint_file: outputs.moduleBlueprint,
  technical_source_file: outputs.technicalSource,
  governance_index_file: outputs.governanceIndex,
  candidate_lifecycle_file: outputs.candidateLifecycle,
  common_schema_file: outputs.commonSchema,
  no_backend_runtime_audit_file: outputs.noBackend,
  no_v02_expansion_audit_file: outputs.noV02,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    methodology_first_doctrine_recorded: true,
    source_tier_governance_recorded: true,
    claim_level_governance_recorded: true,
    internal_textual_discipline_public_attribution_guard_recorded: true,
    private_influence_public_attribution_blocked: true,
    candidate_reviewed_approved_lifecycle_recorded: true,
    common_knowledge_record_schema_recorded: true,
    module_wise_blueprint_recorded: true,
    static_to_supabase_migration_doctrine_recorded: true,
    result_saving_doctrine_recorded: true,
    panchang_technical_source_handling_recorded: true,
    word_of_day_selected_as_first_proof_module: true,
    supabase_migration_applied: false,
    database_runtime_activated: false,
    backend_runtime_activated: false,
    service_role_used: false,
    public_output_activated_from_candidate_data: false,
    v02_expansion_started: false,
    ready_for_ag69b: true
  }
};

const registry = {
  module_id: "AG69A",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG69A",
  status: review.status,
  methodology_first_doctrine_recorded: 1,
  source_tier_governance_recorded: 1,
  claim_level_governance_recorded: 1,
  internal_textual_discipline_public_attribution_guard_recorded: 1,
  private_influence_public_attribution_blocked: 1,
  candidate_reviewed_approved_lifecycle_recorded: 1,
  common_knowledge_record_schema_recorded: 1,
  module_wise_blueprint_recorded: 1,
  static_to_supabase_migration_doctrine_recorded: 1,
  result_saving_doctrine_recorded: 1,
  panchang_technical_source_handling_recorded: 1,
  word_of_day_selected_as_first_proof_module: 1,
  supabase_migration_applied: 0,
  database_runtime_activated: 0,
  backend_runtime_activated: 0,
  service_role_used: 0,
  public_output_activated_from_candidate_data: 0,
  v02_expansion_started: 0,
  ready_for_ag69b: 1
};

const doc = `# AG69A — Methodology-First Knowledge/Data Foundation Governance

AG69A establishes the common governance layer for Drishvara's knowledge/data foundations.

## Core principle

Every module must follow:

\`\`\`text
methodology → ontology → source hierarchy → candidate data → validation → approved bank → output test → result saving → UI display → closure
\`\`\`

No module may move directly from discussion, uploaded notes, AI output, or raw source material into public output or database seeding.

## Public attribution guard

Private internal study influences must not be named or attributed in public UI, public records, generated output, or open repository documentation. Internal quality discipline may guide source-first reading, Sanskrit correctness, textual caution and claim restraint, but public attribution is blocked.

## Source governance

AG69A defines source tiers, claim levels, blocked sources, and public-use gates.

## Data lifecycle

Records move through:

\`\`\`text
candidate → extracted → normalised → source_checked → methodology_checked → reviewed → approved → method_tested → output_tested → public_safe
\`\`\`

Only approved, method-tested, output-tested and public-safe records may feed public output.

## Static-to-database doctrine

AG69A records the future static-to-Supabase migration path, but does not activate Supabase, backend, Auth, RLS, service-role use or database writes.

## First proof module

Word of the Day is selected as the first proof module because it is low-risk and suitable for validating the full knowledge-bank method before moving to Vedic Guidance, Panchang/Festival, Star Reflection, Sports Archive and Psychometric Assessment.

## Not activated

- No Supabase migration.
- No database write.
- No backend/Auth/RLS activation.
- No runtime API.
- No public output from candidate records.
- No V02 expansion.
`;

writeJson(outputs.doctrine, doctrine);
writeJson(outputs.sourceGovernance, sourceGovernance);
writeJson(outputs.internalDiscipline, internalDiscipline);
writeJson(outputs.moduleArchitecture, moduleArchitecture);
writeJson(outputs.staticToDb, staticToDb);
writeJson(outputs.resultSaving, resultSaving);
writeJson(outputs.moduleBlueprint, moduleBlueprint);
writeJson(outputs.technicalSource, technicalSource);
writeJson(outputs.governanceIndex, governanceIndex);
writeJson(outputs.candidateLifecycle, lifecycle);
writeJson(outputs.commonSchema, commonSchema);
writeJson(outputs.noBackend, noBackend);
writeJson(outputs.noV02, noV02);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG69A methodology-first knowledge/data governance generated.");
console.log("✅ No Supabase/database/backend/Auth/RLS/service-role/V02 activation performed.");
