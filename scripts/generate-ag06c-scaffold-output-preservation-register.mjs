import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const configPath = path.join(root, "data", "quality", "ag06c-scaffold-output-preservation-register.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

function rel(filePath) {
  return path.relative(root, filePath).replaceAll(path.sep, "/");
}

function listFiles(dir) {
  const full = path.join(root, dir);
  if (!fs.existsSync(full)) return [];
  const out = [];

  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const p = path.join(current, entry.name);
      const rp = rel(p);

      if (
        rp.startsWith(".git/") ||
        rp.startsWith("node_modules/") ||
        rp.startsWith("_local_archive/") ||
        rp.startsWith("archive/") ||
        rp.startsWith("review-bundles/")
      ) {
        continue;
      }

      if (entry.isDirectory()) {
        walk(p);
      } else if (entry.isFile()) {
        out.push(p);
      }
    }
  }

  walk(full);
  return out.sort();
}

function markerKey(filename) {
  if (filename === "01_input.json") return "input";
  if (filename === "02_normalized_brief.json") return "normalized_brief";
  if (filename === "03_story_draft.json") return "story_draft";
  if (filename === "04_visual_plan.json") return "visual_plan";
  if (filename === "05_integrated_draft.json") return "integrated_draft";
  if (/^06_guard_report/i.test(filename)) return "guard_report";
  if (filename === "07_publish_bundle.json") return "publish_bundle";
  if (filename === "08_final_output.md") return "final_markdown";
  if (filename === "09_final_output.html") return "final_html";
  if (filename === "10_learning_snapshot.json") return "learning_snapshot";
  if (filename === "11_promotion_summary.json") return "promotion_summary";
  if (filename === "12_playbook_summary.json") return "playbook_summary";
  return null;
}

function wordCount(text) {
  return String(text || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function safeReadJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function extractTitleFromText(text) {
  const titleLine = String(text || "").split(/\n/).find((line) => /^#\s+/.test(line.trim()));
  if (titleLine) return titleLine.replace(/^#\s+/, "").trim().slice(0, 220);
  return null;
}

function extractRunTitle(artifacts) {
  if (artifacts.final_markdown?.path) {
    const text = fs.readFileSync(path.join(root, artifacts.final_markdown.path), "utf8");
    return extractTitleFromText(text);
  }

  for (const key of ["publish_bundle", "normalized_brief", "input"]) {
    if (!artifacts[key]?.path) continue;
    const data = safeReadJson(path.join(root, artifacts[key].path));
    if (!data) continue;
    const title =
      data.title ||
      data.topic ||
      data?.brief?.title ||
      data?.content?.title ||
      data?.input?.title;
    if (title) return String(title).slice(0, 220);
  }

  return null;
}

const config = readJson(configPath);
const ag06bManifest = readJson(path.join(root, config.input_files.ag06b_manifest));
const ag06a = readJson(path.join(root, config.input_files.ag06a_audit));
const activeRegister = readJson(path.join(root, config.input_files.source_tree_active_register));

for (const required of [
  config.input_files.run_registry_schema,
  config.input_files.content_packet_schema,
  config.input_files.visual_registry_schema,
  config.input_files.learning_snapshot_schema
]) {
  readJson(path.join(root, required));
}

if (ag06bManifest.module_id !== "AG06B") throw new Error("AG06B manifest missing/invalid.");
if (ag06bManifest.summary?.ready_for_ag06c_scaffold_output_preservation_register !== true) throw new Error("AG06B must authorize AG06C.");
if (ag06a.module_id !== "AG06A") throw new Error("AG06A audit missing/invalid.");
if (activeRegister.register_id !== "SOURCE_TREE_ACTIVE_REGISTER") throw new Error("Source Tree Active Register missing/invalid.");

const scaffoldRoot = config.scan.scaffold_output_root;
const files = listFiles(scaffoldRoot);

const runs = new Map();

for (const file of files) {
  const key = markerKey(path.basename(file));
  if (!key) continue;

  const dir = rel(path.dirname(file));
  if (!runs.has(dir)) {
    runs.set(dir, {
      run_id: `scaffold_${String(runs.size + 1).padStart(4, "0")}`,
      run_directory: dir,
      artifacts: {}
    });
  }

  const row = runs.get(dir);
  row.artifacts[key] = {
    path: rel(file),
    bytes: fs.statSync(file).size
  };
}

const expectedArtifactKeys = [
  "input",
  "normalized_brief",
  "story_draft",
  "visual_plan",
  "integrated_draft",
  "guard_report",
  "publish_bundle",
  "final_markdown",
  "final_html",
  "learning_snapshot",
  "promotion_summary",
  "playbook_summary"
];

const runEntries = [...runs.values()].sort((a, b) => a.run_directory.localeCompare(b.run_directory)).map((row, index) => {
  row.run_id = `scaffold_${String(index + 1).padStart(4, "0")}`;

  const artifactKeys = Object.keys(row.artifacts).sort();
  const missingArtifactKeys = expectedArtifactKeys.filter((key) => !row.artifacts[key]);

  let finalMarkdownWordCount = 0;
  let detectedTitle = null;

  if (row.artifacts.final_markdown?.path) {
    const text = fs.readFileSync(path.join(root, row.artifacts.final_markdown.path), "utf8");
    finalMarkdownWordCount = wordCount(text);
    detectedTitle = extractTitleFromText(text);
  }

  if (!detectedTitle) detectedTitle = extractRunTitle(row.artifacts);

  return {
    ...row,
    content_id_candidate: `ci_${row.run_id}`,
    source_layer: "scaffold_output",
    detected_title: detectedTitle,
    artifact_keys: artifactKeys,
    missing_artifact_keys: missingArtifactKeys,
    artifact_count: artifactKeys.length,
    missing_artifact_count: missingArtifactKeys.length,
    has_input: Boolean(row.artifacts.input),
    has_normalized_brief: Boolean(row.artifacts.normalized_brief),
    has_story_draft: Boolean(row.artifacts.story_draft),
    has_visual_plan: Boolean(row.artifacts.visual_plan),
    has_integrated_draft: Boolean(row.artifacts.integrated_draft),
    has_guard_report: Boolean(row.artifacts.guard_report),
    has_publish_bundle: Boolean(row.artifacts.publish_bundle),
    has_final_markdown: Boolean(row.artifacts.final_markdown),
    has_final_html: Boolean(row.artifacts.final_html),
    has_learning_snapshot: Boolean(row.artifacts.learning_snapshot),
    has_promotion_summary: Boolean(row.artifacts.promotion_summary),
    has_playbook_summary: Boolean(row.artifacts.playbook_summary),
    final_markdown_word_count_estimate: finalMarkdownWordCount,
    preservation_status: "registered_not_imported",
    public_publish_status: "not_published_by_ag06c",
    eligible_for_ag06d_or_ag06e_review: Boolean(row.artifacts.final_markdown || row.artifacts.final_html),
    notes: "AG06C registers scaffold artifacts only; it does not copy, move, import or publish scaffold output."
  };
});

const counts = {
  run_entry_count: runEntries.length,
  input_count: runEntries.filter((row) => row.has_input).length,
  normalized_brief_count: runEntries.filter((row) => row.has_normalized_brief).length,
  story_draft_count: runEntries.filter((row) => row.has_story_draft).length,
  visual_plan_count: runEntries.filter((row) => row.has_visual_plan).length,
  integrated_draft_count: runEntries.filter((row) => row.has_integrated_draft).length,
  guard_report_count: runEntries.filter((row) => row.has_guard_report).length,
  publish_bundle_count: runEntries.filter((row) => row.has_publish_bundle).length,
  final_markdown_count: runEntries.filter((row) => row.has_final_markdown).length,
  final_html_count: runEntries.filter((row) => row.has_final_html).length,
  learning_snapshot_count: runEntries.filter((row) => row.has_learning_snapshot).length,
  promotion_summary_count: runEntries.filter((row) => row.has_promotion_summary).length,
  playbook_summary_count: runEntries.filter((row) => row.has_playbook_summary).length
};

const wordCounts = runEntries
  .filter((row) => row.final_markdown_word_count_estimate > 0)
  .map((row) => row.final_markdown_word_count_estimate)
  .sort((a, b) => a - b);

const avgWordCount = wordCounts.length ? Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length) : 0;
const medianWordCount = wordCounts.length ? wordCounts[Math.floor(wordCounts.length / 2)] : 0;

const missingArtifactSummary = {};
for (const key of expectedArtifactKeys) {
  missingArtifactSummary[key] = runEntries.filter((row) => row.missing_artifact_keys.includes(key)).length;
}

const register = {
  register_id: "AG06C_SCAFFOLD_OUTPUT_PRESERVATION_REGISTER",
  module_id: "AG06C",
  status: "scaffold_output_preservation_register_completed",
  generated_at: new Date().toISOString(),

  mutation_performed: false,
  public_article_mutation_performed: false,
  article_html_mutation_performed: false,
  homepage_mutation_performed: false,
  css_mutation_performed: false,
  javascript_mutation_performed: false,
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
  scaffold_file_copy_performed: false,
  scaffold_file_move_performed: false,
  scaffold_file_delete_performed: false,
  file_deletion_performed: false,
  file_move_performed: false,

  source_context: {
    ag06b_manifest_summary: ag06bManifest.summary,
    ag06a_summary: ag06a.summary,
    source_tree_register_status: activeRegister.status,
    scaffold_output_root: scaffoldRoot
  },

  summary: {
    ...counts,
    final_markdown_average_word_count_estimate: avgWordCount,
    final_markdown_median_word_count_estimate: medianWordCount,
    runs_with_final_markdown_above_1500_words: runEntries.filter((row) => row.final_markdown_word_count_estimate >= 1500).length,
    runs_with_final_markdown_above_1200_words: runEntries.filter((row) => row.final_markdown_word_count_estimate >= 1200).length,
    missing_artifact_summary: missingArtifactSummary,
    preservation_register_only: true,
    public_article_mutation_performed: false,
    backend_auth_supabase_activation_performed: false,
    ready_for_ag06d_existing_public_article_classification: true,
    next_stage_id: "AG06D"
  },

  scaffold_run_entries: runEntries,
  next_recommended_stage: config.recommended_next_stage
};

const preview = {
  preview_id: "AG06C_SCAFFOLD_OUTPUT_PRESERVATION_PREVIEW",
  module_id: "AG06C",
  preview_only: true,
  status: "preview_scaffold_output_preservation_register",
  summary: register.summary,
  sample_run_entries: runEntries.slice(0, 20).map((row) => ({
    run_id: row.run_id,
    run_directory: row.run_directory,
    detected_title: row.detected_title,
    artifact_count: row.artifact_count,
    missing_artifact_count: row.missing_artifact_count,
    has_final_markdown: row.has_final_markdown,
    has_visual_plan: row.has_visual_plan,
    has_learning_snapshot: row.has_learning_snapshot,
    final_markdown_word_count_estimate: row.final_markdown_word_count_estimate,
    preservation_status: row.preservation_status
  })),
  mutation_performed: false,
  next_recommended_stage: config.recommended_next_stage
};

writeJson(path.join(root, config.outputs.preservation_register), register);
writeJson(path.join(root, config.outputs.preview), preview);

console.log(`Created ${config.outputs.preservation_register}.`);
console.log(`Created ${config.outputs.preview}.`);
console.log(`Run entries: ${register.summary.run_entry_count}`);
console.log(`Final markdown outputs: ${register.summary.final_markdown_count}`);
console.log(`Final HTML outputs: ${register.summary.final_html_count}`);
console.log(`Visual plans: ${register.summary.visual_plan_count}`);
console.log(`Learning snapshots: ${register.summary.learning_snapshot_count}`);
console.log(`Average final markdown word count: ${register.summary.final_markdown_average_word_count_estimate}`);
console.log(`Runs above 1500 words: ${register.summary.runs_with_final_markdown_above_1500_words}`);
console.log(`Next stage: ${register.summary.next_stage_id}`);
console.log("Mutation performed: false");
