# AG60F — Reading Surface Hierarchy and Indexed Reads Activation Check

AG60F audits the Reading Surface after AG60E.

## Confirmed

- Indexed Reads fetches `data/article-index.json`.
- `data/article-index.json` contains 77 public records.
- Indexed Reads uses `publicLatest` first, then falls back to `publishedItems`, `latest`, and `items`.
- Featured Reads and Today’s Reading Guide currently depend on homepage UI data.
- Browse by Date is visible but remains a shell even though `publicByDate` exists.
- A separate AG09C single Featured Read block exists below the main reading surface and duplicates hierarchy.

## Next

AG60G — Reading Surface Hierarchy Correction Apply.
