# Panchang verification corrections — 28 October 2026

This change addresses PV-01, PV-02 and PV-03 from the independent verification report while preserving the approved ephemeris, ayanamsha, element indices, UTC event times, bank data and publication gates.

## Corrections

**Complete transition metadata.** An approved precomputed result is used when its public fields and all eight transition endpoints are complete, bracket sunrise and have consistent ordinal pairs. A governed `available: false` result remains unavailable. Incomplete results use the existing approved calculator and expose the original content hash/reason in `panchang.precomputed_fallback`. The bank is not rewritten. All 384 approved daily records were compared with that calculator: no element-index differences and zero sunrise timestamp difference.

**Historical timestamp precision.** Event records add `local_exact`, `utc_offset_seconds`, timezone and precision metadata. `local_exact` preserves the runtime IANA civil-clock seconds, including historical offsets such as `+02:27:16`. Legacy `local` keeps a standard `±HH:MM` suffix and now parses to the same UTC instant; with a sub-minute offset its compatibility clock can differ by seconds from the exact civil clock. Civil-window exact fields are added too. The public reader prefers exact fields; Star Reflection compares UTC instants. Modern whole-minute-offset results retain their existing representation. The provider is explicitly recorded as runtime Intl/IANA; this fixes formatting precision without replacing or independently certifying its historical timezone rules.

**Boundary uncertainty.** Versioned policy `drishvara_boundary_review_v1` uses a conservative 60-second review interval, not a certified scientific error bound. The server retains model-derived labels and identifies affected sunrise elements. Panchang displays a notice and labels those values as profile-derived. Star Reflection withholds exact Nakshatra and philosophical output when its day basis or entered birth minute is too near a transition. The existing 39-record reflection bank is unchanged. DST gaps and repeated times still fail closed. The dedicated result summary shows the precision-review heading and notice directly, rather than hiding it in source details. Calculate also validates and commits the visible typed date, including browsers that omit a change event; invalid dates send no calculation request.

The historical Addis Ababa discrepancy remains in the independent comparison, explicitly marked as handled by the review policy. Its model index was not replaced to force agreement. Strict verification still rejects numerical failures and boundary disagreements lacking the required policy notice.

## Local validation

- 5,384-case regression matrix: all original element indices/angles and UTC event times unchanged, pinned by a readable pre-correction aggregate core hash.
- 64,584 legacy/exact event/window timestamp checks: zero inconsistencies.
- Independent numerical checks: zero tolerance failures; maximum transition difference remains 8.249 seconds. The single historical label disagreement is retained, marked for review and withheld from exact claims.
- Backend contracts: incomplete bank fallback, complete bank retention, governed unavailable retention, bank immutability, location approval/unknown guards, and inclusive/exclusive review thresholds.
- Page tests: boundary day/exact-time handling, exact historical offset seconds, ordinary resolved cases, DST gaps/repeats, reader notice and stale-notice clearing.

Live deployment/readback evidence is recorded separately in the corrections directory after publication. The active catalogue remains 3,266 locations; daily, festival and Word publication data are not changed.

## Reproduction

With Node 24 and the existing pinned dependencies available, run from repository root:

```sh
node tests/panchang-correction-contracts.mts
node tests/panchang-correction-presentation.mjs
node tests/panchang-correction-matrix.mjs /tmp/panchang-corrections
python scripts/verify-panchang-element-reference.py --directory /tmp/panchang-corrections --strict
```

Use the optional Python dependency pinned in `scripts/requirements-location-verification.txt`. The immutable aggregate baseline hash comes from the pre-correction audit, not from re-running the modified code.

Rollback uses the pre-change repository/function snapshot; no database rollback is needed because this release writes no source-bank rows.

## Live verification

Edge Function v10 and the UI follow-up were deployed successfully. Seven live API cases passed, including completed Varanasi endpoints, historical precision handling and polar unavailability. Real browser checks verified visible review notices, typed-date commits and ordinary Varanasi exact-window resolution. The 384-record bank payload hash was identical before and after deployment, and all 3,266 locations remain active.

[Live verification record](../data/quality/panchang-independent-verification/20261028/corrections/live-verification.json) · [Public-site screenshot proof](verification/panchang-precision-review-20261028.jpg).
