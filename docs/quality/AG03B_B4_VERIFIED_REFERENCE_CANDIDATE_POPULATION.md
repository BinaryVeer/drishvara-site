# AG03B-B4 — Verified Reference Candidate Population: Batch 4

Status: Candidate-population stage only  
Phase: Article Governance / Verified References  
Depends on: AG03D-B3, AG03C-B3, AG03B-B3-R1, AG03B-B3, AG03A  
Mutation impact: Candidate registry only  
Article HTML impact: None  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
API impact: None  
Deployment impact: None  

## Purpose

AG03B-B4 populates verified reference candidates for Batch 4 of the AG03A reference-scaling queue, as authorized by AG03D-B3.

AG03B-B4 does not insert links into article HTML. It only records two candidate references per Batch 4 article, with credibility, relevance and reachability notes. Article insertion must be handled later through AG03C-B4 after review and approval.

## Scope

AG03B-B4 will:

1. read AG03A Batch 4;
2. read AG03D-B3 authorization;
3. populate exactly two verified-reference candidates per Batch 4 article;
4. record source type, publisher, title, URL, credibility note and relevance note;
5. keep article HTML untouched;
6. keep all populated candidates pending article insertion;
7. avoid backend, Supabase, Auth and API activation.

## Source Selection Rule

AG03B-B4 uses official, institutional, multilateral, academic, research or major public-interest sources. Sources that are weak, spam-like, parked, duplicate-within-article, irrelevant, or unreachable are not accepted.

## Explicit Exclusions

AG03B-B4 does not:

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

AG03B-B4 is complete when:

1. AG03B-B4 document exists.
2. AG03B-B4 registry exists.
3. AG03B-B4 generator exists.
4. AG03B-B4 validator exists.
5. Batch 4 candidate registry exists.
6. Preview output exists.
7. Exactly 12 Batch 4 articles are populated.
8. Exactly 24 candidate reference URLs are recorded.
9. Each article has exactly two candidate references.
10. No duplicate URL appears within the same article.
11. All candidates are marked pending article insertion.
12. Article HTML remains untouched.
13. Reference URL insertion remains false.
14. Runtime/backend/Supabase/Auth/API activation remains no-go.
