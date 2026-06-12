# AG73B — Birth-Time-Aware Star Reflection Contract

AG73B formalises birth time as part of the Star Reflection public pilot result basis.

## Active Basis

Star Reflection now uses:

- Date of birth
- Birth time
- Birth place
- Timezone

## Birth Time Modes

- Exact HH:MM
- Exact birth time unknown
- Pending/invalid HH:MM safe fallback

## Boundary

Birth time is used only for session-level active pilot result generation. It is not stored. Backend, Supabase, deterministic prediction and sensitive profiling remain blocked.

## Next Step

AG73C should create birth-time-aware safe output/data records.
