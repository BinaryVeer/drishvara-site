/* Dedicated-page presentation only. Existing controllers retain all result and approval ownership. */
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  function node(tag, cls, html) { const e = document.createElement(tag); e.className = cls; e.innerHTML = html; return e; }
  function panel(title, content) { return node('section', 'd-panel', '<h2><i aria-hidden="true">◇</i> '+title+'</h2>'+content); }
  function pageNavigation() {
    const header = $('.dv2-header');
    if (!header) return;
    // Expose the new route only on these dedicated pages; homepage navigation is untouched.
    const nav = header.querySelector('nav');
    if (nav && !nav.querySelector('a[href="sports.html"]')) {
      const link = document.createElement('a'); link.href = 'sports.html'; link.textContent = 'Sports';
      if (document.body.dataset.dedicatedPage === 'sports') link.setAttribute('aria-current','page');
      nav.append(link);
    }
    const mobile = $('#dv2-mobile-menu');
    if (mobile && !mobile.querySelector('a[href="sports.html"]')) {
      const link = document.createElement('a'); link.href = 'sports.html'; link.textContent = 'Sports'; mobile.append(link);
    }
  }
  function panchang() {
    const card = $('#panchang-festival-card');
    if (!card || card.dataset.dedicatedReady) return;
    card.dataset.dedicatedReady = 'true';
    const reader = $('#dv2-panchang-reader-panel');
    const observance = $('#festival-list');
    if (reader && observance) {
      const row = node('div','d-panchang-results',''); reader.before(row); row.append(reader,observance);
      const next = panel('Upcoming Festival / Holiday','<div class="d-empty"><b class="d-symbol" aria-hidden="true">◇</b><h3>Verified calendar context</h3><p>Browse the Festival Year Explorer below for published observances. Government holidays and other traditions remain unavailable until their verified calendars are connected.</p></div><small>Hindu · Government · Other traditions</small>');
      row.append(next);
    }
    const explorer = $('#dv2-observance-year-disclosure');
    const book = $('#dv2-hindu-calendar-disclosure');
    if (explorer && book) {
      const row = node('div','d-panchang-annual',''); explorer.before(row); row.append(explorer,book);
      explorer.open = true; // Existing monthly filters, list view and record details remain intact.
    }
    const location = $('#dv2-panchang-location-disclosure');
    if (location) {
      location.open = true;
      const date = $('.ag74i-date-surface');
      if(date) {
        const selection=node('section','d-selection-panel','<h2>◉ &nbsp; Select Date &amp; Location</h2>');
        date.before(selection);selection.append(date,location);
      }
    }
  }
  function reflection() {
    const card = $('[data-drishvara-v2-reflect-card="true"]');
    const result = $('[data-ag71e-preview-panel="star-reflection"]');
    if (!card || !result || card.dataset.dedicatedReady) return;
    card.dataset.dedicatedReady = 'true';
    const host = $('#dv2-reflect-host');
    const heading=node('h2','d-form-title','Generate Your Star Reflection');
    card.prepend(heading);
    const notes=node('details','d-form-notes','<summary>Reflection method &amp; privacy</summary>');
    card.append(notes);
    ['.ag73a-birth-time-note','.ag71d-r6-coordinate-basis-summary','.ag71d-method-basis-status','[data-ag73e-star-active-status]'].forEach(selector=>{
      card.querySelectorAll(selector).forEach(e=>notes.append(e));
    });
    const grid = node('div','d-reflection-grid',''); host.before(grid); grid.append(host);
    const insight = panel("Today's Reflective Insight",'<div class="d-reflect-wait"><div class="d-insight-orbit" aria-hidden="true"></div><p class="d-kicker">YOUR REFLECTION · AWAITING CONTEXT</p><h3>A thoughtful result begins with the right basis.</h3><p>Enter your birth context to resolve an eligible, governed reflection.</p><div class="d-basis-grid"><span>Nakshatra<small>Pending</small></span><span>Moon basis<small>Pending</small></span><span>Time confidence<small>Unresolved</small></span><span>Session type<small>Reflective only</small></span></div></div><p class="d-insight-safety">Reflection is not a prediction, assessment or decision guide.</p>');
    insight.classList.add('d-reflection-insight'); grid.append(insight);
    insight.querySelector('.d-insight-safety').before(result);
    result.setAttribute('aria-live','polite');
    const wait = insight.querySelector('.d-reflect-wait');
    function sync() { wait.hidden = !result.hidden; }
    new MutationObserver(sync).observe(result,{attributes:true,attributeFilter:['hidden']}); sync();
    const sections = node('div','d-reflection-explain',''); grid.after(sections);
    sections.append(panel('How This Reflection Works','<div class="d-explain-grid"><div><b>▣</b><strong>Birth context</strong><p>Date, governed place, and exact or unknown time.</p></div><div><b>◎</b><strong>Vedic framework</strong><p>The existing astronomical and rule basis.</p></div><div><b>✧</b><strong>Reflective writing</strong><p>Approved text matched to the eligible result.</p></div><div><b>◇</b><strong>Your privacy</strong><p>Personal inputs are not retained.</p></div></div>'));
    sections.append(panel('What You Can Explore','<div class="d-explain-grid"><div><b>♧</b><strong>Self-awareness</strong><p>Mindful questions and reflection.</p></div><div><b>✺</b><strong>Meaningful inquiry</strong><p>Traditional contexts explored with care.</p></div><div><b>♧</b><strong>Life themes</strong><p>Purpose, work, relationships and growth.</p></div><div><b>▤</b><strong>Limitations</strong><p>No personal future prediction.</p></div></div>'));
    const links=node('nav','d-related','<a href="panchang.html">▦ &nbsp; Explore Today’s Panchang →</a><a href="#reflection-method">▤ &nbsp; Understand your reflection basis →</a>'); sections.after(links); sections.id='reflection-method';
    // Give the existing unlabelled DOB control a durable accessible name.
    const dob=$('#star-reflection-dob'); if(dob) dob.setAttribute('aria-label','Date of Birth (DD/MM/YYYY)');
  }
  async function sports() {
    window.DrishvaraV2Shell.ensureHeader('sports');
    document.querySelectorAll('[data-sports-score-filter], [data-sports-standings-filter]').forEach(group => {
      group.addEventListener('click', event => {
        const b=event.target.closest('button[data-sport]'); if(!b) return;
        group.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
        if(group.hasAttribute('data-sports-standings-filter')) $('#sports-standings-status').textContent='No verified '+b.dataset.sport.toLowerCase()+' standings available.';
        else $('#sports-score-status h3').textContent=b.dataset.sport==='All'?'Verified scores unavailable':'Verified '+b.dataset.sport.toLowerCase()+' scores unavailable';
      });
    });
    // Same public-only article source as the existing shell. No private/draft collection is read.
    const data=await window.DrishvaraV2Shell.loadArticleIndex();
    const records=(Array.isArray(data.publishedItems)?data.publishedItems:data.publicLatest||[]).filter(x=>String(x.tag||'').toLowerCase()==='sports' && /^articles\/sports\/[a-z0-9-]+\.html$/.test(x.path||x.sourcePath||''));
    function article(item, featured) {
      const article=node('article',featured?'d-featured-story':'d-article','');
      const path=item.path||item.sourcePath;
      const link=document.createElement('a'); link.href='article.html?path='+encodeURIComponent(path);
      const image=document.createElement('img'); image.alt=''; image.loading=featured?'eager':'lazy';
      const url=String(item.image||'');
      image.src=/^(assets\/|https:\/\/images\.unsplash\.com\/)/.test(url)?url:'assets/featured/fallback/sports-default.jpg';
      image.addEventListener('error',()=>{image.src='assets/featured/fallback/sports-default.jpg';},{once:true});
      link.append(image); const title=document.createElement('h3'); title.textContent=item.title; link.append(title); article.append(link);
      const p=document.createElement('p');p.textContent=item.summary||'';article.append(p);
      const meta=document.createElement('small');meta.textContent='Published analysis'+(item.date?' · '+item.date:'');article.append(meta);return article;
    }
    const featured=$('#sports-featured'), list=$('#sports-articles');
    featured.replaceChildren();
    if(!records.length) { featured.append(panel('Published coverage unavailable','<p>No eligible sports articles could be loaded.</p>'));return; }
    featured.append(article(records[0],true));
    records.slice(1,7).forEach(x=>list.append(article(x,false)));
  }
  function boot() {
    const kind=document.body.dataset.dedicatedPage;
    const toggle=$('.dv2-language-toggle');
    const section=$('.dv2-section__inner');
    if(toggle && section) section.prepend(toggle);
    if(kind==='panchang') panchang();
    else if(kind==='what-stars-say') reflection();
    else if(kind==='sports') sports();
    pageNavigation();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
/* Reference-completion layer: reads approved projection and existing controller output only. */
(function(){
 'use strict';
 const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const kind=document.body.dataset.dedicatedPage;
 const hi=()=>($('#time')||$('#reflect'))?.getAttribute('data-dv2-lang')==='hi';
 const t=(en,hindi)=>hi()?hindi:en;
 function make(tag,cls,html=''){const e=document.createElement(tag);e.className=cls;e.innerHTML=html;return e;}
 function label(e,en,hindi){e.dataset.rEn=en;e.dataset.rHi=hindi;e.textContent=t(en,hindi);return e;}
 function text(en,hindi,tag='span'){const e=document.createElement(tag);return label(e,en,hindi);}
 const names={amavasya:'अमावस्या',purnima:'पूर्णिमा',ekadashi:'एकादशी',pradosha:'प्रदोष',sankashti_chaturthi:'संकष्टी चतुर्थी',vinayaka_chaturthi:'विनायक चतुर्थी',masik_shivaratri:'मासिक शिवरात्रि'};
 function dateLabel(value){if(!/^\d{4}-\d{2}-\d{2}/.test(value||''))return value||t('Unavailable','अनुपलब्ध');const p=value.slice(0,10).split('-').map(Number);return new Intl.DateTimeFormat(hi()?'hi-IN':'en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(p[0],p[1]-1,p[2])));}
 function timing(value){return dateLabel(value)+(value?.length>15?', '+value.slice(11,16):'');}
 function eventName(r){return hi()?(names[r.observance_key]||r.display_name):r.display_name;}
 function heading(title,hindi){return label(document.createElement('h2'),title,hindi);}
 let translateExtra=()=>{};
 function language(){ $$('[data-r-en]').forEach(e=>{const value=hi()?e.dataset.rHi:e.dataset.rEn;if(e.textContent!==value)e.textContent=value;});translateExtra();}
 function addLang(en,hindi,selector){const e=$(selector);if(e)label(e,en,hindi);}
 function buildPanchang(){
  const Model=window.DrishvaraCalendarView, annual=$('.d-panchang-annual'), old=$('#dv2-observance-year-disclosure'), book=$('#dv2-hindu-calendar-disclosure');
  if(!Model||!annual||!book)return;
  const picker=$('#panchang-date-picker');let selected=Model.civil(picker?.value)?picker.value:new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  if(!Model.civil(selected)){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const values=Object.fromEntries(parts.map(x=>[x.type,x.value]));selected=values.year+'-'+values.month+'-'+values.day;}
  let month=selected.slice(0,7),filter='all',records=[],loaded=false,failed=false;
  if(old){old.open=false;annual.after(old);old.classList.add('r-legacy-observances');}
  annual.classList.add('r-calendar-layout');
  const explorer=make('section','d-panel r-explorer');explorer.id='festival-year-explorer';
  explorer.innerHTML='<div class="r-explorer-head"><h2 data-r-title></h2><div class="r-month-controls"><button type="button" data-r-shift="-1" aria-label="Previous month">←</button><label><span class="d-sr-only">Month and year</span><input type="month" min="1900-01" max="2100-12" data-r-month></label><button type="button" data-r-shift="1" aria-label="Next month">→</button></div></div><p class="r-calendar-scope" role="status"></p><div class="r-calendar-body"><div><table class="r-month-table"><caption class="d-sr-only"></caption><thead></thead><tbody></tbody></table><p class="r-selection-note"></p></div><aside class="r-calendar-sidebar"><h3 data-r-types></h3><div class="r-category-filters"></div><div class="r-month-agenda"></div></aside></div><section class="r-day-detail" aria-live="polite"></section>';
  label(explorer.querySelector('[data-r-title]'),'Festival Year Explorer','वार्षिक पर्व अन्वेषक');
  label(explorer.querySelector('[data-r-types]'),'Event types','आयोजन के प्रकार');
  annual.prepend(explorer);
  const side=make('div','r-calendar-right');annual.append(side);
  const bookIntro=make('section','d-panel r-book-entry');bookIntro.append(heading('Annual Festival Book','वार्षिक पर्व पुस्तिका'));
  bookIntro.append(text('Four canonical pages · Varanasi basis · Three lunar-month slots per page.','चार मानक पृष्ठ · वाराणसी आधार · प्रति पृष्ठ तीन चांद्र-मास खंड।','p'));
  const open=label(make('button','r-gold'),'Explore Festival Book →','पर्व पुस्तिका खोलें →');open.type='button';open.addEventListener('click',()=>{book.open=true;book.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});});bookIntro.append(open);side.append(bookIntro);
  // Keep the real book and all of its existing page controls; only its entry and position change.
  side.append(book);
  const coverage=make('section','d-panel r-coverage');coverage.append(heading('What Appears in This Calendar','इस कैलेंडर में क्या है'));
  coverage.innerHTML+='<ul><li data-r-coverage-approved></li><li data-r-coverage-festivals></li><li data-r-coverage-government></li><li data-r-coverage-other></li></ul>';
  label(coverage.querySelector('[data-r-coverage-approved]'),'Approved monthly Hindu observances','अनुमोदित मासिक हिंदू अनुष्ठान');
  label(coverage.querySelector('[data-r-coverage-festivals]'),'Named festivals: only when specifically approved','नामित पर्व: विशिष्ट अनुमोदन के बाद ही');
  label(coverage.querySelector('[data-r-coverage-government]'),'Government holidays: verified schedule not connected','सरकारी अवकाश: सत्यापित सूची अभी उपलब्ध नहीं');
  label(coverage.querySelector('[data-r-coverage-other]'),'Other traditions: verified calendars not connected','अन्य परंपराएँ: सत्यापित कैलेंडर अभी उपलब्ध नहीं');side.append(coverage);
  const upcoming=$('.d-panchang-results > .d-panel');
  if(upcoming){upcoming.replaceChildren(heading('Upcoming Festival / Holiday','आगामी पर्व / अवकाश'));upcoming.append(make('div','r-upcoming-list'));const a=label(make('a','d-text-link'),'View full festival calendar →','पूरा पर्व कैलेंडर देखें →');a.href='#festival-year-explorer';upcoming.append(a);}
  function filtered(){return filter==='all'||filter==='observance'?records:[];}
  function showDetail(r,container){
   const item=make('article','r-event-detail');const title=document.createElement('h4');title.textContent=eventName(r);item.append(title);
   const dl=document.createElement('dl');
   [[t('Begins','आरंभ'),timing(r.primary_public_window.start_local)],[t('Ends','समाप्ति'),timing(r.primary_public_window.end_local)],[t('Location / timezone','स्थान / समय क्षेत्र'),'Varanasi / Banaras · Asia/Kolkata']].forEach(([a,b])=>{const div=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=a;dd.textContent=b;div.append(dt,dd);dl.append(div);});item.append(dl);
   if(Array.isArray(r.ritual_windows)&&r.ritual_windows.length){const details=document.createElement('details');details.append(text('Separate ritual windows','अलग अनुष्ठान समय','summary'));r.ritual_windows.forEach(w=>{const p=document.createElement('p');p.textContent=(w.ritual_key||t('Ritual','अनुष्ठान'))+': '+timing(w.start_local)+' — '+timing(w.end_local);details.append(p);});item.append(details);}
   container.append(item);
  }
  function status(){return failed?t('Calendar source unavailable. No event dates are displayed.','कैलेंडर स्रोत अनुपलब्ध। आयोजन तिथियाँ प्रदर्शित नहीं हैं।'):!loaded?t('Loading approved Varanasi records…','अनुमोदित वाराणसी अभिलेख लोड हो रहे हैं…'):t('Varanasi · Asia/Kolkata · '+records.length+' approved monthly observances. Other dates may have no approved record.','वाराणसी · एशिया/कोलकाता · '+records.length+' अनुमोदित मासिक अनुष्ठान। अन्य तिथियों के लिए अभिलेख उपलब्ध न हो सकता है।');}
  function render(){
   explorer.querySelector('[data-r-month]').value=month;
   explorer.querySelector('.r-calendar-scope').textContent=status();
   const category=explorer.querySelector('.r-category-filters');category.replaceChildren();
   [['all','All approved','सभी अनुमोदित',true],['observance','Observances / Vratas','अनुष्ठान / व्रत',true],['festival','Named festivals — unavailable','नामित पर्व — अनुपलब्ध',false],['government','Government holidays — unavailable','सरकारी अवकाश — अनुपलब्ध',false],['other','Other traditions — unavailable','अन्य परंपराएँ — अनुपलब्ध',false]].forEach(([key,en,hindi,available])=>{const b=document.createElement('button');b.type='button';b.dataset.rCategory=key;b.setAttribute('aria-pressed',String(key===filter));b.textContent=t(en,hindi);if(!available)b.dataset.unavailable='true';category.append(b);});
   const weekdays=hi()?['रवि','सोम','मंगल','बुध','गुरु','शुक्र','शनि']:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
   explorer.querySelector('thead').innerHTML='<tr>'+weekdays.map(x=>'<th scope="col">'+x+'</th>').join('')+'</tr>';
   explorer.querySelector('caption').textContent=t('Festival calendar for ','पर्व कैलेंडर: ')+month;
   const cells=Model.monthCells(month);let html='';for(let i=0;i<cells.length;i++){const c=cells[i];if(i%7===0)html+='<tr>';const count=filtered().filter(r=>r.civil_date===c.date).length;html+='<td'+(!c.inMonth?' class="r-other-month"':'')+'><button type="button" data-r-date="'+c.date+'" '+(!Model.civil(c.date)?'disabled ':'')+(c.date===selected?'aria-pressed="true" ':'aria-pressed="false" ')+'aria-label="'+escape(dateLabel(c.date)+(count?' · '+count+' '+t('approved observances','अनुमोदित अनुष्ठान'):''))+'"><span>'+c.day+'</span>'+(count?'<span class="r-event-dot" aria-hidden="true"></span>':'')+'</button></td>';if(i%7===6)html+='</tr>';}
   explorer.querySelector('tbody').innerHTML=html;
   explorer.querySelector('.r-selection-note').textContent=t('Choose a day for its approved observance details. Browsing does not change the daily Panchang.','अनुमोदित अनुष्ठान विवरण के लिए दिन चुनें। ब्राउज़ करने से दैनिक पंचांग नहीं बदलता।');
   const agenda=explorer.querySelector('.r-month-agenda');agenda.replaceChildren(text('In this month','इस महीने','h3'));
   const events=filtered().filter(r=>r.civil_date.startsWith(month));
   if(!events.length)agenda.append(text(filter==='all'||filter==='observance'?'No approved records for this month.':'This category has no connected verified source.',filter==='all'||filter==='observance'?'इस महीने के लिए अनुमोदित अभिलेख नहीं हैं।':'इस श्रेणी का सत्यापित स्रोत अभी उपलब्ध नहीं है।','p'));
   events.forEach(r=>{const b=document.createElement('button');b.type='button';b.dataset.rDate=r.civil_date;b.textContent=r.civil_date.slice(8)+' · '+eventName(r);agenda.append(b);});
   const detail=explorer.querySelector('.r-day-detail');detail.replaceChildren(text(t('Selected day: ','चयनित दिन: ')+dateLabel(selected),t('Selected day: ','चयनित दिन: ')+dateLabel(selected),'h3'));
   const day=filtered().filter(r=>r.civil_date===selected);day.forEach(r=>showDetail(r,detail));
   if(!day.length)detail.append(text(loaded?'No approved record for this date in the selected category.':'Approved records are loading.','चयनित श्रेणी में इस तिथि का अनुमोदित अभिलेख उपलब्ध नहीं है।','p'));
   const view=label(make('button','r-view-day'),'View this day’s Panchang →','इस दिन का पंचांग देखें →');view.type='button';view.addEventListener('click',()=>{picker.value=selected;picker.dispatchEvent(new Event('change',{bubbles:true}));$('#panchang-festival-card').scrollIntoView({block:'start',behavior:'auto'});});detail.append(view);
   explorer.querySelectorAll('[data-r-shift]').forEach(b=>b.disabled=!Model.shift(month,+b.dataset.rShift));
   if(upcoming){const list=upcoming.querySelector('.r-upcoming-list');list.replaceChildren();const date=picker.value;const future=records.filter(r=>r.civil_date>date).slice(0,5);future.forEach(r=>{const b=document.createElement('button');b.type='button';b.textContent=dateLabel(r.civil_date)+' · '+eventName(r);b.addEventListener('click',()=>{selected=r.civil_date;month=selected.slice(0,7);filter='all';render();explorer.scrollIntoView({block:'start',behavior:'auto'});});list.append(b);});if(!future.length)list.append(text(loaded?'No approved upcoming records in the available source period.':'Loading approved upcoming records…','उपलब्ध स्रोत अवधि में अनुमोदित आगामी अभिलेख नहीं हैं।','p'));}
  }
  explorer.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.rShift){const next=Model.shift(month,+b.dataset.rShift);if(next){month=next;selected=month+'-01';render();}}else if(b.dataset.rDate){selected=b.dataset.rDate;month=selected.slice(0,7);render();explorer.querySelector('[data-r-date="'+selected+'"]').focus();}else if(b.dataset.rCategory){filter=b.dataset.rCategory;render();explorer.querySelector('[data-r-category="'+filter+'"]').focus();}});
  explorer.querySelector('[data-r-month]').addEventListener('change',e=>{if(Model.civil(e.target.value+'-01')){month=e.target.value;selected=month+'-01';render();}});
  explorer.querySelector('tbody').addEventListener('keydown',e=>{const b=e.target.closest('[data-r-date]');if(!b||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key))return;e.preventDefault();const cells=Model.monthCells(month);const i=cells.findIndex(x=>x.date===b.dataset.rDate);let target=i+({ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7}[e.key]||0);if(e.key==='Home')target=i-i%7;if(e.key==='End')target=i+(6-i%7);const value=cells[target];if(value)explorer.querySelector('[data-r-date="'+value.date+'"]').focus();});
  picker.addEventListener('change',()=>{if(Model.civil(picker.value)){selected=picker.value;month=selected.slice(0,7);render();}});
  function fullObservanceWindow(){const begins=$('#upcoming-observance-begins')?.textContent,ends=$('#upcoming-observance-ends')?.textContent;const output=$('#dv2-upcoming-observance-compact-window');if(output&&begins&&ends)output.textContent=t('Begins: ','आरंभ: ')+begins+' · '+t('Ends: ','समाप्ति: ')+ends;const h=$('#festival-list .sub');if(h)h.textContent=t('Today’s Observance','आज का अनुष्ठान');}
  const card=$('#panchang-festival-card');new MutationObserver(()=>{if(card.getAttribute('data-sup02-request-state')==='committed'){render();requestAnimationFrame(fullObservanceWindow);}}).observe(card,{attributes:true,attributeFilter:['data-sup02-request-state']});
  translateExtra=()=>{render();fullObservanceWindow();};render();
  fetch('data/knowledge-base/panchang-festival/production/ag74p-approved-festival-observance-projection.json',{cache:'no-store',credentials:'omit'}).then(r=>{if(!r.ok)throw Error('source');return r.json();}).then(p=>{records=Model.approvedRecords(p);loaded=true;render();}).catch(()=>{failed=true;loaded=true;render();});
 }
 function buildReflection(){
  const card=$('[data-drishvara-v2-reflect-card="true"]'), insight=$('.d-reflection-insight'), panel=$('[data-ag71e-preview-panel="star-reflection"]'), grid=$('[data-ag71e-preview-grid="star-reflection"]');if(!card||!insight||!panel||!grid)return;
  const toggle=$('.dv2-language-toggle');if(toggle)card.prepend(toggle);
  const dob=$('#star-reflection-dob');if(dob){const field=make('label','r-dob-label');field.htmlFor=dob.id;field.append(text('Date of Birth','जन्म तिथि'));dob.before(field);field.append(dob);}
  const intro=make('div','r-reflection-reading');intro.setAttribute('aria-live','polite');insight.querySelector('h2').after(intro);
  const resultDetails=make('details','r-result-basis');resultDetails.append(text('Calculation basis and source details','गणना आधार और स्रोत विवरण','summary'));panel.before(resultDetails);resultDetails.append(panel);
  // The original output nodes stay readable in details; the summary copies their approved display text.
  const mappings=[['Reflective theme','चिंतन-विषय'],['Self-inquiry prompt','स्व-प्रश्न'],['Question for reflection','स्व-प्रश्न'],['Grounding practice','आधार अभ्यास'],['Limitation notice','सीमा'],['Result note','सीमा']];
  function rows(){const values=new Map();grid.querySelectorAll('.ag71e-preview-row').forEach(row=>{const strong=row.querySelector('strong'),span=row.querySelector('span');if(strong&&span)values.set(strong.dataset.dv2OriginalLabel||strong.textContent.trim(),span.textContent.trim());});return values;}
  function sync(){
   const values=rows(),busy=$('[data-ag71e-preview-button="star-reflection"]')?.getAttribute('aria-busy')==='true';intro.replaceChildren();
   const valid=!panel.hidden&&!busy&&values.has('Reflective theme');
   if(!panel.hidden&&!busy&&values.get('Resolution state')==='boundary_review_required'){
    intro.append(text('Transition precision review required','परिवर्तन की सटीकता की समीक्षा आवश्यक','h3'));
    const notice=document.createElement('p');notice.textContent=values.get('Limitation notice')||t('No exact Nakshatra is selected near a transition. Review the time basis.','परिवर्तन के निकट सटीक नक्षत्र नहीं चुना जाता। समय के आधार की समीक्षा करें।');intro.append(notice);
   }else if(valid){const art=make('div','r-reading-art');art.setAttribute('aria-hidden','true');intro.append(art);mappings.forEach(([key,hindi])=>{const value=values.get(key);if(!value)return;intro.append(text(key,hindi,key==='Reflective theme'?'h3':'h4'));const p=document.createElement('p');p.textContent=value;intro.append(p);});
    const basis=make('div','d-basis-grid');[['Exact birth Nakshatra','Day-context Nakshatra','Nakshatra basis','नक्षत्र आधार'],['Moon-sign basis','Moon sign','Moon-sign basis','चंद्र राशि आधार'],['Birth-time basis','Time confidence','Time confidence','समय की निश्चितता'],['Resolution state','Result basis','Session type','सत्र प्रकार']].forEach(([a,b,en,hindi])=>{const e=document.createElement('span');e.append(text(en,hindi));const small=document.createElement('small');small.textContent=values.get(a)||values.get(b)||t('Not supplied by the approved result','अनुमोदित परिणाम में उपलब्ध नहीं');e.append(small);basis.append(e);});intro.append(basis);
   }else if(!panel.hidden){intro.append(text(busy?'Resolving your reflection…':'Reflection unavailable for these inputs.','इन विवरणों के लिए चिंतन उपलब्ध नहीं है।','h3'));const value=values.get('Status')||values.get('Result basis');if(value){const p=document.createElement('p');p.textContent=value;intro.append(p);}}
   const wait=$('.d-reflect-wait');if(wait)wait.hidden=!panel.hidden;
   resultDetails.hidden=panel.hidden;
  }
  new MutationObserver(sync).observe(grid,{childList:true,subtree:true,characterData:true});
  new MutationObserver(sync).observe(panel,{attributes:true,attributeFilter:['hidden']});
  const button=$('[data-ag71e-preview-button="star-reflection"]');if(button)new MutationObserver(sync).observe(button,{attributes:true,attributeFilter:['aria-busy']});
  const links=$('.d-related');if(links){links.prepend(Object.assign(label(document.createElement('a'),'Reflection Journal Prompt →','चिंतन डायरी प्रश्न →'),{href:'#reflection-journal'}));}
  const journal=make('section','d-panel r-journal');journal.id='reflection-journal';journal.append(heading('Reflection Journal Prompt','चिंतन डायरी प्रश्न'));journal.append(text('What deserves your attention today, and what is one practical step you can take?','आज किस बात पर ध्यान देना चाहिए, और आप कौन-सा एक व्यावहारिक कदम उठा सकते हैं?','p'));
  const input=document.createElement('textarea');input.rows=4;input.setAttribute('aria-label','Reflection journal — not stored');input.placeholder=t('Write privately in this page. Text is cleared when you leave or reload.','इस पृष्ठ पर निजी रूप से लिखें। पृष्ठ छोड़ने या रीलोड करने पर पाठ मिट जाएगा।');journal.append(input);journal.append(text('Optional writing space · Not saved or submitted','वैकल्पिक लेखन स्थान · सहेजा या भेजा नहीं जाता','small'));const clear=label(make('button','r-view-day'),'Clear writing','लेखन मिटाएँ');clear.type='button';clear.addEventListener('click',()=>{input.value='';input.focus();});journal.append(clear);links?.after(journal);
  const previous=translateExtra;translateExtra=()=>{previous();sync();};sync();
 }
 function buildSports(){
  const content=$('.d-page-content'), top=$('.d-sports-top');if(!content||!top)return;
  const domains=make('section','d-panel r-sport-domains');domains.append(heading('Explore the Sports Desk','खेल डेस्क देखें'));
  const paths=make('div','r-domain-grid');[['Cricket','The contest'],['Football','The world game'],['Athletics','The disciplines'],['Beyond sport','The human story']].forEach(([title,sub])=>{const a=document.createElement('a');a.href='#sports-editorial-topics';const small=document.createElement('small');small.textContent=sub;const h=document.createElement('h3');h.textContent=title;a.append(small,h);paths.append(a);});domains.append(paths);top.before(domains);
  const topics=make('section','d-panel r-sports-topics');topics.id='sports-editorial-topics';topics.append(heading('More than the Scoreboard','स्कोरबोर्ड से आगे'));
  const cards=make('div','r-sport-theme-grid');[['Performance & Preparation','Training, strategy, sporting systems and evidence-based development.'],['Lives Behind the Game','Athlete welfare, communities and the human experience of competition.'],['The Wider Playing Field','Sports science, infrastructure, economics and sporting culture.']].forEach(([a,b])=>{const article=make('article','');article.innerHTML='<h3>'+a+'</h3><p>'+b+'</p><a href="#sports-all-coverage">Explore published analysis →</a>';cards.append(article);});topics.append(cards);$('.d-analysis').before(topics);
  const analysis=$('.d-analysis');analysis.id='sports-all-coverage';const all=$('#sports-coverage .d-panel-head a');if(all)all.href='#sports-all-coverage';
  // Show every eligible article in the same public Sports collection; no ignored topic query.
  window.DrishvaraV2Shell.loadArticleIndex().then(data=>{const records=(Array.isArray(data.publishedItems)?data.publishedItems:data.publicLatest||[]).filter(x=>String(x.tag||'').toLowerCase()==='sports'&&/^articles\/sports\/[a-z0-9-]+\.html$/.test(x.path||x.sourcePath||''));const index=make('details','r-sports-all');index.append(text('All published sports stories ('+records.length+')','सभी प्रकाशित खेल लेख ('+records.length+')','summary'));const list=document.createElement('ul');records.forEach(item=>{const li=document.createElement('li'),a=document.createElement('a');a.href='article.html?path='+encodeURIComponent(item.path||item.sourcePath);a.textContent=item.title;li.append(a);list.append(li);});index.append(list);analysis.append(index);});
 }
 function common(){
  const areas=[['.d-hero-intro','Daily Panchang, observances and the annual festival calendar — with every date governed by its source.','दैनिक पंचांग, अनुष्ठान और वार्षिक पर्व कैलेंडर — प्रत्येक तिथि अपने अनुमोदित स्रोत पर आधारित।']];
  if(kind==='panchang')areas.forEach(([s,en,hindi])=>addLang(en,hindi,s));
  if(kind==='what-stars-say'){
   addLang('Your Star Reflection','आपका नक्षत्र चिंतन','.d-page-hero h1');addLang('A Vedic-inspired space for personal inquiry and understanding — not a prediction or decision guide.','स्व-जिज्ञासा और समझ के लिए पारंपरिक संदर्भों से प्रेरित स्थान — भविष्यवाणी या निर्णय मार्गदर्शिका नहीं।','.d-hero-intro');
   addLang('Today’s Reflective Insight','आज का चिंतन संकेत','.d-reflection-insight>h2');addLang('How This Reflection Works','यह चिंतन कैसे काम करता है','.d-reflection-explain .d-panel:first-child>h2');addLang('What You Can Explore','आप क्या खोज सकते हैं','.d-reflection-explain .d-panel:last-child>h2');
   addLang('Reflection method & privacy','चिंतन पद्धति और गोपनीयता','.d-form-notes>summary');
   $$('.d-features strong').forEach((e,i)=>label(e,['Rooted in tradition','For reflection','Self-inquiry','Privacy first'][i],['परंपरा का आधार','चिंतन के लिए','स्व-जिज्ञासा','गोपनीयता पहले'][i]));
   const body=$('#reflect');const saved=translateExtra;translateExtra=()=>{saved();const h=$('.d-form-title');if(h)h.textContent=t('Generate Your Star Reflection','अपना नक्षत्र चिंतन बनाएँ');};
  }
  const root=$('#time')||$('#reflect');if(root)new MutationObserver(language).observe(root,{attributes:true,attributeFilter:['data-dv2-lang']});
  language();
 }
 function boot(){if(kind==='panchang')buildPanchang();if(kind==='what-stars-say')buildReflection();if(kind==='sports')buildSports();common();}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

