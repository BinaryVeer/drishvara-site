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
