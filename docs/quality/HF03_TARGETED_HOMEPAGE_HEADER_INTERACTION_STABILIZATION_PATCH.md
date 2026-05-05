# HF03 — Targeted Homepage Header and Interaction Stabilization Patch

Status: Limited homepage static frontend correction  
Phase: HF-Homepage Fix  
Depends on: HF02, LV02, HQ00, HF01  
Runtime impact: Static frontend only  
Backend impact: None  
Public API impact: None  
Supabase impact: None  
Auth impact: None  
Deployment impact: None  
Mutation impact: Limited index.html correction only  

## 1. Purpose

HF03 applies the targeted homepage stabilization correction planned in HF02.

HF03 addresses the live issues recorded in LV02:

- homepage header/navigation layout disturbed;
- top navigation split/stacked awkwardly;
- timezone dropdown displaced;
- homepage sticking or interaction-freeze behavior;
- need to preserve language toggle stability;
- need to preserve HF01 corrections.

HF03 does not activate backend, API, Supabase, Auth, real login/signup, account collection, payment, public dynamic output, subscriber output, ML, embeddings, or deployment.

## 2. Allowed Mutation

HF03 may modify only:

- index.html

HF03 may add controlled CSS and JavaScript markers to index.html.

HF03 must not modify:

- article pages;
- contact page;
- submissions page;
- dashboard page;
- about page;
- insights page;
- login page;
- backend files;
- API route files;
- Supabase files;
- Auth configuration;
- deployment configuration;
- archive files;
- backup files.

## 3. Header Stabilization Target

The homepage header should regain a stable visual structure:

- timezone selector should sit deliberately in the header/control area;
- navigation should appear as a clean horizontal or responsive grouped menu;
- Submissions and Dashboard should remain present;
- Sign in / Join should remain present as a static placeholder;
- header controls should remain clickable;
- hero/orbit decorative layers should not block header interaction.

## 4. Interaction Stabilization Target

HF03 may add homepage-level controls that:

- raise header/nav/select/language controls above decorative layers;
- disable pointer interaction on decorative hero/orbit layers where safe;
- keep select controls clickable;
- stop account placeholder clicks from triggering page/global handlers;
- avoid broad language handler rewrites;
- avoid reintroducing the earlier Hindi/English toggle bug.

## 5. Language Toggle Protection

HF03 must preserve:

- English click keeps English;
- repeated English click keeps English;
- Hindi click keeps Hindi;
- repeated Hindi click keeps Hindi;
- normal homepage clicks do not change language;
- Hindi-to-English must not show transliteration fallback.

HF03 must not edit the actual language translation dictionary unless separately approved.

## 6. Sign in / Join Boundary

Sign in / Join remains a static placeholder only.

HF03 must not:

- create login;
- create signup;
- collect user data;
- create sessions;
- connect Auth;
- connect Supabase.

## 7. Post-Fix Verification

After HF03, regenerate and validate:

- QA00;
- QA01;
- LR00;
- LF00;
- LF01;
- LV00;
- LV01;
- HF00;
- HF01;
- HQ00;
- LV02;
- HF02;
- HF03.

Then perform manual live recheck.

## 8. Explicit Exclusions

HF03 does not:

- modify article pages;
- modify generated article content;
- modify reference links;
- modify image credits;
- invent links;
- invent image attributions;
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

HF03 is complete when:

1. HF03 document exists.
2. HF03 registry exists.
3. HF03 applier exists.
4. HF03 preview generator exists.
5. HF03 validator exists.
6. HF03 apply result exists.
7. HF03 preview exists.
8. index.html contains HF03 header stabilizer marker.
9. index.html contains HF03 interaction stabilizer marker.
10. required navigation labels remain present.
11. timezone/select control support remains present.
12. dropdown guard remains present.
13. Sign in / Join remains static placeholder only.
14. backend/API/Supabase/Auth activation remains no-go.
15. validate:hf03 passes.
16. validate:homepage passes.
17. validate:project passes.

## 10. HF03 Status

HF03 applies targeted homepage header and interaction stabilization.

HF03 does not activate runtime/backend/API/Supabase/Auth/deployment.
