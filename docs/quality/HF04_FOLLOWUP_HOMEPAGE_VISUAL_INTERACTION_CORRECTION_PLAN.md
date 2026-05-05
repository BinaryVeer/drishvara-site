# HF04 — Follow-up Homepage Visual/Interaction Correction Plan

Status: Follow-up correction planning only  
Phase: HF-Homepage Fix Planning  
Depends on: LV03_RESULT, HQ01, HF03, HF02, LV02  
Runtime impact: None  
Backend impact: None  
Public API impact: None  
Supabase impact: None  
Auth impact: None  
Deployment impact: None  
Mutation impact: None  

## 1. Purpose

HF04 defines the follow-up correction plan after LV03 failed live verification.

Static checks passed under HQ01, but actual live behavior remains unacceptable. HF04 therefore moves the next correction away from simple marker-based static fixes and toward controlled reconstruction of the homepage header and dropdown interaction model.

HF04 does not edit index.html, CSS, JavaScript, article pages, contact pages, submissions pages, assets, SEO metadata, sitemap, language runtime, backup files, archive files, deployment settings, backend, Supabase, Auth, API routes, public dynamic output, subscriber output, ML, embeddings, or content files.

HF04 is planning-only.

## 2. LV03 Failure Basis

LV03 recorded:

- Live homepage opens: Pass.
- Header/menu alignment: Fail.
- Timezone dropdown: Fail.
- Homepage sticking/freezing: Fail.
- Language toggle: Fail.
- Overall: Fail.

Specific live issues:

1. Homepage header/menu remains visually disturbed.
2. Timezone dropdown is visible but cannot select a different timezone.
3. Dropdowns on pages can freeze or stick the page.
4. Language toggle is not visible/found.
5. Static QA passed, but live behavior failed.

## 3. Correction Objective

The next actual correction must solve the real browser behavior, not only add static markers.

The correction objective is to:

- rebuild homepage header layout cleanly;
- restore visible EN/Hindi language toggle;
- place timezone selector in a stable and intentional header/control zone;
- remove or neutralize unsafe dropdown event blockers;
- ensure native select dropdowns remain selectable;
- fix dropdown freeze across homepage and related public pages;
- avoid broad event handlers that trap focus or freeze the page;
- preserve article reference and image-credit blocks;
- preserve Sign in / Join as a static placeholder only;
- keep backend/Auth/Supabase/API disabled.

## 4. Header Reconstruction Requirement

The homepage header should be rebuilt into a stable, simple structure.

Target layout:

- one header container;
- one navigation row;
- one controls row or clearly separated controls group;
- visible timezone selector;
- visible EN/Hindi toggle;
- Sign in / Join static placeholder;
- no floating orphan links;
- no broken stacked navigation on desktop;
- responsive mobile behavior.

The header should not rely on scattered absolute-positioned controls.

## 5. Dropdown Interaction Requirement

The dropdown freezing issue must be treated as a shared interaction defect.

The next actual correction should inspect and correct:

- select event listeners;
- global click listeners;
- pointerdown/mousedown handlers;
- event.stopPropagation usage;
- preventDefault usage;
- overlays above select controls;
- CSS pointer-events;
- z-index layers;
- focus/blur behavior;
- body/html scroll-lock or interaction-lock classes.

The next patch should remove unsafe broad dropdown guards if they are causing freezes.

## 6. Timezone Selector Requirement

The timezone selector must:

- be visible;
- be placed deliberately;
- open normally;
- allow selecting another timezone;
- not freeze the page;
- not be blocked by hero/orbit layers;
- remain usable after language changes.

## 7. Language Toggle Requirement

The language toggle must be restored as a visible EN/Hindi control.

The correction must preserve prior language stability rules:

- clicking English keeps English;
- repeated English click keeps English;
- clicking Hindi keeps Hindi;
- repeated Hindi click keeps Hindi;
- normal homepage clicks do not change language;
- switching from Hindi back to English must not show transliteration fallback.

## 8. Hero and Decorative Layer Boundary

Hero/orbit visuals must not intercept header or dropdown interactions.

The next patch should ensure:

- decorative hero/orbit layers are below header controls;
- decorative layers use pointer-events: none where safe;
- header/nav/select/language controls are above decorative layers;
- no decorative element covers dropdowns.

## 9. Safe Patch Boundary for Next Stage

The next actual patch may modify only minimum required frontend files.

Potential allowed files:

- index.html;
- shared CSS only if header/dropdown layout depends on it;
- shared JS only if dropdown freeze is caused by shared event handling;
- language toggle JS only if visibility/handler restoration requires it.

The next patch must not modify:

- backend files;
- API files;
- Supabase files;
- Auth files;
- payment files;
- deployment files;
- archive files;
- backup files;
- article content;
- verified reference logic;
- image credit logic.

## 10. Proposed Next Patch Strategy

Recommended next patch:

HF05 — Targeted Header and Dropdown Behavior Correction Patch

HF05 should do three things only:

1. Replace homepage header/control layout with a clean deterministic structure.
2. Remove or narrow unsafe dropdown/global event blockers.
3. Restore visible EN/Hindi toggle without changing language dictionary logic.

HF05 must not activate Auth, Supabase, backend, API, or deployment.

## 11. Post-Fix Verification Requirement

After HF05, run:

- generate:qa00
- generate:qa01
- generate:hf03
- generate:hq01
- generate:lv03-result
- generate:hf04
- generate:hf05
- validate:hf05
- validate:homepage
- validate:project

Then perform live manual recheck again.

## 12. Explicit Exclusions

HF04 does not:

- edit index.html;
- edit CSS;
- edit JavaScript;
- edit language runtime;
- edit article pages;
- edit contact page;
- edit submissions page;
- edit images;
- edit SEO metadata;
- edit sitemap;
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

## 13. HF04 Acceptance Criteria

HF04 is complete when:

1. HF04 document exists.
2. HF04 registry exists.
3. HF04 preview generator exists.
4. HF04 validator exists.
5. HF04 correction plan preview exists.
6. LV03 result evidence is read.
7. Header reconstruction plan is declared.
8. Dropdown freeze correction plan is declared.
9. Timezone selector correction plan is declared.
10. Language toggle restoration plan is declared.
11. Hero/decorative layer boundary is declared.
12. HF05 is recorded as next actual targeted correction patch.
13. No mutation, deployment, backend, API, Supabase, Auth, payment, ML, public output, or subscriber output is enabled.
14. validate:hf04 passes.
15. validate:homepage passes.
16. validate:project passes.

## 14. HF04 Status

HF04 establishes the follow-up visual and interaction correction plan after failed live verification.

HF04 does not mutate public pages and does not activate runtime/backend/API/Supabase/Auth/deployment.
