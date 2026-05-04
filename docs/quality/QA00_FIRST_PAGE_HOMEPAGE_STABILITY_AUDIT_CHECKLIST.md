# QA00 — First Page / Homepage Stability Audit Checklist

Status: Quality assurance / homepage stability audit checklist only  
Phase: QA-Quality Assurance  
Depends on: ID02, ID01, ID00, IR00  
Runtime impact: None  
Backend impact: None  
Public API impact: None  
Supabase impact: None  
Auth impact: None  
Mutation impact: None  

## 1. Purpose

QA00 defines the first controlled stability audit for Drishvara’s first page / homepage.

QA00 does not modify homepage HTML, CSS, JavaScript, images, SEO metadata, language logic, Vercel deployment settings, backend, Supabase, Auth, API routes, public output, subscriber output, ML, embeddings, or content files.

QA00 creates a checklist and static local scan preview only.

## 2. Current Position

ID02 completed API route contract design without route creation and recommended QA00.

The current safe direction is homepage stability audit, not backend activation.

## 3. Homepage Stability Doctrine

The first page should be checked for:

- visual stability;
- language toggle stability;
- hero/logo/orbit positioning;
- mobile responsiveness;
- desktop responsiveness;
- asset loading;
- JavaScript console stability;
- broken link risk;
- SEO/meta presence;
- accessibility basics;
- live deployment consistency.

QA00 does not correct issues. It records the audit structure.

## 4. Audit Scope

QA00 covers only:

- index.html;
- homepage-linked local CSS/JS/assets;
- first-page visual behavior;
- language toggle behavior;
- static first-page links;
- basic SEO/meta tags;
- first-page mobile/desktop checks;
- first-page deployment smoke-test checklist.

QA00 does not audit backend, Supabase, Auth, payment, subscriber features, or API runtime.

## 5. Language Toggle Audit

The language toggle must be tested for:

- English click keeps English;
- repeated English click keeps English;
- Hindi click keeps Hindi;
- repeated Hindi click keeps Hindi;
- clicking normal homepage areas does not change language;
- returning from Hindi to English does not produce transliteration fallback such as drstih vistirna;
- hero meaning line remains controlled in both languages.

QA00 does not edit language files.

## 6. Hero Visual Audit

The hero/first impression must be checked for:

- logo position;
- orbit alignment;
- text overlap;
- button visibility;
- tagline readability;
- mobile hero fit;
- desktop hero balance;
- no unexpected duplicate text;
- no unwanted language flicker.

QA00 does not edit hero layout.

## 7. Asset Loading Audit

The homepage must be checked for:

- missing image assets;
- missing CSS files;
- missing JavaScript files;
- broken local paths;
- excessive backup-file references;
- large unused visual assets;
- hero image/logo availability.

QA00 does not delete or move files.

## 8. Link and Navigation Audit

The first page must be checked for:

- primary navigation links;
- article/read links;
- CTA links;
- internal anchor links;
- external links if any;
- footer links if any.

QA00 does not change links.

## 9. SEO and Metadata Audit

The first page must be checked for:

- title tag;
- meta description;
- viewport tag;
- canonical link if applicable;
- Open Graph title;
- Open Graph description;
- Open Graph image;
- favicon references;
- basic indexing safety.

QA00 does not change SEO metadata.

## 10. Responsive Audit

The first page must be checked at minimum for:

- desktop width;
- tablet width;
- mobile width;
- small mobile width;
- portrait orientation;
- landscape orientation if possible.

QA00 does not change CSS.

## 11. Console and Runtime Audit

The first page must be checked in browser developer tools for:

- JavaScript errors;
- missing file errors;
- console warnings caused by missing references;
- language-toggle runtime errors;
- animation/runtime layout issues.

QA00 does not add runtime code.

## 12. Live Deployment Audit

Live page should be checked after deployment for:

- GitHub main push success;
- Vercel deployment success if applicable;
- live homepage opens;
- live assets load;
- language toggle works on live;
- no cached old language behavior;
- mobile live rendering works;
- console is clean enough for first-page launch.

QA00 does not deploy.

## 13. Audit Status Levels

Allowed audit status values:

- not_checked;
- pass;
- warning;
- fail;
- blocked;
- not_applicable.

QA00 defaults items to not_checked unless a safe static scan can infer a preliminary status.

## 14. Static Scan Boundary

QA00 may perform a local static scan of `index.html`.

The scan may record:

- file presence;
- linked local assets;
- missing local assets;
- title/meta presence;
- script references;
- stylesheet references;
- image references;
- anchor href references.

The scan must not mutate files.

## 15. Explicit Exclusions

QA00 does not:

- edit index.html;
- edit CSS;
- edit JavaScript;
- edit assets;
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
- deploy backend.

## 16. QA00 Acceptance Criteria

QA00 is complete when:

1. QA00 document exists.
2. QA00 registry exists.
3. QA00 preview generator exists.
4. QA00 validator exists.
5. QA00 audit preview output exists.
6. Homepage audit checklist is declared.
7. Static scan boundary is declared.
8. Language toggle audit is declared.
9. Hero visual audit is declared.
10. Asset/link/SEO/responsive/live audit areas are declared.
11. No homepage mutation, asset mutation, API route, backend, Supabase, Auth, payment, ML, public output, or subscriber output is enabled.
12. validate:qa00 passes.
13. validate:qa passes.
14. validate:project passes.

## 17. QA00 Status

QA00 establishes the First Page / Homepage Stability Audit Checklist.

QA00 does not activate runtime/backend/API/Supabase/Auth or mutate homepage files.
