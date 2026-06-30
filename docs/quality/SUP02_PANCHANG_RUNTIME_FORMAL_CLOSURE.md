# SUP02 Panchang Runtime Formal Closure

## Closure decision

SUP02 is formally closed as
`sup02_public_runtime_activation_verified_and_formally_closed`.

The governed repository baseline for the activation was
`26d90247c0d57fc36c8afec5187474c5ae572c9e`. The activation-evidence archive is
`SUP02_Final_Public_Runtime_Activation_Evidence_20260628_142024.zip` with SHA-256
`6c2bf09fb7c84cbc4cd1b07b1eb5bc140c81d54a9c0b1d0e379b9e7d6f253cfc`.

## Verified runtime transition

- Runtime release: `sup01_panchang_runtime_v1`
- Canonical release: `ag74p_final_2026_06_24`
- Runtime status before and after activation: `active`
- Public UI cutover before activation: `false`
- Public UI cutover after activation: `true`
- Active runtime rows before and after: `1`
- Public input persistence before and after: disabled
- Anonymous runtime readback after activation: cutover active and
  input persistence disabled

## Public verification

- Function verification: `12/12`
- Authentication headers sent by the browser verification: `false`
- CORS status: `200`
- CORS allowed origin: `*`
- Varanasi and Banaras precomputed responses remained available
- Five named places, worldwide coordinates and the four-page
  Varanasi annual book remained governed

## Activation boundary

The activation changed only the governed runtime flag. It did not:

- modify the repository;
- redeploy the Edge Function;
- apply a database migration; or
- execute automatic rollback.

The earlier SUP02 readiness, correction and final-cutover records
remain immutable historical preparation records. Their pre-activation
“pending” wording does not override the subsequently verified live
activation evidence or this formal closure.

## Ongoing boundary

The Supabase `calculate-panchang` runtime is the primary public
calculation path. Public Panchang inputs remain non-persistent.
Repository JSON is retained only as audited snapshots, fixtures and
recovery exports.

SUP01 and SUP02 are the complete two-stage Supabase functional
sequence. No additional Panchang patch stage is authorised.

## Handoff

The next controlled stage is **AG75A**, beginning the
**AG75A-AG75E Star Reflection expansion**. SUP01 or SUP02 must not be
reactivated as a substitute for AG75 scope.

Prepared for **vikash vaibhav**.
