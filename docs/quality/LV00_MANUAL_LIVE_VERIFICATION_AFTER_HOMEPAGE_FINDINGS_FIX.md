# LV00 — Manual Live Verification after Homepage Findings Fix

Status: Manual live verification gate / no activation  
Phase: LV-Live Verification  
Depends on: LF01, LF00, LR00, QA01, QA00  
Runtime impact: None  
Backend impact: None  
Public API impact: None  
Supabase impact: None  
Auth impact: None  
Deployment impact: None  
Mutation impact: None  

## 1. Purpose

LV00 defines the manual live verification gate after LF01.

LV00 does not deploy the frontend, deploy the backend, edit homepage files, edit assets, edit SEO, edit language runtime, create API routes, activate backend, connect Supabase, activate Auth, activate payment, activate admin, activate public dynamic output, activate subscriber output, run ML, generate embeddings, or mutate content.

LV00 is a live manual verification checklist and preview only.

## 2. Current Position

QA00 and QA01 now report clean static asset/link findings after scanner refinement.

LF00 now reports zero asset findings and zero link findings.

LF01 applied zero homepage fixes and modified no files.

Therefore, static scanner confidence is clean, but live browser verification is still required.

## 3. Live Verification Doctrine

Manual live verification means checking the currently deployed live homepage in a browser.

It does not mean activation.

It does not mean deployment approval.

It does not mean backend readiness.

It does not mean subscriber readiness.

It does not mean Supabase/Auth/API readiness.

## 4. Manual Verification Areas

LV00 manual verification covers:

- live homepage load;
- latest commit visibility;
- hero/logo/orbit visibility;
- English/Hindi language toggle behavior;
- no transliteration fallback;
- desktop rendering;
- mobile rendering;
- browser console;
- primary navigation;
- CTA behavior;
- asset loading;
- SEO/social preview sanity;
- no backend/API runtime expectation.

## 5. Language Verification

Manual language verification must check:

- English click keeps English;
- repeated English click keeps English;
- Hindi click keeps Hindi;
- repeated Hindi click keeps Hindi;
- clicking normal homepage areas does not change language;
- returning Hindi to English does not show transliteration fallback;
- hero meaning line remains controlled in both languages.

## 6. Visual Verification

Manual visual verification must check:

- logo position;
- orbit alignment;
- hero text readability;
- button visibility;
- no overlap;
- mobile hero fit;
- no duplicate/unwanted text;
- no obvious broken image.

## 7. Console Verification

Manual console verification must check:

- no critical JavaScript error;
- no missing critical CSS;
- no missing critical JS;
- no missing hero/logo image;
- no language-toggle runtime error.

Warnings may be recorded, but critical runtime errors must be resolved before clean live confidence.

## 8. Live Decision Doctrine

Allowed LV00 decisions:

- manual_live_verification_pending;
- clean_static_ready_for_manual_live_check;
- live_observation_passed_manual;
- live_observation_warning_manual;
- no_go_until_manual_issue_fixed.

LV00 must not decide runtime/backend/API/Supabase/Auth activation.

## 9. Evidence Boundary

LV00 uses existing local validation and preview evidence.

LV00 cannot automatically prove what is visible on Vercel/live browser.

Manual observation must be entered later in a separate result-record stage if needed.

## 10. Recommended Follow-up

After LV00:

- perform manual browser verification;
- if issues are found, create a targeted visual/language/link fix patch;
- if no issues are found, create LV01 manual verification result record;
- keep runtime/backend/Supabase/API activation as no-go.

## 11. Explicit Exclusions

LV00 does not:

- edit index.html;
- edit CSS;
- edit JavaScript;
- edit images;
- edit SEO metadata;
- edit sitemap;
- edit language runtime;
- delete backup files;
- move archive files;
- change gitignore;
- create API routes;
- create backend code;
- connect Supabase;
- activate Auth;
- activate payment;
- activate admin;
- activate public dynamic output;
- activate subscriber output;
- generate embeddings;
- train models;
- fetch external APIs;
- deploy frontend;
- deploy backend.

## 12. LV00 Acceptance Criteria

LV00 is complete when:

1. LV00 document exists.
2. LV00 registry exists.
3. LV00 preview generator exists.
4. LV00 validator exists.
5. LV00 manual live verification preview exists.
6. LF01 evidence is read.
7. QA/LR/LF evidence is summarized.
8. Manual live verification checklist is declared.
9. No mutation, deployment, backend, API, Supabase, Auth, payment, ML, public output, or subscriber output is enabled.
10. validate:lv00 passes.
11. validate:live passes.
12. validate:project passes.

## 13. LV00 Status

LV00 establishes Manual Live Verification after Homepage Findings Fix.

LV00 does not activate runtime/backend/API/Supabase/Auth/deployment.
