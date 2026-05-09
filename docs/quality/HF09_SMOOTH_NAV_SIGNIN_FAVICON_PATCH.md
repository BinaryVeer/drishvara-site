# HF09 — Smooth Navigation, Static Sign-in/Join Page, and Favicon Restoration Patch

Status: Targeted static frontend correction  
Phase: HF-Public UI Fix  
Depends on: HF08, HF07, HF06  
Mutation impact: Static HTML + favicon SVG only  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
API impact: None  
Deployment impact: None  

## 1. Purpose

HF09 corrects the remaining live UI issues observed after HF08.

Live observations:

- page transition is mostly working, but a small unwanted element appears briefly at the top-left during navigation;
- Sign in / Join exists in the header but a proper page has not yet been created;
- browser tab favicon has reverted to the default black/white globe instead of the Drishvara identity mark.

HF09 is a targeted static frontend patch. It does not activate backend, Auth, Supabase, API, user accounts, session handling, payment, admin, or deployment.

## 2. Correction Scope

HF09 will:

1. add early critical CSS to hide legacy transition/flicker elements before first paint;
2. statically remove accidental literal backslash-n text outside script/style blocks;
3. create a proper static login.html page for Sign in / Join;
4. convert Sign in / Join header links to login.html using correct relative paths;
5. add a Drishvara favicon SVG asset;
6. inject favicon links across public HTML pages;
7. preserve timezone selector and EN / हिंदी toggle;
8. preserve dropdown responsiveness;
9. keep Sign in / Join page static with no real Auth.

## 3. Sign in / Join Boundary

The Sign in / Join page is static only.

It may display:

- sign-in coming soon message;
- join/waitlist coming soon message;
- platform access explanation;
- disabled input placeholders;
- contact guidance.

It must not:

- submit forms;
- collect user data;
- create accounts;
- connect Auth;
- connect Supabase;
- call APIs;
- store user credentials.

## 4. Explicit Exclusions

HF09 does not:

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
- move archive files;
- edit verified reference-link logic;
- edit image-credit logic.

## 5. Acceptance Criteria

HF09 is complete when:

1. HF09 document exists.
2. HF09 registry exists.
3. HF09 applier exists.
4. HF09 preview generator exists.
5. HF09 validator exists.
6. HF09 apply result exists.
7. HF09 preview exists.
8. assets/drishvara-favicon.svg exists.
9. favicon links are present in checked public pages.
10. login.html exists as a static Sign in / Join page.
11. Sign in / Join links point to login.html or correct relative path.
12. early flicker guard marker is present.
13. literal backslash-n outside script/style is removed in checked pages.
14. timezone selector remains present.
15. EN / हिंदी toggle remains present.
16. backend/API/Supabase/Auth activation remains no-go.
17. validate:hf09 passes.
18. validate:homepage passes.
19. validate:project passes.
