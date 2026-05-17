# AG06E — Long-Form Article Standard

## Purpose

AG06E defines the mandatory Drishvara long-form article standard for future production. It responds to the AG06A–AG06D finding that current public articles are useful as test-corpus retention candidates but are not yet final Drishvara-quality content.

AG06E is a standard-setting and governance-only layer. It does not edit current public articles, does not move scaffold outputs, does not change reference URLs, and does not activate publishing, backend, Supabase, Auth, subscriber output, or dynamic public output.

## Scope

AG06E applies to future Drishvara production articles and upgraded content packets. A future article should be treated as publish-ready only when it satisfies the following minimum standard:

- 1,500–2,200 words.
- 2–5 verified references.
- A completed visual plan.
- A primary visual with image credit or attribution.
- At least one data box, chart, graph, table, timeline, map, infographic, or structured insight box.
- Quality score of at least 85/100.
- Visitor-value score of at least 80/100.
- Review status marked as publish_ready only after all gates are passed.

## Long-Form Standard

The required article length is 1,500–2,200 words, with an ideal operating band of 1,700–2,000 words. Articles below this range must be marked as long_form_upgrade_required. Articles above this range must be reviewed for editorial compression.

## Reference Standard

Each future article must carry 2–5 verified references. References must be relevant, reachable, non-spam, non-parked, non-placeholder, and clearly connected to the article. If verification is incomplete, the article must show the reference state as under editorial verification rather than presenting the link as verified.

## Visual, Data and Infographic Standard

Each future article must include a visual plan, a primary visual, and image credit or attribution. It must also include at least one reader-value enrichment unit such as a data box, comparison table, timeline, chart, graph, map, infographic, or structured key-takeaways box.

## Quality Scoring

Publish-ready quality requires a score of at least 85/100.

Quality scoring weights:

- Depth, context and explanation: 20
- Evidence and reference integrity: 20
- Structure, narrative and flow: 15
- Originality and Drishvara voice: 10
- Visual, data and infographic value: 15
- Clarity, readability and reader guidance: 10
- Safety, rights and editorial risk: 10

## Visitor-Value Scoring

Publish-ready visitor value requires a score of at least 80/100.

Visitor-value scoring weights:

- Practical or reflective takeaway: 25
- Conceptual depth and context: 20
- Trust, evidence and source clarity: 20
- Readability and time-worthiness: 15
- Visual comprehension support: 10
- Shareability and return value: 10

## Review Status

Allowed review statuses are:

- draft
- standard_check_pending
- reference_review_pending
- visual_review_pending
- editorial_review_pending
- quality_review_pending
- publish_ready
- revision_required
- rejected
- retained_for_learning

Only publish_ready is eligible for future publication consideration.

## Publish-Readiness Gates

A future article must pass all gates recorded in `data/content-intelligence/quality-reviews/long-form-article-standard.json`, including word count, verified references, visual plan, image credit, data enrichment, quality score, visitor-value score, editorial review, accuracy/safety review, and rights/originality review.

## Explicit Exclusions

AG06E does not:

- mutate current public article HTML;
- change AG03 reference URLs;
- copy, move, delete, or publish scaffold files;
- modify CSS or JavaScript;
- activate backend, API, Auth, Supabase, subscriber, payment, admin, login, signup, or public dynamic output;
- declare any current public article final Drishvara-quality content.

## Acceptance Criteria

AG06E is acceptable only if:

- AG06E registry, document, standard, schema and preview files are present;
- word-count standard is exactly 1,500–2,200 words;
- reference standard is exactly 2–5 verified references;
- visual plan, primary visual, image credit and data-enrichment requirements are declared;
- quality-score and visitor-value-score gates are declared;
- all quality and visitor-value weights total 100 each;
- publish-readiness gates are recorded;
- no public article, reference URL, scaffold file, CSS, JavaScript, backend, Auth, Supabase or deployment mutation is performed.
