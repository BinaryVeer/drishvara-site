import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const sourcePaths = {
  articleIndex: path.join(root, "data", "article-index.json"),
  homepageUi: path.join(root, "data", "homepage-ui.json"),
  seoMetadata: path.join(root, "data", "seo", "site-metadata.json")
};

const outPath = path.join(root, "data", "content", "content-asset-inventory-preview.json");

function readJsonSafe(filePath) {
  const rel = path.relative(root, filePath);
  if (!fs.existsSync(filePath)) {
    return { ok: false, rel, data: null, error: "missing_file" };
  }
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return {
      ok: true,
      rel,
      data: JSON.parse(raw),
      sha256: crypto.createHash("sha256").update(raw).digest("hex")
    };
  } catch (err) {
    return { ok: false, rel, data: null, error: `json_parse_error:${err.message}` };
  }
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];

  const candidateKeys = [
    "articles",
    "items",
    "publicLatest",
    "public_latest",
    "latest",
    "published",
    "records",
    "data"
  ];

  for (const key of candidateKeys) {
    if (Array.isArray(value[key])) return value[key];
  }

  return [];
}

function deepCollectArrays(obj, keyHints = []) {
  const found = [];
  const seen = new Set();

  function walk(node, pathParts = []) {
    if (!node || typeof node !== "object") return;
    if (seen.has(node)) return;
    seen.add(node);

    if (Array.isArray(node)) {
      const pathText = pathParts.join(".").toLowerCase();
      if (keyHints.some((hint) => pathText.includes(hint))) {
        found.push(node);
      }
      for (const item of node) walk(item, pathParts);
      return;
    }

    for (const [key, value] of Object.entries(node)) {
      walk(value, [...pathParts, key]);
    }
  }

  walk(obj);
  return found;
}

function pick(obj, keys) {
  for (const key of keys) {
    if (obj && Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
      return obj[key];
    }
  }
  return "";
}

function normalizeString(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function normalizePath(item) {
  const direct = pick(item, ["article_path", "articlePath", "path", "filePath", "filepath", "slug", "url", "href", "link"]);
  return normalizeString(direct);
}

function normalizeTitle(item) {
  return normalizeString(pick(item, ["title", "headline", "name", "articleTitle", "displayTitle"]));
}

function normalizeSummary(item) {
  return normalizeString(pick(item, ["summary", "description", "excerpt", "dek", "subtitle", "intro"]));
}

function normalizeCategory(item) {
  return normalizeString(pick(item, ["category", "section", "topic", "pillar", "vertical"]));
}

function normalizeImage(item) {
  return normalizeString(pick(item, ["image", "imageUrl", "image_url", "featuredImage", "featured_image", "thumbnail", "cover"]));
}

function normalizeCanonical(item) {
  return normalizeString(pick(item, ["canonical_url", "canonicalUrl", "canonical", "url", "href", "link"]));
}

function inferLanguage(item) {
  const lang = normalizeString(pick(item, ["language", "lang", "locale"]));
  if (lang) return lang;
  const hasHindi = Boolean(
    pick(item, ["title_hi", "hindiTitle", "summary_hi", "hindiSummary", "body_hi", "hindiBody"])
  );
  return hasHindi ? "bilingual_or_hindi_metadata" : "unknown";
}

function candidateKey(item) {
  return normalizePath(item) || normalizeCanonical(item) || normalizeTitle(item);
}

function collectHomepageFeatured(homepageData) {
  const featured = new Map();
  const arrays = [
    ...deepCollectArrays(homepageData, ["featured", "read", "article", "latest"]),
    asArray(homepageData)
  ];

  for (const arr of arrays) {
    for (const item of arr) {
      if (!item || typeof item !== "object") continue;
      const key = candidateKey(item);
      if (!key) continue;
      featured.set(key, item);
    }
  }
  return featured;
}

function collectSeoRefs(seoData) {
  const refs = new Set();
  const arrays = [
    ...deepCollectArrays(seoData, ["article", "url", "sitemap"]),
    asArray(seoData)
  ];

  function addValue(value) {
    const s = normalizeString(value);
    if (s && (s.includes("article") || s.includes("/articles/") || s.includes(".html") || s.includes("?path="))) {
      refs.add(s);
    }
  }

  function walk(node) {
    if (!node) return;
    if (typeof node === "string") return addValue(node);
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    if (typeof node === "object") {
      for (const value of Object.values(node)) walk(value);
    }
  }

  for (const arr of arrays) walk(arr);
  walk(seoData);
  return refs;
}

function makeAssetId(seed, index) {
  const base = seed || `candidate-${index}`;
  const digest = crypto.createHash("sha1").update(base).digest("hex").slice(0, 12);
  return `asset_article_${String(index + 1).padStart(4, "0")}_${digest}`;
}

const articleIndex = readJsonSafe(sourcePaths.articleIndex);
const homepageUi = readJsonSafe(sourcePaths.homepageUi);
const seoMetadata = readJsonSafe(sourcePaths.seoMetadata);

const articleItems = articleIndex.ok ? asArray(articleIndex.data) : [];
const homepageFeatured = homepageUi.ok ? collectHomepageFeatured(homepageUi.data) : new Map();
const seoRefs = seoMetadata.ok ? collectSeoRefs(seoMetadata.data) : new Set();

const seenKeys = new Set();
const candidates = [];

for (const item of articleItems) {
  if (!item || typeof item !== "object") continue;

  const key = candidateKey(item);
  if (!key || seenKeys.has(key)) continue;
  seenKeys.add(key);

  const title = normalizeTitle(item);
  const articlePath = normalizePath(item);
  const canonicalUrl = normalizeCanonical(item);
  const summary = normalizeSummary(item);
  const category = normalizeCategory(item);
  const image = normalizeImage(item);

  const homepageMatch = homepageFeatured.has(articlePath) || homepageFeatured.has(canonicalUrl) || homepageFeatured.has(title);
  const seoMatch = [...seoRefs].some((ref) => {
    return (articlePath && ref.includes(articlePath)) || (canonicalUrl && ref.includes(canonicalUrl)) || (title && ref.includes(title));
  });

  const idx = candidates.length;
  candidates.push({
    asset_id: makeAssetId(key, idx),
    asset_type: "article",
    title,
    article_path: articlePath,
    canonical_url: canonicalUrl,
    category,
    language: inferLanguage(item),
    summary_status: summary ? "summary_present" : "summary_missing",
    image_status: image ? "image_present" : "image_missing",
    homepage_featured_status: homepageMatch ? "homepage_featured_observed" : "not_observed_as_homepage_featured",
    seo_presence_status: seoMatch ? "seo_reference_observed" : "seo_reference_not_observed",
    source_hint: normalizeString(pick(item, ["source", "source_type", "sourceType", "provider"])) || "unknown",
    public_safe_status: "needs_review",
    ml_training_eligible: false,
    embedding_eligible: false,
    registry_write_allowed: false,
    next_action: "review_before_registry_or_ml_use",
    preview_quality_hints: {
      title_present: Boolean(title),
      summary_present: Boolean(summary),
      path_present: Boolean(articlePath),
      category_present: Boolean(category),
      image_present: Boolean(image),
      homepage_featured: homepageMatch,
      seo_reference_present: seoMatch
    }
  });
}

function findDuplicates(field) {
  const buckets = new Map();
  for (const asset of candidates) {
    const value = normalizeString(asset[field]);
    if (!value) continue;
    if (!buckets.has(value)) buckets.set(value, []);
    buckets.get(value).push(asset.asset_id);
  }
  return [...buckets.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([value, asset_ids]) => ({ field, value, asset_ids }));
}

const duplicateHints = [
  ...findDuplicates("article_path").map((x) => ({ duplicate_type: "duplicate_article_path", ...x })),
  ...findDuplicates("title").map((x) => ({ duplicate_type: "duplicate_title", ...x })),
  ...findDuplicates("canonical_url").map((x) => ({ duplicate_type: "duplicate_canonical_url", ...x }))
];

const qualityHints = {
  total_candidates: candidates.length,
  title_present_count: candidates.filter((x) => x.preview_quality_hints.title_present).length,
  summary_present_count: candidates.filter((x) => x.preview_quality_hints.summary_present).length,
  path_present_count: candidates.filter((x) => x.preview_quality_hints.path_present).length,
  category_present_count: candidates.filter((x) => x.preview_quality_hints.category_present).length,
  image_present_count: candidates.filter((x) => x.preview_quality_hints.image_present).length,
  homepage_featured_count: candidates.filter((x) => x.preview_quality_hints.homepage_featured).length,
  seo_reference_present_count: candidates.filter((x) => x.preview_quality_hints.seo_reference_present).length
};

const output = {
  preview_id: "C11_CONTENT_ASSET_INVENTORY_PREVIEW",
  module_id: "C11",
  status: "preview_only_not_live_registry",
  preview_only: true,
  generated_from: [
    articleIndex.rel,
    homepageUi.rel,
    seoMetadata.rel
  ],
  source_file_status: {
    [articleIndex.rel]: articleIndex.ok ? { ok: true, sha256: articleIndex.sha256 } : { ok: false, error: articleIndex.error },
    [homepageUi.rel]: homepageUi.ok ? { ok: true, sha256: homepageUi.sha256 } : { ok: false, error: homepageUi.error },
    [seoMetadata.rel]: seoMetadata.ok ? { ok: true, sha256: seoMetadata.sha256 } : { ok: false, error: seoMetadata.error }
  },
  summary: {
    candidate_article_count: candidates.length,
    homepage_featured_observed_count: qualityHints.homepage_featured_count,
    seo_reference_observed_count: qualityHints.seo_reference_present_count,
    duplicate_hint_count: duplicateHints.length,
    ml_training_eligible_count: 0,
    embedding_eligible_count: 0,
    registry_write_allowed_count: 0
  },
  candidate_assets: candidates,
  duplicate_hints: duplicateHints,
  quality_hints: qualityHints,
  blocked_capabilities: [
    "article_mutation",
    "homepage_mutation",
    "sitemap_mutation",
    "seo_metadata_mutation",
    "image_registry_write",
    "quality_metadata_write",
    "review_queue_write",
    "selection_memory_write",
    "manual_override",
    "supabase",
    "auth",
    "payment",
    "external_api_fetch",
    "link_crawling",
    "image_download",
    "ml_ingestion",
    "embedding_generation",
    "model_training",
    "vector_database_write",
    "public_output",
    "subscriber_output"
  ],
  next_recommended_stage: "C12 — Content Asset Verification & Review Workflow Preview"
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n");
console.log(`Created ${path.relative(root, outPath)} with ${candidates.length} candidate assets.`);
