# Supabase Auth/Login Checklist

## Before Live Auth

- [ ] Supabase project is confirmed.
- [ ] Supabase migration is either applied or intentionally deferred.
- [ ] Redirect URLs are finalized.
- [ ] Login method is selected.
- [ ] Email OTP / magic link settings are reviewed.
- [ ] Signup policy is decided: public signup or invite-only.
- [ ] Frontend does not contain service role key.
- [ ] Dashboard still blocks premium guidance by default.
- [ ] Payment gate remains disabled.
- [ ] Palm image upload remains disabled.
- [ ] Admin actions remain disabled.

## Redirect URLs

Local:

- [ ] http://localhost:5173/login.html
- [ ] http://localhost:5173/dashboard.html

Production:

- [ ] https://www.drishvara.com/login.html
- [ ] https://www.drishvara.com/dashboard.html

## Future Auth Client Checks

- [ ] Reads Supabase URL from public env only.
- [ ] Reads anon public key only.
- [ ] Never reads service role key.
- [ ] Detects active session.
- [ ] Supports logout.
- [ ] Handles expired session.
- [ ] Handles missing profile row.
- [ ] Handles inactive subscription.
- [ ] Shows blocked state instead of premium output.

## Dashboard Gate Checks

- [ ] Anonymous user sees login prompt.
- [ ] Logged-in free user sees free/dashboard shell.
- [ ] Active subscriber sees subscriber dashboard shell.
- [ ] Premium guidance remains blocked unless consent + approved rules exist.
- [ ] Admin role is not inferred from email alone.

## No-Go Conditions

Do not enable live Auth if:

- Service role key appears in frontend.
- Redirect URLs are uncertain.
- Supabase project/environment is uncertain.
- RLS has not been reviewed.
- Dashboard still assumes premium access without subscription.
- You cannot test login/logout locally.
