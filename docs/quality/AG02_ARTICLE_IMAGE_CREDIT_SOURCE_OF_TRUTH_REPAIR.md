# AG02 — Article Image and Image-Credit Source-of-Truth Repair

Status: Targeted image/credit source-of-truth repair  
Phase: Article Governance / Source-of-Truth  
Depends on: AG01, AV02, AV01, AR02F, AR02C, AR01  
Mutation impact: Only AG01-identified image/credit gap articles  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
API impact: None  
Deployment impact: None  

## Purpose

AG02 repairs only the article image/hero gaps identified by AG01.

AG01 established the article governance source-of-truth audit and found that several article pages still use favicon/logo-like visuals, missing visuals, or broken local image paths as article hero/body visuals. AG02 consumes the AG01 audit and repairs only those identified articles.

This is not a new random image patch. It is a source-of-truth repair using AG01 as the controlling registry.

## Scope

AG02 will:

1. read AG01 audit output;
2. target only articles listed under `needs_image_or_credit_repair`;
3. preserve valid local article images;
4. preserve external images for later verification and avoid replacing them in AG02 unless AG01 marked the article as an image/credit gap;
5. insert or repair a broad article hero visual using controlled category fallback assets only for AG01-flagged image gaps;
6. preserve small Drishvara brand marks before article titles;
7. update image-credit blocks for AG02 fallback visuals;
8. preserve AR02C verified sample references;
9. preserve AR02F duplicate-reference cleanup;
10. avoid article text and reference URL changes.

## Source-of-Truth Rule

AG02 is controlled by AG01. It must not scan the repository and decide a new scope independently. The repair scope is exactly the AG01 image/credit issue bucket unless the registry is deliberately amended later.

## Category Fallback Rule

For temporary publication safety, AG02 uses controlled category fallback visuals:

- media → Media & Society;
- policy → Public Programmes;
- spiritual → Spirituality;
- sports → Sports;
- world → World Affairs.

These fallback visuals are not final article-specific images. They are safe placeholders until an article-level image-selection and attribution registry is populated in a later stage.

## Explicit Exclusions

AG02 does not:

- change article text;
- reduce or expand article word count;
- change accepted reference URLs;
- insert new reference links;
- verify external links;
- fetch external assets;
- activate backend;
- activate Supabase;
- activate Auth;
- deploy;
- delete files;
- move files.

## Acceptance Criteria

AG02 is complete when:

1. AG02 document exists.
2. AG02 registry exists.
3. AG02 applier exists.
4. AG02 validator exists.
5. AG02 image/credit registry exists.
6. AG02 apply result exists.
7. Exactly the AG01 image/credit issue bucket is targeted.
8. Every targeted article has an AG02 hero visual.
9. Every targeted article records an AG02 image-credit source.
10. Category fallback assets exist and are valid.
11. AR02C sample verified references remain preserved.
12. No reference URL is changed.
13. Article text/word count is not deliberately modified.
14. Backend/API/Supabase/Auth activation remains no-go.
