# HF11 — Root Favicon Fallback and Top Paint Band Refinement Patch

Status: Targeted static frontend refinement  
Phase: HF-Public UI Fix  
Depends on: HF10, HF09, HF08  
Mutation impact: Static HTML + root favicon SVG only  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
API impact: None  
Deployment impact: None  

## Purpose

HF11 addresses two remaining live observations:

1. the top settled visual band still appears stronger than desired;
2. the browser tab continues to show the default globe/favicon instead of the Drishvara mark.

HF11 does not reset the page or rewrite the header. It applies a narrow refinement.

## Correction Scope

HF11 will:

- add root-level `/favicon.svg`;
- preserve `/assets/drishvara-favicon.svg`;
- inject absolute favicon links across public HTML pages;
- add a root favicon fallback link;
- add a top-paint refinement style to reduce the visible top band;
- preserve HF07/HF08/HF09/HF10 header, dropdown and login work;
- keep backend/Auth/Supabase/API disabled.

## Explicit Exclusions

HF11 does not:

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

HF11 is complete when:

1. HF11 document exists.
2. HF11 registry exists.
3. HF11 applier exists.
4. HF11 preview generator exists.
5. HF11 validator exists.
6. HF11 apply result exists.
7. HF11 preview exists.
8. `/favicon.svg` exists.
9. checked public pages contain HF11 favicon links.
10. checked public pages contain HF11 top-paint refinement marker.
11. HF09 favicon remains preserved.
12. HF07 header/nav remains preserved.
13. login.html remains static.
14. backend/API/Supabase/Auth activation remains no-go.
