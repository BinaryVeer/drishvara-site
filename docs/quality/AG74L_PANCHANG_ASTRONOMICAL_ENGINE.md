# AG74L — Panchang Astronomical Engine

AG74L replaces the preliminary AG71I formula shell with a versioned, locally executed astronomical primitive engine. It remains internal and public-output blocked.

## Selected backend

AG74L exact-locks **astronomy-engine 2.1.19** under the MIT licence. The package runs locally in Node and does not call an external ephemeris API.

The selected package provides the true-of-date geocentric Sun and Moon coordinate primitives required by the AG74J Drik contract. Its project documentation states an accuracy design target within one arcminute and describes validation against NOVAS and JPL Horizons.

Swiss Ephemeris is not integrated as runtime code because its dual AGPL/professional licence requires a separate distribution and service decision. A small set of offline comparative numerical values is retained only as a non-runtime validation fixture.

Direct JPL DE440 kernel integration is also deferred because the binary-kernel and adapter footprint is disproportionate to the present static Node architecture.

## Time and orientation models

- Civil input: UTC ISO-8601 instant.
- Universal time: Astronomy Engine UT, with the library's documented UT1≈UTC approximation.
- Ephemeris time: TT.
- Delta-T: Espenak–Meeus piecewise polynomial as implemented by astronomy-engine 2.1.19.
- Precession: IAU 2006 implementation in astronomy-engine 2.1.19.
- Nutation: IAU 2000B implementation in astronomy-engine 2.1.19.
- Sun: apparent geocentric true ecliptic longitude of date.
- Moon: geocentric true ecliptic longitude of date.
- Core Panchang longitudes remain geocentric; topocentric treatment is reserved for AG74M rise/set work.

## Lahiri / Chitrapaksha conversion

AG74L uses the versioned Drishvara model `drishvara_lahiri_linear_tt_v1`:

- J2000 anchor: 23.85675 degrees;
- rate: 0.013969 degrees, or 50.2884 arcseconds, per tropical TT year;
- silent fallback: prohibited.

The model is benchmarked at six dates spanning 1900 through 2100.

## Transition solver

The engine exposes deterministic forward root finding for:

- Moon–Sun elongation;
- sidereal Moon longitude;
- sidereal Sun longitude;
- combined sidereal longitude used by Yoga.

The solver uses a fixed UTC coarse scan, angular unwrapping and bisection. AG74M can use these primitives for Tithi, Karana, Nakshatra, Yoga and Sankranti boundaries.

## Validation

AG74L executes ten deterministic internal checks:

- six Sun/Moon/ayanamsha state comparisons across the supported range;
- four Moon–Sun transition-time comparisons;
- exact package/version/licence verification;
- deterministic result regeneration;
- root residual and time-error thresholds.

## Safety boundary

AG74L does not calculate sunrise or sunset, allocate daily Panchang values, generate lunar months, generate festivals, change the public UI, deploy a backend service, call an external ephemeris API, use Supabase or store personal location data.

AG74M may now implement location-aware sunrise, sunset and daily Panchang orchestration.
