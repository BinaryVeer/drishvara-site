/* F3 read-only browser QA of public routes. No personal form entries, writes or credentials. */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const BASE = (process.env.F3_BASE_URL || 'https://www.drishvara.com').replace(/\/$/, '');
const OUT = path.resolve('f3-audit');
fs.mkdirSync(OUT, { recursive: true });
const cases = [
  { name:'desktop', width:1440, height:900 },
  { name:'tablet', width:850, height:900 },
  { name:'phone', width:390, height:844 },
  { name:'narrow-phone', width:320, height:740 }
];
const routes = [
  { slug:'panchang', path:'/panchang.html', required:['#panchang-previous-day','#panchang-date-text','#panchang-date-picker','#panchang-today','#panchang-next-day','#panchang-calculate'] },
  { slug:'stars', path:'/what-stars-say.html', required:['#star-reflection-dob','#star-reflection-birth-time'] },
  { slug:'sports', path:'/sports.html', required:['#sports-featured','#sports-score-status','#sports-standings-status'] }
];
const audit = { base:BASE, started:new Date().toISOString(), samples:[], failures:[], warnings:[] };
const chromePaths = [
  process.env.CHROME_PATH,
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium'
].filter(Boolean);
const executablePath = chromePaths.find(p=>fs.existsSync(p));
if (!executablePath) throw new Error('No system Chrome found on runner');
const browser = await chromium.launch({ headless:true, executablePath, args:['--no-sandbox','--disable-dev-shm-usage'] });
const fail = (sample, message) => { audit.failures.push(sample+': '+message); };
const warn = (sample, message) => { audit.warnings.push(sample+': '+message); };

try {
  for (const vp of cases) {
    const context = await browser.newContext({ viewport:{width:vp.width,height:vp.height}, deviceScaleFactor:1, isMobile:vp.name.includes('phone'), hasTouch:vp.name.includes('phone') });
    for (const route of routes) {
      const label = route.slug+'-'+vp.name;
      const page = await context.newPage();
      const jsErrors = [];
      page.on('pageerror', e=>jsErrors.push(String(e.message).slice(0,300)));
      try {
        const response = await page.goto(BASE+route.path, { waitUntil:'domcontentloaded', timeout:45000 });
        if (!response || response.status()>=400) {
          fail(label, 'HTTP '+(response?.status() ?? 'no response')); continue;
        }
        await page.waitForSelector('.dv2-header', { timeout:12000 });
        await page.waitForTimeout(1200);
        if (route.slug === 'panchang') {
          try {
            await page.waitForFunction(() => {
              const t=document.getElementById('panchang-tithi');
              return t && t.textContent.trim() && !/^(loading|preparing|calculating|pending)/i.test(t.textContent.trim());
            }, null, { timeout:12000 });
          } catch { warn(label,'Panchang default Tithi remained in pending/loading state after 12s'); }
        }
        if (route.slug === 'sports') {
          // Lazy-loaded images cannot be judged by a full-page screenshot until
          // their scroll intersection has actually occurred.
          const images=await page.locator('#sports-articles img, #sports-featured img').all();
          for(const img of images) {
            await img.scrollIntoViewIfNeeded();
            await img.evaluate(el=>{el.loading='eager';});
            await img.evaluate(async el=>{
              if(el.complete && el.naturalWidth>0)return;
              await new Promise(resolve=>{
                const timer=setTimeout(resolve,6500);
                const end=()=>{clearTimeout(timer);resolve();};
                el.addEventListener('load',end,{once:true});
                el.addEventListener('error',end,{once:true});
              });
            });
            const info=await img.evaluate(el=>({src:el.currentSrc,naturalWidth:el.naturalWidth,complete:el.complete}));
            if(!info.naturalWidth)fail(label,'article image not loaded: '+info.src);
          }
          await page.evaluate(()=>scrollTo(0,0));
          await page.waitForTimeout(350);
        }
        const metrics = await page.evaluate(() => {
          const rect = e => {
            if (!e) return null;
            const r=e.getBoundingClientRect(), st=getComputedStyle(e);
            return {x:Math.round(r.x),y:Math.round(r.y),right:Math.round(r.right),width:Math.round(r.width),height:Math.round(r.height),visible:st.display!=='none'&&st.visibility!=='hidden'&&r.width>0&&r.height>0};
          };
          const items={};
          for(const sel of ['.dv2-header','.d-page-layout','.d-page-hero','.d-page-content','.d-selection-panel','.d-panchang-results','.d-panchang-annual','.r-calendar-body','.d-reflection-grid','.d-sports-top','.d-sports-bottom','.r-domain-grid']) {
            items[sel]=rect(document.querySelector(sel));
          }
          const outliers=[];
          for(const el of document.querySelectorAll('.d-page-content,.d-panel,.d-selection-panel,.d-panchang-results,.r-calendar-body,.d-reflection-grid,.d-sports-top,.d-sports-bottom')) {
            const r=rect(el);
            if(r?.visible&&(r.x < -2 || r.right > innerWidth+2)) outliers.push({className:el.className, x:r.x,right:r.right});
          }
          const controls={};
          for(const id of ['panchang-previous-day','panchang-date-text','panchang-date-picker','panchang-today','panchang-next-day','panchang-calculate','star-reflection-dob','star-reflection-birth-time']) {
            controls[id]=rect(document.getElementById(id));
          }
          return {title:document.title,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,heroBackground:getComputedStyle(document.querySelector('.d-page-hero')).backgroundImage,items,controls,outliers,visibleDesktopSports:[...document.querySelectorAll('.dv2-nav a[href="sports.html"]')].filter(x=>rect(x)?.visible).length,mobileSportsCount:document.querySelectorAll('.dv2-mobile-menu__list a[href="sports.html"]').length};
        });
        const record={label,status:response.status(),...metrics,errors:jsErrors,panchangTithi:route.slug==='panchang'?await page.locator('#panchang-tithi').first().textContent():undefined};
        audit.samples.push(record);
        if(metrics.scrollWidth>vp.width+3) fail(label, 'horizontal document overflow '+metrics.scrollWidth+'px');
        if(metrics.outliers.length) fail(label, 'off-screen content panels '+JSON.stringify(metrics.outliers.slice(0,5)));
        if(!metrics.heroBackground || metrics.heroBackground==='none') warn(label,'hero background not resolved');
        if(metrics.mobileSportsCount!==1) fail(label,'mobile menu Sports link count='+metrics.mobileSportsCount);
        if(vp.width>1160 && metrics.visibleDesktopSports!==1) fail(label,'visible desktop Sports link count='+metrics.visibleDesktopSports);
        for(const selector of route.required){
          if(!await page.locator(selector).count()) fail(label,'missing required '+selector);
        }
        if(route.slug==='panchang'){
          const c=metrics.controls;
          for(const id of ['panchang-previous-day','panchang-date-text','panchang-date-picker','panchang-today','panchang-next-day']){
            if(!c[id]?.visible) fail(label,id+' not visually present');
          }
          if(vp.width<=700){
            const prev=c['panchang-previous-day'], today=c['panchang-today'], next=c['panchang-next-day'], text=c['panchang-date-text'],picker=c['panchang-date-picker'];
            if(prev&&today&&next&&text&&picker){
              if(Math.abs(prev.y-today.y)>30||Math.abs(next.y-today.y)>30) fail(label,'mobile day navigation not aligned');
              if(Math.abs(text.y-picker.y)>30) fail(label,'mobile date inputs not aligned');
              if(prev.y<=text.y) fail(label,'day navigation is not below date inputs');
            }
          }
        }
        if(route.slug==='sports'){
          const button=page.locator('[data-sports-score-filter] button[data-sport="Cricket"]');
          if(await button.count()){
            await button.click();
            const pressed=await button.getAttribute('aria-pressed');
            if(pressed!=='true') fail(label,'Sports Cricket filter is not keyboard/press state enabled');
          }
        }
        await page.screenshot({path:path.join(OUT,label+'.png'),fullPage:true,animations:'disabled',timeout:25000});
        if(jsErrors.length) warn(label,'page errors: '+jsErrors.slice(0,3).join(' | '));
      } catch(e) {
        fail(label,String(e?.message||e).slice(0,600));
      } finally { await page.close(); }
    }
    const homepage=await context.newPage();
    try{
      const response=await homepage.goto(BASE+'/',{waitUntil:'domcontentloaded',timeout:45000});
      if(!response||response.status()>=400) fail('home-'+vp.name,'home HTTP '+response?.status());
      await homepage.waitForSelector('.dv2-header',{timeout:12000});
      if(vp.width<=1160){
        const menu=homepage.locator('[data-dv2-open-menu]').first();
        await menu.click();
        const link=homepage.locator('#dv2-mobile-menu a[href="sports.html"]');
        if(await link.count()!==1) fail('home-'+vp.name,'Sports menu link missing');
        else if(!await link.isVisible()) fail('home-'+vp.name,'Sports menu link not visible');
        else { await link.click(); await homepage.waitForURL(/sports\.html/, {timeout:20000}); }
      }else{
        const link=homepage.locator('.dv2-nav a[href="sports.html"]');
        if(await link.count()!==1 || !await link.isVisible()) fail('home-'+vp.name,'Sports desktop link missing');
      }
      audit.samples.push({label:'home-'+vp.name,visibleSports:true,navigatedTo:homepage.url()});
    }catch(e){fail('home-'+vp.name,String(e?.message||e).slice(0,600))}
    finally{await homepage.close();await context.close();}
  }
} finally { await browser.close(); }
audit.finished=new Date().toISOString();
fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(audit,null,2));
console.log('F3 audit samples='+audit.samples.length+' failures='+audit.failures.length+' warnings='+audit.warnings.length);
for(const s of audit.failures)console.error('FAIL '+s);
for(const s of audit.warnings.slice(0,15))console.log('WARNING '+s);
if(audit.failures.length)process.exitCode=1;
