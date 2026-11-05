import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { syntheticArticleLayout } from "./lib/editorial-review-test-fixtures.mjs";
import { prepareReviewedArticleFiles } from "../services/pipeline/publish-all-core.js";

// Real existing public reader, local synthetic content only. Never writes an Article or calls a publisher.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const directory = process.argv[2]; if (!path.isAbsolute(directory || "")) throw Error("absolute_screenshot_directory_required");
await mkdir(directory, { recursive: true });
const root = path.resolve(fileURLToPath(new URL("../", import.meta.url))), payload = syntheticArticleLayout();
const files = await prepareReviewedArticleFiles({ candidateId: randomUUID(), version: { title: "Synthetic multi-visual Article reader test", payload },
  date: "2026-10-30", timestamp: "2026-10-30T10:00:00.000Z", existingIndex: { items: [] } });
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
let browser, checks = 0;
const check = (label, result) => { assert(result, label); checks++; console.log("PASS public reader: " + label); };
const server = createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url, "http://localhost").pathname;
    const raster = payload.media.find(m => m.url === pathname);
    if (raster) { res.setHeader("Content-Type", "image/png"); res.end(Buffer.from(raster.upload_png, "base64")); return; }
    if (pathname === "/" + files.articlePath) { res.setHeader("Content-Type", "text/html"); res.end(files.html); return; }
    if (pathname === "/data/article-index.json") { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(files.index)); return; }
    if (pathname.startsWith("/data/")) { res.setHeader("Content-Type", "application/json"); res.end("{}"); return; }
    if (pathname !== "/article.html" && !pathname.startsWith("/assets/")) { res.writeHead(404); res.end(); return; }
    const file = path.resolve(root, "." + pathname);
    if (!file.startsWith(root + path.sep)) throw Error();
    res.setHeader("Content-Type", types[path.extname(file)] || "application/octet-stream"); res.end(await readFile(file));
  } catch { res.writeHead(404); res.end(); }
});
try {
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const base = "http://127.0.0.1:" + server.address().port;
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
  const context = await browser.newContext(), errors = [];
  await context.route("**/*", route => route.request().url().startsWith(base + "/") ? route.continue() : route.abort());
  const page = await context.newPage(); page.on("pageerror", e => errors.push(e.message));
  await page.goto(base + "/article.html?path=" + encodeURIComponent(files.articlePath));
  await page.waitForSelector('#article-body [data-drishvara-reviewed-layout="v1"]');
  for (const image of await page.locator("#article-body .article-object img").all()) await image.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => [...document.querySelectorAll("#article-body .article-object img")].length === 2 && [...document.querySelectorAll("#article-body .article-object img")].every(i => i.naturalWidth > 0), null, { timeout: 10000 }).catch(async error => {
    console.log("Synthetic reader diagnostics", await page.locator("#article-body img").evaluateAll(images => images.map(i => ({ src: i.getAttribute("src"), width: i.naturalWidth, complete: i.complete }))));
    throw error;
  });
  check("normal article.html route retains all objects and images", await page.locator("#article-body .article-object").count() === 5 && await page.locator("#article-body .article-object img").count() === 2);
  check("reader imports the published body without duplicating its title", await page.locator("#article-body h1").count() === 0 && (await page.locator("#article-title").innerText()).includes("Synthetic multi-visual"));
  check("charts retain exact data, accessible labels and source notes", await page.locator("#article-body meter").count() === 2 && (await page.locator("#object-chart figcaption").innerText()).includes("Synthetic evidence fixture"));
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(() => window.scrollTo(0, 0));
    check("existing frontend fits " + width, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    check("all images retain natural aspect ratio at " + width, await page.locator("#article-body .article-object img").evaluateAll(images => images.every(i => Math.abs(i.getBoundingClientRect().height / i.getBoundingClientRect().width - i.naturalHeight / i.naturalWidth) < .01)));
    await page.screenshot({ path: path.join(directory, "public-article-reader-synthetic-" + width + ".png"), fullPage: false });
    await page.locator("#object-chart").scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(directory, "public-article-objects-synthetic-" + width + ".png"), fullPage: false });
  }
  check("public reader produces no uncaught browser exceptions", errors.length === 0);
  console.log(`Article public reader: ${checks} local browser checks passed. No live content or approvals were used.`);
} finally { if (browser) await browser.close(); await new Promise(resolve => server.close(resolve)); }
