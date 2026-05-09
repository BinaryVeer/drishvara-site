# HF12 — Select Freeze Elimination and Favicon ICO Fallback Patch

Status: Targeted interaction stability patch  
Phase: HF-Public UI Fix  
Depends on: HF11, HF10, HF09, HF08  
Mutation impact: Static HTML + root favicon assets only  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
API impact: None  
Deployment impact: None  

## Purpose

HF12 addresses the unresolved live issue where native dropdowns/select controls remain unstable and can freeze the browser interaction until window focus is changed.

HF12 also adds a root favicon.ico fallback because Chrome may continue to show the default globe even when favicon.svg is reachable.

## Correction Scope

HF12 will:

1. replace user-facing native select interaction with safe custom button-based dropdowns;
2. preserve the original select value in the background for existing page logic;
3. hide duplicate/legacy header select controls;
4. preserve only the current HF07 timezone control in the unified header;
5. add root favicon.ico;
6. add apple-touch-icon.png;
7. refresh favicon links with /favicon.ico, /favicon.svg, and /assets/drishvara-favicon.svg;
8. preserve Sign in / Join static page;
9. preserve backend/Auth/Supabase/API no-go boundary.

## Explicit Exclusions

HF12 does not:

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
- deploy frontend;
- deploy backend;
- delete backup files;
- move archive files.

## Acceptance Criteria

HF12 is complete when:

1. HF12 document exists.
2. HF12 registry exists.
3. HF12 applier exists.
4. HF12 preview generator exists.
5. HF12 validator exists.
6. HF12 apply result exists.
7. HF12 preview exists.
8. favicon.ico exists.
9. favicon.svg exists.
10. apple-touch-icon.png exists.
11. checked pages contain HF12 favicon links.
12. checked pages contain HF12 select replacement style.
13. checked pages contain HF12 select replacement script.
14. checked pages preserve HF07 header/nav.
15. login.html remains static.
16. backend/API/Supabase/Auth activation remains no-go.
