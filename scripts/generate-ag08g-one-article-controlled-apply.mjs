import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag08fReview: "data/content-intelligence/quality-reviews/ag08f-draft-approval-controlled-apply-plan.json",
  ag08fApproval: "data/content-intelligence/approval-registry/ag08f-draft-reference-approval-record.json",
  ag08fApplyPlan: "data/content-intelligence/mutation-plans/ag08f-controlled-apply-plan.json",
  ag08fReadiness: "data/content-intelligence/quality-registry/ag08f-apply-readiness-record.json",
  ag08eDraft: "data/content-intelligence/content-packets/ag08e-full-upgrade-draft-candidate.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag08g-one-article-controlled-apply.json");
const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag08g-one-article-controlled-apply.json");
const auditPrepPath = path.join(root, "data/content-intelligence/quality-registry/ag08g-post-apply-audit-prep.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/one-article-controlled-apply-ag08g.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag08g-one-article-controlled-apply-learning.json");
const registryPath = path.join(root, "data/quality/ag08g-one-article-controlled-apply.json");
const previewPath = path.join(root, "data/quality/ag08g-one-article-controlled-apply-preview.json");
const docPath = path.join(root, "docs/quality/AG08G_ONE_ARTICLE_CONTROLLED_APPLY.md");

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
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

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

function markdownToHtml(markdown) {
  const lines = String(markdown || "").split(/\r?\n/);
  const html = [];
  let paragraph = [];

  function flushParagraph() {
    if (!paragraph.length) return;
    html.push(`<p>${escapeHtml(paragraph.join(" ").trim())}</p>`);
    paragraph = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      continue;
    }

    if (trimmed.startsWith("# ")) {
      flushParagraph();
      html.push(`<h1>${escapeHtml(trimmed.slice(2).trim())}</h1>`);
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushParagraph();
      html.push(`<h2>${escapeHtml(trimmed.slice(3).trim())}</h2>`);
      continue;
    }

    paragraph.push(trimmed);
  }

  flushParagraph();
  return html.join("\n");
}

function countOccurrences(text, needle) {
  return String(text).split(needle).length - 1;
}

function uniqueBlocks(blocks) {
  return [...new Set(blocks.map((block) => block.trim()).filter(Boolean))];
}

function linkCount(block) {
  const matches = String(block || "").match(/<a\s+/gi);
  return matches ? matches.length : 0;
}

function collectCandidatesForMarker(existingHtml, marker) {
  const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`<section\\b[^>]*>[\\s\\S]*?${escaped}[\\s\\S]*?<\\/section>`, "gi"),
    new RegExp(`<div\\b[^>]*>[\\s\\S]*?${escaped}[\\s\\S]*?<\\/div>`, "gi"),
    new RegExp(`<aside\\b[^>]*>[\\s\\S]*?${escaped}[\\s\\S]*?<\\/aside>`, "gi"),
    new RegExp(`<ol\\b[^>]*>[\\s\\S]*?${escaped}[\\s\\S]*?<\\/ol>`, "gi"),
    new RegExp(`<ul\\b[^>]*>[\\s\\S]*?${escaped}[\\s\\S]*?<\\/ul>`, "gi")
  ];

  const candidates = [];
  for (const pattern of patterns) {
    const matches = existingHtml.match(pattern) || [];
    candidates.push(...matches);
  }

  return uniqueBlocks(candidates);
}

function pickSmallestUsefulBlock(candidates, expectedLinkCount = null) {
  if (!candidates.length) return null;

  let filtered = candidates;

  if (expectedLinkCount !== null) {
    const exact = candidates.filter((block) => linkCount(block) === expectedLinkCount);
    if (exact.length) filtered = exact;
  }

  filtered.sort((a, b) => a.length - b.length);
  return filtered[0];
}

function collectLegacyGovernanceBlocks(existingHtml) {
  const markerRules = [
    { marker: "AG03C-B2", expectedLinks: 2 },
    { marker: "AG03C", expectedLinks: 2 },
    { marker: "AG03C-B3", expectedLinks: 2 },
    { marker: "AG03C-B4", expectedLinks: 2 },
    { marker: "AG03C-B5", expectedLinks: 2 },
    { marker: "AG03C-B6", expectedLinks: 2 },
    { marker: "AG05D", expectedLinks: null },
    { marker: "AG05D-R1", expectedLinks: null },
    { marker: "AG02", expectedLinks: null },
    { marker: "AR02C", expectedLinks: null }
  ];

  const selected = [];

  for (const rule of markerRules) {
    if (selected.some((block) => block.includes(rule.marker))) continue;

    const candidates = collectCandidatesForMarker(existingHtml, rule.marker);
    const picked = pickSmallestUsefulBlock(candidates, rule.expectedLinks);

    if (picked && !selected.includes(picked)) {
      selected.push(picked);
    }
  }

  return uniqueBlocks(selected);
}

function applyControlledBlock(existingHtml, controlledBlock) {
  const legacyBlocks = collectLegacyGovernanceBlocks(existingHtml);

  const legacyPreservationBlock = legacyBlocks.length
    ? `\n<section id="ag08g-legacy-governance-preservation" class="ag08g-legacy-governance-preservation" aria-label="Previous governance evidence">\n  <!-- AG08G-LEGACY-GOVERNANCE-PRESERVED -->\n  ${legacyBlocks.join("\n")}\n</section>`
    : "";

  const controlledWithLegacy = controlledBlock.replace(
    "</article>",
    `${legacyPreservationBlock}\n</article>`
  );

  const articleRegex = /<article\b[^>]*>[\s\S]*?<\/article>/i;
  if (articleRegex.test(existingHtml)) {
    return existingHtml.replace(articleRegex, controlledWithLegacy);
  }

  const mainRegex = /(<main\b[^>]*>)([\s\S]*?)(<\/main>)/i;
  if (mainRegex.test(existingHtml)) {
    return existingHtml.replace(mainRegex, `$1\n${controlledWithLegacy}\n$3`);
  }

  const bodyRegex = /<\/body>/i;
  if (bodyRegex.test(existingHtml)) {
    return existingHtml.replace(bodyRegex, `${controlledWithLegacy}\n</body>`);
  }

  return `${existingHtml}\n${controlledWithLegacy}\n`;
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) {
    throw new Error(`Missing required AG08G input ${name}: ${relativePath}`);
  }
}

const ag08fReview = readJson(inputs.ag08fReview);
const ag08fApproval = readJson(inputs.ag08fApproval);
const ag08fApplyPlan = readJson(inputs.ag08fApplyPlan);
const ag08fReadiness = readJson(inputs.ag08fReadiness);
const ag08eDraft = readJson(inputs.ag08eDraft);

const selectedArticlePath = ag08fApplyPlan.ag08g_target_article_path;
const backupRelativePath = ag08fApplyPlan.ag08g_backup_path;

if (!selectedArticlePath) throw new Error("AG08G target article path missing.");
if (!backupRelativePath) throw new Error("AG08G backup path missing.");
if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);

if (selectedArticlePath !== "articles/policy/enhancing-public-healthcare-delivery-digital-innovation.html") {
  throw new Error(`AG08G target path mismatch: ${selectedArticlePath}`);
}

if (ag08fReview.closure_decision?.proceed_to_ag08g_only_with_explicit_user_approval !== true) {
  throw new Error("AG08F did not authorize AG08G handoff.");
}

if (ag08fReadiness.all_readiness_checks_passed !== true) {
  throw new Error("AG08F readiness checks did not pass.");
}

const articleAbs = path.join(root, selectedArticlePath);
const backupAbs = path.join(root, backupRelativePath);

const htmlBefore = fs.readFileSync(articleAbs, "utf8");
const beforeHash = sha256(htmlBefore);

if (beforeHash !== ag08fApproval.selected_article_sha256_before_ag08f) {
  throw new Error("Selected article hash changed after AG08F. Refusing AG08G apply.");
}

if (htmlBefore.includes("AG08G-CONTROLLED-APPLY")) {
  throw new Error("Selected article already contains AG08G marker. Refusing duplicate apply.");
}

ensureDir(backupAbs);
if (fs.existsSync(backupAbs)) {
  const existingBackupHash = sha256(fs.readFileSync(backupAbs, "utf8"));
  if (existingBackupHash !== beforeHash) {
    throw new Error("Existing AG08G backup does not match current pre-apply article hash.");
  }
} else {
  fs.writeFileSync(backupAbs, htmlBefore);
}

const backupHtml = fs.readFileSync(backupAbs, "utf8");
const backupHash = sha256(backupHtml);

if (backupHtml.includes("AG08G-CONTROLLED-APPLY")) {
  throw new Error("AG08G backup must not contain AG08G marker.");
}

const approvedReferences = ag08fApproval.reference_approval?.approved_references || [];
if (approvedReferences.length < 2) {
  throw new Error("AG08G requires at least two approved references.");
}

const draftText = ag08eDraft.draft_candidate?.draft_text || "";
if (!draftText.trim()) throw new Error("AG08E draft text missing.");

const draftHtml = markdownToHtml(draftText);

const referenceHtml = `
<section id="ag08g-approved-references" class="article-references ag08g-approved-references" aria-label="References">
  <!-- AG08G-APPROVED-REFERENCES -->
  <h2>References</h2>
  <ol>
${approvedReferences.map((ref) => `    <li><a href="${escapeAttr(ref.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(ref.title)}</a><br><span>${escapeHtml(ref.source_owner || ref.source_type || "Verified source")}</span></li>`).join("\n")}
  </ol>
</section>`.trim();

const controlledBlock = `
<article id="ag08g-controlled-upgrade" class="drishvara-article ag08g-controlled-upgrade" data-ag08g-controlled-apply="true">
  <!-- AG08G-CONTROLLED-APPLY -->
  ${draftHtml}
  ${referenceHtml}
</article>`.trim();

if (controlledBlock.includes("<img")) {
  throw new Error("AG08G controlled block must not insert images.");
}

let htmlAfter = applyControlledBlock(htmlBefore, controlledBlock);

if (countOccurrences(htmlAfter, "AG08G-CONTROLLED-APPLY") !== 1) {
  throw new Error("AG08G target must contain exactly one controlled apply marker after apply.");
}

if (countOccurrences(htmlAfter, "AG08G-APPROVED-REFERENCES") !== 1) {
  throw new Error("AG08G target must contain exactly one approved references marker after apply.");
}

for (const ref of approvedReferences) {
  if (!htmlAfter.includes(ref.url)) {
    throw new Error(`Approved reference URL not inserted: ${ref.url}`);
  }
}

fs.writeFileSync(articleAbs, htmlAfter);

const afterHtml = fs.readFileSync(articleAbs, "utf8");
const afterHash = sha256(afterHtml);

if (afterHash === beforeHash) {
  throw new Error("AG08G apply did not change the selected article.");
}

const commonFalseControls = {
  multi_article_mutation_performed: false,
  homepage_mutation_performed: false,
  css_mutation_performed: false,
  js_mutation_performed: false,
  visual_generation_performed: false,
  visual_asset_generation_performed: false,
  image_insertion_performed: false,
  production_jsonl_append_performed: false,
  jsonl_append_performed: false,
  jsonl_production_record_created: false,
  database_write_performed: false,
  supabase_write_performed: false,
  supabase_enabled: false,
  auth_enabled: false,
  backend_activation_performed: false,
  backend_auth_supabase_activation_performed: false,
  api_route_created: false,
  public_publishing_performed: false,
  publication_approval_granted: false,
  public_output_activation_performed: false,
  subscriber_output_activation_performed: false,
  admin_output_activation_performed: false,
  payment_activation_performed: false
};

const applyRecord = {
  module_id: "AG08G",
  title: "One-Article Controlled Apply Record",
  status: "one_article_controlled_apply_completed_pending_audit",
  selected_article_path: selectedArticlePath,
  backup_path: backupRelativePath,
  pre_apply_hash: beforeHash,
  post_apply_hash: afterHash,
  backup_hash: backupHash,
  exactly_one_article_file_mutated: true,
  backup_created_before_apply: true,
  ag08g_marker_count_after_apply: countOccurrences(afterHtml, "AG08G-CONTROLLED-APPLY"),
  approved_reference_marker_count_after_apply: countOccurrences(afterHtml, "AG08G-APPROVED-REFERENCES"),
  approved_reference_count_inserted: approvedReferences.length,
  approved_references_inserted: approvedReferences.map((ref) => ({
    reference_id: ref.reference_id,
    title: ref.title,
    url: ref.url,
    insertion_status: "inserted_by_ag08g"
  })),
  visual_scope: {
    visual_generation_performed: false,
    image_insertion_performed: false,
    visual_generation_deferred_to_later_stage: true
  },
  article_mutation_performed: true,
  article_file_write_performed: true,
  target_article_file_write_performed: true,
  reference_insertion_performed: true,
  backup_file_created: true,
  production_readiness_after_ag08g: "one_article_applied_pending_post_apply_audit",
  publish_readiness_after_ag08g: "static_file_changed_not_publish_approved",
  ...commonFalseControls
};

const auditPrep = {
  module_id: "AG08G",
  title: "AG08G Post-Apply Audit Prep",
  status: "post_apply_audit_required",
  selected_article_path: selectedArticlePath,
  backup_path: backupRelativePath,
  pre_apply_hash: beforeHash,
  post_apply_hash: afterHash,
  audit_checks_for_ag08h: [
    "Backup exists and has no AG08G marker.",
    "Target article contains exactly one AG08G marker.",
    "Exactly one selected article file was mutated.",
    "AG08F-approved references are inserted and visible.",
    "No unapproved references are inserted.",
    "No visual/image insertion occurred.",
    "No homepage/CSS/JS mutation occurred.",
    "No JSONL/database/Supabase/backend/Auth/publishing activation occurred.",
    "validate:ag08g passes.",
    "validate:project passes."
  ],
  ag08h_handoff: {
    next_stage_id: "AG08H",
    next_stage_title: "Post-Apply Audit",
    explicit_approval_required: true,
    selected_article_path: selectedArticlePath,
    allowed_scope: "audit AG08G article mutation, backup, marker scope, references and forbidden-system guards",
    blocked_scope: "new article mutation, visual generation, image insertion, JSONL/database/Supabase/backend/Auth/publishing activation"
  },
  ...commonFalseControls
};

const summary = {
  selected_article_path: selectedArticlePath,
  backup_path: backupRelativePath,
  backup_created_before_apply: true,
  exactly_one_article_file_mutated: true,
  article_mutation_performed: true,
  article_file_write_performed: true,
  target_article_file_write_performed: true,
  reference_insertion_performed: true,
  approved_reference_count_inserted: approvedReferences.length,
  ag08g_marker_count_after_apply: countOccurrences(afterHtml, "AG08G-CONTROLLED-APPLY"),
  approved_reference_marker_count_after_apply: countOccurrences(afterHtml, "AG08G-APPROVED-REFERENCES"),
  visual_generation_performed: false,
  image_insertion_performed: false,
  production_jsonl_append_performed: false,
  database_write_performed: false,
  supabase_write_performed: false,
  backend_auth_supabase_activation_performed: false,
  publishing_performed: false,
  next_stage_id: "AG08H",
  next_stage_title: "Post-Apply Audit",
  next_stage_requires_explicit_approval: true,
  production_readiness_after_ag08g: "one_article_applied_pending_post_apply_audit",
  publish_readiness_after_ag08g: "static_file_changed_not_publish_approved"
};

const schema = {
  module_id: "AG08G",
  title: "One-Article Controlled Apply Schema",
  status: "schema_one_article_controlled_apply",
  selected_article_mutation_allowed_in_ag08g: true,
  backup_creation_allowed_in_ag08g: true,
  approved_reference_insertion_allowed_in_ag08g: true,
  visual_generation_allowed_in_ag08g: false,
  image_insertion_allowed_in_ag08g: false,
  multi_article_mutation_allowed_in_ag08g: false,
  homepage_mutation_allowed_in_ag08g: false,
  css_js_mutation_allowed_in_ag08g: false,
  production_jsonl_append_allowed_in_ag08g: false,
  database_write_allowed_in_ag08g: false,
  supabase_write_allowed_in_ag08g: false,
  backend_auth_supabase_allowed_in_ag08g: false,
  publishing_allowed_in_ag08g: false
};

const review = {
  module_id: "AG08G",
  title: "One-Article Controlled Apply",
  status: "one_article_controlled_apply_completed",
  depends_on: ["AG08F", "AG08E"],
  generated_from: inputs,
  summary,
  apply_record_file: "data/content-intelligence/apply-records/ag08g-one-article-controlled-apply.json",
  audit_prep_file: "data/content-intelligence/quality-registry/ag08g-post-apply-audit-prep.json",
  schema_file: "data/content-intelligence/schema/one-article-controlled-apply-ag08g.schema.json",
  learning_file: "data/content-intelligence/learning/ag08g-one-article-controlled-apply-learning.json",
  closure_decision: {
    decision: "ag08g_one_article_apply_completed_pending_ag08h_audit",
    proceed_to_ag08h_only_with_explicit_user_approval: true,
    selected_article_path: selectedArticlePath,
    article_mutation_performed: true,
    backup_file_created: true,
    reference_insertion_performed: true,
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
  ...commonFalseControls
};

const learning = {
  module_id: "AG08G",
  title: "One-Article Controlled Apply Learning",
  status: "learning_record_only",
  summary,
  ag08g_learning_points: [
    "The first real mutation should remain limited to one article file.",
    "Backup must exist before target mutation.",
    "Approved references can be inserted only from AG08F approval record.",
    "Visual generation should remain deferred to reduce pilot mutation risk.",
    "Post-apply audit is mandatory before closure."
  ],
  ...commonFalseControls
};

const registry = {
  module_id: "AG08G",
  title: "One-Article Controlled Apply",
  status: "one_article_applied_pending_audit",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag08g-one-article-controlled-apply.json",
    apply_record: "data/content-intelligence/apply-records/ag08g-one-article-controlled-apply.json",
    audit_prep: "data/content-intelligence/quality-registry/ag08g-post-apply-audit-prep.json",
    schema: "data/content-intelligence/schema/one-article-controlled-apply-ag08g.schema.json",
    learning: "data/content-intelligence/learning/ag08g-one-article-controlled-apply-learning.json",
    preview: "data/quality/ag08g-one-article-controlled-apply-preview.json",
    document: "docs/quality/AG08G_ONE_ARTICLE_CONTROLLED_APPLY.md"
  },
  summary,
  ...commonFalseControls
};

const preview = {
  module_id: "AG08G",
  preview_only: true,
  status: "one_article_applied_pending_audit",
  summary,
  selected_article_path: selectedArticlePath,
  backup_path: backupRelativePath,
  inserted_reference_urls: approvedReferences.map((ref) => ref.url),
  ag08h_handoff: auditPrep.ag08h_handoff,
  ...commonFalseControls
};

const doc = `# AG08G — One-Article Controlled Apply

## Purpose

AG08G creates a pre-apply backup and mutates exactly one selected article file using the AG08E approved draft and AG08F approved references.

## Selected Article

- Path: \`${selectedArticlePath}\`
- Backup: \`${backupRelativePath}\`
- Pre-apply hash: \`${beforeHash}\`
- Post-apply hash: \`${afterHash}\`

## Applied Scope

- Exactly one article file was mutated.
- Approved AG08F references were inserted.
- One AG08G controlled apply marker was added.
- No visual generation or image insertion was performed.
- No homepage, CSS, JS, JSONL, database, Supabase, backend/Auth or publishing activation was performed.

## Next Stage

AG08H — Post-Apply Audit — is required before closure.
`;

writeJson(reviewPath, review);
writeJson(applyRecordPath, applyRecord);
writeJson(auditPrepPath, auditPrep);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG08G one-article controlled apply completed.");
console.log(`✅ Backup created: ${backupRelativePath}`);
console.log(`✅ Mutated article: ${selectedArticlePath}`);
console.log(`✅ Approved references inserted: ${approvedReferences.length}`);
console.log("✅ Visual generation and image insertion were not performed.");
