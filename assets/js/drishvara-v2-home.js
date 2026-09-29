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
    ["trayodashi_pradosha", "Pradosha", "प्रदोष"],
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
    regular: "नियमित",
    Adhika: "अधिक",
    Kshaya: "क्षय",
    "Varanasi / Banaras": "वाराणसी / बनारस",
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
    sankashti_moonrise: "चंद्रोदय संदर्भ",
    moonrise: "चंद्रोदय",
    ritual_window: "अनुष्ठान समय"
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
    if (/Calculating|Awaiting/i.test(text)) return languageData(lang).loading;
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
    setReaderItem("sunrise", d.sunrise, formatTimeOnly(document.getElementById("panchang-sunrise")?.textContent || d.loading));
    setReaderItem("sunset", d.sunset, formatTimeOnly(document.getElementById("panchang-sunset")?.textContent || d.loading));
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

  function renderObservanceFilters(lang) {
    var filters = document.getElementById("dv2-observance-filters");
    if (!filters) return;
    filters.innerHTML = OBSERVANCE_FILTERS.map(function (item) {
      return (
        '<button type="button" data-dv2-observance-filter="' +
        escapeHtml(item[0]) +
        '" aria-pressed="' +
        (observanceFilter === item[0] ? "true" : "false") +
        '">' +
        escapeHtml(lang === "hi" ? item[2] : item[1]) +
        "</button>"
      );
    }).join("");
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
        : "Ritual Window";
  }

  function renderObservanceRecord(record, lang) {
    var d = languageData(lang);
    var month = record.lunar_month || {};
    var lunarName = month.canonical_name || "";
    var instance = month.instance_kind || "regular";
    var tithi = record.tithi && record.tithi.name ? record.tithi.name : "";
    var windowData = record.primary_public_window || {};
    var rituals = Array.isArray(record.ritual_windows) ? record.ritual_windows : [];
    var ritualMarkup = rituals
      .map(function (ritual) {
        return (
          '<span><b>' +
          escapeHtml(ritualLabel(ritual, lang)) +
          "</b>" +
          escapeHtml(formatDateTime(ritual.start_local, lang) + " – " + formatTimeOnly(ritual.end_local)) +
          "</span>"
        );
      })
      .join("");
    var lunarLine = [
      lunarName ? localizeValue(lunarName, lang) : "",
      instance && instance !== "regular" ? localizeValue(instance, lang) : "",
      localizeValue(record.paksha || "", lang),
      localizeValue(tithi, lang)
    ].filter(Boolean).join(" · ");
    return (
      '<article class="dv2-observance-row">' +
      '<div class="dv2-observance-date"><strong>' +
      escapeHtml(formatDate(record.civil_date, lang)) +
      "</strong><span>" +
      escapeHtml(formatWeekday(record.civil_date, lang)) +
      "</span></div>" +
      '<div class="dv2-observance-body"><h6>' +
      escapeHtml(observanceDisplayName(record, lang)) +
      "</h6><p>" +
      escapeHtml(lunarLine || d.calendarBasis) +
      '</p><p class="dv2-observance-window"><span><b>' +
      escapeHtml(d.begins) +
      "</b>" +
      escapeHtml(formatDateTime(windowData.start_local, lang)) +
      "</span><span><b>" +
      escapeHtml(d.ends) +
      "</b>" +
      escapeHtml(formatDateTime(windowData.end_local, lang)) +
      "</span>" +
      ritualMarkup +
      "</p></div></article>"
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
    renderObservanceFilters(lang);
    if (!months) return;
    if (!observanceRecords) {
      if (status) status.textContent = d.loadingObservances;
      months.innerHTML = '<p class="dv2-section-note">' + escapeHtml(d.loadingObservances) + "</p>";
      return;
    }
    var visible = observanceFilter === "all"
      ? observanceRecords
      : observanceRecords.filter(function (record) {
        return record.observance_key === observanceFilter;
      });
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
    var byMonth = Array.from({ length: 12 }, function () {
      return [];
    });
    visible.forEach(function (record) {
      var monthIndex = Number(String(record.civil_date || "").slice(5, 7)) - 1;
      if (monthIndex >= 0 && monthIndex < 12) byMonth[monthIndex].push(record);
    });
    months.innerHTML = byMonth
      .map(function (records, index) {
        return (
          '<section class="dv2-observance-month"><h5>' +
          escapeHtml((lang === "hi" ? MONTHS_HI : MONTHS_EN)[index]) +
          "</h5>" +
          (records.length
            ? records.map(function (record) { return renderObservanceRecord(record, lang); }).join("")
            : '<p class="dv2-section-note">' + escapeHtml(d.emptyObservanceMonth) + "</p>") +
          "</section>"
        );
      })
      .join("");
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
      '<div class="dv2-observance-year__filters" id="dv2-observance-filters" aria-label="Observance family filters"></div>' +
      '<div class="dv2-observance-year__months" id="dv2-observance-months"></div>';
    book.insertAdjacentElement("afterend", panel);
    panel.addEventListener("click", function (event) {
      var button = event.target.closest("[data-dv2-observance-filter]");
      if (!button || !panel.contains(button)) return;
      observanceFilter = button.getAttribute("data-dv2-observance-filter") || "all";
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
      todaysPanchang: "Today's Panchang",
      previousDay: "Previous Day",
      today: "Today",
      nextDay: "Next Day",
      date: "Date (DD/MM/YYYY)",
      datePicker: "Date picker",
      chooseDate: "Choose a date",
      selectedCivilDate: "Selected civil date",
      selectLocation: "Search city or place",
      coordinates: "Enter Coordinates",
      latitude: "Latitude",
      longitude: "Longitude",
      timezone: "Timezone",
      optionalLocation: "Optional Location Label",
      calculatePanchang: "Calculate Panchang",
      locationBasis: "Location basis",
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
      begins: "Begins",
      ends: "Ends",
      ritualWindows: "Ritual windows",
      ritualWindow: "Ritual Window",
      annualCalendar: "Annual Hindu Festival Calendar",
      yearAtGlance: "Hindu Year Overview",
      yearOverviewNote: "Lunar-month overview from the governed Varanasi annual book.",
      observanceYear: "Festival & Observance Year",
      observanceDescription: "Recurring Hindu lunar/tithi observances from the governed public projection. This is not an all-festival, all-faith or national-holiday calendar.",
      governedRecords: "governed records",
      varanasiBasis: "Varanasi canonical basis",
      emptyObservanceMonth: "No governed observance in this filter.",
      previousPage: "Previous Page",
      nextPage: "Next Page",
      reflectKicker: "Reflect",
      reflectTitle: "Your Star Reflection",
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
      birthLatitude: "Birth Latitude",
      birthLongitude: "Birth Longitude",
      birthTimezone: "Birth Timezone",
      optionalBirthPlace: "Optional Birth Place Label",
      generateReflection: "Generate Reflection",
      todaysReflection: "Today's Reflection",
      reflectiveTheme: "Reflective Theme",
      selfInquiry: "Self-Inquiry",
      groundingPractice: "Grounding Practice",
      limitation: "Limitation",
      basisDetermined: "How this basis was determined",
      reflectionUnavailable: "Governed Hindi reflection text is not yet available; the reflective result remains in the approved available language."
    },
    hi: {
      timeKicker: "समय",
      timeTitle: "आज का पंचांग",
      todaysPanchang: "आज का पंचांग",
      previousDay: "पिछला दिन",
      today: "आज",
      nextDay: "अगला दिन",
      date: "दिनांक (DD/MM/YYYY)",
      datePicker: "दिनांक चयन",
      chooseDate: "दिनांक चुनें",
      selectedCivilDate: "चयनित सिविल दिनांक",
      selectLocation: "शहर या स्थान खोजें",
      coordinates: "निर्देशांक दर्ज करें",
      latitude: "अक्षांश",
      longitude: "देशांतर",
      timezone: "समय क्षेत्र",
      optionalLocation: "वैकल्पिक स्थान नाम",
      calculatePanchang: "पंचांग देखें",
      locationBasis: "स्थान आधार",
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
      begins: "आरंभ",
      ends: "समाप्ति",
      ritualWindows: "अनुष्ठान समय",
      ritualWindow: "अनुष्ठान समय",
      annualCalendar: "वार्षिक हिंदू पर्व कैलेंडर",
      yearAtGlance: "हिन्दू वर्ष अवलोकन",
      yearOverviewNote: "स्वीकृत वाराणसी वार्षिक पुस्तक से चंद्र-मास अवलोकन।",
      observanceYear: "व्रत एवं पर्व वार्षिक पंचांग",
      observanceDescription: "स्वीकृत सार्वजनिक प्रक्षेपण से आवर्ती हिंदू चंद्र/तिथि पर्व। यह सभी त्योहारों, सभी आस्थाओं या राष्ट्रीय अवकाशों का कैलेंडर नहीं है।",
      governedRecords: "स्वीकृत रिकॉर्ड",
      varanasiBasis: "वाराणसी प्रमाणित आधार",
      emptyObservanceMonth: "इस फ़िल्टर में कोई स्वीकृत पर्व नहीं।",
      previousPage: "पिछला पृष्ठ",
      nextPage: "अगला पृष्ठ",
      reflectKicker: "चिंतन",
      reflectTitle: "आपका नक्षत्र चिंतन",
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
      birthLatitude: "जन्म अक्षांश",
      birthLongitude: "जन्म देशांतर",
      birthTimezone: "जन्म समय क्षेत्र",
      optionalBirthPlace: "वैकल्पिक जन्म स्थान नाम",
      generateReflection: "चिंतन देखें",
      todaysReflection: "आज का चिंतन",
      reflectiveTheme: "चिंतन-विषय",
      selfInquiry: "स्व-प्रश्न",
      groundingPractice: "आधार अभ्यास",
      limitation: "सीमा",
      basisDetermined: "यह आधार कैसे निर्धारित हुआ",
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

  function localizeStaticTimeText(text, lang) {
    var original = String(text || "").trim();
    if (!original) return original;
    if (lang !== "hi") return original;
    var pageMatch = original.match(/^Page\s+(\d+)\s+of\s+4$/i);
    if (pageMatch) return "पृष्ठ " + pageMatch[1] + " / 4";
    var direct = {
      "Panchang date": "पंचांग दिनांक",
      "Annual observance book": "वार्षिक पंचांग पुस्तक",
      "Canonical basis: Varanasi / Banaras": "प्रमाणित आधार: वाराणसी / बनारस",
      "Loading the governed Varanasi annual book…": "स्वीकृत वाराणसी वार्षिक पुस्तक लोड हो रही है…",
      "Preparing the Varanasi date basis…": "वाराणसी दिनांक आधार तैयार हो रहा है…",
      "Today in Varanasi": "आज वाराणसी में"
    };
    return direct[original] || localizeValue(original, lang);
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
        ".ag74o-month-slot h4",
        ".ag74o-month-instance strong",
        ".ag74o-month-instance span",
        "#panchang-selection-status",
        "#upcoming-observance-name",
        "#upcoming-observance-note",
        "#upcoming-observance-begins",
        "#upcoming-observance-ends",
        "#upcoming-observance-ritual-window"
      ].join(","),
      lang
    );
  }

  function applyTimeLanguage(lang) {
    var d = LANGUAGE[lang === "hi" ? "hi" : "en"];
    currentTimeLanguage = lang === "hi" ? "hi" : "en";
    var sectionRoot = document.getElementById("time");
    if (sectionRoot) sectionRoot.setAttribute("data-dv2-lang", currentTimeLanguage);
    textNode("#time > .dv2-section__inner > .dv2-section__kicker", d.timeKicker);
    textNode("#time > .dv2-section__inner > h2", d.timeTitle);
    textNode("#panchang-public-heading", d.todaysPanchang);
    textNode("#ag74i-date-heading", d.chooseDate);
    textNode("#panchang-previous-day", d.previousDay);
    textNode("#panchang-today", d.today);
    textNode("#panchang-next-day", d.nextDay);
    textNode("#panchang-calculate", d.calculatePanchang);
    textNode("#dv2-year-glance-button", d.yearAtGlance);
    textNode("#dv2-year-glance-title", d.yearAtGlance);
    textNode("#dv2-year-glance-note", d.yearOverviewNote);
    textNode("#ag74i-book-previous", d.previousPage);
    textNode("#ag74i-book-next", d.nextPage);
    textNode("#ag74i-calendar-book-title", d.annualCalendar);
    textNode("#upcoming-observance-title", d.upcomingObservance);
    textNode("#dv2-panchang-detailed-timings summary", d.detailedTimings);
    textNode("#dv2-panchang-methodology summary", d.howDetermined);
    textNode(".ag74i-book-basis", d.varanasiBasis);
    fieldLabel('label[for="panchang-date-text"]', d.date);
    fieldLabel('label[for="panchang-date-picker"]', d.datePicker);
    fieldLabel('label[for="panchang-place-alias"]', d.selectLocation);
    var placeAlias = document.getElementById("panchang-place-alias");
    if (placeAlias) {
      placeAlias.setAttribute("placeholder", d.selectLocation);
      placeAlias.setAttribute("aria-label", d.selectLocation);
    }
    fieldLabel('label.ag71c-field-label:has(#panchang-latitude)', d.latitude);
    fieldLabel('label.ag71c-field-label:has(#panchang-longitude)', d.longitude);
    fieldLabel('label.ag71c-field-label:has(#panchang-timezone)', d.timezone);
    fieldLabel('label.ag71c-field-label:has(#panchang-coordinate-label)', d.optionalLocation);
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
      request.textContent = currentTimeLanguage === "hi"
        ? "इनपुट देखें, फिर पंचांग देखें दबाएँ। इनपुट बदलने से अंतिम प्रतिबद्ध परिणाम अपने-आप नहीं बदलेगा।"
        : "Review the inputs, then press Calculate Panchang. Changing inputs will not replace the last committed result.";
    }
    localizePanchangVisibleText(currentTimeLanguage);
    syncPanchangReaderPanel(currentTimeLanguage);
    renderYearOverview(currentTimeLanguage);
    renderObservanceYear(currentTimeLanguage);
  }

  function applyReflectLanguage(lang) {
    var d = LANGUAGE[lang === "hi" ? "hi" : "en"];
    currentReflectLanguage = lang === "hi" ? "hi" : "en";
    var sectionRoot = document.getElementById("reflect");
    if (sectionRoot) sectionRoot.setAttribute("data-dv2-lang", currentReflectLanguage);
    var dob = document.getElementById("star-reflection-dob");
    var note = document.querySelector("[data-ag73a-birth-time-note]");
    textNode("#reflect > .dv2-section__inner > .dv2-section__kicker", d.reflectKicker);
    textNode("#reflect > .dv2-section__inner > h2", d.reflectTitle);
    if (dob) dob.setAttribute("placeholder", d.dob + " (DD/MM/YYYY)");
    textNode('label[for="star-reflection-birth-time"] span', d.birthTime);
    textNode(".ag73a-birth-time-unknown span", d.unknownTime);
    textNode('[data-ag71e-preview-button="star-reflection"]', d.generateReflection);
    textNode("#ag75d-e2-star-place-choice-heading", d.chooseBirthPlace);
    fieldLabel('label.ag71c-field-label:has(#star-birth-latitude)', d.birthLatitude);
    fieldLabel('label.ag71c-field-label:has(#star-birth-longitude)', d.birthLongitude);
    fieldLabel('label.ag71c-field-label:has(#star-birth-timezone)', d.birthTimezone);
    fieldLabel('label.ag71c-field-label:has(#star-birth-coordinate-label)', d.optionalBirthPlace);
    var modes = document.querySelectorAll('[data-ag71c-coordinate-surface="star-reflection"] .ag71c-input-mode label');
    if (modes[0]) modes[0].lastChild.nodeValue = " " + d.selectBirthPlace;
    if (modes[1]) modes[1].lastChild.nodeValue = " " + d.enterBirthCoordinates;
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
    var summary = document.getElementById("ag75d-e2-star-place-summary");
    if (summary) {
      var selected = document.querySelector("[data-ag75d-e2-star-place-value][aria-pressed='true']");
      summary.textContent = selected
        ? d.selectedBirthPlace + ": " + selected.textContent.trim()
        : d.selectedBirthPlaceNone;
    }
    var previewHeading = document.querySelector('[data-ag71e-preview-panel="star-reflection"] h3');
    if (previewHeading && /Reflection input accepted|Today's Star Reflection|आज|चिंतन/i.test(previewHeading.textContent || "")) {
      previewHeading.textContent = d.todaysReflection;
    }
    localizeStarPreviewRows(currentReflectLanguage);
    var unavailable = document.getElementById("dv2-reflect-language-note");
    if (lang === "hi") {
      if (!unavailable) {
        unavailable = document.createElement("p");
        unavailable.id = "dv2-reflect-language-note";
        unavailable.className = "dv2-section-note";
        var card = document.querySelector('[data-drishvara-v2-reflect-card="true"]');
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
      "Reflective theme": "चिंतन-विषय",
      "Self-inquiry prompt": "स्व-प्रश्न",
      "Grounding practice": "आधार अभ्यास",
      "Limitation notice": "सीमा"
    };
    grid.querySelectorAll(".ag71e-preview-row strong").forEach(function (label) {
      var key = label.getAttribute("data-dv2-original-label") || label.textContent.trim();
      label.setAttribute("data-dv2-original-label", key);
      if (lang === "hi" && labels[key]) label.textContent = labels[key];
      else label.textContent = key;
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
        summary.textContent = "No approved public match. Use coordinates for unavailable places.";
      }
    });
  }

  function bindSectionLanguages() {
    var time = document.getElementById("time");
    var reflect = document.getElementById("reflect");
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
      time.addEventListener("click", function (event) {
        var button = event.target.closest("[data-dv2-language-choice]");
        if (button) applyTimeLanguage(button.getAttribute("data-dv2-language-choice"));
      });
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
      reflect.addEventListener("click", function (event) {
        var button = event.target.closest("[data-dv2-language-choice]");
        if (button) applyReflectLanguage(button.getAttribute("data-dv2-language-choice"));
      });
      applyReflectLanguage("en");
    }
  }

  function updateLocationCount() {
    if (!Location) return;
    Location.loadApprovedLocations()
      .then(function (records) {
        var node = document.getElementById("dv2-context-time-kicker");
        if (node) node.textContent = "Time · " + records[0].displayLabel;
      })
      .catch(function () {});
  }

  function syncTimeContextFromRuntime() {
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
  }

  function bindRuntimeContextRefresh() {
    document.addEventListener("click", function (event) {
      if (
        event.target.closest("#panchang-calculate") ||
        event.target.closest("#panchang-previous-day") ||
        event.target.closest("#panchang-next-day") ||
        event.target.closest("#panchang-today")
      ) {
        window.requestAnimationFrame(syncTimeContextFromRuntime);
      }
      if (event.target.closest('[data-ag71e-preview-button="star-reflection"]')) {
        window.requestAnimationFrame(function () {
          localizeStarPreviewRows(currentReflectLanguage);
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
