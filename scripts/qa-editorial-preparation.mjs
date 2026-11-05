import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { ARTICLE_DESKS, validateEditorialCommand } from "./lib/editorial-workspace-service.mjs";
import { articleWordCount, LONG_FORM_PROFILE } from "./lib/editorial-article-qualification.mjs";

// Inert synthetic input, real normalization CLI. No provider credentials, hosted calls or content approvals.
const root = mkdtempSync(path.join(tmpdir(), "drishvara-article-preparation-"));
let checks = 0;
const check = (name, run) => { run(); checks++; console.log("PASS preparation CLI: " + name); };
const batch = {
  contract_version: "drishvara.editorial-generation-review.v1", generation_profile: LONG_FORM_PROFILE, date: "2026-10-30", model: "synthetic-only",
  public_output_allowed: false, runtime_activation: false,
  drafts: ARTICLE_DESKS.map(desk => ({ desk, proposed_media: null, generated: {
    title: "Synthetic pending " + desk, article_html: Array.from({ length: 6 }, (_, i) => `<h2>Section ${i + 1}</h2><p>${"synthetic ".repeat(250).trim()}</p>`).join(""),
    reference_links: ["https://example.invalid/source-one", "https://example.invalid/source-two"], topic_intent: "Synthetic explanatory test", reader_value_promise: "Synthetic normalization integrity test",
    long_form_outline: ["Section 1", "Section 2", "Section 3"], visual_plan: [{ type: "primary_visual", placement: "hero", purpose: "Synthetic plan only", prompt: "Synthetic test visual" }],
    data_enrichment: { type: "structured_key_takeaways_box", heading: "Synthetic takeaways", items: ["Synthetic first point", "Synthetic second point", "Synthetic third point"] }
  } }))
};
const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !/^(?:OPENAI_|SUPABASE_|EDITORIAL_|GITHUB_)/.test(key)));
function run(name, value) {
  const input = path.join(root, name + ".json"), out = path.join(root, name);
  writeFileSync(input, JSON.stringify(value), { mode: 0o600 });
  return { out, result: spawnSync(process.execPath, ["scripts/prepare-editorial-review.mjs", "--from", input, "--out", out], { env, encoding: "utf8", timeout: 60000 }) };
}
try {
  const valid = run("valid", batch); assert.equal(valid.result.status, 0, valid.result.stderr);
  const commands = JSON.parse(readFileSync(path.join(valid.out, "intake-commands.json"), "utf8"));
  check("five 1,500-word bodies pass without counting headings or takeaways", () => { assert.equal(commands.length, 5); assert(commands.every(c => articleWordCount(c.payload.body) === 1500)); });
  check("headings and generated enrichment retain explicit placement", () => {
    for (const c of commands) { assert.equal(c.payload.layout.sections.length, 6); assert.equal(c.payload.layout.sections[1].before_paragraph, 2); assert.equal(c.payload.layout.objects[0].type, "takeaways"); assert.equal(c.payload.layout.objects[0].after_paragraph, 6); }
  });
  check("missing images remain missing and every output remains a pending intake", () => { assert(commands.every(c => c.action === "intake" && c.payload.media.length === 0 && validateEditorialCommand(c) === null && !Object.hasOwn(c, "approved"))); });
  const short = structuredClone(batch); short.drafts[0].generated.article_html = `<p>${"synthetic ".repeat(1499)}</p>`;
  const rejected = run("short", short);
  check("1,499 body words cannot be rescued by long headings, takeaways or metadata", () => { assert.equal(rejected.result.status, 1); assert(rejected.result.stderr.includes("article_long_form_length_pending")); assert(!existsSync(path.join(rejected.out, "intake-commands.json"))); });
  const unsafe = structuredClone(batch); unsafe.drafts[0].generated.article_html += "<script>throw Error('synthetic')</script>";
  const blocked = run("unsafe", unsafe);
  check("unsupported generated markup is rejected rather than executed or silently discarded", () => { assert.equal(blocked.result.status, 1); assert(blocked.result.stderr.includes("unsupported_generated_article_markup")); assert(!existsSync(path.join(blocked.out, "intake-commands.json"))); });
  console.log(`Editorial preparation CLI: ${checks} offline synthetic checks passed. No real provider execution or hosted writes.`);
} finally { rmSync(root, { recursive: true, force: true }); }
