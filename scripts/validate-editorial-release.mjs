import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { assessEditorialRelease, requestControlledRelease, deliverReviewedWord } from "./lib/editorial-release-service.mjs";
import { editorialDecisionIssues } from "./lib/editorial-workspace-service.mjs";
import { createEditorialArticlePublisher } from "./lib/editorial-article-publisher.mjs";
import { syntheticReviewImage } from "./lib/editorial-review-test-fixtures.mjs";
import { prepareReviewedArticleFiles } from "../services/pipeline/publish-all-core.js";
import { syntheticWord, withSyntheticMeaning } from "./lib/ag70e-word-test-fixtures.mjs";
import { snapshotHash, candidateRef } from "./lib/ag70d-word-selection-engine.mjs";

// Synthetic contracts and mocked external delivery only. No hosted data, real Git writes or approvals.
let checks = 0;
async function check(name, run) { await run(); checks++; console.log("PASS release: " + name); }
const envelope = value => ({ ok: true, ...value, public_output_allowed: false, runtime_activation: false });
const scopes = ["editorial", "rights", "factual", "safety", "media", "publisher_acceptance"];
const id = randomUUID(), versionId = randomUUID(), releaseId = randomUUID(), claimId = randomUUID(), actorId = randomUUID();
const timestamp = "2026-10-28T18:45:00.000Z";
const version = { id: versionId, content_hash: "sha256:" + "a".repeat(64), title: "Synthetic controlled article",
  payload: { desk: "world_affairs", body: 'Synthetic text only. <script>throw Error("not executable")</script>\n\nSecond paragraph.',
    sources: [{ title: "Synthetic evidence", url: "https://example.invalid/reviewed-source" }], media: [], research_refs: ["PRIVATE-NOTE-DO-NOT-EXPORT"] } };
const opened = envelope({ candidate: { id, kind: "article" }, version,
  review_state: { required_scopes: scopes, approved_scopes: scopes, reviews_complete: true }, review_permissions: { can_request_release: true } });
const command = { action: "request_release", command_id: randomUUID(), candidate_id: id, version_id: versionId, content_hash: version.content_hash };
const job = envelope({ status: "claimed", claim_id: claimId, kind: "article", candidate_id: id, version_id: versionId, content_hash: version.content_hash, version });
let rpcCalls = [], workerCalls = [], writes = 0, current = structuredClone(opened), workerStatus = "claimed", failComplete = false;
const rpc = async (name, args) => {
  assert.equal(name, "editorial_review_command"); rpcCalls.push(args.p_command.action);
  return args.p_command.action === "open" ? current : envelope({ release_request_id: releaseId, status: "pending_existing_publisher_validation" });
};
const workerRpc = async (name, args) => {
  assert.equal(name, "editorial_release_worker"); const c = args.p_command; workerCalls.push(c.operation);
  assert.equal(c.actor_id, actorId); assert.equal(c.authorization_ref, "synthetic-operation-only");
  if (c.operation === "claim") return workerStatus === "claimed" ? job : envelope({ status: workerStatus });
  if (c.operation === "complete" && failComplete) throw Error("synthetic acknowledgment loss");
  return envelope({ status: c.operation === "check" ? "valid" : c.operation === "complete" ? "delivery_completed" : "failed", result: c.result });
};
const options = { command, session: { actor_id: actorId }, rpc, workerRpc, authorizationRef: "synthetic-operation-only",
  enabled: true, timestamp, articlePublisher: async ({ revalidate }) => { await revalidate(); writes++; return { status: "article_committed", reference: "b".repeat(40), path: "articles/world/editorial-" + id + ".html" }; } };
await check("pending reviews list every missing scope and prohibit a request", () => {
  const r = assessEditorialRelease({ ...opened, review_state: { ...opened.review_state, approved_scopes: [], reviews_complete: false } });
  assert.equal(r.request_allowed, false); assert.deepEqual(r.missing_scopes, scopes); assert(r.blockers.includes("delivery_not_activated"));
});
await check("review boolean alone cannot bypass scope completeness", () => {
  assert.equal(assessEditorialRelease({ ...opened, review_state: { ...opened.review_state, approved_scopes: [] } }).request_allowed, false);
});
await check("missing, duplicate and invented scope contracts fail closed", () => {
  for (const state of [null, { ...opened.review_state, required_scopes: [] }, { ...opened.review_state, approved_scopes: [...scopes, scopes[0]] }, { ...opened.review_state, required_scopes: ["invented"] }])
    assert.equal(assessEditorialRelease({ ...opened, review_state: state }).request_allowed, false);
});
await check("release assignment is mandatory independently of review completion", () => assert.equal(assessEditorialRelease({ ...opened, review_permissions: {} }).request_allowed, false));
await check("review completion never implies operational activation", () => {
  const r = assessEditorialRelease(opened); assert.equal(r.request_allowed, true); assert.equal(r.delivery_enabled, false); assert.equal(r.public_output_allowed, false);
});
await check("rationale and evidence failures have actionable details", () => {
  const r = editorialDecisionIssues({ action: "decision", scope: "editorial", decision: "approve", note: " ", evidence_refs: [] });
  assert.equal(r.length, 2); assert(r.some(x => x.includes("rationale"))); assert(r.some(x => x.includes("actual evidence")));
});
await check("duplicate evidence is identified without inventing a reference", () => assert(editorialDecisionIssues({ action: "decision", scope: "editorial", decision: "approve", note: "Synthetic note", evidence_refs: ["same", "same"] }).some(x => x.includes("duplicate"))));
await check("pending copy cannot reach either outbox or delivery adapter", async () => {
  current = { ...opened, review_state: { ...opened.review_state, approved_scopes: [], reviews_complete: false } }; rpcCalls = []; workerCalls = [];
  const r = await requestControlledRelease(options); assert.equal(r.ok, false); assert.deepEqual(rpcCalls, ["open"]); assert.equal(workerCalls.length, 0); assert.equal(writes, 0); current = opened;
});
await check("stale version binding is rejected before queue creation", async () => {
  rpcCalls = []; const r = await requestControlledRelease({ ...options, command: { ...command, version_id: randomUUID() } });
  assert.equal(r.code, "stale_editorial_version"); assert.deepEqual(rpcCalls, ["open"]);
});
await check("unknown command fields cannot supply caller approval", async () => assert.equal((await requestControlledRelease({ ...options, command: { ...command, approved: true } })).ok, false));
await check("disabled delivery saves a handoff without invoking a worker", async () => {
  workerCalls = []; const r = await requestControlledRelease({ ...options, enabled: false }); assert.equal(r.status, "queued_delivery_disabled"); assert.equal(workerCalls.length, 0); assert.equal(writes, 0);
});
await check("unavailable worker does not masquerade as publication", async () => assert.equal((await requestControlledRelease({ ...options, workerRpc: null })).status, "queued_worker_unavailable"));
await check("approved controlled delivery rechecks authority before and after the adapter", async () => {
  workerCalls = []; const r = await requestControlledRelease(options); assert.equal(r.status, "delivery_completed");
  assert.deepEqual(workerCalls, ["claim", "check", "check", "complete"]); assert.equal(writes, 1); assert.equal(r.public_output_allowed, false);
});
await check("an in-progress claim cannot invoke a second delivery", async () => {
  workerStatus = "delivery_in_progress"; const before = writes; assert.equal((await requestControlledRelease(options)).status, workerStatus); assert.equal(writes, before); workerStatus = "claimed";
});
await check("completed replay does not write a second article", async () => {
  workerStatus = "delivery_completed"; const before = writes; assert.equal((await requestControlledRelease(options)).status, workerStatus); assert.equal(writes, before); workerStatus = "claimed";
});
await check("adapter errors retain a pending request and record failure, not success", async () => {
  workerCalls = []; const r = await requestControlledRelease({ ...options, articlePublisher: async () => { throw Error("article_branch_advanced"); } });
  assert.equal(r.status, "delivery_pending"); assert.equal(r.code, "article_branch_advanced"); assert.deepEqual(workerCalls, ["claim", "fail"]);
});
await check("lost completion acknowledgment is not reported as a successful launch", async () => {
  failComplete = true; const r = await requestControlledRelease(options); assert.equal(r.status, "delivery_pending"); failComplete = false;
});
await check("raw adapter failure text cannot expose credentials", async () => {
  const r = await requestControlledRelease({ ...options, articlePublisher: async () => { throw Error("synthetic-secret-must-not-leak"); } });
  assert(!JSON.stringify(r).includes("synthetic-secret"));
});
const fields = { candidateId: id, version, date: "2026-10-29", timestamp, existingIndex: { items: [] } };
const rendered = await prepareReviewedArticleFiles(fields);
const baselinePublisher = execFileSync("git", ["show", "HEAD:services/pipeline/publish-all-core.js"], { encoding: "utf8" });
const currentPublisher = fs.readFileSync("services/pipeline/publish-all-core.js", "utf8");
const loadTemplate = source => import("data:text/javascript;base64," + Buffer.from(source.replace('import { createClient } from "@supabase/supabase-js";', "") + "\nexport {buildArticlePage,rebuildArticleIndex};").toString("base64"));
const previousTemplate = await loadTemplate(baselinePublisher), currentTemplate = await loadTemplate(currentPublisher);
await check("legacy article template remains byte-identical with its original defaults", async () => {
  for (const image of ["", "/assets/synthetic-image.jpg"]) {
    const input = { draftPacket: { title: "Synthetic legacy template regression", article_html: "<p>Synthetic trusted legacy fixture</p>", image },
      categoryMeta: { label: "Synthetic desk", fallback_image: "/assets/synthetic-fallback.jpg" }, today: "2026-10-28" };
    assert.equal(await currentTemplate.buildArticlePage(input), await previousTemplate.buildArticlePage(input));
  }
});
await check("legacy discovery rebuilding preserves all original fields and selection semantics", () => {
  const item = { title: "Synthetic existing read", path: "articles/world/synthetic.html", source: "articles", date: "2026-10-28" };
  const before = previousTemplate.rebuildArticleIndex({ items: [item] }, []), after = currentTemplate.rebuildArticleIndex({ items: [item] }, []);
  delete before.generatedAt; delete after.generatedAt; assert.deepEqual(after, before);
});
await check("existing article template escapes approved text and keeps all citations", () => { assert(rendered.html.includes("&lt;script&gt;")); assert(!rendered.html.includes('<script>throw')); assert(rendered.html.includes("https://example.invalid/reviewed-source")); });
await check("article output excludes private research and review metadata", () => assert(!JSON.stringify(rendered).includes("PRIVATE-NOTE")));
await check("an absent approved image is not replaced with fabricated media", () => assert(!/<img[^>]*class="hero-image-tag/.test(rendered.html)));
await check("article target is derived from the immutable candidate identity", () => { assert.equal(rendered.articlePath, "articles/world/editorial-" + id + ".html"); assert.equal(rendered.index.items[0].path, rendered.articlePath); });
await check("same timestamp and copy produce identical article artifacts", async () => assert.deepEqual(await prepareReviewedArticleFiles(fields), rendered));
await check("incomplete and unsafe source links cannot publish", async () => {
  for (const sources of [[], [{ url: "javascript:alert(1)" }], [{ url: "https://user:pass@example.invalid/" }]])
    await assert.rejects(prepareReviewedArticleFiles({ ...fields, version: { ...version, payload: { ...version.payload, sources } } }), /article_sources_pending/);
});
await check("unsupported multiple media and uncredited images remain pending", async () => {
  for (const media of [[{}, {}], [{ url: "/assets/unknown.png" }]]) await assert.rejects(prepareReviewedArticleFiles({ ...fields, version: { ...version, payload: { ...version.payload, media } } }), /article_media_contract_pending/);
});
let gitCalls = [], publicFiles = new Map([["data/article-index.json", JSON.stringify({ items: [] })]]), stagedTree, branchAdvanced = false, losePatch = false;
const head = "c".repeat(40), next = "d".repeat(40);
const mockGit = async (url, opts = {}) => {
  assert(url.startsWith("https://api.github.com/repos/BinaryVeer/drishvara-site/"));
  const path = url.split("/drishvara-site/")[1]; gitCalls.push({ path, method: opts.method || "GET", body: opts.body && JSON.parse(opts.body) });
  const ok = data => ({ ok: true, status: 200, json: async () => data });
  assert.equal(opts.headers["X-GitHub-Api-Version"], "2026-03-10");
  if (path === "git/ref/heads/main" && !opts.method) return ok({ object: { sha: head } });
  if (path.startsWith("contents/")) { const data = publicFiles.get(path.slice(9).split("?")[0]); return data === undefined ? { ok: false, status: 404 } : ok({ type: "file", encoding: "base64", content: Buffer.from(data).toString("base64") }); }
  if (path === "git/commits/" + head) return ok({ tree: { sha: "synthetic-parent-tree" } });
  if (path === "git/trees") { stagedTree = JSON.parse(opts.body).tree; return ok({ sha: "synthetic-next-tree" }); }
  if (path === "git/blobs") return ok({ sha: "e".repeat(40) });
  if (path === "git/commits") return ok({ sha: next });
  if (path === "git/refs/heads/main" && opts.method === "PATCH") {
    if (branchAdvanced) return { ok: false, status: 422 };
    for (const file of stagedTree) publicFiles.set(file.path, file.content);
    if (losePatch) { losePatch = false; throw Error("synthetic lost Git acknowledgment"); }
    return ok({ object: { sha: next } });
  }
  throw Error("Unexpected synthetic Git request: " + path);
};
const publisher = createEditorialArticlePublisher({ env: { EDITORIAL_GITHUB_OWNER: "BinaryVeer", EDITORIAL_GITHUB_REPO: "drishvara-site", EDITORIAL_GITHUB_BRANCH: "main", EDITORIAL_GITHUB_TOKEN: "synthetic-only" }, fetcher: mockGit });
let validations = 0;
await check("article, discovery and receipt are one non-forced atomic branch update", async () => {
  const r = await publisher({ job, timestamp, revalidate: async () => { validations++; } }); assert.equal(r.status, "article_committed");
  assert.equal(stagedTree.length, 3); assert.equal(gitCalls.filter(c => c.method === "PATCH").length, 1);
  assert.equal(gitCalls.at(-1).body.force, false); assert.equal(validations, 1);
  assert(stagedTree.every(f => f.path !== "data/homepage-ui.json"));
});
await check("completed Git replay reads the receipt and performs no write", async () => {
  gitCalls = []; await publisher({ job, timestamp, revalidate: async () => {} }); assert(gitCalls.every(c => c.method === "GET"));
});
await check("reviewed upload joins the same atomic Article commit without leaking private payload", async () => {
  const raster = syntheticReviewImage(), mediaJob = { ...job, version: { ...job.version, payload: { ...job.version.payload, media: [raster] } } };
  publicFiles.delete("data/editorial-release-receipts/" + id + ".json"); publicFiles.delete(rendered.articlePath); gitCalls = [];
  await publisher({ job: mediaJob, timestamp, revalidate: async () => {} });
  assert.equal(stagedTree.length, 4); assert(stagedTree.some(f => f.path === raster.url.slice(1) && f.sha === "e".repeat(40)));
  const blob = gitCalls.find(c => c.path === "git/blobs"); assert.equal(blob.body.encoding, "base64"); assert.equal(blob.body.content, raster.upload_png);
  assert(stagedTree.filter(f => f.content).every(f => !f.content.includes("upload_png") && !f.content.includes(raster.upload_png)));
});
await check("public receipt contains no person, decision or source-rights review notes", () => {
  const receipt = JSON.parse(publicFiles.get("data/editorial-release-receipts/" + id + ".json"));
  assert.deepEqual(Object.keys(receipt).sort(), ["candidate_id", "version_id", "content_hash", "binding_hash", "article_path", "article_hash"].sort());
});
await check("unrelated existing page cannot be overwritten", async () => {
  publicFiles.delete("data/editorial-release-receipts/" + id + ".json"); publicFiles.set(rendered.articlePath, "Unrelated protected content");
  await assert.rejects(publisher({ job, timestamp, revalidate: async () => {} }), /article_destination_conflict/);
  publicFiles.delete(rendered.articlePath);
});
await check("branch advancement is rejected, never force pushed", async () => {
  branchAdvanced = true; await assert.rejects(publisher({ job, timestamp, revalidate: async () => {} }), /article_branch_advanced/); branchAdvanced = false;
});
await check("revocation before the branch update prevents public mutation", async () => {
  gitCalls = []; await assert.rejects(publisher({ job, timestamp, revalidate: async () => { throw Error("revoked"); } }), /revoked/); assert(!gitCalls.some(c => c.method === "PATCH"));
});
await check("lost Git acknowledgment is recoverable through the exact receipt", async () => {
  losePatch = true; await assert.rejects(publisher({ job, timestamp, revalidate: async () => {} })); gitCalls = [];
  const r = await publisher({ job, timestamp, revalidate: async () => {} }); assert.equal(r.status, "article_committed"); assert(gitCalls.every(c => c.method === "GET"));
});
await check("wrong repository, branch or missing credentials cannot write", async () => {
  for (const env of [{}, { EDITORIAL_GITHUB_OWNER: "BinaryVeer", EDITORIAL_GITHUB_REPO: "drishvara-site", EDITORIAL_GITHUB_BRANCH: "another", EDITORIAL_GITHUB_TOKEN: "synthetic" },
    { GITHUB_OWNER: "BinaryVeer", GITHUB_REPO: "drishvara-site", GITHUB_BRANCH: "main", GITHUB_TOKEN: "synthetic-legacy-only" }])
    await assert.rejects(createEditorialArticlePublisher({ env, fetcher: () => { throw Error("must not contact Git"); } })({ job, timestamp }), /article_publisher_unavailable/);
});
await check("a tampered recovery receipt cannot redirect content reads to another path", async () => {
  const key = "data/editorial-release-receipts/" + id + ".json", original = publicFiles.get(key), receipt = JSON.parse(original);
  publicFiles.set(key, JSON.stringify({ ...receipt, article_path: "../../unexpected" })); gitCalls = [];
  await assert.rejects(publisher({ job, timestamp, revalidate: async () => {} }), /article_destination_conflict/);
  assert(!gitCalls.some(c => c.path.includes("unexpected"))); publicFiles.set(key, original);
});
const record = withSyntheticMeaning(syntheticWord(1));
const wordScopes = ["linguistic", "iast", "rights", "editorial", "context", "safety", "textual", "philosophical", "publisher_acceptance"];
const decisions = wordScopes.map(scope => ({ id: randomUUID(), scope }));
for (const d of decisions) {
  const ref = "editorial-decision:" + d.id; record.approval_record_refs.push(ref);
  if (d.scope === "iast") record.reviewed_publication_copy.iast_approval_ref = ref;
  const r = record.reviewed_publication_copy.reviews.find(r => r.kind === d.scope); if (r) r.approval_ref = ref;
}
const wordJob = { kind: "word", word_record_ref: candidateRef(record), version: { payload: { content: structuredClone(record.reviewed_publication_copy.content) } }, decisions };
const wordRpc = async (name, args) => { assert.equal(name, "editorial_registered_word"); assert.equal(args.p_ref, candidateRef(record)); return { data: record }; };
await check("Word delivery uses the existing canonical IST bank, not manual daily assignment", async () => {
  const r = await deliverReviewedWord({ job: wordJob, rpc: wordRpc, timestamp, revalidate: async () => {} }); assert.equal(r.status, "eligible_for_daily_selection"); assert(!Object.hasOwn(r, "date_key"));
});
await check("unregistered Word cannot be automatically approved or imported", async () => assert.rejects(deliverReviewedWord({ job: { ...wordJob, word_record_ref: null }, timestamp }), /approved_word_registration_pending/));
await check("registered Word still needs every existing engine/copy gate", async () => {
  record.production_approved = false; await assert.rejects(deliverReviewedWord({ job: wordJob, rpc: wordRpc, timestamp }), /approved_word_copy_mismatch/); record.production_approved = true;
});
await check("registered content must equal the exact workspace copy", async () => {
  const wrong = structuredClone(wordJob); wrong.version.payload.content.meaning_en = "Different synthetic copy";
  await assert.rejects(deliverReviewedWord({ job: wrong, rpc: wordRpc, timestamp }), /approved_word_copy_mismatch/);
});
await check("existing synthetic approvals cannot stand in for workspace decisions", async () => {
  const wrong = structuredClone(wordJob); wrong.decisions[0].id = randomUUID();
  await assert.rejects(deliverReviewedWord({ job: wrong, rpc: wordRpc, timestamp }), /word_approval_registration_mismatch/);
});
console.log(`Editorial controlled release: ${checks} synthetic contract/adapter checks passed. No hosted writes, real Git writes, word approvals or publication occurred.`);
