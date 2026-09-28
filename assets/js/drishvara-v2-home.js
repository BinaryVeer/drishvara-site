(function () {
  "use strict";

  if (!/\/index\.html$|\/$/.test(location.pathname)) return;

  var Shell = window.DrishvaraV2Shell;
  var I18n = window.DrishvaraV2I18n;
  var Location = window.DrishvaraV2Location;

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

  function addYearAtGlance() {
    var nav = document.querySelector(".ag74i-book-navigation");
    if (!nav || document.getElementById("dv2-year-glance-button")) return;

    var button = document.createElement("button");
    button.type = "button";
    button.id = "dv2-year-glance-button";
    button.textContent = "Year at a Glance";
    nav.insertBefore(button, nav.firstChild);

    var panel = document.createElement("section");
    panel.className = "dv2-year-glance";
    panel.id = "dv2-year-glance";
    panel.setAttribute("aria-label", "Year at a Glance");
    panel.innerHTML =
      '<h4>Year at a Glance</h4><p class="dv2-section-note">Overview grouped by Gregorian month from the governed Varanasi annual book.</p><div class="dv2-year-glance__grid" id="dv2-year-glance-grid"></div>';
    nav.insertAdjacentElement("afterend", panel);

    fetchJson(
      "data/knowledge-base/panchang-festival/production/ag74n-varanasi-samvat-2083-annual-calendar.json"
    ).then(function (calendar) {
      var grid = document.getElementById("dv2-year-glance-grid");
      if (!grid || !calendar || !Array.isArray(calendar.annual_book.pages)) return;
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
      grid.innerHTML = months
        .map(function (month) {
          return (
            '<div class="dv2-year-month"><strong>' +
            escapeHtml(month.name + " - " + month.kind) +
            "</strong><span>" +
            escapeHtml((month.start || "Start unavailable") + " to " + (month.end || "End unavailable")) +
            "</span></div>"
          );
        })
        .join("");
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
      previousDay: "Previous Day",
      today: "Today",
      nextDay: "Next Day",
      date: "Date (DD/MM/YYYY)",
      datePicker: "Date picker",
      selectLocation: "Search city or place",
      coordinates: "Enter Coordinates",
      latitude: "Latitude",
      longitude: "Longitude",
      timezone: "Timezone",
      optionalLocation: "Optional Location Label",
      calculatePanchang: "Calculate Panchang",
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
      annualCalendar: "Annual Hindu Festival Calendar",
      yearAtGlance: "Year at a Glance",
      previousPage: "Previous Page",
      nextPage: "Next Page",
      dob: "Date of Birth",
      birthTime: "Birth Time",
      unknownTime: "I don’t know exact birth time",
      birthPlace: "Birth Place",
      selectBirthPlace: "Select Birth Place",
      enterBirthCoordinates: "Enter Birth Coordinates",
      birthLatitude: "Birth Latitude",
      birthLongitude: "Birth Longitude",
      birthTimezone: "Birth Timezone",
      optionalBirthPlace: "Optional Birth Place Label",
      generateReflection: "Generate Reflection",
      reflectionUnavailable: "Governed Hindi reflection text is not yet available; the reflective result remains in the approved available language."
    },
    hi: {
      previousDay: "पिछला दिन",
      today: "आज",
      nextDay: "अगला दिन",
      date: "दिनांक (DD/MM/YYYY)",
      datePicker: "दिनांक चयन",
      selectLocation: "शहर या स्थान खोजें",
      coordinates: "निर्देशांक दर्ज करें",
      latitude: "अक्षांश",
      longitude: "देशांतर",
      timezone: "समय क्षेत्र",
      optionalLocation: "वैकल्पिक स्थान नाम",
      calculatePanchang: "पंचांग देखें",
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
      annualCalendar: "वार्षिक हिंदू पर्व कैलेंडर",
      yearAtGlance: "वर्ष एक नज़र में",
      previousPage: "पिछला पृष्ठ",
      nextPage: "अगला पृष्ठ",
      dob: "जन्म तिथि",
      birthTime: "जन्म समय",
      unknownTime: "मुझे सही जन्म समय नहीं पता",
      birthPlace: "जन्म स्थान",
      selectBirthPlace: "जन्म स्थान चुनें",
      enterBirthCoordinates: "जन्म निर्देशांक दर्ज करें",
      birthLatitude: "जन्म अक्षांश",
      birthLongitude: "जन्म देशांतर",
      birthTimezone: "जन्म समय क्षेत्र",
      optionalBirthPlace: "वैकल्पिक जन्म स्थान नाम",
      generateReflection: "चिंतन देखें",
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

  function applyTimeLanguage(lang) {
    var d = LANGUAGE[lang === "hi" ? "hi" : "en"];
    textNode("#panchang-previous-day", d.previousDay);
    textNode("#panchang-today", d.today);
    textNode("#panchang-next-day", d.nextDay);
    textNode("#panchang-calculate", d.calculatePanchang);
    textNode("#dv2-year-glance-button", d.yearAtGlance);
    textNode("#ag74i-book-previous", d.previousPage);
    textNode("#ag74i-book-next", d.nextPage);
    textNode("#ag74i-calendar-book-title", d.annualCalendar);
    textNode("#upcoming-observance-title", d.upcomingObservance);
    fieldLabel('label[for="panchang-date-text"]', d.date);
    fieldLabel('label[for="panchang-date-picker"]', d.datePicker);
    fieldLabel('label[for="panchang-place-alias"]', d.selectLocation);
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
    document.querySelectorAll(".ag74i-observance-window dt").forEach(function (dt) {
      if (/Begins|आरंभ/i.test(dt.textContent)) dt.textContent = d.begins;
      else if (/Ends|समाप्ति/i.test(dt.textContent)) dt.textContent = d.ends;
      else dt.textContent = d.ritualWindows;
    });
  }

  function applyReflectLanguage(lang) {
    var d = LANGUAGE[lang === "hi" ? "hi" : "en"];
    var dob = document.getElementById("star-reflection-dob");
    var note = document.querySelector("[data-ag73a-birth-time-note]");
    if (dob) dob.setAttribute("placeholder", d.dob + " (DD/MM/YYYY)");
    textNode('label[for="star-reflection-birth-time"] span', d.birthTime);
    textNode(".ag73a-birth-time-unknown span", d.unknownTime);
    textNode('[data-ag71e-preview-button="star-reflection"]', d.generateReflection);
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

  function refineRuntimePresentation() {
    textNode("#panchang-public-heading", "Today's Panchang");
    textNode("#ag74i-date-heading", "Choose a date");
    textNode("#ag74i-calendar-book-title", "Annual Hindu Festival Calendar");
    textNode(".ag74i-book-basis", "Varanasi canonical basis");
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
    var starHeading = document.querySelector('[data-drishvara-v2-reflect-card="true"] h2');
    if (starHeading) starHeading.textContent = "Your Star Reflection";
    var starNote = document.querySelector(".star-safety-note");
    if (starNote) starNote.textContent = "A governed reflection from your birth context.";
    var starIntro = starHeading ? starHeading.nextElementSibling : null;
    if (starIntro && starIntro.tagName === "P") {
      starIntro.textContent = "Your birth inputs are used only to resolve this reflection and are not stored by Drishvara.";
    }
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
      document.getElementById("dv2-context-sunrise").textContent = sunrise.textContent;
    }
    if (paksha && paksha.textContent && !/Calculating|Awaiting/i.test(paksha.textContent)) {
      document.getElementById("dv2-context-paksha").textContent = paksha.textContent;
    }
    if (
      nakshatra &&
      nakshatra.textContent &&
      !/Calculating|Awaiting/i.test(nakshatra.textContent)
    ) {
      document.getElementById("dv2-context-nakshatra").textContent =
        nakshatra.textContent;
    }
    if (observance && observance.textContent && !/No governed/i.test(observance.textContent)) {
      document.getElementById("dv2-context-observance").textContent = observance.textContent;
    }
    if (status && sunrise && !/Calculating|Awaiting/i.test(sunrise.textContent || "")) {
      status.textContent = "Today’s temporal context is ready.";
    }
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
