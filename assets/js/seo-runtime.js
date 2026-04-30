(function () {
  const SITE_URL = "https://www.drishvara.com";
  const DEFAULT_TITLE = "Drishvara · Civilizational Intelligence, Daily Reads and Reflective Guidance";
  const DEFAULT_DESCRIPTION = "Drishvara is a founder-led insight platform for daily reads, civilizational reflection, bilingual articles, sports context, and guarded premium knowledge systems.";
  const DEFAULT_IMAGE = `${SITE_URL}/assets/logo/logo.png`;

  function absoluteUrl(path) {
    if (!path) return SITE_URL + "/";
    if (/^https?:\/\//i.test(path)) return path;
    if (path.startsWith("/")) return SITE_URL + path;
    return SITE_URL + "/" + path;
  }

  function ensureMeta(selector, createTag, attrs) {
    let el = document.head.querySelector(selector);
    if (!el) {
      el = document.createElement(createTag);
      for (const [key, value] of Object.entries(attrs || {})) {
        el.setAttribute(key, value);
      }
      document.head.appendChild(el);
    }
    return el;
  }

  function setMetaName(name, content) {
    const el = ensureMeta(`meta[name="${name}"]`, "meta", { name });
    el.setAttribute("content", content || "");
  }

  function setMetaProperty(property, content) {
    const el = ensureMeta(`meta[property="${property}"]`, "meta", { property });
    el.setAttribute("content", content || "");
  }

  function setCanonical(url) {
    const el = ensureMeta('link[rel="canonical"]', "link", { rel: "canonical" });
    el.setAttribute("href", url);
  }

  window.DrishvaraSEO = {
    siteUrl: SITE_URL,
    setPageMeta({ title, description, url, image, type = "website" } = {}) {
      const finalTitle = title || DEFAULT_TITLE;
      const finalDescription = description || DEFAULT_DESCRIPTION;
      const finalUrl = url || window.location.href;
      const finalImage = absoluteUrl(image || DEFAULT_IMAGE);

      document.title = finalTitle;
      setCanonical(finalUrl);

      setMetaName("description", finalDescription);
      setMetaName("robots", "index, follow");

      setMetaProperty("og:site_name", "Drishvara");
      setMetaProperty("og:title", finalTitle);
      setMetaProperty("og:description", finalDescription);
      setMetaProperty("og:type", type);
      setMetaProperty("og:url", finalUrl);
      setMetaProperty("og:image", finalImage);

      setMetaName("twitter:card", "summary_large_image");
      setMetaName("twitter:title", finalTitle);
      setMetaName("twitter:description", finalDescription);
      setMetaName("twitter:image", finalImage);
    }
  };

  window.addEventListener("load", function () {
    window.DrishvaraSEO.setPageMeta({});
  });
})();
