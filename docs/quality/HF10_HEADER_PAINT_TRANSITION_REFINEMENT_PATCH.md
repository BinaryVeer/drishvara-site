# HF10 — Header Paint / Transition Refinement Patch

Status: Targeted visual refinement  
Phase: HF-Public UI Fix  
Depends on: HF09, HF08, HF07  
Mutation impact: Static HTML only  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
API impact: None  
Deployment impact: None  

## 1. Purpose

HF10 corrects the remaining top color-transition / early-paint flash visible during navigation.

After HF09, the header, navigation, Sign in / Join page and favicon are in place. The remaining issue is visual: during page transition or first paint, a color band/transition is visible near the top before the page settles.

HF10 adds an early critical paint layer so the browser uses Drishvara's dark background and header treatment immediately, before later page styles settle.

## 2. Correction Scope

HF10 will:

1. add an early critical paint style near the top of each public HTML document head;
2. set html/body first-paint background to the Drishvara dark palette;
3. disable initial transition/animation on the unified header during first paint;
4. keep old duplicate header/nav layers hidden from first paint;
5. add a stable browser theme-color meta tag;
6. preserve the HF09 favicon;
7. preserve Sign in / Join static page;
8. preserve timezone selector and EN / हिंदी toggle;
9. preserve dropdown responsiveness;
10. keep backend/Auth/Supabase/API disabled.

## 3. Explicit Exclusions

HF10 does not:

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

## 4. Acceptance Criteria

HF10 is complete when:

1. HF10 document exists.
2. HF10 registry exists.
3. HF10 applier exists.
4. HF10 preview generator exists.
5. HF10 validator exists.
6. HF10 apply result exists.
7. HF10 preview exists.
8. checked public pages contain HF10 critical paint style marker.
9. checked public pages contain HF10 theme-color marker.
10. checked public pages contain HF10 paint-ready script marker.
11. HF09 favicon remains present.
12. HF07 header/nav remains present on non-login pages.
13. login.html remains static and non-auth.
14. timezone selector remains present on non-login pages.
15. EN / हिंदी toggle remains present on non-login pages.
16. backend/API/Supabase/Auth activation remains no-go.
17. validate:hf10 passes.
18. validate:homepage passes.
19. validate:project passes.
