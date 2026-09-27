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
  var CURRENT_AG74P_RELEASE_RECORD_COUNT = 5;
  var STAR_RUNTIME_URL =
    "https://pajlabwwszmhjhabxprf.supabase.co/functions/v1/calculate-panchang";
  var STAR_OUTPUT_BANK_PATH =
    "data/methodology/star-reflection/" +
    "ag75c-expanded-star-reflection-output-bank.json";
  var STAR_ACCEPTED_PANCHANG_SOURCES = [
    "approved_precomputed_record",
    "approved_server_calculation"
  ];
  var STAR_RESOLUTION_STATES = [
    "exact_window_resolved",
    "unknown_day_context",
    "pending_input",
    "invalid_input",
    "runtime_unavailable",
    "runtime_error",
    "runtime_contract_mismatch",
    "missing_transition_metadata",
    "invalid_nakshatra_index",
    "unresolved_ambiguous_local_time",
    "unresolved_nonexistent_local_time",
    "exact_transition_minute_ambiguous",
    "exact_outside_single_transition_window"
  ];
  var STAR_NAKSHATRA_NAMES = [
    "",
    "Ashwini",
    "Bharani",
    "Krittika",
    "Rohini",
    "Mrigashira",
    "Ardra",
    "Punarvasu",
    "Pushya",
    "Ashlesha",
    "Magha",
    "Purva Phalguni",
    "Uttara Phalguni",
    "Hasta",
    "Chitra",
    "Swati",
    "Vishakha",
    "Anuradha",
    "Jyeshtha",
    "Mula",
    "Purva Ashadha",
    "Uttara Ashadha",
    "Shravana",
    "Dhanishta",
    "Shatabhisha",
    "Purva Bhadrapada",
    "Uttara Bhadrapada",
    "Revati"
  ];
  var LOCATION_APPROVAL_FIELDS = [
    "canonical_place_approved",
    "coordinate_approved",
    "timezone_approved",
    "public_selection_approved",
    "computation_approved",
    "public_output_allowed"
  ];
  var records = null;
  var rebuilding = false;
  var coordinateTimer = null;
  var starOutputBankPromise = null;
  var starOutputRecords = null;
  var starRuntimeBusy = false;
  var STAR_PLACE_PANEL_ID = "ag75d-e2-star-place-choice-panel";
  var STAR_PLACE_SUMMARY_ID = "ag75d-e2-star-place-summary";
  var starPlacePanel = null;
  var starState = {
    mode: "place",
    selectedLocation: null,
    latitude: "",
    longitude: "",
    timezone: "",
    coordinateLabel: ""
  };

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

    if (kind === "star-reflection") {
      if (shell) {
        hideHistoricalStarNode(
          shell,
          "data-ag75d-e2-star-shell-quarantined"
        );
      }
      var panel = byId(STAR_PLACE_PANEL_ID);
      if (panel) {
        panel.hidden = nextMode === "coordinates";
        panel.style.display =
          nextMode === "coordinates" ? "none" : "block";
      }
    } else if (shell) {
      shell.hidden = nextMode === "coordinates";
      shell.style.display =
        nextMode === "coordinates" ? "none" : "block";
    }

    if (kind === "star-reflection") {
      starState.mode = nextMode;
      syncStarCoordinateState();
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

  function syncStarCoordinateState() {
    var latitudeNode = byId("star-birth-latitude");
    var longitudeNode = byId("star-birth-longitude");
    var timezoneNode = byId("star-birth-timezone");
    var labelNode = byId("star-birth-coordinate-label");

    starState.latitude = latitudeNode
      ? String(latitudeNode.value || "")
      : "";
    starState.longitude = longitudeNode
      ? String(longitudeNode.value || "")
      : "";
    starState.timezone = timezoneNode
      ? String(timezoneNode.value || "").trim()
      : "";
    starState.coordinateLabel =
      labelNode && labelNode.value.trim()
        ? labelNode.value.trim()
        : "";
  }

  function normaliseApprovedLocationRecord(record, index) {
    if (!record || typeof record !== "object") {
      throw new Error(
        "Approved-location projection contains invalid record " +
          String(index + 1) +
          "."
      );
    }

    var latitude = Number(record.latitude);
    var longitude = Number(record.longitude);
    var selectorValue = String(record.selector_value || "").trim();
    var displayLabel = String(record.display_label || "").trim();
    var timezone = String(record.timezone || "").trim();
    var missingApprovalField = LOCATION_APPROVAL_FIELDS.find(
      function (field) {
        return record[field] !== true;
      }
    );

    if (
      !selectorValue ||
      !displayLabel ||
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90 ||
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180 ||
      !validTimezone(timezone)
    ) {
      throw new Error(
        "Approved-location projection contains incomplete record " +
          String(index + 1) +
          "."
      );
    }

    if (missingApprovalField) {
      throw new Error(
        "Approved-location projection record " +
          String(index + 1) +
          " lacks explicit " +
          missingApprovalField +
          " approval."
      );
    }

    return {
      canonical_place_id: String(
        record.canonical_place_id || ""
      ).trim(),
      selector_value: selectorValue,
      display_label: displayLabel,
      country_iso2: String(record.country_iso2 || "").trim(),
      country_name: String(record.country_name || "").trim(),
      administrative_level_1_name: String(
        record.administrative_level_1_name || ""
      ).trim(),
      latitude: latitude,
      longitude: longitude,
      timezone: timezone,
      search_labels: Array.isArray(record.search_labels)
        ? record.search_labels
            .map(function (label) {
              return String(label || "").trim();
            })
            .filter(Boolean)
        : [],
      canonical_place_approved: true,
      coordinate_approved: true,
      timezone_approved: true,
      public_selection_approved: true,
      computation_approved: true,
      public_output_allowed: true
    };
  }

  function assertUniqueApprovedLocationIdentity(nextRecords) {
    var selectorValues = Object.create(null);
    var canonicalIds = Object.create(null);

    nextRecords.forEach(function (record) {
      if (record.selector_value) {
        if (selectorValues[record.selector_value]) {
          throw new Error(
            "Approved-location projection contains duplicate selector_value: " +
              record.selector_value
          );
        }
        selectorValues[record.selector_value] = true;
      }

      if (record.canonical_place_id) {
        if (canonicalIds[record.canonical_place_id]) {
          throw new Error(
            "Approved-location projection contains duplicate canonical_place_id: " +
              record.canonical_place_id
          );
        }
        canonicalIds[record.canonical_place_id] = true;
      }
    });
  }

  function assertCurrentAg74pReleaseScope(payload, nextRecords) {
    if (
      payload.record_count !== CURRENT_AG74P_RELEASE_RECORD_COUNT ||
      nextRecords.length !== CURRENT_AG74P_RELEASE_RECORD_COUNT
    ) {
      throw new Error(
        "Current AG74P public projection must contain exactly " +
          String(CURRENT_AG74P_RELEASE_RECORD_COUNT) +
          " approved locations."
      );
    }
  }

  function approvedLocationRecords(payload) {
    if (!payload || !Array.isArray(payload.records)) {
      throw new Error(
        "Approved-location projection unavailable"
      );
    }

    if (
      typeof payload.record_count === "number" &&
      payload.record_count !== payload.records.length
    ) {
      throw new Error(
        "Approved-location projection count mismatch"
      );
    }

    var nextRecords = payload.records.map(
      normaliseApprovedLocationRecord
    );

    if (!nextRecords.length) {
      throw new Error(
        "Approved-location projection contains no locations"
      );
    }

    assertUniqueApprovedLocationIdentity(nextRecords);
    return nextRecords;
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

    var mode =
      kind === "star-reflection"
        ? starState.mode
        : selectedMode(kind);

    if (mode === "coordinates") {
      var coordinates = coordinateState(kind);
      if (kind === "star-reflection") {
        syncStarCoordinateState();
      }
      summary.textContent = coordinates.valid
        ? "Coordinate basis: " +
          coordinates.label +
          " · " +
          coordinates.timezone
        : "Coordinate basis: enter valid latitude, longitude and IANA timezone";
      return;
    }

    if (kind === "star-reflection") {
      var starRecord = starState.selectedLocation;
      summary.textContent = starRecord
        ? "Selected birth place: " + starRecord.display_label
        : "Selected birth place: not selected";
    } else {
      var select = byId("panchang-place-select");
      var record = select ? recordByValue(select.value) : null;
      summary.textContent = record
        ? "Selected Panchang location: " + record.display_label
        : "Selected Panchang location: not selected";
    }
  }


  /*
   * AG75D_E2_LEGACY_STAR_SELECT_QUARANTINE
   *
   * Keep the historical Star select, HF12 wrapper and R4 button surface out
   * of user-facing ownership. The AG75D button panel below owns current Star
   * location state; the old select can still be mutated by historical code
   * without affecting the visible interaction.
   */
  function hf12WrapperForSelect(select) {
    return select &&
      select.nextElementSibling &&
      select.nextElementSibling.matches &&
      select.nextElementSibling.matches("[data-drishvara-hf12-select]")
      ? select.nextElementSibling
      : select && select.parentElement
        ? select.parentElement.querySelector(
            "[data-drishvara-hf12-select]"
          )
        : null;
  }

  function hideHistoricalStarNode(node, marker) {
    if (!node) return;

    node.hidden = true;
    node.setAttribute("aria-hidden", "true");
    node.setAttribute(marker, "true");
    node.style.setProperty("display", "none", "important");
    node.style.setProperty("visibility", "hidden", "important");
    node.style.setProperty("pointer-events", "none", "important");
  }

  function quarantineLegacyStarSelect() {
    var select = byId("star-birth-place-select");
    if (!select) return null;

    var shell = select.closest(
      '[data-ag71d-place-select-shell="star-reflection"]'
    );
    if (shell) {
      hideHistoricalStarNode(
        shell,
        "data-ag75d-e2-star-shell-quarantined"
      );
      shell.setAttribute(
        "data-ag75d-e2-star-control-owner",
        "ag75d_button_panel"
      );
    }

    hideHistoricalStarNode(
      hf12WrapperForSelect(select),
      "data-ag75d-e2-star-wrapper-quarantined"
    );

    select.classList.add("drishvara-hf12-native-select-hidden");
    select.classList.add("ag75d-e2-legacy-star-birth-place-select");
    select.dataset.drishvaraHf12Converted = "true";
    select.setAttribute(
      "data-ag75d-e2-legacy-quarantined",
      "true"
    );
    select.setAttribute(
      "data-ag75d-e2-dropdown-state",
      "historical_select_hidden_not_authoritative"
    );
    select.setAttribute("aria-hidden", "true");
    select.setAttribute("tabindex", "-1");
    select.hidden = true;
    select.style.setProperty("display", "none", "important");
    select.style.setProperty("visibility", "hidden", "important");
    select.style.setProperty("position", "absolute", "important");
    select.style.setProperty("inline-size", "1px", "important");
    select.style.setProperty("block-size", "1px", "important");
    select.style.setProperty("opacity", "0", "important");
    select.style.setProperty("pointer-events", "none", "important");
    select.style.setProperty("overflow", "hidden", "important");
    select.style.setProperty("clip", "rect(0 0 0 0)", "important");
    select.style.setProperty("clip-path", "inset(50%)", "important");

    document
      .querySelectorAll(
        '[data-ag71d-r4-location-options="star-reflection"]'
      )
      .forEach(function (node) {
        hideHistoricalStarNode(
          node,
          "data-ag75d-e2-star-r4-quarantined"
        );
      });

    return select;
  }

  function starLocationSnapshot(record) {
    if (!record) return null;
    return {
      canonical_place_id: record.canonical_place_id,
      selector_value: record.selector_value,
      display_label: record.display_label,
      country_iso2: record.country_iso2,
      country_name: record.country_name,
      administrative_level_1_name:
        record.administrative_level_1_name,
      latitude: record.latitude,
      longitude: record.longitude,
      timezone: record.timezone
    };
  }

  function updateStarPlacePanelMode() {
    if (!starPlacePanel) return;
    var coordinates = starState.mode === "coordinates";
    starPlacePanel.hidden = coordinates;
    starPlacePanel.style.display = coordinates ? "none" : "block";
  }

  function updateStarPlacePanelSelection() {
    if (!starPlacePanel) return;

    var selectedValue = starState.selectedLocation
      ? starState.selectedLocation.selector_value
      : "";
    var summary = byId(STAR_PLACE_SUMMARY_ID);

    if (summary) {
      summary.textContent = starState.selectedLocation
        ? "Selected birth place: " +
          starState.selectedLocation.display_label
        : "Selected birth place: not selected";
    }

    starPlacePanel
      .querySelectorAll("[data-ag75d-e2-star-place-value]")
      .forEach(function (button) {
        button.setAttribute(
          "aria-pressed",
          button.getAttribute(
            "data-ag75d-e2-star-place-value"
          ) === selectedValue
            ? "true"
            : "false"
        );
      });
  }

  function populateStarPlaceChoicePanel() {
    if (!starPlacePanel || !Array.isArray(records)) return;

    var choices = starPlacePanel.querySelector(
      "[data-ag75d-e2-star-place-choices]"
    );
    if (!choices) return;

    if (
      choices.getAttribute("data-ag75d-e2-populated-count") ===
      String(records.length)
    ) {
      updateStarPlacePanelSelection();
      updateStarPlacePanelMode();
      return;
    }

    choices.innerHTML = "";
    records.forEach(function (record) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "ag75d-e2-star-place-choice";
      button.textContent = record.display_label;
      button.setAttribute(
        "data-ag75d-e2-star-place-value",
        record.selector_value
      );
      button.setAttribute(
        "data-location-id",
        record.canonical_place_id || ""
      );
      button.setAttribute("data-timezone", record.timezone || "");
      button.setAttribute(
        "data-latitude",
        String(record.latitude)
      );
      button.setAttribute(
        "data-longitude",
        String(record.longitude)
      );
      button.setAttribute("aria-pressed", "false");
      choices.appendChild(button);
    });

    choices.setAttribute(
      "data-ag75d-e2-populated-count",
      String(records.length)
    );
    starPlacePanel.setAttribute(
      "data-ag75d-e2-approved-option-count",
      String(records.length)
    );
    starPlacePanel.setAttribute(
      "data-ag75d-e2-shared-location-source",
      "ag74p-approved-location-projection"
    );
    updateStarPlacePanelSelection();
    updateStarPlacePanelMode();
  }

  function selectStarLocation(record) {
    starState.selectedLocation = record
      ? starLocationSnapshot(record)
      : null;

    if (starPlacePanel) {
      if (record) {
        starPlacePanel.setAttribute(
          "data-ag75d-e2-star-selected-location",
          record.selector_value
        );
        starPlacePanel.setAttribute(
          "data-ag75d-e2-star-selected-timezone",
          record.timezone
        );
      } else {
        starPlacePanel.removeAttribute(
          "data-ag75d-e2-star-selected-location"
        );
        starPlacePanel.removeAttribute(
          "data-ag75d-e2-star-selected-timezone"
        );
      }
    }

    updateStarPlacePanelSelection();
    updateSummary("star-reflection");
  }

  function ensureStarPlaceChoicePanel() {
    var select = quarantineLegacyStarSelect();
    var shell =
      select && select.closest
        ? select.closest(
            '[data-ag71d-place-select-shell="star-reflection"]'
          )
        : document.querySelector(
            '[data-ag71d-place-select-shell="star-reflection"]'
          );
    if (!shell) return;

    starPlacePanel = byId(STAR_PLACE_PANEL_ID);

    if (!starPlacePanel) {
      starPlacePanel = document.createElement("section");
      starPlacePanel.id = STAR_PLACE_PANEL_ID;
      starPlacePanel.className = "ag75d-e2-star-place-choice-panel";
      starPlacePanel.setAttribute(
        "data-ag75d-e2-star-place-choice-panel",
        "true"
      );
      starPlacePanel.setAttribute(
        "aria-labelledby",
        "ag75d-e2-star-place-choice-heading"
      );

      var heading = document.createElement("h3");
      heading.id = "ag75d-e2-star-place-choice-heading";
      heading.className = "ag75d-e2-star-place-choice-heading";
      heading.textContent = "Choose Birth Place";

      var choices = document.createElement("div");
      choices.className = "ag75d-e2-star-place-choices";
      choices.setAttribute(
        "data-ag75d-e2-star-place-choices",
        "true"
      );

      var summary = document.createElement("p");
      summary.id = STAR_PLACE_SUMMARY_ID;
      summary.className = "ag75d-e2-star-place-summary";
      summary.textContent = "Selected birth place: not selected";

      var note = document.createElement("p");
      note.className = "ag75d-e2-star-place-note";
      note.textContent =
        "Choose one approved birth place for this session only, " +
        "or use coordinate mode.";

      starPlacePanel.appendChild(heading);
      starPlacePanel.appendChild(choices);
      starPlacePanel.appendChild(summary);
      starPlacePanel.appendChild(note);

      if (shell.parentNode) {
        shell.parentNode.insertBefore(starPlacePanel, shell);
      }
    }

    populateStarPlaceChoicePanel();
  }

  function getPath(root, path) {
    return String(path || "")
      .split(".")
      .reduce(function (value, key) {
        return value && Object.prototype.hasOwnProperty.call(value, key)
          ? value[key]
          : undefined;
      }, root);
  }

  function starPreviewPanel() {
    return document.querySelector(
      '[data-ag71e-preview-panel="star-reflection"]'
    );
  }

  function starPreviewGrid() {
    return document.querySelector(
      '[data-ag71e-preview-grid="star-reflection"]'
    );
  }

  function starGenerateButton() {
    return document.querySelector(
      '[data-ag71e-preview-button="star-reflection"]'
    );
  }

  function starReflectionCard() {
    var panels = Array.prototype.slice.call(
      document.querySelectorAll(".card")
    );
    return panels.find(function (card) {
      var label = card.querySelector(".label");
      return (
        label &&
        String(label.textContent || "").trim() === "Star Reflection"
      );
    }) || null;
  }

  function starRow(label, value) {
    var row = document.createElement("div");
    row.className = "ag71e-preview-row";

    var strong = document.createElement("strong");
    strong.textContent = label;

    var span = document.createElement("span");
    span.textContent =
      value === undefined || value === null || value === ""
        ? "Not available"
        : String(value);

    row.appendChild(strong);
    row.appendChild(span);
    return row;
  }

  function setStarGenerateLoading(loading) {
    var button = starGenerateButton();
    if (!button) return;

    if (loading) {
      if (!button.getAttribute("data-ag75d-e3-original-label")) {
        button.setAttribute(
          "data-ag75d-e3-original-label",
          String(button.textContent || "").trim() ||
            "Generate Star Reflection Result"
        );
      }
      button.disabled = true;
      button.setAttribute("aria-busy", "true");
      button.textContent = "Calculating governed Star Reflection...";
      return;
    }

    button.disabled = false;
    button.removeAttribute("aria-busy");
    button.textContent =
      button.getAttribute("data-ag75d-e3-original-label") ||
      "Generate Star Reflection Result";
  }

  function showStarPanel(headingText) {
    var panel = starPreviewPanel();
    var heading = panel ? panel.querySelector("h3") : null;

    if (!panel) return null;
    panel.hidden = false;
    panel.removeAttribute("hidden");
    panel.setAttribute(
      "data-ag75d-e3-star-reflection-result",
      "active"
    );
    panel.removeAttribute("data-ag72e-star-preview-active");

    if (heading) heading.textContent = headingText;
    return panel;
  }

  function renderStarLoading() {
    var panel = showStarPanel("Calculating governed Star Reflection");
    var grid = starPreviewGrid();

    if (!panel || !grid) return;
    grid.innerHTML = "";
    grid.appendChild(
      starRow(
        "Status",
        "Resolving the session inputs through the governed Star Reflection flow."
      )
    );

    var note = panel.querySelector(".ag71e-preview-note");
    if (note) {
      note.textContent =
        "The runtime request sends only civil date and governed location " +
        "basis. Name and exact birth time are not sent or stored.";
    }
  }

  function renderStarClosedError(message) {
    var panel = showStarPanel("Governed Star Reflection unavailable");
    var grid = starPreviewGrid();
    var card = starReflectionCard();

    if (grid) {
      grid.innerHTML = "";
      grid.appendChild(starRow("Resolution state", "fail_closed"));
      grid.appendChild(
        starRow(
          "Result basis",
          message ||
            "The governed Star Reflection output could not be selected safely."
        )
      );
    }

    if (panel) {
      var note = panel.querySelector(".ag71e-preview-note");
      if (note) {
        note.textContent =
          "No fallback reflection is generated when the governed output " +
          "bank cannot map the resolver state to exactly one record.";
      }
    }

    if (card) {
      card.setAttribute(
        "data-ag75d-e3-star-reflection-state",
        "fail_closed"
      );
    }
  }

  function parseStarDob(value) {
    var raw = String(value || "").trim();
    if (!raw) {
      return {
        status: "pending",
        display: "DOB pending - DD/MM/YYYY"
      };
    }

    var match = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) {
      return {
        status: "invalid",
        display: "Invalid DOB format - use DD/MM/YYYY"
      };
    }

    var day = Number(match[1]);
    var month = Number(match[2]);
    var year = Number(match[3]);
    var test = new Date(Date.UTC(year, month - 1, day, 12));
    var civilDate =
      match[3] + "-" + match[2] + "-" + match[1];

    if (
      test.getUTCFullYear() !== year ||
      test.getUTCMonth() + 1 !== month ||
      test.getUTCDate() !== day ||
      civilDate < "1900-01-01" ||
      civilDate > "2100-12-31"
    ) {
      return {
        status: "invalid",
        display: "Invalid DOB - supported range is 01/01/1900 to 31/12/2100"
      };
    }

    return {
      status: "valid",
      civilDate: civilDate,
      display: match[1] + "/" + match[2] + "/" + match[3]
    };
  }

  function parseStarBirthTime(value, unknownChecked) {
    if (unknownChecked) {
      return {
        precision: "unknown",
        display: "Exact birth time not known",
        runtimeEligible: true
      };
    }

    var raw = String(value || "").trim();
    if (!raw) {
      return {
        precision: "pending",
        display: "Birth time pending - HH:MM",
        runtimeEligible: false
      };
    }

    var match = raw.match(/^(\d{2}):(\d{2})$/);
    if (!match) {
      return {
        precision: "invalid",
        display: "Invalid birth time - use HH:MM",
        runtimeEligible: false
      };
    }

    var hour = Number(match[1]);
    var minute = Number(match[2]);
    if (
      !Number.isInteger(hour) ||
      !Number.isInteger(minute) ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      return {
        precision: "invalid",
        display: "Invalid birth time - use 00:00 to 23:59",
        runtimeEligible: false
      };
    }

    return {
      precision: "exact_session_only",
      display: match[1] + ":" + match[2],
      time: match[1] + ":" + match[2],
      hour: hour,
      minute: minute,
      runtimeEligible: true
    };
  }

  function starLocationBasis() {
    syncStarCoordinateState();

    if (starState.mode === "coordinates") {
      var coordinates = coordinateState("star-reflection");
      var latitudeRaw = String(starState.latitude || "").trim();
      var longitudeRaw = String(starState.longitude || "").trim();
      var timezoneRaw = String(starState.timezone || "").trim();

      if (!latitudeRaw && !longitudeRaw && !timezoneRaw) {
        return {
          status: "pending",
          display:
            "Coordinate basis pending - enter latitude, longitude and IANA timezone"
        };
      }

      if (!coordinates.valid) {
        return {
          status: "invalid",
          display:
            "Invalid coordinate basis - enter valid latitude, longitude and IANA timezone"
        };
      }

      return {
        status: "valid",
        mode: "coordinates",
        display:
          coordinates.label +
          " - " +
          coordinates.timezone +
          " (" +
          String(coordinates.latitude) +
          ", " +
          String(coordinates.longitude) +
          ")",
        timezone: coordinates.timezone,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        body: {
          mode: "coordinates",
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          timezone: coordinates.timezone
        }
      };
    }

    if (!starState.selectedLocation) {
      return {
        status: "pending",
        display: "Selected birth place: not selected"
      };
    }

    return {
      status: "valid",
      mode: "named_location",
      display:
        starState.selectedLocation.display_label +
        " - " +
        starState.selectedLocation.timezone,
      timezone: starState.selectedLocation.timezone,
      body: {
        mode: "named_location",
        selector_value: starState.selectedLocation.selector_value
      }
    };
  }

  function buildStarRequestContext() {
    var dob = parseStarDob(
      byId("star-reflection-dob")
        ? byId("star-reflection-dob").value
        : ""
    );
    var unknown = byId("star-birth-time-unknown");
    var birthTime = parseStarBirthTime(
      byId("star-reflection-birth-time")
        ? byId("star-reflection-birth-time").value
        : "",
      Boolean(unknown && unknown.checked)
    );
    var location = starLocationBasis();
    var resolutionState = null;

    if (
      dob.status === "invalid" ||
      birthTime.precision === "invalid" ||
      location.status === "invalid"
    ) {
      resolutionState = "invalid_input";
    } else if (
      dob.status === "pending" ||
      birthTime.precision === "pending" ||
      location.status === "pending"
    ) {
      resolutionState = "pending_input";
    }

    var context = {
      dob: dob,
      birthTime: birthTime,
      location: location,
      precision: birthTime.precision,
      civilDate: dob.civilDate || "",
      birthDateBasis: dob.display,
      birthTimeBasis: birthTime.display,
      locationBasis: location.display,
      resolutionState: resolutionState,
      runtimeEligible: resolutionState === null
    };

    if (context.runtimeEligible) {
      context.runtimeBody = Object.assign(
        {
          civil_date: dob.civilDate
        },
        location.body
      );
    }

    return context;
  }

  function isValidNakshatraIndex(value) {
    return (
      Number.isInteger(value) &&
      value >= 1 &&
      value <= 27
    );
  }

  function normalizedNakshatra(result) {
    var rawIndex = getPath(
      result,
      "elements.nakshatra.index"
    );
    var index = Number(rawIndex);
    var name = String(
      getPath(result, "elements.nakshatra.name") || ""
    ).trim();

    if (
      !isValidNakshatraIndex(index) ||
      !name ||
      STAR_NAKSHATRA_NAMES[index] !== name
    ) {
      return {
        valid: false,
        state: "invalid_nakshatra_index"
      };
    }

    return {
      valid: true,
      index: index,
      name: name
    };
  }

  function privacyFlag(payload, key) {
    if (
      payload &&
      payload.privacy &&
      Object.prototype.hasOwnProperty.call(payload.privacy, key)
    ) {
      return payload.privacy[key];
    }
    return payload ? payload[key] : undefined;
  }

  function starReleaseId(payload) {
    return (
      payload &&
      (payload.release_id ||
        getPath(payload, "release.release_id") ||
        "")
    );
  }

  function starRuntimeReleaseId(payload) {
    return (
      payload &&
      (payload.runtime_release_id ||
        getPath(payload, "runtime.runtime_release_id") ||
        "")
    );
  }

  function starRuntimeStatus(payload) {
    return (
      payload &&
      (payload.runtime_status ||
        getPath(payload, "runtime.status") ||
        "")
    );
  }

  function starNoInputPersistence(payload) {
    if (
      payload &&
      Object.prototype.hasOwnProperty.call(
        payload,
        "no_input_persistence"
      )
    ) {
      return payload.no_input_persistence;
    }
    return getPath(payload, "runtime.no_input_persistence");
  }

  function starPublicCutoverActive(payload) {
    if (
      payload &&
      Object.prototype.hasOwnProperty.call(
        payload,
        "public_ui_cutover_active"
      )
    ) {
      return payload.public_ui_cutover_active;
    }
    return getPath(payload, "runtime.public_ui_cutover_active");
  }

  function mandatoryString(root, path) {
    return String(getPath(root, path) || "").trim().length > 0;
  }

  function validateStarRuntimeResponse(payload) {
    if (!payload || typeof payload !== "object") {
      return { state: "runtime_contract_mismatch" };
    }

    if (
      payload.status !== "sup02_governed_public_runtime_response" ||
      starReleaseId(payload) !== "ag74p_final_2026_06_24" ||
      starRuntimeReleaseId(payload) !== "sup01_panchang_runtime_v1" ||
      starRuntimeStatus(payload) !== "active" ||
      starNoInputPersistence(payload) !== true ||
      starPublicCutoverActive(payload) !== true ||
      privacyFlag(payload, "calculation_request_persisted") !== false ||
      privacyFlag(payload, "location_input_persisted") !== false ||
      privacyFlag(payload, "personal_data_persisted") !== false
    ) {
      return { state: "runtime_contract_mismatch" };
    }

    var panchang = payload.panchang;
    var source = panchang ? panchang.source : "";
    var result = panchang ? panchang.result : null;

    if (
      !panchang ||
      STAR_ACCEPTED_PANCHANG_SOURCES.indexOf(source) === -1 ||
      !result ||
      typeof result !== "object"
    ) {
      return { state: "runtime_contract_mismatch" };
    }

    if (result.available === false) {
      return {
        state: "runtime_unavailable",
        response: payload,
        result: result
      };
    }

    if (result.available !== true) {
      return { state: "runtime_contract_mismatch" };
    }

    if (
      !mandatoryString(result, "sunrise.local") ||
      !mandatoryString(result, "vara.english") ||
      !mandatoryString(result, "vara.sanskrit") ||
      !mandatoryString(result, "paksha") ||
      !mandatoryString(result, "elements.nakshatra.name") ||
      getPath(result, "elements.nakshatra.index") === undefined
    ) {
      return { state: "runtime_contract_mismatch" };
    }

    return {
      state: "available",
      response: payload,
      result: result
    };
  }

  function parseLocalDateTimeComparable(value) {
    var match = String(value || "").match(
      /(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?/
    );
    if (!match) return null;

    return Date.UTC(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
      Number(match[4]),
      Number(match[5]),
      Number(match[6] || "0")
    );
  }

  function parseCivilMinuteComparable(civilDate, time) {
    var dateMatch = String(civilDate || "").match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );
    var timeMatch = String(time || "").match(/^(\d{2}):(\d{2})$/);
    if (!dateMatch || !timeMatch) return null;

    return Date.UTC(
      Number(dateMatch[1]),
      Number(dateMatch[2]) - 1,
      Number(dateMatch[3]),
      Number(timeMatch[1]),
      Number(timeMatch[2]),
      0
    );
  }

  function transitionComplete(transition) {
    if (!transition || typeof transition !== "object") return false;
    return (
      String(transition.utc || "").trim() &&
      String(transition.local || "").trim() &&
      isValidNakshatraIndex(Number(transition.fromIndex)) &&
      isValidNakshatraIndex(Number(transition.toIndex)) &&
      parseLocalDateTimeComparable(transition.local) !== null
    );
  }

  function localMinuteMatchCount(civilDate, time, timezone) {
    var dateMatch = String(civilDate || "").match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );
    var timeMatch = String(time || "").match(/^(\d{2}):(\d{2})$/);
    if (!dateMatch || !timeMatch || !validTimezone(timezone)) return 0;

    var target = {
      year: Number(dateMatch[1]),
      month: Number(dateMatch[2]),
      day: Number(dateMatch[3]),
      hour: Number(timeMatch[1]),
      minute: Number(timeMatch[2])
    };
    var formatter = new Intl.DateTimeFormat("en-CA", {
      calendar: "gregory",
      numberingSystem: "latn",
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      hourCycle: "h23"
    });
    var nominal = Date.UTC(
      target.year,
      target.month - 1,
      target.day,
      target.hour,
      target.minute,
      0
    );
    var matches = 0;

    for (var offset = -2160; offset <= 2160; offset += 1) {
      var parts = {};
      formatter
        .formatToParts(new Date(nominal + offset * 60000))
        .forEach(function (part) {
          if (part.type !== "literal") parts[part.type] = part.value;
        });

      var hour = Number(parts.hour);
      if (hour === 24) hour = 0;

      if (
        Number(parts.year) === target.year &&
        Number(parts.month) === target.month &&
        Number(parts.day) === target.day &&
        hour === target.hour &&
        Number(parts.minute) === target.minute
      ) {
        matches += 1;
        if (matches > 1) return matches;
      }
    }

    return matches;
  }

  function resolveStarBasis(context, runtime) {
    if (!runtime || runtime.state !== "available") {
      return {
        state: runtime ? runtime.state : "runtime_error"
      };
    }

    var nakshatra = normalizedNakshatra(runtime.result);
    if (!nakshatra.valid) {
      return { state: nakshatra.state };
    }

    if (context.precision === "unknown") {
      return {
        state: "unknown_day_context",
        dayContextNakshatra: {
          index: nakshatra.index,
          name: nakshatra.name
        }
      };
    }

    var timezone = context.location.timezone;
    var matchCount = localMinuteMatchCount(
      context.civilDate,
      context.birthTime.time,
      timezone
    );

    if (matchCount === 0) {
      return { state: "unresolved_nonexistent_local_time" };
    }

    if (matchCount > 1) {
      return { state: "unresolved_ambiguous_local_time" };
    }

    var transitions =
      runtime.result.transitions &&
      runtime.result.transitions.nakshatra;
    var previous = transitions ? transitions.previous : null;
    var next = transitions ? transitions.next : null;

    if (
      !transitionComplete(previous) ||
      !transitionComplete(next) ||
      Number(previous.toIndex) !== nakshatra.index ||
      Number(next.fromIndex) !== nakshatra.index
    ) {
      return { state: "missing_transition_metadata" };
    }

    var birthStart = parseCivilMinuteComparable(
      context.civilDate,
      context.birthTime.time
    );
    var birthEnd = birthStart + 60000;
    var previousTime = parseLocalDateTimeComparable(previous.local);
    var nextTime = parseLocalDateTimeComparable(next.local);

    if (previousTime > birthStart && previousTime < birthEnd) {
      return { state: "exact_transition_minute_ambiguous" };
    }

    if (nextTime > birthStart && nextTime < birthEnd) {
      return { state: "exact_transition_minute_ambiguous" };
    }

    if (birthStart < previousTime || birthStart >= nextTime) {
      return { state: "exact_outside_single_transition_window" };
    }

    if (birthEnd <= nextTime) {
      return {
        state: "exact_window_resolved",
        nakshatra: {
          index: nakshatra.index,
          name: nakshatra.name
        }
      };
    }

    return { state: "exact_outside_single_transition_window" };
  }

  function validateStarOutputBank(payload) {
    if (
      !payload ||
      typeof payload !== "object" ||
      payload.record_count !== 39 ||
      payload.exact_window_record_count !== 27 ||
      payload.non_exact_record_count !== 12 ||
      !Array.isArray(payload.records) ||
      payload.records.length !== 39 ||
      !Array.isArray(payload.required_resolution_states) ||
      payload.required_resolution_states.length !== 13
    ) {
      throw new Error("AG75C output bank contract mismatch.");
    }

    STAR_RESOLUTION_STATES.forEach(function (state) {
      if (payload.required_resolution_states.indexOf(state) === -1) {
        throw new Error("AG75C output bank missing state " + state + ".");
      }
    });

    var counts = Object.create(null);
    var exactIndexes = Object.create(null);

    payload.records.forEach(function (record) {
      if (!record || typeof record !== "object") {
        throw new Error("AG75C output bank contains an invalid record.");
      }

      var state = String(record.resolution_state || "");
      if (STAR_RESOLUTION_STATES.indexOf(state) === -1) {
        throw new Error("AG75C output bank contains an unknown state.");
      }

      [
        "basis_label",
        "reflective_theme",
        "self_inquiry_prompt",
        "grounding_practice",
        "limitation_notice"
      ].forEach(function (field) {
        if (!String(record[field] || "").trim()) {
          throw new Error(
            "AG75C output bank record is missing " + field + "."
          );
        }
      });

      counts[state] = (counts[state] || 0) + 1;

      if (state === "exact_window_resolved") {
        var index = Number(record.nakshatra_index);
        if (
          !isValidNakshatraIndex(index) ||
          record.nakshatra_name !== STAR_NAKSHATRA_NAMES[index] ||
          exactIndexes[index]
        ) {
          throw new Error(
            "AG75C output bank exact Nakshatra mapping mismatch."
          );
        }
        exactIndexes[index] = true;
      }
    });

    if (counts.exact_window_resolved !== 27) {
      throw new Error("AG75C output bank exact record count mismatch.");
    }

    STAR_RESOLUTION_STATES.forEach(function (state) {
      if (
        state !== "exact_window_resolved" &&
        counts[state] !== 1
      ) {
        throw new Error(
          "AG75C output bank non-exact state count mismatch."
        );
      }
    });

    return payload.records.slice();
  }

  function loadStarOutputBank() {
    if (starOutputRecords) return Promise.resolve(starOutputRecords);
    if (starOutputBankPromise) return starOutputBankPromise;

    starOutputBankPromise = fetch(STAR_OUTPUT_BANK_PATH, {
      cache: "no-store"
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("AG75C output bank unavailable.");
        }
        return response.json();
      })
      .then(function (payload) {
        starOutputRecords = validateStarOutputBank(payload);
        return starOutputRecords;
      });

    return starOutputBankPromise;
  }

  function selectStarOutputRecord(recordsForBank, resolution) {
    var matches = recordsForBank.filter(function (record) {
      if (record.resolution_state !== resolution.state) return false;
      if (resolution.state !== "exact_window_resolved") return true;
      return (
        Number(record.nakshatra_index) ===
          resolution.nakshatra.index &&
        record.nakshatra_name === resolution.nakshatra.name
      );
    });

    if (matches.length !== 1) {
      throw new Error("AG75C resolver did not select exactly one record.");
    }

    return matches[0];
  }

  function renderStarRecord(context, resolution, record, runtime) {
    var panel = showStarPanel("Governed Star Reflection Result");
    var grid = starPreviewGrid();
    var card = starReflectionCard();

    if (!panel || !grid) return;

    grid.innerHTML = "";
    grid.appendChild(starRow("Resolution state", resolution.state));
    grid.appendChild(starRow("Result basis", record.basis_label));
    grid.appendChild(starRow("Birth-date basis", context.birthDateBasis));
    grid.appendChild(starRow("Birth-time basis", context.birthTimeBasis));
    grid.appendChild(starRow("Location basis", context.locationBasis));

    if (resolution.state === "exact_window_resolved") {
      grid.appendChild(
        starRow(
          "Exact birth Nakshatra",
          resolution.nakshatra.name +
            " (Nakshatra index " +
            String(resolution.nakshatra.index) +
            ")"
        )
      );
    }

    if (
      resolution.state === "unknown_day_context" &&
      resolution.dayContextNakshatra
    ) {
      grid.appendChild(
        starRow(
          "Day-context Nakshatra",
          resolution.dayContextNakshatra.name +
            " (Nakshatra index " +
            String(resolution.dayContextNakshatra.index) +
            ") - day context only"
        )
      );
    }

    if (runtime && runtime.response && runtime.response.panchang) {
      grid.appendChild(
        starRow(
          "Runtime basis",
          runtime.response.panchang.source +
            " - " +
            starReleaseId(runtime.response)
        )
      );
    }

    grid.appendChild(
      starRow("Reflective theme", record.reflective_theme)
    );
    grid.appendChild(
      starRow("Self-inquiry prompt", record.self_inquiry_prompt)
    );
    grid.appendChild(
      starRow("Grounding practice", record.grounding_practice)
    );
    grid.appendChild(
      starRow("Limitation notice", record.limitation_notice)
    );

    var note = panel.querySelector(".ag71e-preview-note");
    if (note) {
      note.textContent =
        "Session-only governed result. No name, raw DOB, birth time, " +
        "location, coordinates or reflection output is stored.";
    }

    if (card) {
      card.setAttribute(
        "data-ag75d-e3-star-reflection-state",
        resolution.state
      );
    }

    document.documentElement.setAttribute(
      "data-ag75d-e3-star-reflection-runtime",
      "governed"
    );
  }

  function renderStarState(context, resolution, runtime) {
    return loadStarOutputBank()
      .then(function (recordsForBank) {
        var record = selectStarOutputRecord(
          recordsForBank,
          resolution
        );
        renderStarRecord(context, resolution, record, runtime);
      })
      .catch(function (error) {
        renderStarClosedError(
          error && error.message
            ? error.message
            : "The governed Star Reflection output could not be selected."
        );
      });
  }

  function callStarRuntime(context) {
    return fetch(STAR_RUNTIME_URL, {
      method: "POST",
      cache: "no-store",
      credentials: "omit",
      referrerPolicy: "strict-origin-when-cross-origin",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(context.runtimeBody)
    }).then(function (response) {
      return response
        .json()
        .catch(function () {
          throw new Error("The governed runtime returned unreadable data.");
        })
        .then(function (payload) {
          if (!response.ok) {
            throw new Error("The governed runtime request failed.");
          }
          return payload;
        });
    });
  }

  async function runStarReflectionGenerate() {
    if (starRuntimeBusy) return;

    starRuntimeBusy = true;
    setStarGenerateLoading(true);
    renderStarLoading();

    var context = buildStarRequestContext();

    try {
      if (!context.runtimeEligible) {
        await renderStarState(
          context,
          { state: context.resolutionState },
          null
        );
        return;
      }

      var payload = await callStarRuntime(context);
      var runtime = validateStarRuntimeResponse(payload);
      var resolution = resolveStarBasis(context, runtime);
      await renderStarState(context, resolution, runtime);
    } catch (_error) {
      await renderStarState(
        context,
        { state: "runtime_error" },
        null
      );
    } finally {
      starRuntimeBusy = false;
      setStarGenerateLoading(false);
    }
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
    if (kind === "star-reflection") {
      quarantineLegacyStarSelect();
      ensureStarPlaceChoicePanel();
      return;
    }

    var previous =
      select.value || DEFAULT_VALUE;

    rebuilding = true;
    select.innerHTML = "";

    records.forEach(function (record) {
      select.appendChild(optionFromRecord(record));
    });

    var values = records.map(function (record) {
      return record.selector_value;
    });

    select.value =
      values.indexOf(previous) !== -1
        ? previous
        : DEFAULT_VALUE;

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

    rebuildSafeSelect(select);
    rebuilding = false;
    updateSummary(kind);
  }

  function governedSelector(select) {
    if (!select || !Array.isArray(records)) return false;
    var options = Array.prototype.slice.call(select.options);
    var expected = records.length;

    if (options.length !== expected) return false;

    return options.every(function (option) {
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

    if (!governedSelector(panchang)) {
      populateSelect(panchang, "panchang");
    }
  }

  function observeSelectors() {
    [
      ["panchang-place-select", "panchang"]
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
      '#star-birth-place-select[data-ag75d-e2-legacy-quarantined],',
      '[data-ag75d-e2-star-wrapper-quarantined],',
      '[data-ag75d-e2-star-r4-quarantined],',
      '[data-ag75d-e2-star-shell-quarantined] {',
      '  display: none !important;',
      '  visibility: hidden !important;',
      '  pointer-events: none !important;',
      '}',
      '#ag75d-e2-star-place-choice-panel {',
      '  width: 100% !important;',
      '  min-width: 0 !important;',
      '  max-width: 100% !important;',
      '  margin: 0.35rem 0 0 !important;',
      '  box-sizing: border-box !important;',
      '}',
      '#ag75d-e2-star-place-choice-panel[hidden] {',
      '  display: none !important;',
      '}',
      '.ag75d-e2-star-place-choice-heading {',
      '  margin: 0 0 0.55rem !important;',
      '  color: #2f2418 !important;',
      '  font: inherit !important;',
      '  font-weight: 700 !important;',
      '}',
      '.ag75d-e2-star-place-choices {',
      '  display: grid !important;',
      '  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)) !important;',
      '  gap: 0.55rem !important;',
      '}',
      '.ag75d-e2-star-place-choice {',
      '  min-height: 44px !important;',
      '  border: 1px solid rgba(68, 64, 60, 0.34) !important;',
      '  border-radius: 8px !important;',
      '  background: #fffaf2 !important;',
      '  color: #2f2418 !important;',
      '  font: inherit !important;',
      '  padding: 0.72rem 0.85rem !important;',
      '  box-sizing: border-box !important;',
      '  cursor: pointer !important;',
      '}',
      '.ag75d-e2-star-place-choice[aria-pressed="true"] {',
      '  border-color: #8a5a26 !important;',
      '  background: #efe1cb !important;',
      '  font-weight: 700 !important;',
      '}',
      '.ag75d-e2-star-place-choice:focus {',
      '  border-color: #8a5a26 !important;',
      '  box-shadow: 0 0 0 3px rgba(138, 90, 38, 0.18) !important;',
      '  outline: none !important;',
      '}',
      '.ag75d-e2-star-place-summary,',
      '.ag75d-e2-star-place-note {',
      '  margin: 0.65rem 0 0 !important;',
      '  color: #655849 !important;',
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

    ensureStarPlaceChoicePanel();
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

      var starPlaceButton = target.closest(
        "[data-ag75d-e2-star-place-value]"
      );
      if (starPlaceButton) {
        claim(event);
        selectStarLocation(
          recordByValue(
            starPlaceButton.getAttribute(
              "data-ag75d-e2-star-place-value"
            )
          )
        );
        return;
      }

      if (
        target.closest(
          '[data-ag71e-preview-button="star-reflection"]'
        )
      ) {
        claim(event);
        runStarReflectionGenerate();
        return;
      }

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
        quarantineLegacyStarSelect();
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
        syncStarCoordinateState();
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
      var nextRecords = approvedLocationRecords(payload);
      assertCurrentAg74pReleaseScope(payload, nextRecords);
      records = nextRecords;
      populateSelect(
        byId("panchang-place-select"),
        "panchang"
      );
      ensureStarPlaceChoicePanel();
      observeSelectors();

      [0, 350, 700, 1200, 2000, 3200, 4800, 6500, 7500].forEach(
        function (delay) {
          window.setTimeout(function () {
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
      starLocationControlContract:
        "ag75d_owned_button_panel_memory_state",
      dateControlContract:
        "previous_picker_next_auto_request",
      ritualWindowEmptyStateHidden: true,
      allFaithCalendarClaimed: false,
      inputPersistenceEnabled: false
    };
  };

  window.drishvaraAg75dStarReflectionState = function () {
    syncStarCoordinateState();
    return {
      mode: starState.mode,
      selectedLocation: starLocationSnapshot(
        starState.selectedLocation
      ),
      latitude: starState.latitude,
      longitude: starState.longitude,
      timezone: starState.timezone,
      coordinateLabel: starState.coordinateLabel,
      approvedLocationCount: Array.isArray(records)
        ? records.length
        : null,
      legacySelectAuthoritative: false,
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
