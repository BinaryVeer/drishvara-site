import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ag01-article-governance-source-of-truth-audit.json");
const auditOutPath = path.join(root, "data", "editorial", "ag01-article-governance-source-of-truth-audit.json");
const previewOutPath = path.join(root, "data", "quality", "ag01-article-governance-source-of-truth-preview.json");

function readJsonIfExists(rel) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) return null;
  return JSON.parse(fs.readFileSync(full, "utf8"));
}

function readText(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function existsRel(rel) {
  return fs.existsSync(path.join(root, rel));
}

function walkArticles() {
  const base = path.join(root, "articles");
  const files = [];

  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      const rel = path.relative(root, full).replaceAll(path.sep, "/");
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && rel.endsWith(".html")) files.push(rel);
    }
  }

  walk(base);
  return files.sort();
}

function stripTags(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(text) {
  if (!text) return 0;
  const words = text.match(/[A-Za-zÀ-ÿ0-9][A-Za-zÀ-ÿ0-9'’.-]*/g);
  return words ? words.length : 0;
}

function titleFromHtml(html, rel) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return stripTags(h1[1]);

  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (title) return stripTags(title[1]);

  return rel.split("/").pop().replace(".html", "").replaceAll("-", " ");
}

function categoryFromPath(rel) {
  const m = rel.match(/^articles\/([^/]+)\//);
  return m ? m[1] : "uncategorised";
}

function imgTags(html) {
  return [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
}

function attr(tag, name) {
  const re = new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, "i");
  const m = tag.match(re);
  return m ? m[1] : null;
}

function isLogoLike(src) {
  const s = String(src || "").toLowerCase();
  return s.includes("favicon") ||
    s.includes("logo") ||
    s.includes("brand-mark") ||
    s.includes("drishvara-mark") ||
    s.includes("drishvara-favicon");
}

function isCategoryFallback(src) {
  const s = String(src || "").toLowerCase();
  return s.includes("assets/article-defaults/") || s.includes("/assets/article-defaults/");
}

function isExternal(src) {
  return /^https?:\/\//i.test(String(src || ""));
}

function normalizeLocalSrc(src) {
  if (!src) return "";
  let s = String(src).split("?")[0].split("#")[0];
  if (s.startsWith("/")) s = s.slice(1);
  if (s.startsWith("./")) s = s.slice(2);
  return s;
}

function imageStatusFromHtml(html, rel) {
  const imgs = imgTags(html).map((tag) => {
    const src = attr(tag, "src") || "";
    const alt = attr(tag, "alt") || "";
    const local = normalizeLocalSrc(src);
    const exists = local ? existsRel(local) : false;

    let status = "unknown";
    if (!src) status = "blank_or_empty_src";
    else if (isLogoLike(src)) status = "favicon_or_brand_mark_as_hero";
    else if (isCategoryFallback(src) && exists) status = "valid_category_fallback";
    else if (isCategoryFallback(src) && !exists) status = "broken_local_image";
    else if (isExternal(src)) status = "external_image_unverified";
    else if (local && exists) status = "valid_local_image";
    else status = "broken_local_image";

    return { src, alt, local_path: local || null, local_exists: exists, logo_like: isLogoLike(src), category_fallback: isCategoryFallback(src), status };
  });

  const bodyVisuals = imgs.filter((img) => !img.logo_like || img.category_fallback);
  const preferred = bodyVisuals[0] || imgs[0] || null;

  let overall = "missing_image";
  if (!preferred) overall = "missing_image";
  else overall = preferred.status;

  return {
    image_count: imgs.length,
    hero_image_src: preferred ? preferred.src : null,
    hero_image_status: overall,
    images: imgs
  };
}

function countPattern(html, marker) {
  return (html.match(new RegExp(marker, "g")) || []).length;
}

function hrefsInEvidence(html) {
  const evidenceSections = [...html.matchAll(/<section\b[^>]*(data-drishvara-ar01-evidence-block|data-drishvara-ar02c-sample-reference-block)[^>]*>[\s\S]*?<\/section>/gi)]
    .map((m) => m[0]);

  return evidenceSections.flatMap((section) => [...section.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)].map((m) => m[1]));
}

function referenceStatus(html, markers, workbenchEntry) {
  const ar01BlockCount = countPattern(html, markers.ar01_evidence_block);
  const ar01SlotCount = countPattern(html, markers.ar01_reference_slot);
  const ar02cBlockCount = countPattern(html, markers.ar02c_block);
  const ar02cReferenceLinkCount = countPattern(html, markers.ar02c_reference_link);
  const evidenceHrefs = hrefsInEvidence(html);

  const acceptedFromWorkbench = workbenchEntry ? Number(workbenchEntry.current_verified_reference_count || 0) : 0;

  return {
    ar01_evidence_block_count: ar01BlockCount,
    ar01_reference_slot_count: ar01SlotCount,
    ar02c_block_count: ar02cBlockCount,
    ar02c_reference_link_count: ar02cReferenceLinkCount,
    evidence_href_count: evidenceHrefs.length,
    evidence_hrefs: evidenceHrefs,
    workbench_verified_reference_count: acceptedFromWorkbench,
    has_two_verified_references_public: ar02cReferenceLinkCount >= 2,
    has_two_verified_references_workbench: acceptedFromWorkbench >= 2,
    reference_publication_status: ar02cReferenceLinkCount >= 2
      ? "two_verified_references_public"
      : acceptedFromWorkbench >= 2
        ? "verified_in_workbench_not_public"
        : "under_editorial_verification_or_missing"
  };
}

function creditStatus(html, markers) {
  const ar01 = countPattern(html, markers.ar01_image_credit);
  const ar02c = countPattern(html, markers.ar02c_image_credit);
  return {
    ar01_image_credit_count: ar01,
    ar02c_image_credit_count: ar02c,
    image_credit_present: ar01 > 0 || ar02c > 0,
    image_credit_status: ar02c > 0 ? "ar02c_credit_present" : ar01 > 0 ? "ar01_credit_present" : "missing_image_credit"
  };
}

function governanceMarkers(html, markers) {
  const out = {};
  for (const [key, marker] of Object.entries(markers)) {
    out[key] = countPattern(html, marker);
  }
  return out;
}

function readiness(entry, minWords, policy) {
  const issues = [];

  if (entry.word_count < minWords) issues.push("below_long_form_minimum");
  if (policy.non_publication_image_statuses.includes(entry.image.hero_image_status)) issues.push(`image_${entry.image.hero_image_status}`);
  if (!entry.credit.image_credit_present) issues.push("missing_image_credit");
  if (!entry.references.has_two_verified_references_public) issues.push("missing_two_public_verified_references");
  if (!entry.markers.av01_style && !entry.markers.av02_style) issues.push("missing_article_width_governance_marker");

  let status = "ready_for_publication_review";
  if (issues.length) status = "needs_repair_before_publication";

  let nextAction = "manual_editorial_review";
  if (issues.includes("below_long_form_minimum")) nextAction = "AG04_long_form_content_expansion_or_quality_gate";
  if (issues.some((x) => x.startsWith("image_")) || issues.includes("missing_image_credit")) nextAction = "AG02_image_and_credit_source_of_truth_repair";
  if (issues.includes("missing_two_public_verified_references")) nextAction = "AG03_verified_reference_scaling_or_publication";
  if (issues.includes("missing_article_width_governance_marker")) nextAction = "AG05_direct_router_template_alignment";

  return { status, issues, next_action: nextAction };
}

function scanLengthGate() {
  const candidates = [];
  const searchRoots = ["scripts", "data", "docs"];
  const patterns = [/minimum[_ -]?word/i, /min[_ -]?word/i, /1200/, /long-form/i, /longform/i];

  function walk(dir) {
    const fullDir = path.join(root, dir);
    if (!fs.existsSync(fullDir)) return;

    for (const entry of fs.readdirSync(fullDir, { withFileTypes: true })) {
      const full = path.join(fullDir, entry.name);
      const rel = path.relative(root, full).replaceAll(path.sep, "/");

      if (entry.isDirectory()) {
        if (["node_modules", ".git", "archive"].includes(entry.name)) continue;
        walk(rel);
      } else if (entry.isFile() && /\.(mjs|js|json|md|html)$/i.test(entry.name)) {
        const text = fs.readFileSync(full, "utf8");
        if (patterns.some((p) => p.test(text))) {
          candidates.push(rel);
        }
      }
    }
  }

  searchRoots.forEach(walk);
  return [...new Set(candidates)].sort();
}

const config = readJsonIfExists("data/quality/ag01-article-governance-source-of-truth-audit.json");
if (!config) throw new Error("Missing AG01 registry.");

const markers = config.required_markers;
const policy = config.audit_policy;
const minWords = policy.provisional_long_form_minimum_words;

const ar01 = readJsonIfExists(config.input_files.ar01_registry);
const workbench = readJsonIfExists(config.input_files.ar02a_workbench);
const ar02b = readJsonIfExists(config.input_files.ar02b_sample_registry);
const ar02e = readJsonIfExists(config.input_files.ar02e_result);
const ar02f = readJsonIfExists(config.input_files.ar02f_apply_result);
const av01 = readJsonIfExists(config.input_files.av01_apply_result);
const av02 = readJsonIfExists(config.input_files.av02_apply_result);

const workbenchMap = new Map((workbench?.entries || []).map((entry) => [entry.article_path, entry]));
const ar01Map = new Map((ar01?.articles || []).map((entry) => [entry.article_path, entry]));
const ar02bSamplePaths = new Set((ar02b?.entries || []).map((entry) => entry.article_path));

const files = walkArticles();
const entries = [];

for (const rel of files) {
  const html = readText(rel);
  const text = stripTags(html);
  const wc = wordCount(text);
  const image = imageStatusFromHtml(html, rel);
  const refs = referenceStatus(html, markers, workbenchMap.get(rel));
  const credit = creditStatus(html, markers);
  const markerCounts = governanceMarkers(html, markers);

  const entry = {
    article_path: rel,
    category: categoryFromPath(rel),
    title: titleFromHtml(html, rel),
    word_count: wc,
    long_form_minimum_words: minWords,
    below_long_form_minimum: wc < minWords,
    source_registries: {
      in_ar01_registry: ar01Map.has(rel),
      in_ar02a_workbench: workbenchMap.has(rel),
      in_ar02b_sample: ar02bSamplePaths.has(rel)
    },
    image,
    credit,
    references: refs,
    markers: markerCounts,
    router_direct_alignment: {
      direct_page_has_width_governance: markerCounts.av01_style > 0 || markerCounts.av02_style > 0,
      direct_page_has_reference_governance: markerCounts.ar01_evidence_block > 0 || markerCounts.ar02c_block > 0,
      router_page_checked_separately: true
    }
  };

  entry.publication_readiness = readiness(entry, minWords, policy);
  entries.push(entry);
}

const routerHtml = existsRel("article.html") ? readText("article.html") : "";
const routerStatus = {
  router_page_present: existsRel("article.html"),
  av01_style_present: routerHtml.includes(markers.av01_style),
  av02_style_present: routerHtml.includes(markers.av02_style),
  av01_router_script_present: routerHtml.includes("data-drishvara-av01-router-visual-fallback"),
  av02_router_guard_present: routerHtml.includes(markers.av02_router_guard),
  reference_guard_present: routerHtml.includes(markers.av02_router_guard),
  broad_width_present: routerHtml.includes("--drishvara-article-outer-max") || routerHtml.includes("drishvara-article-outer-max"),
  paragraph_justify_present: routerHtml.includes("text-align: justify")
};

const formalLengthGateCandidates = scanLengthGate();

const summary = {
  article_count: entries.length,
  provisional_long_form_minimum_words: minWords,
  formal_length_gate_candidate_files: formalLengthGateCandidates,
  articles_below_long_form_minimum: entries.filter((e) => e.below_long_form_minimum).length,
  articles_missing_or_broken_image: entries.filter((e) => policy.non_publication_image_statuses.includes(e.image.hero_image_status)).length,
  articles_with_logo_like_hero: entries.filter((e) => ["logo_like_image", "favicon_or_brand_mark_as_hero"].includes(e.image.hero_image_status)).length,
  articles_with_valid_category_fallback: entries.filter((e) => e.image.hero_image_status === "valid_category_fallback").length,
  articles_with_valid_local_image: entries.filter((e) => e.image.hero_image_status === "valid_local_image").length,
  articles_with_external_image_unverified: entries.filter((e) => e.image.hero_image_status === "external_image_unverified").length,
  articles_missing_image_credit: entries.filter((e) => !e.credit.image_credit_present).length,
  articles_with_two_public_verified_references: entries.filter((e) => e.references.has_two_verified_references_public).length,
  articles_verified_in_workbench_not_public: entries.filter((e) => !e.references.has_two_verified_references_public && e.references.has_two_verified_references_workbench).length,
  articles_missing_two_public_verified_references: entries.filter((e) => !e.references.has_two_verified_references_public).length,
  articles_ready_for_publication_review: entries.filter((e) => e.publication_readiness.status === "ready_for_publication_review").length,
  articles_needing_repair_before_publication: entries.filter((e) => e.publication_readiness.status === "needs_repair_before_publication").length,
  sample_articles_expected: ar02b?.sample_article_count || 0,
  sample_articles_with_two_public_verified_references: entries.filter((e) => ar02bSamplePaths.has(e.article_path) && e.references.has_two_verified_references_public).length,
  router_status: routerStatus,
  upstream_stage_status: {
    ar01_registry_present: !!ar01,
    ar02a_workbench_present: !!workbench,
    ar02b_sample_registry_present: !!ar02b,
    ar02e_result_present: !!ar02e,
    ar02f_apply_result_present: !!ar02f,
    av01_apply_result_present: !!av01,
    av02_apply_result_present: !!av02
  }
};

const issueBuckets = {
  needs_image_or_credit_repair: entries.filter((e) => e.publication_readiness.issues.some((x) => x.startsWith("image_")) || e.publication_readiness.issues.includes("missing_image_credit")).map((e) => e.article_path),
  needs_reference_scaling_or_publication: entries.filter((e) => e.publication_readiness.issues.includes("missing_two_public_verified_references")).map((e) => e.article_path),
  needs_long_form_expansion_or_gate: entries.filter((e) => e.publication_readiness.issues.includes("below_long_form_minimum")).map((e) => e.article_path),
  needs_template_alignment: entries.filter((e) => e.publication_readiness.issues.includes("missing_article_width_governance_marker")).map((e) => e.article_path)
};

const audit = {
  audit_id: "AG01_ARTICLE_GOVERNANCE_SOURCE_OF_TRUTH_AUDIT",
  module_id: "AG01",
  status: "audit_completed_no_mutation",
  generated_at: new Date().toISOString(),
  mutation_performed: false,
  article_html_mutation_performed: false,
  article_text_mutation_performed: false,
  article_image_mutation_performed: false,
  image_credit_mutation_performed: false,
  reference_url_change_performed: false,
  new_reference_insertion_performed: false,
  external_fetch_performed: false,
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
  summary,
  issue_buckets: issueBuckets,
  entries
};

const preview = {
  preview_id: "AG01_ARTICLE_GOVERNANCE_SOURCE_OF_TRUTH_PREVIEW",
  module_id: "AG01",
  status: "preview_after_governance_audit",
  preview_only: true,
  summary,
  issue_buckets_count: {
    needs_image_or_credit_repair: issueBuckets.needs_image_or_credit_repair.length,
    needs_reference_scaling_or_publication: issueBuckets.needs_reference_scaling_or_publication.length,
    needs_long_form_expansion_or_gate: issueBuckets.needs_long_form_expansion_or_gate.length,
    needs_template_alignment: issueBuckets.needs_template_alignment.length
  },
  sample_entries: entries.slice(0, 10).map((e) => ({
    article_path: e.article_path,
    title: e.title,
    category: e.category,
    word_count: e.word_count,
    hero_image_status: e.image.hero_image_status,
    image_credit_status: e.credit.image_credit_status,
    public_verified_reference_count: e.references.ar02c_reference_link_count,
    readiness: e.publication_readiness.status,
    next_action: e.publication_readiness.next_action
  })),
  mutation_performed: false,
  blocked_capabilities: config.blocked_capabilities,
  next_recommended_stage: config.recommended_next_stage
};

fs.mkdirSync(path.dirname(auditOutPath), { recursive: true });
fs.writeFileSync(auditOutPath, JSON.stringify(audit, null, 2) + "\n");
fs.writeFileSync(previewOutPath, JSON.stringify(preview, null, 2) + "\n");

console.log(`Created ${path.relative(root, auditOutPath)}.`);
console.log(`Created ${path.relative(root, previewOutPath)}.`);
console.log(`Article count: ${summary.article_count}`);
console.log(`Below long-form minimum: ${summary.articles_below_long_form_minimum}`);
console.log(`Missing/broken/logo image: ${summary.articles_missing_or_broken_image}`);
console.log(`Missing image credit: ${summary.articles_missing_image_credit}`);
console.log(`Two public verified references: ${summary.articles_with_two_public_verified_references}`);
console.log(`Need repair before publication: ${summary.articles_needing_repair_before_publication}`);
console.log(`Mutation performed: false`);
