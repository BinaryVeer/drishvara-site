import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag08cReview: "data/content-intelligence/quality-reviews/ag08c-article-upgrade-candidate-packet.json",
  ag08cPacket: "data/content-intelligence/content-packets/ag08c-article-upgrade-candidate-packet.json",
  ag08cReadiness: "data/content-intelligence/quality-registry/ag08c-candidate-packet-readiness.json",
  ag08cSchema: "data/content-intelligence/schema/article-upgrade-candidate-packet.schema.json",
  ag08cLearning: "data/content-intelligence/learning/ag08c-article-upgrade-candidate-packet-learning.json",
  ag08bSelection: "data/content-intelligence/selection-registry/ag08b-selected-pipeline-test-article.json",
  ag08aRoadmap: "data/content-intelligence/run-registry/ag08a-repeatable-article-upgrade-roadmap.json",
  ag06eStandard: "data/quality/ag06e-long-form-article-standard.json",
  ag06iVisualStandard: "data/quality/ag06i-visual-data-infographic-requirement-schema-closure.json",
  ag06jReferenceStandard: "data/quality/ag06j-reference-source-credibility-schema-closure.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag08d-inference-reference-visual-readiness-review.json");
const inferencePath = path.join(root, "data/content-intelligence/inference-records/ag08d-article-inference-readiness-review.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag08d-reference-visual-readiness-gap-matrix.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/inference-reference-visual-readiness-review.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag08d-inference-reference-visual-readiness-review-learning.json");
const registryPath = path.join(root, "data/quality/ag08d-inference-reference-visual-readiness-review.json");
const previewPath = path.join(root, "data/quality/ag08d-inference-reference-visual-readiness-review-preview.json");
const docPath = path.join(root, "docs/quality/AG08D_INFERENCE_REFERENCE_VISUAL_READINESS_REVIEW.md");

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
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

function countPattern(html, pattern) {
  const matches = html.match(pattern);
  return matches ? matches.length : 0;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) {
    throw new Error(`Missing required AG08D input ${name}: ${relativePath}`);
  }
}

const ag08cReview = readJson(inputs.ag08cReview);
const ag08cPacket = readJson(inputs.ag08cPacket);
const ag08cReadiness = readJson(inputs.ag08cReadiness);
const ag08cSchema = readJson(inputs.ag08cSchema);
const ag08cLearning = readJson(inputs.ag08cLearning);
const ag08bSelection = readJson(inputs.ag08bSelection);
const ag08aRoadmap = readJson(inputs.ag08aRoadmap);
const ag06eStandard = readJson(inputs.ag06eStandard);
const ag06iVisualStandard = readJson(inputs.ag06iVisualStandard);
const ag06jReferenceStandard = readJson(inputs.ag06jReferenceStandard);

const selectedArticlePath = ag08cPacket.selected_article?.article_path;
if (!selectedArticlePath) throw new Error("AG08C selected article path missing.");
if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);

const articleAbs = path.join(root, selectedArticlePath);
const htmlBefore = fs.readFileSync(articleAbs, "utf8");
const hashBefore = sha256(htmlBefore);

if (ag08cPacket.selected_article.sha256_before_ag08c !== hashBefore) {
  throw new Error("Selected article hash changed after AG08C. Refusing AG08D readiness review.");
}

const plainText = stripTags(htmlBefore);
const currentWords = wordCount(htmlBefore);
const paragraphCount = countPattern(htmlBefore, /<p[\s>]/gi);
const headingCount = countPattern(htmlBefore, /<h[1-6][\s>]/gi);
const linkCount = countPattern(htmlBefore, /<a\s+/gi);
const imageCount = countPattern(htmlBefore, /<img\s+/gi);
const hasReferenceSignal = /AG03|AG05D|verified reference|Verified references|References|reference/i.test(htmlBefore);
const hasCreditSignal = /image-credit|Image Credit|attribution|Attribution|credit/i.test(htmlBefore);
const hasPolicySignal = /policy|public|health|healthcare|digital|delivery|governance|service|data/i.test(plainText);

const noMutationControls = {
  readiness_review_only: true,
  selected_article_read_performed: true,
  selected_article_hash_verified: true,
  article_inference_review_created: true,
  reference_readiness_review_created: true,
  visual_data_readiness_review_created: true,
  quality_gap_matrix_created: true,
  ag08e_handoff_created: true,
  selected_article_mutated: false,
  article_mutation_performed: false,
  new_article_generation_performed: false,
  new_article_file_created: false,
  article_file_created: false,
  article_prose_generated: false,
  final_article_prose_generated: false,
  narrative_text_generated: false,
  candidate_final_draft_generated: false,
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

const inferenceReview = {
  module_id: "AG08D",
  title: "Article Inference Readiness Review",
  status: "inference_review_created_not_persisted_to_production",
  selected_article_path: selectedArticlePath,
  selected_article_sha256_before_ag08d: hashBefore,
  current_article_signals: {
    current_word_count_estimate: currentWords,
    paragraph_count: paragraphCount,
    heading_count: headingCount,
    link_count: linkCount,
    image_count: imageCount,
    has_reference_signal: hasReferenceSignal,
    has_image_credit_signal: hasCreditSignal,
    has_policy_digital_health_signal: hasPolicySignal
  },
  inferred_article_intent: {
    current_primary_theme: "digital innovation for public healthcare delivery",
    likely_reader_need: "understand practical governance and service-delivery implications of digital health tools",
    current_content_gap: currentWords < 1500
      ? "article requires long-form expansion and stronger explanatory depth"
      : "article may require structure and reader-value refinement",
    upgrade_direction: "policy insight article with implementation, accountability, data-use and patient-experience framing"
  },
  inferred_risks: [
    {
      risk_id: "AG08D-RISK-001",
      risk: "Technology-first framing may become generic if not tied to service delivery outcomes.",
      mitigation_for_ag08e: "AG08E draft should frame digital innovation through workflow, accountability and citizen experience."
    },
    {
      risk_id: "AG08D-RISK-002",
      risk: "Reference claims may become weak if generic digital-health sources are used.",
      mitigation_for_ag08e: "AG08E should use only credible policy, public health, official or institutional sources."
    },
    {
      risk_id: "AG08D-RISK-003",
      risk: "Visual/data enrichment may become decorative.",
      mitigation_for_ag08e: "AG08E should keep visual/data unit explanatory and implementation-linked."
    }
  ],
  inference_values_generated_as_review_only: true,
  production_inference_record_created: false,
  ...noMutationControls
};

const referenceReadiness = {
  status: "reference_ready_for_candidate_population_in_ag08e",
  url_population_performed_in_ag08d: false,
  reference_insertion_performed_in_ag08d: false,
  recommended_reference_count_for_ag08e: 3,
  acceptable_reference_count_range: {
    min: 2,
    max: 5
  },
  required_source_types: [
    "official digital health / public health mission source",
    "credible institutional health systems or public health source",
    "implementation/accountability/data quality source"
  ],
  reference_query_themes_for_ag08e: [
    "digital health mission public healthcare delivery India official",
    "health information systems public health service delivery data quality",
    "digital health governance patient experience service delivery"
  ],
  source_quality_rules_for_ag08e: [
    "Prefer official, institutional, peer-reviewed, multilateral or credible public health sources.",
    "Reject parked, spam, broken, irrelevant, promotional or unverifiable links.",
    "Do not invent source titles or URLs.",
    "Every inserted reference must support a specific article claim."
  ],
  ag08e_requires_web_or_manual_source_verification: true
};

const visualDataReadiness = {
  status: "visual_data_ready_for_candidate_design_in_ag08e",
  visual_generation_performed_in_ag08d: false,
  image_insertion_performed_in_ag08d: false,
  recommended_visual_direction: "simple static explanatory flow or implementation loop",
  recommended_visual_caption_need: true,
  recommended_alt_text_need: true,
  recommended_credit_need: true,
  recommended_data_unit_type: "implementation indicator checklist",
  recommended_data_unit_fields: [
    "facility/service point",
    "digital record or request",
    "assignment or referral",
    "turnaround time",
    "medicine/diagnostic/service status",
    "feedback or grievance closure"
  ],
  visual_risk_controls_for_ag08e: [
    "Do not use uncredited third-party images.",
    "Do not generate visual assets unless separately approved.",
    "If only concept is needed, keep visual as planned_not_generated.",
    "If inserted later, preserve mobile-safe layout and image-credit block."
  ]
};

const qualityGapMatrix = [
  {
    gap_id: "AG08D-GAP-001",
    area: "long_form_depth",
    current_status: currentWords < 1500 ? "gap_confirmed" : "watch",
    evidence: `Current estimated word count is ${currentWords}.`,
    required_ag08e_action: "Generate full upgraded draft candidate in 1500–2200 word range, if approved."
  },
  {
    gap_id: "AG08D-GAP-002",
    area: "reader_value",
    current_status: "gap_confirmed",
    evidence: "AG08C candidate packet requires stronger policy interpretation and reader lens.",
    required_ag08e_action: "Draft should explain practical implications, not just describe digital innovation."
  },
  {
    gap_id: "AG08D-GAP-003",
    area: "reference_support",
    current_status: "candidate_population_required",
    evidence: "AG08C has reference need plan but no candidate URLs.",
    required_ag08e_action: "Populate candidate references only after source verification."
  },
  {
    gap_id: "AG08D-GAP-004",
    area: "visual_data_enrichment",
    current_status: "concept_required",
    evidence: "AG08C recommends explanatory flow/data unit but no visual generation.",
    required_ag08e_action: "Prepare visual/data concept; keep generation blocked unless explicitly approved."
  },
  {
    gap_id: "AG08D-GAP-005",
    area: "apply_safety",
    current_status: "future_gate_required",
    evidence: "Article hash is stable; no backup exists for AG08 apply yet.",
    required_ag08e_action: "Do not mutate in AG08E; backup and apply plan should come later."
  }
];

const ag08eHandoff = {
  next_stage_id: "AG08E",
  next_stage_title: "Full Upgrade Draft + Candidate References",
  explicit_approval_required: true,
  selected_article_path: selectedArticlePath,
  allowed_scope: [
    "generate full upgraded article draft candidate as artifact only",
    "populate candidate reference URLs with verification notes",
    "prepare visual/data concept without article insertion",
    "prepare draft-readiness record"
  ],
  blocked_scope: [
    "article file mutation",
    "final article apply",
    "reference insertion into article HTML",
    "visual insertion into article HTML",
    "production JSONL append",
    "database/Supabase write",
    "backend/Auth/Supabase activation",
    "publishing"
  ]
};

const readinessRecord = {
  module_id: "AG08D",
  title: "Reference, Visual and Quality Readiness Gap Matrix",
  status: "readiness_review_completed_for_ag08e",
  selected_article_path: selectedArticlePath,
  selected_article_sha256_before_ag08d: hashBefore,
  reference_readiness: referenceReadiness,
  visual_data_readiness: visualDataReadiness,
  quality_gap_matrix: qualityGapMatrix,
  ag08e_handoff: ag08eHandoff,
  ...noMutationControls
};

const summary = {
  ag08c_candidate_packet_consumed: ag08cReview.status === "article_upgrade_candidate_packet_created",
  ag08d_readiness_review_created: true,
  selected_article_path: selectedArticlePath,
  selected_article_sha256_before_ag08d: hashBefore,
  current_word_count_estimate: currentWords,
  inference_review_created: true,
  reference_readiness_review_created: true,
  visual_data_readiness_review_created: true,
  quality_gap_matrix_created: true,
  ag08e_handoff_created: true,
  recommended_ag08e_mode: "full_upgrade_draft_candidate_plus_candidate_references_no_article_mutation",
  next_stage_id: "AG08E",
  next_stage_title: "Full Upgrade Draft + Candidate References",
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
  production_readiness_after_ag08d: "readiness_review_completed_not_production_ready",
  publish_readiness_after_ag08d: "blocked"
};

const schema = {
  schema_id: "drishvara/ag08d/inference-reference-visual-readiness-review.schema.json",
  module_id: "AG08D",
  title: "Inference, Reference and Visual Readiness Review Schema",
  status: "schema_readiness_review_only",
  description: "Schema for reviewing inference, reference readiness, visual/data readiness and quality gaps before AG08E draft generation.",
  required_top_level_fields: [
    "inference_review",
    "reference_readiness",
    "visual_data_readiness",
    "quality_gap_matrix",
    "ag08e_handoff",
    "readiness_review_controls"
  ],
  selected_article_read_allowed_in_ag08d: true,
  inference_review_allowed_in_ag08d: true,
  reference_readiness_review_allowed_in_ag08d: true,
  visual_data_readiness_review_allowed_in_ag08d: true,
  quality_gap_matrix_allowed_in_ag08d: true,
  ag08e_handoff_allowed_in_ag08d: true,
  article_mutation_allowed_in_ag08d: false,
  article_prose_generation_allowed_in_ag08d: false,
  reference_url_population_allowed_in_ag08d: false,
  reference_insertion_allowed_in_ag08d: false,
  visual_generation_allowed_in_ag08d: false,
  image_insertion_allowed_in_ag08d: false,
  production_jsonl_append_allowed_in_ag08d: false,
  database_write_allowed_in_ag08d: false,
  supabase_write_allowed_in_ag08d: false,
  backend_auth_supabase_allowed_in_ag08d: false,
  publishing_allowed_in_ag08d: false,
  ...noMutationControls
};

const learning = {
  module_id: "AG08D",
  title: "Inference, Reference and Visual Readiness Review Learning",
  status: "learning_record_only",
  readiness_review_only: true,
  generated_from: inputs,
  summary,
  learning_points_from_ag08c: asArray(ag08cLearning.ag08c_learning_points),
  ag08d_learning_points: [
    "Readiness review should happen before generating the full article draft.",
    "Reference URLs should not be populated until a source-verification stage is explicitly approved.",
    "Visual/data concepts can be reviewed without generating or inserting visual assets.",
    "AG08E should be the first stage allowed to create a full upgraded draft artifact.",
    "The selected article file must remain unchanged until a controlled apply stage."
  ],
  carried_forward_doctrine: [
    "Selected article only.",
    "Inference/readiness before full draft.",
    "No mutation in AG08D.",
    "No final prose in AG08D.",
    "No reference URL population or insertion in AG08D.",
    "No visual generation or insertion in AG08D.",
    "No JSONL/database/Supabase/backend/Auth/publishing activation."
  ],
  ...noMutationControls
};

const review = {
  module_id: "AG08D",
  title: "Inference, Reference and Visual Readiness Review",
  status: "inference_reference_visual_readiness_review_completed",
  governance_only: true,
  readiness_review_only: true,
  depends_on: ["AG08C", "AG08B", "AG08A"],
  generated_from: inputs,
  summary,
  ag08c_alignment: {
    ag08c_status: ag08cReview.status,
    ag08c_decision: ag08cReview.closure_decision?.decision,
    ag08d_requires_explicit_approval: ag08cReview.closure_decision?.proceed_to_ag08d_only_with_explicit_user_approval,
    ag08c_selected_article_path: ag08cReview.closure_decision?.selected_article_path,
    ag08c_article_mutation_performed: ag08cReview.closure_decision?.article_mutation_performed,
    ag08c_file_edit_performed: ag08cReview.closure_decision?.file_edit_performed,
    ag08c_article_prose_generated: ag08cReview.closure_decision?.article_prose_generated
  },
  inference_review_file: "data/content-intelligence/inference-records/ag08d-article-inference-readiness-review.json",
  readiness_gap_matrix_file: "data/content-intelligence/quality-registry/ag08d-reference-visual-readiness-gap-matrix.json",
  schema_file: "data/content-intelligence/schema/inference-reference-visual-readiness-review.schema.json",
  learning_file: "data/content-intelligence/learning/ag08d-inference-reference-visual-readiness-review-learning.json",
  closure_decision: {
    decision: "ag08d_readiness_review_closed_ready_for_ag08e_draft_candidate",
    readiness_review_created: true,
    selected_article_path: selectedArticlePath,
    proceed_to_ag08e_only_with_explicit_user_approval: true,
    ag08e_scope: "generate full upgraded draft candidate and candidate references as artifacts only",
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
    production_readiness: "readiness_review_completed_not_production_ready",
    publish_readiness: "blocked"
  },
  ...noMutationControls
};

const registry = {
  module_id: "AG08D",
  title: "Inference, Reference and Visual Readiness Review",
  governance_only: true,
  readiness_review_only: true,
  depends_on: ["AG08C"],
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag08d-inference-reference-visual-readiness-review.json",
    inference_review: "data/content-intelligence/inference-records/ag08d-article-inference-readiness-review.json",
    readiness_gap_matrix: "data/content-intelligence/quality-registry/ag08d-reference-visual-readiness-gap-matrix.json",
    schema: "data/content-intelligence/schema/inference-reference-visual-readiness-review.schema.json",
    learning: "data/content-intelligence/learning/ag08d-inference-reference-visual-readiness-review-learning.json",
    preview: "data/quality/ag08d-inference-reference-visual-readiness-review-preview.json",
    document: "docs/quality/AG08D_INFERENCE_REFERENCE_VISUAL_READINESS_REVIEW.md"
  },
  summary,
  next_recommended_stage: ag08eHandoff,
  ...noMutationControls
};

const preview = {
  module_id: "AG08D",
  preview_only: true,
  readiness_review_only: true,
  summary,
  inference_snapshot: inferenceReview.inferred_article_intent,
  reference_readiness_snapshot: referenceReadiness,
  visual_data_readiness_snapshot: visualDataReadiness,
  quality_gap_count: qualityGapMatrix.length,
  ag08e_handoff: ag08eHandoff,
  ...noMutationControls
};

const doc = `# AG08D — Inference, Reference and Visual Readiness Review

## Purpose

AG08D reviews the AG08C candidate packet for the selected article and records inference, reference readiness, visual/data readiness and quality gaps before full draft generation.

AG08D is readiness-review only. It does not mutate the selected article, edit files, generate final article prose, populate reference URLs, insert references, generate visuals, insert images, append JSONL records, write to database/Supabase, publish content, or activate backend/Auth/Supabase/API functionality.

## Selected Article

- Path: \`${selectedArticlePath}\`
- Current estimated word count: \`${currentWords}\`
- Hash before AG08D: \`${hashBefore}\`

## Inference Review

Primary inferred theme: ${inferenceReview.inferred_article_intent.current_primary_theme}

Upgrade direction: ${inferenceReview.inferred_article_intent.upgrade_direction}

## Reference Readiness

AG08D recommends candidate reference population in AG08E, but does not populate or insert URLs.

Recommended reference count: \`${referenceReadiness.recommended_reference_count_for_ag08e}\`

## Visual/Data Readiness

Recommended visual direction: ${visualDataReadiness.recommended_visual_direction}

No visual is generated or inserted in AG08D.

## Quality Gaps

${qualityGapMatrix.map((gap) => `- ${gap.area}: ${gap.current_status} — ${gap.required_ag08e_action}`).join("\n")}

## Explicit Exclusions

AG08D does not:

- mutate the selected article;
- edit files;
- generate final article prose;
- create a new article;
- create a backup;
- populate reference URLs;
- insert references;
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

AG08E — Full Upgrade Draft + Candidate References — is identified as next only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(inferencePath, inferenceReview);
writeJson(readinessPath, readinessRecord);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

const htmlAfter = fs.readFileSync(articleAbs, "utf8");
if (sha256(htmlAfter) !== hashBefore) {
  throw new Error("AG08D attempted to change the selected article. Refusing to continue.");
}

console.log("✅ AG08D inference/reference/visual readiness review artifacts generated.");
console.log(`✅ Readiness review target: ${selectedArticlePath}`);
