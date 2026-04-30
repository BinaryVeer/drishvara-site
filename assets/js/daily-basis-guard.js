(function () {
  const STORAGE_KEY = "drishvara_timezone";
  const DEFAULT_TZ = "Asia/Kolkata";

  const WEEKDAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const WEEKDAYS_HI = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];

  function selectedTimezone() {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_TZ;
    } catch {
      return DEFAULT_TZ;
    }
  }

  function dateParts(timezone) {
    const now = new Date();

    const enDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(now);

    const weekdayEn = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "long"
    }).format(now);

    const weekdayIndex = WEEKDAYS_EN.indexOf(weekdayEn);
    const weekdayHi = weekdayIndex >= 0 ? WEEKDAYS_HI[weekdayIndex] : weekdayEn;

    const label = new Intl.DateTimeFormat("en-IN", {
      timeZone: timezone,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZoneName: "short"
    }).format(now);

    return {
      timezone,
      date: enDate,
      weekdayEn,
      weekdayHi,
      label
    };
  }

  function isSensitiveDailyNode(text) {
    return /vedic guidance|panchang|festival|today’s|today's|वैदिक|पंचांग|त्योहार|उत्सव/i.test(text || "");
  }

  function closestCard(node) {
    if (!node || !node.parentElement) return null;
    return node.parentElement.closest("section, article, aside, div");
  }

  function patchCard(card, basis) {
    if (!card) return;

    const text = card.textContent || "";
    if (!isSensitiveDailyNode(text)) return;

    // Replace only stale weekday placeholders inside sensitive cards.
    let html = card.innerHTML;

    for (const day of WEEKDAYS_EN) {
      if (day !== basis.weekdayEn) {
        html = html.replaceAll(day, basis.weekdayEn);
      }
    }

    for (const day of WEEKDAYS_HI) {
      if (day !== basis.weekdayHi) {
        html = html.replaceAll(day, basis.weekdayHi);
      }
    }

    card.innerHTML = html;

    if (!card.querySelector("[data-date-basis-note]")) {
      const note = document.createElement("div");
      note.setAttribute("data-date-basis-note", "true");
      note.style.cssText = "margin-top:10px;color:#d7deea;font-size:.82rem;line-height:1.45;";
      note.textContent = `Date basis: ${basis.label}. Panchang/Vedic interpretation remains under reviewed-method mode.`;
      card.appendChild(note);
    }
  }

  function applyDailyBasisGuard() {
    const basis = dateParts(selectedTimezone());

    const candidates = Array.from(document.querySelectorAll("section, article, aside, div"))
      .filter((node) => isSensitiveDailyNode(node.textContent || ""));

    const unique = new Set();

    for (const node of candidates) {
      const card = closestCard(node) || node;
      if (!unique.has(card)) {
        unique.add(card);
        patchCard(card, basis);
      }
    }

    window.DrishvaraDailyBasisGuard = {
      version: "2026.04.30-b24a",
      timezone: basis.timezone,
      date: basis.date,
      weekdayEn: basis.weekdayEn,
      weekdayHi: basis.weekdayHi,
      label: basis.label,
      panchangPublicOutputEnabled: false,
      vedicGuidancePublicOutputEnabled: false,
      appliesToFestivalView: true,
      appliesTo: "Word of the Day, Today’s Vedic Guidance, Panchang & Festival View"
    };
  }

  window.addEventListener("load", applyDailyBasisGuard);
  window.addEventListener("drishvara:timezonechange", applyDailyBasisGuard);
})();
