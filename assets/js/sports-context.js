(function () {
  const SPORTS_CONTEXT_URL = "data/sports-context.json";

  function currentLang() {
    try {
      return localStorage.getItem("drishvara_site_language") || "en";
    } catch {
      return "en";
    }
  }

  function pick(record, key, fallback = "") {
    if (!record || typeof record !== "object") return fallback;
    const lang = currentLang();
    const hiKey = `${key}_hi`;
    return lang === "hi" ? (record[hiKey] || record[key] || fallback) : (record[key] || fallback);
  }

  function ensureStyle() {
    if (document.getElementById("drishvaraSportsContextStyle")) return;

    const style = document.createElement("style");
    style.id = "drishvaraSportsContextStyle";
    style.textContent = `
      .sports-live-inline-slot {
        width: min(1120px, calc(100% - 32px));
        margin: 0 auto 22px;
      }

      .drishvara-sports-live-pill {
        position: static;
        width: 100%;
        max-width: 100%;
        border: 1px solid rgba(201, 162, 74, 0.32);
        background: rgba(8, 20, 45, 0.78);
        color: #f5f1e8;
        border-radius: 18px;
        padding: 13px 14px;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
        backdrop-filter: blur(8px);
        font-family: Arial, Helvetica, sans-serif;
      }

      .drishvara-sports-live-pill .sports-kicker {
        color: #c9a24a;
        font-size: 0.76rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        margin-bottom: 5px;
      }

      .drishvara-sports-live-pill .sports-title {
        font-size: 0.94rem;
        line-height: 1.35;
        font-weight: 700;
        margin-bottom: 5px;
      }

      .drishvara-sports-live-pill .sports-summary {
        color: #d7deea;
        font-size: 0.78rem;
        line-height: 1.45;
        margin-bottom: 8px;
      }

      .drishvara-sports-live-pill a {
        color: #c9a24a;
        text-decoration: none;
        font-size: 0.78rem;
      }

      .drishvara-sports-live-pill a:hover {
        text-decoration: underline;
      }

      @media (max-width: 760px) {
        .sports-live-inline-slot {
          width: min(100% - 24px, 1120px);
          margin-bottom: 18px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function createInlineSlot() {
    const slot = document.createElement("aside");
    slot.className = "sports-live-inline-slot";
    slot.setAttribute("data-sports-live-update", "true");

    const featuredReads =
      Array.from(document.querySelectorAll("h2, h3"))
        .find((el) => /Featured Reads/i.test(el.textContent || ""));

    const featuredSection = featuredReads?.closest("section, div, main");

    if (featuredSection && featuredSection.parentElement) {
      featuredSection.parentElement.insertBefore(slot, featuredSection);
      return slot;
    }

    const main = document.querySelector("main");
    if (main) {
      main.prepend(slot);
      return slot;
    }

    const firstSection = document.querySelector("section");
    if (firstSection && firstSection.parentElement) {
      firstSection.parentElement.insertBefore(slot, firstSection);
      return slot;
    }

    return null;
  }

  function findOrCreateLivePill() {
    let slot =
      document.querySelector("[data-sports-live-update]") ||
      document.querySelector("#sports-live-update") ||
      document.querySelector(".sports-live-update") ||
      document.querySelector(".sports-live-inline-slot");

    if (!slot) {
      slot = createInlineSlot();
    }

    if (!slot) return null;

    slot.classList.add("sports-live-inline-slot");

    let pill = slot.querySelector(".drishvara-sports-live-pill");

    if (!pill) {
      pill = document.createElement("div");
      pill.className = "drishvara-sports-live-pill";
      slot.appendChild(pill);
    }

    return pill;
  }

  function renderLivePill(data) {
    const live = data.right_top_live_update || data.topRightLiveUpdate || {};
    const pill = findOrCreateLivePill();

    if (!pill) return;

    const label = pick(live, "label", "Live Sports");
    const title = pick(live, "title", "Sports Desk update");
    const summary = pick(live, "summary", "Sports context is being prepared.");
    const ctaLabel = pick(live, "cta_label", live.ctaLabel || "Open Sports Desk");
    const ctaUrl = live.cta_url || live.ctaUrl || "#sports-desk";

    pill.innerHTML = `
      <div class="sports-kicker">${label}</div>
      <div class="sports-title">${title}</div>
      <div class="sports-summary">${summary}</div>
      <a href="${ctaUrl}">${ctaLabel} →</a>
    `;
  }

  function hydrateExistingSportsDesk(data) {
    const sportsDesk = document.querySelector("#sports-desk") || document.querySelector("[data-sports-desk]");
    if (!sportsDesk) return;

    sportsDesk.setAttribute("data-sports-context-loaded", "true");

    const liveEvents = data.live_events || data.liveEvents || [];
    const majorUpdates = data.major_updates || data.majorUpdates || [];
    const tournamentWatch = data.tournament_watch || data.tournamentWatch || [];
    const featured = data.featured_sports_article || data.featuredSportsArticle || null;

    const fill = (selector, items, fallbackLabel) => {
      const target = sportsDesk.querySelector(selector) || document.querySelector(selector);
      if (!target || !Array.isArray(items) || !items.length) return;

      target.innerHTML = items.slice(0, 3).map((item) => `
        <div class="sports-context-item">
          <strong>${pick(item, "title", fallbackLabel)}</strong>
          <span>${pick(item, "summary", "")}</span>
        </div>
      `).join("");
    };

    fill("[data-sports-live-events]", liveEvents, "Live Events");
    fill("[data-sports-major-updates]", majorUpdates, "Major Updates");
    fill("[data-sports-tournament-watch]", tournamentWatch, "Tournament Watch");

    const featuredTarget = sportsDesk.querySelector("[data-sports-featured-article]") || document.querySelector("[data-sports-featured-article]");
    if (featuredTarget && featured) {
      featuredTarget.innerHTML = `
        <a href="${featured.url || "insights.html"}">
          <strong>${pick(featured, "title", "Featured Sports Article")}</strong>
        </a>
        <span>${pick(featured, "summary", "")}</span>
      `;
    }
  }

  async function loadSportsContext() {
    try {
      ensureStyle();

      const response = await fetch(SPORTS_CONTEXT_URL, { cache: "no-store" });
      if (!response.ok) return;

      const data = await response.json();

      if (!data || data.public_output_enabled !== true) return;

      renderLivePill(data);
      hydrateExistingSportsDesk(data);
    } catch (error) {
      console.warn("Sports context hydration skipped:", error);
    }
  }

  window.addEventListener("load", function () {
    loadSportsContext();
    window.addEventListener("drishvara:languagechange", loadSportsContext);
  });
})();
