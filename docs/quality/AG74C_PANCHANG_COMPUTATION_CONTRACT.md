# AG74C — Panchang Computation Contract

AG74C locks the computation contract for Panchang & Festival View expansion.

## Contract Scope

- Static client-side calculation engine boundary.
- Approved location records only.
- YYYY-MM-DD local date normalization.
- IANA timezone resolution from approved records.
- Required Panchang output fields.
- Validation sample contract for AG74D.

## Required Computation Areas

- Julian day conversion
- Solar longitude
- Lunar longitude
- Tithi
- Paksha
- Nakshatra
- Yoga
- Karana
- Sunrise / sunset basis

## Disabled

- Backend runtime calculation
- Supabase/Auth
- Personal data storage
- Live ephemeris API dependency
- Final religious authority claim

## Next Step

AG74D should prepare the approved expanded location records and static Panchang engine shell.
