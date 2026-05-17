# AG05E — Post-AG05D Visible Reference Placement Repair Audit

Status: Post-repair audit only  
Phase: Public Page / Live-Readiness / Visible Reference Governance  
Depends on: AG05D, AG05C, AG05B, AG05A, AG04Z, AG03Z  
Mutation impact: None  
Article HTML impact: None  
CSS impact: None  
JavaScript impact: None  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
Deployment impact: None  

## Purpose

AG05E audits the visible reference placement repair completed under AG05D.

AG05D repositioned verified AG03 reference blocks into the visible reader surface and neutralized obsolete “Under editorial verification” placeholder reference sections. AG05E verifies that the repair is stable and that AG03/AG04 integrity remains preserved.

## Scope

AG05E will:

1. read AG05D apply result;
2. read AG05C manual live review result;
3. read AG03Z reference closure;
4. read AG04Z visual/credit/width closure;
5. rescan all processed article pages;
6. confirm every processed article retains exactly two AG03 reference links;
7. confirm AG03 reference URLs remain unchanged;
8. confirm obsolete visible placeholder sections are no longer visible;
9. confirm one AG05D visible reference block exists per processed article;
10. confirm verified references appear before back/footer links;
11. confirm no backend/Auth/Supabase/API activation;
12. identify AG05F live redeployment/manual verification as the next stage.

## Explicit Exclusions

AG05E does not:

- modify homepage HTML;
- modify article HTML;
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

AG05E is complete when:

1. AG05E document exists.
2. AG05E registry exists.
3. AG05E generator exists.
4. AG05E validator exists.
5. Audit output exists.
6. Preview output exists.
7. 72 processed article pages are audited.
8. Every audited article has exactly two AG03 reference links.
9. Every audited article has one AG05D visible reference block.
10. No visible obsolete “Under editorial verification” reference placeholder remains.
11. AG03 reference URLs remain unchanged from AG05D apply result.
12. Verified references appear before back/footer links.
13. AG03 and AG04 closure integrity remains preserved.
14. No article/page/content/image/reference/CSS/JS mutation is performed.
15. Runtime/backend/Supabase/Auth/API activation remains no-go.
16. AG05F live redeployment/manual verification is identified as next.
