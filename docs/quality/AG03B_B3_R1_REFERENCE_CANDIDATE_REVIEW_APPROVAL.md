# AG03B-B3-R1 — Batch 3 Reference Candidate Review and Approval Record

Status: Review/approval record only  
Phase: Article Governance / Verified References  
Depends on: AG03B-B3, AG03D-B2, AG03C-B2, AG03A  
Mutation impact: Approval registry only  
Article HTML impact: None  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
API impact: None  
Deployment impact: None  

## Purpose

AG03B-B3-R1 records review approval for AG03B-B3 Batch 3 verified reference candidates.

AG03B-B3 populated two verified reference candidates for each of the 12 Batch 3 articles but deliberately kept all candidates pending article insertion. AG03B-B3-R1 records that the candidates may be used by the next insertion stage.

## Scope

AG03B-B3-R1 will:

1. read AG03B-B3 candidate registry;
2. create an approval record for the 12 Batch 3 articles;
3. approve exactly two references per article for later insertion;
4. keep article HTML untouched;
5. keep reference insertion disabled;
6. preserve runtime/backend/Supabase/Auth/API no-go status.

## Explicit Exclusions

AG03B-B3-R1 does not:

- insert reference links into article pages;
- modify article HTML;
- modify article text;
- modify images or image credits;
- fetch external URLs;
- activate backend;
- activate Supabase;
- activate Auth;
- deploy;
- delete files;
- move files.

## Acceptance Criteria

AG03B-B3-R1 is complete when:

1. AG03B-B3-R1 document exists.
2. AG03B-B3-R1 registry exists.
3. AG03B-B3-R1 generator exists.
4. AG03B-B3-R1 validator exists.
5. Approval record exists.
6. Preview output exists.
7. Exactly 12 Batch 3 articles are approved.
8. Exactly 24 references are approved.
9. Each article has exactly two approved references.
10. No article HTML mutation is performed.
11. Reference insertion remains false.
12. Runtime/backend/Supabase/Auth/API activation remains no-go.
