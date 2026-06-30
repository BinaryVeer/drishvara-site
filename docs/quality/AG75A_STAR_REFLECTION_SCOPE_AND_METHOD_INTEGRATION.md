# AG75A — Star Reflection Scope and Method Integration

## Decision

AG75A locks the expansion scope and method-integration boundary for
Star Reflection. It consumes 32 immutable source records from AG72,
AG73, AG74P and the formally closed SUP02 runtime boundary.

The governed repository baseline is `01aca0107d8f84bafb5f4532aec164a9e1e599de`. The reviewed
candidate plan SHA-256 is `88a8bc3fdcc068e2e06b7cf2bf71f0faf3782dc8f14a86cef415481eb4af39d1`.

## Integrated method

The primary orientation remains **Moon-led and
Nakshatra-oriented reflection**. Panchanga, approved location,
coordinates and timezone provide supporting context. The output must
remain reflective, symbolic, non-deterministic and non-fatalistic.

The existing birth-time modes remain:

- exact session-only birth time;
- unknown birth time; and
- pending or invalid birth time.

No mode permits personal-data storage or hidden precision claims.

## Runtime boundary

The governed Panchang runtime is `sup01_panchang_runtime_v1`, using
canonical release `ag74p_final_2026_06_24`. SUP02 public cutover
remains active and public input persistence remains disabled.

AG75A does not call or modify the runtime. It does not change the
database, deploy the Edge Function, change a runtime flag or modify
the public UI.

## Safety boundary

AG75A and all later AG75 stages prohibit deterministic prediction,
diagnosis, sensitive profiling, medical, financial or legal advice,
relationship or career certainty, and directive decision claims.

Name, date of birth, birth time, location, coordinates and timezone
remain session-only inputs and must not be persisted.

Missing, unavailable or failed runtime values must remain explicit.
No Panchang or Nakshatra value may be fabricated.

## AG75 sequence

1. **AG75A** — scope, dependency and safety integration.
2. **AG75B** — Panchang/Nakshatra basis-integration contract.
3. **AG75C** — expanded safe output bank.
4. **AG75D** — governed non-persistent public UI/runtime wiring.
5. **AG75E** — end-to-end runtime, browser, safety and no-storage QA.

## Handoff

AG75B may create repository governance and contract records only. It
must define exact runtime-field consumption, Nakshatra handling,
birth-time degradation, unavailable states and no-persistence
requirements before any AG75C output expansion or AG75D UI change.

Prepared for **vikash vaibhav**.
