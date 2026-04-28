import os
import sys

required = [
    "OPENAI_API_KEY",
    "OPENAI_MODEL",
    "DRISHVARA_RUN_MODE",
    "DRISHVARA_DEBUG_MODE",
    "NODE_ENV",
    "DRISHVARA_ENV",
    "DRISHVARA_OUTPUT_ROOT",
    "DRISHVARA_PUBLISH_ENABLED",
    "DRISHVARA_LOG_LEVEL",
]

optional = [
    "DRISHVARA_PROVIDER_STAGES",
]

missing = [k for k in required if not os.getenv(k)]
present_optional = [k for k in optional if os.getenv(k)]

print("========================================")
print("Drishvara Environment Validation")
print("========================================")

if missing:
    print("Missing required variables:")
    for key in missing:
        print(f"  - {key}")
else:
    print("All required variables are present.")

print("\nOptional variables present:")
if present_optional:
    for key in present_optional:
        print(f"  - {key}")
else:
    print("  (none)")

print("\nResolved values snapshot:")
for key in required + optional:
    value = os.getenv(key)
    if not value:
        print(f"{key}=<missing>")
    elif "KEY" in key:
        print(f"{key}=<set>")
    else:
        print(f"{key}={value}")

print("========================================")

sys.exit(1 if missing else 0)
