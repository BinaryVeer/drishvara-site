(function () {
  const LIVE_AUTH_ENABLED = false;
  const SESSION_GUARD_ENABLED = false;
  const DASHBOARD_DATA_UNLOCK_ENABLED = false;
  const SUBSCRIPTION_GATE_ENABLED = false;
  const PREMIUM_GUIDANCE_ENABLED = false;
  const ADMIN_GATE_ENABLED = false;

  const COPY = {
    en: {
      title: "Session Guard",
      status: "Session guard scaffold only",
      summary: "Dashboard access control is planned, but live login, session detection, subscription gate, and premium guidance remain disabled.",
      anonymous: "Anonymous visitor",
      free: "Free registered user",
      subscriber: "Active subscriber",
      admin: "Admin reviewer",
      blocked: "Blocked",
      planned: "Planned",
      disabled: "Disabled",
      dashboardData: "Dashboard data",
      subscriptionGate: "Subscription gate",
      premiumGuidance: "Premium guidance",
      adminActions: "Admin actions",
      loginLink: "Open login scaffold"
    },
    hi: {
      title: "सेशन गार्ड",
      status: "सेशन गार्ड अभी केवल स्कैफोल्ड है",
      summary: "डैशबोर्ड एक्सेस नियंत्रण की योजना तैयार है, लेकिन लाइव लॉगिन, सेशन पहचान, सब्सक्रिप्शन गेट और प्रीमियम मार्गदर्शन अभी अक्षम हैं।",
      anonymous: "अनाम आगंतुक",
      free: "मुफ़्त पंजीकृत उपयोगकर्ता",
      subscriber: "सक्रिय सदस्य",
      admin: "एडमिन समीक्षक",
      blocked: "अवरुद्ध",
      planned: "योजनाबद्ध",
      disabled: "अक्षम",
      dashboardData: "डैशबोर्ड डेटा",
      subscriptionGate: "सब्सक्रिप्शन गेट",
      premiumGuidance: "प्रीमियम मार्गदर्शन",
      adminActions: "एडमिन क्रियाएँ",
      loginLink: "लॉगिन स्कैफोल्ड खोलें"
    }
  };

  function currentLang() {
    try {
      return localStorage.getItem("drishvara_site_language") || "en";
    } catch {
      return "en";
    }
  }

  function t(key) {
    const lang = currentLang() === "hi" ? "hi" : "en";
    return COPY[lang][key] || COPY.en[key] || "";
  }

  function getGuardState() {
    return {
      version: "2026.04.30-activation-02c",
      status: "scaffold_only",
      liveAuthEnabled: LIVE_AUTH_ENABLED,
      sessionGuardEnabled: SESSION_GUARD_ENABLED,
      dashboardDataUnlockEnabled: DASHBOARD_DATA_UNLOCK_ENABLED,
      subscriptionGateEnabled: SUBSCRIPTION_GATE_ENABLED,
      premiumGuidanceEnabled: PREMIUM_GUIDANCE_ENABLED,
      adminGateEnabled: ADMIN_GATE_ENABLED,
      effectiveUserState: "anonymous_scaffold",
      dashboardAccess: "shell_only",
      blocked: [
        "live_auth",
        "session_detection",
        "dashboard_data_unlock",
        "subscription_gate",
        "premium_guidance",
        "admin_backend_actions"
      ]
    };
  }

  function ensureStyle() {
    if (document.getElementById("drishvaraSessionGuardStyle")) return;

    const style = document.createElement("style");
    style.id = "drishvaraSessionGuardStyle";
    style.textContent = `
      .session-guard-panel {
        width: min(1120px, calc(100% - 32px));
        margin: 0 auto 22px;
        border: 1px solid rgba(201, 162, 74, 0.24);
        background: rgba(255, 255, 255, 0.055);
        color: #f5f1e8;
        border-radius: 22px;
        padding: 18px;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.035);
      }

      .session-guard-grid {
        display: grid;
        grid-template-columns: 1fr 1.15fr;
        gap: 16px;
        align-items: start;
      }

      .session-guard-kicker {
        color: #c9a24a;
        font-size: 0.74rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        margin-bottom: 6px;
      }

      .session-guard-title {
        font-family: Georgia, "Times New Roman", serif;
        font-size: clamp(1.45rem, 2.4vw, 2.1rem);
        line-height: 1.1;
        margin-bottom: 8px;
      }

      .session-guard-summary {
        color: #d7deea;
        line-height: 1.65;
        font-size: 0.94rem;
      }

      .session-guard-status-list {
        display: grid;
        gap: 8px;
      }

      .session-guard-row {
        display: flex;
        justify-content: space-between;
        gap: 14px;
        border: 1px solid rgba(255,255,255,0.09);
        background: rgba(255,255,255,0.045);
        border-radius: 14px;
        padding: 10px 12px;
        color: #d7deea;
      }

      .session-guard-row strong {
        color: #f5f1e8;
      }

      .session-guard-row span {
        color: #aeb9cb;
        text-align: right;
      }

      .session-guard-login-link {
        display: inline-flex;
        margin-top: 12px;
        color: #c9a24a;
        text-decoration: none;
        font-weight: 700;
      }

      .session-guard-login-link:hover {
        text-decoration: underline;
      }

      @media (max-width: 820px) {
        .session-guard-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function findDashboardMount() {
    return document.querySelector("[data-session-guard-panel]") ||
      document.querySelector("[data-subscriber-dashboard]") ||
      document.querySelector("main") ||
      document.body;
  }

  function renderSessionGuardPanel() {
    ensureStyle();

    let panel = document.querySelector("[data-session-guard-panel]");
    const mount = findDashboardMount();

    if (!panel) {
      panel = document.createElement("section");
      panel.className = "session-guard-panel";
      panel.setAttribute("data-session-guard-panel", "true");

      if (mount === document.body) {
        document.body.insertBefore(panel, document.body.firstChild);
      } else {
        mount.insertBefore(panel, mount.firstChild);
      }
    }

    panel.innerHTML = `
      <div class="session-guard-grid">
        <div>
          <div class="session-guard-kicker">${t("status")}</div>
          <div class="session-guard-title">${t("title")}</div>
          <div class="session-guard-summary">${t("summary")}</div>
          <a class="session-guard-login-link" href="login.html">${t("loginLink")} →</a>
        </div>
        <div class="session-guard-status-list">
          <div class="session-guard-row"><strong>${t("dashboardData")}</strong><span>${t("disabled")}</span></div>
          <div class="session-guard-row"><strong>${t("subscriptionGate")}</strong><span>${t("planned")}</span></div>
          <div class="session-guard-row"><strong>${t("premiumGuidance")}</strong><span>${t("blocked")}</span></div>
          <div class="session-guard-row"><strong>${t("adminActions")}</strong><span>${t("blocked")}</span></div>
        </div>
      </div>
    `;
  }

  function markDashboardLocked() {
    document.documentElement.setAttribute("data-session-guard", "scaffold-only");
    document.documentElement.setAttribute("data-dashboard-data-unlock", "false");

    document.querySelectorAll("[data-premium-guidance], [data-dashboard-premium], [data-subscriber-guidance]").forEach((node) => {
      node.setAttribute("data-locked-by-session-guard", "true");
    });
  }

  function boot() {
    markDashboardLocked();

    if (location.pathname.endsWith("/dashboard.html") || location.pathname.includes("dashboard.html")) {
      renderSessionGuardPanel();
    }

    window.DrishvaraSessionGuard = {
      version: "2026.04.30-activation-02c",
      liveAuthEnabled: LIVE_AUTH_ENABLED,
      sessionGuardEnabled: SESSION_GUARD_ENABLED,
      dashboardDataUnlockEnabled: DASHBOARD_DATA_UNLOCK_ENABLED,
      subscriptionGateEnabled: SUBSCRIPTION_GATE_ENABLED,
      premiumGuidanceEnabled: PREMIUM_GUIDANCE_ENABLED,
      adminGateEnabled: ADMIN_GATE_ENABLED,
      getGuardState,
      renderSessionGuardPanel
    };
  }

  window.addEventListener("load", boot);
  window.addEventListener("drishvara:languagechange", function () {
    if (location.pathname.endsWith("/dashboard.html") || location.pathname.includes("dashboard.html")) {
      renderSessionGuardPanel();
    }
  });
})();
