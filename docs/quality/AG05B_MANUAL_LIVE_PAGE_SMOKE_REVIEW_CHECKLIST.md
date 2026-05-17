# AG05B — Manual Live Page Smoke Review Checklist

Status: Manual/live review checklist only  
Phase: Public Page / Live-Readiness / Manual Smoke Review Governance  
Depends on: AG05A, AG04Z, AG03Z  
Mutation impact: None  
Article HTML impact: None  
CSS impact: None  
JavaScript impact: None  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
Deployment impact: None  

## Purpose

AG05B creates a structured manual/live review checklist after the AG05A static smoke audit.

AG05A confirmed static readiness and reduced the issue queue to manual live review only. AG05B prepares the review record that the operator will use to check live rendering, click behaviour, favicon/logo display, navigation, article references, article visuals, image credits and reading width.

## Scope

AG05B will:

1. read AG05A static smoke audit;
2. confirm AG03 and AG04 closures remain valid;
3. create homepage live-review checks;
4. create article-page sample live-review checks;
5. create sign-in/join/navigation live-review checks;
6. create favicon/logo live-review checks;
7. create backend/Auth/Supabase no-activation review checks;
8. keep every observation as pending manual review;
9. avoid all mutation.

## Explicit Exclusions

AG05B does not:

- fetch live URLs;
- modify homepage HTML;
- modify article HTML;
- modify CSS;
- modify JavaScript;
- modify images;
- modify references;
- activate backend;
- activate Supabase;
- activate Auth;
- deploy;
- delete files;
- move files.

## Acceptance Criteria

AG05B is complete when:

1. AG05B document exists.
2. AG05B registry exists.
3. AG05B generator exists.
4. AG05B validator exists.
5. Checklist output exists.
6. Preview output exists.
7. AG05A input is confirmed.
8. Homepage checks are created.
9. Article sample checks are created.
10. Navigation/sign-in/join checks are created.
11. Favicon/logo checks are created.
12. Backend/Auth/Supabase no-activation checks are created.
13. All review observations remain pending manual live review.
14. No article/page/content/image/reference/CSS/JS mutation is performed.
15. Runtime/backend/Supabase/Auth/API activation remains no-go.
16. AG05C manual live review result record is identified as the next stage.
