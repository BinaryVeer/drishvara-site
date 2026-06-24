#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
PORT="$(python3 - <<'PYPORT'
import socket
s=socket.socket();s.bind(("127.0.0.1",0));print(s.getsockname()[1]);s.close()
PYPORT
)"
DEBUG_PORT="$(python3 - <<'PYPORT'
import socket
s=socket.socket();s.bind(("127.0.0.1",0));print(s.getsockname()[1]);s.close()
PYPORT
)"
cleanup(){
  set +e
  if [ -n "${CHROME_PID:-}" ]; then
    kill -TERM "$CHROME_PID" >/dev/null 2>&1 || true
    for _ in $(seq 1 40); do kill -0 "$CHROME_PID" >/dev/null 2>&1 || break; sleep 0.1; done
    kill -KILL "$CHROME_PID" >/dev/null 2>&1 || true
    wait "$CHROME_PID" >/dev/null 2>&1 || true
  fi
  if [ -n "${SERVER_PID:-}" ]; then
    kill -TERM "$SERVER_PID" >/dev/null 2>&1 || true
    wait "$SERVER_PID" >/dev/null 2>&1 || true
  fi
  for _ in $(seq 1 20); do rm -rf "$TMP" >/dev/null 2>&1 && break; sleep 0.1; done
}
trap cleanup EXIT

CHROME=""
for candidate in \
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  "/Applications/Chromium.app/Contents/MacOS/Chromium" \
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"; do
  if [ -x "$candidate" ]; then CHROME="$candidate"; break; fi
done
[ -n "$CHROME" ] || { echo "❌ AG74O-R3 browser QA requires Chrome, Chromium or Edge."; exit 1; }

cd "$ROOT"
python3 -m http.server "$PORT" --bind 127.0.0.1 >"$TMP/server.log" 2>&1 & SERVER_PID=$!
python3 - <<PYWAIT
import socket,time
for _ in range(100):
    try:
        with socket.create_connection(("127.0.0.1",int("$PORT")),timeout=.2): raise SystemExit(0)
    except OSError: time.sleep(.1)
raise SystemExit("AG74O-R3 local QA server did not start")
PYWAIT

QA_URL="http://127.0.0.1:$PORT/scripts/ag74o-panchang-browser-qa.html"
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
  "$QA_URL" >"$TMP/chrome.out" 2>"$TMP/chrome.log" & CHROME_PID=$!

READY=0
for _ in $(seq 1 200); do
  if curl -fsS "http://127.0.0.1:$DEBUG_PORT/json/list" >"$TMP/targets.json" 2>/dev/null &&
     grep -q "ag74o-panchang-browser-qa.html" "$TMP/targets.json"; then
    READY=1
    break
  fi
  sleep .1
done
if [ "$READY" -ne 1 ]; then
  echo "❌ AG74O-R3 Chrome DevTools target did not become ready."
  tail -80 "$TMP/chrome.log" || true
  tail -80 "$TMP/server.log" || true
  exit 1
fi

cat >"$TMP/probe.mjs" <<'NODE'
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
const targets=JSON.parse(fs.readFileSync(process.argv[2],"utf8"));
const target=targets.find(x=>x.type==="page"&&/ag74o-panchang-browser-qa\.html/.test(x.url||""))||targets.find(x=>x.type==="page");
if(!target?.webSocketDebuggerUrl||typeof WebSocket!=="function")throw new Error("AG74O-R3 CDP target unavailable");
const ws=new WebSocket(target.webSocketDebuggerUrl);let next=1;const pending=new Map();
await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
ws.onmessage=e=>{const m=JSON.parse(e.data);if(!m.id||!pending.has(m.id))return;const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result);};
function send(method,params={}){const id=next++;ws.send(JSON.stringify({id,method,params}));return new Promise((resolve,reject)=>pending.set(id,{resolve,reject}));}
await send("Runtime.enable");let report=null;
for(let i=0;i<180;i++){
  const result=await send("Runtime.evaluate",{expression:'(()=>({status:document.body?.getAttribute("data-ag74o-browser-qa-status"),text:document.getElementById("ag74o-browser-qa-result")?.textContent}))()',returnByValue:true,awaitPromise:true});
  const value=result?.result?.value;
  if(value&&(value.status==="passed"||value.status==="failed")){report=JSON.parse(value.text);break;}
  await new Promise(r=>setTimeout(r,250));
}
ws.close();
if(!report)throw new Error("AG74O-R3 browser QA timed out");
const output=process.env.AG74O_BROWSER_QA_OUTPUT||path.join(os.tmpdir(),"ag74o-r3-browser-qa.json");
fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,JSON.stringify(report,null,2)+"\n");
if(report.status!=="passed"||report.failure_count!==0){
  for(const failure of report.failures||[])console.error("- "+failure);
  process.exit(1);
}
console.log("✅ AG74O-R3 browser QA passed: "+report.check_count+" checks.");
NODE

node "$TMP/probe.mjs" "$TMP/targets.json"

