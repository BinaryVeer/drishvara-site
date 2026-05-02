(() => {
  const VERSION = "2026.05.02-h03";
  const BRAND_EN = "Drishvara";
  const BRAND_HI = "द्रिश्वारा";
  const BAD_BRAND_HI = ["दृशर", "द्रिश्वर", "द्रिष्वरा"];

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

    ["About Drishvara", "द्रिश्वारा के बारे में"],
    ["A lens, not just a platform.", "एक दृष्टि, केवल मंच नहीं।"],
    ["What Drishvara stands for", "द्रिश्वारा क्या दर्शाता है"],
    ["Core orientation", "मुख्य अभिमुखता"],
    ["Editorial domains", "संपादकीय क्षेत्र"],
    ["Current stage", "वर्तमान चरण"],
    ["Clarity over noise", "शोर से अधिक स्पष्टता"],
    ["Depth over speed", "गति से अधिक गहराई"],
    ["Reflection over reaction", "प्रतिक्रिया से अधिक चिंतन"],
    ["Signal over spectacle", "प्रदर्शन से अधिक संकेत"],
    ["Meaning over information", "सूचना से अधिक अर्थ"],

    ["Submit to Drishvara", "द्रिश्वारा को भेजें"],
    ["Submission Form", "सबमिशन फॉर्म"],
    ["Prepared Review Packet", "तैयार समीक्षा पैकेट"],
    ["Submission Type", "सबमिशन प्रकार"],
    ["General Question", "सामान्य प्रश्न"],
    ["Optional", "वैकल्पिक"],
    ["Email", "ईमेल"],
    ["Preferred Language", "पसंदीदा भाषा"],
    ["Backend intake: disabled · Local preparation only", "बैकएंड इनटेक: बंद · केवल स्थानीय तैयारी"],
    ["This is a controlled intake scaffold.", "यह नियंत्रित इनटेक स्कैफोल्ड है।"],

    ["Vision. Reflection. Insight.", "दृष्टि। चिंतन। अंतर्दृष्टि।"],
    ["Vision broad, reflection deep.", "दृष्टि व्यापक, चिंतन गहरा।"],
    ["From signal to reading to reflection", "संकेत से पठन और फिर चिंतन तक"],
    ["First Light", "प्रथम संकेत"],
    ["Reading Surface", "पठन सतह"],
    ["Reflection Layer", "चिंतन परत"],
    ["Sports Desk", "खेल डेस्क"],
    ["Word of the Day", "आज का शब्द"],
    ["Today’s Vedic Guidance", "आज का वैदिक संकेत"],
    ["Today's Vedic Guidance", "आज का वैदिक संकेत"],
    ["Featured Reads", "चयनित पठन"],
    ["Read now →", "अभी पढ़ें →"],
    ["Panchang & Festival View", "पंचांग और पर्व दृश्य"],
    ["Location-based Panchang", "स्थान-आधारित पंचांग"],
    ["Psychometric Assessment", "मनोमितीय आकलन"],
    ["Coming Soon", "शीघ्र आ रहा है"]
  ];

  const enToHi = new Map(enToHiPairs);
  const hiToEn = new Map(enToHiPairs.map(([en, hi]) => [hi, en]));

  for (const bad of BAD_BRAND_HI) hiToEn.set(bad, BRAND_EN);

  const extraHiToEn = [
    ["द्रिश्वारा के बारे में", "About Drishvara"],
    ["द्रिश्वारा को भेजें", "Submit to Drishvara"],
    ["दृष्टि चिंतन अंतर्दृष्टि", "Vision. Reflection. Insight."],
    ["दृष्टि व्यापक, चिंतन गहरा।", "Vision broad, reflection deep."],
    ["आज का वैदिक संकेत", "Today’s Vedic Guidance"],
    ["आज का शब्द", "Word of the Day"],
    ["चयनित पठन", "Featured Reads"],
    ["स्थान-आधारित पंचांग", "Location-based Panchang"],
    ["खेल डेस्क", "Sports Desk"],
    ["परिचय", "About"],
    ["सबमिशन", "Submissions"]
  ];

  for (const [hi, en] of extraHiToEn) hiToEn.set(hi, en);

  function normalizeLang(value) {
    const v = String(value || "").toLowerCase();
    if (v.startsWith("hi") || v.includes("hindi") || v.includes("हिन्दी") || v.includes("हिंदी")) return "hi";
    return "en";
  }

  function readCookieLang() {
    const m = document.cookie.match(/(?:^|;\s*)drishvara_language=([^;]+)/);
    return m ? normalizeLang(decodeURIComponent(m[1])) : null;
  }

  function getLang() {
    for (const key of languageKeys) {
      const v = localStorage.getItem(key);
      if (v) return normalizeLang(v);
    }
    return readCookieLang() || normalizeLang(document.documentElement.getAttribute("lang") || "en");
  }

  function setLang(lang) {
    const safe = normalizeLang(lang);
    for (const key of languageKeys) localStorage.setItem(key, safe);
    document.cookie = `drishvara_language=${safe}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.setAttribute("lang", safe);
    document.documentElement.dataset.drishvaraLanguage = safe;
    document.body.dataset.drishvaraLanguage = safe;
    document.body.dataset.h03LanguageGuard = safe;
    document.body.dataset.h03Version = VERSION;
    return safe;
  }

  function preserveWhitespace(original, replacement) {
    const prefix = original.match(/^\s*/)?.[0] || "";
    const suffix = original.match(/\s*$/)?.[0] || "";
    return `${prefix}${replacement}${suffix}`;
  }

  function shouldSkip(el) {
    if (!el) return true;
    const tag = el.tagName;
    return ["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA"].includes(tag) ||
      el.closest("[data-no-h01-translate], [data-no-h02-translate], [data-no-h03-translate]");
  }

  function translateRaw(raw, lang) {
    const trimmed = raw.trim();
    if (!trimmed) return raw;

    if (lang === "hi") {
      if (BAD_BRAND_HI.includes(trimmed)) return preserveWhitespace(raw, BRAND_HI);
      const hi = enToHi.get(trimmed);
      return hi ? preserveWhitespace(raw, hi) : raw;
    }

    if (trimmed === BRAND_HI || BAD_BRAND_HI.includes(trimmed)) return preserveWhitespace(raw, BRAND_EN);
    const en = hiToEn.get(trimmed);
    return en ? preserveWhitespace(raw, en) : raw;
  }

  function applyText(root, lang) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (shouldSkip(node.parentElement)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) node.nodeValue = translateRaw(node.nodeValue, lang);
  }

  function lockBrand(lang) {
    const target = lang === "hi" ? BRAND_HI : BRAND_EN;
    const search = lang === "hi" ? [BRAND_EN, ...BAD_BRAND_HI] : [BRAND_HI, ...BAD_BRAND_HI];

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (shouldSkip(node.parentElement)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    for (const node of nodes) {
      const trimmed = node.nodeValue.trim();
      if (search.includes(trimmed)) node.nodeValue = preserveWhitespace(node.nodeValue, target);
    }
  }

  function applyForm(lang) {
    const pairs = [
      ["Name", "नाम"],
      ["Date of Birth (DD/MM/YYYY)", "जन्मतिथि (DD/MM/YYYY)"],
      ["Optional", "वैकल्पिक"]
    ];

    for (const el of document.querySelectorAll("input, textarea")) {
      const current = el.getAttribute("placeholder");
      if (!current) continue;
      const match = pairs.find(([en, hi]) => current === en || current === hi);
      if (match) el.setAttribute("placeholder", lang === "hi" ? match[1] : match[0]);
    }

    for (const option of document.querySelectorAll("option")) {
      option.textContent = translateRaw(option.textContent, lang);
    }
  }

  let applying = false;

  function applyLanguage(lang = getLang()) {
    if (applying) return;
    applying = true;

    const safe = setLang(lang);
    applyText(document.body, safe);
    applyForm(safe);
    lockBrand(safe);

    if (window.DrishvaraHomepageLanguageHotfix?.setLanguage) {
      try {
        window.DrishvaraHomepageLanguageHotfix.setLanguage(safe);
      } catch {}
    }

    setTimeout(() => {
      applyText(document.body, safe);
      applyForm(safe);
      lockBrand(safe);
      applying = false;
    }, 160);
  }

  function desiredFromClick(target) {
    const explicit = target?.dataset?.lang || target?.dataset?.language;
    if (explicit) return normalizeLang(explicit);

    const text = target?.textContent || "";
    const current = getLang();

    if (text.includes("EN") && (text.includes("हिन्दी") || text.includes("हिंदी"))) {
      return current === "hi" ? "en" : "hi";
    }

    if (text.trim() === "EN" || text.toLowerCase().includes("english")) return "en";
    if (text.includes("हिन्दी") || text.includes("हिंदी") || text.toLowerCase().includes("hindi")) return "hi";

    return null;
  }

  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-lang], [data-language], button, a, span");
    const desired = desiredFromClick(target);
    if (!desired) return;

    setLang(desired);
    setTimeout(() => applyLanguage(desired), 30);
    setTimeout(() => applyLanguage(desired), 220);
    setTimeout(() => applyLanguage(desired), 520);
  }, true);

  window.addEventListener("storage", (event) => {
    if (languageKeys.includes(event.key)) applyLanguage(event.newValue);
  });

  window.addEventListener("drishvara:language-change", (event) => {
    applyLanguage(event.detail?.language || event.detail?.lang || getLang());
  });

  document.addEventListener("drishvara:language-change", (event) => {
    applyLanguage(event.detail?.language || event.detail?.lang || getLang());
  });

  const observer = new MutationObserver(() => {
    clearTimeout(window.__drishvaraH03Timer);
    window.__drishvaraH03Timer = setTimeout(() => applyLanguage(getLang()), 100);
  });

  window.addEventListener("DOMContentLoaded", () => {
    applyLanguage(getLang());
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  });

  window.DrishvaraLanguageStateGuard = {
    version: VERSION,
    setLanguage: applyLanguage,
    getLanguage: getLang,
    brand: { en: BRAND_EN, hi: BRAND_HI }
  };
})();
