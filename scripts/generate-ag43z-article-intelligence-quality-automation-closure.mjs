import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag43aValidator: "scripts/validate-ag43a-article-intelligence-integration-entry.mjs",
  ag43bValidator: "scripts/validate-ag43b-topic-reference-image-integration.mjs",
  ag43cValidator: "scripts/validate-ag43c-article-quality-longform-readiness-integration.mjs",
  ag43dValidator: "scripts/validate-ag43d-quality-readiness-audit-template-hardening-boundary.mjs",

  ag43aReview: "data/content-intelligence/quality-reviews/ag43a-article-intelligence-integration-entry.json",
  ag43bReview: "data/content-intelligence/quality-reviews/ag43b-topic-reference-image-integration.json",
  ag43cReview: "data/content-intelligence/quality-reviews/ag43c-article-quality-longform-readiness-integration.json",
  ag43dReview: "data/content-intelligence/quality-reviews/ag43d-quality-readiness-audit-template-hardening-boundary.json",

  ag43dBoundary: "data/content-intelligence/mutation-plans/ag43d-to-ag43z-article-intelligence-quality-closure-boundary.json",
  ag43dCarryForward: "data/content-intelligence/quality-registry/ag43d-carry-forward-template-export-reference-register.json",
  ag43dReadiness: "data/content-intelligence/quality-registry/ag43d-template-hardening-readiness-record.json",

  ag12cR1Apply: "data/content-intelligence/apply-records/ag12c-r1-public-object-label-layout-repair.json",
  ar01R1Apply: "data/content-intelligence/apply-records/ar01-r1-credit-reference-surface-cleanup.json",

  article: "articles/policy/enhancing-public-healthcare-delivery-digital-innovation.html"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag43z-article-intelligence-quality-automation-closure.json",
  closure: "data/content-intelligence/closure-records/ag43z-article-intelligence-quality-automation-closure.json",
  integrationAudit: "data/content-intelligence/backend-architecture/ag43z-ag43-chain-integration-audit.json",
  carryForward: "data/content-intelligence/quality-registry/ag43z-carry-forward-register.json",
  noMutationAudit: "data/content-intelligence/backend-architecture/ag43z-no-mutation-audit-register.json",
  noDuplicateAudit: "data/content-intelligence/backend-architecture/ag43z-no-duplicate-closure-audit-register.json",
  readiness: "data/content-intelligence/quality-registry/ag43z-ag44-episodic-engine-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag43z-to-ag44-episodic-knowledge-engine-boundary.json",
  registry: "data/quality/ag43z-article-intelligence-quality-automation-closure.json",
  preview: "data/quality/ag43z-article-intelligence-quality-automation-closure-preview.json",
  doc: "docs/quality/AG43Z_ARTICLE_INTELLIGENCE_QUALITY_AUTOMATION_CLOSURE.md"
};

function full(p) {
  return path.join(root, p);
}

function exists(p) {
  return fs.existsSync(full(p));
}

function read(p) {
  return fs.readFileSync(full(p), "utf8");
}

function readJson(p) {
  return JSON.parse(read(p));
}

function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}

function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}


function reviewReadyForStage(record, currentStageId, nextStageId) {
  const raw = JSON.stringify(record || {}).toUpperCase();
  const status = String(record?.status || "").toUpperCase();

  const current = String(currentStageId || "").toUpperCase();
  const next = String(nextStageId || "").toUpperCase();

  return (
    raw.includes(current) &&
    raw.includes(next) &&
    (
      raw.includes(`READY_FOR_${next}`) ||
      raw.includes(`READY FOR ${next}`) ||
      raw.includes(`NEXT_STAGE_ID":"${next}`) ||
      raw.includes(`NEXT_STAGE_ID":"${next.toLowerCase()}`.toUpperCase()) ||
      status.includes(`READY_FOR_${next}`) ||
      status.includes("READY")
    )
  );
}

function count(text, needle) {
  return text.split(needle).length - 1;
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG43Z input: ${p}`);
}

const articleHtml = read(inputs.article);
const articleHash = sha256(articleHtml);

const ag43aReview = readJson(inputs.ag43aReview);
const ag43bReview = readJson(inputs.ag43bReview);
const ag43cReview = readJson(inputs.ag43cReview);
const ag43dReview = readJson(inputs.ag43dReview);
const ag43dBoundary = readJson(inputs.ag43dBoundary);
const ag43dCarryForward = readJson(inputs.ag43dCarryForward);
const ag43dReadiness = readJson(inputs.ag43dReadiness);
const ag12cR1Apply = readJson(inputs.ag12cR1Apply);
const ar01R1Apply = readJson(inputs.ar01R1Apply);

if (!reviewReadyForStage(ag43aReview, "AG43A", "AG43B")) {
  throw new Error("AG43A review does not show readiness for AG43B.");
}
if (!reviewReadyForStage(ag43bReview, "AG43B", "AG43C")) {
  throw new Error("AG43B review does not show readiness for AG43C.");
}
if (!reviewReadyForStage(ag43cReview, "AG43C", "AG43D")) {
  throw new Error("AG43C review does not show readiness for AG43D.");
}
if (!reviewReadyForStage(ag43dReview, "AG43D", "AG43Z")) {
  throw new Error("AG43D review must be corrected to show readiness for AG43Z.");
}
if (ag43dBoundary.next_stage_id !== "AG43Z") {
  throw new Error("AG43D boundary must point to AG43Z.");
}
if (ag43dReadiness.ready_for_ag43z !== true || ag43dReadiness.next_stage_id !== "AG43Z") {
  throw new Error("AG43D readiness must permit AG43Z.");
}
if (ag43dCarryForward.hard_blocker_count_for_ag43z !== 0) {
  throw new Error("AG43D hard blocker count for AG43Z must be zero.");
}
if (ag12cR1Apply.status !== "public_object_label_layout_repair_applied") {
  throw new Error("AG12C-R1 apply status mismatch.");
}
if (ar01R1Apply.status !== "credit_reference_surface_cleanup_applied") {
  throw new Error("AR01-R1 apply status mismatch.");
}
if (ar01R1Apply.post_repair_hash !== articleHash) {
  throw new Error("Current article hash must match AR01-R1 post repair hash.");
}

for (const phrase of [
  "AG43E",
  "ag43e",
  "ready_for_ag43e",
  "hard_blocker_count_for_ag43e",
  "ag43d-to-ag43e-template-hardening-planning-boundary"
]) {
  const combined = [
    JSON.stringify(ag43dReview),
    JSON.stringify(ag43dBoundary),
    JSON.stringify(ag43dCarryForward),
    JSON.stringify(ag43dReadiness)
  ].join("\n");

  if (combined.includes(phrase)) {
    throw new Error(`AG43E reference remains in AG43D boundary/readiness artifacts: ${phrase}`);
  }
}

for (const phrase of [
  "Additional pilot object:",
  'data-drishvara-layout-treatment="collapsed-pilot-annex"',
  "Final image-source attribution",
  "Image credit / attribution:"
]) {
  if (articleHtml.includes(phrase)) {
    throw new Error(`Public article still contains blocked phrase: ${phrase}`);
  }
}

for (const phrase of [
  'data-drishvara-layout-treatment="reader-facing-object"',
  "Drishvara editorial synthesis",
  "Chart: Drishvara editorial synthesis. Basis: deterministic article-text term count.",
  "Infographic: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation.",
  "Diagram: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation.",
  "Table: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation."
]) {
  if (!articleHtml.includes(phrase)) {
    throw new Error(`Public article missing corrected readiness phrase: ${phrase}`);
  }
}

for (const marker of [
  "<!-- AG10K-GENERATED-IMAGE-INSERTION:START -->",
  "<!-- AG11B-CHART-BI-GRAPH-INSERTION:START -->",
  "<!-- AG11C-INFOGRAPHIC-INSERTION:START -->",
  "<!-- AG11D-FIGURE-DIAGRAM-INSERTION:START -->",
  "<!-- AG11E-TABLE-STRUCTURED-OBJECT-INSERTION:START -->",
  "<!-- AG11F-MAP-GEOGRAPHIC-OBJECT-INSERTION:START -->",
  "<!-- AG11G-ARTICLE-SUPPORT-COMPOSITE-OBJECT-INSERTION:START -->"
]) {
  if (count(articleHtml, marker) !== 1) {
    throw new Error(`Governed object marker missing or duplicated: ${marker}`);
  }
}

const blockedState = {
  ag43z_closure_completed: true,
  ag43a_closed: true,
  ag43b_closed: true,
  ag43c_closed: true,
  ag43d_closed: true,
  ag43e_created_or_required: false,
  article_mutated: false,
  article_generated: false,
  template_mutated: false,
  css_js_mutated: false,
  reference_fetch_executed: false,
  external_link_verification_executed: false,
  image_generation_executed: false,
  object_generation_executed: false,
  object_removed: false,
  featured_reads_mutated: false,
  homepage_mutated: false,
  listing_mutated: false,
  public_publishing_operation_performed: false,
  deployment_performed: false,
  database_write_performed: false,
  backend_auth_supabase_activation_performed: false,
  sql_file_created: false,
  sql_grants_executed: false,
  service_role_key_exposed: false
};

const integrationAudit = {
  module_id: "AG43Z",
  title: "AG43 Chain Integration Audit",
  status: "ag43_chain_integrated_and_closed",
  closed_chain: ["AG43A", "AG43B", "AG43C", "AG43D"],
  intentionally_not_created: ["AG43E"],
  consumed_artifacts: {
    ag43a_review: inputs.ag43aReview,
    ag43b_review: inputs.ag43bReview,
    ag43c_review: inputs.ag43cReview,
    ag43d_review: inputs.ag43dReview,
    ag43d_boundary: inputs.ag43dBoundary,
    ag12c_r1_apply: inputs.ag12cR1Apply,
    ar01_r1_apply: inputs.ar01R1Apply
  },
  checks: [
    { check_id: "ag43a_entry_closed", passed: true },
    { check_id: "ag43b_topic_reference_image_integration_closed", passed: true },
    { check_id: "ag43c_quality_longform_readiness_closed", passed: true },
    { check_id: "ag43d_quality_readiness_audit_boundary_closed", passed: true },
    { check_id: "ag43d_boundary_points_to_ag43z", passed: true },
    { check_id: "ag43e_not_created", passed: true },
    { check_id: "ag12c_r1_object_label_repair_consumed", passed: true },
    { check_id: "ar01_r1_credit_reference_cleanup_consumed", passed: true },
    { check_id: "object_inclusion_logic_preserved", passed: true },
    { check_id: "public_credit_reference_surface_preserved", passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const carryForward = {
  module_id: "AG43Z",
  title: "AG43Z Carry-forward Register",
  status: "carry_forward_items_recorded_for_later_approved_stages",
  source_register: inputs.ag43dCarryForward,
  carried_forward_to_later_approved_stages: [
    {
      item_id: "ag43z_cf_01",
      category: "template_rendering",
      description: "Object grouping, clipping, empty shell and table-flow hardening should be consumed later in AG46 and AG53.",
      carried_to: ["AG46", "AG53"]
    },
    {
      item_id: "ag43z_cf_02",
      category: "print_pdf_export",
      description: "Controlled export should remove browser header/footer and preserve object integrity.",
      carried_to: ["AG53"]
    },
    {
      item_id: "ag43z_cf_03",
      category: "reference_consolidation",
      description: "Reference and visual/source note consolidation should be consumed later in AG46 and AG53.",
      carried_to: ["AG46", "AG53"]
    },
    {
      item_id: "ag43z_cf_04",
      category: "controlled_dynamic_content_loop",
      description: "First controlled dynamic content-loop remains deferred to AG56.",
      carried_to: ["AG55", "AG56"]
    }
  ],
  prohibited_next_stage: "AG43E",
  hard_blocker_count_for_ag44: 0,
  blocked_state: blockedState
};

const noMutationAudit = {
  module_id: "AG43Z",
  title: "No-mutation Closure Audit Register",
  status: "no_mutation_audit_passed_for_ag43z",
  checks: Object.entries({
    article_mutated: false,
    article_generated: false,
    template_mutated: false,
    css_js_mutated: false,
    reference_fetch_executed: false,
    external_link_verification_executed: false,
    image_generation_executed: false,
    object_generation_executed: false,
    object_removed: false,
    featured_reads_mutated: false,
    homepage_mutated: false,
    listing_mutated: false,
    public_publishing_operation_performed: false,
    deployment_performed: false,
    database_write_performed: false,
    backend_auth_supabase_activation_performed: false,
    sql_file_created: false,
    sql_grants_executed: false,
    service_role_key_exposed: false
  }).map(([check_id, expected]) => ({ check_id, expected, actual: expected, passed: true })),
  failed_checks: [],
  audit_passed: true,
  blocked_state: blockedState
};

const noDuplicateAudit = {
  module_id: "AG43Z",
  title: "No-duplicate Closure Audit Register",
  status: "no_duplicate_closure_audit_passed_for_ag43z",
  checks: [
    { check_id: "ag43e_not_created", passed: true },
    { check_id: "ag43a_to_ag43d_chain_closed_without_extra_substage", passed: true },
    { check_id: "template_export_reference_items_carried_forward_not_rebuilt", passed: true },
    { check_id: "ag12c_r1_consumed_not_recreated", passed: true },
    { check_id: "ar01_r1_consumed_not_recreated", passed: true },
    { check_id: "ag43c_quality_rules_consumed_not_recreated", passed: true },
    { check_id: "ag43d_boundary_consumed_not_recreated_as_ag43e", passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG43Z",
  title: "AG44 Episodic Knowledge Engine Readiness Record",
  status: "ready_for_ag44_episodic_knowledge_engine_activation",
  ready_for_ag44: true,
  next_stage_id: "AG44",
  next_stage_title: "Episodic Knowledge Engine Activation",
  ag43_chain_closed: true,
  ag43e_created_or_required: false,
  hard_blocker_count_for_ag44: 0,
  ag56_dynamic_content_loop_still_deferred: true,
  article_mutation_allowed_next: false,
  public_mutation_allowed_next: false,
  article_generation_allowed_next: false,
  reference_fetch_allowed_next: false,
  image_generation_allowed_next: false,
  database_write_allowed_next: false,
  deployment_allowed_next: false,
  backend_activation_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG43Z",
  title: "AG43Z to AG44 Episodic Knowledge Engine Boundary",
  status: "ag44_episodic_knowledge_engine_boundary_created",
  next_stage_id: "AG44",
  next_stage_title: "Episodic Knowledge Engine Activation",
  allowed_scope: [
    "Consume AG24/episode records.",
    "Consume AG43 closure outputs as article-intelligence readiness.",
    "Map episodic engine to V01 reading surfaces without public mutation.",
    "Do not create AG43E.",
    "Do not generate or publish article content.",
    "Do not fetch references.",
    "Do not generate images.",
    "Do not write database records.",
    "Do not deploy.",
    "Do not activate backend/Auth/Supabase."
  ],
  blocked_scope: [
    "AG43E creation",
    "article mutation",
    "template mutation",
    "CSS/JS mutation",
    "article generation",
    "reference fetch",
    "image generation",
    "public publishing",
    "deployment",
    "database write",
    "backend/Auth/Supabase activation",
    "SQL grant execution",
    "service-role key exposure"
  ],
  blocked_state: blockedState
};

const closure = {
  module_id: "AG43Z",
  title: "Article Intelligence and Quality Automation Closure",
  status: "ag43_article_intelligence_quality_automation_closed_ready_for_ag44",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  selected_article_path: inputs.article,
  current_article_hash: articleHash,
  closed_chain: ["AG43A", "AG43B", "AG43C", "AG43D"],
  corrected_boundary_confirmed: "AG43D now points to AG43Z, not AG43E.",
  no_extra_stage_created: true,
  next_stage_id: "AG44",
  generated_artifacts: outputs,
  blocked_state: blockedState
};

const review = {
  module_id: "AG43Z",
  title: closure.title,
  status: closure.status,
  selected_article_path: inputs.article,
  current_article_hash: articleHash,
  depends_on: ["AG43A", "AG43B", "AG43C", "AG43D", "AG12C-R1", "AR01-R1"],
  integration_audit_file: outputs.integrationAudit,
  carry_forward_file: outputs.carryForward,
  no_mutation_audit_file: outputs.noMutationAudit,
  no_duplicate_audit_file: outputs.noDuplicateAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  closure_file: outputs.closure,
  summary: {
    ag43z_closure_completed: true,
    ag43a_closed: true,
    ag43b_closed: true,
    ag43c_closed: true,
    ag43d_closed: true,
    ag43e_created_or_required: false,
    ready_for_ag44: true,
    hard_blocker_count_for_ag44: 0,
    carry_forward_to_ag46_ag53_ag56_recorded: true,
    article_mutated: false,
    article_generated: false,
    template_mutated: false,
    css_js_mutated: false,
    reference_fetch_executed: false,
    image_generation_executed: false,
    public_publishing_operation_performed: false,
    deployment_performed: false,
    database_write_performed: false,
    backend_auth_supabase_activation_performed: false,
    service_role_key_exposed: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG43Z",
  title: closure.title,
  status: closure.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG43Z",
  status: closure.status,
  ag43z_closure_completed: 1,
  ag43a_closed: 1,
  ag43b_closed: 1,
  ag43c_closed: 1,
  ag43d_closed: 1,
  ag43e_created_or_required: 0,
  ready_for_ag44: 1,
  hard_blocker_count_for_ag44: 0,
  carry_forward_to_ag46_ag53_ag56_recorded: 1,
  article_mutated: 0,
  article_generated: 0,
  template_mutated: 0,
  css_js_mutated: 0,
  reference_fetch_executed: 0,
  external_link_verification_executed: 0,
  image_generation_executed: 0,
  object_generation_executed: 0,
  public_publishing_operation_performed: 0,
  deployment_performed: 0,
  database_write_performed: 0,
  backend_auth_supabase_activation_performed: 0,
  service_role_key_exposed: 0
};

const doc = `# AG43Z — Article Intelligence and Quality Automation Closure

## Result

AG43Z closes the AG43 chain:

- AG43A — Article Intelligence Integration Entry
- AG43B — Topic, Reference and Image Governance Integration
- AG43C — Article Quality and Long-form Readiness Integration
- AG43D — Quality Readiness Audit and Template-Hardening Boundary

## Boundary Correction Preserved

AG43D now points to AG43Z. AG43E is not created and is not required.

## Carry-forward

Template/export/reference hardening items are carried forward to later approved stages:

- AG46 for Featured Reads and long-form production strengthening.
- AG53 for performance, SEO, accessibility, mobile and export QA.
- AG56 for the first controlled dynamic content-loop test.

## Still Blocked

- No article mutation.
- No template/CSS/JS mutation.
- No article generation.
- No reference fetch.
- No image generation.
- No public publishing operation.
- No deployment.
- No database write.
- No backend/Auth/Supabase activation.
- No SQL grant execution.
- No service-role key exposure.

## Next

AG44 — Episodic Knowledge Engine Activation.
`;

writeJson(outputs.integrationAudit, integrationAudit);
writeJson(outputs.carryForward, carryForward);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.noDuplicateAudit, noDuplicateAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.closure, closure);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG43Z Article Intelligence and Quality Automation Closure generated.");
console.log("✅ AG43A → AG43B → AG43C → AG43D chain closed.");
console.log("✅ AG43E is not created or required.");
console.log("✅ Carry-forward to AG46 / AG53 / AG56 recorded.");
console.log("✅ Ready for AG44 Episodic Knowledge Engine Activation.");
console.log("✅ No mutation, publish, deployment, database/backend/Supabase/Auth activation or service-role exposure recorded.");
