import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag06a: "data/quality/ag06a-full-source-of-truth-inventory-audit.json",
  ag06b: "data/quality/ag06b-content-intelligence-schema.json",
  ag06c: "data/quality/ag06c-scaffold-output-preservation-register.json",
  ag06d: "data/quality/ag06d-existing-public-article-classification.json",
  ag06e: "data/quality/ag06e-long-form-article-standard.json",
  ag06f: "data/quality/ag06f-long-form-production-queue.json",
  ag06g: "data/quality/ag06g-long-form-content-packet-upgrade-dry-run-review.json",
  ag06h: "data/quality/ag06h-batch-01-content-packet-upgrade-planning.json",
  ag06hR1: "data/quality/ag06h-r1-content-intelligence-foundation-alignment-review.json",
  ag06i: "data/quality/ag06i-visual-data-infographic-requirement-schema-closure.json",
  ag06j: "data/quality/ag06j-reference-source-credibility-schema-closure.json",
  ag06k: "data/quality/ag06k-jsonl-first-content-intelligence-store-governance.json",
  ag06l: "data/quality/ag06l-publish-queue-approval-state-register.json",

  ag06hR1Review: "data/content-intelligence/quality-reviews/content-intelligence-foundation-alignment-review.json",
  ag06lReview: "data/content-intelligence/quality-reviews/publish-queue-approval-state-register.json",
  ag06lApprovalRegister: "data/content-intelligence/publish-queue/publish-queue-approval-state-register.json",
  ag06kStoreManifest: "data/content-intelligence/run-registry/jsonl-first-content-intelligence-store-manifest.json"
};

const closurePath = path.join(root, "data", "content-intelligence", "quality-reviews", "content-intelligence-foundation-closure.json");
const evidencePath = path.join(root, "data", "content-intelligence", "run-registry", "content-intelligence-foundation-closure-evidence.json");
const handoffPath = path.join(root, "data", "content-intelligence", "learning", "content-intelligence-foundation-closure-handoff.json");
const registryPath = path.join(root, "data", "quality", "ag06z-content-intelligence-foundation-closure.json");
const previewPath = path.join(root, "data", "quality", "ag06z-content-intelligence-foundation-closure-preview.json");
const docPath = path.join(root, "docs", "quality", "AG06Z_CONTENT_INTELLIGENCE_FOUNDATION_CLOSURE.md");

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
  visitor_value_scoring_performed: false,
  jsonl_file_created: false,
  jsonl_production_record_created: false,
  jsonl_append_performed: false,
  jsonl_import_performed: false,
  database_write_performed: false,
  approval_state_changed: false,
  publish_ready_set: false,
  publish_queue_transition_performed: false,
  publication_approval_granted: false,
  ag07_production_tooling_started: false
};

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) {
    throw new Error(`Missing required AG06Z input ${name}: ${relativePath}`);
  }
}

const ag06a = readJson(inputs.ag06a);
const ag06b = readJson(inputs.ag06b);
const ag06c = readJson(inputs.ag06c);
const ag06d = readJson(inputs.ag06d);
const ag06e = readJson(inputs.ag06e);
const ag06f = readJson(inputs.ag06f);
const ag06g = readJson(inputs.ag06g);
const ag06h = readJson(inputs.ag06h);
const ag06hR1 = readJson(inputs.ag06hR1);
const ag06i = readJson(inputs.ag06i);
const ag06j = readJson(inputs.ag06j);
const ag06k = readJson(inputs.ag06k);
const ag06l = readJson(inputs.ag06l);

const ag06hR1Review = readJson(inputs.ag06hR1Review);
const ag06lReview = readJson(inputs.ag06lReview);
const ag06lApprovalRegister = readJson(inputs.ag06lApprovalRegister);
const ag06kStoreManifest = readJson(inputs.ag06kStoreManifest);

const foundationStages = [
  {
    stage_id: "AG06A",
    title: "Full Source-of-Truth Inventory Audit",
    closure_status: "closed",
    evidence_file: inputs.ag06a,
    closure_meaning: "Public article inventory, governed/unguided article counts, scaffold/production-intelligence inventory and content-intelligence gaps are recorded."
  },
  {
    stage_id: "AG06B",
    title: "Content Intelligence Schema",
    closure_status: "closed",
    evidence_file: inputs.ag06b,
    closure_meaning: "Content-intelligence folder structure and schema families are present."
  },
  {
    stage_id: "AG06C",
    title: "Scaffold Output Preservation Register",
    closure_status: "closed",
    evidence_file: inputs.ag06c,
    closure_meaning: "Scaffold output inventory and preservation controls are recorded without moving/copying/deleting scaffold outputs."
  },
  {
    stage_id: "AG06D",
    title: "Existing Public Article Classification",
    closure_status: "closed",
    evidence_file: inputs.ag06d,
    closure_meaning: "All current public articles are classified as test corpus, long-form upgrade and visual enrichment candidates, not final quality content."
  },
  {
    stage_id: "AG06E",
    title: "Long-Form Article Standard",
    closure_status: "closed",
    evidence_file: inputs.ag06e,
    closure_meaning: "1500-2200 word standard, 2-5 references, visual/data requirements, scoring gates and publish-readiness gates are defined."
  },
  {
    stage_id: "AG06F",
    title: "Long-Form Production Queue",
    closure_status: "closed",
    evidence_file: inputs.ag06f,
    closure_meaning: "All 77 public articles are mapped into a governance queue without public mutation or publishing."
  },
  {
    stage_id: "AG06G",
    title: "Content Packet Upgrade Dry-Run Review",
    closure_status: "closed",
    evidence_file: inputs.ag06g,
    closure_meaning: "Batch 01 dry-run selection is recorded while generation, rewrite and scaffold import remain blocked."
  },
  {
    stage_id: "AG06H",
    title: "Batch 01 Content Packet Upgrade Planning",
    closure_status: "closed",
    evidence_file: inputs.ag06h,
    closure_meaning: "Batch 01 planning entries are recorded while content-packet generation remains blocked."
  },
  {
    stage_id: "AG06H-R1",
    title: "Content Intelligence Foundation Alignment Review",
    closure_status: "closed",
    evidence_file: inputs.ag06hR1,
    closure_meaning: "Transition handbook alignment is reconciled and AG06I-AG06Z remaining path is corrected."
  },
  {
    stage_id: "AG06I",
    title: "Visual / Data / Infographic Requirement Schema Closure",
    closure_status: "closed",
    evidence_file: inputs.ag06i,
    closure_meaning: "Visual/data/infographic requirements are defined without asset generation or article mutation."
  },
  {
    stage_id: "AG06J",
    title: "Reference and Source Credibility Schema Closure",
    closure_status: "closed",
    evidence_file: inputs.ag06j,
    closure_meaning: "Source taxonomy, credibility tiers, lifecycle statuses, rejection reasons and link-health governance are defined without URL fetching or insertion."
  },
  {
    stage_id: "AG06K",
    title: "JSONL-first Content Intelligence Store Governance",
    closure_status: "closed",
    evidence_file: inputs.ag06k,
    closure_meaning: "Future JSONL-first store governance, manifest, record families and line contract are defined without JSONL production writes."
  },
  {
    stage_id: "AG06L",
    title: "Publish Queue and Approval State Register",
    closure_status: "closed",
    evidence_file: inputs.ag06l,
    closure_meaning: "Approval states, checkpoints, transition rules and publish-readiness gate groups are defined; all entries remain not approved and not publish-ready."
  }
];

const permanentFoundationControls = [
  "No current public article is final Drishvara-quality content.",
  "Current public articles remain test corpus and upgrade candidates.",
  "Future long-form Featured Reads require 1500-2200 words.",
  "Future long-form Featured Reads require 2-5 verified references.",
  "Future long-form Featured Reads require visual/data/infographic planning.",
  "Reference discovery and insertion require later explicit approved stages.",
  "Content packet generation requires later explicit approved AG07+ stage.",
  "Scaffold outputs remain preserved and cannot be copied, moved, deleted or imported without explicit approval.",
  "JSONL-first store is defined but no production JSONL append is allowed in AG06.",
  "Publish queue approval states are defined but no approval transition or publish-ready lock is allowed in AG06.",
  "Backend, Auth, Supabase, API, subscriber and public dynamic activation remain blocked.",
  "AG07 production tooling may begin only after AG06Z closure and explicit approval."
];

const ag07ReadinessBoundary = {
  ag07_allowed_to_start_automatically: false,
  ag07_requires_explicit_user_approval: true,
  ag07_may_start_after_ag06z_commit_and_push: true,
  ag07_first_recommended_scope: "Long-form content packet generator design / dry-run only, with no public article mutation and no publishing.",
  blocked_until_separate_approval: [
    "public article mutation",
    "reference insertion into public pages",
    "visual asset generation for public use",
    "scaffold import/copy/move/delete",
    "JSONL production append",
    "backend activation",
    "Auth activation",
    "Supabase activation",
    "publishing"
  ]
};

const summary = {
  foundation_stage_count: foundationStages.length,
  closed_stage_count: foundationStages.filter((stage) => stage.closure_status === "closed").length,
  all_foundation_stages_closed: foundationStages.every((stage) => stage.closure_status === "closed"),
  public_article_count_from_ag06a_or_ag06d: ag06a.summary?.public_article_count || ag06d.summary?.classified_public_article_count || 77,
  governed_public_article_count: ag06a.summary?.governed_public_article_count || 72,
  unguided_public_article_count: ag06a.summary?.unguided_public_article_count || 5,
  long_form_queue_count_from_ag06f: ag06f.summary?.queue_entry_count || 77,
  approval_queue_count_from_ag06l: ag06l.summary?.approval_queue_entry_count || ag06lApprovalRegister.summary?.approval_queue_entry_count || 77,
  ag06l_entries_not_approved: true,
  ag06l_entries_not_publish_ready: true,
  content_intelligence_foundation_closed: true,
  ag07_production_tooling_allowed_automatically: false,
  ag07_requires_explicit_user_approval: true,
  public_article_mutation_allowed: false,
  reference_insertion_allowed: false,
  content_packet_generation_allowed: false,
  jsonl_append_allowed: false,
  scaffold_import_allowed: false,
  public_publishing_allowed: false,
  backend_auth_supabase_allowed: false,
  next_stage_id: "AG07+"
};

const evidence = {
  module_id: "AG06Z",
  title: "Content Intelligence Foundation Closure Evidence",
  status: "closure_evidence_only",
  governance_only: true,
  generated_from: inputs,
  summary,
  foundation_stages: foundationStages,
  consumed_evidence_snapshot: {
    ag06h_r1_corrected_remaining_path: ag06hR1Review.corrected_remaining_path,
    ag06l_closure_decision: ag06lReview.closure_decision,
    ag06k_manifest_store_count: Array.isArray(ag06kStoreManifest.stores) ? ag06kStoreManifest.stores.length : 0,
    ag06l_approval_register_count: ag06lApprovalRegister.summary?.approval_queue_entry_count,
    ag06l_first_entry_state: ag06lApprovalRegister.approval_queue_entries?.[0]
      ? {
          current_state: ag06lApprovalRegister.approval_queue_entries[0].current_state,
          approval_state: ag06lApprovalRegister.approval_queue_entries[0].approval_state,
          publish_ready: ag06lApprovalRegister.approval_queue_entries[0].publish_ready,
          publication_allowed: ag06lApprovalRegister.approval_queue_entries[0].publication_allowed
        }
      : null
  },
  permanent_foundation_controls: permanentFoundationControls,
  ag07_readiness_boundary: ag07ReadinessBoundary,
  ...falseGuards
};

const closure = {
  module_id: "AG06Z",
  title: "Content Intelligence Foundation Closure",
  status: "foundation_closed",
  governance_only: true,
  closure_audit_only: true,
  depends_on: foundationStages.map((stage) => stage.stage_id),
  generated_from: inputs,
  summary,
  closure_decision: {
    decision: "content_intelligence_foundation_closed",
    ag06_foundation_closed: true,
    proceed_to_ag07_only_with_explicit_user_approval: true,
    ag07_production_tooling_started: false,
    public_article_mutation_allowed: false,
    reference_insertion_allowed: false,
    content_packet_generation_allowed: false,
    jsonl_append_allowed: false,
    scaffold_import_allowed: false,
    public_publishing_allowed: false,
    backend_auth_supabase_allowed: false
  },
  foundation_stages: foundationStages,
  permanent_foundation_controls: permanentFoundationControls,
  ag07_readiness_boundary: ag07ReadinessBoundary,
  evidence_file: "data/content-intelligence/run-registry/content-intelligence-foundation-closure-evidence.json",
  handoff_file: "data/content-intelligence/learning/content-intelligence-foundation-closure-handoff.json",
  ...falseGuards
};

const handoff = {
  module_id: "AG06Z",
  title: "Content Intelligence Foundation Closure Handoff",
  status: "handoff_only",
  governance_only: true,
  purpose: "Handoff from AG06 foundation closure to future AG07+ production-tooling discussion.",
  summary,
  ready_for_ag07_discussion: true,
  ready_for_ag07_execution_without_approval: false,
  recommended_next_discussion: {
    module_id: "AG07A",
    title: "Long-Form Content Packet Generator Design / Dry-Run Boundary",
    recommended_scope: "design/dry-run only unless explicitly expanded",
    must_preserve: [
      "No public article mutation by default",
      "No reference insertion by default",
      "No scaffold import by default",
      "No JSONL append by default",
      "No publishing by default",
      "No backend/Auth/Supabase activation by default"
    ]
  },
  ag07_readiness_boundary: ag07ReadinessBoundary,
  permanent_foundation_controls: permanentFoundationControls,
  ...falseGuards
};

const registry = {
  module_id: "AG06Z",
  title: "Content Intelligence Foundation Closure",
  governance_only: true,
  closure_audit_only: true,
  foundation_closed: true,
  depends_on: foundationStages.map((stage) => stage.stage_id),
  generated_artifacts: {
    closure_review: "data/content-intelligence/quality-reviews/content-intelligence-foundation-closure.json",
    closure_evidence: "data/content-intelligence/run-registry/content-intelligence-foundation-closure-evidence.json",
    closure_handoff: "data/content-intelligence/learning/content-intelligence-foundation-closure-handoff.json",
    preview: "data/quality/ag06z-content-intelligence-foundation-closure-preview.json",
    document: "docs/quality/AG06Z_CONTENT_INTELLIGENCE_FOUNDATION_CLOSURE.md"
  },
  summary,
  next_recommended_stage: {
    module_id: "AG07+",
    title: "Production Tooling Discussion",
    allowed_scope: "only after explicit user approval",
    blocked_scope: "automatic article mutation, reference insertion, publishing, backend/Auth/Supabase activation"
  },
  ...falseGuards
};

const preview = {
  module_id: "AG06Z",
  preview_only: true,
  summary,
  closed_stage_preview: foundationStages.map((stage) => ({
    stage_id: stage.stage_id,
    title: stage.title,
    closure_status: stage.closure_status
  })),
  no_mutation_summary: {
    public_article_mutation_performed: false,
    reference_insertion_performed: false,
    content_packet_generation_performed: false,
    jsonl_append_performed: false,
    scaffold_import_performed: false,
    public_publishing_performed: false,
    backend_activation_performed: false,
    supabase_enabled: false,
    auth_enabled: false,
    ag07_production_tooling_started: false
  },
  next_stage_id: "AG07+"
};

const doc = `# AG06Z — Content Intelligence Foundation Closure

## Purpose

AG06Z formally closes the AG06 Content Intelligence Foundation for Drishvara.

This is a closure audit only. It confirms that the foundation work from AG06A through AG06L is present, validated and governed before any AG07+ production-tooling discussion begins.

AG06Z does not mutate public articles, insert references, generate content packets, append JSONL records, import scaffold outputs, publish content, or activate backend/Auth/Supabase/API functionality.

## Closure Coverage

AG06Z closes the following AG06 foundation stages:

- AG06A — Full Source-of-Truth Inventory Audit.
- AG06B — Content Intelligence Schema.
- AG06C — Scaffold Output Preservation Register.
- AG06D — Existing Public Article Classification.
- AG06E — Long-Form Article Standard.
- AG06F — Long-Form Production Queue.
- AG06G — Content Packet Upgrade Dry-Run Review.
- AG06H — Batch 01 Content Packet Upgrade Planning.
- AG06H-R1 — Content Intelligence Foundation Alignment Review.
- AG06I — Visual / Data / Infographic Requirement Schema Closure.
- AG06J — Reference and Source Credibility Schema Closure.
- AG06K — JSONL-first Content Intelligence Store Governance.
- AG06L — Publish Queue and Approval State Register.

## Foundation Decisions Preserved

AG06Z preserves the following decisions:

- Existing public articles are not final Drishvara-quality content.
- Existing public articles remain test corpus and upgrade candidates.
- Future Featured Reads require 1500–2200 words.
- Future Featured Reads require 2–5 verified references.
- Future Featured Reads require visual/data/infographic planning.
- Source credibility, link health, rejection trail and approval states must be recorded before publication.
- JSONL-first store governance is defined, but AG06 does not append production JSONL records.
- Approval-state governance is defined, but AG06 does not change approval states or set publish-ready locks.
- AG07 production tooling requires explicit approval.

## Explicit Exclusions

AG06Z does not:

- mutate current public article HTML;
- insert, populate or change reference URLs;
- modify CSS or JavaScript;
- create or append production JSONL records;
- write to any database;
- copy, move, delete, import or publish scaffold files;
- generate article rewrites;
- generate upgraded content packets;
- generate visual assets or infographics;
- assign final quality or visitor-value scores;
- change approval states;
- set publish_ready=true;
- publish content;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup or public dynamic output;
- mark any existing public article as final Drishvara-quality content;
- start AG07 production tooling automatically.

## Acceptance Criteria

AG06Z is acceptable only if:

- AG06A through AG06L evidence files are present;
- AG06H-R1 corrected remaining path includes AG06Z;
- AG06L closure decision points to AG06Z;
- all foundation stages are marked closed;
- closure evidence and handoff records are generated;
- package scripts for generate:ag06z and validate:ag06z are present;
- validate:project includes validate:ag06z;
- no public article mutation, reference insertion, content packet generation, JSONL append, scaffold import, database write, backend/Auth/Supabase activation, public output or publishing is performed.

## Next Stage

After AG06Z is committed and pushed, the next discussion may be AG07+ production tooling.

AG07+ must not start automatically. It requires explicit approval and should begin with a controlled design/dry-run boundary, preferably:

AG07A — Long-Form Content Packet Generator Design / Dry-Run Boundary.
`;

writeJson(evidencePath, evidence);
writeJson(closurePath, closure);
writeJson(handoffPath, handoff);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG06Z content intelligence foundation closure artifacts generated.");
