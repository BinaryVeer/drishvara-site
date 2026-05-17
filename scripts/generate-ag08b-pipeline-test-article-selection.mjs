import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag08aReview: "data/content-intelligence/quality-reviews/ag08a-repeatable-article-upgrade-cycle-planning.json",
  ag08aRoadmap: "data/content-intelligence/run-registry/ag08a-repeatable-article-upgrade-roadmap.json",
  ag08aSelectionCriteria: "data/content-intelligence/selection-registry/ag08a-next-article-selection-criteria.json",
  ag08aSchema: "data/content-intelligence/schema/repeatable-article-upgrade-cycle-planning.schema.json",
  ag08aLearning: "data/content-intelligence/learning/ag08a-repeatable-article-upgrade-cycle-planning-learning.json",
  ag07zClosure: "data/content-intelligence/quality-reviews/ag07z-repeatable-production-readiness-closure.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag08b-pipeline-test-article-selection.json");
const selectionRecordPath = path.join(root, "data/content-intelligence/selection-registry/ag08b-selected-pipeline-test-article.json");
const candidateScorecardPath = path.join(root, "data/content-intelligence/selection-registry/ag08b-pipeline-test-candidate-scorecard.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/pipeline-test-article-selection.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag08b-pipeline-test-article-selection-learning.json");
const registryPath = path.join(root, "data/quality/ag08b-pipeline-test-article-selection.json");
const previewPath = path.join(root, "data/quality/ag08b-pipeline-test-article-selection-preview.json");
const docPath = path.join(root, "docs/quality/AG08B_PIPELINE_TEST_ARTICLE_SELECTION.md");

const ag07pStartMarker = "<!-- AG07P-CONTROLLED-APPLY-START -->";

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

function listArticleFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listArticleFiles(absolute));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(path.relative(root, absolute));
    }
  }

  return files.sort();
}

function categoryFromPath(relativePath) {
  const parts = relativePath.split(path.sep);
  return parts.length >= 3 ? parts[1] : "unknown";
}

function countPattern(html, pattern) {
  const matches = html.match(pattern);
  return matches ? matches.length : 0;
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) {
    throw new Error(`Missing required AG08B input ${name}: ${relativePath}`);
  }
}

const ag08aReview = readJson(inputs.ag08aReview);
const ag08aRoadmap = readJson(inputs.ag08aRoadmap);
const ag08aSelectionCriteria = readJson(inputs.ag08aSelectionCriteria);
const ag08aSchema = readJson(inputs.ag08aSchema);
const ag08aLearning = readJson(inputs.ag08aLearning);
const ag07zClosure = readJson(inputs.ag07zClosure);

const articleFiles = listArticleFiles(path.join(root, "articles"));
if (!articleFiles.length) {
  throw new Error("No article HTML files found under articles/");
}

const selectionOnlyControls = {
  pipeline_test_selection_only: true,
  next_article_selection_performed: true,
  selected_article_count: 1,
  selection_scorecard_created: true,
  selection_criteria_consumed: true,
  selected_existing_static_article: true,
  selected_article_mutated: false,
  article_mutation_performed: false,
  new_article_generation_performed: false,
  new_article_file_created: false,
  article_file_created: false,
  article_prose_generated: false,
  narrative_text_generated: false,
  candidate_packet_created: false,
  production_packet_created: false,
  article_inference_generated: false,
  score_calculation_performed: false,
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

const scoredCandidates = articleFiles.map((relativePath) => {
  const absolute = path.join(root, relativePath);
  const html = fs.readFileSync(absolute, "utf8");
  const wc = wordCount(html);
  const category = categoryFromPath(relativePath);
  const title = extractTitle(html, path.basename(relativePath));
  const containsAg07pPilotMarker = html.includes(ag07pStartMarker);
  const hasBody = /<body[\s>]/i.test(html);
  const hasMainOrArticle = /<(main|article)[\s>]/i.test(html);
  const hasReferences = /AG03|ag03|reference|References|संदर्भ/i.test(html);
  const hasImageCredit = /credit|Credit|attribution|Attribution|image-credit|Image Credit/i.test(html);
  const htmlSize = Buffer.byteLength(html, "utf8");
  const linkCount = countPattern(html, /<a\s+/gi);
  const paragraphCount = countPattern(html, /<p[\s>]/gi);

  const visitorValuePotential =
    category === "policy" ? 24 :
    category === "spirituality" ? 22 :
    category === "public-programmes" ? 21 :
    category === "world-affairs" ? 19 :
    category === "media-society" ? 18 :
    category === "sports" ? 16 : 14;

  const currentQualityGap =
    wc < 650 ? 20 :
    wc < 1000 ? 16 :
    wc < 1400 ? 12 :
    wc < 1800 ? 8 : 5;

  const categoryImportance =
    ["policy", "spirituality", "public-programmes"].includes(category) ? 15 :
    ["world-affairs", "media-society"].includes(category) ? 12 : 9;

  const staticApplySafety =
    containsAg07pPilotMarker ? 0 :
    hasBody && hasMainOrArticle && htmlSize < 300000 ? 20 :
    hasBody && htmlSize < 300000 ? 14 :
    htmlSize < 300000 ? 10 : 4;

  const referenceVisualReadiness =
    hasReferences && hasImageCredit ? 10 :
    hasReferences || hasImageCredit ? 7 : 4;

  const repeatabilityLearningValue =
    !containsAg07pPilotMarker && paragraphCount >= 2 && linkCount >= 1 ? 10 :
    !containsAg07pPilotMarker && paragraphCount >= 2 ? 8 :
    !containsAg07pPilotMarker ? 6 : 0;

  const totalScore =
    visitorValuePotential +
    currentQualityGap +
    categoryImportance +
    staticApplySafety +
    referenceVisualReadiness +
    repeatabilityLearningValue;

  const eligible =
    !containsAg07pPilotMarker &&
    relativePath.startsWith("articles/") &&
    relativePath.endsWith(".html") &&
    wc > 80 &&
    htmlSize < 300000;

  return {
    article_path: relativePath,
    title,
    category,
    word_count_estimate: wc,
    html_size_bytes: htmlSize,
    paragraph_count: paragraphCount,
    link_count: linkCount,
    has_body: hasBody,
    has_main_or_article: hasMainOrArticle,
    has_reference_signal: hasReferences,
    has_image_credit_signal: hasImageCredit,
    contains_ag07p_pilot_marker: containsAg07pPilotMarker,
    eligible_for_ag08b_pipeline_test_selection: eligible,
    score_breakdown: {
      visitor_value_potential: visitorValuePotential,
      current_quality_gap: currentQualityGap,
      category_importance: categoryImportance,
      static_apply_safety: staticApplySafety,
      reference_visual_readiness: referenceVisualReadiness,
      repeatability_learning_value: repeatabilityLearningValue,
      total_score: totalScore
    },
    selection_reason: eligible
      ? "Existing static article suitable for one-article pipeline test based on visitor value, quality gap, static safety and repeatability learning value."
      : "Excluded from AG08B pipeline test selection because it is not suitable for this controlled selection boundary."
  };
}).sort((a, b) => {
  if (a.eligible_for_ag08b_pipeline_test_selection !== b.eligible_for_ag08b_pipeline_test_selection) {
    return a.eligible_for_ag08b_pipeline_test_selection ? -1 : 1;
  }
  return b.score_breakdown.total_score - a.score_breakdown.total_score ||
    a.article_path.localeCompare(b.article_path);
});

const selected = scoredCandidates.find((candidate) => candidate.eligible_for_ag08b_pipeline_test_selection);
if (!selected) {
  throw new Error("No eligible article found for AG08B pipeline test selection.");
}

const selectedHtml = fs.readFileSync(path.join(root, selected.article_path), "utf8");
const selectedHash = sha256(selectedHtml);

const topCandidates = scoredCandidates
  .filter((candidate) => candidate.eligible_for_ag08b_pipeline_test_selection)
  .slice(0, 10);

const candidateScorecard = {
  module_id: "AG08B",
  title: "Pipeline Test Candidate Scorecard",
  status: "scorecard_created_selection_read_only",
  generated_from: inputs,
  total_article_files_scanned: articleFiles.length,
  eligible_candidate_count: scoredCandidates.filter((candidate) => candidate.eligible_for_ag08b_pipeline_test_selection).length,
  selected_article_path: selected.article_path,
  selected_article_title: selected.title,
  selected_article_score: selected.score_breakdown.total_score,
  top_candidates: topCandidates,
  all_candidates_summary: scoredCandidates.map((candidate) => ({
    article_path: candidate.article_path,
    title: candidate.title,
    category: candidate.category,
    eligible: candidate.eligible_for_ag08b_pipeline_test_selection,
    word_count_estimate: candidate.word_count_estimate,
    total_score: candidate.score_breakdown.total_score,
    contains_ag07p_pilot_marker: candidate.contains_ag07p_pilot_marker
  })),
  ...selectionOnlyControls
};

const selectionRecord = {
  module_id: "AG08B",
  title: "Selected Pipeline Test Article",
  status: "one_existing_article_selected_for_pipeline_test",
  generated_from: inputs,
  selection_mode: "single_existing_static_article",
  selected_article: {
    article_path: selected.article_path,
    title: selected.title,
    category: selected.category,
    word_count_estimate: selected.word_count_estimate,
    html_size_bytes: selected.html_size_bytes,
    sha256_at_selection: selectedHash,
    selected_for: "AG08 repeatable upgrade pipeline practical test",
    selected_because: [
      "Existing static article.",
      "No AG07P pilot marker.",
      "Suitable for one-article controlled apply and rollback test.",
      "Has measurable quality-gap and visitor-value potential.",
      "Useful for testing repeatability beyond the AG07 pilot article."
    ],
    score_breakdown: selected.score_breakdown
  },
  selection_boundary: {
    exact_selected_target_article_path: selected.article_path,
    target_count: 1,
    no_article_mutation_in_ag08b: true,
    no_file_edit_in_ag08b: true,
    no_reference_insertion_in_ag08b: true,
    no_visual_generation_in_ag08b: true,
    no_jsonl_database_supabase_write_in_ag08b: true,
    no_backend_auth_supabase_activation_in_ag08b: true,
    no_publishing_in_ag08b: true
  },
  ag08c_handoff: {
    next_stage_id: "AG08C",
    next_stage_title: "Article Upgrade Candidate Packet",
    explicit_approval_required: true,
    allowed_scope: "create candidate upgrade packet for the selected article only",
    selected_article_path: selected.article_path,
    blocked_scope: "public article mutation, file edit, reference insertion, visual generation, production JSONL append, database/Supabase write, backend/Auth/Supabase activation and publishing"
  },
  ...selectionOnlyControls
};

const summary = {
  ag08a_planning_consumed: ag08aReview.status === "repeatable_article_upgrade_cycle_planning_created",
  ag08b_selection_performed: true,
  selected_article_count: 1,
  selected_article_path: selected.article_path,
  selected_article_title: selected.title,
  selected_article_category: selected.category,
  selected_article_score: selected.score_breakdown.total_score,
  total_article_files_scanned: articleFiles.length,
  eligible_candidate_count: candidateScorecard.eligible_candidate_count,
  next_stage_id: "AG08C",
  next_stage_title: "Article Upgrade Candidate Packet",
  next_stage_requires_explicit_approval: true,
  article_mutation_performed: false,
  file_edit_performed: false,
  reference_insertion_performed: false,
  visual_generation_performed: false,
  production_jsonl_append_performed: false,
  database_write_performed: false,
  supabase_write_performed: false,
  backend_auth_supabase_activation_performed: false,
  publishing_performed: false,
  production_readiness_after_ag08b: "one_article_selected_for_pipeline_test_not_mutated",
  publish_readiness_after_ag08b: "blocked"
};

const schema = {
  schema_id: "drishvara/ag08b/pipeline-test-article-selection.schema.json",
  module_id: "AG08B",
  title: "Pipeline Test Article Selection Schema",
  status: "schema_selection_only",
  description: "Schema for selecting exactly one existing static article to test the repeatable upgrade pipeline, without mutating files or activating runtime systems.",
  required_top_level_fields: [
    "selection_record",
    "candidate_scorecard",
    "summary",
    "selection_only_controls"
  ],
  article_selection_allowed_in_ag08b: true,
  exactly_one_article_required: true,
  existing_static_article_required: true,
  article_mutation_allowed_in_ag08b: false,
  file_edit_allowed_in_ag08b: false,
  reference_insertion_allowed_in_ag08b: false,
  reference_url_population_allowed_in_ag08b: false,
  visual_generation_allowed_in_ag08b: false,
  production_jsonl_append_allowed_in_ag08b: false,
  database_write_allowed_in_ag08b: false,
  supabase_write_allowed_in_ag08b: false,
  backend_auth_supabase_allowed_in_ag08b: false,
  publishing_allowed_in_ag08b: false,
  ...selectionOnlyControls
};

const learning = {
  module_id: "AG08B",
  title: "Pipeline Test Article Selection Learning",
  status: "learning_record_only",
  selection_only: true,
  generated_from: inputs,
  summary,
  learning_points_from_ag08a: Array.isArray(ag08aLearning.ag08a_learning_points)
    ? ag08aLearning.ag08a_learning_points
    : [],
  ag08b_learning_points: [
    "The first AG08 practical test should use one existing article, not a new article.",
    "Existing-article testing validates backup, rollback, static structure, scoring and audit controls better than new article creation.",
    "The selected article must remain unmodified in AG08B.",
    "AG08C should create a candidate upgrade packet for the selected article only.",
    "Batch mode remains deferred until at least two to three single-article cycles pass cleanly."
  ],
  selected_article_path: selected.article_path,
  carried_forward_doctrine: [
    "One article only.",
    "Selection before candidate packet.",
    "No mutation in selection stage.",
    "No references or visuals until separately approved.",
    "No JSONL/database/Supabase/backend/Auth/publishing activation."
  ],
  ...selectionOnlyControls
};

const review = {
  module_id: "AG08B",
  title: "Pipeline Test Article Selection",
  status: "one_article_selected_for_pipeline_test",
  governance_only: true,
  selection_only: true,
  depends_on: ["AG08A", "AG07Z"],
  generated_from: inputs,
  summary,
  ag08a_alignment: {
    ag08a_status: ag08aReview.status,
    ag08a_decision: ag08aReview.closure_decision?.decision,
    ag08b_requires_explicit_approval: ag08aReview.closure_decision?.proceed_to_ag08b_only_with_explicit_user_approval,
    ag08a_next_article_selected: ag08aReview.closure_decision?.next_article_selected,
    ag08a_article_mutation_performed: ag08aReview.closure_decision?.article_mutation_performed,
    ag08a_production_readiness: ag08aReview.closure_decision?.production_readiness,
    ag08a_publish_readiness: ag08aReview.closure_decision?.publish_readiness
  },
  selection_record_file: "data/content-intelligence/selection-registry/ag08b-selected-pipeline-test-article.json",
  candidate_scorecard_file: "data/content-intelligence/selection-registry/ag08b-pipeline-test-candidate-scorecard.json",
  schema_file: "data/content-intelligence/schema/pipeline-test-article-selection.schema.json",
  learning_file: "data/content-intelligence/learning/ag08b-pipeline-test-article-selection-learning.json",
  closure_decision: {
    decision: "ag08b_selection_closed_ready_for_ag08c_candidate_packet",
    one_existing_article_selected: true,
    selected_article_path: selected.article_path,
    selected_article_title: selected.title,
    selected_article_category: selected.category,
    proceed_to_ag08c_only_with_explicit_user_approval: true,
    ag08c_scope: "create article upgrade candidate packet for selected article only",
    article_mutation_performed: false,
    file_edit_performed: false,
    reference_insertion_performed: false,
    visual_generation_performed: false,
    production_jsonl_append_performed: false,
    database_write_performed: false,
    supabase_write_performed: false,
    public_publishing_performed: false,
    backend_auth_supabase_activation_performed: false,
    production_readiness: "one_article_selected_for_pipeline_test_not_mutated",
    publish_readiness: "blocked"
  },
  ...selectionOnlyControls
};

const registry = {
  module_id: "AG08B",
  title: "Pipeline Test Article Selection",
  governance_only: true,
  selection_only: true,
  depends_on: ["AG08A"],
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag08b-pipeline-test-article-selection.json",
    selection_record: "data/content-intelligence/selection-registry/ag08b-selected-pipeline-test-article.json",
    candidate_scorecard: "data/content-intelligence/selection-registry/ag08b-pipeline-test-candidate-scorecard.json",
    schema: "data/content-intelligence/schema/pipeline-test-article-selection.schema.json",
    learning: "data/content-intelligence/learning/ag08b-pipeline-test-article-selection-learning.json",
    preview: "data/quality/ag08b-pipeline-test-article-selection-preview.json",
    document: "docs/quality/AG08B_PIPELINE_TEST_ARTICLE_SELECTION.md"
  },
  summary,
  next_recommended_stage: {
    module_id: "AG08C",
    title: "Article Upgrade Candidate Packet",
    explicit_approval_required: true,
    selected_article_path: selected.article_path,
    allowed_scope: "create a candidate upgrade packet only",
    blocked_scope: "article mutation, file edit, reference insertion, visual generation, JSONL/database/Supabase/backend/Auth/publishing activation"
  },
  ...selectionOnlyControls
};

const preview = {
  module_id: "AG08B",
  preview_only: true,
  selection_only: true,
  summary,
  selected_article_preview: selectionRecord.selected_article,
  top_candidate_paths: topCandidates.map((candidate) => ({
    article_path: candidate.article_path,
    title: candidate.title,
    category: candidate.category,
    total_score: candidate.score_breakdown.total_score
  })),
  next_stage_id: "AG08C",
  next_stage_title: "Article Upgrade Candidate Packet",
  ...selectionOnlyControls
};

const doc = `# AG08B — Pipeline Test Article Selection

## Purpose

AG08B selects exactly one existing static article to test the repeatable article-upgrade pipeline created in AG08A.

AG08B is selection-only. It does not mutate any article, edit files, insert references, generate visuals, append JSONL records, write to database/Supabase, publish content, or activate backend/Auth/Supabase/API functionality.

## Selected Article

- Path: \`${selected.article_path}\`
- Title: \`${selected.title}\`
- Category: \`${selected.category}\`
- Estimated word count: \`${selected.word_count_estimate}\`
- Selection score: \`${selected.score_breakdown.total_score}\`

## Why This Article Was Selected

The selected article is an existing static article and is suitable for testing the repeatable upgrade pipeline because:

- it does not contain the AG07P pilot marker;
- it can be evaluated as an existing public article;
- it has visitor-value potential;
- it has measurable quality-gap improvement scope;
- it is safe for a future one-article controlled apply and rollback test.

## Selection Criteria Used

AG08B applied the AG08A criteria:

- visitor-value potential;
- current quality gap;
- category importance;
- static apply safety;
- reference/visual readiness;
- repeatability learning value.

## Explicit Exclusions

AG08B does not:

- generate a new article;
- mutate the selected article;
- edit files;
- create a backup;
- insert references;
- populate reference URLs;
- generate visuals;
- insert images;
- append production JSONL records;
- write to database or Supabase;
- approve publish readiness;
- publish content;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup or public dynamic output.

## Next Stage

AG08C — Article Upgrade Candidate Packet — is identified as next only with explicit approval.

AG08C should create a candidate upgrade packet for:

\`${selected.article_path}\`
`;

writeJson(reviewPath, review);
writeJson(selectionRecordPath, selectionRecord);
writeJson(candidateScorecardPath, candidateScorecard);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG08B pipeline test article selection artifacts generated.");
console.log(`✅ Selected article: ${selected.article_path}`);
