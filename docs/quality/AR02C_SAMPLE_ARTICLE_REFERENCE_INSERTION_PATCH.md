# AR02C — Sample Article Reference Insertion Patch

Status: Controlled sample article reference insertion  
Phase: Article Quality / Verified Reference Publication  
Depends on: AR02B, AR02A, AR01  
Mutation impact: Five sample article HTML pages only  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
API impact: None  
Deployment impact: None  

## Purpose

AR02C inserts accepted references into the five sample article pages populated in AR02B.

AR01 created the public reference/image-credit surface. AR02A created the workbench. AR02B populated and accepted two candidate references each for five sample articles. AR02C now updates only those five article pages so that the accepted links appear publicly in the article evidence block.

## Scope

AR02C will:

1. read the AR02B sample verified-reference candidate registry;
2. update only the five AR02B sample article pages;
3. replace the AR01 “Under editorial verification” reference slots with the two accepted references;
4. preserve the image-credit / attribution block;
5. mark references as AR02C sample-accepted;
6. create apply and preview evidence;
7. keep all non-sample article pages untouched.

## Explicit Exclusions

AR02C does not:

- update the remaining 72 article pages;
- generate new references;
- insert random links;
- perform external API calls;
- create backend routes;
- connect Supabase;
- activate Auth;
- collect user data;
- deploy frontend;
- deploy backend;
- delete or move files.

## Acceptance Criteria

AR02C is complete when:

1. AR02C document exists.
2. AR02C registry exists.
3. AR02C applier exists.
4. AR02C preview generator exists.
5. AR02C validator exists.
6. AR02C apply result exists.
7. AR02C preview exists.
8. Exactly five sample article pages are modified.
9. Each sample article page contains exactly two accepted reference links.
10. Every inserted reference URL matches AR02B sample registry.
11. Image-credit block remains present.
12. Non-sample article pages do not contain AR02C insertion marker.
13. Backend/API/Supabase/Auth activation remains no-go.
