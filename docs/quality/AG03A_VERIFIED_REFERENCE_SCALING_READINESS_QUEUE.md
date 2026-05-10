# AG03A — Verified Reference Scaling Readiness Queue

Status: Queue/planning-only reference scaling stage  
Phase: Article Governance / Verified References  
Depends on: AR02A, AR02B, AR02C, AR02F, AG01R1, AG02R2  
Mutation impact: None  
Article HTML impact: None  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
API impact: None  
Deployment impact: None  

## Purpose

AG03A creates the readiness queue for scaling verified references to the remaining articles.

The current reference system is already established through AR01 and AR02A–AR02F. AG03A does not create a new reference system. It uses the existing AR02 workbench and AG01R1 audit to identify articles that still do not have two public verified references.

## Scope

AG03A will:

1. read AG01R1 article governance refresh audit;
2. read AR02A verified-reference workbench;
3. read AR02B sample verified references;
4. identify articles missing two public verified references;
5. exclude the five AR02B/AR02C sample articles already carrying accepted public references;
6. create deterministic reference-scaling batches;
7. preserve AR02 verification rules;
8. keep all entries pending candidate population;
9. avoid article HTML mutation;
10. avoid external fetching.

## Explicit Exclusions

AG03A does not:

- insert reference links;
- change article HTML;
- change article text;
- change images or image credits;
- fetch or verify external URLs;
- approve references;
- activate backend;
- activate Supabase;
- activate Auth;
- deploy;
- delete files;
- move files.

## Acceptance Criteria

AG03A is complete when:

1. AG03A document exists.
2. AG03A registry exists.
3. AG03A generator exists.
4. AG03A validator exists.
5. Reference scaling queue output exists.
6. Preview output exists.
7. Queue count matches AG01R1 missing-reference count.
8. AR02B sample articles are excluded from the remaining queue.
9. Batches are created deterministically.
10. All queue entries remain pending candidate population.
11. No reference URLs are inserted.
12. No article HTML mutation is performed.
13. Runtime/backend/Supabase/Auth/API activation remains no-go.

## Recommended Follow-up

After AG03A is reviewed, proceed to AG03B batch-wise candidate population. AG03B should populate verified reference candidates for only the first controlled batch, not all 72 articles in one mutation.
