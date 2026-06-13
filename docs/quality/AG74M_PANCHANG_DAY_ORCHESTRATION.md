# AG74M — Panchang Day Orchestration

AG74M converts the validated AG74K date/location request and AG74L astronomical primitives into a location-aware, sunrise-anchored internal daily Panchang record.

## Local civil day

The selected civil date is interpreted in the resolved IANA timezone. AG74M finds the first UTC instant belonging to that local date and the first instant belonging to a later local date.

This supports ordinary 24-hour dates, 23-hour and 25-hour daylight-saving dates, and governed rejection of a historically nonexistent local date. The selected date is not converted into a Varanasi instant.

## Sunrise and sunset

AG74M uses Astronomy Engine 2.1.19 `SearchRiseSet` locally and offline.

The locked convention is:

- apparent upper limb of the Sun;
- the backend's standard 34-arcminute near-horizon refraction model, adjusted for atmospheric density;
- level horizon;
- no terrain or local-obstruction model;
- zero metres observer elevation by default.

An elevation override is accepted only when it is explicitly approved and accompanied by a traceable source. Observer elevation is passed as height above mean sea level. The backend's `metersAboveGround` parameter remains zero, so AG74M does not introduce a horizon-dip assumption that would conflict with the locked level-horizon convention.

## Sunrise allocation

At local sunrise AG74M allocates:

- Tithi from 12-degree Moon–Sun elongation segments;
- Nakshatra from 27 equal sidereal lunar segments;
- Yoga from 27 equal combined sidereal Sun–Moon segments;
- Karana from 6-degree Moon–Sun elongation segments;
- Paksha from the Tithi half;
- Vara from the sunrise-anchored local civil date.

## Transitions

The next transition uses the AG74L versioned angular root finder.

The previous transition uses a 30-minute backward scan followed by bisection until the bracket is no wider than 0.5 seconds.

Every transition carries both UTC and local IANA-timezone representations.

## Skipped and repeated elements

AG74M compares the element state at the previous, current and next available local sunrises.

- A repeated element has the same index at consecutive sunrises.
- A skipped element is a cyclic index not represented between consecutive sunrise states.
- Missing neighboring sunrises produce an unknown comparison rather than an invented inference.

## Extreme latitudes

When no sunrise exists in the selected local civil day, daily Panchang allocation is blocked. Where both sunrise and sunset are absent, the apparent solar altitude near the middle of the local day distinguishes governed polar-day and polar-night states.

## Existing work consumed

The earlier AG70 sunrise model is consumed as doctrine and field-shape evidence. Its approximate dry-run sunrise implementation is not promoted. AG74M uses the exact-pinned AG74L astronomy dependency.

## Safety boundary

AG74M does not:

- generate festivals or ritual windows;
- generate lunar months or the annual Hindu calendar;
- publish Panchang results;
- change the public UI or CSS;
- deploy a backend service;
- activate Supabase;
- store personal locations;
- call an external ephemeris API;
- expose a public method selector.

The known public Panchang overflow, responsive layout and typography correction remains mandatory AG74O work.
