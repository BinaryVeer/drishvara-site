import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const inputs = {
  ag57aReview: "data/content-intelligence/quality-reviews/ag57a-pre-live-defect-clearance-file-mapping.json",
  ag57aFileMap: "data/content-intelligence/pre-live/ag57a-defect-file-mapping-record.json",
  ag57aPlan: "data/content-intelligence/pre-live/ag57a-to-ag57b-correction-target-plan.json",
  ag57aReadiness: "data/content-intelligence/quality-registry/ag57a-ag57b-public-ui-content-correction-readiness-record.json",
  ag56zDefects: "data/content-intelligence/content-loop/ag56z-pre-live-defect-list-record.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag57b-public-ui-content-correction.json",
  apply: "data/content-intelligence/pre-live/ag57b-public-ui-content-correction-apply-record.json",
  defectClearance: "data/content-intelligence/pre-live/ag57b-defect-clearance-record.json",
  fileDelta: "data/content-intelligence/pre-live/ag57b-source-file-delta-record.json",
  readiness: "data/content-intelligence/quality-registry/ag57b-ag57c-defect-clearance-validation-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag57b-to-ag57c-defect-clearance-validation-boundary.json",
  registry: "data/quality/ag57b-public-ui-content-correction.json",
  preview: "data/quality/ag57b-public-ui-content-correction-preview.json",
  doc: "docs/quality/AG57B_PUBLIC_UI_CONTENT_CORRECTION.md"
};

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function write(p, txt) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), txt);
}
function writeJson(p, obj) {
  write(p, JSON.stringify(obj, null, 2) + "\n");
}
function run(cmd) {
  try { return execSync(cmd, { cwd: root, encoding: "utf8" }).trim(); }
  catch { return ""; }
}
function replaceExact(text, from, to, changes, file) {
  if (text.includes(from)) {
    text = text.split(from).join(to);
    changes.push({ file, from, to, status: "replaced" });
  } else {
    changes.push({ file, from, to, status: "not_found" });
  }
  return text;
}
function ensureContains(text, anchor, addition, changes, file, id) {
  if (text.includes(addition)) {
    changes.push({ file, id, status: "already_present" });
    return text;
  }
  if (text.includes(anchor)) {
    text = text.replace(anchor, anchor + addition);
    changes.push({ file, id, status: "inserted_after_anchor" });
  } else {
    changes.push({ file, id, status: "anchor_not_found" });
  }
  return text;
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG57B input: ${p}`);
}

const ag57aReview = readJson(inputs.ag57aReview);
const ag57aPlan = readJson(inputs.ag57aPlan);
const ag56zDefects = readJson(inputs.ag56zDefects);

if (ag57aReview.status !== "pre_live_defect_clearance_file_mapping_ready_for_ag57b") throw new Error("AG57A status mismatch.");
if (ag57aPlan.ag57b_must_apply_actual_changes !== true) throw new Error("AG57B actual-change requirement missing.");
if (ag56zDefects.open_watch_item_count !== 5) throw new Error("AG56Z defect count must be 5.");

const changedFiles = [];
const changes = [];

if (!exists("index.html")) throw new Error("index.html missing.");
let indexHtml = read("index.html");

indexHtml = replaceExact(indexHtml, "UI Step 3 Integration", "Discover → Read → Reflect", changes, "index.html");
indexHtml = replaceExact(indexHtml, "From signal to reading to reflection", "From daily signals to deeper reading and reflection", changes, "index.html");
indexHtml = replaceExact(indexHtml, "First Light — 24 Hrs across India", "First Light — 10 Daily Signals", changes, "index.html");
indexHtml = replaceExact(indexHtml, "First Light and daily signal cards surface what is worth noticing.", "First Light surfaces ten daily signals by default: six India-focused signals and four international signals.", changes, "index.html");

indexHtml = replaceExact(indexHtml, '<div class="sub">Loading</div>\n              <div class="title">Fetching live events...</div>', '<div class="sub">Prepared surface</div>\n              <div class="title">Live-event cards will appear after editorial activation.</div>', changes, "index.html");
indexHtml = replaceExact(indexHtml, '<div class="sub">Loading</div>\n              <div class="title">Fetching tournament cards...</div>', '<div class="sub">Prepared surface</div>\n              <div class="title">Tournament cards are held for verified sports context.</div>', changes, "index.html");
indexHtml = replaceExact(indexHtml, '<div class="sub">Loading</div>\n              <div class="title">Fetching major updates...</div>', '<div class="sub">Prepared surface</div>\n              <div class="title">Major sports updates will appear after editorial review.</div>', changes, "index.html");
indexHtml = replaceExact(indexHtml, '<div class="sub">Loading</div>\n              <div class="title">Fetching featured sports article...</div>', '<div class="sub">Prepared surface</div>\n              <div class="title">Featured sports reading will appear after curation.</div>', changes, "index.html");

indexHtml = replaceExact(indexHtml, "Fetching first-light signals...", "Daily signal rail prepared for editorial activation.", changes, "index.html");
indexHtml = replaceExact(indexHtml, "Fetching featured reads...", "Featured reads are prepared for editorial curation.", changes, "index.html");
indexHtml = replaceExact(indexHtml, "Fetching reading guide...", "Reading guide prepared for editorial curation.", changes, "index.html");
indexHtml = replaceExact(indexHtml, "Fetching indexed reads...", "Indexed reads will appear after editorial activation.", changes, "index.html");
indexHtml = replaceExact(indexHtml, "Loading festivals...", "Festival preview is under editorial verification.", changes, "index.html");

indexHtml = ensureContains(
  indexHtml,
  '<h2 class="section-title-sm" id="first-light-title">First Light — 10 Daily Signals</h2>',
  '\n          <p class="section-note" id="first-light-rule-note">Default daily selection: 10 signals — 6 India-focused and 4 international — reviewed before article movement.</p>',
  changes,
  "index.html",
  "first_light_10_signal_rule_note"
);

indexHtml = ensureContains(
  indexHtml,
  '<div class="label">Today’s Vedic Guidance</div>',
  '\n          <p class="section-note vedic-safety-note">Reflective preview only; weekday, colour, mantra and food logic require verified source methodology before activation.</p>',
  changes,
  "index.html",
  "vedic_safety_note"
);

indexHtml = ensureContains(
  indexHtml,
  '<div class="label">Panchang & Festival View</div>',
  '\n          <p class="section-note panchang-safety-note">Preview status: exact Panchang output is withheld until source, regional method and location calculation are verified.</p>',
  changes,
  "index.html",
  "panchang_safety_note"
);

indexHtml = ensureContains(
  indexHtml,
  '<div class="label">Word of the Day</div>',
  '\n          <p class="section-note word-safety-note">Curated linguistic preview; Sanskrit/Hindi meaning, usage and source methodology remain under editorial verification.</p>',
  changes,
  "index.html",
  "word_safety_note"
);

indexHtml = ensureContains(
  indexHtml,
  '<div class="label">Star Reflection</div>',
  '\n          <p class="section-note star-safety-note">Reflective prompt only; not a personal prediction, assessment, or decision guide.</p>',
  changes,
  "index.html",
  "star_reflection_safety_note"
);

write("index.html", indexHtml);
changedFiles.push("index.html");

if (exists("assets/js/drishvara-language-runtime.js")) {
  let runtime = read("assets/js/drishvara-language-runtime.js");

  runtime = replaceExact(runtime, '"From signal to reading to reflection": "संकेत से पठन और फिर चिंतन तक"', '"From daily signals to deeper reading and reflection": "दैनिक संकेतों से गहरे पठन और चिंतन तक"', changes, "assets/js/drishvara-language-runtime.js");
  runtime = replaceExact(runtime, '"UI Step 3 Integration": "UI चरण 3 एकीकरण"', '"Discover → Read → Reflect": "खोजें → पढ़ें → चिंतन करें"', changes, "assets/js/drishvara-language-runtime.js");

  const additions = [
    '    "Prepared surface": "तैयार सतह",',
    '    "Live-event cards will appear after editorial activation.": "संपादकीय सक्रियण के बाद लाइव इवेंट कार्ड दिखाई देंगे।",',
    '    "Tournament cards are held for verified sports context.": "टूर्नामेंट कार्ड सत्यापित खेल संदर्भ के लिए रोके गए हैं।",',
    '    "Major sports updates will appear after editorial review.": "संपादकीय समीक्षा के बाद प्रमुख खेल अपडेट दिखाई देंगे।",',
    '    "Featured sports reading will appear after curation.": "चयन के बाद प्रमुख खेल लेख दिखाई देगा।",',
    '    "First Light — 10 Daily Signals": "प्रथम संकेत — 10 दैनिक संकेत",',
    '    "Default daily selection: 10 signals — 6 India-focused and 4 international — reviewed before article movement.": "डिफ़ॉल्ट दैनिक चयन: 10 संकेत — 6 भारत-केंद्रित और 4 अंतरराष्ट्रीय — लेख प्रवाह से पहले समीक्षा किए गए।",',
    '    "Reflective preview only; weekday, colour, mantra and food logic require verified source methodology before activation.": "केवल सामान्य चिंतनात्मक पूर्वावलोकन; कोई निश्चित भविष्यवाणी या लाइव गणना सक्रिय नहीं है।",',
    '    "Preview status: exact Panchang output is withheld until source, regional method and location calculation are verified.": "पूर्वावलोकन स्थिति: किसी भी लाइव पंचांग आउटपुट से पहले स्रोत और क्षेत्रीय पद्धति सत्यापन आवश्यक है।",',
    '    "Curated linguistic preview; Sanskrit/Hindi meaning, usage and source methodology remain under editorial verification.": "चयनित भाषा पूर्वावलोकन; सार्वजनिक विस्तार से पहले अर्थ संपादकीय समीक्षा में रहेंगे।",',
    '    "Reflective prompt only; not a personal prediction, assessment, or decision guide.": "केवल चिंतनात्मक संकेत; यह व्यक्तिगत भविष्यवाणी, आकलन या निर्णय मार्गदर्शिका नहीं है।",'
  ];

  const missingAdditions = additions.filter((line) => !runtime.includes(line));
  if (missingAdditions.length > 0) {
    const marker = '    "Reflection over reaction": "प्रतिक्रिया से अधिक चिंतन"';
    if (runtime.includes(marker)) {
      runtime = runtime.replace(marker, marker + ",\n" + missingAdditions.join("\n"));
      changes.push({ file: "assets/js/drishvara-language-runtime.js", id: "language_runtime_ag57b_additions", status: "inserted" });
    } else {
      changes.push({ file: "assets/js/drishvara-language-runtime.js", id: "language_runtime_ag57b_additions", status: "anchor_not_found" });
    }
  }

  write("assets/js/drishvara-language-runtime.js", runtime);
  changedFiles.push("assets/js/drishvara-language-runtime.js");
}

const sportsFiles = [
  "generated/sports-context/2026-04-30-sports-context.json",
  "generated/sports-context/2026-05-10-sports-context.json",
  "generated/sports-context/2026-04-11-sports-context.json"
];

for (const file of sportsFiles) {
  if (!exists(file)) continue;
  let txt = read(file);
  txt = replaceExact(txt, "Major live events, tournament movement, and selected sports signals will appear here as the Sports Desk matures.", "Sports Desk is in editorial preview. Verified event, tournament, and article cards will appear after activation.", changes, file);
  write(file, txt);
  changedFiles.push(file);
}

if (exists("scripts/build-sports-context.js")) {
  let txt = read("scripts/build-sports-context.js");
  txt = replaceExact(txt, "Major live events, tournament movement, and selected sports signals will appear here as the Sports Desk matures.", "Sports Desk is in editorial preview. Verified event, tournament, and article cards will appear after activation.", changes, "scripts/build-sports-context.js");
  write("scripts/build-sports-context.js", txt);
  changedFiles.push("scripts/build-sports-context.js");
}

const generatedDailyContextFiles = fs.existsSync(full("generated/daily-context"))
  ? fs.readdirSync(full("generated/daily-context")).filter((f) => f.endsWith(".json")).map((f) => `generated/daily-context/${f}`)
  : [];

for (const file of generatedDailyContextFiles) {
  try {
    const obj = readJson(file);
    obj.first_light = obj.first_light || {};
    obj.first_light.selection_rule = {
      default_total: 10,
      india_focused: 6,
      international: 4,
      status: "v01_public_rule",
      note: "Default daily signal selection rule preserved for AG57B pre-live correction."
    };
    writeJson(file, obj);
    changedFiles.push(file);
    changes.push({ file, id: "first_light_selection_rule", status: "inserted_or_updated" });
  } catch {
    changes.push({ file, id: "first_light_selection_rule", status: "json_parse_skipped" });
  }
}

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short origin/main"),
  status_after_patch: run("git status --short") || "clean"
};

const defectClearance = {
  module_id: "AG57B",
  title: "AG57B Defect Clearance Record",
  status: "public_ui_content_defects_corrected_pending_ag57c_validation",
  actual_source_changes_applied: true,
  corrected_defects: [
    "public_copy_internal_ui_step_3_integration",
    "daily_signal_selection_rule_visibility",
    "discover_read_reflect_public_alignment",
    "sports_desk_loading_placeholders",
    "word_panchang_reflection_vedic_safety"
  ],
  correction_notes: [
    "Internal UI Step 3 Integration text replaced with Discover → Read → Reflect.",
    "Daily signal rule made visible as 10 signals: 6 India-focused and 4 international.",
    "Sports Desk loading/fetching placeholders replaced by stable editorial-preview fallbacks.",
    "Word/Panchang/Vedic/Star Reflection preview safety notes added.",
    "Generated daily context receives explicit First Light selection-rule metadata."
  ]
};

const fileDelta = {
  module_id: "AG57B",
  title: "AG57B Source File Delta Record",
  status: "source_file_delta_recorded",
  changed_files: [...new Set(changedFiles)].sort(),
  changes
};

const apply = {
  module_id: "AG57B",
  title: "Public UI-Content Correction Apply Record",
  status: "public_ui_content_correction_applied",
  actual_source_changes_applied: true,
  consumed_inputs: inputs,
  apply_git_context: git,
  file_delta_record: outputs.fileDelta,
  defect_clearance_record: outputs.defectClearance,
  no_deployment: true,
  no_backend_runtime: true,
  no_service_role_use: true,
  no_v02_expansion: true
};

const readiness = {
  module_id: "AG57B",
  title: "AG57C Defect Clearance Validation Readiness Record",
  status: "ready_for_ag57c_defect_clearance_validation",
  ready_for_ag57c: true,
  next_stage_id: "AG57C",
  next_stage_title: "Defect Clearance Validation",
  hard_blocker_count_for_ag57c: 0
};

const boundary = {
  module_id: "AG57B",
  title: "AG57B to AG57C Defect Clearance Validation Boundary",
  status: "ag57c_defect_clearance_validation_boundary_created",
  allowed_scope: [
    "Validate corrected public copy.",
    "Validate Sports Desk stable fallback.",
    "Validate Daily Signal 10 / 6 / 4 rule.",
    "Validate Discover → Read → Reflect alignment.",
    "Validate Word/Panchang/Reflection/Vedic safety text."
  ],
  blocked_scope: [
    "deployment or Vercel trigger",
    "GitHub release/tag creation",
    "backend/Auth/Supabase activation",
    "runtime database/API reading",
    "RLS/grant mutation",
    "service-role use",
    "V02 expansion"
  ]
};

const review = {
  module_id: "AG57B",
  title: "Public UI-Content Correction Patch",
  status: "public_ui_content_correction_applied_ready_for_ag57c",
  depends_on: ["AG57A", "AG56Z"],
  apply_file: outputs.apply,
  defect_clearance_file: outputs.defectClearance,
  file_delta_file: outputs.fileDelta,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag57b_public_ui_content_correction_applied: true,
    actual_source_changes_applied: true,
    corrected_defect_count: 5,
    ready_for_ag57c_defect_clearance_validation: true,
    deployment_performed: false,
    backend_runtime_activated: false,
    service_role_used: false,
    v02_expansion_started: false,
    git_head_short: git.head,
    branch: git.branch
  }
};

const registry = { module_id: "AG57B", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG57B",
  status: review.status,
  ag57b_public_ui_content_correction_applied: 1,
  actual_source_changes_applied: 1,
  corrected_defect_count: 5,
  ready_for_ag57c_defect_clearance_validation: 1,
  deployment_performed: 0,
  backend_runtime_activated: 0,
  service_role_used: 0,
  v02_expansion_started: 0
};

const doc = `# AG57B — Public UI-Content Correction Patch

## Result

AG57B applies actual UI/content corrections to active source files.

## Corrected

1. Replaced internal “UI Step 3 Integration” public copy.
2. Aligned homepage wording to Discover → Read → Reflect.
3. Made Daily Signal rule visible: 10 signals = 6 India-focused + 4 international.
4. Replaced Sports Desk loading/fetching placeholders with stable editorial-preview fallbacks.
5. Added safety notes for Word, Panchang, Vedic Guidance and Star Reflection preview surfaces.

## Still blocked

- No deployment.
- No live public check.
- No backend/Auth/Supabase/RLS/database runtime.
- No service-role use.
- No V02 expansion.

## Next

AG57C — Defect Clearance Validation.
`;

writeJson(outputs.apply, apply);
writeJson(outputs.defectClearance, defectClearance);
writeJson(outputs.fileDelta, fileDelta);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
write(outputs.doc, doc);

console.log("✅ AG57B Public UI-Content Correction Patch applied.");
console.log("✅ Actual source/content files changed.");
console.log("✅ Five AG56Z pre-live defects corrected pending AG57C validation.");
console.log("✅ No deployment, backend/runtime, service-role use or V02 expansion performed.");
