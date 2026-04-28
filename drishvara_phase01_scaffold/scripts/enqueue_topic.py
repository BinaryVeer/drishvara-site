import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PENDING = ROOT / "queue" / "pending"

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def main():
    if len(sys.argv) < 2:
        print('Usage: python scripts/enqueue_topic.py "<topic text>"')
        sys.exit(1)

    topic = sys.argv[1].strip()
    if not topic:
        print("Topic cannot be empty.")
        sys.exit(1)

    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    slug = slugify(topic)[:80]
    filename = f"{ts}__{slug}.json"

    payload = {
        "topic": topic,
        "contentType": "article",
        "audience": "government and implementation stakeholders",
        "objective": "Produce a structured, publishable Drishvara article from queued topic input"
    }

    out = PENDING / filename
    out.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Queued topic file: {out}")

if __name__ == "__main__":
    main()
