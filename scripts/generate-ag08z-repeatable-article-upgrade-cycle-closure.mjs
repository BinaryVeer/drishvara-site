import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag08aReview: "data/content-intelligence/quality-reviews/ag08a-repeatable-article-upgrade-cycle-planning.json",
  ag08bSelection: "data/content-intelligence/selection-registry/ag08b-selected-pipeline-test-article.json",
  ag08gApply: "data/content-intelligence/apply-records/ag08g-one-article-controlled-apply.json",
  ag08hAudit: "data/content-intelligence/audit-records/ag08h-post-apply-audit-report.json",
  ag08iReview: "data/content-intelligence/quality-reviews/ag08i-visual-generation-image-insertion-plan.json",
  ag08jReview: "data/content-intelligence/quality-reviews/ag08j-visual-candidate-generation-asset-selection.json",
  ag08kaReview: "data/content-intelligence/quality-reviews/ag08ka-visual-asset-creation-source-finalisation.json",
  ag08kApply: "data/content-intelligence/apply-records/ag08k-controlled-visual-image-insertion-apply.json",
  ag08lAudit: "data/content-intelligence/audit-records/ag08l-post-visual-insertion-audit-report.json",
  ag08lRollback: "data/content-intelligence/quality-registry/ag08l-rollback-readiness-record.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag08z-repeatable-article-upgrade-cycle-closure.json");
const closurePath = path.join(root, "data/content-intelligence/closure-records/ag08z-repeatable-article-upgrade-cycle-closure.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag08z-final-readiness-record.json");
const recommendationsPath = path.join(root, "data/content-intelligence/quality-registry/ag08z-next-cycle-recommendations.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/repeatable-article-upgrade-cycle-closure.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag08z-repeatable-article-upgrade-cycle-closure-learning.json");
const registryPath = path.join(root, "data/quality/ag08z-repeatable-article-upgrade-cycle-closure.json");
const previewPath = path.join(root, "data/quality/ag08z-repeatable-article-upgrade-cycle-closure-preview.json");
const docPath = path.join(root, "docs/quality/AG08Z_REPEATABLE_ARTICLE_UPGRADE_CYCLE_CLOSURE.md");

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

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) {
    throw new Error(`Missing required AG08Z input ${name}: ${relativePath}`);
  }
}

const ag08aReview = readJson(inputs.ag08aReview);
const ag08bSelection = readJson(inputs.ag08bSelection);
const ag08gApply = readJson(inputs.ag08gApply);
const ag08hAudit = readJson(inputs.ag08hAudit);
const ag08iReview = readJson(inputs.ag08iReview);
const ag08jReview = readJson(inputs.ag08jReview);
const ag08kaReview = readJson(inputs.ag08kaReview);
const ag08kApply = readJson(inputs.ag08kApply);
const ag08lAudit = readJson(inputs.ag08lAudit);
const ag08lRollback = readJson(inputs.ag08lRollback);

const selectedArticlePath = ag08kApply.selected_article_path;
const ag08gBackupPath = ag08gApply.backup_path;
const ag08kBackupPath = ag08kApply.backup_path;
const assetPath = ag08kApply.asset_path;

if (!exists(selectedArticlePath)) throw new Error(`AG08Z selected article missing: ${selectedArticlePath}`);
if (!exists(ag08gBackupPath)) throw new Error(`AG08Z AG08G backup missing: ${ag08gBackupPath}`);
if (!exists(ag08kBackupPath)) throw new Error(`AG08Z AG08K backup missing: ${ag08kBackupPath}`);
if (!exists(assetPath)) throw new Error(`AG08Z visual asset missing: ${assetPath}`);

const articleHtml = fs.readFileSync(path.join(root, selectedArticlePath), "utf8");
const articleHash = sha256(articleHtml);

if (ag08lAudit.status !== "post_visual_insertion_audit_passed") {
  throw new Error("AG08Z requires AG08L audit to pass.");
}

if (ag08lRollback.status !== "rollback_ready_not_executed") {
  throw new Error("AG08Z requires AG08L rollback readiness.");
}

if (articleHash !== ag08kApply.post_insertion_hash) {
  throw new Error("AG08Z selected article hash must match AG08K post-insertion hash.");
}

const noMutationControls = {
  closure_only: true,
  selected_article_read_performed: true,
  new_article_mutation_performed_in_ag08z: false,
  selected_article_file_write_performed_in_ag08z: false,
  reference_insertion_performed_in_ag08z: false,
  reference_url_change_performed_in_ag08z: false,
  visual_generation_performed_in_ag08z: false,
  image_asset_creation_performed_in_ag08z: false,
  image_insertion_performed_in_ag08z: false,
  css_mutation_performed_in_ag08z: false,
  js_mutation_performed_in_ag08z: false,
  production_jsonl_append_performed_in_ag08z: false,
  database_write_performed_in_ag08z: false,
  supabase_write_performed_in_ag08z: false,
  backend_auth_supabase_activation_performed_in_ag08z: false,
  public_publishing_performed_in_ag08z: false,
  publishing_approval_performed_in_ag08z: false,
  rollback_execution_performed_in_ag08z: false
};

const finalEvidence = {
  selected_article_path: selectedArticlePath,
  current_article_hash: articleHash,
  ag08_selected_article_source: inputs.ag08bSelection,
  text_reference_apply: {
    stage: "AG08G",
    status: ag08gApply.status,
    backup_path: ag08gBackupPath,
    pre_apply_hash: ag08gApply.pre_apply_hash,
    post_apply_hash: ag08gApply.post_apply_hash,
    approved_references_inserted: ag08gApply.approved_references_inserted
  },
  post_text_reference_audit: {
    stage: "AG08H",
    status: ag08hAudit.status,
    rollback_ready: ag08hAudit.rollback_readiness?.rollback_ready === true
  },
  visual_planning: {
    stage: "AG08I",
    status: ag08iReview.status
  },
  visual_candidate_selection: {
    stage: "AG08J",
    status: ag08jReview.status
  },
  visual_asset_source_finalisation: {
    stage: "AG08K-A",
    status: ag08kaReview.status,
    cost_control: "internal SVG asset; no external image-generation/API call"
  },
  visual_insertion_apply: {
    stage: "AG08K",
    status: ag08kApply.status,
    backup_path: ag08kBackupPath,
    asset_path: assetPath,
    post_insertion_hash: ag08kApply.post_insertion_hash
  },
  post_visual_insertion_audit: {
    stage: "AG08L",
    status: ag08lAudit.status,
    rollback_ready: ag08lRollback.rollback_readiness?.rollback_ready === true
  }
};

const repeatableDoctrine = {
  doctrine_id: "AG08Z-REPEATABLE-DOCTRINE-001",
  status: "created",
  operating_model: "single_article_controlled_cycle",
  stage_sequence_proven: [
    "selection",
    "candidate packet",
    "readiness review",
    "draft/reference candidate",
    "approval/apply plan",
    "controlled text/reference apply",
    "post-apply audit",
    "visual plan",
    "visual candidate record",
    "visual asset/source finalisation",
    "controlled visual insertion",
    "post-visual-insertion audit",
    "cycle closure"
  ],
  core_rules: [
    "Select exactly one target article for pipeline testing unless batch mode is explicitly approved.",
    "Separate text/reference mutation from visual/image insertion.",
    "Create a backup before every mutation stage.",
    "Treat visual generation/source finalisation as separate from visual insertion.",
    "Prefer cost-controlled internal assets before external image-generation/API calls.",
    "Do not publish merely because static article files changed.",
    "Do not activate backend/Auth/Supabase/database paths during static article upgrade stages.",
    "Preserve AG03/AG05/AG08 governance markers during later-stage mutations.",
    "Make older validators forward-compatible with later controlled mutations only when supported by apply/audit records.",
    "Require explicit approval before every mutation, visual insertion, closure or publishing-related stage."
  ],
  cost_control_lessons: [
    "Use internal SVG/editorial assets where adequate.",
    "Avoid repeated GPT/image-generation calls for early pipeline testing.",
    "Generate candidate records and prompts before any expensive asset generation.",
    "Reuse approved source/credit/alt/caption records across later stages.",
    "Keep visual insertion as an audited controlled apply rather than a side-effect of draft generation."
  ],
  layout_lessons: [
    "Hero visual insertion near the article top is safest for first visual apply.",
    "Tables, graphs, figures and infographics need separate layout validation before insertion.",
    "Text must remain justified and article shape must not deform.",
    "Tables and data figures should be centrally aligned in the reading column.",
    "Text wrapping is allowed only when it preserves readability and object boundary integrity."
  ],
  rollback_lessons: [
    "Maintain separate backups for text/reference apply and visual insertion.",
    "Rollback readiness must be recorded but not executed during audit/closure stages.",
    "Every mutation stage should record pre/post hashes."
  ]
};

const finalReadinessChecks = [
  {
    check_id: "AG08Z-CHECK-001",
    name: "ag08l_audit_passed",
    status: ag08lAudit.status === "post_visual_insertion_audit_passed" ? "passed" : "failed",
    evidence: ag08lAudit.status
  },
  {
    check_id: "AG08Z-CHECK-002",
    name: "current_article_hash_matches_ag08k",
    status: articleHash === ag08kApply.post_insertion_hash ? "passed" : "failed",
    evidence: articleHash
  },
  {
    check_id: "AG08Z-CHECK-003",
    name: "rollback_ready",
    status: ag08lRollback.status === "rollback_ready_not_executed" ? "passed" : "failed",
    evidence: ag08lRollback.status
  },
  {
    check_id: "AG08Z-CHECK-004",
    name: "forbidden_system_guards_confirmed",
    status: ag08lAudit.forbidden_system_guards?.forbidden_system_guard_status === "passed" ? "passed" : "failed",
    evidence: ag08lAudit.forbidden_system_guards?.forbidden_system_guard_status
  },
  {
    check_id: "AG08Z-CHECK-005",
    name: "layout_integrity_confirmed",
    status: ag08lAudit.layout_integrity?.layout_integrity_status === "passed" ? "passed" : "failed",
    evidence: ag08lAudit.layout_integrity?.layout_integrity_status
  },
  {
    check_id: "AG08Z-CHECK-006",
    name: "governance_preservation_confirmed",
    status: ag08lAudit.governance_preservation?.governance_preservation_status === "passed" ? "passed" : "failed",
    evidence: ag08lAudit.governance_preservation?.governance_preservation_status
  }
];

const finalReadinessPassed = finalReadinessChecks.every((check) => check.status === "passed");

const readinessRecord = {
  module_id: "AG08Z",
  title: "AG08Z Final Readiness Record",
  status: finalReadinessPassed ? "repeatable_cycle_closed_one_article_text_reference_visual_audited" : "repeatable_cycle_closure_review_required",
  selected_article_path: selectedArticlePath,
  final_readiness_checks: finalReadinessChecks,
  final_readiness_passed: finalReadinessPassed,
  production_readiness: finalReadinessPassed ? "repeatable_cycle_closed_one_article_audited" : "review_required",
  publish_readiness: "static_file_changed_not_publish_approved",
  final_evidence: finalEvidence,
  ...noMutationControls
};

const nextCycleRecommendations = {
  module_id: "AG08Z",
  title: "AG08Z Next-Cycle Recommendations",
  status: "recommendations_recorded_not_started",
  recommended_next_stage: {
    stage_id: "AG09A",
    title: "Next Article Selection / Repeatable Cycle Start",
    explicit_approval_required: true
  },
  recommended_options: [
    {
      option_id: "AG08Z-NEXT-001",
      recommendation: "Select one more existing article and repeat the same pipeline with fewer exploratory patches.",
      risk: "low",
      cost: "low"
    },
    {
      option_id: "AG08Z-NEXT-002",
      recommendation: "Improve AG08 generator/validator helpers into reusable shared utilities before batch mode.",
      risk: "medium",
      cost: "low"
    },
    {
      option_id: "AG08Z-NEXT-003",
      recommendation: "Create an internal visual component bank for hero SVGs, diagrams, tables and data cards.",
      risk: "medium",
      cost: "medium"
    },
    {
      option_id: "AG08Z-NEXT-004",
      recommendation: "Defer batch article mutation until at least two single-article cycles pass end-to-end.",
      risk: "low",
      cost: "low"
    }
  ],
  not_started_in_ag08z: true,
  ...noMutationControls
};

const summary = {
  selected_article_path: selectedArticlePath,
  current_article_hash: articleHash,
  ag08_cycle_closed: finalReadinessPassed,
  text_reference_upgrade_applied_and_audited: ag08hAudit.status === "post_apply_audit_passed",
  visual_asset_created_inserted_and_audited: ag08lAudit.status === "post_visual_insertion_audit_passed",
  cost_control_recorded: true,
  layout_doctrine_validated: true,
  rollback_ready: ag08lRollback.status === "rollback_ready_not_executed",
  production_readiness_after_ag08z: readinessRecord.production_readiness,
  publish_readiness_after_ag08z: readinessRecord.publish_readiness,
  next_stage_id: "AG09A",
  next_stage_title: "Next Article Selection / Repeatable Cycle Start",
  next_stage_requires_explicit_approval: true,
  ...noMutationControls
};

const closureRecord = {
  module_id: "AG08Z",
  title: "Repeatable Article Upgrade Cycle Closure",
  status: finalReadinessPassed ? "repeatable_article_upgrade_cycle_closed" : "repeatable_article_upgrade_cycle_closure_review_required",
  selected_article_path: selectedArticlePath,
  generated_from: inputs,
  summary,
  final_evidence: finalEvidence,
  repeatable_doctrine: repeatableDoctrine,
  final_readiness_record_file: "data/content-intelligence/quality-registry/ag08z-final-readiness-record.json",
  next_cycle_recommendations_file: "data/content-intelligence/quality-registry/ag08z-next-cycle-recommendations.json",
  ...noMutationControls
};

const schema = {
  module_id: "AG08Z",
  title: "Repeatable Article Upgrade Cycle Closure Schema",
  status: "schema_closure_only",
  final_evidence_record_allowed_in_ag08z: true,
  repeatable_doctrine_record_allowed_in_ag08z: true,
  next_cycle_recommendations_allowed_in_ag08z: true,
  cost_control_learning_allowed_in_ag08z: true,
  layout_learning_allowed_in_ag08z: true,
  rollback_readiness_carry_forward_allowed_in_ag08z: true,
  article_mutation_allowed_in_ag08z: false,
  selected_article_file_write_allowed_in_ag08z: false,
  reference_insertion_allowed_in_ag08z: false,
  reference_url_change_allowed_in_ag08z: false,
  visual_generation_allowed_in_ag08z: false,
  image_asset_creation_allowed_in_ag08z: false,
  image_insertion_allowed_in_ag08z: false,
  css_js_mutation_allowed_in_ag08z: false,
  production_jsonl_append_allowed_in_ag08z: false,
  database_write_allowed_in_ag08z: false,
  supabase_write_allowed_in_ag08z: false,
  backend_auth_supabase_activation_allowed_in_ag08z: false,
  publishing_allowed_in_ag08z: false,
  rollback_execution_allowed_in_ag08z: false,
  ...noMutationControls
};

const review = {
  module_id: "AG08Z",
  title: "Repeatable Article Upgrade Cycle Closure",
  status: closureRecord.status,
  depends_on: ["AG08A", "AG08B", "AG08G", "AG08H", "AG08I", "AG08J", "AG08K-A", "AG08K", "AG08L"],
  generated_from: inputs,
  summary,
  closure_record_file: "data/content-intelligence/closure-records/ag08z-repeatable-article-upgrade-cycle-closure.json",
  final_readiness_record_file: "data/content-intelligence/quality-registry/ag08z-final-readiness-record.json",
  next_cycle_recommendations_file: "data/content-intelligence/quality-registry/ag08z-next-cycle-recommendations.json",
  schema_file: "data/content-intelligence/schema/repeatable-article-upgrade-cycle-closure.schema.json",
  learning_file: "data/content-intelligence/learning/ag08z-repeatable-article-upgrade-cycle-closure-learning.json",
  closure_decision: {
    decision: finalReadinessPassed ? "ag08_cycle_closed_pending_next_cycle_approval" : "ag08_cycle_closure_review_required",
    proceed_to_ag09a_only_with_explicit_user_approval: true,
    selected_article_path: selectedArticlePath,
    production_readiness: readinessRecord.production_readiness,
    publish_readiness: readinessRecord.publish_readiness,
    ...noMutationControls
  },
  ...noMutationControls
};

const learning = {
  module_id: "AG08Z",
  title: "Repeatable Article Upgrade Cycle Closure Learning",
  status: "learning_record_only",
  summary,
  repeatable_doctrine: repeatableDoctrine,
  learning_points: [
    "The first AG08 cycle successfully separated text/reference mutation from visual insertion.",
    "A cost-controlled internal SVG path avoided external image-generation cost while still testing visual insertion governance.",
    "Forward-compatible validators are necessary once later controlled mutation stages change the same article hash.",
    "Visual insertion requires its own backup and audit; it should not be bundled into prose/reference application.",
    "The pipeline is now suitable for another single-article cycle before any batch mutation attempt."
  ],
  ...noMutationControls
};

const registry = {
  module_id: "AG08Z",
  title: "Repeatable Article Upgrade Cycle Closure",
  status: closureRecord.status,
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag08z-repeatable-article-upgrade-cycle-closure.json",
    closure_record: "data/content-intelligence/closure-records/ag08z-repeatable-article-upgrade-cycle-closure.json",
    final_readiness: "data/content-intelligence/quality-registry/ag08z-final-readiness-record.json",
    next_cycle_recommendations: "data/content-intelligence/quality-registry/ag08z-next-cycle-recommendations.json",
    schema: "data/content-intelligence/schema/repeatable-article-upgrade-cycle-closure.schema.json",
    learning: "data/content-intelligence/learning/ag08z-repeatable-article-upgrade-cycle-closure-learning.json",
    preview: "data/quality/ag08z-repeatable-article-upgrade-cycle-closure-preview.json",
    document: "docs/quality/AG08Z_REPEATABLE_ARTICLE_UPGRADE_CYCLE_CLOSURE.md"
  },
  summary,
  ...noMutationControls
};

const preview = {
  module_id: "AG08Z",
  preview_only: true,
  status: closureRecord.status,
  summary,
  final_readiness_checks: finalReadinessChecks,
  repeatable_doctrine_summary: {
    operating_model: repeatableDoctrine.operating_model,
    stage_sequence_proven: repeatableDoctrine.stage_sequence_proven,
    cost_control_lessons: repeatableDoctrine.cost_control_lessons,
    layout_lessons: repeatableDoctrine.layout_lessons
  },
  next_cycle_recommendations: nextCycleRecommendations.recommended_options,
  ...noMutationControls
};

const doc = `# AG08Z — Repeatable Article Upgrade Cycle Closure

## Purpose

AG08Z closes the AG08 one-article upgrade cycle after text/reference application, visual insertion and post-visual audit have passed.

AG08Z is closure-only. It does not mutate the article, insert references, generate visuals, insert images, edit CSS/JS, append JSONL records, write to database/Supabase, activate backend/Auth/Supabase, publish, approve publishing or execute rollback.

## Closed Target

- Article: \`${selectedArticlePath}\`
- Current hash: \`${articleHash}\`

## Closure Result

- Status: \`${closureRecord.status}\`
- Production readiness: \`${readinessRecord.production_readiness}\`
- Publish readiness: \`${readinessRecord.publish_readiness}\`

## Evidence Carried Forward

- Text/reference apply: AG08G
- Text/reference audit: AG08H
- Visual planning: AG08I
- Visual candidate: AG08J
- Visual source finalisation: AG08K-A
- Visual insertion: AG08K
- Visual audit: AG08L

## Repeatable Doctrine

The AG08 cycle confirms that Drishvara should keep text/reference upgrade, visual planning, source finalisation, visual insertion and audit as separate governed stages.

## Cost-Control Lesson

Internal reusable assets should be preferred where adequate. External image-generation/API calls should be introduced only where the stage requires them and after candidate/approval records are complete.

## Next Stage

AG09A — Next Article Selection / Repeatable Cycle Start — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(closurePath, closureRecord);
writeJson(readinessPath, readinessRecord);
writeJson(recommendationsPath, nextCycleRecommendations);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

const articleHashAfter = sha256(fs.readFileSync(path.join(root, selectedArticlePath), "utf8"));
if (articleHashAfter !== articleHash) {
  throw new Error("AG08Z attempted to mutate the selected article. Refusing to continue.");
}

console.log("✅ AG08Z repeatable article upgrade cycle closure artifacts generated.");
console.log(`✅ Closure target: ${selectedArticlePath}`);
console.log(`✅ Closure status: ${closureRecord.status}`);
console.log("✅ No article mutation, visual generation, image insertion, JSONL/database/Supabase/backend activation or publishing performed.");
console.log("✅ AG09A handoff created with explicit approval required.");
