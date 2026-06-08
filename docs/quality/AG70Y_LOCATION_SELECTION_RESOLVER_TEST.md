# AG70Y — Location Selection Resolver Test

AG70Y tests the location resolver path internally.

## Tested

- Named location resolver.
- Coordinate-first resolver.
- Panchang input contract mapping.
- Star Reflection input contract mapping.
- Safety blocking where coordinates/source verification are pending.

## Important boundary

This is a resolver test only. It does not approve candidate coordinates, activate public dropdowns, run Panchang computation, run Star Reflection computation, or activate UI/backend/Supabase.

## Next

AG70Z — Location Intelligence Foundation Closure.
