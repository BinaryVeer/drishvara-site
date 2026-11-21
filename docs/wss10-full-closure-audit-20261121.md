# Closure audit — 21 November 2026

**Result: diagnostic implementation completed; full interpretation/release closure remains unqualified.** Do not report this as authenticated Shadbala or completed public personalised timing. The distinction is a measured limitation, not a new requirement for a named scholar's approval.

Baseline main `4aab292ca11e0a44a9b7d39ea5247ee094959050` had 38 source-bound natal rules, seven transit rules and partial timing protocols. This change adds all six planetary-strength components, twelve house-strength calculations, astronomical observations, independent reference fixtures, explicit method choices and private English/Hindi report integration. It preserves public pages, database authorization and existing publication gates.

## Implemented and tested

- All six planetary components, five positional subcomponents and nine temporal subcomponents; seven visible planets, conversion to rupas and profile-specific minimums.
- Seven classical vargas, natal compound friendships, explicit moolatrikona ranges, ordinary and special aspects, mean-motion model, isolated war transfer; exact ties/shared simultaneous wars withheld.
- Actual cardinal geometry and Sripathi house midpoints. Bhava directional strength uses zodiac arc/3; the draft's house-count approximation was corrected against BPHS27.26–28.
- Twelve house totals with lord, directional, aspect, occupancy and rising adjustments. Twilight-uncertain samples withhold house outputs.
- Nine birth-clock samples bound to the same precision-audited birth record. Sampled minima/maxima are diagnostic, never a continuous stability assertion.
- 1,680 independently expressed Python varga/aspect reference values; 24 Swiss/Moshier meridian and sunrise/sunset comparisons across six cities and four historical/DST dates. Largest differences: 0.000043515 degrees and 3.037 seconds. This does not validate the entire classical strength model.
- PM20.66 individual transit receiver/origin clauses, tested over 144 sign rotations. No invented requirement for all receivers to match simultaneously; no event window.
- PM20.65 competing Lagna/Navamsa readings retained separately; neither silently authorizes another period lord. Optional Rahu variant inactive.
- Private EN/HI strength details show components and method limitations. No narrow seven-column mobile table.

## Source review and explicit differences

The machine-readable `data/methodology/jyotisha/wss10-strength-profile-v1.json` identifies source witnesses, hashes, passages, formula choices and remaining limitations. Sanskrit BPHS27 was visually checked on PDF pages82–85 and compared with a second transcription. It is a typeset witness, not a verified critical recension.

This is a **declared diagnostic synthesis**, not a claim that all selected conventions occur in one authenticated source. For example, Sanskrit BPHS27.3 gives integer varga scores while Raman gives fractional scores; the implementation explicitly uses Raman's ladder. BPHS literal Drik superaddition, Sun/Moon Cheshta allocation and minimums are separately identified. Whole-sign Kendradi, cardinal Dig and Sripathi strength houses remain distinct. Classical mean-motion epoch/calibration and war convention are declared supporting choices. None may silently become an authorised event-rule prerequisite.

The Raman standard horoscope table cannot be an unquestioned golden oracle:

| Item | Preserved finding |
| --- | --- |
| Sun | Displayed components sum424.94; printed total424.24 |
| Mars | Earlier Kala30.060 reconciles total298.14; summary Kala33.06 does not |
| Mercury | Total537.02 implies8.9503rupas; printed8.85 |
| Jupiter | Components433.77; printed total433.71 |
| Saturn | Printed natural8.37 differs from60/7;8.57 reconciles total |
| Sun minimum | Raman300 vs BPHS390; a method difference, not a typo repair |

Original numerical facts and audit findings remain in `data/quality/jyotisha/wss10-strength-reference-audit-20261121.json`. No whole modern translation or source software is copied. Swiss Ephemeris is a reference-only fixture generator; the production dependency/license remains unchanged.

## Exact remaining closure blockers

1. **Full-strength source qualification:** reconcile or isolate source conventions into authenticated complete profiles. WSS11 now independently checks all numerical components under the declared synthesis (37 cases, 11,226 values), plus 49 printed source cells. That closes the missing independent arithmetic path; it does not authenticate a combined source tradition or validate the classical mean model as modern astronomy.
2. **Continuous uncertainty:** establish bounds across the entire birth and period-inception interval, including discontinuities and threshold crossings. Nine or five samples cannot prove that a rule holds throughout.
3. **Remaining interpretation conditions:** source-resolve the PM20.65 reading and qualify complete natal/inception strength and auspicious-house synthesis before event timing. PM20.66 sign matches are only individual diagnostic clauses.

These are engineering/source-verification blockers; there is no asserted mandatory named-human endorsement. Nityanand Misra is not claimed as a horoscope-method source or reviewer. `ready_for_prediction`, public-output permissions and event windows remain false/null/empty.

## Reproduction

Run the four `tests/wss10-*.mjs` test programs, `node tests/wss09-timing-review.mjs`, and `node tests/wss08-audited-bilingual-view.mjs`. The WSS10 workflow regenerates Python arithmetic and reference-only Swiss observations; the existing audited-preview workflow checks English/Hindi desktop/mobile behavior and rejects public/runtime/database modifications.


## WSS11 continuation — full-component arithmetic verified

A separately written Python implementation now checks all six planetary components and their subcomponents, seven per-varga terms, twelve house calculations and temporal lords. The 37 cases comprise the recorded standard-horoscope inputs, 24 explicitly synthetic clock/geometry/phase cases, all ten isolated starry-graha war pairs and two twilight states. There are 11,226 numerical comparisons at absolute tolerance1e-6virupa/degrees (rounded JavaScript outputs use1e-8). Inputs and model constants are shared declarations; algorithms are independently expressed in Python, including vector circular means, interpolation knots and piecewise Ayana integration. It does not call the JavaScript engine or import an external astrology implementation.

The original Raman table at printedp24/PDFp29 was visually checked. All49 individual numerical cells agree with both implementations. Three printed totals disagree with the source cells: Moon49.750 vs sum48.750, Mercury13.500 vs sum135.000, Venus11.625 vs sum116.250. Those printed facts are preserved; no corrected source text is claimed. Source PDF hash matches the prior audited copy.

Reproduce with `python tests/wss11-strength-reference.py` and `node tests/wss11-strength-reference.mjs`. This is full-component **arithmetic** verification under the declared diagnostic synthesis. It is not evidence that the profile is an authenticated single-recension method, a proof across an uncertain continuous interval, or authorization to publish event dates.
