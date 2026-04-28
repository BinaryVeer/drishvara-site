import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()

def count_json_files(folder: Path) -> int:
    if not folder.exists():
        return 0
    return len([p for p in folder.glob("*.json") if p.is_file()])

def latest_file(folder: Path, pattern: str):
    if not folder.exists():
        return None
    matches = list(folder.rglob(pattern))
    if not matches:
        return None
    matches.sort(key=lambda p: p.stat().st_mtime, reverse=True)
    return str(matches[0].relative_to(ROOT))

queue_pending = ROOT / "queue" / "pending"
queue_processed = ROOT / "queue" / "processed"
queue_failed = ROOT / "queue" / "failed"

review_root = ROOT / "review"
review_archive = review_root / "archive"
review_rejected = review_root / "rejected"

published_root = ROOT / "published"
outputs_root = ROOT / "content" / "outputs"

review_index = review_root / "index.json"
published_index = published_root / "index.json"

status = {
    "generatedAt": datetime.now(timezone.utc).isoformat(),
    "queue": {
        "pendingCount": count_json_files(queue_pending),
        "processedCount": count_json_files(queue_processed),
        "failedCount": count_json_files(queue_failed),
        "latestPending": latest_file(queue_pending, "*.json"),
        "latestProcessed": latest_file(queue_processed, "*.json"),
        "latestFailed": latest_file(queue_failed, "*.json"),
    },
    "review": {
        "activeCandidateFolders": 0,
        "archivedCount": 0,
        "rejectedCount": 0,
        "reviewIndexPath": str(review_index.relative_to(ROOT)) if review_index.exists() else None,
    },
    "published": {
        "publishedFolders": 0,
        "publishedIndexPath": str(published_index.relative_to(ROOT)) if published_index.exists() else None,
    },
    "outputs": {
        "latestRunSummary": latest_file(outputs_root, "00_run_summary.json"),
    }
}

if review_root.exists():
    active = 0
    for child in review_root.iterdir():
        if child.is_dir() and child.name not in {"archive", "rejected"}:
            if (child / "candidate_metadata.json").exists():
                active += 1
    status["review"]["activeCandidateFolders"] = active

if review_archive.exists():
    for child in review_archive.glob("*"):
        if child.is_dir():
            status["review"]["archivedCount"] += len([p for p in child.iterdir() if p.is_file() and p.name != ".gitkeep"])

if review_rejected.exists():
    for child in review_rejected.glob("*"):
        if child.is_dir():
            status["review"]["rejectedCount"] += len([p for p in child.iterdir() if p.is_file() and p.name != ".gitkeep"])

if published_index.exists():
    try:
        data = json.loads(published_index.read_text(encoding="utf-8"))
        status["published"]["publishedFolders"] = len(data.get("items", []))
    except Exception:
        pass

out = ROOT / "ops" / "status.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(status, indent=2), encoding="utf-8")
print(f"Wrote ops status: {out}")
