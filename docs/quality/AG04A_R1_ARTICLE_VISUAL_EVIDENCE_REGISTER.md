# AG04A-R1 — Article Visual Evidence Register and Manual Review Queue

Status: Evidence-register / manual-review queue only  
Phase: Article Visual / Image Credit / Reading Surface Governance  
Depends on: AG04A, AG03Z  
Mutation impact: None  
Article HTML impact: None  
CSS impact: None  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
API impact: None  
Deployment impact: None  

## Purpose

AG04A-R1 creates a readable evidence register for all 72 AG03-closed article pages.

AG04A reported that all scanned article pages have usable visuals, image credit/source signals, reading-width alignment, and preserved AG03 reference integrity. However, because earlier live review screenshots showed concerns around default-logo visuals, image-credit visibility, and reading width, AG04A-R1 records article-wise evidence for manual review before deciding whether a correction patch is required.

## Scope

AG04A-R1 will:

1. read AG04A audit;
2. scan the same 72 article pages;
3. record each article path, title, category and detected visual evidence;
4. record primary detected image source and whether it appears logo/brand-like;
5. record image-credit/source evidence;
6. record reading-width and justification evidence;
7. confirm AG03 reference count remains exactly two per article;
8. create a manual-review queue for articles that need human visual confirmation;
9. avoid all mutation.

## Explicit Exclusions

AG04A-R1 does not:

- modify article HTML;
- replace images;
- insert image credits;
- modify CSS;
- modify references;
- rewrite text;
- fetch external URLs;
- activate backend;
- activate Supabase;
- activate Auth;
- deploy;
- delete files;
- move files.

## Acceptance Criteria

AG04A-R1 is complete when:

1. AG04A-R1 document exists.
2. AG04A-R1 registry exists.
3. AG04A-R1 generator exists.
4. AG04A-R1 validator exists.
5. Evidence register output exists.
6. Preview output exists.
7. Exactly 72 article pages are included.
8. Every article retains exactly two AG03 links.
9. Visual, credit and reading-surface evidence is recorded for every article.
10. Manual review status is recorded for every article.
11. No article/page/content/image/reference/CSS mutation is performed.
12. Runtime/backend/Supabase/Auth/API activation remains no-go.
