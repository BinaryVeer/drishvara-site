import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const articlePath = "articles/policy/enhancing-public-healthcare-delivery-digital-innovation.html";
const ag12cApplyPath = "data/content-intelligence/apply-records/ag12c-controlled-layout-refinement-apply.json";
const backupPath = "data/content-intelligence/backups/ag12c-r1-pre-public-object-label-layout-repair.html";

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag12c-r1-public-object-label-layout-repair.json",
  apply: "data/content-intelligence/apply-records/ag12c-r1-public-object-label-layout-repair.json",
  treatment: "data/content-intelligence/object-registry/ag12c-r1-public-object-layout-treatment-record.json",
  audit: "data/content-intelligence/audit-records/ag12c-r1-public-object-label-layout-repair-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag12c-r1-public-object-label-layout-repair-readiness-record.json",
  registry: "data/quality/ag12c-r1-public-object-label-layout-repair.json",
  preview: "data/quality/ag12c-r1-public-object-label-layout-repair-preview.json",
  doc: "docs/quality/AG12C_R1_PUBLIC_OBJECT_LABEL_LAYOUT_REPAIR.md"
};

function full(p) {
  return path.join(root, p);
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(full(p), "utf8"));
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

function count(text, needle) {
  return text.split(needle).length - 1;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replacePilotBlock(html, family, oldTitle, newTitle) {
  const re = new RegExp(
    `<details\\s+class="drishvara-layout-refinement ag12c-collapsed-pilot-object"\\s+data-drishvara-stage="AG12C"\\s+data-drishvara-layout-treatment="collapsed-pilot-annex"\\s+data-object-family="${family}"\\s+style="[^"]*">\\s*` +
    `<summary[^>]*>${escapeRegExp(oldTitle)}</summary>\\s*` +
    `<div style="margin-top:1rem;">\\s*([\\s\\S]*?)\\s*</div>\\s*</details>`,
    "m"
  );

  if (!re.test(html)) {
    if (
      html.includes(`data-drishvara-stage="AG12C-R1"`) &&
      html.includes(`data-object-family="${family}"`) &&
      html.includes(newTitle)
    ) {
      return html;
    }
    throw new Error(`Expected AG12C pilot block not found for ${family}`);
  }

  return html.replace(re, (_match, inner) => {
    return `<section class="drishvara-layout-refinement ag12c-r1-reader-facing-object-block" data-drishvara-stage="AG12C-R1" data-drishvara-layout-treatment="reader-facing-object" data-object-family="${family}" style="max-width:940px;margin:2.2rem auto;border:1px solid rgba(182,208,233,0.95);border-radius:18px;background:#F7FAFC;padding:1rem 1rem 1.15rem;">
  <h2 class="drishvara-ag12c-r1-object-title" style="margin:0 0 1rem;font-size:1.15rem;line-height:1.35;color:#17324d;text-align:left;">${newTitle}</h2>
  <div class="drishvara-ag12c-r1-object-body" style="margin-top:0;">
${inner.trim()}
  </div>
</section>`;
  });
}

if (!fs.existsSync(full(articlePath))) throw new Error(`Missing article: ${articlePath}`);
if (!fs.existsSync(full(ag12cApplyPath))) throw new Error(`Missing AG12C apply record: ${ag12cApplyPath}`);

const ag12cApply = readJson(ag12cApplyPath);
let html = fs.readFileSync(full(articlePath), "utf8");
const beforeHtml = html;
const beforeHash = sha256(beforeHtml);

if (!fs.existsSync(full(backupPath))) {
  writeText(backupPath, beforeHtml);
}

html = replacePilotBlock(html, "INFOGRAPHIC", "Additional pilot object: infographic service-flow view", "Service-flow view");
html = replacePilotBlock(html, "FIGURE_DIAGRAM", "Additional pilot object: feedback-loop diagram", "Digital feedback loop");
html = replacePilotBlock(html, "MAP_GEOGRAPHIC_OBJECT", "Additional pilot object: schematic geographic-access view", "Schematic geographic-access view");

if (html.includes("Additional pilot object:")) throw new Error("Internal pilot object label still present.");
if (html.includes('data-drishvara-layout-treatment="collapsed-pilot-annex"')) throw new Error("Collapsed pilot annex treatment still present.");
if (html.includes("ag12c-collapsed-pilot-object")) throw new Error("Collapsed pilot object class still present.");

const readerFacingCount = count(html, 'data-drishvara-layout-treatment="reader-facing-object"');
if (readerFacingCount !== 3) throw new Error(`Expected three reader-facing object blocks; found ${readerFacingCount}.`);

for (const marker of [
  "<!-- AG10K-GENERATED-IMAGE-INSERTION:START -->",
  "<!-- AG11B-CHART-BI-GRAPH-INSERTION:START -->",
  "<!-- AG11C-INFOGRAPHIC-INSERTION:START -->",
  "<!-- AG11D-FIGURE-DIAGRAM-INSERTION:START -->",
  "<!-- AG11E-TABLE-STRUCTURED-OBJECT-INSERTION:START -->",
  "<!-- AG11F-MAP-GEOGRAPHIC-OBJECT-INSERTION:START -->",
  "<!-- AG11G-ARTICLE-SUPPORT-COMPOSITE-OBJECT-INSERTION:START -->"
]) {
  if (count(html, marker) !== 1) throw new Error(`Governed object marker missing or duplicated: ${marker}`);
}

fs.writeFileSync(full(articlePath), html);
const afterHash = sha256(html);

const base = {
  module_id: "AG12C-R1",
  title: "Public Object Label and Layout Repair",
  selected_article_path: articlePath,
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  source_module_corrected: "AG12C",
  source_apply_record: ag12cApplyPath,
  pre_repair_hash: ag12cApply.post_refinement_hash,
  observed_pre_repair_hash_at_runtime: beforeHash,
  post_repair_hash: afterHash,
  backup_path: backupPath,
  repair_scope: [
    "Replace reader-visible internal pilot labels.",
    "Convert collapsed pilot annex wrappers into reader-facing object blocks.",
    "Preserve all governed inserted article objects.",
    "Do not generate new object assets.",
    "Do not remove object assets.",
    "Do not change references, image assets, external URLs, database, backend, Supabase, Auth or deployment."
  ],
  object_generation_performed: false,
  new_object_inserted: false,
  existing_object_removed: false,
  reference_fetch_performed: false,
  image_generation_performed: false,
  public_publishing_operation_performed: false,
  database_write_performed: false,
  backend_auth_supabase_activation_performed: false,
  service_role_key_exposed: false
};

const apply = {
  ...base,
  status: "public_object_label_layout_repair_applied",
  reader_facing_object_count_after_repair: readerFacingCount,
  internal_pilot_labels_removed: true,
  collapsed_pilot_annex_removed: true,
  original_governed_object_markers_preserved: true,
  article_mutation_performed_in_ag12c_r1: true
};

const treatment = {
  ...base,
  status: "reader_facing_object_layout_treatment_recorded",
  previous_treatment: "collapsed-pilot-annex",
  repaired_treatment: "reader-facing-object",
  repaired_titles: [
    "Service-flow view",
    "Digital feedback loop",
    "Schematic geographic-access view"
  ],
  reader_facing_object_count_after_repair: readerFacingCount,
  all_planned_objects_preserved: true
};

const audit = {
  ...base,
  status: "public_object_label_layout_repair_audit_passed",
  checks: [
    { check_id: "no_additional_pilot_object_label", passed: true },
    { check_id: "no_collapsed_pilot_annex_public_treatment", passed: true },
    { check_id: "three_reader_facing_blocks", passed: true },
    { check_id: "governed_object_markers_preserved_once", passed: true },
    { check_id: "no_object_generation", passed: true },
    { check_id: "no_object_removal", passed: true },
    { check_id: "no_backend_or_database_activation", passed: true },
    { check_id: "no_public_publish", passed: true }
  ],
  failed_checks: []
};

const readiness = {
  ...base,
  status: "ready_for_ar01_credit_reference_surface_cleanup",
  ready_for_next_repair: true,
  next_repair_candidate: "AR01-R1 / AG05D-R2 credit and reference surface cleanup",
  ag43c_should_consume_not_duplicate: true
};

const review = {
  ...base,
  status: "public_object_label_layout_repair_complete",
  apply_record: outputs.apply,
  treatment_record: outputs.treatment,
  audit_record: outputs.audit,
  readiness_record: outputs.readiness
};

const preview = {
  module_id: "AG12C-R1",
  status: review.status,
  reader_facing_object_count_after_repair: readerFacingCount,
  internal_pilot_labels_removed: 1,
  collapsed_pilot_annex_removed: 1,
  original_governed_object_markers_preserved: 1,
  object_generation_performed: 0,
  existing_object_removed: 0,
  public_publishing_operation_performed: 0,
  database_write_performed: 0,
  backend_auth_supabase_activation_performed: 0,
  service_role_key_exposed: 0
};

const doc = `# AG12C-R1 — Public Object Label and Layout Repair

## Result

AG12C-R1 corrects the existing AG12C layout-refinement output.

## What changed

- Removed reader-visible internal labels beginning with “Additional pilot object”.
- Replaced collapsed pilot annex wrappers with reader-facing object blocks.
- Preserved infographic, feedback-loop diagram and schematic geographic-access object.
- Preserved all AG10K and AG11B–AG11G governed object markers.

## What did not change

- No object generation.
- No object removal.
- No reference fetch.
- No image generation.
- No database write.
- No backend/Auth/Supabase activation.
- No deployment.
- No public publishing operation.

## Next

AR01-R1 / AG05D-R2 should correct credit/reference surface language separately.
`;

writeJson(outputs.apply, apply);
writeJson(outputs.treatment, treatment);
writeJson(outputs.audit, audit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.review, review);
writeJson(outputs.registry, review);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG12C-R1 public object label/layout repair applied.");
console.log("✅ Internal pilot labels removed.");
console.log("✅ Three reader-facing object blocks created.");
console.log("✅ Governed objects preserved; no object generation/removal/publish/database/backend activation performed.");
