/* Drishvara F2 daily colour theme adapter.
 * VISUAL ONLY: the server remains responsible for rights, review and publication.
 * Never infer the colour of the day from a calendar, visitor input or preview content.
 */
(function (global) {
  "use strict";
  var HEX = /^#[0-9a-fA-F]{6}$/;
  var PALETTE = Object.freeze({
    "saffron":"#E87924","kesari":"#E87924","केसरिया":"#E87924","भगवा":"#E87924",
    "orange":"#E98023","नारंगी":"#E98023","vermillion":"#DF4C24",
    "red":"#CE3D3D","लाल":"#CE3D3D","crimson":"#BA2946","maroon":"#773042",
    "yellow":"#E7BB32","पीला":"#E7BB32","gold":"#D2A341","golden":"#D2A341",
    "blue":"#3878BA","नीला":"#3878BA","sky blue":"#6AADD8","navy blue":"#173C71",
    "indigo":"#534F9C","turquoise":"#2BADA5","teal":"#2C8585",
    "green":"#419256","हरा":"#419256","forest green":"#2C7246","emerald":"#25996B",
    "white":"#F8F8F3","सफेद":"#F8F8F3","black":"#242424","काला":"#242424",
    "grey":"#929292","gray":"#929292","silver":"#BBC0BF","cream":"#EBD6AE",
    "brown":"#906342","भूरा":"#906342","pink":"#DF8FAE","गुलाबी":"#DF8FAE",
    "purple":"#844EA1","बैंगनी":"#844EA1","violet":"#9964AD","lavender":"#AF96D7"
  });
  var CARD_SELECTOR = ".f2-daily .f2-day-card:nth-child(4)";
  var ALLOWED_FEED = "generated/colour-of-day-publication.json";
  var VALID_VERSION = "drishvara.colour-publication.v1";
  var currentSnapshot = null;
  function tidy(value) {
    return typeof value === "string" ? value.normalize("NFKC").trim().replace(/[-_]+/g, " ").replace(/\s+/g, " ").toLowerCase() : "";
  }
  function istDay(now) {
    try {
      var p = new Intl.DateTimeFormat("en-GB", {timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(now);
      function item(kind) {return p.find(function (x) {return x.type === kind;}).value;}
      return item("year") + "-" + item("month") + "-" + item("day");
    } catch (_err) {return null;}
  }
  function resolvedHex(name, hex) {
    if (hex !== undefined && hex !== null && hex !== "") {
      return typeof hex === "string" && HEX.test(hex) ? hex.toUpperCase() : null;
    }
    return PALETTE[tidy(name)] || null;
  }
  function approvedRecord(record, now) {
    if (!record || typeof record !== "object" || Array.isArray(record)) return null;
    if (record.contract_version !== VALID_VERSION || record.status !== "published" ||
        record.public_output_allowed !== true || record.runtime_activation !== true ||
        record.publication_scope !== "global_public_colour" || record.timezone !== "Asia/Kolkata" ||
        record.date_key !== istDay(now) || record.withdrawn !== false || record.superseded !== false) return null;
    if (typeof record.colour_name !== "string" || !record.colour_name.trim() ||
        record.colour_name.trim().length > 80) return null;
    if (!["release_approval_ref","publication_event_id","source_use_ref","reviewed_content_hash"].every(function (field) {
      return typeof record[field] === "string" && record[field].trim().length > 0;
    })) return null;
    var hex = resolvedHex(record.colour_name, record.colour_hex);
    if (!hex) return null;
    return {name: record.colour_name.trim(), hex: hex, date_key: record.date_key};
  }
  function card() {return global.document.querySelector(CARD_SELECTOR);}
  function reset() {
    var el = card();
    if (!el) return false;
    el.removeAttribute("data-f2-approved-colour");
    el.style.removeProperty("--f2-public-colour");
    currentSnapshot = null;
    return true;
  }
  function applyPublished(record, now) {
    var el = card(), result = approvedRecord(record, now || new Date());
    if (!el || !result) {reset(); return false;}
    el.style.setProperty("--f2-public-colour", result.hex);
    el.setAttribute("data-f2-approved-colour", "true");
    currentSnapshot = {date_key: result.date_key, name: result.name, hex: result.hex};
    // Content is intentionally NOT filled by this purely visual adapter.
    // The approved Colour publisher owns the word, explanation and references.
    return true;
  }
  function refreshDate() {
    if (currentSnapshot && currentSnapshot.date_key !== istDay(new Date())) reset();
  }
  function feed() {
    var meta = global.document.querySelector('meta[name="drishvara-approved-colour-feed"]');
    return meta && meta.getAttribute("content") === ALLOWED_FEED ? ALLOWED_FEED : null;
  }
  function refresh() {
    refreshDate();
    var uri = feed();
    if (!uri) return Promise.resolve(false); // Not configured: no invented daily colour.
    return global.fetch(uri, {cache:"no-store",credentials:"omit",redirect:"error"})
      .then(function (resp) {return resp.ok ? resp.json() : null;})
      .then(function (data) {return applyPublished(data);})
      .catch(function () {reset(); return false;});
  }
  function start() {
    if (global.document.readyState === "loading") {
      global.document.addEventListener("DOMContentLoaded", function () {refresh();}, {once:true});
    } else {refresh();}
    global.addEventListener("focus", refreshDate);
    global.document.addEventListener("visibilitychange", function () {if (!global.document.hidden) refreshDate();});
  }
  global.DrishvaraDailyColourTheme = Object.freeze({
    contractVersion: VALID_VERSION,
    resolveHex: resolvedHex,
    validatePublishedRecord: approvedRecord,
    applyPublished: applyPublished,
    clear: reset,
    refresh: refresh
  });
  start();
})(window);
