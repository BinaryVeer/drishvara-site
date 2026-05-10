# AG03D — Post-AG03C Batch 1 Reference Insertion Audit

Status: Post-insertion audit only  
Phase: Article Governance / Verified References  
Depends on: AG03C, AG03B-R1, AG03B, AG03A, AG01R1, AR02C, AR02F  
Mutation impact: None  
Article HTML impact: None  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
API impact: None  
Deployment impact: None  

## Purpose

AG03D audits the Batch 1 reference insertion completed under AG03C.

AG03C inserted approved Batch 1 references into 12 article pages. AG03D verifies that the insertion is stable, that approved URLs are present, that each Batch 1 article has exactly two AG03C links, and that the remaining reference-scaling queue is refreshed for Batch 2.

## Scope

AG03D will:

1. read AG03A queue;
2. read AG03B-R1 approval record;
3. read AG03C apply result;
4. scan the 12 Batch 1 article pages;
5. confirm each Batch 1 article contains exactly two AG03C reference links;
6. confirm inserted URLs match the approval record;
7. confirm AG02 hero and credit markers were preserved wherever they existed;
8. refresh remaining reference-scaling count;
9. authorize AG03B Batch 2 as the next candidate-population stage;
10. avoid article HTML mutation.

## Explicit Exclusions

AG03D does not:

- insert links;
- modify article HTML;
- modify article text;
- modify images;
- modify image credits;
- fetch external URLs;
- approve new references;
- activate backend;
- activate Supabase;
- activate Auth;
- deploy;
- delete files;
- move files.

## Acceptance Criteria

AG03D is complete when:

1. AG03D document exists.
2. AG03D registry exists.
3. AG03D generator exists.
4. AG03D validator exists.
5. Audit output exists.
6. Preview output exists.
7. Exactly 12 Batch 1 article pages are audited.
8. Exactly 24 AG03C reference links are confirmed.
9. Each Batch 1 article has exactly two AG03C reference links.
10. All approved URLs are present in the corresponding article pages.
11. AG03C apply-result count and live article scan count reconcile.
12. Remaining AG03A reference queue count is refreshed to 60.
13. AG03B Batch 2 is identified as the next controlled candidate-population stage.
14. No article/page/content/image/reference mutation is performed.
15. Runtime/backend/Supabase/Auth/API activation remains no-go.
