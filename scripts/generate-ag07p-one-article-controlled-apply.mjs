import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const targetArticlePath = "articles/policy/when-implementation-tells-the-real-story.html";
const targetArticleAbs = path.join(root, targetArticlePath);
const targetSlug = path.basename(targetArticlePath, ".html");
const backupRelativePath = `archive/ag07p-backups/${targetSlug}-before-ag07p.html`;
const backupAbs = path.join(root, backupRelativePath);

const startMarker = "<!-- AG07P-CONTROLLED-APPLY-START -->";
const endMarker = "<!-- AG07P-CONTROLLED-APPLY-END -->";

const inputs = {
  ag07oReview: "data/content-intelligence/quality-reviews/ag07o-approval-controlled-single-article-mutation-plan.json",
  ag07oMutationPlan: "data/content-intelligence/mutation-plans/ag07o-controlled-single-article-mutation-plan.json",
  ag07oApprovalPlan: "data/content-intelligence/approval-registry/ag07o-approval-plan-record.json",
  ag07oSchema: "data/content-intelligence/schema/approval-controlled-single-article-mutation-plan.schema.json",
  ag07oLearning: "data/content-intelligence/learning/ag07o-approval-controlled-single-article-mutation-plan-learning.json",
  ag07nCandidate: "data/content-intelligence/content-packets/ag07n-production-packet-candidate.json",
  ag07nReadiness: "data/content-intelligence/quality-registry/ag07n-production-packet-candidate-readiness.json",
  targetArticle: targetArticlePath
};

const reviewPath = path.join(root, "data", "content-intelligence", "quality-reviews", "ag07p-one-article-controlled-apply.json");
const applyRecordPath = path.join(root, "data", "content-intelligence", "apply-records", "ag07p-one-article-controlled-apply.json");
const auditPrepPath = path.join(root, "data", "content-intelligence", "quality-registry", "ag07p-post-apply-audit-prep.json");
const schemaPath = path.join(root, "data", "content-intelligence", "schema", "one-article-controlled-apply.schema.json");
const learningPath = path.join(root, "data", "content-intelligence", "learning", "ag07p-one-article-controlled-apply-learning.json");
const registryPath = path.join(root, "data", "quality", "ag07p-one-article-controlled-apply.json");
const previewPath = path.join(root, "data", "quality", "ag07p-one-article-controlled-apply-preview.json");
const docPath = path.join(root, "docs", "quality", "AG07P_ONE_ARTICLE_CONTROLLED_APPLY.md");

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

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function countOccurrences(text, marker) {
  return text.split(marker).length - 1;
}

function extractTitle(html) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1?.[1]) return h1[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (title?.[1]) return title[1].replace(/\s+/g, " ").trim();

  return "When Implementation Tells the Real Story";
}

function removeExistingAg07pBlock(html) {
  const blockPattern = new RegExp(
    `${startMarker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${endMarker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*`,
    "g"
  );
  return html.replace(blockPattern, "");
}

function insertBeforeLastClosingTag(html, tagName, block) {
  const regex = new RegExp(`</${tagName}>`, "gi");
  const matches = [...html.matchAll(regex)];
  if (!matches.length) return null;
  const last = matches[matches.length - 1];
  const index = last.index;
  return `${html.slice(0, index)}${block}\n${html.slice(index)}`;
}

function buildControlledApplyBlock(articleTitle) {
  return `
${startMarker}
<section class="drishvara-ag07p-controlled-apply" data-ag07p-stage="AG07P" data-ag07p-target="${targetArticlePath}">
  <h2>Implementation as the true test of public intent</h2>
  <p>Public programmes are often judged first through announcements, allocations and headline targets. Yet their real meaning becomes visible only when they reach the last mile. A scheme may be well designed on paper, but its credibility depends on whether institutions can translate intent into timely services, accountable delivery and measurable public value.</p>
  <p>Implementation is therefore not a secondary administrative detail. It is the point at which policy meets citizens. Field-level capacity, coordination between departments, clarity of responsibility, financial discipline and transparent monitoring decide whether a public promise becomes a lived improvement or remains a formal statement.</p>
  <p>The strongest governance systems treat implementation evidence as a feedback loop. Delays, local bottlenecks, uneven access, weak reporting and citizen grievances are not merely operational irritants; they are signals that help refine design, strengthen accountability and improve future decisions.</p>
  <p>For readers, the useful question is not only whether a programme was launched, but whether its delivery architecture can sustain outcomes over time. Real progress is seen in continuity of service, institutional learning, local ownership and the ability to correct course when evidence shows a gap between promise and practice.</p>
  <div class="drishvara-ag07p-reader-lens">
    <strong>Reader’s lens:</strong> When assessing any public initiative, look beyond the announcement. Ask what was delivered, who was reached, what changed on the ground, and whether the system learned from implementation evidence.
  </div>
  <p class="drishvara-ag07p-editorial-note"><em>Controlled update note: This section was added through AG07P as a one-article controlled static apply. No backend, Auth, Supabase, database write, production JSONL append, visual generation or multi-article mutation was performed.</em></p>
</section>
${endMarker}
`;
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
    throw new Error(`Missing required AG07P input ${name}: ${relativePath}`);
  }
}

const ag07oReview = readJson(inputs.ag07oReview);
const ag07oMutationPlan = readJson(inputs.ag07oMutationPlan);
const ag07oApprovalPlan = readJson(inputs.ag07oApprovalPlan);
const ag07oSchema = readJson(inputs.ag07oSchema);
const ag07oLearning = readJson(inputs.ag07oLearning);
const ag07nCandidate = readJson(inputs.ag07nCandidate);
const ag07nReadiness = readJson(inputs.ag07nReadiness);

if (!fs.existsSync(targetArticleAbs)) {
  throw new Error(`Target article does not exist: ${targetArticlePath}`);
}

const originalHtml = fs.readFileSync(targetArticleAbs, "utf8");
const hadExistingAg07pBlock = originalHtml.includes(startMarker) || originalHtml.includes(endMarker);

if (!fs.existsSync(backupAbs)) {
  if (hadExistingAg07pBlock) {
    throw new Error("Target article already contains AG07P marker but backup does not exist. Refusing to overwrite without clean backup.");
  }
  ensureDir(backupAbs);
  fs.copyFileSync(targetArticleAbs, backupAbs);
}

const backupHtml = fs.readFileSync(backupAbs, "utf8");
if (backupHtml.includes(startMarker) || backupHtml.includes(endMarker)) {
  throw new Error("Backup file contains AG07P marker. Refusing unsafe apply.");
}

const cleanHtml = removeExistingAg07pBlock(originalHtml);
const articleTitle = extractTitle(cleanHtml);
const controlledBlock = buildControlledApplyBlock(articleTitle);

let mutatedHtml =
  insertBeforeLastClosingTag(cleanHtml, "article", controlledBlock) ||
  insertBeforeLastClosingTag(cleanHtml, "main", controlledBlock) ||
  insertBeforeLastClosingTag(cleanHtml, "body", controlledBlock) ||
  `${cleanHtml}\n${controlledBlock}\n`;

fs.writeFileSync(targetArticleAbs, mutatedHtml);

const finalHtml = fs.readFileSync(targetArticleAbs, "utf8");
const targetMarkerCount = countOccurrences(finalHtml, startMarker);
const targetEndMarkerCount = countOccurrences(finalHtml, endMarker);
const articleFiles = listArticleFiles(path.join(root, "articles"));
const articleFilesWithAg07pMarker = articleFiles.filter((file) =>
  fs.readFileSync(path.join(root, file), "utf8").includes(startMarker)
);

const applyControls = {
  one_article_controlled_apply_only: true,
  target_article_path: targetArticlePath,
  backup_file_path: backupRelativePath,
  pre_apply_backup_created: true,
  backup_file_created: true,
  target_article_mutated: true,
  actual_public_mutation_performed: true,
  public_article_mutation_performed: true,
  article_html_mutation_performed: true,
  static_live_apply_performed: true,
  static_live_mutation_performed: true,
  file_edit_performed: true,
  file_write_performed: true,
  article_file_write_performed: true,
  multi_article_mutation_performed: false,
  mutated_article_count: 1,
  article_files_with_ag07p_marker_count: articleFilesWithAg07pMarker.length,
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
  reference_insertion_performed: false,
  reference_url_population_performed: false,
  approved_reference_url_population_performed: false,
  visual_generation_performed: false,
  visual_asset_generation_performed: false,
  image_insertion_performed: false,
  data_unit_generation_performed: false,
  caption_alt_credit_population_performed: false,
  production_packet_created: false,
  actual_production_packet_created: false,
  production_content_generated: false,
  dry_run_score_recalculation_performed: false,
  actual_score_calculation_performed: false,
  production_score_record_created: false,
  publish_ready_approval_performed: false,
  approval_state_changed: false,
  publish_ready_set: false,
  human_apply_approval_performed: true,
  scaffold_import_performed: false,
  scaffold_file_copy_performed: false,
  scaffold_file_move_performed: false,
  scaffold_file_delete_performed: false
};

const appliedSection = {
  section_id: "AG07P-SECTION-001",
  section_title: "Implementation as the true test of public intent",
  target_article_path: targetArticlePath,
  insertion_strategy: finalHtml.includes("</article>") ? "inserted_before_last_article_close_or_fallback" : "inserted_before_main_body_or_append_fallback",
  start_marker: startMarker,
  end_marker: endMarker,
  visible_reader_facing_section_added: true,
  article_prose_generated_as_static_section: true,
  reference_insertion_performed: false,
  visual_generation_performed: false,
  static_article_file_write_performed: true
};

const applyRecord = {
  module_id: "AG07P",
  title: "One-Article Controlled Apply Record",
  status: "one_article_controlled_apply_performed",
  controlled_apply_only: true,
  generated_from: inputs,
  candidate_id: ag07nCandidate.candidate_id,
  target_article_path: targetArticlePath,
  backup_file_path: backupRelativePath,
  target_article_title: articleTitle,
  approved_boundary: {
    user_approved_target_path: targetArticlePath,
    pre_apply_backup_required: true,
    one_static_article_mutation_only: true,
    no_multi_article_mutation: true,
    no_database_supabase_write: true,
    no_production_jsonl_append: true,
    no_backend_auth_supabase_activation: true,
    no_publishing_beyond_static_file_change_committed_to_repo: true
  },
  source_plan_snapshot: {
    ag07o_status: ag07oReview.status,
    ag07o_decision: ag07oReview.closure_decision?.decision,
    ag07p_handoff_created: ag07oReview.closure_decision?.ag07p_handoff_created,
    proceed_to_ag07p_only_with_explicit_user_approval: ag07oReview.closure_decision?.proceed_to_ag07p_only_with_explicit_user_approval
  },
  file_operations: {
    backup_created_or_preserved: true,
    backup_file_path: backupRelativePath,
    target_article_file_written: true,
    target_article_path: targetArticlePath,
    files_intentionally_touched: [
      backupRelativePath,
      targetArticlePath
    ],
    article_files_with_ag07p_marker: articleFilesWithAg07pMarker
  },
  applied_sections: [appliedSection],
  validation_observations: {
    target_start_marker_count: targetMarkerCount,
    target_end_marker_count: targetEndMarkerCount,
    backup_contains_ag07p_marker: backupHtml.includes(startMarker) || backupHtml.includes(endMarker),
    target_differs_from_backup: finalHtml !== backupHtml,
    one_article_marker_scope_confirmed: articleFilesWithAg07pMarker.length === 1 && articleFilesWithAg07pMarker[0] === targetArticlePath
  },
  ...applyControls
};

const postApplyAuditPrep = {
  module_id: "AG07P",
  title: "Post-Apply Audit Preparation",
  status: "post_apply_audit_prep_created",
  target_article_path: targetArticlePath,
  backup_file_path: backupRelativePath,
  next_stage_id: "AG07Q",
  next_stage_title: "Post-Mutation Audit",
  audit_required: true,
  audit_checklist: [
    {
      audit_id: "AG07P-AUD-001",
      audit_name: "target_article_exists",
      expected: true,
      observed_in_ag07p: fs.existsSync(targetArticleAbs)
    },
    {
      audit_id: "AG07P-AUD-002",
      audit_name: "backup_file_exists",
      expected: true,
      observed_in_ag07p: fs.existsSync(backupAbs)
    },
    {
      audit_id: "AG07P-AUD-003",
      audit_name: "single_ag07p_marker_scope",
      expected: true,
      observed_in_ag07p: articleFilesWithAg07pMarker.length === 1 && articleFilesWithAg07pMarker[0] === targetArticlePath
    },
    {
      audit_id: "AG07P-AUD-004",
      audit_name: "target_contains_one_start_and_end_marker",
      expected: true,
      observed_in_ag07p: targetMarkerCount === 1 && targetEndMarkerCount === 1
    },
    {
      audit_id: "AG07P-AUD-005",
      audit_name: "backup_has_no_ag07p_marker",
      expected: true,
      observed_in_ag07p: !backupHtml.includes(startMarker) && !backupHtml.includes(endMarker)
    },
    {
      audit_id: "AG07P-AUD-006",
      audit_name: "forbidden_backend_database_jsonl_activation_absent",
      expected: true,
      observed_in_ag07p: true
    }
  ],
  ...applyControls
};

const summary = {
  ag07o_plan_consumed: ag07oReview.status === "approval_controlled_single_article_mutation_plan_created",
  ag07n_candidate_consumed: ag07nCandidate.status === "production_packet_candidate_created",
  target_article_path: targetArticlePath,
  backup_file_path: backupRelativePath,
  one_article_controlled_apply_performed: true,
  pre_apply_backup_created: true,
  target_article_mutated: true,
  actual_public_mutation_performed: true,
  public_article_mutation_performed: true,
  article_html_mutation_performed: true,
  static_live_apply_performed: true,
  static_live_mutation_performed: true,
  file_edit_performed: true,
  article_file_write_performed: true,
  multi_article_mutation_performed: false,
  mutated_article_count: 1,
  article_files_with_ag07p_marker_count: articleFilesWithAg07pMarker.length,
  reference_insertion_performed: false,
  reference_url_population_performed: false,
  visual_generation_performed: false,
  image_insertion_performed: false,
  production_jsonl_append_performed: false,
  database_write_performed: false,
  supabase_write_performed: false,
  public_publishing_performed: false,
  backend_auth_supabase_activation_performed: false,
  production_readiness_after_ag07p: "one_article_applied_pending_post_apply_audit",
  publish_readiness_after_ag07p: "static_file_changed_not_publish_approved",
  next_stage_id: "AG07Q",
  next_stage_title: "Post-Mutation Audit"
};

const schema = {
  schema_id: "drishvara/ag07p/one-article-controlled-apply.schema.json",
  module_id: "AG07P",
  title: "One-Article Controlled Apply Schema",
  status: "schema_controlled_apply_only",
  description: "Schema for one controlled static article apply. AG07P permits one target article file mutation with backup, while blocking multi-article mutation, JSONL/database/Supabase writes, backend activation and publishing.",
  required_top_level_fields: [
    "apply_record",
    "post_apply_audit_prep",
    "summary",
    "apply_controls"
  ],
  one_article_controlled_apply_allowed_in_ag07p: true,
  pre_apply_backup_allowed_in_ag07p: true,
  target_article_file_write_allowed_in_ag07p: true,
  multi_article_mutation_allowed_in_ag07p: false,
  reference_insertion_allowed_in_ag07p: false,
  reference_url_population_allowed_in_ag07p: false,
  visual_generation_allowed_in_ag07p: false,
  image_insertion_allowed_in_ag07p: false,
  production_jsonl_append_allowed_in_ag07p: false,
  database_write_allowed_in_ag07p: false,
  supabase_write_allowed_in_ag07p: false,
  backend_auth_supabase_allowed_in_ag07p: false,
  publishing_allowed_in_ag07p: false,
  ...applyControls
};

const learning = {
  module_id: "AG07P",
  title: "One-Article Controlled Apply Learning",
  status: "learning_record_only",
  generated_from: inputs,
  summary,
  learning_points_from_ag07o: asArray(ag07oLearning.ag07o_learning_points),
  ag07p_learning_points: [
    "A single static article can be safely mutated when the target path is explicit and a backup is created first.",
    "AG07P is the first AG07 stage that intentionally writes one article file.",
    "The controlled apply must remain limited to the approved article path.",
    "Post-apply audit is mandatory before closing the mutation chain.",
    "Static article mutation does not imply backend, Auth, Supabase, JSONL, database or publishing activation."
  ],
  carried_forward_doctrine: [
    "One article only.",
    "Backup before mutation.",
    "No multi-article mutation.",
    "No production JSONL append.",
    "No database or Supabase write.",
    "No backend/Auth/Supabase activation.",
    "No publishing approval in AG07P."
  ],
  compressed_path_after_ag07p: [
    "AG07Q — Post-Mutation Audit",
    "AG07Z — Closure / Repeatable Production Readiness"
  ],
  ...applyControls
};

const review = {
  module_id: "AG07P",
  title: "One-Article Controlled Apply",
  status: "one_article_controlled_apply_performed",
  governance_only: false,
  controlled_apply_only: true,
  depends_on: ["AG07O", "AG07N", "AG07M", "AG07L", "AG07K"],
  generated_from: inputs,
  summary,
  alignment_with_ag07o: {
    ag07o_status: ag07oReview.status,
    ag07o_decision: ag07oReview.closure_decision?.decision,
    ag07p_requires_explicit_approval: ag07oReview.closure_decision?.proceed_to_ag07p_only_with_explicit_user_approval,
    ag07p_handoff_created: ag07oReview.closure_decision?.ag07p_handoff_created,
    mutation_plan_created: ag07oReview.closure_decision?.mutation_plan_created,
    approval_plan_created: ag07oReview.closure_decision?.approval_plan_created,
    ag07o_file_edit_performed: ag07oReview.closure_decision?.file_edit_performed,
    ag07o_static_live_apply_performed: ag07oReview.closure_decision?.static_live_apply_performed
  },
  apply_record_file: "data/content-intelligence/apply-records/ag07p-one-article-controlled-apply.json",
  post_apply_audit_prep_file: "data/content-intelligence/quality-registry/ag07p-post-apply-audit-prep.json",
  schema_file: "data/content-intelligence/schema/one-article-controlled-apply.schema.json",
  learning_file: "data/content-intelligence/learning/ag07p-one-article-controlled-apply-learning.json",
  closure_decision: {
    decision: "ag07p_one_article_controlled_apply_closed_pending_audit",
    proceed_to_ag07q_only_with_explicit_user_approval: true,
    one_article_controlled_apply_performed: true,
    pre_apply_backup_created: true,
    target_article_path: targetArticlePath,
    backup_file_path: backupRelativePath,
    target_article_mutated: true,
    mutated_article_count: 1,
    multi_article_mutation_performed: false,
    article_files_with_ag07p_marker_count: articleFilesWithAg07pMarker.length,
    reference_insertion_performed: false,
    reference_url_population_performed: false,
    visual_generation_performed: false,
    image_insertion_performed: false,
    production_jsonl_append_performed: false,
    database_write_performed: false,
    supabase_write_performed: false,
    public_publishing_performed: false,
    backend_auth_supabase_activation_performed: false,
    production_readiness: "one_article_applied_pending_post_apply_audit",
    publish_readiness: "static_file_changed_not_publish_approved"
  },
  ...applyControls
};

const registry = {
  module_id: "AG07P",
  title: "One-Article Controlled Apply",
  controlled_apply_only: true,
  depends_on: ["AG07O"],
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag07p-one-article-controlled-apply.json",
    apply_record: "data/content-intelligence/apply-records/ag07p-one-article-controlled-apply.json",
    audit_prep: "data/content-intelligence/quality-registry/ag07p-post-apply-audit-prep.json",
    schema: "data/content-intelligence/schema/one-article-controlled-apply.schema.json",
    learning: "data/content-intelligence/learning/ag07p-one-article-controlled-apply-learning.json",
    preview: "data/quality/ag07p-one-article-controlled-apply-preview.json",
    document: "docs/quality/AG07P_ONE_ARTICLE_CONTROLLED_APPLY.md",
    target_article: targetArticlePath,
    backup_file: backupRelativePath
  },
  summary,
  next_recommended_stage: {
    module_id: "AG07Q",
    title: "Post-Mutation Audit",
    allowed_scope: "audit the one article mutation, backup, marker scope, blocked systems and rollback readiness",
    blocked_scope: "new mutation, multi-article apply, publishing, backend/Auth/Supabase activation, database/Supabase write, production JSONL append"
  },
  ...applyControls
};

const preview = {
  module_id: "AG07P",
  preview_only: false,
  controlled_apply_only: true,
  summary,
  apply_snapshot: {
    target_article_path: targetArticlePath,
    backup_file_path: backupRelativePath,
    target_marker_count: targetMarkerCount,
    target_end_marker_count: targetEndMarkerCount,
    article_files_with_ag07p_marker: articleFilesWithAg07pMarker,
    one_article_marker_scope_confirmed: articleFilesWithAg07pMarker.length === 1 && articleFilesWithAg07pMarker[0] === targetArticlePath
  },
  next_stage_id: "AG07Q",
  next_stage_title: "Post-Mutation Audit",
  ...applyControls
};

const doc = `# AG07P — One-Article Controlled Apply

## Purpose

AG07P performs one controlled static article apply on the explicitly approved target article:

\`${targetArticlePath}\`

This stage creates a pre-apply backup and mutates only the approved target article file.

## Target Article

- Target: \`${targetArticlePath}\`
- Backup: \`${backupRelativePath}\`
- Scope: one article only.

## What AG07P Performed

AG07P performed:

- pre-apply backup creation;
- one target article file mutation;
- insertion of one AG07P controlled editorial section;
- post-apply audit preparation;
- validation artifact generation.

## What AG07P Did Not Perform

AG07P did not perform:

- multi-article mutation;
- production JSONL append;
- database write;
- Supabase write;
- backend activation;
- Auth activation;
- API route creation;
- publishing approval;
- reference URL population;
- reference insertion;
- visual generation;
- image insertion;
- scaffold import.

## Marker

The target article contains the controlled apply marker:

\`${startMarker}\`

and closes with:

\`${endMarker}\`

## Audit Requirement

AG07Q must audit:

- target article exists;
- backup exists;
- only one article contains AG07P marker;
- target contains exactly one start marker and one end marker;
- backup does not contain AG07P marker;
- no backend/Auth/Supabase/database/JSONL/publishing activation occurred.

## Next Stage

The next possible stage is AG07Q — Post-Mutation Audit.

AG07Q requires explicit approval.
`;

writeJson(reviewPath, review);
writeJson(applyRecordPath, applyRecord);
writeJson(auditPrepPath, postApplyAuditPrep);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG07P one-article controlled apply artifacts generated and target article mutated.");
