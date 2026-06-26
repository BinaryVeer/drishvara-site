# SUP02 — Panchang Public Server Runtime Cutover Readiness

SUP02 consumes the formally closed SUP01 runtime foundation and prepares the final
public switch from the AG74P browser-local daily calculation to the active
`calculate-panchang` Supabase Edge Function.

## Readiness scope

- Prepare anonymous public invocation of `calculate-panchang` without committing a
  browser-safe key or any service credential.
- Read the single active `sup01_panchang_runtime_v1` row on every request and return
  its actual `public_ui_cutover_active` value.
- Prepare a server-only browser controller that performs no local astronomy.
- Preserve the Varanasi four-page annual book as a governed static reference.
- Preserve five named places, aliases and worldwide coordinates.
- Render festival Begins and Ends from `primary_public_window`.
- Keep astronomical, observance and ritual windows separate.
- Preserve the zero-input-persistence contract.
- Prepare a database constraint, forward-compatible public read policy and guarded
  disable-cutover SQL.

## Deliberately excluded from local apply

- No change to the active `index.html` controller wiring.
- No removal of the browser Astronomy Engine from the live page yet.
- No live SQL migration.
- No Edge Function deployment.
- No change to `public_ui_cutover_active`.
- No public release verification.
- No commit or push.

The existing AG74P public page therefore remains unchanged throughout readiness
preparation.

## Controlled execution sequence

1. Review and commit the SUP02 readiness code.
2. Apply the non-activating SUP02 migration.
3. Deploy the public invocation configuration and updated Edge Function.
4. Verify anonymous requests while the cutover flag remains false.
5. Activate the cutover flag for the single active zero-persistence runtime.
6. Verify the function reports the flag as true.
7. Replace the live page controller wiring with the prepared SUP02 controller.
8. Verify the public page uses server results and no browser-local calculation.
9. Retain the guarded operation that returns the flag to false if rollback is
   approved.
