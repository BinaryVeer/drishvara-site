# AR02F — Sample Duplicate Legacy Reference Block Cleanup

Status: Targeted sample article cleanup  
Phase: Article Quality / Verified Reference Publication Cleanup  
Depends on: AR02E, AR02D, AR02C, AR02B, AR02A, AR01  
Mutation impact: Five sample article HTML pages only  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
API impact: None  
Deployment impact: None  

## Purpose

AR02F removes duplicate legacy reference/image-credit blocks from the five AR02C sample article pages if such blocks are present.

AR02E recorded that scale-up should remain blocked until sample pages are cleaned and confirmed. AR02F is therefore a narrow cleanup patch. It does not add new links and does not touch the remaining non-sample article pages.

## Scope

AR02F will:

1. read the AR02B sample article registry;
2. scan only the five AR02B/AR02C sample article pages;
3. remove legacy reference/image-credit blocks containing old “under editorial verification” text, if present;
4. preserve the AR02C accepted reference block;
5. preserve exactly two accepted reference links per sample article;
6. preserve image-credit visibility;
7. keep all non-sample articles untouched.

## Explicit Exclusions

AR02F does not:

- add new references;
- change accepted AR02C URLs;
- mutate non-sample article pages;
- fetch external links;
- create API routes;
- connect Supabase;
- activate Auth;
- collect user data;
- deploy frontend;
- deploy backend;
- delete or move files.

## Acceptance Criteria

AR02F is complete when:

1. AR02F document exists.
2. AR02F registry exists.
3. AR02F applier exists.
4. AR02F preview generator exists.
5. AR02F validator exists.
6. AR02F apply result exists.
7. AR02F preview exists.
8. Exactly five sample articles are scanned.
9. Sample articles preserve AR02C accepted reference block.
10. Sample articles preserve exactly two AR02C reference links.
11. Sample articles preserve image credit.
12. Legacy duplicate reference/image-credit blocks are absent outside the AR02C block.
13. Non-sample articles are not mutated.
14. Backend/API/Supabase/Auth activation remains no-go.
