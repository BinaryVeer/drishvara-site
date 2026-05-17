# AG06I — Visual / Data / Infographic Requirement Schema Closure

## Purpose

AG06I closes the dedicated visual, data and infographic requirement schema for future Drishvara long-form Featured Reads.

This stage translates the transition-handbook requirement of visual intelligence into a formal governance standard. It defines what future long-form content packets must plan before they can move toward production.

AG06I does not generate visual assets, hero images, charts, maps, diagrams or infographics. It does not mutate public articles, CSS, JavaScript, references, scaffold outputs, backend, Auth, Supabase, API routes or publishing state.

## Inputs

AG06I consumes:

- AG06H-R1 Content Intelligence Foundation Alignment Review.
- AG06E Long-Form Article Standard.
- AG06H Batch 01 Content Packet Upgrade Planning.
- AG06B Content Packet Schema.

## Mandatory Visual Standard

Every future long-form Drishvara Featured Read must plan:

- one primary hero visual;
- image credit or attribution;
- alt-text plan;
- caption or context plan;
- mobile-safe layout expectation;
- at least one structured visual/data unit.

Accepted structured visual/data units include:

- data box;
- comparison table;
- timeline;
- concept diagram;
- flowchart;
- chart or graph;
- map or spatial view;
- infographic;
- structured key-takeaways box.

## Visual Quality Requirements

Future visual planning must record:

- visual intent;
- reader value;
- source or data basis;
- rights or credit status;
- alt-text plan;
- caption/context plan;
- mobile-safe layout expectation;
- generation status;
- review status.

## Visual Quality Scoring

AG06I defines a future visual quality score but does not perform scoring.

The publish-ready threshold is 80/100.

Scoring weights:

- Relevance to article argument: 20
- Reader comprehension value: 20
- Evidence or source basis: 15
- Rights, credit and attribution readiness: 15
- Mobile layout safety: 10
- Accessibility, alt text and caption plan: 10
- Originality and Drishvara visual voice: 10

## Publish-Readiness Gates

AG06I records gates for future visual readiness:

- primary hero visual planned;
- primary hero visual credit or attribution planned;
- primary hero visual alt text planned;
- at least one structured visual or data unit planned;
- visual source or data basis recorded;
- rights/credit review pending or passed;
- mobile-safe layout expectation recorded;
- visual quality score planned;
- no visual asset generation in AG06I;
- no public article mutation in AG06I.

## Explicit Exclusions

AG06I does not:

- generate hero visuals;
- generate infographics;
- generate charts, maps, diagrams or visual assets;
- edit current public article HTML;
- modify CSS or JavaScript;
- insert, populate or change reference URLs;
- copy, move, delete, import or publish scaffold files;
- generate article rewrites;
- generate upgraded content packets;
- assign final quality or visitor-value scores;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup or public dynamic output;
- mark any existing public article as final Drishvara-quality content.

## Acceptance Criteria

AG06I is acceptable only if:

- AG06H-R1, AG06E, AG06H and AG06B inputs are present;
- the primary hero visual requirement is defined;
- the structured visual/data-unit requirement is defined;
- image credit/attribution, alt-text, caption/context and mobile-safe layout requirements are defined;
- allowed visual and data enrichment types are recorded;
- visual quality scoring weights total 100;
- publish-readiness gates are recorded;
- package scripts for generate:ag06i and validate:ag06i are present;
- validate:project includes validate:ag06i;
- no visual generation, public article mutation, reference change, CSS/JS mutation, scaffold import, backend/Auth/Supabase activation or publishing is performed.

## Next Stage

The next stage is AG06J — Reference and Source Credibility Schema Closure.
