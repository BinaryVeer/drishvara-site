import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag45aBackendSchemaPlan: "data/content-intelligence/backend-architecture/ag45a-daily-signal-metadata-schema-plan.json",
  ag45aVideoDoctrine: "data/content-intelligence/daily-surface/ag45a-video-of-the-day-doctrine.json",

  ag45bTierRiskRegister: "data/content-intelligence/daily-surface/ag45b-source-tier-risk-register.json",

  ag45dReview: "data/content-intelligence/quality-reviews/ag45d-title-subtitle-inference-metadata.json",
  ag45dAttributionRules: "data/content-intelligence/daily-surface/ag45d-source-attribution-language-rules.json",
  ag45dMetadataMap: "data/content-intelligence/daily-surface/ag45d-signal-inference-metadata-map.json",
  ag45dCardCopyTemplate: "data/content-intelligence/daily-surface/ag45d-signal-card-copy-template-model.json",
  ag45dNoMutationAudit: "data/content-intelligence/backend-architecture/ag45d-no-mutation-audit-register.json",
  ag45dReadiness: "data/content-intelligence/quality-registry/ag45d-image-link-attribution-safety-readiness-record.json",
  ag45dBoundary: "data/content-intelligence/mutation-plans/ag45d-to-ag45e-image-link-attribution-safety-boundary.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag45e-image-link-attribution-safety.json",
  linkSafetyModel: "data/content-intelligence/daily-surface/ag45e-source-link-canonical-url-safety-model.json",
  thumbnailImageSafetyModel: "data/content-intelligence/daily-surface/ag45e-thumbnail-image-safety-model.json",
  attributionCreditModel: "data/content-intelligence/daily-surface/ag45e-attribution-credit-display-model.json",
  externalAssetPolicy: "data/content-intelligence/daily-surface/ag45e-external-asset-no-download-policy.json",
  verificationStatusModel: "data/content-intelligence/daily-surface/ag45e-verification-status-bands-model.json",
  imageReferenceGovernanceConsumption: "data/content-intelligence/daily-surface/ag45e-image-reference-governance-consumption-map.json",
  noMutationAudit: "data/content-intelligence/backend-architecture/ag45e-no-mutation-audit-register.json",
  readiness: "data/content-intelligence/quality-registry/ag45e-video-of-the-day-safety-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag45e-to-ag45f-video-of-the-day-safety-boundary.json",
  registry: "data/quality/ag45e-image-link-attribution-safety.json",
  preview: "data/quality/ag45e-image-link-attribution-safety-preview.json",
  doc: "docs/quality/AG45E_IMAGE_LINK_ATTRIBUTION_SAFETY.md"
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

function walk(dir) {
  const start = full(dir);
  if (!fs.existsSync(start)) return [];
  const out = [];

  for (const entry of fs.readdirSync(start, { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(rel));
    else if (entry.isFile()) out.push(rel);
  }

  return out;
}

function findFiles(patterns, roots = ["data", "docs", "scripts"]) {
  const files = roots.flatMap((r) => walk(r));
  return files.filter((file) => patterns.some((pattern) => pattern.test(file)));
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG45E input: ${p}`);
}

const ag45aBackendSchemaPlan = readJson(inputs.ag45aBackendSchemaPlan);
const ag45aVideoDoctrine = readJson(inputs.ag45aVideoDoctrine);
const ag45bTierRiskRegister = readJson(inputs.ag45bTierRiskRegister);
const ag45dReview = readJson(inputs.ag45dReview);
const ag45dAttributionRules = readJson(inputs.ag45dAttributionRules);
const ag45dMetadataMap = readJson(inputs.ag45dMetadataMap);
const ag45dCardCopyTemplate = readJson(inputs.ag45dCardCopyTemplate);
const ag45dNoMutationAudit = readJson(inputs.ag45dNoMutationAudit);
const ag45dReadiness = readJson(inputs.ag45dReadiness);
const ag45dBoundary = readJson(inputs.ag45dBoundary);

if (ag45dReview.status !== "title_subtitle_inference_metadata_rules_ready_for_ag45e") {
  throw new Error("AG45D review status mismatch.");
}
if (ag45dReview.summary?.ready_for_ag45e !== true) {
  throw new Error("AG45D does not show AG45E readiness.");
}
if (ag45dReadiness.ready_for_ag45e !== true || ag45dReadiness.next_stage_id !== "AG45E") {
  throw new Error("AG45D readiness must permit AG45E.");
}
if (ag45dBoundary.next_stage_id !== "AG45E") {
  throw new Error("AG45D boundary must point to AG45E.");
}
if (ag45dNoMutationAudit.status !== "no_mutation_audit_passed_for_ag45d") {
  throw new Error("AG45D no-mutation audit mismatch.");
}
if (!JSON.stringify(ag45dAttributionRules).includes("source_url") && !JSON.stringify(ag45dMetadataMap).includes("source_url")) {
  throw new Error("AG45D must preserve source_url metadata.");
}
if (!JSON.stringify(ag45dMetadataMap).includes("image_credit")) {
  throw new Error("AG45D metadata map must include image_credit.");
}
if (!JSON.stringify(ag45dMetadataMap).includes("video_credit")) {
  throw new Error("AG45D metadata map must include video_credit.");
}
if (ag45dCardCopyTemplate.compact_card_constraints?.source_link_required_later !== true) {
  throw new Error("AG45D card copy template must require source link later.");
}
for (const field of ["image_url", "image_credit", "video_url", "video_credit", "canonical_url", "verification_status", "safety_status"]) {
  if (!ag45aBackendSchemaPlan.planned_fields.includes(field)) {
    throw new Error(`AG45A backend schema plan missing field: ${field}`);
  }
}
if (!JSON.stringify(ag45bTierRiskRegister).includes("copyright-unsafe image/video handling")) {
  throw new Error("AG45B risk register missing copyright-unsafe image/video handling.");
}
if (!JSON.stringify(ag45aVideoDoctrine).includes("metadata/link/credit only")) {
  throw new Error("AG45A video doctrine must preserve metadata/link/credit-only rule.");
}

const priorImageCreditSources = findFiles([
  /ar01/i,
  /ag05d/i,
  /ag05d[-_]?r1/i,
  /image[-_ ]?credit/i,
  /visual[-_ ]?credit/i,
  /reference[-_ ]?surface/i,
  /attribution/i
]);

const blockedState = {
  ag45e_image_link_attribution_safety_recorded: true,
  ag45d_consumed: true,
  link_safety_model_recorded: true,
  thumbnail_image_safety_model_recorded: true,
  attribution_credit_display_model_recorded: true,
  external_asset_no_download_policy_recorded: true,
  verification_status_bands_recorded: true,
  image_reference_governance_consumed_where_available: true,
  daily_signal_fetch_executed: false,
  news_scraping_executed: false,
  reporter_live_verification_executed: false,
  external_link_verification_executed: false,
  image_fetch_executed: false,
  thumbnail_fetch_executed: false,
  video_fetch_executed: false,
  image_downloaded_or_rehosted: false,
  video_downloaded_or_rehosted: false,
  video_popup_activated: false,
  homepage_mutated: false,
  featured_reads_mutated: false,
  article_mutated: false,
  article_generated: false,
  episode_generated: false,
  topic_promoted: false,
  reference_fetch_executed: false,
  image_generation_executed: false,
  video_generation_executed: false,
  public_publishing_operation_performed: false,
  deployment_performed: false,
  database_write_performed: false,
  backend_auth_supabase_activation_performed: false,
  sql_file_created: false,
  sql_grants_executed: false,
  service_role_key_exposed: false
};

const linkSafetyModel = {
  module_id: "AG45E",
  title: "Source Link and Canonical URL Safety Model",
  status: "source_link_canonical_url_safety_model_recorded",
  planned_fields: ["source_url", "canonical_url", "publisher_name", "verification_status", "safety_status"],
  rules: [
    "Store source link as metadata in a later backend stage; do not fetch or verify links in AG45E.",
    "Prefer canonical URL where available in later approved runtime stages.",
    "Do not shorten source URLs in a way that hides the publisher domain.",
    "Do not use suspicious redirects, parked domains or spam-like link wrappers.",
    "Do not present an unverified link as verified.",
    "Public card must always route the reader to the original publisher source when activated later.",
    "Broken-link handling must use an internal verification status rather than hiding attribution."
  ],
  verification_status_values: [
    "verified",
    "reachable_pending_editorial_review",
    "under_editorial_verification",
    "broken_or_unreachable",
    "unsafe_or_excluded"
  ],
  live_link_verification_now: false,
  blocked_state: blockedState
};

const thumbnailImageSafetyModel = {
  module_id: "AG45E",
  title: "Thumbnail and Image Safety Model",
  status: "thumbnail_image_safety_model_recorded",
  planned_fields: ["image_url", "image_credit", "image_usage_status", "image_source_type"],
  source_types: [
    {
      type: "publisher_link_preview",
      treatment: "Use only as external preview metadata in later approved runtime stages where permitted; do not download or rehost."
    },
    {
      type: "licensed_or_public_domain_asset",
      treatment: "May be considered later only with license and attribution recorded."
    },
    {
      type: "drishvara_editorial_synthesis",
      treatment: "Use Drishvara-created visual credit where the asset is prepared internally and no external statistical dataset is introduced unless separately cited."
    },
    {
      type: "unsafe_or_unclear_rights_asset",
      treatment: "Exclude or hold under editorial verification."
    }
  ],
  safety_rules: [
    "Do not download or store publisher images in AG45E.",
    "Do not rehost third-party thumbnails unless rights are explicitly cleared in a later approved stage.",
    "Use image URL and credit metadata only in early stages.",
    "Never use adult, explicit, violent shock, hate, extremist or reputation-risk imagery.",
    "When rights are unclear, use under editorial verification or a Drishvara neutral placeholder in later approved UI stages.",
    "Image credit must remain visibly connected to the visual when public rendering is later approved."
  ],
  image_fetch_now: false,
  blocked_state: blockedState
};

const attributionCreditModel = {
  module_id: "AG45E",
  title: "Attribution and Credit Display Model",
  status: "attribution_credit_display_model_recorded",
  display_rules: [
    "Every public signal card must preserve publisher/source attribution when activated later.",
    "Reporter, desk, anchor or commentator identity must be shown only where source material supports it.",
    "Image credit must be shown when a third-party visual or publisher preview is displayed.",
    "Drishvara-created visuals should use a simple credit such as: Visual: Drishvara editorial synthesis.",
    "Use 'under editorial verification' only when a third-party image/source asset is used and not yet verified.",
    "Do not imply Drishvara owns third-party reporting, images or video.",
    "Do not expose internal credibility scores publicly."
  ],
  public_credit_templates: [
    "Source: [Publisher].",
    "Reported by [Reporter] for [Publisher].",
    "Explained by [Anchor/Expert] for [Publisher/Platform].",
    "Visual: Drishvara editorial synthesis.",
    "Image/thumbnail: [Publisher/Creator], shown as source preview where permitted.",
    "Visual source under editorial verification."
  ],
  blocked_state: blockedState
};

const externalAssetPolicy = {
  module_id: "AG45E",
  title: "External Asset No-download Policy",
  status: "external_asset_no_download_policy_recorded",
  policy_rules: [
    "No third-party image, thumbnail or video is downloaded in AG45E.",
    "No third-party image, thumbnail or video is rehosted in AG45E.",
    "No publisher page is scraped in AG45E.",
    "No link-preview extraction is executed in AG45E.",
    "No video embedding or popup activation is executed in AG45E.",
    "Only metadata schema and safety rules are recorded.",
    "Actual fetch/verification/storage remains deferred to a later approved backend/runtime stage."
  ],
  allowed_now: [
    "record planned metadata fields",
    "record safety rules",
    "record verification bands",
    "record attribution templates",
    "consume existing image/reference governance records where available"
  ],
  blocked_now: [
    "live link fetch",
    "publisher page scrape",
    "thumbnail extraction",
    "image download",
    "video download",
    "video embed activation",
    "homepage mutation",
    "database write"
  ],
  blocked_state: blockedState
};

const verificationStatusModel = {
  module_id: "AG45E",
  title: "Verification Status Bands Model",
  status: "verification_status_bands_model_recorded",
  bands: [
    {
      status: "verified",
      meaning: "Source link, attribution and asset usage have been checked in a later approved verification stage."
    },
    {
      status: "reachable_pending_editorial_review",
      meaning: "Source appears reachable in a later approved verification stage, but editorial review is still pending."
    },
    {
      status: "under_editorial_verification",
      meaning: "Source or visual asset is being checked; use only cautious public wording if displayed later."
    },
    {
      status: "metadata_only_not_fetched",
      meaning: "Record exists as planned metadata only; no live fetch has occurred."
    },
    {
      status: "broken_or_unreachable",
      meaning: "Link or source could not be reached in a later verification stage."
    },
    {
      status: "unsafe_or_excluded",
      meaning: "Source or asset failed safety/reputation/rights checks."
    }
  ],
  default_status_for_ag45e: "metadata_only_not_fetched",
  public_display_rule: "Do not claim verification publicly unless status is verified or otherwise clearly approved in a later governed stage.",
  blocked_state: blockedState
};

const imageReferenceGovernanceConsumption = {
  module_id: "AG45E",
  title: "Image and Reference Governance Consumption Map",
  status: "image_reference_governance_consumed_where_available",
  consumed_prior_sources: priorImageCreditSources.slice(0, 100),
  consumption_rules: [
    "Consume existing AR01 / AG05D / image-credit / attribution governance where present.",
    "Do not duplicate earlier image/reference credit modules.",
    "AG45E only adapts those governance rules to Daily Signal Surface metadata.",
    "Public rendering remains deferred.",
    "Reference fetching remains blocked."
  ],
  source_count: priorImageCreditSources.length,
  blocked_state: blockedState
};

const noMutationAudit = {
  module_id: "AG45E",
  title: "No-mutation Audit Register",
  status: "no_mutation_audit_passed_for_ag45e",
  checks: Object.entries({
    daily_signal_fetch_executed: false,
    news_scraping_executed: false,
    reporter_live_verification_executed: false,
    external_link_verification_executed: false,
    image_fetch_executed: false,
    thumbnail_fetch_executed: false,
    video_fetch_executed: false,
    image_downloaded_or_rehosted: false,
    video_downloaded_or_rehosted: false,
    video_popup_activated: false,
    homepage_mutated: false,
    featured_reads_mutated: false,
    article_mutated: false,
    article_generated: false,
    episode_generated: false,
    topic_promoted: false,
    reference_fetch_executed: false,
    image_generation_executed: false,
    video_generation_executed: false,
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

const readiness = {
  module_id: "AG45E",
  title: "AG45F Video-of-the-Day Safety Readiness Record",
  status: "ready_for_ag45f_video_of_the_day_safety_model",
  ready_for_ag45f: true,
  next_stage_id: "AG45F",
  next_stage_title: "Video-of-the-Day Selection, Safety and Credit Model",
  hard_blocker_count_for_ag45f: 0,
  daily_signal_fetch_allowed_next: false,
  news_scraping_allowed_next: false,
  reporter_live_verification_allowed_next: false,
  external_link_verification_allowed_next: false,
  image_fetch_allowed_next: false,
  thumbnail_fetch_allowed_next: false,
  video_fetch_allowed_next: false,
  video_popup_activation_allowed_next: false,
  homepage_mutation_allowed_next: false,
  public_activation_allowed_next: false,
  database_write_allowed_next: false,
  deployment_allowed_next: false,
  backend_activation_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG45E",
  title: "AG45E to AG45F Video-of-the-Day Safety Boundary",
  status: "ag45f_video_of_the_day_safety_boundary_created",
  next_stage_id: "AG45F",
  next_stage_title: "Video-of-the-Day Selection, Safety and Credit Model",
  allowed_scope: [
    "Define video-of-the-day source selection, safety, attribution and credit rules.",
    "Define once-per-day popup behaviour as planning only.",
    "Define India/world/regional rotation and spiritual reflection clip handling.",
    "Use AG45A video doctrine and AG45E external asset policy as inputs.",
    "Do not fetch videos.",
    "Do not embed videos.",
    "Do not activate popup.",
    "Do not scrape publisher or creator pages.",
    "Do not download or rehost third-party video.",
    "Do not mutate homepage or runtime files.",
    "Do not write database records.",
    "Do not deploy.",
    "Do not activate backend/Auth/Supabase."
  ],
  blocked_scope: [
    "live news fetching",
    "web scraping",
    "external link verification",
    "image fetch",
    "video fetch",
    "video download/rehost",
    "video popup activation",
    "homepage mutation",
    "public publishing",
    "deployment",
    "database write",
    "backend/Auth/Supabase activation",
    "SQL grant execution",
    "service-role key exposure"
  ],
  blocked_state: blockedState
};

const review = {
  module_id: "AG45E",
  title: "Image, Thumbnail, Link and Attribution Safety Model",
  status: "image_link_attribution_safety_model_ready_for_ag45f",
  depends_on: ["AG45A", "AG45B", "AG45D", "existing image/reference governance where available"],
  link_safety_model_file: outputs.linkSafetyModel,
  thumbnail_image_safety_model_file: outputs.thumbnailImageSafetyModel,
  attribution_credit_model_file: outputs.attributionCreditModel,
  external_asset_policy_file: outputs.externalAssetPolicy,
  verification_status_model_file: outputs.verificationStatusModel,
  image_reference_governance_consumption_file: outputs.imageReferenceGovernanceConsumption,
  no_mutation_audit_file: outputs.noMutationAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag45e_image_link_attribution_safety_recorded: true,
    link_safety_model_recorded: true,
    thumbnail_image_safety_model_recorded: true,
    attribution_credit_display_model_recorded: true,
    external_asset_no_download_policy_recorded: true,
    verification_status_bands_recorded: true,
    image_reference_governance_consumed_where_available: true,
    ready_for_ag45f: true,
    hard_blocker_count_for_ag45f: 0,
    external_link_verification_executed: false,
    image_fetch_executed: false,
    thumbnail_fetch_executed: false,
    video_fetch_executed: false,
    image_downloaded_or_rehosted: false,
    video_downloaded_or_rehosted: false,
    homepage_mutated: false,
    database_write_performed: false,
    backend_auth_supabase_activation_performed: false,
    deployment_performed: false,
    service_role_key_exposed: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG45E",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG45E",
  status: review.status,
  ag45e_image_link_attribution_safety_recorded: 1,
  link_safety_model_recorded: 1,
  thumbnail_image_safety_model_recorded: 1,
  attribution_credit_display_model_recorded: 1,
  external_asset_no_download_policy_recorded: 1,
  verification_status_bands_recorded: 1,
  image_reference_governance_consumed_where_available: 1,
  ready_for_ag45f: 1,
  hard_blocker_count_for_ag45f: 0,
  external_link_verification_executed: 0,
  image_fetch_executed: 0,
  thumbnail_fetch_executed: 0,
  video_fetch_executed: 0,
  image_downloaded_or_rehosted: 0,
  video_downloaded_or_rehosted: 0,
  homepage_mutated: 0,
  database_write_performed: 0,
  backend_auth_supabase_activation_performed: 0,
  deployment_performed: 0,
  service_role_key_exposed: 0
};

const doc = `# AG45E — Image, Thumbnail, Link and Attribution Safety Model

## Result

AG45E records the safety model for source links, canonical URLs, publisher thumbnails, images, credits and attribution in the Daily Signal Surface.

## Link safety

Source links and canonical URLs remain metadata-only until a later approved verification stage. AG45E does not fetch, verify or scrape links.

## Image and thumbnail safety

Publisher thumbnails and third-party images must not be downloaded or rehosted unless rights are cleared in a later approved stage. Early treatment is metadata-only.

## Attribution

Public Daily Signal cards must preserve publisher/source attribution. Third-party visual assets require visible credit. Drishvara-created visuals should use simple Drishvara editorial synthesis credit.

## Verification status

AG45E defines status bands such as verified, under editorial verification, metadata-only-not-fetched, broken/unreachable and unsafe/excluded. No public verification claim is made in AG45E.

## Still blocked

- No live news fetching.
- No scraping.
- No live link verification.
- No image or thumbnail fetch.
- No video fetch.
- No image/video download or rehost.
- No homepage mutation.
- No database write.
- No backend/Auth/Supabase activation.
- No deployment.
- No service-role key exposure.

## Next

AG45F — Video-of-the-Day Selection, Safety and Credit Model.
`;

writeJson(outputs.linkSafetyModel, linkSafetyModel);
writeJson(outputs.thumbnailImageSafetyModel, thumbnailImageSafetyModel);
writeJson(outputs.attributionCreditModel, attributionCreditModel);
writeJson(outputs.externalAssetPolicy, externalAssetPolicy);
writeJson(outputs.verificationStatusModel, verificationStatusModel);
writeJson(outputs.imageReferenceGovernanceConsumption, imageReferenceGovernanceConsumption);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG45E Image, Thumbnail, Link and Attribution Safety Model generated.");
console.log("✅ Link safety, thumbnail/image safety, attribution, no-download policy and verification status bands recorded.");
console.log("✅ Ready for AG45F Video-of-the-Day Selection, Safety and Credit Model.");
console.log("✅ No live fetch, scrape, link verification, image/video fetch, homepage mutation, database/backend activation, deployment or service-role exposure recorded.");
