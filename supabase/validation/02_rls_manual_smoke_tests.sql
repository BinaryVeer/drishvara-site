-- Drishvara Activation Stage 01B
-- Manual RLS smoke-test template
-- Run only after Supabase Auth is enabled and a test authenticated user is available.
-- Do not run in production without understanding the target user context.

-- Important:
-- Supabase SQL Editor runs with elevated privileges and may bypass normal client RLS behavior.
-- For real RLS testing, use Supabase client as an authenticated test user.
-- This file documents expected tests.

-- Test A: Anonymous insert should fail from public client.
-- Target table examples:
-- public.user_submissions
-- public.palmistry_requests
-- public.feedback_submissions

-- Expected:
-- Anonymous insert must fail or be blocked by RLS/policy.

-- Test B: Authenticated user can insert own user_submissions row when consent_to_process = true.
-- Example payload shape for future client/server test:
-- {
--   user_id: auth.uid(),
--   submission_type: 'general_question',
--   preferred_language: 'en',
--   question_or_story: 'Test submission',
--   consent_to_process: true
-- }

-- Expected:
-- Insert succeeds only when user_id = auth.uid() and consent_to_process = true.

-- Test C: Authenticated user cannot insert user_submissions without consent_to_process = true.
-- Expected:
-- Insert fails due to check constraint or RLS policy.

-- Test D: Authenticated user cannot read another user's records.
-- Expected:
-- Select returns only own rows.

-- Test E: Palmistry request cannot use public URL path for image_storage_path.
-- Example invalid:
-- image_storage_path = 'https://example.com/palm.jpg'
-- Expected:
-- Insert/update fails due to palm_image_private_path_only constraint.

-- Test F: Subscriber guidance defaults remain blocked.
-- Expected:
-- public_display_allowed = false
-- subscriber_display_allowed = false
-- review_status = 'under_review'
