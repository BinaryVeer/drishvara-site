import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag09fReview: "data/content-intelligence/quality-reviews/ag09f-controlled-publish-preparation-live-verification-plan.json",
  ag09fPlan: "data/content-intelligence/mutation-plans/ag09f-controlled-publish-preparation-live-verification-plan.json",
  ag09fReadiness: "data/content-intelligence/quality-registry/ag09f-live-verification-readiness.json",
  ag09fBoundary: "data/content-intelligence/mutation-plans/ag09f-to-ag09g-controlled-live-verification-boundary.json",
  ag09eDecision: "data/content-intelligence/approval-registry/ag09e-editorial-publish-decision-record.json",
  ag09cApply: "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag09g-controlled-live-verification-deployment-observation-audit.json");
const auditReportPath = path.join(root, "data/content-intelligence/audit-records/ag09g-controlled-live-verification-deployment-observation-audit-report.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag09g-live-public-readiness-observation.json");
const nextBoundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag09g-to-ag09h-final-editorial-publish-approval-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/controlled-live-verification-deployment-observation-audit.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag09g-controlled-live-verification-deployment-observation-audit-learning.json");
const registryPath = path.join(root, "data/quality/ag09g-controlled-live-verification-deployment-observation-audit.json");
const previewPath = path.join(root, "data/quality/ag09g-controlled-live-verification-deployment-observation-audit-preview.json");
const docPath = path.join(root, "docs/quality/AG09G_CONTROLLED_LIVE_VERIFICATION_DEPLOYMENT_OBSERVATION_AUDIT.md");

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

function includesAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

async function fetchText(url, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = new Date().toISOString();

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "Drishvara-AG09G-live-verification-audit/1.0"
      }
    });

    const text = await response.text();
    return {
      url,
      attempted: true,
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      ok: response.ok,
      status: response.status,
      status_text: response.statusText,
      final_url: response.url,
      content_type: response.headers.get("content-type"),
      body_length: text.length,
      body_sha256: sha256(text),
      body_text: text,
      error: null
    };
  } catch (error) {
    return {
      url,
      attempted: true,
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      ok: false,
      status: null,
      status_text: null,
      final_url: null,
      content_type: null,
      body_length: 0,
      body_sha256: null,
      body_text: "",
      error: String(error?.message || error)
    };
  } finally {
    clearTimeout(timer);
  }
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) throw new Error(`Missing required AG09G input ${name}: ${relativePath}`);
}

const ag09fReview = readJson(inputs.ag09fReview);
const ag09fPlan = readJson(inputs.ag09fPlan);
const ag09fReadiness = readJson(inputs.ag09fReadiness);
const ag09fBoundary = readJson(inputs.ag09fBoundary);
const ag09eDecision = readJson(inputs.ag09eDecision);
const ag09cApply = readJson(inputs.ag09cApply);

if (ag09fReview.status !== "publish_preparation_live_verification_plan_created_not_executed") {
  throw new Error("AG09G requires AG09F plan to be created.");
}

if (ag09fReadiness.status !== "live_verification_plan_ready_pending_explicit_ag09g") {
  throw new Error("AG09G requires AG09F readiness.");
}

if (ag09fBoundary.next_stage_id !== "AG09G" || ag09fBoundary.explicit_approval_required !== true) {
  throw new Error("AG09G requires AG09F to AG09G explicit boundary.");
}

if (ag09eDecision.editorial_publish_approved !== false) {
  throw new Error("AG09G cannot run if publishing was already approved.");
}

const selectedArticlePath = ag09cApply.selected_article_path;
if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);

const articleHtmlLocal = fs.readFileSync(path.join(root, selectedArticlePath), "utf8");
const articleHashLocal = sha256(articleHtmlLocal);

if (articleHashLocal !== ag09cApply.post_correction_hash) {
  throw new Error("AG09G selected article hash must match AG09C post-correction hash.");
}

const liveArticleUrl = ag09fPlan.live_article_url || `https://drishvara.com/${selectedArticlePath}`;
const liveHomeUrl = "https://drishvara.com/";

const articleFetch = await fetchText(liveArticleUrl);
const homeFetch = await fetchText(liveHomeUrl);

const articleBody = articleFetch.body_text || "";
const homeBody = homeFetch.body_text || "";

const noMutationControls = {
  controlled_live_verification_observation_audit_only: true,
  selected_article_read_performed: true,
  live_url_fetch_performed_in_ag09g: true,
  article_live_fetch_performed_in_ag09g: articleFetch.attempted,
  homepage_live_fetch_performed_in_ag09g: homeFetch.attempted,
  article_mutation_performed_in_ag09g: false,
  selected_article_file_write_performed_in_ag09g: false,
  homepage_mutation_performed_in_ag09g: false,
  css_mutation_performed_in_ag09g: false,
  js_mutation_performed_in_ag09g: false,
  reference_insertion_performed_in_ag09g: false,
  reference_url_change_performed_in_ag09g: false,
  visual_generation_performed_in_ag09g: false,
  image_asset_creation_performed_in_ag09g: false,
  image_insertion_performed_in_ag09g: false,
  deployment_trigger_performed_in_ag09g: false,
  production_jsonl_append_performed_in_ag09g: false,
  database_write_performed_in_ag09g: false,
  supabase_write_performed_in_ag09g: false,
  backend_auth_supabase_activation_performed_in_ag09g: false,
  public_publishing_performed_in_ag09g: false,
  publishing_approval_granted_in_ag09g: false,
  rollback_execution_performed_in_ag09g: false
};

const liveArticleObservation = {
  check_id: "AG09G-LIVE-001",
  area: "article_url",
  target: liveArticleUrl,
  fetch_ok: articleFetch.ok,
  status_code: articleFetch.status,
  final_url: articleFetch.final_url,
  body_length: articleFetch.body_length,
  body_sha256: articleFetch.body_sha256,
  error: articleFetch.error,
  status: articleFetch.ok && articleFetch.status === 200 ? "passed" : "review_required"
};

const heroVisualObservation = {
  check_id: "AG09G-LIVE-002",
  area: "hero_visual",
  target: liveArticleUrl,
  expected_asset_path: ag09cApply.metadata_applied?.og_image || null,
  contains_ag08k_marker: articleBody.includes("AG08K-HERO-VISUAL-INSERTION"),
  contains_svg_path: articleBody.includes("ag08ka-primary-hero.svg"),
  contains_caption_or_credit:
    includesAny(articleBody, ["Image credit", "Visual credit", "Drishvara editorial visual", "caption"]),
  status:
    articleFetch.ok &&
    (articleBody.includes("ag08ka-primary-hero.svg") || articleBody.includes("AG08K-HERO-VISUAL-INSERTION"))
      ? "passed"
      : "review_required"
};

const metadataObservation = {
  check_id: "AG09G-LIVE-003",
  area: "metadata_social_preview",
  target: liveArticleUrl,
  contains_ag09c_marker: articleBody.includes("AG09C-PUBLIC-EXPERIENCE-METADATA"),
  contains_canonical: articleBody.includes('rel="canonical"') || articleBody.includes("rel='canonical'"),
  contains_description: articleBody.includes('name="description"') || articleBody.includes("name='description'"),
  contains_og_title: articleBody.includes('property="og:title"') || articleBody.includes("property='og:title'"),
  contains_og_description: articleBody.includes('property="og:description"') || articleBody.includes("property='og:description'"),
  contains_og_image: articleBody.includes('property="og:image"') || articleBody.includes("property='og:image'"),
  contains_twitter_card: articleBody.includes('name="twitter:card"') || articleBody.includes("name='twitter:card'"),
  contains_twitter_image: articleBody.includes('name="twitter:image"') || articleBody.includes("name='twitter:image'"),
  status:
    articleFetch.ok &&
    articleBody.includes("AG09C-PUBLIC-EXPERIENCE-METADATA") &&
    (articleBody.includes('property="og:title"') || articleBody.includes("property='og:title'")) &&
    (articleBody.includes('name="twitter:card"') || articleBody.includes("name='twitter:card'"))
      ? "passed"
      : "review_required"
};

const referenceObservation = {
  check_id: "AG09G-LIVE-004",
  area: "references",
  target: liveArticleUrl,
  contains_ag08g_reference_marker: articleBody.includes("AG08G-APPROVED-REFERENCES"),
  contains_legacy_governance_marker: articleBody.includes("AG08G-LEGACY-GOVERNANCE-PRESERVED"),
  contains_reference_text: includesAny(articleBody.toLowerCase(), ["reference", "source", "evidence"]),
  status:
    articleFetch.ok &&
    (articleBody.includes("AG08G-APPROVED-REFERENCES") || includesAny(articleBody.toLowerCase(), ["reference", "source"]))
      ? "passed"
      : "review_required"
};

const homepageObservation = {
  check_id: "AG09G-LIVE-005",
  area: "homepage_listing",
  target: liveHomeUrl,
  fetch_ok: homeFetch.ok,
  status_code: homeFetch.status,
  final_url: homeFetch.final_url,
  body_length: homeFetch.body_length,
  body_sha256: homeFetch.body_sha256,
  error: homeFetch.error,
  contains_ag09c_listing_marker: homeBody.includes("AG09C-PUBLIC-EXPERIENCE-LISTING"),
  contains_selected_article_path: homeBody.includes(selectedArticlePath),
  contains_selected_article_slug: homeBody.includes(path.basename(selectedArticlePath)),
  status:
    homeFetch.ok &&
    (homeBody.includes(selectedArticlePath) || homeBody.includes(path.basename(selectedArticlePath)))
      ? "passed"
      : "review_required"
};

const mobileLayoutObservation = {
  check_id: "AG09G-LIVE-006",
  area: "mobile_layout",
  target: liveArticleUrl,
  automated_fetch_completed: articleFetch.attempted,
  automated_dom_layout_render_performed: false,
  manual_mobile_review_required: true,
  status: "manual_review_required",
  note: "AG09G records live HTML availability. Browser viewport/mobile visual inspection remains a manual or later browser-automation check."
};

const forbiddenSystemObservation = {
  check_id: "AG09G-LIVE-007",
  area: "forbidden_systems",
  target: "static public-readiness boundary",
  deployment_trigger_performed: false,
  backend_auth_supabase_activation_performed: false,
  database_write_performed: false,
  production_jsonl_append_performed: false,
  publishing_approval_granted: false,
  status: "passed"
};

const observations = [
  liveArticleObservation,
  heroVisualObservation,
  metadataObservation,
  referenceObservation,
  homepageObservation,
  mobileLayoutObservation,
  forbiddenSystemObservation
];

const blockingFailures = observations.filter((item) => item.status === "failed");
const reviewRequired = observations.filter((item) => item.status === "review_required" || item.status === "manual_review_required");

const auditStatus = blockingFailures.length === 0 && reviewRequired.length === 0
  ? "controlled_live_verification_passed_not_publish_approved"
  : "controlled_live_verification_completed_with_review_required";

const readinessStatus = auditStatus === "controlled_live_verification_passed_not_publish_approved"
  ? "live_public_readiness_observed_pending_final_editorial_approval"
  : "live_public_readiness_observed_with_review_items";

const auditReport = {
  module_id: "AG09G",
  title: "Controlled Live Verification and Deployment Observation Audit Report",
  status: auditStatus,
  selected_article_path: selectedArticlePath,
  live_article_url: liveArticleUrl,
  live_home_url: liveHomeUrl,
  local_article_hash: articleHashLocal,
  generated_from: inputs,
  observations,
  observation_summary: {
    total_observations: observations.length,
    passed: observations.filter((item) => item.status === "passed").length,
    review_required: reviewRequired.length,
    failed: blockingFailures.length,
    manual_review_required: observations.filter((item) => item.status === "manual_review_required").length
  },
  live_fetch_evidence: {
    article: {
      url: articleFetch.url,
      ok: articleFetch.ok,
      status: articleFetch.status,
      final_url: articleFetch.final_url,
      content_type: articleFetch.content_type,
      body_length: articleFetch.body_length,
      body_sha256: articleFetch.body_sha256,
      error: articleFetch.error
    },
    homepage: {
      url: homeFetch.url,
      ok: homeFetch.ok,
      status: homeFetch.status,
      final_url: homeFetch.final_url,
      content_type: homeFetch.content_type,
      body_length: homeFetch.body_length,
      body_sha256: homeFetch.body_sha256,
      error: homeFetch.error
    }
  },
  publish_readiness: "blocked_pending_explicit_final_editorial_approval",
  ...noMutationControls
};

const readiness = {
  module_id: "AG09G",
  title: "Live Public Readiness Observation",
  status: readinessStatus,
  selected_article_path: selectedArticlePath,
  live_article_url: liveArticleUrl,
  live_home_url: liveHomeUrl,
  live_observation_completed: true,
  live_observation_passed_without_review_items: auditStatus === "controlled_live_verification_passed_not_publish_approved",
  review_required_count: reviewRequired.length,
  publish_ready: false,
  publish_approval_granted: false,
  publish_readiness: "blocked_pending_explicit_final_editorial_approval",
  backend_activation_ready: false,
  database_activation_ready: false,
  supabase_activation_ready: false,
  ...noMutationControls
};

const nextBoundary = {
  module_id: "AG09G",
  title: "AG09G to AG09H Final Editorial Publish Approval Boundary",
  status: "future_final_editorial_publish_approval_boundary_created_not_executed",
  selected_article_path: selectedArticlePath,
  live_article_url: liveArticleUrl,
  next_stage_id: "AG09H",
  next_stage_title: "Final Editorial Publish Approval or Hold Decision",
  explicit_approval_required: true,
  ag09h_allowed_scope: [
    "Record final editorial approval or hold decision.",
    "If approved, record that static article is editorially publish-approved.",
    "If held, record review items and keep publishing blocked.",
    "Carry forward live verification evidence."
  ],
  ag09h_blocked_scope: [
    "No new article mutation.",
    "No homepage mutation.",
    "No CSS/JS mutation.",
    "No reference URL change.",
    "No new visual/image generation or insertion.",
    "No backend/Auth/Supabase/database activation unless separately approved.",
    "No automated deployment trigger."
  ],
  ...noMutationControls
};

const schema = {
  module_id: "AG09G",
  title: "Controlled Live Verification and Deployment Observation Audit Schema",
  status: "schema_live_verification_observation_audit_only",
  live_url_fetch_allowed_in_ag09g: true,
  live_observation_audit_allowed_in_ag09g: true,
  ag09h_boundary_allowed_in_ag09g: true,
  article_mutation_allowed_in_ag09g: false,
  homepage_mutation_allowed_in_ag09g: false,
  css_js_mutation_allowed_in_ag09g: false,
  reference_insertion_allowed_in_ag09g: false,
  reference_url_change_allowed_in_ag09g: false,
  visual_generation_allowed_in_ag09g: false,
  image_asset_creation_allowed_in_ag09g: false,
  image_insertion_allowed_in_ag09g: false,
  deployment_trigger_allowed_in_ag09g: false,
  production_jsonl_append_allowed_in_ag09g: false,
  database_write_allowed_in_ag09g: false,
  supabase_write_allowed_in_ag09g: false,
  backend_auth_supabase_activation_allowed_in_ag09g: false,
  publishing_allowed_in_ag09g: false,
  publishing_approval_allowed_in_ag09g: false,
  rollback_execution_allowed_in_ag09g: false,
  ...noMutationControls
};

const summary = {
  selected_article_path: selectedArticlePath,
  live_article_url: liveArticleUrl,
  live_home_url: liveHomeUrl,
  audit_status: auditStatus,
  readiness_status: readinessStatus,
  observation_summary: auditReport.observation_summary,
  publish_readiness: readiness.publish_readiness,
  publish_approval_granted: false,
  public_publishing_performed: false,
  next_stage_id: "AG09H",
  next_stage_title: "Final Editorial Publish Approval or Hold Decision",
  next_stage_requires_explicit_approval: true,
  ...noMutationControls
};

const review = {
  module_id: "AG09G",
  title: "Controlled Live Verification and Deployment Observation Audit",
  status: auditStatus,
  depends_on: ["AG09F", "AG09E", "AG09D"],
  generated_from: inputs,
  summary,
  audit_report_file: "data/content-intelligence/audit-records/ag09g-controlled-live-verification-deployment-observation-audit-report.json",
  readiness_file: "data/content-intelligence/quality-registry/ag09g-live-public-readiness-observation.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag09g-to-ag09h-final-editorial-publish-approval-boundary.json",
  schema_file: "data/content-intelligence/schema/controlled-live-verification-deployment-observation-audit.schema.json",
  learning_file: "data/content-intelligence/learning/ag09g-controlled-live-verification-deployment-observation-audit-learning.json",
  closure_decision: {
    decision: "ag09g_live_verification_observed_pending_explicit_final_editorial_decision",
    proceed_to_ag09h_only_with_explicit_user_approval: true,
    publish_approval_granted: false,
    public_publishing_performed: false,
    ...noMutationControls
  },
  ...noMutationControls
};

const learning = {
  module_id: "AG09G",
  title: "Controlled Live Verification and Deployment Observation Audit Learning",
  status: "learning_record_only",
  summary,
  learning_points: [
    "Live URL verification is evidence gathering, not publish approval.",
    "HTML fetch can confirm availability and metadata, but mobile layout still needs manual or browser-based visual review.",
    "Final editorial approval remains separate even if live observation passes.",
    "Backend/Auth/Supabase/database activation remains outside this static article workflow."
  ],
  ...noMutationControls
};

const registry = {
  module_id: "AG09G",
  title: "Controlled Live Verification and Deployment Observation Audit",
  status: auditStatus,
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag09g-controlled-live-verification-deployment-observation-audit.json",
    audit_report: "data/content-intelligence/audit-records/ag09g-controlled-live-verification-deployment-observation-audit-report.json",
    readiness: "data/content-intelligence/quality-registry/ag09g-live-public-readiness-observation.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag09g-to-ag09h-final-editorial-publish-approval-boundary.json",
    schema: "data/content-intelligence/schema/controlled-live-verification-deployment-observation-audit.schema.json",
    learning: "data/content-intelligence/learning/ag09g-controlled-live-verification-deployment-observation-audit-learning.json",
    preview: "data/quality/ag09g-controlled-live-verification-deployment-observation-audit-preview.json",
    document: "docs/quality/AG09G_CONTROLLED_LIVE_VERIFICATION_DEPLOYMENT_OBSERVATION_AUDIT.md"
  },
  summary,
  ...noMutationControls
};

const preview = {
  module_id: "AG09G",
  preview_only: true,
  status: auditStatus,
  summary,
  observations,
  ag09h_handoff: nextBoundary,
  ...noMutationControls
};

const doc = `# AG09G — Controlled Live Verification and Deployment Observation Audit

## Purpose

AG09G performs controlled live URL verification and deployment observation for the AG09F-planned article.

AG09G is audit/observation-only. It may fetch live URLs for evidence, but it does not mutate files, trigger deployment, activate backend/Auth/Supabase/database paths, approve publishing or publish anything.

## Live Targets

- Article URL: \`${liveArticleUrl}\`
- Homepage URL: \`${liveHomeUrl}\`

## Result

- Status: \`${auditStatus}\`
- Review-required observations: \`${reviewRequired.length}\`
- Publish readiness: \`${readiness.publish_readiness}\`

## Boundary

Final editorial publish approval remains blocked and separate.

## Next Stage

AG09H — Final Editorial Publish Approval or Hold Decision — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(auditReportPath, auditReport);
writeJson(readinessPath, readiness);
writeJson(nextBoundaryPath, nextBoundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

const articleHashAfter = sha256(fs.readFileSync(path.join(root, selectedArticlePath), "utf8"));
if (articleHashAfter !== articleHashLocal) {
  throw new Error("AG09G attempted to mutate selected article. Refusing to continue.");
}

console.log("✅ AG09G controlled live verification and deployment observation audit artifacts generated.");
console.log(`✅ Article live fetch: ${articleFetch.ok ? "ok" : "review_required"} (${articleFetch.status ?? articleFetch.error})`);
console.log(`✅ Homepage live fetch: ${homeFetch.ok ? "ok" : "review_required"} (${homeFetch.status ?? homeFetch.error})`);
console.log(`✅ Audit status: ${auditStatus}`);
console.log("✅ No mutation, deployment trigger, backend activation or publishing performed.");
console.log("✅ AG09H handoff created with explicit approval required.");
