(function () {
  const STORAGE_KEY = "drishvara_site_language";

  const dictionary = {
    hi: {
      "UI Step 3 Integration": "यूआई चरण 3 एकीकरण",
      "Integrated UI Step 3": "एकीकृत यूआई चरण 3",
      "Drishvara now moves as one daily surface: first notice the signals, then enter the main reads, then close with reflection, observance, and personal meaning.": "दृश्वर अब एक दैनिक सतह के रूप में आगे बढ़ता है: पहले संकेतों को देखें, फिर मुख्य पाठों में प्रवेश करें, और अंत में चिंतन, अवलोकन और व्यक्तिगत अर्थ के साथ समापन करें।",
      "A quick scan of national and regional signals.": "राष्ट्रीय और क्षेत्रीय संकेतों का त्वरित अवलोकन।",
      "Featured reads and the daily guide create the main editorial path.": "विशेष लेख और दैनिक मार्गदर्शिका मुख्य संपादकीय मार्ग बनाते हैं।",
      "Founder notebook, observance, and psychometric modules create return value.": "संस्थापक नोटबुक, अवलोकन और मनोमितीय मॉड्यूल वापसी-मूल्य तैयार करते हैं।",
      "Major world and Indian tournament highlights, live events, standings snapshots, and selected sports intelligence.": "विश्व और भारतीय टूर्नामेंटों की प्रमुख झलकियाँ, लाइव आयोजन, स्थिति-सार और चयनित खेल विश्लेषण।",
      "Live Events": "लाइव आयोजन",
      "Tournament Watch": "टूर्नामेंट निगरानी",
      "Major Updates": "प्रमुख अपडेट",
      "Featured Sports Article": "विशेष खेल लेख",
      "Loading": "लोड हो रहा है",
      "Fetching live events...": "लाइव आयोजनों की जानकारी ली जा रही है...",
      "Fetching tournament cards...": "टूर्नामेंट कार्ड लाए जा रहे हैं...",
      "Fetching major updates...": "प्रमुख अपडेट लाए जा रहे हैं...",
      "Fetching featured sports article...": "विशेष खेल लेख लाया जा रहा है...",
      "Please wait a moment.": "कृपया कुछ क्षण प्रतीक्षा करें।",
      "This layer binds the homepage into a daily ritual: discover what changed, read what matters, and preserve what deserves return.": "यह परत होमपेज को एक दैनिक अभ्यास में बदलती है: क्या बदला है उसे खोजें, जो महत्वपूर्ण है उसे पढ़ें, और जो लौटकर देखने योग्य है उसे संजोएँ।",
      "First Light and daily signal cards surface what is worth noticing.": "पहली रोशनी और दैनिक संकेत कार्ड ध्यान देने योग्य बातों को सामने लाते हैं।",
      "Featured reads and the reading guide give the visitor a clear path.": "विशेष लेख और पठन मार्गदर्शिका पाठक को स्पष्ट दिशा देते हैं।",
      "Founder notebook, observance, and psychometric layer create return value.": "संस्थापक नोटबुक, अवलोकन और मनोमितीय परत वापसी-मूल्य तैयार करते हैं।",
      "English:": "अंग्रेज़ी:",
      "Hindi:": "हिन्दी:",
      "Sanskrit:": "संस्कृत:",
      "Meaning:": "अर्थ:",
      "Today:": "आज:",
      "Location-based Panchang": "स्थान-आधारित पंचांग",
      "Panchang & Festival View": "पंचांग और पर्व दृश्य",
      "Select a place so the app can later show sunrise, sunset, moonrise, moonset, panchang, and upcoming festivals in both Hindi and English.": "स्थान चुनें ताकि आगे ऐप सूर्योदय, सूर्यास्त, चंद्रोदय, चंद्रास्त, पंचांग और आगामी पर्वों को हिन्दी और अंग्रेज़ी दोनों में दिखा सके।",
      "Sunrise": "सूर्योदय",
      "Sunset": "सूर्यास्त",
      "Moonrise": "चंद्रोदय",
      "Moonset": "चंद्रास्त",
      "Tithi": "तिथि",
      "Nakshatra": "नक्षत्र",
      "Yoga": "योग",
      "Paksha": "पक्ष",
      "What the stars say about you": "आपके बारे में सितारे क्या कहते हैं",
      "Enter your name and date of birth for a daily reflective reading.": "दैनिक चिंतन-पाठ के लिए अपना नाम और जन्मतिथि दर्ज करें।",
      "Name": "नाम",
      "Date of Birth (DD/MM/YYYY)": "जन्मतिथि (DD/MM/YYYY)",
      "See Today’s Reflection": "आज का चिंतन देखें",
      "The main reading surface of Drishvara. These are the most important stories to read today.": "दृश्वर की मुख्य पठन-सतह। ये आज पढ़ने योग्य सबसे महत्वपूर्ण लेख हैं।",
      "Reserved space for future ads / sponsored insight / partner slot": "भविष्य के विज्ञापन / प्रायोजित अंतर्दृष्टि / साझेदार स्थान के लिए सुरक्षित स्थान",
      "These should remain visible near the top of the homepage.": "इन्हें होमपेज के ऊपरी भाग के पास दिखाई देना चाहिए।",
      "Drishvara’s strongest surfaces right now are governance, maintenance, and accountability narratives.": "दृश्वर की सबसे मजबूत सतहें अभी शासन, रखरखाव और उत्तरदायित्व से जुड़ी कथाएँ हैं।",
      "A Drishvara read prepared for the daily surface.": "दैनिक सतह के लिए तैयार किया गया दृश्वर लेख।",
      "A Drishvara read prepared for the archive.": "संग्रह के लिए तैयार किया गया दृश्वर लेख।",
      "Untitled Drishvara read": "शीर्षकहीन दृश्वर लेख",
      "Untitled read": "शीर्षकहीन लेख",
      "Drishvara read": "दृश्वर लेख",
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
    const nextLang = lang || "en";
    const previousLang = currentLanguage();

    localStorage.setItem(STORAGE_KEY, nextLang);
    applyLanguage(nextLang);
    renderTopControl(nextLang);

    window.dispatchEvent(new CustomEvent("drishvara:languagechange", {
      detail: { language: nextLang, previousLanguage: previousLang }
    }));

    if (nextLang !== previousLang) {
      window.setTimeout(function () {
        window.location.reload();
      }, 80);
    }
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

  window.DrishvaraLanguage = {
    storageKey: STORAGE_KEY,
    currentLanguage,
    setLanguage,
    select(record, key, fallback = "") {
      if (!record || typeof record !== "object") return fallback;
      const lang = currentLanguage();
      const localizedKey = lang === "hi" ? `${key}_hi` : key;
      return record[localizedKey] || record[key] || fallback;
    }
  };

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
