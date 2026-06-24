# AG74O-R3 Governed Calendar Activation

## Status

AG74O-R3 establishes the governed calendar activation architecture. Public output remains blocked because approved location, daily calendar and festival-observance counts are all zero.

## Request-commit behaviour

- Date, place, alias, coordinate and timezone edits mark the request as pending.
- Pending edits do not replace the last committed daily result.
- Previous Day, Today and Next Day update pending inputs and the independent annual reference book only.
- The public result resolver runs only after **Calculate Panchang** is pressed.

## Daily activation projection

Only an exact record carrying explicit daily-record and public-output approvals may enter the browser activation projection. The current projection is empty. The local astronomy engine remains retained behind location, calendar and computation approval gates.

## Festival activation projection

A festival record requires source review, final observance-date approval, public-output approval and a valid primary public window. Astronomical condition, observance, primary-public and ritual windows remain separate. Visible Begins and Ends use the primary public window. The current projection is empty.

## Annual reference book

The four-page Vikram Samvat 2083 book remains canonically Varanasi-based, contains twelve canonical lunar-month slots, nests Adhika/Nija instances, and remains available independently of daily public activation.

## Prohibited activation

No candidate-only location, unapproved calendar record, unapproved festival, automatic fallback, external runtime API, persistence or Supabase activation is introduced.
