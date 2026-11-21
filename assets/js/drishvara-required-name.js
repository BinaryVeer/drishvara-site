/* Session-name form validation only. Load before the existing capture controller. */
(function () {
  'use strict';
  window.addEventListener('click', function (event) {
    if (!event.target?.closest?.('[data-ag71e-preview-button="star-reflection"]')) return;
    const input = document.getElementById('star-reflection-name');
    if (!input?.required || input.value.trim()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    input.setAttribute('aria-invalid', 'true');
    window.dispatchEvent(new CustomEvent('drishvara:name-required'));
    input.focus();
  }, true);
})();
