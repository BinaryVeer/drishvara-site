import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { webcrypto } from "node:crypto";
import { execFileSync } from "node:child_process";
import { createWordPublicFeedHandler, readPublicWord } from "./lib/ag70e-word-public-feed.mjs";
import { WORD_CONTRACT, copySnapshot, snapshotHash } from "./lib/ag70d-word-selection-engine.mjs";
import { executeWordAssignment } from "./lib/ag70d-word-assignment-store.mjs";
import { createSyntheticWordStore } from "./lib/ag70d-word-assignment-test-adapter.mjs";
import { syntheticPublication, syntheticSelection, syntheticApproval, syntheticIdentityRef } from "./lib/ag70e-word-test-fixtures.mjs";

// Synthetic records only; no hosted requests, verified lexical claims or production writes.
const baseline = "7437ebbfca134d8f490828e392d561621cf097ea";
const timestamp = "2026-10-23T10:00:00.000Z", fixture = await syntheticPublication();
const readSnapshot = async () => ({ history: fixture.history, release: fixture.release });
let checks = 0;
async function check(name, run) { await run(); checks++; console.log("PASS " + name); }
const request = (method = "GET", suffix = "", headers) => new Request("https://synthetic.invalid/functions/v1/word-of-day" + suffix, { method, headers });
const handler = options => createWordPublicFeedHandler({ readSnapshot, enabled: true, now: () => timestamp, ...options });
const read = path => fs.readFileSync(path, "utf8");

async function publicationWithMetadata(mutate) {
  const input = syntheticSelection(1), store = createSyntheticWordStore(syntheticIdentityRef);
  mutate(input.bank.records[0]);
  // Hash-bound review records below are fabricated test approvals, never bank evidence.
  for (const review of input.bank.records[0].reviewed_publication_copy.reviews) {
    if (review.review_status === "approved") review.content_hash = snapshotHash(input.bank.records[0].reviewed_publication_copy.content);
  }
  const authorization = { ...syntheticApproval, trust_boundary: "server_only", actor_ref: "synthetic-feed-test",
    capabilities: ["reserve", "authorize", "record_publication"], simulation_only: true };
  let previous;
  for (const operation of authorization.capabilities) {
    input.history = await store.readHistory(); input.expected_history_ref = input.history.snapshot_ref;
    const command = { contract_version: WORD_CONTRACT, operation, idempotency_key: "synthetic-feed-" + operation, timestamp: "2026-10-23T01:00:00.000Z" };
    if (previous) Object.assign(command, { assignment_id: previous.assignment.assignment_id, proposal_id: previous.assignment.proposal_id,
      expected_last_event_id: input.history.events.at(-1).event_id, decision: syntheticApproval });
    previous = await executeWordAssignment({ adapter: store, authorization, command, selection_input: input });
    assert.equal(previous.status, "committed");
  }
  const history = await store.readHistory();
  return { history, release: { ...syntheticApproval, public_output_allowed: true, runtime_activation: true,
    approved_publication_event_refs: [history.events.at(-1).event_id] } };
}

await check("dormant by default without calling a reader", async () => {
  let calls = 0;
  const response = await handler({ enabled: false, readSnapshot: () => { calls++; throw Error(); } })(request());
  assert.equal(response.status, 503); assert.equal((await response.json()).public_output_allowed, false); assert.equal(calls, 0);
});
await check("one approved synthetic published record, unchanged F2 contract and hash", async () => {
  const response = await handler()(request()), output = await response.json();
  assert.equal(response.status, 200); assert.equal(output.status, "published"); assert.equal(output.date_key, "2026-10-23");
  assert.equal(output.assignment.copy_content_hash, fixture.output.assignment.copy_content_hash);
  const window = { crypto: webcrypto };
  vm.runInNewContext(read("assets/js/drishvara-v2-homepage.js"), { window, document: {}, Intl, Date, URL, Map, Set, TextEncoder, Uint8Array });
  assert.equal((await window.DrishvaraV2Homepage.approvedWordPublication(output, new Date(timestamp))).english, "Synthetic word 1");
});
await check("all success and withholding responses prohibit browser and CDN caching", async () => {
  for (const options of [{}, { enabled: false }, { readSnapshot: async () => { throw Error("synthetic-private-db-error"); } }]) {
    const response = await handler(options)(request());
    assert.equal(response.headers.get("cache-control"), "no-store, max-age=0");
    for (const name of ["cdn-cache-control", "vercel-cdn-cache-control"]) assert.equal(response.headers.get(name), "no-store");
    assert.equal(response.headers.get("etag"), null);
    assert(!(await response.text()).includes("synthetic-private-db-error"));
  }
});
await check("HEAD has identical read-only status/headers but no body", async () => {
  const response = await handler()(request("HEAD"));
  assert.equal(response.status, 200); assert.equal(await response.text(), ""); assert.equal(response.headers.get("cache-control"), "no-store, max-age=0");
});
for (const method of ["POST", "PUT", "PATCH", "DELETE", "OPTIONS"]) await check(method + " cannot reach the database", async () => {
  let calls = 0;
  const response = await handler({ readSnapshot: () => { calls++; } })(request(method));
  assert.equal(response.status, 405); assert.equal(response.headers.get("allow"), "GET, HEAD"); assert.equal(calls, 0);
  assert.equal(response.headers.get("cache-control"), "no-store, max-age=0");
});
for (const query of ["?date_key=2026-10-22", "?operation=reserve", "?operation=authorize", "?operation=record_publication"]) {
  await check(query + " is rejected without database access", async () => {
    let calls = 0;
    assert.equal((await handler({ readSnapshot: () => { calls++; } })(request("GET", query))).status, 400); assert.equal(calls, 0);
  });
}
await check("each accepted read resolves its canonical date on the server", async () => {
  const dates = [];
  for (const time of ["2026-10-23T18:29:59.999Z", "2026-10-23T18:30:00.000Z"]) {
    await handler({ now: () => time, readSnapshot: async date => { dates.push(date); return readSnapshot(); } })(request());
  }
  assert.deepEqual(dates, ["2026-10-23", "2026-10-24"]);
});
await check("midnight during a read withholds the previous day without retry or write", async () => {
  let clock = 0, calls = 0;
  const response = await handler({ now: () => ["2026-10-23T18:29:59.999Z", "2026-10-23T18:30:00.000Z"][clock++],
    readSnapshot: async () => { calls++; return readSnapshot(); } })(request());
  const body = await response.json(); assert.equal(response.status, 503); assert.equal(body.status, "withheld");
  assert.equal(body.date_key, "2026-10-24"); assert.equal(body.assignment, null); assert.equal(calls, 1);
});
await check("next-day read never falls back to yesterday's published word", async () => {
  const body = await (await handler({ now: () => "2026-10-23T18:30:00.000Z" })(request())).json();
  assert.equal(body.status, "withheld"); assert.equal(body.assignment, null); assert.equal(body.date_key, "2026-10-24");
});
await check("future publication cannot leak before its recorded timestamp", async () => {
  assert.equal((await readPublicWord({ readSnapshot, enabled: true, timestamp: "2026-10-23T00:59:59.999Z" })).status, "withheld");
});
await check("pending release, missing history and revoked/unavailable snapshot stay withheld", async () => {
  for (const snapshot of [{ ...fixture, release: { ...fixture.release, review_status: "pending" } },
    { ...fixture, history: null }, { ...fixture, release: { ...fixture.release, approved_publication_event_refs: [] } }]) {
    const output = await readPublicWord({ readSnapshot: async () => snapshot, timestamp, enabled: true });
    assert.equal(output.status, "withheld"); assert.equal(output.assignment, null); assert.equal(output.runtime_activation, false);
  }
  const response = await handler({ readSnapshot: async () => { throw Error("synthetic-revoked-source"); } })(request());
  assert.equal(response.status, 503); assert(!(await response.text()).includes("synthetic-revoked-source"));
});
await check("draft/review notes and raw snapshots are not in the published response", async () => {
  const snapshot = await publicationWithMetadata(record => {
    record.private_notes = "synthetic-private-draft";
    record.reviewed_publication_copy.review_notes = "synthetic-private-copy-review";
    record.reviewed_publication_copy.reviews[0].notes = "synthetic-private-linguistic-review";
  });
  const output = await readPublicWord({ readSnapshot: async () => snapshot, timestamp, enabled: true });
  assert.equal(output.status, "published"); assert(!JSON.stringify(output).includes("synthetic-private"));
  assert.equal(output.history, undefined); assert.equal(output.release, undefined); assert.equal(output.assignment.snapshot, undefined);
});
await check("pending review metadata cannot displace the matching approved review", async () => {
  const snapshot = await publicationWithMetadata(record => {
    record.reviewed_publication_copy.reviews.unshift({ kind: "linguistic", review_status: "pending", notes: "synthetic-private" });
  });
  const output = await readPublicWord({ readSnapshot: async () => snapshot, timestamp, enabled: true });
  assert.equal(output.status, "published"); assert.equal(output.assignment.reviewed_copy.reviews.length, 5);
  assert(output.assignment.reviewed_copy.reviews.every(review => review.review_status === "approved"));
});
for (const field of ["content", "source"]) await check("unknown hash-bound " + field + " fields are withheld, never stripped/reapproved", async () => {
  const snapshot = await publicationWithMetadata(record => {
    const copy = record.reviewed_publication_copy.content;
    (field === "content" ? copy : copy.sources[0]).notes = "synthetic-private-hash-bound";
  });
  const output = await readPublicWord({ readSnapshot: async () => snapshot, timestamp, enabled: true });
  assert.equal(output.status, "withheld"); assert.equal(output.reason, "public_copy_contract_unavailable");
  assert(!JSON.stringify(output).includes("synthetic-private"));
});
await check("only an exact approved HTTPS origin receives CORS, never credential permission", async () => {
  const origin = "https://www.drishvara.com";
  const response = await handler({ allowedOrigin: origin })(request("GET", "", { Origin: origin }));
  assert.equal(response.status, 200); assert.equal(response.headers.get("access-control-allow-origin"), origin);
  assert.equal(response.headers.get("access-control-allow-credentials"), null);
  let calls = 0;
  for (const allowedOrigin of [null, "*", "http://www.drishvara.com", origin + "/"]) {
    assert.equal((await handler({ allowedOrigin, readSnapshot: () => { calls++; } })(request("GET", "", { Origin: origin }))).status, 403);
  }
  assert.equal((await handler({ allowedOrigin: origin, readSnapshot: () => { calls++; } })(request("GET", "", { Origin: "https://other.invalid" }))).status, 403);
  assert.equal(calls, 0);
});
await check("conditional headers never produce a stale 304 response", async () => {
  let calls = 0;
  const response = await handler({ readSnapshot: async () => { calls++; return readSnapshot(); } })(request("GET", "", { "If-None-Match": "synthetic-etag" }));
  assert.equal(response.status, 200); assert.equal(calls, 1); assert.equal((await response.json()).date_key, "2026-10-23");
});
await check("malformed clock or snapshot cannot expose an error or published record", async () => {
  for (const options of [{ now: () => "invalid" }, { now: () => { throw Error("synthetic-private-clock"); } }, { readSnapshot: async () => null }]) {
    const response = await handler(options)(request()), text = await response.text(), output = JSON.parse(text);
    assert.equal(output.status, "withheld"); assert.equal(output.assignment, null); assert(!text.includes("synthetic-private"));
  }
});
await check("per-isolate read capacity is bounded and released after completion or failure", async () => {
  const readers = [];
  const limited = handler({ readSnapshot: () => new Promise(resolve => readers.push(resolve)) });
  const running = Array.from({ length: 4 }, () => limited(request()));
  assert.equal(readers.length, 4);
  const busy = await limited(request());
  assert.equal(busy.status, 429); assert.equal(busy.headers.get("retry-after"), "15");
  assert.equal((await busy.json()).public_output_allowed, false); assert.equal(readers.length, 4);
  readers.splice(0).forEach(resolve => resolve({ history: fixture.history, release: fixture.release }));
  assert((await Promise.all(running)).every(response => response.status === 200));
  const recovered = limited(request()); readers.shift()(null);
  assert.equal((await recovered).status, 200);
});
await check("Edge transport is default-dormant and can call only the release-snapshot RPC", async () => {
  const previous = globalThis.Deno, oldFetch = globalThis.fetch, calls = [];
  let edge;
  const key = "synthetic-server-secret-not-a-real-key";
  const env = { WORD_PUBLIC_FEED_ENABLED: "false", SUPABASE_URL: "https://synthetic.invalid", SUPABASE_SERVICE_ROLE_KEY: key };
  globalThis.Deno = { env: { get: name => env[name] }, serve: fn => { edge = fn; } };
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    assert.equal(url, "https://synthetic.invalid/rest/v1/rpc/word_assignment_release_snapshot");
    assert.equal(options.headers.Authorization, "Bearer " + key);
    return new Response(JSON.stringify(await readSnapshot()), { status: 200 });
  };
  const RealDate = globalThis.Date;
  globalThis.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : [timestamp])); } };
  try {
    const target = new URL("../supabase/functions/word-of-day/index.ts", import.meta.url);
    await import(target.href + "?synthetic=disabled"); assert.equal((await edge(request())).status, 503); assert.equal(calls.length, 0);
    env.WORD_PUBLIC_FEED_ENABLED = "true";
    await import(target.href + "?synthetic=enabled");
    const response = await edge(request("GET", "", { Authorization: "Bearer synthetic-caller-token" }));
    const text = await response.text(); assert.equal(JSON.parse(text).status, "published"); assert(!text.includes(key));
    assert.equal(calls.length, 1); assert.deepEqual(JSON.parse(calls[0].options.body), { p_date: "2026-10-23" });
    assert.equal(calls[0].options.redirect, "error");
    assert.equal((await edge(request("POST"))).status, 405); assert.equal(calls.length, 1);
  } finally { globalThis.Date = RealDate; globalThis.fetch = oldFetch; if (previous === undefined) delete globalThis.Deno; else globalThis.Deno = previous; }
});
await check("protected Panchang, migrations, banks and activation settings are unchanged", () => {
  const paths = ["supabase/config.toml", "supabase/functions/calculate-panchang/index.ts",
    "supabase/migrations/20261023_word_assignment_preparation.sql", "generated/word-of-day-publication.json"];
  const manifest = JSON.parse(read("data/knowledge-base/word-of-day/production/knowledge-bank/ag70e-word-production-knowledge-bank-foundation-manifest.json"));
  const contractPath = "data/knowledge-base/word-of-day/production/knowledge-bank/word-output-record-contract.json";
  paths.push(...Object.values(manifest.banks).filter(path => path !== contractPath));
  for (const path of paths) assert.equal(read(path), execFileSync("git", ["show", baseline + ":" + path], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 }), path);
  const contract = JSON.parse(read(contractPath));
  assert.equal(contract.governed_publication_contract.prepared_public_delivery.activation_default, false);
  delete contract.governed_publication_contract.prepared_public_delivery;
  assert.deepEqual(contract, JSON.parse(execFileSync("git", ["show", baseline + ":" + contractPath], { encoding: "utf8" })));
  assert.equal(JSON.parse(read("generated/word-of-day-publication.json")).status, "withheld");
  const configPath="data/knowledge-base/word-of-day/production/methodology/ag70d-word-release-configuration.json";
  const current=JSON.parse(read(configPath));
  assert.equal(current.standing_authorization.enabled,false); assert.equal(current.standing_authorization.production_approval_ref,null);
  delete current.publisher_policy; delete current.standing_authorization;
  assert.deepEqual(current,JSON.parse(execFileSync("git",["show",baseline+":"+configPath],{encoding:"utf8"})));
});

const feedUrl = "https://pajlabwwszmhjhabxprf.supabase.co/functions/v1/word-of-day";
function deliveryFixture(endpoint = "", fetcher = async () => new Response("{}")) {
  let clock = timestamp, nextTimer = 0;
  const nodes = new Map(["f2-word-state", "f2-word-description", "f2-word-note"].map(id => [id, { textContent: "", innerHTML: "" }]));
  const timers = new Map(), calls = [];
  const window = { crypto: webcrypto, DrishvaraV2Shell: { escapeHtml: value => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;") },
    setTimeout(fn, ms) { timers.set(++nextTimer, { fn, ms }); return nextTimer; }, clearTimeout(id) { timers.delete(id); } };
  class Clock extends Date { constructor(...args) { super(...(args.length ? args : [clock])); } }
  vm.runInNewContext(read("assets/js/drishvara-v2-homepage.js"), {
    window, document: { getElementById: id => nodes.get(id), querySelector: () => ({ getAttribute: () => endpoint }) },
    fetch: (url, options) => { calls.push({ url, options }); return fetcher(url, options); },
    Intl, Date: Clock, URL, Map, Set, TextEncoder, Uint8Array, AbortSignal
  });
  return { api: window.DrishvaraV2Homepage, nodes, timers, calls, clock: value => { clock = value; } };
}
await check("checked-in homepage connector is dormant, not a production activation", () => {
  assert(read("index.html").includes('<meta name="drishvara-word-feed" content="" />'));
  assert.equal(deliveryFixture().api.configuredWordFeed(), null);
});
await check("only the exact public read-only endpoint is accepted", () => {
  for (const value of [feedUrl + "?operation=reserve", feedUrl + "/", "http://synthetic.invalid/", "javascript:alert(1)", "https://other.invalid/"]) {
    assert.equal(deliveryFixture(value).api.configuredWordFeed(), null);
  }
  assert.equal(deliveryFixture(feedUrl).api.configuredWordFeed(), feedUrl);
});
await check("live connector renders a published synthetic word without cookies, keys or writes", async () => {
  const f = deliveryFixture(feedUrl, async () => new Response(JSON.stringify(fixture.output)));
  assert.equal(await f.api.loadWordPublication(), true);
  assert(f.nodes.get("f2-word-state").innerHTML.includes("Synthetic word 1"));
  assert.equal(f.calls.length, 1); assert.equal(f.calls[0].url, feedUrl);
  assert.equal(f.calls[0].options.credentials, "omit"); assert.equal(f.calls[0].options.redirect, "error");
  assert.equal(f.calls[0].options.cache, "no-store"); assert.equal(f.calls[0].options.headers, undefined);
  assert.equal(f.calls[0].options.method, undefined); assert(f.calls[0].options.signal instanceof AbortSignal);
});
await check("live errors, rate limits and malformed JSON withhold without static fallback", async () => {
  for (const fetcher of [async () => { throw Error("synthetic-timeout"); }, async () => new Response("{}", { status: 429 }),
    async () => new Response("not-json"), async () => new Response("{}", { status: 503 })]) {
    const f = deliveryFixture(feedUrl, fetcher); assert.equal(await f.api.loadWordPublication(), false);
    assert.equal(f.nodes.get("f2-word-state").textContent, "Under verification");
    assert.equal(f.calls.length, 1); assert.equal(f.calls[0].url, feedUrl);
  }
});
await check("live response cannot bypass stale, future, copy or linguistic review checks", async () => {
  for (const mutate of [d => { d.date_key = "2026-10-22"; }, d => { d.date_key = "2026-10-24"; },
    d => { d.assignment.reviewed_copy.content.english = "unreviewed"; },
    d => { d.assignment.reviewed_copy.reviews[0].review_status = "pending"; }]) {
    const output = structuredClone(fixture.output); mutate(output);
    const f = deliveryFixture(feedUrl, async () => new Response(JSON.stringify(output)));
    assert.equal(await f.api.loadWordPublication(), false);
  }
});
await check("out-of-order reads cannot overwrite a later withholding decision", async () => {
  const pending = [];
  const f = deliveryFixture(feedUrl, () => new Promise(resolve => pending.push(resolve)));
  const first = f.api.loadWordPublication(), second = f.api.loadWordPublication();
  pending[1](new Response("{}")); await second;
  pending[0](new Response(JSON.stringify(fixture.output))); await first;
  assert.equal(f.nodes.get("f2-word-state").textContent, "Under verification");
  assert.equal(f.nodes.get("f2-word-state").innerHTML, "");
});
await check("midnight rereads the live feed once without selection or a website rebuild", async () => {
  const f = deliveryFixture(feedUrl, async () => new Response(JSON.stringify(fixture.output)));
  f.clock("2026-10-23T18:29:59.000Z"); await f.api.loadWordPublication();
  const rollover = [...f.timers.values()][0]; assert.equal(rollover.ms, 1000);
  f.clock("2026-10-23T18:30:00.000Z"); await rollover.fn();
  assert.equal(f.calls.length, 2); assert.equal(f.nodes.get("f2-word-state").textContent, "Under verification");
});
await check("dormant connector reads only the existing withheld asset and installs no read timer", async () => {
  const f = deliveryFixture("", async () => new Response(read("generated/word-of-day-publication.json")));
  assert.equal(await f.api.loadWordPublication(), false);
  assert.equal(f.calls[0].url, "generated/word-of-day-publication.json"); assert.equal(f.timers.size, 0);
});
console.log("Word public feed: " + checks + " checks passed (synthetic/local only; no managed Edge or hosted publication certification).");
