(function () {
  "use strict";

  function applyDictionary(root, dictionary, lang) {
    if (!root || !dictionary) return;
    var safe = lang === "hi" ? "hi" : "en";
    root.setAttribute("data-dv2-lang", safe);

    Object.keys(dictionary).forEach(function (key) {
      var node = root.querySelector("[data-dv2-i18n='" + key + "']");
      if (!node) return;
      node.textContent =
        dictionary[key] && dictionary[key][safe]
          ? dictionary[key][safe]
          : dictionary[key].en || "";
    });

    root.querySelectorAll("[data-dv2-language-choice]").forEach(function (button) {
      var active = button.getAttribute("data-dv2-language-choice") === safe;
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function bindSectionToggle(root, dictionary) {
    if (!root) return;
    root.addEventListener("click", function (event) {
      var button = event.target.closest("[data-dv2-language-choice]");
      if (!button || !root.contains(button)) return;
      applyDictionary(root, dictionary, button.getAttribute("data-dv2-language-choice"));
    });
    applyDictionary(root, dictionary, "en");
  }

  window.DrishvaraV2I18n = {
    applyDictionary: applyDictionary,
    bindSectionToggle: bindSectionToggle
  };
})();
