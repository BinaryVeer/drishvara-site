# AG74N — Panchang Festival and Full-Year Varanasi Calendar Engine

AG74N converts the AG74M sunrise-anchored daily engine into a complete internal Varanasi Vikram Samvat annual-calendar model.

## Reference annual calendar

The deterministic reference is Vikram Samvat 2083. Its governed civil-date interval runs from 19 March 2026 inclusive to 7 April 2027 exclusive and contains 384 dates because the year includes Adhika Jyeshtha followed by Nija Jyeshtha.

## Purnimanta month mapping

The underlying new-moon interval supplies the solar-ingress month identity. Shukla Paksha uses the current interval identity; Krishna Paksha uses the next interval identity. Zero ingress produces Adhika, one ingress produces a regular month, and two ingresses produce a regular month plus an explicit following Kshaya canonical-slot exception.

The four-page book always retains twelve canonical reporting slots. Physical month instances remain variable. The Chaitra slot explicitly carries the opening boundary segment and the closing Krishna segment because the Chaitradi Samvat boundary and Purnimanta month boundary are not the same event.

## 2026 skipped-Pratipada boundary

For the reference year, Chaitra Shukla Pratipada begins in Varanasi on 19 March 2026 after sunrise and ends before the next sunrise. It is therefore absent at both consecutive sunrises. AG74N records this as a skipped-at-sunrise boundary exception and selects the local civil date containing the Pratipada start event for internal annual generation.

This exception rule is not promoted as a final public authority claim. It remains explicitly traceable and requires external comparison in AG74P.

## Festival rule admission

The inherited AG70M bank contains seven internal candidate rules. Every record remains pending traditional source review. AG74N therefore creates astronomical condition candidates and conflict records only.

It does not approve final observance dates, primary public Begins/Ends windows, Parana windows, Pradosha windows, moonrise-dependent windows or night ritual windows.

The old AG70N sunset-minus/plus-90-minute Pradosha formula is preserved as historical preliminary evidence and is not reused.

The current annual festival completeness status is `blocked_pending_rule_review`. The system does not claim exhaustive coverage of Hindu observances.

## AG74O handoff

AG74O must complete public calculation wiring and also correct the known Panchang surface overflow, right-side clipping, control-width and responsive-layout defects. Cambria is used for editorial headings, Arial for body/labels/buttons/inputs, and Georgia remains limited to the principal Drishvara wordmark.

AG74O must not expose unreviewed festival candidates. Where no final approved observance exists, the public surface must retain a governed unavailable state.

## Safety boundary

AG74N does not modify the public UI or CSS, deploy a backend, activate Supabase/Auth, call an external ephemeris API, persist user input or expose a method selector.
