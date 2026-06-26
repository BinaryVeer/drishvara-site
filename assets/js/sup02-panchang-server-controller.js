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
