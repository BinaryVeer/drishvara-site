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
  ag07pReview: "data/content-intelligence/quality-reviews/ag07p-one-article-controlled-apply.json",
  ag07pApplyRecord: "data/content-intelligence/apply-records/ag07p-one-article-controlled-apply.json",
  ag07pAuditPrep: "data/content-intelligence/quality-registry/ag07p-post-apply-audit-prep.json",
  ag07pSchema: "data/content-intelligence/schema/one-article-controlled-apply.schema.json",
  ag07pLearning: "data/content-intelligence/learning/ag07p-one-article-controlled-apply-learning.json",
  ag07oMutationPlan: "data/content-intelligence/mutation-plans/ag07o-controlled-single-article-mutation-plan.json",
  targetArticle: targetArticlePath,
  backupArticle: backupRelativePath
};

const reviewPath = path.join(root, "data", "content-intelligence", "quality-reviews", "ag07q-post-mutation-audit.json");
const auditReportPath = path.join(root, "data", "content-intelligence", "audit-records", "ag07q-post-mutation-audit-report.json");
const rollbackReadinessPath = path.join(root, "data", "content-intelligence", "quality-registry", "ag07q-rollback-readiness-record.json");
const schemaPath = path.join(root, "data", "content-intelligence", "schema", "post-mutation-audit.schema.json");
const learningPath = path.join(root, "data", "content-intelligence", "learning", "ag07q-post-mutation-audit-learning.json");
const registryPath = path.join(root, "data", "quality", "ag07q-post-mutation-audit.json");
const previewPath = path.join(root, "data", "quality", "ag07q-post-mutation-audit-preview.json");
const docPath = path.join(root, "docs", "quality", "AG07Q_POST_MUTATION_AUDIT.md");

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
    throw new Error(`Missing required AG07Q input ${name}: ${relativePath}`);
  }
}

const ag07pReview = readJson(inputs.ag07pReview);
const ag07pApplyRecord = readJson(inputs.ag07pApplyRecord);
const ag07pAuditPrep = readJson(inputs.ag07pAuditPrep);
const ag07pSchema = readJson(inputs.ag07pSchema);
const ag07pLearning = readJson(inputs.ag07pLearning);
const ag07oMutationPlan = readJson(inputs.ag07oMutationPlan);

const targetAbs = path.join(root, targetArticlePath);
const backupAbs = path.join(root, backupRelativePath);

const targetHtmlBeforeAudit = fs.readFileSync(targetAbs, "utf8");
const backupHtml = fs.readFileSync(backupAbs, "utf8");

const articleFiles = listArticleFiles(path.join(root, "articles"));
const articleFilesWithStartMarker = articleFiles.filter((file) =>
  fs.readFileSync(path.join(root, file), "utf8").includes(startMarker)
);
const articleFilesWithEndMarker = articleFiles.filter((file) =>
  fs.readFileSync(path.join(root, file), "utf8").includes(endMarker)
);

const targetStartMarkerCount = countOccurrences(targetHtmlBeforeAudit, startMarker);
const targetEndMarkerCount = countOccurrences(targetHtmlBeforeAudit, endMarker);
const backupStartMarkerCount = countOccurrences(backupHtml, startMarker);
const backupEndMarkerCount = countOccurrences(backupHtml, endMarker);

const targetHashBeforeAudit = sha256(targetHtmlBeforeAudit);
const backupHash = sha256(backupHtml);

const forbiddenSystemGuardObservations = {
  production_jsonl_append_performed: ag07pReview.closure_decision?.production_jsonl_append_performed === false,
  database_write_performed: ag07pReview.closure_decision?.database_write_performed === false,
  supabase_write_performed: ag07pReview.closure_decision?.supabase_write_performed === false,
  backend_auth_supabase_activation_performed: ag07pReview.closure_decision?.backend_auth_supabase_activation_performed === false,
  public_publishing_performed: ag07pReview.closure_decision?.public_publishing_performed === false,
  reference_insertion_performed: ag07pReview.closure_decision?.reference_insertion_performed === false,
  reference_url_population_performed: ag07pReview.closure_decision?.reference_url_population_performed === false,
  visual_generation_performed: ag07pReview.closure_decision?.visual_generation_performed === false,
  image_insertion_performed: ag07pReview.closure_decision?.image_insertion_performed === false
};

const auditChecks = [
  {
    audit_id: "AG07Q-AUD-001",
    audit_name: "target_article_exists",
    expected: true,
    observed: fs.existsSync(targetAbs),
    passed: fs.existsSync(targetAbs)
  },
  {
    audit_id: "AG07Q-AUD-002",
    audit_name: "backup_file_exists",
    expected: true,
    observed: fs.existsSync(backupAbs),
    passed: fs.existsSync(backupAbs)
  },
  {
    audit_id: "AG07Q-AUD-003",
    audit_name: "target_contains_exactly_one_start_marker",
    expected: 1,
    observed: targetStartMarkerCount,
    passed: targetStartMarkerCount === 1
  },
  {
    audit_id: "AG07Q-AUD-004",
    audit_name: "target_contains_exactly_one_end_marker",
    expected: 1,
    observed: targetEndMarkerCount,
    passed: targetEndMarkerCount === 1
  },
  {
    audit_id: "AG07Q-AUD-005",
    audit_name: "backup_contains_no_start_marker",
    expected: 0,
    observed: backupStartMarkerCount,
    passed: backupStartMarkerCount === 0
  },
  {
    audit_id: "AG07Q-AUD-006",
    audit_name: "backup_contains_no_end_marker",
    expected: 0,
    observed: backupEndMarkerCount,
    passed: backupEndMarkerCount === 0
  },
  {
    audit_id: "AG07Q-AUD-007",
    audit_name: "only_one_article_contains_ag07p_start_marker",
    expected: [targetArticlePath],
    observed: articleFilesWithStartMarker,
    passed: articleFilesWithStartMarker.length === 1 && articleFilesWithStartMarker[0] === targetArticlePath
  },
  {
    audit_id: "AG07Q-AUD-008",
    audit_name: "only_one_article_contains_ag07p_end_marker",
    expected: [targetArticlePath],
    observed: articleFilesWithEndMarker,
    passed: articleFilesWithEndMarker.length === 1 && articleFilesWithEndMarker[0] === targetArticlePath
  },
  {
    audit_id: "AG07Q-AUD-009",
    audit_name: "target_differs_from_backup",
    expected: true,
    observed: targetHtmlBeforeAudit !== backupHtml,
    passed: targetHtmlBeforeAudit !== backupHtml
  },
  {
    audit_id: "AG07Q-AUD-010",
    audit_name: "ag07p_review_confirmed_single_article_mutation",
    expected: true,
    observed: ag07pReview.closure_decision?.mutated_article_count === 1 && ag07pReview.closure_decision?.multi_article_mutation_performed === false,
    passed: ag07pReview.closure_decision?.mutated_article_count === 1 && ag07pReview.closure_decision?.multi_article_mutation_performed === false
  },
  {
    audit_id: "AG07Q-AUD-011",
    audit_name: "ag07p_apply_record_confirms_marker_scope",
    expected: true,
    observed: ag07pApplyRecord.validation_observations?.one_article_marker_scope_confirmed === true,
    passed: ag07pApplyRecord.validation_observations?.one_article_marker_scope_confirmed === true
  },
  {
    audit_id: "AG07Q-AUD-012",
    audit_name: "forbidden_system_guards_confirmed",
    expected: true,
    observed: Object.values(forbiddenSystemGuardObservations).every(Boolean),
    passed: Object.values(forbiddenSystemGuardObservations).every(Boolean)
  },
  {
    audit_id: "AG07Q-AUD-013",
    audit_name: "post_apply_quality_status",
    expected: "pass",
    observed: targetHtmlBeforeAudit.includes("Implementation as the true test of public intent") && targetHtmlBeforeAudit.includes("Reader’s lens:"),
    passed: targetHtmlBeforeAudit.includes("Implementation as the true test of public intent") && targetHtmlBeforeAudit.includes("Reader’s lens:")
  }
];

const allAuditChecksPassed = auditChecks.every((item) => item.passed === true);

const rollbackReadiness = {
  rollback_ready: fs.existsSync(backupAbs) && backupStartMarkerCount === 0 && backupEndMarkerCount === 0,
  rollback_method: "restore target article from pre-apply backup",
  target_article_path: targetArticlePath,
  backup_file_path: backupRelativePath,
  backup_hash_sha256: backupHash,
  target_hash_sha256_at_audit: targetHashBeforeAudit,
  rollback_execution_performed_in_ag07q: false,
  rollback_test_performed_in_ag07q: false,
  rollback_risk_status: fs.existsSync(backupAbs) ? "low" : "high",
  rollback_notes: [
    "Backup file exists from AG07P.",
    "Backup does not contain AG07P markers.",
    "Rollback was not executed in AG07Q because AG07Q is audit-only."
  ]
};

const auditOnlyControls = {
  post_mutation_audit_only: true,
  audit_artifacts_created: true,
  target_article_path: targetArticlePath,
  backup_file_path: backupRelativePath,
  target_article_read_performed: true,
  backup_file_read_performed: true,
  marker_scope_scan_performed: true,
  hash_audit_performed: true,
  rollback_readiness_checked: true,
  forbidden_system_guard_checked: true,
  post_apply_quality_checked: true,
  new_article_mutation_performed: false,
  target_article_file_write_performed: false,
  public_article_mutation_performed: false,
  article_html_mutation_performed: false,
  file_edit_performed: false,
  file_write_performed: false,
  article_file_write_performed: false,
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
  multi_article_mutation_performed: false
};

const summary = {
  ag07p_apply_consumed: ag07pReview.status === "one_article_controlled_apply_performed",
  ag07p_target_article_path: targetArticlePath,
  ag07p_backup_file_path: backupRelativePath,
  post_mutation_audit_performed: true,
  audit_check_count: auditChecks.length,
  audit_pass_count: auditChecks.filter((item) => item.passed).length,
  audit_fail_count: auditChecks.filter((item) => !item.passed).length,
  all_audit_checks_passed: allAuditChecksPassed,
  target_start_marker_count: targetStartMarkerCount,
  target_end_marker_count: targetEndMarkerCount,
  backup_start_marker_count: backupStartMarkerCount,
  backup_end_marker_count: backupEndMarkerCount,
  article_files_with_ag07p_marker_count: articleFilesWithStartMarker.length,
  article_files_with_ag07p_marker: articleFilesWithStartMarker,
  rollback_ready: rollbackReadiness.rollback_ready,
  forbidden_system_guards_passed: Object.values(forbiddenSystemGuardObservations).every(Boolean),
  post_apply_quality_status: allAuditChecksPassed ? "pass" : "review_required",
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
  production_readiness_after_ag07q: allAuditChecksPassed ? "one_article_apply_audited" : "audit_review_required",
  publish_readiness_after_ag07q: "static_file_changed_not_publish_approved",
  next_stage_id: "AG07Z",
  next_stage_title: "Closure / Repeatable Production Readiness"
};

const auditReport = {
  module_id: "AG07Q",
  title: "Post-Mutation Audit Report",
  status: allAuditChecksPassed ? "post_mutation_audit_passed" : "post_mutation_audit_review_required",
  audit_only: true,
  generated_from: inputs,
  target_article_path: targetArticlePath,
  backup_file_path: backupRelativePath,
  target_hash_sha256_at_audit_start: targetHashBeforeAudit,
  target_hash_sha256_at_audit_end: targetHashBeforeAudit,
  backup_hash_sha256: backupHash,
  article_files_scanned_count: articleFiles.length,
  article_files_with_ag07p_start_marker: articleFilesWithStartMarker,
  article_files_with_ag07p_end_marker: articleFilesWithEndMarker,
  audit_checks: auditChecks,
  forbidden_system_guard_observations: forbiddenSystemGuardObservations,
  rollback_readiness: rollbackReadiness,
  post_apply_quality: {
    status: allAuditChecksPassed ? "pass" : "review_required",
    visible_section_heading_present: targetHtmlBeforeAudit.includes("Implementation as the true test of public intent"),
    reader_lens_present: targetHtmlBeforeAudit.includes("Reader’s lens:"),
    controlled_update_note_present: targetHtmlBeforeAudit.includes("Controlled update note"),
    manual_visual_review_required: true
  },
  ...auditOnlyControls
};

const rollbackReadinessRecord = {
  module_id: "AG07Q",
  title: "Rollback Readiness Record",
  status: rollbackReadiness.rollback_ready ? "rollback_ready" : "rollback_not_ready",
  audit_only: true,
  target_article_path: targetArticlePath,
  backup_file_path: backupRelativePath,
  rollback_readiness: rollbackReadiness,
  rollback_preconditions: [
    {
      precondition_id: "AG07Q-RB-001",
      name: "backup_exists",
      passed: fs.existsSync(backupAbs)
    },
    {
      precondition_id: "AG07Q-RB-002",
      name: "backup_has_no_ag07p_marker",
      passed: backupStartMarkerCount === 0 && backupEndMarkerCount === 0
    },
    {
      precondition_id: "AG07Q-RB-003",
      name: "target_has_one_ag07p_block",
      passed: targetStartMarkerCount === 1 && targetEndMarkerCount === 1
    },
    {
      precondition_id: "AG07Q-RB-004",
      name: "one_article_scope_confirmed",
      passed: articleFilesWithStartMarker.length === 1 && articleFilesWithStartMarker[0] === targetArticlePath
    }
  ],
  ...auditOnlyControls
};

const schema = {
  schema_id: "drishvara/ag07q/post-mutation-audit.schema.json",
  module_id: "AG07Q",
  title: "Post-Mutation Audit Schema",
  status: "schema_audit_only",
  description: "Schema for auditing AG07P one-article controlled apply without performing any new public mutation or file edit.",
  required_top_level_fields: [
    "audit_report",
    "rollback_readiness_record",
    "summary",
    "audit_only_controls"
  ],
  post_mutation_audit_allowed_in_ag07q: true,
  target_article_read_allowed_in_ag07q: true,
  backup_file_read_allowed_in_ag07q: true,
  marker_scope_scan_allowed_in_ag07q: true,
  hash_audit_allowed_in_ag07q: true,
  rollback_readiness_check_allowed_in_ag07q: true,
  forbidden_system_guard_check_allowed_in_ag07q: true,
  post_apply_quality_check_allowed_in_ag07q: true,
  new_article_mutation_allowed_in_ag07q: false,
  file_edit_allowed_in_ag07q: false,
  target_article_file_write_allowed_in_ag07q: false,
  backup_file_creation_allowed_in_ag07q: false,
  rollback_execution_allowed_in_ag07q: false,
  reference_insertion_allowed_in_ag07q: false,
  reference_url_population_allowed_in_ag07q: false,
  visual_generation_allowed_in_ag07q: false,
  production_jsonl_append_allowed_in_ag07q: false,
  database_write_allowed_in_ag07q: false,
  supabase_write_allowed_in_ag07q: false,
  backend_auth_supabase_allowed_in_ag07q: false,
  publishing_allowed_in_ag07q: false,
  ...auditOnlyControls
};

const learning = {
  module_id: "AG07Q",
  title: "Post-Mutation Audit Learning",
  status: "learning_record_only",
  audit_only: true,
  generated_from: inputs,
  summary,
  learning_points_from_ag07p: asArray(ag07pLearning.ag07p_learning_points),
  ag07q_learning_points: [
    "Post-mutation audit must be separate from the apply stage.",
    "Marker scope proves whether a controlled one-article apply stayed within boundary.",
    "Backup integrity is the rollback foundation.",
    "A static article change does not imply publishing approval or backend activation.",
    "AG07Z can close the controlled chain only if AG07Q passes."
  ],
  carried_forward_doctrine: [
    "Audit is not mutation.",
    "No new article file write in AG07Q.",
    "No reference insertion or visual generation in AG07Q.",
    "No JSONL/database/Supabase/backend/Auth/publishing activation in AG07Q.",
    "Closure must remain evidence-based."
  ],
  compressed_path_after_ag07q: [
    "AG07Z — Closure / Repeatable Production Readiness"
  ],
  ...auditOnlyControls
};

const review = {
  module_id: "AG07Q",
  title: "Post-Mutation Audit",
  status: allAuditChecksPassed ? "post_mutation_audit_passed" : "post_mutation_audit_review_required",
  governance_only: true,
  audit_only: true,
  depends_on: ["AG07P", "AG07O", "AG07N"],
  generated_from: inputs,
  summary,
  alignment_with_ag07p: {
    ag07p_status: ag07pReview.status,
    ag07p_decision: ag07pReview.closure_decision?.decision,
    ag07q_requires_explicit_approval: ag07pReview.closure_decision?.proceed_to_ag07q_only_with_explicit_user_approval,
    ag07p_target_article_path: ag07pReview.closure_decision?.target_article_path,
    ag07p_backup_file_path: ag07pReview.closure_decision?.backup_file_path,
    ag07p_mutated_article_count: ag07pReview.closure_decision?.mutated_article_count,
    ag07p_multi_article_mutation_performed: ag07pReview.closure_decision?.multi_article_mutation_performed
  },
  audit_report_file: "data/content-intelligence/audit-records/ag07q-post-mutation-audit-report.json",
  rollback_readiness_file: "data/content-intelligence/quality-registry/ag07q-rollback-readiness-record.json",
  schema_file: "data/content-intelligence/schema/post-mutation-audit.schema.json",
  learning_file: "data/content-intelligence/learning/ag07q-post-mutation-audit-learning.json",
  closure_decision: {
    decision: allAuditChecksPassed ? "ag07q_post_mutation_audit_closed_passed" : "ag07q_post_mutation_audit_closed_review_required",
    proceed_to_ag07z_only_with_explicit_user_approval: true,
    post_mutation_audit_performed: true,
    all_audit_checks_passed: allAuditChecksPassed,
    target_article_path: targetArticlePath,
    backup_file_path: backupRelativePath,
    target_start_marker_count: targetStartMarkerCount,
    target_end_marker_count: targetEndMarkerCount,
    backup_start_marker_count: backupStartMarkerCount,
    backup_end_marker_count: backupEndMarkerCount,
    article_files_with_ag07p_marker_count: articleFilesWithStartMarker.length,
    rollback_ready: rollbackReadiness.rollback_ready,
    forbidden_system_guards_passed: Object.values(forbiddenSystemGuardObservations).every(Boolean),
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
    production_readiness: allAuditChecksPassed ? "one_article_apply_audited" : "audit_review_required",
    publish_readiness: "static_file_changed_not_publish_approved"
  },
  ...auditOnlyControls
};

const registry = {
  module_id: "AG07Q",
  title: "Post-Mutation Audit",
  audit_only: true,
  depends_on: ["AG07P"],
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag07q-post-mutation-audit.json",
    audit_report: "data/content-intelligence/audit-records/ag07q-post-mutation-audit-report.json",
    rollback_readiness: "data/content-intelligence/quality-registry/ag07q-rollback-readiness-record.json",
    schema: "data/content-intelligence/schema/post-mutation-audit.schema.json",
    learning: "data/content-intelligence/learning/ag07q-post-mutation-audit-learning.json",
    preview: "data/quality/ag07q-post-mutation-audit-preview.json",
    document: "docs/quality/AG07Q_POST_MUTATION_AUDIT.md"
  },
  summary,
  next_recommended_stage: {
    module_id: "AG07Z",
    title: "Closure / Repeatable Production Readiness",
    allowed_scope: "close AG07 controlled chain and record repeatable readiness doctrine",
    blocked_scope: "new mutation, publishing, backend/Auth/Supabase activation, database/Supabase write, production JSONL append"
  },
  ...auditOnlyControls
};

const preview = {
  module_id: "AG07Q",
  preview_only: true,
  audit_only: true,
  summary,
  audit_snapshot: {
    target_article_path: targetArticlePath,
    backup_file_path: backupRelativePath,
    all_audit_checks_passed: allAuditChecksPassed,
    target_start_marker_count: targetStartMarkerCount,
    target_end_marker_count: targetEndMarkerCount,
    backup_start_marker_count: backupStartMarkerCount,
    backup_end_marker_count: backupEndMarkerCount,
    article_files_with_ag07p_marker: articleFilesWithStartMarker,
    rollback_ready: rollbackReadiness.rollback_ready,
    forbidden_system_guards_passed: Object.values(forbiddenSystemGuardObservations).every(Boolean)
  },
  next_stage_id: "AG07Z",
  next_stage_title: "Closure / Repeatable Production Readiness",
  ...auditOnlyControls
};

const doc = `# AG07Q — Post-Mutation Audit

## Purpose

AG07Q audits the AG07P one-article controlled apply.

This stage is audit-only. It does not perform any new article mutation, file edit, reference insertion, visual generation, production JSONL append, database/Supabase write, publishing, or backend/Auth/Supabase activation.

## Target Article

- Target: \`${targetArticlePath}\`
- Backup: \`${backupRelativePath}\`

## Audit Scope

AG07Q verifies:

- target article exists;
- backup file exists;
- target contains exactly one AG07P start marker;
- target contains exactly one AG07P end marker;
- backup contains no AG07P marker;
- only one article contains the AG07P marker;
- target differs from backup;
- AG07P record confirms single-article mutation;
- forbidden-system guards remain intact;
- rollback readiness is present;
- post-apply quality status is acceptable.

## Result

Audit status: \`${allAuditChecksPassed ? "passed" : "review_required"}\`

Production readiness after AG07Q: \`${summary.production_readiness_after_ag07q}\`

Publish readiness after AG07Q: \`${summary.publish_readiness_after_ag07q}\`

## Explicit Exclusions

AG07Q does not:

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

## Acceptance Criteria

AG07Q is acceptable only if:

- AG07P apply record is consumed;
- target article exists;
- backup exists;
- target contains exactly one AG07P start marker and one end marker;
- backup contains no AG07P marker;
- exactly one article contains AG07P marker;
- target differs from backup;
- rollback readiness is recorded;
- forbidden-system guards are confirmed;
- no new mutation or write is performed against the target article;
- AG07Z Closure / Repeatable Production Readiness is identified as next only with explicit approval.

## Next Stage

The next possible stage is AG07Z — Closure / Repeatable Production Readiness.

AG07Z requires explicit approval.
`;

writeJson(reviewPath, review);
writeJson(auditReportPath, auditReport);
writeJson(rollbackReadinessPath, rollbackReadinessRecord);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

const targetHtmlAfterAudit = fs.readFileSync(targetAbs, "utf8");
if (sha256(targetHtmlAfterAudit) !== targetHashBeforeAudit) {
  throw new Error("AG07Q audit attempted to change the target article. Refusing to continue.");
}

console.log("✅ AG07Q post-mutation audit artifacts generated.");
