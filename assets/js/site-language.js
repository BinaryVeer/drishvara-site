(() => {
  // H05 compatibility shim only. Real translation is handled by drishvara-language-runtime.js.
  const VERSION = "2026.05.02-h05-shim";
  const CANONICAL_KEY = "drishvara_language";
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

  function normalizeLanguage(value) {
    const v = String(value || "").toLowerCase();
    if (v === "hi" || v.startsWith("hi") || v.includes("hindi") || v.includes("हिन्दी") || v.includes("हिंदी")) return "hi";
    return "en";
  }

  function setLanguage(value, source = "site-language-shim") {
    const lang = normalizeLanguage(value);
    localStorage.setItem(CANONICAL_KEY, lang);
    for (const key of ALIAS_KEYS) localStorage.setItem(key, lang);
    document.cookie = `${CANONICAL_KEY}=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.lang = lang;
    document.documentElement.dataset.drishvaraLanguage = lang;
    if (document.body) {
      document.body.dataset.drishvaraLanguage = lang;
      document.body.dataset.siteLanguageShim = VERSION;
    }

    window.dispatchEvent(new CustomEvent("drishvara:language-change", {
      detail: { language: lang, source }
    }));

    return lang;
  }

  function getLanguage() {
    return normalizeLanguage(localStorage.getItem(CANONICAL_KEY) || document.documentElement.lang || "en");
  }

  function desiredFromClick(target) {
    if (!target) return null;

    const explicit = target.dataset?.lang || target.dataset?.language;
    if (explicit) return normalizeLanguage(explicit);

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
    const target = event.target.closest("[data-lang], [data-language], button, a, span");
    const desired = desiredFromClick(target);
    if (!desired) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    setLanguage(desired, "site-language-shim-click");

    if (window.DrishvaraLanguageRuntime?.setLanguage) {
      window.DrishvaraLanguageRuntime.setLanguage(desired);
    }
  }, true);

  window.DrishvaraSiteLanguage = {
    version: VERSION,
    setLanguage,
    getLanguage
  };

  window.setDrishvaraLanguage = setLanguage;
  window.getDrishvaraLanguage = getLanguage;
})();
