(function () {
  "use strict";

  var LOCATION_PATH =
    "data/knowledge-base/location-intelligence/production/" +
    "ag74p-approved-location-projection.json";
  var REQUIRED_APPROVALS = [
    "canonical_place_approved",
    "coordinate_approved",
    "timezone_approved",
    "public_selection_approved",
    "computation_approved",
    "public_output_allowed"
  ];
  var CURRENT_PUBLIC_COUNT = 5;
  var locationPromise = null;

  function normalise(record, index) {
    if (!record || typeof record !== "object") {
      throw new Error("Invalid governed location record at index " + index);
    }

    REQUIRED_APPROVALS.forEach(function (field) {
      if (record[field] !== true) {
        throw new Error("Governed location missing explicit approval: " + field);
      }
    });

    var value = String(record.selector_value || "").trim();
    var canonicalId = String(record.canonical_place_id || "").trim();
    var label = String(record.display_label || "").trim();
    var timezone = String(record.timezone || "").trim();
    var latitude = Number(record.latitude);
    var longitude = Number(record.longitude);

    if (!value || !canonicalId || !label || !timezone) {
      throw new Error("Governed location identity is incomplete at index " + index);
    }

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw new Error("Governed location coordinates are invalid at index " + index);
    }

    return {
      selectorValue: value,
      canonicalPlaceId: canonicalId,
      displayLabel: label,
      timezone: timezone,
      latitude: latitude,
      longitude: longitude,
      searchLabels: Array.isArray(record.search_labels)
        ? record.search_labels.slice()
        : [],
      source: record
    };
  }

  function assertUnique(records) {
    var values = Object.create(null);
    var canonicalIds = Object.create(null);

    records.forEach(function (record) {
      if (values[record.selectorValue]) {
        throw new Error("Duplicate governed selector_value: " + record.selectorValue);
      }
      if (canonicalIds[record.canonicalPlaceId]) {
        throw new Error(
          "Duplicate governed canonical_place_id: " + record.canonicalPlaceId
        );
      }
      values[record.selectorValue] = true;
      canonicalIds[record.canonicalPlaceId] = true;
    });
  }

  function normalisePayload(payload) {
    if (!payload || !Array.isArray(payload.records)) {
      throw new Error("Approved location projection is unavailable.");
    }

    if (
      payload.record_count !== CURRENT_PUBLIC_COUNT ||
      payload.records.length !== CURRENT_PUBLIC_COUNT
    ) {
      throw new Error("AG74P active public location projection must remain 5 records.");
    }

    var records = payload.records.map(normalise);
    assertUnique(records);
    return records;
  }

  function loadApprovedLocations() {
    if (!locationPromise) {
      locationPromise = fetch(LOCATION_PATH, { cache: "no-store" })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Approved location projection could not be loaded.");
          }
          return response.json();
        })
        .then(normalisePayload);
    }

    return locationPromise;
  }

  window.DrishvaraV2Location = {
    loadApprovedLocations: loadApprovedLocations,
    normaliseApprovedLocationPayload: normalisePayload
  };
})();
