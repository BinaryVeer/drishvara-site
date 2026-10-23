import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { canonicalPublicationDate } from "./lib/ag70d-word-selection-engine.mjs";
import { syntheticPublication } from "./lib/ag70e-word-test-fixtures.mjs";

// Optional existing Playwright installation only. No package/browser downloads.
const modulePath=process.env.DRISHVARA_PLAYWRIGHT_MODULE;
const {chromium}=modulePath?await import(pathToFileURL(modulePath).href):await import("playwright");
const executable=process.env.DRISHVARA_CHROME_EXECUTABLE;
const root=process.cwd(),errors=[];
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml"};
const server=http.createServer((req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
    const filename=path.resolve(root,"."+(pathname==="/"?"/index.html":pathname));
    if(!filename.startsWith(root+path.sep))throw Error("outside root");
    const body=fs.readFileSync(filename);res.writeHead(200,{"Content-Type":types[path.extname(filename)]||"application/octet-stream"});res.end(body);
  }catch{res.writeHead(404);res.end("Not found");}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
let browser;
try {
  browser=await chromium.launch({headless:true,...(executable?{executablePath:executable}:{})});
  const url="http://127.0.0.1:"+server.address().port;
  const date=canonicalPublicationDate(new Date().toISOString());
  const approved=(await syntheticPublication(date,true)).output;
  for(const width of [1440,390]){
    const page=await browser.newPage({viewport:{width,height:960},reducedMotion:"reduce"});
    page.on("pageerror",error=>errors.push(error.message));
    // No live service use; this QA exercises only the Word card and unchanged shell.
    await page.route("https://*.supabase.co/**",route=>route.abort());
    await page.goto(url,{waitUntil:"domcontentloaded"});
    const card=page.locator('[data-f2-publication="word"]');
    await card.waitFor();
    await page.waitForFunction(()=>document.getElementById('f2-word-state')?.textContent==='Under verification');
    await page.screenshot({path:`/private/tmp/drishvara-word-${width}-withheld.png`});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
    await page.route("**/generated/word-of-day-publication.json",route=>route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(approved)}));
    await page.reload({waitUntil:"domcontentloaded"});
    await page.waitForFunction(()=>document.getElementById('f2-word-state')?.textContent.includes('Synthetic word 1'));
    await card.locator('summary').click();
    await card.scrollIntoViewIfNeeded();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
    assert.equal(await card.locator('a').first().getAttribute('rel'),'noopener noreferrer');
    assert((await card.locator('[lang="sa"]').textContent()).length>500);
    await card.screenshot({path:`/private/tmp/drishvara-word-${width}-synthetic-approved.png`});
    const bad=structuredClone(approved);bad.assignment.reviewed_copy.content.english='Unreviewed change';
    await page.evaluate(data=>window.DrishvaraV2Homepage.renderWordPublication(data),bad);
    assert.equal(await page.locator('#f2-word-state').textContent(),'Under verification');
    console.log(`PASS rendered ${width}px: real envelope withheld, approved isolated long-word fixture rendered, sources accessible, no overflow, tampered copy withheld.`);
    await page.close();
  }
  assert.deepEqual(errors,[]);console.log('PASS: no page runtime errors. Screenshots in /private/tmp; no production output written.');
} finally {
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
