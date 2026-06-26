# SUP02 — Panchang Public Runtime Final Cutover

The SUP02 server runtime completed its non-activating deployment and
post-deployment verification. The reviewed evidence SHA-256 is:

`164e5304dd806400ca181aa3b4465f8d6d7f69f7ef3256fc25dcbbc27339af2d`

The function accepted twelve governed unauthenticated cases twice, CORS passed,
anonymous and service-role readbacks passed, and the runtime remained active
with `public_ui_cutover_active = false`.

## Local final-cutover preparation

This local apply changes the homepage Panchang wiring so that:

- `assets/js/sup02-panchang-server-controller.js` is the only active Panchang
  calculation controller;
- the browser Astronomy Engine is no longer loaded by `index.html`;
- the historical AG74P controller remains in the repository but is not loaded;
- the four-page Varanasi annual book remains intact;
- Varanasi/Banaras remains the default;
- five approved named locations, aliases and worldwide coordinates remain;
- unknown places and invalid timezones remain governed errors;
- public Begins and Ends continue to map to `primary_public_window`;
- ritual windows remain separate;
- no request, coordinate, timezone or personal data is stored.

## Deliberately not performed

This local apply does not push the index switch, activate the runtime flag, write
to the database, redeploy the function, verify the production page, commit or
push.

## Controlled live sequence

1. Review the local-apply evidence.
2. Commit and push the server-only index switch while the runtime flag remains
   false.
3. Verify the production page loads the SUP02 controller and no browser-local
   calculation assets.
4. Activate the runtime flag for the single active zero-persistence runtime.
5. Verify the function and public page.
6. Record formal SUP02 closure.
