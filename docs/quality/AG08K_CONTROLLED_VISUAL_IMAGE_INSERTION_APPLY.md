# AG08K — Controlled Visual Image Insertion Apply

## Purpose

AG08K creates a fresh backup and inserts exactly one approved AG08K-A hero visual into the selected article.

AG08K reuses the internal SVG asset finalised in AG08K-A. It does not generate a new image, call an external image API, mutate CSS/JS, change references, append JSONL records, write to database/Supabase, activate backend/Auth/Supabase or approve publishing.

## Target Article

- Path: `articles/policy/enhancing-public-healthcare-delivery-digital-innovation.html`
- Backup: `archive/ag08k-backups/enhancing-public-healthcare-delivery-digital-innovation-before-ag08k.html`
- Pre-insertion hash: `9b69660270938d4cc7f80f19764ecb55a5cf92ecd0f7e63a32d6287318838bd5`
- Post-insertion hash: `c4b7dcb2298c7ea639d6ae20581b1bced1cbd8f533d07404eb31e9c76bf94d5e`

## Inserted Visual

- Asset: `assets/articles/policy/enhancing-public-healthcare-delivery-digital-innovation/ag08ka-primary-hero.svg`
- Article src: `../../assets/articles/policy/enhancing-public-healthcare-delivery-digital-innovation/ag08ka-primary-hero.svg`
- Block ID: `ag08k-hero-visual-block`
- Marker: `AG08K-HERO-VISUAL-INSERTION`

## Layout Protection

- Hero image inserted near the top of the article.
- Main article text remains subject to justified layout doctrine.
- No table, graph or inline wrapped object is inserted in AG08K.
- AG08G references and legacy governance blocks are preserved.

## Next Stage

AG08L — Post-Visual-Insertion Audit — is required before closure.
