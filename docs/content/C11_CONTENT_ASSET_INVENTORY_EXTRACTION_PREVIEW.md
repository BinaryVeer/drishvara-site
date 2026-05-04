# Content Stage C11 — Content Asset Inventory Extraction Preview

Status: Content governance / read-only preview  
Phase: C-Content Governance  
Depends on: C01 through C10, I00  
Runtime impact: None  
Subscriber impact: None  
Public API impact: None  
ML impact: None  

## 1. Purpose

C11 creates a read-only content asset inventory extraction preview from existing Drishvara static content data.

C11 reads existing static files and produces a separate preview report.

C11 does not mutate article files, article index, homepage featured reads, sitemap, image registry, article quality metadata, review queues, Supabase, Auth, payment, admin workflows, public output, ML ingestion, embeddings, model training, or vector database records.

## 2. Source Files

C11 may read:

- data/article-index.json
- data/homepage-ui.json
- data/seo/site-metadata.json

If a source file is missing or has an unfamiliar shape, C11 must report the issue safely in the preview output.

## 3. Output File

C11 may write only this preview output:

- data/content/content-asset-inventory-preview.json

This is not a live registry.

This is not the final content asset registry.

This is not an ML dataset.

## 4. Relationship with C10

C10 defines the asset registry and ML eligibility governance.

C11 performs a first safe extraction preview against existing static files.

C11 must preserve C10 defaults:

- ML-training eligibility is false;
- embedding eligibility is false;
- public display is not newly authorized by C11;
- registry write remains disabled;
- Supabase remains disabled;
- mutation remains disabled.

## 5. Extraction Doctrine

C11 extraction is read-only from source data.

C11 may extract candidate article assets with:

- asset_id;
- asset_type;
- title;
- article_path;
- canonical_url;
- category;
- language;
- summary_status;
- image_status;
- homepage_featured_status;
- seo_presence_status;
- source_hint;
- public_safe_status;
- ml_training_eligible;
- embedding_eligible;
- next_action.

C11 must use conservative defaults for unknown data.

## 6. Homepage Featured Read Preview Doctrine

C11 may identify whether a candidate article appears in homepage featured reads.

This is an observation only.

C11 must not modify homepage featured reads.

## 7. SEO Metadata Preview Doctrine

C11 may compare available article counts or URLs against SEO metadata where available.

This is an observation only.

C11 must not modify SEO metadata or sitemap.

## 8. Image Preview Doctrine

C11 may record whether an article appears to have an image, image URL, or image reference.

This is an observation only.

C11 must not download images, validate remote image availability, replace images, or write image registry records.

## 9. Eligibility Default Doctrine

Every extracted candidate must default to:

- ml_training_eligible: false
- embedding_eligible: false
- registry_write_allowed: false

Eligibility can only change in a later reviewed module after source, rights, quality, privacy, duplicate, and reviewer approval checks.

## 10. Duplicate Preview Doctrine

C11 may record duplicate candidate hints, such as repeated paths, repeated titles, or repeated URLs.

C11 does not resolve duplicates.

C11 does not select canonical assets.

## 11. Quality Preview Doctrine

C11 may create quality hints such as:

- title_present;
- summary_present;
- path_present;
- category_present;
- image_present;
- homepage_featured;
- seo_reference_present.

These are preliminary hints only.

They are not editorial approval.

## 12. Safety Doctrine

C11 must not create a public-facing claim that assets are approved, verified, public-safe, ML-ready, or embedding-ready.

C11 must label the output as preview-only.

## 13. Explicit Exclusions

C11 does not:

- mutate articles;
- mutate data/article-index.json;
- mutate data/homepage-ui.json;
- mutate data/seo/site-metadata.json;
- mutate sitemap;
- write final content asset registry;
- write image asset registry;
- write verified link registry;
- activate review queues;
- activate admin review;
- activate manual override;
- activate selection memory;
- activate Supabase;
- activate Auth;
- activate payment;
- fetch external APIs;
- crawl links;
- download images;
- generate embeddings;
- train models;
- write vector database records;
- activate public output;
- activate subscriber output.

## 14. C11 Acceptance Criteria

C11 is complete when:

1. C11 document exists.
2. C11 registry exists.
3. C11 generator exists.
4. C11 validator exists.
5. C11 preview output exists.
6. Preview output is marked preview-only.
7. Source file read status is recorded.
8. Candidate article assets are extracted where available.
9. ML-training eligibility defaults to false.
10. Embedding eligibility defaults to false.
11. Registry write remains disabled.
12. Mutation and runtime flags remain disabled.
13. validate:c11 passes.
14. validate:content passes.
15. validate:project passes.

## 15. C11 Status

C11 establishes Content Asset Inventory Extraction Preview.

C11 does not create a live registry, ingest ML data, or activate runtime.
