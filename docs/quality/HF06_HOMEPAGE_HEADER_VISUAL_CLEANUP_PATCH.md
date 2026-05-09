# HF06 — Homepage Header Visual Cleanup Patch

Status: Limited homepage visual correction  
Phase: HF-Homepage Fix  
Depends on: HF05, HF04, LV03_RESULT  
Mutation impact: index.html only  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
API impact: None  
Deployment impact: None  

## Purpose

HF06 corrects the visual damage observed after HF05 on the live homepage.

HF05 restored useful functional pieces, including the timezone selector and EN/Hindi toggle, but the live homepage now shows:

- a white/grey header block inconsistent with the dark Drishvara theme;
- low-contrast text inside the header;
- duplicated old navigation below the new header;
- awkward timezone label/control placement;
- visually disturbed header hierarchy.

HF06 does not reset HF05. It cleans the homepage visual layer while preserving the useful HF05 dropdown and language work.

## Allowed Mutation

HF06 may modify only:

- index.html

HF06 must not modify article pages, contact page, submissions page, dashboard page, backend, API, Supabase, Auth, deployment files, archive files, or backup files.

## Correction Scope

HF06 will:

1. restyle HF05 header to match the dark Drishvara theme;
2. improve text contrast;
3. hide duplicate legacy homepage navigation;
4. keep HF05 timezone dropdown visible and selectable;
5. keep EN / हिंदी toggle visible;
6. keep Sign in / Join as static placeholder;
7. preserve backend/Supabase/Auth/API no-go boundary.

## Explicit Exclusions

HF06 does not:

- create API routes;
- create backend code;
- connect Supabase;
- activate Auth;
- activate real login/signup;
- collect user data;
- activate payment;
- activate admin;
- activate deployment;
- edit article reference links;
- edit image credits;
- delete backup files;
- move archive files.

## Acceptance Criteria

HF06 is complete when:

1. HF06 document exists.
2. HF06 registry exists.
3. HF06 applier exists.
4. HF06 preview generator exists.
5. HF06 validator exists.
6. HF06 apply result exists.
7. HF06 preview exists.
8. index.html contains HF06 visual cleanup style marker.
9. index.html contains HF06 duplicate-nav guard marker.
10. HF05 header, timezone, and language markers remain present.
11. required nav labels remain present.
12. backend/API/Supabase/Auth activation remains no-go.
13. validate:hf06 passes.
14. validate:homepage passes.
15. validate:project passes.
