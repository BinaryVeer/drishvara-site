# AR02A — Verified Reference Selection Workbench Structure

Status: Editorial reference governance workbench  
Phase: Article Quality / Verified Reference Selection  
Depends on: AR01  
Mutation impact: Editorial registry/workbench only  
Article HTML impact: None  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
API impact: None  
Deployment impact: None  

## Purpose

AR02A creates the verified-reference selection workbench for Drishvara articles.

AR01 added visible reference and image-credit surfaces to all article pages without inserting fake or unverified URLs. AR02A now creates the internal editorial structure required to select and review two verified references per article.

## Scope

AR02A will:

1. read the AR01 article reference/image-credit registry;
2. create a verified-reference workbench entry for every article;
3. create two candidate reference slots per article;
4. define credibility, reachability, relevance, and safety review fields;
5. keep all candidate URLs empty by default;
6. keep all references pending editorial verification;
7. keep article HTML unchanged.

## Verification Dimensions

Each reference candidate will be reviewed against:

- relevance to article subject;
- source credibility;
- source type;
- reachability;
- HTTP/error status;
- spam/parked-domain risk;
- duplicate-reference risk;
- editorial decision;
- final reviewer note.

## Explicit Exclusions

AR02A does not:

- insert external links;
- verify URLs online;
- call external APIs;
- mutate article pages;
- create API routes;
- create backend code;
- connect Supabase;
- activate Auth;
- collect user data;
- deploy frontend;
- deploy backend;
- delete or move files.

## Acceptance Criteria

AR02A is complete when:

1. AR02A document exists.
2. AR02A registry exists.
3. AR02A generator exists.
4. AR02A validator exists.
5. Verified-reference workbench exists.
6. Workbench article count matches AR01 article count.
7. Every article has exactly two reference candidate slots.
8. All candidate URLs remain null.
9. All candidate decisions remain pending.
10. No article HTML is modified.
11. Backend/API/Supabase/Auth activation remains no-go.
