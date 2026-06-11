# AG71Q-R1 — Public Pilot Panchang Preview Implementation

AG71Q-R1 wires the existing Panchang preview button and mini-table to a public pilot preview JSON file.

## What Changed

- `generated/panchang-pilot-preview-data.json` contains the four-location pilot preview records.
- `index.html` fetches the pilot JSON and renders values after Preview Panchang is clicked.
- Exact Panchang values are not embedded directly inside `index.html`.
- The existing Panchang mini-table is reused.
- The preview is labelled as pilot and under verification.
- Upcoming Observance remains a separate editorial-verification block.

## Still Blocked

- Backend runtime activation
- Supabase activation
- Full location-bank scale-up
- Unlabelled production Panchang release

## Next Step

AG71R should perform public pilot QA and Panchang pilot closure.
