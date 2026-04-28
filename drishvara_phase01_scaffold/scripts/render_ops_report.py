import json
from pathlib import Path

ROOT = Path.cwd()
OPS = ROOT / "ops" / "status.json"
REVIEW = ROOT / "review" / "index.json"
PUBLISHED = ROOT / "published" / "index.json"

def read_json(path: Path):
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))

ops = read_json(OPS)
review = read_json(REVIEW)
published = read_json(PUBLISHED)

lines = []
lines.append("# Drishvara Operator Report")
lines.append("")
lines.append(f"- Generated at: {ops.get('generatedAt', 'unknown')}")
lines.append("")

queue = ops.get("queue", {})
lines.append("## Queue")
lines.append(f"- Pending: {queue.get('pendingCount', 0)}")
lines.append(f"- Processed: {queue.get('processedCount', 0)}")
lines.append(f"- Failed: {queue.get('failedCount', 0)}")
lines.append(f"- Latest processed: {queue.get('latestProcessed')}")
lines.append("")

review_ops = ops.get("review", {})
lines.append("## Review")
lines.append(f"- Active candidate folders: {review_ops.get('activeCandidateFolders', 0)}")
lines.append(f"- Archived files: {review_ops.get('archivedCount', 0)}")
lines.append(f"- Rejected files: {review_ops.get('rejectedCount', 0)}")
lines.append("")

review_items = review.get("items", [])
if review_items:
    lines.append("### Current review candidates")
    for item in review_items:
        lines.append(f"- {item.get('folder')}: {item.get('topic')}")
    lines.append("")

pub_ops = ops.get("published", {})
lines.append("## Published")
lines.append(f"- Published folders: {pub_ops.get('publishedFolders', 0)}")
lines.append("")

pub_items = published.get("items", [])
if pub_items:
    lines.append("### Published topics")
    for item in pub_items:
        lines.append(f"- {item.get('folder')}: {item.get('topic')}")
    lines.append("")

outputs = ops.get("outputs", {})
lines.append("## Latest output")
lines.append(f"- Latest run summary: {outputs.get('latestRunSummary')}")
lines.append("")

out = ROOT / "ops" / "report.md"
out.write_text("\n".join(lines), encoding="utf-8")
print(f"Wrote report: {out}")
