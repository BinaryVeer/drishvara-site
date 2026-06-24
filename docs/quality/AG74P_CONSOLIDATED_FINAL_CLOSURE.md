# AG74P — Consolidated Final Closure

## Closed assets
- Panchang & Festival View
- Star Reflection

## Approved public scope
- Five named locations: Varanasi/Banaras, Itanagar, New Delhi, Ranchi and Tokyo
- Worldwide coordinate calculation with valid coordinates and a validated IANA timezone
- All 384 Varanasi Vikram Samvat 2083 daily records
- All 114 generic monthly observance candidates under seven scope-limited rules
- Four-page Varanasi annual book with twelve canonical slots and variable physical instances

## Festival timing
Each public observance separately stores astronomical_condition_window, observance_window, primary_public_window and ritual_windows[]. Visible Begins and Ends use primary_public_window. Ritual windows never overwrite it.

## Boundary
Representative external comparisons support the approved Varanasi annual data without claiming universal equivalence across every regional or sectarian convention. Star Reflection remains reflective, non-deterministic and session-only; no personal birth input is written to Supabase.

This patch creates the final code, data, migration and release tooling. Commit/push, Supabase write/readback, deployment verification and rollback evidence are controlled execution gates under the same AG74P patch.
