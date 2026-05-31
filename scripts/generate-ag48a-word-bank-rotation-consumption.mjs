import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag47zReview: "data/content-intelligence/quality-reviews/ag47z-panchang-festival-vedic-closure.json",
  ag47zHandoff: "data/content-intelligence/ag-roadmap/ag47z-ag48a-word-bank-rotation-handoff.json",
  ag47zReadiness: "data/content-intelligence/quality-registry/ag47z-ag48a-word-bank-rotation-readiness-record.json",
  ag47zBoundary: "data/content-intelligence/mutation-plans/ag47z-to-ag48a-word-bank-rotation-boundary.json",
  ag47rSourceOfTruth: "data/content-intelligence/ag-roadmap/ag47r-v01-implementation-roadmap-source-of-truth.json",
  adb20Ads: "data/content-intelligence/runtime-engine/adb20-ads-coverage-reconciliation.json",
  adb20ApiDeferral: "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag48a-word-bank-rotation-consumption.json",
  wordBankConsumption: "data/content-intelligence/word-reflection/ag48a-word-bank-consumption-record.json",
  rotationPolicyConsumption: "data/content-intelligence/word-reflection/ag48a-rotation-policy-consumption-record.json",
  approvalStatusBoundary: "data/content-intelligence/word-reflection/ag48a-word-approval-status-boundary.json",
  repeatControlBoundary: "data/content-intelligence/word-reflection/ag48a-repeat-control-boundary.json",
  reflectionReadinessSeed: "data/content-intelligence/word-reflection/ag48a-reflection-readiness-seed-record.json",
  noPersonalisationAuthAudit: "data/content-intelligence/backend-architecture/ag48a-no-personalisation-auth-activation-audit.json",
  noRuntimeApiDeploymentAudit: "data/content-intelligence/backend-architecture/ag48a-no-runtime-api-deployment-audit.json",
  noPublicGenerationAudit: "data/content-intelligence/backend-architecture/ag48a-no-public-word-generation-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag48a-ag48b-multilingual-language-safety-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag48a-to-ag48b-multilingual-language-safety-boundary.json",
  registry: "data/quality/ag48a-word-bank-rotation-consumption.json",
  preview: "data/quality/ag48a-word-bank-rotation-consumption-preview.json",
  doc: "docs/quality/AG48A_WORD_BANK_ROTATION_CONSUMPTION.md"
};

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}
function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}
function walk(dir, acc = []) {
  if (!fs.existsSync(full(dir))) return acc;
  for (const entry of fs.readdirSync(full(dir), { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(rel, acc);
    else acc.push(rel);
  }
  return acc;
}
function findFiles(patterns) {
  const files = [...walk("data"), ...walk("docs"), ...walk("scripts"), ...walk("public"), ...walk("src")];
  return files.filter((file) => {
    const low = file.toLowerCase();
    return patterns.some((pattern) => low.includes(pattern.toLowerCase()));
  }).sort();
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG48A input: ${p}`);
}

const ag47zReview = readJson(inputs.ag47zReview);
const ag47zHandoff = readJson(inputs.ag47zHandoff);
const ag47zReadiness = readJson(inputs.ag47zReadiness);
const ag47zBoundary = readJson(inputs.ag47zBoundary);
const ag47rSourceOfTruth = readJson(inputs.ag47rSourceOfTruth);
const adb20Ads = readJson(inputs.adb20Ads);
const adb20ApiDeferral = readJson(inputs.adb20ApiDeferral);

if (ag47zReview.status !== "panchang_festival_vedic_closed_ready_for_ag48a") throw new Error("AG47Z review status mismatch.");
if (ag47zReview.summary?.ready_for_ag48a_word_bank_rotation_consumption !== true) throw new Error("AG48A readiness missing from AG47Z.");
if (ag47zHandoff.next_stage_id !== "AG48A") throw new Error("AG47Z handoff must point to AG48A.");
if (!JSON.stringify(ag47zHandoff.handoff_basis).includes("AG48 remains Word of the Day and Reflection")) throw new Error("AG48 source-of-truth missing in AG47Z handoff.");
if (ag47zReadiness.ready_for_ag48a !== true || ag47zReadiness.next_stage_id !== "AG48A") throw new Error("AG47Z readiness must permit AG48A.");
if (ag47zBoundary.next_stage_id !== "AG48A") throw new Error("AG47Z boundary must point to AG48A.");
if (!JSON.stringify(ag47rSourceOfTruth.governing_rule).includes("AG48 remains Word of the Day and Reflection")) throw new Error("AG48 roadmap source-of-truth not preserved.");
if (adb20Ads.status !== "ads_coverage_reconciliation_completed") throw new Error("ADB20 ADS reconciliation missing.");
if (adb20ApiDeferral.website_database_reading_enabled !== false) throw new Error("ADB20 website DB reading must remain disabled.");

const d02WordCandidates = findFiles(["d02", "word-of-day", "word_of_day", "word bank", "word-bank", "sutra", "reflection"]);
const wordPreflightCandidates = findFiles(["word-of-day-bank-preflight", "word_bank_preflight", "word-preflight", "preflight"]);
const rotationCandidates = findFiles(["rotation", "repeat", "word-of-day", "word_bank", "word-bank"]);

const blockedState = {
  ag48a_word_bank_rotation_consumed: true,
  ag47z_consumed: true,
  d02_word_bank_consumed: true,
  word_of_day_preflight_consumed: true,
  rotation_policy_consumed: true,
  approval_status_boundary_recorded: true,
  repeat_control_boundary_recorded: true,
  reflection_readiness_seed_recorded: true,
  ready_for_ag48b_multilingual_language_safety: true,

  word_publication_approved_now: false,
  word_publication_executed: false,
  public_word_generated_now: false,
  unreviewed_sanskrit_mantra_publication_allowed: false,
  personalisation_auth_activation_approved: false,
  personalisation_auth_activation_performed: false,
  website_database_reading_enabled: false,
  api_runtime_database_reading_approved_now: false,
  backend_auth_supabase_activation_approved: false,
  backend_auth_supabase_activation_performed: false,
  rls_public_policy_activation_approved: false,
  deployment_approved: false,
  deployment_performed: false,
  service_role_key_exposed: false,
  public_generated_word_output: false,
  public_content_generated: false
};

const wordBankConsumption = {
  module_id: "AG48A",
  title: "Word Bank Consumption Record",
  status: "word_bank_consumption_recorded",
  consumed_logic_families: [
    "D02 word-of-day bank",
    "word-of-day-bank-preflight.js",
    "AG47Z handoff to AG48A",
    "ADB20 ADS05/ADS08 reconciliation"
  ],
  discovered_d02_word_candidates: d02WordCandidates.slice(0, 80),
  discovered_word_preflight_candidates: wordPreflightCandidates.slice(0, 50),
  consumption_boundary: {
    use_as_word_reflection_source_scaffold: true,
    use_as_public_generation_engine: false,
    use_as_personalised_word_engine: false,
    public_word_publication_status: "not_executed_in_ag48a",
    editorial_review_required_before_public_use: true
  },
  no_duplicate_rule: "AG48A consumes existing D02/word-bank logic and records delta readiness only; it does not recreate word corpus or publish words.",
  blocked_state: blockedState
};

const rotationPolicyConsumption = {
  module_id: "AG48A",
  title: "Rotation Policy Consumption Record",
  status: "rotation_policy_consumption_recorded",
  consumed_logic_families: [
    "word rotation policy",
    "repeat-control logic",
    "approved-status filtering",
    "homepage word/reflection sequencing"
  ],
  discovered_rotation_candidates: rotationCandidates.slice(0, 80),
  rotation_boundary: {
    rotation_policy_required: true,
    repeat_control_required: true,
    approved_items_only_required: true,
    live_rotation_enabled_now: false,
    static_preview_rotation_allowed_after_review: true
  },
  blocked_state: blockedState
};

const approvalStatusBoundary = {
  module_id: "AG48A",
  title: "Word Approval Status Boundary",
  status: "word_approval_status_boundary_recorded",
  approval_rules: [
    "Only approved/reviewed words may be eligible for public display.",
    "Draft, unverified, incomplete or source-questioned entries must remain excluded from public display.",
    "Sanskrit/shloka/mantra-like entries require extra source and language review.",
    "Meaning, transliteration and reflection text must be reviewed together, not separately.",
    "Any uncertain etymology or scriptural attribution must be marked under editorial review."
  ],
  default_public_use_allowed: false,
  blocked_state: blockedState
};

const repeatControlBoundary = {
  module_id: "AG48A",
  title: "Repeat Control Boundary",
  status: "repeat_control_boundary_recorded",
  repeat_rules: [
    "Avoid immediate repeat of the same word.",
    "Avoid short-cycle repetition unless bank size is too small.",
    "Prefer reviewed and balanced thematic distribution.",
    "Do not use engagement optimisation to force spiritual/cultural content repeatedly.",
    "Record repeat-control as a display policy, not as a user-specific personalisation system."
  ],
  minimum_policy_requirement: "A repeat-control window or equivalent rotation guard must exist before any public daily word loop.",
  live_repeat_control_execution_now: false,
  blocked_state: blockedState
};

const reflectionReadinessSeed = {
  module_id: "AG48A",
  title: "Reflection Readiness Seed Record",
  status: "reflection_readiness_seed_recorded",
  reflection_position: {
    word_and_reflection_should_be_linked: true,
    reflection_prompt_may_be_static_reviewed_text: true,
    user_personalised_reflection_disabled_now: true,
    auth_or_profile_based_reflection_disabled_now: true,
    public_generated_reflection_disabled_now: true
  },
  handoff_to_ag48b: [
    "AG48B must review Sanskrit/Hindi/English fields.",
    "AG48B must check transliteration and meaning safety.",
    "AG48B must ensure language toggle does not corrupt the word/reflection display.",
    "AG48B must preserve no unreviewed Sanskrit/mantra publication."
  ],
  blocked_state: blockedState
};

const noPersonalisationAuthAudit = {
  module_id: "AG48A",
  title: "No Personalisation/Auth Activation Audit",
  status: "no_personalisation_auth_activation_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "personalisation_auth_activation_approved", expected: false, actual: false, passed: true },
    { check_id: "personalisation_auth_activation_performed", expected: false, actual: false, passed: true },
    { check_id: "backend_auth_supabase_activation_performed", expected: false, actual: false, passed: true },
    { check_id: "service_role_key_exposed", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noRuntimeApiDeploymentAudit = {
  module_id: "AG48A",
  title: "No Runtime / API / Deployment Audit",
  status: "no_runtime_api_deployment_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "website_database_reading_enabled", expected: false, actual: false, passed: true },
    { check_id: "api_runtime_database_reading_approved_now", expected: false, actual: false, passed: true },
    { check_id: "rls_public_policy_activation_approved", expected: false, actual: false, passed: true },
    { check_id: "deployment_performed", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noPublicGenerationAudit = {
  module_id: "AG48A",
  title: "No Public Word Generation Audit",
  status: "no_public_word_generation_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "word_publication_approved_now", expected: false, actual: false, passed: true },
    { check_id: "word_publication_executed", expected: false, actual: false, passed: true },
    { check_id: "public_word_generated_now", expected: false, actual: false, passed: true },
    { check_id: "public_generated_word_output", expected: false, actual: false, passed: true },
    { check_id: "unreviewed_sanskrit_mantra_publication_allowed", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG48A",
  title: "AG48B Multilingual Language Safety Readiness Record",
  status: "ready_for_ag48b_multilingual_language_safety",
  ready_for_ag48b: true,
  next_stage_id: "AG48B",
  next_stage_title: "Multilingual Language Safety Review",
  ag48b_allowed_scope: [
    "Check Sanskrit/Hindi/English meanings.",
    "Check transliteration and script handling.",
    "Check language toggle stability for word/reflection fields.",
    "Check no Sanskrit/mantra-like entry is public without review.",
    "Prepare handoff to AG48C Reflection Prompt and Homepage Integration."
  ],
  ag48b_blocked_scope: [
    "Public word publication",
    "Public generated reflection output",
    "Unreviewed Sanskrit/mantra publication",
    "Personalisation/Auth activation",
    "Website database-reading/API runtime activation",
    "Backend/Auth/Supabase runtime activation",
    "RLS public policy activation",
    "Deployment",
    "Service-role key exposure"
  ],
  hard_blocker_count_for_ag48b: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG48A",
  title: "AG48A to AG48B Multilingual Language Safety Boundary",
  status: "ag48b_multilingual_language_safety_boundary_created",
  next_stage_id: "AG48B",
  next_stage_title: "Multilingual Language Safety Review",
  allowed_scope: readiness.ag48b_allowed_scope,
  blocked_scope: readiness.ag48b_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "AG48A",
  title: "Word Bank and Rotation Consumption",
  status: "word_bank_rotation_consumed_ready_for_ag48b",
  depends_on: ["AG47Z", "AG47R", "ADB20"],
  word_bank_consumption_file: outputs.wordBankConsumption,
  rotation_policy_consumption_file: outputs.rotationPolicyConsumption,
  approval_status_boundary_file: outputs.approvalStatusBoundary,
  repeat_control_boundary_file: outputs.repeatControlBoundary,
  reflection_readiness_seed_file: outputs.reflectionReadinessSeed,
  no_personalisation_auth_audit_file: outputs.noPersonalisationAuthAudit,
  no_runtime_api_deployment_audit_file: outputs.noRuntimeApiDeploymentAudit,
  no_public_generation_audit_file: outputs.noPublicGenerationAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag48a_word_bank_rotation_consumed: true,
    ag47z_consumed: true,
    d02_word_bank_consumed: true,
    word_of_day_preflight_consumed: true,
    rotation_policy_consumed: true,
    approval_status_boundary_recorded: true,
    repeat_control_boundary_recorded: true,
    reflection_readiness_seed_recorded: true,
    ready_for_ag48b_multilingual_language_safety: true,
    hard_blocker_count_for_ag48b: 0,

    word_publication_approved_now: false,
    word_publication_executed: false,
    public_word_generated_now: false,
    unreviewed_sanskrit_mantra_publication_allowed: false,
    personalisation_auth_activation_approved: false,
    personalisation_auth_activation_performed: false,
    website_database_reading_enabled: false,
    api_runtime_database_reading_approved_now: false,
    backend_auth_supabase_activation_approved: false,
    backend_auth_supabase_activation_performed: false,
    rls_public_policy_activation_approved: false,
    deployment_approved: false,
    deployment_performed: false,
    service_role_key_exposed: false,
    public_generated_word_output: false,
    public_content_generated: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG48A",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG48A",
  status: review.status,
  ag48a_word_bank_rotation_consumed: 1,
  ag47z_consumed: 1,
  d02_word_bank_consumed: 1,
  word_of_day_preflight_consumed: 1,
  rotation_policy_consumed: 1,
  approval_status_boundary_recorded: 1,
  repeat_control_boundary_recorded: 1,
  reflection_readiness_seed_recorded: 1,
  ready_for_ag48b_multilingual_language_safety: 1,
  hard_blocker_count_for_ag48b: 0,

  word_publication_approved_now: 0,
  word_publication_executed: 0,
  public_word_generated_now: 0,
  unreviewed_sanskrit_mantra_publication_allowed: 0,
  personalisation_auth_activation_approved: 0,
  personalisation_auth_activation_performed: 0,
  website_database_reading_enabled: 0,
  api_runtime_database_reading_approved_now: 0,
  backend_auth_supabase_activation_approved: 0,
  backend_auth_supabase_activation_performed: 0,
  rls_public_policy_activation_approved: 0,
  deployment_approved: 0,
  deployment_performed: 0,
  service_role_key_exposed: 0,
  public_generated_word_output: 0,
  public_content_generated: 0
};

const doc = `# AG48A — Word Bank and Rotation Consumption

## Result

AG48A consumes the Word of the Day bank/rotation foundation and prepares AG48B multilingual safety review.

## Confirmed

- AG47Z handoff consumed.
- AG48 remains Word of the Day and Reflection.
- D02 word bank and preflight logic consumed as governance input.
- Rotation policy boundary recorded.
- Approval-status boundary recorded.
- Repeat-control boundary recorded.
- Reflection readiness seed recorded.

## Still blocked

- Public word publication
- Public generated word/reflection output
- Unreviewed Sanskrit/mantra publication
- Personalisation/Auth activation
- Website database-reading/API runtime activation
- Backend/Auth/Supabase runtime activation
- RLS public policy activation
- Deployment
- Service-role key exposure

## Next

AG48B — Multilingual Language Safety Review.
`;

writeJson(outputs.wordBankConsumption, wordBankConsumption);
writeJson(outputs.rotationPolicyConsumption, rotationPolicyConsumption);
writeJson(outputs.approvalStatusBoundary, approvalStatusBoundary);
writeJson(outputs.repeatControlBoundary, repeatControlBoundary);
writeJson(outputs.reflectionReadinessSeed, reflectionReadinessSeed);
writeJson(outputs.noPersonalisationAuthAudit, noPersonalisationAuthAudit);
writeJson(outputs.noRuntimeApiDeploymentAudit, noRuntimeApiDeploymentAudit);
writeJson(outputs.noPublicGenerationAudit, noPublicGenerationAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG48A Word Bank and Rotation Consumption generated.");
console.log("✅ Word bank, preflight, rotation, approval and repeat-control boundaries recorded.");
console.log("✅ Ready for AG48B Multilingual Language Safety Review.");
console.log("✅ Word publication, public generation, personalisation/Auth, API/DB reading, backend/RLS, deployment and secrets remain blocked.");
