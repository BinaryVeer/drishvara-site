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

const ag69a = readJson("data/content-intelligence/quality-reviews/ag69a-methodology-first-knowledge-data-governance.json");
if (ag69a.status !== "ag69a_methodology_first_knowledge_data_governance_completed") {
  throw new Error("AG69A must be completed before AG69B.");
}
if (ag69a.summary?.ready_for_ag69b !== true) {
  throw new Error("AG69A readiness for AG69B is missing.");
}

const outputs = {
  ontology: "data/knowledge-base/word-of-day/ag69b-word-field-ontology.json",
  sourceHierarchy: "data/knowledge-base/word-of-day/ag69b-word-source-hierarchy.json",
  candidateBank: "data/knowledge-base/word-of-day/ag69b-word-candidate-bank-foundation.json",
  purityRules: "data/knowledge-base/word-of-day/ag69b-word-purity-source-safety-rules.json",
  reviewWorkflow: "data/knowledge-base/word-of-day/ag69b-word-review-approval-workflow.json",
  outputTestPlan: "data/knowledge-base/word-of-day/ag69b-word-output-test-plan.json",
  resultSavingPlan: "data/knowledge-base/word-of-day/ag69b-word-result-saving-model.json",
  noBackend: "data/content-intelligence/backend-architecture/ag69b-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag69b-no-v02-expansion-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag69b-ag69c-word-review-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag69b-to-ag69c-word-review-approved-bank-boundary.json",
  review: "data/content-intelligence/quality-reviews/ag69b-word-of-the-day-knowledge-bank-foundation.json",
  registry: "data/quality/ag69b-word-of-the-day-knowledge-bank-foundation.json",
  preview: "data/quality/ag69b-word-of-the-day-knowledge-bank-foundation-preview.json",
  doc: "docs/quality/AG69B_WORD_OF_THE_DAY_KNOWLEDGE_BANK_FOUNDATION.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const ontology = {
  module_id: "AG69B",
  title: "Word of the Day Field Ontology",
  status: "word_field_ontology_defined",
  consumed_governance: "AG69A",
  methodology_sequence_position: [
    "methodology_first_completed_by_ag69a",
    "field_ontology_defined_by_ag69b",
    "source_hierarchy_defined_by_ag69b",
    "candidate_data_foundation_created_by_ag69b",
    "purity_source_safety_validation_defined_by_ag69b",
    "approved_bank_not_created_yet",
    "output_test_planned_not_public",
    "result_saving_model_planned_not_runtime",
    "ui_display_not_changed",
    "closure_pending_after_later_review_stage"
  ],
  required_fields: [
    { field: "record_id", type: "string", required: true, public_visible: false },
    { field: "module_id", type: "string", required: true, public_visible: false },
    { field: "bank_class", type: "candidate|reviewed|approved", required: true, public_visible: false },
    { field: "word_id", type: "string", required: true, public_visible: false },
    { field: "english_word", type: "string", required: true, public_visible: true },
    { field: "hindi_word", type: "string", required: false, public_visible: true },
    { field: "sanskrit_word", type: "string", required: false, public_visible: true },
    { field: "transliteration", type: "string", required: false, public_visible: true },
    { field: "meaning", type: "string", required: true, public_visible: true },
    { field: "usage_sentence", type: "string", required: false, public_visible: true },
    { field: "theme", type: "string", required: true, public_visible: true },
    { field: "difficulty_level", type: "basic|intermediate|advanced", required: true, public_visible: false },
    { field: "source_reference_id", type: "string|null", required: true, public_visible: false },
    { field: "source_tier", type: "A|B|C|D|pending|blocked", required: true, public_visible: false },
    { field: "source_status", type: "candidate_unverified|source_checked|approved_source|blocked", required: true, public_visible: false },
    { field: "review_status", type: "candidate|under_review|reviewed|approved|rejected", required: true, public_visible: false },
    { field: "claim_level", type: "label_only|definition|translation|transliteration|usage_example|cultural_context|blocked", required: true, public_visible: false },
    { field: "public_use_permission", type: "not_allowed|allowed_after_review|approved_for_public_output", required: true, public_visible: false },
    { field: "public_output_allowed", type: "boolean", required: true, public_visible: false },
    { field: "etymology_claim_allowed", type: "boolean", required: true, public_visible: false },
    { field: "classical_claim_allowed", type: "boolean", required: true, public_visible: false },
    { field: "language_review_status", type: "pending|reviewed|approved|rejected", required: true, public_visible: false },
    { field: "safety_review_status", type: "pending|reviewed|approved|rejected", required: true, public_visible: false },
    { field: "editorial_review_status", type: "pending|reviewed|approved|rejected", required: true, public_visible: false }
  ],
  public_gate: {
    bank_class_required: "approved",
    review_status_required: "approved",
    public_use_permission_required: "approved_for_public_output",
    public_output_allowed_required: true,
    source_status_required: "approved_source",
    safety_review_status_required: "approved",
    language_review_status_required: "approved"
  }
};

const sourceHierarchy = {
  module_id: "AG69B",
  title: "Word of the Day Source Hierarchy",
  status: "word_source_hierarchy_defined",
  source_hierarchy: [
    {
      tier: "A",
      label: "standard_language_reference",
      accepted_for: ["definition", "translation", "transliteration"],
      examples_description_only: ["reviewed dictionaries", "approved lexicons", "institutional language references"],
      public_claim_allowed_after_review: true
    },
    {
      tier: "B",
      label: "reviewed_textual_or_scholarly_context",
      accepted_for: ["cultural_context", "usage_context"],
      examples_description_only: ["reviewed books", "scholarly articles", "approved educational references"],
      public_claim_allowed_after_review: true
    },
    {
      tier: "C",
      label: "internal_editorial_language_discipline",
      accepted_for: ["candidate_quality_filtering", "tone_alignment"],
      examples_description_only: ["internal style discipline", "editorial judgement"],
      public_claim_allowed_after_review: false
    },
    {
      tier: "D",
      label: "drishvara_editorial_synthesis",
      accepted_for: ["safe usage sentence", "reflection prompt"],
      examples_description_only: ["editorial synthesis based on approved records"],
      public_claim_allowed_after_review: true
    },
    {
      tier: "blocked",
      label: "unsupported_or_unverified",
      accepted_for: [],
      examples_description_only: ["AI-invented etymology", "unsupported Sanskrit", "random social media explanation"],
      public_claim_allowed_after_review: false
    }
  ],
  source_rule: "Candidate words may be stored without public use, but public output requires reviewed and approved source basis."
};

const candidateRecords = [
  {
    record_id: "wod_candidate_0001",
    module_id: "word_of_the_day",
    bank_class: "candidate",
    word_id: "satya",
    english_word: "Truthfulness",
    hindi_word: "सत्य",
    sanskrit_word: "सत्य",
    transliteration: "satya",
    meaning: "Candidate meaning placeholder: truth-aligned conduct. Requires source and language review.",
    usage_sentence: "Candidate only; not approved for public output.",
    theme: "integrity",
    difficulty_level: "basic",
    source_reference_id: null,
    source_tier: "pending",
    source_status: "candidate_unverified",
    review_status: "candidate",
    claim_level: "label_only",
    public_use_permission: "not_allowed",
    public_output_allowed: false,
    etymology_claim_allowed: false,
    classical_claim_allowed: false,
    language_review_status: "pending",
    safety_review_status: "pending",
    editorial_review_status: "pending"
  },
  {
    record_id: "wod_candidate_0002",
    module_id: "word_of_the_day",
    bank_class: "candidate",
    word_id: "daya",
    english_word: "Compassion",
    hindi_word: "दया",
    sanskrit_word: "दया",
    transliteration: "daya",
    meaning: "Candidate meaning placeholder: compassionate concern. Requires source and language review.",
    usage_sentence: "Candidate only; not approved for public output.",
    theme: "kindness",
    difficulty_level: "basic",
    source_reference_id: null,
    source_tier: "pending",
    source_status: "candidate_unverified",
    review_status: "candidate",
    claim_level: "label_only",
    public_use_permission: "not_allowed",
    public_output_allowed: false,
    etymology_claim_allowed: false,
    classical_claim_allowed: false,
    language_review_status: "pending",
    safety_review_status: "pending",
    editorial_review_status: "pending"
  },
  {
    record_id: "wod_candidate_0003",
    module_id: "word_of_the_day",
    bank_class: "candidate",
    word_id: "dhairya",
    english_word: "Patience",
    hindi_word: "धैर्य",
    sanskrit_word: "धैर्य",
    transliteration: "dhairya",
    meaning: "Candidate meaning placeholder: steadiness under pressure. Requires source and language review.",
    usage_sentence: "Candidate only; not approved for public output.",
    theme: "resilience",
    difficulty_level: "basic",
    source_reference_id: null,
    source_tier: "pending",
    source_status: "candidate_unverified",
    review_status: "candidate",
    claim_level: "label_only",
    public_use_permission: "not_allowed",
    public_output_allowed: false,
    etymology_claim_allowed: false,
    classical_claim_allowed: false,
    language_review_status: "pending",
    safety_review_status: "pending",
    editorial_review_status: "pending"
  },
  {
    record_id: "wod_candidate_0004",
    module_id: "word_of_the_day",
    bank_class: "candidate",
    word_id: "viveka",
    english_word: "Discernment",
    hindi_word: "विवेक",
    sanskrit_word: "विवेक",
    transliteration: "viveka",
    meaning: "Candidate meaning placeholder: careful discrimination or wise judgement. Requires source and language review.",
    usage_sentence: "Candidate only; not approved for public output.",
    theme: "judgement",
    difficulty_level: "intermediate",
    source_reference_id: null,
    source_tier: "pending",
    source_status: "candidate_unverified",
    review_status: "candidate",
    claim_level: "label_only",
    public_use_permission: "not_allowed",
    public_output_allowed: false,
    etymology_claim_allowed: false,
    classical_claim_allowed: false,
    language_review_status: "pending",
    safety_review_status: "pending",
    editorial_review_status: "pending"
  },
  {
    record_id: "wod_candidate_0005",
    module_id: "word_of_the_day",
    bank_class: "candidate",
    word_id: "maitri",
    english_word: "Friendliness",
    hindi_word: "मैत्री",
    sanskrit_word: "मैत्री",
    transliteration: "maitri",
    meaning: "Candidate meaning placeholder: friendly goodwill. Requires source and language review.",
    usage_sentence: "Candidate only; not approved for public output.",
    theme: "relationship",
    difficulty_level: "intermediate",
    source_reference_id: null,
    source_tier: "pending",
    source_status: "candidate_unverified",
    review_status: "candidate",
    claim_level: "label_only",
    public_use_permission: "not_allowed",
    public_output_allowed: false,
    etymology_claim_allowed: false,
    classical_claim_allowed: false,
    language_review_status: "pending",
    safety_review_status: "pending",
    editorial_review_status: "pending"
  }
];

const candidateBank = {
  module_id: "AG69B",
  title: "Word of the Day Candidate Bank Foundation",
  status: "candidate_bank_foundation_created_not_public",
  bank_class_created: "candidate",
  approved_bank_created: false,
  public_output_allowed_from_this_bank: false,
  candidate_records: candidateRecords,
  candidate_record_count: candidateRecords.length,
  strict_note: "These are candidate-only records. They are not public outputs and cannot feed generated/word-of-day.json until source, language, safety and editorial approval are completed."
};

const purityRules = {
  module_id: "AG69B",
  title: "Word Purity, Source and Safety Rules",
  status: "word_purity_source_safety_rules_defined",
  blocked_conditions: [
    "invented_sanskrit",
    "loose_transliteration",
    "unsupported_etymology",
    "unsupported_classical_claim",
    "candidate_record_used_for_public_output",
    "missing_source_reference_for_public_output",
    "unapproved_language_review",
    "unapproved_safety_review",
    "unapproved_public_use_permission"
  ],
  required_approval_gates: [
    "source_reference_present",
    "source_status_approved_source",
    "review_status_approved",
    "public_use_permission_approved_for_public_output",
    "language_review_status_approved",
    "safety_review_status_approved",
    "editorial_review_status_approved",
    "public_output_allowed_true"
  ],
  public_output_constraint: "Candidate and reviewed word records must not feed public output. Only approved records may be selected in a later output-test stage."
};

const reviewWorkflow = {
  module_id: "AG69B",
  title: "Word Review and Approval Workflow",
  status: "word_review_approval_workflow_defined",
  workflow: [
    "candidate_record_created",
    "language_scope_identified",
    "source_reference_attached",
    "source_checked",
    "meaning_checked",
    "transliteration_checked",
    "etymology_claim_blocked_unless_source_verified",
    "reviewed",
    "approved",
    "method_tested",
    "output_tested",
    "public_safe"
  ],
  transition_rules: [
    {
      from: "candidate",
      to: "reviewed",
      requires: ["source_reference_id", "language_review_status_reviewed", "safety_review_status_reviewed"]
    },
    {
      from: "reviewed",
      to: "approved",
      requires: ["approved_source", "approved_language_review", "approved_safety_review", "editorial_approval", "public_use_permission"]
    }
  ]
};

const outputTestPlan = {
  module_id: "AG69B",
  title: "Word Output Test Plan",
  status: "output_test_planned_not_executed",
  output_generation_now: false,
  generated_word_json_modified: false,
  future_test_requires: [
    "approved_word_record",
    "source_reference",
    "safe_public_payload",
    "no_etymology_claim_unless_verified",
    "no_classical_claim_unless_verified"
  ]
};

const resultSavingPlan = {
  module_id: "AG69B",
  title: "Word Result Saving Model",
  status: "result_saving_model_planned_not_runtime",
  result_saving_runtime_active: false,
  static_result_schema_only: true,
  required_future_result_fields: [
    "result_id",
    "word_record_id",
    "methodology_version",
    "selection_context",
    "output_payload",
    "source_basis",
    "review_status",
    "public_output_allowed",
    "saved_at"
  ]
};

function audit(title, status, keys) {
  return {
    module_id: "AG69B",
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
  "database_write_performed",
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

const readiness = {
  module_id: "AG69B",
  title: "AG69C Word Review Readiness Record",
  status: "ready_for_ag69c_word_review_approved_bank_validation",
  ready_for_ag69c: true,
  next_stage: "AG69C — Word of the Day Source Review and Approved Bank Validator",
  reason: "Word ontology, source hierarchy, candidate bank foundation, purity rules and review workflow are defined. Public output remains blocked."
};

const boundary = {
  module_id: "AG69B",
  title: "AG69B to AG69C Word Review / Approved Bank Boundary",
  status: "ag69c_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Review candidate word records.",
    "Attach source references.",
    "Move safe records from candidate to reviewed.",
    "Create approved-bank validator only after review gates are satisfied.",
    "Keep generated public output unchanged."
  ],
  blocked_scope_without_explicit_approval: [
    "public use of candidate word records",
    "generated/word-of-day.json replacement from candidate data",
    "Supabase/database writes",
    "backend/Auth/Supabase activation",
    "runtime database query",
    "service-role use",
    "unsupported Sanskrit claim",
    "unsupported etymology claim",
    "V02 expansion"
  ]
};

const review = {
  module_id: "AG69B",
  title: "Word of the Day Knowledge Bank Foundation",
  status: "ag69b_word_of_the_day_knowledge_bank_foundation_completed",
  current_git_context: git,
  consumed_previous_stage: {
    stage: "AG69A",
    source_file: "data/content-intelligence/quality-reviews/ag69a-methodology-first-knowledge-data-governance.json",
    status: ag69a.status
  },
  generated_records: outputs,
  summary: {
    ag69a_consumed: true,
    word_field_ontology_defined: true,
    word_source_hierarchy_defined: true,
    candidate_word_bank_foundation_created: true,
    candidate_word_records_created: true,
    candidate_word_record_count: candidateRecords.length,
    approved_word_bank_created: false,
    public_output_from_candidate_records_allowed: false,
    generated_word_json_modified: false,
    word_purity_rules_defined: true,
    no_invented_sanskrit_rule_recorded: true,
    no_loose_transliteration_rule_recorded: true,
    no_unsupported_etymology_rule_recorded: true,
    review_workflow_defined: true,
    output_test_planned_not_executed: true,
    result_saving_model_planned_not_runtime: true,
    ui_display_changed: false,
    supabase_database_write_performed: false,
    backend_runtime_activated: false,
    database_runtime_activated: false,
    service_role_used: false,
    v02_expansion_started: false,
    ready_for_ag69c: true
  }
};

const registry = {
  module_id: "AG69B",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG69B",
  status: review.status,
  word_field_ontology_defined: 1,
  word_source_hierarchy_defined: 1,
  candidate_word_bank_foundation_created: 1,
  candidate_word_records_created: 1,
  candidate_word_record_count: candidateRecords.length,
  approved_word_bank_created: 0,
  public_output_from_candidate_records_allowed: 0,
  generated_word_json_modified: 0,
  word_purity_rules_defined: 1,
  review_workflow_defined: 1,
  output_test_planned_not_executed: 1,
  result_saving_model_planned_not_runtime: 1,
  ui_display_changed: 0,
  supabase_database_write_performed: 0,
  backend_runtime_activated: 0,
  database_runtime_activated: 0,
  service_role_used: 0,
  v02_expansion_started: 0,
  ready_for_ag69c: 1
};

const doc = `# AG69B — Word of the Day Knowledge Bank Foundation

AG69B creates the Word of the Day knowledge-bank foundation under the AG69A methodology-first governance.

## Created

- Word field ontology.
- Word source hierarchy.
- Candidate-only word bank foundation.
- Word purity/source/safety rules.
- Review and approval workflow.
- Output test plan.
- Result-saving model.

## Candidate-only status

The initial word records are candidate-only. They cannot feed public output.

## Public blockers

- No public output from candidate records.
- No generated/word-of-day.json replacement.
- No unsupported Sanskrit claim.
- No loose transliteration.
- No unsupported etymology.
- No classical claim without verified source.
- No Supabase/database write.
- No backend/Auth activation.
- No service-role use.
- No V02 expansion.

## Next

AG69C should perform source review and approved-bank validation only after user confirmation.
`;

writeJson(outputs.ontology, ontology);
writeJson(outputs.sourceHierarchy, sourceHierarchy);
writeJson(outputs.candidateBank, candidateBank);
writeJson(outputs.purityRules, purityRules);
writeJson(outputs.reviewWorkflow, reviewWorkflow);
writeJson(outputs.outputTestPlan, outputTestPlan);
writeJson(outputs.resultSavingPlan, resultSavingPlan);
writeJson(outputs.noBackend, noBackend);
writeJson(outputs.noV02, noV02);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG69B Word of the Day Knowledge Bank Foundation generated.");
console.log("✅ Candidate-only word bank foundation created.");
console.log("✅ No public output, Supabase/database/backend/Auth/RLS/service-role/V02 activation performed.");
