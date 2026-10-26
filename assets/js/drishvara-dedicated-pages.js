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
