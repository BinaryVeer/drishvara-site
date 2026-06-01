import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const inputs = {
  ag57bReview: "data/content-intelligence/quality-reviews/ag57b-public-ui-content-correction.json",
  ag57bApply: "data/content-intelligence/pre-live/ag57b-public-ui-content-correction-apply-record.json",
  ag57bClearance: "data/content-intelligence/pre-live/ag57b-defect-clearance-record.json",
  ag57bDelta: "data/content-intelligence/pre-live/ag57b-source-file-delta-record.json",
  ag57bReadiness: "data/content-intelligence/quality-registry/ag57b-ag57c-defect-clearance-validation-readiness-record.json",
  ag57bBoundary: "data/content-intelligence/mutation-plans/ag57b-to-ag57c-defect-clearance-validation-boundary.json",
  indexHtml: "index.html"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag57c-defect-clearance-validation.json",
  source: "data/content-intelligence/pre-live/ag57c-source-consumption-record.json",
  validation: "data/content-intelligence/pre-live/ag57c-defect-clearance-validation-record.json",
  publicCopy: "data/content-intelligence/pre-live/ag57c-public-copy-validation-record.json",
  signalRule: "data/content-intelligence/pre-live/ag57c-daily-signal-rule-validation-record.json",
  safety: "data/content-intelligence/pre-live/ag57c-safety-boundary-validation-record.json",
  readiness: "data/content-intelligence/quality-registry/ag57c-ag57z-pre-live-defect-clearance-closure-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag57c-to-ag57z-pre-live-defect-clearance-closure-boundary.json",
  registry: "data/quality/ag57c-defect-clearance-validation.json",
  preview: "data/quality/ag57c-defect-clearance-validation-preview.json",
  doc: "docs/quality/AG57C_DEFECT_CLEARANCE_VALIDATION.md"
};

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}
function writeText(p, txt) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), txt);
}
function run(cmd) {
  try { return execSync(cmd, { cwd: root, encoding: "utf8" }).trim(); }
  catch { return ""; }
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG57C input: ${p}`);
}

const ag57bReview = readJson(inputs.ag57bReview);
const ag57bApply = readJson(inputs.ag57bApply);
const ag57bClearance = readJson(inputs.ag57bClearance);
const ag57bDelta = readJson(inputs.ag57bDelta);
const ag57bReadiness = readJson(inputs.ag57bReadiness);
const ag57bBoundary = readJson(inputs.ag57bBoundary);
const indexHtml = read(inputs.indexHtml);

if (ag57bReview.status !== "public_ui_content_correction_applied_ready_for_ag57c") throw new Error("AG57B review status mismatch.");
if (ag57bApply.actual_source_changes_applied !== true) throw new Error("AG57B actual source-change flag missing.");
if (ag57bClearance.corrected_defects.length !== 5) throw new Error("AG57B must correct 5 defects.");
if (!ag57bDelta.changed_files.includes("index.html")) throw new Error("AG57B delta must include index.html.");
if (ag57bReadiness.ready_for_ag57c !== true) throw new Error("AG57C readiness missing.");
if (ag57bBoundary.status !== "ag57c_defect_clearance_validation_boundary_created") throw new Error("AG57C boundary missing.");

const forbiddenPublicStrings = [
  "UI Step 3 Integration",
  "From signal to reading to reflection",
  "Fetching live events...",
  "Fetching tournament cards...",
  "Fetching major updates...",
  "Fetching featured sports article..."
];

const requiredPublicStrings = [
  "Discover → Read → Reflect",
  "From daily signals to deeper reading and reflection",
  "First Light — 10 Daily Signals",
  "Default daily selection: 10 signals — 6 India-focused and 4 international",
  "Live-event cards will appear after editorial activation.",
  "Tournament cards are held for verified sports context.",
  "Major sports updates will appear after editorial review.",
  "Featured sports reading will appear after curation."
];

const requiredSafetyStrings = [
  "General reflective preview only; no deterministic prediction or live calculation is active.",
  "Preview status: source and regional-method verification required before any live Panchang output.",
  "Curated language preview; meanings remain editorially reviewed before public expansion.",
  "Reflective prompt only; not a personal prediction, assessment, or decision guide."
];

const forbiddenResults = forbiddenPublicStrings.map((text) => ({
  text,
  present: indexHtml.includes(text),
  passed: !indexHtml.includes(text)
}));

const requiredResults = requiredPublicStrings.map((text) => ({
  text,
  present: indexHtml.includes(text),
  passed: indexHtml.includes(text)
}));

const safetyResults = requiredSafetyStrings.map((text) => ({
  text,
  present: indexHtml.includes(text),
  passed: indexHtml.includes(text)
}));

const generatedDailyContextDir = full("generated/daily-context");
const dailyContextFiles = fs.existsSync(generatedDailyContextDir)
  ? fs.readdirSync(generatedDailyContextDir).filter((f) => f.endsWith(".json")).map((f) => `generated/daily-context/${f}`)
  : [];

const dailyContextResults = dailyContextFiles.map((file) => {
  const obj = readJson(file);
  const rule = obj.first_light?.selection_rule || {};
  return {
    file,
    default_total: rule.default_total,
    india_focused: rule.india_focused,
    international: rule.international,
    passed: rule.default_total === 10 && rule.india_focused === 6 && rule.international === 4
  };
});

const allForbiddenCleared = forbiddenResults.every((r) => r.passed);
const allRequiredPresent = requiredResults.every((r) => r.passed);
const allSafetyPresent = safetyResults.every((r) => r.passed);
const allDailyRulesValid = dailyContextResults.length > 0 && dailyContextResults.every((r) => r.passed);

if (!allForbiddenCleared) throw new Error("Forbidden public/internal strings remain.");
if (!allRequiredPresent) throw new Error("Required public correction strings missing.");
if (!allSafetyPresent) throw new Error("Safety boundary strings missing.");
if (!allDailyRulesValid) throw new Error("Daily context 10 / 6 / 4 rule validation failed.");

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const source = {
  module_id: "AG57C",
  title: "AG57C Source Consumption Record",
  status: "source_consumption_recorded",
  consumed_inputs: inputs,
  current_git_context: git,
  interpretation: "AG57C validates that AG57B actual UI/content corrections cleared the five AG56Z pre-live defects. No deployment, live check, backend/runtime, service-role use or V02 expansion is performed."
};

const publicCopy = {
  module_id: "AG57C",
  title: "Public Copy Validation Record",
  status: "public_copy_validation_passed",
  audit_passed: true,
  forbidden_string_results: forbiddenResults,
  required_public_string_results: requiredResults,
  public_copy_defects_cleared: allForbiddenCleared && allRequiredPresent
};

const signalRule = {
  module_id: "AG57C",
  title: "Daily Signal Rule Validation Record",
  status: "daily_signal_rule_validation_passed",
  audit_passed: true,
  expected_rule: {
    default_total: 10,
    india_focused: 6,
    international: 4
  },
  homepage_rule_visible: indexHtml.includes("Default daily selection: 10 signals — 6 India-focused and 4 international"),
  generated_daily_context_results: dailyContextResults,
  daily_signal_rule_cleared: allDailyRulesValid
};

const safety = {
  module_id: "AG57C",
  title: "Safety Boundary Validation Record",
  status: "safety_boundary_validation_passed",
  audit_passed: true,
  safety_string_results: safetyResults,
  safety_boundary_cleared: allSafetyPresent
};

const validation = {
  module_id: "AG57C",
  title: "Defect Clearance Validation Record",
  status: "all_ag56z_pre_live_defects_validated_cleared",
  audit_passed: true,
  validated_defects: [
    {
      defect_id: "public_copy_internal_ui_step_3_integration",
      cleared: allForbiddenCleared && indexHtml.includes("Discover → Read → Reflect")
    },
    {
      defect_id: "daily_signal_selection_rule_visibility",
      cleared: allDailyRulesValid && indexHtml.includes("First Light — 10 Daily Signals")
    },
    {
      defect_id: "discover_read_reflect_public_alignment",
      cleared: indexHtml.includes("Discover → Read → Reflect")
    },
    {
      defect_id: "sports_desk_loading_placeholders",
      cleared: !indexHtml.includes("Fetching live events...") && indexHtml.includes("Live-event cards will appear after editorial activation.")
    },
    {
      defect_id: "word_panchang_reflection_vedic_safety",
      cleared: allSafetyPresent
    }
  ],
  cleared_defect_count: 5,
  remaining_defect_count: 0,
  deployment_performed: false,
  backend_runtime_activated: false,
  service_role_used: false,
  v02_expansion_started: false
};

const readiness = {
  module_id: "AG57C",
  title: "AG57Z Pre-Live Defect Clearance Closure Readiness Record",
  status: "ready_for_ag57z_pre_live_defect_clearance_closure",
  ready_for_ag57z: true,
  next_stage_id: "AG57Z",
  next_stage_title: "Pre-Live Defect Clearance Closure",
  cleared_defect_count: 5,
  remaining_defect_count: 0,
  hard_blocker_count_for_ag57z: 0
};

const boundary = {
  module_id: "AG57C",
  title: "AG57C to AG57Z Pre-Live Defect Clearance Closure Boundary",
  status: "ag57z_pre_live_defect_clearance_closure_boundary_created",
  allowed_scope: [
    "Close AG57 pre-live defect clearance.",
    "Record that five AG56Z pre-live defects were cleared by AG57B and validated by AG57C.",
    "Prepare AG58 final static release candidate build/readiness stage."
  ],
  blocked_scope: [
    "deployment or Vercel trigger",
    "GitHub release/tag creation",
    "live public check unless separately approved",
    "backend/Auth/Supabase activation",
    "runtime database/API reading",
    "RLS/grant mutation",
    "service-role use",
    "V02 expansion"
  ]
};

const review = {
  module_id: "AG57C",
  title: "Defect Clearance Validation",
  status: "defect_clearance_validation_ready_for_ag57z",
  depends_on: ["AG57B", "AG57A", "AG56Z"],
  source_file: outputs.source,
  validation_file: outputs.validation,
  public_copy_file: outputs.publicCopy,
  signal_rule_file: outputs.signalRule,
  safety_file: outputs.safety,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag57c_defect_clearance_validation_recorded: true,
    all_ag56z_pre_live_defects_validated_cleared: true,
    public_copy_validation_passed: true,
    daily_signal_rule_validation_passed: true,
    safety_boundary_validation_passed: true,
    cleared_defect_count: 5,
    remaining_defect_count: 0,
    ready_for_ag57z_pre_live_defect_clearance_closure: true,
    deployment_performed: false,
    backend_runtime_activated: false,
    service_role_used: false,
    v02_expansion_started: false,
    git_head_short: git.head,
    branch: git.branch
  }
};

const registry = { module_id: "AG57C", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG57C",
  status: review.status,
  ag57c_defect_clearance_validation_recorded: 1,
  all_ag56z_pre_live_defects_validated_cleared: 1,
  public_copy_validation_passed: 1,
  daily_signal_rule_validation_passed: 1,
  safety_boundary_validation_passed: 1,
  cleared_defect_count: 5,
  remaining_defect_count: 0,
  ready_for_ag57z_pre_live_defect_clearance_closure: 1,
  deployment_performed: 0,
  backend_runtime_activated: 0,
  service_role_used: 0,
  v02_expansion_started: 0
};

const doc = `# AG57C — Defect Clearance Validation

## Result

AG57C validates that AG57B cleared the five AG56Z pre-live defects.

## Validated clear

1. Internal public copy removed.
2. Daily Signal rule visible and recorded: 10 signals = 6 India-focused + 4 international.
3. Homepage aligned to Discover → Read → Reflect.
4. Sports Desk loading/fetching placeholders replaced with stable editorial-preview fallback text.
5. Word/Panchang/Vedic/Star Reflection safety notes are present.

## Still blocked

- No deployment.
- No live public check.
- No backend/Auth/Supabase/RLS/database runtime.
- No service-role use.
- No V02 expansion.

## Next

AG57Z — Pre-Live Defect Clearance Closure.
`;

writeJson(outputs.source, source);
writeJson(outputs.validation, validation);
writeJson(outputs.publicCopy, publicCopy);
writeJson(outputs.signalRule, signalRule);
writeJson(outputs.safety, safety);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG57C Defect Clearance Validation generated.");
console.log("✅ All five AG56Z pre-live defects validated as cleared.");
console.log("✅ Ready for AG57Z Pre-Live Defect Clearance Closure.");
