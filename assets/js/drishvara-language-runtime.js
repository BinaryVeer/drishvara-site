
(() => {
  const VERSION = "2026.05.02-h05";
  const LANG_KEY = "drishvara_language";

  const BRAND_EN = "Drishvara";
  const BRAND_HI = "द्रिश्वारा";
  const BAD_BRANDS = ["दृशर", "द्रिश्वर", "द्रिष्वरा", "दुषर", "दृशारा"];

  const ALIAS_KEYS = [
    "drishvara-language",
    "drishvara.lang",
    "siteLanguage",
    "selectedLanguage",
    "language",
    "lang",
    "drishvaraLang",
    "drishvara_language_choice"
  ];

  const dictionary = {
    "Drishvara": "द्रिश्वारा",
    "Home": "घर",
    "About": "परिचय",
    "Insights": "इनसाइट्स",
    "Submissions": "सबमिशन",
    "Dashboard": "डैशबोर्ड",
    "Contact": "संपर्क",
    "Login": "लॉगिन",
    "Subscriber Dashboard": "सब्सक्राइबर डैशबोर्ड",
    "Your Dashboard": "आपका डैशबोर्ड",
    "Dashboard is being prepared": "डैशबोर्ड तैयार किया जा रहा है",
    "Lucky Number": "शुभ अंक",
    "Lucky number": "शुभ अंक",
    "Lucky Color": "शुभ रंग",
    "Lucky color": "शुभ रंग",
    "Mantra": "मंत्र",
    "Daily Mantra": "दैनिक मंत्र",
    "Profile": "प्रोफाइल",
    "Profile storage": "प्रोफाइल स्टोरेज",
    "No profile storage yet": "अभी प्रोफाइल स्टोरेज नहीं है",


    "Vision. Reflection. Insight.": "दृष्टि। चिंतन। अंतर्दृष्टि।",
    "Vision broad, reflection deep.": "दृष्टि व्यापक, चिंतन गहरा।",
    "dr̥ṣṭiḥ vistīrṇā, mananam gambhīram.": "दृष्टि व्यापक, चिंतन गहरा।",

    "From signal to reading to reflection": "संकेत से पठन और फिर चिंतन तक",
    "Drishvara now moves as one daily surface: first notice the signals, then enter the main reads, then close with reflection, observance, and personal meaning.": "द्रिश्वारा अब एक दैनिक सतह की तरह चलता है: पहले संकेत देखें, फिर मुख्य पठन में जाएँ, और अंत में चिंतन, अवलोकन और व्यक्तिगत अर्थ के साथ पूरा करें।",
    "First Light": "प्रथम संकेत",
    "A quick scan of national and regional signals.": "राष्ट्रीय और क्षेत्रीय संकेतों की त्वरित झलक।",
    "Reading Surface": "पठन सतह",
    "Featured reads and the daily guide create the main editorial path.": "चयनित पठन और दैनिक मार्गदर्शिका मुख्य संपादकीय पथ बनाते हैं।",
    "Reflection Layer": "चिंतन परत",
    "Founder notebook, observance, and psychometric modules create return value.": "संस्थापक नोटबुक, अवलोकन और मनोमितीय मॉड्यूल वापसी मूल्य बनाते हैं।",

    "Sports Desk": "खेल डेस्क",
    "Major world and Indian tournament highlights, live events, standings snapshots, and selected sports intelligence.": "विश्व और भारतीय टूर्नामेंटों की प्रमुख झलकियाँ, लाइव आयोजन, स्थिति-सार और चयनित खेल विश्लेषण।",
    "Live Events": "लाइव इवेंट",
    "Tournament Watch": "टूर्नामेंट वॉच",
    "Major Updates": "मुख्य अपडेट",
    "Loading": "लोड हो रहा है",
    "Fetching live events...": "लाइव इवेंट लाए जा रहे हैं...",
    "Fetching tournament cards...": "टूर्नामेंट कार्ड लाए जा रहे हैं...",
    "Fetching major updates...": "मुख्य अपडेट लाए जा रहे हैं...",
    "Please wait a moment.": "कृपया कुछ क्षण प्रतीक्षा करें।",

    "TODAY’S DRISHVARA ROUTE": "आज का द्रिश्वारा मार्ग",
    "One homepage, three movements": "एक होमपेज, तीन गतियाँ",
    "Discover": "खोजें",
    "Read": "पढ़ें",
    "Reflect": "चिंतन करें",

    "Word of the Day": "आज का शब्द",
    "English: Reflection": "अंग्रेज़ी: Reflection",
    "Hindi: मनन": "हिन्दी: मनन",
    "Sanskrit: मननम्": "संस्कृत: मननम्",
    "Meaning: sustained inward consideration": "अर्थ: स्थिर आंतरिक विचार",

    "Today’s Vedic Guidance": "आज का वैदिक संकेत",
    "Today's Vedic Guidance": "आज का वैदिक संकेत",
    "Day: Saturday": "वार: शनिवार",
    "Recommended colour: blue / dark": "अनुशंसित रंग: नीला / श्याम",
    "Food guidance: simple, steady, and moderate": "भोजन संकेत: सरल, स्थिर और मिताहार",
    "Today: A day for patience, steadiness, and responsible movement.": "आज: धैर्य, स्थिरता और जिम्मेदार गति का दिन।",

    "Panchang & Festival View": "पंचांग और पर्व दृश्य",
    "Location-based Panchang": "स्थान-आधारित पंचांग",
    "Sunrise": "सूर्योदय",
    "Sunset": "सूर्यास्त",
    "Moonrise": "चंद्रोदय",
    "Moonset": "चंद्रास्त",
    "Tithi": "तिथि",
    "Nakshatra": "नक्षत्र",
    "Seasonal Cycle": "ऋतु चक्र",

    "Star Reflection": "नक्षत्र चिंतन",
    "What the stars say about you": "आपके बारे में सितारे क्या संकेत देते हैं",
    "Enter your name and date of birth for a daily reflective reading.": "दैनिक चिंतनात्मक पठन के लिए अपना नाम और जन्मतिथि दर्ज करें।",
    "See Today’s Reflection": "आज का चिंतन देखें",

    "Browse by Date": "तारीख से देखें",
    "Open a Day in Drishvara": "द्रिश्वारा में कोई दिन खोलें",
    "Psychometric Assessment": "मनोमितीय आकलन",
    "Coming Soon": "शीघ्र आ रहा है",

    "Featured Reads": "चयनित पठन",
    "The main reading surface of Drishvara. These are the most important stories to read today.": "द्रिश्वारा की मुख्य पठन सतह। आज पढ़ने योग्य प्रमुख लेख यहाँ हैं।",
    "Read now →": "अभी पढ़ें →",
    "Today’s Reading Guide": "आज की पठन मार्गदर्शिका",
    "Start Here Today": "आज यहाँ से शुरू करें",
    "Step 1": "चरण 1",
    "Step 2": "चरण 2",
    "Step 3": "चरण 3",
    "Guide": "मार्गदर्शिका",
    "Indexed Reads": "अनुक्रमित पठन",
    "Latest from Drishvara": "द्रिश्वारा से नवीनतम",

    "About Drishvara": "द्रिश्वारा के बारे में",
    "A lens, not just a platform.": "यह केवल एक मंच नहीं, बल्कि देखने और समझने की एक दृष्टि है।",
    "What Drishvara stands for": "द्रिश्वारा किस विचार के साथ खड़ा है",
    "Core orientation": "मूल अभिमुखता",
    "Editorial domains": "संपादकीय क्षेत्र",
    "Current stage": "वर्तमान चरण",
    "Clarity over noise": "शोर से अधिक स्पष्टता",
    "Depth over speed": "गति से अधिक गहराई",
    "Reflection over reaction": "प्रतिक्रिया से अधिक चिंतन",
    "Signal over spectacle": "प्रदर्शन से अधिक संकेत",
    "Meaning over information": "सूचना से अधिक अर्थ",

    "Submit to Drishvara": "द्रिश्वारा को भेजें",
    "Submission Form": "सबमिशन फॉर्म",
    "Prepared Review Packet": "तैयार समीक्षा पैकेट",
    "Submission Type": "सबमिशन प्रकार",
    "General Question": "सामान्य प्रश्न",
    "Optional": "वैकल्पिक",
    "Email": "ईमेल",
    "Preferred Language": "पसंदीदा भाषा",
    "Backend intake: disabled · Local preparation only": "बैकएंड इनटेक: बंद · अभी केवल स्थानीय तैयारी",
    "Write with purpose.": "उद्देश्य के साथ लिखें।",
    "Primary contact": "मुख्य संपर्क",
    "What to write about": "किस विषय पर लिखें",
    "Drishvara is being built carefully. Thoughtful mail is always welcome.": "द्रिश्वारा को सावधानीपूर्वक विकसित किया जा रहा है। विचारपूर्ण संदेशों का सदैव स्वागत है।",
    "All Themes": "सभी विषय",
    "Published": "प्रकाशित",
    "Pipeline": "पाइपलाइन",
    "Latest published reads": "नवीनतम प्रकाशित लेख",
    "Theme map": "विषय मानचित्र",
    "View theme": "विषय देखें",
    "Open read": "लेख खोलें",
    "Direct file": "सीधी फाइल",

    "Name": "नाम",
    "Date of Birth (DD/MM/YYYY)": "जन्मतिथि (DD/MM/YYYY)",
    "English": "अंग्रेज़ी",

    // H07 approved static-page bilingual copy
    "This is a controlled intake scaffold.": "यह नियंत्रित इनटेक स्कैफोल्ड है।",
    "Hindi article bodies are shown only when approved Hindi body content exists.": "हिन्दी लेख-शरीर केवल तभी दिखाया जाएगा जब स्वीकृत हिन्दी लेख-शरीर उपलब्ध हो।",
  };

  const reverseDictionary = {};
  for (const [en, hi] of Object.entries(dictionary)) reverseDictionary[hi] = en;
  for (const bad of BAD_BRANDS) reverseDictionary[bad] = BRAND_EN;

  function normalizeLanguage(value) {
    const v = String(value || "").toLowerCase();
    if (v === "hi" || v.startsWith("hi") || v.includes("hindi") || v.includes("हिन्दी") || v.includes("हिंदी")) return "hi";
    return "en";
  }

  function readCookieLanguage() {
    const match = document.cookie.match(/(?:^|;\s*)drishvara_language=([^;]+)/);
    return match ? normalizeLanguage(decodeURIComponent(match[1])) : null;
  }

  function getLanguage() {
    const canonical = localStorage.getItem(LANG_KEY);
    if (canonical) return normalizeLanguage(canonical);

    for (const key of ALIAS_KEYS) {
      const value = localStorage.getItem(key);
      if (value) return normalizeLanguage(value);
    }

    return readCookieLanguage() || normalizeLanguage(document.documentElement.dataset.drishvaraLanguage || document.documentElement.lang || "en");
  }

  function setLanguage(lang) {
    const safe = normalizeLanguage(lang);
    localStorage.setItem(LANG_KEY, safe);
    for (const key of ALIAS_KEYS) localStorage.setItem(key, safe);
    document.cookie = `${LANG_KEY}=${safe}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.lang = safe;
    document.documentElement.dataset.drishvaraLanguage = safe;
    if (document.body) {
      document.body.dataset.drishvaraLanguage = safe;
      document.body.dataset.i18nRuntime = VERSION;
    }
    return safe;
  }

  function preserve(original, replacement) {
    const pre = original.match(/^\s*/)?.[0] || "";
    const post = original.match(/\s*$/)?.[0] || "";
    return `${pre}${replacement}${post}`;
  }

  function replaceBadBrands(text, target) {
    let next = text;
    for (const bad of BAD_BRANDS) next = next.split(bad).join(target);
    return next;
  }

  function baseText(text) {
    const trimmed = text.trim();
    if (!trimmed) return trimmed;
    if (trimmed === BRAND_HI || BAD_BRANDS.includes(trimmed)) return BRAND_EN;
    return reverseDictionary[trimmed] || trimmed;
  }

  function translateText(text, lang) {
    let raw = text;

    if (lang === "hi") {
      raw = replaceBadBrands(raw, BRAND_HI);
      const base = baseText(raw);
      if (!base) return raw;
      if (base === BRAND_EN) return preserve(raw, BRAND_HI);
      return preserve(raw, dictionary[base] || raw.trim());
    }

    raw = replaceBadBrands(raw, BRAND_EN);
    const base = baseText(raw);
    if (!base) return raw;
    return preserve(raw, base);
  }

  function shouldSkipElement(el) {
    if (!el) return true;
    const tag = el.tagName;
    if (["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA"].includes(tag)) return true;
    if (el.closest("[data-no-translate], [data-i18n-skip]")) return true;
    return false;
  }

  function applyTextNodes(lang) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (shouldSkipElement(node.parentElement)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    for (const node of nodes) node.nodeValue = translateText(node.nodeValue, lang);
  }

  function applyAttributes(lang) {
    const attrs = {
      "Name": "नाम",
      "Date of Birth (DD/MM/YYYY)": "जन्मतिथि (DD/MM/YYYY)",
      "Optional": "वैकल्पिक",
      "Search titles, summaries, themes, date or path...": "शीर्षक, सार, विषय, तिथि या पथ खोजें..."
    };

    const reverseAttrs = {};
    for (const [en, hi] of Object.entries(attrs)) reverseAttrs[hi] = en;

    for (const el of document.querySelectorAll("input, textarea")) {
      for (const attr of ["placeholder", "aria-label", "title"]) {
        const value = el.getAttribute(attr);
        if (!value) continue;
        const base = reverseAttrs[value] || value;
        el.setAttribute(attr, lang === "hi" ? (attrs[base] || base) : base);
      }
    }

    for (const option of document.querySelectorAll("option")) {
      option.textContent = translateText(option.textContent, lang);
    }
  }

  function lockBrand(lang) {
    const expected = lang === "hi" ? BRAND_HI : BRAND_EN;
    const wrong = lang === "hi" ? [BRAND_EN, ...BAD_BRANDS] : [BRAND_HI, ...BAD_BRANDS];

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (shouldSkipElement(node.parentElement)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    for (const node of nodes) {
      let value = node.nodeValue;
      for (const item of wrong) value = value.split(item).join(expected);
      node.nodeValue = value;
    }
  }

  let running = false;

  function applyLanguage(lang = getLanguage()) {
    if (!document.body || running) return;
    running = true;

    const safe = setLanguage(lang);
    applyTextNodes(safe);
    applyAttributes(safe);
    lockBrand(safe);

    setTimeout(() => {
      applyTextNodes(safe);
      applyAttributes(safe);
      lockBrand(safe);
      running = false;
    }, 120);
  }


  function findLanguageToggleTarget(start) {
    let el = start;
    let depth = 0;

    while (el && depth < 8 && el !== document.body) {
      if (
        el.matches?.(".lang-toggle, [data-drishvara-lang-toggle='true']")
      ) {
        return el;
      }

      const text = (el.textContent || "").trim();
      const hasEnglish = /\bEN\b|English/i.test(text);
      const hasHindi = /हिन्दी|हिंदी|Hindi/i.test(text);

      if (hasEnglish && hasHindi && text.length <= 40) {
        return el;
      }

      el = el.parentElement;
      depth += 1;
    }

    return null;
  }

  function markLanguageToggleCandidates() {
    for (const el of document.querySelectorAll("button, a, span, div, nav li")) {
      const text = (el.textContent || "").trim();
      const hasEnglish = /\bEN\b|English/i.test(text);
      const hasHindi = /हिन्दी|हिंदी|Hindi/i.test(text);

      if (hasEnglish && hasHindi && text.length <= 40) {
        el.dataset.languageToggle = "true";
        el.setAttribute("role", "button");
        el.setAttribute("tabindex", "0");
        el.style.cursor = "pointer";
      }
    }
  }

  function desiredFromClick(target) {
    if (!target) return null;

    const dataLang = target.dataset?.lang || target.dataset?.language;
    if (dataLang) return normalizeLanguage(dataLang);

    const text = (target.textContent || "").trim();
    const current = getLanguage();

    if (text.includes("EN") && (text.includes("हिन्दी") || text.includes("हिंदी"))) {
      return current === "hi" ? "en" : "hi";
    }

    if (text === "EN" || text.toLowerCase() === "english") return "en";
    if (text.includes("हिन्दी") || text.includes("हिंदी") || text.toLowerCase().includes("hindi")) return "hi";

    return null;
  }

  document.addEventListener("click", (event) => {
    const target = findLanguageToggleTarget(event.target) || event.target.closest("[data-lang], [data-language], button, a, span, div");
    const desired = desiredFromClick(target);
    if (!desired) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    setLanguage(desired);
    window.dispatchEvent(new CustomEvent("drishvara:language-change", {
      detail: { language: desired, source: "drishvara-language-runtime" }
    }));

    setTimeout(() => applyLanguage(desired), 20);
    setTimeout(() => applyLanguage(desired), 180);
    setTimeout(() => applyLanguage(desired), 420);
  }, true);


  // language-toggle-keyboard
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const target = findLanguageToggleTarget(event.target);
    if (!target) return;

    event.preventDefault();
    target.click();
  }, true);

  window.addEventListener("storage", (event) => {
    if (event.key === LANG_KEY || ALIAS_KEYS.includes(event.key)) applyLanguage(event.newValue);
  });

  window.addEventListener("drishvara:language-change", (event) => {
    applyLanguage(event.detail?.language || getLanguage());
  });

  const observer = new MutationObserver(() => {
    clearTimeout(window.__drishvaraUnifiedI18nTimer);
    window.__drishvaraUnifiedI18nTimer = setTimeout(() => applyLanguage(getLanguage()), 90);
  });

  window.addEventListener("pageshow", () => {
    markLanguageToggleCandidates();
    applyLanguage(getLanguage());
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) applyLanguage(getLanguage());
  });

  window.addEventListener("DOMContentLoaded", () => {
    markLanguageToggleCandidates();
    applyLanguage(getLanguage());
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  });

  window.DrishvaraLanguageRuntime = {
    version: VERSION,
    setLanguage: applyLanguage,
    getLanguage,
    brand: { en: BRAND_EN, hi: BRAND_HI },
    badBrandForms: BAD_BRANDS
  };
})();
