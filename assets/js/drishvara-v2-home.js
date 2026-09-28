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
      '<h1 class="dv2-live-title">First Light</h1>' +
      '<div class="dv2-live-signal"><div><strong>In Focus</strong><span id="dv2-current-intelligence">Daily public context is loading from approved Drishvara sources.</span></div></div>' +
      "</div>" +
      '<div class="dv2-today-side">' +
      '<div class="dv2-time-strip" aria-label="Today temporal context">' +
      '<div><small>Location</small><strong id="dv2-context-location">Varanasi / Banaras</strong></div>' +
      '<div><small>Sunrise</small><strong id="dv2-context-sunrise">Awaiting governed result</strong></div>' +
      '<div><small>Tithi</small><strong id="dv2-context-tithi">Awaiting governed result</strong></div>' +
      '<div><small>Nakshatra</small><strong id="dv2-context-nakshatra">Awaiting governed result</strong></div>' +
      "</div>" +
      '<div class="dv2-first-light"><p class="dv2-mini-label">Key Developments</p><div class="dv2-signal-list" id="dv2-first-light-list"></div><button class="dv2-button" type="button" id="dv2-first-light-toggle">View all</button></div>' +
      '<article class="dv2-featured" id="dv2-featured-carousel" aria-label="Featured Reads"></article>' +
      "</div></div></section>" +
      section(
        "read",
        "Read",
        "Featured Reads",
        '<p class="dv2-section-note">The public reading surface uses the approved article index and current homepage curation. Editorial metadata is shown only when it exists.</p><div class="dv2-read-grid"><article class="dv2-lead-read" id="dv2-lead-read"></article><div class="dv2-read-list" id="dv2-read-list"></div></div>',
        "dv2-read"
      ) +
      section(
        "explore",
        "Explore",
        "Public Knowledge Pathways",
        '<p class="dv2-section-note">Explore groups relationships already present in the public article index. It does not invent graph links or private scoring.</p><div class="dv2-explore-map"><div class="dv2-topic-cloud" id="dv2-topic-cloud"></div><div class="dv2-topic-list" id="dv2-topic-list"></div></div>',
        "dv2-explore"
      ) +
      section(
        "knowledge",
        "Knowledge",
        "Deep Knowledge",
        '<p class="dv2-section-note">Series and continuity are surfaced as public editorial routes, while internal episode machinery remains protected until explicitly published.</p><div class="dv2-knowledge-grid"><div class="dv2-series-list" id="dv2-series-list"></div><div class="dv2-series-list" id="dv2-knowledge-list"></div></div>',
        "dv2-knowledge"
      ) +
      section(
        "time",
        "Time",
        "Living Time",
        '<div class="dv2-time-layout"><div><p class="dv2-section-note" data-dv2-i18n="timeIntro">Governed Panchang intelligence for date, place, observance and annual festival context. Begins and Ends refer to the approved public window when one exists.</p><div class="dv2-context-panel"><strong data-dv2-i18n="timeBasis">Panchang is calculated by the SUP02 server runtime.</strong><span data-dv2-i18n="timePrivacy">Date and location inputs are not stored by this public surface.</span></div><div class="dv2-language-toggle" aria-label="Time language"><button type="button" data-dv2-language-choice="en" aria-pressed="true">EN</button><button type="button" data-dv2-language-choice="hi" aria-pressed="false">हिंदी</button></div></div><div class="dv2-runtime-host" id="dv2-time-host"></div></div>',
        "dv2-time"
      ) +
      section(
        "reflect",
        "Reflect",
        "Star Reflection",
        '<div class="dv2-reflect-layout"><div><p class="dv2-section-note" data-dv2-i18n="reflectIntro">A governed reflective reading based on DOB, birth time state and an approved location or coordinate basis. It is not a horoscope, prediction or decision guide.</p><div class="dv2-context-panel"><strong data-dv2-i18n="reflectBasis">The result hierarchy is reflection, inquiry, grounding, basis and limitation.</strong><span data-dv2-i18n="reflectPrivacy">Name is not collected. Personal inputs are not persisted.</span></div><div class="dv2-language-toggle" aria-label="Reflect language"><button type="button" data-dv2-language-choice="en" aria-pressed="true">EN</button><button type="button" data-dv2-language-choice="hi" aria-pressed="false">हिंदी</button></div></div><div class="dv2-runtime-host" id="dv2-reflect-host"></div></div>',
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

    list.innerHTML = items
      .map(function (item, index) {
        var state = index === 0 ? "Top Development" : index < 3 ? "In Focus" : "Tracking";
        return (
          '<article class="dv2-signal"><span>' +
          escapeHtml((item.place || "Drishvara") + " - " + state) +
          "</span><strong>" +
          escapeHtml(item.signal || "Public item prepared for review") +
          "</strong><p>" +
          escapeHtml(item.note || "Context will appear when public data is available.") +
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
        '</p><p class="dv2-mini-label">In-depth article</p><div class="dv2-featured__controls"><button class="dv2-button" type="button" data-dv2-feature-prev>Previous</button><button class="dv2-button" type="button" data-dv2-feature-next>Next</button><span>' +
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

  function renderExplore(indexData) {
    var cloud = document.getElementById("dv2-topic-cloud");
    var list = document.getElementById("dv2-topic-list");
    if (!cloud || !list) return;
    var topics = indexData && indexData.publicTopics ? indexData.publicTopics : {};
    var entries = Object.keys(topics)
      .map(function (topic) {
        return [topic, Array.isArray(topics[topic]) ? topics[topic] : []];
      })
      .sort(function (a, b) {
        return b[1].length - a[1].length;
      });

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
    var topics = indexData && indexData.publicTopics ? indexData.publicTopics : {};
    var entries = Object.keys(topics).slice(0, 5);

    series.innerHTML = entries
      .map(function (topic) {
        var count = Array.isArray(topics[topic]) ? topics[topic].length : 0;
        return (
          '<div class="dv2-series-item"><span>Continuity route</span><strong>' +
          escapeHtml(topic) +
          "</strong><span>" +
          count +
          " public reads indexed for return reading.</span></div>"
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

  function bindSectionLanguages() {
    var time = document.getElementById("time");
    var reflect = document.getElementById("reflect");
    if (I18n && time) {
      I18n.bindSectionToggle(time, {
        timeIntro: {
          en: "Governed Panchang intelligence for date, place, observance and annual festival context. Begins and Ends refer to the approved public window when one exists.",
          hi: "तिथि, स्थान, पर्व और वार्षिक कैलेंडर के लिए शासित पंचांग संदर्भ। Begins और Ends स्वीकृत सार्वजनिक समय-सीमा को दिखाते हैं।"
        },
        timeBasis: {
          en: "Panchang is calculated by the SUP02 server runtime.",
          hi: "पंचांग गणना SUP02 सर्वर रनटाइम से होती है।"
        },
        timePrivacy: {
          en: "Date and location inputs are not stored by this public surface.",
          hi: "दिनांक और स्थान इनपुट इस सार्वजनिक सतह पर संग्रहीत नहीं होते।"
        }
      });
    }
    if (I18n && reflect) {
      I18n.bindSectionToggle(reflect, {
        reflectIntro: {
          en: "A governed reflective reading based on DOB, birth time state and an approved location or coordinate basis. It is not a horoscope, prediction or decision guide.",
          hi: "जन्म-तिथि, जन्म-समय स्थिति और स्वीकृत स्थान या निर्देशांक आधार पर शासित चिंतन। यह राशिफल, भविष्यवाणी या निर्णय-मार्गदर्शक नहीं है।"
        },
        reflectBasis: {
          en: "The result hierarchy is reflection, inquiry, grounding, basis and limitation.",
          hi: "परिणाम क्रम है: चिंतन, प्रश्न, आधार-स्थापन, आधार और सीमा।"
        },
        reflectPrivacy: {
          en: "Name is not collected. Personal inputs are not persisted.",
          hi: "नाम नहीं लिया जाता। निजी इनपुट संग्रहीत नहीं होते।"
        }
      });
    }
  }

  function updateLocationCount() {
    if (!Location) return;
    Location.loadApprovedLocations()
      .then(function (records) {
        var node = document.getElementById("dv2-context-location");
        if (node) node.textContent = records[0].displayLabel + " - " + records.length + " governed locations";
      })
      .catch(function () {});
  }

  function syncTimeContextFromRuntime() {
    var sunrise = document.getElementById("panchang-sunrise");
    var tithi = document.getElementById("panchang-tithi");
    var nakshatra = document.getElementById("panchang-nakshatra");
    if (sunrise && sunrise.textContent && !/Calculating|Awaiting/i.test(sunrise.textContent)) {
      document.getElementById("dv2-context-sunrise").textContent = sunrise.textContent;
    }
    if (tithi && tithi.textContent && !/Calculating|Awaiting/i.test(tithi.textContent)) {
      document.getElementById("dv2-context-tithi").textContent = tithi.textContent;
    }
    if (
      nakshatra &&
      nakshatra.textContent &&
      !/Calculating|Awaiting/i.test(nakshatra.textContent)
    ) {
      document.getElementById("dv2-context-nakshatra").textContent =
        nakshatra.textContent;
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
