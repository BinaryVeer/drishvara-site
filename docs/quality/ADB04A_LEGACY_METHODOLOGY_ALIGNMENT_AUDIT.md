# ADB04A — Legacy Methodology, Knowledge and Implementation Alignment Audit

## Result

ADB04A aligns the existing M-series, D-series and ID-series records with the current AD/ADB database-build path before ADB05 SQL draft generation.

## Decision

The legacy records are broadly aligned and should be preserved.

## Correction

ADB02 remains valid as the base schema dictionary, but it is incomplete for the full calculation-engine design. ADB04A therefore records an additive schema-extension delta. ADB05 must consume both ADB02 and ADB04A.

## ADB05 revised requirement

ADB05 must draft schema for:

- base AD/ADB tables
- calculation profiles
- ephemeris profiles
- ayanamsha profiles
- astronomical input snapshots
- Panchanga element intervals
- calculation runs and trace logs
- location/timezone/sunrise event windows
- tithi/vrat/festival/observance rule registries
- daily guidance, word rotation and mantra review registries
- validation learning and calculation variance records

## Still blocked

- No SQL execution
- No database write
- No Supabase connection
- No seed insertion
- No runtime calculation execution
- No service-role key exposure
- No deployment
