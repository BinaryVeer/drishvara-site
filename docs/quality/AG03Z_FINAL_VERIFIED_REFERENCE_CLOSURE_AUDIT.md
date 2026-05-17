# AG03Z — Final Consolidated Verified Reference Closure Audit

Status: Final consolidated closure audit only  
Phase: Article Governance / Verified References  
Depends on: AG03D-B6, AG03C-B6, AG03B-B6-R1, AG03A  
Mutation impact: None  
Article HTML impact: None  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
API impact: None  
Deployment impact: None  

## Purpose

AG03Z is the final consolidated audit for the AG03 verified-reference scaling cycle.

AG03Z verifies that all AG03A queued articles have received verified references, that all six AG03 batches are complete, that each completed article has two AG03 reference links, and that the missing-reference queue is closed.

## Scope

AG03Z will:

1. read AG03A queue;
2. read AG03D-B6 final batch audit;
3. scan all 72 completed article pages;
4. confirm each completed article contains exactly two AG03 reference links;
5. confirm total completed AG03 reference link count is 144;
6. confirm remaining reference queue count is 0;
7. confirm AG03 reference-scaling closure;
8. avoid article HTML mutation;
9. keep runtime/backend/Supabase/Auth/API/public/subscriber activation no-go.

## Explicit Exclusions

AG03Z does not:

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

AG03Z is complete when:

1. AG03Z document exists.
2. AG03Z registry exists.
3. AG03Z generator exists.
4. AG03Z validator exists.
5. Final closure audit output exists.
6. Final closure preview output exists.
7. AG03A queue contains 72 entries.
8. AG03D-B6 reports 72 completed articles.
9. AG03D-B6 reports 144 completed references.
10. AG03D-B6 remaining queue is 0.
11. Live scan confirms 72 completed article pages.
12. Live scan confirms 144 AG03 reference links.
13. Every completed article has exactly two AG03 reference links.
14. No article/page/content/image/reference mutation is performed.
15. Runtime/backend/Supabase/Auth/API activation remains no-go.
16. AG03 verified-reference scaling is marked closed.
