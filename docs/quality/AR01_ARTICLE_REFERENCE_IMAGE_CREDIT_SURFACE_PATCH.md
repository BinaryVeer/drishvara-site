# AR01 — Article Reference Integrity and Image Credit Attribution Surface Patch

Status: Editorial quality surface patch  
Phase: Article Quality / Reference Governance  
Mutation impact: Static article HTML only + editorial registry  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
API impact: None  
Deployment impact: None  

## Purpose

AR01 implements the first editorial-quality layer for Drishvara article pages.

The earlier agreed rule is preserved:

- every feature/article should eventually show two verified reference links;
- links must not be random;
- links must be reachable, relevant, legitimate, non-spam, non-broken and non-error where possible;
- if links are not yet verified, the article must not pretend that links are verified;
- image credit / attribution must be visible.

AR01 therefore adds a standard article-level evidence block to each static article page.

## Correction Scope

AR01 will:

1. scan static article pages under `articles/*/*.html`;
2. add a visible reference and image-credit block where missing;
3. mark references as `under editorial verification`;
4. add two reference slots per article without fake URLs;
5. add one image-credit / attribution statement per article;
6. create an editorial registry listing all article pages and their current reference status;
7. preserve backend/Auth/Supabase/API no-go boundary.

## Important Boundary

AR01 does not perform live web verification.

It prepares the article surface and registry so that the next patch can populate verified reference links through a controlled credibility and availability process.

## Explicit Exclusions

AR01 does not:

- insert unverified external links;
- invent references;
- call external APIs;
- create API routes;
- create backend code;
- connect Supabase;
- activate Auth;
- activate login/signup;
- collect user data;
- change dropdown logic;
- change favicon logic;
- deploy frontend;
- deploy backend;
- delete backup files;
- move archive files.

## Acceptance Criteria

AR01 is complete when:

1. AR01 document exists.
2. AR01 registry exists.
3. AR01 applier exists.
4. AR01 preview generator exists.
5. AR01 validator exists.
6. AR01 apply result exists.
7. AR01 preview exists.
8. editorial article registry exists.
9. every checked article page contains AR01 evidence block.
10. every checked article page contains two reference slots.
11. every checked article page contains image credit block.
12. no article is marked as verified without verified URL evidence.
13. backend/API/Supabase/Auth activation remains no-go.
14. validate:ar01 passes.
15. validate:project passes.
