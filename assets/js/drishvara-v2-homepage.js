(function () {
  "use strict";

  var ROTATION_MS = 7000;
  function escape(value) { return window.DrishvaraV2Shell.escapeHtml(value); }
  function key(item) { return item && (item.sourcePath || item.path || item.directUrl) || ""; }
  function selectFeatured(data, indexData) {
    var published = window.DrishvaraV2Shell.publicItems(indexData).filter(function (item) {
      return item.source === "articles" && /^articles\/.+\.html$/.test(key(item));
    });
    var byPath = new Map(published.map(function (item) { return [key(item), item]; }));
    var seen = new Set();
    return ((data && data.featuredReads) || []).concat(published).reduce(function (out, item) {
      var canonical = byPath.get(key(item));
      if (canonical && !seen.has(key(canonical)) && out.length < 5) {
        seen.add(key(canonical)); out.push(canonical);
      }
      return out;
    }, []);
  }
  function image(item, sizes, eager) {
    if (!item.image) return '<span class="f2-image-empty">Drishvara</span>';
    return '<img src="' + escape(item.image) + '" alt="" width="640" height="400" sizes="' + sizes +
      '" loading="' + (eager ? "eager" : "lazy") + '" decoding="async" data-image-article="' + escape(key(item)) + '">';
  }
  function articleLink(item) { return window.DrishvaraV2Shell.articleHref(item); }
  function dayKey(now, timezone) {
    try {
      var parts = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: timezone }).formatToParts(now);
      function part(type) { return parts.find(function (p) { return p.type === type; }).value; }
      return part("year") + "-" + part("month") + "-" + part("day");
    } catch (_error) { return null; }
  }
  function isTodayResult(state, requestState, resultState, now) {
    var request = state && state.lastCommittedRequest;
    return Boolean(request && request.timezone && state.requestDirty === false && requestState === "committed" &&
      resultState === "calculated" && request.civil_date === dayKey(now, request.timezone));
  }
  function publicationStatus(kind, data) {
    if (!data || data.public_ui_ready !== true) return "Under verification";
    if (kind === "mantra" && data.mantra_publication_allowed !== true) return "Under verification";
    // These preview sources have no approved date-bound daily publication contract.
    return "Approved daily result unavailable";
  }
  async function approvedWordPublication(data, now) {
    var a = data && data.assignment, copyData = a && a.reviewed_copy, content = copyData && copyData.content;
    function text(value) { return typeof value === 'string' && value.trim().length > 0; }
    function safeUrl(value) { try { var url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; } catch (_error) { return false; } }
    if (!data || data.contract_version !== 'ag70e.word-publication.v1' || data.status !== 'published' ||
        data.public_output_allowed !== true || data.runtime_activation !== true || data.publication_scope !== 'global_public_word' ||
        data.timezone !== 'Asia/Kolkata' || typeof data.date_key !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.date_key) || data.date_key !== dayKey(now, 'Asia/Kolkata') ||
        !a || a.withdrawn !== false || a.superseded !== false ||
        !['assignment_id', 'proposal_id', 'canonical_lexical_identity_id', 'approved_record_version', 'publication_event_id', 'publication_timestamp', 'release_approval_ref', 'copy_content_hash', 'selection_trace_ref'].every(function (k) { return text(a[k]); }) ||
        !Number.isFinite(Date.parse(a.publication_timestamp)) || Date.parse(a.publication_timestamp) > now.getTime() ||
        !copyData || copyData.contract_version !== 'ag70e.word-copy.v1' || !text(copyData.version) || !content || !Array.isArray(copyData.reviews)) return null;
    if (!['english', 'hindi', 'sanskrit', 'meaning_en', 'meaning_hi', 'reflection_en', 'reflection_hi'].every(function (k) { return text(content[k]); })) return null;
    if (['linguistic', 'editorial', 'rights', 'context', 'safety'].some(function (kind) {
      return copyData.reviews.filter(function (r) { return r.kind === kind && r.review_status === 'approved' && text(r.approval_ref) && r.content_hash === a.copy_content_hash; }).length !== 1;
    })) return null;
    if (content.iast !== null && (!text(content.iast) || copyData.iast_review_status !== 'approved' || !text(copyData.iast_approval_ref))) return null;
    if (!Array.isArray(content.sources) || !content.sources.length || !content.sources.every(function (s) {
      return s.review_status === 'approved' && ['evidence_ref', 'title', 'publisher', 'attribution', 'reuse_approval_ref'].every(function (k) { return text(s[k]); }) && safeUrl(s.url);
    })) return null;
    try {
      function ordered(value) {
        if (Array.isArray(value)) return value.map(ordered);
        if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(function (k) { return [k, ordered(value[k])]; }));
        return value;
      }
      var digest = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(ordered(content))));
      var hash = 'sha256:' + Array.from(new Uint8Array(digest)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
      return hash === a.copy_content_hash ? content : null;
    } catch (_error) { return null; }
  }
  var wordExpiryTimer = null, wordRolloverTimer = null;
  var wordPaintGeneration = 0, wordReadGeneration = 0;
  async function renderWordPublication(data, now) {
    var generation = ++wordPaintGeneration;
    now = now || new Date();
    var value = document.getElementById('f2-word-state'), description = document.getElementById('f2-word-description'), note = document.getElementById('f2-word-note');
    if (!value || !description || !note) return false;
    window.clearTimeout(wordExpiryTimer); wordExpiryTimer = null;
    var content = await approvedWordPublication(data, now);
    if (generation !== wordPaintGeneration) return false;
    if (!content) {
      value.textContent = 'Under verification'; description.textContent = 'No approved daily word is available for publication.';
      note.textContent = 'Source and publication review is required. No daily selection is inferred.';
      return false;
    }
    value.innerHTML = '<span lang="en">' + escape(content.english) + '</span><span class="f2-word-scripts"><span lang="hi">' + escape(content.hindi) + '</span> &middot; <span lang="sa">' + escape(content.sanskrit) + '</span></span>' +
      (content.iast ? '<span class="f2-word-iast" lang="sa-Latn">' + escape(content.iast) + '</span>' : '');
    description.innerHTML = '<span lang="en">' + escape(content.meaning_en) + '</span><br><span lang="hi">' + escape(content.meaning_hi) + '</span>';
    note.innerHTML = '<span lang="en">' + escape(content.reflection_en) + '</span><br><span lang="hi">' + escape(content.reflection_hi) + '</span><br>' + escape(data.date_key) + ' &middot; Asia/Kolkata<br>' +
      content.sources.map(function (s) { return '<a href="' + escape(s.url) + '" rel="noopener noreferrer">' + escape(s.title) + '</a> &middot; ' + escape(s.publisher) + ' &middot; ' + escape(s.attribution); }).join('<br>');
    // One-shot display expiry only, not scheduling, selection, polling or publication.
    wordExpiryTimer = window.setTimeout(function () { renderWordPublication(null); }, Math.max(1, Date.parse(data.date_key + 'T18:30:00.000Z') - now.getTime()));
    return true;
  }
  function configuredWordFeed() {
    var setting = document.querySelector && document.querySelector('meta[name="drishvara-word-feed"]');
    var value = setting && setting.getAttribute('content');
    // Deployment routing only, never content approval or a browser write capability.
    return value === 'https://pajlabwwszmhjhabxprf.supabase.co/functions/v1/word-of-day' ? value : null;
  }
  function loadWordPublication() {
    var generation = ++wordReadGeneration;
    var feed = configuredWordFeed();
    window.clearTimeout(wordRolloverTimer); wordRolloverTimer = null;
    if (feed) {
      var now = new Date(), date = dayKey(now, 'Asia/Kolkata');
      wordRolloverTimer = window.setTimeout(function () {
        return renderWordPublication(null).then(loadWordPublication);
      }, Math.max(1, Date.parse(date + 'T18:30:00.000Z') - now.getTime()));
    }
    var options = { cache: 'no-store', credentials: 'omit', redirect: 'error' };
    if (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) options.signal = AbortSignal.timeout(12000);
    return fetch(feed || 'generated/word-of-day-publication.json', options).then(function (response) {
      return response.ok ? response.json() : null;
    }).catch(function () { return null; }).then(function (data) { if (generation === wordReadGeneration) return renderWordPublication(data); });
  }
  function carouselModel(count, reduced) {
    return {
      index: 0, paused: Boolean(reduced), reduced: Boolean(reduced),
      go: function (next) { if (count) this.index = (next % count + count) % count; return this.index; },
      canRotate: function () { return count > 1 && !this.paused && !this.reduced; }
    };
  }
  function markup() {
    return '<section class="dv2-section dv2-today f2-hero" id="today" data-dv2-world="today">' +
      '<img class="f2-hero-image" src="assets/hero/varanasi-sunset-ai.png" alt="" width="1672" height="941" fetchpriority="high" data-provenance="assets/hero/varanasi-sunset-ai.provenance.json">' +
      '<div class="dv2-section__inner f2-hero-grid"><div class="f2-brief">' +
      '<p class="f2-dateline" id="f2-dateline"></p><p class="f2-eyebrow">First Light</p>' +
      '<h1>What matters <br>now.</h1><p class="f2-eyebrow" id="dv2-first-light-count">Key developments</p>' +
      '<div id="dv2-first-light-list" class="f2-developments"></div>' +
      '<a class="f2-primary" href="insights.html">Read the full analysis <span aria-hidden="true">&rarr;</span></a></div>' +
      '<section class="f2-carousel" id="dv2-featured-carousel" aria-label="Featured stories" aria-roledescription="carousel"></section>' +
      '</div><p class="f2-photo-credit">AI-generated Varanasi illustration &middot; approved supplied asset &middot; responsive crop</p></section>' +
      '<section class="f2-daily" aria-labelledby="f2-daily-title"><div class="f2-inner">' +
      '<div class="f2-section-heading"><h2 id="f2-daily-title">Your Day at a Glance</h2><p id="f2-daily-basis">Today &middot; Varanasi / Banaras</p>' +
      '<a href="panchang.html" class="f2-location-link">Change location</a><a href="panchang.html" class="f2-dark-link">View full Panchang &rarr;</a></div>' +
      '<div class="f2-daily-grid"><article class="f2-day-card f2-panchang"><h3>Today\u2019s Panchang</h3><dl>' +
      ['Tithi', 'Nakshatra', 'Yoga', 'Karana'].map(function (label) { return '<div><dt>' + label + '</dt><dd id="f2-day-' + label.toLowerCase() + '">Unavailable</dd></div>'; }).join('') +
      '</dl><p class="f2-sun-times">Sunrise <strong id="f2-day-sunrise">&mdash;</strong> &middot; Sunset <strong id="f2-day-sunset">&mdash;</strong></p><p id="f2-daily-status">Resolving today\u2019s approved result.</p></article>' +
      '<article class="f2-day-card"><h3>Today\u2019s Observance</h3><strong class="f2-day-value" id="f2-day-observance">Resolving approved observances</strong><p id="f2-day-observance-window"></p><a href="panchang.html">View details &rarr;</a></article>' +
      ['Word', 'Colour', 'Mantra'].map(function (label) { var id = label.toLowerCase(); return '<article class="f2-day-card f2-publication" data-f2-publication="' + id + '"><h3>' + label + ' of the Day</h3><strong class="f2-day-value" id="f2-' + id + '-state">Under verification</strong><p id="f2-' + id + '-description">No approved daily ' + id + ' is available for publication.</p><details><summary>Publication basis</summary><p id="f2-' + id + '-note">Source and publication review is required. No daily selection is inferred.</p></details></article>'; }).join('') +
      '</div></div></section><div class="f2-editorial f2-inner">' +
      '<section id="read" data-dv2-world="read" aria-labelledby="f2-read-title"><div class="f2-section-heading"><h2 id="f2-read-title">Featured Read</h2><a href="insights.html">View all reads &rarr;</a></div><article id="dv2-lead-read" class="f2-lead"></article></section>' +
      '<section id="explore" data-dv2-world="explore" aria-labelledby="f2-explore-title"><div class="f2-section-heading"><h2 id="f2-explore-title">Explore More</h2><a href="insights.html">Explore all &rarr;</a></div><div id="f2-explore-cards" class="f2-explore-grid"></div></section></div>' +
      '<div class="f2-invitations f2-inner"><section class="f2-membership" aria-labelledby="f2-membership-title"><div><h2 id="f2-membership-title">Go deeper with Drishvara</h2><p>Explore our published reads. Membership is not yet available.</p></div><a class="f2-primary" href="login.html">Account information &rarr;</a></section>' +
      '<aside class="f2-advertisement" aria-label="Advertisement"><strong>Advertisement</strong><span>Reserved advertising space</span></aside></div>';
  }
  function renderFirstLight(data, indexData) {
    var source = data.firstLight && Array.isArray(data.firstLight.items) ? data.firstLight.items : [];
    if (!source.length) source = window.DrishvaraV2Shell.publicItems(indexData).map(function (item) { return { signal: item.title, place: item.tag }; });
    var items = source.filter(function (item) { return item && item.signal; }).slice(0, 3);
    document.getElementById("dv2-first-light-count").textContent = items.length + " Key developments";
    document.getElementById("dv2-first-light-list").innerHTML = items.map(function (item, i) {
      return '<article class="f2-development"><span aria-hidden="true">' + String(i + 1).padStart(2, "0") + '</span><p>' + escape(item.signal) + '</p></article>';
    }).join('') || '<p>Current developments are unavailable. Explore the published reads.</p>';
  }
  function renderFeatured(data, indexData) {
    var host = document.getElementById("dv2-featured-carousel");
    var items = selectFeatured(data, indexData);
    if (!items.length) { host.innerHTML = '<p>Featured stories are currently unavailable.</p>'; return; }
    var media = window.matchMedia("(prefers-reduced-motion: reduce)");
    var model = carouselModel(items.length, media.matches);
    var timer = null, hover = false, focus = false;
    host.innerHTML = '<div class="f2-carousel-heading"><p class="f2-eyebrow">Featured story</p><span id="f2-slide-count"></span><button type="button" data-f2-pause class="f2-icon" title="Pause automatic rotation" aria-label="Pause automatic rotation"></button></div>' +
      '<div class="f2-slides">' + items.map(function (item, i) {
        return '<article class="f2-slide" data-f2-slide="' + i + '" data-article-path="' + escape(key(item)) + '" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + ' of ' + items.length + '">' +
          '<p class="f2-story-topic">' + escape(item.tag) + '</p><h2><a href="' + escape(articleLink(item)) + '">' + escape(item.title) + '</a></h2><p class="f2-story-summary">' + escape(item.summary) + '</p>' +
          '<a class="f2-story-link" href="' + escape(articleLink(item)) + '">Read story &rarr;</a></article>';
      }).join('') + '</div><div class="f2-carousel-navigation"><button type="button" data-f2-prev class="f2-icon" aria-label="Previous story" title="Previous story">&larr;</button>' +
      '<div class="f2-thumbnails">' + items.map(function (item, i) {
        return '<button type="button" data-f2-story="' + i + '" title="' + escape(item.title) + '" aria-label="Show story ' + (i + 1) + ': ' + escape(item.title) + '">' + image(item, '120px', i === 0) + '<span>' + escape(item.title) + '</span></button>';
      }).join('') + '</div><button type="button" data-f2-next class="f2-icon" aria-label="Next story" title="Next story">&rarr;</button></div>';
    var slides = host.querySelectorAll('[data-f2-slide]');
    var buttons = host.querySelectorAll('[data-f2-story]');
    var pause = host.querySelector('[data-f2-pause]');
    function paint() {
      slides.forEach(function (slide, i) { slide.hidden = i !== model.index; slide.inert = i !== model.index; });
      buttons.forEach(function (button, i) { button.setAttribute("aria-pressed", String(i === model.index)); });
      host.querySelector('#f2-slide-count').textContent = (model.index + 1) + ' / ' + items.length;
      var label = model.paused || model.reduced ? 'Resume automatic rotation' : 'Pause automatic rotation';
      pause.textContent = model.paused || model.reduced ? '\u25b6' : '\u23f8';
      pause.setAttribute('aria-label', label); pause.title = label;
      pause.disabled = model.reduced || items.length < 2;
      if (model.reduced) { pause.setAttribute('aria-label', 'Automatic rotation disabled: reduced motion'); pause.title = 'Automatic rotation disabled: reduced motion'; }
    }
    function schedule() {
      window.clearInterval(timer); timer = null;
      if (model.canRotate() && !hover && !focus && !document.hidden) timer = window.setInterval(function () { model.go(model.index + 1); paint(); }, ROTATION_MS);
    }
    function manual(next) { model.paused = true; model.go(next); paint(); schedule(); }
    host.addEventListener('click', function (event) {
      var target = event.target.closest('[data-f2-story], [data-f2-prev], [data-f2-next], [data-f2-pause]');
      if (!target) return;
      if (target.hasAttribute('data-f2-story')) manual(Number(target.getAttribute('data-f2-story')));
      else if (target.hasAttribute('data-f2-prev')) manual(model.index - 1);
      else if (target.hasAttribute('data-f2-next')) manual(model.index + 1);
      else { model.paused = !model.paused; paint(); schedule(); }
    });
    host.addEventListener('keydown', function (event) {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key) || !event.target.closest('button')) return;
      event.preventDefault();
      var next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : model.index + (event.key === 'ArrowRight' ? 1 : -1);
      manual(next); buttons[model.index].focus();
    });
    host.addEventListener('mouseenter', function () { hover = true; schedule(); });
    host.addEventListener('mouseleave', function () { hover = false; schedule(); });
    host.addEventListener('focusin', function () { focus = true; schedule(); });
    host.addEventListener('focusout', function (event) { if (!host.contains(event.relatedTarget)) { focus = false; schedule(); } });
    document.addEventListener('visibilitychange', schedule);
    media.addEventListener('change', function (event) { model.reduced = event.matches; model.paused = true; paint(); schedule(); });
    window.addEventListener('pagehide', function () { window.clearInterval(timer); });
    paint(); schedule();
  }
  function renderRead(indexData) {
    var item = window.DrishvaraV2Shell.publicItems(indexData)[0];
    if (!item) return;
    var host = document.getElementById('dv2-lead-read');
    host.setAttribute('data-article-path', key(item));
    host.innerHTML = '<a class="f2-lead-image" href="' + escape(articleLink(item)) + '" tabindex="-1" aria-hidden="true">' + image(item, '360px', false) + '</a><div><p class="f2-topic">' + escape(item.tag) + '</p><h3><a href="' + escape(articleLink(item)) + '">' + escape(item.title) + '</a></h3><p>' + escape(item.summary) + '</p><a class="f2-editorial-link" href="' + escape(articleLink(item)) + '">Read the full story &rarr;</a></div>';
  }
  function renderExplore(indexData) {
    document.getElementById('f2-explore-cards').innerHTML = window.DrishvaraV2Shell.publicItems(indexData).slice(1, 5).map(function (item) {
      return '<article data-article-path="' + escape(key(item)) + '">' + image(item, '220px', false) + '<p class="f2-topic">' + escape(item.tag) + '</p><h3><a href="' + escape(articleLink(item)) + '">' + escape(item.title) + '</a></h3></article>';
    }).join('');
  }
  function syncDaily() {
    if (!document.getElementById('f2-daily-basis')) return;
    var now = new Date(), state = window.drishvaraSup02ActivationState && window.drishvaraSup02ActivationState();
    var card = document.getElementById('panchang-festival-card');
    var request = state && state.lastCommittedRequest;
    var timezone = request && request.timezone || 'Asia/Kolkata';
    var date = new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: timezone }).format(now);
    function read(id) { return document.getElementById(id)?.textContent.trim() || ''; }
    function text(id, value) { var node = document.getElementById(id); if (node) node.textContent = value; }
    var place = read('panchang-moonrise').split(' \u00b7 ')[0] || 'Varanasi / Banaras';
    text('f2-dateline', date + ' \u00b7 ' + (request ? place : 'Varanasi / Banaras'));
    text('f2-daily-basis', date + ' \u00b7 ' + (request ? place : 'Varanasi / Banaras'));
    var valid = card && isTodayResult(state, card.getAttribute('data-sup02-request-state'), card.getAttribute('data-sup02-result-state'), now);
    ['tithi', 'nakshatra', 'yoga', 'karana', 'sunrise', 'sunset'].forEach(function (field) {
      var value = valid ? read('panchang-' + field) : 'Unavailable';
      if (field === 'sunrise' || field === 'sunset') value = (value.match(/(?:T|\s)(\d{2}:\d{2})(?::\d{2})?/) || [null, value])[1];
      text('f2-day-' + field, value);
    });
    text('f2-daily-status', valid ? 'Today\u2019s approved result \u00b7 ' + timezone : 'Today\u2019s approved result is not available yet.');
    var observance = valid ? read('upcoming-observance-name') : 'No approved result available';
    if (/^No source-reviewed public observance/.test(observance)) observance = 'No approved observance today';
    text('f2-day-observance', observance);
    var begins = valid && read('upcoming-observance-begins'), ends = valid && read('upcoming-observance-ends');
    function time(value) { return (String(value).match(/T(\d{2}:\d{2})/) || [null, value])[1]; }
    text('f2-day-observance-window', begins && ends && begins !== 'Not available' && ends !== 'Not available' ? 'Begins ' + time(begins) + ' \u00b7 Ends ' + time(ends) : 'Public timings appear only with an approved observance.');
  }
  function loadPublicationStates() {
    var brand = document.querySelector('.dv2-brand > span');
    if (brand && !brand.querySelector('small')) brand.insertAdjacentHTML('beforeend', '<small>Intelligence for today. Wisdom for life.</small>');
    loadWordPublication();
    [['colour', 'generated/vedic-guidance-working-data.json']].forEach(function (source) {
      fetch(source[1], { cache: 'no-store' }).then(function (response) { return response.ok ? response.json() : null; }).catch(function () { return null; }).then(function (data) {
        var kinds = ['colour', 'mantra'];
        kinds.forEach(function (kind) { document.getElementById('f2-' + kind + '-state').textContent = publicationStatus(kind, data); });
      });
    });
    window.addEventListener('focus', function () { syncDaily(); loadWordPublication(); });
    document.addEventListener('visibilitychange', function () { if (!document.hidden) { syncDaily(); loadWordPublication(); } });
    window.addEventListener('pagehide', function () { window.clearTimeout(wordExpiryTimer); window.clearTimeout(wordRolloverTimer); });
    syncDaily();
  }
  window.DrishvaraV2Homepage = { markup: markup, selectFeatured: selectFeatured, renderFirstLight: renderFirstLight,
    renderFeatured: renderFeatured, renderRead: renderRead, renderExplore: renderExplore, syncDaily: syncDaily,
    loadPublicationStates: loadPublicationStates, publicationStatus: publicationStatus, isTodayResult: isTodayResult,
    dayKey: dayKey, carouselModel: carouselModel, rotationMs: ROTATION_MS,
    approvedWordPublication: approvedWordPublication, renderWordPublication: renderWordPublication,
    configuredWordFeed: configuredWordFeed, loadWordPublication: loadWordPublication };
})();
