import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag06hR1Review: "data/content-intelligence/quality-reviews/content-intelligence-foundation-alignment-review.json",
  ag06eStandard: "data/content-intelligence/quality-reviews/long-form-article-standard.json",
  ag06iClosure: "data/content-intelligence/quality-reviews/visual-data-infographic-requirement-schema-closure.json",
  ag06iVisualStandard: "data/content-intelligence/visual-registry/visual-data-infographic-requirement-standard.json",
  contentPacketSchema: "data/content-intelligence/schema/content-packet.schema.json"
};

const optionalInputs = {
  ag03zClosure: "data/quality/ag03z-final-verified-reference-closure-audit.json",
  ag05zClosure: "data/quality/ag05z-public-page-live-readiness-smoke-governance-closure.json",
  ag06dClassification: "data/content-intelligence/quality-reviews/public-article-classification-register.json"
};

const registryPath = path.join(root, "data", "quality", "ag06j-reference-source-credibility-schema-closure.json");
const previewPath = path.join(root, "data", "quality", "ag06j-reference-source-credibility-schema-closure-preview.json");
const closurePath = path.join(root, "data", "content-intelligence", "quality-reviews", "reference-source-credibility-schema-closure.json");
const standardPath = path.join(root, "data", "content-intelligence", "reference-registry", "reference-source-credibility-standard.json");
const schemaPath = path.join(root, "data", "content-intelligence", "schema", "reference-source-credibility.schema.json");
const docPath = path.join(root, "docs", "quality", "AG06J_REFERENCE_SOURCE_CREDIBILITY_SCHEMA_CLOSURE.md");

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

const falseGuards = {
  mutation_performed: false,
  public_article_mutation_performed: false,
  article_html_mutation_performed: false,
  homepage_mutation_performed: false,
  css_mutation_performed: false,
  javascript_mutation_performed: false,
  reference_url_change_performed: false,
  reference_insertion_performed: false,
  reference_url_population_performed: false,
  verified_reference_population_performed: false,
  candidate_reference_population_performed: false,
  external_fetch_performed_by_script: false,
  live_url_fetch_performed: false,
  link_health_fetch_performed: false,
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
  infographic_generation_performed: false,
  quality_scoring_performed: false,
  visitor_value_scoring_performed: false
};

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) {
    throw new Error(`Missing required AG06J input ${name}: ${relativePath}`);
  }
}

const ag06hR1 = readJson(inputs.ag06hR1Review);
const ag06e = readJson(inputs.ag06eStandard);
const ag06i = readJson(inputs.ag06iClosure);
const ag06iVisualStandard = readJson(inputs.ag06iVisualStandard);
const contentPacketSchema = readJson(inputs.contentPacketSchema);

const optionalEvidence = {};
for (const [name, relativePath] of Object.entries(optionalInputs)) {
  optionalEvidence[name] = {
    path: relativePath,
    present: exists(relativePath)
  };
}

const sourceTypeTaxonomy = [
  {
    source_type: "official_government_or_public_institution",
    credibility_default: "preferred",
    examples: ["official ministry", "government department", "constitutional/statutory body", "public data portal"],
    use_case: "Policy, public programme, public administration, regulation, public statistics."
  },
  {
    source_type: "peer_reviewed_or_academic",
    credibility_default: "preferred",
    examples: ["journal article", "university publication", "scholarly working paper"],
    use_case: "Science, mental health, technology, social research, evidence-heavy claims."
  },
  {
    source_type: "recognized_institutional_report",
    credibility_default: "preferred",
    examples: ["UN agency", "World Bank", "WHO", "OECD", "reputed think tank", "official federation report"],
    use_case: "Global affairs, development, sports governance, public policy, comparative analysis."
  },
  {
    source_type: "credible_data_or_statistics_source",
    credibility_default: "preferred",
    examples: ["official statistics", "open data catalogue", "recognized research dataset"],
    use_case: "Charts, graphs, data boxes, quantitative claims."
  },
  {
    source_type: "reputable_news_or_wire",
    credibility_default: "accepted",
    examples: ["established newsroom", "wire service", "credible specialist publication"],
    use_case: "Current affairs, recent events, developing issues."
  },
  {
    source_type: "primary_document_or_original_material",
    credibility_default: "preferred",
    examples: ["judgment", "speech transcript", "official press release", "treaty text", "policy document"],
    use_case: "Direct interpretation and factual grounding."
  },
  {
    source_type: "domain_expert_or_explainer",
    credibility_default: "conditional",
    examples: ["expert essay", "specialist commentary", "credible educational source"],
    use_case: "Contextual explanation where primary sources are insufficient."
  },
  {
    source_type: "classical_or_traditional_text_reference",
    credibility_default: "conditional",
    examples: ["recognized Sanskrit text edition", "traditional commentary", "reputed cultural almanac"],
    use_case: "Spiritual, Sanskrit, Panchang, Vedic or cultural guidance references."
  },
  {
    source_type: "brand_or_commercial_source",
    credibility_default: "restricted",
    examples: ["company blog", "vendor page", "sponsored explainer"],
    use_case: "Only for claims about that organization/product; not for independent evidence."
  },
  {
    source_type: "user_generated_or_social_media",
    credibility_default: "restricted",
    examples: ["social media post", "forum", "comment thread", "unverified video"],
    use_case: "Only as object of analysis, not as factual authority unless independently verified."
  },
  {
    source_type: "weak_or_disallowed_source",
    credibility_default: "rejected",
    examples: ["spam", "parked domain", "broken page", "content farm", "AI-slop page", "unreachable URL"],
    use_case: "Must not be approved."
  }
];

const credibilityTiers = [
  {
    tier: "preferred",
    meaning: "High-trust source type suitable for approving factual, analytical or data-based claims.",
    approval_allowed: true
  },
  {
    tier: "accepted",
    meaning: "Generally usable when relevant, reachable, credible and not contradicted by stronger sources.",
    approval_allowed: true
  },
  {
    tier: "conditional",
    meaning: "May be used with explicit context, limited claim scope and stronger supporting evidence where needed.",
    approval_allowed: true
  },
  {
    tier: "restricted",
    meaning: "Use only for limited purposes and never as sole authority for high-impact factual claims.",
    approval_allowed: false
  },
  {
    tier: "rejected",
    meaning: "Not suitable for Drishvara references.",
    approval_allowed: false
  }
];

const referenceLifecycleStatuses = [
  "candidate_planned",
  "candidate_identified_in_future_stage",
  "reachability_review_pending",
  "relevance_review_pending",
  "credibility_review_pending",
  "recency_context_review_pending",
  "independence_diversity_review_pending",
  "link_health_review_pending",
  "rights_and_reader_safety_review_pending",
  "approved_for_content_packet",
  "approved_for_public_insertion_in_later_stage",
  "rejected",
  "under_editorial_verification"
];

const rejectionReasons = [
  "unreachable_or_broken",
  "parked_domain_or_spam",
  "irrelevant_to_article_claim",
  "low_credibility_source",
  "commercial_bias_not_disclosed",
  "duplicate_of_stronger_source",
  "outdated_for_current_claim",
  "no_clear_author_or_publisher",
  "content_farm_or_ai_generated_low_value",
  "unsafe_or_misleading_content",
  "not_accessible_to_reader",
  "better_primary_source_available"
];

const sourceScoringWeights = {
  relevance_to_claim_or_article: 20,
  source_authority_and_institutional_credibility: 20,
  reachability_and_link_health: 15,
  factual_specificity_and_traceability: 15,
  independence_and_source_diversity: 10,
  recency_or_timelessness_fit: 10,
  reader_accessibility_and_non_spam_safety: 5,
  citation_completeness_metadata: 5
};

const standard = {
  module_id: "AG06J",
  title: "Reference and Source Credibility Standard",
  standard_type: "future_long_form_reference_source_credibility_standard",
  status: "schema_closure_only",
  governance_only: true,
  depends_on: ["AG06H-R1", "AG06E", "AG06I", "AG06B"],
  generated_from: inputs,
  optional_evidence: optionalEvidence,
  purpose: "Define the candidate-source, approved-source, rejected-source, verification-status, credibility-tier and link-health governance required before future Drishvara long-form content packets can use references.",
  summary: {
    verified_reference_min_per_long_form_article: ag06e.summary.verified_reference_min,
    verified_reference_max_per_long_form_article: ag06e.summary.verified_reference_max,
    candidate_reference_minimum_recommended_per_article: Math.max(ag06e.summary.verified_reference_min * 2, 4),
    approved_reference_minimum_required_for_publish_ready: ag06e.summary.verified_reference_min,
    source_type_count: sourceTypeTaxonomy.length,
    credibility_tier_count: credibilityTiers.length,
    lifecycle_status_count: referenceLifecycleStatuses.length,
    rejection_reason_count: rejectionReasons.length,
    source_quality_score_required: true,
    source_quality_score_min_publish_ready: 85,
    link_health_review_required: true,
    approved_and_rejected_source_trail_required: true,
    no_web_fetching_by_script: true,
    reference_url_population_allowed: false,
    reference_insertion_allowed: false,
    public_article_mutation_allowed: false,
    next_stage_id: "AG06K"
  },
  source_type_taxonomy: sourceTypeTaxonomy,
  credibility_tiers: credibilityTiers,
  reference_lifecycle_statuses: referenceLifecycleStatuses,
  rejection_reasons: rejectionReasons,
  per_reference_candidate_required_fields: [
    "reference_id",
    "article_or_packet_id",
    "claim_or_section_supported",
    "candidate_url",
    "canonical_url",
    "title",
    "publisher_or_institution",
    "author_or_authoring_body",
    "publication_or_update_date",
    "access_date",
    "source_type",
    "credibility_tier",
    "relevance_note",
    "source_authority_note",
    "link_health_status",
    "http_status_or_manual_reachability_note",
    "spam_or_parked_domain_check_status",
    "recency_context_note",
    "independence_diversity_note",
    "approval_status",
    "rejection_reason",
    "reviewer_note"
  ],
  allowed_link_health_statuses: [
    "not_checked_in_ag06j",
    "manual_check_pending",
    "reachable",
    "redirects_but_acceptable",
    "blocked_or_unavailable",
    "broken",
    "parked_or_spam",
    "requires_replacement"
  ],
  allowed_approval_statuses: [
    "planned_not_populated",
    "candidate_pending_future_discovery",
    "under_review",
    "approved_for_content_packet",
    "approved_for_public_insertion_in_later_stage",
    "rejected",
    "replacement_required"
  ],
  source_quality_scoring: {
    scale_min: 0,
    scale_max: 100,
    publish_ready_minimum: 85,
    weights: sourceScoringWeights
  },
  article_level_reference_rules: {
    minimum_verified_references: ag06e.summary.verified_reference_min,
    maximum_verified_references: ag06e.summary.verified_reference_max,
    candidate_pool_should_exceed_final_references: true,
    approved_and_rejected_trail_required: true,
    source_diversity_required: true,
    primary_or_high_authority_source_preferred: true,
    no_random_links_allowed: true,
    no_broken_links_allowed: true,
    no_spam_or_parked_domains_allowed: true,
    no_unverified_public_insertion_allowed: true
  },
  publish_readiness_gates: [
    "candidate_reference_pool_planned",
    "minimum_approved_reference_count_met",
    "source_type_recorded_for_each_reference",
    "credibility_tier_recorded_for_each_reference",
    "claim_or_section_supported_recorded",
    "link_health_review_pending_or_passed",
    "approved_and_rejected_source_trail_recorded",
    "source_quality_score_planned",
    "no_web_fetching_by_script_in_ag06j",
    "no_reference_insertion_in_ag06j",
    "no_public_article_mutation_in_ag06j"
  ],
  explicit_exclusions: [
    "AG06J does not fetch URLs.",
    "AG06J does not test live links.",
    "AG06J does not populate candidate reference URLs.",
    "AG06J does not approve actual URLs.",
    "AG06J does not insert or change references in article HTML.",
    "AG06J does not mutate public articles.",
    "AG06J does not generate content packets.",
    "AG06J does not copy, move, delete or import scaffold outputs.",
    "AG06J does not publish content.",
    "AG06J does not activate backend, Auth, Supabase, API, subscriber, login or signup functionality."
  ],
  next_stage: {
    module_id: "AG06K",
    title: "JSONL-first Content Intelligence Store Governance",
    allowed_scope: "storage governance/schema only",
    blocked_scope: "content generation, public mutation, backend activation, Supabase activation"
  },
  ...falseGuards
};

const schema = {
  schema_id: "drishvara/ag06j/reference-source-credibility.schema.json",
  module_id: "AG06J",
  title: "Reference and Source Credibility Schema",
  status: "schema_only",
  description: "Schema for future candidate references, approved references, rejected references, source credibility, link-health and reference review trail. This schema does not authorize URL fetching, URL population, public insertion or article mutation.",
  required_top_level_fields: [
    "article_or_packet_id",
    "candidate_reference_pool",
    "approved_references",
    "rejected_references",
    "source_quality_review",
    "link_health_review",
    "reference_publish_readiness_gates"
  ],
  field_contract: {
    article_or_packet_id: "Stable future content packet or article identifier.",
    candidate_reference_pool: "Future candidate reference records; AG06J does not populate actual URLs.",
    approved_references: "Future approved reference records after review.",
    rejected_references: "Future rejected reference records with reasons.",
    source_quality_review: "Future quality review record; AG06J defines the scoring method only.",
    link_health_review: "Future link health review record; AG06J performs no live fetch.",
    reference_publish_readiness_gates: "Gate checklist inherited from AG06J standard."
  },
  source_type_taxonomy: sourceTypeTaxonomy.map((x) => x.source_type),
  credibility_tiers: credibilityTiers.map((x) => x.tier),
  reference_lifecycle_statuses: referenceLifecycleStatuses,
  rejection_reasons: rejectionReasons,
  per_reference_candidate_required_fields: standard.per_reference_candidate_required_fields,
  allowed_link_health_statuses: standard.allowed_link_health_statuses,
  allowed_approval_statuses: standard.allowed_approval_statuses,
  source_quality_scoring: standard.source_quality_scoring,
  article_level_reference_rules: standard.article_level_reference_rules,
  publish_readiness_gates: standard.publish_readiness_gates,
  url_fetching_allowed_in_ag06j: false,
  reference_url_population_allowed_in_ag06j: false,
  public_reference_insertion_allowed_in_ag06j: false,
  public_mutation_allowed_in_ag06j: false,
  ...falseGuards
};

const closure = {
  module_id: "AG06J",
  title: "Reference and Source Credibility Schema Closure",
  status: "schema_closure_only",
  governance_only: true,
  depends_on: ["AG06H-R1", "AG06E", "AG06I", "AG06B"],
  generated_from: inputs,
  optional_evidence: optionalEvidence,
  summary: standard.summary,
  alignment_with_ag06h_r1: {
    immediate_next_stage_from_ag06h_r1: ag06hR1.summary.immediate_next_stage,
    corrected_remaining_path_contains_ag06j: Array.isArray(ag06hR1.corrected_remaining_path)
      ? ag06hR1.corrected_remaining_path.some((x) => x.next_stage === "AG06J")
      : false,
    ag07_blocked_until_ag06z: ag06hR1.summary.ag07_blocked_until_ag06z
  },
  alignment_with_ag06e: {
    verified_reference_min: ag06e.summary.verified_reference_min,
    verified_reference_max: ag06e.summary.verified_reference_max,
    publish_readiness_gate_count_from_ag06e: ag06e.publish_readiness_gates.length
  },
  alignment_with_ag06i: {
    ag06i_next_stage_id: ag06i.summary.next_stage_id,
    visual_source_or_data_basis_gate_present: ag06iVisualStandard.publish_readiness_gates.includes("visual_source_or_data_basis_recorded")
  },
  standard_file: "data/content-intelligence/reference-registry/reference-source-credibility-standard.json",
  schema_file: "data/content-intelligence/schema/reference-source-credibility.schema.json",
  closure_decision: {
    decision: "reference_source_credibility_schema_closed_for_foundation",
    proceed_to_ag06k_jsonl_first_content_intelligence_store_governance: true,
    web_fetching_by_script_allowed: false,
    reference_url_population_allowed: false,
    reference_insertion_allowed: false,
    public_article_mutation_allowed: false,
    content_packet_generation_allowed: false,
    publication_allowed: false
  },
  ...falseGuards
};

const registry = {
  module_id: "AG06J",
  title: "Reference and Source Credibility Schema Closure",
  governance_only: true,
  schema_closure_only: true,
  depends_on: ["AG06H-R1", "AG06E", "AG06I", "AG06B"],
  generated_artifacts: {
    closure_review: "data/content-intelligence/quality-reviews/reference-source-credibility-schema-closure.json",
    reference_standard: "data/content-intelligence/reference-registry/reference-source-credibility-standard.json",
    schema: "data/content-intelligence/schema/reference-source-credibility.schema.json",
    preview: "data/quality/ag06j-reference-source-credibility-schema-closure-preview.json",
    document: "docs/quality/AG06J_REFERENCE_SOURCE_CREDIBILITY_SCHEMA_CLOSURE.md"
  },
  summary: standard.summary,
  next_recommended_stage: standard.next_stage,
  ...falseGuards
};

const preview = {
  module_id: "AG06J",
  preview_only: true,
  summary: standard.summary,
  source_type_preview: sourceTypeTaxonomy.map((x) => ({
    source_type: x.source_type,
    credibility_default: x.credibility_default
  })),
  credibility_tier_preview: credibilityTiers.map((x) => ({
    tier: x.tier,
    approval_allowed: x.approval_allowed
  })),
  publish_readiness_gates_preview: standard.publish_readiness_gates,
  no_mutation_summary: {
    web_fetching_by_script_performed: false,
    reference_url_population_performed: false,
    reference_insertion_performed: false,
    public_article_mutation_performed: false,
    css_mutation_performed: false,
    javascript_mutation_performed: false,
    scaffold_import_performed: false,
    content_packet_generation_performed: false,
    public_publishing_performed: false,
    backend_activation_performed: false,
    supabase_enabled: false,
    auth_enabled: false
  },
  next_stage_id: "AG06K"
};

const doc = `# AG06J — Reference and Source Credibility Schema Closure

## Purpose

AG06J closes the dedicated reference and source credibility schema for future Drishvara long-form Featured Reads.

This stage defines how future content packets must record candidate sources, approved references, rejected references, source credibility, link health, review trail and publish-readiness gates.

AG06J does not fetch URLs, populate candidate URLs, approve actual URLs, insert references, mutate public article HTML, generate content packets, import scaffold outputs, publish content, or activate backend/Auth/Supabase/API functionality.

## Inputs

AG06J consumes:

- AG06H-R1 Content Intelligence Foundation Alignment Review.
- AG06E Long-Form Article Standard.
- AG06I Visual/Data/Infographic Requirement Schema Closure.
- AG06B Content Packet Schema.

## Reference Standard

Every future long-form Drishvara Featured Read must plan:

- a candidate reference pool;
- approved reference records;
- rejected reference records with reason;
- source type classification;
- credibility tier classification;
- link-health review status;
- source quality review;
- claim or section supported by each reference;
- final publish-readiness gates.

The long-form standard remains 2-5 verified references per article.

## Source Type Taxonomy

AG06J defines source families including:

- official government or public institution;
- peer-reviewed or academic source;
- recognized institutional report;
- credible data/statistics source;
- reputable news or wire source;
- primary document or original material;
- domain expert or explainer;
- classical or traditional text reference;
- brand or commercial source;
- user-generated or social media source;
- weak or disallowed source.

## Credibility Tiers

AG06J defines these tiers:

- preferred;
- accepted;
- conditional;
- restricted;
- rejected.

Restricted and rejected sources cannot be treated as approved public references unless a later review stage explicitly records a limited exception.

## Link Health and Rejection Rules

Future references must record reachability, relevance, credibility, link health, spam/parked-domain checks and rejection reasons.

Rejected source reasons include broken links, parked domains, weak credibility, irrelevance, outdatedness, duplicate-of-stronger-source, missing author/publisher and better primary source availability.

## Source Quality Scoring

AG06J defines future source quality scoring but does not perform scoring.

The publish-ready threshold is 85/100.

Scoring weights:

- Relevance to claim or article: 20
- Source authority and institutional credibility: 20
- Reachability and link health: 15
- Factual specificity and traceability: 15
- Independence and source diversity: 10
- Recency or timelessness fit: 10
- Reader accessibility and non-spam safety: 5
- Citation completeness metadata: 5

## Publish-Readiness Gates

AG06J records gates for future reference readiness:

- candidate reference pool planned;
- minimum approved reference count met;
- source type recorded for each reference;
- credibility tier recorded for each reference;
- claim or section supported recorded;
- link-health review pending or passed;
- approved and rejected source trail recorded;
- source quality score planned;
- no web fetching by script in AG06J;
- no reference insertion in AG06J;
- no public article mutation in AG06J.

## Explicit Exclusions

AG06J does not:

- fetch URLs;
- test live links;
- populate candidate reference URLs;
- approve actual URLs;
- insert, populate or change reference URLs in public articles;
- mutate current public article HTML;
- modify CSS or JavaScript;
- copy, move, delete, import or publish scaffold files;
- generate article rewrites;
- generate upgraded content packets;
- assign final quality or visitor-value scores;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup or public dynamic output;
- mark any existing public article as final Drishvara-quality content.

## Acceptance Criteria

AG06J is acceptable only if:

- AG06H-R1, AG06E, AG06I and AG06B inputs are present;
- 2-5 verified reference rule is carried forward;
- candidate, approved and rejected reference structures are defined;
- source type taxonomy is recorded;
- credibility tiers are recorded;
- lifecycle statuses are recorded;
- rejection reasons are recorded;
- link-health statuses are recorded;
- source quality scoring weights total 100;
- publish-readiness gates are recorded;
- package scripts for generate:ag06j and validate:ag06j are present;
- validate:project includes validate:ag06j;
- no web fetch, reference URL population, reference insertion, public article mutation, CSS/JS mutation, scaffold import, content generation, backend/Auth/Supabase activation or publishing is performed.

## Next Stage

The next stage is AG06K — JSONL-first Content Intelligence Store Governance.
`;

writeJson(standardPath, standard);
writeJson(schemaPath, schema);
writeJson(closurePath, closure);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG06J reference/source credibility schema closure artifacts generated.");
