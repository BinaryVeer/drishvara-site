# M04 — Location / Timezone / Sunrise Basis

Status: Methodology/Governance only  
Phase: M-Methodology  
Depends on: M00, M01, M02, M03  
Runtime impact: None  
Subscriber impact: None  
Public Panchang impact: None  

## 1. Purpose

M04 defines Drishvara’s methodology for location, timezone, sunrise, sunset, moonrise, Pradosh window, Parana window, and event-window basis.

M04 does not implement live calculation, public Panchang output, festival-date publication, subscriber guidance, Auth, Supabase, payment, external API fetch, or runtime event-window computation.

M04 exists because Tithi, Vrat, Festival, Pradosh, Sankashti, Ekadashi Parana, and many other observance rules cannot be safely evaluated unless location, timezone, sunrise, sunset, moonrise, and boundary conventions are explicit.

## 2. Explicit Exclusions

M04 does not implement live sunrise calculation, live sunset calculation, live moonrise calculation, public Panchang calendar, public festival dates, subscriber output, personalized guidance, Auth, Supabase, payment, subscription entitlement, external API fetch, geocoding API, map API, GPS tracking, or runtime dashboard cards.

M04 is methodology-only.

## 3. Relationship with Earlier Modules

M04 inherits M00 source doctrine, M00 privacy doctrine, M01 Panchang calculation methodology, M01 ayanamsha and ephemeris review doctrine, M02 event-window dependencies, and M03 named observance registry requirements.

M04 supplies the future event-window basis required by M02 and M03. It does not decide festival dates by itself.

## 4. Location Basis Doctrine

A future Drishvara Panchang or observance calculation must not run on an ambiguous location label alone.

A valid location record must preserve:

- location_name;
- country;
- state or region where applicable;
- district or city where applicable;
- latitude;
- longitude;
- coordinate precision;
- coordinate source;
- timezone;
- timezone source;
- review status.

The system must distinguish between user-entered location, normalized location, and calculation location.

## 5. Coordinate Precision Doctrine

Future calculation must record coordinate precision.

Allowed future precision labels:

- exact_user_confirmed;
- city_centroid;
- district_centroid;
- state_centroid;
- country_centroid;
- approximate_manual;
- pending_review.

For Panchang and observance use, city-level or better precision should be preferred. District/state/country centroid calculations must be marked approximate and must not be used for high-confidence festival decisions.

## 6. Timezone Doctrine

M04 requires IANA timezone identifiers for future calculations.

A valid timezone record must preserve:

- IANA timezone ID;
- UTC offset at calculation instant;
- daylight-saving status where applicable;
- source of timezone mapping;
- timezone database version where available;
- conversion timestamp;
- review status.

The future system must not rely only on fixed UTC offsets because DST and political timezone changes can affect local civil time.

## 7. Local Civil Time and UTC Doctrine

Future event-window calculations must preserve both UTC and local civil time.

Every event timestamp should preserve:

- UTC timestamp;
- local timestamp;
- timezone ID;
- UTC offset;
- calendar date in local time;
- conversion basis;
- review status.

This is required for sunrise-to-sunrise rules, sunset/Pradosh rules, moonrise rules, and Parana windows.

## 8. Sunrise Basis Doctrine

M04 defines sunrise basis as a reviewed methodological dependency, not as an activated runtime calculation.

Future Drishvara calculation should support an apparent sunrise convention where sunrise is associated with the upper limb of the Sun appearing at a level horizon under average atmospheric/refraction assumptions.

The exact implementation must declare:

- geometric or apparent basis;
- solar disk limb convention;
- atmospheric refraction assumption;
- elevation handling;
- horizon handling;
- coordinate basis;
- ephemeris or algorithm source;
- validation source;
- review status.

M04 does not calculate sunrise. It defines what must be declared before sunrise can be used.

## 9. Sunset Basis Doctrine

Future sunset calculation must mirror the declared sunrise convention.

A sunset record must preserve:

- local sunset time;
- UTC sunset time;
- geometric/apparent basis;
- solar limb convention;
- refraction assumption;
- elevation assumption;
- horizon assumption;
- review status.

This is required for Pradosh, Holika Dahan-type evening rules, and other event-window observances.

## 10. Moonrise Basis Doctrine

Moonrise is more complex than sunrise because lunar parallax, apparent lunar radius, local horizon, and visibility conditions may matter.

Future moonrise records must preserve:

- local moonrise time;
- UTC moonrise time;
- calculation basis;
- lunar parallax handling;
- lunar disk convention;
- horizon assumption;
- visibility limitation note;
- review status.

M04 does not calculate moonrise. It only defines the future basis.

## 11. Pradosh Window Basis Doctrine

M04 defines Pradosh window as an event-window dependency required by M02 and M03.

A future Pradosh window record must preserve:

- local sunset time;
- Pradosh window start;
- Pradosh window end;
- window definition source;
- Trayodashi overlap;
- minimum overlap rule where applicable;
- regional or sampradaya variant;
- review status.

M04 does not choose a final universal Pradosh formula. It requires the formula to be declared and reviewed.

## 12. Parana Window Basis Doctrine

Parana windows are required for fast-breaking logic such as Ekadashi Parana.

A future Parana record must preserve:

- fasting observance date;
- Parana date;
- sunrise on Parana date;
- Parana start;
- Parana end;
- restricted period if applicable after source review;
- sampradaya variant;
- review status.

M04 does not publish Parana timings.

## 13. Event-Window Basis Doctrine

Future named observance rules may depend on different event windows.

Supported future event-window basis labels:

- sunrise;
- sunset;
- moonrise;
- pradosh_kala;
- parana_window;
- solar_ingress;
- midnight;
- nishita_kala;
- aparahna_kala;
- madhyahna_kala;
- custom_reviewed_window.

Each window must carry source reference, calculation basis, and review status.

## 14. Polar and Extreme Latitude Doctrine

Some locations may not have ordinary sunrise, sunset, or moonrise events on a given date.

Future calculation must flag:

- no_sunrise;
- no_sunset;
- polar_day;
- polar_night;
- no_moonrise;
- no_moonset;
- ambiguous_event_window;
- human_review_required.

No public observance output may be produced for such cases without reviewed fallback rules.

## 15. Elevation and Horizon Doctrine

Future implementation must decide whether elevation and local horizon are used.

Default methodology status in M04:

- elevation handling: pending review;
- obstruction/local horizon handling: pending review;
- sea-level approximation: allowed only if disclosed;
- city-centroid approximation: allowed only if disclosed.

No output may claim high precision if it uses approximate elevation or horizon assumptions.

## 16. Geocoding and Privacy Doctrine

M04 does not activate geocoding or GPS.

Future geocoding must follow privacy rules:

- do not store precise user coordinates unless necessary and consented;
- do not expose exact subscriber birth location publicly;
- allow city-level approximation for non-critical guidance;
- store only the minimum location precision required;
- separate calculation location from displayed location.

Subscriber location and birth location must be handled under consent and privacy gates.

## 17. Future Internal Location Record Contract

Future internal location record should include:

location_id, location_name, country, region, district_or_city, latitude, longitude, coordinate_precision, coordinate_source, timezone_id, timezone_source, timezone_version, review_status, public_safe_label.

This is not runtime code.

## 18. Future Internal Event Window Contract

Future event-window output should include date, location_id, timezone_id, sunrise, sunset, moonrise, pradosh_window, parana_window, solar_ingress_window, basis_disclosure, approximation_flags, conflict_flags, and review_status.

This is not runtime code.

## 19. Validation Doctrine

Future implementation must validate event windows against:

- at least one established astronomical reference;
- at least one independent computational implementation;
- multiple Indian locations;
- non-India timezone locations;
- DST locations;
- high-latitude edge cases;
- dates near solstices;
- moonrise-dependent observance cases;
- sunset/Pradosh dependent cases;
- Parana dependent cases.

M04 does not perform this validation. It defines the requirement.

## 20. Safety Doctrine

Future public output must avoid overclaiming.

Allowed future wording:

Calculated using the declared location, timezone, and event-window basis.

Observance may vary by regional rule family, sampradaya, and Panchang tradition.

Not allowed:

This is universally final for everyone.

This time is guaranteed regardless of location.

Ignoring this timing will cause harm.

## 21. M04 Acceptance Criteria

M04 is complete when location basis, timezone basis, UTC/local time preservation, sunrise basis, sunset basis, moonrise basis, Pradosh window basis, Parana window basis, event-window labels, polar/extreme latitude handling, privacy doctrine, internal contracts, and validation doctrine are documented.

M04 must also provide a machine-readable registry and a validator confirming that no runtime, Auth, Supabase, payment, external API fetch, public Panchang, public festival dates, or subscriber output is introduced.

## 22. M04 Status

M04 establishes the Location / Timezone / Sunrise Basis methodology.

M04 does not implement live calculation or public output.
