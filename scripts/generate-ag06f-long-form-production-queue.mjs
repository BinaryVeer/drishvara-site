import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const ag06dPath = path.join(root, "data", "content-intelligence", "quality-reviews", "public-article-classification-register.json");
const ag06ePath = path.join(root, "data", "content-intelligence", "quality-reviews", "long-form-article-standard.json");
const scaffoldPath = path.join(root, "data", "content-intelligence", "run-registry", "scaffold-output-preservation-register.json");

const registryPath = path.join(root, "data", "quality", "ag06f-long-form-production-queue.json");
const previewPath = path.join(root, "data", "quality", "ag06f-long-form-production-queue-preview.json");
const docPath = path.join(root, "docs", "quality", "AG06F_LONG_FORM_PRODUCTION_QUEUE.md");
const queuePath = path.join(root, "data", "content-intelligence", "publish-queue", "long-form-upgrade-queue.json");
const mappingPath = path.join(root, "data", "content-intelligence", "quality-reviews", "long-form-upgrade-mapping.json");

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n");
}

function writeText(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, value);
}

const falseGuards = {
  mutation_performed: false,
  public_article_mutation_performed: false,
  article_html_mutation_performed: false,
  homepage_mutation_performed: false,
  css_mutation_performed: false,
  javascript_mutation_performed: false,
  reference_url_change_performed: false,
  external_fetch_performed_by_script: false,
  live_url_fetch_performed: false,
  backend_activation_performed: false,
  api_route_created: false,
  supabase_enabled: false,
  auth_enabled: false,
  real_login_enabled: false,
  real_signup_enabled: false,
  user_account_collection_enabled: false,
  frontend_deployment_performed: false,
  scaffold_file_copy_performed: false,
  scaffold_file_move_performed: false,
  scaffold_file_delete_performed: false,
  file_deletion_performed: false,
  file_move_performed: false,
  public_article_archive_performed: false,
  public_article_delete_performed: false,
  public_publishing_performed: false
};

const ag06d = readJson(ag06dPath);
const ag06e = readJson(ag06ePath);
const scaffold = readJson(scaffoldPath);

const publicArticles = ag06d.public_article_classifications || [];
const scaffoldRuns = scaffold.scaffold_run_entries || [];

const stopWords = new Set([
  "the", "and", "for", "with", "from", "into", "this", "that", "should",
  "article", "drishvara", "draft", "html", "2026", "content", "outputs"
]);

function tokenize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((x) => x.length > 2 && !stopWords.has(x));
}

function uniqueTokens(value) {
  return [...new Set(tokenize(value))];
}

function scoreCandidate(article, run) {
  const articleText = [
    article.article_path,
    article.category,
    article.detected_title
  ].join(" ");

  const runText = [
    run.run_id,
    run.content_id_candidate,
    run.detected_title,
    run.run_directory
  ].join(" ");

  const a = new Set(uniqueTokens(articleText));
  const r = new Set(uniqueTokens(runText));

  let overlap = 0;
  for (const token of a) {
    if (r.has(token)) overlap += 1;
  }

  return overlap;
}

const scaffoldCandidates = scaffoldRuns.map((run) => ({
  run_id: run.run_id,
  content_id_candidate: run.content_id_candidate,
  detected_title: run.detected_title,
  run_directory: run.run_directory,
  has_final_markdown: run.has_final_markdown === true,
  has_final_html: run.has_final_html === true,
  has_visual_plan: run.has_visual_plan === true,
  has_publish_bundle: run.has_publish_bundle === true,
  has_learning_snapshot: run.has_learning_snapshot === true,
  final_markdown_word_count_estimate: run.final_markdown_word_count_estimate || 0,
  preservation_status: run.preservation_status,
  public_publish_status: run.public_publish_status
}));

const strongScaffoldPool = scaffoldCandidates
  .filter((run) => run.has_final_markdown && run.has_visual_plan)
  .sort((a, b) => {
    const aBand = a.final_markdown_word_count_estimate >= ag06e.summary.word_count_min ? 1 : 0;
    const bBand = b.final_markdown_word_count_estimate >= ag06e.summary.word_count_min ? 1 : 0;
    if (bBand !== aBand) return bBand - aBand;
    return b.final_markdown_word_count_estimate - a.final_markdown_word_count_estimate;
  });

function candidatePoolForArticle(article) {
  const scored = scaffoldCandidates
    .filter((run) => run.has_final_markdown)
    .map((run) => ({
      ...run,
      token_overlap_score: scoreCandidate(article, run)
    }))
    .sort((a, b) => {
      if (b.token_overlap_score !== a.token_overlap_score) return b.token_overlap_score - a.token_overlap_score;
      return b.final_markdown_word_count_estimate - a.final_markdown_word_count_estimate;
    });

  const direct = scored.filter((run) => run.token_overlap_score > 0).slice(0, 3);
  if (direct.length > 0) {
    return {
      match_status: "semantic_token_match_available",
      candidates: direct
    };
  }

  return {
    match_status: "general_long_form_scaffold_pool_only",
    candidates: strongScaffoldPool.slice(0, 3).map((run) => ({
      ...run,
      token_overlap_score: 0
    }))
  };
}

function buildQueueEntry(article, index) {
  const candidatePool = candidatePoolForArticle(article);
  const needsReferenceGovernance = article.has_complete_reference_governance !== true
    || Number(article.ag03_reference_link_count || 0) < ag06e.summary.verified_reference_min;

  const wordGap = Math.max(0, ag06e.summary.word_count_min - Number(article.word_count_estimate || 0));
  const priority = article.upgrade_priority === "high" || needsReferenceGovernance ? "high" : "medium";

  return {
    queue_id: `ag06f_public_upgrade_${String(index + 1).padStart(3, "0")}`,
    source_article_path: article.article_path,
    category: article.category,
    detected_title: article.detected_title,
    source_word_count_estimate: article.word_count_estimate,
    source_reference_link_count: article.ag03_reference_link_count,
    has_complete_reference_governance: article.has_complete_reference_governance,
    has_structured_visual_signal: article.has_structured_visual_signal,
    source_classification_tags: article.classification_tags,
    upgrade_priority: priority,
    recommended_handling: "upgrade_to_ag06e_long_form_content_packet_before_any_future_publication",
    target_standard: {
      word_count_min: ag06e.summary.word_count_min,
      word_count_max: ag06e.summary.word_count_max,
      verified_reference_min: ag06e.summary.verified_reference_min,
      verified_reference_max: ag06e.summary.verified_reference_max,
      quality_score_min_publish_ready: ag06e.summary.quality_score_min_publish_ready,
      visitor_value_score_min_publish_ready: ag06e.summary.visitor_value_score_min_publish_ready
    },
    required_upgrade_work: {
      long_form_rewrite_required: true,
      word_count_gap_to_minimum: wordGap,
      visual_plan_required: ag06e.summary.requires_visual_plan,
      primary_visual_required: ag06e.summary.requires_primary_visual,
      image_credit_required: ag06e.summary.requires_image_credit,
      data_box_chart_graph_or_infographic_required: ag06e.summary.requires_data_box_chart_graph_or_infographic,
      reference_governance_required: needsReferenceGovernance,
      quality_review_required: true,
      visitor_value_review_required: true,
      editorial_review_required: true,
      publish_readiness_review_required: true
    },
    scaffold_mapping: {
      match_status: candidatePool.match_status,
      candidate_count: candidatePool.candidates.length,
      candidates: candidatePool.candidates
    },
    publish_readiness_status: {
      content_packet_complete: false,
      word_count_within_1500_2200: false,
      reference_standard_passed: false,
      visual_standard_passed: false,
      data_enrichment_standard_passed: false,
      quality_score_passed: false,
      visitor_value_score_passed: false,
      editorial_review_passed: false,
      publish_ready: false
    },
    mutation_controls: {
      public_article_mutation_performed: false,
      reference_url_change_performed: false,
      scaffold_file_copy_performed: false,
      scaffold_file_move_performed: false,
      scaffold_file_delete_performed: false,
      public_publishing_performed: false
    },
    notes: "AG06F creates a governance queue/mapping only. It does not edit, publish, move, copy or delete any source artifact."
  };
}

const articleUpgradeQueue = publicArticles.map(buildQueueEntry);

const summary = {
  source_public_article_count_from_ag06d: publicArticles.length,
  queue_entry_count: articleUpgradeQueue.length,
  high_priority_queue_count: articleUpgradeQueue.filter((x) => x.upgrade_priority === "high").length,
  medium_priority_queue_count: articleUpgradeQueue.filter((x) => x.upgrade_priority === "medium").length,
  reference_governance_required_count: articleUpgradeQueue.filter((x) => x.required_upgrade_work.reference_governance_required).length,
  long_form_rewrite_required_count: articleUpgradeQueue.filter((x) => x.required_upgrade_work.long_form_rewrite_required).length,
  visual_enrichment_required_count: articleUpgradeQueue.filter((x) => x.required_upgrade_work.visual_plan_required).length,
  scaffold_run_entry_count_from_ag06c: scaffold.summary.run_entry_count,
  scaffold_final_markdown_count_from_ag06c: scaffold.summary.final_markdown_count,
  scaffold_above_1500_count_from_ag06c: scaffold.summary.runs_with_final_markdown_above_1500_words,
  direct_scaffold_match_available_count: articleUpgradeQueue.filter((x) => x.scaffold_mapping.match_status === "semantic_token_match_available").length,
  general_scaffold_pool_only_count: articleUpgradeQueue.filter((x) => x.scaffold_mapping.match_status === "general_long_form_scaffold_pool_only").length,
  queue_status: "pending_content_packet_upgrade",
  queue_only: true,
  current_public_articles_mutated: false,
  scaffold_outputs_mutated: false,
  reference_url_change_performed: false,
  public_publishing_enabled: false,
  next_stage_id: "AG06G"
};

const queue = {
  module_id: "AG06F",
  queue_id: "long-form-upgrade-queue",
  title: "Long-Form Production Queue / Content Packet Upgrade Mapping",
  status: "queue_mapping_only",
  depends_on: ["AG06D", "AG06E", "AG06C"],
  generated_from: {
    public_article_classification_register: "data/content-intelligence/quality-reviews/public-article-classification-register.json",
    long_form_article_standard: "data/content-intelligence/quality-reviews/long-form-article-standard.json",
    scaffold_output_preservation_register: "data/content-intelligence/run-registry/scaffold-output-preservation-register.json"
  },
  summary,
  article_upgrade_queue: articleUpgradeQueue,
  ...falseGuards
};

const mapping = {
  module_id: "AG06F",
  title: "Long-Form Upgrade Mapping",
  status: "mapping_only",
  summary,
  article_to_scaffold_upgrade_mapping: articleUpgradeQueue.map((entry) => ({
    queue_id: entry.queue_id,
    source_article_path: entry.source_article_path,
    category: entry.category,
    detected_title: entry.detected_title,
    upgrade_priority: entry.upgrade_priority,
    match_status: entry.scaffold_mapping.match_status,
    candidate_count: entry.scaffold_mapping.candidate_count,
    scaffold_candidates: entry.scaffold_mapping.candidates.map((candidate) => ({
      run_id: candidate.run_id,
      content_id_candidate: candidate.content_id_candidate,
      detected_title: candidate.detected_title,
      run_directory: candidate.run_directory,
      final_markdown_word_count_estimate: candidate.final_markdown_word_count_estimate,
      token_overlap_score: candidate.token_overlap_score,
      has_visual_plan: candidate.has_visual_plan,
      has_learning_snapshot: candidate.has_learning_snapshot
    })),
    required_upgrade_work: entry.required_upgrade_work,
    publish_ready: false
  })),
  ...falseGuards
};

const registry = {
  module_id: "AG06F",
  title: "Long-Form Production Queue / Content Packet Upgrade Mapping",
  governance_only: true,
  queue_mapping_only: true,
  depends_on: ["AG06C", "AG06D", "AG06E"],
  generated_artifacts: {
    queue: "data/content-intelligence/publish-queue/long-form-upgrade-queue.json",
    mapping: "data/content-intelligence/quality-reviews/long-form-upgrade-mapping.json",
    preview: "data/quality/ag06f-long-form-production-queue-preview.json",
    document: "docs/quality/AG06F_LONG_FORM_PRODUCTION_QUEUE.md"
  },
  summary,
  next_recommended_stage: {
    module_id: "AG06G",
    title: "Long-Form Content Packet Upgrade Dry-Run Review",
    allowed_scope: "review queue entries and select first controlled upgrade batch without mutating public articles or scaffold outputs",
    blocked_scope: "public article mutation, scaffold move/copy/delete, publishing, backend/Auth/Supabase activation"
  },
  ...falseGuards
};

const preview = {
  module_id: "AG06F",
  preview_only: true,
  summary,
  sample_queue_entries: articleUpgradeQueue.slice(0, 5).map((entry) => ({
    queue_id: entry.queue_id,
    source_article_path: entry.source_article_path,
    source_word_count_estimate: entry.source_word_count_estimate,
    upgrade_priority: entry.upgrade_priority,
    match_status: entry.scaffold_mapping.match_status,
    candidate_count: entry.scaffold_mapping.candidate_count,
    publish_ready: entry.publish_readiness_status.publish_ready
  })),
  no_mutation_summary: {
    public_article_mutation_performed: false,
    reference_url_change_performed: false,
    scaffold_file_copy_performed: false,
    scaffold_file_move_performed: false,
    scaffold_file_delete_performed: false,
    public_publishing_performed: false
  },
  next_stage_id: "AG06G"
};

const doc = `# AG06F — Long-Form Production Queue / Content Packet Upgrade Mapping

## Purpose

AG06F converts the AG06D public article classification and AG06E long-form article standard into a future production queue. It also maps each current public article upgrade candidate against available scaffold-output candidates recorded by AG06C.

AG06F is governance-only and queue/mapping-only. It does not edit public articles, change references, move scaffold files, copy scaffold files, delete scaffold files, publish content, or activate backend/Auth/Supabase/API/subscriber functionality.

## Inputs

AG06F consumes:

- AG06D public article classification register.
- AG06E long-form article standard.
- AG06C scaffold output preservation register.

## Queue Logic

Each AG06D public article classification row becomes one AG06F upgrade queue item. The queue item records:

- source article path;
- category and detected title;
- current word-count estimate;
- reference-governance status;
- visual-enrichment gap;
- AG06E target standard;
- required upgrade work;
- scaffold candidate mapping;
- publish-readiness status;
- mutation-control flags.

## Scaffold Mapping Logic

AG06F performs a non-mutating token-overlap mapping between public article metadata and scaffold run metadata. Where a direct token match is not available, AG06F assigns candidates from the general long-form scaffold pool only as learning/reference candidates. This is not a publication decision and does not import scaffold files.

## Publish-Readiness Position

Every AG06F queue item remains not publish-ready. Future publication consideration requires a separate content-packet upgrade, reference review, visual/data review, quality review, visitor-value review, and explicit publish-readiness decision under later governance stages.

## Explicit Exclusions

AG06F does not:

- mutate current public article HTML;
- alter AG03/AG05 reference blocks or URLs;
- copy, move, delete, import, or publish scaffold files;
- modify CSS or JavaScript;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup, or public dynamic output;
- mark any existing public article as final Drishvara-quality content.

## Acceptance Criteria

AG06F is acceptable only if:

- the queue contains exactly the AG06D classified public article count;
- every queue entry remains publish_ready=false;
- high/medium priority counts reconcile with AG06D logic;
- scaffold candidates are only mapped, never copied/moved/deleted/imported;
- AG06E word-count, reference, visual, quality, and visitor-value gates are carried forward;
- package scripts for generate:ag06f and validate:ag06f are present;
- validate:project includes validate:ag06f;
- no public article/reference/scaffold/CSS/JS/backend/Auth/Supabase/publishing mutation is performed.

## Next Stage

The recommended next stage is AG06G — Long-Form Content Packet Upgrade Dry-Run Review. AG06G may review the queue and select a controlled first batch for content-packet upgrade planning, but it must remain non-mutating unless separately approved.
`;

writeJson(queuePath, queue);
writeJson(mappingPath, mapping);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG06F long-form production queue artifacts generated.");
