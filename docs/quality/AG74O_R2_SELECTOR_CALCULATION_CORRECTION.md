# AG74O-R2 Selector and Calculation Correction

## Status

AG74O-R2 is complete as an approval-aware correction stage.

## Corrected behaviour

- Varanasi / Banaras and today remain the landing UI state.
- Page boot does not calculate a Panchang result.
- The named-place/search control remains active, but it exposes no approved result records at the current zero-approval baseline.
- The current approved projection contains zero records; the Varanasi option is a landing UI-state placeholder, not an approved selector result.
- Unknown named places return governed-unavailable.
- Valid coordinates with a validated IANA timezone return calculation-pending until explicitly approved.
- Invalid coordinates or timezone values return invalid-input without substitution.
- The local astronomy engine remains available behind the approval gate.
- Location, coordinate, timezone and approval provenance are displayed separately.

## Preserved blocks

Public selection, Panchang computation, automatic canonical merging, automatic ambiguous-alias resolution, runtime external APIs, Supabase and input persistence remain disabled.

## Annual book

The four-page Varanasi annual reference book remains available independently of daily calculation approval.

## Next stage

AG74O-R3 may plan governed calendar activation. It is ready for planning but is not automatically started.
