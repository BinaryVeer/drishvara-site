# R00 — Methodology Review & Refactoring Pass

Status: Review/Governance only  
Phase: R-Review  
Depends on: M00 through M10  
Runtime impact: None  
Subscriber impact: None  
Public API impact: None  

## 1. Purpose

R00 defines the first review and refactoring control pass after completion of Drishvara’s M-Methodology phase.

R00 does not add runtime features, API routes, Auth, Supabase, payment, external API fetch, public Panchang output, subscriber guidance, dashboard cards, internal preview execution, or automatic database mutation.

R00 reviews the methodology stack for consistency, coverage, naming alignment, validation script presence, registry presence, and safe-disabled posture.

## 2. Review Scope

R00 reviews the following modules:

- M00 Source Doctrine and Sanskrit Integrity Framework
- M01 Panchang Calculation Methodology Specification
- M02 Tithi / Vrat / Fasting-Day Rule Engine
- M03 Festival Rule Registry
- M04 Location / Timezone / Sunrise Basis
- M04A Periodic Validation, Calibration and Learning Register
- M05 Name / DOB / Location Methodology
- M06 Lucky Number / Colour / Mantra Selection Methodology
- M06A Symbolic Scoring Formula and Mapping Doctrine
- M07 Subscriber Personalization Scoring Logic
- M08 Server-side API Contract
- M09 Internal Calculation Preview
- M10 Methodology Activation Readiness Report

## 3. Explicit Exclusions

R00 does not implement runtime, server endpoints, Auth, Supabase, payment, external API fetch, live Panchang calculation, public festival output, subscriber output, premium guidance, internal preview runtime, dashboard card rendering, geocoding, background jobs, or automatic activation.

R00 does not rename existing files automatically.

R00 does not delete backup files.

R00 does not modify public website behavior.

## 4. Review Objectives

R00 checks:

- document presence;
- registry presence;
- validator presence;
- package script alignment;
- dependency chain consistency;
- runtime-disabled posture;
- public-output-disabled posture;
- known naming issues;
- duplicated risk themes;
- future refactoring candidates.

## 5. Methodology Artifact Presence Doctrine

Each methodology module should have:

- one human-readable document;
- one machine-readable registry;
- one validator script;
- one npm validation script.

If any artifact is missing, R00 must fail validation.

## 6. Validation Script Coverage Doctrine

Every methodology module from M00 to M10 must have an npm validation command.

R00 must confirm the following scripts exist:

- validate:m00
- validate:m01
- validate:m02
- validate:m03
- validate:m04
- validate:m04a
- validate:m05
- validate:m06
- validate:m06a
- validate:m07
- validate:m08
- validate:m09
- validate:m10
- validate:r00

The aggregate validate:methodology script should include all M-methodology validations and R00.

## 7. Runtime Disabled Doctrine

R00 must confirm that methodology registries do not accidentally enable runtime features.

The following categories must remain disabled wherever present:

- runtime;
- Auth;
- Supabase;
- payment;
- external API fetch;
- public Panchang output;
- public festival output;
- subscriber output;
- public guidance;
- dashboard card runtime;
- internal preview runtime;
- live calculation;
- automatic database mutation;
- automatic activation.

## 8. Known Naming Issue Doctrine

R00 records known naming issues without silently changing them.

Known issue:

- M10 document path was recorded in R00 as using METHODLOGY instead of METHODOLOGY in the filename; R01 later corrects this through a controlled rename.

This is corrected through the controlled R01 patch, with validators and registry references updated together.

## 9. Backup File Doctrine

The working tree contains several backup files and archived assets.

R00 does not delete these files.

A later cleanup pass may decide whether to move, ignore, or remove them through a separate controlled cleanup module.

## 10. Refactoring Candidate Doctrine

R00 may identify refactoring candidates but must not perform broad refactors.

Candidate areas include:

- naming consistency;
- validator naming style;
- shared disabled-flag validation helper;
- shared dependency list helper;
- consolidated methodology index;
- consolidated status report;
- backup file cleanup;
- package script organization.

## 11. Consolidated Index Doctrine

R00 recommends creating a consolidated methodology index after review.

The index should list:

- module ID;
- title;
- document path;
- registry path;
- validator path;
- npm script;
- status;
- runtime posture;
- next action.

R00 does not create a public-facing index page.

## 12. Safety Doctrine

R00 must preserve the safety posture established across M00–M10.

No review or refactoring step may weaken:

- Sanskrit integrity;
- no-invented-mantra doctrine;
- source-first discipline;
- consent-first profile methodology;
- privacy redaction;
- non-deterministic guidance framing;
- conflict preservation;
- human-review requirements;
- activation readiness gates.

## 13. R00 Acceptance Criteria

R00 is complete when:

1. R00 document exists.
2. R00 registry exists.
3. R00 validator exists.
4. All M00–M10 documents are present.
5. All M00–M10 registries are present.
6. All M00–M10 validators are present.
7. All validation scripts are present in package.json.
8. Disabled runtime posture is confirmed from registries.
9. Known naming issue is recorded.
10. R00 itself is methodology/review-only and safe to commit.

## 14. R00 Status

R00 establishes the methodology review and refactoring pass.

R00 does not implement runtime features or public output.
