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
        '<span class="dv2-section-note" id="dv2-article-action-status" aria-live="polite"></span>';
      subtitle.insertAdjacentElement("afterend", actions);
    }
    ensureReferenceState();
    ensureReadingLayout();
  }

  function ensureReferenceState() {
    var body = document.getElementById("article-body");
    if (!body || document.getElementById("dv2-article-reference-state")) return;
    if (body.querySelector('.article-sources, [data-drishvara-ar01-evidence-block="true"], [data-drishvara-ar02c-sample-reference-block="true"], [data-drishvara-ag05d-visible-reference-block="true"]')) return;
    if (/References|Reference links|संदर्भ/i.test(body.innerText || "")) return;
    var section = document.createElement("section");
    section.id = "dv2-article-reference-state";
    section.className = "article-trust-block";
    section.innerHTML =
      "<h2>References</h2>" +
      "<p>Reference links appear after editorial verification.</p>";
    body.appendChild(section);
  }

  function ensureReadingLayout() {
    var body = document.getElementById("article-body");
    var subtitle = document.getElementById("article-subtitle");
    if (!body || !subtitle) return;
    var title = document.getElementById("article-title");
    if (!title || title.textContent === "Loading article..." || body.querySelector(".reader-status")) return;
    var paragraphs = Array.from(body.querySelectorAll("p[data-paragraph]"));
    if (!paragraphs.length) paragraphs = Array.from(body.querySelectorAll("p")).filter(function (paragraph) {
      return !paragraph.closest("figcaption, .article-trust-block, .article-sources, .drishvara-ar01-evidence, .drishvara-article-evidence");
    });
    var headings = Array.from(body.querySelectorAll("h2")).filter(function (heading) {
      return !heading.closest(".article-trust-block, .drishvara-ar01-evidence, .drishvara-article-evidence");
    });
    if (!headings.length || !paragraphs.length) return;

    var meta = document.getElementById("dv2-article-reading-meta");
    if (!meta) {
      meta = document.createElement("p");
      meta.id = "dv2-article-reading-meta";
      meta.className = "dv2-article-reading-meta";
      subtitle.insertAdjacentElement("afterend", meta);
    }
    var words = paragraphs.map(function (p) { return p.textContent; }).join(" ").trim().split(/\s+/).filter(Boolean).length;
    meta.textContent = Math.max(1, Math.ceil(words / 225)) + " min read";

    var layout = document.getElementById("dv2-article-reading-layout");
    if (!layout) {
      layout = document.createElement("div");
      layout.id = "dv2-article-reading-layout";
      layout.className = "dv2-article-reading-layout";
      body.parentNode.insertBefore(layout, body);
      layout.appendChild(body);
    }
    var outline = document.getElementById("dv2-article-outline");
    var wasOpen = outline ? outline.open : !window.matchMedia("(max-width: 960px)").matches;
    if (outline) outline.remove();
    outline = document.createElement("details");
    outline.id = "dv2-article-outline";
    outline.className = "dv2-article-outline";
    outline.open = wasOpen;
    var summary = document.createElement("summary");
    summary.textContent = "On this page";
    var nav = document.createElement("nav");
    nav.setAttribute("aria-label", "Article sections");
    var list = document.createElement("ol");
    headings.forEach(function (heading, index) {
      // Keep authored anchors; only add collision-free navigation to unlabelled sections.
      if (!heading.id) {
        var id = "article-section-" + (index + 1);
        while (document.getElementById(id)) id += "-read";
        heading.id = id;
      }
      var item = document.createElement("li");
      var link = document.createElement("a");
      link.href = "#" + encodeURIComponent(heading.id);
      link.textContent = heading.textContent;
      item.appendChild(link);
      list.appendChild(item);
    });
    nav.appendChild(list);
    outline.append(summary, nav);
    layout.insertBefore(outline, body);
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
        if (status) status.textContent = "Sign in or join to save reads when member access opens. No local save was created.";
      }
      if (event.target.closest("[data-dv2-article-follow]")) {
        if (status) status.textContent = "Sign in or join to follow topics when member access opens. No local follow state was created.";
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
