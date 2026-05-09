# HF08 — Visible Navigation and Literal Newline Cleanup Patch

Status: Targeted public UI correction  
Phase: HF-Homepage/Public UI Fix  
Depends on: HF07, HF06, HF05  
Mutation impact: Static HTML only  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
API impact: None  
Deployment impact: None  

## 1. Purpose

HF08 corrects the live UI issue observed after HF07.

HF07 successfully added a unified responsive header system across public pages, but the live homepage shows:

- visible navigation links are missing from the header;
- literal text `\n \n` is rendered on the page;
- the header shows brand, timezone selector and EN/Hindi controls, but not the full page navigation;
- users cannot clearly navigate to other pages from the homepage.

HF08 is a surgical cleanup patch. It does not reset the site and does not replace the content structure.

## 2. Correction Scope

HF08 will:

1. force the HF07 navigation row to be visible;
2. keep Home, About, Insights, Submissions, Dashboard, Contact, and Sign in / Join visible;
3. remove literal `\n` text nodes outside script/style blocks;
4. preserve timezone selector;
5. preserve EN / हिंदी toggle;
6. preserve responsive dropdown behavior;
7. preserve Sign in / Join as static placeholder only;
8. keep backend/Auth/Supabase/API disabled.

## 3. Explicit Exclusions

HF08 does not:

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

HF08 is complete when:

1. HF08 document exists.
2. HF08 registry exists.
3. HF08 applier exists.
4. HF08 preview generator exists.
5. HF08 validator exists.
6. HF08 apply result exists.
7. HF08 preview exists.
8. public HTML files contain HF08 visible-nav style marker.
9. index.html contains HF08 literal newline cleanup marker.
10. HF07 header and nav markers remain present.
11. required nav labels remain present.
12. literal `\n` text is removed outside script/style blocks.
13. timezone selector remains present.
14. EN / हिंदी toggle remains present.
15. backend/API/Supabase/Auth activation remains no-go.
16. validate:hf08 passes.
17. validate:homepage passes.
18. validate:project passes.
