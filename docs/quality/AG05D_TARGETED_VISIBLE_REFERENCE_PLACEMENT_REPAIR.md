# AG05D — Targeted Visible Reference Placement Repair

Status: Targeted article HTML repair  
Phase: Public Page / Live-Readiness / Visible Reference Governance  
Depends on: AG05C, AG05B, AG05A, AG04Z, AG03Z  
Mutation impact: Targeted article HTML only  
CSS impact: None  
JavaScript impact: None  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
Deployment impact: None  

## Purpose

AG05D repairs the visible article reference presentation issue recorded under AG05C.

AG05C confirmed that verified AG03 references exist in the source and live HTML, but the reader-visible article surface still exposes older “Under editorial verification” placeholder references. AG05D ensures that verified AG03 references are visible before article footer/back links and removes obsolete placeholder reference blocks where verified AG03 references exist.

## Scope

AG05D will:

1. read AG05C manual review result;
2. read AG03Z closure audit;
3. process AG03-covered article pages only;
4. preserve existing AG03 reference URLs and anchor tags;
5. remove obsolete “Under editorial verification” placeholder reference sections only where verified AG03 links exist;
6. place a visible verified-reference block before article footer/back links;
7. preserve article visuals, credits, reading width and AG03 link counts;
8. avoid backend/Auth/Supabase/API activation.

## Explicit Exclusions

AG05D does not:

- change reference URLs;
- create new reference candidates;
- fetch external URLs;
- modify homepage;
- modify CSS;
- modify JavaScript;
- modify images;
- activate backend;
- activate Supabase;
- activate Auth;
- deploy;
- delete files;
- move files.

## Acceptance Criteria

AG05D is complete when:

1. AG05D document exists.
2. AG05D registry exists.
3. AG05D apply script exists.
4. AG05D validator exists.
5. Apply result exists.
6. Preview output exists.
7. At least one article with verified AG03 links is repaired.
8. Every repaired article retains exactly two AG03 reference links.
9. Existing AG03 reference URLs are unchanged.
10. Obsolete visible placeholder reference sections are removed where AG03 links exist.
11. Verified AG03 references appear before article footer/back links where such links exist.
12. No CSS/JS/image/backend/Auth/Supabase mutation is performed.
13. AG05E post-repair audit is identified as the next stage.
