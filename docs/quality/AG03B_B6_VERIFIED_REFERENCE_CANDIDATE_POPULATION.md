# AG03B-B6 — Verified Reference Candidate Population: Batch 6

Status: Candidate-population stage only  
Phase: Article Governance / Verified References  
Depends on: AG03D-B5, AG03C-B5, AG03B-B5-R1, AG03B-B5, AG03A  
Mutation impact: Candidate registry only  
Article HTML impact: None  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
API impact: None  
Deployment impact: None  

## Purpose

AG03B-B6 populates verified reference candidates for Batch 6 of the AG03A reference-scaling queue, as authorized by AG03D-B5.

AG03B-B6 does not insert links into article HTML. It records two candidate references per Batch 6 article for later review and approval.

## Scope

AG03B-B6 will:

1. read AG03A Batch 6;
2. read AG03D-B5 authorization;
3. populate exactly two reference candidates per Batch 6 article;
4. use a curated institutional / academic / public-interest source bank based on article title and category;
5. keep article HTML untouched;
6. keep all candidates pending article insertion;
7. avoid backend, Supabase, Auth and API activation.

## Source Selection Rule

AG03B-B6 uses official, institutional, multilateral, academic, research, policy-think-tank or major public-interest sources. Sources that are weak, spam-like, parked, duplicate-within-article, irrelevant, or unreachable are not accepted.

## Explicit Exclusions

AG03B-B6 does not:

- insert reference links into articles;
- modify article HTML;
- modify article text;
- modify images or image credits;
- approve public insertion;
- activate backend;
- activate Supabase;
- activate Auth;
- deploy;
- delete files;
- move files.

## Acceptance Criteria

AG03B-B6 is complete when:

1. AG03B-B6 document exists.
2. AG03B-B6 registry exists.
3. AG03B-B6 generator exists.
4. AG03B-B6 validator exists.
5. Batch 6 candidate registry exists.
6. Preview output exists.
7. Exactly 12 Batch 6 articles are populated.
8. Exactly 24 candidate reference URLs are recorded.
9. Each article has exactly two candidate references.
10. No duplicate URL appears within the same article.
11. All candidates are marked pending article insertion.
12. Article HTML remains untouched.
13. Reference URL insertion remains false.
14. Runtime/backend/Supabase/Auth/API activation remains no-go.
