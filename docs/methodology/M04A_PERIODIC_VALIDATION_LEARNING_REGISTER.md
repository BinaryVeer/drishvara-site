# M04A — Periodic Validation, Calibration & Learning Register

Status: Methodology/Governance only  
Phase: M-Methodology  
Depends on: M00, M01, M02, M03, M04  
Runtime impact: None  
Subscriber impact: None  
Public Panchang impact: None  

## 1. Purpose

M04A defines Drishvara’s periodic validation, calibration, database tuning, and learning-record methodology.

This module is inserted before M05 because subscriber guidance should not be built on an unvalidated or static methodology base.

M04A does not activate live Panchang calculation, public festival output, subscriber guidance, Auth, Supabase, payment, external API fetch, automated correction, or automatic database mutation.

## 2. Why M04A is Needed

Panchang, vrat, festival, sunrise, sunset, moonrise, Pradosh, Parana, and regional observance logic require repeated validation.

A one-time methodology document is not enough.

Drishvara must periodically compare calculated or proposed figures against reviewed references, record mismatches, classify reasons, update learning notes, and create database tuning tasks only after review.

## 3. Validation Cadence Doctrine

M04A supports two validation cycles:

- fortnightly validation;
- monthly validation.

Fortnightly validation is preferred during methodology build-out and early internal preview.

Monthly validation is acceptable once the methodology stabilizes.

No validation cycle may directly alter public output because public runtime is not active in M04A.

## 4. Scope of Validation

Future validation should cover:

- tithi at sunrise;
- tithi start and end times;
- paksha assignment;
- nakshatra at sunrise;
- yoga and karana where applicable;
- sunrise and sunset timings;
- moonrise timings where applicable;
- Pradosh window;
- Parana window;
- Ekadashi decisions;
- Pradosh decisions;
- Sankashti decisions;
- Purnima and Amavasya decisions;
- Sankranti timing;
- named festival registry mapping;
- regional or sampradaya variant handling;
- skipped or repeated tithi handling;
- conflict flags.

## 5. Validation Source Doctrine

Validation must compare Drishvara records against reviewed source families.

Possible source families include:

- established Panchang source;
- regional Panchang source;
- temple or sampradaya source;
- modern astronomical computation reference;
- internal M01 calculation reference;
- manual reviewer note;
- published festival calendar where source status is clear.

M04A does not fetch from external APIs. Source snapshots must be manually reviewed or supplied through approved internal review processes.

## 6. Figure Validation Record

Each validation item must preserve:

- validation cycle ID;
- validation date;
- reviewed date or date range;
- location;
- timezone;
- observance or Panchang element;
- Drishvara proposed value;
- reference value;
- match status;
- difference value;
- difference unit;
- severity;
- suspected cause;
- source reference;
- reviewer note;
- action required;
- approval status.

## 7. Match and Variance Doctrine

Validation results must be classified as:

- exact_match;
- acceptable_variance;
- minor_mismatch;
- major_mismatch;
- source_conflict;
- regional_variant_difference;
- sampradaya_variant_difference;
- calculation_basis_difference;
- location_or_timezone_difference;
- insufficient_reference;
- human_review_required.

No mismatch should be silently ignored.

## 8. Severity Doctrine

Each mismatch must be assigned severity:

- info;
- low;
- medium;
- high;
- critical.

Critical mismatches include cases where an observance date, fasting date, Parana window, Pradosh window, or tithi-at-sunrise decision may change.

## 9. Learning Register Doctrine

Every validation cycle must produce a learning register.

The learning register records:

- what was checked;
- what matched;
- what differed;
- why it differed;
- whether difference is due to calculation, source, location, timezone, regional rule, sampradaya rule, or data-entry issue;
- whether database tuning is required;
- whether methodology update is required;
- whether human review is required.

Learning records must be preserved even when no immediate action is taken.

## 10. Database Tuning Doctrine

M04A may propose database tuning, but must not automatically mutate data.

Allowed future tuning recommendations:

- add missing source reference;
- correct observance category;
- add regional variant;
- add sampradaya variant;
- adjust event-window basis after review;
- update coordinate precision;
- update timezone mapping;
- mark source conflict;
- mark human-review-required;
- update activation status;
- create methodology issue for later review.

Not allowed in M04A:

- automatic public date correction;
- automatic subscriber output change;
- automatic deletion of source record;
- automatic overwriting of reviewed values;
- automatic external API sync.

## 11. Calibration Backlog Doctrine

Every tuning recommendation must become a backlog item.

Backlog item status values:

- proposed;
- under_review;
- accepted;
- rejected;
- deferred;
- implemented_in_methodology;
- implemented_in_database;
- requires_external_source_review;
- closed_no_action.

A backlog item must include reviewer, reason, source, and approval status.

## 12. Review Meeting Doctrine

Each fortnightly or monthly validation cycle should produce a short review note containing:

- cycle period;
- sample coverage;
- major matches;
- major mismatches;
- unresolved conflicts;
- tuning actions proposed;
- accepted learnings;
- deferred items;
- next-cycle focus.

This can later support internal audit and methodology maturity.

## 13. Metrics Doctrine

M04A should track the following metrics in future internal review:

- total records checked;
- exact match count;
- acceptable variance count;
- mismatch count;
- source conflict count;
- regional variant count;
- sampradaya variant count;
- high-severity mismatch count;
- critical mismatch count;
- pending human review count;
- accepted tuning count;
- rejected tuning count;
- closure rate.

These are methodology metrics, not public quality claims.

## 14. Audit and Trace Doctrine

Every validation record must preserve traceability.

Minimum trace fields:

- module reference;
- cycle ID;
- timestamp;
- reviewer;
- source reference;
- Drishvara record reference;
- comparison basis;
- decision note;
- approval state;
- next action.

## 15. Privacy Doctrine

Subscriber-specific data must not be used for validation unless necessary and consented.

Generic Panchang validation should use generic locations and dates.

Birth location, exact subscriber location, DOB, and private preference data must not be exposed in validation logs.

## 16. Safety Doctrine

M04A must avoid overclaiming.

Allowed future wording:

Validation completed for internal methodology review.

Differences were recorded for review and tuning.

Not allowed:

All Panchang figures are guaranteed.

All festival dates are universally correct.

The system has divine certainty.

## 17. Future Internal Validation Record Contract

A future validation record should include validation_cycle_id, validation_type, cadence, reviewed_date_range, location_basis, timezone_basis, target_type, target_id, drishvara_value, reference_value, match_status, variance, severity, suspected_cause, source_reference, reviewer_note, learning_record_id, tuning_backlog_id, approval_status, and public_output_allowed.

This is not runtime code.

## 18. M04A Acceptance Criteria

M04A is complete when validation cadence, figure validation record, match and variance classification, severity doctrine, learning register, database tuning doctrine, calibration backlog, review meeting note, metrics, audit trace, privacy doctrine, and safety doctrine are documented.

M04A must provide a machine-readable registry and validator confirming that no runtime, Auth, Supabase, payment, external API fetch, public Panchang, public festival dates, automatic correction, automatic database mutation, or subscriber output is introduced.

## 19. M04A Status

M04A establishes the periodic validation, calibration, database tuning, and learning register methodology.

M04A does not implement live validation or public output.
