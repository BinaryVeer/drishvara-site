import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";

const read = p => fs.readFileSync(p, "utf8");
const json = p => JSON.parse(read(p));
const source = read("assets/js/drishvara-v2-homepage.js");
const homepage = json("data/homepage-ui.json");
const index = json("data/article-index.json");
const base = "8f96d92f423fece74ca0a3000568f7a1c7a56995";
let count = 0;
function check(name, run) { run(); count++; console.log("PASS " + name); }
function fixture(reduced = false) {
  const events = {}, timers = new Map(), media = { matches: reduced, addEventListener: (k, fn) => { events["media:" + k] = fn; } };
  const node = () => ({ attributes: {}, hidden: false, inert: false, textContent: "", disabled: false,
    setAttribute(k, v) { this.attributes[k] = v; }, hasAttribute(k) { return k in this.attributes; },
    getAttribute(k) { return this.attributes[k] ?? null; }, focus() {} });
  const slides = Array.from({ length: 5 }, node), buttons = Array.from({ length: 5 }, node), pause = node(), counter = node();
  const host = { innerHTML: "", addEventListener: (k, fn) => { events[k] = fn; }, contains: x => x === pause,
    querySelectorAll: s => s === "[data-f2-slide]" ? slides : buttons,
    querySelector: s => s === "[data-f2-pause]" ? pause : counter };
  let nextTimer = 0;
  const document = { hidden: false, getElementById: () => host, addEventListener: (k, fn) => { events["document:" + k] = fn; } };
  const window = { DrishvaraV2Shell: { publicItems: d => d.publishedItems || [], escapeHtml: s => String(s ?? "").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;"), articleHref: i => i.url },
    matchMedia: () => media, setInterval: (fn, ms) => { timers.set(++nextTimer, { fn, ms }); return nextTimer; },
    clearInterval: id => timers.delete(id), addEventListener: (k, fn) => { events["window:" + k] = fn; } };
  vm.runInNewContext(source, { window, document, Intl, Date, Map, Set });
  return { api: window.DrishvaraV2Homepage, events, timers, slides, buttons, pause, counter, host, document,
    click(attribute, value = "") { const target = node(); target.setAttribute(attribute, value); target.closest = () => target; events.click({ target }); } };
}
const f = fixture(), api = f.api;
check("five distinct canonical published stories, no fabrication", () => {
  const selected = api.selectFeatured(homepage, index);
  assert.equal(selected.length, 5); assert.equal(new Set(selected.map(i => i.sourcePath)).size, 5);
  for (const item of selected) assert.equal(item, index.publishedItems.find(i => i.sourcePath === item.sourcePath));
});
check("stale feature metadata cannot override canonical image/title/link", () => {
  const result = api.selectFeatured({ featuredReads: [{ ...homepage.featuredReads[0], title: "stale", image: "wrong", url: "wrong" }] }, index);
  assert.equal(result[0], index.publishedItems[0]);
});
check("duplicates and unpublished candidates cannot fill slots", () => {
  const result = api.selectFeatured({ featuredReads: [homepage.featuredReads[0], homepage.featuredReads[0], { sourcePath: "generated/draft.json" }] }, { publishedItems: index.publishedItems.slice(0, 2) });
  assert.equal(result.length, 2);
});
check("empty published index remains empty", () => assert.equal(api.selectFeatured(homepage, {}).length, 0));
check("homepage data adds only a fifth canonical story", () => {
  const old = JSON.parse(execFileSync("git", ["show", base + ":data/homepage-ui.json"], { encoding: "utf8" }));
  assert.deepEqual(homepage.featuredReads.slice(0,4), old.featuredReads);
  assert.deepEqual({ ...homepage, featuredReads: [] }, { ...old, featuredReads: [] });
  assert.equal(homepage.featuredReads.length, 5);
});
check("actual carousel installs exactly one seven-second timer", () => {
  api.renderFeatured(homepage, index); assert.equal(f.timers.size, 1); assert.equal([...f.timers.values()][0].ms, 7000);
  assert.equal(f.counter.textContent, "1 / 5");
});
check("timer actually advances the selected slide without rebuilding controls", () => {
  const markup = f.host.innerHTML; [...f.timers.values()][0].fn();
  assert.equal(f.counter.textContent, "2 / 5"); assert.equal(f.slides[1].hidden, false); assert.equal(f.slides[0].inert, true);
  assert.equal(f.host.innerHTML, markup);
});
check("hover pauses and leaving resumes", () => { f.events.mouseenter(); assert.equal(f.timers.size,0); f.events.mouseleave(); assert.equal(f.timers.size,1); });
check("focus pauses without replacing focused controls", () => { f.events.focusin(); assert.equal(f.timers.size,0); f.events.focusout({ relatedTarget: null }); assert.equal(f.timers.size,1); });
check("manual next pauses persistently", () => { f.click("data-f2-next"); assert.equal(f.counter.textContent,"3 / 5"); assert.equal(f.timers.size,0); f.events.mouseleave(); assert.equal(f.timers.size,0); });
check("previous and thumbnail selection work", () => { f.click("data-f2-prev"); assert.equal(f.counter.textContent,"2 / 5"); f.click("data-f2-story","4"); assert.equal(f.counter.textContent,"5 / 5"); });
check("explicit resume starts rotation", () => { f.click("data-f2-pause"); assert.equal(f.timers.size,1); });
check("hidden document pauses rotation", () => { f.document.hidden = true; f.events["document:visibilitychange"](); assert.equal(f.timers.size,0); });
check("reduced motion disables automatic rotation", () => { const r = fixture(true); r.api.renderFeatured(homepage,index); assert.equal(r.timers.size,0); assert.equal(r.pause.disabled,true); });
check("live reduced-motion preference change stops rotation", () => { f.events["media:change"]({ matches:true }); assert.equal(f.timers.size,0); assert.equal(f.pause.disabled,true); });
check("keyboard End/Home and arrows exercise manual selection", () => {
  const target = { closest: () => true };
  for (const [key, expected] of [["Home","1 / 5"],["ArrowLeft","5 / 5"],["ArrowRight","1 / 5"],["End","5 / 5"]]) {
    f.events.keydown({ key, target, preventDefault() {} }); assert.equal(f.counter.textContent,expected);
  }
});
check("carousel model wraps deterministically", () => { const m=api.carouselModel(5,false); assert.equal(m.go(-1),4); assert.equal(m.go(5),0); });
check("rotation is not a screen-reader live region", () => assert(!/aria-live|role="alert"/.test(f.host.innerHTML)));
check("hero and all five day cards are present", () => {
  const html=api.markup(); for(const label of ["First Light","Your Day at a Glance","Today\u2019s Panchang","Today\u2019s Observance","Word of the Day","Colour of the Day","Mantra of the Day"]) assert(html.includes(label));
  assert.equal((html.match(/class="f2-day-card/g)||[]).length,5);
});
const now=new Date("2026-10-23T10:00:00Z"), state={requestDirty:false,lastCommittedRequest:{civil_date:"2026-10-23",timezone:"Asia/Kolkata"}};
check("approved second attachment is preserved byte-for-byte", () => {
  const p=json("assets/hero/varanasi-sunset-ai.provenance.json");
  assert.equal(p.source_attachment_filename,"ChatGPT Image Oct 23, 2026, 02_36_35 PM-4.png");
  assert.equal(createHash("sha256").update(fs.readFileSync(p.asset_path)).digest("hex"),p.sha256);
});
check("AI-generated hero has truthful public provenance, not photographer credit", () => {
  const html=api.markup(), p=json("assets/hero/varanasi-sunset-ai.provenance.json");
  assert(html.includes(p.asset_path)); assert(html.includes(p.public_disclosure)); assert.equal(p.photographer,null); assert.equal(p.license,null);
  assert(!/Ilya Mauter|CC BY|varanasi-sunrise/.test(html));
});
check("Admin hero video remains a future requirement only", () => {
  const future=json("assets/hero/varanasi-sunset-ai.provenance.json").future_admin_hero_media_requirement;
  assert.equal(future.implemented_in_f2,false); assert.equal(future.maximum_video_duration_seconds,8);
  assert(!/<video|type="file"/.test(api.markup()));
});
check("today's committed calculated result is eligible", () => assert(api.isTodayResult(state,"committed","calculated",now)));
check("yesterday is never presented as today's result", () => assert(!api.isTodayResult({...state,lastCommittedRequest:{...state.lastCommittedRequest,civil_date:"2026-10-22"}},"committed","calculated",now)));
check("pending changes withhold daily data", () => assert(!api.isTodayResult({...state,requestDirty:true},"committed","calculated",now)));
check("unavailable runtime withholds daily data", () => assert(!api.isTodayResult(state,"committed","governed_unavailable",now)));
check("uncommitted data is withheld", () => assert(!api.isTodayResult(state,"loading","calculated",now)));
check("missing timezone fails closed", () => assert(!api.isTodayResult({...state,lastCommittedRequest:{civil_date:"2026-10-23"}},"committed","calculated",now)));
check("invalid timezone fails closed", () => assert.equal(api.dayKey(now,"invalid/timezone"),null));
check("local midnight is timezone-specific", () => { const n=new Date("2026-10-22T20:00:00Z"); assert.equal(api.dayKey(n,"Asia/Kolkata"),"2026-10-23"); assert.equal(api.dayKey(n,"UTC"),"2026-10-22"); });
check("word publication gate remains closed", () => assert.equal(api.publicationStatus("word",json("generated/word-of-day.json")),"Under verification"));
check("colour and mantra publication gates remain closed", () => { const d=json("generated/vedic-guidance-working-data.json"); for(const k of ["colour","mantra"]) assert.equal(api.publicationStatus(k,d),"Under verification"); });
check("absent approval flags fail closed", () => { for(const k of ["word","colour","mantra"]) assert.equal(api.publicationStatus(k,{}),"Under verification"); });
check("preview content is never copied into the new daily cards", () => assert(!/word\.sanskrit|mantra_hindi|suggested_colour_hindi|word\.meaning/.test(source)));
check("both pipeline writers select five unique published stories", () => {
  const data={...index,publicLatest:[index.publishedItems[0],index.publishedItems[0],...index.publishedItems.slice(1,5)]};
  const builder=read("scripts/build-homepage-index.js"); let output;
  const begin=builder.indexOf("function updateHomepageUi"), end=builder.indexOf("\nconst indexData = buildIndex()",begin);
  vm.runInNewContext(builder.slice(begin,end)+"\nupdateHomepageUi(data);",{data,homepageUiPath:"home",exists:()=>true,readJsonSafe:()=>JSON.parse(JSON.stringify(homepage)),fs:{writeFileSync:(_p,text)=>{output=JSON.parse(text);}},Set});
  assert.equal(output.featuredReads.length,5); assert.equal(new Set(output.featuredReads.map(x=>x.sourcePath)).size,5);
  const files=new Map([["/repo/data/article-index.json",JSON.stringify(data)],["/repo/data/homepage-ui.json",JSON.stringify(homepage)]]);
  vm.runInNewContext(read("scripts/fix-featured-images.js").replace(/^import .*;\n/gm,""),{fs:{readFileSync:p=>files.get(p),existsSync:()=>false,writeFileSync:(p,text)=>files.set(p,text)},path:{join:(...p)=>p.join("/")},process:{cwd:()=>"/repo"},console:{log(){}},Set});
  const images=JSON.parse(files.get("/repo/data/homepage-ui.json")); assert.equal(images.featuredReads.length,5);
  for(const i of images.featuredReads) assert.equal(i.image,index.publishedItems.find(p=>p.sourcePath===i.sourcePath).image);
});
check("membership and advertisement remain truthful noninteractive scaffolds", () => {
  const html=api.markup(); assert(html.includes("Membership is not yet available")); assert(html.includes("Reserved advertising space"));
  assert.equal((html.match(/aria-label="Advertisement"/g)||[]).length,1); assert(!/payment|premium benefits|ad-free/.test(html));
});
check("no additional calculation, location selection or personal storage owner", () => {
  const deliveryOnly = source.replace('https://pajlabwwszmhjhabxprf.supabase.co/functions/v1/word-of-day', 'approved-read-only-word-feed');
  assert(!/localStorage|sessionStorage|indexedDB|drishvaraSup02ApplySelection|drishvaraSup02ChoosePlace|supabase\.co|new MutationObserver/.test(deliveryOnly));
});
const protectedPaths=["panchang.html","what-stars-say.html","assets/js/drishvara-v2-panchang.js","assets/js/drishvara-v2-reflect.js","assets/js/drishvara-v2-shell.js","assets/js/sup02-panchang-server-controller.js","assets/logo/logo.png","data/article-index.json","generated/word-of-day.json","generated/vedic-guidance-working-data.json","vercel.json","scripts/lib/ag74k-panchang-input-resolver.mjs","scripts/lib/ag74l-astronomical-engine.mjs","scripts/lib/ag74m-panchang-day-orchestrator.mjs","scripts/lib/ag74n-panchang-calendar-engine.mjs","scripts/lib/ag76-festival-rule-engine.mjs","data/methodology/star-reflection/ag75c-expanded-star-reflection-output-bank.json","data/knowledge-base/panchang-festival/production/ag74p-approved-festival-observance-projection.json","data/knowledge-base/panchang-festival/production/ag74n-varanasi-samvat-2083-annual-calendar.json","data/knowledge-base/panchang-festival/production/ag76-r2b-festival-rule-evidence-benchmarks.json"];
for(const p of protectedPaths) check("F1/protected owner byte-identical: "+p,()=>assert(fs.readFileSync(p).equals(execFileSync("git",["show",base+":"+p],{maxBuffer:64*1024*1024}))));
console.log("F2 validation passed: "+count+" focused checks. Carousel timers use synthetic fixtures, not astronomical calculations.");
