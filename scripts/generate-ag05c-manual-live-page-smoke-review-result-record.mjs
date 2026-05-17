import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const configPath = path.join(root, "data", "quality", "ag05c-manual-live-page-smoke-review-result-record.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

const config = readJson(configPath);
const ag05b = readJson(path.join(root, config.input_files.ag05b_checklist));

if (ag05b.module_id !== "AG05B") {
  throw new Error("Input checklist must be AG05B.");
}
if (ag05b.summary?.ready_for_ag05c_manual_live_review_result_record !== true) {
  throw new Error("AG05B must authorize AG05C.");
}

const observations = [
  {
    observation_id: "AG05C_OBS_001",
    review_area: "homepage",
    status: "passed_manual_live_review",
    target: "homepage / featured reads surface",
    observation: "Homepage and Featured Reads area render properly; article cards and Panchang panel are visible and stable.",
    correction_required: false
  },
  {
    observation_id: "AG05C_OBS_002",
    review_area: "insights",
    status: "passed_with_note",
    target: "insights page",
    observation: "Insights page renders published reads and topic map. It shows 77 published HTML reads, while AG03/AG04 governance closure covered 72 queued article pages.",
    correction_required: false,
    note: "The 77 vs 72 difference should be carried as an index/governance coverage note, not a visual failure."
  },
  {
    observation_id: "AG05C_OBS_003",
    review_area: "article_visual_credit_width",
    status: "passed_manual_live_review",
    target: "sample article pages",
    observation: "Article visual, image credit/attribution line, broad reading surface and article body layout are visible.",
    correction_required: false
  },
  {
    observation_id: "AG05C_OBS_004",
    review_area: "article_reference_source_presence",
    status: "passed_manual_live_review",
    target: config.manual_review_basis.sample_article_path,
    observation: "Local source and live HTML contain two AG03 verified reference links for the sampled article.",
    evidence: {
      local_ag03_marker_count: config.manual_review_basis.sample_article_local_ag03_marker_count,
      live_html_contains_ag03_links: config.manual_review_basis.sample_article_live_html_contains_ag03_links
    },
    correction_required: false
  },
  {
    observation_id: "AG05C_OBS_005",
    review_area: "article_reference_visible_presentation",
    status: "failed_manual_live_review",
    target: config.manual_review_basis.sample_article_path,
    observation: "The visible reader surface still shows the older 'Under editorial verification' reference placeholder section, even though verified AG03 reference links exist in the source/live HTML.",
    correction_required: true,
    required_next_action: "AG05D targeted visible-reference placement repair"
  },
  {
    observation_id: "AG05C_OBS_006",
    review_area: "signin_join",
    status: "passed_manual_live_review",
    target: "sign in / join page",
    observation: "Sign in / Join page clearly states static preview only, no backend connection, and no account/password/personal data storage.",
    correction_required: false
  },
  {
    observation_id: "AG05C_OBS_007",
    review_area: "submissions",
    status: "passed_manual_live_review",
    target: "submissions page",
    observation: "Submissions page clearly states backend intake is disabled and local preparation only; palm upload is disabled.",
    correction_required: false
  },
  {
    observation_id: "AG05C_OBS_008",
    review_area: "deployment",
    status: "passed_manual_live_review",
    target: "Vercel production deployment",
    observation: "Vercel production deployment is current and ready at commit 98bf994.",
    correction_required: false
  },
  {
    observation_id: "AG05C_OBS_009",
    review_area: "backend_auth_supabase_no_activation",
    status: "passed_manual_live_review",
    target: "public pages",
    observation: "No real backend/Auth/Supabase activation was observed in the reviewed public experience.",
    correction_required: false
  }
];

const failed = observations.filter((row) => row.status === "failed_manual_live_review");
const correctionRequired = observations.some((row) => row.correction_required === true);

const result = {
  result_id: "AG05C_MANUAL_LIVE_PAGE_SMOKE_REVIEW_RESULT_RECORD",
  module_id: "AG05C",
  status: correctionRequired ? "manual_live_review_completed_correction_required" : "manual_live_review_completed_no_correction_required",
  generated_at: new Date().toISOString(),

  mutation_performed: false,
  article_html_mutation_performed: false,
  homepage_mutation_performed: false,
  css_mutation_performed: false,
  javascript_mutation_performed: false,
  favicon_mutation_performed: false,
  navigation_mutation_performed: false,
  reference_url_change_performed: false,
  external_fetch_performed_by_script: false,
  live_url_fetch_performed: false,
  backend_activation_performed: false,
  api_route_created: false,
  supabase_enabled: false,
  auth_enabled: false,
  real_login_enabled: false,
  real_signup_enabled: false,
  user_account_collection_enabled: false,
  frontend_deployment_performed: false,
  file_deletion_performed: false,
  file_move_performed: false,

  source_context: {
    ag05b_checklist: config.input_files.ag05b_checklist,
    ag05b_summary: ag05b.summary,
    manual_review_basis: config.manual_review_basis
  },

  summary: {
    manual_observation_count: observations.length,
    passed_observation_count: observations.filter((row) => row.status === "passed_manual_live_review").length,
    passed_with_note_count: observations.filter((row) => row.status === "passed_with_note").length,
    failed_observation_count: failed.length,
    correction_required: correctionRequired,
    correction_required_count: observations.filter((row) => row.correction_required === true).length,
    deployment_current_commit_observed: config.manual_review_basis.deployment_observed_current_commit,
    sample_article_local_ag03_marker_count: config.manual_review_basis.sample_article_local_ag03_marker_count,
    sample_article_live_html_contains_ag03_links: config.manual_review_basis.sample_article_live_html_contains_ag03_links,
    sample_article_visible_reader_placeholder_still_visible: config.manual_review_basis.sample_article_visible_reader_placeholder_still_visible,
    article_reference_source_presence_passed: true,
    article_reference_visible_presentation_passed: false,
    backend_auth_supabase_no_activation_passed: true,
    manual_live_review_completed: true,
    audit_only_no_mutation: true,
    next_stage_id: correctionRequired ? "AG05D" : "AG05Z"
  },

  observations,
  failed_observations: failed,
  next_recommended_stage: config.recommended_next_stage
};

const preview = {
  preview_id: "AG05C_MANUAL_LIVE_PAGE_SMOKE_REVIEW_RESULT_PREVIEW",
  module_id: "AG05C",
  preview_only: true,
  status: result.status,
  summary: result.summary,
  failed_observations: failed,
  mutation_performed: false,
  next_recommended_stage: result.next_recommended_stage
};

writeJson(path.join(root, config.outputs.review_result), result);
writeJson(path.join(root, config.outputs.preview), preview);

console.log(`Created ${config.outputs.review_result}.`);
console.log(`Created ${config.outputs.preview}.`);
console.log(`Manual observations: ${result.summary.manual_observation_count}`);
console.log(`Failed observations: ${result.summary.failed_observation_count}`);
console.log(`Correction required: ${result.summary.correction_required}`);
console.log(`Next stage: ${result.summary.next_stage_id}`);
console.log("Mutation performed: false");
