# SUP02 Precomputed Availability Contract Correction

## Diagnosed failure

The first guarded public-cutover activation completed at the database and
function layers, but the production browser did not render the automatic
Varanasi result. The approved precomputed `runtime_result` payload was complete
and source-reviewed, yet it did not include the public discriminator
`available: true`. The server controller correctly refused to render a result
that did not satisfy that explicit contract.

## Correction

The Edge Function now normalises only complete legacy precomputed Panchang
results:

- an existing `available: true` or `available: false` value is preserved;
- a complete legacy result with no `available` field is copied and receives
  `available: true`;
- an incomplete legacy payload is not presented as an approved precomputed
  result and falls through to the governed server calculation.

No approved Panchang payload is rewritten in the database. The public browser
controller is not weakened. The source release, runtime release, privacy
contract, location rules and festival windows remain unchanged.

## Controlled redeployment boundary

The public cutover flag must remain false while the corrected function is
committed, pushed, redeployed without JWT verification and tested. Activation
is a later controlled action after the inactive corrected runtime and browser
contract are independently verified.

## Evidence chain

- Browser-failure diagnostic SHA-256:
  `d92da45b8482cbf2416934cb0c79c4a4a4da767ac177841fce7c5fca650cf52d`
- Guarded rollback evidence SHA-256:
  `0bd5d3be699d9d0b91ab856b7fb902f8524563ec5b94490ddc25b32779e8d2b2`
- Baseline commit:
  `9ffb09b6b0cf2fb7f6445453b9de7455891afa29`
