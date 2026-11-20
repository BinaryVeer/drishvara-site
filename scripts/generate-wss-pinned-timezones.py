"""Generate inspectable offsets from a checksum-pinned upstream tzdata wheel.

Build/reference tooling only. No host timezone files or personal inputs are read.
Explicit TZif transitions are copied exactly; POSIX tails are expanded with
Python ZoneInfo from the SAME frozen wheel through the supported date envelope.
"""
import argparse, datetime as dt, hashlib, io, json, pathlib, struct, urllib.request, zipfile
from zoneinfo import ZoneInfo

ROOT = pathlib.Path(__file__).resolve().parents[1]
VERSION = "2026.6"
IANA = "2026f"
SHA256 = "0a10eec6e13ef16b627fabed9a5f2ba61a62b1c67f327305f4e7e412a70b4aec"
START = int(dt.datetime(1899, 12, 28, tzinfo=dt.timezone.utc).timestamp())
END = int(dt.datetime(2101, 1, 4, tzinfo=dt.timezone.utc).timestamp())

def explicit_transitions(raw):
    def header(pos):
        if raw[pos:pos+4] != b"TZif":
            raise ValueError("Invalid TZif header")
        return struct.unpack(">6l", raw[pos+20:pos+44])
    counts = header(0)
    gmt, std, leap, times, types, chars = counts
    pos = 44 + times*5 + types*6 + chars + leap*8 + std + gmt
    if raw[4:5] in (b"2", b"3", b"4"):
        _, _, _, times, _, _ = header(pos)
        pos += 44
        return list(struct.unpack(">"+str(times)+"q", raw[pos:pos+times*8]))
    return list(struct.unpack(">"+str(times)+"l", raw[44:44+times*4]))

def generate(wheel, reference_path=None):
    blob = pathlib.Path(wheel).read_bytes()
    if hashlib.sha256(blob).hexdigest() != SHA256:
        raise ValueError("tzdata wheel checksum mismatch")
    archive = zipfile.ZipFile(io.BytesIO(blob))
    if 'IANA_VERSION = "'+IANA+'"' not in archive.read("tzdata/__init__.py").decode():
        raise ValueError("Wrong IANA release")
    scope = json.loads((ROOT/"data/methodology/jyotisha/wss-timezone-scope-20261120.json").read_text())
    tables, refs = {}, []
    for key in scope["zones"]:
        raw = archive.read("tzdata/zoneinfo/"+key)
        zone = ZoneInfo.from_file(io.BytesIO(raw), key=key)
        def offset(sec):
            return int(dt.datetime.fromtimestamp(sec, dt.timezone.utc).astimezone(zone).utcoffset().total_seconds())
        explicit = explicit_transitions(raw)
        table = [[START, offset(START)]]
        for sec in explicit:
            if START < sec < END and offset(sec) != table[-1][1]:
                table.append([sec, offset(sec)])
        # Only the recurring POSIX tail is sampled. TZif's historical
        # transitions above are exact, including short-lived historical rules.
        sec = max(START, explicit[-1] if explicit else START)
        while sec < END-1:
            after = min(sec+86400, END-1)
            if offset(sec) != offset(after):
                lo, hi = sec, after
                while hi-lo > 1:
                    mid = (lo+hi)//2
                    if offset(mid) == offset(sec): lo = mid
                    else: hi = mid
                if hi > table[-1][0] and offset(hi) != table[-1][1]:
                    table.append([hi, offset(hi)])
            sec = after
        tables[key] = table
        probes = {START, END-1, 0}
        for i, (sec, _) in enumerate(table):
            probes.update(x for x in (sec-1, sec, sec+1) if START <= x < END)
            end = table[i+1][0] if i+1 < len(table) else END
            probes.add((sec+end)//2)
        for sec in sorted(probes):
            refs.append([key, sec, offset(sec)])
    meta = {"id":"wss_iana_2026f_utc_seconds_v1", "iana_version":IANA,
            "wheel_version":VERSION,"wheel_sha256":SHA256,
            "start_inclusive_utc_seconds":START,"end_exclusive_utc_seconds":END,
            "zone_count":len(tables),"approved_place_count":scope["approved_places"],
            "historical_limit":"IANA representative-zone evidence, not certification of every pre-1970 locality",
            "future_limit":"Future offsets follow frozen 2026f rules; legal changes require a reviewed data update"}
    out = ROOT/"scripts/lib/wss-pinned-timezone-data.mjs"
    lines = ["// Generated from pinned IANA tzdata; see generate-wss-pinned-timezones.py.",
             "export const TIMEZONE_DATA_VERSION=Object.freeze("+json.dumps(meta,separators=(",",":"))+ ");",
             "export const TIMEZONE_TRANSITIONS=Object.freeze({"]
    for key, table in tables.items():
        lines.append(json.dumps(key)+":Object.freeze("+json.dumps(table,separators=(",",":"))+".map(Object.freeze)),")
    lines.append("});\n")
    out.write_text("\n".join(lines))
    if reference_path:
        p=pathlib.Path(reference_path);p.parent.mkdir(parents=True,exist_ok=True)
        p.write_text(json.dumps({"metadata":meta,"checks":refs},separators=(",",":")))
    notice=ROOT/"data/methodology/jyotisha/WSS_TIMEZONE_LICENSE.txt"
    notice.write_bytes(archive.read("tzdata-"+VERSION+".dist-info/licenses/LICENSE")+
                      b"\n\n"+archive.read("tzdata-"+VERSION+".dist-info/licenses/licenses/LICENSE_APACHE"))
    print(json.dumps({"zones":len(tables),"reference_probes":len(refs),
                      "bytes":out.stat().st_size,"sha256":hashlib.sha256(out.read_bytes()).hexdigest()}))

if __name__ == "__main__":
    parser=argparse.ArgumentParser();parser.add_argument("wheel");parser.add_argument("--reference")
    args=parser.parse_args();generate(args.wheel,args.reference)
