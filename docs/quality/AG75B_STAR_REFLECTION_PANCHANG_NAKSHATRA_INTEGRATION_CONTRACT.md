# AG75B — Star Reflection Panchang and Nakshatra Integration Contract

## Decision

AG75B defines a repository-only contract for future Star Reflection
consumption of the closed SUP02 Panchang runtime. It consumes 18
immutable source records at governed baseline `34a633891b5ad9d72b841474342b6f0b14f2f53a`.

Reviewed candidate contract SHA-256:
`e67a31b2a36424dd5a74dccb218269e81cee353c1ab38c0b2affa45c607e4df7`.

AG75B does not call the live runtime, modify the public UI, expand the
output bank, change the database, deploy the Edge Function, change a
runtime flag or persist personal input.

## Runtime request mapping

The Panchang request remains a POST request containing an ISO local
civil date and either an approved named location or worldwide
coordinates with an explicit IANA timezone.

Star Reflection date of birth is converted from `DD/MM/YYYY` to the
same local civil date in `YYYY-MM-DD` form. It must not be shifted
through UTC conversion.

Name and birth time are never sent to the Panchang runtime. Exact and
unknown-time modes may later request date/location Panchang context.
Pending and invalid birth-time states do not initiate runtime
consumption and retain the existing `pending_or_invalid` public
degradation class.

## Runtime response consumption

Both `approved_precomputed_record` and
`approved_server_calculation` use one response-consumption contract.
The declared source must be preserved.

An available result must contain the governed sunrise, Vara, Paksha
and Nakshatra name/index fields. Nakshatra angle and previous/next
transition records are optional because approved legacy precomputed
records are not required to contain them.

Exact birth-time Nakshatra resolution requires complete previous and
next transition metadata. Missing transition metadata produces an
explicit limitation state; it does not trigger an invented value.

## Minute-precision rule

The public birth-time input has `HH:MM` precision. It represents the
whole local minute interval, not a second-precise instant.

An exact birth Nakshatra may be resolved only when that complete
minute lies within the proven interval from the governed previous
Nakshatra transition, inclusive, to the governed next transition,
exclusive.

When a transition falls inside the entered minute, the result is
`exact_transition_minute_ambiguous`. When the entered minute is
before the supplied previous transition or at/after the supplied next
transition, the result is
`exact_outside_single_transition_window`. The current runtime exposes
only one transition on each side of sunrise, so the contract must not
extend `next.toIndex` across an unproven later interval.

Ambiguous or nonexistent daylight-saving local times remain
unresolved. No implicit timezone offset may be selected.

## Unknown, pending and invalid time

Unknown birth time may use the sunrise Nakshatra only as transparent
day-level Panchang context. It must never be labelled as the user's
birth star.

Pending and invalid states do not claim Nakshatra precision. They
remain separate validation states but share the current cautious
`pending_or_invalid` public degradation class.

## Safety and privacy

No unresolved state may be converted into a fabricated Panchang
value, Nakshatra identity or deterministic prediction.

Name, date of birth, birth time, location, coordinates and timezone
remain session-only inputs. Browser secrets and service-role keys are
prohibited.

## AG75C handoff

AG75C may create an internal expanded output bank for every governed
resolution and degradation state. It may not modify the public UI,
call the live runtime during bank creation, alter the database or Edge
Function, change runtime flags, persist inputs or reopen SUP01/SUP02.

Prepared for **vikash vaibhav**.
