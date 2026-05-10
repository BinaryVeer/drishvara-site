# AG02R1 — Existing Homepage Article Visual Source Integration

Status: AG02 revision / strict source-of-truth refinement  
Phase: Article Governance / Image Source-of-Truth  
Depends on: AG02, AG01, AV02, AR02F, AR02C, AR01  
Mutation impact: AG02-targeted article hero visuals only  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
API impact: None  
Deployment impact: None  

## Purpose

AG02R1 refines AG02 by using existing homepage article-card images as article hero visuals wherever available.

AG02 safely repaired broken/logo article visuals through category fallback images. However, the homepage already contains better article-relevant card images for some published reads. AG02R1 therefore treats homepage article-card visuals as the preferred existing source-of-truth before category fallback.

## Scope

AG02R1 will:

1. read AG02 apply result;
2. parse `index.html`;
3. map article links to images only when both are inside the same homepage card/container;
4. replace AG02 category fallback hero images with matched homepage/card images;
5. retain AG02 category fallback where no strict homepage-card image match exists;
6. preserve AG02 image-credit records;
7. update credit text only for homepage/card visual replacements;
8. preserve AR02C verified sample references;
9. avoid article text and reference URL changes.

## Strict Mapping Rule

AG02R1 must not use loose nearest-image matching. An image may be mapped only if:

- the article link points to the same article path; and
- the image is found inside the same card-like container, article element, or list item; and
- the image is not favicon/logo/category-default/brand-mark; and
- the image source is already present in the repository or is already an external URL used on the current site.

## Explicit Exclusions

AG02R1 does not:

- create new images;
- fetch external images;
- change article text;
- expand or reduce article word count;
- change accepted reference URLs;
- insert new reference links;
- activate backend;
- activate Supabase;
- activate Auth;
- deploy;
- delete files;
- move files.

## Acceptance Criteria

AG02R1 is complete when:

1. AG02R1 document exists.
2. AG02R1 registry exists.
3. AG02R1 applier exists.
4. AG02R1 validator exists.
5. Article visual source map exists.
6. AG02R1 apply result exists.
7. Homepage/card visual mappings are recorded.
8. Mapped AG02 article heroes use existing homepage/card images.
9. Unmapped AG02 articles retain AG02 category fallback.
10. AR02C sample verified references remain preserved.
11. Reference URLs are not changed.
12. Article text/word-count logic is not changed.
13. Backend/API/Supabase/Auth activation remains no-go.
