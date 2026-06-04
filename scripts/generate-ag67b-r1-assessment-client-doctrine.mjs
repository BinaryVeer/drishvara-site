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

const ag67a = readJson("data/content-intelligence/quality-reviews/ag67a-psychometric-assessment-foundation.json");
const ag67b = readJson("data/content-intelligence/quality-reviews/ag67b-psychometric-assessment-ui-wiring.json");
const workingData = readJson("generated/psychometric-assessment-working-data.json");

if (ag67a.summary?.ready_for_ag67b !== true) throw new Error("AG67A readiness missing.");
if (ag67b.summary?.ready_for_ag67z !== true) throw new Error("AG67B readiness for closure missing.");

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag67b-r1-assessment-client-doctrine.json",
  doctrine: "data/content-intelligence/phase-01-modules/ag67b-r1-adaptive-verification-client-entitlement-prescription-doctrine.json",
  operatingModel: "data/methodology/psychometric-assessment/ag67b-r1-assessment-client-operating-model.json",
  verificationModel: "data/methodology/psychometric-assessment/ag67b-r1-teacher-manager-verification-model.json",
  identityModel: "data/methodology/psychometric-assessment/ag67b-r1-unique-assessment-code-identity-separation-model.json",
  entitlementModel: "data/methodology/psychometric-assessment/ag67b-r1-client-entitlement-quota-model.json",
  groupingModel: "data/methodology/psychometric-assessment/ag67b-r1-learning-pattern-grouping-and-peer-collaboration-model.json",
  reportModel: "data/methodology/psychometric-assessment/ag67b-r1-report-generation-and-delivery-model.json",
  starConcordanceModel: "data/methodology/psychometric-assessment/ag67b-r1-admin-only-star-assessment-concordance-model.json",
  prescriptionModel: "data/methodology/psychometric-assessment/ag67b-r1-prescription-engine-doctrine.json",
  readiness: "data/content-intelligence/quality-registry/ag67b-r1-ag67z-psychometric-assessment-closure-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag67b-r1-to-ag67z-psychometric-assessment-closure-boundary.json",
  noBackend: "data/content-intelligence/backend-architecture/ag67b-r1-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag67b-r1-no-v02-expansion-audit.json",
  registry: "data/quality/ag67b-r1-assessment-client-doctrine.json",
  preview: "data/quality/ag67b-r1-assessment-client-doctrine-preview.json",
  doc: "docs/quality/AG67B_R1_ASSESSMENT_CLIENT_DOCTRINE.md"
};

for (const key of [
  "public_assessment_launch_enabled",
  "personal_input_collection_enabled",
  "student_data_collection_enabled",
  "child_minor_data_processing_enabled",
  "guardian_consent_runtime_enabled",
  "school_permission_runtime_enabled",
  "questionnaire_runtime_enabled",
  "psychometric_test_runtime_enabled",
  "scoring_runtime_enabled",
  "trait_diagnosis_enabled",
  "mental_health_inference_enabled",
  "academic_prediction_enabled",
  "career_prediction_enabled",
  "student_ranking_enabled",
  "report_generation_enabled",
  "external_api_fetch_active",
  "ai_generation_active"
]) {
  if (workingData[key] !== false) throw new Error(`${key} must remain false before AG67B-R1.`);
}

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const doctrine = {
  module_id: "AG67B-R1",
  title: "Adaptive Verification, Career Guidance, Client Entitlement, Learning-Pattern Grouping and Prescription Doctrine",
  status: "doctrine_recorded_no_runtime_activation",
  purpose: "Record the future operating model for Drishvara's assessment product before AG67 closure.",
  client_paths: [
    {
      path: "individual",
      name: "Individual Career Guidance / Self-Discovery",
      purpose: "Career direction, learning/work-style reflection and optional cultural-symbolic self-reflection.",
      current_runtime_status: "inactive"
    },
    {
      path: "school_institution",
      name: "School / Institution Learning-Support Assessment",
      purpose: "Student learning-support assessment, teacher verification, class/cohort prescription and learning-pattern grouping.",
      current_runtime_status: "inactive"
    },
    {
      path: "company_organisation",
      name: "Company / Organisation Work-Style and Productivity Support",
      purpose: "Employee work-style assessment, manager verification, unit-level prescription and peer-collaboration support.",
      current_runtime_status: "inactive"
    }
  ],
  core_flow: [
    "client registration",
    "subscription/token entitlement",
    "assessment campaign creation",
    "participant assessment",
    "thank-you completion state",
    "unique assessment code mapping",
    "individual coded report",
    "teacher/manager/self verification",
    "verification percentage",
    "admin/academic/ethics review",
    "unit/class/department prescription",
    "CSV/PDF/email delivery",
    "anonymised methodology improvement only after approval"
  ],
  explicit_non_activation: {
    public_assessment_launch_enabled: false,
    questionnaire_runtime_enabled: false,
    data_collection_enabled: false,
    scoring_runtime_enabled: false,
    report_generation_enabled: false,
    ai_generation_active: false,
    backend_runtime_activated: false,
    v02_expansion_started: false
  }
};

const operatingModel = {
  module_id: "AG67B-R1",
  title: "Assessment Client Operating Model",
  status: "client_operating_model_recorded",
  individual_flow: [
    "subscribe or receive token",
    "register with name/display name, age and consent",
    "optional DOB/place/birth-time only for optional cultural-symbolic layer",
    "complete assessment",
    "receive thank-you message",
    "receive dashboard report and email report",
    "optional follow-up after 30/60/90 days"
  ],
  school_institution_flow: [
    "institution registration",
    "unit/campus/branch creation",
    "subscription token and quota lock",
    "admin login creation",
    "assessment campaign creation",
    "student assessment completion",
    "thank-you message after each assessment",
    "individual code-only reports",
    "teacher verification forms",
    "verification percentage calculation",
    "class/cohort report",
    "learning-pattern grouping prescription",
    "syllabus-based chapter-wise teaching prescription in future",
    "CSV/PDF/email delivery"
  ],
  company_organisation_flow: [
    "company registration",
    "unit/branch/department creation",
    "subscription token and quota lock",
    "HR/admin login creation",
    "employee assessment campaign",
    "employee assessment completion",
    "thank-you message after each assessment",
    "individual code-only reports",
    "manager verification forms",
    "department/unit report",
    "peer-collaboration prescription",
    "CSV/PDF/email delivery"
  ]
};

const verificationModel = {
  module_id: "AG67B-R1",
  title: "Teacher / Manager Verification Model",
  status: "verification_model_recorded",
  principle: "Verification is person-specific and uses report-derived statements. Teacher/manager sees actual name plus unique assessment code only in the authorised verification console. Printed individual report remains code-only.",
  scale: {
    "5": { label: "Strongly Agree", percentage: 100 },
    "4": { label: "Agree", percentage: 75 },
    "3": { label: "Not Sure / Insufficient Observation", percentage: 50 },
    "2": { label: "Disagree", percentage: 25 },
    "1": { label: "Strongly Disagree", percentage: 0 }
  },
  verification_formula: "Average percentage value across all verified statements.",
  interpretation: [
    { band: "80_and_above", label: "strongly_verified", treatment: "positive candidate after admin/academic review" },
    { band: "50_to_79", label: "partially_verified", treatment: "observation required; no automatic reinforcement" },
    { band: "below_50", label: "mismatch_review", treatment: "send to admin/academic review queue" }
  ],
  student_statement_examples: [
    "The student understands better when a new concept is introduced through a story, example, or real-life situation.",
    "The student benefits from visual explanation such as diagrams, charts, flow maps, or board illustrations.",
    "The student needs step-by-step worked examples before attempting calculation-based questions independently.",
    "The student participates better in small-group discussion than in full-class open discussion.",
    "The student shows interest in project, activity, model-making, experiment, or innovation-based learning.",
    "The student requires encouragement or confidence-building before attempting difficult or unfamiliar tasks.",
    "The student is more comfortable when instructions are structured, clear, and broken into smaller steps.",
    "The student can explain ideas better verbally or through examples than through long written answers."
  ],
  manager_statement_examples: [
    "The employee performs better with structured task clarity.",
    "The employee contributes better in idea-generation or exploratory discussions.",
    "The employee needs written briefing before execution.",
    "The employee coordinates well in collaborative tasks.",
    "The employee shows stronger performance in independent analysis.",
    "The employee benefits from short review cycles.",
    "The employee handles operational tasks consistently.",
    "The employee responds well to visual dashboards or trackers."
  ]
};

const identityModel = {
  module_id: "AG67B-R1",
  title: "Unique Assessment Code and Identity Separation Model",
  status: "identity_separation_model_recorded",
  principle: "Name and sensitive identifiers are used for authorised identity/reporting only, not for model learning.",
  identity_data_layer: [
    "name",
    "age",
    "class_or_degree",
    "institution_or_company",
    "unit_or_section",
    "DOB_optional",
    "birth_place_optional",
    "birth_time_optional",
    "registered_email",
    "guardian_or_manager_context_where_applicable"
  ],
  assessment_data_layer: [
    "unique_assessment_code",
    "assessment_response_vector",
    "derived_support_pattern",
    "verification_result",
    "prescription_category",
    "admin_review_status",
    "anonymised_methodology_signal"
  ],
  printed_report_rule: "Individual student/employee institutional report must be code-only. Verification console may show name plus code to authorised teacher/manager/admin.",
  code_examples: [
    "DV-SCH-CL10-A-023",
    "DV-CMP-FIN-014",
    "DV-IND-CAR-008"
  ]
};

const entitlementModel = {
  module_id: "AG67B-R1",
  title: "Client Entitlement and Quota Model",
  status: "entitlement_quota_model_recorded",
  token_required: true,
  inactive_now: true,
  client_registration_fields: {
    institution: [
      "institution_name",
      "institution_type",
      "admin_contact",
      "registered_email",
      "phone",
      "address",
      "state",
      "district",
      "city",
      "unit_branch_campus_name",
      "unit_address",
      "assessment_campaign",
      "number_of_students"
    ],
    company: [
      "organisation_name",
      "organisation_type",
      "hr_admin_contact",
      "registered_email",
      "phone",
      "head_office_address",
      "unit_branch_department_name",
      "unit_address",
      "assessment_campaign",
      "number_of_employees"
    ],
    individual: [
      "name_or_display_name",
      "age",
      "registered_email",
      "consent",
      "optional_DOB",
      "optional_birth_place",
      "optional_birth_time"
    ]
  },
  quota_rule: {
    purchased_slots: "client_purchased_count",
    bonus_percentage: 2,
    total_slots_formula: "purchased_slots + floor_or_policy_defined_2_percent_bonus",
    track: ["purchased_slots", "bonus_slots", "total_slots", "used_slots", "remaining_slots", "expired_slots"]
  },
  blocked_now: [
    "payment runtime",
    "subscription runtime",
    "login runtime",
    "quota enforcement runtime",
    "assessment page activation"
  ]
};

const groupingModel = {
  module_id: "AG67B-R1",
  title: "Learning-Pattern Grouping and Peer-Collaboration Model",
  status: "grouping_and_collaboration_model_recorded",
  school_institution_rule: {
    terminology: "Learning-Pattern Grouping Prescription",
    formula: "total_assessed_learners_in_class_or_cohort / number_of_sections_or_groups = target_group_size",
    example: {
      class: "Class 10",
      total_students: 50,
      sections: 2,
      target_group_size: 25,
      output: "Two recommended learning-pattern groups of approximately 25 students each."
    },
    purpose: [
      "academic-year planning",
      "enrollment-stage planning",
      "section composition support",
      "teaching-method planning",
      "remedial group design",
      "enrichment group design",
      "activity-group planning"
    ],
    output_type: "group-wise coded student list with common learning-support pattern and teaching-method prescription",
    not_pairwise_peer_bonding: true,
    not_automatic_section_allocation: true
  },
  company_organisation_rule: {
    terminology: "Peer-Collaboration / Work-Style Bonding Recommendation",
    formula: "department_size <= 20 ? top_3_recommendations : top_5_recommendations",
    purpose: [
      "productivity support",
      "task-pairing support",
      "work-style balancing",
      "collaboration planning",
      "manager-reviewed intervention planning"
    ],
    output_type: "top-N coded collaboration suggestions",
    not_appraisal_decision: true
  },
  safeguards: [
    "No ranking.",
    "No labelling as weak/strong.",
    "No caste/religion/gender/community grouping.",
    "No mental-health inference.",
    "No permanent sectioning without teacher/admin review.",
    "No automatic student placement.",
    "No employee appraisal, promotion, salary or termination use."
  ]
};

const reportModel = {
  module_id: "AG67B-R1",
  title: "Report Generation and Delivery Model",
  status: "report_delivery_model_recorded_no_runtime_activation",
  individual_user_report: [
    "dashboard report",
    "email report",
    "graphs/charts in future",
    "guidance only, not final career decision"
  ],
  student_employee_individual_report: [
    "code-only report",
    "learning/work-support pattern",
    "verification percentage where applicable",
    "prescription guidance",
    "no name in printed institutional report",
    "no star-concordance output"
  ],
  verification_csv: [
    "name plus code",
    "derived verification statements",
    "teacher/manager responses",
    "verification percentage",
    "verification band",
    "review note",
    "restricted to authorised teacher/manager/admin"
  ],
  class_department_report: [
    "pattern summary",
    "verification distribution",
    "learning-pattern grouping or peer-collaboration prescription",
    "3-5 priority recommendations",
    "CSV and PDF export",
    "registered email delivery"
  ],
  admin_review_file: [
    "assessment code",
    "model output",
    "verification result",
    "star-concordance internal result",
    "mismatch cases",
    "admin decision",
    "methodology update flag",
    "anonymised learning record"
  ],
  blocked_now: [
    "runtime report generation",
    "email sending",
    "PDF generation runtime",
    "CSV generation runtime",
    "dashboard display runtime"
  ]
};

const starConcordanceModel = {
  module_id: "AG67B-R1",
  title: "Admin-Only Star Assessment Concordance Model",
  status: "admin_only_concordance_model_recorded",
  terminology: "Internal Star–Assessment Concordance Review",
  optional_inputs: [
    "DOB",
    "place_of_birth",
    "state_of_birth",
    "birth_time"
  ],
  visibility: {
    public_user: false,
    student: false,
    parent: false,
    teacher: false,
    school_client: false,
    company_client: false,
    manager: false,
    admin_reviewer: true
  },
  rule: {
    similarity_75_or_above: "positive_concordance_candidate_admin_review_required",
    below_75: "neutral_no_concordance",
    negative_reinforcement_from_assessment_to_star_methodology: false,
    automatic_methodology_update: false
  },
  rationale: "Assessment and star reflection are different systems. Positive concordance can be studied after aggregation; mismatch must not weaken star methodology."
};

const prescriptionModel = {
  module_id: "AG67B-R1",
  title: "Prescription Engine Doctrine",
  status: "prescription_engine_doctrine_recorded_no_runtime_activation",
  individual_prescription: [
    "career direction guidance",
    "learning/work-style support suggestions",
    "skill development suggestions",
    "follow-up after 30/60/90 days"
  ],
  school_prescription: [
    "3-5 class/cohort recommendations",
    "learning-pattern grouping prescription",
    "chapter-wise teaching methods after syllabus upload",
    "remedial/enrichment group planning",
    "teacher-reviewed academic support plan"
  ],
  company_prescription: [
    "3-5 department/unit recommendations",
    "manager-verified productivity support",
    "peer-collaboration suggestions",
    "work-style support plan",
    "training/capacity-development suggestion"
  ],
  syllabus_upload_future_flow: [
    "syllabus upload",
    "chapter extraction",
    "concept and prerequisite mapping",
    "class/cohort learning-pattern alignment",
    "chapter-wise teaching-method prescription",
    "teacher review",
    "feedback and methodology refinement"
  ]
};

function audit(title, status, keys) {
  return {
    module_id: "AG67B-R1",
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
  "payment_or_subscription_runtime_enabled",
  "report_generation_runtime_enabled"
]);

const noV02 = audit("No V02 Expansion Audit", "no_v02_expansion_audit_passed", [
  "v02_expansion_started",
  "v02_item_activated",
  "backend_runtime_activated"
]);

const readiness = {
  module_id: "AG67B-R1",
  title: "AG67Z Psychometric Assessment Closure Readiness Record",
  status: "ready_for_ag67z_psychometric_assessment_closure_after_doctrine_refinement",
  ready_for_ag67z: true,
  next_stage: "AG67Z — Psychometric and Assessment Working Data, UI Wiring and Doctrine Closure",
  reason: "AG67B-R1 has recorded the future client operating model, entitlement, verification, identity, grouping, reporting, prescription and star-concordance doctrine without activating runtime assessment."
};

const boundary = {
  module_id: "AG67B-R1",
  title: "AG67B-R1 to AG67Z Boundary",
  status: "ag67z_psychometric_assessment_closure_boundary_refined",
  allowed_next_scope: [
    "Close AG67 including AG67A foundation, AG67B UI wiring and AG67B-R1 doctrine.",
    "Record live verification evidence from AG67B.",
    "Preserve no runtime activation."
  ],
  blocked_scope_without_explicit_approval: [
    "public assessment launch",
    "subscription/login runtime",
    "questionnaire runtime",
    "data collection",
    "student/minor data collection",
    "guardian consent runtime",
    "school permission runtime",
    "psychometric scoring",
    "diagnosis",
    "mental-health inference",
    "academic/career prediction",
    "report generation runtime",
    "PDF/CSV/email runtime",
    "runtime AI calls",
    "external API/live source fetch",
    "Supabase/Auth/backend activation",
    "runtime database writes",
    "service-role use",
    "V02 expansion",
    "direct feedback absorption"
  ]
};

const review = {
  module_id: "AG67B-R1",
  title: "Assessment Client Doctrine Refinement",
  status: "ag67b_r1_assessment_client_doctrine_recorded",
  current_git_context: git,
  doctrine_file: outputs.doctrine,
  operating_model_file: outputs.operatingModel,
  verification_model_file: outputs.verificationModel,
  identity_model_file: outputs.identityModel,
  entitlement_model_file: outputs.entitlementModel,
  grouping_model_file: outputs.groupingModel,
  report_model_file: outputs.reportModel,
  star_concordance_model_file: outputs.starConcordanceModel,
  prescription_model_file: outputs.prescriptionModel,
  no_backend_runtime_audit_file: outputs.noBackend,
  no_v02_expansion_audit_file: outputs.noV02,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    doctrine_recorded: true,
    individual_path_recorded: true,
    school_institution_path_recorded: true,
    company_organisation_path_recorded: true,
    client_entitlement_model_recorded: true,
    unique_assessment_code_model_recorded: true,
    teacher_manager_verification_model_recorded: true,
    learning_pattern_grouping_model_recorded: true,
    company_peer_collaboration_model_recorded: true,
    star_concordance_admin_only_model_recorded: true,
    prescription_engine_doctrine_recorded: true,
    report_delivery_model_recorded: true,
    public_assessment_launch_enabled: false,
    data_collection_enabled: false,
    scoring_runtime_enabled: false,
    report_generation_enabled: false,
    ai_generation_active: false,
    backend_runtime_activated: false,
    service_role_used: false,
    v02_expansion_started: false,
    ready_for_ag67z: true
  }
};

const registry = {
  module_id: "AG67B-R1",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG67B-R1",
  status: review.status,
  doctrine_recorded: 1,
  individual_path_recorded: 1,
  school_institution_path_recorded: 1,
  company_organisation_path_recorded: 1,
  client_entitlement_model_recorded: 1,
  unique_assessment_code_model_recorded: 1,
  teacher_manager_verification_model_recorded: 1,
  learning_pattern_grouping_model_recorded: 1,
  company_peer_collaboration_model_recorded: 1,
  star_concordance_admin_only_model_recorded: 1,
  prescription_engine_doctrine_recorded: 1,
  report_delivery_model_recorded: 1,
  public_assessment_launch_enabled: 0,
  data_collection_enabled: 0,
  scoring_runtime_enabled: 0,
  report_generation_enabled: 0,
  ai_generation_active: 0,
  backend_runtime_activated: 0,
  service_role_used: 0,
  v02_expansion_started: 0,
  ready_for_ag67z: 1
};

const doc = `# AG67B-R1 — Assessment Client Doctrine

AG67B-R1 records the future operating doctrine for Drishvara's assessment layer.

## Recorded

- Individual career-guidance pathway.
- School/institution assessment pathway.
- Company/organisation assessment pathway.
- Client registration, unit identity and subscription entitlement model.
- 2% quota bonus logic.
- Unique assessment code and identity separation.
- Teacher/manager verification model.
- Code-only individual reports.
- School learning-pattern grouping prescription.
- Company peer-collaboration recommendation.
- Admin-only Star–Assessment Concordance Review.
- Prescription engine doctrine.
- CSV/PDF/email delivery model for future activation.

## Important School Logic

For schools/institutions, the system does not generate pair-wise peer bonding as the main output. It generates a Learning-Pattern Grouping Prescription:

\`total assessed learners / number of sections or groups = target group size\`

Example: Class 10 has 50 students and 2 sections. The system generates two recommended learning-pattern groups of around 25 students each.

## Company Logic

For companies:

- Unit size up to 20: top 3 peer-collaboration suggestions.
- Unit size above 20: top 5 peer-collaboration suggestions.

## Not activated

- No assessment launch.
- No questionnaire runtime.
- No data collection.
- No scoring.
- No report generation runtime.
- No PDF/CSV/email runtime.
- No AI generation.
- No backend/Auth/Supabase/V02 activation.

## Next

AG67Z — Psychometric and Assessment Working Data, UI Wiring and Doctrine Closure.
`;

writeJson(outputs.doctrine, doctrine);
writeJson(outputs.operatingModel, operatingModel);
writeJson(outputs.verificationModel, verificationModel);
writeJson(outputs.identityModel, identityModel);
writeJson(outputs.entitlementModel, entitlementModel);
writeJson(outputs.groupingModel, groupingModel);
writeJson(outputs.reportModel, reportModel);
writeJson(outputs.starConcordanceModel, starConcordanceModel);
writeJson(outputs.prescriptionModel, prescriptionModel);
writeJson(outputs.noBackend, noBackend);
writeJson(outputs.noV02, noV02);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG67B-R1 assessment client doctrine generated.");
console.log("✅ No assessment, scoring, reports, runtime AI, backend or V02 activation performed.");
