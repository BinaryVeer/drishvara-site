# AG74O — Panchang Public UI Wiring

AG74O activates governed daily Panchang calculation in the static browser surface without a backend, Supabase or external ephemeris API.

The runtime uses the exact-pinned Astronomy Engine 2.1.19 browser bundle copied from the installed npm package and a browser port of the locked AG74L and AG74M formulas. Date controls, curated places, approved aliases and coordinate-first inputs are wired without persistent storage.

The Varanasi Vikram Samvat 2083 reference book is rendered as four physical pages containing twelve canonical lunar-month slots. Adhika and Nija instances remain nested under Jyeshtha, year-edge Chaitra segments remain explicit, and a matching selected Varanasi date opens its containing page.

Festival condition candidates are not presented as approved observances. A public observance requires explicit final-date and public-output approval; otherwise the surface displays a governed unavailable state and does not fabricate Begins, Ends or ritual windows.

AG74O corrects Panchang right overflow, card clipping, control containment and mobile book navigation. Editorial headings use Cambria; body labels, controls and result text use Arial; Georgia is retained only for the principal Drishvara wordmark.

Browser QA covers desktop, tablet and mobile-width containment, deterministic Varanasi calculation, curated and coordinate-first inputs, date synchronization, transitions, annual-book population, Adhika/Nija representation, festival guard, focus management, live regions and absence of persistent input storage.

The public named-place control is the governed dropdown (including its HF12 safe-select projection). The older pilot quick-pick location-button grid is retained only as hidden compatibility markup and is not visible or interactive. The Select Location / Enter Coordinates mode switch remains because coordinate-first calculation is a separate supported input path, not a duplicate named-place selector.

The public card contains exactly one visible daily Panchang result surface. The older AG71E preview panel is retained only as hidden, inert compatibility markup, and the former quick-pick location button grid is removed from the visible layout. The governed dropdown is the sole named-place selector; the place-versus-coordinate control remains only as an input-mode switch.
