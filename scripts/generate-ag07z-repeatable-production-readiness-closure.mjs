import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const targetArticlePath = "articles/policy/when-implementation-tells-the-real-story.html";
const targetSlug = path.basename(targetArticlePath, ".html");
const backupRelativePath = `archive/ag07p-backups/${targetSlug}-before-ag07p.html`;

const startMarker = "<!-- AG07P-CONTROLLED-APPLY-START -->";
const endMarker = "<!-- AG07P-CONTROLLED-APPLY-END -->";

const inputs = {
  ag07qReview: "data/content-intelligence/quality-reviews/ag07q-post-mutation-audit.json",
  ag07qAuditReport: "data/content-intelligence/audit-records/ag07q-post-mutation-audit-report.json",
  ag07qRollbackReadiness: "data/content-intelligence/quality-registry/ag07q-rollback-readiness-record.json",
  ag07qSchema: "data/content-intelligence/schema/post-mutation-audit.schema.json",
  ag07qLearning: "data/content-intelligence/learning/ag07q-post-mutation-audit-learning.json",
  ag07pReview: "data/content-intelligence/quality-reviews/ag07p-one-article-controlled-apply.json",
  ag07pApplyRecord: "data/content-intelligence/apply-records/ag07p-one-article-controlled-apply.json",
  ag07oReview: "data/content-intelligence/quality-reviews/ag07o-approval-controlled-single-article-mutation-plan.json",
  ag07nCandidate: "data/content-intelligence/content-packets/ag07n-production-packet-candidate.json",
  ag06zClosure: "data/quality/ag06z-content-intelligence-foundation-closure.json",
  targetArticle: targetArticlePath,
  backupArticle: backupRelativePath
};

const reviewPath = path.join(root, "data", "content-intelligence", "quality-reviews", "ag07z-repeatable-production-readiness-closure.json");
const closureRecordPath = path.join(root, "data", "content-intelligence", "closure-registry", "ag07z-controlled-chain-closure.json");
const nextCyclePath = path.join(root, "data", "content-intelligence", "run-registry", "ag07z-next-cycle-recommendations.json");
const schemaPath = path.join(root, "data", "content-intelligence", "schema", "repeatable-production-readiness-closure.schema.json");
const learningPath = path.join(root, "data", "content-intelligence", "learning", "ag07z-repeatable-production-readiness-learning.json");
const registryPath = path.join(root, "data", "quality", "ag07z-repeatable-production-readiness-closure.json");
const previewPath = path.join(root, "data", "quality", "ag07z-repeatable-production-readiness-closure-preview.json");
const docPath = path.join(root, "docs", "quality", "AG07Z_REPEATABLE_PRODUCTION_READINESS_CLOSURE.md");

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

function countOccurrences(text, marker) {
  return text.split(marker).length - 1;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function listArticleFiles(dir) {
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

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) {
    throw new Error(`Missing required AG07Z input ${name}: ${relativePath}`);
  }
}

const ag07qReview = readJson(inputs.ag07qReview);
const ag07qAuditReport = readJson(inputs.ag07qAuditReport);
const ag07qRollbackReadiness = readJson(inputs.ag07qRollbackReadiness);
const ag07qSchema = readJson(inputs.ag07qSchema);
const ag07qLearning = readJson(inputs.ag07qLearning);
const ag07pReview = readJson(inputs.ag07pReview);
const ag07pApplyRecord = readJson(inputs.ag07pApplyRecord);
const ag07oReview = readJson(inputs.ag07oReview);
const ag07nCandidate = readJson(inputs.ag07nCandidate);
const ag06zClosure = readJson(inputs.ag06zClosure);

const targetAbs = path.join(root, targetArticlePath);
const backupAbs = path.join(root, backupRelativePath);

const targetHtmlBeforeClosure = fs.readFileSync(targetAbs, "utf8");
const backupHtmlBeforeClosure = fs.readFileSync(backupAbs, "utf8");

const targetHashBeforeClosure = sha256(targetHtmlBeforeClosure);
const backupHashBeforeClosure = sha256(backupHtmlBeforeClosure);

const targetStartMarkerCount = countOccurrences(targetHtmlBeforeClosure, startMarker);
const targetEndMarkerCount = countOccurrences(targetHtmlBeforeClosure, endMarker);
const backupStartMarkerCount = countOccurrences(backupHtmlBeforeClosure, startMarker);
const backupEndMarkerCount = countOccurrences(backupHtmlBeforeClosure, endMarker);

const articleFiles = listArticleFiles(path.join(root, "articles"));
const articleFilesWithAg07pMarker = articleFiles.filter((file) =>
  fs.readFileSync(path.join(root, file), "utf8").includes(startMarker)
);

const allClosureEvidencePassed =
  ag07qReview.status === "post_mutation_audit_passed" &&
  ag07qReview.closure_decision?.all_audit_checks_passed === true &&
  ag07qReview.closure_decision?.rollback_ready === true &&
  ag07qReview.closure_decision?.forbidden_system_guards_passed === true &&
  ag07qReview.closure_decision?.new_article_mutation_performed === false &&
  ag07qReview.closure_decision?.file_edit_performed === false &&
  ag07qReview.closure_decision?.production_jsonl_append_performed === false &&
  ag07qReview.closure_decision?.database_write_performed === false &&
  ag07qReview.closure_decision?.supabase_write_performed === false &&
  ag07qReview.closure_decision?.public_publishing_performed === false &&
  ag07qReview.closure_decision?.backend_auth_supabase_activation_performed === false &&
  targetStartMarkerCount === 1 &&
  targetEndMarkerCount === 1 &&
  backupStartMarkerCount === 0 &&
  backupEndMarkerCount === 0 &&
  articleFilesWithAg07pMarker.length === 1 &&
  articleFilesWithAg07pMarker[0] === targetArticlePath;

const closureOnlyControls = {
  closure_governance_only: true,
  ag07_chain_closure_created: true,
  final_evidence_recorded: true,
  repeatable_doctrine_created: true,
  future_safe_operating_rules_created: true,
  next_cycle_recommendations_created: true,
  closure_artifacts_created: true,
  target_article_read_performed: true,
  backup_file_read_performed: true,
  marker_scope_verified: true,
  rollback_readiness_carried_forward: true,
  forbidden_system_guard_carried_forward: true,
  post_apply_quality_carried_forward: true,
  new_article_mutation_performed: false,
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
  rollback_test_performed: false,
  reference_insertion_performed: false,
  reference_url_population_performed: false,
  approved_reference_url_population_performed: false,
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
  api_route_created: false,
  public_publishing_performed: false,
  publication_approval_granted: false,
  production_packet_created: false,
  actual_production_packet_created: false,
  production_content_generated: false,
  article_prose_generated: false,
  narrative_text_generated: false,
  dry_run_score_recalculation_performed: false,
  actual_score_calculation_performed: false,
  production_score_record_created: false,
  publish_ready_approval_performed: false,
  approval_state_changed: false,
  publish_ready_set: false,
  human_apply_approval_performed: false,
  multi_article_mutation_performed: false,
  backend_auth_supabase_activation_performed: false
};

const finalEvidence = {
  ag06z_foundation_closure_present: ag06zClosure.status === "content_intelligence_foundation_closed" || Boolean(ag06zClosure.closure_decision),
  ag07n_candidate_present: ag07nCandidate.status === "production_packet_candidate_created",
  ag07o_plan_present: ag07oReview.status === "approval_controlled_single_article_mutation_plan_created",
  ag07p_apply_present: ag07pReview.status === "one_article_controlled_apply_performed",
  ag07q_audit_passed: ag07qReview.status === "post_mutation_audit_passed",
  ag07q_all_audit_checks_passed: ag07qReview.closure_decision?.all_audit_checks_passed === true,
  target_article_path: targetArticlePath,
  backup_file_path: backupRelativePath,
  target_hash_sha256_at_closure: targetHashBeforeClosure,
  backup_hash_sha256_at_closure: backupHashBeforeClosure,
  target_start_marker_count: targetStartMarkerCount,
  target_end_marker_count: targetEndMarkerCount,
  backup_start_marker_count: backupStartMarkerCount,
  backup_end_marker_count: backupEndMarkerCount,
  article_files_with_ag07p_marker: articleFilesWithAg07pMarker,
  rollback_ready: ag07qReview.closure_decision?.rollback_ready === true,
  forbidden_system_guards_passed: ag07qReview.closure_decision?.forbidden_system_guards_passed === true,
  post_apply_quality_status: ag07qReview.summary?.post_apply_quality_status || "pass"
};

const repeatableDoctrine = [
  {
    doctrine_id: "AG07Z-DOC-001",
    rule: "Foundation before generation",
    instruction: "AG06 foundation evidence must remain closed before any future article upgrade cycle starts."
  },
  {
    doctrine_id: "AG07Z-DOC-002",
    rule: "Boundary before execution",
    instruction: "Each future cycle must define its allowed and blocked actions before tooling or mutation."
  },
  {
    doctrine_id: "AG07Z-DOC-003",
    rule: "Candidate before apply",
    instruction: "A production-packet candidate must exist before any static article apply."
  },
  {
    doctrine_id: "AG07Z-DOC-004",
    rule: "Plan before apply",
    instruction: "A controlled mutation plan, approval checklist, backup plan and rollback plan must exist before apply."
  },
  {
    doctrine_id: "AG07Z-DOC-005",
    rule: "One article at a time",
    instruction: "Future controlled applies should mutate only one explicitly approved target article per apply stage."
  },
  {
    doctrine_id: "AG07Z-DOC-006",
    rule: "Backup before mutation",
    instruction: "The target article must be backed up before any static apply."
  },
  {
    doctrine_id: "AG07Z-DOC-007",
    rule: "Audit after mutation",
    instruction: "Every apply must be followed by a post-mutation audit before closure."
  },
  {
    doctrine_id: "AG07Z-DOC-008",
    rule: "Static file change is not publishing approval",
    instruction: "A committed static file change does not activate publishing approval, backend, Auth, Supabase, API or database write."
  },
  {
    doctrine_id: "AG07Z-DOC-009",
    rule: "References and visuals require their own gates",
    instruction: "Reference URL population, insertion, visual generation and image credit population must remain controlled by their own approved stages."
  },
  {
    doctrine_id: "AG07Z-DOC-010",
    rule: "Evidence must travel forward",
    instruction: "Each stage must record review, registry, schema, learning and preview evidence for future repetition."
  }
];

const futureSafeOperatingRules = [
  {
    rule_id: "AG07Z-RULE-001",
    area: "target selection",
    allowed: "select one target article only after explicit approval",
    blocked: "multi-article apply without a separate batch approval and audit design"
  },
  {
    rule_id: "AG07Z-RULE-002",
    area: "article mutation",
    allowed: "one controlled static article mutation with backup",
    blocked: "unbounded public article mutation or silent file edits"
  },
  {
    rule_id: "AG07Z-RULE-003",
    area: "reference handling",
    allowed: "reference insertion only after candidate URLs are verified and approved",
    blocked: "invented links, broken links, parked links, spam links or unverified reference insertion"
  },
  {
    rule_id: "AG07Z-RULE-004",
    area: "visual handling",
    allowed: "visual insertion only with image credit, alt text and caption",
    blocked: "uncredited images, missing alt text, layout-breaking assets or undocumented generated visuals"
  },
  {
    rule_id: "AG07Z-RULE-005",
    area: "storage",
    allowed: "governance artifacts and approved static file commits",
    blocked: "production JSONL append, database write or Supabase write without separate activation approval"
  },
  {
    rule_id: "AG07Z-RULE-006",
    area: "runtime",
    allowed: "static repo change only",
    blocked: "backend, API, Auth, Supabase, subscriber/admin/payment activation"
  },
  {
    rule_id: "AG07Z-RULE-007",
    area: "closure",
    allowed: "evidence-based closure after audit",
    blocked: "closing an apply chain without post-mutation audit and rollback readiness"
  }
];

const nextCycleRecommendations = {
  module_id: "AG07Z",
  title: "Next-Cycle Recommendations",
  status: "recommendations_recorded",
  recommended_next_cycle: "AG08A or AG07R — Repeatable Article Upgrade Cycle Planning",
  activation_status: "not_started",
  explicit_approval_required: true,
  recommended_options: [
    {
      option_id: "NEXT-001",
      title: "Repeat AG07-style cycle for another single article",
      recommended_when: "Use when improving one more existing static article with the same controlled doctrine.",
      required_starting_boundary: "one target article path, backup plan, controlled apply plan and post-apply audit"
    },
    {
      option_id: "NEXT-002",
      title: "Create a batch-capable controlled upgrade design",
      recommended_when: "Use only after one-article repeatability is trusted and batch risk controls are defined.",
      required_starting_boundary: "batch size, per-article backups, per-article marker checks, rollback matrix and batch audit"
    },
    {
      option_id: "NEXT-003",
      title: "Reference/visual enrichment sub-cycle",
      recommended_when: "Use when the article needs verified reference insertion or visual enrichment before wider upgrade.",
      required_starting_boundary: "verified URL population, source credibility review, visual credit/alt/caption approval"
    },
    {
      option_id: "NEXT-004",
      title: "Static-live manual verification",
      recommended_when: "Use after Vercel deployment confirms the committed static change is visible.",
      required_starting_boundary: "manual browser checklist, mobile view check, reference/visual visibility check and rollback note"
    }
  ],
  not_authorized_in_ag07z: [
    "new article mutation",
    "file edit",
    "reference insertion",
    "visual generation",
    "production JSONL append",
    "database/Supabase write",
    "publishing",
    "backend/Auth/Supabase activation"
  ],
  ...closureOnlyControls
};

const summary = {
  ag07q_audit_consumed: ag07qReview.status === "post_mutation_audit_passed",
  ag07_chain_closure_performed: true,
  all_closure_evidence_passed: allClosureEvidencePassed,
  final_evidence_recorded: true,
  repeatable_doctrine_created: true,
  future_safe_operating_rules_created: true,
  next_cycle_recommendations_created: true,
  target_article_path: targetArticlePath,
  backup_file_path: backupRelativePath,
  target_start_marker_count: targetStartMarkerCount,
  target_end_marker_count: targetEndMarkerCount,
  backup_start_marker_count: backupStartMarkerCount,
  backup_end_marker_count: backupEndMarkerCount,
  article_files_with_ag07p_marker_count: articleFilesWithAg07pMarker.length,
  rollback_ready: ag07qReview.closure_decision?.rollback_ready === true,
  forbidden_system_guards_passed: ag07qReview.closure_decision?.forbidden_system_guards_passed === true,
  post_apply_quality_status: allClosureEvidencePassed ? "passed" : "review_required",
  new_article_mutation_performed: false,
  file_edit_performed: false,
  reference_insertion_performed: false,
  reference_url_population_performed: false,
  visual_generation_performed: false,
  production_jsonl_append_performed: false,
  database_write_performed: false,
  supabase_write_performed: false,
  public_publishing_performed: false,
  backend_auth_supabase_activation_performed: false,
  production_readiness_after_ag07z: allClosureEvidencePassed ? "repeatable_chain_closed_one_article_audited" : "closure_review_required",
  publish_readiness_after_ag07z: "static_file_changed_not_publish_approved",
  next_recommended_cycle: "Repeatable Article Upgrade Cycle Planning with explicit approval"
};

const closureRecord = {
  module_id: "AG07Z",
  title: "AG07 Controlled Article-Upgrade Chain Closure",
  status: allClosureEvidencePassed ? "ag07_controlled_chain_closed" : "ag07_controlled_chain_closure_review_required",
  closure_governance_only: true,
  generated_from: inputs,
  final_evidence: finalEvidence,
  repeatable_doctrine: repeatableDoctrine,
  future_safe_operating_rules: futureSafeOperatingRules,
  closure_readiness: {
    closure_ready: allClosureEvidencePassed,
    reason: allClosureEvidencePassed
      ? "AG07Q audit passed and no forbidden activation/mutation occurred in AG07Z."
      : "One or more AG07Q or marker/backup closure checks require review."
  },
  ...closureOnlyControls
};

const schema = {
  schema_id: "drishvara/ag07z/repeatable-production-readiness-closure.schema.json",
  module_id: "AG07Z",
  title: "Repeatable Production Readiness Closure Schema",
  status: "schema_closure_only",
  description: "Schema for closing the AG07 controlled article-upgrade chain and recording repeatable doctrine without new mutation or activation.",
  required_top_level_fields: [
    "closure_record",
    "next_cycle_recommendations",
    "summary",
    "closure_only_controls"
  ],
  closure_governance_allowed_in_ag07z: true,
  final_evidence_recording_allowed_in_ag07z: true,
  repeatable_doctrine_recording_allowed_in_ag07z: true,
  future_safe_operating_rules_allowed_in_ag07z: true,
  next_cycle_recommendations_allowed_in_ag07z: true,
  target_article_read_allowed_in_ag07z: true,
  backup_file_read_allowed_in_ag07z: true,
  new_article_mutation_allowed_in_ag07z: false,
  file_edit_allowed_in_ag07z: false,
  target_article_file_write_allowed_in_ag07z: false,
  reference_insertion_allowed_in_ag07z: false,
  reference_url_population_allowed_in_ag07z: false,
  visual_generation_allowed_in_ag07z: false,
  production_jsonl_append_allowed_in_ag07z: false,
  database_write_allowed_in_ag07z: false,
  supabase_write_allowed_in_ag07z: false,
  publishing_allowed_in_ag07z: false,
  backend_auth_supabase_allowed_in_ag07z: false,
  ...closureOnlyControls
};

const learning = {
  module_id: "AG07Z",
  title: "Repeatable Production Readiness Closure Learning",
  status: "learning_record_only",
  closure_governance_only: true,
  generated_from: inputs,
  summary,
  learning_points_from_ag07q: asArray(ag07qLearning.ag07q_learning_points),
  ag07z_learning_points: [
    "The AG07 chain is now repeatable because it progressed from boundary to candidate to plan to one-article apply to post-mutation audit to closure.",
    "The safest future pattern is one target article per controlled apply until batch controls are separately designed.",
    "A static article change should remain separate from publish-ready approval, production JSONL persistence, database/Supabase activation and backend activation.",
    "Each future article upgrade must preserve backup-first and audit-after doctrine.",
    "AG07Z closes the chain but does not authorize the next cycle."
  ],
  repeatable_operating_doctrine: repeatableDoctrine,
  future_safe_operating_rules: futureSafeOperatingRules,
  ...closureOnlyControls
};

const review = {
  module_id: "AG07Z",
  title: "Closure / Repeatable Production Readiness",
  status: allClosureEvidencePassed ? "ag07_repeatable_production_readiness_closed" : "ag07_repeatable_production_readiness_review_required",
  governance_only: true,
  closure_governance_only: true,
  depends_on: ["AG07Q", "AG07P", "AG07O", "AG07N", "AG06Z"],
  generated_from: inputs,
  summary,
  alignment_with_ag07q: {
    ag07q_status: ag07qReview.status,
    ag07q_decision: ag07qReview.closure_decision?.decision,
    ag07z_requires_explicit_approval: ag07qReview.closure_decision?.proceed_to_ag07z_only_with_explicit_user_approval,
    ag07q_all_audit_checks_passed: ag07qReview.closure_decision?.all_audit_checks_passed,
    ag07q_rollback_ready: ag07qReview.closure_decision?.rollback_ready,
    ag07q_forbidden_system_guards_passed: ag07qReview.closure_decision?.forbidden_system_guards_passed,
    ag07q_new_article_mutation_performed: ag07qReview.closure_decision?.new_article_mutation_performed,
    ag07q_file_edit_performed: ag07qReview.closure_decision?.file_edit_performed,
    ag07q_public_publishing_performed: ag07qReview.closure_decision?.public_publishing_performed
  },
  closure_record_file: "data/content-intelligence/closure-registry/ag07z-controlled-chain-closure.json",
  next_cycle_recommendations_file: "data/content-intelligence/run-registry/ag07z-next-cycle-recommendations.json",
  schema_file: "data/content-intelligence/schema/repeatable-production-readiness-closure.schema.json",
  learning_file: "data/content-intelligence/learning/ag07z-repeatable-production-readiness-learning.json",
  closure_decision: {
    decision: allClosureEvidencePassed ? "ag07z_controlled_chain_closed" : "ag07z_closure_review_required",
    ag07_chain_closed: allClosureEvidencePassed,
    repeatable_production_readiness_recorded: true,
    final_evidence_recorded: true,
    repeatable_doctrine_created: true,
    future_safe_operating_rules_created: true,
    next_cycle_recommendations_created: true,
    target_article_path: targetArticlePath,
    backup_file_path: backupRelativePath,
    target_start_marker_count: targetStartMarkerCount,
    target_end_marker_count: targetEndMarkerCount,
    backup_start_marker_count: backupStartMarkerCount,
    backup_end_marker_count: backupEndMarkerCount,
    article_files_with_ag07p_marker_count: articleFilesWithAg07pMarker.length,
    rollback_ready: ag07qReview.closure_decision?.rollback_ready === true,
    forbidden_system_guards_passed: ag07qReview.closure_decision?.forbidden_system_guards_passed === true,
    new_article_mutation_performed: false,
    file_edit_performed: false,
    reference_insertion_performed: false,
    reference_url_population_performed: false,
    visual_generation_performed: false,
    production_jsonl_append_performed: false,
    database_write_performed: false,
    supabase_write_performed: false,
    public_publishing_performed: false,
    backend_auth_supabase_activation_performed: false,
    production_readiness: allClosureEvidencePassed ? "repeatable_chain_closed_one_article_audited" : "closure_review_required",
    publish_readiness: "static_file_changed_not_publish_approved",
    next_cycle_requires_explicit_approval: true
  },
  ...closureOnlyControls
};

const registry = {
  module_id: "AG07Z",
  title: "Closure / Repeatable Production Readiness",
  closure_governance_only: true,
  depends_on: ["AG07Q"],
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag07z-repeatable-production-readiness-closure.json",
    closure_record: "data/content-intelligence/closure-registry/ag07z-controlled-chain-closure.json",
    next_cycle_recommendations: "data/content-intelligence/run-registry/ag07z-next-cycle-recommendations.json",
    schema: "data/content-intelligence/schema/repeatable-production-readiness-closure.schema.json",
    learning: "data/content-intelligence/learning/ag07z-repeatable-production-readiness-learning.json",
    preview: "data/quality/ag07z-repeatable-production-readiness-closure-preview.json",
    document: "docs/quality/AG07Z_REPEATABLE_PRODUCTION_READINESS_CLOSURE.md"
  },
  summary,
  next_recommended_cycle: nextCycleRecommendations.recommended_next_cycle,
  ...closureOnlyControls
};

const preview = {
  module_id: "AG07Z",
  preview_only: true,
  closure_governance_only: true,
  summary,
  closure_snapshot: {
    ag07_chain_closed: allClosureEvidencePassed,
    target_article_path: targetArticlePath,
    backup_file_path: backupRelativePath,
    article_files_with_ag07p_marker: articleFilesWithAg07pMarker,
    rollback_ready: ag07qReview.closure_decision?.rollback_ready === true,
    forbidden_system_guards_passed: ag07qReview.closure_decision?.forbidden_system_guards_passed === true,
    production_readiness_after_ag07z: summary.production_readiness_after_ag07z,
    publish_readiness_after_ag07z: summary.publish_readiness_after_ag07z
  },
  next_recommended_cycle: nextCycleRecommendations.recommended_next_cycle,
  ...closureOnlyControls
};

const doc = `# AG07Z — Closure / Repeatable Production Readiness

## Purpose

AG07Z closes the AG07 controlled article-upgrade chain and records the repeatable doctrine for future article upgrades.

This stage is closure/governance only. It does not perform any new article mutation, file edit, reference insertion, visual generation, production JSONL append, database/Supabase write, publishing, or backend/Auth/Supabase activation.

## Closed Chain

AG07Z closes the controlled chain from:

- AG07A boundary design;
- AG07B implementation plan;
- AG07C preview packet dry run;
- AG07D gap audit;
- AG07E revision plan;
- AG07F schema/contract boundary;
- AG07G reference discovery boundary;
- AG07H visual/data enrichment boundary;
- AG07I scoring boundary;
- AG07J inference store boundary;
- AG07K inference preview record;
- AG07L revised preview packet and dry-run scoring;
- AG07M improvement pass;
- AG07N production-packet candidate;
- AG07O approval and controlled mutation plan;
- AG07P one-article controlled apply;
- AG07Q post-mutation audit;
- AG07Z closure.

## Final Evidence

- Target article: \`${targetArticlePath}\`
- Backup file: \`${backupRelativePath}\`
- Target start marker count: \`${targetStartMarkerCount}\`
- Target end marker count: \`${targetEndMarkerCount}\`
- Backup start marker count: \`${backupStartMarkerCount}\`
- Backup end marker count: \`${backupEndMarkerCount}\`
- Article files with AG07P marker: \`${articleFilesWithAg07pMarker.join(", ")}\`
- Rollback ready: \`${ag07qReview.closure_decision?.rollback_ready === true}\`
- Forbidden-system guards passed: \`${ag07qReview.closure_decision?.forbidden_system_guards_passed === true}\`

## Closure Decision

AG07 chain closed: \`${allClosureEvidencePassed}\`

Production readiness after AG07Z: \`${summary.production_readiness_after_ag07z}\`

Publish readiness after AG07Z: \`${summary.publish_readiness_after_ag07z}\`

## Repeatable Doctrine

Future article upgrade cycles should follow:

1. Foundation closure before generation.
2. Boundary before execution.
3. Candidate before apply.
4. Plan before apply.
5. One article at a time unless batch controls are separately approved.
6. Backup before mutation.
7. Audit after mutation.
8. Static file change is not publishing approval.
9. References and visuals require their own gates.
10. Evidence must travel forward.

## Explicit Exclusions

AG07Z does not:

- mutate any article;
- edit files;
- write article HTML;
- create backup files;
- execute rollback;
- insert references;
- populate reference URLs;
- generate visuals;
- insert images;
- append production JSONL records;
- write to database or Supabase;
- approve publish-readiness;
- publish content;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup or public dynamic output.

## Next-Cycle Recommendation

AG07Z recommends a future repeatable article-upgrade planning cycle only with explicit approval.

No next cycle is started in AG07Z.
`;

writeJson(reviewPath, review);
writeJson(closureRecordPath, closureRecord);
writeJson(nextCyclePath, nextCycleRecommendations);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

const targetHtmlAfterClosure = fs.readFileSync(targetAbs, "utf8");
const backupHtmlAfterClosure = fs.readFileSync(backupAbs, "utf8");

if (sha256(targetHtmlAfterClosure) !== targetHashBeforeClosure) {
  throw new Error("AG07Z attempted to change the target article. Refusing to continue.");
}

if (sha256(backupHtmlAfterClosure) !== backupHashBeforeClosure) {
  throw new Error("AG07Z attempted to change the backup article. Refusing to continue.");
}

console.log("✅ AG07Z repeatable production readiness closure artifacts generated.");
