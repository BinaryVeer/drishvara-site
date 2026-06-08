# AG70T — Location Intelligence Registry and Panchang Basis Normalisation

AG70T creates the shared governed location layer for Panchang, Star Reflection, birth-location handling and future location-dependent modules.

## Created

- Location Intelligence Registry.
- Coordinate-first input contract.
- Display label policy.
- Hierarchy policy.
- Timezone basis policy.
- Usage map.
- India State/UT capitals seed.
- India district/block registry schema with seed examples.
- India major cities seed.
- World national capitals seed examples.
- World major cities seed examples.
- Official import contracts.
- Itanagar normalisation record.

## Important rules

Named location is optional when valid latitude, longitude, timezone and date/time basis are supplied.

Latitude and longitude alone are not enough for date/time-sensitive calculations; timezone must also be resolved or confirmed.

## Display label policy

Public/UI-facing preview should not expose internal location_id. It should use clean labels such as:

- Itanagar
- Itanagar-Arunachal Pradesh-India
- Anjaw-Arunachal Pradesh-India
- Bhawanathpur-Garhwa-Jharkhand-India
- Custom Coordinates (27.0844, 93.6053)

## Boundary

- No Panchang recomputation.
- No public Panchang output.
- No public Star Reflection output.
- No Word output.
- No UI/backend/Supabase activation.
