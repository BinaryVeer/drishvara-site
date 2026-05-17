# AG06D — Existing Public Article Classification

Status: Classification-register stage  
Phase: Content Intelligence Foundation  
Depends on: AG06C, AG06B, AG06A, SOURCE_TREE_ACTIVE_REGISTER  
Mutation impact: Classification registry only  
Public article HTML impact: None  
CSS impact: None  
JavaScript impact: None  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
Deployment impact: None  

## Purpose

AG06D classifies the existing 77 public article pages so they are not mistaken as final Drishvara-quality content.

AG06A confirmed that the public article layer is short, lacks structured visual intelligence and has 5 public articles outside full AG03/AG05 reference governance. AG06C confirmed that the scaffold layer contains stronger long-form outputs and visual plans. AG06D records how the current public articles should be treated before the future long-form production system is built.

## Scope

AG06D will classify each public article as one or more of:

1. test corpus retention candidate;
2. long-form upgrade candidate;
3. visual enrichment candidate;
4. reference-governance candidate;
5. final-public-product ready.

AG06D will also record recommended handling for each article without mutating the article itself.

## Explicit Exclusions

AG06D does not:

- modify public article HTML;
- modify homepage HTML;
- modify CSS;
- modify JavaScript;
- modify images;
- modify references;
- add reference links;
- remove articles;
- archive articles;
- publish anything;
- activate backend;
- activate Supabase;
- activate Auth;
- deploy;
- delete files;
- move files.

## Acceptance Criteria

AG06D is complete when:

1. AG06D document exists.
2. AG06D registry exists.
3. AG06D generator exists.
4. AG06D validator exists.
5. Public article classification register exists.
6. Preview output exists.
7. All 77 public articles from AG06A are classified.
8. All 5 unguided public articles are marked as reference-governance candidates.
9. All short public articles below the long-form threshold are marked as long-form upgrade candidates.
10. Articles lacking structured visuals are marked as visual enrichment candidates.
11. No article is treated as final Drishvara-quality long-form content unless it meets reference, length and visual criteria.
12. No public article/page/content/image/reference/CSS/JS mutation is performed.
13. Runtime/backend/Supabase/Auth/API activation remains no-go.
14. AG06E Long-Form Article Standard is identified as next.
