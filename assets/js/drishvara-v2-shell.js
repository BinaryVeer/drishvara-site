(function () {
  "use strict";

  var articleIndexPromise = null;
  var lastFocus = null;

  var WORLDS = [
    ["today", "Today", "First Light and current intelligence."],
    ["read", "Read", "Featured Reads and public articles."],
    ["explore", "Explore", "Topic pathways across public knowledge."],
    ["knowledge", "Knowledge", "Series, ideas and deeper context."],
    ["time", "Time", "Panchang, observance and calendar intelligence."],
    ["reflect", "Reflect", "Governed personal reflection."]
  ];

  function rootPrefix() {
    return location.pathname.indexOf("/articles/") !== -1 ? "../../" : "";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function articleHref(item) {
    if (!item) return "article.html";
    if (item.url && String(item.url).indexOf("article.html") !== -1) {
      return item.url;
    }
    if (item.path || item.sourcePath || item.directUrl) {
      return "article.html?path=" +
        encodeURIComponent(item.path || item.sourcePath || item.directUrl);
    }
    return "article.html";
  }

  function publicItems(data) {
    if (!data || typeof data !== "object") return [];
    if (Array.isArray(data.publishedItems)) return data.publishedItems;
    if (Array.isArray(data.publicLatest)) return data.publicLatest;
    return [];
  }

  function onHomePage() {
    return /\/index\.html$|\/$/.test(location.pathname);
  }

  function worldHref(id) {
    return onHomePage() ? "#" + id : rootPrefix() + "index.html#" + id;
  }

  function loadArticleIndex() {
    if (!articleIndexPromise) {
      articleIndexPromise = fetch(rootPrefix() + "data/article-index.json", {
        cache: "no-store"
      })
        .then(function (response) {
          if (!response.ok) throw new Error("Article index unavailable");
          return response.json();
        })
        .catch(function () {
          return { publicLatest: [] };
        });
    }
    return articleIndexPromise;
  }

  function openSearch() {
    var panel = document.getElementById("dv2-search-panel");
    var input = document.getElementById("dv2-search-input");
    if (!panel) return;
    lastFocus = document.activeElement;
    panel.setAttribute("data-open", "true");
    if (input) input.focus();
  }

  function closeSearch() {
    var panel = document.getElementById("dv2-search-panel");
    if (!panel) return;
    panel.setAttribute("data-open", "false");
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  function openMenu() {
    var menu = document.getElementById("dv2-mobile-menu");
    if (!menu) return;
    lastFocus = document.activeElement;
    menu.setAttribute("data-open", "true");
    var first = menu.querySelector("a,button");
    if (first) first.focus();
  }

  function closeMenu() {
    var menu = document.getElementById("dv2-mobile-menu");
    if (!menu) return;
    menu.setAttribute("data-open", "false");
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  function renderSearchResults(query) {
    var results = document.getElementById("dv2-search-results");
    if (!results) return;
    var q = String(query || "").trim().toLowerCase();

    if (!q) {
      results.innerHTML =
        '<div class="dv2-search-result"><span>Search public Drishvara articles by title, topic or summary.</span></div>';
      return;
    }

    loadArticleIndex().then(function (data) {
      var matches = publicItems(data)
        .filter(function (item) {
          var text = [
            item.title,
            item.summary,
            item.tag,
            item.source,
            item.date
          ].join(" ").toLowerCase();
          return text.indexOf(q) !== -1;
        })
        .slice(0, 8);

      if (!matches.length) {
        results.innerHTML =
          '<div class="dv2-search-result"><span>No public article matched this search.</span></div>';
        return;
      }

      results.innerHTML = matches
        .map(function (item) {
          return (
            '<a class="dv2-search-result" href="' +
            escapeHtml(articleHref(item)) +
            '"><strong>' +
            escapeHtml(item.title || "Drishvara read") +
            "</strong><span>" +
            escapeHtml((item.tag || "Read") + " - " + (item.summary || "")) +
            "</span></a>"
          );
        })
        .join("");
    });
  }

  function markActive(sectionId) {
    document.querySelectorAll(".dv2-nav a").forEach(function (link) {
      var active = link.getAttribute("href") === "#" + sectionId;
      if (active) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }

  function bindActiveSections() {
    if (!("IntersectionObserver" in window)) return;
    var sections = Array.prototype.slice.call(
      document.querySelectorAll("[data-dv2-world]")
    );
    if (!sections.length) return;
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) markActive(entry.target.id);
        });
      },
      { rootMargin: "-42% 0px -52% 0px", threshold: 0.01 }
    );
    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  function bindHeader() {
    var header = document.querySelector(".dv2-header");
    if (!header || header.getAttribute("data-bound") === "true") return;
    header.setAttribute("data-bound", "true");

    header.addEventListener("click", function (event) {
      var search = event.target.closest("[data-dv2-open-search]");
      var menu = event.target.closest("[data-dv2-open-menu]");
      if (search) {
        event.preventDefault();
        openSearch();
      }
      if (menu) {
        event.preventDefault();
        openMenu();
      }
    });

    var input = document.getElementById("dv2-search-input");
    if (input) {
      input.addEventListener("input", function () {
        renderSearchResults(input.value);
      });
    }

    document.addEventListener("click", function (event) {
      var searchPanel = document.getElementById("dv2-search-panel");
      var menuPanel = document.getElementById("dv2-mobile-menu");
      if (
        searchPanel &&
        searchPanel.getAttribute("data-open") === "true" &&
        !event.target.closest("#dv2-search-panel") &&
        !event.target.closest("[data-dv2-open-search]")
      ) {
        closeSearch();
      }
      if (
        menuPanel &&
        menuPanel.getAttribute("data-open") === "true" &&
        !event.target.closest("#dv2-mobile-menu") &&
        !event.target.closest("[data-dv2-open-menu]")
      ) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeSearch();
        closeMenu();
      }
    });

    window.addEventListener(
      "scroll",
      function () {
        header.setAttribute("data-compact", window.scrollY > 22 ? "true" : "false");
      },
      { passive: true }
    );

    bindActiveSections();
  }

  function ensureHeader(active) {
    document.documentElement.setAttribute("data-drishvara-v2", "active");
    document.body.classList.add("drishvara-v2-active");

    var existing = document.querySelector(".dv2-header");
    if (existing) {
      bindHeader();
      return existing;
    }

    var nav = WORLDS.map(function (item) {
      var current = item[0] === active ? ' aria-current="true"' : "";
      return (
        '<a href="' +
        worldHref(item[0]) +
        '"' +
        current +
        ">" +
        item[1] +
        "</a>"
      );
    }).join("");

    var menuLinks = [
      '<a href="login.html"><strong>Join</strong><span>Account access is prepared; no profile data is collected here.</span></a>',
      '<a href="login.html"><strong>Sign in</strong><span>Use the existing account route when authentication is enabled.</span></a>'
    ]
      .concat(
        WORLDS.map(function (item) {
          return (
            '<a href="' +
            worldHref(item[0]) +
            '"><strong>' +
            item[1] +
            "</strong><span>" +
            item[2] +
            "</span></a>"
          );
        })
      )
      .concat([
        '<a href="about.html"><strong>About</strong><span>Drishvara, approach and editorial principles.</span></a>',
        '<a href="contact.html"><strong>Contact</strong><span>Reach the Drishvara team.</span></a>',
        '<a href="about.html#methodology"><strong>Methodology</strong><span>Standards, verification and public boundaries.</span></a>',
        '<a href="about.html#privacy"><strong>Privacy</strong><span>Input and storage boundaries.</span></a>'
      ])
      .join("");

    var header = document.createElement("header");
    header.className = "dv2-header";
    header.innerHTML =
      '<div class="dv2-header__inner">' +
      '<a class="dv2-brand" href="index.html" aria-label="Drishvara Home">' +
      '<img src="' +
      rootPrefix() +
      'assets/logo/logo.png" alt="Drishvara Logo"><span>Drishvara</span></a>' +
      '<nav class="dv2-nav" aria-label="Primary navigation">' +
      nav +
      "</nav>" +
      '<div class="dv2-utilities">' +
      '<button class="dv2-icon-button" type="button" data-dv2-open-search aria-label="Search">Search</button>' +
      '<a class="dv2-utility-link" href="about.html">About</a>' +
      '<a class="dv2-utility-link" href="login.html">Sign in</a>' +
      '<a class="dv2-utility-link" data-primary="true" href="login.html">Join</a>' +
      "</div>" +
      '<div class="dv2-mobile-actions">' +
      '<button class="dv2-icon-button" type="button" data-dv2-open-search aria-label="Search">Search</button>' +
      '<button class="dv2-menu-button" type="button" data-dv2-open-menu aria-label="Open menu">Menu</button>' +
      "</div></div>";

    var search = document.createElement("aside");
    search.id = "dv2-search-panel";
    search.className = "dv2-search-panel";
    search.setAttribute("aria-label", "Public article search");
    search.innerHTML =
      '<div class="dv2-search-form">' +
      '<input id="dv2-search-input" type="search" autocomplete="off" placeholder="Search public reads" aria-label="Search public reads">' +
      '<button class="dv2-search-submit" type="button" data-dv2-close-search>Close</button>' +
      "</div>" +
      '<div class="dv2-search-results" id="dv2-search-results"></div>';

    var menu = document.createElement("aside");
    menu.id = "dv2-mobile-menu";
    menu.className = "dv2-mobile-menu";
    menu.setAttribute("aria-label", "Mobile menu");
    menu.innerHTML =
      '<div class="dv2-mobile-menu__head"><strong>Drishvara</strong>' +
      '<button class="dv2-menu-button" type="button" data-dv2-close-menu>Close</button></div>' +
      '<div class="dv2-mobile-menu__list">' +
      menuLinks +
      "</div>";

    document.body.insertBefore(menu, document.body.firstChild);
    document.body.insertBefore(search, document.body.firstChild);
    document.body.insertBefore(header, document.body.firstChild);

    search.addEventListener("click", function (event) {
      if (event.target.closest("[data-dv2-close-search]")) closeSearch();
    });
    menu.addEventListener("click", function (event) {
      if (event.target.closest("[data-dv2-close-menu]")) closeMenu();
      if (event.target.closest("a")) closeMenu();
    });

    renderSearchResults("");
    bindHeader();
    return header;
  }

  window.DrishvaraV2Shell = {
    ensureHeader: ensureHeader,
    loadArticleIndex: loadArticleIndex,
    publicItems: publicItems,
    articleHref: articleHref,
    escapeHtml: escapeHtml,
    bindActiveSections: bindActiveSections
  };
})();
