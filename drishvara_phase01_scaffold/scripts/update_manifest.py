import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLISHED = ROOT / "published"

def build_entry(folder: Path):
    metadata_path = folder / "metadata.json"
    latest_md = folder / "latest.md"
    latest_html = folder / "latest.html"

    if not metadata_path.exists():
        return None

    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))

    return {
        "folder": folder.name,
        "topic": metadata.get("topic"),
        "latestMarkdown": str(latest_md.relative_to(ROOT)) if latest_md.exists() else None,
        "latestHtml": str(latest_html.relative_to(ROOT)) if latest_html.exists() else None,
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

    for folder in sorted(PUBLISHED.iterdir()):
        if not folder.is_dir():
            continue
        entry = build_entry(folder)
        if entry:
            entries.append(entry)

    manifest = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "totalPublishedFolders": len(entries),
        "items": entries
    }

    out = PUBLISHED / "index.json"
    out.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"Wrote manifest: {out}")

if __name__ == "__main__":
    main()
