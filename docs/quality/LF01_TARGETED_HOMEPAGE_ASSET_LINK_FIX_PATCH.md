# LF01 — Targeted Homepage Asset and Link Fix Patch

Status: Limited homepage reference fix patch  
Phase: LF-Live Findings  
Depends on: LF00, LR00, QA01, QA00  
Runtime impact: None  
Backend impact: None  
Public API impact: None  
Supabase impact: None  
Auth impact: None  
Deployment impact: None  
Mutation impact: Limited homepage asset/link reference correction only  

## 1. Purpose

LF01 applies a tightly controlled fix process for homepage asset and local link findings recorded by LF00.

LF01 may update `index.html` only when a missing asset or missing local page link can be safely corrected to exactly one existing non-backup, non-archive repository path.

LF01 does not delete files, move files, create new pages, create assets, alter language logic, change visual design, edit CSS/JS contents, edit SEO copy, deploy, or activate runtime/backend/API/Supabase/Auth.

## 2. Current Position

QA01 found missing local asset references and missing local page links.

LR00 recorded live-readiness as non-activation and recommended findings review.

LF00 extracted and classified findings, and recommended LF01.

LF01 is the first limited fix stage.

## 3. Limited Mutation Doctrine

LF01 may mutate only:

- `index.html` asset reference strings;
- `index.html` local link reference strings.

LF01 must not mutate:

- CSS files;
- JavaScript files;
- image files;
- sitemap;
- package runtime behavior except validation scripts;
- backend files;
- API routes;
- Supabase configuration;
- Auth configuration;
- deployment configuration.

## 4. Safe Correction Rule

A reference may be corrected only if:

1. the reference appears in LF00 findings;
2. the referenced target is missing;
3. the repository contains exactly one safe candidate with the same basename;
4. the candidate is not inside backup/archive folders;
5. the candidate filename is not a backup file;
6. the change is only a string replacement inside `index.html`;
7. the change is recorded in LF01 apply result.

If there are zero or multiple candidates, LF01 must not change the reference.

## 5. Asset Fix Rule

Missing asset references may be corrected only to an existing local asset file.

Allowed asset correction examples:

- missing image path → existing image path;
- missing stylesheet path → existing stylesheet path;
- missing script path → existing script path.

LF01 must not create or edit asset files.

## 6. Link Fix Rule

Missing local page links may be corrected only to an existing local page file.

LF01 must not create target pages in this patch.

If the intended target page does not exist, LF01 should leave the link unchanged and record it as unresolved.

## 7. Backup and Archive Rule

LF01 must not use backup/archive files as live targets.

Prohibited live targets include paths containing:

- `archive/`;
- `.backup`;
- `backup-`;
- `.bak`;
- old index backup files.

LF01 must not delete or move those files.

## 8. Post-Fix Refresh Rule

After LF01 apply step, regenerate QA00, QA01, LR00, and LF00 previews so the latest findings reflect the current homepage state.

Recommended sequence:

1. generate LF01 fix plan;
2. apply LF01 safe reference fixes;
3. regenerate QA00;
4. regenerate QA01;
5. regenerate LR00;
6. regenerate LF00;
7. validate LF01;
8. validate project.

## 9. Explicit Exclusions

LF01 does not:

- delete files;
- move files;
- clean archive folders;
- clean backup files;
- create new target pages;
- create new assets;
- edit CSS contents;
- edit JavaScript contents;
- edit language runtime logic;
- edit SEO text;
- edit sitemap;
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
- deploy frontend;
- deploy backend.

## 10. LF01 Acceptance Criteria

LF01 is complete when:

1. LF01 document exists.
2. LF01 registry exists.
3. LF01 fix plan generator exists.
4. LF01 safe apply script exists.
5. LF01 validator exists.
6. LF01 fix plan preview exists.
7. LF01 apply result exists.
8. Only safe one-candidate reference fixes are applied.
9. No file deletion, movement, backend, API, Supabase, Auth, payment, ML, deployment, or public/subscriber activation is enabled.
10. QA00, QA01, LR00, and LF00 previews are refreshed after apply.
11. validate:lf01 passes.
12. validate:findings passes.
13. validate:project passes.

## 11. LF01 Status

LF01 establishes and applies a targeted homepage asset/link reference fix patch.

LF01 does not activate runtime/backend/API/Supabase/Auth/deployment.
