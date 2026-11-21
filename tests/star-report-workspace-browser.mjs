import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright-core';
const out='wss12-workspace-qa';fs.mkdirSync(out,{recursive:true});
const chrome=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(fs.existsSync);
const browser=await chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage']});
const errors=[];
try{for(const width of [1440,390,320]){
 const page=await browser.newPage({viewport:{width,height:950}});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8765/what-stars-say.html',{waitUntil:'domcontentloaded'});
 const root=page.locator('#star-report-workspace');await root.locator('[role=tab]').first().waitFor();
 assert.equal(await root.getAttribute('data-demo-only'),'true');assert.equal(await root.locator('[role=tab]').count(),10);
 assert.equal(await page.locator('.d-related').count(),0);assert.equal(await page.locator('.d-reflection-explain').count(),0);
 for(const lang of ['en','hi']){
  await page.locator('[data-dv2-language-choice="'+lang+'"]').first().click();
  await page.waitForFunction(({lang,copy})=>{const root=document.querySelector('#star-report-workspace');return root?.lang===lang&&root.querySelector('.ws-demo-badge')?.textContent.includes(copy);},{lang,copy:lang==='hi'?'काल्पनिक':'SYNTHETIC'});
  await root.locator('[data-tab=overview]').click();
  assert.match(await root.innerText(),lang==='hi'?/काल्पनिक/:/SYNTHETIC DEMO/);
  await page.locator('#star-reflection-name').fill('QA private name');
  assert.doesNotMatch(await root.innerText(),/QA private name/);
  await root.locator('[data-tab=charts]').click();
  for(const d of ['D1','D9','D10']){
   await root.locator('.ws-choices').first().getByRole('button',{name:new RegExp('^'+d+' ·')}).click();
   assert.equal(await root.locator('svg g[data-house]').count(),12);
  }
  await root.locator('.ws-choices').nth(1).getByRole('button',{name:lang==='en'?'South Indian':'दक्षिण भारतीय',exact:true}).click();
  assert.equal(await root.locator('svg[data-chart-layout=south] g[data-house]').count(),12);
  await root.locator('.ws-choices').first().getByRole('button',{name:/^D9 ·/}).click();
  await root.locator('select').selectOption('boundary');assert.equal(await root.locator('svg').count(),0);
  assert.equal(await root.locator('[data-chart-withheld=true]').count(),1);
  await root.screenshot({path:`${out}/boundary-${width}-${lang}.png`});
  await root.locator('select').selectOption('complete');
  await root.screenshot({path:`${out}/charts-${width}-${lang}.png`});
  for(const key of ['matching','planets','strength','periods','transits','domains','sources','roadmap']){
   await root.locator('[data-tab='+key+']').click();assert.ok((await root.locator('[role=tabpanel]').innerText()).length>50);
   if(key==='matching'){
    assert.equal(await root.locator('[data-matching-profile]').count(),2);
    assert.equal(await root.locator('[data-score-assigned=false]').count(),1);
    assert.match(await root.innerText(),lang==='hi'?/पद्धति का सत्यापन शेष/:/Method qualification pending/);
    assert.equal(await root.locator('input').count(),0,'No personal matching data intake before qualification');
    if(width===1440||width===390)await root.screenshot({path:`${out}/matching-${width}-${lang}.png`});
   }
   if(key==='domains'){
    const panel=root.locator('[role=tabpanel]');
    for(const [button,kind,selection]of [[lang==='hi'?'वर्ष':'Year','year','2027'],[lang==='hi'?'माह':'Month','month','2026-12'],[lang==='hi'?'दिन':'Day','day','2026-11-22']]){
     await root.getByRole('button',{name:button,exact:true}).click();
     await root.getByLabel(lang==='hi'?'उदाहरण की चयनित अवधि':'Selected demo period').selectOption(selection);
     assert.equal(await panel.getAttribute('data-period-kind'),kind);assert.equal(await panel.getAttribute('data-period-key'),selection);
     assert.match(await root.locator('.ws-theme-reading').innerText(),new RegExp(selection));
     const paragraphs=await root.locator('.ws-theme-reading .ws-note').allTextContents();
     assert.equal(paragraphs.length,3);assert.ok(paragraphs.every(text=>text.trim().length>50),'All three descriptive paragraphs must be populated in '+lang);
     assert.match(await root.locator('.ws-theme-reading').innerText(),lang==='hi'?/समर्थन का आकलन: जाँच शेष/:/Support assessment: not qualified/);
    }
    await root.getByRole('button',{name:lang==='hi'?'विवाह एवं संबंध':'Marriage & relationships',exact:true}).click();
    assert.equal(await root.locator('[data-theme=relationships]').count(),1);
    if(width===1440||width===390)await root.screenshot({path:`${out}/life-themes-${width}-${lang}.png`});
    await root.getByLabel(lang==='hi'?'उदाहरण चुनें':'Demo scenario',{exact:true}).selectOption('boundary');
    assert.match(await root.locator('.ws-theme-reading').innerText(),lang==='hi'?/आवश्यक जन्म अथवा वर्ग-कुंडली आधार रोका गया/:/required natal or divisional basis is withheld/);
    await root.getByLabel(lang==='hi'?'उदाहरण चुनें':'Demo scenario',{exact:true}).selectOption('complete');
    await root.locator('[data-tab=transits]').click();
    assert.equal(await root.locator('[role=tabpanel]').getAttribute('data-period-key'),'2026-11-22','Period selection must stay shared with transit data');
   }
   if(key==='planets')assert.equal(await root.locator('tbody tr').count(),9);
   if(key==='periods')assert.equal(await root.locator('.ws-timeline li').count(),10);
   if(key==='sources'){const hrefs=await root.locator('a').evaluateAll(a=>a.map(a=>a.href));assert.equal(hrefs.length,new Set(hrefs).size);}
   if(key==='transits')for(const name of lang==='en'?['Month','Year']:['माह','वर्ष']){await root.getByRole('button',{name,exact:true}).click();assert.ok(await root.locator('tbody tr').count()>0);}
  }
  await root.locator('[data-tab=overview]').click();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=3,`Overflow ${width}/${lang}`);
  await page.screenshot({path:`${out}/page-${width}-${lang}.png`,fullPage:true});
  await root.screenshot({path:`${out}/overview-${width}-${lang}.png`});
  await root.locator('[data-tab=overview]').focus();await page.keyboard.press('End');assert.equal(await root.locator('[data-tab=roadmap]').getAttribute('aria-selected'),'true');
 }
 await page.close();
}}finally{await browser.close();}
assert.deepEqual(errors,[]);console.log('PASS all ten sections, three charts, precision scenario, 3 widths, EN/HI, unique sources, tabs and input separation');
