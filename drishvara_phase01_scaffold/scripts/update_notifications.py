import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
REVIEW_INDEX = ROOT / "review" / "index.json"
FAIL_DIR = ROOT / "queue" / "failed"
NOTIFY_REVIEW = ROOT / "notifications" / "review_ready"
NOTIFY_FAIL = ROOT / "notifications" / "failures"

def read_json(path: Path):
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))

def write_notice(path: Path, lines):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")

review = read_json(REVIEW_INDEX)
items = review.get("items", [])

review_notice = NOTIFY_REVIEW / "latest_review_notice.txt"
if items:
    latest = items[0]
    write_notice(review_notice, [
        f"generatedAt: {datetime.now(timezone.utc).isoformat()}",
        "type: review_ready",
        f"folder: {latest.get('folder')}",
        f"topic: {latest.get('topic')}",
        f"candidateMarkdown: {latest.get('candidateMarkdown')}",
        f"candidateHtml: {latest.get('candidateHtml')}",
    ])
else:
    if review_notice.exists():
        review_notice.unlink()

failed_items = sorted(
    [p for p in FAIL_DIR.glob("*.json") if p.is_file()],
    key=lambda p: p.stat().st_mtime,
    reverse=True
)

fail_notice = NOTIFY_FAIL / "latest_failure_notice.txt"
if failed_items:
    latest_fail = failed_items[0]
    write_notice(fail_notice, [
        f"generatedAt: {datetime.now(timezone.utc).isoformat()}",
        "type: queue_failure",
        f"file: {latest_fail.relative_to(ROOT)}",
    ])
else:
    if fail_notice.exists():
        fail_notice.unlink()

print("Updated notification files.")
