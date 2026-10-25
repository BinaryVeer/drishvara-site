# Drishvara — Colour of the Day, governed card theme contract

This contract defines ONLY the future visual tint of the existing homepage "Colour of the Day" card. It does not authorize content selection, approval or publication.

## Source of truth and eligibility
The colour value must arrive from a trusted server-published daily colour record, not a CSS default, a dictionary guess or a browser-selected colour. Required checks BEFORE showing the colour name or tinting artwork:
- Record status: published; public_output_allowed and runtime_activation true.
- Canonical global civil date in Asia/Kolkata matches today's date; no location-dependent invented colour.
- Exact approved colour identity/name, validated 6-digit hex #RRGGBB, source/licence attribution, publication event and approval references.
- Verified copy/colour-version hash and current non-withdrawn, non-superseded assignment. Unapproved/expired values remain withheld.
- Selection/approval and content publication decisions remain in the existing governed backend; never derive approval from a presence of a hex value.

## Visual adapter
When AND ONLY WHEN the trusted renderer has successfully validated the published record, it may set on the existing fourth .f2-day-card:
- data-f2-approved-colour="true"
- --f2-public-colour: <validated #RRGGBB>
Then fill the published name/meaning using its own reviewed UI renderer.

CSS uses ONE neutral fabric illustration and a colour blend overlay; no static saffron asset or per-colour image downloads. Contrast remains navy-on-cream, independent of daily hue. Do not change the card's colour or copy while the current generated Vedic guidance source lacks an approved daily-publication contract.

On failure, expiry, withdrawal, date rollover or missing approval, remove the data attribute and custom property and restore "Under verification"/governed unavailable. Never imply that the displayed cloth tint is a colour recommendation without a valid published record.

This is a dormant future-compatible styling interface, not a replacement for the underlying Word, Panchang, Colour or Mantra engine.


## Implemented V6 presentation adapter
File: \`assets/js/f2-daily-colour-theme.js\` (5KB, no API key or new external service).

Public interface: \`window.DrishvaraDailyColourTheme.applyPublished(record)\`,
\`clear()\`, \`resolveHex(colourName, optionalHex)\`, and \`refresh()\`.

The adapter maps approved names (for example Saffron, Blue, Green, Kesari, Red,
White) to stable colour values when a validated hex was not provided. If a published
record supplies its own reviewed six-digit \`colour_hex\`, that exact hex takes precedence.
The stylesheet tints ONE existing neutral fabric asset; it does not load per-colour images.

Example future server-authored public snapshot (ILLUSTRATIVE SCHEMA, NOT APPROVED DATA):

\`\`\`json
{
  "contract_version": "drishvara.colour-publication.v1",
  "status": "published",
  "public_output_allowed": true,
  "runtime_activation": true,
  "publication_scope": "global_public_colour",
  "timezone": "Asia/Kolkata",
  "date_key": "YYYY-MM-DD",
  "withdrawn": false,
  "superseded": false,
  "colour_name": "Saffron",
  "colour_hex": "#E87924",
  "release_approval_ref": "ISSUED_BY_PUBLISHER",
  "publication_event_id": "REAL_EVENT_ID",
  "source_use_ref": "SOURCE_CLEARANCE_ID",
  "reviewed_content_hash": "REAL_VERIFIED_HASH"
}
\`\`\`

**Important:** These are interface fields, not permission to populate them artificially.
The browser cannot prove source authenticity from JSON fields alone; the existing/future
trusted Colour publisher must enforce approval, integrity and safe rights upstream.
The adapter only checks the published UI envelope, current IST date, state and
hex/name, then sets \`--f2-public-colour\` and \`data-f2-approved-colour\`
on the fourth card. It does NOT modify the Word of the Day renderer or
publish the colour copy.

The adapter can optionally fetch \`generated/colour-of-day-publication.json\` ONLY
after a deliberate \`<meta name="drishvara-approved-colour-feed"
content="generated/colour-of-day-publication.json">\` is added by the future Colour
cutover. **Do not add that meta before a genuinely approved server-produced feed
and coordinated approved copy renderer exist.** Until then the adapter is inert and
the card remains "Under verification".

Publisher runtime responsibilities: maintain a secure source-of-truth record, approve
the associated name and copy, update the UI copy through the governed Colour renderer,
invoke the adapter with that same approved record, and clear it on withdrawal,
exhaustion or date rollover. Tests should cover every mapped colour family,
approved hex override, unknown names, invalid hex, wrong IST date,
missing approval, withdrawn records and expiry.
