# AV01 — Article Visual Fallback and Broad Justified Reading Width Standardisation Patch

Status: Article template consistency patch  
Phase: Article UI / Long-form Reading Experience  
Depends on: AR02F, AR02C, AR01  
Mutation impact: Static article pages, article router page, article default assets  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
API impact: None  
Deployment impact: None  

## Purpose

AV01 standardises Drishvara article pages for long-form reading and fixes the article visual fallback issue.

The intended Drishvara article format is long-form, often 1200+ words. Therefore, the reading width must be broader than a narrow blog column, and paragraph text should be justified for a formal editorial presentation.

AV01 also prevents the large Drishvara logo from being used as the article hero visual where no article image has been finalised. In such cases, a category-level default visual is used instead.

## Scope

AV01 will:

1. add category-level article fallback visuals under `assets/article-defaults/`;
2. standardise broad article reading width across direct article pages and the `article.html?path=...` routed view;
3. justify article body paragraphs;
4. preserve existing AR02C / AR02F accepted reference links;
5. preserve AR01 / AR02C image-credit blocks;
6. replace oversized logo/favicons used as article body visuals with category fallback visuals;
7. keep backend/Auth/Supabase/API disabled.

## Reading Width Rule

The article reading area should be broad enough for long-form articles:

- outer article shell: up to approximately 1240px;
- reading panel/body: up to approximately 1120px;
- paragraph text: justified;
- line-height preserved for readability;
- mobile view remains responsive.

## Visual Fallback Rule

If an article has a proper content image, it is preserved.

If an article is using the Drishvara logo/favicon/mark as the article hero or article body visual, AV01 replaces that visual with the appropriate category fallback:

- media → media visual;
- policy/public programmes → policy visual;
- spiritual → spiritual visual;
- sports → sports visual;
- world affairs → world visual.

## Explicit Exclusions

AV01 does not:

- change article text;
- reduce article word count;
- change minimum article length rules;
- change AR02C reference URLs;
- change AR02F cleanup result;
- insert new reference links;
- fetch external assets;
- create API routes;
- connect Supabase;
- activate Auth;
- collect user data;
- deploy frontend;
- deploy backend;
- delete or move files.

## Acceptance Criteria

AV01 is complete when:

1. AV01 document exists.
2. AV01 registry exists.
3. AV01 applier exists.
4. AV01 preview generator exists.
5. AV01 validator exists.
6. AV01 apply result exists.
7. AV01 preview exists.
8. Category fallback assets exist.
9. Direct article pages contain AV01 style marker.
10. `article.html` contains AV01 router style/script marker.
11. Broad reading width rules are present.
12. Paragraph justification rules are present.
13. Oversized logo fallback is suppressed/replaced in checked sample pages.
14. AR02C sample pages still preserve exactly two accepted reference links.
15. Backend/API/Supabase/Auth activation remains no-go.
