# AG06J — Reference and Source Credibility Schema Closure

## Purpose

AG06J closes the dedicated reference and source credibility schema for future Drishvara long-form Featured Reads.

This stage defines how future content packets must record candidate sources, approved references, rejected references, source credibility, link health, review trail and publish-readiness gates.

AG06J does not fetch URLs, populate candidate URLs, approve actual URLs, insert references, mutate public article HTML, generate content packets, import scaffold outputs, publish content, or activate backend/Auth/Supabase/API functionality.

## Inputs

AG06J consumes:

- AG06H-R1 Content Intelligence Foundation Alignment Review.
- AG06E Long-Form Article Standard.
- AG06I Visual/Data/Infographic Requirement Schema Closure.
- AG06B Content Packet Schema.

## Reference Standard

Every future long-form Drishvara Featured Read must plan:

- a candidate reference pool;
- approved reference records;
- rejected reference records with reason;
- source type classification;
- credibility tier classification;
- link-health review status;
- source quality review;
- claim or section supported by each reference;
- final publish-readiness gates.

The long-form standard remains 2-5 verified references per article.

## Source Type Taxonomy

AG06J defines source families including:

- official government or public institution;
- peer-reviewed or academic source;
- recognized institutional report;
- credible data/statistics source;
- reputable news or wire source;
- primary document or original material;
- domain expert or explainer;
- classical or traditional text reference;
- brand or commercial source;
- user-generated or social media source;
- weak or disallowed source.

## Credibility Tiers

AG06J defines these tiers:

- preferred;
- accepted;
- conditional;
- restricted;
- rejected.

Restricted and rejected sources cannot be treated as approved public references unless a later review stage explicitly records a limited exception.

## Link Health and Rejection Rules

Future references must record reachability, relevance, credibility, link health, spam/parked-domain checks and rejection reasons.

Rejected source reasons include broken links, parked domains, weak credibility, irrelevance, outdatedness, duplicate-of-stronger-source, missing author/publisher and better primary source availability.

## Source Quality Scoring

AG06J defines future source quality scoring but does not perform scoring.

The publish-ready threshold is 85/100.

Scoring weights:

- Relevance to claim or article: 20
- Source authority and institutional credibility: 20
- Reachability and link health: 15
- Factual specificity and traceability: 15
- Independence and source diversity: 10
- Recency or timelessness fit: 10
- Reader accessibility and non-spam safety: 5
- Citation completeness metadata: 5

## Publish-Readiness Gates

AG06J records gates for future reference readiness:

- candidate reference pool planned;
- minimum approved reference count met;
- source type recorded for each reference;
- credibility tier recorded for each reference;
- claim or section supported recorded;
- link-health review pending or passed;
- approved and rejected source trail recorded;
- source quality score planned;
- no web fetching by script in AG06J;
- no reference insertion in AG06J;
- no public article mutation in AG06J.

## Explicit Exclusions

AG06J does not:

- fetch URLs;
- test live links;
- populate candidate reference URLs;
- approve actual URLs;
- insert, populate or change reference URLs in public articles;
- mutate current public article HTML;
- modify CSS or JavaScript;
- copy, move, delete, import or publish scaffold files;
- generate article rewrites;
- generate upgraded content packets;
- assign final quality or visitor-value scores;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup or public dynamic output;
- mark any existing public article as final Drishvara-quality content.

## Acceptance Criteria

AG06J is acceptable only if:

- AG06H-R1, AG06E, AG06I and AG06B inputs are present;
- 2-5 verified reference rule is carried forward;
- candidate, approved and rejected reference structures are defined;
- source type taxonomy is recorded;
- credibility tiers are recorded;
- lifecycle statuses are recorded;
- rejection reasons are recorded;
- link-health statuses are recorded;
- source quality scoring weights total 100;
- publish-readiness gates are recorded;
- package scripts for generate:ag06j and validate:ag06j are present;
- validate:project includes validate:ag06j;
- no web fetch, reference URL population, reference insertion, public article mutation, CSS/JS mutation, scaffold import, content generation, backend/Auth/Supabase activation or publishing is performed.

## Next Stage

The next stage is AG06K — JSONL-first Content Intelligence Store Governance.
