import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ag01r1-post-ag02-article-governance-refresh-audit.json");
const auditOutPath = path.join(root, "data", "editorial", "ag01r1-post-ag02-article-governance-refresh-audit.json");
const previewOutPath = path.join(root, "data", "quality", "ag01r1-post-ag02-article-governance-refresh-preview.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function existsRel(rel) {
  return fs.existsSync(path.join(root, rel));
}

function readText(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function walkArticles() {
  const base = path.join(root, "articles");
  const files = [];
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, item.name);
      const rel = path.relative(root, full).replaceAll(path.sep, "/");
      if (item.isDirectory()) walk(full);
      else if (item.isFile() && rel.endsWith(".html")) files.push(rel);
    }
  }
  walk(base);
  return files.sort();
}

function withoutStyleScript(html) {
  return html
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ");
}

function stripTags(html) {
  return withoutStyleScript(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(text) {
  const words = String(text || "").match(/[A-Za-zÀ-ÿ0-9][A-Za-zÀ-ÿ0-9'’.-]*/g);
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

function countVisible(html, marker) {
  return (withoutStyleScript(html).match(new RegExp(marker, "g")) || []).length;
}

function attr(tag, name) {
  const re = new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, "i");
  const m = tag.match(re);
  return m ? m[1] : null;
}

function normalizeLocalSrc(src) {
  if (!src) return "";
  let s = String(src).split("?")[0].split("#")[0];
  if (s.startsWith("/")) s = s.slice(1);
  if (s.startsWith("./")) s = s.slice(2);
  return s;
}

function isExternal(src) {
  return /^https?:\/\//i.test(String(src || ""));
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

function imageStatus(html, rel) {
  const clean = withoutStyleScript(html);

  const ag02Figures = [...clean.matchAll(/<figure\b[^>]*data-drishvara-ag02-hero-visual="true"[^>]*>[\s\S]*?<\/figure>/gi)]
    .map((m) => m[0]);

  const visibleAg02HeroFigures = ag02Figures.map((figure) => {
    const img = figure.match(/<img\b[^>]*>/i);
    const tag = img ? img[0] : "";
    const src = attr(tag, "src") || "";
    const local = normalizeLocalSrc(src);
    return {
      src,
      local_path: local || null,
      local_exists: local ? existsRel(local) : false,
      status: local && existsRel(local) ? "ag02_category_fallback_visible" : "broken_local_image"
    };
  });

  if (visibleAg02HeroFigures.length > 0) {
    const primary = visibleAg02HeroFigures[0];
    return {
      hero_image_status: primary.status,
      hero_image_src: primary.src,
      visible_ag02_hero_count: visibleAg02HeroFigures.length,
      visible_image_count: (clean.match(/<img\b/gi) || []).length,
      evidence: visibleAg02HeroFigures
    };
  }

  const imgs = [...clean.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]).map((tag) => {
    const src = attr(tag, "src") || "";
    const local = normalizeLocalSrc(src);
    const brandRestored = /data-drishvara-av02-restored-brand-mark="true"/i.test(tag);
    let status = "unknown";

    if (brandRestored) status = "ignored_small_brand_mark";
    else if (!src) status = "blank_or_empty_src";
    else if (isLogoLike(src)) status = "favicon_or_brand_mark_as_hero";
    else if (isCategoryFallback(src) && local && existsRel(local)) status = "valid_category_fallback";
    else if (isCategoryFallback(src) && (!local || !existsRel(local))) status = "broken_local_image";
    else if (isExternal(src)) status = "external_image_unverified";
    else if (local && existsRel(local)) status = "valid_local_image";
    else status = "broken_local_image";

    return { src, local_path: local || null, local_exists: local ? existsRel(local) : false, brand_restored: brandRestored, status };
  });

  const nonBrand = imgs.filter((img) => img.status !== "ignored_small_brand_mark");
  const preferred = nonBrand[0] || null;

  if (!preferred) {
    return {
      hero_image_status: "missing_image",
      hero_image_src: null,
      visible_ag02_hero_count: 0,
      visible_image_count: imgs.length,
      evidence: imgs
    };
  }

  return {
    hero_image_status: preferred.status,
    hero_image_src: preferred.src,
    visible_ag02_hero_count: 0,
    visible_image_count: imgs.length,
    evidence: imgs
  };
}

function creditStatus(html, markers) {
  const clean = withoutStyleScript(html);
  const ag02 = (clean.match(new RegExp(markers.ag02_credit_marker, "g")) || []).length;
  const ar02c = (clean.match(new RegExp(markers.ar02c_image_credit, "g")) || []).length;
  const ar01 = (clean.match(new RegExp(markers.ar01_image_credit, "g")) || []).length;

  return {
    visible_ag02_image_credit_count: ag02,
    visible_ar02c_image_credit_count: ar02c,
    visible_ar01_image_credit_count: ar01,
    image_credit_present: ag02 > 0 || ar02c > 0 || ar01 > 0,
    image_credit_status: ag02 > 0
      ? "ag02_credit_present"
      : ar02c > 0
        ? "ar02c_credit_present"
        : ar01 > 0
          ? "ar01_credit_present"
          : "missing_image_credit"
  };
}

function hrefsInEvidence(html) {
  const clean = withoutStyleScript(html);
  const evidenceSections = [...clean.matchAll(/<section\b[^>]*(data-drishvara-ar01-evidence-block|data-drishvara-ar02c-sample-reference-block)[^>]*>[\s\S]*?<\/section>/gi)]
    .map((m) => m[0]);
  return evidenceSections.flatMap((section) => [...section.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)].map((m) => m[1]));
}

function referenceStatus(html, markers) {
  return {
    visible_ar01_evidence_block_count: countVisible(html, markers.ar01_evidence_block),
    visible_ar01_reference_slot_count: countVisible(html, markers.ar01_reference_slot),
    visible_ar02c_block_count: countVisible(html, markers.ar02c_block),
    visible_ar02c_reference_link_count: countVisible(html, markers.ar02c_reference_link),
    visible_evidence_href_count: hrefsInEvidence(html).length,
    evidence_hrefs: hrefsInEvidence(html),
    has_two_public_verified_references: countVisible(html, markers.ar02c_reference_link) >= 2,
    reference_publication_status: countVisible(html, markers.ar02c_reference_link) >= 2
      ? "two_verified_references_public"
      : "under_editorial_verification_or_missing"
  };
}

function markerStatus(html, markers) {
  const out = {};
  for (const [key, marker] of Object.entries(markers)) {
    out[key] = countVisible(html, marker);
  }
  return out;
}

function readiness(entry, policy) {
  const issues = [];

  if (entry.word_count < policy.provisional_long_form_minimum_words) issues.push("below_long_form_minimum");
  if (policy.non_publication_image_statuses.includes(entry.image.hero_image_status)) issues.push(`image_${entry.image.hero_image_status}`);
  if (!entry.credit.image_credit_present) issues.push("missing_image_credit");
  if (!entry.references.has_two_public_verified_references) issues.push("missing_two_public_verified_references");
  if (!entry.markers.av01_style && !entry.markers.av02_style) issues.push("missing_article_width_governance_marker");

  let nextAction = "manual_editorial_review";
  if (issues.includes("below_long_form_minimum")) nextAction = "AG04_long_form_content_expansion_or_quality_gate";
  if (issues.some((x) => x.startsWith("image_")) || issues.includes("missing_image_credit")) nextAction = "AG02_followup_image_credit_repair";
  if (issues.includes("missing_two_public_verified_references")) nextAction = "AG03_verified_reference_scaling_or_publication";
  if (issues.includes("missing_article_width_governance_marker")) nextAction = "AG05_direct_router_template_alignment";

  return {
    status: issues.length ? "needs_repair_before_publication" : "ready_for_publication_review",
    issues,
    next_action: nextAction
  };
}

const config = readJson(registryPath);
const ag01 = readJson(path.join(root, config.input_files.ag01_audit));
const ag02Apply = readJson(path.join(root, config.input_files.ag02_apply_result));
const ag02Registry = readJson(path.join(root, config.input_files.ag02_source_truth_registry));
const ar02b = readJson(path.join(root, config.input_files.ar02b_sample_registry));

const markers = config.required_markers;
const policy = config.audit_policy;
const ag02TargetPaths = new Set((ag02Apply.file_results || []).map((row) => row.article_path));
const ar02bSamplePaths = new Set((ar02b.entries || []).map((entry) => entry.article_path));

const entries = walkArticles().map((rel) => {
  const html = readText(rel);
  const image = imageStatus(html, rel);
  const credit = creditStatus(html, markers);
  const references = referenceStatus(html, markers);
  const markersStatus = markerStatus(html, markers);

  const entry = {
    article_path: rel,
    category: categoryFromPath(rel),
    title: titleFromHtml(html, rel),
    word_count: wordCount(stripTags(html)),
    long_form_minimum_words: policy.provisional_long_form_minimum_words,
    below_long_form_minimum: wordCount(stripTags(html)) < policy.provisional_long_form_minimum_words,
    ag02_targeted: ag02TargetPaths.has(rel),
    ar02b_sample: ar02bSamplePaths.has(rel),
    image,
    credit,
    references,
    markers: markersStatus,
    router_direct_alignment: {
      direct_page_has_width_governance: markersStatus.av01_style > 0 || markersStatus.av02_style > 0,
      direct_page_has_reference_governance: markersStatus.ar01_evidence_block > 0 || markersStatus.ar02c_block > 0
    }
  };

  entry.publication_readiness = readiness(entry, policy);
  return entry;
});

const ag02TargetEntries = entries.filter((entry) => entry.ag02_targeted);
const ar02bSampleEntries = entries.filter((entry) => entry.ar02b_sample);

const routerHtml = existsRel("article.html") ? readText("article.html") : "";
const routerStatus = {
  router_page_present: existsRel("article.html"),
  av01_style_present: withoutStyleScript(routerHtml).includes(markers.av01_style),
  av02_style_present: withoutStyleScript(routerHtml).includes(markers.av02_style),
  av02_router_guard_present: routerHtml.includes("data-drishvara-av02-router-reference-guard-script"),
  broad_width_present: routerHtml.includes("--drishvara-article-outer-max"),
  paragraph_justify_present: routerHtml.includes("text-align: justify")
};

const baseline = ag01.summary;

const summary = {
  article_count: entries.length,
  baseline_ag01_article_count: baseline.article_count,
  ag02_target_count_from_apply: ag02Apply.summary.targeted_article_count,
  ag02_target_count_seen_in_refresh: ag02TargetEntries.length,
  ag02_source_truth_registry_count: ag02Registry.targeted_article_count,

  below_long_form_minimum: entries.filter((e) => e.below_long_form_minimum).length,
  baseline_below_long_form_minimum: baseline.articles_below_long_form_minimum,

  missing_or_broken_or_logo_image: entries.filter((e) => policy.non_publication_image_statuses.includes(e.image.hero_image_status)).length,
  baseline_missing_or_broken_or_logo_image: baseline.articles_missing_or_broken_image,
  image_gap_delta_from_ag01: entries.filter((e) => policy.non_publication_image_statuses.includes(e.image.hero_image_status)).length - baseline.articles_missing_or_broken_image,

  logo_like_hero: entries.filter((e) => e.image.hero_image_status === "favicon_or_brand_mark_as_hero").length,
  ag02_targets_with_visible_ag02_hero: ag02TargetEntries.filter((e) => e.image.visible_ag02_hero_count > 0 && e.image.hero_image_status === "ag02_category_fallback_visible").length,
  ag02_targets_missing_visible_ag02_hero: ag02TargetEntries.filter((e) => !(e.image.visible_ag02_hero_count > 0 && e.image.hero_image_status === "ag02_category_fallback_visible")).length,

  missing_image_credit: entries.filter((e) => !e.credit.image_credit_present).length,
  baseline_missing_image_credit: baseline.articles_missing_image_credit || 0,
  ag02_targets_with_visible_ag02_credit: ag02TargetEntries.filter((e) => e.credit.visible_ag02_image_credit_count > 0).length,
  ag02_targets_missing_visible_ag02_credit: ag02TargetEntries.filter((e) => e.credit.visible_ag02_image_credit_count === 0).length,

  articles_with_two_public_verified_references: entries.filter((e) => e.references.has_two_public_verified_references).length,
  baseline_articles_with_two_public_verified_references: baseline.articles_with_two_public_verified_references,
  missing_two_public_verified_references: entries.filter((e) => !e.references.has_two_public_verified_references).length,
  baseline_missing_two_public_verified_references: baseline.articles_missing_two_public_verified_references,
  ar02c_sample_articles_with_two_public_verified_references: ar02bSampleEntries.filter((e) => e.references.has_two_public_verified_references).length,
  ar02c_sample_expected_count: ar02b.entries.length,

  ready_for_publication_review: entries.filter((e) => e.publication_readiness.status === "ready_for_publication_review").length,
  needing_repair_before_publication: entries.filter((e) => e.publication_readiness.status === "needs_repair_before_publication").length,

  router_status: routerStatus,
  ag02_image_credit_gap_closed: ag02TargetEntries.length === ag02Apply.summary.targeted_article_count &&
    ag02TargetEntries.every((e) => e.image.visible_ag02_hero_count > 0 && e.image.hero_image_status === "ag02_category_fallback_visible") &&
    ag02TargetEntries.every((e) => e.credit.visible_ag02_image_credit_count > 0),
  ready_for_ag03_reference_scaling: false
};

summary.ready_for_ag03_reference_scaling = summary.ag02_image_credit_gap_closed &&
  summary.missing_image_credit === 0 &&
  summary.ar02c_sample_articles_with_two_public_verified_references === summary.ar02c_sample_expected_count;

const issueBuckets = {
  needs_image_or_credit_repair_after_ag02: entries
    .filter((e) => policy.non_publication_image_statuses.includes(e.image.hero_image_status) || !e.credit.image_credit_present)
    .map((e) => e.article_path),
  needs_reference_scaling_or_publication: entries
    .filter((e) => !e.references.has_two_public_verified_references)
    .map((e) => e.article_path),
  needs_long_form_expansion_or_gate: entries
    .filter((e) => e.below_long_form_minimum)
    .map((e) => e.article_path),
  needs_template_alignment: entries
    .filter((e) => !e.router_direct_alignment.direct_page_has_width_governance)
    .map((e) => e.article_path)
};

const audit = {
  audit_id: "AG01R1_POST_AG02_ARTICLE_GOVERNANCE_REFRESH_AUDIT",
  module_id: "AG01R1",
  status: "post_ag02_refresh_audit_completed_no_mutation",
  generated_at: new Date().toISOString(),
  mutation_performed: false,
  article_html_mutation_performed: false,
  article_text_mutation_performed: false,
  article_word_count_reduction_performed: false,
  article_word_count_expansion_performed: false,
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
  preview_id: "AG01R1_POST_AG02_ARTICLE_GOVERNANCE_REFRESH_PREVIEW",
  module_id: "AG01R1",
  status: "preview_after_post_ag02_refresh_audit",
  preview_only: true,
  summary,
  issue_bucket_counts: {
    needs_image_or_credit_repair_after_ag02: issueBuckets.needs_image_or_credit_repair_after_ag02.length,
    needs_reference_scaling_or_publication: issueBuckets.needs_reference_scaling_or_publication.length,
    needs_long_form_expansion_or_gate: issueBuckets.needs_long_form_expansion_or_gate.length,
    needs_template_alignment: issueBuckets.needs_template_alignment.length
  },
  sample_entries: entries.slice(0, 10).map((entry) => ({
    article_path: entry.article_path,
    word_count: entry.word_count,
    ag02_targeted: entry.ag02_targeted,
    hero_image_status: entry.image.hero_image_status,
    visible_ag02_hero_count: entry.image.visible_ag02_hero_count,
    image_credit_status: entry.credit.image_credit_status,
    visible_ag02_credit_count: entry.credit.visible_ag02_image_credit_count,
    public_verified_reference_count: entry.references.visible_ar02c_reference_link_count,
    readiness: entry.publication_readiness.status,
    next_action: entry.publication_readiness.next_action
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
console.log(`AG02 targets: ${summary.ag02_target_count_seen_in_refresh}/${summary.ag02_target_count_from_apply}`);
console.log(`AG02 targets with visible hero: ${summary.ag02_targets_with_visible_ag02_hero}`);
console.log(`AG02 targets with visible credit: ${summary.ag02_targets_with_visible_ag02_credit}`);
console.log(`Image/credit gap after AG02: ${issueBuckets.needs_image_or_credit_repair_after_ag02.length}`);
console.log(`Missing two public verified references: ${summary.missing_two_public_verified_references}`);
console.log(`Below long-form minimum: ${summary.below_long_form_minimum}`);
console.log(`Ready for AG03: ${summary.ready_for_ag03_reference_scaling}`);
console.log(`Mutation performed: false`);
