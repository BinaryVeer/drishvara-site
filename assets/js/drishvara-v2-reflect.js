(function () {
  "use strict";
  function boot() {
    if (window.DrishvaraV2RuntimePresentation) window.DrishvaraV2RuntimePresentation.mount("reflect");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
