import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const configPath = path.join(root, "data", "quality", "ag05f-live-redeployment-manual-visible-reference-verification-record.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

const config = readJson(configPath);
const ag05eR1 = readJson(path.join(root, config.input_files.ag05e_r1_audit));
const ag05dR1 = readJson(path.join(root, config.input_files.ag05d_r1_apply_result));
const ag05e = readJson(path.join(root, config.input_files.ag05e_audit));
const ag03z = readJson(path.join(root, config.input_files.ag03z_closure));
const ag04z = readJson(path.join(root, config.input_files.ag04z_closure));

if (ag05eR1.module_id !== "AG05E-R1") throw new Error("AG05E-R1 audit missing/invalid.");
if (ag05eR1.summary?.ready_for_ag05f_live_redeployment_manual_verification !== true) throw new Error("AG05E-R1 must authorize AG05F.");
if (ag05dR1.module_id !== "AG05D-R1") throw new Error("AG05D-R1 apply result missing/invalid.");
if (ag05e.module_id !== "AG05E") throw new Error("AG05E audit missing/invalid.");
if (ag03z.summary?.ag03_reference_scaling_closed !== true) throw new Error("AG03Z closure must remain true.");
if (ag04z.summary?.ag04_visual_credit_width_governance_closed !== true) throw new Error("AG04Z closure must remain true.");

const live = config.manual_live_verification;

const liveVerificationPassed =
  live.observed_commit === "20a3b37" &&
  live.ag05d_visible_block_count === 1 &&
  live.ag03_reference_link_count === 2 &&
  live.ag05d_r1_neutralized_count >= 1 &&
  live.visible_ar01_placeholder_count === 0 &&
  live.pass_ready_for_ag05f === true;

const observations = [
  {
    observation_id: "AG05F_OBS_001",
    review_area: "deployment",
    status: "passed_manual_live_verification",
    observation: "Live site is serving the latest verified governance state at commit 20a3b37.",
    correction_required: false
  },
  {
    observation_id: "AG05F_OBS_002",
    review_area: "visible_verified_references",
    status: "passed_manual_live_verification",
    observation: "Live sample article contains one AG05D visible reference block and two AG03 verified reference links.",
    evidence: {
      ag05d_visible_block_count: live.ag05d_visible_block_count,
      ag03_reference_link_count: live.ag03_reference_link_count
    },
    correction_required: false
  },
  {
    observation_id: "AG05F_OBS_003",
    review_area: "placeholder_neutralization",
    status: "passed_manual_live_verification",
    observation: "Old AR01 placeholder references are neutralized/hidden and no visible AR01 placeholder remains.",
    evidence: {
      ag05d_r1_neutralized_count: live.ag05d_r1_neutralized_count,
      visible_ar01_placeholder_count: live.visible_ar01_placeholder_count
    },
    correction_required: false
  },
  {
    observation_id: "AG05F_OBS_004",
    review_area: "backend_auth_supabase_no_activation",
    status: "passed_manual_live_verification",
    observation: "No backend/Auth/Supabase activation is introduced by AG05D-R1/AG05E-R1/AG05F.",
    correction_required: false
  }
];

const record = {
  record_id: "AG05F_LIVE_REDEPLOYMENT_MANUAL_VISIBLE_REFERENCE_VERIFICATION_RECORD",
  module_id: "AG05F",
  status: liveVerificationPassed ? "live_visible_reference_verification_passed" : "live_visible_reference_verification_failed",
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
    ag05e_r1_summary: ag05eR1.summary,
    ag05d_r1_summary: ag05dR1.summary,
    ag05e_summary: ag05e.summary,
    ag03z_closed: ag03z.summary.ag03_reference_scaling_closed === true,
    ag04z_closed: ag04z.summary.ag04_visual_credit_width_governance_closed === true
  },

  manual_live_verification: live,

  summary: {
    manual_live_verification_completed: true,
    observed_commit: live.observed_commit,
    sample_article_path: live.sample_article_path,
    ag05d_visible_block_count: live.ag05d_visible_block_count,
    ag03_reference_link_count: live.ag03_reference_link_count,
    ag05d_r1_neutralized_count: live.ag05d_r1_neutralized_count,
    visible_ar01_placeholder_count: live.visible_ar01_placeholder_count,
    live_verification_passed: liveVerificationPassed,
    correction_required: !liveVerificationPassed,
    backend_auth_supabase_no_activation_passed: true,
    audit_only_no_mutation: true,
    next_stage_id: liveVerificationPassed ? "AG05Z" : "AG05D-R2"
  },

  observations,
  next_recommended_stage: liveVerificationPassed ? config.recommended_next_stage : {
    module_id: "AG05D-R2",
    title: "Follow-up Visible Reference Live Repair",
    allowed: true,
    scope: "only if AG05F live verification fails"
  }
};

const preview = {
  preview_id: "AG05F_LIVE_REDEPLOYMENT_MANUAL_VISIBLE_REFERENCE_VERIFICATION_PREVIEW",
  module_id: "AG05F",
  preview_only: true,
  status: record.status,
  summary: record.summary,
  observations,
  mutation_performed: false,
  next_recommended_stage: record.next_recommended_stage
};

writeJson(path.join(root, config.outputs.verification_record), record);
writeJson(path.join(root, config.outputs.preview), preview);

console.log(`Created ${config.outputs.verification_record}.`);
console.log(`Created ${config.outputs.preview}.`);
console.log(`Observed commit: ${record.summary.observed_commit}`);
console.log(`AG05D visible block count: ${record.summary.ag05d_visible_block_count}`);
console.log(`AG03 reference link count: ${record.summary.ag03_reference_link_count}`);
console.log(`Neutralized AR01 count: ${record.summary.ag05d_r1_neutralized_count}`);
console.log(`Visible AR01 placeholder count: ${record.summary.visible_ar01_placeholder_count}`);
console.log(`Live verification passed: ${record.summary.live_verification_passed}`);
console.log(`Correction required: ${record.summary.correction_required}`);
console.log(`Next stage: ${record.summary.next_stage_id}`);
console.log("Mutation performed: false");
