# Independent Panchang verification — 28 October 2026

**Result: verification completed with three open findings.** This is not an unconditional production-readiness certification. Calculation, publication and location approval rules were retained.

## Coverage and result

The deployed Edge Function v9 astronomical module exactly matched main at the start of this audit. Its SHA-256 is `c9817e502a3edc72a7e0ac63a3425d4a4fa903c0847a91929bf874d1b7108c8a`.

- 5,384 production-code cases: all 3,266 active references on 28 October 2026; nine historical/seasonal/DST dates across 222 country/timezone pairs; a complete October cycle in Varanasi, London, New York and Sydney.
- 5,382 cases had sunrise and eligible elements. Two midsummer cases at Sisimiut, Greenland correctly returned no sunrise; Swiss Ephemeris independently returned circumpolar status.
- 21,528 independent element comparisons and 43,056 previous/next transition comparisons. All angular and UTC timing differences were within the tolerances recorded before measurement (0.02 degrees; 180 seconds).
- All 3,266 current-day element-index results matched the convention-aligned independent reference.
- All 144 ordinal crossings were covered. 86,112 probes one second before/after production boundaries agreed with their reported ordinal pairs; independent reference roots were also checked on both sides.
- Seven fresh live endpoint checks: six calculator responses matched the audited source exactly. The Varanasi precomputed response matched element indices, but lacked six transition endpoints.

| Element | Largest angle difference (degrees) | Largest transition difference (seconds) |
|---|---:|---:|
| Tithi | 0.000698 | 5.280 |
| Nakshatra | 0.000873 | 6.100 |
| Yoga | 0.001291 | 8.249 |
| Karana | 0.000698 | 5.280 |

## Independent conventions

The reference uses pyswisseph 2.10.3.2 / Swiss Ephemeris 2.10.03, Moshier ephemerides, apparent geocentric Sun and geometric geocentric Moon, true equinox of date. Solar/lunar positions and boundary bisection are independent of Astronomy Engine. The primary run intentionally uses the approved linear TT ayanamsha formula and an independently evaluated Espenak–Meeus timescale. It therefore tests the numerical engine **conditional on the existing profile**, rather than certifying that profile as the only traditional convention.

The native Swiss-timescale comparison is retained separately. Differing future delta-T models cause up to roughly 113 seconds of transition differences near 2100; those must not be misreported as a production root-solver defect or erased by silently changing the timescale. Standard Swiss Lahiri was also compared separately. No matched-timescale sampled classification changed solely because of substituting that ayanamsha.

Reference sources: [Astronomy Engine source/documentation](https://github.com/cosinekitty/astronomy), [Swiss Ephemeris programming interface](https://www.astro.com/swisseph/swephprg.htm), [Espenak–Meeus delta-T polynomials](https://eclipse.gsfc.nasa.gov/SEcat5/deltatpoly.html). Swiss Ephemeris is an optional verification dependency only; the production runtime remains Astronomy Engine 2.1.19.

## Findings and concrete correction path

| Finding | Evidence | Required follow-up |
|---|---|---|
| PV-01: historical boundary sensitivity | Addis Ababa, 1900-01-02: production Nakshatra 21 versus independent 20 at the same sunrise. The boundary differs by 2.338 seconds, straddling sunrise. | Establish explicit near-boundary uncertainty handling; do not replace the approved ephemeris or claim an exact segment merely to remove the discrepancy. |
| PV-02: historical local timestamp precision | 1,224 transition strings in 153 sampled cases (1900 and 1950) differ from their UTC event by up to 30.999 seconds. Historical offsets with seconds are rounded to whole minutes in the local ISO strings. | Introduce backward-compatible exact-offset metadata/display and regression tests. Preserve UTC as the authoritative event timestamp and retain existing clients' parsing compatibility. |
| PV-03: precomputed metadata completeness | Varanasi, 2026-10-28 has null previous/next Nakshatra, Yoga and Karana transitions; the approved calculator supplies them. | Review compatibility normalization or a guarded, approved-calculator fallback for requests requiring complete transition metadata. Retain the approved bank and publication gates. |

The historical label exception remains explicitly recorded; it is not counted as an exact classification pass. Current-day sampled classifications all matched. Numerical tolerances are not a substitute for an uncertainty policy or complete precomputed metadata.

## Reproduction

Use Node 24 with `astronomy-engine@2.1.19` available, and the pinned optional Python verification requirement already in `scripts/requirements-location-verification.txt`. Run from repository root:

```sh
node scripts/verify-panchang-element-matrix.mjs --output-dir /tmp/panchang-elements
python scripts/verify-panchang-element-reference.py --directory /tmp/panchang-elements
python scripts/verify-panchang-element-reference.py --directory /tmp/panchang-elements --timescale native
node scripts/probe-panchang-element-boundaries.mjs --directory /tmp/panchang-elements
python scripts/verify-panchang-element-live-parity.py --directory /tmp/panchang-elements
```

The immutable case matrix and detailed comparison ledger are compressed in `data/quality/panchang-independent-verification/20261028/`. The full production-output ledger is reproducible and its original hash is recorded in `closure.json`. The source snapshot matters: rerunning after an engine or approved source-bank change is a new audit, not a reproduction of this result.

Reference and live-parity tools support `--strict` to return exit code 2 when unresolved differences remain. Without it they complete the evidence report; exit code zero must not be treated as automatic approval.
