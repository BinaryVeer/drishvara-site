# AG06A — Full Source-of-Truth Inventory Audit

Status: Audit-only  
Phase: Content Intelligence Foundation  
Depends on: SOURCE_TREE_ACTIVE_REGISTER, AG05Z, AG04Z, AG03Z  
Mutation impact: None  
Article HTML impact: None  
CSS impact: None  
JavaScript impact: None  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
Deployment impact: None  

## Purpose

AG06A creates the first full source-of-truth inventory after AG03, AG04 and AG05 closure and after source-tree housekeeping.

The audit separates the public website layer, governance layer, production-intelligence layer, automation/backend layer and excluded archive/review material. Its purpose is to prevent future false references and to identify what should feed the Drishvara Content Intelligence Foundation.

## Scope

AG06A will:

1. read the Source Tree Active Register;
2. scan the active public article layer;
3. count public article pages;
4. classify governed and unguided article pages;
5. identify public articles without full AG03/AG05 reference governance;
6. estimate public article word counts;
7. inspect production-intelligence folders such as scaffold outputs and generated outputs;
8. count scaffold run artifacts including final outputs, visual plans and learning snapshots;
9. inspect governance records and scripts;
10. identify content-intelligence gaps;
11. recommend AG06B as the next stage.

## Explicit Exclusions

AG06A does not:

- modify article HTML;
- modify homepage HTML;
- modify CSS;
- modify JavaScript;
- modify images;
- modify references;
- fetch live URLs;
- deploy;
- activate backend;
- activate Supabase;
- activate Auth;
- delete files;
- move files.

## Acceptance Criteria

AG06A is complete when:

1. AG06A document exists.
2. AG06A registry exists.
3. AG06A generator exists.
4. AG06A validator exists.
5. Inventory audit output exists.
6. Preview output exists.
7. Source Tree Active Register is consumed.
8. Public article inventory is generated.
9. Governed and unguided public article counts are recorded.
10. Production-intelligence folder inventory is generated.
11. Scaffold output artifact counts are recorded where available.
12. Content-intelligence gaps are recorded.
13. No article/page/content/image/reference/CSS/JS mutation is performed.
14. Runtime/backend/Supabase/Auth/API activation remains no-go.
15. AG06B Content Intelligence Schema is identified as next.
