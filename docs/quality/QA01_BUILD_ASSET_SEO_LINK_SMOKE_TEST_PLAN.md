# QA01 — Build, Asset, SEO, and Link Smoke Test Plan

Status: Quality assurance / smoke-test planning and static preview only  
Phase: QA-Quality Assurance  
Depends on: QA00, ID02, IR00  
Runtime impact: None  
Backend impact: None  
Public API impact: None  
Supabase impact: None  
Auth impact: None  
Mutation impact: None  

## 1. Purpose

QA01 defines Drishvara’s build, asset, SEO, and link smoke-test plan.

QA01 does not edit homepage HTML, CSS, JavaScript, images, SEO metadata, sitemap, language runtime, backup files, archive files, deployment settings, backend, Supabase, Auth, API routes, public output, subscriber output, ML, embeddings, or content files.

QA01 creates a smoke-test plan and static smoke preview only.

## 2. Current Position

QA00 completed the first-page/homepage stability audit checklist.

QA00 reported a static scan finding: missing local asset references may exist and should be reviewed in QA01.

QA01 continues quality assurance only.

## 3. Smoke Test Doctrine

A smoke test is a quick confidence check before live-readiness review.

QA01 checks whether the repository appears ready for:

- build command review;
- first-page asset review;
- SEO/meta review;
- local link review;
- script/style reference review;
- static deployment readiness review.

QA01 does not run deployment.

## 4. Build Smoke Test Plan

Build smoke testing should check:

- package.json exists;
- npm scripts are present;
- validation scripts exist;
- build script exists if applicable;
- no backend activation script is required for static homepage;
- no secret/env file is required for homepage build;
- validate:project passes before live-readiness review.

QA01 does not create build commands.

## 5. Asset Smoke Test Plan

Asset smoke testing should check:

- CSS references;
- JavaScript references;
- image references;
- hero asset references;
- favicon/OG image references;
- missing local asset references;
- backup-file references accidentally used by homepage;
- large visual assets that may affect first-page load.

QA01 does not move, delete, compress, or replace assets.

## 6. SEO Smoke Test Plan

SEO smoke testing should check:

- title tag;
- meta description;
- viewport;
- canonical link if applicable;
- Open Graph title;
- Open Graph description;
- Open Graph image;
- favicon;
- language tags if applicable;
- no accidental noindex unless intended.

QA01 does not edit SEO metadata.

## 7. Link Smoke Test Plan

Link smoke testing should check:

- local anchor links;
- local page links;
- article links;
- CTA links;
- navigation links;
- footer links;
- external links if any;
- mail/tel links if any.

QA01 does not change links.

## 8. Language Runtime Smoke Test Plan

Language smoke testing should check:

- language scripts are referenced;
- language scripts resolve locally;
- no duplicate conflicting language runtime script is referenced;
- language click behavior remains sticky;
- normal homepage click does not change language;
- Hindi-to-English return does not show transliteration fallback.

QA01 does not edit language runtime.

## 9. Console Smoke Test Plan

Manual browser console smoke test should check:

- no critical JavaScript error on first load;
- no missing CSS/JS/image request that breaks hero;
- language toggle does not throw error;
- animation/orbit code does not throw error;
- no hydration/runtime error if static.

QA01 does not execute browser automation.

## 10. Static Deployment Smoke Test Plan

Before live-readiness review, verify:

- GitHub main is pushed;
- deployment provider receives latest commit;
- live page opens;
- live assets load;
- live language toggle works;
- cached old language behavior is not appearing;
- mobile rendering is acceptable;
- live console is clean enough.

QA01 does not deploy.

## 11. Smoke Status Levels

Allowed smoke status values:

- pass;
- warning;
- fail;
- blocked;
- not_checked;
- not_applicable.

Static scan may infer a preliminary status.

Manual checks remain not_checked.

## 12. Static Smoke Preview Boundary

QA01 may perform a local static scan of:

- index.html;
- package.json;
- local CSS references;
- local JavaScript references;
- local image references;
- local anchor references;
- basic SEO/meta tags.

The scan must not mutate files.

## 13. Treatment of Missing Asset References

Missing local asset references should be treated as smoke-test findings.

A missing local asset reference is not automatically a blocker unless it affects:

- hero display;
- logo display;
- critical CSS;
- critical JavaScript;
- favicon/OG image;
- language runtime.

QA01 records findings. Later correction must be done through a separate explicit fix patch.

## 14. Explicit Exclusions

QA01 does not:

- edit index.html;
- edit CSS;
- edit JavaScript;
- edit images;
- edit SEO metadata;
- edit sitemap;
- edit language runtime;
- delete backup files;
- move archive files;
- change gitignore;
- create API routes;
- create backend code;
- connect Supabase;
- activate Auth;
- activate payment;
- activate admin;
- activate public dynamic output;
- activate subscriber output;
- generate embeddings;
- train models;
- fetch external APIs;
- deploy backend;
- deploy frontend.

## 15. QA01 Acceptance Criteria

QA01 is complete when:

1. QA01 document exists.
2. QA01 registry exists.
3. QA01 smoke preview generator exists.
4. QA01 validator exists.
5. QA01 smoke preview output exists.
6. Build smoke test plan is declared.
7. Asset smoke test plan is declared.
8. SEO smoke test plan is declared.
9. Link smoke test plan is declared.
10. Language runtime smoke test plan is declared.
11. Static smoke scan boundary is declared.
12. Missing asset references are recorded as findings, not silently corrected.
13. No homepage mutation, asset mutation, SEO mutation, language mutation, backend, API, Supabase, Auth, payment, ML, public output, subscriber output, or deployment is enabled.
14. validate:qa01 passes.
15. validate:qa passes.
16. validate:project passes.

## 16. QA01 Status

QA01 establishes the Build, Asset, SEO, and Link Smoke Test Plan.

QA01 does not activate runtime/backend/API/Supabase/Auth or mutate homepage files.
