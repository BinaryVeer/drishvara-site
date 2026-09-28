(function () {
  "use strict";

  if (location.pathname.indexOf("article.html") === -1) return;

  function ensureArticleActions() {
    var subtitle = document.getElementById("article-subtitle");
    if (subtitle && !document.getElementById("dv2-article-actions")) {
      var actions = document.createElement("div");
      actions.id = "dv2-article-actions";
      actions.className = "dv2-article-actions";
      actions.style.cssText =
        "display:flex;flex-wrap:wrap;gap:.55rem;align-items:center;margin:1rem 0 0;";
      actions.innerHTML =
        '<button class="dv2-button" type="button" data-dv2-article-save aria-disabled="true" title="Sign in is required before saving reads">Save</button>' +
        '<button class="dv2-button" type="button" data-dv2-article-follow aria-disabled="true" title="Sign in is required before following topics">Follow</button>' +
        '<button class="dv2-button" type="button" data-dv2-article-share>Share</button>' +
        '<span class="dv2-section-note" id="dv2-article-action-status">Save and follow are prepared for authenticated accounts; no preference is stored here.</span>';
      subtitle.insertAdjacentElement("afterend", actions);
    }
  }

  window.DrishvaraV2Article = {
    ensureArticleActions: ensureArticleActions
  };

  function bootArticleV2() {
    if (window.DrishvaraV2Shell) {
      window.DrishvaraV2Shell.ensureHeader("read");
    }
    document.documentElement.setAttribute("data-drishvara-v2", "active");
    document.body.classList.add("drishvara-v2-active", "article-v2");

    ensureArticleActions();

    document.addEventListener("click", function (event) {
      var status = document.getElementById("dv2-article-action-status");
      if (event.target.closest("[data-dv2-article-save]")) {
        if (status) status.textContent = "Sign in is required before saving reads. No local save was created.";
      }
      if (event.target.closest("[data-dv2-article-follow]")) {
        if (status) status.textContent = "Sign in is required before following topics. No local follow state was created.";
      }
      if (event.target.closest("[data-dv2-article-share]")) {
        if (navigator.share) {
          navigator.share({
            title: document.title,
            url: location.href
          }).catch(function () {});
        } else if (status) {
          status.textContent = location.href;
        }
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootArticleV2, { once: true });
  } else {
    bootArticleV2();
  }
})();
