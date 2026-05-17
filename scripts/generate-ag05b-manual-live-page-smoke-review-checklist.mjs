import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const configPath = path.join(root, "data", "quality", "ag05b-manual-live-page-smoke-review-checklist.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

function makeCheck(id, area, target, description, evidenceFromAg05a = {}) {
  return {
    check_id: id,
    review_area: area,
    target,
    description,
    evidence_from_ag05a: evidenceFromAg05a,
    observation_status: "pending_manual_live_review",
    operator_observation: "",
    correction_required: null,
    notes: ""
  };
}

const config = readJson(configPath);
const ag05a = readJson(path.join(root, config.input_files.ag05a_audit));

if (ag05a.module_id !== "AG05A") {
  throw new Error("Input audit must be AG05A.");
}
if (ag05a.summary?.ag03_reference_scaling_closed !== true) {
  throw new Error("AG03 closure must remain true before AG05B.");
}
if (ag05a.summary?.ag04_visual_credit_width_closed !== true) {
  throw new Error("AG04 closure must remain true before AG05B.");
}
if ((ag05a.summary?.backend_or_auth_signal_file_count || 0) !== 0) {
  throw new Error("Backend/Auth signal count must be zero before AG05B checklist.");
}

const homepageTargets = ag05a.homepage_results || [];
const articleTargets = (ag05a.article_result_sample || []).slice(0, 20);
const signinJoinTargets = ag05a.signin_join_results || [];

const homepageChecks = [];
for (const row of homepageTargets) {
  homepageChecks.push(makeCheck("AG05B_HOME_001", "homepage", row.file_path, "Homepage opens correctly without layout break.", row));
  homepageChecks.push(makeCheck("AG05B_HOME_002", "homepage", row.file_path, "Homepage logo/brand is visible and aligned.", row));
  homepageChecks.push(makeCheck("AG05B_HOME_003", "homepage", row.file_path, "Homepage favicon/icon appears correctly in browser tab.", row));
  homepageChecks.push(makeCheck("AG05B_HOME_004", "homepage", row.file_path, "Homepage navigation/menu is visible and usable.", row));
  homepageChecks.push(makeCheck("AG05B_HOME_005", "homepage", row.file_path, "Homepage language toggle does not change language accidentally on normal clicks.", row));
}

const articleChecks = articleTargets.map((row, idx) => makeCheck(
  `AG05B_ARTICLE_${String(idx + 1).padStart(3, "0")}`,
  "article_page_sample",
  row.file_path,
  "Article page opens; visual, credit/source, broad justified reading surface and two reference links are visible.",
  {
    ag03_reference_link_count: row.ag03_reference_link_count,
    primary_image_signal_present: row.primary_image_signal_present,
    image_credit_signal_present: row.image_credit_signal_present,
    reading_width_signal_present: row.reading_width_signal_present
  }
));

const signinJoinChecks = signinJoinTargets.slice(0, 25).map((row, idx) => makeCheck(
  `AG05B_NAV_${String(idx + 1).padStart(3, "0")}`,
  "navigation_signin_join",
  row.file_path,
  "Sign-in/join/navigation elements, if visible on this page, should allow user to return to homepage or main navigation without dead-end behaviour.",
  {
    navigation_signal_present: row.navigation_signal_present,
    home_return_signal_present: row.home_return_signal_present,
    join_signin_signal_present: row.join_signin_signal_present
  }
));

const backendAuthChecks = [
  makeCheck(
    "AG05B_NOAUTH_001",
    "backend_auth_supabase_no_activation",
    "static_public_pages",
    "Confirm no real login/signup/auth data collection is active on public pages.",
    { backend_or_auth_signal_file_count: ag05a.summary.backend_or_auth_signal_file_count }
  ),
  makeCheck(
    "AG05B_NOAUTH_002",
    "backend_auth_supabase_no_activation",
    "static_public_pages",
    "Confirm Supabase/Auth/API routes remain no-go unless explicitly activated in a future stage.",
    { ag05a_backend_or_auth_signal_results: ag05a.backend_or_auth_signal_results || [] }
  )
];

const checklistItems = [
  ...homepageChecks,
  ...articleChecks,
  ...signinJoinChecks,
  ...backendAuthChecks
];

const checklist = {
  checklist_id: "AG05B_MANUAL_LIVE_PAGE_SMOKE_REVIEW_CHECKLIST",
  module_id: "AG05B",
  status: "manual_live_review_pending",
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
    ag05a_audit: config.input_files.ag05a_audit,
    ag05a_summary: ag05a.summary,
    ag05a_issue_queue: ag05a.issue_queue
  },

  summary: {
    checklist_item_count: checklistItems.length,
    homepage_check_count: homepageChecks.length,
    article_sample_check_count: articleChecks.length,
    navigation_signin_join_check_count: signinJoinChecks.length,
    backend_auth_no_activation_check_count: backendAuthChecks.length,
    pending_manual_live_review_count: checklistItems.filter((item) => item.observation_status === "pending_manual_live_review").length,
    passed_manual_live_review_count: 0,
    failed_manual_live_review_count: 0,
    correction_required_count: 0,
    manual_live_review_completed: false,
    audit_only_no_mutation: true,
    ready_for_ag05c_manual_live_review_result_record: true
  },

  checklist_items: checklistItems,
  next_recommended_stage: config.recommended_next_stage
};

const preview = {
  preview_id: "AG05B_MANUAL_LIVE_PAGE_SMOKE_REVIEW_PREVIEW",
  module_id: "AG05B",
  preview_only: true,
  status: "preview_manual_live_review_pending",
  summary: checklist.summary,
  first_30_checklist_items: checklistItems.slice(0, 30),
  mutation_performed: false,
  next_recommended_stage: config.recommended_next_stage
};

writeJson(path.join(root, config.outputs.checklist), checklist);
writeJson(path.join(root, config.outputs.preview), preview);

console.log(`Created ${config.outputs.checklist}.`);
console.log(`Created ${config.outputs.preview}.`);
console.log(`Checklist items: ${checklist.summary.checklist_item_count}`);
console.log(`Homepage checks: ${checklist.summary.homepage_check_count}`);
console.log(`Article sample checks: ${checklist.summary.article_sample_check_count}`);
console.log(`Navigation/sign-in/join checks: ${checklist.summary.navigation_signin_join_check_count}`);
console.log(`Backend/Auth no-activation checks: ${checklist.summary.backend_auth_no_activation_check_count}`);
console.log(`Pending manual live review: ${checklist.summary.pending_manual_live_review_count}`);
console.log("Mutation performed: false");
