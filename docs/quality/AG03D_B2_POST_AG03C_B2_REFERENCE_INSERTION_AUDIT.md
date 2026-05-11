# AG03D-B2 — Post-AG03C-B2 Batch 2 Reference Insertion Audit

Status: Post-insertion audit only  
Phase: Article Governance / Verified References  
Depends on: AG03C-B2, AG03B-B2-R1, AG03B-B2, AG03D, AG03A  
Mutation impact: None  
Article HTML impact: None  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
API impact: None  
Deployment impact: None  

## Purpose

AG03D-B2 audits the Batch 2 reference insertion completed under AG03C-B2.

AG03C-B2 inserted approved Batch 2 references into 12 article pages. AG03D-B2 verifies that the insertion is stable, that approved URLs are present, that each Batch 2 article has exactly two AG03C-B2 links, and that the remaining reference-scaling queue is refreshed for Batch 3.

## Scope

AG03D-B2 will:

1. read AG03A queue;
2. read AG03D Batch 1 audit;
3. read AG03B-B2-R1 approval record;
4. read AG03C-B2 apply result;
5. scan the 12 Batch 2 article pages;
6. confirm each Batch 2 article contains exactly two AG03C-B2 reference links;
7. confirm inserted URLs match the approval record;
8. confirm AG02 hero and credit markers were preserved wherever they existed;
9. refresh remaining reference-scaling count to 48;
10. authorize AG03B Batch 3 as the next candidate-population stage;
11. avoid article HTML mutation.

## Explicit Exclusions

AG03D-B2 does not:

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

AG03D-B2 is complete when:

1. AG03D-B2 document exists.
2. AG03D-B2 registry exists.
3. AG03D-B2 generator exists.
4. AG03D-B2 validator exists.
5. Audit output exists.
6. Preview output exists.
7. Exactly 12 Batch 2 article pages are audited.
8. Exactly 24 AG03C-B2 reference links are confirmed.
9. Each Batch 2 article has exactly two AG03C-B2 reference links.
10. All approved URLs are present in the corresponding article pages.
11. AG03C-B2 apply-result count and live article scan count reconcile.
12. Remaining AG03A reference queue count is refreshed to 48.
13. AG03B Batch 3 is identified as the next controlled candidate-population stage.
14. No article/page/content/image/reference mutation is performed.
15. Runtime/backend/Supabase/Auth/API activation remains no-go.
