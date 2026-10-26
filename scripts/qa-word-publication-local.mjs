import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { canonicalPublicationDate, snapshotHash } from "./lib/ag70d-word-selection-engine.mjs";
import { syntheticPublication, withSyntheticMeaning } from "./lib/ag70e-word-test-fixtures.mjs";

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
  const expanded=(await syntheticPublication(date,false,record=>{
    withSyntheticMeaning(record);
    const copy=record.reviewed_publication_copy;
    copy.content.meaning_details.philosophical_essay.sections=Array.from({length:3},(_,i)=>({
      heading_en:'Synthetic reading section '+(i+1),heading_hi:'काल्पनिक पठन खंड '+(i+1),
      body_en:'This fictional passage checks the reading layout, not a traditional teaching. '.repeat(8),
      body_hi:'यह काल्पनिक अनुच्छेद केवल पठन के परीक्षण के लिए है, कोई वास्तविक शास्त्रीय उपदेश नहीं। '.repeat(8),evidence_refs:['synthetic-source']
    }));
    copy.reviews.forEach(review=>{review.content_hash=snapshotHash(copy.content);});
    return record;
  })).output;
  for(const width of [1440,390]){
    const page=await browser.newPage({viewport:{width,height:960},reducedMotion:"reduce"});
    page.on("pageerror",error=>errors.push(error.message));
    // No live service use; this QA exercises only the Word card and unchanged shell.
    await page.route("https://*.supabase.co/**",route=>route.abort());
    await page.goto(url,{waitUntil:"domcontentloaded"});
    const card=page.locator('[data-f2-publication="word"]');
    await card.waitFor();
    await page.waitForFunction(()=>document.getElementById('f2-word-state')?.textContent==='Under verification');
    assert.equal(await card.getByRole('button',{name:'Explore meaning'}).isDisabled(),true);
    await page.screenshot({path:`/private/tmp/drishvara-word-${width}-withheld.png`});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
    await page.route("**/generated/word-of-day-publication.json",route=>route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(approved)}));
    await page.reload({waitUntil:"domcontentloaded"});
    await page.waitForFunction(()=>document.getElementById('f2-word-state')?.textContent.includes('Synthetic word 1'));
    await card.getByRole('button',{name:'Explore meaning'}).click();
    const dialog=page.getByRole('dialog');
    await dialog.waitFor({state:'visible'});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
    assert.equal(await dialog.locator('a[href^="https:"]').first().getAttribute('rel'),'noopener noreferrer');
    assert.equal(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth),true);
    assert((await card.locator('[lang="sa"]').textContent()).length>500);
    await page.keyboard.press('Escape');
    assert.equal(await dialog.isVisible(),false);
    await card.screenshot({path:`/private/tmp/drishvara-word-${width}-synthetic-approved.png`});
    await page.evaluate(data=>window.DrishvaraV2Homepage.renderWordPublication(data),expanded);
    assert.equal(await card.locator('[lang="sa-Latn"]').count(),0);
    await card.screenshot({path:`/private/tmp/drishvara-word-${width}-synthetic-card.png`});
    await card.getByRole('button',{name:'Explore meaning'}).click();
    await dialog.getByRole('heading',{name:'Scriptural references and context',exact:true}).waitFor();
    assert.equal(await dialog.getByRole('heading',{name:'Philosophical perspective',exact:true}).count(),1);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
    assert.equal(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth),true);
    assert.equal(await dialog.locator('nav[aria-label="Word reading sections"] a').count(),4);
    assert.equal(await dialog.locator('[lang="sa-Latn"]').count(),0);
    assert.equal(await dialog.getByRole('heading',{name:'How this meaning was prepared'}).count(),0);
    const process=dialog.getByRole('link',{name:'Source and Context Review',exact:true});
    assert.equal(await process.getAttribute('href'),'#f2-word-sources-section');
    assert.equal((await dialog.locator('.f2-word-method').innerText()).trim(),'Process: Source and Context Review');
    assert.equal(await dialog.locator('.f2-word-reader-controls').getAttribute('role'),null);
    assert.equal(await dialog.getAttribute('data-no-translate'),'');
    assert.equal(await card.getAttribute('data-no-translate'),'');
    assert.equal(await page.evaluate(()=>document.activeElement.id),'f2-word-dialog-title');
    assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).overflow),'hidden');
    if(width===390){
      const frame=await dialog.boundingBox();
      assert.equal(frame.x,0);assert.equal(frame.y,0);assert.equal(frame.width,width);assert.equal(frame.height,960);
    }
    await dialog.screenshot({path:`/private/tmp/drishvara-word-${width}-synthetic-meaning.png`});
    await dialog.locator('.f2-word-method').screenshot({path:`/private/tmp/drishvara-word-${width}-process-reference.png`});
    await process.click();
    assert.equal(await dialog.locator('#f2-word-sources-section').evaluate(el=>el===document.activeElement),true);
    const background=await page.evaluate(()=>({scroll:window.scrollY,url:location.href,language:document.documentElement.lang,storage:JSON.stringify({...localStorage})}));
    await dialog.getByRole('navigation',{name:'Word reading sections'}).getByRole('link',{name:'Scriptural evidence',exact:true}).click();
    assert.equal(await dialog.locator('#f2-word-textual-section').evaluate(el=>el===document.activeElement),true);
    await dialog.getByRole('radio',{name:'हिन्दी',exact:true}).check();
    assert.equal(await page.evaluate(()=>document.documentElement.lang),background.language);
    assert.equal(await page.evaluate(()=>JSON.stringify({...localStorage})),background.storage);
    assert.equal(await dialog.locator('#f2-word-meaning-section [data-word-language="en"]').first().isVisible(),false);
    assert.equal(await dialog.locator('#f2-word-meaning-section [data-word-language="hi"]').first().isVisible(),true);
    assert.equal(await dialog.locator('blockquote[lang="sa"]').isVisible(),true);
    await dialog.screenshot({path:`/private/tmp/drishvara-word-${width}-synthetic-hindi.png`});
    await dialog.getByRole('radio',{name:'English',exact:true}).check();
    await dialog.getByRole('navigation',{name:'Word reading sections'}).getByRole('link',{name:'Philosophical essay',exact:true}).click();
    assert.equal(await dialog.locator('#f2-word-essay-section').evaluate(el=>el===document.activeElement),true);
    assert.equal(await page.evaluate(()=>window.scrollY),background.scroll);
    assert.equal(page.url(),background.url);
    await dialog.screenshot({path:`/private/tmp/drishvara-word-${width}-synthetic-essay.png`});
    assert.equal(await dialog.locator('#f2-word-meaning').evaluate(el=>el.scrollWidth<=el.clientWidth),true);
    await dialog.locator('#f2-word-essay-section .f2-word-citations a').first().click();
    assert.equal(await dialog.locator('#f2-word-source-0').getAttribute('open'),'');
    assert.equal(await dialog.locator('#f2-word-source-0 summary').evaluate(el=>el===document.activeElement),true);
    assert.equal(await dialog.locator('#f2-word-source-0 > a').getAttribute('target'),'_blank');
    for(let i=0;i<12;i++){
      await page.keyboard.press('Tab');
      assert.equal(await dialog.evaluate(el=>el===document.activeElement||el.contains(document.activeElement)),true,
        'Tab '+i+' left reader: '+await page.evaluate(()=>document.activeElement.outerHTML.slice(0,250)));
    }
    await dialog.getByRole('button',{name:'Close meaning',exact:true}).press('Enter');
    assert.equal(await card.getByRole('button',{name:'Explore meaning'}).evaluate(el=>el===document.activeElement),true);
    await card.getByRole('button',{name:'Explore meaning'}).click();
    assert.equal(await dialog.locator('#f2-word-meaning').evaluate(el=>el.scrollTop),0);
    const bad=structuredClone(approved);bad.assignment.reviewed_copy.content.english='Unreviewed change';
    await page.evaluate(data=>window.DrishvaraV2Homepage.renderWordPublication(data),bad);
    assert.equal(await page.locator('#f2-word-state').textContent(),'Under verification');
    assert.equal(await dialog.isVisible(),false);
    assert.equal(await card.getByRole('button',{name:'Explore meaning'}).isDisabled(),true);
    assert.equal(await page.locator('#f2-word-meaning').textContent(),'');
    assert.equal(await page.locator('#f2-word-reader-date').textContent(),'');
    assert.notEqual(await page.evaluate(()=>getComputedStyle(document.documentElement).overflow),'hidden');
    console.log(`PASS rendered ${width}px: real output withheld; synthetic v1/v2, compact card, section navigation, bilingual reader, Sanskrit, source expansion, focus trap/return, mobile full-height, no overflow or background navigation; tamper clears and withholds. No real word approved.`);
    await page.close();
  }
  assert.deepEqual(errors,[]);console.log('PASS: no page runtime errors. Screenshots in /private/tmp; no production output written.');
} finally {
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
