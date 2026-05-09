# AG01 — Article Governance Source-of-Truth Consolidation Audit

Status: Audit-only consolidation stage  
Phase: Article Governance / Source-of-Truth  
Depends on: AR01, AR02A, AR02B, AR02C, AR02D, AR02E, AR02F, AV01, AV02  
Mutation impact: None  
Article HTML impact: None  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
API impact: None  
Deployment impact: None  

## Purpose

AG01 consolidates the current Drishvara article system into one source-of-truth audit.

The objective is to stop fragmented correction cycles. AG01 does not create another image patch, reference patch, or width patch. Instead, it audits what already exists and identifies the exact governance gap for each article.

## Why AG01 is Required

The following article-related components already exist:

- AR01: reference and image-credit surface;
- AR02A: verified-reference workbench;
- AR02B: sample verified reference candidates;
- AR02C: sample reference insertion;
- AR02D: live review checklist;
- AR02E: live review result record;
- AR02F: duplicate reference cleanup;
- AV01: article width and visual fallback standardisation;
- AV02: article visual fallback repair and router reference guard.

However, the live article system still has inconsistencies because these components are not yet governed by one enforced source-of-truth.

## Scope

AG01 will audit every static article page and report:

1. article path;
2. category;
3. title;
4. word count;
5. whether the article is below the long-form minimum;
6. hero image status;
7. image source path;
8. whether image is final, fallback, logo-like, missing, broken, or external;
9. image-credit status;
10. reference block status;
11. AR02C accepted reference count;
12. whether two verified references are present;
13. whether AR01/AR02/AV governance markers are present;
14. direct article and router alignment status;
15. publication readiness status;
16. required next action.

## Long-form Content Rule

AG01 does not change the article text. For audit purposes, the provisional long-form threshold is set at 1200 words unless a formal article-length gate already exists in the repository.

Articles below the threshold will be marked as requiring content expansion or long-form quality review.

## Explicit Exclusions

AG01 does not:

- mutate article HTML;
- change article text;
- change article word count;
- change article images;
- change image credits;
- change reference links;
- insert new references;
- fetch external URLs;
- create API routes;
- connect Supabase;
- activate Auth;
- collect user data;
- deploy frontend;
- deploy backend;
- delete files;
- move files.

## Acceptance Criteria

AG01 is complete when:

1. AG01 document exists.
2. AG01 registry exists.
3. AG01 generator exists.
4. AG01 validator exists.
5. AG01 audit output exists.
6. AG01 preview output exists.
7. All static article pages are audited.
8. Article count is recorded.
9. Word-count status is recorded for each article.
10. Image status is recorded for each article.
11. Image-credit status is recorded for each article.
12. Reference status is recorded for each article.
13. Router/direct-page alignment status is recorded.
14. Publication readiness is recorded.
15. No article HTML mutation is performed.
16. Backend/API/Supabase/Auth activation remains no-go.

## Recommended Follow-up Sequence

AG01 should be followed by targeted repair stages only after the audit result is reviewed:

- AG02: image and image-credit source-of-truth repair;
- AG03: verified reference scaling for remaining articles;
- AG04: long-form article minimum-length and content-quality gate;
- AG05: direct article and router template alignment.
