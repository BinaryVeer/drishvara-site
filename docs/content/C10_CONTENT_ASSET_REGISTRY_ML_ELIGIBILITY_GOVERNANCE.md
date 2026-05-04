# Content Stage C10 — Content Asset Registry & ML Eligibility Governance

Status: Content governance / schema only  
Phase: C-Content Governance  
Depends on: C01 through C09, I00  
Runtime impact: None  
Subscriber impact: None  
Public API impact: None  
ML impact: None  

## 1. Purpose

C10 defines the governance structure for Drishvara’s content asset registry and future ML eligibility.

C10 covers completed articles, published works, images, pictures, verified links, source records, rights status, public-safe status, article versioning, ML-training eligibility, embedding eligibility, and future reuse permission.

C10 does not ingest assets into ML. It does not create embeddings. It does not train models. It does not mutate articles, homepage featured reads, sitemap, image registry, article quality metadata, selection memory, Supabase, Auth, payment, admin workflows, or public output.

## 2. Core Position

Drishvara already has a static/public-preview article system and C01 through C09 content governance.

C10 does not restart content work from zero.

C10 creates the governance layer needed before any content asset can be reused for ML, embeddings, recommendation, personalization, search, or future automated generation.

## 3. Relationship with Earlier Content Stages

C10 inherits:

- C01 public read link and image integrity protection;
- C02 editorial featured-read governance;
- C03 featured-read override and selection memory scaffold;
- C04 featured-read scoring and rotation preview;
- C05 image registry and source governance scaffold;
- C06 article URL, slug, and sitemap governance;
- C07 article quality metadata and editorial review scaffold;
- C08 read-only article quality report preview;
- C09 consolidated content governance status matrix.

C10 must not weaken any of these guardrails.

## 4. Relationship with I00

I00 records C10 as the next content-specific module.

I00 also blocks ML ingestion, Auth, Supabase, payment, API routes, public output, subscriber output, dashboard cards, and live calculation.

C10 must remain inside that boundary.

## 5. Explicit Exclusions

C10 does not:

- mutate article files;
- mutate data/article-index.json;
- mutate data/homepage-ui.json;
- mutate sitemap;
- write image registry records;
- write article quality metadata;
- write review queue records;
- activate manual featured-read override;
- activate selection memory;
- activate Supabase reads or writes;
- activate Auth;
- activate payment;
- activate admin review;
- fetch external APIs;
- crawl live links;
- download images;
- create embeddings;
- train models;
- start ML ingestion;
- create vector database records;
- expose subscriber output;
- expose public dynamic output.

## 6. Asset Class Doctrine

C10 recognizes these future asset classes:

- article;
- published_work;
- image;
- generated_image;
- verified_link;
- reference_link;
- article_series;
- draft_article;
- archived_article;
- source_record;
- visual_asset;
- external_reference.

Every future asset must be classified before reuse.

## 7. Asset Status Doctrine

Each future asset should have a status:

- draft;
- generated;
- under_review;
- approved_public;
- published;
- archived;
- rejected;
- needs_revision;
- internal_only;
- reference_only;
- deprecated.

Public display and ML eligibility must not be assumed from asset existence.

## 8. Source and Rights Doctrine

Every future reusable asset should preserve source and rights information.

Required source/rights fields:

- source_type;
- source_name;
- source_url;
- author_or_creator;
- generator_or_tool_if_applicable;
- license_status;
- usage_permission;
- attribution_required;
- credit_line;
- rights_review_status;
- reuse_allowed;
- commercial_use_allowed;
- ml_use_allowed;
- embedding_use_allowed.

Unknown rights must block ML use.

## 9. Public-Safe Doctrine

An asset may be saved but not public-safe.

Public-safe status values:

- public_safe;
- internal_only;
- needs_review;
- sensitive;
- rights_unclear;
- source_unclear;
- quality_insufficient;
- duplicate_or_near_duplicate;
- blocked.

Only public_safe assets may be considered for public display.

## 10. ML Eligibility Doctrine

ML eligibility is stricter than public safety.

An asset may be public-safe but still not ML-eligible.

ML-training eligibility requires:

- source status reviewed;
- rights status reviewed;
- usage permission reviewed;
- quality status reviewed;
- duplicate or near-duplicate status reviewed;
- public-safe status reviewed;
- reviewer approval;
- no privacy issue;
- no restricted source;
- no unclear generated-content rights.

Default ML eligibility is false.

## 11. Embedding Eligibility Doctrine

Embedding eligibility must be separately tracked.

An asset may be allowed for search embeddings but not allowed for model training.

Embedding eligibility requires:

- public-safe status;
- rights status reviewed;
- source status reviewed;
- quality status acceptable;
- privacy risk cleared;
- duplicate handling completed;
- reviewer approval.

Default embedding eligibility is false.

## 12. Article Asset Registry Doctrine

Future article registry entries should include:

- asset_id;
- asset_type;
- title;
- slug;
- article_path;
- canonical_url;
- category;
- language;
- hindi_readiness;
- summary_status;
- body_status;
- publication_status;
- editorial_review_status;
- quality_status;
- source_status;
- rights_status;
- image_asset_refs;
- verified_link_refs;
- public_safe_status;
- ml_training_eligible;
- embedding_eligible;
- reviewer_note;
- version;
- next_action.

## 13. Image Asset Registry Doctrine

Future image registry entries should include:

- asset_id;
- asset_type;
- image_url_or_path;
- source_url;
- provider;
- creator;
- license_status;
- credit_line;
- alt_text;
- category;
- usage_purpose;
- approval_status;
- duplicate_use_status;
- article_refs;
- public_safe_status;
- ml_training_eligible;
- embedding_eligible;
- reviewer_note.

## 14. Verified Link Registry Doctrine

Future verified link entries should include:

- link_id;
- url;
- title;
- source_name;
- source_type;
- related_article_refs;
- verification_status;
- last_checked_at;
- citation_use_allowed;
- reuse_allowed;
- public_display_allowed;
- ml_training_eligible;
- embedding_eligible;
- reviewer_note.

C10 does not crawl or verify live URLs.

## 15. Versioning Doctrine

Future assets should be versioned.

Version records should preserve:

- version_id;
- asset_id;
- version_number;
- change_type;
- previous_version_ref;
- change_summary;
- reviewer;
- approval_status;
- rollback_note;
- timestamp.

Versioning must prevent accidental overwrite of final/public content.

## 16. Duplicate and Near-Duplicate Doctrine

Before ML or recommendation use, assets should be checked for duplication.

Duplicate status values:

- unchecked;
- unique;
- exact_duplicate;
- near_duplicate;
- canonical_selected;
- archive_duplicate;
- needs_human_review.

Near-duplicate clusters should have one canonical asset.

## 17. Quality Status Doctrine

Future quality status values:

- unchecked;
- basic_ready;
- editorial_ready;
- needs_revision;
- source_needs_review;
- image_needs_review;
- hindi_needs_review;
- duplicate_needs_review;
- approved_for_public;
- approved_for_embedding;
- approved_for_ml_training;
- blocked.

Quality approval must be explicit.

## 18. Registry Write Doctrine

C10 does not write item-level registry records.

A future C11 or implementation module may create actual content asset inventory records after approval.

C10 only defines the registry structure and eligibility rules.

## 19. ML Use Separation Doctrine

C10 separates:

- saved asset;
- verified asset;
- public-safe asset;
- embedding-eligible asset;
- ML-training-eligible asset.

These statuses must not be collapsed.

## 20. Future Data Files

Future implementation may create:

- data/content/content-asset-registry.json;
- data/content/image-asset-registry.json;
- data/content/verified-link-registry.json;
- data/content/content-asset-version-history.json;
- data/content/content-asset-ml-eligibility-report.json.

C10 does not create live item-level versions of these files.

## 21. Safety Doctrine

C10 must preserve:

- source-first discipline;
- public-safe review;
- rights and license review;
- privacy protection;
- no unauthorized scraping;
- no hidden ML use;
- no automatic training;
- no automatic embedding;
- no automatic public display;
- human review requirement.

## 22. C10 Acceptance Criteria

C10 is complete when:

1. C10 document exists.
2. C10 registry exists.
3. C10 validator exists.
4. Asset classes are declared.
5. Asset statuses are declared.
6. Source and rights doctrine is declared.
7. Public-safe doctrine is declared.
8. ML eligibility doctrine is declared.
9. Embedding eligibility doctrine is declared.
10. Article asset registry fields are declared.
11. Image asset registry fields are declared.
12. Verified link registry fields are declared.
13. Versioning doctrine is declared.
14. Duplicate and near-duplicate doctrine is declared.
15. Quality status doctrine is declared.
16. Registry write remains disabled.
17. ML ingestion and embedding generation remain disabled.
18. validate:c10 passes.
19. validate:content passes.
20. validate:project passes.

## 23. C10 Status

C10 establishes Content Asset Registry & ML Eligibility Governance.

C10 does not ingest, mutate, publish, embed, train, or activate runtime.
