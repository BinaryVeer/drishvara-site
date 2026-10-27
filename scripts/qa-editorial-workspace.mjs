import assert from "node:assert/strict";
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { createEditorialWorkspaceHandler } from "../api/editorial-workspace.js";

// Explicitly synthetic Auth/RPC browser fixture. Does not connect to hosted Supabase or write approvals.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const screenshotDir = process.argv[2];
if (!screenshotDir || !path.isAbsolute(screenshotDir)) throw new Error("provide_absolute_local_screenshot_directory");
await mkdir(screenshotDir, { recursive: true, mode: 0o700 });
let browser, server, checks = 0, base, chosenDecision = null;
const id = randomUUID(), version = randomUUID(), hash = "sha256:" + "a".repeat(64);
const scopes = ["editorial", "rights", "factual", "safety", "media", "publisher_acceptance"];
const data = { candidate: { id, kind: "article", external_id: "synthetic-browser-article" },
  version: { id: version, title: "Synthetic article review fixture", content_hash: hash,
    payload: { desk: "world_affairs", body: 'Synthetic article. <img src=x onerror="window.bad=true">', sources: [], media: [], research_refs: ["synthetic-only"] } },
  decisions: [], release_requests: [] };
const state = () => ({ required_scopes: scopes, approved_scopes: chosenDecision ? [chosenDecision.scope] : [], reviews_complete: false });
const receipt = value => ({ ok: true, ...value, public_output_allowed: false, runtime_activation: false });
const requests = [], errors = [];
function fakeFetch(url, options) {
  assert(new URL(url).hostname === "synthetic.example.invalid");
  const pathname = new URL(url).pathname;
  let value;
  if (pathname === "/auth/v1/token") value = { access_token: "synthetic.jwt.token", expires_in: 3600 };
  else if (pathname === "/auth/v1/user") value = { id: "synthetic-reviewer" };
  else if (pathname === "/auth/v1/logout") value = {};
  else {
    const { p_command: command } = JSON.parse(options.body);
    switch (command.action) {
      case "session": value = receipt({ actor_id: "synthetic-reviewer", capabilities: [{ kind: "article", scope: "intake" }, { kind: "article", scope: "editorial" }, { kind: "article", scope: "release" }] }); break;
      case "list": value = receipt({ items: [{ id, kind: "article", external_id: data.candidate.external_id, version_id: version, content_hash: hash, title: data.version.title, review_state: state() }] }); break;
      case "open": value = receipt({ ...data, review_state: state() }); break;
      case "decision":
        assert.equal(command.content_hash, hash); assert.equal(command.version_id, version); assert.equal(command.candidate_id, id);
        chosenDecision = command; data.decisions.push({ ...command, actor_id: "synthetic-reviewer" }); value = receipt({ decision_id: randomUUID(), review_state: state() }); break;
      default: throw new Error("unexpected_browser_fixture_operation");
    }
  }
  return Promise.resolve({ ok: true, json: async () => value });
}
const check = (name, value) => { assert(value, name); checks++; console.log("PASS browser: " + name); };
try {
  let handler;
  server = createServer((req, res) => {
    res.status = n => { res.statusCode = n; return res; };
    res.json = value => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(value)); return res; };
    res.send = value => { res.end(value); return res; };
    handler(req, res).catch(() => { res.statusCode = 500; res.end("fixture_error"); });
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  base = "http://127.0.0.1:" + server.address().port;
  handler = createEditorialWorkspaceHandler({ env: { EDITORIAL_WORKSPACE_ENABLED: "true", EDITORIAL_WORKSPACE_ORIGIN: base,
    SUPABASE_URL: "https://synthetic.example.invalid", SUPABASE_ANON_KEY: "synthetic-anon-only" }, fetcher: fakeFetch });
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.route("**/*", route => {
    const url = route.request().url();
    if (!url.startsWith(base + "/")) { requests.push(url); return route.abort(); }
    return route.continue();
  });
  const page = await context.newPage(); page.on("pageerror", error => errors.push(error.message));
  await page.goto(base + "/api/editorial-workspace");
  check("unauthenticated response contains login only", await page.locator("#login-form").count() === 1 && !(await page.content()).includes(data.version.title));
  await page.locator('[name="email"]').fill("synthetic-reviewer@example.invalid");
  await page.locator('[name="password"]').fill("synthetic-not-a-real-credential");
  await page.locator('#login-form [type="submit"]').click();
  await page.waitForSelector(".candidate");
  check("session verified before queue display", (await page.locator("#session-label").innerText()).includes("Authenticated"));
  const cookies = await context.cookies();
  check("session cookie is HttpOnly and Strict", cookies.some(c => c.name === "drishvara_editorial_local" && c.httpOnly && c.sameSite === "Strict"));
  check("auth token never exposed to JavaScript", !(await page.evaluate(() => document.cookie)).includes("synthetic.jwt.token"));
  await page.locator(".candidate").click();
  await page.waitForSelector(".review-form");
  check("only assigned permitted review scope is selectable", await page.locator(".review-form select").first().locator("option").count() === 1);
  check("pending reviews disable release", await page.getByRole("button", { name: "Request controlled release", exact: true }).isDisabled());
  check("malicious draft markup stays text, never DOM", await page.locator('#document img').count() === 0 && !(await page.evaluate(() => window.bad)));
  check("immutable version hash is displayed", (await page.locator(".hash").innerText()) === hash);
  check("Arial body and Cambria headings", await page.evaluate(() => getComputedStyle(document.body).fontFamily.startsWith("Arial") && getComputedStyle(document.querySelector("h1")).fontFamily.startsWith("Cambria")));
  check("generated hero has loaded", await page.locator(".hero").evaluate(async e => { const u=getComputedStyle(e).backgroundImage.match(/url\("?([^"\)]+)/)?.[1]; if(!u)return false; const i=new Image(); i.src=u; await i.decode(); return i.naturalWidth>1000; }));
  await page.locator('.review-form select').nth(1).selectOption("approve");
  await page.locator('.review-form textarea').nth(0).fill("Synthetic independent browser-test decision only.");
  await page.locator('.review-form textarea').nth(1).fill("synthetic-evidence-only");
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Record decision", exact: true }).click();
  await page.waitForFunction(() => document.querySelector(".scope-list")?.textContent.includes("editorial: Approved"));
  check("decision command binds exact version and hash", chosenDecision.content_hash === hash && chosenDecision.version_id === version);
  check("one approval cannot unlock other scopes or release", await page.locator(".scope-list .complete").count() === 1 && await page.getByRole("button", { name: "Request controlled release", exact: true }).isDisabled());
  for (const [width, height] of [[1440,1000],[768,1024],[390,844]]) {
    await page.setViewportSize({ width, height }); await page.evaluate(() => scrollTo(0,0));
    check("no overflow at " + width, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    check("review document fits at " + width, await page.locator("#document").evaluate(e => { const r=e.getBoundingClientRect(); return r.left>=0&&r.right<=innerWidth+1; }));
    if (width !== 768) await page.screenshot({ path: path.join(screenshotDir, "authenticated-synthetic-" + width + ".png"), fullPage: true });
  }
  await page.locator("#intake-open").click();
  check("mobile intake dialog fits viewport", await page.locator("dialog").evaluate(e => { const r=e.getBoundingClientRect(); return r.left>=0&&r.right<=innerWidth+1; }));
  await page.keyboard.press("Escape");
  check("dialog Escape returns focus", await page.locator("#intake-open").evaluate(e => e === document.activeElement));
  check("no external browser requests", requests.length === 0);
  check("no runtime errors", errors.length === 0);
  check("no browser token or decision persistence", await page.evaluate(() => localStorage.length === 0 && sessionStorage.length === 0));
  await page.locator("#sign-out").click(); await page.waitForSelector("#login-form");
  check("sign-out clears private UI", await page.locator("#document").count() === 0);
  console.log(`Editorial workspace browser: ${checks} checks passed. Auth/decisions are explicitly synthetic; no hosted connection.`);
} finally {
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
}
