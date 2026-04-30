(function () {
  const LIVE_AUTH_ENABLED = false;
  const SUPABASE_CLIENT_ENABLED = false;
  const SESSION_DETECTION_ENABLED = false;
  const DASHBOARD_GATE_ENABLED = false;
  const PREMIUM_GUIDANCE_ENABLED = false;

  const COPY = {
    en: {
      navHome: "Home",
      navInsights: "Insights",
      navDashboard: "Dashboard",
      navSubmissions: "Submissions",
      navLogin: "Login",
      title: "Drishvara Login",
      intro: "Future login space for subscribers and reviewers. This page is prepared for Supabase Auth planning, but live authentication is not enabled yet.",
      status: "Auth integration pending",
      note: "Login will be enabled only after Supabase project confirmation, redirect URL review, database validation, and safe session-gate testing.",
      emailLabel: "Email login",
      emailPlaceholder: "Email login not active yet",
      button: "Send magic link / OTP",
      liveAuth: "Live Auth",
      sessionDetection: "Session Detection",
      dashboardGate: "Dashboard Gate",
      premiumGuidance: "Premium Guidance",
      paymentGate: "Payment Gate",
      adminActions: "Admin Actions",
      disabled: "Disabled",
      planned: "Planned",
      blocked: "Blocked",
      footer: "Drishvara © 2026 · Auth scaffold"
    },
    hi: {
      navHome: "घर",
      navInsights: "इनसाइट्स",
      navDashboard: "डैशबोर्ड",
      navSubmissions: "प्रस्तुतियाँ",
      navLogin: "लॉगिन",
      title: "दृश्वरा लॉगिन",
      intro: "यह भविष्य में सदस्यों और समीक्षकों के लिए लॉगिन स्थान होगा। यह पृष्ठ Supabase Auth योजना के लिए तैयार किया गया है, लेकिन लाइव प्रमाणीकरण अभी सक्षम नहीं है।",
      status: "प्रमाणीकरण एकीकरण लंबित",
      note: "लॉगिन केवल Supabase प्रोजेक्ट की पुष्टि, रीडायरेक्ट URL समीक्षा, डेटाबेस सत्यापन और सुरक्षित सेशन-गेट परीक्षण के बाद सक्षम किया जाएगा।",
      emailLabel: "ईमेल लॉगिन",
      emailPlaceholder: "ईमेल लॉगिन अभी सक्रिय नहीं है",
      button: "मैजिक लिंक / OTP भेजें",
      liveAuth: "लाइव प्रमाणीकरण",
      sessionDetection: "सेशन पहचान",
      dashboardGate: "डैशबोर्ड गेट",
      premiumGuidance: "प्रीमियम मार्गदर्शन",
      paymentGate: "भुगतान गेट",
      adminActions: "एडमिन क्रियाएँ",
      disabled: "अक्षम",
      planned: "योजनाबद्ध",
      blocked: "अवरुद्ध",
      footer: "दृश्वरा © 2026 · प्रमाणीकरण स्कैफोल्ड"
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

  function setText(selector, key) {
    const target = document.querySelector(selector);
    if (target) target.textContent = t(key);
  }

  function setStatus(message) {
    const target = document.querySelector("[data-auth-status]");
    if (target) target.textContent = message || t("status");
  }

  function disableAuthInputs() {
    const email = document.getElementById("email");
    const submit = document.querySelector("[data-auth-submit]");

    if (email) {
      email.disabled = true;
      email.setAttribute("aria-disabled", "true");
      email.placeholder = t("emailPlaceholder");
    }

    if (submit) {
      submit.disabled = true;
      submit.setAttribute("aria-disabled", "true");
      submit.setAttribute("data-live-auth-enabled", "false");
      submit.textContent = t("button");
    }
  }

  function applyLoginCopy() {
    setText("[data-auth-nav-home]", "navHome");
    setText("[data-auth-nav-insights]", "navInsights");
    setText("[data-auth-nav-dashboard]", "navDashboard");
    setText("[data-auth-nav-submissions]", "navSubmissions");
    setText("[data-auth-nav-login]", "navLogin");

    setText("[data-auth-title]", "title");
    setText("[data-auth-intro]", "intro");
    setText("[data-auth-note]", "note");
    setText("[data-auth-email-label]", "emailLabel");
    setText("[data-auth-live-auth-label]", "liveAuth");
    setText("[data-auth-session-label]", "sessionDetection");
    setText("[data-auth-dashboard-label]", "dashboardGate");
    setText("[data-auth-premium-label]", "premiumGuidance");
    setText("[data-auth-payment-label]", "paymentGate");
    setText("[data-auth-admin-label]", "adminActions");
    setText("[data-auth-footer]", "footer");

    document.querySelectorAll("[data-auth-disabled]").forEach((el) => {
      el.textContent = t("disabled");
    });

    document.querySelectorAll("[data-auth-planned]").forEach((el) => {
      el.textContent = t("planned");
    });

    document.querySelectorAll("[data-auth-blocked]").forEach((el) => {
      el.textContent = t("blocked");
    });

    setStatus(t("status"));
    disableAuthInputs();
  }

  function getAuthState() {
    return {
      version: "2026.04.30-activation-02b",
      liveAuthEnabled: LIVE_AUTH_ENABLED,
      supabaseClientEnabled: SUPABASE_CLIENT_ENABLED,
      sessionDetectionEnabled: SESSION_DETECTION_ENABLED,
      dashboardGateEnabled: DASHBOARD_GATE_ENABLED,
      premiumGuidanceEnabled: PREMIUM_GUIDANCE_ENABLED,
      status: "scaffold_only",
      message: t("status"),
      blocked: [
        "live_auth",
        "session_detection",
        "dashboard_data",
        "subscriber_guidance",
        "payment_gate",
        "admin_actions"
      ]
    };
  }

  function boot() {
    applyLoginCopy();

    window.DrishvaraAuth = {
      version: "2026.04.30-activation-02b",
      liveAuthEnabled: LIVE_AUTH_ENABLED,
      supabaseClientEnabled: SUPABASE_CLIENT_ENABLED,
      sessionDetectionEnabled: SESSION_DETECTION_ENABLED,
      dashboardGateEnabled: DASHBOARD_GATE_ENABLED,
      premiumGuidanceEnabled: PREMIUM_GUIDANCE_ENABLED,
      applyLoginCopy,
      getAuthState
    };
  }

  window.addEventListener("load", boot);
  window.addEventListener("drishvara:languagechange", applyLoginCopy);
})();
