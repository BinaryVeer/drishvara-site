(() => {
  const VERSION = "2026.05.02-h02";
  const BRAND_EN = "Drishvara";
  const BRAND_HI = "द्रिश्वारा";
  const BAD_BRAND_HI = new Set(["दृशर", "द्रिश्वर", "द्रिष्वरा"]);

  const isHomepage = () => {
    const path = window.location.pathname || "/";
    return path === "/" || path.endsWith("/") || path.endsWith("/index.html");
  };

  if (!isHomepage()) return;

  const languageKeys = [
    "drishvara_language",
    "drishvara-language",
    "drishvara.lang",
    "siteLanguage",
    "selectedLanguage",
    "language",
    "lang",
    "drishvaraLang",
    "drishvara_language_choice"
  ];

  const enToHiPairs = [
    [BRAND_EN, BRAND_HI],
    ["Home", "घर"],
    ["About", "परिचय"],
    ["Insights", "इनसाइट्स"],
    ["Submissions", "सबमिशन"],
    ["Dashboard", "डैशबोर्ड"],
    ["Contact", "संपर्क"],
    ["Login", "लॉगिन"],
    ["Vision. Reflection. Insight.", "दृष्टि। चिंतन। अंतर्दृष्टि।"],
    ["Vision broad, reflection deep.", "दृष्टि व्यापक, चिंतन गहरा।"],
    ["From signal to reading to reflection", "संकेत से पठन और फिर चिंतन तक"],
    ["First Light", "प्रथम संकेत"],
    ["Reading Surface", "पठन सतह"],
    ["Reflection Layer", "चिंतन परत"],
    ["Sports Desk", "खेल डेस्क"],
    ["Live Events", "लाइव इवेंट"],
    ["Tournament Watch", "टूर्नामेंट वॉच"],
    ["Major Updates", "मुख्य अपडेट"],
    ["Loading", "लोड हो रहा है"],
    ["Fetching live events...", "लाइव इवेंट लाए जा रहे हैं..."],
    ["Fetching tournament cards...", "टूर्नामेंट कार्ड लाए जा रहे हैं..."],
    ["Fetching major updates...", "मुख्य अपडेट लाए जा रहे हैं..."],
    ["Please wait a moment.", "कृपया कुछ क्षण प्रतीक्षा करें."],
    ["TODAY’S DRISHVARA ROUTE", "आज का द्रिश्वारा मार्ग"],
    ["One homepage, three movements", "एक होमपेज, तीन गतियाँ"],
    ["Discover", "खोजें"],
    ["Read", "पढ़ें"],
    ["Reflect", "चिंतन करें"],
    ["Word of the Day", "आज का शब्द"],
    ["English: Reflection", "अंग्रेज़ी: चिंतन"],
    ["Hindi: मनन", "हिन्दी: मनन"],
    ["Sanskrit: मननम्", "संस्कृत: मननम्"],
    ["Meaning: sustained inward consideration", "अर्थ: स्थिर आंतरिक विचार"],
    ["Today’s Vedic Guidance", "आज का वैदिक संकेत"],
    ["Today's Vedic Guidance", "आज का वैदिक संकेत"],
    ["Day: Saturday", "वार: शनिवार"],
    ["Recommended colour: blue / dark", "अनुशंसित रंग: नीला / श्याम"],
    ["Food guidance: simple, steady, and moderate", "भोजन संकेत: सरल, स्थिर और मिताहार"],
    ["Today: A day for patience, steadiness, and responsible movement.", "आज: धैर्य, स्थिरता और जिम्मेदार गति का दिन."],
    ["Panchang & Festival View", "पंचांग और पर्व दृश्य"],
    ["Location-based Panchang", "स्थान-आधारित पंचांग"],
    ["Sunrise", "सूर्योदय"],
    ["Sunset", "सूर्यास्त"],
    ["Moonrise", "चंद्रोदय"],
    ["Moonset", "चंद्रास्त"],
    ["Tithi", "तिथि"],
    ["Nakshatra", "नक्षत्र"],
    ["Seasonal Cycle", "ऋतु चक्र"],
    ["Star Reflection", "नक्षत्र चिंतन"],
    ["What the stars say about you", "आपके बारे में सितारे क्या संकेत देते हैं"],
    ["See Today’s Reflection", "आज का चिंतन देखें"],
    ["Browse by Date", "तारीख से देखें"],
    ["Open a Day in Drishvara", "द्रिश्वारा में कोई दिन खोलें"],
    ["Psychometric Assessment", "मनोमितीय आकलन"],
    ["Coming Soon", "शीघ्र आ रहा है"],
    ["Featured Reads", "चयनित पठन"],
    ["Read now →", "अभी पढ़ें →"],
    ["Today’s Reading Guide", "आज की पठन मार्गदर्शिका"],
    ["Start Here Today", "आज यहाँ से शुरू करें"],
    ["Step 1", "चरण 1"],
    ["Step 2", "चरण 2"],
    ["Step 3", "चरण 3"],
    ["Guide", "मार्गदर्शिका"],
    ["Indexed Reads", "अनुक्रमित पठन"],
    ["Latest from Drishvara", "द्रिश्वारा से नवीनतम"],
    ["All Themes", "सभी विषय"],
    ["Grievance Redressal", "शिकायत निवारण"],
    ["Asset Management", "संपत्ति प्रबंधन"],
    ["Shared / General", "साझा / सामान्य"],
    ["Name", "नाम"],
    ["Date of Birth (DD/MM/YYYY)", "जन्मतिथि (DD/MM/YYYY)"],
    ["English", "अंग्रेज़ी"]
  ];

  const enToHi = new Map(enToHiPairs);
  const hiToEn = new Map(enToHiPairs.map(([en, hi]) => [hi, en]));

  for (const bad of BAD_BRAND_HI) hiToEn.set(bad, BRAND_EN);

  const additionalHiToEn = [
    ["दृष्टि चिंतन अंतर्दृष्टि", "Vision. Reflection. Insight."],
    ["दृष्टि व्यापक, चिंतन गहरा।", "Vision broad, reflection deep."],
    ["लाइव खेल", "LIVE SPORTS"],
    ["आज की खेल झलक तैयार की जा रही है", "Today’s sports watch is being prepared"],
    ["स्पोर्ट्स डेस्क खोलें →", "Open Sports Desk →"],
    ["आज का वैदिक संकेत", "Today’s Vedic Guidance"],
    ["आज का शब्द", "Word of the Day"],
    ["अंग्रेज़ी: चिंतन", "English: Reflection"],
    ["हिन्दी: मनन", "Hindi: मनन"],
    ["संस्कृत: मननम्", "Sanskrit: मननम्"],
    ["स्थान-आधारित पंचांग", "Location-based Panchang"],
    ["चयनित पठन", "Featured Reads"],
    ["अभी पढ़ें →", "Read now →"]
  ];

  for (const [hi, en] of additionalHiToEn) hiToEn.set(hi, en);

  function normalizeLang(value) {
    const v = String(value || "").toLowerCase();
    if (v.startsWith("hi") || v.includes("hindi") || v.includes("हिन्दी") || v.includes("हिंदी")) return "hi";
    return "en";
  }

  function getStoredLanguage() {
    for (const key of languageKeys) {
      const value = localStorage.getItem(key);
      if (value) return normalizeLang(value);
    }
    return null;
  }

  function inferLanguage() {
    return getStoredLanguage() || normalizeLang(document.documentElement.getAttribute("lang") || "en");
  }

  function persistLanguage(lang) {
    const safe = normalizeLang(lang);
    for (const key of languageKeys) localStorage.setItem(key, safe);
    document.cookie = `drishvara_language=${safe}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.setAttribute("lang", safe === "hi" ? "hi" : "en");
    document.documentElement.dataset.drishvaraLanguage = safe;
    document.body.dataset.h02LanguageRuntime = safe;
    document.body.dataset.h02Version = VERSION;
  }

  function preserveWhitespace(original, replacement) {
    const prefix = original.match(/^\s*/)?.[0] || "";
    const suffix = original.match(/\s*$/)?.[0] || "";
    return `${prefix}${replacement}${suffix}`;
  }

  function translateText(raw, lang) {
    const trimmed = raw.trim();
    if (!trimmed) return raw;

    if (lang === "hi") {
      if (BAD_BRAND_HI.has(trimmed)) return preserveWhitespace(raw, BRAND_HI);
      const hi = enToHi.get(trimmed);
      return hi ? preserveWhitespace(raw, hi) : raw;
    }

    const en = hiToEn.get(trimmed);
    return en ? preserveWhitespace(raw, en) : raw;
  }

  function shouldSkipElement(el) {
    if (!el) return true;
    const tag = el.tagName;
    return ["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA"].includes(tag) ||
      el.closest("[data-no-h01-translate], [data-no-h02-translate]");
  }

  function translateNodeText(root, lang) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (shouldSkipElement(node.parentElement)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    for (const node of nodes) {
      node.nodeValue = translateText(node.nodeValue, lang);
    }
  }

  function canonicalizeBrand(lang) {
    const desired = lang === "hi" ? BRAND_HI : BRAND_EN;
    const wrong = lang === "hi" ? [BRAND_EN, ...BAD_BRAND_HI] : [BRAND_HI, ...BAD_BRAND_HI];

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
      const trimmed = node.nodeValue.trim();
      if (wrong.includes(trimmed)) {
        node.nodeValue = preserveWhitespace(node.nodeValue, desired);
      }
    }
  }

  function translateFormBits(lang) {
    const placeholders = [
      ["Name", "नाम"],
      ["Date of Birth (DD/MM/YYYY)", "जन्मतिथि (DD/MM/YYYY)"]
    ];

    for (const el of document.querySelectorAll("input, textarea")) {
      const current = el.getAttribute("placeholder");
      if (!current) continue;
      const found = placeholders.find(([en, hi]) => current === en || current === hi);
      if (found) el.setAttribute("placeholder", lang === "hi" ? found[1] : found[0]);
    }

    for (const option of document.querySelectorAll("option")) {
      option.textContent = translateText(option.textContent, lang);
    }
  }

  function markDailyModules(lang) {
    document.body.dataset.h01DailyModulesAudited = "true";
    document.body.dataset.h02DailyModulesAudited = "true";

    const candidates = [...document.querySelectorAll("section, article, aside, div")].filter((el) => {
      const t = el.textContent || "";
      return t.includes("Today’s Vedic Guidance") ||
        t.includes("Today's Vedic Guidance") ||
        t.includes("आज का वैदिक संकेत") ||
        t.includes("Location-based Panchang") ||
        t.includes("स्थान-आधारित पंचांग");
    });

    for (const el of candidates.slice(0, 12)) {
      el.dataset.h01DailyModuleState = "static_scaffold_audited";
      el.dataset.h02DailyModuleState = "static_scaffold_audited";
      el.dataset.h02DynamicEngine = "not_enabled";
    }

    document.body.dataset.h01LanguageRuntime = lang;
    document.body.dataset.h01Version = VERSION;
  }

  let applying = false;

  function applyHomepageLanguage(lang = inferLanguage()) {
    if (applying) return;
    applying = true;

    const safeLang = normalizeLang(lang);
    persistLanguage(safeLang);

    translateNodeText(document.body, safeLang);
    translateFormBits(safeLang);
    canonicalizeBrand(safeLang);
    markDailyModules(safeLang);

    window.setTimeout(() => {
      translateNodeText(document.body, safeLang);
      translateFormBits(safeLang);
      canonicalizeBrand(safeLang);
      markDailyModules(safeLang);
      applying = false;
    }, 120);
  }

  function desiredLangFromToggleText(text) {
    const current = inferLanguage();
    const t = String(text || "").trim();

    if (t.includes("EN") && (t.includes("हिन्दी") || t.includes("हिंदी"))) {
      return current === "hi" ? "en" : "hi";
    }

    if (t === "EN" || t.toLowerCase() === "english") return "en";
    if (t.includes("हिन्दी") || t.includes("हिंदी") || t.toLowerCase().includes("hindi")) return "hi";

    return null;
  }

  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-lang], [data-language], button, a, span");
    if (!target) return;

    const explicit = target.dataset.lang || target.dataset.language;
    const text = target.textContent || "";
    const desired = explicit ? normalizeLang(explicit) : desiredLangFromToggleText(text);

    if (!desired) return;

    window.setTimeout(() => applyHomepageLanguage(desired), 40);
    window.setTimeout(() => applyHomepageLanguage(desired), 180);
    window.setTimeout(() => applyHomepageLanguage(desired), 420);
  }, true);

  window.addEventListener("storage", (event) => {
    if (languageKeys.includes(event.key)) applyHomepageLanguage(event.newValue);
  });

  window.addEventListener("drishvara:language-change", (event) => {
    applyHomepageLanguage(event.detail?.language || event.detail?.lang || inferLanguage());
  });

  document.addEventListener("drishvara:language-change", (event) => {
    applyHomepageLanguage(event.detail?.language || event.detail?.lang || inferLanguage());
  });

  const observer = new MutationObserver(() => {
    window.clearTimeout(window.__drishvaraH02Timer);
    window.__drishvaraH02Timer = window.setTimeout(() => applyHomepageLanguage(inferLanguage()), 80);
  });

  window.addEventListener("DOMContentLoaded", () => {
    applyHomepageLanguage(inferLanguage());
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  });

  window.DrishvaraHomepageLanguageHotfix = {
    version: VERSION,
    apply: applyHomepageLanguage,
    setLanguage: applyHomepageLanguage,
    inferLanguage,
    brand: { en: BRAND_EN, hi: BRAND_HI },
    dailyModules: "static_scaffold_audited"
  };
})();
