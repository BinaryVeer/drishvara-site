
## Post-Apply Note — Trigger Idempotency

During manual apply, Supabase may report that an `updated_at` trigger already exists if the migration was partially applied earlier. The local migration has therefore been patched with `drop trigger if exists ...` guards before trigger creation. This does not drop tables or data; it only makes trigger recreation safe.
