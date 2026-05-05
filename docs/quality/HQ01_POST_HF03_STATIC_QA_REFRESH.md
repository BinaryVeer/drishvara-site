# HQ01 — Post-HF03 Static QA Refresh

Status: Post-HF03 static QA refresh / no mutation  
Phase: HQ-Homepage Quality  
Depends on: HF03, HF02, LV02, HQ00, HF01  
Runtime impact: None  
Backend impact: None  
Public API impact: None  
Supabase impact: None  
Auth impact: None  
Deployment impact: None  
Mutation impact: None  

## 1. Purpose

HQ01 performs a static quality refresh after HF03.

HF03 added a targeted homepage header and interaction stabilization patch to index.html.

HQ01 verifies that the HF03 correction is statically present and that earlier HF01/HQ00 requirements remain preserved.

HQ01 does not edit index.html, CSS, JavaScript, article pages, contact pages, submissions pages, assets, SEO metadata, sitemap, language runtime, backend, Supabase, Auth, API routes, public dynamic output, subscriber output, ML, embeddings, archive files, backup files, or deployment settings.

HQ01 is a QA refresh and result-record stage only.

## 2. Current Position

HF01 corrected public static navigation and article trust placeholders.  
HQ00 verified those static corrections.  
LV02 recorded that homepage header layout and sticking issues remained.  
HF02 planned the homepage stabilization.  
HF03 applied a limited index.html stabilization patch.

HQ01 now verifies HF03 from the static repository state.

## 3. HQ01 QA Scope

HQ01 verifies:

1. HF03 style marker exists.
2. HF03 script marker exists.
3. index.html remains the only intended page-level mutation target for HF03.
4. required navigation labels remain present.
5. Submissions remains present.
6. Dashboard remains present.
7. Sign in / Join remains a static placeholder.
8. HF01 dropdown guard remains preserved.
9. select/timezone controls remain present for live recheck.
10. homepage stabilization class/script reference exists.
11. decorative pointer-safety logic exists.
12. backend/Supabase/Auth/API activation remains disabled.

## 4. Header QA Requirement

index.html should include the HF03 marker:

data-drishvara-hf03-header-stabilizer

This confirms the homepage header stabilizer CSS is present.

## 5. Interaction QA Requirement

index.html should include the HF03 marker:

data-drishvara-hf03-interaction-stabilizer

This confirms the homepage interaction stabilizer script is present.

## 6. Navigation Preservation Requirement

index.html should preserve these labels:

- Home
- About
- Insights
- Submissions
- Dashboard
- Contact
- Sign in / Join

The Sign in / Join item must remain a static placeholder only.

## 7. Dropdown and Timezone Boundary

HQ01 statically checks that select controls remain present and that the HF01 dropdown guard remains present.

Final usability must still be checked manually in the live browser.

## 8. Language Toggle Boundary

HQ01 does not prove live language behavior.

The next manual live check must verify:

- English click keeps English;
- repeated English click keeps English;
- Hindi click keeps Hindi;
- repeated Hindi click keeps Hindi;
- normal homepage clicks do not change language;
- Hindi-to-English does not show transliteration fallback.

## 9. Activation Boundary

HQ01 must not approve:

- backend activation;
- API activation;
- Supabase activation;
- Auth activation;
- real login/signup;
- user account collection;
- payment activation;
- admin activation;
- public dynamic output;
- subscriber output;
- ML ingestion;
- embeddings;
- deployment activation.

## 10. Recommended Next Stage

After HQ01, the recommended next stage is:

LV03 — Post-HF03 Manual Live Recheck

LV03 should manually verify:

- homepage header layout;
- timezone dropdown placement;
- navigation alignment;
- sticking/freezing behavior;
- language toggle stability;
- mobile header layout;
- browser console errors.

## 11. Explicit Exclusions

HQ01 does not:

- edit index.html;
- edit CSS;
- edit JavaScript;
- edit article pages;
- edit contact page;
- edit submissions page;
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
- deploy backend.

## 12. HQ01 Acceptance Criteria

HQ01 is complete when:

1. HQ01 document exists.
2. HQ01 registry exists.
3. HQ01 generator exists.
4. HQ01 validator exists.
5. HQ01 static QA preview exists.
6. HF03 evidence is read.
7. HF03 style marker is present.
8. HF03 script marker is present.
9. required homepage nav labels remain present.
10. dropdown guard remains preserved.
11. Sign in / Join remains static placeholder only.
12. backend/API/Supabase/Auth activation remains no-go.
13. LV03 is recorded as the next manual live recheck stage.
14. validate:hq01 passes.
15. validate:homepage passes.
16. validate:project passes.

## 13. HQ01 Status

HQ01 establishes post-HF03 static QA refresh.

HQ01 does not activate runtime/backend/API/Supabase/Auth/deployment and does not mutate public pages.
