# HF13 — Login Header Visibility, Smooth Favicon, and Top Band Neutralisation Patch

Status: Targeted visual refinement  
Phase: HF-Public UI Fix  
Depends on: HF12, HF11, HF10  
Mutation impact: Static HTML + favicon assets only  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
API impact: None  
Deployment impact: None  

## Purpose

HF13 addresses the remaining visual issues after HF12:

1. the Sign in / Join page header/menu is too faint and does not provide a clear return path;
2. the favicon now exists, but the tab icon should be smoother and closer to the earlier Drishvara visual mark;
3. the top colour band on homepage still appears visually uneven.

HF13 does not modify dropdown logic because HF12 has materially resolved the dropdown freeze.

## Correction Scope

HF13 will:

- make the login page header/menu clearly visible;
- preserve the static non-auth Sign in / Join boundary;
- replace favicon assets with smoother high-resolution generated versions;
- neutralise the HF11 top pseudo-band by applying a cleaner uniform top background;
- preserve HF12 safe select system;
- preserve HF07/HF08/HF09/HF10/HF11 work;
- keep backend/Auth/Supabase/API disabled.

## Explicit Exclusions

HF13 does not:

- change dropdown/select logic;
- create API routes;
- create backend code;
- connect Supabase;
- activate Auth;
- activate real login/signup;
- collect user data;
- activate payment;
- activate admin;
- activate public dynamic output;
- deploy frontend;
- deploy backend;
- delete backup files;
- move archive files.

## Acceptance Criteria

HF13 is complete when:

1. HF13 document exists.
2. HF13 registry exists.
3. HF13 applier exists.
4. HF13 preview generator exists.
5. HF13 validator exists.
6. HF13 apply result exists.
7. HF13 preview exists.
8. login.html contains HF13 login header visibility marker.
9. checked pages contain HF13 top band neutralisation marker.
10. favicon.ico, favicon.svg, apple-touch-icon.png, and assets/drishvara-favicon.svg exist.
11. checked pages preserve HF12 safe select markers.
12. login.html remains static and non-auth.
13. backend/API/Supabase/Auth activation remains no-go.
