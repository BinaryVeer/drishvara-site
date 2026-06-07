# AG70C — Sanskrit Lexical Engine Data Model

AG70C creates the Sanskrit lexical engine data model required for the redesigned Word of the Day path.

## Engine model

- Morphology Engine
- Etymology Engine
- Semantics Engine
- Sacred fallback bank model
- Lexical source evidence rules
- Panchang-context to lexical input contract
- Daily Word history schema
- Subscriber archive schema

## Important rule

If etymology is not established, the system must not fabricate derivation. It must either use a safe semantic-only path after review or route selection to approved fallback banks such as Vishnu Sahasranama, Shiva Sahasranama, Vedic source terms or Puranic name/theme banks.

## Not done in AG70C

- No actual Sanskrit records created.
- No actual fallback records created.
- No daily Word output created.
- No generated/word-of-day.json replacement.
- No UI change.
- No Supabase/backend activation.
