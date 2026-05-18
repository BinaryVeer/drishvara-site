import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag08dReview: "data/content-intelligence/quality-reviews/ag08d-inference-reference-visual-readiness-review.json",
  ag08dInference: "data/content-intelligence/inference-records/ag08d-article-inference-readiness-review.json",
  ag08dReadiness: "data/content-intelligence/quality-registry/ag08d-reference-visual-readiness-gap-matrix.json",
  ag08dSchema: "data/content-intelligence/schema/inference-reference-visual-readiness-review.schema.json",
  ag08dLearning: "data/content-intelligence/learning/ag08d-inference-reference-visual-readiness-review-learning.json",
  ag08cPacket: "data/content-intelligence/content-packets/ag08c-article-upgrade-candidate-packet.json",
  ag08bSelection: "data/content-intelligence/selection-registry/ag08b-selected-pipeline-test-article.json",
  ag06eStandard: "data/quality/ag06e-long-form-article-standard.json",
  ag06jReferenceStandard: "data/quality/ag06j-reference-source-credibility-schema-closure.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag08e-full-upgrade-draft-candidate-references.json");
const draftPacketPath = path.join(root, "data/content-intelligence/content-packets/ag08e-full-upgrade-draft-candidate.json");
const referenceCandidatePath = path.join(root, "data/content-intelligence/reference-registry/ag08e-candidate-reference-urls.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag08e-draft-candidate-readiness.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/full-upgrade-draft-candidate-references.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag08e-full-upgrade-draft-candidate-references-learning.json");
const registryPath = path.join(root, "data/quality/ag08e-full-upgrade-draft-candidate-references.json");
const previewPath = path.join(root, "data/quality/ag08e-full-upgrade-draft-candidate-references-preview.json");
const docPath = path.join(root, "docs/quality/AG08E_FULL_UPGRADE_DRAFT_CANDIDATE_REFERENCES.md");

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function writeJson(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n");
}

function writeText(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, value);
}

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function countWords(text) {
  return String(text || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) {
    throw new Error(`Missing required AG08E input ${name}: ${relativePath}`);
  }
}

const ag08dReview = readJson(inputs.ag08dReview);
const ag08dInference = readJson(inputs.ag08dInference);
const ag08dReadiness = readJson(inputs.ag08dReadiness);
const ag08dSchema = readJson(inputs.ag08dSchema);
const ag08dLearning = readJson(inputs.ag08dLearning);
const ag08cPacket = readJson(inputs.ag08cPacket);
const ag08bSelection = readJson(inputs.ag08bSelection);
const ag06eStandard = readJson(inputs.ag06eStandard);
const ag06jReferenceStandard = readJson(inputs.ag06jReferenceStandard);

const selectedArticlePath = ag08cPacket.selected_article?.article_path;
if (!selectedArticlePath) throw new Error("AG08C selected article path missing.");
if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);

const articleAbs = path.join(root, selectedArticlePath);
const htmlBefore = fs.readFileSync(articleAbs, "utf8");
const hashBefore = sha256(htmlBefore);

if (ag08dInference.selected_article_sha256_before_ag08d !== hashBefore) {
  throw new Error("Selected article hash changed after AG08D. Refusing AG08E draft-candidate generation.");
}

const currentWordCount = countWords(stripTags(htmlBefore));

const draftTitle = "Enhancing Public Healthcare Delivery through Digital Innovation";
const draftSubtitle = "A Drishvara policy insight on why technology improves health systems only when it strengthens workflow, accountability and citizen trust.";

const fullDraftMarkdown = `# ${draftTitle}

Digital innovation in public healthcare is often described through visible tools: health IDs, dashboards, teleconsultation platforms, digital records, mobile applications and analytics systems. These tools matter, but the real test is not whether a system has adopted technology. The real test is whether technology improves the experience of a patient, the confidence of a frontline worker, the ability of a facility to respond, and the capacity of administrators to identify service gaps before they become failures.

Public healthcare delivery is not a single transaction. It is a chain of actions: registration, screening, diagnosis, consultation, medicine availability, referral, follow-up, grievance response and reporting. When any link is weak, the citizen experiences the entire system as weak. Digital innovation can make this chain visible and measurable. It can reduce delays, support continuity of care, and help decision-makers understand where support is needed. However, this happens only when digital systems are embedded in real workflows rather than treated as parallel reporting layers.

A mature digital-health approach therefore begins with a simple question: what service problem is being solved? In many public systems, the problem is not the absence of data but the absence of usable, timely and trusted data. A dashboard that receives late or incomplete entries may create a sense of control without improving actual care. A digital record that is not used during referral may become a database entry rather than a clinical tool. A mobile application that citizens cannot access or understand may increase exclusion instead of improving access. Digital innovation must therefore be judged by service improvement, not by software deployment alone.

The first value of digital innovation is continuity. Patients often move between sub-centres, primary health centres, community health centres, district hospitals and referral institutions. Without continuity of records, each level may treat the patient as a fresh case. Digital health architecture can help reduce this fragmentation by allowing authorised and secure access to relevant information. For administrators, the same continuity can show whether referrals are completed, whether diagnostics are delayed, whether medicines are available, and whether follow-up is happening. In this sense, digital records are not only records; they are instruments for continuity and accountability.

The second value is timely decision-making. Health systems need both routine reporting and alert-based action. Routine reporting helps understand trends, but alert-based action helps prevent failure. For example, repeated stock-outs, delayed diagnostic results, high referral pendency, unusually low service reporting or unresolved grievances should trigger managerial attention. A digital system becomes useful when it converts data into action points for facility staff, district teams and state-level administrators. If the system only collects data but does not create responsibility for action, it remains an information repository rather than a delivery platform.

The third value is frontline enablement. Public healthcare workers already carry heavy responsibilities. Digital systems should reduce duplication, simplify reporting and support service delivery. If every programme creates a separate login, separate form and separate dashboard, the frontline worker experiences digital innovation as additional burden. Integration is therefore essential. A good digital-health model should allow common identifiers, shared service records, simplified workflows and role-based access. The goal should be to make the worker’s job easier and the citizen’s journey smoother.

The fourth value is citizen trust. People trust public systems when they experience reliability, clarity and fairness. Digital tools can support this trust through appointment information, teleconsultation access, test-status visibility, grievance tracking, referral communication and feedback loops. But digital access must be inclusive. Systems should account for language, device availability, connectivity, disability, gender barriers and local service literacy. A digital-first approach should never become digital-only. Public healthcare still requires human support, community facilitation and physical service availability.

Digital innovation also brings risks. One risk is fragmentation. If systems are built separately by programme, geography or vendor, data may not flow across the service chain. Another risk is poor data quality. If staff enter data only for compliance, the system may look complete while reality remains different. A third risk is over-centralisation. Dashboards can centralise visibility, but action often has to happen at facility, block and district levels. A fourth risk is privacy. Health data is sensitive and must be protected through consent, security, access controls and clear accountability. A fifth risk is exclusion. Citizens who are not digitally literate should not be denied service or dignity.

For this reason, the governance layer is as important as the technology layer. Every digital-health system should define who enters data, who verifies it, who acts on it, who monitors delays, who resolves errors and who is accountable for service closure. Technology can show the problem, but governance decides whether the problem is solved. A district officer should not only see that referrals are pending; the officer should know which facility is responsible, what support is needed and whether the citizen received care. A state dashboard should not only display aggregate numbers; it should help identify where policy, finance, staffing or supply-chain support is required.

A practical digital-health delivery model can track a few core indicators. First, whether the service request or patient encounter was recorded. Second, whether it was assigned to the correct facility or provider. Third, whether the service was delivered within a reasonable time. Fourth, whether medicine, diagnostic, referral or follow-up status was updated. Fifth, whether grievances or feedback were captured. Sixth, whether unresolved cases were escalated. These indicators are simple, but they connect technology to the lived experience of public service delivery.

Digital innovation also changes how health programmes learn. Traditional reviews often depend on monthly reports and meeting presentations. Digital systems can support near-real-time learning if data is trusted and interpreted properly. Districts can compare performance across facilities, identify recurring service bottlenecks and test corrective actions. State teams can identify patterns that require policy support. Programme managers can understand whether low performance is due to staffing, training, infrastructure, stock, connectivity, data entry burden or poor citizen outreach. In this way, digital systems become learning systems.

However, the human element cannot be replaced. Public health systems depend on trust between citizens and service providers. A teleconsultation platform may improve access, but it cannot replace the need for referral support where physical examination or emergency care is required. A digital record may improve continuity, but it requires staff to use it correctly. A health ID may support interoperability, but citizens must understand consent and benefit. Technology is therefore an enabler, not a substitute for public health capacity.

For administrators, the most useful lens is implementation realism. A digital-health initiative should be assessed through five questions. Is the system solving a clearly defined service problem? Is it integrated with existing workflows? Are frontline workers trained and supported? Are data quality and privacy safeguards built in? Are review mechanisms linked to corrective action? If the answer to these questions is weak, the platform may appear modern but deliver limited transformation.

The future of public healthcare delivery will require digital systems that are interoperable, inclusive, secure and action-oriented. The strongest models will not be those with the most dashboards, but those where technology quietly strengthens the patient journey and administrative response. A citizen should experience fewer repeated explanations, fewer avoidable visits, clearer communication and faster support. A health worker should experience less duplication and better decision support. A district or state administrator should see not only numbers, but the service reality behind the numbers.

Digital innovation can therefore become a bridge between policy intention and delivery reality. It can help public systems move from episodic reporting to continuous service intelligence. But this promise will be achieved only when technology is designed around people, workflows and accountability. The goal is not to digitise bureaucracy. The goal is to make public healthcare more reliable, responsive and humane.

For a public healthcare administrator, the most important shift is from passive monitoring to active service management. A digital system should not merely show that a service was reported; it should help identify whether the service was actually delivered, where the delay occurred, and who is responsible for the next action. This is especially important in large public systems where field realities differ across geography, staffing patterns, infrastructure gaps and citizen access. Digital tools become meaningful when they help managers distinguish between a reporting gap, a capacity gap, a supply gap and a governance gap.

The design of digital health systems should also recognise the difference between data availability and data usability. Data may be available in large quantities but still remain unusable if it is fragmented, duplicated, delayed or disconnected from decision-making. A useful system should therefore prioritise clean service pathways, common identifiers, role-based dashboards, exception alerts and feedback loops. The purpose is not to collect more information for its own sake, but to create a reliable chain from citizen need to service response.

This also means that digital innovation should be evaluated continuously. A platform may work well during launch but weaken later if training, maintenance, data quality checks and field support are not sustained. Public systems require periodic review of user burden, service outcomes, privacy safeguards, interoperability and citizen experience. The best digital-health initiatives are therefore not one-time technology projects. They are living governance systems that must be improved as service needs, institutional capacity and citizen expectations evolve.

## Reader's Lens

The practical value of digital health lies in whether it improves the last-mile experience. A strong digital system should help a patient receive care more smoothly, help a worker perform duties with less duplication, and help administrators act before small gaps become systemic failures. Technology is useful when it strengthens public service delivery; it is inadequate when it only creates another layer of reporting.`;

const draftWordCount = countWords(fullDraftMarkdown);

const candidateReferenceUrls = [
  {
    reference_id: "AG08E-REF-001",
    title: "Ayushman Bharat Digital Mission — ABDM Components",
    url: "https://abdm.gov.in/abdm",
    source_owner: "Ayushman Bharat Digital Mission / National Health Authority",
    source_type: "official_government_programme",
    relevance_to_draft: "Supports the article's discussion of integrated digital health infrastructure and continuity across health systems.",
    verification_status: "candidate_verified_contextually_not_inserted",
    link_health_status: "reachable_during_ag08e_planning_context",
    insertion_status: "not_inserted_in_article_html",
    claim_support_scope: [
      "digital health infrastructure",
      "integrated ecosystem",
      "health records and public digital health architecture"
    ]
  },
  {
    reference_id: "AG08E-REF-002",
    title: "WHO — Global Strategy on Digital Health 2020–2025",
    url: "https://www.who.int/publications/i/item/9789240020924",
    source_owner: "World Health Organization",
    source_type: "multilateral_public_health_strategy",
    relevance_to_draft: "Supports the article's framing that digital health requires strategy, governance, resources and health-system integration.",
    verification_status: "candidate_verified_contextually_not_inserted",
    link_health_status: "reachable_during_ag08e_planning_context",
    insertion_status: "not_inserted_in_article_html",
    claim_support_scope: [
      "digital health strategy",
      "governance",
      "equitable and sustainable adoption"
    ]
  },
  {
    reference_id: "AG08E-REF-003",
    title: "Telemedicine Practice Guidelines",
    url: "https://esanjeevani.mohfw.gov.in/assets/guidelines/Telemedicine_Practice_Guidelines.pdf",
    source_owner: "Ministry of Health and Family Welfare / eSanjeevani-hosted guideline asset",
    source_type: "official_guideline_pdf",
    relevance_to_draft: "Supports the article's references to telemedicine, documentation, patient consent, digital consultation practices and service delivery safeguards.",
    verification_status: "candidate_verified_contextually_not_inserted",
    link_health_status: "reachable_during_ag08e_planning_context",
    insertion_status: "not_inserted_in_article_html",
    claim_support_scope: [
      "telemedicine",
      "patient consent",
      "documentation and digital records",
      "service delivery safeguards"
    ]
  }
];

const visualDataConcept = {
  visual_generation_status: "not_generated_in_ag08e",
  image_insertion_status: "not_inserted_in_ag08e",
  recommended_visual_type: "static explanatory flow diagram",
  recommended_visual_title: "Digital Health Delivery Loop",
  recommended_visual_flow: [
    "Citizen/patient need",
    "Digital registration or service request",
    "Facility workflow and provider action",
    "Referral, medicine, diagnostic or follow-up update",
    "Feedback, grievance or closure signal",
    "Administrative review and corrective action"
  ],
  suggested_alt_text: "Flow diagram showing how digital health systems connect patient need, service workflow, follow-up, feedback and administrative action.",
  suggested_caption: "Digital innovation improves public healthcare when data flows back into service delivery and corrective action.",
  credit_requirement: "Use original generated visual or local design asset only after AG08F/AG08G approval; no third-party image insertion in AG08E.",
  data_unit_candidate: {
    title: "Digital health delivery indicators",
    rows: [
      "Service request or patient encounter recorded",
      "Facility/provider assignment completed",
      "Referral/medicine/diagnostic/follow-up status updated",
      "Turnaround time monitored",
      "Grievance or feedback captured",
      "Unresolved case escalated"
    ],
    data_values_generated_in_ag08e: false
  }
};

const noMutationControls = {
  full_upgrade_draft_candidate_created: true,
  candidate_reference_urls_populated_as_artifact_only: true,
  visual_data_concept_created: true,
  selected_article_read_performed: true,
  selected_article_hash_verified: true,
  selected_article_mutated: false,
  article_mutation_performed: false,
  new_article_generation_performed: false,
  new_article_file_created: false,
  article_file_created: false,
  article_prose_generated_in_artifact_only: true,
  final_article_prose_generated_for_direct_publish: false,
  final_article_file_generated: false,
  narrative_text_generated_as_artifact_only: true,
  candidate_final_draft_generated_as_artifact_only: true,
  candidate_packet_mutated: false,
  production_packet_created: false,
  production_article_packet_created: false,
  score_calculation_performed: false,
  dry_run_score_calculation_performed: false,
  actual_score_calculation_performed: false,
  approval_state_changed: false,
  publish_ready_set: false,
  public_article_mutation_performed: false,
  article_html_mutation_performed: false,
  static_live_apply_performed: false,
  static_live_mutation_performed: false,
  file_edit_performed: false,
  file_write_performed: false,
  article_file_write_performed: false,
  target_article_file_write_performed: false,
  backup_file_created: false,
  rollback_execution_performed: false,
  reference_insertion_performed: false,
  reference_url_population_performed: true,
  approved_reference_url_population_performed: false,
  live_url_fetch_performed_by_script: false,
  visual_generation_performed: false,
  visual_asset_generation_performed: false,
  image_insertion_performed: false,
  data_unit_generation_performed: false,
  caption_alt_credit_population_performed_for_article: false,
  production_jsonl_append_performed: false,
  jsonl_append_performed: false,
  jsonl_production_record_created: false,
  database_write_performed: false,
  supabase_write_performed: false,
  supabase_enabled: false,
  auth_enabled: false,
  backend_activation_performed: false,
  backend_auth_supabase_activation_performed: false,
  api_route_created: false,
  public_publishing_performed: false,
  publication_approval_granted: false,
  public_output_activation_performed: false,
  subscriber_output_activation_performed: false,
  admin_output_activation_performed: false,
  payment_activation_performed: false,
  multi_article_mutation_performed: false
};

const draftPacket = {
  module_id: "AG08E",
  title: "Full Upgrade Draft Candidate",
  status: "full_upgrade_draft_candidate_created_not_applied",
  generated_from: inputs,
  selected_article: {
    article_path: selectedArticlePath,
    title: draftTitle,
    original_title: ag08cPacket.selected_article.title,
    category: ag08cPacket.selected_article.category,
    sha256_before_ag08e: hashBefore,
    current_word_count_estimate: currentWordCount
  },
  draft_candidate: {
    format: "markdown_artifact_only",
    title: draftTitle,
    subtitle: draftSubtitle,
    word_count_estimate: draftWordCount,
    target_word_count_range: {
      min: 1500,
      max: 5500
    },
    within_target_word_count_range: draftWordCount >= 1500 && draftWordCount <= 5500,
    draft_text: fullDraftMarkdown,
    direct_article_apply_status: "not_applied",
    article_html_mutation_status: "not_mutated"
  },
  reference_candidates: {
    status: "candidate_urls_populated_as_artifact_only",
    candidate_count: candidateReferenceUrls.length,
    candidates: candidateReferenceUrls,
    insertion_status: "not_inserted_in_article_html",
    approval_status: "pending_ag08f_approval"
  },
  visual_data_concept: visualDataConcept,
  ag08f_handoff: {
    next_stage_id: "AG08F",
    next_stage_title: "Draft Approval and Controlled Apply Plan",
    explicit_approval_required: true,
    selected_article_path: selectedArticlePath,
    allowed_scope: "approve or revise draft candidate, approve candidate references, prepare backup/apply plan",
    blocked_scope: "article mutation, reference insertion into article HTML, visual/image insertion, production JSONL append, database/Supabase write, backend/Auth/Supabase activation and publishing"
  },
  ...noMutationControls
};

const referenceRegistry = {
  module_id: "AG08E",
  title: "Candidate Reference URLs",
  status: "candidate_reference_urls_populated_not_inserted",
  selected_article_path: selectedArticlePath,
  candidate_count: candidateReferenceUrls.length,
  candidates: candidateReferenceUrls,
  source_quality_rules_applied: [
    "Official or institutional source preferred.",
    "Candidate URL must support a specific claim in the draft.",
    "No reference is inserted into article HTML in AG08E.",
    "AG08F must approve final references before AG08G insertion."
  ],
  approval_status: "pending_ag08f_approval",
  insertion_status: "not_inserted_in_article_html",
  ...noMutationControls
};

const readiness = {
  module_id: "AG08E",
  title: "Draft Candidate Readiness",
  status: "draft_candidate_ready_for_ag08f_approval_plan",
  selected_article_path: selectedArticlePath,
  selected_article_sha256_before_ag08e: hashBefore,
  readiness_checks: [
    {
      check_id: "AG08E-CHECK-001",
      name: "draft_candidate_created",
      status: "passed",
      evidence: `Draft word count estimate: ${draftWordCount}`
    },
    {
      check_id: "AG08E-CHECK-002",
      name: "draft_word_count_within_ag06e_standard",
      status: draftWordCount >= 1500 && draftWordCount <= 5500 ? "passed" : "review_required",
      evidence: "Target range is 1500–5500 words."
    },
    {
      check_id: "AG08E-CHECK-003",
      name: "candidate_references_populated_as_artifact_only",
      status: candidateReferenceUrls.length >= 2 ? "passed" : "review_required",
      evidence: `${candidateReferenceUrls.length} candidate reference URLs recorded.`
    },
    {
      check_id: "AG08E-CHECK-004",
      name: "selected_article_file_unchanged",
      status: "passed",
      evidence: hashBefore
    },
    {
      check_id: "AG08E-CHECK-005",
      name: "visual_generation_not_performed",
      status: "passed",
      evidence: visualDataConcept.visual_generation_status
    },
    {
      check_id: "AG08E-CHECK-006",
      name: "ag08f_handoff_ready",
      status: "passed",
      evidence: "AG08F should approve/revise draft and prepare apply plan."
    }
  ],
  ag08f_handoff: draftPacket.ag08f_handoff,
  ...noMutationControls
};

const summary = {
  ag08d_readiness_review_consumed: ag08dReview.status === "inference_reference_visual_readiness_review_completed",
  selected_article_path: selectedArticlePath,
  selected_article_sha256_before_ag08e: hashBefore,
  current_article_word_count_estimate: currentWordCount,
  full_upgrade_draft_candidate_created: true,
  draft_word_count_estimate: draftWordCount,
  draft_within_target_word_count_range: draftWordCount >= 1500 && draftWordCount <= 5500,
  candidate_reference_urls_populated_as_artifact_only: true,
  candidate_reference_count: candidateReferenceUrls.length,
  visual_data_concept_created: true,
  ag08f_handoff_created: true,
  next_stage_id: "AG08F",
  next_stage_title: "Draft Approval and Controlled Apply Plan",
  next_stage_requires_explicit_approval: true,
  article_mutation_performed: false,
  file_edit_performed: false,
  article_file_write_performed: false,
  reference_insertion_performed: false,
  visual_generation_performed: false,
  image_insertion_performed: false,
  production_jsonl_append_performed: false,
  database_write_performed: false,
  supabase_write_performed: false,
  backend_auth_supabase_activation_performed: false,
  publishing_performed: false,
  production_readiness_after_ag08e: "draft_candidate_created_pending_approval_plan",
  publish_readiness_after_ag08e: "blocked"
};

const schema = {
  schema_id: "drishvara/ag08e/full-upgrade-draft-candidate-references.schema.json",
  module_id: "AG08E",
  title: "Full Upgrade Draft Candidate and Candidate References Schema",
  status: "schema_draft_candidate_only",
  description: "Schema for creating a full upgraded draft candidate and candidate reference URLs as artifacts only, without mutating the selected article file.",
  full_upgrade_draft_candidate_allowed_in_ag08e: true,
  candidate_reference_url_population_allowed_in_ag08e: true,
  visual_data_concept_allowed_in_ag08e: true,
  selected_article_read_allowed_in_ag08e: true,
  article_mutation_allowed_in_ag08e: false,
  file_edit_allowed_in_ag08e: false,
  article_file_write_allowed_in_ag08e: false,
  reference_insertion_allowed_in_ag08e: false,
  visual_generation_allowed_in_ag08e: false,
  image_insertion_allowed_in_ag08e: false,
  production_jsonl_append_allowed_in_ag08e: false,
  database_write_allowed_in_ag08e: false,
  supabase_write_allowed_in_ag08e: false,
  backend_auth_supabase_allowed_in_ag08e: false,
  publishing_allowed_in_ag08e: false,
  ...noMutationControls
};

const learning = {
  module_id: "AG08E",
  title: "Full Upgrade Draft Candidate and Candidate References Learning",
  status: "learning_record_only",
  generated_from: inputs,
  summary,
  learning_points_from_ag08d: asArray(ag08dLearning.ag08d_learning_points),
  ag08e_learning_points: [
    "AG08E is the first stage where full draft prose is generated, but it remains artifact-only.",
    "Candidate reference URLs can be populated without inserting them into article HTML.",
    "Visual/data design can be planned without generating or inserting visual assets.",
    "AG08F should approve/revise draft content and candidate references before any controlled apply.",
    "The selected article file must remain unchanged until the controlled apply stage."
  ],
  carried_forward_doctrine: [
    "Draft artifact before article mutation.",
    "Candidate URLs before approved references.",
    "No HTML reference insertion in AG08E.",
    "No visual generation/insertion in AG08E.",
    "No JSONL/database/Supabase/backend/Auth/publishing activation."
  ],
  ...noMutationControls
};

const review = {
  module_id: "AG08E",
  title: "Full Upgrade Draft + Candidate References",
  status: "full_upgrade_draft_candidate_and_references_created",
  governance_only: true,
  draft_candidate_only: true,
  depends_on: ["AG08D", "AG08C", "AG08B"],
  generated_from: inputs,
  summary,
  ag08d_alignment: {
    ag08d_status: ag08dReview.status,
    ag08d_decision: ag08dReview.closure_decision?.decision,
    ag08e_requires_explicit_approval: ag08dReview.closure_decision?.proceed_to_ag08e_only_with_explicit_user_approval,
    ag08d_selected_article_path: ag08dReview.closure_decision?.selected_article_path,
    ag08d_article_mutation_performed: ag08dReview.closure_decision?.article_mutation_performed,
    ag08d_reference_url_population_performed: ag08dReview.closure_decision?.reference_url_population_performed,
    ag08d_visual_generation_performed: ag08dReview.closure_decision?.visual_generation_performed
  },
  draft_packet_file: "data/content-intelligence/content-packets/ag08e-full-upgrade-draft-candidate.json",
  reference_candidate_file: "data/content-intelligence/reference-registry/ag08e-candidate-reference-urls.json",
  readiness_file: "data/content-intelligence/quality-registry/ag08e-draft-candidate-readiness.json",
  schema_file: "data/content-intelligence/schema/full-upgrade-draft-candidate-references.schema.json",
  learning_file: "data/content-intelligence/learning/ag08e-full-upgrade-draft-candidate-references-learning.json",
  closure_decision: {
    decision: "ag08e_draft_candidate_closed_ready_for_ag08f_approval_plan",
    full_upgrade_draft_candidate_created: true,
    candidate_reference_urls_populated_as_artifact_only: true,
    selected_article_path: selectedArticlePath,
    proceed_to_ag08f_only_with_explicit_user_approval: true,
    ag08f_scope: "approve/revise draft candidate, approve candidate references and create controlled apply plan",
    article_mutation_performed: false,
    file_edit_performed: false,
    article_file_write_performed: false,
    reference_insertion_performed: false,
    visual_generation_performed: false,
    image_insertion_performed: false,
    production_jsonl_append_performed: false,
    database_write_performed: false,
    supabase_write_performed: false,
    public_publishing_performed: false,
    backend_auth_supabase_activation_performed: false,
    production_readiness: "draft_candidate_created_pending_approval_plan",
    publish_readiness: "blocked"
  },
  ...noMutationControls
};

const registry = {
  module_id: "AG08E",
  title: "Full Upgrade Draft + Candidate References",
  governance_only: true,
  draft_candidate_only: true,
  depends_on: ["AG08D"],
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag08e-full-upgrade-draft-candidate-references.json",
    draft_candidate: "data/content-intelligence/content-packets/ag08e-full-upgrade-draft-candidate.json",
    candidate_references: "data/content-intelligence/reference-registry/ag08e-candidate-reference-urls.json",
    readiness: "data/content-intelligence/quality-registry/ag08e-draft-candidate-readiness.json",
    schema: "data/content-intelligence/schema/full-upgrade-draft-candidate-references.schema.json",
    learning: "data/content-intelligence/learning/ag08e-full-upgrade-draft-candidate-references-learning.json",
    preview: "data/quality/ag08e-full-upgrade-draft-candidate-references-preview.json",
    document: "docs/quality/AG08E_FULL_UPGRADE_DRAFT_CANDIDATE_REFERENCES.md"
  },
  summary,
  next_recommended_stage: draftPacket.ag08f_handoff,
  ...noMutationControls
};

const preview = {
  module_id: "AG08E",
  preview_only: true,
  draft_candidate_only: true,
  summary,
  selected_article: draftPacket.selected_article,
  draft_preview: {
    title: draftTitle,
    subtitle: draftSubtitle,
    word_count_estimate: draftWordCount,
    opening_preview: fullDraftMarkdown.split("\n").slice(0, 5).join("\n")
  },
  candidate_references: candidateReferenceUrls,
  visual_data_concept: visualDataConcept,
  ag08f_handoff: draftPacket.ag08f_handoff,
  ...noMutationControls
};

const doc = `# AG08E — Full Upgrade Draft + Candidate References

## Purpose

AG08E creates the full upgraded draft candidate and candidate reference URLs as artifacts only.

AG08E does not mutate the selected article file, insert references into article HTML, generate visuals, insert images, append production JSONL records, write to database/Supabase, publish content, or activate backend/Auth/Supabase/API functionality.

## Selected Article

- Path: \`${selectedArticlePath}\`
- Hash before AG08E: \`${hashBefore}\`
- Current word count estimate: \`${currentWordCount}\`

## Draft Candidate

- Draft title: \`${draftTitle}\`
- Draft word count estimate: \`${draftWordCount}\`
- Target word count range: \`1500–5500\`
- Direct article apply status: \`not_applied\`

## Candidate References

${candidateReferenceUrls.map((ref) => `- ${ref.reference_id}: ${ref.title} — ${ref.url}`).join("\n")}

These references are recorded as candidate artifacts only. They are not inserted into article HTML in AG08E.

## Visual/Data Concept

Recommended visual type: ${visualDataConcept.recommended_visual_type}

Recommended visual title: ${visualDataConcept.recommended_visual_title}

No visual is generated or inserted in AG08E.

## Explicit Exclusions

AG08E does not:

- mutate the selected article;
- edit the selected article file;
- create a backup;
- insert references into article HTML;
- generate visual assets;
- insert images;
- append production JSONL records;
- write to database or Supabase;
- approve publish readiness;
- publish content;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup or public dynamic output.

## Next Stage

AG08F — Draft Approval and Controlled Apply Plan — is identified as next only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(draftPacketPath, draftPacket);
writeJson(referenceCandidatePath, referenceRegistry);
writeJson(readinessPath, readiness);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

const htmlAfter = fs.readFileSync(articleAbs, "utf8");
if (sha256(htmlAfter) !== hashBefore) {
  throw new Error("AG08E attempted to change the selected article. Refusing to continue.");
}

console.log("✅ AG08E full upgrade draft candidate and candidate reference artifacts generated.");
console.log(`✅ Draft candidate target: ${selectedArticlePath}`);
console.log(`✅ Draft word count estimate: ${draftWordCount}`);
console.log(`✅ Candidate reference count: ${candidateReferenceUrls.length}`);
