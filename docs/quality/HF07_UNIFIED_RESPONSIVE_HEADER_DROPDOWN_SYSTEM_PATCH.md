# HF07 — Unified Responsive Header and Dropdown System Patch

Status: Unified static frontend correction  
Phase: HF-Homepage/Public UI Fix  
Depends on: HF06, HF05, HF04, LV03_RESULT  
Mutation impact: Static HTML only  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
API impact: None  
Deployment impact: None  

## 1. Purpose

HF07 records and corrects the remaining visual and interaction issues after HF06.

The current UI problem is not a full reset issue. The required correction is a unified public UI layer:

- homepage header must visually align with other pages;
- every page should use the same primary header structure;
- older duplicate homepage navigation should not remain visible;
- all dropdown/select elements should remain responsive and selectable;
- homepage and public pages should not freeze on dropdown interaction;
- EN / हिंदी language control should remain visible;
- timezone selector should remain visible and usable;
- Sign in / Join must remain a static placeholder only.

## 2. Recorded UI Findings

HF07 records the following findings:

1. Homepage header is still not visually parallel with other pages.
2. Multiple header/navigation layers exist from earlier patches.
3. Dropdown/select behavior needs to be made responsive across all public pages.
4. Header/control spacing must be standardized across homepage, static pages, and article pages.
5. The correction should be completed in one consolidated patch rather than piecemeal UI fixes.

## 3. Correction Strategy

HF07 will:

1. inject a single common responsive header into all public HTML pages;
2. calculate correct relative links for root pages and nested article pages;
3. hide older HF01/HF05/HF06 legacy navigation/header layers without deleting their markers;
4. add a shared responsive dropdown/select CSS layer across all public pages;
5. add a passive JS layer for language, timezone, and static Sign in / Join placeholder;
6. avoid stopPropagation/preventDefault on native select controls;
7. preserve article reference blocks and image-credit blocks;
8. keep backend/Auth/Supabase/API disabled.

## 4. Header Standard

The common header must include:

- Drishvara brand;
- Home;
- About;
- Insights;
- Submissions;
- Dashboard;
- Contact;
- Sign in / Join;
- timezone selector;
- EN / हिंदी toggle.

The header must be responsive and visually aligned across pages.

## 5. Dropdown Standard

All select/dropdown elements must:

- remain clickable;
- remain selectable;
- fit within their container;
- not overflow on mobile;
- not freeze the page;
- not rely on blocking event handlers.

## 6. Explicit Exclusions

HF07 does not:

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

## 7. Acceptance Criteria

HF07 is complete when:

1. HF07 document exists.
2. HF07 registry exists.
3. HF07 applier exists.
4. HF07 preview generator exists.
5. HF07 validator exists.
6. HF07 apply result exists.
7. HF07 preview exists.
8. all checked public HTML files contain HF07 unified header marker.
9. all checked public HTML files contain HF07 responsive dropdown marker.
10. index.html contains the unified header.
11. nested article pages contain corrected relative navigation links.
12. legacy duplicate nav/header layers are hidden, not deleted.
13. required navigation labels remain present.
14. EN / हिंदी markers remain present.
15. timezone selector remains present.
16. backend/API/Supabase/Auth activation remains no-go.
17. validate:hf07 passes.
18. validate:homepage passes.
19. validate:project passes.
