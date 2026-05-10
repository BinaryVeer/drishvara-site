# AG03C — Batch 1 Article Reference Insertion

Status: Approved reference insertion stage  
Phase: Article Governance / Verified References  
Depends on: AG03B-R1, AG03B, AG03A, AR02C, AR02F, AG01R1  
Mutation impact: 12 Batch 1 article pages only  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
API impact: None  
Deployment impact: None  

## Purpose

AG03C inserts the AG03B-R1 approved references into the 12 Batch 1 article pages.

AG03B populated candidates. AG03B-R1 approved exactly two references per article for insertion. AG03C is the first stage in this batch that mutates article HTML, and its scope is strictly limited to the approved Batch 1 article pages.

## Scope

AG03C will:

1. read AG03B-R1 approval record;
2. insert exactly two approved reference links into each approved Batch 1 article page;
3. add AG03C markers to inserted reference blocks;
4. preserve existing article text;
5. preserve image credits;
6. preserve AG02 fallback visuals;
7. preserve AR02C sample reference blocks;
8. avoid touching non-Batch 1 article pages;
9. avoid backend, Supabase, Auth, API and deployment activation.

## Explicit Exclusions

AG03C does not:

- rewrite article body text;
- change article images;
- change image-credit blocks;
- modify non-Batch 1 articles;
- fetch external URLs;
- activate backend;
- activate Supabase;
- activate Auth;
- deploy;
- delete files;
- move files.

## Acceptance Criteria

AG03C is complete when:

1. AG03C document exists.
2. AG03C registry exists.
3. AG03C applier exists.
4. AG03C validator exists.
5. Apply result exists.
6. Preview output exists.
7. Exactly 12 Batch 1 article pages are updated.
8. Exactly 24 approved reference links are inserted.
9. Each updated article contains exactly two AG03C reference links.
10. Inserted URLs match AG03B-R1 approval record.
11. Image-credit blocks remain present.
12. AG02 hero visual blocks remain present.
13. Non-Batch 1 articles are not touched.
14. Runtime/backend/Supabase/Auth/API activation remains no-go.
