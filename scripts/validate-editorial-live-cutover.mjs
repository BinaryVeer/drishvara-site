import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { execFileSync } from "node:child_process";
import { legacyPublicationRetired } from "../services/pipeline/controlled-publication-boundary.js";

// Real route exports and an inert Express dispatch fixture; no credentials or external writes.
const baseline = "9b22078c573f8de9b9ea84d7de5b494fd6904fb0";
const read = p => fs.readFileSync(p, "utf8");
const prior = p => execFileSync("git", ["show", baseline + ":" + p], { maxBuffer: 64000000 });
const names = ["generate-daily", "publish-all", "publish-public-programme", "run-daily-pipeline", "update-insights"];
let checks = 0, remoteCalls = 0;
async function check(name, run) { await run(); checks++; console.log("PASS cutover: " + name); }
const response = () => ({ headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(n) { this.code = n; return this; }, json(value) { this.value = value; return this; } });
const fetchBefore = globalThis.fetch;
globalThis.fetch = async () => { remoteCalls++; throw Error("legacy route must not contact a provider"); };
try {
  for (const name of names) {
    const module = await import("../api/" + name + ".js");
    await check(name + " has no exported legacy bypass", () => assert.deepEqual(Object.keys(module), ["default"]));
    for (const method of ["GET", "POST", "HEAD", "PUT", "OPTIONS"]) await check(name + " " + method + " cannot generate or publish", async () => {
      const res = response(); await module.default({ method, query: { dryRun: "false", requireApproved: "false", confirm: "publish" }, body: { approved: true } }, res);
      assert.equal(res.code, 410); assert.equal(res.value.code, "legacy_publication_retired"); assert.equal(res.headers["Cache-Control"], "no-store");
      assert.equal(res.value.public_output_allowed, false); assert.equal(res.value.runtime_activation, false); assert.equal(remoteCalls, 0);
    });
    await check(name + " original implementation remains preserved, not rewritten", () => {
      const current = read("api/" + name + ".js").replace('export { legacyPublicationRetired as default } from "../services/pipeline/controlled-publication-boundary.js";\n', "").replace(/^\n/, "")
        .replace("async function legacyHandler(req, res)", "export default async function handler(req, res)");
      const original = prior("api/" + name + ".js").toString();
      assert.equal(current.replace(/\n\n/g, "\n").trimEnd(), original.replace(/\n\n/g, "\n").trimEnd());
    });
  }
  const routes = new Map(); let generated = 0;
  const app = { use() {}, get(p, ...handlers) { routes.set("GET " + p, handlers); }, post(p, ...handlers) { routes.set("POST " + p, handlers); }, listen(_port, callback) { callback(); } };
  const express = Object.assign(() => app, { json: () => () => {} });
  vm.runInNewContext(read("services/pipeline/server.js").replace(/^import .*;\n/gm, ""), { express, legacyPublicationRetired,
    runPublishAll: () => { generated++; }, runGenerateDaily: () => { generated++; }, process: { env: {} }, console: { log() {} } });
  for (const name of ["publish-all", "generate-daily"]) await check("standalone " + name + " terminates before the original job", async () => {
    const chain = routes.get("POST /jobs/" + name); assert.equal(chain.length, 2); assert.equal(chain[0], legacyPublicationRetired);
    const res = response(); let index = 0;
    const next = async () => { if (index < chain.length) await chain[index++]({ method: "POST", body: {} }, res, next); };
    await next(); assert.equal(res.code, 410); assert.equal(index, 1); assert.equal(generated, 0);
  });
  await check("standalone health endpoint is preserved", () => { const res = response(); routes.get("GET /health")[0]({}, res); assert.equal(res.value.ok, true); });
  await check("only the explicitly authorized legacy Cron is removed", () => {
    const before = JSON.parse(prior("vercel.json")), after = JSON.parse(read("vercel.json"));
    assert.deepEqual(before.crons, [{ path: "/api/run-daily-pipeline", schedule: "0 5 * * *" }]); assert.deepEqual(after.crons, []);
    assert.deepEqual({ ...after, crons: before.crons }, before);
  });
  for (const p of ["services/pipeline/generate-daily-core.js", "services/pipeline/publish-all-core.js", "services/pipeline/editorial-planner.js",
    "drishvara_phase01_scaffold/core/agents/story-drafter/prompt.md", "drishvara_phase01_scaffold/core/agents/visual-intelligence/prompt.md",
    "index.html", "panchang.html", "what-stars-say.html", "assets/js/sup02-panchang-server-controller.js", "data/homepage-ui.json", "data/article-index.json"]) {
    await check("unchanged current production owner: " + p, () => assert(fs.readFileSync(p).equals(prior(p))));
  }
  console.log(`Editorial live cutover: ${checks} route/preservation checks passed. No live requests or content approvals.`);
} finally { globalThis.fetch = fetchBefore; }
