import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredInputs = {
  ag06e: "data/content-intelligence/quality-reviews/long-form-article-standard.json",
  ag06f: "data/content-intelligence/publish-queue/long-form-upgrade-queue.json",
  ag06g: "data/content-intelligence/quality-reviews/long-form-content-packet-upgrade-dry-run-review.json",
  ag06h: "data/content-intelligence/quality-reviews/batch-01-content-packet-upgrade-planning.json",
  ag06bSchema: "data/content-intelligence/schema/content-packet.schema.json"
};

const registryPath = path.join(root, "data", "quality", "ag06h-r1-content-intelligence-foundation-alignment-review.json");
const previewPath = path.join(root, "data", "quality", "ag06h-r1-content-intelligence-foundation-alignment-review-preview.json");
const reviewPath = path.join(root, "data", "content-intelligence", "quality-reviews", "content-intelligence-foundation-alignment-review.json");
const roadmapPath = path.join(root, "data", "content-intelligence", "publish-queue", "content-intelligence-foundation-remaining-roadmap.json");
const docPath = path.join(root, "docs", "quality", "AG06H_R1_CONTENT_INTELLIGENCE_FOUNDATION_ALIGNMENT_REVIEW.md");

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readJson(relativePath) {
  const full = path.join(root, relativePath);
  return JSON.parse(fs.readFileSync(full, "utf8"));
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
  infographic_generation_performed: false,
  quality_scoring_performed: false,
  visitor_value_scoring_performed: false
};

for (const [name, relativePath] of Object.entries(requiredInputs)) {
  if (!exists(relativePath)) {
    throw new Error(`Missing required AG06H-R1 input ${name}: ${relativePath}`);
  }
}

const ag06e = readJson(requiredInputs.ag06e);
const ag06f = readJson(requiredInputs.ag06f);
const ag06g = readJson(requiredInputs.ag06g);
const ag06h = readJson(requiredInputs.ag06h);
const contentPacketSchema = readJson(requiredInputs.ag06bSchema);

const handbookFoundationSequence = [
  {
    handbook_stage: "AG06E",
    handbook_intent: "Define Long-Form Article Standard",
    current_coverage_stage: "AG06E",
    coverage_status: "covered",
    evidence: "Long-form standard, word-count band, reference range, visual/data requirements, quality scoring, visitor-value scoring and publish-readiness gates are defined."
  },
  {
    handbook_stage: "AG06F",
    handbook_intent: "Define Visual / Infographic / Data-Box Schema",
    current_coverage_stage: "AG06E + AG06H",
    coverage_status: "partly_covered_requires_closure",
    evidence: "Visual plan, primary visual, image credit and data enrichment are required, but a dedicated visual/data/infographic schema closure is still needed."
  },
  {
    handbook_stage: "AG06G",
    handbook_intent: "Define Reference and Source Credibility Schema",
    current_coverage_stage: "AG06E + AG06F + AG06H",
    coverage_status: "partly_covered_requires_closure",
    evidence: "Reference count, verification gates and reference-governance requirements are represented, but a dedicated credibility/source registry closure is still needed."
  },
  {
    handbook_stage: "AG06H",
    handbook_intent: "Define JSONL-first Content Intelligence Store",
    current_coverage_stage: "AG06B + AG06H",
    coverage_status: "partly_covered_requires_closure",
    evidence: "Content-intelligence folders and JSON planning records exist, but JSONL-first operational store governance is not yet closed."
  },
  {
    handbook_stage: "AG06I",
    handbook_intent: "Define Publish Queue and Approval Register",
    current_coverage_stage: "AG06F + AG06G + AG06H",
    coverage_status: "partly_covered_requires_closure",
    evidence: "Upgrade queue, dry-run batch and planning queue exist, but a full approval-state register is not yet closed."
  },
  {
    handbook_stage: "AG06Z",
    handbook_intent: "Close Content Intelligence Foundation",
    current_coverage_stage: "not_started",
    coverage_status: "pending",
    evidence: "Foundation closure must wait until visual/data schema, reference/source credibility schema, JSONL-store governance and approval-state register are closed."
  }
];

const correctedRemainingPath = [
  {
    next_stage: "AG06I",
    title: "Visual / Data / Infographic Requirement Schema Closure",
    purpose: "Create the dedicated schema and governance closure for visual intelligence requirements across future long-form Featured Reads.",
    allowed_scope: "schema/document/registry/preview/validator only",
    blocked_scope: "visual generation, article mutation, CSS/JS mutation, publishing"
  },
  {
    next_stage: "AG06J",
    title: "Reference and Source Credibility Schema Closure",
    purpose: "Define candidate-source, approved-source, rejected-source, verification-status and link-health governance before source discovery or insertion.",
    allowed_scope: "schema/document/registry/preview/validator only",
    blocked_scope: "web fetching by script, reference insertion, article mutation, public publishing"
  },
  {
    next_stage: "AG06K",
    title: "JSONL-first Content Intelligence Store Governance",
    purpose: "Define durable JSONL-first storage conventions for content packets, source candidates, visual plans, quality reviews and learning snapshots.",
    allowed_scope: "storage governance/schema only",
    blocked_scope: "content generation, public mutation, backend activation, Supabase activation"
  },
  {
    next_stage: "AG06L",
    title: "Publish Queue and Approval State Register",
    purpose: "Define draft, review, approved, publish-ready, published and rejected states before any production article upgrade.",
    allowed_scope: "queue/approval schema and governance only",
    blocked_scope: "publishing, article mutation, reference insertion, backend activation"
  },
  {
    next_stage: "AG06Z",
    title: "Content Intelligence Foundation Closure",
    purpose: "Close AG06 foundation after AG06I-AG06L are validated.",
    allowed_scope: "closure audit only",
    blocked_scope: "public mutation, publishing, backend/Auth/Supabase activation"
  },
  {
    next_stage: "AG07+",
    title: "Long-Form Article Generator / Visual Agent / Quality Scorer / Semi-Auto Queue",
    purpose: "Begin production-tooling work only after AG06Z closure and explicit user approval.",
    allowed_scope: "future stage after foundation closure",
    blocked_scope: "automatic public publishing until separately approved"
  }
];

const summary = {
  current_head_expected_after_ag06h: "bc85419",
  current_completed_stage: "AG06H",
  alignment_review_only: true,
  handbook_foundation_items: handbookFoundationSequence.length,
  covered_count: handbookFoundationSequence.filter((x) => x.coverage_status === "covered").length,
  partly_covered_requires_closure_count: handbookFoundationSequence.filter((x) => x.coverage_status === "partly_covered_requires_closure").length,
  pending_count: handbookFoundationSequence.filter((x) => x.coverage_status === "pending").length,
  corrected_remaining_stage_count: correctedRemainingPath.length,
  immediate_next_stage: "AG06I",
  immediate_next_stage_title: "Visual / Data / Infographic Requirement Schema Closure",
  ag07_blocked_until_ag06z: true,
  article_mutation_allowed: false,
  content_packet_generation_allowed: false,
  public_publishing_allowed: false,
  backend_auth_supabase_allowed: false
};

const review = {
  module_id: "AG06H-R1",
  title: "Content Intelligence Foundation Alignment Review",
  status: "alignment_review_only",
  purpose: "Reconcile the transition handbook's intended AG06E-AG06Z foundation sequence with the completed AG06E-AG06H repo chain, preserving all completed work while correcting the remaining path before any reference discovery, content packet generation, article rewrite or public mutation.",
  depends_on: ["AG06E", "AG06F", "AG06G", "AG06H"],
  inputs: requiredInputs,
  evidence_snapshot: {
    ag06e_summary: ag06e.summary,
    ag06f_summary: ag06f.summary,
    ag06g_summary: ag06g.summary,
    ag06h_summary: ag06h.summary,
    content_packet_schema_structure: {
      schema_id: contentPacketSchema.schema_id,
      schema_version: contentPacketSchema.schema_version,
      has_required_sections: Array.isArray(contentPacketSchema.required_sections),
      required_section_count: Array.isArray(contentPacketSchema.required_sections) ? contentPacketSchema.required_sections.length : 0,
      has_fields_object: contentPacketSchema.fields && typeof contentPacketSchema.fields === "object"
    }
  },
  handbook_foundation_alignment: handbookFoundationSequence,
  corrected_remaining_path: correctedRemainingPath,
  decision: {
    decision_id: "ag06h_r1_alignment_decision",
    decision: "pause_reference_discovery_until_foundation_alignment_is_closed",
    proceed_to_ag06i_visual_data_infographic_schema_closure: true,
    do_not_proceed_to_reference_discovery_yet: true,
    ag07_production_generation_blocked_until_ag06z: true,
    preserve_completed_ag06e_to_ag06h_commits: true
  },
  summary,
  ...falseGuards
};

const roadmap = {
  module_id: "AG06H-R1",
  title: "Content Intelligence Foundation Remaining Roadmap",
  status: "roadmap_only",
  summary,
  corrected_remaining_path: correctedRemainingPath,
  stage_gate_rules: [
    "AG06I through AG06L must remain governance/schema/registry-only unless separately approved.",
    "AG06Z must close the foundation before AG07 production-tooling work begins.",
    "No article rewrite generation may begin before AG07 and explicit approval.",
    "No public article mutation may occur before a later approved public upgrade patch.",
    "No reference URL insertion or change may occur until reference/source credibility schema is closed and a later approved insertion patch exists.",
    "No scaffold copy, move, delete or import may occur without explicit approval.",
    "No backend, Auth, Supabase, subscriber or dynamic public output activation may occur in AG06."
  ],
  ...falseGuards
};

const registry = {
  module_id: "AG06H-R1",
  title: "Content Intelligence Foundation Alignment Review",
  governance_only: true,
  alignment_review_only: true,
  depends_on: ["AG06E", "AG06F", "AG06G", "AG06H"],
  generated_artifacts: {
    alignment_review: "data/content-intelligence/quality-reviews/content-intelligence-foundation-alignment-review.json",
    remaining_roadmap: "data/content-intelligence/publish-queue/content-intelligence-foundation-remaining-roadmap.json",
    preview: "data/quality/ag06h-r1-content-intelligence-foundation-alignment-review-preview.json",
    document: "docs/quality/AG06H_R1_CONTENT_INTELLIGENCE_FOUNDATION_ALIGNMENT_REVIEW.md"
  },
  summary,
  next_recommended_stage: correctedRemainingPath[0],
  ...falseGuards
};

const preview = {
  module_id: "AG06H-R1",
  preview_only: true,
  summary,
  alignment_preview: handbookFoundationSequence.map((row) => ({
    handbook_stage: row.handbook_stage,
    handbook_intent: row.handbook_intent,
    current_coverage_stage: row.current_coverage_stage,
    coverage_status: row.coverage_status
  })),
  corrected_remaining_path_preview: correctedRemainingPath.map((row) => ({
    next_stage: row.next_stage,
    title: row.title,
    allowed_scope: row.allowed_scope,
    blocked_scope: row.blocked_scope
  })),
  no_mutation_summary: {
    public_article_mutation_performed: false,
    reference_url_change_performed: false,
    reference_insertion_performed: false,
    scaffold_import_performed: false,
    content_packet_generation_performed: false,
    article_rewrite_performed: false,
    public_publishing_performed: false,
    backend_activation_performed: false,
    supabase_enabled: false,
    auth_enabled: false
  },
  next_stage_id: "AG06I"
};

const doc = `# AG06H-R1 — Content Intelligence Foundation Alignment Review

## Purpose

AG06H-R1 reconciles the transition handbook's intended AG06E-AG06Z foundation sequence with the completed AG06E-AG06H repository chain.

The objective is not to undo completed work. The objective is to preserve the completed AG06E, AG06F, AG06G and AG06H commits while correcting the remaining path before any reference discovery, content-packet generation, article rewrite, scaffold import, public mutation or publishing.

## Inputs

AG06H-R1 consumes:

- AG06E long-form article standard.
- AG06F long-form production queue.
- AG06G Batch 01 dry-run review.
- AG06H Batch 01 content-packet upgrade planning.
- AG06B content-packet schema structure.

## Alignment Finding

The transition handbook intended AG06E-AG06Z to complete the content-intelligence foundation before AG07 production automation.

The completed AG06E-AG06H chain already covers part of that foundation, but the naming moved ahead operationally. Therefore AG06H-R1 records the following alignment:

- AG06E Long-Form Article Standard is covered.
- Visual / Infographic / Data-Box Schema is partly covered but still needs closure.
- Reference and Source Credibility Schema is partly covered but still needs closure.
- JSONL-first Content Intelligence Store is partly covered but still needs closure.
- Publish Queue and Approval Register is partly covered but still needs closure.
- AG06Z Content Intelligence Foundation Closure is still pending.

## Corrected Remaining Path

The corrected remaining path is:

1. AG06I — Visual / Data / Infographic Requirement Schema Closure.
2. AG06J — Reference and Source Credibility Schema Closure.
3. AG06K — JSONL-first Content Intelligence Store Governance.
4. AG06L — Publish Queue and Approval State Register.
5. AG06Z — Content Intelligence Foundation Closure.
6. AG07+ — Long-form article generator, visual agent, quality scorer and semi-auto queue, only after AG06Z and explicit approval.

## Decision

AG06H-R1 pauses direct reference discovery. The next stage should be AG06I, not source/reference discovery.

AG06I must remain schema/document/registry/preview/validator only. It must not generate visuals, mutate articles, change CSS/JS, insert references, publish, or activate backend/Auth/Supabase.

## Explicit Exclusions

AG06H-R1 does not:

- mutate current public article HTML;
- populate, alter, or insert reference URLs;
- copy, move, delete, import, or publish scaffold files;
- generate article rewrites;
- generate upgraded content packets;
- generate visual assets or infographics;
- assign final quality or visitor-value scores;
- modify CSS or JavaScript;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup, or public dynamic output;
- mark any existing public article as final Drishvara-quality content.

## Acceptance Criteria

AG06H-R1 is acceptable only if:

- AG06E, AG06F, AG06G and AG06H inputs are present;
- the transition-handbook foundation sequence is represented;
- coverage is classified as covered, partly covered requiring closure, or pending;
- the corrected AG06I-AG06Z remaining path is recorded;
- AG07 remains blocked until AG06Z closure and explicit approval;
- validate:project includes validate:ag06h-r1;
- no public article/reference/scaffold/CSS/JS/backend/Auth/Supabase/publishing mutation is performed.

## Next Stage

The next stage is AG06I — Visual / Data / Infographic Requirement Schema Closure.
`;

writeJson(reviewPath, review);
writeJson(roadmapPath, roadmap);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG06H-R1 content intelligence foundation alignment review artifacts generated.");
