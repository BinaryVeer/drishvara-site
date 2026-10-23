import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { execFileSync } from "node:child_process";

const read = p => fs.readFileSync(p, "utf8");
const home = read("assets/js/drishvara-v2-home.js");
const shell = read("assets/js/drishvara-v2-shell.js");
let checks = 0;
function check(name, run) {
  run(); checks += 1; console.log("PASS " + name);
}

const contracts = [
  { path: "panchang.html", kind: "time", entry: "panchang", required: [
    "panchang-festival-card", "panchang-date-text", "panchang-date-picker",
    "panchang-previous-day", "panchang-today", "panchang-next-day", "panchang-calculate",
    "panchang-place-select", "panchang-place-alias", "panchang-latitude", "panchang-longitude",
    "panchang-timezone", "panchang-sunrise", "panchang-sunset", "panchang-tithi",
    "panchang-nakshatra", "panchang-yoga", "panchang-karana", "panchang-paksha", "panchang-vara",
    "upcoming-observance-name", "upcoming-observance-begins", "upcoming-observance-ends",
    "upcoming-observance-ritual-window", "ag74i-book-previous", "ag74i-book-next"
  ] },
  { path: "what-stars-say.html", kind: "reflect", entry: "reflect", required: [
    "star-reflection-dob", "star-reflection-birth-time", "star-birth-time-unknown",
    "star-birth-place-select", "star-birth-latitude", "star-birth-longitude", "star-birth-timezone"
  ] }
];
const scriptAllowlist = ["sup02-panchang-server-controller", "drishvara-v2-shell",
  "drishvara-v2-i18n", "drishvara-v2-location", "drishvara-v2-home"];
const shellPages = ["index.html", "insights.html", "dashboard.html", "submissions.html",
  "about.html", "contact.html", "signin.html", "login.html", "article.html"];
check("all existing public shell consumers use the F1 navigation asset version", () => {
  for (const path of shellPages) assert(/drishvara-v2-shell\.js\?v=dv2-f1-20261023/.test(read(path)), path);
});
for (const page of contracts) {
  const html = read(page.path);
  check(page.path + " has an early UTF-8 document declaration", () => {
    assert(html.startsWith("<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">"));
  });
  check(page.path + " has unique static IDs", () => {
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
    assert.equal(new Set(ids).size, ids.length);
  });
  check(page.path + " preserves every runtime-owned input/output", () => {
    for (const id of page.required) assert(html.includes('id="' + id + '"'), id);
  });
  check(page.path + " loads one unchanged runtime and its scoped entry in order", () => {
    const scripts = [...html.matchAll(/<script src="assets\/js\/([^"?]+)\.js(?:\?v=[^"]+)?"/g)].map(m => m[1]);
    assert.deepEqual(scripts, [...scriptAllowlist, "drishvara-v2-" + page.entry]);
    assert(!/<script(?! src=)/.test(html));
  });
  check(page.path + " preserves section ownership, language and semantic navigation", () => {
    assert(html.includes('id="' + page.kind + '"'));
    assert(html.includes('id="dv2-' + page.kind + '-host"'));
    assert.equal((html.match(/data-dv2-language-choice=/g) || []).length, 2);
    assert.equal((html.match(/<h1>/g) || []).length, 1);
    assert(html.includes('href="#dv2-main"'));
  });
  check(page.path + " has no personal persistence or historical prototype scripts", () => {
    assert(!/localStorage|sessionStorage|indexedDB|ag72e.*\.js|ag74o.*\.js/i.test(html));
  });
  check(page.path + " scoped entry mounts only its own presentation", () => {
    const calls = [];
    vm.runInNewContext(read("assets/js/drishvara-v2-" + page.entry + ".js"), {
      window: { DrishvaraV2RuntimePresentation: { mount: kind => calls.push(kind) } },
      document: { readyState: "complete", getElementById() { return null; } }
    });
    assert.deepEqual(calls, [page.kind]);
  });
}
check("Panchang retains all four annual-book page buttons", () => {
  const html = read("panchang.html");
  assert.deepEqual([...html.matchAll(/data-ag74i-book-page-button="(\d)"/g)].map(m => m[1]), ["1", "2", "3", "4"]);
});
check("Star retains the quarantinable legacy shell and exact result action", () => {
  const html = read("what-stars-say.html");
  assert(html.includes('data-ag71d-place-select-shell="star-reflection"'));
  assert(html.includes('data-ag71e-preview-button="star-reflection"'));
  assert(html.includes('data-ag71e-preview-panel="star-reflection"'));
});

function loadHome(pathname, hash = "") {
  const events = {}, redirects = [], w = { addEventListener: (key, fn) => { events[key] = fn; } };
  const context = { window: w, URL, location: { pathname, hash, search: "?qa=f1",
    href: "http://localhost:8000" + pathname + "?qa=f1" + hash,
    replace: url => redirects.push(url) }, document: { readyState: "loading", addEventListener() {} } };
  vm.runInNewContext(home, context);
  return { context, redirects, events };
}
for (const [hash, page] of [["#time", "panchang.html"], ["#reflect", "what-stars-say.html"]]) {
  for (const route of ["/", "/index.html", "/drishvara-site/index.html"]) {
    check("legacy " + route + hash + " navigates without mounting another surface", () => {
      const r = loadHome(route, hash);
      assert.equal(r.redirects.length, 1);
      assert(r.redirects[0].endsWith("/" + page + "?qa=f1"));
      assert.equal(r.context.window.DrishvaraV2RuntimePresentation, undefined);
    });
  }
  check("in-page " + hash + " navigation remains compatible", () => {
    const r = loadHome("/"); r.context.location.hash = hash; r.events.hashchange();
    assert(r.redirects[0].endsWith("/" + page + "?qa=f1"));
  });
}
for (const pathname of ["/panchang.html", "/what-stars-say.html"]) {
  check(pathname + " exposes presentation without mounting the homepage", () => {
    const r = loadHome(pathname);
    assert.equal(typeof r.context.window.DrishvaraV2RuntimePresentation.mount, "function");
    assert.equal(r.events.hashchange, undefined);
    assert.deepEqual(r.redirects, []);
  });
}
check("shared navigation routes resolve for homepage, tools and direct article URLs", () => {
  for (const pathname of ["/", "/panchang.html", "/what-stars-say.html", "/articles/world/example.html"]) {
    const w = {};
    vm.runInNewContext(shell.replace("window.DrishvaraV2Shell = {", "window.testWorldHref = worldHref; window.DrishvaraV2Shell = {"), { window: w, location: { pathname } });
    const prefix = pathname.startsWith("/articles/") ? "../../" : "";
    assert.equal(w.testWorldHref("time"), prefix + "panchang.html");
    assert.equal(w.testWorldHref("reflect"), prefix + "what-stars-say.html");
    for (const id of ["read", "explore", "knowledge"]) assert.equal(w.testWorldHref(id), pathname === "/" ? "#" + id : prefix + "index.html#" + id);
  }
});
check("homepage keeps its editorial renderers and quarantined background bridge", () => {
  for (const marker of ["renderFirstLight(homepage, indexData)", "renderFeatured(homepage, indexData)",
    'page.setAttribute("data-drishvara-v2-legacy-shell", "true")', "surface.inert = true",
    'surface.setAttribute("data-dv2-background-runtime", "true")']) assert(home.includes(marker), marker);
});
check("async completion sync is presentation-only and narrowly attribute-scoped", () => {
  const block = home.slice(home.indexOf("function bindRuntimeCompletionPresentation"), home.indexOf("function bootRuntimePresentation"));
  assert(block.includes('attributeFilter: ["data-sup02-request-state"]'));
  assert(block.includes('attributeFilter: ["aria-busy"]'));
  assert(!/fetch\(|ApplySelection\(|setInterval|setTimeout|childList|subtree/.test(block));
  assert(home.includes("monthLabel(selected.key, selected.records, lang)"));
  assert(!home.includes("formatMonthYear("));
});
check("existing public location, observance and research scope remains governed", () => {
  const base = "data/knowledge-base/";
  const locations = JSON.parse(read(base + "location-intelligence/production/ag74p-approved-location-projection.json"));
  assert.equal(locations.records.length, 5);
  for (const r of locations.records) for (const k of ["canonical_place_approved", "coordinate_approved", "timezone_approved", "public_selection_approved", "computation_approved", "public_output_allowed"]) assert.equal(r[k], true);
  assert.equal(JSON.parse(read(base + "panchang-festival/production/ag74p-approved-festival-observance-projection.json")).records.length, 114);
  const research = JSON.parse(read(base + "panchang-festival/production/ag76-r2b-festival-rule-evidence-benchmarks.json"));
  assert.equal(research.target_records.length, 29);
  assert.equal(research.runtime_activation, false); assert.equal(research.public_output_allowed, false);
  assert(research.target_records.every(r => r.approval_state.production_readiness === "not_ready"));
});

if (process.argv.includes("--check-preservation")) {
  const protectedFiles = ["assets/js/sup02-panchang-server-controller.js", "vercel.json", "assets/logo/logo.png",
    "data/homepage-ui.json", "data/article-index.json",
    "data/knowledge-base/location-intelligence/production/ag74p-approved-location-projection.json",
    "data/knowledge-base/panchang-festival/production/ag74p-approved-daily-calendar-projection.json",
    "data/knowledge-base/panchang-festival/production/ag74p-approved-festival-observance-projection.json",
    "data/knowledge-base/panchang-festival/production/ag74n-varanasi-samvat-2083-annual-calendar.json",
    "data/knowledge-base/panchang-festival/production/ag76-r2b-festival-rule-evidence-benchmarks.json"];
  const baseline = p => execFileSync("git", ["show", "cb79fb6655e14a0dceebf1349c306f395f155333:" + p], { maxBuffer: 64 * 1024 * 1024 });
  for (const path of shellPages) check("existing page changes are asset-version-only: " + path, () => {
    const normalise = text => text.replace(/(drishvara-v2-(?:home\.(?:js|css)|shell\.js)\?v=)[^"]+/g, "$1VERSION");
    assert.equal(normalise(read(path)), normalise(baseline(path).toString()));
  });
  for (const suffix of ["k-panchang-input-resolver", "l-astronomical-engine", "m-panchang-day-orchestrator", "n-panchang-calendar-engine"]) protectedFiles.push("scripts/lib/ag74" + suffix + ".mjs");
  for (const part of ["astronomy-adapter", "approval-gate", "rule-engine"]) protectedFiles.push("scripts/lib/ag76-festival-" + part + ".mjs");
  protectedFiles.push("scripts/validate-ag76-festival-rule-engine.mjs", "data/methodology/star-reflection/ag75c-expanded-star-reflection-output-bank.json");
  for (const p of protectedFiles) check("byte-identical protected owner: " + p, () => {
    assert(fs.readFileSync(p).equals(baseline(p)));
  });
}
console.log("F1 validation passed: " + checks + " focused checks. Synthetic route fixtures are not browser or astronomical approvals.");
