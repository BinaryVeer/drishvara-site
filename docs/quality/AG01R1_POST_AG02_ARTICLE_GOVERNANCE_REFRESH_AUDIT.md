# AG01R1 — Post-AG02 Article Governance Refresh Audit

Status: Post-repair audit-only refresh  
Phase: Article Governance / Source-of-Truth Refresh  
Depends on: AG02, AG01, AV02, AV01, AR02F, AR02C, AR01  
Mutation impact: None  
Article HTML impact: None  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
API impact: None  
Deployment impact: None  

## Purpose

AG01R1 re-audits the article system after AG02.

AG02 repaired only the image/credit issue bucket identified by AG01. AG01R1 verifies whether that repair actually closed the image/hero gap before the project moves to reference scaling under AG03.

## Why AG01R1 is Required

AG02 validation confirms that targeted articles received AG02 hero visuals and AG02 image-credit markers. However, AG02 counters included CSS-marker occurrences in a few checks. AG01R1 therefore uses stricter audit logic by stripping style/script content before counting visible hero, credit, and reference markers.

## Scope

AG01R1 will:

1. re-audit all static article pages;
2. compare post-AG02 image/credit status against AG01 baseline;
3. verify AG02-targeted articles now have visible AG02 hero figures;
4. verify AG02-targeted articles now have visible AG02 image-credit records;
5. confirm AR02C sample reference links remain preserved;
6. confirm public verified-reference count is unchanged unless already changed by another approved stage;
7. confirm long-form article gaps remain for AG04;
8. confirm reference gaps remain for AG03;
9. produce a post-AG02 refresh audit output and preview.

## Explicit Exclusions

AG01R1 does not:

- mutate article HTML;
- change article text;
- change article word count;
- change article images;
- change image credits;
- change reference URLs;
- insert references;
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

AG01R1 is complete when:

1. AG01R1 document exists.
2. AG01R1 registry exists.
3. AG01R1 generator exists.
4. AG01R1 validator exists.
5. AG01R1 audit output exists.
6. AG01R1 preview output exists.
7. All static article pages are re-audited.
8. AG02-targeted article count is verified against AG02 apply result.
9. Visible AG02 hero figures are verified without counting CSS selectors.
10. Visible AG02 image-credit records are verified without counting CSS selectors.
11. Image/credit gap delta against AG01 is recorded.
12. Reference gap delta against AG01 is recorded.
13. Long-form gap status is recorded.
14. No mutation is performed.
15. Backend/API/Supabase/Auth activation remains no-go.

## Recommended Follow-up Sequence

If AG01R1 confirms the AG02 image/credit gap is closed, proceed to:

- AG03: verified reference scaling for remaining articles;
- AG04: long-form article expansion / minimum-length quality gate;
- AG05: direct article and router template alignment only if required.
