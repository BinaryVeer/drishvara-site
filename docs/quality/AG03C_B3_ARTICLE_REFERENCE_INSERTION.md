# AG03C-B3 — Batch 3 Article Reference Insertion

Status: Approved reference insertion stage  
Phase: Article Governance / Verified References  
Depends on: AG03B-B3-R1, AG03B-B3, AG03D-B2, AG03C-B2, AG03A  
Mutation impact: 12 Batch 3 article pages only  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
API impact: None  
Deployment impact: None  

## Purpose

AG03C-B3 inserts the AG03B-B3-R1 approved references into the 12 Batch 3 article pages.

AG03B-B3 populated candidates. AG03B-B3-R1 approved exactly two references per article for insertion. AG03C-B3 mutates only the approved Batch 3 article pages.

## Scope

AG03C-B3 will:

1. read AG03B-B3-R1 approval record;
2. insert exactly two approved reference links into each approved Batch 3 article page;
3. add AG03C-B3 markers to inserted reference blocks;
4. preserve existing article text;
5. preserve image credits;
6. preserve AG02 hero and image-credit markers wherever they existed before insertion;
7. avoid touching non-Batch 3 article pages;
8. avoid backend, Supabase, Auth, API and deployment activation.

## Explicit Exclusions

AG03C-B3 does not:

- rewrite article body text;
- change article images;
- change image-credit blocks;
- modify non-Batch 3 articles;
- fetch external URLs;
- activate backend;
- activate Supabase;
- activate Auth;
- deploy;
- delete files;
- move files.

## Acceptance Criteria

AG03C-B3 is complete when:

1. AG03C-B3 document exists.
2. AG03C-B3 registry exists.
3. AG03C-B3 applier exists.
4. AG03C-B3 validator exists.
5. Apply result exists.
6. Preview output exists.
7. Exactly 12 Batch 3 article pages are processed.
8. Exactly 24 approved reference links are inserted.
9. Each processed article contains exactly two AG03C-B3 reference links.
10. Inserted URLs match AG03B-B3-R1 approval record.
11. AG02 hero and image-credit blocks are preserved wherever they existed before AG03C-B3.
12. Non-Batch 3 articles are not touched.
13. Runtime/backend/Supabase/Auth/API activation remains no-go.
