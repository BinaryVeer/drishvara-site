(function () {
  "use strict";

  /*
   * AG75D_R1_PUBLIC_SURFACE_RECONCILIATION_OVERLAY
   *
   * Loaded before the historical SUP02 controller in this same file so its
   * capture listeners can enforce the reconciled public contract without
   * changing the SUP02-closed index.html or Edge Function.
   */

  var LOCATION_PATH =
    "data/knowledge-base/location-intelligence/production/" +
    "ag74p-approved-location-projection.json";
  var DEFAULT_VALUE = "varanasi-uttar-pradesh-india";
  var records = null;
  var rebuilding = false;
  var coordinateTimer = null;

  function byId(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    var node = byId(id);
    if (node) node.textContent = value;
  }

  function remove(selector) {
    var node = document.querySelector(selector);
    if (node) node.remove();
  }

  function shiftDate(dateKey, amount) {
    var values = String(dateKey || "").split("-").map(Number);
    var date = new Date(
      Date.UTC(values[0], values[1] - 1, values[2] + amount, 12)
    );
    return (
      String(date.getUTCFullYear()).padStart(4, "0") +
      "-" +
      String(date.getUTCMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getUTCDate()).padStart(2, "0")
    );
  }

  function displayDate(dateKey) {
    var match = String(dateKey || "").match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );
    return match ? match[3] + "/" + match[2] + "/" + match[1] : dateKey;
  }

  function validTimezone(value) {
    if (!value) return false;
    try {
      new Intl.DateTimeFormat("en-US", {
        timeZone: value
      }).format();
      return true;
    } catch (_error) {
      return false;
    }
  }

  function selectedMode(kind) {
    var name =
      kind === "star-reflection"
        ? "ag71c-star-location-mode"
        : "ag71c-panchang-location-mode";
    var checked = document.querySelector(
      'input[name="' + name + '"]:checked'
    );
    return checked && checked.value === "coordinates"
      ? "coordinates"
      : "place";
  }

  function setMode(kind, mode) {
    var surface = document.querySelector(
      '[data-ag71c-coordinate-surface="' + kind + '"]'
    );
    var shell = document.querySelector(
      '[data-ag71d-place-select-shell="' + kind + '"]'
    );
    if (!surface) return;

    var nextMode = mode === "coordinates" ? "coordinates" : "place";
    var fields = surface.querySelector(
      "[data-ag71c-coordinate-fields]"
    );

    surface.setAttribute("data-ag71d-mode", nextMode);
    surface.setAttribute("data-ag71c-selected-mode", nextMode);

    surface.querySelectorAll("input[data-ag71c-mode]").forEach(
      function (radio) {
        radio.checked = radio.value === nextMode;
        radio.setAttribute(
          "aria-checked",
          radio.checked ? "true" : "false"
        );
      }
    );

    if (fields) {
      fields.hidden = nextMode !== "coordinates";
      fields.style.display =
        nextMode === "coordinates" ? "grid" : "none";
    }

    if (shell) {
      shell.hidden = nextMode === "coordinates";
      shell.style.display =
        nextMode === "coordinates" ? "none" : "block";
    }

    updateSummary(kind);
  }

  function coordinateState(kind) {
    var prefix =
      kind === "star-reflection" ? "star-birth-" : "panchang-";
    var latitudeNode = byId(prefix + "latitude");
    var longitudeNode = byId(prefix + "longitude");
    var timezoneNode = byId(prefix + "timezone");
    var labelNode = byId(prefix + "coordinate-label");

    var latitude = Number(latitudeNode ? latitudeNode.value : "");
    var longitude = Number(longitudeNode ? longitudeNode.value : "");
    var timezone = String(
      timezoneNode ? timezoneNode.value : ""
    ).trim();

    return {
      latitude: latitude,
      longitude: longitude,
      timezone: timezone,
      label:
        labelNode && labelNode.value.trim()
          ? labelNode.value.trim()
          : "Entered coordinates",
      valid:
        Number.isFinite(latitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        Number.isFinite(longitude) &&
        longitude >= -180 &&
        longitude <= 180 &&
        validTimezone(timezone)
    };
  }

  function recordByValue(value) {
    return Array.isArray(records)
      ? records.find(function (record) {
          return record.selector_value === value;
        }) || null
      : null;
  }

  function updateSummary(kind) {
    var summary = document.querySelector(
      '[data-ag71d-r5-selection-summary="' + kind + '"]'
    );
    if (!summary) return;

    if (selectedMode(kind) === "coordinates") {
      var coordinates = coordinateState(kind);
      summary.textContent = coordinates.valid
        ? "Coordinate basis: " +
          coordinates.label +
          " · " +
          coordinates.timezone
        : "Coordinate basis: enter valid latitude, longitude and IANA timezone";
      return;
    }

    var select = byId(
      kind === "star-reflection"
        ? "star-birth-place-select"
        : "panchang-place-select"
    );
    var record = select ? recordByValue(select.value) : null;

    if (kind === "star-reflection") {
      summary.textContent = record
        ? "Selected birth place: " + record.display_label
        : "Selected birth place: not selected";
    } else {
      summary.textContent = record
        ? "Selected Panchang location: " + record.display_label
        : "Selected Panchang location: not selected";
    }
  }


  /*
   * AG75D_R1_NATIVE_STAR_SELECT_RECOVERY
   *
   * The historical HF12 custom wrapper opens reliably for Panchang but not
   * inside the Star Reflection card. Restore the native birth-place select,
   * preserve the five governed options and hide the stale custom wrapper.
   */
  function activateNativeStarSelect() {
    var select = byId("star-birth-place-select");
    if (!select) return;

    /* AG75D_R1_STAR_SELECT_WIDTH_AND_EMPTY_OBSERVANCE_FIX */
    var shell = select.closest(
      '[data-ag71d-place-select-shell="star-reflection"]'
    );
    if (shell) {
      shell.style.setProperty("display", "block", "important");
      shell.style.setProperty("width", "100%", "important");
      shell.style.setProperty("min-width", "0", "important");
      shell.style.setProperty("overflow", "visible", "important");
    }

    var wrapper =
      select.nextElementSibling &&
      select.nextElementSibling.matches &&
      select.nextElementSibling.matches("[data-drishvara-hf12-select]")
        ? select.nextElementSibling
        : select.parentElement
          ? select.parentElement.querySelector("[data-drishvara-hf12-select]")
          : null;

    if (wrapper) {
      wrapper.hidden = true;
      wrapper.style.display = "none";
      wrapper.setAttribute("aria-hidden", "true");
      wrapper.setAttribute(
        "data-ag75d-r1-star-wrapper-superseded",
        "true"
      );
    }

    select.classList.remove("drishvara-hf12-native-select-hidden");
    select.classList.add("ag75d-r1-native-star-birth-place-select");
    /* Keep the exact HF12 converted sentinel so historical code cannot re-wrap the select. */
    select.dataset.drishvaraHf12Converted = "true";
    select.setAttribute(
      "data-ag75d-r1-native-dropdown-recovered",
      "true"
    );
    select.setAttribute(
      "data-ag75d-r1-dropdown-state",
      "native_five_option_select_recovered"
    );
    select.setAttribute("aria-label", "Choose birth place");
    select.removeAttribute("aria-hidden");
    select.removeAttribute("tabindex");

    select.hidden = false;
    select.disabled = false;
    /* Override the historical !important hidden-select declarations. */
    select.style.setProperty("position", "relative", "important");
    select.style.setProperty("display", "block", "important");
    select.style.setProperty("visibility", "visible", "important");
    select.style.setProperty("width", "100%", "important");
    select.style.setProperty("min-width", "220px", "important");
    select.style.setProperty("max-width", "100%", "important");
    select.style.setProperty("inline-size", "100%", "important");
    select.style.setProperty("min-inline-size", "220px", "important");
    select.style.setProperty("box-sizing", "border-box", "important");
    select.style.setProperty("height", "auto", "important");
    select.style.setProperty("min-height", "56px", "important");
    select.style.setProperty("opacity", "1", "important");
    select.style.setProperty("pointer-events", "auto", "important");
    select.style.setProperty("overflow", "visible", "important");
    select.style.setProperty("clip", "auto", "important");
    select.style.setProperty("clip-path", "none", "important");
    select.style.setProperty("white-space", "normal", "important");
  }

  function rebuildSafeSelect(select) {
    if (!select) return;

    var wrapper =
      select.nextElementSibling &&
      select.nextElementSibling.matches &&
      select.nextElementSibling.matches(
        "[data-drishvara-hf12-select]"
      )
        ? select.nextElementSibling
        : select.parentElement
          ? select.parentElement.querySelector(
              "[data-drishvara-hf12-select]"
            )
          : null;

    if (!wrapper) return;

    var button = wrapper.querySelector(
      ".drishvara-hf12-select-button"
    );
    var menu = wrapper.querySelector(
      ".drishvara-hf12-select-menu"
    );
    var selected = select.options[select.selectedIndex];

    wrapper.setAttribute("data-open", "false");

    if (button) {
      button.textContent = selected
        ? selected.textContent
        : "Select";
      button.disabled = false;
      button.removeAttribute("aria-disabled");
      button.setAttribute("aria-expanded", "false");
    }

    if (!menu) return;
    menu.innerHTML = "";

    Array.prototype.slice.call(select.options).forEach(
      function (option) {
        var item = document.createElement("button");
        item.type = "button";
        item.className = "drishvara-hf12-select-option";
        item.setAttribute("role", "option");
        item.dataset.value = option.value;
        item.textContent = option.textContent;
        item.setAttribute(
          "aria-selected",
          option.selected ? "true" : "false"
        );
        item.addEventListener("click", function () {
          select.value = option.value;
          select.dispatchEvent(
            new Event("change", { bubbles: true })
          );
          wrapper.setAttribute("data-open", "false");
          if (button) {
            button.setAttribute("aria-expanded", "false");
          }
        });
        menu.appendChild(item);
      }
    );
  }

  function optionFromRecord(record) {
    var option = document.createElement("option");
    option.value = record.selector_value;
    option.textContent = record.display_label;
    option.setAttribute(
      "data-ag75d-r1-approved-location",
      "true"
    );
    option.setAttribute(
      "data-location-id",
      record.canonical_place_id || ""
    );
    option.setAttribute("data-timezone", record.timezone || "");
    option.setAttribute(
      "data-latitude",
      String(record.latitude)
    );
    option.setAttribute(
      "data-longitude",
      String(record.longitude)
    );
    option.setAttribute(
      "data-review-status",
      "ag74p_public_approved"
    );
    return option;
  }

  function populateSelect(select, kind) {
    if (!select || !Array.isArray(records)) return;

    var previous =
      select.value ||
      (kind === "panchang" ? DEFAULT_VALUE : "");

    rebuilding = true;
    select.innerHTML = "";

    if (kind === "star-reflection") {
      var placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "Select birth place";
      select.appendChild(placeholder);
    }

    records.forEach(function (record) {
      select.appendChild(optionFromRecord(record));
    });

    var values = records.map(function (record) {
      return record.selector_value;
    });

    if (kind === "panchang") {
      select.value =
        values.indexOf(previous) !== -1
          ? previous
          : DEFAULT_VALUE;
    } else {
      select.value =
        values.indexOf(previous) !== -1 ? previous : "";
    }

    select.disabled = false;
    select.removeAttribute("disabled");
    select.removeAttribute("aria-disabled");
    select.setAttribute(
      "data-ag75d-r1-approved-option-count",
      String(records.length)
    );
    select.setAttribute(
      "data-ag75d-r1-shared-location-source",
      "ag74p-approved-location-projection"
    );

    if (kind === "star-reflection") {
      activateNativeStarSelect();
    } else {
      rebuildSafeSelect(select);
    }
    rebuilding = false;
    updateSummary(kind);
  }

  function governedSelector(select, kind) {
    if (!select || !Array.isArray(records)) return false;
    var options = Array.prototype.slice.call(select.options);
    var expected =
      records.length + (kind === "star-reflection" ? 1 : 0);

    if (options.length !== expected) return false;

    return options.every(function (option, index) {
      if (kind === "star-reflection" && index === 0) {
        return option.value === "";
      }
      return (
        option.getAttribute(
          "data-ag75d-r1-approved-location"
        ) === "true"
      );
    });
  }

  function ensureSelectors() {
    if (rebuilding || !Array.isArray(records)) return;

    var panchang = byId("panchang-place-select");
    var star = byId("star-birth-place-select");

    if (!governedSelector(panchang, "panchang")) {
      populateSelect(panchang, "panchang");
    }
    if (!governedSelector(star, "star-reflection")) {
      populateSelect(star, "star-reflection");
    }

    reconcileDom();
  }

  function observeSelectors() {
    [
      ["panchang-place-select", "panchang"],
      ["star-birth-place-select", "star-reflection"]
    ].forEach(function (entry) {
      var select = byId(entry[0]);
      if (!select) return;

      new MutationObserver(function () {
        window.setTimeout(ensureSelectors, 0);
      }).observe(select, { childList: true });
    });
  }

  function ritualRow() {
    var value = byId("upcoming-observance-ritual-window");
    if (!value || !value.closest) return null;
    var row = value.closest("div");
    if (row) {
      row.id = "upcoming-observance-ritual-window-row";
    }
    return row;
  }

  function syncRitualRow() {
    var value = byId("upcoming-observance-ritual-window");
    var row = ritualRow();
    if (!value || !row) return;

    var text = String(value.textContent || "").trim();
    var visible =
      text.length > 0 &&
      !/^not available/i.test(text);

    row.hidden = !visible;
    row.setAttribute(
      "data-ag75d-r1-reviewed-window-visible",
      visible ? "true" : "false"
    );

    if (!visible && /^not available/i.test(text)) {
      value.textContent = "";
    }
  }


  function syncEmptyObservanceDetails() {
    var name = byId("upcoming-observance-name");
    var begins = byId("upcoming-observance-begins");
    var ends = byId("upcoming-observance-ends");
    var list =
      begins && begins.closest
        ? begins.closest("dl")
        : null;

    if (!list) return;

    var noApproved =
      name &&
      /^No source-reviewed public observance is approved for this date\.?$/i
        .test(String(name.textContent || "").trim());

    list.hidden = Boolean(noApproved);
    list.setAttribute(
      "data-ag75d-r1-empty-observance-hidden",
      noApproved ? "true" : "false"
    );

    if (noApproved) {
      list.style.setProperty("display", "none", "important");
      if (begins) begins.textContent = "";
      if (ends) ends.textContent = "";
      syncRitualRow();
    } else {
      list.style.removeProperty("display");
    }
  }

  function injectStyle() {
    if (byId("ag75d-r1-public-surface-style")) return;

    var style = document.createElement("style");
    style.id = "ag75d-r1-public-surface-style";
    style.textContent = [
      'label[for="panchang-date-text"],',
      '#panchang-today,',
      '[data-ag74o-r3-request-commit],',
      '.ag74o-alias-field,',
      '[data-ag71d-r4-location-options],',
      '[data-ag71d-r5-search-forward-note],',
      '[data-ag71d-r6-location-basis-line] {',
      '  display: none !important;',
      '}',
      '.ag74i-date-controls {',
      '  display: grid !important;',
      '  grid-template-columns: minmax(0, 1fr) minmax(150px, 1.4fr) minmax(0, 1fr) !important;',
      '  gap: 0.75rem !important;',
      '  align-items: end !important;',
      '}',
      '@media (max-width: 640px) {',
      '  .ag74i-date-controls { grid-template-columns: 1fr !important; }',
      '}'
    ].join("\n");

    document.head.appendChild(style);
  }

  function reconcileDom() {
    injectStyle();

    remove('label[for="panchang-date-text"]');
    remove("#panchang-today");
    remove("[data-ag74o-r3-request-commit]");
    remove(".ag74o-alias-field");
    remove("#ag71d-r6-pilot-location-binding-data");

    document
      .querySelectorAll("[data-ag71d-r4-location-options]")
      .forEach(function (node) {
        node.remove();
      });

    document
      .querySelectorAll("[data-ag71d-r6-location-basis-line]")
      .forEach(function (node) {
        node.remove();
      });

    document
      .querySelectorAll("[data-ag71d-r5-search-forward-note]")
      .forEach(function (node) {
        node.hidden = true;
        node.setAttribute("aria-hidden", "true");
      });

    setText(
      "panchang-public-heading",
      "Panchang & Varanasi Lunar Calendar"
    );
    setText(
      "ag74i-calendar-book-title",
      "Varanasi Hindu Lunar Reference Calendar"
    );

    var introduction = document.querySelector(
      "[data-ag74i-public-introduction]"
    );
    if (introduction) {
      introduction.textContent =
        "Drishvara uses the governed SUP02 server runtime for the " +
        "selected civil date and approved location basis. Inputs " +
        "remain session-only and are not stored.";
    }

    var dateLabel = document.querySelector(
      'label[for="panchang-date-picker"] span'
    );
    if (dateLabel) dateLabel.textContent = "Date";

    var picker = byId("panchang-date-picker");
    if (picker) {
      picker.min = "1900-01-01";
      picker.max = "2100-12-31";
    }

    setText(
      "panchang-date-help",
      "Use Previous Day, the date picker or Next Day. The current " +
        "date is selected by default in the resolved IANA timezone."
    );

    var release = document.querySelector(
      "[data-ag74p-live-release]"
    );
    if (release) {
      release.innerHTML =
        "<strong>Governed public scope:</strong>" +
        "<span>5 approved named locations · worldwide coordinates " +
        "with a validated IANA timezone · Varanasi Hindu lunar " +
        "reference calendar · 114 approved generic monthly " +
        "observances.</span>";
    }

    var starNote = document.querySelector(
      '[data-ag71d-place-select-shell="star-reflection"] ' +
      ".ag71d-place-select-note"
    );
    if (starNote) {
      starNote.textContent =
        "Choose from the same five AG74P-approved named locations " +
        "used by Panchang, or use coordinate mode. Inputs remain " +
        "session-only.";
    }

    var panchangNote = document.querySelector(
      '[data-ag71d-place-select-shell="panchang"] ' +
      ".ag71d-place-select-note"
    );
    if (panchangNote) {
      panchangNote.textContent =
        "Choose one of the five AG74P-approved named locations, " +
        "or use coordinates with an explicit valid IANA timezone.";
    }

    activateNativeStarSelect();
    syncRitualRow();
    syncEmptyObservanceDetails();
  }

  function runPanchang() {
    if (
      typeof window.drishvaraSup02ApplySelection === "function"
    ) {
      window.drishvaraSup02ApplySelection({
        focusStatus: false
      });
    }
  }

  function scheduleCoordinateRun() {
    if (coordinateTimer) {
      window.clearTimeout(coordinateTimer);
    }

    var state = coordinateState("panchang");
    updateSummary("panchang");

    if (!state.valid) {
      setText(
        "panchang-selection-status",
        "Enter valid latitude, longitude and an IANA timezone. " +
          "The previous governed result remains unchanged."
      );
      return;
    }

    coordinateTimer = window.setTimeout(runPanchang, 500);
  }

  function claim(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  window.addEventListener(
    "click",
    function (event) {
      var target =
        event.target && event.target.closest
          ? event.target
          : null;
      if (!target) return;

      if (target.closest("#panchang-previous-day")) {
        claim(event);
        var previousPicker = byId("panchang-date-picker");
        if (
          previousPicker &&
          previousPicker.value &&
          typeof window.drishvaraSup02SyncDate === "function"
        ) {
          window.drishvaraSup02SyncDate(
            shiftDate(previousPicker.value, -1)
          );
          runPanchang();
        }
        return;
      }

      if (target.closest("#panchang-next-day")) {
        claim(event);
        var nextPicker = byId("panchang-date-picker");
        if (
          nextPicker &&
          nextPicker.value &&
          typeof window.drishvaraSup02SyncDate === "function"
        ) {
          window.drishvaraSup02SyncDate(
            shiftDate(nextPicker.value, 1)
          );
          runPanchang();
        }
        return;
      }

      var pageButton = target.closest(
        "[data-ag74i-book-page-button]"
      );
      if (pageButton) {
        claim(event);
        var page = Number(
          pageButton.getAttribute(
            "data-ag74i-book-page-button"
          )
        );
        if (
          typeof window.drishvaraSup02SetBookPage === "function"
        ) {
          window.drishvaraSup02SetBookPage(page);
        }
        setText(
          "ag74o-book-status",
          "Page " +
            page +
            " of 4 selected manually. The selected date remains " +
            displayDate(
              byId("panchang-date-picker")
                ? byId("panchang-date-picker").value
                : ""
            ) +
            "."
        );
        return;
      }

      if (target.closest("#ag74i-book-previous")) {
        claim(event);
        var currentPrevious =
          document.querySelector(
            "[data-ag74i-book-page-button][aria-current='page']"
          );
        var previousPage = Math.max(
          1,
          Number(
            currentPrevious
              ? currentPrevious.getAttribute(
                  "data-ag74i-book-page-button"
                )
              : 1
          ) - 1
        );
        if (
          typeof window.drishvaraSup02SetBookPage === "function"
        ) {
          window.drishvaraSup02SetBookPage(previousPage);
        }
        setText(
          "ag74o-book-status",
          "Page " + previousPage + " of 4 selected manually."
        );
        return;
      }

      if (target.closest("#ag74i-book-next")) {
        claim(event);
        var currentNext =
          document.querySelector(
            "[data-ag74i-book-page-button][aria-current='page']"
          );
        var nextPage = Math.min(
          4,
          Number(
            currentNext
              ? currentNext.getAttribute(
                  "data-ag74i-book-page-button"
                )
              : 1
          ) + 1
        );
        if (
          typeof window.drishvaraSup02SetBookPage === "function"
        ) {
          window.drishvaraSup02SetBookPage(nextPage);
        }
        setText(
          "ag74o-book-status",
          "Page " + nextPage + " of 4 selected manually."
        );
      }
    },
    true
  );

  window.addEventListener(
    "change",
    function (event) {
      if (!event.target) return;

      if (
        event.target.id === "panchang-date-picker" &&
        event.target.value
      ) {
        event.stopImmediatePropagation();
        if (
          typeof window.drishvaraSup02SyncDate === "function"
        ) {
          window.drishvaraSup02SyncDate(
            event.target.value
          );
        }
        runPanchang();
        return;
      }

      if (event.target.id === "panchang-place-select") {
        event.stopImmediatePropagation();
        if (
          typeof window.drishvaraSup02ChoosePlace === "function"
        ) {
          window.drishvaraSup02ChoosePlace(
            event.target.value
          );
        }
        updateSummary("panchang");
        runPanchang();
        return;
      }

      if (event.target.id === "star-birth-place-select") {
        event.stopImmediatePropagation();
        rebuildSafeSelect(event.target);
        updateSummary("star-reflection");
        return;
      }

      if (event.target.matches("input[data-ag71c-mode]")) {
        var surface = event.target.closest(
          "[data-ag71c-coordinate-surface]"
        );
        var kind = surface
          ? surface.getAttribute(
              "data-ag71c-coordinate-surface"
            )
          : null;

        if (
          kind === "panchang" ||
          kind === "star-reflection"
        ) {
          event.stopImmediatePropagation();
          setMode(kind, event.target.value);
          if (kind === "panchang") {
            if (event.target.value === "coordinates") {
              scheduleCoordinateRun();
            } else {
              runPanchang();
            }
          }
        }
      }
    },
    true
  );

  window.addEventListener(
    "input",
    function (event) {
      if (!event.target) return;

      if (
        [
          "panchang-latitude",
          "panchang-longitude",
          "panchang-timezone",
          "panchang-coordinate-label"
        ].includes(event.target.id)
      ) {
        event.stopImmediatePropagation();
        scheduleCoordinateRun();
        return;
      }

      if (
        [
          "star-birth-latitude",
          "star-birth-longitude",
          "star-birth-timezone",
          "star-birth-coordinate-label"
        ].includes(event.target.id)
      ) {
        event.stopImmediatePropagation();
        updateSummary("star-reflection");
      }
    },
    true
  );

  async function bootOverlay() {
    reconcileDom();
    setMode(
      "star-reflection",
      selectedMode("star-reflection")
    );
    setMode("panchang", selectedMode("panchang"));

    try {
      var response = await fetch(LOCATION_PATH, {
        cache: "no-store"
      });
      if (!response.ok) {
        throw new Error(
          "Approved-location projection unavailable"
        );
      }

      var payload = await response.json();
      if (
        !payload ||
        payload.record_count !== 5 ||
        !Array.isArray(payload.records) ||
        payload.records.length !== 5
      ) {
        throw new Error(
          "Approved-location projection count mismatch"
        );
      }

      records = payload.records;
      populateSelect(
        byId("panchang-place-select"),
        "panchang"
      );
      populateSelect(
        byId("star-birth-place-select"),
        "star-reflection"
      );
      observeSelectors();

      [0, 350, 700, 1200, 2000, 3200, 4800, 6500, 7500].forEach(
        function (delay) {
          window.setTimeout(function () {
            reconcileDom();
            ensureSelectors();
          }, delay);
        }
      );
    } catch (error) {
      setText(
        "panchang-selection-status",
        error.message ||
          "Approved-location projection unavailable."
      );
    }

    var ritualValue = byId(
      "upcoming-observance-ritual-window"
    );
    if (ritualValue) {
      new MutationObserver(syncRitualRow).observe(
        ritualValue,
        {
          childList: true,
          characterData: true,
          subtree: true
        }
      );
    }

    [
      "upcoming-observance-name",
      "upcoming-observance-begins",
      "upcoming-observance-ends"
    ].forEach(function (id) {
      var node = byId(id);
      if (!node) return;
      new MutationObserver(function () {
        syncRitualRow();
        syncEmptyObservanceDetails();
      }).observe(node, {
        childList: true,
        characterData: true,
        subtree: true
      });
    });

    syncEmptyObservanceDetails();
  }

  window.drishvaraAg75dR1SurfaceState = function () {
    return {
      approvedLocationCount: Array.isArray(records)
        ? records.length
        : null,
      sharedLocationProjection: true,
      dateControlContract:
        "previous_picker_next_auto_request",
      ritualWindowEmptyStateHidden: true,
      allFaithCalendarClaimed: false,
      inputPersistenceEnabled: false
    };
  };

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      bootOverlay,
      { once: true }
    );
  } else {
    bootOverlay();
  }
})();

(function () {
  "use strict";

  var FUNCTION_URL =
    "https://pajlabwwszmhjhabxprf.supabase.co/functions/v1/calculate-panchang";
  var ANNUAL_PATH =
    "data/knowledge-base/panchang-festival/production/ag74n-varanasi-samvat-2083-annual-calendar.json";
  var APPROVED_LOCATION_PATH =
    "data/knowledge-base/location-intelligence/production/ag74p-approved-location-projection.json";
  var DEFAULT_UI_STATE = {
    value: "varanasi-uttar-pradesh-india",
    canonicalId: "varanasi_in",
    label: "Varanasi / Banaras",
    timezone: "Asia/Kolkata",
    latitude: 25.3176,
    longitude: 82.9739
  };
  var SUPPORTED_START = "1900-01-01";
  var SUPPORTED_END = "2100-12-31";

  var card = document.getElementById("panchang-festival-card");
  if (!card || card.getAttribute("data-sup02-booted") === "true") return;

  window.drishvaraSup02PublicSurfaceActive = true;
  window.drishvaraAg74oPublicSurfaceActive = true;
  window.drishvaraAg74iPublicSurfaceActive = true;
  card.setAttribute("data-sup02-booted", "true");
  card.setAttribute("data-sup02-runtime", "server-only");
  card.setAttribute("data-sup02-input-persistence", "none");

  var state = {
    dateKey: "",
    bookPage: 1,
    requestToken: 0,
    activeAbort: null,
    annualCalendar: null,
    approvedLocations: null,
    selectedPlaceValue: DEFAULT_UI_STATE.value,
    lastCommittedRequest: null,
    pendingInputDirty: false
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    var node = byId(id);
    if (node) node.textContent = value;
  }

  function pad(value, width) {
    return String(value).padStart(width || 2, "0");
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(
      /[&<>"']/g,
      function (character) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;"
        }[character];
      }
    );
  }

  function isoToDisplay(value) {
    var match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match ? match[3] + "/" + match[2] + "/" + match[1] : "";
  }

  function displayToIso(value) {
    var match = String(value || "").trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return null;
    var day = Number(match[1]);
    var month = Number(match[2]);
    var year = Number(match[3]);
    var probe = new Date(Date.UTC(year, month - 1, day, 12));
    if (
      probe.getUTCFullYear() !== year ||
      probe.getUTCMonth() !== month - 1 ||
      probe.getUTCDate() !== day
    ) {
      return null;
    }
    return match[3] + "-" + match[2] + "-" + match[1];
  }

  function applyDateMask(value) {
    var digits = String(value || "").replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
  }

  function shiftDate(dateKey, amount) {
    var values = dateKey.split("-").map(Number);
    var date = new Date(Date.UTC(values[0], values[1] - 1, values[2] + amount, 12));
    return (
      pad(date.getUTCFullYear(), 4) +
      "-" +
      pad(date.getUTCMonth() + 1) +
      "-" +
      pad(date.getUTCDate())
    );
  }

  function todayInTimezone(timezone) {
    var values = {};
    new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    })
      .formatToParts(new Date())
      .forEach(function (part) {
        values[part.type] = part.value;
      });
    return values.year + "-" + values.month + "-" + values.day;
  }

  function selectedMode() {
    var checked = document.querySelector(
      'input[name="ag71c-panchang-location-mode"]:checked'
    );
    return checked && checked.value === "coordinates" ? "coordinates" : "place";
  }

  function normalAlias(value) {
    return String(value || "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function setBusy(busy) {
    card.setAttribute("aria-busy", busy ? "true" : "false");
    card.setAttribute("data-sup02-loading", busy ? "true" : "false");
    var button = byId("panchang-calculate");
    if (button) {
      button.disabled = Boolean(busy);
      button.setAttribute("aria-busy", busy ? "true" : "false");
    }
  }

  function setResultState(name) {
    card.setAttribute("data-sup02-result-state", name);
    card.setAttribute("data-ag74o-result-state", name);
    card.setAttribute(
      "data-ag74i-result-state",
      name === "calculated" ? "unique_publicly_approved_record" : name
    );
  }

  function setRequestStatus(message, stateName) {
    setText("panchang-request-status", message);
    var node = byId("panchang-request-status");
    if (node) node.setAttribute("data-sup02-request-state", stateName || "ready");
    card.setAttribute("data-sup02-request-state", stateName || "ready");
  }

  function syncDate(dateKey) {
    state.dateKey = dateKey;
    if (byId("panchang-date-picker")) byId("panchang-date-picker").value = dateKey;
    if (byId("panchang-date-text")) {
      byId("panchang-date-text").value = isoToDisplay(dateKey);
    }
    setText(
      "panchang-selected-date-label",
      isoToDisplay(dateKey) + " · selected civil date"
    );
  }

  function approvedLocationRecords() {
    return state.approvedLocations &&
      Array.isArray(state.approvedLocations.records)
      ? state.approvedLocations.records
      : [];
  }

  function locationRecordByValue(value) {
    return (
      approvedLocationRecords().find(function (record) {
        return record.selector_value === value;
      }) || null
    );
  }

  function rebuildSafeSelect(select) {
    var safeWrap =
      select.nextElementSibling &&
      select.nextElementSibling.matches &&
      select.nextElementSibling.matches("[data-drishvara-hf12-select]")
        ? select.nextElementSibling
        : null;
    if (!safeWrap) return;

    safeWrap.setAttribute("data-open", "false");
    var safeButton = safeWrap.querySelector(".drishvara-hf12-select-button");
    var menu = safeWrap.querySelector(".drishvara-hf12-select-menu");
    var selected = select.options[select.selectedIndex];

    if (safeButton) {
      safeButton.textContent = selected ? selected.textContent : "Select";
      safeButton.disabled = false;
      safeButton.removeAttribute("aria-disabled");
      safeButton.setAttribute("aria-expanded", "false");
    }
    if (!menu) return;

    menu.innerHTML = "";
    Array.prototype.slice.call(select.options).forEach(function (option) {
      var item = document.createElement("button");
      item.type = "button";
      item.className = "drishvara-hf12-select-option";
      item.setAttribute("role", "option");
      item.dataset.value = option.value;
      item.textContent = option.textContent;
      item.setAttribute("aria-selected", option.selected ? "true" : "false");
      item.addEventListener("click", function () {
        select.value = option.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        safeWrap.setAttribute("data-open", "false");
        if (safeButton) safeButton.setAttribute("aria-expanded", "false");
      });
      menu.appendChild(item);
    });
  }

  function renderApprovedLocationSelector(records) {
    var select = byId("panchang-place-select");
    if (!select || !Array.isArray(records) || !records.length) return;

    var previous =
      select.value || state.selectedPlaceValue || DEFAULT_UI_STATE.value;
    select.innerHTML = "";

    records.forEach(function (record) {
      var option = document.createElement("option");
      option.value = record.selector_value;
      option.textContent = record.display_label;
      option.setAttribute("data-sup02-governed-location", "true");
      select.appendChild(option);
    });

    var nextValue = records.some(function (record) {
      return record.selector_value === previous;
    })
      ? previous
      : DEFAULT_UI_STATE.value;

    select.value = nextValue;
    state.selectedPlaceValue = nextValue;
    select.disabled = false;
    select.removeAttribute("aria-disabled");
    select.setAttribute("data-sup02-approved-option-count", String(records.length));
    rebuildSafeSelect(select);
  }

  function choosePlace(value) {
    var record =
      locationRecordByValue(value) ||
      (value === DEFAULT_UI_STATE.value ? DEFAULT_UI_STATE : null);
    if (!record) return false;

    state.selectedPlaceValue = value;
    var select = byId("panchang-place-select");
    if (select) {
      select.value = value;
      select.disabled = false;
      select.removeAttribute("aria-disabled");
      select.setAttribute("data-sup02-selected-value", value);
      rebuildSafeSelect(select);
    }
    card.setAttribute("data-sup02-selected-place", value);
    return true;
  }

  function requestFromUi() {
    if (selectedMode() === "coordinates") {
      return {
        mode: "coordinates",
        civil_date: state.dateKey,
        latitude: Number(byId("panchang-latitude").value),
        longitude: Number(byId("panchang-longitude").value),
        timezone: String(byId("panchang-timezone").value || "").trim(),
        display_label:
          (byId("panchang-coordinate-label") &&
            byId("panchang-coordinate-label").value.trim()) ||
          "Entered coordinates"
      };
    }

    var alias = normalAlias(
      byId("panchang-place-alias") && byId("panchang-place-alias").value
    );
    var select = byId("panchang-place-select");
    var value =
      (select && select.value) ||
      state.selectedPlaceValue ||
      DEFAULT_UI_STATE.value;
    var record = locationRecordByValue(value) || DEFAULT_UI_STATE;

    return {
      mode: "named_location",
      civil_date: state.dateKey,
      place: alias || undefined,
      selector_value: alias ? undefined : value,
      display_label: alias
        ? "Entered place alias: " + alias
        : record.display_label || record.label,
      timezone: record.timezone,
      canonical_place_id:
        record.canonical_place_id || record.canonicalId || null
    };
  }

  function compactTransition(type, result) {
    var transition = result && result.transitions && result.transitions[type];
    if (
      !transition ||
      !transition.previous ||
      !transition.next ||
      !transition.previous.local ||
      !transition.next.local
    ) {
      return "Approved transition detail unavailable";
    }
    var nextName =
      result.elements &&
      result.elements[type] &&
      transition.next.toIndex === result.elements[type].index
        ? result.elements[type].name
        : "next segment";
    return (
      "Began " +
      transition.previous.local.replace("T", " ") +
      " · Next " +
      transition.next.local.replace("T", " ") +
      " (" +
      nextName +
      ")"
    );
  }

  function setProvenance(response) {
    var basis = response.location_basis || {};
    setText(
      "panchang-location-provenance",
      (basis.display_label || "Resolved location") + " · server-governed basis"
    );
    setText(
      "panchang-coordinate-provenance",
      String(basis.latitude) +
        ", " +
        String(basis.longitude) +
        " · server-resolved calculation coordinates"
    );
    setText(
      "panchang-timezone-provenance",
      (basis.timezone || "Timezone unavailable") + " · approved IANA basis"
    );
    setText(
      "panchang-approval-provenance",
      "Governed server runtime · no automatic place or timezone substitution"
    );
  }

  function formatRitualWindows(windows) {
    if (!Array.isArray(windows) || !windows.length) return "Not available";
    return windows
      .map(function (item) {
        var label =
          item.label ||
          item.window_label ||
          item.ritual_name ||
          item.type ||
          "Ritual window";
        var start = item.start_local || item.start || "Start unavailable";
        var end = item.end_local || item.end || "End unavailable";
        return label + ": " + start + " – " + end;
      })
      .join(" · ");
  }

  function renderObservances(observances) {
    var records = Array.isArray(observances)
      ? observances
          .map(function (item) {
            return item && item.record ? item.record : null;
          })
          .filter(Boolean)
      : [];

    var approved = records.filter(function (record) {
      return (
        record.final_observance_date_approved === true &&
        record.public_output_allowed === true
      );
    });
    var item = approved[0] || null;

    if (!item) {
      setText(
        "upcoming-observance-name",
        "No source-reviewed public observance is approved for this date."
      );
      setText(
        "upcoming-observance-note",
        "Astronomical conditions are not substituted for public festival dates."
      );
      setText("upcoming-observance-begins", "Not available");
      setText("upcoming-observance-ends", "Not available");
      setText("upcoming-observance-ritual-window", "Not available");
      return;
    }

    var publicWindow = item.primary_public_window || {};
    setText(
      "upcoming-observance-name",
      item.display_name +
        (approved.length > 1
          ? " · " + String(approved.length) + " approved observances"
          : "")
    );
    setText(
      "upcoming-observance-note",
      "Source-reviewed public observance · " +
        ((item.location_basis && item.location_basis.display_label) ||
          "approved location basis") +
        " · rule " +
        ((item.rule_basis && (item.rule_basis.rule_id || item.rule_basis.label)) ||
          "approved")
    );
    setText(
      "upcoming-observance-begins",
      publicWindow.start_local || "Not available"
    );
    setText(
      "upcoming-observance-ends",
      publicWindow.end_local || "Not available"
    );
    setText(
      "upcoming-observance-ritual-window",
      formatRitualWindows(item.ritual_windows)
    );
  }

  function renderPending(request, reason, stateName) {
    setText(
      "panchang-calculation-source",
      "Governed server runtime unavailable for public cutover"
    );
    setText(
      "panchang-method-basis",
      "SUP02 server runtime · no browser-local astronomy fallback"
    );
    setText(
      "panchang-moonrise",
      request.display_label || "Unresolved location"
    );
    setText("panchang-moonset", isoToDisplay(request.civil_date));
    [
      "panchang-sunrise",
      "panchang-sunset",
      "panchang-vara",
      "panchang-tithi",
      "panchang-nakshatra",
      "panchang-yoga",
      "panchang-karana",
      "panchang-paksha",
      "panchang-tithi-transition",
      "panchang-nakshatra-transition",
      "panchang-yoga-transition",
      "panchang-karana-transition"
    ].forEach(function (id) {
      setText(id, "Unavailable");
    });
    setText(
      "panchang-selection-status",
      reason +
        " No local calculation, alternate place, date or timezone was substituted."
    );
    renderObservances([]);
    setResultState(stateName || "server_cutover_pending");
    setBusy(false);
  }

  function renderGovernedError(request, error) {
    var detail = error && error.error ? error.error : {};
    var message =
      detail.message ||
      "The governed Panchang runtime could not complete this request.";
    if (detail.guide_to_coordinates === true) {
      message += " Enter coordinates with a validated IANA timezone.";
    }
    renderPending(request, message, "governed_error");
  }

  function renderServerResult(response, request) {
    var result = response.panchang && response.panchang.result;
    if (!result || result.available !== true) {
      renderPending(
        request,
        (result && result.reason) ||
          "The server runtime returned no approved Panchang result.",
        "governed_unavailable"
      );
      return;
    }

    var basis = response.location_basis || {};
    setText(
      "panchang-calculation-source",
      response.panchang.source === "approved_precomputed_record"
        ? "Approved governed server record"
        : "Calculated by governed Supabase server runtime"
    );
    setText(
      "panchang-method-basis",
      "SUP02 server runtime · Modern Drik · Lahiri/Chitrapaksha · no browser-local calculation"
    );
    setText(
      "panchang-moonrise",
      (basis.display_label || request.display_label || "Resolved location") +
        " · " +
        (basis.timezone || "Timezone unavailable")
    );
    setText("panchang-moonset", isoToDisplay(request.civil_date));
    setText(
      "panchang-sunrise",
      result.sunrise && result.sunrise.local
        ? result.sunrise.local.replace("T", " ")
        : "Not available"
    );
    setText(
      "panchang-sunset",
      result.sunset && result.sunset.local
        ? result.sunset.local.replace("T", " ")
        : "No sunset within this civil date"
    );
    setText(
      "panchang-vara",
      result.vara
        ? result.vara.english + " · " + result.vara.sanskrit
        : "Not available"
    );
    setText(
      "panchang-tithi",
      result.elements && result.elements.tithi
        ? result.elements.tithi.name +
            " (" +
            result.elements.tithi.index +
            ")"
        : "Not available"
    );
    setText(
      "panchang-nakshatra",
      result.elements && result.elements.nakshatra
        ? result.elements.nakshatra.name +
            " (" +
            result.elements.nakshatra.index +
            ")"
        : "Not available"
    );
    setText(
      "panchang-yoga",
      result.elements && result.elements.yoga
        ? result.elements.yoga.name +
            " (" +
            result.elements.yoga.index +
            ")"
        : "Not available"
    );
    setText(
      "panchang-karana",
      result.elements && result.elements.karana
        ? result.elements.karana.name +
            " (" +
            result.elements.karana.index +
            ")"
        : "Not available"
    );
    setText("panchang-paksha", result.paksha || "Not available");
    setText(
      "panchang-tithi-transition",
      compactTransition("tithi", result)
    );
    setText(
      "panchang-nakshatra-transition",
      compactTransition("nakshatra", result)
    );
    setText("panchang-yoga-transition", compactTransition("yoga", result));
    setText(
      "panchang-karana-transition",
      compactTransition("karana", result)
    );
    setText(
      "panchang-selection-status",
      "Server-governed Panchang displayed for " +
        (basis.display_label || request.display_label || "resolved location") +
        " on " +
        isoToDisplay(request.civil_date) +
        ". No input has been stored."
    );
    setProvenance(response);
    renderObservances(response.observances);
    setResultState("calculated");
    setBusy(false);
  }

  function monthDateRange(instance) {
    if (instance.segments && instance.segments.length) {
      return instance.segments
        .map(function (segment) {
          return (
            isoToDisplay(segment.start_civil_date) +
            "–" +
            isoToDisplay(segment.end_civil_date)
          );
        })
        .join(" · ");
    }
    return (
      isoToDisplay(instance.start_civil_date) +
      "–" +
      isoToDisplay(instance.end_civil_date)
    );
  }

  function setBookPage(page) {
    var safe = Math.max(1, Math.min(4, Number(page) || 1));
    state.bookPage = safe;
    document.querySelectorAll("[data-ag74i-book-page]").forEach(function (panel) {
      panel.hidden =
        Number(panel.getAttribute("data-ag74i-book-page")) !== safe;
    });
    document
      .querySelectorAll("[data-ag74i-book-page-button]")
      .forEach(function (button) {
        if (
          Number(button.getAttribute("data-ag74i-book-page-button")) === safe
        ) {
          button.setAttribute("aria-current", "page");
        } else {
          button.removeAttribute("aria-current");
        }
      });
  }

  function renderBook(calendar, dateKey) {
    if (
      !calendar ||
      !calendar.annual_book ||
      !Array.isArray(calendar.annual_book.pages)
    ) {
      setText("ag74o-book-status", "Annual reference book unavailable.");
      return;
    }

    setText(
      "ag74i-calendar-year-label",
      "Vikram Samvat " +
        calendar.samvat_year +
        " · " +
        isoToDisplay(calendar.start_boundary.civil_date) +
        " to " +
        isoToDisplay(
          shiftDate(calendar.end_boundary_exclusive.civil_date, -1)
        )
    );

    var selectedRecord = Array.isArray(calendar.daily_records)
      ? calendar.daily_records.find(function (record) {
          return record.civil_date === dateKey;
        })
      : null;
    var selectedPage = 1;

    calendar.annual_book.pages.forEach(function (page) {
      var panel = document.querySelector(
        '[data-ag74i-book-page="' + page.page_number + '"]'
      );
      if (!panel) return;

      var slots = page.slots
        .map(function (slot) {
          if (
            selectedRecord &&
            selectedRecord.lunar_month &&
            slot.canonical_key === selectedRecord.lunar_month.canonical_key
          ) {
            selectedPage = page.page_number;
          }

          var instances = (slot.instances || [])
            .map(function (instance) {
              var kind =
                instance.instance_kind === "adhika"
                  ? "Adhika"
                  : instance.instance_kind === "nija"
                    ? "Nija"
                    : "Regular";
              return (
                '<div class="ag74o-month-instance" data-ag74o-instance-kind="' +
                escapeHtml(instance.instance_kind) +
                '"><span class="ag74o-instance-kind">' +
                kind +
                "</span><span>" +
                escapeHtml(monthDateRange(instance)) +
                "</span></div>"
              );
            })
            .join("");

          if (slot.kshaya_exception) {
            instances =
              '<div class="ag74o-month-instance ag74o-kshaya">Kshaya exception — no physical month fabricated</div>';
          }

          return (
            '<section class="ag74o-month-slot" data-ag74o-book-slot="' +
            escapeHtml(slot.canonical_key) +
            '"><div class="ag74o-month-slot-heading"><h5>' +
            escapeHtml(slot.canonical_name) +
            "</h5><span>" +
            escapeHtml(slot.slot_status.replaceAll("_", " ")) +
            "</span></div>" +
            instances +
            "</section>"
          );
        })
        .join("");

      panel.innerHTML =
        '<p class="ag74i-book-page-number">Page ' +
        page.page_number +
        ' of 4</p><h4>Canonical lunar-month slots ' +
        ((page.page_number - 1) * 3 + 1) +
        "–" +
        page.page_number * 3 +
        '</h4><div class="ag74o-month-slot-grid">' +
        slots +
        "</div>";
    });

    if (selectedRecord) {
      setText(
        "ag74o-book-status",
        "Selected Varanasi date belongs to " +
          selectedRecord.lunar_month.canonical_name +
          ". Page " +
          selectedPage +
          " opened automatically."
      );
      setBookPage(selectedPage);
    } else {
      setText(
        "ag74o-book-status",
        "The selected date is outside the generated Vikram Samvat 2083 reference interval. The Varanasi book remains available for direct page navigation."
      );
    }
  }

  async function loadReferenceData(signal) {
    if (state.annualCalendar && state.approvedLocations) {
      return {
        calendar: state.annualCalendar,
        locations: state.approvedLocations
      };
    }

    var values = await Promise.all([
      fetch(ANNUAL_PATH, { cache: "no-store", signal: signal }).then(
        function (response) {
          if (!response.ok) throw new Error("Annual book unavailable");
          return response.json();
        }
      ),
      fetch(APPROVED_LOCATION_PATH, {
        cache: "no-store",
        signal: signal
      }).then(function (response) {
        if (!response.ok) {
          throw new Error("Approved-location projection unavailable");
        }
        return response.json();
      })
    ]);

    if (
      !values[1] ||
      values[1].record_count !== values[1].records.length
    ) {
      throw new Error("Approved-location projection count mismatch");
    }

    state.annualCalendar = values[0];
    state.approvedLocations = values[1];
    renderApprovedLocationSelector(values[1].records);

    return { calendar: values[0], locations: values[1] };
  }

  async function callRuntime(request, signal) {
    var payload =
      request.mode === "coordinates"
        ? {
            mode: "coordinates",
            civil_date: request.civil_date,
            latitude: request.latitude,
            longitude: request.longitude,
            timezone: request.timezone
          }
        : {
            mode: "named_location",
            civil_date: request.civil_date,
            place: request.place,
            selector_value: request.selector_value
          };

    Object.keys(payload).forEach(function (key) {
      if (payload[key] === undefined || payload[key] === null || payload[key] === "") {
        delete payload[key];
      }
    });

    var response = await fetch(FUNCTION_URL, {
      method: "POST",
      cache: "no-store",
      credentials: "omit",
      referrerPolicy: "strict-origin-when-cross-origin",
      signal: signal,
      headers: {
        "Content-Type": "application/json",
        "X-Client-Info": "drishvara-sup02-public-panchang"
      },
      body: JSON.stringify(payload)
    });

    var body;
    try {
      body = await response.json();
    } catch (_error) {
      body = {
        status: "governed_error",
        error: {
          code: "invalid_runtime_response",
          message: "The governed server returned an unreadable response."
        }
      };
    }

    if (!response.ok) {
      var runtimeError = new Error(
        (body.error && body.error.message) ||
          "The governed server request failed."
      );
      runtimeError.governedBody = body;
      throw runtimeError;
    }

    return body;
  }

  function settleCommittedRequest(request, resultState) {
    state.pendingInputDirty = false;
    state.lastCommittedRequest = {
      mode: request.mode,
      civil_date: request.civil_date,
      selector_value: request.selector_value || null,
      place: request.place || null,
      timezone: request.timezone || null
    };
    card.setAttribute("data-sup02-request-dirty", "false");
    setRequestStatus(
      "Committed request resolved as " +
        resultState +
        " for " +
        isoToDisplay(request.civil_date) +
        ".",
      "committed"
    );
  }

  function markRequestPending(message) {
    state.requestToken += 1;
    if (state.activeAbort) state.activeAbort.abort();
    state.activeAbort = null;
    state.pendingInputDirty = true;
    card.setAttribute("data-sup02-request-dirty", "true");
    setBusy(false);
    setRequestStatus(
      message ||
        "Inputs changed. Press Calculate Panchang to commit this request.",
      "input_pending"
    );
    if (state.annualCalendar) renderBook(state.annualCalendar, state.dateKey);
  }

  async function applySelection(options) {
    options = options || {};
    state.requestToken += 1;
    var token = state.requestToken;

    if (state.activeAbort) state.activeAbort.abort();
    state.activeAbort = new AbortController();

    var request = requestFromUi();
    if (
      !request.civil_date ||
      request.civil_date < SUPPORTED_START ||
      request.civil_date > SUPPORTED_END
    ) {
      renderPending(
        request,
        "Date must be from 01/01/1900 to 31/12/2100.",
        "invalid_input"
      );
      settleCommittedRequest(request, "invalid_input");
      return false;
    }

    setBusy(true);
    setResultState("loading");
    setRequestStatus(
      options.boot === true
        ? "Loading today’s governed server Panchang…"
        : "Sending the committed request to the governed server runtime…",
      "loading"
    );
    setText(
      "panchang-selection-status",
      "Resolving the request through the active Supabase Panchang runtime…"
    );

    try {
      var reference = await loadReferenceData(state.activeAbort.signal);
      if (token !== state.requestToken) return false;
      renderBook(reference.calendar, request.civil_date);

      var response = await callRuntime(request, state.activeAbort.signal);
      if (token !== state.requestToken) return false;

      if (
        !response.privacy ||
        response.privacy.calculation_request_persisted !== false ||
        response.privacy.location_input_persisted !== false ||
        response.privacy.personal_data_persisted !== false
      ) {
        renderPending(
          request,
          "The server response did not satisfy the zero-persistence contract.",
          "privacy_contract_rejected"
        );
        settleCommittedRequest(request, "privacy_contract_rejected");
        return false;
      }

      if (response.public_ui_cutover_active !== true) {
        renderPending(
          request,
          "The server runtime is active, but the governed public cutover flag is not enabled.",
          "server_cutover_pending"
        );
        settleCommittedRequest(request, "server_cutover_pending");
        return false;
      }

      renderServerResult(response, request);
      settleCommittedRequest(request, "calculated");

      if (options.focusStatus === true && byId("panchang-selection-status")) {
        byId("panchang-selection-status").focus();
      }
      return true;
    } catch (error) {
      if (error && error.name === "AbortError") return false;
      if (token !== state.requestToken) return false;
      renderGovernedError(request, error && error.governedBody);
      settleCommittedRequest(request, "governed_error");
      return false;
    }
  }

  window.addEventListener(
    "change",
    function (event) {
      if (!event.target) return;

      if (event.target.id === "panchang-place-select") {
        event.stopImmediatePropagation();
        choosePlace(event.target.value);
        if (byId("panchang-place-alias")) {
          byId("panchang-place-alias").value = "";
        }
        markRequestPending(
          "Place input changed. Press Calculate Panchang to commit this request."
        );
        return;
      }

      if (event.target.id === "panchang-date-picker" && event.target.value) {
        syncDate(event.target.value);
        markRequestPending(
          "Date input changed. Press Calculate Panchang to commit this request."
        );
        return;
      }

      if (event.target.id === "panchang-date-text") {
        var parsed = displayToIso(event.target.value);
        if (parsed) {
          syncDate(parsed);
          markRequestPending(
            "Date input changed. Press Calculate Panchang to commit this request."
          );
        } else {
          setRequestStatus(
            "Enter a valid date in DD/MM/YYYY format.",
            "invalid_pending_input"
          );
        }
        return;
      }

      if (
        event.target.matches(
          'input[name="ag71c-panchang-location-mode"]'
        )
      ) {
        var surface = document.querySelector(
          '[data-ag71c-coordinate-surface="panchang"]'
        );
        if (surface) surface.setAttribute("data-ag71d-mode", event.target.value);
        markRequestPending(
          "Location mode changed. Press Calculate Panchang to commit this request."
        );
        return;
      }

      if (
        [
          "panchang-latitude",
          "panchang-longitude",
          "panchang-timezone",
          "panchang-coordinate-label",
          "panchang-place-alias"
        ].includes(event.target.id)
      ) {
        markRequestPending(
          "Location input changed. Press Calculate Panchang to commit this request."
        );
      }
    },
    true
  );

  document.addEventListener("input", function (event) {
    if (event.target && event.target.id === "panchang-date-text") {
      event.target.value = applyDateMask(event.target.value);
    }
  });

  window.addEventListener(
    "click",
    function (event) {
      var target = event.target && event.target.closest
        ? event.target
        : null;
      if (!target) return;

      function claim() {
        event.preventDefault();
        event.stopImmediatePropagation();
      }

      if (target.closest("#panchang-calculate")) {
        claim();
        applySelection({ focusStatus: true });
        return;
      }

      if (target.closest("#panchang-previous-day")) {
        claim();
        syncDate(shiftDate(state.dateKey, -1));
        markRequestPending(
          "Previous Day selected. Press Calculate Panchang to commit it."
        );
        return;
      }

      if (target.closest("#panchang-next-day")) {
        claim();
        syncDate(shiftDate(state.dateKey, 1));
        markRequestPending(
          "Next Day selected. Press Calculate Panchang to commit it."
        );
        return;
      }

      if (target.closest("#panchang-today")) {
        claim();
        var request = requestFromUi();
        var timezone =
          request.mode === "coordinates" && request.timezone
            ? request.timezone
            : DEFAULT_UI_STATE.timezone;
        try {
          syncDate(todayInTimezone(timezone));
          markRequestPending(
            "Today selected using the stated timezone. Press Calculate Panchang to commit it."
          );
        } catch (_error) {
          setRequestStatus(
            "A valid IANA timezone is required to determine Today.",
            "invalid_pending_input"
          );
        }
        return;
      }

      var pageButton = target.closest("[data-ag74i-book-page-button]");
      if (pageButton) {
        claim();
        setBookPage(
          pageButton.getAttribute("data-ag74i-book-page-button")
        );
        return;
      }

      if (target.closest("#ag74i-book-previous")) {
        claim();
        setBookPage(state.bookPage - 1);
        return;
      }

      if (target.closest("#ag74i-book-next")) {
        claim();
        setBookPage(state.bookPage + 1);
      }
    },
    true
  );

  document.addEventListener("keydown", function (event) {
    if (
      event.target &&
      event.target.id === "panchang-place-alias" &&
      event.key === "Enter"
    ) {
      event.preventDefault();
      var calculate = byId("panchang-calculate");
      if (calculate) calculate.focus();
    }

    if (
      event.target &&
      event.target.matches("[data-ag74i-book-page-button]") &&
      (event.key === "ArrowLeft" || event.key === "ArrowRight")
    ) {
      event.preventDefault();
      setBookPage(
        state.bookPage + (event.key === "ArrowRight" ? 1 : -1)
      );
      var button = document.querySelector(
        '[data-ag74i-book-page-button="' + state.bookPage + '"]'
      );
      if (button) button.focus();
    }
  });

  async function boot() {
    choosePlace(DEFAULT_UI_STATE.value);
    syncDate(todayInTimezone(DEFAULT_UI_STATE.timezone));
    setBookPage(1);
    card.setAttribute("data-sup02-request-dirty", "false");
    card.setAttribute("data-sup02-public-runtime", "server-ready");

    setText(
      "panchang-calculation-source",
      "Connecting to governed Supabase Panchang runtime"
    );
    setText(
      "panchang-method-basis",
      "SUP02 server-only runtime · no browser-local astronomy"
    );
    setRequestStatus(
      "Loading Varanasi/Banaras today from the governed server runtime…",
      "boot_loading"
    );

    await applySelection({ boot: true, focusStatus: false });
  }

  window.drishvaraSup02ApplySelection = applySelection;
  window.drishvaraSup02MarkRequestPending = markRequestPending;
  window.drishvaraSup02SetBookPage = setBookPage;
  window.drishvaraSup02SyncDate = syncDate;
  window.drishvaraSup02ChoosePlace = choosePlace;
  window.drishvaraSup02ActivationState = function () {
    return {
      runtime: "server-only",
      functionUrl: FUNCTION_URL,
      requestDirty: state.pendingInputDirty,
      lastCommittedRequest: state.lastCommittedRequest,
      approvedLocationCount: state.approvedLocations
        ? state.approvedLocations.record_count
        : null,
      browserLocalAstronomyEnabled: false,
      inputPersistenceEnabled: false
    };
  };

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      function () {
        boot();
      },
      { once: true }
    );
  } else {
    boot();
  }
})();
