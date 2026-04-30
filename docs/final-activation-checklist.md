# Drishvara Final Activation Checklist

## Purpose

This checklist must be completed before enabling live Supabase, Auth, subscription payments, palm image upload, premium guidance, live sports API, or public Panchang/Vedic output.

## 1. Repository Freeze

- Confirm `main` is clean except `archive/`.
- Confirm latest pre-activation audit passes.
- Confirm all generated noise files are restored or intentionally committed.
- Confirm no temporary secrets are present in repo.
- Confirm all scaffold pages are noindex where required.

## 2. Supabase Database Activation

Deferred action:
- Apply migration only after review.

Checklist:
- Review `supabase/migrations/20260430_b20a_subscriber_backend_schema.sql`.
- Apply migration using Supabase SQL Editor or `supabase db push`.
- Confirm tables exist.
- Confirm RLS is enabled.
- Test authenticated user insert/select.
- Test rejected anonymous insert.
- Confirm service role key is not exposed client-side.

## 3. Auth Activation

Checklist:
- Configure Supabase Auth.
- Configure redirect URLs for local and production.
- Add login/logout UI.
- Add session detection.
- Add protected route checks.
- Add subscriber dashboard access check.

## 4. Subscription Activation

Checklist:
- Select provider.
- Finalize plan prices.
- Finalize terms/refund policy.
- Configure provider-hosted checkout.
- Configure webhook endpoint.
- Verify webhook signatures.
- Update `subscriptions` table only server-side.
- Test active, past_due, cancelled, and expired flows.

## 5. Submission Backend Activation

Checklist:
- Enable backend intake only after Auth and RLS test.
- Enforce consent.
- Add abuse prevention/rate limiting.
- Store all submissions as pending review.
- Do not auto-publish or auto-use submissions in Knowledge Vault.

## 6. Palm Image Upload Activation

Checklist:
- Create private Supabase Storage bucket.
- Block public URLs.
- Add explicit image consent.
- Add deletion request mechanism.
- Add MIME and file-size validation.
- Add admin review workflow.
- Keep medical/lifespan/deterministic claims blocked.

## 7. Knowledge Vault Activation

Checklist:
- Review source registry.
- Review Panchang calculation method.
- Review mantra policy.
- Review Vedic guidance rules.
- Review numerology rules.
- Review palmistry interpretation limits.
- Keep monthly update day as 10th of every month.
- Run knowledge preflight after every update.

## 8. Premium Guidance Activation

Checklist:
- Require login.
- Require active subscription.
- Require consent.
- Require approved Knowledge Vault rules.
- Require reviewed Panchang/calculation method where relevant.
- Keep deterministic outcome claims blocked.
- Cache output in `subscriber_daily_guidance`.

## 9. Admin Review Activation

Checklist:
- Add protected admin login.
- Add reviewer/admin role.
- Add service-role server route.
- Add audit log.
- Add queue views.
- Keep destructive actions protected.
- Do not expose service role client-side.

## 10. SEO and Public Launch

Checklist:
- Rebuild sitemap.
- Confirm robots.txt.
- Confirm canonical links.
- Confirm article Open Graph/Twitter metadata.
- Submit sitemap to Google Search Console only after content and domain readiness.
- Confirm public pages load on `https://www.drishvara.com`.

## Final Go/No-Go Rule

No live activation should proceed unless:
- `npm run preactivation:preflight` passes.
- `npm run content:preflight` passes.
- repo status is clean except `archive/`.
- all secrets are outside repo.
- production environment variables are reviewed.
