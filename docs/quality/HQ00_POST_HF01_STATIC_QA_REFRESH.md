# HQ00 — Post-HF01 Static QA Refresh

Status: Post-fix static QA refresh / no mutation  
Phase: HQ-Homepage Quality  
Depends on: HF01, HF00, LV01, QA01, QA00  
Runtime impact: None  
Backend impact: None  
Public API impact: None  
Supabase impact: None  
Auth impact: None  
Deployment impact: None  
Mutation impact: None  

## 1. Purpose

HQ00 performs a post-HF01 static quality refresh after the targeted static frontend correction patch.

HQ00 checks whether HF01 successfully introduced:

- common navigation across checked public pages;
- Submissions navigation;
- Dashboard navigation;
- static Sign in / Join placeholder;
- dropdown/select guard;
- article reference verification block;
- image credit block;
- no backend/API/Supabase/Auth activation.

HQ00 does not edit homepage files, article files, CSS, JavaScript, images, SEO metadata, sitemap, language runtime, backup files, archive files, deployment settings, backend, Supabase, Auth, API routes, public dynamic output, subscriber output, ML, embeddings, or content files.

HQ00 is a QA refresh and result-record stage only.

## 2. Current Position

HF01 was the first actual limited static frontend correction patch.

HF01 corrected static frontend issues found during LV01 and planned in HF00.

HQ00 now verifies those corrections from the static repository state before another manual live recheck.

## 3. QA Refresh Scope

HQ00 verifies:

1. public page navigation consistency;
2. Contact page has Submissions navigation;
3. article pages have Submissions and Dashboard navigation;
4. static Sign in / Join placeholder exists;
5. Sign in / Join remains a placeholder only;
6. dropdown/select guard exists;
7. article pages show reference verification block;
8. article pages show image-credit block;
9. no invented links are introduced;
10. no invented image credits are introduced;
11. backend/Supabase/Auth/API remains disabled.

## 4. Navigation QA Requirement

All checked public HTML pages should include:

- Home
- About
- Insights
- Submissions
- Dashboard
- Contact
- Sign in / Join

HQ00 does not check visual perfection. It checks static presence and consistency.

## 5. Dropdown QA Requirement

Checked public pages should contain the HF01 dropdown/select guard marker:

data-drishvara-hf01-dropdown-guard

The final confirmation of dropdown usability must still happen through live/manual browser verification.

## 6. Article Trust QA Requirement

Checked article pages should include:

- References are under editorial verification.
- Image credit: under review.

These are controlled placeholders. They do not replace final verified reference links or final image credits.

## 7. Verified Reference-Link Boundary

HQ00 preserves the verified reference-link requirement.

Final article references must still be selected through the established link-integrity logic:

- reachable;
- responsive;
- non-error;
- non-broken;
- non-spam;
- non-parked;
- relevant;
- credible where possible;
- supportive of the article.

HQ00 must not approve random or invented links.

## 8. Image Credit Boundary

HQ00 preserves the image-credit requirement.

Final image credits must not be invented. If the source is not verified, the controlled placeholder remains:

Image credit: under review.

## 9. Activation Boundary

HQ00 must not approve:

- backend activation;
- API activation;
- Supabase activation;
- Auth activation;
- payment activation;
- admin activation;
- subscriber output;
- public dynamic output;
- ML ingestion;
- embeddings;
- deployment activation.

## 10. Recommended Next Stage

After HQ00, the recommended next stage is:

LV02 — Post-HF01 Manual Live Recheck

LV02 should manually verify:

- navigation consistency;
- dropdown usability;
- Sign in / Join placeholder behavior;
- article reference block;
- image credit block;
- mobile rendering;
- browser console.

## 11. Explicit Exclusions

HQ00 does not:

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

## 12. HQ00 Acceptance Criteria

HQ00 is complete when:

1. HQ00 document exists.
2. HQ00 registry exists.
3. HQ00 generator exists.
4. HQ00 validator exists.
5. HQ00 post-HF01 QA preview exists.
6. HF01 evidence is read.
7. Public navigation checks pass.
8. Dropdown guard checks pass.
9. Article reference block checks pass.
10. Image credit block checks pass.
11. Backend/API/Supabase/Auth activation remains no-go.
12. LV02 is recorded as the next manual live recheck stage.
13. validate:hq00 passes.
14. validate:homepage passes.
15. validate:project passes.

## 13. HQ00 Status

HQ00 establishes the post-HF01 static QA refresh.

HQ00 does not activate runtime/backend/API/Supabase/Auth/deployment and does not mutate public pages.
