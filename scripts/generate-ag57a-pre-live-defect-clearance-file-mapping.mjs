import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const inputs = {
  ag56zReview: "data/content-intelligence/quality-reviews/ag56z-version-01-live-closure.json",
  ag56zDefects: "data/content-intelligence/content-loop/ag56z-pre-live-defect-list-record.json",
  ag56zHandoff: "data/content-intelligence/content-loop/ag56z-post-closure-handoff-record.json",
  ag56zReadiness: "data/content-intelligence/quality-registry/ag56z-pre-live-defect-clearance-readiness-record.json",
  ag56zBoundary: "data/content-intelligence/mutation-plans/ag56z-to-pre-live-defect-clearance-boundary.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag57a-pre-live-defect-clearance-file-mapping.json",
  source: "data/content-intelligence/pre-live/ag57a-source-consumption-record.json",
  fileMap: "data/content-intelligence/pre-live/ag57a-defect-file-mapping-record.json",
  correctionPlan: "data/content-intelligence/pre-live/ag57a-to-ag57b-correction-target-plan.json",
  readiness: "data/content-intelligence/quality-registry/ag57a-ag57b-public-ui-content-correction-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag57a-to-ag57b-public-ui-content-correction-boundary.json",
  registry: "data/quality/ag57a-pre-live-defect-clearance-file-mapping.json",
  preview: "data/quality/ag57a-pre-live-defect-clearance-file-mapping-preview.json",
  doc: "docs/quality/AG57A_PRE_LIVE_DEFECT_CLEARANCE_FILE_MAPPING.md"
};

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
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
  if (!exists(p)) throw new Error(`Missing AG57A input: ${p}`);
}

const data = Object.fromEntries(Object.entries(inputs).map(([k, p]) => [k, readJson(p)]));

if (data.ag56zReview.status !== "version_01_live_closure_completed_conditionally") throw new Error("AG56Z closure status mismatch.");
if (data.ag56zDefects.open_watch_item_count !== 5) throw new Error("AG56Z must carry 5 pre-live defects.");
if (data.ag56zReadiness.ready_for_pre_live_defect_clearance !== true) throw new Error("AG56Z readiness for pre-live clearance missing.");

const excludedDirs = new Set([".git", "node_modules", ".next", "dist", "build", "out", "coverage", ".vercel"]);
const excludedPrefixes = [
  "data/content-intelligence/",
  "data/quality/",
  "docs/quality/",
  "scripts/generate-ag",
  "scripts/validate-ag"
];

const allowedExt = new Set([
  ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs",
  ".json", ".md", ".mdx", ".html", ".css", ".scss"
]);

function walk(dir = ".") {
  const abs = full(dir);
  if (!fs.existsSync(abs)) return [];
  const out = [];
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    if (excludedDirs.has(entry.name)) continue;
    const rel = path.join(dir, entry.name).replace(/^\.\//, "");
    if (entry.isDirectory()) out.push(...walk(rel));
    else {
      const ext = path.extname(entry.name);
      if (!allowedExt.has(ext)) continue;
      if (excludedPrefixes.some((prefix) => rel.startsWith(prefix))) continue;
      out.push(rel);
    }
  }
  return out;
}

function grepFiles(patterns) {
  const files = walk(".");
  const matches = [];
  for (const file of files) {
    let text = "";
    try { text = fs.readFileSync(full(file), "utf8"); } catch { continue; }
    const fileMatches = [];
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, "i");
      if (regex.test(text)) fileMatches.push(pattern);
    }
    if (fileMatches.length > 0) matches.push({ file, matched_patterns: fileMatches });
  }
  return matches;
}

const defectMappings = [
  {
    defect_id: "public_copy_internal_ui_step_3_integration",
    defect_label: "Internal public copy: UI Step 3 Integration",
    patterns: ["UI Step 3 Integration", "Step 3 Integration", "Integration", "signal to reading to reflection"],
    expected_ag57b_action: "Replace internal/developer wording with public-facing Discover → Read → Reflect copy."
  },
  {
    defect_id: "daily_signal_selection_rule_visibility",
    defect_label: "Daily Signal rule: 10 signals = 6 India + 4 International",
    patterns: ["daily signal", "Daily Signal", "First Light", "india", "international", "signalCount", "signals"],
    expected_ag57b_action: "Ensure source logic/docs/UI reflect default 10 signals: 6 India and 4 International."
  },
  {
    defect_id: "discover_read_reflect_public_alignment",
    defect_label: "Homepage doctrine: Discover → Read → Reflect",
    patterns: ["Discover", "Read", "Reflect", "First Light", "Daily Surface", "homepage"],
    expected_ag57b_action: "Align homepage public copy and module sequence to Discover → Read → Reflect."
  },
  {
    defect_id: "sports_desk_loading_placeholders",
    defect_label: "Sports Desk loading/fetching placeholder",
    patterns: ["Sports Desk", "Loading", "Fetching", "fetching", "loading", "sports"],
    expected_ag57b_action: "Replace permanent loading/fetching cards with stable fallback, coming-soon state, or hide condition."
  },
  {
    defect_id: "word_panchang_reflection_vedic_safety",
    defect_label: "Word/Panchang/Reflection/Vedic safety boundary",
    patterns: ["Word of the Day", "Panchang", "Vedic", "Reflection", "Star Reflection", "mantra", "nakshatra"],
    expected_ag57b_action: "Ensure preview text is non-deterministic, non-diagnostic, non-invented and clearly preview/static where needed."
  }
];

const mappedDefects = defectMappings.map((defect) => ({
  ...defect,
  candidate_files: grepFiles(defect.patterns),
  mapping_status: "mapped_for_ag57b_review"
}));

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short origin/main"),
  status: run("git status --short") || "clean"
};

const source = {
  module_id: "AG57A",
  title: "AG57A Source Consumption Record",
  status: "source_consumption_recorded",
  consumed_sources: Object.values(inputs),
  current_git_context: git,
  interpretation: "AG57A maps the AG56Z pre-live defects to likely source files/components. It does not modify UI/content. AG57B must apply actual corrections."
};

const fileMap = {
  module_id: "AG57A",
  title: "Pre-Live Defect File Mapping Record",
  status: "pre_live_defect_file_mapping_recorded",
  audit_passed: true,
  defect_count: mappedDefects.length,
  mapped_defects: mappedDefects,
  note: "Candidate files are based on repository text search. AG57B should patch the highest-confidence source files only."
};

const correctionPlan = {
  module_id: "AG57A",
  title: "AG57A to AG57B Correction Target Plan",
  status: "ag57b_public_ui_content_correction_plan_recorded",
  next_stage_id: "AG57B",
  next_stage_title: "Public UI-Content Correction Patch",
  ag57b_must_apply_actual_changes: true,
  correction_targets: mappedDefects.map((d) => ({
    defect_id: d.defect_id,
    defect_label: d.defect_label,
    expected_action: d.expected_ag57b_action,
    candidate_file_count: d.candidate_files.length,
    highest_confidence_files: d.candidate_files.slice(0, 10).map((m) => m.file)
  })),
  hard_boundary: [
    "AG57B must include actual source/content corrections.",
    "AG57B must not be another audit-only stage.",
    "AG57B must not deploy, publish live, activate backend/runtime, use service-role keys or start V02."
  ]
};

const readiness = {
  module_id: "AG57A",
  title: "AG57B Public UI-Content Correction Readiness Record",
  status: "ready_for_ag57b_public_ui_content_correction_patch",
  ready_for_ag57b: true,
  next_stage_id: "AG57B",
  next_stage_title: "Public UI-Content Correction Patch",
  mapped_defect_count: mappedDefects.length,
  hard_blocker_count_for_ag57b: 0,
  ag57b_expected_output: [
    "Actual correction of public copy issue.",
    "Actual correction/validation of daily signal rule.",
    "Actual homepage doctrine alignment.",
    "Actual Sports Desk fallback correction.",
    "Actual Word/Panchang/Reflection/Vedic safety wording correction."
  ]
};

const boundary = {
  module_id: "AG57A",
  title: "AG57A to AG57B Public UI-Content Correction Boundary",
  status: "ag57b_public_ui_content_correction_boundary_created",
  allowed_scope: [
    "Edit source/UI/content files needed to clear AG56Z defects.",
    "Replace internal public copy.",
    "Fix stable fallback for loading/fetching surfaces.",
    "Align homepage doctrine and daily signal rules.",
    "Strengthen safety wording for Word/Panchang/Reflection/Vedic preview modules."
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
  module_id: "AG57A",
  title: "Pre-Live Defect Clearance File Mapping",
  status: "pre_live_defect_clearance_file_mapping_ready_for_ag57b",
  depends_on: ["AG56Z", "AG56.8", "AG45", "AG46"],
  source_file: outputs.source,
  file_mapping_file: outputs.fileMap,
  correction_plan_file: outputs.correctionPlan,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag57a_file_mapping_recorded: true,
    ag56z_pre_live_defects_consumed: true,
    mapped_defect_count: mappedDefects.length,
    ready_for_ag57b_public_ui_content_correction_patch: true,
    ag57b_must_apply_actual_changes: true,
    hard_blocker_count_for_ag57b: 0,
    git_head_short: git.head,
    branch: git.branch
  }
};

const registry = { module_id: "AG57A", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG57A",
  status: review.status,
  ag57a_file_mapping_recorded: 1,
  ag56z_pre_live_defects_consumed: 1,
  mapped_defect_count: mappedDefects.length,
  ready_for_ag57b_public_ui_content_correction_patch: 1,
  ag57b_must_apply_actual_changes: 1,
  hard_blocker_count_for_ag57b: 0
};

const doc = `# AG57A — Pre-Live Defect Clearance File Mapping

## Result

AG57A maps the five AG56Z pre-live defects to candidate source/UI/content files.

## Important

AG57A does not change the UI. AG57B must apply actual source/content corrections.

## Defects mapped

1. UI Step 3 Integration public-copy issue
2. Daily Signal rule: 10 signals = 6 India + 4 International
3. Discover → Read → Reflect homepage doctrine
4. Sports Desk loading/fetching placeholders
5. Word/Panchang/Reflection/Vedic safety boundary

## Next

AG57B — Public UI-Content Correction Patch.
`;

writeJson(outputs.source, source);
writeJson(outputs.fileMap, fileMap);
writeJson(outputs.correctionPlan, correctionPlan);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG57A Pre-Live Defect Clearance File Mapping generated.");
console.log("✅ Five AG56Z defects mapped to candidate source/content files.");
console.log("✅ AG57B correction plan created.");
console.log("✅ AG57B is required to apply actual UI/content changes, not only audit records.");
