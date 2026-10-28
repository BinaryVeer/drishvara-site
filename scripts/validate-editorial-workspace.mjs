import assert from "node:assert/strict";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import { execFileSync } from "node:child_process";
import { validateEditorialCommand, executeEditorialCommand } from "./lib/editorial-workspace-service.mjs";
import { createEditorialWorkspaceHandler } from "../api/editorial-workspace.js";

let checks = 0;
async function check(name, run) { await run(); checks++; console.log("PASS " + name); }
const internal = { ok: true, public_output_allowed: false, runtime_activation: false };
const id = randomUUID(), version = randomUUID(), contentHash = "sha256:" + "a".repeat(64);
const intake = { action: "intake", command_id: randomUUID(), kind: "article", external_id: "synthetic-article", expected_version_id: null,
  title: "Synthetic research", payload: { desk: "world_affairs", body: "Synthetic plain-text article", sources: [], media: [], research_refs: [] } };
const decision = { action: "decision", command_id: randomUUID(), candidate_id: id, version_id: version, content_hash: contentHash,
  scope: "editorial", decision: "approve", note: "Synthetic review only", evidence_refs: ["synthetic-review-ref"] };
await check("intake accepts exact five-desk research contract", () => assert.equal(validateEditorialCommand(intake), null));
await check("Technology is not silently created as a sixth desk", () => assert.equal(validateEditorialCommand({ ...intake, payload: { ...intake.payload, desk: "technology" } }), "invalid_article_research_copy"));
for (const key of ["actor_id", "role", "approved", "public_output_allowed"]) await check("rejects caller authority field " + key, () => assert.equal(validateEditorialCommand({ ...decision, [key]: true }), "unknown_or_missing_command_fields"));
await check("rejects arbitrary publication actions", () => assert.equal(validateEditorialCommand({ action: "publish" }), "unknown_or_missing_command_fields"));
await check("requires exact version hash", () => assert.equal(validateEditorialCommand({ ...decision, content_hash: "latest" }), "invalid_version_binding"));
await check("approval requires evidence references", () => assert.equal(validateEditorialCommand({ ...decision, evidence_refs: [] }), "invalid_review_decision"));
await check("unqualified/unknown scope rejected", () => assert.equal(validateEditorialCommand({ ...decision, scope: "admin_override" }), "invalid_review_decision"));
await check("duplicate evidence refs rejected", () => assert.equal(validateEditorialCommand({ ...decision, evidence_refs: ["same", "same"] }), "invalid_review_decision"));
await check("rejects incomplete word copy rather than fabricating fields", () => assert.equal(validateEditorialCommand({ ...intake, kind: "word", payload: { contract_version: "ag70e.word-copy.v2", content: {}, research_refs: [] } }), "invalid_word_research_copy"));
await check("rejects nested executable/accessor values", () => { const bad = { ...intake, payload: { get desk() { throw new Error("must not execute"); } } }; assert.equal(validateEditorialCommand(bad), "invalid_json_command"); });
await check("rejects oversized data", () => assert.equal(validateEditorialCommand({ ...intake, title: "s".repeat(250000) }), "request_too_large"));
await check("never accepts a public-enabled database receipt", async () => assert.rejects(executeEditorialCommand({ action: "session" }, async () => ({ ...internal, public_output_allowed: true })), /invalid_editorial_receipt/));
await check("uses only existing authenticated review RPC", async () => {
  await executeEditorialCommand(decision, async (name, args) => { assert.equal(name, "editorial_review_command"); assert.deepEqual(args, { p_command: decision }); return internal; });
});

const env = { EDITORIAL_WORKSPACE_ENABLED: "true", EDITORIAL_WORKSPACE_ORIGIN: "https://internal.example.invalid", SUPABASE_URL: "https://synthetic.example.invalid", SUPABASE_ANON_KEY: "synthetic-anon-only" };
let calls = [], failAuth = false, denyRpc = false;
const fakeFetch = async (url, options) => {
  calls.push({ path: new URL(url).pathname, options });
  if (new URL(url).pathname.endsWith("/token")) return { ok: true, json: async () => ({ access_token: "synthetic.jwt.token", expires_in: 3600 }) };
  if (new URL(url).pathname.endsWith("/user")) return { ok: !failAuth, json: async () => failAuth ? ({ message: "private raw auth details" }) : ({ id: "synthetic-user" }) };
  return { ok: !denyRpc, json: async () => denyRpc ? ({ message: "editorial_capability_required" }) : internal };
};
async function invoke({ method = "GET", action = "", body, cookie, origin = env.EDITORIAL_WORKSPACE_ORIGIN, contentType = "application/json", extra = {}, chunks } = {}, options = {}) {
  const req = Object.assign(chunks ? Readable.from(chunks) : {}, { method, url: "/api/editorial-workspace" + (action ? "?" + action : ""), body,
    headers: { ...(method === "POST" ? { origin, "content-type": contentType } : {}), ...(cookie ? { cookie } : {}), ...extra } });
  const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(n) { this.code = n; return this; }, json(v) { this.data = v; return this; }, send(v) { this.data = v; return this; } };
  await createEditorialWorkspaceHandler({ env, fetcher: fakeFetch, loadAsset: async name => "synthetic-asset:" + name, ...options })(req, res);
  return res;
}
await check("disabled by default without contacting Auth", async () => { calls = []; const r = await invoke({}, { env: {} }); assert.equal(r.code, 503); assert.equal(calls.length, 0); });
await check("anonymous gets login shell, never drafts", async () => { const r = await invoke(); assert.equal(r.data, "synthetic-asset:login.html"); assert.equal(r.headers["Cache-Control"], "no-store, private"); });
await check("anonymous cannot read queue", async () => assert.equal((await invoke({ method: "POST", action: "action=command", body: { action: "list" } })).code, 401));
await check("cross-origin writes fail before Auth", async () => { calls = []; assert.equal((await invoke({ method: "POST", action: "action=login", body: {}, origin: "https://attacker.invalid" })).code, 403); assert.equal(calls.length, 0); });
await check("missing Origin fails closed", async () => assert.equal((await invoke({ method: "POST", body: {}, origin: undefined, extra: { origin: undefined } })).code, 403));
await check("form-encoded CSRF rejected", async () => assert.equal((await invoke({ method: "POST", contentType: "application/x-www-form-urlencoded", body: {} })).code, 403));
await check("header-size limit before parsing", async () => assert.equal((await invoke({ method: "POST", body: {}, extra: { "content-length": "300000" } })).code, 413));
await check("private application cannot be requested as public asset", async () => assert.equal((await invoke({ action: "asset=app.html" })).code, 404));
await check("asset traversal rejected", async () => assert.equal((await invoke({ action: "asset=../../.env" })).code, 404));
await check("only authorized login receives HttpOnly secure session", async () => {
  calls = []; const r = await invoke({ method: "POST", action: "action=login", body: { email: "synthetic@example.invalid", password: "synthetic-no-real-credential" } });
  assert.equal(r.code, 200); assert.match(r.headers["Set-Cookie"], /__Host-.*HttpOnly; SameSite=Strict; Max-Age=2700; Secure/);
  assert(!JSON.stringify(r.data).includes("synthetic.jwt.token")); assert.deepEqual(calls.map(c => c.path), ["/auth/v1/token", "/auth/v1/user", "/rest/v1/rpc/editorial_review_command"]);
});
await check("active Auth identity without capabilities receives no cookie", async () => {
  denyRpc = true; const r = await invoke({ method: "POST", action: "action=login", body: { email: "synthetic@example.invalid", password: "synthetic" } }); denyRpc = false;
  assert.equal(r.code, 403); assert.equal(r.headers["Set-Cookie"], undefined);
});
const cookie = "__Host-drishvara_editorial=synthetic.jwt.token";
await check("split UTF-8 Sanskrit/Hindi request bytes retain exact copy", async () => {
  const command = { ...intake, title: "धैर्य / मनन / विवेक", payload: { ...intake.payload, body: "हिंदी अर्थ। Sanskrit source review." } };
  const bytes = Buffer.from(JSON.stringify(command)); calls = [];
  const response = await invoke({ method: "POST", action: "action=command", cookie, chunks: [...bytes].map(byte => Buffer.from([byte])) });
  assert.equal(response.code, 200);
  const last = calls.at(-1); assert.deepEqual(JSON.parse(last.options.body).p_command, command);
});
await check("malformed UTF-8 is rejected rather than silently changed", async () => {
  calls = []; const response = await invoke({ method: "POST", action: "action=command", cookie, chunks: [Buffer.from([123,34,97,34,58,34,255,34,125])] });
  assert.equal(response.code, 403); assert.equal(calls.length, 0);
});
await check("streamed body limit cannot be bypassed by missing Content-Length", async () => {
  const response = await invoke({ method: "POST", action: "action=command", cookie, chunks: [Buffer.alloc(150000, 32), Buffer.alloc(150000, 32)] }); assert.equal(response.code, 413);
});
await check("verified session can receive generic private app", async () => { calls = []; const r = await invoke({ cookie }); assert.equal(r.data, "synthetic-asset:app.html"); assert.equal(calls[0].path, "/auth/v1/user"); });
await check("revoked or invalid Auth token cannot access review data", async () => { failAuth = true; const r = await invoke({ cookie, action: "action=session" }); failAuth = false; assert.equal(r.code, 403); assert(!JSON.stringify(r.data).includes("private raw auth details")); });
await check("expired session returns sign-in page and clears cookie", async () => { failAuth = true; const r = await invoke({ cookie }); failAuth = false; assert.equal(r.data, "synthetic-asset:login.html"); assert.match(r.headers["Set-Cookie"], /Max-Age=0/); });
await check("duplicate session cookies fail closed", async () => assert.equal((await invoke({ cookie: cookie + "; " + cookie, action: "action=session" })).code, 401));
await check("revoked reviewer can still clear local session", async () => {
  denyRpc = true;
  const response = await invoke({ cookie, method: "POST", action: "action=logout", body: {} }); denyRpc = false;
  assert.equal(response.code, 200); assert.match(response.headers["Set-Cookie"], /Max-Age=0/);
});
await check("GET cannot mutate review state", async () => assert.equal((await invoke({ cookie, action: "action=command" })).code, 404));
await check("unsupported HTTP methods rejected", async () => assert.equal((await invoke({ method: "PUT" })).code, 405));
await check("cannot dispatch to existing legacy publisher", async () => {
  calls = []; const r = await invoke({ cookie, method: "POST", action: "action=command", body: { action: "publish", actor: "admin" } });
  assert.equal(r.code, 400); assert(calls.every(c => c.path === "/auth/v1/user" || c.path === "/rest/v1/rpc/editorial_review_command"));
});
await check("browser never receives credentials or stores Auth tokens", () => {
  const js = fs.readFileSync("internal-scaffolds/editorial-workspace/workspace.js", "utf8");
  assert(!/localStorage|sessionStorage|innerHTML|service_role|access_token/.test(js));
});
await check("Arial/Cambria only and AI hero bundled", () => {
  const css = fs.readFileSync("internal-scaffolds/editorial-workspace/workspace.css", "utf8");
  assert(css.includes("Arial") && css.includes("Cambria") && !css.includes("Georgia"));
  assert(fs.statSync("internal-scaffolds/editorial-workspace/editorial-hero-ai.webp").size > 10000);
});
await check("static shell has no private pilot copy or embedded draft bank", () => {
  for (const name of ["app.html", "login.html", "workspace.js"]) assert(!/dhairya|manana|viveka|preview-data|article-intake-data|CURRENT/.test(fs.readFileSync("internal-scaffolds/editorial-workspace/" + name, "utf8")));
});
await check("hosting delta is confined to workspace assets and internal routes", () => {
  const current = JSON.parse(fs.readFileSync("vercel.json", "utf8"));
  const baseline = JSON.parse(execFileSync("git", ["show", "982863759478f798a262919f5dc6b390f76e5b7a:vercel.json"], { encoding: "utf8" }));
  assert.deepEqual(current.functions, { "api/editorial-workspace.js": { includeFiles: "internal-scaffolds/editorial-workspace/{app.html,login.html,workspace.css,workspace.js,editorial-hero-ai.webp}" } });
  assert.deepEqual(current.rewrites, [
    { source: "/editorial", destination: "/api/editorial-workspace" },
    { source: "/editorial/", destination: "/api/editorial-workspace" },
    { source: "/internal-scaffolds/editorial-workspace/:path*", destination: "/api/editorial-workspace" }
  ]);
  const preserved = { ...current }; delete preserved.functions; delete preserved.rewrites;
  assert.deepEqual(preserved, baseline);
});
const adminGrant = { action: "set_capability", command_id: randomUUID(), email: "reviewer@example.invalid", kind: "word", scope: "editorial", operation: "grant", access_days: 30, qualification_ref: null, qualification_verified: false, note: "Synthetic editorial appointment only." };
await check("existing email lookup has an exact command shape", () => {
  assert.equal(validateEditorialCommand({ action: "lookup_person", email: adminGrant.email }), null);
  assert.equal(validateEditorialCommand({ action: "lookup_person", email: adminGrant.email, role: "admin" }), "unknown_or_missing_command_fields");
});
await check("Admin access commands accept scoped grants, not account promotion", () => {
  assert.equal(validateEditorialCommand(adminGrant), null);
  assert.equal(validateEditorialCommand({ ...adminGrant, scope: "administrator" }), "invalid_capability_scope");
});
await check("specialist grants need qualification evidence and explicit verification", () => {
  assert.equal(validateEditorialCommand({ ...adminGrant, scope: "linguistic" }), "verified_qualification_reference_required");
  assert.equal(validateEditorialCommand({ ...adminGrant, scope: "linguistic", qualification_ref: "synthetic-qualification", qualification_verified: true }), null);
});
await check("cross-kind scopes and malformed delegation fields fail closed", () => {
  assert.equal(validateEditorialCommand({ ...adminGrant, kind: "article", scope: "iast" }), "invalid_capability_scope");
  for (const days of [0, 91, 1.5, "30"]) assert.equal(validateEditorialCommand({ ...adminGrant, access_days: days }), "invalid_administration_fields");
  assert.equal(validateEditorialCommand({ ...adminGrant, note: " " }), "invalid_administration_fields");
});
await check("candidate assignment binds a real-format candidate UUID", () => {
  const { kind, scope, qualification_ref, qualification_verified, ...rest } = adminGrant;
  assert.equal(validateEditorialCommand({ ...rest, action: "set_assignment", candidate_id: randomUUID() }), null);
  assert.equal(validateEditorialCommand({ ...rest, action: "set_assignment", candidate_id: "wrong" }), "invalid_candidate_id");
});
await check("Admin exception requires the exact policy, acknowledgment and reason", () => {
  const e = { policy_ref: "drishvara-editorial-admin-self-review@1", acknowledged: true, reason: "Synthetic explicitly authorized exception." };
  assert.equal(validateEditorialCommand({ ...decision, admin_exception: e }), null);
  for (const bad of [null, {}, { ...e, acknowledged: false }, { ...e, policy_ref: "other" }, { ...e, reason: " " }, { ...e, approved: true }])
    assert.equal(validateEditorialCommand({ ...decision, admin_exception: bad }), "explicit_admin_self_review_required");
});
await check("Admin commands still use the authenticated RPC and internal envelopes", async () => {
  await executeEditorialCommand(adminGrant, async (name, args) => { assert.equal(name, "editorial_review_command"); assert.deepEqual(args.p_command, adminGrant); return internal; });
  await assert.rejects(executeEditorialCommand(adminGrant, async () => ({ ...internal, runtime_activation: true })), /invalid_editorial_receipt/);
});
const releaseScopes = ["editorial", "rights", "factual", "safety", "media", "publisher_acceptance"];
const releaseSnapshot = { ...internal, candidate: { id, kind: "article" }, version: { id: version, content_hash: contentHash },
  review_state: { required_scopes: releaseScopes, approved_scopes: releaseScopes, reviews_complete: true }, review_permissions: { can_request_release: true } };
const releaseFetcher = async (url, options) => {
  if (new URL(url).pathname.endsWith("editorial_review_command")) {
    const action = JSON.parse(options.body).p_command.action;
    if (action === "open" || action === "request_release") {
      calls.push({ path: new URL(url).pathname, options });
      return { ok: true, json: async () => action === "open" ? releaseSnapshot : { ...internal, release_request_id: randomUUID() } };
    }
  }
  return fakeFetch(url, options);
};
await check("anonymous cannot inspect controlled-release readiness", async () => {
  assert.equal((await invoke({ method: "POST", action: "action=release_check", body: { action: "open", candidate_id: id } })).code, 401);
});
await check("cross-origin release cannot reach a publisher", async () => {
  calls = []; assert.equal((await invoke({ cookie, method: "POST", action: "action=release", body: {}, origin: "https://attacker.invalid" })).code, 403); assert.equal(calls.length, 0);
});
await check("release readiness is read-only and explains dormant operational delivery", async () => {
  calls = []; const r = await invoke({ cookie, method: "POST", action: "action=release_check", body: { action: "open", candidate_id: id } }, { fetcher: releaseFetcher });
  assert.equal(r.code, 200); assert.equal(r.data.request_allowed, true); assert.equal(r.data.delivery_enabled, false); assert(r.data.blockers.includes("delivery_not_activated"));
  assert(calls.filter(c => c.path.endsWith("editorial_review_command")).every(c => ["session", "open"].includes(JSON.parse(c.options.body).p_command.action)));
});
await check("the HTTP release route defaults to a queued handoff, not a write adapter", async () => {
  calls = []; const r = await invoke({ cookie, method: "POST", action: "action=release", body: { action: "request_release", command_id: randomUUID(), candidate_id: id, version_id: version, content_hash: contentHash } },
    { fetcher: releaseFetcher, env: { ...env, EDITORIAL_DELIVERY_SERVICE_KEY: "synthetic-private-key-must-not-leak" } });
  assert.equal(r.code, 200); assert.equal(r.data.status, "queued_delivery_disabled"); assert(!JSON.stringify(r.data).includes("synthetic-private-key"));
  assert(calls.every(c => c.path === "/auth/v1/user" || c.path === "/rest/v1/rpc/editorial_review_command"));
  assert(calls.every(c => c.options.headers.apikey === env.SUPABASE_ANON_KEY));
});
await check("caller-supplied activation cannot turn a release into public delivery", async () => {
  const r = await invoke({ cookie, method: "POST", action: "action=release", body: { action: "request_release", command_id: randomUUID(), candidate_id: id, version_id: version, content_hash: contentHash, enabled: true } });
  assert.equal(r.code, 400); assert.equal(r.data.code, "unknown_or_missing_command_fields");
});
await check("invalid approval returns field-specific evidence guidance", async () => {
  const r = await invoke({ cookie, method: "POST", action: "action=command", body: { ...decision, evidence_refs: [] } });
  assert.equal(r.code, 400); assert.equal(r.data.code, "invalid_review_decision"); assert(r.data.details.some(d => d.includes("actual evidence")));
});
await check("server configuration alone cannot claim database delivery readiness", async () => {
  const r = await invoke({ cookie, method: "POST", action: "action=release_check", body: { action: "open", candidate_id: id } },
    { env: { ...env, EDITORIAL_DELIVERY_ENABLED: "true", EDITORIAL_DELIVERY_SERVICE_KEY: "synthetic-worker-only", EDITORIAL_DELIVERY_AUTHORIZATION_REF: "synthetic-operation-only" },
      fetcher: async (url, options) => new URL(url).pathname.endsWith("editorial_delivery_readiness") ? { ok: true, json: async () => ({ ...internal, delivery_enabled: false }) } : releaseFetcher(url, options) });
  assert.equal(r.code, 200); assert.equal(r.data.delivery_enabled, false); assert(r.data.blockers.includes("delivery_not_activated"));
});
await check("existing server-only Supabase secret can power delivery without reaching the browser", async () => {
  const r = await invoke({ cookie, method: "POST", action: "action=release_check", body: { action: "open", candidate_id: id } },
    { env: { ...env, EDITORIAL_DELIVERY_ENABLED: "true", SUPABASE_SECRET_KEY: "synthetic-server-only-must-not-leak", EDITORIAL_DELIVERY_AUTHORIZATION_REF: "synthetic-operation-only" },
      fetcher: async (url, options) => new URL(url).pathname.endsWith("editorial_delivery_readiness") ? { ok: true, json: async () => ({ ...internal, delivery_enabled: true }) } : releaseFetcher(url, options) });
  assert.equal(r.code, 200); assert.equal(r.data.delivery_enabled, true); assert.equal(r.data.request_allowed, true);
  assert(!JSON.stringify(r.data).includes("synthetic-server-only"));
});
await check("trusted worker receives only the server credential and missing Article credentials stay pending", async () => {
  const operations = [], secret = "synthetic-worker-key-must-not-leak";
  const r = await invoke({ cookie, method: "POST", action: "action=release", body: { action: "request_release", command_id: randomUUID(), candidate_id: id, version_id: version, content_hash: contentHash } },
    { env: { ...env, EDITORIAL_DELIVERY_ENABLED: "true", SUPABASE_SECRET_KEY: secret, EDITORIAL_DELIVERY_AUTHORIZATION_REF: "synthetic-operation-only" },
      fetcher: async (url, options) => {
        const path = new URL(url).pathname;
        if (path.endsWith("editorial_delivery_readiness")) return { ok: true, json: async () => ({ ...internal, delivery_enabled: true }) };
        if (path.endsWith("editorial_review_command") && JSON.parse(options.body).p_command.action === "session")
          return { ok: true, json: async () => ({ ...internal, actor_id: id }) };
        if (path.endsWith("editorial_release_worker")) {
          assert.equal(options.headers.apikey, secret);
          const op = JSON.parse(options.body).p_command.operation; operations.push(op);
          return { ok: true, json: async () => ({ ...internal, status: op === "claim" ? "claimed" : "failed", claim_id: id,
            candidate_id: id, version_id: version, content_hash: contentHash, kind: "article", version: releaseSnapshot.version }) };
        }
        return releaseFetcher(url, options);
      } });
  assert.equal(r.code, 200); assert.equal(r.data.status, "delivery_pending"); assert.equal(r.data.code, "article_publisher_unavailable");
  assert.deepEqual(operations, ["claim", "fail"]); assert(!JSON.stringify(r.data).includes(secret));
});
console.log(`Editorial workspace: ${checks} local contract/HTTP checks passed. Auth is simulated here; real PostgreSQL checks run separately.`);
