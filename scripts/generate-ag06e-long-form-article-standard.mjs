import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ag06e-long-form-article-standard.json");
const previewPath = path.join(root, "data", "quality", "ag06e-long-form-article-standard-preview.json");
const docPath = path.join(root, "docs", "quality", "AG06E_LONG_FORM_ARTICLE_STANDARD.md");
const standardPath = path.join(root, "data", "content-intelligence", "quality-reviews", "long-form-article-standard.json");
const schemaPath = path.join(root, "data", "content-intelligence", "schema", "long-form-article-standard.schema.json");

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
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
  scaffold_file_copy_performed: false,
  scaffold_file_move_performed: false,
  scaffold_file_delete_performed: false,
  external_fetch_performed_by_script: false,
  live_url_fetch_performed: false,
  runtime_enabled: false,
  server_endpoint_enabled: false,
  api_route_enabled: false,
  backend_activation_enabled: false,
  supabase_enabled: false,
  auth_enabled: false,
  real_login_enabled: false,
  real_signup_enabled: false,
  user_account_collection_enabled: false,
  credential_collection_enabled: false,
  payment_enabled: false,
  admin_ui_enabled: false,
  subscriber_output_enabled: false,
  public_dynamic_output_enabled: false,
  frontend_deployment_enabled: false,
  backend_deployment_enabled: false,
  public_article_archive_enabled: false,
  public_article_delete_enabled: false,
  file_deletion_enabled: false,
  file_move_enabled: false
};

const qualityWeights = {
  depth_context_and_explanation: 20,
  evidence_and_reference_integrity: 20,
  structure_narrative_and_flow: 15,
  originality_and_drishvara_voice: 10,
  visual_data_and_infographic_value: 15,
  clarity_readability_and_reader_guidance: 10,
  safety_rights_and_editorial_risk: 10
};

const visitorValueWeights = {
  practical_or_reflective_takeaway: 25,
  conceptual_depth_and_context: 20,
  trust_evidence_and_source_clarity: 20,
  readability_and_time_worthiness: 15,
  visual_comprehension_support: 10,
  shareability_and_return_value: 10
};

const requiredPublishGates = [
  "content_packet_complete",
  "word_count_within_1500_2200",
  "minimum_two_verified_references",
  "maximum_five_references",
  "all_reference_urls_verified",
  "no_broken_spam_parked_or_irrelevant_reference",
  "visual_plan_complete",
  "primary_visual_available",
  "image_credit_or_attribution_recorded",
  "data_box_chart_graph_or_infographic_present",
  "quality_score_at_least_85",
  "visitor_value_score_at_least_80",
  "editorial_review_passed",
  "accuracy_and_safety_review_passed",
  "rights_and_originality_review_passed",
  "publish_queue_status_publish_ready"
];

const standard = {
  module_id: "AG06E",
  title: "Long-Form Article Standard",
  standard_type: "future_production_article_standard",
  governance_only: true,
  depends_on: ["AG06A", "AG06B", "AG06C", "AG06D"],
  consumes_evidence_from: [
    "data/quality/ag06a-full-source-of-truth-inventory-audit.json",
    "data/quality/ag06b-content-intelligence-schema.json",
    "data/quality/ag06c-scaffold-output-preservation-register.json",
    "data/quality/ag06d-existing-public-article-classification.json",
    "data/content-intelligence/quality-reviews/public-article-classification-register.json"
  ],
  purpose: "Define the mandatory Drishvara long-form article standard for future production without modifying current public articles, scaffold outputs, references, CSS, JavaScript, backend, Auth, Supabase, or publishing state.",
  summary: {
    word_count_min: 1500,
    word_count_max: 2200,
    verified_reference_min: 2,
    verified_reference_max: 5,
    requires_visual_plan: true,
    requires_primary_visual: true,
    requires_image_credit: true,
    requires_data_box_chart_graph_or_infographic: true,
    requires_quality_score: true,
    quality_score_min_publish_ready: 85,
    requires_visitor_value_score: true,
    visitor_value_score_min_publish_ready: 80,
    requires_review_status: true,
    current_public_articles_mutated: false,
    scaffold_outputs_mutated: false,
    public_publishing_enabled: false,
    next_stage_id: "AG06F"
  },
  article_length_standard: {
    minimum_words: 1500,
    maximum_words: 2200,
    ideal_band_words: "1700-2000",
    below_minimum_status: "long_form_upgrade_required",
    above_maximum_status: "editorial_compression_required",
    rationale: "AG06A and AG06D show current public articles are short test-corpus retention candidates, while AG06C confirms scaffold final markdown outputs provide a stronger long-form production base."
  },
  reference_standard: {
    minimum_verified_references: 2,
    maximum_verified_references: 5,
    required_reference_status: "verified",
    allowed_reference_roles: [
      "primary_context",
      "factual_support",
      "official_source",
      "research_or_data_source",
      "background_explainer"
    ],
    prohibited_reference_conditions: [
      "broken_url",
      "non_responsive_url",
      "spam_or_parked_domain",
      "irrelevant_to_article",
      "invented_or_placeholder_url",
      "unverified_reference_presented_as_verified"
    ],
    editorial_fallback_label: "under_editorial_verification"
  },
  visual_and_data_standard: {
    visual_plan_required: true,
    primary_visual_required: true,
    image_credit_or_attribution_required: true,
    minimum_data_enrichment_units: 1,
    accepted_data_enrichment_units: [
      "data_box",
      "comparison_table",
      "timeline",
      "chart",
      "graph",
      "map",
      "infographic",
      "structured_key_takeaways_box"
    ],
    visual_quality_requirements: [
      "topic_relevant",
      "not_logo_or_brand_placeholder",
      "rights_or_credit_recorded",
      "reader_comprehension_value_recorded",
      "mobile_safe_layout_expected"
    ]
  },
  content_packet_required_sections: [
    "article_identity",
    "topic_intent",
    "reader_value_promise",
    "long_form_outline",
    "draft_body",
    "verified_references",
    "visual_plan",
    "data_enrichment_plan",
    "quality_review",
    "visitor_value_review",
    "publish_readiness"
  ],
  quality_scoring: {
    scale_min: 0,
    scale_max: 100,
    publish_ready_minimum: 85,
    weights: qualityWeights
  },
  visitor_value_scoring: {
    scale_min: 0,
    scale_max: 100,
    publish_ready_minimum: 80,
    weights: visitorValueWeights
  },
  review_status_standard: {
    allowed_statuses: [
      "draft",
      "standard_check_pending",
      "reference_review_pending",
      "visual_review_pending",
      "editorial_review_pending",
      "quality_review_pending",
      "publish_ready",
      "revision_required",
      "rejected",
      "retained_for_learning"
    ],
    publish_ready_status: "publish_ready",
    rejected_or_learning_statuses: ["rejected", "retained_for_learning"]
  },
  publish_readiness_gates: requiredPublishGates,
  explicit_exclusions: [
    "No current public article page may be edited by AG06E.",
    "No AG03 reference URL may be changed by AG06E.",
    "No scaffold file may be copied, moved, deleted, or published by AG06E.",
    "No CSS or JavaScript may be changed by AG06E.",
    "No backend, API, Auth, Supabase, subscriber, payment, or public dynamic output may be activated by AG06E.",
    "No article is declared final Drishvara-quality solely because AG06E exists."
  ],
  next_stage: {
    next_stage_id: "AG06F",
    name: "Long-Form Production Queue / Content Packet Upgrade Mapping",
    allowed_scope: "governance queue or mapping only unless separately approved",
    blocked_scope: "public article mutation, scaffold movement, publishing, backend activation"
  },
  ...falseGuards
};

const registry = {
  module_id: "AG06E",
  title: "Long-Form Article Standard",
  generated_artifacts: {
    document: "docs/quality/AG06E_LONG_FORM_ARTICLE_STANDARD.md",
    standard: "data/content-intelligence/quality-reviews/long-form-article-standard.json",
    schema: "data/content-intelligence/schema/long-form-article-standard.schema.json",
    preview: "data/quality/ag06e-long-form-article-standard-preview.json"
  },
  governance_only: true,
  summary: standard.summary,
  ...falseGuards
};

const schema = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "drishvara/content-intelligence/long-form-article-standard.schema.json",
  title: "AG06E Long-Form Article Standard Content Packet Schema",
  module_id: "AG06E",
  type: "object",
  additionalProperties: true,
  required: [
    "article_identity",
    "target_word_count",
    "actual_word_count",
    "verified_references",
    "visual_plan",
    "data_enrichment_units",
    "quality_score",
    "visitor_value_score",
    "review_status",
    "publish_readiness_gates"
  ],
  properties: {
    article_identity: {
      type: "object",
      required: ["title", "category", "topic_intent"],
      properties: {
        title: { type: "string" },
        category: { type: "string" },
        topic_intent: { type: "string" }
      }
    },
    target_word_count: { type: "integer", minimum: 1500, maximum: 2200 },
    actual_word_count: { type: "integer", minimum: 1500, maximum: 2200 },
    verified_references: {
      type: "array",
      minItems: 2,
      maxItems: 5,
      items: {
        type: "object",
        required: ["url", "title", "source_type", "verification_status"],
        properties: {
          url: { type: "string" },
          title: { type: "string" },
          source_type: { type: "string" },
          verification_status: { const: "verified" }
        }
      }
    },
    visual_plan: {
      type: "object",
      required: ["primary_visual_required", "image_credit_required"],
      properties: {
        primary_visual_required: { const: true },
        image_credit_required: { const: true }
      }
    },
    data_enrichment_units: {
      type: "array",
      minItems: 1,
      items: { type: "string" }
    },
    quality_score: { type: "integer", minimum: 85, maximum: 100 },
    visitor_value_score: { type: "integer", minimum: 80, maximum: 100 },
    review_status: { enum: standard.review_status_standard.allowed_statuses },
    publish_readiness_gates: {
      type: "array",
      items: { type: "string" }
    }
  },
  governance_only: true,
  runtime_activation_enabled: false,
  public_output_enabled: false
};

const preview = {
  module_id: "AG06E",
  preview_only: true,
  standard_summary: standard.summary,
  required_publish_gate_count: requiredPublishGates.length,
  quality_weight_total: Object.values(qualityWeights).reduce((a, b) => a + b, 0),
  visitor_value_weight_total: Object.values(visitorValueWeights).reduce((a, b) => a + b, 0),
  no_mutation_summary: {
    public_article_mutation_performed: false,
    scaffold_outputs_mutated: false,
    reference_url_change_performed: false,
    backend_activation_enabled: false,
    public_publishing_enabled: false
  },
  next_stage_id: "AG06F"
};

const doc = `# AG06E — Long-Form Article Standard

## Purpose

AG06E defines the mandatory Drishvara long-form article standard for future production. It responds to the AG06A–AG06D finding that current public articles are useful as test-corpus retention candidates but are not yet final Drishvara-quality content.

AG06E is a standard-setting and governance-only layer. It does not edit current public articles, does not move scaffold outputs, does not change reference URLs, and does not activate publishing, backend, Supabase, Auth, subscriber output, or dynamic public output.

## Scope

AG06E applies to future Drishvara production articles and upgraded content packets. A future article should be treated as publish-ready only when it satisfies the following minimum standard:

- 1,500–2,200 words.
- 2–5 verified references.
- A completed visual plan.
- A primary visual with image credit or attribution.
- At least one data box, chart, graph, table, timeline, map, infographic, or structured insight box.
- Quality score of at least 85/100.
- Visitor-value score of at least 80/100.
- Review status marked as publish_ready only after all gates are passed.

## Long-Form Standard

The required article length is 1,500–2,200 words, with an ideal operating band of 1,700–2,000 words. Articles below this range must be marked as long_form_upgrade_required. Articles above this range must be reviewed for editorial compression.

## Reference Standard

Each future article must carry 2–5 verified references. References must be relevant, reachable, non-spam, non-parked, non-placeholder, and clearly connected to the article. If verification is incomplete, the article must show the reference state as under editorial verification rather than presenting the link as verified.

## Visual, Data and Infographic Standard

Each future article must include a visual plan, a primary visual, and image credit or attribution. It must also include at least one reader-value enrichment unit such as a data box, comparison table, timeline, chart, graph, map, infographic, or structured key-takeaways box.

## Quality Scoring

Publish-ready quality requires a score of at least 85/100.

Quality scoring weights:

- Depth, context and explanation: 20
- Evidence and reference integrity: 20
- Structure, narrative and flow: 15
- Originality and Drishvara voice: 10
- Visual, data and infographic value: 15
- Clarity, readability and reader guidance: 10
- Safety, rights and editorial risk: 10

## Visitor-Value Scoring

Publish-ready visitor value requires a score of at least 80/100.

Visitor-value scoring weights:

- Practical or reflective takeaway: 25
- Conceptual depth and context: 20
- Trust, evidence and source clarity: 20
- Readability and time-worthiness: 15
- Visual comprehension support: 10
- Shareability and return value: 10

## Review Status

Allowed review statuses are:

- draft
- standard_check_pending
- reference_review_pending
- visual_review_pending
- editorial_review_pending
- quality_review_pending
- publish_ready
- revision_required
- rejected
- retained_for_learning

Only publish_ready is eligible for future publication consideration.

## Publish-Readiness Gates

A future article must pass all gates recorded in \`data/content-intelligence/quality-reviews/long-form-article-standard.json\`, including word count, verified references, visual plan, image credit, data enrichment, quality score, visitor-value score, editorial review, accuracy/safety review, and rights/originality review.

## Explicit Exclusions

AG06E does not:

- mutate current public article HTML;
- change AG03 reference URLs;
- copy, move, delete, or publish scaffold files;
- modify CSS or JavaScript;
- activate backend, API, Auth, Supabase, subscriber, payment, admin, login, signup, or public dynamic output;
- declare any current public article final Drishvara-quality content.

## Acceptance Criteria

AG06E is acceptable only if:

- AG06E registry, document, standard, schema and preview files are present;
- word-count standard is exactly 1,500–2,200 words;
- reference standard is exactly 2–5 verified references;
- visual plan, primary visual, image credit and data-enrichment requirements are declared;
- quality-score and visitor-value-score gates are declared;
- all quality and visitor-value weights total 100 each;
- publish-readiness gates are recorded;
- no public article, reference URL, scaffold file, CSS, JavaScript, backend, Auth, Supabase or deployment mutation is performed.
`;

writeJson(registryPath, registry);
writeJson(standardPath, standard);
writeJson(schemaPath, schema);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG06E long-form article standard artifacts generated.");
