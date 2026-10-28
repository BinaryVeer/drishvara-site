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
let browser, server, checks = 0, base, chosenDecision = null, fixtureAdmin = false, fixtureAllApproved = false, fixtureDelivery = false, releaseRequests = 0;
const id = randomUUID(), version = randomUUID(), hash = "sha256:" + "a".repeat(64);
const scopes = ["editorial", "rights", "factual", "safety", "media", "publisher_acceptance"];
const data = { candidate: { id, kind: "article", external_id: "synthetic-browser-article", created_by: "synthetic-author" },
  version: { id: version, title: "Synthetic article review fixture", content_hash: hash,
    payload: { desk: "world_affairs", body: 'Synthetic article. <img src=x onerror="window.bad=true">', sources: [], media: [], research_refs: ["synthetic-only"] } },
  decisions: [], release_requests: [] };
const state = () => ({ required_scopes: scopes, approved_scopes: fixtureAllApproved ? scopes : chosenDecision ? [chosenDecision.scope] : [], reviews_complete: fixtureAllApproved });
const receipt = value => ({ ok: true, ...value, public_output_allowed: false, runtime_activation: false });
const requests = [], errors = [];
const accessDecisions = [];
function fakeFetch(url, options) {
  assert(new URL(url).hostname === "synthetic.example.invalid");
  const pathname = new URL(url).pathname;
  let value;
  if (pathname === "/auth/v1/token") value = { access_token: "synthetic.jwt.token", expires_in: 3600 };
  else if (pathname === "/auth/v1/user") value = { id: "synthetic-reviewer" };
  else if (pathname === "/auth/v1/logout") value = {};
  else if (pathname === "/rest/v1/rpc/editorial_delivery_readiness") value = receipt({ delivery_enabled: fixtureDelivery });
  else {
    const { p_command: command } = JSON.parse(options.body);
    switch (command.action) {
      case "session": value = receipt({ actor_id: "synthetic-reviewer", is_administrator: fixtureAdmin, self_review_policy_ref: "drishvara-editorial-admin-self-review@1", publisher_delivery_enabled: false,
        capabilities: [{ kind: "article", scope: "intake" }, { kind: "article", scope: "editorial" }, { kind: "article", scope: "release" }, ...(fixtureAdmin ? [{ kind: "article", scope: "publisher_acceptance" }] : [])] }); break;
      case "list": value = receipt({ items: [{ id, kind: "article", external_id: data.candidate.external_id, version_id: version, content_hash: hash, title: data.version.title, review_state: state() }] }); break;
      case "open": value = receipt({ ...data, review_state: state(), can_edit: true,
        review_permissions: { can_review: true, can_request_release: true, self_review_exception_required: fixtureAdmin } }); break;
      case "people": value = receipt({ people: [{ email: "synthetic-member@example.invalid", capabilities: [] }], audit_events: accessDecisions }); break;
      case "lookup_person": value = receipt({ person: { id: "synthetic-member", email: command.email, capabilities: [], assignments: [] } }); break;
      case "set_capability": case "set_assignment": accessDecisions.push(command); value = receipt({ event_id: randomUUID() }); break;
      case "decision":
        assert.equal(command.content_hash, hash); assert.equal(command.version_id, version); assert.equal(command.candidate_id, id);
        chosenDecision = command; data.decisions.push({ ...command, actor_id: "synthetic-reviewer" }); value = receipt({ decision_id: randomUUID(), review_state: state() }); break;
      case "request_release": releaseRequests++; value = receipt({ release_request_id: randomUUID(), status: "pending_existing_publisher_validation" }); break;
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
    SUPABASE_URL: "https://synthetic.example.invalid", SUPABASE_ANON_KEY: "synthetic-anon-only", SUPABASE_SECRET_KEY: "synthetic-server-only",
    EDITORIAL_DELIVERY_ENABLED: "true", EDITORIAL_DELIVERY_AUTHORIZATION_REF: "synthetic-authorization-only" }, fetcher: fakeFetch });
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
  check("ordinary reviewer has no People management tab", await page.locator("#tab-people").isHidden());
  await page.locator("#tab-publishing").click();
  check("pending reviews disable release", await page.getByRole("button", { name: "Request controlled release", exact: true }).isDisabled());
  check("publishing distinguishes a release request from public publication", (await page.locator(".delivery-status").innerText()).includes("not publication"));
  check("release panel names the actual missing scopes", (await page.locator(".release-readiness").innerText()).includes("publisher acceptance"));
  await page.getByRole("button", { name: "Check release readiness", exact: true }).click();
  await page.waitForFunction(() => document.querySelector(".release-readiness")?.textContent.includes("not been activated"));
  check("readiness remains usable without requesting or publishing a release", releaseRequests === 0);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.locator("#review").scrollIntoViewIfNeeded();
    check("release readiness has no horizontal overflow at " + width, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: path.join(screenshotDir, "release-readiness-synthetic-" + width + ".png"), fullPage: false });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator("#tab-review").click(); await page.waitForSelector(".review-form");
  check("malicious draft markup stays text, never DOM", await page.locator('#document img').count() === 0 && !(await page.evaluate(() => window.bad)));
  check("immutable version hash is displayed", (await page.locator(".hash").innerText()) === hash);
  check("Arial body and Cambria headings", await page.evaluate(() => getComputedStyle(document.body).fontFamily.startsWith("Arial") && getComputedStyle(document.querySelector("h1")).fontFamily.startsWith("Cambria")));
  check("generated hero has loaded", await page.locator(".hero").evaluate(async e => { const u=getComputedStyle(e).backgroundImage.match(/url\("?([^"\)]+)/)?.[1]; if(!u)return false; const i=new Image(); i.src=u; await i.decode(); return i.naturalWidth>1000; }));
  await page.locator('.review-form select').nth(1).selectOption("approve");
  await page.locator('.review-form textarea').nth(0).fill("Synthetic independent browser-test decision only.");
  await page.getByRole("button", { name: "Record decision", exact: true }).click();
  check("empty approval evidence is rejected at the actual form field", chosenDecision === null && await page.locator('.review-form textarea').nth(1).evaluate(e => e.validity.valueMissing));
  await page.locator('.review-form textarea').nth(1).fill("same-reference\nsame-reference");
  await page.getByRole("button", { name: "Record decision", exact: true }).click();
  check("duplicate evidence has a specific validation message and no saved decision", chosenDecision === null && (await page.locator('.review-form textarea').nth(1).evaluate(e => e.validationMessage)).includes("duplicate"));
  await page.locator('.review-form textarea').nth(1).fill("synthetic-evidence-only");
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Record decision", exact: true }).click();
  await page.waitForFunction(() => document.querySelector(".scope-list")?.textContent.includes("editorial: Approved"));
  check("decision command binds exact version and hash", chosenDecision.content_hash === hash && chosenDecision.version_id === version);
  check("one approval cannot unlock other scopes", await page.locator(".scope-list .complete").count() === 1);
  await page.locator("#tab-publishing").click();
  check("one approval still cannot unlock release", await page.getByRole("button", { name: "Request controlled release", exact: true }).isDisabled());
  await page.locator("#tab-review").click(); await page.waitForSelector(".review-form");
  for (const [width, height] of [[1440,1000],[768,1024],[390,844]]) {
    await page.setViewportSize({ width, height }); await page.evaluate(() => scrollTo(0,0));
    check("no overflow at " + width, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    check("review document fits at " + width, await page.locator("#document").evaluate(e => { const r=e.getBoundingClientRect(); return r.left>=0&&r.right<=innerWidth+1; }));
    if (width !== 768) await page.screenshot({ path: path.join(screenshotDir, "authenticated-synthetic-" + width + ".png"), fullPage: true });
  }
  await page.locator("#intake-open").click();
  check("new intake resets to an allowed content kind", await page.locator('#intake-form [name="kind"]').inputValue() === "article");
  check("mobile intake dialog fits viewport", await page.locator("dialog").evaluate(e => { const r=e.getBoundingClientRect(); return r.left>=0&&r.right<=innerWidth+1; }));
  await page.keyboard.press("Escape");
  check("dialog Escape returns focus", await page.locator("#intake-open").evaluate(e => e === document.activeElement));
  check("no external browser requests", requests.length === 0);
  check("no runtime errors", errors.length === 0);
  check("no browser token or decision persistence", await page.evaluate(() => localStorage.length === 0 && sessionStorage.length === 0));
  await page.getByRole("button", { name: "Propose corrected version", exact: true }).click();
  check("revision dialog binds original identity and current version", await page.locator('[name="external_id"]').inputValue() === data.candidate.external_id && await page.locator('[name="expected_version_id"]').inputValue() === version);
  check("revision dialog preserves complete immutable payload", JSON.stringify(JSON.parse(await page.locator('[name="payload"]').inputValue())) === JSON.stringify(data.version.payload));
  await page.keyboard.press("Escape");
  fixtureAdmin = true; await page.reload(); await page.waitForSelector(".candidate"); await page.locator(".candidate").click(); await page.waitForSelector(".review-form");
  check("designated Admin sees separate People, Acceptance and Publishing areas", await page.locator("#tab-people").isVisible() && await page.locator("#tab-acceptance").isVisible() && await page.locator("#tab-publishing").isVisible());
  check("Admin self-review needs a separate unchecked acknowledgment", await page.locator(".self-review-notice input").isChecked() === false && await page.locator(".self-review-notice textarea").getAttribute("required") !== null);
  check("Review excludes publisher acceptance", !(await page.locator(".review-form select").first().locator("option").allTextContents()).includes("publisher acceptance"));
  await page.locator("#tab-acceptance").click(); await page.waitForSelector(".review-form");
  check("Acceptance contains only publisher acceptance", JSON.stringify(await page.locator(".review-form select").first().locator("option").allTextContents()) === JSON.stringify(["publisher acceptance"]));
  await page.locator("#tab-people").click(); await page.waitForSelector("#people-register section");
  await page.locator('#person-lookup [name="email"]').fill("synthetic-member@example.invalid");
  await page.locator('#person-lookup button').click(); await page.waitForSelector("#access-controls:not([hidden])");
  await page.locator('#capability-form [name="kind"]').selectOption("article");
  await page.locator('#capability-form [name="scope"]').selectOption("editorial");
  await page.locator('#capability-form [name="note"]').fill("Synthetic verified appointment for browser mechanics only.");
  page.once("dialog", dialog => dialog.accept()); await page.locator('#capability-form button').click();
  await page.waitForFunction(() => document.querySelector("#access-history")?.textContent.includes("set_capability"));
  check("Admin appointment binds exact email, kind and scope", accessDecisions.length === 1 && accessDecisions[0].email === "synthetic-member@example.invalid" && accessDecisions[0].scope === "editorial" && accessDecisions[0].kind === "article");
  check("ordinary access does not fabricate qualification evidence", accessDecisions[0].qualification_ref === null && accessDecisions[0].qualification_verified === false);
  await page.locator('#person-lookup [name="email"]').fill("other@example.invalid");
  check("changing email clears the prior account and hides grant controls", await page.locator("#access-controls").isHidden());
  await page.locator('#person-lookup [name="email"]').fill("synthetic-member@example.invalid");
  await page.locator('#person-lookup button').click(); await page.waitForSelector("#access-controls:not([hidden])");
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => scrollTo(0, 0));
    check("People view has no horizontal overflow at " + width, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    check("one workspace shell at " + width, await page.locator(".masthead").count() === 1 && await page.locator(".hero").count() === 1);
    await page.screenshot({ path: path.join(screenshotDir, "admin-people-synthetic-" + width + ".png"), fullPage: width !== 390 });
    if (width === 390) {
      await page.locator("#capability-form").evaluate(e => e.scrollIntoView({ block: "start" }));
      await page.screenshot({ path: path.join(screenshotDir, "admin-access-controls-synthetic-390.png"), fullPage: false });
    }
  }
  await page.locator("#tab-review").focus(); await page.keyboard.press("ArrowRight");
  check("workspace tabs support keyboard navigation", await page.locator("#tab-acceptance").getAttribute("aria-selected") === "true");
  fixtureAllApproved = true;
  await page.locator("#tab-publishing").click();
  await page.waitForFunction(() => document.querySelector(".scope-list")?.querySelectorAll(".complete").length === 6);
  check("complete synthetic approvals unlock the controlled-release request", await page.getByRole("button", { name: "Request controlled release", exact: true }).isEnabled());
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Request controlled release", exact: true }).click();
  await page.waitForFunction(() => document.querySelector("#message")?.textContent.includes("Delivery is disabled"));
  check("disabled operational delivery saves a request without claiming publication", releaseRequests === 1 && (await page.locator("#message").innerText()).includes("nothing was published"));
  fixtureDelivery = true;
  await page.getByRole("button", { name: "Check release readiness", exact: true }).click();
  check("activated delivery exposes an enabled public Article action only for the fully reviewed copy", await page.getByRole("button", { name: "Publish approved article", exact: true }).isEnabled());
  check("activated connection is stated separately from content approval", (await page.locator(".delivery-status").innerText()).includes("Article publishing is connected"));
  fixtureAllApproved = false;
  await page.locator("#refresh").click();
  await page.getByRole("button", { name: "Check release readiness", exact: true }).click();
  check("active publishing still blocks an unreviewed copy", await page.getByRole("button", { name: "Publish approved article", exact: true }).isDisabled());
  check("server credential never appears in the active publication screen", !(await page.content()).includes("synthetic-server-only"));
  await page.locator("#tab-review").click(); await page.waitForSelector(".review-form");
  check("a successful action clears stale error and delivery messages", (await page.locator("#message").innerText()) === "");
  fixtureAllApproved = false;
  check("extended Admin UI makes no external requests or runtime errors", requests.length === 0 && errors.length === 0);
  await page.locator("#sign-out").click(); await page.waitForSelector("#login-form");
  check("sign-out clears private UI", await page.locator("#document").count() === 0);
  console.log(`Editorial workspace browser: ${checks} checks passed. Auth/decisions are explicitly synthetic; no hosted connection.`);
} finally {
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
}
