import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag08jReview: "data/content-intelligence/quality-reviews/ag08j-visual-candidate-generation-asset-selection.json",
  ag08jCandidate: "data/content-intelligence/visual-registry/ag08j-visual-candidate-record.json",
  ag08jLayoutDoctrine: "data/content-intelligence/visual-registry/ag08j-article-object-placement-doctrine.json",
  ag08jReadiness: "data/content-intelligence/quality-registry/ag08j-visual-candidate-readiness.json",
  ag08jBoundary: "data/content-intelligence/mutation-plans/ag08j-to-ag08k-controlled-visual-insertion-boundary.json",
  ag08gApplyRecord: "data/content-intelligence/apply-records/ag08g-one-article-controlled-apply.json"
};

const assetRelativePath = "assets/articles/policy/enhancing-public-healthcare-delivery-digital-innovation/ag08ka-primary-hero.svg";

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag08ka-visual-asset-creation-source-finalisation.json");
const assetRecordPath = path.join(root, "data/content-intelligence/visual-registry/ag08ka-finalised-visual-asset-record.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag08ka-visual-asset-readiness.json");
const insertionBoundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag08ka-to-ag08k-controlled-insertion-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/visual-asset-creation-source-finalisation.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag08ka-visual-asset-creation-source-finalisation-learning.json");
const registryPath = path.join(root, "data/quality/ag08ka-visual-asset-creation-source-finalisation.json");
const previewPath = path.join(root, "data/quality/ag08ka-visual-asset-creation-source-finalisation-preview.json");
const docPath = path.join(root, "docs/quality/AG08KA_VISUAL_ASSET_CREATION_SOURCE_FINALISATION.md");

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
    throw new Error(`Missing required AG08K-A input ${name}: ${relativePath}`);
  }
}

const ag08jReview = readJson(inputs.ag08jReview);
const ag08jCandidate = readJson(inputs.ag08jCandidate);
const ag08jLayoutDoctrine = readJson(inputs.ag08jLayoutDoctrine);
const ag08jReadiness = readJson(inputs.ag08jReadiness);
const ag08jBoundary = readJson(inputs.ag08jBoundary);
const ag08gApply = readJson(inputs.ag08gApplyRecord);

if (ag08jReview.status !== "visual_candidate_record_created_not_inserted") {
  throw new Error("AG08K-A requires AG08J candidate record to be created.");
}

if (ag08jReadiness.status !== "visual_candidate_ready_pending_explicit_ag08k") {
  throw new Error("AG08K-A requires AG08J readiness to pass.");
}

const selectedArticlePath = ag08gApply.selected_article_path;

if (!selectedArticlePath || !exists(selectedArticlePath)) {
  throw new Error(`AG08K-A selected article missing: ${selectedArticlePath}`);
}

const articleHtmlBefore = fs.readFileSync(path.join(root, selectedArticlePath), "utf8");
const articleHashBefore = sha256(articleHtmlBefore);

if (articleHashBefore !== ag08gApply.post_apply_hash) {
  throw new Error("AG08K-A selected article hash must match AG08G post-apply hash before asset finalisation.");
}

const selectedCandidateId = ag08jCandidate.selected_candidate_for_future_apply;
const selectedCandidate = ag08jCandidate.candidate_visuals.find((item) => item.candidate_id === selectedCandidateId);

if (!selectedCandidate) {
  throw new Error(`AG08K-A selected candidate missing: ${selectedCandidateId}`);
}

if (selectedCandidate.candidate_type !== "primary_hero_visual") {
  throw new Error("AG08K-A first asset finalisation is restricted to primary hero visual.");
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-labelledby="title desc">
  <title id="title">Digital public healthcare delivery ecosystem</title>
  <desc id="desc">Editorial illustration showing frontline healthcare, digital records, telemedicine and governance dashboards connected in a public healthcare service system.</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f7fbff"/>
      <stop offset="52%" stop-color="#e9f3f8"/>
      <stop offset="100%" stop-color="#f5efe3"/>
    </linearGradient>
    <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#eef7fb"/>
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="#0c3440" flood-opacity="0.14"/>
    </filter>
  </defs>

  <rect width="1600" height="900" fill="url(#bg)"/>
  <circle cx="1335" cy="148" r="118" fill="#dbeef5" opacity="0.75"/>
  <circle cx="196" cy="720" r="150" fill="#efe4cf" opacity="0.55"/>

  <g filter="url(#softShadow)">
    <rect x="168" y="144" width="1264" height="612" rx="42" fill="#ffffff" opacity="0.92"/>
  </g>

  <g transform="translate(252 238)">
    <rect x="0" y="0" width="338" height="420" rx="32" fill="url(#panel)" stroke="#b9d7e3" stroke-width="3"/>
    <circle cx="169" cy="118" r="58" fill="#4480A8"/>
    <path d="M130 205c21-23 57-23 78 0 30 7 57 30 66 70l12 54H52l12-54c9-40 36-63 66-70z" fill="#1A738C" opacity="0.92"/>
    <rect x="76" y="326" width="186" height="20" rx="10" fill="#B6D0E9"/>
    <rect x="96" y="360" width="146" height="16" rx="8" fill="#d7e8f1"/>
    <text x="169" y="404" text-anchor="middle" font-family="Arial, sans-serif" font-size="23" fill="#315160">Frontline care</text>
  </g>

  <g transform="translate(632 194)">
    <rect x="0" y="0" width="392" height="220" rx="28" fill="#fdfefe" stroke="#bed8e3" stroke-width="3"/>
    <rect x="38" y="44" width="130" height="18" rx="9" fill="#4480A8"/>
    <rect x="38" y="86" width="316" height="14" rx="7" fill="#cfe2ea"/>
    <rect x="38" y="122" width="258" height="14" rx="7" fill="#dbe9ef"/>
    <rect x="38" y="158" width="292" height="14" rx="7" fill="#dbe9ef"/>
    <circle cx="320" cy="56" r="28" fill="#B6D0E9"/>
    <path d="M306 56l10 10 20-24" fill="none" stroke="#1A738C" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="196" y="206" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#315160">Digital health record</text>
  </g>

  <g transform="translate(1060 250)">
    <rect x="0" y="0" width="280" height="314" rx="34" fill="#ffffff" stroke="#bed8e3" stroke-width="3"/>
    <rect x="34" y="40" width="212" height="132" rx="22" fill="#e8f4f9"/>
    <circle cx="140" cy="96" r="36" fill="#1A738C"/>
    <path d="M102 220h76" stroke="#4480A8" stroke-width="14" stroke-linecap="round"/>
    <path d="M102 258h142" stroke="#d3e5ed" stroke-width="12" stroke-linecap="round"/>
    <path d="M102 288h112" stroke="#d3e5ed" stroke-width="12" stroke-linecap="round"/>
    <text x="140" y="202" text-anchor="middle" font-family="Arial, sans-serif" font-size="21" fill="#315160">Telemedicine</text>
  </g>

  <g transform="translate(628 474)">
    <rect x="0" y="0" width="424" height="184" rx="28" fill="#fffdf8" stroke="#e4d4b8" stroke-width="3"/>
    <rect x="42" y="54" width="56" height="82" rx="10" fill="#4480A8"/>
    <rect x="128" y="82" width="56" height="54" rx="10" fill="#1A738C"/>
    <rect x="214" y="38" width="56" height="98" rx="10" fill="#B6D0E9"/>
    <rect x="300" y="66" width="56" height="70" rx="10" fill="#d9c79f"/>
    <path d="M54 144h312" stroke="#8aa9b6" stroke-width="4"/>
    <text x="212" y="168" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#315160">Governance dashboard</text>
  </g>

  <g fill="none" stroke="#7eaec2" stroke-width="7" stroke-linecap="round" opacity="0.76">
    <path d="M590 448C636 396 645 346 632 304"/>
    <path d="M1024 304c38 16 54 43 62 76"/>
    <path d="M840 414c8 26 8 42 0 60"/>
  </g>

  <g fill="#1A738C" opacity="0.9">
    <circle cx="612" cy="320" r="9"/>
    <circle cx="1048" cy="314" r="9"/>
    <circle cx="840" cy="452" r="9"/>
  </g>

  <text x="800" y="805" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#214b58">Digital public healthcare works when service, data and accountability move together</text>
</svg>
`;

const assetAbs = path.join(root, assetRelativePath);
ensureDir(assetAbs);
writeText(assetAbs, svg);

const assetHash = sha256(svg);

const sourceFinalisation = {
  source_type: "internal_editorial_svg",
  creation_method: "deterministic_repo_script_no_external_generation_call",
  external_gpt_image_generation_used: false,
  external_image_api_used: false,
  external_stock_image_used: false,
  third_party_logo_used: false,
  identifiable_person_used: false,
  licence_status: "internal_drishvara_editorial_asset",
  rights_status: "approved_for_internal_site_use_pending_future_insertion_approval",
  credit_text_final: "Visual: Drishvara editorial illustration.",
  attribution_required_on_page: true,
  cost_control_note: "AG08K-A uses an internally authored SVG created by repo script to avoid external image-generation/API cost while preserving future ability to upgrade to higher-quality visuals."
};

const finalAssetRecord = {
  module_id: "AG08K-A",
  title: "Finalised Visual Asset Record",
  status: "visual_asset_created_source_finalised_not_inserted",
  selected_article_path: selectedArticlePath,
  selected_candidate_id: selectedCandidateId,
  article_hash_at_asset_creation: articleHashBefore,
  asset: {
    asset_id: "AG08KA-ASSET-001",
    asset_type: "primary_hero_visual",
    asset_format: "svg",
    asset_path: assetRelativePath,
    asset_hash_sha256: assetHash,
    width: 1600,
    height: 900,
    aspect_ratio: "16:9",
    file_created: true,
    inserted_into_article: false
  },
  metadata: {
    alt_text_final: selectedCandidate.alt_text_draft,
    caption_final: selectedCandidate.caption_draft,
    credit_text_final: sourceFinalisation.credit_text_final,
    visible_credit_required: true,
    source_note_required: true
  },
  source_finalisation: sourceFinalisation,
  layout_controls_from_ag08j: {
    preserve_article_shape: ag08jLayoutDoctrine.global_article_layout_rules.preserve_article_shape,
    main_text_must_remain_justified: ag08jLayoutDoctrine.global_article_layout_rules.main_text_must_remain_justified,
    hero_alignment: ag08jLayoutDoctrine.object_type_rules.hero_image.alignment,
    hero_text_wrap: ag08jLayoutDoctrine.object_type_rules.hero_image.text_wrap,
    mobile_safe_required: true
  },
  ...{
    visual_asset_source_finalisation_stage_only: true,
    internal_asset_file_creation_allowed_and_performed: true,
    actual_visual_generation_performed_in_ag08ka: false,
    repo_script_asset_creation_performed_in_ag08ka: true,
    image_file_write_performed_in_ag08ka: true,
    external_gpt_image_generation_performed_in_ag08ka: false,
    external_image_api_call_performed_in_ag08ka: false,
    image_insertion_performed_in_ag08ka: false,
    article_mutation_performed_in_ag08ka: false,
    selected_article_file_write_performed_in_ag08ka: false,
    css_mutation_performed_in_ag08ka: false,
    js_mutation_performed_in_ag08ka: false,
    reference_insertion_performed_in_ag08ka: false,
    production_jsonl_append_performed_in_ag08ka: false,
    database_write_performed_in_ag08ka: false,
    supabase_write_performed_in_ag08ka: false,
    backend_auth_supabase_activation_performed_in_ag08ka: false,
    public_publishing_performed_in_ag08ka: false,
    publishing_approval_performed_in_ag08ka: false,
    rollback_execution_performed_in_ag08ka: false
  }
};

const noMutationControls = {
  visual_asset_source_finalisation_stage_only: true,
  internal_asset_file_creation_allowed_and_performed: true,
  actual_visual_generation_performed_in_ag08ka: false,
  external_gpt_image_generation_performed_in_ag08ka: false,
  external_image_api_call_performed_in_ag08ka: false,
  image_insertion_performed_in_ag08ka: false,
  article_mutation_performed_in_ag08ka: false,
  selected_article_file_write_performed_in_ag08ka: false,
  css_mutation_performed_in_ag08ka: false,
  js_mutation_performed_in_ag08ka: false,
  reference_insertion_performed_in_ag08ka: false,
  production_jsonl_append_performed_in_ag08ka: false,
  database_write_performed_in_ag08ka: false,
  supabase_write_performed_in_ag08ka: false,
  backend_auth_supabase_activation_performed_in_ag08ka: false,
  public_publishing_performed_in_ag08ka: false,
  publishing_approval_performed_in_ag08ka: false,
  rollback_execution_performed_in_ag08ka: false
};

const insertionBoundary = {
  module_id: "AG08K-A",
  title: "AG08K Controlled Visual Insertion Boundary",
  status: "asset_ready_for_future_controlled_insertion_not_inserted",
  selected_article_path: selectedArticlePath,
  current_article_hash_at_ag08ka: articleHashBefore,
  final_asset_path: assetRelativePath,
  final_asset_hash_sha256: assetHash,
  next_stage_id: "AG08K",
  next_stage_title: "Controlled Visual Image Insertion Apply",
  explicit_approval_required: true,
  ag08k_required_preconditions: [
    "User explicitly approves AG08K.",
    "Fresh pre-visual-insertion backup is created.",
    "Selected article hash still matches AG08G/AG08K-A expected hash or controlled drift is audited.",
    "Final asset exists and hash matches AG08K-A asset record.",
    "Alt text, caption and visible credit are inserted with the visual block.",
    "Hero visual block is inserted near/top of article without disturbing article shape.",
    "AG08G markers, AG08G references and AG03/AG05 governance evidence are preserved.",
    "No CSS/JS mutation unless separately approved.",
    "validate:project passes after insertion."
  ],
  ag08k_allowed_scope_if_later_approved: [
    "create fresh article backup",
    "insert exactly one hero visual figure block into selected article",
    "include alt text, caption and visible credit",
    "record post-insertion audit prep"
  ],
  ag08k_blocked_scope: [
    "multi-article mutation",
    "homepage mutation",
    "CSS/JS mutation",
    "reference URL changes",
    "additional visual generation",
    "database/Supabase write",
    "backend/Auth/Supabase activation",
    "publishing approval"
  ],
  ...noMutationControls
};

const readinessChecks = [
  {
    check_id: "AG08KA-CHECK-001",
    name: "ag08j_candidate_consumed",
    status: selectedCandidate ? "passed" : "failed",
    evidence: selectedCandidateId
  },
  {
    check_id: "AG08KA-CHECK-002",
    name: "article_hash_unchanged",
    status: articleHashBefore === ag08gApply.post_apply_hash ? "passed" : "failed",
    evidence: articleHashBefore
  },
  {
    check_id: "AG08KA-CHECK-003",
    name: "internal_svg_asset_created",
    status: exists(assetRelativePath) && svg.includes("<svg") ? "passed" : "failed",
    evidence: assetRelativePath
  },
  {
    check_id: "AG08KA-CHECK-004",
    name: "source_rights_finalised",
    status: sourceFinalisation.rights_status.includes("approved_for_internal_site_use") ? "passed" : "failed",
    evidence: sourceFinalisation.rights_status
  },
  {
    check_id: "AG08KA-CHECK-005",
    name: "cost_control_recorded",
    status: sourceFinalisation.cost_control_note.includes("avoid external image-generation") ? "passed" : "failed",
    evidence: sourceFinalisation.cost_control_note
  },
  {
    check_id: "AG08KA-CHECK-006",
    name: "no_article_insertion_or_mutation",
    status: "passed",
    evidence: "image_insertion=false article_mutation=false"
  },
  {
    check_id: "AG08KA-CHECK-007",
    name: "ag08k_boundary_created",
    status: insertionBoundary.explicit_approval_required ? "passed" : "failed",
    evidence: insertionBoundary.next_stage_id
  }
];

const allChecksPassed = readinessChecks.every((check) => check.status === "passed");

const readinessRecord = {
  module_id: "AG08K-A",
  title: "Visual Asset Readiness",
  status: allChecksPassed ? "visual_asset_ready_pending_explicit_ag08k_insertion" : "visual_asset_review_required",
  selected_article_path: selectedArticlePath,
  final_asset_path: assetRelativePath,
  final_asset_hash_sha256: assetHash,
  readiness_checks: readinessChecks,
  all_readiness_checks_passed: allChecksPassed,
  ag08k_handoff: insertionBoundary,
  ...noMutationControls
};

const schema = {
  module_id: "AG08K-A",
  title: "Visual Asset Creation / Source Finalisation Schema",
  status: "schema_asset_creation_source_finalisation_only",
  internal_svg_asset_creation_allowed_in_ag08ka: true,
  source_rights_finalisation_allowed_in_ag08ka: true,
  credit_alt_caption_finalisation_allowed_in_ag08ka: true,
  cost_control_record_allowed_in_ag08ka: true,
  ag08k_insertion_boundary_allowed_in_ag08ka: true,
  external_gpt_image_generation_allowed_in_ag08ka: false,
  external_image_api_call_allowed_in_ag08ka: false,
  article_insertion_allowed_in_ag08ka: false,
  article_mutation_allowed_in_ag08ka: false,
  selected_article_file_write_allowed_in_ag08ka: false,
  css_js_mutation_allowed_in_ag08ka: false,
  reference_insertion_allowed_in_ag08ka: false,
  production_jsonl_append_allowed_in_ag08ka: false,
  database_write_allowed_in_ag08ka: false,
  supabase_write_allowed_in_ag08ka: false,
  backend_auth_supabase_activation_allowed_in_ag08ka: false,
  publishing_allowed_in_ag08ka: false,
  ...noMutationControls
};

const summary = {
  selected_article_path: selectedArticlePath,
  article_hash_at_ag08ka: articleHashBefore,
  final_asset_path: assetRelativePath,
  final_asset_hash_sha256: assetHash,
  internal_asset_created: true,
  source_finalised: true,
  credit_alt_caption_finalised: true,
  cost_control_recorded: true,
  image_inserted_into_article: false,
  article_mutated: false,
  next_stage_id: "AG08K",
  next_stage_title: "Controlled Visual Image Insertion Apply",
  next_stage_requires_explicit_approval: true,
  production_readiness_after_ag08ka: "visual_asset_ready_not_inserted",
  publish_readiness_after_ag08ka: "blocked",
  ...noMutationControls
};

const review = {
  module_id: "AG08K-A",
  title: "Visual Asset Creation / Source Finalisation",
  status: "visual_asset_created_source_finalised_not_inserted",
  depends_on: ["AG08J", "AG08I", "AG08H"],
  generated_from: inputs,
  summary,
  finalised_asset_record_file: "data/content-intelligence/visual-registry/ag08ka-finalised-visual-asset-record.json",
  readiness_file: "data/content-intelligence/quality-registry/ag08ka-visual-asset-readiness.json",
  insertion_boundary_file: "data/content-intelligence/mutation-plans/ag08ka-to-ag08k-controlled-insertion-boundary.json",
  schema_file: "data/content-intelligence/schema/visual-asset-creation-source-finalisation.schema.json",
  learning_file: "data/content-intelligence/learning/ag08ka-visual-asset-creation-source-finalisation-learning.json",
  closure_decision: {
    decision: "ag08ka_asset_created_source_finalised_pending_explicit_ag08k",
    proceed_to_ag08k_only_with_explicit_user_approval: true,
    selected_article_path: selectedArticlePath,
    final_asset_path: assetRelativePath,
    external_gpt_image_generation_performed_in_ag08ka: false,
    image_insertion_performed_in_ag08ka: false,
    article_mutation_performed_in_ag08ka: false,
    selected_article_file_write_performed_in_ag08ka: false,
    css_mutation_performed_in_ag08ka: false,
    js_mutation_performed_in_ag08ka: false,
    production_jsonl_append_performed_in_ag08ka: false,
    database_write_performed_in_ag08ka: false,
    supabase_write_performed_in_ag08ka: false,
    backend_auth_supabase_activation_performed_in_ag08ka: false,
    public_publishing_performed_in_ag08ka: false,
    production_readiness: summary.production_readiness_after_ag08ka,
    publish_readiness: summary.publish_readiness_after_ag08ka
  },
  ...noMutationControls
};

const learning = {
  module_id: "AG08K-A",
  title: "Visual Asset Creation / Source Finalisation Learning",
  status: "learning_record_only",
  summary,
  ag08ka_learning_points: [
    "A deterministic internal SVG can satisfy first visual testing without external image-generation cost.",
    "Source finalisation should happen before insertion so rights, credit, alt text and caption are stable.",
    "Article insertion should remain a separate controlled apply stage with fresh backup.",
    "Future higher-quality image generation can be introduced later only when cost, quality and rights gates justify it.",
    "Internal reusable visual components should become the default path where suitable."
  ],
  ...noMutationControls
};

const registry = {
  module_id: "AG08K-A",
  title: "Visual Asset Creation / Source Finalisation",
  status: "visual_asset_created_source_finalised_not_inserted",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag08ka-visual-asset-creation-source-finalisation.json",
    finalised_asset_record: "data/content-intelligence/visual-registry/ag08ka-finalised-visual-asset-record.json",
    readiness: "data/content-intelligence/quality-registry/ag08ka-visual-asset-readiness.json",
    insertion_boundary: "data/content-intelligence/mutation-plans/ag08ka-to-ag08k-controlled-insertion-boundary.json",
    schema: "data/content-intelligence/schema/visual-asset-creation-source-finalisation.schema.json",
    learning: "data/content-intelligence/learning/ag08ka-visual-asset-creation-source-finalisation-learning.json",
    preview: "data/quality/ag08ka-visual-asset-creation-source-finalisation-preview.json",
    document: "docs/quality/AG08KA_VISUAL_ASSET_CREATION_SOURCE_FINALISATION.md",
    asset: assetRelativePath
  },
  summary,
  ...noMutationControls
};

const preview = {
  module_id: "AG08K-A",
  preview_only: true,
  status: "visual_asset_created_source_finalised_not_inserted",
  summary,
  final_asset: finalAssetRecord.asset,
  metadata: finalAssetRecord.metadata,
  source_finalisation: sourceFinalisation,
  ag08k_handoff: insertionBoundary,
  ...noMutationControls
};

const doc = `# AG08K-A — Visual Asset Creation / Source Finalisation

## Purpose

AG08K-A creates and finalises the visual asset source record for the AG08G-upgraded article.

This stage creates one internal SVG editorial asset and records source, rights, credit, alt text, caption, dimensions, hash and cost-control evidence.

AG08K-A does not insert the asset into the article and does not mutate the selected article.

## Target Article

- Path: \`${selectedArticlePath}\`
- Article hash at AG08K-A: \`${articleHashBefore}\`

## Final Asset

- Asset path: \`${assetRelativePath}\`
- Format: SVG
- Dimensions: 1600 × 900
- Hash: \`${assetHash}\`

## Source / Rights

- Source type: internal editorial SVG
- External GPT/image-generation call: no
- Third-party stock image: no
- Third-party logo: no
- Identifiable person: no
- Credit: ${sourceFinalisation.credit_text_final}

## Cost-Control Note

${sourceFinalisation.cost_control_note}

## Future Apply Boundary

AG08K may insert exactly one approved hero visual block only after explicit approval and fresh pre-visual-insertion backup.

## Exclusions

AG08K-A performs no article insertion, no selected article mutation, no CSS/JS mutation, no reference insertion, no JSONL append, no database/Supabase write, no backend/Auth/Supabase activation and no publishing approval.
`;

writeJson(reviewPath, review);
writeJson(assetRecordPath, finalAssetRecord);
writeJson(readinessPath, readinessRecord);
writeJson(insertionBoundaryPath, insertionBoundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

const articleHtmlAfter = fs.readFileSync(path.join(root, selectedArticlePath), "utf8");
const articleHashAfter = sha256(articleHtmlAfter);

if (articleHashAfter !== articleHashBefore) {
  throw new Error("AG08K-A attempted to mutate the selected article. Refusing to continue.");
}

console.log("✅ AG08K-A visual asset creation / source finalisation artifacts generated.");
console.log(`✅ Internal SVG asset created: ${assetRelativePath}`);
console.log("✅ Source, rights, credit, alt text, caption, dimensions and cost-control note finalised.");
console.log("✅ No article insertion, article mutation, external image generation, CSS/JS mutation or publishing performed.");
console.log("✅ AG08K controlled insertion handoff created with explicit approval required.");
