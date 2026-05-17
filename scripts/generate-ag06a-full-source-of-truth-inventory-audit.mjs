import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const configPath = path.join(root, "data", "quality", "ag06a-full-source-of-truth-inventory-audit.json");

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

function listFiles(dir, predicate = () => true) {
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
      } else if (entry.isFile() && predicate(p, rp)) {
        out.push(p);
      }
    }
  }

  walk(full);
  return out.sort();
}

function stripHtml(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function wordCountFromHtml(html) {
  const text = stripHtml(html);
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

function countMatches(text, regex) {
  return (String(text || "").match(regex) || []).length;
}

function visibleAr01PlaceholderCount(html) {
  const blocks = [...String(html || "").matchAll(/<(section|div|aside|span|li)\b[^>]*>[\s\S]*?<\/\1>/gi)].map((m) => m[0]);
  return blocks.filter((block) => {
    const isAr01 = /data-drishvara-ar01-reference-status|data-drishvara-ar01-reference-slot|drishvara-ar01-status/i.test(block);
    const hasText = /Under editorial verification|Reference\s*1\s*:|Reference\s*2\s*:/i.test(block);
    const hidden = /data-drishvara-ag05d-r1-ar01-placeholder-neutralized=["']true["']|\bhidden\b|aria-hidden=["']true["']|display\s*:\s*none/i.test(block);
    return isAr01 && hasText && !hidden;
  }).length;
}

function titleFromHtml(html, fallback) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return stripHtml(h1[1]).slice(0, 220);
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (title) return stripHtml(title[1]).slice(0, 220);
  return fallback;
}

function categoryFromPath(articlePath) {
  const parts = articlePath.split("/");
  return parts.length >= 2 ? parts[1] : "unknown";
}

function directSubdirs(dir) {
  const full = path.join(root, dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(dir, entry.name).replaceAll(path.sep, "/"))
    .sort();
}

function scaffoldRunDirsFromArtifacts(files) {
  const markerNames = new Set([
    "01_input.json",
    "02_normalized_brief.json",
    "03_story_draft.json",
    "04_visual_plan.json",
    "05_integrated_draft.json",
    "07_publish_bundle.json",
    "08_final_output.md",
    "09_final_output.html",
    "10_learning_snapshot.json",
    "11_promotion_summary.json",
    "12_playbook_summary.json"
  ]);

  const dirs = new Set();

  for (const file of files) {
    const base = path.basename(file);
    if (markerNames.has(base) || /^06_guard_report/i.test(base)) {
      dirs.add(rel(path.dirname(file)));
    }
  }

  return [...dirs].sort();
}

function hasRealVisualStructure(html) {
  // Count only actual analytical/structured visual components.
  // Exclude generic hero images, AG02/AG05 visual markers, decorative SVGs,
  // normal article images, prose words, scripts and styles.
  const cleaned = String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ");

  if (/<table\b/i.test(cleaned)) return true;
  if (/<canvas\b/i.test(cleaned)) return true;

  if (/data-drishvara-(chart|graph|infographic|timeline|matrix|diagram|data-box|flowchart)=["']true["']/i.test(cleaned)) {
    return true;
  }

  const structuredToken = /(^|[\s_-])(chart|graph|infographic|timeline|matrix|diagram|data-box|databox|flowchart)([\s_-]|$)/i;

  const classOrIdMatches = [
    ...cleaned.matchAll(/\b(class|id)=["']([^"']+)["']/gi)
  ];

  return classOrIdMatches.some((m) => structuredToken.test(m[2]));
}

const config = readJson(configPath);
const activeRegister = readJson(path.join(root, config.input_files.source_tree_active_register));
const ag05z = readJson(path.join(root, config.input_files.ag05z_closure));
const ag04z = readJson(path.join(root, config.input_files.ag04z_closure));
const ag03z = readJson(path.join(root, config.input_files.ag03z_closure));

const articleFiles = listFiles(config.scan_roots.public_articles, (p) => p.endsWith(".html"));
const publicArticleInventory = articleFiles.map((file) => {
  const html = fs.readFileSync(file, "utf8");
  const articlePath = rel(file);
  const ag03Links = countMatches(html, /data-drishvara-ag03c[^>]*reference-link=["']true["']/g);
  const ag05dBlocks = countMatches(html, /data-drishvara-ag05d-visible-reference-block=["']true["']/g);
  const ag02Hero = /data-drishvara-ag02-hero|data-drishvara-ag02-hero-visual|drishvara-article-hero|article-hero/i.test(html);
  const ag02Credit = /data-drishvara-ag02-image-credit|image credit|attribution/i.test(html);
  const visibleAr01 = visibleAr01PlaceholderCount(html);
  const wc = wordCountFromHtml(html);
  const hasTable = /<table\b/i.test(html);
  const hasSvg = /<svg\b/i.test(html);
  const hasCanvas = /<canvas\b/i.test(html);
  const hasChartLike = hasRealVisualStructure(html);

  return {
    article_path: articlePath,
    category: categoryFromPath(articlePath),
    detected_title: titleFromHtml(html, path.basename(articlePath)),
    word_count_estimate: wc,
    ag03_reference_link_count: ag03Links,
    ag05d_visible_reference_block_count: ag05dBlocks,
    ag02_hero_signal_present: ag02Hero,
    ag02_credit_signal_present: ag02Credit,
    visible_ar01_placeholder_count: visibleAr01,
    table_signal_present: hasTable,
    svg_signal_present: hasSvg,
    canvas_signal_present: hasCanvas,
    chart_graph_infographic_text_signal_present: hasChartLike,
    governed_reference_visibility_status: ag03Links === 2 && ag05dBlocks === 1 && visibleAr01 === 0 ? "governed_visible_references" : "requires_follow_up_review"
  };
});

const categoryCounts = {};
for (const row of publicArticleInventory) {
  categoryCounts[row.category] = (categoryCounts[row.category] || 0) + 1;
}

const governedRows = publicArticleInventory.filter((row) => row.governed_reference_visibility_status === "governed_visible_references");
const unguidedRows = publicArticleInventory.filter((row) => row.governed_reference_visibility_status !== "governed_visible_references");

const wordCounts = publicArticleInventory.map((row) => row.word_count_estimate).sort((a, b) => a - b);
const avgWordCount = wordCounts.length ? Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length) : 0;
const medianWordCount = wordCounts.length ? wordCounts[Math.floor(wordCounts.length / 2)] : 0;

const scaffoldOutputRoot = "drishvara_phase01_scaffold/content/outputs";
const scaffoldFiles = listFiles(scaffoldOutputRoot);
const scaffoldRunDirs = scaffoldRunDirsFromArtifacts(scaffoldFiles);
const scaffoldArtifactCounts = {
  run_directory_count: scaffoldRunDirs.length,
  total_file_count: scaffoldFiles.length,
  input_json_count: scaffoldFiles.filter((p) => path.basename(p) === "01_input.json").length,
  normalized_brief_count: scaffoldFiles.filter((p) => path.basename(p) === "02_normalized_brief.json").length,
  story_draft_count: scaffoldFiles.filter((p) => path.basename(p) === "03_story_draft.json").length,
  visual_plan_count: scaffoldFiles.filter((p) => path.basename(p) === "04_visual_plan.json").length,
  integrated_draft_count: scaffoldFiles.filter((p) => path.basename(p) === "05_integrated_draft.json").length,
  guard_report_count: scaffoldFiles.filter((p) => /06_guard_report/i.test(path.basename(p))).length,
  publish_bundle_count: scaffoldFiles.filter((p) => path.basename(p) === "07_publish_bundle.json").length,
  final_markdown_count: scaffoldFiles.filter((p) => path.basename(p) === "08_final_output.md").length,
  final_html_count: scaffoldFiles.filter((p) => path.basename(p) === "09_final_output.html").length,
  learning_snapshot_count: scaffoldFiles.filter((p) => path.basename(p) === "10_learning_snapshot.json").length,
  promotion_summary_count: scaffoldFiles.filter((p) => path.basename(p) === "11_promotion_summary.json").length,
  playbook_summary_count: scaffoldFiles.filter((p) => path.basename(p) === "12_playbook_summary.json").length
};

const finalMarkdownFiles = scaffoldFiles.filter((p) => path.basename(p) === "08_final_output.md");
const scaffoldWordCounts = finalMarkdownFiles.map((file) => {
  const text = fs.readFileSync(file, "utf8").replace(/<[^>]+>/g, " ");
  return {
    file_path: rel(file),
    word_count_estimate: text.split(/\s+/).filter(Boolean).length
  };
});
const scaffoldWordValues = scaffoldWordCounts.map((row) => row.word_count_estimate).sort((a, b) => a - b);
const scaffoldAvg = scaffoldWordValues.length ? Math.round(scaffoldWordValues.reduce((a, b) => a + b, 0) / scaffoldWordValues.length) : 0;
const scaffoldMedian = scaffoldWordValues.length ? scaffoldWordValues[Math.floor(scaffoldWordValues.length / 2)] : 0;

const generatedFiles = listFiles(config.scan_roots.generated || "generated");
const scriptFiles = listFiles(config.scan_roots.scripts, (p) => p.endsWith(".mjs") || p.endsWith(".js"));
const apiFiles = listFiles(config.scan_roots.api || "api");
const serviceFiles = listFiles(config.scan_roots.services || "services");
const supabaseFiles = listFiles(config.scan_roots.supabase || "supabase");
const specsFiles = listFiles(config.scan_roots.specs || "specs");

const cGovernanceFiles = [
  ...listFiles("docs", (p, rp) => /\/C1[0-6]|C1[0-6]_/i.test(rp)),
  ...listFiles("data", (p, rp) => /c1[0-6]|C1[0-6]/i.test(rp))
].map(rel);

const contentIntelligencePath = path.join(root, "data", "content-intelligence");
const contentIntelligenceExists = fs.existsSync(contentIntelligencePath);
const contentIntelligenceFiles = contentIntelligenceExists ? listFiles("data/content-intelligence") : [];

const inventoryGaps = [];
if (unguidedRows.length > 0) {
  inventoryGaps.push({
    gap_id: "AG06A_GAP_PUBLIC_UNGOVERNED_ARTICLES",
    severity: "medium",
    description: "Some public articles do not yet have complete AG03/AG05 visible-reference governance.",
    affected_count: unguidedRows.length
  });
}
if (publicArticleInventory.filter((row) => row.word_count_estimate >= 1500).length === 0) {
  inventoryGaps.push({
    gap_id: "AG06A_GAP_PUBLIC_LONG_FORM_QUALITY",
    severity: "high",
    description: "No current public article reaches the intended 1500+ word long-form Drishvara standard.",
    affected_count: publicArticleInventory.length
  });
}
if (publicArticleInventory.filter((row) => row.table_signal_present || row.svg_signal_present || row.canvas_signal_present || row.chart_graph_infographic_text_signal_present).length === 0) {
  inventoryGaps.push({
    gap_id: "AG06A_GAP_PUBLIC_VISUAL_INTELLIGENCE",
    severity: "high",
    description: "Public article layer has no meaningful table/chart/graph/infographic signal.",
    affected_count: publicArticleInventory.length
  });
}
if (!contentIntelligenceExists || contentIntelligenceFiles.length === 0) {
  inventoryGaps.push({
    gap_id: "AG06A_GAP_CONTENT_INTELLIGENCE_STORE",
    severity: "high",
    description: "Durable data/content-intelligence store is not yet operational.",
    affected_count: 1
  });
}

const audit = {
  audit_id: "AG06A_FULL_SOURCE_OF_TRUTH_INVENTORY_AUDIT",
  module_id: "AG06A",
  status: "full_source_of_truth_inventory_audit_completed",
  generated_at: new Date().toISOString(),

  mutation_performed: false,
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
  file_deletion_performed: false,
  file_move_performed: false,

  source_context: {
    source_tree_active_register: activeRegister,
    ag05z_closed: ag05z.summary?.ag05_public_page_live_readiness_smoke_governance_closed === true,
    ag04z_closed: ag04z.summary?.ag04_visual_credit_width_governance_closed === true,
    ag03z_closed: ag03z.summary?.ag03_reference_scaling_closed === true
  },

  summary: {
    public_article_count: publicArticleInventory.length,
    governed_public_article_count: governedRows.length,
    unguided_public_article_count: unguidedRows.length,
    public_category_counts: categoryCounts,
    public_average_word_count_estimate: avgWordCount,
    public_median_word_count_estimate: medianWordCount,
    public_articles_above_1500_words: publicArticleInventory.filter((row) => row.word_count_estimate >= 1500).length,
    public_articles_above_1200_words: publicArticleInventory.filter((row) => row.word_count_estimate >= 1200).length,
    public_articles_with_table_signal: publicArticleInventory.filter((row) => row.table_signal_present).length,
    public_articles_with_chart_graph_infographic_text_signal: publicArticleInventory.filter((row) => row.chart_graph_infographic_text_signal_present).length,
    scaffold_run_directory_count: scaffoldArtifactCounts.run_directory_count,
    scaffold_final_markdown_count: scaffoldArtifactCounts.final_markdown_count,
    scaffold_final_html_count: scaffoldArtifactCounts.final_html_count,
    scaffold_visual_plan_count: scaffoldArtifactCounts.visual_plan_count,
    scaffold_learning_snapshot_count: scaffoldArtifactCounts.learning_snapshot_count,
    scaffold_average_final_markdown_word_count_estimate: scaffoldAvg,
    scaffold_median_final_markdown_word_count_estimate: scaffoldMedian,
    generated_file_count: generatedFiles.length,
    script_file_count: scriptFiles.length,
    api_file_count: apiFiles.length,
    service_file_count: serviceFiles.length,
    supabase_file_count: supabaseFiles.length,
    specs_file_count: specsFiles.length,
    c10_c16_governance_file_count: cGovernanceFiles.length,
    content_intelligence_store_exists: contentIntelligenceExists,
    content_intelligence_file_count: contentIntelligenceFiles.length,
    inventory_gap_count: inventoryGaps.length,
    audit_only_no_mutation: true,
    next_stage_id: "AG06B"
  },

  public_article_inventory: publicArticleInventory,
  unguided_public_articles: unguidedRows,
  scaffold_artifact_counts: scaffoldArtifactCounts,
  scaffold_final_markdown_word_count_sample: scaffoldWordCounts.slice(0, 25),
  c10_c16_governance_files: cGovernanceFiles.slice(0, 80),
  production_intelligence_inventory: {
    scaffold_output_root: scaffoldOutputRoot,
    scaffold_run_dirs_sample: scaffoldRunDirs.slice(0, 25),
    generated_file_count: generatedFiles.length,
    generated_files_sample: generatedFiles.map(rel).slice(0, 50)
  },
  automation_inventory: {
    script_file_count: scriptFiles.length,
    api_file_count: apiFiles.length,
    service_file_count: serviceFiles.length,
    supabase_file_count: supabaseFiles.length,
    specs_file_count: specsFiles.length
  },
  inventory_gaps: inventoryGaps,
  next_recommended_stage: config.recommended_next_stage
};

const preview = {
  preview_id: "AG06A_FULL_SOURCE_OF_TRUTH_INVENTORY_PREVIEW",
  module_id: "AG06A",
  preview_only: true,
  status: "preview_full_source_of_truth_inventory_audit",
  summary: audit.summary,
  unguided_public_articles: unguidedRows.map((row) => ({
    article_path: row.article_path,
    ag03_reference_link_count: row.ag03_reference_link_count,
    ag05d_visible_reference_block_count: row.ag05d_visible_reference_block_count,
    visible_ar01_placeholder_count: row.visible_ar01_placeholder_count,
    word_count_estimate: row.word_count_estimate
  })),
  inventory_gaps: inventoryGaps,
  mutation_performed: false,
  next_recommended_stage: config.recommended_next_stage
};

writeJson(path.join(root, config.outputs.audit), audit);
writeJson(path.join(root, config.outputs.preview), preview);

console.log(`Created ${config.outputs.audit}.`);
console.log(`Created ${config.outputs.preview}.`);
console.log(`Public articles: ${audit.summary.public_article_count}`);
console.log(`Governed public articles: ${audit.summary.governed_public_article_count}`);
console.log(`Unguided public articles: ${audit.summary.unguided_public_article_count}`);
console.log(`Public average word count: ${audit.summary.public_average_word_count_estimate}`);
console.log(`Scaffold run dirs: ${audit.summary.scaffold_run_directory_count}`);
console.log(`Scaffold final markdown outputs: ${audit.summary.scaffold_final_markdown_count}`);
console.log(`Scaffold visual plans: ${audit.summary.scaffold_visual_plan_count}`);
console.log(`Inventory gaps: ${audit.summary.inventory_gap_count}`);
console.log(`Next stage: ${audit.summary.next_stage_id}`);
console.log("Mutation performed: false");
