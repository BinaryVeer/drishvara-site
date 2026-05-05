# LV03 — Post-HF03 Manual Live Recheck

Status: Manual live recheck checklist / pending live observation  
Phase: LV-Live Verification  
Depends on: HQ01, HF03, HF02, LV02, HQ00  
Runtime impact: None  
Backend impact: None  
Public API impact: None  
Supabase impact: None  
Auth impact: None  
Deployment impact: None  
Mutation impact: None  

## 1. Purpose

LV03 defines the manual live recheck to be performed after HF03 and HQ01.

HQ01 confirms static QA is clean after HF03. LV03 checks whether the live homepage actually behaves correctly in the browser.

LV03 does not edit homepage files, CSS, JavaScript, article pages, contact pages, submissions pages, assets, SEO metadata, sitemap, language runtime, backup files, archive files, deployment settings, backend, Supabase, Auth, API routes, public dynamic output, subscriber output, ML, embeddings, or content files.

LV03 is a manual live recheck stage only.

## 2. Current Position

HF03 applied a targeted homepage header and interaction stabilization patch.

HQ01 confirmed:

- HF03 style marker is present;
- HF03 script marker is present;
- required navigation labels are present;
- dropdown guard is preserved;
- QA missing assets are zero;
- QA missing links are zero;
- backend/Auth/Supabase/API activation remains no-go.

LV03 must now verify the live browser behavior.

## 3. Manual Live Recheck Scope

Check the live homepage for:

1. header/menu alignment;
2. timezone dropdown placement;
3. homepage sticking/freezing behavior;
4. language toggle stability;
5. mobile header layout;
6. browser console errors;
7. Sign in / Join placeholder behavior;
8. navigation link behavior;
9. page-load behavior after hard refresh.

## 4. Homepage Header Check

Pass condition:

- top navigation is visually aligned;
- links are not awkwardly split or floating;
- menu does not overlap hero/logo/orbit;
- header remains usable after scroll, click, and language change.

Fail condition:

- navigation is still broken, stacked, hidden, overlapping, or displaced.

## 5. Timezone Dropdown Check

Pass condition:

- timezone dropdown is visible;
- dropdown is placed logically in the header/control area;
- dropdown can be opened and selected;
- page does not freeze after interacting with it.

Fail condition:

- dropdown is displaced, unclickable, freezes the page, or overlaps other controls.

## 6. Homepage Sticking / Freezing Check

Pass condition:

- normal clicks do not freeze the homepage;
- dropdown clicks do not freeze the homepage;
- language toggle clicks do not freeze the homepage;
- page remains responsive without switching apps/tabs.

Fail condition:

- homepage still becomes stuck until app/tab focus changes.

## 7. Language Toggle Stability Check

Pass condition:

- clicking English keeps English;
- clicking English repeatedly keeps English;
- clicking Hindi switches to Hindi;
- clicking Hindi repeatedly keeps Hindi;
- clicking normal homepage areas does not change language;
- switching from Hindi back to English shows proper English, not transliteration fallback.

Fail condition:

- any normal homepage click changes language;
- repeated Hindi/English click toggles incorrectly;
- returning to English shows broken transliteration.

## 8. Mobile Header Check

Pass condition:

- header fits mobile width;
- no horizontal scrolling;
- navigation remains usable;
- timezone/dropdown controls do not overlap hero/logo/orbit;
- language toggle remains usable.

Fail condition:

- header overflows, overlaps, hides controls, or causes horizontal scrolling.

## 9. Console Error Check

Pass condition:

- no red JavaScript errors affecting homepage, dropdown, language toggle, or navigation.

Warnings are acceptable only if the page remains functionally stable.

## 10. Result Reporting Format

After checking the live site, report:

Live homepage opens: Pass/Fail  
Header/menu alignment: Pass/Fail + issue if any  
Timezone dropdown: Pass/Fail + issue if any  
Homepage sticking/freezing: Pass/Fail + issue if any  
Language toggle: Pass/Fail + issue if any  
Mobile header: Pass/Fail + issue if any  
Console errors: None / mention error  
Overall: Pass / Warning / Fail  

## 11. Recommended Next Stage

If LV03 passes, next stage:

LS00 — Live Stabilization Closure Record

If LV03 finds remaining issues, next stage:

HF04 — Follow-up Homepage Visual/Interaction Correction Plan

## 12. Explicit Exclusions

LV03 does not:

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

## 13. LV03 Acceptance Criteria

LV03 is complete when:

1. LV03 document exists.
2. LV03 registry exists.
3. LV03 generator exists.
4. LV03 validator exists.
5. LV03 checklist preview exists.
6. HQ01 evidence is read.
7. Header/menu live check is declared.
8. Timezone dropdown live check is declared.
9. Sticking/freezing live check is declared.
10. Language toggle live check is declared.
11. Mobile header live check is declared.
12. Console error live check is declared.
13. No mutation, deployment, backend, API, Supabase, Auth, payment, ML, public output, or subscriber output is enabled.
14. validate:lv03 passes.
15. validate:live passes.
16. validate:project passes.

## 14. LV03 Status

LV03 establishes the post-HF03 manual live recheck checklist.

LV03 does not activate runtime/backend/API/Supabase/Auth/deployment and does not mutate public pages.
