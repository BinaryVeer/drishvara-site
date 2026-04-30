(function () {
  const STORAGE_KEY = "drishvara_site_language";

  const dictionary = {
    hi: {
      "Home": "घर",
      "About": "परिचय",
      "Insights": "इनसाइट्स",
      "Contact": "संपर्क",
      "Drishvara": "दृश्वर",
      "Vision. Reflection. Insight.": "दृष्टि। चिंतन। अंतर्दृष्टि।",
      "Vision broad, reflection deep.": "दृष्टि व्यापक, चिंतन गहरा।",
      "Sports Desk": "खेल डेस्क",
      "Word of the Day": "आज का शब्द",
      "Today’s Vedic Guidance": "आज का वैदिक संकेत",
      "Today’s Drishvara Route": "आज का दृश्वर मार्ग",
      "One homepage, three movements": "एक होमपेज, तीन चरण",
      "From signal to reading to reflection": "संकेत से पढ़न तक और फिर चिंतन तक",
      "First Light": "पहली रोशनी",
      "Reading Surface": "पठन सतह",
      "Reflection Layer": "चिंतन परत",
      "Discover": "खोजें",
      "Read": "पढ़ें",
      "Reflect": "चिंतन करें",
      "Latest Reads": "नवीनतम लेख",
      "Latest published reads": "नवीनतम प्रकाशित लेख",
      "Indexed Reads": "अनुक्रमित लेख",
      "Published HTML": "प्रकाशित HTML",
      "Themes": "विषय",
      "Archive Dates": "संग्रह तिथियाँ",
      "Topic Map": "विषय मानचित्र",
      "Open a Day": "एक दिन खोलें",
      "Open read": "लेख खोलें",
      "Direct file": "प्रत्यक्ष फ़ाइल",
      "Article reader": "लेख पाठक",
      "Published themes": "प्रकाशित विषय",
      "All": "सभी",
      "Published": "प्रकाशित",
      "Pipeline": "पाइपलाइन",
      "Search reads by title, summary, theme, date, or path...": "शीर्षक, सार, विषय, तिथि या पथ से खोजें...",
      "Public Programmes": "लोक कार्यक्रम",
      "Spirituality": "आध्यात्मिकता",
      "World Affairs": "विश्व विषय",
      "Media & Society": "मीडिया और समाज",
      "Sports": "खेल",
      "Read now →": "अभी पढ़ें →",
      "Back to Home": "घर वापस जाएँ",
      "Open Insights": "इनसाइट्स खोलें"
    }
  };

  function currentLanguage() {
    return localStorage.getItem(STORAGE_KEY) || "en";
  }

  function setLanguage(lang) {
    localStorage.setItem(STORAGE_KEY, lang || "en");
    applyLanguage(lang || "en");
    renderTopControl(lang || "en");
  }

  function shouldSkipNode(node) {
    const parent = node.parentElement;
    if (!parent) return true;

    const tag = parent.tagName;
    return ["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "SELECT", "OPTION", "CODE", "PRE", "BUTTON"].includes(tag);
  }

  function translateTextNode(node, lang) {
    if (shouldSkipNode(node)) return;

    const original = node.__drishvaraOriginalText || node.nodeValue;
    node.__drishvaraOriginalText = original;

    if (lang === "en") {
      node.nodeValue = original;
      return;
    }

    const trimmed = original.trim();
    if (!trimmed) return;

    const translated = dictionary[lang]?.[trimmed];
    if (!translated) return;

    node.nodeValue = original.replace(trimmed, translated);
  }

  function translatePlaceholders(lang) {
    document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach((el) => {
      const original = el.dataset.drishvaraOriginalPlaceholder || el.getAttribute("placeholder") || "";
      el.dataset.drishvaraOriginalPlaceholder = original;

      if (lang === "en") {
        el.setAttribute("placeholder", original);
        return;
      }

      const translated = dictionary[lang]?.[original];
      if (translated) el.setAttribute("placeholder", translated);
    });
  }

  function applyLanguage(lang) {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          return shouldSkipNode(node)
            ? NodeFilter.FILTER_REJECT
            : NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((node) => translateTextNode(node, lang));
    translatePlaceholders(lang);

    document.documentElement.setAttribute("lang", lang === "hi" ? "hi" : "en");
  }

  function findLanguageHost() {
    const selectors = [
      "[data-site-language-control]",
      "[data-language-control]",
      ".language-pill",
      ".lang-pill",
      ".language-toggle",
      ".lang-toggle",
      ".language-switch",
      ".top-language",
      ".nav-language"
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) return el;
    }

    const candidates = Array.from(document.querySelectorAll("a, button, div, span, li"));
    return candidates.find((el) => {
      const text = (el.textContent || "").replace(/\s+/g, " ").trim();
      return /EN\s*[|/]\s*(हिंदी|हिन्दी|Hindi)/i.test(text);
    });
  }

  function createFallbackHost() {
    let host = document.querySelector("[data-site-language-control]");
    if (host) return host;

    host = document.createElement("div");
    host.setAttribute("data-site-language-control", "true");
    document.body.appendChild(host);
    return host;
  }

  function ensureStyle() {
    if (document.getElementById("drishvara-native-language-style")) return;

    const style = document.createElement("style");
    style.id = "drishvara-native-language-style";
    style.textContent = `
      .drishvara-lang-control {
        display: inline-flex !important;
        align-items: center;
        gap: 6px;
        padding: 8px 12px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.10);
        background: rgba(255,255,255,0.045);
        color: #d7deea;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 0.92rem;
        white-space: nowrap;
        cursor: pointer;
        user-select: none;
      }

      body > .drishvara-lang-control {
        position: fixed;
        top: 16px;
        right: 18px;
        z-index: 9999;
        background: rgba(8, 20, 45, 0.92);
        backdrop-filter: blur(10px);
      }

      .drishvara-lang-control button {
        appearance: none;
        border: 0;
        background: transparent;
        color: inherit;
        cursor: pointer !important;
        padding: 0;
        font: inherit;
      }

      .drishvara-lang-control button:hover {
        color: #c9a24a;
      }

      .drishvara-lang-control button.active {
        color: #c9a24a;
        font-weight: 700;
      }

      .drishvara-lang-control .sep {
        color: rgba(215,222,234,0.55);
      }
    `;
    document.head.appendChild(style);
  }

  function renderTopControl(lang) {
    ensureStyle();

    const host = findLanguageHost() || createFallbackHost();
    if (!host) return;

    host.classList.add("drishvara-lang-control");
    host.setAttribute("data-site-language-control", "true");
    host.innerHTML = `
      <button type="button" data-drishvara-lang="en" class="${lang === "en" ? "active" : ""}">EN</button>
      <span class="sep">|</span>
      <button type="button" data-drishvara-lang="hi" class="${lang === "hi" ? "active" : ""}">हिन्दी</button>
    `;

    host.querySelectorAll("[data-drishvara-lang]").forEach((button) => {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        setLanguage(button.dataset.drishvaraLang || "en");
      });
    });
  }

  function boot() {
    const lang = currentLanguage();
    renderTopControl(lang);
    applyLanguage(lang);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
