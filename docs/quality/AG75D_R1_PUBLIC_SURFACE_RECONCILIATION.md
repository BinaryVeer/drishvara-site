# AG75D-R1 — Public Surface Reconciliation

## Governed baseline

`aa05da21580e6f45d33162fba49684bd8cd97864`

AG75D-R0 candidate SHA-256:

`ce9dccf58212963704a38a8aa2d0d89b80b8fe34f22f28234d8b67e178b7389a`

Reconciled controller SHA-256:

`980cfb25ead9c78464a0c36ad9aeee441de359c492c38f48a4d483ab547d4711`

## Decision

AG75D-R1 reconciles the active browser surface without modifying the
SUP02-closed `index.html`, Edge Function, database, runtime release or
cutover flag.

The five AG74P-approved named locations—Varanasi / Banaras, Itanagar,
New Delhi, Ranchi and Tokyo—become the shared named-location source
for Panchang and Star Reflection. Worldwide coordinate mode remains
available with an explicit valid IANA timezone.

The date surface is reduced at runtime to:

- Previous Day;
- one native date picker, defaulting to the current date; and
- Next Day.

A valid change automatically requests the governed result. The text
date field, Today button, explicit Calculate button, alias field and
pending-commit wording are removed from the active surface.

Empty ritual-window rows are hidden. Reviewed ritual windows appear
only when a non-empty approved array exists. Manual calendar-page
navigation updates its visible status.

The current book is labelled **Varanasi Hindu Lunar Reference
Calendar**. AG75D-R1 does not claim that the existing observance bank
is an all-faith calendar. A sourced India all-faith calendar remains a
separate prerequisite.

## Count correction

The R0 report counted nine regex occurrences around the Star
Reflection pilot selector. The governed issue is four unique hardcoded
pilot locations; the additional matches were duplicated quick-pick
markup and a template expression.

## Historical validator boundary

AG75B is baseline-bound to the pre-AG75D browser controller hash.
AG75D-R1 is an authorised controller mutation under the AG75C-to-AG75D
boundary. Validation therefore uses SUP02 closure, the immutable AG75C
bank and `validate:ag75d:r1`, rather than the aggregate
`validate:project` chain.

## Handoff

AG75D-R2 may wire the AG75B resolver and immutable 39-record AG75C
Star Reflection bank. Personal input must remain session-only.

Prepared for **vikash vaibhav**.


## Star Reflection birth-place dropdown correction

Browser QA showed that the historical HF12 custom wrapper
opened correctly for Panchang but remained closed inside
the Star Reflection card. AG75D-R1 therefore restores the
native HTML select only for `star-birth-place-select`,
hides the stale custom wrapper and retains the same five
AG74P-approved named locations.

Corrected controller SHA-256:

`980cfb25ead9c78464a0c36ad9aeee441de359c492c38f48a4d483ab547d4711`

This correction does not change `index.html`, the Edge
Function, database, runtime release, cutover state,
approved-location scope or input-persistence boundary.


## Star Reflection pointer-interaction correction

Browser diagnostics confirmed six governed options and a visible native select, but `pointer-events` remained `none` because the historical HF12 hidden-select rule uses `!important`. The correction preserves the exact HF12 converted sentinel and applies inline `!important` restoration for size, opacity and pointer interaction.

Corrected controller SHA-256: `980cfb25ead9c78464a0c36ad9aeee441de359c492c38f48a4d483ab547d4711`


## Star Reflection width and empty-observance closure

Browser diagnostics confirmed that the native Star
Reflection selector had six governed options and active
pointer events but retained a computed width of 1 px.
AG75D-R1 now restores the containing shell, enforces a
minimum usable select width, removes historical
`aria-hidden` and `tabindex=-1`, and keeps the selector
within the existing responsive shell.

When no source-reviewed public observance is approved for
the selected date, the complete Begins/Ends/Ritual detail
list is hidden rather than displaying empty placeholders.

Corrected controller SHA-256: `980cfb25ead9c78464a0c36ad9aeee441de359c492c38f48a4d483ab547d4711`
