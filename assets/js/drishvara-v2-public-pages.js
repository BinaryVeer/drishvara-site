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
    addNotice("My Drishvara prepares reading, participation, membership and future governed personal tools. Sign-in, subscription and personal storage remain inactive here.");
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
