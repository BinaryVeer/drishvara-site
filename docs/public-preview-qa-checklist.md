# Drishvara Public Preview QA Checklist

## Purpose

This checklist validates Drishvara for controlled public preview before live activation of Supabase, Auth, payments, palm image upload, premium guidance, live Panchang/Vedic output, or admin backend actions.

## Public Pages to Check

- Homepage: `index.html`
- Insights archive: `insights.html`
- Article reader: `article.html`
- Submissions page: `submissions.html`
- Subscriber dashboard scaffold: `dashboard.html`
- Admin review scaffold: `admin.html`
- Sitemap: `sitemap.xml`
- Robots: `robots.txt`

## Visual QA

- Homepage layout is stable.
- Compact IST timezone dropdown appears in top navigation.
- No large timezone card appears inside the homepage body.
- Sports live object does not claim fake live score.
- Featured Reads show images and open article pages.
- Article reader has readable width, justified paragraphs, and correct image.
- Hindi/English toggle works on key surfaces.
- Submissions page clearly says backend intake is disabled.
- Dashboard clearly says login/subscription integration is pending.
- Admin page clearly says admin actions are disabled.

## Safety QA

Must remain disabled:

- Supabase live browser insert
- Anonymous backend write
- Payment provider
- Payment webhook
- Palm image upload
- Premium guidance output
- Public Panchang/Vedic guidance
- Admin backend actions
- Service role exposure in frontend

## SEO QA

- `robots.txt` exists.
- `sitemap.xml` exists.
- Canonical tags exist on core pages.
- Open Graph and Twitter card tags exist on core pages.
- Admin and dashboard scaffold pages remain `noindex`.

## Go/No-Go Rule

Public preview can proceed only if:

- `npm run public-preview:preflight` passes.
- `npm run preactivation:preflight` passes.
- `npm run content:preflight` passes.
- Repo is clean except `archive/`.
