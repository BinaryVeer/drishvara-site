# Supabase Migration Review Checklist

## Migration File

- [ ] supabase/migrations/20260430_b20a_subscriber_backend_schema.sql exists.
- [ ] Migration creates exactly the intended seven tables.
- [ ] Migration references auth.users(id).
- [ ] Migration enables pgcrypto.
- [ ] Migration defines public.set_updated_at() trigger function.

## Table Review

- [ ] subscriber_profiles
- [ ] subscriptions
- [ ] subscriber_daily_guidance
- [ ] user_submissions
- [ ] feedback_submissions
- [ ] palmistry_requests
- [ ] knowledge_update_reviews

## Safety Review

- [ ] RLS enabled on all user/backend tables.
- [ ] Anonymous public insert is not enabled.
- [ ] Service role is not used in frontend.
- [ ] Palm image path cannot be public URL.
- [ ] Consent is enforced for user submissions.
- [ ] Consent is enforced for palmistry requests.
- [ ] Subscriber guidance defaults to non-public.
- [ ] Subscriber display defaults to disabled.
- [ ] Monthly Knowledge Vault review day remains 10.

## Post-Apply Manual Tests

- [ ] Anonymous insert fails.
- [ ] Authenticated own select works.
- [ ] Authenticated own insert works where policy allows.
- [ ] Cross-user select fails.
- [ ] Palm image public URL constraint works.
