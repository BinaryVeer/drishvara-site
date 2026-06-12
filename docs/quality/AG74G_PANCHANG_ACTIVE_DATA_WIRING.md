# AG74G — Panchang Active Data Wiring

AG74G wires Panchang & Festival View from the legacy pilot-preview data source to the AG74F static-engine result data.

## Scope

- Creates active static Panchang runtime data.
- Preserves legacy data file for compatibility.
- Updates the browser runtime fetch path to the active static result data file.
- Keeps public UI copy unchanged.

## Active Runtime Source

- `generated/panchang-active-static-result-data.json`

## Compatibility

The active data file keeps the legacy preview-compatible field shape so the existing renderer can consume it while static-engine fields are carried forward.

## Disabled

- Backend runtime
- Supabase/Auth
- Personal data storage
- Live ephemeris API dependency
- Final religious authority claim

## Next Step

AG74H should perform active UI QA against the AG74G data source.
