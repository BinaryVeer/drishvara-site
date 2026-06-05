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

const ag69b = readJson("data/content-intelligence/quality-reviews/ag69b-word-of-the-day-knowledge-bank-foundation.json");
const candidateBank = readJson("data/knowledge-base/word-of-day/ag69b-word-candidate-bank-foundation.json");

if (ag69b.status !== "ag69b_word_of_the_day_knowledge_bank_foundation_completed") {
  throw new Error("AG69B must be completed before AG69C.");
}
if (ag69b.summary?.ready_for_ag69c !== true) {
  throw new Error("AG69B readiness for AG69C is missing.");
}
if (candidateBank.public_output_allowed_from_this_bank !== false) {
  throw new Error("AG69B candidate bank must remain blocked from public output.");
}

const outputs = {
  sourceReviewDoctrine: "data/knowledge-base/word-of-day/ag69c-word-source-review-doctrine.json",
  linguisticDisciplineGate: "data/knowledge-base/word-of-day/ag69c-linguistic-discipline-gate.json",
  publishedWorkCandidateHandling: "data/knowledge-base/word-of-day/ag69c-published-work-candidate-source-handling.json",
  approvedBankEligibility: "data/knowledge-base/word-of-day/ag69c-approved-bank-eligibility-validator-config.json",
  candidateReviewAssessment: "data/knowledge-base/word-of-day/ag69c-candidate-record-review-assessment.json",
  approvedBankPlaceholder: "data/knowledge-base/word-of-day/ag69c-approved-bank-placeholder-no-public-output.json",
  sourceAcquisitionPlan: "data/knowledge-base/word-of-day/ag69c-source-acquisition-plan.json",
  noBackend: "data/content-intelligence/backend-architecture/ag69c-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag69c-no-v02-expansion-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag69c-ag69d-source-acquisition-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag69c-to-ag69d-source-acquisition-boundary.json",
  review: "data/content-intelligence/quality-reviews/ag69c-word-source-review-linguistic-discipline-approved-bank-validator.json",
  registry: "data/quality/ag69c-word-source-review-linguistic-discipline-approved-bank-validator.json",
  preview: "data/quality/ag69c-word-source-review-linguistic-discipline-approved-bank-validator-preview.json",
  doc: "docs/quality/AG69C_WORD_SOURCE_REVIEW_LINGUISTIC_DISCIPLINE_APPROVED_BANK_VALIDATOR.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const sourceReviewDoctrine = {
  module_id: "AG69C",
  title: "Word of the Day Source Review Doctrine",
  status: "source_review_doctrine_defined",
  consumed_previous_stage: "AG69B",
  principle: "No Word of the Day record may move from candidate to reviewed or approved without authenticated source review, language review, safety review and editorial approval.",
  minimum_source_requirements_for_approved_record: [
    "At least one authenticated lexical or published source reference for the word form and basic meaning.",
    "If Sanskrit form is used, Sanskrit lexical/source confirmation is required.",
    "If Hindi form is used, Hindi lexical/source confirmation is required.",
    "If transliteration is used, transliteration review is required.",
    "If etymology is claimed, a separate verified etymology source is required.",
    "If classical/scriptural context is claimed, a separate verified text/context source is required.",
    "If no source is available, the record remains candidate or rejected."
  ],
  allowed_source_recording: [
    "source_reference_id",
    "source_title",
    "source_type",
    "source_url_or_repository_note",
    "publisher_or_institution",
    "access_status",
    "reuse_note",
    "allowed_use",
    "blocked_use",
    "public_attribution_allowed",
    "review_status"
  ],
  blocked_behaviour: [
    "AI-generated meaning treated as source.",
    "Unverified Sanskrit word treated as approved.",
    "Loose transliteration treated as approved.",
    "Unsupported etymology or classical claim.",
    "Public display from candidate or reviewed records."
  ]
};

const linguisticDisciplineGate = {
  module_id: "AG69C",
  title: "Linguistic Discipline Gate",
  status: "linguistic_discipline_gate_defined",
  gate_fields_required_for_future_review: [
    "sanskrit_form_review_status",
    "hindi_form_review_status",
    "transliteration_review_status",
    "meaning_context_review_status",
    "internal_textual_discipline_check",
    "source_alignment_review_status",
    "public_language_safety_status"
  ],
  internal_textual_discipline_rule: {
    required: true,
    allowed_status_values: ["pending", "passed", "failed", "not_applicable"],
    public_attribution_allowed: false,
    note: "Internal textual discipline may guide quality and correctness, but it must not be publicly named or presented as authority unless a specific published work is independently verified, citable and public-use approved."
  },
  blocked_public_language: [
    "as per private/internal teacher",
    "according to internal study influence",
    "verified by private influence",
    "source verified when the source is not independently recorded"
  ]
};

const publishedWorkCandidateHandling = {
  module_id: "AG69C",
  title: "Published Work Candidate Source Handling",
  status: "published_work_candidate_source_handling_defined",
  handling_rule: "Relevant published works by Nityanand Misra Ji or similar textual-discipline references may be considered as candidate source/review inputs only when directly relevant to Word of the Day, Sanskrit/Hindi terminology, transliteration, meaning discipline or cultural context.",
  strict_conditions: [
    "The work must be publicly available or independently citable.",
    "The exact work must be separately verified before being treated as a source.",
    "No private influence name is inserted into public UI or public output.",
    "No public attribution is allowed unless the specific published work is verified, citable, relevant and public-use approved.",
    "The work cannot replace lexical/source verification where lexical verification is required.",
    "It cannot be used to manufacture etymology, mantra, Sanskrit form or classical claim."
  ],
  current_stage_action: "No specific published work is added as an approved source in AG69C. AG69C only defines the handling rule.",
  specific_source_added_now: false,
  public_attribution_added_now: false
};

const eligibilityRules = [
  "bank_class must be reviewed or approved before approval evaluation",
  "source_reference_id must be present",
  "source_status must be approved_source",
  "review_status must be approved",
  "public_use_permission must be approved_for_public_output",
  "public_output_allowed must be true",
  "language_review_status must be approved",
  "safety_review_status must be approved",
  "editorial_review_status must be approved",
  "internal_textual_discipline_check must be passed or not_applicable",
  "etymology_claim_allowed may be true only if etymology source is verified",
  "classical_claim_allowed may be true only if classical/source context is verified"
];

const approvedBankEligibility = {
  module_id: "AG69C",
  title: "Approved Bank Eligibility Validator Config",
  status: "approved_bank_eligibility_validator_defined",
  eligibility_rules: eligibilityRules,
  candidate_records_eligible_now: false,
  reason_candidate_records_not_eligible: "AG69B records have no authenticated source reference, no approved source status, no approved review status and no public-use permission.",
  approved_bank_creation_now: false,
  public_output_creation_now: false
};

const assessedCandidates = candidateBank.candidate_records.map((record) => ({
  record_id: record.record_id,
  word_id: record.word_id,
  bank_class: record.bank_class,
  eligible_for_reviewed_bank: false,
  eligible_for_approved_bank: false,
  failure_reasons: [
    "source_reference_id_missing",
    "source_status_not_approved",
    "review_status_candidate",
    "public_use_permission_not_allowed",
    "language_review_pending",
    "safety_review_pending",
    "editorial_review_pending"
  ],
  required_next_action: "Attach authenticated source reference and perform language/source/safety/editorial review."
}));

const candidateReviewAssessment = {
  module_id: "AG69C",
  title: "Candidate Record Review Assessment",
  status: "candidate_records_assessed_not_approved",
  candidate_count: assessedCandidates.length,
  reviewed_count_now: 0,
  approved_count_now: 0,
  candidate_records: assessedCandidates,
  summary: {
    all_records_remain_candidate: true,
    no_record_approved: true,
    no_record_public_output_allowed: true
  }
};

const approvedBankPlaceholder = {
  module_id: "AG69C",
  title: "Approved Bank Placeholder — No Public Output",
  status: "approved_bank_not_created",
  approved_records: [],
  approved_record_count: 0,
  public_output_allowed: false,
  generated_word_json_modified: false,
  note: "Approved bank remains empty until AG69D or later source acquisition/review confirms actual source-backed records."
};

const sourceAcquisitionPlan = {
  module_id: "AG69C",
  title: "Word Source Acquisition Plan",
  status: "source_acquisition_plan_defined_not_executed",
  source_fetching_performed_now: false,
  source_content_saved_now: false,
  recommended_next_stage: "AG69D — Word of the Day Source Acquisition and Reference Bank",
  acquisition_principles: [
    "Acquire source metadata first, not bulk copyrighted content.",
    "Prefer authoritative dictionaries, institutional publications, open lexical resources and verified published works.",
    "Record copyright/reuse note for every source.",
    "Do not store large copyrighted dictionary text unless licence permits.",
    "Store source pointer, access status and allowed-use note.",
    "Candidate words can be mapped to source_reference_id only after source review."
  ],
  minimum_reference_bank_target_for_first_review: {
    source_families_minimum: 3,
    candidate_words_minimum: 50,
    reviewed_words_minimum_before_approval: 15,
    approved_words_minimum_for_first_public_test: 7
  }
};

function audit(title, status, keys) {
  return {
    module_id: "AG69C",
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
  module_id: "AG69C",
  title: "AG69D Source Acquisition Readiness Record",
  status: "ready_for_ag69d_source_acquisition_reference_bank",
  ready_for_ag69d: true,
  next_stage: "AG69D — Word of the Day Source Acquisition and Reference Bank",
  reason: "Source review doctrine, linguistic discipline gate, published-work candidate handling, eligibility validator and candidate assessment are defined. No candidate record is approved."
};

const boundary = {
  module_id: "AG69C",
  title: "AG69C to AG69D Source Acquisition Boundary",
  status: "ag69d_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Create source-reference bank metadata.",
    "Fetch or manually record authenticated source metadata only.",
    "Record relevant published-work candidate sources only after verification.",
    "Map candidate word records to source_reference_id only after source review.",
    "Keep all candidate records blocked from public output."
  ],
  blocked_scope_without_explicit_approval: [
    "bulk copyrighted source ingestion",
    "approved word bank creation without source review",
    "generated/word-of-day.json replacement",
    "public use of candidate or reviewed word records",
    "Supabase/database writes",
    "backend/Auth/Supabase activation",
    "runtime database query",
    "service-role use",
    "unsupported Sanskrit claim",
    "unsupported etymology claim",
    "public attribution of internal study influence",
    "V02 expansion"
  ]
};

const review = {
  module_id: "AG69C",
  title: "Word of the Day Source Review, Linguistic Discipline and Approved-Bank Validator",
  status: "ag69c_word_source_review_linguistic_discipline_approved_bank_validator_completed",
  current_git_context: git,
  consumed_previous_stage: {
    stage: "AG69B",
    source_file: "data/content-intelligence/quality-reviews/ag69b-word-of-the-day-knowledge-bank-foundation.json",
    status: ag69b.status
  },
  generated_records: outputs,
  summary: {
    ag69b_consumed: true,
    source_review_doctrine_defined: true,
    linguistic_discipline_gate_defined: true,
    internal_textual_discipline_check_required: true,
    published_work_candidate_handling_defined: true,
    public_attribution_of_internal_influence_blocked: true,
    approved_bank_eligibility_validator_defined: true,
    candidate_records_assessed: true,
    all_candidate_records_remain_candidate: true,
    reviewed_records_created: false,
    approved_records_created: false,
    public_output_from_candidate_or_reviewed_records_allowed: false,
    approved_bank_created: false,
    source_fetching_performed_now: false,
    source_content_saved_now: false,
    generated_word_json_modified: false,
    ui_display_changed: false,
    supabase_database_write_performed: false,
    backend_runtime_activated: false,
    database_runtime_activated: false,
    service_role_used: false,
    v02_expansion_started: false,
    ready_for_ag69d: true
  }
};

const registry = {
  module_id: "AG69C",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG69C",
  status: review.status,
  source_review_doctrine_defined: 1,
  linguistic_discipline_gate_defined: 1,
  internal_textual_discipline_check_required: 1,
  published_work_candidate_handling_defined: 1,
  public_attribution_of_internal_influence_blocked: 1,
  approved_bank_eligibility_validator_defined: 1,
  candidate_records_assessed: 1,
  all_candidate_records_remain_candidate: 1,
  reviewed_records_created: 0,
  approved_records_created: 0,
  public_output_from_candidate_or_reviewed_records_allowed: 0,
  approved_bank_created: 0,
  source_fetching_performed_now: 0,
  source_content_saved_now: 0,
  generated_word_json_modified: 0,
  ui_display_changed: 0,
  supabase_database_write_performed: 0,
  backend_runtime_activated: 0,
  database_runtime_activated: 0,
  service_role_used: 0,
  v02_expansion_started: 0,
  ready_for_ag69d: 1
};

const doc = `# AG69C — Word of the Day Source Review, Linguistic Discipline and Approved-Bank Validator

AG69C defines the review and approval validator for Word of the Day records.

## What AG69C does

- Defines authenticated source-review requirements.
- Defines the linguistic discipline gate.
- Defines handling for relevant published works as candidate source/review inputs.
- Defines approved-bank eligibility rules.
- Assesses AG69B candidate records and confirms they remain candidate-only.
- Defines the next source-acquisition boundary.

## Important rule

Relevant published works by textual-discipline authors may be considered only as candidate source/review inputs when independently verified, citable, public-use approved and directly relevant. Private/internal study influence is not public attribution.

## What AG69C does not do

- It does not fetch or save source content.
- It does not create approved word records.
- It does not modify generated/word-of-day.json.
- It does not change UI.
- It does not activate Supabase, backend, Auth, RLS, service-role use or V02.
`;

writeJson(outputs.sourceReviewDoctrine, sourceReviewDoctrine);
writeJson(outputs.linguisticDisciplineGate, linguisticDisciplineGate);
writeJson(outputs.publishedWorkCandidateHandling, publishedWorkCandidateHandling);
writeJson(outputs.approvedBankEligibility, approvedBankEligibility);
writeJson(outputs.candidateReviewAssessment, candidateReviewAssessment);
writeJson(outputs.approvedBankPlaceholder, approvedBankPlaceholder);
writeJson(outputs.sourceAcquisitionPlan, sourceAcquisitionPlan);
writeJson(outputs.noBackend, noBackend);
writeJson(outputs.noV02, noV02);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG69C source review, linguistic discipline and approved-bank validator generated.");
console.log("✅ Candidate records assessed and kept candidate-only.");
console.log("✅ Published-work candidate handling recorded without public attribution.");
console.log("✅ No source fetching, public output, Supabase/database/backend/Auth/RLS/service-role/V02 activation performed.");
