# HF01 — Targeted Static Frontend Correction Patch

Status: Limited static frontend correction  
Phase: HF-Homepage Fix  
Depends on: HF00, LV01, LV00, LF01, QA01, QA00  
Runtime impact: None  
Backend impact: None  
Public API impact: None  
Supabase impact: None  
Auth impact: None  
Deployment impact: None  
Mutation impact: Limited static frontend correction only  

## 1. Purpose

HF01 applies a targeted static frontend correction for the issues recorded in LV01 and planned in HF00.

HF01 may correct:

- common navigation across public pages;
- Contact page missing Submissions;
- article pages using older navigation;
- safe static Sign in / Join placeholder;
- dropdown/select interaction freezing;
- article reference block;
- image credit block.

HF01 does not activate backend, Supabase, Auth, API, payment, admin, public dynamic output, subscriber output, ML, embeddings, deployment, or account collection.

## 2. Correction Scope

HF01 is allowed to modify only public static frontend files required for the recorded issues.

Allowed static page families:

- top-level public pages;
- article reader page;
- published static article pages.

HF01 does not modify archive files, backup files, node_modules, generated draft source files, backend files, API route files, Supabase files, or deployment settings.

## 3. Navigation Correction Rule

All public pages should receive one common navigation structure:

English:

- Home
- About
- Insights
- Submissions
- Dashboard
- Contact
- Sign in / Join

The Sign in / Join item must remain a static placeholder and must not activate Auth or collect user data.

## 4. Dropdown Interaction Correction Rule

HF01 may add a small frontend guard for native select controls.

The guard may:

- set select controls above decorative overlays;
- ensure pointer-events remain enabled;
- stop select click events from being swallowed by global page click handlers;
- avoid preventDefault on select controls.

The guard must not weaken language toggle stability.

## 5. Reference-Link Display Rule

Every article page should show a controlled editorial reference block.

Because verified links must not be invented or selected randomly, HF01 may show:

References are under editorial verification.

Actual verified links should be added only after passing the reference-link integrity logic.

## 6. Image Credit Display Rule

Every article page should show an image-credit block.

Because image credits must not be invented, HF01 may show:

Image credit: under review.

Actual image credit/source should be added only after verification or when already available in trusted article data.

## 7. Verified Reference-Link Integrity

HF01 preserves the rule that final reference links must be:

- reachable;
- responsive;
- non-broken;
- not 404/403/500;
- not error pages;
- not parked/spam/irrelevant;
- not endless redirects;
- relevant to the article;
- from legitimate/credible sources where possible;
- supportive of the article's factual basis.

## 8. Explicit Exclusions

HF01 does not:

- activate real login;
- activate signup;
- collect user data;
- connect Supabase;
- activate Auth;
- create API routes;
- deploy frontend;
- deploy backend;
- delete backup files;
- move archive files;
- clean node_modules;
- rewrite article content;
- invent source links;
- invent image credits;
- train models;
- generate embeddings.

## 9. Acceptance Criteria

HF01 is complete when:

1. HF01 document exists.
2. HF01 registry exists.
3. HF01 applier exists.
4. HF01 preview generator exists.
5. HF01 validator exists.
6. HF01 apply result exists.
7. HF01 preview exists.
8. Public navigation is consistent.
9. Contact page includes Submissions.
10. Article pages include Submissions and Dashboard navigation.
11. Safe Sign in / Join placeholder is present.
12. Dropdown/select interaction guard is present.
13. Article reference block is present.
14. Image credit block is present.
15. No backend, API, Supabase, Auth, payment, admin, ML, deployment, public dynamic output, or subscriber output is enabled.
16. validate:hf01 passes.
17. validate:homepage passes.
18. validate:project passes.

## 10. HF01 Status

HF01 applies targeted static frontend correction.

HF01 does not activate runtime/backend/API/Supabase/Auth/deployment.
