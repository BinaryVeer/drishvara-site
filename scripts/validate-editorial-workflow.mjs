import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { snapshotHash } from "./lib/ag70d-word-selection-engine.mjs";
import { editorialStage, articlePublicationProof, editorialWorkflowQueue, validWorkflowQuery } from "./lib/editorial-workflow.mjs";
import { reviewedCorrectionFeedback } from "./lib/editorial-learning-feedback.mjs";

// Offline synthetic flow/HTTP receipts only, never actual decisions or production publication.
let checks = 0;
async function check(name, run) { await run(); checks++; console.log("PASS workflow: " + name); }
const internal = value => ({ ok: true, ...value, public_output_allowed: false, runtime_activation: false });
const required = ["editorial", "rights", "factual", "safety", "media", "publisher_acceptance"];
const row = { id: randomUUID(), kind: "article", version_id: randomUUID(), content_hash: "sha256:" + "a".repeat(64), title: "Synthetic flow only", external_id: "synthetic-flow",
  desk: "world_affairs", publisher_decision: null, review_state: { required_scopes: required, approved_scopes: [], reviews_complete: false, pending_revision_tasks: 0 } };
const approve = (r, acceptance = true) => { r.review_state.approved_scopes = acceptance ? required : required.slice(0, -1); r.review_state.reviews_complete = acceptance; return r; };
const copy = () => structuredClone(row);
await check("Editor, Publisher acceptance and release are distinct effective stages", () => {
  assert.equal(editorialStage(row), "review"); assert.equal(editorialStage(approve(copy(), false)), "acceptance"); assert.equal(editorialStage(approve(copy())), "publishing");
});
await check("a Publisher return overrides earlier approvals without deleting them", () => {
  const r = approve(copy()); r.review_state.pending_revision_tasks = 1; assert.equal(editorialStage(r), "corrections"); assert.deepEqual(r.review_state.approved_scopes, required);
  r.review_state.pending_revision_tasks = 0; r.publisher_decision = "revise"; assert.equal(editorialStage(r), "corrections");
});
await check("rejection is retained outside ordinary pending work", () => assert.equal(editorialStage({ ...approve(copy()), publisher_decision: "reject" }), "rejected"));
await check("missing, duplicated and invented review contracts cannot fabricate a handoff", () => {
  for (const changes of [{ required_scopes: [] }, { approved_scopes: [...required, "editorial"] }, { approved_scopes: ["invented"] }, { reviews_complete: "true" }, { pending_revision_tasks: null }])
    assert.equal(editorialStage({ ...row, review_state: { ...row.review_state, ...changes } }), "blocked");
});
const q = { view: "review", kind: "all", desk: "all", after_id: null };
await check("queue accepts only declared views, kind, five sectors and cursor", () => {
  assert(validWorkflowQuery(q)); assert(validWorkflowQuery({ ...q, after_id: randomUUID(), desk: "sports" }));
  for (const change of [{ view: "publish" }, { desk: "technology" }, { kind: "word", desk: "sports" }, { after_id: "next" }, { actor_id: randomUUID() }, { approved: true }]) assert(!validWorkflowQuery({ ...q, ...change }));
});
const body = "<!doctype html><h1>Synthetic controlled Article</h1>";
const path = "articles/world/editorial-" + row.id + ".html";
const published = approve(copy());
published.article_delivery = { version_id: row.version_id, content_hash: row.content_hash, desk: row.desk, title: row.title,
  result: { status: "article_committed", reference: "b".repeat(40), path } };
const receipt = { candidate_id: row.id, version_id: row.version_id, content_hash: row.content_hash,
  binding_hash: snapshotHash({ candidate_id: row.id, version_id: row.version_id, content_hash: row.content_hash }), article_path: path, article_hash: snapshotHash(body) };
let publicCalls = [], receiptChange = null, pageBody = body, badMime = false;
const fetcher = async (url, options) => {
  publicCalls.push(url); assert(url.startsWith("https://www.drishvara.com/")); assert.equal(options.redirect, "error");
  assert.equal(options.cache, "no-store"); assert(!options.headers.Authorization && !options.headers.Cookie && !options.headers.apikey);
  const json = url.endsWith(".json"); return new Response(json ? JSON.stringify({ ...receipt, ...receiptChange }) : pageBody,
    { headers: { "Content-Type": badMime ? "text/plain" : json ? "application/json" : "text/html" } });
};
await check("a committed Article is Live only when the served receipt and exact bytes match", async () => {
  const p = await articlePublicationProof(published, fetcher); assert.equal(p.status, "live_verified"); assert.equal(p.version_id, row.version_id); assert.equal(publicCalls.length, 2);
});
for (const [name, changes] of [["stale version", { version_id: randomUUID() }], ["wrong hash", { content_hash: "sha256:" + "c".repeat(64) }],
  ["redirect path", { article_path: "https://attacker.invalid/" }], ["wrong binding", { binding_hash: "sha256:" + "c".repeat(64) }]]) await check("public receipt rejects " + name, async () => {
    receiptChange = changes; assert.equal(await articlePublicationProof(published, fetcher), null); receiptChange = null;
  });
await check("a soft 404/homepage or stale Article cannot be relabelled Live", async () => {
  pageBody = "<!doctype html><h1>Unrelated homepage</h1>"; assert.equal(await articlePublicationProof(published, fetcher), null); pageBody = body;
  badMime = true; assert.equal(await articlePublicationProof(published, fetcher), null); badMime = false;
});
await check("redirects, oversized streams and unreachable deployment stay pending", async () => {
  for (const f of [async () => { throw Error("synthetic-private-server-error"); }, async () => new Response("x".repeat(16001), { headers: { "Content-Type": "application/json" } }),
    async () => new Response("redirect", { status: 302, headers: { location: "https://attacker.invalid/" } })]) assert.equal(await articlePublicationProof(published, f), null);
});
await check("untrusted destination and mere delivery flags cannot cause public fetches", async () => {
  const original = publicCalls.length;
  for (const change of [{ ...published.article_delivery, result: { ...published.article_delivery.result, path: "../secrets" } }, { result: { status: "eligible_for_daily_selection" } }])
    assert.equal(await articlePublicationProof({ ...published, article_delivery: change }, fetcher), null);
  assert.equal(publicCalls.length, original);
});
const rpcFor = records => async (name, args) => {
  assert.equal(name, "editorial_workflow_queue"); assert.equal(args.p_after, null);
  return internal({ items: records.map(r => ({ ...r, stage: editorialStage(r) })), next_cursor: null });
};
await check("verified publication leaves Publisher pendency and appears in Live Repository", async () => {
  const rpc = rpcFor([published]); const a = await editorialWorkflowQueue({ query: { ...q, view: "delivery" }, rpc, fetcher });
  assert.equal(a.items.length, 0); const b = await editorialWorkflowQueue({ query: { ...q, view: "live" }, rpc, fetcher });
  assert.equal(b.items.length, 1); assert.equal(b.items[0].workflow.stage, "live"); assert.equal(b.public_output_allowed, false); assert.equal(b.runtime_activation, false);
});
await check("an unpublished correction does not overwrite or hide the older live copy", async () => {
  const r = { ...published, version_id: randomUUID(), content_hash: "sha256:" + "d".repeat(64), review_state: row.review_state };
  const rpc = rpcFor([r]); const pending = await editorialWorkflowQueue({ query: q, rpc, fetcher }); assert.equal(pending.items[0].workflow.stage, "review");
  const live = await editorialWorkflowQueue({ query: { ...q, view: "live" }, rpc, fetcher }); assert.equal(live.items[0].workflow.publication.version_id, row.version_id);
});
await check("unconfirmed deployment stays in release, not in the Live Repository", async () => {
  const fail = async () => { throw Error("synthetic-only"); }, rpc = rpcFor([published]);
  const pending = await editorialWorkflowQueue({ query: { ...q, view: "delivery" }, rpc, fetcher: fail }); assert.equal(pending.items[0].workflow.delivery_pending, true);
  assert.equal((await editorialWorkflowQueue({ query: { ...q, view: "live" }, rpc, fetcher: fail })).items.length, 0);
});
await check("daily eligibility is never confused with an actual Word publication event", async () => {
  const r = { ...copy(), kind: "word", desk: null, review_state: { required_scopes: ["linguistic", "iast", "rights", "editorial", "context", "safety", "textual", "philosophical", "publisher_acceptance"],
    approved_scopes: ["linguistic", "iast", "rights", "editorial", "context", "safety", "textual", "philosophical", "publisher_acceptance"], pending_revision_tasks: 0, reviews_complete: true } };
  assert.equal((await editorialWorkflowQueue({ query: { ...q, view: "live" }, rpc: rpcFor([r]) })).items.length, 0);
  r.word_publication = { date_key: "2026-11-04", timezone: "Asia/Kolkata", version_id: r.version_id, content_hash: r.content_hash, publication_event_id: "synthetic-publication-only",
    content: { sanskrit: "Synthetic", iast: null, english: "Synthetic", hindi: "Synthetic", meaning_en: "Synthetic meaning", meaning_hi: "Synthetic meaning", private_note: "never-return" } };
  const live = await editorialWorkflowQueue({ query: { ...q, view: "live" }, rpc: rpcFor([r]) });
  assert.equal(live.items[0].workflow.publication.status, "published_history"); assert.equal(live.items[0].workflow.publication.date_key, "2026-11-04"); assert(!JSON.stringify(live).includes("private_note"));
});
await check("malformed RPC envelopes fail closed and cannot assert client authority", async () => {
  for (const data of [internal({ items: [row], next_cursor: "bad" }), internal({ items: Array(11).fill(row), next_cursor: null }), { ok: true, items: [], next_cursor: null, public_output_allowed: true }])
    await assert.rejects(editorialWorkflowQueue({ query: q, rpc: async () => data }), /workflow_state_unavailable/);
  let calls = 0; const r = await editorialWorkflowQueue({ query: { ...q, actor_id: randomUUID() }, rpc: async () => { calls++; } }); assert.equal(r.ok, false); assert.equal(calls, 0);
});
await check("successful handoff leaves Publisher work before public availability is claimed", async () => {
  assert.equal(editorialStage(published), "delivery");
  const rpc = rpcFor([published]), fail = async () => { throw Error(); };
  assert.equal((await editorialWorkflowQueue({ query: { ...q, view: "publishing" }, rpc, fetcher: fail })).items.length, 0);
  const r = { ...copy(), kind: "word", review_state: { ...row.review_state,
    required_scopes: ["linguistic", "iast", "rights", "editorial", "context", "safety", "textual", "philosophical", "publisher_acceptance"],
    approved_scopes: ["linguistic", "iast", "rights", "editorial", "context", "safety", "textual", "philosophical", "publisher_acceptance"], reviews_complete: true } };
  r.word_delivery = { version_id: r.version_id, content_hash: r.content_hash, result: { status: "eligible_for_daily_selection", reference: "editorial-word:" + r.id + "@" + r.version_id } };
  assert.equal(editorialStage(r), "daily_queue");
  assert.equal((await editorialWorkflowQueue({ query: { ...q, view: "delivery" }, rpc: rpcFor([r]) })).items[0].workflow.stage, "daily_queue");
});
await check("reopened reviews remain pending even if that same version was previously published", async () => {
  const r = { ...published, review_state: row.review_state };
  const output = await editorialWorkflowQueue({ query: q, rpc: rpcFor([r]), fetcher }); assert.equal(output.items[0].workflow.stage, "review");
  assert.equal(output.items[0].workflow.publication.status, "live_verified");
});
const feedbackOpen = { candidate: { id: row.id, kind: "article" }, version: { id: row.version_id, content_hash: row.content_hash, title: row.title },
  review_state: { ...approve(copy()).review_state, decision_refs: [randomUUID()] } };
const feedbackTask = { id: randomUUID(), candidate_id: row.id, status: "submitted", instructions: "Synthetic correction: replace the unsupported figure with an authenticated comparison.",
  resolution: { kind: "submitted", comparison_acknowledged: true, result_version_id: row.version_id } };
await check("resolved, reviewed correction uses the actual existing extractor and stable provenance", () => {
  const packet = reviewedCorrectionFeedback(feedbackOpen, [feedbackTask]); assert(packet.candidate_lessons.length > 0);
  assert.deepEqual(packet.correction_task_refs, [feedbackTask.id]); assert.deepEqual(packet.review_decision_refs, feedbackOpen.review_state.decision_refs);
  assert(packet.candidate_lessons.every(l => l.status === "candidate")); assert.equal(packet.promotion_allowed, false);
  assert.equal(packet.automatic_copy_changes_allowed, false); assert.equal(packet.public_output_allowed, false);
  assert.deepEqual(reviewedCorrectionFeedback(feedbackOpen, [feedbackTask]), packet);
});
await check("unreviewed, stale, cancelled or unchecked correction feedback cannot be exported", () => {
  for (const task of [{ ...feedbackTask, status: "open" }, { ...feedbackTask, candidate_id: randomUUID() }, { ...feedbackTask, resolution: { ...feedbackTask.resolution, result_version_id: randomUUID() } },
    { ...feedbackTask, resolution: { ...feedbackTask.resolution, comparison_acknowledged: false } }]) assert.throws(() => reviewedCorrectionFeedback(feedbackOpen, [task]), /reviewed_feedback_pending/);
  assert.throws(() => reviewedCorrectionFeedback({ ...feedbackOpen, review_state: row.review_state }, [feedbackTask]), /reviewed_feedback_pending/);
});
console.log(`Editorial stage workflow: ${checks} offline synthetic transition/public-proof checks passed. No publication or approvals.`);
