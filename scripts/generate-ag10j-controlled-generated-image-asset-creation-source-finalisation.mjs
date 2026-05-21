import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag10iReview: "data/content-intelligence/quality-reviews/ag10i-generated-image-candidate-selection-prompt-finalisation.json",
  ag10iPlan: "data/content-intelligence/mutation-plans/ag10i-generated-image-candidate-selection-prompt-finalisation.json",
  ag10iCandidate: "data/content-intelligence/object-registry/ag10i-generated-image-candidate-selection-record.json",
  ag10iConcept: "data/content-intelligence/object-registry/ag10i-reusable-image-concept-candidate-record.json",
  ag10iPrompt: "data/content-intelligence/object-registry/ag10i-finalised-prompt-concept-record.json",
  ag10iRights: "data/content-intelligence/quality-registry/ag10i-rights-provenance-source-check-record.json",
  ag10iCost: "data/content-intelligence/quality-registry/ag10i-cost-reuse-decision-record.json",
  ag10iReadiness: "data/content-intelligence/quality-registry/ag10i-generated-image-candidate-readiness.json",
  ag10iBoundary: "data/content-intelligence/mutation-plans/ag10i-to-ag10j-controlled-generated-image-asset-creation-source-finalisation-boundary.json",
  ag10aThemeLayout: "data/content-intelligence/object-registry/ag10a-theme-color-layout-doctrine.json",
  ag10aOwnership: "data/content-intelligence/object-registry/ag10a-ownership-rights-credit-doctrine.json",
  ag09cApply: "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json"
};

const assetRelativePath = "assets/articles/policy/enhancing-public-healthcare-delivery-digital-innovation/ag10j-section-support-digital-healthcare-service-pathway.svg";

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag10j-controlled-generated-image-asset-creation-source-finalisation.json");
const assetRecordPath = path.join(root, "data/content-intelligence/visual-registry/ag10j-finalised-generated-image-asset-record.json");
const sourceRecordPath = path.join(root, "data/content-intelligence/quality-registry/ag10j-generated-image-source-finalisation-record.json");
const rightsRecordPath = path.join(root, "data/content-intelligence/quality-registry/ag10j-generated-image-rights-provenance-clearance-record.json");
const costRecordPath = path.join(root, "data/content-intelligence/quality-registry/ag10j-generated-image-cost-reuse-record.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag10j-generated-image-asset-readiness.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag10j-to-ag10k-controlled-generated-image-insertion-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/controlled-generated-image-asset-creation-source-finalisation.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag10j-controlled-generated-image-asset-creation-source-finalisation-learning.json");
const registryPath = path.join(root, "data/quality/ag10j-controlled-generated-image-asset-creation-source-finalisation.json");
const previewPath = path.join(root, "data/quality/ag10j-controlled-generated-image-asset-creation-source-finalisation-preview.json");
const docPath = path.join(root, "docs/quality/AG10J_CONTROLLED_GENERATED_IMAGE_ASSET_CREATION_SOURCE_FINALISATION.md");
const assetPath = path.join(root, assetRelativePath);

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
  if (!exists(relativePath)) throw new Error(`Missing required AG10J input ${name}: ${relativePath}`);
}

const ag10iReview = readJson(inputs.ag10iReview);
const ag10iPlan = readJson(inputs.ag10iPlan);
const ag10iCandidate = readJson(inputs.ag10iCandidate);
const ag10iConcept = readJson(inputs.ag10iConcept);
const ag10iPrompt = readJson(inputs.ag10iPrompt);
const ag10iRights = readJson(inputs.ag10iRights);
const ag10iCost = readJson(inputs.ag10iCost);
const ag10iReadiness = readJson(inputs.ag10iReadiness);
const ag10iBoundary = readJson(inputs.ag10iBoundary);
const ag10aThemeLayout = readJson(inputs.ag10aThemeLayout);
const ag10aOwnership = readJson(inputs.ag10aOwnership);
const ag09cApply = readJson(inputs.ag09cApply);

if (ag10iReview.status !== "generated_image_candidate_prompt_finalised_not_generated") {
  throw new Error("AG10J requires AG10I review.");
}
if (ag10iReadiness.ready_for_ag10j !== true) {
  throw new Error("AG10J requires AG10I readiness.");
}
if (ag10iBoundary.next_stage_id !== "AG10J" || ag10iBoundary.explicit_approval_required !== true) {
  throw new Error("AG10J requires AG10I to AG10J explicit boundary.");
}
if (ag10iPrompt.prompt_finalised_for_future_stage !== true) {
  throw new Error("AG10J requires AG10I finalised prompt/concept record.");
}
if (ag10iRights.ag10j_rights_clearance_required_before_asset_creation !== true) {
  throw new Error("AG10J requires AG10I rights clearance requirement.");
}
if (ag10iCost.ag10j_cost_gate_required_before_generation !== true) {
  throw new Error("AG10J requires AG10I cost gate requirement.");
}

const selectedArticlePath = ag09cApply.selected_article_path;
if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);

const articleHtml = fs.readFileSync(path.join(root, selectedArticlePath), "utf8");
const articleHash = sha256(articleHtml);

if (articleHash !== ag09cApply.post_correction_hash) {
  throw new Error("AG10J selected article hash must match AG09C post-correction hash.");
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720" role="img" aria-labelledby="title desc">
  <title id="title">Digital public healthcare service pathway</title>
  <desc id="desc">Editorial visual showing a connected public healthcare service pathway linking citizen access, health facility, data visibility and service feedback.</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f7fafc"/>
      <stop offset="52%" stop-color="#eef6f9"/>
      <stop offset="100%" stop-color="#e8f1f6"/>
    </linearGradient>
    <linearGradient id="node" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#4480A8"/>
      <stop offset="100%" stop-color="#1A738C"/>
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#1A738C" flood-opacity="0.14"/>
    </filter>
    <style>
      .title{font-family:Inter,Arial,sans-serif;font-size:34px;font-weight:700;fill:#17324d}
      .sub{font-family:Inter,Arial,sans-serif;font-size:18px;font-weight:500;fill:#4a6070}
      .label{font-family:Inter,Arial,sans-serif;font-size:18px;font-weight:700;fill:#17324d}
      .small{font-family:Inter,Arial,sans-serif;font-size:14px;font-weight:500;fill:#4a6070}
      .micro{font-family:Inter,Arial,sans-serif;font-size:12px;font-weight:600;fill:#607685}
      .line{fill:none;stroke:#4480A8;stroke-width:4;stroke-linecap:round;stroke-dasharray:10 12;opacity:.62}
      .soft{fill:#ffffff;stroke:#B6D0E9;stroke-width:2}
      .accent{fill:#4480A8}
      .accent2{fill:#1A738C}
      .muted{fill:#B6D0E9}
    </style>
  </defs>

  <rect width="1200" height="720" rx="36" fill="url(#bg)"/>

  <circle cx="1040" cy="120" r="150" fill="#B6D0E9" opacity="0.18"/>
  <circle cx="160" cy="612" r="165" fill="#4480A8" opacity="0.08"/>
  <circle cx="598" cy="360" r="275" fill="#ffffff" opacity="0.35"/>

  <text x="86" y="86" class="title">Digital public healthcare service pathway</text>
  <text x="88" y="120" class="sub">Citizen access • facility response • secure data visibility • service feedback</text>

  <path class="line" d="M244 360 C345 265, 460 260, 560 345 S792 462, 906 360"/>
  <path class="line" d="M244 360 C352 455, 472 460, 590 378 S800 260, 906 360" opacity=".34"/>

  <g filter="url(#softShadow)">
    <rect x="104" y="246" width="220" height="228" rx="28" class="soft"/>
    <circle cx="214" cy="318" r="44" fill="url(#node)"/>
    <path d="M196 319c0-19 14-32 31-32 13 0 24 7 29 18-14 5-25 17-29 32-8-1-31-5-31-18z" fill="#fff" opacity=".9"/>
    <path d="M188 385c18-30 66-30 84 0" fill="none" stroke="#1A738C" stroke-width="8" stroke-linecap="round" opacity=".65"/>
    <text x="214" y="418" text-anchor="middle" class="label">Citizen access</text>
    <text x="214" y="444" text-anchor="middle" class="small">entry point and service request</text>
  </g>

  <g filter="url(#softShadow)">
    <rect x="386" y="174" width="236" height="228" rx="28" class="soft"/>
    <rect x="456" y="238" width="96" height="84" rx="12" fill="url(#node)"/>
    <rect x="477" y="216" width="54" height="34" rx="8" fill="#B6D0E9"/>
    <path d="M504 252v56M476 280h56" stroke="#fff" stroke-width="11" stroke-linecap="round"/>
    <text x="504" y="346" text-anchor="middle" class="label">Health facility</text>
    <text x="504" y="372" text-anchor="middle" class="small">care delivery and response</text>
  </g>

  <g filter="url(#softShadow)">
    <rect x="614" y="320" width="246" height="228" rx="28" class="soft"/>
    <rect x="690" y="376" width="94" height="104" rx="18" fill="url(#node)"/>
    <circle cx="720" cy="410" r="8" fill="#fff"/>
    <circle cx="753" cy="410" r="8" fill="#fff"/>
    <circle cx="720" cy="444" r="8" fill="#fff"/>
    <circle cx="753" cy="444" r="8" fill="#fff"/>
    <path d="M674 498h126" stroke="#B6D0E9" stroke-width="9" stroke-linecap="round"/>
    <text x="737" y="522" text-anchor="middle" class="label">Data visibility</text>
    <text x="737" y="548" text-anchor="middle" class="small">secure service information layer</text>
  </g>

  <g filter="url(#softShadow)">
    <rect x="882" y="230" width="230" height="230" rx="28" class="soft"/>
    <circle cx="997" cy="308" r="44" fill="url(#node)"/>
    <path d="M978 308h38M997 289v38" stroke="#fff" stroke-width="9" stroke-linecap="round"/>
    <path d="M942 382c34 28 78 28 112 0" fill="none" stroke="#1A738C" stroke-width="8" stroke-linecap="round" opacity=".62"/>
    <circle cx="942" cy="382" r="8" fill="#4480A8"/>
    <circle cx="1054" cy="382" r="8" fill="#4480A8"/>
    <text x="997" y="418" text-anchor="middle" class="label">Service feedback</text>
    <text x="997" y="444" text-anchor="middle" class="small">quality and accountability loop</text>
  </g>

  <g opacity=".88">
    <circle cx="356" cy="311" r="9" class="accent"/>
    <circle cx="577" cy="349" r="9" class="accent2"/>
    <circle cx="872" cy="361" r="9" class="accent"/>
    <circle cx="602" cy="426" r="7" class="muted"/>
    <circle cx="468" cy="442" r="7" class="muted"/>
  </g>

  <rect x="84" y="604" width="1032" height="54" rx="18" fill="#ffffff" opacity=".76" stroke="#B6D0E9"/>
  <text x="110" y="637" class="micro">Editorial visual • Conceptual representation only • No real dashboard, logo, facility or personal data shown</text>
</svg>
`;

writeText(assetPath, svg);
const assetHash = sha256(fs.readFileSync(assetPath, "utf8"));

const stageControls = {
  controlled_generated_image_asset_creation_source_finalisation_only: true,
  selected_article_read_performed: true,
  internal_svg_editorial_asset_created_in_ag10j: true,
  image_asset_creation_performed_in_ag10j: true,
  svg_asset_creation_performed_in_ag10j: true,
  rendered_visual_asset_finalised_in_ag10j: true,

  external_image_api_call_performed_in_ag10j: false,
  external_image_generation_performed_in_ag10j: false,
  ai_model_image_generation_performed_in_ag10j: false,
  third_party_image_used_in_ag10j: false,
  external_reference_used_in_ag10j: false,
  object_insertion_performed_in_ag10j: false,
  article_mutation_performed_in_ag10j: false,
  selected_article_file_write_performed_in_ag10j: false,
  homepage_mutation_performed_in_ag10j: false,
  css_mutation_performed_in_ag10j: false,
  js_mutation_performed_in_ag10j: false,
  reference_insertion_performed_in_ag10j: false,
  reference_url_change_performed_in_ag10j: false,
  chart_generation_performed_in_ag10j: false,
  infographic_generation_performed_in_ag10j: false,
  table_generation_performed_in_ag10j: false,
  figure_generation_performed_in_ag10j: false,
  diagram_generation_performed_in_ag10j: false,
  map_generation_performed_in_ag10j: false,
  data_fetch_performed_in_ag10j: false,
  dataset_creation_performed_in_ag10j: false,
  live_url_fetch_performed_in_ag10j: false,
  deployment_trigger_performed_in_ag10j: false,
  production_jsonl_append_performed_in_ag10j: false,
  database_write_performed_in_ag10j: false,
  supabase_write_performed_in_ag10j: false,
  backend_auth_supabase_activation_performed_in_ag10j: false,
  rollback_execution_performed_in_ag10j: false,
  public_publishing_operation_performed_in_ag10j: false
};

const assetRecord = {
  module_id: "AG10J",
  title: "Finalised Generated Image Asset Record",
  status: "controlled_generated_image_asset_created_not_inserted",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10j: articleHash,
  asset_id: "AG10J-SVG-SECTION-SUPPORT-001",
  linked_ag10i_candidate_id: ag10iCandidate.candidate_id,
  linked_ag10i_prompt_record_id: ag10iPrompt.prompt_record_id,
  linked_concept_template_candidate_id: ag10iConcept.concept_template_candidate_id,
  asset_path: assetRelativePath,
  asset_type: "internal_svg_editorial_visual",
  file_format: "svg",
  dimensions: {
    width: 1200,
    height: 720,
    aspect_ratio: "5:3"
  },
  asset_hash_sha256: assetHash,
  caption: ag10iPrompt.caption_candidate,
  alt_text: ag10iPrompt.alt_text_candidate,
  visible_credit: ag10iPrompt.visible_credit_candidate,
  generation_method: "internal_deterministic_svg_editorial_workflow",
  source_status: "internal_concept_no_external_visual_reference",
  rights_status: "drishvara_owned_or_controlled_editorial_asset_candidate",
  placement_status: "not_inserted",
  reuse_status: "template_and_asset_reuse_allowed_after_layout_audit",
  mobile_status: "mobile_safe_svg_subject_to_insertion_audit",
  cost_marker: {
    external_generation_cost: 0,
    external_api_call: false,
    internal_template_reuse_value: "high"
  },
  ...stageControls
};

const sourceRecord = {
  module_id: "AG10J",
  title: "Generated Image Source Finalisation Record",
  status: "source_finalised_internal_no_external_reference",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10j: articleHash,
  asset_id: assetRecord.asset_id,
  asset_path: assetRelativePath,
  source_basis: [
    "AG10I finalised prompt/concept record",
    "AG10I reusable image concept candidate",
    "AG10H generated image/editorial visual doctrine",
    "AG10G New Aspect Inclusion Gate"
  ],
  external_visual_reference_used: false,
  external_data_source_used: false,
  third_party_asset_used: false,
  real_logo_used: false,
  identifiable_person_used: false,
  fake_dashboard_or_fake_stat_used: false,
  source_credit_required: false,
  visible_credit: assetRecord.visible_credit,
  source_note_for_future_article_caption: "Conceptual editorial visual prepared by Drishvara; no external visual reference used.",
  ...stageControls
};

const rightsRecord = {
  module_id: "AG10J",
  title: "Generated Image Rights and Provenance Clearance Record",
  status: "rights_provenance_cleared_for_internal_asset_not_insertion",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10j: articleHash,
  asset_id: assetRecord.asset_id,
  asset_hash_sha256: assetHash,
  rights_controller: "Drishvara, represented by its legal owner/operator",
  ownership_status: "Drishvara-owned/controlled editorial asset candidate",
  provenance_chain: [
    "AG10H image/editorial visual pipeline planning",
    "AG10I candidate selection and prompt finalisation",
    "AG10J internal SVG editorial asset creation"
  ],
  clearance_checks: {
    external_image_api_call: false,
    external_reference_used: false,
    identifiable_real_person: false,
    government_logo_or_emblem: false,
    brand_logo: false,
    fake_dashboard_numbers: false,
    living_artist_style_imitation: false,
    medical_procedure_depiction: false,
    misleading_real_world_claim: false
  },
  insertion_clearance_status: "not_cleared_for_insertion_until_ag10k",
  ...stageControls
};

const costRecord = {
  module_id: "AG10J",
  title: "Generated Image Cost and Reuse Record",
  status: "cost_reuse_record_created_for_internal_asset",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10j: articleHash,
  asset_id: assetRecord.asset_id,
  external_generation_cost: 0,
  external_api_call_cost: 0,
  cost_control_decision: "internal_svg_editorial_asset_created_to_avoid_external_generation_cost",
  reuse_decision: {
    concept_template_reuse: "allowed_after_ag10k_or_later_layout_audit",
    asset_reuse: "allowed_for_policy_digital_governance_articles_if_context_remains_valid",
    prompt_pattern_reuse: "allowed_with_variation",
    rendered_asset_reuse_restriction: "do_not_reuse_where article requires real evidence, official dashboard, identifiable facility or location-specific claim"
  },
  intelligence_created: [
    "Reusable SVG section-support visual style",
    "Reusable digital public healthcare service pathway concept",
    "Reusable caption/alt/credit pattern",
    "Reusable rights/provenance clearance pattern"
  ],
  ...stageControls
};

const readiness = {
  module_id: "AG10J",
  title: "Generated Image Asset Readiness",
  status: "generated_image_asset_ready_not_inserted_pending_explicit_ag10k",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10j: articleHash,
  asset_id: assetRecord.asset_id,
  asset_path: assetRelativePath,
  asset_hash_sha256: assetHash,
  asset_file_created: true,
  source_finalised: true,
  rights_provenance_cleared_for_asset: true,
  caption_confirmed: true,
  alt_text_confirmed: true,
  visible_credit_confirmed: true,
  cost_reuse_record_created: true,
  ready_for_ag10k: true,
  article_insertion_ready: false,
  article_mutation_ready: false,
  backend_activation_ready: false,
  publishing_ready: false,
  explicit_ag10k_approval_required: true,
  ...stageControls
};

const boundary = {
  module_id: "AG10J",
  title: "AG10J to AG10K Controlled Generated Image Insertion Boundary",
  status: "ag10k_boundary_created_not_started",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10j: articleHash,
  asset_id: assetRecord.asset_id,
  asset_path: assetRelativePath,
  asset_hash_sha256: assetHash,
  next_stage_id: "AG10K",
  next_stage_title: "Controlled Generated Image Article Insertion Apply",
  explicit_approval_required: true,
  ag10k_allowed_scope: [
    "Insert only AG10J finalised asset into the selected article.",
    "Use AG10J caption, alt text and visible credit.",
    "Create backup before mutation.",
    "Preserve article shape, justified text, mobile layout and existing hero visual.",
    "Record apply result and post-insertion audit handoff."
  ],
  ag10k_blocked_scope: [
    "No new image generation.",
    "No external image API call.",
    "No new asset creation.",
    "No reference URL change.",
    "No CSS/JS mutation unless separately approved.",
    "No database/Supabase/backend/Auth activation.",
    "No publishing operation."
  ],
  ...stageControls
};

const schema = {
  module_id: "AG10J",
  title: "Controlled Generated Image Asset Creation Source Finalisation Schema",
  status: "schema_controlled_generated_image_asset_creation_source_finalisation_only",
  asset_creation_allowed_in_ag10j: true,
  internal_svg_asset_creation_allowed_in_ag10j: true,
  source_finalisation_allowed_in_ag10j: true,
  rights_provenance_clearance_allowed_in_ag10j: true,
  cost_reuse_record_allowed_in_ag10j: true,
  ag10k_boundary_allowed_in_ag10j: true,

  external_image_api_call_allowed_in_ag10j: false,
  external_image_generation_allowed_in_ag10j: false,
  third_party_image_use_allowed_in_ag10j: false,
  object_insertion_allowed_in_ag10j: false,
  article_mutation_allowed_in_ag10j: false,
  homepage_mutation_allowed_in_ag10j: false,
  css_js_mutation_allowed_in_ag10j: false,
  reference_insertion_allowed_in_ag10j: false,
  chart_generation_allowed_in_ag10j: false,
  infographic_generation_allowed_in_ag10j: false,
  table_generation_allowed_in_ag10j: false,
  figure_generation_allowed_in_ag10j: false,
  diagram_generation_allowed_in_ag10j: false,
  map_generation_allowed_in_ag10j: false,
  data_fetch_allowed_in_ag10j: false,
  dataset_creation_allowed_in_ag10j: false,
  live_url_fetch_allowed_in_ag10j: false,
  deployment_trigger_allowed_in_ag10j: false,
  production_jsonl_append_allowed_in_ag10j: false,
  database_write_allowed_in_ag10j: false,
  supabase_write_allowed_in_ag10j: false,
  backend_auth_supabase_activation_allowed_in_ag10j: false,
  public_publishing_operation_allowed_in_ag10j: false,
  ...stageControls
};

const summary = {
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10j: articleHash,
  asset_id: assetRecord.asset_id,
  asset_path: assetRelativePath,
  asset_hash_sha256: assetHash,
  asset_type: assetRecord.asset_type,
  dimensions: assetRecord.dimensions,
  visible_credit: assetRecord.visible_credit,
  caption: assetRecord.caption,
  next_stage_id: "AG10K",
  next_stage_title: "Controlled Generated Image Article Insertion Apply",
  next_stage_requires_explicit_approval: true,
  ...stageControls
};

const review = {
  module_id: "AG10J",
  title: "Controlled Generated Image Asset Creation and Source Finalisation",
  status: "controlled_generated_image_asset_created_source_finalised_not_inserted",
  depends_on: ["AG10I", "AG10H", "AG10G", "AG10A"],
  generated_from: inputs,
  summary,
  asset_record_file: "data/content-intelligence/visual-registry/ag10j-finalised-generated-image-asset-record.json",
  source_record_file: "data/content-intelligence/quality-registry/ag10j-generated-image-source-finalisation-record.json",
  rights_record_file: "data/content-intelligence/quality-registry/ag10j-generated-image-rights-provenance-clearance-record.json",
  cost_record_file: "data/content-intelligence/quality-registry/ag10j-generated-image-cost-reuse-record.json",
  readiness_file: "data/content-intelligence/quality-registry/ag10j-generated-image-asset-readiness.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag10j-to-ag10k-controlled-generated-image-insertion-boundary.json",
  schema_file: "data/content-intelligence/schema/controlled-generated-image-asset-creation-source-finalisation.schema.json",
  learning_file: "data/content-intelligence/learning/ag10j-controlled-generated-image-asset-creation-source-finalisation-learning.json",
  closure_decision: {
    decision: "ag10j_asset_created_source_finalised_pending_explicit_ag10k",
    proceed_to_ag10k_only_with_explicit_user_approval: true,
    asset_created: true,
    inserted_into_article: false,
    article_mutation_performed: false,
    external_image_api_call_performed: false,
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG10J",
  title: "Controlled Generated Image Asset Creation Source Finalisation Learning",
  status: "learning_record_only",
  summary,
  learning_points: [
    "A controlled internal SVG editorial asset can satisfy the generated/editorial visual need without external image API cost.",
    "Asset creation must remain separate from article insertion.",
    "Source finalisation, rights/provenance, credit, caption, alt text, hash and cost record must exist before insertion.",
    "The asset remains not inserted until AG10K explicit approval.",
    "The reusable concept can support future policy/digital governance articles after insertion/layout audit."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG10J",
  title: "Controlled Generated Image Asset Creation and Source Finalisation",
  status: "controlled_generated_image_asset_created_source_finalised_not_inserted",
  generated_artifacts: {
    asset: assetRelativePath,
    review: "data/content-intelligence/quality-reviews/ag10j-controlled-generated-image-asset-creation-source-finalisation.json",
    asset_record: "data/content-intelligence/visual-registry/ag10j-finalised-generated-image-asset-record.json",
    source_record: "data/content-intelligence/quality-registry/ag10j-generated-image-source-finalisation-record.json",
    rights_record: "data/content-intelligence/quality-registry/ag10j-generated-image-rights-provenance-clearance-record.json",
    cost_record: "data/content-intelligence/quality-registry/ag10j-generated-image-cost-reuse-record.json",
    readiness: "data/content-intelligence/quality-registry/ag10j-generated-image-asset-readiness.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag10j-to-ag10k-controlled-generated-image-insertion-boundary.json",
    schema: "data/content-intelligence/schema/controlled-generated-image-asset-creation-source-finalisation.schema.json",
    learning: "data/content-intelligence/learning/ag10j-controlled-generated-image-asset-creation-source-finalisation-learning.json",
    preview: "data/quality/ag10j-controlled-generated-image-asset-creation-source-finalisation-preview.json",
    document: "docs/quality/AG10J_CONTROLLED_GENERATED_IMAGE_ASSET_CREATION_SOURCE_FINALISATION.md"
  },
  summary,
  ...stageControls
};

const preview = {
  module_id: "AG10J",
  preview_only: true,
  status: "controlled_generated_image_asset_created_source_finalised_not_inserted",
  summary,
  asset_preview: {
    asset_id: assetRecord.asset_id,
    asset_path: assetRelativePath,
    asset_hash_sha256: assetHash,
    caption: assetRecord.caption,
    alt_text: assetRecord.alt_text,
    credit: assetRecord.visible_credit
  },
  ag10k_handoff: boundary,
  ...stageControls
};

const doc = `# AG10J — Controlled Generated Image Asset Creation and Source Finalisation

## Purpose

AG10J creates and finalises one controlled internal SVG editorial visual asset using the AG10I candidate and prompt/concept record.

AG10J does not insert the asset into the article, mutate the article, modify CSS/JS, activate backend/Auth/Supabase/database systems or publish anything.

## Finalised Asset

- Asset ID: \`${assetRecord.asset_id}\`
- Asset path: \`${assetRelativePath}\`
- Asset type: \`${assetRecord.asset_type}\`
- Dimensions: \`1200 × 720\`
- Hash: \`${assetHash}\`
- Caption: ${assetRecord.caption}
- Alt text: ${assetRecord.alt_text}
- Credit: ${assetRecord.visible_credit}

## Source and Rights

The asset is created through an internal deterministic SVG editorial workflow. No external image API, external visual reference, third-party asset, real logo, identifiable person or fake dashboard data is used.

## Cost and Reuse

External generation cost is recorded as zero. The asset and concept are prepared for future reuse subject to layout audit and context validity.

## Next Stage

AG10K — Controlled Generated Image Article Insertion Apply — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(assetRecordPath, assetRecord);
writeJson(sourceRecordPath, sourceRecord);
writeJson(rightsRecordPath, rightsRecord);
writeJson(costRecordPath, costRecord);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

const articleHashAfter = sha256(fs.readFileSync(path.join(root, selectedArticlePath), "utf8"));
if (articleHashAfter !== articleHash) {
  throw new Error("AG10J attempted to mutate selected article. Refusing to continue.");
}

console.log("✅ AG10J controlled generated image asset creation and source finalisation artifacts generated.");
console.log(`✅ Asset created: ${assetRelativePath}`);
console.log(`✅ Asset hash: ${assetHash}`);
console.log("✅ Source, rights/provenance, caption, alt text, visible credit and cost/reuse records finalised.");
console.log("✅ Asset is not inserted into the article.");
console.log("✅ No external image API call, article mutation, CSS/JS mutation, backend activation or publishing operation performed.");
console.log("✅ AG10K handoff created with explicit approval required.");
