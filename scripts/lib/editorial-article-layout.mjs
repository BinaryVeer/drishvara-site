export const ARTICLE_LAYOUT_VERSION = "drishvara.article-layout.v1";
const plain = v => v !== null && typeof v === "object" && !Array.isArray(v);
const exact = (v, keys) => plain(v) && Object.keys(v).length === keys.length && keys.every(k => Object.hasOwn(v, k));
const text = (v, max) => typeof v === "string" && v.trim().length > 0 && v.length <= max;
const strings = (v, max, length = 500) => Array.isArray(v) && v.length > 0 && v.length <= max && v.every(s => text(s, length));
const integer = v => Number.isSafeInteger(v);
const escape = v => String(v).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
const https = v => { try { const u = new URL(v); return u.protocol === "https:" && !u.username && !u.password; } catch { return false; } };
export const articleParagraphs = body => typeof body === "string" ? body.trim().split(/\n\s*\n/).filter(Boolean) : [];

// Declarative data only. Placement never accepts HTML, SVG, code or caller-supplied styles.
export function articleLayoutError(payload) {
  const p = payload, l = p?.layout;
  if (l === undefined) return p?.media?.length > 1 ? "article_layout_required" : null;
  if (!exact(l, ["contract_version", "sections", "objects"]) || l.contract_version !== ARTICLE_LAYOUT_VERSION ||
      !Array.isArray(l.sections) || l.sections.length > 40 || !Array.isArray(l.objects) || l.objects.length > 16 ||
      !Array.isArray(p.media) || p.media.length > 8 || !Array.isArray(p.sources)) return "invalid_article_layout";
  const paragraphs = articleParagraphs(p.body).length, anchors = new Set(), ids = new Set(), media = new Set();
  for (const s of l.sections) {
    if (!exact(s, ["heading", "before_paragraph"]) || !text(s.heading, 180) || !integer(s.before_paragraph) ||
        s.before_paragraph < 1 || s.before_paragraph > paragraphs || anchors.has(s.before_paragraph)) return "invalid_article_layout";
    anchors.add(s.before_paragraph);
  }
  let heroes = 0;
  for (const o of l.objects) {
    const keys = ["id", "type", "after_paragraph", "width", "title", "caption", "source_refs"];
    const extras = { image: ["media_index", "visual_kind"], table: ["columns", "rows"], takeaways: ["items"], bar_chart: ["unit", "labels", "values"] }[o?.type];
    if (!extras || !exact(o, [...keys, ...extras]) || !/^[a-z][a-z0-9-]{0,39}$/.test(o.id) || ids.has(o.id) ||
        !integer(o.after_paragraph) || o.after_paragraph < 0 || o.after_paragraph > paragraphs ||
        !["reading", "wide"].includes(o.width) || !text(o.title, 180) || !text(o.caption, 1000) ||
        !Array.isArray(o.source_refs) || !o.source_refs.length || o.source_refs.length > 50 ||
        new Set(o.source_refs).size !== o.source_refs.length || o.source_refs.some(n => !integer(n) || n < 1 || n > p.sources.length)) return "invalid_article_layout";
    ids.add(o.id);
    if (o.type === "image") {
      if (!integer(o.media_index) || o.media_index < 0 || o.media_index >= p.media.length || media.has(o.media_index) ||
          !["photograph", "infographic", "diagram", "chart", "map"].includes(o.visual_kind)) return "invalid_article_layout";
      media.add(o.media_index);
      const m = p.media[o.media_index];
      if (!plain(m) || !text(m.alt, 2000) || !text(m.attribution, 2000) || !https(m.source_url) ||
          !(https(m.url) || /^\/assets\/[a-zA-Z0-9_./-]+$/.test(m.url) && !m.url.includes(".."))) return "invalid_article_layout";
      if (o.after_paragraph === 0 && ++heroes > 1) return "invalid_article_layout";
    } else {
      if (o.after_paragraph === 0) return "invalid_article_layout";
      if (o.type === "takeaways" && !strings(o.items, 12)) return "invalid_article_layout";
      if (o.type === "table" && (!strings(o.columns, 6, 100) || !Array.isArray(o.rows) || !o.rows.length || o.rows.length > 30 ||
          o.rows.some(r => !Array.isArray(r) || r.length !== o.columns.length || r.some(c => !text(c, 500))))) return "invalid_article_layout";
      if (o.type === "bar_chart" && (!text(o.unit, 60) || !strings(o.labels, 12, 100) || !Array.isArray(o.values) ||
          o.values.length !== o.labels.length || o.values.some(v => typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 1e12) ||
          !o.values.some(v => v > 0))) return "invalid_article_layout";
    }
  }
  return media.size !== p.media.length ? "invalid_article_layout" : null;
}

export function articleLayoutReleaseBlocker(p) {
  const error = articleLayoutError(p);
  if (error) return error;
  if (p.layout && (!p.layout.objects.some(o => o.type === "image" && o.after_paragraph === 0) ||
      !p.layout.objects.some(o => o.type !== "image" || o.visual_kind !== "photograph"))) return "article_visual_enrichment_pending";
  return null;
}

export const ARTICLE_READING_CSS = `
.reviewed-article{font:18px/1.75 Arial,sans-serif;color:#192c3b;background:#fff;max-width:1120px;margin:0 auto;padding:32px 24px;overflow-wrap:anywhere;box-sizing:border-box}
.reviewed-article *{box-sizing:border-box}.reviewed-article h1,.reviewed-article h2,.reviewed-article h3{font-family:Cambria,serif;letter-spacing:0;color:#071d32;line-height:1.2}
.reviewed-article h1{font-size:38px;max-width:980px;margin:12px auto 28px}.reviewed-article h2{font-size:28px;margin:38px auto 16px}
.reviewed-article>p,.reviewed-article>h2,.reviewed-article>.reading,.reviewed-article>.article-sources{max-width:760px;margin-left:auto;margin-right:auto}
.reviewed-article .article-desk{font-size:13px;text-transform:uppercase;color:#826014;border-bottom:1px solid #d7ae53;padding-bottom:12px}
.reviewed-article .article-object{margin:32px auto;min-width:0}.reviewed-article .wide{max-width:100%}.reviewed-article figure{padding:0}
.reviewed-article .article-object h3{font-size:23px;margin:0 0 12px}.reviewed-article .article-object img{display:block;width:100%;height:auto;max-height:none;object-fit:contain;border-radius:4px}
.reviewed-article figcaption{font:15px/1.6 Arial,sans-serif;color:#3b4e59;margin-top:12px}.reviewed-article figcaption p{margin:5px 0}
.reviewed-article a{color:#205b79;text-underline-offset:3px}.reviewed-article .table-scroll{overflow-x:auto;max-width:100%}
.reviewed-article table{border-collapse:collapse;width:100%;font-size:16px;text-align:left}.reviewed-article th,.reviewed-article td{border-bottom:1px solid #ccd6dd;padding:10px;vertical-align:top}
.reviewed-article th{background:#edf2f5}.reviewed-article meter{display:block;width:100%;height:24px;accent-color:#287b81}
.reviewed-article .article-sources{border-top:1px solid #d7ae53;margin-top:40px}.reviewed-article ul{padding-left:24px}
@media(max-width:600px){.reviewed-article{font-size:17px;padding:20px 16px}.reviewed-article h1{font-size:30px}.reviewed-article h2{font-size:25px}.reviewed-article .article-object{margin:24px auto}.reviewed-article th,.reviewed-article td{padding:8px}}
`;

export function renderReviewedArticle(p, { title, imageUrl = (m => m.url) } = {}) {
  const error = articleLayoutError(p); if (error) throw Error(error);
  const sources = p.sources.map(s => typeof s === "string" ? { url: s, title: s } : s);
  if (sources.some(s => !https(s?.url))) throw Error("article_sources_pending");
  const sourceLink = n => `<a href="${escape(sources[n - 1].url)}" rel="noopener noreferrer">${escape(sources[n - 1].title || sources[n - 1].url)}</a>`;
  const render = o => {
    let content;
    if (o.type === "image") {
      const m = p.media[o.media_index], url = imageUrl(m, o.media_index);
      if (!(https(url) || /^\/[a-zA-Z0-9_./?=&%:-]+$/.test(url) && !url.startsWith("//"))) throw Error("invalid_editorial_image");
      content = `<img src="${escape(url)}" alt="${escape(m.alt)}" ${o.after_paragraph ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async"><p>${escape(m.attribution)} · <a href="${escape(m.source_url)}" rel="noopener noreferrer">Image source</a></p>`;
    } else if (o.type === "takeaways") content = `<ul>${o.items.map(s => `<li>${escape(s)}</li>`).join("")}</ul>`;
    else if (o.type === "table") content = `<div class="table-scroll" role="region" aria-label="${escape(o.title)}" tabindex="0"><table><thead><tr>${o.columns.map(c => `<th scope="col">${escape(c)}</th>`).join("")}</tr></thead><tbody>${o.rows.map(r => `<tr>${r.map(c => `<td>${escape(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    else content = `<table><thead><tr><th scope="col">Measure</th><th scope="col">${escape(o.unit)}</th></tr></thead><tbody>${o.labels.map((label, i) => `<tr><th scope="row">${escape(label)}</th><td>${o.values[i]}<meter min="0" max="${Math.max(...o.values)}" value="${o.values[i]}" aria-label="${escape(label + ': ' + o.values[i] + ' ' + o.unit)}"></meter></td></tr>`).join("")}</tbody></table>`;
    return `<figure id="object-${escape(o.id)}" class="article-object ${o.width}"><h3>${escape(o.title)}</h3>${content}<figcaption><p>${escape(o.caption)}</p><p>Sources: ${o.source_refs.map(sourceLink).join("; ")}</p></figcaption></figure>`;
  };
  const paragraphs = articleParagraphs(p.body), objects = p.layout?.objects ?? [];
  const legacyHero = !p.layout && p.media[0] ? `<figure class="article-object wide"><img src="${escape(imageUrl(p.media[0], 0))}" alt="${escape(p.media[0].alt || "")}"><figcaption>${escape(p.media[0].attribution || "Attribution pending")}</figcaption></figure>` : "";
  return `<article class="article-body"><div class="reviewed-article" data-drishvara-reviewed-layout="v1"><p class="article-desk">${escape(p.desk.replaceAll("_", " "))}</p><h1>${escape(title)}</h1>${legacyHero}${objects.filter(o => o.after_paragraph === 0).map(render).join("")}${paragraphs.map((part, i) => (p.layout?.sections ?? []).filter(s => s.before_paragraph === i + 1).map(s => `<h2>${escape(s.heading)}</h2>`).join("") + `<p data-paragraph="${i + 1}">${escape(part).replaceAll("\n", "<br>")}</p>` + objects.filter(o => o.after_paragraph === i + 1).map(render).join("")).join("\n")}<section class="article-sources"><h2>Sources</h2><ol>${sources.map((s, i) => `<li>${sourceLink(i + 1)}</li>`).join("")}</ol></section></div></article>`;
}

export function reviewedArticlePage(p, { title, imageUrl, preview = false } = {}) {
  const fragment = renderReviewedArticle(p, { title, imageUrl });
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="${preview ? "noindex,nofollow" : "index,follow"}"><meta name="description" content="${escape(articleParagraphs(p.body)[0]?.slice(0, 200) || title)}"><title>${escape(title)} | Drishvara</title><style>body{margin:0;background:#f1f4f6}header{background:#071d32;padding:18px 24px;font:20px Cambria,serif}header a{color:#fff;text-decoration:none}header nav{display:flex;gap:24px;flex-wrap:wrap}header a:focus-visible{outline:2px solid #e6b74b;outline-offset:4px}${ARTICLE_READING_CSS}</style></head><body>${preview ? "" : '<header><nav aria-label="Drishvara"><a href="/">Drishvara</a><a href="/index.html#read">Read</a><a href="/panchang.html">Panchang</a><a href="/what-stars-say.html">What Stars Say</a></nav></header>'}${fragment}</body></html>`;
}
