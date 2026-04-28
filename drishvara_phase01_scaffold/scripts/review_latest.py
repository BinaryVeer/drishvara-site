import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUTS = ROOT / "content" / "outputs"
REVIEW = ROOT / "review"

def choose_topic_folder(topic: str) -> str:
    topic_l = topic.lower()
    if "grievance" in topic_l:
        return "grievance-redressal"
    if "asset management" in topic_l or "asset lifecycle" in topic_l or "maintenance" in topic_l:
        return "asset-management"
    return "shared"

def find_latest_summary():
    summaries = sorted(OUTPUTS.rglob("00_run_summary.json"), key=lambda p: p.stat().st_mtime, reverse=True)
    return summaries[0] if summaries else None

def main():
    summary_path = find_latest_summary()
    if not summary_path:
        print("No run summary found.")
        sys.exit(1)

    summary = json.loads(summary_path.read_text(encoding="utf-8"))

    if summary.get("finalStatus") != "pass":
        print("Latest run is not reviewable: finalStatus is not 'pass'.")
        sys.exit(1)

    if summary.get("debugMode") is True:
        print("Latest run is not reviewable: debugMode is true.")
        sys.exit(1)

    output_dir = Path(summary["outputDir"])
    md_src = output_dir / "08_final_output.md"
    html_src = output_dir / "09_final_output.html"

    if not md_src.exists():
        print(f"Missing markdown output: {md_src}")
        sys.exit(1)

    topic = summary.get("topic", "untitled")
    topic_folder = choose_topic_folder(topic)
    target_dir = REVIEW / topic_folder
    target_dir.mkdir(parents=True, exist_ok=True)

    candidate_md = target_dir / "candidate.md"
    candidate_html = target_dir / "candidate.html"
    metadata_json = target_dir / "candidate_metadata.json"

    shutil.copy2(md_src, candidate_md)
    if html_src.exists():
        shutil.copy2(html_src, candidate_html)

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

    print("Review candidate written to:")
    print(f"  {candidate_md}")
    if html_src.exists():
        print(f"  {candidate_html}")
    print(f"  {metadata_json}")

if __name__ == "__main__":
    main()
