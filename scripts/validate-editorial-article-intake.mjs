import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { articleProductionBlockers, articleQualityReviewBlocker } from "./lib/editorial-article-qualification.mjs";
import { articleIntakeBatchError, submitPreparedArticles } from "./lib/editorial-article-intake.mjs";
import { syntheticQualifiedArticle, syntheticArticleQualityDecision } from "./lib/editorial-review-test-fixtures.mjs";
import { snapshotHash } from "./lib/ag70d-word-selection-engine.mjs";

// Offline synthetic fixtures only. No human decisions, provider calls, hosted data or Git writes.
let checks = 0;
async function check(name, run) { await run(); checks++; console.log("PASS Article intake: " + name); }
const internal = value => ({ ok: true, ...value, public_output_allowed: false, runtime_activation: false });
const command = (desk = "world_affairs") => ({ action: "intake", command_id: randomUUID(), kind: "article", external_id: "synthetic-prepared-" + randomUUID(),
  expected_version_id: null, title: "Synthetic private Article only", payload: { ...syntheticQualifiedArticle(), desk } });
const session = { ok: true, capabilities: [{ kind: "article", scope: "intake" }] };
const version = { id: randomUUID(), content_hash: "sha256:" + "a".repeat(64) };
const decision = syntheticArticleQualityDecision(version, randomUUID());
const quality = (d = decision, refs = [d.id], v = version) => articleQualityReviewBlocker({ version: v, decisions: [d], decisionRefs: refs });

await check("complete structure remains only mechanically eligible", () => assert.deepEqual(articleProductionBlockers(command().payload), []));
for (const [words, allowed] of [[1499, false], [1500, true], [5500, true], [5501, false]]) await check("inclusive body word-count boundary " + words, () => {
  const p = command().payload; p.body = "synthetic ".repeat(words);
  assert.equal(articleProductionBlockers(p).includes("article_long_form_length_pending"), !allowed);
});
for (const [name, sources] of [
  ["absent", []], ["single", ["https://example.invalid/a"]], ["six", Array.from({ length: 6 }, (_, i) => "https://example.invalid/" + i)],
  ["duplicate", ["https://example.invalid/a", "https://example.invalid/a"]],
  ["fragment aliases", ["https://example.invalid/a#one", "https://example.invalid/a#two"]],
  ["extra duplicate", ["https://example.invalid/a", "https://example.invalid/b", "https://example.invalid/a"]],
  ["HTTP", ["http://example.invalid/a", "https://example.invalid/b"]],
  ["credentialed", ["https://user:secret@example.invalid/a", "https://example.invalid/b"]], ["malformed", [{ title: "No URL" }, "https://example.invalid/b"]]
]) await check("source gate rejects " + name, () => assert(articleProductionBlockers({ ...command().payload, sources }).includes("article_sources_pending")));
for (const count of [2, 5]) await check("source gate accepts " + count + " distinct pointers, not their truth", () => {
  assert(!articleProductionBlockers({ ...command().payload, sources: Array.from({ length: count }, (_, i) => ({ url: "https://example.invalid/" + i })) }).includes("article_sources_pending"));
});
await check("layout, positioned outline, credited hero and enrichment are mandatory", () => {
  for (const mutate of [p => { delete p.layout; }, p => { p.layout.sections = []; }, p => { p.media[0].attribution = ""; },
    p => { p.layout.objects = p.layout.objects.filter(o => o.type !== "image"); }, p => { p.layout.objects = p.layout.objects.filter(o => o.type !== "takeaways"); }]) {
    const p = command().payload; mutate(p); assert(articleProductionBlockers(p).length > 0);
  }
});
await check("exact 85/80 human-decision simulation satisfies scores only", () => assert.equal(quality(), null));
for (const [key, value] of [["quality_score", 84], ["visitor_value_score", 79]]) await check("threshold veto " + key, () => {
  const d = structuredClone(decision), note = JSON.parse(d.note); note[key] = value; d.note = JSON.stringify(note);
  assert.equal(quality(d), "article_quality_threshold_pending");
});
for (const [name, mutate] of [
  ["plain approval label", d => { d.note = "Approved"; }], ["unknown contract", d => { const n = JSON.parse(d.note); n.contract_version = "next"; d.note = JSON.stringify(n); }],
  ["fractional score", d => { const n = JSON.parse(d.note); n.quality_score = 99.5; d.note = JSON.stringify(n); }],
  ["out-of-range score", d => { const n = JSON.parse(d.note); n.quality_score = 101; d.note = JSON.stringify(n); }],
  ["string score", d => { const n = JSON.parse(d.note); n.quality_score = "99"; d.note = JSON.stringify(n); }],
  ["null score", d => { const n = JSON.parse(d.note); n.quality_score = null; d.note = JSON.stringify(n); }],
  ["extra approval field", d => { const n = JSON.parse(d.note); n.approved = true; d.note = JSON.stringify(n); }],
  ["blank rationale", d => { const n = JSON.parse(d.note); n.rationale = " "; d.note = JSON.stringify(n); }],
  ["old version", d => { d.version_id = randomUUID(); }], ["wrong hash", d => { d.content_hash = "sha256:" + "b".repeat(64); }],
  ["different scope", d => { d.scope = "rights"; }], ["revision decision", d => { d.decision = "revise"; }]
]) await check("quality gate rejects " + name, () => { const d = structuredClone(decision); mutate(d); assert.equal(quality(d), "article_quality_review_pending"); });
await check("stale or duplicate effective decisions cannot fabricate scores", () => {
  assert.equal(quality(decision, []), "article_quality_review_pending");
  assert.equal(articleQualityReviewBlocker({ version, decisions: [decision, { ...decision, id: randomUUID() }], decisionRefs: [decision.id] }), null);
  assert.equal(articleQualityReviewBlocker({ version, decisions: [decision, decision], decisionRefs: [decision.id] }), "article_quality_review_pending");
  assert.equal(articleQualityReviewBlocker({ version: { ...version, payload: { quality_score: 100, approved: true } }, decisions: [], decisionRefs: [] }), "article_quality_review_pending");
});
await check("all five actual desks can enter a fresh pending batch", () => assert.equal(articleIntakeBatchError([
  "world_affairs", "public_programmes", "media_society", "spirituality", "sports"].map(command)), null));
for (const [name, build] of [
  ["empty", () => []], ["six", () => Array.from({ length: 6 }, () => command())],
  ["duplicate command", () => { const c = command(); return [c, c]; }],
  ["duplicate identity", () => { const c = command(); return [c, { ...command("sports"), external_id: c.external_id }]; }],
  ["duplicate desk", () => [command(), command()]], ["Word", () => [{ ...command(), kind: "word" }]],
  ["revision", () => [{ ...command(), expected_version_id: randomUUID() }]], ["caller approval", () => [{ ...command(), approved: true }]],
  ["oversized", () => { const c = command(); c.payload.body = "synthetic ".repeat(30000); return [c]; }]
]) await check("batch rejects " + name, () => assert.notEqual(articleIntakeBatchError(build()), null));

function store() {
  const rows = new Map(), commands = new Map(), calls = [];
  let failAt = null, failOpen = false, mismatch = false, malformed = false;
  const rpc = async (name, { p_command: c }) => {
    assert.equal(name, "editorial_review_command"); assert(["intake", "open"].includes(c.action)); calls.push(c);
    if (c.action === "intake") {
      if (!commands.has(c.command_id)) {
        const r = internal({ candidate_id: randomUUID(), version_id: randomUUID(), content_hash: snapshotHash(c.payload) }); commands.set(c.command_id, r);
        rows.set(r.candidate_id, internal({ candidate: { id: r.candidate_id, kind: "article", external_id: c.external_id },
          version: { id: r.version_id, content_hash: r.content_hash, title: c.title, payload: structuredClone(c.payload) } }));
      }
      if (c.command_id === failAt) throw Error("synthetic-secret-not-for-client");
      return malformed ? internal({ candidate_id: "synthetic-secret-not-for-client", version_id: "bad", content_hash: "bad" }) : commands.get(c.command_id);
    }
    if (failOpen) throw Error("synthetic-readback-loss");
    const opened = structuredClone(rows.get(c.candidate_id)); if (mismatch) opened.version.payload.body += " Changed concurrently."; return opened;
  };
  return { rpc, rows, calls, set: options => { ({ failAt = null, failOpen = false, mismatch = false, malformed = false } = options); } };
}
await check("missing intake capability and a browser Admin flag grant no authority", async () => {
  for (const s of [null, { ok: true, is_administrator: true }, { ok: true, capabilities: [{ kind: "word", scope: "intake" }] }]) {
    const sdb = store(), r = await submitPreparedArticles({ commands: [command()], session: s, rpc: sdb.rpc });
    assert.equal(r.code, "editorial_intake_denied"); assert.equal(sdb.calls.length, 0);
  }
});
await check("the entire batch is checked before the first write", async () => {
  const sdb = store(), bad = command("sports"); bad.payload.sources = [];
  const r = await submitPreparedArticles({ commands: [command(), bad], session, rpc: sdb.rpc }); assert.equal(r.ok, false); assert.equal(sdb.calls.length, 0);
});
await check("authenticated intake verifies exact readback and replays the same IDs without duplicates", async () => {
  const sdb = store(), commands = [command(), command("sports")];
  const first = await submitPreparedArticles({ commands, session, rpc: sdb.rpc }); assert.equal(first.ok, true); assert.equal(first.receipts.length, 2);
  const again = await submitPreparedArticles({ commands, session, rpc: sdb.rpc }); assert.deepEqual(again, first); assert.equal(sdb.rows.size, 2);
  assert.equal(first.public_output_allowed, false); assert.equal(first.runtime_activation, false);
  assert(sdb.calls.every(c => c.action === "intake" || c.action === "open"));
});
await check("partial commit and lost acknowledgment return reconciliation, never fictitious rollback", async () => {
  const sdb = store(), commands = [command(), command("sports")]; sdb.set({ failAt: commands[1].command_id });
  const r = await submitPreparedArticles({ commands, session, rpc: sdb.rpc }); assert.equal(r.code, "article_intake_reconciliation_required");
  assert.equal(r.receipts.length, 1); assert.equal(r.uncertain_command_id, commands[1].command_id); assert.equal(sdb.rows.size, 2);
  assert(!JSON.stringify(r).includes("synthetic-secret")); sdb.set({});
  const retry = await submitPreparedArticles({ commands, session, rpc: sdb.rpc }); assert.equal(retry.ok, true); assert.equal(sdb.rows.size, 2);
});
for (const option of ["failOpen", "mismatch", "malformed"]) await check("readback " + option + " cannot claim a verified intake", async () => {
  const sdb = store(); sdb.set({ [option]: true }); const r = await submitPreparedArticles({ commands: [command()], session, rpc: sdb.rpc });
  assert.equal(r.code, "article_intake_reconciliation_required"); assert.equal(r.receipts.length, 0); assert.equal(r.public_output_allowed, false);
  assert(!JSON.stringify(r).includes("synthetic-secret")); if (option === "malformed") assert.equal(r.observed_receipt, null);
});
console.log(`Article intake and qualification: ${checks} offline synthetic checks passed. No content approved or published.`);
