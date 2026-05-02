(() => {
  const VERSION = "2026.05.02-h01";
  const isHomepage = () => {
    const path = window.location.pathname || "/";
    return path === "/" || path.endsWith("/index.html") || path.endsWith("/");
  };

  if (!isHomepage()) return;

  const languageKeys = [
    "drishvara_language",
    "drishvara-language",
    "drishvara.lang",
    "siteLanguage",
    "selectedLanguage"
  ];

  const pairs = [
    ["Home", "घर"],
    ["About", "परिचय"],
    ["Insights", "इनसाइट्स"],
    ["Submissions", "सबमिशन"],
    ["Dashboard", "डैशबोर्ड"],
    ["Contact", "संपर्क"],
    ["Login", "लॉगिन"],

    ["Vision. Reflection. Insight.", "दृष्टि। चिंतन। अंतर्दृष्टि।"],
    ["Vision broad, reflection deep.", "दृष्टि विस्तृत, मनन गंभीर।"],

    ["UI STEP 3 INTEGRATION", "यूआई चरण 3 एकीकरण"],
    ["From signal to reading to reflection", "संकेत से पठन और फिर चिंतन तक"],
    ["Drishvara now moves as one daily surface: first notice the signals, then enter the main reads, then close with reflection, observance, and personal meaning.", "द्रिश्वरा अब एक दैनिक सतह की तरह चलता है: पहले संकेत देखें, फिर मुख्य पठन में जाएँ, और अंत में चिंतन, अवलोकन और व्यक्तिगत अर्थ के साथ पूरा करें."],
    ["First Light", "प्रथम संकेत"],
    ["A quick scan of national and regional signals.", "राष्ट्रीय और क्षेत्रीय संकेतों की त्वरित झलक."],
    ["Reading Surface", "पठन सतह"],
    ["Featured reads and the daily guide create the main editorial path.", "चयनित पठन और दैनिक मार्गदर्शिका मुख्य संपादकीय पथ बनाते हैं."],
    ["Reflection Layer", "चिंतन परत"],
    ["Founder notebook, observance, and psychometric modules create return value.", "संस्थापक नोटबुक, अवलोकन और मनोमितीय मॉड्यूल वापसी मूल्य बनाते हैं."],

    ["Sports Desk", "खेल डेस्क"],
    ["Major world and Indian tournament highlights, live events, standings snapshots, and selected sports intelligence.", "प्रमुख वैश्विक और भारतीय टूर्नामेंट संकेत, लाइव इवेंट, स्टैंडिंग झलक और चयनित खेल जानकारी."],
    ["Live Events", "लाइव इवेंट"],
    ["Tournament Watch", "टूर्नामेंट वॉच"],
    ["Major Updates", "मुख्य अपडेट"],
    ["Loading", "लोड हो रहा है"],
    ["Fetching live events...", "लाइव इवेंट लाए जा रहे हैं..."],
    ["Fetching tournament cards...", "टूर्नामेंट कार्ड लाए जा रहे हैं..."],
    ["Fetching major updates...", "मुख्य अपडेट लाए जा रहे हैं..."],
    ["Please wait a moment.", "कृपया कुछ क्षण प्रतीक्षा करें."],
    ["Reserved space for future ads / sponsored insight / partner slot", "भविष्य के विज्ञापन / प्रायोजित अंतर्दृष्टि / साझेदार स्लॉट के लिए आरक्षित स्थान"],

    ["TODAY’S DRISHVARA ROUTE", "आज का द्रिश्वरा मार्ग"],
    ["One homepage, three movements", "एक होमपेज, तीन गतियाँ"],
    ["This layer binds the homepage into a daily ritual: discover what changed, read what matters, and preserve what deserves return.", "यह परत होमपेज को दैनिक अभ्यास में जोड़ती है: क्या बदला उसे देखें, जो महत्वपूर्ण है उसे पढ़ें, और जिसे लौटकर देखना चाहिए उसे सुरक्षित रखें."],
    ["Discover", "खोजें"],
    ["Read", "पढ़ें"],
    ["Reflect", "चिंतन करें"],
    ["First Light and daily signal cards surface what is worth noticing.", "प्रथम संकेत और दैनिक सिग्नल कार्ड ध्यान देने योग्य बातों को सामने लाते हैं."],
    ["Featured reads and the reading guide give the visitor a clear path.", "चयनित पठन और पठन मार्गदर्शिका आगंतुक को स्पष्ट दिशा देते हैं."],
    ["Founder notebook, observance, and psychometric layer create return value.", "संस्थापक नोटबुक, अवलोकन और मनोमितीय परत वापसी मूल्य बनाते हैं."],

    ["Word of the Day", "आज का शब्द"],
    ["English: Reflection", "अंग्रेज़ी: Reflection"],
    ["Hindi: मनन", "हिन्दी: मनन"],
    ["Sanskrit: मननम्", "संस्कृत: मननम्"],
    ["Meaning: sustained inward consideration", "अर्थ: स्थिर आंतरिक विचार"],

    ["Today’s Vedic Guidance", "आज का वैदिक संकेत"],
    ["Today's Vedic Guidance", "आज का वैदिक संकेत"],
    ["आज का वैदिक संकेत", "आज का वैदिक संकेत"],
    ["वार: शनिवार", "Day: Saturday"],
    ["Day: Saturday", "वार: शनिवार"],
    ["अनुशंसित रंग: नीला / श्याम", "Recommended colour: blue / dark"],
    ["Recommended colour: blue / dark", "अनुशंसित रंग: नीला / श्याम"],
    ["भोजन संकेत: सरल, स्थिर और मिताहार", "Food guidance: simple, steady, and moderate"],
    ["Food guidance: simple, steady, and moderate", "भोजन संकेत: सरल, स्थिर और मिताहार"],
    ["ॐ शनेश्वराय नम:", "ॐ शनैश्चराय नमः"],
    ["ॐ शनैश्चराय नम:", "ॐ शनैश्चराय नमः"],
    ["Today: A day for patience, steadiness, and responsible movement.", "आज: धैर्य, स्थिरता और जिम्मेदार गति का दिन."],
    ["This module should later become rule-based, factual, location-aware, bilingual, and grounded in curated Hindu literature logic.", "यह मॉड्यूल आगे चलकर नियम-आधारित, तथ्यपूर्ण, स्थान-सचेत, द्विभाषी और चयनित हिन्दू साहित्य-तर्क पर आधारित होना चाहिए."],

    ["Panchang & Festival View", "पंचांग और पर्व दृश्य"],
    ["Location-based Panchang", "स्थान-आधारित पंचांग"],
    ["Select a place so the app can later show sunrise, sunset, moonrise, moonset, panchang, and upcoming festivals in both Hindi and English.", "स्थान चुनें ताकि आगे ऐप सूर्योदय, सूर्यास्त, चंद्रोदय, चंद्रास्त, पंचांग और आगामी पर्व हिन्दी और अंग्रेज़ी दोनों में दिखा सके."],
    ["Sunrise", "सूर्योदय"],
    ["Sunset", "सूर्यास्त"],
    ["Moonrise", "चंद्रोदय"],
    ["Moonset", "चंद्रास्त"],
    ["Tithi", "तिथि"],
    ["Nakshatra", "नक्षत्र"],
    ["Seasonal Cycle", "ऋतु चक्र"],

    ["Star Reflection", "नक्षत्र चिंतन"],
    ["What the stars say about you", "आपके बारे में सितारे क्या संकेत देते हैं"],
    ["Enter your name and date of birth for a daily reflective reading.", "दैनिक चिंतनात्मक पठन के लिए अपना नाम और जन्मतिथि दर्ज करें."],
    ["See Today’s Reflection", "आज का चिंतन देखें"],

    ["Browse by Date", "तारीख से देखें"],
    ["Open a Day in Drishvara", "द्रिश्वरा में कोई दिन खोलें"],
    ["Explore 148 indexed reads by date and theme.", "तारीख और विषय के आधार पर 148 अनुक्रमित पठन देखें."],
    ["Archive browsing shell is ready. Live date-wise retrieval will be connected next.", "आर्काइव ब्राउज़िंग ढांचा तैयार है। लाइव तारीख-वार पुनर्प्राप्ति आगे जोड़ी जाएगी."],

    ["Psychometric Assessment", "मनोमितीय आकलन"],
    ["A reflective module for personality, decision style, work energy, and growth signals.", "व्यक्तित्व, निर्णय शैली, कार्य ऊर्जा और विकास संकेतों के लिए चिंतनात्मक मॉड्यूल."],
    ["Coming Soon", "शीघ्र आ रहा है"],

    ["Featured Reads", "चयनित पठन"],
    ["The main reading surface of Drishvara. These are the most important stories to read today.", "द्रिश्वरा की मुख्य पठन सतह। आज पढ़ने योग्य प्रमुख लेख यहाँ हैं."],
    ["Read now →", "अभी पढ़ें →"],
    ["Today’s Reading Guide", "आज की पठन मार्गदर्शिका"],
    ["Start Here Today", "आज यहाँ से शुरू करें"],
    ["A short guided path through the latest indexed Drishvara reads.", "द्रिश्वरा के नवीनतम अनुक्रमित पठन के लिए संक्षिप्त मार्गदर्शित पथ."],
    ["Step 1", "चरण 1"],
    ["Step 2", "चरण 2"],
    ["Step 3", "चरण 3"],
    ["Guide", "मार्गदर्शिका"],
    ["Daily route into Drishvara’s reading surface.", "द्रिश्वरा की पठन सतह में दैनिक मार्ग."],
    ["Indexed Reads", "अनुक्रमित पठन"],
    ["Latest from Drishvara", "द्रिश्वरा से नवीनतम"],
    ["Recently generated and published reads from the Drishvara content pipeline.", "द्रिश्वरा सामग्री पाइपलाइन से हाल में निर्मित और प्रकाशित पठन."],

    ["All Themes", "सभी विषय"],
    ["Grievance Redressal", "शिकायत निवारण"],
    ["Asset Management", "संपत्ति प्रबंधन"],
    ["Shared / General", "साझा / सामान्य"],
    ["Name", "नाम"],
    ["Date of Birth (DD/MM/YYYY)", "जन्मतिथि (DD/MM/YYYY)"],
    ["English", "अंग्रेज़ी"]
  ];

  const toHi = new Map(pairs);
  const toEn = new Map(pairs.map(([en, hi]) => [hi, en]));

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
    for (const key of languageKeys) localStorage.setItem(key, lang);
    document.documentElement.setAttribute("lang", lang === "hi" ? "hi" : "en");
    document.documentElement.dataset.drishvaraLanguage = lang;
  }

  function preserveWhitespace(original, replacement) {
    const prefix = original.match(/^\s*/)?.[0] || "";
    const suffix = original.match(/\s*$/)?.[0] || "";
    return `${prefix}${replacement}${suffix}`;
  }

  function translateText(raw, lang) {
    const trimmed = raw.trim();
    if (!trimmed) return raw;
    const map = lang === "hi" ? toHi : toEn;
    const translated = map.get(trimmed);
    return translated ? preserveWhitespace(raw, translated) : raw;
  }

  function shouldSkipElement(el) {
    if (!el) return true;
    const tag = el.tagName;
    return ["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA"].includes(tag) ||
      el.closest("[data-no-h01-translate]");
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

  function translateFormBits(lang) {
    const attrPairs = [
      ["Name", "नाम"],
      ["Date of Birth (DD/MM/YYYY)", "जन्मतिथि (DD/MM/YYYY)"],
      ["mm/dd/yyyy", "mm/dd/yyyy"]
    ];

    for (const el of document.querySelectorAll("input, textarea")) {
      const current = el.getAttribute("placeholder");
      if (!current) continue;
      const found = attrPairs.find(([en, hi]) => current === en || current === hi);
      if (found) el.setAttribute("placeholder", lang === "hi" ? found[1] : found[0]);
    }

    for (const option of document.querySelectorAll("option")) {
      option.textContent = translateText(option.textContent, lang);
    }
  }

  function markDailyModules(lang) {
    document.body.dataset.h01DailyModulesAudited = "true";

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
      el.dataset.h01DynamicEngine = "not_enabled";
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
    markDailyModules(safeLang);

    window.setTimeout(() => {
      translateNodeText(document.body, safeLang);
      translateFormBits(safeLang);
      markDailyModules(safeLang);
      applying = false;
    }, 120);
  }

  function toggleLanguage() {
    const current = inferLanguage();
    applyHomepageLanguage(current === "hi" ? "en" : "hi");
  }

  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-lang], [data-language], button, a, span");
    if (!target) return;

    const explicit = target.dataset.lang || target.dataset.language;
    const text = (target.textContent || "").trim();

    if (explicit) {
      window.setTimeout(() => applyHomepageLanguage(explicit), 60);
      return;
    }

    if (text.includes("EN") && (text.includes("हिन्दी") || text.includes("हिंदी"))) {
      window.setTimeout(toggleLanguage, 80);
      return;
    }

    if (text === "EN" || text.toLowerCase() === "english") {
      window.setTimeout(() => applyHomepageLanguage("en"), 60);
      return;
    }

    if (text.includes("हिन्दी") || text.includes("हिंदी") || text.toLowerCase().includes("hindi")) {
      window.setTimeout(() => applyHomepageLanguage("hi"), 60);
    }
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
    window.clearTimeout(window.__drishvaraH01Timer);
    window.__drishvaraH01Timer = window.setTimeout(() => applyHomepageLanguage(inferLanguage()), 80);
  });

  window.addEventListener("DOMContentLoaded", () => {
    applyHomepageLanguage(inferLanguage());
    observer.observe(document.body, { childList: true, subtree: true });
  });

  window.DrishvaraHomepageLanguageHotfix = {
    version: VERSION,
    apply: applyHomepageLanguage,
    setLanguage: applyHomepageLanguage,
    inferLanguage,
    dailyModules: "static_scaffold_audited"
  };
})();
