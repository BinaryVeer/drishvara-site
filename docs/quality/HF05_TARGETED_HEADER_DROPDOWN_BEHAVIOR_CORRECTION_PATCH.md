# HF05 — Targeted Header and Dropdown Behavior Correction Patch

Status: Limited static frontend correction  
Phase: HF-Homepage Fix  
Depends on: HF04, LV03_RESULT, HQ01, HF03, HF02  
Runtime impact: Static frontend only  
Backend impact: None  
Public API impact: None  
Supabase impact: None  
Auth impact: None  
Deployment impact: None  
Mutation impact: Limited static frontend correction only  

## 1. Purpose

HF05 applies the targeted correction planned in HF04.

HF05 addresses the failed LV03 live behavior:

- homepage header/menu alignment failure;
- timezone dropdown visible but not selectable;
- dropdown freezing/sticking across pages;
- missing visible language toggle;
- need to preserve Sign in / Join as placeholder only.

HF05 does not activate backend, API, Supabase, Auth, real login/signup, account collection, payment, public dynamic output, subscriber output, ML, embeddings, or deployment.

## 2. Allowed Mutation

HF05 may modify:

- index.html;
- public static HTML pages only for dropdown-guard neutralization;
- article HTML pages only for dropdown-guard neutralization.

HF05 must not modify:

- backend files;
- API route files;
- Supabase files;
- Auth configuration;
- payment files;
- deployment files;
- archive files;
- backup files;
- unrelated content logic.

## 3. Correction Strategy

HF05 applies a stronger correction than HF03.

The correction strategy is:

1. remove unsafe dropdown event-guard scripts;
2. keep a passive dropdown marker for validator continuity;
3. inject a clean homepage header;
4. restore a visible EN / हिंदी toggle;
5. provide a native timezone select that can be selected normally;
6. avoid stopPropagation/preventDefault on select controls;
7. keep decorative hero/orbit layers from intercepting header controls;
8. preserve Sign in / Join as a static placeholder.

## 4. Dropdown Freeze Correction

HF05 removes script-based dropdown guards that attach click, mousedown, pointerdown, or touchstart handlers to native select controls.

HF05 replaces them with passive CSS only.

Native select controls must be allowed to behave normally.

## 5. Header Reconstruction

HF05 injects a deterministic homepage header with:

- brand zone;
- primary navigation;
- timezone selector;
- EN / हिंदी toggle;
- Sign in / Join placeholder.

The existing required links remain:

- Home
- About
- Insights
- Submissions
- Dashboard
- Contact
- Sign in / Join

## 6. Language Toggle Boundary

HF05 restores a visible EN / हिंदी toggle.

HF05 does not rewrite the full language dictionary.

HF05 must preserve:

- English click keeps English;
- repeated English click keeps English;
- Hindi click keeps Hindi;
- repeated Hindi click keeps Hindi;
- normal homepage clicks do not change language.

## 7. Auth Boundary

Sign in / Join remains a static placeholder.

HF05 must not:

- create login;
- create signup;
- collect user data;
- create session logic;
- connect Auth;
- connect Supabase.

## 8. Explicit Exclusions

HF05 does not:

- create API routes;
- create backend code;
- connect Supabase;
- activate Auth;
- activate real login/signup;
- collect user data;
- activate payment;
- activate admin;
- activate public dynamic output;
- activate subscriber output;
- generate embeddings;
- train models;
- fetch external APIs;
- deploy frontend;
- deploy backend;
- delete backup files;
- move archive files.

## 9. Acceptance Criteria

HF05 is complete when:

1. HF05 document exists.
2. HF05 registry exists.
3. HF05 applier exists.
4. HF05 preview generator exists.
5. HF05 validator exists.
6. HF05 apply result exists.
7. HF05 preview exists.
8. unsafe dropdown guard scripts are removed.
9. passive dropdown safety marker is present.
10. homepage HF05 header is present.
11. visible EN / हिंदी toggle is present.
12. timezone select is present.
13. required nav labels remain present.
14. Sign in / Join remains a static placeholder.
15. backend/API/Supabase/Auth activation remains no-go.
16. validate:hf05 passes.
17. validate:homepage passes.
18. validate:project passes.

## 10. HF05 Status

HF05 applies targeted static frontend correction for header and dropdown behavior.

HF05 does not activate runtime/backend/API/Supabase/Auth/deployment.
