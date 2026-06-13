#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
PORT="$(python3 - <<'PYPORT'
import socket
sock = socket.socket()
sock.bind(("127.0.0.1", 0))
print(sock.getsockname()[1])
sock.close()
PYPORT
)"
DEBUG_PORT="$(python3 - <<'PYPORT'
import socket
sock = socket.socket()
sock.bind(("127.0.0.1", 0))
print(sock.getsockname()[1])
sock.close()
PYPORT
)"

cleanup() {
  if [ -n "${CHROME_PID:-}" ]; then
    kill -TERM "$CHROME_PID" >/dev/null 2>&1 || true
    sleep 0.5
    kill -KILL "$CHROME_PID" >/dev/null 2>&1 || true
    wait "$CHROME_PID" >/dev/null 2>&1 || true
  fi
  if [ -n "${SERVER_PID:-}" ]; then
    kill -TERM "$SERVER_PID" >/dev/null 2>&1 || true
    wait "$SERVER_PID" >/dev/null 2>&1 || true
  fi
  rm -rf "$TMP"
}
trap cleanup EXIT

CHROME=""
for candidate in \
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  "/Applications/Chromium.app/Contents/MacOS/Chromium" \
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
do
  if [ -x "$candidate" ]; then
    CHROME="$candidate"
    break
  fi
done

if [ -z "$CHROME" ]; then
  echo "❌ AG74I browser QA requires Google Chrome, Chromium or Microsoft Edge."
  exit 1
fi

cd "$ROOT"
python3 -m http.server "$PORT" --bind 127.0.0.1 >"$TMP/server.log" 2>&1 &
SERVER_PID=$!

python3 - <<PYWAIT
import socket
import time
port = int("$PORT")
for _ in range(100):
    try:
        with socket.create_connection(("127.0.0.1", port), timeout=0.2):
            raise SystemExit(0)
    except OSError:
        time.sleep(0.1)
raise SystemExit("AG74I local QA server did not start")
PYWAIT

QA_URL="http://127.0.0.1:$PORT/scripts/ag74i-panchang-browser-qa.html"

echo "▶ Running AG74I browser interaction QA through Chrome DevTools Protocol..."

"$CHROME" \
  --headless=new \
  --disable-gpu \
  --disable-dev-shm-usage \
  --disable-extensions \
  --disable-background-networking \
  --disable-component-update \
  --disable-default-apps \
  --disable-sync \
  --no-first-run \
  --no-default-browser-check \
  --metrics-recording-only \
  --remote-debugging-port="$DEBUG_PORT" \
  --user-data-dir="$TMP/chrome-profile" \
  "$QA_URL" \
  >"$TMP/chrome.stdout.log" \
  2>"$TMP/chrome.log" &
CHROME_PID=$!

DEVTOOLS_READY=0
for _ in $(seq 1 200); do
  if curl -fsS "http://127.0.0.1:$DEBUG_PORT/json/list" \
      > "$TMP/devtools-targets.json" 2>/dev/null; then
    if grep -q "ag74i-panchang-browser-qa.html" "$TMP/devtools-targets.json"; then
      DEVTOOLS_READY=1
      break
    fi
  fi

  if ! kill -0 "$CHROME_PID" >/dev/null 2>&1; then
    break
  fi

  sleep 0.1
done

if [ "$DEVTOOLS_READY" -ne 1 ]; then
  echo "❌ AG74I Chrome DevTools target did not become ready."
  echo "--- Chrome log ---"
  tail -80 "$TMP/chrome.log" || true
  echo "--- Server log ---"
  tail -80 "$TMP/server.log" || true
  exit 1
fi

cat > "$TMP/ag74i-cdp-qa-probe.mjs" <<'NODECDP'
import fs from "node:fs";
import path from "node:path";

const targetsPath = process.argv[2];
const outputPath = process.argv[3];
const timelinePath = process.argv[4];

if (!targetsPath || !outputPath || !timelinePath) {
  console.error("Usage: node ag74i-cdp-qa-probe.mjs <targets> <report> <timeline>");
  process.exit(1);
}

const targets = JSON.parse(fs.readFileSync(targetsPath, "utf8"));
const target = targets.find((item) =>
  item.type === "page" && /ag74i-panchang-browser-qa\.html/.test(item.url || "")
) || targets.find((item) => item.type === "page");

if (!target || !target.webSocketDebuggerUrl) {
  console.error("❌ No AG74I page DevTools target was found.");
  process.exit(1);
}

if (typeof WebSocket !== "function") {
  console.error("❌ This Node.js runtime does not expose the WebSocket API required for CDP QA.");
  process.exit(1);
}

const socket = new WebSocket(target.webSocketDebuggerUrl);
let nextId = 1;
const pending = new Map();

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function send(method, params = {}) {
  const id = nextId++;
  socket.send(JSON.stringify({ id, method, params }));

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      if (!pending.has(id)) return;
      pending.delete(id);
      reject(new Error("CDP command timed out: " + method));
    }, 5000);

    pending.set(id, {
      resolve(value) {
        clearTimeout(timer);
        resolve(value);
      },
      reject(error) {
        clearTimeout(timer);
        reject(error);
      }
    });
  });
}

socket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;

  const entry = pending.get(message.id);
  pending.delete(message.id);

  if (message.error) entry.reject(new Error(JSON.stringify(message.error)));
  else entry.resolve(message.result);
};

await new Promise((resolve, reject) => {
  socket.onopen = resolve;
  socket.onerror = () => reject(new Error("CDP WebSocket connection failed."));
});

await send("Runtime.enable");
await send("Page.enable");

const timeline = [];
const startedAt = Date.now();
let report = null;

for (let attempt = 0; attempt < 100; attempt += 1) {
  const evaluated = await send("Runtime.evaluate", {
    expression: '(() => { const body = document.body; const resultNode = document.getElementById("ag74i-browser-qa-result"); return { href: location.href, title: document.title, readyState: document.readyState, status: body ? body.getAttribute("data-ag74i-browser-qa-status") : null, failureCount: body ? body.getAttribute("data-ag74i-browser-qa-failure-count") : null, resultText: resultNode ? resultNode.textContent : null, iframePresent: Boolean(document.getElementById("site-frame")) }; })()',
    returnByValue: true,
    awaitPromise: true
  });

  const observation = evaluated && evaluated.result
    ? evaluated.result.value || null
    : null;

  timeline.push({
    attempt,
    observed_at_ms: Date.now() - startedAt,
    ...(observation || {})
  });

  if (observation && (observation.status === "passed" || observation.status === "failed")) {
    try {
      report = JSON.parse(observation.resultText || "null");
    } catch (error) {
      report = {
        module_id: "AG74I",
        status: "failed",
        check_count: 0,
        failure_count: 1,
        checks: [],
        failures: ["browser_report_json_invalid: " + String(error)]
      };
    }
    break;
  }

  await delay(250);
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(timelinePath, JSON.stringify(timeline, null, 2) + "\n");

if (!report) {
  socket.close();
  console.error("❌ AG74I browser QA did not produce a completed report within 25 seconds.");
  process.exit(1);
}

fs.writeFileSync(outputPath, JSON.stringify(report, null, 2) + "\n");
socket.close();

if (report.status !== "passed" || Number(report.failure_count) !== 0) {
  console.error("❌ AG74I browser interaction QA failed.");
  for (const failure of report.failures || []) {
    console.error("- " + failure);
  }
  process.exit(1);
}

console.log("✅ AG74I browser interaction QA passed.");
console.log("✅ " + report.check_count + " browser checks completed through CDP evidence.");
NODECDP

if ! node "$TMP/ag74i-cdp-qa-probe.mjs" \
  "$TMP/devtools-targets.json" \
  "data/quality/ag74i-panchang-public-surface-browser-qa.json" \
  "$TMP/ag74i-browser-qa-timeline.json"
then
  echo "--- Chrome log ---"
  tail -80 "$TMP/chrome.log" || true
  echo "--- Server log ---"
  tail -80 "$TMP/server.log" || true
  echo "--- Last QA observations ---"
  tail -80 "$TMP/ag74i-browser-qa-timeline.json" 2>/dev/null || true
  exit 1
fi

kill -TERM "$CHROME_PID" >/dev/null 2>&1 || true
wait "$CHROME_PID" >/dev/null 2>&1 || true
CHROME_PID=""

node scripts/finalize-ag74i-panchang-public-surface.mjs
