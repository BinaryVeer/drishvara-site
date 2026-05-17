import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag08bReview: "data/content-intelligence/quality-reviews/ag08b-pipeline-test-article-selection.json",
  ag08bSelection: "data/content-intelligence/selection-registry/ag08b-selected-pipeline-test-article.json",
  ag08bScorecard: "data/content-intelligence/selection-registry/ag08b-pipeline-test-candidate-scorecard.json",
  ag08bSchema: "data/content-intelligence/schema/pipeline-test-article-selection.schema.json",
  ag08bLearning: "data/content-intelligence/learning/ag08b-pipeline-test-article-selection-learning.json",
  ag08aRoadmap: "data/content-intelligence/run-registry/ag08a-repeatable-article-upgrade-roadmap.json",
  ag06eStandard: "data/quality/ag06e-long-form-article-standard.json",
  ag06iVisualStandard: "data/quality/ag06i-visual-data-infographic-requirement-schema-closure.json",
  ag06jReferenceStandard: "data/quality/ag06j-reference-source-credibility-schema-closure.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag08c-article-upgrade-candidate-packet.json");
const packetPath = path.join(root, "data/content-intelligence/content-packets/ag08c-article-upgrade-candidate-packet.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag08c-candidate-packet-readiness.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/article-upgrade-candidate-packet.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag08c-article-upgrade-candidate-packet-learning.json");
const registryPath = path.join(root, "data/quality/ag08c-article-upgrade-candidate-packet.json");
const previewPath = path.join(root, "data/quality/ag08c-article-upgrade-candidate-packet-preview.json");
const docPath = path.join(root, "docs/quality/AG08C_ARTICLE_UPGRADE_CANDIDATE_PACKET.md");

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
    .replace(/&#8217;/g, "’")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(html) {
  const text = stripTags(html);
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

function extractTitle(html, fallback) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1?.[1]) return stripTags(h1[1]);

  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (title?.[1]) return stripTags(title[1]);

  return fallback
    .replace(/\.html$/i, "")
    .split(/[\/_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function extractMetaDescription(html) {
  const match = html.match(/<meta\s+name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  return match?.[1]?.trim() || "";
}

function countPattern(html, pattern) {
  const matches = html.match(pattern);
  return matches ? matches.length : 0;
}

function categoryFromPath(relativePath) {
  const parts = relativePath.split(path.sep);
  return parts.length >= 3 ? parts[1] : "unknown";
}

function estimateReadingMinutes(words) {
  return Math.max(1, Math.round(words / 220));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) {
    throw new Error(`Missing required AG08C input ${name}: ${relativePath}`);
  }
}

const ag08bReview = readJson(inputs.ag08bReview);
const ag08bSelection = readJson(inputs.ag08bSelection);
const ag08bScorecard = readJson(inputs.ag08bScorecard);
const ag08bSchema = readJson(inputs.ag08bSchema);
const ag08bLearning = readJson(inputs.ag08bLearning);
const ag08aRoadmap = readJson(inputs.ag08aRoadmap);
const ag06eStandard = readJson(inputs.ag06eStandard);
const ag06iVisualStandard = readJson(inputs.ag06iVisualStandard);
const ag06jReferenceStandard = readJson(inputs.ag06jReferenceStandard);

const selectedArticlePath = ag08bSelection.selected_article?.article_path;
if (!selectedArticlePath) throw new Error("AG08B selected article path missing.");
if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);

const selectedArticleAbs = path.join(root, selectedArticlePath);
const htmlBefore = fs.readFileSync(selectedArticleAbs, "utf8");
const hashBefore = sha256(htmlBefore);

const originalHashFromAg08b = ag08bSelection.selected_article?.sha256_at_selection;
if (originalHashFromAg08b && originalHashFromAg08b !== hashBefore) {
  throw new Error("Selected article hash changed after AG08B selection. Refusing AG08C candidate packet generation.");
}

const currentTitle = extractTitle(htmlBefore, path.basename(selectedArticlePath));
const category = categoryFromPath(selectedArticlePath);
const currentWords = wordCount(htmlBefore);
const metaDescription = extractMetaDescription(htmlBefore);
const currentReadingMinutes = estimateReadingMinutes(currentWords);
const paragraphCount = countPattern(htmlBefore, /<p[\s>]/gi);
const headingCount = countPattern(htmlBefore, /<h[1-6][\s>]/gi);
const linkCount = countPattern(htmlBefore, /<a\s+/gi);
const imageCount = countPattern(htmlBefore, /<img\s+/gi);
const hasVisibleReferenceSignal = /AG03|AG05D|verified reference|Verified references|References|reference/i.test(htmlBefore);
const hasImageCreditSignal = /image-credit|Image Credit|attribution|Attribution|credit/i.test(htmlBefore);
const hasAg07pMarker = htmlBefore.includes("AG07P-CONTROLLED-APPLY");

const noMutationControls = {
  candidate_packet_only: true,
  selected_article_read_performed: true,
  selected_article_hash_recorded: true,
  current_article_analysis_created: true,
  upgrade_candidate_packet_created: true,
  readiness_record_created: true,
  selected_article_mutated: false,
  article_mutation_performed: false,
  new_article_generation_performed: false,
  new_article_file_created: false,
  article_file_created: false,
  article_prose_generated: false,
  final_article_prose_generated: false,
  narrative_text_generated: false,
  production_packet_created: false,
  article_inference_generated: false,
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
  reference_url_population_performed: false,
  approved_reference_url_population_performed: false,
  live_url_fetch_performed: false,
  visual_generation_performed: false,
  visual_asset_generation_performed: false,
  image_insertion_performed: false,
  data_unit_generation_performed: false,
  caption_alt_credit_population_performed: false,
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

const targetWordMin = 1500;
const targetWordMax = 2200;
const targetReferenceMin = 2;
const targetReferenceMax = 5;

const currentArticleAnalysis = {
  selected_article_path: selectedArticlePath,
  title_detected: currentTitle,
  category_detected: category,
  sha256_before_ag08c: hashBefore,
  word_count_estimate: currentWords,
  reading_time_minutes_estimate: currentReadingMinutes,
  paragraph_count: paragraphCount,
  heading_count: headingCount,
  link_count: linkCount,
  image_count: imageCount,
  meta_description_present: Boolean(metaDescription),
  meta_description_preview: metaDescription,
  visible_reference_signal_present: hasVisibleReferenceSignal,
  image_credit_signal_present: hasImageCreditSignal,
  ag07p_pilot_marker_present: hasAg07pMarker,
  article_file_size_bytes: Buffer.byteLength(htmlBefore, "utf8"),
  long_form_gap: {
    target_min_words: targetWordMin,
    target_max_words: targetWordMax,
    current_words: currentWords,
    estimated_gap_to_min_words: Math.max(0, targetWordMin - currentWords),
    current_status: currentWords >= targetWordMin && currentWords <= targetWordMax ? "within_long_form_band" : "upgrade_required"
  }
};

const upgradeHypothesis = {
  core_upgrade_goal: "Convert the selected article into a stronger Drishvara long-form policy insight piece without changing the article file in AG08C.",
  reader_value_goal: "Help readers understand how digital innovation can improve public healthcare delivery beyond technology adoption, focusing on governance, service reliability, data use, accountability and citizen experience.",
  proposed_reader_promise: "A clearer, practical explanation of why digital health systems succeed only when technology, workflow, field capacity and accountability move together.",
  proposed_angle: "Digital health innovation as a governance and delivery-strengthening instrument, not merely a software or dashboard exercise.",
  expected_upgrade_type: "existing_article_long_form_upgrade",
  expected_upgrade_mode_after_approval: "one_article_controlled_static_apply"
};

const proposedStructure = [
  {
    section_id: "AG08C-SEC-001",
    heading: "Why digital innovation matters in public healthcare delivery",
    purpose: "Set up the governance and service-delivery context.",
    estimated_words: 220,
    prose_generation_status: "not_generated"
  },
  {
    section_id: "AG08C-SEC-002",
    heading: "From technology adoption to service improvement",
    purpose: "Distinguish tools from outcomes and explain why implementation quality matters.",
    estimated_words: 260,
    prose_generation_status: "not_generated"
  },
  {
    section_id: "AG08C-SEC-003",
    heading: "Data systems, accountability and frontline workflows",
    purpose: "Explain how dashboards, records and alerts become useful only when tied to field workflows.",
    estimated_words: 320,
    prose_generation_status: "not_generated"
  },
  {
    section_id: "AG08C-SEC-004",
    heading: "Digital inclusion and patient trust",
    purpose: "Cover citizen experience, access, language, grievance channels and last-mile usability.",
    estimated_words: 260,
    prose_generation_status: "not_generated"
  },
  {
    section_id: "AG08C-SEC-005",
    heading: "Risks: fragmentation, data quality and over-centralisation",
    purpose: "Record balanced risks and implementation safeguards.",
    estimated_words: 280,
    prose_generation_status: "not_generated"
  },
  {
    section_id: "AG08C-SEC-006",
    heading: "What a mature digital-health delivery model should track",
    purpose: "Introduce useful indicators and practical monitoring dimensions.",
    estimated_words: 300,
    prose_generation_status: "not_generated"
  },
  {
    section_id: "AG08C-SEC-007",
    heading: "Reader’s lens",
    purpose: "End with a practical interpretation for policy readers and administrators.",
    estimated_words: 180,
    prose_generation_status: "not_generated"
  }
];

const referenceNeedPlan = {
  reference_population_status: "not_populated_in_ag08c",
  reference_insertion_status: "not_inserted_in_ag08c",
  required_reference_count_range: {
    min: targetReferenceMin,
    max: targetReferenceMax
  },
  candidate_reference_themes: [
    "Digital health mission / national digital health architecture",
    "Public health system strengthening and service delivery",
    "Health information systems and data quality",
    "Telemedicine or digital access in public healthcare",
    "Governance/accountability frameworks for health service delivery"
  ],
  url_population_allowed_in_ag08c: false,
  live_url_fetch_allowed_in_ag08c: false,
  reference_insertion_allowed_in_ag08c: false
};

const visualDataNeedPlan = {
  visual_generation_status: "not_generated_in_ag08c",
  image_insertion_status: "not_inserted_in_ag08c",
  recommended_visual_type: "simple explanatory flow diagram",
  recommended_visual_concept: "Patient need → digital record/triage → facility workflow → referral/medicine/service → feedback/accountability loop",
  recommended_data_unit: {
    type: "indicator_checklist",
    title: "Digital health delivery indicators",
    candidate_metrics: [
      "service request logged",
      "case/facility assignment",
      "turnaround time",
      "stock/referral status",
      "grievance closure",
      "patient feedback"
    ],
    data_values_generated_in_ag08c: false
  },
  caption_alt_credit_population_allowed_in_ag08c: false,
  visual_generation_allowed_in_ag08c: false,
  image_insertion_allowed_in_ag08c: false
};

const readinessGates = [
  {
    gate_id: "AG08C-GATE-001",
    name: "selected_article_exists",
    status: "passed",
    evidence: selectedArticlePath
  },
  {
    gate_id: "AG08C-GATE-002",
    name: "selected_article_hash_matches_ag08b",
    status: originalHashFromAg08b === hashBefore ? "passed" : "not_applicable_no_prior_hash",
    evidence: hashBefore
  },
  {
    gate_id: "AG08C-GATE-003",
    name: "candidate_packet_created_without_article_mutation",
    status: "passed",
    evidence: "AG08C writes only governance/candidate artifacts."
  },
  {
    gate_id: "AG08C-GATE-004",
    name: "long_form_upgrade_gap_identified",
    status: currentArticleAnalysis.long_form_gap.current_status === "upgrade_required" ? "passed" : "watch",
    evidence: currentArticleAnalysis.long_form_gap
  },
  {
    gate_id: "AG08C-GATE-005",
    name: "reference_need_plan_created_without_url_population",
    status: "passed",
    evidence: referenceNeedPlan.candidate_reference_themes
  },
  {
    gate_id: "AG08C-GATE-006",
    name: "visual_data_need_plan_created_without_generation",
    status: "passed",
    evidence: visualDataNeedPlan.recommended_visual_type
  },
  {
    gate_id: "AG08C-GATE-007",
    name: "ag08d_handoff_ready",
    status: "passed",
    evidence: "AG08D should perform inference, reference and visual readiness review only with explicit approval."
  }
];

const readinessRecord = {
  module_id: "AG08C",
  title: "Candidate Packet Readiness Record",
  status: "candidate_packet_ready_for_ag08d_review",
  generated_from: inputs,
  selected_article_path: selectedArticlePath,
  selected_article_sha256_before_ag08c: hashBefore,
  readiness_gates: readinessGates,
  all_readiness_gates_passed_or_watch: readinessGates.every((gate) => ["passed", "watch", "not_applicable_no_prior_hash"].includes(gate.status)),
  ag08d_handoff: {
    next_stage_id: "AG08D",
    next_stage_title: "Inference, Reference and Visual Readiness Review",
    explicit_approval_required: true,
    selected_article_path: selectedArticlePath,
    allowed_scope: "review candidate packet, create inference/readiness review and identify gaps",
    blocked_scope: "article mutation, final prose generation, reference URL population, reference insertion, visual generation, image insertion, JSONL/database/Supabase/backend/Auth/publishing activation"
  },
  ...noMutationControls
};

const candidatePacket = {
  module_id: "AG08C",
  title: "Article Upgrade Candidate Packet",
  status: "candidate_packet_created_not_mutated",
  generated_from: inputs,
  selected_article: {
    article_path: selectedArticlePath,
    title: currentTitle,
    category,
    sha256_before_ag08c: hashBefore,
    selected_by_ag08b: true,
    selection_score: ag08bSelection.selected_article?.score_breakdown?.total_score ?? null
  },
  current_article_analysis: currentArticleAnalysis,
  upgrade_hypothesis: upgradeHypothesis,
  proposed_structure: proposedStructure,
  reference_need_plan: referenceNeedPlan,
  visual_data_need_plan: visualDataNeedPlan,
  quality_targets: {
    target_word_count_range: {
      min: targetWordMin,
      max: targetWordMax
    },
    target_reference_count_range: {
      min: targetReferenceMin,
      max: targetReferenceMax
    },
    target_reader_value: [
      "clear public-policy insight",
      "implementation-focused explanation",
      "balanced risks and safeguards",
      "practical governance indicators",
      "readable long-form structure"
    ],
    scoring_status: "not_scored_in_ag08c"
  },
  blocked_until_later_stages: {
    article_prose_generation: "blocked_until_explicit_generation_or_apply_stage",
    article_file_mutation: "blocked_until_explicit_controlled_apply_stage",
    reference_url_population: "blocked_until_reference_readiness_or discovery stage",
    reference_insertion: "blocked_until_approved_insertion_stage",
    visual_generation: "blocked_until_visual_generation_stage",
    jsonl_database_supabase_write: "blocked",
    backend_auth_supabase_activation: "blocked",
    publishing: "blocked"
  },
  ag08d_handoff: readinessRecord.ag08d_handoff,
  ...noMutationControls
};

const summary = {
  ag08b_selection_consumed: ag08bReview.status === "one_article_selected_for_pipeline_test",
  candidate_packet_created: true,
  selected_article_path: selectedArticlePath,
  selected_article_title: currentTitle,
  selected_article_category: category,
  selected_article_word_count_estimate: currentWords,
  selected_article_sha256_before_ag08c: hashBefore,
  long_form_gap_status: currentArticleAnalysis.long_form_gap.current_status,
  proposed_section_count: proposedStructure.length,
  reference_need_plan_created: true,
  visual_data_need_plan_created: true,
  readiness_record_created: true,
  next_stage_id: "AG08D",
  next_stage_title: "Inference, Reference and Visual Readiness Review",
  next_stage_requires_explicit_approval: true,
  article_mutation_performed: false,
  file_edit_performed: false,
  article_prose_generated: false,
  reference_url_population_performed: false,
  reference_insertion_performed: false,
  visual_generation_performed: false,
  image_insertion_performed: false,
  production_jsonl_append_performed: false,
  database_write_performed: false,
  supabase_write_performed: false,
  backend_auth_supabase_activation_performed: false,
  publishing_performed: false,
  production_readiness_after_ag08c: "candidate_packet_created_not_production_ready",
  publish_readiness_after_ag08c: "blocked"
};

const schema = {
  schema_id: "drishvara/ag08c/article-upgrade-candidate-packet.schema.json",
  module_id: "AG08C",
  title: "Article Upgrade Candidate Packet Schema",
  status: "schema_candidate_packet_only",
  description: "Schema for creating a candidate upgrade packet for the selected AG08B article without mutating article files or activating runtime systems.",
  required_top_level_fields: [
    "selected_article",
    "current_article_analysis",
    "upgrade_hypothesis",
    "proposed_structure",
    "reference_need_plan",
    "visual_data_need_plan",
    "quality_targets",
    "blocked_until_later_stages"
  ],
  candidate_packet_creation_allowed_in_ag08c: true,
  selected_article_read_allowed_in_ag08c: true,
  current_article_analysis_allowed_in_ag08c: true,
  proposed_structure_allowed_in_ag08c: true,
  reference_need_planning_allowed_in_ag08c: true,
  visual_data_need_planning_allowed_in_ag08c: true,
  article_mutation_allowed_in_ag08c: false,
  article_prose_generation_allowed_in_ag08c: false,
  file_edit_allowed_in_ag08c: false,
  reference_url_population_allowed_in_ag08c: false,
  reference_insertion_allowed_in_ag08c: false,
  visual_generation_allowed_in_ag08c: false,
  image_insertion_allowed_in_ag08c: false,
  production_jsonl_append_allowed_in_ag08c: false,
  database_write_allowed_in_ag08c: false,
  supabase_write_allowed_in_ag08c: false,
  backend_auth_supabase_allowed_in_ag08c: false,
  publishing_allowed_in_ag08c: false,
  ...noMutationControls
};

const learning = {
  module_id: "AG08C",
  title: "Article Upgrade Candidate Packet Learning",
  status: "learning_record_only",
  candidate_packet_only: true,
  generated_from: inputs,
  summary,
  learning_points_from_ag08b: asArray(ag08bLearning.ag08b_learning_points),
  ag08c_learning_points: [
    "A candidate packet should define upgrade intent before any article rewrite or file mutation.",
    "Current article hash should be recorded before downstream apply stages.",
    "Reference and visual needs can be planned without URL population or image generation.",
    "The proposed section plan is not final article prose.",
    "AG08D should review inference/readiness before scoring or apply planning."
  ],
  carried_forward_doctrine: [
    "Selected article only.",
    "Candidate packet before prose generation.",
    "No article mutation in AG08C.",
    "No reference URL population in AG08C.",
    "No visual generation in AG08C.",
    "No JSONL/database/Supabase/backend/Auth/publishing activation."
  ],
  ...noMutationControls
};

const review = {
  module_id: "AG08C",
  title: "Article Upgrade Candidate Packet",
  status: "article_upgrade_candidate_packet_created",
  governance_only: true,
  candidate_packet_only: true,
  depends_on: ["AG08B", "AG08A", "AG07Z"],
  generated_from: inputs,
  summary,
  ag08b_alignment: {
    ag08b_status: ag08bReview.status,
    ag08b_decision: ag08bReview.closure_decision?.decision,
    ag08c_requires_explicit_approval: ag08bReview.closure_decision?.proceed_to_ag08c_only_with_explicit_user_approval,
    ag08b_selected_article_path: ag08bReview.closure_decision?.selected_article_path,
    ag08b_article_mutation_performed: ag08bReview.closure_decision?.article_mutation_performed,
    ag08b_file_edit_performed: ag08bReview.closure_decision?.file_edit_performed
  },
  candidate_packet_file: "data/content-intelligence/content-packets/ag08c-article-upgrade-candidate-packet.json",
  readiness_record_file: "data/content-intelligence/quality-registry/ag08c-candidate-packet-readiness.json",
  schema_file: "data/content-intelligence/schema/article-upgrade-candidate-packet.schema.json",
  learning_file: "data/content-intelligence/learning/ag08c-article-upgrade-candidate-packet-learning.json",
  closure_decision: {
    decision: "ag08c_candidate_packet_closed_ready_for_ag08d_readiness_review",
    candidate_packet_created: true,
    selected_article_path: selectedArticlePath,
    selected_article_title: currentTitle,
    proceed_to_ag08d_only_with_explicit_user_approval: true,
    ag08d_scope: "perform inference, reference and visual readiness review for selected article candidate packet",
    article_mutation_performed: false,
    file_edit_performed: false,
    article_prose_generated: false,
    reference_url_population_performed: false,
    reference_insertion_performed: false,
    visual_generation_performed: false,
    image_insertion_performed: false,
    production_jsonl_append_performed: false,
    database_write_performed: false,
    supabase_write_performed: false,
    public_publishing_performed: false,
    backend_auth_supabase_activation_performed: false,
    production_readiness: "candidate_packet_created_not_production_ready",
    publish_readiness: "blocked"
  },
  ...noMutationControls
};

const registry = {
  module_id: "AG08C",
  title: "Article Upgrade Candidate Packet",
  governance_only: true,
  candidate_packet_only: true,
  depends_on: ["AG08B"],
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag08c-article-upgrade-candidate-packet.json",
    candidate_packet: "data/content-intelligence/content-packets/ag08c-article-upgrade-candidate-packet.json",
    readiness_record: "data/content-intelligence/quality-registry/ag08c-candidate-packet-readiness.json",
    schema: "data/content-intelligence/schema/article-upgrade-candidate-packet.schema.json",
    learning: "data/content-intelligence/learning/ag08c-article-upgrade-candidate-packet-learning.json",
    preview: "data/quality/ag08c-article-upgrade-candidate-packet-preview.json",
    document: "docs/quality/AG08C_ARTICLE_UPGRADE_CANDIDATE_PACKET.md"
  },
  summary,
  next_recommended_stage: {
    module_id: "AG08D",
    title: "Inference, Reference and Visual Readiness Review",
    explicit_approval_required: true,
    selected_article_path: selectedArticlePath,
    allowed_scope: "readiness review only",
    blocked_scope: "article mutation, final prose generation, reference insertion, visual generation, JSONL/database/Supabase/backend/Auth/publishing activation"
  },
  ...noMutationControls
};

const preview = {
  module_id: "AG08C",
  preview_only: true,
  candidate_packet_only: true,
  summary,
  selected_article_preview: candidatePacket.selected_article,
  current_article_analysis: candidatePacket.current_article_analysis,
  upgrade_hypothesis: candidatePacket.upgrade_hypothesis,
  proposed_structure_preview: proposedStructure.map((section) => ({
    section_id: section.section_id,
    heading: section.heading,
    estimated_words: section.estimated_words,
    prose_generation_status: section.prose_generation_status
  })),
  next_stage_id: "AG08D",
  next_stage_title: "Inference, Reference and Visual Readiness Review",
  ...noMutationControls
};

const doc = `# AG08C — Article Upgrade Candidate Packet

## Purpose

AG08C creates a candidate upgrade packet for the single article selected in AG08B.

AG08C is candidate-packet only. It does not mutate the selected article, edit files, generate final article prose, insert references, populate reference URLs, generate visuals, insert images, append JSONL records, write to database/Supabase, publish content, or activate backend/Auth/Supabase/API functionality.

## Selected Article

- Path: \`${selectedArticlePath}\`
- Title: \`${currentTitle}\`
- Category: \`${category}\`
- Estimated current word count: \`${currentWords}\`
- Hash before AG08C: \`${hashBefore}\`

## Candidate Upgrade Goal

${upgradeHypothesis.core_upgrade_goal}

## Reader-Value Goal

${upgradeHypothesis.reader_value_goal}

## Proposed Structure

${proposedStructure.map((section) => `- ${section.heading} — ${section.prose_generation_status}`).join("\n")}

## Reference Need Plan

AG08C creates only a reference need plan. It does not populate or insert URLs.

Candidate reference themes:

${referenceNeedPlan.candidate_reference_themes.map((theme) => `- ${theme}`).join("\n")}

## Visual/Data Need Plan

Recommended visual type: ${visualDataNeedPlan.recommended_visual_type}

Recommended concept: ${visualDataNeedPlan.recommended_visual_concept}

No visual is generated or inserted in AG08C.

## Explicit Exclusions

AG08C does not:

- mutate the selected article;
- edit files;
- generate final article prose;
- create a new article;
- create a backup;
- insert references;
- populate reference URLs;
- fetch live URLs;
- generate visuals;
- insert images;
- populate captions, alt text or credits;
- append production JSONL records;
- write to database or Supabase;
- approve publish readiness;
- publish content;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup or public dynamic output.

## Next Stage

AG08D — Inference, Reference and Visual Readiness Review — is identified as next only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(packetPath, candidatePacket);
writeJson(readinessPath, readinessRecord);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

const htmlAfter = fs.readFileSync(selectedArticleAbs, "utf8");
if (sha256(htmlAfter) !== hashBefore) {
  throw new Error("AG08C attempted to change the selected article. Refusing to continue.");
}

console.log("✅ AG08C article upgrade candidate packet artifacts generated.");
console.log(`✅ Candidate packet target: ${selectedArticlePath}`);
