# AG05A — Public Page and Live-Readiness Smoke Audit

Status: Audit-only  
Phase: Public Page / Live-Readiness / Navigation Smoke Governance  
Depends on: AG04Z, AG03Z  
Mutation impact: None  
Article HTML impact: None  
CSS impact: None  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
API impact: None  
Deployment impact: None  

## Purpose

AG05A performs a static public-page and live-readiness smoke audit after AG03 and AG04 closure.

AG03 closed verified references. AG04 closed article visuals, image credits and reading width governance. AG05A checks whether the public static pages are structurally ready for live review without changing any files.

## Scope

AG05A will:

1. read AG03Z closure;
2. read AG04Z closure;
3. scan public/static HTML pages;
4. confirm homepage file exists;
5. confirm article pages remain present;
6. confirm AG03 reference and AG04 visual/credit/width closure values remain valid;
7. check favicon/icon link signals;
8. check navigation/header/menu signals;
9. check sign-in/join page navigation return signals where such pages exist;
10. check for accidental runtime/backend/Auth/Supabase activation signals in static public files;
11. prepare an issue queue for later manual/live review or targeted correction;
12. avoid all mutation.

## Explicit Exclusions

AG05A does not:

- modify article HTML;
- modify homepage HTML;
- modify CSS;
- modify JavaScript;
- replace favicon/logo;
- insert or alter navigation;
- fetch live URLs;
- activate backend;
- activate Supabase;
- activate Auth;
- deploy;
- delete files;
- move files.

## Acceptance Criteria

AG05A is complete when:

1. AG05A document exists.
2. AG05A registry exists.
3. AG05A generator exists.
4. AG05A validator exists.
5. Audit output exists.
6. Preview output exists.
7. AG03 closure remains true.
8. AG04 closure remains true.
9. Homepage static file is detected.
10. At least 72 article pages are accounted for through AG03/AG04 closure records.
11. Public HTML scan result is generated.
12. Favicon/logo, navigation, sign-in/join and backend/Auth/Supabase smoke signals are recorded.
13. Issue queue is generated.
14. No article/page/content/image/reference/CSS/JS mutation is performed.
15. Runtime/backend/Supabase/Auth/API activation remains no-go.
