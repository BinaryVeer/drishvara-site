import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const articlePath = "articles/policy/enhancing-public-healthcare-delivery-digital-innovation.html";
const backupPath = "data/content-intelligence/backups/ar01-r1-pre-credit-reference-surface-cleanup.html";

const outputs = {
  review: "data/content-intelligence/quality-reviews/ar01-r1-credit-reference-surface-cleanup.json",
  apply: "data/content-intelligence/apply-records/ar01-r1-credit-reference-surface-cleanup.json",
  creditPolicy: "data/content-intelligence/credit-reference/ar01-r1-drishvara-editorial-synthesis-credit-policy.json",
  audit: "data/content-intelligence/audit-records/ar01-r1-credit-reference-surface-cleanup-audit.json",
  readiness: "data/content-intelligence/quality-registry/ar01-r1-credit-reference-surface-cleanup-readiness-record.json",
  registry: "data/quality/ar01-r1-credit-reference-surface-cleanup.json",
  preview: "data/quality/ar01-r1-credit-reference-surface-cleanup-preview.json",
  doc: "docs/quality/AR01_R1_CREDIT_REFERENCE_SURFACE_CLEANUP.md"
};

function full(p) {
  return path.join(root, p);
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

if (!fs.existsSync(full(articlePath))) throw new Error(`Missing article: ${articlePath}`);

let html = fs.readFileSync(full(articlePath), "utf8");
const beforeHtml = html;
const beforeHash = sha256(beforeHtml);

if (!fs.existsSync(full(backupPath))) {
  writeText(backupPath, beforeHtml);
}

const replacements = [
  [
    /Visual: Drishvara editorial illustration\./g,
    "Visual: Drishvara editorial synthesis."
  ],
  [
    /Visual: Drishvara\./g,
    "Visual: Drishvara editorial synthesis."
  ],
  [
    /Chart: Drishvara\. Source: article-text theme count\./g,
    "Chart: Drishvara editorial synthesis. Basis: deterministic article-text term count."
  ],
  [
    /Infographic: Drishvara\. Source: article-derived conceptual synthesis\./g,
    "Infographic: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation."
  ],
  [
    /Diagram: Drishvara\. Source: article-derived conceptual synthesis\./g,
    "Diagram: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation."
  ],
  [
    /Table: Drishvara\. Source: article-derived conceptual synthesis\./g,
    "Table: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation."
  ],
  [
    /Map: Drishvara\. Source: article-derived conceptual synthesis\./g,
    "Map: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation."
  ],
  [
    /Composite: Drishvara\. Source: article-derived conceptual synthesis\./g,
    "Composite: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation."
  ],
  [
    /Image credit \/ attribution:\s*Drishvara editorial visual[^<\n]*/g,
    "Visual: Drishvara editorial synthesis."
  ],
  [
    /\s*Final image-source attribution, where applicable, is under editorial verification\./g,
    ""
  ]
];

let replacementCount = 0;
for (const [pattern, replacement] of replacements) {
  const matches = html.match(pattern);
  if (matches) replacementCount += matches.length;
  html = html.replace(pattern, replacement);
}

if (replacementCount < 3) {
  throw new Error(`Expected at least 3 credit-reference replacements; found ${replacementCount}`);
}

const badPhrases = [
  "Final image-source attribution",
  "Image credit / attribution:",
  "Visual: Drishvara.</small>",
  "Chart: Drishvara. Source:"
];

for (const phrase of badPhrases) {
  if (html.includes(phrase)) throw new Error(`Public credit cleanup failed; phrase remains: ${phrase}`);
}

const requiredGoodPhrases = [
  "Visual: Drishvara editorial synthesis.",
  "Chart: Drishvara editorial synthesis. Basis: deterministic article-text term count.",
  "Infographic: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation.",
  "Diagram: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation.",
  "Table: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation."
];

for (const phrase of requiredGoodPhrases) {
  if (!html.includes(phrase)) throw new Error(`Expected cleaned credit phrase missing: ${phrase}`);
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
  if (count(html, marker) !== 1) throw new Error(`Governed object marker missing or duplicated: ${marker}`);
}

fs.writeFileSync(full(articlePath), html);
const afterHash = sha256(html);

const base = {
  module_id: "AR01-R1",
  title: "Credit and Reference Surface Cleanup",
  selected_article_path: articlePath,
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  source_module_corrected: "AR01 / AG05D family",
  pre_repair_hash: beforeHash,
  post_repair_hash: afterHash,
  backup_path: backupPath,
  replacement_count: replacementCount,
  repair_scope: [
    "Normalize Drishvara-created visual/object credits.",
    "Remove unnecessary final image-source attribution-under-verification wording for Drishvara-created visuals.",
    "Preserve existing reference governance.",
    "Preserve all governed article objects and insertion markers.",
    "Do not fetch references.",
    "Do not generate images.",
    "Do not remove objects.",
    "Do not publish, deploy, write database records, activate backend/Auth/Supabase or expose service-role keys."
  ],
  article_mutation_performed_in_ar01_r1: true,
  reference_fetch_performed: false,
  external_link_verification_performed: false,
  image_generation_performed: false,
  object_generation_performed: false,
  existing_object_removed: false,
  public_publishing_operation_performed: false,
  database_write_performed: false,
  deployment_performed: false,
  backend_auth_supabase_activation_performed: false,
  service_role_key_exposed: false
};

const apply = {
  ...base,
  status: "credit_reference_surface_cleanup_applied",
  cleaned_credit_phrases_present: true,
  final_image_source_under_verification_phrase_removed_where_drishvara_created: true,
  governed_object_markers_preserved: true
};

const creditPolicy = {
  ...base,
  status: "drishvara_editorial_synthesis_credit_policy_recorded",
  policy: {
    drishvara_created_visuals: "Use concise Drishvara editorial synthesis credit.",
    deterministic_charts: "Mention deterministic article-text basis and avoid implying an external statistical dataset.",
    article_derived_objects: "Mention article-derived conceptual interpretation.",
    third_party_assets: "Use explicit source/licence attribution; if incomplete, mark under editorial verification.",
    references: "Reference verification may remain under editorial review until the dedicated reference-verification stage."
  },
  approved_public_credit_examples: [
    "Visual: Drishvara editorial synthesis.",
    "Chart: Drishvara editorial synthesis. Basis: deterministic article-text term count.",
    "Infographic: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation."
  ]
};

const audit = {
  ...base,
  status: "credit_reference_surface_cleanup_audit_passed",
  checks: [
    { check_id: "drishvara_visual_credit_normalized", passed: true },
    { check_id: "chart_basis_normalized", passed: true },
    { check_id: "article_derived_object_basis_normalized", passed: true },
    { check_id: "final_image_source_under_verification_removed_for_drishvara_created_visuals", passed: true },
    { check_id: "governed_object_markers_preserved", passed: true },
    { check_id: "no_reference_fetch", passed: true },
    { check_id: "no_image_generation", passed: true },
    { check_id: "no_object_removal", passed: true },
    { check_id: "no_publish_or_deployment", passed: true },
    { check_id: "no_backend_auth_supabase_activation", passed: true }
  ],
  failed_checks: []
};

const readiness = {
  ...base,
  status: "ready_for_ag43c_quality_longform_readiness_integration",
  ready_for_ag43c: true,
  next_stage_candidate: "AG43C — Article Quality and Long-form Readiness Integration",
  ag43c_instruction: "Consume this AR01-R1 correction as existing credit/reference governance. Do not duplicate the module."
};

const review = {
  ...base,
  status: "credit_reference_surface_cleanup_complete",
  apply_record: outputs.apply,
  credit_policy_record: outputs.creditPolicy,
  audit_record: outputs.audit,
  readiness_record: outputs.readiness
};

const preview = {
  module_id: "AR01-R1",
  status: review.status,
  replacement_count: replacementCount,
  cleaned_credit_phrases_present: 1,
  bad_credit_phrases_removed: 1,
  governed_object_markers_preserved: 1,
  reference_fetch_performed: 0,
  image_generation_performed: 0,
  existing_object_removed: 0,
  public_publishing_operation_performed: 0,
  database_write_performed: 0,
  deployment_performed: 0,
  backend_auth_supabase_activation_performed: 0,
  service_role_key_exposed: 0
};

const doc = `# AR01-R1 — Credit and Reference Surface Cleanup

## Result

AR01-R1 corrects the public credit/reference surface for Drishvara-created article visuals and objects.

## What changed

- Drishvara-created visuals now use concise editorial synthesis credit.
- Deterministic charts now state the article-text basis.
- Article-derived objects now state conceptual interpretation basis.
- Unnecessary final image-source attribution-under-verification wording is removed where the visual is Drishvara-created.

## What did not change

- No reference fetch.
- No external link verification.
- No image generation.
- No object generation.
- No object removal.
- No public publishing operation.
- No deployment.
- No database write.
- No backend/Auth/Supabase activation.

## Next

AG43C should consume this as existing credit/reference governance and avoid duplicating the AR01 module.
`;

writeJson(outputs.apply, apply);
writeJson(outputs.creditPolicy, creditPolicy);
writeJson(outputs.audit, audit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.review, review);
writeJson(outputs.registry, review);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AR01-R1 credit/reference surface cleanup applied.");
console.log("✅ Drishvara-created visual/object credits normalized.");
console.log("✅ Governed object markers preserved.");
console.log("✅ Ready for AG43C quality and long-form readiness integration.");
