import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUTS = ROOT / "content" / "outputs"
PUBLISHED = ROOT / "published"

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def find_latest_summary():
    summaries = sorted(OUTPUTS.rglob("00_run_summary.json"), key=lambda p: p.stat().st_mtime, reverse=True)
    return summaries[0] if summaries else None

def choose_topic_folder(topic: str) -> str:
    topic_l = topic.lower()
    if "grievance" in topic_l:
        return "grievance-redressal"
    if "asset management" in topic_l:
        return "asset-management"
    return "shared"

def main():
    summary_path = find_latest_summary()
    if not summary_path:
        print("No run summary found.")
        sys.exit(1)

    summary = json.loads(summary_path.read_text(encoding="utf-8"))

    if summary.get("finalStatus") != "pass":
        print("Latest run is not publishable: finalStatus is not 'pass'.")
        sys.exit(1)

    if summary.get("debugMode") is True:
        print("Latest run is not publishable: debugMode is true.")
        sys.exit(1)

    output_dir = Path(summary["outputDir"])
    md_src = output_dir / "08_final_output.md"
    html_src = output_dir / "09_final_output.html"

    if not md_src.exists():
        print(f"Missing markdown output: {md_src}")
        sys.exit(1)

    topic = summary.get("topic", "untitled")
    topic_folder = choose_topic_folder(topic)
    target_dir = PUBLISHED / topic_folder
    target_dir.mkdir(parents=True, exist_ok=True)

    latest_md = target_dir / "latest.md"
    latest_html = target_dir / "latest.html"
    metadata_json = target_dir / "metadata.json"

    shutil.copy2(md_src, latest_md)

    if html_src.exists():
        shutil.copy2(html_src, latest_html)

    metadata = {
        "topic": topic,
        "sourceSummary": str(summary_path),
        "sourceOutputDir": str(output_dir),
        "finalStatus": summary.get("finalStatus"),
        "revisionCount": summary.get("revisionCount"),
        "guardStatus": summary.get("guardStatus"),
        "runMode": summary.get("runMode"),
        "debugMode": summary.get("debugMode"),
        "providerStages": summary.get("providerStages", []),
    }

    metadata_json.write_text(json.dumps(metadata, indent=2), encoding="utf-8")

    print("Published latest run to:")
    print(f"  {latest_md}")
    if html_src.exists():
        print(f"  {latest_html}")
    print(f"  {metadata_json}")

if __name__ == "__main__":
    main()
