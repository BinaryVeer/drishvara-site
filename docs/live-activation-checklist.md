# Drishvara Live Activation Checklist

These actions are intentionally deferred until the final activation stage.

## Database

- Review Supabase migration.
- Apply migration using Supabase SQL Editor or `supabase db push`.
- Verify all Row Level Security policies.
- Test inserts/selects with a real authenticated test user.
- Confirm service role is not exposed client-side.

## Authentication

- Configure Supabase Auth.
- Configure allowed redirect URLs.
- Add login/logout UI.
- Add session detection.
- Add subscriber gate.

## Subscription

- Select payment provider.
- Define plan codes.
- Connect webhook lifecycle.
- Update `subscriptions` table based on payment events.
- Test active, cancelled, expired, and past_due states.

## Submissions

- Enable backend submission storage only after abuse prevention.
- Keep palm image upload disabled until private storage is ready.
- Verify consent checkbox enforcement.

## Palm Image Upload

- Create private Supabase Storage bucket.
- Block public URLs.
- Add deletion request mechanism.
- Add file size and MIME validation.
- Add explicit consent and purpose limitation.

## Premium Guidance

- Do not enable subscriber guidance until:
  - Knowledge Vault rules are approved.
  - Panchang calculation method is reviewed.
  - Mantra policy is approved.
  - Subscriber profile consent exists.
  - Guidance preflight passes.

## External Services

- Add live sports API only after provider selection.
- Submit sitemap after final SEO check.
- Configure Vercel environment variables.
