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

/* Shared saved-place suggestions. Selection still belongs to the existing controllers. */
(function () {
  'use strict';
  var api = window.DrishvaraV2Location;
  function fold(value) { return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim(); }
  function match(records, query) {
    var words = fold(query).split(' ').filter(Boolean);
    return records.filter(function (r) {
      var haystack = fold([r.displayLabel, r.canonicalPlaceId, r.timezone].concat(r.searchLabels || []).join(' '));
      return words.every(function (word) { return haystack.indexOf(word) !== -1; });
    });
  }
  api.matchApprovedLocations = match;
  var discoveryPromise;
  function discovery() {
    if (!discoveryPromise) discoveryPromise = fetch('data/location-search-discovery.json', {cache:'no-store', credentials:'omit'}).then(function(r) { if (!r.ok) throw Error('discovery'); return r.json(); }).then(function(p) {
      if (p.purpose !== 'user_authorized_name_discovery_only' || p.calculation_approval !== false || !Array.isArray(p.records) || p.count !== p.records.length) throw Error('discovery contract');
      return p.records.map(function(r) { return {canonicalPlaceId:r[0],displayLabel:r[1],searchLabels:r[2],entityType:r[3],discoveryOnly:true}; });
    });
    return discoveryPromise;
  }
  function install(input, star) {
    if (!input || input.dataset.savedPlaceSearch) return;
    input.dataset.savedPlaceSearch = 'true';
    var root = input.closest('label') || input.parentNode;
    var list = document.createElement('div');
    list.id = input.id + '-suggestions'; list.className = 'dv2-saved-place-suggestions'; list.hidden = true;
    list.setAttribute('role', 'listbox'); list.setAttribute('aria-label', 'Matching saved places');
    var status = document.createElement('div'); status.className = 'dv2-saved-place-status'; status.setAttribute('role', 'status');
    root.after(list, status);
    input.setAttribute('role', 'combobox'); input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-controls', list.id); input.setAttribute('aria-expanded', 'false');
    var records = [], matches = [], active = -1, loaded = false, limit = 50;
    var more = document.createElement('button'); more.type = 'button'; more.hidden = true; more.textContent = 'Show more matching places'; status.after(more);
    more.addEventListener('click', function() { limit += 50; render(true); });
    function hindi() { return input.closest('[data-dv2-lang]')?.getAttribute('data-dv2-lang') === 'hi'; }
    function close() { list.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); active = -1; more.hidden = true; }
    function choose(record) {
      if (record.discoveryOnly) { status.textContent = hindi() ? 'यह स्थान सत्यापनाधीन है; गणना के लिए उपलब्ध नहीं है।' : 'This saved place is awaiting verification and cannot be selected for calculations.'; return; }
      if (star) {
        var buttons = document.querySelectorAll('[data-ag75d-e2-star-place-value]');
        var button = Array.from(buttons).find(function (b) { return b.getAttribute('data-ag75d-e2-star-place-value') === record.selectorValue; });
        if (!button) { status.textContent = hindi() ? 'स्थान चयन अभी तैयार नहीं है।' : 'Place selection is not ready yet.'; return; }
        button.click();
        input.value = record.displayLabel;
      } else {
        var select = document.getElementById('panchang-place-select');
        if (!select || !Array.from(select.options).some(function (o) { return o.value === record.selectorValue; })) return;
        input.value = ''; // An alias query must not override the explicit approved selection.
        select.value = record.selectorValue;
        select.dispatchEvent(new Event('change', {bubbles: true}));
      }
      close(); status.textContent = (hindi() ? 'चयनित: ' : 'Selected: ') + record.displayLabel; input.focus();
    }
    function render(keepLimit) {
      if (keepLimit !== true) limit = 50;
      list.replaceChildren(); active = -1; input.removeAttribute('aria-activedescendant');
      if (!input.value.trim()) { close(); status.textContent = ''; return; }
      if (!loaded) { status.textContent = hindi() ? 'स्थान लोड हो रहे हैं…' : 'Loading saved places…'; return; }
      matches = match(records, input.value);
      matches.slice(0,limit).forEach(function (record, i) {
        var option = document.createElement('div'); option.id = list.id + '-' + i;
        option.setAttribute('role', 'option'); option.setAttribute('aria-selected', 'false');
        option.textContent = record.displayLabel + (record.discoveryOnly ? ' · ' + record.entityType.replace(/_/g,' ') + ' · ' + (hindi() ? 'सत्यापनाधीन — गणना उपलब्ध नहीं' : 'Awaiting verification — calculations unavailable') : ' · ' + record.timezone + ' · ' + (hindi() ? 'अनुमोदित' : 'Approved'));
        if (record.discoveryOnly) option.setAttribute('aria-disabled','true');
        option.addEventListener('mousedown', function (e) { e.preventDefault(); });
        option.addEventListener('click', function () { choose(record); }); list.append(option);
      });
      list.hidden = matches.length === 0; input.setAttribute('aria-expanded', String(matches.length > 0));
      more.hidden = matches.length <= limit;
      status.textContent = matches.length ? (hindi() ? matches.length + ' स्थान मिले। केवल अनुमोदित स्थान गणना के लिए चुने जा सकते हैं।' : matches.length + ' saved places found; showing ' + Math.min(limit,matches.length) + '. Only approved places can be selected for calculations.') : (hindi() ? 'कोई अनुमोदित स्थान नहीं मिला। अन्य सहेजे गए स्थान सत्यापनाधीन हैं।' : 'No approved place matches. Additional saved locations are awaiting verification.');
    }
    input.addEventListener('input', render); input.addEventListener('focus', render);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { close(); return; }
      if (list.hidden) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault(); active = (active + (e.key === 'ArrowDown' ? 1 : -1) + Math.min(limit,matches.length)) % Math.min(limit,matches.length);
        Array.from(list.children).forEach(function (o, i) { o.setAttribute('aria-selected', String(i === active)); });
        input.setAttribute('aria-activedescendant', list.children[active].id);
        list.children[active].scrollIntoView({block:'nearest'});
      } else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); choose(matches[active]); }
    });
    input.addEventListener('blur', function(e) { if (e.relatedTarget !== more) close(); });
    api.loadApprovedLocations().then(function (data) { records = data; loaded = true; if (document.activeElement === input) render();
      discovery().then(function(extra) { records = data.concat(extra); if (document.activeElement === input) render(); }).catch(function() { status.textContent = 'Additional saved-place search is unavailable; approved places remain available.'; }); }).catch(function () { close(); status.textContent = hindi() ? 'अनुमोदित स्थान सूची अनुपलब्ध है।' : 'Approved saved-place list unavailable.'; });
  }
  function mount() { install(document.getElementById('panchang-place-alias'), false); install(document.getElementById('dv2-star-location-search'), true); }
  function boot() {
    var style = document.createElement('style');
    style.textContent = '.dv2-saved-place-suggestions{display:grid;gap:2px;border:1px solid #8a7746;border-radius:5px;padding:4px;max-height:220px;overflow:auto;background:#0b2138;color:#edf2f7;margin:4px 0;font:12px/1.5 Arial,sans-serif}.dv2-saved-place-suggestions[hidden]{display:none}.dv2-saved-place-suggestions [role=option]{padding:10px;cursor:pointer;overflow-wrap:anywhere}.dv2-saved-place-suggestions [role=option]:hover,.dv2-saved-place-suggestions [aria-selected=true]{background:#efc359;color:#091c30}.dv2-saved-place-suggestions [aria-disabled=true]{opacity:.75;cursor:default}.dv2-saved-place-status{font:11px/1.5 Arial,sans-serif;margin:4px 0;color:inherit}';
    document.head.append(style); mount();
    var observer = new MutationObserver(mount); observer.observe(document.body, {childList:true,subtree:true});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true}); else boot();
})();
