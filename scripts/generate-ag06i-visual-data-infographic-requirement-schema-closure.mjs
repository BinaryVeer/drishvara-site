import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag06hR1Review: "data/content-intelligence/quality-reviews/content-intelligence-foundation-alignment-review.json",
  ag06eStandard: "data/content-intelligence/quality-reviews/long-form-article-standard.json",
  ag06hPlanningQueue: "data/content-intelligence/publish-queue/long-form-batch-01-content-packet-planning.json",
  contentPacketSchema: "data/content-intelligence/schema/content-packet.schema.json"
};

const registryPath = path.join(root, "data", "quality", "ag06i-visual-data-infographic-requirement-schema-closure.json");
const previewPath = path.join(root, "data", "quality", "ag06i-visual-data-infographic-requirement-schema-closure-preview.json");
const closurePath = path.join(root, "data", "content-intelligence", "quality-reviews", "visual-data-infographic-requirement-schema-closure.json");
const visualStandardPath = path.join(root, "data", "content-intelligence", "visual-registry", "visual-data-infographic-requirement-standard.json");
const schemaPath = path.join(root, "data", "content-intelligence", "schema", "visual-data-infographic-requirement.schema.json");
const docPath = path.join(root, "docs", "quality", "AG06I_VISUAL_DATA_INFOGRAPHIC_REQUIREMENT_SCHEMA_CLOSURE.md");

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
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
  reference_insertion_performed: false,
  verified_reference_population_performed: false,
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
  scaffold_import_performed: false,
  file_deletion_performed: false,
  file_move_performed: false,
  public_article_archive_performed: false,
  public_article_delete_performed: false,
  public_publishing_performed: false,
  content_packet_generation_performed: false,
  content_packet_created: false,
  article_rewrite_performed: false,
  visual_asset_generation_performed: false,
  image_generation_performed: false,
  infographic_generation_performed: false,
  chart_generation_performed: false,
  map_generation_performed: false,
  quality_scoring_performed: false,
  visitor_value_scoring_performed: false
};

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) {
    throw new Error(`Missing required AG06I input ${name}: ${relativePath}`);
  }
}

const ag06hR1 = readJson(inputs.ag06hR1Review);
const ag06e = readJson(inputs.ag06eStandard);
const ag06hQueue = readJson(inputs.ag06hPlanningQueue);
const contentPacketSchema = readJson(inputs.contentPacketSchema);

const visualTypes = [
  {
    type_id: "hero_visual",
    label: "Primary Hero Visual",
    required: true,
    minimum_per_article: 1,
    maximum_per_article: 1,
    purpose: "Give the article a clear first visual identity and topic signal.",
    required_fields: [
      "visual_intent",
      "placement",
      "source_or_generation_basis",
      "rights_or_credit_status",
      "alt_text_plan",
      "mobile_safe_expectation"
    ]
  },
  {
    type_id: "data_box",
    label: "Structured Data Box",
    required: false,
    counts_as_structured_enrichment: true,
    purpose: "Summarise facts, figures, definitions, frameworks or comparison points in a reader-friendly box."
  },
  {
    type_id: "comparison_table",
    label: "Comparison Table",
    required: false,
    counts_as_structured_enrichment: true,
    purpose: "Compare concepts, options, timelines, stakeholder roles or before/after states."
  },
  {
    type_id: "timeline",
    label: "Timeline",
    required: false,
    counts_as_structured_enrichment: true,
    purpose: "Show sequence, evolution, milestones or process stages."
  },
  {
    type_id: "concept_diagram",
    label: "Concept Diagram",
    required: false,
    counts_as_structured_enrichment: true,
    purpose: "Explain relationships, systems, workflows or layered ideas visually."
  },
  {
    type_id: "flowchart",
    label: "Flowchart",
    required: false,
    counts_as_structured_enrichment: true,
    purpose: "Represent decisions, review gates, service journeys or procedural logic."
  },
  {
    type_id: "chart_or_graph",
    label: "Chart or Graph",
    required: false,
    counts_as_structured_enrichment: true,
    purpose: "Represent quantitative relationships where credible data is available."
  },
  {
    type_id: "map_or_spatial_view",
    label: "Map or Spatial View",
    required: false,
    counts_as_structured_enrichment: true,
    purpose: "Represent geography, regional variation, route, location or distribution when relevant."
  },
  {
    type_id: "infographic",
    label: "Infographic",
    required: false,
    counts_as_structured_enrichment: true,
    purpose: "Combine key ideas, numbers and visual hierarchy into a compact reader-value unit."
  },
  {
    type_id: "structured_key_takeaways_box",
    label: "Structured Key Takeaways Box",
    required: false,
    counts_as_structured_enrichment: true,
    purpose: "Provide high-retention reader takeaways when a richer chart or diagram is not appropriate."
  }
];

const structuredTypes = visualTypes.filter((x) => x.counts_as_structured_enrichment).map((x) => x.type_id);

const visualQualityWeights = {
  relevance_to_article_argument: 20,
  reader_comprehension_value: 20,
  evidence_or_source_basis: 15,
  rights_credit_and_attribution_readiness: 15,
  mobile_layout_safety: 10,
  accessibility_alt_text_and_caption_plan: 10,
  originality_and_drishvara_visual_voice: 10
};

const visualStandard = {
  module_id: "AG06I",
  title: "Visual / Data / Infographic Requirement Standard",
  standard_type: "future_long_form_visual_intelligence_standard",
  status: "schema_closure_only",
  governance_only: true,
  depends_on: ["AG06H-R1", "AG06E", "AG06H", "AG06B"],
  generated_from: inputs,
  purpose: "Define the mandatory visual, data-box, chart, graph, table, map, diagram and infographic requirements for future Drishvara long-form content packets without generating visual assets or mutating public articles.",
  summary: {
    primary_hero_visual_required: true,
    minimum_primary_hero_visual_count: 1,
    structured_visual_or_data_unit_required: true,
    minimum_structured_visual_or_data_unit_count: 1,
    allowed_visual_type_count: visualTypes.length,
    structured_enrichment_type_count: structuredTypes.length,
    image_credit_or_attribution_required: true,
    alt_text_plan_required: true,
    mobile_safe_layout_required: true,
    visual_quality_score_required: true,
    visual_quality_score_min_publish_ready: 80,
    visual_asset_generation_allowed: false,
    infographic_generation_allowed: false,
    public_article_mutation_allowed: false,
    next_stage_id: "AG06J"
  },
  visual_types: visualTypes,
  structured_enrichment_types: structuredTypes,
  mandatory_article_visual_requirements: {
    primary_hero_visual: {
      required: true,
      minimum_count: 1,
      maximum_count: 1,
      must_have_credit_or_attribution: true,
      must_have_alt_text_plan: true,
      must_have_caption_or_context_plan: true
    },
    structured_visual_or_data_unit: {
      required: true,
      minimum_count: 1,
      accepted_types: structuredTypes,
      may_be_non_generated_textual_structure: true,
      examples: [
        "data_box",
        "comparison_table",
        "timeline",
        "concept_diagram",
        "flowchart",
        "chart_or_graph",
        "map_or_spatial_view",
        "infographic"
      ]
    }
  },
  per_visual_record_required_fields: [
    "visual_id",
    "visual_type",
    "article_or_packet_id",
    "placement",
    "visual_intent",
    "reader_value",
    "source_or_data_basis",
    "rights_or_credit_status",
    "credit_or_attribution_text",
    "alt_text_plan",
    "caption_or_context_plan",
    "mobile_safe_layout_expectation",
    "generation_status",
    "review_status"
  ],
  allowed_generation_statuses: [
    "not_generated",
    "planning_only",
    "candidate_needed",
    "candidate_under_review",
    "approved_for_future_generation",
    "generated_in_later_stage",
    "rejected"
  ],
  allowed_review_statuses: [
    "planned_not_reviewed",
    "visual_review_pending",
    "source_basis_review_pending",
    "rights_credit_review_pending",
    "accessibility_review_pending",
    "approved_for_packet",
    "revision_required",
    "rejected"
  ],
  visual_quality_scoring: {
    scale_min: 0,
    scale_max: 100,
    publish_ready_minimum: 80,
    weights: visualQualityWeights
  },
  publish_readiness_gates: [
    "primary_hero_visual_planned",
    "primary_hero_visual_credit_or_attribution_planned",
    "primary_hero_visual_alt_text_planned",
    "at_least_one_structured_visual_or_data_unit_planned",
    "visual_source_or_data_basis_recorded",
    "rights_credit_review_pending_or_passed",
    "mobile_safe_layout_expectation_recorded",
    "visual_quality_score_planned",
    "no_visual_asset_generation_in_ag06i",
    "no_public_article_mutation_in_ag06i"
  ],
  explicit_exclusions: [
    "AG06I does not generate hero images.",
    "AG06I does not generate infographics.",
    "AG06I does not generate charts, maps, diagrams or visual assets.",
    "AG06I does not edit public article HTML.",
    "AG06I does not change CSS or JavaScript.",
    "AG06I does not insert or change references.",
    "AG06I does not copy, move, delete or import scaffold outputs.",
    "AG06I does not publish content.",
    "AG06I does not activate backend, Auth, Supabase, API, subscriber, login or signup functionality."
  ],
  next_stage: {
    module_id: "AG06J",
    title: "Reference and Source Credibility Schema Closure",
    allowed_scope: "schema/document/registry/preview/validator only",
    blocked_scope: "web fetching by script, reference insertion, article mutation, public publishing"
  },
  ...falseGuards
};

const schema = {
  schema_id: "drishvara/ag06i/visual-data-infographic-requirement.schema.json",
  module_id: "AG06I",
  title: "Visual / Data / Infographic Requirement Schema",
  status: "schema_only",
  description: "Schema for planning visual, data-box, table, chart, graph, map, diagram and infographic requirements in future long-form content packets. This schema does not authorize asset generation or public mutation.",
  required_top_level_fields: [
    "article_or_packet_id",
    "primary_hero_visual",
    "structured_visual_or_data_units",
    "visual_quality_review",
    "visual_rights_credit_review",
    "visual_publish_readiness_gates"
  ],
  field_contract: {
    article_or_packet_id: "Stable future content packet or article identifier.",
    primary_hero_visual: "One required planned hero visual record.",
    structured_visual_or_data_units: "At least one planned structured visual or data unit.",
    visual_quality_review: "Future review record; AG06I does not perform scoring.",
    visual_rights_credit_review: "Future rights, credit and attribution review record.",
    visual_publish_readiness_gates: "Gate checklist inherited from AG06I standard."
  },
  primary_hero_visual_contract: visualStandard.mandatory_article_visual_requirements.primary_hero_visual,
  structured_visual_or_data_unit_contract: visualStandard.mandatory_article_visual_requirements.structured_visual_or_data_unit,
  per_visual_record_required_fields: visualStandard.per_visual_record_required_fields,
  allowed_visual_types: visualTypes.map((x) => x.type_id),
  allowed_generation_statuses: visualStandard.allowed_generation_statuses,
  allowed_review_statuses: visualStandard.allowed_review_statuses,
  publish_readiness_gates: visualStandard.publish_readiness_gates,
  generation_allowed_in_ag06i: false,
  public_mutation_allowed_in_ag06i: false,
  ...falseGuards
};

const closure = {
  module_id: "AG06I",
  title: "Visual / Data / Infographic Requirement Schema Closure",
  status: "schema_closure_only",
  governance_only: true,
  depends_on: ["AG06H-R1"],
  generated_from: inputs,
  summary: visualStandard.summary,
  alignment_with_ag06h_r1: {
    immediate_next_stage_from_ag06h_r1: ag06hR1.summary.immediate_next_stage,
    ag07_blocked_until_ag06z: ag06hR1.summary.ag07_blocked_until_ag06z,
    reference_discovery_paused: ag06hR1.decision.do_not_proceed_to_reference_discovery_yet,
    ag06i_scope_confirmed: "visual_data_infographic_requirement_schema_closure_only"
  },
  ag06e_gate_alignment: {
    requires_visual_plan: ag06e.summary.requires_visual_plan,
    requires_primary_visual: ag06e.summary.requires_primary_visual,
    requires_image_credit: ag06e.summary.requires_image_credit,
    requires_data_box_chart_graph_or_infographic: ag06e.summary.requires_data_box_chart_graph_or_infographic,
    publish_readiness_gate_count_from_ag06e: ag06e.publish_readiness_gates.length
  },
  ag06h_batch_planning_alignment: {
    planning_entry_count: ag06hQueue.summary.planning_entry_count,
    entries_with_visual_plan_required: ag06hQueue.summary.entries_with_visual_plan_required,
    entries_with_data_enrichment_plan_required: ag06hQueue.summary.entries_with_data_enrichment_plan_required
  },
  visual_standard_file: "data/content-intelligence/visual-registry/visual-data-infographic-requirement-standard.json",
  schema_file: "data/content-intelligence/schema/visual-data-infographic-requirement.schema.json",
  closure_decision: {
    decision: "visual_data_infographic_requirement_schema_closed_for_foundation",
    proceed_to_ag06j_reference_source_credibility_schema_closure: true,
    visual_asset_generation_allowed: false,
    public_article_mutation_allowed: false,
    content_packet_generation_allowed: false,
    publication_allowed: false
  },
  ...falseGuards
};

const registry = {
  module_id: "AG06I",
  title: "Visual / Data / Infographic Requirement Schema Closure",
  governance_only: true,
  schema_closure_only: true,
  depends_on: ["AG06H-R1", "AG06E", "AG06H", "AG06B"],
  generated_artifacts: {
    closure_review: "data/content-intelligence/quality-reviews/visual-data-infographic-requirement-schema-closure.json",
    visual_standard: "data/content-intelligence/visual-registry/visual-data-infographic-requirement-standard.json",
    schema: "data/content-intelligence/schema/visual-data-infographic-requirement.schema.json",
    preview: "data/quality/ag06i-visual-data-infographic-requirement-schema-closure-preview.json",
    document: "docs/quality/AG06I_VISUAL_DATA_INFOGRAPHIC_REQUIREMENT_SCHEMA_CLOSURE.md"
  },
  summary: visualStandard.summary,
  next_recommended_stage: visualStandard.next_stage,
  ...falseGuards
};

const preview = {
  module_id: "AG06I",
  preview_only: true,
  summary: visualStandard.summary,
  visual_types_preview: visualTypes.map((x) => ({
    type_id: x.type_id,
    label: x.label,
    required: x.required,
    counts_as_structured_enrichment: x.counts_as_structured_enrichment === true
  })),
  publish_readiness_gates_preview: visualStandard.publish_readiness_gates,
  no_mutation_summary: {
    visual_asset_generation_performed: false,
    infographic_generation_performed: false,
    chart_generation_performed: false,
    map_generation_performed: false,
    public_article_mutation_performed: false,
    css_mutation_performed: false,
    javascript_mutation_performed: false,
    reference_url_change_performed: false,
    public_publishing_performed: false,
    backend_activation_performed: false,
    supabase_enabled: false,
    auth_enabled: false
  },
  next_stage_id: "AG06J"
};

const doc = `# AG06I — Visual / Data / Infographic Requirement Schema Closure

## Purpose

AG06I closes the dedicated visual, data and infographic requirement schema for future Drishvara long-form Featured Reads.

This stage translates the transition-handbook requirement of visual intelligence into a formal governance standard. It defines what future long-form content packets must plan before they can move toward production.

AG06I does not generate visual assets, hero images, charts, maps, diagrams or infographics. It does not mutate public articles, CSS, JavaScript, references, scaffold outputs, backend, Auth, Supabase, API routes or publishing state.

## Inputs

AG06I consumes:

- AG06H-R1 Content Intelligence Foundation Alignment Review.
- AG06E Long-Form Article Standard.
- AG06H Batch 01 Content Packet Upgrade Planning.
- AG06B Content Packet Schema.

## Mandatory Visual Standard

Every future long-form Drishvara Featured Read must plan:

- one primary hero visual;
- image credit or attribution;
- alt-text plan;
- caption or context plan;
- mobile-safe layout expectation;
- at least one structured visual/data unit.

Accepted structured visual/data units include:

- data box;
- comparison table;
- timeline;
- concept diagram;
- flowchart;
- chart or graph;
- map or spatial view;
- infographic;
- structured key-takeaways box.

## Visual Quality Requirements

Future visual planning must record:

- visual intent;
- reader value;
- source or data basis;
- rights or credit status;
- alt-text plan;
- caption/context plan;
- mobile-safe layout expectation;
- generation status;
- review status.

## Visual Quality Scoring

AG06I defines a future visual quality score but does not perform scoring.

The publish-ready threshold is 80/100.

Scoring weights:

- Relevance to article argument: 20
- Reader comprehension value: 20
- Evidence or source basis: 15
- Rights, credit and attribution readiness: 15
- Mobile layout safety: 10
- Accessibility, alt text and caption plan: 10
- Originality and Drishvara visual voice: 10

## Publish-Readiness Gates

AG06I records gates for future visual readiness:

- primary hero visual planned;
- primary hero visual credit or attribution planned;
- primary hero visual alt text planned;
- at least one structured visual or data unit planned;
- visual source or data basis recorded;
- rights/credit review pending or passed;
- mobile-safe layout expectation recorded;
- visual quality score planned;
- no visual asset generation in AG06I;
- no public article mutation in AG06I.

## Explicit Exclusions

AG06I does not:

- generate hero visuals;
- generate infographics;
- generate charts, maps, diagrams or visual assets;
- edit current public article HTML;
- modify CSS or JavaScript;
- insert, populate or change reference URLs;
- copy, move, delete, import or publish scaffold files;
- generate article rewrites;
- generate upgraded content packets;
- assign final quality or visitor-value scores;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup or public dynamic output;
- mark any existing public article as final Drishvara-quality content.

## Acceptance Criteria

AG06I is acceptable only if:

- AG06H-R1, AG06E, AG06H and AG06B inputs are present;
- the primary hero visual requirement is defined;
- the structured visual/data-unit requirement is defined;
- image credit/attribution, alt-text, caption/context and mobile-safe layout requirements are defined;
- allowed visual and data enrichment types are recorded;
- visual quality scoring weights total 100;
- publish-readiness gates are recorded;
- package scripts for generate:ag06i and validate:ag06i are present;
- validate:project includes validate:ag06i;
- no visual generation, public article mutation, reference change, CSS/JS mutation, scaffold import, backend/Auth/Supabase activation or publishing is performed.

## Next Stage

The next stage is AG06J — Reference and Source Credibility Schema Closure.
`;

writeJson(visualStandardPath, visualStandard);
writeJson(schemaPath, schema);
writeJson(closurePath, closure);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG06I visual/data/infographic requirement schema closure artifacts generated.");
