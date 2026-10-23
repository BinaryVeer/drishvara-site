(function () {
  "use strict";
  function ensurePlaceWrapper() {
    var select = document.getElementById("panchang-place-select");
    if (!select || select.dataset.drishvaraHf12Converted === "true") return;

    // The unchanged controller fills this existing HF12 contract and owns every option action.
    var wrap = document.createElement("div");
    wrap.className = "drishvara-hf12-select";
    wrap.setAttribute("data-drishvara-hf12-select", "true");
    wrap.setAttribute("data-open", "false");
    var button = document.createElement("button");
    button.type = "button";
    button.className = "drishvara-hf12-select-button";
    button.setAttribute("aria-haspopup", "listbox");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", "dv2-panchang-place-options");
    button.setAttribute("aria-label", "Choose Panchang Location");
    button.disabled = true;
    button.textContent = "Loading approved places";
    var menu = document.createElement("div");
    menu.id = "dv2-panchang-place-options";
    menu.className = "drishvara-hf12-select-menu";
    menu.setAttribute("role", "listbox");
    menu.setAttribute("aria-label", "Approved Panchang locations");
    wrap.append(button, menu);
    select.dataset.drishvaraHf12Converted = "true";
    select.insertAdjacentElement("afterend", wrap);

    function close(restoreFocus) {
      wrap.setAttribute("data-open", "false");
      button.setAttribute("aria-expanded", "false");
      if (restoreFocus) button.focus();
    }
    button.addEventListener("click", function () {
      var open = wrap.getAttribute("data-open") !== "true";
      wrap.setAttribute("data-open", String(open));
      button.setAttribute("aria-expanded", String(open));
      if (open) menu.querySelector('[aria-selected="true"]')?.focus();
    });
    wrap.addEventListener("keydown", function (event) {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(true); return; }
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      event.preventDefault();
      wrap.setAttribute("data-open", "true");
      button.setAttribute("aria-expanded", "true");
      var options = Array.from(menu.querySelectorAll('[role="option"]'));
      var index = options.indexOf(document.activeElement);
      var direction = event.key === "ArrowDown" ? 1 : -1;
      options[(index + direction + options.length) % options.length]?.focus();
    });
    wrap.addEventListener("click", function (event) {
      if (event.target.closest('[role="option"]')) close(true);
    });
    document.addEventListener("click", function (event) {
      if (!wrap.contains(event.target)) close(false);
    });
  }
  function boot() {
    ensurePlaceWrapper();
    if (window.DrishvaraV2RuntimePresentation) window.DrishvaraV2RuntimePresentation.mount("time");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
