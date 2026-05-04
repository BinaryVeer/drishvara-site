# LV01 — Manual Live Verification Result Record

Status: Manual live verification result / no activation  
Phase: LV-Live Verification  
Depends on: LV00, LF01, LF00, QA01, QA00  
Runtime impact: None  
Backend impact: None  
Public API impact: None  
Supabase impact: None  
Auth impact: None  
Deployment impact: None  
Mutation impact: None  

## 1. Purpose

LV01 records the manual live verification findings observed on the live Drishvara pages after LV00.

LV01 does not fix the homepage, edit files, deploy, create API routes, activate backend, connect Supabase, activate Auth, activate payment, activate public dynamic output, activate subscriber output, generate embeddings, or mutate content.

LV01 is a result-record stage only.

## 2. Manual Findings Recorded

The manual live review identified the following user-facing issues:

1. Navigation is inconsistent across pages.
2. Contact page does not show the full common menu; Submissions is missing.
3. Dropdown selection freezes or locks interaction until browser/app focus changes.
4. Signup/Login is not implemented yet.
5. Featured reads/articles do not visibly show the two verified reference links.
6. Article image credits are missing.
7. Reference-link credibility logic must be preserved in the correction.
8. Image-credit/attribution logic must be included in the correction.

## 3. Reference-Link Integrity Requirement

Every featured read/article should eventually expose two verified reference links.

A reference link must not be selected randomly.

A valid reference link should be:

- reachable;
- responsive;
- not broken;
- not 404/403/500;
- not an error page;
- not parked/spam/irrelevant;
- not an endless redirect;
- related to the article;
- from a legitimate or credible source where possible;
- supportive of the article’s factual basis.

If links are not yet verified, the article should display a controlled placeholder such as:

References are under editorial verification.

## 4. Image Credit Requirement

Every article image should carry an image credit or attribution block.

Minimum display rule:

- Image credit: Source / Photographer / Platform

If not yet verified:

- Image credit: under review

Final publication should not permanently rely on under-review credits.

## 5. Navigation Consistency Requirement

All public pages should share a common navigation order.

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

## 6. Dropdown Interaction Requirement

Dropdowns must remain usable without freezing the page.

The correction must check:

- native select focus;
- overlay/z-index interference;
- language-click handlers;
- global click handlers;
- scroll lock;
- pointer events;
- fixed layers above form controls.

## 7. Signup/Login Boundary

Signup/Login is a visible product requirement, but Auth remains no-go.

A future correction may add only a safe static placeholder:

- Sign in / Join
- Coming soon
- No account collection
- No Auth activation
- No Supabase activation

## 8. Result Decision

Manual live verification result is:

Warning / partial fail.

Static validation is clean, but clean live confidence is not yet approved because visible navigation, dropdown, attribution, reference-link, and account-entry expectations remain unresolved.

## 9. Recommended Next Stage

Recommended next stage:

HF00 — Homepage/Page Navigation, Dropdown, Reference Link and Image Credit Fix Plan

HF00 must remain planning-only.

## 10. Explicit Exclusions

LV01 does not:

- edit index.html;
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

## 11. LV01 Acceptance Criteria

LV01 is complete when:

1. LV01 document exists.
2. LV01 registry exists.
3. LV01 result generator exists.
4. LV01 validator exists.
5. LV01 result preview exists.
6. Manual findings are recorded.
7. Verified reference-link logic is recorded.
8. Image-credit logic is recorded.
9. Navigation/dropdown/signup findings are recorded.
10. HF00 is recommended as the next correction-planning stage.
11. No mutation, deployment, backend, API, Supabase, Auth, payment, ML, public output, or subscriber output is enabled.
12. validate:lv01 passes.
13. validate:live passes.
14. validate:project passes.

## 12. LV01 Status

LV01 records manual live verification result.

LV01 does not activate runtime/backend/API/Supabase/Auth/deployment.
