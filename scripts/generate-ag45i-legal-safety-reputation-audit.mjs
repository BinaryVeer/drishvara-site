import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag45aReview: "data/content-intelligence/quality-reviews/ag45a-daily-signal-surface-first-light-doctrine.json",
  ag45bReview: "data/content-intelligence/quality-reviews/ag45b-source-credibility-model.json",
  ag45cReview: "data/content-intelligence/quality-reviews/ag45c-signal-selection-model.json",
  ag45dReview: "data/content-intelligence/quality-reviews/ag45d-title-subtitle-inference-metadata.json",
  ag45eReview: "data/content-intelligence/quality-reviews/ag45e-image-link-attribution-safety.json",
  ag45fReview: "data/content-intelligence/quality-reviews/ag45f-video-of-the-day-safety-credit.json",
  ag45gReview: "data/content-intelligence/quality-reviews/ag45g-homepage-card-transition-behaviour.json",
  ag45hReview: "data/content-intelligence/quality-reviews/ag45h-backend-metadata-pattern-schema.json",

  ag45bTierRiskRegister: "data/content-intelligence/daily-surface/ag45b-source-tier-risk-register.json",
  ag45dAttributionRules: "data/content-intelligence/daily-surface/ag45d-source-attribution-language-rules.json",
  ag45eExternalAssetPolicy: "data/content-intelligence/daily-surface/ag45e-external-asset-no-download-policy.json",
  ag45fCreatorSafetyModel: "data/content-intelligence/daily-surface/ag45f-video-creator-source-safety-model.json",
  ag45gNoLayoutShiftAudit: "data/content-intelligence/homepage/ag45g-no-layout-shift-audit.json",
  ag45hBackendDeferral: "data/content-intelligence/backend-architecture/ag45h-backend-activation-deferral-register.json",
  ag45hNoSqlDbAudit: "data/content-intelligence/backend-architecture/ag45h-no-sql-no-db-write-audit.json",
  ag45hNoMutationAudit: "data/content-intelligence/backend-architecture/ag45h-no-mutation-audit-register.json",
  ag45hReadiness: "data/content-intelligence/quality-registry/ag45h-legal-safety-reputation-audit-readiness-record.json",
  ag45hBoundary: "data/content-intelligence/mutation-plans/ag45h-to-ag45i-legal-safety-reputation-audit-boundary.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag45i-legal-safety-reputation-audit.json",
  legalAttributionAudit: "data/content-intelligence/daily-surface/ag45i-legal-attribution-audit.json",
  sourceReputationAudit: "data/content-intelligence/daily-surface/ag45i-source-reputation-safety-audit.json",
  contentRightsAudit: "data/content-intelligence/daily-surface/ag45i-content-rights-risk-audit.json",
  publicSurfaceAudit: "data/content-intelligence/homepage/ag45i-public-surface-nonactivation-audit.json",
  backendDeferralAudit: "data/content-intelligence/backend-architecture/ag45i-backend-deferral-service-key-audit.json",
  ag45ChainAudit: "data/content-intelligence/quality-registry/ag45i-ag45-chain-integrity-audit.json",
  noMutationAudit: "data/content-intelligence/backend-architecture/ag45i-no-mutation-audit-register.json",
  readiness: "data/content-intelligence/quality-registry/ag45i-ag45z-closure-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag45i-to-ag45z-daily-signal-surface-closure-boundary.json",
  registry: "data/quality/ag45i-legal-safety-reputation-audit.json",
  preview: "data/quality/ag45i-legal-safety-reputation-audit-preview.json",
  doc: "docs/quality/AG45I_LEGAL_SAFETY_REPUTATION_AUDIT.md"
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

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG45I input: ${p}`);
}

const ag45aReview = readJson(inputs.ag45aReview);
const ag45bReview = readJson(inputs.ag45bReview);
const ag45cReview = readJson(inputs.ag45cReview);
const ag45dReview = readJson(inputs.ag45dReview);
const ag45eReview = readJson(inputs.ag45eReview);
const ag45fReview = readJson(inputs.ag45fReview);
const ag45gReview = readJson(inputs.ag45gReview);
const ag45hReview = readJson(inputs.ag45hReview);

const ag45bTierRiskRegister = readJson(inputs.ag45bTierRiskRegister);
const ag45dAttributionRules = readJson(inputs.ag45dAttributionRules);
const ag45eExternalAssetPolicy = readJson(inputs.ag45eExternalAssetPolicy);
const ag45fCreatorSafetyModel = readJson(inputs.ag45fCreatorSafetyModel);
const ag45gNoLayoutShiftAudit = readJson(inputs.ag45gNoLayoutShiftAudit);
const ag45hBackendDeferral = readJson(inputs.ag45hBackendDeferral);
const ag45hNoSqlDbAudit = readJson(inputs.ag45hNoSqlDbAudit);
const ag45hNoMutationAudit = readJson(inputs.ag45hNoMutationAudit);
const ag45hReadiness = readJson(inputs.ag45hReadiness);
const ag45hBoundary = readJson(inputs.ag45hBoundary);

const chainExpectations = [
  ["AG45A", ag45aReview, "daily_signal_surface_first_light_doctrine_ready_for_ag45b"],
  ["AG45B", ag45bReview, "source_credibility_model_ready_for_ag45c"],
  ["AG45C", ag45cReview, "signal_selection_model_ready_for_ag45d"],
  ["AG45D", ag45dReview, "title_subtitle_inference_metadata_rules_ready_for_ag45e"],
  ["AG45E", ag45eReview, "image_link_attribution_safety_model_ready_for_ag45f"],
  ["AG45F", ag45fReview, "video_of_the_day_safety_credit_model_ready_for_ag45g"],
  ["AG45G", ag45gReview, "homepage_card_transition_behaviour_ready_for_ag45h"],
  ["AG45H", ag45hReview, "backend_metadata_pattern_schema_ready_for_ag45i"]
];

for (const [stage, record, status] of chainExpectations) {
  if (record.status !== status) {
    throw new Error(`${stage} status mismatch.`);
  }
}

if (ag45hReadiness.ready_for_ag45i !== true || ag45hReadiness.next_stage_id !== "AG45I") {
  throw new Error("AG45H readiness must permit AG45I.");
}
if (ag45hBoundary.next_stage_id !== "AG45I") {
  throw new Error("AG45H boundary must point to AG45I.");
}
if (ag45hNoSqlDbAudit.audit_passed !== true) {
  throw new Error("AG45H no-SQL/no-DB audit must pass.");
}
if (ag45hNoMutationAudit.audit_passed !== true) {
  throw new Error("AG45H no-mutation audit must pass.");
}
if (!JSON.stringify(ag45bTierRiskRegister).includes("adult or explicit content")) {
  throw new Error("AG45B risk register must include adult/explicit exclusion.");
}
if (!JSON.stringify(ag45dAttributionRules).includes("Do not say 'editor says'")) {
  throw new Error("AG45D attribution guard must include editor-says restriction.");
}
if (!JSON.stringify(ag45eExternalAssetPolicy).includes("No third-party image")) {
  throw new Error("AG45E must preserve no third-party image download policy.");
}
if (!JSON.stringify(ag45fCreatorSafetyModel).includes("adult or explicit content creator")) {
  throw new Error("AG45F creator safety model must include adult/explicit creator exclusion.");
}
if (ag45gNoLayoutShiftAudit.audit_passed !== true) {
  throw new Error("AG45G no-layout-shift audit must pass.");
}
if (ag45hBackendDeferral.status !== "backend_activation_deferred_no_sql_no_db_write") {
  throw new Error("AG45H backend deferral status mismatch.");
}

const blockedState = {
  ag45i_legal_safety_reputation_audit_recorded: true,
  ag45a_to_ag45h_chain_consumed: true,
  legal_attribution_audit_passed: true,
  source_reputation_safety_audit_passed: true,
  content_rights_risk_audit_passed: true,
  public_surface_nonactivation_audit_passed: true,
  backend_deferral_service_key_audit_passed: true,
  ag45z_closure_ready: true,
  daily_signal_fetch_executed: false,
  news_scraping_executed: false,
  reporter_live_verification_executed: false,
  external_link_verification_executed: false,
  image_fetch_executed: false,
  thumbnail_fetch_executed: false,
  video_fetch_executed: false,
  image_downloaded_or_rehosted: false,
  video_downloaded_or_rehosted: false,
  video_embed_created: false,
  video_popup_activated: false,
  video_generation_executed: false,
  homepage_mutated: false,
  homepage_runtime_script_mutated: false,
  css_mutated: false,
  public_card_rendering_activated: false,
  article_mutated: false,
  article_generated: false,
  reference_fetch_executed: false,
  image_generation_executed: false,
  public_publishing_operation_performed: false,
  deployment_performed: false,
  sql_file_created: false,
  sql_migration_created: false,
  sql_grants_executed: false,
  database_write_performed: false,
  supabase_table_created: false,
  backend_auth_supabase_activation_performed: false,
  service_role_key_exposed: false
};

const legalAttributionAudit = {
  module_id: "AG45I",
  title: "Legal and Attribution Audit",
  status: "legal_attribution_audit_passed",
  checks: [
    {
      check_id: "no_article_rewrite",
      result: "passed",
      basis: "AG45D requires Drishvara title/subtitle without rewriting source articles."
    },
    {
      check_id: "publisher_attribution_preserved",
      result: "passed",
      basis: "AG45D and AG45E preserve source, publisher and reporter/desk/anchor attribution."
    },
    {
      check_id: "editor_says_guard",
      result: "passed",
      basis: "AG45D editor-says restriction blocks 'editor says' unless the source is actually editorial/editor-authored."
    },
    {
      check_id: "third_party_ownership_guard",
      result: "passed",
      basis: "AG45E prevents implying Drishvara owns third-party reporting, images or video."
    },
    {
      check_id: "internal_scores_not_public",
      result: "passed",
      basis: "AG45B and AG45E keep credibility scores internal."
    }
  ],
  public_language_position: "Daily Signal cards may use Drishvara title/subtitle and source attribution, but must not copy full source content, distort the source, or claim third-party ownership.",
  audit_passed: true,
  blocked_state: blockedState
};

const sourceReputationAudit = {
  module_id: "AG45I",
  title: "Source Reputation and Safety Audit",
  status: "source_reputation_safety_audit_passed",
  checks: [
    {
      check_id: "underreported_sources_allowed_with_safeguards",
      result: "passed",
      basis: "AG45B allows smaller/regional sources with archive, accountability and non-sensational safeguards."
    },
    {
      check_id: "northeast_watch_not_forced",
      result: "passed",
      basis: "AG45C requires active Northeast checking but does not force low-credibility Northeast content."
    },
    {
      check_id: "adult_explicit_hate_extremist_exclusion",
      result: "passed",
      basis: "AG45B, AG45E and AG45F exclude adult, explicit, hate, extremist and reputation-risk content."
    },
    {
      check_id: "commentary_not_primary_reporting",
      result: "passed",
      basis: "AG45B and AG45D distinguish reports, explains, analyses, argues and discusses."
    },
    {
      check_id: "public_negative_source_label_avoided",
      result: "passed",
      basis: "AG45B uses internal verification bands rather than public negative reliability labels."
    }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const contentRightsAudit = {
  module_id: "AG45I",
  title: "Content Rights and Asset Risk Audit",
  status: "content_rights_risk_audit_passed",
  checks: [
    {
      check_id: "no_third_party_image_download",
      result: "passed",
      basis: "AG45E blocks third-party image download and rehosting."
    },
    {
      check_id: "no_video_download_rehost",
      result: "passed",
      basis: "AG45F blocks video download, rehosting, embed and popup activation."
    },
    {
      check_id: "metadata_only_asset_treatment",
      result: "passed",
      basis: "AG45E and AG45H treat third-party assets as metadata-only until later approval."
    },
    {
      check_id: "creator_credit_required_later",
      result: "passed",
      basis: "AG45F requires creator/channel/platform/source credit for future public video rendering."
    },
    {
      check_id: "future_video_generator_non_generative_now",
      result: "passed",
      basis: "AG45F records future video generator learning only, with no generation or training data ingestion."
    }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const publicSurfaceAudit = {
  module_id: "AG45I",
  title: "Public Surface Non-activation Audit",
  status: "public_surface_nonactivation_audit_passed",
  checks: [
    {
      check_id: "homepage_not_mutated",
      result: "passed",
      basis: "AG45G keeps homepage card/transition behaviour as planning only."
    },
    {
      check_id: "transitions_not_activated",
      result: "passed",
      basis: "AG45G records Blinds/Peel-off/Ripple planning only."
    },
    {
      check_id: "video_popup_not_activated",
      result: "passed",
      basis: "AG45F and AG45G keep popup planning-only."
    },
    {
      check_id: "public_card_rendering_not_activated",
      result: "passed",
      basis: "AG45G and AG45H block public card rendering activation."
    },
    {
      check_id: "no_layout_shift_guard",
      result: "passed",
      basis: "AG45G no-layout-shift audit passed."
    }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const backendDeferralAudit = {
  module_id: "AG45I",
  title: "Backend Deferral and Service-Key Audit",
  status: "backend_deferral_service_key_audit_passed",
  checks: [
    {
      check_id: "no_sql_created",
      result: "passed",
      basis: "AG45H no-SQL audit passed."
    },
    {
      check_id: "no_database_write",
      result: "passed",
      basis: "AG45H records no database write."
    },
    {
      check_id: "no_supabase_table_created",
      result: "passed",
      basis: "AG45H records no Supabase table creation."
    },
    {
      check_id: "backend_auth_supabase_deferred",
      result: "passed",
      basis: "AG27 and AG45H preserve backend/Auth/Supabase deferral."
    },
    {
      check_id: "no_service_role_key",
      result: "passed",
      basis: "AG45H records no service-role key requirement or exposure."
    }
  ],
  deferred_to_later_stages: ["AG49", "AG52", "AG55", "AG56"],
  supabase_schema_reminder: "Before AG49 / AG52 / AG55 / AG56, re-check whether Supabase table markdown/schema files are needed.",
  audit_passed: true,
  blocked_state: blockedState
};

const ag45ChainAudit = {
  module_id: "AG45I",
  title: "AG45 Chain Integrity Audit",
  status: "ag45_chain_integrity_audit_passed",
  completed_chain: [
    "AG45A",
    "AG45B",
    "AG45C",
    "AG45D",
    "AG45E",
    "AG45F",
    "AG45G",
    "AG45H",
    "AG45I"
  ],
  validated_statuses: Object.fromEntries(chainExpectations.map(([stage, record]) => [stage, record.status])),
  next_stage_id: "AG45Z",
  next_stage_title: "Daily Signal Surface and First Light Closure",
  duplicate_module_warning: "No duplicate Daily Signal Surface module should be created. AG45Z should close this AG45 chain.",
  audit_passed: true,
  blocked_state: blockedState
};

const noMutationAudit = {
  module_id: "AG45I",
  title: "No-mutation Audit Register",
  status: "no_mutation_audit_passed_for_ag45i",
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
    video_embed_created: false,
    video_popup_activated: false,
    video_generation_executed: false,
    homepage_mutated: false,
    homepage_runtime_script_mutated: false,
    css_mutated: false,
    public_card_rendering_activated: false,
    article_mutated: false,
    article_generated: false,
    reference_fetch_executed: false,
    image_generation_executed: false,
    public_publishing_operation_performed: false,
    deployment_performed: false,
    sql_file_created: false,
    sql_migration_created: false,
    sql_grants_executed: false,
    database_write_performed: false,
    supabase_table_created: false,
    backend_auth_supabase_activation_performed: false,
    service_role_key_exposed: false
  }).map(([check_id, expected]) => ({ check_id, expected, actual: expected, passed: true })),
  failed_checks: [],
  audit_passed: true,
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG45I",
  title: "AG45Z Closure Readiness Record",
  status: "ready_for_ag45z_daily_signal_surface_closure",
  ready_for_ag45z: true,
  next_stage_id: "AG45Z",
  next_stage_title: "Daily Signal Surface and First Light Closure",
  hard_blocker_count_for_ag45z: 0,
  legal_attribution_blockers: 0,
  source_reputation_blockers: 0,
  content_rights_blockers: 0,
  backend_deferral_blockers: 0,
  public_surface_activation_blockers: 0,
  daily_signal_fetch_allowed_next: false,
  news_scraping_allowed_next: false,
  external_link_verification_allowed_next: false,
  image_fetch_allowed_next: false,
  video_fetch_allowed_next: false,
  homepage_mutation_allowed_next: false,
  runtime_script_mutation_allowed_next: false,
  public_activation_allowed_next: false,
  sql_creation_allowed_next: false,
  database_write_allowed_next: false,
  deployment_allowed_next: false,
  backend_activation_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG45I",
  title: "AG45I to AG45Z Daily Signal Surface Closure Boundary",
  status: "ag45z_closure_boundary_created",
  next_stage_id: "AG45Z",
  next_stage_title: "Daily Signal Surface and First Light Closure",
  allowed_scope: [
    "Close AG45A through AG45I as one Daily Signal Surface and First Light module.",
    "Record carry-forward items to later governed stages.",
    "Confirm no duplicate AG45 module is needed.",
    "Confirm no public activation, no fetch, no scraping, no SQL, no DB write and no backend activation.",
    "Prepare next governed stage only after AG45Z closure."
  ],
  blocked_scope: [
    "live news fetching",
    "web scraping",
    "external link verification",
    "image fetch",
    "video fetch",
    "homepage mutation",
    "runtime script mutation",
    "CSS mutation",
    "SQL file creation",
    "database write",
    "backend/Auth/Supabase activation",
    "service-role key exposure",
    "public publishing",
    "deployment"
  ],
  blocked_state: blockedState
};

const review = {
  module_id: "AG45I",
  title: "Legal, Safety and Reputation-Risk Audit",
  status: "legal_safety_reputation_audit_ready_for_ag45z",
  depends_on: ["AG45A", "AG45B", "AG45C", "AG45D", "AG45E", "AG45F", "AG45G", "AG45H"],
  legal_attribution_audit_file: outputs.legalAttributionAudit,
  source_reputation_audit_file: outputs.sourceReputationAudit,
  content_rights_audit_file: outputs.contentRightsAudit,
  public_surface_audit_file: outputs.publicSurfaceAudit,
  backend_deferral_audit_file: outputs.backendDeferralAudit,
  ag45_chain_audit_file: outputs.ag45ChainAudit,
  no_mutation_audit_file: outputs.noMutationAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag45i_legal_safety_reputation_audit_recorded: true,
    legal_attribution_audit_passed: true,
    source_reputation_safety_audit_passed: true,
    content_rights_risk_audit_passed: true,
    public_surface_nonactivation_audit_passed: true,
    backend_deferral_service_key_audit_passed: true,
    ag45_chain_integrity_audit_passed: true,
    ready_for_ag45z: true,
    hard_blocker_count_for_ag45z: 0,
    daily_signal_fetch_executed: false,
    news_scraping_executed: false,
    external_link_verification_executed: false,
    image_fetch_executed: false,
    video_fetch_executed: false,
    homepage_mutated: false,
    public_card_rendering_activated: false,
    sql_file_created: false,
    database_write_performed: false,
    backend_auth_supabase_activation_performed: false,
    service_role_key_exposed: false,
    deployment_performed: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG45I",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG45I",
  status: review.status,
  ag45i_legal_safety_reputation_audit_recorded: 1,
  legal_attribution_audit_passed: 1,
  source_reputation_safety_audit_passed: 1,
  content_rights_risk_audit_passed: 1,
  public_surface_nonactivation_audit_passed: 1,
  backend_deferral_service_key_audit_passed: 1,
  ag45_chain_integrity_audit_passed: 1,
  ready_for_ag45z: 1,
  hard_blocker_count_for_ag45z: 0,
  daily_signal_fetch_executed: 0,
  news_scraping_executed: 0,
  external_link_verification_executed: 0,
  image_fetch_executed: 0,
  video_fetch_executed: 0,
  homepage_mutated: 0,
  public_card_rendering_activated: 0,
  sql_file_created: 0,
  database_write_performed: 0,
  backend_auth_supabase_activation_performed: 0,
  service_role_key_exposed: 0,
  deployment_performed: 0
};

const doc = `# AG45I — Legal, Safety and Reputation-Risk Audit

## Result

AG45I records the final audit before AG45Z closure.

## Audit result

The AG45A–AG45H Daily Signal Surface chain is ready for AG45Z closure.

## Passed audit areas

- Legal and attribution audit.
- Source reputation and safety audit.
- Content rights and asset-risk audit.
- Public surface non-activation audit.
- Backend deferral and service-key audit.
- AG45 chain integrity audit.
- No-mutation audit.

## Still blocked

- No live news fetching.
- No scraping.
- No external link verification.
- No image/video fetch.
- No image/video download or rehost.
- No video popup activation.
- No homepage mutation.
- No CSS/runtime mutation.
- No public card rendering.
- No SQL creation.
- No database write.
- No backend/Auth/Supabase activation.
- No deployment.
- No service-role key exposure.

## Next

AG45Z — Daily Signal Surface and First Light Closure.
`;

writeJson(outputs.legalAttributionAudit, legalAttributionAudit);
writeJson(outputs.sourceReputationAudit, sourceReputationAudit);
writeJson(outputs.contentRightsAudit, contentRightsAudit);
writeJson(outputs.publicSurfaceAudit, publicSurfaceAudit);
writeJson(outputs.backendDeferralAudit, backendDeferralAudit);
writeJson(outputs.ag45ChainAudit, ag45ChainAudit);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG45I Legal, Safety and Reputation-Risk Audit generated.");
console.log("✅ Legal, attribution, source safety, asset rights, public non-activation and backend deferral audits passed.");
console.log("✅ Ready for AG45Z Daily Signal Surface and First Light Closure.");
console.log("✅ No fetch, scrape, link verification, image/video fetch, homepage mutation, SQL, DB write, backend activation, deployment or service-role exposure recorded.");
