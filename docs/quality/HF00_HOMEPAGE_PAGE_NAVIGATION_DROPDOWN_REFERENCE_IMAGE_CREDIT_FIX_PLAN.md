# HF00 — Homepage/Page Navigation, Dropdown, Reference Link and Image Credit Fix Plan

Status: Frontend correction planning only  
Phase: HF-Homepage Fix Planning  
Depends on: LV01, LV00, LF01, QA01, QA00  
Runtime impact: None  
Backend impact: None  
Public API impact: None  
Supabase impact: None  
Auth impact: None  
Deployment impact: None  
Mutation impact: None  

## 1. Purpose

HF00 defines the correction plan for the live frontend issues recorded in LV01.

HF00 does not edit homepage files, contact page files, submission page files, article pages, CSS, JavaScript, images, SEO metadata, sitemap, language runtime, backup files, archive files, deployment settings, backend, Supabase, Auth, API routes, public dynamic output, subscriber output, ML, embeddings, or content files.

HF00 is a planning-only gate before the actual targeted frontend fix patch.

## 2. Current Position

LV01 recorded manual live verification findings.

The live page opens and static scanner findings are clean, but clean live confidence is not approved because the following issues remain:

- inconsistent navigation across pages;
- Contact page missing Submissions menu;
- dropdown interaction freeze;
- missing Signup/Login entry point;
- missing two verified reference links on featured/article pages;
- missing image credits or attribution blocks.

HF00 converts these findings into a controlled frontend correction plan.

## 3. Correction Scope

HF00 plans correction for:

1. common navigation across public pages;
2. dropdown interaction freeze;
3. safe Signup/Login placeholder;
4. article reference block;
5. verified reference-link integrity rule;
6. image credit / attribution block;
7. correction validation after HF01.

HF00 does not apply the correction.

## 4. Common Navigation Requirement

All public static pages should share the same navigation order.

English:

- Home
- About
- Insights
- Submissions
- Dashboard
- Contact

Hindi:

- घर
- परिचय
- इनसाइट्स
- सबमिशन
- डैशबोर्ड
- संपर्क

The correction should ensure Contact, Submissions, About, Insights, Dashboard, and homepage do not drift into separate hardcoded menu variants.

## 5. Dropdown Interaction Requirement

Dropdowns must remain usable.

The correction should investigate and address:

- select element focus;
- overlay or fixed layer blocking pointer events;
- z-index stacking above form controls;
- global click handlers;
- language toggle handlers;
- scroll-lock classes;
- blur/focus recovery;
- pointer-events CSS;
- body/html interaction locks;
- event propagation issues.

The dropdown fix must not weaken language toggle stability.

## 6. Signup/Login Placeholder Requirement

Signup/Login is required as a visible product pathway, but Auth remains no-go.

HF01 may add only a safe static placeholder such as:

- Sign in / Join
- Coming soon
- No account collection yet
- No Auth activation
- No Supabase activation

The correction must not create real login, signup, Auth, Supabase, payment, session, user storage, or account collection.

## 7. Verified Reference-Link Requirement

Every featured read/article should eventually show two verified reference links.

The reference links must not be random.

A verified reference link should be:

- reachable;
- responsive;
- non-broken;
- not 404/403/500;
- not an error page;
- not parked;
- not spam;
- not irrelevant;
- not endless redirect;
- related to the article;
- from a legitimate or credible source where possible;
- supportive of the article's factual basis.

If not yet verified, the page should display:

References are under editorial verification.

HF00 records the requirement. HF01 may add only safe placeholder/display structure unless verified links already exist in current static data.

## 8. Image Credit Requirement

Every article image should carry an image credit or attribution block.

Minimum display forms:

- Image credit: Source / Photographer / Platform
- Image credit: under review

The image-credit block should appear on article pages and, where suitable, on featured/article cards or as a page-level attribution.

HF01 should not invent photographer names or licenses.

## 9. Article Display Requirement

Article pages should include controlled editorial metadata:

- reference block;
- image credit block;
- source verification status;
- article readiness status where relevant.

The correction must not imply an article is fully verified if its references or image credits are still under review.

## 10. Correction Safety Boundary

HF01 may be allowed to modify only frontend/static files directly needed for the recorded issues.

Potential allowed targets may include:

- index.html;
- contact page file;
- submissions page file;
- article HTML/static renderer file;
- public static article data file, if it already exists;
- frontend JS/CSS only where required to fix dropdown freeze.

HF01 must not modify backend, Supabase, Auth, payment, deployment, ML, or unrelated content.

## 11. Post-Fix Validation Requirement

After HF01, regenerate and validate:

- QA00;
- QA01;
- LR00;
- LF00;
- LF01;
- LV00;
- LV01;
- HF00;
- HF01 when created.

Manual browser verification should be repeated after HF01.

## 12. Explicit Exclusions

HF00 does not:

- edit index.html;
- edit contact page;
- edit submissions page;
- edit article pages;
- edit CSS;
- edit JavaScript;
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
- activate payment;
- activate admin;
- activate public dynamic output;
- activate subscriber output;
- generate embeddings;
- train models;
- fetch external APIs;
- deploy frontend;
- deploy backend.

## 13. HF00 Acceptance Criteria

HF00 is complete when:

1. HF00 document exists.
2. HF00 registry exists.
3. HF00 preview generator exists.
4. HF00 validator exists.
5. HF00 correction plan preview exists.
6. LV01 manual findings are read.
7. Navigation correction plan is declared.
8. Dropdown freeze correction plan is declared.
9. Signup/Login placeholder boundary is declared.
10. Verified reference-link logic is preserved.
11. Image-credit logic is preserved.
12. HF01 is recommended as the next targeted frontend fix patch.
13. No mutation, deployment, backend, API, Supabase, Auth, payment, ML, public output, or subscriber output is enabled.
14. validate:hf00 passes.
15. validate:homepage passes.
16. validate:project passes.

## 14. HF00 Status

HF00 establishes the frontend correction plan.

HF00 does not activate runtime/backend/API/Supabase/Auth/deployment and does not mutate homepage or page files.
