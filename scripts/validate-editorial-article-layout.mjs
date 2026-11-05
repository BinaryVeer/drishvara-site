import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { articleLayoutError, articleLayoutReleaseBlocker, renderReviewedArticle, reviewedArticlePage } from "./lib/editorial-article-layout.mjs";
import { validateEditorialCommand } from "./lib/editorial-workspace-service.mjs";
import { syntheticArticleLayout } from "./lib/editorial-review-test-fixtures.mjs";
import { createEditorialArticlePublisher } from "./lib/editorial-article-publisher.mjs";
let checks = 0;
const check = (name, fn) => { fn(); checks++; console.log("PASS layout: " + name); };
const payload = syntheticArticleLayout(), clone = () => structuredClone(payload);
const command = p => ({ action: "intake", command_id: randomUUID(), kind: "article", external_id: "synthetic-layout", expected_version_id: null, title: "Synthetic layout only", payload: p });
check("multiple images and sourced objects use the existing intake", () => assert.equal(validateEditorialCommand(command(payload)), null));
check("legacy single-image/plain-text records remain valid", () => { const p = clone(); delete p.layout; p.media.length = 1; assert.equal(validateEditorialCommand(command(p)), null); });
check("unpositioned multiple images fail closed", () => { const p = clone(); delete p.layout; assert.equal(articleLayoutError(p), "article_layout_required"); });
for (const [name, mutate] of [
  ["unknown version", p => p.layout.contract_version = "future"],
  ["executable layout field", p => p.layout.html = "<script>bad()</script>"],
  ["unknown object", p => p.layout.objects[2].type = "iframe"],
  ["out-of-range paragraph", p => p.layout.objects[0].after_paragraph = 999],
  ["fractional position", p => p.layout.objects[0].after_paragraph = 1.5],
  ["missing source", p => p.layout.objects[2].source_refs = []],
  ["invented source", p => p.layout.objects[2].source_refs = [2]],
  ["duplicate source", p => p.layout.objects[2].source_refs = [1, 1]],
  ["orphan image", p => p.layout.objects.splice(1, 1)],
  ["duplicate image reference", p => p.layout.objects[1].media_index = 0],
  ["two hero images", p => p.layout.objects[1].after_paragraph = 0],
  ["duplicate object IDs", p => p.layout.objects[1].id = "hero"],
  ["empty caption", p => p.layout.objects[1].caption = ""],
  ["arbitrary CSS", p => p.layout.objects[1].style = "position:fixed"],
  ["negative graph values", p => p.layout.objects[3].values = [-1, 4]],
  ["non-numeric graph values", p => p.layout.objects[3].values = [null, 4]],
  ["no-data graph", p => p.layout.objects[3].values = [0, 0]],
  ["ragged table", p => p.layout.objects[2].rows[0] = ["missing"]],
  ["duplicate headings", p => p.layout.sections.push(p.layout.sections[0])],
  ["over eight images", p => p.media = Array(9).fill(p.media[0])],
  ["unsafe source URL", p => p.media[0].source_url = "javascript:alert(1)"]
]) check(name + " rejected", () => { const p = clone(); mutate(p); assert(articleLayoutError(p)); assert(validateEditorialCommand(command(p))); });
check("missing hero remains a publication blocker, not automatic substitution", () => { const p = clone(); p.layout.objects[0].after_paragraph = 1; assert.equal(articleLayoutReleaseBlocker(p), "article_visual_enrichment_pending"); });
check("photography alone cannot satisfy structured-enrichment requirement", () => { const p = clone(); p.layout.objects = [p.layout.objects[0]]; p.media.length = 1; assert.equal(articleLayoutReleaseBlocker(p), "article_visual_enrichment_pending"); });
const html = renderReviewedArticle(payload, { title: "Synthetic layout only" });
check("hero, headings, images and objects follow exact paragraph anchors", () => {
  assert(html.indexOf('id="object-hero"') < html.indexOf('data-paragraph="1"'));
  assert(html.indexOf("Synthetic section heading") < html.indexOf('data-paragraph="2"'));
  assert(html.indexOf('id="object-diagram"') > html.indexOf('data-paragraph="2"'));
  assert(html.indexOf('id="object-diagram"') < html.indexOf('data-paragraph="3"'));
});
check("graph exposes exact units and values in an accessible table", () => { assert(html.includes('scope="row">Test B')); assert(html.includes('value="4"')); assert(html.includes("Synthetic units")); });
check("every object retains title, caption and linked data/source basis", () => { assert.equal((html.match(/<figcaption>/g) || []).length, 5); assert(html.includes("Synthetic illustration")); });
check("all text is escaped; private review and uploaded bytes excluded", () => {
  const p = clone(); p.layout.objects[2].rows[0][0] = "<script>alert(1)</script>";
  const output = reviewedArticlePage(p, { title: "<img onerror=bad()>" });
  assert(!output.includes("<script>")); assert(output.includes("&lt;script&gt;")); assert(!output.includes("upload_png")); assert(!output.includes(payload.media[0].upload_png));
});
check("preview and publication use identical reading fragment", () => {
  assert(reviewedArticlePage(payload, { title: "Synthetic layout only", preview: true }).includes(html));
  assert(reviewedArticlePage(payload, { title: "Synthetic layout only" }).includes(html));
});
check("layout rendering is deterministic and does not mutate its input", () => { const before = JSON.stringify(payload); assert.equal(renderReviewedArticle(payload, { title: "Synthetic layout only" }), html); assert.equal(JSON.stringify(payload), before); });
let calls = [], tree;
const publisher = createEditorialArticlePublisher({ env: { EDITORIAL_GITHUB_TOKEN: "synthetic", EDITORIAL_GITHUB_OWNER: "BinaryVeer", EDITORIAL_GITHUB_REPO: "drishvara-site", EDITORIAL_GITHUB_BRANCH: "main" }, fetcher: async (url, options = {}) => {
  const path = url.split("/drishvara-site/")[1]; calls.push(path); const body = options.body && JSON.parse(options.body);
  const ok = value => ({ ok: true, status: 200, json: async () => value });
  if (path === "git/ref/heads/main") return ok({ object: { sha: "a".repeat(40) } });
  if (path.startsWith("contents/data/article-index.json")) return ok({ type: "file", encoding: "base64", content: Buffer.from('{"items":[]}').toString("base64") });
  if (path.startsWith("contents/")) return { ok: false, status: 404 };
  if (path === "git/blobs") return ok({ sha: "b".repeat(40) });
  if (path.startsWith("git/commits/")) return ok({ tree: { sha: "c".repeat(40) } });
  if (path === "git/trees") { tree = body.tree; return ok({ sha: "d".repeat(40) }); }
  if (path === "git/commits") return ok({ sha: "e".repeat(40) });
  if (path === "git/refs/heads/main") { assert.equal(body.force, false); return ok({}); }
  throw Error("unexpected mock request");
} });
let revalidated = false;
await publisher({ job: { candidate_id: randomUUID(), version_id: randomUUID(), content_hash: "sha256:" + "0".repeat(64), version: { title: "Synthetic layout only", payload } }, timestamp: "2026-10-30T07:00:00.000Z", revalidate: async () => { revalidated = true; } });
check("multiple uploads, page, discovery index and receipt form one atomic commit", () => { assert.equal(tree.length, 5); assert.equal(calls.filter(s => s === "git/blobs").length, 2); assert.equal(calls.filter(s => s === "git/refs/heads/main").length, 1); assert(revalidated); });
console.log(`Article layout: ${checks} synthetic contract/render/mock-delivery checks passed. No approval or live write occurred.`);
