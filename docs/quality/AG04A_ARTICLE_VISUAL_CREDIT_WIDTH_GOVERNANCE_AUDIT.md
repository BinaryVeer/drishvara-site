# AG04A — Article Visual, Image Credit, and Reading Width Governance Audit

Status: Audit-only  
Phase: Article Visual / Image Credit / Reading Experience Governance  
Depends on: AG03Z, AG03D-B6, AG03C-B6, AG02  
Mutation impact: None  
Article HTML impact: None  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
API impact: None  
Deployment impact: None  

## Purpose

AG04A audits the 72 AG03-closed article pages for visual governance and reading-surface consistency.

This stage does not modify article pages. It records which article pages already follow the expected article visual, image credit, reading width and reference-preservation rules, and which pages need a later targeted correction.

## Scope

AG04A will:

1. read AG03Z final closure audit;
2. scan the 72 AG03-closed article pages;
3. confirm AG03 reference integrity remains unchanged;
4. check whether each article has article visual markers or usable non-logo visual sources;
5. flag probable default-logo/fallback visual use;
6. check whether each article has image credit/source/attribution markers or text;
7. check broad reading-width and justified-text signals in article HTML and CSS;
8. prepare a categorized issue queue for the next correction stage;
9. keep all runtime/backend/Supabase/Auth/API activation no-go.

## Explicit Exclusions

AG04A does not:

- modify article HTML;
- insert or replace images;
- insert or modify image credits;
- modify CSS;
- rewrite article text;
- modify references;
- fetch external URLs;
- activate backend;
- activate Supabase;
- activate Auth;
- deploy;
- delete files;
- move files.

## Acceptance Criteria

AG04A is complete when:

1. AG04A document exists.
2. AG04A registry exists.
3. AG04A generator exists.
4. AG04A validator exists.
5. Audit output exists.
6. Preview output exists.
7. Exactly 72 AG03-closed article pages are scanned.
8. Live AG03 reference count remains 144.
9. Every scanned article retains exactly two AG03 reference links.
10. Visual, image-credit and reading-width issue queues are generated.
11. No article/page/content/image/reference/CSS mutation is performed.
12. Runtime/backend/Supabase/Auth/API activation remains no-go.
13. AG04B targeted correction stage is identified as the next stage.
