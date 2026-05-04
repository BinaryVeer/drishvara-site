# R01 — Naming Consistency & Consolidated Methodology Index

Status: Review/Governance only  
Phase: R-Review  
Depends on: M00 through M10, R00  
Runtime impact: None  
Subscriber impact: None  
Public API impact: None  

## 1. Purpose

R01 performs the first controlled refactoring pass after R00.

R01 corrects the M10 filename typo and creates a consolidated methodology index.

R01 does not activate runtime, server endpoints, Auth, Supabase, payment, external API fetch, public Panchang output, public festival output, subscriber guidance, dashboard cards, premium guidance, internal preview runtime, or automatic database mutation.

## 2. Naming Consistency Doctrine

Naming consistency changes must be controlled.

R01 corrects the M10 filename from METHODLOGY to METHODOLOGY and updates dependent references.

No silent rename is allowed.

## 3. M10 Filename Correction

R01 corrects:

- old path: docs/methodology/M10_METHODLOGY_ACTIVATION_READINESS_REPORT.md
- new path: docs/methodology/M10_METHODOLOGY_ACTIVATION_READINESS_REPORT.md

The M10 validator and R00 registry are updated to reference the corrected path.

## 4. Consolidated Methodology Index Doctrine

R01 creates a consolidated methodology index containing:

- module ID;
- module title;
- document path;
- registry path;
- validator path;
- npm script;
- status;
- runtime posture.

The index is internal governance documentation only.

## 5. Explicit Exclusions

R01 does not implement runtime, server endpoints, Auth, Supabase, payment, subscription entitlement, external API fetch, live calculation, public output, subscriber output, premium guidance, internal preview runtime, dashboard cards, geocoding, background jobs, or automatic activation.

## 6. Safety Doctrine

R01 must preserve all safety gates created in M00 through M10 and R00.

R01 must not weaken:

- source-first discipline;
- Sanskrit integrity;
- no-invented-mantra doctrine;
- consent-first methodology;
- privacy redaction;
- non-deterministic guidance framing;
- conflict preservation;
- human-review requirements;
- activation readiness gates.

## 7. R01 Acceptance Criteria

R01 is complete when:

1. M10 typo is corrected through controlled rename.
2. M10 validator references the corrected filename.
3. R00 registry references the corrected filename.
4. Consolidated methodology index document exists.
5. Consolidated methodology index registry exists.
6. R01 document exists.
7. R01 registry exists.
8. R01 validator exists.
9. validate:m10 passes.
10. validate:r00 passes.
11. validate:r01 passes.
12. validate:methodology passes.
13. No runtime or public-output flag is enabled.

## 8. R01 Status

R01 establishes naming consistency and consolidated methodology indexing.

R01 does not implement runtime or public output.
