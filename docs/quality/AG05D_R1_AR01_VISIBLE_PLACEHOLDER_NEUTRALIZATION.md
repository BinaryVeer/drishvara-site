# AG05D-R1 — AR01 Visible Placeholder Neutralization

Status: Targeted article HTML repair  
Phase: Public Page / Live-Readiness / Visible Reference Governance  
Depends on: AG05E, AG05D, AG05C, AG03Z  
Mutation impact: Targeted article HTML only  

## Purpose

AG05D-R1 neutralizes older AR01 placeholder reference elements that remain visible after AG05D.

AG05D correctly inserted/repositioned verified AG03 references into the visible reader surface, but live/local checks show the older AR01 text — “Reference 1: Under editorial verification” and “Reference 2: Under editorial verification” — still present in the reader flow. AG05D-R1 hides only those AR01 placeholder elements/containers where AG05D verified references already exist.

## Scope

AG05D-R1 will:

1. read AG05D apply result;
2. process only AG05D processed article pages;
3. preserve verified AG03 links and URLs;
4. preserve the AG05D visible reference block;
5. neutralize AR01 “Under editorial verification” reference placeholders;
6. avoid CSS, JS, homepage, backend, Auth, Supabase and deployment changes.

## Explicit Exclusions

AG05D-R1 does not change reference URLs, create references, fetch external URLs, modify CSS/JS/images/homepage, activate backend/Auth/Supabase, deploy, delete files or move files.

## Acceptance Criteria

AG05D-R1 is complete when all 72 processed articles retain two AG03 links, retain one AG05D visible block, preserve URLs, and have zero visible AR01 placeholder reference elements.
