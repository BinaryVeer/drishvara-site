
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
    /* DRISHVARA_CLICK_SCOPE_GUARD */
    if (!event.target || !event.target.closest || !event.target.closest(".lang-toggle, [data-drishvara-lang-toggle='true']")) return;

    const target = findLanguageToggleTarget(event.target) || event.target.closest("[data-lang], [data-language], button, a, span, div");
    const desired = desiredFromClick(target);
    if (!desired) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    setLanguage(desired, "site-language-shim-click");

    if (window.DrishvaraLanguageRuntime?.setLanguage) {
      window.DrishvaraLanguageRuntime.setLanguage(desired);
    }
  }, true);


  // language-toggle-keyboard
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    const target = findLanguageToggleTarget(event.target);
    if (!target) return;

    event.preventDefault();
    target.click();
  }, true);

  window.DrishvaraSiteLanguage = {
    version: VERSION,
    setLanguage,
    getLanguage
  };

  window.setDrishvaraLanguage = setLanguage;
  window.getDrishvaraLanguage = getLanguage;
})();


/* DRISHVARA_HERO_MEANING_FIX_JS_START */
(function () {
  const LANG_KEY = "drishvara_site_language";

  function currentLang() {
    try {
      return localStorage.getItem(LANG_KEY) === "hi" ? "hi" : "en";
    } catch (error) {
      return document.documentElement.lang === "hi" ? "hi" : "en";
    }
  }

  function fixHeroMeaning() {
    const meaning = document.querySelector(".hero .meaning");
    if (!meaning) return;

    meaning.textContent = currentLang() === "hi"
      ? "दृष्टि व्यापक, चिंतन गहरा।"
      : "Vision broad, reflection deep.";
  }

  document.addEventListener("DOMContentLoaded", function () {
    fixHeroMeaning();
    setTimeout(fixHeroMeaning, 100);
    setTimeout(fixHeroMeaning, 500);
  });

  window.addEventListener("load", function () {
    fixHeroMeaning();
    setTimeout(fixHeroMeaning, 500);
  });

  document.addEventListener("click", function () {
    setTimeout(fixHeroMeaning, 100);
    setTimeout(fixHeroMeaning, 500);
  }, true);
})();
/* DRISHVARA_HERO_MEANING_FIX_JS_END */
