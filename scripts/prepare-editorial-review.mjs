import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseEnv } from "node:util";
import { randomUUID } from "node:crypto";
import { prepareEditorialReviewDrafts } from "../services/pipeline/generate-daily-core.js";
import { canonicalPublicationDate, snapshotHash } from "./lib/ag70d-word-selection-engine.mjs";
import { assertPrivateRoot } from "./lib/ag70e-word-lexical-bank.mjs";
import { validateEditorialCommand } from "./lib/editorial-workspace-service.mjs";
import { LONG_FORM_PROFILE, assessLongFormDraft, articleWordCount, articleLengthBlocker } from "./lib/editorial-article-qualification.mjs";
import { articleIntakeBatchError } from "./lib/editorial-article-intake.mjs";

// Operator-run preparation. Never calls Git writes, Supabase, approval, release or scheduling.
const args = process.argv.slice(2), options = {};
for (let i = 0; i < args.length; i += 2) {
  if (!["--out", "--credentials", "--date", "--from", "--revise-from"].includes(args[i]) || !args[i + 1] || Object.hasOwn(options, args[i])) throw Error("invalid_preparation_arguments");
  options[args[i]] = args[i + 1];
}
if (!options["--out"]) throw Error("private_output_directory_required");
if (options["--from"] && options["--revise-from"]) throw Error("ambiguous_preparation_source");
const directory = assertPrivateRoot(options["--out"]);
const credentials = options["--credentials"] ? parseEnv(readFileSync(options["--credentials"], "utf8")) : {};
const apiKey = process.env.OPENAI_API_KEY || credentials.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || credentials.OPENAI_MODEL || "gpt-4.1-mini";
const date = options["--date"] || canonicalPublicationDate(new Date().toISOString());
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
let browser;
try {
  const batch = options["--from"] ? JSON.parse(readFileSync(assertPrivateRoot(options["--from"]), "utf8")) :
    await prepareEditorialReviewDrafts({ apiKey, model, date, previousBatch: options["--revise-from"] ? JSON.parse(readFileSync(assertPrivateRoot(options["--revise-from"]), "utf8")) : null });
  if (batch.contract_version !== "drishvara.editorial-generation-review.v1" || batch.public_output_allowed !== false || batch.runtime_activation !== false ||
      batch.generation_profile !== LONG_FORM_PROFILE || !Array.isArray(batch.drafts) || batch.drafts.length !== 5 || new Set(batch.drafts.map(d => d.desk)).size !== 5) throw Error("invalid_preparation_batch");
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const save = (name, value) => writeFileSync(path.join(directory, name), JSON.stringify(value, null, 2) + "\n", { flag: "wx", mode: 0o600 });
  save("generation.json", batch);
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
  const context = await browser.newContext();
  await context.route("**/*", route => route.abort());
  const page = await context.newPage(), commands = [], assessment = [];
  for (const draft of batch.drafts) {
    const parsed = await page.evaluate(html => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const allowed = new Set(["H2", "H3", "P", "BR", "STRONG", "EM", "B", "I", "A"]);
      if ([...doc.body.children].some(n => !["H2", "H3", "P"].includes(n.tagName)) || [...doc.querySelectorAll("body *")].some(n => !allowed.has(n.tagName))) throw Error("unsupported_generated_article_markup");
      if ([...doc.querySelectorAll("body *")].some(n => [...n.attributes].some(a => a.name !== "href" || n.tagName !== "A"))) throw Error("unsupported_generated_article_attributes");
      for (const br of doc.querySelectorAll("br")) br.replaceWith(doc.createTextNode("\n"));
      const paragraphs = [], sections = [];
      let heading = [];
      for (const child of doc.body.children) {
        const text = child.textContent.trim(); if (!text) continue;
        if (["H2", "H3"].includes(child.tagName)) { heading.push(text); continue; }
        if (heading.length) { sections.push({ heading: heading.join(" / "), before_paragraph: paragraphs.length + 1 }); heading = []; }
        paragraphs.push(text);
      }
      if (heading.length) throw Error("unsupported_generated_article_trailing_heading");
      return { body: paragraphs.join("\n\n"), sections, paragraphCount: paragraphs.length };
    }, draft.generated.article_html);
    const { body } = parsed;
    const qualification = assessLongFormDraft({ generated: draft.generated, body, media: draft.proposed_media });
    if (!qualification.mechanical_checks_complete) throw Error(qualification.blockers[0]);
    const unit = draft.generated.data_enrichment;
    if (qualification.blockers.includes("article_outline_pending") || qualification.blockers.includes("article_visual_plan_pending") || qualification.blockers.includes("article_data_enrichment_pending")) throw Error("article_long_form_packet_incomplete");
    if (articleLengthBlocker(body)) throw Error("article_long_form_length_pending");
    const sourceUrls = [...new Set([...(draft.generated.reference_links || []), draft.generated.official_link, draft.generated.supporting_link].filter(v => {
      try { const u = new URL(v); return u.protocol === "https:" && !u.username && !u.password; } catch { return false; }
    }))];
    const media = draft.proposed_media;
    if (!sourceUrls.length) throw Error("article_reference_evidence_pending");
    const sourceRefs = sourceUrls.map((url, i) => i + 1);
    const objects = [];
    if (media) objects.push({ id: "primary-visual", type: "image", media_index: 0, visual_kind: "photograph", after_paragraph: 0, width: "wide",
      title: draft.generated.title, caption: media.image_alt, source_refs: sourceRefs });
    objects.push({ id: "key-takeaways", type: "takeaways", after_paragraph: parsed.paragraphCount, width: "reading", title: unit.heading,
      caption: "Key ideas from this article.", source_refs: sourceRefs, items: unit.items });
    const externalId = "generated-review-" + batch.date + "-" + draft.desk + "-" + snapshotHash(draft.generated).slice(7, 23);
    const command = { action: "intake", command_id: randomUUID(), kind: "article", external_id: externalId, expected_version_id: null,
      title: draft.generated.title, payload: { desk: draft.desk, body, sources: sourceUrls.map(url => ({ title: url, url })),
        media: media ? [{ url: media.image_path, alt: media.image_alt, attribution: media.image_credit, source_url: media.image_source_url }] : [],
        layout: { contract_version: "drishvara.article-layout.v1", sections: parsed.sections, objects },
        research_refs: ["generation_owner:services/pipeline/generate-daily-core.js", "generation_date:" + batch.date, "generation_model:" + batch.model,
          "generation_record_hash:" + snapshotHash(draft), "evidence_and_media_clearance:pending_human_review",
          "generation_profile:" + LONG_FORM_PROFILE, "article_standard:" + qualification.standard_ref,
          "prepublication_word_count:" + qualification.words + "; minimum " + qualification.word_count_min + "; maximum " + qualification.word_count_max,
          "prepublication_reviews:source authentication, source-use, quality and visitor-value review remain pending",
          "prepublication_sources:AI-proposed pointers; not authenticated claim evidence",
          "prepublication_media:automated suggestion; relevance and source-use not approved",
          "operator_assisted_intake_authorization:user-requested-end-to-end-generation-20261030",
          "submission_is_not_human_authorship_or_approval", ...qualification.blockers.map(code => "qualification_blocker:" + code)] } };
    const error = validateEditorialCommand(command); if (error) throw Error(error);
    commands.push(command);
    const words = articleWordCount(body);
    assessment.push({ external_id: externalId, title: command.title, desk: draft.desk, words, qualification,
      source_count: sourceUrls.length, sourced_image_present: !!media, content_hash: snapshotHash(command.payload),
      review_status: "pending", public_output_allowed: false });
  }
  const batchError = articleIntakeBatchError(commands); if (batchError) throw Error(batchError);
  save("intake-commands.json", commands); save("assessment.json", assessment);
  console.log(JSON.stringify({ directory, date: batch.date, records: commands.length, assessment, hosted_writes: 0, public_output_allowed: false }, null, 2));
} catch (error) {
  const safe = /^(?:OpenAI request failed: \d+|article_[a-z_]+|invalid_[a-z_]+|unsupported_generated_article_[a-z_]+)$/;
  const known = error.message?.match(/\b(article_[a-z_]+|unsupported_generated_article_[a-z_]+)\b/)?.[1];
  console.error("Editorial preparation failed: " + (safe.test(error.message || "") ? error.message : known || "preparation_unavailable"));
  process.exitCode = 1;
} finally { if (browser) await browser.close(); }
