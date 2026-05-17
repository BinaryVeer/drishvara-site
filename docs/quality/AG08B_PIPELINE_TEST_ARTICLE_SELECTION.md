# AG08B — Pipeline Test Article Selection

## Purpose

AG08B selects exactly one existing static article to test the repeatable article-upgrade pipeline created in AG08A.

AG08B is selection-only. It does not mutate any article, edit files, insert references, generate visuals, append JSONL records, write to database/Supabase, publish content, or activate backend/Auth/Supabase/API functionality.

## Selected Article

- Path: `articles/policy/enhancing-public-healthcare-delivery-digital-innovation.html`
- Title: `Enhancing Public Healthcare Delivery through Digital Innovation: Policy and Practical Outcomes`
- Category: `policy`
- Estimated word count: `608`
- Selection score: `99`

## Why This Article Was Selected

The selected article is an existing static article and is suitable for testing the repeatable upgrade pipeline because:

- it does not contain the AG07P pilot marker;
- it can be evaluated as an existing public article;
- it has visitor-value potential;
- it has measurable quality-gap improvement scope;
- it is safe for a future one-article controlled apply and rollback test.

## Selection Criteria Used

AG08B applied the AG08A criteria:

- visitor-value potential;
- current quality gap;
- category importance;
- static apply safety;
- reference/visual readiness;
- repeatability learning value.

## Explicit Exclusions

AG08B does not:

- generate a new article;
- mutate the selected article;
- edit files;
- create a backup;
- insert references;
- populate reference URLs;
- generate visuals;
- insert images;
- append production JSONL records;
- write to database or Supabase;
- approve publish readiness;
- publish content;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup or public dynamic output.

## Next Stage

AG08C — Article Upgrade Candidate Packet — is identified as next only with explicit approval.

AG08C should create a candidate upgrade packet for:

`articles/policy/enhancing-public-healthcare-delivery-digital-innovation.html`
