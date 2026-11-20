# What Stars Say continuation — 20 November 2026

## Verified starting point

Repository main: `38af3dd416505d6c036d8f4159637586e52a748c`.
WSS01–WSS08 candidate work is already merged; the older chat excerpt saying
WSS03 was next is superseded by repository evidence. No open pull requests
were present at the start of this continuation. Epic #17 remains open.

The public What Stars Say HTML returned HTTP 200 and matched the main-branch
file byte for byte. This does not establish that the full Kundali candidate is
publicly activated. GitHub's Vercel status for the starting commit reports a
build-rate-limit failure. The Vercel connector could not inspect deployment
metadata because its existing connection lacks access to the project team.

## Precision corrections in this increment

- D9/D10 chart readiness now requires stable assignments for all nine grahas,
  as well as Lagna. Previously a stable Lagna could qualify a chart containing
  a withheld planetary assignment.
- The bilingual presenter independently checks those assignments and suppresses
  affected charts and dependent life-domain observations. The quality badge
  follows the actual displayed chart state.
- An audit must cover the report's declared clock interval, have a consistent
  exclusive end instant and contain each of the nine distinct grahas. A shorter
  audit cannot qualify a less precise birth report.
- Personal colour selection from the current Daśā is withheld while exact
  Daśā date boundaries remain unqualified. This does not alter the separate
  governed homepage Colour of the Day.
- CI now runs the audited-view/browser suite when precision audit code changes.
- Private-preview boundary notices wrap within narrow mobile panels; the CI
  browser suite caught a 26-pixel overflow at 320 pixels before this correction.

Tests include actual calculated lunar D9/D10 boundary cases with stable
divisional ascendants, stale chart-level flags, duplicate grahas, shortened
audit intervals and English/Hindi presentation. These tests establish
consistent withholding; they do not establish chart-grade astronomical accuracy.

## Remaining release work

1. Pin a reproducible timezone/timebase source rather than depending on an
   unidentified browser Intl tzdb; verify historical offsets and DST folds/gaps.
2. Calibrate the Moon/ayanāṁśa and independently qualify Varga/Daśā dates and
   explicit year conventions. The recorded 160-case study observed lunar
   differences up to 72.056 arcseconds; exact event timing remains withheld.
3. Complete source-specific, multi-factor interpretation rules and reviewed
   English/Hindi language for any proposed career, relationship or dated reading.
4. Complete independent CSP/XSS and consent/retention review, then isolated
   two-user staging RLS tests before activating optional encrypted chart saving.
5. Complete browser, privacy and Panchang-coexistence release QA before
   enabling full public Kundali output. A successful candidate test is not
   publication authorization.

This increment makes no public-page, database, authentication, location-catalogue,
Panchang, Word-bank or public-prediction activation changes. The private preview
remains a research candidate. The complete product is not yet released.
