import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ag02r2-curated-article-visual-source-registry.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

function slugTokens(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\.html$/i, "")
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter((x) => x.length >= 3 && !["the","and","for","with","into","from","this","that","2026"].includes(x));
}

function categoryFromPath(articlePath) {
  const m = String(articlePath || "").match(/^articles\/([^/]+)\//);
  return m ? m[1] : "unknown";
}

function fileNameTokens(filePath) {
  return slugTokens(path.basename(filePath));
}

function hasExcludedFragment(filePath, excluded) {
  const s = String(filePath || "").toLowerCase();
  return excluded.some((frag) => s.includes(String(frag).toLowerCase()));
}

function scanImages(config) {
  const roots = config.candidate_scan_roots || [];
  const allowed = new Set(config.allowed_image_extensions || []);
  const excluded = config.excluded_path_fragments || [];
  const out = [];

  function walk(absDir) {
    if (!fs.existsSync(absDir)) return;

    for (const item of fs.readdirSync(absDir, { withFileTypes: true })) {
      const full = path.join(absDir, item.name);
      const rel = path.relative(root, full).replaceAll(path.sep, "/");

      if (item.isDirectory()) {
        if (hasExcludedFragment(rel, excluded)) continue;
        walk(full);
      } else if (item.isFile()) {
        const ext = path.extname(item.name).toLowerCase();
        if (!allowed.has(ext)) continue;
        if (hasExcludedFragment(rel, excluded)) continue;

        const stat = fs.statSync(full);

        out.push({
          image_path: rel,
          public_src: "/" + rel,
          extension: ext,
          size_bytes: stat.size,
          tokens: fileNameTokens(rel),
          source_status: "existing_local_asset_unverified"
        });
      }
    }
  }

  for (const dir of roots) walk(path.join(root, dir));
  return out.sort((a, b) => a.image_path.localeCompare(b.image_path));
}

function scoreCandidate(article, image) {
  const titleTokens = slugTokens(article.title);
  const pathTokens = slugTokens(article.article_path);
  const allArticleTokens = new Set([...titleTokens, ...pathTokens, article.category]);
  const imageTokens = new Set(image.tokens);

  let score = 0;
  const matched = [];

  for (const token of imageTokens) {
    if (allArticleTokens.has(token)) {
      score += 10;
      matched.push(token);
    }
  }

  const lowerPath = image.image_path.toLowerCase();
  if (lowerPath.includes(`/${article.category}/`) || lowerPath.includes(`-${article.category}-`) || lowerPath.includes(`${article.category}`)) {
    score += 5;
    matched.push(`category:${article.category}`);
  }

  return {
    score,
    matched_tokens: [...new Set(matched)]
  };
}

const config = readJson(registryPath);
const ag01r1 = readJson(path.join(root, config.input_files.ag01r1_audit));
const ag02Apply = readJson(path.join(root, config.input_files.ag02_apply_result));
const ag02r1 = readJson(path.join(root, config.input_files.ag02r1_source_map));

const ag02Targets = new Set((ag02Apply.file_results || []).map((row) => row.article_path));
const articleByPath = new Map((ag01r1.entries || []).map((entry) => [entry.article_path, entry]));

const inventory = scanImages(config);

const entries = [...ag02Targets].sort().map((articlePath) => {
  const article = articleByPath.get(articlePath) || {
    article_path: articlePath,
    title: path.basename(articlePath, ".html").replaceAll("-", " "),
    category: categoryFromPath(articlePath)
  };

  const scored = inventory
    .map((image) => {
      const s = scoreCandidate(article, image);
      return {
        image_path: image.image_path,
        public_src: image.public_src,
        score: s.score,
        matched_tokens: s.matched_tokens,
        source_status: image.source_status
      };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.image_path.localeCompare(b.image_path))
    .slice(0, 5);

  return {
    article_path: articlePath,
    category: article.category || categoryFromPath(articlePath),
    title: article.title,
    current_visual_status: article.image?.hero_image_status || "unknown",
    current_visual_src: article.image?.hero_image_src || null,
    ag02_targeted: true,
    ag02r1_homepage_mapping_applicable: false,
    candidate_count: scored.length,
    candidates: scored,
    recommended_candidate: scored[0] || null,
    editorial_selection_status: "pending_review",
    approved_for_application: false,
    approved_image_src: null,
    approval_note: "Pending manual review. AG02R2 does not apply images."
  };
});

const curatedRegistry = {
  registry_id: "AG02R2_CURATED_ARTICLE_VISUAL_SOURCE_REGISTRY",
  module_id: "AG02R2",
  status: "curated_visual_source_registry_created_pending_review",
  generated_at: new Date().toISOString(),
  mutation_performed: false,
  article_html_mutation_performed: false,
  article_image_mutation_performed: false,
  image_credit_mutation_performed: false,
  article_text_mutation_performed: false,
  reference_url_change_performed: false,
  new_reference_insertion_performed: false,
  external_fetch_performed: false,
  source_context: {
    ag02_target_count: ag02Targets.size,
    ag02r1_status: ag02r1.status,
    ag02r1_mapped_article_count: ag02r1.mapped_article_count || 0
  },
  image_inventory: {
    scanned_roots: config.candidate_scan_roots,
    candidate_image_count: inventory.length,
    candidates: inventory
  },
  summary: {
    ag02_target_count: ag02Targets.size,
    registry_entry_count: entries.length,
    articles_with_candidate_images: entries.filter((e) => e.candidate_count > 0).length,
    articles_without_candidate_images: entries.filter((e) => e.candidate_count === 0).length,
    approved_mapping_count: entries.filter((e) => e.approved_for_application).length,
    ready_for_ag02r3_application: false
  },
  entries
};

const preview = {
  preview_id: "AG02R2_CURATED_ARTICLE_VISUAL_SOURCE_PREVIEW",
  module_id: "AG02R2",
  status: "preview_curated_visual_registry_pending_review",
  preview_only: true,
  summary: curatedRegistry.summary,
  sample_entries: entries.slice(0, 15).map((entry) => ({
    article_path: entry.article_path,
    title: entry.title,
    category: entry.category,
    current_visual_status: entry.current_visual_status,
    candidate_count: entry.candidate_count,
    recommended_candidate: entry.recommended_candidate
  })),
  mutation_performed: false,
  blocked_capabilities: config.blocked_capabilities,
  next_recommended_stage: config.recommended_next_stage
};

writeJson(path.join(root, config.outputs.curated_registry), curatedRegistry);
writeJson(path.join(root, config.outputs.preview), preview);

console.log(`Created ${config.outputs.curated_registry}.`);
console.log(`Created ${config.outputs.preview}.`);
console.log(`AG02 target count: ${curatedRegistry.summary.ag02_target_count}`);
console.log(`Local candidate image count: ${curatedRegistry.image_inventory.candidate_image_count}`);
console.log(`Articles with candidate images: ${curatedRegistry.summary.articles_with_candidate_images}`);
console.log(`Articles without candidate images: ${curatedRegistry.summary.articles_without_candidate_images}`);
console.log(`Approved mapping count: ${curatedRegistry.summary.approved_mapping_count}`);
console.log("Mutation performed: false");
