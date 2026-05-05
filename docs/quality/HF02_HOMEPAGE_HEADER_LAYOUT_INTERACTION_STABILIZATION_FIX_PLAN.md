# HF02 — Homepage Header Layout and Interaction Stabilization Fix Plan

Status: Homepage stabilization planning only  
Phase: HF-Homepage Fix Planning  
Depends on: LV02, HQ00, HF01, HF00  
Runtime impact: None  
Backend impact: None  
Public API impact: None  
Supabase impact: None  
Auth impact: None  
Deployment impact: None  
Mutation impact: None  

## 1. Purpose

HF02 defines the correction plan for the homepage header layout and interaction issues recorded in LV02.

HF02 does not edit homepage files, CSS, JavaScript, article pages, contact pages, submissions pages, assets, SEO metadata, sitemap, language runtime, backup files, archive files, deployment settings, backend, Supabase, Auth, API routes, public dynamic output, subscriber output, ML, embeddings, or content files.

HF02 is a planning-only gate before the actual targeted homepage stabilization patch.

## 2. Current Position

HF01 corrected the static frontend structure across public pages.  
HQ00 confirmed static checks passed.  
LV02 confirmed that the live homepage still has visible issues.

The specific live issues recorded are:

- homepage sticking or interaction-freeze behavior;
- homepage header/navigation layout disturbance;
- timezone dropdown displaced from intended header flow;
- top navigation links split or stacked;
- issue mainly observed on homepage;
- clean live confidence remains false.

## 3. Correction Objective

The next actual correction should restore the homepage header into a stable, deliberate layout while preserving all HF01 improvements.

The correction should preserve:

- Submissions navigation;
- Dashboard navigation;
- static Sign in / Join placeholder;
- dropdown/select usability;
- language toggle stability;
- article reference placeholder;
- image credit placeholder;
- no backend/Auth/Supabase/API activation.

## 4. Header Layout Target

The homepage header should be redesigned as a controlled layout with clear zones:

1. left zone: logo / brand identity if applicable;
2. control zone: timezone selector;
3. center or primary zone: main navigation;
4. right zone: language toggle and Sign in / Join placeholder if retained there;
5. mobile zone: responsive stacked or menu-friendly layout.

The current split/stacked nav should be corrected without removing required links.

## 5. Navigation Alignment Requirement

Homepage navigation should appear cleanly and consistently.

Required links:

- Home
- About
- Insights
- Submissions
- Dashboard
- Contact
- Sign in / Join

The Sign in / Join item must remain a static placeholder.

It must not activate Auth, collect data, create sessions, connect Supabase, or imply working login.

## 6. Timezone Control Requirement

The timezone selector should sit in a deliberate header/control area.

It must not float awkwardly away from the menu.

The correction should check:

- flex/grid parent structure;
- absolute/fixed positioning;
- margin offsets;
- z-index;
- responsive behavior;
- interaction with language toggle and navigation.

## 7. Interaction Stabilization Requirement

Homepage sticking/freezing should be investigated through:

- global click handlers;
- select/dropdown event guards;
- language toggle event handlers;
- pointer-events;
- fixed overlays;
- z-index layers;
- animated hero/orbit layers;
- scroll-lock behavior;
- event propagation;
- focus/blur behavior.

The correction should avoid adding broad global handlers that may reintroduce language-toggle bugs.

## 8. Hero and Header Separation Requirement

Hero/orbit decorative layers must not interfere with header controls.

The correction should ensure:

- hero animation layers do not cover header;
- decorative orbit layers have pointer-events disabled where appropriate;
- controls remain clickable;
- header z-index is above decorative visuals;
- layout remains stable after language switch.

## 9. Language Toggle Protection

The correction must preserve the already corrected language behavior:

- clicking English keeps English;
- repeated English click keeps English;
- clicking Hindi keeps Hindi;
- repeated Hindi click keeps Hindi;
- clicking normal homepage areas does not change language;
- returning from Hindi to English must not show transliteration fallback.

## 10. Safe Patch Boundary for Next Stage

The next actual fix patch may modify only the minimum required static frontend files.

Potential allowed files for the next patch:

- index.html;
- homepage CSS if separate;
- homepage JS if separate;
- shared frontend JS only if the homepage interaction issue is located there.

The next patch must not modify:

- backend files;
- API route files;
- Supabase files;
- Auth configuration;
- payment files;
- deployment configuration;
- archive files;
- backup files;
- unrelated article content.

## 11. Post-Fix Validation Requirement

After the actual correction patch, regenerate and validate:

- QA00;
- QA01;
- LR00;
- LF00;
- LF01;
- LV00;
- LV01;
- HQ00;
- LV02;
- HF02;
- next correction patch validator.

Manual live recheck must be repeated after the fix.

## 12. Explicit Exclusions

HF02 does not:

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

## 13. HF02 Acceptance Criteria

HF02 is complete when:

1. HF02 document exists.
2. HF02 registry exists.
3. HF02 preview generator exists.
4. HF02 validator exists.
5. HF02 correction plan preview exists.
6. LV02 findings are read.
7. Homepage header layout correction plan is declared.
8. Timezone placement plan is declared.
9. Homepage sticking/interaction stabilization plan is declared.
10. Language-toggle protection requirement is declared.
11. HF03 is recorded as the next actual targeted correction patch.
12. No mutation, deployment, backend, API, Supabase, Auth, payment, ML, public output, or subscriber output is enabled.
13. validate:hf02 passes.
14. validate:homepage passes.
15. validate:project passes.

## 14. HF02 Status

HF02 establishes the homepage header layout and interaction stabilization fix plan.

HF02 does not activate runtime/backend/API/Supabase/Auth/deployment and does not mutate public pages.
