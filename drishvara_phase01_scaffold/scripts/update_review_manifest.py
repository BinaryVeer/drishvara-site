import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REVIEW = ROOT / "review"

def build_entry(folder: Path):
    metadata_path = folder / "candidate_metadata.json"
    candidate_md = folder / "candidate.md"
    candidate_html = folder / "candidate.html"

    if not metadata_path.exists():
        return None

    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))

    return {
        "folder": folder.name,
        "topic": metadata.get("topic"),
        "candidateMarkdown": str(candidate_md.relative_to(ROOT)) if candidate_md.exists() else None,
        "candidateHtml": str(candidate_html.relative_to(ROOT)) if candidate_html.exists() else None,
        "sourceSummary": metadata.get("sourceSummary"),
        "sourceOutputDir": metadata.get("sourceOutputDir"),
        "finalStatus": metadata.get("finalStatus"),
        "revisionCount": metadata.get("revisionCount"),
        "guardStatus": metadata.get("guardStatus"),
        "runMode": metadata.get("runMode"),
        "debugMode": metadata.get("debugMode"),
        "providerStages": metadata.get("providerStages", []),
        "manifestUpdatedAt": datetime.now(timezone.utc).isoformat()
    }

def main():
    entries = []

    for folder in sorted(REVIEW.iterdir()):
        if not folder.is_dir():
            continue
        entry = build_entry(folder)
        if entry:
            entries.append(entry)

    manifest = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "totalReviewFolders": len(entries),
        "items": entries
    }

    out = REVIEW / "index.json"
    out.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"Wrote review manifest: {out}")

if __name__ == "__main__":
    main()
