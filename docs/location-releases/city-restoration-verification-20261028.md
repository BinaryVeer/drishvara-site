# Live calculation verification — 28 October 2026

All 719 restored references passed fresh named-location calculations for 2026-10-28, with 719 available day results and no failures. All fields of the 719 approved records matched the public catalogue within 1e-12 degrees for coordinates; the catalogue contains 3,266 unique selectors. Returned coordinates, IANA timezone, absence of automatic substitution and zero-persistence response flags were checked. Solar timestamp offsets also agree with Python zoneinfo for their geographic IANA names.

Independent solar check: pyswisseph 2.10.3.2 / Swiss Ephemeris 2.10.03, Moshier analytical ephemeris, solar upper limb, sea level, 1013.25 hPa and 15 C. All 719 sunrise/sunset pairs passed a 120-second sanity tolerance; maximum absolute difference 5.881 seconds and median 2.041 seconds. This checks solar event timing; it is not independent certification of every Panchang element, place identity, source freshness, terrain/weather or historical timezone transition. The optional AGPL test dependency was used outside production; no solar runtime or calculation profile was replaced. Package reference: https://pypi.org/project/pyswisseph/2.10.3.2/

Ten live DST/historical cases passed, including 23/25-hour days in London, Paris, New York and Sydney, Bedauliya in 1988 and Township in 2000. Unknown-place and out-of-range-date requests returned 422. Browser checks verified Bengaluru alias discovery, Bedauliya and London displayed results, the Township landmark reference with unknown time, and explicit rejection of nonexistent/repeated London birth times using synthetic test inputs.

Found and fixed a provenance helper scope error which hid valid Panchang results. Added full rendering regression checks for headquarters, village, city and user landmark bases. Named selector requests now load the matching record directly; free-text, canonical-ID fallback and catalogue discovery retain pagination and existing resolver approval checks. Unknown and unapproved records remain rejected. Function v9 preserves the previous JWT configuration, astronomical module, import map and non-persistence contract. The sweep spans v8/v9, whose astronomy and coordinates are unchanged.

Compressed public ledgers and a machine-readable summary accompany this report. The earlier 2,876 historical/seasonal internal checks remain separate evidence. Screenshot: [London live result](verification/london-live-panchang-20261028.jpg).

Reproduce from repository root:

```sh
python scripts/verify-live-city-calculations.py --output /tmp/city-results.jsonl --workers 4
python -m pip install -r scripts/requirements-location-verification.txt
python scripts/verify-city-solar-reference.py --results /tmp/city-results.jsonl --output /tmp/city-solar.json
```
