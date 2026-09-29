(function () {
  "use strict";

  var Shell = window.DrishvaraV2Shell;
  if (!Shell) return;

  var file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  var PAGES = {
    "insights.html": { active: "read", kind: "insights" },
    "dashboard.html": { active: "reflect", kind: "my-drishvara" },
    "about.html": { active: "", kind: "about" },
    "contact.html": { active: "", kind: "contact" },
    "submissions.html": { active: "", kind: "submissions" },
    "login.html": { active: "", kind: "account" },
    "signin.html": { active: "", kind: "account" }
  };
  var page = PAGES[file];
  if (!page) return;

  function ensureFooter() {
    if (document.querySelector(".dv2-footer")) return;
    var footer = document.createElement("footer");
    footer.className = "dv2-footer";
    footer.innerHTML =
      '<div class="dv2-footer__inner"><span>Drishvara © 2026 - Public intelligence, reading, time and reflection.</span><span><a href="about.html">About</a> - <a href="contact.html">Contact</a> - <a href="login.html">Sign in</a></span></div>';
    document.body.appendChild(footer);
  }

  function addNotice(text) {
    if (!text || document.querySelector("[data-dv2-public-notice='" + page.kind + "']")) return;
    var notice = document.createElement("p");
    notice.className = "dv2-public-notice";
    notice.setAttribute("data-dv2-public-notice", page.kind);
    notice.textContent = text;
    var header = document.querySelector(".dv2-header");
    if (header) header.insertAdjacentElement("afterend", notice);
  }

  function relabelDashboard() {
    if (file !== "dashboard.html") return;
    document.title = "My Drishvara | Drishvara";
    var h1 = document.querySelector("h1");
    if (h1) h1.textContent = "My Drishvara";
    var heroCopy = document.querySelector(".hero p");
    if (heroCopy) {
      heroCopy.textContent =
        "A future personal space for reading, participation, membership and governed tools. No sign-in, subscription, profile storage or premium output is active on this page.";
    }
    var status = document.querySelector(".status-pill");
    if (status) status.textContent = "Account features inactive";
    addNotice("My Drishvara prepares reading, participation, membership and future governed personal tools. Sign-in, subscription and personal storage remain inactive here.");
    if (!document.querySelector(".dv2-dashboard-map")) {
      var map = document.createElement("section");
      map.className = "dv2-dashboard-map";
      map.setAttribute("aria-label", "My Drishvara sections");
      map.innerHTML =
        '<article><h2>Reading</h2><p>Saved reads and reading history will require sign-in and consent before activation.</p></article>' +
        '<article><h2>Participation</h2><p>Submissions and contributor workflows remain scaffolded until governed review and backend access are approved.</p></article>' +
        '<article><h2>Membership</h2><p>Subscription access is not enabled. This page does not simulate premium status.</p></article>' +
        '<article><h2>Account</h2><p>Authentication and profile storage are inactive; no personal details are collected here.</p></article>';
      var main = document.querySelector("main");
      if (main) main.insertAdjacentElement("beforebegin", map);
    }
  }

  function relabelSubmissions() {
    if (file !== "submissions.html") return;
    addNotice("Submissions are moving toward My Drishvara participation. Membership does not imply automatic publication, and no unsupported publishing backend is activated here.");
  }

  function relabelAccount() {
    if (file !== "login.html" && file !== "signin.html") return;
    addNotice("Account access is a public scaffold. No live authentication, subscription or personal data storage is activated on this page.");
  }

  function boot() {
    document.body.classList.add("drishvara-v2-public-page", "dv2-page-" + page.kind);
    Shell.ensureHeader(page.active);
    relabelDashboard();
    relabelSubmissions();
    relabelAccount();
    ensureFooter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
