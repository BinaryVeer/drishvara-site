# AG74O-R1A — Provisional India Location Bank

AG74O-R1A imports the reviewed manual LGD export snapshot into a governed internal bank.

## Current snapshot

- 36 States and Union Territories
- 784 districts
- 0 sub-districts
- 2,631 development blocks
- 3,042 urban local bodies
- 6,493 internal searchable records
- 0 publicly selectable records
- 0 computation-approved records

## Governance

The source archives remain external evidence. The repository stores the normalized snapshot and source hashes. Identity is keyed by entity type plus LGD code. Name-only merging is prohibited.

The snapshot is suitable for internal schema and search-index development. It is not a complete live national hierarchy and is not a public Panchang location bank.

## Public-label boundary

District and urban-body names can legitimately coincide. Public candidate labels therefore remain provisional. When the present hierarchy cannot disambiguate two records, the internal search label appends the LGD code. Live API district mapping must replace that temporary internal disambiguation before public activation.

## Remaining gates

- live NAPIX revalidation;
- official sub-district import;
- remaining block and urban-local-body coverage;
- coordinate and provenance enrichment;
- public-label validation;
- computation approval.

No homepage UI, runtime backend, Supabase configuration or public calculation is changed by this stage.
