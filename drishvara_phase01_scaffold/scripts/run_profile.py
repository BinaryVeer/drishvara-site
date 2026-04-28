import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROFILE_FILE = ROOT / "config" / "run-profiles.json"

def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/run_profile.py <profile_name> [input_path_override]")
        sys.exit(1)

    profile_name = sys.argv[1]
    input_override = sys.argv[2] if len(sys.argv) > 2 else None

    profiles = json.loads(PROFILE_FILE.read_text(encoding="utf-8"))
    if profile_name not in profiles:
        print(f"Unknown profile: {profile_name}")
        print("Available profiles:")
        for name in profiles:
            print(f"  - {name}")
        sys.exit(1)

    profile = profiles[profile_name]
    run_mode = profile["runMode"]
    provider_stages = ",".join(profile.get("providerStages", []))
    debug_mode = "1" if profile.get("debugMode", False) else "0"
    input_path = input_override or profile["inputPath"]

    env = os.environ.copy()
    env["DRISHVARA_RUN_MODE"] = run_mode
    env["DRISHVARA_DEBUG_MODE"] = debug_mode
    env["DRISHVARA_PROVIDER_STAGES"] = provider_stages

    cmd = [
        "node",
        "--env-file=.env",
        "scripts/dev-run.js",
        "--input",
        input_path
    ]

    print("========================================")
    print("Drishvara profile launcher")
    print(f"Profile        : {profile_name}")
    print(f"Mode           : {run_mode}")
    print(f"Input          : {input_path}")
    print(f"Provider stages: {provider_stages}")
    print(f"Debug mode     : {debug_mode}")
    print("========================================")

    subprocess.run(cmd, cwd=ROOT, env=env, check=True)

if __name__ == "__main__":
    main()
