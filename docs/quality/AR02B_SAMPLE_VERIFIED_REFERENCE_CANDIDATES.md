# AR02B — Sample Verified Reference Candidate Population

Status: Editorial reference candidate population  
Phase: Article Quality / Verified Reference Selection  
Depends on: AR02A, AR01  
Mutation impact: Editorial workbench only  
Article HTML impact: None  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
API impact: None  
Deployment impact: None  

## Purpose

AR02B populates verified reference candidates for a controlled sample of five Drishvara articles.

AR02A created the workbench structure for 77 articles and 154 candidate reference slots. AR02B now fills two candidate references for five sample articles only.

## Scope

AR02B will:

1. update the verified-reference workbench for five sample articles;
2. populate two candidate references per selected article;
3. record source type, credibility, relevance, reachability and editorial decision fields;
4. mark the five sample articles as ready for later article-page insertion;
5. keep the remaining articles pending;
6. create a sample candidate registry;
7. keep article HTML unchanged.

## Explicit Exclusions

AR02B does not:

- mutate article HTML;
- replace the AR01 “under editorial verification” blocks;
- insert reference links into public article pages;
- call external APIs;
- create backend routes;
- connect Supabase;
- activate Auth;
- collect user data;
- deploy frontend;
- deploy backend;
- delete or move files.

## Acceptance Criteria

AR02B is complete when:

1. AR02B document exists.
2. AR02B registry exists.
3. AR02B generator exists.
4. AR02B validator exists.
5. Sample candidate registry exists.
6. Preview exists.
7. Exactly five sample articles are populated.
8. Exactly ten candidate URLs are populated.
9. Each sample article has two accepted references.
10. Non-sample articles remain pending.
11. Article HTML is not modified.
12. Backend/API/Supabase/Auth activation remains no-go.
