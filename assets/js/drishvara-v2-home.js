(function () {
  "use strict";

  if (!/\/index\.html$|\/$/.test(location.pathname)) return;

  var Shell = window.DrishvaraV2Shell;
  var I18n = window.DrishvaraV2I18n;
  var Location = window.DrishvaraV2Location;
  var OBSERVANCE_PROJECTION_PATH =
    "data/knowledge-base/panchang-festival/production/ag74p-approved-festival-observance-projection.json";
  var observanceFilter = "all";
  var observanceRecords = null;
  var observanceViewMode = "calendar";
  var selectedObservanceMonth = "";
  var selectedObservanceRecordId = "";
  var yearOverviewMonths = [];
  var currentTimeLanguage = "en";
  var currentReflectLanguage = "en";

  function escapeHtml(value) {
    return Shell && Shell.escapeHtml
      ? Shell.escapeHtml(value)
      : String(value || "");
  }

  function fetchJson(path) {
    return fetch(path, { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) throw new Error(path + " unavailable");
        return response.json();
      })
      .catch(function () {
        return null;
      });
  }

  function formatToday() {
    var formatter = new Intl.DateTimeFormat("en-IN", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Kolkata"
    });
    return formatter.format(new Date());
  }

  function articleHref(item) {
    return Shell ? Shell.articleHref(item) : "article.html";
  }

  function publicItems(indexData) {
    return Shell ? Shell.publicItems(indexData) : [];
  }

  function section(id, kicker, title, body, extraClass) {
    return (
      '<section class="dv2-section ' +
      (extraClass || "") +
      '" id="' +
      id +
      '" data-dv2-world="' +
      id +
      '">' +
      '<div class="dv2-section__inner">' +
      '<p class="dv2-section__kicker">' +
      escapeHtml(kicker) +
      "</p>" +
      "<h2>" +
      escapeHtml(title) +
      "</h2>" +
      body +
      "</div></section>"
    );
  }

  function safeImage(item) {
    var image = String((item && (item.image || item.imagePath)) || "").trim();
    if (!image) return "assets/logo/logo.png";
    return image;
  }

  function renderShell() {
    var oldApp = document.getElementById("drishvara-v2-app");
    if (oldApp) return oldApp;

    var header = Shell.ensureHeader("today");
    var app = document.createElement("div");
    app.id = "drishvara-v2-app";
    app.className = "dv2-home";
    app.innerHTML =
      '<main id="dv2-main">' +
      '<section class="dv2-section dv2-today" id="today" data-dv2-world="today">' +
      '<div class="dv2-section__inner dv2-today-grid">' +
      '<div class="dv2-live-context">' +
      '<div class="dv2-live-date" id="dv2-live-date">' +
      escapeHtml(formatToday()) +
      ' - Varanasi</div>' +
      '<p class="dv2-today-label">Today</p>' +
      '<h1 class="dv2-live-title">What matters now.</h1>' +
      '<div class="dv2-first-light"><p class="dv2-mini-label" id="dv2-first-light-count">First Light · Key Developments</p><div class="dv2-live-signal"><div><strong>In Focus</strong><span id="dv2-current-intelligence">Current public context is loading.</span></div></div><div class="dv2-signal-list" id="dv2-first-light-list"></div><button class="dv2-button" type="button" id="dv2-first-light-toggle">View all</button></div>' +
      "</div>" +
      '<div class="dv2-today-side">' +
      '<article class="dv2-featured" id="dv2-featured-carousel" aria-label="Featured Reads"></article>' +
      '<div class="dv2-time-strip" aria-label="Today temporal context">' +
      '<div class="dv2-time-strip__summary"><small id="dv2-context-time-kicker">Time · Varanasi / Banaras</small><strong id="dv2-context-time-status">Resolving today’s temporal context…</strong></div>' +
      '<div><small>Sunrise</small><strong id="dv2-context-sunrise">—</strong></div>' +
      '<div><small>Paksha</small><strong id="dv2-context-paksha">—</strong></div>' +
      '<div><small>Nakshatra</small><strong id="dv2-context-nakshatra">—</strong></div>' +
      '<div><small>Upcoming observance</small><strong id="dv2-context-observance">—</strong></div>' +
      '<a class="dv2-time-strip__link" href="#time">Panchang →</a>' +
      "</div>" +
      "</div></div></section>" +
      section(
        "read",
        "Read",
        "Featured Reads",
        '<p class="dv2-section-note">Selected public reads for context, continuity and deeper attention.</p><div class="dv2-read-grid"><article class="dv2-lead-read" id="dv2-lead-read"></article><div class="dv2-read-list" id="dv2-read-list"></div></div>',
        "dv2-read"
      ) +
      section(
        "explore",
        "Explore",
        "Public Knowledge Pathways",
        '<p class="dv2-section-note">Follow public themes across Drishvara’s published reads.</p><div class="dv2-explore-map"><div class="dv2-topic-cloud" id="dv2-topic-cloud"></div><div class="dv2-topic-list" id="dv2-topic-list"></div></div>',
        "dv2-explore"
      ) +
      section(
        "knowledge",
        "Knowledge",
        "Deep Knowledge",
        '<p class="dv2-section-note">Return paths for subjects that reward repeated reading.</p><div class="dv2-knowledge-grid"><div class="dv2-series-list" id="dv2-series-list"></div><div class="dv2-series-list" id="dv2-knowledge-list"></div></div>',
        "dv2-knowledge"
      ) +
      section(
        "time",
        "Time",
        "Today's Panchang",
        '<div class="dv2-time-layout"><div><p class="dv2-section-note" data-dv2-i18n="timeIntro">Daily Panchang, observance and annual calendar context.</p><div class="dv2-context-panel"><strong data-dv2-i18n="timeBasis">Current Panchang appears for the selected date and place.</strong><span data-dv2-i18n="timePrivacy">Date and location inputs are not stored by this public surface.</span></div><div class="dv2-language-toggle" aria-label="Time language"><button type="button" data-dv2-language-choice="en" aria-pressed="true">EN</button><button type="button" data-dv2-language-choice="hi" aria-pressed="false">हिंदी</button></div></div><div class="dv2-runtime-host" id="dv2-time-host"></div></div>',
        "dv2-time"
      ) +
      section(
        "reflect",
        "Reflect",
        "Your Star Reflection",
        '<div class="dv2-reflect-layout"><div><p class="dv2-section-note" data-dv2-i18n="reflectIntro">A governed reflection from your birth context.</p><div class="dv2-context-panel"><strong data-dv2-i18n="reflectBasis">The result hierarchy is reflection, inquiry, grounding, basis and limitation.</strong><span data-dv2-i18n="reflectPrivacy">Your birth inputs are used only to resolve this reflection and are not stored by Drishvara.</span></div><div class="dv2-language-toggle" aria-label="Reflect language"><button type="button" data-dv2-language-choice="en" aria-pressed="true">EN</button><button type="button" data-dv2-language-choice="hi" aria-pressed="false">हिंदी</button></div></div><div class="dv2-runtime-host" id="dv2-reflect-host"></div></div>',
        "dv2-reflect"
      ) +
      "</main>" +
      '<footer class="dv2-footer"><div class="dv2-footer__inner"><span>Drishvara © 2026 - Intelligence for today, knowledge for continuity, time for context.</span><span><a href="about.html">About</a> - <a href="contact.html">Contact</a> - <a href="login.html">Sign in</a></span></div></footer>';

    header.insertAdjacentElement("afterend", app);
    return app;
  }

  function quarantineLegacyShell() {
    var page = document.querySelector("body > .page");
    if (!page) return;
    page.setAttribute("data-drishvara-v2-legacy-shell", "true");
    page.setAttribute("aria-hidden", "true");
    page.hidden = true;
  }

  function moveRuntimeCards() {
    var panchang = document.getElementById("panchang-festival-card");
    var timeHost = document.getElementById("dv2-time-host");
    if (panchang && timeHost && !timeHost.contains(panchang)) {
      timeHost.appendChild(panchang);
    }

    var panel = document.querySelector('[data-ag71e-preview-panel="star-reflection"]');
    var starCard = panel ? panel.closest(".card") : null;
    var reflectHost = document.getElementById("dv2-reflect-host");
    if (starCard && reflectHost && !reflectHost.contains(starCard)) {
      reflectHost.appendChild(starCard);
      starCard.setAttribute("data-drishvara-v2-reflect-card", "true");
      var nameInput = document.getElementById("star-reflection-name");
      if (nameInput) {
        nameInput.value = "";
        nameInput.disabled = true;
        nameInput.setAttribute("aria-hidden", "true");
        nameInput.setAttribute("autocomplete", "off");
      }
      var heading = starCard.querySelector("h2");
      if (heading) heading.textContent = "Star Reflection";
    }
  }

  function firstPublicItems(data, indexData) {
    var fromHomepage =
      data && data.firstLight && Array.isArray(data.firstLight.items)
        ? data.firstLight.items
        : [];
    if (fromHomepage.length) return fromHomepage.slice(0, 7);

    return publicItems(indexData)
      .slice(0, 7)
      .map(function (item) {
        return {
          place: item.tag || "Drishvara",
          signal: item.title,
          note: item.summary
        };
      });
  }

  function publicStateLabel(index) {
    if (index === 0) return "Top Development";
    if (index < 3) return "In Focus";
    return "Tracking";
  }

  function readerFacingNote(value) {
    return String(value || "")
      .replace(/daily signal mix/gi, "today’s public context")
      .replace(/signals/gi, "developments")
      .replace(/signal/gi, "development")
      .replace(/These should remain visible near the top of the homepage\.?/gi, "")
      .trim();
  }

  function renderFirstLight(data, indexData) {
    var list = document.getElementById("dv2-first-light-list");
    var focus = document.getElementById("dv2-current-intelligence");
    if (!list) return;
    var items = firstPublicItems(data, indexData);
    if (!items.length) {
      list.innerHTML =
        '<div class="dv2-signal"><strong>Current public intelligence is preparing.</strong><span>Open Featured Reads for approved public articles.</span></div>';
      return;
    }

    if (focus) {
      focus.textContent = items[0].signal || "A public intelligence item is ready.";
    }

    var count = document.getElementById("dv2-first-light-count");
    if (count) {
      count.textContent =
        "First Light · " + items.length + " Key Development" + (items.length === 1 ? "" : "s");
    }

    list.innerHTML = items
      .map(function (item, index) {
        var state = publicStateLabel(index);
        return (
          '<article class="dv2-signal"><span><b>' +
          String(index + 1).padStart(2, "0") +
          "</b> " +
          escapeHtml((item.place || "Drishvara") + " - " + state) +
          "</span><strong>" +
          escapeHtml(item.signal || "Public item prepared for review") +
          "</strong><p>" +
          escapeHtml(readerFacingNote(item.note) || "Context will appear when public data is available.") +
          "</p></article>"
        );
      })
      .join("");

    var toggle = document.getElementById("dv2-first-light-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var expanded = list.getAttribute("data-expanded") === "true";
        list.setAttribute("data-expanded", expanded ? "false" : "true");
        toggle.textContent = expanded ? "View all" : "Show top 2";
      });
    }
  }

  function featuredItems(data, indexData) {
    var items =
      data && Array.isArray(data.featuredReads) && data.featuredReads.length
        ? data.featuredReads
        : publicItems(indexData);
    return items.slice(0, 6);
  }

  function renderFeatured(data, indexData) {
    var host = document.getElementById("dv2-featured-carousel");
    if (!host) return;
    var items = featuredItems(data, indexData);
    if (!items.length) {
      host.innerHTML =
        '<div class="dv2-featured__body"><p class="dv2-mini-label">Featured Reads</p><h3>Featured Reads are preparing.</h3><p>No public article was available in the index.</p></div>';
      return;
    }

    var index = 0;
    var auto = null;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function render() {
      var item = items[index];
      host.innerHTML =
        '<div class="dv2-featured__media"><img src="' +
        escapeHtml(safeImage(item)) +
        '" alt="' +
        escapeHtml(item.title || "Featured Drishvara read") +
        '" loading="lazy"></div>' +
        '<div class="dv2-featured__body"><p class="dv2-mini-label">' +
        escapeHtml(item.tag || "Featured Read") +
        "</p><h3><a class=\"dv2-card-link\" href=\"" +
        escapeHtml(articleHref(item)) +
        "\">" +
        escapeHtml(item.title || "Drishvara read") +
        "</a></h3><p>" +
        escapeHtml(item.summary || "A public Drishvara read.") +
        '</p><p class="dv2-mini-label">' +
        escapeHtml((item.source || "Public read") + " · " + (item.referenceState || item.reference_status || "References reviewed where available")) +
        '</p><div class="dv2-featured__controls"><button class="dv2-button" type="button" data-dv2-feature-prev>Previous</button><button class="dv2-button" type="button" data-dv2-feature-next>Next</button><span>' +
        (index + 1) +
        " / " +
        items.length +
        "</span></div></div>";
    }

    function go(next) {
      index = (next + items.length) % items.length;
      render();
    }

    function stopAuto() {
      if (auto) window.clearInterval(auto);
      auto = null;
    }

    function startAuto() {
      if (reduce || auto || items.length < 2) return;
      auto = window.setInterval(function () {
        go(index + 1);
      }, 8000);
    }

    host.addEventListener("click", function (event) {
      if (event.target.closest("[data-dv2-feature-prev]")) {
        stopAuto();
        go(index - 1);
      }
      if (event.target.closest("[data-dv2-feature-next]")) {
        stopAuto();
        go(index + 1);
      }
    });

    host.addEventListener("mouseenter", stopAuto);
    host.addEventListener("focusin", stopAuto);
    host.addEventListener("mouseleave", startAuto);

    var startX = null;
    host.addEventListener(
      "touchstart",
      function (event) {
        startX = event.touches && event.touches[0] ? event.touches[0].clientX : null;
      },
      { passive: true }
    );
    host.addEventListener(
      "touchend",
      function (event) {
        if (startX === null || !event.changedTouches || !event.changedTouches[0]) return;
        var delta = event.changedTouches[0].clientX - startX;
        if (Math.abs(delta) > 34) {
          stopAuto();
          go(delta < 0 ? index + 1 : index - 1);
        }
        startX = null;
      },
      { passive: true }
    );

    render();
    startAuto();
  }

  function renderRead(indexData) {
    var items = publicItems(indexData);
    var lead = document.getElementById("dv2-lead-read");
    var list = document.getElementById("dv2-read-list");
    if (!lead || !list || !items.length) return;

    var item = items[0];
    lead.innerHTML =
      '<img src="' +
      escapeHtml(safeImage(item)) +
      '" alt="' +
      escapeHtml(item.title || "Lead read") +
      '" loading="lazy"><p class="dv2-mini-label">' +
      escapeHtml(item.tag || "Lead Feature") +
      "</p><h3><a class=\"dv2-card-link\" href=\"" +
      escapeHtml(articleHref(item)) +
      "\">" +
      escapeHtml(item.title) +
      "</a></h3><p>" +
      escapeHtml(item.summary || "") +
      '</p><a class="dv2-text-link" href="' +
      escapeHtml(articleHref(item)) +
      '">Read feature</a>';

    list.innerHTML = items
      .slice(1, 7)
      .map(function (read) {
        return (
          '<a class="dv2-read-item" href="' +
          escapeHtml(articleHref(read)) +
          '"><span>' +
          escapeHtml(read.tag || "Read") +
          "</span><strong>" +
          escapeHtml(read.title || "Drishvara read") +
          "</strong><span>" +
          escapeHtml(read.summary || "Public article") +
          "</span></a>"
        );
      })
      .join("");
  }

  function topicEntries(indexData) {
    var items = publicItems(indexData);
    var grouped = Object.create(null);

    items.forEach(function (item) {
      var topic = String(item.tag || item.topic || "Read").trim() || "Read";
      if (!grouped[topic]) grouped[topic] = [];
      grouped[topic].push(item);
    });

    return Object.keys(grouped)
      .map(function (topic) {
        return [topic, grouped[topic]];
      })
      .sort(function (a, b) {
        return b[1].length - a[1].length || a[0].localeCompare(b[0]);
      });
  }

  function renderExplore(indexData) {
    var cloud = document.getElementById("dv2-topic-cloud");
    var list = document.getElementById("dv2-topic-list");
    if (!cloud || !list) return;
    var entries = topicEntries(indexData);

    cloud.innerHTML = entries
      .map(function (entry) {
        return (
          '<span class="dv2-topic-chip">' +
          escapeHtml(entry[0]) +
          " - " +
          entry[1].length +
          "</span>"
        );
      })
      .join("");

    list.innerHTML = entries
      .slice(0, 5)
      .map(function (entry) {
        var first = entry[1][0] || {};
        return (
          '<a class="dv2-topic-item" href="' +
          escapeHtml(articleHref(first)) +
          '"><strong>' +
          escapeHtml(entry[0]) +
          "</strong><span>" +
          escapeHtml(
            first.title
              ? "Start with: " + first.title
              : "Public articles will appear here when available."
          ) +
          "</span></a>"
        );
      })
      .join("");
  }

  function renderKnowledge(indexData) {
    var series = document.getElementById("dv2-series-list");
    var knowledge = document.getElementById("dv2-knowledge-list");
    if (!series || !knowledge) return;
    var entries = topicEntries(indexData).slice(0, 5);

    series.innerHTML = entries
      .map(function (entry) {
        var topic = entry[0];
        var count = entry[1].length;
        return (
          '<div class="dv2-series-item"><span>Continuity route</span><strong>' +
          escapeHtml(topic) +
          "</strong><span>" +
          count +
          " public reads available for return reading.</span></div>"
        );
      })
      .join("");

    knowledge.innerHTML = publicItems(indexData)
      .slice(0, 4)
      .map(function (item) {
        return (
          '<a class="dv2-series-item" href="' +
          escapeHtml(articleHref(item)) +
          '"><span>' +
          escapeHtml(item.tag || "Knowledge") +
          "</span><strong>" +
          escapeHtml(item.title || "Drishvara read") +
          "</strong><span>" +
          escapeHtml(item.summary || "") +
          "</span></a>"
        );
      })
      .join("");
  }

  var MONTHS_EN = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  var MONTHS_HI = [
    "जनवरी",
    "फ़रवरी",
    "मार्च",
    "अप्रैल",
    "मई",
    "जून",
    "जुलाई",
    "अगस्त",
    "सितंबर",
    "अक्टूबर",
    "नवंबर",
    "दिसंबर"
  ];

  var OBSERVANCE_FILTERS = [
    ["all", "All", "सभी"],
    ["ekadashi", "Ekadashi", "एकादशी"],
    ["purnima", "Purnima", "पूर्णिमा"],
    ["amavasya", "Amavasya", "अमावस्या"],
    ["trayodashi_pradosha", "Pradosha", "त्रयोदशी / प्रदोष"],
    ["sankashti_chaturthi", "Sankashti Chaturthi", "संकष्टी चतुर्थी"],
    ["vinayaka_chaturthi_monthly", "Vinayaka Chaturthi", "विनायक चतुर्थी"],
    ["masik_shivaratri", "Masik Shivaratri", "मासिक शिवरात्रि"]
  ];

  var VALUE_HI = {
    Sunday: "रविवार",
    Monday: "सोमवार",
    Tuesday: "मंगलवार",
    Wednesday: "बुधवार",
    Thursday: "गुरुवार",
    Friday: "शुक्रवार",
    Saturday: "शनिवार",
    Ravivara: "रविवार",
    Somavara: "सोमवार",
    Mangalavara: "मंगलवार",
    Budhavara: "बुधवार",
    Guruvara: "गुरुवार",
    Shukravara: "शुक्रवार",
    Shanivara: "शनिवार",
    "Krishna Paksha": "कृष्ण पक्ष",
    "Shukla Paksha": "शुक्ल पक्ष",
    Krishna: "कृष्ण",
    Shukla: "शुक्ल",
    Pratipada: "प्रतिपदा",
    Dwitiya: "द्वितीया",
    Tritiya: "तृतीया",
    Chaturthi: "चतुर्थी",
    Panchami: "पंचमी",
    Shashthi: "षष्ठी",
    Saptami: "सप्तमी",
    Ashtami: "अष्टमी",
    Navami: "नवमी",
    Dashami: "दशमी",
    Ekadashi: "एकादशी",
    Dwadashi: "द्वादशी",
    Trayodashi: "त्रयोदशी",
    Chaturdashi: "चतुर्दशी",
    Purnima: "पूर्णिमा",
    Amavasya: "अमावस्या",
    Ashwini: "अश्विनी",
    Bharani: "भरणी",
    Krittika: "कृत्तिका",
    Rohini: "रोहिणी",
    Mrigashirsha: "मृगशिरा",
    Ardra: "आर्द्रा",
    Punarvasu: "पुनर्वसु",
    Pushya: "पुष्य",
    Ashlesha: "आश्लेषा",
    Magha: "मघा",
    "Purva Phalguni": "पूर्व फाल्गुनी",
    "Uttara Phalguni": "उत्तर फाल्गुनी",
    Hasta: "हस्त",
    Chitra: "चित्रा",
    Swati: "स्वाति",
    Vishakha: "विशाखा",
    Anuradha: "अनुराधा",
    Jyeshtha: "ज्येष्ठा",
    Mula: "मूल",
    "Purva Ashadha": "पूर्वाषाढ़ा",
    "Uttara Ashadha": "उत्तराषाढ़ा",
    Shravana: "श्रवण",
    Dhanishta: "धनिष्ठा",
    Shatabhisha: "शतभिषा",
    "Purva Bhadrapada": "पूर्व भाद्रपदा",
    "Uttara Bhadrapada": "उत्तर भाद्रपदा",
    Revati: "रेवती",
    Chaitra: "चैत्र",
    Vaishakha: "वैशाख",
    Jyeshtha: "ज्येष्ठ",
    Ashadha: "आषाढ़",
    Shravana: "श्रावण",
    Bhadrapada: "भाद्रपद",
    Ashvina: "आश्विन",
    Kartika: "कार्तिक",
    Margashirsha: "मार्गशीर्ष",
    Pausha: "पौष",
    Magha: "माघ",
    Phalguna: "फाल्गुन",
    Regular: "नियमित",
    regular: "नियमित",
    Adhika: "अधिक",
    adhika: "अधिक",
    Kshaya: "क्षय",
    kshaya: "क्षय",
    "Varanasi / Banaras": "वाराणसी / बनारस",
    Itanagar: "ईटानगर",
    "New Delhi": "नई दिल्ली",
    Ranchi: "रांची",
    Tokyo: "टोक्यो",
    "Varanasi canonical basis": "वाराणसी प्रमाणित आधार",
    "Not available": "उपलब्ध नहीं",
    Calculating: "गणना जारी",
    Awaiting: "प्रतीक्षा"
  };

  var OBSERVANCE_NAME_HI = {
    amavasya: "अमावस्या",
    vinayaka_chaturthi_monthly: "विनायक चतुर्थी",
    ekadashi: "एकादशी",
    trayodashi_pradosha: "त्रयोदशी / प्रदोष",
    purnima: "पूर्णिमा",
    sankashti_chaturthi: "संकष्टी चतुर्थी",
    masik_shivaratri: "मासिक शिवरात्रि"
  };

  var RITUAL_LABEL_HI = {
    parana: "पारण",
    pradosha_puja: "प्रदोष पूजा",
    shivaratri_night: "शिवरात्रि रात्रि समय",
    sankashti_moonrise: "चंद्रोदय संदर्भ",
    moonrise: "चंद्रोदय",
    ritual_window: "अनुष्ठान समय"
  };

  var STAR_PLACE_LABEL_HI = {
    "varanasi-uttar-pradesh-india": "वाराणसी / बनारस",
    "itanagar-arunachal-pradesh-india": "ईटानगर",
    "new-delhi-delhi-india": "नई दिल्ली",
    "ranchi-jharkhand-india": "रांची",
    "tokyo-japan": "टोक्यो"
  };

  function languageData(lang) {
    return LANGUAGE[lang === "hi" ? "hi" : "en"];
  }

  function replaceKnownHindi(value) {
    var text = String(value || "");
    Object.keys(VALUE_HI)
      .sort(function (a, b) {
        return b.length - a.length;
      })
      .forEach(function (key) {
        text = text.replace(new RegExp("\\b" + key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "g"), VALUE_HI[key]);
      });
    return text;
  }

  function formatTimeOnly(value) {
    var text = String(value || "").trim();
    var match = text.match(/(?:T|\s)(\d{2}):(\d{2})(?::\d{2})?/);
    if (match) return match[1] + ":" + match[2];
    match = text.match(/\b(\d{1,2}):(\d{2})(?::\d{2})?\b/);
    return match ? match[1].padStart(2, "0") + ":" + match[2] : text;
  }

  function formatDate(iso, lang) {
    var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ""));
    if (!match) return String(iso || "");
    var date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
    return new Intl.DateTimeFormat(lang === "hi" ? "hi-IN" : "en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC"
    }).format(date);
  }

  function formatWeekday(iso, lang) {
    var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ""));
    if (!match) return "";
    var date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
    return new Intl.DateTimeFormat(lang === "hi" ? "hi-IN" : "en-IN", {
      weekday: "long",
      timeZone: "UTC"
    }).format(date);
  }

  function formatDateTime(value, lang) {
    var text = String(value || "").trim();
    if (!text) return languageData(lang).unavailable;
    var match = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:T|\s)(\d{2}):(\d{2})/);
    if (!match) return lang === "hi" ? replaceKnownHindi(text) : text;
    return formatDate(match[1] + "-" + match[2] + "-" + match[3], lang) + ", " + match[4] + ":" + match[5];
  }

  function localizeValue(value, lang) {
    var text = String(value || "").trim();
    if (!text) return languageData(lang).unavailable;
    if (/Calculating|Awaiting|Loading/i.test(text)) return languageData(lang).loading;
    if (/Not available/i.test(text)) return languageData(lang).unavailable;
    return lang === "hi" ? replaceKnownHindi(text) : text;
  }

  function getPanchangLocationLabel() {
    var alias = document.getElementById("panchang-place-alias");
    if (alias && alias.value.trim()) return alias.value.trim();
    var select = document.getElementById("panchang-place-select");
    if (select && select.selectedOptions && select.selectedOptions[0]) {
      return select.selectedOptions[0].textContent.trim();
    }
    var basis = document.getElementById("panchang-moonrise");
    return basis && basis.textContent.trim()
      ? basis.textContent.trim().split("·")[0].trim()
      : "Varanasi / Banaras";
  }

  function getPanchangDateLabel(lang) {
    var picker = document.getElementById("panchang-date-picker");
    if (picker && picker.value) return formatDate(picker.value, lang);
    var label = document.getElementById("panchang-selected-date-label");
    return label && label.textContent.trim()
      ? localizeValue(label.textContent.trim(), lang)
      : languageData(lang).today;
  }

  function readerItem(id, label, emphasis) {
    return (
      '<div class="dv2-panchang-reader__item" data-dv2-reader-item="' +
      id +
      '"' +
      (emphasis ? ' data-emphasis="true"' : "") +
      "><span></span><strong></strong></div>"
    );
  }

  function ensurePanchangReaderPanel() {
    var result = document.querySelector('[data-ag74o-daily-result-surface="true"]');
    if (!result) return null;
    var existing = document.getElementById("dv2-panchang-reader-panel");
    if (existing) return existing;
    var panel = document.createElement("section");
    panel.id = "dv2-panchang-reader-panel";
    panel.className = "dv2-panchang-reader";
    panel.setAttribute("aria-labelledby", "dv2-panchang-reader-heading");
    panel.innerHTML =
      '<div class="dv2-panchang-reader__head"><h3 id="dv2-panchang-reader-heading"></h3><p class="dv2-panchang-reader__meta" id="dv2-panchang-reader-meta"></p></div>' +
      '<div class="dv2-panchang-reader__grid">' +
      readerItem("sunrise", "Sunrise", true) +
      readerItem("sunset", "Sunset", true) +
      readerItem("tithi", "Tithi", false) +
      readerItem("nakshatra", "Nakshatra", false) +
      readerItem("yoga", "Yoga", false) +
      readerItem("karana", "Karana", false) +
      readerItem("paksha", "Paksha", false) +
      readerItem("vara", "Vara", false) +
      readerItem("currentObservance", "Current Observance", false) +
      readerItem("upcomingObservance", "Upcoming Observance", false) +
      "</div>";
    result.insertAdjacentElement("beforebegin", panel);
    return panel;
  }

  function setReaderItem(key, label, value) {
    var item = document.querySelector('[data-dv2-reader-item="' + key + '"]');
    if (!item) return;
    var labelNode = item.querySelector("span");
    var valueNode = item.querySelector("strong");
    if (labelNode) labelNode.textContent = label;
    if (valueNode) valueNode.textContent = value;
  }

  function syncPanchangReaderPanel(lang) {
    var panel = ensurePanchangReaderPanel();
    if (!panel) return;
    var d = languageData(lang);
    var heading = document.getElementById("dv2-panchang-reader-heading");
    var meta = document.getElementById("dv2-panchang-reader-meta");
    var location = localizeValue(getPanchangLocationLabel(), lang);
    var date = getPanchangDateLabel(lang);
    if (heading) heading.textContent = d.todaysPanchang;
    if (meta) meta.textContent = location + " · " + date;
    var sunriseText = document.getElementById("panchang-sunrise")?.textContent || d.loading;
    var sunsetText = document.getElementById("panchang-sunset")?.textContent || d.loading;
    setReaderItem("sunrise", d.sunrise, /Calculating|Awaiting|Loading/i.test(sunriseText) ? d.loading : formatTimeOnly(sunriseText));
    setReaderItem("sunset", d.sunset, /Calculating|Awaiting|Loading/i.test(sunsetText) ? d.loading : formatTimeOnly(sunsetText));
    setReaderItem("tithi", d.tithi, localizeValue(document.getElementById("panchang-tithi")?.textContent, lang));
    setReaderItem("nakshatra", d.nakshatra, localizeValue(document.getElementById("panchang-nakshatra")?.textContent, lang));
    setReaderItem("yoga", d.yoga, localizeValue(document.getElementById("panchang-yoga")?.textContent, lang));
    setReaderItem("karana", d.karana, localizeValue(document.getElementById("panchang-karana")?.textContent, lang));
    setReaderItem("paksha", d.paksha, localizeValue(document.getElementById("panchang-paksha")?.textContent, lang));
    setReaderItem("vara", d.vara, localizeValue(document.getElementById("panchang-vara")?.textContent, lang));
    var observanceName = localizeValue(document.getElementById("upcoming-observance-name")?.textContent, lang);
    setReaderItem("currentObservance", d.currentObservance, observanceName);
    setReaderItem("upcomingObservance", d.upcomingObservance, observanceName);
  }

  function ensurePanchangDetailDisclosures() {
    var result = document.querySelector('[data-ag74o-daily-result-surface="true"]');
    if (!result) return;
    var timings = document.getElementById("dv2-panchang-detailed-timings");
    if (!timings) {
      timings = document.createElement("details");
      timings.id = "dv2-panchang-detailed-timings";
      timings.className = "dv2-methodology dv2-detailed-timings";
      timings.innerHTML =
        '<summary></summary><div class="mini-table" id="dv2-panchang-detailed-timing-rows"></div>';
      result.insertAdjacentElement("afterend", timings);
    }
    var timingRows = document.getElementById("dv2-panchang-detailed-timing-rows");
    if (timingRows) {
      [
        "panchang-tithi-transition",
        "panchang-nakshatra-transition",
        "panchang-yoga-transition",
        "panchang-karana-transition"
      ].forEach(function (id) {
        var value = document.getElementById(id);
        var row = value ? value.closest(".mini-row") : null;
        if (row && !timingRows.contains(row)) timingRows.appendChild(row);
      });
    }
  }

  function renderYearOverview(lang) {
    var grid = document.getElementById("dv2-year-glance-grid");
    if (!grid || !yearOverviewMonths.length) return;
    grid.innerHTML = yearOverviewMonths
      .map(function (month) {
        var kind = lang === "hi" ? localizeValue(month.kind, lang) : month.kind;
        var name = lang === "hi" ? localizeValue(month.name, lang) : month.name;
        return (
          '<div class="dv2-year-month"><strong>' +
          escapeHtml(name + " · " + kind) +
          "</strong><span>" +
          escapeHtml(formatDate(month.start, lang) + " – " + formatDate(month.end, lang)) +
          "</span></div>"
        );
      })
      .join("");
  }

  function filterLabel(key, lang) {
    var found = OBSERVANCE_FILTERS.find(function (item) {
      return item[0] === key;
    });
    if (!found) return key;
    return lang === "hi" ? found[2] : found[1];
  }

  function approvedObservanceRecords(projection) {
    var records = projection && Array.isArray(projection.records) ? projection.records : [];
    return records
      .filter(function (record) {
        return (
          record &&
          record.final_observance_date_approved === true &&
          record.public_output_allowed === true &&
          record.civil_date &&
          record.primary_public_window
        );
      })
      .sort(function (a, b) {
        return String(a.civil_date).localeCompare(String(b.civil_date));
    });
  }

  function observanceRecordId(record) {
    return String(
      (record && (record.activation_record_id || record.event_id || record.candidate_id)) ||
        [record && record.civil_date, record && record.observance_key].filter(Boolean).join("-")
    );
  }

  function observanceMonthKey(record) {
    var match = /^(\d{4}-\d{2})-\d{2}$/.exec(String(record && record.civil_date || ""));
    return match ? match[1] : "";
  }

  function observanceMonthIndex(monthKey) {
    var monthPart = String(monthKey || "").slice(-2);
    var index = Number(monthPart) - 1;
    return index >= 0 && index < 12 ? index : 0;
  }

  function observanceDay(record) {
    var match = /^\d{4}-\d{2}-(\d{2})$/.exec(String(record && record.civil_date || ""));
    return match ? match[1] : "";
  }

  function filteredObservanceRecords() {
    if (!observanceRecords) return [];
    return observanceFilter === "all"
      ? observanceRecords
      : observanceRecords.filter(function (record) {
        return record.observance_key === observanceFilter;
      });
  }

  function groupObservancesByMonth(records) {
    var byMonth = {};
    records.forEach(function (record) {
      var key = observanceMonthKey(record);
      if (!key) return;
      if (!byMonth[key]) byMonth[key] = [];
      byMonth[key].push(record);
    });
    return Object.keys(byMonth).sort().map(function (key) {
      var items = byMonth[key];
      items.sort(function (a, b) {
        return String(a.civil_date).localeCompare(String(b.civil_date));
      });
      return {
        key: key,
        records: items
      };
    });
  }

  function selectedPanchangMonthKey(recordsByMonth) {
    var picker = document.getElementById("panchang-date-picker");
    var selected = picker && /^(\d{4}-\d{2})-\d{2}$/.exec(String(picker.value || ""));
    if (!selected) return "";
    var key = selected[1];
    var month = recordsByMonth.find(function (item) {
      return item.key === key && item.records.length;
    });
    return month ? key : "";
  }

  function ensureSelectedObservanceMonth(recordsByMonth) {
    var current = recordsByMonth.find(function (item) {
      return item.key === selectedObservanceMonth && item.records.length;
    });
    if (current) return current.key;
    selectedObservanceMonth =
      selectedPanchangMonthKey(recordsByMonth) ||
      (recordsByMonth.find(function (item) { return item.records.length; }) || {}).key ||
      "";
    selectedObservanceRecordId = "";
    return selectedObservanceMonth;
  }

  function selectedMonthRecord(recordsByMonth) {
    return recordsByMonth.find(function (item) {
      return item.key === selectedObservanceMonth;
    }) || { key: selectedObservanceMonth, records: [] };
  }

  function monthYears(records) {
    var years = [];
    records.forEach(function (record) {
      var year = String(record.civil_date || "").slice(0, 4);
      if (year && years.indexOf(year) === -1) years.push(year);
    });
    return years.join(" / ");
  }

  function monthLabel(monthKey, records, lang) {
    var index = observanceMonthIndex(monthKey);
    var name = (lang === "hi" ? MONTHS_HI : MONTHS_EN)[index];
    var years = monthYears(records) || String(monthKey || "").slice(0, 4);
    return years ? name + " · " + years : name;
  }

  function observanceTimingText(windowData, lang) {
    if (!windowData || (!windowData.start_local && !windowData.end_local)) return languageData(lang).unavailable;
    if (windowData.start_local && windowData.end_local) {
      return formatDateTime(windowData.start_local, lang) + " – " + formatDateTime(windowData.end_local, lang);
    }
    return formatDateTime(windowData.start_local || windowData.end_local, lang);
  }

  function observanceFamily(record, lang) {
    return filterLabel(record && record.observance_key, lang);
  }

  function observanceTraditionalBasis(record, lang) {
    var d = languageData(lang);
    var month = record && record.lunar_month || {};
    var tithi = record && record.tithi && record.tithi.name ? record.tithi.name : "";
    var parts = [
      month.canonical_name ? localizeValue(month.canonical_name, lang) : "",
      month.instance_kind && month.instance_kind !== "regular" ? localizeValue(month.instance_kind, lang) : "",
      localizeValue(record && record.paksha || "", lang),
      localizeValue(tithi, lang)
    ].filter(Boolean);
    return parts.length ? parts.join(" · ") : d.calendarBasis;
  }

  function recordByObservanceId(records, id) {
    return records.find(function (record) {
      return observanceRecordId(record) === id;
    }) || null;
  }

  function paranaConclusion(record, lang) {
    var d = languageData(lang);
    var rituals = Array.isArray(record && record.ritual_windows) ? record.ritual_windows : [];
    var governed = rituals.find(function (ritual) {
      var key = String(ritual && (ritual.ritual_key || ritual.semantic_layer || ""));
      return /parana|conclusion|vrat/i.test(key);
    });
    if (governed) {
      return {
        label: /parana/i.test(String(governed.ritual_key || governed.semantic_layer || "")) ? d.parana : d.conclusion,
        value: observanceTimingText(governed, lang),
        state: "governed"
      };
    }
    var status = String(record && record.ritual_window_status || "");
    if (/parana|conclusion|vrat/i.test(status)) {
      return { label: d.paranaConclusion, value: d.noSeparatelyGovernedTimingAvailable, state: "missing" };
    }
    return { label: d.paranaConclusion, value: d.notApplicable, state: "not-applicable" };
  }

  function additionalRitualWindows(record) {
    return (Array.isArray(record && record.ritual_windows) ? record.ritual_windows : []).filter(function (ritual) {
      var key = String(ritual && (ritual.ritual_key || ritual.semantic_layer || ""));
      return !/parana|conclusion|vrat/i.test(key);
    });
  }

  function renderObservanceFilters(lang) {
    var filters = document.getElementById("dv2-observance-filters");
    if (!filters) return;
    var records = observanceRecords || [];
    filters.innerHTML = OBSERVANCE_FILTERS.filter(function (item) {
      return item[0] === "all" || records.some(function (record) {
        return record.observance_key === item[0];
      });
    }).map(function (item) {
      var count = item[0] === "all"
        ? records.length
        : records.filter(function (record) { return record.observance_key === item[0]; }).length;
      return (
        '<button type="button" data-dv2-observance-filter="' +
        escapeHtml(item[0]) +
        '" aria-pressed="' +
        (observanceFilter === item[0] ? "true" : "false") +
        '">' +
        escapeHtml((lang === "hi" ? item[2] : item[1]) + (records.length ? " · " + count : "")) +
        "</button>"
      );
    }).join("");
  }

  function renderObservanceViewToggle(lang) {
    var d = languageData(lang);
    var toggle = document.getElementById("dv2-observance-view-toggle");
    if (!toggle) return;
    toggle.setAttribute("aria-label", d.observanceView);
    toggle.innerHTML =
      '<button type="button" data-dv2-observance-view="calendar" aria-pressed="' +
      (observanceViewMode === "calendar" ? "true" : "false") +
      '">' +
      escapeHtml(d.calendarView) +
      "</button>" +
      '<button type="button" data-dv2-observance-view="list" aria-pressed="' +
      (observanceViewMode === "list" ? "true" : "false") +
      '">' +
      escapeHtml(d.fullList) +
      "</button>";
  }

  function observanceDisplayName(record, lang) {
    if (lang === "hi") {
      return OBSERVANCE_NAME_HI[record.observance_key] || localizeValue(record.display_name, lang);
    }
    return record.display_name || filterLabel(record.observance_key, lang);
  }

  function ritualLabel(ritual, lang) {
    var key = String(ritual && (ritual.ritual_key || ritual.semantic_layer) || "ritual_window");
    if (lang === "hi") return RITUAL_LABEL_HI[key] || languageData(lang).ritualWindow;
    return key === "parana"
      ? "Parana"
      : key === "pradosha_puja"
        ? "Pradosha Puja"
        : key === "shivaratri_night"
          ? "Shivaratri Night"
          : "Ritual Window";
  }

  function renderObservanceEventButton(record, lang) {
    var id = observanceRecordId(record);
    var active = selectedObservanceRecordId === id;
    return (
      '<button type="button" class="dv2-observance-event-button" data-dv2-observance-detail="' +
      escapeHtml(id) +
      '" aria-expanded="' +
      (active ? "true" : "false") +
      '">' +
      '<span class="dv2-observance-event-date">' +
      escapeHtml(formatDate(record.civil_date, lang)) +
      "<small>" +
      escapeHtml(formatWeekday(record.civil_date, lang)) +
      "</small></span>" +
      '<span class="dv2-observance-event-main"><strong>' +
      escapeHtml(observanceDisplayName(record, lang)) +
      "</strong><small>" +
      escapeHtml(observanceFamily(record, lang)) +
      " · " +
      escapeHtml(observanceTraditionalBasis(record, lang)) +
      "</small></span></button>"
    );
  }

  function renderObservanceDetail(records, lang) {
    var record = recordByObservanceId(records, selectedObservanceRecordId);
    if (!record) return "";
    var d = languageData(lang);
    var windowData = record.primary_public_window || {};
    var parana = paranaConclusion(record, lang);
    var additional = additionalRitualWindows(record);
    var additionalMarkup = additional.length
      ? additional
      .map(function (ritual) {
        return (
          '<div><dt>' +
          escapeHtml(ritualLabel(ritual, lang)) +
          "</dt><dd>" +
          escapeHtml(observanceTimingText(ritual, lang)) +
          "</dd></div>"
        );
      })
        .join("")
      : '<div><dt>' + escapeHtml(d.additionalRitualTimings) + "</dt><dd>" + escapeHtml(d.notApplicable) + "</dd></div>";
    var location = record.location_basis || {};
    var rule = record.rule_basis || {};
    return (
      '<article class="dv2-observance-detail" id="dv2-observance-detail" tabindex="-1">' +
      '<div class="dv2-observance-detail__head"><div><p class="dv2-section-note">' +
      escapeHtml(formatDate(record.civil_date, lang) + " · " + formatWeekday(record.civil_date, lang)) +
      "</p><h6>" +
      escapeHtml(observanceDisplayName(record, lang)) +
      "</h6></div>" +
      '<button type="button" data-dv2-observance-close-detail="true">' +
      escapeHtml(d.closeDetails) +
      "</button></div>" +
      '<p class="dv2-observance-detail__basis">' +
      escapeHtml(observanceFamily(record, lang) + " · " + observanceTraditionalBasis(record, lang)) +
      "</p>" +
      '<dl class="dv2-observance-window">' +
      "<div><dt>" +
      escapeHtml(d.begins) +
      "</dt><dd>" +
      escapeHtml(formatDateTime(windowData.start_local, lang)) +
      "</dd></div><div><dt>" +
      escapeHtml(d.ends) +
      "</dt><dd>" +
      escapeHtml(formatDateTime(windowData.end_local, lang)) +
      "</dd></div><div><dt>" +
      escapeHtml(parana.label) +
      "</dt><dd>" +
      escapeHtml(parana.value) +
      "</dd></div>" +
      additionalMarkup +
      "<div><dt>" +
      escapeHtml(d.locationBasis) +
      "</dt><dd>" +
      escapeHtml([location.display_label, location.timezone].filter(Boolean).join(" · ") || d.varanasiBasis) +
      "</dd></div><div><dt>" +
      escapeHtml(d.ruleSourceBasis) +
      "</dt><dd>" +
      escapeHtml([rule.scope_limitation || rule.rule_id, rule.source_reference].filter(Boolean).join(" · ") || d.calendarBasis) +
      "</dd></div></dl></article>"
    );
  }

  function renderObservanceCalendar(records, recordsByMonth, lang) {
    var d = languageData(lang);
    var selected = selectedMonthRecord(recordsByMonth);
    var monthKeysWithRecords = recordsByMonth.filter(function (month) {
      return month.records.length;
    }).map(function (month) {
      return month.key;
    });
    var selectedIndex = monthKeysWithRecords.indexOf(selected.key);
    var previousKey = selectedIndex > 0 ? monthKeysWithRecords[selectedIndex - 1] : "";
    var nextKey = selectedIndex >= 0 && selectedIndex < monthKeysWithRecords.length - 1
      ? monthKeysWithRecords[selectedIndex + 1]
      : "";
    var grid = recordsByMonth
      .map(function (month) {
        var preview = month.records.slice(0, 3).map(function (record) {
          return (
            '<li><span>' +
            escapeHtml(observanceDay(record)) +
            "</span>" +
            escapeHtml(observanceDisplayName(record, lang)) +
            "</li>"
          );
        }).join("");
        var more = month.records.length > 3
          ? '<p class="dv2-observance-more">+' + escapeHtml(String(month.records.length - 3)) + " " + escapeHtml(d.more) + "</p>"
          : "";
        return (
          '<article class="dv2-observance-month-card" data-selected="' +
          (month.key === selectedObservanceMonth ? "true" : "false") +
          '">' +
          '<div class="dv2-observance-month-card__top"><h5>' +
          escapeHtml(monthLabel(month.key, month.records, lang)) +
          "</h5><span>" +
          escapeHtml(String(month.records.length) + " " + d.observances) +
          "</span></div>" +
          (month.records.length
            ? '<ol class="dv2-observance-card-preview">' + preview + "</ol>" + more +
              '<button type="button" data-dv2-observance-month="' + escapeHtml(month.key) + '">' +
              escapeHtml(d.viewMonth) +
              " →</button>"
            : '<p class="dv2-section-note">' + escapeHtml(d.emptyObservanceMonth) + "</p>") +
          "</article>"
        );
      })
      .join("");
    var selectedRows = selected.records.length
      ? selected.records.map(function (record) { return renderObservanceEventButton(record, lang); }).join("")
      : '<p class="dv2-section-note">' + escapeHtml(d.emptyObservanceMonth) + "</p>";
    return (
      '<div class="dv2-observance-calendar" data-dv2-observance-calendar="true">' +
      grid +
      "</div>" +
      '<section class="dv2-observance-selected-month" aria-labelledby="dv2-observance-selected-title">' +
      '<div class="dv2-observance-selected-month__head"><div><p class="dv2-section-note">' +
      escapeHtml(d.selectedMonth) +
      "</p><h5 id=\"dv2-observance-selected-title\">" +
      escapeHtml(monthLabel(selected.key || "01", selected.records, lang)) +
      "</h5></div><div class=\"dv2-observance-month-nav\">" +
      '<button type="button" data-dv2-observance-shift="' +
      escapeHtml(previousKey) +
      '"' +
      (!previousKey ? " disabled" : "") +
      ">" +
      escapeHtml(d.previousMonth) +
      "</button>" +
      '<button type="button" data-dv2-observance-shift="' +
      escapeHtml(nextKey) +
      '"' +
      (!nextKey ? " disabled" : "") +
      ">" +
      escapeHtml(d.nextMonth) +
      "</button></div></div>" +
      '<div class="dv2-observance-event-list">' +
      selectedRows +
      "</div>" +
      renderObservanceDetail(records, lang) +
      "</section>"
    );
  }

  function renderObservanceFullList(records, lang) {
    var d = languageData(lang);
    var rows = records.length
      ? records.map(function (record) { return renderObservanceEventButton(record, lang); }).join("")
      : '<p class="dv2-section-note">' + escapeHtml(d.emptyObservanceMonth) + "</p>";
    return (
      '<section class="dv2-observance-full-list" aria-label="' +
      escapeHtml(d.fullList) +
      '">' +
      '<div class="dv2-observance-selected-month__head"><div><p class="dv2-section-note">' +
      escapeHtml(d.fullList) +
      "</p><h5>" +
      escapeHtml(String(records.length) + " " + d.governedRecords) +
      "</h5></div><button type=\"button\" data-dv2-observance-back-to-year=\"true\">" +
      escapeHtml(d.backToYear) +
      "</button></div>" +
      '<div class="dv2-observance-event-list">' +
      rows +
      "</div>" +
      renderObservanceDetail(records, lang) +
      "</section>"
    );
  }

  function renderObservanceYear(lang) {
    var panel = document.getElementById("dv2-observance-year");
    if (!panel) return;
    var d = languageData(lang);
    var title = document.getElementById("dv2-observance-title");
    var desc = document.getElementById("dv2-observance-desc");
    var status = document.getElementById("dv2-observance-status");
    var months = document.getElementById("dv2-observance-months");
    if (title) title.textContent = d.observanceYear;
    if (desc) desc.textContent = d.observanceDescription;
    renderObservanceViewToggle(lang);
    renderObservanceFilters(lang);
    if (!months) return;
    if (!observanceRecords) {
      if (status) status.textContent = d.loadingObservances;
      months.innerHTML = '<p class="dv2-section-note">' + escapeHtml(d.loadingObservances) + "</p>";
      return;
    }
    var visible = filteredObservanceRecords();
    if (status) {
      status.textContent =
        String(visible.length) +
        " / " +
        String(observanceRecords.length) +
        " " +
        d.governedRecords +
        " · " +
        d.varanasiBasis;
    }
    var byMonth = groupObservancesByMonth(visible);
    ensureSelectedObservanceMonth(byMonth);
    if (selectedObservanceRecordId && !recordByObservanceId(visible, selectedObservanceRecordId)) {
      selectedObservanceRecordId = "";
    }
    months.innerHTML = observanceViewMode === "list"
      ? renderObservanceFullList(visible, lang)
      : renderObservanceCalendar(visible, byMonth, lang);
  }

  function addObservanceYear() {
    var book = document.querySelector('[data-ag74i-varanasi-calendar-book="true"]');
    if (!book || document.getElementById("dv2-observance-year")) return;
    var panel = document.createElement("section");
    panel.id = "dv2-observance-year";
    panel.className = "dv2-observance-year";
    panel.setAttribute("aria-labelledby", "dv2-observance-title");
    panel.innerHTML =
      '<div class="dv2-observance-year__head"><h4 id="dv2-observance-title"></h4><p class="dv2-section-note" id="dv2-observance-desc"></p><p class="dv2-section-note" id="dv2-observance-status" aria-live="polite"></p></div>' +
      '<div class="dv2-observance-year__view-toggle" id="dv2-observance-view-toggle" aria-label="Observance view"></div>' +
      '<div class="dv2-observance-year__filters" id="dv2-observance-filters" aria-label="Observance family filters"></div>' +
      '<div class="dv2-observance-year__months" id="dv2-observance-months"></div>';
    book.insertAdjacentElement("afterend", panel);
    panel.addEventListener("click", function (event) {
      var filterButton = event.target.closest("[data-dv2-observance-filter]");
      var viewButton = event.target.closest("[data-dv2-observance-view]");
      var monthButton = event.target.closest("[data-dv2-observance-month]");
      var shiftButton = event.target.closest("[data-dv2-observance-shift]");
      var detailButton = event.target.closest("[data-dv2-observance-detail]");
      var closeButton = event.target.closest("[data-dv2-observance-close-detail]");
      var backButton = event.target.closest("[data-dv2-observance-back-to-year]");
      if (filterButton && panel.contains(filterButton)) {
        observanceFilter = filterButton.getAttribute("data-dv2-observance-filter") || "all";
        selectedObservanceMonth = "";
        selectedObservanceRecordId = "";
      } else if (viewButton && panel.contains(viewButton)) {
        observanceViewMode = viewButton.getAttribute("data-dv2-observance-view") === "list" ? "list" : "calendar";
        selectedObservanceRecordId = "";
      } else if (monthButton && panel.contains(monthButton)) {
        selectedObservanceMonth = monthButton.getAttribute("data-dv2-observance-month") || selectedObservanceMonth;
        selectedObservanceRecordId = "";
      } else if (shiftButton && panel.contains(shiftButton)) {
        var targetMonth = shiftButton.getAttribute("data-dv2-observance-shift") || "";
        if (!targetMonth) return;
        selectedObservanceMonth = targetMonth;
        selectedObservanceRecordId = "";
      } else if (detailButton && panel.contains(detailButton)) {
        selectedObservanceRecordId = detailButton.getAttribute("data-dv2-observance-detail") || "";
      } else if (closeButton && panel.contains(closeButton)) {
        selectedObservanceRecordId = "";
      } else if (backButton && panel.contains(backButton)) {
        observanceViewMode = "calendar";
        selectedObservanceRecordId = "";
      } else {
        return;
      }
      renderObservanceYear(currentTimeLanguage);
      if (detailButton) {
        window.requestAnimationFrame(function () {
          var detail = document.getElementById("dv2-observance-detail");
          if (detail) detail.focus({ preventScroll: true });
        });
      }
    });
    panel.addEventListener("keydown", function (event) {
      if (event.key !== "Escape" || !selectedObservanceRecordId) return;
      selectedObservanceRecordId = "";
      renderObservanceYear(currentTimeLanguage);
    });
    renderObservanceYear(currentTimeLanguage);
    fetchJson(OBSERVANCE_PROJECTION_PATH).then(function (projection) {
      observanceRecords = approvedObservanceRecords(projection);
      renderObservanceYear(currentTimeLanguage);
    });
  }

  function addYearAtGlance() {
    var nav = document.querySelector(".ag74i-book-navigation");
    if (!nav || document.getElementById("dv2-year-glance-button")) return;

    var button = document.createElement("button");
    button.type = "button";
    button.id = "dv2-year-glance-button";
    button.textContent = "Hindu Year Overview";
    nav.insertBefore(button, nav.firstChild);

    var panel = document.createElement("section");
    panel.className = "dv2-year-glance";
    panel.id = "dv2-year-glance";
    panel.setAttribute("aria-label", "Hindu Year Overview");
    panel.innerHTML =
      '<h4 id="dv2-year-glance-title">Hindu Year Overview</h4><p class="dv2-section-note" id="dv2-year-glance-note">Lunar-month overview from the governed Varanasi annual book.</p><div class="dv2-year-glance__grid" id="dv2-year-glance-grid"></div>';
    nav.insertAdjacentElement("afterend", panel);

    fetchJson(
      "data/knowledge-base/panchang-festival/production/ag74n-varanasi-samvat-2083-annual-calendar.json"
    ).then(function (calendar) {
      var grid = document.getElementById("dv2-year-glance-grid");
      if (!grid || !calendar || !calendar.annual_book || !Array.isArray(calendar.annual_book.pages)) return;
      var months = [];
      calendar.annual_book.pages.forEach(function (page) {
        (page.slots || []).forEach(function (slot) {
          (slot.instances || []).forEach(function (instance) {
            months.push({
              name: slot.canonical_name,
              kind: instance.instance_kind || "regular",
              start: instance.start_civil_date,
              end: instance.end_civil_date
            });
          });
        });
      });
      yearOverviewMonths = months;
      renderYearOverview(currentTimeLanguage);
    });

    button.addEventListener("click", function () {
      var open = panel.getAttribute("data-open") === "true";
      panel.setAttribute("data-open", open ? "false" : "true");
      button.setAttribute("aria-current", open ? "false" : "page");
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("[data-ag74i-book-page-button]")) {
        panel.setAttribute("data-open", "false");
        button.removeAttribute("aria-current");
      }
    });
  }

  var LANGUAGE = {
    en: {
      timeKicker: "Time",
      timeTitle: "Today's Panchang",
      panchangViewLabel: "Panchang & Festival View",
      todaysPanchang: "Today's Panchang",
      panchangIntro: "Select a date and approved place to view the current Panchang. The annual festival calendar below remains on the canonical Varanasi basis.",
      panchangDate: "Panchang date",
      previousDay: "Previous Day",
      today: "Today",
      nextDay: "Next Day",
      date: "Date (DD/MM/YYYY)",
      datePicker: "Date picker",
      chooseDate: "Choose a date",
      selectedCivilDate: "Selected civil date",
      selectLocation: "Search city or place",
      selectLocationMode: "Select Location",
      choosePanchangLocation: "Choose Panchang Location",
      approvedPlaceAlias: "Approved place or alias",
      placeAliasPlaceholder: "e.g. Kashi or Tokyo",
      coordinates: "Enter Coordinates",
      latitude: "Latitude",
      longitude: "Longitude",
      timezone: "Timezone",
      optionalLocation: "Optional Location Label",
      panchangCoordinateNote: "Coordinate-first calculation requires latitude, longitude and a supplied valid IANA timezone. Drishvara does not reverse-geocode or store these inputs.",
      panchangSearchForward: "Use the governed dropdown or enter an approved alias such as Kashi, Banaras, Varanasi, Itanagar, New Delhi, Ranchi or Tokyo.",
      panchangPlaceNote: "Curated locations use governed coordinates and timezones. Approved aliases resolve exactly; fuzzy or nearest-place matching is not used.",
      calculatePanchang: "Calculate Panchang",
      requestReady: "Review the inputs, then press Calculate Panchang. Changing inputs will not replace the last committed result.",
      publicReleasePrefix: "AG74P public release:",
      publicReleaseText: "5 approved named locations · worldwide coordinates with validated IANA timezone · 384 Varanasi annual records · 114 generic monthly observances.",
      locationBasis: "Location basis",
      coordinateBasis: "Coordinate basis",
      timezoneBasis: "Timezone basis",
      approvalBasis: "Approval basis",
      calendarBasis: "Calendar basis",
      howDetermined: "How this was determined",
      detailedTimings: "Detailed timings",
      loading: "Loading",
      loadingObservances: "Loading governed observances.",
      unavailable: "Not available",
      sunrise: "Sunrise",
      sunset: "Sunset",
      tithi: "Tithi",
      nakshatra: "Nakshatra",
      yoga: "Yoga",
      karana: "Karana",
      paksha: "Paksha",
      vara: "Vara",
      currentObservance: "Current / Upcoming Observance",
      upcomingObservance: "Upcoming Observance",
      noGovernedObservance: "No governed observance result is available for this selection yet.",
      observanceTimingNote: "Festival timing appears only when a uniquely matched record has explicit public-display approval or the completed calculation engine is available.",
      begins: "Begins",
      ends: "Ends",
      ritualWindows: "Ritual windows",
      ritualWindow: "Ritual Window",
      annualObservanceBook: "Annual observance book",
      annualCalendar: "Annual Hindu Festival Calendar",
      yearAtGlance: "Hindu Year Overview",
      yearOverviewNote: "Lunar-month overview from the governed Varanasi annual book.",
      bookLoading: "Loading the governed Varanasi annual book…",
      bookStructureLoading: "Loading annual-book structure…",
      observanceYear: "Festival & Observance Year",
      observanceDescription: "Recurring Hindu lunar/tithi observances from the governed public projection. This is not an all-festival, all-faith or national-holiday calendar.",
      observanceView: "Festival and observance year view",
      calendarView: "Calendar View",
      fullList: "Full List",
      selectedMonth: "Selected Month",
      viewMonth: "View month",
      more: "more",
      observances: "observances",
      governedRecords: "governed records",
      varanasiBasis: "Varanasi canonical basis",
      emptyObservanceMonth: "No governed observance in this filter.",
      parana: "Parana",
      conclusion: "Conclusion",
      vratConclusion: "Vrat Conclusion",
      paranaConclusion: "Parana / Conclusion",
      additionalRitualTimings: "Additional Ritual Timings",
      ruleSourceBasis: "Rule / Source Basis",
      notApplicable: "Not applicable",
      noSeparatelyGovernedTimingAvailable: "No separately governed timing available",
      backToYear: "Back to year",
      previousMonth: "Previous month",
      nextMonth: "Next month",
      closeDetails: "Close details",
      previousPage: "Previous Page",
      nextPage: "Next Page",
      reflectKicker: "Reflect",
      reflectTitle: "Your Star Reflection",
      starLabel: "Star Reflection",
      starSafety: "Reflective prompt only; not a personal prediction, assessment, or decision guide.",
      starIntro: "Your birth inputs are used only to resolve this reflection and are not stored by Drishvara.",
      name: "Name",
      dob: "Date of Birth",
      birthTime: "Birth Time",
      unknownTime: "I don’t know exact birth time",
      birthPlace: "Birth Place",
      selectBirthPlace: "Select Birth Place",
      enterBirthCoordinates: "Enter Birth Coordinates",
      searchCity: "Search city or place",
      chooseBirthPlace: "Choose Birth Place",
      selectedBirthPlace: "Selected birth place",
      selectedBirthPlaceNone: "Selected birth place: not selected",
      starPlaceNote: "Choose one approved birth place for this session only, or use coordinate mode.",
      birthLatitude: "Birth Latitude",
      birthLongitude: "Birth Longitude",
      birthTimezone: "Birth Timezone",
      optionalBirthPlace: "Optional Birth Place Label",
      starCoordinateNote: "Coordinates remain available when your approved place is not in the public location list. Inputs are not stored.",
      starBasisStatus: "Reflection basis: Moon-led, Panchanga-supported, birth-time-aware and location-aware. Result remains reflective and non-deterministic.",
      starActiveStatus: "Star Reflection active result is enabled for DOB, birth time and selected birth-place basis. No personal data is stored.",
      starPlaceUnavailable: "No approved public match. Use coordinates for unavailable places.",
      generateReflection: "Generate Reflection",
      reflectionResult: "Today's Star Reflection Result",
      todaysReflection: "Today's Reflection",
      reflectiveTheme: "Reflective Theme",
      selfInquiry: "Self-Inquiry",
      groundingPractice: "Grounding Practice",
      limitation: "Limitation",
      basisDetermined: "How this basis was determined",
      resultNote: "No name, DOB, birth time, location or coordinate data is stored. This active pilot result is symbolic and non-deterministic; it is not clinical, financial, legal, relationship, career or decision advice.",
      reflectionUnavailable: "Governed Hindi reflection text is not yet available; the reflective result remains in the approved available language."
    },
    hi: {
      timeKicker: "समय",
      timeTitle: "आज का पंचांग",
      panchangViewLabel: "पंचांग और पर्व दृश्य",
      todaysPanchang: "आज का पंचांग",
      panchangIntro: "वर्तमान पंचांग देखने के लिए दिनांक और स्वीकृत स्थान चुनें। नीचे दिया गया वार्षिक पर्व कैलेंडर प्रमाणित वाराणसी आधार पर रहता है।",
      panchangDate: "पंचांग दिनांक",
      previousDay: "पिछला दिन",
      today: "आज",
      nextDay: "अगला दिन",
      date: "दिनांक (DD/MM/YYYY)",
      datePicker: "दिनांक चयन",
      chooseDate: "दिनांक चुनें",
      selectedCivilDate: "चयनित सिविल दिनांक",
      selectLocation: "शहर या स्थान खोजें",
      selectLocationMode: "स्थान चुनें",
      choosePanchangLocation: "पंचांग स्थान चुनें",
      approvedPlaceAlias: "स्वीकृत स्थान या उपनाम",
      placeAliasPlaceholder: "जैसे काशी या टोक्यो",
      coordinates: "निर्देशांक दर्ज करें",
      latitude: "अक्षांश",
      longitude: "देशांतर",
      timezone: "समय क्षेत्र",
      optionalLocation: "वैकल्पिक स्थान नाम",
      panchangCoordinateNote: "निर्देशांक-आधारित गणना के लिए अक्षांश, देशांतर और मान्य IANA समय क्षेत्र आवश्यक हैं। Drishvara रिवर्स-जियोकोड नहीं करता और ये इनपुट संग्रहीत नहीं होते।",
      panchangSearchForward: "शासित ड्रॉपडाउन का उपयोग करें या काशी, बनारस, वाराणसी, ईटानगर, नई दिल्ली, रांची या टोक्यो जैसे स्वीकृत उपनाम दर्ज करें।",
      panchangPlaceNote: "चयनित स्थान शासित निर्देशांक और समय क्षेत्र का उपयोग करते हैं। स्वीकृत उपनाम ठीक-ठीक मिलते हैं; अस्पष्ट या निकटतम-स्थान मिलान उपयोग नहीं होता।",
      calculatePanchang: "पंचांग देखें",
      requestReady: "इनपुट देखें, फिर पंचांग देखें दबाएँ। इनपुट बदलने से अंतिम प्रतिबद्ध परिणाम अपने-आप नहीं बदलेगा।",
      publicReleasePrefix: "AG74P सार्वजनिक रिलीज़:",
      publicReleaseText: "5 स्वीकृत नामित स्थान · मान्य IANA समय क्षेत्र सहित वैश्विक निर्देशांक · 384 वाराणसी वार्षिक रिकॉर्ड · 114 सामान्य मासिक पर्व।",
      locationBasis: "स्थान आधार",
      coordinateBasis: "निर्देशांक आधार",
      timezoneBasis: "समय क्षेत्र आधार",
      approvalBasis: "स्वीकृति आधार",
      calendarBasis: "कैलेंडर आधार",
      howDetermined: "यह कैसे निर्धारित हुआ",
      detailedTimings: "विस्तृत समय",
      loading: "लोड हो रहा है",
      loadingObservances: "स्वीकृत पर्व-रिकॉर्ड लोड हो रहे हैं।",
      unavailable: "उपलब्ध नहीं",
      sunrise: "सूर्योदय",
      sunset: "सूर्यास्त",
      tithi: "तिथि",
      nakshatra: "नक्षत्र",
      yoga: "योग",
      karana: "करण",
      paksha: "पक्ष",
      vara: "वार",
      currentObservance: "आज / आगामी पर्व",
      upcomingObservance: "आगामी पर्व",
      noGovernedObservance: "इस चयन के लिए अभी कोई शासित पर्व-परिणाम उपलब्ध नहीं है।",
      observanceTimingNote: "पर्व-समय तभी दिखता है जब किसी अद्वितीय रिकॉर्ड को स्पष्ट सार्वजनिक-प्रदर्शन स्वीकृति मिली हो या पूर्ण गणना इंजन उपलब्ध हो।",
      begins: "आरंभ",
      ends: "समाप्ति",
      ritualWindows: "अनुष्ठान समय",
      ritualWindow: "अनुष्ठान समय",
      annualObservanceBook: "वार्षिक पर्व पुस्तक",
      annualCalendar: "वार्षिक हिंदू पर्व कैलेंडर",
      yearAtGlance: "हिन्दू वर्ष अवलोकन",
      yearOverviewNote: "स्वीकृत वाराणसी वार्षिक पुस्तक से चंद्र-मास अवलोकन।",
      bookLoading: "स्वीकृत वाराणसी वार्षिक पुस्तक लोड हो रही है…",
      bookStructureLoading: "वार्षिक पुस्तक संरचना लोड हो रही है…",
      observanceYear: "व्रत एवं पर्व वार्षिक पंचांग",
      observanceDescription: "स्वीकृत सार्वजनिक प्रक्षेपण से आवर्ती हिंदू चंद्र/तिथि पर्व। यह सभी त्योहारों, सभी आस्थाओं या राष्ट्रीय अवकाशों का कैलेंडर नहीं है।",
      observanceView: "व्रत एवं पर्व वार्षिक दृश्य",
      calendarView: "कैलेंडर दृश्य",
      fullList: "पूरी सूची",
      selectedMonth: "चयनित माह",
      viewMonth: "माह देखें",
      more: "और",
      observances: "पर्व",
      governedRecords: "स्वीकृत रिकॉर्ड",
      varanasiBasis: "वाराणसी प्रमाणित आधार",
      emptyObservanceMonth: "इस फ़िल्टर में कोई स्वीकृत पर्व नहीं।",
      parana: "पारण",
      conclusion: "समापन",
      vratConclusion: "व्रत समापन",
      paranaConclusion: "पारण / समापन",
      additionalRitualTimings: "अतिरिक्त अनुष्ठान समय",
      ruleSourceBasis: "नियम / स्रोत आधार",
      notApplicable: "लागू नहीं",
      noSeparatelyGovernedTimingAvailable: "अलग से स्वीकृत समय उपलब्ध नहीं",
      backToYear: "वर्ष पर लौटें",
      previousMonth: "पिछला माह",
      nextMonth: "अगला माह",
      closeDetails: "विवरण बंद करें",
      previousPage: "पिछला पृष्ठ",
      nextPage: "अगला पृष्ठ",
      reflectKicker: "चिंतन",
      reflectTitle: "आपका नक्षत्र चिंतन",
      starLabel: "नक्षत्र चिंतन",
      starSafety: "केवल चिंतन संकेत; निजी भविष्यवाणी, मूल्यांकन या निर्णय-मार्गदर्शन नहीं।",
      starIntro: "आपके जन्म इनपुट केवल इस चिंतन को निर्धारित करने के लिए उपयोग होते हैं और Drishvara द्वारा संग्रहीत नहीं होते।",
      name: "नाम",
      dob: "जन्म तिथि",
      birthTime: "जन्म समय",
      unknownTime: "मुझे सही जन्म समय नहीं पता",
      birthPlace: "जन्म स्थान",
      selectBirthPlace: "जन्म स्थान चुनें",
      enterBirthCoordinates: "जन्म निर्देशांक दर्ज करें",
      searchCity: "शहर या स्थान खोजें",
      chooseBirthPlace: "जन्म स्थान चुनें",
      selectedBirthPlace: "चयनित जन्म स्थान",
      selectedBirthPlaceNone: "चयनित जन्म स्थान: नहीं चुना गया",
      starPlaceNote: "इस सत्र के लिए एक स्वीकृत जन्म स्थान चुनें, या निर्देशांक मोड उपयोग करें।",
      birthLatitude: "जन्म अक्षांश",
      birthLongitude: "जन्म देशांतर",
      birthTimezone: "जन्म समय क्षेत्र",
      optionalBirthPlace: "वैकल्पिक जन्म स्थान नाम",
      starCoordinateNote: "जब आपका स्वीकृत स्थान सार्वजनिक स्थान-सूची में न हो, तब निर्देशांक उपलब्ध रहते हैं। इनपुट संग्रहीत नहीं होते।",
      starBasisStatus: "चिंतन आधार: चंद्र-नेतृत्व, पंचांग-समर्थित, जन्म-समय-सचेत और स्थान-सचेत। परिणाम चिंतनात्मक और अनिर्णायक रहता है।",
      starActiveStatus: "DOB, जन्म समय और चयनित जन्म-स्थान आधार के लिए नक्षत्र चिंतन सक्रिय परिणाम सक्षम है। कोई निजी डेटा संग्रहीत नहीं होता।",
      starPlaceUnavailable: "कोई स्वीकृत सार्वजनिक मिलान नहीं। अनुपलब्ध स्थानों के लिए निर्देशांक उपयोग करें।",
      generateReflection: "चिंतन देखें",
      reflectionResult: "आज का नक्षत्र चिंतन परिणाम",
      todaysReflection: "आज का चिंतन",
      reflectiveTheme: "चिंतन-विषय",
      selfInquiry: "स्व-प्रश्न",
      groundingPractice: "आधार अभ्यास",
      limitation: "सीमा",
      basisDetermined: "यह आधार कैसे निर्धारित हुआ",
      resultNote: "नाम, DOB, जन्म समय, स्थान या निर्देशांक डेटा संग्रहीत नहीं होता। यह सक्रिय पायलट परिणाम प्रतीकात्मक और अनिर्णायक है; यह चिकित्सा, वित्तीय, कानूनी, संबंध, करियर या निर्णय सलाह नहीं है।",
      reflectionUnavailable: "स्वीकृत हिंदी चिंतन-पाठ अभी उपलब्ध नहीं है; चिंतन परिणाम उपलब्ध स्वीकृत भाषा में रहेगा।"
    }
  };

  function textNode(selector, value) {
    var node = document.querySelector(selector);
    if (node) node.textContent = value;
  }

  function fieldLabel(selector, value) {
    var node = document.querySelector(selector);
    if (!node) return;
    var span = node.querySelector("span");
    if (span) span.textContent = value;
    else {
      Array.prototype.slice.call(node.childNodes).some(function (child) {
        if (child.nodeType === 3 && child.nodeValue.trim()) {
          child.nodeValue = value + " ";
          return true;
        }
        return false;
      });
    }
  }

  function resultRowLabel(id, value) {
    var node = document.getElementById(id);
    var row = node ? node.closest(".mini-row") : null;
    var label = row ? row.querySelector("strong") : null;
    if (label) label.textContent = value;
  }

  function miniRowLabel(id, value) {
    resultRowLabel(id, value);
  }

  function modeLabel(inputSelector, value) {
    var input = document.querySelector(inputSelector);
    var label = input ? input.closest("label") : null;
    if (!label) return;
    Array.prototype.slice.call(label.childNodes).some(function (child) {
      if (child.nodeType === 3 && child.nodeValue.trim()) {
        child.nodeValue = " " + value;
        return true;
      }
      return false;
    });
  }

  function inputPlaceholder(id, placeholder, ariaLabel) {
    var input = document.getElementById(id);
    if (!input) return;
    input.setAttribute("placeholder", placeholder);
    if (ariaLabel) input.setAttribute("aria-label", ariaLabel);
  }

  function setTextIfPresent(selector, value) {
    var node = document.querySelector(selector);
    if (node) node.textContent = value;
  }

  function visibleRuntimeLabel(card, key, value) {
    if (!card) return;
    var legacy = card.querySelector(":scope > .label") || card.querySelector(".label");
    var visible = card.querySelector('[data-dv2-runtime-label="' + key + '"]');
    if (legacy) {
      legacy.hidden = true;
      legacy.setAttribute("aria-hidden", "true");
      legacy.setAttribute("data-dv2-legacy-runtime-label", "true");
    }
    if (!visible) {
      visible = document.createElement("div");
      visible.className = "dv2-runtime-label";
      visible.setAttribute("data-dv2-runtime-label", key);
      if (legacy) legacy.insertAdjacentElement("afterend", visible);
      else card.insertBefore(visible, card.firstChild);
    }
    visible.textContent = value;
  }

  function localizeStaticTimeText(text, lang) {
    var original = String(text || "").trim();
    if (!original) return original;
    if (lang !== "hi") return original;
    var pageMatch = original.match(/^Page\s+(\d+)\s+of\s+4$/i);
    if (pageMatch) return "पृष्ठ " + pageMatch[1] + " / 4";
    var slotHeadingMatch = original.match(/^Canonical lunar-month slots\s+(\d+)–(\d+)$/i);
    if (slotHeadingMatch) {
      return "प्रमाणित चंद्र-मास खंड " + slotHeadingMatch[1] + "–" + slotHeadingMatch[2];
    }
    var slotMatch = original.match(/^Page\s+(\d+)\s+·\s+Canonical lunar-month slots\s+(\d+)–(\d+)$/i);
    if (slotMatch) {
      return "पृष्ठ " + slotMatch[1] + " · प्रमाणित चंद्र-मास खंड " + slotMatch[2] + "–" + slotMatch[3];
    }
    var beganMatch = original.match(/^Began\s+(.+?)\s+·\s+Next\s+(.+?)(?:\s+\(next segment\))?$/i);
    if (beganMatch) {
      return "आरंभ " + formatDateTime(beganMatch[1], lang) + " · अगला " + formatDateTime(beganMatch[2], lang) + " (अगला खंड)";
    }
    var autoPageMatch = original.match(/^Selected Varanasi date belongs to\s+(.+?)\.\s+Page\s+(\d+)\s+opened automatically\.$/i);
    if (autoPageMatch) {
      return "चयनित वाराणसी दिनांक " + localizeValue(autoPageMatch[1], lang) + " में आता है। पृष्ठ " + autoPageMatch[2] + " अपने-आप खुला।";
    }
    if (/^one regular$/i.test(original)) return "एक नियमित";
    if (/^two adhika plus nija$/i.test(original)) return "दो अधिक + निज";
    if (/^regular$/i.test(original)) return "नियमित";
    if (/^adhika$/i.test(original)) return "अधिक";
    if (/^nija$/i.test(original)) return "निज";
    if (/^kshaya$/i.test(original)) return "क्षय";
    if (/^Kshaya exception — no physical month fabricated$/i.test(original)) {
      return "क्षय अपवाद — कोई कृत्रिम भौतिक मास नहीं बनाया गया";
    }
    var selectedDateMatch = original.match(/^(.+?)\s+·\s+selected civil date$/i);
    if (selectedDateMatch) return selectedDateMatch[1] + " · चयनित सिविल दिनांक";
    var committedMatch = original.match(/^Committed request resolved as calculated for\s+(.+?)\.$/i);
    if (committedMatch) return committedMatch[1] + " के लिए प्रतिबद्ध अनुरोध गणना-आधारित रूप से पूर्ण हुआ।";
    var governedMatch = original.match(/^Server-governed Panchang displayed for\s+(.+?)\s+on\s+(.+?)\.\s+No input has been stored\.$/i);
    if (governedMatch) {
      return localizeValue(governedMatch[1], lang) + " के लिए " + governedMatch[2] + " का सर्वर-शासित पंचांग दिखाया गया। कोई इनपुट संग्रहीत नहीं हुआ।";
    }
    var direct = {
      "Panchang & Festival View": "पंचांग और पर्व दृश्य",
      "Panchang date": "पंचांग दिनांक",
      "Choose Panchang Location": "पंचांग स्थान चुनें",
      "Approved place or alias": "स्वीकृत स्थान या उपनाम",
      "Select Location": "स्थान चुनें",
      "Enter Coordinates": "निर्देशांक दर्ज करें",
      "Coordinate basis: awaiting Panchang coordinates": "निर्देशांक आधार: पंचांग निर्देशांक की प्रतीक्षा",
      "Selected Panchang location: Varanasi / Banaras": "चयनित पंचांग स्थान: वाराणसी / बनारस",
      "Annual observance book": "वार्षिक पंचांग पुस्तक",
      "Canonical basis: Varanasi / Banaras": "प्रमाणित आधार: वाराणसी / बनारस",
      "Varanasi canonical basis": "वाराणसी प्रमाणित आधार",
      "Loading the governed Varanasi annual book…": "स्वीकृत वाराणसी वार्षिक पुस्तक लोड हो रही है…",
      "Loading annual-book structure…": "वार्षिक पुस्तक संरचना लोड हो रही है…",
      "Preparing the Varanasi date basis…": "वाराणसी दिनांक आधार तैयार हो रहा है…",
      "Today in Varanasi": "आज वाराणसी में",
      "One Regular": "एक नियमित",
      "Festival entries, public Begins/Ends timings and ritual windows will populate after the governed Hindu-year and rule contracts are completed.": "शासित हिंदू-वर्ष और नियम अनुबंध पूरे होने के बाद पर्व प्रविष्टियाँ, सार्वजनिक आरंभ/समाप्ति समय और अनुष्ठान समय यहाँ आएँगे।",
      "Adhika month instances will be nested under their related canonical month slot. Physical month counts may vary.": "अधिक मास की अवस्थाएँ संबंधित प्रमाणित मास-खंड के अंतर्गत रहेंगी। वास्तविक मास संख्या बदल सकती है।",
      "Kshaya or exceptional month states will be marked explicitly rather than forcing exactly twelve physical months.": "क्षय या अपवाद मास अवस्थाएँ स्पष्ट रूप से चिह्नित होंगी; ठीक बारह वास्तविक मास मानकर बाध्य नहीं किया जाएगा।",
      "The final book will be complete against the approved and versioned Drishvara festival and observance rule inventory.": "अंतिम पुस्तक स्वीकृत और संस्करणित Drishvara पर्व तथा व्रत नियम-सूची के अनुसार पूर्ण होगी।",
      "No governed observance result is available for this selection yet.": "इस चयन के लिए अभी कोई शासित पर्व-परिणाम उपलब्ध नहीं है।",
      "Festival timing appears only when a uniquely matched record has explicit public-display approval or the completed calculation engine is available.": "पर्व-समय तभी दिखता है जब किसी अद्वितीय रिकॉर्ड को स्पष्ट सार्वजनिक-प्रदर्शन स्वीकृति मिली हो या पूर्ण गणना इंजन उपलब्ध हो।",
      "Not available for the current governed record": "वर्तमान शासित रिकॉर्ड के लिए उपलब्ध नहीं",
      "No approved observance timing record is attached to this Panchang result.": "इस पंचांग परिणाम से कोई स्वीकृत पर्व-समय रिकॉर्ड जुड़ा नहीं है।",
      "No source-reviewed public observance is approved for this date.": "इस दिनांक के लिए कोई स्रोत-समीक्षित सार्वजनिक पर्व स्वीकृत नहीं है।",
      "Astronomical conditions are not substituted for public festival dates.": "सार्वजनिक पर्व तिथियों के लिए खगोलीय स्थितियों को प्रतिस्थापित नहीं किया जाता।",
      "Approved transition detail unavailable": "स्वीकृत परिवर्तन-विवरण उपलब्ध नहीं",
      "Approved governed server record": "स्वीकृत शासित सर्वर रिकॉर्ड",
      "SUP02 server runtime · Modern Drik · Lahiri/Chitrapaksha · no browser-local calculation": "SUP02 सर्वर रनटाइम · Modern Drik · Lahiri/Chitrapaksha · ब्राउज़र-स्थानीय गणना नहीं",
      "Governed server runtime · no automatic place or timezone substitution": "शासित सर्वर रनटाइम · स्थान या समय क्षेत्र का स्वतः प्रतिस्थापन नहीं",
      "Resolving the request through the active Supabase Panchang runtime…": "सक्रिय Supabase पंचांग रनटाइम से अनुरोध हल किया जा रहा है…",
      "Review the inputs, then press Calculate Panchang. Changing inputs will not replace the last committed result.": "इनपुट देखें, फिर पंचांग देखें दबाएँ। इनपुट बदलने से अंतिम प्रतिबद्ध परिणाम अपने-आप नहीं बदलेगा।",
      "Coordinate-first calculation requires latitude, longitude and a supplied valid IANA timezone. Drishvara does not reverse-geocode or store these inputs.": "निर्देशांक-आधारित गणना के लिए अक्षांश, देशांतर और मान्य IANA समय क्षेत्र आवश्यक हैं। Drishvara रिवर्स-जियोकोड नहीं करता और ये इनपुट संग्रहीत नहीं होते।",
      "Use the governed dropdown or enter an approved alias such as Kashi, Banaras, Varanasi, Itanagar, New Delhi, Ranchi or Tokyo.": "शासित ड्रॉपडाउन का उपयोग करें या काशी, बनारस, वाराणसी, ईटानगर, नई दिल्ली, रांची या टोक्यो जैसे स्वीकृत उपनाम दर्ज करें।",
      "Curated locations use governed coordinates and timezones. Approved aliases resolve exactly; fuzzy or nearest-place matching is not used.": "चयनित स्थान शासित निर्देशांक और समय क्षेत्र का उपयोग करते हैं। स्वीकृत उपनाम ठीक-ठीक मिलते हैं; अस्पष्ट या निकटतम-स्थान मिलान उपयोग नहीं होता।"
    };
    return direct[original] || localizeValue(original, lang)
      .replace(/server-governed basis/gi, "सर्वर-शासित आधार")
      .replace(/server-resolved calculation coordinates/gi, "सर्वर-निर्धारित गणना निर्देशांक")
      .replace(/approved IANA basis/gi, "स्वीकृत IANA आधार")
      .replace(/Vikram Samvat/gi, "विक्रम संवत");
  }

  function localizeElements(selector, lang) {
    document.querySelectorAll(selector).forEach(function (node) {
      if (!node || node.children.length) return;
      var stored = node.getAttribute("data-dv2-original-text");
      var current = node.textContent || "";
      if (lang === "en") {
        if (stored) node.textContent = stored;
        return;
      }
      if (!stored && /[\u0900-\u097F]/.test(current)) return;
      var original = stored && current === localizeStaticTimeText(stored, lang)
        ? stored
        : current;
      node.setAttribute("data-dv2-original-text", original);
      node.textContent = localizeStaticTimeText(original, lang);
    });
  }

  function localizePanchangVisibleText(lang) {
    localizeElements(
      [
        ".ag74i-eyebrow",
        ".ag74i-selected-date",
        ".ag74i-book-basis",
        ".ag74i-book-year",
        ".ag74i-book-page-number",
        ".ag74i-book-page h4",
        ".ag74i-book-page p:not(.ag74i-book-page-number)",
        "#ag74o-book-status",
        ".ag74o-month-slot h4",
        ".ag74o-month-slot h5",
        ".ag74o-month-slot-heading span",
        ".ag74o-month-instance strong",
        ".ag74o-month-instance span",
        ".ag74o-instance-kind",
        ".ag74o-kshaya",
        ".ag74o-month-instance span",
        ".ag71d-select-label",
        ".ag74o-alias-field span",
        ".ag71c-coordinate-note",
        ".ag71d-r6-coordinate-basis-summary",
        ".ag71d-r5-selection-summary",
        ".ag71d-r5-search-forward-note",
        ".ag71d-place-select-note",
        "#panchang-selection-status",
        "#panchang-request-status",
        "#upcoming-observance-name",
        "#upcoming-observance-note",
        "#upcoming-observance-begins",
        "#upcoming-observance-ends",
        "#upcoming-observance-ritual-window"
      ].join(","),
      lang
    );
  }

  function localizePanchangPlaces(lang) {
    document
      .querySelectorAll("#panchang-place-select option, [data-ag71d-r4-select-kind='panchang']")
      .forEach(function (node) {
        var value = node.value || node.getAttribute("data-ag71d-r4-location-value") || "";
        var english = node.getAttribute("data-dv2-place-en") || node.textContent.trim();
        if (!node.getAttribute("data-dv2-place-en")) node.setAttribute("data-dv2-place-en", english);
        node.textContent = lang === "hi" ? (STAR_PLACE_LABEL_HI[value] || replaceKnownHindi(english)) : english;
      });
    document
      .querySelectorAll("#panchang-place-select + [data-drishvara-hf12-select] .drishvara-hf12-select-button, #panchang-place-select + [data-drishvara-hf12-select] .drishvara-hf12-select-option")
      .forEach(function (node) {
        var value = node.getAttribute("data-value") || node.getAttribute("data-drishvara-hf12-value") || "";
        var english = node.getAttribute("data-dv2-place-en") || node.textContent.trim();
        if (!node.getAttribute("data-dv2-place-en")) node.setAttribute("data-dv2-place-en", english);
        node.textContent = lang === "hi" ? (STAR_PLACE_LABEL_HI[value] || replaceKnownHindi(english)) : english;
      });
  }

  function localizePanchangHf12Places(lang) {
    var select = document.getElementById("panchang-place-select");
    document
      .querySelectorAll("#panchang-place-select + [data-drishvara-hf12-select] .drishvara-hf12-select-button, #panchang-place-select + [data-drishvara-hf12-select] .drishvara-hf12-select-option")
      .forEach(function (node) {
        var value = node.getAttribute("data-value") || "";
        if (!value && node.classList.contains("drishvara-hf12-select-button") && select) value = select.value || "";
        var english = node.getAttribute("data-dv2-place-en") || node.textContent.trim();
        if (!node.getAttribute("data-dv2-place-en")) node.setAttribute("data-dv2-place-en", english);
        node.textContent = lang === "hi" ? (STAR_PLACE_LABEL_HI[value] || replaceKnownHindi(english)) : english;
      });
  }

  function applyTimeLanguage(lang) {
    var d = LANGUAGE[lang === "hi" ? "hi" : "en"];
    currentTimeLanguage = lang === "hi" ? "hi" : "en";
    var sectionRoot = document.getElementById("time");
    if (sectionRoot) sectionRoot.setAttribute("data-dv2-lang", currentTimeLanguage);
    textNode("#time > .dv2-section__inner > .dv2-section__kicker", d.timeKicker);
    textNode("#time > .dv2-section__inner > h2", d.timeTitle);
    visibleRuntimeLabel(document.getElementById("panchang-festival-card"), "panchang", d.panchangViewLabel);
    textNode('#panchang-festival-card [data-dv2-runtime-label="panchang"]', d.panchangViewLabel);
    textNode("#panchang-public-heading", d.todaysPanchang);
    textNode('[data-ag74i-public-introduction="true"]', d.panchangIntro);
    textNode("#ag74i-date-heading", d.chooseDate);
    textNode("#panchang-previous-day", d.previousDay);
    textNode("#panchang-today", d.today);
    textNode("#panchang-next-day", d.nextDay);
    textNode("#panchang-calculate", d.calculatePanchang);
    textNode("#upcoming-observance-title", d.upcomingObservance);
    textNode("#dv2-year-glance-button", d.yearAtGlance);
    textNode("#dv2-year-glance-title", d.yearAtGlance);
    textNode("#dv2-year-glance-note", d.yearOverviewNote);
    textNode("#ag74i-book-previous", d.previousPage);
    textNode("#ag74i-book-next", d.nextPage);
    textNode("#ag74i-calendar-book-title", d.annualCalendar);
    textNode("#dv2-panchang-detailed-timings summary", d.detailedTimings);
    textNode("#dv2-panchang-methodology summary", d.howDetermined);
    textNode(".ag74i-book-basis", d.varanasiBasis);
    fieldLabel('label[for="panchang-date-text"]', d.date);
    fieldLabel('label[for="panchang-date-picker"]', d.datePicker);
    fieldLabel('label[for="panchang-place-alias"]', d.approvedPlaceAlias);
    modeLabel('input[name="ag71c-panchang-location-mode"][value="place"]', d.selectLocationMode);
    modeLabel('input[name="ag71c-panchang-location-mode"][value="coordinates"]', d.coordinates);
    setTextIfPresent('[data-ag71d-place-select-shell="panchang"] .ag71d-select-label', d.choosePanchangLocation);
    var placeAlias = document.getElementById("panchang-place-alias");
    if (placeAlias) {
      placeAlias.setAttribute("placeholder", d.placeAliasPlaceholder);
      placeAlias.setAttribute("aria-label", d.approvedPlaceAlias);
    }
    localizePanchangPlaces(currentTimeLanguage);
    inputPlaceholder("panchang-coordinate-label", currentTimeLanguage === "hi" ? "जैसे ईटानगर" : "e.g. Itanagar");
    fieldLabel('label.ag71c-field-label:has(#panchang-latitude)', d.latitude);
    fieldLabel('label.ag71c-field-label:has(#panchang-longitude)', d.longitude);
    fieldLabel('label.ag71c-field-label:has(#panchang-timezone)', d.timezone);
    fieldLabel('label.ag71c-field-label:has(#panchang-coordinate-label)', d.optionalLocation);
    textNode('[data-ag71c-coordinate-surface="panchang"] .ag71c-coordinate-note', d.panchangCoordinateNote);
    textNode('[data-ag71d-r5-search-forward-note="panchang"]', d.panchangSearchForward);
    textNode('[data-ag71d-place-select-shell="panchang"] .ag71d-place-select-note', d.panchangPlaceNote);
    textNode(".ag74p-live-release strong", d.publicReleasePrefix);
    textNode(".ag74p-live-release span", d.publicReleaseText);
    miniRowLabel("panchang-calculation-source", currentTimeLanguage === "hi" ? "गणना स्रोत" : "Calculation Source");
    miniRowLabel("panchang-method-basis", currentTimeLanguage === "hi" ? "पद्धति आधार" : "Method Basis");
    miniRowLabel("panchang-moonrise", d.locationBasis);
    miniRowLabel("panchang-moonset", currentTimeLanguage === "hi" ? "दिनांक आधार" : "Date Basis");
    resultRowLabel("panchang-sunrise", d.sunrise);
    resultRowLabel("panchang-sunset", d.sunset);
    resultRowLabel("panchang-tithi", d.tithi);
    resultRowLabel("panchang-nakshatra", d.nakshatra);
    resultRowLabel("panchang-yoga", d.yoga);
    resultRowLabel("panchang-karana", d.karana);
    resultRowLabel("panchang-paksha", d.paksha);
    resultRowLabel("panchang-vara", d.vara);
    resultRowLabel("panchang-tithi-transition", d.tithi + " " + (currentTimeLanguage === "hi" ? "परिवर्तन" : "transition"));
    resultRowLabel("panchang-nakshatra-transition", d.nakshatra + " " + (currentTimeLanguage === "hi" ? "परिवर्तन" : "transition"));
    resultRowLabel("panchang-yoga-transition", d.yoga + " " + (currentTimeLanguage === "hi" ? "परिवर्तन" : "transition"));
    resultRowLabel("panchang-karana-transition", d.karana + " " + (currentTimeLanguage === "hi" ? "परिवर्तन" : "transition"));
    [
      ["panchang-location-provenance", d.locationBasis],
      ["panchang-coordinate-provenance", d.coordinateBasis],
      ["panchang-timezone-provenance", d.timezoneBasis],
      ["panchang-approval-provenance", d.approvalBasis]
    ].forEach(function (item) {
      var value = document.getElementById(item[0]);
      var label = value && value.closest("p") ? value.closest("p").querySelector("strong") : null;
      if (label) label.textContent = item[1] + ":";
    });
    document.querySelectorAll(".ag74i-observance-window dt").forEach(function (dt) {
      if (/Begins|आरंभ/i.test(dt.textContent)) dt.textContent = d.begins;
      else if (/Ends|समाप्ति/i.test(dt.textContent)) dt.textContent = d.ends;
      else dt.textContent = d.ritualWindows;
    });
    var help = document.getElementById("panchang-date-help");
    if (help) {
      help.textContent = currentTimeLanguage === "hi"
        ? "समर्थित दिनांक: 01/01/1900 से 31/12/2100। टेक्स्ट फ़ील्ड और मूल दिनांक चयन साथ-साथ रहते हैं। समय चयनित IANA समय क्षेत्र पर आधारित है।"
        : "Supported dates: 01/01/1900 to 31/12/2100. The text field and native date picker stay synchronized. Times use the selected IANA timezone.";
    }
    var request = document.getElementById("panchang-request-status");
    if (request && /Review the inputs|इनपुट/.test(request.textContent || "")) {
      request.textContent = d.requestReady;
    }
    var defaultObservation = document.getElementById("upcoming-observance-name");
    if (defaultObservation && /No governed observance result|शासित पर्व/.test(defaultObservation.textContent || "")) {
      defaultObservation.textContent = d.noGovernedObservance;
    }
    var observationNote = document.getElementById("upcoming-observance-note");
    if (observationNote && /Festival timing appears|पर्व-समय/.test(observationNote.textContent || "")) {
      observationNote.textContent = d.observanceTimingNote;
    }
    var observanceFilters = document.getElementById("dv2-observance-filters");
    if (observanceFilters) {
      observanceFilters.setAttribute("aria-label", currentTimeLanguage === "hi" ? "पर्व परिवार फ़िल्टर" : "Observance family filters");
    }
    var bookNav = document.querySelector(".ag74i-book-navigation");
    if (bookNav) {
      bookNav.setAttribute("aria-label", currentTimeLanguage === "hi" ? "वाराणसी पर्व कैलेंडर पृष्ठ" : "Varanasi festival calendar pages");
    }
    var previous = document.getElementById("ag74i-book-previous");
    var next = document.getElementById("ag74i-book-next");
    if (previous) previous.setAttribute("aria-label", currentTimeLanguage === "hi" ? "पिछला कैलेंडर पृष्ठ" : "Previous calendar page");
    if (next) next.setAttribute("aria-label", currentTimeLanguage === "hi" ? "अगला कैलेंडर पृष्ठ" : "Next calendar page");
    localizePanchangVisibleText(currentTimeLanguage);
    syncPanchangReaderPanel(currentTimeLanguage);
    renderYearOverview(currentTimeLanguage);
    renderObservanceYear(currentTimeLanguage);
    localizePanchangPlaces(currentTimeLanguage);
    localizePanchangHf12Places(currentTimeLanguage);
  }

  function starPlaceDisplay(button, lang) {
    if (!button) return "";
    var value = button.getAttribute("data-ag75d-e2-star-place-value") || "";
    var english = button.getAttribute("data-dv2-place-en") || button.textContent.trim();
    if (!button.getAttribute("data-dv2-place-en")) button.setAttribute("data-dv2-place-en", english);
    return lang === "hi" ? (STAR_PLACE_LABEL_HI[value] || replaceKnownHindi(english)) : english;
  }

  function localizeStarPlaceButtons(lang) {
    document.querySelectorAll("[data-ag75d-e2-star-place-value]").forEach(function (button) {
      button.textContent = starPlaceDisplay(button, lang);
    });
  }

  function applyReflectLanguage(lang) {
    var d = LANGUAGE[lang === "hi" ? "hi" : "en"];
    currentReflectLanguage = lang === "hi" ? "hi" : "en";
    var sectionRoot = document.getElementById("reflect");
    if (sectionRoot) sectionRoot.setAttribute("data-dv2-lang", currentReflectLanguage);
    var card = document.querySelector('[data-drishvara-v2-reflect-card="true"]');
    var dob = document.getElementById("star-reflection-dob");
    var note = document.querySelector("[data-ag73a-birth-time-note]");
    textNode("#reflect > .dv2-section__inner > .dv2-section__kicker", d.reflectKicker);
    textNode("#reflect > .dv2-section__inner > h2", d.reflectTitle);
    if (card) {
      visibleRuntimeLabel(card, "star-reflection", d.starLabel);
      textNode('[data-drishvara-v2-reflect-card="true"] [data-dv2-runtime-label="star-reflection"]', d.starLabel);
      setTextIfPresent('[data-drishvara-v2-reflect-card="true"] .star-safety-note', d.starSafety);
      setTextIfPresent('[data-drishvara-v2-reflect-card="true"] h2', d.reflectTitle);
      var cardIntro = card.querySelector("h2 + p");
      if (cardIntro) cardIntro.textContent = d.starIntro;
    }
    inputPlaceholder("star-reflection-name", d.name);
    if (dob) dob.setAttribute("placeholder", d.dob + " (DD/MM/YYYY)");
    textNode('label[for="star-reflection-birth-time"] span', d.birthTime);
    textNode(".ag73a-birth-time-unknown span", d.unknownTime);
    textNode('[data-ag71e-preview-button="star-reflection"]', d.generateReflection);
    textNode("#ag75d-e2-star-place-choice-heading", d.chooseBirthPlace);
    textNode(".ag75d-e2-star-place-note", d.starPlaceNote);
    fieldLabel('label.ag71c-field-label:has(#star-birth-latitude)', d.birthLatitude);
    fieldLabel('label.ag71c-field-label:has(#star-birth-longitude)', d.birthLongitude);
    fieldLabel('label.ag71c-field-label:has(#star-birth-timezone)', d.birthTimezone);
    fieldLabel('label.ag71c-field-label:has(#star-birth-coordinate-label)', d.optionalBirthPlace);
    modeLabel('input[name="ag71c-star-location-mode"][value="place"]', d.selectBirthPlace);
    modeLabel('input[name="ag71c-star-location-mode"][value="coordinates"]', d.enterBirthCoordinates);
    textNode('[data-ag71c-coordinate-surface="star-reflection"] .ag71c-coordinate-note', d.starCoordinateNote);
    textNode('[data-ag71d-r4-method-basis-status="true"]', d.starBasisStatus);
    textNode('[data-ag73e-star-active-status="true"]', d.starActiveStatus);
    inputPlaceholder("star-birth-coordinate-label", currentReflectLanguage === "hi" ? "जैसे रांची, झारखंड" : "e.g. Ranchi, Jharkhand");
    if (note) {
      note.textContent = lang === "hi"
        ? "जन्म समय केवल इस सत्र के चिंतन-आधार के लिए उपयोग होता है। यह संग्रहीत नहीं होता।"
        : "Birth time is used only for this session-level reflective basis. It is not stored.";
    }
    var starSearch = document.querySelector('label[for="dv2-star-location-search"] span');
    var starSearchInput = document.getElementById("dv2-star-location-search");
    if (starSearch) starSearch.textContent = d.searchCity;
    if (starSearchInput) {
      starSearchInput.setAttribute("placeholder", d.searchCity);
      starSearchInput.setAttribute("aria-label", d.searchCity);
    }
    localizeStarPlaceButtons(currentReflectLanguage);
    var summary = document.getElementById("ag75d-e2-star-place-summary");
    if (summary) {
      var selected = document.querySelector("[data-ag75d-e2-star-place-value][aria-pressed='true']");
      summary.textContent = selected
        ? d.selectedBirthPlace + ": " + selected.textContent.trim()
        : d.selectedBirthPlaceNone;
    }
    var previewEyebrow = document.querySelector('[data-ag71e-preview-panel="star-reflection"] .eyebrow');
    if (previewEyebrow) previewEyebrow.textContent = d.reflectionResult;
    var previewHeading = document.querySelector('[data-ag71e-preview-panel="star-reflection"] h3');
    if (previewHeading) {
      previewHeading.textContent = d.todaysReflection;
    }
    var previewNote = document.querySelector('[data-ag71e-preview-panel="star-reflection"] .ag71e-preview-note');
    if (previewNote) previewNote.textContent = d.starSafety + " " + d.starIntro;
    var activeNote = document.querySelector('[data-ag72e-star-preview-note]');
    if (activeNote) activeNote.textContent = d.resultNote;
    localizeStarPreviewRows(currentReflectLanguage);
    var unavailable = document.getElementById("dv2-reflect-language-note");
    if (lang === "hi") {
      if (!unavailable) {
        unavailable = document.createElement("p");
        unavailable.id = "dv2-reflect-language-note";
        unavailable.className = "dv2-section-note";
        if (card) card.appendChild(unavailable);
      }
      unavailable.textContent = d.reflectionUnavailable;
    } else if (unavailable) {
      unavailable.remove();
    }
  }

  function localizeStarPreviewRows(lang) {
    var grid = document.querySelector('[data-ag71e-preview-grid="star-reflection"]');
    if (!grid) return;
    var labels = {
      "Resolution state": "समाधान स्थिति",
      "Result basis": "परिणाम आधार",
      "Birth-date basis": "जन्म-तिथि आधार",
      "Birth-time basis": "जन्म-समय आधार",
      "Location basis": "स्थान आधार",
      "Exact birth Nakshatra": "जन्म नक्षत्र",
      "Day-context Nakshatra": "दिन-संदर्भ नक्षत्र",
      "Runtime basis": "रनटाइम आधार",
      "Status": "स्थिति",
      "Reflective theme": "चिंतन-विषय",
      "Question for reflection": "स्व-प्रश्न",
      "Self-inquiry prompt": "स्व-प्रश्न",
      "Grounding practice": "आधार अभ्यास",
      "Result note": "सीमा",
      "Limitation notice": "सीमा"
    };
    grid.querySelectorAll(".ag71e-preview-row strong").forEach(function (label) {
      var key = label.getAttribute("data-dv2-original-label") || label.textContent.trim();
      label.setAttribute("data-dv2-original-label", key);
      if (lang === "hi" && labels[key]) label.textContent = labels[key];
      else label.textContent = key;
    });
    grid.querySelectorAll(".ag71e-preview-row").forEach(function (row) {
      var label = row.querySelector("strong");
      var value = row.querySelector("span");
      if (!label || !value) return;
      var key = label.getAttribute("data-dv2-original-label") || label.textContent.trim();
      var original = value.getAttribute("data-dv2-original-value") || value.textContent.trim();
      if (!value.getAttribute("data-dv2-original-value")) {
        value.setAttribute("data-dv2-original-value", original);
      }
      if (lang !== "hi") {
        value.textContent = original;
        return;
      }
      if (/Reflective theme|Question for reflection|Self-inquiry prompt|Grounding practice|Result note|Limitation notice/i.test(key)) {
        value.textContent = original;
        return;
      }
      var direct = {
        "DOB format required: DD/MM/YYYY": "DOB प्रारूप आवश्यक: DD/MM/YYYY",
        "Birth time pending - HH:MM": "जन्म समय लंबित - HH:MM",
        "Birth time pending or invalid": "जन्म समय लंबित या अमान्य",
        "Exact birth time used": "सटीक जन्म समय उपयोग हुआ",
        "Exact birth time not known": "सटीक जन्म समय ज्ञात नहीं",
        "DOB, exact birth time, birth place and timezone": "DOB, सटीक जन्म समय, जन्म स्थान और समय क्षेत्र",
        "DOB, unknown birth time, birth place and timezone": "DOB, अज्ञात जन्म समय, जन्म स्थान और समय क्षेत्र",
        "DOB, pending birth time, birth place and timezone": "DOB, लंबित जन्म समय, जन्म स्थान और समय क्षेत्र",
        "Moon-led, Panchanga-supported, location-aware": "चंद्र-नेतृत्व, पंचांग-समर्थित, स्थान-सचेत",
        "Resolving the session inputs through the governed Star Reflection flow.": "सत्र इनपुट शासित नक्षत्र चिंतन प्रवाह से हल हो रहे हैं।",
        "The runtime request sends only civil date and governed location basis. Name and exact birth time are not sent or stored.": "रनटाइम अनुरोध केवल सिविल दिनांक और शासित स्थान आधार भेजता है। नाम और सटीक जन्म समय भेजे या संग्रहीत नहीं होते।"
      };
      value.textContent = direct[original] || replaceKnownHindi(original);
    });
  }

  function refineRuntimePresentation() {
    textNode("#panchang-public-heading", "Today's Panchang");
    textNode("#ag74i-date-heading", "Choose a date");
    textNode("#ag74i-calendar-book-title", "Annual Hindu Festival Calendar");
    textNode(".ag74i-book-basis", "Varanasi canonical basis");
    ensurePanchangReaderPanel();
    ensurePanchangDetailDisclosures();
    var intro = document.querySelector('[data-ag74i-public-introduction="true"]');
    if (intro) intro.textContent = "Select a date and approved place to view the current Panchang. The annual festival calendar below remains on the canonical Varanasi basis.";
    var release = document.querySelector("[data-ag74p-live-release]");
    var provenance = document.querySelector("[data-ag74o-r2-provenance]");
    if ((release || provenance) && !document.getElementById("dv2-panchang-methodology")) {
      var details = document.createElement("details");
      details.id = "dv2-panchang-methodology";
      details.className = "dv2-methodology";
      details.innerHTML = "<summary>How this was determined</summary>";
      if (release) details.appendChild(release);
      if (provenance) details.appendChild(provenance);
      var result = document.querySelector('[data-ag74o-daily-result-surface="true"]');
      if (result) result.insertAdjacentElement("beforebegin", details);
    }
    var detailsPanel = document.getElementById("dv2-panchang-methodology");
    if (detailsPanel && !document.getElementById("dv2-panchang-methodology-rows")) {
      var rows = document.createElement("div");
      rows.id = "dv2-panchang-methodology-rows";
      rows.className = "mini-table";
      ["panchang-calculation-source", "panchang-method-basis", "panchang-moonrise", "panchang-moonset"].forEach(function (id) {
        var value = document.getElementById(id);
        var row = value ? value.closest(".mini-row") : null;
        if (row) rows.appendChild(row);
      });
      detailsPanel.appendChild(rows);
    }
    syncPanchangReaderPanel(currentTimeLanguage);
    var starHeading = document.querySelector('[data-drishvara-v2-reflect-card="true"] h2');
    if (starHeading) starHeading.textContent = "Your Star Reflection";
    document.querySelectorAll('#dv2-reflect-host h3').forEach(function (heading) {
      if (/What the stars say about you/i.test(heading.textContent || "")) {
        heading.textContent = "Today's Reflection";
      }
    });
    var starNote = document.querySelector(".star-safety-note");
    if (starNote) starNote.textContent = "A governed reflection from your birth context.";
    var starIntro = starHeading ? starHeading.nextElementSibling : null;
    if (starIntro && starIntro.tagName === "P") {
      starIntro.textContent = "Your birth inputs are used only to resolve this reflection and are not stored by Drishvara.";
    }
    document.querySelectorAll('#dv2-reflect-host p').forEach(function (paragraph) {
      if (/Personal input is disabled until consent, privacy and reflection-method governance are complete/i.test(paragraph.textContent || "")) {
        paragraph.textContent =
          "Your birth inputs are used only to resolve this reflection and are not stored by Drishvara.";
      }
    });
    var coordinateNote = document.querySelector('[data-ag71c-coordinate-surface="star-reflection"] .ag71c-coordinate-note');
    if (coordinateNote) coordinateNote.textContent = "Coordinates remain available when your approved place is not in the public location list. Inputs are not stored.";
  }

  function isoToDisplayDate(iso) {
    var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ""));
    return match ? match[3] + "/" + match[2] + "/" + match[1] : "";
  }

  function injectTimeControlStyle() {
    if (document.getElementById("dv2-time-control-restore-style")) return;

    var style = document.createElement("style");
    style.id = "dv2-time-control-restore-style";
    style.textContent = [
      '.drishvara-v2-active #panchang-festival-card label[for="panchang-date-text"],',
      '.drishvara-v2-active #panchang-festival-card #panchang-today {',
      '  display: flex !important;',
      '  visibility: visible !important;',
      '}',
      '.drishvara-v2-active #panchang-festival-card .dv2-panchang-request-actions {',
      '  display: block !important;',
      '  visibility: visible !important;',
      '  margin: 0.85rem 0 0 !important;',
      '}',
      '.drishvara-v2-active #panchang-festival-card .dv2-panchang-request-status {',
      '  margin: 0.55rem 0 0 !important;',
      '  color: rgba(220,226,238,0.78) !important;',
      '  font-size: 0.88rem !important;',
      '  line-height: 1.45 !important;',
      '}'
    ].join("\n");
    document.head.appendChild(style);
  }

  function restoreTimeRuntimeControls() {
    var card = document.getElementById("panchang-festival-card");
    if (!card) return;

    injectTimeControlStyle();

    var controls = card.querySelector(".ag74i-date-controls");
    var pickerLabel = card.querySelector('label[for="panchang-date-picker"]');
    var picker = document.getElementById("panchang-date-picker");
    var next = document.getElementById("panchang-next-day");

    if (controls && pickerLabel && !document.getElementById("panchang-date-text")) {
      var label = document.createElement("label");
      label.className = "ag74i-date-field";
      label.setAttribute("for", "panchang-date-text");
      label.innerHTML =
        '<span>Date (DD/MM/YYYY)</span>' +
        '<input id="panchang-date-text" type="text" inputmode="numeric" maxlength="10" autocomplete="off" placeholder="DD/MM/YYYY" aria-describedby="panchang-date-help panchang-selection-status">';
      controls.insertBefore(label, pickerLabel);
      if (picker && picker.value) {
        label.querySelector("input").value = isoToDisplayDate(picker.value);
      }
    }

    if (controls && next && !document.getElementById("panchang-today")) {
      var today = document.createElement("button");
      today.type = "button";
      today.className = "ag74i-date-button ag74i-today-button";
      today.id = "panchang-today";
      today.setAttribute("aria-label", "Return to today");
      today.textContent = "Today";
      controls.insertBefore(today, next);
    }

    if (!document.getElementById("panchang-calculate")) {
      var actions = document.createElement("div");
      actions.className = "ag74o-r3-request-actions dv2-panchang-request-actions";
      actions.innerHTML =
        '<button id="panchang-calculate" type="button" class="ag74o-r3-calculate-button" aria-describedby="panchang-request-status panchang-selection-status">Calculate Panchang</button>' +
        '<p id="panchang-request-status" class="ag74o-r3-request-status dv2-panchang-request-status" data-ag74o-r3-request-state="ready" aria-live="polite">Review the inputs, then press Calculate Panchang. Changing inputs will not replace the last committed result.</p>';
      var help = document.getElementById("panchang-date-help");
      if (help && help.parentNode) {
        help.parentNode.insertBefore(actions, help.nextSibling);
      } else if (controls && controls.parentNode) {
        controls.parentNode.insertBefore(actions, controls.nextSibling);
      }
    }

    var shell = card.querySelector('[data-ag71d-place-select-shell="panchang"]');
    var select = document.getElementById("panchang-place-select");
    if (shell && select && !document.getElementById("panchang-place-alias")) {
      var search = document.createElement("label");
      search.className = "dv2-location-search";
      search.setAttribute("for", "panchang-place-alias");
      search.innerHTML =
        '<span>Search city or place</span>' +
        '<input id="panchang-place-alias" type="text" autocomplete="off" placeholder="Search city or place" aria-label="Search city or place" aria-describedby="panchang-selection-status">';
      shell.insertBefore(search, select);
    }

    card.setAttribute("data-dv2-time-controls-restored", "true");
  }

  function enhanceGovernedLocationSearch() {
    var alias = document.getElementById("panchang-place-alias");
    if (alias) {
      alias.setAttribute("placeholder", "Search city or place");
      alias.setAttribute("aria-label", "Search city or place");
    }

    var panel = document.querySelector("[data-ag75d-e2-star-place-choice-panel]");
    if (!panel || document.getElementById("dv2-star-location-search")) return;

    var label = document.createElement("label");
    label.className = "dv2-location-search";
    label.setAttribute("for", "dv2-star-location-search");
    label.innerHTML =
      '<span>Search city or place</span><input id="dv2-star-location-search" type="search" autocomplete="off" placeholder="Search city or place">';
    panel.insertBefore(label, panel.firstChild);

    var input = label.querySelector("input");
    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      var matched = 0;
      panel.querySelectorAll("[data-ag75d-e2-star-place-value]").forEach(function (button) {
        var text = button.textContent.toLowerCase();
        var value = (button.getAttribute("data-ag75d-e2-star-place-value") || "").toLowerCase();
        var show = !query || text.indexOf(query) !== -1 || value.indexOf(query) !== -1;
        button.hidden = !show;
        if (show) matched += 1;
      });
      var summary = document.getElementById("ag75d-e2-star-place-summary");
      if (summary && query && matched === 0) {
        summary.textContent = languageData(currentReflectLanguage).starPlaceUnavailable;
      }
    });
  }

  function bindSectionLanguages() {
    var time = document.getElementById("time");
    var reflect = document.getElementById("reflect");
    if (time) time.setAttribute("data-i18n-skip", "true");
    if (reflect) reflect.setAttribute("data-i18n-skip", "true");
    if (I18n && time) {
      I18n.bindSectionToggle(time, {
        timeIntro: {
          en: "Daily Panchang, observance and annual calendar context.",
          hi: "दैनिक पंचांग, पर्व और वार्षिक कैलेंडर संदर्भ।"
        },
        timeBasis: {
          en: "Current Panchang appears for the selected date and place.",
          hi: "चयनित दिनांक और स्थान के लिए वर्तमान पंचांग दिखता है।"
        },
        timePrivacy: {
          en: "Date and location inputs are not stored by this public surface.",
          hi: "दिनांक और स्थान इनपुट इस सार्वजनिक सतह पर संग्रहीत नहीं होते।"
        }
      });
      var syncTimeLanguageChoice = function (event) {
        var button = event.target.closest("#time [data-dv2-language-choice]");
        if (button) {
          var selectedLanguage = button.getAttribute("data-dv2-language-choice");
          applyTimeLanguage(selectedLanguage);
          window.setTimeout(function () {
            applyTimeLanguage(selectedLanguage);
            syncTimeContextFromRuntime();
          }, 4200);
        }
      };
      window.addEventListener("pointerdown", syncTimeLanguageChoice, true);
      window.addEventListener("click", function (event) {
        if (event.detail) return;
        syncTimeLanguageChoice(event);
      }, true);
      applyTimeLanguage("en");
    }
    if (I18n && reflect) {
      I18n.bindSectionToggle(reflect, {
        reflectIntro: {
          en: "A governed reflection from your birth context.",
          hi: "आपके जन्म-संदर्भ से एक शासित चिंतन।"
        },
        reflectBasis: {
          en: "The result hierarchy is reflection, inquiry, grounding, basis and limitation.",
          hi: "परिणाम क्रम है: चिंतन, प्रश्न, आधार-स्थापन, आधार और सीमा।"
        },
        reflectPrivacy: {
          en: "Your birth inputs are used only to resolve this reflection and are not stored by Drishvara.",
          hi: "आपके जन्म इनपुट केवल इस चिंतन को निर्धारित करने के लिए उपयोग होते हैं और Drishvara द्वारा संग्रहीत नहीं होते।"
        }
      });
      var syncReflectLanguageChoice = function (event) {
        var button = event.target.closest("#reflect [data-dv2-language-choice]");
        if (button) {
          var selectedLanguage = button.getAttribute("data-dv2-language-choice");
          applyReflectLanguage(selectedLanguage);
          window.setTimeout(function () {
            applyReflectLanguage(selectedLanguage);
          }, 3000);
        }
      };
      window.addEventListener("pointerdown", syncReflectLanguageChoice, true);
      window.addEventListener("click", function (event) {
        if (event.detail) return;
        syncReflectLanguageChoice(event);
      }, true);
      applyReflectLanguage("en");
    }
  }

  function updateLocationCount() {
    if (!Location) return;
    Location.loadApprovedLocations()
      .then(function (records) {
        var node = document.getElementById("dv2-context-time-kicker");
        if (node) {
          node.textContent = currentTimeLanguage === "hi"
            ? "समय · " + localizeValue(records[0].displayLabel, "hi")
            : "Time · " + records[0].displayLabel;
        }
      })
      .catch(function () {});
  }

  function syncTimeContextFromRuntime() {
    var sectionLang = document.getElementById("time")?.getAttribute("data-dv2-lang");
    if (sectionLang === "hi" || sectionLang === "en") currentTimeLanguage = sectionLang;
    var sunrise = document.getElementById("panchang-sunrise");
    var paksha = document.getElementById("panchang-paksha");
    var nakshatra = document.getElementById("panchang-nakshatra");
    var observance = document.getElementById("upcoming-observance-name");
    var status = document.getElementById("dv2-context-time-status");
    if (sunrise && sunrise.textContent && !/Calculating|Awaiting/i.test(sunrise.textContent)) {
      document.getElementById("dv2-context-sunrise").textContent = formatTimeOnly(sunrise.textContent);
    }
    if (paksha && paksha.textContent && !/Calculating|Awaiting/i.test(paksha.textContent)) {
      document.getElementById("dv2-context-paksha").textContent = localizeValue(paksha.textContent, currentTimeLanguage);
    }
    if (
      nakshatra &&
      nakshatra.textContent &&
      !/Calculating|Awaiting/i.test(nakshatra.textContent)
    ) {
      document.getElementById("dv2-context-nakshatra").textContent =
        localizeValue(nakshatra.textContent, currentTimeLanguage);
    }
    if (observance && observance.textContent && !/No governed/i.test(observance.textContent)) {
      document.getElementById("dv2-context-observance").textContent = localizeValue(observance.textContent, currentTimeLanguage);
    }
    if (status && sunrise && !/Calculating|Awaiting/i.test(sunrise.textContent || "")) {
      status.textContent = currentTimeLanguage === "hi"
        ? "आज का समय-संदर्भ तैयार है।"
        : "Today’s temporal context is ready.";
    }
    localizePanchangVisibleText(currentTimeLanguage);
    syncPanchangReaderPanel(currentTimeLanguage);
    applyTimeLanguage(currentTimeLanguage);
  }

  function bindRuntimeContextRefresh() {
    document.addEventListener("pointerdown", function (event) {
      if (event.target.closest("[data-ag75d-e2-star-place-value]")) {
        window.setTimeout(function () {
          applyReflectLanguage(currentReflectLanguage);
        }, 0);
      }
      if (event.target.closest('[data-ag71e-preview-button="star-reflection"]')) {
        window.setTimeout(function () {
          applyReflectLanguage(currentReflectLanguage);
        }, 1600);
      }
      if (
        event.target.closest("[data-ag74i-book-page-button]") ||
        event.target.closest("#ag74i-book-previous") ||
        event.target.closest("#ag74i-book-next")
      ) {
        window.setTimeout(function () {
          localizePanchangHf12Places(
            document.getElementById("time")?.getAttribute("data-dv2-lang") || currentTimeLanguage
          );
        }, 6200);
      }
    }, true);
    document.addEventListener("click", function (event) {
      if (
        event.target.closest("#panchang-calculate") ||
        event.target.closest("#panchang-previous-day") ||
        event.target.closest("#panchang-next-day") ||
        event.target.closest("#panchang-today") ||
        event.target.closest("[data-ag74i-book-page-button]") ||
        event.target.closest("#ag74i-book-previous") ||
        event.target.closest("#ag74i-book-next")
      ) {
        var bookNavigation = !!(
          event.target.closest("[data-ag74i-book-page-button]") ||
          event.target.closest("#ag74i-book-previous") ||
          event.target.closest("#ag74i-book-next")
        );
        window.requestAnimationFrame(syncTimeContextFromRuntime);
        window.setTimeout(syncTimeContextFromRuntime, 1100);
        if (bookNavigation) window.setTimeout(syncTimeContextFromRuntime, 4200);
        if (bookNavigation) {
          window.setTimeout(function () {
            localizePanchangHf12Places(
              document.getElementById("time")?.getAttribute("data-dv2-lang") || currentTimeLanguage
            );
          }, 6200);
        }
      }
      if (event.target.closest('[data-ag71e-preview-button="star-reflection"]')) {
        window.requestAnimationFrame(function () {
          applyReflectLanguage(currentReflectLanguage);
        });
        window.setTimeout(function () {
          applyReflectLanguage(currentReflectLanguage);
        }, 1600);
      }
      if (event.target.closest("[data-ag75d-e2-star-place-value]")) {
        window.requestAnimationFrame(function () {
          applyReflectLanguage(currentReflectLanguage);
        });
      }
    });
    document.addEventListener("change", function (event) {
      if (event.target && /^panchang-/.test(event.target.id || "")) {
        window.requestAnimationFrame(syncTimeContextFromRuntime);
      }
    });
  }

  function boot() {
    if (!Shell) return;
    renderShell();
    moveRuntimeCards();
    quarantineLegacyShell();
    refineRuntimePresentation();
    restoreTimeRuntimeControls();
    enhanceGovernedLocationSearch();
    bindSectionLanguages();
    addYearAtGlance();
    addObservanceYear();
    applyTimeLanguage(currentTimeLanguage);
    applyReflectLanguage(currentReflectLanguage);
    updateLocationCount();
    bindRuntimeContextRefresh();
    syncTimeContextFromRuntime();
    window.setTimeout(function () {
      applyTimeLanguage(currentTimeLanguage);
      applyReflectLanguage(currentReflectLanguage);
      syncTimeContextFromRuntime();
    }, 1300);

    Promise.all([
      fetchJson("data/homepage-ui.json"),
      Shell.loadArticleIndex()
    ]).then(function (values) {
      var homepage = values[0] || {};
      var indexData = values[1] || {};
      renderFirstLight(homepage, indexData);
      renderFeatured(homepage, indexData);
      renderRead(indexData);
      renderExplore(indexData);
      renderKnowledge(indexData);
      Shell.bindActiveSections();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
