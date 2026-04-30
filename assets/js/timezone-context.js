(function () {
  const CONFIG_URL = "data/system/timezone-config.json";
  const STORAGE_KEY = "drishvara_timezone";
  const DEFAULT_TZ = "Asia/Kolkata";

  function getStoredTimezone() {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_TZ;
    } catch {
      return DEFAULT_TZ;
    }
  }

  function setStoredTimezone(tz) {
    try {
      localStorage.setItem(STORAGE_KEY, tz || DEFAULT_TZ);
    } catch {
      // ignore storage failure
    }
  }

  function dateInTimezone(timezone, inputDate = new Date()) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone || DEFAULT_TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(inputDate);

    const out = {};
    for (const part of parts) out[part.type] = part.value;

    return `${out.year}-${out.month}-${out.day}`;
  }

  function timeInTimezone(timezone, inputDate = new Date()) {
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: timezone || DEFAULT_TZ,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZoneName: "short"
    }).format(inputDate);
  }

  function ensureStyle() {
    if (document.getElementById("drishvaraTimezoneCompactStyle")) return;

    const style = document.createElement("style");
    style.id = "drishvaraTimezoneCompactStyle";
    style.textContent = `
      .nav-timezone-slot {
        display: inline-flex;
        align-items: center;
        margin: 0 8px;
      }

      .nav-timezone-select {
        max-width: 156px;
        border: 1px solid rgba(255,255,255,0.16);
        background: rgba(255,255,255,0.06);
        color: #f5f1e8;
        border-radius: 999px;
        padding: 7px 28px 7px 11px;
        font-size: 0.82rem;
        line-height: 1.2;
        cursor: pointer;
        outline: none;
      }

      .nav-timezone-select:hover {
        border-color: rgba(201,162,74,0.45);
      }

      .nav-timezone-select option {
        background: #08142d;
        color: #f5f1e8;
      }

      @media (max-width: 760px) {
        .nav-timezone-slot {
          order: 10;
          width: 100%;
          justify-content: center;
          margin-top: 8px;
        }

        .nav-timezone-select {
          max-width: 220px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function expose(config) {
    window.DrishvaraTime = {
      version: "2026.04.30-b23a",
      defaultTimezone: DEFAULT_TZ,
      selectedTimezone: getStoredTimezone(),
      config,
      today() {
        return dateInTimezone(getStoredTimezone());
      },
      nowLabel() {
        return timeInTimezone(getStoredTimezone());
      },
      setTimezone(tz) {
        setStoredTimezone(tz);
        window.dispatchEvent(new CustomEvent("drishvara:timezonechange", {
          detail: {
            timezone: tz,
            date: dateInTimezone(tz),
            label: timeInTimezone(tz),
            applies_to: [
              "Word of the Day",
              "Today’s Vedic Guidance",
              "Panchang & Festival View",
              "Sports context",
              "future premium guidance"
            ]
          }
        }));
      }
    };
  }

  function getOrCreateRoot() {
    let root = document.querySelector("[data-drishvara-timezone-control]");
    if (root) return root;

    const nav = document.querySelector("nav");
    if (!nav) return null;

    root = document.createElement("span");
    root.className = "nav-timezone-slot";
    root.setAttribute("data-drishvara-timezone-control", "true");

    const homeLink = Array.from(nav.querySelectorAll("a")).find((a) => {
      const href = a.getAttribute("href") || "";
      const text = (a.textContent || "").trim().toLowerCase();
      return href.includes("index.html") || text === "home" || text === "घर";
    });

    if (homeLink) {
      nav.insertBefore(root, homeLink);
    } else {
      nav.prepend(root);
    }

    return root;
  }

  function renderControl(config) {
    ensureStyle();

    const root = getOrCreateRoot();
    if (!root) return;

    root.classList.add("nav-timezone-slot");

    const selected = getStoredTimezone();
    const zones = Array.isArray(config.supported_timezones) ? config.supported_timezones : [];

    root.innerHTML = `
      <select
        id="drishvaraTimezoneSelect"
        class="nav-timezone-select"
        aria-label="Date basis for Word of the Day, Vedic Guidance, Panchang and Festival View"
        title="Date basis: Word of the Day, Today’s Vedic Guidance, Panchang & Festival View"
      >
        ${zones.map((zone) => `
          <option value="${zone.timezone}" ${zone.timezone === selected ? "selected" : ""}>
            ${zone.alias || zone.label || zone.timezone}
          </option>
        `).join("")}
      </select>
    `;

    const select = document.getElementById("drishvaraTimezoneSelect");

    function updateTitle() {
      const tz = select.value || DEFAULT_TZ;
      select.title = `Date basis: ${timeInTimezone(tz)} · applies to Word of the Day, Today’s Vedic Guidance, Panchang & Festival View`;
    }

    select.addEventListener("change", function () {
      window.DrishvaraTime.setTimezone(select.value);
      updateTitle();
    });

    updateTitle();
  }

  async function boot() {
    let config = {
      default_timezone: DEFAULT_TZ,
      default_alias: "IST",
      default_offset: "GMT+5:30",
      supported_timezones: [
        {
          timezone: DEFAULT_TZ,
          label: "India Standard Time",
          alias: "IST",
          offset: "GMT+5:30"
        }
      ]
    };

    try {
      const res = await fetch(CONFIG_URL, { cache: "no-store" });
      if (res.ok) config = await res.json();
    } catch {
      // keep fallback
    }

    expose(config);
    renderControl(config);
  }

  window.addEventListener("load", boot);
})();
